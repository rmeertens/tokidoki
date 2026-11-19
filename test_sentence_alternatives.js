// Checks for sentence-alternatives.js: the other right answers to a
// Sentences card (and why each is right) — the ones that should count, the
// ones that shouldn't, and what the answer side lists.
global.window = global;
require('./sentences-data.js');
require('./sentences-words.js');
require('./sentence-orders.js');
const Alt = require('./sentence-alternatives.js');

const { TRANSLATE_SENTENCES, SENTENCE_WORDS } = global;

let passed = 0;
let failed = 0;
function check(ok, label) {
  if (ok) passed++;
  else { failed++; console.log(`  FAIL: ${label}`); }
}

const find = ja => {
  for (const [ch, list] of Object.entries(TRANSLATE_SENTENCES)) {
    const i = list.findIndex(s => s.ja === ja);
    if (i >= 0) return { sentence: list[i], line: SENTENCE_WORDS.lines[`${ch}:${i}`] };
  }
  throw new Error(`no sentence ${ja}`);
};
const versions = ja => {
  const { sentence, line } = find(ja);
  return Alt.japanese(sentence, line, SENTENCE_WORDS.gloss);
};
function accepts(ja, alt, kind) {
  const v = versions(ja).find(x => x.ja === alt);
  check(v, `${ja} should accept ${alt}`);
  if (v && kind) check(v.kinds.includes(kind), `${alt}: kinds ${v.kinds} should include ${kind}`);
}
function rejects(ja, alt) {
  check(!versions(ja).some(v => v.ja === alt), `${ja} shouldn't accept ${alt}`);
}

// ─── Every sentence ──────────────────────────────────────────────────────────

const ruby = /<ruby>(.*?)<rp>\(<\/rp><rt>(.*?)<\/rt><rp>\)<\/rp><\/ruby>/g;
Object.entries(TRANSLATE_SENTENCES).forEach(([ch, list]) => list.forEach((s, i) => {
  const id = `${ch}:${i}`;
  const vs = Alt.japanese(s, SENTENCE_WORDS.lines[id], SENTENCE_WORDS.gloss);
  check(vs[0].ja === s.ja && vs[0].kinds.length === 0, `${id}: first version isn't the sentence itself`);
  check(new Set(vs.map(v => v.jaHtml)).size === vs.length, `${id}: a version twice`);
  vs.forEach(v => {
    check(v.jaHtml.replace(ruby, '$1') === v.ja, `${id}: furigana of "${v.ja}" doesn't spell it`);
    check(v === vs[0] || v.kinds.length > 0, `${id}: "${v.ja}" says nothing about how it differs`);
    check(v.kinds.every(k => Alt.WHY[k]), `${id}: "${v.ja}" has an unexplained kind ${v.kinds}`);
  });
  Alt.shown(vs).forEach(g => check(g.items.length && g.why && g.label, `${id}: an empty group ${g.kind}`));
}));

// ─── Japanese ────────────────────────────────────────────────────────────────

// Word order and 私は, from sentence-orders.js, now with a reason.
accepts('日曜日に友達と写真を撮りました。', '友達と日曜日に写真を撮りました。', 'order');
accepts('私は毎日勉強します。', '毎日勉強します。', 'no-watashi');
accepts('手紙を書きました。', '私は手紙を書きました。', 'add-watashi');
// Polite negatives.
accepts('私は会社員ではありません。', '私は会社員じゃありません。', 'negative');
accepts('私は会社員ではありません。', '私は会社員ではないです。', 'negative');
accepts('私は会社員ではありません。', '会社員じゃないです。');
accepts('この部屋は広くないです。', 'この部屋は広くありません。', 'negative');
accepts('試験はあまり難しくなかったです。', '試験はあまり難しくありませんでした。', 'negative');
accepts('ホテルの部屋はきれいじゃなかったです。', 'ホテルの部屋はきれいではありませんでした。', 'negative');
rejects('この部屋は広くないです。', 'この部屋は広くじゃないです。');
rejects('試験はあまり難しくなかったです。', '試験はあまり難しくありません。');
// 私の with family words.
accepts('私の母は看護師です。', '母は看護師です。', 'no-watashino');
accepts('父は髪が短いです。', '私の父は髪が短いです。', 'add-watashino');
rejects('私は姉に時計をもらいました。', '私は私の姉に時計をもらいました。');
rejects('母の日に何をあげましたか。', 'あなたは私の母の日に何をあげましたか。');
// あなたは.
accepts('あなたは何歳ですか。', '何歳ですか。', 'no-anata');
accepts('日曜日にどこへ行きますか。', 'あなたは日曜日にどこへ行きますか。', 'add-anata');
rejects('一緒に昼ご飯を食べませんか。', 'あなたは一緒に昼ご飯を食べませんか。');
rejects('少々お待ちいただけますか。', 'あなたは少々お待ちいただけますか。');
rejects('先生、何をお飲みになりますか。', 'あなたは先生、何をお飲みになりますか。');
rejects('昨日は何をしましたか。', 'あなたは昨日は何をしましたか。');
// 家 as うち, 僕 for 私.
accepts('週末に家に帰ります。', '週末にうちに帰ります。', 'uchi');
accepts('私は学生です。', '僕は学生です。', 'boku');
rejects('私は山田と申します。', '僕は山田と申します。');
rejects('彼はアメリカ人です。', '僕はアメリカ人です。');

