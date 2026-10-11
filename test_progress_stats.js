// Checks for progress-stats.js: the progress summary in the account dialog.
const { progressStats } = require('./progress-stats.js');

let passed = 0;
let failed = 0;
function ok(cond, label) {
  if (cond) passed++;
  else { failed++; console.log('  FAIL: ' + label); }
}

const J = JSON.stringify;
const DAY = 86400000;
const NOW = Date.UTC(2026, 9, 11, 12);
const card = (interval, dueIn) => ({ easeFactor: 2.5, interval, repetitions: 1, nextReview: NOW + dueIn * DAY });

// Nothing saved yet.
let p = progressStats({}, NOW);
ok(p.total.studied === 0 && p.kinds.length === 0, 'empty: nothing studied');
ok(p.streak === 0 && p.reviewsToday === 0, 'empty: no streak');
ok(progressStats({ tokidoki_srs: 'not json' }, NOW).total.studied === 0, 'unreadable data is skipped');

// Cards by kind of practice.
const srs = {
  '3_いく_te': card(30, 20),
  '3_いく_past': card(1, -1),
  'adj:たかい:past': card(0, 0),
  'adjsent:たかい:neg': card(3, 2),
  'bunkei:いく:tai': card(1, 1),
  'tr_3_0_en-to-ja': card(1, 1),
  'particle_12': card(1, 1),
  'vparticle_4': card(25, 10),
  'kana_hiragana_あ': card(40, 30),
  'kanjiquiz_n5_meaning_日': card(1, -2),
  'confusable_未': card(1, 1),
  'story_word:猫|ねこ': card(22, 5),
  'story_word:猫|ねこ:recall': card(1, -1),
  'kanji_card:犬': card(1, 1),
  'something_else': card(1, 1),
};
p = progressStats({ tokidoki_srs: J(srs) }, NOW);
const kind = id => p.kinds.find(k => k.id === id) || { studied: 0, learned: 0, due: 0 };
ok(kind('verbs').studied === 2 && kind('verbs').learned === 1 && kind('verbs').due === 1, 'verbs: studied, learned, due');
ok(kind('adjectives').studied === 2 && kind('adjectives').due === 1, 'adjectives and adjective sentences');
ok(kind('bunkei').studied === 1 && kind('translate').studied === 1, 'sentence patterns and translation');
ok(kind('particles').studied === 2 && kind('particles').learned === 1, 'particles and verb particles');
ok(kind('kana').studied === 1 && kind('kana').learned === 1, 'kana');
ok(kind('kanji').studied === 2 && kind('kanji').due === 1, 'kanji quiz and confusable kanji');
ok(kind('words').studied === 2 && kind('words').learned === 1 && kind('words').due === 1, 'word flashcards, both directions');
ok(kind('kanjiCards').studied === 1, 'kanji flashcards');
ok(p.total.studied === 14, 'unknown ids are not counted');
ok(p.kinds.every(k => k.studied > 0), 'only kinds with cards are listed');

// Streak and today's reviews only while current.
const stats = d => J({ streak: 5, todayReviews: 12, lastStudyDate: d });
p = progressStats({ tokidoki_stats: stats('2026-10-11') }, NOW);
ok(p.streak === 5 && p.reviewsToday === 12, 'studied today: streak and today’s reviews');
p = progressStats({ tokidoki_stats: stats('2026-10-10') }, NOW);
ok(p.streak === 5 && p.reviewsToday === 0, 'studied yesterday: streak still on, nothing today');
p = progressStats({ tokidoki_stats: stats('2026-10-08') }, NOW);
ok(p.streak === 0 && p.reviewsToday === 0, 'a gap: the streak is over');

// Decks and games.
p = progressStats({
  tokidoki_story_words: J({ a: {}, b: {}, c: {} }),
  tokidoki_kanji_cards: J({ 日: {}, 月: {} }),
  tokidoki_saved_grammar: J({ g1: {} }),
  tokidoki_listening: J({ best: { t1: { score: 3, total: 5 }, t2: { score: 1, total: 5 }, missed: { score: 1, total: 2 } }, missed: [] }),
  tokidoki_word_order: J({ best: { s1: { score: 4, total: 5 } }, last: {}, missed: [] }),
  tokidoki_story_fill: J({ best: { p1: {}, p2: {}, quick: {} } }),
  tokidoki_mystery: J({ ch1: { solved: true, best: 3 }, ch2: { step: 2, paws: 1 } }),
}, NOW);
ok(p.decks.words === 3 && p.decks.kanji === 2 && p.decks.grammar === 1, 'deck sizes');
ok(p.games.listening === 2, 'listening tests, not counting the missed round');
ok(p.games.wordOrder === 1 && p.games.storyFill === 2, 'word order sets and story fill passages');
ok(p.games.mystery === 1, 'mystery chapters solved');

console.log(`progress stats: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
