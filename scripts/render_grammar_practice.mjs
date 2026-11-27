#!/usr/bin/env node
// The particles & verbs practice sheets, one PDF per level:
// grammar-sheets/tokidoki-grammar-practice-n5.pdf (n4, n3). 150 questions
// each (scripts/grammar_practice_questions.mjs), then an answer key on the
// last pages that says why each answer is right.
//
//   node scripts/render_grammar_practice.mjs [--html <dir>]
//   node scripts/stamp_sheet_belts.mjs grammar-sheets
//
// Needs `playwright` (and Chromium) resolvable, like render_grammar_guide.mjs.
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LEVELS, buildLevel } from "./grammar_practice_questions.mjs";

const { chromium } = createRequire(import.meta.url)("playwright");
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "grammar-sheets");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const ruby = (s) => esc(s).replace(/([一-鿿々〆ヶ]+)\[([ぁ-ゖー・]+)\]/g, "<ruby>$1<rt>$2</rt></ruby>");
// Section C starts on a new page where its heading would otherwise be left
// alone at the bottom of one (headings can't be kept with a grid's rows).
// Check after changing the question counts or the layout.
const C_NEW_PAGE = { N3: true };
const CIRCLED = ["①", "②", "③", "④"];
const BLANK = '<span class="blank">（　　　）</span>';

// The answer with furigana where the kanji part is the verb's own stem
// (帰[かえ]る → 帰[かえ]った); 来る's stems change, so it gets the kana after.
function answerRuby(q) {
  const m = q.verb.match(/^([^[]*)\[([^\]]+)\]/);
  if (!m || q.answer === q.kana) return esc(q.answer);
  const [, kanji, reading] = m;
  if (q.answer.startsWith(kanji) && q.kana.startsWith(reading)) return ruby(`${kanji}[${reading}]${q.answer.slice(kanji.length)}`);
  return `${esc(q.answer)} (${esc(q.kana)})`;
}

const INTRO = {
  N5: "N5 particles, verb forms and verb groups. Answers, with why, on the last pages.",
  N4: "N4 particles, verb forms and verb pairs (が or を). Answers, with why, on the last pages.",
  N3: "N3 particles, verb forms and verb pairs (が or を). Answers, with why, on the last pages.",
};

