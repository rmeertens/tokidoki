#!/usr/bin/env node
// Print every practice/answer/meaning sheet HTML (see render_kanji_html.py
// and render_kana_html.py) to PDF, with a repeating header (from the page's
// own <title>) and page-number footer via Chromium print.
//
// Full regeneration pipeline:
//   python3 scripts/generate_kanji_data.py <path-to-kanji-data.json>
//   python3 scripts/generate_kana_data.py
//   python3 scripts/render_kanji_html.py <build-dir>
//   python3 scripts/render_kana_html.py <build-dir>
//   node scripts/render_sheets_pdfs.mjs <build-dir> <out-dir>
//   node scripts/stamp_sheet_belts.mjs <out-dir>   (sushi belt in the bottom margin)
//
// Requires the `playwright` npm package to be resolvable (locally installed,
// or run with NODE_PATH pointing at a global install) and a Chromium build
// on disk — adjust executablePath below if yours lives elsewhere.
import { chromium } from "playwright";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const buildDir = process.argv[2];
const outDir = process.argv[3];
if (!buildDir || !outDir) {
  console.error("usage: render_sheets_pdfs.mjs <build-html-dir> <out-pdf-dir>");
  process.exit(1);
}

const footerTemplate = `
  <div style="font-size:8px; width:100%; padding:0 10mm; color:#888; display:flex; justify-content:flex-end;">
    <span class="pageNumber"></span>&nbsp;/&nbsp;<span class="totalPages"></span>
  </div>`;

function headerTemplate(title) {
  return `
  <div style="font-size:8px; width:100%; padding:0 10mm; color:#888; display:flex; justify-content:space-between;">
    <span>${title}</span>
  </div>`;
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
try {
  const files = (await readdir(buildDir)).filter((f) => f.endsWith(".html")).sort();
  for (const file of files) {
    const htmlPath = path.join(buildDir, file);
    const page = await browser.newPage();
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
    const title = await page.title();
    const outPath = path.join(outDir, file.replace(/\.html$/, ".pdf"));
    await page.pdf({
      path: outPath,
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: headerTemplate(title),
      footerTemplate,
      margin: { top: "14mm", bottom: "12mm", left: "12mm", right: "12mm" },
    });
    await page.close();
    console.log(`${file} -> ${outPath}`);
  }
} finally {
  await browser.close();
}
