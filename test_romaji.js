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

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
