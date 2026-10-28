const ALL_VERBS = [
  // n5-basics
  { kanji: '行く', reading: 'いく', meaning: 'to go', type: 'u', group: 'n5-basics', chapter: 3 },
  { kanji: '帰る', reading: 'かえる', meaning: 'to return (home)', type: 'u', group: 'n5-basics', chapter: 3 },
  { kanji: '見る', reading: 'みる', meaning: 'to see / to watch', type: 'ru', group: 'n5-basics', chapter: 3 },
  { kanji: '来る', reading: 'くる', meaning: 'to come', type: 'irregular', group: 'n5-basics', chapter: 3 },
  { kanji: 'する', reading: 'する', meaning: 'to do', type: 'irregular', group: 'n5-basics', chapter: 3 },
  { kanji: '会う', reading: 'あう', meaning: 'to meet', type: 'u', group: 'n5-basics', chapter: 4 },
  { kanji: 'ある', reading: 'ある', meaning: 'to exist (inanimate)', type: 'u', group: 'n5-basics', chapter: 4 },
  { kanji: '待つ', reading: 'まつ', meaning: 'to wait', type: 'u', group: 'n5-basics', chapter: 4 },
  { kanji: '分かる', reading: 'わかる', meaning: 'to understand', type: 'u', group: 'n5-basics', chapter: 4 },
  { kanji: 'いる', reading: 'いる', meaning: 'to exist (animate)', type: 'ru', group: 'n5-basics', chapter: 4 },
  { kanji: 'やる', reading: 'やる', meaning: 'to do / to perform', type: 'u', group: 'n5-basics', chapter: 5 },
  { kanji: '座る', reading: 'すわる', meaning: 'to sit down', type: 'u', group: 'n5-basics', chapter: 6 },
  { kanji: '立つ', reading: 'たつ', meaning: 'to stand up', type: 'u', group: 'n5-basics', chapter: 6 },
  { kanji: '知る', reading: 'しる', meaning: 'to know', type: 'u', group: 'n5-basics', chapter: 7 },
  { kanji: '住む', reading: 'すむ', meaning: 'to live (in)', type: 'u', group: 'n5-basics', chapter: 7 },
  { kanji: '要る', reading: 'いる', meaning: 'to need', type: 'u', group: 'n5-basics', chapter: 8, disambig: 'need' },
  { kanji: 'なる', reading: 'なる', meaning: 'to become', type: 'u', group: 'n5-basics', chapter: 10 },
  { kanji: 'できる', reading: 'できる', meaning: 'to be able to / to be completed', type: 'ru', group: 'n5-basics', chapter: 14 },

  // n5-routine
  { kanji: '飲む', reading: 'のむ', meaning: 'to drink', type: 'u', group: 'n5-routine', chapter: 3 },
  { kanji: '起きる', reading: 'おきる', meaning: 'to get up / to wake up', type: 'ru', group: 'n5-routine', chapter: 3 },
  { kanji: '食べる', reading: 'たべる', meaning: 'to eat', type: 'ru', group: 'n5-routine', chapter: 3 },
  { kanji: '寝る', reading: 'ねる', meaning: 'to sleep / to go to bed', type: 'ru', group: 'n5-routine', chapter: 3 },
  { kanji: '吸う', reading: 'すう', meaning: 'to smoke / to inhale', type: 'u', group: 'n5-routine', chapter: 6 },
  { kanji: '休む', reading: 'やすむ', meaning: 'to rest / to be absent', type: 'u', group: 'n5-routine', chapter: 6 },
  { kanji: '勤める', reading: 'つとめる', meaning: 'to work for', type: 'ru', group: 'n5-routine', chapter: 7 },
  { kanji: '洗う', reading: 'あらう', meaning: 'to wash', type: 'u', group: 'n5-routine', chapter: 8 },
  { kanji: '作る', reading: 'つくる', meaning: 'to make', type: 'u', group: 'n5-routine', chapter: 8 },
  { kanji: '洗濯する', reading: 'せんたくする', meaning: 'to do laundry', type: 'irregular', group: 'n5-routine', chapter: 8 },
  { kanji: '掃除する', reading: 'そうじする', meaning: 'to clean', type: 'irregular', group: 'n5-routine', chapter: 8 },
  { kanji: '料理する', reading: 'りょうりする', meaning: 'to cook', type: 'irregular', group: 'n5-routine', chapter: 8 },
  { kanji: '散歩する', reading: 'さんぽする', meaning: 'to take a walk', type: 'irregular', group: 'n5-routine', chapter: 9 },
  { kanji: '働く', reading: 'はたらく', meaning: 'to work', type: 'u', group: 'n5-routine', chapter: 11 },
  { kanji: '疲れる', reading: 'つかれる', meaning: 'to get tired', type: 'ru', group: 'n5-routine', chapter: 11 },
  { kanji: '磨く', reading: 'みがく', meaning: 'to brush (teeth)', type: 'u', group: 'n5-routine', chapter: 13 },

  // n5-study
  { kanji: '聞く', reading: 'きく', meaning: 'to listen / to hear', type: 'u', group: 'n5-study', chapter: 3 },
  { kanji: '話す', reading: 'はなす', meaning: 'to speak / to talk', type: 'u', group: 'n5-study', chapter: 3 },
  { kanji: '読む', reading: 'よむ', meaning: 'to read', type: 'u', group: 'n5-study', chapter: 3 },
  { kanji: '勉強する', reading: 'べんきょうする', meaning: 'to study', type: 'irregular', group: 'n5-study', chapter: 3 },
  { kanji: '書く', reading: 'かく', meaning: 'to write', type: 'u', group: 'n5-study', chapter: 4 },
  { kanji: '聞く', reading: 'きく', meaning: 'to ask', type: 'u', group: 'n5-study', chapter: 5, disambig: 'ask' },
  { kanji: '教える', reading: 'おしえる', meaning: 'to teach / to tell', type: 'ru', group: 'n5-study', chapter: 6 },
  { kanji: '忘れる', reading: 'わすれる', meaning: 'to forget', type: 'ru', group: 'n5-study', chapter: 6 },
  { kanji: '電話をかける', reading: 'でんわをかける', meaning: 'to make a phone call', type: 'ru', group: 'n5-study', chapter: 6 },
  { kanji: '言う', reading: 'いう', meaning: 'to say', type: 'u', group: 'n5-study', chapter: 8 },
  { kanji: '覚える', reading: 'おぼえる', meaning: 'to memorize', type: 'ru', group: 'n5-study', chapter: 9 },
  { kanji: '練習する', reading: 'れんしゅうする', meaning: 'to practice', type: 'irregular', group: 'n5-study', chapter: 10 },
  { kanji: '取る', reading: 'とる', meaning: 'to take (a class)', type: 'u', group: 'n5-study', chapter: 11, disambig: 'class' },
  { kanji: '習う', reading: 'ならう', meaning: 'to learn', type: 'u', group: 'n5-study', chapter: 11 },
  { kanji: '呼ぶ', reading: 'よぶ', meaning: 'to call / to invite', type: 'u', group: 'n5-study', chapter: 19 },
  { kanji: '答える', reading: 'こたえる', meaning: 'to answer', type: 'ru', group: 'n5-study', chapter: 23 },

  // n5-going
  { kanji: '泳ぐ', reading: 'およぐ', meaning: 'to swim', type: 'u', group: 'n5-going', chapter: 5 },
  { kanji: '乗る', reading: 'のる', meaning: 'to ride / to board', type: 'u', group: 'n5-going', chapter: 5 },
  { kanji: '出かける', reading: 'でかける', meaning: 'to go out', type: 'ru', group: 'n5-going', chapter: 5 },
  { kanji: '遊ぶ', reading: 'あそぶ', meaning: 'to play / to hang out', type: 'u', group: 'n5-going', chapter: 6 },
  { kanji: '入る', reading: 'はいる', meaning: 'to enter', type: 'u', group: 'n5-going', chapter: 6 },
  { kanji: '降りる', reading: 'おりる', meaning: 'to get off', type: 'ru', group: 'n5-going', chapter: 6 },
  { kanji: '連れてくる', reading: 'つれてくる', meaning: 'to bring (a person)', type: 'irregular', group: 'n5-going', chapter: 6 },
  { kanji: '持ってくる', reading: 'もってくる', meaning: 'to bring (a thing)', type: 'irregular', group: 'n5-going', chapter: 6 },
  { kanji: '遅くなる', reading: 'おそくなる', meaning: 'to become late', type: 'u', group: 'n5-going', chapter: 8 },
  { kanji: '持っていく', reading: 'もっていく', meaning: 'to take (a thing)', type: 'u', group: 'n5-going', chapter: 8 },
  { kanji: '出る', reading: 'でる', meaning: 'to exit / to attend', type: 'ru', group: 'n5-going', chapter: 9 },
  { kanji: '登る', reading: 'のぼる', meaning: 'to climb', type: 'u', group: 'n5-going', chapter: 11 },
  { kanji: '着く', reading: 'つく', meaning: 'to arrive', type: 'u', group: 'n5-going', chapter: 15 },
  { kanji: '曲がる', reading: 'まがる', meaning: 'to turn (direction)', type: 'u', group: 'n5-going', chapter: 20 },
  { kanji: '走る', reading: 'はしる', meaning: 'to run', type: 'u', group: 'n5-going', chapter: 22 },

  // n5-things
  { kanji: '買う', reading: 'かう', meaning: 'to buy', type: 'u', group: 'n5-things', chapter: 4, disambig: 'buy' },
  { kanji: '撮る', reading: 'とる', meaning: 'to take (a photo)', type: 'u', group: 'n5-things', chapter: 4, disambig: 'photo' },
  { kanji: '返す', reading: 'かえす', meaning: 'to return (a thing)', type: 'u', group: 'n5-things', chapter: 6 },
  { kanji: '使う', reading: 'つかう', meaning: 'to use', type: 'u', group: 'n5-things', chapter: 6 },
  { kanji: '持つ', reading: 'もつ', meaning: 'to hold / to carry', type: 'u', group: 'n5-things', chapter: 6 },
  { kanji: '借りる', reading: 'かりる', meaning: 'to borrow', type: 'ru', group: 'n5-things', chapter: 6 },
  { kanji: '切る', reading: 'きる', meaning: 'to cut', type: 'u', group: 'n5-things', chapter: 8, disambig: 'cut' },
  { kanji: 'かかる', reading: 'かかる', meaning: 'to take (time/money)', type: 'u', group: 'n5-things', chapter: 10 },
  { kanji: 'なくす', reading: 'なくす', meaning: 'to lose (a thing)', type: 'u', group: 'n5-things', chapter: 12 },
  { kanji: '貸す', reading: 'かす', meaning: 'to lend', type: 'u', group: 'n5-things', chapter: 13 },
  { kanji: 'あげる', reading: 'あげる', meaning: 'to give', type: 'ru', group: 'n5-things', chapter: 14 },
  { kanji: '売る', reading: 'うる', meaning: 'to sell', type: 'u', group: 'n5-things', chapter: 15 },
  { kanji: '出す', reading: 'だす', meaning: 'to take out / to submit', type: 'u', group: 'n5-things', chapter: 16 },
  { kanji: '入れる', reading: 'いれる', meaning: 'to put in / to insert', type: 'ru', group: 'n5-things', chapter: 16 },
  { kanji: '見せる', reading: 'みせる', meaning: 'to show', type: 'ru', group: 'n5-things', chapter: 16 },
  { kanji: '置く', reading: 'おく', meaning: 'to put / to place', type: 'u', group: 'n5-things', chapter: 21 },
  { kanji: '貼る', reading: 'はる', meaning: 'to paste / to stick', type: 'u', group: 'n5-things', chapter: 21 },

  // n5-around
  { kanji: '消す', reading: 'けす', meaning: 'to turn off / to erase', type: 'u', group: 'n5-around', chapter: 6 },
  { kanji: '開ける', reading: 'あける', meaning: 'to open', type: 'ru', group: 'n5-around', chapter: 6 },
  { kanji: 'つける', reading: 'つける', meaning: 'to turn on', type: 'ru', group: 'n5-around', chapter: 6 },
  { kanji: '降る', reading: 'ふる', meaning: 'to rain / to fall', type: 'u', group: 'n5-around', chapter: 8 },
  { kanji: '終わる', reading: 'おわる', meaning: 'to end / to finish', type: 'u', group: 'n5-around', chapter: 9 },
  { kanji: '始まる', reading: 'はじまる', meaning: 'to begin (intransitive)', type: 'u', group: 'n5-around', chapter: 9 },
  { kanji: '開く', reading: 'あく', meaning: 'to open (intransitive)', type: 'u', group: 'n5-around', chapter: 18 },
  { kanji: '押す', reading: 'おす', meaning: 'to push / to press', type: 'u', group: 'n5-around', chapter: 18 },
  { kanji: '咲く', reading: 'さく', meaning: 'to bloom', type: 'u', group: 'n5-around', chapter: 18 },
  { kanji: '閉まる', reading: 'しまる', meaning: 'to close (intransitive)', type: 'u', group: 'n5-around', chapter: 18 },
  { kanji: '消える', reading: 'きえる', meaning: 'to disappear / to go out', type: 'ru', group: 'n5-around', chapter: 18 },
  { kanji: '晴れる', reading: 'はれる', meaning: 'to clear up (weather)', type: 'ru', group: 'n5-around', chapter: 19 },

  // n5-life
  { kanji: '死ぬ', reading: 'しぬ', meaning: 'to die', type: 'u', group: 'n5-life', chapter: 6 },
  { kanji: '歌う', reading: 'うたう', meaning: 'to sing', type: 'u', group: 'n5-life', chapter: 7 },
  { kanji: 'かぶる', reading: 'かぶる', meaning: 'to put on (a hat)', type: 'u', group: 'n5-life', chapter: 7 },
  { kanji: 'はく', reading: 'はく', meaning: 'to put on (below waist)', type: 'u', group: 'n5-life', chapter: 7 },
  { kanji: 'かける', reading: 'かける', meaning: 'to put on (glasses)', type: 'ru', group: 'n5-life', chapter: 7 },
  { kanji: '着る', reading: 'きる', meaning: 'to put on (above waist)', type: 'ru', group: 'n5-life', chapter: 7, disambig: 'wear' },
  { kanji: '結婚する', reading: 'けっこんする', meaning: 'to get married', type: 'irregular', group: 'n5-life', chapter: 7 },
  { kanji: '弾く', reading: 'ひく', meaning: 'to play (instrument)', type: 'u', group: 'n5-life', chapter: 9 },
  { kanji: '困る', reading: 'こまる', meaning: 'to be in trouble', type: 'u', group: 'n5-life', chapter: 16 },
  { kanji: '脱ぐ', reading: 'ぬぐ', meaning: 'to take off (clothes)', type: 'u', group: 'n5-life', chapter: 17 },
  { kanji: '生まれる', reading: 'うまれる', meaning: 'to be born', type: 'ru', group: 'n5-life', chapter: 17 },

  // n4-keigo
  { kanji: 'いらっしゃる', reading: 'いらっしゃる', meaning: 'to be (honorific)', type: 'u', group: 'n4-keigo', chapter: 19 },
  { kanji: 'おっしゃる', reading: 'おっしゃる', meaning: 'to say (honorific)', type: 'u', group: 'n4-keigo', chapter: 19 },
  { kanji: '下さる', reading: 'くださる', meaning: 'to give (honorific)', type: 'u', group: 'n4-keigo', chapter: 19 },
  { kanji: 'ご覧になる', reading: 'ごらんになる', meaning: 'to see (honorific)', type: 'u', group: 'n4-keigo', chapter: 19 },
  { kanji: '召し上がる', reading: 'めしあがる', meaning: 'to eat/drink (honorific)', type: 'u', group: 'n4-keigo', chapter: 19 },
  { kanji: '致す', reading: 'いたす', meaning: 'to do (humble)', type: 'u', group: 'n4-keigo', chapter: 20 },
  { kanji: '頂く', reading: 'いただく', meaning: 'to receive (humble)', type: 'u', group: 'n4-keigo', chapter: 20 },
  { kanji: '伺う', reading: 'うかがう', meaning: 'to visit / to ask (humble)', type: 'u', group: 'n4-keigo', chapter: 20 },
  { kanji: 'おる', reading: 'おる', meaning: 'to be (humble)', type: 'u', group: 'n4-keigo', chapter: 20 },
  { kanji: '参る', reading: 'まいる', meaning: 'to go / to come (humble)', type: 'u', group: 'n4-keigo', chapter: 20 },
  { kanji: '申す', reading: 'もうす', meaning: 'to say (humble)', type: 'u', group: 'n4-keigo', chapter: 20 },
  { kanji: '差し上げる', reading: 'さしあげる', meaning: 'to give (humble)', type: 'ru', group: 'n4-keigo', chapter: 20 },

  // n4-giving
  { kanji: '手伝う', reading: 'てつだう', meaning: 'to help', type: 'u', group: 'n4-giving', chapter: 6 },
  { kanji: 'もらう', reading: 'もらう', meaning: 'to receive', type: 'u', group: 'n4-giving', chapter: 9 },
  { kanji: '紹介する', reading: 'しょうかいする', meaning: 'to introduce', type: 'irregular', group: 'n4-giving', chapter: 11 },
  { kanji: '送る', reading: 'おくる', meaning: 'to send', type: 'u', group: 'n4-giving', chapter: 14 },
  { kanji: 'くれる', reading: 'くれる', meaning: 'to give (to me)', type: 'ru', group: 'n4-giving', chapter: 14 },
  { kanji: '相談する', reading: 'そうだんする', meaning: 'to consult', type: 'irregular', group: 'n4-giving', chapter: 14 },
  { kanji: '起こす', reading: 'おこす', meaning: 'to wake (someone) up', type: 'u', group: 'n4-giving', chapter: 16 },
  { kanji: '案内する', reading: 'あんないする', meaning: 'to guide / to show around', type: 'irregular', group: 'n4-giving', chapter: 16 },
  { kanji: '説明する', reading: 'せつめいする', meaning: 'to explain', type: 'irregular', group: 'n4-giving', chapter: 16 },
  { kanji: '謝る', reading: 'あやまる', meaning: 'to apologize', type: 'u', group: 'n4-giving', chapter: 18 },
  { kanji: '招待する', reading: 'しょうたいする', meaning: 'to invite', type: 'irregular', group: 'n4-giving', chapter: 19 },
  { kanji: '伝える', reading: 'つたえる', meaning: 'to convey / to tell', type: 'ru', group: 'n4-giving', chapter: 20 },
  { kanji: '褒める', reading: 'ほめる', meaning: 'to praise', type: 'ru', group: 'n4-giving', chapter: 21 },
  { kanji: '連絡する', reading: 'れんらくする', meaning: 'to contact', type: 'irregular', group: 'n4-giving', chapter: 21 },

  // n4-feelings
  { kanji: '思う', reading: 'おもう', meaning: 'to think', type: 'u', group: 'n4-feelings', chapter: 8 },
  { kanji: '決める', reading: 'きめる', meaning: 'to decide', type: 'ru', group: 'n4-feelings', chapter: 10 },
  { kanji: '別れる', reading: 'わかれる', meaning: 'to break up / to separate', type: 'ru', group: 'n4-feelings', chapter: 12 },
  { kanji: '心配する', reading: 'しんぱいする', meaning: 'to worry', type: 'irregular', group: 'n4-feelings', chapter: 12 },
  { kanji: '頑張る', reading: 'がんばる', meaning: 'to do one\'s best', type: 'u', group: 'n4-feelings', chapter: 13 },
  { kanji: '泣く', reading: 'なく', meaning: 'to cry', type: 'u', group: 'n4-feelings', chapter: 13 },
  { kanji: '約束を守る', reading: 'やくそくをまもる', meaning: 'to keep a promise', type: 'u', group: 'n4-feelings', chapter: 13 },
  { kanji: '気をつける', reading: 'きをつける', meaning: 'to be careful', type: 'ru', group: 'n4-feelings', chapter: 15 },
  { kanji: '笑う', reading: 'わらう', meaning: 'to laugh', type: 'u', group: 'n4-feelings', chapter: 16 },
  { kanji: '慣れる', reading: 'なれる', meaning: 'to get used to', type: 'ru', group: 'n4-feelings', chapter: 17 },
  { kanji: '考える', reading: 'かんがえる', meaning: 'to think (about)', type: 'ru', group: 'n4-feelings', chapter: 18 },
  { kanji: '怒る', reading: 'おこる', meaning: 'to get angry', type: 'u', group: 'n4-feelings', chapter: 19 },
  { kanji: '決まる', reading: 'きまる', meaning: 'to be decided', type: 'u', group: 'n4-feelings', chapter: 19 },
  { kanji: '注意する', reading: 'ちゅういする', meaning: 'to watch out / to warn', type: 'irregular', group: 'n4-feelings', chapter: 19 },
  { kanji: 'いじめる', reading: 'いじめる', meaning: 'to bully', type: 'ru', group: 'n4-feelings', chapter: 21 },
  { kanji: '反対する', reading: 'はんたいする', meaning: 'to oppose', type: 'irregular', group: 'n4-feelings', chapter: 22 },

  // n4-pairs
  { kanji: '始める', reading: 'はじめる', meaning: 'to begin', type: 'ru', group: 'n4-pairs', chapter: 8 },
  { kanji: '見える', reading: 'みえる', meaning: 'to be visible', type: 'ru', group: 'n4-pairs', chapter: 15 },
  { kanji: '直す', reading: 'なおす', meaning: 'to fix / to correct', type: 'u', group: 'n4-pairs', chapter: 16 },
  { kanji: '見つかる', reading: 'みつかる', meaning: 'to be found', type: 'u', group: 'n4-pairs', chapter: 16 },
  { kanji: '込む', reading: 'こむ', meaning: 'to get crowded', type: 'u', group: 'n4-pairs', chapter: 17 },
  { kanji: '足りる', reading: 'たりる', meaning: 'to be sufficient', type: 'ru', group: 'n4-pairs', chapter: 17 },
  { kanji: '落とす', reading: 'おとす', meaning: 'to drop', type: 'u', group: 'n4-pairs', chapter: 18 },
  { kanji: '壊す', reading: 'こわす', meaning: 'to break (transitive)', type: 'u', group: 'n4-pairs', chapter: 18 },
  { kanji: '落ちる', reading: 'おちる', meaning: 'to fall', type: 'ru', group: 'n4-pairs', chapter: 18 },
  { kanji: '壊れる', reading: 'こわれる', meaning: 'to break (intransitive)', type: 'ru', group: 'n4-pairs', chapter: 18 },
  { kanji: '汚れる', reading: 'よごれる', meaning: 'to become dirty', type: 'ru', group: 'n4-pairs', chapter: 18 },
  { kanji: '聞こえる', reading: 'きこえる', meaning: 'to be audible', type: 'ru', group: 'n4-pairs', chapter: 20 },
  { kanji: '続ける', reading: 'つづける', meaning: 'to continue', type: 'ru', group: 'n4-pairs', chapter: 21 },
  { kanji: '間違える', reading: 'まちがえる', meaning: 'to make a mistake', type: 'ru', group: 'n4-pairs', chapter: 21 },
  { kanji: '見つける', reading: 'みつける', meaning: 'to find', type: 'ru', group: 'n4-pairs', chapter: 21 },

  // n4-handling
  { kanji: '編む', reading: 'あむ', meaning: 'to knit', type: 'u', group: 'n4-handling', chapter: 13 },
  { kanji: '集める', reading: 'あつめる', meaning: 'to collect', type: 'ru', group: 'n4-handling', chapter: 16 },
  { kanji: '片付ける', reading: 'かたづける', meaning: 'to tidy up', type: 'ru', group: 'n4-handling', chapter: 18 },
  { kanji: '触る', reading: 'さわる', meaning: 'to touch', type: 'u', group: 'n4-handling', chapter: 21 },
  { kanji: '包む', reading: 'つつむ', meaning: 'to wrap', type: 'u', group: 'n4-handling', chapter: 21 },
  { kanji: '盗む', reading: 'ぬすむ', meaning: 'to steal', type: 'u', group: 'n4-handling', chapter: 21 },
  { kanji: '踏む', reading: 'ふむ', meaning: 'to step on', type: 'u', group: 'n4-handling', chapter: 21 },
  { kanji: '焼く', reading: 'やく', meaning: 'to bake / to grill', type: 'u', group: 'n4-handling', chapter: 21 },
  { kanji: '運ぶ', reading: 'はこぶ', meaning: 'to carry / to transport', type: 'u', group: 'n4-handling', chapter: 22 },
  { kanji: '拾う', reading: 'ひろう', meaning: 'to pick up', type: 'u', group: 'n4-handling', chapter: 22 },

  // n4-plans
  { kanji: '急ぐ', reading: 'いそぐ', meaning: 'to hurry', type: 'u', group: 'n4-plans', chapter: 6 },
  { kanji: '運転する', reading: 'うんてんする', meaning: 'to drive', type: 'irregular', group: 'n4-plans', chapter: 8 },
  { kanji: '泊まる', reading: 'とまる', meaning: 'to stay (at hotel)', type: 'u', group: 'n4-plans', chapter: 10 },
  { kanji: '払う', reading: 'はらう', meaning: 'to pay', type: 'u', group: 'n4-plans', chapter: 10 },
  { kanji: '喉が渇く', reading: 'のどがかわく', meaning: 'to become thirsty', type: 'u', group: 'n4-plans', chapter: 12 },
  { kanji: '探す', reading: 'さがす', meaning: 'to look for', type: 'u', group: 'n4-plans', chapter: 15 },
  { kanji: '調べる', reading: 'しらべる', meaning: 'to look into / to investigate', type: 'ru', group: 'n4-plans', chapter: 15 },
  { kanji: '予約する', reading: 'よやくする', meaning: 'to reserve', type: 'irregular', group: 'n4-plans', chapter: 15 },
  { kanji: '朝寝坊する', reading: 'あさねぼうする', meaning: 'to oversleep', type: 'irregular', group: 'n4-plans', chapter: 16 },
  { kanji: '選ぶ', reading: 'えらぶ', meaning: 'to choose', type: 'u', group: 'n4-plans', chapter: 17 },
  { kanji: '引っ越す', reading: 'ひっこす', meaning: 'to move (house)', type: 'u', group: 'n4-plans', chapter: 19 },
  { kanji: '寄る', reading: 'よる', meaning: 'to stop by', type: 'u', group: 'n4-plans', chapter: 19 },
  { kanji: '遅れる', reading: 'おくれる', meaning: 'to be late', type: 'ru', group: 'n4-plans', chapter: 19 },
  { kanji: '戻る', reading: 'もどる', meaning: 'to return', type: 'u', group: 'n4-plans', chapter: 20 },
  { kanji: '生活する', reading: 'せいかつする', meaning: 'to live (a life)', type: 'irregular', group: 'n4-plans', chapter: 20 },
  { kanji: '着替える', reading: 'きがえる', meaning: 'to change clothes', type: 'ru', group: 'n4-plans', chapter: 21 },
  { kanji: '間に合う', reading: 'まにあう', meaning: 'to be on time', type: 'u', group: 'n4-plans', chapter: 22 },

  // n4-school
  { kanji: '太る', reading: 'ふとる', meaning: 'to gain weight', type: 'u', group: 'n4-school', chapter: 7 },
  { kanji: '痩せる', reading: 'やせる', meaning: 'to lose weight', type: 'ru', group: 'n4-school', chapter: 7 },
  { kanji: '踊る', reading: 'おどる', meaning: 'to dance', type: 'u', group: 'n4-school', chapter: 9 },
  { kanji: '運動する', reading: 'うんどうする', meaning: 'to exercise', type: 'irregular', group: 'n4-school', chapter: 9 },
  { kanji: 'サボる', reading: 'さぼる', meaning: 'to skip (class)', type: 'u', group: 'n4-school', chapter: 11 },
  { kanji: 'やめる', reading: 'やめる', meaning: 'to quit', type: 'ru', group: 'n4-school', chapter: 11 },
  { kanji: 'ダイエットする', reading: 'だいえっとする', meaning: 'to go on a diet', type: 'irregular', group: 'n4-school', chapter: 11 },
  { kanji: '卒業する', reading: 'そつぎょうする', meaning: 'to graduate', type: 'irregular', group: 'n4-school', chapter: 15 },
  { kanji: '勝つ', reading: 'かつ', meaning: 'to win', type: 'u', group: 'n4-school', chapter: 22 },
  { kanji: '育てる', reading: 'そだてる', meaning: 'to raise / to bring up', type: 'ru', group: 'n4-school', chapter: 22 },
  { kanji: '負ける', reading: 'まける', meaning: 'to lose', type: 'ru', group: 'n4-school', chapter: 22 },
  { kanji: '翻訳する', reading: 'ほんやくする', meaning: 'to translate', type: 'irregular', group: 'n4-school', chapter: 22 },
  { kanji: '受ける', reading: 'うける', meaning: 'to take (an exam)', type: 'ru', group: 'n4-school', chapter: 23 },

  // n4-orders
  { kanji: '止まる', reading: 'とまる', meaning: 'to stop', type: 'u', group: 'n4-orders', chapter: 24 },
  { kanji: '逃げる', reading: 'にげる', meaning: 'to run away / to escape', type: 'ru', group: 'n4-orders', chapter: 24 },
  { kanji: '黙る', reading: 'だまる', meaning: 'to be quiet / to shut up', type: 'u', group: 'n4-orders', chapter: 24 },
  { kanji: '投げる', reading: 'なげる', meaning: 'to throw', type: 'ru', group: 'n4-orders', chapter: 24 },
  { kanji: '引く', reading: 'ひく', meaning: 'to pull', type: 'u', group: 'n4-orders', chapter: 24 },
  { kanji: '捨てる', reading: 'すてる', meaning: 'to throw away', type: 'ru', group: 'n4-orders', chapter: 24 },
  { kanji: '動く', reading: 'うごく', meaning: 'to move', type: 'u', group: 'n4-orders', chapter: 24 },
  { kanji: '隠れる', reading: 'かくれる', meaning: 'to hide', type: 'ru', group: 'n4-orders', chapter: 24 },
  { kanji: '落ち着く', reading: 'おちつく', meaning: 'to calm down', type: 'u', group: 'n4-orders', chapter: 24 },
  { kanji: '守る', reading: 'まもる', meaning: 'to protect', type: 'u', group: 'n4-orders', chapter: 24 },
  { kanji: '進む', reading: 'すすむ', meaning: 'to go forward', type: 'u', group: 'n4-orders', chapter: 24 },
  { kanji: '閉める', reading: 'しめる', meaning: 'to close / to shut', type: 'ru', group: 'n4-orders', chapter: 24 },
  { kanji: '並ぶ', reading: 'ならぶ', meaning: 'to line up', type: 'u', group: 'n4-orders', chapter: 24 },
  { kanji: '渡る', reading: 'わたる', meaning: 'to cross', type: 'u', group: 'n4-orders', chapter: 24 },
  { kanji: '捕まえる', reading: 'つかまえる', meaning: 'to catch', type: 'ru', group: 'n4-orders', chapter: 24 },

  // n3-people
  { kanji: '似合う', reading: 'にあう', meaning: 'to suit / to look good on', type: 'u', group: 'n3-people', chapter: 14 },
  { kanji: '誘う', reading: 'さそう', meaning: 'to invite', type: 'u', group: 'n3-people', chapter: 15 },
  { kanji: 'しゃべる', reading: 'しゃべる', meaning: 'to chat', type: 'u', group: 'n3-people', chapter: 15 },
  { kanji: '付き合う', reading: 'つきあう', meaning: 'to date / to go along with', type: 'u', group: 'n3-people', chapter: 15 },
  { kanji: 'おごる', reading: 'おごる', meaning: 'to treat (someone to a meal)', type: 'u', group: 'n3-people', chapter: 16 },
  { kanji: '離婚する', reading: 'りこんする', meaning: 'to get divorced', type: 'irregular', group: 'n3-people', chapter: 17 },
  { kanji: 'もてる', reading: 'もてる', meaning: 'to be popular', type: 'ru', group: 'n3-people', chapter: 19 },
  { kanji: '捕まる', reading: 'つかまる', meaning: 'to be caught', type: 'u', group: 'n3-people', chapter: 21 },
  { kanji: '殴る', reading: 'なぐる', meaning: 'to hit / to punch', type: 'u', group: 'n3-people', chapter: 21 },
  { kanji: '助ける', reading: 'たすける', meaning: 'to rescue / to help', type: 'ru', group: 'n3-people', chapter: 22 },
  { kanji: '賛成する', reading: 'さんせいする', meaning: 'to agree', type: 'irregular', group: 'n3-people', chapter: 22 },
  { kanji: '離れる', reading: 'はなれる', meaning: 'to be separated', type: 'ru', group: 'n3-people', chapter: 23 },

  // n3-feelings
  { kanji: '遅刻する', reading: 'ちこくする', meaning: 'to be late', type: 'irregular', group: 'n3-feelings', chapter: 11 },
  { kanji: '緊張する', reading: 'きんちょうする', meaning: 'to get nervous', type: 'irregular', group: 'n3-feelings', chapter: 12 },
  { kanji: '感動する', reading: 'かんどうする', meaning: 'to be moved/touched', type: 'irregular', group: 'n3-feelings', chapter: 13 },
  { kanji: '諦める', reading: 'あきらめる', meaning: 'to give up', type: 'ru', group: 'n3-feelings', chapter: 14 },
  { kanji: '落ち込む', reading: 'おちこむ', meaning: 'to feel depressed', type: 'u', group: 'n3-feelings', chapter: 16 },
  { kanji: '乗り遅れる', reading: 'のりおくれる', meaning: 'to miss (a ride)', type: 'ru', group: 'n3-feelings', chapter: 16 },
  { kanji: '転ぶ', reading: 'ころぶ', meaning: 'to fall down', type: 'u', group: 'n3-feelings', chapter: 18 },
  { kanji: '我慢する', reading: 'がまんする', meaning: 'to endure / to be patient', type: 'irregular', group: 'n3-feelings', chapter: 23 },
  { kanji: '優勝する', reading: 'ゆうしょうする', meaning: 'to win a championship', type: 'irregular', group: 'n3-feelings', chapter: 23 },

  // n3-life
  { kanji: '飼う', reading: 'かう', meaning: 'to own (a pet)', type: 'u', group: 'n3-life', chapter: 11, disambig: 'pet' },
  { kanji: '留学する', reading: 'りゅうがくする', meaning: 'to study abroad', type: 'irregular', group: 'n3-life', chapter: 11 },
  { kanji: '下ろす', reading: 'おろす', meaning: 'to withdraw (money)', type: 'u', group: 'n3-life', chapter: 15 },
  { kanji: '描く', reading: 'かく', meaning: 'to draw / to paint', type: 'u', group: 'n3-life', chapter: 15, disambig: 'draw' },
  { kanji: '観光する', reading: 'かんこうする', meaning: 'to sightsee', type: 'irregular', group: 'n3-life', chapter: 15 },
  { kanji: '訳す', reading: 'やくす', meaning: 'to translate', type: 'u', group: 'n3-life', chapter: 16 },
  { kanji: '化粧する', reading: 'けしょうする', meaning: 'to put on makeup', type: 'irregular', group: 'n3-life', chapter: 17 },
  { kanji: '就職する', reading: 'しゅうしょくする', meaning: 'to get a job', type: 'irregular', group: 'n3-life', chapter: 17 },
  { kanji: '汚す', reading: 'よごす', meaning: 'to make dirty', type: 'u', group: 'n3-life', chapter: 18 },
  { kanji: '注文する', reading: 'ちゅうもんする', meaning: 'to order', type: 'irregular', group: 'n3-life', chapter: 18 },
  { kanji: '交換する', reading: 'こうかんする', meaning: 'to exchange', type: 'irregular', group: 'n3-life', chapter: 20 },
  { kanji: 'ためる', reading: 'ためる', meaning: 'to save (money)', type: 'ru', group: 'n3-life', chapter: 21 },
];

