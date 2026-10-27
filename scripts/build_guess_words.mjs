// Splits the JLPT vocabulary (vocabulary-data.js) into the pieces the Guess
// the Kanji page plans with, and writes guess-words-data.js.
//
// Usage:
//   git clone --depth 1 https://github.com/BlaiseLabs/GuessWithAnki /tmp/gwa
//   node scripts/build_guess_words.mjs /tmp/gwa/guesswithanki/data
//
// The data directory holds GuessWithAnki's kanji.json (KANJIDIC2: each
// kanji's meanings, on'yomi and kun'yomi with okurigana) and readings.json
// (how many common JMdict words read each kanji each way); both are
// CC BY-SA 4.0, by the EDRDG. Neither is needed at runtime.
//
// A piece is a kanji with the reading it has in the word (会:かい). Each
// word is aligned kanji by kanji to its kana, as GuessWithAnki's
// core/align.py does: each kanji takes one of its KANJIDIC readings (on'yomi;
// kun'yomi stem, whole, or as a verb's -masu stem), with rendaku (か→が),
// h→p (は→ぱ) and gemination (がく→がっ). A word that doesn't split that way
// (今日 きょう) is left out: there's nothing in it to guess from, and so are
// the list's suffixes and counters (～日).
//
// Each word also gets the two levels the planner reads (0..1), as
// GuessWithAnki's core/heuristic.py computes them without a model:
//   r  reading: how usual each kanji's reading is (its share of the
//      kanji's words in JMdict and in this list, the list weighted 3×),
//      for the least usual kanji, full at a 5% share
//   m  meaning: the share of the word's kanji with a meaning word that's
//      also in the word's English meaning
// A word counts as guessable at reading ≥ 0.6 and meaning ≥ 0.5 (guess-path.js;
// GuessWithAnki asks 0.6 of a model's meaning label, but this word-overlap
// check only reaches 0.6 for a two-kanji word when both kanji show in the
// English, so 牛乳 "milk" (cow + milk) would never count).

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'guess-words-data.js');

const dataDir = process.argv[2];
if (!dataDir) {
  console.error('usage: node scripts/build_guess_words.mjs <GuessWithAnki data dir>');
  process.exit(1);
}
const KD = JSON.parse(fs.readFileSync(path.join(dataDir, 'kanji.json'), 'utf8')).k;
const DICT = JSON.parse(fs.readFileSync(path.join(dataDir, 'readings.json'), 'utf8')).k;

globalThis.window = globalThis;
require(path.join(ROOT, 'vocabulary-data.js'));
const VOCAB = globalThis.VOCAB_DATA;

// ─── Alignment (core/align.py) ───────────────────────────────────────────────

const KANJI = /[㐀-䶿一-鿿豈-﫿々]/;
const hira = s => [...s].map(c => (c >= 'ァ' && c <= 'ヶ' ? String.fromCharCode(c.charCodeAt(0) - 0x60) : c)).join('');
const zip = (a, b) => Object.fromEntries([...a].map((c, i) => [c, b[i]]));
const DAK = zip('かきくけこさしすせそたちつてとはひふへほ', 'がぎぐげござじずぜぞだぢづでどばびぶべぼ');
const HAN = zip('はひふへほ', 'ぱぴぷぺぽ');
const I_ROW = zip('うくぐすつぬぶむる', 'いきぎしちにびみり');

const readingCache = new Map();
function readings(ch) {
  if (!readingCache.has(ch)) {
    const k = KD[ch] || {};
    const out = (k.on || []).map(hira);
    for (const x0 of k.kun || []) {
      const x = x0.replace(/-/g, '');
      const [stem, oku = ''] = x.split('.');
      out.push(stem);
      if (oku) {
        out.push(stem + oku);
        if (I_ROW[oku.at(-1)]) out.push(stem + oku.slice(0, -1) + I_ROW[oku.at(-1)]);
        if (oku.endsWith('る') && oku.length >= 2) out.push(stem + oku.slice(0, -1));
      }
    }
    // Longest first; ties keep KANJIDIC's order (its first readings are the common ones).
    const uniq = [...new Set(out.filter(Boolean))];
    readingCache.set(ch, uniq.map((r, i) => [r, i]).sort((a, b) => b[0].length - a[0].length || a[1] - b[1]).map(([r]) => r));
  }
  return readingCache.get(ch);
}

function variants(r) {
  const out = [[r, r]];
  if (DAK[r[0]]) out.push([DAK[r[0]] + r.slice(1), r]);
  if (HAN[r[0]]) out.push([HAN[r[0]] + r.slice(1), r]);
  if (r.length > 1 && 'きくちつ'.includes(r.at(-1))) {
    out.push([r.slice(0, -1) + 'っ', r]);
    if (DAK[r[0]]) out.push([DAK[r[0]] + r.slice(1, -1) + 'っ', r]);
  }
  return out;
}

