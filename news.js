// The News page (news.html): short news stories from news-data.js, each told
// at JLPT N5, N4 and N3 — a switch on every story picks the level, and the
// last level picked is remembered for all of them.
//
// Tapping a headline or sentence explains it: the English, a note on the
// sentence, each word with its reading and meaning, and the grammar it uses
// (from news-words.js, built by scripts/tokenize_news.mjs). Words can be
// saved to the word flashcards (tokidoki_story_words, the deck the Stories
// and Phrases pages use, reviewed on flashcards.html) and their kanji to the
// kanji cards. Tapping a grammar point opens its explanation, and grammar
// can be saved too (tokidoki_saved_grammar), listed under "Saved grammar" at
// the end of the page. Furigana and English can be switched off; 🔊 / 🐢
// read a sentence aloud and ▶ reads a whole story.
(function (global) {
  'use strict';

  const LEVELS = ['N5', 'N4', 'N3'];
  const SETTINGS_KEY = 'tokidoki_news';
  const DECK_KEY = 'tokidoki_story_words';
  const SRS_KEY = 'tokidoki_srs';
  const GRAMMAR_KEY = 'tokidoki_saved_grammar';
  const RUBY_RE = /([一-鿿々]+)\[([^\]]+)\]/g;

  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const rubyHtml = text => esc(text).replace(RUBY_RE, '<ruby>$1<rp>(</rp><rt>$2</rt><rp>)</rp></ruby>');
  const plainText = text => text.replace(RUBY_RE, '$1');
  const kanaText = text => text.replace(RUBY_RE, '$2');
  const displayWord = key => key.replace(/\(.*\)$/, '');

  // The ids of a story's lines: '<story>:<level>:t' for the headline,
  // '<story>:<level>:<n>' for sentence n.
  const lineId = (item, level, n) => `${item.id}:${level}:${n}`;

  // A line's Japanese, English and note, by id.
  function lineSource(items, id) {
    const [storyId, level, n] = id.split(':');
    const item = items.find(x => x.id === storyId);
    const v = item && item.levels[level];
    if (!v) return null;
    if (n === 't') return { item, level, jp: v.title, en: item.titleEn, note: '' };
    const l = v.lines[Number(n)];
    return l ? { item, level, jp: l[0], en: l[1], note: l[2] || '' } : null;
  }

  // The sentence in the Stories deck's format — space-separated tokens, a
  // word carrying its key after '>' when it's written differently — so the
  // flashcard shows it with the saved word highlighted.
  function deckSentence(line) {
    return line.w.map(p => {
      if (typeof p === 'string') return p.replace(/\s+/g, '');
      const [src, key] = p;
      return plainText(src) === key ? src : `${src}>${key}`;
    }).filter(Boolean).join(' ');
  }

  // A story's date for the page: "Saturday 10 October 2026".
  function formatDate(iso) {
    const d = new Date(`${iso}T12:00:00`);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  const api = { LEVELS, lineId, lineSource, deckSentence, plainText, kanaText, rubyHtml };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;

  // ─── The page ──────────────────────────────────────────────────────────────

  const items = global.NEWS_ITEMS || [];
  const words = global.NEWS_WORDS || { gloss: {}, grammar: {}, lines: {} };
  const $ = sel => document.querySelector(sel);

  const loadJson = (key, fallback) => {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch { return fallback; }
  };
  const saveJson = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  };

  const settings = { furigana: true, english: true, level: 'N5', ...loadJson(SETTINGS_KEY, {}) };
  if (!LEVELS.includes(settings.level)) settings.level = 'N5';
  const saveSettings = () => saveJson(SETTINGS_KEY, settings);
  const jpHtml = text => settings.furigana ? rubyHtml(text) : esc(plainText(text));

  // Each story's level; a story follows the remembered level until its own
  // switch is used.
  const storyLevel = {};
  const levelOf = item => storyLevel[item.id] || settings.level;

  const openLines = new Set();      // explained lines, by id
  const openGrammar = new Set();    // expanded grammar points, as '<line id>|<grammar id>'
  let reading = null;               // { story, line } being read aloud
  let readingSlow = false;

  // ─── Saving ────────────────────────────────────────────────────────────────

  const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
  const isSaved = key => has(loadJson(DECK_KEY, {}), key);
  const isGrammarSaved = id => has(loadJson(GRAMMAR_KEY, {}), id);

  function toggleWord(key, id) {
    const deck = loadJson(DECK_KEY, {});
    if (has(deck, key)) {
      delete deck[key];
      const srs = loadJson(SRS_KEY, {});
      delete srs[`story_word:${key}`];
      delete srs[`story_word:${key}:recall`];
      saveJson(SRS_KEY, srs);
    } else {
      const src = lineSource(items, id);
      const line = words.lines[id];
      deck[key] = {
        gloss: words.gloss[key], added: Date.now(),
        jp: line ? deckSentence(line) : '', en: src ? src.en : '',
        title: src ? `${src.item.titleEn} (News)` : 'News', level: src ? src.level : '',
      };
    }
    saveJson(DECK_KEY, deck);
  }

  // A saved grammar point keeps its explanation and the sentence it was
  // saved from, so the list still reads well after the story is gone.
  function toggleGrammar(gid, id) {
    const saved = loadJson(GRAMMAR_KEY, {});
    if (has(saved, gid)) delete saved[gid];
    else {
      const g = words.grammar[gid];
      const src = lineSource(items, id);
      const line = words.lines[id];
      const hit = line && line.g.find(([x]) => x === gid);
      if (!g) return;
      saved[gid] = {
        level: g.level, title: g.title, pattern: g.pattern, note: g.note,
        example: src ? src.jp : '', snippet: hit ? hit[1] : '', en: src ? src.en : '',
        from: src ? `${src.item.titleEn} (News, ${src.level})` : 'News', added: Date.now(),
      };
    }
    saveJson(GRAMMAR_KEY, saved);
  }

  const wordButton = saved => saved ? '✓ Flashcard' : '＋ Flashcard';
  const grammarButton = saved => saved ? '✓ Saved' : '＋ Save';

  function syncButtons(attr, key, saved, label) {
    document.querySelectorAll(`[${attr}]`).forEach(btn => {
      if (btn.getAttribute(attr) !== key) return;
      btn.classList.toggle('saved', saved);
      btn.setAttribute('aria-pressed', saved);
      btn.textContent = label(saved);
    });
  }

  // ─── Explaining a line ─────────────────────────────────────────────────────

  function wordsHtml(line, id) {
    const seen = new Set();
    const rows = line.w.filter(p => Array.isArray(p) && words.gloss[p[1]] && !seen.has(p[1]) && seen.add(p[1])).map(([src, key]) => {
      const [reading, meaning, pos] = words.gloss[key];
      const surface = plainText(src);
      const base = displayWord(key);
      const saved = isSaved(key);
      const kanji = global.KanjiCards ? KanjiCards.chipsHtml(base, { reading, meaning }) : '';
      return `
        <li class="phrase-word">
          <span class="phrase-word-jp" lang="ja">${jpHtml(src)}</span>
          ${base !== surface ? `<span class="phrase-word-base" lang="ja">→ ${esc(base)}</span>` : ''}
          ${/[一-鿿々]/.test(surface + base) ? `<span class="phrase-word-reading" lang="ja">${esc(reading)}</span>` : ''}
          <span class="phrase-word-meaning">${esc(meaning)}</span>
          <span class="phrase-word-pos">${esc(pos)}</span>
          <span class="phrase-word-save">
            ${/particle/i.test(pos) ? '' : `<button type="button" class="phrase-word-add${saved ? ' saved' : ''}" data-save-word="${esc(key)}" data-line="${esc(id)}" aria-pressed="${saved}" title="Add “${esc(base)}” to your word flashcards">${wordButton(saved)}</button>`}
            ${kanji}
          </span>
        </li>`;
    });
    return rows.length ? `<ul class="phrase-words">${rows.join('')}</ul>` : '';
  }

  function grammarHtml(line, id) {
    const rows = line.g.filter(([gid]) => words.grammar[gid]).map(([gid, snippet]) => {
      const g = words.grammar[gid];
      const open = openGrammar.has(`${id}|${gid}`);
      const saved = isGrammarSaved(gid);
      return `
        <li class="phrase-grammar-item news-grammar-item${open ? ' open' : ''}">
          <div class="phrase-grammar-head">
            <button type="button" class="news-grammar-toggle" data-grammar="${esc(gid)}" data-line="${esc(id)}" aria-expanded="${open}">
              <span class="story-level-badge">${esc(g.level)}</span>
              <span class="phrase-grammar-title">${g.title}</span>
              <span class="news-grammar-snippet" lang="ja">「${esc(snippet)}」</span>
              <span class="news-grammar-caret" aria-hidden="true">${open ? '▾' : '▸'}</span>
            </button>
            <button type="button" class="phrase-word-add${saved ? ' saved' : ''}" data-save-grammar="${esc(gid)}" data-line="${esc(id)}" aria-pressed="${saved}" title="Save this grammar point">${grammarButton(saved)}</button>
          </div>
          ${open ? `
          <div class="phrase-grammar-pattern" lang="ja">${g.pattern}</div>
          <p class="phrase-grammar-note">${g.note}</p>` : ''}
        </li>`;
    });
    return rows.length
      ? `<ul class="phrase-grammar">${rows.join('')}</ul>`
      : '<p class="phrase-grammar-none">No grammar to unpack here — just nouns and names.</p>';
  }

  function explainHtml(id) {
    const line = words.lines[id];
    const src = lineSource(items, id);
    if (!line || !src) return '';
    return `
      <div class="phrase-explain news-explain">
        <div class="phrase-explain-head">
          <span class="phrase-explain-label">Sentence</span>
          ${global.Pronounce ? Pronounce.buttonsHtml(kanaText(src.jp)) : ''}
        </div>
        <p class="news-explain-en">${esc(src.en)}</p>
        ${src.note ? `<p class="news-explain-note">${esc(src.note)}</p>` : ''}
        <div class="phrase-explain-label">Words</div>
        ${wordsHtml(line, id)}
        <div class="phrase-explain-label">Grammar <span class="news-explain-sub">— tap one to see how it works</span></div>
        ${grammarHtml(line, id)}
        <p class="phrase-explain-tip">Saved words and kanji are reviewed on the <a href="flashcards.html">Flashcards page</a>; saved grammar is listed <a href="#news-saved-grammar">at the end of this page</a>.</p>
      </div>`;
  }

  // ─── Stories ───────────────────────────────────────────────────────────────

  function lineHtml(item, level, n, jp, en) {
    const id = lineId(item, level, n);
    const open = openLines.has(id);
    const isTitle = n === 't';
    const isReading = !isTitle && reading && reading.story === item.id && reading.line === n;
    return `
      <div class="news-line-wrap">
        <div class="phrase-story-line news-line${isTitle ? ' news-headline' : ''}${open ? ' revealed open' : ''}${isReading ? ' reading' : ''}" data-line-id="${esc(id)}" role="button" tabindex="0" aria-expanded="${open}" title="Words and grammar">
          <div class="phrase-story-body">
            <div class="${isTitle ? 'news-title-jp' : 'phrase-story-jp'}" lang="ja">${jpHtml(jp)}</div>
            <div class="phrase-story-en">${esc(en)}</div>
          </div>
        </div>
        ${open ? explainHtml(id) : ''}
      </div>`;
  }

  function storyHtml(item) {
    const level = levelOf(item);
    const v = item.levels[level];
    const speaking = reading && reading.story === item.id;
    const canSpeak = !!(global.Pronounce && Pronounce.supported);
    return `
      <article class="news-story" id="${esc(item.id)}" data-story="${esc(item.id)}">
        <header class="news-story-head">
          <span class="news-story-emoji" aria-hidden="true">${item.emoji}</span>
          <div class="news-story-meta">
            <div class="news-story-date">${esc(formatDate(item.date))}</div>
            <div class="news-story-en">${esc(item.titleEn)}</div>
          </div>
        </header>
        <div class="news-story-controls">
          <div class="lis-levels news-levels" role="group" aria-label="Level">
            <span class="lis-levels-label">Level</span>
            ${LEVELS.filter(l => item.levels[l]).map(l => `<button type="button" data-level="${l}" aria-pressed="${l === level}">${l}</button>`).join('')}
          </div>
          ${canSpeak ? `
          <div class="news-read">
            <button type="button" class="btn-secondary story-read" data-read="normal" aria-pressed="${speaking && !readingSlow}">${speaking && !readingSlow ? '■ Stop' : '▶ Read aloud'}</button>
            <button type="button" class="btn-secondary story-read" data-read="slow" aria-pressed="${speaking && readingSlow}">${speaking && readingSlow ? '■ Stop' : '🐢 Slowly'}</button>
          </div>` : ''}
        </div>
        ${lineHtml(item, level, 't', v.title, item.titleEn)}
        <div class="phrase-story-lines news-lines">
          ${v.lines.map((l, i) => lineHtml(item, level, i, l[0], l[1])).join('')}
        </div>
        ${item.sources && item.sources.length ? `
        <p class="news-sources">Sources: ${item.sources.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join(', ')}</p>` : ''}
      </article>`;
  }

  function renderStory(storyId) {
    const item = items.find(x => x.id === storyId);
    const el = document.querySelector(`.news-story[data-story="${storyId}"]`);
    if (!item || !el) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = storyHtml(item);
    el.replaceWith(wrap.firstElementChild);
  }

  function renderAll() {
    $('#news-list').innerHTML = items.length
      ? items.map(storyHtml).join('')
      : '<p class="phrase-empty">No news yet — check back soon.</p>';
    renderSavedGrammar();
  }

  // ─── Saved grammar ─────────────────────────────────────────────────────────

  function renderSavedGrammar() {
    const box = $('#news-saved-grammar-list');
    if (!box) return;
    const saved = loadJson(GRAMMAR_KEY, {});
    const ids = Object.keys(saved).sort((a, b) => (saved[b].added || 0) - (saved[a].added || 0));
    $('#news-saved-grammar-count').textContent = ids.length ? `(${ids.length})` : '';
    box.innerHTML = ids.length ? `<ul class="phrase-grammar news-saved-list">${ids.map(gid => {
      const g = saved[gid];
      return `
        <li class="phrase-grammar-item">
          <div class="phrase-grammar-head">
            <span class="story-level-badge">${esc(g.level || '')}</span>
            <span class="phrase-grammar-title">${g.title}</span>
            <button type="button" class="phrase-word-add saved" data-save-grammar="${esc(gid)}" aria-pressed="true" title="Remove from saved grammar">✕ Remove</button>
          </div>
          <div class="phrase-grammar-pattern" lang="ja">${g.pattern}</div>
          <p class="phrase-grammar-note">${g.note}</p>
          ${g.example ? `<div class="news-saved-example" lang="ja">${jpHtml(g.example)}</div>
          <div class="news-saved-en">${esc(g.en || '')} <span class="news-saved-from">— ${esc(g.from || '')}</span></div>` : ''}
        </li>`;
    }).join('')}</ul>` : '<p class="phrase-grammar-none">Nothing saved yet. Open a sentence and tap <b>＋ Save</b> next to a grammar point to keep it here.</p>';
  }

  // ─── Reading aloud ─────────────────────────────────────────────────────────

  function markReading(storyId, n) {
    reading = n === null ? null : { story: storyId, line: n };
    document.querySelectorAll('.news-line').forEach(el => {
      const [s, , i] = el.dataset.lineId.split(':');
      el.classList.toggle('reading', !!reading && s === storyId && String(n) === i);
    });
    const item = items.find(x => x.id === storyId);
    const el = reading && item && document.querySelector(`.news-line[data-line-id="${CSS.escape(lineId(item, levelOf(item), n))}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function readStory(item, slow) {
    if (!global.Pronounce) return;
    const same = reading && reading.story === item.id && readingSlow === slow;
    Pronounce.stop();
    const prev = reading && reading.story;
    reading = null;
    if (prev && prev !== item.id) renderStory(prev);
    if (same) { renderStory(item.id); return; }
    readingSlow = slow;
    const v = item.levels[levelOf(item)];
    reading = { story: item.id, line: 0 };
    renderStory(item.id);
    Pronounce.speakAll(v.lines.map(l => kanaText(l[0])), {
      slow,
      onStart: i => markReading(item.id, i),
      onDone: () => { reading = null; renderStory(item.id); },
    });
  }

  // ─── Events ────────────────────────────────────────────────────────────────

  function setLevel(item, level) {
    if (!item.levels[level]) return;
    if (reading && reading.story === item.id) { Pronounce.stop(); reading = null; }
    // Explanations belong to one level's sentences; drop the others'.
    [...openLines].forEach(id => { if (id.startsWith(`${item.id}:`)) openLines.delete(id); });
    storyLevel[item.id] = level;
    settings.level = level;
    saveSettings();
    renderStory(item.id);
  }

  function toggleLine(el) {
    const id = el.dataset.lineId;
    const opening = !openLines.has(id);
    if (opening) openLines.add(id);
    else openLines.delete(id);
    renderStory(id.split(':')[0]);
    const src = lineSource(items, id);
    if (opening && src && global.Pronounce) Pronounce.onClick(kanaText(src.jp));
    const again = document.querySelector(`.news-line[data-line-id="${CSS.escape(id)}"]`);
    if (again) again.focus({ preventScroll: true });
  }

  function init() {
    const list = $('#news-list');
    if (!list) return;
    $('#news-toggle-furigana').checked = settings.furigana;
    $('#news-toggle-english').checked = settings.english;
    document.body.classList.toggle('phrases-hide-english', !settings.english);
    renderAll();

    // Save buttons work anywhere on the page, including the saved list.
    document.addEventListener('click', e => {
      const w = e.target.closest && e.target.closest('[data-save-word]');
      const g = e.target.closest && e.target.closest('[data-save-grammar]');
      if (!w && !g) return;
      e.preventDefault();
      e.stopPropagation();
      if (w) {
        const key = w.dataset.saveWord;
        toggleWord(key, w.dataset.line);
        syncButtons('data-save-word', key, isSaved(key), wordButton);
      } else {
        const gid = g.dataset.saveGrammar;
        toggleGrammar(gid, g.dataset.line);
        syncButtons('data-save-grammar', gid, isGrammarSaved(gid), grammarButton);
        renderSavedGrammar();
      }
    }, true);

    list.addEventListener('click', e => {
      const story = e.target.closest('.news-story');
      const item = story && items.find(x => x.id === story.dataset.story);
      if (!item) return;
      const lvl = e.target.closest('[data-level]');
      if (lvl) { setLevel(item, lvl.dataset.level); return; }
      const read = e.target.closest('[data-read]');
      if (read) { readStory(item, read.dataset.read === 'slow'); return; }
      const gt = e.target.closest('.news-grammar-toggle');
      if (gt) {
        const k = `${gt.dataset.line}|${gt.dataset.grammar}`;
        if (openGrammar.has(k)) openGrammar.delete(k);
        else openGrammar.add(k);
        renderStory(item.id);
        const again = document.querySelector(`.news-grammar-toggle[data-line="${CSS.escape(gt.dataset.line)}"][data-grammar="${CSS.escape(gt.dataset.grammar)}"]`);
        if (again) again.focus({ preventScroll: true });
        return;
      }
      if (e.target.closest('.phrase-explain') || e.target.closest('a')) return;
      const line = e.target.closest('.news-line');
      if (line) toggleLine(line);
    });
    list.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const line = e.target.closest('.news-line');
      if (!line || e.target !== line) return;
      e.preventDefault();
      toggleLine(line);
    });

    $('#news-toggle-furigana').addEventListener('change', e => {
      settings.furigana = e.target.checked;
      saveSettings();
      renderAll();
    });
    $('#news-toggle-english').addEventListener('change', e => {
      settings.english = e.target.checked;
      saveSettings();
      document.body.classList.toggle('phrases-hide-english', !settings.english);
    });
    window.addEventListener('pagehide', () => { if (global.Pronounce) Pronounce.stop(); });
    // Saving on another tab (or a sync) updates the saved list.
    window.addEventListener('storage', e => { if (e.key === GRAMMAR_KEY) renderSavedGrammar(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : globalThis);
