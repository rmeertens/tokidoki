// Checks for word-lookups.js: how often and when each word was looked up,
// and the review orders the Flashcards page builds from it.
const store = {};
globalThis.localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
};
const L = require('./word-lookups.js');

let passed = 0;
let failed = 0;
function ok(cond, label) {
  if (cond) passed++;
  else { failed++; console.log('  FAIL: ' + label); }
}

const J = JSON.stringify;
const MIN = 60000;
const NOW = Date.UTC(2026, 9, 22, 12);

ok(L.get('猫').times === 0 && L.describe('猫', NOW) === '', 'never looked up: nothing');
L.record('猫', NOW - 3 * 1440 * MIN);
L.record('猫', NOW - 2 * 1440 * MIN);
L.record('猫', NOW - 2 * 1440 * MIN);
L.record('犬', NOW - 5 * MIN);
L.record('');
ok(J(L.load()) === J({ 猫: [3, NOW - 2 * 1440 * MIN], 犬: [1, NOW - 5 * MIN] }), 'record counts taps and keeps the last time');
ok(L.describe('猫', NOW) === '3× · 2 days ago', 'describe: days');
ok(L.describe('犬', NOW) === '1× · 5 min ago', 'describe: minutes');
ok(L.describe('犬', NOW - 5 * MIN) === '1× · just now', 'describe: just now');

const cards = [
  { key: '鳥', meta: { added: 3 } },
  { key: '犬', meta: { added: 2 } },
  { key: '猫', meta: { added: 1 } },
  { key: '魚', meta: { added: 4 } },
];
const keys = list => list.map(c => c.key).join('');
ok(keys(L.sortCards(cards, 'recent')) === '犬猫魚鳥', 'recent: last looked up first, never looked up last (newest saved first)');
ok(keys(L.sortCards(cards, 'often')) === '猫犬魚鳥', 'often: most looked up first');
ok(keys(cards) === '鳥犬猫魚', 'sortCards leaves its input alone');

store[L.KEY] = 'not json';
ok(J(L.load()) === '{}', 'unreadable data reads as empty');
L.record('猫', NOW);
ok(J(L.load()) === J({ 猫: [1, NOW] }), 'and recording starts afresh');

console.log(`word lookups: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
