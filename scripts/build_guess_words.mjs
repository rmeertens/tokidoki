// Splits the JLPT vocabulary (vocabulary-data.js) into the pieces the
// GTK - Easy Word Order page (guess-kanji.html) plans with, gives each word
// a short example sentence, and writes guess-words-data.js.
//
// Usage (kuromoji isn't a site dependency, so install it just for this):
//   npm install --no-save kuromoji
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
// it); for the few OpenJLPT doesn't have (顔, 母, 私), kuromoji's.
//
// The example sentences are our own, one short easy sentence per word, in
// scripts/guess_examples.tsv: "word|kana <tab> sentence <tab> English", the
// word written as listed (a verb may be conjugated). Every word must have
// one. Their furigana is added here: the word itself gets its own reading
// from the list, the rest of the sentence kuromoji's.

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

// ─── Parts of speech (OpenJLPT) ──────────────────────────────────────────────

const posFor = new Map();
const posByReading = new Map();   // reading → [{ pos, meanings }], for words spelled differently there
for (const level of ['n5', 'n4', 'n3', 'n2', 'n1']) {
  const file = path.join(examplesDir, `${level}.json`);
  if (!fs.existsSync(file)) continue;
  for (const e of JSON.parse(fs.readFileSync(file, 'utf8'))) {
    const key = `${e.word}|${hira(e.reading || '')}`;
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
const kuromoji = require(path.join(ROOT, 'node_modules/kuromoji'));
const tokenizer = await new Promise((resolve, reject) =>
  kuromoji.builder({ dicPath: path.join(ROOT, 'node_modules/kuromoji/dict') }).build((err, tk) => (err ? reject(err) : resolve(tk))));
function kuromojiPos(word) {
  const toks = tokenizer.tokenize(word);
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

// ─── Example sentences (scripts/guess_examples.tsv) ──────────────────────────

const EXAMPLES = new Map();
for (const line of fs.readFileSync(path.join(ROOT, 'scripts/guess_examples.tsv'), 'utf8').split('\n')) {
  if (!line.trim()) continue;
  const [key, ja, en] = line.split('\t');
  if (!ja || !en) throw new Error(`guess_examples.tsv: bad line: ${line}`);
  EXAMPLES.set(key, { ja, en });
}

const isKanji = c => KANJI.test(c);

// Lines up `surface` (kanji and kana) with its reading: [[text, reading or
// null for kana], …], kanji runs matched to the kana between the kana runs
// (取り替える / とりかえる → 取:と, り, 替:か, える), or null if they don't match.
function align(surface, reading) {
  const runs = [];
  for (const c of surface) {
    const k = isKanji(c);
    if (runs.length && runs[runs.length - 1].k === k) runs[runs.length - 1].t += c;
    else runs.push({ t: c, k });
  }
  const esc = t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp('^' + runs.map(r => (r.k ? '(.+?)' : esc(hira(r.t)))).join('') + '$').exec(hira(reading));
  if (!m) return null;
  let g = 1;
  return runs.map(r => [r.t, r.k ? m[g++] : null]);
}

const OWN_READING = { '堅|かたい': 'かた', '落る|おちる': 'お' };

// kuromoji's misreadings in these sentences, put right.
const FURIGANA_FIXES = [
  ['{一日|いちにち}{中|ちゅう}', '{一日|いちにち}{中|じゅう}'],
  ['{一|いち}{人|にん}', '{一人|ひとり}'], ['{二|に}{人|にん}', '{二人|ふたり}'],
  ['{二|に}{十|じゅう}{歳|さい}', '{二十歳|はたち}'],
  ['{一|いち}{回|かい}', '{一回|いっかい}'], ['{一|いち}{歩|ほ}', '{一歩|いっぽ}'],
  ['{一|いち}{週間|しゅうかん}', '{一週間|いっしゅうかん}'], ['{一|いち}{分|ふん}', '{一分|いっぷん}'],
  ['{一|いち}{切|き}れ', '{一切|ひとき}れ'], ['{一|いち}か{月|げつ}', '{一|いっ}か{月|げつ}'],
  ['{一|いち}{世紀|せいき}', '{一|いっ}{世紀|せいき}'],
  ['{三|さん}{階|かい}', '{三|さん}{階|がい}'], ['{三|さん}{日|にち}', '{三日|みっか}'],
  ['{五|ご}{分|ぶ}{五|ご}{分|ふん}', '{五|ご}{分|ぶ}{五|ご}{分|ぶ}'],
  ['{何|なに}です', '{何|なん}です'], ['{何|なに}{曜日|ようび}', '{何|なん}{曜日|ようび}'],
  ['{洗濯|せんたく}{物|ぶつ}', '{洗濯物|せんたくもの}'],
  ['{運動|うんどう}の{後|のち}', '{運動|うんどう}の{後|あと}'],
  ['{雲|くも}の{間|ま}', '{雲|くも}の{間|あいだ}'],
];

const markup = parts => parts.map(([t, r]) => (r && r !== hira(t) ? `{${t}|${r}}` : t)).join('');

// [[start, text, reading or null], …] for a run of parts starting at `at`.
function spans(parts, at) {
  const out = [];
  for (const [t, r] of parts) { out.push([at, t, r && r !== hira(t) ? r : null]); at += t.length; }
  return out;
}

// kuromoji's reading of the whole sentence, as spans.
function kuromojiSpans(ja) {
  const out = [];
  let at = 0;
  for (const t of tokenizer.tokenize(ja)) {
    const parts = [...t.surface_form].some(isKanji) && t.reading && t.reading !== '*' ? align(t.surface_form, t.reading) : null;
    out.push(...spans(parts || [[t.surface_form, null]], at));
    at += t.surface_form.length;
  }
  return out;
}

// The word's own spans where it stands in the sentence (null if it isn't
// there as listed), and where it starts and ends.
function wordSpans(w, ja) {
  // The list writes a few する nouns' readings with する (計画 けいかくする).
  const kana = !w.word.endsWith('する') && w.kana.endsWith('する') ? w.kana.slice(0, -2) : w.kana;
  const lastKanji = [...w.word].findLastIndex(isKanji);
  const stem = [...w.word].slice(0, lastKanji + 1).join('');
  const whole = ja.includes(w.word);
  const surface = whole ? w.word : stem;
  const at = ja.indexOf(surface);
  let parts = align(w.word, kana);
  if (at < 0 || !parts) return null;
  if (!whole) {
    // Only the part up to the last kanji (食べる → 食, conjugated in the sentence).
    let n = 0;
    parts = parts.filter(([t]) => { const keep = n < surface.length; n += t.length; return keep; });
  }
  // Words the list spells without their usual okurigana, written with it in
  // the sentence (堅い, 落ちる): the reading of their last kanji there.
  const own = OWN_READING[`${w.word}|${w.kana}`];
  if (own) parts[parts.length - 1][1] = own;
  return { at, end: at + surface.length, spans: spans(parts, at) };
}

// The sentence with furigana: the word gets its own reading from the list,
// the rest kuromoji's (read as one sentence, so 一日中 stays いちにちじゅう).
function exampleMarkup(w, ja) {
  const own = wordSpans(w, ja);
  const all = kuromojiSpans(ja);
  if (!own) return markup(all.map(([, t, r]) => [t, r]));
  const out = [];
  for (const [at, t, r] of all) {
    const end = at + t.length;
    if (end <= own.at || at >= own.end) out.push([at, t, r]);
    else {
      // Overlaps the word: keep only what lies outside it, without furigana.
      if (at < own.at) out.push([at, t.slice(0, own.at - at), null]);
      if (end > own.end) out.push([own.end, t.slice(own.end - at), null]);
    }
  }
  out.push(...own.spans);
  out.sort((a, b) => a[0] - b[0]);
  return FURIGANA_FIXES.reduce((m, [from, to]) => m.split(from).join(to), markup(out.map(([, t, r]) => [t, r])));
}

// Where kuromoji reads the word otherwise than the list (a sentence that
// uses another word written the same way), for checking by hand.
export function readingClashes(w, ja) {
  const own = wordSpans(w, ja);
  if (!own) return null;
  const theirs = kuromojiSpans(ja).filter(([at, t]) => at >= own.at && at + t.length <= own.end && [...t].some(isKanji));
  const a = own.spans.filter(([, t]) => [...t].some(isKanji)).map(([, t, r]) => t + (r || '')).join('');
  const b = theirs.map(([, t, r]) => t + (r || '')).join('');
  return a === b ? null : `${w.word}|${w.kana}: list ${a}, kuromoji ${b} — ${ja}`;
}

function example(w) {
  const ex = EXAMPLES.get(`${w.word}|${w.kana}`);
  if (!ex) throw new Error(`guess_examples.tsv: no sentence for ${w.word}|${w.kana}`);
  return [exampleMarkup(w, ex.ja), ex.en];
}

const round = x => Math.round(x * 100) / 100;
const rows = words.map(w => {
  const share = Math.min(...w.split.map(([ch, r]) => readingShare(ch, r, deck)));
  const rLevel = Math.min(1, share / 0.05);
  const gloss = stems(w.meaning);
  const units = [...new Set(w.split.map(([ch]) => ch))];
  const mLevel = units.filter(ch => [...stems((KD[ch] && KD[ch].m || []).join(' '))].some(s => gloss.has(s))).length / units.length;
  const row = [w.word, w.kana, w.meaning, w.level, w.split.map(([c, r]) => `${c}:${r}`).join(' '), round(rLevel), round(mLevel)];
  return row.concat([partOfSpeech(w)], example(w));
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
  // an example sentence (furigana as {漢字|かんじ}) and its English].
  // The pieces, levels and kanji meanings come from KANJIDIC2 and JMdict by
  // the Electronic Dictionary Research and Development Group, licensed under
  // Creative Commons Attribution-ShareAlike 4.0
  // (https://www.edrdg.org/edrdg/licence.html), via GuessWithAnki
  // (https://github.com/BlaiseLabs/GuessWithAnki, MIT); the parts of speech
  // from JMdict via OpenJLPT (https://github.com/evanclan/OpenJLPT,
  // CC BY-SA 4.0). The example sentences are Tokidoki's own
  // (scripts/guess_examples.tsv).

  global.GUESS_WORDS = [
${rows.map(r => '    ' + JSON.stringify(r)).join(',\n')}
  ];

  global.GUESS_KANJI_MEANINGS = ${JSON.stringify(kanjiMeanings)};
})(typeof window !== 'undefined' ? window : globalThis);
`;
fs.writeFileSync(OUT, js);
const withPos = rows.filter(r => r[7]).length;
console.log(`${rows.length} of ${total} kanji words split (${guessable} guessable, ${withPos} with a part of speech), ${Object.keys(kanjiMeanings).length} kanji → ${path.relative(ROOT, OUT)}`);

if (process.env.GUESS_CLASHES) words.forEach(w => { const c = readingClashes(w, EXAMPLES.get(`${w.word}|${w.kana}`).ja); if (c) console.log(c); });