// The Verbs page's chunks, by JLPT level, in the order they're meant to be
// worked through. Each one brings its own verbs (`group` above) and maybe
// new forms (`newForms`), in the classic order: polite, polite past, て,
// plain, plain past, たい, then potential, volitional, ば, passive,
// causative and the command form. A chunk drills its own verbs in every form known by then, plus
// its new forms for the verbs of earlier chunks, so each verb + form is in
// exactly one chunk: the first one where both are known. Keigo verbs keep
// to the N5 forms (a passive いらっしゃる is no use to anyone).
//
// A verb's `chapter` is only part of its cards' SRS ids (3_いく_masu); it's
// kept so saved progress carries over, and has no say in where it's shown.
const VERB_CHUNKS = [
  { id: 'n5-basics', level: 'N5', title: 'Basic verbs', sub: 'go, come, be, know…', newForms: ['masu', 'masu-neg'] },
  { id: 'n5-routine', level: 'N5', title: 'Daily routine', sub: 'eat, sleep, wash, work…', newForms: ['masu-past', 'masu-past-neg'] },
  { id: 'n5-study', level: 'N5', title: 'Study & talking', sub: 'read, write, ask, learn…', newForms: ['te'] },
  { id: 'n5-going', level: 'N5', title: 'Getting around', sub: 'ride, enter, swim, climb…', newForms: ['nai', 'dict'] },
  { id: 'n5-things', level: 'N5', title: 'Things & shopping', sub: 'buy, lend, put, use…', newForms: ['ta', 'nakatta'] },
  { id: 'n5-around', level: 'N5', title: 'Doors, lights & weather', sub: 'open, turn on, rain, begin…', newForms: ['tai'] },
  { id: 'n5-life', level: 'N5', title: 'Clothes & life events', sub: 'wear, marry, sing, be born…', newForms: [] },
  { id: 'n4-giving', level: 'N4', title: 'Giving, helping & telling', sub: 'receive, send, explain…', newForms: ['potential'] },
  { id: 'n4-feelings', level: 'N4', title: 'Thoughts & feelings', sub: 'think, worry, laugh, decide…', newForms: ['volitional'] },
  { id: 'n4-plans', level: 'N4', title: 'Plans & errands', sub: 'hurry, book, move, pay…', newForms: ['ba'] },
  { id: 'n4-pairs', level: 'N4', title: 'Things that happen', sub: 'drop / fall, break, find…', newForms: ['passive'] },
  { id: 'n4-keigo', level: 'N4', title: 'Honorific & humble verbs', sub: 'いらっしゃる, 申す…', newForms: [] },
  { id: 'n4-handling', level: 'N4', title: 'Handling things', sub: 'tidy, carry, wrap, bake…', newForms: ['causative'] },
  { id: 'n4-school', level: 'N4', title: 'School, work & sport', sub: 'graduate, quit, win…', newForms: ['causative-passive'] },
  { id: 'n4-orders', level: 'N4', title: 'Orders & warnings', sub: 'stop, run away, hide, calm down…', newForms: ['imperative'] },
  { id: 'n3-people', level: 'N3', title: 'People & relationships', sub: 'invite, date, help…', newForms: [] },
  { id: 'n3-feelings', level: 'N3', title: 'Effort & feelings', sub: 'give up, endure, be moved…', newForms: [] },
  { id: 'n3-life', level: 'N3', title: 'Life & work', sub: 'study abroad, order, save…', newForms: [] },
];

