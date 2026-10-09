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

    {
      id: 'n5-family', level: 'N5', title: 'わたしの 家族[かぞく]', titleEn: 'My family',
      paragraphs: [
        'わたしの 家族は 四人[よにん]です。父[ちち]と 母[はは]と 姉[あね]と わたしです。父は 銀行[ぎんこう]で はたらいて います。母は 料理[りょうり]が 上手[じょうず]です。毎晩[まいばん] おいしい ごはんを 作[つく]って くれます。',
        '姉は 大学生[だいがくせい]です。英語[えいご]{1} 勉強[べんきょう]して います。姉は わたし{2} 三[みっ]つ 上[うえ]です。とても やさしいです。',
        '週末[しゅうまつ]は 家族で よく 公園[こうえん]へ 行[い]きます。父は テニスが 好[す]きです{3}、わたしは あまり 好きでは ありません。わたしは 公園で 犬[いぬ]と 遊[あそ]ぶ{4} 好きです。',
      ],
      blanks: [
        { choices: ['を', 'が', 'へ', 'と'], answer: 0,
          why: '勉強する takes its subject of study with を: 英語を勉強する “study English”. へ marks a direction and と a partner, neither of which fits.' },
        { choices: ['より', 'ほど', 'まで', 'から'], answer: 0,
          why: 'Comparing ages: Xより三つ上 “three years older than X”. ほど only works with a negative (わたしほど〜ない).' },
        { choices: ['が', 'から', 'ので', 'と'], answer: 0,
          why: 'Father likes tennis, but I don’t — two opposite facts are joined with が (“but”). から and ので would make his liking the reason for mine.' },
        { choices: ['のが', 'のを', 'のに', 'ので'], answer: 0,
          why: 'の turns 犬と遊ぶ into a noun, and 好き marks what you like with が: 遊ぶのが好きです. 好き never takes を.' },
      ],
      en: [
        'There are four people in my family: my father, my mother, my older sister and me. My father works at a bank. My mother is good at cooking. Every evening she makes us delicious dinners.',
        'My sister is a university student. She studies English. She is three years older than me. She is very kind.',
        'At weekends my family often goes to the park. My father likes tennis, but I don’t like it much. I like playing with our dog in the park.',
      ],
    },
    {
      id: 'n5-present', level: 'N5', title: '母[はは]への プレゼント', titleEn: 'A present for my mother',
      paragraphs: [
        'きのう、デパートへ 買[か]い物[もの]に 行[い]きました。母の たんじょう日[び]の プレゼントを 買いたかったからです。',
        'デパートは 人[ひと]が とても 多[おお]かったです。はじめに 一階[いっかい]で かさを 見[み]ました。きれいな かさが ありましたが、少[すこ]し 高[たか]かったです。{1}、二階[にかい]へ 行きました。二階には かばんや ぼうしが ありました。わたしは 青[あお]い ぼうしを 買いました。三千円[さんぜんえん]{2}。',
        '家[いえ]に 帰[かえ]ってから、ぼうしを 母に {3}。母は「ありがとう。とても うれしいです」と 言[い]いました。来年[らいねん]の たんじょう日には 何[なに]を あげ{4}か。今[いま]から 考[かんが]えて います。',
      ],
      blanks: [
        { choices: ['それで', 'でも', 'しかし', 'または'], answer: 0,
          why: 'The umbrella was too expensive, and because of that I went upstairs — a reason and what followed, so それで (“so”). でも and しかし set up a contrast; または means “or”.' },
        { choices: ['でした', 'です', 'ました', 'でしょう'], answer: 0,
          why: 'The whole story is in the past, and a price is a noun, so the polite past of です: 三千円でした. ました only goes on verbs.' },
        { choices: ['あげました', 'もらいました', 'くれました', '買[か]いました'], answer: 0,
          why: 'I gave the hat to my mother: ぼうしを母にあげました. もらいました would mean I received it from her, and くれる is only for things given to me.' },
        { choices: ['ましょう', 'ました', 'ません', 'たい'], answer: 0,
          why: '何を〜ましょうか is “what shall I ~?” — the writer is wondering what to give next year. ました is past, and たい can’t be followed directly by か here.' },
      ],
      en: [
        'Yesterday I went shopping at a department store. I wanted to buy a birthday present for my mother.',
        'The store was very crowded. First I looked at umbrellas on the first floor. There was a pretty one, but it was a little expensive, so I went to the second floor. There were bags and hats there. I bought a blue hat. It was 3,000 yen.',
        'After I got home, I gave the hat to my mother. She said, “Thank you. I’m very happy.” What shall I give her next birthday? I’m already thinking about it.',
      ],
    },
    {
      id: 'n5-class', level: 'N5', title: '日本語[にほんご]の クラス', titleEn: 'My Japanese class',
      paragraphs: [
        'わたしは 毎週[まいしゅう] 火曜日[かようび]と 木曜日[もくようび]に 日本語の クラスへ 行[い]きます。クラスは 夜[よる] 七時[しちじ]{1} 九時[くじ]までです。',
        'クラスには 学生[がくせい]が 十人[じゅうにん] います。アメリカ{2} 中国[ちゅうごく]や タイから 来[き]た 人[ひと]が います。みんな とても いい 人です。',
        '先生[せんせい]は 山本[やまもと]先生です。先生の 話[はなし]は いつも おもしろいです。{3}、漢字[かんじ]の テストは むずかしいです。わたしは 漢字が あまり {4}。もっと 勉強[べんきょう]したいです。',
      ],
      blanks: [
        { choices: ['から', 'まで', 'に', 'で'], answer: 0,
          why: 'A time span is Xから Yまで, “from X to Y”. まで already comes after 九時, so the start needs から.' },
        { choices: ['や', 'を', 'へ', 'で'], answer: 0,
          why: 'や lists a few examples out of more: “people from America, China, Thailand and so on”. The second や after 中国 shows the list is already going.' },
        { choices: ['でも', 'だから', 'そして', 'それから'], answer: 0,
          why: 'The teacher’s talks are fun, but the kanji tests are hard — a contrast, so でも. だから would make the hard tests a result of the fun talks.' },
        { choices: ['わかりません', 'わかります', 'できます', 'すきです'], answer: 0,
          why: 'あまり means “not much” only with a negative verb: あまりわかりません. The next sentence (I want to study more) shows the writer is struggling.' },
      ],
      en: [
        'Every Tuesday and Thursday I go to a Japanese class. The class is from seven to nine in the evening.',
        'There are ten students in the class. There are people from America, China, Thailand and other places. Everyone is very nice.',
        'Our teacher is Ms. Yamamoto. Her talks are always interesting. But the kanji tests are hard. I don’t understand kanji very well. I want to study more.',
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

    {
      id: 'n4-moving', level: 'N4', title: '引[ひ]っ越[こ]し', titleEn: 'Moving house',
      paragraphs: [
        '先月[せんげつ]、新[あたら]しいアパートに引っ越しました。前[まえ]のアパートは駅[えき]から遠[とお]くて、毎朝[まいあさ]バスに乗[の]らなければなりませんでした。今度[こんど]のアパートは、駅まで歩[ある]いて五分[ごふん]{1}かかりません。',
        '引っ越しの日[ひ]は、友達[ともだち]が三人[さんにん]手伝[てつだ]いに来[き]てくれました。荷物[にもつ]が多[おお]かったので、一人[ひとり]では{2}。みんなのおかげで、夕方[ゆうがた]には全部[ぜんぶ]運[はこ]ぶことができました。お礼[れい]に、みんなにピザを{3}。',
        '新しい部屋[へや]は前より少[すこ]し狭[せま]いですが、窓[まど]から海[うみ]が見[み]えます。天気[てんき]がいい日は、窓を開[あ]けて海を見{4}、コーヒーを飲[の]みます。',
      ],
      blanks: [
        { choices: ['しか', 'だけ', 'ぐらい', 'まで'], answer: 0,
          why: 'しか + negative means “only”: 五分しかかかりません “it only takes five minutes”. だけ and ぐらい don’t go with a negative verb this way.' },
        { choices: ['運[はこ]べなかったでしょう', '運べました', '運びたいです', '運んでいます'], answer: 0,
          why: 'There was too much luggage, so on my own I “couldn’t have carried it”: potential negative + でしょう. 運べました contradicts the reason given with ので.' },
        { choices: ['ごちそうしました', 'ごちそうになりました', 'ごちそうしてもらいました', 'いただきました'], answer: 0,
          why: 'As thanks, I treated my friends: ごちそうする. ごちそうになる and the other two mean I was the one being treated.' },
        { choices: ['ながら', 'ても', 'ずに', 'ために'], answer: 0,
          why: 'Stem + ながら: two things at the same time — drinking coffee while looking at the sea. 見ずに would mean “without looking”.' },
      ],
      en: [
        'Last month I moved to a new apartment. My old apartment was far from the station, and I had to take a bus every morning. From the new one, it only takes five minutes to walk to the station.',
        'On moving day, three friends came to help me. There was a lot of luggage, so I couldn’t have carried it on my own. Thanks to everyone, we had moved it all by evening. To thank them, I treated them to pizza.',
        'The new room is a bit smaller than before, but I can see the sea from the window. On sunny days I open the window and drink coffee while looking at the sea.',
      ],
    },
    {
      id: 'n4-exercise', level: 'N4', title: '健康[けんこう]のために', titleEn: 'For my health',
      paragraphs: [
        'わたしは去年[きょねん]まで、ほとんど運動[うんどう]をしませんでした。仕事[しごと]が忙[いそが]しくて、運動する時間[じかん]がなかったからです。',
        'でも、ある日[ひ]、会社[かいしゃ]の階段[かいだん]を上[のぼ]っただけで、とても疲[つか]れてしまいました。それで、毎日[まいにち]少[すこ]しでも運動{1}ことにしました。',
        'まず、エレベーターを使[つか]わないで、階段を使う{2}しました。それから、一[ひと]つ前[まえ]の駅[えき]でバスを降[お]りて、歩[ある]いて帰[かえ]るようにしています。はじめは大変[たいへん]でしたが、今[いま]は階段を上っても、{3}疲れなくなりました。',
        '医者[いしゃ]に「このまま続[つづ]け{4}、もっと元気[げんき]になりますよ」と言[い]われました。これからも続けたいと思[おも]います。',
      ],
      blanks: [
        { choices: ['する', 'した', 'して', 'しよう'], answer: 0,
          why: 'Dictionary form + ことにする means “decide to do”: 運動することにしました. With the た-form it would mean pretending something happened.' },
        { choices: ['ように', 'ために', 'そうに', 'までに'], answer: 0,
          why: '〜ようにする means “make a point of doing”: 階段を使うようにしました. The next sentence uses the same pattern (歩いて帰るようにしています).' },
        { choices: ['あまり', 'とても', 'もっと', 'よく'], answer: 0,
          why: 'あまり + negative is “not very”: あまり疲れなくなりました “I don’t get very tired any more”. とても and もっと go with positive statements.' },
        { choices: ['たら', 'ても', 'のに', 'ながら'], answer: 0,
          why: 'A condition and its result: “if you keep this up, you’ll get even healthier” — 続けたら. ても (“even if”) would undercut the encouragement.' },
      ],
      en: [
        'Until last year I hardly exercised at all. My job kept me busy and I had no time for it.',
        'But one day I got really tired just from climbing the stairs at work. So I decided to exercise every day, even just a little.',
        'First, I started taking the stairs instead of the lift. Then I made a habit of getting off the bus one stop early and walking home. It was hard at first, but now I don’t get very tired even when I climb stairs.',
        'My doctor told me, “If you keep this up, you’ll get even healthier.” I want to keep going.',
      ],
    },
    {
      id: 'n4-invitation', level: 'N4', title: 'パーティーのさそい', titleEn: 'A party invitation',
      paragraphs: [
        'マリアさん、メールありがとう。来週[らいしゅう]の土曜日[どようび]、うちでパーティーをするので、ぜひ来[き]て{1}。',
        'うちは、駅[えき]の北口[きたぐち]を出[で]て、まっすぐ五分[ごふん]ぐらい歩[ある]いたところにあります。コンビニのとなり{2}白[しろ]いマンションです。わからなかったら、電話[でんわ]してください。駅まで迎[むか]えに行[い]きます。',
        'パーティーは六時[ろくじ]からです。料理[りょうり]はわたしが作[つく]るので、何[なに]も持[も]って来なくても{3}。でも、もし時間[じかん]があったら、マリアさんの国[くに]の歌[うた]を教[おし]えてほしいです。みんな楽[たの]しみにしています。',
        '返事[へんじ]は金曜日[きんようび]{4}ください。',
      ],
      blanks: [
        { choices: ['ください', 'います', 'おきます', 'しまいます'], answer: 0,
          why: 'ぜひ (“by all means”) goes with a request: ぜひ来てください “please do come”.' },
        { choices: ['の', 'が', 'を', 'に'], answer: 0,
          why: 'コンビニのとなり (“next to the convenience store”) describes the building, so it joins the noun with の: となりの白いマンション.' },
        { choices: ['いいです', 'いけません', 'なりません', 'かまいませんでした'], answer: 0,
          why: '〜なくてもいいです means “you don’t have to”: since I’m cooking, you don’t need to bring anything. いけません and なりません would make it a rule.' },
        { choices: ['までに', 'まで', 'から', 'ごろ'], answer: 0,
          why: 'までに sets a deadline for a one-time action: “please reply by Friday”. まで is for something that continues until then.' },
      ],
      en: [
        'Maria, thanks for your email. Next Saturday I’m having a party at my place, so please do come.',
        'My place is about five minutes’ walk straight ahead from the north exit of the station. It’s the white apartment building next to the convenience store. If you can’t find it, give me a call and I’ll come to meet you at the station.',
        'The party starts at six. I’m doing the cooking, so you don’t need to bring anything. But if you have time, I’d love you to teach us a song from your country. Everyone’s looking forward to it.',
        'Please reply by Friday.',
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
    {
      id: 'n3-grandfather-field', level: 'N3', title: '祖父[そふ]の畑[はたけ]', titleEn: 'My grandfather’s vegetable field',
      paragraphs: [
        '祖父は、田舎[いなか]で小[ちい]さな畑をやっている。毎年[まいとし]夏[なつ]になると、祖父からたくさんの野菜[やさい]が送[おく]られてくる。トマトやきゅうりは、スーパーで買[か]う{1}ずっと味[あじ]が濃[こ]い。',
        '子[こ]どものころ、わたしは野菜が嫌[きら]いだった。母[はは]がどんなに{2}、トマトだけは食[た]べなかった。ところが、小学生[しょうがくせい]の夏休[なつやす]みに祖父の家[いえ]に泊[と]まったとき、畑でとったばかりのトマトを食べてみると、驚[おどろ]くほどおいしかった。それ{3}、わたしはトマトが大好[だいす]きになった。',
        '祖父はもう八十歳[はっさい]を過[す]ぎているが、「畑仕事[しごと]をしている{4}、元気[げんき]でいられるんだ」と笑[わら]う。今年[ことし]の夏は、わたしも手伝[てつだ]いに行[い]くつもりだ。',
      ],
      blanks: [
        { choices: ['のより', 'ほど', 'だけ', 'ばかり'], answer: 0,
          why: 'A comparison: “much richer in flavour than the ones you buy at the supermarket” — Xのより. ほど would need a negative (〜ほど濃くない).' },
        { choices: ['言[い]っても', '言ったら', '言うと', '言えば'], answer: 0,
          why: 'どんなに〜ても means “no matter how much”: however much Mum told me to, I wouldn’t eat tomatoes. The conditionals たら, と and ば don’t pair with どんなに here.' },
        { choices: ['以来[いらい]', 'までに', 'ばかり', 'ほど'], answer: 0,
          why: 'それ以来 means “ever since then”: from that summer on, the writer loved tomatoes. それまでに would be “by then”.' },
        { choices: ['おかげで', 'せいで', 'くせに', 'わりに'], answer: 0,
          why: 'Farm work is the cause of something good (staying healthy), so おかげで. せいで blames a cause for something bad; くせに is a complaint.' },
      ],
      en: [
        'My grandfather keeps a small vegetable field in the countryside. Every summer he sends us lots of vegetables. His tomatoes and cucumbers taste much richer than the ones from the supermarket.',
        'As a child I hated vegetables. No matter how often my mother told me to, I would never eat tomatoes. But one summer in primary school, when I stayed at my grandfather’s house and tried a tomato just picked from the field, it was amazingly good. Ever since then I’ve loved tomatoes.',
        'My grandfather is over eighty, but he laughs and says, “It’s thanks to working in the field that I can stay healthy.” This summer I’m planning to go and help him too.',
      ],
    },
    {
      id: 'n3-rubbish', level: 'N3', title: 'ごみの分別[ぶんべつ]', titleEn: 'Sorting the rubbish',
      paragraphs: [
        '日本[にほん]に来[き]てまず困[こま]ったのは、ごみの出[だ]し方[かた]だった。わたしの国[くに]では、ほとんどのごみを一[ひと]つの袋[ふくろ]に入[い]れて捨[す]てる。ところが、わたしが住[す]んでいる町[まち]では、ごみを十種類[じゅっしゅるい]以上[いじょう]に分[わ]けなければならない。{1}、燃[も]えるごみは火曜日[かようび]と金曜日[きんようび]、びんや缶[かん]は第二[だいに]水曜日[すいようび]、というように、出す日も決[き]まっている。',
        '最初[さいしょ]のころ、わたしは曜日を間違[まちが]えて、ごみを出してしまったことがある。次[つぎ]の日、袋に「収集日[しゅうしゅうび]ではありません」という紙[かみ]が{2}、とても恥[は]ずかしかった。',
        '{3}、慣[な]れてくると、分別も悪[わる]くないと思[おも]うようになった。リサイクルできるものが多[おお]いことに気[き]づき、物[もの]を大切[たいせつ]にするようになったからだ。面倒[めんどう]だと思っていたルール{4}、実[じつ]は環境[かんきょう]を守[まも]るための大切な仕組[しく]みなのだ。',
      ],
      blanks: [
        { choices: ['しかも', 'ところが', 'なぜなら', 'だから'], answer: 0,
          why: 'しかも adds a further point in the same direction: not only must you sort into ten types — on top of that, each has its own day. ところが would signal a surprise turn.' },
        { choices: ['はってあって', 'はっておいて', 'はってみて', 'はってしまって'], answer: 0,
          why: '〜てある describes the state left by someone else’s action: a note had been stuck on the bag. ておく and てみる describe the writer’s own actions.' },
        { choices: ['しかし', 'そのため', 'それに', 'つまり'], answer: 0,
          why: 'The essay turns from embarrassment to a positive view: しかし (“however”). そのため would make the embarrassment the reason for liking it.' },
        { choices: ['は', 'を', 'に', 'で'], answer: 0,
          why: 'The rules are the topic of the closing statement — “the rules I thought were a nuisance are actually…” — so は. The sentence has no verb for を, に or で to attach to.' },
      ],
      en: [
        'The first thing that gave me trouble when I came to Japan was how to put out the rubbish. In my country, most rubbish goes into one bag. But in the town where I live, you have to sort it into more than ten types. What’s more, the days are fixed too — burnable rubbish on Tuesdays and Fridays, bottles and cans on the second Wednesday, and so on.',
        'Early on, I once put the rubbish out on the wrong day. The next day there was a note stuck on the bag saying “This is not a collection day,” and I was very embarrassed.',
        'However, as I got used to it, I came to think sorting isn’t so bad. I noticed how much can be recycled, and I started taking better care of things. The rules I thought were a nuisance are actually an important system for protecting the environment.',
      ],
    },
    {
      id: 'n3-library-notice', level: 'N3', title: '図書館[としょかん]からのお知[し]らせ', titleEn: 'A notice from the library',
      paragraphs: [
        '市立[しりつ]図書館をご利用[りよう]の皆様[みなさま]へ',
        'いつも図書館をご利用いただき、ありがとうございます。当館[とうかん]では、建物[たてもの]の工事[こうじ]{1}、十月一日[じゅうがつついたち]から十月十五日[じゅうごにち]まで休館[きゅうかん]いたします。休館中[ちゅう]は、本[ほん]の貸[か]し出[だ]しや返却[へんきゃく]はできません。ご迷惑[めいわく]をおかけしますが、ご理解[りかい]{2}よろしくお願[ねが]いいたします。',
        'なお、休館中に返却期限[きげん]が来[く]る本は、十月十六日[じゅうろくにち]以降[いこう]に返却して{3}結構[けっこう]です。また、駅前[えきまえ]の分館[ぶんかん]は通常[つうじょう]どおり開館[かいかん]しております{4}、そちらもご利用ください。',
      ],
      blanks: [
        { choices: ['のため', 'にとって', 'について', 'として'], answer: 0,
          why: 'Noun + のため gives the reason, typical of notices: “due to construction work”. にとって is “for (someone)”, について “about”, として “as”.' },
        { choices: ['のほど', 'ばかり', 'だけ', 'まで'], answer: 0,
          why: 'ご理解のほどよろしくお願いいたします is a fixed polite phrase in notices (“we ask for your understanding”). のほど softens the request.' },
        { choices: ['いただければ', 'いただいて', 'くださって', 'さしあげれば'], answer: 0,
          why: '〜ていただければ結構です politely means “it’s fine if you…”. The conditional ば is needed before 結構です; さしあげる is for giving to others.' },
        { choices: ['ので', 'のに', 'けれど', 'ても'], answer: 0,
          why: 'The branch library is open as usual, so please use it — a reason before a request, so ので. のに and けれど would set up a contrast.' },
      ],
      en: [
        'To everyone who uses the city library:',
        'Thank you for always using the library. Due to construction work on the building, the library will be closed from October 1 to October 15. While we are closed, you cannot borrow or return books. We apologise for the inconvenience and ask for your understanding.',
        'Please note that books due back while we are closed may be returned on or after October 16. Also, the branch library in front of the station is open as usual, so please use it as well.',
      ],
    },
  ];
})(typeof window !== 'undefined' ? window : globalThis);
