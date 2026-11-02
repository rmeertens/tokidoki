// JLPT Questions (vocab-questions.html): vocabulary questions in the style
// of the JLPT, four choices each, ten at a time.
//
//   Fill in the blank (文脈規定) — which word goes in the （　）? The
//     sentences are Tokidoki's own example sentences, with wrong choices of
//     the same kind and level (vocab-fill-data.js, built and hand-checked
//     by scripts/build_vocab_fill.mjs).
//   Similar meaning (言い換え類義) — which sentence means about the same as
//     the underlined part? (similar-meaning-data.js)
//
// The same questions are on the printable sheets (vocab-sheets/). The pure
// parts (markup, rounds, scoring) are exported for test_vocab_questions.js.
(function (global) {
  'use strict';

  const STORE_KEY = 'tokidoki_vocab_questions';
  const SETTINGS_KEY = 'tokidoki_vocab_questions_settings';
  const ROUND = 10;
  const LEVELS = ['N5', 'N4', 'N3'];

  // ─── Markup ────────────────────────────────────────────────────────────────

  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // "{駅|えき}で" → <ruby>駅<rt>えき</rt></ruby>で
  const rubyHtml = markup => String(markup).split(/(\{[^|}]+\|[^}]+\})/).map(part => {
    const m = /^\{([^|}]+)\|([^}]+)\}$/.exec(part);
    return m ? `<ruby>${esc(m[1])}<rt>${esc(m[2])}</rt></ruby>` : esc(part);
  }).join('');

  // "a _b_ c": the part between underscores underlined.
  const underlinedHtml = markup => String(markup).split('_')
    .map((part, i) => (i % 2 ? `<span class="vq-target">${rubyHtml(part)}</span>` : rubyHtml(part))).join('');

  const plain = markup => String(markup).replace(/\{([^|}]+)\|[^}]+\}/g, '$1').replace(/_/g, '');

  function shuffle(list, rand = Math.random) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  // Every set: { id, kind, level, questions }, each question as
  // { kind, html (the question), choices: [html…] (answer first), why }.
  function sets(fill, similar) {
    const out = [];
    for (const level of LEVELS) {
      out.push({ id: `fill-${level}`, kind: 'fill', level, questions: ((fill || {})[level] || []).map(q => ({
        kind: 'fill',
        b: q.b, a: q.a, en: q.en,
        choices: q.c.map(c => c[0]),
        words: q.c,
      })) });
    }
    for (const level of LEVELS) {
      out.push({ id: `similar-${level}`, kind: 'similar', level, questions: ((similar || {})[level] || []).map(q => ({
        kind: 'similar',
        q: q.q, en: q.en, note: q.note,
        choices: [q.ok, ...q.wrong],
      })) });
    }
    return out;
  }

  // A round: up to ten questions of the set, the ones missed last time
  // first, each with its choices shuffled ([indexes into choices]; 0 is
  // the answer).
  function makeRound(set, missed = [], rand = Math.random) {
    const n = set.questions.length;
    const again = missed.filter(i => i >= 0 && i < n);
    const rest = shuffle([...Array(n).keys()].filter(i => !again.includes(i)), rand);
    const picked = [...again, ...rest].slice(0, Math.min(ROUND, n));
    return shuffle(picked, rand).map(i => ({ i, order: shuffle([0, 1, 2, 3], rand), pick: null }));
  }

  const score = round => round.filter(q => q.pick === 0).length;

  const api = { rubyHtml, underlinedHtml, plain, sets, makeRound, score, ROUND };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.VocabQuestions = api;
  if (typeof document === 'undefined') return;

  // ─── State ─────────────────────────────────────────────────────────────────

  function load(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  }

  const SETS = sets(global.VOCAB_FILL, global.SIMILAR_MEANING);
  const settings = Object.assign({ furigana: true }, load(SETTINGS_KEY, {}));
  const store = Object.assign({ best: {}, last: {}, missed: [] }, load(STORE_KEY, {}));
  // missed: "<set id>:<question index>" — asked first next time.
  const $ = id => document.getElementById(id);

  // attempt: { set, round, at }
  let attempt = null;

  function show(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === screen));
    window.scrollTo(0, 0);
  }

  // ─── Home ──────────────────────────────────────────────────────────────────

  const KIND = {
    fill: { title: 'Fill in the blank', ja: '文脈規定', about: 'Which word goes in the （　）?' },
    similar: { title: 'Similar meaning', ja: '言い換え類義', about: 'Which sentence means about the same as the underlined part?' },
  };

  function setHtml(set) {
    const best = store.best[set.id];
    const state = !best ? '' : best.score === best.total ? ' sf-item-perfect' : ' sf-item-done';
    return `<button class="sf-item${state}" data-set="${esc(set.id)}">
      <span class="sf-item-level">${esc(set.level)}</span>
      <span class="sf-item-body">
        <span class="sf-item-title">${esc(KIND[set.kind].title)} · ${esc(set.level)}</span>
        <span class="sf-item-en">${set.questions.length} questions · ${Math.min(ROUND, set.questions.length)} at a time</span>
      </span>
      <span class="sf-item-score">${best ? `best <b>${best.score}/${best.total}</b>` : 'new'}</span>
    </button>`;
  }

  function renderHome() {
    $('vq-opt-furigana').checked = settings.furigana;
    applySettings();
    for (const kind of Object.keys(KIND)) {
      $(`vq-list-${kind}`).innerHTML = SETS.filter(s => s.kind === kind && s.questions.length).map(setHtml).join('');
    }
  }

  function applySettings() {
    document.body.classList.toggle('vq-no-furigana', !settings.furigana);
  }

  function start(id) {
    const set = SETS.find(s => s.id === id);
    if (!set) return;
    const missed = store.missed.filter(m => m.startsWith(id + ':')).map(m => Number(m.slice(id.length + 1)));
    attempt = { set, round: makeRound(set, missed), at: 0 };
    $('vq-title').innerHTML = `<span class="sf-item-level">${esc(set.level)}</span> ${esc(KIND[set.kind].title)} <span lang="ja" class="vq-title-ja">${esc(KIND[set.kind].ja)}</span>`;
    show('screen-vocab-questions');
    render();
  }

  // ─── A question ────────────────────────────────────────────────────────────

  const current = () => attempt.round[attempt.at];
  const questionOf = q => attempt.set.questions[q.i];

  function questionHtml(question, q) {
    if (question.kind === 'similar') return underlinedHtml(question.q);
    const done = q.pick != null;
    const filled = done
      ? `<span class="vq-blank vq-blank-filled ${q.pick === 0 ? 'vq-right' : 'vq-wrong'}">${rubyHtml(question.choices[0])}</span>`
      : '<span class="vq-blank">　　　</span>';
    return `${rubyHtml(question.b)}（${filled}）${rubyHtml(question.a)}`;
  }

  const shortMeaning = m => String(m).split(/;\s*/)[0];

  function whyHtml(question) {
    if (question.kind === 'similar') {
      return `<p>${esc(question.note)}</p><p class="vq-en">${esc(question.en)}</p>`;
    }
    return `<p class="vq-en">${esc(question.en)}</p>
      <ul class="vq-words">${question.words.map((w, k) => `<li${k === 0 ? ' class="vq-words-answer"' : ''}><span lang="ja">${esc(w[1])}</span> <span class="vq-words-kana" lang="ja">${esc(w[2])}</span> — ${esc(shortMeaning(w[3]))}</li>`).join('')}</ul>`;
  }

  function render() {
    const { round, at, set } = attempt;
    const over = at >= round.length;
    const done = round.filter(q => q.pick != null).length;
    $('vq-bar-fill').style.width = `${(100 * done) / round.length}%`;
    $('vq-progress-text').textContent = `${done} / ${round.length}`;
    $('vq-question').classList.toggle('hidden', over);
    $('vq-result').classList.toggle('hidden', !over);
    $('vq-actions').classList.toggle('hidden', !over);
    if (over) {
      const s = score(round);
      $('vq-score').textContent = `${s} / ${round.length}`;
      $('vq-score-msg').textContent = s === round.length ? 'Perfect! 🎉'
        : s >= round.length / 2 ? 'Good work — the ones you missed come back first next time.'
          : 'The ones you missed come back first next time — try again.';
      $('btn-vq-again').focus({ preventScroll: true });
      return;
    }
    const q = current();
    const question = questionOf(q);
    const answered = q.pick != null;
    const choices = q.order.map((k, n) => {
      let cls = 'sf-choice vq-choice';
      if (answered && k === 0) cls += ' correct';
      else if (answered && k === q.pick) cls += ' wrong';
      return `<button class="${cls}" data-choice="${k}" ${answered ? 'disabled' : ''}>
        <span class="sf-choice-num" aria-hidden="true">${n + 1}</span>
        <span class="vq-choice-text" lang="ja">${rubyHtml(question.choices[k])}</span>
      </button>`;
    }).join('');
    const verdict = !answered ? `<span>${esc(KIND[set.kind].about)}</span>`
      : q.pick === 0 ? '<b class="sf-verdict-right">✓ Correct</b>'
        : `<b class="sf-verdict-wrong">✗ It’s ${q.order.indexOf(0) + 1}: <span lang="ja">${esc(plain(question.choices[0]))}</span></b>`;
    const last = at === round.length - 1;
    $('vq-question').innerHTML = `<div class="sf-q vq-q${answered ? (q.pick === 0 ? ' sf-q-right' : ' sf-q-wrong') : ''}">
      <div class="sf-q-head"><span class="sf-q-num">${at + 1}</span>${verdict}</div>
      <div class="vq-sentence" lang="ja">${questionHtml(question, q)}</div>
      <div class="sf-choices vq-choices${set.kind === 'similar' ? ' vq-choices-long' : ''}">${choices}</div>
      ${answered ? `<div class="particle-explanation sf-why vq-why">${whyHtml(question)}</div>
      <div class="bs-next-area"><button id="btn-vq-next" class="btn-primary">${last ? 'See your score' : 'Next question →'}</button></div>` : ''}
    </div>`;
  }

  function pick(k) {
    const q = current();
    if (!q || q.pick != null) return;
    q.pick = k;
    const key = `${attempt.set.id}:${q.i}`;
    store.missed = store.missed.filter(m => m !== key);
    if (k !== 0) store.missed.push(key);
    if (attempt.round.every(x => x.pick != null)) {
      const s = score(attempt.round);
      const id = attempt.set.id;
      const total = attempt.round.length;
      const prev = store.best[id];
      if (!prev || s > prev.score) store.best[id] = { score: s, total };
      store.last[id] = { score: s, total };
    }
    save(STORE_KEY, store);
    render();
    const next = $('btn-vq-next');
    if (next) next.focus({ preventScroll: true });
  }

  function next() {
    if (!attempt || current().pick == null) return;
    attempt.at++;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goHome() {
    attempt = null;
    renderHome();
    show('screen-chapters');
  }

  // ─── Events ────────────────────────────────────────────────────────────────

  $('vq-opt-furigana').addEventListener('change', e => { settings.furigana = e.target.checked; save(SETTINGS_KEY, settings); applySettings(); });
  for (const kind of Object.keys(KIND)) {
    $(`vq-list-${kind}`).addEventListener('click', e => {
      const b = e.target.closest('[data-set]');
      if (b) start(b.dataset.set);
    });
  }
  $('vq-question').addEventListener('click', e => {
    const b = e.target.closest('[data-choice]');
    if (b && !b.disabled) { pick(Number(b.dataset.choice)); return; }
    if (e.target.closest('#btn-vq-next')) next();
  });
  document.addEventListener('keydown', e => {
    if (!attempt || !$('screen-vocab-questions').classList.contains('active')) return;
    if (e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (attempt.at >= attempt.round.length) return;
    const q = current();
    if (q.pick == null && /^[1-4]$/.test(e.key)) {
      e.preventDefault();
      pick(q.order[Number(e.key) - 1]);
    } else if (q.pick != null && e.key === 'Enter' && e.target.id !== 'btn-vq-next') {
      e.preventDefault();
      next();
    }
  });
  $('btn-vq-again').addEventListener('click', () => start(attempt.set.id));
  $('btn-vq-home').addEventListener('click', goHome);
  $('vq-quit').addEventListener('click', goHome);
  $('btn-vq-reset').addEventListener('click', () => {
    if (!confirm('Reset your scores?')) return;
    store.best = {};
    store.last = {};
    store.missed = [];
    save(STORE_KEY, store);
    renderHome();
  });

  renderHome();
})(typeof window !== 'undefined' ? window : globalThis);
