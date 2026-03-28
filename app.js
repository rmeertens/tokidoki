(function () {
  'use strict';

  // ─── SRS Engine ────────────────────────────────────────────────────────────────

  const SRS_KEY = 'genki_conjugation_srs';
  const STATS_KEY = 'genki_conjugation_stats';
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

  const SETTINGS_KEY = 'genki_settings';

  function loadSettings() {
    const defaults = { typingMode: false, hideForm: true, showContext: true, englishToJapanese: true, showExampleFront: false };
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
    reference: $('#screen-reference'),
    settings: $('#screen-settings'),
  };

  // ─── Theme ─────────────────────────────────────────────────────────────────────

  function initTheme() {
    const saved = localStorage.getItem('genki_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('genki_theme', next);
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

  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');

    const backBtn = $('#btn-back');
    const title = $('#header-title');

    if (name === 'chapters') {
      backBtn.classList.add('hidden');
      title.textContent = 'Genki Conjugation Cards';
    } else if (name === 'study') {
      backBtn.classList.remove('hidden');
      title.textContent = studyMode === 'custom' ? 'Custom Session' : (CHAPTER_INFO[currentChapter]?.title || 'Study');
    } else if (name === 'reference') {
      backBtn.classList.remove('hidden');
      title.textContent = 'Conjugation Reference';
    } else if (name === 'settings') {
      backBtn.classList.remove('hidden');
      title.textContent = 'Settings';
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
    $('#streak-count').textContent = statsData.streak;
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
    const el = $('#save-indicator');
    el.classList.remove('hidden');
    el.classList.add('show');
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.classList.add('hidden'), 300);
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
      $('#key-capture').focus();
    }

    updateUndoButton();
  }

  function isAdjCard(card) {
    return card.verb.type === 'i-adj' || card.verb.type === 'na-adj';
  }

  function getCorrectAnswer(card) {
    const { verb, form } = card;
    if (studyMode === 'adjectives' || (studyMode === 'custom' && isAdjCard(card))) {
      return Conjugator.conjugateAdjective(verb, form);
    }
    return Conjugator.conjugate(verb, form);
  }

  function checkAnswer() {
    if (answered) return;

    const userAnswer = $('#answer-input').value.trim();
    const correct = getCorrectAnswer(currentCard);

    revealAnswer(userAnswer, correct);
  }

  function showAnswer() {
    if (answered) return;
    const correct = getCorrectAnswer(currentCard);
    revealAnswer('', correct);
  }

  function toggleHint() {
    if (answered || !currentCard) return;
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

  function getExampleSentence(verb, form, conjugated) {
    const v = verb.meaning.replace(/^to /, '');

    const verbTemplates = {
      'masu': [
        { ja: `私は毎日${conjugated}。`, en: `I ${v} every day.` },
        { ja: `友達と一緒に${conjugated}。`, en: `I ${v} together with a friend.` },
        { ja: `週末にいつも${conjugated}。`, en: `I always ${v} on weekends.` },
      ],
      'masu-neg': [
        { ja: `私はあまり${conjugated}。`, en: `I don't ${v} much.` },
        { ja: `今日は全然${conjugated}。`, en: `I don't ${v} at all today.` },
        { ja: `最近は${conjugated}。`, en: `I don't ${v} recently.` },
      ],
      'masu-past': [
        { ja: `昨日${conjugated}。`, en: `Yesterday, I did ${v}.` },
        { ja: `先週の日曜日に${conjugated}。`, en: `I did ${v} last Sunday.` },
        { ja: `友達と${conjugated}。`, en: `I did ${v} with a friend.` },
      ],
      'masu-past-neg': [
        { ja: `昨日は${conjugated}。`, en: `I didn't ${v} yesterday.` },
        { ja: `先月は一度も${conjugated}。`, en: `I didn't ${v} even once last month.` },
        { ja: `結局${conjugated}。`, en: `In the end, I didn't ${v}.` },
      ],
      'te': [
        { ja: `${conjugated}ください。`, en: `Please ${v}.` },
        { ja: `${conjugated}から、出かけましょう。`, en: `After you ${v}, let's go out.` },
        { ja: `${conjugated}もいいですか。`, en: `May I ${v}?` },
      ],
      'nai': [
        { ja: `今日は${conjugated}。`, en: `I don't ${v} today.` },
        { ja: `あの人は全然${conjugated}。`, en: `That person doesn't ${v} at all.` },
        { ja: `まだ${conjugated}。`, en: `I still don't ${v}.` },
      ],
      'dict': [
        { ja: `${conjugated}のが好きです。`, en: `I like to ${v}.` },
        { ja: `${conjugated}ことができます。`, en: `I am able to ${v}.` },
        { ja: `${conjugated}前に準備します。`, en: `I prepare before I ${v}.` },
      ],
      'ta': [
        { ja: `もう${conjugated}。`, en: `I already did ${v}.` },
        { ja: `さっき${conjugated}。`, en: `I just did ${v} a moment ago.` },
        { ja: `${conjugated}ことがあります。`, en: `I have done ${v} before.` },
      ],
      'nakatta': [
        { ja: `まだ${conjugated}。`, en: `I still didn't ${v}.` },
        { ja: `あの時は${conjugated}。`, en: `I didn't ${v} at that time.` },
        { ja: `一度も${conjugated}。`, en: `I never did ${v}.` },
      ],
      'tai': [
        { ja: `${conjugated}です。`, en: `I want to ${v}.` },
        { ja: `いつか${conjugated}と思います。`, en: `I think I want to ${v} someday.` },
        { ja: `今すぐ${conjugated}。`, en: `I want to ${v} right now.` },
      ],
      'potential': [
        { ja: `私は${conjugated}。`, en: `I can ${v}.` },
        { ja: `日本語で${conjugated}。`, en: `I can ${v} in Japanese.` },
        { ja: `一人で${conjugated}。`, en: `I can ${v} by myself.` },
      ],
      'volitional': [
        { ja: `一緒に${conjugated}。`, en: `Let's ${v} together.` },
        { ja: `今日は早く${conjugated}。`, en: `Let's ${v} early today.` },
        { ja: `みんなで${conjugated}。`, en: `Let's all ${v}.` },
      ],
      'passive': [
        { ja: `友達に${conjugated}。`, en: `Was ${v} by a friend.` },
        { ja: `先生に${conjugated}。`, en: `Was ${v} by the teacher.` },
        { ja: `みんなに${conjugated}。`, en: `Was ${v} by everyone.` },
      ],
      'causative': [
        { ja: `先生が${conjugated}。`, en: `The teacher made someone ${v}.` },
        { ja: `母が弟を${conjugated}。`, en: `Mom made my brother ${v}.` },
        { ja: `子供に${conjugated}。`, en: `I let the child ${v}.` },
      ],
      'ba': [
        { ja: `もっと${conjugated}よかったのに。`, en: `If only I did ${v} more.` },
        { ja: `早く${conjugated}間に合います。`, en: `If I ${v} early, I'll make it in time.` },
        { ja: `${conjugated}いいのに。`, en: `It would be nice if you ${v}.` },
      ],
      'causative-passive': [
        { ja: `先生に${conjugated}。`, en: `Was made to ${v} by the teacher.` },
        { ja: `親に${conjugated}。`, en: `Was made to ${v} by my parents.` },
        { ja: `毎日${conjugated}。`, en: `I'm made to ${v} every day.` },
      ],
    };

    const adjTemplates = {
      'adj-present': [
        { ja: `この部屋は${conjugated}。`, en: `This room is ${v}.` },
        { ja: `今日の天気は${conjugated}。`, en: `Today's weather is ${v}.` },
        { ja: `あの映画は${conjugated}。`, en: `That movie is ${v}.` },
      ],
      'adj-neg': [
        { ja: `この部屋は${conjugated}。`, en: `This room is not ${v}.` },
        { ja: `あの店はあまり${conjugated}。`, en: `That shop is not very ${v}.` },
        { ja: `今日は全然${conjugated}。`, en: `Today is not ${v} at all.` },
      ],
      'adj-past': [
        { ja: `昨日は${conjugated}。`, en: `Yesterday was ${v}.` },
        { ja: `去年の夏は${conjugated}。`, en: `Last summer was ${v}.` },
        { ja: `子供の時は${conjugated}。`, en: `When I was a child it was ${v}.` },
      ],
      'adj-past-neg': [
        { ja: `あまり${conjugated}。`, en: `It wasn't very ${v}.` },
        { ja: `思ったほど${conjugated}。`, en: `It wasn't as ${v} as I thought.` },
        { ja: `去年は${conjugated}。`, en: `Last year it wasn't ${v}.` },
      ],
      'adj-te': [
        { ja: `${conjugated}、楽しかった。`, en: `It was ${v}, and it was fun.` },
        { ja: `${conjugated}、びっくりしました。`, en: `It was ${v}, and I was surprised.` },
        { ja: `${conjugated}、よかったです。`, en: `It was ${v}, and that was good.` },
      ],
      'adj-adverb': [
        { ja: `${conjugated}なりました。`, en: `It became ${v}.` },
        { ja: `${conjugated}作ってください。`, en: `Please make it ${v}.` },
        { ja: `${conjugated}話してください。`, en: `Please speak ${v}.` },
      ],
    };

    const templates = verbTemplates[form] || adjTemplates[form];
    if (!templates) return null;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  function getExampleSentenceForFront(verb, form) {
    const v = verb.meaning.replace(/^to /, '');

    const verbTemplates = {
      'masu':             [{ ja: `私は毎日＿＿。`, en: `I ${v} every day.` }, { ja: `友達と一緒に＿＿。`, en: `I ${v} with a friend.` }, { ja: `週末にいつも＿＿。`, en: `I always ${v} on weekends.` }],
      'masu-neg':         [{ ja: `私はあまり＿＿。`, en: `I don't ${v} much.` }, { ja: `今日は全然＿＿。`, en: `I don't ${v} at all today.` }],
      'masu-past':        [{ ja: `昨日＿＿。`, en: `Yesterday, I did ${v}.` }, { ja: `先週の日曜日に＿＿。`, en: `I did ${v} last Sunday.` }],
      'masu-past-neg':    [{ ja: `昨日は＿＿。`, en: `I didn't ${v} yesterday.` }, { ja: `結局＿＿。`, en: `In the end, I didn't ${v}.` }],
      'te':               [{ ja: `＿＿ください。`, en: `Please ${v}.` }, { ja: `＿＿ もいいですか。`, en: `May I ${v}?` }],
      'nai':              [{ ja: `今日は＿＿。`, en: `I don't ${v} today.` }, { ja: `まだ＿＿。`, en: `I still don't ${v}.` }],
      'dict':             [{ ja: `＿＿のが好きです。`, en: `I like to ${v}.` }, { ja: `＿＿前に準備します。`, en: `I prepare before I ${v}.` }],
      'ta':               [{ ja: `もう＿＿。`, en: `I already did ${v}.` }, { ja: `＿＿ことがあります。`, en: `I have done ${v} before.` }],
      'nakatta':          [{ ja: `まだ＿＿。`, en: `I still didn't ${v}.` }, { ja: `一度も＿＿。`, en: `I never did ${v}.` }],
      'tai':              [{ ja: `＿＿です。`, en: `I want to ${v}.` }, { ja: `今すぐ＿＿。`, en: `I want to ${v} right now.` }],
      'potential':        [{ ja: `私は＿＿。`, en: `I can ${v}.` }, { ja: `一人で＿＿。`, en: `I can ${v} by myself.` }],
      'volitional':       [{ ja: `一緒に＿＿。`, en: `Let's ${v} together.` }, { ja: `みんなで＿＿。`, en: `Let's all ${v}.` }],
      'passive':          [{ ja: `友達に＿＿。`, en: `Was ${v} by a friend.` }, { ja: `先生に＿＿。`, en: `Was ${v} by the teacher.` }],
      'causative':        [{ ja: `先生が＿＿。`, en: `The teacher made someone ${v}.` }, { ja: `子供に＿＿。`, en: `I let the child ${v}.` }],
      'ba':               [{ ja: `もっと＿＿よかったのに。`, en: `If only I did ${v} more.` }, { ja: `＿＿いいのに。`, en: `It would be nice if you ${v}.` }],
      'causative-passive': [{ ja: `先生に＿＿。`, en: `Was made to ${v} by the teacher.` }, { ja: `毎日＿＿。`, en: `I'm made to ${v} every day.` }],
    };

    const adjTemplates = {
      'adj-present':      [{ ja: `この部屋は＿＿。`, en: `This room is ${v}.` }, { ja: `あの映画は＿＿。`, en: `That movie is ${v}.` }],
      'adj-neg':          [{ ja: `この部屋は＿＿。`, en: `This room is not ${v}.` }, { ja: `あの店はあまり＿＿。`, en: `That shop is not very ${v}.` }],
      'adj-past':         [{ ja: `昨日は＿＿。`, en: `Yesterday was ${v}.` }, { ja: `去年の夏は＿＿。`, en: `Last summer was ${v}.` }],
      'adj-past-neg':     [{ ja: `あまり＿＿。`, en: `It wasn't very ${v}.` }, { ja: `思ったほど＿＿。`, en: `It wasn't as ${v} as I thought.` }],
      'adj-te':           [{ ja: `＿＿、楽しかった。`, en: `It was ${v}, and it was fun.` }, { ja: `＿＿、びっくりしました。`, en: `It was ${v}, and I was surprised.` }],
      'adj-adverb':       [{ ja: `＿＿なりました。`, en: `It became ${v}.` }, { ja: `＿＿作ってください。`, en: `Please make it ${v}.` }],
    };

    const templates = verbTemplates[form] || adjTemplates[form];
    if (!templates) return null;
    return templates[Math.floor(Math.random() * templates.length)];
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
        const prefix = reading.slice(0, -2);
        const stems = {
          'masu': 'し', 'masu-neg': 'し', 'masu-past': 'し', 'masu-past-neg': 'し',
          'te': 'し', 'ta': 'し', 'nai': 'し', 'nakatta': 'し', 'tai': 'し',
          'potential': 'でき', 'volitional': 'し', 'passive': 'さ', 'causative': 'さ',
          'causative-passive': 'さ', 'ba': 'す',
        };
        return prefix + (stems[form] || 'し');
      }

      if (isKuru) {
        const prefix = reading.slice(0, -2);
        const stems = {
          'masu': 'き', 'masu-neg': 'き', 'masu-past': 'き', 'masu-past-neg': 'き',
          'te': 'き', 'ta': 'き', 'tai': 'き', 'nai': 'こ', 'nakatta': 'こ',
          'potential': 'こられ', 'volitional': 'こ', 'passive': 'こられ',
          'causative': 'こさせ', 'causative-passive': 'こさせられ', 'ba': 'く',
        };
        return prefix + (stems[form] || 'き');
      }
    }

    return null;
  }

  function formatConjugatedWithStem(card, correct) {
    const stem = getStemForDisplay(card);
    if (!stem || !correct.startsWith(stem) || stem.length >= correct.length) {
      return correct;
    }

    const ending = correct.slice(stem.length);
    return `<span class="conjugation-stem">${stem}</span><span class="conjugation-ending">${ending}</span>`;
  }

  function revealAnswer(userAnswer, correct) {
    answered = true;

    if (settings.typingMode) {
      const input = $('#answer-input');
      const isCorrect = normalize(userAnswer) === normalize(correct);
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

    const fi = Conjugator.getFormInfo(currentCard.form);
    const badgeBack = $('#card-form-badge-back');
    badgeBack.innerHTML = `${fi.name} <span class="form-symbol">(${fi.symbol})</span>`;
    badgeBack.style.background = fi.color + '22';
    badgeBack.style.color = fi.color;
    badgeBack.style.borderColor = fi.color;

    $('#card-kanji-back').textContent = currentCard.verb.kanji;
    $('#card-reading-back').textContent = currentCard.verb.reading;
    $('#card-meaning-back').textContent = currentCard.verb.meaning;
    const conjugated = $('#card-conjugated');
    conjugated.innerHTML = formatConjugatedWithStem(currentCard, correct);
    conjugated.style.color = fi.color;
    $('#correct-answer').textContent = correct;

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
    $('#card').classList.add('hidden');
    const complete = $('#session-complete');
    complete.classList.remove('hidden');

    $('#session-total').textContent = sessionIndex;
    $('#session-correct').textContent = sessionCorrect;
    const acc = sessionIndex > 0 ? Math.round((sessionCorrect / sessionIndex) * 100) : 0;
    $('#session-accuracy').textContent = acc + '%';
  }

  // ─── Reference Screen ─────────────────────────────────────────────────────────

  function renderReference(verbType) {
    const content = $('#ref-content');

    let exampleVerb, label;
    if (verbType === 'u') {
      exampleVerb = { reading: 'かく', kanji: '書く', type: 'u', meaning: 'to write', chapter: 4 };
      label = '書く (かく)';
    } else if (verbType === 'ru') {
      exampleVerb = { reading: 'たべる', kanji: '食べる', type: 'ru', meaning: 'to eat', chapter: 3 };
      label = '食べる (たべる)';
    } else {
      exampleVerb = null;
      label = 'する / 来る';
    }

    let rows = '';
    Conjugator.ALL_FORMS.forEach(form => {
      const fi = Conjugator.getFormInfo(form);
      let example;
      if (verbType === 'irr') {
        const suru = { reading: 'する', type: 'irregular', chapter: 3 };
        const kuru = { reading: 'くる', type: 'irregular', chapter: 3 };
        example = Conjugator.conjugate(suru, form) + ' / ' + Conjugator.conjugate(kuru, form);
      } else {
        example = Conjugator.conjugate(exampleVerb, form);
      }

      rows += `<tr>
        <td><span class="form-pill" style="background:${fi.color}22;color:${fi.color}">${fi.symbol}</span></td>
        <td style="font-family:var(--font);font-size:0.8rem">${fi.name}</td>
        <td>${example}</td>
        <td style="font-family:var(--font);font-size:0.75rem;color:var(--text-dim)">Ch ${fi.chapter}</td>
      </tr>`;
    });

    content.innerHTML = `
      <table class="ref-table">
        <thead><tr><th></th><th>Form</th><th>Example: ${label}</th><th>Intro</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
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
      syncToggleBtn($('#btn-toggle-verbs'), customVerbsSelected.size, verbsContainer.querySelectorAll('.custom-verb-cb').length);
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
      const allOn = customVerbsSelected.size >= totalCbs.length;
      totalCbs.forEach(cb => {
        cb.checked = !allOn;
        if (!allOn) customVerbsSelected.add(cb.dataset.verbKey);
      });
      if (allOn) customVerbsSelected.clear();
      syncToggleBtn($('#btn-toggle-verbs'), customVerbsSelected.size, totalCbs.length);
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
      syncToggleBtn($('#btn-toggle-verbs'), customVerbsSelected.size, verbsContainer.querySelectorAll('.custom-verb-cb').length);
      updateCustomCount();
    });

    // Start button
    $('#btn-start-custom').addEventListener('click', startCustomStudy);

    updateCustomCount();
  }

  function updateCustomCount() {
    const count = customFormsSelected.size * customVerbsSelected.size;
    $('#custom-count').textContent = `${count} card${count !== 1 ? 's' : ''}`;
    $('#btn-start-custom').disabled = count === 0;
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

  function init() {
    initTheme();

    srsData = loadSRS();
    statsData = loadStats();

    renderChapters();
    renderAdjChapters();
    renderReference('u');

    // Mode tabs (Verbs / Adjectives / Build Your Own)
    document.querySelectorAll('.mode-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const mode = tab.dataset.mode;
        $('#verb-chapters').classList.toggle('hidden', mode !== 'verbs');
        $('#adj-chapters').classList.toggle('hidden', mode !== 'adjectives');
        $('#custom-builder').classList.toggle('hidden', mode !== 'custom');
        if (mode === 'custom') renderCustomPanel();
      });
    });

    // Theme toggle
    $('#btn-theme').addEventListener('click', toggleTheme);

    // Back button
    $('#btn-back').addEventListener('click', () => {
      showScreen('chapters');
      renderChapters();
      renderAdjChapters();
    });

    // Reference button
    $('#btn-ref').addEventListener('click', () => {
      if (screens.reference.classList.contains('active')) {
        showScreen('chapters');
        renderChapters();
        renderAdjChapters();
      } else {
        showScreen('reference');
      }
    });

    // Settings button
    $('#btn-settings').addEventListener('click', () => {
      if (screens.settings.classList.contains('active')) {
        showScreen('chapters');
        renderChapters();
        renderAdjChapters();
      } else {
        showScreen('settings');
        $('#setting-typing-mode').checked = settings.typingMode;
        $('#setting-hide-form').checked = settings.hideForm;
        $('#setting-show-context').checked = settings.showContext;
        $('#setting-english-to-japanese').checked = settings.englishToJapanese;
        $('#setting-show-example-front').checked = settings.showExampleFront;
      }
    });

    // Settings toggles
    $('#setting-typing-mode').addEventListener('change', (e) => {
      settings.typingMode = e.target.checked;
      saveSettings(settings);
    });

    $('#setting-hide-form').addEventListener('change', (e) => {
      settings.hideForm = e.target.checked;
      saveSettings(settings);
    });

    $('#setting-show-context').addEventListener('change', (e) => {
      settings.showContext = e.target.checked;
      saveSettings(settings);
    });

    $('#setting-english-to-japanese').addEventListener('change', (e) => {
      settings.englishToJapanese = e.target.checked;
      saveSettings(settings);
    });

    $('#setting-show-example-front').addEventListener('change', (e) => {
      settings.showExampleFront = e.target.checked;
      saveSettings(settings);
    });

    // Reveal button (default mode)
    $('#btn-reveal').addEventListener('click', showAnswer);
    $('#btn-hint').addEventListener('click', toggleHint);

    // Check answer (typing mode)
    $('#btn-check').addEventListener('click', checkAnswer);

    // Show answer (typing mode)
    $('#btn-show').addEventListener('click', showAnswer);

    // Grade buttons
    $$('.btn-grade').forEach(btn => {
      btn.addEventListener('click', () => {
        gradeAndAdvance(parseInt(btn.dataset.grade));
      });
    });

    // Back to chapters from session complete
    $('#btn-back-to-chapters').addEventListener('click', () => {
      showScreen('chapters');
      renderChapters();
      renderAdjChapters();
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
    $('#btn-reset').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset ALL progress? This cannot be undone.')) {
        localStorage.removeItem(SRS_KEY);
        localStorage.removeItem(STATS_KEY);
        srsData = {};
        statsData = loadStats();
        renderChapters();
        renderAdjChapters();
      }
    });

    // Undo button
    $('#btn-undo').addEventListener('click', undoLastGrade);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (!screens.study.classList.contains('active')) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undoLastGrade();
        return;
      }

      if (answered) {
        if (e.key === '1') { e.preventDefault(); gradeAndAdvance(1); return; }
        if (e.key === '2' || e.key === ' ') { e.preventDefault(); gradeAndAdvance(3); return; }
        if (e.key === '3') { e.preventDefault(); gradeAndAdvance(4); return; }
        if (e.key === 'z' || e.key === 'Z') { e.preventDefault(); undoLastGrade(); return; }
        return;
      }

      // Card front is showing
      if (e.key === 'h' || e.key === 'H') { e.preventDefault(); toggleHint(); return; }
      if (settings.typingMode) {
        if (e.key === 'Enter') { e.preventDefault(); checkAnswer(); }
      } else {
        if (e.key === ' ') { e.preventDefault(); showAnswer(); return; }
        if (e.key === 'z' || e.key === 'Z') { e.preventDefault(); undoLastGrade(); return; }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
