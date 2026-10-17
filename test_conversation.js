// Checks for the Conversation starters: every question has hints and a sample
// answer at each level, with furigana on every kanji, plus the helpers that
// parse hints and add them to your answer, and the sync merge of answers.
const { CONVERSATION_GROUPS, CONVERSATION_TOPICS } = require('./conversation-data.js');
const C = require('./conversation.js');
const M = require('./sync-merge.js');

let passed = 0;
let failed = 0;
function ok(cond, label) {
  if (cond) passed++;
  else { failed++; console.log('  FAIL: ' + label); }
}

const KANJI_RE = /[㐀-䶿一-鿿々〆ヶ]/;
// Kanji left over once every 漢字[よみ] is taken out has no furigana.
function checkMarkup(text, where) {
  ok(!KANJI_RE.test(String(text).replace(/[㐀-䶿一-鿿々〆ヶ]+\[[^\]]+\]/g, '')), `${where}: kanji without furigana in ${JSON.stringify(text)}`);
  ok(!/\[[^\]]*[^ぁ-ゖー\]][^\]]*\]/.test(text), `${where}: furigana that isn't hiragana in ${JSON.stringify(text)}`);
  ok((text.match(/\[/g) || []).length === (text.match(/\]/g) || []).length, `${where}: unbalanced brackets`);
}

// ─── Data ──────────────────────────────────────────────────────────────────
const ids = new Set();
const groups = new Set(CONVERSATION_GROUPS.map(g => g.id));
ok(CONVERSATION_TOPICS.length >= 20, 'at least 20 questions');
const lengths = { N5: [], N4: [], N3: [] };
CONVERSATION_TOPICS.forEach(t => {
  ok(/^[a-z0-9-]+$/.test(t.id) && !ids.has(t.id), `${t.id}: id is a unique slug`);
  ids.add(t.id);
  ok(groups.has(t.group), `${t.id}: known group ${t.group}`);
  C.LEVELS.forEach(level => {
    const where = `${t.id} ${level}`;
    ok(!!t[level], `${where}: has the level`);
    if (!t[level]) return;
    const d = C.levelData(t, level);
    checkMarkup(d.q.ja, where + ' question');
    ok(d.q.en.length > 0, `${where}: question has English`);
    ok(d.words.length >= 4, `${where}: at least 4 words`);
    ok(d.verbs.length >= 3, `${where}: at least 3 verbs`);
    ok(d.grammar.length >= 2, `${where}: at least 2 grammar points`);
    ok(d.start.length === 1, `${where}: a way to begin`);
    [...d.words, ...d.verbs, ...d.start].forEach(h => {
      checkMarkup(h.ja, where);
      ok(h.ja && h.en && !h.ex, `${where}: hint ${JSON.stringify(h.ja)} is 'word|meaning'`);
    });
    d.grammar.forEach(h => {
      checkMarkup(h.ja, where);
      checkMarkup(h.ex, where);
      ok(h.ja && h.en && h.ex && h.exEn, `${where}: grammar ${JSON.stringify(h.ja)} has a meaning, example and English`);
    });
    checkMarkup(d.answer.ja, where + ' answer');
    ok(d.answer.en.length > 20, `${where}: sample answer has English`);
    ok(/[。？！]$/.test(C.plain(d.answer.ja)), `${where}: sample answer ends a sentence`);
    lengths[level].push(C.charCount(C.plain(d.answer.ja)));
  });
  // The levels really differ.
  const w = level => t[level] && t[level].words.join();
  ok(w('N5') !== w('N4') && w('N4') !== w('N3'), `${t.id}: different words per level`);
  ok(t.N5.answer[0] !== t.N4.answer[0] && t.N4.answer[0] !== t.N3.answer[0], `${t.id}: different answers per level`);
  ok(C.charCount(C.plain(t.N3.answer[0])) > C.charCount(C.plain(t.N5.answer[0])), `${t.id}: N3 answer is longer than N5`);
});
const avg = a => a.reduce((x, y) => x + y, 0) / a.length;
ok(avg(lengths.N5) < avg(lengths.N4) && avg(lengths.N4) < avg(lengths.N3), 'sample answers get longer level by level');
CONVERSATION_GROUPS.forEach(g => ok(CONVERSATION_TOPICS.some(t => t.group === g.id), `group ${g.id} has questions`));

