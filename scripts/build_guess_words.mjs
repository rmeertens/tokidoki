// Splits the JLPT vocabulary (vocabulary-data.js) into the pieces the
// GTK - Easy Word Order page (guess-kanji.html) plans with, gives each word
// a short example sentence, and writes guess-words-data.js.
//
// Usage:
//   git clone --depth 1 https://github.com/BlaiseLabs/GuessWithAnki /tmp/gwa
//   git clone --depth 1 https://github.com/evanclan/OpenJLPT /tmp/openjlpt
//   node scripts/build_guess_words.mjs /tmp/gwa/guesswithanki/data /tmp/openjlpt/data/json/vocab
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
//
// Each word's part of speech (noun, verb, い-adjective…) is JMdict's, from
// OpenJLPT, in plain words (POS_LABELS); for a word spelled otherwise there,
// the entry with its reading (and a meaning word in common, if several have
// it); for the few OpenJLPT doesn't have (顔, 母, 私), kuromoji's (run
// `npm install --no-save kuromoji` first; without it, a verb if the meaning
// starts "To …", else left blank).
//
// The example sentences are Tatoeba's (CC BY 2.0 FR), as OpenJLPT
// (CC BY-SA 4.0) matched them to each JLPT word through the Tanaka Corpus's
// word index: per word (same spelling and reading), the shortest one that
// has furigana and spells the word as listed, kept with its Tatoeba id.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'guess-words-data.js');

const [dataDir, examplesDir] = process.argv.slice(2);
if (!dataDir || !examplesDir) {
  console.error('usage: node scripts/build_guess_words.mjs <GuessWithAnki data dir> <OpenJLPT data/json/vocab dir>');
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

// ─── Example sentences (OpenJLPT / Tatoeba) ──────────────────────────────────

const examplesFor = new Map();
const posFor = new Map();
const posByReading = new Map();   // reading → [{ pos, meanings }], for words spelled differently there
for (const level of ['n5', 'n4', 'n3', 'n2', 'n1']) {
  const file = path.join(examplesDir, `${level}.json`);
  if (!fs.existsSync(file)) continue;
  for (const e of JSON.parse(fs.readFileSync(file, 'utf8'))) {
    const key = `${e.word}|${hira(e.reading || '')}`;
    examplesFor.set(key, (examplesFor.get(key) || []).concat(e.examples || []));
    if (!posFor.has(key) && Array.isArray(e.pos)) posFor.set(key, e.pos);
    if (Array.isArray(e.pos)) {
      const r = hira(e.reading || '');
      posByReading.set(r, (posByReading.get(r) || []).concat([{ pos: e.pos, meanings: (e.meanings || []).join(' ') }]));
    }
  }
}

// JMdict part-of-speech codes, in plain words; codes not here (vi / vt,
// adj-f…) aren't shown.
const POS_LABELS = {
  n: 'noun', 'adj-no': 'noun', 'n-adv': 'noun', 'n-t': 'noun', 'n-pref': 'prefix', 'n-suf': 'suffix',
  pn: 'pronoun', num: 'number', ctr: 'counter', pref: 'prefix', suf: 'suffix',
  'adj-i': 'い-adjective', 'adj-ix': 'い-adjective', 'adj-na': 'な-adjective',
  'adj-pn': 'pre-noun adjective', 'adj-t': 'たる-adjective',
  adv: 'adverb', 'adv-to': 'adverb', conj: 'conjunction', int: 'interjection',
  exp: 'expression', prt: 'particle', aux: 'auxiliary', 'aux-v': 'auxiliary', 'aux-adj': 'auxiliary',
  vs: 'する verb', 'vs-i': 'する verb', 'vs-s': 'する verb',
};
const posLabel = code => POS_LABELS[code] || (/^v(1|5|k|z)/.test(code) ? 'verb' : null);

// "noun", "verb", "noun · する verb"…: at most two, in JMdict's order.
// kuromoji (IPAdic) for words OpenJLPT doesn't have, when it reads the word
// as one word.
let tokenizer = null;
try {
  const kuromoji = require(path.join(ROOT, 'node_modules/kuromoji'));
  tokenizer = await new Promise((resolve, reject) =>
    kuromoji.builder({ dicPath: path.join(ROOT, 'node_modules/kuromoji/dict') }).build((err, tk) => (err ? reject(err) : resolve(tk))));
} catch {
  console.warn('kuromoji not installed: words OpenJLPT lacks get a part of speech only if they\'re verbs');
}
function kuromojiPos(word) {
  const toks = tokenizer ? tokenizer.tokenize(word) : [];
  if (toks.length !== 1) return '';
  const { pos, pos_detail_1: d } = toks[0];
  if (pos === '名詞') {
    return { 形容動詞語幹: 'な-adjective', 数: 'number', 代名詞: 'pronoun', 副詞可能: 'noun · adverb', サ変接続: 'noun · する verb' }[d] || 'noun';
  }
  return { 動詞: 'verb', 形容詞: 'い-adjective', 副詞: 'adverb', 連体詞: 'pre-noun adjective', 接頭詞: 'prefix', 感動詞: 'interjection', 接続詞: 'conjunction' }[pos] || '';
}

function partOfSpeech(w) {
  // OpenJLPT spells some words otherwise (椅子 as いす): then the entry with
  // the same reading, or of several, the one whose meaning shares a word with ours.
  const byReading = posByReading.get(hira(w.kana)) || [];
  const gloss = stems(w.meaning);
  const alike = byReading.filter(e => [...stems(e.meanings)].some(x => gloss.has(x)));
  const other = byReading.length === 1 ? byReading[0] : alike.length === 1 ? alike[0] : null;
  const codes = posFor.get(`${w.word}|${hira(w.kana)}`) || (other && other.pos);
  if (!codes) return kuromojiPos(w.word) || (/^to /i.test(w.meaning) ? 'verb' : '');
  return [...new Set(codes.map(posLabel).filter(Boolean))].slice(0, 2).join(' · ');
}

// Furigana stays in OpenJLPT's {漢字|かんじ} groups, which say exactly which
// characters a reading covers ({お茶|おちゃ}). A few groups give a JMdict id
// instead of a reading ({前|#1392580}): 前 is まえ in all of them, and any
// other such group goes without furigana.
const ID_READINGS = { 前: 'まえ' };
const toMarkup = f => f.replace(/\{([^|}]+)\|([^}]+)\}/g, (m, k, r) =>
  (r[0] !== '#' ? m : ID_READINGS[k] ? `{${k}|${ID_READINGS[k]}}` : k));
