// Checks for story-fill.js and story-fill-data.js: every passage has its
// blanks numbered 1, 2, 3… in reading order, each blank has four distinct
// choices, an answer and an explanation, every kanji has furigana somewhere in
// its passage (like a graded reader, repeats can go without), and the English
// has one paragraph per Japanese paragraph.
require('./story-fill-data.js');
const SF = require('./story-fill.js');
const PASSAGES = globalThis.STORY_FILL_PASSAGES;

let passed = 0;
let failed = 0;
function check(ok, message) {
  if (ok) passed++;
  else { failed++; console.log(`  FAIL: ${message}`); }
}

const RUBY = /([一-鿿々]+)\[[^\]]+\]/g;
// Kanji written without a reading that never get one anywhere in the passage.
const unread = (m, known) => [...m.replace(RUBY, '')].filter(c => /[一-鿿々]/.test(c) && !known.has(c));

const ids = new Set();
PASSAGES.forEach(p => {
  const name = p.id || p.titleEn;
  check(typeof p.id === 'string' && !ids.has(p.id), `${name}: id missing or repeated`);
  ids.add(p.id);
  check(SF.LEVELS.includes(p.level), `${name}: unknown level ${p.level}`);
  check(p.title && p.titleEn, `${name}: missing title`);
  check(Array.isArray(p.en) && p.en.length === p.paragraphs.length, `${name}: English needs one paragraph per paragraph`);

  const order = SF.blankOrder(p);
  check(order.length === p.blanks.length, `${name}: ${order.length} blanks in the text but ${p.blanks.length} defined`);
  check(order.every((b, i) => b === i), `${name}: blanks must be numbered 1, 2, 3… in reading order`);
  check(p.blanks.length >= 4, `${name}: fewer than four blanks`);

  const all = [p.title, ...p.paragraphs, ...p.blanks.flatMap(b => b.choices)];
  const known = new Set(all.flatMap(m => [...m.matchAll(RUBY)].flatMap(r => [...r[1]])));
  p.blanks.forEach((b, i) => {
    const q = `${name} blank ${i + 1}`;
    check(Array.isArray(b.choices) && b.choices.length === 4, `${q}: needs four choices`);
    check(new Set(b.choices.map(SF.plain)).size === b.choices.length, `${q}: repeated choice`);
    check(Number.isInteger(b.answer) && b.answer >= 0 && b.answer < b.choices.length, `${q}: answer out of range`);
    check(typeof b.why === 'string' && b.why.length > 20, `${q}: missing explanation`);
    b.choices.forEach(c => check(!unread(c, known).length, `${q}: no furigana anywhere for ${unread(c, known)}`));
  });
  [p.title, ...p.paragraphs].forEach(m => {
    check(!unread(m, known).length, `${name}: no furigana anywhere for ${unread(m, known).join('')}`);
    check(!/[\[\]]/.test(SF.plain(m)), `${name}: stray furigana bracket`);
  });
});
SF.LEVELS.forEach(level => check(PASSAGES.some(p => p.level === level), `${level}: no passages`));

// ─── Words (story-fill-words.js) ─────────────────────────────────────────────
// The word lists are generated from the passages by
// scripts/tokenize_story_fill.mjs; they must still spell out the passages
// exactly, and every word needs a dictionary entry.

require('./story-fill-words.js');
const WORDS = globalThis.STORY_FILL_WORDS;
const stale = 'out of date — run scripts/tokenize_story_fill.mjs';
PASSAGES.forEach(p => {
  const pieces = WORDS.passages[p.id];
  check(Array.isArray(pieces) && pieces.length === p.paragraphs.length, `${p.id}: word list ${stale}`);
  if (!pieces) return;
  pieces.forEach((par, i) => {
    check(par.map(t => (typeof t === 'string' ? t : t[0])).join('') === p.paragraphs[i], `${p.id} paragraph ${i + 1}: word list ${stale}`);
    par.filter(Array.isArray).forEach(([m, key]) => {
      const g = WORDS.gloss[key];
      check(Array.isArray(g) && g.length === 3 && g[0] && g[1], `${p.id}: no meaning for ${m} (${key})`);
    });
  });
  const words = pieces.flat().filter(Array.isArray).length;
  check(words >= 15, `${p.id}: only ${words} tappable words`);
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

check(JSON.stringify(SF.splitBlanks('a{1}b{2}')) === '[{"text":"a"},{"blank":0},{"text":"b"},{"blank":1}]', 'splitBlanks() splits at blanks');
check(SF.rubyHtml('海[うみ]へ 行く') === '<ruby>海<rt>うみ</rt></ruby>へ 行く', 'rubyHtml() keeps spaces');
check(SF.rubyHtml('<b>') === '&lt;b&gt;', 'rubyHtml() escapes');
check(SF.plain('海[うみ]へ') === '海へ', 'plain() strips readings');
const p0 = { blanks: [{ answer: 0 }, { answer: 2 }, { answer: 1 }] };
check(SF.score(p0, [0, 2, 3]) === 2, 'score() counts right answers');
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
for (let k = 0; k < 50; k++) check([...SF.shuffleOrder(4, rand)].sort().join() === '0,1,2,3', 'shuffle keeps every choice');

console.log(`story fill: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
