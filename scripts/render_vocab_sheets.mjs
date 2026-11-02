#!/usr/bin/env node
// JLPT-style vocabulary worksheets, one per kind and level (N5 / N4 / N3),
// each with its answers on the last page:
//
//   kanji-sheets/tokidoki-kanji-reading-<level>   how is the underlined word
//       read? — write the reading in hiragana (no choices)
//   kanji-sheets/tokidoki-kanji-writing-<level>   how is the underlined word
//       written? — write it in kanji (no choices)
//   vocab-sheets/tokidoki-vocab-fill-<level>      which word goes in the
//       blank? — four choices (vocab-fill-data.js's questions)
//   vocab-sheets/tokidoki-vocab-similar-<level>   which sentence means about
//       the same? — four choices (similar-meaning-data.js)
//
// The reading / writing / fill-in sentences are Tokidoki's own example
// sentences from guess-words-data.js (see scripts/vocab_questions.mjs).
// Kanji above the sheet's level (kanji-quiz-data.js, cumulative) keep
// small furigana so the sentence stays readable; kanji at or below it are
// bare, as in the exam. The tested word never shows its reading.
//
//   node scripts/render_vocab_sheets.mjs <build-dir>
//   node scripts/render_sheets_pdfs.mjs <build-dir>/kanji kanji-sheets
//   node scripts/render_sheets_pdfs.mjs <build-dir>/vocab vocab-sheets
//   node scripts/stamp_sheet_belts.mjs kanji-sheets vocab-sheets
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { LEVELS, hash, isKanji, knownKanji, parseSentence, pickTargets } from "./vocab_questions.mjs";
import { fillData } from "./build_vocab_fill.mjs";

const require = createRequire(import.meta.url);
const SIMILAR = require("../similar-meaning-data.js");

export const PER_SHEET = 50; // reading / writing
export const FILL_PER_SHEET = 40;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Tokens as HTML: furigana only on kanji above the level.
function tokensHtml(tokens, known) {
  return tokens
    .map((t) =>
      t.kana && [...t.text].some((ch) => isKanji(ch) && !known.has(ch))
        ? `<ruby>${esc(t.text)}<rt>${esc(t.kana)}</rt></ruby>`
        : esc(t.text),
    )
    .join("");
}
const markupHtml = (s, known) => tokensHtml(parseSentence(s), known);
const plain = (s) => s.replace(/\{([^|}]+)\|[^}]+\}/g, "$1");

// "a _b_ c" → a<u>b</u>c, each part with its furigana.
function underlinedHtml(s, known) {
  return s
    .split("_")
    .map((part, i) => (i % 2 ? `<span class="target">${markupHtml(part, known)}</span>` : markupHtml(part, known)))
    .join("");
}

// A fixed shuffle of the four choices (answer first in the data); returns
// [order of indexes, position of the answer].
function shuffled(seed) {
  const order = [0, 1, 2, 3].sort((a, b) => hash(seed + a) - hash(seed + b));
  return [order, order.indexOf(0)];
}

