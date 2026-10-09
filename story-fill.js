// 文章の文法 — JLPT-style passage fill-in (story-fill.html). Read a longer
// text with numbered blanks, pick one of four choices for each blank, then
// check: every blank shows whether you had it right and why the answer fits.
//
// The passages live in story-fill-data.js. The pure parts (markup, splitting
// a paragraph at its blanks, shuffling, scoring) are exported for
// test_story_fill.js.
(function (global) {
  'use strict';

  const KANJI = '㐀-䶿一-鿿々〆ヶ';
  const RUBY_RE = new RegExp('([' + KANJI + ']+)\\[([^\\]]+)\\]', 'g');
  const BLANK_RE = /\{(\d+)\}/g;
  const STORE_KEY = 'tokidoki_story_fill';
  const SETTINGS_KEY = 'tokidoki_story_fill_settings';
  const LEVELS = ['N5', 'N4', 'N3'];

  // ─── Markup ────────────────────────────────────────────────────────────────

  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Spaces are kept: N5 passages are written with spaces between words.
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

  const plain = markup => String(markup).replace(RUBY_RE, '$1');

  // A paragraph as text runs and blanks: [{ text }, { blank: 0 }, …].
  // Blanks are numbered from 1 in the markup and from 0 here.
  function splitBlanks(paragraph) {
    const out = [];
    let last = 0;
    paragraph.replace(BLANK_RE, (m, n, i) => {
      if (i > last) out.push({ text: paragraph.slice(last, i) });
      out.push({ blank: Number(n) - 1 });
      last = i + m.length;
      return m;
    });
    if (last < paragraph.length) out.push({ text: paragraph.slice(last) });
    return out;
  }

  // The blank numbers in a passage, in reading order.
  const blankOrder = passage => passage.paragraphs.flatMap(p => splitBlanks(p).filter(r => 'blank' in r).map(r => r.blank));

  function shuffleOrder(n, rand = Math.random) {
    const idx = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
  }

  // `picks` holds the chosen choice index (into blank.choices) per blank.
  const score = (passage, picks) => passage.blanks.filter((b, i) => picks[i] === b.answer).length;

  const api = { rubyHtml, plain, splitBlanks, blankOrder, shuffleOrder, score, LEVELS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.StoryFill = api;
  if (typeof document === 'undefined') return;

  // ─── State ─────────────────────────────────────────────────────────────────

  function load(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  }

  const PASSAGES = global.STORY_FILL_PASSAGES || [];
  // Each passage split into words, from story-fill-words.js (generated).
  const WORDS = global.STORY_FILL_WORDS || { gloss: {}, passages: {} };
  // Saved words join the Stories flashcard deck, reviewed on stories.html.
  const DECK_KEY = 'tokidoki_story_words';
  const SRS_KEY = 'tokidoki_srs';
  const settings = Object.assign({ level: 'all', furigana: true }, load(SETTINGS_KEY, {}));
  const store = Object.assign({ best: {}, last: {} }, load(STORE_KEY, {}));

  const $ = id => document.getElementById(id);
  // attempt: { passage, order: [shuffled choice indices per blank], picks, checked, focus }
  let attempt = null;
  // The tapped word: { p: paragraph, i: piece index } or null.
  let selected = null;

  const levelOk = p => settings.level === 'all' || p.level === settings.level;
  const visible = () => PASSAGES.filter(levelOk);

  function show(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === screen));
    window.scrollTo(0, 0);
  }

  // ─── Home ──────────────────────────────────────────────────────────────────

  function renderHome() {
    document.querySelectorAll('[data-level]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.level === settings.level)));
    $('sf-opt-furigana').checked = settings.furigana;
    document.body.classList.toggle('sf-no-furigana', !settings.furigana);
    $('sf-list').innerHTML = visible().map(p => {
      const best = store.best[p.id];
      const state = !best ? '' : best.score === best.total ? ' sf-item-perfect' : ' sf-item-done';
      return `<button class="sf-item${state}" data-passage="${esc(p.id)}">
        <span class="sf-item-level">${esc(p.level)}</span>
        <span class="sf-item-body">
          <span class="sf-item-title" lang="ja">${rubyHtml(p.title)}</span>
          <span class="sf-item-en">${esc(p.titleEn)} · ${p.blanks.length} blanks</span>
        </span>
        <span class="sf-item-score">${best ? `best <b>${best.score}/${best.total}</b>` : 'new'}</span>
      </button>`;
    }).join('');
  }

  function start(id) {
    const passage = PASSAGES.find(p => p.id === id);
    if (!passage) return;
    selected = null;
    attempt = {
      passage,
      order: passage.blanks.map(b => shuffleOrder(b.choices.length)),
      picks: passage.blanks.map(() => null),
      checked: false,
    };
    $('sf-title').innerHTML = `<span class="sf-item-level">${esc(passage.level)}</span> <span lang="ja">${rubyHtml(passage.title)}</span>`;
    show('screen-story-fill');
    renderAttempt();
  }

  // ─── Passage ───────────────────────────────────────────────────────────────

  function blankHtml(i) {
    const { passage, picks, checked } = attempt;
    const b = passage.blanks[i];
    const pick = picks[i];
    let cls = 'sf-blank';
    if (checked) cls += pick === b.answer ? ' sf-right' : ' sf-wrong';
    else if (pick != null) cls += ' sf-picked';
    const text = pick != null ? rubyHtml(b.choices[pick]) : '';
    const fix = checked && pick !== b.answer ? `<span class="sf-fix">${rubyHtml(b.choices[b.answer])}</span>` : '';
    return `<a class="${cls}" href="#sf-q-${i}" data-jump="${i}"><span class="sf-blank-num">${i + 1}</span>${text}</a>${fix}`;
  }

  const isBlank = t => typeof t === 'string' && /^\{\d+\}$/.test(t);
  const blankIndex = t => Number(t.slice(1, -1)) - 1;

  function renderText() {
    const pieces = WORDS.passages[attempt.passage.id];
    if (!pieces) {
      $('sf-text').innerHTML = attempt.passage.paragraphs.map(p =>
        '<p>' + splitBlanks(p).map(r => ('blank' in r ? blankHtml(r.blank) : rubyHtml(r.text))).join('') + '</p>').join('');
      return;
    }
    const deck = load(DECK_KEY, {});
    $('sf-text').innerHTML = pieces.map((par, pi) => '<p>' + par.map((t, i) => {
      if (isBlank(t)) return blankHtml(blankIndex(t));
      if (typeof t === 'string') return rubyHtml(t);
      let cls = 'story-word sf-word';
      if (deck[t[1]]) cls += ' saved';
      if (selected && selected.p === pi && selected.i === i) cls += ' selected';
      return `<span class="${cls}" data-p="${pi}" data-i="${i}" role="button" tabindex="0">${rubyHtml(t[0])}</span>`;
    }).join('') + '</p>').join('');
  }

  // ─── Word panel ────────────────────────────────────────────────────────────

  // The sentence around a word, in the Stories token format (words separated
  // by spaces), with the blanks filled in with their answers.
  function sentenceAround(pi, i) {
    const par = WORDS.passages[attempt.passage.id][pi];
    const ends = t => typeof t === 'string' && /[。！？]/.test(t);
    let from = i;
    while (from > 0 && !ends(par[from - 1])) from--;
    let to = i;
    while (to < par.length - 1 && !ends(par[to])) to++;
    return par.slice(from, to + 1).map(t => {
      if (isBlank(t)) { const b = attempt.passage.blanks[blankIndex(t)]; return b.choices[b.answer]; }
      return (typeof t === 'string' ? t : t[0]).replace(/\s+/g, '');
    }).filter(Boolean).join(' ');
  }

  function toggleSaved(key, pi, i) {
    const deck = load(DECK_KEY, {});
    if (deck[key]) {
      delete deck[key];
      const srs = load(SRS_KEY, {});
      delete srs['story_word:' + key];
      save(SRS_KEY, srs);
    } else {
      const [kana, meaning] = WORDS.gloss[key];
      const p = attempt.passage;
      deck[key] = {
        vocab: p.level.toLowerCase(), kana, meaning, added: Date.now(),
        jp: sentenceAround(pi, i), en: p.en[pi] || '', title: `${p.titleEn} (Story Fill-in)`, level: p.level,
      };
    }
    save(DECK_KEY, deck);
  }

  function renderPanel() {
    const panel = $('sf-panel');
    panel.classList.toggle('open', !!selected);
    document.body.classList.toggle('sf-panel-open', !!selected);
    if (!selected) return;
    const [markup, key] = WORDS.passages[attempt.passage.id][selected.p][selected.i];
    const [reading, meaning, pos] = WORDS.gloss[key] || [plain(markup), '', ''];
    const word = key.replace(/\(.*\)$/, '');
    const form = plain(markup);
    const saved = !!load(DECK_KEY, {})[key];
    const speak = kana => (global.Pronounce ? Pronounce.buttonsHtml(kana, 'story-panel-speak') : '');
    $('sf-panel-body').innerHTML = `
      <div class="story-panel-kicker">Word</div>
      <div class="story-panel-word" lang="ja">${esc(word)}</div>
      ${reading !== word ? `<div class="story-panel-reading" lang="ja">${esc(reading)}</div>` : ''}
      ${speak(reading)}
      <div class="story-panel-pos">${esc(pos)}</div>
      <div class="story-panel-meaning">${esc(meaning)}</div>
      ${form !== word ? `<div class="story-panel-form">In the text: <span lang="ja">${esc(form)}</span></div>` : ''}
      <div class="mys-panel-actions">
        <button class="${saved ? 'btn-secondary' : 'btn-primary'} story-panel-add" id="sf-add-word">${saved ? '✓ In flashcards — remove' : '＋ Add to flashcards'}</button>
      </div>
      ${saved ? '<div class="mys-panel-tip">Review your flashcards on the <a href="stories.html#deck">Stories page</a>.</div>' : ''}`;
    $('sf-add-word').addEventListener('click', () => {
      toggleSaved(key, selected.p, selected.i);
      renderText();
      renderPanel();
    });
  }

  function selectWord(pi, i) {
    selected = selected && selected.p === pi && selected.i === i ? null : { p: pi, i };
    renderText();
    renderPanel();
    // With "Speak words on click" on, read out the word's dictionary form.
    const gloss = selected && WORDS.gloss[WORDS.passages[attempt.passage.id][pi][i][1]];
    if (gloss && global.Pronounce) Pronounce.onClick(gloss[0]);
  }

  function closePanel() {
    if (!selected) return;
    selected = null;
    renderText();
    renderPanel();
  }

  function renderQuestions() {
    const { passage, order, picks, checked } = attempt;
    $('sf-questions').innerHTML = blankOrder(passage).map(i => {
      const b = passage.blanks[i];
      const choices = order[i].map((c, k) => {
        let cls = 'sf-choice';
        if (picks[i] === c) cls += ' sf-chosen';
        if (checked && c === b.answer) cls += ' correct';
        else if (checked && picks[i] === c) cls += ' wrong';
        return `<button class="${cls}" data-blank="${i}" data-choice="${c}" aria-pressed="${picks[i] === c}" ${checked ? 'disabled' : ''}>
          <span class="sf-choice-num" aria-hidden="true">${k + 1}</span><span lang="ja">${rubyHtml(b.choices[c])}</span></button>`;
      }).join('');
      const result = !checked ? '' : picks[i] === b.answer
        ? '<b class="sf-verdict-right">✓ Correct</b>'
        : `<b class="sf-verdict-wrong">✗ The answer is <span lang="ja">${rubyHtml(b.choices[b.answer])}</span></b>`;
      return `<div class="sf-q${checked ? (picks[i] === b.answer ? ' sf-q-right' : ' sf-q-wrong') : ''}" id="sf-q-${i}">
        <div class="sf-q-head"><span class="sf-q-num">${i + 1}</span>${result}</div>
        <div class="sf-choices">${choices}</div>
        ${checked ? `<div class="particle-explanation sf-why">${esc(b.why)}</div>` : ''}
      </div>`;
    }).join('');
  }

  function renderAttempt() {
    const { passage, picks, checked } = attempt;
    renderText();
    renderQuestions();
    const answered = picks.filter(p => p != null).length;
    $('sf-answered').textContent = `${answered} / ${passage.blanks.length} answered`;
    $('btn-sf-check').disabled = answered < passage.blanks.length;
    $('sf-check-area').classList.toggle('hidden', checked);
    $('sf-result').classList.toggle('hidden', !checked);
    $('sf-actions').classList.toggle('hidden', !checked);
    $('sf-translation').classList.toggle('hidden', !checked);
    $('sf-translation-body').innerHTML = passage.en.map(t => `<p>${esc(t)}</p>`).join('');
    if (checked) {
      const s = score(passage, picks);
      $('sf-score').textContent = `${s} / ${passage.blanks.length}`;
      $('sf-score-msg').textContent = s === passage.blanks.length ? 'Perfect! 🎉' : s >= passage.blanks.length / 2 ? 'Good work — read the explanations for the ones you missed.' : 'Read the explanations below, then try again.';
      const next = nextPassage();
      $('btn-sf-next').classList.toggle('hidden', !next);
    }
  }

  function pick(i, c) {
    if (!attempt || attempt.checked) return;
    attempt.picks[i] = c;
    renderAttempt();
  }

  function check() {
    const { passage, picks } = attempt;
    if (picks.some(p => p == null)) return;
    attempt.checked = true;
    const s = score(passage, picks);
    const prev = store.best[passage.id];
    if (!prev || s > prev.score) store.best[passage.id] = { score: s, total: passage.blanks.length };
    store.last[passage.id] = { score: s, total: passage.blanks.length };
    save(STORE_KEY, store);
    renderAttempt();
    $('sf-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function nextPassage() {
    const list = visible();
    const k = list.findIndex(p => p.id === attempt.passage.id);
    return list.slice(k + 1).find(p => !store.best[p.id] || store.best[p.id].score < store.best[p.id].total) || list[k + 1] || null;
  }

  function goHome() {
    attempt = null;
    selected = null;
    renderPanel();
    renderHome();
    show('screen-chapters');
  }

  // ─── Events ────────────────────────────────────────────────────────────────

  document.querySelectorAll('[data-level]').forEach(b => b.addEventListener('click', () => {
    settings.level = b.dataset.level;
    save(SETTINGS_KEY, settings);
    renderHome();
  }));
  $('sf-opt-furigana').addEventListener('change', e => {
    settings.furigana = e.target.checked;
    save(SETTINGS_KEY, settings);
    document.body.classList.toggle('sf-no-furigana', !settings.furigana);
  });
  $('sf-list').addEventListener('click', e => {
    const b = e.target.closest('[data-passage]');
    if (b) start(b.dataset.passage);
  });
  $('sf-questions').addEventListener('click', e => {
    const b = e.target.closest('[data-choice]');
    if (b && !b.disabled) pick(Number(b.dataset.blank), Number(b.dataset.choice));
  });
  $('sf-text').addEventListener('click', e => {
    const w = e.target.closest('.sf-word');
    if (w) { selectWord(Number(w.dataset.p), Number(w.dataset.i)); return; }
    const a = e.target.closest('[data-jump]');
    if (!a) return;
    e.preventDefault();
    const q = $('sf-q-' + a.dataset.jump);
    q.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const first = q.querySelector('button:not(:disabled)');
    if (first) first.focus({ preventScroll: true });
  });
  $('sf-text').addEventListener('keydown', e => {
    const w = e.target.closest('.sf-word');
    if (w && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); selectWord(Number(w.dataset.p), Number(w.dataset.i)); }
  });
  $('sf-panel-close').addEventListener('click', closePanel);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });
  $('btn-sf-check').addEventListener('click', check);
  $('btn-sf-again').addEventListener('click', () => start(attempt.passage.id));
  $('btn-sf-next').addEventListener('click', () => { const n = nextPassage(); if (n) start(n.id); });
  $('btn-sf-home').addEventListener('click', goHome);
  $('sf-quit').addEventListener('click', goHome);
  $('btn-sf-reset').addEventListener('click', () => {
    if (!confirm('Reset your passage scores?')) return;
    store.best = {};
    store.last = {};
    save(STORE_KEY, store);
    renderHome();
  });

  renderHome();
})(typeof window !== 'undefined' ? window : globalThis);
