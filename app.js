(function () {
  'use strict';

  // ─── SRS Engine ────────────────────────────────────────────────────────────────

  const SRS_KEY = 'tokidoki_srs';
  const STATS_KEY = 'tokidoki_stats';
  function loadSRS() {
    try { return JSON.parse(localStorage.getItem(SRS_KEY)) || {}; }
    catch { return {}; }
  }

  function loadStats() {
    const defaults = { totalReviews: 0, totalCorrect: 0, streak: 0, lastStudyDate: null, todayReviews: 0, todayCorrect: 0 };
    try {
      const saved = { ...defaults, ...JSON.parse(localStorage.getItem(STATS_KEY)) };
      return resetDailyIfNeeded(saved);
    }
    catch { return defaults; }
  }

  function resetDailyIfNeeded(stats) {
    const today = new Date().toISOString().slice(0, 10);
    if (stats.lastStudyDate !== today) {
      stats.todayReviews = 0;
      stats.todayCorrect = 0;
    }
    return stats;
  }

  function saveSRS(data) {
    localStorage.setItem(SRS_KEY, JSON.stringify(data));
  }

  function saveStats(data) {
    localStorage.setItem(STATS_KEY, JSON.stringify(data));
  }

  function deleteSRSCard(cardId) {
  }

  function cardId(verb, form) {
    const base = verb.disambig ? `${verb.reading}_${verb.disambig}` : verb.reading;
    return `${verb.chapter}_${base}_${form}`;
  }

  function getCardState(srs, id) {
    return srs[id] || {
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReview: 0,
    };
  }

  function gradeCard(state, grade) {
    const now = Date.now();
    const newState = { ...state };

    if (grade === 1) {
      newState.repetitions = 0;
      newState.interval = 0;
      newState.nextReview = now;
    } else {
      if (newState.repetitions === 0) {
        newState.interval = 1;
      } else if (newState.repetitions === 1) {
        newState.interval = 3;
      } else {
        const multiplier = grade === 3 ? newState.easeFactor : newState.easeFactor * 1.3;
        newState.interval = Math.round(newState.interval * multiplier);
      }
      newState.repetitions += 1;
      newState.easeFactor = Math.max(1.3,
        newState.easeFactor + (0.1 - (4 - grade) * (0.08 + (4 - grade) * 0.02))
      );
      newState.nextReview = now + newState.interval * 86400000;
    }

    return newState;
  }

  function isDue(state) {
    return Date.now() >= state.nextReview;
  }

  // ─── State ─────────────────────────────────────────────────────────────────────

  const SETTINGS_KEY = 'tokidoki_settings';

  function loadSettings() {
    const defaults = { typingMode: false, hideForm: true, showContext: true, englishToJapanese: true, showExampleFront: false, showFurigana: true, flashcardFurigana: true, adjSentences: false };
    let loaded;
    try { loaded = { ...defaults, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) }; }
    catch { loaded = { ...defaults }; }
    // formDisplay replaced the old hideForm checkbox: 'hidden' (no form shown),
    // 'color' (coloured badge only) or 'name' (colour + written-out form name).
    if (!FORM_DISPLAY_MODES.includes(loaded.formDisplay)) {
      loaded.formDisplay = loaded.hideForm ? 'color' : 'name';
    }
    return loaded;
  }

  const FORM_DISPLAY_MODES = ['hidden', 'color', 'name'];

  // Fills a form badge according to the form-display mode. `symbol` is the
  // ending shown next to the name, e.g. だ for an adjective sentence.
  function renderFormBadge(badge, fi, symbol, mode) {
    badge.style.cssText = '';
    badge.classList.toggle('hidden', mode === 'hidden');
    if (mode === 'hidden') {
      badge.innerHTML = '';
      return;
    }
    badge.innerHTML = mode === 'name'
      ? `${fi.name} <span class="form-symbol">(${symbol})</span>`
      : `<span class="form-symbol">?</span>`;
    badge.style.background = fi.color + '22';
    badge.style.color = fi.color;
    badge.style.borderColor = fi.color;
  }

  // Tints the card in the form's colour (or clears it when the form is hidden).
  function paintCardForm(form, fi, show) {
    const NEGATIVE_FORMS = new Set(['masu-neg', 'masu-past-neg', 'nai', 'nakatta', 'adj-neg', 'adj-past-neg']);
    const card = $('#card');
    if (show) {
      card.style.setProperty('--form-color', fi.color);
      card.style.borderLeftColor = fi.color;
    } else {
      card.style.removeProperty('--form-color');
      card.style.borderLeftColor = '';
    }
    card.classList.toggle('negative-form', show && NEGATIVE_FORMS.has(form));
  }

  function saveSettings(data) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
  }

  let settings = loadSettings();
  let srsData = loadSRS();
  let statsData = loadStats();
  let currentChapter = null;
  let studyMode = 'verbs';
  // For studyMode 'translate': which deck the sentences came from —
  // 'sentences' (sentences.html) or 'adjectives' (whole-sentence mode on
  // adjectives.html), so "Next 20" carries on with the same deck.
  let translateSource = 'sentences';
  let sessionCards = [];
  let sessionIndex = 0;
  let sessionCorrect = 0;
  // Whether the last typed answer was right — Enter on the answer side
  // grades it Good if so, Again if not.
  let lastTypedCorrect = false;
  let sessionTotal = 0;
  let currentCard = null;
  let answered = false;
  let undoStack = [];
  let saveTimeout = null;


  // ─── DOM refs ──────────────────────────────────────────────────────────────────

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const screens = {
    chapters: $('#screen-chapters'),
    study: $('#screen-study'),
    kana: $('#screen-kana'),
    'kanji-quiz': $('#screen-kanji-quiz'),
    confusable: $('#screen-confusable'),
    particles: $('#screen-particles'),
    story: $('#screen-story'),
    'story-review': $('#screen-story-review'),
    bunkei: $('#screen-bunkei'),
  };

  // ─── Theme ─────────────────────────────────────────────────────────────────────

  function initTheme() {
    const saved = localStorage.getItem('tokidoki_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('tokidoki_theme', next);
  }

  // ─── Streak ────────────────────────────────────────────────────────────────────

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function updateStreak() {
    const today = todayStr();
    if (statsData.lastStudyDate === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);

    if (statsData.lastStudyDate === yStr) {
      statsData.streak += 1;
    } else if (statsData.lastStudyDate !== today) {
      statsData.streak = 1;
    }
    statsData.lastStudyDate = today;
    saveStats(statsData);
  }

  // ─── Navigation ────────────────────────────────────────────────────────────────

  const VIEWPORT_DEFAULT = 'width=device-width, initial-scale=1.0';
  const VIEWPORT_NO_ZOOM = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';

  // ─── Coach marks (hand-drawn "look here" notes pointing at header buttons) ────

  let coachMarkEl = null;
  let coachMarkTimer = null;
  let consecutiveMisses = 0;
  let refHintShown = false;

  function hideCoachMark() {
    clearTimeout(coachMarkTimer);
    if (!coachMarkEl) return;
    const el = coachMarkEl;
    coachMarkEl = null;
    el.classList.remove('visible');
    setTimeout(() => el.remove(), 600);
  }

  function showCoachMark(targetSel, text) {
    const target = $(targetSel);
    if (!target) return;
    hideCoachMark();
    const rect = target.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = 'coach-mark';
    el.setAttribute('aria-hidden', 'true');
    el.style.left = `${rect.left + rect.width / 2 - 44}px`;
    el.style.top = `${rect.bottom - 2}px`;
    el.innerHTML = `
      <svg viewBox="0 0 56 44" width="56" height="44" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path class="coach-mark-line" d="M6 38 C 13 35, 22 33, 29 26 S 41 14, 44 7" />
        <path class="coach-mark-head" d="M37 11 L44.5 6.5 L45.5 15" />
      </svg>
      <span class="coach-mark-text">${text}</span>`;
    document.body.appendChild(el);
    coachMarkEl = el;
    requestAnimationFrame(() => el.classList.add('visible'));
    coachMarkTimer = setTimeout(hideCoachMark, 4500);
    target.addEventListener('click', hideCoachMark, { once: true });
    window.addEventListener('resize', hideCoachMark, { once: true });
  }

  // Other scripts (sync.js) use the same notes.
  window.TokidokiCoachMark = { show: showCoachMark, hide: hideCoachMark };

  function showScreen(name) {
    Object.values(screens).filter(Boolean).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');

    hideCoachMark();
    if (name === 'study') {
      consecutiveMisses = 0;
      refHintShown = false;
      showCoachMark('#btn-settings', 'settings here');
    }

    // Disable pinch/double-tap zoom only while the kana canvas is on screen —
    // it interferes with drawing but shouldn't limit zoom accessibility elsewhere.
    const viewportMeta = $('#viewport-meta');
    if (viewportMeta) viewportMeta.setAttribute('content', name === 'kana' ? VIEWPORT_NO_ZOOM : VIEWPORT_DEFAULT);

    const backBtn = $('#btn-back');
    const title = $('#header-title');

    if (name === 'chapters') {
      backBtn.classList.add('hidden');
      title.textContent = 'Tokidoki';
    } else if (name === 'study') {
      backBtn.classList.remove('hidden');
      title.textContent = studyMode === 'translate' ? 'Translate Sentences' : studyMode === 'custom' ? 'Custom Session' : (CHAPTER_INFO[currentChapter]?.title || 'Study');
    } else if (name === 'kana') {
      backBtn.classList.remove('hidden');
      title.textContent = 'Kana Practice';
    } else if (name === 'kanji-quiz') {
      backBtn.classList.remove('hidden');
      title.textContent = 'Kanji Quiz';
    } else if (name === 'confusable') {
      backBtn.classList.remove('hidden');
      title.textContent = 'Confusing Kanji';
    } else if (name === 'particles') {
      backBtn.classList.remove('hidden');
      title.textContent = 'Particle Quiz';
    } else if (name === 'story') {
      backBtn.classList.remove('hidden');
      title.textContent = readerIsMemes() ? 'Memes & Jokes' : 'Stories';
    } else if (name === 'story-review') {
      backBtn.classList.remove('hidden');
      title.textContent = 'Flashcards';
    } else if (name === 'bunkei') {
      backBtn.classList.remove('hidden');
      title.textContent = 'Bunkei';
    }
  }

  // ─── Chapter Select ────────────────────────────────────────────────────────────

  function renderChapters() {
    const g1 = $('#chapters-genki1');
    const g2 = $('#chapters-genki2');
    g1.innerHTML = '';
    g2.innerHTML = '';

    const chapters = getAllChapters();

    chapters.forEach(ch => {
      const info = CHAPTER_INFO[ch];
      const verbs = getVerbsByChapter(ch);
      const forms = Conjugator.getFormsForChapter(ch);

      let chapterCards = 0;
      let chapterReviewed = 0;
      let chapterDue = 0;

      verbs.forEach(v => {
        forms.forEach(f => {
          chapterCards++;
          const id = cardId(v, f);
          const state = getCardState(srsData, id);
          if (state.repetitions > 0) chapterReviewed++;
          if (isDue(state)) chapterDue++;
        });
      });

      const pct = chapterCards > 0 ? Math.round((chapterReviewed / chapterCards) * 100) : 0;

      const formPills = (info.newForms || []).map(f => {
        const fi = Conjugator.getFormInfo(f);
        return `<span class="form-pill" style="background:${fi.color}22;color:${fi.color}">${fi.symbol} ${fi.name}</span>`;
      }).join('');

      const card = document.createElement('div');
      card.className = 'chapter-card';
      card.innerHTML = `
        <div class="chapter-card-title">${info.title}</div>
        <div class="chapter-card-sub">${verbs.length} verbs &middot; ${forms.length} forms</div>
        ${formPills ? `<div class="chapter-card-forms">${formPills}</div>` : ''}
        <div class="chapter-progress"><div class="chapter-progress-fill" style="width:${pct}%"></div></div>
        ${chapterDue > 0 ? `<div class="chapter-card-due">${chapterDue} due</div>` : ''}
      `;
      card.addEventListener('click', () => startStudy(ch));

      if (info.book === 'Genki I') g1.appendChild(card);
      else g2.appendChild(card);
    });
  }

  function adjCardId(adj, form) {
    return `adj:${adj.reading}:${form}`;
  }

  // Whole-sentence cards for an adjective: one per form that has an example
  // sentence (Examples.build), translated English → Japanese.
  function adjSentenceCardId(adj, form) {
    return `adjsent:${adj.reading}:${form}`;
  }

  function adjSentenceCards(chapter) {
    const forms = Conjugator.getAdjFormsForChapter(chapter);
    const cards = [];
    getAdjectivesByChapter(chapter).forEach(a => {
      forms.forEach(f => {
        const conj = Conjugator.conjugateAdjective(a, f);
        const ex = Examples.build(a, f, conj);
        if (!ex) return;
        const fi = Conjugator.getFormInfo(f);
        cards.push({
          id: adjSentenceCardId(a, f),
          direction: 'en-to-ja',
          sentence: { ja: Examples.stripFurigana(ex.ja), jaHtml: Examples.furiganaHtml(ex.ja), en: ex.en },
          hint: `${a.kanji} (${a.meaning}) · ${fi.hint}`,
          refForm: f,
          // The ending for this adjective's type: 〜くない for い, 〜じゃない for な.
          formEnding: conj.slice(a.type === 'i-adj' ? a.reading.length - 1 : a.reading.length) || 'だ',
          verb: null,
          form: null,
        });
      });
    });
    return cards;
  }

  function startAdjSentenceStudy(chapter, cont) {
    studyMode = 'translate';
    translateSource = 'adjectives';
    currentChapter = chapter;
    const all = adjSentenceCards(chapter);
    if (all.length === 0) return;
    const due = all.filter(c => isDue(getCardState(srsData, c.id)));
    sessionCards = pickBatch(`adjsent:${chapter}`, due, all, cont);

    sessionIndex = 0;
    sessionCorrect = 0;
    sessionTotal = sessionCards.length;
    undoStack = [];

    showScreen('study');
    $('#session-complete').classList.add('hidden');
    $('#card').classList.remove('hidden');
    showCard();
  }

  function renderAdjModeToggle() {
    const sentences = !!settings.adjSentences;
    const word = $('#adj-mode-word');
    const sent = $('#adj-mode-sentences');
    if (word) word.checked = !sentences;
    if (sent) sent.checked = sentences;
  }

  function renderAdjChapters() {
    renderAdjModeToggle();
    const sentenceMode = !!settings.adjSentences;
    const g1 = $('#adj-chapters-genki1');
    const g2 = $('#adj-chapters-genki2');
    g1.innerHTML = '';
    g2.innerHTML = '';

    const chapters = getAllAdjChapters();

    chapters.forEach(ch => {
      const info = ADJ_CHAPTER_INFO[ch];
      const adjs = getAdjectivesByChapter(ch);
      const forms = Conjugator.getAdjFormsForChapter(ch);

      let chapterCards = 0;
      let chapterReviewed = 0;
      let chapterDue = 0;

      const ids = sentenceMode
        ? adjSentenceCards(ch).map(c => c.id)
        : adjs.flatMap(a => forms.map(f => adjCardId(a, f)));
      ids.forEach(id => {
        chapterCards++;
        const state = getCardState(srsData, id);
        if (state.repetitions > 0) chapterReviewed++;
        if (isDue(state)) chapterDue++;
      });

      const pct = chapterCards > 0 ? Math.round((chapterReviewed / chapterCards) * 100) : 0;

      const formPills = (info.newForms || []).map(f => {
        const fi = Conjugator.ADJ_FORM_INFO[f];
        return `<span class="form-pill" style="background:${fi.color}22;color:${fi.color}">${fi.symbol} ${fi.name}</span>`;
      }).join('');

      const iCount = adjs.filter(a => a.type === 'i-adj').length;
      const naCount = adjs.filter(a => a.type === 'na-adj').length;
      const typeSummary = [iCount && `${iCount} い`, naCount && `${naCount} な`].filter(Boolean).join(' · ');

      const card = document.createElement('div');
      card.className = 'chapter-card';
      card.innerHTML = `
        <div class="chapter-card-title">${info.title}</div>
        <div class="chapter-card-sub">${typeSummary} &middot; ${sentenceMode ? `${chapterCards} sentences` : `${forms.length} forms`}</div>
        ${formPills ? `<div class="chapter-card-forms">${formPills}</div>` : ''}
        <div class="chapter-progress"><div class="chapter-progress-fill" style="width:${pct}%"></div></div>
        ${chapterDue > 0 ? `<div class="chapter-card-due">${chapterDue} due</div>` : ''}
      `;
      card.addEventListener('click', () => (sentenceMode ? startAdjSentenceStudy(ch) : startAdjStudy(ch)));

      if (info.book === 'Genki I') g1.appendChild(card);
      else g2.appendChild(card);
    });
  }

  // ─── Hub (landing page linking out to each exercise page) ──────────────────────

  function countDueVerbs() {
    let due = 0;
    getAllChapters().forEach(ch => {
      const forms = Conjugator.getFormsForChapter(ch);
      getVerbsByChapter(ch).forEach(v => {
        forms.forEach(f => { if (isDue(getCardState(srsData, cardId(v, f)))) due++; });
      });
    });
    return due;
  }

  function countDueAdjectives() {
    let due = 0;
    getAllAdjChapters().forEach(ch => {
      const forms = Conjugator.getAdjFormsForChapter(ch);
      getAdjectivesByChapter(ch).forEach(a => {
        forms.forEach(f => { if (isDue(getCardState(srsData, adjCardId(a, f)))) due++; });
      });
    });
    return due;
  }

  function countDueKana() {
    let due = 0;
    KANA_DATA.hiragana.forEach(k => { if (isDue(getCardState(srsData, kanaCardId('hiragana', k.kana)))) due++; });
    KANA_DATA.katakana.forEach(k => { if (isDue(getCardState(srsData, kanaCardId('katakana', k.kana)))) due++; });
    return due;
  }

  // No countDueKanjiQuiz/hub badge: the quiz pool is 5 levels x 2 directions
  // (4000+ cards, mostly never studied), so a summed "due" count would dwarf
  // every other hub number and make the total meaningless. Build Your Own
  // has the same kind of open-ended pool and likewise skips a hub badge —
  // the kanji-quiz page itself shows a due count scoped to your own
  // level/direction selection, which is the number that's actually useful.

  function renderHub() {
    const verbDue = countDueVerbs();
    const adjDue = countDueAdjectives();
    const kanaDue = countDueKana();

    const setDue = (id, n) => { const el = $(id); if (el) el.textContent = n > 0 ? `${n} due` : ''; };
    setDue('#hub-due-verbs', verbDue);
    setDue('#hub-due-adjectives', adjDue);
    setDue('#hub-due-kana', kanaDue);
    setDue('#hub-due-flashcards', countDueStoryWords() + countDueKanjiCards());
  }

  // ─── Study Session ─────────────────────────────────────────────────────────────

  function startStudy(chapter, cont) {
    studyMode = 'verbs';
    currentChapter = chapter;
    const verbs = getVerbsByChapter(chapter);
    const forms = Conjugator.getFormsForChapter(chapter);

    const all = [];
    verbs.forEach(v => {
      forms.forEach(f => all.push({ verb: v, form: f, id: cardId(v, f) }));
    });
    const due = all.filter(c => isDue(getCardState(srsData, c.id)));
    sessionCards = pickBatch(`verbs:${chapter}`, due, all, cont);

    sessionIndex = 0;
    sessionCorrect = 0;
    sessionTotal = sessionCards.length;
    undoStack = [];

    showScreen('study');
    $('#session-complete').classList.add('hidden');
    $('#card').classList.remove('hidden');
    showCard();
  }

  function startAdjStudy(chapter, cont) {
    studyMode = 'adjectives';
    currentChapter = chapter;
    const adjs = getAdjectivesByChapter(chapter);
    const forms = Conjugator.getAdjFormsForChapter(chapter);

    const all = [];
    adjs.forEach(a => {
      forms.forEach(f => all.push({ verb: a, form: f, id: adjCardId(a, f) }));
    });
    const due = all.filter(c => isDue(getCardState(srsData, c.id)));
    sessionCards = pickBatch(`adjectives:${chapter}`, due, all, cont);

    sessionIndex = 0;
    sessionCorrect = 0;
    sessionTotal = sessionCards.length;
    undoStack = [];

    showScreen('study');
    $('#session-complete').classList.add('hidden');
    $('#card').classList.remove('hidden');
    showCard();
  }

  function flashSaveIndicator() {
    // Query scoped to the active screen first: pages with more than one
    // study-like screen (e.g. kanji-quiz.html's flashcard and Confusing
    // Kanji screens) each carry their own .save-indicator element, since
    // only one can be visible at a time.
    const el = document.querySelector('.screen.active .save-indicator') || $('#save-indicator');
    if (!el) return;
    // Only ever toggle opacity (via .show), never display — the element
    // keeps its layout space at all times so the page doesn't shift when
    // the message fades out.
    el.classList.add('show');
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      el.classList.remove('show');
    }, 1200);
  }

  function updateUndoButton() {
    const btn = $('#btn-undo');
    if (undoStack.length > 0) {
      btn.classList.remove('hidden');
    } else {
      btn.classList.add('hidden');
    }
  }

  function getContextExample(meaning, form) {
    return Examples.hint(meaning, form);
  }

  function highlightKeywords(text) {
    return text.replace(/\b(don't|didn't|not|wasn't|weren't)\b/gi, '<span class="neg-highlight">$1</span>');
  }


  function showCard() {
    if (sessionIndex >= sessionCards.length) {
      finishSession();
      return;
    }

    if (studyMode === 'translate') {
      showTranslateCard();
      return;
    }

    answered = false;
    currentCard = sessionCards[sessionIndex];
    const { verb, form } = currentCard;
    const fi = Conjugator.getFormInfo(form);

    const pct = (sessionIndex / sessionTotal) * 100;
    $('#study-bar-fill').style.width = pct + '%';
    $('#study-progress-text').textContent = `${sessionIndex + 1} / ${sessionTotal}`;

    $('#card-front').classList.remove('hidden');
    $('#card-back').classList.add('hidden');

    paintCardForm(form, fi, settings.formDisplay !== 'hidden');
    renderFormBadge($('#card-form-badge'), fi, fi.symbol, settings.formDisplay);

    const kanjiEl = $('#card-kanji');
    kanjiEl.classList.remove('translate-source-ja', 'translate-source-en');
    const readingEl = $('#card-reading');
    const meaningEl = $('#card-meaning');
    const ctxEl = $('#card-context');

    if (settings.englishToJapanese) {
      kanjiEl.classList.add('hidden');
      readingEl.classList.add('hidden');
      meaningEl.classList.add('hidden');
      $('#card-prompt').textContent = '';

      ctxEl.innerHTML = highlightKeywords(getContextExample(verb.meaning, form));
      ctxEl.classList.remove('hidden');
      ctxEl.classList.add('context-prominent');
    } else {
      kanjiEl.classList.remove('hidden');
      readingEl.classList.remove('hidden');
      meaningEl.classList.remove('hidden');
      kanjiEl.textContent = verb.kanji;
      readingEl.textContent = verb.reading;
      meaningEl.textContent = verb.meaning;
      $('#card-prompt').textContent = `→ ${fi.hint}`;

      ctxEl.classList.remove('context-prominent');
      if (settings.showContext) {
        ctxEl.innerHTML = highlightKeywords(getContextExample(verb.meaning, form));
        ctxEl.classList.remove('hidden');
      } else {
        ctxEl.classList.add('hidden');
      }
    }

    $('#hint-area').classList.add('hidden');
    $('#hint-area').innerHTML = '';

    const exFrontEl = $('#card-example-sentence-front');
    if (settings.showExampleFront) {
      const exFront = getExampleSentenceForFront(verb, form);
      if (exFront) {
        exFrontEl.innerHTML = `<div class="example-label">Example</div>`
          + `<div class="example-jp">${exampleJaHtml(exFront.ja)}</div>`
          + `<div class="example-en">${highlightKeywords(exFront.en)}</div>`;
        exFrontEl.classList.remove('hidden');
      } else {
        exFrontEl.classList.add('hidden');
        exFrontEl.innerHTML = '';
      }
    } else {
      exFrontEl.classList.add('hidden');
      exFrontEl.innerHTML = '';
    }

    if (settings.typingMode) {
      $('#reveal-area').classList.add('hidden');
      $('#typing-area').classList.remove('hidden');
      $('#btn-hint-typing').classList.remove('hidden');
      const input = $('#answer-input');
      input.value = '';
      input.className = 'answer-input';
      input.lang = 'ja';
      if (window.Speech) Speech.stopAll();
      input.focus();
    } else {
      $('#reveal-area').classList.remove('hidden');
      $('#typing-area').classList.add('hidden');
      $('#btn-hint').classList.remove('hidden');
      $('#key-capture').focus();
    }

    updateUndoButton();
  }

  function isAdjCard(card) {
    return card.verb.type === 'i-adj' || card.verb.type === 'na-adj';
  }

  function getCorrectAnswer(card) {
    const { verb, form } = card;
    const isAdj = studyMode === 'adjectives' || (studyMode === 'custom' && isAdjCard(card));
    const hiragana = isAdj
      ? Conjugator.conjugateAdjective(verb, form)
      : Conjugator.conjugate(verb, form);
    const kanji = Conjugator.conjugateKanji(verb, form);
    const answers = [hiragana];
    if (kanji && kanji !== hiragana) answers.push(kanji);
    return answers;
  }

  function checkAnswer() {
    if (answered) return;

    if (studyMode === 'translate') {
      revealTranslateAnswer(Romaji.flush($('#answer-input')).trim());
      return;
    }

    if (window.Speech) Speech.stopAll();
    const userAnswer = Romaji.flush($('#answer-input')).trim();
    const correct = getCorrectAnswer(currentCard);

    revealAnswer(userAnswer, correct);
  }

  function showAnswer() {
    if (answered) return;
    if (studyMode === 'translate') {
      revealTranslateAnswer();
      return;
    }
    const correct = getCorrectAnswer(currentCard);
    revealAnswer('', correct);
  }

  function toggleHint() {
    if (answered || !currentCard || studyMode === 'translate') return;
    const hintEl = $('#hint-area');
    if (!hintEl.classList.contains('hidden')) {
      hintEl.classList.add('hidden');
      focusCardInput();
      return;
    }

    const { verb, form } = currentCard;
    const fi = Conjugator.getFormInfo(form);
    let steps = [];

    steps.push(`The word is <strong>${verb.kanji}</strong> (${verb.reading}) — ${verb.meaning}`);

    const hintIsAdj = studyMode === 'adjectives' || (studyMode === 'custom' && isAdjCard(currentCard));
    if (hintIsAdj) {
      const typeLabel = verb.type === 'i-adj' ? 'い-adjective' : 'な-adjective';
      steps.push(`This is a <strong>${typeLabel}</strong>`);

      if (verb.type === 'i-adj') {
        const isIrregular = verb.reading === 'いい' || verb.reading === 'かっこいい';
        if (isIrregular) {
          steps.push(`${verb.reading} is <strong>irregular</strong> — it uses a different stem`);
        }
        if (form !== 'adj-present') {
          steps.push(`For い-adjectives: drop the final い, then add the ${fi.name} suffix`);
        } else {
          steps.push(`The present form is the dictionary form — no change needed`);
        }
      } else {
        if (form === 'adj-present') {
          steps.push(`For な-adjectives: add <strong>だ</strong> for the plain present`);
        } else {
          steps.push(`For な-adjectives: add the appropriate suffix directly to the stem`);
        }
      }
    } else {
      const typeLabels = { 'u': 'U-verb (五段)', 'ru': 'Ru-verb (一段)', 'irregular': 'Irregular verb' };
      steps.push(`This is a <strong>${typeLabels[verb.type] || verb.type}</strong>`);

      if (verb.type === 'ru') {
        steps.push(`Ru-verbs: drop <strong>る</strong> from the end, then add the suffix`);
      } else if (verb.type === 'u') {
        const ending = verb.reading.slice(-1);
        steps.push(`The dictionary form ends in <strong>${ending}</strong>`);

        if (['masu', 'masu-neg', 'masu-past', 'masu-past-neg', 'tai'].includes(form)) {
          steps.push(`For this form: change the ending to the <strong>い-row</strong> (い-column), then add the suffix`);
        } else if (['te', 'ta'].includes(form)) {
          steps.push(`For て/た-form: the rule depends on the final kana — think about the sound change group`);
        } else if (['nai', 'nakatta', 'passive', 'causative', 'causative-passive'].includes(form)) {
          steps.push(`For this form: change the ending to the <strong>あ-row</strong>, then add the suffix`);
        } else if (['potential', 'ba'].includes(form)) {
          steps.push(`For this form: change the ending to the <strong>え-row</strong>, then add the suffix`);
        } else if (form === 'volitional') {
          steps.push(`For this form: change the ending to the <strong>お-row</strong>, then add う`);
        } else if (form === 'dict') {
          steps.push(`The dictionary form is the word as-is — no change needed`);
        }
      } else {
        const isSuru = verb.reading === 'する' || verb.reading.endsWith('する');
        const isKuru = verb.reading === 'くる' || verb.reading.endsWith('くる');
        if (isSuru) steps.push(`する verbs have their own conjugation pattern`);
        else if (isKuru) steps.push(`くる has its own irregular conjugation pattern`);
        else steps.push(`Think about which irregular pattern this verb follows`);
      }
    }

    steps.push(`Target form: <strong>${fi.name}</strong> (${fi.symbol}) — ${fi.hint}`);

    hintEl.innerHTML = `<div class="hint-label">Hint</div>` + steps.map(s => `<div class="hint-step">→ ${s}</div>`).join('');
    hintEl.classList.remove('hidden');
    focusCardInput();
  }

  // Back to the answer box in typing mode (so a hint doesn't pull focus
  // away mid-answer), or the hidden key catcher otherwise.
  function focusCardInput() {
    if (settings.typingMode) $('#answer-input').focus();
    else $('#key-capture').focus();
  }

  // ─── Explanation Generator ───────────────────────────────────────────────────

  const FORM_SUFFIX_LABEL = {
    'masu': 'ます', 'masu-neg': 'ません', 'masu-past': 'ました', 'masu-past-neg': 'ませんでした',
    'te': 'て', 'ta': 'た', 'nai': 'ない', 'nakatta': 'なかった', 'dict': '',
    'tai': 'たい', 'potential': '', 'volitional': '', 'passive': '',
    'causative': '', 'causative-passive': '', 'ba': '',
  };

  const U_TE_RULES = {
    'う': { te: 'って', ta: 'った', desc: 'う → って' },
    'つ': { te: 'って', ta: 'った', desc: 'つ → って' },
    'る': { te: 'って', ta: 'った', desc: 'る → って' },
    'む': { te: 'んで', ta: 'んだ', desc: 'む → んで' },
    'ぶ': { te: 'んで', ta: 'んだ', desc: 'ぶ → んで' },
    'ぬ': { te: 'んで', ta: 'んだ', desc: 'ぬ → んで' },
    'く': { te: 'いて', ta: 'いた', desc: 'く → いて' },
    'ぐ': { te: 'いで', ta: 'いだ', desc: 'ぐ → いで' },
    'す': { te: 'して', ta: 'した', desc: 'す → して' },
  };

  const I_ROW = { 'う':'い', 'つ':'ち', 'る':'り', 'む':'み', 'ぶ':'び', 'ぬ':'に', 'く':'き', 'ぐ':'ぎ', 'す':'し' };
  const A_ROW = { 'う':'わ', 'つ':'た', 'る':'ら', 'む':'ま', 'ぶ':'ば', 'ぬ':'な', 'く':'か', 'ぐ':'が', 'す':'さ' };
  const E_ROW = { 'う':'え', 'つ':'て', 'る':'れ', 'む':'め', 'ぶ':'べ', 'ぬ':'ね', 'く':'け', 'ぐ':'げ', 'す':'せ' };
  const O_ROW = { 'う':'お', 'つ':'と', 'る':'ろ', 'む':'も', 'ぶ':'ぼ', 'ぬ':'の', 'く':'こ', 'ぐ':'ご', 'す':'そ' };

  function getExplanation(verb, form, result) {
    const { reading, type, kanji } = verb;
    const isIku = reading.endsWith('いく') || reading.endsWith('ゆく');

    if (type === 'irregular') {
      return getIrregularExplanation(verb, form, result);
    }
    if (type === 'ru') {
      return getRuExplanation(verb, form, result);
    }
    return getUExplanation(verb, form, result, isIku);
  }

  function getRuExplanation(verb, form, result) {
    const stem = verb.reading.slice(0, -1);
    const label = `<strong>Ru-verb:</strong> drop <span class="ex-hl">る</span> from ${verb.reading}`;
    const suffixes = {
      'masu':'ます', 'masu-neg':'ません', 'masu-past':'ました', 'masu-past-neg':'ませんでした',
      'te':'て', 'ta':'た', 'nai':'ない', 'nakatta':'なかった', 'tai':'たい',
      'potential':'られる', 'volitional':'よう', 'passive':'られる',
      'causative':'させる', 'causative-passive':'させられる', 'ba':'れば',
    };

    if (form === 'dict') return buildExplanation('<strong>Ru-verb:</strong> dictionary form is the plain form', `→ ${verb.reading} (no change)`);
    const suffix = suffixes[form];
    if (!suffix) return '';
    return buildExplanation(label, `→ ${hlResult(stem, suffix)}`);
  }

  function hlResult(base, hl) {
    return `${base}<span class="ex-hl">${hl}</span>`;
  }

  function getUExplanation(verb, form, result, isIku) {
    const reading = verb.reading;
    const ending = reading.slice(-1);
    const base = reading.slice(0, -1);

    switch (form) {
      case 'masu':
      case 'masu-neg':
      case 'masu-past':
      case 'masu-past-neg':
      case 'tai': {
        const iForm = I_ROW[ending];
        const suffix = { 'masu':'ます', 'masu-neg':'ません', 'masu-past':'ました', 'masu-past-neg':'ませんでした', 'tai':'たい' }[form];
        const label = `<strong>U-verb:</strong> change <span class="ex-hl">${ending}</span> to <span class="ex-hl">${iForm}</span> (い-row)`;
        return buildExplanation(label, `→ ${hlResult(base, iForm + suffix)}`);
      }
      case 'te':
      case 'ta': {
        if (isIku) {
          const prefix = reading.slice(0, -2);
          const label = `<strong>U-verb (いく):</strong> special rule — いく uses <span class="ex-hl">いって/いった</span>`;
          const teForm = form === 'te' ? 'いって' : 'いった';
          return buildExplanation(label, `→ ${hlResult(prefix, teForm)}`);
        }
        const rule = U_TE_RULES[ending];
        const label = `<strong>U-verb:</strong> ${form === 'te' ? 'て' : 'た'}-form rule for <span class="ex-hl">${ending}</span>: ${rule.desc.replace(ending, `<span class="ex-hl">${ending}</span>`)}`;
        const teForm = form === 'te' ? rule.te : rule.ta;
        return buildExplanation(label, `→ ${hlResult(base, teForm)}`);
      }
      case 'nai':
      case 'nakatta': {
        const aForm = A_ROW[ending];
        const suffix = form === 'nai' ? 'ない' : 'なかった';
        const label = `<strong>U-verb:</strong> change <span class="ex-hl">${ending}</span> to <span class="ex-hl">${aForm}</span> (あ-row)`;
        return buildExplanation(label, `→ ${hlResult(base, aForm + suffix)}`);
      }
      case 'dict': {
        return buildExplanation('<strong>U-verb:</strong> dictionary form is the plain form', `→ ${reading} (no change)`);
      }
      case 'potential': {
        const eForm = E_ROW[ending];
        const label = `<strong>U-verb:</strong> change <span class="ex-hl">${ending}</span> to <span class="ex-hl">${eForm}</span> (え-row)`;
        return buildExplanation(label, `→ ${hlResult(base, eForm + 'る')}`);
      }
      case 'volitional': {
        const oForm = O_ROW[ending];
        const label = `<strong>U-verb:</strong> change <span class="ex-hl">${ending}</span> to <span class="ex-hl">${oForm}</span> (お-row)`;
        return buildExplanation(label, `→ ${hlResult(base, oForm + 'う')}`);
      }
      case 'passive': {
        const aForm = A_ROW[ending];
        const label = `<strong>U-verb:</strong> change <span class="ex-hl">${ending}</span> to <span class="ex-hl">${aForm}</span> (あ-row)`;
        return buildExplanation(label, `→ ${hlResult(base, aForm + 'れる')}`);
      }
      case 'causative': {
        const aForm = A_ROW[ending];
        const label = `<strong>U-verb:</strong> change <span class="ex-hl">${ending}</span> to <span class="ex-hl">${aForm}</span> (あ-row)`;
        return buildExplanation(label, `→ ${hlResult(base, aForm + 'せる')}`);
      }
      case 'causative-passive': {
        const aForm = A_ROW[ending];
        const label = `<strong>U-verb:</strong> change <span class="ex-hl">${ending}</span> to <span class="ex-hl">${aForm}</span> (あ-row)`;
        return buildExplanation(label, `→ ${hlResult(base, aForm + 'せられる')}`);
      }
      case 'ba': {
        const eForm = E_ROW[ending];
        const label = `<strong>U-verb:</strong> change <span class="ex-hl">${ending}</span> to <span class="ex-hl">${eForm}</span> (え-row)`;
        return buildExplanation(label, `→ ${hlResult(base, eForm + 'ば')}`);
      }
      default: return '';
    }
  }

  function getIrregularExplanation(verb, form, result) {
    const reading = verb.reading;
    const isSuru = reading === 'する' || reading.endsWith('する');
    const isKuru = reading === 'くる' || reading.endsWith('くる');

    if (isSuru) {
      const prefix = reading.slice(0, -2);
      const label = `<strong>Irregular (する):</strong> する has unique conjugation stems`;

      const stems = {
        'masu': 'し', 'masu-neg': 'し', 'masu-past': 'し', 'masu-past-neg': 'し',
        'te': 'し', 'ta': 'し', 'nai': 'し', 'nakatta': 'し',
        'tai': 'し', 'potential': 'でき', 'volitional': 'し', 'passive': 'さ',
        'causative': 'さ', 'causative-passive': 'さ', 'ba': 'す',
      };
      const suffixes = {
        'masu': 'ます', 'masu-neg': 'ません', 'masu-past': 'ました', 'masu-past-neg': 'ませんでした',
        'te': 'て', 'ta': 'た', 'nai': 'ない', 'nakatta': 'なかった',
        'dict': '', 'tai': 'たい', 'potential': 'る', 'volitional': 'よう',
        'passive': 'れる', 'causative': 'せる', 'causative-passive': 'せられる', 'ba': 'れば',
      };

      if (form === 'dict') return buildExplanation(label, `→ ${reading} (no change)`);

      const stem = stems[form] || 'し';
      const suffix = suffixes[form] || '';
      return buildExplanation(label, `→ ${hlResult(prefix, stem + suffix)}`);
    }

    if (isKuru) {
      const prefix = reading.slice(0, -2);
      const label = `<strong>Irregular (くる):</strong> くる changes its vowel`;

      const stemMap = {
        'masu': 'き', 'masu-neg': 'き', 'masu-past': 'き', 'masu-past-neg': 'き',
        'te': 'き', 'ta': 'き', 'tai': 'き',
        'nai': 'こ', 'nakatta': 'こ', 'potential': 'こられ', 'volitional': 'こ',
        'passive': 'こられ', 'causative': 'こさせ', 'causative-passive': 'こさせられ', 'ba': 'く',
      };
      const suffixes = {
        'masu': 'ます', 'masu-neg': 'ません', 'masu-past': 'ました', 'masu-past-neg': 'ませんでした',
        'te': 'て', 'ta': 'た', 'tai': 'たい',
        'nai': 'ない', 'nakatta': 'なかった', 'potential': 'る', 'volitional': 'よう',
        'passive': 'る', 'causative': 'る', 'causative-passive': 'る', 'ba': 'れば',
      };

      if (form === 'dict') return buildExplanation(label, `→ ${reading} (no change)`);

      const stem = stemMap[form] || 'き';
      const suffix = suffixes[form] || '';
      return buildExplanation(label, `→ ${hlResult(prefix, stem + suffix)}`);
    }

    return '';
  }

  function getAdjExplanation(adj, form, result) {
    const { reading, type } = adj;

    if (type === 'i-adj') {
      const isIi = reading === 'いい';
      const isKakkoii = reading === 'かっこいい';

      if (isIi || isKakkoii) {
        const baseStem = isIi ? 'よ' : 'かっこよ';
        const label = `<strong>い-adjective (irregular):</strong> ${reading} uses ${baseStem}- stem for conjugations`;
        const irrSuffixes = { 'adj-neg':'くない', 'adj-past':'かった', 'adj-past-neg':'くなかった', 'adj-te':'くて', 'adj-adverb':'く' };
        if (form === 'adj-present') return buildExplanation(label, `→ ${reading} (no change)`);
        return buildExplanation(label, `→ ${hlResult(baseStem, irrSuffixes[form])}`);
      }

      const stem = reading.slice(0, -1);
      const label = `<strong>い-adjective:</strong> drop <span class="ex-hl">い</span> from ${reading}`;
      const iSuffixes = { 'adj-neg':'くない', 'adj-past':'かった', 'adj-past-neg':'くなかった', 'adj-te':'くて', 'adj-adverb':'く' };
      if (form === 'adj-present') return buildExplanation(`<strong>い-adjective:</strong> dictionary form`, `→ ${reading} (no change)`);
      return buildExplanation(label, `→ ${hlResult(stem, iSuffixes[form])}`);
    }

    if (type === 'na-adj') {
      const label = `<strong>な-adjective:</strong> add suffix to ${reading}`;
      const naSuffixes = { 'adj-present':'だ', 'adj-neg':'じゃない', 'adj-past':'だった', 'adj-past-neg':'じゃなかった', 'adj-te':'で', 'adj-adverb':'に' };
      return buildExplanation(label, `→ ${hlResult(reading, naSuffixes[form])}`);
    }

    return '';
  }

  function exampleJaHtml(ja) {
    return settings.showFurigana ? Examples.furiganaHtml(ja) : Examples.stripFurigana(ja);
  }

  function getExampleSentence(verb, form, conjugated) {
    return Examples.build(verb, form, conjugated);
  }

  function getExampleSentenceForFront(verb, form) {
    return Examples.build(verb, form, null);
  }

  function buildExplanation(rule, steps) {
    return `<div class="ex-rule">${rule}</div><div class="ex-steps">${steps}</div>`;
  }

  function getStemForDisplay(card) {
    const { verb, form } = card;
    const isAdj = studyMode === 'adjectives' || (studyMode === 'custom' && isAdjCard(card));

    if (isAdj) {
      if (verb.type === 'i-adj') {
        if (form === 'adj-present') return null;
        if (verb.reading === 'いい') return 'よ';
        if (verb.reading === 'かっこいい') return 'かっこよ';
        return verb.reading.slice(0, -1);
      }
      if (verb.type === 'na-adj') {
        return verb.reading;
      }
      return null;
    }

    if (verb.type === 'ru') {
      if (form === 'dict') return null;
      return verb.reading.slice(0, -1);
    }

    if (verb.type === 'u') {
      if (form === 'dict') return null;
      const ending = verb.reading.slice(-1);
      const base = verb.reading.slice(0, -1);
      if (['masu', 'masu-neg', 'masu-past', 'masu-past-neg', 'tai'].includes(form)) return base + I_ROW[ending];
      if (['nai', 'nakatta', 'passive', 'causative', 'causative-passive'].includes(form)) return base + A_ROW[ending];
      if (['potential', 'ba'].includes(form)) return base + E_ROW[ending];
      if (form === 'volitional') return base + O_ROW[ending];
      if (form === 'te' || form === 'ta') {
        if (verb.reading.endsWith('いく') || verb.reading.endsWith('ゆく')) return verb.reading.slice(0, -2) + 'い';
        const rule = U_TE_RULES[ending];
        if (!rule) return null;
        const suffix = form === 'te' ? rule.te : rule.ta;
        return base + suffix.slice(0, -1);
      }
      return null;
    }

    if (verb.type === 'irregular') {
      const reading = verb.reading;
      const isSuru = reading === 'する' || reading.endsWith('する');
      const isKuru = reading === 'くる' || reading.endsWith('くる') || reading === 'きる';

      if (form === 'dict') return null;

      if (isSuru) {
        return reading.slice(0, -2);
      }

      if (isKuru) {
        return reading.slice(0, -2);
      }
    }

    return null;
  }

  function getUnchangedBaseForDisplay(card) {
    const { verb, form } = card;
    const isAdj = studyMode === 'adjectives' || (studyMode === 'custom' && isAdjCard(card));
    if (isAdj) return null;
    if (verb.type === 'u' && form !== 'dict') {
      return verb.reading.slice(0, -1);
    }
    return null;
  }

  function formatConjugatedWithStem(card, correct) {
    const stem = getStemForDisplay(card);
    if (!stem || !correct.startsWith(stem) || stem.length >= correct.length) {
      return correct;
    }

    const ending = correct.slice(stem.length);
    const unchangedBase = getUnchangedBaseForDisplay(card);
    if (unchangedBase !== null && stem.startsWith(unchangedBase) && unchangedBase.length < stem.length) {
      const changedChar = stem.slice(unchangedBase.length);
      return `<span class="conjugation-stem">${unchangedBase}</span><span class="conjugation-changed">${changedChar}</span><span class="conjugation-ending">${ending}</span>`;
    }
    return `<span class="conjugation-stem">${stem}</span><span class="conjugation-ending">${ending}</span>`;
  }

  function revealAnswer(userAnswer, correctAnswers) {
    answered = true;

    const correct = Array.isArray(correctAnswers) ? correctAnswers[0] : correctAnswers;

    if (settings.typingMode) {
      const input = $('#answer-input');
      const isCorrect = Array.isArray(correctAnswers)
        ? correctAnswers.some(a => normalize(userAnswer) === normalize(a))
        : normalize(userAnswer) === normalize(correct);
      input.className = 'answer-input ' + (userAnswer ? (isCorrect ? 'correct' : 'incorrect') : '');
      input.blur();

      $('#result-icon').textContent = isCorrect ? '✓' : '✗';
      $('#result-icon').style.color = isCorrect ? 'var(--green)' : 'var(--red)';
      $('#result-icon').classList.remove('hidden');
      $('#result-row-user').classList.remove('hidden');
      $('#user-answer').textContent = userAnswer || '(skipped)';
      $('#user-answer').style.color = isCorrect ? 'var(--green)' : 'var(--red)';

      if (isCorrect) sessionCorrect++;
      lastTypedCorrect = isCorrect;
    } else {
      $('#result-icon').classList.add('hidden');
      $('#result-row-user').classList.add('hidden');
    }

    $('#key-capture').focus();

    $('#card-front').classList.add('hidden');
    $('#card-back').classList.remove('hidden');
    $('#correct-answer').parentElement.classList.remove('hidden');

    $('#card-reading-back').classList.remove('hidden');
    $('#card-meaning-back').classList.remove('hidden');
    $('#card-conjugated').classList.remove('hidden');
    $('#card-explanation').classList.remove('hidden');
    $('#hint-area-back').classList.remove('hidden');
    $('.result-area').classList.remove('hidden');

    const fi = Conjugator.getFormInfo(currentCard.form);
    // The answer side always reveals the form.
    paintCardForm(currentCard.form, fi, true);
    renderFormBadge($('#card-form-badge-back'), fi, fi.symbol, 'name');

    const kanjiBack = $('#card-kanji-back');
    kanjiBack.textContent = currentCard.verb.kanji;
    kanjiBack.classList.remove('translate-source-ja', 'translate-source-en');
    $('#card-reading-back').textContent = currentCard.verb.reading;
    $('#card-meaning-back').textContent = currentCard.verb.meaning;
    const conjugated = $('#card-conjugated');
    conjugated.innerHTML = formatConjugatedWithStem(currentCard, correct);
    conjugated.style.color = fi.color;
    $('#correct-answer').textContent = correct;
    showAnswerDiff(userAnswer, correctAnswers);
    $('#card-hint-explanation').textContent = fi.hint;

    const isAdj = studyMode === 'adjectives' || (studyMode === 'custom' && isAdjCard(currentCard));
    const explanation = isAdj
      ? getAdjExplanation(currentCard.verb, currentCard.form, correct)
      : getExplanation(currentCard.verb, currentCard.form, correct);
    $('#card-explanation').innerHTML = explanation;

    // Copy hint content to answer page if it was shown
    const hintAreaBack = $('#hint-area-back');
    const hintAreaFront = $('#hint-area');
    if (hintAreaFront.innerHTML && !hintAreaFront.classList.contains('hidden')) {
      hintAreaBack.innerHTML = hintAreaFront.innerHTML;
      hintAreaBack.classList.remove('hidden');
    } else {
      hintAreaBack.innerHTML = '';
      hintAreaBack.classList.add('hidden');
    }

    const exSentence = getExampleSentence(currentCard.verb, currentCard.form, correct);
    const exEl = $('#card-example-sentence');
    if (exSentence) {
      exEl.innerHTML = `<div class="example-label">Example</div>`
        + `<div class="example-jp">${exampleJaHtml(exSentence.ja)}</div>`
        + `<div class="example-en">${highlightKeywords(exSentence.en)}</div>`;
    } else {
      exEl.innerHTML = '';
    }
  }

  function normalize(str) {
    return str.replace(/\s/g, '').normalize('NFKC');
  }

  // A wrong typed answer gets a character diff: the typed characters that
  // were off are marked on "Your answer", the ones it should have had on
  // "Correct" (diffed against whichever accepted answer is closest).
  function showAnswerDiff(userAnswer, correctAnswers) {
    if (!settings.typingMode || !userAnswer || !window.AnswerDiff) return;
    const answers = Array.isArray(correctAnswers) ? correctAnswers : [correctAnswers];
    if (answers.some(a => normalize(userAnswer) === normalize(a))) return;
    const target = AnswerDiff.closest(userAnswer, answers);
    const d = AnswerDiff.diff(userAnswer, target);
    $('#user-answer').innerHTML = AnswerDiff.toHtml(d.typed, 'diff-wrong');
    $('#user-answer').style.color = '';
    $('#correct-answer').innerHTML = AnswerDiff.toHtml(d.expected, 'diff-missing');
  }

  function gradeAndAdvance(grade) {
    if (!currentCard) return;

    const prevSrsState = srsData[currentCard.id] ? { ...srsData[currentCard.id] } : null;
    const prevStats = { ...statsData };

    undoStack.push({
      cardId: currentCard.id,
      prevSrsState,
      prevStats,
      sessionIndex,
      sessionCorrect,
      sessionTotal,
      grade,
      wasReAdded: grade === 1,
    });

    const state = getCardState(srsData, currentCard.id);
    const newState = gradeCard(state, grade);
    srsData[currentCard.id] = newState;
    saveSRS(srsData);

    statsData.totalReviews++;
    statsData.todayReviews++;
    if (grade >= 3) {
      statsData.totalCorrect++;
      statsData.todayCorrect++;
    }
    updateStreak();
    saveStats(statsData);

    if (!settings.typingMode && grade >= 3) {
      sessionCorrect++;
    }

    flashSaveIndicator();

    if (grade === 1) {
      sessionCards.push({ ...currentCard });
      sessionTotal++;
    }

    consecutiveMisses = grade === 1 ? consecutiveMisses + 1 : 0;
    if (consecutiveMisses >= 2 && !refHintShown) {
      refHintShown = true;
      showCoachMark('#btn-ref', 'explanation here');
    }

    sessionIndex++;
    showCard();
  }

  function undoLastGrade() {
    if (undoStack.length === 0) return;

    const undo = undoStack.pop();

    if (undo.prevSrsState) {
      srsData[undo.cardId] = undo.prevSrsState;
      saveSRS(srsData);
    } else {
      delete srsData[undo.cardId];
      saveSRS(srsData);
      deleteSRSCard(undo.cardId);
    }

    statsData = { ...undo.prevStats };
    saveStats(statsData);

    if (undo.wasReAdded) {
      sessionCards.pop();
    }

    sessionIndex = undo.sessionIndex;
    sessionCorrect = undo.sessionCorrect;
    sessionTotal = undo.sessionTotal;

    $('#session-complete').classList.add('hidden');
    $('#card').classList.remove('hidden');

    showCard();
    flashSaveIndicator();
  }

  function finishSession() {
    // Clear these so stale keyboard state (e.g. a leftover "answered")
    // can't silently re-grade the last card if a shortcut key is pressed
    // on the session-complete screen before "Back to Chapters" is clicked.
    answered = false;
    currentCard = null;

    $('#card').classList.add('hidden');
    const complete = $('#session-complete');
    complete.classList.remove('hidden');

    $('#session-total').textContent = sessionIndex;
    $('#session-correct').textContent = sessionCorrect;
    const acc = sessionIndex > 0 ? Math.round((sessionCorrect / sessionIndex) * 100) : 0;
    $('#session-accuracy').textContent = acc + '%';

    const chapter = currentChapter;
    if (studyMode === 'translate' && translateSource === 'adjectives') {
      setContinueButton('#btn-session-continue', 'Next 20 →', () => startAdjSentenceStudy(chapter, true));
    } else if (studyMode === 'translate') {
      const next = TRANSLATE_SENTENCES[chapter + 1] ? chapter + 1 : null;
      setContinueButton('#btn-session-continue', next ? `Next 20: Chapter ${next} →` : 'Again ↻',
        () => startTranslateStudy(next || chapter));
    } else if (studyMode === 'verbs') {
      setContinueButton('#btn-session-continue', 'Next 20 →', () => startStudy(chapter, true));
    } else if (studyMode === 'adjectives') {
      setContinueButton('#btn-session-continue', 'Next 20 →', () => startAdjStudy(chapter, true));
    } else if (studyMode === 'custom') {
      setContinueButton('#btn-session-continue', 'Next 30 →', () => startCustomStudy(true));
    } else {
      setContinueButton('#btn-session-continue', '', null);
    }
  }

  // ─── Reference Screen ─────────────────────────────────────────────────────────

  function buildVerbTypeHTML() {
    const eSounds = 'えけせてねへめれげぜでべぺ';
    const iSounds = 'いきしちにひみりぎじびぴ';
    const exceptions = GENKI_VERBS.filter(v => {
      if (v.type !== 'u' || !v.reading.endsWith('る')) return false;
      const before = v.reading[v.reading.length - 2];
      return eSounds.includes(before) || iSounds.includes(before);
    });
    const exceptionItems = exceptions.map(v =>
      `<li><span class="ref-exc-kanji">${v.kanji}</span><span class="ref-exc-reading"> ${v.reading}</span> — ${v.meaning}</li>`
    ).join('');

    return `<details class="ref-verb-types">
      <summary class="ref-disclosure">
        <span class="ref-disclosure-icon" aria-hidden="true">る</span>
        <span class="ref-disclosure-text">
          <span class="ref-disclosure-title">RU-verbs vs U-verbs</span>
          <span class="ref-disclosure-sub">How to tell ichidan and godan apart · ${exceptions.length} exceptions</span>
        </span>
        <span class="ref-disclosure-chevron" aria-hidden="true"></span>
      </summary>
      <div class="ref-exc-body">
        <div class="ref-verb-rule-box">
          <p><strong>RU-verbs</strong> (一段 ichidan — "one row"): the kana before る is always an
          <strong>e-sound</strong> (え段) or <strong>i-sound</strong> (い段).
          Conjugations only ever use that one row of the hiragana chart.</p>
          <span class="ref-verb-examples">食べ<strong>る</strong> · 見<strong>る</strong> · 起き<strong>る</strong> · 教え<strong>る</strong></span>
          <p><strong>U-verbs</strong> (五段 godan — "five rows"): conjugations change the final kana
          across all five vowel rows (a / i / u / e / o), hence the name.
          Any verb <em>not</em> ending in る is a U-verb; verbs ending in る where the preceding
          sound is <strong>a / u / o</strong> are also U-verbs.</p>
          <span class="ref-verb-examples">書<strong>く</strong> → か・き・く・け・こ · 帰<strong>る</strong> · 分か<strong>る</strong></span>
        </div>
        <div class="ref-exc-label">Exceptions — end in える or いる but are U-verbs (${exceptions.length})</div>
        <ul class="ref-exc-list">${exceptionItems}</ul>
      </div>
    </details>`;
  }

  function renderReference(verbType) {
    const content = $('#ref-content');

    const ruVerb = { reading: 'たべる', kanji: '食べる', type: 'ru', meaning: 'to eat', chapter: 3 };
    const uVerb = { reading: 'かく', kanji: '書く', type: 'u', meaning: 'to write', chapter: 4 };
    const suru = { reading: 'する', type: 'irregular', chapter: 3 };
    const kuru = { reading: 'くる', type: 'irregular', chapter: 3 };

    const forms = verbType === 'adj'
      ? Conjugator.ADJ_ALL_FORMS
      : Conjugator.ALL_FORMS;

    let rows = '';
    forms.forEach(form => {
      const fi = Conjugator.getFormInfo(form);

      if (verbType === 'adj') {
        const iAdj = { reading: 'たかい', kanji: '高い', type: 'i-adj', chapter: 5 };
        const naAdj = { reading: 'しずか', kanji: '静か', type: 'na-adj', chapter: 5 };
        const iExample = Conjugator.conjugateAdjective(iAdj, form);
        const naExample = Conjugator.conjugateAdjective(naAdj, form);

        rows += `<tr class="ref-row" data-form="${form}">
          <td><span class="form-pill" style="background:${fi.color}22;color:${fi.color}">${fi.symbol}</span></td>
          <td style="font-family:var(--font);font-size:0.8rem">${fi.name}</td>
          <td>${iExample}</td>
          <td>${naExample}</td>
          <td style="font-family:var(--font);font-size:0.75rem;color:var(--text-dim)">Ch ${fi.chapter}</td>
        </tr>
        <tr class="ref-explanation-row hidden" data-form-detail="${form}">
          <td colspan="5">
            <div class="ref-explanation">${fi.explanation || ''}</div>
          </td>
        </tr>`;
      } else {
        const ruExample = Conjugator.conjugate(ruVerb, form);
        const uExample = Conjugator.conjugate(uVerb, form);
        const irrExample = Conjugator.conjugate(suru, form) + ' / ' + Conjugator.conjugate(kuru, form);

        rows += `<tr class="ref-row" data-form="${form}">
          <td><span class="form-pill" style="background:${fi.color}22;color:${fi.color}">${fi.symbol}</span></td>
          <td style="font-family:var(--font);font-size:0.8rem">${fi.name}</td>
          <td>${ruExample}</td>
          <td>${uExample}</td>
          <td>${irrExample}</td>
          <td style="font-family:var(--font);font-size:0.75rem;color:var(--text-dim)">Ch ${fi.chapter}</td>
        </tr>
        <tr class="ref-explanation-row hidden" data-form-detail="${form}">
          <td colspan="6">
            <div class="ref-explanation">${fi.explanation || ''}</div>
          </td>
        </tr>`;
      }
    });

    const thead = verbType === 'adj'
      ? '<tr><th></th><th>Form</th><th>い-adj (高い)</th><th>な-adj (静か)</th><th>Ch</th></tr>'
      : '<tr><th></th><th>Form</th><th>Ru (食べる)</th><th>U (書く)</th><th>Irr (する/くる)</th><th>Ch</th></tr>';

    const verbTypeSection = verbType !== 'adj' ? buildVerbTypeHTML() : '';

    content.innerHTML = `${verbTypeSection}
      <table class="ref-table">
        <thead>${thead}</thead>
        <tbody>${rows}</tbody>
      </table>
    `;
    content.querySelectorAll('.ref-row').forEach(row => {
      row.addEventListener('click', () => {
        const form = row.dataset.form;
        const detail = content.querySelector(`[data-form-detail="${form}"]`);
        const wasOpen = !detail.classList.contains('hidden');
        content.querySelectorAll('.ref-explanation-row').forEach(r => r.classList.add('hidden'));
        content.querySelectorAll('.ref-row').forEach(r => r.classList.remove('ref-row-active'));
        if (!wasOpen) {
          detail.classList.remove('hidden');
          row.classList.add('ref-row-active');
        }
      });
    });
  }

  // ─── Build Your Own ──────────────────────────────────────────────────────────

  let customFormsSelected = new Set();
  let customVerbsSelected = new Set();
  let customPanelRendered = false;

  function wordKey(w) {
    return w.wordType === 'adj' ? `adj:${w.reading}` : (w.disambig ? `${w.reading}_${w.disambig}` : w.reading);
  }

  function syncToggleBtn(btn, selectedCount, totalCount) {
    btn.textContent = selectedCount >= totalCount ? 'Deselect All' : 'Select All';
  }

  function renderCustomPanel() {
    if (customPanelRendered) return;
    customPanelRendered = true;

    const formsContainer = $('#custom-forms');
    const verbsContainer = $('#custom-verbs');

    const allForms = [...Conjugator.ALL_FORMS, ...Conjugator.ADJ_ALL_FORMS];
    const formInfoMap = { ...Conjugator.FORM_INFO, ...Conjugator.ADJ_FORM_INFO };

    formsContainer.innerHTML = allForms.map(f => {
      const fi = formInfoMap[f];
      return `<label class="custom-check-item form-check-item">
        <input type="checkbox" data-form="${f}" class="custom-form-cb">
        <span class="form-pill" style="background:${fi.color}22;color:${fi.color}">${fi.symbol}</span>
        <span class="custom-check-label">${fi.name}</span>
      </label>`;
    }).join('');

    const allWords = [
      ...GENKI_VERBS.map(v => ({ ...v, wordType: 'verb' })),
      ...GENKI_ADJECTIVES.map(a => ({ ...a, wordType: 'adj' })),
    ];
    const chapters = [...new Set(allWords.map(w => w.chapter))].sort((a, b) => a - b);

    let verbsHTML = '';
    chapters.forEach(ch => {
      const words = allWords.filter(w => w.chapter === ch);
      verbsHTML += `<div class="custom-chapter-group" data-chapter="${ch}">
        <div class="custom-chapter-header">
          <span>Ch ${ch}</span>
          <button class="btn-toggle-chapter btn-toggle-all" data-chapter="${ch}">Deselect All</button>
        </div>
        ${words.map(w => {
          const key = wordKey(w);
          return `<label class="custom-check-item verb-check-item">
            <input type="checkbox" checked data-verb-key="${key}" data-chapter="${ch}" class="custom-verb-cb">
            <span class="custom-check-kanji">${w.kanji}</span>
            <span class="custom-check-sub">${w.meaning}</span>
          </label>`;
        }).join('')}
      </div>`;
    });
    verbsContainer.innerHTML = verbsHTML;

    customFormsSelected.clear();
    customVerbsSelected.clear();
    verbsContainer.querySelectorAll('.custom-verb-cb').forEach(cb => {
      customVerbsSelected.add(cb.dataset.verbKey);
    });

    // Form checkbox change
    formsContainer.addEventListener('change', (e) => {
      if (!e.target.classList.contains('custom-form-cb')) return;
      const form = e.target.dataset.form;
      if (e.target.checked) customFormsSelected.add(form);
      else customFormsSelected.delete(form);
      syncToggleBtn($('#btn-toggle-forms'), customFormsSelected.size, allForms.length);
      updateCustomCount();
    });

    // Verb checkbox change
    verbsContainer.addEventListener('change', (e) => {
      if (!e.target.classList.contains('custom-verb-cb')) return;
      const key = e.target.dataset.verbKey;
      const ch = e.target.dataset.chapter;
      if (e.target.checked) customVerbsSelected.add(key);
      else customVerbsSelected.delete(key);
      const chCbs = verbsContainer.querySelectorAll(`.custom-verb-cb[data-chapter="${ch}"]`);
      const chSelected = [...chCbs].filter(cb => cb.checked).length;
      syncToggleBtn(verbsContainer.querySelector(`.btn-toggle-chapter[data-chapter="${ch}"]`), chSelected, chCbs.length);
      const allVerbCbs = verbsContainer.querySelectorAll('.custom-verb-cb');
      syncToggleBtn($('#btn-toggle-verbs'), [...allVerbCbs].filter(cb => cb.checked).length, allVerbCbs.length);
      updateCustomCount();
    });

    // Toggle all forms
    $('#btn-toggle-forms').addEventListener('click', (e) => {
      e.preventDefault();
      const allOn = customFormsSelected.size >= allForms.length;
      formsContainer.querySelectorAll('.custom-form-cb').forEach(cb => {
        cb.checked = !allOn;
        if (!allOn) customFormsSelected.add(cb.dataset.form);
      });
      if (allOn) customFormsSelected.clear();
      syncToggleBtn($('#btn-toggle-forms'), customFormsSelected.size, allForms.length);
      updateCustomCount();
    });

    // Toggle all verbs
    $('#btn-toggle-verbs').addEventListener('click', (e) => {
      e.preventDefault();
      const totalCbs = verbsContainer.querySelectorAll('.custom-verb-cb');
      const allOn = [...totalCbs].every(cb => cb.checked);
      totalCbs.forEach(cb => {
        cb.checked = !allOn;
        if (!allOn) customVerbsSelected.add(cb.dataset.verbKey);
        else customVerbsSelected.delete(cb.dataset.verbKey);
      });
      syncToggleBtn($('#btn-toggle-verbs'), [...totalCbs].filter(cb => cb.checked).length, totalCbs.length);
      verbsContainer.querySelectorAll('.btn-toggle-chapter').forEach(btn => {
        const ch = btn.dataset.chapter;
        const chCbs = verbsContainer.querySelectorAll(`.custom-verb-cb[data-chapter="${ch}"]`);
        const chSelected = [...chCbs].filter(cb => cb.checked).length;
        syncToggleBtn(btn, chSelected, chCbs.length);
      });
      updateCustomCount();
    });

    // Per-chapter toggle
    verbsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-toggle-chapter');
      if (!btn) return;
      e.preventDefault();
      const ch = btn.dataset.chapter;
      const chCbs = verbsContainer.querySelectorAll(`.custom-verb-cb[data-chapter="${ch}"]`);
      const chSelected = [...chCbs].filter(cb => cb.checked).length;
      const allOn = chSelected >= chCbs.length;
      chCbs.forEach(cb => {
        cb.checked = !allOn;
        if (!allOn) customVerbsSelected.add(cb.dataset.verbKey);
        else customVerbsSelected.delete(cb.dataset.verbKey);
      });
      syncToggleBtn(btn, allOn ? 0 : chCbs.length, chCbs.length);
      const allVerbCbs2 = verbsContainer.querySelectorAll('.custom-verb-cb');
      syncToggleBtn($('#btn-toggle-verbs'), [...allVerbCbs2].filter(cb => cb.checked).length, allVerbCbs2.length);
      updateCustomCount();
    });

    // Start buttons
    $('#btn-start-custom').addEventListener('click', startCustomStudy);
    $('#btn-start-custom-mid').addEventListener('click', startCustomStudy);

    updateCustomCount();
  }

  function updateCustomCount() {
    const total = customFormsSelected.size * customVerbsSelected.size;
    const count = Math.min(total, 30);
    const text = count === 0 ? '0 cards' : `${count} card${count !== 1 ? 's' : ''}`;
    const disabled = count === 0;
    $('#custom-count').textContent = text;
    $('#custom-count-mid').textContent = text;
    $('#btn-start-custom').disabled = disabled;
    $('#btn-start-custom-mid').disabled = disabled;
  }

  function startCustomStudy(cont) {
    if (customFormsSelected.size === 0 || customVerbsSelected.size === 0) return;

    studyMode = 'custom';
    currentChapter = null;

    const allWords = [
      ...GENKI_VERBS.map(v => ({ ...v, wordType: 'verb' })),
      ...GENKI_ADJECTIVES.map(a => ({ ...a, wordType: 'adj' })),
    ];

    const verbForms = [...customFormsSelected].filter(f => Conjugator.FORM_INFO[f]);
    const adjForms = [...customFormsSelected].filter(f => Conjugator.ADJ_FORM_INFO[f]);

    sessionCards = [];
    allWords.forEach(w => {
      const key = w.wordType === 'adj' ? `adj:${w.reading}` : (w.disambig ? `${w.reading}_${w.disambig}` : w.reading);
      if (!customVerbsSelected.has(key)) return;

      const forms = w.wordType === 'adj' ? adjForms : verbForms;
      forms.forEach(f => {
        const id = w.wordType === 'adj' ? adjCardId(w, f) : cardId(w, f);
        sessionCards.push({ verb: w, form: f, id });
      });
    });

    if (sessionCards.length === 0) return;

    sessionCards = pickBatch('custom', [], sessionCards, cont, 30);

    sessionIndex = 0;
    sessionCorrect = 0;
    sessionTotal = sessionCards.length;
    undoStack = [];

    showScreen('study');
    $('#session-complete').classList.add('hidden');
    $('#card').classList.remove('hidden');
    showCard();
  }

  // ─── Translate Sentences ───────────────────────────────────────────────────────

  // TRANSLATE_SENTENCES now lives in sentences-data.js (window global,
  // loaded before this script) — shared with the printable translation
  // worksheets, which read the same file outside the browser.

  let translatePanelRendered = false;

  function renderTranslateChapters() {
    if (translatePanelRendered) return;
    translatePanelRendered = true;

    const g1 = $('#translate-chapters-genki1');
    const g2 = $('#translate-chapters-genki2');
    g1.innerHTML = '';
    g2.innerHTML = '';

    Object.keys(TRANSLATE_SENTENCES).map(Number).sort((a, b) => a - b).forEach(ch => {
      const sentences = TRANSLATE_SENTENCES[ch];
      // Chapters 1-2 predate verb conjugation, so they only exist in
      // EXTRA_CHAPTER_INFO (sentences-data.js), not verbs.js's CHAPTER_INFO.
      const info = CHAPTER_INFO[ch] || (typeof EXTRA_CHAPTER_INFO !== 'undefined' && EXTRA_CHAPTER_INFO[ch]);
      if (!info) return;

      const card = document.createElement('div');
      card.className = 'chapter-card';
      card.innerHTML = `
        <div class="chapter-card-title">${info.title}</div>
        <div class="chapter-card-sub">${sentences.length} sentences</div>
        <div class="chapter-card-forms">
          <span class="form-tag">EN → JA</span>
          <span class="form-tag">JA → EN</span>
        </div>
      `;
      card.addEventListener('click', () => startTranslateStudy(ch));
      (ch <= 12 ? g1 : g2).appendChild(card);
    });
  }

  function startTranslateStudy(chapter) {
    studyMode = 'translate';
    translateSource = 'sentences';
    currentChapter = chapter;

    const sentences = TRANSLATE_SENTENCES[chapter];
    if (!sentences || sentences.length === 0) return;

    sessionCards = [];
    sentences.forEach((s, i) => {
      const dir = Math.random() < 0.5 ? 'en-to-ja' : 'ja-to-en';
      sessionCards.push({
        sentence: s,
        direction: dir,
        id: `tr_${chapter}_${i}_${dir}`,
        verb: null,
        form: null,
      });
    });
    shuffle(sessionCards);

    sessionIndex = 0;
    sessionCorrect = 0;
    sessionTotal = sessionCards.length;
    undoStack = [];

    showScreen('study');
    $('#session-complete').classList.add('hidden');
    $('#card').classList.remove('hidden');
    showCard();
  }

  function showTranslateCard() {
    const card = sessionCards[sessionIndex];
    if (!card) return;
    currentCard = card;
    answered = false;

    const { sentence, direction } = card;
    const isEnToJa = direction === 'en-to-ja';
    const sourceLang = isEnToJa ? 'English' : 'Japanese';
    const targetLang = isEnToJa ? 'Japanese' : 'English';
    const sourceText = isEnToJa ? sentence.en : sentence.ja;

    $('#card').classList.remove('negative-form');
    const badge = $('#card-form-badge');
    badge.style.cssText = '';
    badge.classList.remove('hidden');
    if (card.refForm) {
      // Adjective sentences: the form the sentence expects, shown per the
      // form-display setting.
      const fi = Conjugator.getFormInfo(card.refForm);
      renderFormBadge(badge, fi, card.formEnding || fi.symbol, settings.formDisplay);
    } else {
      badge.innerHTML = `${sourceLang} → ${targetLang}`;
    }
    $('#card-kanji').textContent = '';
    $('#card-reading').textContent = '';
    $('#card-meaning').textContent = '';
    $('#card-prompt').textContent = '';
    $('#card-context').classList.add('hidden');
    $('#card-example-sentence-front').classList.add('hidden');
    $('#hint-area').classList.add('hidden');

    const kanjiEl = $('#card-kanji');
    if (isEnToJa) {
      // Hover (or tap) an English word to see the Japanese word for it.
      if (window.EnHover) EnHover.render(kanjiEl, sourceText, { ja: sentence.ja, kana: EnHover.kanaOfRuby(sentence.jaHtml || sentence.ja) });
      else kanjiEl.textContent = sourceText;
    } else {
      kanjiEl.innerHTML = settings.showFurigana ? (sentence.jaHtml || sentence.ja) : sentence.ja;
    }
    kanjiEl.classList.toggle('translate-source-ja', !isEnToJa);
    kanjiEl.classList.toggle('translate-source-en', isEnToJa);

    $('#card-prompt').textContent = `Translate to ${targetLang}`;
    // Adjective sentences say which adjective and form the sentence drills.
    $('#card-meaning').textContent = card.hint || '';

    $('#card-front').classList.remove('hidden');
    $('#card-back').classList.add('hidden');

    const isTyping = settings.typingMode;
    $('#reveal-area').classList.toggle('hidden', isTyping);
    $('#typing-area').classList.toggle('hidden', !isTyping);
    $('#btn-hint').classList.add('hidden');
    $('#btn-hint-typing').classList.add('hidden');

    if (isTyping) {
      const input = $('#answer-input');
      input.value = '';
      input.placeholder = isEnToJa ? 'Type in Japanese...' : 'Type in English...';
      // Romaji → hiragana only when the answer is Japanese.
      input.lang = isEnToJa ? 'ja' : 'en';
      setTimeout(() => input.focus(), 50);
    }

    $('#study-bar-fill').style.width = `${((sessionIndex) / sessionTotal) * 100}%`;
    $('#study-progress-text').textContent = `${sessionIndex + 1} / ${sessionTotal}`;
    updateUndoButton();
  }

  function revealTranslateAnswer(typed = '') {
    if (answered) return;
    answered = true;
    lastTypedCorrect = false;
    if (window.EnHover) EnHover.hide();

    const { sentence, direction } = currentCard;
    const isEnToJa = direction === 'en-to-ja';
    const jaDisplay = settings.showFurigana ? (sentence.jaHtml || sentence.ja) : sentence.ja;

    $('#key-capture').focus();
    $('#card-front').classList.add('hidden');
    $('#card-back').classList.remove('hidden');

    const badgeBack = $('#card-form-badge-back');
    if (currentCard.refForm) {
      // The answer side always reveals the form.
      const fi = Conjugator.getFormInfo(currentCard.refForm);
      renderFormBadge(badgeBack, fi, currentCard.formEnding || fi.symbol, 'name');
    } else {
      badgeBack.classList.remove('hidden');
      badgeBack.innerHTML = $('#card-form-badge').innerHTML;
      badgeBack.style.cssText = $('#card-form-badge').style.cssText;
    }
    const answerEl = $('#card-kanji-back');
    if (isEnToJa) {
      answerEl.innerHTML = jaDisplay;
    } else {
      answerEl.textContent = sentence.en;
    }
    answerEl.classList.toggle('translate-source-ja', isEnToJa);
    answerEl.classList.toggle('translate-source-en', !isEnToJa);

    $('#card-reading-back').classList.add('hidden');
    $('#card-meaning-back').classList.add('hidden');
    $('#card-conjugated').classList.add('hidden');
    $('#card-explanation').classList.add('hidden');
    $('#hint-area-back').classList.add('hidden');
    $('.result-area').classList.add('hidden');

    const originalContent = isEnToJa ? sentence.en : jaDisplay;
    const exEl = $('#card-example-sentence');
    const typedHtml = translateTypedHtml(typed, sentence, isEnToJa);
    if (lastTypedCorrect) sessionCorrect++;
    exEl.innerHTML = typedHtml
      + `<div class="translate-original-label">Translation</div><div class="translate-original">${originalContent}</div>`;
  }

  // What was typed, set against the answer: a character diff when it's off.
  function translateTypedHtml(typed, sentence, isEnToJa) {
    if (!settings.typingMode || !typed) return '';
    const kana = html => (window.EnHover ? EnHover.kanaOfRuby(html) : html);
    const answers = isEnToJa
      ? [sentence.ja, kana(sentence.jaHtml || sentence.ja)]
      : [sentence.en];
    // 家 read いえ can just as well be read うち.
    const ie = '<ruby>家<rp>(</rp><rt>いえ</rt><rp>)</rp></ruby>';
    if (isEnToJa && sentence.jaHtml && sentence.jaHtml.includes(ie)) {
      const alt = sentence.jaHtml.split(ie).join('うち');
      answers.push(kana(alt), alt.replace(/<rp>.*?<\/rp>|<rt>.*?<\/rt>|<\/?ruby>/g, ''));
    }
    const key = s => s.normalize('NFKC').toLowerCase().replace(/[\s　。、．，,.!?！？「」'"’]/g, '');
    lastTypedCorrect = answers.some(a => key(a) === key(typed));
    if (lastTypedCorrect) {
      return `<div class="translate-typed"><span class="bunkei-ok">✓ Correct</span></div>`;
    }
    if (!window.AnswerDiff) return '';
    const target = AnswerDiff.closest(typed, answers);
    const d = AnswerDiff.diff(typed, target);
    return `<div class="translate-typed answer-diff"${isEnToJa ? ' lang="ja"' : ''}>`
      + `<div><span class="answer-diff-label">You typed</span>${AnswerDiff.toHtml(d.typed, 'diff-wrong')}</div>`
      + `<div><span class="answer-diff-label">Expected</span>${AnswerDiff.toHtml(d.expected, 'diff-missing')}</div>`
      + `</div>`;
  }

  // ─── Kana Drawing Practice ─────────────────────────────────────────────────────

  let kanaSessionCards = [];
  let kanaIndex = 0;
  let kanaTotal = 0;
  let kanaCorrect = 0;
  let currentKanaCard = null;
  let kanaAnswered = false;
  let kanaCtx = null;
  let kanaDrawing = false;

  function kanaCardId(script, kana) {
    return `kana_${script}_${kana}`;
  }

  function getKanaPool() {
    const pool = [];
    if ($('#kana-toggle-hiragana').checked) {
      KANA_DATA.hiragana.forEach(k => pool.push({
        script: 'hiragana', label: 'Hiragana', kana: k.kana, romaji: k.romaji, id: kanaCardId('hiragana', k.kana),
      }));
    }
    if ($('#kana-toggle-katakana').checked) {
      KANA_DATA.katakana.forEach(k => pool.push({
        script: 'katakana', label: 'Katakana', kana: k.kana, romaji: k.romaji, id: kanaCardId('katakana', k.kana),
      }));
    }
    return pool;
  }

  function renderKanaPanel() {
    const pool = getKanaPool();
    const due = pool.filter(k => isDue(getCardState(srsData, k.id))).length;
    $('#kana-due-count').textContent = due;
  }

  function startKanaStudy(cont) {
    const pool = getKanaPool();
    if (pool.length === 0) return;

    const due = pool.filter(k => isDue(getCardState(srsData, k.id)));
    kanaSessionCards = pickBatch('kana', due, pool, cont);

    kanaIndex = 0;
    kanaCorrect = 0;
    kanaTotal = kanaSessionCards.length;

    showScreen('kana');
    $('#kana-session-complete').classList.add('hidden');
    $('#kana-card').classList.remove('hidden');
    showKanaCard();
  }

  function showKanaCard() {
    if (kanaIndex >= kanaSessionCards.length) {
      finishKanaSession();
      return;
    }

    kanaAnswered = false;
    currentKanaCard = kanaSessionCards[kanaIndex];

    const pct = (kanaIndex / kanaTotal) * 100;
    $('#kana-bar-fill').style.width = pct + '%';
    $('#kana-progress-text').textContent = `${kanaIndex + 1} / ${kanaTotal}`;

    $('#kana-romaji').textContent = currentKanaCard.romaji;
    const badge = $('#kana-script-badge');
    badge.textContent = currentKanaCard.label;
    badge.classList.toggle('katakana', currentKanaCard.script === 'katakana');

    $('#kana-reveal-area').classList.remove('hidden');
    $('#kana-answer-area').classList.add('hidden');

    clearKanaCanvas();
  }

  function revealKanaAnswer() {
    if (kanaAnswered || !currentKanaCard) return;
    kanaAnswered = true;

    $('#kana-reveal-area').classList.add('hidden');
    $('#kana-answer-area').classList.remove('hidden');
    $('#kana-answer-char').textContent = currentKanaCard.kana;
    $('#kana-answer-romaji').textContent = `${currentKanaCard.romaji} · ${currentKanaCard.label}`;
  }

  function gradeKanaAndAdvance(grade) {
    if (!kanaAnswered || !currentKanaCard) return;

    const id = currentKanaCard.id;
    const state = getCardState(srsData, id);
    srsData[id] = gradeCard(state, grade);
    saveSRS(srsData);

    updateStreak();
    statsData.todayReviews = (statsData.todayReviews || 0) + 1;
    if (grade >= 4) {
      statsData.todayCorrect = (statsData.todayCorrect || 0) + 1;
      kanaCorrect++;
    }
    saveStats(statsData);
    flashSaveIndicator();

    kanaIndex++;
    showKanaCard();
  }

  function finishKanaSession() {
    kanaAnswered = false;
    currentKanaCard = null;

    $('#kana-card').classList.add('hidden');
    $('#kana-session-complete').classList.remove('hidden');
    $('#kana-session-total').textContent = kanaTotal;
    $('#kana-session-correct').textContent = kanaCorrect;
    $('#kana-session-accuracy').textContent = (kanaTotal > 0 ? Math.round((kanaCorrect / kanaTotal) * 100) : 0) + '%';
    setContinueButton('#btn-kana-continue', 'Next 20 →', () => startKanaStudy(true));
  }

  function initKanaCanvas() {
    const canvas = $('#kana-canvas');
    if (!canvas) return;
    kanaCtx = canvas.getContext('2d');

    function pos(e) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
      };
    }

    function start(e) {
      e.preventDefault();
      kanaDrawing = true;
      const p = pos(e);
      kanaCtx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#000';
      kanaCtx.lineWidth = 10;
      kanaCtx.lineCap = 'round';
      kanaCtx.lineJoin = 'round';
      kanaCtx.beginPath();
      kanaCtx.moveTo(p.x, p.y);
    }

    function move(e) {
      if (!kanaDrawing) return;
      e.preventDefault();
      const p = pos(e);
      kanaCtx.lineTo(p.x, p.y);
      kanaCtx.stroke();
    }

    function end() {
      kanaDrawing = false;
    }

    canvas.addEventListener('pointerdown', start);
    canvas.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    canvas.addEventListener('pointerleave', end);

    // Prevent long-press context menu / image drag from hijacking the stroke on mobile
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('dragstart', (e) => e.preventDefault());
  }

  function clearKanaCanvas() {
    const canvas = $('#kana-canvas');
    if (!canvas || !kanaCtx) return;
    kanaCtx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // ─── Kanji Quiz (self-graded flashcards, either direction) ─────────────────────
  //
  // Reuses the SRS engine and card layout the kana mode established above.
  // Each kanji/direction pair gets its own SRS state (recalling the kanji from
  // its meaning and recalling the meaning from the kanji are different skills),
  // and there's no drawing canvas here — the printable sheets already cover
  // handwriting practice with real pen and paper; this is a quick digital
  // recall check in both directions.

  const KANJI_QUIZ_LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1'];
  const KANJI_QUIZ_DIRECTIONS = ['meaning-to-kanji', 'kanji-to-meaning'];

  let kanjiQuizSessionCards = [];
  let kanjiQuizIndex = 0;
  let kanjiQuizTotal = 0;
  let kanjiQuizCorrect = 0;
  let currentKanjiQuizCard = null;
  let kanjiQuizAnswered = false;
  let kanjiQuizUndoStack = [];

  function kanjiQuizCardId(level, direction, kanji) {
    return `kanjiquiz_${level}_${direction}_${kanji}`;
  }

  function getKanjiQuizDirection() {
    const checked = $('input[name="kanji-quiz-direction"]:checked');
    return checked ? checked.value : 'meaning-to-kanji';
  }

  function getKanjiQuizType() {
    const checked = $('input[name="kanji-quiz-type"]:checked');
    return checked ? checked.value : 'flashcards';
  }

  function getKanjiQuizLevels() {
    return KANJI_QUIZ_LEVELS.filter(level => {
      const el = $(`#kanji-quiz-toggle-${level}`);
      return el && el.checked;
    });
  }

  function getKanjiQuizPool() {
    const direction = getKanjiQuizDirection();
    const pool = [];
    getKanjiQuizLevels().forEach(level => {
      KANJI_QUIZ_DATA[level].forEach(k => {
        pool.push({
          level, direction, kanji: k.kanji, meaning: k.meaning,
          id: kanjiQuizCardId(level, direction, k.kanji),
        });
      });
    });
    return pool;
  }

  function renderKanjiQuizPanel() {
    const isConfusable = getKanjiQuizType() === 'confusable';

    const dirRow = $('#kanji-quiz-direction-row');
    if (dirRow) dirRow.classList.toggle('hidden', isConfusable);

    const intro = $('#kanji-quiz-intro');
    if (intro) {
      intro.textContent = isConfusable
        ? 'Multiple-choice quiz built from kanji that look alike. Pick the right meaning out of 4 choices — the wrong ones are meanings of similar-looking kanji.'
        : "Self-graded kanji flashcards. Pick a direction and which JLPT levels to include, then start a session scheduled with spaced repetition so you review what you don't know most often.";
    }

    const pool = isConfusable ? getConfusablePool() : getKanjiQuizPool();
    const due = pool.filter(k => isDue(getCardState(srsData, k.id))).length;
    const el = $('#kanji-quiz-due-count');
    if (el) el.textContent = due;
  }

  function startKanjiQuizStudy(cont) {
    const pool = getKanjiQuizPool();
    if (pool.length === 0) return;

    const due = pool.filter(k => isDue(getCardState(srsData, k.id)));
    kanjiQuizSessionCards = pickBatch('kanji-quiz', due, pool, cont);

    kanjiQuizIndex = 0;
    kanjiQuizCorrect = 0;
    kanjiQuizTotal = kanjiQuizSessionCards.length;
    kanjiQuizUndoStack = [];

    showScreen('kanji-quiz');
    $('#kanji-quiz-session-complete').classList.add('hidden');
    $('#kanji-quiz-card').classList.remove('hidden');
    showKanjiQuizCard();
  }

  function updateKanjiQuizUndoButton() {
    const btn = $('#btn-kanji-quiz-undo');
    if (btn) btn.classList.toggle('hidden', kanjiQuizUndoStack.length === 0);
  }

  function showKanjiQuizCard() {
    if (kanjiQuizIndex >= kanjiQuizSessionCards.length) {
      finishKanjiQuizSession();
      return;
    }

    kanjiQuizAnswered = false;
    currentKanjiQuizCard = kanjiQuizSessionCards[kanjiQuizIndex];

    const pct = (kanjiQuizIndex / kanjiQuizTotal) * 100;
    $('#kanji-quiz-bar-fill').style.width = pct + '%';
    $('#kanji-quiz-progress-text').textContent = `${kanjiQuizIndex + 1} / ${kanjiQuizTotal}`;

    const meaningToKanji = currentKanjiQuizCard.direction === 'meaning-to-kanji';
    $('#kanji-quiz-prompt-label').textContent = meaningToKanji ? 'Recall the kanji' : 'Recall the meaning';

    const prompt = $('#kanji-quiz-prompt');
    if (meaningToKanji) {
      prompt.textContent = currentKanjiQuizCard.meaning;
      prompt.className = 'kanji-quiz-meaning';
    } else {
      prompt.textContent = currentKanjiQuizCard.kanji;
      prompt.className = 'kana-answer-char';
    }

    $('#kanji-quiz-level-badge').textContent = currentKanjiQuizCard.level.toUpperCase();

    $('#kanji-quiz-reveal-area').classList.remove('hidden');
    $('#kanji-quiz-answer-area').classList.add('hidden');

    updateKanjiQuizUndoButton();
  }

  function revealKanjiQuizAnswer() {
    if (kanjiQuizAnswered || !currentKanjiQuizCard) return;
    kanjiQuizAnswered = true;

    $('#kanji-quiz-reveal-area').classList.add('hidden');
    $('#kanji-quiz-answer-area').classList.remove('hidden');

    const meaningToKanji = currentKanjiQuizCard.direction === 'meaning-to-kanji';
    const answer = $('#kanji-quiz-answer');
    if (meaningToKanji) {
      answer.textContent = currentKanjiQuizCard.kanji;
      answer.className = 'kana-answer-char';
      $('#kanji-quiz-answer-recap').textContent = `${currentKanjiQuizCard.meaning} · ${currentKanjiQuizCard.level.toUpperCase()}`;
    } else {
      answer.textContent = currentKanjiQuizCard.meaning;
      answer.className = 'kanji-quiz-meaning';
      $('#kanji-quiz-answer-recap').textContent = `${currentKanjiQuizCard.kanji} · ${currentKanjiQuizCard.level.toUpperCase()}`;
    }
    const add = $('#kanji-quiz-add');
    if (add) add.innerHTML = window.KanjiCards ? KanjiCards.buttonHtml(currentKanjiQuizCard.kanji, null, { look: 'label' }) : '';
  }

  function gradeKanjiQuizAndAdvance(grade) {
    if (!kanjiQuizAnswered || !currentKanjiQuizCard) return;

    const id = currentKanjiQuizCard.id;

    kanjiQuizUndoStack.push({
      cardId: id,
      prevSrsState: srsData[id] ? { ...srsData[id] } : null,
      prevStats: { ...statsData },
      index: kanjiQuizIndex,
      correct: kanjiQuizCorrect,
    });

    const state = getCardState(srsData, id);
    srsData[id] = gradeCard(state, grade);
    saveSRS(srsData);

    updateStreak();
    statsData.todayReviews = (statsData.todayReviews || 0) + 1;
    if (grade >= 4) {
      statsData.todayCorrect = (statsData.todayCorrect || 0) + 1;
      kanjiQuizCorrect++;
    }
    saveStats(statsData);
    flashSaveIndicator();

    kanjiQuizIndex++;
    showKanjiQuizCard();
  }

  // "Previous" for a card you graded wrong (e.g. clicked Got It but were
  // actually wrong) — pops the undo stack, restoring that card's prior SRS
  // state and stats, then re-shows it so you can grade it again correctly.
  function undoLastKanjiQuizGrade() {
    if (kanjiQuizUndoStack.length === 0) return;

    const undo = kanjiQuizUndoStack.pop();

    if (undo.prevSrsState) {
      srsData[undo.cardId] = undo.prevSrsState;
    } else {
      delete srsData[undo.cardId];
    }
    saveSRS(srsData);

    statsData = { ...undo.prevStats };
    saveStats(statsData);

    kanjiQuizIndex = undo.index;
    kanjiQuizCorrect = undo.correct;

    $('#kanji-quiz-session-complete').classList.add('hidden');
    $('#kanji-quiz-card').classList.remove('hidden');

    showKanjiQuizCard();
    flashSaveIndicator();
  }

  function finishKanjiQuizSession() {
    kanjiQuizAnswered = false;
    currentKanjiQuizCard = null;

    $('#kanji-quiz-card').classList.add('hidden');
    $('#kanji-quiz-session-complete').classList.remove('hidden');
    $('#kanji-quiz-session-total').textContent = kanjiQuizTotal;
    $('#kanji-quiz-session-correct').textContent = kanjiQuizCorrect;
    $('#kanji-quiz-session-accuracy').textContent = (kanjiQuizTotal > 0 ? Math.round((kanjiQuizCorrect / kanjiQuizTotal) * 100) : 0) + '%';
    setContinueButton('#btn-kanji-quiz-continue', 'Next 20 →', () => startKanjiQuizStudy(true));
  }

  // ─── Confusing Kanji (multiple-choice, using visually-similar kanji groups) ────
  //
  // Distractors come from the kanji's own "confusable group" (see
  // kanji-sheets/data/confusable_kanji_groups.json, built from pixel-overlap
  // similarity on rendered glyphs) so the wrong choices are plausible
  // mix-ups rather than random noise. Most groups only have 1-2 other
  // members, so we pad out to 3 distractors with other confusable kanji
  // when a group is too small on its own.

  let confusableFlatPool = null; // [{kanji, meaning, level, groupIndex}], built once

  let confusableSessionCards = [];
  let confusableIndex = 0;
  let confusableTotal = 0;
  let confusableCorrect = 0;
  let currentConfusableCard = null;
  let currentConfusableChoices = [];
  let confusableAnswered = false;
  let confusableUndoStack = [];

  function buildConfusableFlatPool() {
    if (confusableFlatPool) return;
    confusableFlatPool = [];
    (window.CONFUSABLE_KANJI_GROUPS || []).forEach((group, groupIndex) => {
      group.kanji.forEach(kanji => {
        confusableFlatPool.push({
          kanji,
          meaning: group.meanings[kanji],
          level: group.levels[kanji].toLowerCase(),
          groupIndex,
        });
      });
    });
  }

  function confusableCardId(kanji) {
    return `confusable_${kanji}`;
  }

  function getConfusablePool() {
    buildConfusableFlatPool();
    const levels = getKanjiQuizLevels();
    return confusableFlatPool
      .filter(k => levels.includes(k.level))
      .map(k => ({ ...k, id: confusableCardId(k.kanji) }));
  }

  // Each choice keeps its own kanji alongside its meaning (not just the
  // meaning text) so that once you've answered, the quiz can reveal which
  // kanji every wrong choice actually belongs to.
  function pickConfusableChoices(card) {
    // shuffle() mutates its argument in place and returns nothing, so build
    // the array first and shuffle it as a separate statement before chaining.
    const group = window.CONFUSABLE_KANJI_GROUPS[card.groupIndex];
    const otherGroupMembers = group.kanji.filter(k => k !== card.kanji);
    shuffle(otherGroupMembers);
    const choices = otherGroupMembers
      .slice(0, 3)
      .map(k => ({ kanji: k, meaning: group.meanings[k] }));

    if (choices.length < 3) {
      const used = new Set([card.meaning, ...choices.map(c => c.meaning)]);
      const filler = confusableFlatPool.filter(k => !used.has(k.meaning));
      shuffle(filler);
      for (const f of filler) {
        if (choices.length >= 3) break;
        if (used.has(f.meaning)) continue;
        choices.push({ kanji: f.kanji, meaning: f.meaning });
        used.add(f.meaning);
      }
    }

    const result = [{ kanji: card.kanji, meaning: card.meaning }, ...choices];
    shuffle(result);
    return result;
  }

  function startConfusableStudy(cont) {
    const pool = getConfusablePool();
    if (pool.length === 0) return;

    const due = pool.filter(k => isDue(getCardState(srsData, k.id)));
    confusableSessionCards = pickBatch('confusable', due, pool, cont);

    confusableIndex = 0;
    confusableCorrect = 0;
    confusableTotal = confusableSessionCards.length;
    confusableUndoStack = [];

    showScreen('confusable');
    $('#confusable-session-complete').classList.add('hidden');
    $('#confusable-card').classList.remove('hidden');
    showConfusableCard();
  }

  function updateConfusableUndoButton() {
    const btn = $('#btn-confusable-undo');
    if (btn) btn.classList.toggle('hidden', confusableUndoStack.length === 0);
  }

  function showConfusableCard() {
    if (confusableIndex >= confusableSessionCards.length) {
      finishConfusableSession();
      return;
    }

    confusableAnswered = false;
    currentConfusableCard = confusableSessionCards[confusableIndex];

    const pct = (confusableIndex / confusableTotal) * 100;
    $('#confusable-bar-fill').style.width = pct + '%';
    $('#confusable-progress-text').textContent = `${confusableIndex + 1} / ${confusableTotal}`;

    $('#confusable-prompt').textContent = currentConfusableCard.kanji;
    $('#confusable-level-badge').textContent = currentConfusableCard.level.toUpperCase();

    currentConfusableChoices = pickConfusableChoices(currentConfusableCard);
    $$('.confusable-choice').forEach((btn, i) => {
      const choice = currentConfusableChoices[i];
      btn.innerHTML = `
        <span class="confusable-choice-meaning">${choice.meaning}</span>
        <span class="confusable-choice-kanji hidden">${choice.kanji}</span>
      `;
      btn.className = 'confusable-choice';
      btn.disabled = false;
    });

    $('#confusable-next-area').classList.add('hidden');

    updateConfusableUndoButton();
  }

  function chooseConfusableAnswer(choiceIndex) {
    if (confusableAnswered || !currentConfusableCard) return;
    if (choiceIndex < 0 || choiceIndex >= currentConfusableChoices.length) return;
    confusableAnswered = true;

    const correct = currentConfusableChoices[choiceIndex].kanji === currentConfusableCard.kanji;

    $$('.confusable-choice').forEach((btn, i) => {
      btn.disabled = true;
      // Reveal which kanji every choice actually belongs to now that the
      // question is settled — useful for the wrong choices especially,
      // since those are the other kanji this one gets confused with.
      const kanjiSpan = btn.querySelector('.confusable-choice-kanji');
      if (kanjiSpan) kanjiSpan.classList.remove('hidden');
      if (currentConfusableChoices[i].kanji === currentConfusableCard.kanji) {
        btn.classList.add('correct');
      } else if (i === choiceIndex) {
        btn.classList.add('wrong');
      }
    });

    const id = currentConfusableCard.id;

    confusableUndoStack.push({
      cardId: id,
      prevSrsState: srsData[id] ? { ...srsData[id] } : null,
      prevStats: { ...statsData },
      index: confusableIndex,
      correct: confusableCorrect,
    });

    const state = getCardState(srsData, id);
    srsData[id] = gradeCard(state, correct ? 4 : 1);
    saveSRS(srsData);

    updateStreak();
    statsData.todayReviews = (statsData.todayReviews || 0) + 1;
    if (correct) {
      statsData.todayCorrect = (statsData.todayCorrect || 0) + 1;
      confusableCorrect++;
    }
    saveStats(statsData);
    flashSaveIndicator();

    $('#confusable-next-area').classList.remove('hidden');
    updateConfusableUndoButton();
  }

  function advanceConfusable() {
    if (!confusableAnswered) return;
    confusableIndex++;
    showConfusableCard();
  }

  // "Previous" for a misclick — pops the undo stack, restoring that card's
  // prior SRS state and stats, then re-shows it so you can answer again.
  function undoLastConfusableGrade() {
    if (confusableUndoStack.length === 0) return;

    const undo = confusableUndoStack.pop();

    if (undo.prevSrsState) {
      srsData[undo.cardId] = undo.prevSrsState;
    } else {
      delete srsData[undo.cardId];
    }
    saveSRS(srsData);

    statsData = { ...undo.prevStats };
    saveStats(statsData);

    confusableIndex = undo.index;
    confusableCorrect = undo.correct;

    $('#confusable-session-complete').classList.add('hidden');
    $('#confusable-card').classList.remove('hidden');

    showConfusableCard();
    flashSaveIndicator();
  }

  function finishConfusableSession() {
    confusableAnswered = false;
    currentConfusableCard = null;

    $('#confusable-card').classList.add('hidden');
    $('#confusable-session-complete').classList.remove('hidden');
    $('#confusable-session-total').textContent = confusableTotal;
    $('#confusable-session-correct').textContent = confusableCorrect;
    $('#confusable-session-accuracy').textContent = (confusableTotal > 0 ? Math.round((confusableCorrect / confusableTotal) * 100) : 0) + '%';
    setContinueButton('#btn-confusable-continue', 'Next 20 →', () => startConfusableStudy(true));
  }

  // ─── Particle quiz (multiple-choice fill-in-the-blank) ─────────────────────────
  //
  // Sentences and distractor groups come from particles-data.js. Each
  // question shows a sentence with one particle blanked out (plus its
  // English translation) and asks which of 4 particles fits — graded
  // automatically like the Confusing Kanji quiz above, since there's only
  // one right answer per question.

  let particlesSessionCards = [];
  let particlesIndex = 0;
  let particlesTotal = 0;
  let particlesCorrect = 0;
  let currentParticleCard = null;
  let currentParticleChoices = [];
  let particlesAnswered = false;
  let particlesUndoStack = [];

  function particleCardId(item) {
    return `particle_${item.id}`;
  }

  function getSelectedParticles() {
    return (window.PARTICLE_LIST || []).filter(p => {
      const el = $(`#particles-toggle-${window.PARTICLE_ROMAJI[p]}`);
      return el && el.checked;
    });
  }

  // "sentences" (particles-data.js) or "verbs" (verb-particles-data.js:
  // which particle a verb takes).
  function getParticlesQuizType() {
    const checked = $('input[name="particles-quiz-type"]:checked');
    return checked ? checked.value : 'sentences';
  }

  function getParticlesPool() {
    if (getParticlesQuizType() === 'verbs') {
      return (window.VERB_PARTICLE_ITEMS || [])
        .map(item => ({ ...item, itemId: item.id, id: `vparticle_${item.id}` }));
    }
    const selected = getSelectedParticles();
    return (window.PARTICLE_QUIZ_ITEMS || [])
      .filter(item => selected.includes(item.particle))
      .map(item => ({ ...item, itemId: item.id, id: particleCardId(item) }));
  }

  // Builds the particle toggle checkboxes once from PARTICLE_LIST — the
  // page itself only carries an empty container, since the particle set
  // lives in particles-data.js rather than being hand-written per particle.
  function renderParticleToggles() {
    const row = $('#particles-toggle-row');
    if (!row || row.children.length > 0) return;
    (window.PARTICLE_LIST || []).forEach(p => {
      const romaji = window.PARTICLE_ROMAJI[p];
      const label = document.createElement('label');
      label.className = 'kana-script-toggle';
      label.innerHTML = `<input type="checkbox" id="particles-toggle-${romaji}" checked> ${p} (${romaji})`;
      row.appendChild(label);
    });
  }

  // Rules + verb overview table for the Verb + Particle quiz, built once
  // from verb-particles-data.js.
  function renderVerbParticlesReference() {
    const el = $('#verb-particles-reference');
    if (!el || !window.VERB_PARTICLE_RULES) return;
    const furiKey = settings.showFurigana ? 'on' : 'off';
    if (el.dataset.furigana === furiKey) return;
    el.dataset.furigana = furiKey;
    const furi = t => window.VERB_PARTICLE_FURIGANA(t)[settings.showFurigana ? 'html' : 'plain'];
    const esc = t => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const particleTags = text => esc(text).replace(/([〕／(])(から|[をにでがとへ])/g, '$1<span class="vp-p" lang="ja">$2</span>');
    const rules = window.VERB_PARTICLE_RULES.map(r => `
      <div class="vp-rule">
        <span class="particle-tag particle-tag-ok" lang="ja">${r.particle}</span>
        <div>
          <div class="vp-rule-title">${esc(r.title)}</div>
          <p>${esc(r.rule)}</p>
          <div class="vp-rule-examples" lang="ja">${r.examples.map(furi).join('　·　')}</div>
        </div>
      </div>`).join('');
    const typeTag = type => type === 'pair'
      ? `${typeTag('vi')}${typeTag('vt')}`
      : type === 'vt'
        ? '<span class="vp-type vp-type-vt" title="Transitive (他動詞): takes an object with を"><span lang="ja">他</span> vt</span>'
        : '<span class="vp-type vp-type-vi" title="Intransitive (自動詞): no object"><span lang="ja">自</span> vi</span>';
    const rows = window.VERB_PARTICLE_VERBS.map(v => `
      <tr>
        <td class="vp-verb"><span lang="ja">${furi(v.verb)}</span><span class="vp-type-line">${typeTag(v.type)}</span></td>
        <td class="vp-en">${esc(v.en)}${v.pair ? `<span class="vp-pair">↔ <span lang="ja">${furi(v.pair)}</span></span>` : ''}</td>
        <td class="vp-frames">${v.frames.map(f => `<span class="vp-frame">${particleTags(f)}</span>`).join('')}</td>
      </tr>`).join('');
    const vt = window.VERB_TRANSITIVITY;
    const withParticle = (noun, p, verb) =>
      `${furi(noun)}<span class="vp-p">${p}</span>${furi(verb)}`;
    const pairCount = vt.groups.reduce((n, g) => n + g.pairs.length, 0);
    const exampleBlock = (type, verb, [jp, en, why]) => `
      <div class="vt-ex vt-ex-${type}">
        <div class="vt-ex-head">${typeTag(type)} <span lang="ja">${furi(verb)}</span></div>
        <div class="vt-ex-jp" lang="ja">${furi(jp).replace(/\{([がを])\}/, '<span class="vp-p">$1</span>')}</div>
        <div class="vt-ex-en">${esc(en)}</div>
        <p class="vt-ex-why">${esc(why)}</p>
      </div>`;
    const transitivity = `
      <div class="vt-intro">${vt.intro.map(k => `
        <div class="vt-intro-card vt-intro-${k.type}">
          <div class="vt-intro-head">${typeTag(k.type)} <span lang="ja">${k.kanji}</span> · ${esc(k.name)}</div>
          <p>${esc(k.rule)}</p>
          <div class="vt-intro-example"><span lang="ja">${furi(k.example).replace(/([がを])/, '<span class="vp-p">$1</span>')}</span> <span class="vt-intro-en">${esc(k.en)}</span></div>
        </div>`).join('')}
      </div>
      <p class="vt-tap-hint">Tap any pair below to see both verbs in a sentence and why each one is transitive or intransitive.</p>
      <ul class="vt-tips">${vt.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
      ${vt.groups.map(g => `
        <div class="vt-group">
          <div class="vt-group-title">${g.vi === 'other' ? 'Other pairs' : `<span lang="ja">${g.vi}</span> intransitive ↔ <span lang="ja">${g.vt}</span> transitive`}${g.note ? ` <span class="vt-group-note">— ${esc(g.note)}</span>` : ''}</div>
          <div class="vp-table-wrap">
            <table class="ref-table vt-table">
              <thead><tr><th>${typeTag('vi')} が</th><th>${typeTag('vt')} を</th><th>Meaning</th></tr></thead>
              <tbody>${g.pairs.map(p => `
                <tr class="vt-row" tabindex="0" aria-expanded="false" title="Show example sentences">
                  <td lang="ja">${withParticle(p.noun, 'が', p.vi)}</td>
                  <td lang="ja">${withParticle(p.noun, 'を', p.vt)}</td>
                  <td class="vp-en">${esc(p.en)}<span class="vt-row-chevron" aria-hidden="true"></span></td>
                </tr>
                <tr class="vt-detail" hidden>
                  <td colspan="3"><div class="vt-ex-pair">${exampleBlock('vi', p.vi, p.ex.vi)}${exampleBlock('vt', p.vt, p.ex.vt)}</div></td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>`).join('')}
      ${vt.only.map(o => `
        <div class="vt-only">${typeTag(o.type)} <span class="vt-only-label">${esc(o.label)}:</span>
          <span lang="ja">${o.verbs.map(furi).join('、')}</span></div>`).join('')}
      <p class="vt-source">Pairs grouped after the <a href="https://www.mlcjapanese.co.jp/Download/ViVt.pdf" target="_blank" rel="noopener">MLC Japanese 自動詞と他動詞 chart</a>.</p>`;
    if (!el.dataset.vtBound) {
      el.dataset.vtBound = '1';
      const toggle = row => {
        const detail = row.nextElementSibling;
        const open = detail.hidden;
        detail.hidden = !open;
        row.setAttribute('aria-expanded', String(open));
      };
      el.addEventListener('click', e => {
        const row = e.target.closest('.vt-row');
        if (row) toggle(row);
      });
      el.addEventListener('keydown', e => {
        const row = e.target.closest('.vt-row');
        if (row && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(row); }
      });
    }
    el.innerHTML = `
      <details class="ref-verb-types" open>
        <summary class="ref-disclosure">
          <span class="ref-disclosure-icon" aria-hidden="true">に</span>
          <span class="ref-disclosure-text">
            <span class="ref-disclosure-title">The rules</span>
            <span class="ref-disclosure-sub">Which particle a verb takes depends on the role the noun plays</span>
          </span>
          <span class="ref-disclosure-chevron" aria-hidden="true"></span>
        </summary>
        <div class="ref-exc-body">${rules}</div>
      </details>
      <details class="ref-verb-types" open>
        <summary class="ref-disclosure">
          <span class="ref-disclosure-icon" aria-hidden="true">自</span>
          <span class="ref-disclosure-text">
            <span class="ref-disclosure-title">Transitive or intransitive? 自動詞と他動詞</span>
            <span class="ref-disclosure-sub">が with intransitive, を with transitive · ${pairCount} verb pairs · tap a pair for examples</span>
          </span>
          <span class="ref-disclosure-chevron" aria-hidden="true"></span>
        </summary>
        <div class="ref-exc-body">${transitivity}</div>
      </details>
      <details class="ref-verb-types" open>
        <summary class="ref-disclosure">
          <span class="ref-disclosure-icon" aria-hidden="true">食</span>
          <span class="ref-disclosure-text">
            <span class="ref-disclosure-title">Common verbs and their particles</span>
            <span class="ref-disclosure-sub">${window.VERB_PARTICLE_VERBS.length} everyday verbs · 〔…〕 is the noun that goes before the particle · 自 vi = intransitive, 他 vt = transitive</span>
          </span>
          <span class="ref-disclosure-chevron" aria-hidden="true"></span>
        </summary>
        <div class="ref-exc-body">
          <div class="vp-table-wrap">
            <table class="ref-table vp-table">
              <thead><tr><th>Verb</th><th>Meaning</th><th>Particles</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      </details>`;
  }

  function renderParticlesPanel() {
    renderParticleToggles();
    const verbs = getParticlesQuizType() === 'verbs';
    const toggleRow = $('#particles-toggle-row');
    if (toggleRow) toggleRow.classList.toggle('hidden', verbs);
    const introS = $('#particles-intro-sentences');
    const introV = $('#particles-intro-verbs');
    if (introS) introS.classList.toggle('hidden', verbs);
    if (introV) introV.classList.toggle('hidden', !verbs);
    const ref = $('#verb-particles-reference');
    if (ref) {
      if (verbs) renderVerbParticlesReference();
      ref.classList.toggle('hidden', !verbs);
    }
    const startBtn = $('#btn-start-particles');
    if (startBtn) startBtn.textContent = verbs ? 'Start Verb + Particle quiz' : 'Start Sentences quiz';
    const pool = getParticlesPool();
    const due = pool.filter(item => isDue(getCardState(srsData, item.id))).length;
    const el = $('#particles-due-count');
    if (el) el.textContent = due;
  }

  function pickParticleChoices(item) {
    const distractors = (item.wrong || window.PARTICLE_DISTRACTOR_GROUPS[item.particle] || []).slice();
    shuffle(distractors);
    const result = [item.particle, ...distractors.slice(0, 3)];
    shuffle(result);
    return result;
  }

  function startParticlesStudy(cont) {
    const pool = getParticlesPool();
    if (pool.length === 0) return;

    const due = pool.filter(item => isDue(getCardState(srsData, item.id)));
    const verbs = getParticlesQuizType() === 'verbs';
    particlesSessionCards = pickBatch(verbs ? 'particles-verbs' : 'particles', due, pool, cont);
    const label = $('#particles-prompt-label');
    if (label) label.textContent = verbs ? 'Which particle goes with the verb?' : 'Which particle fits?';

    particlesIndex = 0;
    particlesCorrect = 0;
    particlesTotal = particlesSessionCards.length;
    particlesUndoStack = [];

    showScreen('particles');
    $('#particles-session-complete').classList.add('hidden');
    $('#particles-card').classList.remove('hidden');
    showParticleCard();
  }

  function updateParticlesUndoButton() {
    const btn = $('#btn-particles-undo');
    if (btn) btn.classList.toggle('hidden', particlesUndoStack.length === 0);
  }

  function showParticleCard() {
    if (particlesIndex >= particlesSessionCards.length) {
      finishParticlesSession();
      return;
    }

    particlesAnswered = false;
    currentParticleCard = particlesSessionCards[particlesIndex];

    const pct = (particlesIndex / particlesTotal) * 100;
    $('#particles-bar-fill').style.width = pct + '%';
    $('#particles-progress-text').textContent = `${particlesIndex + 1} / ${particlesTotal}`;

    $('#particles-before').innerHTML = settings.showFurigana ? currentParticleCard.beforeHtml : currentParticleCard.beforePlain;
    $('#particles-after').innerHTML = settings.showFurigana ? currentParticleCard.afterHtml : currentParticleCard.afterPlain;
    $('#particles-en').textContent = currentParticleCard.en;

    currentParticleChoices = pickParticleChoices(currentParticleCard);
    $$('.particle-choice').forEach((btn, i) => {
      btn.textContent = currentParticleChoices[i];
      btn.className = 'particle-choice';
      btn.disabled = false;
    });

    $('#particles-next-area').classList.add('hidden');
    $('#particles-explanation').classList.add('hidden');
    updateParticlesUndoButton();
  }

  function chooseParticleAnswer(choiceIndex) {
    if (particlesAnswered || !currentParticleCard) return;
    if (choiceIndex < 0 || choiceIndex >= currentParticleChoices.length) return;
    particlesAnswered = true;

    const correct = currentParticleChoices[choiceIndex] === currentParticleCard.particle;

    $$('.particle-choice').forEach((btn, i) => {
      btn.disabled = true;
      if (currentParticleChoices[i] === currentParticleCard.particle) {
        btn.classList.add('correct');
      } else if (i === choiceIndex) {
        btn.classList.add('wrong');
      }
    });

    // Explain this sentence: why its particle fits, and why each of the
    // other choices offered doesn't.
    const explanationEl = $('#particles-explanation');
    if (explanationEl) {
      explanationEl.innerHTML = particleExplanationHtml(currentParticleCard, currentParticleChoices, correct);
      explanationEl.classList.remove('hidden');
    }

    const id = currentParticleCard.id;

    particlesUndoStack.push({
      cardId: id,
      prevSrsState: srsData[id] ? { ...srsData[id] } : null,
      prevStats: { ...statsData },
      index: particlesIndex,
      correct: particlesCorrect,
    });

    const state = getCardState(srsData, id);
    srsData[id] = gradeCard(state, correct ? 4 : 1);
    saveSRS(srsData);

    updateStreak();
    statsData.todayReviews = (statsData.todayReviews || 0) + 1;
    if (correct) {
      statsData.todayCorrect = (statsData.todayCorrect || 0) + 1;
      particlesCorrect++;
    }
    saveStats(statsData);
    flashSaveIndicator();

    $('#particles-next-area').classList.remove('hidden');
    updateParticlesUndoButton();
  }

  function particleExplanationHtml(card, choices, correct) {
    const esc = t => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const fmt = t => esc(t).replace(/\*([^*]+)\*/g, '<em>$1</em>');
    const note = card.note || (window.PARTICLE_NOTES || {})[card.itemId];
    const why = note ? note.why : ((window.PARTICLE_EXPLANATIONS || {})[card.particle] || '');
    let html = `<div class="particle-why"><span class="particle-tag particle-tag-ok" lang="ja">${card.particle}</span>`
      + `<span>${correct ? '' : `The answer is ${card.particle}. `}${fmt(why)}</span></div>`;
    if (note) {
      choices.filter(p => p !== card.particle && note.not[p]).forEach(p => {
        html += `<div class="particle-why"><span class="particle-tag particle-tag-ng" lang="ja">${p}</span><span>${fmt(note.not[p])}</span></div>`;
      });
    }
    return html;
  }

  function advanceParticles() {
    if (!particlesAnswered) return;
    particlesIndex++;
    showParticleCard();
  }

  function undoLastParticleGrade() {
    if (particlesUndoStack.length === 0) return;

    const undo = particlesUndoStack.pop();

    if (undo.prevSrsState) {
      srsData[undo.cardId] = undo.prevSrsState;
    } else {
      delete srsData[undo.cardId];
    }
    saveSRS(srsData);

    statsData = { ...undo.prevStats };
    saveStats(statsData);

    particlesIndex = undo.index;
    particlesCorrect = undo.correct;

    $('#particles-session-complete').classList.add('hidden');
    $('#particles-card').classList.remove('hidden');

    showParticleCard();
    flashSaveIndicator();
  }

  function finishParticlesSession() {
    particlesAnswered = false;
    currentParticleCard = null;

    $('#particles-card').classList.add('hidden');
    $('#particles-session-complete').classList.remove('hidden');
    $('#particles-session-total').textContent = particlesTotal;
    $('#particles-session-correct').textContent = particlesCorrect;
    $('#particles-session-accuracy').textContent = (particlesTotal > 0 ? Math.round((particlesCorrect / particlesTotal) * 100) : 0) + '%';
    setContinueButton('#btn-particles-continue', 'Next 20 →', () => startParticlesStudy(true));
  }

  // ─── Confusable kanji browse page (confusable-kanji.html) ──────────────────────
  //
  // Static reference view of the same confusable-group data the quiz above
  // draws from — search/filter only, no SRS state.

  function getConfusableBrowseLevels() {
    return KANJI_QUIZ_LEVELS.filter(level => {
      const el = $(`#confusable-browse-toggle-${level}`);
      return el && el.checked;
    });
  }

  function renderConfusableBrowsePage() {
    const grid = $('#confusable-group-grid');
    if (!grid) return;

    const groups = window.CONFUSABLE_KANJI_GROUPS || [];
    const levels = getConfusableBrowseLevels();
    const query = ($('#confusable-browse-search')?.value || '').trim().toLowerCase();

    // A search narrows to groups with a matching member, but still shows the
    // whole group (level-filtered) rather than just the matching kanji —
    // the point of browsing is seeing what a kanji gets confused with.
    const filtered = groups
      .map(group => {
        const kanji = group.kanji.filter(k => levels.includes(group.levels[k].toLowerCase()));
        const hasMatch = !query || kanji.some(k => k === query || group.meanings[k].toLowerCase().includes(query));
        return { group, kanji, hasMatch };
      })
      .filter(({ kanji, hasMatch }) => kanji.length > 1 && hasMatch);

    grid.innerHTML = filtered.map(({ group, kanji }) => `
      <div class="confusable-group-card">
        <div class="confusable-group-meta">${kanji.length} similar kanji</div>
        <div class="confusable-group-kanji-list">
          ${kanji.map(k => `
            <div class="confusable-kanji-item">
              <div class="confusable-kanji-glyph">${k}</div>
              <div class="confusable-kanji-meaning">${group.meanings[k]}</div>
              <div class="confusable-kanji-level">${group.levels[k]}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    const totalKanji = filtered.reduce((sum, { kanji }) => sum + kanji.length, 0);
    const count = $('#confusable-browse-count');
    if (count) count.textContent = `${filtered.length} groups · ${totalKanji} kanji`;

    grid.classList.toggle('hidden', filtered.length === 0);
    const empty = $('#confusable-empty');
    if (empty) empty.classList.toggle('hidden', filtered.length !== 0);
  }

  // ─── Kanji hover reference page (kanji-hover.html) ──────────────────────────────
  //
  // Same kanji + meaning pairs as the printable answer-key sheets, but browsable
  // on screen: one side is hidden per card until you hover (peek) or click (reveal
  // for good). No SRS state — this is a reference, not a quiz.

  function getKanjiHoverLevels() {
    return KANJI_QUIZ_LEVELS.filter(level => {
      const el = $(`#kanji-hover-toggle-${level}`);
      return el && el.checked;
    });
  }

  function getKanjiHoverDirection() {
    const checked = document.querySelector('input[name="kanji-hover-direction"]:checked');
    return checked ? checked.value : 'kanji-to-meaning';
  }

  function buildKanjiHoverPool() {
    const items = [];
    getKanjiHoverLevels().forEach(level => {
      (KANJI_QUIZ_DATA[level] || []).forEach(k => items.push({ level, kanji: k.kanji, meaning: k.meaning }));
    });
    return items;
  }

  // Shuffled order survives a direction toggle (same pool, just which side is
  // shown), but is dropped whenever the level filters change the pool itself.
  let kanjiHoverOrder = null;

  function resetKanjiHoverOrder() {
    kanjiHoverOrder = null;
    renderKanjiHoverPage();
  }

  function shuffleKanjiHoverOrder() {
    kanjiHoverOrder = buildKanjiHoverPool();
    shuffle(kanjiHoverOrder);
    renderKanjiHoverPage();
  }

  function renderKanjiHoverPage() {
    const grid = $('#kanji-hover-grid');
    if (!grid) return;

    const showKanjiFirst = getKanjiHoverDirection() === 'kanji-to-meaning';
    const items = kanjiHoverOrder || buildKanjiHoverPool();

    grid.innerHTML = items.map(({ level, kanji, meaning }) => {
      const promptText = showKanjiFirst ? kanji : meaning;
      const answerText = showKanjiFirst ? meaning : kanji;
      const promptClass = showKanjiFirst ? 'kanji-hover-glyph' : 'kanji-hover-text';
      const answerClass = showKanjiFirst ? 'kanji-hover-text' : 'kanji-hover-glyph';
      return `
        <div class="kanji-hover-card">
          <div class="kanji-hover-level">${level}</div>
          ${window.KanjiCards ? `<span class="kanji-hover-add">${KanjiCards.buttonHtml(kanji)}</span>` : ''}
          <div class="kanji-hover-prompt ${promptClass}">${promptText}</div>
          <div class="kanji-hover-answer ${answerClass}">${answerText}</div>
        </div>
      `;
    }).join('');

    const count = $('#kanji-hover-count');
    if (count) count.textContent = `${items.length} kanji`;

    grid.classList.toggle('hidden', items.length === 0);
    const empty = $('#kanji-hover-empty');
    if (empty) empty.classList.toggle('hidden', items.length !== 0);
  }

  // ─── Vocabulary hover reference page (vocabulary.html) ──────────────────────────
  //
  // Same hover-to-peek / click-to-reveal mechanic as the Kanji Hover page above,
  // but for JLPT N5-N3 vocabulary, with an extra setting for how the Japanese
  // side of each card is written: kanji, furigana (kanji + reading), or the
  // reading spelled out entirely in hiragana/katakana.

  const VOCAB_LEVELS = ['n5', 'n4', 'n3'];

  function getVocabLevels() {
    return VOCAB_LEVELS.filter(level => {
      const el = $(`#vocab-toggle-${level}`);
      return el && el.checked;
    });
  }

  function getVocabDirection() {
    const checked = document.querySelector('input[name="vocab-direction"]:checked');
    return checked ? checked.value : 'word-to-meaning';
  }

  function getVocabScript() {
    const checked = document.querySelector('input[name="vocab-script"]:checked');
    return checked ? checked.value : 'kanji';
  }

  // In Picture → Word mode only words with a drawing (vocab-pictures.js) are
  // shown, each once: a word listed at several levels (上 is N5 and, with
  // other meanings, N3 too) belongs to its first entry, N5 before N3.
  function vocabPictureEntries() {
    const seen = new Set();
    const entries = new Set();
    VOCAB_LEVELS.forEach(level => (VOCAB_DATA[level] || []).forEach(w => {
      if (seen.has(w.kanji)) return;
      seen.add(w.kanji);
      if (VOCAB_PICTURES[w.kanji]) entries.add(w);
    }));
    return entries;
  }

  function buildVocabPool() {
    const pictureMode = getVocabDirection() === 'picture-to-word';
    const withPicture = pictureMode ? vocabPictureEntries() : null;
    const items = [];
    getVocabLevels().forEach(level => {
      (VOCAB_DATA[level] || []).forEach(w => {
        if (withPicture && !withPicture.has(w)) return;
        items.push({ level, kanji: w.kanji, kana: w.kana, html: w.html, meaning: w.meaning });
      });
    });
    return items;
  }

  function vocabPictureHtml(kanji) {
    const spec = VOCAB_PICTURES[kanji];
    const art = ListeningArt;
    let html;
    if (typeof spec === 'string') html = art.icon(spec);
    else if (spec.person) html = art.person(typeof spec.person === 'string' ? art.ROLES[spec.person] : spec.person);
    else if (spec.people) html = `<div class="lis-art-items vocab-pic-people">${spec.people.map(role => art.person(art.ROLES[role])).join('')}</div>`;
    else html = art.picture({ type: 'items', items: spec.items });
    // A few drawings carry a label (the 駅 sign, the 辞書 cover): drop any
    // that would spell out the answer.
    html = html.replace(/<text[^>]*>([^<]*)<\/text>/g, (m, t) => ([...t].some(ch => kanji.includes(ch)) ? '' : m));
    return `<div class="vocab-pic">${html}</div>`;
  }

  // Shuffled order survives a direction/script toggle (same pool, just how it's
  // displayed), but is dropped whenever the level filters change the pool itself.
  let vocabOrder = null;

  function resetVocabOrder() {
    vocabOrder = null;
    renderVocabPage();
  }

  function shuffleVocabOrder() {
    vocabOrder = buildVocabPool();
    shuffle(vocabOrder);
    renderVocabPage();
  }

  function vocabWordHtml(item, script) {
    if (script === 'kana') return item.kana;
    // 'furigana' shows the reading above the kanji at all times; 'kanji' uses
    // the same ruby markup but CSS keeps the reading invisible until the card
    // is hovered or revealed, so a kanji-only card still lets you peek the
    // hiragana without permanently showing it.
    return item.html;
  }

  const VOCAB_KANJI_CHAR_RE = /[一-鿿㐀-䶿々]/g;

  // Shown under the word on hover/reveal, breaking it down into its
  // individual kanji with each one's own meaning and on'yomi/kun'yomi
  // reading (from kanji-info-data.js) — separate from the whole-word
  // reading already shown by the furigana/peek above. Each kanji has a ＋ to
  // save it as a kanji flashcard (kanji-cards.js), remembering `from`, the
  // word it was spotted in.
  function vocabKanjiBreakdownHtml(kanjiText, from) {
    if (typeof KANJI_INFO === 'undefined') return '';
    const chars = kanjiText.match(VOCAB_KANJI_CHAR_RE);
    if (!chars) return '';

    const seen = new Set();
    const rows = [];
    chars.forEach(ch => {
      if (seen.has(ch)) return;
      seen.add(ch);
      const info = KANJI_INFO[ch];
      if (!info) return;
      const readings = [
        info.on ? `on: ${info.on}` : '',
        info.kun ? `kun: ${info.kun}` : '',
      ].filter(Boolean).join('  ');
      rows.push(`
        <div class="vocab-kanji-breakdown-row">
          <span class="vocab-kanji-breakdown-char">${ch}</span>
          <span class="vocab-kanji-breakdown-info">
            ${info.meaning ? `<span class="vocab-kanji-breakdown-meaning">${info.meaning}</span>` : ''}
            ${readings ? `<span class="vocab-kanji-breakdown-reading">${readings}</span>` : ''}
          </span>
          ${window.KanjiCards && info.meaning ? KanjiCards.buttonHtml(ch, Object.assign({ word: kanjiText }, from)) : ''}
        </div>
      `);
    });

    if (!rows.length) return '';
    return `<div class="vocab-kanji-breakdown"><div class="vocab-kanji-breakdown-inner">${rows.join('')}</div></div>`;
  }

  // ── Vocabulary words in the flashcard deck ──
  //
  // The page shares the Stories flashcard deck (tokidoki_story_words, also
  // fed by the mystery game). A word counts as saved when the deck holds it
  // under its own spelling, or under a glossary key with the same spelling
  // and reading (後(あと) for 後/あと). Added words use the glossary's key and
  // definition when it has the word; otherwise they keep this list's reading
  // and meaning themselves, keyed 漢字(かな) if the glossary's 漢字 reads
  // differently.

  let vocabRendered = [];

  function vocabDeckKey(item, words) {
    if (words[item.kanji]) {
      const gloss = storyWordGloss(item.kanji, words[item.kanji]);
      if (!gloss || gloss[0] === item.kana || words[item.kanji].vocab) return item.kanji;
    }
    return Object.keys(words).find(key => {
      if (key === item.kanji || storyDisplayWord(key) !== item.kanji) return false;
      const gloss = storyWordGloss(key, words[key]);
      return gloss && gloss[0] === item.kana;
    }) || null;
  }

  function toggleVocabFlashcard(item) {
    const words = loadStoryWords();
    const saved = vocabDeckKey(item, words);
    if (saved) {
      delete words[saved];
      deleteDeckSRS(storyWordCardId(saved));
      saveSRS(srsData);
    } else {
      const glossary = window.STORY_GLOSSARY || {};
      const glossKey = Object.keys(glossary).find(k => storyDisplayWord(k) === item.kanji && glossary[k][0] === item.kana);
      const key = glossKey || (words[item.kanji] || glossary[item.kanji] ? `${item.kanji}(${item.kana})` : item.kanji);
      words[key] = { vocab: item.level, kana: item.kana, meaning: item.meaning, added: Date.now() };
    }
    saveStoryWords(words);
    return !saved;
  }

  function vocabDeckButtonHtml(saved) {
    return saved
      ? '<span aria-hidden="true">−</span>'
      : '<span aria-hidden="true">＋</span>';
  }

  function setVocabCardSaved(card, item, saved) {
    card.classList.toggle('in-deck', saved);
    const btn = card.querySelector('.vocab-deck-btn');
    btn.innerHTML = vocabDeckButtonHtml(saved);
    btn.setAttribute('aria-pressed', saved);
    btn.title = saved ? 'In your flashcards — click to remove' : 'Add to flashcards';
    btn.setAttribute('aria-label', `${saved ? 'Remove' : 'Add'} ${item.kanji} ${saved ? 'from' : 'to'} flashcards`);
  }

  function renderVocabDeckStatus() {
    const el = $('#vocab-deck-status');
    if (!el) return;
    const words = loadStoryWords();
    const n = Object.keys(words).length;
    const k = getKanjiDeck().length;
    const kanjiNote = k
      ? ` · <b>${k}</b> kanji in your <a href="flashcards.html#kanji">kanji flashcards</a>.`
      : ' Hover or tap a card to see its kanji, and ＋ one to make it a kanji flashcard.';
    el.innerHTML = (n
      ? `📚 <b>${n}</b> word${n === 1 ? '' : 's'} in your flashcards — <a href="flashcards.html">review them on the Flashcards page</a>. Words already in them have an orange outline; click ＋ on a card to add it, − to remove it.`
      : '📚 Click ＋ on a card to add the word to your flashcards, then review them on the <a href="flashcards.html">Flashcards page</a>.') + kanjiNote;
  }

  function onVocabDeckClick(btn) {
    const card = btn.closest('.kanji-hover-card');
    const item = vocabRendered[+card.dataset.i];
    if (!item) return;
    const saved = toggleVocabFlashcard(item);
    if (!saved && $('#vocab-only-deck') && $('#vocab-only-deck').checked) {
      renderVocabPage();
    } else {
      // Every card for the same word (one per level it's listed at) follows.
      $$('#vocab-grid .kanji-hover-card').forEach(c => {
        const other = vocabRendered[+c.dataset.i];
        if (other && other.kanji === item.kanji && other.kana === item.kana) setVocabCardSaved(c, other, saved);
      });
    }
    renderVocabDeckStatus();
  }

  // 🔊 / 🐢 on each card, and "Speak words on click", come from pronounce.js.
  // The kana reading is spoken rather than the kanji, so the voice can't
  // misread it.
  const pronounceButtons = (kana, cls) => (window.Pronounce ? Pronounce.buttonsHtml(kana, cls) : '');
  const pronounceOnClick = (kana) => { if (window.Pronounce) Pronounce.onClick(kana); };

  // A word's kanji, each with its meaning, readings and a button to save it
  // as a kanji flashcard; and the same as a row of small buttons, for lists.
  // See kanji-cards.js.
  const kanjiBreakdownHtml = (word, from, opts) => (window.KanjiCards ? KanjiCards.breakdownHtml(word, from, opts) : '');
  const kanjiChipsHtml = (word, from, skip) => (window.KanjiCards ? KanjiCards.chipsHtml(word, from, skip) : '');

  function renderVocabPage() {
    const grid = $('#vocab-grid');
    if (!grid) return;

    const direction = getVocabDirection();
    const showWordFirst = direction === 'word-to-meaning';
    const pictureMode = direction === 'picture-to-word';
    const script = getVocabScript();
    const words = loadStoryWords();
    const onlyDeck = $('#vocab-only-deck') && $('#vocab-only-deck').checked;
    let items = vocabOrder || buildVocabPool();
    if (onlyDeck) items = items.filter(item => vocabDeckKey(item, words));
    vocabRendered = items;

    grid.classList.toggle('vocab-pic-grid', pictureMode);
    grid.innerHTML = items.map((item, i) => {
      const saved = !!vocabDeckKey(item, words);
      const wordHtml = vocabWordHtml(item, script);
      // Attached to the card itself (not the word cell) so it drops in below
      // the whole card — including the meaning — instead of overlapping
      // whichever side the word happens to be on.
      const breakdownHtml = vocabKanjiBreakdownHtml(item.kanji, { reading: item.kana, meaning: item.meaning });
      const wordClass = 'vocab-hover-word' + (script === 'kanji' ? ' vocab-word-peek' : '');
      let promptHtml = showWordFirst ? wordHtml : item.meaning;
      let answerHtml = showWordFirst ? item.meaning : wordHtml;
      let promptClass = showWordFirst ? wordClass : 'kanji-hover-text';
      const answerClass = showWordFirst ? 'kanji-hover-text' : wordClass;
      if (pictureMode) {
        promptHtml = vocabPictureHtml(item.kanji);
        promptClass = 'vocab-pic-prompt';
        answerHtml = `${wordHtml}<span class="vocab-pic-meaning">${item.meaning}</span>`;
      }
      return `
        <div class="kanji-hover-card${saved ? ' in-deck' : ''}" data-i="${i}">
          <div class="kanji-hover-level">${item.level}</div>
          <button type="button" class="vocab-deck-btn" aria-pressed="${saved}"
            title="${saved ? 'In your flashcards — click to remove' : 'Add to flashcards'}"
            aria-label="${saved ? 'Remove' : 'Add'} ${item.kanji} ${saved ? 'from' : 'to'} flashcards">${vocabDeckButtonHtml(saved)}</button>
          ${pronounceButtons(item.kana, 'vocab-speak')}
          <div class="kanji-hover-prompt ${promptClass}">${promptHtml}</div>
          <div class="kanji-hover-answer ${answerClass}">${answerHtml}</div>
          ${breakdownHtml}
        </div>
      `;
    }).join('');

    const count = $('#vocab-count');
    if (count) count.textContent = `${items.length} words${pictureMode ? ' with pictures' : ''}${onlyDeck ? ' in your flashcards' : ''}`;
    renderVocabDeckStatus();

    grid.classList.toggle('hidden', items.length === 0);
    const empty = $('#vocab-empty');
    if (empty) empty.classList.toggle('hidden', items.length !== 0);
  }

  // ─── Words by kanji page (words-by-kanji.html) ───────────────────────────────
  //
  // Browse kanji (same JLPT N5-N1 lists as Kanji Hover); clicking one opens an
  // overlay listing every vocabulary word from vocabulary-data.js (N5-N3 only,
  // so N2/N1 kanji will often come up empty) that contains it, with its
  // reading and meaning.

  // Built lazily from VOCAB_DATA and cached: { [kanji]: [{ level, html, meaning }] }.
  let wbkKanjiToWords = null;

  function buildWbkIndex() {
    const index = {};
    ['n5', 'n4', 'n3'].forEach(level => {
      (VOCAB_DATA[level] || []).forEach(w => {
        const chars = w.kanji.match(VOCAB_KANJI_CHAR_RE);
        if (!chars) return;
        const seen = new Set();
        chars.forEach(ch => {
          if (seen.has(ch)) return;
          seen.add(ch);
          (index[ch] || (index[ch] = [])).push({ level, kanji: w.kanji, html: w.html, kana: w.kana, meaning: w.meaning });
        });
      });
    });
    return index;
  }

  function getWbkIndex() {
    if (!wbkKanjiToWords) wbkKanjiToWords = buildWbkIndex();
    return wbkKanjiToWords;
  }

  function getWbkLevels() {
    return KANJI_QUIZ_LEVELS.filter(level => {
      const el = $(`#wbk-toggle-${level}`);
      return el && el.checked;
    });
  }

  function renderWbkPage() {
    const grid = $('#wbk-grid');
    if (!grid) return;

    const levels = getWbkLevels();
    const query = ($('#wbk-search')?.value || '').trim().toLowerCase();
    const wordIndex = getWbkIndex();

    const items = [];
    levels.forEach(level => {
      (KANJI_QUIZ_DATA[level] || []).forEach(k => {
        if (query && k.kanji !== query && !k.meaning.toLowerCase().includes(query)) return;
        items.push({ level, kanji: k.kanji, meaning: k.meaning, count: (wordIndex[k.kanji] || []).length });
      });
    });

    grid.innerHTML = items.map(item => `
      <div class="wbk-kanji-card" data-kanji="${item.kanji}">
        <div class="kanji-hover-level">${item.level}</div>
        <div class="wbk-kanji-glyph">${item.kanji}</div>
        <div class="wbk-kanji-meaning">${item.meaning}</div>
        <div class="wbk-kanji-count">${item.count ? `${item.count} word${item.count === 1 ? '' : 's'}` : 'no words yet'}</div>
      </div>
    `).join('');

    const count = $('#wbk-count');
    if (count) count.textContent = `${items.length} kanji`;

    grid.classList.toggle('hidden', items.length === 0);
    const empty = $('#wbk-empty');
    if (empty) empty.classList.toggle('hidden', items.length !== 0);
  }

  function openWbkOverlay(kanji) {
    const overlay = $('#wbk-overlay');
    if (!overlay) return;

    const kanjiEntry = KANJI_QUIZ_LEVELS
      .map(level => (KANJI_QUIZ_DATA[level] || []).find(k => k.kanji === kanji))
      .find(Boolean);
    const info = (typeof KANJI_INFO !== 'undefined') ? KANJI_INFO[kanji] : null;
    const words = (getWbkIndex()[kanji] || [])
      .slice()
      .sort((a, b) => KANJI_QUIZ_LEVELS.indexOf(a.level) - KANJI_QUIZ_LEVELS.indexOf(b.level));

    const title = $('#wbk-overlay-title');
    if (title) title.textContent = `Words using ${kanji}`;

    const infoBox = $('#wbk-overlay-kanji-info');
    if (infoBox) {
      const meaning = (info && info.meaning) || (kanjiEntry && kanjiEntry.meaning) || '';
      const readings = info
        ? [info.on ? `on: ${info.on}` : '', info.kun ? `kun: ${info.kun}` : ''].filter(Boolean).join('  ')
        : '';
      infoBox.innerHTML = `
        <span class="wbk-kanji-info-glyph">${kanji}</span>
        <div class="wbk-kanji-info-text">
          ${meaning ? `<div class="wbk-kanji-info-meaning">${meaning}</div>` : ''}
          ${readings ? `<div class="wbk-kanji-info-reading">${readings}</div>` : ''}
        </div>
        ${window.KanjiCards && meaning ? KanjiCards.buttonHtml(kanji, null, { look: 'label' }) : ''}
      `;
    }

    // Each word can go into the word flashcards (＋ Word), and each of its
    // kanji into the kanji flashcards.
    wbkOverlayWords = words;
    const deckWords = loadStoryWords();
    const list = $('#wbk-overlay-words');
    if (list) {
      list.innerHTML = words.length
        ? words.map((w, i) => `
            <div class="wbk-word-row" data-kana="${w.kana}">
              <span class="wbk-word-jp">${w.html}</span>
              ${pronounceButtons(w.kana)}
              <span class="kanji-hover-level">${w.level}</span>
              <span class="wbk-word-meaning">${w.meaning}</span>
              <span class="wbk-word-actions">
                ${wbkWordButtonHtml(i, !!vocabDeckKey(w, deckWords))}
                ${kanjiChipsHtml(w.kanji, { reading: w.kana, meaning: w.meaning }, kanji)}
              </span>
            </div>
          `).join('')
        : `<p class="tab-intro">No word in this list (N5–N3 vocabulary) uses this kanji yet.</p>`;
    }

    overlay.classList.remove('hidden');
  }

  let wbkOverlayWords = [];

  function wbkWordButtonHtml(i, saved) {
    const w = wbkOverlayWords[i];
    return `<button type="button" class="wbk-word-add${saved ? ' saved' : ''}" data-i="${i}" aria-pressed="${saved}"
      title="${saved ? 'In your word flashcards — click to remove' : 'Add this word to your flashcards'}"
      aria-label="${saved ? 'Remove' : 'Add'} ${w.kanji} ${saved ? 'from' : 'to'} word flashcards">${saved ? '✓ Word' : '＋ Word'}</button>`;
  }

  function closeWbkOverlay() {
    const overlay = $('#wbk-overlay');
    if (overlay) overlay.classList.add('hidden');
  }

  // ─── Stories page (stories.html) ──────────────────────────────────────────────
  //
  // Graded readers from stories-data.js, grouped by JLPT level. In the reader,
  // tapping a word looks it up (and can add it to a personal flashcard deck),
  // and tapping a sentence lists the grammar it uses, highlighting where each
  // point appears. Saved words are reviewed on the Flashcards page
  // (flashcards.html, data-mode="flashcards", which runs the deck code below);
  // their schedules live in the shared SRS store under `story_word:<key>`
  // (so Reset All Progress resets them), while the deck itself — which words,
  // and the sentence each was saved from — lives under its own key.
  //
  // The Memes & Jokes page (memes.html, data-mode="memes") runs this same
  // reader over MEMES_DATA from memes-data.js, and saves into the same deck.
  //
  // Kanji flashcards are a second deck (kanji-cards.js): a looked-up word
  // lists its kanji, each of which can be saved on its own. flashcards.html
  // shows the two under Words / Kanji tabs, and reviews whichever is open;
  // the Stories and Memes pages just link there with the number due.

  const STORY_LEVELS = ['n5', 'n4', 'n3'];
  const STORY_LEVEL_BLURB = {
    n5: 'Short sentences in です / ます form: particles, adjectives, 〜ている.',
    n4: 'Linked clauses: 〜たら, 〜ので, 〜てしまう, giving and receiving.',
    n3: 'Plain-form narration: passive, causative, hearsay and nuance.',
  };
  const MEME_LEVEL_BLURB = {
    n5: 'Puns, net slang and pop culture in simple です / ます Japanese.',
    n4: 'Riddles, slang and office humour: 〜たら, 〜ながら, potential forms.',
    n3: 'Anime catchphrases, rakugo and slang in plain-form narration.',
  };
  const MEME_KINDS = {
    dajare: 'ダジャレ · Pun',
    slang: 'スラング · Slang',
    pop: 'ポップカルチャー · Pop culture',
    story: '笑い話 · Funny story',
    riddle: 'なぞなぞ · Riddle',
    senryu: '川柳 · Comic poem',
    meme: 'ミーム · Meme',
    twister: '早口言葉 · Tongue twister',
    aruaru: 'あるある · So true',
    trivia: '雑学 · Fun fact',
    kotowaza: 'ことわざ · Proverb',
  };
  const MEME_SIZES = {
    short: '⚡ Quick ones',
    long: '📖 Longer reads',
  };
  const STORY_WORDS_KEY = 'tokidoki_story_words';
  const STORY_PUNCT = new Set(['。', '、', '「', '」', '『', '』', '？', '！', '…']);
  const STORY_FURIGANA_RE = /([一-鿿々]+)\[([^\]]+)\]/g;

  let currentStory = null;
  let storySelection = null;       // { type: 'word' | 'sentence', s, t }
  let storyActiveGrammar = null;   // index into the selected sentence's grammar list
  let storyReviewCards = [];
  let storyReviewIndex = 0;
  let storyReviewCorrect = 0;
  let storyReviewAnswered = false;

  function storyRubyHtml(text) {
    return text.replace(STORY_FURIGANA_RE, '<ruby>$1<rp>(</rp><rt>$2</rt><rp>)</rp></ruby>');
  }

  function storyPlainText(text) {
    return text.replace(STORY_FURIGANA_RE, '$1');
  }

  function storyTextHtml(text) {
    return settings.showFurigana ? storyRubyHtml(text) : storyPlainText(text);
  }

  // Glossary keys can carry a "(disambiguation)" suffix — never shown.
  function storyDisplayWord(key) {
    return key.replace(/\(.*\)$/, '');
  }

  // A glossary word with its whole-word reading lined up against its kanji,
  // in 漢字[かんじ] markup: 食べる + たべる → 食[た]べる. Kana-only words come
  // back unchanged; if the kana around the kanji don't line up, the whole
  // word gets the reading.
  function storyWordFurigana(word, reading) {
    const KANJI = /[一-鿿々]/;
    if (!KANJI.test(word)) return word;
    const parts = word.match(/[一-鿿々]+|[^一-鿿々]+/g);
    const pattern = parts.map(p => KANJI.test(p) ? '(.+?)' : `(${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`).join('');
    const m = reading.match(new RegExp(`^${pattern}$`));
    if (!m) return `${word}[${reading}]`;
    return parts.map((p, i) => KANJI.test(p) ? `${p}[${m[i + 1]}]` : p).join('');
  }

  // Flashcard text with or without furigana, per the flashcard setting.
  // What to say for a piece of story text: the furigana readings in place
  // of their kanji, so the voice reads them the way the story does.
  function storyKana(text) {
    return text.replace(STORY_FURIGANA_RE, '$2');
  }
  function storySentenceKana(sentence) {
    return parseStorySentence(sentence).filter(t => t.key).map(t => storyKana(t.surface)).join('');
  }
  // For reading a whole story aloud: punctuation kept, so the voice pauses.
  function storySentenceSpeech(sentence) {
    return parseStorySentence(sentence).map(t => storyKana(t.surface)).join('');
  }

  function storyCardHtml(text) {
    return settings.flashcardFurigana ? storyRubyHtml(text) : storyPlainText(text);
  }

  // Splits a sentence into tokens: { surface, plain, key } — key is null for
  // punctuation, which isn't clickable.
  function parseStorySentence(sentence) {
    if (sentence._tokens) return sentence._tokens;
    sentence._tokens = sentence.jp.split(' ').map(tok => {
      if (STORY_PUNCT.has(tok)) return { surface: tok, plain: tok, key: null };
      const [surface, override] = tok.split('>');
      const plain = storyPlainText(surface);
      return { surface, plain, key: override || plain };
    });
    return sentence._tokens;
  }

  function parseStoryGrammarRef(ref) {
    const i = ref.indexOf(':');
    return i === -1 ? { id: ref, snippet: '' } : { id: ref.slice(0, i), snippet: ref.slice(i + 1) };
  }

  // Token indices covering the first occurrence of `snippet` in the sentence.
  function storySnippetTokens(sentence, snippet) {
    const tokens = parseStorySentence(sentence);
    const plain = tokens.map(t => t.plain).join('');
    const start = snippet ? plain.indexOf(snippet) : -1;
    if (start === -1) return [];
    const end = start + snippet.length;
    const hits = [];
    let pos = 0;
    tokens.forEach((t, i) => {
      const tStart = pos;
      pos += t.plain.length;
      if (t.key && tStart < end && pos > start) hits.push(i);
    });
    return hits;
  }

  function readerIsMemes() {
    return document.body.dataset.mode === 'memes';
  }

  // The stories, or on the Memes & Jokes page the memes.
  function readerItems() {
    return (readerIsMemes() ? window.MEMES_DATA : window.STORIES_DATA) || [];
  }

  function getStory(id) {
    return readerItems().find(s => s.id === id) || null;
  }

  // A story or meme by id, whichever page we're on (and whichever is loaded).
  function findReaderItem(id) {
    return [...(window.STORIES_DATA || []), ...(window.MEMES_DATA || [])].find(s => s.id === id) || null;
  }

  // The sentence a saved word came from: a story's or meme's, or — for words
  // saved in the mystery game (mystery.html), or on a page that doesn't load
  // that story or meme — the line stored with the word itself.
  function storyWordSource(meta) {
    const story = findReaderItem(meta.story);
    if (story && story.sentences[meta.s]) {
      return { sentence: story.sentences[meta.s], title: story.titleEn, level: story.level.toUpperCase() };
    }
    if (meta.jp) return { sentence: { jp: meta.jp, en: meta.en || '' }, title: meta.title || '', level: meta.level || '' };
    return null;
  }

  // ── Flashcard deck ──

  function loadStoryWords() {
    try { return JSON.parse(localStorage.getItem(STORY_WORDS_KEY)) || {}; }
    catch { return {}; }
  }

  function saveStoryWords(words) {
    localStorage.setItem(STORY_WORDS_KEY, JSON.stringify(words));
  }

  function storyWordCardId(key) {
    return `story_word:${key}`;
  }

  // Both decks review either way round: Japanese → meaning (the card's own
  // id, as always) or meaning → Japanese, scheduled apart under `<id>:recall`
  // so knowing one direction doesn't skip the other.
  const RECALL_SUFFIX = ':recall';

  function deckDirection() {
    return settings.deckDirection === 'meaning' ? 'meaning' : 'ja';
  }

  function deckCardId(c) {
    return deckDirection() === 'meaning' ? c.id + RECALL_SUFFIX : c.id;
  }

  // Drops a removed card's schedules, both directions.
  function deleteDeckSRS(id) {
    delete srsData[id];
    delete srsData[id + RECALL_SUFFIX];
  }

  function isStoryWordSaved(key) {
    return Object.prototype.hasOwnProperty.call(loadStoryWords(), key);
  }

  function toggleStoryWord(key, storyId, sentenceIndex) {
    const words = loadStoryWords();
    if (words[key]) {
      delete words[key];
      deleteDeckSRS(storyWordCardId(key));
      saveSRS(srsData);
    } else {
      words[key] = { story: storyId, s: sentenceIndex, added: Date.now() };
      // Keep the sentence and definition with the word, so its card still
      // works on pages that don't load this story's or meme's data.
      const item = findReaderItem(storyId);
      const sentence = item && item.sentences[sentenceIndex];
      if (sentence) Object.assign(words[key], { jp: sentence.jp, en: sentence.en, title: item.titleEn, level: item.level.toUpperCase() });
      const gloss = (window.STORY_GLOSSARY || {})[key];
      if (gloss) words[key].gloss = gloss;
    }
    saveStoryWords(words);
  }

  // A saved word's [reading, meaning, part of speech]: from the stories'
  // glossary, or — for words added on the Vocabulary page that the glossary
  // lacks — from the word itself.
  function storyWordGloss(key, meta) {
    const glossary = window.STORY_GLOSSARY || {};
    if (glossary[key]) return glossary[key];
    if (meta && meta.gloss) return meta.gloss;
    if (meta && meta.vocab) return [meta.kana, meta.meaning, `JLPT ${meta.vocab.toUpperCase()} vocabulary`];
    return null;
  }

  function getStoryDeck() {
    return Object.entries(loadStoryWords())
      .map(([key, meta]) => ({ key, meta, id: storyWordCardId(key), gloss: storyWordGloss(key, meta) }))
      .filter(c => c.gloss)
      .sort((a, b) => b.meta.added - a.meta.added);
  }

  function countDueStoryWords() {
    return getStoryDeck().filter(c => isDue(getCardState(srsData, deckCardId(c)))).length;
  }

  // ── List screen ──

  function renderStoriesPage() {
    const list = $('#story-list');
    if (!list) return;

    renderFlashcardsLink();
    if (readerIsMemes()) {
      renderMemesList(list);
      return;
    }

    const stories = window.STORIES_DATA || [];
    list.innerHTML = STORY_LEVELS.map(level => {
      const items = stories.filter(s => s.level === level);
      if (items.length === 0) return '';
      return `
        <section class="story-level">
          <h2 class="story-level-title"><span class="story-level-badge">${level.toUpperCase()}</span>${STORY_LEVEL_BLURB[level]}</h2>
          <div class="chapter-grid">
            ${items.map(s => `
              <a class="chapter-card story-card" href="#${s.id}" data-story="${s.id}">
                <div class="chapter-card-title story-card-title">${storyRubyHtml(s.title)}</div>
                <div class="chapter-card-sub">${s.titleEn}</div>
                <div class="chapter-card-sub">${s.sentences.length} sentences</div>
              </a>
            `).join('')}
          </div>
        </section>
      `;
    }).join('');

    renderStoryDeck();
  }

  // Which tab a meme is listed under: short (a line or three) or long.
  function memeSize(m) {
    return m.size === 'short' ? 'short' : 'long';
  }

  // Memes & Jokes list: a Quick / Longer tab, filter chips by kind, then the
  // cards by JLPT level.
  function renderMemesList(list) {
    const all = window.MEMES_DATA || [];
    const size = MEME_SIZES[settings.memeSize] ? settings.memeSize : 'short';
    const sizes = $('#meme-sizes');
    if (sizes) {
      sizes.innerHTML = Object.keys(MEME_SIZES).map(k => `
        <button type="button" class="meme-size${k === size ? ' active' : ''}" data-size="${k}" role="tab" aria-selected="${k === size}">
          ${MEME_SIZES[k]} <span class="meme-size-count">${all.filter(m => memeSize(m) === k).length}</span>
        </button>
      `).join('');
    }
    const memes = all.filter(m => memeSize(m) === size);
    const kind = MEME_KINDS[settings.memeKind] && memes.some(m => m.kind === settings.memeKind) ? settings.memeKind : 'all';
    const filters = $('#meme-filters');
    if (filters) {
      const kinds = Object.keys(MEME_KINDS).filter(k => memes.some(m => m.kind === k));
      filters.innerHTML = ['all', ...kinds].map(k => `
        <button type="button" class="meme-filter${k === kind ? ' active' : ''}" data-kind="${k}" aria-pressed="${k === kind}">
          ${k === 'all' ? 'All' : MEME_KINDS[k]}
        </button>
      `).join('');
    }
    const shown = kind === 'all' ? memes : memes.filter(m => m.kind === kind);
    list.innerHTML = STORY_LEVELS.map(level => {
      const items = shown.filter(m => m.level === level);
      if (items.length === 0) return '';
      return `
        <section class="story-level">
          <h2 class="story-level-title"><span class="story-level-badge">${level.toUpperCase()}</span>${MEME_LEVEL_BLURB[level]}</h2>
          <div class="chapter-grid">
            ${items.map(m => `
              <a class="chapter-card story-card meme-card" href="#${m.id}" data-story="${m.id}">
                <div class="meme-card-emoji" aria-hidden="true">${m.emoji}</div>
                <div class="meme-card-kind">${MEME_KINDS[m.kind]}</div>
                <div class="chapter-card-title story-card-title">${storyRubyHtml(m.title)}</div>
                <div class="chapter-card-sub">${m.titleEn}</div>
              </a>
            `).join('')}
          </div>
        </section>
      `;
    }).join('');
  }

  // The deck screen has a tab each for word and kanji flashcards; the due
  // count, Review button, list and export all follow the open tab.
  function storyDeckTab() {
    return settings.deckTab === 'kanji' ? 'kanji' : 'words';
  }

  function setStoryDeckTab(tab) {
    settings.deckTab = tab;
    saveSettings(settings);
    renderStoryDeck();
  }

  function getKanjiDeck() {
    return window.KanjiCards ? KanjiCards.list() : [];
  }

  // The Stories and Memes pages link to flashcards.html with the number due.
  function renderFlashcardsLink() {
    const el = $('#flashcards-link-due');
    if (el) el.textContent = countDueStoryWords() + countDueKanjiCards();
  }

  function closeFlashcardReview() {
    showScreen('chapters');
    renderStoryDeck();
  }

  function countDueKanjiCards() {
    return getKanjiDeck().filter(c => isDue(getCardState(srsData, deckCardId(c)))).length;
  }

  function renderStoryDeck() {
    const tab = storyDeckTab();
    const words = getStoryDeck();
    const kanji = getKanjiDeck();
    const deck = tab === 'kanji' ? kanji : words;
    const due = deck.filter(c => isDue(getCardState(srsData, deckCardId(c)))).length;
    const noun = tab === 'kanji' ? 'kanji' : 'word';

    $$('input[name="deck-direction"]').forEach(el => { el.checked = el.value === deckDirection(); });
    $$('.deck-direction-ja').forEach(el => { el.textContent = tab === 'kanji' ? 'Kanji' : 'Word'; });

    $$('.deck-tab').forEach(btn => {
      const on = btn.dataset.deckTab === tab;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', on);
    });
    const wordCount = $('#deck-tab-count-words');
    if (wordCount) wordCount.textContent = words.length;
    const kanjiCount = $('#deck-tab-count-kanji');
    if (kanjiCount) kanjiCount.textContent = kanji.length;

    const dueEl = $('#story-deck-due');
    if (dueEl) dueEl.textContent = due;
    const dueLabel = $('#story-deck-due-label');
    if (dueLabel) dueLabel.textContent = `${noun} flashcards due`;
    const totalEl = $('#story-deck-total');
    if (totalEl) totalEl.textContent = tab === 'kanji' ? `${kanji.length} saved kanji` : `${words.length} saved word${words.length === 1 ? '' : 's'}`;

    const btn = $('#btn-story-review');
    if (btn) {
      btn.disabled = deck.length === 0;
      btn.textContent = deck.length === 0 ? (tab === 'kanji' ? 'No kanji yet' : 'No words yet') : due > 0 ? 'Review' : 'Practice all';
    }

    const exportRow = $('#story-export');
    if (exportRow) exportRow.classList.toggle('hidden', deck.length === 0);
    $$('.flashcard-furigana-toggle').forEach(el => { el.checked = !!settings.flashcardFurigana; });

    const listEl = $('#story-deck-list');
    if (!listEl) return;
    if (tab === 'kanji') {
      listEl.innerHTML = kanji.length
        ? kanji.map(c => `
            <li class="story-deck-row kanji-deck-row">
              <span class="story-deck-word kanji-deck-char" lang="ja">${c.kanji}</span>
              <span class="story-deck-reading" lang="ja">${KanjiCards.readingsText(c.info)}</span>
              <span class="story-deck-meaning">${c.info.meaning}${(c.meta.words || []).length ? `<span class="kanji-deck-from" lang="ja"> · ${c.meta.words.map(w => w.word).join('、')}</span>` : ''}</span>
              <button class="story-deck-remove" data-kanji="${c.kanji}" aria-label="Remove ${c.kanji} from kanji flashcards" title="Remove">✕</button>
            </li>
          `).join('')
        : `<li class="story-deck-empty">Look up a word anywhere on the site — in a <a href="stories.html">story</a> or <a href="memes.html">joke</a>, the <a href="vocabulary.html">Vocabulary</a> page, <a href="words-by-kanji.html">Words by Kanji</a> — and press “＋ Kanji card” next to any of its kanji.</li>`;
      return;
    }
    listEl.innerHTML = words.length
      ? words.map(c => `
          <li class="story-deck-row">
            <span class="story-deck-word">${storyDisplayWord(c.key)}</span>
            <span class="story-deck-reading">${c.gloss[0] !== storyDisplayWord(c.key) ? c.gloss[0] : ''}</span>
            <span class="story-deck-meaning">${c.gloss[1]}</span>
            ${kanjiChipsHtml(storyDisplayWord(c.key), { reading: c.gloss[0], meaning: c.gloss[1] })}
            ${pronounceButtons(c.gloss[0])}
            <button class="story-deck-remove" data-word="${c.key}" aria-label="Remove ${storyDisplayWord(c.key)} from flashcards" title="Remove">✕</button>
          </li>
        `).join('')
      : `<li class="story-deck-empty">Open a <a href="stories.html">story</a> or <a href="memes.html">joke</a> and tap any word you don't know, then “Add word to flashcards” — or press ＋ on the <a href="vocabulary.html">Vocabulary</a> page.</li>`;
  }

  // Saved words as plain objects for flashcard-export.js, oldest first so the
  // exported order matches the order they were collected in.
  function getStoryExportCards() {
    return getStoryDeck().reverse().map(c => {
      const src = storyWordSource(c.meta);
      const sentence = src && src.sentence;
      const [reading, meaning, pos] = c.gloss;
      return {
        key: c.key,
        word: storyDisplayWord(c.key),
        wordFurigana: storyWordFurigana(storyDisplayWord(c.key), c.gloss[0]),
        reading, meaning, pos,
        sentence: sentence ? sentence.jp.split(' ').map(t => t.split('>')[0]).join('') : '',
        sentenceEn: sentence ? sentence.en : '',
        story: src ? src.title : '',
        level: src ? src.level : (c.meta.vocab || '').toUpperCase(),
      };
    });
  }

  // Saved kanji in the same shape, oldest first: the kanji on the front, its
  // readings and meaning on the back, with the words it was saved from.
  function getKanjiExportCards() {
    return getKanjiDeck().reverse().map(c => ({
      key: `kanji:${c.kanji}`,
      word: c.kanji,
      wordFurigana: c.kanji,
      reading: KanjiCards.readingsText(c.info),
      meaning: c.info.meaning,
      pos: 'Kanji',
      sentence: (c.meta.words || []).map(w => w.reading && w.reading !== w.word ? storyWordFurigana(w.word, w.reading) : w.word).join('、'),
      sentenceEn: (c.meta.words || []).map(w => w.meaning).filter(Boolean).join(' · '),
      story: '',
      level: (c.info.level || '').toUpperCase(),
    }));
  }

  async function exportStoryDeck(format) {
    const cards = storyDeckTab() === 'kanji' ? getKanjiExportCards() : getStoryExportCards();
    const status = $('#story-export-status');
    if (cards.length === 0 || !window.FlashcardExport) return;
    const setStatus = (text) => { if (status) status.textContent = text; };
    const opts = { furigana: !!settings.flashcardFurigana };
    try {
      if (format === 'anki') {
        setStatus('Building Anki deck…');
        await FlashcardExport.exportAnki(cards, opts);
        setStatus(`Downloaded ${cards.length} cards — open the file with Anki to import.`);
      } else if (format === 'csv') {
        FlashcardExport.exportCsv(cards, opts);
        setStatus(`Downloaded ${cards.length} cards as CSV.`);
      } else {
        FlashcardExport.exportPrint(cards, opts);
        setStatus('Opened printable cards — choose “Save as PDF” in the print dialog for a PDF.');
      }
    } catch (err) {
      setStatus(`Export failed: ${err.message}`);
    }
  }

  // ── Reader screen ──

  // ── Read the whole story aloud ──
  //
  // Sentence by sentence from the selected one (or the top), highlighting the
  // sentence being read. Pressing the button again stops.

  let storyReadingIndex = null;   // sentence being read aloud, or null

  function startStoryReading(slow) {
    if (!currentStory || !window.Pronounce) return;
    const from = storySelection ? storySelection.s : 0;
    const texts = currentStory.sentences.slice(from).map(storySentenceSpeech);
    Pronounce.speakAll(texts, {
      slow,
      onStart: i => markStoryReading(from + i, slow),
      onDone: () => markStoryReading(null),
    });
  }

  function stopStoryReading() {
    if (storyReadingIndex !== null && window.Pronounce) Pronounce.stop();
    markStoryReading(null);
  }

  function markStoryReading(si, slow) {
    storyReadingIndex = si;
    $$('#story-text .story-sentence').forEach(el => {
      el.classList.toggle('reading', Number(el.dataset.s) === si);
    });
    const el = si === null ? null : $(`#story-text .story-sentence[data-s="${si}"]`);
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    renderStoryReadButtons(si === null ? null : !!slow);
  }

  // `readingSlow`: null when idle, else whether the slow reading is playing.
  function renderStoryReadButtons(readingSlow) {
    const supported = !!(window.Pronounce && Pronounce.supported);
    const normal = $('#btn-story-read');
    const slow = $('#btn-story-read-slow');
    if (normal) {
      normal.classList.toggle('hidden', !supported);
      normal.innerHTML = readingSlow === false ? '■ Stop' : '▶ Read aloud';
      normal.setAttribute('aria-pressed', readingSlow === false);
    }
    if (slow) {
      slow.classList.toggle('hidden', !supported);
      slow.innerHTML = readingSlow === true ? '■ Stop' : '🐢 Slowly';
      slow.setAttribute('aria-pressed', readingSlow === true);
    }
  }

  function openStory(id) {
    const story = getStory(id);
    if (!story) return;
    stopStoryReading();
    currentStory = story;
    storySelection = null;
    storyActiveGrammar = null;
    if (location.hash !== `#${id}`) history.replaceState(null, '', `#${id}`);
    showScreen('story');
    renderStoryReader();
    window.scrollTo(0, 0);
  }

  function closeStory() {
    stopStoryReading();
    currentStory = null;
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    showScreen('chapters');
    renderStoriesPage();
  }

  function renderStoryReader() {
    const story = currentStory;
    if (!story) return;

    $('#story-level').textContent = story.level.toUpperCase();
    $('#story-title').innerHTML = storyTextHtml(story.title);
    $('#story-title-en').textContent = story.titleEn;
    const kindEl = $('#story-kind');
    if (kindEl) kindEl.textContent = story.kind ? `${story.emoji || ''} ${MEME_KINDS[story.kind] || ''}`.trim() : '';
    const punchEl = $('#story-punch');
    if (punchEl) {
      punchEl.classList.toggle('hidden', !story.punch);
      punchEl.open = false;
      punchEl.innerHTML = story.punch ? `<summary>💡 Why it's funny</summary><p>${story.punch}</p>` : '';
    }
    $('#story-toggle-furigana').checked = settings.showFurigana;
    $('#story-toggle-english').checked = !!settings.storyShowEnglish;

    const saved = loadStoryWords();
    $('#story-text').innerHTML = story.sentences.map((sentence, si) => {
      const tokensHtml = parseStorySentence(sentence).map((t, ti) => {
        if (!t.key) return `<span class="story-punct">${t.surface}</span>`;
        const cls = 'story-word' + (saved[t.key] ? ' saved' : '');
        return `<span class="${cls}" data-s="${si}" data-t="${ti}" role="button" tabindex="0">${storyTextHtml(t.surface)}</span>`;
      }).join('');
      return `
        <div class="story-sentence" data-s="${si}">
          <button class="story-sentence-num" data-s="${si}" aria-label="Grammar in sentence ${si + 1}" title="Show grammar">${si + 1}</button>
          <div class="story-sentence-body">
            <div class="story-jp" lang="ja">${tokensHtml}</div>
            <div class="story-en">${sentence.en}</div>
          </div>
        </div>
      `;
    }).join('');

    $('#story-text').classList.toggle('show-english', !!settings.storyShowEnglish);
    if (storyReadingIndex !== null) {
      const el = $(`#story-text .story-sentence[data-s="${storyReadingIndex}"]`);
      if (el) el.classList.add('reading');
    } else {
      renderStoryReadButtons(null);
    }

    // On the memes page, Previous / Next stay within the same tab, N5 first.
    const stories = readerIsMemes()
      ? readerItems().filter(m => memeSize(m) === memeSize(story))
        .sort((a, b) => STORY_LEVELS.indexOf(a.level) - STORY_LEVELS.indexOf(b.level))
      : readerItems();
    const idx = stories.indexOf(story);
    const prev = stories[idx - 1];
    const next = stories[idx + 1];
    const prevBtn = $('#btn-story-prev');
    const nextBtn = $('#btn-story-next');
    prevBtn.classList.toggle('hidden', !prev);
    nextBtn.classList.toggle('hidden', !next);
    if (prev) { prevBtn.dataset.story = prev.id; prevBtn.textContent = `← ${prev.titleEn}`; }
    if (next) { nextBtn.dataset.story = next.id; nextBtn.textContent = `${next.titleEn} →`; }

    renderStorySelection();
  }

  function selectStoryWord(si, ti) {
    storySelection = { type: 'word', s: si, t: ti };
    storyActiveGrammar = null;
    renderStorySelection();
  }

  function selectStorySentence(si) {
    storySelection = { type: 'sentence', s: si };
    storyActiveGrammar = null;
    renderStorySelection();
  }

  function clearStorySelection() {
    storySelection = null;
    storyActiveGrammar = null;
    renderStorySelection();
  }

  function renderStorySelection() {
    const text = $('#story-text');
    const panel = $('#story-panel');
    if (!text || !panel || !currentStory) return;

    const sel = storySelection;
    text.querySelectorAll('.story-sentence').forEach(el => {
      el.classList.toggle('selected', !!sel && Number(el.dataset.s) === sel.s);
    });
    text.querySelectorAll('.story-word').forEach(el => {
      el.classList.toggle('selected', !!sel && sel.type === 'word' &&
        Number(el.dataset.s) === sel.s && Number(el.dataset.t) === sel.t);
    });
    highlightStoryGrammar(storyActiveGrammar);

    panel.classList.toggle('open', !!sel);
    const body = $('#story-panel-body');
    if (!sel) {
      body.innerHTML = `
        <p class="story-panel-empty">
          Tap a <strong>word</strong> to look it up and add it to your flashcards.<br>
          Tap a <strong>sentence number</strong> (or the space beside a sentence) to see its grammar.
        </p>`;
      return;
    }

    const sentence = currentStory.sentences[sel.s];
    if (sel.type === 'word') {
      const token = parseStorySentence(sentence)[sel.t];
      const [reading, meaning, pos] = window.STORY_GLOSSARY[token.key];
      const word = storyDisplayWord(token.key);
      const savedNow = isStoryWordSaved(token.key);
      body.innerHTML = `
        <div class="story-panel-kicker">Word</div>
        <div class="story-panel-word" lang="ja">${word}</div>
        ${reading !== word ? `<div class="story-panel-reading" lang="ja">${reading}</div>` : ''}
        ${pronounceButtons(reading, 'story-panel-speak')}
        <div class="story-panel-pos">${pos}</div>
        <div class="story-panel-meaning">${meaning}</div>
        ${token.plain !== word ? `<div class="story-panel-form">In the text: <span lang="ja">${token.plain}</span>${pronounceButtons(storyKana(token.surface))}</div>` : ''}
        <button class="${savedNow ? 'btn-secondary' : 'btn-primary'} story-panel-add" id="btn-story-add-word">
          ${savedNow ? '✓ In word flashcards — remove' : '＋ Add word to flashcards'}
        </button>
        ${kanjiBreakdownHtml(word, { reading, meaning })}
        <button class="story-panel-link" id="btn-story-word-sentence">Grammar in this sentence →</button>
      `;
      return;
    }

    const items = sentence.grammar.map((ref, gi) => {
      const { id, snippet } = parseStoryGrammarRef(ref);
      const g = window.STORY_GRAMMAR[id];
      if (!g) return '';
      return `
        <li class="story-grammar-item${storyActiveGrammar === gi ? ' active' : ''}" data-g="${gi}" tabindex="0">
          <div class="story-grammar-head">
            <span class="story-grammar-title">${g.title}</span>
            <span class="story-grammar-level">${g.level}</span>
          </div>
          <div class="story-grammar-pattern" lang="ja">${g.pattern}</div>
          <div class="story-grammar-note">${g.note}</div>
          ${snippet ? `<div class="story-grammar-here">Here: <span lang="ja">${snippet}</span></div>` : ''}
        </li>
      `;
    }).join('');
    body.innerHTML = `
      <div class="story-panel-kicker">Sentence ${sel.s + 1}</div>
      <div class="story-panel-sentence" lang="ja">${storyRubyHtml(sentence.jp.split(' ').map(t => t.split('>')[0]).join(''))}</div>
      ${pronounceButtons(storySentenceKana(sentence), 'story-panel-speak')}
      <div class="story-panel-en">${sentence.en}</div>
      <div class="story-panel-kicker">Grammar</div>
      <ul class="story-grammar-list">${items}</ul>
    `;
  }

  // Highlights the words a grammar point covers, or clears highlights for null.
  function highlightStoryGrammar(gi) {
    const text = $('#story-text');
    if (!text) return;
    text.querySelectorAll('.story-word.grammar-hit').forEach(el => el.classList.remove('grammar-hit'));
    if (gi === null || !storySelection || storySelection.type !== 'sentence') return;
    const sentence = currentStory.sentences[storySelection.s];
    const ref = sentence.grammar[gi];
    if (!ref) return;
    storySnippetTokens(sentence, parseStoryGrammarRef(ref).snippet).forEach(ti => {
      const el = text.querySelector(`.story-word[data-s="${storySelection.s}"][data-t="${ti}"]`);
      if (el) el.classList.add('grammar-hit');
    });
  }

  // ── Flashcard review ──

  // Reviews the open tab's deck: words, or kanji (cards with a `kanji`).
  function startStoryReview(cont) {
    const kanji = storyDeckTab() === 'kanji';
    const recall = deckDirection() === 'meaning';
    const deck = (kanji ? getKanjiDeck() : getStoryDeck()).map(c => ({ ...c, id: deckCardId(c), recall }));
    if (deck.length === 0) return;
    const due = deck.filter(c => isDue(getCardState(srsData, c.id)));
    storyReviewCards = pickBatch(`${kanji ? 'kanji-review' : 'story-review'}${recall ? '-recall' : ''}`, due, deck, cont);
    storyReviewIndex = 0;
    storyReviewCorrect = 0;

    showScreen('story-review');
    $('#story-review-complete').classList.add('hidden');
    $('#story-review-card').classList.remove('hidden');
    showStoryReviewCard();
  }

  function showStoryReviewCard() {
    if (storyReviewIndex >= storyReviewCards.length) {
      finishStoryReview();
      return;
    }
    const card = storyReviewCards[storyReviewIndex];
    storyReviewAnswered = false;

    const total = storyReviewCards.length;
    $('#story-review-bar-fill').style.width = `${(storyReviewIndex / total) * 100}%`;
    $('#story-review-progress-text').textContent = `${storyReviewIndex + 1} / ${total}`;

    $('#story-review-reveal-area').classList.remove('hidden');
    $('#story-review-answer-area').classList.add('hidden');
    const label = $('#story-review-label');
    if (label) {
      label.textContent = card.recall
        ? (card.kanji ? 'Recall the kanji' : 'Recall the word')
        : (card.kanji ? 'Recall the meaning and readings' : 'Recall the reading and meaning');
    }

    // Meaning → Japanese puts the meaning on the front; the Japanese itself
    // is on the back, in #story-review-answer-word (renderStoryReviewText).
    const answerWord = card.recall ? '<div id="story-review-answer-word" class="story-review-answer-word" lang="ja"></div>' : '';

    if (card.kanji) {
      const { meaning, on, kun } = card.info;
      $('#story-review-answer').innerHTML = `
        ${answerWord}
        ${card.recall ? '' : `<div class="story-panel-meaning">${meaning}</div>`}
        ${on ? `<div class="kanji-review-reading" lang="ja"><span>on</span> ${on}</div>` : ''}
        ${kun ? `<div class="kanji-review-reading" lang="ja"><span>kun</span> ${kun}</div>` : ''}
      `;
      renderStoryReviewText();
      return;
    }

    const [reading, meaning, pos] = card.gloss;
    const word = storyDisplayWord(card.key);
    $('#story-review-answer').innerHTML = `
      ${answerWord}
      ${reading !== word ? `<div class="story-panel-reading" lang="ja">${reading}</div>` : ''}
      ${pronounceButtons(reading, 'story-panel-speak')}
      ${card.recall ? '' : `<div class="story-panel-meaning">${meaning}</div>`}
      <div class="story-panel-pos">${pos}</div>
      ${kanjiBreakdownHtml(word, { reading, meaning })}
    `;
    renderStoryReviewText();
  }

  // Words the kanji was saved from, then other vocabulary using it (when the
  // page has vocabulary-data.js), up to five in all.
  function kanjiReviewExamples(card) {
    const out = (card.meta.words || []).map(w => ({ word: w.word, reading: w.reading, meaning: w.meaning, saved: true }));
    if (typeof VOCAB_DATA !== 'undefined') {
      for (const level of ['n5', 'n4', 'n3']) {
        for (const w of VOCAB_DATA[level] || []) {
          if (out.length >= 5) break;
          if (w.kanji.includes(card.kanji) && !out.some(o => o.word === w.kanji)) out.push({ word: w.kanji, reading: w.kana, meaning: w.meaning });
        }
      }
    }
    return out.slice(0, 5);
  }

  // The card's Japanese — the word on the front and the sentence it was saved
  // from (word highlighted) on the back — with or without furigana. Re-run
  // when the furigana setting changes mid-card.
  function renderStoryReviewText() {
    const card = storyReviewCards[storyReviewIndex];
    if (!card) return;
    const prompt = $('#story-review-prompt');
    const answerWord = $('#story-review-answer-word');
    prompt.classList.toggle('story-review-prompt-meaning', !!card.recall);
    if (card.kanji) {
      const glyph = `<span class="kanji-review-char">${card.kanji}</span>`;
      if (card.recall) {
        prompt.textContent = card.info.meaning;
        if (answerWord) answerWord.innerHTML = glyph;
      } else {
        prompt.innerHTML = glyph;
      }
      const examples = kanjiReviewExamples(card);
      $('#story-review-context').innerHTML = examples.length ? `
        <div class="story-review-context-src">Words with ${card.kanji}</div>
        <ul class="kanji-review-words">
          ${examples.map(w => `
            <li${w.saved ? ' class="saved-from"' : ''}>
              <span class="kanji-review-word" lang="ja">${storyCardHtml(w.reading && w.reading !== w.word ? storyWordFurigana(w.word, w.reading) : w.word)}</span>
              <span class="kanji-review-word-meaning">${w.meaning || ''}</span>
            </li>`).join('')}
        </ul>` : '';
      return;
    }
    const [reading, meaning] = card.gloss;
    const wordHtml = storyCardHtml(storyWordFurigana(storyDisplayWord(card.key), reading));
    if (card.recall) {
      prompt.textContent = meaning;
      if (answerWord) answerWord.innerHTML = wordHtml;
    } else {
      prompt.innerHTML = wordHtml;
    }

    const src = storyWordSource(card.meta);
    const sentence = src && src.sentence;
    const ctx = $('#story-review-context');
    if (sentence) {
      const html = parseStorySentence(sentence).map(t => {
        const piece = storyCardHtml(t.surface);
        return t.key === card.key ? `<mark>${piece}</mark>` : piece;
      }).join('');
      ctx.innerHTML = `
        <div class="story-review-context-jp" lang="ja">${html}</div>
        <div class="story-review-context-en">${sentence.en}</div>
        <div class="story-review-context-src">from “${src.title}”</div>
      `;
    } else {
      ctx.innerHTML = '';
    }
  }

  function setFlashcardFurigana(on) {
    settings.flashcardFurigana = on;
    saveSettings(settings);
    $$('.flashcard-furigana-toggle').forEach(el => { el.checked = on; });
    renderStoryReviewText();
  }

  function revealStoryReviewAnswer() {
    if (storyReviewAnswered) return;
    storyReviewAnswered = true;
    const card = storyReviewCards[storyReviewIndex];
    if (card && card.gloss) pronounceOnClick(card.gloss[0]);
    $('#story-review-reveal-area').classList.add('hidden');
    $('#story-review-answer-area').classList.remove('hidden');
  }

  function gradeStoryReviewAndAdvance(grade) {
    if (!storyReviewAnswered) return;
    const card = storyReviewCards[storyReviewIndex];
    srsData[card.id] = gradeCard(getCardState(srsData, card.id), grade);
    saveSRS(srsData);
    flashSaveIndicator();
    if (grade > 1) storyReviewCorrect++;
    storyReviewIndex++;
    showStoryReviewCard();
  }

  function finishStoryReview() {
    $('#story-review-card').classList.add('hidden');
    $('#story-review-complete').classList.remove('hidden');
    $('#story-review-bar-fill').style.width = '100%';
    const total = storyReviewCards.length;
    $('#story-review-total').textContent = total;
    $('#story-review-correct').textContent = storyReviewCorrect;
    $('#story-review-accuracy').textContent = total ? `${Math.round((storyReviewCorrect / total) * 100)}%` : '0%';
    setContinueButton('#btn-story-review-continue', 'Next 20 →', () => startStoryReview(true));
  }

  // ─── Bunkei drill (bunkei.html) ───────────────────────────────────────────────
  //
  // Pick a few verbs and some sentence patterns (bunkei-data.js), then
  // translate English sentences into Japanese — one verb at a time, through
  // every chosen pattern. Cards are scheduled in the shared SRS store under
  // `bunkei:<verb>:<pattern>`; the verb and pattern choices are remembered.

  const BUNKEI_KEY = 'tokidoki_bunkei';
  const BUNKEI_DEFAULT_VERBS = ['食べる', '行く', '書く'];

  let bunkeiVerbs = null;           // usable verbs, cached
  let bunkeiSessionCards = [];
  let bunkeiIndex = 0;
  let bunkeiCorrect = 0;
  let bunkeiAnswered = false;

  function bunkeiVerbKey(verb) {
    return verb.disambig ? `${verb.kanji}_${verb.disambig}` : verb.kanji;
  }

  function getBunkeiVerbs() {
    if (!bunkeiVerbs) bunkeiVerbs = window.Bunkei ? Bunkei.usableVerbs(GENKI_VERBS) : [];
    return bunkeiVerbs;
  }

  function loadBunkeiSettings() {
    const defaults = {
      verbs: BUNKEI_DEFAULT_VERBS,
      patterns: window.Bunkei ? Bunkei.PATTERNS.filter(p => p.level === 'N5' || p.level === 'N4').map(p => p.id) : [],
      typing: false,
      hint: true,
    };
    try { return { ...defaults, ...JSON.parse(localStorage.getItem(BUNKEI_KEY)) }; }
    catch { return defaults; }
  }

  function saveBunkeiSettings(data) {
    localStorage.setItem(BUNKEI_KEY, JSON.stringify(data));
  }

  let bunkeiSettings = null;

  function bunkeiSelectedVerbs() {
    const byKey = Object.fromEntries(getBunkeiVerbs().map(v => [bunkeiVerbKey(v), v]));
    return bunkeiSettings.verbs.map(k => byKey[k]).filter(Boolean);
  }

  // All cards for the current selection, verb by verb (patterns shuffled per verb).
  function bunkeiPool() {
    const selected = new Set(bunkeiSettings.patterns);
    const cards = [];
    bunkeiSelectedVerbs().forEach(verb => {
      const patterns = Bunkei.patternsFor(verb).filter(p => selected.has(p.id));
      shuffle(patterns);
      patterns.forEach(pattern => {
        cards.push({ verb, pattern, id: `bunkei:${bunkeiVerbKey(verb)}:${pattern.id}` });
      });
    });
    return cards;
  }

  function renderBunkeiPage() {
    if (!window.Bunkei || !$('#bunkei-verb-list')) return;
    if (!bunkeiSettings) bunkeiSettings = loadBunkeiSettings();

    $('#bunkei-toggle-typing').checked = !!bunkeiSettings.typing;
    $('#bunkei-toggle-hint').checked = !!bunkeiSettings.hint;

    renderBunkeiSelectedVerbs();
    renderBunkeiVerbList();
    renderBunkeiPatterns();
    renderBunkeiCount();
  }

  function renderBunkeiSelectedVerbs() {
    const el = $('#bunkei-selected');
    const verbs = bunkeiSelectedVerbs();
    el.innerHTML = verbs.length
      ? verbs.map(v => `
          <button class="bunkei-chip selected" data-verb="${bunkeiVerbKey(v)}" title="Remove">
            <span class="bunkei-chip-jp" lang="ja">${v.kanji}</span>
            <span class="bunkei-chip-meaning">${v.meaning.replace(/^to /, '')}</span>
            <span class="bunkei-chip-x" aria-hidden="true">✕</span>
          </button>`).join('')
      : '<p class="bunkei-empty">No verbs yet — pick some below, or roll three at random.</p>';
  }

  function renderBunkeiVerbList() {
    const query = ($('#bunkei-verb-search').value || '').trim().toLowerCase();
    const chosen = new Set(bunkeiSettings.verbs);
    const matches = v => !query || v.kanji.includes(query) || v.reading.includes(query) || v.meaning.toLowerCase().includes(query);
    const byChapter = {};
    getBunkeiVerbs().filter(matches).forEach(v => { (byChapter[v.chapter] = byChapter[v.chapter] || []).push(v); });
    const chapters = Object.keys(byChapter).map(Number).sort((a, b) => a - b);
    $('#bunkei-verb-list').innerHTML = chapters.length
      ? chapters.map(ch => `
          <div class="bunkei-verb-group">
            <div class="bunkei-verb-group-title">Genki ch. ${ch}</div>
            <div class="bunkei-verb-chips">
              ${byChapter[ch].map(v => `
                <button class="bunkei-chip${chosen.has(bunkeiVerbKey(v)) ? ' selected' : ''}" data-verb="${bunkeiVerbKey(v)}" aria-pressed="${chosen.has(bunkeiVerbKey(v))}">
                  <span class="bunkei-chip-jp" lang="ja">${v.kanji}</span>
                  <span class="bunkei-chip-meaning">${v.meaning.replace(/^to /, '')}</span>
                </button>`).join('')}
            </div>
          </div>`).join('')
      : '<p class="bunkei-empty">No verbs match that search.</p>';
  }

  function renderBunkeiPatterns() {
    const chosen = new Set(bunkeiSettings.patterns);
    $('#bunkei-patterns').innerHTML = Bunkei.LEVELS.map(level => {
      const patterns = Bunkei.PATTERNS.filter(p => p.level === level);
      const allOn = patterns.every(p => chosen.has(p.id));
      return `
        <div class="bunkei-pattern-group">
          <div class="bunkei-pattern-group-head">
            <span class="story-level-badge">${level}</span>
            <button class="bunkei-link" data-level-toggle="${level}">${allOn ? 'None' : 'All'}</button>
          </div>
          <div class="bunkei-pattern-chips">
            ${patterns.map(p => `
              <label class="bunkei-pattern${chosen.has(p.id) ? ' selected' : ''}">
                <input type="checkbox" data-pattern="${p.id}" ${chosen.has(p.id) ? 'checked' : ''}>
                <span class="bunkei-pattern-name" lang="ja">${p.name}</span>
                <span class="bunkei-pattern-meaning">${p.meaning}</span>
              </label>`).join('')}
          </div>
        </div>`;
    }).join('');
  }

  function renderBunkeiCount() {
    const pool = bunkeiPool();
    const due = pool.filter(c => isDue(getCardState(srsData, c.id))).length;
    $('#bunkei-count').textContent = pool.length;
    $('#bunkei-count-label').textContent = pool.length === 0
      ? 'sentences — pick at least one verb and pattern'
      : `sentences · ${due} due`;
    $('#btn-start-bunkei').disabled = pool.length === 0;
  }

  function toggleBunkeiVerb(key) {
    const list = bunkeiSettings.verbs;
    const i = list.indexOf(key);
    if (i === -1) list.push(key); else list.splice(i, 1);
    saveBunkeiSettings(bunkeiSettings);
    renderBunkeiSelectedVerbs();
    renderBunkeiVerbList();
    renderBunkeiCount();
  }

  // Adds `count` random verbs to the selection, skipping ones already picked.
  // Adds `count` random verbs, best fit for the selected patterns first.
  // With `reroll`, the current verbs are swapped out for new ones instead
  // (falling back to them only when there aren't enough others).
  function addRandomBunkeiVerbs(count, reroll) {
    if (reroll) {
      const previous = new Set(bunkeiSettings.verbs);
      const fresh = pickRandomBunkeiVerbs(count, previous);
      bunkeiSettings.verbs = fresh.length >= count ? fresh : [...fresh, ...pickRandomBunkeiVerbs(count - fresh.length, new Set(fresh))];
    } else {
      bunkeiSettings.verbs = [...bunkeiSettings.verbs, ...pickRandomBunkeiVerbs(count, new Set(bunkeiSettings.verbs))];
    }
    saveBunkeiSettings(bunkeiSettings);
    renderBunkeiPage();
  }

  // Prefers verbs that work with every selected pattern (〜前に, 〜ながら… only
  // suit some verbs); if too few do, takes the ones that work with the most.
  function pickRandomBunkeiVerbs(count, picked) {
    const selected = new Set(bunkeiSettings.patterns);
    const verbs = getBunkeiVerbs()
      .filter(v => !picked.has(bunkeiVerbKey(v)))
      .map(v => ({ v, fit: Bunkei.patternsFor(v).filter(p => selected.has(p.id)).length }))
      .filter(x => x.fit > 0 || selected.size === 0);
    shuffle(verbs);
    verbs.sort((a, b) => b.fit - a.fit);
    return verbs.slice(0, count).map(x => bunkeiVerbKey(x.v));
  }

  function startBunkeiStudy() {
    const pool = bunkeiPool();
    if (pool.length === 0) return;
    const due = pool.filter(c => isDue(getCardState(srsData, c.id)));
    bunkeiSessionCards = due.length > 0 ? due : pool;
    bunkeiIndex = 0;
    bunkeiCorrect = 0;
    showScreen('bunkei');
    $('#bunkei-session-complete').classList.add('hidden');
    $('#bunkei-card').classList.remove('hidden');
    showBunkeiCard();
  }

  function showBunkeiCard() {
    if (bunkeiIndex >= bunkeiSessionCards.length) {
      finishBunkeiSession();
      return;
    }
    const card = bunkeiSessionCards[bunkeiIndex];
    card.built = card.built || Bunkei.build(card.verb, card.pattern.id);
    bunkeiAnswered = false;

    const total = bunkeiSessionCards.length;
    $('#bunkei-bar-fill').style.width = `${(bunkeiIndex / total) * 100}%`;
    $('#bunkei-progress-text').textContent = `${bunkeiIndex + 1} / ${total}`;

    const verbs = [...new Set(bunkeiSessionCards.map(c => c.verb))];
    const verbNo = verbs.indexOf(card.verb) + 1;
    $('#bunkei-verb-badge').innerHTML = `
      <span class="bunkei-verb-jp" lang="ja">${card.verb.kanji}</span>
      ${card.verb.kanji !== card.verb.reading ? `<span class="bunkei-verb-reading" lang="ja">${card.verb.reading}</span>` : ''}
      <span class="bunkei-verb-meaning">${card.verb.meaning}</span>
      ${verbs.length > 1 ? `<span class="bunkei-verb-count">verb ${verbNo} of ${verbs.length}</span>` : ''}`;

    // Hover (or tap) an English word to see the Japanese word for it.
    if (window.EnHover) EnHover.render($('#bunkei-en'), card.built.en, { ja: card.built.plain, kana: card.built.kana, words: card.built.words });
    else $('#bunkei-en').textContent = card.built.en;
    const hint = $('#bunkei-pattern-hint');
    hint.innerHTML = `<span lang="ja">${card.pattern.name}</span> · ${card.pattern.meaning}`;
    hint.classList.toggle('hidden', !bunkeiSettings.hint);

    const typing = !!bunkeiSettings.typing;
    const input = $('#bunkei-input');
    if (window.Speech) Speech.stopAll();
    input.value = '';
    input.classList.remove('correct', 'incorrect');
    input.disabled = false;
    $('#bunkei-typing').classList.toggle('hidden', !typing);
    $('#bunkei-reveal-hint').textContent = typing ? 'Enter = check' : 'Tap the card or press Space';
    $('#bunkei-reveal-area').classList.remove('hidden');
    $('#bunkei-answer-area').classList.add('hidden');
    if (typing) setTimeout(() => input.focus(), 0);
  }

  function revealBunkeiAnswer() {
    if (bunkeiAnswered) return;
    bunkeiAnswered = true;
    if (window.EnHover) EnHover.hide();
    const card = bunkeiSessionCards[bunkeiIndex];
    const built = card.built;

    const input = $('#bunkei-input');
    if (window.Speech) Speech.stopAll();
    const typed = Romaji.flush(input).trim();
    const result = $('#bunkei-result');
    if (bunkeiSettings.typing && typed) {
      const ok = Bunkei.matches(typed, built);
      input.classList.add(ok ? 'correct' : 'incorrect');
      result.innerHTML = ok ? '<span class="bunkei-ok">✓ Correct</span>' : '<span class="bunkei-ng">✗ Not quite — compare with the answer</span>';
      if (!ok && window.AnswerDiff) {
        const target = AnswerDiff.closest(typed, [built.kana, built.plain]);
        const d = AnswerDiff.diff(typed, target);
        result.innerHTML += `<div class="answer-diff" lang="ja">`
          + `<div><span class="answer-diff-label">You typed</span>${AnswerDiff.toHtml(d.typed, 'diff-wrong')}</div>`
          + `<div><span class="answer-diff-label">Expected</span>${AnswerDiff.toHtml(d.expected, 'diff-missing')}</div>`
          + `</div>`;
      }
    } else {
      result.innerHTML = '';
    }
    input.disabled = true;

    $('#bunkei-ja').innerHTML = `${Examples.furiganaHtml(built.before)}<mark class="bunkei-focus">${Examples.furiganaHtml(built.focus)}</mark>。`;
    $('#bunkei-note').innerHTML = `<strong lang="ja">${card.pattern.name}</strong> — ${card.pattern.note}`;
    $('#bunkei-reveal-area').classList.add('hidden');
    $('#bunkei-answer-area').classList.remove('hidden');
    document.activeElement && document.activeElement.blur && document.activeElement.blur();
  }

  function gradeBunkeiAndAdvance(grade) {
    if (!bunkeiAnswered) return;
    const card = bunkeiSessionCards[bunkeiIndex];
    srsData[card.id] = gradeCard(getCardState(srsData, card.id), grade);
    saveSRS(srsData);
    flashSaveIndicator();
    if (grade > 1) bunkeiCorrect++;
    bunkeiIndex++;
    showBunkeiCard();
  }

  function finishBunkeiSession() {
    $('#bunkei-card').classList.add('hidden');
    $('#bunkei-session-complete').classList.remove('hidden');
    $('#bunkei-bar-fill').style.width = '100%';
    const total = bunkeiSessionCards.length;
    $('#bunkei-session-total').textContent = total;
    $('#bunkei-session-correct').textContent = bunkeiCorrect;
    $('#bunkei-session-accuracy').textContent = total ? `${Math.round((bunkeiCorrect / total) * 100)}%` : '0%';
  }

  // ─── Utilities ─────────────────────────────────────────────────────────────────

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  // Cards already handed out since a session was started from its setup
  // screen, per quiz, so "Next 20" carries on with cards not yet seen
  // instead of serving the same batch again.
  const sessionSeen = {};

  // The next batch: due cards first, then the rest of the pool, skipping
  // cards seen this run; once everything has been seen, start over.
  function pickBatch(key, due, pool, cont, size = 20) {
    if (cont !== true || !sessionSeen[key]) sessionSeen[key] = new Set();
    const seen = sessionSeen[key];
    const fresh = list => list.filter(c => !seen.has(c.id));
    let cards = fresh(due);
    if (cards.length === 0) cards = fresh(pool);
    if (cards.length === 0) {
      seen.clear();
      cards = due.length > 0 ? due : pool.slice();
    }
    cards = prioritizeDifficult(cards).slice(0, size);
    cards.forEach(c => seen.add(c.id));
    return cards;
  }

  // On a session-complete screen, Space carries on with the next batch
  // ("Next 20") whenever there is one, whatever button happens to have
  // focus. Returns false when there's no next batch, so the screen's own
  // Space shortcut (usually "back") applies.
  function continueOnSpace(e, sel) {
    if (e.key !== ' ') return false;
    const btn = $(sel);
    if (!btn || btn.classList.contains('hidden') || !btn.onclick) return false;
    const el = document.activeElement;
    if (el && (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.isContentEditable)) return false;
    consumeKey(e);
    btn.click();
    return true;
  }

  // The "Next 20" button on a session-complete screen.
  function setContinueButton(sel, label, onClick) {
    const btn = $(sel);
    if (!btn) return;
    btn.textContent = label;
    btn.classList.toggle('hidden', !onClick);
    btn.onclick = onClick || null;
  }

  function prioritizeDifficult(cards) {
    const failed = [];
    const struggling = [];
    const normal = [];

    cards.forEach(c => {
      const state = getCardState(srsData, c.id);
      if (state.repetitions === 0 && state.interval === 0 && srsData[c.id]) {
        failed.push(c);
      } else if (state.easeFactor < 2.0) {
        struggling.push(c);
      } else {
        normal.push(c);
      }
    });

    shuffle(failed);
    shuffle(struggling);
    shuffle(normal);
    return [...failed, ...struggling, ...normal];
  }

  // ─── Event Binding ─────────────────────────────────────────────────────────────

  // ─── Shared chrome (header, settings/reference overlays) ───────────────────────
  //
  // Every page carries a one-line mount point instead of the full markup, so the
  // header and overlays have a single source of truth here rather than being
  // hand-copied into six HTML files. Runs before any other DOM lookups in init().

  function renderSharedChrome() {
    const headerMount = document.getElementById('header-mount');
    if (headerMount) {
      const showRef = headerMount.hasAttribute('data-ref');
      const showSettings = headerMount.hasAttribute('data-settings');
      headerMount.outerHTML = `
        <header id="header">
          <div class="header-left">
            <button id="btn-back" class="icon-btn hidden" aria-label="Back">←</button>
            <a href="index.html" class="header-title-link">
              <svg class="header-logo" viewBox="0 0 12 9" width="24" height="18" shape-rendering="crispEdges" aria-hidden="true">
                <path fill="#f58a5b" d="M3 0h7v1H3zM1 1h10v1H1zM0 2h12v1H0z"/>
                <path fill="#ffd4bb" d="M3 1h1v1H3zM7 1h1v1H7zM4 2h1v1H4zM8 2h1v1H8z"/>
                <path fill="#fbf7ee" d="M0 3h12v3H0z"/>
                <path fill="#e2d9c6" d="M1 6h10v1H1z"/>
                <path fill="#e04b3c" d="M0 7h12v1H0z"/>
                <path fill="#a3302a" d="M1 8h10v1H1z"/>
              </svg>
              <h1 id="header-title">Tokidoki</h1>
            </a>
          </div>
          <div class="header-right">
            <button id="btn-theme" class="icon-btn" aria-label="Toggle theme">◐</button>
            ${showRef ? '<button id="btn-ref" class="icon-btn" aria-label="Conjugation reference">?</button>' : ''}
            ${showSettings ? '<button id="btn-settings" class="icon-btn" aria-label="Settings">⚙</button>' : ''}
          </div>
        </header>`;
    }

    const settingsMount = document.getElementById('settings-mount');
    if (settingsMount) {
      settingsMount.outerHTML = `
        <div id="settings-overlay" class="settings-overlay hidden">
          <div class="settings-overlay-backdrop"></div>
          <div class="settings-overlay-content">
            <div class="settings-overlay-header">
              <h2 class="settings-overlay-title">Settings</h2>
              <button id="btn-close-settings" class="settings-overlay-close" aria-label="Close settings">✕</button>
            </div>
            <div class="settings-panel">
              <label class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">Type answers in hiragana</span>
                  <span class="setting-desc">When enabled, you type the conjugation before revealing the answer</span>
                </div>
                <input type="checkbox" id="setting-typing-mode" class="setting-toggle">
              </label>
              <label class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">Form label on question</span>
                  <span class="setting-desc">Hidden, colour only, or colour with the written-out form name (e.g. "Present (だ)"). The answer side always shows it.</span>
                </div>
                <select id="setting-form-display" class="setting-select">
                  <option value="hidden">Hidden</option>
                  <option value="color">Colour only</option>
                  <option value="name">Colour + name</option>
                </select>
              </label>
              <label class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">Show context example</span>
                  <span class="setting-desc">Shows an English example below the hint, e.g. "I did eat (polite, past)"</span>
                </div>
                <input type="checkbox" id="setting-show-context" class="setting-toggle">
              </label>
              <label class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">English → Japanese mode</span>
                  <span class="setting-desc">See an English sentence (e.g. "I did take (a thing) (polite, past)") and produce the Japanese conjugation</span>
                </div>
                <input type="checkbox" id="setting-english-to-japanese" class="setting-toggle">
              </label>
              <label class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">Show example sentence on question</span>
                  <span class="setting-desc">Shows a Japanese example sentence (with the answer blanked out) before you reveal the answer</span>
                </div>
                <input type="checkbox" id="setting-show-example-front" class="setting-toggle">
              </label>
              <label class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">Show furigana</span>
                  <span class="setting-desc">Shows readings (hiragana) above kanji in Japanese sentences</span>
                </div>
                <input type="checkbox" id="setting-show-furigana" class="setting-toggle">
              </label>
            </div>
          </div>
        </div>`;
    }

    const refMount = document.getElementById('ref-mount');
    if (refMount) {
      const defaultTab = refMount.getAttribute('data-default-tab') || 'verb';
      refMount.outerHTML = `
        <div id="ref-overlay" class="ref-overlay hidden" role="dialog" aria-modal="true" aria-label="Conjugation Reference">
          <div id="ref-backdrop" class="ref-backdrop"></div>
          <div class="ref-overlay-panel">
            <div class="ref-overlay-header">
              <h2 class="section-title" style="margin:0">Conjugation Reference</h2>
              <button id="btn-ref-close" class="icon-btn" aria-label="Close">✕</button>
            </div>
            <div class="ref-tabs">
              <button class="ref-tab${defaultTab === 'verb' ? ' active' : ''}" data-tab="verb">Verbs</button>
              <button class="ref-tab${defaultTab === 'adj' ? ' active' : ''}" data-tab="adj">Adjectives</button>
            </div>
            <div id="ref-content" class="ref-content"></div>
          </div>
        </div>`;
    }
  }

  // Attaches a listener only if the element exists — pages only include the
  // markup relevant to their own exercise, so most wiring below is optional
  // per page rather than guarded with if-statements at every call site.
  function on(selector, event, handler) {
    const el = typeof selector === 'string' ? $(selector) : selector;
    if (el) el.addEventListener(event, handler);
  }

  function overlayOpen(id) {
    const el = document.getElementById(id);
    return !!el && !el.classList.contains('hidden');
  }

  // Stops a handled shortcut key from also reaching browser extensions like
  // Vimium, which bind their own global keydown listeners (Space to scroll,
  // etc.) and don't know these keys mean something to this app. Our
  // listeners run in the capture phase (registered with `true` below) so
  // they fire before such bubble-phase listeners even see the event —
  // stopPropagation() here then keeps it from reaching them at all. Call
  // this only for keys the app actually consumes, not on every keydown, so
  // extension shortcuts still work normally for everything else.
  function consumeKey(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // True when the focused element already has its own native meaning for
  // Space (checkboxes, radios, other buttons, text inputs, links) — a
  // global "Space = start/continue" shortcut should defer to that instead
  // of hijacking Space away from, say, toggling a level checkbox the user
  // just tabbed to.
  function focusHasOwnSpaceAction() {
    const el = document.activeElement;
    if (!el || el === document.body) return false;
    if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A', 'SUMMARY'].includes(el.tagName)) return true;
    return el.isContentEditable;
  }

  function init() {
    renderSharedChrome();
    initTheme();

    srsData = loadSRS();
    statsData = loadStats();

    const mode = document.body.dataset.mode || 'hub';

    // Kanji flashcards (kanji-cards.js): a removed card's schedule goes from
    // this page's copy of the SRS store too, and the deck screen, counts and
    // hub badge follow every ＋ / ✓ pressed anywhere on the page.
    if (window.KanjiCards) {
      KanjiCards.onRemove = id => { deleteDeckSRS(id); saveSRS(srsData); };
      document.addEventListener('kanjicards:change', () => {
        if (mode === 'flashcards') renderStoryDeck();
        else if (mode === 'stories' || mode === 'memes') renderFlashcardsLink();
        else if (mode === 'vocabulary') renderVocabDeckStatus();
        else if (mode === 'hub') renderHub();
      });
    }
    if (window.Romaji) {
      Romaji.attach($('#answer-input'));
      Romaji.attach($('#bunkei-input'));
    }
    if (window.Speech) {
      Speech.attach($('#answer-input'));
      Speech.attach($('#bunkei-input'));
    }

    if (mode === 'verbs') {
      renderChapters();
      renderReference('verb');
    } else if (mode === 'adjectives') {
      renderAdjChapters();
      renderReference('adj');
    } else if (mode === 'custom') {
      renderCustomPanel();
      renderReference('verb');
    } else if (mode === 'translate') {
      renderTranslateChapters();
    } else if (mode === 'kana') {
      initKanaCanvas();
      renderKanaPanel();
    } else if (mode === 'kanji-sheets') {
      // Static download links page — no SRS state to render.
    } else if (mode === 'kanji-quiz') {
      renderKanjiQuizPanel();
    } else if (mode === 'confusable-browse') {
      renderConfusableBrowsePage();
    } else if (mode === 'kanji-hover') {
      renderKanjiHoverPage();
    } else if (mode === 'vocabulary') {
      renderVocabPage();
    } else if (mode === 'words-by-kanji') {
      renderWbkPage();
    } else if (mode === 'notepad') {
      // notepad.js wires up its own page.
    } else if (mode === 'mystery') {
      // mystery.js wires up its own page.
    } else if (mode === 'listening') {
      // listening.js wires up its own page.
    } else if (mode === 'word-order') {
      // word-order.js wires up its own page.
    } else if (mode === 'story-fill') {
      // story-fill.js wires up its own page.
    } else if (mode === 'phrases') {
      // phrases.js wires up its own page.
    } else if (mode === 'news') {
      // news.js wires up its own page.
    } else if (mode === 'particles') {
      renderParticlesPanel();
    } else if (mode === 'bunkei') {
      renderBunkeiPage();
    } else if (mode === 'stories' || mode === 'memes') {
      renderStoriesPage();
      if (getStory(location.hash.slice(1))) openStory(location.hash.slice(1));
    } else if (mode === 'flashcards') {
      // flashcards.html#kanji opens on the Kanji tab.
      if (location.hash === '#kanji') settings.deckTab = 'kanji';
      renderStoryDeck();
    } else {
      renderHub();
    }

    // Keep the current page's chip in view when its nav row scrolls sideways.
    $$('.page-nav-item.active').forEach(el => {
      const row = el.parentElement;
      row.scrollLeft = el.offsetLeft - row.clientWidth / 2 + el.offsetWidth / 2;
    });

    // Theme toggle
    on('#btn-theme', 'click', toggleTheme);

    // Back button
    on('#btn-back', 'click', () => {
      showScreen('chapters');
      if (mode === 'verbs') renderChapters();
      else if (mode === 'adjectives') renderAdjChapters();
      else if (mode === 'kana') renderKanaPanel();
      else if (mode === 'kanji-quiz') renderKanjiQuizPanel();
      else if (mode === 'particles') renderParticlesPanel();
      else if (mode === 'stories' || mode === 'memes') closeStory();
      else if (mode === 'flashcards') closeFlashcardReview();
      else if (mode === 'bunkei') renderBunkeiPage();
    });

    // Reference overlay
    function openReference() {
      const overlay = $('#ref-overlay');
      // Translate cards have no word; adjective sentence cards carry the
      // form they drill as refForm. Off a card, the page decides the tab.
      const word = currentCard && currentCard.verb;
      const isAdj = word ? isAdjCard(currentCard) : mode === 'adjectives';
      const verbType = isAdj ? 'adj' : 'verb';
      const targetForm = currentCard ? (currentCard.form || currentCard.refForm || null) : null;

      $$('.ref-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === verbType));
      renderReference(verbType);

      if (targetForm) {
        const content = $('#ref-content');
        // Expand the matching row
        const row = content.querySelector(`[data-form="${targetForm}"]`);
        const detail = content.querySelector(`[data-form-detail="${targetForm}"]`);
        if (row && detail) {
          content.querySelectorAll('.ref-explanation-row').forEach(r => r.classList.add('hidden'));
          content.querySelectorAll('.ref-row').forEach(r => r.classList.remove('ref-row-active', 'ref-row-current'));
          detail.classList.remove('hidden');
          row.classList.add('ref-row-active', 'ref-row-current');
        }
      }

      overlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';

      if (targetForm) {
        const row = $('#ref-content').querySelector(`[data-form="${targetForm}"]`);
        if (row) setTimeout(() => row.scrollIntoView({ block: 'center', behavior: 'smooth' }), 50);
      }
    }

    function closeReference() {
      $('#ref-overlay').classList.add('hidden');
      document.body.style.overflow = '';
    }

    on('#btn-ref', 'click', openReference);
    on('#btn-ref-close', 'click', closeReference);
    on('#ref-backdrop', 'click', closeReference);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlayOpen('ref-overlay')) {
        consumeKey(e);
        closeReference();
      }
    }, true);

    // Settings button
    function openSettings() {
      $('#setting-typing-mode').checked = settings.typingMode;
      $('#setting-form-display').value = settings.formDisplay;
      $('#setting-show-context').checked = settings.showContext;
      $('#setting-english-to-japanese').checked = settings.englishToJapanese;
      $('#setting-show-example-front').checked = settings.showExampleFront;
      $('#setting-show-furigana').checked = settings.showFurigana;
      $('#settings-overlay').classList.remove('hidden');
    }

    function closeSettings() {
      $('#settings-overlay').classList.add('hidden');
    }

    on('#btn-settings', 'click', openSettings);
    on('#btn-close-settings', 'click', closeSettings);
    on('.settings-overlay-backdrop', 'click', closeSettings);

    // Settings toggles
    on('#setting-typing-mode', 'change', (e) => {
      settings.typingMode = e.target.checked;
      saveSettings(settings);
    });

    on('#setting-form-display', 'change', (e) => {
      settings.formDisplay = e.target.value;
      settings.hideForm = e.target.value !== 'name';
      saveSettings(settings);
    });

    on('#setting-show-context', 'change', (e) => {
      settings.showContext = e.target.checked;
      saveSettings(settings);
    });

    on('#setting-english-to-japanese', 'change', (e) => {
      settings.englishToJapanese = e.target.checked;
      saveSettings(settings);
    });

    on('#setting-show-example-front', 'change', (e) => {
      settings.showExampleFront = e.target.checked;
      saveSettings(settings);
    });

    on('#setting-show-furigana', 'change', (e) => {
      settings.showFurigana = e.target.checked;
      saveSettings(settings);
    });

    // Reveal button (default mode)
    on('#btn-reveal', 'click', showAnswer);
    on('#btn-hint', 'click', toggleHint);
    on('#btn-hint-typing', 'click', toggleHint);

    // Check answer (typing mode)
    on('#btn-check', 'click', checkAnswer);

    // Show answer (typing mode)
    on('#btn-show', 'click', showAnswer);

    // Grade buttons (study card only — kana grade buttons are bound separately below)
    $$('#card .btn-grade').forEach(btn => {
      btn.addEventListener('click', () => {
        gradeAndAdvance(parseInt(btn.dataset.grade));
      });
    });

    // Back to chapters from session complete
    // Adjectives page: single word vs whole-sentence translation.
    $$('input[name="adj-mode"]').forEach(el => {
      el.addEventListener('change', () => {
        settings.adjSentences = $('#adj-mode-sentences').checked;
        saveSettings(settings);
        renderAdjChapters();
      });
    });

    on('#btn-back-to-chapters', 'click', () => {
      showScreen('chapters');
      if (mode === 'verbs') renderChapters();
      else if (mode === 'adjectives') renderAdjChapters();
    });

    // ─── Kana practice ───────────────────────────────────────────────────────────

    function toggleKanaScript(e, otherCheckboxId) {
      if (!e.target.checked && !$(otherCheckboxId).checked) {
        e.target.checked = true;
        return;
      }
      renderKanaPanel();
    }

    on('#kana-toggle-hiragana', 'change', (e) => toggleKanaScript(e, '#kana-toggle-katakana'));
    on('#kana-toggle-katakana', 'change', (e) => toggleKanaScript(e, '#kana-toggle-hiragana'));

    on('#btn-start-kana', 'click', startKanaStudy);
    on('#btn-kana-clear', 'click', clearKanaCanvas);
    on('#btn-kana-reveal', 'click', revealKanaAnswer);

    $$('.btn-grade[data-kana-grade]').forEach(btn => {
      btn.addEventListener('click', () => {
        gradeKanaAndAdvance(parseInt(btn.dataset.kanaGrade));
      });
    });

    function backToKanaChapters() {
      showScreen('chapters');
      renderKanaPanel();
    }

    on('#btn-kana-back-to-chapters', 'click', backToKanaChapters);

    document.addEventListener('keydown', (e) => {
      if (overlayOpen('settings-overlay')) return;
      if (overlayOpen('ref-overlay')) return;

      // Setup screen: Space starts a session, same as clicking Start Practice —
      // but only when focus isn't on a checkbox/etc. that already owns Space.
      if (mode === 'kana' && screens.chapters && screens.chapters.classList.contains('active')) {
        if (e.key === ' ' && !focusHasOwnSpaceAction()) { consumeKey(e); startKanaStudy(); }
        return;
      }

      if (!(screens.kana && screens.kana.classList.contains('active'))) return;

      if (kanaAnswered) {
        if (e.key === '1') { consumeKey(e); gradeKanaAndAdvance(1); return; }
        if (e.key === '2' || e.key === ' ') { consumeKey(e); gradeKanaAndAdvance(4); return; }
        return;
      }

      // Session-complete screen: Space goes back, same as clicking the button.
      if (!$('#kana-session-complete').classList.contains('hidden')) {
        if (continueOnSpace(e, '#btn-kana-continue')) return;
        if (e.key === ' ' && !focusHasOwnSpaceAction()) { consumeKey(e); backToKanaChapters(); }
        return;
      }

      if (e.key === ' ') { consumeKey(e); revealKanaAnswer(); return; }
    }, true);

    // ─── Kanji quiz ──────────────────────────────────────────────────────────────

    $$('input[name="kanji-quiz-direction"]').forEach(el => {
      el.addEventListener('change', renderKanjiQuizPanel);
    });

    $$('input[name="kanji-quiz-type"]').forEach(el => {
      el.addEventListener('change', renderKanjiQuizPanel);
    });

    function toggleKanjiQuizLevel(e) {
      const anyChecked = KANJI_QUIZ_LEVELS.some(level => $(`#kanji-quiz-toggle-${level}`).checked);
      if (!anyChecked) {
        e.target.checked = true;
        return;
      }
      renderKanjiQuizPanel();
    }

    KANJI_QUIZ_LEVELS.forEach(level => {
      on(`#kanji-quiz-toggle-${level}`, 'change', toggleKanjiQuizLevel);
    });

    on('#btn-start-kanji-quiz', 'click', () => {
      if (getKanjiQuizType() === 'confusable') startConfusableStudy();
      else startKanjiQuizStudy();
    });
    on('#btn-kanji-quiz-reveal', 'click', revealKanjiQuizAnswer);

    $$('.btn-grade[data-kanji-quiz-grade]').forEach(btn => {
      btn.addEventListener('click', () => {
        gradeKanjiQuizAndAdvance(parseInt(btn.dataset.kanjiQuizGrade));
      });
    });

    function backToKanjiQuizChapters() {
      showScreen('chapters');
      renderKanjiQuizPanel();
    }

    on('#btn-kanji-quiz-back-to-chapters', 'click', backToKanjiQuizChapters);

    on('#btn-kanji-quiz-undo', 'click', undoLastKanjiQuizGrade);

    document.addEventListener('keydown', (e) => {
      if (overlayOpen('settings-overlay')) return;
      if (overlayOpen('ref-overlay')) return;

      // Setup screen: Space starts a session, same as clicking Start Quiz —
      // but only when focus isn't on a checkbox/radio that already owns Space.
      if (mode === 'kanji-quiz' && screens.chapters && screens.chapters.classList.contains('active')) {
        if (e.key === ' ' && !focusHasOwnSpaceAction()) {
          consumeKey(e);
          if (getKanjiQuizType() === 'confusable') startConfusableStudy();
          else startKanjiQuizStudy();
        }
        return;
      }

      if (!(screens['kanji-quiz'] && screens['kanji-quiz'].classList.contains('active'))) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        consumeKey(e);
        undoLastKanjiQuizGrade();
        return;
      }

      if (kanjiQuizAnswered) {
        if (e.key === '1') { consumeKey(e); gradeKanjiQuizAndAdvance(1); return; }
        if (e.key === '2' || e.key === ' ') { consumeKey(e); gradeKanjiQuizAndAdvance(4); return; }
        if (e.key === 'z' || e.key === 'Z') { consumeKey(e); undoLastKanjiQuizGrade(); return; }
        return;
      }

      // Session-complete screen: Space goes back, same as clicking the button.
      if (!$('#kanji-quiz-session-complete').classList.contains('hidden')) {
        if (continueOnSpace(e, '#btn-kanji-quiz-continue')) return;
        if (e.key === ' ' && !focusHasOwnSpaceAction()) { consumeKey(e); backToKanjiQuizChapters(); }
        return;
      }

      if (e.key === ' ') { consumeKey(e); revealKanjiQuizAnswer(); return; }
      if (e.key === 'z' || e.key === 'Z') { consumeKey(e); undoLastKanjiQuizGrade(); return; }
    }, true);

    // ─── Confusing Kanji ─────────────────────────────────────────────────────────

    $$('.confusable-choice').forEach((btn, i) => {
      btn.addEventListener('click', () => chooseConfusableAnswer(i));
    });

    on('#btn-confusable-next', 'click', advanceConfusable);
    on('#btn-confusable-undo', 'click', undoLastConfusableGrade);

    function backToConfusableChapters() {
      showScreen('chapters');
      renderKanjiQuizPanel();
    }

    on('#btn-confusable-back-to-chapters', 'click', backToConfusableChapters);

    document.addEventListener('keydown', (e) => {
      if (overlayOpen('settings-overlay')) return;
      if (overlayOpen('ref-overlay')) return;
      if (!(screens.confusable && screens.confusable.classList.contains('active'))) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        consumeKey(e);
        undoLastConfusableGrade();
        return;
      }

      if (confusableAnswered) {
        if (e.key === ' ') { consumeKey(e); advanceConfusable(); return; }
        if (e.key === 'z' || e.key === 'Z') { consumeKey(e); undoLastConfusableGrade(); return; }
        return;
      }

      // Session-complete screen: Space goes back, same as clicking the button.
      if (!$('#confusable-session-complete').classList.contains('hidden')) {
        if (continueOnSpace(e, '#btn-confusable-continue')) return;
        if (e.key === ' ' && !focusHasOwnSpaceAction()) { consumeKey(e); backToConfusableChapters(); }
        return;
      }

      if (e.key >= '1' && e.key <= '4') {
        const i = parseInt(e.key, 10) - 1;
        if (i < currentConfusableChoices.length) { consumeKey(e); chooseConfusableAnswer(i); }
      }
    }, true);

    // ─── Particle quiz ───────────────────────────────────────────────────────────

    function toggleParticlesLevel(e) {
      const anyChecked = (window.PARTICLE_LIST || []).some(p => $(`#particles-toggle-${window.PARTICLE_ROMAJI[p]}`).checked);
      if (!anyChecked) {
        e.target.checked = true;
        return;
      }
      renderParticlesPanel();
    }

    (window.PARTICLE_LIST || []).forEach(p => {
      on(`#particles-toggle-${window.PARTICLE_ROMAJI[p]}`, 'change', toggleParticlesLevel);
    });

    // particles-quiz.html#verbs opens straight on the Verb + Particle quiz.
    const verbsRadio = $('#particles-type-verbs');
    if (verbsRadio && location.hash === '#verbs') {
      verbsRadio.checked = true;
      renderParticlesPanel();
    }
    $$('input[name="particles-quiz-type"]').forEach(el => {
      el.addEventListener('change', () => {
        history.replaceState(null, '', el.value === 'verbs' ? '#verbs' : location.pathname + location.search);
        renderParticlesPanel();
      });
    });

    on('#btn-start-particles', 'click', startParticlesStudy);

    $$('.particle-choice').forEach((btn, i) => {
      btn.addEventListener('click', () => chooseParticleAnswer(i));
    });

    on('#btn-particles-next', 'click', advanceParticles);
    on('#btn-particles-undo', 'click', undoLastParticleGrade);

    function backToParticlesChapters() {
      showScreen('chapters');
      renderParticlesPanel();
    }

    on('#btn-particles-back-to-chapters', 'click', backToParticlesChapters);

    document.addEventListener('keydown', (e) => {
      if (overlayOpen('settings-overlay')) return;
      if (overlayOpen('ref-overlay')) return;

      if (mode === 'particles' && screens.chapters && screens.chapters.classList.contains('active')) {
        if (e.key === ' ' && !focusHasOwnSpaceAction()) { consumeKey(e); startParticlesStudy(); }
        return;
      }

      if (!(screens.particles && screens.particles.classList.contains('active'))) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        consumeKey(e);
        undoLastParticleGrade();
        return;
      }

      if (particlesAnswered) {
        if (e.key === ' ') { consumeKey(e); advanceParticles(); return; }
        if (e.key === 'z' || e.key === 'Z') { consumeKey(e); undoLastParticleGrade(); return; }
        return;
      }

      // Session-complete screen: Space goes back, same as clicking the button.
      if (!$('#particles-session-complete').classList.contains('hidden')) {
        if (continueOnSpace(e, '#btn-particles-continue')) return;
        if (e.key === ' ' && !focusHasOwnSpaceAction()) { consumeKey(e); backToParticlesChapters(); }
        return;
      }

      if (e.key >= '1' && e.key <= '4') {
        const i = parseInt(e.key, 10) - 1;
        if (i < currentParticleChoices.length) { consumeKey(e); chooseParticleAnswer(i); }
      }
    }, true);

    // ─── Confusable kanji browse page ───────────────────────────────────────────

    on('#confusable-browse-search', 'input', renderConfusableBrowsePage);
    KANJI_QUIZ_LEVELS.forEach(level => {
      on(`#confusable-browse-toggle-${level}`, 'change', renderConfusableBrowsePage);
    });

    // ─── Kanji hover reference page ─────────────────────────────────────────────

    on('#kanji-hover-dir-km', 'change', renderKanjiHoverPage);
    on('#kanji-hover-dir-mk', 'change', renderKanjiHoverPage);

    function toggleKanjiHoverLevel(e) {
      const anyChecked = KANJI_QUIZ_LEVELS.some(level => $(`#kanji-hover-toggle-${level}`).checked);
      if (!anyChecked) {
        e.target.checked = true;
        return;
      }
      resetKanjiHoverOrder();
    }

    KANJI_QUIZ_LEVELS.forEach(level => {
      on(`#kanji-hover-toggle-${level}`, 'change', toggleKanjiHoverLevel);
    });

    on('#kanji-hover-grid', 'click', (e) => {
      const card = e.target.closest('.kanji-hover-card');
      if (card) card.classList.toggle('revealed');
    });

    on('#btn-kanji-hover-shuffle', 'click', shuffleKanjiHoverOrder);

    // ─── Vocabulary hover reference page ────────────────────────────────────────

    // Switching into or out of Picture → Word changes the pool itself, so the
    // shuffled order only survives a flip between the other two directions.
    let vocabPictureMode = getVocabDirection() === 'picture-to-word';
    function changeVocabDirection() {
      const pictureMode = getVocabDirection() === 'picture-to-word';
      if (pictureMode !== vocabPictureMode) vocabOrder = null;
      vocabPictureMode = pictureMode;
      renderVocabPage();
    }
    on('#vocab-dir-wm', 'change', changeVocabDirection);
    on('#vocab-dir-mw', 'change', changeVocabDirection);
    on('#vocab-dir-pw', 'change', changeVocabDirection);
    on('#vocab-script-kanji', 'change', renderVocabPage);
    on('#vocab-script-furigana', 'change', renderVocabPage);
    on('#vocab-script-kana', 'change', renderVocabPage);

    function toggleVocabLevel(e) {
      const anyChecked = VOCAB_LEVELS.some(level => $(`#vocab-toggle-${level}`).checked);
      if (!anyChecked) {
        e.target.checked = true;
        return;
      }
      resetVocabOrder();
    }

    VOCAB_LEVELS.forEach(level => {
      on(`#vocab-toggle-${level}`, 'change', toggleVocabLevel);
    });

    on('#vocab-only-deck', 'change', renderVocabPage);

    on('#vocab-grid', 'click', (e) => {
      const deckBtn = e.target.closest('.vocab-deck-btn');
      if (deckBtn) {
        onVocabDeckClick(deckBtn);
        return;
      }
      const card = e.target.closest('.kanji-hover-card');
      if (!card) return;
      card.classList.toggle('revealed');
      const item = vocabRendered[+card.dataset.i];
      if (item) pronounceOnClick(item.kana);
    });

    on('#btn-vocab-shuffle', 'click', shuffleVocabOrder);


    // ─── Words by kanji page ────────────────────────────────────────────────────

    on('#wbk-search', 'input', renderWbkPage);
    KANJI_QUIZ_LEVELS.forEach(level => {
      on(`#wbk-toggle-${level}`, 'change', renderWbkPage);
    });

    on('#wbk-grid', 'click', (e) => {
      const card = e.target.closest('.wbk-kanji-card');
      if (card) openWbkOverlay(card.dataset.kanji);
    });

    on('#wbk-overlay-words', 'click', (e) => {
      const add = e.target.closest('.wbk-word-add');
      if (add) {
        const w = wbkOverlayWords[+add.dataset.i];
        if (w) add.outerHTML = wbkWordButtonHtml(+add.dataset.i, toggleVocabFlashcard(w));
        return;
      }
      const row = e.target.closest('.wbk-word-row');
      if (row) pronounceOnClick(row.dataset.kana);
    });

    on('#btn-wbk-close', 'click', closeWbkOverlay);
    on('#wbk-backdrop', 'click', closeWbkOverlay);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlayOpen('wbk-overlay')) {
        consumeKey(e);
        closeWbkOverlay();
      }
    }, true);

    // ─── Bunkei drill ────────────────────────────────────────────────────────────

    function backToBunkeiSetup() {
      showScreen('chapters');
      renderBunkeiPage();
    }

    on('#bunkei-verb-search', 'input', renderBunkeiVerbList);
    on('#bunkei-verb-list', 'click', (e) => {
      const chip = e.target.closest('.bunkei-chip');
      if (chip) toggleBunkeiVerb(chip.dataset.verb);
    });
    on('#bunkei-selected', 'click', (e) => {
      const chip = e.target.closest('.bunkei-chip');
      if (chip) toggleBunkeiVerb(chip.dataset.verb);
    });
    document.querySelectorAll('.bunkei-random-btn').forEach(btn => {
      btn.addEventListener('click', () => addRandomBunkeiVerbs(Number(btn.dataset.count)));
    });
    on('#btn-bunkei-reroll-verbs', 'click', () => addRandomBunkeiVerbs(3, true));
    on('#bunkei-patterns', 'change', (e) => {
      const id = e.target.dataset.pattern;
      if (!id) return;
      const set = new Set(bunkeiSettings.patterns);
      if (e.target.checked) set.add(id); else set.delete(id);
      bunkeiSettings.patterns = Bunkei.PATTERNS.map(p => p.id).filter(pid => set.has(pid));
      saveBunkeiSettings(bunkeiSettings);
      renderBunkeiPatterns();
      renderBunkeiCount();
    });
    on('#bunkei-patterns', 'click', (e) => {
      const level = e.target.dataset && e.target.dataset.levelToggle;
      if (!level) return;
      const ids = Bunkei.PATTERNS.filter(p => p.level === level).map(p => p.id);
      const set = new Set(bunkeiSettings.patterns);
      const allOn = ids.every(id => set.has(id));
      ids.forEach(id => (allOn ? set.delete(id) : set.add(id)));
      bunkeiSettings.patterns = Bunkei.PATTERNS.map(p => p.id).filter(pid => set.has(pid));
      saveBunkeiSettings(bunkeiSettings);
      renderBunkeiPatterns();
      renderBunkeiCount();
    });
    on('#bunkei-toggle-typing', 'change', (e) => {
      bunkeiSettings.typing = e.target.checked;
      saveBunkeiSettings(bunkeiSettings);
    });
    on('#bunkei-toggle-hint', 'change', (e) => {
      bunkeiSettings.hint = e.target.checked;
      saveBunkeiSettings(bunkeiSettings);
    });
    on('#btn-start-bunkei', 'click', startBunkeiStudy);
    on('#btn-bunkei-reveal', 'click', revealBunkeiAnswer);
    on('#btn-bunkei-check', 'click', revealBunkeiAnswer);
    $$('.btn-grade[data-bunkei-grade]').forEach(btn => {
      btn.addEventListener('click', () => gradeBunkeiAndAdvance(parseInt(btn.dataset.bunkeiGrade, 10)));
    });
    on('#btn-bunkei-back', 'click', backToBunkeiSetup);

    document.addEventListener('keydown', (e) => {
      if (mode !== 'bunkei') return;
      if (!(screens.bunkei && screens.bunkei.classList.contains('active'))) return;

      if (!$('#bunkei-session-complete').classList.contains('hidden')) {
        if (e.key === ' ' && !focusHasOwnSpaceAction()) { consumeKey(e); backToBunkeiSetup(); }
        return;
      }
      const inInput = document.activeElement === $('#bunkei-input');
      if (!bunkeiAnswered) {
        // Let the input (and the IME) have every key except a plain Enter.
        if (inInput) {
          if (e.key === 'Enter' && !e.isComposing) { consumeKey(e); revealBunkeiAnswer(); }
          return;
        }
        if ((e.key === ' ' || e.key === 'Enter') && !focusHasOwnSpaceAction()) { consumeKey(e); revealBunkeiAnswer(); }
        return;
      }
      if (e.key === '1') { consumeKey(e); gradeBunkeiAndAdvance(1); return; }
      if (e.key === '2' || e.key === ' ' || e.key === 'Enter') { consumeKey(e); gradeBunkeiAndAdvance(4); }
    }, true);

    // ─── Stories page ────────────────────────────────────────────────────────────

    // Story cards are plain #id links, so the browser's own Back button
    // returns from a story to the list.
    if (mode === 'stories' || mode === 'memes') {
      window.addEventListener('hashchange', () => {
        const id = location.hash.slice(1);
        if (getStory(id)) openStory(id);
        else if (screens.story && screens.story.classList.contains('active')) closeStory();
      });
    }

    // Clicking anywhere outside the panel deselects. Sentences and words
    // select (their own handler below), and the Furigana / English toggles
    // keep the selection. Capture phase, so this runs before panel buttons
    // re-render the panel and detach the clicked element.
    if (mode === 'stories' || mode === 'memes') {
      document.addEventListener('click', (e) => {
        if (!storySelection || !(screens.story && screens.story.classList.contains('active'))) return;
        if (e.target.closest('#story-panel, .story-sentence, .story-toggles')) return;
        clearStorySelection();
      }, true);
    }

    on('#story-text', 'click', (e) => {
      const word = e.target.closest('.story-word');
      if (word) {
        const si = Number(word.dataset.s);
        const ti = Number(word.dataset.t);
        selectStoryWord(si, ti);
        pronounceOnClick(storyKana(parseStorySentence(currentStory.sentences[si])[ti].surface));
        return;
      }
      const sentence = e.target.closest('.story-sentence');
      if (sentence) {
        const si = Number(sentence.dataset.s);
        selectStorySentence(si);
        pronounceOnClick(storySentenceKana(currentStory.sentences[si]));
      }
    });

    on('#story-text', 'keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const word = e.target.closest('.story-word');
      if (!word) return;
      consumeKey(e);
      selectStoryWord(Number(word.dataset.s), Number(word.dataset.t));
    });

    on('#story-panel', 'click', (e) => {
      if (e.target.closest('#btn-story-panel-close')) { clearStorySelection(); return; }
      if (e.target.closest('#btn-story-add-word')) {
        const sel = storySelection;
        const token = parseStorySentence(currentStory.sentences[sel.s])[sel.t];
        toggleStoryWord(token.key, currentStory.id, sel.s);
        const saved = isStoryWordSaved(token.key);
        $$('#story-text .story-word').forEach(el => {
          const t = parseStorySentence(currentStory.sentences[el.dataset.s])[el.dataset.t];
          if (t.key === token.key) el.classList.toggle('saved', saved);
        });
        renderStorySelection();
        return;
      }
      if (e.target.closest('#btn-story-word-sentence')) { selectStorySentence(storySelection.s); return; }
      const item = e.target.closest('.story-grammar-item');
      if (item) {
        const gi = Number(item.dataset.g);
        storyActiveGrammar = storyActiveGrammar === gi ? null : gi;
        $$('#story-panel .story-grammar-item').forEach(el => el.classList.toggle('active', Number(el.dataset.g) === storyActiveGrammar));
        highlightStoryGrammar(storyActiveGrammar);
      }
    });

    // Hovering a grammar point previews its highlight; leaving restores the
    // clicked (pinned) one, if any.
    on('#story-panel', 'mouseover', (e) => {
      const item = e.target.closest('.story-grammar-item');
      if (item) highlightStoryGrammar(Number(item.dataset.g));
    });
    on('#story-panel', 'mouseout', (e) => {
      const item = e.target.closest('.story-grammar-item');
      if (item && !item.contains(e.relatedTarget)) highlightStoryGrammar(storyActiveGrammar);
    });

    // Same button again (now "Stop") stops; the other one switches speed.
    const onStoryRead = (slow) => {
      const btn = $(slow ? '#btn-story-read-slow' : '#btn-story-read');
      if (btn && btn.getAttribute('aria-pressed') === 'true') stopStoryReading();
      else startStoryReading(slow);
    };
    on('#btn-story-read', 'click', () => onStoryRead(false));
    on('#btn-story-read-slow', 'click', () => onStoryRead(true));

    on('#story-toggle-furigana', 'change', (e) => {
      settings.showFurigana = e.target.checked;
      saveSettings(settings);
      renderStoryReader();
    });

    on('#story-toggle-english', 'change', (e) => {
      settings.storyShowEnglish = e.target.checked;
      saveSettings(settings);
      $('#story-text').classList.toggle('show-english', settings.storyShowEnglish);
    });

    on('#btn-story-prev', 'click', (e) => { location.hash = e.currentTarget.dataset.story; });
    on('#btn-story-next', 'click', (e) => { location.hash = e.currentTarget.dataset.story; });

    on('#story-deck-list', 'click', (e) => {
      const btn = e.target.closest('.story-deck-remove');
      if (!btn) {
        const row = e.target.closest('.story-deck-row');
        const reading = row && row.querySelector('.speak-btn');
        if (reading) pronounceOnClick(reading.dataset.say);
        return;
      }
      if (btn.dataset.kanji) {
        if (window.KanjiCards) KanjiCards.remove(btn.dataset.kanji);
      } else {
        toggleStoryWord(btn.dataset.word);
      }
      renderStoryDeck();
    });

    $$('.deck-tab').forEach(btn => {
      btn.addEventListener('click', () => setStoryDeckTab(btn.dataset.deckTab));
    });

    $$('input[name="deck-direction"]').forEach(el => {
      el.addEventListener('change', () => {
        settings.deckDirection = el.value;
        saveSettings(settings);
        renderStoryDeck();
      });
    });

    if (mode === 'flashcards') {
      window.addEventListener('hashchange', () => {
        if (location.hash === '#kanji') setStoryDeckTab('kanji');
      });
    }

    $$('.flashcard-furigana-toggle').forEach(el => {
      el.addEventListener('change', () => setFlashcardFurigana(el.checked));
    });

    on('#btn-export-anki', 'click', () => exportStoryDeck('anki'));
    on('#btn-export-csv', 'click', () => exportStoryDeck('csv'));
    on('#btn-export-print', 'click', () => exportStoryDeck('print'));

    on('#btn-story-review', 'click', startStoryReview);
    on('#btn-story-review-reveal', 'click', revealStoryReviewAnswer);
    $$('.btn-grade[data-story-grade]').forEach(btn => {
      btn.addEventListener('click', () => gradeStoryReviewAndAdvance(parseInt(btn.dataset.storyGrade, 10)));
    });
    on('#btn-story-review-done', 'click', closeFlashcardReview);

    on('#meme-sizes', 'click', (e) => {
      const btn = e.target.closest('.meme-size');
      if (!btn) return;
      settings.memeSize = btn.dataset.size;
      saveSettings(settings);
      renderStoriesPage();
    });

    on('#meme-filters', 'click', (e) => {
      const btn = e.target.closest('.meme-filter');
      if (!btn) return;
      settings.memeKind = btn.dataset.kind;
      saveSettings(settings);
      renderStoriesPage();
    });

    document.addEventListener('keydown', (e) => {
      if (mode !== 'stories' && mode !== 'memes' && mode !== 'flashcards') return;

      if (screens.story && screens.story.classList.contains('active')) {
        if (e.key === 'Escape' && storySelection) { consumeKey(e); clearStorySelection(); }
        return;
      }

      if (!(screens['story-review'] && screens['story-review'].classList.contains('active'))) return;

      if (!$('#story-review-complete').classList.contains('hidden')) {
        if (continueOnSpace(e, '#btn-story-review-continue')) return;
        if (e.key === ' ' && !focusHasOwnSpaceAction()) { consumeKey(e); closeFlashcardReview(); }
        return;
      }
      if (!storyReviewAnswered) {
        if (e.key === ' ' || e.key === 'Enter') { consumeKey(e); revealStoryReviewAnswer(); }
        return;
      }
      if (e.key === '1') { consumeKey(e); gradeStoryReviewAndAdvance(1); return; }
      if (e.key === '2' || e.key === ' ') { consumeKey(e); gradeStoryReviewAndAdvance(4); }
    }, true);

    // Reference tabs
    $$('.ref-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.ref-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderReference(tab.dataset.tab);
      });
    });

    // Reset progress
    on('#btn-reset', 'click', () => {
      if (confirm('Are you sure you want to reset ALL progress? This cannot be undone.')) {
        localStorage.removeItem(SRS_KEY);
        localStorage.removeItem(STATS_KEY);
        srsData = {};
        statsData = loadStats();
        if (mode === 'verbs') renderChapters();
        else if (mode === 'adjectives') renderAdjChapters();
        else if (mode === 'kana') renderKanaPanel();
        else if (mode === 'kanji-quiz') renderKanjiQuizPanel();
        else if (mode === 'particles') renderParticlesPanel();
        else if (mode === 'stories' || mode === 'memes') renderFlashcardsLink();
        else if (mode === 'flashcards') renderStoryDeck();
        else if (mode === 'bunkei') renderBunkeiPage();
        else if (mode === 'hub') renderHub();
      }
    });

    // Undo button
    on('#btn-undo', 'click', undoLastGrade);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlayOpen('settings-overlay')) {
        consumeKey(e);
        closeSettings();
        return;
      }
      if (overlayOpen('ref-overlay')) return;
      if (!(screens.study && screens.study.classList.contains('active'))) return;
      if (overlayOpen('settings-overlay')) return;

      if (!$('#session-complete').classList.contains('hidden')) {
        continueOnSpace(e, '#btn-session-continue');
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        consumeKey(e);
        undoLastGrade();
        return;
      }

      if (answered) {
        if (e.key === '1') { consumeKey(e); gradeAndAdvance(1); return; }
        if (e.key === '2' || e.key === ' ') { consumeKey(e); gradeAndAdvance(4); return; }
        if (e.key === 'Enter' && settings.typingMode
            && (studyMode !== 'translate' || currentCard.direction === 'en-to-ja')) {
          consumeKey(e);
          gradeAndAdvance(lastTypedCorrect ? 4 : 1);
          return;
        }
        if (e.key === 'z' || e.key === 'Z') { consumeKey(e); undoLastGrade(); return; }
        return;
      }

      // Card front is showing. H is the hint shortcut, except while typing
      // an answer — there it's just the h of romaji like "hayai".
      const typingInInput = e.target && e.target.id === 'answer-input';
      if ((e.key === 'h' || e.key === 'H') && !typingInInput) { consumeKey(e); toggleHint(); return; }
      if (settings.typingMode) {
        if (e.key === 'Enter' && !e.isComposing) { consumeKey(e); checkAnswer(); }
      } else {
        if (e.key === ' ') { consumeKey(e); showAnswer(); return; }
        if (e.key === 'z' || e.key === 'Z') { consumeKey(e); undoLastGrade(); return; }
      }
    }, true);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
