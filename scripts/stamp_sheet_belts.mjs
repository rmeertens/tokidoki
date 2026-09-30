#!/usr/bin/env node
// Stamp a small pixel-art sushi belt into the bottom margin of every page of
// the printable sheets, using the same sprites as the website belt
// (sushi-sprites.js). Works on the finished PDFs, so the sheet content itself
// is untouched — run it after render_sheets_pdfs.mjs:
//
//   node scripts/stamp_sheet_belts.mjs kanji-sheets kana-sheets sentence-sheets
//
// Each PDF gets a few seeded strip variants (embedded once as form XObjects
// and rotated across pages), each with at least one rare rider. Already
// stamped PDFs are recognised by their keyword and skipped.
//
// Requires the `pdf-lib` npm package to be resolvable.
import {
  PDFDocument,
  concatTransformationMatrix,
  drawObject,
  popGraphicsState,
  pushGraphicsState,
} from "pdf-lib";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const { COLORS, SUSHI, PLATE, PLATE_COLORS, RARE, RARE_PLATE } = require("../sushi-sprites.js");

const STAMP_KEYWORD = "tokidoki-sushi-belt";
const VARIANTS = 3;

// Strip geometry, in sprite pixels. Rows match sushi-belt.js with the empty
// rows above the tallest rider cropped off and no wooden counter (ink).
const TOP = 13;
const PLATE_Y = 25;
const BELT_Y = 29;
const ROWS = BELT_Y + 7 - TOP;
const SPACING = 34;
const RARE_CHANCE = 0.04;

// Placement on the page, in PDF points. The page number sits in the bottom
// right of the 12mm margin, so the strip stops well short of it.
const PX = 0.6;
const LEFT = 34;
const BOTTOM = 6;
const WIDTH = 496;

const BELT = {
  slat: "#e6e9ee",
  seam: "#c3c9d2",
  steel: "#aab2be",
  steelDark: "#7d8694",
};

function rgbOperator(hex) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => (v / 255).toFixed(3);
  return `${c((n >> 16) & 255)} ${c((n >> 8) & 255)} ${c(n & 255)} rg`;
}

const num = (v) => +v.toFixed(2);

// One flate-compressed form XObject per strip, with the rectangles grouped
// by fill colour, so a stamped sheet only grows by a few KB.
function stripXObject(doc, { cols, runs }) {
  const byColor = new Map();
  for (const run of runs) {
    if (!byColor.has(run.color)) byColor.set(run.color, []);
    byColor.get(run.color).push(run);
  }
  const lines = [];
  for (const [color, list] of byColor) {
    lines.push(rgbOperator(color));
    for (const run of list) {
      lines.push(`${num(run.x * PX)} ${num((ROWS - run.r - 1) * PX)} ${num(run.w * PX)} ${num(PX)} re`);
    }
    lines.push("f");
  }
  const stream = doc.context.flateStream(lines.join("\n"), {
    Type: "XObject",
    Subtype: "Form",
    BBox: [0, 0, num(cols * PX), num(ROWS * PX)],
  });
  return doc.context.register(stream);
}

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Paint into a sparse pixel grid, then emit one rectangle per horizontal run
// of same-coloured pixels so the PDF stays small.
function buildStrip(random) {
  const cols = Math.floor(WIDTH / PX);
  const grid = Array.from({ length: ROWS }, () => new Array(cols).fill(null));
  const put = (x, y, color) => {
    const r = y - TOP;
    if (x >= 0 && x < cols && r >= 0 && r < ROWS) grid[r][x] = color;
  };
  const sprite = (rows, x, y, palette) => {
    rows.forEach((row, r) => {
      for (let c = 0; c < row.length; c++) {
        const ch = row[c];
        if (ch !== ".") put(x + c, y + r, palette[ch] || COLORS[ch]);
      }
    });
  };
  const pick = (arr) => arr[Math.floor(random() * arr.length)];

  for (let x = 0; x < cols; x++) {
    const seam = x % 6 === 0;
    for (let y = BELT_Y; y < BELT_Y + 4; y++) put(x, y, seam ? BELT.seam : BELT.slat);
    put(x, BELT_Y + 4, BELT.steelDark);
    put(x, BELT_Y + 5, x % 6 < 2 ? BELT.steelDark : BELT.steel);
    put(x, BELT_Y + 6, BELT.steel);
  }

  const slots = [];
  for (let x = 4 + Math.floor(random() * 16); x + PLATE[0].length <= cols; x += SPACING) slots.push(x);
  const guaranteedRare = Math.floor(random() * slots.length);

  slots.forEach((x, i) => {
    const rare = i === guaranteedRare || random() < RARE_CHANCE;
    const plate = rare ? RARE_PLATE : pick(PLATE_COLORS);
    const rider = rare ? pick(Object.values(RARE))[0] : pick(Object.values(SUSHI));
    const palette = { A: plate[0], a: plate[1] };
    sprite(PLATE, x, PLATE_Y, palette);
    const rx = x + Math.floor((PLATE[0].length - rider[0].length) / 2);
    sprite(rider, rx, PLATE_Y - rider.length + 1, palette);
  });

  const runs = [];
  grid.forEach((row, r) => {
    let c = 0;
    while (c < cols) {
      const color = row[c];
      if (!color) { c++; continue; }
      let end = c + 1;
      while (end < cols && row[end] === color) end++;
      runs.push({ x: c, r, w: end - c, color });
      c = end;
    }
  });
  return { cols, runs };
}

async function stampFile(file) {
  const bytes = await readFile(file);
  const doc = await PDFDocument.load(bytes, { updateMetadata: false });
  if ((doc.getKeywords() || "").includes(STAMP_KEYWORD)) return "already stamped";

  const seed = hashString(path.basename(file));
  const strips = [];
  for (let v = 0; v < VARIANTS; v++) {
    strips.push(stripXObject(doc, buildStrip(mulberry32(seed + v * 7919))));
  }

  doc.getPages().forEach((page, i) => {
    const name = page.node.newXObject("SushiBelt", strips[i % VARIANTS]);
    page.pushOperators(
      pushGraphicsState(),
      concatTransformationMatrix(1, 0, 0, 1, LEFT, BOTTOM),
      drawObject(name),
      popGraphicsState(),
    );
  });

  const keywords = doc.getKeywords();
  doc.setKeywords([...(keywords ? [keywords] : []), STAMP_KEYWORD]);
  await writeFile(file, await doc.save());
  return `${doc.getPageCount()} pages`;
}

const dirs = process.argv.slice(2);
if (dirs.length === 0) {
  console.error("usage: stamp_sheet_belts.mjs <pdf-dir> [<pdf-dir> ...]");
  process.exit(1);
}

for (const dir of dirs) {
  const files = (await readdir(dir)).filter((f) => f.endsWith(".pdf")).sort();
  for (const f of files) {
    const file = path.join(dir, f);
    console.log(`${file}: ${await stampFile(file)}`);
  }
}
