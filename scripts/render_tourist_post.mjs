#!/usr/bin/env node
// Writes the phrase sections of blog-japanese-for-tourists.html from
// tourist-phrases-data.js, between its <!-- phrasebook:start --> and
// <!-- phrasebook:end --> markers (the rest of the post is hand-written).
//
//   node scripts/render_tourist_post.mjs           write the page
//   node scripts/render_tourist_post.mjs --check   fail if it's stale
//   node scripts/render_tourist_post.mjs --script  print what gets recorded
//                                                  (for generate_tourist_audio.py)
//
// Every phrase shows its romaji first, then the meaning, then the Japanese.
// The ▶ / 🐢 buttons play it from the one VOICEVOX recording,
// audio/tourist/phrases.mp3, whose start and end times per phrase
// (audio/tourist/phrases.json) are inlined in the page for phrasebook.js.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const T = require('../tourist-phrases-data.js');
const PAGE = 'blog-japanese-for-tourists.html';
const INDEX = 'audio/tourist/phrases.json';
const PAUSE = 700;  // ms of silence after each phrase in the recording

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ruby = s => esc(s).replace(/([一-鿿々]+)\[([^\]]+)\]/g, '<ruby>$1<rp>(</rp><rt>$2</rt><rp>)</rp></ruby>');
const die = m => { throw new Error(m); };

// What the recording says, in order: every phrase once.
export function audioScript() {
  return T.phrases().map(p => {
    const v = T.VOICES[p.who === 'staff' ? 'staff' : 'you'];
    return { id: p.id, text: p.jp, voice: v.id, speed: v.speed, pause: PAUSE };
  });
}
export function scriptHash(steps) {
  const s = JSON.stringify(steps);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}

function check() {
  const byId = new Map();
  for (const p of T.phrases()) {
    if (!/^[a-z]+$/.test(p.id)) die(`bad phrase id ${p.id}`);
    if (byId.has(p.id)) die(`duplicate phrase id ${p.id}`);
    for (const k of ['ro', 'en', 'jp']) if (!p[k]) die(`${p.id}: no ${k}`);
    byId.set(p.id, p);
  }
  for (const s of T.SECTIONS) for (const it of s.items) {
    for (const a of (it.answers || [])) if (!byId.has(a)) die(`${it.ask.id}: unknown answer ${a}`);
  }
  return byId;
}

function buttons(p) {
  return `<span class="pb-btns">` +
    `<button type="button" class="speak-btn" data-p="${p.id}" aria-label="Listen to ${esc(p.ro)}"><span aria-hidden="true">▶</span></button>` +
    `<button type="button" class="speak-btn" data-p="${p.id}" data-slow="1" aria-label="Listen to ${esc(p.ro)} slowly"><span aria-hidden="true">🐢</span></button></span>`;
}

function row(p, tag) {
  const staff = p.who === 'staff';
  return `<div class="pb-row${staff ? ' pb-staff' : ''}" id="p-${p.id}">${buttons(p)}<div class="pb-main">` +
    `<p class="pb-tag">${tag || (staff ? 'You’ll hear' : 'You say')}</p>` +
    `<p class="pb-ro">${esc(p.ro)}</p>` +
    `<p class="pb-en">${esc(p.en)}</p>` +
    `<p class="pb-jp" lang="ja">${ruby(p.jp)}</p>` +
    (p.note ? `<p class="pb-note">${p.note}</p>` : '') +
    `</div></div>`;
}

function exchange(it, byId) {
  const chips = it.answers.map(id => {
    const a = byId.get(id);
    return `<button type="button" class="pb-chip" data-p="${id}"><span aria-hidden="true">▶</span> ${esc(a.ro)} <span class="pb-chip-en">${esc(a.short || a.en)}</span></button>`;
  }).join('');
  return `<div class="pb-ex">${row(it.ask, 'They ask')}` +
    `<div class="pb-answers"><p class="pb-tag">You answer</p>${chips}` +
    (it.answerNote ? `<p class="pb-note">${it.answerNote}</p>` : '') +
    `</div></div>`;
}

function render(times) {
  const byId = check();
  const sections = T.SECTIONS.map(s => `
        <section class="pb-section" id="${s.id}">
          <h2>${esc(s.title)}</h2>${s.intro ? `
          <p>${s.intro}</p>` : ''}
          <div class="pb-list">
            ${s.items.map(it => it.ask ? exchange(it, byId) : row(it)).join('\n            ')}
          </div>
        </section>`).join('');
  const data = JSON.stringify({ src: 'audio/tourist/phrases.mp3', t: times }).replace(/</g, '\\u003c');
  const credit = Object.values(T.VOICES).map(v => `VOICEVOX:${v.name}`).join(', ');
  const toc = T.SECTIONS.map(s => `<li><a href="#${s.id}">${esc(s.title)}</a></li>`).join('');
  return `<!-- phrasebook:start — written by scripts/render_tourist_post.mjs from tourist-phrases-data.js -->
        <nav aria-label="Situations"><p><strong>Jump to a situation:</strong></p><ul class="pb-toc">${toc}</ul></nav>${sections}
        <p class="lis-credits">Voices: ${esc(credit)}</p>
        <script type="application/json" id="pb-data">${data}</script>
        <!-- phrasebook:end -->`;
}

if (process.argv.includes('--script')) {
  const steps = audioScript();
  process.stdout.write(JSON.stringify({ hash: scriptHash(steps), steps }));
} else if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = path.join(ROOT, PAGE);
  const page = fs.readFileSync(file, 'utf8');
  let times = {};
  const idx = path.join(ROOT, INDEX);
  if (fs.existsSync(idx)) {
    const rec = JSON.parse(fs.readFileSync(idx, 'utf8'));
    if (rec.hash === scriptHash(audioScript())) times = rec.t;
    else console.error(`${INDEX} is stale: re-record with scripts/generate_tourist_audio.py`);
  }
  const out = page.replace(/<!-- phrasebook:start[\s\S]*?<!-- phrasebook:end -->/, () => render(times));
  if (out === page && !page.includes('<!-- phrasebook:start')) die(`${PAGE}: no phrasebook markers`);
  if (process.argv.includes('--check')) {
    if (out !== page) { console.error(`stale: ${PAGE}\nRun: node scripts/render_tourist_post.mjs`); process.exit(1); }
    console.log(`${PAGE} up to date`);
  } else if (out !== page) { fs.writeFileSync(file, out); console.log(`wrote ${PAGE}`); }
  else console.log(`${PAGE} up to date`);
}
