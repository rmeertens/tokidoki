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
      id: '2026-10-14-judo',
      date: '2026-10-14',
      emoji: '🥋',
      titleEn: 'Japan wins the mixed team title at the World Judo Championships',
      sources: [
        { name: 'nippon.com (Jiji)', url: 'https://www.nippon.com/en/news/yjj2026101200164/' },
        { name: 'Euronews', url: 'https://www.euronews.com/2026/10/11/judo-japan-reclaim-mixed-team-world-title-with-eighth-gold-in-baku' },
      ],
      levels: {
        N5: {
          title: '柔道[じゅうどう]の世界[せかい]大会[たいかい]で、日本[にっぽん]が金[きん]メダルを取[と]りました',
          lines: [
            ['アゼルバイジャンのバクーで、柔道[じゅうどう]の世界[せかい]選手権[せんしゅけん]がありました。', 'The judo World Championships were held in Baku, Azerbaijan.', 'Baku is the capital of Azerbaijan.'],
            ['男[おとこ]の人[ひと]と女[おんな]の人[ひと]が一緒[いっしょ]に出[で]る団体戦[だんたいせん]で、日本[にっぽん]が一番[いちばん]になりました。', 'In the team event, where men and women compete together, Japan came first.', 'This is the "mixed team" event: each team has both men and women, and the team wins by winning more matches.'],
            ['十一日[じゅういちにち]の決勝[けっしょう]で、日本[にっぽん]はロシアに勝[か]ちました。', 'In the final on the 11th, Japan beat Russia.'],
            ['4対[たい]1でした。', 'The score was 4 to 1.'],
            ['日本[にっぽん]がこの種目[しゅもく]で優勝[ゆうしょう]したのは、八回目[はっかいめ]です。', 'This is the eighth time Japan has won this event.', '種目 means an event in a sport.'],
            ['前[まえ]の大会[たいかい]では、決勝[けっしょう]で負[ま]けました。ですから、今回[こんかい]は日本[にっぽん]がまた世界[せかい]一[いち]になりました。', 'At the last championships Japan lost in the final, so this time Japan became the world number one again.'],
          ],
        },
        N4: {
          title: '柔道[じゅうどう]世界[せかい]選手権[せんしゅけん]、混合[こんごう]団体[だんたい]で日本[にっぽん]が優勝[ゆうしょう]',
          lines: [
            ['アゼルバイジャンのバクーで行[おこな]われている柔道[じゅうどう]の世界[せかい]選手権[せんしゅけん]で、日本[にっぽん]が混合[こんごう]団体[だんたい]で優勝[ゆうしょう]しました。', 'At the judo World Championships in Baku, Azerbaijan, Japan won the mixed team event.', '混合団体 is a team event in which men and women are on the same team.'],
            ['十一日[じゅういちにち]の決勝[けっしょう]で、日本[にっぽん]はロシアを4対[たい]1でやぶりました。', 'In the final on the 11th, Japan beat Russia 4 to 1.'],
            ['準決勝[じゅんけっしょう]では、中国[ちゅうごく]に勝[か]っています。', 'In the semifinal, Japan had beaten China.'],
            ['この種目[しゅもく]で日本[にっぽん]が金[きん]メダルを取[と]るのは、八回目[はっかいめ]です。', 'This is Japan\'s eighth gold medal in this event.'],
            ['日本[にっぽん]は、前[まえ]の大会[たいかい]の決勝[けっしょう]で負[ま]けていたので、世界[せかい]一[いち]の座[ざ]を取[と]りもどしました。', 'Japan had lost in the final of the previous championships, so it took back the title of world number one.', '取りもどす "to take back, to regain".'],
            ['ロシアは、この種目[しゅもく]で初[はじ]めて決勝[けっしょう]に進[すす]みましたが、あと一歩[いっぽ]とどきませんでした。', 'Russia reached the final of this event for the first time, but fell just short.', 'あと一歩 "just one step more".'],
          ],
        },
        N3: {
          title: '柔道[じゅうどう]世界[せかい]選手権[せんしゅけん]、混合[こんごう]団体[だんたい]で日本[にっぽん]が王座[おうざ]奪還[だっかん]',
          lines: [
            ['アゼルバイジャンのバクーで開[ひら]かれている柔道[じゅうどう]の世界[せかい]選手権[せんしゅけん]は十一日[じゅういちにち]、混合[こんごう]団体[だんたい]の決勝[けっしょう]が行[おこな]われ、日本[にっぽん]がロシアを4対[たい]1で下[くだ]して優勝[ゆうしょう]した。', 'On the 11th at the judo World Championships in Baku, Azerbaijan, the mixed team final was held, and Japan won by beating Russia 4 to 1.', '下す "to defeat". 混合団体 is a team event with both men and women.'],
            ['日本[にっぽん]は準決勝[じゅんけっしょう]で中国[ちゅうごく]を破[やぶ]り、決勝[けっしょう]に進[すす]んでいた。', 'Japan had beaten China in the semifinal and advanced to the final.'],
            ['この種目[しゅもく]での日本[にっぽん]の優勝[ゆうしょう]は八回目[はっかいめ]となる。', 'This is Japan\'s eighth gold medal in this event.'],
            ['日本[にっぽん]は前回[ぜんかい]大会[たいかい]の決勝[けっしょう]で敗[やぶ]れており、世界[せかい]一[いち]の座[ざ]を取[と]り戻[もど]した形[かたち]だ。', 'Japan had lost in the final of the previous championships, so it has regained the world number one position.', '取り戻した形だ describes the result as a "regaining".'],
            ['一方[いっぽう]、ロシアはこの種目[しゅもく]で初[はじ]めて決勝[けっしょう]に進[すす]んだが、頂点[ちょうてん]には届[とど]かなかった。', 'Russia, for its part, reached the final of this event for the first time, but could not reach the top.', '頂点 "the peak, the top".'],
          ],
        },
      },
    },
    {
      id: '2026-10-14-soft-power',
      date: '2026-10-14',
      emoji: '📚',
      titleEn: 'Japan plans to spread manga and anime in Latin America and Africa',
      sources: [
        { name: 'The Japan Times', url: 'https://www.japantimes.co.jp/news/2026/10/14/japan/japan-soft-power-diplomacy/' },
        { name: 'Honolulu Star-Advertiser (Jiji)', url: 'https://www.staradvertiser.com/2026/09/24/news/ministry-to-promote-anime-manga-in-southern-countries/' },
      ],
      levels: {
        N5: {
          title: '日本[にっぽん]のマンガとアニメを、世界[せかい]の国[くに]に広[ひろ]めます',
          lines: [
            ['日本[にっぽん]の外務省[がいむしょう]は、マンガとアニメを外国[がいこく]に広[ひろ]めたいと考[かんが]えています。', 'Japan\'s Foreign Ministry wants to spread manga and anime to foreign countries.', '外務省 is the Ministry of Foreign Affairs.'],
            ['特[とく]に、南米[なんべい]やアフリカの国[くに]に、日本[にっぽん]のファンをふやしたいです。', 'In particular, it wants to increase Japan\'s fans in countries in South America and Africa.', 'The articles say "Latin America", which is mostly the same area as 南米 plus Central America.'],
            ['そのために、来年度[らいねんど]のお金[かね]として、18億[おく]3000万[まん]円[えん]を国[くに]に頼[たの]んでいます。', 'For this, it is asking the government for 1.83 billion yen for next fiscal year.', 'This is a request in the budget plan (概算要求). The final amount may change.'],
            ['アニメのコンサートを開[ひら]いたり、日本語[にほんご]を勉強[べんきょう]するアプリを作[つく]ったりします。', 'It will hold anime concerts and make an app for studying Japanese.'],
            ['アプリには、マンガのキャラクターが出[で]てきます。', 'Manga characters will appear in the app.'],
            ['悪[わる]いコピーを止[と]めることも大切[たいせつ]だと考[かんが]えています。', 'It also thinks that stopping illegal copies is important.', 'The bad copies meant here are pirated (illegal) copies of manga and anime.'],
          ],
        },
        N4: {
          title: '外務省[がいむしょう]、マンガとアニメで南[みなみ]の国々[くにぐに]との関係[かんけい]を強[つよ]くしたい',
          lines: [
            ['日本[にっぽん]の外務省[がいむしょう]は、2027年度[ねんど]から、マンガやアニメなどの日本[にっぽん]文化[ぶんか]を使[つか]った外交[がいこう]を強[つよ]めることにしました。', 'Japan\'s Foreign Ministry has decided to step up diplomacy that uses Japanese culture, such as manga and anime, from fiscal 2027.', 'This kind of diplomacy is called "soft power" diplomacy: gaining friends through attraction, not force.'],
            ['中南米[ちゅうなんべい]やアフリカなど、これまでファンが少[すく]なかった国[くに]に広[ひろ]げたいと考[かんが]えています。', 'It wants to spread it to places such as Latin America and Africa, where fans have so far been few.', '"Global South" is the term for emerging and developing countries, many of them in the southern half of the world.'],
            ['外務省[がいむしょう]は、そのために18億[おく]3000万[まん]円[えん]を、来年度[らいねんど]の予算[よさん]の概算[がいさん]要求[ようきゅう]に入[い]れました。', 'The ministry has put 1.83 billion yen for this in its preliminary budget request for next fiscal year.', '概算要求 is a ministry\'s first budget request, which can still be changed.'],
            ['日本[にっぽん]の会社[かいしゃ]と現地[げんち]の人[ひと]がつながる機会[きかい]を作[つく]ったり、正[ただ]しい方法[ほうほう]で作品[さくひん]を見[み]られるようにしたりします。', 'It will create chances for Japanese companies to connect with local people, and make it possible to watch works in a legal way.'],
            ['海賊版[かいぞくばん]を防[ふせ]ぐことも目的[もくてき]の一[ひと]つです。', 'Preventing pirated copies is also one of the aims.', '海賊版 "pirated copy".'],
            ['アニメのコンサートや、マンガのキャラクターが出[で]る日本語[にほんご]学習[がくしゅう]アプリも考[かんが]えられています。', 'Anime concerts and a Japanese-learning app with manga characters are also being considered.'],
          ],
        },
        N3: {
          title: '外務省[がいむしょう]、マンガ・アニメで新興[しんこう]国[こく]への発信[はっしん]強化[きょうか]へ',
          lines: [
            ['外務省[がいむしょう]は、2027年度[ねんど]から、マンガやアニメなど日本[にっぽん]のポップカルチャーを活用[かつよう]した「ソフトパワー外交[がいこう]」を、グローバルサウスと呼[よ]ばれる新興[しんこう]国[こく]や途上国[とじょうこく]で強化[きょうか]する方針[ほうしん]だ。', 'The Foreign Ministry plans to strengthen "soft power diplomacy" using Japanese pop culture such as manga and anime in emerging and developing countries known as the Global South, starting in fiscal 2027.', 'グローバルサウス "Global South". 方針だ "it is the policy to".'],
            ['市場[しじょう]の開拓[かいたく]が進[すす]んでいない中南米[ちゅうなんべい]やアフリカでファン層[そう]を広[ひろ]げ、欧米[おうべい]やアジア以外[いがい]にも日本[にっぽん]への関心[かんしん]を高[たか]めたい考[かんが]えだ。', 'It wants to widen the fan base in Latin America and Africa, where the market has not been developed much, and raise interest in Japan beyond the West and Asia.'],
            ['2027年度[ねんど]予算[よさん]の概算[がいさん]要求[ようきゅう]には、関連[かんれん]費用[ひよう]として18億[おく]3000万[まん]円[えん]を計上[けいじょう]した。', 'In its preliminary request for the fiscal 2027 budget, it has set aside 1.83 billion yen in related costs.', '計上する "to include in a budget". The request may still change before the budget is decided.'],
            ['日本[にっぽん]のコンテンツ業界[ぎょうかい]と対象[たいしょう]地域[ちいき]を結[むす]ぶ交流[こうりゅう]の場[ば]をつくり、海賊版[かいぞくばん]による著作権[ちょさくけん]侵害[しんがい]を防[ふせ]ぎながら、正規[せいき]の配信[はいしん]を後押[あとお]しする。', 'It will create places for exchange between Japan\'s content industry and the target regions, and support legal distribution while preventing copyright infringement by pirated copies.', '正規の "legitimate, official".'],
            ['現地[げんち]の翻訳者[ほんやくしゃ]が日本[にっぽん]文化[ぶんか]を学[まな]ぶ機会[きかい]を設[もう]けるほか、マンガのキャラクターを使[つか]った日本語[にほんご]学習[がくしゅう]アプリの開発[かいはつ]も検討[けんとう]している。', 'Besides giving local translators chances to learn about Japanese culture, it is also considering developing a Japanese-learning app using manga characters.'],
            ['国際[こくさい]交流[こうりゅう]基金[ききん]は1月[がつ]、西[にし]アフリカのコートジボワールで、「ドラゴンボールZ」などの曲[きょく]を使[つか]ったアニメコンサートを開[ひら]いている。', 'In January the Japan Foundation held an anime concert in Côte d\'Ivoire, West Africa, featuring songs from "Dragon Ball Z" and other series.', '国際交流基金 is the Japan Foundation, which promotes Japanese culture abroad.'],
          ],
        },
      },
    },
    {
      id: '2026-10-14-underpass',
      date: '2026-10-14',
      emoji: '🌧️',
      titleEn: 'Cars submerged at 80 underpasses in prefectural capitals over the past decade, survey finds',
      sources: [
        { name: 'Kyodo News (via Infoseek)', url: 'https://news.infoseek.co.jp/topics/kyodo_1481985329809883691/' },
        { name: 'Japan Today (Kyodo)', url: 'https://japantoday.com/category/national/update1-80-underpasses-in-japan-saw-vehicles-submerged-over-past-decade-survey' },
      ],
      levels: {
        N5: {
          title: '大雨[おおあめ]で、車[くるま]が水[みず]に入[はい]った道[みち]が80か所[しょ]ありました',
          lines: [
            ['雨[あめ]がたくさん降[ふ]ると、道[みち]が水[みず]でいっぱいになることがあります。', 'When a lot of rain falls, roads can fill up with water.'],
            ['特[とく]に、線路[せんろ]の下[した]を通[とお]る、低[ひく]い道[みち]が危[あぶ]ないです。', 'Low roads that go under railways are especially dangerous.', 'These roads are called アンダーパス (underpasses).'],
            ['共同通信[きょうどうつうしん]が調[しら]べました。', 'Kyodo News did a survey.'],
            ['県庁[けんちょう]がある市[し]では、この10年[ねん]ぐらいで、80か所[しょ]の道[みち]に車[くるま]が水[みず]に入[はい]りました。', 'In the cities with prefectural governments, cars were caught in the water on 80 roads in about the last ten years.', '県庁がある市 means prefectural capitals.'],
            ['全部[ぜんぶ]で134台[だい]の車[くるま]が水[みず]に入[はい]りました。', 'In all, 134 cars were caught in the water.'],
            ['雨[あめ]が強[つよ]いときは、低[ひく]い道[みち]に入[はい]らないでください。', 'When the rain is heavy, please do not enter low roads.'],
          ],
        },
        N4: {
          title: '県庁所在地[けんちょうしょざいち]のアンダーパス、10年[ねん]で80か所[しょ]が冠水[かんすい]',
          lines: [
            ['共同通信[きょうどうつうしん]の調査[ちょうさ]で、県庁[けんちょう]がある市[し]のアンダーパスで、この10年[ねん]ほどの間[あいだ]に、車[くるま]が水[みず]に入[はい]った場所[ばしょ]が80か所[しょ]あったことが分[わ]かりました。', 'A Kyodo News survey found that in about the last ten years there were 80 underpasses in prefectural capitals where vehicles were caught in floodwater.', 'アンダーパス is a road that dips down to pass under a railway or road. Water collects in it easily.'],
            ['水[みず]に入[はい]った車[くるま]は、合計[ごうけい]で134台[だい]でした。', 'The number of vehicles caught in the water was 134 in total.'],
            ['調査[ちょうさ]では、33の県庁所在地[けんちょうしょざいち]で、こうしたことがあったそうです。', 'According to the survey, this had happened in 33 prefectural capitals.', '県庁所在地 "the city where a prefectural government is located".'],
            ['8月[がつ]には、千葉県[ちばけん]で大雨[おおあめ]があり、二人[ふたり]が亡[な]くなりました。', 'In August, there was heavy rain in Chiba Prefecture, and two people died.'],
            ['大雨[おおあめ]のあと、国土交通省[こくどこうつうしょう]は、雨[あめ]が強[つよ]いときに前[まえ]もって通行[つうこう]を止[と]める場所[ばしょ]を、全国[ぜんこく]で6か所[しょ]ふやしました。', 'After the heavy rain, the Ministry of Land, Infrastructure, Transport and Tourism added six places nationwide where traffic is stopped in advance when the rain is heavy.', '予防通行規制 is the system of closing a road in advance when heavy rain is expected.'],
            ['雨[あめ]の日[ひ]は、低[ひく]い道[みち]を通[とお]らないようにすることが大切[たいせつ]です。', 'On rainy days, it is important to avoid low roads.'],
          ],
        },
        N3: {
          title: '県庁所在地[けんちょうしょざいち]のアンダーパス、10年[ねん]で80か所[しょ]が水没[すいぼつ]被害[ひがい]　共同通信[きょうどうつうしん]調査[ちょうさ]',
          lines: [
            ['共同通信[きょうどうつうしん]の調査[ちょうさ]によると、県庁[けんちょう]所在地[しょざいち]にあるアンダーパスで、過去[かこ]10年[ねん]ほどの間[あいだ]に車両[しゃりょう]が水没[すいぼつ]した場所[ばしょ]は少[すく]なくとも80か所[しょ]に上[のぼ]った。', 'According to a Kyodo News survey, there were at least 80 underpasses in prefectural capitals where vehicles were submerged during the past decade or so.', '〜に上る "to amount to". アンダーパス is a road that dips under a railway or another road.'],
            ['水没[すいぼつ]した車両[しゃりょう]は計[けい]134台[だい]で、33の県庁[けんちょう]所在地[しょざいち]で確認[かくにん]された。', 'A total of 134 vehicles were submerged, and cases were confirmed in 33 prefectural capitals.'],
            ['8月[がつ]には千葉県[ちばけん]で記録的[きろくてき]な大雨[おおあめ]となり、二人[ふたり]が死亡[しぼう]した。', 'In August, record-level heavy rain fell in Chiba Prefecture, and two people died.', 'The reports link this survey to the Chiba rain. The Chiba rain is described here only in general terms.'],
            ['これを受[う]けて国土交通省[こくどこうつうしょう]は、大雨[おおあめ]のときに事前[じぜん]に通行[つうこう]を規制[きせい]する場所[ばしょ]を、全国[ぜんこく]で6か所[しょ]追加[ついか]した。', 'In response, the Ministry of Land, Infrastructure, Transport and Tourism added six more places nationwide where traffic is restricted in advance during heavy rain.', 'これを受けて "in response to this".'],
            ['アンダーパスは全国[ぜんこく]に約[やく]3700か所[しょ]あるとされ、専門家[せんもんか]は、冠水[かんすい]した道[みち]には進入[しんにゅう]しないよう呼[よ]びかけている。', 'There are said to be about 3,700 underpasses nationwide, and experts are urging people not to enter flooded roads.', 'The 3,700 figure is from a ministry count as of 2022 (reported by the Yomiuri).'],
          ],
        },
      },
    },
    {
      id: '2026-10-13-newspaper',
      date: '2026-10-13',
      emoji: '📰',
      titleEn: 'Newspaper subscriptions in Japan fall below 50% for the first time',
      sources: [
        { name: 'nippon.com (Jiji)', url: 'https://www.nippon.com/en/news/yjj2026101100107/' },
      ],
      levels: {
        N5: {
          title: '新聞[しんぶん]を買[か]っている人[ひと]が、半分[はんぶん]より少[すく]なくなりました',
          lines: [
            ['新聞[しんぶん]を毎月[まいつき]買[か]っている人[ひと]が、半分[はんぶん]より少[すく]なくなりました。', 'The number of people who buy a newspaper every month has fallen below half.'],
            ['調査[ちょうさ]では、新聞[しんぶん]を買[か]っている人[ひと]は49.8パーセントでした。', 'In the survey, 49.8 percent of people buy a newspaper.', '調査 here is a yearly survey by the Japan Press Research Institute (新聞通信調査会).'],
            ['50パーセントより少[すく]なくなったのは、調査[ちょうさ]を始[はじ]めてから初[はじ]めてです。', 'It is the first time since the survey began that it has dropped below 50 percent.'],
            ['この調査[ちょうさ]は2008年[ねん]に始[はじ]まりました。そのときは88.6パーセントでした。', 'This survey began in 2008. At that time, the figure was 88.6 percent.'],
            ['一週間[いっしゅうかん]に新聞[しんぶん]でニュースを見[み]る人[ひと]も、49.7パーセントで、半分[はんぶん]より少[すく]なかったです。', 'The share of people who read news in a newspaper in a week was also below half, at 49.7 percent.'],
            ['ニュースを見[み]る方法[ほうほう]で一番[いちばん]多[おお]いのは、テレビで、84.2パーセントでした。', 'The most common way to follow the news was TV, at 84.2 percent.', 'This is commercial TV (民放). People could pick more than one way, so the numbers add up to more than 100 percent.'],
          ],
        },
        N4: {
          title: '新聞[しんぶん]を取[と]っている人[ひと]の割合[わりあい]、初[はじ]めて半分[はんぶん]を下回[したまわ]る',
          lines: [
            ['新聞通信調査会[しんぶんつうしんちょうさかい]の調査[ちょうさ]で、新聞[しんぶん]を毎月[まいつき]取[と]っている人[ひと]の割合[わりあい]が49.8パーセントになりました。', 'In a survey by the Japan Press Research Institute, the share of people who take a newspaper every month came to 49.8 percent.', '新聞を取る means "to subscribe to a newspaper".'],
            ['去年[きょねん]より0.3ポイント下[さ]がり、調査[ちょうさ]を始[はじ]めてから初[はじ]めて50パーセントを下回[したまわ]りました。', 'It fell 0.3 points from last year, dropping below 50 percent for the first time since the survey began.', '下回る "to fall below" (the opposite is 上回る).'],
            ['調査[ちょうさ]が始[はじ]まった2008年[ねん]は88.6パーセントで、18年[ねん]で大[おお]きく減[へ]りました。', 'In 2008, when the survey began, it was 88.6 percent, so it has fallen sharply in 18 years.'],
            ['一週間[いっしゅうかん]に新聞[しんぶん]でニュースを知[し]る人[ひと]も49.7パーセントで、初[はじ]めて半分[はんぶん]を切[き]りました。', 'The share of people who learn the news from a newspaper in a week was also 49.7 percent, falling below half for the first time.', '半分を切る "to drop below half".'],
            ['ニュースを知[し]る方法[ほうほう]で一番[いちばん]多[おお]かったのは、民放[みんぽう]のテレビで84.2パーセントでした。', 'The most common way to learn the news was commercial TV, at 84.2 percent.', '民放 = 民間放送, commercial (non-NHK) broadcasters.'],
            ['インターネットは74.4パーセント、NHKのテレビは69.7パーセントでした。', 'The internet was at 74.4 percent and NHK TV at 69.7 percent.'],
            ['調査[ちょうさ]は7月[がつ]から8月[がつ]に、18歳[さい]以上[いじょう]の5000人[にん]に行[おこな]い、2676人[にん]が答[こた]えました。', 'The survey was given to 5,000 people aged 18 or over from July to August, and 2,676 answered.'],
          ],
        },
        N3: {
          title: '新聞[しんぶん]の購読率[こうどくりつ]、調査[ちょうさ]開始[かいし]以来[いらい]初[はじ]めて半数[はんすう]割[わ]れ',
          lines: [
            ['新聞通信調査会[しんぶんつうしんちょうさかい]がまとめた2026年度[ねんど]の調査[ちょうさ]によると、新聞[しんぶん]の月[つき]ぎめ購読率[こうどくりつ]は49.8パーセントで、2008年[ねん]の調査[ちょうさ]開始[かいし]以来[いらい]、初[はじ]めて50パーセントを下回[したまわ]った。', 'According to the fiscal 2026 survey compiled by the Japan Press Research Institute, the monthly newspaper subscription rate was 49.8 percent, falling below 50 percent for the first time since the survey began in 2008.', '月ぎめ means paying by the month. 〜以来 "ever since".'],
            ['前年度[ぜんねんど]の50.1パーセントから0.3ポイント低下[ていか]しており、開始[かいし]時[じ]の88.6パーセントからは約[やく]39ポイント下[さ]がった。', 'It fell 0.3 points from 50.1 percent the previous year, and about 39 points from 88.6 percent at the start.'],
            ['一週間[いっしゅうかん]に新聞[しんぶん]でニュースに触[ふ]れる人[ひと]の割合[わりあい]も49.7パーセントと、初[はじ]めて半数[はんすう]を下回[したまわ]った。', 'The share of people who come into contact with the news through newspapers in a week was also 49.7 percent, below half for the first time.', '半数割れ in the headline means "falling below half".'],
            ['ニュースを得[え]る手段[しゅだん]では、民放[みんぽう]テレビが84.2パーセントで最[もっと]も多[おお]かった。', 'As a way of getting the news, commercial TV was the most common, at 84.2 percent.', '得る "to get, obtain" — a written-style verb for 手に入れる.'],
            ['インターネットの74.4パーセント、NHKテレビの69.7パーセントが続[つづ]いた。', 'The internet at 74.4 percent and NHK TV at 69.7 percent followed.'],
            ['調査[ちょうさ]は7月[がつ]17日[にち]から8月[がつ]16日[にち]にかけて、全国[ぜんこく]の18歳[さい]以上[いじょう]の男女[だんじょ]5000人[にん]を対象[たいしょう]に行[おこな]われ、2676人[にん]が回答[かいとう]した。', 'The survey was carried out from July 17 to August 16 on 5,000 men and women aged 18 or over across the country, and 2,676 responded.', '〜を対象に "targeting, aimed at".'],
          ],
        },
      },
    },
    {
      id: '2026-10-13-el-nino',
      date: '2026-10-13',
      emoji: '🌊',
      titleEn: 'El Niño is the strongest on record, Japan Meteorological Agency says',
      sources: [
        { name: 'Jiji Press', url: 'https://www.jiji.com/jc/article?k=2026100900927&g=soc&m=rss' },
        { name: 'Weathernews (JMA El Niño bulletin)', url: 'https://weathernews.jp/news/202610/090161/' },
        { name: 'Weathernews (JMA 3-month forecast)', url: 'https://weathernews.jp/news/202609/180161/' },
      ],
      levels: {
        N5: {
          title: 'エルニーニョが、とても強[つよ]くなっています',
          lines: [
            ['九日[ここのか]、気象庁[きしょうちょう]は「エルニーニョが、とても強[つよ]くなっています」と言[い]いました。', 'On the 9th, the Japan Meteorological Agency said, "El Niño has become very strong."', '気象庁 is the Japan Meteorological Agency. エルニーニョ is when the sea near the equator in the eastern Pacific gets warmer than usual, which changes the weather around the world.'],
            ['エルニーニョは、太平洋[たいへいよう]の海[うみ]の水[みず]が、いつもより暖[あたた]かくなることです。', 'El Niño is when the water of the Pacific Ocean becomes warmer than usual.'],
            ['九月[くがつ]の海[うみ]の水[みず]の温度[おんど]は、いつもの年[とし]より4度[ど]高[たか]かったです。', 'In September, the temperature of the sea water was 4 degrees higher than in a normal year.', 'This is the water in the area the agency watches for El Niño.'],
            ['これは、1949年[ねん]から今[いま]までで、一番[いちばん]高[たか]い温度[おんど]です。', 'This is the highest since 1949, when the records begin.'],
            ['エルニーニョは春[はる]から続[つづ]いています。冬[ふゆ]まで続[つづ]くと言[い]われています。', 'El Niño has continued since spring. It is said that it will last until winter.'],
            ['十一月[じゅういちがつ]か十二月[じゅうにがつ]に、一番[いちばん]強[つよ]くなるかもしれません。', 'It may become strongest in November or December.'],
            ['日本[にほん]では、今年[ことし]の冬[ふゆ]が来[く]るのが遅[おそ]くなるかもしれません。', 'In Japan, winter may come late this year.', 'The agency three-month forecast says it is likely that the start of winter will be late.'],
          ],
        },
        N4: {
          title: 'エルニーニョ現象[げんしょう]、海面[かいめん]水温[すいおん]が観測[かんそく]史上[しじょう]最高[さいこう]に',
          lines: [
            ['気象庁[きしょうちょう]は九日[ここのか]、今年[ことし]のエルニーニョ現象[げんしょう]が過去[かこ]最大[さいだい]の強[つよ]さになっていると発表[はっぴょう]しました。', 'On the 9th, the Japan Meteorological Agency announced that this year\'s El Niño has become the strongest on record.'],
            ['エルニーニョ現象[げんしょう]は、太平洋[たいへいよう]の赤道[せきどう]付近[ふきん]で、海面[かいめん]の水温[すいおん]が平年[へいねん]より高[たか]くなる現象[げんしょう]です。', 'El Niño is a phenomenon in which the sea surface temperature near the equator in the Pacific becomes higher than normal.', '平年 "a normal year" — the average over many years.'],
            ['気象庁[きしょうちょう]が監視[かんし]している海域[かいいき]では、9月[がつ]の水温[すいおん]が平年[へいねん]より4.0度[ど]高[たか]くなりました。', 'In the sea area the agency monitors, the water temperature in September was 4.0 degrees higher than normal.'],
            ['1949年[ねん]に統計[とうけい]を取[と]り始[はじ]めてから、これまでで一番[いちばん]高[たか]かったのは、1997年[ねん]12月[がつ]の3.6度[ど]でした。', 'Since statistics began in 1949, the highest so far had been 3.6 degrees, in December 1997.'],
            ['エルニーニョ現象[げんしょう]は春[はる]から続[つづ]いていて、冬[ふゆ]の間[あいだ]も続[つづ]く見通[みとお]しです。', 'El Niño has continued since spring and is expected to last through the winter.', '見通し "outlook, forecast".'],
            ['ピークは11月[がつ]から12月[がつ]ごろとみられています。', 'The peak is thought to come around November to December.', 'Some reports say December; the agency expects the peak in late autumn to early winter.'],
            ['3か月[げつ]予報[よほう]では、10月[がつ]から12月[がつ]の気温[きおん]は全国[ぜんこく]で平年[へいねん]より高[たか]く、冬[ふゆ]の訪[おとず]れは遅[おく]れる可能性[かのうせい]が高[たか]いとされています。', 'The three-month forecast says temperatures from October to December will be higher than normal across the country, and the start of winter is likely to be late.', '冬の訪れ "the arrival of winter". This forecast was issued in September.'],
          ],
        },
        N3: {
          title: 'エルニーニョ現象[げんしょう]、監視[かんし]海域[かいいき]の水温[すいおん]が観測[かんそく]史上[しじょう]最高[さいこう]に　気象庁[きしょうちょう]',
          lines: [
            ['気象庁[きしょうちょう]は九日[ここのか]、エルニーニョ監視[かんし]速報[そくほう]を発表[はっぴょう]し、今年[ことし]のエルニーニョ現象[げんしょう]が、統計[とうけい]のある1949年[ねん]以降[いこう]で最[もっと]も強[つよ]い状態[じょうたい]にあるとした。', 'On the 9th, the Japan Meteorological Agency issued its El Niño bulletin and said this year\'s El Niño is the strongest since records began in 1949.', 'エルニーニョ監視速報 is the agency\'s monthly bulletin on El Niño conditions.'],
            ['9月[がつ]の監視[かんし]海域[かいいき]の海面[かいめん]水温[すいおん]は、平年[へいねん]との差[さ]がプラス4.0度[ど]で、これまで最[もっと]も高[たか]かった1997年[ねん]12月[がつ]のプラス3.6度[ど]を上回[うわまわ]った。', 'The sea surface temperature in the monitored area in September was 4.0 degrees above normal, exceeding the previous highest, 3.6 degrees above normal in December 1997.'],
            ['現象[げんしょう]は今年[ことし]春[はる]から続[つづ]いているとみられ、冬[ふゆ]の間[あいだ]も続[つづ]く見通[みとお]しで、ピークは11月[がつ]から12月[がつ]ごろになる可能性[かのうせい]がある。', 'The phenomenon is thought to have continued since spring this year and is expected to last through the winter, with a possible peak around November to December.', 'とみられ is the written form of とみられて: "is thought to be".'],
            ['気象庁[きしょうちょう]が9月[がつ]に出[だ]した3か月[げつ]予報[よほう]では、10月[がつ]から12月[がつ]の気温[きおん]は全国[ぜんこく]的[てき]に平年[へいねん]より高[たか]く、冬[ふゆ]の訪[おとず]れが遅[おそ]くなる可能性[かのうせい]が高[たか]いとされている。', 'In the three-month forecast the agency issued in September, temperatures from October to December are above normal nationwide, and the arrival of winter is likely to be late.'],
            ['同[おな]じように顕著[けんちょ]なエルニーニョが起[お]きた1997年[ねん]は、11月[がつ]から12月[がつ]にかけて全国[ぜんこく]的[てき]に気温[きおん]が大幅[おおはば]に高[たか]く、冬[ふゆ]の訪[おとず]れが遅[おく]れた。', 'In 1997, when a similarly marked El Niño occurred, temperatures were far above normal across the country from November to December, and winter arrived late.', '顕著 "marked, remarkable".'],
            ['エルニーニョ現象[げんしょう]は世界[せかい]各地[かくち]の天候[てんこう]に影響[えいきょう]を与[あた]えることがあり、今後[こんご]の動[うご]きが注目[ちゅうもく]される。', 'El Niño can affect the weather in many parts of the world, and its movements from here on are being watched closely.'],
          ],
        },
      },
    },
    {
      id: '2026-10-13-household-spending',
      date: '2026-10-13',
      emoji: '🛒',
      titleEn: 'Household spending falls for the ninth month in a row, down 3.1% in August',
      sources: [
        { name: 'Business Today Malaysia', url: 'https://www.businesstoday.com.my/2026/10/09/japan-household-spending-falls-for-ninth-straight-month/' },
        { name: 'investingLive', url: 'https://investinglive.com/news/japan-household-spending-falls-for-ninth-straight-month-but-drop-smaller-than-expected/' },
      ],
      levels: {
        N5: {
          title: '家[いえ]の人[ひと]が使[つか]ったお金[かね]が、九[きゅう]か月[げつ]少[すく]なくなっています',
          lines: [
            ['九日[ここのか]、国[くに]が八月[はちがつ]の、家[いえ]のお金[かね]の使[つか]い方[かた]を発表[はっぴょう]しました。', 'On the 9th, the government announced how households used money in August.', 'The Ministry of Internal Affairs and Communications (総務省) makes this report every month.'],
            ['二人[ふたり]以上[いじょう]で住[す]んでいる家[いえ]が使[つか]ったお金[かね]は、去年[きょねん]の八月[はちがつ]より3.1パーセント少[すく]なかったです。', 'The money used by homes with two or more people was 3.1 percent less than last August.', 'The numbers are adjusted for price changes.'],
            ['去年[きょねん]より少[すく]なかったのは、九[きゅう]か月[げつ]続[つづ]いています。', 'It has been less than the year before for nine months in a row.'],
            ['電気[でんき]やガス、水道[すいどう]のお金[かね]は、5.2パーセント少[すく]なかったです。', 'The money for electricity, gas and water was 5.2 percent less.'],
            ['食[た]べ物[もの]のお金[かね]も、1.4パーセント少[すく]なかったです。', 'The money for food was also 1.4 percent less.'],
            ['前[まえ]の月[つき]の七月[しちがつ]と比[くら]べると、0.1パーセント多[おお]かったです。', 'Compared with the month before, July, it was 0.1 percent more.'],
            ['少[すく]なくなった数字[すうじ]は、専門家[せんもんか]の予想[よそう]より小[ちい]さかったです。', 'The size of the drop was smaller than experts had predicted.'],
          ],
        },
        N4: {
          title: '8月[がつ]の家計[かけい]支出[ししゅつ]、九[きゅう]か月[げつ]連続[れんぞく]で減少[げんしょう]',
          lines: [
            ['総務省[そうむしょう]は九日[ここのか]、8月[がつ]の家計調査[かけいちょうさ]の結果[けっか]を発表[はっぴょう]しました。', 'On the 9th, the Ministry of Internal Affairs and Communications announced the results of its August household survey.', '家計調査 is a monthly survey of what households earn and spend.'],
            ['二人[ふたり]以上[いじょう]の世帯[せたい]の消費[しょうひ]支出[ししゅつ]は、物価[ぶっか]の変動[へんどう]を除[のぞ]いた実質[じっしつ]で、去年[きょねん]の8月[がつ]より3.1パーセント減[へ]りました。', 'Consumer spending by households of two or more people fell 3.1 percent from last August in real terms, excluding price changes.', '実質 "real terms" means the effect of rising prices has been taken out.'],
            ['前[まえ]の年[とし]を下回[したまわ]るのは、九[きゅう]か月[げつ]連続[れんぞく]です。', 'It has fallen below the previous year for nine months in a row.', '連続 "in a row".'],
            ['項目[こうもく]別[べつ]では、光熱[こうねつ]・水道[すいどう]が5.2パーセント、食料[しょくりょう]が1.4パーセント減[へ]りました。', 'By item, utilities (fuel, light and water) fell 5.2 percent and food fell 1.4 percent.', '光熱・水道 covers electricity, gas and water bills.'],
            ['前[まえ]の月[つき]と比[くら]べると、季節[きせつ]の影響[えいきょう]を除[のぞ]いた数字[すうじ]で0.1パーセント増[ふ]えました。', 'Compared with the previous month, it rose 0.1 percent when the effect of the season is removed.'],
            ['ただ、専門家[せんもんか]が予想[よそう]していた増[ふ]え方[かた]よりは小[ちい]さかったです。', 'However, the rise was smaller than the experts had expected.', 'Economists had expected a rise of about 0.5 percent.'],
            ['去年[きょねん]と比[くら]べた減[へ]り方[かた]は、専門家[せんもんか]の予想[よそう]より小[ちい]さかったです。', 'The size of the yearly drop was smaller than the experts had predicted.', 'The forecast was for a drop of about 3.5 to 3.6 percent.'],
          ],
        },
        N3: {
          title: '8月[がつ]の家計[かけい]支出[ししゅつ]、実質[じっしつ]3.1パーセント減[げん]　九[きゅう]カ月[げつ]連続[れんぞく]のマイナス',
          lines: [
            ['総務省[そうむしょう]が九日[ここのか]発表[はっぴょう]した8月[がつ]の家計調査[かけいちょうさ]によると、二人[ふたり]以上[いじょう]の世帯[せたい]の消費[しょうひ]支出[ししゅつ]は、物価[ぶっか]変動[へんどう]を除[のぞ]いた実質[じっしつ]で前年[ぜんねん]同月[どうげつ]比[ひ]3.1パーセント減[げん]となった。', 'According to the August household survey released by the Ministry of Internal Affairs and Communications on the 9th, consumer spending by households of two or more people fell 3.1 percent from a year earlier in real terms.', '前年同月比 "compared with the same month a year earlier".'],
            ['前年[ぜんねん]を下回[したまわ]るのは九[きゅう]カ月[げつ]連続[れんぞく]で、市場[しじょう]の予想[よそう]よりは減少[げんしょう]幅[はば]が小[ちい]さかった。', 'It was below the previous year for the ninth month in a row, though the fall was smaller than the market had expected.', '減少幅 "the size of the decline". Forecasts were for a fall of about 3.5 to 3.6 percent.'],
            ['項目[こうもく]別[べつ]では、光熱[こうねつ]・水道[すいどう]が5.2パーセント、食料[しょくりょう]が1.4パーセントそれぞれ減[へ]った。', 'By item, utilities fell 5.2 percent and food 1.4 percent.', 'それぞれ "respectively, each".'],
            ['一方[いっぽう]、交通[こうつう]・通信[つうしん]は前年[ぜんねん]を下回[したまわ]らず、自動車[じどうしゃ]への支出[ししゅつ]がわずかに増[ふ]えた。', 'On the other hand, transport and communication did not fall below the previous year, and spending on cars rose slightly.'],
            ['前[まえ]の月[つき]と比[くら]べると、季節[きせつ]調整[ちょうせい]済[ず]みで0.1パーセント増[ぞう]となったが、市場[しじょう]の予想[よそう]の0.5パーセント増[ぞう]には届[とど]かなかった。', 'Compared with the previous month, it rose 0.1 percent on a seasonally adjusted basis, but fell short of the 0.5 percent rise the market had expected.', '季節調整 removes regular seasonal ups and downs so months can be compared.'],
            ['家計調査[かけいちょうさ]は、全国[ぜんこく]の世帯[せたい]の収入[しゅうにゅう]や支出[ししゅつ]を毎月[まいつき]調[しら]べる統計[とうけい]で、景気[けいき]を見[み]る材料[ざいりょう]の一[ひと]つになっている。', 'The household survey is a statistic that checks the income and spending of households nationwide every month, and is one of the indicators used to read the economy.'],
          ],
        },
      },
    },
    {
      id: '2026-10-12-prudential',
      date: '2026-10-12',
      emoji: '🏢',
      titleEn: 'Regulator orders Prudential Life and Gibraltar Life to stop new sales for over three months after employee fraud',
      sources: [
        { name: 'nippon.com (Jiji)', url: 'https://www.nippon.com/en/news/yjj2026100900686/' },
        { name: 'The Japan Times', url: 'https://www.japantimes.co.jp/business/2026/10/09/companies/prudential-business-suspension-order/' },
        { name: 'Prudential Financial', url: 'https://news.prudential.com/us-en/latest-news/prudential-news/2026/q1/PRUDENTIAL-OF-JAPAN-IMPLEMENTS-VOLUNTARY-90-DAY-SUSPENSION-OF-NEW-SALES-TO-ADDRESS-PREVIOUSLY-DISCLOSED-EMPLOYEE-MISCONDUCT' },
      ],
      levels: {
        N5: {
          title: '保険[ほけん]の会社[かいしゃ]が、新[あたら]しい保険[ほけん]を売[う]れなくなります',
          lines: [
            ['九日[ここのか]、国[くに]は二[ふた]つの保険[ほけん]の会社[かいしゃ]に「新[あたら]しい保険[ほけん]を売[う]ってはいけません」と言[い]いました。', 'On the 9th, the government told two insurance companies, "You must not sell new insurance."', '国 here is the Financial Services Agency (金融庁), which supervises banks and insurers.'],
            ['会社[かいしゃ]の名前[なまえ]は、プルデンシャル生命[せいめい]とジブラルタ生命[せいめい]です。', 'The companies are Prudential Life and Gibraltar Life.', '生命 in 生命保険 means "life": 生命保険 = life insurance.'],
            ['この会社[かいしゃ]で働[はたら]いていた人[ひと]たちが、お客[きゃく]さんのお金[かね]をだまして取[と]りました。', 'People who worked at the company tricked customers and took their money.'],
            ['取[と]られたお金[かね]は、全部[ぜんぶ]で60億円[おくえん]より多[おお]いと言[い]われています。', 'The money taken is said to be more than 6 billion yen in total.', '億 is a hundred million: 60億円 = 6,000,000,000 yen.'],
            ['十三日[じゅうさんにち]から来年[らいねん]の一月[いちがつ]の終[お]わりまで、新[あたら]しい保険[ほけん]は売[う]れません。', 'From the 13th until the end of January next year, they cannot sell new insurance.'],
            ['今[いま]、保険[ほけん]に入[はい]っている人[ひと]は、これからも、お金[かね]をもらうことができます。', 'People who already have insurance can continue to receive payments.'],
          ],
        },
        N4: {
          title: '金融庁[きんゆうちょう]、プルデンシャル生命[せいめい]などに一部[いちぶ]業務[ぎょうむ]停止[ていし]命令[めいれい]',
          lines: [
            ['金融庁[きんゆうちょう]は九日[ここのか]、プルデンシャル生命[せいめい]とジブラルタ生命[せいめい]に、一部[いちぶ]業務[ぎょうむ]停止[ていし]命令[めいれい]を出[だ]しました。', 'On the 9th, the Financial Services Agency issued a partial business suspension order to Prudential Life and Gibraltar Life.', '一部業務停止命令: an order to stop part of a business (here, new sales), not the whole company.'],
            ['十三日[じゅうさんにち]から来年[らいねん]1月[がつ]31日[にち]まで、新[あたら]しい保険[ほけん]の契約[けいやく]を結[むす]ぶことができません。', 'From the 13th until January 31 next year, they cannot sign new insurance contracts.', '契約を結ぶ "sign a contract"; 〜ことができません "cannot".'],
            ['会社[かいしゃ]で働[はたら]いていた人[ひと]たちが、お客[きゃく]さんからお金[かね]をだまし取[と]っていたことが分[わ]かったからです。', 'This is because it came to light that people who had worked at the company had been swindling customers out of money.', 'だまし取る "swindle, take by deceit".'],
            ['だまし取[と]られたお金[かね]は、合計[ごうけい]で60億円[おくえん]を超[こ]えるとされています。', 'The money taken is said to exceed 6 billion yen in total.', '〜とされています "is regarded as …" — the news is passing on a figure from reports.'],
            ['金融庁[きんゆうちょう]は、営業[えいぎょう]成績[せいせき]を何[なに]より大切[たいせつ]にする会社[かいしゃ]の風土[ふうど]が問題[もんだい]だったと指摘[してき]しました。', 'The agency pointed out that the company culture of valuing sales results above all else was the problem.', '風土 "climate, culture (of an organization)"; 何より "more than anything".'],
            ['親会社[おやがいしゃ]にも、業務[ぎょうむ]を直[なお]すように命[めい]じる業務[ぎょうむ]改善[かいぜん]命令[めいれい]が出[だ]されました。', 'An order to improve its operations was also issued to the parent company.'],
            ['すでに保険[ほけん]に入[はい]っている人[ひと]への保険金[ほけんきん]の支払[しはら]いは、これまでどおり続[つづ]きます。', 'Payments to people who already have insurance will continue as before.', '保険金 "insurance payout".'],
          ],
        },
        N3: {
          title: '金融庁[きんゆうちょう]、プルデンシャル生命[せいめい]などに3カ月[げつ]超[こ]の一部[いちぶ]業務[ぎょうむ]停止[ていし]命令[めいれい]',
          lines: [
            ['金融庁[きんゆうちょう]は九日[ここのか]、元[もと]社員[しゃいん]らが顧客[こきゃく]から金銭[きんせん]をだまし取[と]っていた問題[もんだい]で、プルデンシャル生命[せいめい]とジブラルタ生命[せいめい]に対[たい]し、一部[いちぶ]業務[ぎょうむ]停止[ていし]命令[めいれい]を出[だ]した。', 'On the 9th, over the problem of former employees and others swindling customers out of money, the Financial Services Agency issued a partial business suspension order to Prudential Life and Gibraltar Life.', '〜に対し "toward, against" — the formal newspaper form of 〜に対して.'],
            ['停止[ていし]期間[きかん]は十三日[じゅうさんにち]から来年[らいねん]1月[がつ]31日[にち]までで、この間[あいだ]は新規[しんき]の保険[ほけん]契約[けいやく]を結[むす]ぶことができない。', 'The suspension runs from the 13th to January 31 next year, and during that time they cannot sign new insurance contracts.', '新規 "new (customers, contracts)".'],
            ['被害[ひがい]の総額[そうがく]は60億円[おくえん]を超[こ]えるとされ、金融庁[きんゆうちょう]は営業[えいぎょう]成績[せいせき]を最優先[さいゆうせん]する企業[きぎょう]風土[ふうど]を長年[ながねん]放置[ほうち]したことが原因[げんいん]だと指摘[してき]した。', 'The total damage is said to exceed 6 billion yen, and the agency pointed out that the cause was leaving a corporate culture that put sales results first untouched for many years.', '放置 "leave as it is, neglect".'],
            ['親会社[おやがいしゃ]のプルデンシャル・ホールディング・オブ・ジャパンには、業務[ぎょうむ]改善[かいぜん]命令[めいれい]を出[だ]した。', 'The parent company, Prudential Holdings of Japan, was given a business improvement order.', '業務改善命令 is milder than a suspension: it orders a company to fix how it operates.'],
            ['すでに契約[けいやく]している顧客[こきゃく]への保険金[ほけんきん]の支払[しはら]いなどは、これまでどおり続[つづ]く。', 'Payments to customers who already have contracts will continue as before.'],
            ['プルデンシャル生命[せいめい]は、今年[ことし]2月[がつ]から新規[しんき]の販売[はんばい]を自主的[じしゅてき]に止[と]めている。', 'Prudential Life has been voluntarily holding off new sales since February this year.', '自主的に "of one\'s own accord".'],
          ],
        },
      },
    },
    {
      id: '2026-10-12-mmx',
      date: '2026-10-12',
      emoji: '🚀',
      titleEn: 'Japan\'s MMX probe to launch on the 20th, aiming to bring back samples from Mars\'s moon Phobos',
      sources: [
        { name: 'JAXA', url: 'https://www.jaxa.jp/press/2026/08/20260820-1_j.html' },
        { name: 'The Japan Times', url: 'https://www.japantimes.co.jp/news/2026/08/20/japan/science-health/mars-mission-october-launch/' },
        { name: 'sorae', url: 'https://sorae.info/space/20260821-mmx.html' },
      ],
      levels: {
        N5: {
          title: '火星[かせい]の月[つき]へ行[い]くロケットが、もうすぐ飛[と]びます',
          lines: [
            ['日本[にほん]は、二十日[はつか]の朝[あさ]早[はや]く、ロケットを飛[と]ばす予定[よてい]です。', 'Japan plans to launch a rocket early in the morning on the 20th.', '二十日 is read はつか, not にじゅうにち.'],
            ['ロケットは種子島[たねがしま]から飛[と]びます。', 'The rocket will take off from Tanegashima.', 'Tanegashima is a small island in the south of Japan where the space center is.'],
            ['このロケットは「H3」で、「MMX」という探査機[たんさき]を運[はこ]びます。', 'This rocket is the "H3", and it will carry a probe called "MMX".', '探査機 "space probe": a machine sent to explore.'],
            ['MMXは、火星[かせい]の月[つき]の「フォボス」に行[い]きます。', 'MMX will go to Phobos, a moon of Mars.'],
            ['フォボスで砂[すな]や石[いし]を取[と]って、地球[ちきゅう]に持[も]って帰[かえ]ります。', 'It will collect sand and rocks on Phobos and bring them back to Earth.'],
            ['地球[ちきゅう]に帰[かえ]るのは、2031年[ねん]の予定[よてい]です。', 'It is due to return to Earth in 2031.'],
          ],
        },
        N4: {
          title: '火星[かせい]の月[つき]を調[しら]べる探査機[たんさき]「MMX」、二十日[はつか]に打[う]ち上[あ]げへ',
          lines: [
            ['JAXAは、火星[かせい]の月[つき]を調[しら]べる探査機[たんさき]「MMX」を、二十日[はつか]の午前[ごぜん]4時[じ]41分[ふん]に打[う]ち上[あ]げる予定[よてい]です。', 'JAXA plans to launch the "MMX" probe, which will study the moons of Mars, at 4:41 a.m. on the 20th.', '火星の月 = 火星の衛星 "the moons of Mars"; the news often says 衛星 for natural satellites.'],
            ['ロケットは「H3」の10号機[ごうき]で、鹿児島県[かごしまけん]の種子島[たねがしま]宇宙[うちゅう]センターから飛[と]びます。', 'The rocket is the 10th H3, and it will lift off from the Tanegashima Space Center in Kagoshima Prefecture.'],
            ['天気[てんき]などで打[う]ち上[あ]げられないときのために、十一月[じゅういちがつ]七日[なのか]まで予備[よび]の期間[きかん]があります。', 'In case it cannot launch because of the weather and so on, there is a spare period until November 7.', '予備 "spare, backup".'],
            ['MMXは、火星[かせい]の二[ふた]つの月[つき]のうち、フォボスに降[お]りて、10グラム以上[いじょう]の砂[すな]や石[いし]を集[あつ]める計画[けいかく]です。', 'Of Mars\'s two moons, MMX plans to land on Phobos and collect at least 10 grams of sand and rocks.', '〜のうち "among …".'],
            ['打[う]ち上[あ]げの約[やく]1年後[ねんご]に火星[かせい]の近[ちか]くに着[つ]き、3年[ねん]ほどそこで調[しら]べる予定[よてい]です。', 'It is expected to reach the area around Mars about a year after launch and study it there for about three years.'],
            ['集[あつ]めた砂[すな]や石[いし]を地球[ちきゅう]に持[も]って帰[かえ]るのは、2031年[ねん]の予定[よてい]です。', 'The sand and rocks it collects are due to be brought back to Earth in 2031.'],
            ['火星[かせい]の月[つき]から砂[すな]や石[いし]を持[も]ち帰[かえ]るのは、世界[せかい]で初[はじ]めてになります。', 'Bringing back sand and rocks from a moon of Mars would be a world first.', 'Japan\'s earlier probes Hayabusa and Hayabusa2 brought back samples from asteroids, not from a moon.'],
          ],
        },
        N3: {
          title: '火星[かせい]衛星[えいせい]探査機[たんさき]「MMX」、二十日[はつか]に打[う]ち上[あ]げ　フォボスの試料[しりょう]を地球[ちきゅう]へ',
          lines: [
            ['宇宙[うちゅう]航空[こうくう]研究[けんきゅう]開発[かいはつ]機構[きこう]（JAXA）は、火星[かせい]衛星[えいせい]探査機[たんさき]「MMX」を載[の]せたH3ロケット10号機[ごうき]を、二十日[はつか]午前[ごぜん]4時[じ]41分[ふん]に種子島[たねがしま]宇宙[うちゅう]センターから打[う]ち上[あ]げる予定[よてい]だ。', 'The Japan Aerospace Exploration Agency (JAXA) plans to launch the 10th H3 rocket, carrying the Martian moons probe "MMX", from the Tanegashima Space Center at 4:41 a.m. on the 20th.', '号機 counts rockets of one type: 10号機 = the 10th unit.'],
            ['悪天候[あくてんこう]などに備[そな]え、十一月[じゅういちがつ]七日[なのか]までの予備[よび]期間[きかん]も設[もう]けられている。', 'A spare period until November 7 has also been set in preparation for bad weather and the like.', '〜に備え "in preparation for …".'],
            ['MMXは火星[かせい]の衛星[えいせい]フォボスに着陸[ちゃくりく]し、10グラム以上[いじょう]の試料[しりょう]を採取[さいしゅ]する計画[けいかく]で、もう一[ひと]つの衛星[えいせい]ダイモスの観測[かんそく]も行[おこな]う。', 'MMX plans to land on Mars\'s moon Phobos and collect at least 10 grams of samples, and it will also observe the other moon, Deimos.', '試料 "sample (for study)"; 採取 "collect, take".'],
            ['探査機[たんさき]は打[う]ち上[あ]げの約[やく]1年後[ねんご]に火星[かせい]圏[けん]に到着[とうちゃく]し、約[やく]3年間[ねんかん]滞在[たいざい]する見通[みとお]しで、試料[しりょう]は2031年[ねん]に地球[ちきゅう]に戻[もど]る予定[よてい]だ。', 'The probe is expected to reach the Mars area about a year after launch and stay about three years, and the samples are due to return to Earth in 2031.', '火星圏 "the Mars region (near Mars)"; 見通し "outlook, expectation".'],
            ['当初[とうしょ]は2024年[ねん]の打[う]ち上[あ]げを予定[よてい]していたが、H3ロケットの開発[かいはつ]の遅[おく]れなどで延期[えんき]されてきた。', 'It was originally planned for launch in 2024 but has been postponed because of delays in developing the H3 rocket and other reasons.', '延期されてきた: 〜てきた shows the delay built up over time.'],
            ['成功[せいこう]すれば、火星[かせい]の衛星[えいせい]から試料[しりょう]を持[も]ち帰[かえ]る世界[せかい]初[はつ]の試[こころ]みとなる。', 'If it succeeds, it will be the world\'s first attempt to bring back samples from a Martian moon.', '世界初の "world-first" — a favorite of headlines.'],
          ],
        },
      },
    },
    {
      id: '2026-10-12-komeito',
      date: '2026-10-12',
      emoji: '🏛️',
      titleEn: 'Komeito picks Mitsunari Okamoto as its new leader',
      sources: [
        { name: 'nippon.com (Jiji)', url: 'https://www.nippon.com/en/news/yjj2026093000114/' },
        { name: 'nippon.com (Jiji)', url: 'https://www.nippon.com/en/news/yjj2026100300232/komeito-launches-new-leadership-team-under-okamoto.html' },
        { name: 'The Japan Times', url: 'https://www.japantimes.co.jp/news/2026/10/04/japan/politics/komeito-new-leadership-team/' },
      ],
      levels: {
        N5: {
          title: '公明党[こうめいとう]の新[あたら]しい代表[だいひょう]は岡本[おかもと]さん',
          lines: [
            ['公明党[こうめいとう]は、三日[みっか]に新[あたら]しい代表[だいひょう]を決[き]めました。', 'Komeito chose a new leader on the 3rd.', '代表 is the "leader" of a party. 公明党 is one of Japan\'s political parties.'],
            ['新[あたら]しい代表[だいひょう]は、岡本[おかもと]三成[みつなり]さんです。', 'The new leader is Mitsunari Okamoto.'],
            ['岡本[おかもと]さんは、前[まえ]は党[とう]の政策[せいさく]をまとめる仕事[しごと]をしていました。', 'Mr Okamoto used to be in charge of putting together the party\'s policies.', '政策 "policy".'],
            ['前[まえ]の代表[だいひょう]は、竹谷[たけや]とし子[こ]さんでした。', 'The previous leader was Toshiko Takeya.'],
            ['代表[だいひょう]の仕事[しごと]は、二年[にねん]です。', 'The term as leader is two years.'],
            ['来年[らいねん]の春[はる]には、全国[ぜんこく]で町[まち]や県[けん]の選挙[せんきょ]があります。', 'Next spring, there will be elections for towns and prefectures all over the country.', 'These are the "unified local elections" (統一地方選挙), held at the same time across Japan every four years.'],
          ],
        },
        N4: {
          title: '公明党[こうめいとう]の新[あたら]しい代表[だいひょう]に岡本[おかもと]三成[みつなり]氏[し]',
          lines: [
            ['公明党[こうめいとう]は三日[みっか]、東京[とうきょう]で党大会[とうたいかい]を開[ひら]き、岡本[おかもと]三成[みつなり]氏[し]を新[あたら]しい代表[だいひょう]に選[えら]びました。', 'On the 3rd, Komeito held a party convention in Tokyo and chose Mitsunari Okamoto as its new leader.', '氏 is a polite way to refer to a man in news writing, like さん.'],
            ['岡本[おかもと]氏[し]は、これまで党[とう]の政策[せいさく]をまとめる政務[せいむ]調査[ちょうさ]会長[かいちょう]でした。', 'Mr Okamoto had been the party\'s policy chief.', '政務調査会長 is often shortened to 政調会長 (policy chief).'],
            ['前[まえ]の代表[だいひょう]の竹谷[たけや]とし子[こ]氏[し]は、任期[にんき]が終[お]わりました。', 'The previous leader, Toshiko Takeya, reached the end of her term.', '任期 "term of office".'],
            ['代表[だいひょう]の任期[にんき]は二年[にねん]です。', 'The leader\'s term is two years.'],
            ['幹事長[かんじちょう]は、西田[にしだ]実仁[まこと]氏[し]が続[つづ]けてつとめます。', 'Makoto Nishida will continue as secretary-general.', '幹事長 "secretary-general": the person who runs a party\'s daily business and elections.'],
            ['岡本[おかもと]氏[し]は、来年[らいねん]春[はる]の統一[とういつ]地方選[ちほうせん]と、2028年[ねん]の参議院[さんぎいん]選挙[せんきょ]に向[む]けて、党[とう]を立[た]て直[なお]したいと考[かんが]えています。', 'Mr Okamoto wants to rebuild the party ahead of the unified local elections next spring and the House of Councillors election in 2028.', '立て直す "rebuild, get back on track"; 〜に向けて "toward …".'],
          ],
        },
        N3: {
          title: '公明党[こうめいとう]、新代表[しんだいひょう]に岡本[おかもと]三成[みつなり]氏[し]　党[とう]の立[た]て直[なお]しが課題[かだい]',
          lines: [
            ['公明党[こうめいとう]は三日[みっか]、東京[とうきょう]都内[とない]で党大会[とうたいかい]を開[ひら]き、前[ぜん]政務[せいむ]調査[ちょうさ]会長[かいちょう]の岡本[おかもと]三成[みつなり]氏[し]を新[あたら]しい代表[だいひょう]に選[えら]んだ。', 'On the 3rd, Komeito held a party convention in Tokyo and chose Mitsunari Okamoto, its former policy chief, as the new leader.', '都内 "within Tokyo".'],
            ['任期[にんき]が満了[まんりょう]した竹谷[たけや]とし子[こ]前[ぜん]代表[だいひょう]の後任[こうにん]となる。', 'He succeeds Toshiko Takeya, the former leader, whose term has ended.', '後任 "successor"; 満了 "expiry (of a term)".'],
            ['代表[だいひょう]の任期[にんき]は二年[にねん]で、幹事長[かんじちょう]には西田[にしだ]実仁[まこと]氏[し]が留任[りゅうにん]し、新[あら]たな政調[せいちょう]会長[かいちょう]には中野[なかの]洋昌[ひろまさ]氏[し]が就[つ]いた。', 'The leader\'s term is two years; Makoto Nishida stays on as secretary-general, and Hiromasa Nakano takes the post of policy chief.', '留任 "stay in one\'s post".'],
            ['岡本[おかもと]氏[し]は、来年[らいねん]春[はる]の統一[とういつ]地方選[ちほうせん]や2028年[ねん]の参院選[さんいんせん]に向[む]け、党[とう]の立[た]て直[なお]しを急[いそ]ぐ考[かんが]えを示[しめ]している。', 'Mr Okamoto has indicated that he intends to move quickly to rebuild the party ahead of next spring\'s unified local elections and the 2028 Upper House election.', '参院選 = 参議院選挙. 〜考えを示す "to indicate one\'s intention".'],
            ['公明党[こうめいとう]は現在[げんざい]、野党[やとう]の立場[たちば]にある。', 'Komeito is currently in opposition.', '野党 "opposition party" (the opposite is 与党, the ruling party).'],
            ['政党[せいとう]をめぐる動[うご]きが続[つづ]く中[なか]で、新[あたら]しい代表[だいひょう]がどのように党[とう]の存在感[そんざいかん]を高[たか]めるのかが注目[ちゅうもく]される。', 'As moves involving the political parties continue, attention will be on how the new leader raises the party\'s presence.', '存在感 "sense of presence"; 注目される "will draw attention".'],
          ],
        },
      },
    },
    {
      id: '2026-10-11-nobel',
      date: '2026-10-11',
      emoji: '🏆',
      titleEn: 'Kensō Soai wins the Nobel Prize in Chemistry — a Japanese winner two years running',
      sources: [
        { name: 'Tokyo University of Science', url: 'https://www.tus.ac.jp/about/nobelprize2026/index.html' },
        { name: 'JST Science Portal', url: 'https://scienceportal.jst.go.jp/newsflash/20261007_n01/' },
        { name: 'nippon.com', url: 'https://www.nippon.com/ja/japan-data/h02923/' },
      ],
      levels: {
        N5: {
          title: '日本[にほん]の先生[せんせい]がノーベル賞[しょう]をもらいます',
          lines: [
            ['七日[なのか]、ノーベル化学賞[かがくしょう]をもらう人[ひと]がわかりました。', 'On the 7th, we found out who will get the Nobel Prize in Chemistry.', '化学賞 = 化学 "chemistry" + 賞 "prize".'],
            ['一人[ひとり]は、日本[にほん]の硤合[そあい]憲三[けんそう]さんです。', 'One of them is Kensō Soai from Japan.', '硤 is a very rare kanji — even Japanese readers need the furigana for this name.'],
            ['硤合[そあい]さんは七十六歳[ななじゅうろくさい]で、東京[とうきょう]の大学[だいがく]の先生[せんせい]でした。', 'Mr Soai is 76 and was a professor at a university in Tokyo.'],
            ['もう一人[ひとり]は、フランスの先生[せんせい]で、九十五歳[きゅうじゅうごさい]です。', 'The other is a professor from France, who is 95.'],
            ['硤合[そあい]さんは、とても小[ちい]さい物[もの]が自分[じぶん]で増[ふ]える、おもしろい反応[はんのう]を見[み]つけました。', 'Mr Soai discovered an interesting reaction in which very tiny things multiply by themselves.', 'The "tiny things" are molecules (分子, ぶんし).'],
            ['去年[きょねん]も、日本[にほん]の人[ひと]が化学賞[かがくしょう]をもらいました。', 'Last year, too, a Japanese person won the chemistry prize.'],
            ['十二月[じゅうにがつ]に、スウェーデンで賞[しょう]をもらいます。', 'He will receive the prize in Sweden in December.'],
          ],
        },
        N4: {
          title: '硤合[そあい]憲三[けんそう]さんにノーベル化学賞[かがくしょう]',
          lines: [
            ['スウェーデンの王立[おうりつ]科学[かがく]アカデミーは七日[なのか]、今年[ことし]のノーベル化学賞[かがくしょう]を発表[はっぴょう]しました。', 'On the 7th, the Royal Swedish Academy of Sciences announced this year\'s Nobel Prize in Chemistry.'],
            ['賞[しょう]をもらうのは、東京[とうきょう]理科[りか]大学[だいがく]の硤合[そあい]憲三[けんそう]名誉[めいよ]教授[きょうじゅ]と、フランスのアンリ・カガン名誉[めいよ]教授[きょうじゅ]の二人[ふたり]です。', 'The winners are Kensō Soai, professor emeritus at Tokyo University of Science, and Henri Kagan, professor emeritus in France.', '名誉教授 "professor emeritus": a retired professor who keeps the title.'],
            ['硤合[そあい]さんは76歳[さい]、カガンさんは95歳[さい]です。', 'Soai is 76 and Kagan is 95.'],
            ['硤合[そあい]さんは、「硤合[そあい]反応[はんのう]」と呼[よ]ばれる反応[はんのう]を見[み]つけました。', 'Soai discovered a reaction known as the "Soai reaction".', '〜と呼ばれる "called …" — the passive of 呼ぶ.'],
            ['これは、右[みぎ]と左[ひだり]の形[かたち]がある分子[ぶんし]のうち、片方[かたほう]だけが自分[じぶん]で増[ふ]えていく反応[はんのう]です。', 'It is a reaction in which, of molecules that come in a right-handed and a left-handed shape, only one kind keeps multiplying by itself.', '〜ていく: a change that goes on and on.'],
            ['体[からだ]を作[つく]る分子[ぶんし]がなぜ片方[かたほう]の形[かたち]だけなのかを考[かんが]えるヒントになると言[い]われています。', 'It is said to give a clue to why the molecules that make up our bodies come in only one of the two shapes.'],
            ['日本人[にほんじん]の化学賞[かがくしょう]は、去年[きょねん]の北川[きたがわ]進[すすむ]さんに続[つづ]いて、2年[ねん]連続[れんぞく]です。', 'Following Susumu Kitagawa last year, it\'s the second year in a row a Japanese scientist has won the chemistry prize.', '〜に続いて "following …".'],
          ],
        },
        N3: {
          title: 'ノーベル化学賞[かがくしょう]に硤合[そあい]憲三[けんそう]氏[し]　日本人[にほんじん]は2年[ねん]連続[れんぞく]',
          lines: [
            ['スウェーデン王立[おうりつ]科学[かがく]アカデミーは七日[なのか]、今年[ことし]のノーベル化学賞[かがくしょう]を東京[とうきょう]理科[りか]大学[だいがく]の硤合[そあい]憲三[けんそう]名誉[めいよ]教授[きょうじゅ]とフランスのアンリ・カガン名誉[めいよ]教授[きょうじゅ]に贈[おく]ると発表[はっぴょう]した。', 'On the 7th, the Royal Swedish Academy of Sciences announced that this year\'s Nobel Prize in Chemistry will go to Kensō Soai of Tokyo University of Science and Henri Kagan of France, both professors emeritus.', '〜に贈る "award to"; 氏 in the headline is the formal "Mr/Ms" of newspapers.'],
            ['授賞[じゅしょう]理由[りゆう]は、鏡[かがみ]に映[うつ]したように左右[さゆう]が反対[はんたい]の分子[ぶんし]のうち、片方[かたほう]だけを増[ふ]やす反応[はんのう]などの発見[はっけん]だ。', 'The prize is for discoveries such as reactions that multiply only one of a pair of mirror-image molecules.', '鏡に映したように "as if reflected in a mirror" — ように describes what something is like.'],
            ['硤合[そあい]氏[し]が見[み]つけた「硤合[そあい]反応[はんのう]」では、片方[かたほう]の形[かたち]の分子[ぶんし]がわずかに多[おお]いだけで、それが自分[じぶん]を手本[てほん]として増[ふ]え続[つづ]ける。', 'In the "Soai reaction" he found, if one shape of molecule is even slightly more common, it keeps multiplying, using itself as the model.', '〜続ける "keep doing"; 〜だけで "just by / with only".'],
            ['生命[せいめい]を作[つく]る分子[ぶんし]がなぜ片方[かたほう]の形[かたち]に偏[かたよ]っているのかという謎[なぞ]に関[かか]わる発見[はっけん]として評価[ひょうか]された。', 'It was recognised as a discovery that bears on the mystery of why the molecules of life lean to one shape.', '〜という謎 "the mystery of …": という links a whole question to the noun it explains.'],
            ['薬[くすり]や香料[こうりょう]づくりへの応用[おうよう]も期待[きたい]されている。', 'It is also expected to find uses in making medicines and fragrances.', '〜づくり (作り) "making"; 〜への is へ + の, "towards".'],
            ['日本人[にほんじん]の化学賞[かがくしょう]受賞[じゅしょう]は、昨年[さくねん]の北川[きたがわ]進[すすむ]氏[し]に続[つづ]き2年[ねん]連続[れんぞく]で、10人目[にんめ]となる。', 'It is the second year running a Japanese scientist has won the chemistry prize, after Susumu Kitagawa last year, and the tenth in all.', '昨年 is the formal 去年; 続き、 is the written 続いて.'],
            ['授賞式[じゅしょうしき]は十二月[じゅうにがつ]十日[とおか]にストックホルムで行[おこな]われる。', 'The award ceremony will be held in Stockholm on December 10.'],
          ],
        },
      },
    },
    {
      id: '2026-10-11-cyberattack',
      date: '2026-10-11',
      emoji: '💻',
      titleEn: 'Ransomware hits a SoftBank cloud company — up to 1.3 million JR Kyushu members\' email addresses may have leaked',
      sources: [
        { name: 'BleepingComputer', url: 'https://www.bleepingcomputer.com/news/security/ransomware-attack-disrupts-japans-idcf-cloud-used-by-govt-clients/' },
        { name: 'nippon.com (Jiji)', url: 'https://www.nippon.com/en/news/yjj2026100700867/' },
        { name: 'Cybernews', url: 'https://cybernews.com/security/japanese-cloud-cyberattack-railways-police-495-organizations-idcf/' },
      ],
      levels: {
        N5: {
          title: 'インターネットの会社[かいしゃ]が攻撃[こうげき]されました',
          lines: [
            ['七日[なのか]、インターネットのサービスの会社[かいしゃ]が、悪[わる]い人[ひと]たちに攻撃[こうげき]されました。', 'On the 7th, an internet service company was attacked by bad people.', '攻撃されました: the passive of 攻撃する "attack".'],
            ['この会社[かいしゃ]は、たくさんの会社[かいしゃ]や町[まち]の役所[やくしょ]のデータを持[も]っています。', 'This company keeps data for lots of companies and town offices.'],
            ['五百[ごひゃく]ぐらいの会社[かいしゃ]や役所[やくしょ]が困[こま]っています。', 'About 500 companies and offices are in trouble.'],
            ['九日[ここのか]、JR九州[きゅうしゅう]は「お客[きゃく]さんのメールアドレスが外[そと]に出[で]たかもしれません」と言[い]いました。', 'On the 9th, JR Kyushu said, "Customers\' email addresses may have got out."', 'JR九州 is the railway company of Kyushu, the big island in the south-west.'],
            ['メールアドレスは、いちばん多[おお]いと百三十万[ひゃくさんじゅうまん]ぐらいです。', 'At most, it is about 1.3 million email addresses.', '万 is ten thousand: 百三十万 = 130 × 10,000.'],
            ['知[し]らない人[ひと]からのメールに気[き]をつけてください。', 'Be careful with emails from people you don\'t know.'],
          ],
        },
        N4: {
          title: 'クラウド会社[がいしゃ]にサイバー攻撃[こうげき]　JR九州[きゅうしゅう]のメールアドレスも',
          lines: [
            ['ソフトバンクのグループ会社[がいしゃ]「IDCフロンティア」が、七日[なのか]にサイバー攻撃[こうげき]を受[う]けました。', 'IDC Frontier, a SoftBank group company, was hit by a cyberattack on the 7th.', '攻撃を受ける "be attacked" — literally "receive an attack".'],
            ['この会社[かいしゃ]は、インターネットでデータを預[あず]かる「クラウド」のサービスをしています。', 'The company runs a "cloud" service that looks after data on the internet.', '預かる "look after (something for someone)".'],
            ['攻撃[こうげき]のため、会社[かいしゃ]はシステムを止[と]めなければなりませんでした。', 'Because of the attack, the company had to shut down its systems.', '〜なければなりませんでした "had to".'],
            ['このサービスを使[つか]っている495の会社[かいしゃ]や自治体[じちたい]に影響[えいきょう]が出[で]ています。', 'The 495 companies and local governments using the service are affected.', '自治体 "local government" — a city, town or prefecture.'],
            ['JR九州[きゅうしゅう]は九日[ここのか]、ウェブ会員[かいいん]のメールアドレスが、最大[さいだい]で130万[まん]人分[にんぶん]、外[そと]に出[で]たかもしれないと発表[はっぴょう]しました。', 'On the 9th, JR Kyushu announced that the email addresses of up to 1.3 million web members may have got out.', '最大で "at most"; 〜人分 "worth for … people".'],
            ['JR東日本[ひがしにほん]も、会員[かいいん]の情報[じょうほう]が外[そと]に出[で]たかもしれないと言[い]っています。', 'JR East also says its members\' information may have got out.'],
            ['あやしいメールが来[き]ても、リンクを開[ひら]かないようにしましょう。', 'Even if a suspicious email arrives, make sure not to open the links.', '〜ても "even if"; 〜ないようにする "make sure not to".'],
          ],
        },
        N3: {
          title: 'ソフトバンク子会社[こがいしゃ]にランサムウェア攻撃[こうげき]　495の企業[きぎょう]・自治体[じちたい]に影響[えいきょう]',
          lines: [
            ['ソフトバンクの子会社[こがいしゃ]でクラウドサービスを提供[ていきょう]するIDCフロンティアは、七日[なのか]未明[みめい]にランサムウェアによる攻撃[こうげき]を受[う]け、ネットワークとシステムを停止[ていし]した。', 'IDC Frontier, a SoftBank subsidiary that provides cloud services, was hit by a ransomware attack in the early hours of the 7th and shut down its network and systems.', '未明 "before dawn"; ランサムウェア is software that locks data and demands a ransom.'],
            ['同社[どうしゃ]によると、影響[えいきょう]はサービスを利用[りよう]する495の企業[きぎょう]や自治体[じちたい]に及[およ]んでいる。', 'According to the company, the damage extends to 495 businesses and local governments that use the service.', '同社 "the same company" — news avoids repeating a name. 及ぶ "reach, extend to".'],
            ['JR九州[きゅうしゅう]は九日[ここのか]、ウェブ会員[かいいん]最大[さいだい]130万[まん]人分[にんぶん]のメールアドレスが流出[りゅうしゅつ]したおそれがあると発表[はっぴょう]した。', 'On the 9th, JR Kyushu announced that the email addresses of up to 1.3 million web members may have leaked.', '流出 "leak (of data)".'],
            ['JR東日本[ひがしにほん]グループでも、会員[かいいん]情報[じょうほう]が流出[りゅうしゅつ]した可能性[かのうせい]があるという。', 'Member data may also have leaked at the JR East group, it is reported.'],
            ['データが実際[じっさい]に盗[ぬす]まれたかどうかや、侵入[しんにゅう]の経路[けいろ]については、現在[げんざい]も調査[ちょうさ]が続[つづ]いている。', 'Whether data was actually stolen, and how the attackers got in, is still being investigated.', '〜かどうか "whether or not".'],
            ['鉄道[てつどう]や自治体[じちたい]など、社会[しゃかい]を支[ささ]えるシステムの弱[よわ]さが改[あらた]めて明[あき]らかになった形[かたち]だ。', 'The attack has once again shown how weak the systems that hold up society — railways, local governments — can be.', '〜形だ "it amounts to …" — a common way for news to sum up.'],
          ],
        },
      },
    },
    {
      id: '2026-10-11-climax-series',
      date: '2026-10-11',
      emoji: '⚾',
      titleEn: 'Baseball\'s Climax Series begins — with a new two-win advantage rule this year',
      sources: [
        { name: 'Standmate (rules & schedule)', url: 'https://standmate.jp/blog/pro-yakyu-climax-series-guide' },
        { name: 'Baseball Channel', url: 'https://www.baseballchannel.jp/npb/294388/' },
        { name: 'NPB', url: 'https://npb.jp/news/detail/20260908_03.html' },
      ],
      levels: {
        N5: {
          title: '野球[やきゅう]の「クライマックスシリーズ」が始[はじ]まりました',
          lines: [
            ['十日[とおか]、プロ野球[やきゅう]の「クライマックスシリーズ」が始[はじ]まりました。', 'On the 10th, professional baseball\'s Climax Series began.'],
            ['これは、日本[にっぽん]シリーズに出[で]るチームを決[き]める試合[しあい]です。', 'These are the games that decide which teams play in the Japan Series.', '日本シリーズ is read にっぽんシリーズ — the official name uses にっぽん.'],
            ['セ・リーグは阪神[はんしん]、パ・リーグはソフトバンクが一番[いちばん]になりました。', 'Hanshin came first in the Central League, and SoftBank in the Pacific League.', 'セ・リーグ and パ・リーグ are short for セントラル and パシフィック.'],
            ['今[いま]は、二番[にばん]と三番[さんばん]のチームが試合[しあい]をしています。', 'Right now, the second- and third-placed teams are playing.'],
            ['先[さき]に二回[にかい]勝[か]ったチームが、次[つぎ]の試合[しあい]に行[い]きます。', 'The team that wins twice first goes on to the next round.', '先に "first, before the other".'],
            ['次[つぎ]の試合[しあい]は、十四日[じゅうよっか]から始[はじ]まります。', 'The next round starts on the 14th.', '十四日 is じゅうよっか, not じゅうよんにち.'],
          ],
        },
        N4: {
          title: 'プロ野球[やきゅう]のクライマックスシリーズ開幕[かいまく]　新[あたら]しいルールも',
          lines: [
            ['プロ野球[やきゅう]のクライマックスシリーズが、十日[とおか]に始[はじ]まりました。', 'Professional baseball\'s Climax Series began on the 10th.'],
            ['日本[にっぽん]シリーズに出[で]るチームを決[き]めるために、セ・リーグとパ・リーグでそれぞれ試合[しあい]が行[おこな]われます。', 'To decide the teams for the Japan Series, games are held in each of the Central and Pacific Leagues.', '〜ために "in order to"; それぞれ "each".'],
            ['ファーストステージでは2位[い]と3位[い]のチームが戦[たたか]い、先[さき]に2勝[しょう]したチームが次[つぎ]に進[すす]みます。', 'In the First Stage, the second- and third-placed teams play, and the first to win two games goes through.', '〜位 is a ranking: 2位 "second place". 〜勝 counts wins.'],
            ['セ・リーグは東京[とうきょう]ドームで巨人[きょじん]とDeNA、パ・リーグはベルーナドームで西武[せいぶ]と日本[にっぽん]ハムが戦[たたか]っています。', 'In the Central League the Giants play DeNA at Tokyo Dome; in the Pacific League Seibu play Nippon-Ham at Belluna Dome.', '巨人 "giant" is the Yomiuri Giants; 日本ハム is also read にっぽん.'],
            ['十四日[じゅうよっか]からのファイナルステージでは、リーグで優勝[ゆうしょう]した阪神[はんしん]とソフトバンクが待[ま]っています。', 'In the Final Stage from the 14th, the league champions Hanshin and SoftBank are waiting.'],
            ['今年[ことし]から、相手[あいて]との差[さ]がとても大[おお]きいときは、優勝[ゆうしょう]したチームに2勝[しょう]のアドバンテージがつくようになりました。', 'From this year, when the gap to the opponent is very large, the champion starts with a two-win advantage.', '〜ようになりました "it has come to be that" — a new situation.'],
            ['パ・リーグでは、ソフトバンクにこの2勝[しょう]のアドバンテージがつく見込[みこ]みです。', 'In the Pacific League, SoftBank is expected to get this two-win advantage.'],
          ],
        },
        N3: {
          title: 'プロ野球[やきゅう]CS開幕[かいまく]　今季[こんき]から「2勝[しょう]アドバンテージ」',
          lines: [
            ['プロ野球[やきゅう]の日本[にっぽん]シリーズ出場[しゅつじょう]をかけたクライマックスシリーズが十日[とおか]、開幕[かいまく]した。', 'Professional baseball\'s Climax Series, with places in the Japan Series at stake, opened on the 10th.', '〜をかけた "with … at stake".'],
            ['ファーストステージはリーグ2位[い]と3位[い]による3試合[しあい]制[せい]で、先[さき]に2勝[しょう]した球団[きゅうだん]がファイナルステージに進[すす]む。', 'The First Stage is a best-of-three between the second- and third-placed teams, and the first club to two wins goes to the Final Stage.', '〜による "by, between"; 〜制 "system": 3試合制 "three-game format".'],
            ['セ・リーグは巨人[きょじん]とDeNAが東京[とうきょう]ドームで、パ・リーグは西武[せいぶ]と日本[にっぽん]ハムがベルーナドームで対戦[たいせん]している。', 'In the Central League the Giants face DeNA at Tokyo Dome, and in the Pacific League Seibu face Nippon-Ham at Belluna Dome.'],
            ['十四日[じゅうよっか]に始[はじ]まるファイナルステージでは、リーグ優勝[ゆうしょう]の阪神[はんしん]とソフトバンクが勝[か]ち上[あ]がった球団[きゅうだん]を迎[むか]え撃[う]つ。', 'In the Final Stage starting on the 14th, league champions Hanshin and SoftBank take on the clubs that come through.', '迎え撃つ "lie in wait for, take on" — a sports-news favourite.'],
            ['今季[こんき]からは、ゲーム差[さ]が10以上[いじょう]ある場合[ばあい]などに、優勝[ゆうしょう]球団[きゅうだん]のアドバンテージが1勝[しょう]から2勝[しょう]に増[ふ]える。', 'From this season, in cases such as a gap of ten or more games, the champion\'s advantage grows from one win to two.', '今季 "this season". 〜場合 "in the case of".'],
            ['パ・リーグではソフトバンクに2勝[しょう]のアドバンテージが与[あた]えられる見通[みとお]しで、新[あたら]しいルールが初[はじ]めて使[つか]われることになりそうだ。', 'In the Pacific League SoftBank is expected to be given a two-win advantage, so the new rule looks set to be used for the first time.', '見通し "outlook, expectation"; 〜ことになりそうだ "looks like it will end up …".'],
          ],
        },
      },
    },
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
