// Checks for word-order.js and word-order-data.js: every question is well
// formed, grading accepts only the right order, and the shown order is never
// already the answer.
require('./word-order-data.js');
const WordOrder = require('./word-order.js');
const ITEMS = globalThis.WORD_ORDER_ITEMS;

let passed = 0;
let failed = 0;
function check(ok, message) {
  if (ok) passed++;
  else { failed++; console.log(`  FAIL: ${message}`); }
}

// ─── Data ────────────────────────────────────────────────────────────────────

const ids = new Set();
ITEMS.forEach(it => {
  const name = it.id || JSON.stringify(it.pre);
  check(typeof it.id === 'string' && !ids.has(it.id), `${name}: id missing or repeated`);
  ids.add(it.id);
  check(WordOrder.LEVELS.includes(it.level), `${name}: unknown level ${it.level}`);
  check(Array.isArray(it.pieces) && it.pieces.length === 4, `${name}: needs exactly four pieces`);
  check(Number.isInteger(it.star) && it.star >= 0 && it.star < it.pieces.length, `${name}: star out of range`);
  const texts = it.pieces.map(WordOrder.plain);
  check(texts.every(t => t.length > 0), `${name}: empty piece`);
  check(new Set(texts).size === texts.length, `${name}: two pieces read the same`);
  check(typeof it.en === 'string' && it.en.length > 0, `${name}: missing English`);
  check(typeof it.note === 'string' && it.note.length > 0, `${name}: missing note`);
  // Every kanji has furigana, and the markup is balanced.
  [it.pre, it.post, ...it.pieces].forEach(m => {
    check(!/[\[\]]/.test(WordOrder.plain(m)), `${name}: stray furigana bracket in ${m}`);
    check(!/[一-鿿々]/.test(m.replace(/[一-鿿々]+\[[^\]]+\]/g, '')), `${name}: kanji without furigana in ${m}`);
  });
});
const sentences = new Set();
ITEMS.forEach(it => {
  const whole = WordOrder.plain(it.pre + it.pieces.join('') + it.post);
  check(!sentences.has(whole), `${it.id}: same sentence as another question`);
  sentences.add(whole);
});
WordOrder.LEVELS.forEach(level => {
  check(ITEMS.filter(it => it.level === level).length >= WordOrder.SESSION_SIZE, `${level}: fewer than a session of questions`);
});

// ─── Markup ──────────────────────────────────────────────────────────────────

check(WordOrder.plain('日本[にほん]の 歌[うた]') === '日本の歌', 'plain() strips readings and spaces');
check(WordOrder.rubyHtml('歌[うた]を') === '<ruby>歌<rt>うた</rt></ruby>を', 'rubyHtml() builds ruby');
check(WordOrder.rubyHtml('<b>') === '&lt;b&gt;', 'rubyHtml() escapes');

// ─── Grading ─────────────────────────────────────────────────────────────────

const item = { pieces: ['母[はは]', 'が', '作[つく]った', 'ケーキ'], star: 2 };
check(WordOrder.isCorrect(item, [0, 1, 2, 3]), 'the right order is correct');
check(!WordOrder.isCorrect(item, [1, 0, 2, 3]), 'a swapped order is wrong');
check(!WordOrder.isCorrect(item, [0, 1, 2, null]), 'an unfinished order is wrong');
check(WordOrder.isStarCorrect(item, 2), 'the ★ piece is right');
check(!WordOrder.isStarCorrect(item, 3), 'another piece in the ★ slot is wrong');
// Identical pieces can stand in for each other.
const twin = { pieces: ['か', 'どう', 'か', 'まだ'], star: 0 };
check(WordOrder.isCorrect(twin, [2, 1, 0, 3]), 'identical pieces are interchangeable');
check(WordOrder.isStarCorrect(twin, 2), 'an identical piece answers the ★');

// ─── Shuffle & queue ─────────────────────────────────────────────────────────

let seed = 1;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
for (let k = 0; k < 200; k++) {
  const order = WordOrder.shuffleOrder(4, rand);
  check([...order].sort().join() === '0,1,2,3', 'shuffle keeps every piece');
  check(order.join() !== '0,1,2,3', 'shuffle never shows the answer');
}
const alwaysZero = () => 0;
check(WordOrder.shuffleOrder(4, (() => { let n = 0; return () => (n++ < 3 ? 0.99 : 0); })()).join() !== '0,1,2,3',
  'shuffle retries an identity shuffle');
check(WordOrder.shuffleOrder(1, alwaysZero).join() === '0', 'a single piece stays put');

const store = { missed: ['n5-guitar'], last: { 'n5-guitar': false, 'n5-mother-cake': true } };
const q = WordOrder.buildQueue(ITEMS, store, 'N5', 10, rand);
check(q.length === 10, 'a session has ten questions');
check(q[0].id === 'n5-guitar', 'mistakes come first');
check(q.every(it => it.level === 'N5'), 'the level filter holds');
check(!q.some(it => it.id === 'n5-mother-cake'), 'questions already answered right come last');
check(WordOrder.buildQueue(ITEMS, { missed: [], last: {} }, 'all', 10, rand).length === 10, 'all levels mix');

// ─── Sets ────────────────────────────────────────────────────────────────────

WordOrder.LEVELS.forEach(level => {
  const sets = WordOrder.setsOf(ITEMS, level);
  check(sets.length >= 5, `${level}: at least five sets`);
  check(sets.every(set => set.length === WordOrder.SET_SIZE), `${level}: every set has exactly five questions`);
  check(sets.flat().every(it => it.level === level), `${level}: sets stay within the level`);
  check(sets.flat().length === ITEMS.filter(it => it.level === level).length, `${level}: every question is in a set`);
});

console.log(`word order: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
