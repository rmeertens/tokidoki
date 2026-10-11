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

// Card ages, intervals and the forecast.
p = progressStats({ tokidoki_srs: J(srs) }, NOW);
ok(p.ages.learning === 1 && p.ages.mature === 4 && p.ages.young === 9, 'card ages: learning, young, mature');
ok(p.intervals.find(b => b.short === '2–4w').cards === 3 && p.intervals[0].cards === 8, 'interval histogram buckets');
ok(p.overdue === 4, 'overdue cards');
ok(p.forecast.length === 30 && p.forecast[0].cards === 0 && p.forecast[1].cards === 5 && p.forecast[2].cards === 1, 'forecast: cards due today and tomorrow');
ok(p.forecast[20].cards === 1 && p.forecast[29].cards === 0, 'forecast: further out');

// Recording reviews into the log.
const mem = {};
global.localStorage = { getItem: k => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); } };
const PS = require('./progress-stats.js');
const t0 = new Date(2026, 9, 11, 9, 0, 0).getTime();
PS.record('3_いく_te', { interval: 0 }, 4, t0);
const e2 = PS.record('3_いく_te', { interval: 30 }, 1, t0 + 20000);
PS.record('kana_hiragana_あ', { interval: 3 }, 4, t0 + 5 * 60000);
let log = JSON.parse(mem.tokidoki_daylog)['2026-10-11'];
ok(J(log.verbs) === J([2, 1, 80]) && J(log.kana) === J([1, 0, 60]), 'record: reviews, fails and seconds per kind (capped at a minute)');
let tot = JSON.parse(mem.tokidoki_review_totals);
ok(J(tot.hours[9]) === J([3, 1]) && tot.hours.length === 24, 'record: hour of day');
ok(J(tot.cards.learning) === J([1, 0]) && J(tot.cards.mature) === J([1, 1]) && J(tot.cards.young) === J([1, 0]), 'record: answers by card age');
PS.unrecord(e2);
log = JSON.parse(mem.tokidoki_daylog)['2026-10-11'];
tot = JSON.parse(mem.tokidoki_review_totals);
ok(J(log.verbs) === J([1, 0, 60]) && J(tot.cards.mature) === J([0, 0]) && J(tot.hours[9]) === J([2, 0]), 'unrecord takes a review back');

// Stats from the log.
const day = (y, m, d) => PS.localDay(new Date(y, m, d, 12).getTime());
const logData = { [day(2026, 9, 11)]: { verbs: [10, 2, 300] }, [day(2026, 9, 10)]: { kana: [5, 0, 100] }, [day(2026, 9, 9)]: { words: [3, 1, 60] }, [day(2026, 9, 5)]: { words: [7, 0, 70] } };
const noon = new Date(2026, 9, 11, 12).getTime();
p = progressStats({ tokidoki_daylog: J(logData), tokidoki_review_totals: J(tot) }, noon);
ok(p.streak === 3, 'streak from the log');
ok(p.reviewsToday === 10 && p.secondsToday === 300, 'today from the log');
ok(p.log.reviews === 25 && p.log.passed === 22 && p.log.days === 4 && p.log.since === day(2026, 9, 5), 'all-time totals from the log');
ok(p.calendar.length === 26 * 7 && p.calendar.find(c => c.day === day(2026, 9, 9)).reviews === 3, 'calendar of reviews');
ok(p.calendar.filter(c => c.reviews === null).length === 6 - ((new Date(noon).getDay() + 6) % 7), 'calendar: days after today are left blank');
ok(p.answers.find(a => a.age === 'learning').reviews === 1 && p.hours[9].reviews === 2, 'answers by age and hour from the totals');
p = progressStats({ tokidoki_daylog: J(logData) }, new Date(2026, 9, 12, 12).getTime());
ok(p.streak === 3 && p.reviewsToday === 0, 'nothing yet today: the streak runs to yesterday');

console.log(`progress stats: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
