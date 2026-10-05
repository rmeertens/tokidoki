(function (global) {
  'use strict';

  // Example sentences and English form hints for conjugation cards, shared by
  // the website (app.js) and the iOS app (evaluated in JavaScriptCore).
  //
  // Japanese marks readings inline as 漢字[かんじ]. Each context gives the
  // phrase before the verb (`pre`), a clean English verb phrase (`v`) and
  // what follows it in English (`o`). `kind` picks which forms can make a
  // natural sentence and which frame each uses:
  //   act — something you choose to do ("I eat sushi"); every form works
  //   nv  — something that happens to you (忘れる, 疲れる): no requests,
  //         wishes, "let's", ability or making someone do it
  //   st  — a state with a が-object (分かる, 要る, 見える)
  //   ev  — an event with its own subject (`sub` / `s`): 雨が降る
  //   hon — honorific verbs describing someone else (いらっしゃる)
  //   hum — humble verbs, used politely about yourself (伺う, 申す)
  // `skip` removes further forms, `en` overrides the English for a form, and
  // `pl` marks a plural English subject. `potPre` replaces `pre` in the
  // potential form (運動ができる, not 運動をできる).

  const KIND_FORMS = {
    act: null,
    nv: ['masu', 'masu-neg', 'masu-past', 'masu-past-neg', 'te', 'nai', 'dict', 'ta', 'nakatta'],
    st: ['masu', 'masu-neg', 'masu-past', 'masu-past-neg', 'nai', 'dict', 'ta', 'nakatta', 'ba'],
    ev: ['masu', 'masu-neg', 'masu-past', 'masu-past-neg', 'te', 'nai', 'dict', 'ta', 'nakatta', 'ba'],
    hon: ['masu', 'masu-neg', 'masu-past', 'masu-past-neg', 'te', 'nai', 'dict', 'ta', 'nakatta'],
    hum: ['masu', 'masu-neg', 'masu-past', 'masu-past-neg', 'tai'],
  };

  const VERB_CONTEXTS = {
    // Chapter 3
    '行く': { pre: '学校[がっこう]に', v: 'go', o: 'to school' },
    '帰る': { pre: '家[いえ]に', v: 'go', o: 'home' },
    '聞く': { pre: '音楽[おんがく]を', v: 'listen', o: 'to music' },
    '聞く_ask': { pre: '先生[せんせい]に', v: 'ask', o: 'the teacher' },
    '飲む': { pre: 'コーヒーを', v: 'drink', o: 'coffee' },
    '話す': { pre: '日本語[にほんご]を', v: 'speak', o: 'Japanese' },
    '読む': { pre: '本[ほん]を', v: 'read', o: 'a book' },
    '起きる': { pre: '朝[あさ]早[はや]く', v: 'get up', o: 'early in the morning' },
    '食べる': { pre: '寿司[すし]を', v: 'eat', o: 'sushi' },
    '寝る': { pre: '早[はや]く', v: 'go to bed', o: 'early' },
    '見る': { pre: '映画[えいが]を', v: 'watch', o: 'a movie' },
    '来る': { pre: '日本[にほん]に', v: 'come', o: 'to Japan' },
    'する': { pre: '運動[うんどう]を', potPre: '運動[うんどう]が', v: 'get', o: 'exercise' },
    '勉強する': { pre: '日本語[にほんご]を', v: 'study', o: 'Japanese' },
    // Chapter 4
    '会う': { pre: '友達[ともだち]に', v: 'meet', o: 'a friend' },
    'ある': { kind: 'ev', sub: '机[つくえ]の上[うえ]に本[ほん]が', s: 'there', v: 'be', o: 'a book on the desk', skip: ['te'] },
    '買う': { pre: '新[あたら]しい靴[くつ]を', v: 'buy', o: 'new shoes' },
    '書く': { pre: '手紙[てがみ]を', v: 'write', o: 'a letter' },
    '撮る': { pre: '写真[しゃしん]を', v: 'take', o: 'a photo' },
    '待つ': { pre: 'バスを', v: 'wait', o: 'for the bus' },
    '分かる': { kind: 'st', pre: '日本語[にほんご]が', v: 'understand', o: 'Japanese' },
    'いる': { pre: '教室[きょうしつ]に', v: 'be', o: 'in the classroom' },
    // Chapter 5
    '泳ぐ': { pre: 'プールで', v: 'swim', o: 'in the pool' },
    '乗る': { pre: '電車[でんしゃ]に', v: 'ride', o: 'the train' },
    'やる': { pre: 'スポーツを', v: 'play', o: 'sports' },
    '出かける': { pre: '週末[しゅうまつ]に', v: 'go out', o: 'on the weekend' },
    // Chapter 6
    '遊ぶ': { pre: '公園[こうえん]で', v: 'play', o: 'in the park' },
    '急ぐ': { pre: '駅[えき]まで', v: 'hurry', o: 'to the station' },
    '返す': { pre: '本[ほん]を', v: 'return', o: 'the book' },
    '消す': { pre: '電気[でんき]を', v: 'turn off', o: 'the light' },
    '死ぬ': { kind: 'ev', sub: '金魚[きんぎょ]が', s: 'the goldfish', v: 'die', skip: ['ba'] },
    '座る': { pre: '椅子[いす]に', v: 'sit', o: 'on the chair' },
    '立つ': { pre: 'ここに', v: 'stand', o: 'here' },
    '吸う': { pre: 'タバコを', v: 'smoke', o: 'cigarettes' },
    '使う': { pre: 'パソコンを', v: 'use', o: 'a computer' },
    '手伝う': { pre: '友達[ともだち]を', v: 'help', o: 'a friend' },
    '入る': { pre: '部屋[へや]に', v: 'enter', o: 'the room' },
    '持つ': { pre: 'かばんを', v: 'carry', o: 'a bag' },
    '休む': { pre: '学校[がっこう]を', v: 'stay home', o: 'from school' },
    '開ける': { pre: '窓[まど]を', v: 'open', o: 'the window' },
    '教える': { pre: '英語[えいご]を', v: 'teach', o: 'English' },
    '降りる': { pre: 'バスを', v: 'get off', o: 'the bus' },
    '借りる': { pre: '本[ほん]を', v: 'borrow', o: 'a book' },
    'つける': { pre: 'テレビを', v: 'turn on', o: 'the TV' },
    '忘れる': { kind: 'nv', pre: '傘[かさ]を', v: 'forget', o: 'my umbrella' },
    '電話をかける': { pre: '母[はは]に', v: 'call', o: 'Mom' },
    '連れてくる': { pre: '友達[ともだち]を', v: 'bring', o: 'a friend' },
    '持ってくる': { pre: 'お弁当[べんとう]を', v: 'bring', o: 'a boxed lunch' },
    // Chapter 7
    '歌う': { pre: '歌[うた]を', v: 'sing', o: 'a song' },
    'かぶる': { pre: '帽子[ぼうし]を', v: 'put on', o: 'a hat' },
    '知る': {
      pre: '彼[かれ]の名前[なまえ]を', v: 'find out', o: 'his name',
      skip: ['masu', 'te', 'dict', 'potential', 'volitional', 'causative', 'ba', 'causative-passive'],
      en: {
        'masu-neg': "I don't know his name.", 'nai': "I don't know his name.",
        'masu-past-neg': "I didn't know his name.", 'nakatta': "I didn't know his name.",
        'tai': 'I want to know his name.',
      },
    },
    '住む': { pre: '東京[とうきょう]に', v: 'live', o: 'in Tokyo' },
    'はく': { pre: 'ジーンズを', v: 'put on', o: 'jeans' },
    '太る': { kind: 'nv', pre: '', v: 'gain weight', o: '' },
    'かける': { pre: 'メガネを', v: 'put on', o: 'glasses' },
    '着る': { pre: 'シャツを', v: 'put on', o: 'a shirt' },
    '勤める': { pre: '会社[かいしゃ]に', v: 'work', o: 'for a company' },
    '痩せる': { pre: '夏[なつ]までに', v: 'lose', o: 'weight by summer', skip: ['dict', 'passive', 'causative'] },
    '結婚する': { pre: '彼女[かのじょ]と', v: 'marry', o: 'her', skip: ['dict', 'volitional', 'causative', 'causative-passive'] },
    // Chapter 8
    '降る': { kind: 'ev', sub: '雨[あめ]が', s: 'it', v: 'rain' },
    '洗う': { pre: '皿[さら]を', v: 'wash', o: 'the dishes' },
    '言う': { pre: '「ありがとう」と', v: 'say', o: '"thank you"' },
    '要る': { kind: 'st', pre: 'お金[かね]が', v: 'need', o: 'money', skip: ['ba'] },
    '遅くなる': { kind: 'nv', pre: '帰[かえ]りが', v: 'get home', o: 'late' },
    '思う': {
      pre: 'そうだと', v: 'think', o: 'so',
      skip: ['dict', 'volitional', 'causative', 'ba', 'causative-passive'],
    },
    '切る': { pre: '紙[かみ]を', v: 'cut', o: 'the paper' },
    '作る': { pre: 'カレーを', v: 'make', o: 'curry' },
    '持っていく': { pre: 'お弁当[べんとう]を', v: 'take', o: 'a boxed lunch' },
    '始める': { pre: '宿題[しゅくだい]を', v: 'start', o: 'the homework' },
    '運転する': { pre: '車[くるま]を', v: 'drive', o: 'a car' },
    '洗濯する': { pre: '服[ふく]を', v: 'wash', o: 'clothes' },
    '掃除する': { pre: '部屋[へや]を', v: 'clean', o: 'the room' },
    '料理する': { pre: '晩[ばん]ご飯[はん]を', v: 'cook', o: 'dinner' },
    // Chapter 9
    '踊る': { pre: 'パーティーで', v: 'dance', o: 'at the party' },
    '終わる': { kind: 'ev', sub: '授業[じゅぎょう]が', s: 'class', v: 'end', skip: ['te'] },
    '始まる': { kind: 'ev', sub: '映画[えいが]が', s: 'the movie', v: 'start', skip: ['te'] },
    '弾く': { pre: 'ピアノを', v: 'play', o: 'the piano' },
    'もらう': { pre: 'プレゼントを', v: 'get', o: 'a present' },
    '覚える': { pre: '漢字[かんじ]を', v: 'memorize', o: 'kanji' },
    '出る': { pre: '授業[じゅぎょう]に', v: 'attend', o: 'class' },
    '運動する': { pre: '公園[こうえん]で', v: 'exercise', o: 'in the park' },
    '散歩する': { pre: '公園[こうえん]で', v: 'take a walk', o: 'in the park' },
    // Chapter 10
    'かかる': {
      kind: 'ev', sub: '駅[えき]まで一時間[いちじかん]', s: 'it', v: 'take', o: 'an hour to get to the station',
      skip: ['te', 'ba'],
    },
    '泊まる': { pre: 'ホテルに', v: 'stay', o: 'at a hotel' },
    'なる': { pre: '先生[せんせい]に', v: 'become', o: 'a teacher', skip: ['dict', 'volitional', 'causative', 'causative-passive'] },
    '払う': { pre: 'お金[かね]を', v: 'pay', o: 'the money', skip: ['dict'] },
    '決める': { pre: '予定[よてい]を', v: 'decide on', o: 'the plans' },
    '練習する': { pre: 'テニスを', v: 'practice', o: 'tennis' },
    // Chapter 11
    '取る': { pre: '日本語[にほんご]の授業[じゅぎょう]を', v: 'take', o: 'a Japanese class' },
    '習う': { pre: '日本語[にほんご]を', v: 'learn', o: 'Japanese' },
    '登る': { pre: '山[やま]に', v: 'climb', o: 'a mountain' },
    '働く': { pre: 'レストランで', v: 'work', o: 'at a restaurant' },
    '飼う': { pre: '猫[ねこ]を', v: 'have', o: 'a cat' },
    'サボる': { pre: '授業[じゅぎょう]を', v: 'skip', o: 'class' },
    '疲れる': { kind: 'nv', pre: '仕事[しごと]で', v: 'get tired', o: 'from work' },
    'やめる': { pre: '仕事[しごと]を', v: 'quit', o: 'the job', skip: ['dict'] },
    '紹介する': { pre: '友達[ともだち]を', v: 'introduce', o: 'a friend' },
    'ダイエットする': { pre: '夏[なつ]の前[まえ]に', v: 'go on a diet', o: 'before summer' },
    '遅刻する': { kind: 'nv', pre: '学校[がっこう]に', v: 'be late', o: 'for school' },
    '留学する': { pre: 'アメリカに', v: 'study abroad', o: 'in America' },
    // Chapter 12
    '喉が渇く': { kind: 'nv', pre: '', v: 'get thirsty', o: '' },
    'なくす': { kind: 'nv', pre: '鍵[かぎ]を', v: 'lose', o: 'my keys' },
    '別れる': {
      pre: '彼女[かのじょ]と', v: 'break up', o: 'with her',
      skip: ['dict', 'volitional', 'causative', 'causative-passive'],
    },
    '緊張する': { kind: 'nv', pre: 'テストの前[まえ]に', v: 'get nervous', o: 'before a test' },
    '心配する': {
      pre: '将来[しょうらい]のことを', v: 'worry', o: 'about the future',
      skip: ['te', 'dict', 'tai', 'potential', 'volitional', 'causative', 'ba', 'causative-passive'],
    },
    // Chapter 13
    '編む': { pre: 'セーターを', v: 'knit', o: 'a sweater' },
    '貸す': { pre: 'お金[かね]を', v: 'lend', o: 'money' },
    '頑張る': { pre: '試験[しけん]のために', v: 'work hard', o: 'for the exam' },
    '泣く': { kind: 'nv', pre: '映画[えいが]を見[み]て', v: 'cry', o: 'watching a movie' },
    '磨く': {
      pre: '歯[は]を', v: 'brush', o: 'my teeth', skip: ['volitional', 'passive', 'causative', 'ba'],
      en: { 'te': 'Please brush your teeth.' },
    },
    '約束を守る': {
      pre: '', v: 'keep', o: 'my promises', skip: ['passive', 'causative'],
      en: {
        'te': 'Please keep your promise.', 'volitional': "Let's keep our promises.",
        'ba': 'You should just keep your promises.',
      },
    },
    '感動する': { kind: 'nv', pre: '映画[えいが]に', v: 'be moved', o: 'by the movie', skip: ['te'] },
    // Chapter 14
    '送る': { pre: '荷物[にもつ]を', v: 'send', o: 'a package' },
    '似合う': { kind: 'ev', sub: 'この服[ふく]は', pre: '私[わたし]に', s: 'this outfit', v: 'suit', o: 'me', skip: ['te'] },
    '諦める': { pre: '夢[ゆめ]を', v: 'give up', o: 'on the dream', skip: ['dict', 'volitional'] },
    'あげる': { pre: '友達[ともだち]にプレゼントを', v: 'give', o: 'a friend a present' },
    'くれる': { kind: 'ev', sub: '友達[ともだち]が', pre: '本[ほん]を', s: 'my friend', v: 'give', o: 'me a book', skip: ['te'] },
    'できる': { kind: 'ev', sub: '宿題[しゅくだい]が', s: 'my homework', v: 'be finished', skip: ['te'] },
    '相談する': { pre: '先生[せんせい]に', v: 'consult', o: 'the teacher' },
    // Chapter 15
    '売る': { pre: '車[くるま]を', v: 'sell', o: 'the car' },
    '下ろす': { pre: 'お金[かね]を', v: 'withdraw', o: 'money' },
    '描く': { pre: '絵[え]を', v: 'draw', o: 'a picture' },
    '探す': { pre: '仕事[しごと]を', v: 'look for', o: 'a job' },
    '誘う': { pre: '友達[ともだち]をパーティーに', v: 'invite', o: 'a friend to the party' },
    'しゃべる': { pre: '電話[でんわ]で', v: 'chat', o: 'on the phone' },
    '付き合う': {
      pre: '彼女[かのじょ]と', v: 'go out', o: 'with her',
      skip: ['volitional', 'causative', 'causative-passive'],
    },
    '着く': {
      pre: '駅[えき]に', v: 'arrive', o: 'at the station',
      skip: ['te', 'dict', 'volitional', 'causative', 'ba', 'causative-passive'],
    },
    '気をつける': { pre: '車[くるま]に', v: 'watch out', o: 'for cars', skip: ['dict', 'passive'] },
    '調べる': { pre: 'インターネットで', v: 'look it up', o: 'on the internet' },
    '見える': { kind: 'st', pre: '山[やま]が', v: 'see', o: 'the mountain' },
    '観光する': { pre: '京都[きょうと]を', v: 'go sightseeing', o: 'in Kyoto' },
    '卒業する': { pre: '大学[だいがく]を', v: 'graduate', o: 'from university', skip: ['dict'] },
    '予約する': { pre: 'レストランを', v: 'book', o: 'a restaurant' },
    // Chapter 16
    '起こす': { pre: '妹[いもうと]を', v: 'wake up', o: 'my little sister' },
    'おごる': { pre: '友達[ともだち]に昼[ひる]ご飯[はん]を', v: 'treat', o: 'a friend to lunch' },
    '落ち込む': { kind: 'nv', pre: '失敗[しっぱい]して', v: 'feel down', o: 'after a failure' },
    '困る': { kind: 'nv', pre: 'お金[かね]に', v: 'have trouble', o: 'with money' },
    '出す': { pre: '宿題[しゅくだい]を', v: 'hand in', o: 'the homework' },
    '直す': { pre: 'パソコンを', v: 'fix', o: 'the computer' },
    '見つかる': { kind: 'ev', sub: '鍵[かぎ]が', s: 'the key', v: 'be found', skip: ['te'] },
    '訳す': { pre: 'この文[ぶん]を英語[えいご]に', v: 'translate', o: 'this sentence into English' },
    '笑う': { pre: '冗談[じょうだん]を聞[き]いて', v: 'laugh', o: 'at the joke', skip: ['passive', 'causative', 'causative-passive'] },
    '集める': { pre: '切手[きって]を', v: 'collect', o: 'stamps' },
    '入れる': { pre: 'コーヒーに砂糖[さとう]を', v: 'put', o: 'sugar in the coffee' },
    '乗り遅れる': { kind: 'nv', pre: '電車[でんしゃ]に', v: 'miss', o: 'the train' },
    '見せる': { pre: '写真[しゃしん]を', v: 'show', o: 'the photos' },
    '朝寝坊する': { kind: 'nv', pre: '日曜日[にちようび]に', v: 'oversleep', o: 'on Sunday' },
    '案内する': { pre: '友達[ともだち]に町[まち]を', v: 'show', o: 'my friend around the town' },
    '説明する': { pre: '問題[もんだい]を', v: 'explain', o: 'the problem' },
    // Chapter 17
    '選ぶ': { pre: 'プレゼントを', v: 'choose', o: 'a present' },
    '込む': { kind: 'ev', sub: '電車[でんしゃ]が', s: 'the train', v: 'get crowded', skip: ['ba'] },
    '脱ぐ': {
      pre: '靴[くつ]を', v: 'take off', o: 'my shoes', skip: ['passive', 'causative', 'ba'],
      en: { 'te': 'Please take off your shoes.', 'volitional': "Let's take off our shoes." },
    },
    '生まれる': { kind: 'ev', sub: '姉[あね]の赤[あか]ちゃんが', s: "my sister's baby", v: 'be born', skip: ['te'] },
    '足りる': { kind: 'ev', sub: 'お金[かね]が', s: 'there', v: 'be', o: 'enough money', skip: ['te'] },
    '慣れる': { kind: 'nv', pre: '日本[にほん]の生活[せいかつ]に', v: 'get used', o: 'to life in Japan' },
    '化粧する': { pre: '鏡[かがみ]の前[まえ]で', v: 'put on makeup', o: 'in front of the mirror' },
    '就職する': { pre: '銀行[ぎんこう]に', v: 'get a job', o: 'at a bank' },
    '離婚する': {
      pre: '夫[おっと]と', v: 'divorce', o: 'my husband',
      skip: ['te', 'dict', 'volitional', 'passive', 'causative', 'ba', 'causative-passive'],
    },
    // Chapter 18
    '開く': { kind: 'ev', sub: 'ドアが', s: 'the door', v: 'open' },
    '謝る': { pre: '先生[せんせい]に', v: 'apologize', o: 'to the teacher' },
    '押す': { pre: 'ボタンを', v: 'press', o: 'the button' },
    '落とす': { kind: 'nv', pre: '財布[さいふ]を', v: 'drop', o: 'my wallet' },
    '転ぶ': { kind: 'nv', pre: '道[みち]で', v: 'fall down', o: 'on the road' },
    '壊す': { pre: 'おもちゃを', v: 'break', o: 'the toy', skip: ['te', 'dict', 'tai', 'potential', 'volitional', 'ba'] },
    '咲く': { kind: 'ev', sub: '桜[さくら]が', s: 'the cherry blossoms', pl: true, v: 'bloom' },
    '閉まる': { kind: 'ev', sub: '店[みせ]が', s: 'the shop', v: 'close' },
    '汚す': { kind: 'nv', pre: '服[ふく]を', v: 'get', o: 'my clothes dirty' },
    '落ちる': { kind: 'ev', sub: '木[き]からりんごが', s: 'an apple', v: 'fall', o: 'from the tree', skip: ['ba'] },
    '片付ける': { pre: '部屋[へや]を', v: 'tidy up', o: 'the room' },
    '考える': { pre: '将来[しょうらい]のことを', v: 'think', o: 'about the future' },
    '消える': { kind: 'ev', sub: '電気[でんき]が', s: 'the light', v: 'go out' },
    '壊れる': { kind: 'ev', sub: 'パソコンが', s: 'the computer', v: 'break', skip: ['ba'] },
    '汚れる': { kind: 'ev', sub: '服[ふく]が', s: 'my clothes', pl: true, v: 'get dirty', skip: ['ba'] },
    '注文する': { pre: 'ピザを', v: 'order', o: 'pizza' },
    // Chapter 19
    'いらっしゃる': { kind: 'hon', sub: '先生[せんせい]が', pre: '教室[きょうしつ]に', s: 'the teacher', v: 'be', o: 'in the classroom', skip: ['te'] },
    '怒る': { kind: 'ev', sub: '母[はは]が', s: 'Mom', v: 'get angry', skip: ['ba'] },
    'おっしゃる': { kind: 'hon', sub: '先生[せんせい]が', pre: 'そう', s: 'the teacher', v: 'say', o: 'so', skip: ['te'] },
    '決まる': { kind: 'ev', sub: '予定[よてい]が', s: 'the plans', pl: true, v: 'be decided', skip: ['te'] },
    '下さる': { kind: 'hon', sub: '先生[せんせい]が', pre: 'お菓子[かし]を', s: 'the teacher', v: 'give', o: 'me sweets', skip: ['te'] },
    'ご覧になる': { kind: 'hon', sub: '先生[せんせい]が', pre: '映画[えいが]を', s: 'the teacher', v: 'watch', o: 'a movie' },
    '引っ越す': { pre: '大阪[おおさか]に', v: 'move', o: 'to Osaka' },
    '召し上がる': { kind: 'hon', sub: '先生[せんせい]が', pre: 'お寿司[すし]を', s: 'the teacher', v: 'eat', o: 'sushi' },
    '呼ぶ': { pre: 'タクシーを', v: 'call', o: 'a taxi' },
    '寄る': { pre: 'コンビニに', v: 'stop by', o: 'the convenience store' },
    '遅れる': { kind: 'ev', sub: '電車[でんしゃ]が', s: 'the train', v: 'be late', skip: ['ba'] },
    '晴れる': { kind: 'ev', sub: '午後[ごご]は', s: 'it', v: 'clear up', o: 'in the afternoon', skip: ['te'] },
    'もてる': {
      pre: '学校[がっこう]で', v: 'be popular', o: 'at school',
      skip: ['te', 'dict', 'potential', 'volitional', 'passive', 'causative', 'ba', 'causative-passive'],
    },
    '招待する': { pre: '先生[せんせい]を結婚式[けっこんしき]に', v: 'invite', o: 'the teacher to the wedding' },
    '注意する': { pre: '車[くるま]に', v: 'watch out', o: 'for cars' },
    // Chapter 20
    '致す': { kind: 'hum', pre: 'お手伝[てつだ]いを', v: 'help', o: 'you', skip: ['tai'] },
    '頂く': { kind: 'hum', pre: 'お土産[みやげ]を', v: 'receive', o: 'a souvenir' },
    '伺う': { kind: 'hum', pre: '先生[せんせい]のお宅[たく]に', v: 'visit', o: "the teacher's home" },
    'おる': { kind: 'hum', pre: 'こちらに', v: 'be', o: 'here', skip: ['tai'] },
    '参る': { kind: 'hum', pre: 'そちらに', v: 'go', o: 'there' },
    '曲がる': { pre: '次[つぎ]の角[かど]を右[みぎ]に', v: 'turn', o: 'right at the next corner' },
    '申す': { kind: 'hum', pre: '田中[たなか]と', v: 'be called', o: 'Tanaka', skip: ['masu-neg', 'masu-past', 'masu-past-neg', 'tai'] },
    '戻る': { pre: '家[いえ]に', v: 'go back', o: 'home' },
    '聞こえる': { kind: 'st', pre: '音楽[おんがく]が', v: 'hear', o: 'music' },
    '差し上げる': { kind: 'hum', pre: '先生[せんせい]にプレゼントを', v: 'give', o: 'the teacher a present' },
    '伝える': { pre: 'メッセージを', v: 'pass on', o: 'the message' },
    '交換する': { pre: '電話[でんわ]番号[ばんごう]を', v: 'exchange', o: 'phone numbers' },
    '生活する': { pre: '東京[とうきょう]で', v: 'live', o: 'in Tokyo' },
    // Chapter 21
    '置く': { pre: '机[つくえ]の上[うえ]にかばんを', v: 'put', o: 'the bag on the desk' },
    '触る': { pre: '猫[ねこ]に', v: 'touch', o: 'the cat' },
    '捕まる': { kind: 'ev', sub: '泥棒[どろぼう]が', s: 'the thief', v: 'get caught' },
    '包む': { pre: 'プレゼントを', v: 'wrap', o: 'the present' },
    '殴る': { pre: '壁[かべ]を', v: 'punch', o: 'the wall', skip: ['te', 'dict', 'volitional', 'ba'] },
    '盗む': { pre: '財布[さいふ]を', v: 'steal', o: 'a wallet', skip: ['te', 'dict', 'tai', 'potential', 'volitional', 'causative', 'ba', 'causative-passive'] },
    '貼る': { pre: '壁[かべ]にポスターを', v: 'put up', o: 'a poster on the wall' },
    '踏む': { pre: '猫[ねこ]のしっぽを', v: 'step', o: "on the cat's tail", skip: ['te', 'dict', 'tai', 'potential', 'volitional', 'causative', 'ba', 'causative-passive'] },
    '焼く': { pre: 'ケーキを', v: 'bake', o: 'a cake' },
    'いじめる': { pre: '弱[よわ]い子[こ]を', v: 'bully', o: 'weaker kids', skip: ['te', 'dict', 'tai', 'potential', 'volitional', 'causative', 'ba', 'causative-passive'] },
    '着替える': { pre: '服[ふく]を', v: 'change', o: 'clothes' },
    'ためる': { pre: 'お金[かね]を', v: 'save', o: 'money' },
    '続ける': { pre: '勉強[べんきょう]を', v: 'continue', o: 'studying' },
    '褒める': { pre: '生徒[せいと]を', v: 'praise', o: 'the students' },
    '間違える': { kind: 'nv', pre: '答[こた]えを', v: 'get', o: 'the answer wrong' },
    '見つける': {
      pre: '財布[さいふ]を', v: 'find', o: 'my wallet',
      skip: ['dict', 'volitional', 'causative', 'ba', 'causative-passive'],
    },
    '連絡する': { pre: '友達[ともだち]に', v: 'contact', o: 'a friend' },
    // Chapter 22
    '勝つ': { pre: '試合[しあい]に', v: 'win', o: 'the game' },
    '運ぶ': { pre: '荷物[にもつ]を', v: 'carry', o: 'the luggage' },
    '走る': { pre: '公園[こうえん]で', v: 'run', o: 'in the park' },
    '拾う': { pre: 'ゴミを', v: 'pick up', o: 'trash' },
    '間に合う': { kind: 'nv', pre: '電車[でんしゃ]に', v: 'catch', o: 'the train in time' },
    '育てる': { pre: '野菜[やさい]を', v: 'grow', o: 'vegetables' },
    '助ける': { pre: '友達[ともだち]を', v: 'help', o: 'a friend' },
    '負ける': { kind: 'nv', pre: '試合[しあい]に', v: 'lose', o: 'the game' },
    '賛成する': { pre: 'この意見[いけん]に', v: 'agree', o: 'with this opinion' },
    '反対する': { pre: 'その計画[けいかく]に', v: 'oppose', o: 'that plan' },
    '翻訳する': { pre: 'この本[ほん]を', v: 'translate', o: 'this book' },
    // Chapter 23
    '受ける': { pre: '試験[しけん]を', v: 'take', o: 'the exam' },
    '答える': { pre: '質問[しつもん]に', v: 'answer', o: 'the question' },
    '離れる': { pre: '家[いえ]から', v: 'move away', o: 'from home' },
    '我慢する': { pre: '痛[いた]みを', v: 'put up', o: 'with the pain' },
    '優勝する': { pre: '大会[たいかい]で', v: 'win', o: 'the tournament' },
  };

  // Adjectives: `s` is the English subject and `a` the adjective. Contexts
  // with `v` instead ("I like cats") are phrased with an English verb.
  const ADJ_CONTEXTS = {
    'おもしろい': { pre: 'この映画[えいが]は', s: 'this movie', a: 'interesting' },
    'おいしい': { pre: 'このケーキは', s: 'this cake', a: 'delicious' },
    '楽しい': { pre: 'この旅行[りょこう]は', s: 'this trip', a: 'fun' },
    '安い': { pre: 'この店[みせ]は', s: 'this shop', a: 'cheap' },
    '怖い': { pre: 'あの映画[えいが]は', s: 'that movie', a: 'scary' },
    '寒い': { pre: '今日[きょう]は', s: 'today', a: 'cold', en: { 'adj-adverb': 'It got cold today.' } },
    '暑い': { pre: '今年[ことし]の夏[なつ]は', s: 'this summer', a: 'hot', en: { 'adj-adverb': 'It got hot this summer.' } },
    '忙しい': { pre: '今週[こんしゅう]は', s: 'this week', a: 'busy' },
    '高い': { pre: 'この車[くるま]は', s: 'this car', a: 'expensive' },
    '大きい': { pre: 'この部屋[へや]は', s: 'this room', a: 'big', skip: ['adj-adverb'] },
    '小さい': { pre: 'この箱[はこ]は', s: 'this box', a: 'small', skip: ['adj-adverb'] },
    '新しい': { pre: 'この駅[えき]は', s: 'this station', a: 'new', skip: ['adj-adverb'] },
    '古い': { pre: 'この建物[たてもの]は', s: 'this building', a: 'old' },
    'いい': { pre: '天気[てんき]が', s: 'the weather', a: 'good' },
    '難しい': { pre: 'この問題[もんだい]は', s: 'this problem', a: 'difficult' },
    'かっこいい': { pre: '彼[かれ]は', s: 'he', a: 'cool' },
    'つまらない': { pre: 'この授業[じゅぎょう]は', s: 'this class', a: 'boring' },
    'きれい': { pre: 'この公園[こうえん]は', s: 'this park', a: 'beautiful' },
    '元気': { pre: '祖母[そぼ]は', s: 'my grandmother', a: 'healthy' },
    '静か': { pre: 'この図書館[としょかん]は', s: 'this library', a: 'quiet' },
    'にぎやか': { pre: 'この町[まち]は', s: 'this town', a: 'lively' },
    '好き': { pre: '私[わたし]は猫[ねこ]が', s: 'I', v: 'like', o: 'cats', skip: ['adj-te'] },
    '嫌い': { pre: '私[わたし]は虫[むし]が', s: 'I', v: 'dislike', o: 'bugs', skip: ['adj-te'] },
    '暇': { pre: '今日[きょう]は', s: 'I', a: 'free', o: 'today', skip: ['adj-te'] },
    'ハンサム': { pre: '彼[かれ]は', s: 'he', a: 'handsome' },
    '長い': { pre: 'この映画[えいが]は', s: 'this movie', a: 'long', skip: ['adj-adverb'] },
    '短い': { pre: '冬[ふゆ]は日[ひ]が', s: 'the days', pl: true, a: 'short', o: 'in winter' },
    '速い': { pre: 'この電車[でんしゃ]は', s: 'this train', a: 'fast' },
    '近い': { pre: '駅[えき]は', s: 'the station', a: 'close', skip: ['adj-adverb'] },
    '遠い': { pre: '学校[がっこう]は', s: 'the school', a: 'far', skip: ['adj-adverb'] },
    '多い': {
      pre: 'この町[まち]は人[ひと]が', s: 'this town', v: 'have', o: 'a lot of people',
      en: { 'adj-te': 'This town had so many people that I was surprised.' },
    },
    '少ない': { pre: 'この町[まち]は子供[こども]が', s: 'the number of children in this town', a: 'small' },
    '広い': { pre: 'この部屋[へや]は', s: 'this room', a: 'spacious' },
    '狭い': { pre: 'このアパートは', s: 'this apartment', a: 'cramped' },
    '悪い': { pre: '天気[てんき]が', s: 'the weather', a: 'bad' },
    '優しい': { pre: '先生[せんせい]は', s: 'the teacher', a: 'kind' },
    '有名': { pre: 'この店[みせ]は', s: 'this shop', a: 'famous' },
    '便利': { pre: 'この駅[えき]は', s: 'this station', a: 'convenient' },
    '暖かい': { pre: '今日[きょう]は', s: 'today', a: 'warm', en: { 'adj-adverb': 'It got warm today.' } },
    '涼しい': { pre: '夜[よる]は', s: 'the nights', pl: true, a: 'cool' },
    '甘い': { pre: 'このケーキは', s: 'this cake', a: 'sweet' },
    '辛い': { pre: 'このカレーは', s: 'this curry', a: 'spicy' },
    '簡単': { pre: 'この問題[もんだい]は', s: 'this problem', a: 'easy' },
    '嬉しい': { pre: '私[わたし]は', s: 'I', a: 'happy', skip: ['adj-te'] },
    '悲しい': { pre: 'あの映画[えいが]は', s: 'that movie', a: 'sad' },
    '痛い': {
      pre: '頭[あたま]が', s: 'my head', v: 'hurt', skip: ['adj-te'],
      en: { 'adj-adverb': 'My head started to hurt.' },
    },
    '厳しい': { pre: 'この先生[せんせい]は', s: 'this teacher', a: 'strict' },
    '素敵': { pre: 'この服[ふく]は', s: 'this outfit', a: 'lovely' },
    '汚い': { pre: 'この部屋[へや]は', s: 'this room', a: 'dirty' },
    '危ない': { pre: 'この道[みち]は', s: 'this road', a: 'dangerous' },
    '丈夫': { pre: 'この鞄[かばん]は', s: 'this bag', a: 'sturdy', skip: ['adj-adverb'] },
    '珍しい': { pre: 'この料理[りょうり]は', s: 'this dish', a: 'unusual', skip: ['adj-adverb'] },
    '正直': { pre: '彼[かれ]は', s: 'he', a: 'honest' },
    '明るい': { pre: 'この部屋[へや]は', s: 'this room', a: 'bright' },
    '暗い': { pre: 'この道[みち]は', s: 'this road', a: 'dark' },
    '強い': { pre: '彼[かれ]は', s: 'he', a: 'strong' },
    '弱い': { pre: 'このチームは', s: 'this team', a: 'weak' },
    '正しい': { pre: 'この答[こた]えは', s: 'this answer', a: 'correct', skip: ['adj-te', 'adj-adverb'] },
    '幸せ': { pre: '彼女[かのじょ]は', s: 'she', a: 'happy' },
  };

  // ─── English inflection ─────────────────────────────────────────────────────

  // [past, -ing] for verbs that don't follow the regular spelling rules.
  const IRREGULAR = {
    be: ['was', 'being'], become: ['became'], begin: ['began', 'beginning'], break: ['broke'],
    bring: ['brought'], buy: ['bought'], catch: ['caught'],
    chat: ['chatted', 'chatting'], choose: ['chose'], come: ['came'], cut: ['cut', 'cutting'],
    do: ['did'], draw: ['drew'], drink: ['drank'], drive: ['drove'], drop: ['dropped', 'dropping'], eat: ['ate'],
    fall: ['fell'], feel: ['felt'], find: ['found'], forget: ['forgot', 'forgetting'],
    get: ['got', 'getting'], give: ['gave'], go: ['went'], grow: ['grew'], hang: ['hung'], have: ['had'],
    hear: ['heard'], hit: ['hit', 'hitting'], hold: ['held'], hurt: ['hurt'], keep: ['kept'], knit: ['knitted', 'knitting'], know: ['knew'], leave: ['left'], lend: ['lent'],
    lose: ['lost'], make: ['made'], meet: ['met'], oversleep: ['overslept'], pay: ['paid'],
    put: ['put', 'putting'], quit: ['quit', 'quitting'], read: ['read'], ride: ['rode'],
    run: ['ran', 'running'], say: ['said'], see: ['saw'], sightsee: ['went sightseeing', 'sightseeing'], sell: ['sold'], send: ['sent'], sing: ['sang'],
    sit: ['sat', 'sitting'], skip: ['skipped', 'skipping'], sleep: ['slept'], speak: ['spoke'], stand: ['stood'],
    steal: ['stole'], step: ['stepped', 'stepping'], stick: ['stuck'], stop: ['stopped', 'stopping'],
    submit: ['submitted', 'submitting'], swim: ['swam', 'swimming'], take: ['took'],
    teach: ['taught'], tell: ['told'], think: ['thought'], understand: ['understood'], wake: ['woke'],
    win: ['won', 'winning'], withdraw: ['withdrew'], wrap: ['wrapped', 'wrapping'], write: ['wrote'],
  };

  function thirdPerson(word) {
    if (word === 'have') return 'has';
    if (/(s|sh|ch|x|z|o)$/.test(word)) return word + 'es';
    if (/[^aeiou]y$/.test(word)) return word.slice(0, -1) + 'ies';
    return word + 's';
  }

  function pastTense(word) {
    if (IRREGULAR[word]) return IRREGULAR[word][0];
    if (word.endsWith('e')) return word + 'd';
    if (/[^aeiou]y$/.test(word)) return word.slice(0, -1) + 'ied';
    return word + 'ed';
  }

  function gerund(word) {
    if (IRREGULAR[word] && IRREGULAR[word][1]) return IRREGULAR[word][1];
    if (word.endsWith('ie')) return word.slice(0, -2) + 'ying';
    if (/[^eoy]e$/.test(word)) return word.slice(0, -1) + 'ing';
    return word + 'ing';
  }

  // Inflects the first word of a verb phrase ("turn off" → "turned off",
  // "eat/drink" → "ate/drank").
  function inflect(phrase, fn) {
    const [head, ...rest] = phrase.split(' ');
    return [head.split('/').map(fn).join('/'), ...rest].join(' ');
  }

  // English clause for `subject` + `phrase` in a tense: pres, neg, past, pastNeg.
  function clause(subject, phrase, tense, plural) {
    const [head, ...restWords] = phrase.split(' ');
    const rest = restWords.length ? ' ' + restWords.join(' ') : '';
    const first = subject === 'I';
    const single = !first && !plural && subject !== 'you';
    if (head === 'be') {
      const forms = {
        pres: first ? 'am' : single ? 'is' : 'are',
        neg: first ? 'am not' : single ? "isn't" : "aren't",
        past: first || single ? 'was' : 'were',
        pastNeg: first || single ? "wasn't" : "weren't",
      };
      return `${subject} ${forms[tense]}${rest}`;
    }
    switch (tense) {
      case 'pres': return `${subject} ${single ? inflect(phrase, thirdPerson) : phrase}`;
      case 'neg': return `${subject} ${single ? "doesn't" : "don't"} ${phrase}`;
      case 'past': return `${subject} ${inflect(phrase, pastTense)}`;
      case 'pastNeg': return `${subject} didn't ${phrase}`;
      default: return `${subject} ${phrase}`;
    }
  }

  function sentence(text) {
    const trimmed = text.replace(/\s+/g, ' ').replace(/\s+([.,?!])/g, '$1').trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  // ─── Furigana ───────────────────────────────────────────────────────────────

  const KANJI_RE = /[\u4e00-\u9fff々〆ヵヶ]/;
  const KANJI_OR_KANA_RUNS = /[\u4e00-\u9fff々〆ヵヶ]+|[^\u4e00-\u9fff々〆ヵヶ]+/g;

  function furiganaHtml(str) {
    return str.replace(/([\u4e00-\u9fff々〆ヵヶ]+)\[([^\]]+)\]/g, '<ruby>$1<rt>$2</rt></ruby>');
  }

  function stripFurigana(str) {
    return str.replace(/\[[^\]]+\]/g, '');
  }

  // Split a kanji spelling into kanji and kana runs and match it against the
  // reading, e.g. 持って来 + もってこ -> 持[も]って来[こ]. Null if they don't line up.
  function alignFurigana(kanji, reading) {
    const parts = kanji.match(KANJI_OR_KANA_RUNS) || [];
    const pattern = parts
      .map(p => KANJI_RE.test(p) ? '(.+?)' : `(${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`)
      .join('');
    const m = reading.match(new RegExp(`^${pattern}$`));
    if (!m) return null;
    return parts.map((p, i) => KANJI_RE.test(p) ? `${p}[${m[i + 1]}]` : p).join('');
  }

  // Conjugations are computed on the reading (ゆうしょうさせる); show them with
  // the dictionary form's kanji instead (優勝[ゆうしょう]させる) where the
  // kanji stem's reading survives conjugation. 来る changes its reading
  // (こ/き/く), so its last kana is taken from the conjugated form.
  function withKanji(word, conjugated) {
    const { kanji, reading } = word;
    if (!kanji || kanji === reading) return conjugated;
    let i = 0;
    while (i < kanji.length && i < reading.length && kanji[kanji.length - 1 - i] === reading[reading.length - 1 - i]) i++;
    const kStem = kanji.slice(0, kanji.length - i);
    const rStem = reading.slice(0, reading.length - i);
    if (kStem && conjugated.startsWith(rStem)) {
      if (!KANJI_RE.test(kStem)) return kStem + conjugated.slice(rStem.length);
      const a = alignFurigana(kStem, rStem);
      if (a) return a + conjugated.slice(rStem.length);
    }
    if (kStem.endsWith('来') && rStem.endsWith('く')) {
      const base = rStem.slice(0, -1);
      if (conjugated.startsWith(base) && conjugated.length > base.length) {
        const a = alignFurigana(kStem, base + conjugated[base.length]);
        if (a) return a + conjugated.slice(base.length + 1);
      }
    }
    return conjugated;
  }

  // ─── Example sentences ──────────────────────────────────────────────────────

  function isAdjective(word) {
    return word.type === 'i-adj' || word.type === 'na-adj';
  }

  function contextFor(word) {
    if (isAdjective(word)) return ADJ_CONTEXTS[word.kanji] || ADJ_CONTEXTS[word.reading] || null;
    const key = word.disambig ? `${word.kanji}_${word.disambig}` : word.kanji;
    return VERB_CONTEXTS[key] || VERB_CONTEXTS[word.kanji] || null;
  }

  function hasExample(ctx, form, kinds) {
    const allowed = kinds[ctx.kind || 'act'];
    if (allowed && !allowed.includes(form)) return false;
    return !(ctx.skip || []).includes(form);
  }

  function verbJa(ctx, c, form) {
    const kind = ctx.kind || 'act';
    const sub = ctx.sub || '';
    const pre = (form === 'potential' && ctx.potPre) || ctx.pre || '';
    const stmt = `${sub}${pre}${c}`;
    switch (form) {
      case 'te':
        return kind === 'act' || kind === 'hon' ? `${pre}${c}ください。` : `${stmt}しまいました。`;
      case 'dict':
        return kind === 'act' ? `${stmt}のが好[す]きです。` : `${stmt}と思[おも]います。`;
      case 'tai': return `${stmt}です。`;
      case 'volitional': return `一緒[いっしょ]に${stmt}。`;
      case 'passive': return `弟[おとうと]に${stmt}と困[こま]ります。`;
      case 'causative': return `子供[こども]に${stmt}。`;
      case 'ba': return kind === 'act' ? `${stmt}いいですよ。` : `${stmt}いいですね。`;
      case 'causative-passive': return `父[ちち]に${stmt}。`;
      default: return `${stmt}。`;
    }
  }

  function verbEn(ctx, form) {
    const kind = ctx.kind || 'act';
    const s = ctx.s || 'I';
    const v = ctx.v;
    const o = ctx.o || '';
    const pl = !!ctx.pl;
    switch (form) {
      case 'masu': return `${clause(s, v, 'pres', pl)} ${o}.`;
      case 'masu-neg':
      case 'nai': return `${clause(s, v, 'neg', pl)} ${o}.`;
      case 'masu-past':
      case 'ta': return `${clause(s, v, 'past', pl)} ${o}.`;
      case 'masu-past-neg':
      case 'nakatta': return `${clause(s, v, 'pastNeg', pl)} ${o}.`;
      case 'te':
        if (kind === 'act' || kind === 'hon') return `Please ${v} ${o}.`;
        return `${s} ended up ${inflect(v, gerund)} ${o}.`;
      case 'dict':
        if (kind === 'act') return `I like to ${v} ${o}.`;
        return `I think ${s} will ${v} ${o}.`;
      case 'tai': return `I want to ${v} ${o}.`;
      case 'potential': return `I can ${v} ${o}.`;
      case 'volitional': return `Let's ${v} ${o} together.`;
      case 'passive': return `It's a problem for me if ${clause('my little brother', v, 'pres', false)} ${o}.`;
      case 'causative': return `I let the child ${v} ${o}.`;
      case 'ba':
        if (kind === 'act') return `You should just ${v} ${o}.`;
        return `I hope ${clause(s, v, 'pres', pl)} ${o}.`;
      case 'causative-passive': return `I'm made to ${v} ${o} by my father.`;
      default: return `${clause(s, v, 'pres', pl)} ${o}.`;
    }
  }

  const ADJ_FORMS = { act: null };

  function adjJa(ctx, c, form) {
    switch (form) {
      case 'adj-te': return `${ctx.pre}${c}、びっくりしました。`;
      case 'adj-adverb': return `${ctx.pre}${c}なりました。`;
      default: return `${ctx.pre}${c}。`;
    }
  }

  function adjEn(ctx, form) {
    const pl = !!ctx.pl;
    const o = ctx.o || '';
    const phrase = ctx.v || `be ${ctx.a}`;
    switch (form) {
      case 'adj-neg': return `${clause(ctx.s, phrase, 'neg', pl)} ${o}.`;
      case 'adj-past': return `${clause(ctx.s, phrase, 'past', pl)} ${o}.`;
      case 'adj-past-neg': return `${clause(ctx.s, phrase, 'pastNeg', pl)} ${o}.`;
      case 'adj-te': return `${clause(ctx.s, `be so ${ctx.a}`, 'past', pl)} ${o} that I was surprised.`;
      case 'adj-adverb': return ctx.v ? `${ctx.s} came to ${ctx.v} ${o}.` : `${ctx.s} became ${ctx.a} ${o}.`;
      default: return `${clause(ctx.s, phrase, 'pres', pl)} ${o}.`;
    }
  }

  // { ja, en } for a word in a form, or null when that form has no natural
  // example. `conjugated` is the hiragana answer; pass null to blank it out.
  function build(word, form, conjugated) {
    const ctx = contextFor(word);
    if (!ctx) return null;
    const adj = isAdjective(word);
    if (!hasExample(ctx, form, adj ? ADJ_FORMS : KIND_FORMS)) return null;
    const c = conjugated == null ? '＿＿' : withKanji(word, conjugated);
    const ja = adj ? adjJa(ctx, c, form) : verbJa(ctx, c, form);
    const en = (ctx.en && ctx.en[form]) || (adj ? adjEn(ctx, form) : verbEn(ctx, form));
    return { ja, en: sentence(en) };
  }

  // ─── Form hints (card front) ────────────────────────────────────────────────

  // "to get up / to wake up" → ["get up", "wake up"]
  function meaningAlternatives(meaning) {
    return meaning.split(' / ').map(m => m.replace(/^to /, '').replace(/\bone's\b/g, 'my'));
  }

  function hint(meaning, form) {
    const alts = meaningAlternatives(meaning);
    const all = fn => alts.map(fn).join(' / ');
    const base = alts.join(' / ');
    switch (form) {
      case 'masu': return `${base} (polite)`;
      case 'masu-neg': return `don't ${base} (polite)`;
      case 'masu-past': return `${all(a => inflect(a, pastTense))} (polite, past)`;
      case 'masu-past-neg': return `didn't ${base} (polite, past)`;
      case 'te': return `${base} and... / please ${base}`;
      case 'nai': return `don't ${base} (plain)`;
      case 'dict': return `to ${base} (plain)`;
      case 'ta': return `${all(a => inflect(a, pastTense))} (plain, past)`;
      case 'nakatta': return `didn't ${base} (plain, past)`;
      case 'tai': return `want to ${base}`;
      case 'potential': return `can ${base}`;
      case 'volitional': return `let's ${base}`;
      case 'passive': return `passive of "${base}"`;
      case 'causative': return `make/let someone ${base}`;
      case 'ba': return `if … ${base}`;
      case 'causative-passive': return `is made to ${base}`;
      case 'adj-present': return `it is ${base}`;
      case 'adj-neg': return `it is not ${base}`;
      case 'adj-past': return `it was ${base}`;
      case 'adj-past-neg': return `it was not ${base}`;
      case 'adj-te': return `${base}, and...`;
      case 'adj-adverb': return `${base} (as an adverb / becoming ${base})`;
      default: return base;
    }
  }

  global.Examples = {
    VERB_CONTEXTS,
    ADJ_CONTEXTS,
    build,
    hint,
    withKanji,
    furiganaHtml,
    stripFurigana,
    contextFor,
    // English helpers, shared with the bunkei (sentence pattern) drill.
    english: { clause, inflect, pastTense, gerund, sentence },
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = global.Examples;
  }
})(typeof window !== 'undefined' ? window : globalThis);