// Forms that don't exist for a verb, or that nobody says: no potential or
// volitional for things that just happen, no passive or causative for
// states, no command for things nobody orders (転べ, 死ね, 遅刻しろ), and
// no N4 forms for keigo verbs.
const NOT_DONE_ON_PURPOSE = ['ある', '分かる', 'できる', '要る', '見える', '聞こえる', '足りる', 'かかる', '込む',
  '降る', '晴れる', '咲く', '始まる', '閉まる', '開く', '消える', '壊れる', '汚れる', '落ちる', '見つかる', '決まる',
  '生まれる', '疲れる', '困る', '遅くなる', '喉が渇く', '間に合う', '似合う'];
const STATES = ['ある', '分かる', 'できる', '要る', '見える', '聞こえる', '足りる', '似合う', 'かかる', '込む'];
const NO_COMMAND = ['知る', '着く', '終わる', '死ぬ', 'なくす', '心配する', '怒る', 'いじめる', '間違える', '落とす', '汚す', '盗む',
  '朝寝坊する', '遅れる', '太る', '負ける', 'もてる', '離婚する', '捕まる', '殴る', '遅刻する', '緊張する', '感動する',
  '落ち込む', '乗り遅れる', '転ぶ', '生活する'];
const N4_FORMS = ['potential', 'volitional', 'ba', 'passive', 'causative', 'causative-passive', 'imperative'];

