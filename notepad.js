// Notepad (notepad.html): a small Japanese input method. Type romaji — or an
// English word — and pick hiragana, katakana or a kanji spelling from a
// candidate list; committed text is shown with furigana above the kanji.
//
// The dictionary is built from the word lists the site already ships
// (vocabulary-data.js, stories-data.js, verbs.js), so suggestions cover
// roughly JLPT N5–N3. Longer kana runs ("watashihagakuseidesu") are split
// into words with a small cost-based segmenter, and verbs / い-adjectives are
// matched by their stem so conjugated forms (たべました → 食べました) work.
(function (global) {
  'use strict';

  const Romaji = global.Romaji || (typeof require !== 'undefined' ? require('./romaji.js') : null);

  const KANJI = '㐀-䶿一-鿿々〆ヶ';
  const HAS_KANJI = new RegExp('[' + KANJI + ']');
  const KANJI_SPLIT = new RegExp('[' + KANJI + ']+|[^' + KANJI + ']+', 'g');
  const KANA_ONLY = /^[ぁ-ゖァ-ヺー]+$/;
  const HIRAGANA_CHAR = /[ぁ-ゖー]/;

  const toHira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
  const toKata = s => s.replace(/[ぁ-ゖ]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60));
  const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Grammar words written in kana; cheap for the segmenter, and typing one on
  // its own suggests the kana before any same-sounding kanji (は before 歯).
  const PARTICLES = new Set([
    'は', 'が', 'を', 'に', 'へ', 'で', 'と', 'も', 'の', 'か', 'ね', 'よ', 'や', 'な', 'わ', 'ぞ',
    'から', 'まで', 'より', 'けど', 'けれど', 'ので', 'のに', 'って', 'だけ', 'しか', 'ほど', 'など',
    'です', 'でした', 'でしょう', 'だ', 'だった',
    'する', 'します', 'しました', 'して', 'した', 'しない', 'ある', 'あります', 'いる', 'います',
    'ない', 'ください', 'くださ', 'じゃ', 'では', 'ではない', 'よね', 'かな', 'こと', 'もの',
  ]);

  // Conjugated endings that may follow a verb or い-adjective stem. A godan
  // verb first takes a kana from its own row (飲 + み + ました, 飲 + ん + だ);
  // an ichidan verb's stem (食べ) takes the ending directly.
  const ENDINGS = new Set([
    '', 'ます', 'ました', 'ません', 'ませんでした', 'ましょう', 'ませんか', 'ましょうか', 'ましょ',
    'たい', 'たくない', 'たかった', 'たいです', 'ない', 'なかった', 'なくて', 'ないで', 'なきゃ', 'なければ',
    'て', 'た', 'てる', 'てた', 'てい', 'ている', 'ていた', 'ています', 'ていました', 'ていません',
    'てしまう', 'てしまった', 'ちゃう', 'ちゃった', 'てください', 'てくれる', 'てもいい', 'ては',
    'で', 'だ', 'でいる', 'でいます', 'でいました', 'でください', 'じゃう', 'じゃった',
    'る', 'れる', 'られる', 'せる', 'させる', 'よう', 'う', 'ろ', 'ば', 'れば', 'ず', 'そう', 'すぎる',
    'たら', 'だら', 'たり', 'だり', 'ながら', 'く', 'くない', 'くなかった', 'くて', 'った', 'ければ', 'さ',
  ]);
  const ROWS = {
    'う': 'わいうえおっ', 'く': 'かきくけこい', 'ぐ': 'がぎぐげごい', 'す': 'さしすせそ', 'つ': 'たちつてとっ',
    'ぬ': 'なにぬねのん', 'ぶ': 'ばびぶべぼん', 'む': 'まみむめもん', 'る': 'らりるれろっ', 'い': 'いくかけさすそ',
  };
  ROWS['行く'] = 'かきくけこっ'; // 行って, not 行いて
  const IE_ROW = 'いきぎしじちぢにひびぴみりえけげせぜてでねへべぺめれ';
  // Godan verbs that look ichidan (an い/え-row kana before る).
  const GODAN_RU = new Set(['かえる', 'はいる', 'はしる', 'しる', 'へる', 'しゃべる', 'すべる', 'ける',
    'かぎる', 'にぎる', 'まいる', 'まじる', 'ちる', 'あせる', 'いじる', 'ひねる']);

  // Whether `tail` can follow `stem` (built from a verb or い-adjective).
  function validTail(tail, stem) {
    if (!tail) return false;
    if (stem.ichidan) return ENDINGS.has(tail);
    const row = ROWS[stem.last];
    if (!row || !row.includes(tail[0])) return false;
    const rest = tail.slice(1);
    return ENDINGS.has(rest) || /^ぎ(る|た|ます)$/.test(rest);
  }

  // Splits a word into furigana pieces: 食べる/たべる → 食[た] べる. Kana runs
  // in the spelling anchor the match; if the reading doesn't fit, the whole
  // word carries one reading.
  function align(text, reading) {
    if (!HAS_KANJI.test(text)) return [{ t: text }];
    const parts = text.match(KANJI_SPLIT);
    const re = new RegExp('^' + parts.map(p =>
      HAS_KANJI.test(p) ? '(.+?)' : '(' + escapeRe(toHira(p)) + ')').join('') + '$');
    const m = toHira(reading).match(re);
    if (!m) return [{ t: text, r: reading }];
    return parts.map((p, i) => HAS_KANJI.test(p) ? { t: p, r: m[i + 1] } : { t: p });
  }

  // Verb class from the word lists' type labels ('ru' / 'u' in verbs.js,
  // 'ichidan verb' / 'う-verb' in the story glossary); null when unknown.
  function ichidanFromType(type) {
    if (!type) return null;
    if (/^ru$|ichidan/.test(type)) return true;
    if (/^u$|う-verb/.test(type)) return false;
    return null;
  }

  const cleanKey = s => String(s).replace(/\(.*?\)|（.*?）/g, '').trim();

  // Builds the lookup tables. `sources` defaults to the globals the site's
  // data files define; tests pass them in directly.
  function buildDictionary(sources) {
    const src = sources || {
      vocab: global.VOCAB_DATA,
      glossary: global.STORY_GLOSSARY,
      verbs: typeof GENKI_VERBS !== 'undefined' ? GENKI_VERBS : null, // eslint-disable-line no-undef
      adjectives: typeof GENKI_ADJECTIVES !== 'undefined' ? GENKI_ADJECTIVES : null, // eslint-disable-line no-undef
    };
    const entries = [];
    const seen = new Map();
    function add(text, reading, meaning, rank, type) {
      text = cleanKey(text);
      reading = toHira(cleanKey(reading));
      if (!text || !reading || /[～~]/.test(text + reading)) return;
      if (!KANA_ONLY.test(reading)) return;
      // Kana-only words are filed under their spelling: the glossary gives は
      // the pronunciation わ, but you type it as "ha".
      if (!HAS_KANJI.test(text)) {
        if (!KANA_ONLY.test(text)) return;
        reading = toHira(text);
      }
      const key = text + '\t' + reading;
      const prev = seen.get(key);
      if (prev) {
        prev.hits++;
        if (rank < prev.rank) prev.rank = rank;
        if (!prev.meaning && meaning) prev.meaning = meaning;
        if (prev.ichidan == null) prev.ichidan = ichidanFromType(type);
        return;
      }
      const e = { text, reading, meaning: meaning || '', rank, hits: 1, ichidan: ichidanFromType(type), pieces: align(text, reading) };
      seen.set(key, e);
      entries.push(e);
    }

    if (src.verbs) src.verbs.forEach(v => add(v.kanji, v.reading, v.meaning, 0, v.type));
    if (src.adjectives) src.adjectives.forEach(a => add(a.kanji.replace(/な$/, ''), a.reading.replace(/な$/, ''), a.meaning, 0));
    if (src.vocab) {
      ['n5', 'n4', 'n3'].forEach((lvl, i) =>
        (src.vocab[lvl] || []).forEach(w => add(w.kanji, w.kana, w.meaning, i)));
    }
    if (src.glossary) {
      Object.keys(src.glossary).forEach(k => {
        const [reading, meaning, type] = src.glossary[k];
        add(k, reading, meaning, 1, type);
      });
    }

    const byReading = new Map();
    const stems = new Map();
    const push = (map, k, v) => { if (!map.has(k)) map.set(k, []); map.get(k).push(v); };
    entries.forEach(e => {
      push(byReading, e.reading, e);
      // Verbs and い-adjectives with okurigana: drop the last kana so any
      // conjugated ending can follow (飲む → 飲 + みました).
      const last = e.text.slice(-1);
      if (HAS_KANJI.test(e.text) && last === e.reading.slice(-1) && 'うくぐすつぬぶむるい'.includes(last)
          && e.reading.length > 1) {
        const stem = { text: e.text.slice(0, -1), reading: e.reading.slice(0, -1), last, meaning: e.meaning, rank: e.rank, hits: e.hits };
        if (/行く$/.test(e.text)) stem.last = '行く';
        if (last === 'る') {
          stem.ichidan = e.ichidan != null ? e.ichidan
            : IE_ROW.includes(e.reading.slice(-2, -1)) && !GODAN_RU.has(e.reading);
        }
        stem.pieces = align(stem.text, stem.reading);
        push(stems, stem.reading, stem);
      }
      if (e.text === '来る') {
        ['き', 'こ'].forEach(r => push(stems, r, { text: '来', reading: r, last: '', ichidan: true, meaning: e.meaning, rank: 0, hits: e.hits, pieces: [{ t: '来', r }] }));
      }
    });
    // Easier words first; among equals, the one more of the lists share.
    const byRank = (a, b) => a.rank - b.rank || b.hits - a.hits;
    byReading.forEach(list => list.sort(byRank));
    stems.forEach(list => list.sort(byRank));

    // English lookup: each comma/semicolon-separated sense, without "to"/"a"
    // and parentheses, so "eat" finds "To eat".
    entries.forEach(e => {
      e.senses = e.meaning.toLowerCase().split(/[,;/]/)
        .map(s => s.replace(/\(.*?\)/g, '').replace(/[!?."“”]/g, '').replace(/^\s*(to|a|an|the)\s+/, '').trim())
        .filter(Boolean);
    });

    return { entries, byReading, stems };
  }

  // Easier and more widely listed words cost less.
  const familiarity = e => e.rank * 0.3 - 0.1 * (e.hits - 1);
  const stemCost = (st, tailLen) => 1 + (st.reading.length === 1 ? 0.2 : 0) + 0.1 * tailLen + familiarity(st);

  function wordCost(e) {
    let cost = 1 + familiarity(e);
    if (e.reading.length === 1 && HAS_KANJI.test(e.text)) cost = 3.2; // 木, 手, 目: only when typed alone
    else if (!HAS_KANJI.test(e.text) && e.text !== toHira(e.text)) cost += 0.25; // katakana words
    return cost;
  }

  // Splits a kana string into words, picking the cheapest path: dictionary
  // words cost ~1, particles less, a stem plus its conjugated ending a bit
  // more, and an unknown kana 3. Returns furigana pieces.
  function segment(kana, dict) {
    const n = kana.length;
    const best = new Array(n + 1).fill(Infinity);
    const back = new Array(n + 1);
    best[0] = 0;
    const relax = (i, j, cost, pieces) => {
      if (best[i] + cost < best[j]) { best[j] = best[i] + cost; back[j] = { i, pieces }; }
    };
    for (let i = 0; i < n; i++) {
      if (best[i] === Infinity) continue;
      relax(i, i + 1, 3, [{ t: kana[i] }]);
      for (let len = 1; len <= Math.min(12, n - i); len++) {
        const s = kana.substr(i, len);
        if (PARTICLES.has(s)) relax(i, i + len, 0.6, [{ t: s }]);
        const words = dict.byReading.get(s);
        if (words) relax(i, i + len, wordCost(words[0]), words[0].pieces);
        const stems = dict.stems.get(s);
        if (stems) {
          for (let tail = 1; tail <= 10 && i + len + tail <= n; tail++) {
            const t = kana.substr(i + len, tail);
            if (!HIRAGANA_CHAR.test(t.slice(-1))) break;
                        let st = null;
            stems.forEach(x => { if (validTail(t, x) && (!st || stemCost(x, tail) < stemCost(st, tail))) st = x; });
            if (st) relax(i, i + len + tail, stemCost(st, tail), st.pieces.concat({ t }));
          }
        }
      }
    }
    const out = [];
    for (let j = n; j > 0; j = back[j].i) out.unshift(...back[j].pieces);
    return mergePieces(out);
  }

  // Joins neighbouring kana-only pieces so the document stays tidy.
  function mergePieces(pieces) {
    const out = [];
    pieces.forEach(p => {
      const prev = out[out.length - 1];
      if (prev && !prev.r && !p.r && prev.t !== '\n' && p.t !== '\n') prev.t += p.t;
      else out.push({ ...p });
    });
    return out;
  }

  // Dictionary entries whose English meaning matches `query`.
  function englishMatches(query, dict, limit) {
    const q = query.toLowerCase().trim().replace(/^(to|a|an|the)\s+/, '');
    if (q.length < 2) return [];
    const wordRe = new RegExp('(^|[^a-z])' + escapeRe(q) + '($|[^a-z])');
    const hits = [];
    dict.entries.forEach(e => {
      let score = Infinity;
      e.senses.forEach((s, i) => {
        let sc = Infinity;
        if (s === q) sc = i === 0 ? 0 : 1;
        else if (wordRe.test(s)) sc = 2 + s.length / 100;
        if (sc < score) score = sc;
      });
      if (score < Infinity) hits.push({ e, score: score + e.rank * 0.3 + (HAS_KANJI.test(e.text) ? 0 : 0.2) });
    });
    hits.sort((a, b) => a.score - b.score);
    return hits.slice(0, limit);
  }

  const plain = (t, hint) => ({ pieces: [{ t }], text: t, hint: hint || '' });
  const fromPieces = (pieces, hint) => ({ pieces, text: pieces.map(p => p.t).join(''), hint: hint || '' });

  // Candidate spellings for what's in the input box, best first.
  //   opts.katakana — prefer katakana over hiragana for plain kana
  //   opts.kanaFirst — prefer kana over kanji suggestions
  function candidates(raw, dict, opts) {
    opts = opts || {};
    const list = [];
    const seen = new Set();
    const add = c => { if (c && c.text && !seen.has(c.text)) { seen.add(c.text); list.push(c); } };
    if (!raw) return list;

    const converted = Romaji ? Romaji.toHiragana(raw, true) : raw;
    const english = /^[a-z][a-z' -]*$/i.test(raw.trim()) ? englishMatches(raw, dict, 8) : [];
    const englishCands = english.map(h => fromPieces(h.e.pieces, h.e.meaning));

    if (!KANA_ONLY.test(converted)) {
      // Not valid romaji ("cat", "eat"): English lookups lead.
      englishCands.forEach(add);
      add(plain(raw));
      return list;
    }

    const hira = toHira(converted);
    const kana = opts.katakana ? toKata(hira) : hira;
    const exact = dict.byReading.get(hira) || [];
    const kanaFirst = opts.kanaFirst || opts.katakana || PARTICLES.has(hira) ||
      exact.some(e => !HAS_KANJI.test(e.text) && e.text === hira);

    // Valid romaji that's really an English word ("house" → ほうせ): a close
    // English match beats a reading nothing in the dictionary has.
    if (!exact.length) english.filter(h => h.score < 2).forEach(h => add(fromPieces(h.e.pieces, h.e.meaning)));
    if (kanaFirst) add(plain(kana));
    const seg = segment(hira, dict);
    if (!exact.length && seg.some(p => p.r)) add(fromPieces(seg));
    exact.forEach(e => add(fromPieces(e.pieces, e.meaning)));
    if (exact.length && seg.length > 1 && seg.some(p => p.r)) add(fromPieces(seg));

    // Conjugated forms, most likely first.
    const conj = [];
    for (let len = hira.length - 1; len >= 1; len--) {
      const tail = hira.slice(len);
      (dict.stems.get(hira.slice(0, len)) || []).forEach(st => {
        if (validTail(tail, st)) conj.push({ st, tail, cost: stemCost(st, tail.length) });
      });
    }
    conj.sort((a, b) => a.cost - b.cost).slice(0, 6)
      .forEach(c => add(fromPieces(c.st.pieces.concat({ t: c.tail }), c.st.meaning)));

    add(plain(hira));
    add(plain(toKata(hira)));
    englishCands.forEach(add);
    return list;
  }

  const api = { buildDictionary, candidates, segment, align, englishMatches, mergePieces, toHira, toKata };
  global.Notepad = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;

  // ─── Page UI ────────────────────────────────────────────────────────────────

  if (typeof document === 'undefined') return;

  const STORAGE_KEY = 'tokidoki-notepad';
  const PUNCT = { '.': '。', ',': '、', '?': '？', '!': '！', '(': '（', ')': '）', '[': '「', ']': '」', ':': '：', '~': '〜' };

  function initPage() {
    const paper = document.getElementById('notepad-paper');
    const input = document.getElementById('notepad-input');
    if (!paper || !input) return;
    const candBox = document.getElementById('notepad-candidates');
    const furiToggle = document.getElementById('notepad-furigana');
    const kataToggle = document.getElementById('notepad-katakana');
    const kanaToggle = document.getElementById('notepad-kana-first');
    const status = document.getElementById('notepad-status');

    let dict = null;
    const getDict = () => dict || (dict = buildDictionary());

    const load = (k, fallback) => { try { const v = localStorage.getItem(k); return v == null ? fallback : JSON.parse(v); } catch { return fallback; } };
    const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } };

    let doc = load(STORAGE_KEY, []);
    if (!Array.isArray(doc)) doc = [];
    let cands = [];
    let candsFor = '';
    let sel = 0;

    furiToggle.checked = load(STORAGE_KEY + '-furigana', true);
    kataToggle.checked = load(STORAGE_KEY + '-katakana', false);
    kanaToggle.checked = load(STORAGE_KEY + '-kana-first', false);

    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const piecesHtml = pieces => pieces.map(p => {
      if (p.t === '\n') return '<br>';
      if (p.r && HAS_KANJI.test(p.t)) return `<ruby>${esc(p.t)}<rp>(</rp><rt>${esc(p.r)}</rt><rp>)</rp></ruby>`;
      return esc(p.t);
    }).join('');

    function renderPaper() {
      paper.classList.toggle('no-furigana', !furiToggle.checked);
      const pending = cands[sel];
      const composing = input.value
        ? `<span class="notepad-composing">${pending ? piecesHtml(pending.pieces) : esc(input.value)}</span>`
        : '';
      const empty = !doc.length && !input.value;
      paper.innerHTML = (empty ? '<span class="notepad-placeholder">Start typing below…</span>' : piecesHtml(doc))
        + composing + '<span class="notepad-caret" aria-hidden="true"></span>';
    }

    function renderCandidates() {
      if (!cands.length) { candBox.innerHTML = ''; candBox.classList.add('hidden'); return; }
      candBox.classList.remove('hidden');
      candBox.innerHTML = cands.map((c, i) => `
        <button type="button" class="notepad-cand${i === sel ? ' selected' : ''}" data-i="${i}" role="option" aria-selected="${i === sel}">
          <span class="notepad-cand-num">${i < 9 ? i + 1 : ''}</span>
          <span class="notepad-cand-text" lang="ja">${piecesHtml(c.pieces)}</span>
          ${c.hint ? `<span class="notepad-cand-hint">${esc(c.hint)}</span>` : ''}
        </button>`).join('');
      const selEl = candBox.querySelector('.selected');
      if (selEl && selEl.scrollIntoView) selEl.scrollIntoView({ block: 'nearest' });
    }

    function refresh() {
      if (input.value === candsFor && cands.length) { renderCandidates(); renderPaper(); return; }
      candsFor = input.value;
      cands = candidates(input.value, getDict(), { katakana: kataToggle.checked, kanaFirst: kanaToggle.checked });
      sel = 0;
      renderCandidates();
      renderPaper();
    }

    function persist() { save(STORAGE_KEY, doc); }

    function append(pieces) {
      doc = mergePieces(doc.concat(pieces));
      persist();
    }

    function commit(i) {
      const c = cands[i == null ? sel : i];
      if (c) append(c.pieces);
      input.value = '';
      refresh();
    }

    function setSel(i) {
      if (!cands.length) return;
      sel = (i + cands.length) % cands.length;
      renderCandidates();
      renderPaper();
    }

    function deleteBack() {
      const last = doc[doc.length - 1];
      if (!last) return;
      if (last.r || last.t.length <= 1) doc.pop();
      else last.t = last.t.slice(0, -1);
      persist();
      renderPaper();
    }

    input.addEventListener('input', (e) => {
      if (e.isComposing) { renderPaper(); return; }
      const v = input.value;
      const lastCh = v.slice(-1);
      if (lastCh === ' ' || lastCh === '　') {
        // Space commits the highlighted candidate; on its own it's a space.
        input.value = v.slice(0, -1);
        if (input.value.trim()) { refresh(); commit(); } else { input.value = ''; append([{ t: '　' }]); refresh(); }
        return;
      }
      if (PUNCT[lastCh]) {
        input.value = v.slice(0, -1);
        if (input.value) { refresh(); commit(); }
        append([{ t: PUNCT[lastCh] }]);
        refresh();
        return;
      }
      refresh();
    });

    input.addEventListener('keydown', (e) => {
      if (e.isComposing || e.keyCode === 229) return;
      const hasText = input.value.length > 0;
      if (e.key === 'Enter') {
        e.preventDefault();
        if (hasText) commit(); else { append([{ t: '\n' }]); renderPaper(); }
      } else if (hasText && (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey))) {
        e.preventDefault(); setSel(sel + 1);
      } else if (hasText && (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey))) {
        e.preventDefault(); setSel(sel - 1);
      } else if (hasText && /^[1-9]$/.test(e.key) && cands.length >= Number(e.key) && !/^\d+$/.test(input.value)) {
        e.preventDefault(); commit(Number(e.key) - 1);
      } else if (e.key === 'Escape') {
        if (hasText) { e.preventDefault(); input.value = ''; refresh(); }
      } else if (e.key === 'Backspace' && !hasText) {
        e.preventDefault(); deleteBack();
      }
    });

    input.addEventListener('compositionend', refresh);

    candBox.addEventListener('mousedown', e => e.preventDefault()); // keep focus in the input
    candBox.addEventListener('click', (e) => {
      const btn = e.target.closest('.notepad-cand');
      if (btn) { commit(Number(btn.dataset.i)); input.focus(); }
    });
    paper.addEventListener('click', () => input.focus());

    [[furiToggle, '-furigana'], [kataToggle, '-katakana'], [kanaToggle, '-kana-first']].forEach(([el, suffix]) => {
      el.addEventListener('change', () => { save(STORAGE_KEY + suffix, el.checked); candsFor = null; refresh(); });
    });

    const plainText = () => doc.map(p => p.t).join('');
    const bracketText = () => doc.map(p => (p.r && HAS_KANJI.test(p.t) ? `${p.t}(${p.r})` : p.t)).join('');
    function copy(text, label) {
      const done = () => { status.textContent = `Copied ${label}`; setTimeout(() => { status.textContent = ''; }, 2000); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, () => { status.textContent = 'Copy failed'; });
      } else {
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch { status.textContent = 'Copy failed'; }
        ta.remove();
      }
    }
    document.getElementById('btn-notepad-copy').addEventListener('click', () => copy(plainText(), 'text'));
    document.getElementById('btn-notepad-copy-furigana').addEventListener('click', () => copy(bracketText(), 'with readings'));
    document.getElementById('btn-notepad-clear').addEventListener('click', () => {
      if (doc.length && !confirm('Clear the notepad?')) return;
      doc = []; persist(); input.value = ''; refresh(); input.focus();
    });

    refresh();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPage);
  else initPage();
})(typeof window !== 'undefined' ? window : globalThis);
