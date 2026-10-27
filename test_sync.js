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

// Word lookups: taps on both sides add up, the later last tap wins.
out = P(M.mergeAll(
  { tokidoki_lookups: J({ 猫: [3, 100], 犬: [1, 50] }) },
  { tokidoki_lookups: J({ 猫: [5, 300], 犬: [1, 50], 鳥: [1, 400] }) },
  { tokidoki_lookups: J({ 猫: [4, 200], 魚: [2, 500] }) },
).tokidoki_lookups);
ok(J(out.猫) === J([6, 300]), 'lookups: both sides’ taps added, later time');
ok(J(out.鳥) === J([1, 400]) && J(out.魚) === J([2, 500]) && !('犬' in out), 'lookups: new words kept, a removed one stays removed');
out = P(M.mergeAll({}, { tokidoki_lookups: J({ 猫: [2, 10] }) }, { tokidoki_lookups: J({ 猫: [7, 5] }) }).tokidoki_lookups);
ok(J(out.猫) === J([7, 10]), 'lookups: first sync takes the larger count, not the sum');

// GTK - Easy Word Order: the words studied and guessed on both sides.
out = P(M.mergeAll(
  { tokidoki_guess: J({ started: ['日|ひ'], guessed: [] }) },
  { tokidoki_guess: J({ started: ['日|ひ', '一日|いちにち'], guessed: ['一日|いちにち'] }) },
  { tokidoki_guess: J({ started: ['日|ひ', '本|ほん'], guessed: [] }) },
).tokidoki_guess);
ok(J(out.started) === J(['日|ひ', '一日|いちにち', '本|ほん']) && J(out.guessed) === J(['一日|いちにち']),
  'guess: words studied on either side kept, in order');

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
out = P(M.mergeAll({ tokidoki_vocab_quiz: J({ best: {}, missed: ['n5|犬|いぬ'] }) },
  { tokidoki_vocab_quiz: J({ best: { 'n5-food:m': { score: 30, total: 35 } }, missed: [] }) },
  { tokidoki_vocab_quiz: J({ best: { 'n5-food:m': { score: 33, total: 35 } }, missed: ['n5|犬|いぬ', 'n4|空気|くうき'] }) },
).tokidoki_vocab_quiz);
ok(out.best['n5-food:m'].score === 33 && J(out.missed) === J(['n4|空気|くうき']), 'vocab quiz: best scores and missed words merged');

// Merging is stable: syncing again changes nothing.
const l2 = { tokidoki_srs: J(srsLocal), tokidoki_theme: '"dark"' };
const r2 = { tokidoki_srs: J(srsRemote), tokidoki_settings: J({ a: 1 }) };
const m2 = M.mergeAll({}, l2, r2);
ok(M.sameSnapshot(M.mergeAll(m2, m2, m2), m2), 'a merged result merges to itself');
ok(M.sameSnapshot({ a: '{"x":1,"y":2}' }, { a: '{"y":2,"x":1}' }), 'sameSnapshot ignores key order');
ok(!M.sameSnapshot({ a: '1' }, { a: '1', b: '2' }), 'sameSnapshot notices an extra key');

// Review log and totals: counts from both sides add up.
const logBase = { '2026-10-10': { verbs: [10, 2, 100] } };
out = P(M.mergeAll({ tokidoki_daylog: J(logBase) },
  { tokidoki_daylog: J({ '2026-10-10': { verbs: [15, 3, 150] }, '2026-10-11': { kana: [4, 1, 40] } }) },
  { tokidoki_daylog: J({ '2026-10-10': { verbs: [12, 2, 120], words: [5, 0, 50] }, '2026-10-11': { kana: [6, 0, 60] } }) },
).tokidoki_daylog);
ok(J(out['2026-10-10'].verbs) === J([17, 3, 170]), 'review log: a day both sides added to sums the additions');
ok(J(out['2026-10-10'].words) === J([5, 0, 50]), 'review log: a kind only one side has is kept');
ok(J(out['2026-10-11'].kana) === J([10, 1, 100]), 'review log: a new day on both sides adds up');
out = P(M.mergeAll({}, { tokidoki_daylog: J({ d: { verbs: [3, 0, 9] } }) }, { tokidoki_daylog: J({ d: { verbs: [5, 1, 4] } }) }).tokidoki_daylog);
ok(J(out.d.verbs) === J([5, 1, 9]), 'review log: first sync takes the larger counts');
const totBase = { hours: [[1, 0]], cards: { young: [4, 1] } };
out = P(M.mergeAll({ tokidoki_review_totals: J(totBase) },
  { tokidoki_review_totals: J({ hours: [[3, 1]], cards: { young: [6, 1] } }) },
  { tokidoki_review_totals: J({ hours: [[2, 0]], cards: { young: [4, 1], mature: [2, 0] } }) },
).tokidoki_review_totals);
ok(J(out.hours[0]) === J([4, 1]) && J(out.cards.young) === J([6, 1]) && J(out.cards.mature) === J([2, 0]), 'review totals add up');

