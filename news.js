// The News pages: short news stories from news-data.js, each told at JLPT
// N5, N4 and N3.
//
//   news.html          — the headlines, newest first, in the level picked
//                        there, plus the grammar points saved from stories.
//   news-<id>.html     — one story (body data-story="<id>"), read like a
//                        story on the Stories page, with an N5 / N4 / N3
//                        switch. These pages are written by
//                        scripts/render_news_pages.mjs.
//
// The last level picked, on either, is remembered for both.
//
// In a story, tapping a word shows its reading and meaning (from
// news-words.js, built by scripts/tokenize_news.mjs) and can save it to the
// word flashcards (tokidoki_story_words, the deck the Stories and Phrases
// pages use, reviewed on flashcards.html) and its kanji to the kanji cards.
// Tapping a sentence shows its English, a note and its grammar; grammar
// points can be saved (tokidoki_saved_grammar), listed under "Saved grammar"
// on news.html. Furigana and English can be switched off, and ▶ / 🐢 read
// the story aloud.
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
  const pageFile = id => `news-${id}.html`;

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

  const api = { LEVELS, lineId, pageFile, lineSource, deckSentence, plainText, kanaText, rubyHtml };
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

  const settings = { furigana: true, english: false, level: 'N5', ...loadJson(SETTINGS_KEY, {}) };
  if (!LEVELS.includes(settings.level)) settings.level = 'N5';
  const saveSettings = () => saveJson(SETTINGS_KEY, settings);
  const jpHtml = text => settings.furigana ? rubyHtml(text) : esc(plainText(text));


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
    }).join('')}</ul>` : '<p class="phrase-grammar-none">Nothing saved yet. In a story, tap a sentence number and then <b>＋ Save grammar</b> to keep a grammar point here.</p>';
  }

  // ─── A story (news-<id>.html) ──────────────────────────────────────────────
  //
  // Laid out like the Stories reader: the text on the left, a panel on the
  // right (a bottom sheet on phones). Tapping a word shows it in the panel;
  // tapping a sentence (its number, or beside it) shows its translation, a
  // note and its grammar — hover or tap a grammar point to light up its words.

  let item = null;
  let selection = null;      // { type: 'word', s, t } or { type: 'sentence', s }
  let activeGrammar = null;  // index into the selected sentence's grammar
  let reading = null;        // sentence being read aloud
  let readingSlow = false;

  const level = () => (item.levels[settings.level] ? settings.level : LEVELS.find(l => item.levels[l]));
  const version = () => item.levels[level()];
  const sentenceId = s => lineId(item, level(), s);
  const sentenceWords = s => (words.lines[sentenceId(s)] || { w: [], g: [] });
  const pronounceHtml = (text, cls) => global.Pronounce ? Pronounce.buttonsHtml(text, cls) : '';

  // The word pieces a grammar snippet covers, by index.
  function snippetPieces(s, snippet) {
    const pieces = sentenceWords(s).w;
    let at = 0;
    const spans = pieces.map(p => {
      const len = plainText(typeof p === 'string' ? p : p[0]).length;
      const span = [at, at + len];
      at += len;
      return span;
    });
    const plain = plainText(version().lines[s][0]);
    const from = plain.indexOf(snippet);
    if (from === -1) return [];
    const to = from + snippet.length;
    return spans.map(([a, b], i) => (a < to && b > from ? i : -1)).filter(i => i !== -1);
  }

  function renderReader() {
    const v = version();
    $('#news-title').innerHTML = jpHtml(v.title);
    $('#news-title-en').textContent = item.titleEn;
    $('#news-date').textContent = formatDate(item.date);
    document.querySelectorAll('#news-levels [data-level]').forEach(btn => {
      btn.setAttribute('aria-pressed', btn.dataset.level === level());
      btn.disabled = !item.levels[btn.dataset.level];
    });
    $('#news-toggle-furigana').checked = settings.furigana;
    $('#news-toggle-english').checked = settings.english;

    const deck = loadJson(DECK_KEY, {});
    const text = $('#news-text');
    text.innerHTML = v.lines.map((line, s) => {
      const pieces = sentenceWords(s).w.map((p, t) => {
        if (typeof p === 'string') return `<span class="story-punct">${jpHtml(p)}</span>`;
        return `<span class="story-word${has(deck, p[1]) ? ' saved' : ''}" data-s="${s}" data-t="${t}" role="button" tabindex="0">${jpHtml(p[0])}</span>`;
      }).join('');
      return `
        <div class="story-sentence${reading === s ? ' reading' : ''}" data-s="${s}">
          <button class="story-sentence-num" data-s="${s}" aria-label="Grammar in sentence ${s + 1}" title="Show grammar">${s + 1}</button>
          <div class="story-sentence-body">
            <div class="story-jp" lang="ja">${pieces}</div>
            <div class="story-en">${esc(line[1])}</div>
          </div>
        </div>`;
    }).join('') + (item.sources && item.sources.length
      ? `<p class="news-sources">Sources: ${item.sources.map(src => `<a href="${esc(src.url)}" target="_blank" rel="noopener">${esc(src.name)}</a>`).join(', ')}</p>`
      : '');
    text.classList.toggle('show-english', settings.english);
    renderReadButtons();
    renderSelection();
  }

  function renderSelection() {
    const text = $('#news-text');
    const panel = $('#news-panel');
    const sel = selection;
    text.querySelectorAll('.story-sentence').forEach(el => {
      el.classList.toggle('selected', !!sel && Number(el.dataset.s) === sel.s);
    });
    text.querySelectorAll('.story-word').forEach(el => {
      el.classList.toggle('selected', !!sel && sel.type === 'word' && Number(el.dataset.s) === sel.s && Number(el.dataset.t) === sel.t);
    });
    highlightGrammar(activeGrammar);

    panel.classList.toggle('open', !!sel);
    const body = $('#news-panel-body');
    if (!sel) {
      body.innerHTML = `
        <p class="story-panel-empty">
          Tap a <strong>word</strong> to look it up and add it to your flashcards.<br>
          Tap a <strong>sentence number</strong> (or the space beside a sentence) to see its grammar — and save the grammar you want to remember.
        </p>`;
      return;
    }

    const line = version().lines[sel.s];
    const id = sentenceId(sel.s);
    if (sel.type === 'word') {
      const [src, key] = sentenceWords(sel.s).w[sel.t];
      const [reading, meaning, pos] = words.gloss[key];
      const word = displayWord(key);
      const surface = plainText(src);
      const saved = isSaved(key);
      body.innerHTML = `
        <div class="story-panel-kicker">Word</div>
        <div class="story-panel-word" lang="ja">${esc(word)}</div>
        ${reading !== word ? `<div class="story-panel-reading" lang="ja">${esc(reading)}</div>` : ''}
        ${pronounceHtml(reading, 'story-panel-speak')}
        <div class="story-panel-pos">${esc(pos)}</div>
        <div class="story-panel-meaning">${esc(meaning)}</div>
        ${surface !== word ? `<div class="story-panel-form">In the text: <span lang="ja">${esc(surface)}</span>${pronounceHtml(kanaText(src))}</div>` : ''}
        <button class="${saved ? 'btn-secondary' : 'btn-primary'} story-panel-add" id="btn-news-add-word">
          ${saved ? '✓ In word flashcards — remove' : '＋ Add word to flashcards'}
        </button>
        ${global.KanjiCards ? KanjiCards.breakdownHtml(word, { reading, meaning }) : ''}
        <button class="story-panel-link" id="btn-news-word-sentence">Grammar in this sentence →</button>`;
      return;
    }

    const grammar = sentenceWords(sel.s).g.map(([gid, snippet], gi) => {
      const g = words.grammar[gid];
      if (!g) return '';
      const saved = isGrammarSaved(gid);
      return `
        <li class="story-grammar-item${activeGrammar === gi ? ' active' : ''}" data-g="${gi}" tabindex="0">
          <div class="story-grammar-head">
            <span class="story-grammar-title">${g.title}</span>
            <span class="story-grammar-level">${esc(g.level)}</span>
          </div>
          <div class="story-grammar-pattern" lang="ja">${g.pattern}</div>
          <div class="story-grammar-note">${g.note}</div>
          ${snippet ? `<div class="story-grammar-here">Here: <span lang="ja">${esc(snippet)}</span></div>` : ''}
          <button type="button" class="phrase-word-add news-grammar-save${saved ? ' saved' : ''}" data-save-grammar="${esc(gid)}" data-line="${esc(id)}" aria-pressed="${saved}">${saved ? '✓ Saved grammar' : '＋ Save grammar'}</button>
        </li>`;
    }).join('');
    body.innerHTML = `
      <div class="story-panel-kicker">Sentence ${sel.s + 1}</div>
      <div class="story-panel-sentence" lang="ja">${rubyHtml(line[0])}</div>
      ${pronounceHtml(kanaText(line[0]), 'story-panel-speak')}
      <div class="story-panel-en">${esc(line[1])}</div>
      ${line[2] ? `<p class="news-explain-note">${esc(line[2])}</p>` : ''}
      <div class="story-panel-kicker">Grammar</div>
      ${grammar ? `<ul class="story-grammar-list">${grammar}</ul>` : '<p class="story-panel-empty">No grammar to unpack here — just nouns and names.</p>'}
      <p class="phrase-explain-tip">Saved grammar is listed on the <a href="news.html#news-saved-grammar">News page</a>; saved words are reviewed on the <a href="flashcards.html">Flashcards page</a>.</p>`;
  }

  function highlightGrammar(gi) {
    const text = $('#news-text');
    text.querySelectorAll('.story-word.grammar-hit').forEach(el => el.classList.remove('grammar-hit'));
    if (gi === null || !selection || selection.type !== 'sentence') return;
    const ref = sentenceWords(selection.s).g[gi];
    if (!ref) return;
    snippetPieces(selection.s, ref[1]).forEach(t => {
      const el = text.querySelector(`.story-word[data-s="${selection.s}"][data-t="${t}"]`);
      if (el) el.classList.add('grammar-hit');
    });
  }

  function select(sel) {
    selection = sel;
    activeGrammar = null;
    renderSelection();
  }

  // ─── Reading aloud ─────────────────────────────────────────────────────────

  function renderReadButtons() {
    const supported = !!(global.Pronounce && Pronounce.supported);
    [['#btn-news-read', false], ['#btn-news-read-slow', true]].forEach(([sel, slow]) => {
      const btn = $(sel);
      btn.classList.toggle('hidden', !supported);
      const on = reading !== null && readingSlow === slow;
      btn.setAttribute('aria-pressed', on);
      btn.textContent = on ? '■ Stop' : (slow ? '🐢 Slowly' : '▶ Read aloud');
    });
  }

  function markReading(s) {
    reading = s;
    document.querySelectorAll('#news-text .story-sentence').forEach(el => {
      el.classList.toggle('reading', Number(el.dataset.s) === s);
    });
    const el = s === null ? null : document.querySelector(`#news-text .story-sentence[data-s="${s}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    renderReadButtons();
  }

  function stopReading() {
    if (global.Pronounce) Pronounce.stop();
    markReading(null);
  }

  function readStory(slow) {
    if (!global.Pronounce) return;
    if (reading !== null && readingSlow === slow) { stopReading(); return; }
    Pronounce.stop();
    readingSlow = slow;
    Pronounce.speakAll(version().lines.map(l => kanaText(l[0])), {
      slow,
      onStart: i => markReading(i),
      onDone: () => markReading(null),
    });
  }

  // ─── Events ────────────────────────────────────────────────────────────────

  function initStory(id) {
    item = items.find(x => x.id === id);
    if (!item) {
      $('#news-text').innerHTML = '<p class="phrase-empty">This story is no longer available. <a href="news.html">See the latest news</a>.</p>';
      return;
    }
    renderReader();

    $('#news-levels').addEventListener('click', e => {
      const btn = e.target.closest('[data-level]');
      if (!btn || !item.levels[btn.dataset.level]) return;
      stopReading();
      settings.level = btn.dataset.level;
      saveSettings();
      selection = null;
      activeGrammar = null;
      renderReader();
    });

    // Clicking outside the panel, a sentence or the toolbars deselects.
    document.addEventListener('click', e => {
      // A panel button may already have re-rendered the panel and detached
      // the clicked element; that click was inside.
      if (!selection || !e.target.isConnected) return;
      if (e.target.closest('#news-panel, .story-sentence, .story-toggles, #news-levels')) return;
      select(null);
    }, true);

    const text = $('#news-text');
    text.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      const word = e.target.closest('.story-word');
      if (word) {
        const s = Number(word.dataset.s);
        const t = Number(word.dataset.t);
        select({ type: 'word', s, t });
        if (global.Pronounce) Pronounce.onClick(kanaText(sentenceWords(s).w[t][0]));
        return;
      }
      const sentence = e.target.closest('.story-sentence');
      if (sentence) {
        const s = Number(sentence.dataset.s);
        select({ type: 'sentence', s });
        if (global.Pronounce) Pronounce.onClick(kanaText(version().lines[s][0]));
      }
    });
    text.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const word = e.target.closest('.story-word');
      if (!word) return;
      e.preventDefault();
      select({ type: 'word', s: Number(word.dataset.s), t: Number(word.dataset.t) });
    });

    const panel = $('#news-panel');
    panel.addEventListener('click', e => {
      if (e.target.closest('#news-panel-close')) { select(null); return; }
      if (e.target.closest('#btn-news-add-word')) {
        const key = sentenceWords(selection.s).w[selection.t][1];
        toggleWord(key, sentenceId(selection.s));
        const saved = isSaved(key);
        document.querySelectorAll('#news-text .story-word').forEach(el => {
          const p = sentenceWords(Number(el.dataset.s)).w[Number(el.dataset.t)];
          if (p[1] === key) el.classList.toggle('saved', saved);
        });
        renderSelection();
        return;
      }
      if (e.target.closest('#btn-news-word-sentence')) { select({ type: 'sentence', s: selection.s }); return; }
      const g = e.target.closest('.story-grammar-item');
      if (g && !e.target.closest('a')) {
        const gi = Number(g.dataset.g);
        activeGrammar = activeGrammar === gi ? null : gi;
        panel.querySelectorAll('.story-grammar-item').forEach(el => el.classList.toggle('active', Number(el.dataset.g) === activeGrammar));
        highlightGrammar(activeGrammar);
      }
    });
    panel.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const g = e.target.closest('.story-grammar-item');
      if (!g || e.target !== g) return;
      e.preventDefault();
      g.click();
    });
    // Hovering a grammar point previews its words; leaving restores the
    // clicked one, if any.
    panel.addEventListener('mouseover', e => {
      const g = e.target.closest('.story-grammar-item');
      if (g) highlightGrammar(Number(g.dataset.g));
    });
    panel.addEventListener('mouseout', e => {
      const g = e.target.closest('.story-grammar-item');
      if (g && !g.contains(e.relatedTarget)) highlightGrammar(activeGrammar);
    });

    $('#btn-news-read').addEventListener('click', () => readStory(false));
    $('#btn-news-read-slow').addEventListener('click', () => readStory(true));
    $('#news-toggle-english').addEventListener('change', e => {
      settings.english = e.target.checked;
      saveSettings();
      $('#news-text').classList.toggle('show-english', settings.english);
    });
  }

  // ─── The headlines (news.html) ─────────────────────────────────────────────

  function renderHeadlines() {
    document.querySelectorAll('#news-index-levels [data-level]').forEach(btn => {
      btn.setAttribute('aria-pressed', btn.dataset.level === settings.level);
    });
    const dates = [...new Set(items.map(it => it.date))];
    $('#news-headlines').innerHTML = dates.length ? dates.map(date => `
      <section class="news-day">
        <h2 class="phrase-group-title">${esc(formatDate(date))}</h2>
        <div class="news-headline-list">
          ${items.filter(it => it.date === date).map(it => {
            const v = it.levels[settings.level] || it.levels[LEVELS.find(l => it.levels[l])];
            return `
          <a class="chapter-card news-headline-card" href="${pageFile(it.id)}">
            <span class="news-headline-emoji" aria-hidden="true">${it.emoji}</span>
            <span class="news-headline-text">
              <span class="news-headline-jp" lang="ja">${jpHtml(v.title)}</span>
              <span class="news-headline-en">${esc(it.titleEn)}</span>
            </span>
          </a>`;
          }).join('')}
        </div>
      </section>`).join('') : '<p class="phrase-empty">No news yet — check back soon.</p>';
  }

  function initIndex() {
    // Old links to a story on the index (news.html#<id>) go to its page.
    const hash = decodeURIComponent(location.hash.slice(1));
    if (items.some(it => it.id === hash)) { location.replace(pageFile(hash)); return; }
    renderHeadlines();
    renderSavedGrammar();
    $('#news-index-levels').addEventListener('click', e => {
      const btn = e.target.closest('[data-level]');
      if (!btn) return;
      settings.level = btn.dataset.level;
      saveSettings();
      renderHeadlines();
    });
    // Saving on another tab (or a sync) updates the saved list.
    window.addEventListener('storage', e => { if (e.key === GRAMMAR_KEY) renderSavedGrammar(); });
  }

  // ─── Shared ────────────────────────────────────────────────────────────────

  function init() {
    const story = document.body.dataset.story;
    if (!story && !$('#news-headlines')) return;
    $('#news-toggle-furigana').checked = settings.furigana;
    $('#news-toggle-furigana').addEventListener('change', e => {
      settings.furigana = e.target.checked;
      saveSettings();
      if (story) renderReader();
      else { renderHeadlines(); renderSavedGrammar(); }
    });

    // Grammar save buttons, in the panel and the saved list.
    document.addEventListener('click', e => {
      const g = e.target.closest && e.target.closest('[data-save-grammar]');
      if (!g) return;
      e.preventDefault();
      e.stopPropagation();
      const gid = g.dataset.saveGrammar;
      toggleGrammar(gid, g.dataset.line);
      if (story) renderSelection();
      else renderSavedGrammar();
    }, true);

    if (story) initStory(story);
    else initIndex();
    window.addEventListener('pagehide', () => { if (global.Pronounce) Pronounce.stop(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : globalThis);
