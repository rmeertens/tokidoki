const GENKI_VERBS = [
  // ===== GENKI I =====

  // Chapter 3
  { kanji: '行く', reading: 'いく', meaning: 'to go', type: 'u', chapter: 3 },
  { kanji: '帰る', reading: 'かえる', meaning: 'to return (home)', type: 'u', chapter: 3 },
  { kanji: '聞く', reading: 'きく', meaning: 'to listen / to hear', type: 'u', chapter: 3 },
  { kanji: '飲む', reading: 'のむ', meaning: 'to drink', type: 'u', chapter: 3 },
  { kanji: '話す', reading: 'はなす', meaning: 'to speak / to talk', type: 'u', chapter: 3 },
  { kanji: '読む', reading: 'よむ', meaning: 'to read', type: 'u', chapter: 3 },
  { kanji: '起きる', reading: 'おきる', meaning: 'to get up / to wake up', type: 'ru', chapter: 3 },
  { kanji: '食べる', reading: 'たべる', meaning: 'to eat', type: 'ru', chapter: 3 },
  { kanji: '寝る', reading: 'ねる', meaning: 'to sleep / to go to bed', type: 'ru', chapter: 3 },
  { kanji: '見る', reading: 'みる', meaning: 'to see / to watch', type: 'ru', chapter: 3 },
  { kanji: '来る', reading: 'くる', meaning: 'to come', type: 'irregular', chapter: 3 },
  { kanji: 'する', reading: 'する', meaning: 'to do', type: 'irregular', chapter: 3 },
  { kanji: '勉強する', reading: 'べんきょうする', meaning: 'to study', type: 'irregular', chapter: 3 },

  // Chapter 4
  { kanji: '会う', reading: 'あう', meaning: 'to meet', type: 'u', chapter: 4 },
  { kanji: 'ある', reading: 'ある', meaning: 'to exist (inanimate)', type: 'u', chapter: 4 },
  { kanji: '買う', reading: 'かう', meaning: 'to buy', type: 'u', chapter: 4 },
  { kanji: '書く', reading: 'かく', meaning: 'to write', type: 'u', chapter: 4 },
  { kanji: '撮る', reading: 'とる', meaning: 'to take (a photo)', type: 'u', chapter: 4 },
  { kanji: '待つ', reading: 'まつ', meaning: 'to wait', type: 'u', chapter: 4 },
  { kanji: '分かる', reading: 'わかる', meaning: 'to understand', type: 'u', chapter: 4 },
  { kanji: 'いる', reading: 'いる', meaning: 'to exist (animate)', type: 'ru', chapter: 4 },

  // Chapter 5
  { kanji: '泳ぐ', reading: 'およぐ', meaning: 'to swim', type: 'u', chapter: 5 },
  { kanji: '聞く', reading: 'きく', meaning: 'to ask', type: 'u', chapter: 5, disambig: 'ask' },
  { kanji: '乗る', reading: 'のる', meaning: 'to ride / to board', type: 'u', chapter: 5 },
  { kanji: 'やる', reading: 'やる', meaning: 'to do / to perform', type: 'u', chapter: 5 },
  { kanji: '出かける', reading: 'でかける', meaning: 'to go out', type: 'ru', chapter: 5 },

  // Chapter 6
  { kanji: '遊ぶ', reading: 'あそぶ', meaning: 'to play / to hang out', type: 'u', chapter: 6 },
  { kanji: '急ぐ', reading: 'いそぐ', meaning: 'to hurry', type: 'u', chapter: 6 },
  { kanji: '返す', reading: 'かえす', meaning: 'to return (a thing)', type: 'u', chapter: 6 },
  { kanji: '消す', reading: 'けす', meaning: 'to turn off / to erase', type: 'u', chapter: 6 },
  { kanji: '死ぬ', reading: 'しぬ', meaning: 'to die', type: 'u', chapter: 6 },
  { kanji: '座る', reading: 'すわる', meaning: 'to sit down', type: 'u', chapter: 6 },
  { kanji: '立つ', reading: 'たつ', meaning: 'to stand up', type: 'u', chapter: 6 },
  { kanji: '吸う', reading: 'すう', meaning: 'to smoke / to inhale', type: 'u', chapter: 6 },
  { kanji: '使う', reading: 'つかう', meaning: 'to use', type: 'u', chapter: 6 },
  { kanji: '手伝う', reading: 'てつだう', meaning: 'to help', type: 'u', chapter: 6 },
  { kanji: '入る', reading: 'はいる', meaning: 'to enter', type: 'u', chapter: 6 },
  { kanji: '持つ', reading: 'もつ', meaning: 'to hold / to carry', type: 'u', chapter: 6 },
  { kanji: '休む', reading: 'やすむ', meaning: 'to rest / to be absent', type: 'u', chapter: 6 },
  { kanji: '開ける', reading: 'あける', meaning: 'to open', type: 'ru', chapter: 6 },
  { kanji: '教える', reading: 'おしえる', meaning: 'to teach / to tell', type: 'ru', chapter: 6 },
  { kanji: '降りる', reading: 'おりる', meaning: 'to get off', type: 'ru', chapter: 6 },
  { kanji: '借りる', reading: 'かりる', meaning: 'to borrow', type: 'ru', chapter: 6 },
  { kanji: 'つける', reading: 'つける', meaning: 'to turn on', type: 'ru', chapter: 6 },
  { kanji: '忘れる', reading: 'わすれる', meaning: 'to forget', type: 'ru', chapter: 6 },
  { kanji: '電話をかける', reading: 'でんわをかける', meaning: 'to make a phone call', type: 'ru', chapter: 6 },
  { kanji: '連れてくる', reading: 'つれてくる', meaning: 'to bring (a person)', type: 'irregular', chapter: 6 },
  { kanji: '持ってくる', reading: 'もってくる', meaning: 'to bring (a thing)', type: 'irregular', chapter: 6 },

  // Chapter 7
  { kanji: '歌う', reading: 'うたう', meaning: 'to sing', type: 'u', chapter: 7 },
  { kanji: 'かぶる', reading: 'かぶる', meaning: 'to put on (a hat)', type: 'u', chapter: 7 },
  { kanji: '知る', reading: 'しる', meaning: 'to know', type: 'u', chapter: 7 },
  { kanji: '住む', reading: 'すむ', meaning: 'to live (in)', type: 'u', chapter: 7 },
  { kanji: 'はく', reading: 'はく', meaning: 'to put on (below waist)', type: 'u', chapter: 7 },
  { kanji: '太る', reading: 'ふとる', meaning: 'to gain weight', type: 'u', chapter: 7 },
  { kanji: 'かける', reading: 'かける', meaning: 'to put on (glasses)', type: 'ru', chapter: 7 },
  { kanji: '着る', reading: 'きる', meaning: 'to put on (above waist)', type: 'ru', chapter: 7 },
  { kanji: '勤める', reading: 'つとめる', meaning: 'to work for', type: 'ru', chapter: 7 },
  { kanji: '痩せる', reading: 'やせる', meaning: 'to lose weight', type: 'ru', chapter: 7 },
  { kanji: '結婚する', reading: 'けっこんする', meaning: 'to get married', type: 'irregular', chapter: 7 },

  // Chapter 8
  { kanji: '降る', reading: 'ふる', meaning: 'to rain / to fall', type: 'u', chapter: 8 },
  { kanji: '洗う', reading: 'あらう', meaning: 'to wash', type: 'u', chapter: 8 },
  { kanji: '言う', reading: 'いう', meaning: 'to say', type: 'u', chapter: 8 },
  { kanji: '要る', reading: 'いる', meaning: 'to need', type: 'u', chapter: 8, disambig: 'need' },
  { kanji: '遅くなる', reading: 'おそくなる', meaning: 'to become late', type: 'u', chapter: 8 },
  { kanji: '思う', reading: 'おもう', meaning: 'to think', type: 'u', chapter: 8 },
  { kanji: '切る', reading: 'きる', meaning: 'to cut', type: 'u', chapter: 8 },
  { kanji: '作る', reading: 'つくる', meaning: 'to make', type: 'u', chapter: 8 },
  { kanji: '持っていく', reading: 'もっていく', meaning: 'to take (a thing)', type: 'u', chapter: 8 },
  { kanji: '始める', reading: 'はじめる', meaning: 'to begin', type: 'ru', chapter: 8 },
  { kanji: '運転する', reading: 'うんてんする', meaning: 'to drive', type: 'irregular', chapter: 8 },
  { kanji: '洗濯する', reading: 'せんたくする', meaning: 'to do laundry', type: 'irregular', chapter: 8 },
  { kanji: '掃除する', reading: 'そうじする', meaning: 'to clean', type: 'irregular', chapter: 8 },
  { kanji: '料理する', reading: 'りょうりする', meaning: 'to cook', type: 'irregular', chapter: 8 },

  // Chapter 9
  { kanji: '踊る', reading: 'おどる', meaning: 'to dance', type: 'u', chapter: 9 },
  { kanji: '終わる', reading: 'おわる', meaning: 'to end / to finish', type: 'u', chapter: 9 },
  { kanji: '始まる', reading: 'はじまる', meaning: 'to begin (intransitive)', type: 'u', chapter: 9 },
  { kanji: '弾く', reading: 'ひく', meaning: 'to play (instrument)', type: 'u', chapter: 9 },
  { kanji: 'もらう', reading: 'もらう', meaning: 'to receive', type: 'u', chapter: 9 },
  { kanji: '覚える', reading: 'おぼえる', meaning: 'to memorize', type: 'ru', chapter: 9 },
  { kanji: '出る', reading: 'でる', meaning: 'to exit / to attend', type: 'ru', chapter: 9 },
  { kanji: '運動する', reading: 'うんどうする', meaning: 'to exercise', type: 'irregular', chapter: 9 },
  { kanji: '散歩する', reading: 'さんぽする', meaning: 'to take a walk', type: 'irregular', chapter: 9 },

  // Chapter 10
  { kanji: 'かかる', reading: 'かかる', meaning: 'to take (time/money)', type: 'u', chapter: 10 },
  { kanji: '泊まる', reading: 'とまる', meaning: 'to stay (at hotel)', type: 'u', chapter: 10 },
  { kanji: 'なる', reading: 'なる', meaning: 'to become', type: 'u', chapter: 10 },
  { kanji: '払う', reading: 'はらう', meaning: 'to pay', type: 'u', chapter: 10 },
  { kanji: '決める', reading: 'きめる', meaning: 'to decide', type: 'ru', chapter: 10 },
  { kanji: '練習する', reading: 'れんしゅうする', meaning: 'to practice', type: 'irregular', chapter: 10 },

  // Chapter 11
  { kanji: '取る', reading: 'とる', meaning: 'to take (a class)', type: 'u', chapter: 11 },
  { kanji: '習う', reading: 'ならう', meaning: 'to learn', type: 'u', chapter: 11 },
  { kanji: '登る', reading: 'のぼる', meaning: 'to climb', type: 'u', chapter: 11 },
  { kanji: '働く', reading: 'はたらく', meaning: 'to work', type: 'u', chapter: 11 },
  { kanji: '飼う', reading: 'かう', meaning: 'to own (a pet)', type: 'u', chapter: 11 },
  { kanji: 'サボる', reading: 'さぼる', meaning: 'to skip (class)', type: 'u', chapter: 11 },
  { kanji: '疲れる', reading: 'つかれる', meaning: 'to get tired', type: 'ru', chapter: 11 },
  { kanji: 'やめる', reading: 'やめる', meaning: 'to quit', type: 'ru', chapter: 11 },
  { kanji: '紹介する', reading: 'しょうかいする', meaning: 'to introduce', type: 'irregular', chapter: 11 },
  { kanji: 'ダイエットする', reading: 'だいえっとする', meaning: 'to go on a diet', type: 'irregular', chapter: 11 },
  { kanji: '遅刻する', reading: 'ちこくする', meaning: 'to be late', type: 'irregular', chapter: 11 },
  { kanji: '留学する', reading: 'りゅうがくする', meaning: 'to study abroad', type: 'irregular', chapter: 11 },

  // Chapter 12
  { kanji: '喉が渇く', reading: 'のどがかわく', meaning: 'to become thirsty', type: 'u', chapter: 12 },
  { kanji: 'なくす', reading: 'なくす', meaning: 'to lose (a thing)', type: 'u', chapter: 12 },
  { kanji: '別れる', reading: 'わかれる', meaning: 'to break up / to separate', type: 'ru', chapter: 12 },
  { kanji: '緊張する', reading: 'きんちょうする', meaning: 'to get nervous', type: 'irregular', chapter: 12 },
  { kanji: '心配する', reading: 'しんぱいする', meaning: 'to worry', type: 'irregular', chapter: 12 },

  // ===== GENKI II =====

  // Chapter 13
  { kanji: '編む', reading: 'あむ', meaning: 'to knit', type: 'u', chapter: 13 },
  { kanji: '貸す', reading: 'かす', meaning: 'to lend', type: 'u', chapter: 13 },
  { kanji: '頑張る', reading: 'がんばる', meaning: 'to do one\'s best', type: 'u', chapter: 13 },
  { kanji: '泣く', reading: 'なく', meaning: 'to cry', type: 'u', chapter: 13 },
  { kanji: '磨く', reading: 'みがく', meaning: 'to brush (teeth)', type: 'u', chapter: 13 },
  { kanji: '約束を守る', reading: 'やくそくをまもる', meaning: 'to keep a promise', type: 'u', chapter: 13 },
  { kanji: '感動する', reading: 'かんどうする', meaning: 'to be moved/touched', type: 'irregular', chapter: 13 },

  // Chapter 14
  { kanji: '送る', reading: 'おくる', meaning: 'to send', type: 'u', chapter: 14 },
  { kanji: '似合う', reading: 'にあう', meaning: 'to suit / to look good on', type: 'u', chapter: 14 },
  { kanji: '諦める', reading: 'あきらめる', meaning: 'to give up', type: 'ru', chapter: 14 },
  { kanji: 'あげる', reading: 'あげる', meaning: 'to give', type: 'ru', chapter: 14 },
  { kanji: 'くれる', reading: 'くれる', meaning: 'to give (to me)', type: 'ru', chapter: 14 },
  { kanji: 'できる', reading: 'できる', meaning: 'to be able to / to be completed', type: 'ru', chapter: 14 },
  { kanji: '相談する', reading: 'そうだんする', meaning: 'to consult', type: 'irregular', chapter: 14 },

  // Chapter 15
  { kanji: '売る', reading: 'うる', meaning: 'to sell', type: 'u', chapter: 15 },
  { kanji: '下ろす', reading: 'おろす', meaning: 'to withdraw (money)', type: 'u', chapter: 15 },
  { kanji: '描く', reading: 'えがく', meaning: 'to draw / to paint', type: 'u', chapter: 15 },
  { kanji: '探す', reading: 'さがす', meaning: 'to look for', type: 'u', chapter: 15 },
  { kanji: '誘う', reading: 'さそう', meaning: 'to invite', type: 'u', chapter: 15 },
  { kanji: 'しゃべる', reading: 'しゃべる', meaning: 'to chat', type: 'u', chapter: 15 },
  { kanji: '付き合う', reading: 'つきあう', meaning: 'to date / to go along with', type: 'u', chapter: 15 },
  { kanji: '着く', reading: 'つく', meaning: 'to arrive', type: 'u', chapter: 15 },
  { kanji: '気をつける', reading: 'きをつける', meaning: 'to be careful', type: 'ru', chapter: 15 },
  { kanji: '調べる', reading: 'しらべる', meaning: 'to look into / to investigate', type: 'ru', chapter: 15 },
  { kanji: '見える', reading: 'みえる', meaning: 'to be visible', type: 'ru', chapter: 15 },
  { kanji: '観光する', reading: 'かんこうする', meaning: 'to sightsee', type: 'irregular', chapter: 15 },
  { kanji: '卒業する', reading: 'そつぎょうする', meaning: 'to graduate', type: 'irregular', chapter: 15 },
  { kanji: '予約する', reading: 'よやくする', meaning: 'to reserve', type: 'irregular', chapter: 15 },

  // Chapter 16
  { kanji: '起こす', reading: 'おこす', meaning: 'to wake (someone) up', type: 'u', chapter: 16 },
  { kanji: 'おごる', reading: 'おごる', meaning: 'to treat (someone to a meal)', type: 'u', chapter: 16 },
  { kanji: '落ち込む', reading: 'おちこむ', meaning: 'to feel depressed', type: 'u', chapter: 16 },
  { kanji: '困る', reading: 'こまる', meaning: 'to be in trouble', type: 'u', chapter: 16 },
  { kanji: '出す', reading: 'だす', meaning: 'to take out / to submit', type: 'u', chapter: 16 },
  { kanji: '直す', reading: 'なおす', meaning: 'to fix / to correct', type: 'u', chapter: 16 },
  { kanji: '見つかる', reading: 'みつかる', meaning: 'to be found', type: 'u', chapter: 16 },
  { kanji: '訳す', reading: 'やくす', meaning: 'to translate', type: 'u', chapter: 16 },
  { kanji: '笑う', reading: 'わらう', meaning: 'to laugh', type: 'u', chapter: 16 },
  { kanji: '集める', reading: 'あつめる', meaning: 'to collect', type: 'ru', chapter: 16 },
  { kanji: '入れる', reading: 'いれる', meaning: 'to put in / to insert', type: 'ru', chapter: 16 },
  { kanji: '乗り遅れる', reading: 'のりおくれる', meaning: 'to miss (a ride)', type: 'ru', chapter: 16 },
  { kanji: '見せる', reading: 'みせる', meaning: 'to show', type: 'ru', chapter: 16 },
  { kanji: '朝寝坊する', reading: 'あさねぼうする', meaning: 'to oversleep', type: 'irregular', chapter: 16 },
  { kanji: '案内する', reading: 'あんないする', meaning: 'to guide / to show around', type: 'irregular', chapter: 16 },
  { kanji: '説明する', reading: 'せつめいする', meaning: 'to explain', type: 'irregular', chapter: 16 },

  // Chapter 17
  { kanji: '選ぶ', reading: 'えらぶ', meaning: 'to choose', type: 'u', chapter: 17 },
  { kanji: '込む', reading: 'こむ', meaning: 'to get crowded', type: 'u', chapter: 17 },
  { kanji: '脱ぐ', reading: 'ぬぐ', meaning: 'to take off (clothes)', type: 'u', chapter: 17 },
  { kanji: '生まれる', reading: 'うまれる', meaning: 'to be born', type: 'ru', chapter: 17 },
  { kanji: '足りる', reading: 'たりる', meaning: 'to be sufficient', type: 'ru', chapter: 17 },
  { kanji: '慣れる', reading: 'なれる', meaning: 'to get used to', type: 'ru', chapter: 17 },
  { kanji: '化粧する', reading: 'けしょうする', meaning: 'to put on makeup', type: 'irregular', chapter: 17 },
  { kanji: '就職する', reading: 'しゅうしょくする', meaning: 'to get a job', type: 'irregular', chapter: 17 },
  { kanji: '離婚する', reading: 'りこんする', meaning: 'to get divorced', type: 'irregular', chapter: 17 },

  // Chapter 18
  { kanji: '開く', reading: 'あく', meaning: 'to open (intransitive)', type: 'u', chapter: 18 },
  { kanji: '謝る', reading: 'あやまる', meaning: 'to apologize', type: 'u', chapter: 18 },
  { kanji: '押す', reading: 'おす', meaning: 'to push / to press', type: 'u', chapter: 18 },
  { kanji: '落とす', reading: 'おとす', meaning: 'to drop', type: 'u', chapter: 18 },
  { kanji: '転ぶ', reading: 'ころぶ', meaning: 'to fall down', type: 'u', chapter: 18 },
  { kanji: '壊す', reading: 'こわす', meaning: 'to break (transitive)', type: 'u', chapter: 18 },
  { kanji: '咲く', reading: 'さく', meaning: 'to bloom', type: 'u', chapter: 18 },
  { kanji: '閉まる', reading: 'しまる', meaning: 'to close (intransitive)', type: 'u', chapter: 18 },
  { kanji: '汚す', reading: 'よごす', meaning: 'to make dirty', type: 'u', chapter: 18 },
  { kanji: '落ちる', reading: 'おちる', meaning: 'to fall', type: 'ru', chapter: 18 },
  { kanji: '片付ける', reading: 'かたづける', meaning: 'to tidy up', type: 'ru', chapter: 18 },
  { kanji: '考える', reading: 'かんがえる', meaning: 'to think (about)', type: 'ru', chapter: 18 },
  { kanji: '消える', reading: 'きえる', meaning: 'to disappear / to go out', type: 'ru', chapter: 18 },
  { kanji: '壊れる', reading: 'こわれる', meaning: 'to break (intransitive)', type: 'ru', chapter: 18 },
  { kanji: '汚れる', reading: 'よごれる', meaning: 'to become dirty', type: 'ru', chapter: 18 },
  { kanji: '注文する', reading: 'ちゅうもんする', meaning: 'to order', type: 'irregular', chapter: 18 },

  // Chapter 19
  { kanji: 'いらっしゃる', reading: 'いらっしゃる', meaning: 'to be (honorific)', type: 'u', chapter: 19 },
  { kanji: '怒る', reading: 'おこる', meaning: 'to get angry', type: 'u', chapter: 19 },
  { kanji: 'おっしゃる', reading: 'おっしゃる', meaning: 'to say (honorific)', type: 'u', chapter: 19 },
  { kanji: '決まる', reading: 'きまる', meaning: 'to be decided', type: 'u', chapter: 19 },
  { kanji: '下さる', reading: 'くださる', meaning: 'to give (honorific)', type: 'u', chapter: 19 },
  { kanji: 'ご覧になる', reading: 'ごらんになる', meaning: 'to see (honorific)', type: 'u', chapter: 19 },
  { kanji: '引っ越す', reading: 'ひっこす', meaning: 'to move (house)', type: 'u', chapter: 19 },
  { kanji: '召し上がる', reading: 'めしあがる', meaning: 'to eat/drink (honorific)', type: 'u', chapter: 19 },
  { kanji: '呼ぶ', reading: 'よぶ', meaning: 'to call / to invite', type: 'u', chapter: 19 },
  { kanji: '寄る', reading: 'よる', meaning: 'to stop by', type: 'u', chapter: 19 },
  { kanji: '遅れる', reading: 'おくれる', meaning: 'to be late', type: 'ru', chapter: 19 },
  { kanji: '晴れる', reading: 'はれる', meaning: 'to clear up (weather)', type: 'ru', chapter: 19 },
  { kanji: 'もてる', reading: 'もてる', meaning: 'to be popular', type: 'ru', chapter: 19 },
  { kanji: '招待する', reading: 'しょうたいする', meaning: 'to invite', type: 'irregular', chapter: 19 },
  { kanji: '注意する', reading: 'ちゅういする', meaning: 'to watch out / to warn', type: 'irregular', chapter: 19 },

  // Chapter 20
  { kanji: '致す', reading: 'いたす', meaning: 'to do (humble)', type: 'u', chapter: 20 },
  { kanji: '頂く', reading: 'いただく', meaning: 'to receive (humble)', type: 'u', chapter: 20 },
  { kanji: '伺う', reading: 'うかがう', meaning: 'to visit / to ask (humble)', type: 'u', chapter: 20 },
  { kanji: 'おる', reading: 'おる', meaning: 'to be (humble)', type: 'u', chapter: 20 },
  { kanji: '参る', reading: 'まいる', meaning: 'to go / to come (humble)', type: 'u', chapter: 20 },
  { kanji: '曲がる', reading: 'まがる', meaning: 'to turn (direction)', type: 'u', chapter: 20 },
  { kanji: '申す', reading: 'もうす', meaning: 'to say (humble)', type: 'u', chapter: 20 },
  { kanji: '戻る', reading: 'もどる', meaning: 'to return', type: 'u', chapter: 20 },
  { kanji: '聞こえる', reading: 'きこえる', meaning: 'to be audible', type: 'ru', chapter: 20 },
  { kanji: '差し上げる', reading: 'さしあげる', meaning: 'to give (humble)', type: 'ru', chapter: 20 },
  { kanji: '伝える', reading: 'つたえる', meaning: 'to convey / to tell', type: 'ru', chapter: 20 },
  { kanji: '交換する', reading: 'こうかんする', meaning: 'to exchange', type: 'irregular', chapter: 20 },
  { kanji: '生活する', reading: 'せいかつする', meaning: 'to live (a life)', type: 'irregular', chapter: 20 },

  // Chapter 21
  { kanji: '置く', reading: 'おく', meaning: 'to put / to place', type: 'u', chapter: 21 },
  { kanji: '触る', reading: 'さわる', meaning: 'to touch', type: 'u', chapter: 21 },
  { kanji: '捕まる', reading: 'つかまる', meaning: 'to be caught', type: 'u', chapter: 21 },
  { kanji: '包む', reading: 'つつむ', meaning: 'to wrap', type: 'u', chapter: 21 },
  { kanji: '殴る', reading: 'なぐる', meaning: 'to hit / to punch', type: 'u', chapter: 21 },
  { kanji: '盗む', reading: 'ぬすむ', meaning: 'to steal', type: 'u', chapter: 21 },
  { kanji: '貼る', reading: 'はる', meaning: 'to paste / to stick', type: 'u', chapter: 21 },
  { kanji: '踏む', reading: 'ふむ', meaning: 'to step on', type: 'u', chapter: 21 },
  { kanji: '焼く', reading: 'やく', meaning: 'to bake / to grill', type: 'u', chapter: 21 },
  { kanji: 'いじめる', reading: 'いじめる', meaning: 'to bully', type: 'ru', chapter: 21 },
  { kanji: '着替える', reading: 'きがえる', meaning: 'to change clothes', type: 'ru', chapter: 21 },
  { kanji: 'ためる', reading: 'ためる', meaning: 'to save (money)', type: 'ru', chapter: 21 },
  { kanji: '続ける', reading: 'つづける', meaning: 'to continue', type: 'ru', chapter: 21 },
  { kanji: '褒める', reading: 'ほめる', meaning: 'to praise', type: 'ru', chapter: 21 },
  { kanji: '間違える', reading: 'まちがえる', meaning: 'to make a mistake', type: 'ru', chapter: 21 },
  { kanji: '見つける', reading: 'みつける', meaning: 'to find', type: 'ru', chapter: 21 },
  { kanji: '連絡する', reading: 'れんらくする', meaning: 'to contact', type: 'irregular', chapter: 21 },

  // Chapter 22
  { kanji: '勝つ', reading: 'かつ', meaning: 'to win', type: 'u', chapter: 22 },
  { kanji: '運ぶ', reading: 'はこぶ', meaning: 'to carry / to transport', type: 'u', chapter: 22 },
  { kanji: '走る', reading: 'はしる', meaning: 'to run', type: 'u', chapter: 22 },
  { kanji: '拾う', reading: 'ひろう', meaning: 'to pick up', type: 'u', chapter: 22 },
  { kanji: '間に合う', reading: 'まにあう', meaning: 'to be on time', type: 'u', chapter: 22 },
  { kanji: '育てる', reading: 'そだてる', meaning: 'to raise / to bring up', type: 'ru', chapter: 22 },
  { kanji: '助ける', reading: 'たすける', meaning: 'to rescue / to help', type: 'ru', chapter: 22 },
  { kanji: '負ける', reading: 'まける', meaning: 'to lose', type: 'ru', chapter: 22 },
  { kanji: '賛成する', reading: 'さんせいする', meaning: 'to agree', type: 'irregular', chapter: 22 },
  { kanji: '反対する', reading: 'はんたいする', meaning: 'to oppose', type: 'irregular', chapter: 22 },
  { kanji: '翻訳する', reading: 'ほんやくする', meaning: 'to translate', type: 'irregular', chapter: 22 },

  // Chapter 23
  { kanji: '受ける', reading: 'うける', meaning: 'to take (an exam)', type: 'ru', chapter: 23 },
  { kanji: '答える', reading: 'こたえる', meaning: 'to answer', type: 'ru', chapter: 23 },
  { kanji: '離れる', reading: 'はなれる', meaning: 'to be separated', type: 'ru', chapter: 23 },
  { kanji: '我慢する', reading: 'がまんする', meaning: 'to endure / to be patient', type: 'irregular', chapter: 23 },
  { kanji: '優勝する', reading: 'ゆうしょうする', meaning: 'to win a championship', type: 'irregular', chapter: 23 },
];

