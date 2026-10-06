// Checks for answer-diff.js: a wrong typed answer is diffed character by
// character against the expected one.
const AnswerDiff = require('./answer-diff.js');

let passed = 0;
let failed = 0;
function marks(side) {
  return side.map(c => (c.ok ? c.ch : `[${c.ch}]`)).join('');
}
function check(typed, expected, wantTyped, wantExpected) {
  const d = AnswerDiff.diff(typed, expected);
  const t = marks(d.typed), e = marks(d.expected);
  if (t === wantTyped && e === wantExpected) passed++;
  else { failed++; console.log(`  FAIL: ${typed} vs ${expected} → ${t} / ${e} (expected ${wantTyped} / ${wantExpected})`); }
}

check('たべます', 'たべます', 'たべます', 'たべます');
check('たべまして', 'たべました', 'たべまし[て]', 'たべまし[た]');
check('たべた', 'たべました', 'たべた', 'たべ[ま][し]た');
check('のんで', 'のみます', 'の[ん][で]', 'の[み][ま][す]');
check('いきって', 'いって', 'い[き]って', 'いって');
check('タベル', 'たべる', 'タベル', 'たべる');
check('すし を たべる。', 'すしをたべた', 'すし を たべ[る]。', 'すしをたべ[た]');
check('', 'たべる', '', '[た][べ][る]');

function checkClosest(typed, answers, want) {
  const got = AnswerDiff.closest(typed, answers);
  if (got === want) passed++;
  else { failed++; console.log(`  FAIL: closest(${typed}) → ${got} (expected ${want})`); }
}
checkClosest('たべなかた', ['たべなかった', '食べなかった'], 'たべなかった');
checkClosest('食べなかた', ['たべなかった', '食べなかった'], '食べなかった');

const html = AnswerDiff.toHtml(AnswerDiff.diff('のんで', 'のみます').typed, 'diff-wrong');
if (html === 'の<span class="diff-wrong">んで</span>') passed++;
else { failed++; console.log(`  FAIL: toHtml → ${html}`); }
if (AnswerDiff.toHtml([{ ch: '<', ok: false }], 'x') === '<span class="x">&lt;</span>') passed++;
else { failed++; console.log('  FAIL: toHtml escaping'); }

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
