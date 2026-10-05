// Romaji → hiragana as you type, like a Japanese IME in kana mode.
// "kinou wa" becomes "きのう わ"; text that is already kana or kanji is left
// alone. An unfinished syllable ("k", "ky", a lone "n") stays as typed until
// the next letter decides it; flush() settles it (a trailing "n" → ん).
(function (global) {
  'use strict';

  const TABLE = {
    a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
    ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ',
    ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
    sa: 'さ', si: 'し', shi: 'し', su: 'す', se: 'せ', so: 'そ',
    za: 'ざ', zi: 'じ', ji: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
    ta: 'た', ti: 'ち', chi: 'ち', tu: 'つ', tsu: 'つ', te: 'て', to: 'と',
    da: 'だ', di: 'ぢ', du: 'づ', de: 'で', do: 'ど',
    na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
    ha: 'は', hi: 'ひ', hu: 'ふ', fu: 'ふ', he: 'へ', ho: 'ほ',
    ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ',
    pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
    ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も',
    ya: 'や', yu: 'ゆ', yo: 'よ',
    ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ',
    la: 'ら', li: 'り', lu: 'る', le: 'れ', lo: 'ろ',
    wa: 'わ', wi: 'うぃ', we: 'うぇ', wo: 'を',
    va: 'ゔぁ', vi: 'ゔぃ', vu: 'ゔ', ve: 'ゔぇ', vo: 'ゔぉ',
    fa: 'ふぁ', fi: 'ふぃ', fe: 'ふぇ', fo: 'ふぉ',
    she: 'しぇ', je: 'じぇ', che: 'ちぇ',
    thi: 'てぃ', dhi: 'でぃ', twu: 'とぅ', dwu: 'どぅ',
    xa: 'ぁ', xi: 'ぃ', xu: 'ぅ', xe: 'ぇ', xo: 'ぉ',
    xya: 'ゃ', xyu: 'ゅ', xyo: 'ょ', xtu: 'っ', xtsu: 'っ', xwa: 'ゎ',
    ltu: 'っ', ltsu: 'っ', lya: 'ゃ', lyu: 'ゅ', lyo: 'ょ',
    '-': 'ー',
  };
  // Palatalised rows: kya, sha, cha, ja, …
  const YOON = {
    ky: 'き', gy: 'ぎ', sy: 'し', sh: 'し', zy: 'じ', jy: 'じ', j: 'じ',
    ty: 'ち', cy: 'ち', ch: 'ち', dy: 'ぢ', ny: 'に', hy: 'ひ', by: 'び',
    py: 'ぴ', my: 'み', ry: 'り',
  };
  Object.keys(YOON).forEach(k => {
    TABLE[k + 'a'] = YOON[k] + 'ゃ';
    TABLE[k + 'u'] = YOON[k] + 'ゅ';
    TABLE[k + 'o'] = YOON[k] + 'ょ';
  });
  // Keys the user may still be in the middle of typing ("k", "sh", "xts").
  const PREFIXES = new Set();
  Object.keys(TABLE).forEach(k => {
    for (let n = 1; n < k.length; n++) PREFIXES.add(k.slice(0, n));
  });
  const MAX_KEY = Math.max(...Object.keys(TABLE).map(k => k.length));

  const isLetter = ch => ch >= 'a' && ch <= 'z';
  const isVowel = ch => 'aeiou'.includes(ch);

  // Converts every finished romaji syllable in `text`. With `final`, a
  // dangling "n" becomes ん; other unfinished letters are kept as typed.
  function toHiragana(text, final) {
    const src = String(text);
    const low = src.toLowerCase();
    let out = '';
    let i = 0;
    while (i < low.length) {
      const c = low[i];
      if (!isLetter(c) && c !== '-') { out += src[i]; i++; continue; }

      let matched = false;
      for (let len = Math.min(MAX_KEY, low.length - i); len >= 1; len--) {
        const kana = TABLE[low.substr(i, len)];
        if (kana) { out += kana; i += len; matched = true; break; }
      }
      if (matched) continue;

      const next = low[i + 1];
      if (c === 'n') {
        if (next === "'") { out += 'ん'; i += 2; continue; }
        if (next === 'n') {
          const after = low[i + 2];
          // "nna" is ん + な; "nn" before a consonant (or at the end) is ん.
          if (after !== undefined && (isVowel(after) || after === 'y')) { out += 'ん'; i += 1; continue; }
          if (after === undefined && !final) { out += src.slice(i); break; }
          out += 'ん'; i += 2; continue;
        }
        if (next !== undefined && isLetter(next) && !isVowel(next) && next !== 'y') { out += 'ん'; i += 1; continue; }
        if (next === undefined) { out += final ? 'ん' : src[i]; i++; continue; }
        if (!isLetter(next)) { out += 'ん'; i++; continue; }
      }
      // Doubled consonant → small っ ("kitte", "matcha").
      if (isLetter(next) && !isVowel(c) && (next === c || (c === 't' && next === 'c'))) {
        out += 'っ'; i++; continue;
      }
      // Possibly half-typed syllable at the end: wait for more letters.
      const rest = low.slice(i);
      if (PREFIXES.has(rest)) { out += src.slice(i); break; }
      out += src[i]; i++;
    }
    return out;
  }

  function enabled(input) {
    return (input.getAttribute('lang') || '').startsWith('ja');
  }

  function convertInput(input, final) {
    if (!enabled(input)) return;
    const value = input.value;
    const caret = input.selectionStart == null ? value.length : input.selectionStart;
    const before = toHiragana(value.slice(0, caret), final);
    const next = before + value.slice(caret);
    if (next === value) return;
    input.value = next;
    try { input.setSelectionRange(before.length, before.length); } catch { /* not focused */ }
  }

  // Converts while typing; skipped mid-composition so a real Japanese IME
  // (or a phone's kana keyboard) keeps working untouched. Only converts when
  // the input's lang is Japanese, so English answer boxes are left alone.
  function attach(input) {
    if (!input || input.dataset.romaji) return;
    input.dataset.romaji = 'on';
    input.addEventListener('input', (e) => {
      if (e.isComposing) return;
      convertInput(input, false);
    });
    input.addEventListener('blur', () => convertInput(input, true));
  }

  // Settles any unfinished syllable and returns the input's value.
  function flush(input) {
    convertInput(input, true);
    return input.value;
  }

  global.Romaji = { toHiragana, attach, flush };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = global.Romaji;
  }
})(typeof window !== 'undefined' ? window : globalThis);
