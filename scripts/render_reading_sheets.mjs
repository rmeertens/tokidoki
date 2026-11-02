#!/usr/bin/env node
// Kanji reading worksheets, JLPT style ("how is the underlined word read?"),
// but with no choices: the learner writes the reading in hiragana, and the
// answers are on the last page. One sheet per level, N5 / N4 / N3.
//
// The sentences are Tokidoki's own example sentences from
// guess-words-data.js (scripts/guess_examples.tsv); the underlined word is
// the word each sentence was written for. Kanji above the sheet's level
// (kanji-quiz-data.js, cumulative) keep small furigana so the sentence stays
// readable; kanji at or below it are bare, as in the exam.
//
//   node scripts/render_reading_sheets.mjs <build-dir>
//   node scripts/render_sheets_pdfs.mjs <build-dir> kanji-sheets
//   node scripts/stamp_sheet_belts.mjs kanji-sheets
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
globalThis.window = globalThis;
require("../guess-words-data.js");
require("../kanji-quiz-data.js");
const WORDS = globalThis.GUESS_WORDS;
const KANJI = globalThis.KANJI_QUIZ_DATA;

export const PER_SHEET = 50;
export const LEVELS = ["N5", "N4", "N3"];

const isKanji = (ch) => /[㐀-鿿々〆ヶ]/.test(ch);
const isKana = (ch) => /[぀-ヿ]/.test(ch);

// "{駅|えき}で{友達|ともだち}に…" → [{ text, kana }], kana null for plain text,
// plain text split into single characters.
export function parseSentence(s) {
  const tokens = [];
  const re = /\{([^|}]+)\|([^}]+)\}|([^{])/g;
  let m;
  while ((m = re.exec(s))) {
    if (m[3] !== undefined) tokens.push({ text: m[3], kana: null });
    else tokens.push({ text: m[1], kana: m[2] });
  }
  return tokens;
}

// The run of tokens that spells the word (or, for an inflected verb or
// adjective, its longest leading part that still holds all its kanji: 通う
// in 通って → 通). Returns { start, end, reading } or null.
export function findTarget(tokens, word, kana) {
  const lastKanji = [...word].reduce((at, ch, i) => (isKanji(ch) ? i : at), -1);
  if (lastKanji < 0) return null;
  const chars = [...word];
  for (let len = chars.length; len > lastKanji; len--) {
    const want = chars.slice(0, len).join("");
    for (let start = 0; start < tokens.length; start++) {
      let text = "";
      let end = start;
      while (end < tokens.length && text.length < want.length) text += tokens[end++].text;
      if (text !== want) continue;
      const span = tokens.slice(start, end);
      if (!span.every((t) => t.kana || isKana(t.text))) continue;
      const reading = span.map((t) => t.kana || t.text).join("");
      // The furigana must agree with the word's own reading.
      if (len === chars.length ? reading !== kana : !kana.startsWith(reading)) continue;
      const target = { start, end, reading, text: want };
      return len === chars.length ? target : extendOkurigana(tokens, target, word, kana);
    }
  }
  return null;
}

// An inflected verb or adjective is underlined with its okurigana, as in the
// exam: 通って (かよって) before います, 会い before ます, 寒かった.
const TE = "てたでだ";
function extendOkurigana(tokens, target, word, kana) {
  let rest = "";
  for (let i = target.end; i < tokens.length && !tokens[i].kana && /[\u3041-\u3096]/.test(tokens[i].text); i++) {
    rest += tokens[i].text;
  }
  let ext = "";
  if (word.endsWith("する")) ext = "";
  else if (word.endsWith("い") && isKana(target.text.slice(-1)) === false) {
    ext = ["かった", "くて", "く", "い"].find((e) => rest.startsWith(e)) || "";
  } else if (
    word.endsWith("る") &&
    "いきぎしじちぢにひびぴみりえけげせぜてでねへべぺめれ".includes(kana.slice(-2, -1)) &&
    !"りっ".includes(rest[0] || "")
  ) {
    // Ichidan (見る, 食べる): the stem doesn't change; 帰る / 入る are godan
    // and show it with り / っ.
    ext = TE.includes(rest[0]) ? rest[0] : ""; // 食べ(て)
  } else if (rest[0] && "っんいし".includes(rest[0]) && rest[1] && TE.includes(rest[1])) {
    ext = rest.slice(0, 2);
  } else if (rest[0] && "あいうえおかきくけこがぎぐげごさしすせそたちつてとなにぬねのばびぶべぼまみむめもらりるれろわ".includes(rest[0])) {
    ext = rest[0];
  }
  return {
    start: target.start,
    end: target.end + ext.length,
    reading: target.reading + ext,
    text: target.text + ext,
  };
}

