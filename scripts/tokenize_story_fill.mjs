#!/usr/bin/env node
// Build story-fill-words.js from story-fill-data.js: every passage split into
// words, each linked to a dictionary entry, so a tapped word on the Story
// Fill-in page can show its reading and meaning (as on the Stories page).
//
// Words are found with the kuromoji morphological analyser and grouped the
// way the Stories page groups them: a verb or adjective keeps its endings
// (起きます, 運べなかった), particles stand alone. Each word is looked up, in
// order, in the Stories glossary (stories-data.js + mystery-words.js), the
// JLPT vocabulary list (vocabulary-data.js), and EXTRA below. Readings are
// kept whole: a word never splits a `漢字[よみ]` group.
//
// Usage (kuromoji isn't a site dependency, so install it just for this):
//   npm install --no-save kuromoji
//   node scripts/tokenize_story_fill.mjs
// test_story_fill.js fails when the passages and this file drift apart.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(process.cwd(), 'x.js'));
const kuromoji = require('kuromoji');

const box = { window: {} };
vm.createContext(box);
for (const f of ['story-fill-data.js', 'stories-data.js', 'mystery-words.js', 'vocabulary-data.js']) {
  vm.runInContext(readFileSync(path.join(ROOT, f), 'utf8'), box);
}
const { STORY_FILL_PASSAGES: PASSAGES, STORY_GLOSSARY: GLOSSARY, VOCAB_DATA } = box.window;

// Words neither list has (or has with a different sense): [reading, meaning, part of speech].
const EXTRA = JSON.parse(readFileSync(path.join(ROOT, 'scripts', 'story_fill_extra_words.json'), 'utf8'));

const kata2hira = s => (s || '').replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const display = key => key.replace(/\(.*\)$/, '');

const vocab = [];
// The list spells some する-nouns' readings with する (出席 → しゅっせきする).
for (const [level, list] of Object.entries(VOCAB_DATA)) list.forEach(w => vocab.push({ ...w, level,
  kana: !w.kanji.endsWith('する') && w.kana.endsWith('する') && w.kanji !== w.kana ? w.kana.slice(0, -2) : w.kana }));

// The dictionary entry for a word: [key, [reading, meaning, pos]] or null.
function lookup(base, reading, content = true) {
  const sense = `${base}(${reading})`;
  if (EXTRA[sense]) return [sense, EXTRA[sense]];
  if (EXTRA[base]) return [base, EXTRA[base]];
  if (GLOSSARY[base]) return [base, GLOSSARY[base]];
  const sensed = Object.keys(GLOSSARY).filter(k => display(k) === base);
  const match = sensed.find(k => GLOSSARY[k][0] === reading) || sensed[0];
  if (match) return [match, GLOSSARY[match]];
  const v = vocab.filter(w => w.kanji === base);
  const hit = v.find(w => w.kana === reading) || v[0] || vocab.find(w => w.kana === base && w.kanji === base);
  if (hit) return [base, [hit.kana, hit.meaning.replace(/^To /, 'to '), `JLPT ${hit.level.toUpperCase()} word`]];
  // A word written in kana: the entry with that reading.
  if (content && /^[ぁ-ゖー]+$/.test(base)) {
    const g = Object.keys(GLOSSARY).find(k => GLOSSARY[k][0] === base && !k.includes('('));
    if (g) return [g, GLOSSARY[g]];
    const v2 = vocab.find(w => w.kana === base);
    if (v2) return [v2.kanji, [v2.kana, v2.meaning.replace(/^To /, 'to '), `JLPT ${v2.level.toUpperCase()} word`]];
  }
  return null;
}

// Markup → units: a `漢字[よみ]` group or one character, with its plain text.
function units(markup) {
  const out = [];
  const re = /([㐀-䶿一-鿿々〆ヶ]+)\[([^\]]+)\]|([\s\S])/gu;
  let m;
  while ((m = re.exec(markup))) out.push(m[1] ? { text: m[1], src: m[0] } : { text: m[3], src: m[3] });
  return out;
}

const CONTENT = new Set(['名詞', '動詞', '形容詞', '副詞', '連体詞', '接続詞', '感動詞']);

// Morphemes → words, Stories style.
function group(morphs) {
  const words = [];
  let prefix = null;
  for (const m of morphs) {
    const prev = words[words.length - 1];
    const head = prev && prev.head;
    const pos = m.pos, d1 = m.pos_detail_1;
    const attach = prev && !prev.closed && (
      (pos === '助動詞' && head && ['動詞', '形容詞', '助動詞'].includes(prev.last.pos)) ||
      (pos === '助動詞' && prev.copula) ||
      (pos === '助詞' && d1 === '接続助詞' && ['て', 'で', 'ば'].includes(m.surface_form) && ['動詞', '形容詞', '助動詞'].includes(prev.last.pos)) ||
      (pos === '動詞' && d1 === '接尾' && head) ||
      (pos === '名詞' && d1 === '接尾' && head && head.pos === '名詞') ||
      (pos === '名詞' && d1 === '数' && prev.last.pos_detail_1 === '数')
    );
    if (attach) {
      prev.morphs.push(m);
      prev.last = m;
      if (m.pos === '助動詞' && !['動詞', '形容詞'].includes(head.pos)) prev.copula = true;
      if (pos === '名詞') prev.compound = true;
      continue;
    }
    if (pos === '接頭詞') { prefix = m; continue; }
    const w = { morphs: prefix ? [prefix, m] : [m], last: m, head: CONTENT.has(pos) || pos === '助動詞' ? m : null, prefix };
    if (pos === '助動詞') w.copula = true;
    if (pos === '記号') w.closed = true;
    prefix = null;
    words.push(w);
  }
  return words;
}