function verbHasForm(verb, form) {
  if (verb.group === 'n4-keigo' && N4_FORMS.includes(form)) return false;
  if (['potential', 'volitional'].includes(form) && NOT_DONE_ON_PURPOSE.includes(verb.kanji)) return false;
  if (['passive', 'causative', 'causative-passive'].includes(form) && STATES.includes(verb.kanji)) return false;
  if (form === 'imperative' && (NOT_DONE_ON_PURPOSE.includes(verb.kanji) || NO_COMMAND.includes(verb.kanji))) return false;
  return true;
}

const LEVEL_OF_GROUP = Object.fromEntries(VERB_CHUNKS.map(c => [c.id, c.level]));
const verbLevel = verb => LEVEL_OF_GROUP[verb.group];

function getVerbChunk(id) {
  return VERB_CHUNKS.find(c => c.id === id) || null;
}

// The verbs a chunk brings.
function getVerbsForChunk(chunk) {
  return ALL_VERBS.filter(v => v.group === chunk.id);
}

// Every [verb, form] pair a chunk drills: its own verbs in all the forms
// known by then, then its new forms for the verbs that came before.
function getChunkCards(chunk) {
  const i = VERB_CHUNKS.indexOf(chunk);
  const known = VERB_CHUNKS.slice(0, i + 1).flatMap(c => c.newForms);
  const pairs = (verbs, forms) => verbs.flatMap(v => forms.filter(f => verbHasForm(v, f)).map(f => [v, f]));
  return [
    ...pairs(getVerbsForChunk(chunk), known),
    ...pairs(VERB_CHUNKS.slice(0, i).flatMap(getVerbsForChunk), chunk.newForms),
  ];
}

