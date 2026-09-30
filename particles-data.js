(function (global) {
  'use strict';

  // Particle fill-in-the-blank quiz data. Each sentence has one particle
  // blanked out; the multiple-choice quiz in app.js offers the correct
  // particle plus distractors drawn from PARTICLE_DISTRACTOR_GROUPS below.
  //
  // Sentences use inline `kanji[reading]` markup (e.g. "学生[がくせい]")
  // instead of hand-written <ruby> tags — parseFurigana() expands that into
  // ruby HTML for furigana-on display and strips it to plain text for
  // furigana-off display, so every sentence is written once.
  function parseFurigana(text) {
    const html = text.replace(/([一-鿿]+)\[([^\]]+)\]/g, '<ruby>$1<rp>(</rp><rt>$2</rt><rp>)</rp></ruby>');
    const plain = text.replace(/([一-鿿]+)\[([^\]]+)\]/g, '$1');
    return { html, plain };
  }

  // Order they appear as toggles on the setup screen.
  global.PARTICLE_LIST = ['は', 'が', 'を', 'に', 'で', 'へ', 'と', 'も', 'の', 'や'];

  global.PARTICLE_ROMAJI = {
    'は': 'wa', 'が': 'ga', 'を': 'o', 'に': 'ni', 'で': 'de',
    'へ': 'e', 'と': 'to', 'も': 'mo', 'の': 'no', 'や': 'ya',
  };

  // Plausible-but-wrong choices for each particle — picked so none of them
  // would also be grammatically correct in that particle's own sentences
  // below, so every question has exactly one right answer.
  global.PARTICLE_DISTRACTOR_GROUPS = {
    'は': ['が', 'も', 'の'],
    'が': ['は', 'を', 'の'],
    'を': ['が', 'に', 'で'],
    'に': ['で', 'へ', 'と'],
    'で': ['に', 'へ', 'と'],
    'へ': ['で', 'と', 'も'],
    'と': ['や', 'に', 'も'],
    'も': ['は', 'が', 'と'],
    'の': ['が', 'は', 'と'],
    'や': ['と', 'も', 'の'],
  };

  // Shown after a wrong answer, so you know why the correct particle was
  // right — one general rule per particle rather than a per-sentence note,
  // since most sentences below are just different examples of the same
  // core use (or two of them).
  global.PARTICLE_EXPLANATIONS = {
    'は': 'は marks the topic of the sentence — what you\'re talking about.',
    'が': 'が marks the grammatical subject — especially for existence (いる/ある), new information ("who/what" questions), and the object of desire/ability words like 〜たい, わかる, できる, and 欲しい.',
    'を': 'を marks the direct object of an action verb — the thing the verb is done to. It also marks the space you pass through or leave for verbs like 散歩する, 歩く, 渡る, and 出る.',
    'に': 'に marks a specific point — a time, a location where something exists/happens statically (いる/ある/住む/座る/入る), or a target/indirect object (会う, 電話する, なる, あげる, 乗る).',
    'で': 'で marks where an action takes place, the means or method used to do it, the cause/reason behind it, or a scope like "the N of us" or "in total".',
    'へ': 'へ marks the direction you\'re headed with a motion verb like 行く, 来る, 帰る, or 向かう.',
    'と': 'と means "with" (doing something together with someone) or "and" when listing a complete, exhaustive set of items.',
    'も': 'も means "also / too" — it stands in for は, が, or を on the word you\'re adding to the set.',
    'の': 'の links two nouns, usually showing possession — like English\'s apostrophe-s or "of".',
    'や': 'や means "and" in a non-exhaustive list — "things like A and B", implying there could be more.',
  };

  const RAW_ITEMS = [
    // は — topic marker
    { id: 'wa1', particle: 'は', before: '私[わたし]', after: '学生[がくせい]です。', en: 'I am a student.' },
    { id: 'wa2', particle: 'は', before: 'これ', after: '私[わたし]の傘[かさ]です。', en: 'This is my umbrella.' },
    { id: 'wa3', particle: 'は', before: '田中[たなか]さん', after: '先生[せんせい]です。', en: 'Mr. Tanaka is a teacher.' },
    { id: 'wa4', particle: 'は', before: '今日[きょう]', after: '晴[は]れです。', en: 'Today is sunny.' },
    { id: 'wa5', particle: 'は', before: '日本語[にほんご]', after: '難[むずか]しいです。', en: 'Japanese is difficult.' },
    { id: 'wa6', particle: 'は', before: 'この本[ほん]', after: '面白[おもしろ]いです。', en: 'This book is interesting.' },
    { id: 'wa7', particle: 'は', before: '山田[やまだ]さん', after: 'アメリカ人[じん]です。', en: 'Mr. Yamada is American.' },
    { id: 'wa8', particle: 'は', before: '東京[とうきょう]', after: '日本[にほん]の首都[しゅと]です。', en: 'Tokyo is the capital of Japan.' },
    { id: 'wa9', particle: 'は', before: '私[わたし]の誕生日[たんじょうび]', after: '九月[くがつ]です。', en: 'My birthday is in September.' },
    { id: 'wa10', particle: 'は', before: 'この魚[さかな]', after: '新鮮[しんせん]です。', en: 'This fish is fresh.' },
    { id: 'wa11', particle: 'は', before: '兄[あに]', after: '医者[いしゃ]です。', en: 'My older brother is a doctor.' },
    { id: 'wa12', particle: 'は', before: 'あの猫[ねこ]', after: '白[しろ]いです。', en: 'That cat is white.' },
    { id: 'wa13', particle: 'は', before: 'この店[みせ]', after: '八時[はちじ]に閉[し]まります。', en: 'This shop closes at eight o’clock.' },
    { id: 'wa14', particle: 'は', before: '田中[たなか]さんの犬[いぬ]', after: '大[おお]きいです。', en: 'Mr. Tanaka’s dog is big.' },
    { id: 'wa15', particle: 'は', before: '明日[あした]', after: '忙[いそが]しいです。', en: 'Tomorrow I’m busy.' },
    { id: 'wa16', particle: 'は', before: '冬[ふゆ]', after: '寒[さむ]いです。', en: 'Winter is cold.' },
    { id: 'wa17', particle: 'は', before: 'このレストラン', after: '有名[ゆうめい]です。', en: 'This restaurant is famous.' },
    { id: 'wa18', particle: 'は', before: '山田[やまだ]さんの部屋[へや]', after: '綺麗[きれい]です。', en: 'Mr. Yamada’s room is clean.' },
    { id: 'wa19', particle: 'は', before: '私[わたし]の趣味[しゅみ]', after: '読書[どくしょ]です。', en: 'My hobby is reading.' },
    { id: 'wa20', particle: 'は', before: 'あの映画[えいが]', after: '面白[おもしろ]かったです。', en: 'That movie was interesting.' },

    // が — subject marker (existence, ability/desire, new information)
    { id: 'ga1', particle: 'が', before: '誰[だれ]', after: '来[き]ましたか。', en: 'Who came?' },
    { id: 'ga2', particle: 'が', before: '猫[ねこ]', after: 'います。', en: 'There is a cat.' },
    { id: 'ga3', particle: 'が', before: '空[そら]に星[ほし]', after: '見[み]えます。', en: 'I can see stars in the sky.' },
    { id: 'ga4', particle: 'が', before: '日本語[にほんご]', after: 'わかります。', en: 'I understand Japanese.' },
    { id: 'ga5', particle: 'が', before: '山田[やまだ]さんは車[くるま]', after: 'あります。', en: 'Mr. Yamada has a car.' },
    { id: 'ga6', particle: 'が', before: '頭[あたま]', after: '痛[いた]いです。', en: 'My head hurts.' },
    { id: 'ga7', particle: 'が', before: '教室[きょうしつ]に学生[がくせい]', after: '二十人[にじゅうにん]います。', en: 'There are twenty students in the classroom.' },
    { id: 'ga8', particle: 'が', before: '冷蔵庫[れいぞうこ]に卵[たまご]', after: 'ありますか。', en: 'Is there an egg in the fridge?' },
    { id: 'ga9', particle: 'が', before: '私[わたし]はテニス', after: 'できます。', en: 'I can play tennis.' },
    { id: 'ga10', particle: 'が', before: '山田[やまだ]さんはピアノ', after: '上手[じょうず]です。', en: 'Mr. Yamada is good at piano.' },
    { id: 'ga11', particle: 'が', before: '私[わたし]は数学[すうがく]', after: '苦手[にがて]です。', en: 'I’m bad at math.' },
    { id: 'ga12', particle: 'が', before: '喉[のど]', after: '痛[いた]いです。', en: 'My throat hurts.' },
    { id: 'ga13', particle: 'が', before: 'お金[かね]', after: 'ありません。', en: 'I don’t have any money.' },
    { id: 'ga14', particle: 'が', before: 'この歌[うた]', after: '好[す]きです。', en: 'I like this song.' },
    { id: 'ga15', particle: 'が', before: '誰[だれ]', after: 'ドアを開[あ]けましたか。', en: 'Who opened the door?' },
    { id: 'ga16', particle: 'が', before: '何[なに]', after: '欲[ほ]しいですか。', en: 'What do you want?' },
    { id: 'ga17', particle: 'が', before: '木[き]の下[した]に猫[ねこ]', after: 'います。', en: 'There is a cat under the tree.' },
    { id: 'ga18', particle: 'が', before: '雨[あめ]', after: '降[ふ]っています。', en: 'It is raining.' },
    { id: 'ga19', particle: 'が', before: '頭[あたま]', after: 'いいですね。', en: 'You’re smart.' },
    { id: 'ga20', particle: 'が', before: '目[め]', after: '大[おお]きいです。', en: 'Her eyes are big.' },

    // を — direct object marker
    { id: 'wo1', particle: 'を', before: 'パン', after: '食[た]べます。', en: 'I eat bread.' },
    { id: 'wo2', particle: 'を', before: '手紙[てがみ]', after: '書[か]きます。', en: 'I write a letter.' },
    { id: 'wo3', particle: 'を', before: '音楽[おんがく]', after: '聞[き]きます。', en: 'I listen to music.' },
    { id: 'wo4', particle: 'を', before: 'テレビ', after: '見[み]ます。', en: 'I watch TV.' },
    { id: 'wo5', particle: 'を', before: '新聞[しんぶん]', after: '読[よ]みます。', en: 'I read the newspaper.' },
    { id: 'wo6', particle: 'を', before: '家[いえ]', after: '出[で]ます。', en: 'I leave the house.' },
    { id: 'wo7', particle: 'を', before: 'コーヒー', after: '飲[の]みます。', en: 'I drink coffee.' },
    { id: 'wo8', particle: 'を', before: '宿題[しゅくだい]', after: 'します。', en: 'I do homework.' },
    { id: 'wo9', particle: 'を', before: '花[はな]', after: '買[か]います。', en: 'I buy flowers.' },
    { id: 'wo10', particle: 'を', before: '車[くるま]', after: '洗[あら]います。', en: 'I wash the car.' },
    { id: 'wo11', particle: 'を', before: 'ドア', after: '閉[し]めます。', en: 'I close the door.' },
    { id: 'wo12', particle: 'を', before: '電気[でんき]', after: '消[け]します。', en: 'I turn off the light.' },
    { id: 'wo13', particle: 'を', before: '靴[くつ]', after: '脱[ぬ]ぎます。', en: 'I take off my shoes.' },
    { id: 'wo14', particle: 'を', before: '部屋[へや]', after: '掃除[そうじ]します。', en: 'I clean the room.' },
    { id: 'wo15', particle: 'を', before: '友達[ともだち]', after: '待[ま]ちます。', en: 'I wait for my friend.' },
    { id: 'wo16', particle: 'を', before: '橋[はし]', after: '渡[わた]ります。', en: 'I cross the bridge.' },
    { id: 'wo17', particle: 'を', before: '歯[は]', after: '磨[みが]きます。', en: 'I brush my teeth.' },
    { id: 'wo18', particle: 'を', before: '服[ふく]', after: '洗濯[せんたく]します。', en: 'I do the laundry.' },
    { id: 'wo19', particle: 'を', before: '傘[かさ]', after: '忘[わす]れました。', en: 'I forgot my umbrella.' },
    { id: 'wo20', particle: 'を', before: '手紙[てがみ]', after: '送[おく]りました。', en: 'I sent a letter.' },

    // に — time, existence location, target/indirect object, result of change
    { id: 'ni1', particle: 'に', before: '七時[しちじ]', after: '起[お]きます。', en: 'I get up at seven o’clock.' },
    { id: 'ni2', particle: 'に', before: '机[つくえ]の上[うえ]', after: '本[ほん]があります。', en: 'There is a book on the desk.' },
    { id: 'ni3', particle: 'に', before: '友達[ともだち]', after: '電話[でんわ]をかけます。', en: 'I make a phone call to my friend.' },
    { id: 'ni4', particle: 'に', before: '山田[やまだ]さんは先生[せんせい]', after: 'なりました。', en: 'Mr. Yamada became a teacher.' },
    { id: 'ni5', particle: 'に', before: '毎朝[まいあさ]八時[はちじ]', after: '家[いえ]を出[で]ます。', en: 'I leave home at eight every morning.' },
    { id: 'ni6', particle: 'に', before: '誕生日[たんじょうび]', after: 'プレゼントをもらいました。', en: 'I received a present for my birthday.' },
    { id: 'ni7', particle: 'に', before: '九時[くじ]', after: '寝[ね]ます。', en: 'I go to bed at nine o’clock.' },
    { id: 'ni8', particle: 'に', before: '本棚[ほんだな]', after: '本[ほん]があります。', en: 'There are books on the bookshelf.' },
    { id: 'ni9', particle: 'に', before: '先生[せんせい]', after: '質問[しつもん]をします。', en: 'I ask the teacher a question.' },
    { id: 'ni10', particle: 'に', before: '母[はは]', after: '花[はな]をあげました。', en: 'I gave my mother flowers.' },
    { id: 'ni11', particle: 'に', before: '山田[やまだ]さん', after: '手紙[てがみ]をもらいました。', en: 'I received a letter from Mr. Yamada.' },
    { id: 'ni12', particle: 'に', before: '弟[おとうと]', after: '日本語[にほんご]を教[おし]えます。', en: 'I teach my younger brother Japanese.' },
    { id: 'ni13', particle: 'に', before: 'バス', after: '乗[の]ります。', en: 'I get on the bus.' },
    { id: 'ni14', particle: 'に', before: '六時[ろくじ]', after: '晩[ばん]ご飯[はん]を食[た]べます。', en: 'I eat dinner at six o’clock.' },
    { id: 'ni15', particle: 'に', before: '週末[しゅうまつ]', after: '映画[えいが]を見[み]ます。', en: 'On the weekend, I watch a movie.' },
    { id: 'ni16', particle: 'に', before: '田中[たなか]さんは会社[かいしゃ]', after: '電話[でんわ]をします。', en: 'Mr. Tanaka calls the company.' },
    { id: 'ni17', particle: 'に', before: '子供[こども]が椅子[いす]', after: '座[すわ]ります。', en: 'The child sits in the chair.' },
    { id: 'ni18', particle: 'に', before: '京都[きょうと]', after: '住[す]んでいます。', en: 'I live in Kyoto.' },
    { id: 'ni19', particle: 'に', before: '三月[さんがつ]', after: '日本[にほん]へ行[い]きます。', en: 'In March, I will go to Japan.' },
    { id: 'ni20', particle: 'に', before: '誕生日[たんじょうび]', after: '何[なに]が欲[ほ]しいですか。', en: 'What do you want for your birthday?' },

    // で — location of action, means, cause, scope
    { id: 'de1', particle: 'で', before: '図書館[としょかん]', after: '勉強[べんきょう]します。', en: 'I study at the library.' },
    { id: 'de2', particle: 'で', before: 'バス', after: '学校[がっこう]に行[い]きます。', en: 'I go to school by bus.' },
    { id: 'de3', particle: 'で', before: '日本語[にほんご]', after: '話[はな]します。', en: 'I speak in Japanese.' },
    { id: 'de4', particle: 'で', before: '病気[びょうき]', after: '休[やす]みました。', en: 'I was absent due to illness.' },
    { id: 'de5', particle: 'で', before: '三人[さんにん]', after: 'このケーキを作[つく]りました。', en: 'The three of us made this cake together.' },
    { id: 'de6', particle: 'で', before: 'ペン', after: '名前[なまえ]を書[か]きます。', en: 'I write my name with a pen.' },
    { id: 'de7', particle: 'で', before: '会社[かいしゃ]', after: '働[はたら]いています。', en: 'I work at the company.' },
    { id: 'de8', particle: 'で', before: '公園[こうえん]', after: '遊[あそ]びます。', en: 'I play in the park.' },
    { id: 'de9', particle: 'で', before: '自転車[じてんしゃ]', after: '駅[えき]まで行[い]きます。', en: 'I go to the station by bicycle.' },
    { id: 'de10', particle: 'で', before: '英語[えいご]', after: '話[はな]してください。', en: 'Please speak in English.' },
    { id: 'de11', particle: 'で', before: '台風[たいふう]', after: '電車[でんしゃ]が止[と]まりました。', en: 'The trains stopped because of the typhoon.' },
    { id: 'de12', particle: 'で', before: 'はさみ', after: '紙[かみ]を切[き]ります。', en: 'I cut the paper with scissors.' },
    { id: 'de13', particle: 'で', before: '三十分[さんじゅっぷん]', after: '終[お]わります。', en: 'It will finish in thirty minutes.' },
    { id: 'de14', particle: 'で', before: '家[いえ]', after: '晩[ばん]ご飯[はん]を食[た]べます。', en: 'I eat dinner at home.' },
    { id: 'de15', particle: 'で', before: '図書館[としょかん]', after: '本[ほん]を借[か]りました。', en: 'I borrowed a book at the library.' },
    { id: 'de16', particle: 'で', before: '地震[じしん]', after: '家[いえ]が壊[こわ]れました。', en: 'The house was destroyed in the earthquake.' },
    { id: 'de17', particle: 'で', before: '全部[ぜんぶ]', after: '三千円[さんぜんえん]です。', en: 'It’s three thousand yen in total.' },
    { id: 'de18', particle: 'で', before: '二人[ふたり]', after: 'カラオケに行[い]きました。', en: 'The two of us went to karaoke.' },
    { id: 'de19', particle: 'で', before: '会議室[かいぎしつ]', after: '会議[かいぎ]をします。', en: 'We hold the meeting in the meeting room.' },
    { id: 'de20', particle: 'で', before: 'スマホ', after: '写真[しゃしん]を撮[と]ります。', en: 'I take photos with my smartphone.' },

    // へ — direction of movement
    { id: 'e1', particle: 'へ', before: '明日[あした]、東京[とうきょう]', after: '行[い]きます。', en: 'Tomorrow, I will go to Tokyo.' },
    { id: 'e2', particle: 'へ', before: '田中[たなか]さんはアメリカ', after: '帰[かえ]ります。', en: 'Mr. Tanaka will return to America.' },
    { id: 'e3', particle: 'へ', before: '鳥[とり]が南[みなみ]', after: '飛[と]んで行[い]きます。', en: 'The birds fly off to the south.' },
    { id: 'e4', particle: 'へ', before: '私[わたし]たちは駅[えき]', after: '向[む]かいました。', en: 'We headed toward the station.' },
    { id: 'e5', particle: 'へ', before: '電車[でんしゃ]は大阪[おおさか]', after: '進[すす]みます。', en: 'The train advances toward Osaka.' },
    { id: 'e6', particle: 'へ', before: '来週[らいしゅう]、京都[きょうと]', after: '旅行[りょこう]に行[い]きます。', en: 'Next week, I’m going on a trip to Kyoto.' },
    { id: 'e7', particle: 'へ', before: '夏休[なつやす]みに海[うみ]', after: '行[い]きます。', en: 'During summer vacation, I go to the sea.' },
    { id: 'e8', particle: 'へ', before: '飛行機[ひこうき]で北海道[ほっかいどう]', after: '行[い]きます。', en: 'I go to Hokkaido by plane.' },
    { id: 'e9', particle: 'へ', before: '山田[やまだ]さんは来月[らいげつ]、大阪[おおさか]', after: '引[ひ]っ越[こ]します。', en: 'Mr. Yamada is moving to Osaka next month.' },
    { id: 'e10', particle: 'へ', before: 'バスは駅[えき]', after: '向[む]かっています。', en: 'The bus is heading to the station.' },
    { id: 'e11', particle: 'へ', before: '私[わたし]たちは学校[がっこう]', after: '戻[もど]りました。', en: 'We went back to school.' },
    { id: 'e12', particle: 'へ', before: '子供[こども]たちは公園[こうえん]', after: '走[はし]って行[い]きました。', en: 'The children ran to the park.' },
    { id: 'e13', particle: 'へ', before: '台風[たいふう]は北[きた]', after: '進[すす]んでいます。', en: 'The typhoon is moving north.' },
    { id: 'e14', particle: 'へ', before: 'この道[みち]はどこ', after: '続[つづ]いていますか。', en: 'Where does this road lead to?' },
    { id: 'e15', particle: 'へ', before: '私[わたし]は毎日[まいにち]、会社[かいしゃ]', after: '通[かよ]っています。', en: 'I commute to the company every day.' },
    { id: 'e16', particle: 'へ', before: '田中[たなか]さんはロンドン', after: '出発[しゅっぱつ]しました。', en: 'Mr. Tanaka departed for London.' },
    { id: 'e17', particle: 'へ', before: '私[わたし]たちは山[やま]の上[うえ]', after: '登[のぼ]りました。', en: 'We climbed up to the top of the mountain.' },
    { id: 'e18', particle: 'へ', before: '荷物[にもつ]をアメリカ', after: '送[おく]ります。', en: 'I will send the package to America.' },
    { id: 'e19', particle: 'へ', before: '猫[ねこ]が椅子[いす]の下[した]', after: '隠[かく]れました。', en: 'The cat hid under the chair.' },
    { id: 'e20', particle: 'へ', before: '私[わたし]はこれから図書館[としょかん]', after: '向[む]かいます。', en: 'I’m heading to the library now.' },

    // と — accompaniment ("with"), exhaustive listing ("and")
    { id: 'to1', particle: 'と', before: '友達[ともだち]', after: '映画[えいが]を見[み]ました。', en: 'I watched a movie with my friend.' },
    { id: 'to2', particle: 'と', before: '毎朝[まいあさ]、パン', after: '卵[たまご]を食[た]べます。', en: 'Every morning I eat bread and eggs.' },
    { id: 'to3', particle: 'と', before: '山田[やまだ]さんはお姉[ねえ]さん', after: '住[す]んでいます。', en: 'Ms. Yamada lives with her older sister.' },
    { id: 'to4', particle: 'と', before: '弟[おとうと]', after: 'テニスをしました。', en: 'I played tennis with my younger brother.' },
    { id: 'to5', particle: 'と', before: 'これ', after: 'それは同[おな]じです。', en: 'This and that are the same.' },
    { id: 'to6', particle: 'と', before: '母[はは]', after: '一緒[いっしょ]に料理[りょうり]をしました。', en: 'I cooked together with my mother.' },
    { id: 'to7', particle: 'と', before: '弟[おとうと]', after: 'ゲームをしました。', en: 'I played a game with my younger brother.' },
    { id: 'to8', particle: 'と', before: '姉[あね]', after: '買[か]い物[もの]に行[い]きました。', en: 'I went shopping with my older sister.' },
    { id: 'to9', particle: 'と', before: '先生[せんせい]', after: '話[はな]しました。', en: 'I talked with the teacher.' },
    { id: 'to10', particle: 'と', before: '山田[やまだ]さんは日本人[にほんじん]', after: '結婚[けっこん]しました。', en: 'Mr. Yamada married a Japanese person.' },
    { id: 'to11', particle: 'と', before: '兄[あに]', after: '喧嘩[けんか]しました。', en: 'I had a fight with my older brother.' },
    { id: 'to12', particle: 'と', before: '私[わたし]は毎朝[まいあさ]、りんご', after: 'バナナを食[た]べます。', en: 'Every morning I eat an apple and a banana.' },
    { id: 'to13', particle: 'と', before: '田中[たなか]さん', after: '山田[やまだ]さんは友達[ともだち]です。', en: 'Mr. Tanaka and Mr. Yamada are friends.' },
    { id: 'to14', particle: 'と', before: '子供[こども]', after: '公園[こうえん]で遊[あそ]びました。', en: 'I played with my child at the park.' },
    { id: 'to15', particle: 'と', before: 'これ', after: 'あれは違[ちが]います。', en: 'This and that are different.' },
    { id: 'to16', particle: 'と', before: '犬[いぬ]', after: '猫[ねこ]を飼[か]っています。', en: 'I keep a dog and a cat.' },
    { id: 'to17', particle: 'と', before: '友達[ともだち]', after: '映画館[えいがかん]に行[い]きました。', en: 'I went to the movie theater with my friend.' },
    { id: 'to18', particle: 'と', before: '私[わたし]は父[ちち]', after: '写真[しゃしん]を撮[と]りました。', en: 'I took a photo with my father.' },
    { id: 'to19', particle: 'と', before: '田中[たなか]さんは同僚[どうりょう]', after: '出張[しゅっちょう]しました。', en: 'Mr. Tanaka went on a business trip with his colleague.' },
    { id: 'to20', particle: 'と', before: '昨日[きのう]、友達[ともだち]', after: '電話[でんわ]で話[はな]しました。', en: 'Yesterday I talked with my friend on the phone.' },

    // も — "also / too"
    { id: 'mo1', particle: 'も', before: '山田[やまだ]さん', after: '学生[がくせい]です。', en: 'Mr. Yamada is also a student.' },
    { id: 'mo2', particle: 'も', before: '私[わたし]はりんご', after: '好[す]きです。', en: 'I like apples too.' },
    { id: 'mo3', particle: 'も', before: 'これ', after: 'いいですね。', en: 'This one is good too.' },
    { id: 'mo4', particle: 'も', before: '田中[たなか]さん', after: 'パーティーに来[き]ます。', en: 'Mr. Tanaka is also coming to the party.' },
    { id: 'mo5', particle: 'も', before: '弟[おとうと]', after: '日本語[にほんご]を勉強[べんきょう]しています。', en: 'My younger brother is also studying Japanese.' },
    { id: 'mo6', particle: 'も', before: '今日[きょう]', after: '雨[あめ]です。', en: 'Today is rainy too.' },
    { id: 'mo7', particle: 'も', before: '私[わたし]', after: '行[い]きます。', en: 'I will go too.' },
    { id: 'mo8', particle: 'も', before: 'これ', after: '好[す]きです。', en: 'I like this one too.' },
    { id: 'mo9', particle: 'も', before: '妹[いもうと]', after: '日本語[にほんご]が上手[じょうず]です。', en: 'My younger sister is also good at Japanese.' },
    { id: 'mo10', particle: 'も', before: '明日[あした]', after: '雨[あめ]です。', en: 'Tomorrow will be rainy too.' },
    { id: 'mo11', particle: 'も', before: '田中[たなか]さん', after: '会議[かいぎ]に来[き]ました。', en: 'Mr. Tanaka also came to the meeting.' },
    { id: 'mo12', particle: 'も', before: 'このケーキ', after: '美味[おい]しいです。', en: 'This cake is also delicious.' },
    { id: 'mo13', particle: 'も', before: '山田[やまだ]さんはピアノ', after: '弾[ひ]けます。', en: 'Mr. Yamada can also play the piano.' },
    { id: 'mo14', particle: 'も', before: '私[わたし]は魚[さかな]', after: '好[す]きです。', en: 'I like fish too.' },
    { id: 'mo15', particle: 'も', before: '弟[おとうと]', after: '宿題[しゅくだい]をしました。', en: 'My younger brother also did homework.' },
    { id: 'mo16', particle: 'も', before: '今日[きょう]', after: '忙[いそが]しいです。', en: 'Today is busy too.' },
    { id: 'mo17', particle: 'も', before: 'あの店[みせ]', after: '有名[ゆうめい]です。', en: 'That shop is famous too.' },
    { id: 'mo18', particle: 'も', before: '私[わたし]', after: '京都[きょうと]に住[す]んでいます。', en: 'I also live in Kyoto.' },
    { id: 'mo19', particle: 'も', before: '山田[やまだ]さん', after: '来週[らいしゅう]、旅行[りょこう]に行[い]きます。', en: 'Mr. Yamada is also going on a trip next week.' },
    { id: 'mo20', particle: 'も', before: 'このアパート', after: '静[しず]かです。', en: 'This apartment is quiet too.' },

    // の — possessive / noun modifier
    { id: 'no1', particle: 'の', before: 'これは私[わたし]', after: '本[ほん]です。', en: 'This is my book.' },
    { id: 'no2', particle: 'の', before: '山田[やまだ]さん', after: '傘[かさ]はどこですか。', en: 'Where is Mr. Yamada’s umbrella?' },
    { id: 'no3', particle: 'の', before: '日本語[にほんご]', after: '先生[せんせい]は親切[しんせつ]です。', en: 'The Japanese teacher is kind.' },
    { id: 'no4', particle: 'の', before: 'これは友達[ともだち]', after: '車[くるま]です。', en: 'This is my friend’s car.' },
    { id: 'no5', particle: 'の', before: '東京[とうきょう]', after: '天気[てんき]はいいです。', en: 'Tokyo’s weather is nice.' },
    { id: 'no6', particle: 'の', before: '私[わたし]', after: '家族[かぞく]は四人[よにん]です。', en: 'My family is four people.' },
    { id: 'no7', particle: 'の', before: 'これは田中[たなか]さん', after: 'かばんです。', en: 'This is Mr. Tanaka’s bag.' },
    { id: 'no8', particle: 'の', before: 'あれは学校[がっこう]', after: '建物[たてもの]です。', en: 'That is the school building.' },
    { id: 'no9', particle: 'の', before: 'この本[ほん]', after: '作者[さくしゃ]は有名[ゆうめい]です。', en: 'This book’s author is famous.' },
    { id: 'no10', particle: 'の', before: '私[わたし]', after: '部屋[へや]は二階[にかい]です。', en: 'My room is on the second floor.' },
    { id: 'no11', particle: 'の', before: '山田[やまだ]さん', after: '犬[いぬ]は可愛[かわい]いです。', en: 'Mr. Yamada’s dog is cute.' },
    { id: 'no12', particle: 'の', before: 'これは会社[かいしゃ]', after: '車[くるま]です。', en: 'This is the company’s car.' },
    { id: 'no13', particle: 'の', before: '田中[たなか]さん', after: '奥[おく]さんは医者[いしゃ]です。', en: 'Mr. Tanaka’s wife is a doctor.' },
    { id: 'no14', particle: 'の', before: '私[わたし]の父[ちち]', after: '趣味[しゅみ]は釣[つ]りです。', en: 'My father’s hobby is fishing.' },
    { id: 'no15', particle: 'の', before: '学校[がっこう]', after: '図書館[としょかん]は大[おお]きいです。', en: 'The school’s library is big.' },
    { id: 'no16', particle: 'の', before: 'これは友達[ともだち]', after: '傘[かさ]です。', en: 'This is my friend’s umbrella.' },
    { id: 'no17', particle: 'の', before: 'あの家[いえ]', after: '屋根[やね]は赤[あか]いです。', en: 'That house’s roof is red.' },
    { id: 'no18', particle: 'の', before: '姉[あね]', after: '誕生日[たんじょうび]は来月[らいげつ]です。', en: 'My older sister’s birthday is next month.' },
    { id: 'no19', particle: 'の', before: '会社[かいしゃ]', after: '電話番号[でんわばんごう]を教[おし]えてください。', en: 'Please tell me the company’s phone number.' },
    { id: 'no20', particle: 'の', before: 'この店[みせ]', after: 'パンは美味[おい]しいです。', en: 'This shop’s bread is delicious.' },

    // や — non-exhaustive listing ("A や B (など)")
    { id: 'ya1', particle: 'や', before: '机[つくえ]の上[うえ]に本[ほん]', after: 'ペンがあります。', en: 'There are things like a book and a pen on the desk.' },
    { id: 'ya2', particle: 'や', before: '私[わたし]は犬[いぬ]', after: '猫[ねこ]が好[す]きです。', en: 'I like animals like dogs and cats.' },
    { id: 'ya3', particle: 'や', before: '冷蔵庫[れいぞうこ]にりんご', after: '牛乳[ぎゅうにゅう]があります。', en: 'There’s stuff like apples and milk in the fridge.' },
    { id: 'ya4', particle: 'や', before: '部屋[へや]にテレビ', after: '椅子[いす]があります。', en: 'There are things like a TV and a chair in the room.' },
    { id: 'ya5', particle: 'や', before: '週末[しゅうまつ]は買[か]い物[もの]', after: '映画[えいが]を見[み]ます。', en: 'On weekends I do things like shopping and watching movies.' },
    { id: 'ya6', particle: 'や', before: '教室[きょうしつ]に学生[がくせい]', after: '先生[せんせい]がいます。', en: 'There are students, teachers, and others in the classroom.' },
    { id: 'ya7', particle: 'や', before: '本棚[ほんだな]に漫画[まんが]', after: '小説[しょうせつ]があります。', en: 'There are things like comics and novels on the bookshelf.' },
    { id: 'ya8', particle: 'や', before: 'パーティーに山田[やまだ]さん', after: '田中[たなか]さんが来[き]ました。', en: 'People like Mr. Yamada and Mr. Tanaka came to the party.' },
    { id: 'ya9', particle: 'や', before: '休[やす]みの日[ひ]は掃除[そうじ]', after: '洗濯[せんたく]をします。', en: 'On my day off, I do things like cleaning and laundry.' },
    { id: 'ya10', particle: 'や', before: '公園[こうえん]に子供[こども]', after: '大人[おとな]がいます。', en: 'There are children and adults, among others, in the park.' },
    { id: 'ya11', particle: 'や', before: 'このスーパーには魚[さかな]', after: '肉[にく]が売[う]っています。', en: 'This supermarket sells things like fish and meat.' },
    { id: 'ya12', particle: 'や', before: '旅行[りょこう]にはパスポート', after: 'お金[かね]が必要[ひつよう]です。', en: 'For travel, you need things like a passport and money.' },
    { id: 'ya13', particle: 'や', before: '箱[はこ]の中[なか]に本[ほん]', after: 'ノートがあります。', en: 'There are things like books and notebooks in the box.' },
    { id: 'ya14', particle: 'や', before: '教室[きょうしつ]に地図[ちず]', after: '写真[しゃしん]が貼[は]ってあります。', en: 'There are things like maps and photos posted in the classroom.' },
    { id: 'ya15', particle: 'や', before: '引[ひ]っ越[こ]しには箱[はこ]', after: 'テープが必要[ひつよう]です。', en: 'For moving, you need things like boxes and tape.' },
    { id: 'ya16', particle: 'や', before: '図書館[としょかん]で新聞[しんぶん]', after: '雑誌[ざっし]が読[よ]めます。', en: 'At the library, you can read things like newspapers and magazines.' },
    { id: 'ya17', particle: 'や', before: '誕生日[たんじょうび]にケーキ', after: 'プレゼントをもらいました。', en: 'For my birthday I got things like cake and presents.' },
    { id: 'ya18', particle: 'や', before: '動物園[どうぶつえん]にはパンダ', after: 'ライオンがいます。', en: 'At the zoo, there are things like pandas and lions.' },
    { id: 'ya19', particle: 'や', before: '台所[だいどころ]にお皿[さら]', after: 'コップがあります。', en: 'There are things like plates and cups in the kitchen.' },
    { id: 'ya20', particle: 'や', before: '冷蔵庫[れいぞうこ]にジュース', after: 'ビールがあります。', en: 'There is stuff like juice and beer in the fridge.' },
  ];

  global.PARTICLE_QUIZ_ITEMS = RAW_ITEMS.map(item => {
    const before = parseFurigana(item.before);
    const after = parseFurigana(item.after);
    return {
      id: item.id,
      particle: item.particle,
      en: item.en,
      beforePlain: before.plain,
      beforeHtml: before.html,
      afterPlain: after.plain,
      afterHtml: after.html,
    };
  });

})(window);
