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
