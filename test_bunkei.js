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
