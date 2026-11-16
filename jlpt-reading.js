// JLPT Reading (jlpt-reading.html): the practical texts of the JLPT reading
// section — notices, emails, memos, invitations (内容理解・短文) and flyers,
// price lists and timetables (情報検索) — at N5 to N2, with the exam's own
// kind of question: what must you do, what does the writer most want to
// say, which option fits this person.
//
// The texts are in jlpt-reading-data.js (markup described there). Once a
// question is answered, the part of the text its answer rests on is
// highlighted and the answer explained; once all are answered, the whole
// text's translation and its harder words are shown. Best scores per text
// are kept in tokidoki_jlpt_reading (merged like the other games' stores in
// sync-merge.js).
//
// The pure parts (markup, attempts, scoring) are exported for
// test_jlpt_reading.js.
(function (global) {
  'use strict';

  const STORE_KEY = 'tokidoki_jlpt_reading';
  const SETTINGS_KEY = 'tokidoki_jlpt_reading_settings';
  const LEVELS = ['N5', 'N4', 'N3', 'N2'];

  const TYPES = {
    short: { title: 'Notices, emails & memos', ja: '内容理解（短文）', about: 'Read a short practical text: what must someone do, or what is the writer’s point?' },
    info: { title: 'Information retrieval', ja: '情報検索', about: 'Scan a flyer, price list or timetable for the one option that fits someone’s situation.' },
  };
  const FORMS = {
    notice: 'お知らせ', email: 'メール', memo: 'メモ', message: 'メッセージ', invite: '招待', letter: '手紙', flyer: '案内',
  };

  // ─── Markup ────────────────────────────────────────────────────────────────

  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // "{駅|えき}で" → <ruby>駅<rt>えき</rt></ruby>で; "«1|…»" → the part
  // question 1's answer rests on, highlighted once `shown` has 1.
  function inlineHtml(markup, shown = new Set()) {
    let out = '';
    const re = /«(\d)\||»|\{([^|}]+)\|([^}]+)\}/g;
    let last = 0, m;
    while ((m = re.exec(markup))) {
      out += esc(markup.slice(last, m.index));
      if (m[1]) out += `<mark class="jr-key${shown.has(Number(m[1])) ? ' jr-key-on' : ''}" data-q="${m[1]}">`;
      else if (m[0] === '»') out += '</mark>';
      else out += `<ruby>${esc(m[2])}<rt>${esc(m[3])}</rt></ruby>`;
      last = re.lastIndex;
    }
    return out + esc(markup.slice(last));
  }

  const plain = markup => String(markup).replace(/«\d\||»/g, '').replace(/\{([^|}]+)\|[^}]+\}/g, '$1');

  // Splits at `sep` outside {…} and «…» (both hold a "|" of their own).
  function splitTop(line, sep) {
    const parts = [];
    let depth = 0, cur = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '{' || ch === '«') depth++;
      else if ((ch === '}' || ch === '»') && depth) depth--;
      if (depth === 0 && line.startsWith(sep, i)) { parts.push(cur); cur = ''; i += sep.length - 1; continue; }
      cur += ch;
    }
    parts.push(cur);
    return parts;
  }

  // What a line of a text is: a table row (its cells), an email header
  // (label and value), a heading, a right-aligned line or a paragraph.
  function lineKind(line) {
    const row = /^\|(!?)(\s.*)$/.exec(line);
    if (row) return { kind: row[1] ? 'hrow' : 'row', cells: splitTop(row[2], ' | ').map(c => c.trim()) };
    if (line.startsWith('@')) { const [label, value] = splitTop(line.slice(1), '|'); return { kind: 'head', cells: [label, value || ''] }; }
    if (line.startsWith('# ')) return { kind: 'title', body: line.slice(2) };
    if (line.startsWith('> ')) return { kind: 'right', body: line.slice(2) };
    return { kind: line.trim() ? 'p' : 'empty', body: line };
  }

  // One text's lines → blocks: heading, right-aligned line, email header,
  // table (header row first), or paragraph. `seg(markup, { line, kind })`
  // renders each piece of text: furigana and highlights by default, or
  // tappable words once the questions are answered (wordsHtml).
  function textHtml(passage, shown = new Set(), seg = null) {
    const render = seg || (m => inlineHtml(m, shown));
    const out = [];
    let table = null, head = [];
    const flushTable = () => { if (table) out.push(`<div class="jr-table-wrap"><table class="jr-table">${table.join('')}</table></div>`); table = null; };
    const flushHead = () => { if (head.length) out.push(`<dl class="jr-mail-head">${head.join('')}</dl>`); head = []; };
    passage.text.split('\n').forEach((line, i) => {
      const k = lineKind(line);
      if (k.kind === 'row' || k.kind === 'hrow') {
        flushHead();
        table = table || [];
        const tag = k.kind === 'hrow' ? 'th' : 'td';
        table.push(`<tr>${k.cells.map(c => `<${tag}>${render(c, { line: i, kind: 'cell' })}</${tag}>`).join('')}</tr>`);
        return;
      }
      flushTable();
      if (k.kind === 'head') {
        head.push(`<div><dt>${render(k.cells[0], { line: i, kind: 'cell' })}</dt><dd>${render(k.cells[1], { line: i, kind: 'cell' })}</dd></div>`);
        return;
      }
      flushHead();
      if (k.kind === 'title') out.push(`<p class="jr-title">${render(k.body, { line: i, kind: 'title' })}</p>`);
      else if (k.kind === 'right') out.push(`<p class="jr-right">${render(k.body, { line: i, kind: 'right' })}</p>`);
      else if (k.kind === 'p') out.push(`<p>${render(k.body, { line: i, kind: 'p' })}</p>`);
    });
    flushTable();
    flushHead();
    return out.join('');
  }

  // ─── Sentences and words ───────────────────────────────────────────────────
  //
  // Once a text's questions are answered its words can be tapped, and it can
  // be read sentence by sentence with each one's English and grammar. The
  // words and grammar are in jlpt-reading-words.js, built by
  // scripts/tokenize_jlpt_reading.mjs from the pieces these functions cut
  // the text into, keyed by segKey.

  const stripMarks = markup => String(markup).replace(/«\d\||»/g, '');

  // Markup → sentences, each ending in 。！？ (outside 「」（）『』 and
  // furigana); a closing bracket or space after the full stop stays with it.
  function splitSentences(markup) {
    const out = [];
    let cur = '', depth = 0, brace = false;
    for (const ch of markup) {
      if (cur === '' && out.length && /[」）』\s]/.test(ch) && !depth) { out[out.length - 1] += ch; continue; }
      cur += ch;
      if (ch === '{') brace = true;
      else if (ch === '}') brace = false;
      if (brace) continue;
      if ('「（『'.includes(ch)) depth++;
      else if ('」）』'.includes(ch) && depth) depth--;
      else if ('。！？'.includes(ch) && !depth) { out.push(cur); cur = ''; }
    }
    if (cur) out.push(cur);
    return out;
  }

  // An English line → sentences (not after a.m., Mr. …).
  const enSentences = line => String(line).split(/(?<=[.?!])(?<!(?:a\.m|p\.m|Mr|Mrs|Ms|Dr|No|e\.g|i\.e|etc)\.)\s+(?=[A-Z"“(•①-⑤])/).filter(x => x.trim());

  // A short stable key for a piece of markup (FNV-1a).
  function segKey(markup) {
    let h = 0x811c9dc5;
    for (const ch of stripMarks(markup)) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(36);
  }

  // The text's sentences in order — headings, paragraphs, right-aligned
  // lines; not tables or email headers — each with its English (the text's
  // English line, cut the same way), then the questions.
  function sentences(passage) {
    const en = passage.en.split('\n');
    const out = [];
    passage.text.split('\n').forEach((line, i) => {
      const k = lineKind(line);
      if (!['title', 'right', 'p'].includes(k.kind)) return;
      const ens = enSentences(en[i] || '');
      splitSentences(stripMarks(k.body)).forEach((ja, n, all) => out.push({
        sid: `${i}:${n}`, ja, en: all.length === ens.length ? ens[n] : (n === 0 ? en[i] || '' : ''),
      }));
    });
    passage.questions.forEach((q, k) => out.push({ sid: `q${k}`, ja: q.q, en: q.en, question: true }));
    return out;
  }

  // Everything that gets split into words: the sentences (with grammar),
  // table cells and email headers (words only).
  function segments(passage) {
    const out = sentences(passage).map(s => ({ ja: s.ja, sentence: true }));
    passage.text.split('\n').forEach(line => {
      const k = lineKind(line);
      if (k.cells) k.cells.forEach(c => { if (stripMarks(c).trim()) out.push({ ja: stripMarks(c), sentence: false }); });
    });
    return out;
  }

  // Plain-text ranges of each «n|…» in a piece of markup.
  function markRanges(markup) {
    const out = [], open = [];
    const re = /«(\d)\||»|\{([^|}]+)\|[^}]+\}|[\s\S]/g;
    let at = 0, m;
    while ((m = re.exec(markup))) {
      if (m[1]) open.push({ n: Number(m[1]), from: at });
      else if (m[0] === '»') { const r = open.pop(); if (r) out.push({ ...r, to: at }); }
      else at += m[2] ? m[2].length : m[0].length;
    }
    return out;
  }

  // A piece of markup as tappable words: each sentence (when `split`) in a
  // .jr-sent with its sid, each word a .story-word with its segment key and
  // index. Highlights (answered questions' «n|…») carry over.
  function wordsHtml(markup, { words, shown = new Set(), split = false, line = 0, sid: only = '', deck = {}, sel = null } = {}) {
    const marks = markRanges(markup).filter(r => shown.has(r.n));
    const stripped = stripMarks(markup);
    const parts = split ? splitSentences(stripped) : [stripped];
    let at = 0;
    return parts.map((seg, n) => {
      const key = segKey(seg);
      const entry = words && words.lines[key];
      const pieces = entry ? entry.w : [seg];
      const sid = split ? `${line}:${n}` : only;
      const inner = pieces.map((p, t) => {
        const m = typeof p === 'string' ? p : p[0];
        const len = plain(m).length;
        const on = marks.some(r => r.from < at + len && r.to > at);
        at += len;
        if (typeof p === 'string') return on ? `<span class="jr-key-on">${inlineHtml(m)}</span>` : inlineHtml(m);
        const cls = ['story-word', 'jr-word'];
        if (on) cls.push('jr-key-on');
        if (deck[p[1]]) cls.push('saved');
        if (sel && sel.type === 'word' && sel.k === key && sel.t === t) cls.push('selected');
        return `<span class="${cls.join(' ')}" data-k="${key}" data-t="${t}"${sid ? ` data-sid="${sid}"` : ''} role="button" tabindex="0">${inlineHtml(m)}</span>`;
      }).join('');
      return sid ? `<span class="jr-sent${sel && sel.sid === sid ? ' selected' : ''}" data-sid="${sid}">${inner}</span>` : inner;
    }).join('');
  }

  // The word pieces of a sentence a grammar snippet covers, by index.
  function snippetPieces(pieces, snippet) {
    const text = pieces.map(p => plain(typeof p === 'string' ? p : p[0])).join('');
    const from = text.indexOf(snippet);
    if (from === -1 || !snippet) return [];
    const to = from + snippet.length;
    let at = 0;
    return pieces.map((p, i) => {
      const len = plain(typeof p === 'string' ? p : p[0]).length;
      const hit = at < to && at + len > from && typeof p !== 'string';
      at += len;
      return hit ? i : -1;
    }).filter(i => i !== -1);
  }

  // How long a text is, as the JLPT counts it: every character but spaces
  // and the markup.
  const length = passage => plain(passage.text).replace(/^(\|!?|[#>@])\s?/gm, '').replace(/[\s|]/g, '').length;

  // The text's title for the instructions: its first heading (quotes in it
  // become 『』, as quotes within quotes), or the form.
  function titleOf(passage) {
    const h = passage.text.split('\n').find(l => l.startsWith('# '));
    return h ? h.slice(2).replace(/「/g, '『').replace(/」/g, '』') : FORMS[passage.form];
  }

  // The exam's instructions, worded as on each level's paper.
  function instructions(passage) {
    const { level, type } = passage;
    if (level === 'N5') {
      return type === 'info'
        ? `{下|した}の「${titleOf(passage)}」を {見|み}て、しつもんに こたえて ください。こたえは、1・2・3・4から いちばん いい ものを ひとつ えらんで ください。`
        : 'つぎの ぶんしょうを {読|よ}んで、しつもんに こたえて ください。こたえは、1・2・3・4から いちばん いい ものを ひとつ えらんで ください。';
    }
    if (level === 'N4') {
      return type === 'info'
        ? `{下|した}の「${titleOf(passage)}」を{見|み}て、{質問|しつもん}に{答|こた}えてください。{答|こた}えは、1・2・3・4から{最|もっと}もよいものを{一|ひと}つえらんでください。`
        : 'つぎの{文章|ぶんしょう}を{読|よ}んで、{質問|しつもん}に{答|こた}えてください。{答|こた}えは、1・2・3・4から{最|もっと}もよいものを{一|ひと}つえらんでください。';
    }
    return type === 'info'
      ? `{下|した}は「${titleOf(passage)}」である。これを{読|よ}んで、{質問|しつもん}に{答|こた}えなさい。{答|こた}えは、1・2・3・4から{最|もっと}もよいものを{一|ひと}つ{選|えら}びなさい。`
      : '{次|つぎ}の{文章|ぶんしょう}を{読|よ}んで、{質問|しつもん}に{答|こた}えなさい。{答|こた}えは、1・2・3・4から{最|もっと}もよいものを{一|ひと}つ{選|えら}びなさい。';
  }

  function shuffle(list, rand = Math.random) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  // An attempt at one text: each question's choices shuffled ([indexes into
  // choices]; 0 is the answer), nothing picked yet.
  const makeAttempt = (passage, rand = Math.random) =>
    passage.questions.map(q => ({ order: shuffle(q.choices.map((_, k) => k), rand), pick: null }));

  const score = attempt => attempt.filter(a => a.pick === 0).length;
  const finished = attempt => attempt.every(a => a.pick != null);
  // The questions answered so far, as 1-based numbers (for the highlights).
  const shownKeys = attempt => new Set(attempt.map((a, i) => (a.pick != null ? i + 1 : 0)).filter(Boolean));

  // Where "Next text" goes: the next text of the same level not yet done
  // perfectly (after this one, wrapping round), else simply the next one.
  function nextPassage(list, id, best = {}) {
    const same = list.filter(p => p.level === (list.find(x => x.id === id) || {}).level);
    const at = same.findIndex(p => p.id === id);
    const after = [...same.slice(at + 1), ...same.slice(0, at)];
    const perfect = p => best[p.id] && best[p.id].score === best[p.id].total;
    return after.find(p => !perfect(p)) || after[0] || null;
  }

  const api = { inlineHtml, plain, splitTop, lineKind, textHtml, stripMarks, splitSentences, enSentences, segKey, sentences, segments, markRanges, wordsHtml, snippetPieces, length, instructions, makeAttempt, score, finished, shownKeys, nextPassage, LEVELS, TYPES, FORMS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.JlptReading = api;
  if (typeof document === 'undefined') return;

  // ─── State ─────────────────────────────────────────────────────────────────

  function load(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  }

  const PASSAGES = global.JLPT_READING || [];
  const settings = Object.assign({ furigana: true, english: false, level: 'N5' }, load(SETTINGS_KEY, {}));
  if (!LEVELS.includes(settings.level)) settings.level = 'N5';
  const store = Object.assign({ best: {}, last: {} }, load(STORE_KEY, {}));
  const $ = id => document.getElementById(id);

  // current: { passage, attempt, saved }
  let current = null;

  function show(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === screen));
    window.scrollTo(0, 0);
  }

  function applySettings() {
    document.body.classList.toggle('jr-no-furigana', !settings.furigana);
    $('jr-opt-furigana').checked = settings.furigana;
    $('jr-opt-furigana-q').checked = settings.furigana;
  }

  // ─── Home ──────────────────────────────────────────────────────────────────

  function itemHtml(p) {
    const best = store.best[p.id];
    const state = !best ? '' : best.score === best.total ? ' sf-item-perfect' : ' sf-item-done';
    const n = p.questions.length;
    return `<button class="sf-item${state}" data-passage="${esc(p.id)}">
      <span class="sf-item-level">${esc(p.level)}</span>
      <span class="sf-item-body">
        <span class="sf-item-title"><span class="jr-form" lang="ja">${esc(FORMS[p.form])}</span> ${esc(p.title)}</span>
        <span class="sf-item-en">${n} question${n === 1 ? '' : 's'} · about ${Math.round(length(p) / 10) * 10} characters</span>
      </span>
      <span class="sf-item-score">${best ? `best <b>${best.score}/${best.total}</b>` : 'new'}</span>
    </button>`;
  }

  function renderHome() {
    applySettings();
    document.querySelectorAll('#jr-levels [data-level]').forEach(b => {
      const on = b.dataset.level === settings.level;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    for (const type of Object.keys(TYPES)) {
      const list = PASSAGES.filter(p => p.level === settings.level && p.type === type);
      $(`jr-list-${type}`).innerHTML = list.map(itemHtml).join('') || '<p class="tab-intro">None at this level yet.</p>';
    }
    const done = PASSAGES.filter(p => p.level === settings.level && store.best[p.id]).length;
    const all = PASSAGES.filter(p => p.level === settings.level).length;
    $('jr-level-progress').textContent = `${done} of ${all} ${settings.level} texts done`;
  }

  // ─── A text ────────────────────────────────────────────────────────────────

  function open(id) {
    const passage = PASSAGES.find(p => p.id === id);
    if (!passage) return;
    // view: the text as printed, or 'sentences'; sel: the word or sentence
    // in the panel; grammar: the grammar point lit up in the text.
    current = { passage, attempt: makeAttempt(passage), saved: false, view: 'text', sel: null, grammar: null };
    if (settings.level !== passage.level) { settings.level = passage.level; save(SETTINGS_KEY, settings); }
    try { history.replaceState(null, '', `#${id}`); } catch { /* file:// or sandboxed */ }
    $('jr-title').innerHTML = `<span class="sf-item-level">${esc(passage.level)}</span> ${esc(passage.title)} <span lang="ja" class="vq-title-ja">${esc(TYPES[passage.type].ja)}</span>`;
    show('screen-jlpt-reading');
    render();
  }

  function questionHtml(passage, q, a, i) {
    const answered = a.pick != null;
    const choices = a.order.map((k, n) => {
      let cls = 'sf-choice vq-choice';
      if (answered && k === 0) cls += ' correct';
      else if (answered && k === a.pick) cls += ' wrong';
      return `<button class="${cls}" data-q="${i}" data-choice="${k}" ${answered ? 'disabled' : ''}>
        <span class="sf-choice-num" aria-hidden="true">${n + 1}</span>
        <span class="vq-choice-body">
          <span class="vq-choice-text" lang="ja">${inlineHtml(q.choices[k][0])}</span>
          ${answered ? `<span class="vq-choice-en">${esc(q.choices[k][1])}</span>` : ''}
        </span>
      </button>`;
    }).join('');
    const verdict = !answered ? ''
      : a.pick === 0 ? '<b class="sf-verdict-right">✓ Correct</b>'
        : `<b class="sf-verdict-wrong">✗ It’s ${a.order.indexOf(0) + 1}</b>`;
    const many = passage.questions.length > 1;
    return `<div class="sf-q jr-q${answered ? ` vq-q-answered${a.pick === 0 ? ' sf-q-right' : ' sf-q-wrong'}` : ''}" id="jr-q-${i}">
      <div class="sf-q-head"><span class="sf-q-num">${many ? `問${i + 1}` : '問'}</span>${verdict}</div>
      <p class="jr-question" lang="ja">${WORDS && finished(current.attempt) ? wordsHtml(q.q, { words: WORDS, sid: `q${i}`, deck: deck(), sel: current.sel }) : inlineHtml(q.q)}</p>
      ${answered ? `<p class="vq-translation">${esc(q.en)}</p>` : ''}
      <div class="sf-choices vq-choices vq-choices-long">${choices}</div>
      ${answered ? `<div class="particle-explanation sf-why jr-why"><p>${esc(q.why)}</p><p class="jr-why-hint">The highlighted part of the text is where the answer is.</p></div>` : ''}
    </div>`;
  }

  function wordListHtml(passage) {
    if (!passage.words || !passage.words.length) return '';
    return `<div class="jr-words"><div class="vq-missed-title">Words in this text</div>
      <ul class="vq-words">${passage.words.map(([w, r, m]) =>
        `<li><span class="vq-word-text"><span lang="ja">${esc(plain(w))}</span>${r ? ` <span class="vq-words-kana" lang="ja">${esc(r)}</span>` : ''} — ${esc(m)}</span></li>`).join('')}</ul></div>`;
  }

  function render() {
    const { passage, attempt } = current;
    const done = finished(attempt);
    const shown = shownKeys(attempt);
    $('jr-instructions').innerHTML = inlineHtml(instructions(passage));
    const words = done && WORDS;
    const bySentence = words && current.view === 'sentences';
    $('jr-paper').className = `jr-paper jr-form-${passage.form}${passage.level === 'N5' ? ' jr-spaced' : ''}${bySentence ? ' jr-sentences' : ''}${bySentence && settings.english ? ' show-english' : ''}`;
    $('jr-paper').innerHTML = bySentence ? sentencesHtml(passage)
      : textHtml(passage, shown, words ? (m, info) => wordsHtml(m, { words: WORDS, shown, split: info.kind !== 'cell', line: info.line, deck: deck(), sel: current.sel }) : null);
    $('jr-questions').innerHTML = passage.questions.map((q, i) => questionHtml(passage, q, attempt[i], i)).join('');
    $('jr-after').classList.toggle('hidden', !done);
    $('jr-tools').classList.toggle('hidden', !done);
    if (done && !WORDS) loadWords();
    renderTools();
    highlightGrammar();
    renderPanel();
    if (!done) return;
    const s = score(attempt);
    const n = attempt.length;
    $('jr-score').textContent = `${s} / ${n}`;
    $('jr-score-msg').innerHTML = s === n ? (n === 1 ? 'Right. 🎉' : `All ${n} right. 🎉`) : `<b class="sf-verdict-wrong">${n - s} wrong</b> — read the highlighted part again.`;
    $('jr-translation').innerHTML = passage.en.split('\n').map(l => `<p>${esc(l)}</p>`).join('');
    $('jr-words').innerHTML = wordListHtml(passage);
    const next = nextPassage(PASSAGES, passage.id, store.best);
    $('btn-jr-next').classList.toggle('hidden', !next);
  }

  // ─── Words and sentences (once the questions are answered) ───────────────

  let WORDS = global.JLPT_READING_WORDS || null;
  let loading = null;
  // jlpt-reading-words.js is big, so it's loaded only once a text is done.
  function loadWords() {
    if (WORDS || loading) return;
    loading = document.createElement('script');
    loading.src = 'jlpt-reading-words.js?v=1';
    loading.onload = () => { WORDS = global.JLPT_READING_WORDS || null; if (current) render(); };
    loading.onerror = () => { loading = null; };
    document.head.appendChild(loading);
  }

  const DECK_KEY = 'tokidoki_story_words';
  const SRS_KEY = 'tokidoki_srs';
  const deck = () => load(DECK_KEY, {});
  const kanaOf = markup => String(markup).replace(/\{[^|}]+\|([^}]+)\}/g, '$1');
  const deckMarkup = markup => String(markup).replace(/\{([^|}]+)\|([^}]+)\}/g, '$1[$2]');
  const sentenceOf = sid => current && sentences(current.passage).find(x => x.sid === sid);
  const entryOf = key => (WORDS && WORDS.lines[key]) || { w: [] };

  function renderTools() {
    const on = current.view === 'sentences';
    $('jr-view-text').setAttribute('aria-pressed', String(!on));
    $('jr-view-sentences').setAttribute('aria-pressed', String(on));
    $('jr-english-wrap').classList.toggle('hidden', !on);
    $('jr-opt-english').checked = !!settings.english;
    $('jr-tools-hint').textContent = !WORDS ? 'Loading the words…'
      : on ? 'Tap a sentence’s number for its grammar, or any word for its meaning.' : 'Tap any word for its meaning.';
  }

  // The text one sentence a row, numbered, with its English under it.
  function sentencesHtml(passage) {
    const list = sentences(passage).filter(x => !x.question);
    return list.map((x, n) => `
      <div class="story-sentence${current.sel && current.sel.sid === x.sid ? ' selected' : ''}" data-sid="${x.sid}">
        <button type="button" class="story-sentence-num" data-sid="${x.sid}" aria-label="Explain sentence ${n + 1}" title="Explain this sentence">${n + 1}</button>
        <div class="story-sentence-body">
          <div class="story-jp" lang="ja">${wordsHtml(x.ja, { words: WORDS, sid: x.sid, deck: deck(), sel: current.sel })}</div>
          <div class="story-en">${esc(x.en)}</div>
        </div>
      </div>`).join('');
  }

  // The flashcard sentence: the words, in the decks' 漢字[かな] form, spaced.
  function deckSentence(key) {
    return entryOf(key).w.map(p => deckMarkup(typeof p === 'string' ? p : p[0]).replace(/[\s　]+/g, '')).filter(Boolean).join(' ');
  }

  function toggleWord(sel) {
    const words = deck();
    const [, key] = entryOf(sel.k).w[sel.t];
    if (words[key]) {
      delete words[key];
      const srs = load(SRS_KEY, {});
      delete srs[`story_word:${key}`];
      delete srs[`story_word:${key}:recall`];
      save(SRS_KEY, srs);
    } else {
      const [kana, meaning] = WORDS.gloss[key];
      const p = current.passage;
      const x = sel.sid && sentenceOf(sel.sid);
      words[key] = {
        vocab: p.level.toLowerCase(), kana, meaning, added: Date.now(), level: p.level,
        jp: deckSentence(sel.k), en: x ? x.en : '', title: `${p.title} (JLPT Reading)`,
      };
    }
    save(DECK_KEY, words);
  }

  function renderPanel() {
    const sel = current && current.sel;
    const panel = $('jr-panel');
    panel.classList.toggle('open', !!sel);
    document.body.classList.toggle('jr-panel-open', !!sel);
    if (!sel || !WORDS) return;
    const speak = kana => (global.Pronounce ? Pronounce.buttonsHtml(kana, 'story-panel-speak') : '');
    if (sel.type === 'word') {
      const [markup, key] = entryOf(sel.k).w[sel.t];
      const [reading, meaning, pos] = WORDS.gloss[key] || [plain(markup), '', ''];
      const word = key.replace(/\(.*\)$/, '');
      const form = plain(markup).trim();
      const saved = !!deck()[key];
      $('jr-panel-body').innerHTML = `
        <div class="story-panel-kicker">Word</div>
        <div class="story-panel-word" lang="ja">${esc(word)}</div>
        ${reading !== word ? `<div class="story-panel-reading" lang="ja">${esc(reading)}</div>` : ''}
        ${speak(reading)}
        <div class="story-panel-pos">${esc(pos)}</div>
        <div class="story-panel-meaning">${esc(meaning)}</div>
        ${form !== word ? `<div class="story-panel-form">In the text: <span lang="ja">${esc(form)}</span></div>` : ''}
        <div class="mys-panel-actions">
          <button type="button" class="${saved ? 'btn-secondary' : 'btn-primary'} story-panel-add" data-add-word>${saved ? '✓ In word flashcards — remove' : '＋ Add word to flashcards'}</button>
        </div>
        ${global.KanjiCards ? KanjiCards.breakdownHtml(word, { reading, meaning }) : ''}
        ${sel.sid ? '<button type="button" class="story-panel-link" data-explain>Explain this sentence →</button>' : ''}
        ${saved ? '<div class="mys-panel-tip">Review your flashcards on the <a href="flashcards.html">Flashcards page</a>.</div>' : ''}`;
      return;
    }
    const x = sentenceOf(sel.sid);
    if (!x) return;
    const entry = entryOf(segKey(x.ja));
    const list = sentences(current.passage).filter(y => !y.question);
    const label = x.question ? `Question ${Number(sel.sid.slice(1)) + 1}` : `Sentence ${list.findIndex(y => y.sid === x.sid) + 1}`;
    const grammar = (entry.g || []).map(([gid, snippet], gi) => {
      const g = WORDS.grammar[gid];
      if (!g) return '';
      return `
        <li class="story-grammar-item${current.grammar === gi ? ' active' : ''}" data-g="${gi}" tabindex="0">
          <div class="story-grammar-head">
            <span class="story-grammar-title">${g.title}</span>
            <span class="story-grammar-level">${esc(g.level)}</span>
          </div>
          <div class="story-grammar-pattern" lang="ja">${g.pattern}</div>
          <div class="story-grammar-note">${g.note}</div>
          ${snippet ? `<div class="story-grammar-here">Here: <span lang="ja">${esc(snippet)}</span></div>` : ''}
        </li>`;
    }).join('');
    $('jr-panel-body').innerHTML = `
      <div class="story-panel-kicker">${label}</div>
      <div class="story-panel-sentence" lang="ja">${inlineHtml(x.ja)}</div>
      ${speak(kanaOf(x.ja).replace(/[\s　]+/g, ''))}
      <div class="story-panel-en">${esc(x.en)}</div>
      <div class="story-panel-kicker">Grammar</div>
      ${grammar ? `<ul class="story-grammar-list">${grammar}</ul>` : '<p class="story-panel-empty">No grammar to unpack here — just nouns and names.</p>'}
      <p class="phrase-explain-tip">Tap a word in the sentence for its meaning. Hover or tap a grammar point to light up its words.</p>`;
  }

  // The words of the selected sentence a grammar point covers, lit up.
  function highlightGrammar() {
    document.querySelectorAll('#screen-jlpt-reading .jr-word.grammar-hit').forEach(el => el.classList.remove('grammar-hit'));
    const sel = current && current.sel;
    if (!sel || sel.type !== 'sentence' || current.grammar == null || !WORDS) return;
    const x = sentenceOf(sel.sid);
    const entry = x && entryOf(segKey(x.ja));
    const ref = entry && entry.g && entry.g[current.grammar];
    if (!ref) return;
    for (const t of snippetPieces(entry.w, ref[1])) {
      document.querySelectorAll(`#screen-jlpt-reading .jr-word[data-sid="${sel.sid}"][data-t="${t}"]`).forEach(el => el.classList.add('grammar-hit'));
    }
  }

  function select(sel) {
    const same = sel && current.sel && current.sel.type === sel.type && current.sel.sid === sel.sid && current.sel.k === sel.k && current.sel.t === sel.t;
    current.sel = same ? null : sel;
    current.grammar = null;
    if (current.sel && current.sel.type === 'word') {
      const key = entryOf(sel.k).w[sel.t][1];
      if (global.WordLookups) WordLookups.record(key);
      const g = WORDS.gloss[key];
      if (g && global.Pronounce) Pronounce.onClick(g[0]);
    }
    render();
  }

  function onTextClick(e) {
    if (!current || !WORDS || !finished(current.attempt)) return;
    const w = e.target.closest('.jr-word');
    if (w) { select({ type: 'word', k: w.dataset.k, t: Number(w.dataset.t), sid: w.dataset.sid || '' }); return; }
    const row = e.target.closest('.story-sentence-num, .story-sentence');
    if (row) select({ type: 'sentence', sid: row.dataset.sid });
  }

  function closePanel() {
    if (!current || !current.sel) return;
    current.sel = null;
    current.grammar = null;
    render();
  }

  function setView(view) {
    current.view = view;
    render();
  }

  function pick(i, k) {
    const a = current && current.attempt[i];
    if (!a || a.pick != null) return;
    a.pick = k;
    if (finished(current.attempt) && !current.saved) saveScore();
    render();
    const el = finished(current.attempt) ? $('jr-after') : $(`jr-q-${i}`);
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    if (finished(current.attempt)) $('btn-jr-next').focus({ preventScroll: true });
  }

  function saveScore() {
    const s = score(current.attempt);
    const total = current.attempt.length;
    const id = current.passage.id;
    const prev = store.best[id];
    if (!prev || s > prev.score) store.best[id] = { score: s, total };
    store.last[id] = { score: s, total };
    current.saved = true;
    save(STORE_KEY, store);
  }

  function goHome() {
    current = null;
    $('jr-panel').classList.remove('open');
    document.body.classList.remove('jr-panel-open');
    try { history.replaceState(null, '', location.pathname + location.search); } catch { /* ignore */ }
    renderHome();
    show('screen-chapters');
  }

  function goNext() {
    const next = current && nextPassage(PASSAGES, current.passage.id, store.best);
    if (next) open(next.id);
  }

  // ─── Events ────────────────────────────────────────────────────────────────

  for (const id of ['jr-opt-furigana', 'jr-opt-furigana-q']) {
    $(id).addEventListener('change', e => { settings.furigana = e.target.checked; save(SETTINGS_KEY, settings); applySettings(); });
  }
  $('jr-levels').addEventListener('click', e => {
    const b = e.target.closest('[data-level]');
    if (!b) return;
    settings.level = b.dataset.level;
    save(SETTINGS_KEY, settings);
    renderHome();
  });
  for (const type of Object.keys(TYPES)) {
    $(`jr-list-${type}`).addEventListener('click', e => {
      const b = e.target.closest('[data-passage]');
      if (b) open(b.dataset.passage);
    });
  }
  $('jr-questions').addEventListener('click', e => {
    const b = e.target.closest('[data-choice]');
    if (b && !b.disabled) { pick(Number(b.dataset.q), Number(b.dataset.choice)); return; }
    onTextClick(e);
  });
  $('jr-paper').addEventListener('click', onTextClick);
  for (const id of ['jr-paper', 'jr-questions']) {
    $(id).addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.jr-word')) { e.preventDefault(); e.stopPropagation(); onTextClick(e); }
    });
  }
  $('jr-view-text').addEventListener('click', () => setView('text'));
  $('jr-view-sentences').addEventListener('click', () => setView('sentences'));
  $('jr-opt-english').addEventListener('change', e => { settings.english = e.target.checked; save(SETTINGS_KEY, settings); render(); });
  $('jr-panel-close').addEventListener('click', closePanel);
  $('jr-panel').addEventListener('click', e => {
    const sel = current && current.sel;
    if (!sel) return;
    if (e.target.closest('[data-add-word]')) { toggleWord(sel); render(); return; }
    if (e.target.closest('[data-explain]')) { select({ type: 'sentence', sid: sel.sid }); return; }
    const g = e.target.closest('[data-g]');
    if (g) { current.grammar = current.grammar === Number(g.dataset.g) ? null : Number(g.dataset.g); renderPanel(); highlightGrammar(); }
  });
  for (const ev of ['mouseover', 'focusin']) {
    $('jr-panel').addEventListener(ev, e => {
      const g = e.target.closest('[data-g]');
      if (!g || !current || current.grammar === Number(g.dataset.g)) return;
      current.grammar = Number(g.dataset.g);
      highlightGrammar();
      document.querySelectorAll('#jr-panel .story-grammar-item').forEach(li => li.classList.toggle('active', li === g));
    });
  }
  $('btn-jr-next').addEventListener('click', goNext);
  $('btn-jr-retry').addEventListener('click', () => open(current.passage.id));
  $('btn-jr-home').addEventListener('click', goHome);
  $('jr-quit').addEventListener('click', goHome);
  $('btn-jr-reset').addEventListener('click', () => {
    if (!confirm('Reset your JLPT Reading scores?')) return;
    store.best = {};
    store.last = {};
    save(STORE_KEY, store);
    renderHome();
  });
  document.addEventListener('keydown', e => {
    if (!current || !$('screen-jlpt-reading').classList.contains('active')) return;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape' && current.sel) { closePanel(); return; }
    if ((e.key === 's' || e.key === 'S') && finished(current.attempt) && WORDS) { setView(current.view === 'sentences' ? 'text' : 'sentences'); return; }
    if ((e.key === 'e' || e.key === 'E') && current.view === 'sentences') { settings.english = !settings.english; save(SETTINGS_KEY, settings); render(); return; }
    if (e.key === 'f' || e.key === 'F') {
      settings.furigana = !settings.furigana;
      save(SETTINGS_KEY, settings);
      applySettings();
      return;
    }
    // 1–4 answer the first question not yet answered.
    const i = current.attempt.findIndex(a => a.pick == null);
    if (i >= 0 && /^[1-4]$/.test(e.key)) {
      e.preventDefault();
      pick(i, current.attempt[i].order[Number(e.key) - 1]);
    } else if (i < 0 && (e.key === ' ' || e.key === 'Enter') && !e.repeat && (e.target === $('btn-jr-next') || !e.target.closest('button, a'))) {
      e.preventDefault();
      goNext();
    }
  });

  renderHome();
  // jlpt-reading.html#<id> opens that text, on load or when the hash changes.
  const openFromHash = () => {
    const hash = decodeURIComponent(location.hash.slice(1));
    if (PASSAGES.some(p => p.id === hash) && (!current || current.passage.id !== hash)) open(hash);
  };
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
})(typeof window !== 'undefined' ? window : globalThis);