// What the answer side lists: one-change versions only, the hidden kinds not.
{
  const groups = Alt.shown(versions('私は会社員ではありません。'));
  const kinds = groups.map(g => g.kind);
  check(kinds.includes('no-watashi') && kinds.includes('negative'), `私は会社員ではありません lists ${kinds}`);
  check(!kinds.includes('boku'), '僕 isn\'t listed, only explained when typed');
  const neg = groups.find(g => g.kind === 'negative');
  check(neg.items.length === 3, `three other negatives listed, not ${neg.items.length}`);
}
{
  const order = Alt.shown(versions('日曜日に友達と写真を撮りました。')).find(g => g.kind === 'order');
  check(order && order.items.length === 2 && order.more > 0, 'word orders: two shown, the rest counted');
}
check(Alt.shown(versions('これは母が作ったケーキです。')).every(g => g.kind !== 'order'), 'no other order listed for a clause');
check(Alt.reasons(['order', 'no-watashi']).length === 2, 'a version gets a reason for each change');

// ─── English ─────────────────────────────────────────────────────────────────

const tanaka = { ja: '田中さんは先生ですか。', en: 'Is Mr. Tanaka a teacher?' };
const enOk = (typed, s, kind) => {
  const r = Alt.matchEnglish(typed, s);
  check(r, `"${typed}" should be right for "${s.en}"`);
  if (r && kind !== undefined) {
    const got = r.map(([label]) => label);
    const want = kind ? [Alt.WHY[kind][0]] : [];
    check(JSON.stringify(got) === JSON.stringify(want), `"${typed}": reasons ${got}, expected ${want}`);
  }
};
const enNo = (typed, s) => check(!Alt.matchEnglish(typed, s), `"${typed}" shouldn't be right for "${s.en}"`);

enOk('is mr tanaka a teacher', tanaka, null);
enOk('Is Ms. Tanaka a teacher?', tanaka, 'san');
enOk('Is Tanaka-san a teacher?', tanaka, 'san');
enOk('Is Tanaka a teacher?', tanaka, 'san');
enOk('Is Mr. Tanaka the teacher?', tanaka, 'article');
enNo('Is Mr. Tanaka a doctor?', tanaka);
enOk('I do not eat fish.', { ja: '私は魚を食べません。', en: "I don't eat fish." }, null);
enOk("I'm a student", { ja: '私は学生です。', en: 'I am a student.' }, null);
enOk("You'd better take some medicine.", { ja: '薬を飲んだほうがいいですよ。', en: 'You had better take some medicine.' }, null);
enOk('My mom makes dinner.', { ja: '母は晩ご飯を作ります。', en: 'My mother makes dinner.' }, null);
enOk('I contacted a friend.', { ja: '友達に連絡しました。', en: 'I contacted my friend.' }, 'article');
enNo('This is the umbrella.', { ja: 'これは私の傘です。', en: 'This is my umbrella.' });
enNo('Is Ms. Tanaka a teacher?', { ja: '田中先生は先生ですか。', en: 'Is Mr. Tanaka a teacher?' });
enOk('My name is Yamada.', { ja: '私は山田と申します。', en: 'My name is Yamada. (humble)' }, null);

const shownEn = Alt.shown(Alt.english(tanaka));
check(shownEn.length === 1 && shownEn[0].items.map(v => v.en).join(' / ') === 'Is Ms. Tanaka a teacher? / Is Tanaka-san a teacher?',
  `Mr. Tanaka lists ${JSON.stringify(shownEn)}`);
check(Alt.english({ ja: '田中さんは日本人なのに、すしが嫌いです。', en: 'Even though Mr. Tanaka is Japanese, he dislikes sushi.' }).length === 1,
  'no Ms. for a sentence that says "he"');

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
