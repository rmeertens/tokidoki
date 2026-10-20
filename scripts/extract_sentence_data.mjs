#!/usr/bin/env node
// Build sentence-sheets/data/<chunk>.json — one printable translation
// worksheet per grammar chunk of the Sentences page (sentence-chunks.js),
// 20 of its sentences from sentences-data.js spread over the whole chunk —
// and the worksheet list on kanji.html (between the sentence-sheets
// markers), so the sheets stay in sync with the live site's sentence bank.
//
// Usage: node scripts/extract_sentence_data.mjs
// then render_sentence_html.py and render_sheets_pdfs.mjs (see there).
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const PER_SHEET = 20;

const sandbox = { window: {} };
vm.createContext(sandbox);
for (const f of ["sentences-data.js", "sentence-chunks.js"]) {
  vm.runInContext(readFileSync(path.join(REPO_ROOT, f), "utf8"), sandbox);
}
const { TRANSLATE_SENTENCES, SENTENCE_CHUNKS } = sandbox.window;

// A chunk cut into parts (Past tense 1, 2, 3) is one worksheet.
const sheets = [];
for (const c of SENTENCE_CHUNKS) {
  const id = c.id.replace(/-\d+$/, "");
  let sheet = sheets.find(s => s.id === id);
  if (!sheet) sheets.push(sheet = { id, level: c.level, title: c.title.replace(/ \(\d+\)$/, ""), sub: c.sub, refs: [] });
  sheet.refs.push(...c.sentences);
}

const outDir = path.join(REPO_ROOT, "sentence-sheets", "data");
mkdirSync(outDir, { recursive: true });
for (const f of readdirSync(outDir)) rmSync(path.join(outDir, f));
sheets.forEach((sheet, n) => {
  const step = sheet.refs.length / Math.min(PER_SHEET, sheet.refs.length);
  const picked = Array.from({ length: Math.min(PER_SHEET, sheet.refs.length) }, (_, k) => sheet.refs[Math.floor(k * step)]);
  const data = {
    id: sheet.id,
    order: n + 1,
    title: sheet.title,
    level: sheet.level,
    sentences: picked.map(ref => {
      const [set, i] = ref.split(":");
      const { ja, jaHtml, en } = TRANSLATE_SENTENCES[set][i];
      return { ja, jaHtml, en };
    }),
  };
  const outPath = path.join(outDir, `${sheet.id}.json`);
  writeFileSync(outPath, JSON.stringify(data, null, 2) + "\n");
  console.log(`${sheet.id}: ${sheet.title} (${sheet.level}) — ${data.sentences.length} sentences -> ${path.relative(REPO_ROOT, outPath)}`);
});

// The worksheet cards on kanji.html.
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const pdf = (id, kind) => `sentence-sheets/tokidoki-sentences-${id}-${kind}.pdf`;
const LEVEL_NAMES = { N5: "N5 grammar", N4: "N4 grammar", N3: "N3 grammar" };
let html = "";
for (const level of ["N5", "N4", "N3"]) {
  const these = sheets.filter(s => s.level === level);
  if (!these.length) continue;
  html += `      <h2 class="section-title">${LEVEL_NAMES[level]}</h2>\n      <div class="chapter-grid">\n`;
  for (const s of these) {
    html += `        <div class="chapter-card">
          <div class="chapter-card-title">${esc(s.title)}</div>
          <div class="chapter-card-sub">${esc(s.sub)} · ${Math.min(PER_SHEET, s.refs.length)} sentences</div>
          <div class="chapter-card-links">
            <a href="${pdf(s.id, "to-english")}" target="_blank" rel="noopener">To English</a>
            <a href="${pdf(s.id, "to-english-answers")}" target="_blank" rel="noopener">Answer key</a>
            <a href="${pdf(s.id, "to-japanese")}" target="_blank" rel="noopener">To Japanese</a>
            <a href="${pdf(s.id, "to-japanese-answers")}" target="_blank" rel="noopener">Answer key</a>
          </div>
        </div>\n`;
  }
  html += "      </div>\n";
}
const kanjiPath = path.join(REPO_ROOT, "kanji.html");
const page = readFileSync(kanjiPath, "utf8");
const START = "      <!-- sentence-sheets: written by scripts/extract_sentence_data.mjs -->\n";
const END = "      <!-- /sentence-sheets -->\n";
const a = page.indexOf(START), b = page.indexOf(END);
if (a === -1 || b === -1) throw new Error("kanji.html: no sentence-sheets markers");
writeFileSync(kanjiPath, page.slice(0, a + START.length) + html + page.slice(b));
console.log(`kanji.html: ${sheets.length} worksheets`);
