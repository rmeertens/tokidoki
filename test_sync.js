// Checks for sync-merge.js: merging this device's saved progress with the
// account's, against what both last agreed on.
const M = require('./sync-merge.js');

let passed = 0;
let failed = 0;
function ok(cond, label) {
  if (cond) passed++;
  else { failed++; console.log('  FAIL: ' + label); }
}

const J = JSON.stringify;
const P = s => (s == null ? s : JSON.parse(s));
const DAY = 86400000;
const card = (reviewed, interval, repetitions) =>
  ({ easeFactor: 2.5, interval, repetitions, nextReview: reviewed + interval * DAY });

// Which keys sync.
ok(M.isTracked('tokidoki_srs') && M.isTracked('tokidoki-notepad'), 'progress keys are synced');
ok(!M.isTracked('tokidoki_sync_base') && !M.isTracked('tokidoki_sync_uid'), 'sync bookkeeping is not');
ok(!M.isTracked('other_app') && !M.isTracked('tokidokiX'), 'other keys are not');
ok(!('other' in M.mergeAll({}, { other: '1' }, { other: '2' })), 'mergeAll skips untracked keys');

// First sync: nothing agreed yet.
let out = M.mergeAll({}, { tokidoki_theme: '"dark"' }, {});
ok(out.tokidoki_theme === '"dark"', 'first sync: a device-only key goes up');
out = M.mergeAll({}, {}, { tokidoki_theme: '"dark"' });
ok(out.tokidoki_theme === '"dark"', 'first sync: an account-only key comes down');
out = M.mergeAll({}, { tokidoki_settings: J({ typingMode: true }) }, { tokidoki_settings: J({ typingMode: false }) });
ok(P(out.tokidoki_settings).typingMode === false, 'first sync: the account’s settings win');

// Later syncs.
const base = { tokidoki_settings: J({ typingMode: false }), tokidoki_theme: '"light"' };
out = M.mergeAll(base, { tokidoki_settings: J({ typingMode: true }), tokidoki_theme: '"light"' }, base);
ok(P(out.tokidoki_settings).typingMode === true, 'a setting changed here goes up');
out = M.mergeAll(base, base, { tokidoki_settings: J({ typingMode: true }), tokidoki_theme: '"light"' });
ok(P(out.tokidoki_settings).typingMode === true, 'a setting changed elsewhere comes down');
out = M.mergeAll(base, { tokidoki_settings: J({ typingMode: true }), tokidoki_theme: '"light"' },
  { tokidoki_settings: J({ typingMode: false, hideForm: true }), tokidoki_theme: '"light"' });
ok(P(out.tokidoki_settings).typingMode === true, 'both changed a setting: this device wins after the first sync');
out = M.mergeAll(base, { tokidoki_settings: base.tokidoki_settings }, base);
ok(!('tokidoki_theme' in out), 'a key removed here is removed');
out = M.mergeAll(base, base, { tokidoki_settings: base.tokidoki_settings });
ok(!('tokidoki_theme' in out), 'a key removed elsewhere is removed');
ok(M.mergeAll(base, base, base).tokidoki_theme === base.tokidoki_theme, 'nothing changed, nothing changes');

// SRS: newest review of each card wins; deleted cards stay deleted.
const t = Date.now() - 10 * DAY;
const srsBase = { a: card(t, 1, 1), b: card(t, 1, 1), gone: card(t, 1, 1) };
const srsLocal = { a: card(t + 2 * DAY, 3, 2), b: card(t, 1, 1), here: card(t, 1, 1) };
const srsRemote = { a: card(t + DAY, 0, 0), b: card(t + 3 * DAY, 0, 0), gone: card(t, 1, 1), there: card(t, 1, 1) };
out = P(M.mergeAll({ tokidoki_srs: J(srsBase) }, { tokidoki_srs: J(srsLocal) }, { tokidoki_srs: J(srsRemote) }).tokidoki_srs);
ok(out.a.repetitions === 2, 'card reviewed later here keeps this device’s schedule');
ok(out.b.repetitions === 0 && out.b.nextReview === t + 3 * DAY, 'card reviewed later elsewhere keeps that schedule');
ok(out.here && out.there, 'new cards from both sides are kept');
ok(!('gone' in out), 'a card deleted here stays deleted');
out = P(M.mergeAll({}, { tokidoki_srs: J({ x: card(t, 1, 1) }) }, { tokidoki_srs: J({ y: card(t, 1, 1) }) }).tokidoki_srs);
ok(out.x && out.y, 'first sync: cards from both sides are kept');

