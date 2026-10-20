#!/usr/bin/env node
// Build sentence-chunks.js: the Sentences page's sentences in chunks by
// JLPT level and grammar point, from the grammar sentences-words.js found
// in each sentence (scripts/tokenize_sentences.mjs).
//
// A sentence goes in the first chunk of PRIORITY that has one of its grammar
// points, so it lands with the hardest thing it practises: 先生に書かせられ
// ました is causative-passive practice, not past tense. Chunks bigger than
// MAX are cut into parts (Past tense 1, 2, …) in the sentences' own order.
//
//   node scripts/build_sentence_chunks.mjs           write sentence-chunks.js
//   node scripts/build_sentence_chunks.mjs --check   fail if it's stale
// Re-run after tokenize_sentences.mjs; test_sentences.js fails if it's stale.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'sentence-chunks.js');
const MAX = 60;

const box = { window: {} };
vm.createContext(box);
for (const f of ['sentences-data.js', 'sentences-words.js']) vm.runInContext(readFileSync(path.join(ROOT, f), 'utf8'), box);
const { TRANSLATE_SENTENCES, SENTENCE_WORDS } = box.window;

// In page order. `grammar` is the grammar ids (jp_grammar.mjs and
// SENTENCE_RULES) that put a sentence here.
export const CHUNKS = [
  { id: 'n5-desu', level: 'N5', title: 'です sentences', sub: 'X は Y です, this / that, questions', grammar: ['desu', 'deshita', 'dewa-arimasen', 'da-plain'] },
  { id: 'n5-masu', level: 'N5', title: 'Verbs: 〜ます / 〜ません', sub: 'present, invitations, let\'s', grammar: ['masu', 'masen', 'masen-ka', 'mashou', 'mashou-ka'] },
  { id: 'n5-past', level: 'N5', title: 'Past: 〜ました / 〜ませんでした', sub: 'what happened', grammar: ['masu-past', 'masen-deshita'] },
  { id: 'n5-adjectives', level: 'N5', title: 'Adjectives & likes', sub: '〜い / 〜な, 好き, comparing', grammar: ['i-adj-desu', 'i-adj-neg', 'i-adj-noun', 'i-adj-past', 'na-adj-noun', 'kute', 'ku-naru', 'ga-suki', 'no-ga-suki', 'hou-ga', 'dochira', 'gurai'] },
  { id: 'n5-te', level: 'N5', title: 'て-form: please, may, mustn\'t', sub: '〜てください, 〜てもいい, 〜て…', grammar: ['te-kudasai', 'naide-kudasai', 'te-mo-ii', 'te-wa-ikenai', 'te-sequence'] },
  { id: 'n5-te-iru', level: 'N5', title: '〜ている', sub: 'doing now, wearing, living…', grammar: ['te-iru'] },
  { id: 'n5-plain', level: 'N5', title: 'Plain forms', sub: '〜ない, 〜た, 〜たり, 〜と言う', grammar: ['nai-plain', 'ta-plain', 'tari', 'to-iu', 'koto-ga-dekiru', 'plain-form'] },
  { id: 'n4-wants', level: 'N4', title: 'Wants, plans & experiences', sub: '〜たい, 〜つもり, 〜たことがある', grammar: ['tai', 'tagaru', 'te-hoshii', 'tsumori', 'volitional', 'volitional-to-omou', 'ta-koto-ga-aru', 'to-ii', 'ni-iku-purpose', 'nai-invitation'] },
  { id: 'n4-thinking', level: 'N4', title: 'Thoughts & guesses', sub: '〜と思う, 〜かもしれない, 〜そう', grammar: ['to-omou', 'deshou', 'kamoshirenai', 'mitai', 'sou-looks', 'embedded-question', 'kadouka', 'n-desu', 'tte', 'to-iu-name'] },
  { id: 'n4-potential', level: 'N4', title: 'Can do: potential', sub: '食べられる, 話せる…', grammar: ['potential'] },
  { id: 'n4-giving', level: 'N4', title: 'Giving & receiving favours', sub: '〜てあげる, 〜てくれる, 〜てもらう', grammar: ['te-ageru', 'te-kureru', 'te-morau', 'te-itadakemasen-ka', 'te-kurete-arigatou'] },
  { id: 'n4-te-forms', level: 'N4', title: 'More て-form patterns', sub: '〜てしまう, 〜ておく, 〜てみる…', grammar: ['te-shimau', 'te-oku', 'te-aru', 'te-miru', 'te-kara', 'te-mo', 'te-yokatta', 'te-sumimasen', 'naide', 'nagara'] },
  { id: 'n4-conditionals', level: 'N4', title: 'If & when', sub: '〜ば, 〜たら, 〜と, 〜とき', grammar: ['ba-conditional', 'ba-yokatta', 'tara', 'tara-dou', 'to-conditional', 'nara', 'toki', 'mae-ni', 'aida-ni'] },
  { id: 'n4-advice', level: 'N4', title: 'Advice, rules & reasons', sub: '〜た方がいい, 〜なければ, 〜ので', grammar: ['hou-ga-ii', 'nakereba-naranai', 'nakute-mo-ii', 'nasai', 'kara-reason', 'node', 'shi', 'sugiru'] },
  { id: 'n4-change', level: 'N4', title: 'Change & comparison', sub: '〜になる, より, 一番, 〜のような', grammar: ['ni-naru', 'adj-suru', 'yori', 'no-naka-de-ichiban', 'no-you-na', 'mo-emphasis'] },
  { id: 'n4-keigo', level: 'N4', title: 'Honorific & humble speech', sub: 'いらっしゃる, お〜になる, 申す…', grammar: ['sonkeigo', 'o-ni-naru', 'o-honorific', 'kenjougo', 'kenjougo-humble'] },
  { id: 'n3-passive', level: 'N3', title: 'Passive', sub: '〜られる: is done (by)', grammar: ['passive'] },
  { id: 'n3-causative', level: 'N3', title: 'Causative & causative-passive', sub: '〜させる, 〜させられる', grammar: ['causative', 'causative-passive'] },
  { id: 'n3-expressions', level: 'N3', title: 'N3 expressions', sub: '〜はず, 〜のに, 〜そうだ…', grammar: ['hazu', 'kata', 'koto-ni-suru', 'koto-ni-shite-iru', 'ni-yoru-to', 'noni', 'sou-hearsay', 'te-kuru'] },
];

