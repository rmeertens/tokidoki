(function (global) {
  'use strict';

  // News in easy Japanese for the News page (news.html). Each story is told
  // three times, at JLPT N5, N4 and N3, and the page switches between them.
  // Newest stories go first.
  //
  //   id       — unique, starts with the date
  //   date     — YYYY-MM-DD
  //   emoji    — shown on the story's card
  //   titleEn  — the headline in English
  //   sources  — where the facts come from: [{ name, url }]
  //   levels   — { N5, N4, N3 }, each { title, lines }, where every line is
  //              [Japanese, English] or [Japanese, English, note]. The note
  //              explains anything about the sentence the words and grammar
  //              lists don't (a news expression, a name, some background).
  //
  // The Japanese uses the same 漢字[かんじ] furigana markup as the phrases,
  // with a reading for every kanji run (the 🔊 buttons read the furigana).
  // N3 stories are in the plain written style of a newspaper, N5 and N4 in
  // です / ます. After changing anything, re-run
  // `node scripts/tokenize_news.mjs` (news-words.js); test_news.js checks it.

  global.NEWS_ITEMS = [
    {
      id: '2026-10-10-typhoons',
      date: '2026-10-10',
      emoji: '🌀',
      titleEn: 'Two typhoons stay away from Japan, but high waves are expected over the long weekend',
      sources: [
        { name: 'Weathernews', url: 'https://sea.weathernews.com/resources/202610/263' },
        { name: 'Japan Weather Association', url: 'https://weather-jwa.jp/en/news/articles/post13375' },
      ],
      levels: {
        N5: {
          title: '台風[たいふう]が二[ふた]つあります',
          lines: [
            ['今[いま]、日本[にほん]から遠[とお]い海[うみ]に、台風[たいふう]が二[ふた]つあります。', 'Right now there are two typhoons over the sea, far from Japan.'],
            ['台風[たいふう]は東京[とうきょう]や大阪[おおさか]には来[き]ません。', 'The typhoons won\'t come to Tokyo or Osaka.', '〜には来ません: the は after に puts the stress on these places — they won\'t come there.'],
            ['でも、海[うみ]の波[なみ]が高[たか]くなります。', 'But the waves at sea will get high.', '波[なみ] "wave" isn\'t an N5 word, but you\'ll hear it in every weather report near the coast.'],
            ['今週[こんしゅう]は、土曜日[どようび]から月曜日[げつようび]まで休[やす]みです。', 'This week, Saturday to Monday is a holiday.'],
            ['月曜日[げつようび]は「スポーツの日[ひ]」です。', 'Monday is Sports Day.', 'スポーツの日 is a national holiday on the second Monday of October.'],
            ['海[うみ]へ行[い]く人[ひと]は、気[き]をつけてください。', 'If you\'re going to the sea, please be careful.', '海へ行く describes 人: "people who go to the sea".'],
            ['波[なみ]が高[たか]い日[ひ]は、海[うみ]で泳[およ]がないでください。', 'On days when the waves are high, please don\'t swim in the sea.'],
          ],
        },
        N4: {
          title: '台風[たいふう]が二[ふた]つ　連休[れんきゅう]は海[うみ]の波[なみ]に注意[ちゅうい]',
          lines: [
            ['日本[にほん]の南東[なんとう]の海[うみ]に、台風[たいふう]28号[ごう]と29号[ごう]があります。', 'Typhoons No. 28 and No. 29 are over the sea southeast of Japan.', 'Japan numbers its typhoons through the year: 台風28号 is the 28th of 2026.'],
            ['二[ふた]つの台風[たいふう]は、本州[ほんしゅう]には近[ちか]づかないと考[かんが]えられています。', 'Neither typhoon is expected to come near Honshu.', '〜と考えられています "it is thought that" — the passive is how the news reports what experts expect.'],
            ['しかし、太平洋[たいへいよう]側[がわ]の海[うみ]では、波[なみ]が高[たか]くなるかもしれません。', 'But on the Pacific side the waves may get high.', 'しかし is the written "but"; in speech you\'d say でも.'],
            ['小笠原[おがさわら]諸島[しょとう]の近[ちか]くでは、風[かぜ]も強[つよ]くなりそうです。', 'Near the Ogasawara Islands the wind looks likely to get stronger too.', '強くなりそう: ます-stem + そう, "looks like it will".'],
            ['十日[とおか]から十二日[じゅうににち]までは三連休[さんれんきゅう]で、十二日[じゅうににち]は「スポーツの日[ひ]」です。', 'The 10th to the 12th is a three-day weekend, and the 12th is Sports Day.', 'Dates have their own readings: 十日 (the 10th) is とおか, not じゅうにち.'],
            ['海[うみ]で遊[あそ]んだり、釣[つ]りをしたりする人[ひと]は、天気[てんき]のニュースをよく確認[かくにん]してください。', 'If you\'re going to play in the sea or go fishing, check the weather news carefully.'],
            ['波[なみ]が高[たか]いときは、海[うみ]に近[ちか]づかないようにしましょう。', 'When the waves are high, let\'s keep away from the sea.', '〜ないようにする: make sure not to do something.'],
          ],
        },
        N3: {
          title: '台風[たいふう]28号[ごう]・29号[ごう]　三連休[さんれんきゅう]は高波[たかなみ]に注意[ちゅうい]',
          lines: [
            ['日本[にほん]の南東[なんとう]の海上[かいじょう]を、台風[たいふう]28号[ごう]と29号[ごう]が進[すす]んでいる。', 'Typhoons No. 28 and No. 29 are moving across the sea southeast of Japan.', 'を with a verb of movement marks the area moved through: 海上を進む "move across the sea".'],
            ['気象[きしょう]情報[じょうほう]によると、どちらの台風[たいふう]も本州[ほんしゅう]に上陸[じょうりく]する可能性[かのうせい]は低[ひく]いという。', 'According to weather forecasts, neither typhoon is likely to make landfall on Honshu.', 'によると … という: "according to … , it is said that". News uses the pair to show where a fact comes from.'],
            ['28号[ごう]は十日[とおか]ごろに進路[しんろ]を北東[ほくとう]に変[か]え、29号[ごう]は十二日[じゅうににち]ごろ小笠原[おがさわら]諸島[しょとう]の東[ひがし]の海上[かいじょう]に達[たっ]する見込[みこ]みだ。', 'No. 28 is expected to turn northeast around the 10th, and No. 29 to reach the sea east of the Ogasawara Islands around the 12th.', 'Written Japanese joins sentences with the ます-stem: 変え、 = 変えて、. 見込みだ "is expected to".'],
            ['ただし、太平洋[たいへいよう]沿岸[えんがん]では、うねりによって波[なみ]が高[たか]くなるおそれがある。', 'However, along the Pacific coast, swells could make the waves high.', '〜おそれがある "there is a risk that" — only for bad things.'],
            ['十日[とおか]からの三連休[さんれんきゅう]には海[うみ]へ出[で]かける人[ひと]も多[おお]いとみられる。', 'Many people are expected to head to the sea over the three-day weekend from the 10th.', '〜とみられる "it is thought that" — a news writer\'s careful guess.'],
            ['釣[つ]りやサーフィンをする際[さい]は、十分[じゅうぶん]な注意[ちゅうい]が必要[ひつよう]だ。', 'Anyone fishing or surfing needs to take great care.', '際 is a formal とき "when".'],
          ],
        },
      },
    },
    {
      id: '2026-10-10-beer',
      date: '2026-10-10',
      emoji: '🍺',
      titleEn: 'Japan\'s four biggest brewers raided over suspected beer price cartel',
      sources: [
        { name: 'The Star', url: 'https://www.thestar.com.my/aseanplus/aseanplus-news/2026/10/07/japan-raids-beer-giants-over-alleged-price-cartel' },
        { name: 'Malay Mail', url: 'https://www.malaymail.com/news/money/2026/10/07/four-brewers-controlling-90pc-of-japans-beer-market-raided-in-cartel-probe/238036' },
        { name: 'The Star (shares)', url: 'https://www.thestar.com.my/business/business-news/2026/10/08/beer-shares-fall-as-japan-probes-price-fixing' },
      ],
      levels: {
        N5: {
          title: 'ビールの会社[かいしゃ]を調[しら]べています',
          lines: [
            ['日本[にほん]には、大[おお]きいビールの会社[かいしゃ]が四[よっ]つあります。', 'Japan has four big beer companies.'],
            ['アサヒ、キリン、サッポロ、サントリーです。', 'They are Asahi, Kirin, Sapporo and Suntory.'],
            ['日本[にほん]で飲[の]むビールの九十[きゅうじゅう]パーセントぐらいは、この四[よっ]つの会社[かいしゃ]のビールです。', 'About 90 percent of the beer people drink in Japan comes from these four companies.', '日本で飲むビール: a whole clause describing ビール, "the beer (people) drink in Japan".'],
            ['七日[なのか]、国[くに]の人[ひと]たちが四[よっ]つの会社[かいしゃ]に行[い]きました。', 'On the 7th, people from the government went to the four companies.', '国 "country" also means the government — 国の人たち "people from the state".'],
            ['四[よっ]つの会社[かいしゃ]は、いっしょにビールを高[たか]くしましたか。', 'Did the four companies make beer more expensive together?', '高くする: い-adjective → 〜くする "make something (more) expensive".'],
            ['国[くに]の人[ひと]たちは、それを調[しら]べています。', 'The government is looking into that.'],
            ['会社[かいしゃ]は「手伝[てつだ]います」と言[い]いました。', 'The companies said, "We will help."', 'In the real news the word is 協力します "we will cooperate" — a bigger word for the same idea.'],
          ],
        },
        N4: {
          title: 'ビールの値上[ねあ]げ　大[おお]きい会社[かいしゃ]4社[しゃ]を調査[ちょうさ]',
          lines: [
            ['公正[こうせい]取引[とりひき]委員会[いいんかい]は七日[なのか]、大[おお]きいビール会社[がいしゃ]4社[しゃ]を調[しら]べました。', 'On the 7th, the Japan Fair Trade Commission investigated four big beer companies.', '公正取引委員会 (the JFTC) watches over fair competition between companies. 会社 becomes がいしゃ after ビール.'],
            ['アサヒ、キリン、サッポロ、サントリーの4社[しゃ]です。', 'The four are Asahi, Kirin, Sapporo and Suntory.', '〜社 counts companies: 4社 = four companies.'],
            ['日本[にほん]で売[う]られているビールの約[やく]9割[わり]は、この4社[しゃ]のビールです。', 'About 90% of the beer sold in Japan is from these four companies.', '9割 = 90%. 割 counts tenths, and news often uses it instead of パーセント.'],
            ['4社[しゃ]は、値段[ねだん]を上[あ]げる時期[じき]や金額[きんがく]を相談[そうだん]して決[き]めていた疑[うたが]いがあります。', 'The four are suspected of having agreed together when and by how much to raise prices.', '〜疑いがある "is suspected of": the news\'s way of saying something hasn\'t been proven yet.'],
            ['会社[かいしゃ]どうしで相談[そうだん]して値段[ねだん]を決[き]めることは、法律[ほうりつ]で禁止[きんし]されています。', 'Companies agreeing on prices among themselves is against the law.', '〜こと turns the whole action into a noun, the topic of the sentence.'],
            ['4社[しゃ]は「調査[ちょうさ]に協力[きょうりょく]します」と話[はな]しています。', 'All four say they will cooperate with the investigation.'],
            ['このニュースのあと、ビール会社[がいしゃ]の株[かぶ]が少[すこ]し下[さ]がりました。', 'After the news, the beer companies\' shares fell a little.'],
          ],
        },
        N3: {
          title: 'ビール大手[おおて]4社[しゃ]に立[た]ち入[い]り検査[けんさ]　値上[ねあ]げでカルテルの疑[うたが]い',
          lines: [
            ['公正[こうせい]取引[とりひき]委員会[いいんかい]は七日[なのか]、アサヒ、キリン、サッポロ、サントリーのビール大手[おおて]4社[しゃ]に立[た]ち入[い]り検査[けんさ]を行[おこな]った。', 'On the 7th, the Japan Fair Trade Commission carried out on-site inspections of the four big brewers: Asahi, Kirin, Sapporo and Suntory.', '大手 "major (company)" and 立ち入り検査 "on-site inspection" are everyday words in business news.'],
            ['4社[しゃ]は国内[こくない]のビール市場[しじょう]のおよそ9割[わり]を占[し]めている。', 'The four hold about 90% of the domestic beer market.', '〜を占める "make up, hold (a share)".'],
            ['関係者[かんけいしゃ]によると、4社[しゃ]の社員[しゃいん]は業界[ぎょうかい]団体[だんたい]の会合[かいごう]のあとに集[あつ]まり、値上[ねあ]げの時期[じき]や幅[はば]について話[はな]し合[あ]っていた疑[うたが]いがあるという。', 'According to people involved, staff from the four are suspected of meeting after industry association meetings to discuss the timing and size of price rises.', '関係者によると: "according to sources". 幅 "width" here means how big the rise is.'],
            ['調査[ちょうさ]の対象[たいしょう]には、2022年[ねん]10月[がつ]と2025年[ねん]4月[がつ]の値上[ねあ]げが含[ふく]まれているとみられる。', 'The investigation is thought to cover the price rises of October 2022 and April 2025.', '〜とみられる "is believed to" — the writer isn\'t certain.'],
            ['4社[しゃ]はいずれも検査[けんさ]を受[う]けたことを認[みと]め、「調査[ちょうさ]に協力[きょうりょく]する」としている。', 'All four have confirmed the inspection and say they will cooperate with the investigation.', '〜としている "takes the position that": how the news reports a company\'s statement.'],
            ['公正[こうせい]取引[とりひき]委員会[いいんかい]は今年[ことし]、アイスクリームの大手[おおて]メーカーについても調査[ちょうさ]を行[おこな]っている。', 'Earlier this year the commission also investigated major ice cream makers.'],
            ['身近[みぢか]な商品[しょうひん]の値上[ねあ]げが続[つづ]く中[なか]、調査[ちょうさ]の行方[ゆくえ]が注目[ちゅうもく]されている。', 'With prices of everyday goods still rising, all eyes are on where the investigation goes.', '〜中 "amid, while": 値上げが続く中 "as price rises continue".'],
          ],
        },
      },
    },
    {
      id: '2026-10-10-food-tax',
      date: '2026-10-10',
      emoji: '🍙',
      titleEn: 'Takaichi pledges to cut the consumption tax on food to 1% for two years',
      sources: [
        { name: 'Bernama', url: 'https://bernama.com/en/world/news.php?id=2615698' },
        { name: 'Asia News Network', url: 'https://asianews.network/japanese-prime-minister-takaichi-moves-toward-goal-of-0-tax-on-food/' },
      ],
      levels: {
        N5: {
          title: '食[た]べ物[もの]の税金[ぜいきん]が安[やす]くなりますか',
          lines: [
            ['日本[にほん]では、物[もの]を買[か]うときに税金[ぜいきん]を払[はら]います。', 'In Japan you pay tax when you buy things.', '税金 "tax" isn\'t an N5 word, but it\'s on every receipt.'],
            ['今[いま]、食[た]べ物[もの]の税金[ぜいきん]は八[はち]パーセントです。', 'Right now the tax on food is 8 percent.', 'Other things have a 10% tax; food you take home has 8%.'],
            ['高市[たかいち]総理[そうり]は、これを一[いち]パーセントにしたいと言[い]いました。', 'Prime Minister Takaichi said she wants to make it 1 percent.', 'にしたい: にする "make it (into)" + たい "want to".'],
            ['来年[らいねん]の四月[しがつ]から二年[にねん]です。', 'It would be for two years from next April.'],
            ['食[た]べ物[もの]が少[すこ]し安[やす]くなるかもしれません。', 'Food might get a little cheaper.'],
            ['でも、まだ決[き]まっていません。', 'But it hasn\'t been decided yet.', 'まだ〜ていません "not yet".'],
          ],
        },
        N4: {
          title: '食料品[しょくりょうひん]の消費税[しょうひぜい]　8%から1%に',
          lines: [
            ['五日[いつか]から国会[こっかい]が始[はじ]まりました。', 'The Diet (parliament) opened on the 5th.'],
            ['高市[たかいち]総理[そうり]大臣[だいじん]は、食料品[しょくりょうひん]の消費税[しょうひぜい]を下[さ]げると約束[やくそく]しました。', 'Prime Minister Takaichi promised to lower the consumption tax on food.', '消費税 is the sales tax added to almost everything you buy.'],
            ['今[いま]の8%を、来年[らいねん]4月[がつ]から2年間[ねんかん]、1%にする計画[けいかく]です。', 'The plan is to make the current 8% into 1% for two years from next April.', 'Verb + 計画です: "the plan is to …". The verb describes 計画.'],
            ['新[あたら]しい借金[しゃっきん]はしないと話[はな]しています。', 'She says the government won\'t take on new debt to pay for it.', 'In the real news: 新たな国債を発行しない "won\'t issue new government bonds".'],
            ['選挙[せんきょ]の前[まえ]は「0%にする」と話[はな]していましたが、レジの準備[じゅんび]に時間[じかん]がかかるため、1%になりました。', 'Before the election the party talked of 0%, but because getting cash registers ready takes time, it became 1%.', 'ため here means "because" — a written form of から.'],
            ['ほかの政党[せいとう]は、もっと話[はな]し合[あ]うことが必要[ひつよう]だと言[い]っています。', 'Other parties say it needs more discussion.', '話し合う: 話す + 合う "talk it over with each other".'],
          ],
        },
        N3: {
          title: '食料品[しょくりょうひん]の消費税[しょうひぜい]、2年間[ねんかん]1%に　臨時[りんじ]国会[こっかい]で議論[ぎろん]へ',
          lines: [
            ['臨時[りんじ]国会[こっかい]が五日[いつか]に始[はじ]まり、高市[たかいち]首相[しゅしょう]は演説[えんぜつ]で、食料品[しょくりょうひん]の消費税[しょうひぜい]を引[ひ]き下[さ]げる考[かんが]えを示[しめ]した。', 'An extraordinary Diet session opened on the 5th, and in her speech Prime Minister Takaichi set out her plan to cut the consumption tax on food.', '考えを示す "make one\'s thinking known" — a set phrase in political news. 首相 is the short news word for 総理大臣.'],
            ['政府[せいふ]の案[あん]では、現在[げんざい]8%の税率[ぜいりつ]を来年[らいねん]4月[がつ]から2年間[ねんかん]、1%に下[さ]げる。', 'Under the government\'s plan, the rate, now 8%, would be cut to 1% for two years from next April.'],
            ['首相[しゅしょう]は、そのための新[あら]たな国債[こくさい]は発行[はっこう]しないと強調[きょうちょう]した。', 'The prime minister stressed that no new government bonds would be issued to pay for it.', '新た(な) is the written 新しい.'],
            ['与党[よとう]は選挙[せんきょ]で税率[ぜいりつ]ゼロを訴[うった]えていたが、レジのシステムの改修[かいしゅう]に1年[ねん]近[ちか]くかかることから、1%案[あん]に切[き]り替[か]えた。', 'The ruling party had called for a zero rate in the election, but switched to the 1% plan because updating cash register systems would take nearly a year.', '〜ことから "because of the fact that" — a written way to give a reason.'],
            ['政府[せいふ]は、1%分[ぶん]は給付[きゅうふ]で戻[もど]すため「実質[じっしつ]ゼロ」だと説明[せつめい]している。', 'The government explains that it is "effectively zero", since the 1% will be returned through cash payments.', '実質 "in substance, effectively".'],
            ['一方[いっぽう]、野党[やとう]は「さらに議論[ぎろん]が必要[ひつよう]だ」として反発[はんぱつ]しており、国会[こっかい]での議論[ぎろん]が注目[ちゅうもく]される。', 'The opposition, meanwhile, is pushing back, saying more debate is needed, and all eyes will be on the Diet.', '〜ており = 〜ていて in written style. 一方 at the start of a sentence: "on the other hand".'],
          ],
        },
      },
    },
  ];
})(typeof window !== 'undefined' ? window : globalThis);
