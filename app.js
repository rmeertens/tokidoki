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

  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');

    const backBtn = $('#btn-back');
    const title = $('#header-title');

    if (name === 'chapters') {
      backBtn.classList.add('hidden');
      title.textContent = 'Tokidoki';
    } else if (name === 'study') {
      backBtn.classList.remove('hidden');
      title.textContent = studyMode === 'translate' ? 'Translate Sentences' : studyMode === 'custom' ? 'Custom Session' : (CHAPTER_INFO[currentChapter]?.title || 'Study');
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

    content.innerHTML = `
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

  const TRANSLATE_SENTENCES = {
    3: [
      { ja: '私は毎日コーヒーを飲みます。', jaHtml: '<ruby>私<rp>(</rp><rt>わたし</rt><rp>)</rp></ruby>は<ruby>毎日<rp>(</rp><rt>まいにち</rt><rp>)</rp></ruby>コーヒーを<ruby>飲<rp>(</rp><rt>の</rt><rp>)</rp></ruby>みます。', en: 'I drink coffee every day.' },
      { ja: '山田さんは日本語を話します。', jaHtml: '<ruby>山田<rp>(</rp><rt>やまだ</rt><rp>)</rp></ruby>さんは<ruby>日本語<rp>(</rp><rt>にほんご</rt><rp>)</rp></ruby>を<ruby>話<rp>(</rp><rt>はな</rt><rp>)</rp></ruby>します。', en: 'Mr. Yamada speaks Japanese.' },
      { ja: '私は朝六時に起きます。', jaHtml: '<ruby>私<rp>(</rp><rt>わたし</rt><rp>)</rp></ruby>は<ruby>朝<rp>(</rp><rt>あさ</rt><rp>)</rp></ruby><ruby>六<rp>(</rp><rt>ろく</rt><rp>)</rp></ruby><ruby>時<rp>(</rp><rt>じ</rt><rp>)</rp></ruby>に<ruby>起<rp>(</rp><rt>お</rt><rp>)</rp></ruby>きます。', en: 'I wake up at 6 in the morning.' },
      { ja: '友達は来ません。', jaHtml: '<ruby>友達<rp>(</rp><rt>ともだち</rt><rp>)</rp></ruby>は<ruby>来<rp>(</rp><rt>き</rt><rp>)</rp></ruby>ません。', en: 'My friend is not coming.' },
      { ja: '私は映画を見ません。', jaHtml: '<ruby>私<rp>(</rp><rt>わたし</rt><rp>)</rp></ruby>は<ruby>映画<rp>(</rp><rt>えいが</rt><rp>)</rp></ruby>を<ruby>見<rp>(</rp><rt>み</rt><rp>)</rp></ruby>ません。', en: "I don't watch movies." },
      { ja: '田中さんは本を読みます。', jaHtml: '<ruby>田中<rp>(</rp><rt>たなか</rt><rp>)</rp></ruby>さんは<ruby>本<rp>(</rp><rt>ほん</rt><rp>)</rp></ruby>を<ruby>読<rp>(</rp><rt>よ</rt><rp>)</rp></ruby>みます。', en: 'Mr. Tanaka reads books.' },
      { ja: '私は毎日勉強します。', jaHtml: '<ruby>私<rp>(</rp><rt>わたし</rt><rp>)</rp></ruby>は<ruby>毎日<rp>(</rp><rt>まいにち</rt><rp>)</rp></ruby><ruby>勉強<rp>(</rp><rt>べんきょう</rt><rp>)</rp></ruby>します。', en: 'I study every day.' },
      { ja: '学生は昼ご飯を食べます。', jaHtml: '<ruby>学生<rp>(</rp><rt>がくせい</rt><rp>)</rp></ruby>は<ruby>昼<rp>(</rp><rt>ひる</rt><rp>)</rp></ruby>ご<ruby>飯<rp>(</rp><rt>はん</rt><rp>)</rp></ruby>を<ruby>食<rp>(</rp><rt>た</rt><rp>)</rp></ruby>べます。', en: 'The student eats lunch.' },
      { ja: '私は十一時に寝ます。', jaHtml: '<ruby>私<rp>(</rp><rt>わたし</rt><rp>)</rp></ruby>は<ruby>十<rp>(</rp><rt>じゅう</rt><rp>)</rp></ruby><ruby>一<rp>(</rp><rt>いち</rt><rp>)</rp></ruby><ruby>時<rp>(</rp><rt>じ</rt><rp>)</rp></ruby>に<ruby>寝<rp>(</rp><rt>ね</rt><rp>)</rp></ruby>ます。', en: 'I go to bed at 11.' },
      { ja: '明日学校に行きます。', jaHtml: '<ruby>明日<rp>(</rp><rt>あした</rt><rp>)</rp></ruby><ruby>学校<rp>(</rp><rt>がっこう</rt><rp>)</rp></ruby>に<ruby>行<rp>(</rp><rt>い</rt><rp>)</rp></ruby>きます。', en: 'I will go to school tomorrow.' },
      { ja: '週末に家に帰ります。', jaHtml: '<ruby>週末<rp>(</rp><rt>しゅうまつ</rt><rp>)</rp></ruby>に<ruby>家<rp>(</rp><rt>いえ</rt><rp>)</rp></ruby>に<ruby>帰<rp>(</rp><rt>かえ</rt><rp>)</rp></ruby>ります。', en: 'I will go home on the weekend.' },
      { ja: '音楽を聞きません。', jaHtml: '<ruby>音楽<rp>(</rp><rt>おんがく</rt><rp>)</rp></ruby>を<ruby>聞<rp>(</rp><rt>き</rt><rp>)</rp></ruby>きません。', en: "I don't listen to music." },
    ],
    4: [
      { ja: '昨日友達に会いました。', jaHtml: '<ruby>昨日<rp>(</rp><rt>きのう</rt><rp>)</rp></ruby><ruby>友達<rp>(</rp><rt>ともだち</rt><rp>)</rp></ruby>に<ruby>会<rp>(</rp><rt>あ</rt><rp>)</rp></ruby>いました。', en: 'I met a friend yesterday.' },
      { ja: '本を買いませんでした。', jaHtml: '<ruby>本<rp>(</rp><rt>ほん</rt><rp>)</rp></ruby>を<ruby>買<rp>(</rp><rt>か</rt><rp>)</rp></ruby>いませんでした。', en: "I didn't buy a book." },
      { ja: '写真を撮りました。', jaHtml: '<ruby>写真<rp>(</rp><rt>しゃしん</rt><rp>)</rp></ruby>を<ruby>撮<rp>(</rp><rt>と</rt><rp>)</rp></ruby>りました。', en: 'I took a photo.' },
      { ja: '手紙を書きました。', jaHtml: '<ruby>手紙<rp>(</rp><rt>てがみ</rt><rp>)</rp></ruby>を<ruby>書<rp>(</rp><rt>か</rt><rp>)</rp></ruby>きました。', en: 'I wrote a letter.' },
      { ja: 'バスを待ちませんでした。', jaHtml: 'バスを<ruby>待<rp>(</rp><rt>ま</rt><rp>)</rp></ruby>ちませんでした。', en: "I didn't wait for the bus." },
      { ja: '日本語が分かりました。', jaHtml: '<ruby>日本語<rp>(</rp><rt>にほんご</rt><rp>)</rp></ruby>が<ruby>分<rp>(</rp><rt>わ</rt><rp>)</rp></ruby>かりました。', en: 'I understood Japanese.' },
      { ja: '教室に猫がいました。', jaHtml: '<ruby>教室<rp>(</rp><rt>きょうしつ</rt><rp>)</rp></ruby>に<ruby>猫<rp>(</rp><rt>ねこ</rt><rp>)</rp></ruby>がいました。', en: 'There was a cat in the classroom.' },
      { ja: '机の上に本がありました。', jaHtml: '<ruby>机<rp>(</rp><rt>つくえ</rt><rp>)</rp></ruby>の<ruby>上<rp>(</rp><rt>うえ</rt><rp>)</rp></ruby>に<ruby>本<rp>(</rp><rt>ほん</rt><rp>)</rp></ruby>がありました。', en: 'There was a book on the desk.' },
      { ja: '先週新しい靴を買いました。', jaHtml: '<ruby>先週<rp>(</rp><rt>せんしゅう</rt><rp>)</rp></ruby><ruby>新<rp>(</rp><rt>あたら</rt><rp>)</rp></ruby>しい<ruby>靴<rp>(</rp><rt>くつ</rt><rp>)</rp></ruby>を<ruby>買<rp>(</rp><rt>か</rt><rp>)</rp></ruby>いました。', en: 'I bought new shoes last week.' },
      { ja: '昨日写真を撮りませんでした。', jaHtml: '<ruby>昨日<rp>(</rp><rt>きのう</rt><rp>)</rp></ruby><ruby>写真<rp>(</rp><rt>しゃしん</rt><rp>)</rp></ruby>を<ruby>撮<rp>(</rp><rt>と</rt><rp>)</rp></ruby>りませんでした。', en: "I didn't take a photo yesterday." },
    ],
    5: [
      { ja: '毎日プールで泳ぎます。', jaHtml: '<ruby>毎日<rp>(</rp><rt>まいにち</rt><rp>)</rp></ruby>プールで<ruby>泳<rp>(</rp><rt>およ</rt><rp>)</rp></ruby>ぎます。', en: 'I swim in the pool every day.' },
      { ja: '先生に聞きました。', jaHtml: '<ruby>先生<rp>(</rp><rt>せんせい</rt><rp>)</rp></ruby>に<ruby>聞<rp>(</rp><rt>き</rt><rp>)</rp></ruby>きました。', en: 'I asked the teacher.' },
      { ja: '電車に乗ります。', jaHtml: '<ruby>電車<rp>(</rp><rt>でんしゃ</rt><rp>)</rp></ruby>に<ruby>乗<rp>(</rp><rt>の</rt><rp>)</rp></ruby>ります。', en: 'I ride the train.' },
      { ja: '週末に出かけませんでした。', jaHtml: '<ruby>週末<rp>(</rp><rt>しゅうまつ</rt><rp>)</rp></ruby>に<ruby>出<rp>(</rp><rt>で</rt><rp>)</rp></ruby>かけませんでした。', en: "I didn't go out on the weekend." },
      { ja: 'スポーツをやりますか。', jaHtml: 'スポーツをやりますか。', en: 'Do you do sports?' },
      { ja: '昨日プールで泳ぎませんでした。', jaHtml: '<ruby>昨日<rp>(</rp><rt>きのう</rt><rp>)</rp></ruby>プールで<ruby>泳<rp>(</rp><rt>およ</rt><rp>)</rp></ruby>ぎませんでした。', en: "I didn't swim in the pool yesterday." },
      { ja: '友達と映画を見ました。', jaHtml: '<ruby>友達<rp>(</rp><rt>ともだち</rt><rp>)</rp></ruby>と<ruby>映画<rp>(</rp><rt>えいが</rt><rp>)</rp></ruby>を<ruby>見<rp>(</rp><rt>み</rt><rp>)</rp></ruby>ました。', en: 'I watched a movie with a friend.' },
      { ja: '先生に日本語で聞きました。', jaHtml: '<ruby>先生<rp>(</rp><rt>せんせい</rt><rp>)</rp></ruby>に<ruby>日本語<rp>(</rp><rt>にほんご</rt><rp>)</rp></ruby>で<ruby>聞<rp>(</rp><rt>き</rt><rp>)</rp></ruby>きました。', en: 'I asked the teacher in Japanese.' },
      { ja: '明日出かけます。', jaHtml: '<ruby>明日<rp>(</rp><rt>あした</rt><rp>)</rp></ruby><ruby>出<rp>(</rp><rt>で</rt><rp>)</rp></ruby>かけます。', en: 'I will go out tomorrow.' },
      { ja: '昨日電車に乗りませんでした。', jaHtml: '<ruby>昨日<rp>(</rp><rt>きのう</rt><rp>)</rp></ruby><ruby>電車<rp>(</rp><rt>でんしゃ</rt><rp>)</rp></ruby>に<ruby>乗<rp>(</rp><rt>の</rt><rp>)</rp></ruby>りませんでした。', en: "I didn't ride the train yesterday." },
    ],
    6: [
      { ja: '窓を開けてください。', jaHtml: '<ruby>窓<rp>(</rp><rt>まど</rt><rp>)</rp></ruby>を<ruby>開<rp>(</rp><rt>あ</rt><rp>)</rp></ruby>けてください。', en: 'Please open the window.' },
      { ja: 'テレビをつけてください。', jaHtml: 'テレビをつけてください。', en: 'Please turn on the TV.' },
      { ja: '友達を手伝ってください。', jaHtml: '<ruby>友達<rp>(</rp><rt>ともだち</rt><rp>)</rp></ruby>を<ruby>手伝<rp>(</rp><rt>てつだ</rt><rp>)</rp></ruby>ってください。', en: 'Please help your friend.' },
      { ja: '座ってください。', jaHtml: '<ruby>座<rp>(</rp><rt>すわ</rt><rp>)</rp></ruby>ってください。', en: 'Please sit down.' },
      { ja: '電気を消してください。', jaHtml: '<ruby>電気<rp>(</rp><rt>でんき</rt><rp>)</rp></ruby>を<ruby>消<rp>(</rp><rt>け</rt><rp>)</rp></ruby>してください。', en: 'Please turn off the light.' },
      { ja: '母に電話をかけました。', jaHtml: '<ruby>母<rp>(</rp><rt>はは</rt><rp>)</rp></ruby>に<ruby>電話<rp>(</rp><rt>でんわ</rt><rp>)</rp></ruby>をかけました。', en: 'I called my mother on the phone.' },
      { ja: '友達を連れてきました。', jaHtml: '<ruby>友達<rp>(</rp><rt>ともだち</rt><rp>)</rp></ruby>を<ruby>連<rp>(</rp><rt>つ</rt><rp>)</rp></ruby>れてきました。', en: 'I brought a friend along.' },
      { ja: 'お弁当を持ってきてください。', jaHtml: 'お<ruby>弁当<rp>(</rp><rt>べんとう</rt><rp>)</rp></ruby>を<ruby>持<rp>(</rp><rt>も</rt><rp>)</rp></ruby>ってきてください。', en: 'Please bring a lunch box.' },
      { ja: '本を借りて、家で読みました。', jaHtml: '<ruby>本<rp>(</rp><rt>ほん</rt><rp>)</rp></ruby>を<ruby>借<rp>(</rp><rt>か</rt><rp>)</rp></ruby>りて、<ruby>家<rp>(</rp><rt>いえ</rt><rp>)</rp></ruby>で<ruby>読<rp>(</rp><rt>よ</rt><rp>)</rp></ruby>みました。', en: 'I borrowed a book and read it at home.' },
      { ja: '傘を忘れました。', jaHtml: '<ruby>傘<rp>(</rp><rt>かさ</rt><rp>)</rp></ruby>を<ruby>忘<rp>(</rp><rt>わす</rt><rp>)</rp></ruby>れました。', en: 'I forgot my umbrella.' },
      { ja: '公園で遊んでください。', jaHtml: '<ruby>公園<rp>(</rp><rt>こうえん</rt><rp>)</rp></ruby>で<ruby>遊<rp>(</rp><rt>あそ</rt><rp>)</rp></ruby>んでください。', en: 'Please play in the park.' },
      { ja: '部屋に入ってもいいですか。', jaHtml: '<ruby>部屋<rp>(</rp><rt>へや</rt><rp>)</rp></ruby>に<ruby>入<rp>(</rp><rt>はい</rt><rp>)</rp></ruby>ってもいいですか。', en: 'May I enter the room?' },
    ],
    7: [
      { ja: '彼は東京に住んでいます。', jaHtml: '<ruby>彼<rp>(</rp><rt>かれ</rt><rp>)</rp></ruby>は<ruby>東京<rp>(</rp><rt>とうきょう</rt><rp>)</rp></ruby>に<ruby>住<rp>(</rp><rt>す</rt><rp>)</rp></ruby>んでいます。', en: 'He lives in Tokyo.' },
      { ja: '山田さんは帽子をかぶっています。', jaHtml: '<ruby>山田<rp>(</rp><rt>やまだ</rt><rp>)</rp></ruby>さんは<ruby>帽子<rp>(</rp><rt>ぼうし</rt><rp>)</rp></ruby>をかぶっています。', en: 'Mr. Yamada is wearing a hat.' },
      { ja: '私はメガネをかけています。', jaHtml: '<ruby>私<rp>(</rp><rt>わたし</rt><rp>)</rp></ruby>はメガネをかけています。', en: 'I wear glasses.' },
      { ja: '彼女はシャツを着ています。', jaHtml: '<ruby>彼女<rp>(</rp><rt>かのじょ</rt><rp>)</rp></ruby>はシャツを<ruby>着<rp>(</rp><rt>き</rt><rp>)</rp></ruby>ています。', en: 'She is wearing a shirt.' },
      { ja: '田中さんは会社に勤めています。', jaHtml: '<ruby>田中<rp>(</rp><rt>たなか</rt><rp>)</rp></ruby>さんは<ruby>会社<rp>(</rp><rt>かいしゃ</rt><rp>)</rp></ruby>に<ruby>勤<rp>(</rp><rt>つと</rt><rp>)</rp></ruby>めています。', en: 'Mr. Tanaka works at a company.' },
      { ja: 'あの人を知っていますか。', jaHtml: 'あの<ruby>人<rp>(</rp><rt>ひと</rt><rp>)</rp></ruby>を<ruby>知<rp>(</rp><rt>し</rt><rp>)</rp></ruby>っていますか。', en: 'Do you know that person?' },
      { ja: '友達は来年結婚します。', jaHtml: '<ruby>友達<rp>(</rp><rt>ともだち</rt><rp>)</rp></ruby>は<ruby>来年<rp>(</rp><rt>らいねん</rt><rp>)</rp></ruby><ruby>結婚<rp>(</rp><rt>けっこん</rt><rp>)</rp></ruby>します。', en: 'My friend will get married next year.' },
      { ja: '最近太りました。', jaHtml: '<ruby>最近<rp>(</rp><rt>さいきん</rt><rp>)</rp></ruby><ruby>太<rp>(</rp><rt>ふと</rt><rp>)</rp></ruby>りました。', en: 'I gained weight recently.' },
      { ja: '歌を歌いました。', jaHtml: '<ruby>歌<rp>(</rp><rt>うた</rt><rp>)</rp></ruby>を<ruby>歌<rp>(</rp><rt>うた</rt><rp>)</rp></ruby>いました。', en: 'I sang a song.' },
      { ja: '彼女は痩せています。', jaHtml: '<ruby>彼女<rp>(</rp><rt>かのじょ</rt><rp>)</rp></ruby>は<ruby>痩<rp>(</rp><rt>や</rt><rp>)</rp></ruby>せています。', en: 'She is thin.' },
    ],
    8: [
      { ja: '明日雨が降ると思います。', jaHtml: '<ruby>明日<rp>(</rp><rt>あした</rt><rp>)</rp></ruby><ruby>雨<rp>(</rp><rt>あめ</rt><rp>)</rp></ruby>が<ruby>降<rp>(</rp><rt>ふ</rt><rp>)</rp></ruby>ると<ruby>思<rp>(</rp><rt>おも</rt><rp>)</rp></ruby>います。', en: 'I think it will rain tomorrow.' },
      { ja: '晩ご飯を作らないでください。', jaHtml: '<ruby>晩<rp>(</rp><rt>ばん</rt><rp>)</rp></ruby>ご<ruby>飯<rp>(</rp><rt>はん</rt><rp>)</rp></ruby>を<ruby>作<rp>(</rp><rt>つく</rt><rp>)</rp></ruby>らないでください。', en: "Please don't make dinner." },
      { ja: 'お金が要ります。', jaHtml: 'お<ruby>金<rp>(</rp><rt>かね</rt><rp>)</rp></ruby>が<ruby>要<rp>(</rp><rt>い</rt><rp>)</rp></ruby>ります。', en: 'I need money.' },
      { ja: '今日は遅くなります。', jaHtml: '<ruby>今日<rp>(</rp><rt>きょう</rt><rp>)</rp></ruby>は<ruby>遅<rp>(</rp><rt>おそ</rt><rp>)</rp></ruby>くなります。', en: 'I will be late today.' },
      { ja: '車を運転することができます。', jaHtml: '<ruby>車<rp>(</rp><rt>くるま</rt><rp>)</rp></ruby>を<ruby>運転<rp>(</rp><rt>うんてん</rt><rp>)</rp></ruby>することができます。', en: 'I can drive a car.' },
      { ja: '皿を洗いました。', jaHtml: '<ruby>皿<rp>(</rp><rt>さら</rt><rp>)</rp></ruby>を<ruby>洗<rp>(</rp><rt>あら</rt><rp>)</rp></ruby>いました。', en: 'I washed the dishes.' },
      { ja: '「さようなら」と言いました。', jaHtml: '「さようなら」と<ruby>言<rp>(</rp><rt>い</rt><rp>)</rp></ruby>いました。', en: 'I said "goodbye."' },
      { ja: '部屋を掃除しなければなりません。', jaHtml: '<ruby>部屋<rp>(</rp><rt>へや</rt><rp>)</rp></ruby>を<ruby>掃除<rp>(</rp><rt>そうじ</rt><rp>)</rp></ruby>しなければなりません。', en: 'I have to clean the room.' },
      { ja: '服を洗濯しました。', jaHtml: '<ruby>服<rp>(</rp><rt>ふく</rt><rp>)</rp></ruby>を<ruby>洗濯<rp>(</rp><rt>せんたく</rt><rp>)</rp></ruby>しました。', en: 'I did the laundry.' },
      { ja: '紙を切ってください。', jaHtml: '<ruby>紙<rp>(</rp><rt>かみ</rt><rp>)</rp></ruby>を<ruby>切<rp>(</rp><rt>き</rt><rp>)</rp></ruby>ってください。', en: 'Please cut the paper.' },
      { ja: '料理するのが好きです。', jaHtml: '<ruby>料理<rp>(</rp><rt>りょうり</rt><rp>)</rp></ruby>するのが<ruby>好<rp>(</rp><rt>す</rt><rp>)</rp></ruby>きです。', en: 'I like to cook.' },
      { ja: '宿題を始めましょう。', jaHtml: '<ruby>宿題<rp>(</rp><rt>しゅくだい</rt><rp>)</rp></ruby>を<ruby>始<rp>(</rp><rt>はじ</rt><rp>)</rp></ruby>めましょう。', en: "Let's start the homework." },
    ],
    9: [
      { ja: 'ダンスを踊ったことがあります。', jaHtml: 'ダンスを<ruby>踊<rp>(</rp><rt>おど</rt><rp>)</rp></ruby>ったことがあります。', en: 'I have danced before.' },
      { ja: '授業が終わりました。', jaHtml: '<ruby>授業<rp>(</rp><rt>じゅぎょう</rt><rp>)</rp></ruby>が<ruby>終<rp>(</rp><rt>お</rt><rp>)</rp></ruby>わりました。', en: 'Class has ended.' },
      { ja: 'ピアノを弾いたことがありません。', jaHtml: 'ピアノを<ruby>弾<rp>(</rp><rt>ひ</rt><rp>)</rp></ruby>いたことがありません。', en: 'I have never played piano.' },
      { ja: 'プレゼントをもらいました。', jaHtml: 'プレゼントをもらいました。', en: 'I received a present.' },
      { ja: '漢字を覚えました。', jaHtml: '<ruby>漢字<rp>(</rp><rt>かんじ</rt><rp>)</rp></ruby>を<ruby>覚<rp>(</rp><rt>おぼ</rt><rp>)</rp></ruby>えました。', en: 'I memorized the kanji.' },
      { ja: '映画がまだ始まっていません。', jaHtml: '<ruby>映画<rp>(</rp><rt>えいが</rt><rp>)</rp></ruby>がまだ<ruby>始<rp>(</rp><rt>はじ</rt><rp>)</rp></ruby>まっていません。', en: "The movie hasn't started yet." },
      { ja: '毎朝運動します。', jaHtml: '<ruby>毎朝<rp>(</rp><rt>まいあさ</rt><rp>)</rp></ruby><ruby>運動<rp>(</rp><rt>うんどう</rt><rp>)</rp></ruby>します。', en: 'I exercise every morning.' },
      { ja: '公園で散歩しました。', jaHtml: '<ruby>公園<rp>(</rp><rt>こうえん</rt><rp>)</rp></ruby>で<ruby>散歩<rp>(</rp><rt>さんぽ</rt><rp>)</rp></ruby>しました。', en: 'I took a walk in the park.' },
      { ja: '授業に出なかった。', jaHtml: '<ruby>授業<rp>(</rp><rt>じゅぎょう</rt><rp>)</rp></ruby>に<ruby>出<rp>(</rp><rt>で</rt><rp>)</rp></ruby>なかった。', en: "I didn't attend class." },
      { ja: 'まだ漢字を覚えなかった。', jaHtml: 'まだ<ruby>漢字<rp>(</rp><rt>かんじ</rt><rp>)</rp></ruby>を<ruby>覚<rp>(</rp><rt>おぼ</rt><rp>)</rp></ruby>えなかった。', en: "I still didn't memorize the kanji." },
    ],
    10: [
      { ja: '東京から大阪まで三時間かかります。', jaHtml: '<ruby>東京<rp>(</rp><rt>とうきょう</rt><rp>)</rp></ruby>から<ruby>大阪<rp>(</rp><rt>おおさか</rt><rp>)</rp></ruby>まで<ruby>三<rp>(</rp><rt>さん</rt><rp>)</rp></ruby><ruby>時間<rp>(</rp><rt>じかん</rt><rp>)</rp></ruby>かかります。', en: 'It takes three hours from Tokyo to Osaka.' },
      { ja: 'ホテルに泊まりました。', jaHtml: 'ホテルに<ruby>泊<rp>(</rp><rt>と</rt><rp>)</rp></ruby>まりました。', en: 'I stayed at a hotel.' },
      { ja: '先生になりたいです。', jaHtml: '<ruby>先生<rp>(</rp><rt>せんせい</rt><rp>)</rp></ruby>になりたいです。', en: 'I want to become a teacher.' },
      { ja: 'お金を払いましたか。', jaHtml: 'お<ruby>金<rp>(</rp><rt>かね</rt><rp>)</rp></ruby>を<ruby>払<rp>(</rp><rt>はら</rt><rp>)</rp></ruby>いましたか。', en: 'Did you pay the money?' },
      { ja: 'テニスを練習しました。', jaHtml: 'テニスを<ruby>練習<rp>(</rp><rt>れんしゅう</rt><rp>)</rp></ruby>しました。', en: 'I practiced tennis.' },
      { ja: '予定を決めましょう。', jaHtml: '<ruby>予定<rp>(</rp><rt>よてい</rt><rp>)</rp></ruby>を<ruby>決<rp>(</rp><rt>き</rt><rp>)</rp></ruby>めましょう。', en: "Let's decide the plans." },
      { ja: '飛行機は電車より速いです。', jaHtml: '<ruby>飛行機<rp>(</rp><rt>ひこうき</rt><rp>)</rp></ruby>は<ruby>電車<rp>(</rp><rt>でんしゃ</rt><rp>)</rp></ruby>より<ruby>速<rp>(</rp><rt>はや</rt><rp>)</rp></ruby>いです。', en: 'Airplanes are faster than trains.' },
      { ja: 'このホテルは高くなかったです。', jaHtml: 'このホテルは<ruby>高<rp>(</rp><rt>たか</rt><rp>)</rp></ruby>くなかったです。', en: 'This hotel was not expensive.' },
      { ja: '日本に一週間泊まりました。', jaHtml: '<ruby>日本<rp>(</rp><rt>にっぽん</rt><rp>)</rp></ruby>に<ruby>一<rp>(</rp><rt>いち</rt><rp>)</rp></ruby><ruby>週間<rp>(</rp><rt>しゅうかん</rt><rp>)</rp></ruby><ruby>泊<rp>(</rp><rt>と</rt><rp>)</rp></ruby>まりました。', en: 'I stayed in Japan for one week.' },
      { ja: 'いくらかかりましたか。', jaHtml: 'いくらかかりましたか。', en: 'How much did it cost?' },
    ],
    11: [
      { ja: '日本語を習いたいです。', jaHtml: '<ruby>日本語<rp>(</rp><rt>にほんご</rt><rp>)</rp></ruby>を<ruby>習<rp>(</rp><rt>なら</rt><rp>)</rp></ruby>いたいです。', en: 'I want to learn Japanese.' },
      { ja: '山に登りたくないです。', jaHtml: '<ruby>山<rp>(</rp><rt>やま</rt><rp>)</rp></ruby>に<ruby>登<rp>(</rp><rt>のぼ</rt><rp>)</rp></ruby>りたくないです。', en: "I don't want to climb the mountain." },
      { ja: 'レストランで働いています。', jaHtml: 'レストランで<ruby>働<rp>(</rp><rt>はたら</rt><rp>)</rp></ruby>いています。', en: 'I work at a restaurant.' },
      { ja: '猫を飼っています。', jaHtml: '<ruby>猫<rp>(</rp><rt>ねこ</rt><rp>)</rp></ruby>を<ruby>飼<rp>(</rp><rt>か</rt><rp>)</rp></ruby>っています。', en: 'I own a cat.' },
      { ja: '授業をサボりました。', jaHtml: '<ruby>授業<rp>(</rp><rt>じゅぎょう</rt><rp>)</rp></ruby>をサボりました。', en: 'I skipped class.' },
      { ja: '仕事で疲れました。', jaHtml: '<ruby>仕事<rp>(</rp><rt>しごと</rt><rp>)</rp></ruby>で<ruby>疲<rp>(</rp><rt>つか</rt><rp>)</rp></ruby>れました。', en: 'I got tired from work.' },
      { ja: '仕事をやめたいです。', jaHtml: '<ruby>仕事<rp>(</rp><rt>しごと</rt><rp>)</rp></ruby>をやめたいです。', en: 'I want to quit my job.' },
      { ja: '友達を紹介しました。', jaHtml: '<ruby>友達<rp>(</rp><rt>ともだち</rt><rp>)</rp></ruby>を<ruby>紹介<rp>(</rp><rt>しょうかい</rt><rp>)</rp></ruby>しました。', en: 'I introduced a friend.' },
      { ja: '来月からダイエットします。', jaHtml: '<ruby>来月<rp>(</rp><rt>らいげつ</rt><rp>)</rp></ruby>からダイエットします。', en: 'I will go on a diet from next month.' },
      { ja: '学校に遅刻しました。', jaHtml: '<ruby>学校<rp>(</rp><rt>がっこう</rt><rp>)</rp></ruby>に<ruby>遅刻<rp>(</rp><rt>ちこく</rt><rp>)</rp></ruby>しました。', en: 'I was late for school.' },
      { ja: 'アメリカに留学したいです。', jaHtml: 'アメリカに<ruby>留学<rp>(</rp><rt>りゅうがく</rt><rp>)</rp></ruby>したいです。', en: 'I want to study abroad in America.' },
    ],
    12: [
      { ja: '夏に喉が渇きます。', jaHtml: '<ruby>夏<rp>(</rp><rt>なつ</rt><rp>)</rp></ruby>に<ruby>喉<rp>(</rp><rt>のど</rt><rp>)</rp></ruby>が<ruby>渇<rp>(</rp><rt>かわ</rt><rp>)</rp></ruby>きます。', en: 'I get thirsty in summer.' },
      { ja: '鍵をなくしてしまいました。', jaHtml: '<ruby>鍵<rp>(</rp><rt>かぎ</rt><rp>)</rp></ruby>をなくしてしまいました。', en: 'I lost my keys.' },
      { ja: '彼女と別れました。', jaHtml: '<ruby>彼女<rp>(</rp><rt>かのじょ</rt><rp>)</rp></ruby>と<ruby>別<rp>(</rp><rt>わか</rt><rp>)</rp></ruby>れました。', en: 'I broke up with my girlfriend.' },
      { ja: 'テストの前に緊張します。', jaHtml: 'テストの<ruby>前<rp>(</rp><rt>まえ</rt><rp>)</rp></ruby>に<ruby>緊張<rp>(</rp><rt>きんちょう</rt><rp>)</rp></ruby>します。', en: 'I get nervous before tests.' },
      { ja: '将来を心配しています。', jaHtml: '<ruby>将来<rp>(</rp><rt>しょうらい</rt><rp>)</rp></ruby>を<ruby>心配<rp>(</rp><rt>しんぱい</rt><rp>)</rp></ruby>しています。', en: 'I am worried about the future.' },
      { ja: '今日はとても嬉しいです。', jaHtml: '<ruby>今日<rp>(</rp><rt>きょう</rt><rp>)</rp></ruby>はとても<ruby>嬉<rp>(</rp><rt>うれ</rt><rp>)</rp></ruby>しいです。', en: 'I am very happy today.' },
      { ja: 'あの映画は悲しかったです。', jaHtml: 'あの<ruby>映画<rp>(</rp><rt>えいが</rt><rp>)</rp></ruby>は<ruby>悲<rp>(</rp><rt>かな</rt><rp>)</rp></ruby>しかったです。', en: 'That movie was sad.' },
      { ja: '頭が痛いです。', jaHtml: '<ruby>頭<rp>(</rp><rt>あたま</rt><rp>)</rp></ruby>が<ruby>痛<rp>(</rp><rt>いた</rt><rp>)</rp></ruby>いです。', en: 'I have a headache.' },
      { ja: '昨日鍵をなくしませんでした。', jaHtml: '<ruby>昨日<rp>(</rp><rt>きのう</rt><rp>)</rp></ruby><ruby>鍵<rp>(</rp><rt>かぎ</rt><rp>)</rp></ruby>をなくしませんでした。', en: "I didn't lose my keys yesterday." },
      { ja: '緊張しないでください。', jaHtml: '<ruby>緊張<rp>(</rp><rt>きんちょう</rt><rp>)</rp></ruby>しないでください。', en: "Please don't be nervous." },
    ],
    13: [
      { ja: 'セーターを編むことができます。', jaHtml: 'セーターを<ruby>編<rp>(</rp><rt>あ</rt><rp>)</rp></ruby>むことができます。', en: 'I can knit a sweater.' },
      { ja: 'お金を貸してください。', jaHtml: 'お<ruby>金<rp>(</rp><rt>かね</rt><rp>)</rp></ruby>を<ruby>貸<rp>(</rp><rt>か</rt><rp>)</rp></ruby>してください。', en: 'Please lend me money.' },
      { ja: '試験のために頑張ります。', jaHtml: '<ruby>試験<rp>(</rp><rt>しけん</rt><rp>)</rp></ruby>のために<ruby>頑張<rp>(</rp><rt>がんば</rt><rp>)</rp></ruby>ります。', en: 'I will do my best for the exam.' },
      { ja: '映画を見て泣きました。', jaHtml: '<ruby>映画<rp>(</rp><rt>えいが</rt><rp>)</rp></ruby>を<ruby>見<rp>(</rp><rt>み</rt><rp>)</rp></ruby>て<ruby>泣<rp>(</rp><rt>な</rt><rp>)</rp></ruby>きました。', en: 'I cried watching a movie.' },
      { ja: '歯を磨いてください。', jaHtml: '<ruby>歯<rp>(</rp><rt>は</rt><rp>)</rp></ruby>を<ruby>磨<rp>(</rp><rt>みが</rt><rp>)</rp></ruby>いてください。', en: 'Please brush your teeth.' },
      { ja: '約束を守らなければなりません。', jaHtml: '<ruby>約束<rp>(</rp><rt>やくそく</rt><rp>)</rp></ruby>を<ruby>守<rp>(</rp><rt>まも</rt><rp>)</rp></ruby>らなければなりません。', en: 'You must keep your promise.' },
      { ja: 'この映画に感動しました。', jaHtml: 'この<ruby>映画<rp>(</rp><rt>えいが</rt><rp>)</rp></ruby>に<ruby>感動<rp>(</rp><rt>かんどう</rt><rp>)</rp></ruby>しました。', en: 'I was moved by this movie.' },
      { ja: 'ピアノが弾けます。', jaHtml: 'ピアノが<ruby>弾<rp>(</rp><rt>ひ</rt><rp>)</rp></ruby>けます。', en: 'I can play piano.' },
      { ja: '日本語が話せるようになりました。', jaHtml: '<ruby>日本語<rp>(</rp><rt>にほんご</rt><rp>)</rp></ruby>が<ruby>話<rp>(</rp><rt>はな</rt><rp>)</rp></ruby>せるようになりました。', en: 'I became able to speak Japanese.' },
      { ja: '漢字が読めません。', jaHtml: '<ruby>漢字<rp>(</rp><rt>かんじ</rt><rp>)</rp></ruby>が<ruby>読<rp>(</rp><rt>よ</rt><rp>)</rp></ruby>めません。', en: "I can't read kanji." },
    ],
    14: [
      { ja: '友達に荷物を送りました。', jaHtml: '<ruby>友達<rp>(</rp><rt>ともだち</rt><rp>)</rp></ruby>に<ruby>荷物<rp>(</rp><rt>にもつ</rt><rp>)</rp></ruby>を<ruby>送<rp>(</rp><rt>おく</rt><rp>)</rp></ruby>りました。', en: 'I sent a package to a friend.' },
      { ja: 'この服は私に似合いますか。', jaHtml: 'この<ruby>服<rp>(</rp><rt>ふく</rt><rp>)</rp></ruby>は<ruby>私<rp>(</rp><rt>わたし</rt><rp>)</rp></ruby>に<ruby>似合<rp>(</rp><rt>にあ</rt><rp>)</rp></ruby>いますか。', en: 'Does this outfit suit me?' },
      { ja: '夢を諦めないでください。', jaHtml: '<ruby>夢<rp>(</rp><rt>ゆめ</rt><rp>)</rp></ruby>を<ruby>諦<rp>(</rp><rt>あきら</rt><rp>)</rp></ruby>めないでください。', en: "Please don't give up on your dream." },
      { ja: '彼女にプレゼントをあげました。', jaHtml: '<ruby>彼女<rp>(</rp><rt>かのじょ</rt><rp>)</rp></ruby>にプレゼントをあげました。', en: 'I gave a present to my girlfriend.' },
      { ja: '友達が本をくれました。', jaHtml: '<ruby>友達<rp>(</rp><rt>ともだち</rt><rp>)</rp></ruby>が<ruby>本<rp>(</rp><rt>ほん</rt><rp>)</rp></ruby>をくれました。', en: 'A friend gave me a book.' },
      { ja: '日本語ができるようになりました。', jaHtml: '<ruby>日本語<rp>(</rp><rt>にほんご</rt><rp>)</rp></ruby>ができるようになりました。', en: 'I became able to do Japanese.' },
      { ja: '先生に相談しました。', jaHtml: '<ruby>先生<rp>(</rp><rt>せんせい</rt><rp>)</rp></ruby>に<ruby>相談<rp>(</rp><rt>そうだん</rt><rp>)</rp></ruby>しました。', en: 'I consulted the teacher.' },
      { ja: '母にセーターを編んであげました。', jaHtml: '<ruby>母<rp>(</rp><rt>はは</rt><rp>)</rp></ruby>にセーターを<ruby>編<rp>(</rp><rt>あ</rt><rp>)</rp></ruby>んであげました。', en: 'I knitted a sweater for my mother.' },
      { ja: '兄がカメラを貸してくれました。', jaHtml: '<ruby>兄<rp>(</rp><rt>あに</rt><rp>)</rp></ruby>がカメラを<ruby>貸<rp>(</rp><rt>か</rt><rp>)</rp></ruby>してくれました。', en: 'My older brother lent me a camera.' },
      { ja: '友達にお金をあげたくないです。', jaHtml: '<ruby>友達<rp>(</rp><rt>ともだち</rt><rp>)</rp></ruby>にお<ruby>金<rp>(</rp><rt>かね</rt><rp>)</rp></ruby>をあげたくないです。', en: "I don't want to give money to a friend." },
    ],
    15: [
      { ja: '車を売りました。', jaHtml: '<ruby>車<rp>(</rp><rt>くるま</rt><rp>)</rp></ruby>を<ruby>売<rp>(</rp><rt>う</rt><rp>)</rp></ruby>りました。', en: 'I sold the car.' },
      { ja: '銀行でお金を下ろしました。', jaHtml: '<ruby>銀行<rp>(</rp><rt>ぎんこう</rt><rp>)</rp></ruby>でお<ruby>金<rp>(</rp><rt>かね</rt><rp>)</rp></ruby>を<ruby>下<rp>(</rp><rt>お</rt><rp>)</rp></ruby>ろしました。', en: 'I withdrew money at the bank.' },
      { ja: '絵を描くのが好きです。', jaHtml: '<ruby>絵<rp>(</rp><rt>え</rt><rp>)</rp></ruby>を<ruby>描<rp>(</rp><rt>えが</rt><rp>)</rp></ruby>くのが<ruby>好<rp>(</rp><rt>す</rt><rp>)</rp></ruby>きです。', en: 'I like drawing pictures.' },
      { ja: '仕事を探しています。', jaHtml: '<ruby>仕事<rp>(</rp><rt>しごと</rt><rp>)</rp></ruby>を<ruby>探<rp>(</rp><rt>さが</rt><rp>)</rp></ruby>しています。', en: 'I am looking for a job.' },
      { ja: '友達を映画に誘いました。', jaHtml: '<ruby>友達<rp>(</rp><rt>ともだち</rt><rp>)</rp></ruby>を<ruby>映画<rp>(</rp><rt>えいが</rt><rp>)</rp></ruby>に<ruby>誘<rp>(</rp><rt>さそ</rt><rp>)</rp></ruby>いました。', en: 'I invited a friend to a movie.' },
      { ja: '電話でしゃべりました。', jaHtml: '<ruby>電話<rp>(</rp><rt>でんわ</rt><rp>)</rp></ruby>でしゃべりました。', en: 'I chatted on the phone.' },
      { ja: '駅に着いたら電話してください。', jaHtml: '<ruby>駅<rp>(</rp><rt>えき</rt><rp>)</rp></ruby>に<ruby>着<rp>(</rp><rt>つ</rt><rp>)</rp></ruby>いたら<ruby>電話<rp>(</rp><rt>でんわ</rt><rp>)</rp></ruby>してください。', en: 'When you arrive at the station, please call.' },
      { ja: '車に気をつけてください。', jaHtml: '<ruby>車<rp>(</rp><rt>くるま</rt><rp>)</rp></ruby>に<ruby>気<rp>(</rp><rt>き</rt><rp>)</rp></ruby>をつけてください。', en: 'Please be careful of cars.' },
      { ja: '京都を観光しましょう。', jaHtml: '<ruby>京都<rp>(</rp><rt>きょうと</rt><rp>)</rp></ruby>を<ruby>観光<rp>(</rp><rt>かんこう</rt><rp>)</rp></ruby>しましょう。', en: "Let's sightsee in Kyoto." },
      { ja: '大学を卒業しました。', jaHtml: '<ruby>大学<rp>(</rp><rt>だいがく</rt><rp>)</rp></ruby>を<ruby>卒業<rp>(</rp><rt>そつぎょう</rt><rp>)</rp></ruby>しました。', en: 'I graduated from university.' },
      { ja: 'レストランを予約しました。', jaHtml: 'レストランを<ruby>予約<rp>(</rp><rt>よやく</rt><rp>)</rp></ruby>しました。', en: 'I reserved a restaurant.' },
      { ja: '窓から山が見えます。', jaHtml: '<ruby>窓<rp>(</rp><rt>まど</rt><rp>)</rp></ruby>から<ruby>山<rp>(</rp><rt>やま</rt><rp>)</rp></ruby>が<ruby>見<rp>(</rp><rt>み</rt><rp>)</rp></ruby>えます。', en: 'I can see the mountain from the window.' },
    ],
    16: [
      { ja: '弟を起こしてください。', jaHtml: '<ruby>弟<rp>(</rp><rt>おとうと</rt><rp>)</rp></ruby>を<ruby>起<rp>(</rp><rt>お</rt><rp>)</rp></ruby>こしてください。', en: 'Please wake up my younger brother.' },
      { ja: '友達に昼ご飯をおごりました。', jaHtml: '<ruby>友達<rp>(</rp><rt>ともだち</rt><rp>)</rp></ruby>に<ruby>昼<rp>(</rp><rt>ひる</rt><rp>)</rp></ruby>ご<ruby>飯<rp>(</rp><rt>はん</rt><rp>)</rp></ruby>をおごりました。', en: 'I treated my friend to lunch.' },
      { ja: '最近落ち込んでいます。', jaHtml: '<ruby>最近<rp>(</rp><rt>さいきん</rt><rp>)</rp></ruby><ruby>落<rp>(</rp><rt>お</rt><rp>)</rp></ruby>ち<ruby>込<rp>(</rp><rt>こ</rt><rp>)</rp></ruby>んでいます。', en: 'I have been feeling depressed recently.' },
      { ja: 'お金に困っています。', jaHtml: 'お<ruby>金<rp>(</rp><rt>かね</rt><rp>)</rp></ruby>に<ruby>困<rp>(</rp><rt>こま</rt><rp>)</rp></ruby>っています。', en: 'I am in trouble about money.' },
      { ja: '宿題を出してください。', jaHtml: '<ruby>宿題<rp>(</rp><rt>しゅくだい</rt><rp>)</rp></ruby>を<ruby>出<rp>(</rp><rt>だ</rt><rp>)</rp></ruby>してください。', en: 'Please submit your homework.' },
      { ja: 'パソコンを直しました。', jaHtml: 'パソコンを<ruby>直<rp>(</rp><rt>なお</rt><rp>)</rp></ruby>しました。', en: 'I fixed the computer.' },
      { ja: '鍵が見つかりました。', jaHtml: '<ruby>鍵<rp>(</rp><rt>かぎ</rt><rp>)</rp></ruby>が<ruby>見<rp>(</rp><rt>み</rt><rp>)</rp></ruby>つかりました。', en: 'The keys were found.' },
      { ja: 'この文を英語に訳してください。', jaHtml: 'この<ruby>文<rp>(</rp><rt>ぶん</rt><rp>)</rp></ruby>を<ruby>英語<rp>(</rp><rt>えいご</rt><rp>)</rp></ruby>に<ruby>訳<rp>(</rp><rt>やく</rt><rp>)</rp></ruby>してください。', en: 'Please translate this sentence into English.' },
      { ja: '冗談を聞いて笑いました。', jaHtml: '<ruby>冗談<rp>(</rp><rt>じょうだん</rt><rp>)</rp></ruby>を<ruby>聞<rp>(</rp><rt>き</rt><rp>)</rp></ruby>いて<ruby>笑<rp>(</rp><rt>わら</rt><rp>)</rp></ruby>いました。', en: 'I laughed after hearing a joke.' },
      { ja: '電車に乗り遅れてしまいました。', jaHtml: '<ruby>電車<rp>(</rp><rt>でんしゃ</rt><rp>)</rp></ruby>に<ruby>乗<rp>(</rp><rt>の</rt><rp>)</rp></ruby>り<ruby>遅<rp>(</rp><rt>おく</rt><rp>)</rp></ruby>れてしまいました。', en: 'I missed the train.' },
      { ja: '写真を見せてください。', jaHtml: '<ruby>写真<rp>(</rp><rt>しゃしん</rt><rp>)</rp></ruby>を<ruby>見<rp>(</rp><rt>み</rt><rp>)</rp></ruby>せてください。', en: 'Please show me the photo.' },
      { ja: '日曜日に朝寝坊しました。', jaHtml: '<ruby>日曜日<rp>(</rp><rt>にちようび</rt><rp>)</rp></ruby>に<ruby>朝寝坊<rp>(</rp><rt>あさねぼう</rt><rp>)</rp></ruby>しました。', en: 'I overslept on Sunday.' },
    ],
    17: [
      { ja: 'プレゼントを選んでいます。', jaHtml: 'プレゼントを<ruby>選<rp>(</rp><rt>えら</rt><rp>)</rp></ruby>んでいます。', en: 'I am choosing a present.' },
      { ja: '電車が込んでいます。', jaHtml: '<ruby>電車<rp>(</rp><rt>でんしゃ</rt><rp>)</rp></ruby>が<ruby>込<rp>(</rp><rt>こ</rt><rp>)</rp></ruby>んでいます。', en: 'The train is crowded.' },
      { ja: '靴を脱いでください。', jaHtml: '<ruby>靴<rp>(</rp><rt>くつ</rt><rp>)</rp></ruby>を<ruby>脱<rp>(</rp><rt>ぬ</rt><rp>)</rp></ruby>いでください。', en: 'Please take off your shoes.' },
      { ja: '東京で生まれました。', jaHtml: '<ruby>東京<rp>(</rp><rt>とうきょう</rt><rp>)</rp></ruby>で<ruby>生<rp>(</rp><rt>う</rt><rp>)</rp></ruby>まれました。', en: 'I was born in Tokyo.' },
      { ja: 'お金が足りません。', jaHtml: 'お<ruby>金<rp>(</rp><rt>かね</rt><rp>)</rp></ruby>が<ruby>足<rp>(</rp><rt>た</rt><rp>)</rp></ruby>りません。', en: "There isn't enough money." },
      { ja: '日本の生活に慣れました。', jaHtml: '<ruby>日本<rp>(</rp><rt>にっぽん</rt><rp>)</rp></ruby>の<ruby>生活<rp>(</rp><rt>せいかつ</rt><rp>)</rp></ruby>に<ruby>慣<rp>(</rp><rt>な</rt><rp>)</rp></ruby>れました。', en: 'I got used to life in Japan.' },
      { ja: '毎朝化粧します。', jaHtml: '<ruby>毎朝<rp>(</rp><rt>まいあさ</rt><rp>)</rp></ruby><ruby>化粧<rp>(</rp><rt>けしょう</rt><rp>)</rp></ruby>します。', en: 'I put on makeup every morning.' },
      { ja: '来年就職したいです。', jaHtml: '<ruby>来年<rp>(</rp><rt>らいねん</rt><rp>)</rp></ruby><ruby>就職<rp>(</rp><rt>しゅうしょく</rt><rp>)</rp></ruby>したいです。', en: 'I want to get a job next year.' },
      { ja: 'もっと勉強すればよかったです。', jaHtml: 'もっと<ruby>勉強<rp>(</rp><rt>べんきょう</rt><rp>)</rp></ruby>すればよかったです。', en: 'I wish I had studied more.' },
      { ja: '早く寝れば元気になります。', jaHtml: '<ruby>早<rp>(</rp><rt>はや</rt><rp>)</rp></ruby>く<ruby>寝<rp>(</rp><rt>ね</rt><rp>)</rp></ruby>れば<ruby>元気<rp>(</rp><rt>げんき</rt><rp>)</rp></ruby>になります。', en: "If you go to bed early, you'll feel better." },
    ],
    18: [
      { ja: 'ドアが開きました。', jaHtml: 'ドアが<ruby>開<rp>(</rp><rt>ひら</rt><rp>)</rp></ruby>きました。', en: 'The door opened.' },
      { ja: '先生に謝りました。', jaHtml: '<ruby>先生<rp>(</rp><rt>せんせい</rt><rp>)</rp></ruby>に<ruby>謝<rp>(</rp><rt>あやま</rt><rp>)</rp></ruby>りました。', en: 'I apologized to the teacher.' },
      { ja: 'ボタンを押してください。', jaHtml: 'ボタンを<ruby>押<rp>(</rp><rt>お</rt><rp>)</rp></ruby>してください。', en: 'Please press the button.' },
      { ja: '財布を落としてしまいました。', jaHtml: '<ruby>財布<rp>(</rp><rt>さいふ</rt><rp>)</rp></ruby>を<ruby>落<rp>(</rp><rt>お</rt><rp>)</rp></ruby>としてしまいました。', en: 'I dropped my wallet.' },
      { ja: '道で転びました。', jaHtml: '<ruby>道<rp>(</rp><rt>みち</rt><rp>)</rp></ruby>で<ruby>転<rp>(</rp><rt>ころ</rt><rp>)</rp></ruby>びました。', en: 'I fell on the road.' },
      { ja: 'おもちゃを壊さないでください。', jaHtml: 'おもちゃを<ruby>壊<rp>(</rp><rt>こわ</rt><rp>)</rp></ruby>さないでください。', en: "Please don't break the toy." },
      { ja: '桜が咲いています。', jaHtml: '<ruby>桜<rp>(</rp><rt>さくら</rt><rp>)</rp></ruby>が<ruby>咲<rp>(</rp><rt>さ</rt><rp>)</rp></ruby>いています。', en: 'The cherry blossoms are blooming.' },
      { ja: '店が閉まりました。', jaHtml: '<ruby>店<rp>(</rp><rt>みせ</rt><rp>)</rp></ruby>が<ruby>閉<rp>(</rp><rt>し</rt><rp>)</rp></ruby>まりました。', en: 'The shop closed.' },
      { ja: 'パソコンが壊れてしまいました。', jaHtml: 'パソコンが<ruby>壊<rp>(</rp><rt>こわ</rt><rp>)</rp></ruby>れてしまいました。', en: 'The computer broke.' },
      { ja: '部屋を片付けてください。', jaHtml: '<ruby>部屋<rp>(</rp><rt>へや</rt><rp>)</rp></ruby>を<ruby>片付<rp>(</rp><rt>かたづ</rt><rp>)</rp></ruby>けてください。', en: 'Please tidy up the room.' },
      { ja: '将来のことを考えています。', jaHtml: '<ruby>将来<rp>(</rp><rt>しょうらい</rt><rp>)</rp></ruby>のことを<ruby>考<rp>(</rp><rt>かんが</rt><rp>)</rp></ruby>えています。', en: 'I am thinking about the future.' },
      { ja: 'ピザを注文しましょう。', jaHtml: 'ピザを<ruby>注文<rp>(</rp><rt>ちゅうもん</rt><rp>)</rp></ruby>しましょう。', en: "Let's order pizza." },
    ],
    19: [
      { ja: '先生はもういらっしゃいますか。', jaHtml: '<ruby>先生<rp>(</rp><rt>せんせい</rt><rp>)</rp></ruby>はもういらっしゃいますか。', en: 'Is the teacher here already? (honorific)' },
      { ja: '母が怒りました。', jaHtml: '<ruby>母<rp>(</rp><rt>はは</rt><rp>)</rp></ruby>が<ruby>怒<rp>(</rp><rt>おこ</rt><rp>)</rp></ruby>りました。', en: 'Mom got angry.' },
      { ja: '先生がおっしゃいました。', jaHtml: '<ruby>先生<rp>(</rp><rt>せんせい</rt><rp>)</rp></ruby>がおっしゃいました。', en: 'The teacher said. (honorific)' },
      { ja: '予定が決まりました。', jaHtml: '<ruby>予定<rp>(</rp><rt>よてい</rt><rp>)</rp></ruby>が<ruby>決<rp>(</rp><rt>き</rt><rp>)</rp></ruby>まりました。', en: 'The plans have been decided.' },
      { ja: '先生がお菓子を下さいました。', jaHtml: '<ruby>先生<rp>(</rp><rt>せんせい</rt><rp>)</rp></ruby>がお<ruby>菓子<rp>(</rp><rt>かし</rt><rp>)</rp></ruby>を<ruby>下<rp>(</rp><rt>くだ</rt><rp>)</rp></ruby>さいました。', en: 'The teacher gave us sweets. (honorific)' },
      { ja: '大阪に引っ越しました。', jaHtml: '<ruby>大阪<rp>(</rp><rt>おおさか</rt><rp>)</rp></ruby>に<ruby>引<rp>(</rp><rt>ひ</rt><rp>)</rp></ruby>っ<ruby>越<rp>(</rp><rt>こ</rt><rp>)</rp></ruby>しました。', en: 'I moved to Osaka.' },
      { ja: 'タクシーを呼んでください。', jaHtml: 'タクシーを<ruby>呼<rp>(</rp><rt>よ</rt><rp>)</rp></ruby>んでください。', en: 'Please call a taxi.' },
      { ja: 'コンビニに寄りましょう。', jaHtml: 'コンビニに<ruby>寄<rp>(</rp><rt>よ</rt><rp>)</rp></ruby>りましょう。', en: "Let's stop by the convenience store." },
      { ja: '電車が遅れています。', jaHtml: '<ruby>電車<rp>(</rp><rt>でんしゃ</rt><rp>)</rp></ruby>が<ruby>遅<rp>(</rp><rt>おく</rt><rp>)</rp></ruby>れています。', en: 'The train is delayed.' },
      { ja: 'パーティーに招待されました。', jaHtml: 'パーティーに<ruby>招待<rp>(</rp><rt>しょうたい</rt><rp>)</rp></ruby>されました。', en: 'I was invited to a party.' },
    ],
    20: [
      { ja: '私がお手伝いを致します。', jaHtml: '<ruby>私<rp>(</rp><rt>わたし</rt><rp>)</rp></ruby>がお<ruby>手伝<rp>(</rp><rt>てつだ</rt><rp>)</rp></ruby>いを<ruby>致<rp>(</rp><rt>いた</rt><rp>)</rp></ruby>します。', en: 'I will help you. (humble)' },
      { ja: 'お土産を頂きました。', jaHtml: 'お<ruby>土産<rp>(</rp><rt>みやげ</rt><rp>)</rp></ruby>を<ruby>頂<rp>(</rp><rt>いただ</rt><rp>)</rp></ruby>きました。', en: 'I received a souvenir. (humble)' },
      { ja: '先生のお宅に伺いました。', jaHtml: '<ruby>先生<rp>(</rp><rt>せんせい</rt><rp>)</rp></ruby>のお<ruby>宅<rp>(</rp><rt>たく</rt><rp>)</rp></ruby>に<ruby>伺<rp>(</rp><rt>うかが</rt><rp>)</rp></ruby>いました。', en: "I visited the teacher's home. (humble)" },
      { ja: '私はこちらにおります。', jaHtml: '<ruby>私<rp>(</rp><rt>わたし</rt><rp>)</rp></ruby>はこちらにおります。', en: 'I am here. (humble)' },
      { ja: 'すぐに参ります。', jaHtml: 'すぐに<ruby>参<rp>(</rp><rt>まい</rt><rp>)</rp></ruby>ります。', en: 'I will come right away. (humble)' },
      { ja: '次の角を右に曲がってください。', jaHtml: '<ruby>次<rp>(</rp><rt>つぎ</rt><rp>)</rp></ruby>の<ruby>角<rp>(</rp><rt>かく</rt><rp>)</rp></ruby>を<ruby>右<rp>(</rp><rt>みぎ</rt><rp>)</rp></ruby>に<ruby>曲<rp>(</rp><rt>ま</rt><rp>)</rp></ruby>がってください。', en: 'Please turn right at the next corner.' },
      { ja: '田中と申します。', jaHtml: '<ruby>田中<rp>(</rp><rt>たなか</rt><rp>)</rp></ruby>と<ruby>申<rp>(</rp><rt>もう</rt><rp>)</rp></ruby>します。', en: 'My name is Tanaka. (humble)' },
      { ja: '家に戻りました。', jaHtml: '<ruby>家<rp>(</rp><rt>いえ</rt><rp>)</rp></ruby>に<ruby>戻<rp>(</rp><rt>もど</rt><rp>)</rp></ruby>りました。', en: 'I returned home.' },
      { ja: '音楽が聞こえますか。', jaHtml: '<ruby>音楽<rp>(</rp><rt>おんがく</rt><rp>)</rp></ruby>が<ruby>聞<rp>(</rp><rt>き</rt><rp>)</rp></ruby>こえますか。', en: 'Can you hear the music?' },
      { ja: 'メッセージを伝えてください。', jaHtml: 'メッセージを<ruby>伝<rp>(</rp><rt>つた</rt><rp>)</rp></ruby>えてください。', en: 'Please convey the message.' },
      { ja: '電話番号を交換しましょう。', jaHtml: '<ruby>電話<rp>(</rp><rt>でんわ</rt><rp>)</rp></ruby><ruby>番号<rp>(</rp><rt>ばんごう</rt><rp>)</rp></ruby>を<ruby>交換<rp>(</rp><rt>こうかん</rt><rp>)</rp></ruby>しましょう。', en: "Let's exchange phone numbers." },
    ],
    21: [
      { ja: '財布を盗まれました。', jaHtml: '<ruby>財布<rp>(</rp><rt>さいふ</rt><rp>)</rp></ruby>を<ruby>盗<rp>(</rp><rt>ぬす</rt><rp>)</rp></ruby>まれました。', en: 'My wallet was stolen.' },
      { ja: '先生に褒められました。', jaHtml: '<ruby>先生<rp>(</rp><rt>せんせい</rt><rp>)</rp></ruby>に<ruby>褒<rp>(</rp><rt>ほ</rt><rp>)</rp></ruby>められました。', en: 'I was praised by the teacher.' },
      { ja: '電車で足を踏まれました。', jaHtml: '<ruby>電車<rp>(</rp><rt>でんしゃ</rt><rp>)</rp></ruby>で<ruby>足<rp>(</rp><rt>あし</rt><rp>)</rp></ruby>を<ruby>踏<rp>(</rp><rt>ふ</rt><rp>)</rp></ruby>まれました。', en: 'My foot was stepped on in the train.' },
      { ja: '友達にケーキを焼いてあげました。', jaHtml: '<ruby>友達<rp>(</rp><rt>ともだち</rt><rp>)</rp></ruby>にケーキを<ruby>焼<rp>(</rp><rt>や</rt><rp>)</rp></ruby>いてあげました。', en: 'I baked a cake for my friend.' },
      { ja: 'お金をためています。', jaHtml: 'お<ruby>金<rp>(</rp><rt>かね</rt><rp>)</rp></ruby>をためています。', en: 'I am saving money.' },
      { ja: '勉強を続けてください。', jaHtml: '<ruby>勉強<rp>(</rp><rt>べんきょう</rt><rp>)</rp></ruby>を<ruby>続<rp>(</rp><rt>つづ</rt><rp>)</rp></ruby>けてください。', en: 'Please continue studying.' },
      { ja: '答えを間違えました。', jaHtml: '<ruby>答<rp>(</rp><rt>こた</rt><rp>)</rp></ruby>えを<ruby>間違<rp>(</rp><rt>まちが</rt><rp>)</rp></ruby>えました。', en: 'I made a mistake on the answer.' },
      { ja: '財布を見つけました。', jaHtml: '<ruby>財布<rp>(</rp><rt>さいふ</rt><rp>)</rp></ruby>を<ruby>見<rp>(</rp><rt>み</rt><rp>)</rp></ruby>つけました。', en: 'I found a wallet.' },
      { ja: '友達に連絡しました。', jaHtml: '<ruby>友達<rp>(</rp><rt>ともだち</rt><rp>)</rp></ruby>に<ruby>連絡<rp>(</rp><rt>れんらく</rt><rp>)</rp></ruby>しました。', en: 'I contacted my friend.' },
      { ja: 'ポスターを壁に貼りました。', jaHtml: 'ポスターを<ruby>壁<rp>(</rp><rt>かべ</rt><rp>)</rp></ruby>に<ruby>貼<rp>(</rp><rt>は</rt><rp>)</rp></ruby>りました。', en: 'I put a poster on the wall.' },
      { ja: 'プレゼントを包んでください。', jaHtml: 'プレゼントを<ruby>包<rp>(</rp><rt>つつ</rt><rp>)</rp></ruby>んでください。', en: 'Please wrap the present.' },
    ],
    22: [
      { ja: '試合に勝ちました。', jaHtml: '<ruby>試合<rp>(</rp><rt>しあい</rt><rp>)</rp></ruby>に<ruby>勝<rp>(</rp><rt>か</rt><rp>)</rp></ruby>ちました。', en: 'I won the game.' },
      { ja: '公園で走りました。', jaHtml: '<ruby>公園<rp>(</rp><rt>こうえん</rt><rp>)</rp></ruby>で<ruby>走<rp>(</rp><rt>はし</rt><rp>)</rp></ruby>りました。', en: 'I ran in the park.' },
      { ja: '荷物を運んでください。', jaHtml: '<ruby>荷物<rp>(</rp><rt>にもつ</rt><rp>)</rp></ruby>を<ruby>運<rp>(</rp><rt>はこ</rt><rp>)</rp></ruby>んでください。', en: 'Please carry the luggage.' },
      { ja: 'ゴミを拾いました。', jaHtml: 'ゴミを<ruby>拾<rp>(</rp><rt>ひろ</rt><rp>)</rp></ruby>いました。', en: 'I picked up trash.' },
      { ja: '電車に間に合いました。', jaHtml: '<ruby>電車<rp>(</rp><rt>でんしゃ</rt><rp>)</rp></ruby>に<ruby>間<rp>(</rp><rt>ま</rt><rp>)</rp></ruby>に<ruby>合<rp>(</rp><rt>あ</rt><rp>)</rp></ruby>いました。', en: 'I made it on time for the train.' },
      { ja: '母は私に野菜を食べさせました。', jaHtml: '<ruby>母<rp>(</rp><rt>はは</rt><rp>)</rp></ruby>は<ruby>私<rp>(</rp><rt>わたし</rt><rp>)</rp></ruby>に<ruby>野菜<rp>(</rp><rt>やさい</rt><rp>)</rp></ruby>を<ruby>食<rp>(</rp><rt>た</rt><rp>)</rp></ruby>べさせました。', en: 'Mom made me eat vegetables.' },
      { ja: '先生は学生に作文を書かせました。', jaHtml: '<ruby>先生<rp>(</rp><rt>せんせい</rt><rp>)</rp></ruby>は<ruby>学生<rp>(</rp><rt>がくせい</rt><rp>)</rp></ruby>に<ruby>作文<rp>(</rp><rt>さくぶん</rt><rp>)</rp></ruby>を<ruby>書<rp>(</rp><rt>か</rt><rp>)</rp></ruby>かせました。', en: 'The teacher made the students write an essay.' },
      { ja: '子供を一人で育てています。', jaHtml: '<ruby>子供<rp>(</rp><rt>こども</rt><rp>)</rp></ruby>を<ruby>一<rp>(</rp><rt>いち</rt><rp>)</rp></ruby><ruby>人<rp>(</rp><rt>にん</rt><rp>)</rp></ruby>で<ruby>育<rp>(</rp><rt>そだ</rt><rp>)</rp></ruby>てています。', en: 'I am raising a child by myself.' },
      { ja: '試合に負けてしまいました。', jaHtml: '<ruby>試合<rp>(</rp><rt>しあい</rt><rp>)</rp></ruby>に<ruby>負<rp>(</rp><rt>ま</rt><rp>)</rp></ruby>けてしまいました。', en: 'I lost the game.' },
      { ja: 'この意見に賛成します。', jaHtml: 'この<ruby>意見<rp>(</rp><rt>いけん</rt><rp>)</rp></ruby>に<ruby>賛成<rp>(</rp><rt>さんせい</rt><rp>)</rp></ruby>します。', en: 'I agree with this opinion.' },
      { ja: 'その計画に反対します。', jaHtml: 'その<ruby>計画<rp>(</rp><rt>けいかく</rt><rp>)</rp></ruby>に<ruby>反対<rp>(</rp><rt>はんたい</rt><rp>)</rp></ruby>します。', en: 'I oppose that plan.' },
    ],
    23: [
      { ja: '先生に毎日漢字を書かせられます。', jaHtml: '<ruby>先生<rp>(</rp><rt>せんせい</rt><rp>)</rp></ruby>に<ruby>毎日<rp>(</rp><rt>まいにち</rt><rp>)</rp></ruby><ruby>漢字<rp>(</rp><rt>かんじ</rt><rp>)</rp></ruby>を<ruby>書<rp>(</rp><rt>か</rt><rp>)</rp></ruby>かせられます。', en: 'I am made to write kanji every day by the teacher.' },
      { ja: '親に野菜を食べさせられました。', jaHtml: '<ruby>親<rp>(</rp><rt>おや</rt><rp>)</rp></ruby>に<ruby>野菜<rp>(</rp><rt>やさい</rt><rp>)</rp></ruby>を<ruby>食<rp>(</rp><rt>た</rt><rp>)</rp></ruby>べさせられました。', en: 'I was made to eat vegetables by my parents.' },
      { ja: '試験を受けました。', jaHtml: '<ruby>試験<rp>(</rp><rt>しけん</rt><rp>)</rp></ruby>を<ruby>受<rp>(</rp><rt>う</rt><rp>)</rp></ruby>けました。', en: 'I took an exam.' },
      { ja: '質問に答えてください。', jaHtml: '<ruby>質問<rp>(</rp><rt>しつもん</rt><rp>)</rp></ruby>に<ruby>答<rp>(</rp><rt>こた</rt><rp>)</rp></ruby>えてください。', en: 'Please answer the question.' },
      { ja: '家から離れたくないです。', jaHtml: '<ruby>家<rp>(</rp><rt>いえ</rt><rp>)</rp></ruby>から<ruby>離<rp>(</rp><rt>はな</rt><rp>)</rp></ruby>れたくないです。', en: "I don't want to be away from home." },
      { ja: '痛みを我慢しました。', jaHtml: '<ruby>痛<rp>(</rp><rt>いた</rt><rp>)</rp></ruby>みを<ruby>我慢<rp>(</rp><rt>がまん</rt><rp>)</rp></ruby>しました。', en: 'I endured the pain.' },
      { ja: '大会で優勝しました。', jaHtml: '<ruby>大会<rp>(</rp><rt>たいかい</rt><rp>)</rp></ruby>で<ruby>優勝<rp>(</rp><rt>ゆうしょう</rt><rp>)</rp></ruby>しました。', en: 'I won the championship.' },
      { ja: '毎日運動させられています。', jaHtml: '<ruby>毎日<rp>(</rp><rt>まいにち</rt><rp>)</rp></ruby><ruby>運動<rp>(</rp><rt>うんどう</rt><rp>)</rp></ruby>させられています。', en: 'I am being made to exercise every day.' },
      { ja: '弟に宿題を手伝わせられました。', jaHtml: '<ruby>弟<rp>(</rp><rt>おとうと</rt><rp>)</rp></ruby>に<ruby>宿題<rp>(</rp><rt>しゅくだい</rt><rp>)</rp></ruby>を<ruby>手伝<rp>(</rp><rt>てつだ</rt><rp>)</rp></ruby>わせられました。', en: 'I was made to help my younger brother with homework.' },
      { ja: '部屋を掃除させられました。', jaHtml: '<ruby>部屋<rp>(</rp><rt>へや</rt><rp>)</rp></ruby>を<ruby>掃除<rp>(</rp><rt>そうじ</rt><rp>)</rp></ruby>させられました。', en: 'I was made to clean the room.' },
    ],
  };

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
      const info = CHAPTER_INFO[ch];
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
    renderReference('verb');

    // Mode tabs (Verbs / Adjectives / Build Your Own)
    document.querySelectorAll('.mode-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const mode = tab.dataset.mode;
        $('#verb-chapters').classList.toggle('hidden', mode !== 'verbs');
        $('#adj-chapters').classList.toggle('hidden', mode !== 'adjectives');
        $('#custom-builder').classList.toggle('hidden', mode !== 'custom');
        $('#translate-panel').classList.toggle('hidden', mode !== 'translate');
        if (mode === 'custom') renderCustomPanel();
        if (mode === 'translate') renderTranslateChapters();
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

    $('#btn-ref').addEventListener('click', openReference);
    $('#btn-ref-close').addEventListener('click', closeReference);
    $('#ref-backdrop').addEventListener('click', closeReference);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !$('#ref-overlay').classList.contains('hidden')) {
        closeReference();
      }
    });

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

    $('#btn-settings').addEventListener('click', openSettings);
    $('#btn-close-settings').addEventListener('click', closeSettings);
    $('.settings-overlay-backdrop').addEventListener('click', closeSettings);

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

    $('#setting-show-furigana').addEventListener('change', (e) => {
      settings.showFurigana = e.target.checked;
      saveSettings(settings);
    });

    // Reveal button (default mode)
    $('#btn-reveal').addEventListener('click', showAnswer);
    $('#btn-hint').addEventListener('click', toggleHint);
    $('#btn-hint-typing').addEventListener('click', toggleHint);

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
      if (e.key === 'Escape' && !$('#settings-overlay').classList.contains('hidden')) {
        closeSettings();
        return;
      }
      if (!$('#ref-overlay').classList.contains('hidden')) return;
      if (!screens.study.classList.contains('active')) return;
      if (!$('#settings-overlay').classList.contains('hidden')) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undoLastGrade();
        return;
      }

      if (answered) {
        if (e.key === '1') { e.preventDefault(); gradeAndAdvance(1); return; }
        if (e.key === '2' || e.key === ' ') { e.preventDefault(); gradeAndAdvance(4); return; }
        if (e.key === 'z' || e.key === 'Z') { e.preventDefault(); undoLastGrade(); return; }
        return;
      }

      // Card front is showing
      if (e.key === 'h' || e.key === 'H') { e.preventDefault(); toggleHint(); return; }
      if (settings.typingMode) {
        if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); checkAnswer(); }
      } else {
        if (e.key === ' ') { e.preventDefault(); showAnswer(); return; }
        if (e.key === 'z' || e.key === 'Z') { e.preventDefault(); undoLastGrade(); return; }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
