// Conversation starters (conversation.html): pick a question from the list
// and it opens on its own page (conversation.html#<id>), where you write a
// few sentences in Japanese. Every hint is there as a locked tile — words to
// talk about, verbs, grammar, a way to begin, the sample answer — showing
// only its English until you unlock it. Hints and answers differ per JLPT
// level.
//
// The questions live in conversation-data.js. What you write is kept per
// question and level in tokidoki_conversation (synced with the account;
// sync-merge.js keeps the newer text of each). The pure parts are exported
// for test_conversation.js.
(function (global) {
  'use strict';

  const KANJI = '㐀-䶿一-鿿々〆ヶ';
  const RUBY_RE = new RegExp('([' + KANJI + ']+)\\[([^\\]]+)\\]', 'g');
  const STORE_KEY = 'tokidoki_conversation';
  const SETTINGS_KEY = 'tokidoki_conversation_settings';
  const LEVELS = ['N5', 'N4', 'N3'];
  const STEPS = [
    { key: 'words', icon: '🧺', title: 'Words to talk about' },
    { key: 'verbs', icon: '🏃', title: 'Verbs & describing words' },
    { key: 'grammar', icon: '🧩', title: 'Grammar to link ideas' },
    { key: 'start', icon: '✏️', title: 'A way to begin' },
  ];

  // ─── Markup ────────────────────────────────────────────────────────────────

  function pieces(markup) {
    const out = [];
    let last = 0;
    String(markup).replace(RUBY_RE, (m, t, r, i) => {
      if (i > last) out.push({ t: markup.slice(last, i) });
      out.push({ t, r });
      last = i + m.length;
      return m;
    });
    if (last < markup.length) out.push({ t: markup.slice(last) });
    return out;
  }

  const plain = markup => pieces(markup).map(p => p.t).join('');
  const kana = markup => pieces(markup).map(p => p.r || p.t).join('');

  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function rubyHtml(markup) {
    return pieces(markup).map(p => p.r
      ? `<ruby>${esc(p.t)}<rt>${esc(p.r)}</rt></ruby>`
      : esc(p.t)).join('');
  }

  // ─── Data ──────────────────────────────────────────────────────────────────

  // 'ja|en|example|example English' → { ja, en, ex, exEn }
  function parseHint(str) {
    const [ja, en = '', ex = '', exEn = ''] = String(str).split('|');
    return { ja, en, ex, exEn };
  }

  // Everything a topic shows at one level, with the hints parsed.
  function levelData(topic, level) {
    const d = topic[level] || {};
    const q = d.q || topic.q;
    return {
      q: { ja: q[0], en: q[1] },
      words: (d.words || []).map(parseHint),
      verbs: (d.verbs || []).map(parseHint),
      grammar: (d.grammar || []).map(parseHint),
      start: d.start ? [parseHint(d.start)] : [],
      answer: { ja: d.answer[0], en: d.answer[1] },
    };
  }

  // What a tapped hint adds to your answer: the plain Japanese, without the
  // 〜 placeholders.
  const insertable = markup => plain(markup).replace(/[〜~]/g, '');

  // Puts `text` in place of the selection [start, end). Returns the new
  // value and where the caret goes.
  function insertAt(value, start, end, text) {
    const v = String(value || '');
    const s = Math.max(0, Math.min(start == null ? v.length : start, v.length));
    const e = Math.max(s, Math.min(end == null ? s : end, v.length));
    return { value: v.slice(0, s) + text + v.slice(e), caret: s + text.length };
  }

  // Characters written, not counting spaces and line breaks.
  const charCount = text => Array.from(String(text || '').replace(/\s/g, '')).length;

  const answerKey = (id, level) => id + ':' + level;

  // Every unlockable hint of a level, in order, with a stable id.
  function hintItems(d) {
    return STEPS.flatMap(s => d[s.key].map((h, i) => Object.assign({ id: s.key + '-' + i, step: s.key }, h)));
  }

  const api = { pieces, plain, kana, rubyHtml, parseHint, levelData, insertable, insertAt, charCount, answerKey, hintItems, LEVELS, STEPS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.Conversation = api;
  if (typeof document === 'undefined') return;

  // ─── State ─────────────────────────────────────────────────────────────────

  function load(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  }

  const TOPICS = global.CONVERSATION_TOPICS || [];
  const GROUPS = global.CONVERSATION_GROUPS || [];
  const settings = Object.assign({ level: 'N5', furigana: true }, load(SETTINGS_KEY, {}));
  if (!LEVELS.includes(settings.level)) settings.level = 'N5';
  const store = Object.assign({ answers: {} }, load(STORE_KEY, {}));
  if (!store.answers || typeof store.answers !== 'object') store.answers = {};

  let topic = null;            // the open question, or null on the list
  let unlocked = new Set();    // hint ids unlocked on this visit ('answer' for the sample)
  let showEnglish = false;
  let saveTimer = null;

  const $ = id => document.getElementById(id);
  const byId = id => TOPICS.find(t => t.id === id);
  const indexOf = t => TOPICS.indexOf(t);
  const written = (t, level) => charCount((store.answers[answerKey(t.id, level)] || {}).text) > 0;

  function speakBtns(markup) {
    return global.Pronounce ? Pronounce.buttonsHtml(kana(markup)) : '';
  }

  // ─── The list ──────────────────────────────────────────────────────────────

  function renderLevels() {
    document.querySelectorAll('.cs-level-btns button').forEach(b => {
      b.setAttribute('aria-pressed', String(b.dataset.level === settings.level));
    });
  }

  function renderTopics() {
    $('cs-topics').innerHTML = GROUPS.map(g => {
      const items = TOPICS.filter(t => t.group === g.id);
      if (!items.length) return '';
      return `<div class="cs-group">
        <div class="cs-group-name">${esc(g.name)} <span lang="ja">${esc(plain(g.ja))}</span></div>
        <div class="cs-group-items">${items.map(t => {
          const d = levelData(t, settings.level);
          const done = written(t, settings.level);
          return `<a class="cs-topic${done ? ' written' : ''}" href="#${esc(t.id)}">
            <span class="cs-topic-ja" lang="ja">${esc(plain(d.q.ja))}</span>
            <span class="cs-topic-en">${esc(d.q.en)}</span>
            <span class="cs-topic-go" aria-hidden="true">${done ? '✓' : '›'}</span>
          </a>`;
        }).join('')}</div>
      </div>`;
    }).join('');
    const n = TOPICS.filter(t => written(t, settings.level)).length;
    $('cs-done').textContent = n ? ` · ${n} answered at ${settings.level}` : '';
  }

  // ─── A question ────────────────────────────────────────────────────────────

  function renderQuestion() {
    const d = levelData(topic, settings.level);
    const group = GROUPS.find(g => g.id === topic.group);
    $('cs-meta').textContent = `${group ? group.name : ''} · ${indexOf(topic) + 1} / ${TOPICS.length}`;
    $('cs-q').innerHTML = `<span class="cs-q-text">${rubyHtml(d.q.ja)}</span>${speakBtns(d.q.ja)}`;
    $('cs-q-en').textContent = d.q.en;
    $('cs-q-en').classList.toggle('hidden', !showEnglish);
    $('cs-en-btn').textContent = showEnglish ? 'Hide English' : 'Show English';
    const saved = store.answers[answerKey(topic.id, settings.level)];
    $('cs-answer').value = saved ? saved.text : '';
    $('cs-saved').textContent = '';
    renderCount();
    renderHints();
    renderSample();
  }

  function renderCount() {
    const n = charCount($('cs-answer').value);
    $('cs-count').textContent = n ? `${n} character${n === 1 ? '' : 's'}` : '';
  }

  function lockedTile(h, id) {
    return `<button class="cs-tile cs-locked" data-unlock="${id}" aria-label="Unlock: ${esc(h.en)}">
      <span class="cs-lock" aria-hidden="true">🔒</span><span class="cs-tile-en">${esc(h.en)}</span>
    </button>`;
  }

  function openTile(h, step) {
    const body = `<span class="cs-chip-ja" lang="ja">${rubyHtml(h.ja)}</span><span class="cs-chip-en">${esc(h.en)}</span>`;
    if (step !== 'grammar') {
      return `<button class="cs-tile cs-chip" data-insert="${esc(insertable(h.ja))}" title="Add to your answer">${body}<span class="cs-chip-add" aria-hidden="true">＋</span></button>`;
    }
    return `<div class="cs-tile cs-grammar">
      <div class="cs-grammar-head">${body}</div>
      <div class="cs-grammar-ex"><span lang="ja">${rubyHtml(h.ex)}</span>${speakBtns(h.ex)}</div>
      <div class="cs-grammar-ex-en">${esc(h.exEn)}</div>
    </div>`;
  }

  function renderHints() {
    const d = levelData(topic, settings.level);
    const all = hintItems(d);
    $('cs-hints').innerHTML = STEPS.filter(s => d[s.key].length).map(s => {
      const items = all.filter(h => h.step === s.key);
      const open = items.filter(h => unlocked.has(h.id)).length;
      return `<section class="cs-hint-step cs-hint-${s.key}">
        <div class="cs-hint-title">
          <h4><span aria-hidden="true">${s.icon}</span> ${s.title} <span>${open} / ${items.length}</span></h4>
          ${open < items.length ? `<button class="cs-unlock-all" data-unlock-step="${s.key}">Unlock all</button>` : ''}
        </div>
        <div class="cs-hint-items${s.key === 'grammar' ? ' cs-hint-grammar' : ''}">${items.map(h =>
          unlocked.has(h.id) ? openTile(h, s.key) : lockedTile(h, h.id)).join('')}</div>
      </section>`;
    }).join('');
    const open = all.filter(h => unlocked.has(h.id)).length;
    $('cs-unlocked').textContent = `${open} / ${all.length} unlocked`;
  }

  function renderSample() {
    const box = $('cs-sample');
    const d = levelData(topic, settings.level);
    if (!unlocked.has('answer')) {
      box.innerHTML = `<button class="cs-sample-locked" data-unlock="answer">
        <span class="cs-lock" aria-hidden="true">🔒</span>
        <span><b>Sample answer · ${settings.level}</b><span>Unlock it when you've written yours, and compare.</span></span>
      </button>`;
      return;
    }
    const mine = $('cs-answer').value.trim();
    box.innerHTML = `<div class="cs-compare">
      <div class="cs-compare-col cs-compare-mine">
        <h4>You wrote <span>${charCount(mine)} characters</span></h4>
        ${mine ? `<p lang="ja">${esc(mine).replace(/\n/g, '<br>')}</p>` : '<p class="cs-empty">Nothing yet — try a sentence or two, then compare.</p>'}
      </div>
      <div class="cs-compare-col cs-compare-sample">
        <h4>Sample answer · ${settings.level} <span>${charCount(plain(d.answer.ja))} characters</span> ${speakBtns(d.answer.ja)}</h4>
        <p lang="ja" class="cs-sample-ja">${rubyHtml(d.answer.ja)}</p>
        <p class="cs-sample-en">${esc(d.answer.en)}</p>
      </div>
      <p class="cs-compare-tip">There's no single right answer. Borrow words, grammar and linking phrases you like — then try rewriting yours.</p>
    </div>`;
  }

  function renderFurigana() {
    document.body.classList.toggle('cs-no-furigana', !settings.furigana);
    $('cs-opt-furigana').checked = settings.furigana;
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  function saveSettings() { save(SETTINGS_KEY, settings); }

  function saveAnswer() {
    clearTimeout(saveTimer);
    saveTimer = null;
    if (!topic) return;
    const key = answerKey(topic.id, settings.level);
    const text = $('cs-answer').value;
    if (text.trim()) store.answers[key] = { text, t: Date.now() };
    else delete store.answers[key];
    save(STORE_KEY, store);
    $('cs-saved').textContent = text.trim() ? 'Saved' : '';
  }

  // Shows the list or a question, from the address: conversation.html#<id>.
  function route() {
    if (saveTimer) saveAnswer();
    const t = byId(decodeURIComponent(location.hash.slice(1)));
    if (t !== topic || !t) { unlocked = new Set(); showEnglish = false; }
    topic = t || null;
    $('screen-chapters').classList.toggle('active', !topic);
    $('screen-conversation').classList.toggle('active', !!topic);
    renderLevels();
    if (topic) {
      document.title = `${plain(levelData(topic, settings.level).q.ja)} – Conversation Starters | Tokidoki`;
      renderQuestion();
    } else {
      document.title = TITLE;
      renderTopics();
    }
    window.scrollTo(0, 0);
  }

  function setLevel(level) {
    if (saveTimer) saveAnswer();
    settings.level = level;
    saveSettings();
    unlocked = new Set();
    renderLevels();
    if (topic) renderQuestion();
    else renderTopics();
  }

  function insertIntoAnswer(text) {
    const ta = $('cs-answer');
    const r = insertAt(ta.value, ta.selectionStart, ta.selectionEnd, text);
    ta.value = r.value;
    ta.focus({ preventScroll: true });
    try { ta.setSelectionRange(r.caret, r.caret); } catch { /* not focused */ }
    renderCount();
    saveAnswer();
    const flash = $('cs-answer');
    flash.classList.remove('cs-flash');
    void flash.offsetWidth;
    flash.classList.add('cs-flash');
  }

  const TITLE = document.title;

  function init() {
    if (!TOPICS.length) return;
    $('cs-total').textContent = TOPICS.length;

    document.querySelectorAll('.cs-level-btns button').forEach(b => b.addEventListener('click', () => setLevel(b.dataset.level)));
    $('cs-opt-furigana').addEventListener('change', e => { settings.furigana = e.target.checked; saveSettings(); renderFurigana(); });
    $('cs-en-btn').addEventListener('click', () => { showEnglish = !showEnglish; renderQuestion(); });

    const ta = $('cs-answer');
    if (global.Romaji) Romaji.attach(ta);
    ta.addEventListener('input', () => {
      renderCount();
      $('cs-saved').textContent = '';
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveAnswer, 600);
    });
    ta.addEventListener('blur', () => { if (saveTimer) saveAnswer(); });

    $('screen-conversation').addEventListener('click', e => {
      const one = e.target.closest('[data-unlock]');
      if (one) {
        unlocked.add(one.dataset.unlock);
        if (one.dataset.unlock === 'answer') { saveAnswer(); renderSample(); } else renderHints();
        return;
      }
      const step = e.target.closest('[data-unlock-step]');
      if (step) {
        hintItems(levelData(topic, settings.level)).filter(h => h.step === step.dataset.unlockStep).forEach(h => unlocked.add(h.id));
        renderHints();
        return;
      }
      const chip = e.target.closest('[data-insert]');
      if (chip) insertIntoAnswer(chip.dataset.insert);
    });
    $('cs-clear').addEventListener('click', () => {
      if (!ta.value.trim() || confirm('Clear what you wrote for this question?')) {
        ta.value = '';
        renderCount();
        saveAnswer();
        if (unlocked.has('answer')) renderSample();
      }
    });
    const go = t => { location.hash = t.id; };
    $('cs-prev').addEventListener('click', () => go(TOPICS[(indexOf(topic) - 1 + TOPICS.length) % TOPICS.length]));
    $('cs-next').addEventListener('click', () => go(TOPICS[(indexOf(topic) + 1) % TOPICS.length]));
    $('cs-random').addEventListener('click', () => {
      const others = TOPICS.filter(t => t !== topic);
      go(others[Math.floor(Math.random() * others.length)]);
    });
    $('cs-random-list').addEventListener('click', () => go(TOPICS[Math.floor(Math.random() * TOPICS.length)]));
    window.addEventListener('hashchange', route);
    window.addEventListener('pagehide', () => { if (saveTimer) saveAnswer(); });

    renderFurigana();
    route();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : globalThis);
