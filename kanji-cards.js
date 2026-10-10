// Kanji flashcards, kept apart from the word flashcards.
//
// Word flashcards live in tokidoki_story_words (the Stories deck, also fed by
// the Vocabulary page, the mystery game, Story Fill-in and Phrases). Kanji get their
// own deck here, under tokidoki_kanji_cards: { [kanji]: meta }, where meta
// keeps the kanji's meaning and readings (so a card still works on a page that
// doesn't load kanji-info-data.js) and the words it was saved from. Their
// schedules go in the shared SRS store under `kanji_card:<kanji>`, so Reset
// All Progress resets them too. Both decks are reviewed on flashcards.html.
//
// Anywhere a word is shown, `KanjiCards.breakdownHtml(word, from)` lists the
// kanji in it, each with its meaning, readings and a ＋ button that adds it
// to the kanji deck. Buttons are handled here, on the whole document, so a
// page only has to drop the HTML in; every button for the same kanji follows,
// and a `kanjicards:change` event ({ kanji, saved }) lets the page refresh
// anything else (counts, lists).
//
//   info(ch)      { meaning, on, kun, level } or null
//   chars(word)   the distinct kanji in a word, in order
//   has / add / remove / toggle, list(), load()
//   breakdownHtml(word, from, opts), chipsHtml(word, from, skip), buttonHtml(ch, from, opts)
(function (global) {
  'use strict';

  const KEY = 'tokidoki_kanji_cards';
  const SRS_KEY = 'tokidoki_srs';
  const KANJI_RE = /[一-鿿㐀-䶿々]/g;
  const MAX_WORDS = 6;

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Parsed once per stored value: pages render hundreds of buttons at a time.
  let cacheRaw = null;
  let cache = {};
  function peek() {
    let raw = null;
    try { raw = global.localStorage.getItem(KEY); } catch { return {}; }
    if (raw !== cacheRaw) {
      cacheRaw = raw;
      try { cache = JSON.parse(raw) || {}; } catch { cache = {}; }
    }
    return cache;
  }
  // A copy, safe to change and save.
  const load = () => JSON.parse(JSON.stringify(peek()));

  function save(cards) {
    try { global.localStorage.setItem(KEY, JSON.stringify(cards)); } catch { /* storage full or blocked */ }
  }

  const cardId = ch => `kanji_card:${ch}`;

  function chars(word) {
    const out = [];
    (String(word || '').match(KANJI_RE) || []).forEach(ch => {
      if (ch !== '々' && !out.includes(ch)) out.push(ch);
    });
    return out;
  }

  // { [kanji]: { level, meaning } } from the kanji quiz's JLPT lists, built
  // once they're loaded.
  let quizIdx = null;
  function quizIndex() {
    if (quizIdx) return quizIdx;
    const quiz = global.KANJI_QUIZ_DATA;
    if (!quiz) return {};
    quizIdx = {};
    ['n1', 'n2', 'n3', 'n4', 'n5'].forEach(level => {
      (quiz[level] || []).forEach(k => { quizIdx[k.kanji] = { level, meaning: k.meaning }; });
    });
    return quizIdx;
  }

  // Meaning and readings from kanji-info-data.js (KANJIDIC), falling back to
  // the kanji quiz's lists (meaning and JLPT level only), then to what the
  // saved card remembered.
  function info(ch, meta) {
    const ki = global.KANJI_INFO && global.KANJI_INFO[ch];
    const hit = quizIndex()[ch];
    const level = hit ? hit.level : '';
    const quizMeaning = hit ? hit.meaning : '';
    const saved = meta || peek()[ch];
    const meaning = (ki && ki.meaning) || quizMeaning || (saved && saved.meaning) || '';
    if (!meaning) return null;
    return {
      meaning,
      on: (ki && ki.on) || (saved && saved.on) || '',
      kun: (ki && ki.kun) || (saved && saved.kun) || '',
      level: level || (saved && saved.level) || '',
    };
  }

  const has = ch => Object.prototype.hasOwnProperty.call(peek(), ch);

  // `from` is the word the kanji was spotted in: { word, reading, meaning }.
  function add(ch, from) {
    const cards = load();
    const meta = cards[ch] || { added: Date.now(), words: [] };
    const i = info(ch, meta);
    if (i) Object.assign(meta, { meaning: i.meaning, on: i.on, kun: i.kun, level: i.level });
    if (from && from.word && from.word !== ch && !meta.words.some(w => w.word === from.word)) {
      meta.words.push({ word: from.word, reading: from.reading || '', meaning: from.meaning || '' });
      if (meta.words.length > MAX_WORDS) meta.words = meta.words.slice(-MAX_WORDS);
    }
    cards[ch] = meta;
    save(cards);
  }

  // Pages with their own copy of the SRS store in memory (app.js) set this,
  // so dropping a card's schedule doesn't get undone by their next save.
  let onRemove = null;

  function remove(ch) {
    const cards = load();
    delete cards[ch];
    save(cards);
    if (onRemove) onRemove(cardId(ch));
    else {
      try {
        const srs = JSON.parse(global.localStorage.getItem(SRS_KEY)) || {};
        delete srs[cardId(ch)];
        delete srs[cardId(ch) + ':recall']; // the meaning → kanji direction
        global.localStorage.setItem(SRS_KEY, JSON.stringify(srs));
      } catch { /* storage unavailable */ }
    }
  }

  function toggle(ch, from) {
    if (has(ch)) { remove(ch); return false; }
    add(ch, from);
    return true;
  }

  // Saved kanji, newest first: [{ kanji, id, meta, info }].
  function list() {
    return Object.entries(load())
      .map(([kanji, meta]) => ({ kanji, id: cardId(kanji), meta, info: info(kanji, meta) }))
      .filter(c => c.info)
      .sort((a, b) => (b.meta.added || 0) - (a.meta.added || 0));
  }

  // Just the buttons, one per kanji in the word: for lists with no room for
  // the full breakdown. Kanji in `skip` (a string) are left out.
  function chipsHtml(word, from, skip = '') {
    const f = Object.assign({ word }, from || {});
    const btns = chars(word).filter(ch => !skip.includes(ch) && info(ch)).map(ch => buttonHtml(ch, f, { look: 'chip' }));
    return btns.length ? `<span class="kanji-cards-chips">${btns.join('')}</span>` : '';
  }

  function readingsText(i) {
    return [i.on ? `on: ${i.on}` : '', i.kun ? `kun: ${i.kun}` : ''].filter(Boolean).join('  ');
  }

  // look: 'icon' (＋ / ✓), 'label' (＋ Kanji card) or 'chip' (the kanji
  // itself, then ＋ / ✓).
  function buttonInner(ch, saved, look) {
    if (look === 'label') return saved ? '✓ Kanji card' : '＋ Kanji card';
    if (look === 'chip') return `<span lang="ja">${esc(ch)}</span><span aria-hidden="true">${saved ? '✓' : '＋'}</span>`;
    return `<span aria-hidden="true">${saved ? '✓' : '＋'}</span>`;
  }

  function buttonAttrs(ch, saved) {
    return `aria-pressed="${saved}" title="${saved ? `${ch} is in your kanji flashcards — click to remove` : `Add ${ch} to your kanji flashcards`}"` +
      ` aria-label="${saved ? 'Remove' : 'Add'} ${ch} ${saved ? 'from' : 'to'} kanji flashcards"`;
  }

  // A ＋/✓ button for one kanji; opts.look as for buttonInner.
  function buttonHtml(ch, from, opts = {}) {
    const saved = has(ch);
    const f = from || {};
    const look = opts.look || 'icon';
    return `<button type="button" class="kanji-card-btn kanji-card-btn-${look}${saved ? ' saved' : ''}"` +
      ` data-kanji-card="${esc(ch)}" data-look="${look}"` +
      ` data-from-word="${esc(f.word)}" data-from-reading="${esc(f.reading)}" data-from-meaning="${esc(f.meaning)}"` +
      ` ${buttonAttrs(ch, saved)}>${buttonInner(ch, saved, look)}</button>`;
  }

  // The kanji of a word, one row each: the character, its meaning and
  // readings, and a button to save it as a kanji flashcard. Empty for a word
  // with no kanji (or none we know). opts.title overrides the heading;
  // opts.compact drops it.
  function breakdownHtml(word, from, opts = {}) {
    const f = Object.assign({ word }, from || {});
    const rows = chars(word).map(ch => {
      const i = info(ch);
      if (!i) return '';
      const readings = readingsText(i);
      return `<li class="kanji-cards-row${has(ch) ? ' saved' : ''}" data-kanji-row="${esc(ch)}">
        <span class="kanji-cards-char" lang="ja">${esc(ch)}</span>
        <span class="kanji-cards-info">
          <span class="kanji-cards-meaning">${esc(i.meaning)}</span>
          ${readings ? `<span class="kanji-cards-reading" lang="ja">${esc(readings)}</span>` : ''}
        </span>
        ${buttonHtml(ch, f, { look: opts.compact ? 'icon' : 'label' })}
      </li>`;
    }).filter(Boolean);
    if (!rows.length) return '';
    const title = opts.compact ? '' : `<div class="kanji-cards-title">${esc(opts.title || 'Kanji in this word')}</div>`;
    return `<div class="kanji-cards-breakdown${opts.compact ? ' compact' : ''}">${title}<ul class="kanji-cards-list">${rows.join('')}</ul></div>`;
  }

  // Brings every button and row for one kanji in line with the deck.
  function sync(ch, root) {
    const saved = has(ch);
    const scope = root || global.document;
    const sel = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(ch) : ch;
    scope.querySelectorAll(`[data-kanji-card="${sel}"]`).forEach(btn => {
      btn.classList.toggle('saved', saved);
      btn.innerHTML = buttonInner(ch, saved, btn.dataset.look);
      btn.setAttribute('aria-pressed', saved);
      btn.title = saved ? `${ch} is in your kanji flashcards — click to remove` : `Add ${ch} to your kanji flashcards`;
      btn.setAttribute('aria-label', `${saved ? 'Remove' : 'Add'} ${ch} ${saved ? 'from' : 'to'} kanji flashcards`);
    });
    scope.querySelectorAll(`[data-kanji-row="${sel}"]`).forEach(row => row.classList.toggle('saved', saved));
  }

  if (global.document && global.document.addEventListener) {
    // Capture phase, and stopped here: the buttons often sit inside cards or
    // words that do something else when clicked (reveal, select, speak).
    global.document.addEventListener('click', e => {
      const btn = e.target.closest && e.target.closest('[data-kanji-card]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      const ch = btn.dataset.kanjiCard;
      const saved = toggle(ch, { word: btn.dataset.fromWord, reading: btn.dataset.fromReading, meaning: btn.dataset.fromMeaning });
      sync(ch);
      global.document.dispatchEvent(new CustomEvent('kanjicards:change', { detail: { kanji: ch, saved } }));
    }, true);
  }

  const api = {
    KEY, cardId, load, chars, info, has, add, remove, toggle, list, readingsText,
    buttonHtml, breakdownHtml, chipsHtml, sync,
    set onRemove(fn) { onRemove = fn; },
  };
  global.KanjiCards = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
