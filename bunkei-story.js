// Bunkei in the wild (bunkei-story.html): stories told one sentence at a
// time, and after each sentence a question — what does the sentence pattern
// in it mean? — with four choices. Once answered, the pattern is underlined
// and explained, with the sentence's translation.
//
// The stories are in bunkei-story-data.js; the patterns' names, meanings and
// notes come from the Bunkei drill (bunkei-data.js). The pure parts
// (markup, splitting at the pattern, the choices, scoring) are exported for
// test_bunkei_story.js.
(function (global) {
  'use strict';

  const KANJI = '㐀-䶿一-鿿々〆ヶ';
  const RUBY_RE = new RegExp('([' + KANJI + ']+)\\[([^\\]]+)\\]', 'g');
  const STORE_KEY = 'tokidoki_bunkei_story';
  const SETTINGS_KEY = 'tokidoki_bunkei_story_settings';

  // ─── Markup ────────────────────────────────────────────────────────────────

  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function rubyHtml(markup) {
    let out = '';
    let last = 0;
    String(markup).replace(RUBY_RE, (m, t, r, i) => {
      out += esc(markup.slice(last, i)) + `<ruby>${esc(t)}<rt>${esc(r)}</rt></ruby>`;
      last = i + m.length;
      return m;
    });
    return out + esc(String(markup).slice(last));
  }

  // The sentence read out: kanji swapped for their furigana, spaces dropped.
  const kana = markup => String(markup).replace(RUBY_RE, '$2').replace(/\s+/g, '');

  // A line split around its pattern: [before, pattern, after], or null when
  // `hl` isn't in the sentence.
  function splitAt(line) {
    const at = line.ja.indexOf(line.hl);
    if (!line.hl || at === -1) return null;
    return [line.ja.slice(0, at), line.hl, line.ja.slice(at + line.hl.length)];
  }

  function shuffle(list, rand = Math.random) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  // The four pattern ids to choose from, in a random order.
  const choicesFor = (line, rand) => shuffle([line.b, ...line.wrong], rand);

  const score = (chapter, picks) => chapter.lines.filter((l, i) => picks[i] === l.b).length;

  const api = { rubyHtml, kana, splitAt, choicesFor, score };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.BunkeiStory = api;
  if (typeof document === 'undefined') return;

  // ─── State ─────────────────────────────────────────────────────────────────

  function load(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  }

  const STORIES = (global.BUNKEI_STORY || {}).STORIES || [];
  const CHAPTERS = STORIES.flatMap(st => st.chapters);
  const storyOf = chapter => STORIES.find(st => st.chapters.includes(chapter));
  const PATTERN = (global.Bunkei || {}).PATTERN_BY_ID || {};
  const settings = Object.assign({ furigana: true }, load(SETTINGS_KEY, {}));
  const store = Object.assign({ best: {}, last: {} }, load(STORE_KEY, {}));

  const $ = id => document.getElementById(id);
  // attempt: { chapter, at (the line being asked), choices (per line), picks }
  let attempt = null;
  // The story whose chapters are shown open on the home screen.
  let openStory = null;

  function show(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === screen));
    window.scrollTo(0, 0);
  }

  const meaning = id => (PATTERN[id] ? PATTERN[id].meaning : id);
  const patternName = id => (PATTERN[id] ? PATTERN[id].name : id);

  // ─── Home ──────────────────────────────────────────────────────────────────

  const perfect = c => store.best[c.id] && store.best[c.id].score === store.best[c.id].total;

  function chapterHtml(c, k) {
    const best = store.best[c.id];
    const state = !best ? '' : best.score === best.total ? ' sf-item-perfect' : ' sf-item-done';
    return `<button class="sf-item${state}" data-chapter="${esc(c.id)}">
      <span class="sf-item-level">${esc(c.level)}</span>
      <span class="sf-item-body">
        <span class="sf-item-title" lang="ja"><span class="bs-chapter-num">${k + 1}</span>${rubyHtml(c.title)}</span>
        <span class="sf-item-en">${esc(c.titleEn)} · ${c.lines.length} sentences</span>
      </span>
      <span class="sf-item-score">${best ? `best <b>${best.score}/${best.total}</b>` : 'new'}</span>
    </button>`;
  }

  function renderHome() {
    $('bs-opt-furigana').checked = settings.furigana;
    applySettings();
    // Open the story last played, or else the first one not yet perfect.
    if (!openStory) openStory = (STORIES.find(st => !st.chapters.every(perfect)) || STORIES[0] || {}).id;
    $('bs-list').innerHTML = STORIES.map(st => {
      const done = st.chapters.filter(c => store.best[c.id]).length;
      const lines = st.chapters.reduce((n, c) => n + c.lines.length, 0);
      return `<details class="bs-story-group" data-story="${esc(st.id)}"${st.id === openStory ? ' open' : ''}>
        <summary class="bs-story-head">
          <span class="bs-story-emoji" aria-hidden="true">${st.emoji}</span>
          <span class="bs-story-body">
            <span class="bs-story-title"><span lang="ja">${rubyHtml(st.title)}</span> <span class="bs-story-en">${esc(st.titleEn)}</span></span>
            <span class="bs-story-about">${esc(st.about)}</span>
            <span class="bs-story-meta">${st.chapters.length} chapters · ${lines} sentences · N5–N3${done ? ` · <b>${done}/${st.chapters.length} played</b>` : ''}</span>
          </span>
        </summary>
        <div class="sf-list bs-chapters">${st.chapters.map(chapterHtml).join('')}</div>
      </details>`;
    }).join('');
  }

  function applySettings() {
    document.body.classList.toggle('bs-no-furigana', !settings.furigana);
  }

  function start(id) {
    const chapter = CHAPTERS.find(c => c.id === id);
    if (!chapter) return;
    attempt = { chapter, at: 0, choices: chapter.lines.map(l => choicesFor(l)), picks: chapter.lines.map(() => null) };
    const story = storyOf(chapter);
    openStory = story.id;
    const k = story.chapters.indexOf(chapter);
    $('bs-title').innerHTML = `<span class="sf-item-level">${esc(chapter.level)}</span> <span aria-hidden="true">${story.emoji}</span> <span lang="ja">${k + 1}. ${rubyHtml(chapter.title)}</span>`;
    show('screen-bunkei-story');
    render();
  }

  // ─── Chapter ───────────────────────────────────────────────────────────────

  const answered = i => attempt.picks[i] != null;
  const finished = () => attempt.picks.every(p => p != null);

  // The sentence, with its pattern marked: underlined in green, then in
  // red once answered wrong.
  function sentenceHtml(line) {
    const parts = splitAt(line);
    if (!parts) return rubyHtml(line.ja);
    return `${rubyHtml(parts[0])}<span class="bs-pattern">${rubyHtml(parts[1])}</span>${rubyHtml(parts[2])}`;
  }

  function lineHtml(line, i) {
    const done = answered(i);
    const right = done && attempt.picks[i] === line.b;
    const speak = global.Pronounce ? Pronounce.buttonsHtml(kana(line.ja), 'bs-speak') : '';
    return `<div class="bs-line${done ? ' bs-line-done' : ' bs-line-current'}${done ? (right ? ' bs-line-right' : ' bs-line-wrong') : ''}">
      <span class="bs-line-num">${i + 1}</span>
      <div class="bs-line-body">
        <div class="bs-ja" lang="ja">${sentenceHtml(line)}${speak}</div>
        ${done ? `<div class="bs-en">${esc(line.en)}</div>` : ''}
      </div>
    </div>`;
  }

  function renderStory() {
    const shown = attempt.chapter.lines.slice(0, attempt.at + 1);
    $('bs-story').innerHTML = shown.map(lineHtml).join('');
  }

  function renderQuestion() {
    const i = attempt.at;
    const line = attempt.chapter.lines[i];
    const pick = attempt.picks[i];
    const done = pick != null;
    const choices = attempt.choices[i].map((id, k) => {
      let cls = 'sf-choice bs-choice';
      if (done && id === line.b) cls += ' correct';
      else if (done && id === pick) cls += ' wrong';
      return `<button class="${cls}" data-choice="${esc(id)}" ${done ? 'disabled' : ''}>
        <span class="sf-choice-num" aria-hidden="true">${k + 1}</span>
        <span class="bs-choice-text"><span class="bs-choice-meaning">${esc(meaning(id))}</span>${done ? `<span class="bs-choice-name" lang="ja">${esc(patternName(id))}</span>` : ''}</span>
      </button>`;
    }).join('');
    const p = PATTERN[line.b];
    const verdict = !done ? '' : pick === line.b
      ? '<b class="sf-verdict-right">✓ Correct</b>'
      : `<b class="sf-verdict-wrong">✗ It’s “${esc(meaning(line.b))}”</b>`;
    const last = i === attempt.chapter.lines.length - 1;
    $('bs-question').innerHTML = `<div class="sf-q bs-q${done ? (pick === line.b ? ' sf-q-right' : ' sf-q-wrong') : ''}">
      <div class="sf-q-head"><span class="sf-q-num">${i + 1}</span>${done ? verdict : '<span>What does the sentence pattern in this sentence mean?</span>'}</div>
      <div class="sf-choices">${choices}</div>
      ${done ? `<div class="particle-explanation sf-why bs-why">
        <div class="bs-why-name"><span lang="ja">${esc(patternName(line.b))}</span> — ${esc(meaning(line.b))}</div>
        ${p && p.note ? `<p>${esc(p.note)}</p>` : ''}
        ${line.note ? `<p>${esc(line.note)}</p>` : ''}
      </div>
      <div class="bs-next-area"><button id="btn-bs-next" class="btn-primary">${last ? 'See your score' : 'Next sentence →'}</button></div>` : ''}
    </div>`;
  }

  function renderProgress() {
    const n = attempt.chapter.lines.length;
    const done = attempt.picks.filter(p => p != null).length;
    $('bs-bar-fill').style.width = `${(100 * done) / n}%`;
    $('bs-progress-text').textContent = `${done} / ${n}`;
  }

  function render() {
    renderStory();
    renderProgress();
    const over = finished() && attempt.at >= attempt.chapter.lines.length;
    $('bs-question').classList.toggle('hidden', over);
    $('bs-result').classList.toggle('hidden', !over);
    $('bs-actions').classList.toggle('hidden', !over);
    if (!over) renderQuestion();
    else renderResult();
  }

  function renderResult() {
    const { chapter, picks } = attempt;
    const s = score(chapter, picks);
    const n = chapter.lines.length;
    $('bs-score').textContent = `${s} / ${n}`;
    $('bs-score-msg').textContent = s === n ? 'Perfect! 🎉' : s >= n / 2 ? 'Good work — the patterns you missed are marked in red above.' : 'Read the story again, then try once more.';
    const next = nextChapter();
    $('btn-bs-next-chapter').classList.toggle('hidden', !next);
    if (next) $('btn-bs-next-chapter').textContent = storyOf(next) === storyOf(chapter) ? 'Next chapter →' : `Next story: ${storyOf(next).titleEn} →`;
  }

  function pick(id) {
    if (!attempt || answered(attempt.at)) return;
    attempt.picks[attempt.at] = id;
    if (finished()) saveScore();
    render();
    const next = $('btn-bs-next');
    if (next) next.focus({ preventScroll: true });
    $('bs-question').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function saveScore() {
    const { chapter, picks } = attempt;
    const s = score(chapter, picks);
    const prev = store.best[chapter.id];
    if (!prev || s > prev.score) store.best[chapter.id] = { score: s, total: chapter.lines.length };
    store.last[chapter.id] = { score: s, total: chapter.lines.length };
    save(STORE_KEY, store);
  }

  function next() {
    if (!attempt || !answered(attempt.at)) return;
    attempt.at++;
    // Past the last line, the story is shown whole (at = lines.length).
    render();
    const over = finished() && attempt.at >= attempt.chapter.lines.length;
    (over ? $('bs-result') : $('bs-question')).scrollIntoView({ behavior: 'smooth', block: 'center' });
    // On the score, Space / Enter go on to the next chapter (or try again after the last).
    if (over) overviewButton().focus({ preventScroll: true });
  }

  function overviewButton() {
    return nextChapter() ? $('btn-bs-next-chapter') : $('btn-bs-again');
  }

  // The next chapter of this story, or the first of the next story.
  function nextChapter() {
    const k = CHAPTERS.indexOf(attempt.chapter);
    return CHAPTERS[k + 1] || null;
  }

  function goHome() {
    attempt = null;
    renderHome();
    show('screen-chapters');
  }

  // ─── Events ────────────────────────────────────────────────────────────────

  $('bs-opt-furigana').addEventListener('change', e => { settings.furigana = e.target.checked; save(SETTINGS_KEY, settings); applySettings(); });
  // toggle doesn't bubble, so it's caught on the way down.
  $('bs-list').addEventListener('toggle', e => {
    if (e.target.open) openStory = e.target.dataset.story;
  }, true);
  $('bs-list').addEventListener('click', e => {
    const b = e.target.closest('[data-chapter]');
    if (b) start(b.dataset.chapter);
  });
  $('bs-question').addEventListener('click', e => {
    const b = e.target.closest('[data-choice]');
    if (b && !b.disabled) { pick(b.dataset.choice); return; }
    if (e.target.closest('#btn-bs-next')) next();
  });
  document.addEventListener('keydown', e => {
    if (!attempt || !$('screen-bunkei-story').classList.contains('active')) return;
    if (e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    const i = attempt.at;
    if (i >= attempt.chapter.lines.length) {
      // On the score: Space / Enter anywhere but on a button go on, like the focused button.
      if ((e.key === ' ' || e.key === 'Enter') && e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        overviewButton().click();
      }
      return;
    }
    if (!answered(i) && /^[1-4]$/.test(e.key)) {
      e.preventDefault();
      pick(attempt.choices[i][Number(e.key) - 1]);
    } else if (answered(i) && e.key === 'Enter' && e.target.id !== 'btn-bs-next') {
      e.preventDefault();
      next();
    }
  });
  $('btn-bs-again').addEventListener('click', () => start(attempt.chapter.id));
  $('btn-bs-next-chapter').addEventListener('click', () => { const n = nextChapter(); if (n) start(n.id); });
  $('btn-bs-home').addEventListener('click', goHome);
  $('bs-quit').addEventListener('click', goHome);
  $('btn-bs-reset').addEventListener('click', () => {
    if (!confirm('Reset your chapter scores?')) return;
    store.best = {};
    store.last = {};
    save(STORE_KEY, store);
    renderHome();
  });

  renderHome();
})(typeof window !== 'undefined' ? window : globalThis);
