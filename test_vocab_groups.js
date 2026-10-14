// Checks for vocab-groups.js (built by scripts/build_vocab_groups.mjs): every
// word of each JLPT level is in exactly one topic set of 20–50 words. Fails
// when vocabulary-data.js changed and the groups weren't rebuilt.
global.window = global;
require('./vocabulary-data.js');
require('./vocab-groups.js');

let passed = 0;
let failed = 0;
function ok(cond, msg) {
  if (cond) passed++;
  else { failed++; console.log(`  FAIL: ${msg}`); }
}

const ids = new Set();
for (const level of ['n5', 'n4', 'n3']) {
  const groups = VOCAB_GROUPS[level];
  ok(Array.isArray(groups) && groups.length > 0, `${level}: has groups`);
  const words = new Set(VOCAB_DATA[level].map(w => `${w.kanji}|${w.kana}`));
  const seen = new Map();
  for (const g of groups) {
    ok(!ids.has(g.id), `${g.id}: unique id`);
    ids.add(g.id);
    ok(g.id.startsWith(`${level}-`), `${g.id}: id starts with its level`);
    ok(VOCAB_THEMES[g.theme], `${g.id}: known theme ${g.theme}`);
    ok(typeof g.title === 'string' && g.title.length > 0, `${g.id}: has a title`);
    ok(g.words.length >= 20 && g.words.length <= 50, `${g.id}: ${g.words.length} words (want 20–50)`);
    for (const k of g.words) {
      ok(words.has(k), `${g.id}: ${k} is in the ${level} list (re-run node scripts/build_vocab_groups.mjs)`);
      if (seen.has(k)) ok(false, `${k} is in both ${seen.get(k)} and ${g.id}`);
      seen.set(k, g.id);
    }
  }
  for (const k of words) ok(seen.has(k), `${level}: ${k} is in no group (re-run node scripts/build_vocab_groups.mjs)`);
  // A theme's sets sit next to each other, so the page can show them as one row.
  const order = groups.map(g => g.theme).filter((t, i, a) => a.indexOf(t) === i);
  ok(order.every(t => groups.filter(g => g.theme === t).every((g, i, a) => i === 0 || groups.indexOf(g) === groups.indexOf(a[i - 1]) + 1)), `${level}: each theme's sets are together`);
}

console.log(`vocab groups: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