const CSS = `
  @page { size: A4; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'IPAGothic', 'Noto Sans CJK JP', sans-serif; color: #1a1a1a; }
  .intro { padding: 2mm 0 4mm; font-family: 'Segoe UI', system-ui, sans-serif; }
  .intro h1 { font-size: 15pt; font-weight: 700; }
  .intro p { font-size: 8.5pt; color: #555; margin-top: 1.5mm; }
  .q { break-inside: avoid; page-break-inside: avoid; display: flex; align-items: center; gap: 4mm; padding: 1.4mm 0; border-bottom: 0.2mm solid #eee; }
  .num { flex: none; width: 8mm; height: 8mm; border-radius: 4mm; background: #f9dcc4; font-size: 10pt; font-weight: 700; display: flex; align-items: center; justify-content: center; }
  .sentence { flex: 1; font-size: 15pt; line-height: 2; }
  rt { font-size: 6.5pt; color: #666; }
  .target { text-decoration: underline; text-decoration-thickness: 0.45mm; text-underline-offset: 1.6mm; }
  .blank { display: inline-block; min-width: 26mm; text-align: center; }
  .answer { flex: none; width: 52mm; height: 10mm; border: 0.35mm solid #e9b48c; border-radius: 5mm; }
  .mc { break-inside: avoid; page-break-inside: avoid; padding: 2mm 0 2.6mm; border-bottom: 0.2mm solid #eee; }
  .mc-head { display: flex; align-items: center; gap: 4mm; }
  .choices { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2mm 3mm; margin: 1.5mm 0 0 12mm; }
  .choices.long { grid-template-columns: 1fr; gap: 1.6mm; }
  .choice { background: #f9dcc4; border-radius: 5mm; padding: 0.8mm 3.5mm; font-size: 12pt; line-height: 1.9; display: flex; gap: 2.5mm; align-items: baseline; }
  .choices.long .choice { font-size: 12pt; }
  .choice b { font-family: 'Segoe UI', system-ui, sans-serif; font-size: 10pt; }
  .key { page-break-before: always; }
  .key-grid { columns: 2; column-gap: 8mm; font-size: 9.5pt; line-height: 1.2; }
  .key-item { break-inside: avoid; padding: 0.5mm 0; border-bottom: 0.2mm solid #eee; display: flex; gap: 2mm; }
  .key-num { flex: none; width: 6mm; text-align: right; color: #888; }
  .key-reading { font-weight: 700; }
  .key-word { color: #555; font-size: 7.5pt; font-family: system-ui, sans-serif, 'IPAGothic'; }
`;

