// Conversation starters (conversation.html): pick a question from the list
// and it opens on its own page (conversation.html#<id>), where you write a
// few sentences in Japanese. Every hint is there as a locked tile — words to
// talk about, verbs, grammar, a way to begin, the sample answer — showing
// only its English until you unlock it. A hint also unlocks by itself, with
// a little pop, once your answer uses it, and with the Kanji switch on the
// kana words you type turn into kanji. Hints and answers differ per JLPT
// level.
//
// The questions live in conversation-data.js. What you write is kept per
// question and level in tokidoki_conversation (synced with the account;
// sync-merge.js keeps the newer text of each). The pure parts are exported
// for test_conversation.js.
(function (global) {
  'use strict';

  const KANJI = '㐀-䶿一-鿿々〆ヶ';
  const RUBY_RE = new RegExp('([' + KANJI + ']+)\\[([^\\]]+)\\]', 'g');
  const STORE_KEY = 'tokidoki_conversation';
  const SETTINGS_KEY = 'tokidoki_conversation_settings';
  const LEVELS = ['N5', 'N4', 'N3'];
  const STEPS = [
    { key: 'words', icon: '🧺', title: 'Words to talk about' },
    { key: 'verbs', icon: '🏃', title: 'Verbs & describing words' },
    { key: 'grammar', icon: '🧩', title: 'Grammar to link ideas' },
    { key: 'start', icon: '✏️', title: 'A way to begin' },
  ];

  // ─── Markup ────────────────────────────────────────────────────────────────

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
  const kana = markup => pieces(markup).map(p => p.r || p.t).join('');

  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function rubyHtml(markup) {
    return pieces(markup).map(p => p.r
      ? `<ruby>${esc(p.t)}<rt>${esc(p.r)}</rt></ruby>`
      : esc(p.t)).join('');
  }

  // ─── Data ──────────────────────────────────────────────────────────────────

  // 'ja|en|example|example English' → { ja, en, ex, exEn }
  function parseHint(str) {
    const [ja, en = '', ex = '', exEn = ''] = String(str).split('|');
    return { ja, en, ex, exEn };
  }

  // Everything a topic shows at one level, with the hints parsed.
  function levelData(topic, level) {
    const d = topic[level] || {};
    const q = d.q || topic.q;
    return {
      q: { ja: q[0], en: q[1] },
      words: (d.words || []).map(parseHint),
      verbs: (d.verbs || []).map(parseHint),
      grammar: (d.grammar || []).map(parseHint),
      start: d.start ? [parseHint(d.start)] : [],
      answer: { ja: d.answer[0], en: d.answer[1] },
    };
  }

  // What a tapped hint adds to your answer: the plain Japanese, without the
  // 〜 placeholders.
  const insertable = markup => plain(markup).replace(/[〜~]/g, '');

  // Puts `text` in place of the selection [start, end). Returns the new
  // value and where the caret goes.
  function insertAt(value, start, end, text) {
    const v = String(value || '');
    const s = Math.max(0, Math.min(start == null ? v.length : start, v.length));
    const e = Math.max(s, Math.min(end == null ? s : end, v.length));
    return { value: v.slice(0, s) + text + v.slice(e), caret: s + text.length };
  }

  // Characters written, not counting spaces and line breaks.
  const charCount = text => Array.from(String(text || '').replace(/\s/g, '')).length;

  const answerKey = (id, level) => id + ':' + level;

  // Every unlockable hint of a level, in order, with a stable id.
  function hintItems(d) {
    return STEPS.flatMap(s => d[s.key].map((h, i) => Object.assign({ id: s.key + '-' + i, step: s.key }, h)));
  }

  // ─── Spotting hints in your answer ─────────────────────────────────────────
  //
  // A hint unlocks by itself once your answer uses it. Each hint gives a few
  // "forms" — lists of fragments that must appear in order — in kanji and in
  // kana. Verbs and adjectives also match by their stem (行[い]きました →
  // 行き, 出[で]かける → 出かけ), and patterns split at their 〜 / A / B
  // (〜たり〜たりしました → たり … たりし).

  const HIRA_RE = /^[ぁ-ゖー]+$/;
  const KANJI_CHAR = new RegExp('[' + KANJI + ']');
  const POLITE = ['ませんでした', 'かったです', 'たいです', 'ました', 'ません', 'でした', 'ます', 'です'];
  const PLAIN = ['なかった', 'ない', 'った', 'んだ', 'た', 'だ'];
  const DICT_END = /[うくぐすつぬぶむるい]$/;

  // Drops a polite ending, then a dictionary-form ending: the part every
  // form of the word shares. Never shorter than `min` characters.
  function stem(word, min = 2, inflects = true) {
    let w = word;
    const end = POLITE.find(e => w.endsWith(e) && w.length - e.length >= 1);
    const plainEnd = inflects && PLAIN.find(e => w.endsWith(e) && w.length - e.length >= 2);
    if (end) w = w.slice(0, -end.length);
    else if (plainEnd) {
      w = w.slice(0, -plainEnd.length);
      // 限らない → 限: the negative's ら isn't in 限ります.
      if (/ない|なかった/.test(plainEnd) && /[ぁ-ゖ]$/.test(w) && KANJI_CHAR.test(w.slice(-2, -1))) w = w.slice(0, -1);
    }
    else if (inflects && w.endsWith('する') && w.length > 3) w = w.slice(0, -2);
    else if (inflects && DICT_END.test(w) && w.length > 1) w = w.slice(0, -1);
    return Array.from(w).length >= min ? w : word;
  }

  // Long enough to mean something on its own: any kanji, katakana of two or
  // more, hiragana of three or more (two for grammar).
  function meaningful(frags, grammar) {
    const all = frags.join('');
    if (!all) return false;
    if (KANJI_CHAR.test(all)) return true;
    return Array.from(all).length >= (grammar || !HIRA_RE.test(all) ? 2 : 3);
  }

  function matchForms(h, step) {
    const grammar = step === 'grammar' || /[〜~A-Z]/.test(h.ja);
    const out = [];
    [plain(h.ja), kana(h.ja)].forEach(text => {
      const frags = text.replace(/\([^)]*\)/g, '〜').split(/[〜~A-Z\s/]+/).filter(Boolean)
        .filter((f, i, all) => all.length === 1 || !/^(だ|です)$/.test(f)); // まさに〜だ
      if (!frags.length) return;
      const last = frags.length - 1;
      const cut = frags.slice(0, last).concat(stem(frags[last], grammar ? 2 : 1, step !== 'words'));
      // 〜てほしい also comes as 読んでほしい, 〜たもの as 遊んだもの.
      const voiced = f => f.map((x, i) => (i === 0 && grammar ? x.replace(/^て/, 'で').replace(/^た/, 'だ') : x));
      [cut, frags, voiced(cut)].forEach(f => {
        if (meaningful(f, grammar) && !out.some(o => o.join('|') === f.join('|'))) out.push(f);
      });
    });
    return out;
  }

  // Whether `answer` contains the fragments in order. A lone kanji (犬, 本)
  // must stand on its own, so 本 doesn't match inside 日本.
  function hasForm(answer, frags) {
    let from = 0;
    for (const f of frags) {
      let i = answer.indexOf(f, from);
      if (frags.length === 1 && Array.from(f).length === 1) {
        while (i >= 0 && (KANJI_CHAR.test(answer[i - 1] || '') || KANJI_CHAR.test(answer[i + f.length] || ''))) i = answer.indexOf(f, i + 1);
      }
      if (i < 0) return false;
      from = i + f.length;
    }
    return true;
  }

  // The ids of the hints (from hintItems) your answer uses.
  function usedHints(answer, items) {
    const a = String(answer || '').replace(/\s/g, '');
    if (!a) return [];
    return items.filter(h => matchForms(h, h.step).some(f => hasForm(a, f))).map(h => h.id);
  }

  // ─── Writing in kanji ──────────────────────────────────────────────────────
  //
  // With the Kanji switch on, words you type in kana turn into kanji once
  // you've typed past them (どようび は → 土曜日 は). The dictionary comes
  // from this page's own data: every hint word, plus every kanji compound in
  // the questions, examples and sample answers.

  // The common forms of a verb in its dictionary form (会う, 出かける,
  // 勉強する), as [ending, …] to put after its stem, keyed by the stem:
  // { stem: '会', forms: ['います', 'いました', 'って', …] }. Null for
  // anything that isn't a verb.
  const GODAN_RU = ['帰', '入', '走', '知', '切', '要', '減', '限', '滑', '握', '蹴', '焦', '参', '喋', '登', '戻', '乗', '降', '作', '送', '取', '困', '終', '始', '変', '使', '通', '頑張', '分か', 'わか'];
  const I_ROW = { う: 'い', く: 'き', ぐ: 'ぎ', す: 'し', つ: 'ち', ぬ: 'に', ぶ: 'び', む: 'み', る: 'り' };
  const TE = { う: 'って', つ: 'って', る: 'って', む: 'んで', ぶ: 'んで', ぬ: 'んで', く: 'いて', ぐ: 'いで', す: 'して' };
  const A_ROW = { う: 'わ', く: 'か', ぐ: 'が', す: 'さ', つ: 'た', ぬ: 'な', ぶ: 'ば', む: 'ま', る: 'ら' };
  const MASU = ['ます', 'ました', 'ません', 'ませんでした', 'たい', 'たいです'];
  const TE_ON = ['', 'います', 'いました', 'いる', 'ください'];

  const E_I_ROW = /[いきぎしじちにひびぴみりえけげせぜてでねへべぺめれ]$/;
  const SURU = ['します', 'しました', 'しません', 'したい', 'して', 'した', 'しない', 'しています', 'していました', 'する'];

  // `reading` is the kana of `word`; it tells 見る (み|る, ichidan) from 帰る.
  function verbForms(word, reading = '') {
    const m = /^(.*[㐀-䶿一-鿿々])([ぁ-ゖ]*)$/.exec(word);
    if (!m || /^来/.test(word)) return null; // 来る reads き/こ/く: left to the data's own forms
    const [, kanjiPart, okuri] = m;
    const stemReading = n => reading.slice(0, reading.length - (word.length - n));
    // 勉強する, 勉強しています, 料理します
    const suru = /^(する|します|しました|しています|している|して|した)$/.exec(okuri);
    if (suru) return { stem: kanjiPart, forms: SURU };
    // A polite form (食べます, 行きたい): its stem takes the other polite forms;
    // one ending in e-row (食べ) is ichidan and takes the rest too.
    const masu = /^(.*?)(ます|ました|ません|たい|たいです)$/.exec(okuri);
    if (masu) {
      const stem = kanjiPart + masu[1];
      const ichidan = /[えけげせぜてでねへべぺめれ]$/.test(stemReading(stem.length));
      return { stem, forms: ichidan ? [...MASU, ...TE_ON.map(x => 'て' + x), 'た', 'ない', 'る'] : MASU };
    }
    const last = okuri.slice(-1);
    if (!I_ROW[last]) return null;
    const stem = kanjiPart + okuri.slice(0, -1);
    const ichidan = last === 'る' && E_I_ROW.test(stemReading(stem.length))
      && !GODAN_RU.some(g => stem.endsWith(g));
    if (ichidan) return { stem, forms: [...MASU, ...TE_ON.map(x => 'て' + x), 'た', 'ない', 'る'] };
    const te = /^行/.test(word) ? 'って' : TE[last];
    return {
      stem,
      forms: [...MASU.map(x => I_ROW[last] + x), ...TE_ON.map(x => te + x), te.replace(/て$/, 'た').replace(/で$/, 'だ'), A_ROW[last] + 'ない', last],
    };
  }

  // reading → kanji spelling. `prefer` (hint words of the open question)
  // wins over the rest and may be as short as two kana.
  function buildKanjiDict(topics, prefer = []) {
    // reading → { spelling: how often it appears }; the commonest wins.
    const seen = new Map();
    const add = (reading, word, min, weight = 1) => {
      if (!KANJI_CHAR.test(word) || !HIRA_RE.test(reading) || Array.from(reading).length < min) return;
      if (!seen.has(reading)) seen.set(reading, new Map());
      const m = seen.get(reading);
      m.set(word, (m.get(word) || 0) + weight);
    };
    prefer.forEach(m => add(kana(m).replace(/[〜~]/g, ''), insertable(m), 2, 1000));
    const markups = [];
    topics.forEach(t => LEVELS.forEach(level => {
      if (!t[level]) return;
      const d = levelData(t, level);
      markups.push(d.q.ja, d.answer.ja, ...hintItems(d).map(h => h.ex || ''));
      hintItems(d).forEach(h => {
        if (h.step === 'grammar' || /[〜~]/.test(h.ja)) return;
        add(kana(h.ja), plain(h.ja), h.step === 'words' ? 2 : 3, 3);
        // A verb in its dictionary form brings its other forms (会う → 会いました).
        const v = h.step === 'verbs' && verbForms(plain(h.ja), kana(h.ja));
        if (v) {
          const stemKana = kana(h.ja).slice(0, kana(h.ja).length - (plain(h.ja).length - v.stem.length));
          v.forms.forEach(f => add(stemKana + f, v.stem + f, 3, 2));
        }
      });
    }));
    // Only runs that are a whole word: not after kana that belongs to the
    // word (ご飯, 習い事) and not before okurigana (気持ち, 静か).
    const edge = c => !c || !/[ぁ-ゖ]/.test(c) || PARTICLE.test(c);
    markups.forEach(m => pieces(m).forEach((p, i, all) => {
      if (!p.r) return;
      const prev = i > 0 ? all[i - 1].t.slice(-1) : '';
      const next = (all[i + 1] && all[i + 1].t[0]) || '';
      if (edge(prev) && !/[ァ-ヺ]/.test(prev) && edge(next)) add(p.r, p.t, 2);
    }));
    const dict = new Map();
    seen.forEach((m, reading) => {
      if (!PREFIXES.has(reading)) dict.set(reading, [...m].sort((x, y) => y[1] - x[1])[0][0]);
    });
    return dict;
  }

  // Kana that may come right before a word: particles and the like.
  const BEFORE = /[はがをにでともへやのか、。！？「」\s]/;
  const PARTICLE = /[はがをにでともへやの]/;
  // Readings that start too many other words to convert on their own.
  const PREFIXES = new Set(['ひろ', 'すう', 'とく']);

  // Turns the kana words in `text` that are in `dict` into kanji: those
  // followed by a particle, punctuation or a space, before `upto` (the caret:
  // the word you're still typing stays as it is). An `upto` past the end
  // converts a word at the very end too. Returns the new text, the caret and
  // what changed.
  function toKanji(text, dict, upto = text.length) {
    const keys = [...dict.keys()].sort((a, b) => b.length - a.length);
    let out = '';
    let caret = upto;
    const changed = [];
    let i = 0;
    while (i < text.length) {
      const prev = text[i - 1];
      // A word starts after a particle or punctuation, or after an い-adjective
      // (かわいい|ねこ) — but not the いえ of いいえ.
      const boundary = i === 0 || !/[ぁ-ゖ]/.test(prev) || BEFORE.test(prev)
        || (prev === 'い' && !text.startsWith('いいえ', i - 1));
      const k = boundary && /[ぁ-ゖ]/.test(text[i]) && keys.find(r => {
        if (!text.startsWith(r, i)) return false;
        const end = i + r.length;
        if (end >= upto) return end === text.length && upto > text.length;
        // What follows has to end the word: かいしゃ|いん stays until it's かいしゃいん.
        return !/[ぁ-ゖ]/.test(text[end]) || BEFORE.test(text[end]);
      });
      if (k) {
        const w = dict.get(k);
        out += w;
        if (i + k.length <= upto) caret += w.length - k.length;
        changed.push({ from: k, to: w });
        i += k.length;
      } else {
        out += text[i];
        i++;
      }
    }
    return { text: out, caret, changed };
  }

  const api = { pieces, plain, kana, rubyHtml, parseHint, levelData, insertable, insertAt, charCount, answerKey, hintItems, stem, verbForms, matchForms, hasForm, usedHints, buildKanjiDict, toKanji, LEVELS, STEPS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.Conversation = api;
  if (typeof document === 'undefined') return;

  // ─── State ─────────────────────────────────────────────────────────────────

  function load(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  }

  const TOPICS = global.CONVERSATION_TOPICS || [];
  const GROUPS = global.CONVERSATION_GROUPS || [];
  const settings = Object.assign({ level: 'N5', furigana: true, kanji: true }, load(SETTINGS_KEY, {}));
  if (!LEVELS.includes(settings.level)) settings.level = 'N5';
  const store = Object.assign({ answers: {} }, load(STORE_KEY, {}));
  if (!store.answers || typeof store.answers !== 'object') store.answers = {};

  let topic = null;            // the open question, or null on the list
  let unlocked = new Set();    // hint ids unlocked on this visit ('answer' for the sample)
  let used = new Set();        // hint ids your answer uses
  let fresh = new Set();       // just unlocked by your answer: these get the animation
  let kanjiDict = null;        // for the open question (its hint words come first)
  let autoTimer = null;
  let noteTimer = null;
  let showEnglish = false;
  let saveTimer = null;

  const $ = id => document.getElementById(id);
  const byId = id => TOPICS.find(t => t.id === id);
  const indexOf = t => TOPICS.indexOf(t);
  const written = (t, level) => charCount((store.answers[answerKey(t.id, level)] || {}).text) > 0;

  function speakBtns(markup) {
    return global.Pronounce ? Pronounce.buttonsHtml(kana(markup)) : '';
  }

  // ─── The list ──────────────────────────────────────────────────────────────

  function renderLevels() {
    document.querySelectorAll('.cs-level-btns button').forEach(b => {
      b.setAttribute('aria-pressed', String(b.dataset.level === settings.level));
    });
  }

  function renderTopics() {
    $('cs-topics').innerHTML = GROUPS.map(g => {
      const items = TOPICS.filter(t => t.group === g.id);
      if (!items.length) return '';
      return `<div class="cs-group">
        <div class="cs-group-name">${esc(g.name)} <span lang="ja">${esc(plain(g.ja))}</span></div>
        <div class="cs-group-items">${items.map(t => {
          const d = levelData(t, settings.level);
          const done = written(t, settings.level);
          return `<a class="cs-topic${done ? ' written' : ''}" href="#${esc(t.id)}">
            <span class="cs-topic-ja" lang="ja">${esc(plain(d.q.ja))}</span>
            <span class="cs-topic-en">${esc(d.q.en)}</span>
            <span class="cs-topic-go" aria-hidden="true">${done ? '✓' : '›'}</span>
          </a>`;
        }).join('')}</div>
      </div>`;
    }).join('');
    const n = TOPICS.filter(t => written(t, settings.level)).length;
    $('cs-done').textContent = n ? ` · ${n} answered at ${settings.level}` : '';
  }

  // ─── A question ────────────────────────────────────────────────────────────

  function renderQuestion() {
    const d = levelData(topic, settings.level);
    const group = GROUPS.find(g => g.id === topic.group);
    $('cs-meta').textContent = `${group ? group.name : ''} · ${indexOf(topic) + 1} / ${TOPICS.length}`;
    $('cs-q').innerHTML = `<span class="cs-q-text">${rubyHtml(d.q.ja)}</span>${speakBtns(d.q.ja)}`;
    $('cs-q-en').textContent = d.q.en;
    $('cs-q-en').classList.toggle('hidden', !showEnglish);
    $('cs-en-btn').textContent = showEnglish ? 'Hide English' : 'Show English';
    const saved = store.answers[answerKey(topic.id, settings.level)];
    $('cs-answer').value = saved ? saved.text : '';
    $('cs-saved').textContent = '';
    renderCount();
    spotHints(false);
    renderHints();
    renderSample();
  }

  function renderCount() {
    const n = charCount($('cs-answer').value);
    $('cs-count').textContent = n ? `${n} character${n === 1 ? '' : 's'}` : '';
  }

  function lockedTile(h, id) {
    return `<button class="cs-tile cs-locked" data-unlock="${id}" aria-label="Unlock: ${esc(h.en)}">
      <span class="cs-lock" aria-hidden="true">🔒</span><span class="cs-tile-en">${esc(h.en)}</span>
    </button>`;
  }

  function openTile(h, step) {
    const cls = (used.has(h.id) ? ' cs-used' : '') + (fresh.has(h.id) ? ' cs-pop' : '');
    const badge = used.has(h.id) ? '<span class="cs-used-badge" title="You used this">✓</span>' : '';
    const body = `<span class="cs-chip-ja" lang="ja">${rubyHtml(h.ja)}</span><span class="cs-chip-en">${esc(h.en)}</span>`;
    if (step !== 'grammar') {
      return `<button class="cs-tile cs-chip${cls}" data-insert="${esc(insertable(h.ja))}" title="Add to your answer">${body}${badge || '<span class="cs-chip-add" aria-hidden="true">＋</span>'}</button>`;
    }
    return `<div class="cs-tile cs-grammar${cls}">${badge}
      <div class="cs-grammar-head">${body}</div>
      <div class="cs-grammar-ex"><span lang="ja">${rubyHtml(h.ex)}</span>${speakBtns(h.ex)}</div>
      <div class="cs-grammar-ex-en">${esc(h.exEn)}</div>
    </div>`;
  }

  function renderHints() {
    const d = levelData(topic, settings.level);
    const all = hintItems(d);
    $('cs-hints').innerHTML = STEPS.filter(s => d[s.key].length).map(s => {
      const items = all.filter(h => h.step === s.key);
      const open = items.filter(h => unlocked.has(h.id)).length;
      return `<section class="cs-hint-step cs-hint-${s.key}">
        <div class="cs-hint-title">
          <h4><span aria-hidden="true">${s.icon}</span> ${s.title} <span>${open} / ${items.length}</span></h4>
          ${open < items.length ? `<button class="cs-unlock-all" data-unlock-step="${s.key}">Unlock all</button>` : ''}
        </div>
        <div class="cs-hint-items${s.key === 'grammar' ? ' cs-hint-grammar' : ''}">${items.map(h =>
          unlocked.has(h.id) ? openTile(h, s.key) : lockedTile(h, h.id)).join('')}</div>
      </section>`;
    }).join('');
    const open = all.filter(h => unlocked.has(h.id)).length;
    const n = all.filter(h => used.has(h.id)).length;
    $('cs-unlocked').textContent = `${open} / ${all.length} unlocked` + (n ? ` · ${n} used` : '');
    if (fresh.size) {
      const box = $('cs-unlocked');
      box.classList.remove('cs-bump');
      void box.offsetWidth;
      box.classList.add('cs-bump');
    }
    fresh = new Set();
  }

  function renderSample() {
    const box = $('cs-sample');
    const d = levelData(topic, settings.level);
    if (!unlocked.has('answer')) {
      box.innerHTML = `<button class="cs-sample-locked" data-unlock="answer">
        <span class="cs-lock" aria-hidden="true">🔒</span>
        <span><b>Sample answer · ${settings.level}</b><span>Unlock it when you've written yours, and compare.</span></span>
      </button>`;
      return;
    }
    const mine = $('cs-answer').value.trim();
    box.innerHTML = `<div class="cs-compare">
      <div class="cs-compare-col cs-compare-mine">
        <h4>You wrote <span>${charCount(mine)} characters</span></h4>
        ${mine ? `<p lang="ja">${esc(mine).replace(/\n/g, '<br>')}</p>` : '<p class="cs-empty">Nothing yet — try a sentence or two, then compare.</p>'}
      </div>
      <div class="cs-compare-col cs-compare-sample">
        <h4>Sample answer · ${settings.level} <span>${charCount(plain(d.answer.ja))} characters</span> ${speakBtns(d.answer.ja)}</h4>
        <p lang="ja" class="cs-sample-ja">${rubyHtml(d.answer.ja)}</p>
        <p class="cs-sample-en">${esc(d.answer.en)}</p>
      </div>
      <p class="cs-compare-tip">There's no single right answer. Borrow words, grammar and linking phrases you like — then try rewriting yours.</p>
    </div>`;
  }

  function renderFurigana() {
    document.body.classList.toggle('cs-no-furigana', !settings.furigana);
    $('cs-opt-furigana').checked = settings.furigana;
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  function saveSettings() { save(SETTINGS_KEY, settings); }

  function saveAnswer() {
    clearTimeout(saveTimer);
    saveTimer = null;
    if (!topic) return;
    const key = answerKey(topic.id, settings.level);
    const text = $('cs-answer').value;
    if (text.trim()) store.answers[key] = { text, t: Date.now() };
    else delete store.answers[key];
    save(STORE_KEY, store);
    $('cs-saved').textContent = text.trim() ? 'Saved' : '';
  }

  // Shows the list or a question, from the address: conversation.html#<id>.
  function route() {
    if (saveTimer) saveAnswer();
    const t = byId(decodeURIComponent(location.hash.slice(1)));
    if (t !== topic || !t) { unlocked = new Set(); showEnglish = false; }
    if (t && t !== topic) kanjiDict = null;
    topic = t || null;
    $('screen-chapters').classList.toggle('active', !topic);
    $('screen-conversation').classList.toggle('active', !!topic);
    renderLevels();
    if (topic) {
      document.title = `${plain(levelData(topic, settings.level).q.ja)} – Conversation Starters | Tokidoki`;
      renderQuestion();
    } else {
      document.title = TITLE;
      renderTopics();
    }
    window.scrollTo(0, 0);
  }

  function setLevel(level) {
    if (saveTimer) saveAnswer();
    settings.level = level;
    saveSettings();
    unlocked = new Set();
    kanjiDict = null;
    renderLevels();
    if (topic) renderQuestion();
    else renderTopics();
  }

  // Unlocks the hints your answer uses. With `animate`, newly unlocked ones
  // pop and are named under the answer box.
  function spotHints(animate) {
    const items = hintItems(levelData(topic, settings.level));
    used = new Set(usedHints($('cs-answer').value, items));
    const news = items.filter(h => used.has(h.id) && !unlocked.has(h.id));
    news.forEach(h => unlocked.add(h.id));
    if (!animate) return false;
    news.forEach(h => fresh.add(h.id));
    const names = [...new Set(news.map(h => plain(h.ja)))];
    if (names.length) note(`✨ Unlocked by your answer: ${names.join('、')}`);
    return true;
  }

  function note(text) {
    const el = $('cs-note');
    el.textContent = text;
    el.classList.remove('cs-note-show');
    void el.offsetWidth;
    el.classList.add('cs-note-show');
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => el.classList.remove('cs-note-show'), 3500);
  }

  // With the Kanji switch on: the kana words you've typed past become kanji.
  function convertKanji(final) {
    if (!settings.kanji) return;
    const ta = $('cs-answer');
    if (!kanjiDict) kanjiDict = buildKanjiDict(TOPICS, hintItems(levelData(topic, settings.level)).filter(h => h.step !== 'grammar').map(h => h.ja));
    const caret = final ? ta.value.length + 1 : ta.selectionStart;
    const r = toKanji(ta.value, kanjiDict, caret);
    if (!r.changed.length) return;
    ta.value = r.text;
    if (!final) try { ta.setSelectionRange(r.caret, r.caret); } catch { /* not focused */ }
    note(r.changed.map(c => `${c.from} → ${c.to}`).join('　'));
  }

  function afterTyping(final) {
    convertKanji(final);
    renderCount();
    clearTimeout(autoTimer);
    autoTimer = setTimeout(() => { if (topic && spotHints(true)) renderHints(); }, final ? 0 : 300);
  }

  function insertIntoAnswer(text) {
    const ta = $('cs-answer');
    const r = insertAt(ta.value, ta.selectionStart, ta.selectionEnd, text);
    ta.value = r.value;
    ta.focus({ preventScroll: true });
    try { ta.setSelectionRange(r.caret, r.caret); } catch { /* not focused */ }
    afterTyping(false);
    saveAnswer();
    const flash = $('cs-answer');
    flash.classList.remove('cs-flash');
    void flash.offsetWidth;
    flash.classList.add('cs-flash');
  }

  const TITLE = document.title;

  function init() {
    if (!TOPICS.length) return;
    $('cs-total').textContent = TOPICS.length;

    document.querySelectorAll('.cs-level-btns button').forEach(b => b.addEventListener('click', () => setLevel(b.dataset.level)));
    $('cs-opt-furigana').addEventListener('change', e => { settings.furigana = e.target.checked; saveSettings(); renderFurigana(); });
    $('cs-opt-kanji').checked = settings.kanji;
    $('cs-opt-kanji').addEventListener('change', e => {
      settings.kanji = e.target.checked;
      saveSettings();
      if (settings.kanji && topic) { afterTyping(true); saveAnswer(); }
    });
    $('cs-en-btn').addEventListener('click', () => { showEnglish = !showEnglish; renderQuestion(); });

    const ta = $('cs-answer');
    if (global.Romaji) Romaji.attach(ta);
    ta.addEventListener('input', e => {
      if (!e.isComposing) afterTyping(false);
      $('cs-saved').textContent = '';
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveAnswer, 600);
    });
    ta.addEventListener('compositionend', () => afterTyping(false));
    ta.addEventListener('blur', () => {
      afterTyping(true);
      if (saveTimer) saveAnswer();
    });

    $('screen-conversation').addEventListener('click', e => {
      const one = e.target.closest('[data-unlock]');
      if (one) {
        unlocked.add(one.dataset.unlock);
        if (one.dataset.unlock === 'answer') { saveAnswer(); renderSample(); } else renderHints();
        return;
      }
      const step = e.target.closest('[data-unlock-step]');
      if (step) {
        hintItems(levelData(topic, settings.level)).filter(h => h.step === step.dataset.unlockStep).forEach(h => unlocked.add(h.id));
        renderHints();
        return;
      }
      const chip = e.target.closest('[data-insert]');
      if (chip) insertIntoAnswer(chip.dataset.insert);
    });
    $('cs-clear').addEventListener('click', () => {
      if (!ta.value.trim() || confirm('Clear what you wrote for this question?')) {
        ta.value = '';
        renderCount();
        saveAnswer();
        if (unlocked.has('answer')) renderSample();
      }
    });
    const go = t => { location.hash = t.id; };
    $('cs-prev').addEventListener('click', () => go(TOPICS[(indexOf(topic) - 1 + TOPICS.length) % TOPICS.length]));
    $('cs-next').addEventListener('click', () => go(TOPICS[(indexOf(topic) + 1) % TOPICS.length]));
    $('cs-random').addEventListener('click', () => {
      const others = TOPICS.filter(t => t !== topic);
      go(others[Math.floor(Math.random() * others.length)]);
    });
    $('cs-random-list').addEventListener('click', () => go(TOPICS[Math.floor(Math.random() * TOPICS.length)]));
    window.addEventListener('hashchange', route);
    window.addEventListener('pagehide', () => { if (saveTimer) saveAnswer(); });

    renderFurigana();
    route();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : globalThis);
