// Sanity checks for sentences-data.js (the Sentences page): every chapter has
// 50 sentences, each with English, a kanji spelling and a furigana version of
// it, and no two sentences in a chapter alike. sentences-words.js
// (scripts/tokenize_sentences.mjs) must cover every sentence exactly, with
// every word and grammar point it names.
global.window = global;
require('./sentences-data.js');
require('./sentences-words.js');

const { TRANSLATE_SENTENCES, SENTENCE_WORDS } = global;

let passed = 0;
let failed = 0;
function check(ok, label) {
  if (ok) passed++;
  else { failed++; console.log(`  FAIL: ${label}`); }
}

const ruby = /<ruby>(.*?)<rp>\(<\/rp><rt>(.*?)<\/rt><rp>\)<\/rp><\/ruby>/g;
const stripRuby = html => html.replace(ruby, '$1');
const toMarkup = html => html.replace(ruby, '$1[$2]');
const stale = 'run node scripts/tokenize_sentences.mjs';
const lineIds = new Set();

Object.entries(TRANSLATE_SENTENCES).forEach(([ch, list]) => {
  check(list.length === 50, `chapter ${ch}: ${list.length} sentences, expected 50`);
  const ja = new Set(), en = new Set();
  list.forEach((s, i) => {
    const id = `${ch}:${i}`;
    check(s.ja && s.jaHtml && s.en, `${id}: missing a field`);
    check(stripRuby(s.jaHtml) === s.ja, `${id}: jaHtml doesn't spell "${s.ja}"`);
    check(!/[一-鿿々]/.test(s.jaHtml.replace(ruby, '')), `${id}: kanji without furigana in "${s.ja}"`);
    check(!ja.has(s.ja), `${id}: "${s.ja}" twice in chapter ${ch}`);
    check(!en.has(s.en.toLowerCase()), `${id}: "${s.en}" twice in chapter ${ch}`);
    ja.add(s.ja);
    en.add(s.en.toLowerCase());

    lineIds.add(id);
    const line = SENTENCE_WORDS.lines[id];
    check(!!line, `${id}: no words — ${stale}`);
    if (!line) return;
    const joined = line.w.map(p => (typeof p === 'string' ? p : p[0])).join('');
    check(joined === toMarkup(s.jaHtml), `${id}: words don't match the text — ${stale}`);
    line.w.filter(p => typeof p !== 'string').forEach(([, key]) => {
      const g = SENTENCE_WORDS.gloss[key];
      check(Array.isArray(g) && g.length === 3 && g.every(x => typeof x === 'string' && x), `${id}: bad gloss for "${key}"`);
    });
    line.g.forEach(([gid, snippet]) => {
      const g = SENTENCE_WORDS.grammar[gid];
      check(!!g && !!g.title && !!g.pattern && !!g.note, `${id}: grammar "${gid}" missing or incomplete`);
      check(!!snippet && s.ja.includes(snippet), `${id}: grammar snippet "${snippet}" not in "${s.ja}"`);
    });
  });
});
Object.keys(SENTENCE_WORDS.lines).forEach(id => check(lineIds.has(id), `sentences-words.js has a line ${id} that no longer exists — ${stale}`));
const lines = Object.values(SENTENCE_WORDS.lines);
check(lines.filter(l => l.g.length).length / lines.length > 0.9, 'fewer than 90% of sentences have any grammar');

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