const ALL_ADJECTIVES = [
  // adj-n5-things
  { kanji: '安い', reading: 'やすい', meaning: 'cheap / inexpensive', type: 'i-adj', group: 'adj-n5-things' },
  { kanji: '高い', reading: 'たかい', meaning: 'expensive / tall', type: 'i-adj', group: 'adj-n5-things' },
  { kanji: '大きい', reading: 'おおきい', meaning: 'big / large', type: 'i-adj', group: 'adj-n5-things' },
  { kanji: '小さい', reading: 'ちいさい', meaning: 'small', type: 'i-adj', group: 'adj-n5-things' },
  { kanji: '新しい', reading: 'あたらしい', meaning: 'new', type: 'i-adj', group: 'adj-n5-things' },
  { kanji: '古い', reading: 'ふるい', meaning: 'old (things)', type: 'i-adj', group: 'adj-n5-things' },
  { kanji: '長い', reading: 'ながい', meaning: 'long', type: 'i-adj', group: 'adj-n5-things' },
  { kanji: '短い', reading: 'みじかい', meaning: 'short (length)', type: 'i-adj', group: 'adj-n5-things' },
  { kanji: '速い', reading: 'はやい', meaning: 'fast / early', type: 'i-adj', group: 'adj-n5-things' },
  { kanji: '近い', reading: 'ちかい', meaning: 'near / close', type: 'i-adj', group: 'adj-n5-things' },
  { kanji: '遠い', reading: 'とおい', meaning: 'far', type: 'i-adj', group: 'adj-n5-things' },
  { kanji: '多い', reading: 'おおい', meaning: 'many / a lot', type: 'i-adj', group: 'adj-n5-things' },
  { kanji: '少ない', reading: 'すくない', meaning: 'few / a little', type: 'i-adj', group: 'adj-n5-things' },
  { kanji: '広い', reading: 'ひろい', meaning: 'spacious / wide', type: 'i-adj', group: 'adj-n5-things' },
  { kanji: '狭い', reading: 'せまい', meaning: 'narrow / cramped', type: 'i-adj', group: 'adj-n5-things' },
  { kanji: '明るい', reading: 'あかるい', meaning: 'bright / cheerful', type: 'i-adj', group: 'adj-n5-things' },
  { kanji: '暗い', reading: 'くらい', meaning: 'dark', type: 'i-adj', group: 'adj-n5-things' },
  { kanji: '強い', reading: 'つよい', meaning: 'strong', type: 'i-adj', group: 'adj-n5-things' },
  { kanji: '弱い', reading: 'よわい', meaning: 'weak', type: 'i-adj', group: 'adj-n5-things' },

  // adj-n5-opinions
  { kanji: 'おもしろい', reading: 'おもしろい', meaning: 'interesting / funny', type: 'i-adj', group: 'adj-n5-opinions' },
  { kanji: '楽しい', reading: 'たのしい', meaning: 'fun', type: 'i-adj', group: 'adj-n5-opinions' },
  { kanji: '忙しい', reading: 'いそがしい', meaning: 'busy', type: 'i-adj', group: 'adj-n5-opinions' },
  { kanji: 'いい', reading: 'いい', meaning: 'good', type: 'i-adj', group: 'adj-n5-opinions' },
  { kanji: '難しい', reading: 'むずかしい', meaning: 'difficult', type: 'i-adj', group: 'adj-n5-opinions' },
  { kanji: 'つまらない', reading: 'つまらない', meaning: 'boring', type: 'i-adj', group: 'adj-n5-opinions' },
  { kanji: 'きれい', reading: 'きれい', meaning: 'beautiful / clean', type: 'na-adj', group: 'adj-n5-opinions' },
  { kanji: '元気', reading: 'げんき', meaning: 'healthy / energetic', type: 'na-adj', group: 'adj-n5-opinions' },
  { kanji: '静か', reading: 'しずか', meaning: 'quiet', type: 'na-adj', group: 'adj-n5-opinions' },
  { kanji: 'にぎやか', reading: 'にぎやか', meaning: 'lively', type: 'na-adj', group: 'adj-n5-opinions' },
  { kanji: '好き', reading: 'すき', meaning: 'liked / favorite', type: 'na-adj', group: 'adj-n5-opinions' },
  { kanji: '嫌い', reading: 'きらい', meaning: 'disliked', type: 'na-adj', group: 'adj-n5-opinions' },
  { kanji: '暇', reading: 'ひま', meaning: 'free (not busy)', type: 'na-adj', group: 'adj-n5-opinions' },
  { kanji: '悪い', reading: 'わるい', meaning: 'bad', type: 'i-adj', group: 'adj-n5-opinions' },
  { kanji: '有名', reading: 'ゆうめい', meaning: 'famous', type: 'na-adj', group: 'adj-n5-opinions' },
  { kanji: '便利', reading: 'べんり', meaning: 'convenient', type: 'na-adj', group: 'adj-n5-opinions' },
  { kanji: '汚い', reading: 'きたない', meaning: 'dirty', type: 'i-adj', group: 'adj-n5-opinions' },
  { kanji: '危ない', reading: 'あぶない', meaning: 'dangerous', type: 'i-adj', group: 'adj-n5-opinions' },
  { kanji: '丈夫', reading: 'じょうぶ', meaning: 'sturdy / durable', type: 'na-adj', group: 'adj-n5-opinions' },

  // adj-n5-senses
  { kanji: 'おいしい', reading: 'おいしい', meaning: 'delicious', type: 'i-adj', group: 'adj-n5-senses' },
  { kanji: '寒い', reading: 'さむい', meaning: 'cold (weather)', type: 'i-adj', group: 'adj-n5-senses' },
  { kanji: '暑い', reading: 'あつい', meaning: 'hot (weather)', type: 'i-adj', group: 'adj-n5-senses' },
  { kanji: '暖かい', reading: 'あたたかい', meaning: 'warm', type: 'i-adj', group: 'adj-n5-senses' },
  { kanji: '涼しい', reading: 'すずしい', meaning: 'cool (weather)', type: 'i-adj', group: 'adj-n5-senses' },
  { kanji: '甘い', reading: 'あまい', meaning: 'sweet', type: 'i-adj', group: 'adj-n5-senses' },
  { kanji: '辛い', reading: 'からい', meaning: 'spicy', type: 'i-adj', group: 'adj-n5-senses' },
  { kanji: '痛い', reading: 'いたい', meaning: 'painful', type: 'i-adj', group: 'adj-n5-senses' },

  // adj-n4-people
  { kanji: '怖い', reading: 'こわい', meaning: 'scary', type: 'i-adj', group: 'adj-n4-people' },
  { kanji: 'かっこいい', reading: 'かっこいい', meaning: 'cool / good-looking', type: 'i-adj', group: 'adj-n4-people' },
  { kanji: 'ハンサム', reading: 'はんさむ', meaning: 'handsome', type: 'na-adj', group: 'adj-n4-people' },
  { kanji: '優しい', reading: 'やさしい', meaning: 'kind / gentle', type: 'i-adj', group: 'adj-n4-people' },
  { kanji: '簡単', reading: 'かんたん', meaning: 'easy / simple', type: 'na-adj', group: 'adj-n4-people' },
  { kanji: '嬉しい', reading: 'うれしい', meaning: 'happy / glad', type: 'i-adj', group: 'adj-n4-people' },
  { kanji: '悲しい', reading: 'かなしい', meaning: 'sad', type: 'i-adj', group: 'adj-n4-people' },
  { kanji: '厳しい', reading: 'きびしい', meaning: 'strict', type: 'i-adj', group: 'adj-n4-people' },
  { kanji: '素敵', reading: 'すてき', meaning: 'lovely / wonderful', type: 'na-adj', group: 'adj-n4-people' },
  { kanji: '珍しい', reading: 'めずらしい', meaning: 'rare / unusual', type: 'i-adj', group: 'adj-n4-people' },
  { kanji: '正直', reading: 'しょうじき', meaning: 'honest', type: 'na-adj', group: 'adj-n4-people' },
  { kanji: '正しい', reading: 'ただしい', meaning: 'correct / right', type: 'i-adj', group: 'adj-n4-people' },
  { kanji: '幸せ', reading: 'しあわせ', meaning: 'happy', type: 'na-adj', group: 'adj-n4-people' },
];

