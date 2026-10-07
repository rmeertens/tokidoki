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
  //   level      'N5' or 'N4'
  //   intro      the situation and question read before the conversation
  //   lines      the conversation: { who: 'M' | 'F', ja, en }
  //   choices    問題1/2: four pictures (see PICTURES in listening-art.js)
  //              問題3/4: three spoken replies { ja, en }
  //   scene      問題3 only: { left, right, prop, arrow } (ROLES and ICONS in
  //              listening-art.js), the arrow over the one who speaks
  //   replyBy    問題3/4: whose voice reads the spoken choices ('M' | 'F')
  //   answer     index of the right choice
  //   why        a one-line explanation shown afterwards
  //
  // Japanese is written in 漢字[かんじ] furigana markup, like the Stories page.
  // `say` on a line or choice (and `sayIntro` on an item) is what is spoken
  // instead, where a voice would misread the kanji (何で → なにで). The
  // audio is recorded from this file by scripts/generate_listening_audio.py;
  // test_listening.js checks the data and that the recordings are current.

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
          id: 'fruit', level: 'N5',
          intro: '店[みせ]で 男[おとこ]の人[ひと]と 店[みせ]の人[ひと]が 話[はな]しています。男[おとこ]の人[ひと]は 何[なに]を 買[か]いますか。',
          lines: [
            { who: 'F', ja: 'いらっしゃいませ。', en: 'Welcome!' },
            { who: 'M', ja: 'すみません、りんごを 三[みっ]つ ください。', en: 'Excuse me, three apples, please.' },
            { who: 'F', ja: 'はい。バナナも いかがですか。今日[きょう]は 安[やす]いですよ。', en: 'Sure. How about some bananas too? They’re cheap today.' },
            { who: 'M', ja: 'バナナは うちに あります。じゃ、みかんを 二[ふた]つ ください。', en: 'I have bananas at home. Then two mandarins, please.' },
            { who: 'F', ja: 'りんご 三[みっ]つと みかん 二[ふた]つですね。', en: 'Three apples and two mandarins, then.' },
          ],
          choices: [
            { type: 'items', items: [['apple', 3], ['banana', 1]] },
            { type: 'items', items: [['apple', 3], ['mandarin', 2]] },
            { type: 'items', items: [['apple', 2], ['mandarin', 3]] },
            { type: 'items', items: [['banana', 1], ['mandarin', 2]] },
          ],
          answer: 1,
          why: 'He turns down the bananas (he has some at home) and asks for two mandarins with his three apples.',
        },
        {
          id: 'bring', level: 'N5',
          intro: '先生[せんせい]が 学生[がくせい]に 話[はな]しています。学生[がくせい]は 明日[あした] 何[なに]を 持[も]って 来[き]ますか。',
          lines: [
            { who: 'M', ja: 'みなさん、明日[あした]は 山[やま]へ 行[い]きます。', en: 'Everyone, tomorrow we’re going to the mountains.' },
            { who: 'M', ja: 'お弁当[べんとう]と 飲[の]み物[もの]を 持[も]って 来[き]て ください。', en: 'Please bring a boxed lunch and something to drink.' },
            { who: 'M', ja: '明日[あした]は 雨[あめ]が 降[ふ]りませんから、傘[かさ]は 要[い]りません。', en: 'It won’t rain tomorrow, so you don’t need an umbrella.' },
          ],
          choices: [
            { type: 'items', items: [['bento', 1], ['umbrella', 1]] },
            { type: 'items', items: [['drink', 1], ['umbrella', 1]] },
            { type: 'items', items: [['bento', 1], ['drink', 1], ['umbrella', 1]] },
            { type: 'items', items: [['bento', 1], ['drink', 1]] },
          ],
          answer: 3,
          why: 'A boxed lunch (お弁当) and a drink (飲み物) — the umbrella isn’t needed because it won’t rain.',
        },
        {
          id: 'meet', level: 'N5',
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
          id: 'yamada', level: 'N5',
          intro: '男[おとこ]の人[ひと]と 女[おんな]の人[ひと]が 話[はな]しています。山田[やまだ]さんは どの 人[ひと]ですか。',
          lines: [
            { who: 'M', ja: '山田[やまだ]さんは どの 人[ひと]ですか。', en: 'Which one is Yamada-san?' },
            { who: 'F', ja: 'あそこに いる、眼鏡[めがね]を かけて いる 人[ひと]です。', en: 'The person over there wearing glasses.' },
            { who: 'M', ja: '帽子[ぼうし]を かぶって いる 人[ひと]ですか。', en: 'The one wearing a hat?' },
            { who: 'F', ja: 'いいえ、帽子[ぼうし]は かぶって いません。髪[かみ]が 長[なが]い 人[ひと]です。', en: 'No, she isn’t wearing a hat. She’s the one with long hair.' },
          ],
          choices: [
            { type: 'person', hair: 'long', glasses: true, hat: true, top: 'sweater', topColor: 'orange', bottom: 'skirt' },
            { type: 'person', hair: 'long', glasses: true, top: 'sweater', topColor: 'orange', bottom: 'skirt' },
            { type: 'person', hair: 'long', top: 'sweater', topColor: 'orange', bottom: 'skirt' },
            { type: 'person', hair: 'short', glasses: true, top: 'sweater', topColor: 'orange', bottom: 'trousers' },
          ],
          answer: 1,
          why: 'Glasses (眼鏡をかけている), no hat (帽子はかぶっていません) and long hair (髪が長い).',
        },
        {
          id: 'post-office', level: 'N5',
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
        {
          id: 'first', level: 'N4',
          intro: '会社[かいしゃ]で 女[おんな]の人[ひと]と 男[おとこ]の人[ひと]が 話[はな]しています。男[おとこ]の人[ひと]は この 後[あと] まず 何[なに]を しますか。',
          lines: [
            { who: 'F', ja: '山田[やまだ]さん、会議[かいぎ]の 資料[しりょう]、コピーして くれましたか。', en: 'Yamada-san, did you copy the documents for the meeting?' },
            { who: 'M', ja: 'いいえ、まだです。今[いま]から します。', en: 'Not yet. I’ll do it now.' },
            { who: 'F', ja: 'あ、その 前[まえ]に、会議室[かいぎしつ]の エアコンを つけて ください。今日[きょう]は 暑[あつ]いですから。', en: 'Oh, before that, please turn on the air conditioning in the meeting room. It’s hot today.' },
            { who: 'M', ja: 'わかりました。コピーは その 後[あと]で いいですか。', en: 'Sure. Is it all right to do the copies after that?' },
            { who: 'F', ja: 'ええ。それから、お茶[ちゃ]も お願[ねが]いします。', en: 'Yes. And then the tea too, please.' },
          ],
          choices: [
            { type: 'items', items: [['copier', 1]] },
            { type: 'items', items: [['aircon', 1]] },
            { type: 'items', items: [['tea', 1]] },
            { type: 'items', items: [['phone', 1]] },
          ],
          answer: 1,
          why: 'その前に (before that) — the air conditioning comes first, then the copies, then the tea.',
        },
        {
          id: 'floor', level: 'N5',
          intro: 'デパートで 女[おんな]の人[ひと]と 店[みせ]の人[ひと]が 話[はな]しています。女[おんな]の人[ひと]は 何階[なんかい]へ 行[い]きますか。',
          lines: [
            { who: 'F', ja: 'すみません、子[こ]どもの 靴[くつ]は どこですか。', en: 'Excuse me, where are the children’s shoes?' },
            { who: 'M', ja: '靴[くつ]売[う]り場[ば]は 三階[さんがい]ですが、子[こ]どもの 靴[くつ]は 五階[ごかい]です。', en: 'The shoe department is on the third floor, but children’s shoes are on the fifth.' },
            { who: 'F', ja: '五階[ごかい]ですね。', en: 'The fifth floor, then.' },
            { who: 'M', ja: 'はい。エレベーターは あちらです。', en: 'Yes. The lift is over there.' },
          ],
          choices: [
            { type: 'floor', floor: 3 },
            { type: 'floor', floor: 4 },
            { type: 'floor', floor: 5 },
            { type: 'floor', floor: 6 },
          ],
          answer: 2,
          why: 'Shoes are on 三階, but children’s shoes (子どもの靴) are on 五階, the fifth floor.',
        },
        {
          id: 'party-clothes', level: 'N4',
          intro: '男[おとこ]の人[ひと]と 女[おんな]の人[ひと]が 話[はな]しています。女[おんな]の人[ひと]は 明日[あした] 何[なに]を 着[き]て 行[い]きますか。',
          lines: [
            { who: 'M', ja: '明日[あした]の パーティー、何[なに]を 着[き]ますか。', en: 'What are you wearing to tomorrow’s party?' },
            { who: 'F', ja: '白[しろ]い ワンピースを 着[き]ようと 思[おも]って います。', en: 'I’m thinking of wearing a white dress.' },
            { who: 'M', ja: 'でも、明日[あした]は 寒[さむ]く なりますよ。', en: 'But it’s going to get cold tomorrow.' },
            { who: 'F', ja: 'そうですか。じゃあ、ワンピースの 上[うえ]に 黒[くろ]い コートを 着[き]ます。', en: 'Really? Then I’ll wear a black coat over the dress.' },
          ],
          choices: [
            { type: 'person', hair: 'long', top: 'dress' },
            { type: 'person', hair: 'long', top: 'coat', under: 'white' },
            { type: 'person', hair: 'long', top: 'sweater', topColor: 'white', bottom: 'trousers', bottomColor: 'dark' },
            { type: 'person', hair: 'long', top: 'coat', topColor: 'white', under: 'dark' },
          ],
          answer: 1,
          why: 'The white dress (白いワンピース) with a black coat on top (上に黒いコート) — the white dress shows below the coat.',
        },
        {
          id: 'present', level: 'N5',
          intro: '女[おんな]の人[ひと]と 男[おとこ]の人[ひと]が 話[はな]しています。二人[ふたり]は 田中[たなか]さんに 何[なに]を あげますか。',
          lines: [
            { who: 'F', ja: '田中[たなか]さんの 誕生日[たんじょうび]に 何[なに]を あげましょうか。', en: 'What shall we give Tanaka-san for her birthday?' },
            { who: 'M', ja: '花[はな]は どうですか。', en: 'How about flowers?' },
            { who: 'F', ja: '花[はな]は 去年[きょねん] あげましたよ。本[ほん]は どうですか。', en: 'We gave her flowers last year. How about a book?' },
            { who: 'M', ja: '田中[たなか]さんは あまり 本[ほん]を 読[よ]みませんよ。音楽[おんがく]が 好[す]きですから、CDは どうですか。', en: 'Tanaka-san doesn’t read much. She likes music, so how about a CD?', say: '田中さんはあまり本を読みませんよ。音楽が好きですから、シーディーはどうですか。' },
            { who: 'F', ja: 'いいですね。そう しましょう。', en: 'Good idea. Let’s do that.' },
          ],
          choices: [
            { type: 'items', items: [['flower', 1]] },
            { type: 'items', items: [['book', 1]] },
            { type: 'items', items: [['cd', 1]] },
            { type: 'items', items: [['gift', 1]] },
          ],
          answer: 2,
          why: 'Flowers were last year’s present and she doesn’t read much, so a CD (she likes music).',
        },
        {
          id: 'bus-number', level: 'N4',
          intro: '駅[えき]で 女[おんな]の人[ひと]と 男[おとこ]の人[ひと]が 話[はな]しています。女[おんな]の人[ひと]は 何番[なんばん]の バスに 乗[の]りますか。',
          lines: [
            { who: 'F', ja: 'すみません、さくら病院[びょういん]へ 行[い]きたいんですが。', en: 'Excuse me, I’d like to get to Sakura Hospital.' },
            { who: 'M', ja: '三番[さんばん]の バスですね。あ、でも 三番[さんばん]は 今[いま] 出[で]ましたよ。', en: 'That’s the number 3 bus. Oh, but the 3 just left.' },
            { who: 'F', ja: 'そうですか。', en: 'Oh no.' },
            { who: 'M', ja: '七番[ななばん]の バスも 病院[びょういん]の 前[まえ]を 通[とお]りますよ。五分後[ごふんご]に 来[き]ます。', en: 'The number 7 also goes past the hospital. It comes in five minutes.' },
            { who: 'F', ja: 'じゃ、それに 乗[の]ります。', en: 'Then I’ll take that one.' },
          ],
          choices: [
            { type: 'bus', num: 3 },
            { type: 'bus', num: 5 },
            { type: 'bus', num: 7 },
            { type: 'bus', num: 1 },
          ],
          answer: 2,
          why: 'The 3 has just left (今出ました), so she takes the 7, which also passes the hospital. 5 is the minutes.',
        },
        {
          id: 'shopping-list', level: 'N4',
          intro: 'うちで 女[おんな]の人[ひと]と 男[おとこ]の人[ひと]が 話[はな]しています。男[おとこ]の人[ひと]は 何[なに]を 買[か]って きますか。',
          lines: [
            { who: 'F', ja: '買[か]い物[もの]に 行[い]くなら、牛乳[ぎゅうにゅう]を 買[か]って きて くれる？', en: 'If you’re going shopping, could you get some milk?' },
            { who: 'M', ja: 'いいよ。卵[たまご]は？', en: 'Sure. What about eggs?' },
            { who: 'F', ja: '卵[たまご]は まだ あるから いいわ。あ、パンも お願[ねが]い。', en: 'We still have eggs, so that’s fine. Oh, and bread, please.' },
            { who: 'M', ja: '牛乳[ぎゅうにゅう]と パンね。わかった。', en: 'Milk and bread. Got it.' },
          ],
          choices: [
            { type: 'items', items: [['milk', 1], ['egg', 1]] },
            { type: 'items', items: [['bread', 1], ['egg', 1]] },
            { type: 'items', items: [['milk', 1], ['bread', 1], ['egg', 1]] },
            { type: 'items', items: [['milk', 1], ['bread', 1]] },
          ],
          answer: 3,
          why: 'Milk and bread. They still have eggs (卵はまだあるからいいわ).',
        },
        {
          id: 'tv', level: 'N4',
          intro: '新[あたら]しい 部屋[へや]で 男[おとこ]の人[ひと]と 女[おんな]の人[ひと]が 話[はな]しています。男[おとこ]の人[ひと]は テレビを どこに 置[お]きますか。',
          lines: [
            { who: 'M', ja: 'テレビは どこに 置[お]きましょうか。', en: 'Where shall I put the TV?' },
            { who: 'F', ja: '窓[まど]の 前[まえ]は どうですか。', en: 'How about in front of the window?' },
            { who: 'M', ja: '窓[まど]の 前[まえ]は 明[あか]るくて、ちょっと 見[み]にくいですよ。', en: 'It’s bright in front of the window, so it’s a bit hard to see.' },
            { who: 'F', ja: 'そうですね。じゃ、本棚[ほんだな]の 隣[となり]に 置[お]いて ください。', en: 'True. Then put it next to the bookshelf.' },
            { who: 'M', ja: '本棚[ほんだな]の 右[みぎ]ですか、左[ひだり]ですか。', en: 'To the right of the bookshelf, or the left?' },
            { who: 'F', ja: '左[ひだり]に お願[ねが]いします。', en: 'The left, please.' },
          ],
          choices: [
            { type: 'room', at: 'window' },
            { type: 'room', at: 'shelf-left' },
            { type: 'room', at: 'shelf-right' },
            { type: 'room', at: 'door' },
          ],
          answer: 1,
          why: 'Not in front of the window (too bright) — next to the bookshelf, on its left (左).',
        },
      ],
    },
    {
      id: 'point',
      num: 2,
      ja: 'ポイント理解[りかい]',
      en: 'Point comprehension',
      desc: 'Listen for one detail — when, how, why or which.',
      kind: 'pictures',
      items: [
        {
          id: 'birthday', level: 'N5',
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
          id: 'weather', level: 'N5',
          intro: '男[おとこ]の人[ひと]と 女[おんな]の人[ひと]が 話[はな]しています。明日[あした]の 天気[てんき]は どうですか。',
          lines: [
            { who: 'F', ja: '今日[きょう]は いい 天気[てんき]ですね。', en: 'Lovely weather today, isn’t it?' },
            { who: 'M', ja: 'ええ。でも、明日[あした]は 雨[あめ]が 降[ふ]りますよ。', en: 'Yes. But it’s going to rain tomorrow.' },
            { who: 'F', ja: 'え、一日中[いちにちじゅう]ですか。', en: 'What, all day?' },
            { who: 'M', ja: 'いいえ。朝[あさ]は 雨[あめ]ですが、午後[ごご]は 晴[は]れます。', en: 'No. Rain in the morning, but it clears up in the afternoon.' },
          ],
          choices: [
            { type: 'weather', am: 'sun', pm: 'rain' },
            { type: 'weather', am: 'rain', pm: 'sun' },
            { type: 'weather', am: 'rain', pm: 'rain' },
            { type: 'weather', am: 'sun', pm: 'sun' },
          ],
          answer: 1,
          why: 'Morning rain (朝は雨), then sunny in the afternoon (午後は晴れます). Sunny all day was today.',
        },
        {
          id: 'commute', level: 'N5',
          intro: '女[おんな]の人[ひと]と 男[おとこ]の人[ひと]が 話[はな]しています。男[おとこ]の人[ひと]は 今日[きょう] 何[なに]で 会社[かいしゃ]へ 来[き]ましたか。',
          lines: [
            { who: 'F', ja: '鈴木[すずき]さんは いつも 自転車[じてんしゃ]で 会社[かいしゃ]へ 来[き]ますね。', en: 'Suzuki-san, you always come to work by bike, don’t you?' },
            { who: 'M', ja: 'ええ。でも、今日[きょう]は 雨[あめ]でしたから、バスで 来[き]ました。', en: 'Yes. But it was raining today, so I came by bus.' },
            { who: 'F', ja: 'そうですか。私[わたし]は 毎日[まいにち] 電車[でんしゃ]です。', en: 'I see. I take the train every day.' },
          ],
          choices: [
            { type: 'items', items: [['bike', 1]] },
            { type: 'items', items: [['train', 1]] },
            { type: 'bus', num: 12 },
            { type: 'items', items: [['taxi', 1]] },
          ],
          answer: 2,
          why: 'He usually cycles, but today it rained so he came by bus (バスで来ました). The train is how she commutes.',
        },
        {
          id: 'sunday', level: 'N4',
          intro: '男[おとこ]の人[ひと]と 女[おんな]の人[ひと]が 話[はな]しています。女[おんな]の人[ひと]は 日曜日[にちようび]に 何[なに]を しましたか。',
          lines: [
            { who: 'M', ja: '日曜日[にちようび]は 何[なに]を しましたか。', en: 'What did you do on Sunday?' },
            { who: 'F', ja: '友[とも]だちと 買[か]い物[もの]に 行[い]く つもりでした。', en: 'I was going to go shopping with a friend.' },
            { who: 'F', ja: 'でも、友[とも]だちが 病気[びょうき]に なりましたから、うちで 本[ほん]を 読[よ]みました。', en: 'But my friend got sick, so I read a book at home.' },
            { who: 'M', ja: 'そうですか。残念[ざんねん]でしたね。', en: 'Oh, that’s a shame.' },
          ],
          choices: [
            { type: 'items', items: [['shopping', 1]] },
            { type: 'items', items: [['hospital', 1]] },
            { type: 'items', items: [['film', 1]] },
            { type: 'items', items: [['book', 1]] },
          ],
          answer: 3,
          why: 'Shopping was only the plan (つもりでした); her friend got sick, so she read a book (本を読みました).',
        },
        {
          id: 'price', level: 'N5',
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
        {
          id: 'late', level: 'N4',
          intro: '会社[かいしゃ]で 女[おんな]の人[ひと]と 男[おとこ]の人[ひと]が 話[はな]しています。男[おとこ]の人[ひと]は どうして 遅[おく]れましたか。',
          lines: [
            { who: 'F', ja: 'どう したんですか。三十分[さんじゅっぷん]も 遅[おく]れましたね。', en: 'What happened? You’re thirty minutes late.' },
            { who: 'M', ja: 'すみません。寝坊[ねぼう]は して いませんし、電車[でんしゃ]も 大丈夫[だいじょうぶ]だったんですが…。', en: 'Sorry. I didn’t oversleep, and the trains were fine, but…' },
            { who: 'M', ja: '駅[えき]で 財布[さいふ]を 落[お]として しまったんです。', en: 'I dropped my wallet at the station.' },
            { who: 'F', ja: 'え、財布[さいふ]は ありましたか。', en: 'Oh no — did you find it?' },
            { who: 'M', ja: 'はい、駅[えき]の 人[ひと]が 見[み]つけて くれました。', en: 'Yes, someone at the station found it for me.' },
          ],
          choices: [
            { type: 'items', items: [['sleep', 1]] },
            { type: 'items', items: [['train-stopped', 1]] },
            { type: 'items', items: [['wallet', 1]] },
            { type: 'items', items: [['rain', 1]] },
          ],
          answer: 2,
          why: 'He didn’t oversleep and the trains ran — he dropped his wallet (財布を落としてしまった) at the station.',
        },
        {
          id: 'phone-number', level: 'N5',
          intro: '男[おとこ]の人[ひと]と 女[おんな]の人[ひと]が 話[はな]しています。女[おんな]の人[ひと]の 電話番号[でんわばんごう]は 何番[なんばん]ですか。',
          lines: [
            { who: 'M', ja: '電話番号[でんわばんごう]を 教[おし]えて ください。', en: 'Could you tell me your phone number?' },
            { who: 'F', ja: 'はい。090の 3412の 5867です。', en: 'Sure. 090-3412-5867.', say: 'はい。ぜろきゅうぜろの、さんよんいちにの、ごーはちろくななです。' },
            { who: 'M', ja: '090の 3412の 5876ですね。', en: '090-3412-5876, right?', say: 'ぜろきゅうぜろの、さんよんいちにの、ごーはちななろくですね。' },
            { who: 'F', ja: 'いいえ、最後[さいご]は 5867です。', en: 'No, the last part is 5867.', say: 'いいえ、最後は、ごーはちろくななです。' },
          ],
          choices: [
            { type: 'text', text: '090-3412-5876' },
            { type: 'text', text: '090-3421-5867' },
            { type: 'text', text: '090-3412-5867' },
            { type: 'text', text: '080-3412-5867' },
          ],
          answer: 2,
          why: 'He gets the last four digits backwards; she corrects him: 5867.',
        },
        {
          id: 'people', level: 'N5',
          intro: 'レストランで 店[みせ]の人[ひと]と 男[おとこ]の人[ひと]が 話[はな]しています。男[おとこ]の人[ひと]たちは 全部[ぜんぶ]で 何人[なんにん]ですか。',
          lines: [
            { who: 'F', ja: 'いらっしゃいませ。何名様[なんめいさま]ですか。', en: 'Welcome. How many of you?' },
            { who: 'M', ja: '四人[よにん]です。あ、すみません、後[あと]で もう 一人[ひとり] 来[き]ます。', en: 'Four. Oh, sorry — one more is coming later.' },
            { who: 'F', ja: 'では、五名様[ごめいさま]ですね。こちらへ どうぞ。', en: 'Five, then. This way, please.' },
          ],
          choices: [
            { type: 'people', n: 3 },
            { type: 'people', n: 4 },
            { type: 'people', n: 5 },
            { type: 'people', n: 6 },
          ],
          answer: 2,
          why: 'Four now and one more later (もう一人来ます): 五名様, five.',
        },
        {
          id: 'pool', level: 'N5',
          intro: '男[おとこ]の人[ひと]と 女[おんな]の人[ひと]が 話[はな]しています。女[おんな]の人[ひと]は 何曜日[なんようび]に プールへ 行[い]きますか。',
          lines: [
            { who: 'M', ja: '木村[きむら]さんは よく 泳[およ]ぎますか。', en: 'Do you swim a lot, Kimura-san?' },
            { who: 'F', ja: 'ええ、毎週[まいしゅう] 火曜日[かようび]と 金曜日[きんようび]に プールへ 行[い]きます。', en: 'Yes, I go to the pool every Tuesday and Friday.' },
            { who: 'M', ja: '週末[しゅうまつ]は 行[い]きませんか。', en: 'Not at the weekend?' },
            { who: 'F', ja: '週末[しゅうまつ]は 人[ひと]が 多[おお]いですから、行[い]きません。', en: 'It’s crowded at the weekend, so I don’t go.' },
          ],
          choices: [
            { type: 'week', days: [2, 4] },
            { type: 'week', days: [0, 6] },
            { type: 'week', days: [2, 5] },
            { type: 'week', days: [3, 5] },
          ],
          answer: 2,
          why: '火曜日 and 金曜日 — Tuesday and Friday. The weekend is too crowded.',
        },
        {
          id: 'key', level: 'N5',
          intro: '女[おんな]の人[ひと]と 男[おとこ]の人[ひと]が 話[はな]しています。鍵[かぎ]は どこに ありましたか。',
          lines: [
            { who: 'F', ja: 'あれ、鍵[かぎ]が ありません。', en: 'Huh, my key’s gone.' },
            { who: 'M', ja: 'かばんの 中[なか]は？', en: 'In your bag?' },
            { who: 'F', ja: 'もう 見[み]ました。机[つくえ]の 上[うえ]にも ありません。', en: 'I already looked. It’s not on the desk either.' },
            { who: 'M', ja: 'あ、椅子[いす]の 下[した]に ありますよ。', en: 'Oh, it’s under the chair.' },
            { who: 'F', ja: '本当[ほんとう]だ。ありがとう。', en: 'So it is. Thanks.' },
          ],
          choices: [
            { type: 'key', at: 'bag' },
            { type: 'key', at: 'desk' },
            { type: 'key', at: 'shelf' },
            { type: 'key', at: 'chair' },
          ],
          answer: 3,
          why: 'Not in the bag or on the desk — under the chair (椅子の下).',
        },
        {
          id: 'piano', level: 'N4',
          intro: '男[おとこ]の人[ひと]と 女[おんな]の人[ひと]が 話[はな]しています。女[おんな]の人[ひと]は 今[いま] 毎日[まいにち] 何時間[なんじかん] ピアノを 練習[れんしゅう]しますか。',
          lines: [
            { who: 'M', ja: 'ピアノが 上手[じょうず]ですね。毎日[まいにち] 練習[れんしゅう]して いますか。', en: 'You play the piano well. Do you practise every day?' },
            { who: 'F', ja: 'ええ。学生[がくせい]の 時[とき]は 毎日[まいにち] 三時間[さんじかん] 練習[れんしゅう]して いました。', en: 'Yes. When I was a student I practised three hours a day.' },
            { who: 'F', ja: 'でも、今[いま]は 仕事[しごと]が 忙[いそが]しいので、一時間[いちじかん]だけです。', en: 'But I’m busy with work now, so only one hour.' },
          ],
          choices: [
            { type: 'text', text: '1時間' },
            { type: 'text', text: '2時間' },
            { type: 'text', text: '3時間' },
            { type: 'text', text: '4時間' },
          ],
          answer: 0,
          why: 'Three hours was when she was a student (学生の時); now it’s only one hour (一時間だけ).',
        },
        {
          id: 'cake', level: 'N5',
          intro: 'ケーキ屋[や]で 女[おんな]の人[ひと]と 店[みせ]の人[ひと]が 話[はな]しています。女[おんな]の人[ひと]は どの ケーキを 買[か]いますか。',
          lines: [
            { who: 'F', ja: 'いちごの ケーキを 一[ひと]つ ください。', en: 'One strawberry cake, please.' },
            { who: 'M', ja: 'すみません、いちごの ケーキは もう ありません。', en: 'Sorry, the strawberry cakes are sold out.' },
            { who: 'F', ja: 'じゃ、チョコレートの ケーキを ください。あ、丸[まる]いのじゃ なくて、四角[しかく]いのを。', en: 'Then a chocolate cake, please. Oh — not the round one, the square one.' },
          ],
          choices: [
            { type: 'cake', shape: 'round', flavor: 'strawberry' },
            { type: 'cake', shape: 'round', flavor: 'chocolate' },
            { type: 'cake', shape: 'square', flavor: 'strawberry' },
            { type: 'cake', shape: 'square', flavor: 'chocolate' },
          ],
          answer: 3,
          why: 'The strawberry ones are gone, so chocolate — and the square one (四角いの), not the round one.',
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
          id: 'thanks', level: 'N5',
          intro: '友[とも]だちに プレゼントを もらいました。何[なん]と 言[い]いますか。',
          scene: { left: 'boy', right: 'girl', prop: 'gift', arrow: 'left' },
          choices: [
            { ja: 'ありがとう。', en: 'Thank you.' },
            { ja: 'どういたしまして。', en: 'You’re welcome.' },
            { ja: 'いただきます。', en: 'Said before eating.' },
          ],
          answer: 0,
          why: 'ありがとう thanks the friend. どういたしまして is the reply to thanks, and いただきます is said before a meal.',
        },
        {
          id: 'morning', level: 'N5',
          intro: '朝[あさ]、学校[がっこう]で 先生[せんせい]に 会[あ]いました。何[なん]と 言[い]いますか。',
          scene: { left: 'student', right: 'teacher', prop: 'sun', arrow: 'left' },
          choices: [
            { ja: 'こんばんは。', en: 'Good evening.' },
            { ja: 'おやすみなさい。', en: 'Good night.' },
            { ja: 'おはようございます。', en: 'Good morning (polite).' },
          ],
          answer: 2,
          why: 'In the morning, and to a teacher, so the polite おはようございます.',
        },
        {
          id: 'water', level: 'N5',
          intro: 'レストランで 水[みず]が 欲[ほ]しいです。お店[みせ]の 人[ひと]に 何[なん]と 言[い]いますか。',
          scene: { left: 'man', right: 'waiter', prop: 'drink', arrow: 'left' },
          choices: [
            { ja: '水[みず]は いかがですか。', en: 'Would you like some water?' },
            { ja: 'すみません、水[みず]を ください。', en: 'Excuse me, water please.' },
            { ja: '水[みず]を 飲[の]みましたか。', en: 'Did you drink the water?' },
          ],
          answer: 1,
          why: '〜をください asks for something. 水はいかがですか is what the waiter would say to you.',
        },
        {
          id: 'leaving', level: 'N5',
          intro: '友[とも]だちの 家[いえ]から 帰[かえ]ります。何[なん]と 言[い]いますか。',
          scene: { left: 'man', right: 'woman', prop: 'house', arrow: 'left' },
          choices: [
            { ja: 'いってきます。', en: 'I’m off (leaving your own home).' },
            { ja: 'ただいま。', en: 'I’m home.' },
            { ja: 'お邪魔[じゃま]しました。', en: 'Thank you for having me (lit. I disturbed you).', say: 'おじゃましました。' },
          ],
          answer: 2,
          why: 'Leaving someone else’s home you say おじゃましました. いってきます and ただいま are for your own home.',
        },
        {
          id: 'help', level: 'N4',
          intro: '荷物[にもつ]が 重[おも]いです。友[とも]だちに 何[なん]と 言[い]いますか。',
          scene: { left: 'woman', right: 'man', prop: 'box', arrow: 'left' },
          replyBy: 'F',
          choices: [
            { ja: 'ちょっと 手伝[てつだ]って くれませんか。', en: 'Could you give me a hand?' },
            { ja: '手伝[てつだ]いましょうか。', en: 'Shall I help you?' },
            { ja: 'どうぞ、持[も]って ください。', en: 'Here, please hold it.' },
          ],
          answer: 0,
          why: '〜てくれませんか asks a favour. 手伝いましょうか offers help — that’s for the friend to say.',
        },
        {
          id: 'borrow-pen', level: 'N4',
          intro: '友[とも]だちの ペンを 借[か]りたいです。何[なん]と 言[い]いますか。',
          scene: { left: 'student', right: 'boy', prop: 'pen', arrow: 'left' },
          choices: [
            { ja: 'ペン、借[か]りて くれる？', en: '(wrong verb: “will you borrow a pen for me?”)' },
            { ja: 'ペン、貸[か]して くれる？', en: 'Can you lend me a pen?' },
            { ja: 'ペン、貸[か]そうか。', en: 'Shall I lend you a pen?' },
          ],
          answer: 1,
          why: 'You ask the friend to lend (貸す) it: 貸してくれる？ 借りる is what you do, and 貸そうか is an offer.',
        },
        {
          id: 'try-on', level: 'N4',
          intro: '店[みせ]で 服[ふく]を 着[き]て みたいです。店[みせ]の人[ひと]に 何[なん]と 言[い]いますか。',
          scene: { left: 'woman', right: 'clerk', prop: 'shirt', arrow: 'left' },
          replyBy: 'F',
          choices: [
            { ja: 'これ、着[き]ても いいですか。', en: 'May I try this on?' },
            { ja: 'これ、着[き]て ください。', en: 'Please put this on.' },
            { ja: 'これ、着[き]ましたか。', en: 'Did you wear this?' },
          ],
          answer: 0,
          why: '〜てもいいですか asks permission. 着てください would tell the clerk to put it on.',
        },
        {
          id: 'meal', level: 'N5',
          intro: '今[いま]から ご飯[はん]を 食[た]べます。何[なん]と 言[い]いますか。',
          scene: { left: 'girl', right: 'grandma', prop: 'rice', arrow: 'left' },
          replyBy: 'F',
          choices: [
            { ja: 'ごちそうさまでした。', en: 'Thank you for the meal (after eating).' },
            { ja: 'いただきます。', en: 'Said before eating.' },
            { ja: 'おかえりなさい。', en: 'Welcome home.' },
          ],
          answer: 1,
          why: 'いただきます before the meal; ごちそうさまでした is for after you finish.',
        },
        {
          id: 'photo', level: 'N4',
          intro: '写真[しゃしん]を 撮[と]って ほしいです。何[なん]と 言[い]いますか。',
          scene: { left: 'tourist', right: 'woman', prop: 'camera', arrow: 'left' },
          choices: [
            { ja: '写真[しゃしん]を 撮[と]りましょうか。', en: 'Shall I take a photo?' },
            { ja: 'すみません、写真[しゃしん]を 撮[と]って いただけませんか。', en: 'Excuse me, could you take a photo for me?' },
            { ja: '写真[しゃしん]を 撮[と]っても いいですよ。', en: 'You may take a photo.' },
          ],
          answer: 1,
          why: '〜ていただけませんか politely asks a stranger for a favour. 撮りましょうか offers to take one.',
        },
        {
          id: 'leave-first', level: 'N4',
          intro: '会社[かいしゃ]で、ほかの 人[ひと]より 先[さき]に 帰[かえ]ります。何[なん]と 言[い]いますか。',
          scene: { left: 'office', right: 'officeWoman', prop: 'computer', arrow: 'left' },
          choices: [
            { ja: 'お疲[つか]れさまでした。', en: 'Thanks for your hard work (said to someone leaving).' },
            { ja: 'お先[さき]に 失礼[しつれい]します。', en: 'Excuse me for leaving first.' },
            { ja: 'いってらっしゃい。', en: 'See you (to someone going out).' },
          ],
          answer: 1,
          why: 'The one leaving says お先に失礼します; the colleagues answer お疲れさまでした.',
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
          id: 'country', level: 'N5',
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
          id: 'time', level: 'N5',
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
          id: 'tea', level: 'N5',
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
          id: 'lunch', level: 'N5',
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
          id: 'sorry', level: 'N5',
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
        {
          id: 'seat', level: 'N5',
          lines: [{ who: 'M', ja: 'すみません、この 席[せき]、空[あ]いて いますか。', en: 'Excuse me, is this seat free?' }],
          replyBy: 'F',
          choices: [
            { ja: 'はい、空[あ]きました。', en: 'Yes, it became free.' },
            { ja: 'いいえ、座[すわ]りません。', en: 'No, I won’t sit.' },
            { ja: 'ええ、どうぞ。', en: 'Yes, go ahead.' },
          ],
          answer: 2,
          why: 'ええ、どうぞ offers the seat. 空きました describes a change, not the seat being free now.',
        },
        {
          id: 'how-long', level: 'N4',
          lines: [{ who: 'F', ja: 'どのぐらい 日本語[にほんご]を 勉強[べんきょう]して いますか。', en: 'How long have you been studying Japanese?' }],
          replyBy: 'M',
          choices: [
            { ja: '毎日[まいにち]です。', en: 'Every day.' },
            { ja: '一年[いちねん]ぐらいです。', en: 'About a year.' },
            { ja: '大学[だいがく]で 勉強[べんきょう]します。', en: 'I study at university.' },
          ],
          answer: 1,
          why: 'どのぐらい asks how long: 一年ぐらい. 毎日 says how often.',
        },
        {
          id: 'if-rain', level: 'N4',
          lines: [{ who: 'M', ja: '明日[あした]、雨[あめ]だったら どう しますか。', en: 'What will you do if it rains tomorrow?' }],
          replyBy: 'F',
          choices: [
            { ja: 'うちで 映画[えいが]を 見[み]ます。', en: 'I’ll watch a film at home.' },
            { ja: '雨[あめ]が 降[ふ]りました。', en: 'It rained.' },
            { ja: '傘[かさ]を 持[も]って いませんでした。', en: 'I didn’t have an umbrella.' },
          ],
          answer: 0,
          why: '〜だったらどうしますか asks about a plan — answer with what you will do.',
        },
        {
          id: 'photo-ok', level: 'N4',
          lines: [{ who: 'F', ja: 'すみません、ここで 写真[しゃしん]を 撮[と]っても いいですか。', en: 'Excuse me, may I take photos here?' }],
          replyBy: 'M',
          choices: [
            { ja: 'いいえ、撮[と]りません。', en: 'No, I won’t take any.' },
            { ja: 'すみません、ここは だめなんです。', en: 'Sorry, it’s not allowed here.' },
            { ja: 'はい、撮[と]りました。', en: 'Yes, I took one.' },
          ],
          answer: 1,
          why: 'She asks permission; ここはだめなんです refuses it politely.',
        },
        {
          id: 'otsukare', level: 'N4',
          lines: [{ who: 'M', ja: 'お先[さき]に 失礼[しつれい]します。', en: 'Excuse me for leaving first.' }],
          replyBy: 'F',
          choices: [
            { ja: 'いってきます。', en: 'I’m off.' },
            { ja: 'お疲[つか]れさまでした。', en: 'Thanks for your hard work.' },
            { ja: 'いただきます。', en: 'Said before eating.' },
          ],
          answer: 1,
          why: 'When a colleague leaves first, you answer お疲れさまでした.',
        },
        {
          id: 'compliment', level: 'N4',
          lines: [{ who: 'F', ja: 'その かばん、すてきですね。', en: 'That’s a lovely bag.' }],
          replyBy: 'M',
          choices: [
            { ja: 'いいえ、すてきです。', en: 'No, it’s lovely.' },
            { ja: 'はい、かばんです。', en: 'Yes, it’s a bag.' },
            { ja: 'ありがとうございます。母[はは]に もらったんです。', en: 'Thank you. My mother gave it to me.' },
          ],
          answer: 2,
          why: 'Accept a compliment with ありがとう and a little about the bag.',
        },
        {
          id: 'station', level: 'N5',
          lines: [{ who: 'M', ja: 'ここから 駅[えき]まで どのぐらい かかりますか。', en: 'How long does it take from here to the station?' }],
          replyBy: 'F',
          choices: [
            { ja: '二百円[にひゃくえん]です。', en: 'It’s 200 yen.' },
            { ja: '歩[ある]いて 十分[じゅっぷん]ぐらいです。', en: 'About ten minutes on foot.' },
            { ja: '駅[えき]の 前[まえ]です。', en: 'In front of the station.' },
          ],
          answer: 1,
          why: 'どのぐらいかかりますか asks how long it takes: 歩いて十分ぐらい.',
        },
      ],
    },
  ];

  const api = { SECTIONS };
  global.LISTENING_SECTIONS = SECTIONS;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
