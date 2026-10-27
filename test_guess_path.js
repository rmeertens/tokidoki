// Checks for guess-path.js (the greedy path planner) and guess-kanji.js's
// deck handling, and that guess-words-data.js is built.
globalThis.window = globalThis;
require('./guess-words-data.js');
const GP = require('./guess-path.js');
const GK = require('./guess-kanji.js');

let passed = 0;
let failed = 0;
function ok(cond, label) {
  if (cond) passed++;
  else { failed++; console.log('  FAIL: ' + label); }
}

const item = (key, pieces, g = true, own = 1) => ({ key, pieces, g, own });

// 電車 and 天気 bring 電 and 気, so 電気 can be guessed; the list order
// puts it first, where it can't.
const deck = [
  item('電気', ['電:でん', '気:き']),
  item('電車', ['電:でん', '車:しゃ'], false, 0.5),
  item('天気', ['天:てん', '気:き'], false, 0.5),
  item('車', ['車:くるま'], false, 0.2),
];
const path = GP.plan([], deck);
const at = k => path.findIndex(x => x.key === k);
ok(path.length === deck.length, 'plan: every word comes once');
ok(at('電気') > at('電車') && at('電気') > at('天気'), 'plan: 電気 after the words that bring its kanji');
ok(path[at('電気')].guess && path[at('電気')].hints['電:でん'] === '電車' && path[at('電気')].hints['気:き'] === '天気',
  'plan: 電気 arrives guessable, with the words its kanji came from');
ok(GP.countGuessable([], deck, 4) === 0 && GP.countGuessable([], path, 4) === 1, 'countGuessable: list order 0, path 1');

// Studied words put their kanji in hand.
const after = GP.plan([item('電車', ['電:でん', '車:しゃ']), item('天気', ['天:てん', '気:き'])], [deck[0], deck[3]]);
ok(after[0].key === '電気' && after[0].guess, 'plan: a word whose kanji were studied comes first, guessable');
// ...but only within the window, unless the card is mature.
const old = Array.from({ length: 50 }, (_, i) => item('x' + i, ['x:' + i], false));
const stale = GP.plan([item('電車', ['電:でん']), item('天気', ['気:き']), ...old], [deck[0]]);
ok(!stale[0].guess, 'plan: kanji met more than `window` words ago are not in hand');
const mature = GP.plan([Object.assign(item('電車', ['電:でん']), { mature: true }), Object.assign(item('天気', ['気:き']), { mature: true }), ...old], [deck[0]]);
ok(mature[0].guess, 'plan: a mature card keeps its kanji in hand');

// The deck.
ok(Array.isArray(window.GUESS_WORDS) && window.GUESS_WORDS.length > 2500, 'guess-words-data.js holds the JLPT words');
const items = window.GUESS_WORDS.map(GK.toItem);
const denki = items.find(x => x.key === '電気|でんき');
ok(denki && denki.pieces.join() === '電:でん,気:き' && denki.g, '電気 splits into 電:でん 気:き and is guessable');
ok(items.every(x => x.pieces.length && x.pieces.every(p => /^.:[ぁ-ゖー]+$/u.test(p))), 'every word has pieces "kanji:reading"');
ok(new Set(items.map(x => x.key)).size === items.length, 'no word twice');
ok(window.GUESS_WORDS.every(r => r[4].split(' ').every(p => p[0] in window.GUESS_KANJI_MEANINGS)), 'every kanji has its meaning');

// Parts of speech.
ok(items.filter(x => x.pos).length >= 0.98 * items.length, 'nearly every word has a part of speech');
const posOf = w => (items.find(x => x.word === w) || {}).pos;
ok(posOf('食べる') === 'verb' && posOf('高い') === 'い-adjective' && posOf('静か') === 'な-adjective'
  && posOf('勉強') === 'noun · する verb' && posOf('顔') === 'noun', 'parts of speech: 食べる verb, 高い い-adjective, 静か な-adjective, 勉強 する verb, 顔 noun');

// Example sentences.
const withEx = items.filter(x => x.example);
ok(withEx.length >= 0.85 * items.length, `most words have an example sentence (${withEx.length} of ${items.length})`);
ok(withEx.every(x => x.example.en && Number.isInteger(x.example.id) && !/\|#/.test(x.example.ja)), 'examples have English, a Tatoeba id and readings (no JMdict ids)');
ok(withEx.every(x => !/[{}|]/.test(x.example.ja.replace(/\{[^|{}]+\|[^|{}]+\}/g, ''))), 'example furigana is well formed');
ok(denki.example && denki.example.ja.includes('{電気|でんき}'), '電気 has an example that uses it');
ok(GK.exampleHtml('{電気|でんき}をつけて<b>', new Set(['電'])) ===
  '<mark><ruby>電気<rp>(</rp><rt>でんき</rt><rp>)</rp></ruby></mark>をつけて&lt;b&gt;', 'exampleHtml: ruby, the word highlighted, text escaped');

const { studied, fresh } = GK.splitDeck(items, ['電車|でんしゃ', 'nope', '電車|でんしゃ'], id => ({ 'guess:電車|でんしゃ': { interval: 30 } })[id]);
ok(studied.length === 1 && studied[0].mature && fresh.length === items.length - 1, 'splitDeck: studied once, mature from its card');

// The real path beats the list order by a wide margin.
const real = GP.plan([], items, { ahead: 100 });
ok(GP.countGuessable([], real, 100) >= 4 * GP.countGuessable([], items, 100), 'path: far more guessable words in the first 100');

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