// The Adjectives page's chunks, by topic and JLPT level, introducing the
// forms in order the same way as the verbs: present and negative, then the
// past, then the て-form and adverb.
const ADJ_CHUNKS = [
  { id: 'adj-n5-things', level: 'N5', title: 'Size, distance & amount', sub: 'big, far, many…', newForms: ['adj-present', 'adj-neg'] },
  { id: 'adj-n5-opinions', level: 'N5', title: 'Opinions & character', sub: 'fun, busy, famous, quiet…', newForms: ['adj-past', 'adj-past-neg'] },
  { id: 'adj-n5-senses', level: 'N5', title: 'Weather, taste & body', sub: 'cold, sweet, painful…', newForms: ['adj-te', 'adj-adverb'] },
  { id: 'adj-n4-people', level: 'N4', title: 'Feelings & people', sub: 'kind, sad, strict, honest…', newForms: [] },
];

function getAdjChunk(id) {
  return ADJ_CHUNKS.find(c => c.id === id) || null;
}

function getAdjectivesForChunk(chunk) {
  return ALL_ADJECTIVES.filter(a => a.group === chunk.id);
}

// Every [adjective, form] pair a chunk drills, as getChunkCards.
function getAdjChunkCards(chunk) {
  const i = ADJ_CHUNKS.indexOf(chunk);
  const known = ADJ_CHUNKS.slice(0, i + 1).flatMap(c => c.newForms);
  const pairs = (adjs, forms) => adjs.flatMap(a => forms.map(f => [a, f]));
  return [
    ...pairs(getAdjectivesForChunk(chunk), known),
    ...pairs(ADJ_CHUNKS.slice(0, i).flatMap(getAdjectivesForChunk), chunk.newForms),
  ];
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ALL_VERBS, VERB_CHUNKS, getVerbChunk, getVerbsForChunk, getChunkCards, verbHasForm, verbLevel, ALL_ADJECTIVES, ADJ_CHUNKS, getAdjChunk, getAdjectivesForChunk, getAdjChunkCards };
}
