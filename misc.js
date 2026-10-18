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
  const SETTINGS_KEY = 'tokidoki_misc_settings';

  // ─── Furigana markup: 漢字[かんじ] ─────────────────────────────────────────

  const RUBY_RE = /([㐀-䶿一-鿿々〆ヶ]+)\[([^\]]+)\]/g;
  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rubyPlain = m => String(m).replace(RUBY_RE, '$1');
  const rubyKana = m => String(m).replace(RUBY_RE, '$2');
  function rubyHtml(m) {
    let out = '';
    let last = 0;
    String(m).replace(RUBY_RE, (all, t, r, i) => {
      out += esc(m.slice(last, i)) + `<ruby>${esc(t)}<rt>${esc(r)}</rt></ruby>`;
      last = i + all.length;
      return all;
    });
    return out + esc(m.slice(last));
  }

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

  // The counters you meet most, with what they count: the everyday thirty
  // first, then seventy more by theme.
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

  const MORE_COUNTERS = [
    ['Time and dates', [
      ['months of the year — 1月, 2月', '月', 'がつ'],
      ['day number — the 3rd day of a trip', '日目', 'にちめ'],
      ['school year — a 2nd-year student', '年生', 'ねんせい'],
      ['years (how long) — for 3 years', '年間', 'ねんかん'],
      ['centuries', '世紀', 'せいき'],
      ['decades of age — in your 20s', '代', 'だい'],
      ['nights at a hotel', '泊', 'はく'],
      ['nights / evenings — 一晩', '晩', 'ばん'],
      ['lessons in a textbook — 第3課', '課', 'か'],
    ]],
    ['Things and objects', [
      ['sets, pairs, groups — 2 couples, class 3', '組', 'くみ'],
      ['pairs of chopsticks, bowls of rice', '膳', 'ぜん'],
      ['grains and drops — rice, rain', '粒', 'つぶ'],
      ['bundles — flowers, letters', '束', 'たば'],
      ['boxes', '箱', 'はこ'],
      ['bags', '袋', 'ふくろ'],
      ['cans', '缶', 'かん'],
      ['bottles (as containers)', '瓶', 'びん'],
      ['pills and tablets', '錠', 'じょう'],
      ['slices — cake, bread, fish', '切れ', 'きれ'],
      ['flowers in bloom, wheels', '輪', 'りん'],
      ['shares of stock, plants and stumps', '株', 'かぶ'],
      ['balls, heads of lettuce, portions of noodles', '玉', 'たま', ['だま']],
      ['blocks of tofu, guns, scissors', '丁', 'ちょう'],
      ['chairs and tables (with legs)', '脚', 'きゃく'],
      ['flat surfaces — mirrors, tennis courts, stages', '面', 'めん'],
      ['copies of a newspaper or document', '部', 'ぶ'],
      ['volumes of a series', '巻', 'かん'],
      ['haiku and verses', '句', 'く'],
      ['written characters', '字', 'じ'],
      ['words (in a text)', '語', 'ご'],
      ['lines of text', '行', 'ぎょう'],
      ['pages', 'ページ', 'ぺーじ', ['頁']],
      ['kinds / types', '種類', 'しゅるい'],
    ]],
    ['Food and drink', [
      ['dishes on a menu, items', '品', 'ひん', ['しな']],
      ['plates / servings', '皿', 'さら'],
      ['portions — sushi for 2', '人前', 'にんまえ'],
      ['mouthfuls, bites', '口', 'くち'],
    ]],
    ['Places, buildings and travel', [
      ['buildings in a complex — apartment blocks', '棟', 'とう'],
      ['households, homes', '戸', 'こ'],
      ['rooms (formal) — a 3-room flat', '室', 'しつ'],
      ['rooms', '部屋', 'へや'],
      ['schools', '校', 'こう'],
      ['companies', '社', 'しゃ'],
      ['shops and branches (formal)', '店', 'てん'],
      ['TV and radio stations', '局', 'きょく'],
      ['train stations / stops', '駅', 'えき'],
      ['train carriages', '両', 'りょう'],
      ['car number on a train — car 5', '号車', 'ごうしゃ'],
      ['platform number — platform 2', '番線', 'ばんせん'],
      ['flights, services', '便', 'びん'],
      ['aircraft', '機', 'き'],
      ['countries', 'か国', 'かこく', ['ヶ国', 'カ国', 'ケ国', 'ヵ国', '箇国']],
      ['places / spots', 'か所', 'かしょ', ['ヶ所', 'カ所', 'ケ所', 'ヵ所', '箇所']],
    ]],
    ['Ranks, scores and more', [
      ['rank / place — 1st place', '位', 'い'],
      ['class or prize — 1st prize', '等', 'とう'],
      ['matches, games', '試合', 'しあい'],
      ['episodes, stories', '話', 'わ'],
      ['seats', '席', 'せき'],
      ['votes', '票', 'ひょう'],
      ['questions on a test', '問', 'もん'],
      ['points, marks, scores', '点', 'てん'],
      ['ways / methods — 2 ways to do it', '通り', 'とおり'],
      ['multiples — twice, 3 times as much', '倍', 'ばい'],
      ['tenths — 30 percent = 3__', '割', 'わり'],
      ['degrees — temperature, angles', '度', 'ど'],
      ['steps (walking)', '歩', 'ほ', ['ぽ']],
      ['laps', '周', 'しゅう'],
      ['colours (formal) — 12-colour pencils', '色', 'しょく', ['いろ']],
      ['terms, periods — the 2nd term', '期', 'き'],
      ['subjects at school', '科目', 'かもく'],
    ]],
  ];

  // Verbs with their own keigo word instead of the regular お〜になる /
  // お〜する pattern: [plain verb, meaning, answer, other accepted answers].
  // Verbs and answers are in furigana markup (漢字[かんじ]); the kanji and
  // the kana spelling of an answer both count.
  const SONKEIGO = [
    ['いる', 'to be, to stay', 'いらっしゃる', ['おいでになる']],
    ['行[い]く', 'to go', 'いらっしゃる', ['おいでになる']],
    ['来[く]る', 'to come', 'いらっしゃる', ['おいでになる', 'お見えになる', 'おみえになる', 'お越しになる', 'おこしになる']],
    ['言[い]う', 'to say', 'おっしゃる'],
    ['食[た]べる', 'to eat', '召[め]し上[あ]がる'],
    ['飲[の]む', 'to drink', '召[め]し上[あ]がる'],
    ['する', 'to do', 'なさる'],
    ['見[み]る', 'to see', 'ご覧[らん]になる'],
    ['知[し]っている', 'to know', 'ご存[ぞん]じだ', ['ご存じ', 'ご存知', 'ご存知だ', 'ごぞんじ', 'ご存じです', 'ごぞんじです']],
    ['くれる', 'to give me', 'くださる', ['下さる']],
    ['寝[ね]る', 'to sleep', 'お休[やす]みになる'],
    ['着[き]る', 'to wear', 'お召[め]しになる'],
    ['死[し]ぬ', 'to die', 'お亡[な]くなりになる', ['亡くなる', 'なくなる']],
  ];
  const KENJOUGO = [
    ['いる', 'to be, to stay', 'おる', ['居る']],
    ['行[い]く', 'to go', '参[まい]る', ['伺う', 'うかがう']],
    ['来[く]る', 'to come', '参[まい]る'],
    ['言[い]う', 'to say', '申[もう]す', ['申し上げる', 'もうしあげる']],
    ['食[た]べる', 'to eat', 'いただく', ['頂く']],
    ['飲[の]む', 'to drink', 'いただく', ['頂く']],
    ['する', 'to do', 'いたす', ['致す']],
    ['見[み]る', 'to see', '拝見[はいけん]する'],
    ['知[し]っている', 'to know', '存[ぞん]じている', ['存じておる', 'ぞんじておる', '存じ上げている', 'ぞんじあげている', '存じる', 'ぞんじる']],
    ['もらう', 'to receive', 'いただく', ['頂く']],
    ['あげる', 'to give', '差[さ]し上[あ]げる'],
    ['会[あ]う', 'to meet', 'お目[め]にかかる'],
    ['聞[き]く', 'to ask / to hear', '伺[うかが]う', ['承る', 'うけたまわる']],
    ['訪[たず]ねる', 'to visit', '伺[うかが]う'],
    ['見[み]せる', 'to show', 'お目[め]にかける', ['ご覧に入れる', 'ごらんにいれる']],
    ['わかる', 'to understand', 'かしこまる', ['承知する', 'しょうちする']],
    ['思[おも]う', 'to think', '存[ぞん]じる'],
  ];
  // A keigo word that stands for several verbs (いただく: eat, drink,
  // receive) gets one flashcard with all their meanings.
  function keigoItems(rows, kind) {
    const meanings = {};
    rows.forEach(([, meaning, answer]) => {
      const w = rubyPlain(answer);
      (meanings[w] = meanings[w] || []).push(meaning);
    });
    return rows.map(([verb, meaning, answer, alt = []]) => ({
      prompt: `${rubyPlain(verb)} (${meaning})`,
      promptHtml: `${rubyHtml(verb)} <span class="misc-prompt-en">(${esc(meaning)})</span>`,
      answer: rubyPlain(answer),
      answerHtml: rubyHtml(answer),
      accept: [rubyKana(answer), ...alt],
      card: { word: rubyPlain(answer), kana: rubyKana(answer), meaning: `(${kind}) ${meanings[rubyPlain(answer)].join('; ')}` },
    }));
  }

  // The ways to say "but": [word, meaning, typical use].
  const BUT_WORDS = [
    ['が', 'but / although', 'Connects clauses; often polite or neutral'],
    ['けど', 'but / though', 'Everyday conversation'],
    ['けれど', 'but / although', 'Slightly more formal than けど'],
    ['けれども', 'although / however', 'More formal or deliberate'],
    ['でも', 'but / however', 'Often starts a new statement'],
    ['しかし', 'however', 'Formal writing, presentations'],
    ['ですが', 'but / however', 'Polite, often at the beginning of a response'],
    ['なのに', 'even though / despite that', 'Expresses an unexpected result'],
    ['それでも', 'even so / nevertheless', 'Something happens despite the contrast'],
    ['ところが', 'however / contrary to expectations', 'Introduces a surprising result'],
  ];
  // Other linking words you might type instead, for a hint.
  const NOT_BUT = {
    'そして': 'and (then)', 'それから': 'and then / after that', 'それに': 'besides / on top of that',
    'だから': 'so / therefore', 'ですから': 'so / therefore (polite)', 'から': 'because / so',
    'ので': 'because / so', 'それで': 'and so / that\'s why', 'すると': 'and then / thereupon',
    'また': 'also / again', 'しかも': 'moreover', 'のに': 'even though — close! The one on the list starts with な',
  };

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
      id: 'but',
      glyph: '逆',
      title: 'Ways to say "but"',
      ja: '逆接の言い方',
      desc: `From casual けど to formal しかし (${BUT_WORDS.length}). Can you name them all?`,
      sections: [{
        type: 'find',
        placeholder: 'Type a word — kana or romaji',
        columns: ['Japanese', 'Meaning', 'Typical use'],
        items: BUT_WORDS.map(([word, meaning, use]) => ({
          cells: [word, meaning, use],
          accept: [word],
        })),
        miss(s) {
          const other = NOT_BUT[s];
          return other ? `${s} means ${other}.` : '';
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
      id: 'keigo',
      glyph: '敬',
      title: 'Honorific & humble verbs',
      ja: '尊敬語・謙譲語',
      desc: 'The verbs with a special keigo word of their own. Honorific for what others do, humble for what you do.',
      sections: [
        {
          type: 'fill',
          label: 'Honorific 尊敬語 — raising the other person',
          columns: ['Verb', '尊敬語'],
          items: keigoItems(SONKEIGO, 'honorific'),
        },
        {
          type: 'fill',
          label: 'Humble 謙譲語 — lowering yourself',
          columns: ['Verb', '謙譲語'],
          items: keigoItems(KENJOUGO, 'humble'),
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
      title: 'The 100 most common counters',
      ja: '助数詞',
      desc: 'What do you count people, pens, paper, cats, floors and flights with? Kanji or reading both count.',
      // One list: the everyday thirty first, then the rest.
      sections: [{
        type: 'fill',
        columns: ['Counts', 'Counter'],
        items: [...COUNTERS, ...MORE_COUNTERS.flatMap(([, rows]) => rows)]
          .map(([prompt, kanji, reading, alt = []]) => ({
            prompt, answer: `${kanji}（${reading}）`, accept: [kanji, reading, ...alt],
          })),
      }],
    },
  ];

  // ─── Matching ──────────────────────────────────────────────────────────────

  // Kana for comparing: romaji converted, katakana folded to hiragana, and
  // spaces, arrows and separators dropped (a hyphen stays: pe-ji is ぺーじ).
  function normalize(text) {
    let s = String(text).trim().toLowerCase();
    s = s.replace(/[\s　→⇒>＞=＝–—~〜,、・/／]+/g, '');
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

  // Saved words join the word flashcard deck, reviewed on flashcards.html.
  const DECK_KEY = 'tokidoki_story_words';
  const SRS_KEY = 'tokidoki_srs';
  function loadJson(key) {
    try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; }
  }
  function saveJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
  }

  function loadSettings() {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; } catch { return {}; }
  }
  function saveSettings(settings) {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* private mode */ }
  }

  // 0…n-1 in random order (Fisher–Yates).
  function shuffled(n, rand = Math.random) {
    const idx = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
  }

  // Best is the higher score, then the faster time.
  function better(a, b) {
    if (!a) return true;
    if (b.score !== a.score) return b.score > a.score;
    return b.time < a.time;
  }

  const formatTime = sec => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

  // ─── Page ──────────────────────────────────────────────────────────────────

  function initPage() {
    const $ = sel => document.querySelector(sel);
    const list = $('#misc-list');
    if (!list) return;

    let quiz = null;
    let found = [];       // per section, a Set of item indices
    let started = 0;
    let timer = null;
    let over = false;
    const settings = loadSettings();

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
      // Only prompts you answer one by one have an order worth mixing up.
      $('#misc-shuffle-row').classList.toggle('hidden', !quiz.sections.some(sec => sec.type === 'fill'));
      $('#misc-shuffle').checked = !!settings.shuffle;
      orderRows();
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
          <td lang="ja" class="misc-prompt">${it.promptHtml || esc(it.prompt)}</td>
          <td><input type="text" class="answer-input misc-fill" lang="ja" data-section="${si}" data-row="${i}"
            autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="${esc(it.prompt)}"></td>
        </tr>`).join('');
        const tip = si === quiz.sections.findIndex(x => x.items.some(it => it.card))
          ? '<p class="misc-tip">Answered rows get a ＋ to add the word to your <a href="flashcards.html">flashcards</a>.</p>' : '';
        return `<section class="misc-section" data-section="${si}">${label}${tip}
          <table class="misc-table misc-table-fill"><thead>${head}</thead><tbody>${rows}</tbody></table>
        </section>`;
      }).join('');
      document.querySelectorAll('#misc-body input').forEach(inp => {
        if (Romaji) Romaji.attach(inp);
        inp.addEventListener('input', () => onInput(inp, false));
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); onInput(inp, true); } });
      });
    }

    // Puts each fill section's rows in random or list order. Answers and
    // focus follow the rows, so this works mid-quiz too.
    function orderRows() {
      document.querySelectorAll('#misc-body .misc-table-fill tbody').forEach(tbody => {
        const rows = [...tbody.children].sort((a, b) => a.dataset.row - b.dataset.row);
        const order = settings.shuffle ? shuffled(rows.length) : rows.map((_, i) => i);
        order.forEach(i => tbody.appendChild(rows[i]));
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
        const it = sec.items[i];
        const inp = row.querySelector('input');
        inp.value = it.answer;
        inp.disabled = true;
        if (it.answerHtml || it.card) {
          // Shown as text instead, so it can carry furigana and a ＋.
          inp.classList.add('hidden');
          const cell = inp.parentElement;
          cell.insertAdjacentHTML('beforeend', `<span class="misc-answer" lang="ja">${it.answerHtml || esc(it.answer)}</span>`
            + (it.card ? deckButtonHtml(it.card.word) : ''));
        }
      }
    }

    // ─── Word flashcards (the deck reviewed on flashcards.html) ──────────────

    function deckButtonHtml(word) {
      const saved = Object.prototype.hasOwnProperty.call(loadJson(DECK_KEY), word);
      return `<button class="misc-deck-btn${saved ? ' saved' : ''}" data-word="${esc(word)}" aria-pressed="${saved}"
        title="${saved ? 'In your flashcards — click to remove' : 'Add to flashcards'}"
        aria-label="${saved ? 'Remove' : 'Add'} ${esc(word)} ${saved ? 'from' : 'to'} flashcards">${saved ? '✓' : '＋'}</button>`;
    }

    function cardFor(word) {
      for (const sec of quiz.sections) {
        const it = sec.items.find(x => x.card && x.card.word === word);
        if (it) return it.card;
      }
      return null;
    }

    function toggleCard(word) {
      const deck = loadJson(DECK_KEY);
      if (Object.prototype.hasOwnProperty.call(deck, word)) {
        delete deck[word];
        const srs = loadJson(SRS_KEY);
        delete srs[`story_word:${word}`];
        delete srs[`story_word:${word}:recall`];
        saveJson(SRS_KEY, srs);
      } else {
        const card = cardFor(word);
        if (!card) return;
        deck[word] = { kana: card.kana, meaning: card.meaning, added: Date.now(), title: `${quiz.title} (Misc)`, level: '' };
      }
      saveJson(DECK_KEY, deck);
      // Every button for the same word (いただく appears three times) follows.
      document.querySelectorAll('.misc-deck-btn').forEach(btn => {
        if (btn.dataset.word === word) btn.outerHTML = deckButtonHtml(word);
      });
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
    $('#misc-body').addEventListener('click', e => {
      const btn = e.target.closest('.misc-deck-btn');
      if (btn) toggleCard(btn.dataset.word);
    });
    $('#misc-shuffle').addEventListener('change', e => {
      settings.shuffle = e.target.checked;
      saveSettings(settings);
      orderRows();
      const next = [...document.querySelectorAll('#misc-body input')].find(x => !x.disabled);
      if (next) next.focus();
    });
    $('#misc-again').addEventListener('click', () => start(quiz.id));
    $('#misc-quit').addEventListener('click', home);

    renderList();
    const hash = location.hash.slice(1);
    if (QUIZZES.some(q => q.id === hash)) start(hash);
  }

  const api = { rubyHtml, rubyPlain, rubyKana, QUIZZES, RU_EXCEPTIONS, normalize, matchItems, shuffled, total, better, formatTime };
  global.Misc = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPage);
    else initPage();
  }
})(typeof window !== 'undefined' ? window : globalThis);
