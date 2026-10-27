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
    const [word, kana, meaning, level, pieces, r, m, pos, exJa, exEn, exId] = row;
    return { key: `${word}|${kana}`, word, kana, meaning, level, pieces: pieces.split(' '),
      g: r >= READING_MIN && m >= MEANING_MIN, own: Math.min(r, m), pos: pos || '',
      example: exJa ? { ja: exJa, en: exEn, id: exId } : null };
  }

  const escHtml = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // An example sentence's {漢字|かんじ} groups as ruby; the groups holding one
  // of `kanji` (the card's own) are highlighted.
  function exampleHtml(ja, kanji = new Set()) {
    let out = '';
    let last = 0;
    ja.replace(/\{([^|}]+)\|([^}]+)\}/g, (m, base, reading, i) => {
      out += escHtml(ja.slice(last, i));
      const ruby = `<ruby>${escHtml(base)}<rp>(</rp><rt>${escHtml(reading)}</rt><rp>)</rp></ruby>`;
      out += [...base].some(c => kanji.has(c)) ? `<mark>${ruby}</mark>` : ruby;
      last = i + m.length;
      return m;
    });
    return out + escHtml(ja.slice(last));
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

  const api = { toItem, splitDeck, cardId, exampleHtml, STORE_KEY, READING_MIN, MEANING_MIN };
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
  // Kanji that are words on their own, with each reading the list has for
  // them (中: なか and ちゅう): the list is of common words, so these are
  // the readings worth knowing apart.
  const STANDALONE = new Map();
  ITEMS.filter(it => [...it.word].length === 1).forEach(it => {
    STANDALONE.set(it.word, (STANDALONE.get(it.word) || []).concat(it));
  });

  // The other words a kanji is on its own, read otherwise than `reading`.
  const otherStandalone = (kanji, reading, key) =>
    (STANDALONE.get(kanji) || []).filter(w => w.key !== key && w.kana !== reading);
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

  // "from 電車 (でんしゃ)": the word a kanji was met in.
  const fromHtml = w => `from <span lang="ja">${esc(w.word)}</span> <span lang="ja">(${esc(w.kana)})</span>`;

  function hintsHtml(it, hints) {
    return it.pieces.map(p => {
      const from = BY_KEY.get(hints[p]);
      return `<li><span class="gk-hint-kanji" lang="ja">${esc(pieceKanji(p))}</span>
        <span class="gk-hint-reading" lang="ja">${esc(pieceReading(p))}</span>
        <span class="gk-hint-meaning">${esc(KANJI_MEANINGS[pieceKanji(p)] || '')}</span>
        ${from ? `<span class="gk-hint-from">${fromHtml(from)}</span>` : ''}</li>`;
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
      : card.isNew ? 'New word' : 'Review';
    $('gk-card').classList.toggle('gk-card-guess', card.guess);
    $('gk-prompt').textContent = it.word;
    // A word that brings in kanji not met yet: the first word with them.
    if (card.isNew && !card.guess) {
      const known = new Set(studiedKeys().flatMap(k => BY_KEY.get(k).pieces));
      card.newPieces = [...new Set(it.pieces.filter(p => !known.has(p)))];
    } else {
      card.newPieces = [];
    }
    const firstWith = [...new Set(card.newPieces.map(pieceKanji))];
    $('gk-meta').innerHTML = [
      ...(it.pos ? it.pos.split(' · ') : []).map(x => `<span class="gk-chip">${esc(x)}</span>`),
      `<span class="gk-chip gk-chip-level">${esc(it.level)}</span>`,
      firstWith.length ? `<span class="gk-chip gk-chip-first" title="The first word on the path with this kanji">first word with <span lang="ja">${firstWith.map(esc).join(' ')}</span></span>` : '',
      (STANDALONE.get(it.word) || []).length > 1
        ? `<span class="gk-chip gk-chip-readings" title="As a word on its own, this kanji is read more than one way — which one is this?">${STANDALONE.get(it.word).length} readings as a word</span>` : '',
    ].join('');
    // Hints stay closed until asked for: guess first.
    const buttons = [];
    const bodies = [];
    if (card.guess) {
      const one = new Set(it.pieces.map(pieceKanji)).size === 1;
      buttons.push('<button type="button" class="btn-hint" data-gk-hint="kanji">Show hint <span class="gk-key">H</span></button>');
      bodies.push(`<div class="gk-hint-body hidden" data-gk-hint-body="kanji">
          <p class="gk-hints-title">You may know ${one ? 'this kanji' : 'these kanji'}:</p><ul>${hintsHtml(it, card.hints)}</ul>
        </div>`);
    }
    const seen = seenWords(it);
    if (seen.length) {
      buttons.push(`<button type="button" class="btn-hint" data-gk-hint="seen">Words you've seen (${seen.length}) <span class="gk-key">H</span></button>`);
      bodies.push(`<div class="gk-hint-body hidden" data-gk-hint-body="seen">
          <p class="gk-hints-title">Words you've seen with ${seenKanjiText(it, seen)}:</p>
          <ul class="gk-seen">${seen.map(w => seenHtml(w, it)).join('')}</ul>
        </div>`);
    }
    const hints = $('gk-hints');
    hints.classList.remove('hidden');
    hints.innerHTML = (buttons.length ? `<div class="gk-hint-buttons">${buttons.join('')}</div>` : '') + bodies.join('');
    hints.querySelectorAll('[data-gk-hint]').forEach(b => b.addEventListener('click', () => showHint(b.dataset.gkHint)));
    $('gk-reveal-area').classList.remove('hidden');
    $('gk-answer-area').classList.add('hidden');
  }

  // H opens the hints in turn: the kanji a 🎯 word is built from, then the
  // words already studied that share a kanji with it.
  function showNextHint() {
    const btn = document.querySelector('#gk-hints [data-gk-hint]');
    if (btn) showHint(btn.dataset.gkHint);
  }

  // Opens a hint: 'kanji' (the kanji a 🎯 word is built from) or 'seen'
  // (words already studied that share a kanji with it).
  function showHint(which) {
    const body = document.querySelector(`[data-gk-hint-body="${which}"]`);
    if (!body) return;
    body.classList.remove('hidden');
    const btn = document.querySelector(`[data-gk-hint="${which}"]`);
    if (btn) btn.remove();
  }

  // The words studied so far that are still in the list, oldest first.
  function studiedKeys() {
    return loadStore().started.filter(k => BY_KEY.has(k) && cardOf(cardId(k)));
  }

  const SEEN_MAX = 6;

  // Words already studied that share a kanji with `it`, most recent first.
  function seenWords(it) {
    const kanji = new Set(it.pieces.map(pieceKanji));
    return studiedKeys().reverse()
      .filter(k => k !== it.key && BY_KEY.get(k).pieces.some(p => kanji.has(pieceKanji(p))))
      .slice(0, SEEN_MAX)
      .map(k => BY_KEY.get(k));
  }

  function seenKanjiText(it, seen) {
    const shared = new Set(seen.flatMap(w => w.pieces.map(pieceKanji)));
    return [...new Set(it.pieces.map(pieceKanji))].filter(ch => shared.has(ch))
      .map(ch => `<span lang="ja">${esc(ch)}</span>`).join(' ');
  }

  // A seen word, its kanji shared with `it` highlighted.
  function seenHtml(w, it) {
    const kanji = new Set(it.pieces.map(pieceKanji));
    const word = [...w.word].map(ch => (kanji.has(ch) ? `<mark>${esc(ch)}</mark>` : esc(ch))).join('');
    return `<li><span class="gk-seen-word" lang="ja">${word}</span>
      <span class="gk-hint-reading" lang="ja">${esc(w.kana)}</span>
      <span class="gk-hint-meaning">${esc(w.meaning)}</span></li>`;
  }

  function reveal() {
    if (!session || session.answered) return;
    session.answered = true;
    const card = session.cards[session.pos];
    const it = card.item;
    $('gk-answer').innerHTML = `
      <div class="story-panel-reading" lang="ja">${esc(it.kana)}</div>
      <div class="story-panel-meaning">${esc(it.meaning)}</div>
      <ul class="gk-breakdown">${it.pieces.map(p => {
        const from = fromWord(card, p);
        return `<li><span class="gk-hint-kanji" lang="ja">${esc(pieceKanji(p))}</span>
          <span class="gk-hint-reading" lang="ja">${esc(pieceReading(p))}</span>
          <span class="gk-hint-meaning">${esc(KANJI_MEANINGS[pieceKanji(p)] || '')}</span>
          ${from ? `<span class="gk-hint-from">${fromHtml(from)}</span>` : ''}
          ${otherStandalone(pieceKanji(p), pieceReading(p), it.key).map(w => `<span class="gk-other-reading">on its own also
            <span lang="ja">${esc(w.kana)}</span>: ${esc(w.meaning)}</span>`).join('')}</li>`;
      }).join('')}
      </ul>
      ${card.newPieces.map(p => {
        const also = alsoIn(p, it);
        return also.length ? `<p class="gk-also"><span lang="ja">${esc(pieceKanji(p))}</span> (<span lang="ja">${esc(pieceReading(p))}</span>) is also in
          ${also.map(w => `<span class="gk-also-word" lang="ja" title="${esc(w.kana)} · ${esc(w.meaning)}">${esc(w.word)}</span>`).join(' · ')}</p>` : '';
      }).join('')}
      ${it.example ? `<div class="gk-example">
        <div class="gk-example-ja" lang="ja">${exampleHtml(it.example.ja, new Set(it.pieces.map(pieceKanji)))}</div>
        <div class="gk-example-en">${esc(it.example.en)}</div>
        <a class="gk-example-src" href="https://tatoeba.org/sentences/show/${Number(it.example.id)}" target="_blank" rel="noopener">Tatoeba #${Number(it.example.id)}</a>
      </div>` : ''}`;
    // The answer lists the kanji, so the hints have done their job.
    $('gk-hints').classList.add('hidden');
    $('gk-reveal-area').classList.add('hidden');
    $('gk-answer-area').classList.remove('hidden');
  }

  // The word a kanji (with this reading) was met in: for a 🎯 word, the one
  // the path planned it from; otherwise the latest studied word with it.
  function fromWord(card, p) {
    if (card.hints && card.hints[p] && card.hints[p] !== card.item.key) return BY_KEY.get(card.hints[p]);
    const k = studiedKeys().reverse().find(x => x !== card.item.key && BY_KEY.get(x).pieces.includes(p));
    return k ? BY_KEY.get(k) : null;
  }

  // Other words built on a kanji with this reading, the ones not studied
  // yet first: what makes a first word a building block.
  function alsoIn(p, it) {
    const studied = new Set(studiedKeys());
    return ITEMS.filter(w => w.key !== it.key && w.pieces.includes(p))
      .sort((a, b) => studied.has(a.key) - studied.has(b.key))
      .slice(0, 4);
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
  $('gk-card').addEventListener('click', e => { if (!e.target.closest('button, .gk-hints')) reveal(); });
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
    if (!session.answered && (e.key === 'h' || e.key === 'H')) { e.preventDefault(); showNextHint(); }
    else if (!session.answered && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); reveal(); }
    else if (session.answered && e.key === '1') { e.preventDefault(); grade(1); }
    else if (session.answered && e.key === '2') { e.preventDefault(); grade(4); }
  });

  renderHome();
})(typeof window !== 'undefined' ? window : globalThis);
