// Conversation starters (conversation.html): pick a question, write a few
// sentences in Japanese, and open hints one step at a time — words to talk
// about, verbs, grammar, then a way to begin — before comparing with a
// sample answer. Hints and answers differ per JLPT level.
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

  const api = { pieces, plain, kana, rubyHtml, parseHint, levelData, insertable, insertAt, charCount, answerKey, LEVELS, STEPS };
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
  const settings = Object.assign({ level: 'N5', furigana: true, topic: TOPICS[0] && TOPICS[0].id }, load(SETTINGS_KEY, {}));
  if (!LEVELS.includes(settings.level)) settings.level = 'N5';
  const store = Object.assign({ answers: {} }, load(STORE_KEY, {}));
  if (!store.answers || typeof store.answers !== 'object') store.answers = {};

  let hintStep = 0;       // how many hint steps are open
  let showEnglish = false;
  let compared = false;
  let saveTimer = null;

  const $ = id => document.getElementById(id);
  const topicIndex = id => Math.max(0, TOPICS.findIndex(t => t.id === id));
  const current = () => TOPICS[topicIndex(settings.topic)];

  function speakBtns(markup) {
    return global.Pronounce ? Pronounce.buttonsHtml(kana(markup)) : '';
  }

  // ─── Rendering ─────────────────────────────────────────────────────────────

  function renderLevels() {
    document.querySelectorAll('#cs-levels button').forEach(b => {
      b.setAttribute('aria-pressed', String(b.dataset.level === settings.level));
    });
  }

  function renderTopics() {
    const box = $('cs-topics');
    box.innerHTML = GROUPS.map(g => {
      const items = TOPICS.filter(t => t.group === g.id);
      if (!items.length) return '';
      return `<div class="cs-group">
        <div class="cs-group-name">${esc(g.name)} <span lang="ja">${esc(plain(g.ja))}</span></div>
        <div class="cs-group-items">${items.map(t => {
          const written = charCount((store.answers[answerKey(t.id, settings.level)] || {}).text) > 0;
          const active = t.id === settings.topic;
          return `<button class="cs-topic${active ? ' active' : ''}${written ? ' written' : ''}" data-topic="${esc(t.id)}"${active ? ' aria-current="true"' : ''}>
            <span class="cs-topic-ja" lang="ja">${esc(plain(levelData(t, settings.level).q.ja))}</span>
            <span class="cs-topic-en">${esc(levelData(t, settings.level).q.en)}</span>
            ${written ? '<span class="cs-topic-check" aria-label="written">✓</span>' : ''}
          </button>`;
        }).join('')}</div>
      </div>`;
    }).join('');
  }

  function renderQuestion() {
    const t = current();
    const d = levelData(t, settings.level);
    const i = topicIndex(t.id);
    const group = GROUPS.find(g => g.id === t.group);
    $('cs-meta').textContent = `${group ? group.name : ''} · ${i + 1} / ${TOPICS.length}`;
    $('cs-level').textContent = settings.level;
    $('cs-q').innerHTML = `<span class="cs-q-text">${rubyHtml(d.q.ja)}</span>${speakBtns(d.q.ja)}`;
    $('cs-q-en').textContent = d.q.en;
    $('cs-q-en').classList.toggle('hidden', !showEnglish);
    $('cs-en-btn').textContent = showEnglish ? 'Hide English' : 'Show English';

    const saved = store.answers[answerKey(t.id, settings.level)];
    $('cs-answer').value = saved ? saved.text : '';
    $('cs-saved').textContent = '';
    renderCount();
    renderHints();
    renderCompare();
  }

  function renderCount() {
    const n = charCount($('cs-answer').value);
    $('cs-count').textContent = n ? `${n} character${n === 1 ? '' : 's'}` : '';
  }

  function hintChip(h, step) {
    const tap = step !== 'grammar';
    const body = `<span class="cs-chip-ja" lang="ja">${rubyHtml(h.ja)}</span><span class="cs-chip-en">${esc(h.en)}</span>`;
    return tap
      ? `<button class="cs-chip" data-insert="${esc(insertable(h.ja))}" title="Add to your answer">${body}<span class="cs-chip-add" aria-hidden="true">＋</span></button>`
      : `<div class="cs-grammar">
          <div class="cs-grammar-head">${body}</div>
          ${h.ex ? `<div class="cs-grammar-ex"><span lang="ja">${rubyHtml(h.ex)}</span>${speakBtns(h.ex)}</div>
          <div class="cs-grammar-ex-en">${esc(h.exEn)}</div>` : ''}
        </div>`;
  }

  function renderHints() {
    const d = levelData(current(), settings.level);
    const steps = STEPS.filter(s => d[s.key].length);
    $('cs-hints').innerHTML = steps.slice(0, hintStep).map((s, i) => `
      <section class="cs-hint-step cs-hint-${s.key}">
        <h4><span aria-hidden="true">${s.icon}</span> Hint ${i + 1} · ${s.title}</h4>
        <div class="cs-hint-items${s.key === 'grammar' ? ' cs-hint-grammar' : ''}">${d[s.key].map(h => hintChip(h, s.key)).join('')}</div>
      </section>`).join('');
    const btn = $('cs-hint-btn');
    if (hintStep >= steps.length) {
      btn.disabled = true;
      btn.textContent = 'All hints shown';
    } else {
      btn.disabled = false;
      btn.textContent = `💡 ${hintStep ? 'Next hint' : 'Show a hint'} (${hintStep + 1}/${steps.length}): ${steps[hintStep].title.toLowerCase()}`;
    }
  }

  function renderCompare() {
    const box = $('cs-compare');
    const btn = $('cs-compare-btn');
    btn.textContent = compared ? 'Hide the sample answer' : `Compare with a sample answer (${settings.level})`;
    btn.setAttribute('aria-expanded', String(compared));
    box.classList.toggle('hidden', !compared);
    if (!compared) { box.innerHTML = ''; return; }
    const d = levelData(current(), settings.level);
    const mine = $('cs-answer').value.trim();
    box.innerHTML = `
      <div class="cs-compare-col cs-compare-mine">
        <h4>You wrote <span>${charCount(mine)} characters</span></h4>
        ${mine ? `<p lang="ja">${esc(mine).replace(/\n/g, '<br>')}</p>` : '<p class="cs-empty">Nothing yet — try writing a sentence or two first, then compare.</p>'}
      </div>
      <div class="cs-compare-col cs-compare-sample">
        <h4>Sample answer · ${settings.level} <span>${charCount(plain(d.answer.ja))} characters</span> ${speakBtns(d.answer.ja)}</h4>
        <p lang="ja" class="cs-sample-ja">${rubyHtml(d.answer.ja)}</p>
        <p class="cs-sample-en">${esc(d.answer.en)}</p>
      </div>
      <p class="cs-compare-tip">There's no single right answer. Look for words, grammar and linking phrases you could borrow — then try rewriting yours.</p>`;
  }

  function renderFurigana() {
    document.querySelector('.cs-main').classList.toggle('cs-no-furigana', !settings.furigana);
    $('cs-opt-furigana').checked = settings.furigana;
  }

  function renderAll() {
    renderLevels();
    renderTopics();
    renderQuestion();
    renderFurigana();
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  function saveSettings() { save(SETTINGS_KEY, settings); }

  function saveAnswer() {
    clearTimeout(saveTimer);
    saveTimer = null;
    const t = current();
    const key = answerKey(t.id, settings.level);
    const text = $('cs-answer').value;
    const had = !!store.answers[key];
    if (text.trim()) store.answers[key] = { text, t: Date.now() };
    else delete store.answers[key];
    save(STORE_KEY, store);
    $('cs-saved').textContent = text.trim() ? 'Saved' : '';
    if (had !== !!store.answers[key]) renderTopics();
  }

  function openTopic(id, { scroll = true } = {}) {
    if (saveTimer) saveAnswer();
    settings.topic = TOPICS[topicIndex(id)].id;
    saveSettings();
    hintStep = 0;
    compared = false;
    showEnglish = false;
    if (location.hash.slice(1) !== settings.topic) history.replaceState(null, '', '#' + settings.topic);
    renderTopics();
    renderQuestion();
    if (scroll) $('cs-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setLevel(level) {
    if (saveTimer) saveAnswer();
    settings.level = level;
    saveSettings();
    hintStep = 0;
    compared = false;
    renderLevels();
    renderTopics();
    renderQuestion();
  }

  function insertIntoAnswer(text) {
    const ta = $('cs-answer');
    const r = insertAt(ta.value, ta.selectionStart, ta.selectionEnd, text);
    ta.value = r.value;
    ta.focus();
    try { ta.setSelectionRange(r.caret, r.caret); } catch { /* not focused */ }
    renderCount();
    saveAnswer();
  }

  function init() {
    if (!TOPICS.length) return;
    const fromHash = TOPICS.find(t => t.id === location.hash.slice(1));
    if (fromHash) settings.topic = fromHash.id;
    if (!TOPICS.some(t => t.id === settings.topic)) settings.topic = TOPICS[0].id;
    $('cs-total').textContent = TOPICS.length;

    document.querySelectorAll('#cs-levels button').forEach(b => b.addEventListener('click', () => setLevel(b.dataset.level)));
    $('cs-topics').addEventListener('click', e => {
      const b = e.target.closest('[data-topic]');
      if (b) openTopic(b.dataset.topic);
    });
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

    $('cs-hint-btn').addEventListener('click', () => { hintStep++; renderHints(); });
    $('cs-hints').addEventListener('click', e => {
      const chip = e.target.closest('[data-insert]');
      if (chip) insertIntoAnswer(chip.dataset.insert);
    });
    $('cs-compare-btn').addEventListener('click', () => {
      if (saveTimer) saveAnswer();
      compared = !compared;
      renderCompare();
    });
    $('cs-clear').addEventListener('click', () => {
      if (!ta.value.trim() || confirm('Clear what you wrote for this question?')) {
        ta.value = '';
        renderCount();
        saveAnswer();
        if (compared) renderCompare();
      }
    });
    const step = d => openTopic(TOPICS[(topicIndex(settings.topic) + d + TOPICS.length) % TOPICS.length].id);
    $('cs-prev').addEventListener('click', () => step(-1));
    $('cs-next').addEventListener('click', () => step(1));
    $('cs-random').addEventListener('click', () => {
      const others = TOPICS.filter(t => t.id !== settings.topic);
      openTopic(others[Math.floor(Math.random() * others.length)].id);
    });
    window.addEventListener('hashchange', () => {
      const id = location.hash.slice(1);
      if (id && id !== settings.topic && TOPICS.some(t => t.id === id)) openTopic(id);
    });
    window.addEventListener('pagehide', () => { if (saveTimer) saveAnswer(); });

    renderAll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : globalThis);
