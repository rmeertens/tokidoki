// Japanese deinflection: from a conjugated word back to its dictionary form,
// the way pop-up dictionaries (Yomichan, 10ten) do it. 食べたかった →
// 食べたい → 食べる; 泳いで → 泳ぐ; 澄んでいて → 澄んでいる → 澄む;
// 明るくて → 明るい; 勉強しました → 勉強する.
//
// deinflect(word) returns every candidate { base, type, steps } — the word
// itself among them — where type is the dictionary form's kind: v1 (ichidan),
// v5 (godan), vs (する), vk (来る), adj (い-adjective), or '' for the word
// as it stands. Candidates aren't checked against a dictionary: the caller
// keeps the ones it knows (see segment() in conversation.js).
//
// Rules are [ending, replacement, types the ending can be, type it gives].
// They chain: 食べたかった — かった→い gives the adjective 食べたい, then
// たい→る (from an adjective) gives the ichidan 食べる.
(function (global) {
  'use strict';

  const ANY = ['', 'v1', 'v5', 'vs', 'vk', 'adj', 'te'];
  const RULES = [];
  // `kanji`: only for a word with a kanji in it — a bare stem in kana (に,
  // で, より) is far more often a particle than a verb.
  const rule = (from, to, inTypes, outType, kanji = false) => RULES.push([from, to, inTypes, outType, kanji]);
  const HAS_KANJI = /[㐀-䶿一-鿿々]/;

  // Godan rows: dictionary ending → its i-, a-, e-, o-stems and て/た forms.
  const GODAN = [
    ['う', 'い', 'わ', 'え', 'お', 'って', 'った'],
    ['く', 'き', 'か', 'け', 'こ', 'いて', 'いた'],
    ['ぐ', 'ぎ', 'が', 'げ', 'ご', 'いで', 'いだ'],
    ['す', 'し', 'さ', 'せ', 'そ', 'して', 'した'],
    ['つ', 'ち', 'た', 'て', 'と', 'って', 'った'],
    ['ぬ', 'に', 'な', 'ね', 'の', 'んで', 'んだ'],
    ['ぶ', 'び', 'ば', 'べ', 'ぼ', 'んで', 'んだ'],
    ['む', 'み', 'ま', 'め', 'も', 'んで', 'んだ'],
    ['る', 'り', 'ら', 'れ', 'ろ', 'って', 'った'],
  ];
  const POLITE = ['ます', 'ました', 'ません', 'ませんでした', 'ましょう', 'まして'];

  GODAN.forEach(([u, i, a, e, o, te, ta]) => {
    POLITE.forEach(p => rule(i + p, u, ANY, 'v5'));
    rule(i, u, [''], 'v5', true);               // the bare stem: 作り(方), 泳ぎ
    rule(i + 'たい', u, ['adj', ''], 'v5');
    rule(i + 'ながら', u, ANY, 'v5');
    rule(i + 'そう', u, ANY, 'v5');
    rule(te, u, ['te', ''], 'v5');
    rule(ta, u, ANY, 'v5');
    rule(ta + 'ら', u, ANY, 'v5');
    rule(ta + 'り', u, ANY, 'v5');
    rule(a + 'ない', u, ['adj', ''], 'v5');
    rule(a + 'ず', u, ANY, 'v5');
    rule(a + 'れる', u, ['v1'], 'v5');           // passive
    rule(a + 'せる', u, ['v1'], 'v5');           // causative
    rule(e + 'る', u, ['v1'], 'v5', true);       // potential
    rule(e + 'ば', u, ANY, 'v5');
    rule(e, u, [''], 'v5', true);               // imperative
    rule(o + 'う', u, ANY, 'v5');               // volitional
  });
  // 行く: 行って / 行った, not 行いて.
  ['行', 'い'].forEach(k => {
    rule(k + 'って', k + 'く', ['te', ''], 'v5');
    rule(k + 'った', k + 'く', ANY, 'v5');
    rule(k + 'ったら', k + 'く', ANY, 'v5');
    rule(k + 'ったり', k + 'く', ANY, 'v5');
  });

  // Ichidan: the stem is the word without る.
  POLITE.forEach(p => rule(p, 'る', ANY, 'v1'));
  [['たい', 'adj'], ['ながら', ''], ['そう', ''], ['て', 'te'], ['た', ''], ['たら', ''], ['たり', ''],
    ['ない', 'adj'], ['ず', ''], ['られる', 'v1'], ['させる', 'v1'], ['れる', 'v1'], ['よう', ''], ['れば', ''], ['ろ', '']]
    .forEach(([end, t]) => rule(end, 'る', t === 'adj' ? ['adj', ''] : t === 'te' ? ['te', ''] : t === 'v1' ? ['v1'] : ANY, 'v1'));

  // The bare stem (見舞われ、… / 食べ): only after an e- or i-row kana.
  [...'えけげせぜてでねへべぺめれいきぎしじちにひびぴみり'].forEach(k => rule(k, k + 'る', [''], 'v1', true));

  // する and 来る.
  rule('し', 'する', [''], 'vs', true);          // 両立し(やすい), 勉強し(に)
  const SURU = ['します', 'しました', 'しません', 'しませんでした', 'しましょう', 'したい', 'して', 'した', 'したら', 'したり',
    'しない', 'しよう', 'すれば', 'される', 'させる', 'しながら', 'しそう', 'せず', 'できる', 'できます', 'できました', 'できません', 'できない'];
  SURU.forEach(f => rule(f, 'する', f === 'したい' || f === 'しない' || f === 'できない' ? ['adj', ''] : f === 'して' ? ['te', ''] : /^(される|させる|できる)$/.test(f) ? ['v1', ''] : ANY, 'vs'));
  [['き', 'こ', 'く'], ['来', '来', '来']].forEach(([ki, ko, ku]) => {
    POLITE.forEach(p => rule(ki + p, ku + 'る', ANY, 'vk'));
    rule(ki + 'たい', ku + 'る', ['adj', ''], 'vk');
    rule(ki + 'て', ku + 'る', ['te', ''], 'vk');
    rule(ki + 'た', ku + 'る', ANY, 'vk');
    rule(ki + 'たら', ku + 'る', ANY, 'vk');
    rule(ko + 'ない', ku + 'る', ['adj', ''], 'vk');
    rule(ko + 'よう', ku + 'る', ANY, 'vk');
    rule(ku + 'れば', ku + 'る', ANY, 'vk');
    rule(ko + 'られる', ku + 'る', ['v1'], 'vk');
  });

  // い-adjectives (and the adjectives the rules above make: 〜たい, 〜ない).
  [['く', ANY], ['くて', ANY], ['かった', ANY], ['くない', ['adj', '']], ['くなかった', ANY], ['ければ', ANY],
    ['さ', ANY], ['そう', ANY], ['すぎる', ['v1']], ['くなる', ['v5']], ['かったら', ANY]]
    .forEach(([end, ins]) => rule(end, 'い', ins, 'adj'));
  [['よく', ANY], ['よくて', ANY], ['よかった', ANY], ['よくない', ['adj', '']], ['よければ', ANY]].forEach(([end, ins]) => rule(end, 'いい', ins, 'adj'));

  // Helpers after a て-form: 〜ている, 〜てしまう, 〜てみる … → the て-form.
  [['いる', 'v1'], ['る', 'v1'], ['しまう', 'v5'], ['ちゃう', 'v5'], ['みる', 'v1'], ['おく', 'v5'], ['とく', 'v5'], ['くる', 'vk'],
    ['いく', 'v5'], ['もらう', 'v5'], ['くれる', 'v1'], ['あげる', 'v1'], ['ある', 'v5'], ['ほしい', 'adj']]
    .forEach(([aux, t]) => {
      ['て', 'で'].forEach(te => rule(te + aux, te, [t], 'te'));
    });
  // Polite です / でした after an adjective or a noun: 明るいです, 静かでした.
  ['です', 'でした', 'ですか', 'でしょう'].forEach(d => rule(d, '', ANY, ''));

  const DICT = new Set(['', 'v1', 'v5', 'vs', 'vk', 'adj']);
  // Rules by the last character of their ending, so a word only meets the
  // rules it could match.
  const BY_LAST = new Map();
  RULES.forEach(r => {
    const k = r[0].slice(-1);
    if (!BY_LAST.has(k)) BY_LAST.set(k, []);
    BY_LAST.get(k).push(r);
  });
  const cache = new Map();

  // Every way `word` could be a conjugated form, the word itself first.
  function deinflect(word) {
    if (cache.has(word)) return cache.get(word);
    if (cache.size > 20000) cache.clear();
    const out = [{ base: word, type: '', steps: [] }];
    cache.set(word, out);
    const seen = new Map([[word + '|*', true]]);
    const queue = [{ base: word, types: ANY, steps: [] }];
    while (queue.length) {
      const cur = queue.shift();
      if (cur.steps.length >= 6) continue;
      for (const [from, to, ins, outType, needsKanji] of BY_LAST.get(cur.base.slice(-1)) || []) {
        if (needsKanji && (!HAS_KANJI.test(cur.base) || cur.base.length < 2)) continue;
        if (!cur.base.endsWith(from) || cur.base.length <= from.length - to.length) continue;
        if (!ins.some(t => cur.types.includes(t))) continue;
        const base = cur.base.slice(0, cur.base.length - from.length) + to;
        if (!base || base === to && !to) continue;
        const key = base + '|' + outType;
        if (seen.has(key)) continue;
        seen.set(key, true);
        const next = { base, types: [outType], steps: cur.steps.concat(from) };
        queue.push(next);
        if (DICT.has(outType)) out.push({ base, type: outType, steps: next.steps });
      }
    }
    return out;
  }

  const api = { deinflect, RULES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.JpDeinflect = api;
})(typeof window !== 'undefined' ? window : globalThis);
