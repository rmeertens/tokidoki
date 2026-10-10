// The Phrases page (phrases.html): fun words and sentences from
// phrases-data.js, one section per category — ad slogans, anime lines,
// buzzwords of the year, what to say at a wedding… Filter by category or
// search, hide the English to test yourself, and listen to any phrase.
(function () {
  'use strict';

  const SETTINGS_KEY = 'tokidoki_phrases';
  const RUBY_RE = /([一-鿿々]+)\[([^\]]+)\]/g;
  const data = window.PHRASES_DATA || [];

  const $ = sel => document.querySelector(sel);

  function loadSettings() {
    try { return { furigana: true, english: true, category: 'all', ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) }; }
    catch { return { furigana: true, english: true, category: 'all' }; }
  }
  const settings = loadSettings();
  function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* storage unavailable */ }
  }

  const rubyHtml = text => text.replace(RUBY_RE, '<ruby>$1<rp>(</rp><rt>$2</rt><rp>)</rp></ruby>');
  const plainText = text => text.replace(RUBY_RE, '$1');
  const kanaText = text => text.replace(RUBY_RE, '$2');

  // Lower-cased text a search is matched against, worked out once per phrase.
  data.forEach(cat => cat.phrases.forEach(p => {
    p._search = [plainText(p.jp), kanaText(p.jp), p.en, p.note, cat.titleEn, plainText(cat.title)].join(' ').toLowerCase();
  }));

  let query = '';

  function category() {
    return data.some(c => c.id === settings.category) ? settings.category : 'all';
  }

  function renderChips() {
    const current = category();
    const total = data.reduce((n, c) => n + c.phrases.length, 0);
    $('#phrase-filters').innerHTML = [
      `<button type="button" class="meme-filter${current === 'all' ? ' active' : ''}" data-cat="all" aria-pressed="${current === 'all'}">All <span class="phrase-chip-count">${total}</span></button>`,
      ...data.map(c => `
        <button type="button" class="meme-filter${current === c.id ? ' active' : ''}" data-cat="${c.id}" aria-pressed="${current === c.id}">
          <span aria-hidden="true">${c.emoji}</span> ${c.titleEn} <span class="phrase-chip-count">${c.phrases.length}</span>
        </button>`),
    ].join('');
    // Keep the chosen chip in view when the row scrolls sideways (phones).
    const row = $('#phrase-filters');
    const active = row.querySelector('.active');
    if (active && row.scrollWidth > row.clientWidth) {
      row.scrollLeft = active.offsetLeft - row.offsetLeft - row.clientWidth / 2 + active.offsetWidth / 2;
    }
  }

  function phraseHtml(cat, p, i) {
    const kana = kanaText(p.jp);
    return `
      <div class="phrase-card" data-cat="${cat.id}" data-i="${i}" tabindex="0">
        <div class="phrase-jp" lang="ja">${settings.furigana ? rubyHtml(p.jp) : plainText(p.jp)}</div>
        <div class="phrase-en">${p.en}</div>
        <div class="phrase-note">${p.note}</div>
        <div class="phrase-actions">
          ${window.Pronounce ? Pronounce.buttonsHtml(kana) : ''}
          <span class="phrase-reveal-hint">Tap to reveal</span>
        </div>
      </div>`;
  }

  function renderList() {
    const current = category();
    const q = query.trim().toLowerCase();
    const sections = data
      .filter(c => current === 'all' || c.id === current || q)
      .map(cat => {
        const items = cat.phrases.map((p, i) => [p, i]).filter(([p]) => !q || p._search.includes(q));
        if (!items.length) return '';
        return `
          <section class="phrase-section" id="cat-${cat.id}">
            <h2 class="phrase-section-title">
              <span class="phrase-section-emoji" aria-hidden="true">${cat.emoji}</span>
              <span lang="ja">${settings.furigana ? rubyHtml(cat.title) : plainText(cat.title)}</span>
              <span class="phrase-section-en">${cat.titleEn}</span>
            </h2>
            <p class="phrase-section-blurb">${cat.blurb}</p>
            <div class="phrase-grid">${items.map(([p, i]) => phraseHtml(cat, p, i)).join('')}</div>
          </section>`;
      }).join('');
    const list = $('#phrase-list');
    list.innerHTML = sections || `<p class="phrase-empty">No phrases match “${q.replace(/</g, '&lt;')}”.</p>`;
    list.classList.toggle('hide-english', !settings.english);
  }

  function render() {
    $('#phrase-toggle-furigana').checked = settings.furigana;
    $('#phrase-toggle-english').checked = settings.english;
    renderChips();
    renderList();
  }

  function setCategory(id) {
    settings.category = id;
    saveSettings();
    const hash = id === 'all' ? '' : `#${id}`;
    if (location.hash !== hash) history.replaceState(null, '', location.pathname + location.search + hash);
    render();
  }

  // A random phrase from what's on screen: scrolled to, revealed, and lit up.
  function surprise() {
    const cards = [...document.querySelectorAll('#phrase-list .phrase-card')];
    if (!cards.length) return;
    document.querySelectorAll('.phrase-card.picked').forEach(el => el.classList.remove('picked'));
    const card = cards[Math.floor(Math.random() * cards.length)];
    card.classList.add('picked', 'revealed');
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.focus({ preventScroll: true });
  }

  function onCardActivate(card) {
    const cat = data.find(c => c.id === card.dataset.cat);
    const p = cat && cat.phrases[Number(card.dataset.i)];
    if (!p) return;
    card.classList.toggle('revealed');
    if (window.Pronounce) Pronounce.onClick(kanaText(p.jp));
  }

  function init() {
    if (!$('#phrase-list')) return;
    const fromHash = location.hash.slice(1);
    if (data.some(c => c.id === fromHash)) settings.category = fromHash;
    render();

    $('#phrase-filters').addEventListener('click', e => {
      const btn = e.target.closest('[data-cat]');
      if (btn) setCategory(btn.dataset.cat);
    });
    $('#phrase-search').addEventListener('input', e => {
      query = e.target.value;
      renderList();
    });
    $('#phrase-toggle-furigana').addEventListener('change', e => {
      settings.furigana = e.target.checked;
      saveSettings();
      renderList();
    });
    $('#phrase-toggle-english').addEventListener('change', e => {
      settings.english = e.target.checked;
      saveSettings();
      renderList();
    });
    $('#btn-phrase-random').addEventListener('click', surprise);
    $('#phrase-list').addEventListener('click', e => {
      const card = e.target.closest('.phrase-card');
      if (card) onCardActivate(card);
    });
    $('#phrase-list').addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.phrase-card');
      if (!card || e.target !== card) return;
      e.preventDefault();
      onCardActivate(card);
    });
    window.addEventListener('hashchange', () => {
      const id = location.hash.slice(1);
      if (data.some(c => c.id === id)) setCategory(id);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
