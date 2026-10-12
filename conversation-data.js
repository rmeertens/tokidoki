// Conversation starters (conversation.html): questions you answer by writing
// a few sentences, with hints that unlock one step at a time and a sample
// answer to compare with — all different per JLPT level.
//
// A topic:
//   id     unique slug (also the page's #hash)
//   group  one of CONVERSATION_GROUPS' ids
//   q      [question, English] — a level can override it with its own `q`
//   N5, N4, N3: the hints and sample answer for that level:
//     words    'word|meaning'                 things to talk about
//     verbs    'word|meaning'                 verbs and describing words
//     grammar  'pattern|meaning|example|English of the example'
//     start    'opening|meaning'              a way to begin
//     answer   [sample answer, English]
//
// Japanese is written with furigana on every kanji run: 漢字[かんじ].
// Words and verbs can be tapped to add them to your answer, so write them in
// a form that's useful to paste (住[す]んでいます rather than 住む at N5).
(function (global) {
  'use strict';

  const CONVERSATION_GROUPS = [
    { id: 'me', name: 'About you', ja: '自分[じぶん]のこと' },
    { id: 'daily', name: 'Daily life', ja: '毎日[まいにち]の生活[せいかつ]' },
    { id: 'likes', name: 'Likes', ja: '好[す]きなもの' },
    { id: 'past', name: 'Past & future', ja: '昔[むかし]とこれから' },
    { id: 'opinion', name: 'Your opinion', ja: '意見[いけん]' },
  ];

  const CONVERSATION_TOPICS = [
    {
      id: 'introduce', group: 'me',
      q: ['自己紹介[じこしょうかい]をしてください。', 'Please introduce yourself.'],
      N5: {
        words: ['名前[なまえ]|name', '国[くに]|country', '学生[がくせい]|student', '会社員[かいしゃいん]|office worker', '趣味[しゅみ]|hobby', '〜歳[さい]|… years old'],
        verbs: ['住[す]んでいます|live (in)', '好[す]きです|like', '勉強[べんきょう]しています|am studying', '来[き]ました|came'],
        grammar: [
          'AはBです|A is B|私[わたし]はアンナです。|I am Anna.',
          '〜から来[き]ました|I come from …|ドイツから来[き]ました。|I come from Germany.',
          '〜に住[す]んでいます|I live in …|東京[とうきょう]に住[す]んでいます。|I live in Tokyo.',
        ],
        start: 'はじめまして。私[わたし]は|Nice to meet you. I am …',
        answer: ['はじめまして。私[わたし]はアンナです。ドイツから来[き]ました。今[いま]、大阪[おおさか]に住[す]んでいます。大学[だいがく]の学生[がくせい]です。趣味[しゅみ]は料理[りょうり]です。どうぞよろしくお願[ねが]いします。',
          'Nice to meet you. I\'m Anna. I come from Germany. I live in Osaka now. I\'m a university student. My hobby is cooking. Pleased to meet you.'],
      },
      N4: {
        words: ['出身[しゅっしん]|from (hometown)', '専門[せんもん]|speciality, major', '留学[りゅうがく]|studying abroad', '興味[きょうみ]|interest', '〜年前[ねんまえ]|… years ago'],
        verbs: ['働[はたら]いています|work', '始[はじ]めました|started', '興味[きょうみ]があります|am interested', '出[で]かけます|go out'],
        grammar: [
          '〜ています|a state: live, work, know|IT会社[がいしゃ]で働[はたら]いています。|I work at an IT company.',
          '〜ことです|(my hobby) is doing …|趣味[しゅみ]は写真[しゃしん]を撮[と]ることです。|My hobby is taking photos.',
          '〜て、〜|and then (joining sentences)|二年前[にねんまえ]に日本[にほん]に来[き]て、今[いま]は横浜[よこはま]にいます。|I came to Japan two years ago, and now I\'m in Yokohama.',
        ],
        start: 'はじめまして。〜と申[もう]します。|Nice to meet you. My name is … (polite)',
        answer: ['はじめまして。マイクと申[もう]します。アメリカのシアトル出身[しゅっしん]です。二年前[にねんまえ]に日本[にほん]に来[き]て、今[いま]は横浜[よこはま]のIT会社[がいしゃ]で働[はたら]いています。趣味[しゅみ]は写真[しゃしん]を撮[と]ることで、週末[しゅうまつ]はよくカメラを持[も]って出[で]かけます。日本語[にほんご]はまだ下手[へた]ですが、毎日[まいにち]少[すこ]しずつ勉強[べんきょう]しています。',
          'Nice to meet you. My name is Mike. I\'m from Seattle in the US. I came to Japan two years ago and now work at an IT company in Yokohama. My hobby is taking photos, and at weekends I often go out with my camera. My Japanese is still poor, but I study a little every day.'],
      },
      N3: {
        words: ['〜生[う]まれ|born in …', '〜育[そだ]ち|raised in …', '職業[しょくぎょう]|occupation', '目標[もくひょう]|goal', 'きっかけ|what got something started'],
        verbs: ['育[そだ]つ|grow up', '触[ふ]れる|come into contact with', '目指[めざ]す|aim for', '関[かか]わる|be involved in'],
        grammar: [
          '〜として|as (a role)|エンジニアとして働[はたら]いています。|I work as an engineer.',
          '〜をきっかけに|… was what started it|映画[えいが]をきっかけに日本語[にほんご]を始[はじ]めました。|A film got me started on Japanese.',
          '〜ようにしている|make a point of …|毎日[まいにち]日本語[にほんご]で日記[にっき]を書[か]くようにしています。|I make a point of keeping a diary in Japanese every day.',
        ],
        start: '〜生[う]まれの〜育[そだ]ちで、|Born in … and raised in …',
        answer: ['はじめまして、ソフィーです。カナダ生[う]まれのフランス育[そだ]ちで、今[いま]はパリでエンジニアとして働[はたら]いています。高校生[こうこうせい]のときに見[み]た日本[にほん]の映画[えいが]をきっかけに、日本語[にほんご]の勉強[べんきょう]を始[はじ]めました。仕事[しごと]が忙[いそが]しくても、毎日[まいにち]三十分[さんじゅっぷん]は日本語[にほんご]に触[ふ]れるようにしています。いつか日本[にほん]で働[はたら]くのが目標[もくひょう]です。',
          'Nice to meet you, I\'m Sophie. I was born in Canada and grew up in France, and now I work as an engineer in Paris. A Japanese film I saw in high school got me started on Japanese. Even when work is busy, I make a point of spending thirty minutes a day with Japanese. My goal is to work in Japan someday.'],
      },
    },
    {
      id: 'family', group: 'me',
      q: ['家族[かぞく]について教[おし]えてください。', 'Tell me about your family.'],
      N5: {
        words: ['父[ちち]|(my) father', '母[はは]|(my) mother', '兄[あに]|older brother', '姉[あね]|older sister', '弟[おとうと]|younger brother', '妹[いもうと]|younger sister', '犬[いぬ]|dog'],
        verbs: ['います|there is (people, animals)', '働[はたら]いています|works', '住[す]んでいます|lives', '優[やさ]しいです|is kind'],
        grammar: [
          '〜人家族[にんかぞく]です|we are a family of …|四人家族[よにんかぞく]です。|We\'re a family of four.',
          '〜が〜人[にん]います|I have … (people)|兄[あに]が一人[ひとり]います。|I have one older brother.',
          'Aは〜で、Bは〜です|A is …, and B is …|父[ちち]は医者[いしゃ]で、母[はは]は先生[せんせい]です。|My father is a doctor and my mother is a teacher.',
        ],
        start: '私[わたし]は〜人家族[にんかぞく]です。|We\'re a family of …',
        answer: ['私[わたし]は四人家族[よにんかぞく]です。父[ちち]と母[はは]と妹[いもうと]がいます。父[ちち]は銀行[ぎんこう]で働[はたら]いていて、母[はは]は先生[せんせい]です。妹[いもうと]は高校生[こうこうせい]です。小[ちい]さい犬[いぬ]もいます。',
          'We\'re a family of four. I have a father, a mother and a younger sister. My father works at a bank, and my mother is a teacher. My sister is a high school student. We also have a small dog.'],
      },
      N4: {
        words: ['両親[りょうしん]|parents', '兄弟[きょうだい]|brothers and sisters', '一人[ひとり]っ子[こ]|only child', '実家[じっか]|family home', '性格[せいかく]|personality', '田舎[いなか]|the countryside'],
        verbs: ['似[に]ている|resemble', '離[はな]れて住[す]む|live apart', '連絡[れんらく]する|get in touch', '言[い]われる|be told'],
        grammar: [
          '〜に似[に]ています|take after …|私[わたし]は父[ちち]に似[に]ています。|I take after my father.',
          '〜と言[い]われます|people say (to me) that …|母[はは]に似[に]ているとよく言[い]われます。|People often tell me I look like my mother.',
          '〜ようにしています|try to (as a habit)|週[しゅう]に一回[いっかい]電話[でんわ]するようにしています。|I try to call once a week.',
        ],
        start: '両親[りょうしん]は〜に住[す]んでいます。|My parents live in …',
        answer: ['両親[りょうしん]と兄[あに]が一人[ひとり]いますが、今[いま]はみんな離[はな]れて住[す]んでいます。両親[りょうしん]は田舎[いなか]の実家[じっか]で野菜[やさい]を作[つく]っていて、兄[あに]は東京[とうきょう]で働[はたら]いています。私[わたし]は顔[かお]も性格[せいかく]も父[ちち]によく似[に]ているとよく言[い]われます。なかなか会[あ]えないので、週[しゅう]に一回[いっかい]は電話[でんわ]するようにしています。',
          'I have my parents and one older brother, but we all live apart now. My parents grow vegetables at the family home in the countryside, and my brother works in Tokyo. People often tell me I take after my father in both looks and personality. We can\'t meet often, so I try to call at least once a week.'],
      },
      N3: {
        words: ['頼[たよ]りになる|dependable', '口[くち]うるさい|nagging', '年[とし]の離[はな]れた|much older/younger', '一人暮[ひとりぐ]らし|living alone', 'ありがたさ|how much something is worth (to be thankful for)'],
        verbs: ['相談[そうだん]に乗[の]る|give advice', '迷[まよ]う|be unsure', '感[かん]じる|feel', '見守[みまも]る|watch over'],
        grammar: [
          '〜からこそ|precisely because …|離[はな]れているからこそ、家族[かぞく]の大切[たいせつ]さがわかります。|It\'s precisely because we live apart that I see how important family is.',
          '〜ようになる|come to (do / understand)|母[はは]の気持[きも]ちがわかるようになりました。|I\'ve come to understand how my mother felt.',
          '〜てくれた|did (kindly) for me|いつも相談[そうだん]に乗[の]ってくれました。|She always gave me advice.',
        ],
        start: 'うちは〜人家族[にんかぞく]で、|There are … of us in my family, and …',
        answer: ['うちは五人家族[ごにんかぞく]で、私[わたし]は三人兄弟[さんにんきょうだい]の真[ま]ん中[なか]です。年[とし]の離[はな]れた姉[あね]はとても頼[たよ]りになって、進路[しんろ]に迷[まよ]ったときもいつも相談[そうだん]に乗[の]ってくれました。子供[こども]のころは母[はは]が口[くち]うるさいと思[おも]っていましたが、一人暮[ひとりぐ]らしを始[はじ]めてから、その言葉[ことば]のありがたさがわかるようになりました。離[はな]れているからこそ、家族[かぞく]の大切[たいせつ]さを感[かん]じています。',
          'There are five of us, and I\'m the middle of three children. My much older sister is very dependable — when I couldn\'t decide what to do after school, she always gave me advice. As a child I thought my mother nagged too much, but since I started living alone I\'ve come to appreciate what she said. It\'s precisely because we live apart that I feel how important family is.'],
      },
    },
    {
      id: 'friend', group: 'me',
      q: ['仲[なか]のいい友達[ともだち]はどんな人[ひと]ですか。', 'What is your good friend like?'],
      N5: {
        words: ['友達[ともだち]|friend', '背[せ]が高[たか]い|tall', '髪[かみ]が長[なが]い|has long hair', '明[あか]るい|cheerful', '面白[おもしろ]い|funny', 'クラスメート|classmate'],
        verbs: ['会[あ]います|meet', '話[はな]します|talk', '遊[あそ]びます|hang out', '行[い]きます|go'],
        grammar: [
          '〜は〜が〜です|(person) has … that is …|ケンさんは背[せ]が高[たか]いです。|Ken is tall.',
          '〜人[ひと]です|is a … person|とても優[やさ]しい人[ひと]です。|He\'s a very kind person.',
          'いっしょに〜ます|do … together|いっしょに買[か]い物[もの]に行[い]きます。|We go shopping together.',
        ],
        start: '私[わたし]の友達[ともだち]の〜さんは、|My friend … is …',
        answer: ['私[わたし]の友達[ともだち]のゆきさんは、大学[だいがく]のクラスメートです。髪[かみ]が長[なが]くて、背[せ]が高[たか]いです。とても明[あか]るくて、面白[おもしろ]い人[ひと]です。週末[しゅうまつ]はよくいっしょに買[か]い物[もの]に行[い]きます。',
          'My friend Yuki is a classmate from university. She has long hair and is tall. She\'s a very cheerful, funny person. At weekends we often go shopping together.'],
      },
      N4: {
        words: ['親友[しんゆう]|best friend', '性格[せいかく]|personality', 'にぎやか|lively', '話[はなし]が合[あ]う|get on, click', '料理教室[りょうりきょうしつ]|cooking class'],
        verbs: ['知[し]り合[あ]う|get to know', '困[こま]る|be in trouble', '話[はなし]を聞[き]く|listen', '元気[げんき]が出[で]る|cheer up'],
        grammar: [
          '〜てくれます|does … for me|いつも話[はなし]を聞[き]いてくれます。|She always listens to me.',
          '〜のに|even though …|性格[せいかく]は全然[ぜんぜん]違[ちが]うのに、話[はなし]が合[あ]います。|Even though our personalities are totally different, we get on.',
          '〜と、〜|whenever …, …|彼女[かのじょ]と話[はな]すと、元気[げんき]が出[で]ます。|Whenever I talk to her, I cheer up.',
        ],
        start: '〜とは〜で知[し]り合[あ]いました。|I met … at …',
        answer: ['親友[しんゆう]のリサとは、十年前[じゅうねんまえ]に料理教室[りょうりきょうしつ]で知[し]り合[あ]いました。私[わたし]は静[しず]かな性格[せいかく]で、リサはとてもにぎやかなので、性格[せいかく]は全然[ぜんぜん]違[ちが]うのに、なぜか話[はなし]が合[あ]います。困[こま]ったときは、いつも夜遅[よるおそ]くまで話[はなし]を聞[き]いてくれます。彼女[かのじょ]と話[はな]すと、元気[げんき]が出[で]ます。',
          'I met my best friend Lisa at a cooking class ten years ago. I\'m quiet and Lisa is very lively, so even though our personalities are totally different, somehow we get on. When I\'m in trouble, she always listens to me until late at night. Whenever I talk to her, I cheer up.'],
      },
      N3: {
        words: ['〜からの付[つ]き合[あ]い|friends since …', '正反対[せいはんたい]|complete opposite', '気[き]が合[あ]う|get along well', '遠慮[えんりょ]なく|without holding back', '相手[あいて]|the other person'],
        verbs: ['打[う]ち明[あ]ける|confide', '放[ほう]っておく|leave alone', '見習[みなら]う|follow someone\'s example', '支[ささ]え合[あ]う|support each other'],
        grammar: [
          '〜にもかかわらず|despite …|忙[いそが]しいにもかかわらず、来[き]てくれました。|Despite being busy, he came.',
          '〜かどうか|whether or not …|仕事[しごと]を辞[や]めるかどうか迷[まよ]っていました。|I couldn\'t decide whether to quit my job.',
          '〜しかいない|there\'s no one but …|そんな相手[あいて]は彼[かれ]しかいません。|He\'s the only one like that.',
        ],
        start: '〜とは〜からの付[つ]き合[あ]いです。|… and I have known each other since …',
        answer: ['中学[ちゅうがく]からの付[つ]き合[あ]いのタケシは、私[わたし]とは性格[せいかく]が正反対[せいはんたい]ですが、不思議[ふしぎ]と気[き]が合[あ]います。私[わたし]が仕事[しごと]を辞[や]めるかどうか迷[まよ]っていたとき、忙[いそが]しいにもかかわらず、遠[とお]くから会[あ]いに来[き]てくれました。何[なん]でも遠慮[えんりょ]なく打[う]ち明[あ]けられる相手[あいて]は、彼[かれ]しかいません。困[こま]っている人[ひと]を放[ほう]っておけない彼[かれ]の優[やさ]しさを、見習[みなら]いたいと思[おも]っています。',
          'Takeshi, my friend since junior high, is my complete opposite, yet strangely we get along. When I couldn\'t decide whether to quit my job, he came all that way to see me despite being busy. He\'s the only one I can tell anything to without holding back. I want to learn from his kindness — he can\'t leave anyone in trouble alone.'],
      },
    },
    {
      id: 'hometown', group: 'me',
      q: ['どんな町[まち]に住[す]んでいますか。', 'What is the town you live in like?'],
      N5: {
        words: ['町[まち]|town', '駅[えき]|station', 'スーパー|supermarket', '本屋[ほんや]|bookshop', '川[かわ]|river', 'レストラン|restaurant'],
        verbs: ['あります|there is (things)', '小[ちい]さいです|is small', '静[しず]かです|is quiet', '少[すく]ないです|there are few'],
        grammar: [
          '〜に〜があります|there is … at …|駅[えき]の前[まえ]に本屋[ほんや]があります。|There\'s a bookshop in front of the station.',
          '〜くて、〜|… and … (i-adjectives)|小[ちい]さくて、静[しず]かな町[まち]です。|It\'s a small, quiet town.',
          '〜から〜まで|from … to …|駅[えき]から家[いえ]まで十分[じゅっぷん]です。|It\'s ten minutes from the station to my home.',
        ],
        start: '私[わたし]の町[まち]は|My town is …',
        answer: ['私[わたし]の町[まち]は小[ちい]さくて、静[しず]かです。駅[えき]から家[いえ]まで歩[ある]いて十分[じゅっぷん]です。駅[えき]の前[まえ]にスーパーと本屋[ほんや]があります。近[ちか]くに大[おお]きい川[かわ]もあります。でも、レストランは少[すく]ないです。',
          'My town is small and quiet. It\'s a ten-minute walk from the station to my home. There\'s a supermarket and a bookshop in front of the station. There\'s also a big river nearby. But there aren\'t many restaurants.'],
      },
      N4: {
        words: ['自然[しぜん]|nature', '観光客[かんこうきゃく]|tourists', 'お茶[ちゃ]|tea', '富士山[ふじさん]|Mt Fuji', '晴[は]れた日[ひ]|a clear day'],
        verbs: ['引[ひ]っ越[こ]す|move (house)', '見[み]える|can be seen', '増[ふ]える|increase', '比[くら]べる|compare'],
        grammar: [
          '〜で有名[ゆうめい]です|famous for …|この町[まち]はお茶[ちゃ]で有名[ゆうめい]です。|This town is famous for tea.',
          '〜し、〜し|… and also … (giving reasons)|静[しず]かだし、自然[しぜん]も多[おお]いです。|It\'s quiet, and there\'s lots of nature too.',
          '〜やすい|easy to …|とても住[す]みやすいです。|It\'s a very easy place to live.',
        ],
        start: '去年[きょねん]、〜に引[ひ]っ越[こ]しました。|Last year I moved to …',
        answer: ['去年[きょねん]、静岡[しずおか]の小[ちい]さい町[まち]に引[ひ]っ越[こ]しました。この町[まち]はお茶[ちゃ]で有名[ゆうめい]で、晴[は]れた日[ひ]には富士山[ふじさん]も見[み]えます。東京[とうきょう]に比[くら]べると店[みせ]は少[すく]ないですが、静[しず]かだし、自然[しぜん]も多[おお]いし、とても住[す]みやすいです。最近[さいきん]は外国人[がいこくじん]の観光客[かんこうきゃく]が増[ふ]えてきました。',
          'Last year I moved to a small town in Shizuoka. The town is famous for tea, and on clear days you can see Mt Fuji. Compared with Tokyo there are fewer shops, but it\'s quiet, there\'s lots of nature, and it\'s a very easy place to live. Lately more foreign tourists have been coming.'],
      },
      N3: {
        words: ['港[みなと]|harbour', '朝市[あさいち]|morning market', '再開発[さいかいはつ]|redevelopment', '商店街[しょうてんがい]|shopping street', '治安[ちあん]|public safety'],
        verbs: ['栄[さか]える|prosper', '並[なら]ぶ|be lined up', '進[すす]む|progress', '寂[さび]しくなる|become quiet, deserted'],
        grammar: [
          '〜一方[いっぽう]で|while … (on the other hand)|便利[べんり]になった一方[いっぽう]で、古[ふる]い店[みせ]が減[へ]りました。|While it\'s become convenient, the old shops have dwindled.',
          '〜つつある|is gradually …|町[まち]は少[すこ]しずつ変[か]わりつつあります。|The town is gradually changing.',
          '〜に恵[めぐ]まれた|blessed with …|自然[しぜん]に恵[めぐ]まれた町[まち]です。|It\'s a town blessed with nature.',
        ],
        start: '私[わたし]が住[す]んでいるのは、|Where I live is …',
        answer: ['私[わたし]が住[す]んでいるのは、港[みなと]のそばにある古[ふる]い町[まち]です。昔[むかし]は漁業[ぎょぎょう]で栄[さか]えていて、今[いま]でも朝市[あさいち]には新鮮[しんせん]な魚[さかな]が並[なら]びます。数年前[すうねんまえ]に駅前[えきまえ]の再開発[さいかいはつ]が進[すす]み、便利[べんり]になった一方[いっぽう]で、昔[むかし]からある商店街[しょうてんがい]は少[すこ]しずつ寂[さび]しくなりつつあります。それでも治安[ちあん]がよく、人[ひと]も温[あたた]かいので、私[わたし]はこの町[まち]が気[き]に入[い]っています。',
          'Where I live is an old town by a harbour. It once prospered from fishing, and even now fresh fish are laid out at the morning market. A few years ago the area by the station was redeveloped; it\'s become more convenient, but the old shopping street is slowly getting quieter. Still, it\'s safe and the people are warm, so I like this town.'],
      },
    },
    {
      id: 'work', group: 'me',
      q: ['仕事[しごと]や学校[がっこう]について教[おし]えてください。', 'Tell me about your work or school.'],
      N5: {
        words: ['会社[かいしゃ]|company', '大学[だいがく]|university', '仕事[しごと]|work', '授業[じゅぎょう]|class', 'パソコン|computer', '親切[しんせつ]|kind'],
        verbs: ['働[はたら]いています|work', '勉強[べんきょう]しています|am studying', '使[つか]います|use', '忙[いそが]しいです|am busy'],
        grammar: [
          '〜で働[はたら]いています|work at …|病院[びょういん]で働[はたら]いています。|I work at a hospital.',
          '〜から〜まで|from … to …|九時[くじ]から五時[ごじ]までです。|It\'s from nine to five.',
          '〜が、〜|…, but …|忙[いそが]しいですが、楽[たの]しいです。|It\'s busy, but fun.',
        ],
        start: '私[わたし]は〜で働[はたら]いています。|I work at …',
        answer: ['私[わたし]は東京[とうきょう]の小[ちい]さい会社[かいしゃ]で働[はたら]いています。仕事[しごと]は九時[くじ]から六時[ろくじ]までです。毎日[まいにち]、パソコンを使[つか]います。仕事[しごと]は忙[いそが]しいですが、会社[かいしゃ]の人[ひと]はみんな親切[しんせつ]です。',
          'I work at a small company in Tokyo. Work is from nine to six. I use a computer every day. Work is busy, but everyone at the company is kind.'],
      },
      N4: {
        words: ['上司[じょうし]|boss', '同僚[どうりょう]|colleague', '残業[ざんぎょう]|overtime', '敬語[けいご]|polite language', '案内[あんない]|guiding, showing around', 'やりがい|sense of reward'],
        verbs: ['担当[たんとう]する|be in charge of', '入社[にゅうしゃ]する|join a company', '慣[な]れる|get used to', '教[おし]える|teach'],
        grammar: [
          '〜なければなりません|have to …|残業[ざんぎょう]しなければなりません。|I have to work overtime.',
          '〜てきました|has been (gradually) …|仕事[しごと]に慣[な]れてきました。|I\'ve been getting used to the job.',
          '〜たばかり|have just …|入社[にゅうしゃ]したばかりのころ|when I had just joined the company',
        ],
        start: '今[いま]は〜で〜を担当[たんとう]しています。|Right now I\'m in charge of … at …',
        answer: ['今[いま]は大阪[おおさか]の旅行会社[りょこうがいしゃ]で、海外[かいがい]からのお客[きゃく]さんの案内[あんない]を担当[たんとう]しています。入社[にゅうしゃ]したばかりのころは、敬語[けいご]が難[むずか]しくて大変[たいへん]でした。でも、上司[じょうし]や同僚[どうりょう]が優[やさ]しく教[おし]えてくれたので、だんだん仕事[しごと]に慣[な]れてきました。忙[いそが]しい時期[じき]は残業[ざんぎょう]しなければなりませんが、やりがいがあります。',
          'I work at a travel company in Osaka, looking after customers from abroad. When I had just joined, polite Japanese was hard and things were tough. But my boss and colleagues taught me kindly, so I\'ve gradually got used to the job. In busy periods I have to work overtime, but it\'s rewarding.'],
      },
      N3: {
        words: ['業界[ぎょうかい]|industry', '翻訳[ほんやく]|translation', '締[し]め切[き]り|deadline', '在宅勤務[ざいたくきんむ]|working from home', '正直[しょうじき]|honestly'],
        verbs: ['任[まか]される|be entrusted with', '追[お]われる|be swamped with', '関[かか]わる|be involved in', '両立[りょうりつ]する|balance (two things)'],
        grammar: [
          '〜に追[お]われる|be swamped with …|締[し]め切[き]りに追[お]われています。|I\'m swamped with deadlines.',
          '〜ものの|although …|大変[たいへん]なものの、やりがいがあります。|Although it\'s tough, it\'s rewarding.',
          '〜て〜年[ねん]になります|it\'s been … years since …|この会社[かいしゃ]に入[はい]って三年[さんねん]になります。|It\'s been three years since I joined this company.',
        ],
        start: '〜で働[はたら]いて〜年[ねん]になります。|I\'ve worked in … for … years.',
        answer: ['ゲーム業界[ぎょうかい]で働[はたら]いて五年[ごねん]になります。今[いま]は海外向[かいがいむ]けの翻訳[ほんやく]チームのリーダーを任[まか]されています。発売前[はつばいまえ]はいつも締[し]め切[き]りに追[お]われていて、正直[しょうじき]大変[たいへん]なものの、自分[じぶん]が関[かか]わったゲームが世界中[せかいじゅう]で遊[あそ]ばれるのを見[み]ると、やりがいを感[かん]じます。最近[さいきん]は在宅勤務[ざいたくきんむ]が増[ふ]えて、仕事[しごと]と家庭[かてい]を両立[りょうりつ]しやすくなりました。',
          'I\'ve worked in the games industry for five years. Now I\'m in charge of the team translating our games for overseas. Before a release I\'m always swamped with deadlines, and honestly it\'s tough, but when I see a game I worked on played all over the world, it feels worth it. Lately I work from home more, which makes it easier to balance work and family.'],
      },
    },
    {
      id: 'weekend', group: 'daily',
      q: ['週末[しゅうまつ]は何[なに]をしましたか。', 'What did you do at the weekend?'],
      N5: {
        words: ['土曜日[どようび]|Saturday', '日曜日[にちようび]|Sunday', '友達[ともだち]|friend', '映画[えいが]|movie', '公園[こうえん]|park', 'うち|home'],
        verbs: ['行[い]きました|went', '見[み]ました|watched', '休[やす]みました|rested', '話[はな]しました|talked'],
        grammar: [
          '〜ました|did … (polite past)|映画[えいが]を見[み]ました。|I watched a movie.',
          '〜と一緒[いっしょ]に|together with …|友達[ともだち]と一緒[いっしょ]に行[い]きました。|I went with a friend.',
          '〜かったです|was … (i-adjective past)|面白[おもしろ]かったです。|It was interesting.',
        ],
        start: '土曜日[どようび]は、|On Saturday, …',
        answer: ['土曜日[どようび]は友達[ともだち]と一緒[いっしょ]に映画[えいが]を見[み]ました。とても面白[おもしろ]かったです。日曜日[にちようび]はうちで休[やす]みました。夜[よる]、母[はは]と電話[でんわ]で話[はな]しました。',
          'On Saturday I watched a movie with a friend. It was very interesting. On Sunday I rested at home. In the evening I talked with my mother on the phone.'],
      },
      N4: {
        words: ['久[ひさ]しぶりに|for the first time in a while', '掃除[そうじ]|cleaning', '洗濯[せんたく]|laundry', '散歩[さんぽ]|walk', 'カフェ|café'],
        verbs: ['出[で]かける|go out', '会[あ]う|meet', '疲[つか]れる|get tired', '片付[かたづ]ける|tidy up'],
        grammar: [
          '〜たり〜たりしました|did things like … and …|掃除[そうじ]をしたり、洗濯[せんたく]をしたりしました。|I did things like cleaning and laundry.',
          '〜てから|after doing …|昼[ひる]ご飯[はん]を食[た]べてから、散歩[さんぽ]しました。|After lunch, I went for a walk.',
          '〜ないで|without doing …|どこにも出[で]かけないで、家[いえ]にいました。|I stayed home without going anywhere.',
        ],
        start: '久[ひさ]しぶりに|For the first time in a while, …',
        answer: ['土曜日[どようび]は天気[てんき]がよかったので、久[ひさ]しぶりに大学[だいがく]の友達[ともだち]に会[あ]いました。駅[えき]の近[ちか]くのカフェで昼[ひる]ご飯[はん]を食[た]べてから、公園[こうえん]を散歩[さんぽ]しました。日曜日[にちようび]はどこにも出[で]かけないで、部屋[へや]を掃除[そうじ]したり、洗濯[せんたく]をしたりしました。少[すこ]し疲[つか]れましたが、いい週末[しゅうまつ]でした。',
          'The weather was nice on Saturday, so I met a university friend for the first time in a while. We had lunch at a café near the station, then took a walk in the park. On Sunday I didn\'t go anywhere — I cleaned my room, did the laundry and so on. I got a bit tired, but it was a good weekend.'],
      },
      N3: {
        words: ['のんびり|leisurely', '家事[かじ]|housework', '気分転換[きぶんてんかん]|change of pace', '銭湯[せんとう]|public bath', '溜[た]まっていた|piled-up'],
        verbs: ['過[す]ごす|spend (time)', '済[す]ませる|get done', 'つかる|soak (in a bath)', '降[ふ]りそうだ|look like it will rain'],
        grammar: [
          '〜つもりでしたが|I meant to …, but|山[やま]に登[のぼ]るつもりでしたが、やめました。|I meant to climb a mountain, but gave up.',
          '〜ことにした|decided to …|家[いえ]でのんびりすることにしました。|I decided to take it easy at home.',
          '〜おかげで|thanks to …|ゆっくり休[やす]んだおかげで、元気[げんき]になりました。|Thanks to a good rest, I feel better.',
        ],
        start: '本当[ほんとう]は〜つもりでしたが、|I was actually going to …, but',
        answer: ['本当[ほんとう]は友達[ともだち]と山[やま]に登[のぼ]るつもりでしたが、雨[あめ]が降[ふ]りそうだったので、家[いえ]でのんびり過[す]ごすことにしました。午前中[ごぜんちゅう]は溜[た]まっていた家事[かじ]を済[す]ませて、午後[ごご]は気分転換[きぶんてんかん]に近所[きんじょ]の銭湯[せんとう]へ行[い]きました。ゆっくりお湯[ゆ]につかったおかげで、月曜日[げつようび]は元気[げんき]に仕事[しごと]を始[はじ]められました。',
          'I was actually going to climb a mountain with a friend, but it looked like rain, so I decided to take it easy at home. In the morning I got the piled-up housework done, and in the afternoon I went to the local public bath for a change of pace. Thanks to a long soak, I started work on Monday full of energy.'],
      },
    },
    {
      id: 'morning', group: 'daily',
      q: ['毎朝[まいあさ]、何[なに]をしますか。', 'What do you do every morning?'],
      N5: {
        words: ['朝[あさ]ご飯[はん]|breakfast', 'パン|bread', 'コーヒー|coffee', 'シャワー|shower', '電車[でんしゃ]|train', '〜時半[じはん]|half past …'],
        verbs: ['起[お]きます|get up', '浴[あ]びます|take (a shower)', '食[た]べます|eat', '出[で]ます|leave'],
        grammar: [
          '〜時[じ]に|at … o\'clock|七時[しちじ]に起[お]きます。|I get up at seven.',
          '〜て、〜て、〜ます|do …, then …, then …|起[お]きて、顔[かお]を洗[あら]って、朝[あさ]ご飯[はん]を食[た]べます。|I get up, wash my face and eat breakfast.',
          'それから|after that|それから、会社[かいしゃ]に行[い]きます。|After that, I go to work.',
        ],
        start: '毎朝[まいあさ]、〜時[じ]に起[お]きます。|Every morning I get up at …',
        answer: ['毎朝[まいあさ]、六時半[ろくじはん]に起[お]きます。シャワーを浴[あ]びて、朝[あさ]ご飯[はん]を食[た]べます。朝[あさ]ご飯[はん]はいつもパンとコーヒーです。それから、七時半[しちじはん]に家[いえ]を出[で]て、電車[でんしゃ]で学校[がっこう]に行[い]きます。',
          'Every morning I get up at half past six. I take a shower and eat breakfast. Breakfast is always bread and coffee. Then I leave home at half past seven and go to school by train.'],
      },
      N4: {
        words: ['目覚[めざ]まし|alarm clock', 'お弁当[べんとう]|packed lunch', '窓[まど]|window', 'ニュース|the news', 'まず|first of all'],
        verbs: ['寝坊[ねぼう]する|oversleep', '遅[おく]れる|be late', '開[あ]ける|open', '作[つく]る|make'],
        grammar: [
          '〜ながら|while …|コーヒーを飲[の]みながら、ニュースを見[み]ます。|I watch the news while drinking coffee.',
          '〜前[まえ]に|before …|出[で]かける前[まえ]に、お弁当[べんとう]を作[つく]ります。|Before I go out, I make a packed lunch.',
          '〜ないように|so as not to …|遅[おく]れないように、早[はや]く出[で]ます。|I leave early so I\'m not late.',
        ],
        start: '起[お]きたら、まず|When I get up, first …',
        answer: ['目覚[めざ]ましは六時[ろくじ]にセットしていますが、よく寝坊[ねぼう]してしまいます。起[お]きたら、まず窓[まど]を開[あ]けて、コーヒーを飲[の]みながらニュースを見[み]ます。出[で]かける前[まえ]に、昼[ひる]ご飯[はん]のお弁当[べんとう]を作[つく]ります。電車[でんしゃ]に遅[おく]れないように、七時半[しちじはん]には家[いえ]を出[で]るようにしています。',
          'My alarm is set for six, but I often oversleep. When I get up, I first open the window and watch the news while drinking coffee. Before I go out, I make a packed lunch. I try to leave home by half past seven so I don\'t miss the train.'],
      },
      N3: {
        words: ['日課[にっか]|daily routine', '二度寝[にどね]|going back to sleep', '身支度[みじたく]|getting ready', '余裕[よゆう]|room, time to spare', '早起[はやお]き|getting up early'],
        verbs: ['頭[あたま]が冴[さ]える|have a clear head', '覚[おぼ]える|memorize', '走[はし]る|run', '心[こころ]がける|make an effort to'],
        grammar: [
          '〜ことにしている|make it a rule to …|五時半[ごじはん]に起[お]きることにしています。|I make it a rule to get up at half past five.',
          '〜うちに|while it\'s still …|涼[すず]しいうちに走[はし]ります。|I run while it\'s still cool.',
          '〜ようになってから|ever since I started …|早起[はやお]きするようになってから、体調[たいちょう]がいいです。|Since I started getting up early, I\'ve felt well.',
        ],
        start: '以前[いぜん]は〜ばかりしていましたが、|I used to do nothing but …, but',
        answer: ['以前[いぜん]は二度寝[にどね]ばかりしていましたが、今[いま]は五時半[ごじはん]に起[お]きることにしています。まだ涼[すず]しいうちに近所[きんじょ]を三十分[さんじゅっぷん]ほど走[はし]って、シャワーを浴[あ]びてから身支度[みじたく]をします。朝[あさ]は頭[あたま]が冴[さ]えているので、出勤前[しゅっきんまえ]に日本語[にほんご]の単語[たんご]を覚[おぼ]えるのが日課[にっか]です。早起[はやお]きするようになってから、一日[いちにち]に余裕[よゆう]ができました。',
          'I used to keep going back to sleep, but now I make it a rule to get up at half past five. While it\'s still cool I run around the neighbourhood for about thirty minutes, then shower and get ready. My head is clear in the morning, so learning Japanese words before work is part of my routine. Since I started getting up early, my days feel less rushed.'],
      },
    },
    {
      id: 'today', group: 'daily',
      q: ['今日[きょう]はどんな一日[いちにち]でしたか。', 'How was your day today?'],
      N5: {
        words: ['朝[あさ]|morning', '昼[ひる]|noon, lunchtime', '夜[よる]|evening', 'そば|soba noodles', '忙[いそが]しい|busy', '疲[つか]れました|was tired'],
        verbs: ['起[お]きました|got up', '働[はたら]きました|worked', '帰[かえ]りました|went home', '寝[ね]ます|go to bed'],
        grammar: [
          '〜日[ひ]でした|it was a … day|忙[いそが]しい日[ひ]でした。|It was a busy day.',
          '〜てから|after …|うちに帰[かえ]ってから、テレビを見[み]ました。|After I got home, I watched TV.',
          'これから〜ます|now I\'m going to …|これから寝[ね]ます。|I\'m going to bed now.',
        ],
        start: '今日[きょう]は〜日[ひ]でした。|Today was a … day.',
        answer: ['今日[きょう]は忙[いそが]しい日[ひ]でした。朝[あさ]七時[しちじ]に起[お]きて、九時[くじ]から五時[ごじ]まで働[はたら]きました。昼[ひる]は会社[かいしゃ]の友達[ともだち]とそばを食[た]べました。うちに帰[かえ]ってから、少[すこ]し日本語[にほんご]を勉強[べんきょう]しました。とても疲[つか]れましたから、これから寝[ね]ます。',
          'Today was a busy day. I got up at seven and worked from nine to five. At lunch I ate soba with a friend from work. After I got home, I studied a little Japanese. I\'m very tired, so I\'m going to bed now.'],
      },
      N4: {
        words: ['大変[たいへん]|hard, tough', '遅刻[ちこく]|being late', '会議[かいぎ]|meeting', '資料[しりょう]|documents, materials', '気分[きぶん]|mood'],
        verbs: ['遅[おく]れる|be late (trains)', '手伝[てつだ]う|help', '間[ま]に合[あ]う|make it in time', '買[か]う|buy'],
        grammar: [
          '〜てしまいました|ended up … (regret)|会社[かいしゃ]に遅刻[ちこく]してしまいました。|I ended up being late for work.',
          '〜ことになりました|it was decided that I\'d …|急[きゅう]に資料[しりょう]を作[つく]ることになりました。|Suddenly I had to make the documents.',
          '〜おかげで|thanks to …|同僚[どうりょう]のおかげで間[ま]に合[あ]いました。|Thanks to my colleague, I made it in time.',
        ],
        start: '今日[きょう]は朝[あさ]から|From the morning, today …',
        answer: ['今日[きょう]は朝[あさ]から大変[たいへん]な一日[いちにち]でした。電車[でんしゃ]が遅[おく]れて、会社[かいしゃ]に少[すこ]し遅刻[ちこく]してしまいました。午後[ごご]は急[きゅう]に会議[かいぎ]の資料[しりょう]を作[つく]ることになりましたが、同僚[どうりょう]が手伝[てつだ]ってくれたおかげで、何[なん]とか間[ま]に合[あ]いました。帰[かえ]りに好[す]きなケーキを買[か]ったので、今[いま]は気分[きぶん]がいいです。',
          'Today was tough from the morning on. My train was late, and I ended up a little late for work. In the afternoon I suddenly had to make the documents for a meeting, but thanks to a colleague who helped, I somehow made it in time. On the way home I bought my favourite cake, so I\'m in a good mood now.'],
      },
      N3: {
        words: ['散々[さんざん]|awful', '取引先[とりひきさき]|client', '変更[へんこう]|change', '夕立[ゆうだち]|sudden evening shower', '瞬間[しゅんかん]|moment'],
        verbs: ['振[ふ]り回[まわ]される|be jerked around', '片付[かたづ]く|get sorted out', '降[ふ]られる|get caught in the rain', '癒[い]やされる|be soothed'],
        grammar: [
          '〜せいで|because of (a bad result)|寝坊[ねぼう]したせいで、朝食[ちょうしょく]を抜[ぬ]きました。|Because I overslept, I skipped breakfast.',
          '〜っぱなし|keep on … (without a break)|一日中[いちにちじゅう]立[た]ちっぱなしでした。|I was on my feet all day.',
          '〜かと思[おも]ったら|just when I thought …|晴[は]れたかと思[おも]ったら、また降[ふ]ってきました。|Just when it cleared up, it started raining again.',
        ],
        start: '今日[きょう]は、一言[ひとこと]で言[い]うと|In a word, today was …',
        answer: ['今日[きょう]は、一言[ひとこと]で言[い]うと散々[さんざん]な一日[いちにち]でした。朝[あさ]は寝坊[ねぼう]したせいで朝食[ちょうしょく]を抜[ぬ]き、昼[ひる]は取引先[とりひきさき]の急[きゅう]な変更[へんこう]に振[ふ]り回[まわ]されて、一日中[いちにちじゅう]走[はし]り回[まわ]りっぱなしでした。やっと仕事[しごと]が片付[かたづ]いたかと思[おも]ったら、帰[かえ]り道[みち]で夕立[ゆうだち]に降[ふ]られてしまいました。それでも、家[いえ]で猫[ねこ]の顔[かお]を見[み]た瞬間[しゅんかん]、一気[いっき]に癒[い]やされました。',
          'In a word, today was awful. In the morning I overslept and had to skip breakfast; at midday a client\'s sudden change sent me running around all day long. Just when I thought work was finally sorted, I got caught in an evening downpour on the way home. Still, the moment I saw my cat\'s face at home, all of it melted away.'],
      },
    },
    {
      id: 'cooking', group: 'daily',
      q: ['料理[りょうり]をしますか。', 'Do you cook?'],
      N5: {
        words: ['晩[ばん]ご飯[はん]|dinner', '卵[たまご]|egg', 'カレー|curry', '簡単[かんたん]|easy', '上手[じょうず]|good at', '下手[へた]|bad at'],
        verbs: ['作[つく]ります|make', '料理[りょうり]します|cook', '切[き]ります|cut', '買[か]います|buy'],
        grammar: [
          '時々[ときどき]〜ます|sometimes …|時々[ときどき]カレーを作[つく]ります。|Sometimes I make curry.',
          'あまり〜じゃないです|not very …|あまり上手[じょうず]じゃないです。|I\'m not very good.',
          '〜と一緒[いっしょ]に|together with …|母[はは]と一緒[いっしょ]に作[つく]ります。|I make it with my mother.',
        ],
        start: 'はい、時々[ときどき]します。|Yes, sometimes.',
        answer: ['はい、時々[ときどき]します。でも、あまり上手[じょうず]じゃないです。よくカレーや卵[たまご]の料理[りょうり]を作[つく]ります。簡単[かんたん]ですから。日曜日[にちようび]は母[はは]と一緒[いっしょ]に晩[ばん]ご飯[はん]を作[つく]ります。',
          'Yes, sometimes. But I\'m not very good. I often make curry and egg dishes, because they\'re easy. On Sundays I make dinner together with my mother.'],
      },
      N4: {
        words: ['自炊[じすい]|cooking for yourself', '外食[がいしょく]|eating out', '得意料理[とくいりょうり]|best dish', '味付[あじつ]け|seasoning', '肉[にく]じゃが|meat and potato stew'],
        verbs: ['失敗[しっぱい]する|fail, get wrong', '教[おし]えてもらう|be taught', '焼[や]く|grill, bake', '始[はじ]める|start'],
        grammar: [
          '〜ようにしています|try to (as a habit)|なるべく自炊[じすい]するようにしています。|I try to cook for myself as much as I can.',
          '〜方[かた]|how to …|母[はは]に作[つく]り方[かた]を教[おし]えてもらいました。|My mother taught me how to make it.',
          '〜ようになりました|have become able to …|おいしく作[つく]れるようになりました。|I can make it well now.',
        ],
        start: '〜てから、なるべく自炊[じすい]するようにしています。|Since …, I try to cook for myself.',
        answer: ['一人暮[ひとりぐ]らしを始[はじ]めてから、なるべく自炊[じすい]するようにしています。外食[がいしょく]は高[たか]いし、体[からだ]にもよくないからです。得意料理[とくいりょうり]は肉[にく]じゃがで、実家[じっか]に帰[かえ]ったときに母[はは]に作[つく]り方[かた]を教[おし]えてもらいました。最初[さいしょ]は味付[あじつ]けによく失敗[しっぱい]しましたが、今[いま]はかなりおいしく作[つく]れるようになりました。',
          'Since I started living alone, I try to cook for myself as much as possible, because eating out is expensive and not good for you either. My best dish is nikujaga — my mother taught me how to make it when I went home. At first I often got the seasoning wrong, but now I can make it pretty well.'],
      },
      N3: {
        words: ['作[つく]り置[お]き|cooking ahead in batches', '栄養[えいよう]バランス|balanced nutrition', '隠[かく]し味[あじ]|secret ingredient', '手料理[てりょうり]|home cooking', '好評[こうひょう]|well received'],
        verbs: ['工夫[くふう]する|find ways, be inventive', 'アレンジする|adapt (a recipe)', '招[まね]く|invite', '振[ふ]る舞[ま]う|treat (someone to food)'],
        grammar: [
          '〜ようにしている|make a point of …|週末[しゅうまつ]に作[つく]り置[お]きをするようにしています。|I make a point of cooking ahead at weekends.',
          '〜よう(に)工夫[くふう]する|find ways to …|野菜[やさい]を多[おお]めに使[つか]うよう工夫[くふう]しています。|I find ways to use more vegetables.',
          '〜好[ごの]み|to (someone\'s) taste|自分[じぶん]好[ごの]みの味[あじ]にします。|I make it to my own taste.',
        ],
        start: '料理[りょうり]は好[す]きですが、|I like cooking, but …',
        answer: ['料理[りょうり]は好[す]きですが、平日[へいじつ]は時間[じかん]がないので、週末[しゅうまつ]にまとめて作[つく]り置[お]きをするようにしています。栄養[えいよう]バランスを考[かんが]えて、野菜[やさい]を多[おお]めに使[つか]うよう工夫[くふう]しています。最近[さいきん]はネットのレシピを自分好[じぶんごの]みにアレンジするのが楽[たの]しみで、隠[かく]し味[あじ]にみそを入[い]れたカレーは家族[かぞく]にも好評[こうひょう]です。いつか友人[ゆうじん]を招[まね]いて、手料理[てりょうり]を振[ふ]る舞[ま]いたいと思[おも]っています。',
          'I like cooking, but I don\'t have time on weekdays, so I make a point of cooking in batches at the weekend. I think about balanced nutrition and find ways to use more vegetables. Lately I enjoy adapting online recipes to my own taste — my curry with miso as a secret ingredient is a hit with my family. Someday I\'d like to invite friends over and treat them to my cooking.'],
      },
    },
    {
      id: 'shopping', group: 'daily',
      q: ['最近[さいきん]、何[なに]を買[か]いましたか。', 'What have you bought recently?'],
      N5: {
        words: ['かばん|bag', '服[ふく]|clothes', '靴[くつ]|shoes', '店[みせ]|shop', '軽[かる]い|light', '〜円[えん]|… yen'],
        verbs: ['買[か]いました|bought', '持[も]って行[い]きます|take (with me)', '使[つか]います|use', '着[き]ます|wear'],
        grammar: [
          '〜で〜を買[か]いました|bought … at …|デパートで靴[くつ]を買[か]いました。|I bought shoes at a department store.',
          '〜円[えん]でした|it was … yen|三千円[さんぜんえん]でした。|It was 3,000 yen.',
          '〜くて、〜|… and … (adjectives)|青[あお]くて、軽[かる]いです。|It\'s blue and light.',
        ],
        start: '先週[せんしゅう]、〜を買[か]いました。|Last week I bought …',
        answer: ['先週[せんしゅう]、駅[えき]の近[ちか]くの店[みせ]で新[あたら]しいかばんを買[か]いました。青[あお]くて、とても軽[かる]いです。五千円[ごせんえん]でした。毎日[まいにち]、学校[がっこう]に持[も]って行[い]きます。',
          'Last week I bought a new bag at a shop near the station. It\'s blue and very light. It was 5,000 yen. I take it to school every day.'],
      },
      N4: {
        words: ['掃除機[そうじき]|vacuum cleaner', 'セール|sale', '値段[ねだん]|price', 'ネット|the internet', '注文[ちゅうもん]|order'],
        verbs: ['迷[まよ]う|be unsure', '比[くら]べる|compare', '届[とど]く|arrive (a delivery)', '欲[ほ]しい|want (a thing)'],
        grammar: [
          '〜かどうか|whether or not …|買[か]うかどうか迷[まよ]いました。|I wasn\'t sure whether to buy it.',
          '〜てみたら|when I tried …|使[つか]ってみたら、便利[べんり]でした。|When I tried it, it was handy.',
          '〜てよかった|I\'m glad I …|買[か]ってよかったです。|I\'m glad I bought it.',
        ],
        start: 'ずっと欲[ほ]しかった〜を買[か]いました。|I bought the … I\'d wanted for ages.',
        answer: ['ずっと欲[ほ]しかった掃除機[そうじき]を、ネットのセールで買[か]いました。値段[ねだん]が高[たか]かったので、買[か]うかどうか一週間[いっしゅうかん]ぐらい迷[まよ]いました。いろいろな店[みせ]の値段[ねだん]を比[くら]べて、一番[いちばん]安[やす]い店[みせ]で注文[ちゅうもん]しました。次[つぎ]の日[ひ]にすぐ届[とど]いて、使[つか]ってみたら、とても静[しず]かで便利[べんり]でした。買[か]ってよかったです。',
          'I bought a vacuum cleaner I\'d wanted for ages in an online sale. It was expensive, so I spent about a week deciding whether to buy it. I compared prices at lots of shops and ordered from the cheapest. It arrived the very next day, and when I tried it, it was really quiet and handy. I\'m glad I bought it.'],
      },
      N3: {
        words: ['衝動買[しょうどうが]い|impulse buy', '一目[ひとめ]ぼれ|love at first sight', '口[くち]コミ|reviews', 'お買[か]い得[どく]|good value', '出費[しゅっぴ]|expense'],
        verbs: ['試着[しちゃく]する|try on', '控[ひか]える|cut back on', 'じっくり考[かんが]える|think carefully', '決[き]める|decide'],
        grammar: [
          'つい〜てしまう|can\'t help …|つい衝動買[しょうどうが]いしてしまいました。|I couldn\'t help making an impulse buy.',
          '〜わりに|considering …|値段[ねだん]のわりに作[つく]りがいいです。|It\'s well made for the price.',
          '〜ずに|without …|試着[しちゃく]もせずに決[き]めました。|I decided without even trying it on.',
        ],
        start: 'つい〜てしまいました。|I couldn\'t help …',
        answer: ['先日[せんじつ]、古着屋[ふるぎや]で革[かわ]のジャケットに一目[ひとめ]ぼれして、つい衝動買[しょうどうが]いしてしまいました。普段[ふだん]は口[くち]コミを読[よ]んでからじっくり考[かんが]えるのですが、今回[こんかい]は試着[しちゃく]もせずに決[き]めました。値段[ねだん]のわりに作[つく]りがしっかりしていて、結果的[けっかてき]にはお買[か]い得[どく]だったと思[おも]います。ただ、今月[こんげつ]は予定外[よていがい]の出費[しゅっぴ]になったので、しばらく外食[がいしょく]は控[ひか]えるつもりです。',
          'The other day I fell in love with a leather jacket at a second-hand shop and couldn\'t help buying it on impulse. Usually I read reviews and think carefully, but this time I decided without even trying it on. It\'s solidly made for the price, so in the end I think it was good value. Still, it was an unplanned expense this month, so I\'m going to cut back on eating out for a while.'],
      },
    },
    {
      id: 'hobby', group: 'likes',
      q: ['趣味[しゅみ]は何[なん]ですか。', 'What are your hobbies?'],
      N5: {
        words: ['テニス|tennis', '音楽[おんがく]|music', '歌[うた]|song', '本[ほん]|book', '写真[しゃしん]|photo', '毎週[まいしゅう]|every week'],
        verbs: ['します|do, play', '聞[き]きます|listen', '読[よ]みます|read', '撮[と]ります|take (photos)'],
        grammar: [
          '〜が好[す]きです|I like …|音楽[おんがく]が好[す]きです。|I like music.',
          'よく〜ます|often …|よく本[ほん]を読[よ]みます。|I often read books.',
          '〜で|at, in (where you do it)|公園[こうえん]でテニスをします。|I play tennis in the park.',
        ],
        start: '私[わたし]の趣味[しゅみ]は|My hobby is …',
        answer: ['私[わたし]の趣味[しゅみ]はテニスです。毎週[まいしゅう]土曜日[どようび]に、公園[こうえん]で友達[ともだち]とテニスをします。音楽[おんがく]も好[す]きです。よく電車[でんしゃ]の中[なか]で日本[にほん]の歌[うた]を聞[き]きます。',
          'My hobby is tennis. Every Saturday I play tennis with friends in the park. I also like music. I often listen to Japanese songs on the train.'],
      },
      N4: {
        words: ['ギター|guitar', '音楽教室[おんがくきょうしつ]|music school', '練習[れんしゅう]|practice', '曲[きょく]|piece of music', 'ストレス|stress'],
        verbs: ['習[なら]う|take lessons in', '弾[ひ]く|play (an instrument)', '続[つづ]ける|keep going', '減[へ]る|decrease'],
        grammar: [
          '〜ことです|(my hobby) is doing …|趣味[しゅみ]はギターを弾[ひ]くことです。|My hobby is playing guitar.',
          '〜ようになりました|have become able to …|簡単[かんたん]な曲[きょく]が弾[ひ]けるようになりました。|I can play easy pieces now.',
          '〜し、〜し|… and also … (reasons)|楽[たの]しいし、ストレスも減[へ]ります。|It\'s fun, and it reduces stress too.',
        ],
        start: '私[わたし]の趣味[しゅみ]は〜ことです。|My hobby is …-ing.',
        answer: ['私[わたし]の趣味[しゅみ]はギターを弾[ひ]くことです。去年[きょねん]から近[ちか]くの音楽教室[おんがくきょうしつ]で習[なら]っています。最初[さいしょ]は指[ゆび]が痛[いた]かったですが、毎日[まいにち]練習[れんしゅう]を続[つづ]けて、簡単[かんたん]な曲[きょく]なら弾[ひ]けるようになりました。楽[たの]しいし、ストレスも減[へ]るし、始[はじ]めてよかったです。',
          'My hobby is playing the guitar. I\'ve been taking lessons at a nearby music school since last year. At first my fingers hurt, but I kept practising every day, and now I can play easy pieces. It\'s fun, it cuts my stress, and I\'m glad I started.'],
      },
      N3: {
        words: ['将棋[しょうぎ]|shogi', '奥[おく]が深[ふか]い|has real depth', '仲間[なかま]|friends (who share an interest)', '地元[じもと]|local', '何気[なにげ]なく|casually, without thinking'],
        verbs: ['はまる|get hooked on', '通[かよ]う|go regularly', '上達[じょうたつ]する|improve', '夢中[むちゅう]になる|get absorbed'],
        grammar: [
          '〜ば〜ほど|the more …, the more …|やればやるほど面白[おもしろ]くなります。|The more I do it, the more fun it gets.',
          '〜わけではない|it\'s not that …|上手[じょうず]なわけではありません。|It\'s not that I\'m good at it.',
          '〜ようになり、|came to … and|クラブに通[かよ]うようになり、仲間[なかま]ができました。|I started going to a club and made friends.',
        ],
        start: 'ここ数年[すうねん]、〜にはまっています。|For the last few years I\'ve been hooked on …',
        answer: ['ここ数年[すうねん]、将棋[しょうぎ]にはまっています。きっかけは、アプリで何気[なにげ]なく遊[あそ]んでみたことでした。決[けっ]して上手[じょうず]なわけではありませんが、やればやるほど奥[おく]が深[ふか]いと感[かん]じます。最近[さいきん]は地元[じもと]の将棋[しょうぎ]クラブに通[かよ]うようになり、年齢[ねんれい]も職業[しょくぎょう]も違[ちが]う仲間[なかま]ができました。',
          'For the last few years I\'ve been hooked on shogi. It started when I casually tried it in an app. It\'s not that I\'m any good, but the more I play, the deeper it seems. Lately I\'ve started going to a local shogi club, and I\'ve made friends of all ages and jobs.'],
      },
    },
    {
      id: 'food', group: 'likes',
      q: ['好[す]きな食[た]べ物[もの]は何[なん]ですか。', 'What is your favourite food?'],
      N5: {
        words: ['ラーメン|ramen', 'すし|sushi', '肉[にく]|meat', '魚[さかな]|fish', '野菜[やさい]|vegetables', '辛[から]い物[もの]|spicy food'],
        verbs: ['好[す]きです|like', '食[た]べます|eat', 'おいしいです|is tasty', '安[やす]いです|is cheap'],
        grammar: [
          '一番[いちばん]〜|the most …|すしが一番[いちばん]好[す]きです。|I like sushi most.',
          'あまり〜ません|not much …|肉[にく]はあまり食[た]べません。|I don\'t eat much meat.',
          '〜くて、〜|… and … (i-adjectives)|安[やす]くて、おいしいです。|It\'s cheap and tasty.',
        ],
        start: '私[わたし]は〜が大好[だいす]きです。|I love …',
        answer: ['私[わたし]はラーメンが大好[だいす]きです。みそラーメンが一番[いちばん]好[す]きです。安[やす]くておいしいですから、一週間[いっしゅうかん]に二回[にかい]ぐらい食[た]べます。でも、辛[から]い物[もの]はあまり食[た]べません。',
          'I love ramen. I like miso ramen best. It\'s cheap and tasty, so I eat it about twice a week. But I don\'t eat much spicy food.'],
      },
      N4: {
        words: ['焼[や]き魚[ざかな]|grilled fish', '納豆[なっとう]|natto (fermented soybeans)', 'におい|smell', '駅前[えきまえ]|in front of the station', 'カレーうどん|curry udon'],
        verbs: ['作[つく]ってくれる|make (for me)', '慣[な]れる|get used to', '気[き]に入[い]る|come to like', '食[た]べてみる|try eating'],
        grammar: [
          'AよりBのほうが|B more than A|肉[にく]より魚[さかな]のほうが好[す]きです。|I like fish more than meat.',
          '〜たことがあります|have done … before|納豆[なっとう]を食[た]べたことがあります。|I\'ve eaten natto.',
          '〜てくれる|do (kindly) for me|母[はは]がよく作[つく]ってくれます。|My mother often makes it for me.',
        ],
        start: '私[わたし]は〜より〜のほうが好[す]きです。|I like … more than …',
        answer: ['私[わたし]は肉[にく]より魚[さかな]のほうが好[す]きで、特[とく]に母[はは]が作[つく]ってくれる焼[や]き魚[ざかな]が大好[だいす]きです。日本[にほん]に来[き]てから、いろいろな料理[りょうり]を食[た]べてみました。納豆[なっとう]も食[た]べたことがありますが、においが強[つよ]くて、まだ慣[な]れません。今[いま]一番[いちばん]気[き]に入[い]っているのは、駅前[えきまえ]の店[みせ]のカレーうどんです。',
          'I like fish more than meat — I especially love the grilled fish my mother makes. Since coming to Japan I\'ve tried all sorts of dishes. I\'ve eaten natto too, but the smell is strong and I\'m not used to it yet. My favourite right now is the curry udon at a shop by the station.'],
      },
      N3: {
        words: ['鍋料理[なべりょうり]|hot pot', '旬[しゅん]|in season', '栄養[えいよう]|nutrition', '雰囲気[ふんいき]|atmosphere', '実家[じっか]|family home'],
        verbs: ['温[あたた]まる|warm up', '囲[かこ]む|gather around', '味[あじ]わう|savour', '懐[なつ]かしい|nostalgic'],
        grammar: [
          '〜といえば|speaking of …|冬[ふゆ]といえば鍋[なべ]です。|Speaking of winter, it has to be hot pot.',
          '〜だけでなく|not only …|体[からだ]が温[あたた]まるだけでなく、栄養[えいよう]もとれます。|It not only warms you up but is nutritious too.',
          '〜たびに|every time …|食[た]べるたびに実家[じっか]を思[おも]い出[だ]します。|Every time I eat it, I think of home.',
        ],
        start: '好[す]きな食[た]べ物[もの]といえば、|Speaking of favourite foods, …',
        answer: ['好[す]きな食[た]べ物[もの]といえば、やはり冬[ふゆ]の鍋料理[なべりょうり]です。旬[しゅん]の野菜[やさい]や魚[さかな]をたっぷり入[い]れるので、体[からだ]が温[あたた]まるだけでなく、栄養[えいよう]もとれます。何[なに]より、大勢[おおぜい]で一[ひと]つの鍋[なべ]を囲[かこ]む雰囲気[ふんいき]が好[す]きです。実家[じっか]でよく食[た]べていたので、食[た]べるたびに懐[なつ]かしい気持[きも]ちになります。',
          'Speaking of favourite foods, for me it has to be winter hot pot. You put in lots of seasonal vegetables and fish, so it not only warms you up but is nutritious too. Above all, I love the feeling of a crowd gathered round one pot. We often had it at home, so every time I eat it I feel nostalgic.'],
      },
    },
    {
      id: 'season', group: 'likes',
      q: ['どの季節[きせつ]が好[す]きですか。', 'Which season do you like?'],
      N5: {
        words: ['春[はる]|spring', '夏[なつ]|summer', '秋[あき]|autumn', '冬[ふゆ]|winter', '桜[さくら]|cherry blossom', 'お花見[はなみ]|cherry-blossom viewing'],
        verbs: ['暖[あたた]かいです|is warm', '暑[あつ]いです|is hot', '涼[すず]しいです|is cool', '寒[さむ]いです|is cold'],
        grammar: [
          '〜が一番[いちばん]好[す]きです|I like … best|秋[あき]が一番[いちばん]好[す]きです。|I like autumn best.',
          '〜ですから|because …|涼[すず]しいですから。|Because it\'s cool.',
          'あまり好[す]きじゃないです|I don\'t like it much|夏[なつ]はあまり好[す]きじゃないです。|I don\'t like summer much.',
        ],
        start: '私[わたし]は〜が一番[いちばん]好[す]きです。|I like … the best.',
        answer: ['私[わたし]は春[はる]が一番[いちばん]好[す]きです。春[はる]は暖[あたた]かくて、桜[さくら]がとてもきれいですから。四月[しがつ]に友達[ともだち]と公園[こうえん]でお花見[はなみ]をします。夏[なつ]は暑[あつ]いですから、あまり好[す]きじゃないです。',
          'I like spring best, because it\'s warm and the cherry blossoms are beautiful. In April I go cherry-blossom viewing in the park with friends. Summer is hot, so I don\'t like it much.'],
      },
      N4: {
        words: ['紅葉[こうよう]|autumn leaves', '花粉症[かふんしょう]|hay fever', 'さつまいも|sweet potato', '栗[くり]|chestnut', '黄色[きいろ]|yellow'],
        verbs: ['過[す]ごしやすい|pleasant (weather)', '色[いろ]づく|change colour', 'つらい|be hard to bear', '楽[たの]しみだ|look forward to'],
        grammar: [
          '〜のは〜です|the one (I …) is …|一番[いちばん]好[す]きなのは秋[あき]です。|The one I like best is autumn.',
          '〜すぎる|too …|夏[なつ]は暑[あつ]すぎます。|Summer is too hot.',
          '〜からです|it\'s because …|過[す]ごしやすいからです。|It\'s because it\'s pleasant.',
        ],
        start: '一番[いちばん]好[す]きなのは〜です。|The one I like best is …',
        answer: ['一番[いちばん]好[す]きなのは秋[あき]です。夏[なつ]は暑[あつ]すぎるし、春[はる]は花粉症[かふんしょう]がつらいので、秋[あき]が一番[いちばん]過[す]ごしやすいからです。山[やま]の木[き]が赤[あか]や黄色[きいろ]に色[いろ]づいて、紅葉[こうよう]を見[み]に行[い]くのが楽[たの]しみです。それに、さつまいもや栗[くり]など、おいしい食[た]べ物[もの]もたくさんあります。',
          'The one I like best is autumn. Summer is too hot and spring means awful hay fever, so autumn is the most pleasant. The trees on the mountains turn red and yellow, and I look forward to going to see the autumn leaves. And there\'s lots of good food too, like sweet potatoes and chestnuts.'],
      },
      N3: {
        words: ['空気[くうき]が澄[す]む|the air is clear', '蒸[む]し暑[あつ]い|hot and humid', 'こたつ|heated table', '風物詩[ふうぶつし]|something typical of the season', 'ぐっすり|soundly (sleep)'],
        verbs: ['眺[なが]める|gaze at', '眠[ねむ]れる|can sleep', '苦手[にがて]だ|be bad with', '感[かん]じる|feel'],
        grammar: [
          '〜に比[くら]べて|compared with …|夏[なつ]に比[くら]べて、ぐっすり眠[ねむ]れます。|Compared with summer, I sleep soundly.',
          '〜という人[ひと]も多[おお]い|many people say …|寒[さむ]いのは苦手[にがて]だという人[ひと]も多[おお]いです。|Lots of people say they can\'t stand the cold.',
          'まさに〜だ|truly, exactly …|まさに冬[ふゆ]の風物詩[ふうぶつし]です。|It\'s the very picture of winter.',
        ],
        start: '季節[きせつ]の中[なか]で一番[いちばん]好[す]きなのは|Of all the seasons, the one I like best is …',
        answer: ['季節[きせつ]の中[なか]で一番[いちばん]好[す]きなのは冬[ふゆ]です。寒[さむ]いのは苦手[にがて]だという人[ひと]も多[おお]いですが、空気[くうき]が澄[す]んでいて、遠[とお]くの山[やま]まではっきり見[み]えるのが好[す]きです。蒸[む]し暑[あつ]い夏[なつ]に比[くら]べて、ぐっすり眠[ねむ]れるのもうれしいです。こたつでみかんを食[た]べるのは、まさに日本[にほん]の冬[ふゆ]の風物詩[ふうぶつし]だと思[おも]います。',
          'Of all the seasons, I like winter best. Lots of people can\'t stand the cold, but I love how clear the air is — you can see the far-off mountains sharply. It\'s also nice that I sleep soundly, unlike in the humid summer. Eating mandarins under the kotatsu is, I think, the very picture of a Japanese winter.'],
      },
    },
    {
      id: 'movie', group: 'likes',
      q: ['最近[さいきん]見[み]た映画[えいが]や読[よ]んだ本[ほん]について話[はな]してください。', 'Tell me about a film you saw or a book you read recently.'],
      N5: {
        words: ['映画[えいが]|movie', '本[ほん]|book', '古[ふる]い|old', 'かわいい|cute', '面白[おもしろ]い|interesting', '大[おお]きい|big'],
        verbs: ['見[み]ました|watched', '読[よ]みました|read', '泣[な]きました|cried', '見[み]たいです|want to see'],
        grammar: [
          '〜という〜|a … called …|「トトロ」という映画[えいが]|a film called "Totoro"',
          '〜ですが、〜|…, but …|古[ふる]い映画[えいが]ですが、面白[おもしろ]いです。|It\'s an old film, but it\'s fun.',
          'また〜たいです|want to … again|また見[み]たいです。|I want to see it again.',
        ],
        start: '最近[さいきん]、〜という映画[えいが]を見[み]ました。|Recently I watched a film called …',
        answer: ['最近[さいきん]、「となりのトトロ」という映画[えいが]を見[み]ました。古[ふる]い映画[えいが]ですが、とても面白[おもしろ]かったです。トトロは大[おお]きくて、かわいいです。また見[み]たいです。',
          'Recently I watched a film called "My Neighbour Totoro". It\'s an old film, but it was a lot of fun. Totoro is big and cute. I want to watch it again.'],
      },
      N4: {
        words: ['小説[しょうせつ]|novel', '主人公[しゅじんこう]|main character', '結末[けつまつ]|ending', '病気[びょうき]|illness', '飼[か]っている猫[ねこ]|pet cat'],
        verbs: ['感動[かんどう]する|be moved', '泣[な]いてしまう|end up crying', '勧[すす]める|recommend', '会[あ]いに行[い]く|go to see'],
        grammar: [
          '〜という話[はなし]です|it\'s a story about …|男[おとこ]の人[ひと]が猫[ねこ]と旅[たび]をするという話[はなし]です。|It\'s about a man who travels with a cat.',
          '〜てほしい|want (someone) to …|ぜひ読[よ]んでほしいです。|I really want you to read it.',
          '〜中[なか]で一番[いちばん]|the best of …|最近[さいきん]読[よ]んだ本[ほん]の中[なか]で一番[いちばん]よかったです。|It was the best of the books I\'ve read lately.',
        ],
        start: '最近[さいきん]読[よ]んだ本[ほん]の中[なか]で、|Of the books I\'ve read recently, …',
        answer: ['最近[さいきん]読[よ]んだ本[ほん]の中[なか]で一番[いちばん]よかったのは、「旅猫[たびねこ]リポート」という小説[しょうせつ]です。病気[びょうき]になった主人公[しゅじんこう]が、飼[か]っている猫[ねこ]と一緒[いっしょ]に昔[むかし]の友達[ともだち]に会[あ]いに行[い]くという話[はなし]です。結末[けつまつ]がとても悲[かな]しくて、電車[でんしゃ]の中[なか]で泣[な]いてしまいました。猫[ねこ]が好[す]きな人[ひと]にぜひ読[よ]んでほしいです。',
          'The best book I\'ve read recently is a novel called "The Travelling Cat Chronicles". It\'s about a man who falls ill and goes with his cat to visit old friends. The ending is really sad, and I ended up crying on the train. I\'d love cat lovers to read it.'],
      },
      N3: {
        words: ['話題[わだい]の|much-talked-about', '時代劇[じだいげき]|period drama', '伏線[ふくせん]|foreshadowing', '展開[てんかい]|plot twists, development', '作品[さくひん]|work (of art)'],
        verbs: ['引[ひ]き込[こ]まれる|be drawn in', '予想[よそう]を裏切[うらぎ]る|defy expectations', '意見[いけん]が分[わ]かれる|opinions are divided', '期待[きたい]する|expect'],
        grammar: [
          '〜ものの|although …|期待[きたい]していなかったものの、引[ひ]き込[こ]まれました。|Although I hadn\'t expected much, I was drawn in.',
          '〜に関[かん]しては|as for …|結末[けつまつ]に関[かん]しては意見[いけん]が分[わ]かれそうです。|Opinions will probably be divided on the ending.',
          '〜させられる|be made to … (think, feel)|いろいろと考[かんが]えさせられました。|It made me think about a lot.',
        ],
        start: '先日[せんじつ]、話題[わだい]の〜を見[み]ました。|The other day I saw the much-talked-about …',
        answer: ['先日[せんじつ]、話題[わだい]の時代劇[じだいげき]を映画館[えいがかん]で見[み]ました。正直[しょうじき]、期待[きたい]していなかったものの、最初[さいしょ]の十分[じゅっぷん]で一気[いっき]に引[ひ]き込[こ]まれました。何気[なにげ]ない会話[かいわ]が後半[こうはん]の伏線[ふくせん]になっていて、予想[よそう]を裏切[うらぎ]る展開[てんかい]の連続[れんぞく]でした。結末[けつまつ]に関[かん]しては意見[いけん]が分[わ]かれそうですが、家族[かぞく]とは何[なに]かを考[かんが]えさせられる作品[さくひん]でした。',
          'The other day I saw the much-talked-about period drama at the cinema. Honestly, I hadn\'t expected much, but within the first ten minutes I was hooked. Throwaway conversations turned out to set up the second half, and it was one surprise after another. Opinions will probably be split on the ending, but it\'s a film that made me think about what family means.'],
      },
    },
    {
      id: 'why-japanese', group: 'past',
      q: ['どうして日本語[にほんご]を勉強[べんきょう]していますか。', 'Why are you studying Japanese?'],
      N5: {
        words: ['アニメ|anime', '漫画[まんが]|manga', '英語[えいご]|English', '旅行[りょこう]|trip', '日本[にほん]の人[ひと]|Japanese people', '来年[らいねん]|next year'],
        verbs: ['好[す]きです|like', '読[よ]みたいです|want to read', '話[はな]したいです|want to talk', '行[い]きます|go'],
        grammar: [
          '〜からです|it\'s because …|アニメが好[す]きだからです。|It\'s because I like anime.',
          '〜たいです|want to …|日本[にほん]に行[い]きたいです。|I want to go to Japan.',
          '〜で|in (a language)|日本語[にほんご]で話[はな]したいです。|I want to speak in Japanese.',
        ],
        start: '〜が好[す]きだからです。|It\'s because I like …',
        answer: ['日本[にほん]のアニメと漫画[まんが]が好[す]きだからです。今[いま]は英語[えいご]で読[よ]みますが、日本語[にほんご]で読[よ]みたいです。来年[らいねん]、日本[にほん]へ旅行[りょこう]に行[い]きます。日本[にほん]の人[ひと]と日本語[にほんご]で話[はな]したいです。',
          'It\'s because I like Japanese anime and manga. Now I read them in English, but I want to read them in Japanese. Next year I\'m going on a trip to Japan. I want to talk with Japanese people in Japanese.'],
      },
      N4: {
        words: ['ドラマ|TV drama', '字幕[じまく]|subtitles', '留学[りゅうがく]|studying abroad', '試験[しけん]|exam', '興味[きょうみ]|interest'],
        verbs: ['興味[きょうみ]を持[も]つ|become interested', '通[かよ]う|attend', '受[う]ける|take (an exam)', '留学[りゅうがく]する|study abroad'],
        grammar: [
          '〜ために|in order to …|留学[りゅうがく]するために勉強[べんきょう]しています。|I study in order to study abroad.',
          '〜ようになりたい|want to become able to …|字幕[じまく]なしで見[み]られるようになりたいです。|I want to be able to watch without subtitles.',
          '〜ようと思[おも]っています|I\'m planning to …|試験[しけん]を受[う]けようと思[おも]っています。|I\'m planning to take the exam.',
        ],
        start: '〜のとき、日本語[にほんご]に興味[きょうみ]を持[も]ちました。|I got interested in Japanese when …',
        answer: ['高校生[こうこうせい]のとき、日本[にほん]のドラマを見[み]て、日本語[にほんご]に興味[きょうみ]を持[も]ちました。今[いま]は週[しゅう]に二回[にかい]、日本語[にほんご]の学校[がっこう]に通[かよ]っています。いつか字幕[じまく]なしでドラマが見[み]られるようになりたいです。来年[らいねん]は日本[にほん]に留学[りゅうがく]するために、N4の試験[しけん]を受[う]けようと思[おも]っています。',
          'In high school I watched Japanese TV dramas and got interested in Japanese. Now I go to a Japanese school twice a week. Someday I want to be able to watch dramas without subtitles. Next year I\'m planning to take the N4 exam, so that I can study in Japan.'],
      },
      N3: {
        words: ['独学[どくがく]|teaching yourself', '挫折[ざせつ]|giving up, setback', '敬語[けいご]|honorific language', '使[つか]い分[わ]け|using the right one', '奥深[おくぶか]さ|depth'],
        verbs: ['やり取[と]りする|deal with, exchange', '引[ひ]かれる|be drawn to', '視野[しや]が広[ひろ]がる|broaden your horizons', '〜しかける|almost …'],
        grammar: [
          '〜のがきっかけでした|… was how it started|仕事[しごと]で必要[ひつよう]になったのがきっかけでした。|It started when I needed it for work.',
          '〜うちに|as (I kept) …|勉強[べんきょう]するうちに、面白[おもしろ]くなりました。|As I kept studying, it got interesting.',
          '〜というより|rather than …|仕事[しごと]のためというより、楽[たの]しいから続[つづ]けています。|I keep at it because it\'s fun, rather than for work.',
        ],
        start: 'もともとは〜のがきっかけでした。|It originally started when …',
        answer: ['もともとは仕事[しごと]で日本[にほん]の会社[かいしゃ]とやり取[と]りすることになったのがきっかけでした。最初[さいしょ]は独学[どくがく]で、漢字[かんじ]の多[おお]さに何度[なんど]も挫折[ざせつ]しかけました。でも、敬語[けいご]や言葉[ことば]の使[つか]い分[わ]けを知[し]るうちに、日本語[にほんご]の奥深[おくぶか]さに引[ひ]かれていきました。今[いま]では仕事[しごと]のためというより、視野[しや]が広[ひろ]がるのが楽[たの]しくて続[つづ]けています。',
          'It originally started when my job had me dealing with a Japanese company. At first I taught myself, and the sheer number of kanji nearly made me give up many times. But as I learned about polite language and choosing the right words, I was drawn in by how deep Japanese is. Now I keep going less for work than because I enjoy seeing my world grow.'],
      },
    },
    {
      id: 'best-trip', group: 'past',
      q: ['今[いま]までで一番[いちばん]楽[たの]しかった旅行[りょこう]はどこですか。', 'What is the best trip you have ever taken?'],
      N5: {
        words: ['去年[きょねん]|last year', '家族[かぞく]|family', '海[うみ]|sea', '天気[てんき]|weather', '料理[りょうり]|food, dishes', '一週間[いっしゅうかん]|one week'],
        verbs: ['行[い]きました|went', '泳[およ]ぎました|swam', '食[た]べました|ate', '楽[たの]しかったです|was fun'],
        grammar: [
          '〜かったです|was … (i-adjective past)|楽[たの]しかったです。|It was fun.',
          '〜でした|was … (nouns, na-adjectives)|いい天気[てんき]でした。|The weather was nice.',
          '〜に〜いました|stayed in … (for a time)|タイに一週間[いっしゅうかん]いました。|I was in Thailand for a week.',
        ],
        start: '去年[きょねん]、〜に行[い]きました。|Last year I went to …',
        answer: ['去年[きょねん]の夏[なつ]、家族[かぞく]とタイに行[い]きました。タイに一週間[いっしゅうかん]いました。毎日[まいにち]いい天気[てんき]でした。きれいな海[うみ]で泳[およ]いで、おいしい料理[りょうり]をたくさん食[た]べました。とても楽[たの]しかったです。',
          'Last summer I went to Thailand with my family. We were in Thailand for a week. The weather was nice every day. I swam in the beautiful sea and ate lots of delicious food. It was great fun.'],
      },
      N4: {
        words: ['思[おも]い出[で]|memory', '一人[ひとり]で|on my own', '鳥居[とりい]|shrine gate', '地元[じもと]の人[ひと]|local people', '夕方[ゆうがた]|evening'],
        verbs: ['道[みち]に迷[まよ]う|get lost', '案内[あんない]する|show the way', '感動[かんどう]する|be moved', '乗[の]り遅[おく]れる|miss (a train)'],
        grammar: [
          '〜てしまいました|ended up … (regret)|道[みち]に迷[まよ]ってしまいました。|I ended up getting lost.',
          '〜とき|when …|困[こま]ったとき、助[たす]けてくれました。|When I was stuck, they helped me.',
          '〜こと|(the fact) that …|電車[でんしゃ]に乗[の]り遅[おく]れたことも、いい思[おも]い出[で]です。|Even missing the train is a good memory.',
        ],
        start: '一番[いちばん]楽[たの]しかったのは、|The most fun was …',
        answer: ['一番[いちばん]楽[たの]しかったのは、大学生[だいがくせい]のときに初[はじ]めて一人[ひとり]で行[い]った広島[ひろしま]の旅行[りょこう]です。宮島[みやじま]で道[みち]に迷[まよ]ってしまったとき、地元[じもと]のおばあさんが親切[しんせつ]に案内[あんない]してくれました。夕方[ゆうがた]、海[うみ]の中[なか]に立[た]つ大[おお]きな鳥居[とりい]を見[み]て、とても感動[かんどう]しました。帰[かえ]りの電車[でんしゃ]に乗[の]り遅[おく]れたことも、今[いま]ではいい思[おも]い出[で]です。',
          'The most fun was a trip to Hiroshima, my first trip on my own, when I was at university. When I got lost on Miyajima, an old local lady kindly showed me the way. In the evening I saw the big shrine gate standing in the sea and was really moved. Even missing my train home is a good memory now.'],
      },
      N3: {
        words: ['吹雪[ふぶき]|snowstorm', 'オーロラ|aurora', '予想外[よそうがい]|unexpected', 'ハプニング|mishap', '回復[かいふく]|recovery'],
        verbs: ['見舞[みま]われる|be hit by (bad weather)', '中止[ちゅうし]になる|be cancelled', '圧倒[あっとう]される|be overwhelmed', '心[こころ]に残[のこ]る|stay with you'],
        grammar: [
          '〜ことになった|it turned out that I had to …|小[ちい]さな村[むら]に泊[と]まることになりました。|We ended up staying in a small village.',
          'ところが|however (to everyone\'s surprise)|ところが、最後[さいご]の夜[よる]に晴[は]れました。|But then on the last night it cleared.',
          '〜からこそ|precisely because …|ハプニングがあったからこそ、忘[わす]れられません。|It\'s precisely because of the mishaps that I can\'t forget it.',
        ],
        start: '今[いま]でも心[こころ]に残[のこ]っているのは、|What still stays with me is …',
        answer: ['今[いま]でも心[こころ]に残[のこ]っているのは、友人[ゆうじん]三人[さんにん]で行[い]ったアイスランドの旅[たび]です。到着[とうちゃく]した日[ひ]から吹雪[ふぶき]に見舞[みま]われ、予定[よてい]していたツアーが中止[ちゅうし]になって、小[ちい]さな村[むら]に二泊[にはく]することになりました。ところが、天気[てんき]が回復[かいふく]した最後[さいご]の夜[よる]、空一面[そらいちめん]にオーロラが現[あらわ]れ、その美[うつく]しさに圧倒[あっとう]されました。今[いま]思[おも]えば、予想外[よそうがい]のハプニングがあったからこそ、忘[わす]れられない旅[たび]になったのだと思[おも]います。',
          'What still stays with me is a trip to Iceland with three friends. From the day we arrived we were hit by snowstorms; the tour we\'d planned was cancelled, and we ended up spending two nights in a small village. But on the last night the weather cleared, and the aurora filled the whole sky — I was overwhelmed by how beautiful it was. Looking back, I think it was precisely the unexpected mishaps that made it a trip I\'ll never forget.'],
      },
    },
    {
      id: 'childhood', group: 'past',
      q: ['子供[こども]のころ、何[なに]が好[す]きでしたか。', 'What did you like when you were a child?'],
      N5: {
        words: ['子供[こども]|child', '絵[え]|picture', '動物[どうぶつ]|animals', '兄[あに]|older brother', '公園[こうえん]|park', '週末[しゅうまつ]|weekend'],
        verbs: ['好[す]きでした|liked', 'かきました|drew', '遊[あそ]びました|played', '帰[かえ]って|came home and'],
        grammar: [
          '〜のとき|when I was …|子供[こども]のとき、|When I was a child, …',
          '〜のが好[す]きでした|liked doing …|絵[え]をかくのが好[す]きでした。|I liked drawing pictures.',
          'よく〜ました|often did …|よく外[そと]で遊[あそ]びました。|I often played outside.',
        ],
        start: '子供[こども]のとき、|When I was a child, …',
        answer: ['子供[こども]のとき、絵[え]をかくのが好[す]きでした。毎日[まいにち]、学校[がっこう]から帰[かえ]って、動物[どうぶつ]の絵[え]をかきました。週末[しゅうまつ]は兄[あに]とよく公園[こうえん]で遊[あそ]びました。とても楽[たの]しかったです。',
          'When I was a child, I liked drawing. Every day I came home from school and drew pictures of animals. At weekends I often played in the park with my older brother. It was great fun.'],
      },
      N4: {
        words: ['小学生[しょうがくせい]|elementary school pupil', '虫[むし]|insects, bugs', 'カブトムシ|rhinoceros beetle', '森[もり]|woods', '夢[ゆめ]|dream', '博士[はかせ]|expert, doctor'],
        verbs: ['集[あつ]める|collect', '探[さが]す|look for', '夢中[むちゅう]になる|be absorbed in', '怒[おこ]られる|get told off'],
        grammar: [
          '〜ころ|around the time when …|小学生[しょうがくせい]のころ、|When I was in elementary school, …',
          '〜ていました|used to be (doing) …|毎朝[まいあさ]虫[むし]を探[さが]していました。|Every morning I\'d be out looking for bugs.',
          '〜られました|was …-ed (passive)|母[はは]によく怒[おこ]られました。|I was often told off by my mother.',
        ],
        start: '小学生[しょうがくせい]のころ、|When I was in elementary school, …',
        answer: ['小学生[しょうがくせい]のころ、虫[むし]を集[あつ]めることに夢中[むちゅう]になっていました。夏休[なつやす]みは毎朝[まいあさ]早[はや]く起[お]きて、近所[きんじょ]の森[もり]でカブトムシを探[さが]していました。家[いえ]に虫[むし]をたくさん持[も]って帰[かえ]ったので、よく母[はは]に怒[おこ]られました。将来[しょうらい]の夢[ゆめ]は虫[むし]の博士[はかせ]になることでした。',
          'In elementary school I was crazy about collecting bugs. In the summer holidays I got up early every morning to hunt for rhinoceros beetles in the woods nearby. I brought lots of bugs home, so my mother often told me off. My dream was to become a bug expert.'],
      },
      N3: {
        words: ['宇宙[うちゅう]|space', '図鑑[ずかん]|illustrated guide', '屋上[おくじょう]|rooftop', '習[なら]い事[ごと]|after-school lessons', '理系[りけい]|science track'],
        verbs: ['憧[あこが]れる|long for, dream of', '眺[なが]める|gaze at', '読[よ]み返[かえ]す|reread', '思[おも]い返[かえ]す|look back'],
        grammar: [
          '〜たものです|used to … (nostalgic)|よく川[かわ]で遊[あそ]んだものです。|I often used to play in the river.',
          '〜ほど|so much that …|時間[じかん]を忘[わす]れるほど星[ほし]を眺[なが]めていました。|I\'d watch the stars until I lost track of time.',
          '〜のことなら|when it comes to …|星[ほし]のことなら何時間[なんじかん]でも話[はな]せました。|When it came to stars, I could talk for hours.',
        ],
        start: '子供[こども]のころは〜に憧[あこが]れていて、|As a child I dreamed of …, and …',
        answer: ['子供[こども]のころは宇宙[うちゅう]に憧[あこが]れていて、図鑑[ずかん]を何度[なんど]も読[よ]み返[かえ]したものです。夜[よる]になると父[ちち]と屋上[おくじょう]に上[あ]がり、時間[じかん]を忘[わす]れるほど星[ほし]を眺[なが]めていました。習[なら]い事[ごと]のピアノは嫌々[いやいや]通[かよ]っていましたが、星[ほし]のことなら何時間[なんじかん]でも話[はな]せました。今[いま]思[おも]い返[かえ]すと、理系[りけい]の道[みち]に進[すす]んだのは、あのころの影響[えいきょう]が大[おお]きいと思[おも]います。',
          'As a child I dreamed of space and read my picture books about it over and over. At night I\'d go up on the roof with my father and watch the stars until I lost track of time. I went to piano lessons reluctantly, but I could talk about stars for hours. Looking back, I think those days had a lot to do with my going into science.'],
      },
    },
    {
      id: 'travel', group: 'past',
      q: ['どこに旅行[りょこう]に行[い]きたいですか。', 'Where would you like to travel?'],
      N5: {
        words: ['北海道[ほっかいどう]|Hokkaido', '雪[ゆき]|snow', '温泉[おんせん]|hot spring', 'お寺[てら]|temple', '海[うみ]|sea', '冬[ふゆ]|winter'],
        verbs: ['行[い]きたいです|want to go', '見[み]たいです|want to see', '食[た]べたいです|want to eat', '泊[と]まりたいです|want to stay'],
        grammar: [
          '〜に行[い]きたいです|want to go to …|京都[きょうと]に行[い]きたいです。|I want to go to Kyoto.',
          '〜で〜を〜たいです|want to … at …|京都[きょうと]でお寺[てら]を見[み]たいです。|I want to see temples in Kyoto.',
          '〜にも|to … too|温泉[おんせん]にも行[い]きたいです。|I want to go to a hot spring too.',
        ],
        start: '私[わたし]は〜に行[い]きたいです。|I want to go to …',
        answer: ['私[わたし]は北海道[ほっかいどう]に行[い]きたいです。冬[ふゆ]の北海道[ほっかいどう]はとても寒[さむ]いですが、雪[ゆき]がきれいです。札幌[さっぽろ]でおいしいラーメンを食[た]べたいです。温泉[おんせん]にも行[い]きたいです。',
          'I want to go to Hokkaido. Hokkaido in winter is very cold, but the snow is beautiful. I want to eat delicious ramen in Sapporo. I want to go to a hot spring too.'],
      },
      N4: {
        words: ['一度[いちど]|once', '名物[めいぶつ]|local speciality', '春休[はるやす]み|spring holidays', '暖[あたた]かい|warm', '計画[けいかく]|plan'],
        verbs: ['行[い]ってみる|try going', '泳[およ]ぐ|swim', '計画[けいかく]を立[た]てる|make plans', '楽[たの]しみにする|look forward to'],
        grammar: [
          '〜てみたい|want to try …|一度[いちど]、沖縄[おきなわ]に行[い]ってみたいです。|I\'d like to go to Okinawa once.',
          '〜なら|if it\'s …|沖縄[おきなわ]なら、冬[ふゆ]でも暖[あたた]かいです。|Okinawa is warm even in winter.',
          '〜ことができる|can …|海[うみ]で泳[およ]ぐことができます。|You can swim in the sea.',
        ],
        start: '一度[いちど]、〜に行[い]ってみたいです。|I\'d like to go to … at least once.',
        answer: ['一度[いちど]、沖縄[おきなわ]に行[い]ってみたいです。写真[しゃしん]で見[み]た青[あお]い海[うみ]がとてもきれいだったからです。沖縄[おきなわ]なら、冬[ふゆ]でも暖[あたた]かいし、海[うみ]で泳[およ]ぐこともできます。名物[めいぶつ]のゴーヤチャンプルーも食[た]べてみたいです。今[いま]、来年[らいねん]の春休[はるやす]みに行[い]く計画[けいかく]を立[た]てています。',
          'I\'d like to go to Okinawa at least once, because the blue sea I saw in photos was so beautiful. Okinawa is warm even in winter, and you can swim in the sea. I also want to try the local speciality, goya champuru. Right now I\'m making plans to go in next year\'s spring holidays.'],
      },
      N3: {
        words: ['温泉町[おんせんまち]|hot-spring town', '観光地[かんこうち]|tourist spot', '行[い]き当[あ]たりばったり|without a plan', '醍醐味[だいごみ]|the real joy (of something)', '紅葉[こうよう]|autumn leaves'],
        verbs: ['巡[めぐ]る|go round (places)', '触[ふ]れ合[あ]う|get to know (people)', '味[あじ]わう|savour', '満喫[まんきつ]する|enjoy to the full'],
        grammar: [
          '〜ならではの|unique to …|その土地[とち]ならではの料理[りょうり]|food you can only get there',
          '〜より〜のが好[す]きだ|I prefer … to …|観光地[かんこうち]を巡[めぐ]るより、のんびり歩[ある]くのが好[す]きです。|I prefer strolling to doing the tourist spots.',
          '〜たり〜たりするのが|doing things like … and …|人[ひと]と話[はな]したり、料理[りょうり]を味[あじ]わったりするのが楽[たの]しいです。|I enjoy things like talking to people and savouring the food.',
        ],
        start: '今[いま]一番[いちばん]行[い]ってみたいのは、|Where I most want to go now is …',
        answer: ['今[いま]一番[いちばん]行[い]ってみたいのは、東北[とうほく]の小[ちい]さな温泉町[おんせんまち]です。有名[ゆうめい]な観光地[かんこうち]を巡[めぐ]るより、電車[でんしゃ]で行[い]き当[あ]たりばったりの旅[たび]をするのが好[す]きです。現地[げんち]の人[ひと]と触[ふ]れ合[あ]ったり、その土地[とち]ならではの料理[りょうり]を味[あじ]わったりするのが、旅[たび]の醍醐味[だいごみ]だと思[おも]います。秋[あき]に紅葉[こうよう]を見[み]ながら、のんびり温泉[おんせん]を満喫[まんきつ]したいです。',
          'Where I most want to go now is a small hot-spring town in Tohoku. Rather than doing the famous sights, I like travelling by train without a plan. Getting to know the locals and savouring food you can only get there is, I think, the real joy of travel. I\'d like to take my time enjoying the hot springs while looking at the autumn leaves.'],
      },
    },
    {
      id: 'future', group: 'past',
      q: ['将来[しょうらい]の夢[ゆめ]は何[なん]ですか。', 'What is your dream for the future?'],
      N5: {
        words: ['パン屋[や]|baker, bakery', '先生[せんせい]|teacher', '医者[いしゃ]|doctor', '店[みせ]|shop', 'いつか|someday', '小[ちい]さい|small'],
        verbs: ['なりたいです|want to become', '作[つく]りたいです|want to make', '開[ひら]きたいです|want to open', '住[す]みたいです|want to live'],
        grammar: [
          '〜になりたいです|want to become …|先生[せんせい]になりたいです。|I want to become a teacher.',
          '〜のが好[す]きですから|because I like doing …|パンを作[つく]るのが好[す]きですから。|Because I like making bread.',
          'いつか〜たいです|someday I want to …|いつか日本[にほん]に住[す]みたいです。|Someday I want to live in Japan.',
        ],
        start: '私[わたし]は〜になりたいです。|I want to become …',
        answer: ['私[わたし]はパン屋[や]になりたいです。パンを作[つく]るのが好[す]きですから。いつか、日本[にほん]で小[ちい]さい店[みせ]を開[ひら]きたいです。おいしいパンをたくさん作[つく]りたいです。',
          'I want to become a baker, because I like making bread. Someday I want to open a small shop in Japan. I want to make lots of delicious bread.'],
      },
      N4: {
        words: ['カフェ|café', '資格[しかく]|qualification', '毎月[まいつき]|every month', '〜までに|by (a time)', 'そのために|for that'],
        verbs: ['貯[た]める|save up', '取[と]る|get (a qualification)', '叶[かな]える|make (a dream) come true', '開[ひら]く|open'],
        grammar: [
          '〜たいと思[おも]っています|I\'d like to …|カフェを開[ひら]きたいと思[おも]っています。|I\'d like to open a café.',
          '〜ながら|while …|働[はたら]きながら、お金[かね]を貯[た]めています。|I\'m saving money while working.',
          '〜つもりです|I intend to …|四十歳[よんじゅっさい]までに夢[ゆめ]を叶[かな]えるつもりです。|I intend to make my dream come true by forty.',
        ],
        start: '将来[しょうらい]は〜たいと思[おも]っています。|In the future, I\'d like to …',
        answer: ['将来[しょうらい]は田舎[いなか]で小[ちい]さいカフェを開[ひら]きたいと思[おも]っています。そのために、今[いま]は会社[かいしゃ]で働[はたら]きながら、毎月[まいつき]少[すこ]しずつお金[かね]を貯[た]めています。来年[らいねん]はコーヒーの資格[しかく]を取[と]ろうと思[おも]っています。四十歳[よんじゅっさい]までに夢[ゆめ]を叶[かな]えるつもりです。',
          'In the future I\'d like to open a small café in the countryside. For that, I\'m working at a company now and saving a little money every month. Next year I\'m planning to get a coffee qualification. I intend to make my dream come true by the time I\'m forty.'],
      },
      N3: {
        words: ['教育[きょういく]|education', '後悔[こうかい]|regret', '体力[たいりょく]|stamina', '支援[しえん]|support', '大学院[だいがくいん]|graduate school'],
        verbs: ['携[たずさ]わる|be involved in (work)', '挑戦[ちょうせん]する|take on a challenge', '実現[じつげん]する|make real', '決[き]める|decide'],
        grammar: [
          '〜うちに|while (still) …|体力[たいりょく]があるうちに挑戦[ちょうせん]したいです。|I want to try while I still have the energy.',
          '〜に限[かぎ]らず|not just …|日本[にほん]に限[かぎ]らず、世界中[せかいじゅう]で働[はたら]きたいです。|I want to work not just in Japan but around the world.',
          '〜てきた|have been … (up to now)|ずっと銀行[ぎんこう]で働[はたら]いてきました。|I\'ve worked at a bank all along.',
        ],
        start: '今[いま]の目標[もくひょう]は、〜ことです。|My goal now is to …',
        answer: ['今[いま]の目標[もくひょう]は、教育[きょういく]に携[たずさ]わる仕事[しごと]をすることです。大学[だいがく]を出[で]てから十年[じゅうねん]、ずっと銀行[ぎんこう]で働[はたら]いてきましたが、後悔[こうかい]しないように、体力[たいりょく]があるうちに新[あたら]しいことに挑戦[ちょうせん]しようと決[き]めました。日本[にほん]に限[かぎ]らず、教育[きょういく]を受[う]けにくい国[くに]の子供[こども]たちを支援[しえん]したいです。それを実現[じつげん]するために、今[いま]は夜間[やかん]の大学院[だいがくいん]に通[かよ]っています。',
          'My goal now is to work in education. I\'ve worked at a bank for the ten years since university, but so as not to have regrets, I decided to try something new while I still have the energy. I want to support children, not only in Japan, in countries where schooling is hard to get. To make that happen, I\'m going to graduate school in the evenings.'],
      },
    },
    {
      id: 'smartphone', group: 'opinion',
      q: ['スマホがなくても生活[せいかつ]できますか。', 'Could you live without a smartphone?'],
      N5: {
        words: ['スマホ|smartphone', '地図[ちず]|map', '写真[しゃしん]|photos', '友達[ともだち]|friends', '大切[たいせつ]|important', '〜時間[じかん]|… hours'],
        verbs: ['使[つか]います|use', '見[み]ます|look at', '撮[と]ります|take (photos)', 'できません|can\'t'],
        grammar: [
          'たぶん|probably|たぶん、できません。|Probably not.',
          '〜ぐらい|about …|毎日[まいにち]三時間[さんじかん]ぐらい使[つか]います。|I use it about three hours a day.',
          '〜で〜ます|do … with/on …|スマホで地図[ちず]を見[み]ます。|I look at maps on my phone.',
        ],
        start: 'たぶん、できません。|Probably not.',
        answer: ['たぶん、できません。私[わたし]は毎日[まいにち]スマホを四時間[よじかん]ぐらい使[つか]います。スマホで地図[ちず]を見[み]て、写真[しゃしん]を撮[と]って、友達[ともだち]と話[はな]します。スマホはとても大切[たいせつ]です。',
          'Probably not. I use my smartphone about four hours every day. I look at maps, take photos and talk with friends on it. My phone is very important to me.'],
      },
      N4: {
        words: ['正直[しょうじき]に言[い]うと|to be honest', '連絡[れんらく]|contact', '画面[がめん]|screen', 'それで|so, that\'s why', '夜[よる]|night'],
        verbs: ['困[こま]る|be stuck', '調[しら]べる|look up', '眠[ねむ]れる|can sleep', '使[つか]いすぎる|use too much'],
        grammar: [
          '〜たら|if …|スマホがなかったら、困[こま]ります。|If I didn\'t have a phone, I\'d be stuck.',
          '〜たり〜たりする|do things like …|時間[じかん]を調[しら]べたり、連絡[れんらく]したりします。|I look up times, get in touch, and so on.',
          '〜ないようにしています|try not to …|使[つか]いすぎないようにしています。|I try not to use it too much.',
        ],
        start: '正直[しょうじき]に言[い]うと、|To be honest, …',
        answer: ['正直[しょうじき]に言[い]うと、スマホがなかったら、とても困[こま]ると思[おも]います。電車[でんしゃ]の時間[じかん]を調[しら]べたり、家族[かぞく]と連絡[れんらく]したりするのに毎日[まいにち]使[つか]っているからです。でも、寝[ね]る前[まえ]に長[なが]い時間[じかん]画面[がめん]を見[み]ると、よく眠[ねむ]れません。それで、最近[さいきん]は夜[よる]十時[じゅうじ]からは使[つか]いすぎないようにしています。',
          'To be honest, I think I\'d be really stuck without my smartphone, because I use it every day to check train times and keep in touch with my family. But if I look at the screen for a long time before bed, I can\'t sleep well. So lately I try not to use it too much after ten at night.'],
      },
      N3: {
        words: ['支払[しはら]い|payments', '通知[つうち]|notifications', 'デジタルデトックス|digital detox', '依存[いぞん]|dependence', '集中力[しゅうちゅうりょく]|concentration'],
        verbs: ['欠[か]かせない|indispensable', '落[お]ち着[つ]かない|feel restless', '気[き]づく|notice', '取[と]り戻[もど]す|get back'],
        grammar: [
          '〜ないことはない|it\'s not that I can\'t …|できないことはないです。|It\'s not that I couldn\'t.',
          '〜に欠[か]かせない|indispensable for …|仕事[しごと]に欠[か]かせない道具[どうぐ]です。|It\'s an indispensable tool for work.',
          '〜てはじめて|only after …|やめてはじめて、その大切[たいせつ]さに気[き]づきました。|Only after stopping did I notice how important it was.',
        ],
        start: 'できないことはないですが、|It\'s not that I couldn\'t, but …',
        answer: ['できないことはないですが、かなり大変[たいへん]だと思[おも]います。今[いま]やスマホは支払[しはら]いや仕事[しごと]の連絡[れんらく]に欠[か]かせない道具[どうぐ]になっています。以前[いぜん]、休暇中[きゅうかちゅう]に一週間[いっしゅうかん]デジタルデトックスをしてみたことがありますが、最初[さいしょ]の二日[ふつか]は落[お]ち着[つ]きませんでした。ただ、通知[つうち]に振[ふ]り回[まわ]されない生活[せいかつ]を経験[けいけん]してはじめて、自分[じぶん]がいかに依存[いぞん]していたかに気[き]づき、集中力[しゅうちゅうりょく]を取[と]り戻[もど]せた気[き]がしました。',
          'It\'s not that I couldn\'t, but I think it would be pretty hard. These days a smartphone is an indispensable tool for payments and keeping in touch for work. I once tried a week-long digital detox on holiday, and for the first two days I felt restless. But only after living without being ruled by notifications did I notice how dependent I\'d been — and I felt I got my concentration back.'],
      },
    },
    {
      id: 'city-country', group: 'opinion',
      q: ['都会[とかい]と田舎[いなか]、どちらに住[す]みたいですか。', 'Would you rather live in the city or the countryside?'],
      N5: {
        words: ['都会[とかい]|big city', '田舎[いなか]|countryside', '空気[くうき]|air', '山[やま]|mountain', '人[ひと]が多[おお]い|crowded', '大[おお]きい家[いえ]|big house'],
        verbs: ['住[す]みたいです|want to live', '静[しず]かです|is quiet', '便利[べんり]です|is convenient', 'きれいです|is clean'],
        grammar: [
          '〜のほうがいいです|… is better|田舎[いなか]のほうがいいです。|The countryside is better.',
          'AはBより〜|A is more … than B|田舎[いなか]は都会[とかい]より静[しず]かです。|The countryside is quieter than the city.',
          '〜ですが、〜|…, but …|都会[とかい]は便利[べんり]ですが、人[ひと]が多[おお]いです。|The city is convenient, but crowded.',
        ],
        start: '私[わたし]は〜のほうがいいです。|I prefer …',
        answer: ['私[わたし]は田舎[いなか]のほうがいいです。田舎[いなか]は都会[とかい]より静[しず]かで、空気[くうき]がきれいですから。都会[とかい]は便利[べんり]ですが、人[ひと]が多[おお]いです。私[わたし]は山[やま]の近[ちか]くの大[おお]きい家[いえ]に住[す]みたいです。',
          'I prefer the countryside, because it\'s quieter than the city and the air is clean. The city is convenient, but it\'s crowded. I want to live in a big house near the mountains.'],
      },
      N4: {
        words: ['家賃[やちん]|rent', '物価[ぶっか]|prices', '自然[しぜん]|nature', '若[わか]いうち|while young', '年[とし]をとる|get older'],
        verbs: ['暮[く]らす|live', '選[えら]べる|can choose', '生活[せいかつ]できる|can get by', '違[ちが]う|differ'],
        grammar: [
          '〜によって違[ちが]う|depends on …|年齢[ねんれい]によって違[ちが]うと思[おも]います。|I think it depends on your age.',
          '〜けれど|but …|便利[べんり]だけれど、家賃[やちん]が高[たか]いです。|It\'s convenient, but the rent is high.',
          '〜なくても|even without …|車[くるま]がなくても生活[せいかつ]できます。|You can get by without a car.',
        ],
        start: '〜によって違[ちが]うと思[おも]いますが、|I think it depends on …, but',
        answer: ['年齢[ねんれい]によって違[ちが]うと思[おも]いますが、今[いま]の私[わたし]は都会[とかい]に住[す]みたいです。都会[とかい]は家賃[やちん]や物価[ぶっか]が高[たか]いけれど、電車[でんしゃ]が多[おお]くて、車[くるま]がなくても生活[せいかつ]できます。仕事[しごと]も遊[あそ]びも選[えら]べるので、若[わか]いうちは便利[べんり]なほうがいいです。でも、年[とし]をとったら、自然[しぜん]が多[おお]い田舎[いなか]でのんびり暮[く]らしたいです。',
          'I think it depends on your age, but right now I want to live in the city. Rent and prices are high in the city, but there are lots of trains, and you can get by without a car. You can pick from lots of jobs and things to do, so while you\'re young, convenience is better. But when I get older, I want to live a slow life in the countryside, surrounded by nature.'],
      },
      N3: {
        words: ['利便性[りべんせい]|convenience', '刺激[しげき]|stimulation', '満員電車[まんいんでんしゃ]|packed train', '移住[いじゅう]|moving (to live somewhere)', '地域[ちいき]|local community'],
        verbs: ['疲[つか]れ切[き]る|be worn out', '溶[と]け込[こ]む|fit in', '恵[めぐ]まれる|be blessed with', '一概[いちがい]に言[い]えない|can\'t generalize'],
        grammar: [
          '〜とは限[かぎ]らない|not necessarily …|田舎[いなか]が住[す]みやすいとは限[かぎ]りません。|The countryside isn\'t necessarily easier to live in.',
          '〜ば〜ほど|the more …, the more …|住[す]めば住[す]むほど好[す]きになります。|The longer you live there, the more you like it.',
          '〜派[は]|someone who prefers …|私[わたし]は田舎派[いなかは]です。|I\'m a countryside person.',
        ],
        start: '一概[いちがい]には言[い]えませんが、|You can\'t generalize, but …',
        answer: ['一概[いちがい]には言[い]えませんが、私[わたし]は田舎派[いなかは]です。都会[とかい]の利便性[りべんせい]や刺激[しげき]は魅力的[みりょくてき]ですが、満員電車[まんいんでんしゃ]での通勤[つうきん]に毎日[まいにち]疲[つか]れ切[き]っていました。三年前[さんねんまえ]に長野[ながの]へ移住[いじゅう]してからは、自然[しぜん]に恵[めぐ]まれた環境[かんきょう]で心[こころ]に余裕[よゆう]ができました。もちろん、田舎[いなか]が誰[だれ]にとっても住[す]みやすいとは限[かぎ]りませんが、地域[ちいき]に溶[と]け込[こ]めば溶[と]け込[こ]むほど、暮[く]らしが楽[たの]しくなると感[かん]じています。',
          'You can\'t generalize, but I\'m a countryside person. The convenience and buzz of the city are appealing, but I was worn out every day by commuting on packed trains. Since moving to Nagano three years ago, surrounded by nature, I\'ve felt much calmer. Of course the countryside isn\'t easy for everyone, but I find that the more you become part of the community, the more you enjoy life there.'],
      },
    },
    {
      id: 'free-day', group: 'opinion',
      q: ['一日[いちにち]自由[じゆう]な時間[じかん]があったら、何[なに]をしたいですか。', 'If you had a whole day free, what would you do?'],
      N5: {
        words: ['朝[あさ]|morning', '海[うみ]|sea', '本[ほん]|book', 'ケーキ|cake', 'ゆっくり|slowly, at leisure', '一日中[いちにちじゅう]|all day'],
        verbs: ['寝[ね]たいです|want to sleep', '行[い]きたいです|want to go', '読[よ]みたいです|want to read', '食[た]べたいです|want to eat'],
        grammar: [
          '〜たいです|want to …|海[うみ]に行[い]きたいです。|I want to go to the sea.',
          '〜て、〜たいです|want to …, then …|ゆっくり起[お]きて、本[ほん]を読[よ]みたいです。|I want to get up late and read a book.',
          '〜まで|until …|十時[じゅうじ]まで寝[ね]たいです。|I want to sleep until ten.',
        ],
        start: 'まず、〜たいです。|First, I want to …',
        answer: ['まず、朝[あさ]十時[じゅうじ]までゆっくり寝[ね]たいです。それから、海[うみ]の近[ちか]くのカフェに行[い]って、ケーキを食[た]べたいです。午後[ごご]は海[うみ]を見[み]ながら、好[す]きな本[ほん]を読[よ]みたいです。とても楽[たの]しい一日[いちにち]です。',
          'First, I want to sleep in until ten. Then I want to go to a café by the sea and eat cake. In the afternoon I want to read my favourite book while looking at the sea. That would be a really happy day.'],
      },
      N4: {
        words: ['自由[じゆう]|free', '予定[よてい]|plans', '電源[でんげん]|power (on/off)', '山登[やまのぼ]り|hiking', '頂上[ちょうじょう]|summit'],
        verbs: ['決[き]めない|not decide', '登[のぼ]る|climb', '切[き]る|turn off', '眺[なが]める|look out at'],
        grammar: [
          '〜たら|if …|自由[じゆう]な時間[じかん]があったら、山[やま]に登[のぼ]りたいです。|If I had free time, I\'d climb a mountain.',
          '〜ないで|without …|予定[よてい]を決[き]めないで出[で]かけます。|I go out without making plans.',
          '〜たいと思[おも]います|I think I\'d like to …|ゆっくり休[やす]みたいと思[おも]います。|I think I\'d like to rest.',
        ],
        start: 'もし自由[じゆう]な時間[じかん]があったら、|If I had free time, …',
        answer: ['もし一日[いちにち]自由[じゆう]な時間[じかん]があったら、スマホの電源[でんげん]を切[き]って、一人[ひとり]で山登[やまのぼ]りに行[い]きたいです。いつも仕事[しごと]の予定[よてい]でいっぱいなので、その日[ひ]は何[なに]も決[き]めないで出[で]かけたいです。頂上[ちょうじょう]でお弁当[べんとう]を食[た]べながら、町[まち]を眺[なが]めたいと思[おも]います。夜[よる]は温泉[おんせん]に入[はい]って、早[はや]く寝[ね]ます。',
          'If I had a whole day free, I\'d turn off my phone and go hiking by myself. My days are always full of work plans, so that day I\'d head out without deciding anything. I think I\'d eat a packed lunch at the top while looking out over the town. In the evening I\'d soak in a hot spring and go to bed early.'],
      },
      N3: {
        words: ['思[おも]う存分[ぞんぶん]|to my heart\'s content', '気[き]の向[む]くまま|as the mood takes me', '後回[あとまわ]し|putting off', '積[つ]ん読[どく]|pile of unread books', '贅沢[ぜいたく]|luxury'],
        verbs: ['片[かた]っ端[ぱし]から読[よ]む|read one after another', '没頭[ぼっとう]する|be absorbed in', '気[き]にする|worry about', 'ぶらぶらする|wander around'],
        grammar: [
          '〜としたら|supposing …|一日[いちにち]休[やす]みがあるとしたら、|Supposing I had a day off, …',
          '〜まま|just as …, leaving it as it is|気[き]の向[む]くままに歩[ある]きたいです。|I\'d like to walk wherever the mood takes me.',
          '〜ことなく|without …|時間[じかん]を気[き]にすることなく、本[ほん]を読[よ]みたいです。|I\'d like to read without worrying about the time.',
        ],
        start: 'もし丸一日[まるいちにち]自由[じゆう]に使[つか]えるとしたら、|If I could use a whole day as I liked, …',
        answer: ['もし丸一日[まるいちにち]自由[じゆう]に使[つか]えるとしたら、ずっと後回[あとまわ]しにしてきた積[つ]ん読[どく]を片[かた]っ端[ぱし]から読[よ]みたいです。普段[ふだん]は寝[ね]る前[まえ]に数[すう]ページ読[よ]むのがやっとなので、時間[じかん]を気[き]にすることなく物語[ものがたり]に没頭[ぼっとう]できたら、それだけで贅沢[ぜいたく]だと思[おも]います。疲[つか]れたら、気[き]の向[む]くままに近所[きんじょ]の古本屋[ふるほんや]をぶらぶらして、また新[あたら]しい本[ほん]を買[か]ってしまいそうです。',
          'If I could use a whole day as I liked, I\'d read through the pile of unread books I\'ve kept putting off. Normally I can barely manage a few pages before bed, so being able to lose myself in a story without watching the clock would be a luxury in itself. When I got tired, I\'d wander round the local second-hand bookshops wherever the mood took me — and probably end up buying more books.'],
      },
    },
  ];

  global.CONVERSATION_GROUPS = CONVERSATION_GROUPS;
  global.CONVERSATION_TOPICS = CONVERSATION_TOPICS;
  if (typeof module !== 'undefined' && module.exports) module.exports = { CONVERSATION_GROUPS, CONVERSATION_TOPICS };
})(typeof window !== 'undefined' ? window : globalThis);
