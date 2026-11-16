// JLPT Reading (jlpt-reading.html): the practical texts of the JLPT reading
// section — notices, emails, memos, invitations (内容理解・短文) and flyers,
// price lists and timetables (情報検索) — at N5 to N2, with the exam's own
// kind of question: what must you do, what does the writer most want to
// say, which option fits this person.
//
// The texts are in jlpt-reading-data.js (markup described there). Once a
// question is answered, the part of the text its answer rests on is
// highlighted and the answer explained; once all are answered, the whole
// text's translation and its harder words are shown. Best scores per text
// are kept in tokidoki_jlpt_reading (merged like the other games' stores in
// sync-merge.js).
//
// The pure parts (markup, attempts, scoring) are exported for
// test_jlpt_reading.js.
(function (global) {
  'use strict';

  const STORE_KEY = 'tokidoki_jlpt_reading';
  const SETTINGS_KEY = 'tokidoki_jlpt_reading_settings';
  const LEVELS = ['N5', 'N4', 'N3', 'N2'];

  const TYPES = {
    short: { title: 'Notices, emails & memos', ja: '内容理解（短文）', about: 'Read a short practical text: what must someone do, or what is the writer’s point?' },
    info: { title: 'Information retrieval', ja: '情報検索', about: 'Scan a flyer, price list or timetable for the one option that fits someone’s situation.' },
  };
  const FORMS = {
    notice: 'お知らせ', email: 'メール', memo: 'メモ', message: 'メッセージ', invite: '招待', flyer: '案内',
  };

  // ─── Markup ────────────────────────────────────────────────────────────────

  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // "{駅|えき}で" → <ruby>駅<rt>えき</rt></ruby>で; "«1|…»" → the part
  // question 1's answer rests on, highlighted once `shown` has 1.
  function inlineHtml(markup, shown = new Set()) {
    let out = '';
    const re = /«(\d)\||»|\{([^|}]+)\|([^}]+)\}/g;
    let last = 0, m;
    while ((m = re.exec(markup))) {
      out += esc(markup.slice(last, m.index));
      if (m[1]) out += `<mark class="jr-key${shown.has(Number(m[1])) ? ' jr-key-on' : ''}" data-q="${m[1]}">`;
      else if (m[0] === '»') out += '</mark>';
      else out += `<ruby>${esc(m[2])}<rt>${esc(m[3])}</rt></ruby>`;
      last = re.lastIndex;
    }
    return out + esc(markup.slice(last));
  }

  const plain = markup => String(markup).replace(/«\d\||»/g, '').replace(/\{([^|}]+)\|[^}]+\}/g, '$1');

  // Splits at `sep` outside {…} and «…» (both hold a "|" of their own).
  function splitTop(line, sep) {
    const parts = [];
    let depth = 0, cur = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '{' || ch === '«') depth++;
      else if ((ch === '}' || ch === '»') && depth) depth--;
      if (depth === 0 && line.startsWith(sep, i)) { parts.push(cur); cur = ''; i += sep.length - 1; continue; }
      cur += ch;
    }
    parts.push(cur);
    return parts;
  }

  // One text's lines → blocks: heading, right-aligned line, email header,
  // table (header row first), or paragraph.
  function textHtml(passage, shown = new Set()) {
    const lines = passage.text.split('\n');
    const out = [];
    let table = null, head = [];
    const flushTable = () => { if (table) out.push(`<div class="jr-table-wrap"><table class="jr-table">${table.join('')}</table></div>`); table = null; };
    const flushHead = () => { if (head.length) out.push(`<dl class="jr-mail-head">${head.join('')}</dl>`); head = []; };
    for (const line of lines) {
      const row = /^\|(!?)(\s.*)$/.exec(line);
      if (row) {
        flushHead();
        table = table || [];
        const tag = row[1] ? 'th' : 'td';
        table.push(`<tr>${splitTop(row[2], ' | ').map(c => `<${tag}>${inlineHtml(c.trim(), shown)}</${tag}>`).join('')}</tr>`);
        continue;
      }
      flushTable();
      if (line.startsWith('@')) {
        const [label, value] = splitTop(line.slice(1), '|');
        head.push(`<div><dt>${inlineHtml(label, shown)}</dt><dd>${inlineHtml(value || '', shown)}</dd></div>`);
        continue;
      }
      flushHead();
      if (line.startsWith('# ')) out.push(`<p class="jr-title">${inlineHtml(line.slice(2), shown)}</p>`);
      else if (line.startsWith('> ')) out.push(`<p class="jr-right">${inlineHtml(line.slice(2), shown)}</p>`);
      else if (line.trim()) out.push(`<p>${inlineHtml(line, shown)}</p>`);
    }
    flushTable();
    flushHead();
    return out.join('');
  }

  // How long a text is, as the JLPT counts it: every character but spaces
  // and the markup.
  const length = passage => plain(passage.text).replace(/^(\|!?|[#>@])\s?/gm, '').replace(/[\s|]/g, '').length;

  // The text's title for the instructions: its first heading (quotes in it
  // become 『』, as quotes within quotes), or the form.
  function titleOf(passage) {
    const h = passage.text.split('\n').find(l => l.startsWith('# '));
    return h ? h.slice(2).replace(/「/g, '『').replace(/」/g, '』') : FORMS[passage.form];
  }

  // The exam's instructions, worded as on each level's paper.
  function instructions(passage) {
    const { level, type } = passage;
    if (level === 'N5') {
      return type === 'info'
        ? `{下|した}の「${titleOf(passage)}」を {見|み}て、しつもんに こたえて ください。こたえは、1・2・3・4から いちばん いい ものを ひとつ えらんで ください。`
        : 'つぎの ぶんしょうを {読|よ}んで、しつもんに こたえて ください。こたえは、1・2・3・4から いちばん いい ものを ひとつ えらんで ください。';
    }
    if (level === 'N4') {
      return type === 'info'
        ? `{下|した}の「${titleOf(passage)}」を{見|み}て、{質問|しつもん}に{答|こた}えてください。{答|こた}えは、1・2・3・4から{最|もっと}もよいものを{一|ひと}つえらんでください。`
        : 'つぎの{文章|ぶんしょう}を{読|よ}んで、{質問|しつもん}に{答|こた}えてください。{答|こた}えは、1・2・3・4から{最|もっと}もよいものを{一|ひと}つえらんでください。';
    }
    return type === 'info'
      ? `{下|した}は「${titleOf(passage)}」である。これを{読|よ}んで、{質問|しつもん}に{答|こた}えなさい。{答|こた}えは、1・2・3・4から{最|もっと}もよいものを{一|ひと}つ{選|えら}びなさい。`
      : '{次|つぎ}の{文章|ぶんしょう}を{読|よ}んで、{質問|しつもん}に{答|こた}えなさい。{答|こた}えは、1・2・3・4から{最|もっと}もよいものを{一|ひと}つ{選|えら}びなさい。';
  }

  function shuffle(list, rand = Math.random) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  // An attempt at one text: each question's choices shuffled ([indexes into
  // choices]; 0 is the answer), nothing picked yet.
  const makeAttempt = (passage, rand = Math.random) =>
    passage.questions.map(q => ({ order: shuffle(q.choices.map((_, k) => k), rand), pick: null }));

  const score = attempt => attempt.filter(a => a.pick === 0).length;
  const finished = attempt => attempt.every(a => a.pick != null);
  // The questions answered so far, as 1-based numbers (for the highlights).
  const shownKeys = attempt => new Set(attempt.map((a, i) => (a.pick != null ? i + 1 : 0)).filter(Boolean));

  // Where "Next text" goes: the next text of the same level not yet done
  // perfectly (after this one, wrapping round), else simply the next one.
  function nextPassage(list, id, best = {}) {
    const same = list.filter(p => p.level === (list.find(x => x.id === id) || {}).level);
    const at = same.findIndex(p => p.id === id);
    const after = [...same.slice(at + 1), ...same.slice(0, at)];
    const perfect = p => best[p.id] && best[p.id].score === best[p.id].total;
    return after.find(p => !perfect(p)) || after[0] || null;
  }

  const api = { inlineHtml, plain, splitTop, textHtml, length, instructions, makeAttempt, score, finished, shownKeys, nextPassage, LEVELS, TYPES, FORMS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.JlptReading = api;
  if (typeof document === 'undefined') return;

  // ─── State ─────────────────────────────────────────────────────────────────

  function load(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  }

  const PASSAGES = global.JLPT_READING || [];
  const settings = Object.assign({ furigana: true, level: 'N5' }, load(SETTINGS_KEY, {}));
  if (!LEVELS.includes(settings.level)) settings.level = 'N5';
  const store = Object.assign({ best: {}, last: {} }, load(STORE_KEY, {}));
  const $ = id => document.getElementById(id);

  // current: { passage, attempt, saved }
  let current = null;

  function show(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === screen));
    window.scrollTo(0, 0);
  }

  function applySettings() {
    document.body.classList.toggle('jr-no-furigana', !settings.furigana);
    $('jr-opt-furigana').checked = settings.furigana;
    $('jr-opt-furigana-q').checked = settings.furigana;
  }

  // ─── Home ──────────────────────────────────────────────────────────────────

  function itemHtml(p) {
    const best = store.best[p.id];
    const state = !best ? '' : best.score === best.total ? ' sf-item-perfect' : ' sf-item-done';
    const n = p.questions.length;
    return `<button class="sf-item${state}" data-passage="${esc(p.id)}">
      <span class="sf-item-level">${esc(p.level)}</span>
      <span class="sf-item-body">
        <span class="sf-item-title"><span class="jr-form" lang="ja">${esc(FORMS[p.form])}</span> ${esc(p.title)}</span>
        <span class="sf-item-en">${n} question${n === 1 ? '' : 's'} · about ${Math.round(length(p) / 10) * 10} characters</span>
      </span>
      <span class="sf-item-score">${best ? `best <b>${best.score}/${best.total}</b>` : 'new'}</span>
    </button>`;
  }

  function renderHome() {
    applySettings();
    document.querySelectorAll('#jr-levels [data-level]').forEach(b => {
      const on = b.dataset.level === settings.level;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    for (const type of Object.keys(TYPES)) {
      const list = PASSAGES.filter(p => p.level === settings.level && p.type === type);
      $(`jr-list-${type}`).innerHTML = list.map(itemHtml).join('') || '<p class="tab-intro">None at this level yet.</p>';
    }
    const done = PASSAGES.filter(p => p.level === settings.level && store.best[p.id]).length;
    const all = PASSAGES.filter(p => p.level === settings.level).length;
    $('jr-level-progress').textContent = `${done} of ${all} ${settings.level} texts done`;
  }

  // ─── A text ────────────────────────────────────────────────────────────────

  function open(id) {
    const passage = PASSAGES.find(p => p.id === id);
    if (!passage) return;
    current = { passage, attempt: makeAttempt(passage), saved: false };
    if (settings.level !== passage.level) { settings.level = passage.level; save(SETTINGS_KEY, settings); }
    try { history.replaceState(null, '', `#${id}`); } catch { /* file:// or sandboxed */ }
    $('jr-title').innerHTML = `<span class="sf-item-level">${esc(passage.level)}</span> ${esc(passage.title)} <span lang="ja" class="vq-title-ja">${esc(TYPES[passage.type].ja)}</span>`;
    show('screen-jlpt-reading');
    render();
  }

  function questionHtml(passage, q, a, i) {
    const answered = a.pick != null;
    const choices = a.order.map((k, n) => {
      let cls = 'sf-choice vq-choice';
      if (answered && k === 0) cls += ' correct';
      else if (answered && k === a.pick) cls += ' wrong';
      return `<button class="${cls}" data-q="${i}" data-choice="${k}" ${answered ? 'disabled' : ''}>
        <span class="sf-choice-num" aria-hidden="true">${n + 1}</span>
        <span class="vq-choice-body">
          <span class="vq-choice-text" lang="ja">${inlineHtml(q.choices[k][0])}</span>
          ${answered ? `<span class="vq-choice-en">${esc(q.choices[k][1])}</span>` : ''}
        </span>
      </button>`;
    }).join('');
    const verdict = !answered ? ''
      : a.pick === 0 ? '<b class="sf-verdict-right">✓ Correct</b>'
        : `<b class="sf-verdict-wrong">✗ It’s ${a.order.indexOf(0) + 1}</b>`;
    const many = passage.questions.length > 1;
    return `<div class="sf-q jr-q${answered ? ` vq-q-answered${a.pick === 0 ? ' sf-q-right' : ' sf-q-wrong'}` : ''}" id="jr-q-${i}">
      <div class="sf-q-head"><span class="sf-q-num">${many ? `問${i + 1}` : '問'}</span>${verdict}</div>
      <p class="jr-question" lang="ja">${inlineHtml(q.q)}</p>
      ${answered ? `<p class="vq-translation">${esc(q.en)}</p>` : ''}
      <div class="sf-choices vq-choices vq-choices-long">${choices}</div>
      ${answered ? `<div class="particle-explanation sf-why jr-why"><p>${esc(q.why)}</p><p class="jr-why-hint">The highlighted part of the text is where the answer is.</p></div>` : ''}
    </div>`;
  }

  function wordsHtml(passage) {
    if (!passage.words || !passage.words.length) return '';
    return `<div class="jr-words"><div class="vq-missed-title">Words in this text</div>
      <ul class="vq-words">${passage.words.map(([w, r, m]) =>
        `<li><span class="vq-word-text"><span lang="ja">${esc(plain(w))}</span>${r ? ` <span class="vq-words-kana" lang="ja">${esc(r)}</span>` : ''} — ${esc(m)}</span></li>`).join('')}</ul></div>`;
  }

  function render() {
    const { passage, attempt } = current;
    const done = finished(attempt);
    const shown = shownKeys(attempt);
    $('jr-instructions').innerHTML = inlineHtml(instructions(passage));
    $('jr-paper').className = `jr-paper jr-form-${passage.form}${passage.level === 'N5' ? ' jr-spaced' : ''}`;
    $('jr-paper').innerHTML = textHtml(passage, shown);
    $('jr-questions').innerHTML = passage.questions.map((q, i) => questionHtml(passage, q, attempt[i], i)).join('');
    $('jr-after').classList.toggle('hidden', !done);
    if (!done) return;
    const s = score(attempt);
    const n = attempt.length;
    $('jr-score').textContent = `${s} / ${n}`;
    $('jr-score-msg').innerHTML = s === n ? (n === 1 ? 'Right. 🎉' : `All ${n} right. 🎉`) : `<b class="sf-verdict-wrong">${n - s} wrong</b> — read the highlighted part again.`;
    $('jr-translation').innerHTML = passage.en.split('\n').map(l => `<p>${esc(l)}</p>`).join('');
    $('jr-words').innerHTML = wordsHtml(passage);
    const next = nextPassage(PASSAGES, passage.id, store.best);
    $('btn-jr-next').classList.toggle('hidden', !next);
  }

  function pick(i, k) {
    const a = current && current.attempt[i];
    if (!a || a.pick != null) return;
    a.pick = k;
    if (finished(current.attempt) && !current.saved) saveScore();
    render();
    const el = finished(current.attempt) ? $('jr-after') : $(`jr-q-${i}`);
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    if (finished(current.attempt)) $('btn-jr-next').focus({ preventScroll: true });
  }

  function saveScore() {
    const s = score(current.attempt);
    const total = current.attempt.length;
    const id = current.passage.id;
    const prev = store.best[id];
    if (!prev || s > prev.score) store.best[id] = { score: s, total };
    store.last[id] = { score: s, total };
    current.saved = true;
    save(STORE_KEY, store);
  }

  function goHome() {
    current = null;
    try { history.replaceState(null, '', location.pathname + location.search); } catch { /* ignore */ }
    renderHome();
    show('screen-chapters');
  }

  function goNext() {
    const next = current && nextPassage(PASSAGES, current.passage.id, store.best);
    if (next) open(next.id);
  }

  // ─── Events ────────────────────────────────────────────────────────────────

  for (const id of ['jr-opt-furigana', 'jr-opt-furigana-q']) {
    $(id).addEventListener('change', e => { settings.furigana = e.target.checked; save(SETTINGS_KEY, settings); applySettings(); });
  }
  $('jr-levels').addEventListener('click', e => {
    const b = e.target.closest('[data-level]');
    if (!b) return;
    settings.level = b.dataset.level;
    save(SETTINGS_KEY, settings);
    renderHome();
  });
  for (const type of Object.keys(TYPES)) {
    $(`jr-list-${type}`).addEventListener('click', e => {
      const b = e.target.closest('[data-passage]');
      if (b) open(b.dataset.passage);
    });
  }
  $('jr-questions').addEventListener('click', e => {
    const b = e.target.closest('[data-choice]');
    if (b && !b.disabled) pick(Number(b.dataset.q), Number(b.dataset.choice));
  });
  $('btn-jr-next').addEventListener('click', goNext);
  $('btn-jr-retry').addEventListener('click', () => open(current.passage.id));
  $('btn-jr-home').addEventListener('click', goHome);
  $('jr-quit').addEventListener('click', goHome);
  $('btn-jr-reset').addEventListener('click', () => {
    if (!confirm('Reset your JLPT Reading scores?')) return;
    store.best = {};
    store.last = {};
    save(STORE_KEY, store);
    renderHome();
  });
  document.addEventListener('keydown', e => {
    if (!current || !$('screen-jlpt-reading').classList.contains('active')) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'f' || e.key === 'F') {
      settings.furigana = !settings.furigana;
      save(SETTINGS_KEY, settings);
      applySettings();
      return;
    }
    // 1–4 answer the first question not yet answered.
    const i = current.attempt.findIndex(a => a.pick == null);
    if (i >= 0 && /^[1-4]$/.test(e.key)) {
      e.preventDefault();
      pick(i, current.attempt[i].order[Number(e.key) - 1]);
    } else if (i < 0 && (e.key === ' ' || e.key === 'Enter') && !e.repeat && (e.target === $('btn-jr-next') || !e.target.closest('button, a'))) {
      e.preventDefault();
      goNext();
    }
  });

  renderHome();
  // jlpt-reading.html#<id> opens that text, on load or when the hash changes.
  const openFromHash = () => {
    const hash = decodeURIComponent(location.hash.slice(1));
    if (PASSAGES.some(p => p.id === hash) && (!current || current.passage.id !== hash)) open(hash);
  };
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
})(typeof window !== 'undefined' ? window : globalThis);
