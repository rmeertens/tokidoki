// GTK - Easy Word Order (guess-kanji.html): the JLPT N5–N3 words, in an order
// planned so you can guess each new word from kanji you've already met, as
// GuessWithAnki does for Anki decks. 電車 and 天気 first, and 電気 arrives
// readable: 電 read でん, 気 read き.
//
// Each time a session starts, guess-path.js plans the next words in the
// browser from the words this learner has already studied (oldest first,
// `started`), so the path follows what was actually learned. A word met
// within the last 40 new words, or whose card is mature, puts its kanji
// "in hand". The words and their pieces come from guess-words-data.js.
//
// Cards go in the shared SRS store (tokidoki_srs) as `guess:<word>|<kana>`,
// graded through app.js's copy of it (window.TokidokiSRS) so a review of
// the saved words afterwards doesn't write over them; tokidoki_guess keeps { started: [keys, in study order], guessed: [keys
// guessed right the first time they were seen] }.
(function (global) {
  'use strict';

  const STORE_KEY = 'tokidoki_guess';
  const ID_PREFIX = 'guess:';
  const NEW_PER_SESSION = 10;
  const MATURE_DAYS = 21;
  const COMPARE = 100;
  // Reading and meaning levels a word needs to count as guessable (see
  // scripts/build_guess_words.mjs).
  const READING_MIN = 0.6;
  const MEANING_MIN = 0.5;

  // [word, kana, meaning, level, pieces, r, m] → an item for guess-path.js.
  function toItem(row) {
    const [word, kana, meaning, level, pieces, r, m] = row;
    return { key: `${word}|${kana}`, word, kana, meaning, level, pieces: pieces.split(' '),
      g: r >= READING_MIN && m >= MEANING_MIN, own: Math.min(r, m) };
  }

  const cardId = key => ID_PREFIX + key;

  // Studied items (oldest first, `mature` from their SRS cards, `cardOf(id)`)
  // and the new ones, in list order.
  function splitDeck(items, started, cardOf) {
    const byKey = new Map(items.map(it => [it.key, it]));
    const done = new Set();
    const studied = [];
    for (const k of started) {
      const it = byKey.get(k);
      if (!it || done.has(k)) continue;
      done.add(k);
      const c = cardOf(cardId(k));
      studied.push(Object.assign({}, it, { mature: !!c && (c.interval || 0) >= MATURE_DAYS }));
    }
    return { studied, fresh: items.filter(it => !done.has(it.key)) };
  }

  const api = { toItem, splitDeck, cardId, STORE_KEY, READING_MIN, MEANING_MIN };
  global.GuessKanji = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;

  // ─── State ─────────────────────────────────────────────────────────────────

  function load(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  }

  const ITEMS = (global.GUESS_WORDS || []).map(toItem);
  const BY_KEY = new Map(ITEMS.map(it => [it.key, it]));
  const KANJI_MEANINGS = global.GUESS_KANJI_MEANINGS || {};

  function loadStore() {
    const s = load(STORE_KEY, {});
    return { started: Array.isArray(s.started) ? s.started : [], guessed: Array.isArray(s.guessed) ? s.guessed : [] };
  }

  const cardOf = id => (global.TokidokiSRS ? global.TokidokiSRS.card(id) : undefined);
  const isDue = c => !!c && Date.now() >= c.nextReview;

  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // session: { cards: [{ item, isNew, guess, hints }], pos, answered, correct, guessed }
  let session = null;

  function show(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === screen));
    window.scrollTo(0, 0);
  }

  function currentPlan(ahead) {
    const store = loadStore();
    const { studied, fresh } = splitDeck(ITEMS, store.started, cardOf);
    return { studied, fresh, path: GuessPath.plan(studied, fresh, { ahead }) };
  }

  function dueKeys() {
    return loadStore().started.filter(k => BY_KEY.has(k) && isDue(cardOf(cardId(k))));
  }

  // ─── Home ──────────────────────────────────────────────────────────────────

  const pieceKanji = p => p.split(':')[0];
  const pieceReading = p => p.split(':')[1];

  function hintsHtml(it, hints) {
    return it.pieces.map(p => {
      const from = BY_KEY.get(hints[p]);
      return `<li><span class="gk-hint-kanji" lang="ja">${esc(pieceKanji(p))}</span>
        <span class="gk-hint-reading" lang="ja">${esc(pieceReading(p))}</span>
        <span class="gk-hint-meaning">${esc(KANJI_MEANINGS[pieceKanji(p)] || '')}</span>
        ${from ? `<span class="gk-hint-from">from <span lang="ja">${esc(from.word)}</span></span>` : ''}</li>`;
    }).join('');
  }

  function renderHome() {
    const store = loadStore();
    const { studied, fresh, path } = currentPlan(COMPARE);
    const due = dueKeys().length;
    $('gk-studied').textContent = studied.length;
    $('gk-guessed').textContent = store.guessed.length;
    $('gk-due').textContent = due;
    $('gk-review').disabled = due === 0;
    $('gk-review').textContent = due ? `Review ${due} due` : 'Nothing due';
    $('gk-learn').disabled = fresh.length === 0;

    const onPath = path.slice(0, COMPARE).filter(x => x.guess).length;
    const inList = GuessPath.countGuessable(studied, fresh, COMPARE);
    const n = Math.min(COMPARE, fresh.length);
    $('gk-compare').innerHTML = n
      ? `Of your next <b>${n}</b> words, <b>${onPath}</b> can be guessed when they arrive on this path — <b>${inList}</b> in JLPT list order.`
      : 'You\'ve met every word on the path.';

    $('gk-next').innerHTML = path.slice(0, 30).map(x => `
      <li class="${x.guess ? 'gk-next-guess' : ''}" title="${esc(x.kana)} · ${esc(x.meaning)}">
        <span lang="ja">${esc(x.word)}</span>${x.guess ? '<span class="gk-badge" aria-label="guessable">🎯</span>' : ''}
      </li>`).join('');
  }

  // ─── Session ───────────────────────────────────────────────────────────────

  function startLearn() {
    const { path } = currentPlan(NEW_PER_SESSION);
    const cards = path.slice(0, NEW_PER_SESSION).map(x => ({ item: BY_KEY.get(x.key), isNew: true, guess: x.guess, hints: x.hints }));
    begin(cards);
  }

  function startReview() {
    const keys = dueKeys().slice(0, 20);
    begin(keys.map(k => ({ item: BY_KEY.get(k), isNew: false, guess: false, hints: {} })));
  }

  function begin(cards) {
    if (!cards.length) return;
    session = { cards, pos: 0, answered: false, correct: 0, guessed: 0, undo: [] };
    show('screen-guess-kanji');
    showCard();
  }

  function showCard() {
    if (session.pos >= session.cards.length) { finish(); return; }
    const card = session.cards[session.pos];
    const it = card.item;
    session.answered = false;
    updateUndoButton();
    const total = session.cards.length;
    $('gk-bar-fill').style.width = `${(session.pos / total) * 100}%`;
    $('gk-progress-text').textContent = `${session.pos + 1} / ${total}`;

    $('gk-label').textContent = card.guess ? '🎯 Guess the reading and meaning'
      : card.isNew ? 'New word' : 'Recall the reading and meaning';
    $('gk-card').classList.toggle('gk-card-guess', card.guess);
    $('gk-prompt').textContent = it.word;
    const hints = $('gk-hints');
    if (card.guess) {
      // The kanji it's built from stay hidden until asked for: guess first.
      const one = new Set(it.pieces.map(pieceKanji)).size === 1;
      hints.innerHTML = `<button type="button" class="btn-hint" id="gk-hint-btn">Show hint</button>
        <div class="hidden" id="gk-hint-body">
          <p class="gk-hints-title">You may know ${one ? 'this kanji' : 'these kanji'}:</p><ul>${hintsHtml(it, card.hints)}</ul>
        </div>`;
      $('gk-hint-btn').addEventListener('click', showHint);
    } else if (card.isNew) {
      const known = new Set(loadStore().started.filter(k => cardOf(cardId(k))).flatMap(k => (BY_KEY.get(k) || { pieces: [] }).pieces));
      const newOnes = it.pieces.filter(p => !known.has(p));
      hints.innerHTML = newOnes.length
        ? `<p class="gk-hints-title">New: ${newOnes.map(p => `<span lang="ja">${esc(pieceKanji(p))}</span>`).join(' ')}</p>`
        : '';
    } else {
      hints.innerHTML = '';
    }
    $('gk-reveal-area').classList.remove('hidden');
    $('gk-answer-area').classList.add('hidden');
  }

  function showHint() {
    const body = $('gk-hint-body');
    if (!body) return;
    body.classList.remove('hidden');
    $('gk-hint-btn').remove();
  }

  function reveal() {
    if (!session || session.answered) return;
    session.answered = true;
    const card = session.cards[session.pos];
    const it = card.item;
    $('gk-answer').innerHTML = `
      <div class="story-panel-reading" lang="ja">${esc(it.kana)}</div>
      <div class="story-panel-meaning">${esc(it.meaning)}</div>
      <ul class="gk-breakdown">${it.pieces.map(p => `
        <li><span lang="ja">${esc(pieceKanji(p))}</span> <span lang="ja">${esc(pieceReading(p))}</span> · ${esc(KANJI_MEANINGS[pieceKanji(p)] || '')}</li>`).join('')}
      </ul>`;
    $('gk-reveal-area').classList.add('hidden');
    $('gk-answer-area').classList.remove('hidden');
  }

  function grade(g) {
    if (!session || !session.answered) return;
    const card = session.cards[session.pos];
    const store = loadStore();
    session.undo.push({
      srs: global.TokidokiSRS ? global.TokidokiSRS.grade(cardId(card.item.key), g) : null,
      store: JSON.parse(JSON.stringify(store)),
      pos: session.pos, correct: session.correct, guessed: session.guessed,
    });
    if (!store.started.includes(card.item.key)) store.started.push(card.item.key);
    if (g > 1 && card.guess && card.isNew && !store.guessed.includes(card.item.key)) {
      store.guessed.push(card.item.key);
      session.guessed++;
    }
    save(STORE_KEY, store);
    if (g > 1) session.correct++;
    session.pos++;
    showCard();
  }

  function updateUndoButton() {
    const can = !!session && session.undo.length > 0;
    $('gk-undo').classList.toggle('hidden', !can);
    $('gk-done-undo').classList.toggle('hidden', !can);
  }

  // Takes back the last grade (a mis-tap): the card's SRS state, the review
  // log and the studied / guessed lists go back to before it, and the card
  // shows again to be graded anew.
  function undoLast() {
    if (!session || !session.undo.length) return;
    const u = session.undo.pop();
    if (global.TokidokiSRS) global.TokidokiSRS.undo(u.srs);
    save(STORE_KEY, u.store);
    session.pos = u.pos;
    session.correct = u.correct;
    session.guessed = u.guessed;
    show('screen-guess-kanji');
    showCard();
  }

  function finish() {
    $('gk-bar-fill').style.width = '100%';
    const total = session.cards.length;
    $('gk-done-total').textContent = total;
    $('gk-done-correct').textContent = session.correct;
    $('gk-done-guessed').textContent = session.guessed;
    show('screen-guess-kanji-done');
    updateUndoButton();
  }

  // ─── Wiring ────────────────────────────────────────────────────────────────

  if (!$('deck-guess')) return;
  const backToDeck = () => { session = null; show('screen-chapters'); renderHome(); };

  $('gk-learn').addEventListener('click', startLearn);
  $('gk-review').addEventListener('click', startReview);
  $('gk-reveal').addEventListener('click', reveal);
  $('gk-card').addEventListener('click', e => { if (!e.target.closest('button')) reveal(); });
  document.querySelectorAll('[data-gk-grade]').forEach(b => b.addEventListener('click', () => grade(Number(b.dataset.gkGrade))));
  $('gk-quit').addEventListener('click', backToDeck);
  $('gk-again').addEventListener('click', startLearn);
  $('gk-undo').addEventListener('click', undoLast);
  $('gk-done-undo').addEventListener('click', undoLast);
  $('gk-home').addEventListener('click', backToDeck);
  $('btn-gk-reset').addEventListener('click', () => {
    if (!confirm('Reset your GTK - Easy Word Order progress? The path starts over.')) return;
    if (global.TokidokiSRS) global.TokidokiSRS.removeWhere(id => id.startsWith(ID_PREFIX));
    save(STORE_KEY, { started: [], guessed: [] });
    renderHome();
  });

  document.addEventListener('keydown', e => {
    if (e.altKey || ((e.metaKey || e.ctrlKey) && e.key !== 'z' && e.key !== 'Z')) return;
    if (e.target.closest && e.target.closest('input, textarea, select')) return;
    const onCard = $('screen-guess-kanji').classList.contains('active');
    if (!session || !(onCard || $('screen-guess-kanji-done').classList.contains('active'))) return;
    if (e.key === 'z' || e.key === 'Z') { e.preventDefault(); undoLast(); return; }
    if (!onCard) return;
    if (!session.answered && (e.key === 'h' || e.key === 'H')) { e.preventDefault(); showHint(); }
    else if (!session.answered && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); reveal(); }
    else if (session.answered && e.key === '1') { e.preventDefault(); grade(1); }
    else if (session.answered && e.key === '2') { e.preventDefault(); grade(4); }
  });

  renderHome();
})(typeof window !== 'undefined' ? window : globalThis);