const CHAPTER_INFO = {
  3:  { title: 'Ch 3: First Verbs', book: 'Genki I', newForms: ['masu', 'masu-neg'] },
  4:  { title: 'Ch 4: Past Tense', book: 'Genki I', newForms: ['masu-past', 'masu-past-neg'] },
  5:  { title: 'Ch 5: More Verbs', book: 'Genki I', newForms: [] },
  6:  { title: 'Ch 6: Te-form', book: 'Genki I', newForms: ['te'] },
  7:  { title: 'Ch 7: Describing People', book: 'Genki I', newForms: [] },
  8:  { title: 'Ch 8: Short Forms', book: 'Genki I', newForms: ['nai', 'dict'] },
  9:  { title: 'Ch 9: Past Short Forms', book: 'Genki I', newForms: ['ta', 'nakatta'] },
  10: { title: 'Ch 10: Comparison', book: 'Genki I', newForms: [] },
  11: { title: 'Ch 11: Wanting', book: 'Genki I', newForms: ['tai'] },
  12: { title: 'Ch 12: Advanced Polite', book: 'Genki I', newForms: [] },
  13: { title: 'Ch 13: Potential', book: 'Genki II', newForms: ['potential'] },
  14: { title: 'Ch 14: Giving & Receiving', book: 'Genki II', newForms: [] },
  15: { title: 'Ch 15: Volitional', book: 'Genki II', newForms: ['volitional'] },
  16: { title: 'Ch 16: Requests & Giving', book: 'Genki II', newForms: [] },
  17: { title: 'Ch 17: Conditionals I', book: 'Genki II', newForms: [] },
  18: { title: 'Ch 18: Transitivity', book: 'Genki II', newForms: [] },
  19: { title: 'Ch 19: Honorific', book: 'Genki II', newForms: [] },
  20: { title: 'Ch 20: Humble', book: 'Genki II', newForms: [] },
  21: { title: 'Ch 21: Passive', book: 'Genki II', newForms: ['passive'] },
  22: { title: 'Ch 22: Causative', book: 'Genki II', newForms: ['causative', 'ba'] },
  23: { title: 'Ch 23: Causative-Passive', book: 'Genki II', newForms: ['causative-passive'] },
};