// Word deck: union, deletions respected.
out = P(M.mergeAll(
  { tokidoki_story_words: J({ 猫: { kana: 'ねこ' }, 犬: { kana: 'いぬ' } }) },
  { tokidoki_story_words: J({ 猫: { kana: 'ねこ' }, 鳥: { kana: 'とり' } }) },
  { tokidoki_story_words: J({ 猫: { kana: 'ねこ' }, 犬: { kana: 'いぬ' }, 魚: { kana: 'さかな' } }) },
).tokidoki_story_words);
ok(J(Object.keys(out).sort()) === J(['猫', '魚', '鳥'].sort()), 'word deck: additions merged, deletion kept');

// Stats: reviews done on both sides add up.
const statsBase = { totalReviews: 100, totalCorrect: 80, streak: 3, lastStudyDate: '2026-10-09', todayReviews: 10, todayCorrect: 8 };
out = P(M.mergeAll({ tokidoki_stats: J(statsBase) },
  { tokidoki_stats: J({ ...statsBase, totalReviews: 110, totalCorrect: 85, streak: 4, lastStudyDate: '2026-10-10', todayReviews: 10, todayCorrect: 5 }) },
  { tokidoki_stats: J({ ...statsBase, totalReviews: 120, totalCorrect: 90, todayReviews: 30, todayCorrect: 18 }) },
).tokidoki_stats);
ok(out.totalReviews === 130 && out.totalCorrect === 95, 'stats: totals add both sides’ reviews');
ok(out.lastStudyDate === '2026-10-10' && out.streak === 4 && out.todayReviews === 10, 'stats: the newer day’s streak and counts');
out = P(M.mergeAll({}, { tokidoki_stats: J({ totalReviews: 5 }) }, { tokidoki_stats: J({ totalReviews: 50 }) }).tokidoki_stats);
ok(out.totalReviews === 50, 'stats: first sync takes the larger total, not the sum');

// Mystery chapters.
out = P(M.mergeAll({},
  { tokidoki_mystery: J({ c1: { step: 0, paws: 0, solved: true, best: 3 }, c2: { step: 4, paws: 2 } }) },
  { tokidoki_mystery: J({ c1: { step: 2, paws: 1, best: 5 } }) },
).tokidoki_mystery);
ok(out.c1.solved === true && out.c1.best === 5, 'mystery: solved on either side, best paws kept');
ok(out.c2.step === 4, 'mystery: chapters from one side kept');

// Game stores: best scores, missed lists.
const goBase = { best: { s1: { score: 5, total: 10 } }, last: {}, missed: ['q1', 'q2'] };
out = P(M.mergeAll({ tokidoki_word_order: J(goBase) },
  { tokidoki_word_order: J({ best: { s1: { score: 7, total: 10 } }, last: { q3: true }, missed: ['q2', 'q4'] }) },
  { tokidoki_word_order: J({ best: { s1: { score: 6, total: 10 }, s2: { score: 2, total: 10 } }, last: { q5: false }, missed: ['q1', 'q2', 'q5'] }) },
).tokidoki_word_order);
ok(out.best.s1.score === 7 && out.best.s2.score === 2, 'game store: best score per set');
ok(out.last.q3 === true && out.last.q5 === false, 'game store: last answers from both sides');
ok(J(out.missed.slice().sort()) === J(['q2', 'q4', 'q5']), 'game store: missed lists merged, fixed ones dropped');

// Merging is stable: syncing again changes nothing.
const l2 = { tokidoki_srs: J(srsLocal), tokidoki_theme: '"dark"' };
const r2 = { tokidoki_srs: J(srsRemote), tokidoki_settings: J({ a: 1 }) };
const m2 = M.mergeAll({}, l2, r2);
ok(M.sameSnapshot(M.mergeAll(m2, m2, m2), m2), 'a merged result merges to itself');
ok(M.sameSnapshot({ a: '{"x":1,"y":2}' }, { a: '{"y":2,"x":1}' }), 'sameSnapshot ignores key order');
ok(!M.sameSnapshot({ a: '1' }, { a: '1', b: '2' }), 'sameSnapshot notices an extra key');

console.log(`sync: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
