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
// On both, tapping a phrase card or a story line explains it: each word
// with its reading and meaning, and the grammar it uses (from
// phrases-words.js, built by scripts/tokenize_phrases.mjs). Each word can
// be saved to the word flashcards (tokidoki_story_words, the deck the Stories
// page uses, reviewed on flashcards.html) and its kanji to the kanji cards.
// The furigana and English can be switched off, and 🔊 / 🐢 read a phrase
// aloud.
(function () {
  'use strict';

  const SETTINGS_KEY = 'tokidoki_phrases';
  const RUBY_RE = /([一-鿿々]+)\[([^\]]+)\]/g;
  const groups = window.PHRASE_GROUPS || [];
  const stories = window.PHRASE_STORIES || {};
  const words = window.PHRASE_WORDS || { gloss: {}, grammar: {}, lines: {} };
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

  // ─── Explaining a sentence ─────────────────────────────────────────────────

  // Which explanations are open, by line id ('<category>:p<n>' for a phrase,
  // '<category>:s<n>' for a story line), so a re-render keeps them open.
  const openLines = new Set();

  const displayWord = key => key.replace(/\(.*\)$/, '');

  // ─── Saving words to the flashcards ────────────────────────────────────────

  const DECK_KEY = 'tokidoki_story_words';
  const SRS_KEY = 'tokidoki_srs';
  const loadJson = (key, fallback) => {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch { return fallback; }
  };
  const saveJson = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  };
  const isSaved = key => Object.prototype.hasOwnProperty.call(loadJson(DECK_KEY, {}), key);

  // A line's text and English, by line id.
  function lineSource(id) {
    const [catId, ref] = id.split(':');
    const c = data.find(x => x.id === catId);
    if (!c) return null;
    const n = Number(ref.slice(1));
    if (ref[0] === 'p') return c.phrases[n] ? { cat: c, jp: c.phrases[n].jp, en: c.phrases[n].en } : null;
    const l = stories[c.id] && stories[c.id].lines[n];
    return l ? { cat: c, jp: l[1], en: l[2] } : null;
  }

  // The sentence in the Stories deck's format — space-separated tokens, a
  // word carrying its key after '>' when it's written differently — so the
  // flashcard can show it with the saved word highlighted.
  function deckSentence(line) {
    return line.w.map(p => {
      if (typeof p === 'string') return p.replace(/\s+/g, '');
      const [src, key] = p;
      return plainText(src) === key ? src : `${src}>${key}`;
    }).filter(Boolean).join(' ');
  }

  function toggleSaved(key, lineId) {
    const deck = loadJson(DECK_KEY, {});
    if (Object.prototype.hasOwnProperty.call(deck, key)) {
      delete deck[key];
      const srs = loadJson(SRS_KEY, {});
      delete srs[`story_word:${key}`];
      delete srs[`story_word:${key}:recall`];
      saveJson(SRS_KEY, srs);
    } else {
      const src = lineSource(lineId);
      const line = words.lines[lineId];
      deck[key] = {
        gloss: words.gloss[key], added: Date.now(),
        jp: line ? deckSentence(line) : '', en: src ? src.en : '',
        title: src ? `${src.cat.titleEn} (Phrases)` : 'Phrases', level: '',
      };
    }
    saveJson(DECK_KEY, deck);
  }

  function saveButtonInner(saved) {
    return saved ? '✓ Flashcard' : '＋ Flashcard';
  }

  // Brings every save button for a word in line with the deck.
  function syncSaveButtons(key) {
    const saved = isSaved(key);
    document.querySelectorAll('[data-save-word]').forEach(btn => {
      if (btn.dataset.saveWord !== key) return;
      btn.classList.toggle('saved', saved);
      btn.setAttribute('aria-pressed', saved);
      btn.textContent = saveButtonInner(saved);
    });
  }

  // The words of a sentence, each once: as written, its dictionary form when
  // that differs, reading, meaning and part of speech.
  function wordsHtml(line, lineId) {
    const seen = new Set();
    const rows = line.w.filter(p => Array.isArray(p) && words.gloss[p[1]] && !seen.has(p[1]) && seen.add(p[1])).map(([src, key]) => {
      const [reading, meaning, pos] = words.gloss[key];
      const surface = plainText(src);
      const base = displayWord(key);
      const saved = isSaved(key);
      const kanji = window.KanjiCards ? KanjiCards.chipsHtml(base, { reading, meaning }) : '';
      return `
        <li class="phrase-word">
          <span class="phrase-word-jp" lang="ja">${jpHtml(src)}</span>
          ${base !== surface ? `<span class="phrase-word-base" lang="ja">→ ${esc(base)}</span>` : ''}
          ${/[一-鿿々]/.test(surface + base) ? `<span class="phrase-word-reading" lang="ja">${esc(reading)}</span>` : ''}
          <span class="phrase-word-meaning">${esc(meaning)}</span>
          <span class="phrase-word-pos">${esc(pos)}</span>
          <span class="phrase-word-save">
            ${/particle/i.test(pos) ? '' : `<button type="button" class="phrase-word-add${saved ? ' saved' : ''}" data-save-word="${esc(key)}" data-line="${esc(lineId)}" aria-pressed="${saved}" title="Add “${esc(base)}” to your word flashcards">${saveButtonInner(saved)}</button>`}
            ${kanji}
          </span>
        </li>`;
    });
    return rows.length ? `<ul class="phrase-words">${rows.join('')}</ul>` : '';
  }

  function grammarHtml(line) {
    const items = line.g.filter(([id]) => words.grammar[id]).map(([id, snippet]) => {
      const g = words.grammar[id];
      return `
        <li class="phrase-grammar-item">
          <div class="phrase-grammar-head">
            <span class="story-level-badge">${esc(g.level)}</span>
            <span class="phrase-grammar-title">${g.title}</span>
          </div>
          <div class="phrase-grammar-snippet" lang="ja">「${esc(snippet)}」</div>
          <div class="phrase-grammar-pattern" lang="ja">${g.pattern}</div>
          <p class="phrase-grammar-note">${g.note}</p>
        </li>`;
    });
    return items.length
      ? `<ul class="phrase-grammar">${items.join('')}</ul>`
      : '<p class="phrase-grammar-none">No grammar to unpack here — it\'s a set phrase or a single word, so learn it as a whole.</p>';
  }

  function explainHtml(id, jp) {
    const line = words.lines[id];
    if (!line) return '';
    return `
      <div class="phrase-explain">
        <div class="phrase-explain-head">
          <span class="phrase-explain-label">Words</span>
          ${window.Pronounce ? Pronounce.buttonsHtml(kanaText(jp)) : ''}
        </div>
        ${wordsHtml(line, id)}
        <p class="phrase-explain-tip">Saved words and kanji are reviewed on the <a href="flashcards.html">Flashcards page</a>.</p>
        <div class="phrase-explain-label">Grammar</div>
        ${grammarHtml(line)}
      </div>`;
  }

  function phraseHtml(cat, p, i) {
    const id = `${cat.id}:p${i}`;
    const open = openLines.has(id);
    return `
      <div class="phrase-card${open ? ' revealed open' : ''}" id="p${i + 1}" data-cat="${cat.id}" data-i="${i}" tabindex="0" aria-expanded="${open}">
        <div class="phrase-jp" lang="ja">${jpHtml(p.jp)}</div>
        <div class="phrase-en">${p.en}</div>
        <div class="phrase-note">${p.note}</div>
        <div class="phrase-actions">
          ${window.Pronounce ? Pronounce.buttonsHtml(kanaText(p.jp)) : ''}
          <span class="phrase-explain-hint">${open ? 'Hide words &amp; grammar' : 'Tap for words &amp; grammar'}</span>
        </div>
        ${open ? explainHtml(id, p.jp) : ''}
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
    $('#phrase-story-lines').innerHTML = story.lines.map(([who, jp, en], i) => {
      const id = `${cat.id}:s${i}`;
      const open = openLines.has(id);
      return `
        <div class="phrase-story-item">
          <div class="phrase-story-line${who ? '' : ' narration'}${i === readingLine ? ' reading' : ''}${open ? ' revealed open' : ''}" data-line="${i}" role="button" tabindex="0" aria-expanded="${open}" title="Words and grammar">
            ${who ? `<div class="phrase-story-who" lang="ja">${jpHtml(who)}</div>` : ''}
            <div class="phrase-story-body">
              <div class="phrase-story-jp" lang="ja">${jpHtml(jp)}</div>
              <div class="phrase-story-en">${en}</div>
            </div>
          </div>
          ${open ? explainHtml(id, jp) : ''}
        </div>`;
    }).join('');
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

  // Tapping a story line opens (or closes) its words and grammar, and reads
  // it aloud when "Speak words on click" is on.
  function onStoryLine(el) {
    const story = stories[cat.id];
    const i = Number(el.dataset.line);
    const line = story && story.lines[i];
    if (!line) return;
    const id = `${cat.id}:s${i}`;
    const opening = !openLines.has(id);
    if (opening) openLines.add(id);
    else openLines.delete(id);
    renderStory();
    if (opening && window.Pronounce) Pronounce.onClick(kanaText(line[1]));
    const again = document.querySelector(`.phrase-story-line[data-line="${i}"]`);
    if (again) again.focus({ preventScroll: true });
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

  // Tapping a phrase card opens (or closes) its words and grammar.
  function onCardActivate(card) {
    const c = data.find(x => x.id === card.dataset.cat);
    const i = Number(card.dataset.i);
    const p = c && c.phrases[i];
    if (!p) return;
    const id = `${c.id}:p${i}`;
    const opening = !openLines.has(id);
    if (opening) openLines.add(id);
    else openLines.delete(id);
    const wrap = document.createElement('div');
    wrap.innerHTML = phraseHtml(c, p, i);
    const fresh = wrap.firstElementChild;
    if (card.classList.contains('picked')) fresh.classList.add('picked');
    card.replaceWith(fresh);
    fresh.focus({ preventScroll: true });
    if (opening && window.Pronounce) Pronounce.onClick(kanaText(p.jp));
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
    document.addEventListener('click', e => {
      const btn = e.target.closest && e.target.closest('[data-save-word]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      toggleSaved(btn.dataset.saveWord, btn.dataset.line);
      syncSaveButtons(btn.dataset.saveWord);
    }, true);
    list.addEventListener('click', e => {
      if (e.target.closest('.phrase-explain')) return;
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
