#!/usr/bin/env node
// Build listening-words.js from the listening questions (listening-data*.js):
// every line of every script — the intro, the conversation, the question and
// the spoken or printed choices — split into words, each linked to a
// dictionary entry, so a word tapped in the Listening script can show its
// reading and meaning (as on the Stories and News pages).
// The splitting and lookup live in jp_words.mjs.
//
// Lines are keyed by their markup, not by position: listening.js rotates each
// question's choices, and the same reply often turns up in several questions.
//
// Usage (kuromoji isn't a site dependency, so install it just for this):
//   npm install --no-save kuromoji
//   node scripts/tokenize_listening.mjs [--misses]
// Missing words go in scripts/listening_extra_words.json. test_listening.js
// fails when the questions and listening-words.js drift apart.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ROOT, createWordFinder, loadSiteData } from './jp_words.mjs';

const require = createRequire(import.meta.url);
const json = f => JSON.parse(readFileSync(path.join(ROOT, 'scripts', f), 'utf8'));

// Words neither list has (or has with a different sense): [reading, meaning,
// part of speech]. This page's own list wins over the other pages' lists.
const EXTRA = Object.assign({}, json('sentence_extra_words.json'), json('story_fill_extra_words.json'),
  json('listening_extra_words.json'));

// Kuromoji splits these oddly in kana-heavy speech; keep them whole.
const WHOLE = ['かもしれない', 'かもしれません', 'すみません', 'ありがとうございます', 'いらっしゃいませ', 'いってらっしゃい',
  'おはようございます', 'こんにちは', 'こんばんは', 'あさって', 'スマホ', '主に', '道理で', '見積書', '乗り方', '選び方', '書き方', '受け方', '二十四分'];
const { segment, lookup } = await createWordFinder({ extra: EXTRA, whole: WHOLE });

// Words kuromoji links to the wrong entry, told apart by the line's own
// furigana: '<entry>|<reading of its first kanji>' → the right entry.
const FIXES = {
  '後|あと': ['後(あと)', ['あと', 'after, later; (あと + amount) … more, … left', 'noun']],
  '開く|あ': ['開く(あく)', ['あく', 'to open (a shop opens, a door opens)', 'verb']],
  '空く|あ': ['空く(あく)', ['あく', 'to be free, to be vacant (席が空いている: the seat is free)', 'verb']],
  '方|かた': ['方(かた)', ['かた', 'person (polite: この方, ほかの方); (〜方) way of …ing', 'noun']],
  '入る|い': ['入る(いる)', ['いる', 'to go in (気に入る: to like)', 'verb']],
  '入れる|はい': ['入れる(はいれる)', ['はいれる', 'can go in, can enter', 'verb (potential)']],
  '何|なん': ['何(なん)', ['なん', 'what (read なん before d, n and t sounds: 何ですか, 何の, 何と)', 'question word']],
  '何で|なに': ['何で(なにで)', ['なにで', 'by what means, how (何で行きますか: how will you get there?)', 'question word']],
  '五分|ごぶ': ['五分(ごぶ)', ['ごぶ', '.5 of a degree (三十七度五分: 37.5 °C)', 'number']],
  '行う|い': lookup('行く', 'いく'),
  '降りる|ふ': lookup('降る', 'ふる'),
  '通う|とお': lookup('通る', 'とおる'),
};
function fixed(key, src) {
  const m = /[㐀-䶿一-鿿々〆ヶ]+\[([^\]]+)\]/.exec(src);
  if (!m) return key;
  const hit = Object.keys(FIXES).find(f => f.split('|')[0] === key[0] && m[1].startsWith(f.split('|')[1]));
  return hit ? FIXES[hit] : key;
}

const files = ['listening-data.js', ...[2, 3, 4, 5, 6, 7, 8, 9].map(n => `listening-data-${n}.js`)];
const { LISTENING_SECTIONS: SECTIONS } = loadSiteData(files);
const L = require(path.join(ROOT, 'listening.js'));

// Every line the script shows, with the question it's from.
const texts = new Map();
const add = (markup, where) => { if (markup && !texts.has(markup)) texts.set(markup, where); };
for (const section of SECTIONS) {
  for (const item of section.items) {
    const where = L.audioKey(section, item);
    add(item.intro, where);
    (item.lines || []).forEach(l => add(l.ja, where));
    add(L.questionOf(item), where);
    add(item.question, where);
    item.choices.forEach(c => add(c.ja, where));
  }
}