const GENKI_ADJECTIVES = [
  // ===== GENKI I =====

  // Chapter 5 — い adjectives
  { kanji: 'おもしろい', reading: 'おもしろい', meaning: 'interesting / funny', type: 'i-adj', chapter: 5 },
  { kanji: 'おいしい', reading: 'おいしい', meaning: 'delicious', type: 'i-adj', chapter: 5 },
  { kanji: '楽しい', reading: 'たのしい', meaning: 'fun', type: 'i-adj', chapter: 5 },
  { kanji: '安い', reading: 'やすい', meaning: 'cheap / inexpensive', type: 'i-adj', chapter: 5 },
  { kanji: '怖い', reading: 'こわい', meaning: 'scary', type: 'i-adj', chapter: 5 },
  { kanji: '寒い', reading: 'さむい', meaning: 'cold (weather)', type: 'i-adj', chapter: 5 },
  { kanji: '暑い', reading: 'あつい', meaning: 'hot (weather)', type: 'i-adj', chapter: 5 },
  { kanji: '忙しい', reading: 'いそがしい', meaning: 'busy', type: 'i-adj', chapter: 5 },
  { kanji: '高い', reading: 'たかい', meaning: 'expensive / tall', type: 'i-adj', chapter: 5 },
  { kanji: '大きい', reading: 'おおきい', meaning: 'big / large', type: 'i-adj', chapter: 5 },
  { kanji: '小さい', reading: 'ちいさい', meaning: 'small', type: 'i-adj', chapter: 5 },
  { kanji: '新しい', reading: 'あたらしい', meaning: 'new', type: 'i-adj', chapter: 5 },
  { kanji: '古い', reading: 'ふるい', meaning: 'old (things)', type: 'i-adj', chapter: 5 },
  { kanji: 'いい', reading: 'いい', meaning: 'good', type: 'i-adj', chapter: 5 },
  { kanji: '難しい', reading: 'むずかしい', meaning: 'difficult', type: 'i-adj', chapter: 5 },
  { kanji: 'かっこいい', reading: 'かっこいい', meaning: 'cool / good-looking', type: 'i-adj', chapter: 5 },
  { kanji: 'つまらない', reading: 'つまらない', meaning: 'boring', type: 'i-adj', chapter: 5 },

  // Chapter 5 — な adjectives
  { kanji: 'きれい', reading: 'きれい', meaning: 'beautiful / clean', type: 'na-adj', chapter: 5 },
  { kanji: '元気', reading: 'げんき', meaning: 'healthy / energetic', type: 'na-adj', chapter: 5 },
  { kanji: '静か', reading: 'しずか', meaning: 'quiet', type: 'na-adj', chapter: 5 },
  { kanji: 'にぎやか', reading: 'にぎやか', meaning: 'lively', type: 'na-adj', chapter: 5 },
  { kanji: '好き', reading: 'すき', meaning: 'liked / favorite', type: 'na-adj', chapter: 5 },
  { kanji: '嫌い', reading: 'きらい', meaning: 'disliked', type: 'na-adj', chapter: 5 },
  { kanji: '暇', reading: 'ひま', meaning: 'free (not busy)', type: 'na-adj', chapter: 5 },
  { kanji: 'ハンサム', reading: 'はんさむ', meaning: 'handsome', type: 'na-adj', chapter: 5 },

  // Chapter 7
  { kanji: '長い', reading: 'ながい', meaning: 'long', type: 'i-adj', chapter: 7 },
  { kanji: '短い', reading: 'みじかい', meaning: 'short (length)', type: 'i-adj', chapter: 7 },
  { kanji: '速い', reading: 'はやい', meaning: 'fast / early', type: 'i-adj', chapter: 7 },

  // Chapter 8
  { kanji: '近い', reading: 'ちかい', meaning: 'near / close', type: 'i-adj', chapter: 8 },
  { kanji: '遠い', reading: 'とおい', meaning: 'far', type: 'i-adj', chapter: 8 },
  { kanji: '多い', reading: 'おおい', meaning: 'many / a lot', type: 'i-adj', chapter: 8 },
  { kanji: '少ない', reading: 'すくない', meaning: 'few / a little', type: 'i-adj', chapter: 8 },

  // Chapter 9
  { kanji: '広い', reading: 'ひろい', meaning: 'spacious / wide', type: 'i-adj', chapter: 9 },
  { kanji: '狭い', reading: 'せまい', meaning: 'narrow / cramped', type: 'i-adj', chapter: 9 },
  { kanji: '悪い', reading: 'わるい', meaning: 'bad', type: 'i-adj', chapter: 9 },
  { kanji: '優しい', reading: 'やさしい', meaning: 'kind / gentle', type: 'i-adj', chapter: 9 },
  { kanji: '有名', reading: 'ゆうめい', meaning: 'famous', type: 'na-adj', chapter: 9 },
  { kanji: '便利', reading: 'べんり', meaning: 'convenient', type: 'na-adj', chapter: 9 },

  // Chapter 10
  { kanji: '暖かい', reading: 'あたたかい', meaning: 'warm', type: 'i-adj', chapter: 10 },
  { kanji: '涼しい', reading: 'すずしい', meaning: 'cool (weather)', type: 'i-adj', chapter: 10 },
  { kanji: '甘い', reading: 'あまい', meaning: 'sweet', type: 'i-adj', chapter: 10 },
  { kanji: '辛い', reading: 'からい', meaning: 'spicy', type: 'i-adj', chapter: 10 },
  { kanji: '簡単', reading: 'かんたん', meaning: 'easy / simple', type: 'na-adj', chapter: 10 },

  // Chapter 12
  { kanji: '嬉しい', reading: 'うれしい', meaning: 'happy / glad', type: 'i-adj', chapter: 12 },
  { kanji: '悲しい', reading: 'かなしい', meaning: 'sad', type: 'i-adj', chapter: 12 },
  { kanji: '痛い', reading: 'いたい', meaning: 'painful', type: 'i-adj', chapter: 12 },

  // ===== GENKI II =====

  // Chapter 13
  { kanji: '厳しい', reading: 'きびしい', meaning: 'strict', type: 'i-adj', chapter: 13 },
  { kanji: '素敵', reading: 'すてき', meaning: 'lovely / wonderful', type: 'na-adj', chapter: 13 },

  // Chapter 15
  { kanji: '汚い', reading: 'きたない', meaning: 'dirty', type: 'i-adj', chapter: 15 },
  { kanji: '危ない', reading: 'あぶない', meaning: 'dangerous', type: 'i-adj', chapter: 15 },
  { kanji: '丈夫', reading: 'じょうぶ', meaning: 'sturdy / durable', type: 'na-adj', chapter: 15 },

  // Chapter 17
  { kanji: '珍しい', reading: 'めずらしい', meaning: 'rare / unusual', type: 'i-adj', chapter: 17 },
  { kanji: '正直', reading: 'しょうじき', meaning: 'honest', type: 'na-adj', chapter: 17 },

  // Chapter 18
  { kanji: '明るい', reading: 'あかるい', meaning: 'bright / cheerful', type: 'i-adj', chapter: 18 },
  { kanji: '暗い', reading: 'くらい', meaning: 'dark', type: 'i-adj', chapter: 18 },

  // Chapter 20
  { kanji: '強い', reading: 'つよい', meaning: 'strong', type: 'i-adj', chapter: 20 },
  { kanji: '弱い', reading: 'よわい', meaning: 'weak', type: 'i-adj', chapter: 20 },

  // Chapter 22
  { kanji: '正しい', reading: 'ただしい', meaning: 'correct / right', type: 'i-adj', chapter: 22 },
  { kanji: '幸せ', reading: 'しあわせ', meaning: 'happy', type: 'na-adj', chapter: 22 },
];