function page(title, heading, intro, body, keyHeading, keyItems) {
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<style>${CSS}</style>
</head>
<body>
  <div class="intro">
    <h1>${esc(heading)}</h1>
    <p>${esc(intro)}</p>
  </div>
${body}
  <div class="key">
    <div class="intro"><h1>${esc(keyHeading)}</h1></div>
    <div class="key-grid">
${keyItems.map((html, i) => `    <div class="key-item"><span class="key-num">${i + 1}</span><span>${html}</span></div>`).join("\n")}
    </div>
  </div>
</body>
</html>
`;
}

const shortMeaning = (m) => m.split(/;\s*/)[0];

// ─── Reading and writing (no choices) ────────────────────────────────────────

// The sentence with the word underlined: in kanji with no furigana
// (reading), or in hiragana (writing).
function targetSentenceHtml({ tokens, target }, known, asKana) {
  const word = asKana ? target.reading : tokens.slice(target.start, target.end).map((t) => t.text).join("");
  return (
    tokensHtml(tokens.slice(0, target.start), known) +
    `<span class="target">${esc(word)}</span>` +
    tokensHtml(tokens.slice(target.end), known)
  );
}

export function pickQuestions(level, kind = "reading") {
  return pickTargets(level, PER_SHEET, kind === "writing" ? "writing:" : "");
}

export function renderSheet(level, kind = "reading") {
  const known = knownKanji(level);
  const qs = pickQuestions(level, kind);
  const writing = kind === "writing";
  const body = qs
    .map(
      (q, i) => `  <div class="q"><div class="num">${i + 1}</div>` +
        `<div class="sentence">${targetSentenceHtml(q, known, writing)}</div><div class="answer"></div></div>`,
    )
    .join("\n");
  const key = qs.map(
    (q) =>
      `<span class="key-reading">${esc(writing ? q.target.reading : q.target.text)} = ${esc(writing ? q.target.text : q.target.reading)}</span><br>` +
      `<span class="key-word">${esc(q.w[0])}（${esc(q.w[1])}）${esc(q.w[2])}</span>`,
  );
  return writing
    ? page(
        `${level} Kanji Writing | Tokidoki`,
        `${level} Kanji writing — how is the underlined word written?`,
        `Write each underlined word in kanji (with its okurigana) in the box. Kanji above ${level} elsewhere have small furigana. The answers are on the last page.`,
        body, `${level} Kanji writing — answers`, key,
      )
    : page(
        `${level} Kanji Readings | Tokidoki`,
        `${level} Kanji readings — how is the underlined word read?`,
        `Write the reading of each underlined word in hiragana in the box. Kanji above ${level} have small furigana. The answers are on the last page.`,
        body, `${level} Kanji readings — answers`, key,
      );
}

// ─── Fill in the blank (four choices) ────────────────────────────────────────

export function fillQuestions(level) {
  return fillData()[level].slice(0, FILL_PER_SHEET);
}

export function renderFillSheet(level) {
  const known = knownKanji(level);
  const qs = fillQuestions(level);
  const key = [];
  const body = qs
    .map((q, i) => {
      const [order, at] = shuffled(`fill:${q.w}|${q.k}`);
      const ans = q.c[0];
      key.push(`<span class="key-reading">${at + 1}　${esc(plain(ans[0]))}</span><br>` +
        `<span class="key-word">${esc(ans[1])}（${esc(ans[2])}）${esc(shortMeaning(ans[3]))} — ${esc(q.en)}</span>`);
      return `  <div class="mc"><div class="mc-head"><div class="num">${i + 1}</div>` +
        `<div class="sentence">${markupHtml(q.b, known)}（<span class="blank">　</span>）${markupHtml(q.a, known)}</div></div>` +
        `<div class="choices">${order.map((k, n) => `<div class="choice"><b>${n + 1}</b><span>${markupHtml(q.c[k][0], known)}</span></div>`).join("")}</div></div>`;
    })
    .join("\n");
  return page(
    `${level} Vocabulary Fill-in | Tokidoki`,
    `${level} Vocabulary — which word goes in the blank?`,
    `Choose the word (1–4) that fits best in each （　）. Kanji above ${level} have small furigana. The answers are on the last page.`,
    body, `${level} Vocabulary fill-in — answers`, key,
  );
}

// ─── Similar meaning (four choices) ──────────────────────────────────────────

export function renderSimilarSheet(level) {
  const known = knownKanji(level);
  const qs = SIMILAR[level];
  const key = [];
  const body = qs
    .map((q, i) => {
      const choices = [q.ok, ...q.wrong];
      const [order, at] = shuffled(`similar:${q.q}`);
      key.push(`<span class="key-reading">${at + 1}　${esc(plain(q.ok))}</span><br><span class="key-word">${esc(q.note)}</span>`);
      return `  <div class="mc"><div class="mc-head"><div class="num">${i + 1}</div>` +
        `<div class="sentence">${underlinedHtml(q.q, known)}</div></div>` +
        `<div class="choices long">${order.map((k, n) => `<div class="choice"><b>${n + 1}</b><span>${markupHtml(choices[k], known)}</span></div>`).join("")}</div></div>`;
    })
    .join("\n");
  return page(
    `${level} Similar Meaning | Tokidoki`,
    `${level} Similar meaning — which sentence means about the same?`,
    `Choose the sentence (1–4) that means about the same as the underlined part. Kanji above ${level} have small furigana. The answers are on the last page.`,
    body, `${level} Similar meaning — answers`, key,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const outDir = process.argv[2];
  if (!outDir) {
    console.error("usage: render_vocab_sheets.mjs <out-dir>");
    process.exit(1);
  }
  const kanjiDir = path.join(outDir, "kanji");
  const vocabDir = path.join(outDir, "vocab");
  mkdirSync(kanjiDir, { recursive: true });
  mkdirSync(vocabDir, { recursive: true });
  for (const level of LEVELS) {
    const l = level.toLowerCase();
    writeFileSync(path.join(kanjiDir, `tokidoki-kanji-reading-${l}.html`), renderSheet(level, "reading"));
    writeFileSync(path.join(kanjiDir, `tokidoki-kanji-writing-${l}.html`), renderSheet(level, "writing"));
    writeFileSync(path.join(vocabDir, `tokidoki-vocab-fill-${l}.html`), renderFillSheet(level));
    writeFileSync(path.join(vocabDir, `tokidoki-vocab-similar-${l}.html`), renderSimilarSheet(level));
    console.log(`${level}: reading, writing, fill-in (${fillQuestions(level).length}), similar meaning (${SIMILAR[level].length})`);
  }
}