// ─── Numbers with a counter ──────────────────────────────────────────────────
// 四十五分, 十時半, 何番線, 千五百円… are glossed here rather than listed one
// by one: the reading is the line's own furigana, the meaning comes from the
// counter.
const DIGITS = { 〇: 0, 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
const UNITS = { 十: 10, 百: 100, 千: 1000, 万: 10000 };
function kanjiNumber(s) {
  if (/^[0-9]+$/.test(s)) return Number(s);
  if (!/^[〇一二三四五六七八九十百千万]+$/.test(s)) return null;
  let total = 0, part = 0, digit = 0;
  for (const c of s) {
    if (c in DIGITS) digit = digit * 10 + DIGITS[c];
    else if (c === '万') { total += (part + digit) * 10000; part = 0; digit = 0; }
    else { part += (digit || 1) * UNITS[c]; digit = 0; }
  }
  return total + part + digit;
}
const ord = n => n + ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 100 > 10 && n % 100 < 14 ? 0 : n % 10] || 'th');
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
// counter → [meaning of N, meaning of 何], longest first.
const COUNTERS = [
  ['か月後', n => `${plural(n, 'month', 'months')} later`],
  ['週間後', n => `${plural(n, 'week', 'weeks')} later`],
  ['階建て', n => `${n}-storey (building)`],
  ['分おき', n => `every ${n} minutes`],
  ['名様', n => `${n} (people — polite, said by staff)`],
  ['時ごろ', n => `around ${n} o'clock`],
  ['時半', n => `half past ${n}`],
  ['時間', n => plural(n, 'hour', 'hours'), 'how many hours'],
  ['週間', n => plural(n, 'week', 'weeks')],
  ['番線', n => `platform ${n}`, 'which platform'],
  ['号室', n => `room ${n}`],
  ['回目', n => `the ${ord(n)} time`],
  ['年生', n => `${ord(n)}-year student`],
  ['日目', n => `day ${n}, the ${ord(n)} day`],
  ['分後', n => `${plural(n, 'minute', 'minutes')} later`],
  ['円', n => `${n.toLocaleString('en')} yen`, 'how many yen'],
  ['時', n => `${n} o'clock`, 'what time'],
  ['分', n => `${plural(n, 'minute', 'minutes')}; :${String(n).padStart(2, '0')} on the clock`, 'how many minutes'],
  ['日', n => `the ${ord(n)} (of the month); ${plural(n, 'day', 'days')}`, 'what day of the month; how many days'],
  ['階', n => `the ${ord(n)} floor`, 'which floor'],
  ['番', n => `number ${n}`, 'what number'],
  ['枚', n => `${n} (flat things: sheets, tickets, plates)`, 'how many (flat things)'],
  ['人', n => plural(n, 'person', 'people'), 'how many people'],
  ['匹', n => `${n} (small animals)`, 'how many (animals)'],
  ['羽', n => `${n} (birds)`, 'how many (birds)'],
  ['冊', n => plural(n, 'book', 'books'), 'how many (books)'],
  ['本', n => `${n} (long things: bottles, pens, trains)`, 'how many (long things)'],
  ['度', n => `${n} degrees`],
  ['駅', n => plural(n, 'station', 'stations')],
];
function numberGloss(word, reading) {
  for (const [counter, mean, what] of COUNTERS) {
    if (!word.endsWith(counter)) continue;
    const num = word.slice(0, -counter.length);
    if (num === '何' && what) return [reading, what, 'question word'];
    const n = kanjiNumber(num);
    if (n !== null) return [reading, mean(n), 'number'];
  }
  // Digits of a phone number, read out one by one.
  if (/^[0-9〇一二三四五六七八九]{3,}$/.test(word)) return [reading, 'digits of a phone number, read one by one', 'number'];
  return null;
}
const readingOf = src => src.replace(/[㐀-䶿一-鿿々〆ヶ]+\[([^\]]+)\]/g, '$1').replace(/ /g, '');

const gloss = {};
const lines = {};
const misses = new Map();
for (const [markup, where] of [...texts].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
  const out = [];
  segment(markup).pieces.forEach(({ src, key: found }) => {
    const key = Array.isArray(found) ? fixed(found, src) : found;
    const num = key && key.miss && numberGloss(key.miss, readingOf(src));
    if (num) {
      gloss[key.miss] = num;
      out.push([src, key.miss]);
    } else if (key && key.miss) {
      misses.set(key.miss, (misses.get(key.miss) || []).concat(where));
      // MISS_CONTEXT=1 shows where each missing word is.
      if (process.env.MISS_CONTEXT) console.error(key.miss, `«${src}»`, markup.slice(0, 60));
      out.push(src);
    } else if (key) {
      gloss[key[0]] = key[1];
      out.push([src, key[0]]);
    } else out.push(src);
  });
  // Join runs of plain (unlinked) text.
  lines[markup] = out.reduce((acc, t) => {
    if (typeof t === 'string' && typeof acc[acc.length - 1] === 'string') acc[acc.length - 1] += t;
    else acc.push(t);
    return acc;
  }, []);
}

// Compact, since the page loads it: the glossary is a list, and each line,
// keyed by the hash of its markup (Listening.lineKey), is a flat list of
// numbers — a word is its length in the markup and its glossary index, plain
// text between words is minus its length.
const keys = Object.keys(gloss).sort();
const index = new Map(keys.map((k, i) => [k, i]));
const packed = {};
for (const [markup, pieces] of Object.entries(lines)) {
  const id = L.lineKey(markup);
  if (packed[id]) throw new Error(`Two lines share the key ${id}: ${markup}`);
  packed[id] = pieces.flatMap(t => (typeof t === 'string' ? [-t.length] : [t[0].length, index.get(t[1])]));
}
const js = `// Generated by scripts/tokenize_listening.mjs from listening-data*.js — do not edit.
// gloss: [key, reading, meaning, part of speech] per word. lines[id], id the
// hash of a script line's markup (Listening.lineKey): the line as numbers —
// a word is its length in the markup and its index in gloss, plain text in
// between is minus its length (Listening.wordsOf decodes it). listening.js
// loads this file the first time a script is shown.
(function (global) {
  'use strict';
  global.LISTENING_WORDS = {
    gloss: ${JSON.stringify(keys.map(k => [k, ...gloss[k]]))},
    lines: ${JSON.stringify(packed)},
  };
})(typeof window !== 'undefined' ? window : globalThis);
`;
writeFileSync(path.join(ROOT, 'listening-words.js'), js);
const missList = [...misses].sort((a, b) => b[1].length - a[1].length);
console.log(`listening-words.js: ${texts.size} lines, ${keys.length} words; ${missList.length} not found`);
if (process.argv.includes('--misses')) missList.forEach(([k, ids]) => console.log(k, ids.length, ids[0]));