// ─── Helpers ───────────────────────────────────────────────────────────────
ok(C.rubyHtml('日本[にほん]へ') === '<ruby>日本<rt>にほん</rt></ruby>へ', 'rubyHtml');
ok(C.plain('食[た]べました') === '食べました', 'plain');
ok(C.kana('食[た]べました') === 'たべました', 'kana');
ok(JSON.stringify(C.parseHint('〜たいです|want to …|行[い]きたいです。|I want to go.')) ===
  JSON.stringify({ ja: '〜たいです', en: 'want to …', ex: '行[い]きたいです。', exEn: 'I want to go.' }), 'parseHint');
ok(C.insertable('〜歳[さい]') === '歳', 'insertable drops 〜');
ok(C.insertable('〜から来[き]ました') === 'から来ました', 'insertable keeps the rest');
let r = C.insertAt('私は。', 2, 2, '学生です');
ok(r.value === '私は学生です。' && r.caret === 6, 'insertAt puts text at the caret');
r = C.insertAt('abc', 1, 2, 'X');
ok(r.value === 'aXc' && r.caret === 2, 'insertAt replaces the selection');
r = C.insertAt('', null, null, '犬');
ok(r.value === '犬' && r.caret === 1, 'insertAt with no caret appends');
ok(C.charCount('日本 語\nです') === 5, 'charCount skips spaces');
ok(C.answerKey('food', 'N4') === 'food:N4', 'answerKey');
const items = C.hintItems(C.levelData(CONVERSATION_TOPICS[0], 'N5'));
ok(items[0].id === 'words-0' && items[0].step === 'words', 'hintItems: words first');
ok(new Set(items.map(h => h.id)).size === items.length, 'hintItems: unique ids');
ok(items[items.length - 1].step === 'start', 'hintItems: the way to begin last');

// ─── Hints your answer uses ────────────────────────────────────────────────
const weekend = C.hintItems(C.levelData(CONVERSATION_TOPICS.find(t => t.id === 'weekend'), 'N4'));
const usedIn = text => C.usedHints(text, weekend);
const has = (text, id) => usedIn(text).includes(id);
ok(has('久しぶりに友達に会いました。', 'words-0'), 'uses: a word in kanji');
ok(has('ひさしぶりに', 'words-0'), 'uses: the same word in kana');
ok(has('友達に会いました。', 'verbs-1'), 'uses: a verb in another form (会う → 会いました)');
ok(!has('会社に行きました。', 'verbs-1'), 'uses: a lone kanji inside another word does not count (会社)');
ok(has('疲れました', 'verbs-2') && has('つかれた', 'verbs-2'), 'uses: verb stems, kanji or kana');
ok(has('掃除をしたり、洗濯をしたりしました。', 'grammar-0'), 'uses: a pattern with two parts (〜たり〜たりしました)');
ok(!has('掃除をしました。', 'grammar-0'), 'uses: half a pattern does not count');
ok(has('食べてから', 'grammar-1'), 'uses: 〜てから');
ok(!has('せんた', 'words-2'), 'uses: nouns are not cut short (洗濯 needs all of せんたく)');
ok(usedIn('').length === 0 && usedIn('はい。').length === 0, 'uses: nothing in a short answer');
// Every hint can be spotted when you write it out: its words in its own example
// or its plain form.
CONVERSATION_TOPICS.forEach(t => C.LEVELS.forEach(level => {
  C.hintItems(C.levelData(t, level)).forEach(h => {
    if (C.matchForms(h, h.step).length && h.step !== 'grammar') ok(C.usedHints(C.insertable(h.ja), [h]).length === 1, `${t.id} ${level}: ${h.ja} is spotted when written`);
  });
}));

// Nearly every grammar point is spotted in its own example sentence.
let spotted = 0, grammarTotal = 0;
CONVERSATION_TOPICS.forEach(t => C.LEVELS.forEach(level => {
  C.hintItems(C.levelData(t, level)).filter(h => h.step === 'grammar').forEach(h => {
    grammarTotal++;
    if (C.usedHints(C.plain(h.ex), [h]).length) spotted++;
  });
}));
ok(spotted / grammarTotal > 0.95, `uses: grammar spotted in its own example (${spotted}/${grammarTotal})`);
ok(has('友達と会うことにしました', 'verbs-1'), 'uses: 会う in its dictionary form');

