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
  // verbs.js declares ALL_VERBS as a top-level const, so it isn't on window.
  /* global ALL_VERBS */
  const VERBS = typeof ALL_VERBS !== 'undefined' ? ALL_VERBS
    : typeof require !== 'undefined' ? require('./verbs.js').ALL_VERBS : [];
  /* global ALL_ADJECTIVES */
  const ADJECTIVES = typeof ALL_ADJECTIVES !== 'undefined' ? ALL_ADJECTIVES
    : typeof require !== 'undefined' ? require('./verbs.js').ALL_ADJECTIVES : [];
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

  // な-adjectives that look like い-adjectives. verbs.js only has three, so this
  // is the common N5–N3 list rather than one built from verbs.js.
  const NA_EI = [
    ['きれい', 'きれい', 'pretty / clean', ['綺麗']],
    ['嫌い', 'きらい', 'disliked'],
    ['大嫌い', 'だいきらい', 'hated'],
    ['有名', 'ゆうめい', 'famous'],
    ['丁寧', 'ていねい', 'polite / careful'],
    ['失礼', 'しつれい', 'rude'],
    ['得意', 'とくい', 'good at'],
    ['不得意', 'ふとくい', 'bad at'],
    ['心配', 'しんぱい', 'worried'],
    ['意外', 'いがい', 'surprising'],
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
    ['来[く]る', 'to come', '参[まい]る', ['伺う', 'うかがう']],
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

  // The same verbs as multiple choice: the plain verb with four keigo words
  // to pick from. Other right answers (伺う for humble 来る) are never
  // offered as a wrong option.
  const keigoChoiceItems = rows => rows.map(([verb, meaning, answer, alt = []]) => ({
    prompt: `${rubyPlain(verb)} (${meaning})`,
    promptHtml: `${rubyHtml(verb)} <span class="misc-prompt-en">(${esc(meaning)})</span>`,
    answer: rubyPlain(answer),
    answerHtml: rubyHtml(answer),
    close: alt,
  }));

  // Everyday words and phrases and their polite, formal equivalents (what
  // shop staff, receptionists and business emails use): [everyday, meaning,
  // formal, note, other formal words that would also be right].
  const KEIGO_WORDS = [
    ['ここ', 'here', 'こちら', 'こちらへどうぞ。 — This way, please.'],
    ['そこ', 'there (near you)', 'そちら', 'そちらにお座[すわ]りください。 — Please sit there.'],
    ['あそこ', 'over there', 'あちら', 'お手洗[てあら]いはあちらです。 — The restroom is over there.'],
    ['どこ', 'where', 'どちら', 'どちらからいらっしゃいましたか。 — Where are you from?'],
    ['だれ', 'who', 'どなた', 'どなたですか。 (or どちら様[さま]ですか。) — Who is it, please?', ['どちら様']],
    ['この人[ひと]', 'this person', 'この方[かた]', 'こちらの方[かた]が田中[たなか]さんです。 — This is Mr/Ms Tanaka.'],
    ['今日[きょう]', 'today', '本日[ほんじつ]', '本日[ほんじつ]は休業[きゅうぎょう]です。 — We are closed today.'],
    ['あした', 'tomorrow', '明日[みょうにち]', 'Written 明日 like あした, but read みょうにち in formal speech.'],
    ['きのう', 'yesterday', '昨日[さくじつ]', 'Written 昨日 like きのう, but read さくじつ in formal speech.'],
    ['あさって', 'the day after tomorrow', '明後日[みょうごにち]', '明後日[みょうごにち]にお送[おく]りします。 — I\'ll send it the day after tomorrow.'],
    ['去年[きょねん]', 'last year', '昨年[さくねん]', '昨年[さくねん]はお世話[せわ]になりました。 — Thank you for everything last year (New Year cards).'],
    ['さっき', 'a moment ago', '先[さき]ほど', '先[さき]ほどお電話[でんわ]しました。 — I called a little while ago.'],
    ['あとで', 'later', '後[のち]ほど', '後[のち]ほどご連絡[れんらく]します。 — I\'ll contact you later.'],
    ['今[いま]', 'now', 'ただ今[いま]', 'ただ今[いま]参[まい]ります。 — I\'m coming right now.'],
    ['ちょっと', 'a little', '少々[しょうしょう]', '少々[しょうしょう]お待[ま]ちください。 — Please wait a moment.'],
    ['すごく', 'very', '大変[たいへん]', '大変[たいへん]お待[ま]たせしました。 — Sorry to have kept you waiting so long.'],
    ['本当[ほんとう]に', 'truly, really', '誠[まこと]に', '誠[まこと]にありがとうございます。 — Thank you very much indeed.'],
    ['やっぱり', 'as expected, after all', 'やはり', 'やはり is the careful form of やっぱり.'],
    ['あなたの会社[かいしゃ]', 'your company', '御社[おんしゃ]', '御社[おんしゃ] in speech; 貴社[きしゃ] in writing.', ['貴社']],
    ['うちの会社[かいしゃ]', 'our company', '弊社[へいしゃ]', '弊社[へいしゃ] lowers your own company: humble.'],
    ['家[いえ]', 'someone\'s home', 'お宅[たく]', '先生[せんせい]のお宅[たく] — the teacher\'s home.'],
  ];
  const KEIGO_PHRASES = [
    ['です', 'is', 'でございます', 'こちらが新[しん]商品[しょうひん]でございます。 — This is our new product.'],
    ['あります', 'there is, have', 'ございます', 'Ｓサイズもございます。 — We have it in S as well.'],
    ['いいですか', 'is it OK?', 'よろしいでしょうか', 'お名前[なまえ]を伺[うかが]ってもよろしいでしょうか。 — May I ask your name?'],
    ['どうですか', 'how about it?', 'いかがですか', 'コーヒーはいかがですか。 — Would you like some coffee?'],
    ['わかりました', 'understood', 'かしこまりました', 'What staff say to an order or request.', ['承知しました']],
    ['すみません', 'I\'m sorry', '申[もう]し訳[わけ]ございません', 'The deepest everyday apology, to customers.'],
    ['知[し]りません', 'I don\'t know', '存[ぞん]じません', 'Humble 存じる, in the negative.'],
    ['できません', 'I can\'t', 'いたしかねます', '〜かねます: a polite way to refuse. ご返品[へんぴん]はいたしかねます。 — We can\'t accept returns.'],
    ['待[ま]ってください', 'please wait', 'お待[ま]ちください', 'お + verb stem + ください: the polite request.', ['少々お待ちください']],
    ['ちょっと待[ま]って', 'wait a moment', '少々[しょうしょう]お待[ま]ちください', 'What you hear on the phone and at counters.', ['お待ちください']],
    ['ありがとう', 'thanks', 'ありがとうございます', 'Add ございます — or ございました for something finished.'],
    ['じゃあ、また', 'see you', '失礼[しつれい]いたします', 'Said when leaving a room or ending a call.', ['失礼します']],
    ['だれですか', 'who is it?', 'どちら様[さま]ですか', 'At the door or on the phone.', ['どなたですか']],
    ['もう一度[いちど]言[い]って', 'say that again', 'もう一度[いちど]おっしゃっていただけますか', 'Honorific おっしゃる + 〜ていただけますか, "could you…?".'],
  ];
  const keigoWordItems = rows => rows.map(([plain, meaning, formal, note, alt = []]) => ({
    prompt: `${rubyPlain(plain)} (${meaning})`,
    promptHtml: `${rubyHtml(plain)} <span class="misc-prompt-en">(${esc(meaning)})</span>`,
    answer: rubyPlain(formal),
    answerHtml: rubyHtml(formal),
    note: rubyHtml(note),
    close: alt,
  }));

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

  // The Bunkei drill's sentence patterns (bunkei.html), by level: [pattern id,
  // the form, an example, other accepted answers]. In furigana markup; the
  // kanji and kana spellings both count, and so does the whole example.
  // test_misc.js checks this matches PATTERNS in bunkei-data.js.
  const BUNKEI = [
    ['N5', [
      ['te-kudasai', 'please do', '〜てください', '食[た]べてください'],
      ['naide-kudasai', 'please don\'t', '〜ないでください', '食[た]べないでください'],
      ['tai', 'want to', '〜たいです', '食[た]べたいです', ['たい']],
      ['masen-ka', 'won\'t you…? (invitation)', '〜ませんか', '食[た]べませんか'],
      ['mashou', 'let\'s', '〜ましょう', '食[た]べましょう'],
      ['te-iru', 'am doing (now)', '〜ています', '食[た]べています', ['ている']],
      ['te-mo-ii', 'may I…?', '〜てもいいですか', '食[た]べてもいいですか', ['てもいい', 'てもいいです']],
      ['te-wa-ikenai', 'must not', '〜てはいけません', '食[た]べてはいけません', ['てはいけない']],
      ['te-kara', 'after doing', '〜てから', '食[た]べてから'],
      ['mae-ni', 'before doing', '〜前[まえ]に', '食[た]べる前[まえ]に', ['る前[まえ]に']],
    ]],
    ['N4', [
      ['potential', 'can', '〜(ら)れます', '食[た]べられます', ['られます', 'れます', 'られる', 'れる']],
      ['potential-neg', 'can\'t', '〜(ら)れません', '食[た]べられません', ['られません', 'れません', 'られない', 'れない']],
      ['nakereba-naranai', 'must, have to', '〜なければなりません', '食[た]べなければなりません', ['なければならない']],
      ['nakute-mo-ii', 'don\'t have to', '〜なくてもいいです', '食[た]べなくてもいいです', ['なくてもいい']],
      ['sasete-kudasai', 'please let me', '〜させてください', '食[た]べさせてください'],
      ['ta-koto-ga-aru', 'have (ever) done', '〜たことがあります', '食[た]べたことがあります', ['たことがある']],
      ['te-shimau', 'ended up doing (regret)', '〜てしまいました', '食[た]べてしまいました', ['てしまう', 'てしまった', 'ちゃった']],
      ['te-oku', 'do in advance', '〜ておきます', '食[た]べておきます', ['ておく']],
      ['te-miru', 'try doing', '〜てみます', '食[た]べてみます', ['てみる']],
      ['te-mimashou', 'let\'s try doing', '〜てみましょう', '食[た]べてみましょう'],
      ['te-kuru', 'go and do (and come back)', '〜てきます', '食[た]べてきます', ['てくる']],
      ['tsumori', 'plan to, intend to', '〜つもりです', '食[た]べるつもりです', ['つもり']],
      ['volitional-to-omou', 'thinking of doing', '〜(よ)うと思[おも]っています', '食[た]べようと思[おも]っています',
        ['ようと思[おも]っています', 'うと思[おも]っています', 'ようと思[おも]う', 'うと思[おも]う']],
      ['hou-ga-ii', 'you\'d better', '〜た方[ほう]がいいです', '食[た]べた方[ほう]がいいです', ['た方[ほう]がいい']],
      ['kamoshirenai', 'might', '〜かもしれません', '食[た]べるかもしれません', ['かもしれない']],
      ['te-hoshii', 'want someone to', '〜てほしいです', '食[た]べてほしいです', ['てほしい']],
      ['nagara', 'while doing', '〜ながら', '食[た]べながら'],
      ['tara', 'once, when (I\'ve done)', '〜たら', '食[た]べたら'],
      ['ba-yokatta', 'I wish I had', '〜ばよかったです', '食[た]べればよかったです', ['ばよかった', 'ればよかったです', 'ればよかった']],
      ['you-ni-naru', 'can now, have come to', '〜ようになりました', '食[た]べられるようになりました', ['ようになる', 'ようになった']],
      ['te-ageru', 'shall I … for you?', '〜てあげましょうか', '作[つく]ってあげましょうか', ['てあげる']],
      ['te-kureru', 'did … for me', '〜てくれました', '作[つく]ってくれました', ['てくれる', 'てくれた']],
      ['te-morau', 'had someone do … for me', '〜てもらいました', '作[つく]ってもらいました', ['てもらう', 'てもらった']],
      ['passive', 'had … done to me', '〜(ら)れました', '食[た]べられました', ['られました', 'れました', 'られた', 'れた']],
      ['sugiru', 'did too much', '〜すぎました', '食[た]べすぎました', ['すぎる', 'すぎた', '過[す]ぎました', '過[す]ぎる']],
      ['hajimeru', 'started doing', '〜始[はじ]めました', '読[よ]み始[はじ]めました', ['始[はじ]める']],
    ]],
    ['N3', [
      ['causative-passive', 'was made to', '〜させられました', '食[た]べさせられました', ['させられる', 'させられた']],
      ['beki', 'should, ought to', '〜べきです', '食[た]べるべきです', ['べき', 'べきだ']],
      ['koto-ni-suru', 'decided to', '〜ことにしました', '食[た]べることにしました', ['ことにする', 'ことにした']],
      ['you-ni-suru', 'make a point of', '〜ようにしています', '食[た]べるようにしています', ['ようにする', 'ようにしている']],
      ['wake-ni-wa-ikanai', 'can\'t possibly', '〜わけにはいきません', '食[た]べるわけにはいきません', ['わけにはいかない']],
      ['koto-wa-nai', 'there\'s no need to', '〜ことはありません', '食[た]べることはありません', ['ことはない']],
      ['te-bakari', 'do nothing but', '〜てばかりいます', '食[た]べてばかりいます', ['てばかりいる', 'てばかり']],
      ['you-to-suru', 'tried to (but couldn\'t)', '〜(よ)うとしました', '食[た]べようとしました', ['ようとしました', 'うとしました', 'ようとした', 'うとした']],
      ['zuni', 'without doing', '〜ずに', '食[た]べずに'],
    ]],
  ];
  // The prompt shows the example's verb: 食べる, or 作る for the favours and
  // 読む for 〜始める, which read oddly with "eat".
  const BUNKEI_VERBS = { 食: '食[た]べる', 作: '作[つく]る', 読: '読[よ]む' };
  const bunkeiItems = rows => rows.map(([id, meaning, form, example, alt = []]) => {
    const verb = BUNKEI_VERBS[example[0]];
    return {
      id,
      prompt: `${meaning}  (${rubyPlain(verb)})`,
      promptHtml: `${esc(meaning)} <span class="misc-prompt-en">(${rubyHtml(verb)})</span>`,
      answer: rubyPlain(form),
      answerHtml: `${rubyHtml(form)} <span class="misc-prompt-en">${rubyHtml(example)}</span>`,
      accept: [form, example, ...alt].flatMap(m => [rubyPlain(m), rubyKana(m)]),
    };
  });

  // The same patterns as multiple choice, either way round: the meaning with
  // the forms of that level to pick from, or the form with the meanings.
  // After answering, the example shows the pattern on a verb.
  const bunkeiChoiceItems = (rows, pick) => rows.map(([id, meaning, form, example]) => {
    const note = rubyHtml(example);
    return pick === 'form'
      ? { id, prompt: meaning, answer: rubyPlain(form), answerHtml: rubyHtml(form), note }
      : { id, prompt: rubyPlain(form), promptHtml: rubyHtml(form), answer: meaning, note };
  });

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

  // Comparisons with より, のほう, ほど, というより and にもまして: read the sentence (or the little
  // exchange), then pick which one is cheaper, bigger, slower… Each item is
  // [sentence, question, options (answer first), English, why]. An option's
  // " (…)" part is an English gloss; SAME is "about the same".
  const SAME = '同[おな]じぐらい (about the same)';
  const COMPARE = [
    ['A は B より … — the first one is more (N5)', [
      ['東京[とうきょう]は大阪[おおさか]より大[おお]きいです。', 'Which city is bigger?', ['東京[とうきょう]', '大阪[おおさか]'],
        'Tokyo is bigger than Osaka.',
        'A は B より 大きい: A is bigger than B. より ("than") comes after the one that loses, so the topic, 東京, is the bigger one.'],
      ['このかばんはあのかばんより高[たか]いです。', 'Which bag is cheaper?', ['あのかばん', 'このかばん'],
        'This bag is more expensive than that bag.',
        'このかばん is the more expensive (高い) one. The question asks the opposite, cheaper, so it\'s the one before より: あのかばん.'],
      ['電車[でんしゃ]はバスより速[はや]いです。', 'Which is slower?', ['バス', '電車[でんしゃ]'],
        'The train is faster than the bus.',
        'The train is the faster (速い) one; より marks what it beats, the bus — so the bus is slower.'],
      ['兄[あに]は私[わたし]より背[せ]が高[たか]いです。', 'Who is taller?', ['兄[あに] (my brother)', '私[わたし] (me)'],
        'My older brother is taller than me.',
        '背が高い = tall. 兄 is the topic (は) and 私 comes before より, so my brother is the taller one.'],
      ['今日[きょう]はきのうより寒[さむ]いです。', 'Which day was warmer?', ['きのう (yesterday)', '今日[きょう] (today)'],
        'Today is colder than yesterday.',
        'Today is the colder (寒い) one, so yesterday, the day before より, was warmer.'],
      ['この部屋[へや]はあの部屋[へや]より狭[せま]いです。', 'Which room is larger?', ['あの部屋[へや]', 'この部屋[へや]'],
        'This room is smaller than that room.',
        '狭い = small (of a space), the opposite of 広い. この部屋 is the smaller one, so あの部屋 is larger.'],
      ['日本語[にほんご]は英語[えいご]より難[むずか]しいです。', 'Which language does the speaker find easier?', ['英語[えいご]', '日本語[にほんご]'],
        'Japanese is more difficult than English.',
        '日本語 is the more difficult (難しい) one; より marks 英語, which is therefore the easier one.'],
      ['北海道[ほっかいどう]は九州[きゅうしゅう]より広[ひろ]いです。', 'Which is smaller?', ['九州[きゅうしゅう]', '北海道[ほっかいどう]'],
        'Hokkaido is larger than Kyushu.',
        '広い = large (in area). 北海道 is the larger, so 九州, before より, is the smaller — Hokkaido is about twice its size.'],
    ]],
    ['B より A のほうが … — the のほう one is more (N5)', [
      ['バスより電車[でんしゃ]のほうが安[やす]いです。', 'Which is cheaper?', ['電車[でんしゃ] (the train)', 'バス (the bus)'],
        'The train is cheaper than the bus.',
        'のほうが marks the winner: 電車のほうが安い, "the train is the cheaper side". The より part comes first here, but it still marks the other one, バス.'],
      ['肉[にく]より魚[さかな]のほうが好[す]きです。', 'Which does the speaker like more?', ['魚[さかな] (fish)', '肉[にく] (meat)'],
        'I like fish more than meat.',
        '魚のほうが好き: fish is the one they like more. 肉より = "than meat".'],
      ['山[やま]のほうが海[うみ]より好[す]きです。', 'Which does the speaker like less?', ['海[うみ] (the sea)', '山[やま] (the mountains)'],
        'I like the mountains more than the sea.',
        'The order can flip: A のほうが B より … still means A is more. 山 has のほうが, so the sea (海より) is the one they like less.'],
      ['コーヒーより紅茶[こうちゃ]のほうがよく飲[の]みます。', 'Which does the speaker drink more often?', ['紅茶[こうちゃ] (tea)', 'コーヒー (coffee)'],
        'I drink tea more often than coffee.',
        'Comparisons work with verbs too: 紅茶のほうがよく飲みます, "tea is the one I drink more often (よく)".'],
      ['父[ちち]より母[はは]のほうが料理[りょうり]が上手[じょうず]です。', 'Who is the better cook?', ['母[はは] (my mother)', '父[ちち] (my father)'],
        'My mother is a better cook than my father.',
        '料理が上手 = good at cooking. 母 has のほうが, so she is the better cook; 父より = "than my father".'],
      ['東京[とうきょう]タワーよりスカイツリーのほうが高[たか]いです。', 'Which is lower?', ['東京[とうきょう]タワー', 'スカイツリー'],
        'The Skytree is taller than Tokyo Tower.',
        '高い means tall here. The Skytree (634 m) is the taller, so Tokyo Tower (333 m), before より, is the lower one.'],
      ['このスマホより、あのスマホのほうが軽[かる]いです。', 'Which phone is heavier?', ['このスマホ', 'あのスマホ'],
        'That phone is lighter than this one.',
        'あのスマホ is the lighter (軽い) one, so このスマホ, the one with より, is heavier.'],
      ['新幹線[しんかんせん]のほうが飛行機[ひこうき]より遅[おそ]いです。', 'Which is faster?', ['飛行機[ひこうき] (the plane)', '新幹線[しんかんせん] (the shinkansen)'],
        'The shinkansen is slower than the plane.',
        '遅い = slow. The shinkansen is the slower one (のほうが), so the plane (飛行機より) is faster.'],
    ]],
    ['どちらが…？ — asking and answering (N5)', [
      ['A：夏[なつ]と冬[ふゆ]と、どちらが好[す]きですか。\nB：冬[ふゆ]のほうが好[す]きです。', 'Which season does B like more?', ['冬[ふゆ] (winter)', '夏[なつ] (summer)'],
        'A: Which do you like more, summer or winter? B: I like winter more.',
        'A と B と、どちらが…ですか asks "which of A and B is more …?". The answer names the winner with のほうが: 冬のほうが.'],
      ['A：北海道[ほっかいどう]と沖縄[おきなわ]と、どっちが暑[あつ]い？\nB：沖縄[おきなわ]のほうが暑[あつ]いよ。', 'Which is cooler?', ['北海道[ほっかいどう]', '沖縄[おきなわ]'],
        'A: Which is hotter, Hokkaido or Okinawa? B: Okinawa is hotter.',
        'どっち is casual どちら. 沖縄 is the hotter (暑い) one, so 北海道 is cooler.'],
      ['A：りんごとみかんと、どちらが高[たか]いですか。\nB：みかんより、りんごのほうが高[たか]いです。', 'Which is cheaper?', ['みかん (mandarins)', 'りんご (apples)'],
        'A: Which is more expensive, apples or mandarins? B: Apples are more expensive than mandarins.',
        'りんご has のほうが (more expensive); みかん has より, so mandarins are the cheaper ones.'],
      ['A：日本[にほん]とアメリカと、どちらが大[おお]きいですか。\nB：アメリカのほうがずっと大[おお]きいです。', 'Which is smaller?', ['日本[にほん]', 'アメリカ'],
        'A: Which is bigger, Japan or America? B: America is much bigger.',
        'ずっと before the adjective in a comparison means "by far". America is much bigger, so Japan is the smaller.'],
      ['A：電車[でんしゃ]とタクシーと、どちらが速[はや]いですか。\nB：この時間[じかん]は電車[でんしゃ]のほうが速[はや]いですよ。', 'At this time of day, which is slower?', ['タクシー', '電車[でんしゃ]'],
        'A: Which is faster, the train or a taxi? B: At this time of day the train is faster.',
        '電車のほうが速い: the train wins on speed (traffic, probably), so the taxi is the slower one.'],
      ['A：赤[あか]いのと青[あお]いのと、どっちがいい？\nB：青[あお]いほうがいいな。', 'Which one does B want?', ['青[あお]いの (the blue one)', '赤[あか]いの (the red one)'],
        'A: Which do you want, the red one or the blue one? B: The blue one, I think.',
        'After an adjective, ほう follows straight on, with no の: 青いほう, "the blue one". ほうがいい = "is better", so B picks the blue one.'],
      ['A：平日[へいじつ]と週末[しゅうまつ]と、どちらが忙[いそが]しいですか。\nB：週末[しゅうまつ]のほうが忙[いそが]しいです。', 'When does B have more free time?', ['平日[へいじつ] (weekdays)', '週末[しゅうまつ] (the weekend)'],
        'A: When are you busier, on weekdays or at the weekend? B: I\'m busier at the weekend.',
        'The weekend is the busier (忙しい) time, so B has more free time on weekdays, 平日.'],
    ]],
    ['ほど…ない and 同じぐらい — not as … as, as … as (N4)', [
      ['大阪[おおさか]は東京[とうきょう]ほど大[おお]きくないです。', 'Which city is bigger?', ['東京[とうきょう]', '大阪[おおさか]', SAME],
        'Osaka is not as big as Tokyo.',
        'A は B ほど …ない: A is not as … as B. ほど, like より, marks the one compared against — but with the negative, that one wins: Tokyo is bigger.'],
      ['今年[ことし]の夏[なつ]は去年[きょねん]ほど暑[あつ]くなかったです。', 'Which summer was hotter?', ['去年[きょねん] (last year)', '今年[ことし] (this year)', SAME],
        'This summer wasn\'t as hot as last year\'s.',
        'This year\'s summer was not as hot as 去年 (last year\'s), so last year\'s summer was hotter.'],
      ['このレストランはあの店[みせ]ほど高[たか]くありません。', 'Which is cheaper?', ['このレストラン', 'あの店[みせ]', SAME],
        'This restaurant isn\'t as expensive as that place.',
        'このレストラン is "not as expensive as" あの店, so it is the cheaper one.'],
      ['漢字[かんじ]はひらがなほど簡単[かんたん]じゃありません。', 'Which is easier?', ['ひらがな', '漢字[かんじ]', SAME],
        'Kanji aren\'t as easy as hiragana.',
        'With a な-adjective the negative is じゃありません. Kanji are not as easy (簡単) as hiragana, so hiragana are easier.'],
      ['私[わたし]の部屋[へや]は姉[あね]の部屋[へや]ほど広[ひろ]くないです。', 'Whose room is smaller?', ['私[わたし]の部屋[へや] (mine)', '姉[あね]の部屋[へや] (my sister\'s)', SAME],
        'My room isn\'t as big as my older sister\'s.',
        'My room is "not as spacious (広い) as" my sister\'s, so mine is the smaller one.'],
      ['このかばんはあのかばんほど重[おも]くないです。', 'Which bag is lighter?', ['このかばん', 'あのかばん', SAME],
        'This bag isn\'t as heavy as that one.',
        'このかばん is "not as heavy (重い) as" あのかばん, so this bag is the lighter one.'],
      ['弟[おとうと]は私[わたし]と同[おな]じぐらい背[せ]が高[たか]いです。', 'Who is taller?', [SAME, '弟[おとうと] (my brother)', '私[わたし] (me)'],
        'My younger brother is about as tall as me.',
        'A は B と同じぐらい … = A is about as … as B, so neither is taller.'],
      ['兄[あに]は父[ちち]と同[おな]じくらい食[た]べます。', 'Who eats more?', [SAME, '兄[あに] (my brother)', '父[ちち] (my father)'],
        'My older brother eats about as much as my father.',
        '同じくらい is the same as 同じぐらい, and works with verbs too: they eat about the same amount.'],
    ]],
    ['Actions: 〜より 〜ほうが (N4)', [
      ['駅[えき]まではバスに乗[の]るより、歩[ある]いたほうが早[はや]いです。', 'Which gets you to the station sooner?', ['歩[ある]く (walking)', 'バスに乗[の]る (taking the bus)'],
        'It\'s quicker to walk to the station than to take the bus.',
        'Actions compare the same way: [verb]より, [verb]ほうが. 歩いたほう has ほうが, so walking is quicker (早い = soon, early).'],
      ['外[そと]で食[た]べるより、家[うち]で作[つく]るほうが安[やす]いです。', 'Which costs more?', ['外[そと]で食[た]べる (eating out)', '家[うち]で作[つく]る (cooking at home)'],
        'Cooking at home is cheaper than eating out.',
        'Cooking at home (作るほうが) is the cheaper one, so eating out (食べるより) costs more.'],
      ['見[み]るより、自分[じぶん]でやってみるほうが楽[たの]しいです。', 'Which is more fun?', ['やってみる (trying it yourself)', '見[み]る (watching)'],
        'Trying it yourself is more fun than watching.',
        'やってみる = "try doing". It has ほうが, so it\'s the more fun (楽しい) one.'],
      ['雨[あめ]の日[ひ]は、出[で]かけるより家[うち]にいるほうが好[す]きです。', 'What does the speaker prefer on rainy days?', ['家[うち]にいる (staying in)', '出[で]かける (going out)'],
        'On rainy days I prefer staying in to going out.',
        '家にいるほうが好き: staying at home is what they like more.'],
      ['一人[ひとり]で勉強[べんきょう]するより、友達[ともだち]と勉強[べんきょう]したほうが続[つづ]きます。', 'Which way is it easier to keep studying?', ['友達[ともだち]と (with friends)', '一人[ひとり]で (alone)'],
        'You keep at it longer studying with friends than alone.',
        '続く = to keep going. 友達と勉強したほう has ほうが, so studying with friends is easier to keep up.'],
      ['タクシーで行[い]くより、電車[でんしゃ]で行[い]ったほうがいいですよ。', 'What does the speaker recommend?', ['電車[でんしゃ]で (by train)', 'タクシーで (by taxi)'],
        'You\'d better go by train rather than by taxi.',
        '〜たほうがいい is advice, "you\'d better …"; より names what not to do. So: take the train.'],
    ]],
    ['Harder sentences — two comparisons, and traps (N3)', [
      ['東京[とうきょう]より大阪[おおさか]のほうが好[す]きだという人[ひと]は、思[おも]ったより多[おお]かった。', 'Which city do those people prefer?', ['大阪[おおさか]', '東京[とうきょう]'],
        'More people than I expected said they like Osaka better than Tokyo.',
        'Two より here: 思ったより ("than I thought") is about how many people there were. The comparison of the cities is 東京より大阪のほうが好き — Osaka wins.'],
      ['電車[でんしゃ]で行[い]くほうが、車[くるま]で行[い]くより時間[じかん]がかかるとは思[おも]わなかった。', 'Which takes longer?', ['電車[でんしゃ]で (by train)', '車[くるま]で (by car)'],
        'I didn\'t think going by train would take longer than going by car.',
        '〜とは思わなかった = "I didn\'t expect that …": the surprise doesn\'t undo the comparison. 電車で行くほうが時間がかかる — the train takes more time.'],
      ['兄[あに]は私[わたし]ほど甘[あま]い物[もの]が好[す]きではないが、姉[あね]は私[わたし]より好[す]きだ。', 'Who likes sweets the most?', ['姉[あね] (my sister)', '私[わたし] (me)', '兄[あに] (my brother)'],
        'My brother doesn\'t like sweets as much as I do, but my sister likes them more than I do.',
        'Put them in a row: 兄 < 私 (ほど…ではない: not as much as me), and 私 < 姉 (私より好き). So the sister likes sweets the most.'],
      ['今年[ことし]は去年[きょねん]より売[う]り上[あ]げが増[ふ]えたが、利益[りえき]は去年[きょねん]ほど多[おお]くなかった。', 'In which year was the profit bigger?', ['去年[きょねん] (last year)', '今年[ことし] (this year)', SAME],
        'This year sales rose compared with last year, but the profit wasn\'t as big as last year\'s.',
        'Two comparisons: sales (売り上げ) went up on last year (より), but profit (利益) was "not as big as" last year\'s (ほど…なかった). So last year\'s profit was bigger.'],
      ['このアパートは駅[えき]から遠[とお]いほうだが、前[まえ]のアパートよりは近[ちか]い。', 'Which apartment is closer to the station?', ['このアパート (this one)', '前[まえ]のアパート (the old one)'],
        'This apartment is rather far from the station, but it\'s closer than my old one.',
        'A trap: 遠いほうだ, with ほう and no より, means "on the far side, rather far" — it compares with places in general. より still decides it: this one is closer than the old one (前のアパートよりは近い).'],
      ['料理[りょうり]は、作[つく]るのより食[た]べるほうが得意[とくい]だと、父[ちち]は笑[わら]って言[い]った。', 'What is the father better at?', ['食[た]べる (eating)', '作[つく]る (cooking)'],
        'My father laughed and said he\'s better at eating than at cooking.',
        '得意 = good at. 作るのより食べるほうが得意 — eating has ほうが, so that\'s what he\'s better at (a joke).'],
      ['新[あたら]しいモデルは古[ふる]いモデルと比[くら]べて、値段[ねだん]はほとんど同[おな]じなのに、ずっと軽[かる]い。', 'Which one costs more?', [SAME, '新[あたら]しいモデル (the new one)', '古[ふる]いモデル (the old one)'],
        'Compared with the old model, the new one costs almost the same but is much lighter.',
        '〜と比べて = "compared with". The new model wins on weight (ずっと軽い), but the price (値段) is ほとんど同じ, almost the same.'],
      ['A：コーヒーと紅茶[こうちゃ]、どっちにする？\nB：どっちでもいいけど、強[し]いて言[い]えば紅茶[こうちゃ]かな。', 'Which does B lean towards?', ['紅茶[こうちゃ] (tea)', 'コーヒー (coffee)'],
        'A: Coffee or tea, which will you have? B: Either is fine, but if I had to choose, tea, I guess.',
        'どっちにする？ = "which will you have?". どっちでもいい = "either is fine", but 強いて言えば ("if I had to say") picks one: tea.'],
    ]],
    ['というより — not so much A as B (N3)', [
      ['今日[きょう]は暖[あたた]かいというより、暑[あつ]いぐらいです。', 'How would the speaker describe today?', ['暑[あつ]い (hot)', '暖[あたた]かい (warm)'],
        'Today isn\'t so much warm as almost hot.',
        'A というより B: "not so much A as B", "B rather than A". The speaker swaps the first word for a better one: warm doesn\'t go far enough, it\'s hot.'],
      ['彼[かれ]は友達[ともだち]というより、家族[かぞく]のような存在[そんざい]だ。', 'What is he to the speaker, more than anything?', ['家族[かぞく]のような存在[そんざい] (like family)', '友達[ともだち] (a friend)'],
        'He\'s less a friend than someone like family.',
        'The word after というより is the one the speaker settles on: 家族のような存在, "someone like family".'],
      ['この店[みせ]はレストランというより、居酒屋[いざかや]に近[ちか]い。', 'What is this place closer to?', ['居酒屋[いざかや] (an izakaya)', 'レストラン (a restaurant)'],
        'This place is closer to an izakaya than a restaurant.',
        'レストランというより = "rather than (calling it) a restaurant"; 居酒屋に近い = "it\'s closer to an izakaya".'],
      ['山田[やまだ]さんは厳[きび]しいというより、まじめなんだと思[おも]う。', 'Which word fits Yamada better, for the speaker?', ['まじめ (earnest)', '厳[きび]しい (strict)'],
        'I think Yamada isn\'t so much strict as earnest.',
        'Other people might call Yamada 厳しい; the speaker thinks まじめ describes them better.'],
      ['疲[つか]れたというより、少[すこ]し眠[ねむ]いだけです。', 'How does the speaker feel?', ['眠[ねむ]い (sleepy)', '疲[つか]れた (tired)'],
        'I\'m not really tired, just a little sleepy.',
        '疲れたというより: "it\'s not that I\'m tired". 少し眠いだけ, "just a little sleepy", is the real answer.'],
      ['A：日本語[にほんご]の勉強[べんきょう]、大変[たいへん]？\nB：大変[たいへん]というより、楽[たの]しいよ。', 'How does B find studying Japanese?', ['楽[たの]しい (fun)', '大変[たいへん] (hard)'],
        'A: Is studying Japanese tough? B: It\'s more fun than tough.',
        'B takes A\'s word, 大変, and puts a better one after というより: 楽しい.'],
      ['雨[あめ]が降[ふ]っているというより、霧[きり]が出[で]ている感[かん]じだ。', 'What is the weather more like?', ['霧[きり] (fog)', '雨[あめ] (rain)'],
        'It\'s not so much raining as foggy.',
        '霧が出ている = "there\'s fog"; 〜感じだ = "it feels like". Rain is the word the speaker sets aside.'],
      ['彼女[かのじょ]は歌手[かしゅ]としてというより、俳優[はいゆう]として知[し]られている。', 'What is she better known as?', ['俳優[はいゆう] (an actor)', '歌手[かしゅ] (a singer)'],
        'She is known more as an actor than as a singer.',
        'というより can follow a phrase too: 歌手としてというより, "rather than as a singer". She\'s known as an actor (俳優として).'],
    ]],
    ['にもまして — even more than (N2)', [
      ['今年[ことし]の夏[なつ]は、去年[きょねん]にもまして暑[あつ]い。', 'Which summer is hotter?', ['今年[ことし] (this year)', '去年[きょねん] (last year)', SAME],
        'This summer is even hotter than last year\'s.',
        'B にもまして A: "even more A than B". Like より it marks the one compared against, and adds that B was already hot. This year is hotter still.'],
      ['彼[かれ]は今[いま]、以前[いぜん]にもまして熱心[ねっしん]に練習[れんしゅう]している。', 'When does he practise harder?', ['今[いま] (now)', '以前[いぜん] (before)', SAME],
        'He now practises even harder than before.',
        '以前にもまして = "even more than before": he was keen before, and is keener now (熱心に = eagerly).'],
      ['仕事[しごと]も大事[だいじ]だが、何[なに]にもまして大切[たいせつ]なのは健康[けんこう]だ。', 'What matters most to the speaker?', ['健康[けんこう] (health)', '仕事[しごと] (work)'],
        'Work matters too, but what matters more than anything is health.',
        '何にもまして = "more than anything", "above all". Work is important (仕事も大事), but health comes first.'],
      ['駅[えき]ができてから、町[まち]は前[まえ]にもましてにぎやかになった。', 'When is the town livelier?', ['駅[えき]ができてから (since the station)', '前[まえ] (before)'],
        'Since the station was built, the town has become even livelier than before.',
        '前にもまして = "even more than before". The town was already lively, and the new station made it more so.'],
      ['円安[えんやす]で、今年[ことし]は外国[がいこく]からの観光客[かんこうきゃく]が昨年[さくねん]にもまして増[ふ]えている。', 'When are there more foreign tourists?', ['今年[ことし] (this year)', '昨年[さくねん] (last year)', SAME],
        'With the weak yen, foreign tourists are increasing this year even more than last year.',
        '昨年 is the formal 去年. 昨年にもまして: there were many last year, and even more this year. 円安 = the weak yen.'],
      ['兄[あに]も背[せ]が高[たか]いが、弟[おとうと]は兄[あに]にもまして背[せ]が高[たか]い。', 'Who is taller?', ['弟[おとうと] (the younger)', '兄[あに] (the older)', SAME],
        'The older brother is tall too, but the younger one is even taller.',
        'Both are tall (兄も), but 兄にもまして: the younger brother is taller still.'],
      ['彼女[かのじょ]の新[あたら]しい小説[しょうせつ]は、前作[ぜんさく]にもましておもしろい。', 'Which of her novels is more interesting?', ['新[あたら]しい小説[しょうせつ] (the new one)', '前作[ぜんさく] (the last one)', SAME],
        'Her new novel is even more interesting than her last one.',
        '前作 = previous work. にもまして says the last one was good, and the new one is better still.'],
    ]],
  ];

  // Sets 2 and 3: the same eight kinds of question, as more tabs.
  const COMPARE_2 = [
    [
      ['新幹線[しんかんせん]はバスより高[たか]いです。', 'Which is cheaper?', ['バス (the bus)', '新幹線[しんかんせん] (the shinkansen)'],
        'The shinkansen is more expensive than the bus.',
        'The shinkansen is the more expensive (高い) one, so the bus, before より, is cheaper.'],
      ['姉[あね]は私[わたし]より早[はや]く起[お]きます。', 'Who gets up later?', ['私[わたし] (me)', '姉[あね] (my sister)'],
        'My older sister gets up earlier than me.',
        'My sister gets up earlier (早く); より marks me, so I\'m the one who gets up later.'],
      ['京都[きょうと]は東京[とうきょう]より古[ふる]い町[まち]です。', 'Which city is newer?', ['東京[とうきょう]', '京都[きょうと]'],
        'Kyoto is an older city than Tokyo.',
        'Kyoto is the older (古い) one, so Tokyo, before より, is newer.'],
      ['このカメラはあのカメラより軽[かる]いです。', 'Which camera is heavier?', ['あのカメラ', 'このカメラ'],
        'This camera is lighter than that camera.',
        'このカメラ is the lighter (軽い) one, so あのカメラ is heavier.'],
      ['富士山[ふじさん]は高尾山[たかおさん]より高[たか]いです。', 'Which mountain is lower?', ['高尾山[たかおさん] (Mt Takao)', '富士山[ふじさん] (Mt Fuji)'],
        'Mt Fuji is higher than Mt Takao.',
        'Mt Fuji (3,776 m) is the higher one; より marks Mt Takao (599 m), the lower one.'],
      ['私[わたし]の家[いえ]は駅[えき]より学校[がっこう]に近[ちか]いです。', 'Is the speaker\'s house nearer the station or the school?', ['学校[がっこう] (the school)', '駅[えき] (the station)'],
        'My house is closer to the school than to the station.',
        'より can compare other parts of a sentence too: 駅より学校に近い = "closer to the school than (to) the station".'],
    ],
    [
      ['春[はる]より秋[あき]のほうが好[す]きです。', 'Which season does the speaker like less?', ['春[はる] (spring)', '秋[あき] (autumn)'],
        'I like autumn more than spring.',
        '秋のほうが好き: autumn is the favourite, so spring (春より) is liked less.'],
      ['手紙[てがみ]よりメールのほうが速[はや]いです。', 'Which is slower?', ['手紙[てがみ] (a letter)', 'メール (email)'],
        'Email is faster than a letter.',
        'メールのほうが速い: email wins on speed, so the letter is slower.'],
      ['姉[あね]のほうが私[わたし]より歌[うた]が上手[じょうず]です。', 'Who sings better?', ['姉[あね] (my sister)', '私[わたし] (me)'],
        'My older sister sings better than me.',
        '歌が上手 = good at singing. 姉 has のほうが, so she sings better.'],
      ['ラーメンよりうどんのほうがよく食[た]べます。', 'Which does the speaker eat less often?', ['ラーメン', 'うどん'],
        'I eat udon more often than ramen.',
        'うどんのほうがよく食べます: udon is eaten more often, so ramen less.'],
      ['平日[へいじつ]より日曜日[にちようび]のほうが店[みせ]が混[こ]んでいます。', 'When is the shop less crowded?', ['平日[へいじつ] (weekdays)', '日曜日[にちようび] (Sundays)'],
        'The shop is more crowded on Sundays than on weekdays.',
        '混んでいる = crowded. Sundays are more crowded, so weekdays are quieter.'],
      ['地下鉄[ちかてつ]よりタクシーのほうが便利[べんり]です。', 'Which is more convenient?', ['タクシー', '地下鉄[ちかてつ] (the subway)'],
        'A taxi is more convenient than the subway.',
        'タクシーのほうが便利: the taxi has のほうが, so it\'s the more convenient (便利) one.'],
    ],
    [
      ['A：犬[いぬ]と猫[ねこ]と、どちらが好[す]きですか。\nB：猫[ねこ]のほうが好[す]きです。', 'Which does B like less?', ['犬[いぬ] (dogs)', '猫[ねこ] (cats)'],
        'A: Which do you like more, dogs or cats? B: I like cats more.',
        'B answers with 猫のほうが, so cats win and dogs are liked less.'],
      ['A：東京[とうきょう]と大阪[おおさか]と、どちらが人[ひと]が多[おお]いですか。\nB：東京[とうきょう]のほうが多[おお]いです。', 'Which has fewer people?', ['大阪[おおさか]', '東京[とうきょう]'],
        'A: Which has more people, Tokyo or Osaka? B: Tokyo has more.',
        '東京のほうが多い: Tokyo has more people, so Osaka has fewer.'],
      ['A：月曜日[げつようび]と水曜日[すいようび]と、どちらが暇[ひま]ですか。\nB：水曜日[すいようび]のほうが暇[ひま]です。', 'On which day is B busier?', ['月曜日[げつようび] (Monday)', '水曜日[すいようび] (Wednesday)'],
        'A: Which day are you freer, Monday or Wednesday? B: I\'m freer on Wednesday.',
        '暇 = free, not busy. Wednesday is the freer day, so B is busier on Monday.'],
      ['A：この赤[あか]いシャツと白[しろ]いシャツ、どっちが安[やす]い？\nB：白[しろ]いほうが安[やす]いよ。', 'Which shirt costs more?', ['赤[あか]いシャツ (the red one)', '白[しろ]いシャツ (the white one)'],
        'A: Which is cheaper, this red shirt or the white one? B: The white one is cheaper.',
        '白いほう = "the white one" (no の after an adjective). It\'s the cheaper one, so the red shirt costs more.'],
      ['A：電話[でんわ]とメールと、どちらがいいですか。\nB：どちらでもいいですよ。', 'Which does B prefer?', ['どちらでもいい (either)', '電話[でんわ] (a call)', 'メール (email)'],
        'A: Which is better for you, a call or email? B: Either is fine.',
        'どちらでもいい = "either is fine": B has no preference, so neither wins.'],
      ['A：コーヒーと紅茶[こうちゃ]と、どちらがよろしいですか。\nB：じゃあ、コーヒーをお願[ねが]いします。', 'Which does B choose?', ['コーヒー (coffee)', '紅茶[こうちゃ] (tea)'],
        'A: Which would you like, coffee or tea? B: Coffee, please.',
        'An answer doesn\'t need のほう: B just orders coffee. よろしい is the polite いい that staff use.'],
    ],
    [
      ['北海道[ほっかいどう]の夏[なつ]は東京[とうきょう]ほど暑[あつ]くないです。', 'Where is summer hotter?', ['東京[とうきょう]', '北海道[ほっかいどう]', SAME],
        'Summer in Hokkaido isn\'t as hot as in Tokyo.',
        'A は B ほど …ない: A is not as … as B. Hokkaido isn\'t as hot, so Tokyo\'s summer is hotter.'],
      ['この本[ほん]はあの本[ほん]ほどおもしろくなかったです。', 'Which book was more interesting?', ['あの本[ほん] (that book)', 'この本[ほん] (this book)', SAME],
        'This book wasn\'t as interesting as that one.',
        'この本 was "not as interesting as" あの本, so that book was the more interesting one.'],
      ['私[わたし]は兄[あに]ほど速[はや]く走[はし]れません。', 'Who runs faster?', ['兄[あに] (my brother)', '私[わたし] (me)', SAME],
        'I can\'t run as fast as my older brother.',
        'ほど works with verbs too: 兄ほど速く走れません, "can\'t run as fast as my brother". He\'s faster.'],
      ['今日[きょう]はきのうと同[おな]じぐらい寒[さむ]いです。', 'Which day is colder?', [SAME, '今日[きょう] (today)', 'きのう (yesterday)'],
        'Today is about as cold as yesterday.',
        'A は B と同じぐらい … = A is about as … as B: neither day is colder.'],
      ['バスはタクシーほど便利[べんり]じゃありませんが、安[やす]いです。', 'Which is more convenient?', ['タクシー', 'バス', SAME],
        'The bus isn\'t as convenient as a taxi, but it\'s cheap.',
        'The bus is "not as convenient (便利) as" the taxi, so the taxi is more convenient. The bus wins on price.'],
      ['このりんごは、あのりんごと大[おお]きさが同[おな]じです。', 'Which apple is bigger?', [SAME, 'このりんご', 'あのりんご'],
        'This apple is the same size as that one.',
        '大きさ = size (大きい → 大きさ). Their size is 同じ, the same.'],
    ],
    [
      ['買[か]うより借[か]りるほうが安[やす]いです。', 'Which costs less?', ['借[か]りる (renting)', '買[か]う (buying)'],
        'Renting is cheaper than buying.',
        '[verb]より [verb]ほうが: 借りるほう has ほうが, so renting is cheaper.'],
      ['夜[よる]勉強[べんきょう]するより、朝[あさ]勉強[べんきょう]したほうが覚[おぼ]えられます。', 'When does the speaker remember more?', ['朝[あさ] (in the morning)', '夜[よる] (at night)'],
        'I can remember more when I study in the morning than at night.',
        '覚えられる = can remember. 朝勉強したほう has ほうが, so mornings work better.'],
      ['一人[ひとり]で行[い]くより、みんなで行[い]ったほうが楽[たの]しいですよ。', 'Which is more fun?', ['みんなで (all together)', '一人[ひとり]で (alone)'],
        'It\'s more fun to go all together than alone.',
        'みんなで行ったほう has ほうが: going together is more fun.'],
      ['自分[じぶん]で直[なお]すより、店[みせ]に頼[たの]んだほうが早[はや]いです。', 'Which is quicker?', ['店[みせ]に頼[たの]む (asking the shop)', '自分[じぶん]で直[なお]す (fixing it yourself)'],
        'It\'s quicker to ask the shop than to fix it yourself.',
        '頼む = ask (someone to do it). 店に頼んだほう wins: it\'s quicker.'],
      ['話[はな]すより聞[き]くほうが得意[とくい]です。', 'What is the speaker better at?', ['聞[き]く (listening)', '話[はな]す (speaking)'],
        'I\'m better at listening than speaking.',
        '得意 = good at. 聞くほうが得意: listening is their strength.'],
      ['寝[ね]る前[まえ]にスマホを見[み]るより、本[ほん]を読[よ]んだほうがよく眠[ねむ]れます。', 'What helps the speaker sleep better?', ['本[ほん]を読[よ]む (reading a book)', 'スマホを見[み]る (the phone)'],
        'I sleep better if I read a book before bed rather than look at my phone.',
        'よく眠れる = can sleep well. 本を読んだほう has ほうが, so reading helps.'],
    ],
    [
      ['姉[あね]は母[はは]より背[せ]が高[たか]いが、父[ちち]ほどではない。', 'Who is the tallest?', ['父[ちち] (my father)', '姉[あね] (my sister)', '母[はは] (my mother)'],
        'My sister is taller than my mother, but not as tall as my father.',
        'In a row: 母 < 姉 (母より高い), and 姉 < 父 (父ほどではない, "not as … as father"). Father is the tallest.'],
      ['車[くるま]は便利[べんり]だが、この町[まち]では自転車[じてんしゃ]のほうが早[はや]く着[つ]くことが多[おお]い。', 'In this town, which usually gets you there sooner?', ['自転車[じてんしゃ] (a bike)', '車[くるま] (a car)'],
        'Cars are convenient, but in this town you often get there sooner by bike.',
        '〜ことが多い = "it often happens that…". The car is 便利, but the bike (のほうが) arrives sooner.'],
      ['去年[きょねん]ほどではないが、今年[ことし]も雪[ゆき]がたくさん降[ふ]った。', 'Which year had more snow?', ['去年[きょねん] (last year)', '今年[ことし] (this year)', SAME],
        'It wasn\'t as much as last year, but a lot of snow fell this year too.',
        'ほどではない = "not as much as". This year had a lot too (今年も), but last year had more.'],
      ['値段[ねだん]だけなら駅前[えきまえ]の店[みせ]のほうが安[やす]いが、品物[しなもの]はこの店[みせ]のほうがいい。', 'Where are the goods better?', ['この店[みせ] (this shop)', '駅前[えきまえ]の店[みせ] (the shop by the station)'],
        'On price alone the shop by the station is cheaper, but the goods are better at this shop.',
        'Two のほう, each about something else: price (値段) → the station shop; goods (品物) → this shop. The question is about the goods.'],
      ['兄[あに]より私[わたし]のほうが年上[としうえ]に見[み]られることが多[おお]い。', 'Who is actually older?', ['兄[あに] (my brother)', '私[わたし] (me)'],
        'People often take me for older than my older brother.',
        'A trap: 年上に見られる = "be taken for older". People think I look older, but 兄 means older brother — he really is older.'],
      ['私[わたし]の町[まち]は人口[じんこう]では隣[となり]の町[まち]より少[すく]ないが、面積[めんせき]では二倍[にばい]もある。', 'Which town is larger in area?', ['私[わたし]の町[まち] (mine)', '隣[となり]の町[まち] (the next town)'],
        'My town has fewer people than the next town, but it\'s twice as big in area.',
        '人口 = population (my town has fewer); 面積 = area, and 二倍もある = "is as much as twice". So my town is larger in area.'],
    ],
    [
      ['あの人[ひと]は先生[せんせい]というより、友達[ともだち]みたいだ。', 'What is that person more like to the speaker?', ['友達[ともだち] (a friend)', '先生[せんせい] (a teacher)'],
        'That person is more like a friend than a teacher.',
        'A というより B: the word after というより, 友達, is the one the speaker settles on.'],
      ['この料理[りょうり]は辛[から]いというより、痛[いた]いぐらいだ。', 'How does the dish feel?', ['痛[いた]い (painful)', '辛[から]い (spicy)'],
        'This dish isn\'t so much spicy as almost painful.',
        '辛い doesn\'t go far enough for the speaker: it\'s so hot it almost hurts (痛いぐらい).'],
      ['彼[かれ]は話[はな]すのが下手[へた]というより、恥[は]ずかしがり屋[や]なのだ。', 'Why doesn\'t he talk much, really?', ['恥[は]ずかしがり屋[や] (he\'s shy)', '下手[へた] (he\'s bad at it)'],
        'It\'s not so much that he\'s bad at talking — he\'s shy.',
        '恥ずかしがり屋 = a shy person. 〜のだ gives the real reason, after というより sets aside the other one.'],
      ['A：昨日[きのう]のパーティー、楽[たの]しかった？\nB：楽[たの]しかったというより、疲[つか]れたかな。', 'How did B feel about the party?', ['疲[つか]れた (tired)', '楽[たの]しかった (it was fun)'],
        'A: Was yesterday\'s party fun? B: More tiring than fun, I\'d say.',
        'B takes A\'s word, 楽しかった, and swaps in a better one after というより: 疲れた.'],
      ['ここは町[まち]というより、村[むら]に近[ちか]い。', 'What is this place closer to?', ['村[むら] (a village)', '町[まち] (a town)'],
        'This place is closer to a village than a town.',
        '町というより = "rather than a town"; 村に近い = "closer to a village".'],
      ['怒[おこ]っているというより、悲[かな]しんでいるように見[み]えた。', 'How did they seem?', ['悲[かな]しんでいる (sad)', '怒[おこ]っている (angry)'],
        'They seemed sad rather than angry.',
        '〜ように見えた = "seemed". Angry is set aside; sad (悲しんでいる) is what they looked like.'],
    ],
    [
      ['今回[こんかい]の試験[しけん]は、前回[ぜんかい]にもまして難[むずか]しかった。', 'Which exam was harder?', ['今回[こんかい] (this one)', '前回[ぜんかい] (the last one)', SAME],
        'This exam was even harder than the last one.',
        'B にもまして A: "even more A than B". The last exam was hard, and this one was harder still.'],
      ['新[あたら]しい部長[ぶちょう]は、前[まえ]の部長[ぶちょう]にもまして厳[きび]しい。', 'Who is stricter?', ['新[あたら]しい部長[ぶちょう] (the new manager)', '前[まえ]の部長[ぶちょう] (the old manager)', SAME],
        'The new manager is even stricter than the last one.',
        'The old manager was strict (厳しい), and the new one is stricter still.'],
      ['店[みせ]の評判[ひょうばん]は、料理[りょうり]にもましてサービスの良[よ]さで広[ひろ]がった。', 'What did the most for the shop\'s name?', ['サービス (the service)', '料理[りょうり] (the food)'],
        'The shop\'s reputation spread thanks to its good service, even more than its food.',
        '評判 = reputation. The food helped, but 料理にもまして: the service did even more.'],
      ['雨[あめ]の日[ひ]は、晴[は]れの日[ひ]にもまして道[みち]が混[こ]む。', 'When are the roads more crowded?', ['雨[あめ]の日[ひ] (rainy days)', '晴[は]れの日[ひ] (sunny days)', SAME],
        'On rainy days the roads are even more crowded than on sunny days.',
        'The roads are busy on sunny days too, and even busier when it rains.'],
      ['今年[ことし]の新入社員[しんにゅうしゃいん]は、例年[れいねん]にもましてやる気[き]がある。', 'Which new staff are keener?', ['今年[ことし] (this year\'s)', '例年[れいねん] (most years\')', SAME],
        'This year\'s new employees are even more motivated than in most years.',
        '例年 = an ordinary year, most years. やる気 = motivation. This year\'s are keener still.'],
      ['祖母[そぼ]は退院[たいいん]してから、前[まえ]にもまして元気[げんき]になった。', 'When is the grandmother livelier?', ['退院[たいいん]してから (since leaving hospital)', '前[まえ] (before)'],
        'Since leaving hospital, my grandmother has become even livelier than before.',
        '退院する = leave hospital. 前にもまして = "even more than before".'],
    ],
  ];

  const COMPARE_3 = [
    [
      ['私[わたし]の部屋[へや]は兄[あに]の部屋[へや]より明[あか]るいです。', 'Whose room is darker?', ['兄[あに]の部屋[へや] (my brother\'s)', '私[わたし]の部屋[へや] (mine)'],
        'My room is brighter than my brother\'s.',
        'My room is the brighter (明るい) one, so my brother\'s, before より, is darker.'],
      ['八月[はちがつ]は六月[ろくがつ]より暑[あつ]いです。', 'Which month is cooler?', ['六月[ろくがつ] (June)', '八月[はちがつ] (August)'],
        'August is hotter than June.',
        'August is the hotter one; より marks June, the cooler month.'],
      ['中国[ちゅうごく]は日本[にほん]より人[ひと]が多[おお]いです。', 'Which country has fewer people?', ['日本[にほん] (Japan)', '中国[ちゅうごく] (China)'],
        'China has more people than Japan.',
        'China has more people (人が多い), so Japan, before より, has fewer.'],
      ['父[ちち]は母[はは]より料理[りょうり]が下手[へた]です。', 'Who cooks better?', ['母[はは] (my mother)', '父[ちち] (my father)'],
        'My father is a worse cook than my mother.',
        '下手 = bad at. Father is the worse cook, so mother, before より, cooks better.'],
      ['新[あたら]しい駅[えき]は古[ふる]い駅[えき]より大[おお]きいです。', 'Which station is smaller?', ['古[ふる]い駅[えき] (the old one)', '新[あたら]しい駅[えき] (the new one)'],
        'The new station is bigger than the old one.',
        'The new station is bigger, so the old station, before より, is smaller.'],
      ['日曜日[にちようび]は土曜日[どようび]より道[みち]が空[す]いています。', 'On which day are the roads busier?', ['土曜日[どようび] (Saturday)', '日曜日[にちようび] (Sunday)'],
        'The roads are emptier on Sunday than on Saturday.',
        '空いている = empty, not crowded. Sunday is emptier, so Saturday is busier.'],
    ],
    [
      ['日本語[にほんご]より英語[えいご]のほうが上手[じょうず]です。', 'Which language does the speaker speak less well?', ['日本語[にほんご] (Japanese)', '英語[えいご] (English)'],
        'I\'m better at English than Japanese.',
        '英語のほうが上手: English is the stronger one, so Japanese is weaker.'],
      ['電車[でんしゃ]より車[くるま]のほうが便利[べんり]です。', 'Which is less convenient?', ['電車[でんしゃ] (the train)', '車[くるま] (a car)'],
        'A car is more convenient than the train.',
        '車のほうが便利: the car wins, so the train is less convenient.'],
      ['赤[あか]いのより、黒[くろ]いのほうが似合[にあ]いますよ。', 'Which one suits the listener better?', ['黒[くろ]いの (the black one)', '赤[あか]いの (the red one)'],
        'The black one suits you better than the red one.',
        '似合う = suit, look good on. 黒いのほうが似合う: the black one does.'],
      ['朝[あさ]ご飯[はん]より晩[ばん]ご飯[はん]のほうがたくさん食[た]べます。', 'Which meal is smaller?', ['朝[あさ]ご飯[はん] (breakfast)', '晩[ばん]ご飯[はん] (dinner)'],
        'I eat more at dinner than at breakfast.',
        '晩ご飯のほうがたくさん: dinner is the bigger meal, so breakfast is smaller.'],
      ['大阪[おおさか]のほうが京都[きょうと]より人[ひと]が多[おお]いです。', 'Which city has fewer people?', ['京都[きょうと]', '大阪[おおさか]'],
        'Osaka has more people than Kyoto.',
        '大阪のほうが多い: Osaka has more people; 京都より marks Kyoto, which has fewer.'],
      ['去年[きょねん]より今年[ことし]のほうが雨[あめ]が少[すく]ないです。', 'Which year had more rain?', ['去年[きょねん] (last year)', '今年[ことし] (this year)'],
        'There\'s less rain this year than last year.',
        'Careful: 少ない = little, few. This year has less rain (のほうが少ない), so last year had more.'],
    ],
    [
      ['A：海[うみ]と山[やま]と、どちらへ行[い]きたいですか。\nB：山[やま]のほうがいいです。', 'Where does B want to go?', ['山[やま] (the mountains)', '海[うみ] (the sea)'],
        'A: Where would you like to go, the sea or the mountains? B: The mountains would be better.',
        '山のほうがいい: B prefers the mountains.'],
      ['A：バスと電車[でんしゃ]と、どちらが安[やす]いですか。\nB：バスのほうが少[すこ]し安[やす]いです。', 'Which costs more?', ['電車[でんしゃ] (the train)', 'バス (the bus)'],
        'A: Which is cheaper, the bus or the train? B: The bus is a little cheaper.',
        'バスのほうが安い: the bus is cheaper, so the train costs more — but only a little (少し).'],
      ['A：大[おお]きいのと小[ちい]さいのと、どっちにする？\nB：小[ちい]さいほうにする。', 'Which one does B take?', ['小[ちい]さいの (the small one)', '大[おお]きいの (the big one)'],
        'A: Which will you have, the big one or the small one? B: I\'ll take the small one.',
        '〜にする = decide on. 小さいほうにする: B picks the small one.'],
      ['A：お兄[にい]さんとお姉[ねえ]さんと、どちらが背[せ]が高[たか]いですか。\nB：姉[あね]のほうが高[たか]いです。', 'Who is shorter?', ['兄[あに] (the brother)', '姉[あね] (the sister)'],
        'A: Who is taller, your brother or your sister? B: My sister is taller.',
        'お兄さん / お姉さん are the polite words for someone else\'s family; B answers with 姉 for their own sister. She\'s taller, so the brother is shorter.'],
      ['A：日本[にほん]の映画[えいが]と外国[がいこく]の映画[えいが]と、どちらをよく見[み]ますか。\nB：外国[がいこく]の映画[えいが]のほうがよく見[み]ます。', 'Which films does B watch less?', ['日本[にほん]の映画[えいが] (Japanese)', '外国[がいこく]の映画[えいが] (foreign)'],
        'A: Which do you watch more, Japanese or foreign films? B: I watch foreign films more.',
        'With a verb, どちら takes を: どちらをよく見ますか. Foreign films win, so Japanese films are watched less.'],
      ['A：午前[ごぜん]と午後[ごご]と、どちらが都合[つごう]がいいですか。\nB：午後[ごご]のほうが都合[つごう]がいいです。', 'When suits B?', ['午後[ごご] (the afternoon)', '午前[ごぜん] (the morning)'],
        'A: Which suits you better, the morning or the afternoon? B: The afternoon suits me better.',
        '都合がいい = convenient (for a time or plan). 午後のほうが: the afternoon.'],
    ],
    [
      ['今週[こんしゅう]は先週[せんしゅう]ほど忙[いそが]しくないです。', 'Which week is busier?', ['先週[せんしゅう] (last week)', '今週[こんしゅう] (this week)', SAME],
        'This week isn\'t as busy as last week.',
        'This week is "not as busy as" last week, so last week was busier.'],
      ['私[わたし]の町[まち]は東京[とうきょう]ほど物価[ぶっか]が高[たか]くありません。', 'Where are prices higher?', ['東京[とうきょう]', '私[わたし]の町[まち] (my town)', SAME],
        'Prices in my town aren\'t as high as in Tokyo.',
        '物価 = prices, the cost of living. My town is "not as expensive as" Tokyo, so Tokyo is pricier.'],
      ['弟[おとうと]は私[わたし]ほど勉強[べんきょう]しません。', 'Who studies more?', ['私[わたし] (me)', '弟[おとうと] (my brother)', SAME],
        'My younger brother doesn\'t study as much as I do.',
        '私ほど勉強しません = "doesn\'t study as much as me". I study more.'],
      ['この店[みせ]のラーメンは、あの店[みせ]のと同[おな]じぐらいおいしいです。', 'Which shop\'s ramen is better?', [SAME, 'この店[みせ] (this shop)', 'あの店[みせ] (that shop)'],
        'This shop\'s ramen is about as good as that shop\'s.',
        'あの店の = "that shop\'s (ramen)". 同じぐらいおいしい: they\'re about as good as each other.'],
      ['今[いま]の家[いえ]は前[まえ]の家[いえ]ほど広[ひろ]くないですが、駅[えき]に近[ちか]いです。', 'Which house is bigger?', ['前[まえ]の家[いえ] (the old one)', '今[いま]の家[いえ] (the one now)', SAME],
        'My house now isn\'t as big as my old one, but it\'s near the station.',
        'The house now is "not as spacious (広い) as" the old one, so the old house was bigger.'],
      ['姉[あね]と私[わたし]は同[おな]じぐらいの時間[じかん]に家[いえ]を出[で]ます。', 'Who leaves home earlier?', [SAME, '姉[あね] (my sister)', '私[わたし] (me)'],
        'My sister and I leave home at about the same time.',
        '同じぐらいの時間 = "about the same time": neither leaves earlier.'],
    ],
    [
      ['バスを待[ま]つより、タクシーに乗[の]ったほうが早[はや]いです。', 'Which is quicker?', ['タクシーに乗[の]る (taking a taxi)', 'バスを待[ま]つ (waiting for the bus)'],
        'Taking a taxi is quicker than waiting for the bus.',
        'タクシーに乗ったほう has ほうが: the taxi is quicker.'],
      ['新[あたら]しいのを買[か]うより、直[なお]して使[つか]うほうがいいと思[おも]います。', 'What does the speaker think is better?', ['直[なお]して使[つか]う (repairing it)', '新[あたら]しいのを買[か]う (buying a new one)'],
        'I think it\'s better to repair it and keep using it than to buy a new one.',
        '直して使う = "repair and use". It has ほうがいい, so that\'s the speaker\'s choice.'],
      ['テレビを見[み]るより、外[そと]で遊[あそ]ぶほうが好[す]きです。', 'What does the speaker like more?', ['外[そと]で遊[あそ]ぶ (playing outside)', 'テレビを見[み]る (watching TV)'],
        'I like playing outside more than watching TV.',
        '外で遊ぶほうが好き: playing outside wins.'],
      ['書[か]くより読[よ]むほうが簡単[かんたん]です。', 'Which is harder?', ['書[か]く (writing)', '読[よ]む (reading)'],
        'Reading is easier than writing.',
        '読むほうが簡単: reading is the easier one, so writing (書くより) is harder.'],
      ['熱[ねつ]があるなら、学校[がっこう]に行[い]くより休[やす]んだほうがいいです。', 'What\'s the advice?', ['休[やす]む (rest)', '学校[がっこう]に行[い]く (go to school)'],
        'If you have a fever, you\'d better rest rather than go to school.',
        '〜なら = "if". 〜たほうがいい gives advice, and より names what not to do: rest, don\'t go.'],
      ['エレベーターを待[ま]つより、階段[かいだん]を使[つか]ったほうが早[はや]いですよ。', 'Which is quicker?', ['階段[かいだん]を使[つか]う (the stairs)', 'エレベーターを待[ま]つ (waiting for the lift)'],
        'It\'s quicker to take the stairs than to wait for the lift.',
        '階段を使ったほう has ほうが: the stairs are quicker.'],
    ],
    [
      ['田中[たなか]さんは山田[やまだ]さんほど背[せ]が高[たか]くないが、木村[きむら]さんよりは高[たか]い。', 'Who is the shortest?', ['木村[きむら]さん', '田中[たなか]さん', '山田[やまだ]さん'],
        'Tanaka isn\'t as tall as Yamada, but is taller than Kimura.',
        'In a row: 田中 < 山田 (山田さんほど…ない), and 木村 < 田中 (木村さんよりは高い). Kimura is the shortest.'],
      ['年[とし]を取[と]るにつれて、肉[にく]より魚[さかな]のほうを好[この]むようになった。', 'What does the speaker prefer now?', ['魚[さかな] (fish)', '肉[にく] (meat)'],
        'As I\'ve got older, I\'ve come to prefer fish to meat.',
        '〜につれて = "as (time goes on)"; 好む = like (written style). ほう takes を here, as the object of 好む: 魚のほうを好む.'],
      ['東京[とうきょう]から大阪[おおさか]までは、飛行機[ひこうき]より新幹線[しんかんせん]を使[つか]う人[ひと]のほうが多[おお]い。', 'Tokyo to Osaka: which do more people use?', ['新幹線[しんかんせん] (the shinkansen)', '飛行機[ひこうき] (the plane)'],
        'From Tokyo to Osaka, more people take the shinkansen than fly.',
        'のほうが goes on the whole phrase 新幹線を使う人, "people who use the shinkansen": there are more of them.'],
      ['この薬[くすり]は前[まえ]の薬[くすり]ほど眠[ねむ]くならないので、仕事[しごと]の前[まえ]でも飲[の]める。', 'Which medicine makes you sleepier?', ['前[まえ]の薬[くすり] (the old one)', 'この薬[くすり] (this one)', SAME],
        'This medicine doesn\'t make me as sleepy as the old one, so I can take it even before work.',
        '眠くならない = doesn\'t make you sleepy. This one is "not as (sleep-making) as" the old one, so the old one made you sleepier.'],
      ['若[わか]いころは都会[とかい]のほうが好[す]きだったが、今[いま]は田舎[いなか]のほうが落[お]ち着[つ]く。', 'Where does the speaker feel more at ease now?', ['田舎[いなか] (the countryside)', '都会[とかい] (the city)'],
        'When I was young I preferred the city, but now I feel more at ease in the countryside.',
        'Two のほう at two times: young → the city; now (今は) → the countryside. 落ち着く = feel at ease.'],
      ['子供[こども]のころ、私[わたし]は兄[あに]より足[あし]が速[はや]かったが、今[いま]は兄[あに]にかなわない。', 'Who runs faster now?', ['兄[あに] (my brother)', '私[わたし] (me)', SAME],
        'As a child I ran faster than my older brother, but now I can\'t beat him.',
        '足が速い = fast on your feet. 〜にかなわない = "can\'t beat". I was faster then; now my brother is.'],
    ],
    [
      ['父[ちち]の料理[りょうり]は料理[りょうり]というより、実験[じっけん]だ。', 'What is father\'s cooking more like?', ['実験[じっけん] (an experiment)', '料理[りょうり] (cooking)'],
        'My father\'s cooking is less cooking than an experiment.',
        'A というより B: what comes after というより, 実験, is the better description (a joke).'],
      ['この町[まち]は静[しず]かというより、寂[さび]しい感[かん]じがする。', 'How does the town feel?', ['寂[さび]しい (lonely)', '静[しず]か (quiet)'],
        'This town feels lonely rather than quiet.',
        '静か is a nice word; the speaker picks the less kind 寂しい after というより.'],
      ['テニスは運動[うんどう]というより、友達[ともだち]に会[あ]うための時間[じかん]だ。', 'What is tennis to the speaker, really?', ['友達[ともだち]に会[あ]うための時間[じかん] (time with friends)', '運動[うんどう] (exercise)'],
        'Tennis is less exercise than a time to see friends.',
        '〜ための時間 = "time for…". After というより: it\'s a way to see friends.'],
      ['A：あの映画[えいが]、怖[こわ]かった？\nB：怖[こわ]いというより、ちょっと悲[かな]しい話[はなし]だったよ。', 'What was the film like?', ['悲[かな]しい (sad)', '怖[こわ]い (scary)'],
        'A: Was that film scary? B: It was more of a sad story than scary.',
        'B sets aside A\'s word 怖い and puts 悲しい after というより.'],
      ['彼[かれ]が遅刻[ちこく]したのは寝坊[ねぼう]というより、電車[でんしゃ]が止[と]まったからだ。', 'Why was he late?', ['電車[でんしゃ]が止[と]まった (the train stopped)', '寝坊[ねぼう] (he overslept)'],
        'He was late not so much because he overslept as because the train stopped.',
        '遅刻 = being late; 寝坊 = oversleeping. 〜からだ gives the real reason: the train.'],
      ['この仕事[しごと]は難[むずか]しいというより、時間[じかん]がかかるのだ。', 'What is the problem with this job?', ['時間[じかん]がかかる (it takes time)', '難[むずか]しい (it\'s hard)'],
        'This job isn\'t so much hard as time-consuming.',
        '時間がかかる = take time. The difficulty isn\'t the point; the time is.'],
    ],
    [
      ['今年[ことし]の冬[ふゆ]は、例年[れいねん]にもまして雪[ゆき]が多[おお]い。', 'Which winter has more snow?', ['今年[ことし] (this year)', '例年[れいねん] (most years)', SAME],
        'This winter there\'s even more snow than in most years.',
        '例年 = an ordinary year. 例年にもまして: there\'s plenty of snow most years, and even more this year.'],
      ['決勝[けっしょう]の前[まえ]は、予選[よせん]の時[とき]にもまして選手[せんしゅ]たちが緊張[きんちょう]している。', 'When are the players more nervous?', ['決勝[けっしょう]の前[まえ] (before the final)', '予選[よせん] (the heats)', SAME],
        'Before the final, the players are even more nervous than in the heats.',
        '決勝 = the final; 予選 = the heats; 緊張する = be nervous. Nervous in the heats, more so before the final.'],
      ['この町[まち]では、車[くるま]にもまして自転車[じてんしゃ]が便利[べんり]だ。', 'Which is more convenient in this town?', ['自転車[じてんしゃ] (a bike)', '車[くるま] (a car)', SAME],
        'In this town, a bike is even more convenient than a car.',
        'A car is convenient, and 車にもまして, a bike is more so.'],
      ['誕生日[たんじょうび]にはプレゼントもたくさんもらったが、何[なに]にもまして嬉[うれ]しかったのは母[はは]からの手紙[てがみ]だった。', 'What made the speaker happiest?', ['母[はは]からの手紙[てがみ] (mother\'s letter)', 'プレゼント (the presents)'],
        'I got lots of presents for my birthday, but what made me happiest of all was a letter from my mother.',
        '何にもまして = "more than anything". The presents were nice, but the letter came first.'],
      ['新[あたら]しいスマホは、前[まえ]のモデルにもまして電池[でんち]が長[なが]く持[も]つ。', 'Whose battery lasts longer?', ['新[あたら]しいスマホ (the new phone)', '前[まえ]のモデル (the old model)', SAME],
        'The new phone\'s battery lasts even longer than the previous model\'s.',
        '持つ = last. The old model\'s battery was good; the new one is better still.'],
      ['引[ひ]っ越[こ]してから、以前[いぜん]にもまして運動[うんどう]するようになった。', 'When does the speaker exercise more?', ['引[ひ]っ越[こ]してから (since moving)', '以前[いぜん] (before)', SAME],
        'Since moving, I\'ve started exercising even more than before.',
        '引っ越す = move house. 以前にもまして = "even more than before".'],
    ],
  ];
  const COMPARE_SETS = [COMPARE, ...[COMPARE_2, COMPARE_3].map(set => set.map((rows, k) => [COMPARE[k][0], rows]))];

  // An option: its Japanese (furigana markup) and English gloss, if any.
  function compareOption(o) {
    const [, ja, en] = o.match(/^(.*?)(?: \((.*)\))?$/);
    return {
      text: rubyPlain(ja),
      html: rubyHtml(ja) + (en ? ` <span class="misc-prompt-en" lang="en">(${esc(en)})</span>` : ''),
      last: o === SAME,
    };
  }
  const compareItems = rows => rows.map(([sentence, question, options, en, why]) => ({
    prompt: `${rubyPlain(sentence).replace(/\n/g, ' ')} — ${question}`,
    promptHtml: `${sentence.split('\n').map(rubyHtml).join('<br>')}<span class="misc-question" lang="en">${esc(question)}</span>`,
    sentence: rubyPlain(sentence),
    answer: compareOption(options[0]).text,
    options: options.map(compareOption),
    note: `<span lang="en"><b>“${esc(en)}”</b> ${rubyHtml(why)}</span>`,
  }));

  // 〜たがる, "wanting" seen from outside: 〜たい is for what I want (or what
  // you want, asked to your face); for anyone else Japanese says 〜たがっている
  // ("is showing that they want"), or 〜たがる for a habit, and 〜をほしがる for a
  // thing. Read the sentence and pick who wants what — or pick the form. Same
  // rows as the comparisons: [sentence, question, options (answer first),
  // English, why].
  const TAGARU = [
    ['Who wants it? — 〜たい (me) or 〜たがる (someone else) (N4)', [
      ['私[わたし]はすしが食[た]べたいですが、弟[おとうと]はハンバーガーを食[た]べたがっています。', 'Who wants a hamburger?', ['弟[おとうと] (my little brother)', '私[わたし] (me)'],
        'I want to eat sushi, but my little brother wants to eat a hamburger.',
        '〜たい is for your own wishes: 私は…食べたい. You can\'t see into someone else\'s head, so for them Japanese says 〜たがっている, "is showing that he wants". 弟 has たがっています, so the hamburger is his.'],
      ['妹[いもうと]は海[うみ]に行[い]きたがっていますが、私[わたし]は山[やま]に行[い]きたいです。', 'Who wants to go to the mountains?', ['私[わたし] (me)', '妹[いもうと] (my little sister)'],
        'My little sister wants to go to the sea, but I want to go to the mountains.',
        '山に行きたいです ends in たい, the speaker\'s own wish. The sister\'s wish has たがっています: she wants the sea.'],
      ['娘[むすめ]は犬[いぬ]を飼[か]いたがっていますが、夫[おっと]は猫[ねこ]を飼[か]いたがっています。', 'Who wants a cat?', ['夫[おっと] (my husband)', '娘[むすめ] (my daughter)'],
        'My daughter wants to get a dog, but my husband wants to get a cat.',
        'Two other people, so two たがっています — read which person goes with which animal. 飼う = keep (a pet). 夫…猫を飼いたがっています.'],
      ['子[こ]どもたちは外[そと]で遊[あそ]びたがっていますが、私[わたし]は家[いえ]で休[やす]みたいです。', 'Who wants to rest at home?', ['私[わたし] (me)', '子[こ]どもたち (the children)'],
        'The children want to play outside, but I want to rest at home.',
        '休みたいです is the speaker\'s own wish (たい); the children\'s is 遊びたがっています, to play outside.'],
      ['田中[たなか]さんは日本[にほん]に住[す]みたがっています。私[わたし]は日本[にほん]に旅行[りょこう]したいだけです。', 'Who wants to live in Japan?', ['田中[たなか]さん', '私[わたし] (me)'],
        'Tanaka-san wants to live in Japan. I only want to travel there.',
        '住みたがっています: Tanaka-san (someone else, so たがる). 旅行したいだけ = "I just want to travel" — the speaker\'s own wish.'],
      ['A：週末[しゅうまつ]、何[なに]がしたい？\nB：私[わたし]は映画[えいが]が見[み]たいけど、兄[あに]はゲームをしたがってるよ。', 'Who wants to play games?', ['兄[あに] (B\'s big brother)', 'B', 'A'],
        'A: What do you want to do this weekend? B: I want to see a film, but my brother wants to play games.',
        'したがってる is casual したがっている. B wants the film (見たい); the games are what B\'s brother wants. A only asks — 何がしたい? uses たい because it asks B about B\'s own wish.'],
      ['父[ちち]は新[あたら]しい車[くるま]を買[か]いたがっていますが、母[はは]は買[か]いたくないと言[い]っています。', 'Who wants a new car?', ['父[ちち] (my father)', '母[はは] (my mother)'],
        'My father wants to buy a new car, but my mother says she doesn\'t want to.',
        '父…買いたがっています: Father wants it. Mother\'s 買いたくない is in her own words (と言っています), so it keeps たい — and it\'s a "doesn\'t want".'],
      ['私[わたし]はもう帰[かえ]りたいのに、友[とも]だちはまだ飲[の]みたがっています。', 'Who wants to keep drinking?', ['友[とも]だち (my friend)', '私[わたし] (me)'],
        'I want to go home already, but my friend still wants to drink.',
        '〜のに = "even though". The speaker wants to go home (帰りたい); the friend, with たがっています, wants to keep drinking (まだ = still).'],
    ]],
    ['What do they want? — 〜をほしがる and 〜たがる (N4)', [
      ['弟[おとうと]はゲームはもう持[も]っているので、今[いま]は自転車[じてんしゃ]をほしがっています。', 'What does the little brother want now?', ['自転車[じてんしゃ] (a bike)', 'ゲーム (a game)'],
        'My little brother already has a game, so now he wants a bike.',
        'ほしい (want a thing) works like たい: for someone else it becomes ほしがる, and the thing takes を. He already has (もう持っている) the game.'],
      ['犬[いぬ]は散歩[さんぽ]に行[い]きたがっていますが、猫[ねこ]はごはんをほしがっています。', 'What does the cat want?', ['ごはん (food)', '散歩[さんぽ] (a walk)'],
        'The dog wants to go for a walk, but the cat wants food.',
        'Animals are "someone else" too. 猫はごはんをほしがっています — the cat wants food; the walk is the dog\'s wish.'],
      ['娘[むすめ]は誕生日[たんじょうび]に、人形[にんぎょう]ではなくて本[ほん]をほしがっています。', 'What does the daughter want for her birthday?', ['本[ほん] (a book)', '人形[にんぎょう] (a doll)'],
        'For her birthday my daughter wants a book, not a doll.',
        'A ではなくて B = "not A but B". The B part has をほしがっています: a book.'],
      ['息子[むすこ]はサッカーをやめて、野球[やきゅう]をしたがっています。', 'What does the son want to play?', ['野球[やきゅう] (baseball)', 'サッカー (football)'],
        'My son wants to quit football and play baseball.',
        'サッカーをやめて = "quitting football". What he wants to do is 野球をしたがっています.'],
      ['姉[あね]はパソコンではなく、新[あたら]しいカメラをほしがっています。', 'What does the older sister want?', ['カメラ (a camera)', 'パソコン (a computer)'],
        'My older sister wants a new camera, not a computer.',
        'ではなく is ではなくて, "not". 新しいカメラをほしがっています: a camera.'],
      ['A：お子[こ]さんは何[なに]をほしがっていますか。\nB：前[まえ]からギターをほしがっています。ピアノはあまり好[す]きじゃないみたいです。', 'What does B\'s child want?', ['ギター (a guitar)', 'ピアノ (a piano)'],
        'A: What does your child want? B: They\'ve wanted a guitar for a while. They don\'t seem to like the piano much.',
        'Asking about a third person, A uses ほしがっています too. 前から = "for a while now". The piano is what the child doesn\'t like much.'],
      ['友[とも]だちは日本[にほん]で着物[きもの]を着[き]たがっていましたが、浴衣[ゆかた]しか着[き]られませんでした。', 'What did the friend want to wear?', ['着物[きもの] (a kimono)', '浴衣[ゆかた] (a yukata)'],
        'My friend wanted to wear a kimono in Japan, but could only wear a yukata.',
        'たがっていました = "wanted" (past). 〜しか…ません = "only": the yukata is what she got to wear, the kimono what she wanted.'],
      ['祖母[そぼ]は旅行[りょこう]より、家族[かぞく]みんなで食事[しょくじ]をしたがっています。', 'What does the grandmother want to do?', ['食事[しょくじ] (have a meal with the family)', '旅行[りょこう] (travel)'],
        'Rather than a trip, my grandmother wants to have a meal with the whole family.',
        '旅行より = "rather than a trip" — より marks the one she wants less. 食事をしたがっています: a family meal.'],
    ]],
    ['Pick the form — 〜たい or 〜たがる? (N4)', [
      ['私[わたし]は日本[にほん]へ（　）。', '“I want to go to Japan.”', ['行[い]きたいです', '行[い]きたがっています'],
        'I want to go to Japan.',
        'Your own wish: 〜たい. 私は行きたがっています would sound as if you were watching yourself from outside.'],
      ['弟[おとうと]は日本[にほん]へ（　）。', '“My little brother wants to go to Japan.”', ['行[い]きたがっています', '行[い]きたいです'],
        'My little brother wants to go to Japan.',
        'Someone else\'s wish: 〜たがっている. 弟は行きたいです sounds as if you could feel his wishes yourself.'],
      ['田中[たなか]さんは新[あたら]しいパソコンを（　）。', '“Tanaka-san wants a new computer.”', ['ほしがっています', 'ほしいです'],
        'Tanaka-san wants a new computer.',
        'ほしい (want a thing) works like たい: for someone else, ほしがっています — and the thing takes を, as here.'],
      ['あなたは何[なに]が（　）か。', '“What do you want to eat?”', ['食[た]べたいです', '食[た]べたがっています'],
        'What do you want to eat?',
        'Asking someone about their own wish, to their face, uses たい. And たがる takes を, not が — 何が fits only たい.'],
      ['うちの犬[いぬ]は毎朝[まいあさ]外[そと]で（　）。', '“Every morning our dog wants to play outside.”', ['遊[あそ]びたがります', '遊[あそ]びたいです'],
        'Every morning our dog wants to play outside.',
        'The dog isn\'t you, so たがる. 〜たがります, without ている, is a habit — what he always wants (毎朝); 〜たがっています is what he wants right now.'],
      ['子[こ]どもは何[なん]でも自分[じぶん]で（　）ものだ。', '“Children want to do everything by themselves.”', ['やりたがる', 'やりたい'],
        'Children want to do everything by themselves.',
        'Something true of children in general: plain 〜たがる, the habit form. 〜ものだ = "that\'s how it is".'],
      ['弟[おとうと]は野菜[やさい]を（　）。', '“My little brother doesn\'t want to eat vegetables.”', ['食[た]べたがりません', '食[た]べたくないです'],
        'My little brother doesn\'t want to eat vegetables.',
        'たがる is a U-verb: its negative is たがらない, たがりません. 食べたくない is for your own "don\'t want".'],
      ['妹[いもうと]は「早[はや]く家[いえ]に（　）」と言[い]っています。', '“My little sister is saying, ‘I want to go home soon.’”', ['帰[かえ]りたい', '帰[かえ]りたがる'],
        'My little sister is saying, "I want to go home soon."',
        'Inside a quote she speaks for herself, so it\'s たい. Outside one you\'d say 妹は帰りたがっています.'],
    ]],
    ['Harder — not wanting, wanted, habits and hearsay (N3)', [
      ['兄[あに]は留学[りゅうがく]したがっていたが、結局[けっきょく]日本[にほん]で就職[しゅうしょく]した。', 'What did the brother end up doing?', ['就職[しゅうしょく] (got a job in Japan)', '留学[りゅうがく] (studied abroad)'],
        'My older brother wanted to study abroad, but in the end he got a job in Japan.',
        'たがっていた = "wanted" — then. 結局 = "in the end": he got a job (就職) at home instead.'],
      ['息子[むすこ]は歯医者[はいしゃ]に行[い]きたがらないが、娘[むすめ]は平気[へいき]だ。', 'Who doesn\'t want to go to the dentist?', ['息子[むすこ] (my son)', '娘[むすめ] (my daughter)'],
        'My son doesn\'t want to go to the dentist, but my daughter doesn\'t mind.',
        '行きたがらない is the negative, "doesn\'t want to go". 平気 = "fine, doesn\'t mind".'],
      ['父[ちち]が会[あ]いたがっていると聞[き]いて、私[わたし]は久[ひさ]しぶりに実家[じっか]に帰[かえ]った。', 'Who wanted to meet?', ['父[ちち] (my father)', '私[わたし] (me)'],
        'Hearing that my father wanted to see me, I went home to my parents\' for the first time in a long while.',
        'Inside the と聞いて clause, 父が is the one wanting (会いたがっている). The speaker heard it and went home (実家 = parents\' home).'],
      ['年配[ねんぱい]の人[ひと]は田舎[いなか]に戻[もど]りたがるが、若[わか]い人[ひと]は都会[とかい]に住[す]みたがる傾向[けいこう]がある。', 'Who tends to want to live in the city?', ['若[わか]い人[ひと] (young people)', '年配[ねんぱい]の人[ひと] (older people)'],
        'Older people want to move back to the countryside, while young people tend to want to live in the city.',
        'Plain 〜たがる for how people tend to be; 傾向がある = "tend to". 都会 = the city, 田舎 = the countryside.'],
      ['山田[やまだ]さんは来[き]たがっていたそうだが、仕事[しごと]で来[こ]られなかった。代[か]わりに鈴木[すずき]さんが来[き]た。', 'Who wanted to come but couldn\'t?', ['山田[やまだ]さん', '鈴木[すずき]さん'],
        'I hear Yamada-san wanted to come, but couldn\'t because of work. Suzuki-san came instead.',
        '〜たがっていたそうだ = "I hear he wanted to". 来られなかった = couldn\'t come. Suzuki-san came in his place (代わりに).'],
      ['姉[あね]が行[い]きたがっていたコンサートに、私[わたし]が代[か]わりに行[い]った。', 'Who went to the concert?', ['私[わたし] (me)', '姉[あね] (my older sister)'],
        'I went instead to the concert my older sister had wanted to go to.',
        '姉が行きたがっていた describes the concert: "the concert my sister wanted to go to". But 私が代わりに行った — I went in her place.'],
      ['母[はは]は私[わたし]に医者[いしゃ]になってほしがっていたが、私[わたし]は先生[せんせい]になった。', 'What did the mother want the speaker to become?', ['医者[いしゃ] (a doctor)', '先生[せんせい] (a teacher)'],
        'My mother wanted me to become a doctor, but I became a teacher.',
        '〜てほしい = "want someone to do"; for someone else\'s wish it becomes 〜てほしがる. 私に marks who she wanted it from.'],
      ['うちの猫[ねこ]は抱[だ]っこされるのは嫌[いや]がるのに、ひざの上[うえ]にはすぐ乗[の]りたがる。', 'What does the cat want?', ['ひざの上[うえ] (to sit on my lap)', '抱[だ]っこ (to be held)'],
        'Our cat hates being held, yet always wants to climb onto my lap.',
        '嫌がる (shows it hates) is たがる\'s partner: both 〜がる describe what others feel, from the outside. Being held it hates; ひざの上に乗りたがる — the lap it wants.'],
    ]],
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
      id: 'bunkei',
      glyph: '型',
      title: 'Bunkei patterns',
      ja: '文型',
      desc: `The ${BUNKEI.reduce((n, [, rows]) => n + rows.length, 0)} sentence patterns from the Bunkei drill, N5 to N3: what form says "please let me", "must", "might"…? The ending (させてください) or the whole verb (食べさせてください) both count.`,
      sections: BUNKEI.map(([level, rows]) => ({
        type: 'fill',
        label: level,
        columns: ['Meaning', 'Pattern'],
        items: bunkeiItems(rows),
      })),
    },
    {
      id: 'bunkei-form',
      glyph: '形',
      title: 'Bunkei: pick the form',
      ja: '文型 — 意味から形へ',
      desc: 'Multiple choice: which form says "must", "might", "please let me"…? Four forms from the same level to pick from.',
      sections: BUNKEI.map(([level, rows]) => ({
        type: 'choice',
        label: level,
        columns: ['Meaning', 'Form'],
        items: bunkeiChoiceItems(rows, 'form'),
      })),
    },
    {
      id: 'bunkei-meaning',
      glyph: '意',
      title: 'Bunkei: pick the meaning',
      ja: '文型 — 形から意味へ',
      desc: 'Multiple choice the other way round: what does 〜てしまいました, 〜わけにはいきません… mean? Four meanings to pick from.',
      sections: BUNKEI.map(([level, rows]) => ({
        type: 'choice',
        label: level,
        columns: ['Form', 'Meaning'],
        items: bunkeiChoiceItems(rows, 'meaning'),
      })),
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
      id: 'keigo-equivalents',
      glyph: '丁',
      title: 'Keigo equivalents',
      ja: '敬語の言い換え',
      desc: 'Multiple choice: what\'s the keigo for 食べる, ここ, 今日, すみません…? Pick the polite equivalent of everyday verbs, words and phrases from four.',
      sections: [
        {
          type: 'choice',
          label: 'Honorific verbs 尊敬語 — what others do',
          columns: ['Verb', '尊敬語'],
          items: keigoChoiceItems(SONKEIGO),
        },
        {
          type: 'choice',
          label: 'Humble verbs 謙譲語 — what you do',
          columns: ['Verb', '謙譲語'],
          items: keigoChoiceItems(KENJOUGO),
        },
        {
          type: 'choice',
          label: 'Words 改まった言葉',
          columns: ['Everyday', 'Formal'],
          items: keigoWordItems(KEIGO_WORDS),
        },
        {
          type: 'choice',
          label: 'Phrases 丁寧な言い方',
          columns: ['Everyday', 'Polite'],
          items: keigoWordItems(KEIGO_PHRASES),
        },
      ],
    },
    // One quiz per set, shown as tabs of one quiz (group).
    ...COMPARE_SETS.map((set, n) => ({
      id: n ? `comparisons-${n + 1}` : 'comparisons',
      group: 'comparisons',
      tab: `Set ${n + 1}`,
      glyph: '比',
      title: 'より and のほう: which one?',
      ja: '比較 — どちらが？',
      desc: 'Read a comparison with より, のほう, ほど, というより or にもまして and pick which one is more expensive, cheaper, bigger, smaller, faster… from easy N5 sentences to tricky ones. Every answer is explained.',
      sections: set.map(([label, rows]) => ({
        type: 'choice',
        label,
        stack: true,
        columns: ['Sentence', 'Which one?'],
        items: compareItems(rows),
      })),
    })),
    {
      id: 'tagaru',
      glyph: '欲',
      title: '〜たがる: who wants what?',
      ja: '〜たがる — 誰が何を？',
      desc: 'I want: 〜たい. He, she or they want: 〜たがっている, 〜たがります, 〜をほしがる. Read a sentence and pick who wants what — or pick the right form — from N4 to N3. Every answer is explained.',
      sections: TAGARU.map(([label, rows]) => ({
        type: 'choice',
        label,
        stack: true,
        columns: ['Sentence', 'Which one?'],
        items: compareItems(rows),
      })),
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

  // The options for multiple-choice item i: its own answer and up to n - 1
  // others from the same section (none spelled the same, and none of the
  // item's other right answers, its close list), in random order.
  function choiceOptions(section, i, rand = Math.random, n = 4) {
    const close = (section.items[i].close || []).map(rubyPlain);
    const seen = new Set([section.items[i].answer, ...close]);
    const others = shuffled(section.items.length, rand).filter(j => {
      if (seen.has(section.items[j].answer)) return false;
      seen.add(section.items[j].answer);
      return true;
    }).slice(0, n - 1);
    const opts = [i, ...others];
    return shuffled(opts.length, rand).map(k => opts[k]);
  }

  // The buttons for multiple-choice item i, as { html, right }. An item with
  // options of its own (the comparisons) offers those, answer first in the
  // data, shuffled except "about the same", which stays last; otherwise the
  // options are other items' answers, from choiceOptions.
  function choiceButtons(section, i, rand = Math.random) {
    const it = section.items[i];
    if (it.options) {
      const order = shuffled(it.options.length, rand);
      return [...order.filter(k => !it.options[k].last), ...order.filter(k => it.options[k].last)]
        .map(k => ({ html: it.options[k].html, text: it.options[k].text, right: k === 0 }));
    }
    return choiceOptions(section, i, rand).map(j => ({
      html: section.items[j].answerHtml || esc(section.items[j].answer), text: section.items[j].answer, right: j === i,
    }));
  }

  // The quizzes shown as tabs of one: those in the same group, in order.
  const tabsOf = quiz => QUIZZES.filter(q => q.group && q.group === quiz.group);

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

  // order: 'none' (as listed), 'section' (shuffled within each category) or
  // 'all' (every question mixed together). Older saves had shuffle: true.
  function loadSettings() {
    let settings = {};
    try { settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; } catch { /* private mode */ }
    if (!ORDERS.includes(settings.order)) settings.order = settings.shuffle ? 'section' : 'none';
    delete settings.shuffle;
    return settings;
  }
  function saveSettings(settings) {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* private mode */ }
  }

  const ORDERS = ['none', 'section', 'all'];

  // Where each row goes for an order: [{ section, rows }] for each table to
  // fill, rows as [section, row] in order. `sections` lists the section
  // index of each one that can be reordered and its number of rows; with
  // 'all' every row goes into one table (section -1).
  function rowOrder(sections, order, rand = Math.random) {
    const rows = sec => Array.from({ length: sec.n }, (_, i) => [sec.si, i]);
    const mix = list => shuffled(list.length, rand).map(k => list[k]);
    if (order === 'all' && sections.length > 1) return [{ section: -1, rows: mix(sections.flatMap(rows)) }];
    return sections.map(sec => ({ section: sec.si, rows: order === 'none' ? rows(sec) : mix(rows(sec)) }));
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
    let wrong = [];       // per section, the multiple-choice items answered wrong
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
      list.innerHTML = QUIZZES.filter(q => !q.group || tabsOf(q)[0] === q).map(q => {
        const best = store[q.id];
        const n = total(q);
        const choice = q.sections.every(sec => sec.type === 'choice');
        let meta = best ? `Best ${best.score} / ${n}<br>${formatTime(best.time)}` : `${n} ${choice ? 'questions' : 'to name'}`;
        let perfect = best && best.score === n;
        if (q.group) {
          // A quiz in tabs: each tab's best, or how many questions in all.
          const tabs = tabsOf(q);
          const played = tabs.filter(t => store[t.id]);
          meta = played.length
            ? played.map(t => `${esc(t.tab)}: ${store[t.id].score} / ${total(t)}`).join('<br>')
            : `${tabs.reduce((a, t) => a + total(t), 0)} questions<br>${tabs.length} sets`;
          perfect = tabs.every(t => store[t.id] && store[t.id].score === total(t));
        }
        return `<button class="lis-part-row misc-row${perfect ? ' misc-row-perfect' : ''}" data-quiz="${q.id}">
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
      wrong = quiz.sections.map(() => new Set());
      over = false;
      started = Date.now();
      $('#misc-title').textContent = quiz.title;
      $('#misc-desc').textContent = quiz.desc;
      $('#misc-result').classList.add('hidden');
      $('#misc-give-up').classList.remove('hidden');
      $('#misc-again').classList.add('hidden');
      renderQuiz();
      // Only prompts you answer one by one have an order worth mixing up, and
      // only typed ones answers worth typing again.
      $('#misc-toggles').classList.toggle('hidden', !quiz.sections.some(sec => sec.type !== 'find'));
      $('#misc-retype-row').classList.toggle('hidden', !quiz.sections.some(sec => sec.type === 'fill'));
      $('#misc-retype').checked = !!settings.retype;
      renderTabs();
      renderOrder();
      $('#misc-body').classList.remove('misc-retype-on');
      orderRows();
      updateScore();
      clearInterval(timer);
      timer = setInterval(updateTime, 1000);
      updateTime();
      show('screen-misc-quiz');
      history.replaceState(null, '', '#' + id);
      const first = document.querySelector('#misc-body input, #misc-body .misc-choice');
      if (first) first.focus();
    }

    // The other sets of a quiz in tabs; picking one starts it.
    function renderTabs() {
      const tabs = quiz.group ? tabsOf(quiz) : [];
      const box = $('#misc-tabs');
      box.classList.toggle('hidden', tabs.length < 2);
      box.innerHTML = tabs.map(t => `<button type="button" class="deck-tab${t === quiz ? ' active' : ''}" role="tab"
        aria-selected="${t === quiz}" data-tab="${t.id}">${esc(t.tab)}<span class="deck-tab-count">${total(t)}</span></button>`).join('');
    }

    // Sections whose rows can be put in another order.
    const movable = () => quiz.sections.map((sec, si) => ({ si, n: sec.items.length, type: sec.type }))
      .filter(sec => sec.type !== 'find');

    // In order / Shuffle per category / Shuffle everything. With one
    // category the last two are the same, so it's just In order / Shuffle.
    function renderOrder() {
      const many = movable().length > 1;
      const shown = settings.order === 'all' && !many ? 'section' : settings.order;
      document.querySelectorAll('#misc-order [data-order]').forEach(btn => {
        const o = btn.dataset.order;
        btn.classList.toggle('hidden', o === 'all' && !many);
        if (o === 'section') btn.textContent = many ? 'Shuffle per category' : 'Shuffle';
        btn.classList.toggle('active', o === shown);
        btn.setAttribute('aria-checked', String(o === shown));
      });
    }

    function renderQuiz() {
      $('#misc-body').innerHTML = quiz.sections.map((sec, si) => {
        const head = `<tr>${sec.columns.map(c => `<th>${esc(c)}</th>`).join('')}</tr>`;
        const label = sec.label ? `<h3 class="lis-heading">${esc(sec.label)}</h3>` : '';
        if (sec.type === 'find') {
          const rows = sec.items.map((it, i) => `<tr data-section="${si}" data-row="${i}">${it.cells.map(c =>
            `<td lang="ja"><span class="misc-cell">${esc(c)}</span></td>`).join('')}</tr>`).join('');
          return `<section class="misc-section" data-section="${si}">${label}
            <input type="text" class="answer-input misc-find" lang="ja" data-section="${si}"
              placeholder="${esc(sec.placeholder || 'Type an answer')}" autocomplete="off" autocapitalize="off" spellcheck="false">
            <div class="misc-miss" aria-live="polite"></div>
            <table class="misc-table misc-table-find"><thead>${head}</thead><tbody>${rows}</tbody></table>
          </section>`;
        }
        if (sec.type === 'choice') {
          const rows = sec.items.map((it, i) => `<tr data-section="${si}" data-row="${i}">
            <td lang="ja" class="misc-prompt">${it.promptHtml || esc(it.prompt)}</td>
            <td><div class="misc-choices">${choiceButtons(sec, i).map(o => `<button class="misc-choice" lang="ja"
              data-section="${si}" data-row="${i}" data-right="${o.right ? 1 : 0}">${o.html}</button>`).join('')}</div>
              ${it.note ? `<div class="misc-choice-note hidden" lang="ja">${it.note}</div>` : ''}</td>
          </tr>`).join('');
          return `<section class="misc-section" data-section="${si}">${label}
            <table class="misc-table misc-table-choice${sec.stack ? ' misc-table-stack' : ''}"><thead>${head}</thead><tbody>${rows}</tbody></table>
          </section>`;
        }
        const rows = sec.items.map((it, i) => `<tr data-section="${si}" data-row="${i}">
          <td lang="ja" class="misc-prompt">${it.promptHtml || esc(it.prompt)}</td>
          <td><input type="text" class="answer-input misc-fill" lang="ja" data-section="${si}" data-row="${i}"
            autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="${esc(it.prompt)}"></td>
        </tr>`).join('');
        const tip = si === quiz.sections.findIndex(x => x.items.some(it => it.card))
          ? '<p class="misc-tip">Answered rows get a ＋ to add the word to your <a href="flashcards.html">flashcards</a>.</p>' : '';
        return `<section class="misc-section" data-section="${si}">${label}${tip}
          <table class="misc-table misc-table-fill"><thead>${head}</thead><tbody>${rows}</tbody></table>
        </section>`;
      }).join('') + mixedTableHtml();
      document.querySelectorAll('#misc-body input').forEach(inp => {
        if (Romaji) Romaji.attach(inp);
        inp.addEventListener('input', () => onInput(inp, false));
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); onInput(inp, true); } });
      });
    }

    // One more table, for "Shuffle everything": every category's rows
    // mixed together, styled like the first category's table.
    function mixedTableHtml() {
      const secs = movable();
      if (secs.length < 2) return '';
      const first = quiz.sections[secs[0].si];
      const cls = first.type === 'choice' ? `misc-table-choice${first.stack ? ' misc-table-stack' : ''}` : 'misc-table-fill';
      return `<section class="misc-section misc-mixed hidden">
        <h3 class="lis-heading">All ${secs.reduce((a, x) => a + x.n, 0)} questions, mixed</h3>
        <table class="misc-table ${cls}"><thead><tr>${first.columns.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody></tbody></table>
      </section>`;
    }

    // Puts the fill and choice rows in list order, shuffled per category, or
    // all mixed into one table. Answers and focus follow the rows, so this
    // works mid-quiz too.
    function orderRows() {
      const plan = rowOrder(movable(), settings.order);
      const mixed = plan.length === 1 && plan[0].section === -1;
      document.querySelectorAll('#misc-body .misc-section[data-section]').forEach(box => {
        if (quiz.sections[+box.dataset.section].type !== 'find') box.classList.toggle('hidden', mixed);
      });
      const mixedBox = document.querySelector('#misc-body .misc-mixed');
      if (mixedBox) mixedBox.classList.toggle('hidden', !mixed);
      plan.forEach(({ section, rows }) => {
        const tbody = section < 0 ? mixedBox.querySelector('tbody')
          : document.querySelector(`#misc-body .misc-section[data-section="${section}"] tbody`);
        rows.forEach(([si, i]) => tbody.appendChild(rowEl(si, i)));
      });
    }

    const rowEl = (si, i) => document.querySelector(`#misc-body tr[data-section="${si}"][data-row="${i}"]`);

    function onInput(inp, enter) {
      if (over) { if (inp.dataset.retype) onRetype(inp, enter); return; }
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
      if (allAnswered()) finish();
    }

    const allAnswered = () => found.every((f, s) => f.size + wrong[s].size === quiz.sections[s].items.length);

    // One pick per question: right is found, wrong is missed straight away.
    function onChoice(btn) {
      if (over || btn.disabled) return;
      const si = +btn.dataset.section;
      const i = +btn.dataset.row;
      btn.classList.add('misc-choice-picked');
      if (btn.dataset.right === '1') reveal(si, i, 'found');
      else { wrong[si].add(i); reveal(si, i, 'missed'); }
      updateScore();
      if (allAnswered()) finish();
    }

    function reveal(si, i, how) {
      const sec = quiz.sections[si];
      if (how === 'found') found[si].add(i);
      const row = rowEl(si, i);
      row.classList.add(how === 'found' ? 'misc-found' : 'misc-missed');
      if (sec.type === 'fill') {
        const it = sec.items[i];
        const inp = row.querySelector('input');
        inp.value = it.answer;
        inp.disabled = true;
        // Shown as text instead, so it can carry furigana and a ＋, and be
        // clicked to type it again after the results.
        inp.classList.add('hidden');
        const cell = inp.parentElement;
        cell.insertAdjacentHTML('beforeend', `<span class="misc-answer" lang="ja">${it.answerHtml || esc(it.answer)}</span>`
          + (it.card ? deckButtonHtml(it.card.word) : ''));
      } else if (sec.type === 'choice') {
        row.querySelectorAll('.misc-choice').forEach(b => {
          b.disabled = true;
          if (b.dataset.right === '1') b.classList.add('misc-choice-right');
        });
        const note = row.querySelector('.misc-choice-note');
        if (note) note.classList.remove('hidden');
      }
    }

    // ─── Typing answers again after the results ──────────────────────────────
    // With the option on, clicking a fill answer hides it and opens its box
    // again; typing it right shows it in green. The score stays as it was.

    function retypeOn() {
      $('#misc-body').classList.toggle('misc-retype-on', over && !!settings.retype);
    }

    function startRetype(row) {
      const inp = row.querySelector('input');
      const answer = row.querySelector('.misc-answer');
      if (!inp || !answer) return;
      row.classList.remove('misc-retyped');
      answer.classList.add('hidden');
      inp.value = '';
      inp.dataset.retype = '1';
      inp.disabled = false;
      inp.classList.remove('hidden', 'misc-wrong');
      inp.focus();
    }

    // Closes the box and shows the answer again (green if you typed it).
    function endRetype(inp, right) {
      const row = inp.closest('tr');
      delete inp.dataset.retype;
      inp.disabled = true;
      inp.classList.add('hidden');
      row.querySelector('.misc-answer').classList.remove('hidden');
      if (right) row.classList.add('misc-retyped');
    }

    function onRetype(inp, enter) {
      const sec = quiz.sections[+inp.dataset.section];
      const text = enter && Romaji ? Romaji.flush(inp) : inp.value;
      if (matchItems({ items: [sec.items[+inp.dataset.row]] }, text).length) {
        endRetype(inp, true);
        // On to the next answer still to get right, if any.
        const rows = [...document.querySelectorAll('#misc-body .misc-table-fill tr[data-row]')];
        const at = rows.indexOf(inp.closest('tr'));
        const next = rows.slice(at + 1).concat(rows.slice(0, at))
          .find(r => r.classList.contains('misc-missed') && !r.classList.contains('misc-retyped'));
        if (next) startRetype(next);
      } else if (enter) {
        inp.classList.remove('misc-wrong');
        void inp.offsetWidth;
        inp.classList.add('misc-wrong');
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
        if (!found[si].has(i) && !wrong[si].has(i)) reveal(si, i, 'missed');
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
      const choice = quiz.sections.every(sec => sec.type === 'choice');
      res.innerHTML = (score === n
        ? `🎉 All ${n} in ${formatTime(result.time)}${best ? ' — a new best!' : ''}`
        : `You ${choice ? 'got' : 'named'} ${score} of ${n}. The ones you missed are in red.${best ? ' New best!' : ''}`)
        + (settings.retype && quiz.sections.some(sec => sec.type === 'fill') ? ' Click an answer to type it again.' : '');
      retypeOn();
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
      if (btn) { toggleCard(btn.dataset.word); return; }
      const choice = e.target.closest('.misc-choice');
      if (choice) { onChoice(choice); return; }
      const answer = e.target.closest('.misc-table-fill .misc-answer');
      if (answer && over && settings.retype) startRetype(answer.closest('tr'));
    });
    // Escape, or leaving the box empty, shows the answer again.
    $('#misc-body').addEventListener('keydown', e => {
      if (e.key === 'Escape' && e.target.dataset.retype) endRetype(e.target, false);
    });
    $('#misc-body').addEventListener('focusout', e => {
      if (e.target.dataset.retype && !e.target.value.trim()) endRetype(e.target, false);
    });
    $('#misc-retype').addEventListener('change', e => {
      settings.retype = e.target.checked;
      saveSettings(settings);
      if (quiz) retypeOn();
    });
    $('#misc-order').addEventListener('click', e => {
      const btn = e.target.closest('[data-order]');
      if (!btn || !quiz) return;
      settings.order = btn.dataset.order;
      saveSettings(settings);
      renderOrder();
      orderRows();
      const next = [...document.querySelectorAll('#misc-body input, #misc-body .misc-choice')].find(x => !x.disabled);
      if (next) next.focus();
    });
    $('#misc-again').addEventListener('click', () => start(quiz.id));
    $('#misc-tabs').addEventListener('click', e => {
      const tab = e.target.closest('[data-tab]');
      if (tab && tab.dataset.tab !== quiz.id) start(tab.dataset.tab);
    });
    $('#misc-quit').addEventListener('click', home);

    renderList();
    const hash = location.hash.slice(1);
    if (QUIZZES.some(q => q.id === hash)) start(hash);
  }

  const api = { rubyHtml, rubyPlain, rubyKana, QUIZZES, RU_EXCEPTIONS, normalize, matchItems, choiceOptions, choiceButtons, rowOrder, ORDERS, tabsOf, shuffled, total, better, formatTime };
  global.Misc = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPage);
    else initPage();
  }
})(typeof window !== 'undefined' ? window : globalThis);
