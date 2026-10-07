// Checks for bunkei-data.js: every usable verb × pattern builds a sensible
// sentence, typed-answer matching accepts both kanji and kana, and a few
// known sentences come out exactly right.
global.Conjugator = require('./conjugator.js');
require('./examples.js');
const { GENKI_VERBS } = require('./verbs.js');
const Bunkei = require('./bunkei-data.js');

let passed = 0;
let failed = 0;
function check(ok, label) {
  if (ok) passed++;
  else { failed++; console.log(`  FAIL: ${label}`); }
}

const verbs = Bunkei.usableVerbs(GENKI_VERBS);
check(verbs.length > 100, `expected 100+ usable verbs, got ${verbs.length}`);

let combos = 0;
verbs.forEach(verb => {
  const patterns = Bunkei.patternsFor(verb);
  check(patterns.length >= 15, `${verb.kanji}: only ${patterns.length} patterns`);
  patterns.forEach(p => {
    const b = Bunkei.build(verb, p.id);
    const where = `${verb.kanji} × ${p.id}`;
    combos++;
    check(!!b, `${where}: no sentence`);
    if (!b) return;
    check(!/undefined|NaN|\s\s/.test(b.ja + b.en), `${where}: bad text "${b.ja}" / "${b.en}"`);
    check(b.ja.endsWith('。'), `${where}: Japanese should end with 。: ${b.ja}`);
    check(/[.?]$/.test(b.en), `${where}: English should end with . or ?: ${b.en}`);
    check(b.focus.length > 0, `${where}: empty highlighted part`);
    check(`${b.before}${b.focus}。` === b.ja, `${where}: before + focus doesn't rebuild the sentence`);
    check(!/[一-鿿]/.test(b.kana), `${where}: kana version still has kanji: ${b.kana}`);
    check(Bunkei.matches(b.plain, b), `${where}: plain answer not accepted`);
    check(Bunkei.matches(b.kana, b), `${where}: kana answer not accepted`);
  });
});

const find = kanji => verbs.find(v => v.kanji === kanji);
const expect = (kanji, id, ja, en) => {
  const b = Bunkei.build(find(kanji), id);
  check(b && b.plain === ja, `${kanji} × ${id}: expected ${ja}, got ${b && b.plain}`);
  if (en) check(b && b.en === en, `${kanji} × ${id}: expected "${en}", got "${b && b.en}"`);
};
expect('食べる', 'sasete-kudasai', '寿司を食べさせてください。', 'Please let me eat sushi.');
expect('食べる', 'ta-koto-ga-aru', '寿司を食べたことがあります。', 'I have eaten sushi before.');
expect('行く', 'nakereba-naranai', '学校に行かなければなりません。', 'I have to go to school.');
expect('行く', 'ta-koto-ga-aru', '学校に行ったことがあります。', 'I have been to school before.');
expect('書く', 'potential-neg', '手紙を書けません。', "I can't write a letter.");
expect('来る', 'causative-passive', '父に日本に来させられました。');
expect('する', 'potential', '運動ができます。', 'I can get exercise.');
expect('勉強する', 'nakute-mo-ii', '日本語を勉強しなくてもいいです。');
expect('飲む', 'volitional-to-omou', 'コーヒーを飲もうと思っています。');
expect('食べる', 'nagara', '寿司を食べながら、テレビを見ます。', 'I watch TV while eating sushi.');
expect('勉強する', 'nagara', '日本語を勉強しながら、音楽を聞きます。');
expect('食べる', 'tara', '寿司を食べたら、連絡します。', "I'll get in touch once I've eaten sushi.");
expect('行く', 'ba-yokatta', '学校に行けばよかったです。');
expect('泳ぐ', 'you-ni-naru', 'やっとプールで泳げるようになりました。', 'I can finally swim in the pool.');
expect('する', 'you-to-suru', '運動をしようとしましたが、できませんでした。');
expect('磨く', 'zuni', '昨日は歯を磨かずに寝ました。', 'Yesterday I went to bed without brushing my teeth.');
expect('勉強する', 'zuni', '昨日は日本語を勉強せずに寝ました。');
expect('食べる', 'te-kara', '寿司を食べてから、歯を磨きます。', 'I brush my teeth after eating sushi.');
expect('入る', 'mae-ni', '部屋に入る前に、靴を脱ぎます。', 'I take off my shoes before entering the room.');
expect('作る', 'te-ageru', 'カレーを作ってあげましょうか。', 'Shall I make curry for you?');
expect('直す', 'te-kureru', '友達がパソコンを直してくれました。', 'My friend fixed the computer for me.');
expect('書く', 'te-morau', '兄に手紙を書いてもらいました。', 'I had my big brother write a letter for me.');
expect('食べる', 'passive', '弟に寿司を食べられました。', 'My little brother ate my sushi.');
expect('盗む', 'passive', '誰かに財布を盗まれました。', 'Someone stole my wallet.');
expect('飲む', 'sugiru', 'コーヒーを飲みすぎました。', 'I drank too much coffee.');
expect('勉強する', 'hajimeru', '先月から日本語を勉強し始めました。', 'I started studying Japanese last month.');
check(Bunkei.build(find('開ける'), 'nagara') === null, '開ける has no 〜ながら pairing');
// Patterns limited to a list of verbs: every listed verb exists and gets the pattern (catches typos).
const keyOf = v => (v.disambig ? `${v.kanji}_${v.disambig}` : v.kanji);
Bunkei.PATTERNS.filter(p => p.only).forEach(p => Object.keys(p.only).forEach(key => {
  const verb = verbs.find(v => keyOf(v) === key);
  check(verb && Bunkei.build(verb, p.id), `${p.id}: listed verb ${key} gets no sentence`);
}));
verbs.forEach(v => check(Bunkei.build(v, 'te-kara'), `${v.kanji}: no 〜てから sentence (add it to TE_KARA)`));
const nagaraVerbs = verbs.filter(v => Bunkei.build(v, 'nagara'));
check(nagaraVerbs.length >= 40, `expected 40+ verbs with 〜ながら, got ${nagaraVerbs.length}`);
check(Bunkei.build(find('結婚する'), 'mashou') === null, '結婚する should skip "let\'s … together"');
check(Bunkei.build(find('行く'), 'te-iru') === null, '行く should skip 〜ています (it means "has gone")');
check(!find('いる'), 'いる should be excluded');

const tabe = Bunkei.build(find('食べる'), 'tai');
check(Bunkei.matches('すしをたべたいです', tabe), 'all-hiragana answer accepted');
check(Bunkei.matches(' 寿司を食べたいです ', tabe), 'surrounding spaces ignored');
check(!Bunkei.matches('寿司を食べたいでした', tabe), 'wrong answer rejected');
check(!Bunkei.matches('', tabe), 'empty answer rejected');

console.log(`\n${combos} verb × pattern sentences; ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
