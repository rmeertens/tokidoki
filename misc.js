// Misc (misc.html): "can you name them all?" recall quizzes for the little
// lists every learner has to know by heart — the U-verbs that look like
// RU-verbs, the te-form sound changes, the odd dates and so on.
//
// A quiz is made of sections. In a "find" section the answers are hidden and
// you type them in any order into one box; in a "fill" section each prompt is
// shown and you type its answer next to it. Either way an answer counts the
// moment it's right, romaji turns into kana as you type, and Give up shows
// what you missed. The pure parts are exported for test_misc.js.
(function (global) {
  'use strict';

  const Romaji = global.Romaji || (typeof require !== 'undefined' ? require('./romaji.js') : null);
  // verbs.js declares GENKI_VERBS as a top-level const, so it isn't on window.
  /* global GENKI_VERBS */
  const VERBS = typeof GENKI_VERBS !== 'undefined' ? GENKI_VERBS
    : typeof require !== 'undefined' ? require('./verbs.js').GENKI_VERBS : [];
  /* global GENKI_ADJECTIVES */
  const ADJECTIVES = typeof GENKI_ADJECTIVES !== 'undefined' ? GENKI_ADJECTIVES
    : typeof require !== 'undefined' ? require('./verbs.js').GENKI_ADJECTIVES : [];
  const STORE_KEY = 'tokidoki_misc';

  // ─── Quizzes ───────────────────────────────────────────────────────────────

  // Same rule as the "RU-verbs vs U-verbs" box in the conjugation reference:
  // a U-verb whose る follows an e- or i-sound.
  const E_SOUNDS = 'えけせてねへめれげぜでべぺ';
  const I_SOUNDS = 'いきしちにひみりぎじびぴ';
  const RU_EXCEPTIONS = VERBS.filter(v => v.type === 'u' && v.reading.endsWith('る')
    && (E_SOUNDS + I_SOUNDS).includes(v.reading[v.reading.length - 2]));

  // Regular RU-verbs, for a hint when you type one of those instead.
  const RU_VERBS = VERBS.filter(v => v.type === 'ru');

  // な-adjectives that look like い-adjectives. Genki only has three, so this
  // is the common N5–N3 list rather than one built from verbs.js.
  const NA_EI = [
    ['きれい', 'きれい', 'pretty / clean', ['綺麗']],
    ['嫌い', 'きらい', 'disliked'],
    ['大嫌い', 'だいきらい', 'hated'],
    ['有名', 'ゆうめい', 'famous'],
    ['丁寧', 'ていねい', 'polite / careful'],
    ['失礼', 'しつれい', 'rude'],
    ['得意', 'とくい', 'good at'],
    ['心配', 'しんぱい', 'worried'],
    ['曖昧', 'あいまい', 'vague'],
  ];
  const I_ADJECTIVES = ADJECTIVES.filter(a => a.type === 'i-adj');

  // The counters you meet most, with what they count.
  const COUNTERS = [
    ['people', '人', 'にん'],
    ['people (polite)', '名', 'めい'],
    ['small round things — apples, eggs', '個', 'こ'],
    ['long thin things — pens, bottles, trees', '本', 'ほん'],
    ['flat thin things — paper, shirts, tickets', '枚', 'まい'],
    ['books and magazines', '冊', 'さつ'],
    ['machines and vehicles', '台', 'だい'],
    ['small animals — cats, dogs, fish', '匹', 'ひき'],
    ['large animals — cows, horses', '頭', 'とう'],
    ['birds (and rabbits)', '羽', 'わ'],
    ['cups, glasses and bowls', '杯', 'はい'],
    ['times / occurrences', '回', 'かい'],
    ['floors of a building', '階', 'かい'],
    ['years of age', '歳', 'さい', ['才']],
    ['yen', '円', 'えん'],
    ['o\'clock', '時', 'じ'],
    ['minutes', '分', 'ふん', ['ぷん']],
    ['seconds', '秒', 'びょう'],
    ['hours (how long)', '時間', 'じかん'],
    ['days', '日', 'にち', ['か']],
    ['weeks', '週間', 'しゅうかん'],
    ['months (how long)', 'か月', 'かげつ', ['ヶ月', 'カ月', 'ケ月', 'ヵ月', '箇月']],
    ['years', '年', 'ねん'],
    ['pairs of shoes and socks', '足', 'そく'],
    ['suits and outfits', '着', 'ちゃく'],
    ['houses and shops', '軒', 'けん'],
    ['matters, cases, emails to answer', '件', 'けん'],
    ['letters and emails', '通', 'つう'],
    ['songs and tunes', '曲', 'きょく'],
    ['number in a sequence — No. 1, 2…', '番', 'ばん'],
  ];

  const TE_ROWS = [
    { key: 'う', value: 'って', ex: '買う → 買って' },
    { key: 'つ', value: 'って', ex: '待つ → 待って' },
    { key: 'る', value: 'って', ex: '帰る → 帰って' },
    { key: 'む', value: 'んで', ex: '読む → 読んで' },
    { key: 'ぶ', value: 'んで', ex: '遊ぶ → 遊んで' },
    { key: 'ぬ', value: 'んで', ex: '死ぬ → 死んで' },
    { key: 'く', value: 'いて', ex: '書く → 書いて' },
    { key: 'ぐ', value: 'いで', ex: '泳ぐ → 泳いで' },
    { key: 'す', value: 'して', ex: '話す → 話して' },
  ];

  const QUIZZES = [
    {
      id: 'ru-exceptions',
      glyph: '帰',
      title: 'RU-verb lookalikes',
      ja: '例外の五段動詞',
      desc: `Exceptions — end in える or いる but are U-verbs (${RU_EXCEPTIONS.length}). Can you name them all?`,
      sections: [{
        type: 'find',
        placeholder: 'Type a verb — kanji, kana or romaji',
        columns: ['Verb', 'Reading', 'Meaning'],
        items: RU_EXCEPTIONS.map(v => ({
          cells: [v.kanji, v.reading, v.meaning],
          accept: [v.kanji, v.reading],
        })),
        miss(s) {
          const ru = RU_VERBS.find(v => v.kanji === s || v.reading === s);
          return ru ? `${ru.kanji} (${ru.reading}) is a regular RU-verb.` : '';
        },
      }],
    },
    {
      id: 'na-ei',
      glyph: '綺',
      title: 'な-adjectives ending in い',
      ja: 'いで終わるな形容詞',
      desc: `They look like い-adjectives, but take な (${NA_EI.length}). Can you name them all?`,
      sections: [{
        type: 'find',
        placeholder: 'Type an adjective — kanji, kana or romaji',
        columns: ['Adjective', 'Reading', 'Meaning'],
        items: NA_EI.map(([kanji, reading, meaning, alt = []]) => ({
          cells: [kanji, reading, meaning],
          accept: [kanji, reading, ...alt],
        })),
        miss(s) {
          const i = I_ADJECTIVES.find(a => a.kanji === s || a.reading === s);
          return i ? `${i.kanji} (${i.reading}) is a real い-adjective.` : '';
        },
      }],
    },
    {
      id: 'te-form',
      glyph: 'て',
      title: 'Te-form endings',
      ja: 'て形の作り方',
      desc: 'What every U-verb ending changes to — then the RU-verbs and the irregulars.',
      sections: [
        {
          type: 'fill',
          label: 'U-verbs — what each ending changes to',
          columns: ['Ending', 'Te-form'],
          // The change ("って") or the example verb in full ("買って") both count.
          items: TE_ROWS.map(r => {
            const [verb, te] = r.ex.split(' → ');
            return { prompt: `〜${r.key}  (${verb})`, answer: r.value, accept: [te] };
          }),
        },
        {
          type: 'fill',
          label: 'And the rest',
          columns: ['Verb', 'Te-form'],
          items: [
            { prompt: 'RU-verbs: 食べる', answer: '食べて', accept: ['たべて', 'て'] },
            { prompt: '行く (the one く exception)', answer: '行って', accept: ['いって'] },
            { prompt: 'する', answer: 'して' },
            { prompt: '来る', answer: '来て', accept: ['きて'] },
          ],
        },
      ],
    },
    {
      id: 'dates',
      glyph: '日',
      title: 'Dates of the month',
      ja: '日付の読み方',
      desc: 'The days that aren\'t just a number + にち — 1st to 10th, 14th, 20th and 24th.',
      sections: [{
        type: 'fill',
        columns: ['Date', 'Reading'],
        items: [
          ['1日', 'ついたち'], ['2日', 'ふつか'], ['3日', 'みっか'], ['4日', 'よっか'],
          ['5日', 'いつか'], ['6日', 'むいか'], ['7日', 'なのか'], ['8日', 'ようか'],
          ['9日', 'ここのか'], ['10日', 'とおか'], ['14日', 'じゅうよっか'],
          ['20日', 'はつか'], ['24日', 'にじゅうよっか'],
        ].map(([prompt, answer]) => ({ prompt, answer })),
      }],
    },
    {
      id: 'tsu-counter',
      glyph: '一',
      title: 'Counting things: ひとつ to とお',
      ja: '和語の数え方',
      desc: 'The native Japanese numbers you use to count things, one to ten.',
      sections: [{
        type: 'fill',
        columns: ['Number', 'Reading'],
        items: [
          ['1つ', 'ひとつ'], ['2つ', 'ふたつ'], ['3つ', 'みっつ'], ['4つ', 'よっつ'],
          ['5つ', 'いつつ'], ['6つ', 'むっつ'], ['7つ', 'ななつ'], ['8つ', 'やっつ'],
          ['9つ', 'ここのつ'], ['10', 'とお'],
        ].map(([prompt, answer]) => ({ prompt, answer })),
      }],
    },
    {
      id: 'counters',
      glyph: '枚',
      title: 'The 30 most common counters',
      ja: '助数詞',
      desc: 'What do you count people, pens, paper, cats and floors with? Kanji or reading both count.',
      sections: [{
        type: 'fill',
        columns: ['Counts', 'Counter'],
        items: COUNTERS.map(([prompt, kanji, reading, alt = []]) => ({
          prompt, answer: `${kanji}（${reading}）`, accept: [kanji, reading, ...alt],
        })),
      }],
    },
  ];

  // ─── Matching ──────────────────────────────────────────────────────────────

  // Kana for comparing: romaji converted, katakana folded to hiragana, and
  // spaces, arrows and separators dropped.
  function normalize(text) {
    let s = String(text).trim().toLowerCase();
    s = s.replace(/[\s　→⇒>＞=＝\-–—~〜,、・/／]+/g, '');
    if (Romaji) s = Romaji.toHiragana(s, true);
    return s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
  }

  // Indices of the items a typed answer names. `found` holds those already
  // named; matching is against what's still hidden first.
  function matchItems(section, text, found = new Set()) {
    const s = normalize(text);
    if (!s) return [];
    return section.items.map((it, i) => i).filter(i => !found.has(i)
      && accepted(section.items[i]).some(a => normalize(a) === s));
  }

  function accepted(item) {
    return [...(item.accept || []), ...(item.answer ? [item.answer] : [])];
  }

  const total = quiz => quiz.sections.reduce((n, sec) => n + sec.items.length, 0);

  // ─── Storage ───────────────────────────────────────────────────────────────

  function loadStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; }
  }
  function saveStore(store) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch { /* private mode */ }
  }

  // Best is the higher score, then the faster time.
  function better(a, b) {
    if (!a) return true;
    if (b.score !== a.score) return b.score > a.score;
    return b.time < a.time;
  }

  const formatTime = sec => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

  // ─── Page ──────────────────────────────────────────────────────────────────

  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function initPage() {
    const $ = sel => document.querySelector(sel);
    const list = $('#misc-list');
    if (!list) return;

    let quiz = null;
    let found = [];       // per section, a Set of item indices
    let started = 0;
    let timer = null;
    let over = false;

    function show(id) {
      document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
      window.scrollTo(0, 0);
    }

    function renderList() {
      const store = loadStore();
      list.innerHTML = QUIZZES.map(q => {
        const best = store[q.id];
        const n = total(q);
        const meta = best ? `Best ${best.score} / ${n}<br>${formatTime(best.time)}` : `${n} to name`;
        return `<button class="lis-part-row misc-row${best && best.score === n ? ' misc-row-perfect' : ''}" data-quiz="${q.id}">
          <span class="lis-part-head">
            <span class="misc-glyph" lang="ja" aria-hidden="true">${esc(q.glyph)}</span>
            <span class="lis-part-body">
              <span class="lis-part-title">${esc(q.title)}<span class="lis-part-ja" lang="ja">${esc(q.ja)}</span></span>
              <span class="lis-part-desc">${esc(q.desc)}</span>
            </span>
            <span class="lis-part-meta">${meta}</span>
            <span class="lis-part-go" aria-hidden="true">›</span>
          </span>
        </button>`;
      }).join('');
    }

    function start(id) {
      quiz = QUIZZES.find(q => q.id === id);
      if (!quiz) return;
      found = quiz.sections.map(() => new Set());
      over = false;
      started = Date.now();
      $('#misc-title').textContent = quiz.title;
      $('#misc-desc').textContent = quiz.desc;
      $('#misc-result').classList.add('hidden');
      $('#misc-give-up').classList.remove('hidden');
      $('#misc-again').classList.add('hidden');
      renderQuiz();
      updateScore();
      clearInterval(timer);
      timer = setInterval(updateTime, 1000);
      updateTime();
      show('screen-misc-quiz');
      history.replaceState(null, '', '#' + id);
      const first = document.querySelector('#misc-body input');
      if (first) first.focus();
    }

    function renderQuiz() {
      $('#misc-body').innerHTML = quiz.sections.map((sec, si) => {
        const head = `<tr>${sec.columns.map(c => `<th>${esc(c)}</th>`).join('')}</tr>`;
        const label = sec.label ? `<h3 class="lis-heading">${esc(sec.label)}</h3>` : '';
        if (sec.type === 'find') {
          const rows = sec.items.map((it, i) => `<tr data-row="${i}">${it.cells.map(c =>
            `<td lang="ja"><span class="misc-cell">${esc(c)}</span></td>`).join('')}</tr>`).join('');
          return `<section class="misc-section" data-section="${si}">${label}
            <input type="text" class="answer-input misc-find" lang="ja" data-section="${si}"
              placeholder="${esc(sec.placeholder || 'Type an answer')}" autocomplete="off" autocapitalize="off" spellcheck="false">
            <div class="misc-miss" aria-live="polite"></div>
            <table class="misc-table misc-table-find"><thead>${head}</thead><tbody>${rows}</tbody></table>
          </section>`;
        }
        const rows = sec.items.map((it, i) => `<tr data-row="${i}">
          <td lang="ja" class="misc-prompt">${esc(it.prompt)}</td>
          <td><input type="text" class="answer-input misc-fill" lang="ja" data-section="${si}" data-row="${i}"
            autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="${esc(it.prompt)}"></td>
        </tr>`).join('');
        return `<section class="misc-section" data-section="${si}">${label}
          <table class="misc-table misc-table-fill"><thead>${head}</thead><tbody>${rows}</tbody></table>
        </section>`;
      }).join('');
      document.querySelectorAll('#misc-body input').forEach(inp => {
        if (Romaji) Romaji.attach(inp);
        inp.addEventListener('input', () => onInput(inp, false));
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); onInput(inp, true); } });
      });
    }

    function onInput(inp, enter) {
      if (over) return;
      const si = +inp.dataset.section;
      const sec = quiz.sections[si];
      const text = enter && Romaji ? Romaji.flush(inp) : inp.value;
      const box = inp.closest('.misc-section');
      if (sec.type === 'find') {
        const hits = matchItems(sec, text, found[si]);
        const miss = box.querySelector('.misc-miss');
        if (hits.length) {
          hits.forEach(i => reveal(si, i, 'found'));
          inp.value = '';
          miss.textContent = '';
        } else if (enter && text.trim()) {
          const s = normalize(text);
          const again = matchItems(sec, text).length;
          miss.textContent = again ? 'Already got that one.' : (sec.miss && sec.miss(s)) || 'Not one of them.';
          inp.select();
        }
      } else {
        const i = +inp.dataset.row;
        if (matchItems({ items: [sec.items[i]] }, text).length) {
          reveal(si, i, 'found');
          const open = [...document.querySelectorAll('#misc-body input')];
          const next = open.slice(open.indexOf(inp)).concat(open).find(x => !x.disabled);
          if (next) next.focus();
        } else if (enter) {
          inp.classList.remove('misc-wrong');
          void inp.offsetWidth;
          inp.classList.add('misc-wrong');
        }
      }
      updateScore();
      if (found.every((f, s) => f.size === quiz.sections[s].items.length)) finish();
    }

    function reveal(si, i, how) {
      const sec = quiz.sections[si];
      if (how === 'found') found[si].add(i);
      const row = document.querySelector(`.misc-section[data-section="${si}"] tr[data-row="${i}"]`);
      row.classList.add(how === 'found' ? 'misc-found' : 'misc-missed');
      if (sec.type === 'fill') {
        const inp = row.querySelector('input');
        inp.value = sec.items[i].answer;
        inp.disabled = true;
      }
    }

    function updateScore() {
      const n = found.reduce((a, f) => a + f.size, 0);
      $('#misc-score').textContent = `${n} / ${total(quiz)}`;
    }

    function elapsed() { return Math.round((Date.now() - started) / 1000); }
    function updateTime() { $('#misc-time').textContent = formatTime(elapsed()); }

    function finish() {
      if (over) return;
      over = true;
      clearInterval(timer);
      updateTime();
      quiz.sections.forEach((sec, si) => sec.items.forEach((_, i) => {
        if (!found[si].has(i)) reveal(si, i, 'missed');
      }));
      document.querySelectorAll('#misc-body input').forEach(inp => { inp.disabled = true; });
      document.querySelectorAll('.misc-miss').forEach(el => { el.textContent = ''; });
      const score = found.reduce((a, f) => a + f.size, 0);
      const n = total(quiz);
      const result = { score, time: elapsed() };
      const store = loadStore();
      const best = better(store[quiz.id], result);
      if (best) { store[quiz.id] = result; saveStore(store); }
      const res = $('#misc-result');
      res.innerHTML = score === n
        ? `🎉 All ${n} in ${formatTime(result.time)}${best ? ' — a new best!' : ''}`
        : `You named ${score} of ${n}. The ones you missed are in red.${best ? ' New best!' : ''}`;
      res.classList.remove('hidden');
      $('#misc-give-up').classList.add('hidden');
      $('#misc-again').classList.remove('hidden');
      renderList();
    }

    function home() {
      clearInterval(timer);
      quiz = null;
      history.replaceState(null, '', location.pathname);
      renderList();
      show('screen-chapters');
    }

    list.addEventListener('click', e => {
      const row = e.target.closest('[data-quiz]');
      if (row) start(row.dataset.quiz);
    });
    $('#misc-give-up').addEventListener('click', finish);
    $('#misc-again').addEventListener('click', () => start(quiz.id));
    $('#misc-quit').addEventListener('click', home);

    renderList();
    const hash = location.hash.slice(1);
    if (QUIZZES.some(q => q.id === hash)) start(hash);
  }

  const api = { QUIZZES, RU_EXCEPTIONS, normalize, matchItems, total, better, formatTime };
  global.Misc = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPage);
    else initPage();
  }
})(typeof window !== 'undefined' ? window : globalThis);
