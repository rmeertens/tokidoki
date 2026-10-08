// Checks for the Vocabulary page's Picture → Word cards (vocab-pictures.js):
// every pictured word is in the vocabulary list, every picture can be drawn
// from listening-art.js, and no two words share a drawing.
global.window = global;
require('./vocabulary-data.js');
require('./vocab-pictures.js');
const Art = require('./listening-art.js');

let passed = 0;
let failed = 0;
function ok(cond, label) {
  if (cond) passed++;
  else { failed++; console.log('  FAIL: ' + label); }
}

const words = new Set();
Object.values(global.VOCAB_DATA).forEach(list => list.forEach(w => words.add(w.kanji)));

const seen = new Map();
Object.entries(global.VOCAB_PICTURES).forEach(([word, spec]) => {
  ok(words.has(word), `${word}: not in vocabulary-data.js`);
  if (typeof spec === 'string') ok(!!Art.ICONS[spec], `${word}: no icon "${spec}"`);
  else if (spec.person) ok(typeof spec.person === 'object' || !!Art.ROLES[spec.person], `${word}: no role "${spec.person}"`);
  else ok(Array.isArray(spec.items) && spec.items.every(n => Art.ICONS[n]), `${word}: bad items`);
  const key = JSON.stringify(spec);
  ok(!seen.has(key), `${word}: same picture as ${seen.get(key)}`);
  seen.set(key, word);
});

console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
