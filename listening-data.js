(function (global) {
  'use strict';

  // 聴解 (listening) practice in the style of the JLPT N5 / N4 listening
  // section (listening.html). The real test has four parts:
  //
  //   問題1 課題理解  task comprehension: hear what someone has to do or buy,
  //                   then pick it from four pictures.
  //   問題2 ポイント理解  point comprehension: listen for one detail (when, why,
  //                   which) and pick it from four pictures or printed choices.
  //   問題3 発話表現  utterance expressions: a picture with an arrow pointing at
  //                   someone; hear three replies and pick what that person says.
  //   問題4 即時応答  quick response: no picture; hear one line, then three
  //                   replies, and pick the natural one.
  //
  // In 問題1 and 2 the question is read out before the conversation and again
  // after it, so the listener knows what to listen for. In 問題3 and 4 the
  // choices are only spoken, never printed. The audio plays once.
  //
  // Each item:
  //   intro      the situation and question read before the conversation
  //   question   the question read again after it (defaults to the last
  //              sentence of intro)
  //   lines      the conversation: { who: 'M' | 'F', ja, en }
  //   choices    問題1/2: four pictures (see PICTURES in listening.js)
  //              問題3/4: three spoken replies { ja, en }
  //   picture    問題3 only: the scene, with the arrow on `arrow`
  //   answer     index of the right choice
  //   replyBy    問題3/4: whose voice reads the spoken choices ('M' | 'F')
  //   why        a one-line explanation shown afterwards
  //
  // Japanese is written in 漢字[かんじ] furigana markup, like the Stories page.
  // Speech is read from the plain kanji text; `say` on a line or choice (and
  // `sayIntro` on an item) overrides it where browser voices misread a word
  // (何で → なにで). test_listening.js checks
  // the data.

  const SECTIONS = [
    {
      id: 'kadai',
      num: 1,
      ja: '課題[かだい]理解[りかい]',
      en: 'Task comprehension',
      desc: 'Hear what someone needs to do, buy or bring, then pick the picture.',
      kind: 'pictures',
      items: [
        {
          id: 'fruit',
          intro: '店[みせ]で 男[おとこ]の人[ひと]と 店[みせ]の人[ひと]が 話[はな]しています。男[おとこ]の人[ひと]は 何[なに]を 買[か]いますか。',
          lines: [
            { who: 'F', ja: 'いらっしゃいませ。', en: 'Welcome!' },
            { who: 'M', ja: 'すみません、りんごを 三[みっ]つ ください。', en: 'Excuse me, three apples, please.' },
            { who: 'F', ja: 'はい。バナナも いかがですか。今日[きょう]は 安[やす]いですよ。', en: 'Sure. How about some bananas too? They’re cheap today.' },
            { who: 'M', ja: 'バナナは うちに あります。じゃ、みかんを 二[ふた]つ ください。', en: 'I have bananas at home. Then two mandarins, please.' },
            { who: 'F', ja: 'りんご 三[みっ]つと みかん 二[ふた]つですね。', en: 'Three apples and two mandarins, then.' },
          ],
          choices: [
            { type: 'items', items: [['🍎', 3], ['🍌', 1]] },
            { type: 'items', items: [['🍎', 3], ['🍊', 2]] },
            { type: 'items', items: [['🍎', 2], ['🍊', 3]] },
            { type: 'items', items: [['🍌', 1], ['🍊', 2]] },
          ],
          answer: 1,
          why: 'He turns down the bananas (he has some at home) and asks for two mandarins with his three apples.',
        },
        {
          id: 'bring',
          intro: '先生[せんせい]が 学生[がくせい]に 話[はな]しています。学生[がくせい]は 明日[あした] 何[なに]を 持[も]って 来[き]ますか。',
          lines: [
            { who: 'M', ja: 'みなさん、明日[あした]は 山[やま]へ 行[い]きます。', en: 'Everyone, tomorrow we’re going to the mountains.' },
            { who: 'M', ja: 'お弁当[べんとう]と 飲[の]み物[もの]を 持[も]って 来[き]て ください。', en: 'Please bring a boxed lunch and something to drink.' },
            { who: 'M', ja: '明日[あした]は 雨[あめ]が 降[ふ]りませんから、傘[かさ]は 要[い]りません。', en: 'It won’t rain tomorrow, so you don’t need an umbrella.', say: '明日は雨が降りませんから、かさはいりません。' },
          ],
          choices: [
            { type: 'items', items: [['🍱', 1], ['☂️', 1]] },
            { type: 'items', items: [['🥤', 1], ['☂️', 1]] },
            { type: 'items', items: [['🍱', 1], ['🥤', 1], ['☂️', 1]] },
            { type: 'items', items: [['🍱', 1], ['🥤', 1]] },
          ],
          answer: 3,
          why: 'A boxed lunch (お弁当) and a drink (飲み物) — the umbrella isn’t needed because it won’t rain.',
        },
        {
          id: 'meet',
          intro: '女[おんな]の人[ひと]と 男[おとこ]の人[ひと]が 話[はな]しています。二人[ふたり]は 何時[なんじ]に 会[あ]いますか。',
          lines: [
            { who: 'F', ja: '明日[あした]、映画[えいが]を 見[み]に 行[い]きませんか。', en: 'Shall we go and see a film tomorrow?' },
            { who: 'M', ja: 'いいですね。映画[えいが]は 何時[なんじ]からですか。', en: 'Sounds good. What time does it start?' },
            { who: 'F', ja: '十時半[じゅうじはん]からです。', en: 'From half past ten.' },
            { who: 'M', ja: 'じゃ、十時[じゅうじ]に 駅[えき]の 前[まえ]で 会[あ]いましょう。', en: 'Then let’s meet in front of the station at ten.' },
            { who: 'F', ja: '十時[じゅうじ]は ちょっと 早[はや]いです。十時[じゅうじ] 十五分[じゅうごふん]は どうですか。', en: 'Ten is a bit early. How about quarter past ten?' },
            { who: 'M', ja: 'いいですよ。', en: 'Fine.' },
          ],
          choices: [
            { type: 'clock', h: 10, m: 0 },
            { type: 'clock', h: 10, m: 30 },
            { type: 'clock', h: 9, m: 45 },
            { type: 'clock', h: 10, m: 15 },
          ],
          answer: 3,
          why: 'Ten is too early for her, so they settle on 十時十五分 (10:15). 10:30 is when the film starts.',
        },
        {
          id: 'yamada',
          intro: '男[おとこ]の人[ひと]と 女[おんな]の人[ひと]が 話[はな]しています。山田[やまだ]さんは どの 人[ひと]ですか。',
          lines: [
            { who: 'M', ja: '山田[やまだ]さんは どの 人[ひと]ですか。', en: 'Which one is Yamada-san?' },
            { who: 'F', ja: 'あそこに いる、眼鏡[めがね]を かけて いる 人[ひと]です。', en: 'The person over there wearing glasses.' },
            { who: 'M', ja: '帽子[ぼうし]を かぶって いる 人[ひと]ですか。', en: 'The one wearing a hat?' },
            { who: 'F', ja: 'いいえ、帽子[ぼうし]は かぶって いません。髪[かみ]が 長[なが]い 人[ひと]です。', en: 'No, she isn’t wearing a hat. She’s the one with long hair.' },
          ],
          choices: [
            { type: 'person', glasses: true, hat: true, hair: 'long' },
            { type: 'person', glasses: true, hat: false, hair: 'long' },
            { type: 'person', glasses: false, hat: false, hair: 'long' },
            { type: 'person', glasses: true, hat: false, hair: 'short' },
          ],
          answer: 1,
          why: 'Glasses (眼鏡をかけている), no hat (帽子はかぶっていません) and long hair (髪が長い).',
        },
        {
          id: 'post-office',
          intro: '女[おんな]の人[ひと]が 男[おとこ]の人[ひと]に 道[みち]を 聞[き]いています。郵便局[ゆうびんきょく]は どこですか。',
          lines: [
            { who: 'F', ja: 'すみません、郵便局[ゆうびんきょく]は どこですか。', en: 'Excuse me, where is the post office?' },
            { who: 'M', ja: 'あそこに 銀行[ぎんこう]が ありますね。', en: 'You see the bank over there?' },
            { who: 'F', ja: 'はい。銀行[ぎんこう]の 前[まえ]ですか。', en: 'Yes. Is it in front of the bank?' },
            { who: 'M', ja: 'いいえ、前[まえ]じゃ ありません。銀行[ぎんこう]の 隣[となり]です。右[みぎ]の 方[ほう]です。', en: 'No, not in front of it. It’s next to the bank, on the right.' },
          ],
          choices: [
            { type: 'map', at: 'left' },
            { type: 'map', at: 'right' },
            { type: 'map', at: 'front' },
            { type: 'map', at: 'corner' },
          ],
          answer: 1,
          why: 'Not across the road (前じゃありません) but next to the bank (隣), on its right (右の方).',
        },
      ],
    },
    {
      id: 'point',
      num: 2,
      ja: 'ポイント理解[りかい]',
      en: 'Point comprehension',
      desc: 'Listen for one detail — when, how or what happened.',
      kind: 'pictures',
      items: [
        {
          id: 'birthday',
          intro: '男[おとこ]の人[ひと]と 女[おんな]の人[ひと]が 話[はな]しています。女[おんな]の人[ひと]の 誕生日[たんじょうび]は いつですか。',
          lines: [
            { who: 'M', ja: '田中[たなか]さんの 誕生日[たんじょうび]は いつですか。', en: 'When is your birthday, Tanaka-san?' },
            { who: 'F', ja: '来週[らいしゅう]の 土曜日[どようび]です。', en: 'Next Saturday.' },
            { who: 'M', ja: 'え、十四日[じゅうよっか]ですか。', en: 'Oh, the fourteenth?' },
            { who: 'F', ja: 'いいえ、十四日[じゅうよっか]は 金曜日[きんようび]ですよ。十五日[じゅうごにち]です。', en: 'No, the fourteenth is a Friday. It’s the fifteenth.' },
          ],
          choices: [
            { type: 'calendar', mark: 14 },
            { type: 'calendar', mark: 8 },
            { type: 'calendar', mark: 15 },
            { type: 'calendar', mark: 16 },
          ],
          answer: 2,
          why: 'Next Saturday is the 15th (十五日) — the 14th he guessed is a Friday.',
        },
        {
          id: 'weather',
          intro: '男[おとこ]の人[ひと]と 女[おんな]の人[ひと]が 話[はな]しています。明日[あした]の 天気[てんき]は どうですか。',
          lines: [
            { who: 'F', ja: '今日[きょう]は いい 天気[てんき]ですね。', en: 'Lovely weather today, isn’t it?' },
            { who: 'M', ja: 'ええ。でも、明日[あした]は 雨[あめ]が 降[ふ]りますよ。', en: 'Yes. But it’s going to rain tomorrow.' },
            { who: 'F', ja: 'え、一日中[いちにちじゅう]ですか。', en: 'What, all day?' },
            { who: 'M', ja: 'いいえ。朝[あさ]は 雨[あめ]ですが、午後[ごご]は 晴[は]れます。', en: 'No. Rain in the morning, but it clears up in the afternoon.' },
          ],
          choices: [
            { type: 'weather', am: '☀️', pm: '☔' },
            { type: 'weather', am: '☔', pm: '☀️' },
            { type: 'weather', am: '☔', pm: '☔' },
            { type: 'weather', am: '☀️', pm: '☀️' },
          ],
          answer: 1,
          why: 'Morning rain (朝は雨), then sunny in the afternoon (午後は晴れます). Sunny all day was today.',
        },
        {
          id: 'commute',
          intro: '女[おんな]の人[ひと]と 男[おとこ]の人[ひと]が 話[はな]しています。男[おとこ]の人[ひと]は 今日[きょう] 何[なに]で 会社[かいしゃ]へ 来[き]ましたか。',
          sayIntro: '女の人と男の人が話しています。男の人は今日なにで会社へ来ましたか。',
          lines: [
            { who: 'F', ja: '鈴木[すずき]さんは いつも 自転車[じてんしゃ]で 会社[かいしゃ]へ 来[き]ますね。', en: 'Suzuki-san, you always come to work by bike, don’t you?' },
            { who: 'M', ja: 'ええ。でも、今日[きょう]は 雨[あめ]でしたから、バスで 来[き]ました。', en: 'Yes. But it was raining today, so I came by bus.' },
            { who: 'F', ja: 'そうですか。私[わたし]は 毎日[まいにち] 電車[でんしゃ]です。', en: 'I see. I take the train every day.' },
          ],
          choices: [
            { type: 'items', items: [['🚲', 1]] },
            { type: 'items', items: [['🚃', 1]] },
            { type: 'items', items: [['🚌', 1]] },
            { type: 'items', items: [['🚕', 1]] },
          ],
          answer: 2,
          why: 'He usually cycles, but today it rained so he came by bus (バスで来ました). The train is how she commutes.',
        },
        {
          id: 'sunday',
          intro: '男[おとこ]の人[ひと]と 女[おんな]の人[ひと]が 話[はな]しています。女[おんな]の人[ひと]は 日曜日[にちようび]に 何[なに]を しましたか。',
          lines: [
            { who: 'M', ja: '日曜日[にちようび]は 何[なに]を しましたか。', en: 'What did you do on Sunday?' },
            { who: 'F', ja: '友[とも]だちと 買[か]い物[もの]に 行[い]く つもりでした。', en: 'I was going to go shopping with a friend.' },
            { who: 'F', ja: 'でも、友[とも]だちが 病気[びょうき]に なりましたから、うちで 本[ほん]を 読[よ]みました。', en: 'But my friend got sick, so I read a book at home.' },
            { who: 'M', ja: 'そうですか。残念[ざんねん]でしたね。', en: 'Oh, that’s a shame.' },
          ],
          choices: [
            { type: 'items', items: [['🛍️', 1]] },
            { type: 'items', items: [['🏥', 1]] },
            { type: 'items', items: [['🎬', 1]] },
            { type: 'items', items: [['📖', 1]] },
          ],
          answer: 3,
          why: 'Shopping was only the plan (つもりでした); her friend got sick, so she read a book (本を読みました).',
        },
        {
          id: 'price',
          intro: '店[みせ]で 男[おとこ]の人[ひと]と 店[みせ]の人[ひと]が 話[はな]しています。男[おとこ]の人[ひと]は 全部[ぜんぶ]で いくら 払[はら]いますか。',
          lines: [
            { who: 'M', ja: 'すみません、この ノートは いくらですか。', en: 'Excuse me, how much is this notebook?' },
            { who: 'F', ja: '一冊[いっさつ] 百五十円[ひゃくごじゅうえん]です。', en: 'It’s 150 yen each.' },
            { who: 'M', ja: 'じゃ、ノートを 二冊[にさつ]と、この ペンを 一本[いっぽん] ください。', en: 'Then two notebooks and one of these pens, please.' },
            { who: 'F', ja: 'ペンは 百円[ひゃくえん]ですから、全部[ぜんぶ]で 四百円[よんひゃくえん]です。', en: 'The pen is 100 yen, so that’s 400 yen altogether.' },
          ],
          choices: [
            { type: 'price', yen: 250 },
            { type: 'price', yen: 300 },
            { type: 'price', yen: 400 },
            { type: 'price', yen: 450 },
          ],
          answer: 2,
          why: 'Two notebooks at 150 yen (300) plus a 100-yen pen: 四百円, 400 yen.',
        },
      ],
    },
    {
      id: 'hatsuwa',
      num: 3,
      ja: '発話[はつわ]表現[ひょうげん]',
      en: 'Utterance expressions',
      desc: 'What does the person with the arrow say? Replies are only spoken.',
      kind: 'spoken',
      items: [
        {
          id: 'present',
          intro: '友[とも]だちに プレゼントを もらいました。何[なん]と 言[い]いますか。',
          picture: { left: '🧒', right: '👧', prop: '🎁', arrow: 'left' },
          choices: [
            { ja: 'ありがとう。', en: 'Thank you.' },
            { ja: 'どういたしまして。', en: 'You’re welcome.' },
            { ja: 'いただきます。', en: 'Said before eating.' },
          ],
          answer: 0,
          why: 'ありがとう thanks the friend. どういたしまして is the reply to thanks, and いただきます is said before a meal.',
        },
        {
          id: 'morning',
          intro: '朝[あさ]、学校[がっこう]で 先生[せんせい]に 会[あ]いました。何[なん]と 言[い]いますか。',
          picture: { left: '🧑‍🎓', right: '👨‍🏫', prop: '🌅', arrow: 'left' },
          choices: [
            { ja: 'こんばんは。', en: 'Good evening.' },
            { ja: 'おやすみなさい。', en: 'Good night.' },
            { ja: 'おはようございます。', en: 'Good morning (polite).' },
          ],
          answer: 2,
          why: 'In the morning, and to a teacher, so the polite おはようございます.',
        },
        {
          id: 'water',
          intro: 'レストランで 水[みず]が 欲[ほ]しいです。お店[みせ]の 人[ひと]に 何[なん]と 言[い]いますか。',
          sayIntro: 'レストランで水がほしいです。お店の人に何と言いますか。',
          picture: { left: '🧑', right: '🤵', prop: '🍽️', arrow: 'left' },
          choices: [
            { ja: '水[みず]は いかがですか。', en: 'Would you like some water?' },
            { ja: 'すみません、水[みず]を ください。', en: 'Excuse me, water please.' },
            { ja: '水[みず]を 飲[の]みましたか。', en: 'Did you drink the water?' },
          ],
          answer: 1,
          why: '〜をください asks for something. 水はいかがですか is what the waiter would say to you.',
        },
        {
          id: 'leaving',
          intro: '友[とも]だちの 家[いえ]から 帰[かえ]ります。何[なん]と 言[い]いますか。',
          picture: { left: '🧑', right: '👩', prop: '🏠', arrow: 'left' },
          choices: [
            { ja: 'いってきます。', en: 'I’m off (leaving your own home).' },
            { ja: 'ただいま。', en: 'I’m home.' },
            { ja: 'お邪魔[じゃま]しました。', en: 'Thank you for having me (lit. I disturbed you).', say: 'おじゃましました。' },
          ],
          answer: 2,
          why: 'Leaving someone else’s home you say おじゃましました. いってきます and ただいま are for your own home.',
        },
        {
          id: 'help',
          intro: '荷物[にもつ]が 重[おも]いです。友[とも]だちに 何[なん]と 言[い]いますか。',
          picture: { left: '🧑', right: '🧑‍🦱', prop: '📦', arrow: 'left' },
          choices: [
            { ja: 'ちょっと 手伝[てつだ]って くれませんか。', en: 'Could you give me a hand?' },
            { ja: '手伝[てつだ]いましょうか。', en: 'Shall I help you?' },
            { ja: 'どうぞ、持[も]って ください。', en: 'Here, please hold it.' },
          ],
          answer: 0,
          why: '〜てくれませんか asks a favour. 手伝いましょうか offers help — that’s for the friend to say.',
        },
      ],
    },
    {
      id: 'sokuji',
      num: 4,
      ja: '即時[そくじ]応答[おうとう]',
      en: 'Quick response',
      desc: 'No picture: hear one line and pick the natural reply.',
      kind: 'spoken',
      items: [
        {
          id: 'country',
          lines: [{ who: 'F', ja: 'お国[くに]は どちらですか。', en: 'Where are you from?' }],
          replyBy: 'M',
          choices: [
            { ja: 'あちらです。', en: 'It’s over there.' },
            { ja: 'アメリカです。', en: 'America.' },
            { ja: '日本語[にほんご]です。', en: 'Japanese (the language).' },
          ],
          answer: 1,
          why: 'お国はどちらですか politely asks which country you are from — どちら here isn’t a direction.',
        },
        {
          id: 'time',
          lines: [{ who: 'M', ja: 'すみません、今[いま] 何時[なんじ]ですか。', en: 'Excuse me, what time is it now?' }],
          replyBy: 'F',
          choices: [
            { ja: '三時間[さんじかん]です。', en: 'Three hours.' },
            { ja: '三日[みっか]です。', en: 'It’s the third.' },
            { ja: '三時[さんじ]です。', en: 'Three o’clock.' },
          ],
          answer: 2,
          why: '何時 asks the time: 三時. 三時間 is a length of time and 三日 a date.',
        },
        {
          id: 'tea',
          lines: [{ who: 'F', ja: 'お茶[ちゃ]を もう 一杯[いっぱい] いかがですか。', en: 'Would you like another cup of tea?' }],
          replyBy: 'M',
          choices: [
            { ja: 'はい、いただきます。', en: 'Yes, I’d love one.' },
            { ja: 'はい、いかがです。', en: '(not a real reply)' },
            { ja: 'いいえ、飲[の]みませんでした。', en: 'No, I didn’t drink it.' },
          ],
          answer: 0,
          why: 'Accept an offer with いただきます (or decline with いいえ、けっこうです).',
        },
        {
          id: 'lunch',
          lines: [{ who: 'M', ja: '一緒[いっしょ]に 昼[ひる]ご飯[はん]を 食[た]べませんか。', en: 'Won’t you have lunch with me?' }],
          replyBy: 'F',
          choices: [
            { ja: 'はい、食[た]べませんでした。', en: 'Yes, I didn’t eat.' },
            { ja: 'ええ、食[た]べましょう。', en: 'Sure, let’s eat.' },
            { ja: 'いいえ、昼[ひる]ご飯[はん]です。', en: 'No, it’s lunch.' },
          ],
          answer: 1,
          why: '〜ませんか is an invitation; accept with 〜ましょう.',
        },
        {
          id: 'sorry',
          lines: [{ who: 'M', ja: '遅[おそ]く なって、すみません。', en: 'Sorry I’m late.' }],
          replyBy: 'F',
          choices: [
            { ja: 'いいえ、大丈夫[だいじょうぶ]ですよ。', en: 'No problem.' },
            { ja: 'どういたしまして。', en: 'You’re welcome.' },
            { ja: 'はい、遅[おそ]いです。', en: 'Yes, it’s slow.' },
          ],
          answer: 0,
          why: 'Reply to an apology with いいえ、大丈夫ですよ. どういたしまして answers thanks, not an apology.',
        },
      ],
    },
  ];

  const api = { SECTIONS };
  global.LISTENING_SECTIONS = SECTIONS;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
