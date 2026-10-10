// Sanity checks for phrases-data.js (the Phrases page): every category and
// phrase is filled in, ids are unique, and the furigana markup is sound —
// every kanji has a reading in kana, since the 🔊 buttons read those. Every
// category belongs to one of PHRASE_GROUPS, and has a story in
// phrases-stories.js that uses at least two of its phrases, and a page of
// its own, phrases-<id>.html (scripts/render_phrase_pages.mjs writes them).
const fs = require('fs');
global.window = global;
require('./phrases-data.js');
require('./phrases-stories.js');

const { PHRASES_DATA, PHRASE_GROUPS, PHRASE_STORIES } = global;
const GROUPS = new Set((PHRASE_GROUPS || []).map(g => g.id));
const RUBY = /([一-鿿々]+)\[([^\]]*)\]/g;
const KANJI = /[一-鿿々]/;
const KANA = /^[ぁ-ゖァ-ヺー]+$/;

let passed = 0;
let failed = 0;
function check(ok, label) {
  if (ok) passed++;
  else { failed++; console.log(`  FAIL: ${label}`); }
}

// Every kanji run carries a kana reading, and nothing else is bracketed.
function checkMarkup(jp, where) {
  let m;
  RUBY.lastIndex = 0;
  while ((m = RUBY.exec(jp))) check(KANA.test(m[2]), `${where}: reading "${m[2]}" for ${m[1]} isn't kana`);
  const rest = jp.replace(RUBY, '');
  check(!/[[\]]/.test(rest), `${where}: stray bracket in "${jp}"`);
  check(!KANJI.test(rest), `${where}: kanji without furigana in "${jp}"`);
}
const plain = jp => jp.replace(RUBY, '$1');

const ids = new Set();
let total = 0;
check(Array.isArray(PHRASES_DATA) && PHRASES_DATA.length >= 10, 'expected at least 10 categories');
check(GROUPS.size > 0 && PHRASE_GROUPS.every(g => g.id && g.title), 'PHRASE_GROUPS need an id and title');
GROUPS.forEach(g => check(PHRASES_DATA.some(c => c.group === g), `group ${g} has no categories`));
PHRASES_DATA.forEach(cat => {
  check(/^[a-z-]+$/.test(cat.id) && !ids.has(cat.id), `${cat.id}: bad or duplicate id`);
  ids.add(cat.id);
  check(GROUPS.has(cat.group), `${cat.id}: unknown group ${cat.group}`);
  ['emoji', 'title', 'titleEn', 'blurb'].forEach(f => check(typeof cat[f] === 'string' && cat[f].length > 0, `${cat.id}: missing ${f}`));
  check(Array.isArray(cat.phrases) && cat.phrases.length >= 6, `${cat.id}: fewer than 6 phrases`);
  const seen = new Set();
  [cat.title, ...cat.phrases.map(p => p.jp)].forEach((jp, i) => {
    checkMarkup(jp, i === 0 ? `${cat.id} title` : `${cat.id} #${i}`);
  });
  cat.phrases.forEach((p, i) => {
    const where = `${cat.id} #${i + 1}`;
    total++;
    ['jp', 'en', 'note'].forEach(f => check(typeof p[f] === 'string' && p[f].trim().length > 0, `${where}: missing ${f}`));
    check(!seen.has(p.jp), `${where}: duplicate phrase "${p.jp}"`);
    seen.add(p.jp);
  });
});

PHRASES_DATA.forEach(cat => {
  const story = PHRASE_STORIES && PHRASE_STORIES[cat.id];
  check(!!story, `${cat.id}: no story`);
  if (!story) return;
  checkMarkup(story.title, `${cat.id} story title`);
  check(typeof story.titleEn === 'string' && story.titleEn.length > 0, `${cat.id} story: missing titleEn`);
  check(Array.isArray(story.lines) && story.lines.length >= 6, `${cat.id} story: fewer than 6 lines`);
  (story.lines || []).forEach((line, i) => {
    const where = `${cat.id} story line ${i + 1}`;
    check(Array.isArray(line) && line.length === 3, `${where}: expected [speaker, jp, en]`);
    const [who, jp, en] = line;
    check(typeof who === 'string', `${where}: speaker must be a string`);
    check(typeof jp === 'string' && jp.length > 0 && typeof en === 'string' && en.length > 0, `${where}: missing jp or en`);
    checkMarkup(who || '', `${where} speaker`);
    checkMarkup(jp || '', where);
  });
  const text = (story.lines || []).map(l => plain(l[1] || '')).join('');
  const used = cat.phrases.filter(p => {
    const core = plain(p.jp).replace(/[。！？、…〜!?\s]+$/, '');
    return core.length > 1 && text.includes(core);
  });
  check(used.length >= 2, `${cat.id} story uses only ${used.length} of its phrases`);
});
Object.keys(PHRASE_STORIES || {}).forEach(id => check(ids.has(id), `story for unknown category ${id}`));

const pages = fs.readdirSync(__dirname).filter(f => /^phrases-.+\.html$/.test(f));
PHRASES_DATA.forEach(cat => {
  const file = `phrases-${cat.id}.html`;
  check(pages.includes(file), `${file} missing — run node scripts/render_phrase_pages.mjs`);
  if (pages.includes(file)) {
    const html = fs.readFileSync(`${__dirname}/${file}`, 'utf8');
    check(html.includes(`data-category="${cat.id}"`) && html.includes(cat.titleEn.replace(/&/g, '&amp;')),
      `${file} out of date — run node scripts/render_phrase_pages.mjs`);
  }
});
pages.forEach(f => check(ids.has(f.slice(8, -5)), `${f} has no category — delete it`));

console.log(`${total} phrases in ${PHRASES_DATA.length} categories`);
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
