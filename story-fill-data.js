(function (global) {
  'use strict';

  // 文章の文法 — JLPT-style "fill in the passage" practice (story-fill.html).
  // A longer text has numbered blanks; each blank has four choices, as in the
  // JLPT grammar section. Every blank comes with an explanation of why the
  // answer fits and the others don't.
  //
  //   paragraphs  the text; {1}, {2}… mark the blanks, in order
  //   blanks      one per blank: choices (four), answer (index), why
  //   en          an English translation, one string per paragraph
  //
  // Text uses inline `kanji[reading]` furigana markup. N5 passages keep the
  // spaces between words, as the N5 test does; N4 and N3 passages don't.
  // test_story_fill.js checks the shape of every passage.
  global.STORY_FILL_PASSAGES = [
    // ─── N5 ──────────────────────────────────────────────────────────────────
    {
      id: 'n5-sea', level: 'N5', title: '海[うみ]へ 行[い]きました', titleEn: 'A trip to the sea',
      paragraphs: [
        'わたしは 先週[せんしゅう]の 土曜日[どようび]、友達[ともだち]と 海へ 行きました。朝[あさ] 早[はや]く 起[お]きて、電車[でんしゃ]{1} 行きました。海は とても きれいでした。わたしたちは 海で 泳[およ]ぎました。{2}、お昼[ひる]ごはんを 食[た]べました。友達{3} 作[つく]った おにぎりは とても おいしかったです。',
        '午後[ごご]は 雨[あめ]が ふりました。{4}、少[すこ]し 早く 帰[かえ]りました。とても 楽[たの]しかったです。また 友達と 海へ {5}。',
      ],
      blanks: [
        { choices: ['で', 'に', 'を', 'へ'], answer: 0,
          why: 'で marks the means of transport: 電車で行く “go by train”. に would be the train as a place you get on (電車に乗る), and へ marks a destination.' },
        { choices: ['それから', 'でも', 'だから', 'じゃあ'], answer: 0,
          why: 'それから means “and then”: first we swam, then we ate lunch. でも (“but”) and だから (“so”) don’t fit — eating isn’t a contrast with, or a result of, swimming.' },
        { choices: ['が', 'を', 'で', 'へ'], answer: 0,
          why: '友達が作った describes おにぎり (“the rice balls my friend made”). Inside a describing clause, the person who does the action takes が.' },
        { choices: ['だから', 'でも', 'それから', 'そして'], answer: 0,
          why: 'It rained, and because of that we went home early — a reason and its result, so だから (“so”). でも would mean the opposite of what you expect.' },
        { choices: ['行きたいです', '行きました', '行っています', '行きませんでした'], answer: 0,
          why: 'また (“again”) looks ahead, and the writer had fun, so it’s a wish: 行きたいです “I want to go”. The past forms describe something that already happened.' },
      ],
      en: [
        'Last Saturday I went to the sea with a friend. We got up early and went by train. The sea was very beautiful. We swam in the sea. Then we ate lunch. The rice balls my friend made were really tasty.',
        'In the afternoon it rained, so we went home a little early. It was a lot of fun. I want to go to the sea with my friend again.',
      ],
    },
    {
      id: 'n5-my-town', level: 'N5', title: 'わたしの 町[まち]', titleEn: 'My town',
      paragraphs: [
        'わたしは 今[いま]、東京[とうきょう]に 住[す]んで います。わたしの アパートは 駅[えき]{1} 近[ちか]いです。歩[ある]いて 五分[ごふん]ぐらいです。駅の 前[まえ]には スーパーや 本屋[ほんや]が あります。スーパーは 夜[よる] 十時[じゅうじ]{2} 開[あ]いて いますから、とても 便利[べんり]です。',
        'でも、わたしの 町には 公園[こうえん]が {3}。わたしは 公園を さんぽするのが 好[す]きですから、少[すこ]し ざんねんです。日曜日[にちようび]は 電車[でんしゃ]に 乗[の]って、となりの 町の 大[おお]きい 公園へ 行[い]きます。そこで 本を 読[よ]んだり、写真[しゃしん]を {4} します。',
      ],
      blanks: [
        { choices: ['から', 'まで', 'で', 'を'], answer: 0,
          why: '“Close to X” is Xから近い — distance is measured from the station. まで would be “up to”, which doesn’t go with 近い.' },
        { choices: ['まで', 'までに', 'から', 'ごろ'], answer: 0,
          why: 'まで means “until”: the shop stays open until 10 p.m. までに is a deadline (“by 10”) and goes with a one-time action, not with 開いている.' },
        { choices: ['ありません', 'あります', 'いません', 'いました'], answer: 0,
          why: 'でも and ざんねん (“a pity”) tell you there is no park. Things that don’t move, like parks, use ある, so ありません. いる is for people and animals.' },
        { choices: ['とったり', 'とって', 'とる', 'とりました'], answer: 0,
          why: '〜たり〜たりする lists examples of things you do: 読んだり、とったりします. The first verb already has たり, so the second one needs it too.' },
      ],
      en: [
        'I live in Tokyo now. My apartment is close to the station — about five minutes on foot. In front of the station there are supermarkets, bookshops and so on. The supermarket is open until ten at night, so it’s very convenient.',
        'But there is no park in my town. I like walking in parks, so that’s a bit of a pity. On Sundays I take the train to a big park in the next town. There I do things like read books and take photos.',
      ],
    },
    {
      id: 'n5-letter-teacher', level: 'N5', title: '先生[せんせい]への 手紙[てがみ]', titleEn: 'A letter to my teacher',
      paragraphs: [
        '田中[たなか]先生、お元気[げんき]ですか。わたしは 元気です。',
        'わたしは 先月[せんげつ] 国[くに]へ 帰[かえ]りました。今[いま]は 父[ちち]の 会社[かいしゃ]で {1}。毎日[まいにち] 忙[いそが]しいですが、楽[たの]しいです。',
        '日本[にほん]に いた とき、先生は いつも やさしく 日本語[にほんご]を 教[おし]えて {2}。本当[ほんとう]に ありがとうございました。',
        '来年[らいねん]の 春[はる]、仕事[しごと]で 日本へ 行[い]きます。{3} とき、先生に 会[あ]いたいです。先生も ぜひ わたしの 国へ 遊[あそ]びに 来[き]て {4}。',
      ],
      blanks: [
        { choices: ['はたらいて います', 'はたらきました', 'はたらきたいです', 'はたらきませんでした'], answer: 0,
          why: '今は (“now”) and 毎日忙しい show it’s happening now and every day: はたらいています “I am working”.' },
        { choices: ['くれました', 'あげました', 'もらいました', 'いました'], answer: 0,
          why: 'The teacher did something kind for the writer: 〜てくれる. あげる is doing something for someone else; もらう would need 先生に, not 先生は.' },
        { choices: ['その', 'この', 'あの', 'どの'], answer: 0,
          why: 'その points back to something just mentioned in the text — the trip next spring: そのとき “at that time”.' },
        { choices: ['ください', 'います', 'ありません', 'しまいます'], answer: 0,
          why: 'ぜひ (“by all means”) goes with a request or wish: 来てください “please come”.' },
      ],
      en: [
        'Dear Mr. Tanaka, how are you? I’m well.',
        'I went back to my country last month. Now I work at my father’s company. I’m busy every day, but it’s fun.',
        'When I was in Japan, you always taught me Japanese so kindly. Thank you very much.',
        'Next spring I’m coming to Japan for work. I’d like to see you then. Please do come and visit my country too.',
      ],
    },

    // ─── N4 ──────────────────────────────────────────────────────────────────
    {
      id: 'n4-trains', level: 'N4', title: '日本[にほん]の電車[でんしゃ]', titleEn: 'Japanese trains',
      paragraphs: [
        '日本に来[き]て、いちばんおどろいたのは電車です。日本の電車は時間[じかん]{1}来ます。わたしの国[くに]では、電車が十分[じゅっぷん]や二十分[にじゅっぷん]遅[おく]れるのはめずらしくありません。',
        '{2}、朝[あさ]の電車はとても込[こ]んでいます。はじめて乗[の]ったとき、人[ひと]が多[おお]すぎて、降[お]りる駅[えき]で降り{3}。それからは、少[すこ]し早[はや]く家[いえ]を出[で]るようにしています。',
        'また、電車の中[なか]で電話[でんわ]をしている人はほとんどいません。日本では、電車の中で電話を{4}と言[い]われているからです。静[しず]かなので、本を読[よ]むのにちょうどいいです。',
      ],
      blanks: [
        { choices: ['どおりに', 'までに', 'ように', 'ために'], answer: 0,
          why: '時間どおりに means “on time, exactly as scheduled”. Noun + どおりに is “in line with ~”. までに is a deadline and ために a purpose.' },
        { choices: ['でも', 'だから', 'それに', 'たとえば'], answer: 0,
          why: 'The first paragraph praises the trains; this one points out a problem. A turn from good to bad needs でも (“however”). それに adds more of the same.' },
        { choices: ['られませんでした', 'させました', 'ておきました', 'たがりました'], answer: 0,
          why: 'There were too many people, so the writer couldn’t get off: the potential form 降りられませんでした. The others mean “made someone get off”, “got off in advance” and “wanted to get off”.' },
        { choices: ['しないほうがいい', 'したほうがいい', 'しなければならない', 'してもいい'], answer: 0,
          why: 'Hardly anyone phones on trains because people say you’d better not: 〜ないほうがいい. Every other choice would mean phoning is fine or even required.' },
      ],
      en: [
        'What surprised me most when I came to Japan was the trains. Japanese trains come exactly on time. In my country, it isn’t unusual for a train to be ten or twenty minutes late.',
        'However, the morning trains are very crowded. The first time I rode one, there were so many people that I couldn’t get off at my station. Since then I make a point of leaving home a bit earlier.',
        'Also, almost nobody talks on the phone on the train, because in Japan it’s said you’d better not make calls on trains. It’s quiet, so it’s just right for reading.',
      ],
    },
    {
      id: 'n4-bakery', level: 'N4', title: 'パン屋[や]のアルバイト', titleEn: 'My part-time job at a bakery',
      paragraphs: [
        'わたしは先月[せんげつ]から、駅前[えきまえ]のパン屋でアルバイトをしています。毎週[まいしゅう]土曜日[どようび]と日曜日[にちようび]の朝[あさ]六時[ろくじ]から働[はたら]きます。朝早[はや]く起[お]きるのは大変[たいへん]ですが、焼[や]きたてのパンのにおいがする店[みせ]で働くのは楽[たの]しいです。',
        'はじめは、パンの名前[なまえ]がなかなか{1}。店には五十[ごじゅう]種類[しゅるい]以上[いじょう]のパンがあるからです。店長[てんちょう]が「メモを作[つく]ったらどう？」と言[い]って{2}ので、ノートに全部[ぜんぶ]書[か]いて、毎晩[まいばん]読[よ]みました。{3}、今[いま]はほとんど覚[おぼ]えました。',
        '来月[らいげつ]から、店長がパンの作り方[かた]も教[おし]えてくれる{4}です。とても楽しみです。',
      ],
      blanks: [
        { choices: ['覚[おぼ]えられませんでした', '覚えさせました', '覚えていました', '覚えたがりました'], answer: 0,
          why: 'なかなか + negative means “just couldn’t”, and the next sentence gives the reason (over 50 kinds), so the potential negative 覚えられませんでした.' },
        { choices: ['くれた', 'あげた', 'みた', 'おいた'], answer: 0,
          why: 'The manager gave the writer advice — a favour done for the writer, so 〜てくれた. あげた would mean the writer did the favour.' },
        { choices: ['そのおかげで', 'それなのに', 'ところが', 'それとも'], answer: 0,
          why: 'Reading the notes every night led to a good result: そのおかげで (“thanks to that”). それなのに and ところが introduce an unexpected result; それとも means “or”.' },
        { choices: ['そう', 'ため', 'つもり', 'ところ'], answer: 0,
          why: 'Plain form + そうです reports what you’ve been told: “I hear the manager will teach me”. つもり is only for your own plans, and ところ is “just about to”, which doesn’t fit next month.' },
      ],
      en: [
        'Since last month I’ve had a part-time job at the bakery in front of the station. I work every Saturday and Sunday from six in the morning. Getting up early is hard, but working in a shop that smells of fresh bread is fun.',
        'At first I just couldn’t remember the names of the breads, because the shop has more than fifty kinds. The manager said, “Why not make notes?”, so I wrote them all down in a notebook and read it every night. Thanks to that, I now know nearly all of them.',
        'I hear that from next month the manager will also teach me how to make the bread. I’m really looking forward to it.',
      ],
    },
    {
      id: 'n4-umbrella', level: 'N4', title: 'わすれ物[もの]', titleEn: 'The lost umbrella',
      paragraphs: [
        'きのう、大切[たいせつ]なかさを電車[でんしゃ]にわすれてしまいました。祖母[そぼ]にもらったかさです。駅[えき]の人[ひと]に話[はな]すと、「調[しら]べてみます{1}、少[すこ]し待[ま]ってください」と言[い]われました。',
        '三十分[さんじゅっぷん]ぐらい待ちましたが、かさは見[み]つかりませんでした。駅の人は「見つかったら、電話[でんわ]を{2}」と言って、わたしの電話番号[でんわばんごう]を聞[き]きました。',
        '今朝[けさ]、駅から電話がありました。終点[しゅうてん]の駅で、だれかがかさを届[とど]けてくれた{3}。わたしはすぐ取[と]りに行[い]きました。届けてくれた人にお礼[れい]を言いたかったですが、名前[なまえ]はわかりませんでした。これからは、電車を降[お]りる{4}、わすれ物がないか確認[かくにん]するようにします。',
      ],
      blanks: [
        { choices: ['から', 'のに', 'まで', 'ても'], answer: 0,
          why: 'から gives the reason for the request: “I’ll check, so please wait a moment.” のに (“even though”) and ても (“even if”) set up a contrast that isn’t there.' },
        { choices: ['します', 'しました', 'していました', 'しません'], answer: 0,
          why: '見つかったら (“if it’s found”) is about the future, so the promise is in the non-past: 電話をします “we’ll call you”.' },
        { choices: ['そうです', 'ようにします', 'はずでした', 'つもりです'], answer: 0,
          why: 'The writer is passing on what the station told them on the phone: plain form + そうです, “apparently someone handed it in”.' },
        { choices: ['前[まえ]に', '後[あと]で', 'あいだに', 'ながら'], answer: 0,
          why: 'You check for things you’ve forgotten before you get off: dictionary form + 前に. After getting off (後で) would be too late — and 後で needs the た-form.' },
      ],
      en: [
        'Yesterday I left an umbrella that’s precious to me on the train. It’s an umbrella my grandmother gave me. When I told the station staff, they said, “We’ll check, so please wait a moment.”',
        'I waited about thirty minutes, but the umbrella wasn’t found. The station staff said, “If we find it, we’ll call you,” and asked for my phone number.',
        'This morning the station called. Apparently someone handed the umbrella in at the last station on the line. I went to collect it right away. I wanted to thank the person who handed it in, but I couldn’t find out their name. From now on, I’ll make sure I check I haven’t forgotten anything before getting off the train.',
      ],
    },

    // ─── N3 ──────────────────────────────────────────────────────────────────
    {
      id: 'n3-phone-sleep', level: 'N3', title: 'スマートフォンと睡眠[すいみん]', titleEn: 'Smartphones and sleep',
      paragraphs: [
        '最近[さいきん]、寝[ね]る前[まえ]にスマートフォンを見[み]る人[ひと]が増[ふ]えている。ある調査[ちょうさ]{1}、二十代[にじゅうだい]の八割[はちわり]以上[いじょう]が、ベッドの中[なか]でスマートフォンを使[つか]っているという。',
        'しかし、寝る直前[ちょくぜん]に明[あか]るい画面[がめん]を見ると、なかなか眠[ねむ]れなくなると言[い]われている。わたしも以前[いぜん]は毎晩[まいばん]動画[どうが]を見ていて、気[き]がつくと二時[にじ]{2}こともよくあった。{3}、朝[あさ]起[お]きられず、授業[じゅぎょう]に遅[おく]れてしまうことも多[おお]かった。',
        'そこで半年前[はんとしまえ]から、スマートフォンを寝室[しんしつ]に持[も]ち込[こ]まないことにした。はじめは不安[ふあん]だったが、慣[な]れてみると、早[はや]く眠れるようになった{4}、朝の時間[じかん]を有効[ゆうこう]に使えるようになった。便利[べんり]な道具[どうぐ]だからこそ、使い方[かた]を自分[じぶん]で決[き]めることが大切[たいせつ]{5}。',
      ],
      blanks: [
        { choices: ['によると', 'について', 'に対[たい]して', 'にとって'], answer: 0,
          why: '〜によると (“according to”) names the source of information, and it pairs with という (“it is said”) at the end of the sentence. について is “about”, に対して “towards / in contrast to”, にとって “for (someone)”.' },
        { choices: ['を過[す]ぎていた', 'に過ぎない', 'までだった', 'ばかりだった'], answer: 0,
          why: '気がつくと〜ていた describes suddenly noticing a situation: “before I knew it, it was past two”. 〜に過ぎない means “is nothing more than”.' },
        { choices: ['その結果[けっか]', 'それなのに', 'ところで', 'なぜなら'], answer: 0,
          why: 'Staying up until two led to oversleeping — a cause and its consequence: その結果 (“as a result”). ところで changes the subject; なぜなら gives a reason, which would have to come after the result.' },
        { choices: ['だけでなく', 'かわりに', 'わりに', 'くせに'], answer: 0,
          why: 'Two good results are listed: falling asleep sooner and using mornings well. 〜だけでなく means “not only … but also”. かわりに is “instead of”, わりに “considering”, and くせに a complaint (“even though”).' },
        { choices: ['なのではないだろうか', 'なわけがない', 'にすぎない', 'とはかぎらない'], answer: 0,
          why: 'The writer’s conclusion is that deciding for yourself is important. 〜のではないだろうか (“isn’t it the case that…?”) is a soft way to state an opinion in essays. The other three all deny or play down the importance.' },
      ],
      en: [
        'Recently, more and more people look at their smartphones before going to sleep. According to one survey, more than 80 percent of people in their twenties use their smartphones in bed.',
        'However, it’s said that looking at a bright screen right before bed makes it hard to fall asleep. I used to watch videos every night too, and often, before I knew it, it was past two. As a result, I often couldn’t get up in the morning and was late for class.',
        'So half a year ago I decided not to take my smartphone into the bedroom. At first I felt uneasy, but once I got used to it, not only did I start falling asleep sooner, I also started making good use of my mornings. Precisely because it is such a convenient tool, isn’t it important to decide for yourself how to use it?',
      ],
    },
    {
      id: 'n3-solo-trip', level: 'N3', title: '一人旅[ひとりたび]', titleEn: 'Travelling alone',
      paragraphs: [
        'わたしは去年[きょねん]、初[はじ]めて一人で旅行[りょこう]をした。それまでは、いつも家族[かぞく]や友達[ともだち]と一緒[いっしょ]だったので、一人で行く{1}、少[すこ]しこわかった。',
        '行き先[さき]は北海道[ほっかいどう]の小[ちい]さな町[まち]だった。バスを待[ま]っていると、近[ちか]くにいたおばあさんが話[はな]しかけてきた。わたしが一人で東京[とうきょう]から来[き]たと言[い]うと、おばあさんは「若[わか]いのにえらいね」と言って、町のおいしい店[みせ]を{2}。',
        'もし友達と一緒だったら、きっと友達とばかり話していて、おばあさんと話すことは{3}だろう。一人だったからこそ、町の人と知[し]り合[あ]うことができたのだ。',
        '{4}、一人旅にも大変[たいへん]なことはある。道[みち]に迷[まよ]っても、だれにも相談[そうだん]できない。{5}、そういう経験[けいけん]も含[ふく]めて、一人旅はわたしにとって忘[わす]れられない思い出[おもいで]になった。',
      ],
      blanks: [
        { choices: ['と思[おも]うと', 'ばかりで', 'わけで', 'うちに'], answer: 0,
          why: '〜と思うと means “when I thought about ~”: thinking about going alone made the writer nervous. うちに is “while”, and ばかりで / わけで don’t connect a thought to a feeling.' },
        { choices: ['教[おし]えてくれた', '教えてあげた', '教わった', '教えさせた'], answer: 0,
          why: 'The old woman is the subject (おばあさんは) and she did the writer a favour: 教えてくれた. 教わった would mean she was the one being taught.' },
        { choices: ['なかった', 'あった', 'できた', 'した'], answer: 0,
          why: 'もし〜だったら … だろう imagines what would have happened: with a friend, the writer “would not have” talked to her — 話すことはなかっただろう. The next sentence (only because I was alone…) confirms it.' },
        { choices: ['もちろん', 'なぜなら', 'つまり', 'すると'], answer: 0,
          why: 'もちろん (“of course”) admits a point before turning back to the main idea — here, that solo travel has hard sides too. つまり is “in other words” and すると “then / thereupon”.' },
        { choices: ['それでも', 'だから', 'そのうえ', 'たとえば'], answer: 0,
          why: 'Despite the difficulties just mentioned, it became an unforgettable memory: それでも (“even so”). だから would make the difficulties the reason it was a good memory.' },
      ],
      en: [
        'Last year I travelled alone for the first time. Until then I had always been with family or friends, so the thought of going by myself scared me a little.',
        'I went to a small town in Hokkaido. While I was waiting for the bus, an old woman nearby started talking to me. When I told her I’d come from Tokyo by myself, she said, “How admirable, for someone so young,” and told me about the good restaurants in town.',
        'If I had been with a friend, I would surely have talked only to my friend and never to her. It was precisely because I was alone that I got to know people in the town.',
        'Of course, travelling alone has its hard sides too. Even if you get lost, there’s no one to ask. Even so, including experiences like that, travelling alone became an unforgettable memory for me.',
      ],
    },
    {
      id: 'n3-cooking', level: 'N3', title: '料理[りょうり]を始[はじ]めて', titleEn: 'Learning to cook',
      paragraphs: [
        '大学[だいがく]に入[はい]って一人暮[ひとりぐ]らしを始めたとき、わたしはほとんど料理ができなかった。最初[さいしょ]の一か月[いっかげつ]は、毎日[まいにち]コンビニのお弁当[べんとう]{1}食[た]べていた。',
        'ところが、ある日、健康[けんこう]診断[しんだん]で「野菜[やさい]が足[た]りていない」と言[い]われてしまった。それをきっかけ{2}、自分[じぶん]で料理を作[つく]ってみることにした。',
        '最初は失敗[しっぱい]ばかりだった。カレーを作る{3}、水[みず]を入れすぎてスープのようになってしまったこともある。しかし、インターネットで作り方[かた]を調[しら]べたり、母[はは]に電話[でんわ]で聞[き]いたりしているうちに、少[すこ]しずつ上手[じょうず]になってきた。',
        '今[いま]では、友達[ともだち]を家[いえ]に呼[よ]んで料理をふるまうこと{4}ある。料理は面倒[めんどう]だと思[おも]っていたが、やってみると意外[いがい]に楽[たの]しいもの{5}。',
      ],
      blanks: [
        { choices: ['ばかり', 'しか', 'ほど', 'さえ'], answer: 0,
          why: 'Noun + ばかり means “nothing but”: I ate nothing but convenience-store bento. しか means the same but needs a negative verb (しか食べていなかった).' },
        { choices: ['に', 'で', 'を', 'が'], answer: 0,
          why: '〜をきっかけに is a set phrase: “taking ~ as the trigger”. (With が it would be それがきっかけで, but here it’s already それを.)' },
        { choices: ['つもりが', 'ところに', 'ように', 'ために'], answer: 0,
          why: '〜つもりが means “I meant to ~, but…”: I meant to make curry but it turned into soup. ために (“in order to”) would make the soup the goal.' },
        { choices: ['も', 'を', 'しか', 'で'], answer: 0,
          why: '〜こともある means “sometimes I even ~”. も adds this as one more thing the writer now does. しか would need a negative.' },
        { choices: ['だ', 'ではない', 'らしい', 'そうだ'], answer: 0,
          why: '〜ものだ states something you’ve come to realise is generally true: “it turns out cooking is surprisingly fun”. ではない contradicts the essay, らしい is hearsay — but the writer found this out personally — and そうだ can’t follow もの.' },
      ],
      en: [
        'When I started living on my own after entering university, I could hardly cook at all. For the first month I ate nothing but convenience-store bento every day.',
        'But one day, at a health check-up, I was told I wasn’t getting enough vegetables. Taking that as my cue, I decided to try cooking for myself.',
        'At first it was one failure after another. Once I meant to make curry but put in too much water and it turned into something like soup. But as I looked up recipes online and asked my mother over the phone, I gradually got better.',
        'Now I even sometimes invite friends over and cook for them. I used to think cooking was a chore, but once you try it, it’s surprisingly fun.',
      ],
    },
  ];
})(typeof window !== 'undefined' ? window : globalThis);
