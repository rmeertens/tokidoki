#!/usr/bin/env node
// Build news-words.js from news-data.js: every headline and sentence of every
// news story, at every level, split into words (each linked to a dictionary
// entry) plus the grammar it uses, so tapping a sentence on the News page can
// explain it word by word — the same as the Phrases pages.
//
// Words come from jp_words.mjs, with news_extra_words.json for names and
// news vocabulary the site's lists don't have. Grammar comes from the rules
// in jp_grammar.mjs plus NEWS_RULES below, for the written expressions news
// is full of (〜によると, 〜おそれがある, 〜とみられる…).
//
// Usage (kuromoji isn't a site dependency, so install it just for this):
//   npm install --no-save kuromoji
//   node scripts/tokenize_news.mjs [--misses]
// test_news.js fails when the news and this file drift apart.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT, createWordFinder, loadSiteData } from './jp_words.mjs';
import { GRAMMAR_EXTRA, detectGrammar } from './jp_grammar.mjs';

const { NEWS_ITEMS, STORY_GRAMMAR } = loadSiteData(['news-data.js', 'stories-data.js', 'mystery-words.js', 'memes-data.js', 'memes-data-2.js']);

const readJson = f => JSON.parse(readFileSync(path.join(ROOT, 'scripts', f), 'utf8'));
// Dates and percentages kuromoji splits apart; keep them whole.
const NEWS_WHOLE = ['10月', '4月', '1%案', '1%分', '8%', '1%', '0%'];
const { segment } = await createWordFinder({
  extra: { ...readJson('phrase_extra_words.json'), ...readJson('news_extra_words.json') },
  whole: [...readJson('phrase_whole_words.json'), ...NEWS_WHOLE],
});

// Written-style grammar the Stories notes don't cover, in the same shape.
const GRAMMAR_NEWS = {
  'to-iu-report': { level: 'N3', title: '〜という — "reportedly"', pattern: 'Plain form + という。', note: 'Ending a news sentence with という passes on what someone else said: 可能性は低いという "it is said the chances are low". Often paired with 〜によると.' },
  'osore-ga-aru': { level: 'N3', title: '〜おそれがある — "there is a risk that"', pattern: 'Verb plain form / Noun + の + おそれがある', note: 'A formal warning that something bad could happen: 波が高くなるおそれがある "the waves could get high". Only used for bad outcomes.' },
  'to-mirareru': { level: 'N3', title: '〜とみられる — "is thought to"', pattern: 'Plain form + とみられる', note: 'A careful guess in news writing: 多いとみられる "is expected to be many". The writer avoids stating it as fact.' },
  'mikomi': { level: 'N3', title: '〜見込みだ — "is expected to"', pattern: 'Verb plain form + 見込みだ', note: 'What is forecast or planned to happen: 達する見込みだ "is expected to reach". Common in weather and economic news.' },
  'utagai': { level: 'N3', title: '〜疑いがある — "is suspected of"', pattern: 'Plain form + 疑いがある', note: 'Something not yet proven: 決めていた疑いがある "is suspected of having decided". News uses it until a court decides.' },
  'to-shite-iru': { level: 'N3', title: '〜としている — "says / takes the position"', pattern: 'Quote / plain form + としている', note: 'How the news reports an organisation\'s official line: 「協力する」としている "says it will cooperate".' },
  'to-shite': { level: 'N3', title: '〜として — "saying that / as"', pattern: 'Quote + として', note: 'Gives the reason or claim behind an action: 「議論が必要だ」として反発 "objects, saying debate is needed".' },
  'naka': { level: 'N3', title: '〜中 — "amid, while"', pattern: 'Verb plain form + 中(で)', note: 'The situation in which something happens: 値上げが続く中 "as prices keep rising".' },
  'koto-kara': { level: 'N3', title: '〜ことから — "because (of the fact that)"', pattern: 'Plain form + ことから', note: 'A written way to give a reason, often based on a fact: 時間がかかることから "since it takes time".' },
  'tame-reason': { level: 'N3', title: '〜ため — "because" (written)', pattern: 'Plain form / Noun + の + ため', note: 'In news and notices ため gives a reason, like から: 時間がかかるため "because it takes time". With a verb of intent it means "in order to" instead.' },
  'masu-stem-and': { level: 'N3', title: 'ます-stem + 、 — "and" (written)', pattern: 'Verb ます-stem + 、', note: 'Written Japanese often joins two sentences with the ます-stem instead of the て-form: 変え、 = 変えて、 "changes …, and".' },
  'te-ori': { level: 'N3', title: '〜ており — written 〜ていて', pattern: 'Verb て-form + おり', note: 'The formal, written version of 〜ていて: 反発しており "is objecting, and…".' },
  'ippou-conj': { level: 'N3', title: '一方 — "on the other hand"', pattern: '一方、 + sentence', note: 'At the start of a sentence, 一方 turns to a contrasting side of the story: 一方、野党は… "the opposition, meanwhile, …".' },
  'sai': { level: 'N3', title: '〜際 — "when" (formal)', pattern: 'Verb plain form / Noun + の + 際(は / に)', note: 'A formal とき, common in news and notices: 釣りをする際は "when fishing".' },
};
const GRAMMAR = { ...STORY_GRAMMAR, ...GRAMMAR_EXTRA, ...GRAMMAR_NEWS };

