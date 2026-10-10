// Sanity checks for phrases-data.js (the Phrases page): every category and
// phrase is filled in, ids are unique, and the furigana markup is sound —
// every kanji has a reading in kana, since the 🔊 buttons read those.
global.window = global;
require('./phrases-data.js');

const { PHRASES_DATA } = global;
const RUBY = /([一-鿿々]+)\[([^\]]*)\]/g;
const KANJI = /[一-鿿々]/;
const KANA = /^[ぁ-ゖァ-ヺー]+$/;

let passed = 0;
let failed = 0;
function check(ok, label) {
  if (ok) passed++;
  else { failed++; console.log(`  FAIL: ${label}`); }
}

const ids = new Set();
let total = 0;
check(Array.isArray(PHRASES_DATA) && PHRASES_DATA.length >= 10, 'expected at least 10 categories');
PHRASES_DATA.forEach(cat => {
  check(/^[a-z-]+$/.test(cat.id) && !ids.has(cat.id), `${cat.id}: bad or duplicate id`);
  ids.add(cat.id);
  ['emoji', 'title', 'titleEn', 'blurb'].forEach(f => check(typeof cat[f] === 'string' && cat[f].length > 0, `${cat.id}: missing ${f}`));
  check(Array.isArray(cat.phrases) && cat.phrases.length >= 6, `${cat.id}: fewer than 6 phrases`);
  const seen = new Set();
  [cat.title, ...cat.phrases.map(p => p.jp)].forEach((jp, i) => {
    const where = i === 0 ? `${cat.id} title` : `${cat.id} #${i}`;
    let m;
    RUBY.lastIndex = 0;
    while ((m = RUBY.exec(jp))) check(KANA.test(m[2]), `${where}: reading "${m[2]}" for ${m[1]} isn't kana`);
    const rest = jp.replace(RUBY, '');
    check(!/[[\]]/.test(rest), `${where}: stray bracket in "${jp}"`);
    check(!KANJI.test(rest), `${where}: kanji without furigana in "${jp}"`);
  });
  cat.phrases.forEach((p, i) => {
    const where = `${cat.id} #${i + 1}`;
    total++;
    ['jp', 'en', 'note'].forEach(f => check(typeof p[f] === 'string' && p[f].trim().length > 0, `${where}: missing ${f}`));
    check(!seen.has(p.jp), `${where}: duplicate phrase "${p.jp}"`);
    seen.add(p.jp);
  });
});

console.log(`${total} phrases in ${PHRASES_DATA.length} categories`);
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
