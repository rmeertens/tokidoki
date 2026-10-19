// Checks for romaji.js: typed romaji turns into the hiragana a Japanese IME
// would give, and kana or kanji already in the text are left alone.
const Romaji = require('./romaji.js');

let passed = 0;
let failed = 0;
function check(input, expected, final = true) {
  const got = Romaji.toHiragana(input, final);
  if (got === expected) passed++;
  else { failed++; console.log(`  FAIL: ${JSON.stringify(input)} → ${got} (expected ${expected})`); }
}

check('kinou wa', 'きのう わ');
check('tabemasu', 'たべます');
check('tabemashita', 'たべました');
check('konnichiha', 'こんにちは');
check('konnnichiha', 'こんにちは');
check('onna', 'おんな');
check("kan'i", 'かんい');
check('kani', 'かに');
check('hon', 'ほん');
check('hon', 'ほn', false);
check('honn', 'ほnn', false);
check('shinbun', 'しんぶん');
check('kitte', 'きって');
check('matcha', 'まっちゃ');
check('kyou', 'きょう');
check('jugyou', 'じゅぎょう');
check('tsukatte', 'つかって');
check('chotto', 'ちょっと');
check('benkyou shimasu', 'べんきょう します');
check('ra-men', 'らーめん');
check('Tabeta', 'たべた');
check('k', 'k', false);
check('ky', 'ky', false);
check('たべ masu', 'たべ ます');
check('食べmasu', '食べます');
check('たべます', 'たべます');
check('kinyoubi', 'きにょうび');
check('kin\'youbi', 'きんようび');
check('sanpo', 'さんぽ');

// Answer boxes: Japanese punctuation, no spaces between Japanese words.
function checkJa(input, expected, final = true) {
  const got = Romaji.toJapanese(input, final);
  if (got === expected) passed++;
  else { failed++; console.log(`  FAIL: toJapanese ${JSON.stringify(input)} → ${got} (expected ${expected})`); }
}
checkJa('kinou wa, sushi wo tabemashita.', 'きのうわ、すしをたべました。');
checkJa('hon.', 'ほん。');
checkJa('hon ', 'ほん', false);
checkJa('genki desu ka?', 'げんきですか？');
checkJa('sugoi!', 'すごい！');
checkJa('食べます. ', '食べます。');
checkJa('きのう　わ', 'きのうわ');
checkJa('3.5jikan', '3.5じかん');
checkJa('1,000en', '1,000えん');
checkJa('2. ', '2。');
checkJa('k', 'k', false);

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