// Patterns found in the text. `rx` matches the grammar itself; the snippet
// shown on the page also takes in the word before it (`back` words, default
// 1), so 多いとみられる rather than とみられる. Points the shared rules found
// in the same stretch of text (`replaces`) are dropped, since they're the
// same words misread — the よると of 〜によると isn't 〜と "when".
const NEWS_RULES = [
  { id: 'ni-yoru-to', rx: /によると/, replaces: ['ni-particle', 'to-conditional'] },
  { id: 'to-iu-report', rx: /という(?=。)/, replaces: ['to-iu-name', 'to-quote', 'plain-form'] },
  { id: 'osore-ga-aru', rx: /おそれがあ(?:る|ります)/, back: 2, replaces: ['plain-form'] },
  { id: 'to-mirareru', rx: /とみられ(?:る|ます)/, replaces: ['to-quote', 'passive'] },
  { id: 'mikomi', rx: /見込み/ },
  { id: 'utagai', rx: /疑いがあ(?:る|ります)/, back: 2, replaces: ['plain-form', 'masu', 'ga-subject'] },
  { id: 'to-shite-iru', rx: /としている/, back: 0, replaces: ['to-quote', 'te-iru'] },
  { id: 'to-shite', rx: /として(?!い)/, back: 0 },
  { id: 'naka', rx: /中(?=、)/ },
  { id: 'koto-kara', rx: /ことから/, replaces: ['kara-from'] },
  { id: 'tame-reason', rx: /ため(?![にの])/, replaces: ['tame-ni'] },
  { id: 'te-ori', rx: /ており/, replaces: ['te-sequence'] },
  { id: 'ippou-conj', rx: /^一方(?=、)/, back: 0 },
  { id: 'sai', rx: /際(?=[はに、])/ },
  { id: 'toki', rx: /とき(?=[はに、])/, replaces: ['ni-particle'] },
  { id: 'tari', rx: /[たださ]り[^。]*たりする/, replaces: [] },
  { id: 'you-ni-suru', rx: /ようにしましょう/, replaces: ['ni-suru-choice', 'mashou'] },
  { id: 'sou-looks', rx: /そうです/, replaces: ['desu'] },
  { id: 'kamoshirenai', rx: /かもしれません/, back: 2, replaces: ['masen'] },
  { id: 'to-quote', rx: /ないと(?=言|話|強調)/, back: 0, replaces: ['to-conditional'] },
  { id: 'ni-tsuite', rx: /について/ },
];

const isPunct = p => !p.key && /^[、。「」　\s]+$/.test(p.src.replace(/\[[^\]]*\]/g, ''));

