// Kana → kanji conversion for an answer box, like a Japanese IME: after
// romaji.js has turned what you typed into hiragana, the kana just before
// the caret is looked up and its kanji spellings (and katakana) appear as
// buttons under the box. Space swaps the kana for the first one, Space
// again for the next, round to the kana again; tapping a button picks it.
//
// attach(input, lookup, opts) — lookup(hiragana) returns kanji spellings,
// best first. Only works while the input's lang is Japanese, like romaji.js.
// opts (all optional, for boxes where you write whole sentences):
//   suffix   look up the word just before the caret — the longest end of
//            the kana run that has kanji (わたしはにほん → にほん) — rather
//            than the whole run; nothing to offer means Space types a space
//   enabled  () => whether to offer anything right now
// After a pick the input gets an 'ime:pick' event.
(function (global) {
  'use strict';

  const KANA_RUN = /[ぁ-ゖァ-ヺー]+$/;
  const MAX = 8;

  const toHiragana = s => s.replace(/[ァ-ヶ]/g, k => String.fromCharCode(k.charCodeAt(0) - 0x60));
  const toKatakana = s => s.replace(/[ぁ-ゖ]/g, k => String.fromCharCode(k.charCodeAt(0) + 0x60));

  // The kana, its kanji spellings, then its katakana: what Space goes through.
  function choices(kana, lookup) {
    const list = [kana, ...(lookup(toHiragana(kana)) || []).slice(0, MAX), toKatakana(kana), toHiragana(kana)];
    return list.filter((c, i) => c && list.indexOf(c) === i);
  }

  function attach(input, lookup, opts = {}) {
    if (!input || input.dataset.ime) return;
    input.dataset.ime = 'on';
    const bar = document.createElement('div');
    bar.className = 'kanji-candidates hidden';
    bar.setAttribute('lang', 'ja');
    const anchor = input.closest('.answer-area') || input;
    anchor.insertAdjacentElement('afterend', bar);

    // { start, end, list, idx }: the stretch of text being converted.
    let state = null;
    const enabled = () => (input.getAttribute('lang') || '').startsWith('ja') && (!opts.enabled || opts.enabled());
    const caret = () => (input.selectionStart == null ? input.value.length : input.selectionStart);

    function current() {
      if (!enabled()) return null;
      const pos = caret();
      if (state && state.end === pos && input.value.slice(state.start, state.end) === state.list[state.idx]) return state;
      let before = input.value.slice(0, pos);
      // A final n that romaji.js is still holding (にほn) is read as ん.
      if (opts.suffix && /[ぁ-ゖ]n$/.test(before)) before = before.slice(0, -1) + 'ん';
      const m = before.match(KANA_RUN);
      if (!m) return null;
      if (opts.suffix) {
        for (let n = m[0].length; n >= 2; n--) {
          const kana = m[0].slice(-n);
          if ((lookup(toHiragana(kana)) || []).length) return { start: pos - n, end: pos, list: choices(kana, lookup), idx: 0 };
        }
        return null;
      }
      const list = choices(m[0], lookup);
      if (list.length < 2) return null;
      return { start: pos - m[0].length, end: pos, list, idx: 0 };
    }

    function render() {
      const s = current();
      if (!s) {
        bar.classList.add('hidden');
        bar.innerHTML = '';
        return;
      }
      // While converting, the kana itself is a choice too (to go back to it).
      const from = s.idx ? 0 : 1;
      bar.innerHTML = s.list.slice(from).map((c, i) => `<button type="button" class="kanji-candidate${s.idx === i + from ? ' active' : ''}" data-i="${i + from}" tabindex="-1">${c}</button>`).join('')
        + '<span class="kanji-candidates-hint">Space to convert</span>';
      bar.classList.remove('hidden');
    }

    function pick(s, idx) {
      const text = s.list[idx];
      input.value = input.value.slice(0, s.start) + text + input.value.slice(s.end);
      const end = s.start + text.length;
      try { input.setSelectionRange(end, end); } catch { /* not focused */ }
      state = { start: s.start, end, list: s.list, idx };
      render();
      input.dispatchEvent(new Event('ime:pick'));
    }

    input.addEventListener('keydown', (e) => {
      if (e.key !== ' ' || e.isComposing || e.ctrlKey || e.metaKey || e.altKey || !enabled()) return;
      if (global.Romaji) global.Romaji.flush(input);
      const s = current();
      if (!s) return;
      e.preventDefault();
      pick(s, (s.idx + 1) % s.list.length);
    });
    input.addEventListener('input', () => { state = null; render(); });
    input.addEventListener('click', render);
    // Keeps the focus (and caret) in the box while a button is tapped.
    bar.addEventListener('mousedown', e => e.preventDefault());
    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('.kanji-candidate');
      const s = current();
      if (!btn || !s) return;
      pick(s, +btn.dataset.i);
      input.focus();
    });
    // Called when the box is cleared or re-labelled for a new card.
    input.addEventListener('ime:reset', () => { state = null; render(); });
  }

  // Clears the candidates after the page changes the box's value itself.
  function reset(input) {
    if (input) input.dispatchEvent(new Event('ime:reset'));
  }

  const api = { attach, reset, choices };
  global.KanjiIme = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
