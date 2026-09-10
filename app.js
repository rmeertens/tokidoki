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
    const defaults = { typingMode: false, hideForm: true, showContext: true, englishToJapanese: true, showExampleFront: false, showFurigana: true };
    try { return { ...defaults, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) }; }
    catch { return defaults; }
  }

  function saveSettings(data) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
  }

  let settings = loadSettings();
  let srsData = loadSRS();
  let statsData = loadStats();
  let currentChapter = null;
  let studyMode = 'verbs';
  let sessionCards = [];
  let sessionIndex = 0;
  let sessionCorrect = 0;
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
  };

  // ─── Theme ─────────────────────────────────────────────────────────────────────

  function initTheme() {
    const saved = localStorage.getItem('tokidoki_theme') || 'dark';
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

  function showScreen(name) {
    Object.values(screens).filter(Boolean).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');

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
    }
  }

  // ─── Chapter Select ────────────────────────────────────────────────────────────

  function renderChapters() {
    const g1 = $('#chapters-genki1');
    const g2 = $('#chapters-genki2');
    g1.innerHTML = '';
    g2.innerHTML = '';

    const chapters = getAllChapters();
    let totalDue = 0;

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

      totalDue += chapterDue;
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

    $('#today-reviewed').textContent = statsData.todayReviews || 0;
    const todayAcc = statsData.todayReviews > 0 ? Math.round((statsData.todayCorrect / statsData.todayReviews) * 100) : 0;
    $('#today-accuracy').textContent = todayAcc + '%';
    $('#cards-due').textContent = totalDue;
  }

  function adjCardId(adj, form) {
    return `adj:${adj.reading}:${form}`;
  }

  function renderAdjChapters() {
    const g1 = $('#adj-chapters-genki1');
    const g2 = $('#adj-chapters-genki2');
    g1.innerHTML = '';
    g2.innerHTML = '';

    const chapters = getAllAdjChapters();
    let totalDue = 0;

    chapters.forEach(ch => {
      const info = ADJ_CHAPTER_INFO[ch];
      const adjs = getAdjectivesByChapter(ch);
      const forms = Conjugator.getAdjFormsForChapter(ch);

      let chapterCards = 0;
      let chapterReviewed = 0;
      let chapterDue = 0;

      adjs.forEach(a => {
        forms.forEach(f => {
          chapterCards++;
          const id = adjCardId(a, f);
          const state = getCardState(srsData, id);
          if (state.repetitions > 0) chapterReviewed++;
          if (isDue(state)) chapterDue++;
        });
      });

      totalDue += chapterDue;
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
        <div class="chapter-card-sub">${typeSummary} &middot; ${forms.length} forms</div>
        ${formPills ? `<div class="chapter-card-forms">${formPills}</div>` : ''}
        <div class="chapter-progress"><div class="chapter-progress-fill" style="width:${pct}%"></div></div>
        ${chapterDue > 0 ? `<div class="chapter-card-due">${chapterDue} due</div>` : ''}
      `;
      card.addEventListener('click', () => startAdjStudy(ch));

      if (info.book === 'Genki I') g1.appendChild(card);
      else g2.appendChild(card);
    });

    const todayEl = $('#today-reviewed');
    if (todayEl) {
      todayEl.textContent = statsData.todayReviews || 0;
      const todayAcc = statsData.todayReviews > 0 ? Math.round((statsData.todayCorrect / statsData.todayReviews) * 100) : 0;
      $('#today-accuracy').textContent = todayAcc + '%';
      $('#cards-due').textContent = totalDue;
    }
  }

  // ─── Global stats (streak badge lives in the header on every page) ─────────────

  function renderGlobalStats() {
    const streakEl = $('#streak-count');
    if (streakEl) streakEl.textContent = statsData.streak;
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

    const todayEl = $('#today-reviewed');
    if (todayEl) {
      todayEl.textContent = statsData.todayReviews || 0;
      const todayAcc = statsData.todayReviews > 0 ? Math.round((statsData.todayCorrect / statsData.todayReviews) * 100) : 0;
      $('#today-accuracy').textContent = todayAcc + '%';
      $('#cards-due').textContent = verbDue + adjDue + kanaDue;
    }

    const setDue = (id, n) => { const el = $(id); if (el) el.textContent = n > 0 ? `${n} due` : ''; };
    setDue('#hub-due-verbs', verbDue);
    setDue('#hub-due-adjectives', adjDue);
    setDue('#hub-due-kana', kanaDue);
  }

  // ─── Study Session ─────────────────────────────────────────────────────────────

  function startStudy(chapter) {
    studyMode = 'verbs';
    currentChapter = chapter;
    const verbs = getVerbsByChapter(chapter);
    const forms = Conjugator.getFormsForChapter(chapter);

    sessionCards = [];
    verbs.forEach(v => {
      forms.forEach(f => {
        const id = cardId(v, f);
        const state = getCardState(srsData, id);
        if (isDue(state)) {
          sessionCards.push({ verb: v, form: f, id });
        }
      });
    });

    if (sessionCards.length === 0) {
      verbs.forEach(v => {
        forms.forEach(f => {
          const id = cardId(v, f);
          sessionCards.push({ verb: v, form: f, id });
        });
      });
    }

    sessionCards = prioritizeDifficult(sessionCards);

    if (sessionCards.length > 20) {
      sessionCards = sessionCards.slice(0, 20);
    }

    sessionIndex = 0;
    sessionCorrect = 0;
    sessionTotal = sessionCards.length;
    undoStack = [];

    showScreen('study');
    $('#session-complete').classList.add('hidden');
    $('#card').classList.remove('hidden');
    showCard();
  }

  function startAdjStudy(chapter) {
    studyMode = 'adjectives';
    currentChapter = chapter;
    const adjs = getAdjectivesByChapter(chapter);
    const forms = Conjugator.getAdjFormsForChapter(chapter);

    sessionCards = [];
    adjs.forEach(a => {
      forms.forEach(f => {
        const id = adjCardId(a, f);
        const state = getCardState(srsData, id);
        if (isDue(state)) {
          sessionCards.push({ verb: a, form: f, id });
        }
      });
    });

    if (sessionCards.length === 0) {
      adjs.forEach(a => {
        forms.forEach(f => {
          const id = adjCardId(a, f);
          sessionCards.push({ verb: a, form: f, id });
        });
      });
    }

    sessionCards = prioritizeDifficult(sessionCards);

    if (sessionCards.length > 20) {
      sessionCards = sessionCards.slice(0, 20);
    }

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
    const verb = meaning.replace(/^to /, '');
    const templates = {
      'masu':           `I ${verb} / will ${verb} (polite)`,
      'masu-neg':       `I don't ${verb} (polite)`,
      'masu-past':      `I did ${verb} (polite, past)`,
      'masu-past-neg':  `I didn't ${verb} (polite, past)`,
      'te':             `${verb} and... / please ${verb}`,
      'nai':            `don't ${verb} (plain)`,
      'dict':           `to ${verb} (plain)`,
      'ta':             `did ${verb} (plain, past)`,
      'nakatta':        `didn't ${verb} (plain, past)`,
      'tai':            `want to ${verb}`,
      'potential':      `can ${verb}`,
      'volitional':     `let's ${verb} / shall we ${verb}`,
      'passive':        `is ${verb}-ed / gets ${verb}-ed`,
      'causative':      `make/let someone ${verb}`,
      'ba':             `if I ${verb}`,
      'causative-passive': `is made to ${verb}`,
      'adj-present':    `it is ${verb}`,
      'adj-neg':        `it is not ${verb}`,
      'adj-past':       `it was ${verb}`,
      'adj-past-neg':   `it was not ${verb}`,
      'adj-te':         `${verb}, and...`,
      'adj-adverb':     `${verb}-ly / in a ${verb} way`,
    };
    return templates[form] || verb;
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

    const NEGATIVE_FORMS = new Set(['masu-neg', 'masu-past-neg', 'nai', 'nakatta', 'adj-neg', 'adj-past-neg']);
    const card = $('#card');
    card.style.setProperty('--form-color', fi.color);
    card.style.borderLeftColor = fi.color;
    card.classList.toggle('negative-form', NEGATIVE_FORMS.has(form));

    const badge = $('#card-form-badge');
    if (settings.hideForm) {
      badge.innerHTML = `<span class="form-symbol">?</span>`;
      badge.style.background = fi.color + '22';
      badge.style.color = fi.color;
      badge.style.borderColor = fi.color;
    } else {
      badge.innerHTML = `${fi.name} <span class="form-symbol">(${fi.symbol})</span>`;
      badge.style.background = fi.color + '22';
      badge.style.color = fi.color;
      badge.style.borderColor = fi.color;
    }

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
          + `<div class="example-jp">${exFront.ja}</div>`
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
      const input = $('#answer-input');
      input.value = '';
      input.className = 'answer-input';
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
      revealTranslateAnswer();
      return;
    }

    const userAnswer = $('#answer-input').value.trim();
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
      $('#key-capture').focus();
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
    $('#key-capture').focus();
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

  const VERB_CONTEXTS = {
    '行く': { pre: '学校に', en: 'to school' }, '帰る': { pre: '家に', en: 'home' },
    '聞く': { pre: '音楽を', en: 'to music' }, '聞く_ask': { pre: '先生に', en: 'the teacher' },
    '飲む': { pre: 'コーヒーを', en: 'coffee' },
    '話す': { pre: '日本語を', en: 'Japanese' }, '読む': { pre: '本を', en: 'a book' },
    '起きる': { pre: '朝早く', en: 'early in the morning' }, '食べる': { pre: '寿司を', en: 'sushi' },
    '寝る': { pre: '早く', en: 'early' }, '見る': { pre: '映画を', en: 'a movie' },
    '来る': { pre: '日本に', en: 'to Japan' }, 'する': { pre: '運動を', en: 'exercise' },
    '勉強する': { pre: '日本語を', en: 'Japanese' }, '会う': { pre: '友達に', en: 'a friend' },
    'ある': { pre: '机の上に', en: 'on the desk' }, '買う': { pre: '新しい靴を', en: 'new shoes' },
    '書く': { pre: '手紙を', en: 'a letter' }, '撮る': { pre: '写真を', en: 'a photo' },
    '待つ': { pre: 'バスを', en: 'for the bus' }, '分かる': { pre: '日本語が', en: 'Japanese' },
    'いる': { pre: '教室に', en: 'in the classroom' }, '泳ぐ': { pre: 'プールで', en: 'in the pool' },
    '乗る': { pre: '電車に', en: 'the train' }, 'やる': { pre: 'スポーツを', en: 'sports' },
    '出かける': { pre: '週末に', en: 'on weekends' }, '遊ぶ': { pre: '公園で', en: 'in the park' },
    '急ぐ': { pre: '駅まで', en: 'to the station' }, '返す': { pre: '本を', en: 'a book' },
    '消す': { pre: '電気を', en: 'the light' }, '死ぬ': { pre: '戦争で', en: 'in the war' },
    '座る': { pre: '椅子に', en: 'on a chair' }, '立つ': { pre: '教室で', en: 'in the classroom' },
    '吸う': { pre: 'タバコを', en: 'a cigarette' }, '使う': { pre: 'パソコンを', en: 'a computer' },
    '手伝う': { pre: '友達を', en: 'a friend' }, '入る': { pre: '部屋に', en: 'the room' },
    '持つ': { pre: 'かばんを', en: 'a bag' }, '休む': { pre: '今日', en: 'today' },
    '開ける': { pre: '窓を', en: 'the window' }, '教える': { pre: '英語を', en: 'English' },
    '降りる': { pre: 'バスを', en: 'the bus' }, '借りる': { pre: '本を', en: 'a book' },
    'つける': { pre: 'テレビを', en: 'the TV' }, '忘れる': { pre: '傘を', en: 'my umbrella' },
    '電話をかける': { pre: '母に', en: 'mom' }, '連れてくる': { pre: '友達を', en: 'a friend' },
    '持ってくる': { pre: 'お弁当を', en: 'a lunch box' }, '歌う': { pre: '歌を', en: 'a song' },
    'かぶる': { pre: '帽子を', en: 'a hat' }, '知る': { pre: '答えを', en: 'the answer' },
    '住む': { pre: '東京に', en: 'in Tokyo' }, 'はく': { pre: 'ジーンズを', en: 'jeans' },
    '太る': { pre: '最近', en: 'recently' }, 'かける': { pre: 'メガネを', en: 'glasses' },
    '着る': { pre: 'シャツを', en: 'a shirt' }, '勤める': { pre: '会社に', en: 'at a company' },
    '痩せる': { pre: '夏までに', en: 'by summer' }, '結婚する': { pre: '来年', en: 'next year' },
    '降る': { pre: '雨が', en: 'rain' }, '洗う': { pre: '皿を', en: 'the dishes' },
    '言う': { pre: '「ありがとう」と', en: '"thank you"' }, '要る': { pre: 'お金が', en: 'money' },
    '遅くなる': { pre: '今日は', en: 'today' }, '思う': { pre: 'そうだと', en: 'so' },
    '切る': { pre: '紙を', en: 'paper' }, '作る': { pre: '料理を', en: 'food' },
    '持っていく': { pre: 'お弁当を', en: 'a lunch box' }, '始める': { pre: '宿題を', en: 'homework' },
    '運転する': { pre: '車を', en: 'a car' }, '洗濯する': { pre: '服を', en: 'clothes' },
    '掃除する': { pre: '部屋を', en: 'the room' }, '料理する': { pre: '晩ご飯を', en: 'dinner' },
    '踊る': { pre: 'ダンスを', en: 'a dance' }, '終わる': { pre: '授業が', en: 'class' },
    '始まる': { pre: '映画が', en: 'the movie' }, '弾く': { pre: 'ピアノを', en: 'piano' },
    'もらう': { pre: 'プレゼントを', en: 'a present' }, '覚える': { pre: '漢字を', en: 'kanji' },
    '出る': { pre: '授業に', en: 'class' }, '運動する': { pre: '毎朝', en: 'every morning' },
    '散歩する': { pre: '公園で', en: 'in the park' }, 'かかる': { pre: '一時間', en: 'one hour' },
    '泊まる': { pre: 'ホテルに', en: 'at a hotel' }, 'なる': { pre: '先生に', en: 'a teacher' },
    '払う': { pre: 'お金を', en: 'money' }, '決める': { pre: '予定を', en: 'plans' },
    '練習する': { pre: 'テニスを', en: 'tennis' }, '取る': { pre: '授業を', en: 'a class' },
    '習う': { pre: '日本語を', en: 'Japanese' }, '登る': { pre: '山に', en: 'a mountain' },
    '働く': { pre: 'レストランで', en: 'at a restaurant' }, '飼う': { pre: '猫を', en: 'a cat' },
    'サボる': { pre: '授業を', en: 'class' }, '疲れる': { pre: '仕事で', en: 'from work' },
    'やめる': { pre: '仕事を', en: 'the job' }, '紹介する': { pre: '友達を', en: 'a friend' },
    'ダイエットする': { pre: '来月から', en: 'from next month' },
    '遅刻する': { pre: '学校に', en: 'for school' }, '留学する': { pre: 'アメリカに', en: 'in America' },
    '喉が渇く': { pre: '夏に', en: 'in summer' }, 'なくす': { pre: '鍵を', en: 'my keys' },
    '別れる': { pre: '彼女と', en: 'my girlfriend' }, '緊張する': { pre: 'テストの前に', en: 'before a test' },
    '心配する': { pre: '将来を', en: 'about the future' }, '編む': { pre: 'セーターを', en: 'a sweater' },
    '貸す': { pre: 'お金を', en: 'money' }, '頑張る': { pre: '試験のために', en: 'for the exam' },
    '泣く': { pre: '映画を見て', en: 'watching a movie' }, '磨く': { pre: '歯を', en: 'my teeth' },
    '約束を守る': { pre: 'いつも', en: 'always' }, '感動する': { pre: '映画に', en: 'by the movie' },
    '送る': { pre: '荷物を', en: 'a package' }, '似合う': { pre: 'この服が', en: 'this outfit' },
    '諦める': { pre: '夢を', en: 'a dream' }, 'あげる': { pre: 'プレゼントを', en: 'a present' },
    'くれる': { pre: '友達が本を', en: 'a book' }, 'できる': { pre: '日本語が', en: 'Japanese' },
    '相談する': { pre: '先生に', en: 'the teacher' }, '売る': { pre: '車を', en: 'a car' },
    '下ろす': { pre: 'お金を', en: 'money' }, '描く': { pre: '絵を', en: 'a picture' },
    '探す': { pre: '仕事を', en: 'a job' }, '誘う': { pre: '友達を', en: 'a friend' },
    'しゃべる': { pre: '電話で', en: 'on the phone' }, '付き合う': { pre: '彼女と', en: 'my girlfriend' },
    '着く': { pre: '駅に', en: 'at the station' }, '気をつける': { pre: '車に', en: 'cars' },
    '調べる': { pre: 'インターネットで', en: 'on the internet' },
    '見える': { pre: '山が', en: 'the mountain' }, '観光する': { pre: '京都を', en: 'Kyoto' },
    '卒業する': { pre: '大学を', en: 'university' }, '予約する': { pre: 'レストランを', en: 'a restaurant' },
    '起こす': { pre: '弟を', en: 'my brother' }, 'おごる': { pre: '友達に', en: 'a friend' },
    '落ち込む': { pre: '最近', en: 'recently' }, '困る': { pre: 'お金に', en: 'about money' },
    '出す': { pre: '宿題を', en: 'homework' }, '直す': { pre: 'パソコンを', en: 'the computer' },
    '見つかる': { pre: '鍵が', en: 'the keys' }, '訳す': { pre: '英語に', en: 'into English' },
    '笑う': { pre: '冗談で', en: 'at a joke' }, '集める': { pre: '切手を', en: 'stamps' },
    '入れる': { pre: '砂糖を', en: 'sugar' }, '乗り遅れる': { pre: '電車に', en: 'the train' },
    '見せる': { pre: '写真を', en: 'a photo' }, '朝寝坊する': { pre: '日曜日に', en: 'on Sundays' },
    '案内する': { pre: '町を', en: 'the town' }, '説明する': { pre: '問題を', en: 'the problem' },
    '選ぶ': { pre: 'プレゼントを', en: 'a present' }, '込む': { pre: '電車が', en: 'the train' },
    '脱ぐ': { pre: '靴を', en: 'shoes' }, '生まれる': { pre: '東京で', en: 'in Tokyo' },
    '足りる': { pre: 'お金が', en: 'money' }, '慣れる': { pre: '日本の生活に', en: 'life in Japan' },
    '化粧する': { pre: '毎朝', en: 'every morning' }, '就職する': { pre: '来年', en: 'next year' },
    '離婚する': { pre: '最近', en: 'recently' }, '開く': { pre: 'ドアが', en: 'the door' },
    '謝る': { pre: '先生に', en: 'to the teacher' }, '押す': { pre: 'ボタンを', en: 'the button' },
    '落とす': { pre: '財布を', en: 'my wallet' }, '転ぶ': { pre: '道で', en: 'on the road' },
    '壊す': { pre: 'おもちゃを', en: 'a toy' }, '咲く': { pre: '桜が', en: 'cherry blossoms' },
    '閉まる': { pre: '店が', en: 'the shop' }, '汚す': { pre: '服を', en: 'clothes' },
    '落ちる': { pre: '木から', en: 'from the tree' }, '片付ける': { pre: '部屋を', en: 'the room' },
    '考える': { pre: '将来を', en: 'the future' }, '消える': { pre: '電気が', en: 'the light' },
    '壊れる': { pre: 'パソコンが', en: 'the computer' }, '汚れる': { pre: '服が', en: 'clothes' },
    '注文する': { pre: 'ピザを', en: 'pizza' }, 'いらっしゃる': { pre: '先生が', en: 'the teacher' },
    '怒る': { pre: '母が', en: 'mom' }, 'おっしゃる': { pre: '先生が', en: 'the teacher' },
    '決まる': { pre: '予定が', en: 'plans' }, '下さる': { pre: '先生がお菓子を', en: 'sweets' },
    'ご覧になる': { pre: '映画を', en: 'a movie' }, '引っ越す': { pre: '大阪に', en: 'to Osaka' },
    '召し上がる': { pre: 'お寿司を', en: 'sushi' }, '呼ぶ': { pre: 'タクシーを', en: 'a taxi' },
    '寄る': { pre: 'コンビニに', en: 'the convenience store' },
    '遅れる': { pre: '電車が', en: 'the train' }, '晴れる': { pre: '明日', en: 'tomorrow' },
    'もてる': { pre: '学校で', en: 'at school' }, '招待する': { pre: 'パーティーに', en: 'to a party' },
    '注意する': { pre: '車に', en: 'cars' }, '致す': { pre: 'お手伝いを', en: 'a favor' },
    '頂く': { pre: 'お土産を', en: 'a souvenir' }, '伺う': { pre: '先生のお宅に', en: 'the teacher\'s home' },
    'おる': { pre: 'こちらに', en: 'here' }, '参る': { pre: 'すぐに', en: 'right away' },
    '曲がる': { pre: '右に', en: 'to the right' }, '申す': { pre: '田中と', en: 'Tanaka' },
    '戻る': { pre: '家に', en: 'home' }, '聞こえる': { pre: '音楽が', en: 'music' },
    '差し上げる': { pre: 'プレゼントを', en: 'a present' }, '伝える': { pre: 'メッセージを', en: 'a message' },
    '交換する': { pre: '電話番号を', en: 'phone numbers' }, '生活する': { pre: '東京で', en: 'in Tokyo' },
    '置く': { pre: '机の上に', en: 'on the desk' }, '触る': { pre: '展示物に', en: 'the exhibit' },
    '捕まる': { pre: '泥棒が', en: 'the thief' }, '包む': { pre: 'プレゼントを', en: 'a present' },
    '殴る': { pre: '壁を', en: 'the wall' }, '盗む': { pre: '財布を', en: 'a wallet' },
    '貼る': { pre: 'ポスターを', en: 'a poster' }, '踏む': { pre: '足を', en: 'a foot' },
    '焼く': { pre: 'ケーキを', en: 'a cake' }, 'いじめる': { pre: '弱い子を', en: 'weaker kids' },
    '着替える': { pre: '服を', en: 'clothes' }, 'ためる': { pre: 'お金を', en: 'money' },
    '続ける': { pre: '勉強を', en: 'studying' }, '褒める': { pre: '子供を', en: 'the child' },
    '間違える': { pre: '答えを', en: 'the answer' }, '見つける': { pre: '財布を', en: 'a wallet' },
    '連絡する': { pre: '友達に', en: 'a friend' }, '勝つ': { pre: '試合に', en: 'the game' },
    '運ぶ': { pre: '荷物を', en: 'luggage' }, '走る': { pre: '公園で', en: 'in the park' },
    '拾う': { pre: 'ゴミを', en: 'trash' }, '間に合う': { pre: '電車に', en: 'the train' },
    '育てる': { pre: '子供を', en: 'a child' }, '助ける': { pre: '友達を', en: 'a friend' },
    '負ける': { pre: '試合に', en: 'the game' }, '賛成する': { pre: 'この意見に', en: 'this opinion' },
    '反対する': { pre: 'その計画に', en: 'that plan' }, '翻訳する': { pre: '本を', en: 'a book' },
    '受ける': { pre: '試験を', en: 'an exam' }, '答える': { pre: '質問に', en: 'a question' },
    '離れる': { pre: '家から', en: 'from home' }, '我慢する': { pre: '痛みを', en: 'the pain' },
    '優勝する': { pre: '大会で', en: 'the tournament' },
  };

  const ADJ_CONTEXTS = {
    'おもしろい': { pre: 'この映画は', en: 'This movie' }, 'おいしい': { pre: 'このケーキは', en: 'This cake' },
    '楽しい': { pre: 'この旅行は', en: 'This trip' }, '安い': { pre: 'この店は', en: 'This shop' },
    '怖い': { pre: 'あの映画は', en: 'That movie' }, '寒い': { pre: '今日は', en: 'Today' },
    '暑い': { pre: '夏は', en: 'Summer' }, '忙しい': { pre: '今週は', en: 'This week' },
    '高い': { pre: 'この車は', en: 'This car' }, '大きい': { pre: 'この部屋は', en: 'This room' },
    '小さい': { pre: 'この箱は', en: 'This box' }, '新しい': { pre: 'この本は', en: 'This book' },
    '古い': { pre: 'この建物は', en: 'This building' }, 'いい': { pre: 'この天気は', en: 'This weather' },
    '難しい': { pre: 'この問題は', en: 'This problem' }, 'かっこいい': { pre: '彼は', en: 'He' },
    'つまらない': { pre: 'この授業は', en: 'This class' }, 'きれい': { pre: 'この公園は', en: 'This park' },
    '元気': { pre: '彼は', en: 'He' }, '静か': { pre: 'この図書館は', en: 'This library' },
    'にぎやか': { pre: 'この町は', en: 'This town' }, '好き': { pre: '猫が', en: 'Cats' },
    '嫌い': { pre: '虫が', en: 'Bugs' }, '暇': { pre: '今日は', en: 'Today' },
    'ハンサム': { pre: '彼は', en: 'He' }, '長い': { pre: 'この映画は', en: 'This movie' },
    '短い': { pre: 'この道は', en: 'This road' }, '速い': { pre: 'この電車は', en: 'This train' },
    '近い': { pre: '駅は', en: 'The station' }, '遠い': { pre: '学校は', en: 'The school' },
    '多い': { pre: '宿題が', en: 'Homework' }, '少ない': { pre: '時間が', en: 'Time' },
    '広い': { pre: 'この部屋は', en: 'This room' }, '狭い': { pre: 'このアパートは', en: 'This apartment' },
    '悪い': { pre: '天気は', en: 'The weather' }, '優しい': { pre: '先生は', en: 'The teacher' },
    '有名': { pre: 'この店は', en: 'This shop' }, '便利': { pre: 'この駅は', en: 'This station' },
    '暖かい': { pre: '今日は', en: 'Today' }, '涼しい': { pre: '秋は', en: 'Autumn' },
    '甘い': { pre: 'このケーキは', en: 'This cake' }, '辛い': { pre: 'このカレーは', en: 'This curry' },
    '簡単': { pre: 'この問題は', en: 'This problem' }, '嬉しい': { pre: '彼は', en: 'He' },
    '悲しい': { pre: 'あの映画は', en: 'That movie' }, '痛い': { pre: '頭が', en: 'My head' },
    '厳しい': { pre: 'この先生は', en: 'This teacher' }, '素敵': { pre: 'この服は', en: 'This outfit' },
    '汚い': { pre: 'この部屋は', en: 'This room' }, '危ない': { pre: 'この道は', en: 'This road' },
    '丈夫': { pre: 'この鞄は', en: 'This bag' }, '珍しい': { pre: 'この料理は', en: 'This dish' },
    '正直': { pre: '彼は', en: 'He' }, '明るい': { pre: 'この部屋は', en: 'This room' },
    '暗い': { pre: 'この道は', en: 'This road' }, '強い': { pre: '彼は', en: 'He' },
    '弱い': { pre: 'このチームは', en: 'This team' }, '正しい': { pre: 'この答えは', en: 'This answer' },
    '幸せ': { pre: '彼女は', en: 'She' },
  };

  function buildVerbJa(pre, conjugated, form) {
    switch (form) {
      case 'te':        return `${pre}${conjugated}ください。`;
      case 'dict':      return `${pre}${conjugated}のが好きです。`;
      case 'ta':        return `もう${pre}${conjugated}。`;
      case 'nakatta':   return `まだ${pre}${conjugated}。`;
      case 'tai':       return `${pre}${conjugated}です。`;
      case 'volitional': return `一緒に${pre}${conjugated}。`;
      case 'causative': return `子供に${pre}${conjugated}。`;
      case 'ba':        return `${pre}${conjugated}いいのに。`;
      case 'causative-passive': return `先生に${pre}${conjugated}。`;
      default:          return `${pre}${conjugated}。`;
    }
  }

  function buildVerbEn(v, ctx, form) {
    switch (form) {
      case 'masu':           return `I ${v} ${ctx}.`;
      case 'masu-neg':       return `I don't ${v} ${ctx}.`;
      case 'masu-past':      return `I did ${v} ${ctx}.`;
      case 'masu-past-neg':  return `I didn't ${v} ${ctx}.`;
      case 'te':             return `Please ${v} ${ctx}.`;
      case 'nai':            return `I don't ${v} ${ctx}.`;
      case 'dict':           return `I like to ${v} ${ctx}.`;
      case 'ta':             return `I already did ${v} ${ctx}.`;
      case 'nakatta':        return `I still didn't ${v} ${ctx}.`;
      case 'tai':            return `I want to ${v} ${ctx}.`;
      case 'potential':      return `I can ${v} ${ctx}.`;
      case 'volitional':     return `Let's ${v} ${ctx} together.`;
      case 'passive':        return `${ctx} was ${v}.`;
      case 'causative':      return `I made the child ${v} ${ctx}.`;
      case 'ba':             return `If I ${v} ${ctx}, it would be nice.`;
      case 'causative-passive': return `I was made to ${v} ${ctx}.`;
      default:               return `I ${v} ${ctx}.`;
    }
  }

  function buildAdjJa(pre, conjugated, form) {
    switch (form) {
      case 'adj-te':     return `${pre}${conjugated}、よかったです。`;
      case 'adj-adverb': return `${pre}${conjugated}なりました。`;
      default:           return `${pre}${conjugated}。`;
    }
  }

  function buildAdjEn(v, ctx, form) {
    switch (form) {
      case 'adj-present':   return `${ctx} is ${v}.`;
      case 'adj-neg':       return `${ctx} is not ${v}.`;
      case 'adj-past':      return `${ctx} was ${v}.`;
      case 'adj-past-neg':  return `${ctx} was not ${v}.`;
      case 'adj-te':        return `${ctx} is ${v}, and that's good.`;
      case 'adj-adverb':    return `${ctx} became more ${v}.`;
      default:              return `${ctx} is ${v}.`;
    }
  }

  function getExampleSentence(verb, form, conjugated) {
    const v = verb.meaning.replace(/^to /, '');
    const isAdj = verb.type === 'i-adj' || verb.type === 'na-adj';

    if (isAdj) {
      const ctx = ADJ_CONTEXTS[verb.kanji] || ADJ_CONTEXTS[verb.reading] || { pre: 'これは', en: 'This' };
      return { ja: buildAdjJa(ctx.pre, conjugated, form), en: buildAdjEn(v, ctx.en, form) };
    }

    const key = verb.disambig ? `${verb.kanji}_${verb.disambig}` : verb.kanji;
    const ctx = VERB_CONTEXTS[key] || VERB_CONTEXTS[verb.kanji] || { pre: '', en: '' };
    return { ja: buildVerbJa(ctx.pre, conjugated, form), en: buildVerbEn(v, ctx.en, form) };
  }

  function getExampleSentenceForFront(verb, form) {
    const v = verb.meaning.replace(/^to /, '');
    const isAdj = verb.type === 'i-adj' || verb.type === 'na-adj';
    const blank = '＿＿';

    if (isAdj) {
      const ctx = ADJ_CONTEXTS[verb.kanji] || ADJ_CONTEXTS[verb.reading] || { pre: 'これは', en: 'This' };
      return { ja: buildAdjJa(ctx.pre, blank, form), en: buildAdjEn(v, ctx.en, form) };
    }

    const key = verb.disambig ? `${verb.kanji}_${verb.disambig}` : verb.kanji;
    const ctx = VERB_CONTEXTS[key] || VERB_CONTEXTS[verb.kanji] || { pre: '', en: '' };
    return { ja: buildVerbJa(ctx.pre, blank, form), en: buildVerbEn(v, ctx.en, form) };
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
    const badgeBack = $('#card-form-badge-back');
    badgeBack.innerHTML = `${fi.name} <span class="form-symbol">(${fi.symbol})</span>`;
    badgeBack.style.background = fi.color + '22';
    badgeBack.style.color = fi.color;
    badgeBack.style.borderColor = fi.color;

    const kanjiBack = $('#card-kanji-back');
    kanjiBack.textContent = currentCard.verb.kanji;
    kanjiBack.classList.remove('translate-source-ja', 'translate-source-en');
    $('#card-reading-back').textContent = currentCard.verb.reading;
    $('#card-meaning-back').textContent = currentCard.verb.meaning;
    const conjugated = $('#card-conjugated');
    conjugated.innerHTML = formatConjugatedWithStem(currentCard, correct);
    conjugated.style.color = fi.color;
    $('#correct-answer').textContent = correct;
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
        + `<div class="example-jp">${exSentence.ja}</div>`
        + `<div class="example-en">${highlightKeywords(exSentence.en)}</div>`;
    } else {
      exEl.innerHTML = '';
    }
  }

  function normalize(str) {
    return str.replace(/\s/g, '').normalize('NFKC');
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

    return `<div class="ref-verb-types">
      <button class="ref-exc-header" id="ref-exc-toggle" aria-expanded="false">
        <span>RU-verbs vs U-verbs (ichidan / godan)</span>
        <span class="ref-exc-arrow">▶</span>
      </button>
      <div class="ref-exc-body hidden" id="ref-exc-body">
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
    </div>`;
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

    // Exception list toggle
    const excToggle = content.querySelector('#ref-exc-toggle');
    if (excToggle) {
      excToggle.addEventListener('click', () => {
        const body = content.querySelector('#ref-exc-body');
        const arrow = excToggle.querySelector('.ref-exc-arrow');
        const open = !body.classList.contains('hidden');
        body.classList.toggle('hidden', open);
        arrow.textContent = open ? '▶' : '▼';
        excToggle.setAttribute('aria-expanded', String(!open));
      });
    }

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

  function startCustomStudy() {
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

    sessionCards = prioritizeDifficult(sessionCards);
    if (sessionCards.length > 30) {
      sessionCards = sessionCards.slice(0, 30);
    }

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
    $('#card-form-badge').innerHTML = `${sourceLang} → ${targetLang}`;
    $('#card-form-badge').style.cssText = '';
    $('#card-kanji').textContent = '';
    $('#card-reading').textContent = '';
    $('#card-meaning').textContent = '';
    $('#card-prompt').textContent = '';
    $('#card-context').classList.add('hidden');
    $('#card-example-sentence-front').classList.add('hidden');
    $('#hint-area').classList.add('hidden');

    const kanjiEl = $('#card-kanji');
    if (isEnToJa) {
      kanjiEl.textContent = sourceText;
    } else {
      kanjiEl.innerHTML = settings.showFurigana ? (sentence.jaHtml || sentence.ja) : sentence.ja;
    }
    kanjiEl.classList.toggle('translate-source-ja', !isEnToJa);
    kanjiEl.classList.toggle('translate-source-en', isEnToJa);

    $('#card-prompt').textContent = `Translate to ${targetLang}`;

    $('#card-front').classList.remove('hidden');
    $('#card-back').classList.add('hidden');

    const isTyping = settings.typingMode;
    $('#reveal-area').classList.toggle('hidden', isTyping);
    $('#typing-area').classList.toggle('hidden', !isTyping);
    $('#btn-hint').classList.add('hidden');

    if (isTyping) {
      const input = $('#answer-input');
      input.value = '';
      input.placeholder = isEnToJa ? 'Type in Japanese...' : 'Type in English...';
      setTimeout(() => input.focus(), 50);
    }

    $('#study-bar-fill').style.width = `${((sessionIndex) / sessionTotal) * 100}%`;
    $('#study-progress-text').textContent = `${sessionIndex + 1} / ${sessionTotal}`;
    updateUndoButton();
  }

  function revealTranslateAnswer() {
    if (answered) return;
    answered = true;

    const { sentence, direction } = currentCard;
    const isEnToJa = direction === 'en-to-ja';
    const jaDisplay = settings.showFurigana ? (sentence.jaHtml || sentence.ja) : sentence.ja;

    $('#key-capture').focus();
    $('#card-front').classList.add('hidden');
    $('#card-back').classList.remove('hidden');

    $('#card-form-badge-back').innerHTML = $('#card-form-badge').innerHTML;
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
    exEl.innerHTML = `<div class="translate-original-label">Translation</div><div class="translate-original">${originalContent}</div>`;
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

  function startKanaStudy() {
    const pool = getKanaPool();
    if (pool.length === 0) return;

    const due = pool.filter(k => isDue(getCardState(srsData, k.id)));
    kanaSessionCards = prioritizeDifficult(due.length > 0 ? due : pool.slice());

    if (kanaSessionCards.length > 20) {
      kanaSessionCards = kanaSessionCards.slice(0, 20);
    }

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

  function startKanjiQuizStudy() {
    const pool = getKanjiQuizPool();
    if (pool.length === 0) return;

    const due = pool.filter(k => isDue(getCardState(srsData, k.id)));
    kanjiQuizSessionCards = prioritizeDifficult(due.length > 0 ? due : pool.slice());

    if (kanjiQuizSessionCards.length > 20) {
      kanjiQuizSessionCards = kanjiQuizSessionCards.slice(0, 20);
    }

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

  function startConfusableStudy() {
    const pool = getConfusablePool();
    if (pool.length === 0) return;

    const due = pool.filter(k => isDue(getCardState(srsData, k.id)));
    confusableSessionCards = prioritizeDifficult(due.length > 0 ? due : pool.slice());

    if (confusableSessionCards.length > 20) {
      confusableSessionCards = confusableSessionCards.slice(0, 20);
    }

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

  function getParticlesPool() {
    const selected = getSelectedParticles();
    return (window.PARTICLE_QUIZ_ITEMS || [])
      .filter(item => selected.includes(item.particle))
      .map(item => ({ ...item, id: particleCardId(item) }));
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

  function renderParticlesPanel() {
    renderParticleToggles();
    const pool = getParticlesPool();
    const due = pool.filter(item => isDue(getCardState(srsData, item.id))).length;
    const el = $('#particles-due-count');
    if (el) el.textContent = due;
  }

  function pickParticleChoices(item) {
    const distractors = (window.PARTICLE_DISTRACTOR_GROUPS[item.particle] || []).slice();
    shuffle(distractors);
    const result = [item.particle, ...distractors.slice(0, 3)];
    shuffle(result);
    return result;
  }

  function startParticlesStudy() {
    const pool = getParticlesPool();
    if (pool.length === 0) return;

    const due = pool.filter(item => isDue(getCardState(srsData, item.id)));
    particlesSessionCards = prioritizeDifficult(due.length > 0 ? due : pool.slice());

    if (particlesSessionCards.length > 20) {
      particlesSessionCards = particlesSessionCards.slice(0, 20);
    }

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

    // Only explain wrong answers — a right answer doesn't need justifying.
    const explanationEl = $('#particles-explanation');
    if (explanationEl) {
      if (!correct) {
        const explanation = (window.PARTICLE_EXPLANATIONS || {})[currentParticleCard.particle] || '';
        explanationEl.textContent = `The correct answer is ${currentParticleCard.particle}. ${explanation}`;
        explanationEl.classList.remove('hidden');
      } else {
        explanationEl.classList.add('hidden');
      }
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

  function renderKanjiHoverPage() {
    const grid = $('#kanji-hover-grid');
    if (!grid) return;

    const showKanjiFirst = getKanjiHoverDirection() === 'kanji-to-meaning';
    const levels = getKanjiHoverLevels();

    const items = [];
    levels.forEach(level => {
      (KANJI_QUIZ_DATA[level] || []).forEach(k => items.push({ level, kanji: k.kanji, meaning: k.meaning }));
    });

    grid.innerHTML = items.map(({ level, kanji, meaning }) => {
      const promptText = showKanjiFirst ? kanji : meaning;
      const answerText = showKanjiFirst ? meaning : kanji;
      const promptClass = showKanjiFirst ? 'kanji-hover-glyph' : 'kanji-hover-text';
      const answerClass = showKanjiFirst ? 'kanji-hover-text' : 'kanji-hover-glyph';
      return `
        <div class="kanji-hover-card">
          <div class="kanji-hover-level">${level}</div>
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

  // ─── Utilities ─────────────────────────────────────────────────────────────────

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
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
            <a href="index.html" class="header-title-link"><h1 id="header-title">Tokidoki</h1></a>
          </div>
          <div class="header-right">
            <span id="streak-badge" class="streak-badge" title="Daily streak">🔥 <span id="streak-count">0</span></span>
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
                  <span class="setting-label">Hide form name (harder mode)</span>
                  <span class="setting-desc">Only shows the English hint (e.g. "Polite past") — you must recall the form yourself</span>
                </div>
                <input type="checkbox" id="setting-hide-form" class="setting-toggle">
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
    if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A'].includes(el.tagName)) return true;
    return el.isContentEditable;
  }

  function init() {
    renderSharedChrome();
    initTheme();

    // The mode-tabs row scrolls horizontally once there are more tabs than
    // fit — make sure the active one (which can be the last tab) actually
    // starts in view instead of requiring a manual scroll to find it.
    const activeTab = $('.mode-tab.active');
    if (activeTab) activeTab.scrollIntoView({ block: 'nearest', inline: 'nearest' });

    srsData = loadSRS();
    statsData = loadStats();
    renderGlobalStats();

    const mode = document.body.dataset.mode || 'hub';

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
    } else if (mode === 'particles') {
      renderParticlesPanel();
    } else {
      renderHub();
    }

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
    });

    // Reference overlay
    function openReference() {
      const overlay = $('#ref-overlay');
      const isAdj = currentCard && (currentCard.verb.type === 'i-adj' || currentCard.verb.type === 'na-adj');
      const verbType = isAdj ? 'adj' : 'verb';
      const targetForm = currentCard ? currentCard.form : null;

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
      $('#setting-hide-form').checked = settings.hideForm;
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

    on('#setting-hide-form', 'change', (e) => {
      settings.hideForm = e.target.checked;
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
      renderKanjiHoverPage();
    }

    KANJI_QUIZ_LEVELS.forEach(level => {
      on(`#kanji-hover-toggle-${level}`, 'change', toggleKanjiHoverLevel);
    });

    on('#kanji-hover-grid', 'click', (e) => {
      const card = e.target.closest('.kanji-hover-card');
      if (card) card.classList.toggle('revealed');
    });

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
        renderGlobalStats();
        if (mode === 'verbs') renderChapters();
        else if (mode === 'adjectives') renderAdjChapters();
        else if (mode === 'kana') renderKanaPanel();
        else if (mode === 'kanji-quiz') renderKanjiQuizPanel();
        else if (mode === 'particles') renderParticlesPanel();
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

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        consumeKey(e);
        undoLastGrade();
        return;
      }

      if (answered) {
        if (e.key === '1') { consumeKey(e); gradeAndAdvance(1); return; }
        if (e.key === '2' || e.key === ' ') { consumeKey(e); gradeAndAdvance(4); return; }
        if (e.key === 'z' || e.key === 'Z') { consumeKey(e); undoLastGrade(); return; }
        return;
      }

      // Card front is showing
      if (e.key === 'h' || e.key === 'H') { consumeKey(e); toggleHint(); return; }
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
