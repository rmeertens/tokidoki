(function (global) {
  'use strict';

  // Bunkei in the wild (bunkei-story.html): one story, Tom's year in Japan,
  // told in chapters from N5 to N3, that uses every sentence pattern of the
  // Bunkei drill (PATTERNS in bunkei-data.js) at least once. After each
  // sentence the learner picks what the pattern in it means, from four.
  //
  //   chapters  { id, level, title, titleEn, lines }
  //   lines     one sentence each:
  //     ja      the sentence, in 漢字[かんじ] furigana markup (N5 keeps the
  //             spaces between words, as on the other N5 pages)
  //     en      English translation
  //     b       the pattern it practises (an id from Bunkei.PATTERNS)
  //     hl      the part of `ja` that is the pattern, underlined once answered
  //     wrong   three other pattern ids, shown as the wrong choices: at or
  //             below the chapter's level, never one the sentence also uses,
  //             and never one in CLOSE with the answer
  //     note    optional: anything about this sentence the pattern's own
  //             note doesn't cover (a past or plain form, other grammar)
  //
  // test_bunkei_story.js checks all of this, and that no pattern is missing.

  // Patterns whose meanings are too close to tell apart as choices.
  const CLOSE = [
    ['te-mimashou', 'mashou'], ['te-mimashou', 'te-miru'], ['tara', 'te-kara'],
    ['nakute-mo-ii', 'koto-wa-nai'], ['beki', 'hou-ga-ii'], ['beki', 'nakereba-naranai'],
    ['hou-ga-ii', 'nakereba-naranai'], ['wake-ni-wa-ikanai', 'potential-neg'],
    ['tsumori', 'volitional-to-omou'], ['tsumori', 'koto-ni-suru'], ['te-morau', 'te-kureru'],
    ['you-ni-naru', 'potential'], ['naide-kudasai', 'te-wa-ikenai'],
  ];

  const CHAPTERS = [
    // ─── N5 ──────────────────────────────────────────────────────────────────
    {
      id: 'n5-arrival', level: 'N5', title: 'トムさん、日本[にほん]へ', titleEn: 'Tom comes to Japan',
      lines: [
        { ja: 'アメリカの 大学生[だいがくせい]の トムさんは、ずっと 日本[にほん]で 勉強[べんきょう]したかったです。',
          en: 'Tom, a university student from America, had always wanted to study in Japan.',
          b: 'tai', hl: '勉強[べんきょう]したかった', wrong: ['te-iru', 'mashou', 'te-kudasai'],
          note: 'たい in the past: 勉強したい → 勉強したかったです “wanted to study”.' },
        { ja: '日本[にほん]に 来[く]る 前[まえ]に、毎日[まいにち] ひらがなを 練習[れんしゅう]しました。',
          en: 'Before coming to Japan, he practised hiragana every day.',
          b: 'mae-ni', hl: '来[く]る 前[まえ]に', wrong: ['te-kara', 'te-iru', 'tai'] },
        { ja: 'ホストファミリーの 家[いえ]で、トムさんは 「シャワーを 使[つか]っても いいですか。」と 聞[き]きました。',
          en: 'At his host family’s house, Tom asked, “May I use the shower?”',
          b: 'te-mo-ii', hl: '使[つか]っても いいですか', wrong: ['te-kudasai', 'te-wa-ikenai', 'masen-ka'] },
        { ja: 'お母[かあ]さんは 「どうぞ。この タオルを 使[つか]って ください。」と 言[い]いました。',
          en: 'His host mother said, “Go ahead. Please use this towel.”',
          b: 'te-kudasai', hl: '使[つか]って ください', wrong: ['te-mo-ii', 'naide-kudasai', 'mashou'] },
        { ja: '「でも、家[いえ]の 中[なか]で くつを はいては いけません。」',
          en: '“But you mustn’t wear shoes inside the house.”',
          b: 'te-wa-ikenai', hl: 'はいては いけません', wrong: ['te-mo-ii', 'te-iru', 'tai'],
          note: 'はく is “to put on / wear” for shoes and trousers: はいて → はいては いけません.' },
        { ja: 'お父[とう]さんは 「わたしの ビールは 飲[の]まないで くださいね。」と 笑[わら]いました。',
          en: 'His host father laughed: “Please don’t drink my beer, OK?”',
          b: 'naide-kudasai', hl: '飲[の]まないで ください', wrong: ['te-kudasai', 'te-mo-ii', 'masen-ka'] },
        { ja: '妹[いもうと]の ゆきさんは、となりの 部屋[へや]で ピアノを ひいて いました。',
          en: 'Yuki, the younger sister, was playing the piano in the next room.',
          b: 'te-iru', hl: 'ひいて いました', wrong: ['te-kara', 'tai', 'mashou'],
          note: '〜ています in the past: 〜ていました “was doing”. ひく is “to play” a piano or guitar.' },
        { ja: 'ゆきさんは 「トムさん、あした いっしょに 浅草[あさくさ]へ 行[い]きませんか。」と 言[い]いました。',
          en: 'Yuki said, “Tom, would you like to go to Asakusa together tomorrow?”',
          b: 'masen-ka', hl: '行[い]きませんか', wrong: ['te-mo-ii', 'te-kudasai', 'tai'],
          note: '浅草 is an old part of Tokyo with the Sensō-ji temple.' },
        { ja: 'トムさんは 「いいですね。行[い]きましょう！」と こたえました。',
          en: '“Sounds great. Let’s go!” Tom answered.',
          b: 'mashou', hl: '行[い]きましょう', wrong: ['masen-ka', 'tai', 'te-kudasai'],
          note: '〜ませんか invites, and 〜ましょう is how you say yes to it.' },
        { ja: 'その 夜[よる]、トムさんは おふろに 入[はい]ってから、すぐ 寝[ね]ました。',
          en: 'That night, Tom had a bath and then went straight to bed.',
          b: 'te-kara', hl: '入[はい]ってから', wrong: ['mae-ni', 'te-iru', 'te-mo-ii'],
          note: 'おふろに 入る “take a bath” — you “enter” the bath.' },
      ],
    },

    // ─── N4 ──────────────────────────────────────────────────────────────────
    {
      id: 'n4-school', level: 'N4', title: '学校[がっこう]と茶道部[さどうぶ]', titleEn: 'School and the tea ceremony club',
      lines: [
        { ja: '日本語[にほんご]学校[がっこう]に入[はい]ったトムは、ひらがなとカタカナがぜんぶ読[よ]めます。',
          en: 'Tom has started at a Japanese language school, and he can read all the hiragana and katakana.',
          b: 'potential', hl: '読[よ]めます', wrong: ['nakereba-naranai', 'ta-koto-ga-aru', 'te-miru'],
          note: 'With the potential form, what you can do often takes が instead of を: カタカナが読めます.' },
        { ja: 'でも、漢字[かんじ]はまだあまり書[か]けません。',
          en: 'But he still can’t write kanji very well.',
          b: 'potential-neg', hl: '書[か]けません', wrong: ['nakute-mo-ii', 'te-wa-ikenai', 'te-shimau'] },
        { ja: '来週[らいしゅう]漢字[かんじ]のテストがあるので、毎日[まいにち]練習[れんしゅう]しなければなりません。',
          en: 'There’s a kanji test next week, so he has to practise every day.',
          b: 'nakereba-naranai', hl: '練習[れんしゅう]しなければなりません', wrong: ['nakute-mo-ii', 'te-oku', 'ta-koto-ga-aru'] },
        { ja: '先生[せんせい]は「書[か]き順[じゅん]は、まだ覚[おぼ]えなくてもいいですよ」と言[い]いました。',
          en: 'The teacher said, “You don’t have to learn the stroke order yet.”',
          b: 'nakute-mo-ii', hl: '覚[おぼ]えなくてもいいです', wrong: ['nakereba-naranai', 'te-wa-ikenai', 'potential-neg'],
          note: '書き順: the order in which a kanji’s strokes are written.' },
        { ja: '放課後[ほうかご]、トムは茶道部[さどうぶ]に行[い]きましたが、抹茶[まっちゃ]は一度[いちど]も飲[の]んだことがありませんでした。',
          en: 'After school Tom went to the tea ceremony club, but he had never once drunk matcha.',
          b: 'ta-koto-ga-aru', hl: '飲[の]んだことがありませんでした', wrong: ['te-shimau', 'te-miru', 'potential-neg'],
          note: 'In the negative it’s “have never done”; 一度も (with a negative) makes it “not even once”.' },
        { ja: 'それで、先輩[せんぱい]に「ぼくにも一杯[いっぱい]飲[の]ませてください」と頼[たの]みました。',
          en: 'So he asked one of the older students, “Please let me have a cup too.”',
          b: 'sasete-kudasai', hl: '飲[の]ませてください', wrong: ['te-kudasai', 'te-mo-ii', 'ta-koto-ga-aru'],
          note: '先輩: a student (or colleague) who started before you.' },
        { ja: '一口[ひとくち]飲[の]んでみると、少[すこ]し苦[にが]かったですが、おいしかったです。',
          en: 'When he tried a sip, it was a little bitter, but good.',
          b: 'te-miru', hl: '飲[の]んでみる', wrong: ['te-shimau', 'te-oku', 'te-kuru'],
          note: '〜てみると “when I tried doing…”: what you found out by trying comes next.' },
        { ja: 'でも、正座[せいざ]で足[あし]がしびれて、立[た]つときに転[ころ]んでしまいました。',
          en: 'But his legs went numb from kneeling, and he fell over when he stood up.',
          b: 'te-shimau', hl: '転[ころ]んでしまいました', wrong: ['te-miru', 'te-oku', 'ta-koto-ga-aru'],
          note: '正座: kneeling with your legs folded under you, the formal way to sit on tatami.' },
        { ja: '先輩[せんぱい]は「次[つぎ]の練習[れんしゅう]の前[まえ]に、家[いえ]で正座[せいざ]に慣[な]れておいてね」と笑[わら]いました。',
          en: 'The older student laughed: “Get used to kneeling at home before the next practice, OK?”',
          b: 'te-oku', hl: '慣[な]れておいて', wrong: ['te-miru', 'te-shimau', 'nakute-mo-ii'],
          note: '〜ておいて(ね): the て-form on its own as a friendly request. 〜に慣れる “get used to”.' },
      ],
    },
    {
      id: 'n4-festival', level: 'N4', title: '夏祭[なつまつ]り', titleEn: 'The summer festival',
      lines: [
        { ja: '八月[はちがつ]、トムはゆきさんと近所[きんじょ]の夏祭[なつまつ]りに行[い]こうと思[おも]っていました。',
          en: 'In August, Tom was thinking of going to the local summer festival with Yuki.',
          b: 'volitional-to-omou', hl: '行[い]こうと思[おも]っていました', wrong: ['te-kuru', 'kamoshirenai', 'hou-ga-ii'] },
        { ja: 'ゆきさんは「トムさんに浴衣[ゆかた]を着[き]てほしいな」と言[い]いました。',
          en: 'Yuki said, “I’d love you to wear a yukata, Tom.”',
          b: 'te-hoshii', hl: '着[き]てほしい', wrong: ['tai', 'sasete-kudasai', 'te-mimashou'],
          note: 'The person you want to do it takes に: トムさんに着てほしい. 浴衣 is a light summer kimono.' },
        { ja: 'お母[かあ]さんは「じゃあ、お父[とう]さんの浴衣[ゆかた]を着[き]てみましょう」と言[い]いました。',
          en: 'His host mother said, “Well then, let’s try Dad’s yukata on.”',
          b: 'te-mimashou', hl: '着[き]てみましょう', wrong: ['te-kuru', 'te-hoshii', 'hou-ga-ii'] },
        { ja: '「夜[よる]は人[ひと]が多[おお]いから、早[はや]めに行[い]った方[ほう]がいいよ」とお父[とう]さんが言[い]いました。',
          en: '“It gets crowded at night, so you’d better go early,” said his host father.',
          b: 'hou-ga-ii', hl: '行[い]った方[ほう]がいい', wrong: ['kamoshirenai', 'te-kuru', 'te-mimashou'],
          note: '早め “a bit early”: 〜め after an adjective stem means “on the … side”.' },
        { ja: '天気[てんき]予報[よほう]によると、夕方[ゆうがた]から雨[あめ]が降[ふ]るかもしれません。',
          en: 'According to the weather forecast, it might rain from the evening.',
          b: 'kamoshirenai', hl: '降[ふ]るかもしれません', wrong: ['volitional-to-omou', 'hou-ga-ii', 'tsumori'],
          note: '〜によると “according to”: where the news comes from.' },
        { ja: 'トムは「コンビニで傘[かさ]を買[か]ってきます」と言[い]って、出[で]かけました。',
          en: 'Tom said, “I’ll just go and buy an umbrella at the convenience store,” and went out.',
          b: 'te-kuru', hl: '買[か]ってきます', wrong: ['te-miru', 'tsumori', 'te-hoshii'] },
        { ja: 'お祭[まつ]りに着[つ]いたら、もう人[ひと]がたくさんいました。',
          en: 'When they got to the festival, there were already lots of people.',
          b: 'tara', hl: '着[つ]いたら', wrong: ['nagara', 'te-mimashou', 'mae-ni'],
          note: 'With a past sentence after it, 〜たら tells what you found when you did something.' },
        { ja: '二人[ふたり]は焼[や]きそばを食[た]べながら、花火[はなび]を見[み]ました。',
          en: 'The two of them watched the fireworks while eating yakisoba.',
          b: 'nagara', hl: '食[た]べながら', wrong: ['te-kara', 'mae-ni', 'tara'] },
        { ja: 'トムは「来年[らいねん]もこのお祭[まつ]りに来[く]るつもりです」と言[い]いました。',
          en: 'Tom said, “I intend to come to this festival next year too.”',
          b: 'tsumori', hl: '来[く]るつもりです', wrong: ['kamoshirenai', 'te-kuru', 'hou-ga-ii'] },
      ],
    },
    {
      id: 'n4-cold', level: 'N4', title: 'かぜをひいた週[しゅう]', titleEn: 'The week of the cold',
      lines: [
        { ja: 'お祭[まつ]りの夜[よる]、トムは雨[あめ]の中[なか]で遊[あそ]びすぎて、かぜをひいてしまいました。',
          en: 'On the night of the festival, Tom stayed out playing in the rain too long and caught a cold.',
          b: 'sugiru', hl: '遊[あそ]びすぎて', wrong: ['hajimeru', 'te-morau', 'ba-yokatta'],
          note: 'かぜをひく “catch a cold”.' },
        { ja: '「傘[かさ]を使[つか]えばよかった」とトムは思[おも]いました。',
          en: '“I wish I’d used the umbrella,” Tom thought.',
          b: 'ba-yokatta', hl: '使[つか]えばよかった', wrong: ['hou-ga-ii', 'tara', 'te-ageru'] },
        { ja: 'ゆきさんが、おかゆを作[つく]ってくれました。',
          en: 'Yuki made him rice porridge.',
          b: 'te-kureru', hl: '作[つく]ってくれました', wrong: ['te-ageru', 'passive', 'sugiru'],
          note: 'おかゆ: soft rice porridge, what you eat in Japan when you’re ill.' },
        { ja: 'お母[かあ]さんには、病院[びょういん]に連[つ]れていってもらいました。',
          en: 'He had his host mother take him to the hospital.',
          b: 'te-morau', hl: '連[つ]れていってもらいました', wrong: ['te-ageru', 'passive', 'hajimeru'],
          note: '連れていく “take (someone) along”. The person who does the favour takes に.' },
        { ja: '病院[びょういん]の待合室[まちあいしつ]で、となりの子[こ]どもに足[あし]を踏[ふ]まれました。',
          en: 'In the hospital waiting room, the child next to him stepped on his foot.',
          b: 'passive', hl: '踏[ふ]まれました', wrong: ['te-morau', 'te-kureru', 'potential'],
          note: '踏まれる is the passive of 踏む; the potential would be 踏める.' },
        { ja: '家[いえ]に帰[かえ]ると、ゆきさんが「宿題[しゅくだい]を手伝[てつだ]ってあげましょうか」と聞[き]きました。',
          en: 'When he got home, Yuki asked, “Shall I help you with your homework?”',
          b: 'te-ageru', hl: '手伝[てつだ]ってあげましょうか', wrong: ['te-kureru', 'te-mimashou', 'masen-ka'] },
        { ja: 'かぜが治[なお]ってから、トムは毎朝[まいあさ]公園[こうえん]を走[はし]り始[はじ]めました。',
          en: 'After his cold got better, Tom started running in the park every morning.',
          b: 'hajimeru', hl: '走[はし]り始[はじ]めました', wrong: ['you-ni-naru', 'sugiru', 'ba-yokatta'] },
        { ja: '一[いっ]か月後[げつご]には、5キロ走[はし]れるようになりました。',
          en: 'A month later, he could run five kilometres.',
          b: 'you-ni-naru', hl: '走[はし]れるようになりました', wrong: ['hajimeru', 'sugiru', 'te-kureru'],
          note: 'The potential 走れる + ようになりました: something you couldn’t do before and now can.' },
      ],
    },

    // ─── N3 ──────────────────────────────────────────────────────────────────
    {
      id: 'n3-ramen', level: 'N3', title: 'ラーメン屋[や]のアルバイト', titleEn: 'A part-time job at a ramen shop',
      lines: [
        { ja: '秋[あき]になって、トムは駅前[えきまえ]のラーメン屋[や]でアルバイトをすることにした。',
          en: 'When autumn came, Tom decided to take a part-time job at a ramen shop by the station.',
          b: 'koto-ni-suru', hl: 'することにした', wrong: ['you-ni-suru', 'you-to-suru', 'beki'],
          note: 'From here the story is in plain newspaper-style Japanese: 〜ことにした is the plain form of 〜ことにしました.' },
        { ja: '最初[さいしょ]の一週間[いっしゅうかん]は、店長[てんちょう]に毎日[まいにち]三時間[さんじかん]も皿洗[さらあら]いをさせられた。',
          en: 'For the first week, the manager made him wash dishes for three hours every day.',
          b: 'causative-passive', hl: '皿洗[さらあら]いをさせられた', wrong: ['passive', 'te-morau', 'koto-ni-suru'],
          note: 'The person who makes you do it takes に (店長に). 三時間も: も after a number stresses how much.' },
        { ja: '大変[たいへん]だったが、自分[じぶん]で決[き]めた仕事[しごと]なので、すぐにやめるわけにはいかない。',
          en: 'It was hard, but it was a job he had chosen himself, so he couldn’t possibly quit straight away.',
          b: 'wake-ni-wa-ikanai', hl: 'やめるわけにはいかない', wrong: ['koto-wa-nai', 'beki', 'you-to-suru'] },
        { ja: 'それからトムは、お客[きゃく]さんの名前[なまえ]と好[す]きなラーメンを覚[おぼ]えるようにしている。',
          en: 'Since then, Tom has made a point of remembering the customers’ names and their favourite ramen.',
          b: 'you-ni-suru', hl: '覚[おぼ]えるようにしている', wrong: ['you-ni-naru', 'koto-ni-suru', 'te-bakari'] },
        { ja: 'ところが最近[さいきん]は、仕事[しごと]が終[お]わると、スマホでゲームをしてばかりいる。',
          en: 'Lately, though, once work is over he does nothing but play games on his phone.',
          b: 'te-bakari', hl: 'してばかりいる', wrong: ['te-iru', 'you-ni-suru', 'zuni'] },
        { ja: 'ある晩[ばん]は、宿題[しゅくだい]をせずに寝[ね]てしまった。',
          en: 'One night he even went to sleep without doing his homework.',
          b: 'zuni', hl: 'せずに', wrong: ['nagara', 'te-bakari', 'koto-wa-nai'],
          note: 'する → せずに. 寝てしまった: he went to sleep, and regrets it.' },
        { ja: 'ゆきさんに「留学生[りゅうがくせい]なんだから、もっと勉強[べんきょう]するべきだよ」と言[い]われた。',
          en: 'Yuki told him, “You’re here to study, so you really ought to study more.”',
          b: 'beki', hl: '勉強[べんきょう]するべきだ', wrong: ['koto-ni-suru', 'wake-ni-wa-ikanai', 'koto-wa-nai'],
          note: '言われた: the passive of 言う, “was told”. 留学生 is a student studying abroad.' },
        { ja: '次[つぎ]の朝[あさ]、トムは六時[ろくじ]に起[お]きようとしたが、なかなか起[お]きられなかった。',
          en: 'The next morning, Tom tried to get up at six, but he just couldn’t.',
          b: 'you-to-suru', hl: '起[お]きようとした', wrong: ['te-miru', 'koto-ni-suru', 'you-ni-suru'],
          note: '〜てみる is trying something out to see how it is; 〜ようとする is attempting it, often without success.' },
        { ja: 'ゆきさんは「そんなに心配[しんぱい]することはないよ。少[すこ]しずつでいいんだから」と笑[わら]った。',
          en: 'Yuki laughed: “There’s no need to worry so much. A little at a time is fine.”',
          b: 'koto-wa-nai', hl: '心配[しんぱい]することはない', wrong: ['wake-ni-wa-ikanai', 'beki', 'te-bakari'] },
        { ja: 'トムは、春[はる]までに漢字[かんじ]を五百字[ごひゃくじ]覚[おぼ]えるつもりだ。',
          en: 'Tom intends to learn five hundred kanji by spring.',
          b: 'tsumori', hl: '覚[おぼ]えるつもりだ', wrong: ['you-ni-suru', 'te-bakari', 'beki'],
          note: '〜つもりだ is the plain form of 〜つもりです. までに “by (a deadline)”.' },
      ],
    },
  ];

  const api = { CHAPTERS, CLOSE };
  global.BUNKEI_STORY = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
