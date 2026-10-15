// Checks for sentence-orders.js: the other word orders (and 私は or not) a
// typed Sentences answer counts as right — the ones that should, and none
// that move a phrase into another clause or read wrong.
global.window = global;
require('./sentences-data.js');
require('./sentences-words.js');
const SentenceOrders = require('./sentence-orders.js');

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
const orders = ja => {
  const { sentence, line } = find(ja);
  return SentenceOrders.variants(sentence, line, SENTENCE_WORDS.gloss).map(v => v.ja);
};
function accepts(ja, alt) {
  check(orders(ja).includes(alt), `${ja} should accept ${alt}`);
}
function rejects(ja, alt) {
  check(!orders(ja).includes(alt), `${ja} shouldn't accept ${alt}`);
}

// ─── Every sentence ──────────────────────────────────────────────────────────

const ruby = /<ruby>(.*?)<rp>\(<\/rp><rt>(.*?)<\/rt><rp>\)<\/rp><\/ruby>/g;
Object.entries(TRANSLATE_SENTENCES).forEach(([ch, list]) => list.forEach((s, i) => {
  const id = `${ch}:${i}`;
  const vs = SentenceOrders.variants(s, SENTENCE_WORDS.lines[id], SENTENCE_WORDS.gloss);
  check(vs[0].ja === s.ja && vs[0].jaHtml === s.jaHtml, `${id}: first version isn't the sentence itself`);
  check(new Set(vs.map(v => v.ja)).size === vs.length, `${id}: a version twice`);
  check(vs.length <= 50, `${id}: ${vs.length} versions`);
  vs.forEach(v => {
    check(v.jaHtml.replace(ruby, '$1') === v.ja, `${id}: furigana of "${v.ja}" doesn't spell it`);
    check(/[。？！?!]$/.test(v.ja) === /[。？！?!]$/.test(s.ja), `${id}: "${v.ja}" lost its ending`);
  });
}));

// ─── Word order ──────────────────────────────────────────────────────────────

accepts('日曜日に友達と写真を撮りました。', '友達と日曜日に写真を撮りました。');
accepts('日曜日に友達と写真を撮りました。', '写真を友達と日曜日に撮りました。');
accepts('日曜日に友達と写真を撮りました。', '私は友達と日曜日に写真を撮りました。');
accepts('毎週友達と映画を見ます。', '友達と毎週映画を見ます。');
accepts('机の上に本があります。', '本が机の上にあります。');
accepts('父は毎晩ビールを飲みます。', '毎晩父はビールを飲みます。');
accepts('父は毎晩ビールを飲みます。', '父はビールを毎晩飲みます。');
accepts('先生は教室にいませんでした。', '教室に先生はいませんでした。');
accepts('母にセーターを編んであげました。', 'セーターを母に編んであげました。');
// The verb stays last.
rejects('日曜日に友達と写真を撮りました。', '撮りました日曜日に友達と写真を。');
// No phrase moves into another clause, or out of one.
check(orders('これは母が作ったケーキです。').length === 1, 'これは母が作ったケーキです: no other order');
rejects('明日晴れると思います。', '私は晴れると明日思います。');
rejects('明日雨が降るかどうか分かりません。', '雨が明日降るかどうか分かりません。');
rejects('駅がどこにあるか知っていますか。', 'どこに駅があるか知っていますか。');
rejects('社長はもうお帰りになりました。', 'もうお帰りに社長はなりました。');
rejects('車に気をつけてください。', '気を車につけてください。');
rejects('この店は八時までです。', '八時までこの店はです。');
// Two phrases with the same particle keep their order.
rejects('泥棒に家に入られました。', '家に泥棒に入られました。');
rejects('クラスの中で、田中さんが一番背が高いです。', 'クラスの中で、一番背が田中さんが高いです。');
// The topic stays up front.
rejects('私は魚を食べません。', '魚を私は食べません。');
rejects('父は私に自転車をくれました。', '私に父は自転車をくれました。');
// と as "and" stays with its noun.
check(orders('郵便局は銀行と病院の間にあります。').every(v => v.includes('銀行と病院の間に')), '銀行と病院 stays together');

// ─── 私は ────────────────────────────────────────────────────────────────────

accepts('私は毎日勉強します。', '毎日勉強します。');
accepts('手紙を書きました。', '私は手紙を書きました。');
accepts('私は東京大学の学生です。', '東京大学の学生です。');
rejects('手紙を書きました。', '手紙を私は書きました。');
// Only for "I" sentences.
rejects('山田さんは日本語を話します。', '私は山田さんは日本語を話します。');
check(!orders('彼はアメリカ人です。').some(v => v.startsWith('私')), 'no 私は for "He is American."');

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