// [[kanji, base reading], ...] in word order, or null.
function split(word, reading) {
  if (!word || !reading || !KANJI.test(word)) return null;
  const w = [...hira(word)], rd = hira(reading);
  const memo = new Map();
  function go(i, j) {
    const key = i * 1000 + j;
    if (memo.has(key)) return memo.get(key);
    let res = null;
    if (i === w.length) res = j === rd.length ? [] : null;
    else if (!KANJI.test(w[i])) res = rd.startsWith(w[i], j) ? go(i + 1, j + w[i].length) : null;
    else {
      const ch = w[i] === '々' && i ? w[i - 1] : w[i];
      outer: for (const base of readings(ch)) {
        for (const [said, b] of variants(base)) {
          if (rd.startsWith(said, j)) {
            const rest = go(i + 1, j + said.length);
            if (rest) { res = [[ch, b], ...rest]; break outer; }
          }
        }
      }
    }
    memo.set(key, res);
    return res;
  }
  return go(0, 0);
}

// ─── Guessability (core/heuristic.py, "words" meaning mode) ──────────────────

const STOP = new Set('a an the of to in on for and or be is as at by with one\'s someone something sth sb'.split(' '));
const stems = s => new Set((String(s).toLowerCase().match(/[a-z]+/g) || []).filter(w => !STOP.has(w) && w.length >= 3).map(w => w.slice(0, 5)));

function readingShare(ch, r, deck) {
  const d = DICT[ch] || {}, k = deck[ch] || {};
  const sum = o => Object.values(o).reduce((a, b) => a + b, 0);
  const tot = sum(d) + 3 * sum(k);
  return tot ? ((d[r] || 0) + 3 * (k[r] || 0)) / tot : 0;
}

// ─── Build ───────────────────────────────────────────────────────────────────

const words = [];
const seen = new Set();
let total = 0;
for (const level of ['n5', 'n4', 'n3']) {
  for (const v of VOCAB[level] || []) {
    // Suffixes and counters (～日, ～本) aren't words to guess.
    if (!KANJI.test(v.kanji) || /[～〜]/.test(v.kanji)) continue;
    total++;
    const key = `${v.kanji}|${v.kana}`;
    if (seen.has(key)) continue;
    const sp = split(v.kanji, v.kana);
    if (!sp) continue;
    seen.add(key);
    words.push({ word: v.kanji, kana: v.kana, meaning: v.meaning, level: level.toUpperCase(), split: sp });
  }
}

const deck = {};
for (const w of words) {
  for (const [ch, r] of w.split) {
    deck[ch] = deck[ch] || {};
    deck[ch][r] = (deck[ch][r] || 0) + 1;
  }
}

const round = x => Math.round(x * 100) / 100;
const rows = words.map(w => {
  const share = Math.min(...w.split.map(([ch, r]) => readingShare(ch, r, deck)));
  const rLevel = Math.min(1, share / 0.05);
  const gloss = stems(w.meaning);
  const units = [...new Set(w.split.map(([ch]) => ch))];
  const mLevel = units.filter(ch => [...stems((KD[ch] && KD[ch].m || []).join(' '))].some(s => gloss.has(s))).length / units.length;
  return [w.word, w.kana, w.meaning, w.level, w.split.map(([c, r]) => `${c}:${r}`).join(' '), round(rLevel), round(mLevel)];
});

// Each kanji's first two meanings, for the hints.
const kanjiMeanings = {};
for (const w of words) for (const [ch] of w.split) kanjiMeanings[ch] = (KD[ch] && KD[ch].m || []).slice(0, 2).join(', ');

const guessable = rows.filter(r => r[5] >= 0.6 && r[6] >= 0.5).length;
const js = `(function (global) {
  'use strict';

  // Generated by scripts/build_guess_words.mjs — do not hand-edit.
  //
  // The JLPT N5–N3 words of vocabulary-data.js that split kanji by kanji,
  // in list order: [word, kana, meaning, level, pieces ("会:かい 社:しゃ"),
  // reading level, meaning level]. The pieces, levels and kanji meanings
  // come from KANJIDIC2 and JMdict by the Electronic Dictionary Research and
  // Development Group, licensed under Creative Commons Attribution-ShareAlike
  // 4.0 (https://www.edrdg.org/edrdg/licence.html), via GuessWithAnki
  // (https://github.com/BlaiseLabs/GuessWithAnki, MIT).

  global.GUESS_WORDS = [
${rows.map(r => '    ' + JSON.stringify(r)).join(',\n')}
  ];

  global.GUESS_KANJI_MEANINGS = ${JSON.stringify(kanjiMeanings)};
})(typeof window !== 'undefined' ? window : globalThis);
`;
fs.writeFileSync(OUT, js);
console.log(`${rows.length} of ${total} kanji words split (${guessable} guessable), ${Object.keys(kanjiMeanings).length} kanji → ${path.relative(ROOT, OUT)}`);
