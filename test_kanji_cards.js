// Checks for kanji-cards.js: kanji are picked out of a word, looked up in
// kanji-info-data.js / kanji-quiz-data.js, saved with the words they were
// spotted in, removed along with their SRS schedule, and the breakdown HTML
// marks saved kanji.
global.window = global;
const store = {};
global.localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; },
};
require('./kanji-info-data.js');
require('./kanji-quiz-data.js');
const K = require('./kanji-cards.js');

let passed = 0;
let failed = 0;
function ok(cond, label) {
  if (cond) passed++;
  else { failed++; console.log('  FAIL: ' + label); }
}

ok(JSON.stringify(K.chars('食べ物')) === '["食","物"]', 'chars picks the kanji of 食べ物');
ok(JSON.stringify(K.chars('人々の人')) === '["人"]', 'chars skips 々 and repeats');
ok(K.chars('ありがとう').length === 0, 'kana-only word has no kanji');

const eat = K.info('食');
ok(eat && /eat/.test(eat.meaning), '食 has a meaning');
ok(eat && eat.on.includes('ショク'), '食 has its on reading');
ok(eat && eat.level === 'n5', '食 is N5');

ok(!K.has('食'), 'nothing saved yet');
ok(K.toggle('食', { word: '食べる', reading: 'たべる', meaning: 'to eat' }) === true, 'toggle adds');
ok(K.has('食'), '食 saved');
K.add('食', { word: '食事', reading: 'しょくじ', meaning: 'meal' });
K.add('食', { word: '食べる', reading: 'たべる', meaning: 'to eat' });
const saved = K.load()['食'];
ok(saved.words.length === 2, 'each word it was seen in is kept once');
ok(saved.meaning === eat.meaning, 'meaning stored with the card');

const list = K.list();
ok(list.length === 1 && list[0].kanji === '食' && list[0].id === 'kanji_card:食', 'list gives the card and its SRS id');

store.tokidoki_srs = JSON.stringify({ 'kanji_card:食': { interval: 3 }, other: { interval: 1 } });
ok(K.toggle('食') === false, 'toggle removes');
ok(!K.has('食'), '食 gone');
const srs = JSON.parse(store.tokidoki_srs);
ok(!srs['kanji_card:食'] && srs.other, 'its schedule is dropped, others kept');

let removedId = null;
K.onRemove = id => { removedId = id; };
K.add('物');
K.remove('物');
ok(removedId === 'kanji_card:物', 'onRemove hook gets the card id');

K.add('物', { word: '物' });
const html = K.breakdownHtml('食べ物', { reading: 'たべもの', meaning: 'food' });
ok((html.match(/data-kanji-row=/g) || []).length === 2, 'breakdown has a row per kanji');
ok(/data-kanji-row="物"[^>]*>|kanji-cards-row saved" data-kanji-row="物"/.test(html), 'saved kanji row is marked');
ok(html.includes('data-from-word="食べ物"') && html.includes('data-from-reading="たべもの"'), 'buttons remember the word');
ok(K.breakdownHtml('ありがとう') === '', 'no breakdown for kana-only words');
ok((K.chipsHtml('食べ物').match(/kanji-card-btn-chip/g) || []).length === 2, 'a chip per kanji');
ok(!K.load()['物'].words.length, 'a kanji saved from itself lists no words');

// A kanji only the saved card knows about still shows up in the deck.
store.tokidoki_kanji_cards = JSON.stringify({ '𠀋': { added: 1, meaning: 'test', words: [] } });
ok(K.list().length === 1 && K.list()[0].info.meaning === 'test', 'saved meaning is the fallback');

console.log(`kanji cards: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