function render(level) {
  const { A, B, C } = buildLevel(level);
  let n = 0;
  const numA = A.map(() => ++n);
  const numB = B.map(() => ++n);
  const numC = C.map(() => ++n);
  const cTitle = level === "N5" ? "C · る-verb, う-verb or irregular?" : "C · Verb pairs: が or を?";
  const cHelp = level === "N5"
    ? "Circle the group the verb belongs to. Careful: some verbs that end in -iる / -eる are う-verbs."
    : "Circle the particle. Does the thing just happen (が), or does someone do it to the thing (を)? Look at the verb.";

  const qA = A.map((q, i) => `<li class="q"><span class="n">${numA[i]}</span><div>
    <div class="jp">${ruby(q.before)}${BLANK}${ruby(q.after)}</div>
    <div class="choices">${q.choices.map((c, k) => `<span>${CIRCLED[k]} ${esc(c)}</span>`).join("")}</div></div></li>`).join("");
  const qB = B.map((q, i) => `<li class="q form"><span class="n">${numB[i]}</span><div>
    <div><span class="jp verb">${ruby(q.verb)}</span> <span class="mean">${esc(q.meaning)}</span></div>
    <div class="fname">→ ${esc(q.formName)}</div><div class="line"></div></div></li>`).join("");
  const qC = C.map((q, i) => level === "N5"
    ? `<li class="q"><span class="n">${numC[i]}</span><div><span class="jp verb">${ruby(q.verb)}</span> <span class="mean">${esc(q.meaning)}</span>
      <div class="choices"><span>る-verb</span><span>う-verb</span><span>irregular</span></div></div></li>`
    : `<li class="q"><span class="n">${numC[i]}</span><div class="jp">${ruby(q.before)}<span class="blank">（ が ・ を ）</span>${ruby(q.after)}</div></li>`).join("");

  const key = [
    ["A · Particles", A.map((q, i) => `<li><b>${numA[i]}</b> <span class="ans">${CIRCLED[q.answerIndex]} ${esc(q.answer)}</span> ${q.en ? `<i>${esc(q.en)}</i> ` : ""}${ruby(q.why)}</li>`)],
    ["B · Verb forms", B.map((q, i) => `<li><b>${numB[i]}</b> <span class="ans jp">${answerRuby(q)}</span> ${ruby(q.why)}</li>`)],
    [cTitle, C.map((q, i) => level === "N5"
      ? `<li><b>${numC[i]}</b> <span class="ans">${esc(q.answer)}</span> ${ruby(q.why)}</li>`
      : `<li><b>${numC[i]}</b> <span class="ans">${q.answer}</span> <span class="jp">${ruby(q.pair)}</span> — ${ruby(q.why)}</li>`)],
  ].map(([t, items]) => `<h3>${esc(t)}</h3><ol class="key">${items.join("")}</ol>`).join("");

  const title = `Tokidoki — ${level} particles & verbs practice`;
  return { title, html: `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1a1a1a; font-size: 8.4pt; line-height: 1.35; }
  .jp, ruby { font-family: 'IPAPGothic', 'IPAGothic', 'Noto Sans CJK JP', sans-serif; }
  rt { font-size: 52%; color: #555; }
  h1 { font-size: 15pt; }
  .top { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1mm; }
  .name { font-size: 8.5pt; color: #555; }
  .name span { display: inline-block; width: 45mm; border-bottom: 0.3mm solid #999; margin-left: 1mm; }
  .intro { font-size: 8.5pt; color: #555; margin-bottom: 3mm; }
  h2 { font-size: 11pt; margin: 3mm 0 1mm; padding: 1mm 2mm; background: #f3ece0; border-left: 1.2mm solid #b3261e; break-after: avoid; }
  .help { font-size: 8pt; color: #555; margin: 0 0 2mm; }
  ol { list-style: none; }
  .qs { display: grid; grid-template-columns: 1fr 1fr; column-gap: 7mm; }
  .qs.three { grid-template-columns: 1fr 1fr 1fr; column-gap: 5mm; }
  .q { display: flex; gap: 1.5mm; break-inside: avoid; padding: 1mm 0 1.2mm; border-bottom: 0.2mm solid #ece6da; }
  .q > div { flex: 1; min-width: 0; }
  .n { font-weight: 700; color: #b3261e; min-width: 6mm; text-align: right; }
  .q .jp { font-size: 9.6pt; line-height: 1.75; }
  .blank { white-space: nowrap; }
  .choices { display: flex; flex-wrap: wrap; gap: 1.5mm 4.5mm; font-family: 'IPAPGothic', 'IPAGothic', sans-serif; font-size: 9pt; margin-top: 0.3mm; }
  .verb { font-size: 10pt; }
  .mean { color: #666; font-size: 7.4pt; }
  .fname { font-size: 7.8pt; color: #333; margin-top: 0.3mm; }
  .line { height: 5mm; border-bottom: 0.3mm solid #aaa; }
  .keypage, h2.newpage { break-before: page; }
  .keypage h2 { margin-top: 0; }
  .keycols { column-count: 2; column-gap: 6mm; }
  h3 { font-size: 9pt; margin: 2mm 0 1mm; break-after: avoid; }
  .key li { font-size: 7.1pt; line-height: 1.4; margin-bottom: 0.9mm; break-inside: avoid; }
  .key b { color: #b3261e; display: inline-block; min-width: 5.5mm; }
  .key .ans { font-weight: 700; margin-right: 0.8mm; }
  .key i { color: #666; }
</style></head><body>
<div class="top"><h1>${level} · Particles &amp; verbs: 150 questions</h1><div class="name">Name<span></span></div></div>
<p class="intro">${INTRO[level]} The handy guide (grammar-sheets/tokidoki-grammar-guide.pdf) explains every rule.</p>
<h2>A · Particles — choose the right one (1–${A.length})</h2>
<p class="help">Choose the particle that fits in the （　　　）.</p>
<ol class="qs">${qA}</ol>
<h2>B · Verb forms — write the form (${numB[0]}–${numB.at(-1)})</h2>
<p class="help">Write the form asked for, in kana or kanji.</p>
<ol class="qs three">${qB}</ol>
<h2${C_NEW_PAGE[level] ? ' class="newpage"' : ""}>${cTitle} (${numC[0]}–${numC.at(-1)})</h2>
<p class="help">${cHelp}</p>
<ol class="qs">${qC}</ol>
<div class="keypage"><h2>Answers — and why</h2><div class="keycols">${key}</div></div>
</body></html>` };
}

const htmlArg = process.argv.indexOf("--html");
const htmlDir = htmlArg !== -1 ? process.argv[htmlArg + 1] : null;
await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch();
try {
  for (const level of LEVELS) {
    const { title, html } = render(level);
    const name = `tokidoki-grammar-practice-${level.toLowerCase()}`;
    if (htmlDir) await writeFile(path.join(htmlDir, name + ".html"), html);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const out = path.join(OUT_DIR, name + ".pdf");
    await page.pdf({
      path: out,
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `<div style="font-size:8px; width:100%; padding:0 10mm; color:#888;">${title}</div>`,
      footerTemplate: `<div style="font-size:8px; width:100%; padding:0 10mm; color:#888; display:flex; justify-content:flex-end;"><span class="pageNumber"></span>&nbsp;/&nbsp;<span class="totalPages"></span></div>`,
      margin: { top: "14mm", bottom: "12mm", left: "12mm", right: "12mm" },
    });
    await page.close();
    console.log(`-> ${path.relative(ROOT, out)}`);
  }
} finally {
  await browser.close();
}