function hash(s) {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.codePointAt(0), 16777619) >>> 0;
  return h;
}

function knownKanji(level) {
  const upto = { N5: ["n5"], N4: ["n5", "n4"], N3: ["n5", "n4", "n3"] }[level];
  return new Set(upto.flatMap((l) => KANJI[l].map((k) => k.kanji)));
}

export function pickQuestions(level) {
  const known = knownKanji(level);
  const seen = new Set();
  const out = [];
  const candidates = WORDS.filter((w) => w[3] === level)
    // 来る's sentences carry its dictionary reading (来[く]ます), not the
    // conjugated one, so it can't be an answer as is.
    .filter((w) => w[0] !== "来る")
    .map((w) => ({ w, tokens: parseSentence(w[8]) }))
    .map((c) => ({ ...c, target: findTarget(c.tokens, c.w[0], c.w[1]) }))
    .filter((c) => c.target)
    // Exam style: the underlined word is written with this level's kanji.
    .filter((c) => [...c.target.text].every((ch) => !isKanji(ch) || known.has(ch)))
    .sort((a, b) => hash(a.w[0] + a.w[1]) - hash(b.w[0] + b.w[1]));
  for (const c of candidates) {
    const key = [...c.target.text].filter(isKanji).join("");
    if (seen.has(key)) continue; // 青 and 青い: only one of them
    seen.add(key);
    out.push(c);
    if (out.length === PER_SHEET) break;
  }
  return out;
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function sentenceHtml({ tokens, target }, known) {
  const piece = (t) =>
    t.kana && [...t.text].some((ch) => isKanji(ch) && !known.has(ch))
      ? `<ruby>${esc(t.text)}<rt>${esc(t.kana)}</rt></ruby>`
      : esc(t.text);
  const before = tokens.slice(0, target.start).map(piece).join("");
  // The underlined word never shows its reading.
  const word = tokens.slice(target.start, target.end).map((t) => esc(t.text)).join("");
  const after = tokens.slice(target.end).map(piece).join("");
  return `${before}<span class="target">${word}</span>${after}`;
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
  .sentence rt { font-size: 6.5pt; color: #666; }
  .target { text-decoration: underline; text-decoration-thickness: 0.45mm; text-underline-offset: 1.6mm; }
  .answer { flex: none; width: 52mm; height: 10mm; border: 0.35mm solid #e9b48c; border-radius: 5mm; }
  .key { page-break-before: always; }
  .key-grid { columns: 2; column-gap: 8mm; font-size: 9.5pt; line-height: 1.2; }
  .key-item { break-inside: avoid; padding: 0.5mm 0; border-bottom: 0.2mm solid #eee; display: flex; gap: 2mm; }
  .key-num { flex: none; width: 6mm; text-align: right; color: #888; }
  .key-reading { font-weight: 700; }
  .key-word { color: #555; font-size: 7.5pt; font-family: system-ui, sans-serif, 'IPAGothic'; }
`;

export function renderSheet(level) {
  const known = knownKanji(level);
  const qs = pickQuestions(level);
  const title = `${level} Kanji Readings | Tokidoki`;
  const questions = qs
    .map(
      (q, i) => `  <div class="q"><div class="num">${i + 1}</div>` +
        `<div class="sentence">${sentenceHtml(q, known)}</div><div class="answer"></div></div>`,
    )
    .join("\n");
  const answers = qs
    .map(
      (q, i) => `    <div class="key-item"><span class="key-num">${i + 1}</span><span>` +
        `<span class="key-reading">${esc(q.target.text)} = ${esc(q.target.reading)}</span><br>` +
        `<span class="key-word">${esc(q.w[0])}（${esc(q.w[1])}）${esc(q.w[2])}</span></span></div>`,
    )
    .join("\n");
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<style>${CSS}</style>
</head>
<body>
  <div class="intro">
    <h1>${level} Kanji readings — how is the underlined word read?</h1>
    <p>Write the reading of each underlined word in hiragana in the box. Kanji above ${level} have small furigana. The answers are on the last page.</p>
  </div>
${questions}
  <div class="key">
    <div class="intro"><h1>${level} Kanji readings — answers</h1></div>
    <div class="key-grid">
${answers}
    </div>
  </div>
</body>
</html>
`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const outDir = process.argv[2];
  if (!outDir) {
    console.error("usage: render_reading_sheets.mjs <out-dir>");
    process.exit(1);
  }
  mkdirSync(outDir, { recursive: true });
  for (const level of LEVELS) {
    const file = path.join(outDir, `tokidoki-kanji-reading-${level.toLowerCase()}.html`);
    writeFileSync(file, renderSheet(level));
    console.log(`${level}: ${pickQuestions(level).length} questions → ${file}`);
  }
}