function keyFor(w) {
  const surface = w.morphs.map(m => m.surface_form).join('');
  const reading = kata2hira(w.morphs.map(m => m.reading || m.surface_form).join(''));
  if (w.last.pos === '記号') return null;
  const tries = [];
  const h = w.head || w.morphs[w.morphs.length - 1];
  const hi = w.morphs.indexOf(h);
  const pre = w.morphs.slice(0, hi).map(m => m.surface_form).join('');
  if (w.compound || w.prefix) tries.push([surface, reading]);
  // A number and its counter (一年, 五分) is looked up whole or not at all.
  if (w.compound && h.pos_detail_1 === '数') return lookup(surface, reading) || { miss: surface, surface };
  const basic = h.basic_form && h.basic_form !== '*' ? h.basic_form : h.surface_form;
  if (w.prefix) tries.push([pre + basic, null]);
  tries.push([basic, kata2hira(h.reading)]);
  if (h.surface_form !== basic) tries.push([h.surface_form, kata2hira(h.reading)]);
  // A lone で that kuromoji reads as the copula (一人では) is shown as the particle.
  if (surface === 'で' && h.pos === '助動詞') return lookup('で', 'で', false);
  const content = CONTENT.has(h.pos);
  for (const [b, r] of tries) { const hit = lookup(b, r, content); if (hit) return hit; }
  return { miss: basic, surface };
}

const tokenizer = await new Promise((res, rej) => kuromoji.builder({ dicPath: path.join(path.dirname(require.resolve('kuromoji')), '..', 'dict') })
  .build((e, t) => (e ? rej(e) : res(t))));

// Kuromoji splits these oddly in kana-heavy text; keep them whole.
const WHOLE = ['しゅみ', 'すきやき', 'てんぷら', 'ざんねん', 'スマートフォン', '自動販売機'];
function analyse(text) {
  const re = new RegExp(WHOLE.join('|'), 'g');
  const out = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index > last) out.push(...tokenizer.tokenize(text.slice(last, m.index)));
    out.push({ surface_form: m[0], pos: '名詞', pos_detail_1: '一般', basic_form: m[0], reading: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(...tokenizer.tokenize(text.slice(last)));
  return out;
}

const gloss = {};
const passages = {};
const misses = new Map();
for (const p of PASSAGES) {
  passages[p.id] = p.paragraphs.map(par => {
    const out = [];
    par.split(/(\{\d+\})/).forEach(seg => {
      if (!seg) return;
      if (/^\{\d+\}$/.test(seg)) { out.push(seg); return; }
      const us = units(seg);
      const plain = us.map(u => u.text).join('');
      // Plain-text offset → unit index.
      const owner = [];
      us.forEach((u, i) => { for (const _ of u.text) owner.push(i); });
      const words = group(analyse(plain));
      let pos = 0;
      const spans = words.map(w => {
        const len = w.morphs.reduce((n, m) => n + m.surface_form.length, 0);
        const span = { from: pos, to: pos + len, key: keyFor(w), reading: kata2hira(w.morphs.map(m => m.reading || m.surface_form).join('')) };
        pos += len;
        return span;
      });
      // Merge words that would split a reading group.
      const merged = [];
      for (const s of spans) {
        const prev = merged[merged.length - 1];
        if (prev && owner[s.from] === owner[prev.to - 1]) {
          prev.to = s.to;
          prev.reading += s.reading;
          const whole = lookup(plain.slice(prev.from, prev.to), prev.reading);
          if (whole) prev.key = whole;
          else if (!prev.key || prev.key.miss) prev.key = s.key;
        } else merged.push({ ...s });
      }
      merged.forEach(s => {
        const src = us.slice(owner[s.from], owner[s.to - 1] + 1).map(u => u.src).join('');
        if (s.key && s.key.miss) {
          const k = s.key.miss;
          misses.set(k, (misses.get(k) || []).concat(p.id));
          out.push(src);
        } else if (s.key) {
          gloss[s.key[0]] = s.key[1];
          out.push([src, s.key[0]]);
        } else out.push(src);
      });
    });
    // Join runs of plain (unlinked) text.
    return out.reduce((acc, t) => {
      if (typeof t === 'string' && !/^\{\d+\}$/.test(t) && typeof acc[acc.length - 1] === 'string' && !/^\{\d+\}$/.test(acc[acc.length - 1])) acc[acc.length - 1] += t;
      else acc.push(t);
      return acc;
    }, []);
  });
}

const sortedGloss = Object.fromEntries(Object.keys(gloss).sort().map(k => [k, gloss[k]]));
const js = `// Generated by scripts/tokenize_story_fill.mjs from story-fill-data.js — do not edit.
// STORY_FILL_WORDS.passages[id] has each paragraph as a list of pieces: a
// string is plain text or a blank ({1}), [markup, key] is a word that can be
// tapped, and gloss[key] is its [reading, meaning, part of speech].
(function (global) {
  'use strict';
  global.STORY_FILL_WORDS = ${JSON.stringify({ gloss: sortedGloss, passages })};
})(typeof window !== 'undefined' ? window : globalThis);
`;
writeFileSync(path.join(ROOT, 'story-fill-words.js'), js);
const missList = [...misses].sort((a, b) => b[1].length - a[1].length);
console.log(`${Object.keys(sortedGloss).length} words; ${missList.length} not found`);
if (process.argv.includes('--misses')) missList.forEach(([k, ids]) => console.log(k, ids.length, ids[0]));
