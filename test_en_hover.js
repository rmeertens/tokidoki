// Checks for en-hover.js, the Japanese hints on the English of translation
// prompts: base forms, grammar words left alone, the word the answer uses
// winning over other dictionary words, and every Bunkei sentence giving its
// drilled verb and object the right hint.
global.window = global;
global.Conjugator = require('./conjugator.js');
require('./examples.js');
const { GENKI_VERBS } = require('./verbs.js');
const Bunkei = require('./bunkei-data.js');
require('./vocabulary-data.js');
require('./sentences-data.js');
const H = require('./en-hover.js');

let passed = 0;
let failed = 0;
function ok(cond, label) {
  if (cond) passed++;
  else { failed++; console.log('  FAIL: ' + label); }
}
const first = r => r && (r.found || r.suggested)[0].ja;

// Base forms
for (const [w, base] of [['breaking', 'break'], ['scolded', 'scold'], ['broke', 'break'], ['toys', 'toy'], ['studies', 'study'],
  ['swimming', 'swim'], ['making', 'make'], ['stopped', 'stop'], ['children', 'child'], ['bigger', 'big'], ['sold', 'sell']]) {
  ok(H.baseForms(w).includes(base), `${w} → ${base}`);
}

// The example from the request
const scold = { ja: 'おもちゃを壊してから、母に叱られました。', kana: 'おもちゃをこわしてから、ははにしかられました。' };
ok(first(H.lookup('scolded', scold)) === '叱る', 'scolded → 叱る');
ok(first(H.lookup('mother', scold)) === '母', 'mother → 母 (not お母さん)');
ok(first(H.lookup('toy', scold)) === 'おもちゃ', 'toy → おもちゃ');
const breaking = H.lookup('breaking', scold);
ok(breaking.found && breaking.found.map(e => e.ja).join() === '壊す', 'breaking → 壊す only, not 壊れる');
ok(H.lookup('got', scold, 'scolded') === null, 'the passive “got” has no hint');
for (const w of ['I', 'by', 'my', 'after', 'the', 'I\'m', 'can\'t']) ok(H.lookup(w, scold) === null, `grammar word ${w} has no hint`);

// The sentence's word wins; otherwise a dictionary suggestion
ok(first(H.lookup('drink', { ja: '毎日コーヒーを飲みます。' })) === '飲む', 'drink → 飲む, not 飲み物');
ok(!!H.lookup('drink', { ja: '雨が降っています。' }).suggested, 'a word not in the sentence is only a suggestion');
ok(first(H.lookup('japanese', { ja: '日本語を習いたいです。' })) === '日本語', 'Japanese → 日本語');
ok(H.lookup('get', { ja: '雨が降っています。' }) === null, 'no dictionary guess for “get”');
ok(first(H.lookup('every day', { ja: '毎日泳ぎます。' })) === '毎日', 'every day → 毎日');
ok(first(H.lookup('get in touch', { ja: '着いたら連絡します。' })) === '連絡する', 'get in touch → 連絡する');
ok(H.kanaOfRuby('<ruby>私<rp>(</rp><rt>わたし</rt><rp>)</rp></ruby>は') === 'わたしは', 'kanaOfRuby');

// Every Bunkei sentence: the drilled verb's English gets a hint for the
// verb itself, and the object for its Japanese.
let sentences = 0;
Bunkei.usableVerbs(GENKI_VERBS).forEach(verb => Bunkei.patternsFor(verb).forEach(pattern => {
  const b = Bunkei.build(verb, pattern.id);
  const s = { ja: b.plain, kana: b.kana, words: b.words };
  sentences++;
  ok(Array.isArray(b.words) && b.words[0].ja === verb.kanji, `${verb.kanji} × ${pattern.id}: words start with the verb`);
  const tokens = b.en.split(/[^A-Za-z']+/).filter(Boolean);
  const verbHint = tokens.some(t => { const r = H.lookup(t, s); return r && r.found && r.found.some(e => e.ja === verb.kanji); });
  const head = String(b.words[0].en).split(' ')[0];
  if (tokens.some(t => H.baseForms(t).includes(head))) ok(verbHint, `${verb.kanji} × ${pattern.id}: “${b.en}” hints ${verb.kanji}`);
  if (b.words[1]) {
    const objEn = b.words[1].en.toLowerCase().split(' ');
    if (tokens.some(t => objEn.includes(t.toLowerCase()))) {
      ok(tokens.some(t => { const r = H.lookup(t, s); return r && r.found && r.found.some(e => e.ja === b.words[1].ja); }), `${verb.kanji} × ${pattern.id}: object ${b.words[1].ja}`);
    }
  }
}));
ok(sentences > 3000, `checked ${sentences} Bunkei sentences`);

// Every Sentences-page sentence looks up without errors.
let words = 0, hinted = 0;
Object.values(global.TRANSLATE_SENTENCES).flat().forEach(s => {
  const kana = H.kanaOfRuby(s.jaHtml || s.ja);
  s.en.split(/[^A-Za-z']+/).filter(Boolean).forEach(t => { words++; const r = H.lookup(t, { ja: s.ja, kana }); if (r && r.found) hinted++; });
});
ok(hinted / words > 0.3, `Sentences page: ${hinted} of ${words} words get a hint from the sentence`);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