function newsGrammar(morphs, plain, pieces) {
  let g = detectGrammar(morphs, plain, GRAMMAR);
  for (const rule of NEWS_RULES) {
    const m = rule.rx.exec(plain);
    if (!m) continue;
    const coreFrom = m.index, coreTo = m.index + m[0].length;
    if (rule.replaces) {
      g = g.filter(([id, snippet]) => {
        if (!rule.replaces.includes(id)) return true;
        // Dropped if any place the snippet occurs overlaps the match.
        for (let at = plain.indexOf(snippet); at !== -1; at = plain.indexOf(snippet, at + 1)) {
          if (at < coreTo && at + snippet.length > coreFrom) return false;
        }
        return true;
      });
    }
    if (g.some(([id]) => id === rule.id)) continue;
    let k = pieces.findIndex(p => p.from <= coreFrom && coreFrom < p.to);
    for (let n = rule.back === undefined ? 1 : rule.back; n > 0 && k > 0 && !isPunct(pieces[k - 1]); n--) k--;
    const from = Math.min(coreFrom, pieces[k] ? pieces[k].from : coreFrom);
    g.push([rule.id, plain.slice(from, coreTo)]);
  }
  // Written Japanese joins sentences with the ます-stem: 変え、 for 変えて、.
  const i = morphs.findIndex((m, j) => m.pos === '動詞' && m.pos_detail_1 === '自立' && !['いる', 'おる', 'ある'].includes(m.basic_form) && m.conjugated_form === '連用形' && morphs[j + 1] && morphs[j + 1].surface_form === '、');
  if (i !== -1) {
    const p = pieces.find(q => q.from <= morphs[i].from && morphs[i].from < q.to);
    g.push(['masu-stem-and', plain.slice(p.from, p.to)]);
  }
  return g;
}

// ─── Build ───────────────────────────────────────────────────────────────────

const gloss = {};
const grammarUsed = new Set();
const lines = {};
const misses = new Map();

function analyse(id, markup) {
  const { pieces, morphs, plain } = segment(markup);
  const words = [];
  pieces.forEach(({ src, key }) => {
    if (key && key.miss) {
      if (key.miss.length > 1) misses.set(key.miss, (misses.get(key.miss) || []).concat(id));
      words.push(src);
    } else if (key) {
      gloss[key[0]] = key[1];
      words.push([src, key[0]]);
    } else words.push(src);
  });
  const w = words.reduce((acc, t) => {
    if (typeof t === 'string' && typeof acc[acc.length - 1] === 'string') acc[acc.length - 1] += t;
    else acc.push(t);
    return acc;
  }, []);
  const g = newsGrammar(morphs, plain, pieces);
  g.forEach(([gid]) => {
    if (!GRAMMAR[gid]) throw new Error(`unknown grammar id ${gid}`);
    grammarUsed.add(gid);
  });
  lines[id] = { w, g };
}

for (const item of NEWS_ITEMS) {
  for (const [level, v] of Object.entries(item.levels)) {
    analyse(`${item.id}:${level}:t`, v.title);
    v.lines.forEach((l, i) => analyse(`${item.id}:${level}:${i}`, l[0]));
  }
}

const sorted = o => Object.fromEntries(Object.keys(o).sort().map(k => [k, o[k]]));
const grammar = sorted(Object.fromEntries([...grammarUsed].map(id => [id, GRAMMAR[id]])));
const js = `// Generated by scripts/tokenize_news.mjs from news-data.js — do not edit.
// NEWS_WORDS.lines['<story id>:<level>:<n>'] (sentence n) or
// ['<story id>:<level>:t'] (the headline) is { w, g }: w lists the sentence's
// pieces — a string is plain text, [markup, key] a word whose [reading,
// meaning, part of speech] is gloss[key] — and g lists its grammar as
// [id, snippet], explained in grammar[id].
(function (global) {
  'use strict';
  global.NEWS_WORDS = ${JSON.stringify({ gloss: sorted(gloss), grammar, lines })};
})(typeof window !== 'undefined' ? window : globalThis);
`;
writeFileSync(path.join(ROOT, 'news-words.js'), js);
console.log(`${Object.keys(lines).length} sentences, ${Object.keys(gloss).length} words, ${grammarUsed.size} grammar points; ${misses.size} words not found`);
if (process.argv.includes('--misses')) [...misses].forEach(([k, ids]) => console.log(k, ids.length, ids[0]));