const ADJ_CHAPTER_INFO = {
  5:  { title: 'Ch 5: Adjectives', book: 'Genki I', newForms: ['adj-present', 'adj-neg'] },
  7:  { title: 'Ch 7: More Adjectives', book: 'Genki I', newForms: [] },
  8:  { title: 'Ch 8: Quantity', book: 'Genki I', newForms: [] },
  9:  { title: 'Ch 9: Past Adjectives', book: 'Genki I', newForms: ['adj-past', 'adj-past-neg', 'adj-te'] },
  10: { title: 'Ch 10: Comparison', book: 'Genki I', newForms: ['adj-adverb'] },
  12: { title: 'Ch 12: Feelings', book: 'Genki I', newForms: [] },
  13: { title: 'Ch 13: Description', book: 'Genki II', newForms: [] },
  15: { title: 'Ch 15: Safety', book: 'Genki II', newForms: [] },
  17: { title: 'Ch 17: Traits', book: 'Genki II', newForms: [] },
  18: { title: 'Ch 18: Light & Dark', book: 'Genki II', newForms: [] },
  20: { title: 'Ch 20: Strength', book: 'Genki II', newForms: [] },
  22: { title: 'Ch 22: Values', book: 'Genki II', newForms: [] },
};

function getAdjectivesByChapter(chapter) {
  return GENKI_ADJECTIVES.filter(a => a.chapter === chapter);
}

function getAllAdjChapters() {
  return Object.keys(ADJ_CHAPTER_INFO).map(Number).sort((a, b) => a - b);
}

function getVerbsByChapter(chapter) {
  return GENKI_VERBS.filter(v => v.chapter === chapter);
}

function getAllChapters() {
  return Object.keys(CHAPTER_INFO).map(Number).sort((a, b) => a - b);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GENKI_VERBS, CHAPTER_INFO, getVerbsByChapter, getAllChapters, GENKI_ADJECTIVES, ADJ_CHAPTER_INFO, getAdjectivesByChapter, getAllAdjChapters };
}
