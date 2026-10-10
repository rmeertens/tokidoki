// The Phrases pages: fun words and sentences from phrases-data.js, with a
// short story per category from phrases-stories.js.
//
//   phrases.html        — the index: every category as a card, under its
//                          group (Real life, Pop culture, …), plus a search
//                          across all phrases.
//   phrases-<id>.html   — one category (body data-category="<id>"): its
//                          phrases, then its story, which can be read aloud
//                          line by line. These pages are written by
//                          scripts/render_phrase_pages.mjs.
//
// On both, the furigana and English can be switched off (tap a card or a
// story line to reveal its English), and 🔊 / 🐢 read a phrase aloud.
(function () {
  'use strict';

  const SETTINGS_KEY = 'tokidoki_phrases';
  const RUBY_RE = /([一-鿿々]+)\[([^\]]+)\]/g;
  const groups = window.PHRASE_GROUPS || [];
  const stories = window.PHRASE_STORIES || {};
  // Categories in group order, so each group's categories sit together.
  const data = (window.PHRASES_DATA || []).slice()
    .sort((a, b) => groups.findIndex(g => g.id === a.group) - groups.findIndex(g => g.id === b.group));

  const $ = sel => document.querySelector(sel);
  const pageUrl = id => `phrases-${id}.html`;

  function loadSettings() {
    const defaults = { furigana: true, english: true };
    try { return { ...defaults, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) }; }
    catch { return defaults; }
  }
  const settings = loadSettings();
  function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* storage unavailable */ }
  }

  const rubyHtml = text => text.replace(RUBY_RE, '<ruby>$1<rp>(</rp><rt>$2</rt><rp>)</rp></ruby>');
  const plainText = text => text.replace(RUBY_RE, '$1');
  const kanaText = text => text.replace(RUBY_RE, '$2');
  const jpHtml = text => settings.furigana ? rubyHtml(text) : plainText(text);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  // Lower-cased text a search is matched against, worked out once per phrase.
  data.forEach(cat => cat.phrases.forEach(p => {
    p._search = [plainText(p.jp), kanaText(p.jp), p.en, p.note, cat.titleEn, plainText(cat.title)].join(' ').toLowerCase();
  }));

  function phraseHtml(cat, p, i) {
    return `
      <div class="phrase-card" id="p${i + 1}" data-cat="${cat.id}" data-i="${i}" tabindex="0">
        <div class="phrase-jp" lang="ja">${jpHtml(p.jp)}</div>
        <div class="phrase-en">${p.en}</div>
        <div class="phrase-note">${p.note}</div>
        <div class="phrase-actions">
          ${window.Pronounce ? Pronounce.buttonsHtml(kanaText(p.jp)) : ''}
          <span class="phrase-reveal-hint">Tap to reveal</span>
        </div>
      </div>`;
  }

  function setToggles() {
    $('#phrase-toggle-furigana').checked = settings.furigana;
    $('#phrase-toggle-english').checked = settings.english;
    document.body.classList.toggle('phrases-hide-english', !settings.english);
  }

  // ─── Index (phrases.html) ──────────────────────────────────────────────────

  let query = '';

  function renderIndex() {
    const list = $('#phrase-list');
    const q = query.trim().toLowerCase();
    if (!q) {
      list.innerHTML = groups.map(g => {
        const cats = data.filter(c => c.group === g.id);
        if (!cats.length) return '';
        return `
          <section class="phrase-group" id="group-${g.id}">
            <h2 class="phrase-group-title">${g.title}</h2>
            <div class="chapter-grid phrase-cat-grid">
              ${cats.map(c => `
                <a class="chapter-card phrase-cat-card" href="${pageUrl(c.id)}">
                  <div class="phrase-cat-emoji" aria-hidden="true">${c.emoji}</div>
                  <div class="chapter-card-title phrase-cat-title" lang="ja">${jpHtml(c.title)}</div>
                  <div class="chapter-card-sub phrase-cat-en">${c.titleEn}</div>
                  <div class="chapter-card-sub">${c.phrases.length} phrases${stories[c.id] ? ' · story' : ''}</div>
                </a>`).join('')}
            </div>
          </section>`;
      }).join('');
      return;
    }
    // A search lists the matching phrases under their category, which links
    // to its page.
    const sections = data.map(cat => {
      const items = cat.phrases.map((p, i) => [p, i]).filter(([p]) => p._search.includes(q));
      if (!items.length) return '';
      return `
        <section class="phrase-section">
          <h3 class="phrase-section-title">
            <span class="phrase-section-emoji" aria-hidden="true">${cat.emoji}</span>
            <a href="${pageUrl(cat.id)}" lang="ja">${jpHtml(cat.title)}</a>
            <span class="phrase-section-en">${cat.titleEn}</span>
          </h3>
          <div class="phrase-grid">${items.map(([p, i]) => phraseHtml(cat, p, i)).join('')}</div>
        </section>`;
    }).join('');
    list.innerHTML = sections || `<p class="phrase-empty">No phrases match “${esc(q)}”.</p>`;
  }

  // A random phrase from anywhere: open its page with it lit up.
  function surprise() {
    const all = data.flatMap(c => c.phrases.map((p, i) => [c, i]));
    if (!all.length) return;
    const [cat, i] = all[Math.floor(Math.random() * all.length)];
    location.href = `${pageUrl(cat.id)}#p${i + 1}`;
  }

  function initIndex() {
    // Old links to a category (phrases.html#firstdate) go to its own page;
    // phrases.html#group:life scrolls to that group.
    const hash = decodeURIComponent(location.hash.slice(1));
    if (data.some(c => c.id === hash)) { location.replace(pageUrl(hash)); return; }

    setToggles();
    renderIndex();
    if (hash.startsWith('group:')) {
      const el = document.getElementById(`group-${hash.slice(6)}`);
      if (el) el.scrollIntoView();
    }
    $('#phrase-search').addEventListener('input', e => {
      query = e.target.value;
      renderIndex();
    });
    $('#btn-phrase-random').addEventListener('click', surprise);
    onToggles(renderIndex);
    window.addEventListener('hashchange', () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (data.some(c => c.id === id)) location.replace(pageUrl(id));
    });
  }

  // ─── A category page (phrases-<id>.html) ───────────────────────────────────

  let cat = null;
  let readingLine = null;   // index of the story line being read aloud
  let readingSlow = false;

  function renderCategory() {
    $('#phrase-cat-title').innerHTML = jpHtml(cat.title);
    $('#phrase-list').innerHTML = `<div class="phrase-grid">${cat.phrases.map((p, i) => phraseHtml(cat, p, i)).join('')}</div>`;
    renderStory();
  }

  function renderStory() {
    const story = stories[cat.id];
    const box = $('#phrase-story');
    if (!story) { box.classList.add('hidden'); return; }
    box.classList.remove('hidden');
    $('#phrase-story-title').innerHTML = jpHtml(story.title);
    $('#phrase-story-title-en').textContent = story.titleEn;
    $('#phrase-story-lines').innerHTML = story.lines.map(([who, jp, en], i) => `
      <div class="phrase-story-line${who ? '' : ' narration'}${i === readingLine ? ' reading' : ''}" data-line="${i}" role="button" tabindex="0" title="Listen to this line">
        ${who ? `<div class="phrase-story-who" lang="ja">${jpHtml(who)}</div>` : ''}
        <div class="phrase-story-body">
          <div class="phrase-story-jp" lang="ja">${jpHtml(jp)}</div>
          <div class="phrase-story-en">${en}</div>
        </div>
      </div>`).join('');
    renderReadButtons();
  }

  function renderReadButtons() {
    const supported = !!(window.Pronounce && Pronounce.supported);
    [['#btn-story-read', false], ['#btn-story-read-slow', true]].forEach(([sel, slow]) => {
      const btn = $(sel);
      btn.classList.toggle('hidden', !supported);
      const on = readingLine !== null && readingSlow === slow;
      btn.setAttribute('aria-pressed', on);
      btn.textContent = on ? '■ Stop' : (slow ? '🐢 Slowly' : '▶ Read aloud');
    });
  }

  function markReading(i) {
    readingLine = i;
    document.querySelectorAll('.phrase-story-line').forEach(el => {
      el.classList.toggle('reading', Number(el.dataset.line) === i);
    });
    const el = i === null ? null : document.querySelector(`.phrase-story-line[data-line="${i}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    renderReadButtons();
  }

  // Reads the story from line `from` on; the same button again stops it.
  function readStory(slow, from = 0) {
    const story = stories[cat.id];
    if (!story || !window.Pronounce) return;
    if (readingLine !== null && readingSlow === slow && from === 0) {
      Pronounce.stop();
      markReading(null);
      return;
    }
    readingSlow = slow;
    const lines = story.lines.slice(from);
    Pronounce.speakAll(lines.map(l => kanaText(l[1])), {
      slow,
      onStart: i => markReading(from + i),
      onDone: () => markReading(null),
    });
  }

  // Tapping a story line reads just that line, and shows its English.
  function onStoryLine(el) {
    const story = stories[cat.id];
    const line = story && story.lines[Number(el.dataset.line)];
    if (!line) return;
    el.classList.add('revealed');
    if (window.Pronounce) {
      Pronounce.stop();
      markReading(null);
      Pronounce.speak(kanaText(line[1]), false);
    }
  }

  function highlightFromHash() {
    const m = location.hash.match(/^#p(\d+)$/);
    const card = m && document.getElementById(`p${m[1]}`);
    if (!card) return;
    document.querySelectorAll('.phrase-card.picked').forEach(el => el.classList.remove('picked'));
    card.classList.add('picked', 'revealed');
    card.scrollIntoView({ block: 'center' });
  }

  function initCategory(id) {
    cat = data.find(c => c.id === id);
    if (!cat) return;
    setToggles();
    renderCategory();
    highlightFromHash();
    window.addEventListener('hashchange', highlightFromHash);
    onToggles(renderCategory);

    $('#btn-story-read').addEventListener('click', () => readStory(false));
    $('#btn-story-read-slow').addEventListener('click', () => readStory(true));
    const lines = $('#phrase-story-lines');
    lines.addEventListener('click', e => {
      const el = e.target.closest('.phrase-story-line');
      if (el) onStoryLine(el);
    });
    lines.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const el = e.target.closest('.phrase-story-line');
      if (!el || e.target !== el) return;
      e.preventDefault();
      onStoryLine(el);
    });
    window.addEventListener('pagehide', () => { if (window.Pronounce) Pronounce.stop(); });
  }

  // ─── Shared ────────────────────────────────────────────────────────────────

  function onCardActivate(card) {
    const c = data.find(x => x.id === card.dataset.cat);
    const p = c && c.phrases[Number(card.dataset.i)];
    if (!p) return;
    card.classList.toggle('revealed');
    if (window.Pronounce) Pronounce.onClick(kanaText(p.jp));
  }

  function onToggles(rerender) {
    $('#phrase-toggle-furigana').addEventListener('change', e => {
      settings.furigana = e.target.checked;
      saveSettings();
      rerender();
    });
    $('#phrase-toggle-english').addEventListener('change', e => {
      settings.english = e.target.checked;
      saveSettings();
      setToggles();
    });
  }

  function init() {
    const list = $('#phrase-list');
    if (!list) return;
    list.addEventListener('click', e => {
      const card = e.target.closest('.phrase-card');
      if (card) onCardActivate(card);
    });
    list.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.phrase-card');
      if (!card || e.target !== card) return;
      e.preventDefault();
      onCardActivate(card);
    });
    const id = document.body.dataset.category;
    if (id) initCategory(id);
    else initIndex();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
