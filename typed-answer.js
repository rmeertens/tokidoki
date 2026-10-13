// Checks a typed flashcard answer — an English meaning or a Japanese word —
// for the Vocabulary page's typing practice and the Flashcards page's
// "Type answers" option.
//
// Meanings are free text like "To meet, to see" or "(my) older brother
// (humble)", so a typed meaning counts when it matches any one of the
// listed senses (split on , ; /), with or without what's in brackets, a
// leading "to" / "a" / "the", case and punctuation; one slip of a letter is
// forgiven in answers of six letters or more. Japanese counts when it's the
// word itself or its reading, katakana and hiragana alike.

(function (global) {
  'use strict';

  // Lower case, no punctuation or extra spaces: "Ah!" → "ah".
  function plain(s) {
    return String(s).normalize('NFKC').toLowerCase()
      .replace(/[’‘`]/g, "'")
      .replace(/[^a-z0-9' ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function dropArticles(s) {
    return s.replace(/^(to be|to|a|an|the|be) /, '');
  }

  // Splits on , ; / outside brackets.
  function splitSenses(meaning) {
    const out = [];
    let depth = 0, cur = '';
    for (const ch of String(meaning)) {
      if (ch === '(' || ch === '[') depth++;
      else if ((ch === ')' || ch === ']') && depth) depth--;
      if (!depth && (ch === ',' || ch === ';' || ch === '/')) { out.push(cur); cur = ''; continue; }
      cur += ch;
    }
    out.push(cur);
    return out.map(s => s.trim()).filter(Boolean);
  }

  // Every form of the meaning that counts as right, normalised.
  function meaningOptions(meaning) {
    const opts = new Set();
    const add = s => {
      const p = plain(s);
      if (!p) return;
      opts.add(p);
      opts.add(dropArticles(p));
      opts.add(dropArticles(dropArticles(p)));
    };
    const whole = String(meaning);
    add(whole.replace(/\([^)]*\)|\[[^\]]*\]/g, ' '));
    splitSenses(whole).forEach(sense => {
      add(sense.replace(/\([^)]*\)|\[[^\]]*\]/g, ' '));
      add(sense);
      // "(my) older brother (humble)" → "my older brother" too.
      const groups = sense.match(/\([^)]*\)/g) || [];
      groups.forEach((keep, i) => {
        let n = 0;
        add(sense.replace(/\([^)]*\)/g, g => (n++ === i ? g : ' ')));
      });
      // "Kind, warm(hearted)" — the bracketed bit as part of the word.
      add(sense.replace(/[()[\]]/g, ''));
    });
    opts.delete('');
    return [...opts];
  }

  // Edit distance, stopping early once it passes `max`.
  function withinEdits(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return false;
    let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      let best = i;
      for (let j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (cur[j] < best) best = cur[j];
      }
      if (best > max) return false;
      prev = cur;
    }
    return prev[b.length] <= max;
  }

  // 'exact', 'close' (a typo away from one sense) or '' for wrong. Several
  // typed senses ("meet, see") must all be right.
  function checkMeaning(typed, meaning) {
    const options = meaningOptions(meaning);
    const one = (t) => {
      const p = dropArticles(dropArticles(plain(t)));
      if (!p) return '';
      if (options.includes(p) || options.includes(plain(t))) return 'exact';
      if (p.length >= 6 && options.some(o => o.length >= 6 && withinEdits(p, o, 1))) return 'close';
      return '';
    };
    const whole = one(typed);
    if (whole) return whole;
    const parts = splitSenses(typed);
    if (parts.length < 2) return '';
    const results = parts.map(one);
    if (results.some(r => !r)) return '';
    return results.includes('close') ? 'close' : 'exact';
  }

  // Japanese, compared as hiragana without spaces or punctuation.
  function kanaKey(s) {
    return String(s).normalize('NFKC')
      .replace(/[ァ-ヶ]/g, k => String.fromCharCode(k.charCodeAt(0) - 0x60))
      .replace(/[\s　。、．，,.!?！？「」『』・～〜\-]/g, '');
  }

  function checkJapanese(typed, answers) {
    const t = kanaKey(typed);
    return !!t && answers.some(a => a && kanaKey(a) === t);
  }

  // A kanji's readings as typeable answers: "ひと-・ひとつ" and
  // "あ.がる" → ひと, ひとつ, あがる; on'yomi as they are.
  function kanjiReadings(info) {
    const list = [];
    [info && info.on, info && info.kun].forEach(r => {
      String(r || '').split(/[・、,\s]+/).forEach(x => {
        const clean = x.replace(/[-.]/g, '');
        if (clean) list.push(clean);
      });
    });
    return list;
  }

  const api = { checkMeaning, checkJapanese, kanjiReadings, meaningOptions };
  global.TypedAnswer = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