// Which chunk wins when a sentence has grammar from several: the hardest,
// most specific first; plain tense and です last.
const PRIORITY = ['n3-causative', 'n3-passive', 'n3-expressions', 'n4-keigo', 'n4-potential', 'n4-giving',
  'n4-conditionals', 'n4-wants', 'n4-te-forms', 'n4-advice', 'n4-thinking', 'n4-change',
  'n5-plain', 'n5-te', 'n5-te-iru', 'n5-adjectives', 'n5-past', 'n5-masu', 'n5-desu'];

export function buildChunks() {
  const known = new Set(Object.keys(SENTENCE_WORDS.grammar));
  for (const c of CHUNKS) for (const g of c.grammar) if (!known.has(g)) throw new Error(`${c.id}: no grammar point ${g}`);
  const byId = Object.fromEntries(CHUNKS.map(c => [c.id, []]));
  for (const ch of Object.keys(TRANSLATE_SENTENCES).map(Number).sort((a, b) => a - b)) {
    TRANSLATE_SENTENCES[ch].forEach((_, i) => {
      const ref = `${ch}:${i}`;
      const line = SENTENCE_WORDS.lines[ref];
      if (!line) throw new Error(`sentences-words.js has no line ${ref} — run scripts/tokenize_sentences.mjs`);
      const has = new Set((line.g || []).map(([g]) => g));
      // A sentence with no grammar of its own (a bare noun phrase) is a です sentence.
      const id = PRIORITY.find(cid => CHUNKS.find(c => c.id === cid).grammar.some(g => has.has(g))) || 'n5-desu';
      byId[id].push(ref);
    });
  }
  return CHUNKS.flatMap(c => {
    const refs = byId[c.id];
    const parts = Math.ceil(refs.length / MAX);
    const size = Math.ceil(refs.length / parts);
    return Array.from({ length: parts }, (_, k) => ({
      id: parts > 1 ? `${c.id}-${k + 1}` : c.id,
      level: c.level,
      title: parts > 1 ? `${c.title} (${k + 1})` : c.title,
      sub: c.sub,
      sentences: refs.slice(k * size, (k + 1) * size),
    }));
  });
}

function render(chunks) {
  return `// Generated by scripts/build_sentence_chunks.mjs from sentences-words.js —
// don't edit by hand. The Sentences page's chunks: each sentence ("3:0" is
// TRANSLATE_SENTENCES[3][0]) in one chunk, by JLPT level and grammar point.
(function (global) {
  'use strict';
  global.SENTENCE_CHUNKS = [
${chunks.map(c => `    ${JSON.stringify(c)},`).join('\n')}
  ];
})(typeof window !== 'undefined' ? window : globalThis);
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const chunks = buildChunks();
  const text = render(chunks);
  const old = (() => { try { return readFileSync(OUT, 'utf8'); } catch { return ''; } })();
  if (process.argv.includes('--check')) {
    if (old !== text) { console.error('sentence-chunks.js is stale. Run: node scripts/build_sentence_chunks.mjs'); process.exit(1); }
    console.log('sentence-chunks.js up to date');
  } else {
    writeFileSync(OUT, text);
    chunks.forEach(c => console.log(`${c.level} ${c.id}: ${c.sentences.length}`));
  }
}
