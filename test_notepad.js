// Checks for notepad.js: romaji (or an English word) turns into the expected
// top candidate, with furigana pieces on the kanji.
global.window = global;
require('./vocabulary-data.js');
require('./stories-data.js');
const fs = require('fs');
const vm = require('vm');
vm.runInThisContext(fs.readFileSync(require.resolve('./verbs.js'), 'utf8')
  + ';globalThis.GENKI_VERBS = GENKI_VERBS; globalThis.GENKI_ADJECTIVES = GENKI_ADJECTIVES;');
const Notepad = require('./notepad.js');

const dict = Notepad.buildDictionary();
const show = c => c.pieces.map(p => (p.r ? `${p.t}[${p.r}]` : p.t)).join('');

let passed = 0;
let failed = 0;
function check(input, expected, opts) {
  const got = Notepad.candidates(input, dict, opts)[0];
  const text = got ? show(got) : '(none)';
  if (text === expected) passed++;
  else { failed++; console.log(`  FAIL: ${JSON.stringify(input)} → ${text} (expected ${expected})`); }
}
function checkEq(label, got, expected) {
  if (JSON.stringify(got) === JSON.stringify(expected)) passed++;
  else { failed++; console.log(`  FAIL: ${label} → ${JSON.stringify(got)} (expected ${JSON.stringify(expected)})`); }
}

// Single words
check('neko', '猫[ねこ]');
check('nihon', '日本[にほん]');
check('terebi', 'テレビ');
check('kore', 'これ');
check('ha', 'は');
check('wo', 'を');
// Conjugated verbs and adjectives
check('tabemashita', '食[た]べました');
check('nondekudasai', '飲[の]んでください');
check('ikitai', '行[い]きたい');
check('itte', '行[い]って');
check('kimashita', '来[き]ました');
check('kaerimasu', '帰[かえ]ります');
check('takakatta', '高[たか]かった');
check('shitteimasu', '知[し]っています');
// Whole sentences
check('watashihagakuseidesu', '私[わたし]は学生[がくせい]です');
check('kyouhaamegafutteimasu', '今日[きょう]は雨[あめ]が降[ふ]っています');
check('tomodachitoeigawomimashita', '友達[ともだち]と映画[えいが]を見[み]ました');
check('nihongowohanashimasu', '日本語[にほんご]を話[はな]します');
check('tabetegakkouniikimasu', '食[た]べて学校[がっこう]に行[い]きます');
// English words
check('cat', '猫[ねこ]');
check('eat', '食[た]べる');
check('house', '家[いえ]');
// Options
check('neko', 'ねこ', { kanaFirst: true });
check('neko', 'ネコ', { katakana: true });

// Sentence candidates keep word boundaries and meanings for the breakdown panel.
const words = Notepad.candidates('watashihagakuseidesu', dict)[0].words;
checkEq('words', words.map(w => w.p.map(p => p.t).join('')), ['私', 'は', '学生', 'です']);
checkEq('meanings', words.map(w => !!w.m), [true, true, true, true]);

checkEq('align 食べる', Notepad.align('食べる', 'たべる'), [{ t: '食', r: 'た' }, { t: 'べる' }]);
checkEq('align 取り消す', Notepad.align('取り消す', 'とりけす'), [{ t: '取', r: 'と' }, { t: 'り' }, { t: '消', r: 'け' }, { t: 'す' }]);
checkEq('merge', Notepad.mergePieces([{ t: 'あ' }, { t: 'い' }, { t: '猫', r: 'ねこ' }]), [{ t: 'あい' }, { t: '猫', r: 'ねこ' }]);

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