// The account document's layout.
const DAYMS = 86400000;
const cards = {
  '3_いく_te': { easeFactor: 2.5600000000000005, interval: 13, repetitions: 3, nextReview: 1760183847123 },
  'story_word:猫|ねこ:recall': { easeFactor: 2.5, interval: 0, repetitions: 0, nextReview: 1760183800000 },
  'odd\tid': { easeFactor: 2.5, interval: 1, repetitions: 1, nextReview: 1760183800000 },
  '[bracket': { easeFactor: 2.5, interval: 1, repetitions: 1, nextReview: 1760183800000 },
  'extra': { easeFactor: 2.5, interval: 1, repetitions: 1, nextReview: 1760183800000, note: 'x' },
};
const snap = { tokidoki_srs: J(cards), tokidoki_theme: '"dark"', 'tokidoki-notepad': 'free text', tokidoki_daylog: J({ '2026-09-30': { verbs: [1, 0, 5] }, '2026-10-01': { kana: [2, 1, 9] } }) };
const enc = M.encodeAccount(snap);
ok(enc.k.tokidoki_theme === '"dark"' && enc.k['tokidoki-notepad'] === 'free text' && !('tokidoki_srs' in enc.k), 'account: plain keys go in k, the SRS store does not');
ok(Object.keys(enc.s).length >= 1 && Object.keys(enc.s).every(b => /^[0-9a-f]{2}$/.test(b)), 'account: cards spread over hex buckets');
ok(J(Object.keys(enc.l).sort()) === J(['2026-09', '2026-10']), 'account: the review log goes by month');
ok(Object.values(enc.s).join('\n').includes('0 3_いく_te\t256,13,3,29336397'), 'account: a card in the compact form');
const back = M.decodeAccount(enc);
const backCards = P(back.tokidoki_srs);
ok(backCards['3_いく_te'].easeFactor === 2.56 && backCards['3_いく_te'].nextReview === 29336397 * 60000, 'account: a card comes back rounded');
ok(backCards['odd\tid'].interval === 1 && backCards['[bracket'].interval === 1, 'account: awkward ids survive');
ok(backCards.extra.note === 'x', 'account: an unusual card survives as JSON');
ok(back['tokidoki-notepad'] === 'free text' && M.same(P(back.tokidoki_daylog), P(snap.tokidoki_daylog)), 'account: other keys come back as they were');
ok(M.sameSnapshot(M.canonical(snap), back), 'canonical() is what a trip through the account gives');
ok(M.sameSnapshot(M.canonical(back), back), 'canonical() is stable');
ok(M.encodeAccount({ tokidoki_srs: '{}' }).k.tokidoki_srs === '{}', 'account: an empty SRS store stays as it is');
ok(J(M.encodeAccount(back)) === J(enc), 'account: encoding is deterministic');
ok(J(M.encodeAccount(snap)) === J(M.encodeAccount(JSON.parse(J(snap)))), 'account: same data, same encoding');

// Only what changed is written.
const many = {};
for (let i = 0; i < 2000; i++) many['kana_' + i] = { easeFactor: 2.5, interval: 1, repetitions: 1, nextReview: 1760000000000 + i * 60000 };
const before = M.encodeAccount({ tokidoki_srs: J(many), tokidoki_theme: '"dark"' });
const many2 = Object.assign({}, many, { kana_7: { easeFactor: 2.6, interval: 3, repetitions: 2, nextReview: 1760300000000 } });
delete many2.kana_9;
const after = M.encodeAccount({ tokidoki_srs: J(many2), 'tokidoki-notepad': 'hi' });
const diff = M.diffAccount(before, after);
const sBuckets = diff.filter(d => d[0] === 's');
ok(sBuckets.length >= 1 && sBuckets.length <= 2, 'diff: a changed and a deleted card touch at most two buckets');
ok(diff.some(d => d[0] === 'k' && d[1] === 'tokidoki_theme' && d[2] === undefined), 'diff: a removed key is deleted');
ok(diff.some(d => d[0] === 'k' && d[1] === 'tokidoki-notepad' && d[2] === 'hi'), 'diff: a new key is written');
ok(M.diffAccount(before, before).length === 0, 'diff: nothing changed, nothing written');
const bucketBytes = Math.max(...Object.values(before.s).map(v => Buffer.byteLength(v)));
ok(bucketBytes < 2000, 'a bucket of 2000 cards stays small (' + bucketBytes + ' bytes)');
const encBytes = Buffer.byteLength(J(before.s)), jsonBytes = Buffer.byteLength(J(many));
ok(encBytes * 2 < jsonBytes, `the compact form is much smaller than JSON (${encBytes} vs ${jsonBytes})`);

console.log(`sync: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
