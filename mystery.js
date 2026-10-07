// ことば探偵クロ (mystery.html): a mystery story told in Japanese. Dialogue
// plays out line by line; at each challenge the player types Japanese (a
// missing word, a whole question, a riddle's answer) or points out the lie in
// a testimony. Each challenge is worth three 🐾 paws — a wrong try or a hint
// costs one — and the chapters unlock one after another.
//
// The story itself lives in mystery-data.js. The answer checker (match /
// matchEnglish) is pure and exported for test_mystery.js.
(function (global) {
  'use strict';

  const KANJI = '㐀-䶿一-鿿々〆ヶ';
  const RUBY_RE = new RegExp('([' + KANJI + ']+)\\[([^\\]]+)\\]', 'g');
  const IGNORED = /[\s　。、．，,.!?！？「」『』（）()〜~・…:：;；'’"“”]/g;
  const PAWS_PER = 3;
  const STORE_KEY = 'tokidoki_mystery';
  const SETTINGS_KEY = 'tokidoki_mystery_settings';

  // ─── Answer checking ────────────────────────────────────────────────────────

  function fold(s) {
    return String(s).normalize('NFKC').toLowerCase()
      .replace(IGNORED, '')
      .replace(/[ァ-ヶ]/g, k => String.fromCharCode(k.charCodeAt(0) - 0x60));
  }

  // Splits furigana markup into pieces: { t } for plain text, { t, r } for a
  // kanji word with its reading.
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

  const plain = markup => pieces(markup).map(p => p.t).join('');
  const reading = markup => pieces(markup).map(p => p.r || p.t).join('');
  const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Each kanji word may be typed as kanji or as its reading.
  const patternCache = new Map();
  function pattern(markup) {
    if (!patternCache.has(markup)) {
      const src = pieces(markup).map(p => (p.r
        ? `(?:${escapeRe(fold(p.t))}|${escapeRe(fold(p.r))})`
        : escapeRe(fold(p.t)))).join('');
      patternCache.set(markup, new RegExp('^' + src + '$'));
    }
    return patternCache.get(markup);
  }

  function match(typed, answers) {
    const f = fold(typed);
    return f !== '' && answers.some(a => pattern(a).test(f));
  }

  // English answers are keywords: "it's a melon pan!" contains "melon pan".
  const foldEn = s => ' ' + String(s).toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9぀-鿿]+/g, ' ').trim() + ' ';
  function matchEnglish(typed, answers) {
    const f = foldEn(typed);
    return f.trim() !== '' && answers.some(a => f.includes(foldEn(a)));
  }

  // How many characters a wrong answer is off by, against its closest answer.
  function distance(typed, answers) {
    const AD = global.AnswerDiff;
    if (!AD) return Infinity;
    let best = Infinity;
    for (const a of answers) {
      for (const form of [reading(a), plain(a)]) {
        const d = AD.diff(fold(typed), fold(form));
        best = Math.min(best, d.typed.filter(c => !c.ok).length + d.expected.filter(c => !c.ok).length);
      }
    }
    return best;
  }

  const api = { fold, pieces, plain, reading, match, matchEnglish, distance };
  global.Mystery = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;

  // ─── Page ───────────────────────────────────────────────────────────────────

  const CAST = global.MYSTERY_CAST;
  const CHAPTERS = global.MYSTERY_CHAPTERS;
  const YOU = { name: 'あなた', en: 'You', face: '🔎', color: '#3a57a6' };
  const CHALLENGES = new Set(['fill', 'ask', 'meaning', 'riddle', 'testimony']);

  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ruby = markup => pieces(markup).map(p => (p.r
    ? `<ruby>${esc(p.t)}<rp>(</rp><rt>${esc(p.r)}</rt><rp>)</rp></ruby>`
    : esc(p.t))).join('');
  const person = who => (who === 'you' ? YOU : CAST[who]);

  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full or blocked */ }
  }

  let progress = load(STORE_KEY, {});
  const settings = Object.assign({ furigana: true, english: false }, load(SETTINGS_KEY, {}));

  const maxPaws = ch => ch.steps.filter(s => CHALLENGES.has(s.type)).length * PAWS_PER;
  const chapterState = ch => progress[ch.id] || { step: 0, paws: 0 };
  const isUnlocked = i => i === 0 || !!(progress[CHAPTERS[i - 1].id] && progress[CHAPTERS[i - 1].id].solved);

  function rank(paws, max) {
    const pct = max ? paws / max : 0;
    if (pct >= 0.9) return { ja: '名探偵[めいたんてい]', en: 'Great Detective' };
    if (pct >= 0.7) return { ja: '探偵[たんてい]', en: 'Detective' };
    if (pct >= 0.4) return { ja: '助手[じょしゅ]', en: 'Assistant' };
    return { ja: '見習[みなら]い', en: 'Apprentice' };
  }

  // Everyone the player has met so far, for the cast list.
  function metCast() {
    const met = new Set();
    CHAPTERS.forEach(ch => {
      const st = progress[ch.id];
      if (!st) return;
      const upto = st.solved ? ch.steps.length : st.step + 1;
      ch.steps.slice(0, upto).forEach(s => { if (CAST[s.who]) met.add(s.who); });
    });
    return met;
  }

  // ─── Case list ──────────────────────────────────────────────────────────────

  function renderCaseList() {
    const list = $('#mys-cases');
    list.innerHTML = CHAPTERS.map((ch, i) => {
      const st = progress[ch.id];
      const open = isUnlocked(i);
      const max = maxPaws(ch);
      let status;
      if (!open) status = '<span class="mys-case-status locked">🔒 Solve the previous case first</span>';
      else if (st && st.solved) status = `<span class="mys-case-status solved">解決 Solved · best 🐾 ${st.best}/${max}</span>`;
      else if (st && st.step > 0) status = `<span class="mys-case-status going">Continue · 🐾 ${st.paws}</span>`;
      else status = '<span class="mys-case-status new">New case</span>';
      return `
        <button class="mys-case${open ? '' : ' locked'}" data-case="${i}" ${open ? '' : 'disabled'}>
          <span class="mys-case-num">第${ch.num}話</span>
          <span class="mys-case-level">${ch.level}</span>
          <span class="mys-case-title" lang="ja">${ruby(ch.title)}</span>
          <span class="mys-case-en">${esc(ch.en)}</span>
          <span class="mys-case-intro">${esc(ch.intro)}</span>
          <span class="mys-case-skills">${esc(ch.skills)}</span>
          ${status}
        </button>`;
    }).join('');

    const met = metCast();
    $('#mys-cast').innerHTML = Object.keys(CAST).map(key => {
      const c = CAST[key];
      if (!met.has(key)) {
        return `<div class="mys-cast-card unknown"><span class="mys-face" style="--who:#8a8a8a">？</span>
          <div><div class="mys-cast-name">？？？</div><div class="mys-cast-bio">Not met yet.</div></div></div>`;
      }
      return `<div class="mys-cast-card"><span class="mys-face" style="--who:${c.color}">${c.face}</span>
        <div><div class="mys-cast-name"><span lang="ja">${esc(c.name)}</span> · ${esc(c.en)} <span class="mys-cast-role">${esc(c.role)}</span></div>
        <div class="mys-cast-bio">${esc(c.bio)}</div></div></div>`;
    }).join('');
  }

  // ─── Playing a chapter ──────────────────────────────────────────────────────

  let ch = null;       // current chapter
  let state = null;    // { step, paws }
  let busy = null;     // the active challenge's bookkeeping

  const log = () => $('#mys-log');
  const dock = () => $('#mys-dock');

  function showPlay(on) {
    $('#screen-chapters').classList.toggle('active', !on);
    $('#screen-mystery').classList.toggle('active', on);
    const back = $('#btn-back');
    if (back) back.classList.toggle('hidden', !on);
    const title = $('#header-title');
    if (title) title.textContent = on ? 'ことば探偵クロ' : 'Tokidoki';
    window.scrollTo(0, 0);
  }

  function openChapter(i) {
    if (!isUnlocked(i)) return;
    ch = CHAPTERS[i];
    const st = chapterState(ch);
    // A solved chapter replays from the start.
    state = st.solved || st.step >= ch.steps.length ? { step: 0, paws: 0 } : { step: st.step, paws: st.paws };
    $('#mys-chapter-title').innerHTML = `第${ch.num}話 <span lang="ja">${ruby(ch.title)}</span>`;
    log().innerHTML = '';
    dock().innerHTML = '';
    renderClueCount();
    showPlay(true);

    // Replay what came before, without waiting on each line.
    for (let s = 0; s < state.step; s++) replayStep(ch.steps[s]);
    if (state.step === 0) addBanner(`第${ch.num}話`, ch.title, ch.en);
    updateProgress();
    run();
  }

  function persist() {
    const prev = progress[ch.id] || {};
    progress[ch.id] = Object.assign({}, prev, { step: state.step, paws: state.paws });
    save(STORE_KEY, progress);
  }

  function updateProgress() {
    const pct = Math.round((state.step / ch.steps.length) * 100);
    $('#mys-bar-fill').style.width = pct + '%';
    $('#mys-paws').textContent = `🐾 ${state.paws}`;
  }

  function next() {
    state.step++;
    persist();
    updateProgress();
    run();
  }

  function run() {
    busy = null;
    if (window.Speech) Speech.stopAll();
    const step = ch.steps[state.step];
    if (!step) { finish(); return; }

    if (step.type === 'say') { addLine(step.who, step.ja, step.en); waitForNext(); return; }
    if (step.type === 'place') { addPlace(step); next(); return; }
    if (step.type === 'clue') { addClue(step); waitForNext('Add to case file'); return; }
    if (step.type === 'testimony') { startTestimony(step); return; }
    startTyping(step);
  }

  // Past steps as they'd look once played.
  function replayStep(step) {
    if (step.type === 'say') addLine(step.who, step.ja, step.en);
    else if (step.type === 'place') addPlace(step);
    else if (step.type === 'clue') addClue(step);
    else if (step.type === 'testimony') addSolvedTestimony(step);
    else addSolved(step);
  }

  function scrollLog() {
    const el = log();
    el.scrollTop = el.scrollHeight;
  }

  function append(html) {
    log().insertAdjacentHTML('beforeend', html);
    scrollLog();
    return log().lastElementChild;
  }

  function lineHtml(who, ja, en, extra) {
    if (who === 'narr') {
      return `<div class="mys-line narr${extra || ''}">
        <div class="mys-text"><div class="mys-ja" lang="ja">${ja}</div>${en ? `<div class="mys-en">${esc(en)}</div>` : ''}</div></div>`;
    }
    const p = person(who);
    return `<div class="mys-line${who === 'you' ? ' you' : ''}${extra || ''}" style="--who:${p.color}">
      <span class="mys-face" aria-hidden="true">${p.face}</span>
      <div class="mys-text"><div class="mys-name"><span lang="ja">${esc(p.name)}</span></div>
      <div class="mys-ja" lang="ja">${ja}</div>${en ? `<div class="mys-en">${esc(en)}</div>` : ''}</div></div>`;
  }

  function addLine(who, ja, en) {
    return append(lineHtml(who, ruby(ja), en));
  }

  function addBanner(kicker, title, en) {
    append(`<div class="mys-banner"><div class="mys-banner-kicker">${esc(kicker)}</div>
      <div class="mys-banner-title" lang="ja">${ruby(title)}</div><div class="mys-banner-en">${esc(en)}</div></div>`);
  }

  function addPlace(step) {
    append(`<div class="mys-place">📍 <span lang="ja">${ruby(step.ja)}</span><span class="mys-place-en">${esc(step.en)}</span></div>`);
  }

  function addClue(step) {
    append(`<div class="mys-clue-get"><span class="mys-clue-icon">📁</span><div>
      <div class="mys-clue-kicker">${ruby('証拠[しょうこ]')} Evidence added</div>
      <div class="mys-clue-name"><span lang="ja">${ruby(step.name)}</span> · ${esc(step.en)}</div>
      <div class="mys-clue-desc" lang="ja">${ruby(step.desc)}</div></div></div>`);
    renderClueCount();
  }

  // Lines with a blank show the answer once it's solved.
  function blankHtml(ja, filled) {
    const [a, b] = ja.split('{_}');
    const mid = filled ? `<span class="mys-filled">${ruby(filled)}</span>` : '<span class="mys-blank">？</span>';
    return ruby(a) + mid + ruby(b || '');
  }

  function addSolved(step) {
    const ans = step.answers[0];
    if (step.type === 'fill') {
      append(lineHtml(step.who, blankHtml(step.ja, ans), step.en, step.accuse ? ' accuse' : ''));
    } else if (step.type === 'ask') {
      append(lineHtml('you', ruby(ans)));
    } else if (step.type === 'riddle') {
      append(riddleHtml(step, ans));
    } else if (step.type === 'meaning') {
      append(`<div class="mys-line you" style="--who:${YOU.color}"><span class="mys-face" aria-hidden="true">${YOU.face}</span>
        <div class="mys-text"><div class="mys-name">${esc(YOU.name)}</div><div class="mys-ja">${esc(busy && busy.typed ? busy.typed : ans)}</div></div></div>`);
    }
  }

  function riddleHtml(step, solved) {
    const p = person(step.who);
    return `<div class="mys-riddle${solved ? ' solved' : ''}">
      <div class="mys-riddle-head"><span class="mys-riddle-title" lang="ja">${esc(step.title)}</span><span class="mys-riddle-from">from ${esc(p.en)}</span></div>
      <div class="mys-riddle-ja" lang="ja">${ruby(step.ja)}</div>
      <div class="mys-riddle-en">${esc(step.en)}</div>
      ${solved ? `<div class="mys-riddle-answer">${ruby('答[こた]え')}: <span lang="ja">${ruby(solved)}</span></div>` : ''}
    </div>`;
  }

  function waitForNext(label) {
    dock().innerHTML = `<button class="btn-primary mys-next" id="mys-next">${esc(label || 'Next')} <span class="mys-key">▸</span></button>`;
    $('#mys-next').addEventListener('click', next);
    $('#mys-next').focus({ preventScroll: true });
  }

  // ─── Typed challenges ───────────────────────────────────────────────────────

  const KIND_LABEL = {
    fill: 'Fill in the blank',
    ask: 'Say it in Japanese',
    meaning: 'Answer in English',
    riddle: 'Solve the riddle',
  };

  function startTyping(step) {
    busy = { step, wrong: 0, hint: false, done: false, typed: '' };
    const english = step.type === 'meaning';

    if (step.type === 'fill') busy.lineEl = append(lineHtml(step.who, blankHtml(step.ja), step.en, ' asking' + (step.accuse ? ' accuse' : '')));
    if (step.type === 'riddle') busy.lineEl = append(riddleHtml(step));

    dock().innerHTML = `
      <div class="mys-challenge${step.accuse ? ' accuse' : ''}">
        <div class="mys-challenge-kind">${step.accuse ? '🔍 Name the culprit' : KIND_LABEL[step.type]}<span class="mys-challenge-paws" id="mys-step-paws"></span></div>
        <div class="mys-challenge-prompt">${esc(step.prompt || '')}</div>
        <div class="answer-area mys-answer">
          <input type="text" id="mys-input" class="answer-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
            lang="${english ? 'en' : 'ja'}" placeholder="${english ? 'Type in English…' : 'Type in Japanese (romaji works)…'}">
          <button class="btn-primary" id="mys-check">Check</button>
        </div>
        <div class="mys-feedback" id="mys-feedback" aria-live="polite"></div>
        <div class="mys-challenge-actions">
          <button class="btn-secondary mys-small" id="mys-hint">💡 Hint (−1 🐾)</button>
          <button class="btn-secondary mys-small hidden" id="mys-giveup">Show answer</button>
        </div>
      </div>`;
    const input = $('#mys-input');
    if (!english) {
      if (window.Romaji) Romaji.attach(input);
      if (window.Speech) Speech.attach(input);
    }
    $('#mys-check').addEventListener('click', check);
    $('#mys-hint').addEventListener('click', showHint);
    $('#mys-giveup').addEventListener('click', giveUp);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); e.stopPropagation(); check(); }
    });
    updateStepPaws();
    input.focus({ preventScroll: true });
  }

  const stepPaws = () => (busy.gaveUp ? 0 : Math.max(0, PAWS_PER - busy.wrong - (busy.hint ? 1 : 0)));

  function updateStepPaws() {
    const el = $('#mys-step-paws');
    if (!el) return;
    const n = stepPaws();
    el.textContent = '🐾'.repeat(n) + '·'.repeat(PAWS_PER - n);
  }

  function check() {
    if (!busy || busy.done) return;
    const step = busy.step;
    const input = $('#mys-input');
    const typed = step.type === 'meaning' ? input.value : (window.Romaji ? Romaji.flush(input) : input.value);
    if (!typed.trim()) { input.focus(); return; }
    const ok = step.type === 'meaning' ? matchEnglish(typed, step.answers) : match(typed, step.answers);
    if (ok) { busy.typed = typed; solve(); return; }

    busy.wrong++;
    updateStepPaws();
    input.classList.remove('incorrect');
    void input.offsetWidth; // restart the shake
    input.classList.add('incorrect');
    const close = step.type !== 'meaning' && distance(typed, step.answers) <= 2;
    const lines = [
      'Not quite. Try again!',
      'Hmm, that isn’t it either.',
      'Still not it — a hint might help.',
    ];
    $('#mys-feedback').innerHTML = `<span class="mys-wrong">${close ? 'So close! Check the spelling.' : lines[Math.min(busy.wrong - 1, lines.length - 1)]}</span>`;
    if (busy.wrong >= 3) $('#mys-giveup').classList.remove('hidden');
    input.select();
  }

  function showHint() {
    if (!busy || busy.done || busy.hint) return;
    busy.hint = true;
    updateStepPaws();
    $('#mys-hint').disabled = true;
    $('#mys-hint').insertAdjacentHTML('afterend', `<div class="mys-hint">💡 ${esc(busy.step.hint)}</div>`);
    $('#mys-input').focus();
  }

  function giveUp() {
    if (!busy || busy.done) return;
    busy.gaveUp = true;
    busy.typed = '';
    solve();
  }

  function solve() {
    const step = busy.step;
    busy.done = true;
    const earned = stepPaws();
    state.paws += earned;
    if (window.Speech) Speech.stopAll();

    if (busy.lineEl) busy.lineEl.remove();
    addSolved(step);

    const ans = step.answers[0];
    const typed = busy.typed;
    let head;
    if (busy.gaveUp) {
      head = `<div class="mys-result reveal">The answer: <span lang="ja">${step.type === 'meaning' ? esc(ans) : ruby(ans)}</span></div>`;
    } else {
      const cheers = ['正解[せいかい]！', 'お見事[みごと]！', 'その通[とお]り！', 'さすが！'];
      head = `<div class="mys-result ok"><span lang="ja">${ruby(cheers[state.step % cheers.length])}</span> +${earned} 🐾</div>`;
    }
    const others = step.type === 'meaning' ? '' : otherForms(step, typed);
    dock().innerHTML = `
      <div class="mys-challenge solved">
        ${head}
        ${others}
        <div class="mys-note"><span class="mys-note-face" aria-hidden="true">${CAST.kuro.face}</span><div>${esc(step.note)}</div></div>
        <button class="btn-primary mys-next" id="mys-next">Continue <span class="mys-key">▸</span></button>
      </div>`;
    $('#mys-next').addEventListener('click', next);
    $('#mys-next').focus({ preventScroll: true });
    updateProgress();
    persist();
  }

  // After an "ask", show the model answer (and a second phrasing) so the
  // player sees the kanji spelling of what they typed in kana.
  function otherForms(step, typed) {
    if (step.type !== 'ask') return '';
    const forms = step.answers.slice(0, 2).map(a => `<div class="mys-model" lang="ja">${ruby(a)}</div>`).join('');
    return `<div class="mys-models"><div class="mys-models-label">${typed ? 'You could write it as' : 'One way to say it'}</div>${forms}</div>`;
  }

  // ─── Testimony ──────────────────────────────────────────────────────────────

  function testimonyHtml(step, picked, solved) {
    const p = person(step.who);
    return `<div class="mys-testimony${solved ? ' solved' : ''}" style="--who:${p.color}">
      <div class="mys-testimony-head"><span class="mys-face" aria-hidden="true">${p.face}</span>
        <div><div class="mys-testimony-title" lang="ja">${ruby(step.title)}</div><div class="mys-testimony-en">${esc(step.titleEn)}</div></div></div>
      <ol class="mys-statements">${step.lines.map((l, i) => `
        <li><button class="mys-statement${i === picked ? ' picked' : ''}${solved && i === step.wrong ? ' broken' : ''}" data-line="${i}" ${solved ? 'disabled' : ''}>
          <span class="mys-ja" lang="ja">${ruby(l.ja)}</span><span class="mys-en">${esc(l.en)}</span></button></li>`).join('')}
      </ol></div>`;
  }

  function addSolvedTestimony(step) {
    append(testimonyHtml(step, -1, true));
  }

  function startTestimony(step) {
    busy = { step, wrong: 0, hint: false, done: false, picked: -1 };
    busy.lineEl = append(testimonyHtml(step, -1, false));
    busy.lineEl.addEventListener('click', e => {
      const btn = e.target.closest('.mys-statement');
      if (!btn || busy.done) return;
      busy.picked = Number(btn.dataset.line);
      busy.lineEl.querySelectorAll('.mys-statement').forEach(b => b.classList.toggle('picked', b === btn));
      $('#mys-object').disabled = false;
    });
    dock().innerHTML = `
      <div class="mys-challenge">
        <div class="mys-challenge-kind">Cross-examination<span class="mys-challenge-paws" id="mys-step-paws"></span></div>
        <div class="mys-challenge-prompt">${esc(step.prompt)} Tap the statement, then object.</div>
        <div class="mys-object-row">
          <button class="btn-primary mys-object" id="mys-object" disabled><span lang="ja">${ruby('異議[いぎ]あり！')}</span> Objection!</button>
        </div>
        <div class="mys-feedback" id="mys-feedback" aria-live="polite"></div>
        <div class="mys-challenge-actions">
          <button class="btn-secondary mys-small" id="mys-hint">💡 Hint (−1 🐾)</button>
          <button class="btn-secondary mys-small" id="mys-file-open">📁 Case file</button>
        </div>
      </div>`;
    $('#mys-object').addEventListener('click', object);
    $('#mys-hint').addEventListener('click', () => {
      if (busy.hint) return;
      busy.hint = true;
      updateStepPaws();
      $('#mys-hint').disabled = true;
      $('#mys-hint').insertAdjacentHTML('afterend', `<div class="mys-hint">💡 ${esc(step.hint)}</div>`);
    });
    $('#mys-file-open').addEventListener('click', openFile);
    updateStepPaws();
  }

  function object() {
    if (!busy || busy.done || busy.picked < 0) return;
    const step = busy.step;
    flash();
    if (busy.picked === step.wrong) {
      busy.done = true;
      const earned = stepPaws();
      state.paws += earned;
      busy.lineEl.remove();
      addSolvedTestimony(step);
      addLine('you', 'ちょっと待[ま]った！', 'Hold it right there!');
      dock().innerHTML = `
        <div class="mys-challenge solved">
          <div class="mys-result ok"><span lang="ja">${ruby('見[み]つけた！')}</span> +${earned} 🐾</div>
          <div class="mys-note"><span class="mys-note-face" aria-hidden="true">${CAST.kuro.face}</span><div>That’s the one that doesn’t hold up. Now prove it…</div></div>
          <button class="btn-primary mys-next" id="mys-next">Continue <span class="mys-key">▸</span></button>
        </div>`;
      $('#mys-next').addEventListener('click', next);
      $('#mys-next').focus({ preventScroll: true });
      updateProgress();
      persist();
      return;
    }
    busy.wrong++;
    updateStepPaws();
    const line = step.lines[busy.picked];
    const [who, ja, en] = line.no || ['kuro', 'うーん…それは、おかしくないですね。', 'Hmm… nothing wrong with that one.'];
    const p = person(who);
    $('#mys-feedback').innerHTML = `<div class="mys-rebuttal" style="--who:${p.color}"><span class="mys-face" aria-hidden="true">${p.face}</span>
      <div><div class="mys-ja" lang="ja">${ruby(ja)}</div><div class="mys-en">${esc(en)}</div></div></div>`;
  }

  function flash() {
    const el = $('#mys-flash');
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
  }

  // ─── Case file ──────────────────────────────────────────────────────────────

  function cluesSoFar() {
    if (!ch) return [];
    return ch.steps.slice(0, state.step + 1).filter(s => s.type === 'clue');
  }

  function renderClueCount() {
    $('#mys-file-count').textContent = cluesSoFar().length;
  }

  function openFile() {
    const clues = cluesSoFar();
    $('#mys-file-list').innerHTML = clues.length
      ? clues.map(c => `<div class="mys-file-item"><div class="mys-clue-name"><span lang="ja">${ruby(c.name)}</span> · ${esc(c.en)}</div>
          <div class="mys-clue-desc" lang="ja">${ruby(c.desc)}</div></div>`).join('')
      : '<p class="mys-file-empty">No evidence yet. Keep your eyes open.</p>';
    $('#mys-file').classList.remove('hidden');
    $('#mys-file-close').focus();
  }

  function closeFile() {
    $('#mys-file').classList.add('hidden');
  }

  // ─── Chapter end ────────────────────────────────────────────────────────────

  function finish() {
    const max = maxPaws(ch);
    const prev = progress[ch.id] || {};
    progress[ch.id] = { step: 0, paws: 0, solved: true, best: Math.max(prev.best || 0, state.paws) };
    save(STORE_KEY, progress);
    const r = rank(state.paws, max);
    const i = CHAPTERS.indexOf(ch);
    const nextCh = CHAPTERS[i + 1];
    append(`<div class="mys-banner end"><div class="mys-banner-kicker" lang="ja">${ruby('事件解決[じけんかいけつ]')}</div>
      <div class="mys-banner-title">Case closed!</div></div>`);
    dock().innerHTML = `
      <div class="mys-challenge solved mys-end">
        <div class="mys-end-paws">🐾 ${state.paws} <span>/ ${max}</span></div>
        <div class="mys-end-rank">Rank: <span lang="ja">${ruby(r.ja)}</span> · ${esc(r.en)}</div>
        <div class="mys-end-actions">
          ${nextCh ? `<button class="btn-primary" id="mys-next-case">Next case: ${esc(nextCh.en)} ▸</button>` : `<div class="mys-end-fin">That’s every case — for now. <span lang="ja">${ruby('お疲[つか]れさまでした！')}</span></div>`}
          <button class="btn-secondary" id="mys-to-list">Back to case files</button>
        </div>
      </div>`;
    if (nextCh) $('#mys-next-case').addEventListener('click', () => openChapter(i + 1));
    $('#mys-to-list').addEventListener('click', closeChapter);
    ($('#mys-next-case') || $('#mys-to-list')).focus({ preventScroll: true });
    $('#mys-bar-fill').style.width = '100%';
  }

  function closeChapter() {
    if (window.Speech) Speech.stopAll();
    ch = null;
    busy = null;
    closeFile();
    renderCaseList();
    showPlay(false);
  }

  // ─── Settings ───────────────────────────────────────────────────────────────

  function applySettings() {
    document.body.classList.toggle('mys-no-furigana', !settings.furigana);
    document.body.classList.toggle('mys-show-en', settings.english);
    $('#mys-toggle-furigana').checked = settings.furigana;
    $('#mys-toggle-english').checked = settings.english;
  }

  // ─── Wiring ─────────────────────────────────────────────────────────────────

  function init() {
    if (!$('#mys-cases') || !CHAPTERS) return;
    renderCaseList();
    applySettings();

    $('#mys-cases').addEventListener('click', e => {
      const card = e.target.closest('.mys-case');
      if (card && !card.disabled) openChapter(Number(card.dataset.case));
    });
    $('#mys-toggle-furigana').addEventListener('change', e => { settings.furigana = e.target.checked; save(SETTINGS_KEY, settings); applySettings(); });
    $('#mys-toggle-english').addEventListener('change', e => { settings.english = e.target.checked; save(SETTINGS_KEY, settings); applySettings(); });
    $('#mys-file-btn').addEventListener('click', openFile);
    $('#mys-file-close').addEventListener('click', closeFile);
    $('#mys-file').addEventListener('click', e => { if (e.target.id === 'mys-file') closeFile(); });
    $('#mys-quit').addEventListener('click', closeChapter);
    $('#mys-reset').addEventListener('click', () => {
      if (!confirm('Reset all case files? Your progress in every chapter will be lost.')) return;
      progress = {};
      save(STORE_KEY, progress);
      renderCaseList();
    });

    // Tap a line to peek at its English.
    log().addEventListener('click', e => {
      const line = e.target.closest('.mys-line, .mys-statement');
      if (line && !e.target.closest('button.mys-statement')) line.classList.toggle('peek');
    });

    // The header's back button (wired by app.js to the setup screen) ends the chapter.
    const back = $('#btn-back');
    if (back) back.addEventListener('click', () => { if (ch) closeChapter(); });

    document.addEventListener('keydown', e => {
      if (!$('#screen-mystery').classList.contains('active')) return;
      if (e.key === 'Escape' && !$('#mys-file').classList.contains('hidden')) {
        e.preventDefault(); e.stopPropagation(); closeFile(); return;
      }
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const nextBtn = $('#mys-next');
      if (nextBtn && (e.key === 'Enter' || e.key === ' ') && document.activeElement !== nextBtn) {
        e.preventDefault(); e.stopPropagation(); nextBtn.click();
      }
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : globalThis);
