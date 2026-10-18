// Dictionary forms for the Conversation starters' hints, so the page can
// tell when an answer uses one in any form (conversation.js, with
// jp-deinflect.js). Writes conversation-words.js:
//
//   source  a hash of conversation-data.js (test_conversation.js checks it)
//   hints   { 'topic:level:step-i': [[dictionary form, its reading], …] } —
//           the content words of each word / verb hint, in order:
//           泳[およ]ぎました → [['泳ぐ', 'およぐ']], 背[せ]が高[たか]い →
//           [['背', 'せ'], ['高い', 'たかい']]
//   words   [[dictionary form, reading], …] — every content word on the
//           page (questions, hints, examples, sample answers), which the
//           page uses to split answers into words
//
// kuromoji isn't a site dependency; install it just for the build:
//   npm install --no-save kuromoji
// Re-run after changing conversation-data.js:
//   node scripts/build_conversation_words.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { ROOT, loadSiteData, kata2hira } from './jp_words.mjs';

const require = createRequire(path.join(process.cwd(), 'x.js'));
const kuromoji = require('kuromoji');
const C = require(path.join(ROOT, 'conversation.js'));

const DATA = 'conversation-data.js';
const { CONVERSATION_TOPICS: TOPICS } = loadSiteData([DATA]);
const source = createHash('sha1').update(readFileSync(path.join(ROOT, DATA))).digest('hex').slice(0, 16);

const tokenizer = await new Promise((resolve, reject) =>
  kuromoji.builder({ dicPath: path.join(path.dirname(require.resolve('kuromoji')), '..', 'dict') })
    .build((err, t) => (err ? reject(err) : resolve(t))));

const CONTENT = new Set(['名詞', '動詞', '形容詞', '副詞', '連体詞', '接頭詞', '感動詞', '接続詞']);
// Words that carry the meaning: not particles or endings, and not helper
// verbs and suffixes (住んでいる's いる, 学生さん's さん).
// Helper verbs that add meaning stay (食べてみる, 作ってくれる); いる / ある don't.
const isContent = m => CONTENT.has(m.pos) && !['接尾', '数'].includes(m.pos_detail_1)
  && !(m.pos_detail_1 === '非自立' && (m.pos !== '動詞' || ['いる', 'ある', 'おく', 'くる', 'いく'].includes(m.basic_form)))
  || (m.pos === '名詞' && m.pos_detail_1 === '接尾' && /[㐀-鿿]/.test(m.surface_form));  // 〜歳, 〜円, 〜派

// The reading of a dictionary form (kuromoji reads the surface).
const readingCache = new Map();
function readingOf(word) {
  if (!readingCache.has(word)) readingCache.set(word, kata2hira(tokenizer.tokenize(word).map(m => m.reading || m.surface_form).join('')));
  return readingCache.get(word);
}

// Content words of a plain text, as [dictionary form, reading].
function lemmas(text, readings) {
  const out = [];
  for (const m of tokenizer.tokenize(text)) {
    if (!isContent(m)) continue;
    const base = m.basic_form && m.basic_form !== '*' ? m.basic_form : m.surface_form;
    // Prefer the page's own furigana for the reading (日本[にほん], not にっぽん).
    let kana = base === m.surface_form ? kata2hira(m.reading || m.surface_form) : readingOf(base);
    if (readings && readings.has(base)) kana = readings.get(base);
    // Kind, so a noun isn't matched by a verb that reads the same: v, a or n.
    const kind = m.pos === '動詞' ? 'v' : m.pos === '形容詞' ? 'a' : 'n';
    out.push([base, kana, kind]);
  }
  return out;
}

// The page's furigana: kanji spelling → reading, for words written as one run.
const readings = new Map();
const markups = [];
TOPICS.forEach(t => C.LEVELS.forEach(level => {
  const d = C.levelData(t, level);
  markups.push(d.q.ja, d.answer.ja, ...C.hintItems(d).flatMap(h => [h.ja, h.ex || '']));
}));
markups.forEach(m => C.pieces(m).forEach(p => { if (p.r && !readings.has(p.t)) readings.set(p.t, p.r); }));

const hints = {};
TOPICS.forEach(t => C.LEVELS.forEach(level => {
  C.hintItems(C.levelData(t, level)).forEach(h => {
    if (h.step === 'grammar' || h.step === 'start') return;
    const text = C.plain(h.ja).replace(/[〜~]/g, '');
    let ls = lemmas(text, readings);
    // Words kuromoji counts as helper nouns (うち "home"): the word itself.
    if (!ls.length) ls = [[text, C.kana(h.ja).replace(/[〜~]/g, ''), 'n']];
    hints[`${t.id}:${level}:${h.id}`] = ls;
  });
}));

const seen = new Map();
markups.forEach(m => lemmas(C.plain(m), readings).forEach(([b, k]) => { if (!seen.has(b + '|' + k)) seen.set(b + '|' + k, [b, k]); }));
Object.values(hints).flat().forEach(([b, k]) => { if (!seen.has(b + '|' + k)) seen.set(b + '|' + k, [b, k]); });
// Compounds the furigana writes as one run (掃除機[そうじき], 商店街[しょうてんがい]),
// which kuromoji splits, and each word hint as a whole.
const addWord = (b, k) => { if (b && k && !seen.has(b + '|' + k)) seen.set(b + '|' + k, [b, k]); };
// Not ones that start with a number (二年前, 五千円): those are a number and words.
markups.forEach(m => C.pieces(m).forEach(p => { if (p.r && p.t.length >= 2 && !/^[一二三四五六七八九十百千万何数]/.test(p.t)) addWord(p.t, p.r); }));
TOPICS.forEach(t => C.LEVELS.forEach(level => C.hintItems(C.levelData(t, level)).forEach(h => {
  if (h.step === 'grammar' || h.step === 'start' || /[〜~\s]/.test(h.ja)) return;
  addWord(C.plain(h.ja), C.kana(h.ja));
})));
const words = [...seen.values()].sort((a, b) => a[0].localeCompare(b[0], 'ja'));

const out = `// Made by scripts/build_conversation_words.mjs from ${DATA} — don't edit by hand.
// Dictionary forms of the Conversation starters' hints, and the page's words.
(function (global) {
  global.CONVERSATION_WORDS = {
    source: ${JSON.stringify(source)},
    hints: ${JSON.stringify(hints)},
    words: ${JSON.stringify(words)},
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = global.CONVERSATION_WORDS;
})(typeof window !== 'undefined' ? window : globalThis);
`;
writeFileSync(path.join(ROOT, 'conversation-words.js'), out);
console.log(`conversation-words.js: ${Object.keys(hints).length} hints, ${words.length} words`);
