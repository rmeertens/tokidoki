// Conversation starters (conversation.html): pick a question from the list
// and it opens on its own page (conversation.html#<id>), where you write a
// few sentences in Japanese. Every hint is there as a locked tile — words to
// talk about, verbs, grammar, a way to begin, the sample answer — showing
// only its English until you unlock it. A hint also unlocks by itself, with
// a little pop, once your answer uses it, and with the Kanji switch on the
// kana words you type turn into kanji. Hints and answers differ per JLPT
// level.
//
// Logged in with a Claude API key in their account, people can also ask
// Claude for feedback on what they wrote (claude-feedback.js); the latest
// feedback on each answer is kept with it.
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
      key: topic.id + ':' + level,
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
    const lemmas = (global.CONVERSATION_WORDS || {}).hints || {};
    return STEPS.flatMap(s => d[s.key].map((h, i) => {
      const id = s.key + '-' + i;
      const item = Object.assign({ id, step: s.key }, h);
      const l = d.key && lemmas[d.key + ':' + id];
      if (l) item.lemmas = l;
      return item;
    }));
  }

  // ─── Spotting hints in your answer ─────────────────────────────────────────
  //
  // A hint unlocks by itself once your answer uses it. Each hint gives a few
  // "forms" — lists of fragments that must appear in order — in kanji and in
  // kana. Verbs and adjectives also match by the stems their forms share
  // (stems() below), and patterns split at their 〜 / A / B
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

  // Every stem the forms of a word share, so any of them can be spotted:
  // 明るい → 明る (明るくて, 明るかった); 泳ぎました → 泳ぎ, 泳い (泳いで);
  // 帰りました → 帰っ (帰って); 澄む → 澄み, 澄ん (澄んで); 年をとる →
  // 年をとっ (年をとったら); 勉強します → 勉強し. `inflects` is false for
  // words that don't conjugate (洗濯 stays whole).
  const I_STEM = { う: 'い', く: 'き', ぐ: 'ぎ', す: 'し', つ: 'ち', ぬ: 'に', ぶ: 'び', む: 'み', る: 'り' };
  const TE_STEM = { い: 'っ', き: 'い', ぎ: 'い', し: 'し', ち: 'っ', に: 'ん', び: 'ん', み: 'ん', り: 'っ' };
  function stems(word, inflects = true, isGodan = null) {
    const out = new Set([word]);
    const s = stem(word, 1, inflects);
    out.add(s);
    if (!inflects) return [...out];
    const end = POLITE.find(e => word.endsWith(e) && word.length - e.length >= 1);
    const w = end ? word.slice(0, -end.length) : word;
    const last = w.slice(-1);
    const body = w.slice(0, -1);
    if (w.endsWith('する') && w.length > 2) { out.add(w.slice(0, -2) + 'し'); out.add(w.slice(0, -2)); }
    else if (end && last === 'し' && new RegExp('[' + KANJI + ']{2}$').test(body)) out.add(body); // 勉強します → 勉強 (not 話します → 話)
    // The plain forms of a polite one: ています → ている, ていました → ていた,
    // られました → られた, ません → ない (ichidan-style, and godan by the
    // stem's last kana: 行きます → 行く, 行きました → 行った).
    const U = { い: 'う', き: 'く', ぎ: 'ぐ', し: 'す', ち: 'つ', に: 'ぬ', び: 'ぶ', み: 'む', り: 'る' };
    const A = { い: 'わ', き: 'か', ぎ: 'が', し: 'さ', ち: 'た', に: 'な', び: 'ば', み: 'ま', り: 'ら' };
    // Godan changes only for a real verb stem (泳ぎ, 読み: kanji, then one
    // kana) — not for a pattern's own kana (てき, てい).
    // The helper verbs in patterns count too: 〜てしまいました → てしまった.
    // In kana (かえります) there's no kanji to tell, so the kanji spelling's
    // answer is passed in as isGodan.
    const godan = !!U[last] && (isGodan != null ? isGodan : KANJI_CHAR.test(body.slice(-1)) || /(しまい|もらい|おき|あり)$/.test(w));
    const teStem = /行$/.test(body) && last === 'き' ? 'っ' : TE_STEM[last];
    // Any ます-stem takes these (食べます → 食べません, たべたい).
    if (/^ま(す|した|せん|せんでした)$/.test(end || '') && Array.from(w).length >= 2) ['ます', 'ました', 'ません', 'たい', 'ましょう'].forEach(e => out.add(w + e));
    if (end === 'ます') { out.add(w + 'る'); if (godan) out.add(body + U[last]); }
    if (end === 'ました') { out.add(w + 'た'); if (godan) out.add(body + teStem + (teStem === 'ん' || (teStem === 'い' && last === 'ぎ') ? 'だ' : 'た')); }
    if (end === 'ません') { out.add(w + 'ない'); if (godan) out.add(body + A[last] + 'ない'); }
    if (end === 'ませんでした') out.add(w + 'なかった');
    if (last === 'い' && body && (!end || end === 'です')) out.add(body);                // 明るい, 小さいです (not います)
    if (godan) out.add(body + teStem);                                                    // 泳ぎ → 泳い
    if (!end && I_STEM[last] && body) {                                                  // 澄む → 澄み, 澄ん
      out.add(body + I_STEM[last]);
      const te = /^行/.test(word) ? 'っ' : { う: 'っ', つ: 'っ', る: 'っ', む: 'ん', ぶ: 'ん', ぬ: 'ん', く: 'い', ぐ: 'い', す: 'し' }[last];
      out.add(body + te);
    }
    return [...out].filter(x => x);
  }

  // Long enough to mean something on its own: any kanji, katakana of two or
  // more, hiragana of three or more (two for grammar, and two for a word
  // that stands on its own: まず, うち — see hasForm).
  function meaningful(frags, grammar, bounded) {
    const all = frags.join('');
    if (!all) return false;
    if (KANJI_CHAR.test(all)) return true;
    return Array.from(all).length >= (grammar || bounded || !HIRA_RE.test(all) ? 2 : 3);
  }

  const PUNCT = /[、。,.!?！？「」]/g;

  // Short enough to turn up inside other words: three kana or fewer, or a
  // stem of two (かい-ません, か-った, き-ました). Longer ones (れんしゅう) don't.
  const ENDINGS = /(ませんでした|ました|ません|ましょう|ます|でした|です|たい|って|んで|いて|して|った|んだ|いた|した|ない|る|た|て)$/;
  const shortKana = w => Array.from(w).length <= 3 || Array.from(w.replace(ENDINGS, '')).length <= 2;

  function matchForms(h, step) {
    const grammar = step === 'grammar' || /[〜~A-Z]/.test(h.ja);
    const p = plain(h.ja);
    // Conjugates: a verb, or a word written with kanji and kana after it (明るい, 年をとる).
    const inflects = step !== 'words' || (KANJI_CHAR.test(p) && /[ぁ-ゖ]$/.test(p));
    const out = [];
    const push = (f, bounded) => {
      if (!meaningful(f, grammar, bounded) || out.some(o => o.join('|') === f.join('|'))) return;
      if (bounded) f.bounded = true;
      // A lone kanji word (犬, 本) mustn't be part of another word; a
      // pattern's (〜派, 〜歳) is meant to follow one.
      if (!grammar) f.lone = true;
      // A word in kana has to start a word (after a space, punctuation or a
      // particle): かった isn't 買った in 面白かった, nor かいません in しかいません.
      if (!grammar && f.length === 1 && HIRA_RE.test(f[0]) && shortKana(f[0])) f.edge = true;
      out.push(f);
    };
    // Whether the word is a godan verb, from its kanji spelling (帰ります: a
    // kanji, then り), so its kana spelling (かえります) conjugates the same.
    const lastFrag = p.split(/[〜~A-Z\s/]+/).filter(Boolean).pop() || '';
    const masu = /(ます|ました|ません)$/.exec(lastFrag);
    const stemEnd = masu ? lastFrag.slice(0, -masu[0].length) : lastFrag;
    const isGodan = /[いきぎしちにびみり]$/.test(stemEnd) && (KANJI_CHAR.test(stemEnd.slice(-2, -1)) || /(しまい|もらい|おき|あり)$/.test(stemEnd));
    [p, kana(h.ja)].forEach(text => {
      addForms(text);
      // Without its punctuation too, as long as every piece is still a real
      // piece (は〜で、は… stripped to は…で…は would match anything).
      const bare = text.replace(PUNCT, '');
      if (bare !== text && bare.split(/[〜~A-Z\s/]+/).filter(Boolean).every(f => Array.from(f).length >= 2 || KANJI_CHAR.test(f))) addForms(bare);
    });
    return out;

    function addForms(text) {
      const frags = text.replace(/\([^)]*\)/g, '〜').split(/[〜~A-Z\s/]+/).filter(Boolean)
        .filter((f, i, all) => all.length === 1 || !/^(だ|です)$/.test(f)); // まさに〜だ
      if (!frags.length) return;
      const lastI = frags.length - 1;
      // A short kana word on its own (まず, うち) has to stand alone in the answer.
      const short = !grammar && frags.length === 1 && HIRA_RE.test(frags[0]) && Array.from(frags[0]).length === 2;
      stems(frags[lastI], inflects, isGodan).forEach(end => {
        // A pattern cut down to a tiny stem matches anything (〜日でした → 日,
        // 〜てきました → てい): keep 3 characters, or 2 with a kanji.
        const n = Array.from(end).length;
        if (grammar && end !== frags[lastI] && !(n >= 3 || (n >= 2 && KANJI_CHAR.test(end)))) return;
        const f = frags.slice(0, lastI).concat(end);
        push(f, short);
        if (grammar) {
          // 〜てほしい also comes as 読んでほしい, 〜たもの as 遊んだもの.
          push(f.map((x, i) => (i === 0 ? x.replace(/^て/, 'で').replace(/^た/, 'だ') : x)));
          // 〜が好きです also counts as 音楽も好きです, and 〜と言われます as
          // …とよく言われます (a word between the particle and the rest).
          const lead = /^[がをにはもでと]/.exec(f[0]);
          if (lead && f[0].length > 1) {
            const rest = f[0].slice(1);
            if (KANJI_CHAR.test(rest) || Array.from(rest).length >= 3) {
              if (lead[0] !== 'と') push([rest].concat(f.slice(1)));
              push([lead[0], rest].concat(f.slice(1)));
            }
          }
        }
      });
    }
  }

  // Whether `answer` contains the fragments in order. A lone kanji (犬, 本)
  // must stand on its own, so 本 doesn't match inside 日本 — though a number
  // may sit next to it (朝七時, 五千円). A short kana word (まず) must too.
  const NUMERAL = /[一二三四五六七八九十百千万何数半毎0-9０-９]/;
  const lonely = (answer, i, len) => {
    const prev = answer[i - 1] || '', next = answer[i + len] || '';
    return (!KANJI_CHAR.test(prev) || NUMERAL.test(prev)) && (!KANJI_CHAR.test(next) || NUMERAL.test(next));
  };
  // Starts after the start, punctuation or a particle — not straight after
  // a kanji (くに isn't 国 in 近くに) — and ends before anything but more kana.
  const standsAlone = (answer, i, len) => {
    const prev = answer[i - 1] || '', next = answer[i + len] || '';
    const before = !prev || /[、。,.!?！？「」\s]/.test(prev) || PARTICLE.test(prev);
    const after = !next || !/[ぁ-ゖ]/.test(next) || PARTICLE.test(next);
    return before && after;
  };
  // One kanji and kana (習い, 切る) can't be the end of a longer word
  // (見習い, 裏切る): no kanji right before it, unless a number.
  const ONE_KANJI_LEAD = new RegExp('^[' + KANJI + '](?![' + KANJI + '])');
  const startsWord = (answer, i) => {
    const prev = answer[i - 1] || '';
    // Particles, but not や: it's more often inside a word (やすくなる).
    return !prev || /[、。,.!?！？「」\s]/.test(prev) || /[はがをにでともへの]/.test(prev);
  };
  function hasForm(answer, frags) {
    let from = 0;
    for (const f of frags) {
      let i = answer.indexOf(f, from);
      if (frags.lone && frags.length === 1 && Array.from(f).length === 1) {
        while (i >= 0 && !lonely(answer, i, f.length)) i = answer.indexOf(f, i + 1);
      } else if (frags.lone && frags.length === 1 && ONE_KANJI_LEAD.test(f)) {
        while (i >= 0 && KANJI_CHAR.test(answer[i - 1] || '') && !NUMERAL.test(answer[i - 1])) i = answer.indexOf(f, i + 1);
      }
      if (frags.edge) {
        while (i >= 0 && !startsWord(answer, i)) i = answer.indexOf(f, i + 1);
      }
      if (frags.bounded) {
        while (i >= 0 && !standsAlone(answer, i, f.length)) i = answer.indexOf(f, i + 1);
      }
      if (i < 0) return false;
      from = i + f.length;
    }
    return true;
  }

  // ─── Words in your answer ──────────────────────────────────────────────────
  //
  // Word and verb hints unlock by meaning, not by spelling: the answer is
  // split into words, each word is taken back to its dictionary form
  // (jp-deinflect.js: 泳いで → 泳ぐ, 明るくて → 明るい, たべません → たべる),
  // and a hint is used when its dictionary forms (worked out at build time,
  // conversation-words.js) appear in order — in kanji or in kana.
  //
  // The split picks the fewest, longest known words (the page's words, the
  // JLPT list once loaded, particles), so 日本 isn't 日 + 本 and 面白かった
  // isn't 面白 + かった (買った). Grammar hints are patterns (matchForms).

  const FUNCTION_WORDS = ('は が を に で と も の へ や か ね よ な わ ぞ さ から まで より だけ しか ので のに けど けれど けれども でも って など ごろ くらい ぐらい ずつ ほど ばかり とか し '
    + 'だ です でした でしょう だった じゃ では ではない じゃない '
    + 'とても よく もう まだ ちょっと たくさん いつも ときどき すこし ぜんぜん あまり いっしょ みんな わたし ぼく これ それ あれ どれ この その あの どの ここ そこ あそこ どこ なに なん だれ いつ どう どうして なぜ はい いいえ そして それから だから じゃあ そう こう ああ').split(' ');
  // Verbs every answer leans on, known even before the JLPT list has loaded.
  const CORE_WORDS = [['いる', 'いる'], ['ある', 'ある'], ['する', 'する'], ['なる', 'なる'], ['来る', 'くる'], ['行く', 'いく'],
    ['できる', 'できる'], ['言う', 'いう'], ['思う', 'おもう'], ['見る', 'みる'], ['いい', 'いい'], ['好き', 'すき']];
  const deinflectWord = w => (global.JpDeinflect ? global.JpDeinflect.deinflect(w) : [{ base: w, type: '' }]);

  let lexCache = null;
  // form → entries { base, kana }: dictionary forms and their readings.
  function lexicon() {
    const vocab = global.VOCAB_DATA ? ['n5', 'n4', 'n3'].flatMap(l => global.VOCAB_DATA[l] || []) : [];
    const words = (global.CONVERSATION_WORDS || {}).words || [];
    const sig = words.length + ':' + vocab.length;
    if (lexCache && lexCache.sig === sig) return lexCache.map;
    const map = new Map();
    const add = (base, kana) => {
      if (!base) return;
      kana = kana || base;
      [base, kana].forEach(k => {
        if (!map.has(k)) map.set(k, []);
        const list = map.get(k);
        if (!list.some(e => e.base === base && e.kana === kana)) list.push({ base, kana });
      });
    };
    CORE_WORDS.forEach(([b, k]) => add(b, k));
    words.forEach(([b, k]) => add(b, k));
    Object.values((global.CONVERSATION_WORDS || {}).hints || {}).forEach(ls => ls.forEach(([b, k]) => add(b, k)));
    vocab.forEach(w => { if (w.kanji && w.kana) add(w.kanji.replace(/[〜~]/g, ''), w.kana.replace(/[〜~]/g, '')); });
    lexCache = { sig, map };
    return map;
  }

  const VERB_END = /[うくぐすつぬぶむる]$/;
  const typeFits = (type, base) => !type || (type === 'adj' ? /い$/.test(base) : VERB_END.test(base));
  const RUN = /^([ァ-ヺー]+|[a-zA-Z0-9０-９]+|[一二三四五六七八九十百千万〇]+)/;

  // Splits text into words: [{ surface, from, entries, known }]. Spaces and
  // punctuation always end a word; `from` counts characters without spaces.
  function segment(text, lex = lexicon()) {
    const tokens = [];
    let offset = 0;
    String(text || '').split(/(\s+|[、。,.!?！？「」（）()…・]+)/).forEach(chunk => {
      if (!chunk || /^\s+$/.test(chunk)) return;
      if (/^[、。,.!?！？「」（）()…・]+$/.test(chunk)) { offset += chunk.length; return; }
      const n = chunk.length;
      // best[i]: the cheapest split of chunk[0, i) — a known word costs 1
      // (a one-kana word 1.6), an unknown character 3.
      const best = new Array(n + 1).fill(null);
      best[0] = { cost: 0 };
      for (let i = 0; i < n; i++) {
        if (!best[i]) continue;
        const edge = (len, cost, entries) => {
          const c = best[i].cost + cost;
          if (!best[i + len] || c < best[i + len].cost) best[i + len] = { cost: c, from: i, len, entries };
        };
        const run = RUN.exec(chunk.slice(i));
        if (run) edge(run[0].length, 1, [{ base: run[0], kana: run[0] }]);
        for (let len = 1; len <= Math.min(10, n - i); len++) {
          const w = chunk.substr(i, len);
          // A particle and a word can share a spelling (し: "and" or する's stem): keep both.
          const fn = FUNCTION_WORDS.includes(w);
          const entries = fn ? [{ base: w, kana: w, fn: true }] : [];
          deinflectWord(w).forEach(c => (lex.get(c.base) || []).forEach(e => {
            if (typeFits(c.type, e.base) && !entries.some(x => x.base === e.base && x.kana === e.kana && x.type === c.type)) entries.push(Object.assign({ type: c.type }, e));
          }));
          // A one-kana particle costs a touch more, so しか|いません beats し|かいません.
          if (entries.length) edge(len, fn ? (len === 1 ? 1.05 : 1) : len === 1 && /[ぁ-ゖ]/.test(w) ? 1.6 : 1, entries);
        }
        edge(1, 3, null);
      }
      const parts = [];
      for (let i = n; i > 0; i = best[i].from) parts.unshift(best[i]);
      parts.forEach(p => {
        tokens.push({ surface: chunk.substr(p.from, p.len), from: offset + p.from, entries: p.entries || [], known: !!p.entries });
      });
      offset += n;
    });
    return tokens;
  }

  // Whether the words use a hint's dictionary forms, in order (each within
  // a few words of the last: 背が高い, 年をとった).
  function usesLemmas(tokens, lemmas) {
    // A word fits a dictionary form if it is it: written in kanji, the same
    // kanji (済ませて isn't 住む; 留学する begins with 留学, so counts);
    // written in kana, the same reading. And the same kind of word, so the
    // verb はる (はないです) isn't the noun 春.
    const kindFits = (kind, type) => !kind || !type || (kind === 'v' ? /^v/.test(type) : kind === 'a' ? type === 'adj' : false);
    const fits = (t, [base, kana, kind]) => {
      if (t.surface === base) return true;
      const inKanji = KANJI_CHAR.test(t.surface);
      return t.entries.some(e => kindFits(kind, e.type) && (inKanji
        ? e.base === base || (KANJI_CHAR.test(base) && Array.from(base).length >= 2 && e.base.startsWith(base))
        : !!kana && e.kana === kana));
    };
    // A する-verb hint (料理します) counts for its noun (料理を作ります) — a
    // noun of two kanji or more, so 気にする isn't just 気.
    if (lemmas.length > 1 && lemmas[lemmas.length - 1][0] === 'する' && Array.from(lemmas[lemmas.length - 2][0]).length >= 2) lemmas = lemmas.slice(0, -1);
    const from = (k, start) => {
      if (k === lemmas.length) return true;
      for (let j = start; j < tokens.length && (k === 0 || j <= start + 3); j++) {
        if (fits(tokens[j], lemmas[k]) && from(k + 1, j + 1)) return true;
      }
      return false;
    };
    return from(0, 0);
  }

  // The ids of the hints (from hintItems) your answer uses.
  function usedHints(answer, items) {
    // Spaces you type mark where words start, so they're kept in one version.
    const spaced = String(answer || '').replace(/\s+/g, ' ').trim();
    const a = spaced.replace(/ /g, '');
    if (!a) return [];
    const bare = a.replace(PUNCT, '');
    const tokens = segment(spaced);
    // Where words start, for patterns that begin with a kanji (〜方 isn't in 夕方).
    const starts = new Set(tokens.map(t => t.from));
    const startsAt = (f, text) => {
      const first = f[0];
      if (!KANJI_CHAR.test(first[0])) return true;
      for (let i = text.indexOf(first); i >= 0; i = text.indexOf(first, i + 1)) if (starts.has(i)) return true;
      return false;
    };
    return items.filter(h => {
      if (h.lemmas && h.step !== 'grammar' && h.step !== 'start') {
        const whole = plain(h.ja).replace(/[〜~]/g, '');
        // The hint written whole (掃除機 as one word) always counts. Its
        // dictionary forms count when they hold every kanji of it — not 人
        // alone for 一人で, or 度 for 一度 (the number isn't a form).
        const kind = h.lemmas.length === 1 ? h.lemmas[0][2] : undefined;
        if (usesLemmas(tokens, [[whole, kana(h.ja).replace(/[〜~]/g, ''), kind]])) return true;
        const inForms = h.lemmas.map(l => l[0]).join('');
        // In kana (そのために), most of it: not just その.
        const covered = KANJI_CHAR.test(whole)
          ? [...whole].every(c => !KANJI_CHAR.test(c) || inForms.includes(c))
          : Array.from(inForms).length * 5 >= Array.from(whole).length * 3;
        return covered && usesLemmas(tokens, h.lemmas);
      }
      return matchForms(h, h.step).some(f => (hasForm(a, f) && startsAt(f, a)) || hasForm(bare, f) && h.step !== 'grammar' || hasForm(spaced, f));
    }).map(h => h.id);
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
  // reading → { spelling: how often it appears }. `extra` adds other words
  // as { kana, kanji } (the vocabulary list), verbs with their forms.
  function spellings(topics, prefer = [], extra = []) {
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
    extra.forEach(w => {
      if (!w || !w.kanji || !w.kana) return;
      const reading = w.kana.replace(/[〜~]/g, '');
      add(reading, w.kanji.replace(/[〜~]/g, ''), 1, 0.5);
      const v = verbForms(w.kanji, reading);
      if (v) {
        const stemKana = reading.slice(0, reading.length - (w.kanji.length - v.stem.length));
        v.forms.forEach(f => add(stemKana + f, v.stem + f, 2, 0.5));
      }
    });
    return seen;
  }

  const ranked = m => [...m].sort((x, y) => y[1] - x[1]).map(e => e[0]);

  // reading → the one spelling Auto writes (the commonest).
  function buildKanjiDict(topics, prefer = []) {
    const seen = spellings(topics, prefer);
    const dict = new Map();
    seen.forEach((m, reading) => {
      if (!PREFIXES.has(reading)) dict.set(reading, ranked(m)[0]);
    });
    return dict;
  }

  // reading → every spelling, commonest first: what Pick offers.
  function buildKanjiCandidates(topics, prefer = [], extra = []) {
    const out = new Map();
    spellings(topics, prefer, extra).forEach((m, reading) => out.set(reading, ranked(m)));
    return out;
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
        // What follows has to end the word: かいしゃ|いん stays until it's
        // かいしゃいん, and いま|s (romaji still being typed) until it's います.
        if (/[a-zA-Z']/.test(text[end])) return false;
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

  if (typeof module !== 'undefined' && module.exports) {
    try { global.JpDeinflect = global.JpDeinflect || require('./jp-deinflect.js'); } catch { /* not in Node */ }
    try { if (!global.CONVERSATION_WORDS) require('./conversation-words.js'); } catch { /* not built yet */ }
  }

  const api = { pieces, plain, kana, rubyHtml, parseHint, levelData, insertable, insertAt, charCount, answerKey, hintItems, stem, stems, verbForms, matchForms, hasForm, usedHints, segment, usesLemmas, buildKanjiDict, buildKanjiCandidates, toKanji, LEVELS, STEPS };
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
  const settings = Object.assign({ level: 'N5', furigana: true, kanji: 'pick' }, load(SETTINGS_KEY, {}));
  // Kanji: 'pick' offers spellings under the box (Space or a tap converts),
  // 'auto' converts finished words by itself, 'off' leaves kana alone.
  if (!['off', 'pick', 'auto'].includes(settings.kanji)) settings.kanji = settings.kanji === false ? 'off' : 'pick';
  if (!LEVELS.includes(settings.level)) settings.level = 'N5';
  const store = Object.assign({ answers: {}, feedback: {} }, load(STORE_KEY, {}));
  if (!store.answers || typeof store.answers !== 'object') store.answers = {};
  if (!store.feedback || typeof store.feedback !== 'object') store.feedback = {};

  let topic = null;            // the open question, or null on the list
  let unlocked = new Set();    // hint ids unlocked on this visit ('answer' for the sample)
  let used = new Set();        // hint ids your answer uses
  let fresh = new Set();       // just unlocked by your answer: these get the pop
  let opening = new Set();     // just unlocked by a tap: these fade in
  let kanjiDict = null;        // for the open question (its hint words come first)
  let kanjiCands = null;       // the same, every spelling, plus the vocabulary list once loaded
  let vocabLoading = null;
  let autoTimer = null;
  let asking = null;           // the answer key Claude is reviewing right now
  let live = null;             // { key, result }: the feedback streaming in
  let askError = '';
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
    askError = '';
    renderAi();
    renderFeedback();
  }

  // ─── Feedback from Claude ──────────────────────────────────────────────────

  const CF = () => global.ClaudeFeedback;

  // The button under the answer, or how to get it.
  function renderAi() {
    // Only rebuilt when it changes: clicking the button blurs the answer box,
    // which re-renders, and a rebuilt button would never get the click.
    const set = html => { if (box.dataset.html !== html) { box.innerHTML = html; box.dataset.html = html; } };
    const box = $('cs-ai');
    if (!CF()) { set(''); return; }
    const key = answerKey(topic.id, settings.level);
    if (!CF().key()) {
      set(`<button class="cs-ai-setup" data-ai="account">✨ ${CF().loggedIn()
        ? 'Get feedback from Claude: add your Claude API key in your account'
        : 'Log in and add a Claude API key to get feedback from Claude'}</button>`);
      return;
    }
    const empty = !$('cs-answer').value.trim();
    const busy = asking === key;
    set(`<button class="btn-secondary cs-ai-btn" data-ai="ask"${empty || asking ? ' disabled' : ''}>
        ${busy ? '<span class="account-spinner" aria-hidden="true"></span> Claude is reading your answer…' : '✨ Feedback from Claude'}
      </button>
      <span class="cs-ai-note">${empty ? 'Write something first' : 'Uses your Claude API key · a few cents'}</span>
      ${askError ? `<p class="cs-ai-error" role="alert">${esc(askError)}</p>` : ''}`);
  }

  // Feedback as it streams in (live) or as saved. Fields that haven't
  // started yet are left out; while live, a cursor shows where Claude is
  // writing and buttons wait until it's done.
  function feedbackHtml(r, { live = false, stale = false } = {}) {
    const keys = Object.keys(r);
    const writing = live ? keys[keys.length - 1] : null;
    const caret = k => (live && k === writing ? '<span class="cs-fb-caret" aria-hidden="true"></span>' : '');
    // Mid-stream furigana can stop inside its brackets (友達[とも): leave that part out until it closes.
    const ja = (k, m) => rubyHtml(live ? String(m).replace(/\[[^\]]*$/, '') : m) + caret(k);
    const has = k => r[k] != null;
    const fixes = Array.isArray(r.corrections) ? r.corrections : [];
    const parts = [`
      <div class="cs-fb-head">
        <h3>✨ Claude’s feedback <span>${esc(settings.level)}</span></h3>
        ${live ? '<span class="cs-fb-live">writing…</span>' : '<button class="cs-fb-close" data-ai="dismiss" aria-label="Remove this feedback">✕</button>'}
      </div>`];
    if (stale) parts.push('<p class="cs-fb-stale">This is about an earlier version of your answer. Ask again for feedback on what you have now.</p>');
    if (!keys.length) parts.push('<p class="cs-fb-thinking"><span class="account-spinner" aria-hidden="true"></span> Claude is reading your answer and thinking it over…</p>');
    if (has('summary')) parts.push(`<p class="cs-fb-summary">${esc(r.summary)}${caret('summary')}</p>`);
    if (Array.isArray(r.went_well) && r.went_well.length) {
      parts.push(`<ul class="cs-fb-good">${r.went_well.map(w => `<li>👍 ${esc(w)}</li>`).join('')}${caret('went_well')}</ul>`);
    }
    if (fixes.length) {
      parts.push(`<h4>Corrections</h4><ol class="cs-fb-fixes">${fixes.map(f => `
        <li>${fixHtml(f.original, f.fixed, live)}
          ${f.why != null ? `<div class="cs-fb-why">${esc(f.why)}</div>` : ''}</li>`).join('')}</ol>${caret('corrections')}`);
    } else if (has('corrections') && (!live || has('corrected'))) {
      parts.push('<p class="cs-fb-none">No mistakes found. 🎉</p>');
    }
    if (has('corrected') && fixes.length) {
      parts.push(`<h4>Your answer, corrected</h4><p class="cs-fb-ja" lang="ja">${ja('corrected', r.corrected)}</p>`);
      if (!live) parts.push('<button class="btn-secondary cs-fb-use" data-ai="use">Use this version</button>');
    }
    if (has('natural')) {
      parts.push(`<h4>A more natural version ${live ? '' : speakBtns(r.natural)}</h4><p class="cs-fb-ja" lang="ja">${ja('natural', r.natural)}</p>`);
    }
    if (has('natural_en')) parts.push(`<p class="cs-fb-en">${esc(r.natural_en)}${caret('natural_en')}</p>`);
    if (has('try_next')) parts.push(`<p class="cs-fb-next">💡 <b>Try next:</b> ${esc(r.try_next)}${caret('try_next')}</p>`);
    return parts.join('');
  }

  // A correction as two lines, yours (red) over the fix (green), with what
  // changed marked on both (answer-diff.js). They're compared by reading,
  // so writing ともだち where the fix has 友達 isn't a change: the fix's
  // furigana gives its kanji's readings, and the same kanji in your words
  // read the same.
  function fixHtml(original, fixed, live) {
    if (original == null) return '';
    const fixedMarkup = fixed == null ? null : live ? String(fixed).replace(/\[[^\]]*$/, '') : fixed;
    // Units: a kanji run with its reading, or one character.
    const fixUnits = fixedMarkup == null ? [] : pieces(fixedMarkup).flatMap(p => (p.r
      ? [{ html: `<ruby>${esc(p.t)}<rt>${esc(p.r)}</rt></ruby>`, kana: p.r }]
      : Array.from(p.t).map(ch => ({ html: esc(ch), kana: ch }))));
    const readings = pieces(fixedMarkup || '').filter(p => p.r).sort((x, y) => y.t.length - x.t.length);
    const mineUnits = [];
    for (let i = 0; i < original.length;) {
      const hit = readings.find(p => original.startsWith(p.t, i));
      if (hit) { mineUnits.push({ html: esc(hit.t), kana: hit.r }); i += hit.t.length; continue; }
      const ch = Array.from(original.slice(i))[0];
      mineUnits.push({ html: esc(ch), kana: ch });
      i += ch.length;
    }
    // Diff the readings, then mark each unit that has a changed character.
    const flagged = (units, side) => {
      let k = 0;
      return units.map(u => {
        const n = Array.from(u.kana).length;
        const changed = side && side.slice(k, k + n).some(c => !c.ok);
        k += n;
        return changed ? `<mark>${u.html}</mark>` : u.html;
      }).join('');
    };
    const d = fixedMarkup != null && global.AnswerDiff
      ? global.AnswerDiff.diff(mineUnits.map(u => u.kana).join(''), fixUnits.map(u => u.kana).join(''))
      : null;
    const mine = flagged(mineUnits, d && d.typed);
    const fix = fixedMarkup == null ? '' : flagged(fixUnits, d && d.expected) + (live ? '<span class="cs-fb-caret" aria-hidden="true"></span>' : '');
    return `<div class="cs-fb-fix" lang="ja">
        <div class="cs-fb-wrong"><span class="cs-fb-sign" aria-label="You wrote">✗</span><span>${mine}</span></div>
        ${fixedMarkup != null ? `<div class="cs-fb-right"><span class="cs-fb-sign" aria-label="Better">✓</span><span>${fix}</span></div>` : ''}
      </div>`;
  }

  function renderFeedback() {
    const box = $('cs-feedback');
    const key = answerKey(topic.id, settings.level);
    const fb = store.feedback[key];
    const streaming = live && live.key === key;
    box.classList.toggle('hidden', !fb && !streaming);
    box.classList.toggle('cs-fb-streaming', !!streaming);
    if (!fb && !streaming) { box.innerHTML = ''; box.dataset.html = ''; return; }
    const html = streaming
      ? feedbackHtml(live.result, { live: true })
      : feedbackHtml(fb.result, { stale: fb.for.trim() !== $('cs-answer').value.trim() });
    // Typing calls this on every key: rebuild only when it changes (the
    // "earlier version" note), or the panel would flicker.
    if (box.dataset.html !== html) { box.innerHTML = html; box.dataset.html = html; }
  }

  async function askClaude() {
    if (saveTimer) saveAnswer();
    const t = topic;
    const level = settings.level;
    const key = answerKey(t.id, level);
    const answer = $('cs-answer').value;
    const d = levelData(t, level);
    const here = () => topic === t && settings.level === level;
    asking = key;
    askError = '';
    live = { key, result: {} };
    renderAi();
    renderFeedback();
    $('cs-feedback').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    // Partial replies come in fast: draw at most once a frame.
    let frame = 0;
    const onPartial = soFar => {
      live.result = soFar;
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; if (here() && live) renderFeedback(); });
    };
    try {
      const result = await CF().feedback({
        question: plain(d.q.ja),
        questionEn: d.q.en,
        level,
        hints: hintItems(d).map(h => plain(h.ja)),
        answer,
      }, { onPartial });
      store.feedback[key] = { for: answer, result, t: Date.now() };
      save(STORE_KEY, store);
    } catch (err) {
      askError = err.message;
    }
    cancelAnimationFrame(frame);
    asking = null;
    live = null;
    if (here()) {
      renderAi();
      renderFeedback();
    }
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
    const cls = (used.has(h.id) ? ' cs-used' : '') + (fresh.has(h.id) ? ' cs-pop' : opening.has(h.id) ? ' cs-opening' : '');
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
    const html = STEPS.filter(s => d[s.key].length).map(s => {
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
    // Rebuilt only when something changed, so nothing on the board flickers.
    const board = $('cs-hints');
    if (board.dataset.html !== html) { board.innerHTML = html; board.dataset.html = html; }
    opening = new Set();
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
    if (t && t !== topic) kanjiDict = kanjiCands = null;
    topic = t || null;
    $('screen-chapters').classList.toggle('active', !topic);
    $('screen-conversation').classList.toggle('active', !!topic);
    renderLevels();
    if (topic) {
      loadVocab();
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
    kanjiDict = kanjiCands = null;
    renderLevels();
    if (topic) renderQuestion();
    else renderTopics();
  }

  // Unlocks the hints your answer uses. With `animate`, newly unlocked ones
  // pop and are named under the answer box.
  // Returns whether anything changed (so the board needs drawing again).
  function spotHints(animate) {
    const items = hintItems(levelData(topic, settings.level));
    const was = [...used].join();
    used = new Set(usedHints($('cs-answer').value, items));
    const news = items.filter(h => used.has(h.id) && !unlocked.has(h.id));
    news.forEach(h => unlocked.add(h.id));
    if (!animate) return false;
    news.forEach(h => fresh.add(h.id));
    const names = [...new Set(news.map(h => plain(h.ja)))];
    if (names.length) note(`✨ Unlocked by your answer: ${names.join('、')}`);
    return news.length > 0 || [...used].join() !== was;
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

  function renderKanjiMode() {
    document.querySelectorAll('.cs-kanji-mode button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.kanji === settings.kanji)));
  }

  // Spellings for the reading before the caret (Pick): this page's words
  // first, then the JLPT vocabulary list, loaded the first time it's needed.
  function kanjiLookup(reading) {
    if (!topic) return [];
    if (!kanjiCands) {
      const vocab = global.VOCAB_DATA ? ['n5', 'n4', 'n3'].flatMap(l => global.VOCAB_DATA[l] || []) : [];
      kanjiCands = buildKanjiCandidates(TOPICS, hintItems(levelData(topic, settings.level)).filter(h => h.step !== 'grammar').map(h => h.ja), vocab);
    }
    return kanjiCands.get(reading) || [];
  }

  function loadVocab() {
    if (global.VOCAB_DATA || vocabLoading) return;
    vocabLoading = new Promise(resolve => {
      const s = document.createElement('script');
      s.src = 'vocabulary-data.js';
      // More known words: the kanji picker and the hint spotting both use them.
      s.onload = () => {
        kanjiCands = null;
        if (topic && spotHints(false) !== null) renderHints();
        resolve();
      };
      s.onerror = () => { vocabLoading = null; resolve(); };
      document.head.appendChild(s);
    });
  }

  // With Kanji on Auto: the kana words you've typed past become kanji.
  function convertKanji(final) {
    if (settings.kanji !== 'auto') return;
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
    if (!asking) renderAi();
    if (store.feedback[answerKey(topic.id, settings.level)]) renderFeedback();
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
    $('cs-en-btn').addEventListener('click', () => { showEnglish = !showEnglish; renderQuestion(); });

    const ta = $('cs-answer');
    // Romaji first: the kanji picker reads the kana it has just written.
    if (global.Romaji) Romaji.attach(ta);
    renderKanjiMode();
    document.querySelectorAll('.cs-kanji-mode button').forEach(b => b.addEventListener('click', () => {
      settings.kanji = b.dataset.kanji;
      saveSettings();
      renderKanjiMode();
      if (global.KanjiIme) KanjiIme.reset(ta);
      if (settings.kanji === 'pick') loadVocab();
      if (settings.kanji === 'auto' && topic) { afterTyping(true); saveAnswer(); }
    }));
    if (global.KanjiIme) {
      KanjiIme.attach(ta, kanjiLookup, { suffix: true, enabled: () => settings.kanji === 'pick' && !!topic });
      ta.addEventListener('ime:pick', () => { afterTyping(false); clearTimeout(saveTimer); saveTimer = setTimeout(saveAnswer, 600); });
      ta.addEventListener('focus', () => { if (settings.kanji === 'pick') loadVocab(); });
    }
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
        opening.add(one.dataset.unlock);
        if (one.dataset.unlock === 'answer') { saveAnswer(); renderSample(); } else renderHints();
        return;
      }
      const step = e.target.closest('[data-unlock-step]');
      if (step) {
        hintItems(levelData(topic, settings.level)).filter(h => h.step === step.dataset.unlockStep && !unlocked.has(h.id)).forEach(h => { unlocked.add(h.id); opening.add(h.id); });
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
    window.addEventListener('tokidoki:claude-key', () => { if (topic) renderAi(); });
    $('screen-conversation').addEventListener('click', e => {
      const b = e.target.closest('[data-ai]');
      if (!b) return;
      const act = b.dataset.ai;
      if (act === 'ask') askClaude();
      else if (act === 'account') { const acc = document.getElementById('btn-account'); if (acc) acc.click(); }
      else if (act === 'dismiss') {
        delete store.feedback[answerKey(topic.id, settings.level)];
        save(STORE_KEY, store);
        renderFeedback();
      } else if (act === 'use') {
        const fb = store.feedback[answerKey(topic.id, settings.level)];
        $('cs-answer').value = plain(fb.result.corrected);
        fb.for = $('cs-answer').value;
        saveAnswer();
        save(STORE_KEY, store);
        afterTyping(true);
        renderFeedback();
      }
    });
    window.addEventListener('pagehide', () => { if (saveTimer) saveAnswer(); });

    renderFurigana();
    route();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(typeof window !== 'undefined' ? window : globalThis);