// ─── Writing in kanji ──────────────────────────────────────────────────────
const dict = C.buildKanjiDict(CONVERSATION_TOPICS);
const kanji = (text, upto) => C.toKanji(text, dict, upto == null ? text.length + 1 : upto).text;
ok(kanji('どようび は ともだちと えいがを みました。') === '土曜日 は 友達と 映画を 見ました。', 'kanji: words become kanji');
ok(kanji('わたしはかわいいねこが') === '私はかわいい猫が', 'kanji: a noun after an adjective');
ok(kanji('いいえ、') === 'いいえ、', 'kanji: いいえ is not 家');
ok(kanji('かいしゃい', 5) === 'かいしゃい', 'kanji: a word that might go on (かいしゃ|い) waits');
ok(kanji('かいしゃいんです', 8) === '会社員です', 'kanji: the longest word wins');
ok(kanji('どようび', 4) === 'どようび', 'kanji: the word at the caret stays kana');
ok(kanji('すし と ケーキ') === 'すし と ケーキ', 'kanji: words without kanji stay');
let k = C.toKanji('ははと ', dict, 4);
ok(k.text === '母と ' && k.caret === 3 && k.changed[0].to === '母', 'kanji: caret moves with the shorter text');
ok(kanji('あいました。') === '会いました。' && kanji('かえって ') === '帰って ', 'kanji: verbs in other forms (会う, 帰る)');
ok(kanji('べんきょうしました。') === '勉強しました。' && kanji('たべてから') === '食べてから', 'kanji: する verbs and ichidan verbs');
ok(kanji('いまs', 3) === 'いまs' && kanji('います。') === 'います。', 'kanji: romaji still being typed is not the end of a word (いま|s → います, not 今す)');
ok(kanji('いまは ') === '今は ', 'kanji: いま before a particle is still 今');
const cands = C.buildKanjiCandidates(CONVERSATION_TOPICS, [], [{ kanji: '居間', kana: 'いま' }, { kanji: '走る', kana: 'はしる' }]);
ok(cands.get('いま')[0] === '今' && cands.get('いま').includes('居間'), 'candidates: every spelling, the commonest first');
ok((cands.get('はしります') || []).includes('走ります') && (cands.get('はしって') || []).includes('走って'), 'candidates: vocabulary verbs bring their forms');
const vf = (w, r) => C.verbForms(w, r).forms;
ok(vf('見る', 'みる').includes('て') && vf('帰る', 'かえる').includes('って'), 'verbForms: 見る is ichidan, 帰る is godan');
ok(vf('行く', 'いく').includes('って') && vf('泳ぐ', 'およぐ').includes('いで') && vf('読む', 'よむ').includes('んで'), 'verbForms: te-forms');
ok(C.verbForms('来る', 'くる') === null && C.verbForms('名前', 'なまえ') === null, 'verbForms: 来る and nouns are left alone');
ok(dict.get('なか') === '中' && dict.get('かわ') === '川', 'kanji: the commonest spelling of a reading');
ok(!dict.has('はん') && !dict.has('きも'), 'kanji: no pieces of longer words (ご飯, 気持ち)');
[...dict].forEach(([r, w]) => ok(/^[ぁ-ゖー]+$/.test(r) && /[㐀-䶿一-鿿々]/.test(w), `kanji: ${r} → ${w} is kana → kanji`));

// ─── Sync ──────────────────────────────────────────────────────────────────
const J = JSON.stringify;
const base = { answers: { 'food:N5': { text: 'すしです。', t: 1 }, 'hobby:N5': { text: 'テニス', t: 1 } } };
const out = JSON.parse(M.mergeAll({ tokidoki_conversation: J(base) },
  { tokidoki_conversation: J({ answers: { 'food:N5': { text: 'ラーメンです。', t: 5 }, 'hobby:N5': { text: 'テニス', t: 1 }, 'family:N4': { text: '四人家族です。', t: 3 } } }) },
  { tokidoki_conversation: J({ answers: { 'food:N5': { text: 'そばです。', t: 4 }, 'season:N3': { text: '冬です。', t: 6 } } }) },
).tokidoki_conversation);
ok(out.answers['food:N5'].text === 'ラーメンです。', 'sync: the newer answer wins');
ok(out.answers['family:N4'] && out.answers['season:N3'], 'sync: answers from both devices kept');
ok(!out.answers['hobby:N5'], 'sync: an answer cleared on one device stays cleared');

console.log(`conversation: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