// The word's spelling up to its last kanji (食べる → 食), to tell a sentence
// that writes it as listed from one that writes it in kana.
const stemOf = w => w.slice(0, [...w].findLastIndex(c => KANJI.test(c)) + 1);

function pickExample(w) {
  const all = (examplesFor.get(`${w.word}|${hira(w.kana)}`) || []).filter(e => e.ja && e.en);
  const stem = stemOf(w.word);
  const score = e => (e.furigana ? 0 : 1000) + (e.ja.includes(stem) ? 0 : 500) + [...e.ja].length;
  const best = all.sort((a, b) => score(a) - score(b))[0];
  return best ? [best.furigana ? toMarkup(best.furigana) : best.ja, best.en, best.tatoeba_id] : null;
}

const round = x => Math.round(x * 100) / 100;
const rows = words.map(w => {
  const share = Math.min(...w.split.map(([ch, r]) => readingShare(ch, r, deck)));
  const rLevel = Math.min(1, share / 0.05);
  const gloss = stems(w.meaning);
  const units = [...new Set(w.split.map(([ch]) => ch))];
  const mLevel = units.filter(ch => [...stems((KD[ch] && KD[ch].m || []).join(' '))].some(s => gloss.has(s))).length / units.length;
  const row = [w.word, w.kana, w.meaning, w.level, w.split.map(([c, r]) => `${c}:${r}`).join(' '), round(rLevel), round(mLevel)];
  row.push(partOfSpeech(w));
  const ex = pickExample(w);
  return ex ? row.concat(ex) : row;
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
  // reading level, meaning level, part of speech ("noun", "verb"… or ""),
  // and, when there is one, an example sentence (furigana as {漢字|かんじ}),
  // its English and its Tatoeba id].
  // The pieces, levels and kanji meanings come from KANJIDIC2 and JMdict by
  // the Electronic Dictionary Research and Development Group, licensed under
  // Creative Commons Attribution-ShareAlike 4.0
  // (https://www.edrdg.org/edrdg/licence.html), via GuessWithAnki
  // (https://github.com/BlaiseLabs/GuessWithAnki, MIT). The example
  // sentences are from Tatoeba (https://tatoeba.org, CC BY 2.0 FR; each id
  // is https://tatoeba.org/sentences/show/<id>), as matched to the JLPT
  // words by OpenJLPT (https://github.com/evanclan/OpenJLPT, CC BY-SA 4.0).

  global.GUESS_WORDS = [
${rows.map(r => '    ' + JSON.stringify(r)).join(',\n')}
  ];

  global.GUESS_KANJI_MEANINGS = ${JSON.stringify(kanjiMeanings)};
})(typeof window !== 'undefined' ? window : globalThis);
`;
fs.writeFileSync(OUT, js);
const withExample = rows.filter(r => r.length > 8).length;
const withPos = rows.filter(r => r[7]).length;
console.log(`${rows.length} of ${total} kanji words split (${guessable} guessable, ${withPos} with a part of speech, ${withExample} with an example), ${Object.keys(kanjiMeanings).length} kanji → ${path.relative(ROOT, OUT)}`);
