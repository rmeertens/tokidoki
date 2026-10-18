// Checks for jp-deinflect.js: conjugated words back to their dictionary forms.
const { deinflect } = require('./jp-deinflect.js');

let passed = 0;
let failed = 0;
function ok(cond, label) {
  if (cond) passed++;
  else { failed++; console.log('  FAIL: ' + label); }
}
const bases = w => deinflect(w).map(c => c.base);

[
  ['食べました', '食べる'], ['食べたかった', '食べる'], ['食べさせられなかった', '食べる'], ['たべません', 'たべる'],
  ['泳いで', '泳ぐ'], ['泳ぎました', '泳ぐ'], ['行った', '行く'], ['行って', '行く'], ['帰って', '帰る'], ['かえって', 'かえる'],
  ['読んでみたい', '読む'], ['住んでいます', '住む'], ['澄んでいて', '澄む'], ['はまっています', 'はまる'], ['会いました', '会う'],
  ['迷ってしまいました', '迷う'], ['作れる', '作る'], ['言われます', '言う'], ['見ました', '見る'], ['見舞われ', '見舞われる'],
  ['勉強しました', '勉強する'], ['両立し', '両立する'], ['できました', 'する'], ['来ました', '来る'], ['きました', 'くる'],
  ['明るくて', '明るい'], ['面白かった', '面白い'], ['大きくなりました', '大きい'], ['よかった', 'いい'], ['静かです', '静か'],
  ['年をとったら', '年をとる'],
].forEach(([w, b]) => ok(bases(w).includes(b), `${w} → ${b} (got ${bases(w).join(' ')})`));

// Kana that is far more often a particle doesn't turn into a verb.
['に', 'で', 'へ', 'より', 'ため', 'いい'].forEach(w => ok(!deinflect(w).some(c => c.type && /^v/.test(c.type)), `${w} stays itself`));
ok(deinflect('日本').length === 1, 'a noun has no other forms');
ok(deinflect('泳いで')[0].base === '泳いで' && deinflect('泳いで')[0].type === '', 'the word itself comes first');

console.log(`deinflect: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
