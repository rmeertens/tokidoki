// JLPT Questions (vocab-questions.html): vocabulary questions in the style
// of the JLPT, four choices each, ten at a time.
//
//   Kanji reading (漢字読み) — how is the underlined word read? Out of
//     other words in the same form (たのしかった · うれしかった ·
//     いそがしかった), or out of sound-alikes (がいこく · がいごく).
//   Kanji writing (表記) — the underlined word is in hiragana: how is it
//     written? Wrong choices swap a kanji for a look-alike (映画 · 央画 ·
//     映面 · 央面). Both from vocab-kanji-data.js, built by
//     scripts/build_vocab_kanji.mjs.
//   Fill in the blank (文脈規定) — which word goes in the （　）? The
//     sentences are Tokidoki's own example sentences, with wrong choices of
//     the same kind and level (vocab-fill-data.js, built and hand-checked
//     by scripts/build_vocab_fill.mjs).
//   Similar meaning (言い換え類義) — which sentence means about the same as
//     the underlined part? (similar-meaning-data.js)
//
// Every question is also a flashcard: once answered you grade it Again or
// Good, through the shared SRS store (app.js's window.TokidokiSRS, cards
// vq:<set>:<question>), and rounds start with the due ones.
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

  // The kana of a target: "{映画|えいが}" → えいが, "{泳|およ}いで" → およいで.
  const kanaOf = markup => String(markup).replace(/\{[^|}]+\|([^}]+)\}/g, '$1');

  // Every set: { id, kind, level, questions }, each question with its
  // choices (the answer first).
  function sets(fill, similar, kanji) {
    const out = [];
    for (const [kind, field] of [['readword', 'v'], ['reading', 'r'], ['writing', 'x']]) {
      for (const level of LEVELS) {
        out.push({ id: `${kind}-${level}`, kind, level, questions: ((kanji || {})[level] || []).filter(q => q[field]).map(q => ({
          kind, key: `${q.w}|${q.k}`,
          b: q.b, t: q.t, a: q.a, en: q.en,
          // Other-word choices are [kana, word, reading, meaning], like a
          // fill-in choice; the others plain text, with the word alone.
          choices: kind === 'readword' ? q.v.map(c => c[0]) : q[field],
          words: kind === 'readword' ? q.v : [[q.t, q.w, q.k, q.m]],
        })) });
      }
    }
    for (const level of LEVELS) {
      out.push({ id: `fill-${level}`, kind: 'fill', level, questions: ((fill || {})[level] || []).map(q => ({
        kind: 'fill', key: `${q.w}|${q.k}`,
        b: q.b, a: q.a, en: q.en,
        choices: q.c.map(c => c[0]),
        words: q.c,
      })) });
    }
    for (const level of LEVELS) {
      out.push({ id: `similar-${level}`, kind: 'similar', level, questions: ((similar || {})[level] || []).map(q => ({
        kind: 'similar', key: plain(q.q),
        q: q.q, en: q.en, note: q.note,
        choices: [q.ok, ...q.wrong],
        choicesEn: [q.okEn, ...(q.wrongEn || [])],
      })) });
    }
    return out;
  }

  // Every question is a flashcard in the shared SRS store, graded Again or
  // Good once answered: vq:<set id>:<word|reading or the sentence>.
  const cardId = (set, question) => `vq:${set.id}:${question.key}`;
  const isDue = (c, now) => !!c && now >= c.nextReview;

  // How many of a set's questions are due, and how many never seen.
  function counts(set, cardOf, now = Date.now()) {
    let due = 0, fresh = 0;
    for (const q of set.questions) {
      const c = cardOf(cardId(set, q));
      if (!c) fresh++;
      else if (isDue(c, now)) due++;
    }
    return { due, fresh };
  }

  // A round: up to ten questions — the due ones first (longest due first),
  // then new ones, then the ones due soonest — in a shuffled order, each
  // with its choices shuffled ([indexes into choices]; 0 is the answer).
  function makeRound(set, cardOf = () => undefined, rand = Math.random, now = Date.now()) {
    const all = set.questions.map((q, i) => ({ i, c: cardOf(cardId(set, q)) }));
    const due = all.filter(x => isDue(x.c, now)).sort((a, b) => a.c.nextReview - b.c.nextReview);
    const fresh = shuffle(all.filter(x => !x.c), rand);
    const later = all.filter(x => x.c && !isDue(x.c, now)).sort((a, b) => a.c.nextReview - b.c.nextReview);
    const picked = [...due, ...fresh, ...later].slice(0, ROUND).map(x => x.i);
    return shuffle(picked, rand).map(i => ({ i, order: shuffle([0, 1, 2, 3], rand), pick: null }));
  }

  // A round never has the same question twice: "Again" makes it due, so it
  // comes first in the next round instead.
  const score = round => round.filter(q => q.pick === 0).length;
  // The ones answered wrong, or marked Again: what still needs answering.
  const toRedo = round => round.filter(q => q.pick !== 0 || q.grade === 1);

  const api = { rubyHtml, underlinedHtml, plain, kanaOf, sets, cardId, counts, makeRound, score, toRedo, ROUND };
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

  const SETS = sets(global.VOCAB_FILL, global.SIMILAR_MEANING, global.VOCAB_KANJI);
  const settings = Object.assign({ furigana: true }, load(SETTINGS_KEY, {}));
  const store = Object.assign({ best: {}, last: {} }, load(STORE_KEY, {}));
  // The questions' SRS cards: app.js's copy of the store once it's running
  // (window.TokidokiSRS, so grades go through it and count in the
  // statistics), the saved store before that.
  const SRS_STORE = 'tokidoki_srs';
  const cardOf = id => (global.TokidokiSRS ? global.TokidokiSRS.card(id) : (load(SRS_STORE, {}) || {})[id]);
  const srsSnapshot = () => {
    if (global.TokidokiSRS) return global.TokidokiSRS.card;
    const all = load(SRS_STORE, {}) || {};
    return id => all[id];
  };
  const $ = id => document.getElementById(id);

  // attempt: { set, round, at }
  let attempt = null;

  function show(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === screen));
    window.scrollTo(0, 0);
  }

  // ─── Home ──────────────────────────────────────────────────────────────────

  const KIND = {
    readword: { title: 'Kanji reading', ja: '漢字読み', about: 'How is the underlined word read?' },
    reading: { title: 'Kanji reading: sound-alikes', ja: '漢字読み', about: 'How is the underlined word read?' },
    writing: { title: 'Kanji writing', ja: '表記', about: 'How is the underlined word written?' },
    fill: { title: 'Fill in the blank', ja: '文脈規定', about: 'Which word goes in the （　）?' },
    similar: { title: 'Similar meaning', ja: '言い換え類義', about: 'Which sentence means about the same as the underlined part?' },
  };

  function countsText(set) {
    const { due, fresh } = counts(set, srsSnapshot());
    return [due ? ` · <b class="vq-due">${due} due</b>` : '', fresh ? ` · ${fresh} new` : ''].join('');
  }

  function setHtml(set) {
    const best = store.best[set.id];
    const state = !best ? '' : best.score === best.total ? ' sf-item-perfect' : ' sf-item-done';
    return `<button class="sf-item${state}" data-set="${esc(set.id)}">
      <span class="sf-item-level">${esc(set.level)}</span>
      <span class="sf-item-body">
        <span class="sf-item-title">${esc(KIND[set.kind].title)} · ${esc(set.level)}</span>
        <span class="sf-item-en">${set.questions.length} questions${countsText(set)}</span>
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

  // The Furigana switch is on the home screen and on the question screen;
  // both show the same setting.
  function applySettings() {
    document.body.classList.toggle('vq-no-furigana', !settings.furigana);
    $('vq-opt-furigana').checked = settings.furigana;
    $('vq-opt-furigana-q').checked = settings.furigana;
  }

  function start(id) {
    const set = SETS.find(s => s.id === id);
    if (!set) return;
    // undo: the grades given this round, last on top (see undoLast).
    attempt = { set, round: makeRound(set, srsSnapshot()), at: 0, undo: [] };
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
    if (question.t) {
      // Once answered, the word in kanji with its furigana; before, the
      // kanji alone (reading) or the kana alone (writing).
      const target = done ? rubyHtml(question.t) : esc(question.kind === 'writing' ? kanaOf(question.t) : plain(question.t));
      return `${rubyHtml(question.b)}<span class="vq-target${done ? ` ${q.pick === 0 ? 'vq-right' : 'vq-wrong'}` : ''}">${target}</span>${rubyHtml(question.a)}`;
    }
    const filled = done
      ? `<span class="vq-blank vq-blank-filled ${q.pick === 0 ? 'vq-right' : 'vq-wrong'}">${rubyHtml(question.choices[0])}</span>`
      : '<span class="vq-blank">　　　</span>';
    return `${rubyHtml(question.b)}（${filled}）${rubyHtml(question.a)}`;
  }

  const shortMeaning = m => String(m).split(/;\s*/)[0];

  // ─── Word and kanji flashcards ──────────────────────────────────────────

  // Words join the word flashcard deck (tokidoki_story_words, reviewed on
  // flashcards.html, like Story Fill-in's), kanji the kanji deck through
  // kanji-cards.js, whose buttons look after themselves.
  const DECK_KEY = 'tokidoki_story_words';
  const SRS_KEY = 'tokidoki_srs';
  const deck = () => load(DECK_KEY, {});
  // Our {漢字|かな} markup in the decks' 漢字[かな] form.
  const deckMarkup = markup => String(markup).replace(/\{([^|}]+)\|([^}]+)\}/g, '$1[$2]').replace(/_/g, '');

  // w: [markup, word, reading, meaning] (a fill-in choice).
  function toggleWord(question, w) {
    const words = deck();
    const key = w[1];
    if (words[key]) {
      delete words[key];
      const srs = load(SRS_KEY, {});
      delete srs['story_word:' + key];
      delete srs['story_word:' + key + ':recall'];
      save(SRS_KEY, srs);
    } else {
      const set = attempt.set;
      // The answer gets the question's sentence, the answer filled in.
      const answer = question.words[0][1] === key;
      words[key] = Object.assign(
        { vocab: set.level.toLowerCase(), kana: w[2], meaning: shortMeaning(w[3]), added: Date.now(), level: set.level },
        answer ? { jp: deckMarkup(question.b + (question.t || question.choices[0]) + question.a), en: question.en, title: `JLPT Questions (${KIND[set.kind].title})` } : {},
      );
    }
    save(DECK_KEY, words);
  }

  function wordButtonHtml(w, k, look) {
    const saved = !!deck()[w[1]];
    const label = look === 'label' ? (saved ? '✓ Word card' : '＋ Word card') : (saved ? '✓' : '＋');
    return `<button type="button" class="kanji-card-btn kanji-card-btn-${look}${saved ? ' saved' : ''} vq-word-btn" data-word-card="${k}"` +
      ` aria-pressed="${saved}" title="${saved ? `${esc(w[1])} is in your word flashcards — click to remove` : `Add ${esc(w[1])} to your word flashcards`}">${label}</button>`;
  }

  // The kanji of a word or sentence, each with its meaning, readings and a
  // ＋ for the kanji deck.
  const breakdown = (text, from, title) =>
    (global.KanjiCards ? KanjiCards.breakdownHtml(plain(text), from, title ? { title } : {}) : '');

  function whyHtml(question) {
    if (question.kind === 'similar') {
      const kanji = breakdown(question.q.split('_')[1] + question.choices[0], {}, 'Kanji in this question');
      return `<p>${esc(question.note)}</p>${kanji}`;
    }
    const [answer] = question.words;
    if (question.kind === 'reading' || question.kind === 'writing') {
      return `      <ul class="vq-words"><li class="vq-words-answer">${wordButtonHtml(answer, 0, 'label')} <span class="vq-word-text"><span lang="ja">${esc(answer[1])}</span> <span class="vq-words-kana" lang="ja">${esc(answer[2])}</span> — ${esc(shortMeaning(answer[3]))}</span></li></ul>
      ${question.kind === 'writing' ? lookalikesHtml(question) : ''}
      ${breakdown(answer[1], { reading: answer[2], meaning: shortMeaning(answer[3]) }, `Kanji in ${answer[1]}`)}
      ${deck()[answer[1]] ? '<p class="vq-tip">Review your flashcards on the <a href="flashcards.html">Flashcards page</a>.</p>' : ''}`;
    }
    return `      <ul class="vq-words">${question.words.map((w, k) => `<li${k === 0 ? ' class="vq-words-answer"' : ''}>${wordButtonHtml(w, k, k === 0 ? 'label' : 'icon')} <span class="vq-word-text"><span lang="ja">${esc(w[1])}</span> <span class="vq-words-kana" lang="ja">${esc(w[2])}</span> — ${esc(shortMeaning(w[3]))}</span></li>`).join('')}</ul>
      ${breakdown(answer[1], { reading: answer[2], meaning: shortMeaning(answer[3]) }, `Kanji in ${answer[1]}`)}
      ${deck()[answer[1]] ? '<p class="vq-tip">Review your flashcards on the <a href="flashcards.html">Flashcards page</a>.</p>' : ''}`;
  }

  // The look-alike kanji in the wrong choices, each with its meaning, so
  // the difference sticks: 央 centre, 面 face.
  function kanjiMeaning(k) {
    const info = global.KANJI_INFO && global.KANJI_INFO[k];
    if (info) return String(info.meaning).split(',')[0].trim();
    const quiz = global.KANJI_QUIZ_DATA ? Object.values(global.KANJI_QUIZ_DATA).flat().find(x => x.kanji === k) : null;
    return quiz ? String(quiz.meaning).split(',')[0].trim() : '';
  }
  // What a writing choice means, beside it once answered: the word's
  // meaning for the answer, the meaning of each look-alike kanji for a
  // wrong one (白: white; 央画: 央 centre).
  function writingGloss(question, k) {
    if (k === 0) return shortMeaning(question.words[0][3]);
    const answer = [...question.choices[0]];
    const chars = [...question.choices[k]];
    // The kanji is named only when the choice has more than one.
    const named = chars.filter(ch => /[㐀-鿿々]/.test(ch)).length > 1;
    return chars
      .filter((ch, i) => ch !== answer[i] && kanjiMeaning(ch))
      .map(ch => `${named ? `${ch} ` : ''}${kanjiMeaning(ch).toLowerCase()}`).join(' · ');
  }

  function lookalikesHtml(question) {
    const answer = [...question.choices[0]];
    const swapped = [];
    for (const choice of question.choices.slice(1)) {
      [...choice].forEach((ch, i) => {
        if (ch !== answer[i] && !swapped.some(s => s[0] === ch)) swapped.push([ch, answer[i]]);
      });
    }
    if (!swapped.length) return '';
    return `<p class="vq-lookalikes">${swapped.map(([ch, right], i) =>
      `${i ? 'not' : 'Not'} <b lang="ja">${esc(ch)}</b>${kanjiMeaning(ch) ? ` <span class="vq-lookalike-en">(${esc(kanjiMeaning(ch))})</span>` : ''} but <b lang="ja">${esc(right)}</b>`).join('; ')}.</p>`;
  }

  function render() {
    const { round, at, set } = attempt;
    const over = at >= round.length;
    const done = round.filter(q => q.graded).length;
    $('vq-bar-fill').style.width = `${(100 * done) / round.length}%`;
    $('vq-progress-text').textContent = `${done} / ${round.length}`;
    $('vq-question').classList.toggle('hidden', over);
    $('vq-result').classList.toggle('hidden', !over);
    $('vq-missed').classList.toggle('hidden', !over);
    $('vq-actions').classList.toggle('hidden', !over);
    const canUndo = attempt.undo.length > 0;
    $('vq-undo').classList.toggle('hidden', !canUndo);
    $('btn-vq-undo').classList.toggle('hidden', !canUndo);
    if (over) {
      renderResult();
      return;
    }
    const q = current();
    const question = questionOf(q);
    const answered = q.pick != null;
    const choices = q.order.map((k, n) => {
      // Once answered, a fill-in choice (one word) shows its meaning beside
      // it; a similar-meaning choice (a whole sentence) shows it underneath.
      const gloss = !answered ? ''
        : question.kind === 'fill' || question.kind === 'readword' ? shortMeaning(question.words[k][3])
          : question.kind === 'writing' ? writingGloss(question, k) : '';
      let cls = 'sf-choice vq-choice';
      if (answered && k === 0) cls += ' correct';
      else if (answered && k === q.pick) cls += ' wrong';
      return `<button class="${cls}" data-choice="${k}" ${answered ? 'disabled' : ''}>
        <span class="sf-choice-num" aria-hidden="true">${n + 1}</span>
        <span class="vq-choice-body${gloss ? ' vq-choice-inline' : ''}">
          <span class="vq-choice-text" lang="ja">${rubyHtml(question.choices[k])}</span>
          ${gloss ? `<span class="vq-choice-en">${esc(gloss)}</span>` : ''}
          ${answered && question.choicesEn && question.choicesEn[k] ? `<span class="vq-choice-en">${esc(question.choicesEn[k])}</span>` : ''}
        </span>
      </button>`;
    }).join('');
    const verdict = !answered ? `<span>${esc(KIND[set.kind].about)}</span>`
      : q.pick === 0 ? '<b class="sf-verdict-right">✓ Correct</b>'
        : `<b class="sf-verdict-wrong">✗ It’s ${q.order.indexOf(0) + 1}: <span lang="ja">${esc(plain(question.choices[0]))}</span></b>`;
    $('vq-question').innerHTML = `<div class="sf-q vq-q${answered ? ` vq-q-answered${q.pick === 0 ? ' sf-q-right' : ' sf-q-wrong'}` : ''}">
      <div class="sf-q-head"><span class="sf-q-num">${at + 1}</span>${verdict}</div>
      <div class="vq-sentence${answered ? ' vq-sentence-answered' : ''}" lang="ja">${questionHtml(question, q)}</div>
      ${answered ? `<p class="vq-translation">${esc(question.en)}</p>` : ''}
      <div class="sf-choices vq-choices${set.kind === 'similar' ? ' vq-choices-long' : ''}">${choices}</div>
      ${answered ? `<div class="particle-explanation sf-why vq-why">${whyHtml(question)}</div>
      <div class="vq-grade-area">
        <button id="btn-vq-grade-again" class="${q.pick === 0 ? 'btn-secondary' : 'btn-primary'} vq-grade" data-grade="1"><kbd>1</kbd> Again</button>
        <button id="btn-vq-grade-good" class="${q.pick === 0 ? 'btn-primary' : 'btn-secondary'} vq-grade" data-grade="4"><kbd>2</kbd> Good</button>
      </div>
      <p class="vq-grade-hint">${q.pick === 0 ? 'Good if you knew it — Again to see it again in your next round.' : 'Again brings it back first in your next round.'}</p>` : ''}
    </div>`;
  }

  function pick(k) {
    const q = current();
    if (!q || q.pick != null) return;
    q.pick = k;
    render();
    // Enter takes the suggested grade: Good when right, Again when wrong.
    const suggested = $(k === 0 ? 'btn-vq-grade-good' : 'btn-vq-grade-again');
    if (suggested) suggested.focus({ preventScroll: true });
  }

  // The end of a round: how many were wrong, which ones (with their
  // answers), and how many of the set still need answering.
  function renderResult() {
    const { round, set } = attempt;
    const s = score(round);
    const n = round.length;
    const wrong = n - s;
    const redo = toRedo(round);
    const { due, fresh } = counts(set, srsSnapshot());
    $('vq-score').textContent = `${s} / ${n}`;
    $('vq-score-msg').innerHTML = wrong === 0
      ? `All ${n} right${redo.length ? ` — but you marked ${redo.length} Again` : ''}. 🎉`
      : `<b class="sf-verdict-wrong">${wrong} wrong</b> out of ${n}.`;
    const answerOf = question => (question.kind === 'similar'
      ? `<span class="vq-missed-q" lang="ja">${underlinedHtml(question.q)}</span><span class="vq-missed-a" lang="ja">→ ${rubyHtml(question.choices[0])}</span>`
      : question.t ? `<span class="vq-missed-q" lang="ja">${rubyHtml(question.b)}<b>${rubyHtml(question.t)}</b>${rubyHtml(question.a)}</span>`
      : `<span class="vq-missed-q" lang="ja">${rubyHtml(question.b)}（<b>${rubyHtml(question.choices[0])}</b>）${rubyHtml(question.a)}</span>`);
    const still = due
      ? `<b>${due} question${due === 1 ? '' : 's'}</b> in this set still need${due === 1 ? 's' : ''} answering — they come first in your next round.`
      : `Nothing in this set is waiting to be answered again.`;
    $('vq-missed').innerHTML = `${redo.length ? `<div class="vq-missed-title">To answer again</div>
      <ul class="vq-missed-list">${redo.map(q => `<li class="${q.pick === 0 ? '' : 'vq-missed-wrong'}">${answerOf(questionOf(q))}${q.pick === 0 ? '<span class="vq-missed-tag">marked Again</span>' : ''}</li>`).join('')}</ul>` : ''}
      <p class="vq-missed-still">${still}${fresh ? ` ${fresh} never seen yet.` : ''}</p>`;
    $('btn-vq-again').textContent = due ? `Answer ${Math.min(due, ROUND)} due now` : fresh ? 'Ten more' : 'Practise ten again';
    $('btn-vq-again').focus({ preventScroll: true });
  }

  // Again (1) or Good (4), like the flashcards; then the next question.
  function grade(g) {
    const q = current();
    if (!q || q.pick == null || q.graded) return;
    const question = questionOf(q);
    attempt.undo.push({
      at: attempt.at,
      srs: global.TokidokiSRS ? global.TokidokiSRS.grade(cardId(attempt.set, question), g) : null,
      store: JSON.stringify(store),
    });
    q.graded = true;
    q.grade = g;
    attempt.at++;
    if (attempt.at >= attempt.round.length) saveScore();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Takes back the last grade (a mis-tap): the card's schedule and the
  // review log go back to before it (TokidokiSRS.undo), so does the saved
  // score if that grade ended the round, and the question shows again,
  // answered, to be graded anew.
  function undoLast() {
    if (!attempt || !attempt.undo.length) return;
    const u = attempt.undo.pop();
    if (global.TokidokiSRS) global.TokidokiSRS.undo(u.srs);
    Object.assign(store, JSON.parse(u.store));
    save(STORE_KEY, store);
    attempt.at = u.at;
    const q = current();
    q.graded = false;
    delete q.grade;
    render();
    const suggested = $(q.pick === 0 ? 'btn-vq-grade-good' : 'btn-vq-grade-again');
    if (suggested) suggested.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function saveScore() {
    const s = score(attempt.round);
    const id = attempt.set.id;
    const total = attempt.round.length;
    const prev = store.best[id];
    if (!prev || s > prev.score) store.best[id] = { score: s, total };
    store.last[id] = { score: s, total };
    save(STORE_KEY, store);
  }

  function goHome() {
    attempt = null;
    renderHome();
    show('screen-chapters');
  }

  // ─── Events ────────────────────────────────────────────────────────────────

  for (const id of ['vq-opt-furigana', 'vq-opt-furigana-q']) {
    $(id).addEventListener('change', e => { settings.furigana = e.target.checked; save(SETTINGS_KEY, settings); applySettings(); });
  }
  for (const kind of Object.keys(KIND)) {
    $(`vq-list-${kind}`).addEventListener('click', e => {
      const b = e.target.closest('[data-set]');
      if (b) start(b.dataset.set);
    });
  }
  $('vq-question').addEventListener('click', e => {
    const b = e.target.closest('[data-choice]');
    if (b && !b.disabled) { pick(Number(b.dataset.choice)); return; }
    const wb = e.target.closest('[data-word-card]');
    if (wb) {
      const question = questionOf(current());
      toggleWord(question, question.words[Number(wb.dataset.wordCard)]);
      render();
      return;
    }
    const gb = e.target.closest('[data-grade]');
    if (gb) grade(Number(gb.dataset.grade));
  });
  document.addEventListener('keydown', e => {
    if (!attempt || !$('screen-vocab-questions').classList.contains('active')) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    // Z (or Ctrl/Cmd+Z): undo the last grade.
    if ((e.key === 'z' || e.key === 'Z') && !e.altKey && !e.shiftKey) { e.preventDefault(); undoLast(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (attempt.at >= attempt.round.length) return;
    const q = current();
    if (q.pick == null && /^[1-4]$/.test(e.key)) {
      e.preventDefault();
      pick(q.order[Number(e.key) - 1]);
    } else if (q.pick != null && (e.key === '1' || e.key === '2')) {
      e.preventDefault();
      grade(e.key === '1' ? 1 : 4);
    } else if (q.pick != null && e.key === 'Enter' && !e.target.closest('[data-grade]')) {
      e.preventDefault();
      grade(q.pick === 0 ? 4 : 1);
    }
  });
  $('btn-vq-again').addEventListener('click', () => start(attempt.set.id));
  $('btn-vq-home').addEventListener('click', goHome);
  $('vq-quit').addEventListener('click', goHome);
  $('vq-undo').addEventListener('click', undoLast);
  $('btn-vq-undo').addEventListener('click', undoLast);
  $('btn-vq-reset').addEventListener('click', () => {
    if (!confirm('Reset your scores and the questions’ flashcard progress?')) return;
    store.best = {};
    store.last = {};
    save(STORE_KEY, store);
    if (global.TokidokiSRS) global.TokidokiSRS.removeWhere(id => id.startsWith('vq:'));
    renderHome();
  });

  renderHome();
})(typeof window !== 'undefined' ? window : globalThis);
