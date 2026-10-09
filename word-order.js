// 文の組み立て — JLPT-style word order practice (word-order.html). A sentence
// has four pieces cut out of it; tap them into the blanks in the right order.
// As on the test, one blank carries a ★, and in "★ only" mode you answer the
// way the real exam asks: pick just the piece that belongs in the ★ slot.
//
// The questions live in word-order-data.js. The pure parts (markup, grading,
// shuffling, the queue) are exported for test_word_order.js.
(function (global) {
  'use strict';

  const KANJI = '㐀-䶿一-鿿々〆ヶ';
  const RUBY_RE = new RegExp('([' + KANJI + ']+)\\[([^\\]]+)\\]', 'g');
  const STORE_KEY = 'tokidoki_word_order';
  const SETTINGS_KEY = 'tokidoki_word_order_settings';
  const SESSION_SIZE = 10;
  const SET_SIZE = 5;
  const LEVELS = ['N5', 'N4', 'N3'];

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

  // Spaces in the markup only separate words for readability.
  const plain = markup => pieces(markup).map(p => p.t).join('').replace(/ /g, '');

  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function rubyHtml(markup) {
    return pieces(markup).map(p => p.r
      ? `<ruby>${esc(p.t)}<rt>${esc(p.r)}</rt></ruby>`
      : esc(p.t.replace(/ /g, ''))).join('');
  }

  // ─── Grading ───────────────────────────────────────────────────────────────

  // `order` lists piece indices slot by slot. Pieces are compared by their
  // text, so two identical pieces can stand in for each other.
  function isCorrect(item, order) {
    return order.length === item.pieces.length
      && order.every((p, slot) => fits(item, slot, p));
  }

  // Whether `piece` (an index into item.pieces) belongs in `slot`.
  const fits = (item, slot, piece) => piece != null && plain(item.pieces[piece]) === plain(item.pieces[slot]);
  const isStarCorrect = (item, piece) => fits(item, item.star, piece);

  // The order the pieces are shown in — never the answer itself.
  function shuffleOrder(n, rand = Math.random) {
    const idx = Array.from({ length: n }, (_, i) => i);
    if (n < 2) return idx;
    do {
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [idx[i], idx[j]] = [idx[j], idx[i]];
      }
    } while (idx.every((p, i) => p === i));
    return idx;
  }

  // A session: mistakes first, then questions not yet tried, then the rest.
  function buildQueue(items, store, level, size = SESSION_SIZE, rand = Math.random) {
    const missed = new Set(store.missed || []);
    const last = store.last || {};
    const rank = it => (missed.has(it.id) ? 0 : !(it.id in last) ? 1 : 2);
    return items
      .filter(it => level === 'all' || it.level === level)
      .map(it => ({ it, r: rand() }))
      .sort((a, b) => rank(a.it) - rank(b.it) || a.r - b.r)
      .slice(0, size)
      .map(e => e.it);
  }

  // A level's questions in fixed sets of five, in data order — a set is
  // always the same five sentences, so its best score means something.
  function setsOf(items, level, size = SET_SIZE) {
    const all = items.filter(it => it.level === level);
    const sets = [];
    for (let i = 0; i < all.length; i += size) sets.push(all.slice(i, i + size));
    return sets;
  }

  const api = { pieces, plain, rubyHtml, isCorrect, isStarCorrect, shuffleOrder, buildQueue, setsOf, LEVELS, SESSION_SIZE, SET_SIZE };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.WordOrder = api;
  if (typeof document === 'undefined') return;

  // ─── State ─────────────────────────────────────────────────────────────────

  function load(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  }

  const ITEMS = global.WORD_ORDER_ITEMS || [];
  const settings = Object.assign({ level: 'all', starOnly: false, furigana: true, english: false }, load(SETTINGS_KEY, {}));
  const store = Object.assign({ missed: [], last: {}, best: {} }, load(STORE_KEY, {}));
  if (!Array.isArray(store.missed)) store.missed = [];
  if (!store.last || typeof store.last !== 'object') store.last = {};

  const $ = id => document.getElementById(id);
  // session: { queue: [{ item, deck, placed, answered, correct, picked }], pos, starOnly }
  let session = null;

  const current = () => (session ? session.queue[session.pos] : null);
  const levelOk = it => settings.level === 'all' || it.level === settings.level;

  function show(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === screen));
    window.scrollTo(0, 0);
  }

  function applyDisplaySettings() {
    document.body.classList.toggle('wo-no-furigana', !settings.furigana);
  }

  // ─── Home ──────────────────────────────────────────────────────────────────

  const LEVEL_DESC = {
    N5: 'Basic particles, この/その, 〜てから, 〜たい, 〜ことがある',
    N4: '〜ながら, 〜ように, 〜てもらう, 〜そう, 〜ことにする',
    N3: '〜によると, 〜ために, 〜にとって, 〜わりに, 〜かどうか',
  };
  const setId = (level, k) => level + ':' + k;
  const parseSet = id => { const m = /^(N\d):(\d+)$/.exec(id || ''); return m ? { level: m[1], k: Number(m[2]) } : null; };
  const shownLevels = () => LEVELS.filter(l => settings.level === 'all' || settings.level === l);
  const bestOf = id => (store.best || {})[id];

  function renderHome() {
    document.querySelectorAll('[data-level]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.level === settings.level)));
    const pool = ITEMS.filter(levelOk);
    const missed = pool.filter(it => store.missed.includes(it.id)).length;
    $('wo-total').textContent = pool.length;
    $('wo-sections').innerHTML = shownLevels().map(level => {
      const sets = setsOf(ITEMS, level);
      const bests = sets.map((_, k) => bestOf(setId(level, k)));
      const done = bests.filter(Boolean).length;
      const next = bests.findIndex(b => !b);
      const chips = sets.map((set, k) => {
        const b = bests[k];
        const from = k * SET_SIZE + 1, to = k * SET_SIZE + set.length;
        const state = !b ? (k === next ? ' lis-set-next' : '') : b.score === b.total ? ' lis-set-perfect' : ' lis-set-done';
        return `<button class="lis-set${state}" data-set="${setId(level, k)}" aria-label="${level} set ${k + 1}: questions ${from} to ${to}${b ? `, best ${b.score} of ${b.total}` : ''}">
          <span class="lis-set-name">Set ${k + 1}</span>
          <span class="lis-set-range" lang="ja">${from}–${to}番</span>
          <span class="lis-set-score">${b ? `${b.score}/${b.total}` : k === next ? 'next' : '—'}</span>
        </button>`;
      }).join('');
      const n = sets.reduce((k, set) => k + set.length, 0);
      return `<div class="lis-part-row">
        <div class="lis-part-head">
          <span class="lis-part-badge">${level}</span>
          <span class="lis-part-body">
            <span class="lis-part-title">${level} word order</span>
            <span class="lis-part-desc" lang="ja">${esc(LEVEL_DESC[level])}</span>
          </span>
          <span class="lis-part-meta">${n} Qs<br>${done}/${sets.length} sets</span>
        </div>
        <div class="lis-sets">${chips}</div>
      </div>`;
    }).join('');
    $('wo-quick-meta').textContent = `${SESSION_SIZE} random questions${settings.level === 'all' ? '' : ' · ' + settings.level}, mistakes first`;
    $('wo-review').classList.toggle('hidden', !missed);
    $('wo-review-count').textContent = missed;
    $('wo-opt-star').checked = settings.starOnly;
    $('wo-opt-furigana').checked = settings.furigana;
    $('wo-opt-english').checked = settings.english;
    applyDisplaySettings();
  }

  // id: 'quick', 'missed', or a set like 'N4:2'.
  function start(id) {
    let items;
    const set = parseSet(id);
    if (set) items = setsOf(ITEMS, set.level)[set.k] || [];
    else if (id === 'missed') items = buildQueue(ITEMS.filter(it => levelOk(it) && store.missed.includes(it.id)), store, 'all');
    else items = buildQueue(ITEMS, store, settings.level);
    if (!items.length) return;
    session = {
      id,
      title: set ? `${set.level} · Set ${set.k + 1}` : id === 'missed' ? 'Review mistakes' : 'Quick practice',
      starOnly: settings.starOnly,
      pos: 0,
      queue: items.map(item => ({
        item, deck: shuffleOrder(item.pieces.length), placed: item.pieces.map(() => null),
        answered: false, correct: false, picked: null,
      })),
    };
    show('screen-word-order');
    renderQuestion();
  }

  // The set after this one, moving on to the next level after the last set.
  function nextSetId(id) {
    const set = parseSet(id);
    if (!set) return null;
    if (setsOf(ITEMS, set.level)[set.k + 1]) return setId(set.level, set.k + 1);
    const nextLevel = LEVELS[LEVELS.indexOf(set.level) + 1];
    return nextLevel && settings.level === 'all' ? setId(nextLevel, 0) : null;
  }

  // ─── Question ──────────────────────────────────────────────────────────────

  const BLANK = '<span class="wo-blank-line" aria-hidden="true"></span>';

  function slotHtml(q, slot) {
    const { item } = q;
    const star = slot === item.star ? '<span class="wo-star" aria-hidden="true">★</span>' : '';
    let cls = 'wo-slot';
    let body = BLANK;
    let label = `Blank ${slot + 1}${slot === item.star ? ' (★)' : ''}`;
    if (q.answered) {
      // Afterwards every slot shows the right piece; in arrange mode the
      // colour says whether you had it there.
      body = rubyHtml(item.pieces[slot]);
      if (session.starOnly) cls += slot === item.star ? (q.correct ? ' wo-right' : ' wo-wrong') : ' wo-filled';
      else cls += fits(item, slot, q.placed[slot]) ? ' wo-right' : ' wo-wrong';
      label += `: ${plain(item.pieces[slot])}`;
    } else if (q.placed[slot] != null) {
      cls += ' wo-filled';
      body = rubyHtml(item.pieces[q.placed[slot]]);
      label += `: ${plain(item.pieces[q.placed[slot]])} — tap to take it back`;
    }
    if (slot === item.star) cls += ' wo-slot-star';
    if (!q.answered && (session.starOnly ? slot === item.star : slot === q.placed.indexOf(null))) cls += ' wo-next';
    const disabled = q.answered || session.starOnly || q.placed[slot] == null ? ' disabled' : '';
    return `<button class="${cls}" data-slot="${slot}" aria-label="${esc(label)}"${disabled}>${star}<span class="wo-slot-body">${body}</span></button>`;
  }

  function renderQuestion() {
    const q = current();
    const { item } = q;
    $('wo-progress-text').textContent = `${session.pos + 1} / ${session.queue.length}`;
    $('wo-bar-fill').style.width = `${(session.pos / session.queue.length) * 100}%`;
    $('wo-level').textContent = session.title;
    $('wo-prompt').textContent = session.starOnly
      ? 'Which piece goes in the ★ blank?'
      : 'Put the pieces in the right order.';
    $('wo-hint').textContent = q.answered ? '' : session.starOnly
      ? 'Tap the piece that belongs in the ★ blank.'
      : 'Tap a piece to put it in the highlighted blank · tap a filled blank to take it back.';

    $('wo-sentence').innerHTML = `<span class="wo-text">${rubyHtml(item.pre)}</span>`
      + item.pieces.map((_, slot) => slotHtml(q, slot)).join('')
      + `<span class="wo-text">${rubyHtml(item.post)}</span>`;

    $('wo-en').textContent = item.en;
    $('wo-en').classList.toggle('hidden', !(q.answered || settings.english));
    $('wo-en-btn').classList.toggle('hidden', q.answered || settings.english);

    $('wo-bank').innerHTML = q.deck.map((p, k) => {
      const used = !session.starOnly && q.placed.includes(p);
      let cls = 'wo-piece';
      if (q.answered && session.starOnly) {
        if (isStarCorrect(item, p)) cls += ' correct';
        else if (p === q.picked) cls += ' wrong';
      }
      return `<button class="${cls}${used ? ' wo-used' : ''}" data-piece="${p}" ${q.answered || used ? 'disabled' : ''}>
        <span class="wo-piece-num" aria-hidden="true">${k + 1}</span><span class="wo-piece-text">${rubyHtml(item.pieces[p])}</span>
      </button>`;
    }).join('');

    // In arrange mode every piece is in the sentence by now; the empty tray would only be noise.
    $('wo-bank').classList.toggle('hidden', q.answered && !session.starOnly);
    const full = q.placed.every(p => p != null);
    $('wo-check-area').classList.toggle('hidden', q.answered || session.starOnly);
    $('btn-wo-check').disabled = !full;
    $('btn-wo-clear').disabled = q.placed.every(p => p == null);

    const feedback = $('wo-feedback');
    if (q.answered) {
      const verdict = q.correct ? '<b class="wo-verdict-right">✓ Correct!</b>' : '<b class="wo-verdict-wrong">✗ Not quite.</b>';
      const starNote = !session.starOnly && !q.correct && isStarCorrect(item, q.placed[item.star])
        ? ' <span class="wo-dim">You did have the ★ piece right.</span>' : '';
      feedback.innerHTML = `<div>${verdict}${starNote}</div>
        <div>★ answer: <span class="wo-answer" lang="ja">${rubyHtml(item.pieces[item.star])}</span></div>
        ${!session.starOnly && !q.correct ? `<div class="wo-dim">Your order: <span lang="ja">${q.placed.map(p => esc(plain(item.pieces[p]))).join(' / ')}</span></div>` : ''}
        <div class="wo-full" lang="ja">${rubyHtml(item.pre + item.pieces.join('') + item.post)}</div>
        ${item.note ? `<div class="wo-note">${esc(item.note)}</div>` : ''}`;
      feedback.classList.remove('hidden');
    } else {
      feedback.classList.add('hidden');
    }
    $('wo-next-area').classList.toggle('hidden', !q.answered);
    $('btn-wo-next').textContent = session.pos + 1 < session.queue.length ? 'Next' : 'Finish';
  }

  function place(p) {
    const q = current();
    if (!q || q.answered) return;
    if (session.starOnly) { answer(p); return; }
    if (q.placed.includes(p)) return;
    const slot = q.placed.indexOf(null);
    if (slot < 0) return;
    q.placed[slot] = p;
    renderQuestion();
  }

  function unplace(slot) {
    const q = current();
    if (!q || q.answered || q.placed[slot] == null) return;
    q.placed[slot] = null;
    renderQuestion();
  }

  function undoLast() {
    const q = current();
    if (!q || q.answered || session.starOnly) return;
    for (let s = q.placed.length - 1; s >= 0; s--) {
      if (q.placed[s] != null) { unplace(s); return; }
    }
  }

  function answer(picked) {
    const q = current();
    if (!q || q.answered) return;
    if (session.starOnly) {
      q.picked = picked;
      q.correct = isStarCorrect(q.item, picked);
    } else {
      if (q.placed.some(p => p == null)) return;
      q.correct = isCorrect(q.item, q.placed);
    }
    q.answered = true;
    record(q.item.id, q.correct);
    renderQuestion();
    $('btn-wo-next').focus({ preventScroll: true });
  }

  function record(id, correct) {
    store.last[id] = correct;
    store.missed = store.missed.filter(m => m !== id);
    if (!correct) store.missed.push(id);
    save(STORE_KEY, store);
  }

  function next() {
    if (!session) return;
    if (session.pos + 1 < session.queue.length) {
      session.pos++;
      renderQuestion();
      window.scrollTo(0, 0);
    } else {
      finish();
    }
  }

  function finish() {
    const total = session.queue.length;
    const right = session.queue.filter(q => q.correct).length;
    if (parseSet(session.id)) {
      const prev = store.best[session.id];
      if (!prev || right > prev.score) store.best[session.id] = { score: right, total };
      save(STORE_KEY, store);
    }
    $('wo-done-title').textContent = `${session.title} complete!`;
    $('wo-done-total').textContent = total;
    $('wo-done-correct').textContent = right;
    $('wo-done-accuracy').textContent = `${Math.round((right / total) * 100)}%`;
    $('wo-done-icon').textContent = right === total ? '🎉' : right >= total / 2 ? '👍' : '📚';
    const next = nextSetId(session.id);
    $('btn-wo-next-set').classList.toggle('hidden', !next);
    $('btn-wo-next-set').dataset.next = next || '';
    if (next) { const n = parseSet(next); $('btn-wo-next-set').textContent = `Next: ${n.level} Set ${n.k + 1} →`; }
    const missed = ITEMS.filter(it => levelOk(it) && store.missed.includes(it.id)).length;
    $('btn-wo-review-missed').classList.toggle('hidden', !missed);
    $('btn-wo-review-missed').textContent = `Review mistakes (${missed})`;
    $('wo-bar-fill').style.width = '100%';
    show('screen-word-order-done');
  }

  function goHome() {
    session = null;
    renderHome();
    show('screen-chapters');
  }

  // ─── Events ────────────────────────────────────────────────────────────────

  document.querySelectorAll('[data-level]').forEach(b => b.addEventListener('click', () => {
    settings.level = b.dataset.level;
    save(SETTINGS_KEY, settings);
    renderHome();
  }));
  [['star', 'starOnly'], ['furigana', 'furigana'], ['english', 'english']].forEach(([id, key]) =>
    $('wo-opt-' + id).addEventListener('change', e => {
      settings[key] = e.target.checked;
      save(SETTINGS_KEY, settings);
      applyDisplaySettings();
    }));
  $('wo-sections').addEventListener('click', e => {
    const chip = e.target.closest('[data-set]');
    if (chip) start(chip.dataset.set);
  });
  $('wo-quick').addEventListener('click', () => start('quick'));
  $('wo-review').addEventListener('click', () => start('missed'));
  $('wo-bank').addEventListener('click', e => {
    const b = e.target.closest('[data-piece]');
    if (b && !b.disabled) place(Number(b.dataset.piece));
  });
  $('wo-sentence').addEventListener('click', e => {
    const b = e.target.closest('[data-slot]');
    if (b && !b.disabled) unplace(Number(b.dataset.slot));
  });
  $('wo-en-btn').addEventListener('click', () => {
    $('wo-en').classList.remove('hidden');
    $('wo-en-btn').classList.add('hidden');
  });
  $('btn-wo-check').addEventListener('click', () => answer());
  $('btn-wo-clear').addEventListener('click', () => {
    const q = current();
    if (!q || q.answered) return;
    q.placed = q.placed.map(() => null);
    renderQuestion();
  });
  $('btn-wo-next').addEventListener('click', next);
  $('wo-quit').addEventListener('click', goHome);
  $('btn-wo-next-set').addEventListener('click', e => start(e.currentTarget.dataset.next));
  $('btn-wo-again').addEventListener('click', () => start(session.id));
  $('btn-wo-review-missed').addEventListener('click', () => start('missed'));
  $('btn-wo-home').addEventListener('click', goHome);
  $('btn-wo-reset').addEventListener('click', () => {
    if (!confirm('Reset your word order progress?')) return;
    store.missed = [];
    store.last = {};
    store.best = {};
    save(STORE_KEY, store);
    renderHome();
  });

  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.closest && e.target.closest('input, textarea, select')) return;
    if ($('screen-word-order-done').classList.contains('active') && e.key === ' '
        && !(e.target.closest && e.target.closest('button'))) {
      e.preventDefault();
      const next = nextSetId(session.id);
      start(next || session.id);
      return;
    }
    if (!session || !$('screen-word-order').classList.contains('active')) return;
    const q = current();
    const n = Number(e.key);
    if (n >= 1 && n <= q.deck.length && !q.answered) { e.preventDefault(); place(q.deck[n - 1]); }
    else if (e.key === 'Backspace' && !q.answered) { e.preventDefault(); undoLast(); }
    else if ((e.key === 'Enter' || e.key === ' ') && q.answered) { e.preventDefault(); next(); }
    else if (e.key === 'Enter' && !session.starOnly && q.placed.every(p => p != null)) { e.preventDefault(); answer(); }
  });

  renderHome();
})(typeof window !== 'undefined' ? window : globalThis);
