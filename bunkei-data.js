(function (global) {
  'use strict';

  // Sentence patterns (文型, bunkei) for the Bunkei drill (bunkei.html): one
  // verb is put through many patterns — 〜させてください, 〜なければなりません,
  // 〜かもしれません… — and the learner translates each English sentence.
  //
  // Sentences are generated, not hand-written: each pattern conjugates the
  // verb with Conjugator and wraps it in the verb's natural object phrase from
  // examples.js (食べる → 寿司を, 行く → 学校に). Only verbs whose context is an
  // ordinary action (kind 'act') are used, since patterns like "please let
  // me" or "you must" don't make sense for 忘れる or 雨が降る.
  //
  // Each pattern has:
  //   ja(p)      Japanese, in 漢字[かんじ] furigana markup
  //   en(p)      English
  //   skip       verbs (by kanji) where the pattern reads unnaturally
  //   needs      a conjugation form the verb context may opt out of via `skip`
  // Relies on conjugator.js (a top-level `const Conjugator`, so referenced as
  // a bare global rather than via window) and examples.js being loaded first.
  //
  // where `p` gives the verb's pieces: pre (object phrase), c(form) for a
  // conjugation with kanji restored, stem (ます stem), v/o (English verb and
  // object), and a few derived English forms.

  const LEVELS = ['N5', 'N4', 'N3'];

  // English past participles that differ from the simple past.
  const PARTICIPLE = {
    be: 'been', begin: 'begun', break: 'broken', choose: 'chosen', come: 'come', do: 'done',
    draw: 'drawn', drink: 'drunk', drive: 'driven', eat: 'eaten', fall: 'fallen', forget: 'forgotten',
    get: 'gotten', give: 'given', go: 'gone', grow: 'grown', know: 'known', ride: 'ridden', run: 'run',
    see: 'seen', sightsee: 'been sightseeing', sing: 'sung', speak: 'spoken', steal: 'stolen',
    swim: 'swum', take: 'taken', wake: 'woken', withdraw: 'withdrawn', write: 'written', become: 'become',
  };

  // Verbs of motion / existence, whose 〜ている means a resulting state
  // ("has gone", "is here") rather than "is doing now".
  const STATE_TE_IRU = ['行く', '来る', '帰る', '出かける', '入る', 'いる', 'ある', '起きる', '座る', '立つ', '乗る', '降りる', '結婚する', '卒業する'];

  // One-off life events: fine with "I've decided to" or "might", but not with
  // patterns marked `repeated` — ones that imply repetition, trying it out or
  // doing it together ("every day", "let's … together", "try … once").
  const ONE_OFF = ['卒業する', '結婚する', '就職する', '留学する', '離婚する', '優勝する', '引っ越す', 'なる', '別れる', '付き合う', '入学する'];

  // Wrongdoing and mishaps: fine as "must not" or "was made to", but not as
  // something to plan, wish for or report on (〜たら, 〜ばよかった…).
  const NOT_ORDINARY = ['殴る', '盗む', '踏む', 'いじめる', '壊す', 'サボる', '離婚する', '別れる', '諦める', 'もてる', '心配する'];

  // Existence verbs read oddly in almost every pattern ("please let me be in
  // the classroom"), so they're left out of the drill.
  const EXCLUDED_VERBS = ['いる', 'ある'];

  // 〜ながら joins two actions, so each verb it's drilled with is paired with a
  // second verb: the main action, done while the drill verb's action goes on
  // (寿司を食べながら → 映画を見ます). Keyed like usableVerbs (kanji, or
  // kanji_disambig); only verbs listed here get the pattern, since it needs an
  // action that lasts a while (not 開ける or 着く).
  const NAGARA = {
    '聞く': ['日本語[にほんご]を勉強[べんきょう]します', 'study Japanese'],
    '飲む': ['新聞[しんぶん]を読[よ]みます', 'read the newspaper'],
    '話す': ['駅[えき]まで歩[ある]きます', 'walk to the station'],
    '読む': ['コーヒーを飲[の]みます', 'drink coffee'],
    '食べる': ['テレビを見[み]ます', 'watch TV'],
    '見る': ['ポップコーンを食[た]べます', 'eat popcorn'],
    'する': ['音楽[おんがく]を聞[き]きます', 'listen to music'],
    '勉強する': ['音楽[おんがく]を聞[き]きます', 'listen to music'],
    '待つ': ['本[ほん]を読[よ]みます', 'read a book'],
    '泳ぐ': ['いろいろなことを考[かんが]えます', 'think about all sorts of things'],
    '急ぐ': ['パンを食[た]べます', 'eat some bread'],
    '吸う': ['コーヒーを飲[の]みます', 'drink coffee'],
    '使う': ['お茶[ちゃ]を飲[の]みます', 'drink tea'],
    '持つ': ['階段[かいだん]を上[のぼ]ります', 'climb the stairs'],
    '教える': ['日本語[にほんご]を習[なら]っています', 'am learning Japanese'],
    '歌う': ['ギターを弾[ひ]きます', 'play the guitar'],
    '働く': ['大学[だいがく]に通[かよ]っています', 'am going to university'],
    '洗う': ['歌[うた]を歌[うた]います', 'sing a song'],
    '作る': ['音楽[おんがく]を聞[き]きます', 'listen to music'],
    '運転する': ['ラジオを聞[き]きます', 'listen to the radio'],
    '洗濯する': ['電話[でんわ]で話[はな]します', 'talk on the phone'],
    '掃除する': ['ラジオを聞[き]きます', 'listen to the radio'],
    '料理する': ['歌[うた]を歌[うた]います', 'sing a song'],
    '弾く': ['歌[うた]を歌[うた]います', 'sing a song'],
    '覚える': ['ノートに何度[なんど]も書[か]きます', 'write in my notebook again and again'],
    '運動する': ['音楽[おんがく]を聞[き]きます', 'listen to music'],
    '散歩する': ['いろいろなことを考[かんが]えます', 'think about all sorts of things'],
    '習う': ['働[はたら]いています', 'am working'],
    '登る': ['写真[しゃしん]を撮[と]ります', 'take photos'],
    '編む': ['テレビを見[み]ます', 'watch TV'],
    '描く_draw': ['音楽[おんがく]を聞[き]きます', 'listen to music'],
    '探す': ['アルバイトをしています', 'am working a part-time job'],
    'しゃべる': ['料理[りょうり]をします', 'cook'],
    '調べる': ['レポートを書[か]きます', 'write a report'],
    '観光する': ['写真[しゃしん]を撮[と]ります', 'take photos'],
    '化粧する': ['音楽[おんがく]を聞[き]きます', 'listen to music'],
    '考える': ['海[うみ]を見[み]ています', 'am looking at the sea'],
    '走る': ['音楽[おんがく]を聞[き]きます', 'listen to music'],
    '運ぶ': ['階段[かいだん]を上[のぼ]ります', 'climb the stairs'],
    '着替える': ['テレビを見[み]ます', 'watch TV'],
    '翻訳する': ['辞書[じしょ]を引[ひ]きます', 'look words up in the dictionary'],
    '説明する': ['図[ず]を描[か]きます', 'draw a diagram'],
    '案内する': ['町[まち]の歴史[れきし]を話[はな]します', 'talk about its history'],
    '片付ける': ['音楽[おんがく]を聞[き]きます', 'listen to music'],
    '焼く': ['歌[うた]を歌[うた]います', 'sing a song'],
    '拾う': ['公園[こうえん]を歩[ある]きます', 'walk around the park'],
    '我慢する': ['仕事[しごと]を続[つづ]けました', 'kept working'],
  };

  const only = keys => Object.fromEntries(keys.map(k => [k, true]));

  // Skills, for 〜ようになりました ("I can finally…").
  const SKILLS = only(['話す', '読む', '書く', '泳ぐ', '運転する', '弾く', '料理する', '作る', '歌う',
    '踊る', '編む', '描く_draw', '起きる', '食べる', '飲む', '覚える', '翻訳する', '訳す', '走る', '登る',
    '使う', '直す', '焼く', '説明する', '教える', '乗る']);

  // Things you'd normally do before bed, for 〜ずに寝ました ("went to bed without…").
  const BEDTIME = only(['磨く', '勉強する', '洗う', '片付ける', '消す', '電話をかける', '連絡する',
    '書く', '読む', '洗濯する', '掃除する', '着替える', '脱ぐ', '食べる', '謝る', '練習する', '調べる']);

  // 〜てから: the drill verb happens first, then this second action
  // (寿司を食べてから → 歯を磨きます). Keyed like NAGARA; every usable verb has
  // an entry (test_bunkei.js checks), so add one here for any new verb.
  const TE_KARA = {
    '食べる': ['歯[は]を磨[みが]きます', 'brush my teeth'],
    '飲む': ['仕事[しごと]を始[はじ]めます', 'start work'],
    '帰る': ['晩[ばん]ご飯[はん]を食[た]べます', 'eat dinner'],
    '起きる': ['シャワーを浴[あ]びます', 'take a shower'],
    '勉強する': ['テレビを見[み]ます', 'watch TV'],
    '見る': ['寝[ね]ます', 'go to bed'],
    'する': ['シャワーを浴[あ]びます', 'take a shower'],
    '運動する': ['シャワーを浴[あ]びます', 'take a shower'],
    '走る': ['シャワーを浴[あ]びます', 'take a shower'],
    '書く': ['郵便局[ゆうびんきょく]に行[い]きます', 'go to the post office'],
    '読む': ['寝[ね]ます', 'go to bed'],
    '買う_buy': ['家[いえ]に帰[かえ]ります', 'go home'],
    '洗う': ['お風呂[ふろ]に入[はい]ります', 'take a bath'],
    '掃除する': ['友達[ともだち]を呼[よ]びます', 'invite my friends over'],
    '片付ける': ['出[で]かけます', 'go out'],
    '着替える': ['出[で]かけます', 'go out'],
    '調べる': ['レポートを書[か]きます', 'write the report'],
    '磨く': ['寝[ね]ます', 'go to bed'],
    '電話をかける': ['寝[ね]ます', 'go to bed'],
    '料理する': ['家族[かぞく]と食[た]べます', 'eat with my family'],
    '作る': ['家族[かぞく]と食[た]べます', 'eat with my family'],
    '予約する': ['友達[ともだち]を誘[さそ]います', 'invite a friend'],
    '練習する': ['ジュースを飲[の]みます', 'drink some juice'],
    '散歩する': ['朝[あさ]ご飯[はん]を食[た]べます', 'eat breakfast'],
    '脱ぐ': ['部屋[へや]に入[はい]ります', 'go into the room'],
    '相談する': ['決[き]めます', 'decide'],
    '返す': ['新[あたら]しい本[ほん]を借[か]ります', 'borrow a new book'],
    '降りる': ['少[すこ]し歩[ある]きます', 'walk a little'],
    '行く': ['図書館[としょかん]で勉強[べんきょう]します', 'study at the library'],
    '聞く': ['寝[ね]ます', 'go to bed'],
    '話す': ['英語[えいご]で説明[せつめい]します', 'explain it in English'],
    '寝る': ['朝[あさ]五時[ごじ]に起[お]きます', 'get up at five in the morning'],
    '来る': ['日本語[にほんご]を勉強[べんきょう]し始[はじ]めました', 'started studying Japanese'],
    '会う': ['一緒[いっしょ]に映画[えいが]を見[み]ます', 'watch a movie together'],
    '撮る_photo': ['友達[ともだち]に送[おく]ります', 'send it to a friend'],
    '待つ': ['タクシーに乗[の]りました', 'took a taxi'],
    '泳ぐ': ['シャワーを浴[あ]びます', 'take a shower'],
    '聞く_ask': ['宿題[しゅくだい]をします', 'do my homework'],
    '乗る': ['本[ほん]を読[よ]みます', 'read a book'],
    'やる': ['シャワーを浴[あ]びます', 'take a shower'],
    '出かける': ['日曜日[にちようび]はゆっくり休[やす]みます', 'take it easy on Sunday'],
    '遊ぶ': ['家[いえ]に帰[かえ]ります', 'go home'],
    '急ぐ': ['電車[でんしゃ]に乗[の]りました', 'caught the train'],
    '消す': ['寝[ね]ます', 'go to bed'],
    '座る': ['話[はなし]を始[はじ]めます', 'start talking'],
    '立つ': ['写真[しゃしん]を撮[と]ります', 'take a photo'],
    '吸う': ['仕事[しごと]に戻[もど]ります', 'go back to work'],
    '使う': ['電源[でんげん]を切[き]ります', 'turn it off'],
    '手伝う': ['一緒[いっしょ]に晩[ばん]ご飯[はん]を食[た]べます', 'have dinner together'],
    '入る': ['電気[でんき]をつけます', 'turn on the light'],
    '持つ': ['家[いえ]を出[で]ます', 'leave the house'],
    '休む': ['一日中[いちにちじゅう]寝[ね]ていました', 'slept all day'],
    '開ける': ['掃除[そうじ]をします', 'clean up'],
    '教える': ['日本語[にほんご]を習[なら]います', 'learn Japanese'],
    '借りる': ['家[いえ]で読[よ]みます', 'read it at home'],
    'つける': ['ニュースを見[み]ます', 'watch the news'],
    '連れてくる': ['一緒[いっしょ]にゲームをします', 'play games together'],
    '持ってくる': ['公園[こうえん]で食[た]べます', 'eat it in the park'],
    '歌う': ['水[みず]を飲[の]みます', 'drink some water'],
    'かぶる': ['出[で]かけます', 'go out'],
    '知る': ['彼[かれ]に手紙[てがみ]を書[か]きました', 'wrote him a letter'],
    '住む': ['友達[ともだち]がたくさんできました', 'made lots of friends'],
    'はく': ['出[で]かけます', 'go out'],
    'かける': ['新聞[しんぶん]を読[よ]みます', 'read the newspaper'],
    '着る_wear': ['ネクタイを締[し]めます', 'put on a tie'],
    '勤める': ['スーツを買[か]いました', 'bought a suit'],
    '痩せる': ['新[あたら]しい水着[みずぎ]を買[か]います', 'buy a new swimsuit'],
    '結婚する': ['大阪[おおさか]に引[ひ]っ越[こ]しました', 'moved to Osaka'],
    '言う': ['部屋[へや]を出[で]ました', 'left the room'],
    '思う': ['友達[ともだち]にも聞[き]いてみました', 'asked a friend too'],
    '切る_cut': ['箱[はこ]に貼[は]ります', 'stick it on the box'],
    '持っていく': ['公園[こうえん]で食[た]べます', 'eat it in the park'],
    '始める': ['一時間[いちじかん]で終[お]わりました', 'finished in an hour'],
    '運転する': ['少[すこ]し休[やす]みます', 'take a short rest'],
    '洗濯する': ['外[そと]に干[ほ]します', 'hang them up outside'],
    '踊る': ['水[みず]を飲[の]みます', 'drink some water'],
    '弾く': ['歌[うた]を歌[うた]います', 'sing a song'],
    'もらう': ['お礼[れい]のメールを送[おく]ります', 'send a thank-you email'],
    '覚える': ['テストを受[う]けます', 'take the test'],
    '出る': ['アルバイトに行[い]きます', 'go to my part-time job'],
    '泊まる': ['次[つぎ]の日[ひ]に京都[きょうと]へ行[い]きます', 'go to Kyoto the next day'],
    'なる': ['とても忙[いそが]しくなりました', 'got very busy'],
    '払う': ['店[みせ]を出[で]ます', 'leave the shop'],
    '決める': ['ホテルを予約[よやく]します', 'book a hotel'],
    '取る_class': ['日本[にほん]に興味[きょうみ]を持[も]ちました', 'got interested in Japan'],
    '習う': ['日本[にほん]に旅行[りょこう]しました', 'traveled to Japan'],
    '登る': ['お弁当[べんとう]を食[た]べます', 'eat my boxed lunch'],
    '働く': ['料理[りょうり]が上手[じょうず]になりました', 'got good at cooking'],
    '飼う_pet': ['早[はや]く起[お]きるようになりました', 'started getting up early'],
    'サボる': ['先生[せんせい]に怒[おこ]られました', 'got told off by the teacher'],
    'やめる': ['世界[せかい]を旅行[りょこう]しました', 'traveled around the world'],
    '紹介する': ['一緒[いっしょ]にご飯[はん]を食[た]べます', 'eat together'],
    'ダイエットする': ['海[うみ]に行[い]きます', 'go to the beach'],
    '留学する': ['英語[えいご]が上手[じょうず]になりました', 'got better at English'],
    '別れる': ['毎日[まいにち]泣[な]いていました', 'cried every day'],
    '心配する': ['よく眠[ねむ]れなくなりました', "couldn't sleep well"],
    '編む': ['友達[ともだち]にあげます', 'give it to a friend'],
    '貸す': ['少[すこ]し後悔[こうかい]しました', 'regretted it a little'],
    '頑張る': ['ゆっくり休[やす]みます', 'have a good rest'],
    '約束を守る': ['気持[きも]ちが楽[らく]になりました', 'felt relieved'],
    '送る': ['友達[ともだち]に連絡[れんらく]します', 'let my friend know'],
    '諦める': ['新[あたら]しい仕事[しごと]を探[さが]しました', 'looked for a new job'],
    'あげる': ['一緒[いっしょ]にケーキを食[た]べます', 'eat cake together'],
    '売る': ['自転車[じてんしゃ]を買[か]いました', 'bought a bicycle'],
    '下ろす': ['買[か]い物[もの]に行[い]きます', 'go shopping'],
    '描く_draw': ['壁[かべ]に飾[かざ]ります', 'hang it on the wall'],
    '探す': ['面接[めんせつ]を受[う]けました', 'had an interview'],
    '誘う': ['料理[りょうり]を準備[じゅんび]します', 'prepare the food'],
    'しゃべる': ['寝[ね]ます', 'go to bed'],
    '付き合う': ['毎日[まいにち]が楽[たの]しくなりました', 'started enjoying every day more'],
    '着く': ['友達[ともだち]に電話[でんわ]します', 'call my friend'],
    '気をつける': ['道[みち]を渡[わた]ります', 'cross the road'],
    '観光する': ['旅館[りょかん]に泊[と]まります', 'stay at a ryokan'],
    '卒業する': ['銀行[ぎんこう]に就職[しゅうしょく]しました', 'got a job at a bank'],
    '起こす': ['朝[あさ]ご飯[はん]を作[つく]ります', 'make breakfast'],
    'おごる': ['お金[かね]がなくなりました', 'had no money left'],
    '出す': ['家[いえ]に帰[かえ]ります', 'go home'],
    '直す': ['レポートを書[か]きます', 'write my report'],
    '訳す': ['先生[せんせい]に見[み]せます', 'show it to the teacher'],
    '笑う': ['元気[げんき]になりました', 'felt better'],
    '集める': ['友達[ともだち]に見[み]せます', 'show them to my friends'],
    '入れる': ['よく混[ま]ぜます', 'stir it well'],
    '見せる': ['旅行[りょこう]の話[はなし]をします', 'talk about my trip'],
    '案内する': ['一緒[いっしょ]に晩[ばん]ご飯[はん]を食[た]べます', 'eat dinner together'],
    '説明する': ['質問[しつもん]に答[こた]えます', 'answer questions'],
    '選ぶ': ['レジで払[はら]います', 'pay at the register'],
    '化粧する': ['出[で]かけます', 'go out'],
    '就職する': ['一人暮[ひとりぐ]らしを始[はじ]めました', 'started living on my own'],
    '離婚する': ['実家[じっか]に戻[もど]りました', "went back to my parents' home"],
    '謝る': ['教室[きょうしつ]に戻[もど]りました', 'went back to the classroom'],
    '押す': ['少[すこ]し待[ま]ちます', 'wait a moment'],
    '壊す': ['母[はは]に叱[しか]られました', 'got scolded by my mother'],
    '考える': ['大学[だいがく]を選[えら]びました', 'chose a university'],
    '注文する': ['映画[えいが]を見[み]ます', 'watch a movie'],
    '引っ越す': ['新[あたら]しい友達[ともだち]ができました', 'made new friends'],
    '呼ぶ': ['空港[くうこう]に行[い]きます', 'go to the airport'],
    '寄る': ['家[いえ]に帰[かえ]ります', 'go home'],
    'もてる': ['自信[じしん]がつきました', 'became more confident'],
    '招待する': ['席[せき]を決[き]めます', 'decide on the seating'],
    '注意する': ['道[みち]を渡[わた]ります', 'cross the road'],
    '曲がる': ['まっすぐ行[い]きます', 'go straight on'],
    '戻る': ['忘[わす]れ物[もの]を取[と]ります', 'get what I forgot'],
    '伝える': ['家[いえ]に帰[かえ]ります', 'go home'],
    '交換する': ['別[わか]れました', 'said goodbye'],
    '生活する': ['一人[ひとり]で何[なん]でもできるようになりました', 'learned to do everything on my own'],
    '置く': ['椅子[いす]に座[すわ]ります', 'sit down on the chair'],
    '触る': ['手[て]を洗[あら]います', 'wash my hands'],
    '包む': ['リボンを付[つ]けます', 'tie a ribbon on it'],
    '殴る': ['手[て]を怪我[けが]しました', 'hurt my hand'],
    '盗む': ['警察[けいさつ]に捕[つか]まりました', 'got caught by the police'],
    '貼る': ['写真[しゃしん]を撮[と]ります', 'take a photo'],
    '踏む': ['猫[ねこ]に引[ひ]っかかれました', 'got scratched by the cat'],
    '焼く': ['友達[ともだち]と食[た]べます', 'eat it with my friends'],
    'いじめる': ['先生[せんせい]に怒[おこ]られました', 'got told off by the teacher'],
    'ためる': ['車[くるま]を買[か]います', 'buy a car'],
    '続ける': ['試験[しけん]に合格[ごうかく]しました', 'passed the exam'],
    '褒める': ['宿題[しゅくだい]を返[かえ]します', 'hand back the homework'],
    '見つける': ['警察[けいさつ]に届[とど]けました', 'took it to the police'],
    '連絡する': ['会[あ]う場所[ばしょ]を決[き]めます', 'decide where to meet'],
    '勝つ': ['みんなでお祝[いわ]いしました', 'celebrated with everyone'],
    '運ぶ': ['少[すこ]し休[やす]みます', 'take a short rest'],
    '拾う': ['ゴミ箱[ばこ]に捨[す]てます', 'throw it in the bin'],
    '育てる': ['料理[りょうり]に使[つか]います', 'use them in my cooking'],
    '助ける': ['お礼[れい]を言[い]われました', 'was thanked'],
    '賛成する': ['理由[りゆう]を説明[せつめい]します', 'explain why'],
    '反対する': ['新[あたら]しい案[あん]を出[だ]しました', 'suggested a new idea'],
    '翻訳する': ['出版社[しゅっぱんしゃ]に送[おく]ります', 'send it to the publisher'],
    '受ける': ['友達[ともだち]と答[こた]えを確[たし]かめます', 'check the answers with my friends'],
    '答える': ['席[せき]に座[すわ]ります', 'sit back down'],
    '離れる': ['家族[かぞく]の大切[たいせつ]さがわかりました', 'realized how important my family is'],
    '我慢する': ['病院[びょういん]に行[い]きました', 'went to the hospital'],
    '優勝する': ['有名[ゆうめい]になりました', 'became famous'],
  };

  // 〜前に: this action comes first, before the drill verb
  // (寿司を食べる前に ← 手を洗います).
  const MAE_NI = {
    '食べる': ['手[て]を洗[あら]います', 'wash my hands'],
    '料理する': ['手[て]を洗[あら]います', 'wash my hands'],
    '行く': ['朝[あさ]ご飯[はん]を食[た]べます', 'eat breakfast'],
    '帰る': ['スーパーに寄[よ]ります', 'stop by the supermarket'],
    '来る': ['日本語[にほんご]を勉強[べんきょう]しました', 'studied Japanese'],
    '留学する': ['英語[えいご]を勉強[べんきょう]しました', 'studied English'],
    '入る': ['靴[くつ]を脱[ぬ]ぎます', 'take off my shoes'],
    '泳ぐ': ['準備[じゅんび]運動[うんどう]をします', 'warm up'],
    '運転する': ['お酒[さけ]を飲[の]みません', "don't drink alcohol"],
    '買う_buy': ['値段[ねだん]を調[しら]べます', 'check the price'],
    '書く': ['よく考[かんが]えます', 'think carefully'],
    '答える': ['よく考[かんが]えます', 'think carefully'],
    '見る': ['ポップコーンを買[か]います', 'buy popcorn'],
    '乗る': ['切符[きっぷ]を買[か]います', 'buy a ticket'],
    '引っ越す': ['部屋[へや]を片付[かたづ]けます', 'tidy up my room'],
    '登る': ['天気[てんき]を調[しら]べます', 'check the weather'],
    '出る': ['教科書[きょうかしょ]を読[よ]みます', 'read the textbook'],
    '受ける': ['たくさん勉強[べんきょう]します', 'study a lot'],
    '注文する': ['メニューを見[み]ます', 'look at the menu'],
    '観光する': ['ガイドブックを読[よ]みます', 'read a guidebook'],
    '化粧する': ['顔[かお]を洗[あら]います', 'wash my face'],
  };

  // Things you can do for someone else, for 〜てあげる / 〜てくれる / 〜てもらう.
  const FAVORS = only(['買う_buy', '書く', '撮る_photo', '作る', '洗う', '掃除する', '料理する', '直す', '運ぶ',
    '持つ', '開ける', '消す', '返す', '呼ぶ', '予約する', '調べる', '訳す', '翻訳する', '弾く', '歌う',
    '片付ける', '焼く', '包む', '送る', '選ぶ', '編む', '描く_draw', '洗濯する']);

  // 迷惑の受身, "had my … eaten on me": who did it.
  const SUFFERING_PASSIVE = {
    '食べる': ['弟[おとうと]', 'my little brother'],
    '飲む': ['姉[あね]', 'my big sister'],
    '使う': ['弟[おとうと]', 'my little brother'],
    '着る_wear': ['妹[いもうと]', 'my little sister'],
    '壊す': ['弟[おとうと]', 'my little brother'],
    '盗む': ['誰[だれ]か', 'someone'],
  };

  // 〜すぎました, with the English for each (it rarely maps to "too much" word for word).
  const SUGIRU = {
    '食べる': 'I ate too much sushi.',
    '飲む': 'I drank too much coffee.',
    '吸う': 'I smoked too many cigarettes.',
    '見る': 'I watched too many movies.',
    '撮る_photo': 'I took too many photos.',
    '歌う': 'I sang too many songs.',
    '集める': 'I collected too many stamps.',
    '入れる': 'I put too much sugar in the coffee.',
    '払う': 'I paid too much money.',
    '待つ': 'I waited too long for the bus.',
    '焼く': 'I baked the cake for too long.',
    '頑張る': 'I worked too hard for the exam.',
    '考える': 'I thought too much about the future.',
    '勉強する': 'I studied Japanese too hard.',
    '練習する': 'I practiced tennis too much.',
    '働く': 'I worked too much at the restaurant.',
    '走る': 'I ran too much in the park.',
    '使う': 'I used the computer too much.',
  };

  // Activities that carry on once started, for 〜始めました.
  const ONGOING = only(['勉強する', '習う', '練習する', '運動する', '散歩する', '走る', '働く', '編む',
    '描く_draw', '弾く', '集める', '育てる', '料理する', 'ためる', '吸う', '読む', '探す', '使う', '泳ぐ']);

  // Drops the final る of a ru-verb-like form (potential, causative…) and adds an ending.
  const ruTo = (form, ending) => form.slice(0, -1) + ending;
  // 食べない → 食べな + ending (〜なければ, 〜なくて)
  const naiTo = (nai, ending) => nai.slice(0, -1) + ending;

  const PATTERNS = [
    // ── N5 ──
    { id: 'te-kudasai', level: 'N5', name: '〜てください', meaning: 'please do',
      note: 'A polite request: て-form + ください.',
      ja: p => `${p.pre}${p.c('te')}ください。`,
      en: p => `Please ${p.v} ${p.o}.` },
    { id: 'naide-kudasai', level: 'N5', name: '〜ないでください', meaning: 'please don\'t',
      note: 'A polite request not to do something: ない-form + でください.',
      ja: p => `${p.pre}${p.c('nai')}でください。`,
      en: p => `Please don't ${p.v} ${p.o}.` },
    { id: 'tai', level: 'N5', name: '〜たいです', meaning: 'want to',
      note: 'Your own wish: ます-stem + たい. It conjugates like an い-adjective.',
      ja: p => `${p.pre}${p.c('tai')}です。`,
      en: p => `I want to ${p.v} ${p.o}.` },
    { id: 'masen-ka', level: 'N5', name: '〜ませんか', meaning: 'won\'t you…? (invitation)',
      note: 'A polite invitation: ます-stem + ませんか.',
      repeated: true,
      ja: p => `一緒[いっしょ]に${p.pre}${p.stem}ませんか。`,
      en: p => `Would you like to ${p.v} ${p.o} together?` },
    { id: 'mashou', level: 'N5', name: '〜ましょう', meaning: 'let\'s',
      note: 'A suggestion to do something together: ます-stem + ましょう.',
      repeated: true,
      ja: p => `一緒[いっしょ]に${p.pre}${p.stem}ましょう。`,
      en: p => `Let's ${p.v} ${p.o} together.` },
    { id: 'te-iru', level: 'N5', name: '〜ています', meaning: 'am doing (now)',
      note: 'An action in progress: て-form + います.',
      repeated: true,
      skip: STATE_TE_IRU,
      ja: p => `今[いま]、${p.pre}${p.c('te')}います。`,
      en: p => `I'm ${p.ing} ${p.o} right now.` },
    { id: 'te-mo-ii', level: 'N5', name: '〜てもいいですか', meaning: 'may I…?',
      note: 'Asking permission: て-form + もいいですか.',
      ja: p => `${p.pre}${p.c('te')}もいいですか。`,
      en: p => `May I ${p.v} ${p.o}?` },
    { id: 'te-wa-ikenai', level: 'N5', name: '〜てはいけません', meaning: 'must not',
      note: 'Prohibition: て-form + はいけません.',
      ja: p => `${p.pre}${p.c('te')}はいけません。`,
      en: p => `You must not ${p.v} ${p.o}.` },
    { id: 'te-kara', level: 'N5', name: '〜てから', meaning: 'after doing',
      note: 'One action, then the next: て-form + から, then what comes after.',
      only: TE_KARA,
      ja: p => `${p.pre}${p.c('te')}から、${TE_KARA[p.key][0]}。`,
      en: p => `I ${TE_KARA[p.key][1]} after ${p.ing} ${p.o}.` },
    { id: 'mae-ni', level: 'N5', name: '〜前に', meaning: 'before doing',
      note: 'What you do first: dictionary form + 前に, then that action. The verb before 前に stays in the dictionary form even in the past.',
      only: MAE_NI,
      needs: 'dict',
      ja: p => `${p.pre}${p.c('dict')}前[まえ]に、${MAE_NI[p.key][0]}。`,
      en: p => `I ${MAE_NI[p.key][1]} before ${p.ing} ${p.o}.` },

    // ── N4 ──
    { id: 'potential', level: 'N4', name: 'Potential 〜(ら)れます', meaning: 'can',
      note: 'Ability: う-verbs 〜える, る-verbs 〜られる, する → できる, くる → こられる. The object often takes が.',
      needs: 'potential',
      ja: p => `${p.potPre}${ruTo(p.c('potential'), 'ます')}。`,
      en: p => `I can ${p.v} ${p.o}.` },
    { id: 'potential-neg', level: 'N4', name: 'Potential 〜(ら)れません', meaning: 'can\'t',
      note: 'Inability: the potential form, made negative like any る-verb.',
      needs: 'potential',
      ja: p => `${p.potPre}${ruTo(p.c('potential'), 'ません')}。`,
      en: p => `I can't ${p.v} ${p.o}.` },
    { id: 'nakereba-naranai', level: 'N4', name: '〜なければなりません', meaning: 'must, have to',
      note: 'Obligation: ない-form, drop い, add ければなりません. Casual: 〜なきゃ.',
      ja: p => `${p.pre}${naiTo(p.c('nai'), 'ければなりません')}。`,
      en: p => `I have to ${p.v} ${p.o}.` },
    { id: 'nakute-mo-ii', level: 'N4', name: '〜なくてもいいです', meaning: 'don\'t have to',
      note: 'No obligation: ない-form, drop い, add くてもいいです.',
      ja: p => `${p.pre}${naiTo(p.c('nai'), 'くてもいいです')}。`,
      en: p => `You don't have to ${p.v} ${p.o}.` },
    { id: 'sasete-kudasai', level: 'N4', name: '〜させてください', meaning: 'please let me',
      note: 'Asking permission to do something yourself: causative て-form + ください.',
      needs: 'causative',
      ja: p => `${p.pre}${ruTo(p.c('causative'), 'て')}ください。`,
      en: p => `Please let me ${p.v} ${p.o}.` },
    { id: 'ta-koto-ga-aru', level: 'N4', name: '〜たことがあります', meaning: 'have (ever) done',
      note: 'Past experience: た-form + ことがあります.',
      repeated: true,
      ja: p => `${p.pre}${p.c('ta')}ことがあります。`,
      en: p => `I have ${p.pp} ${p.o} before.` },
    { id: 'te-shimau', level: 'N4', name: '〜てしまいました', meaning: 'ended up doing (regret)',
      note: 'Something done that you regret, or did completely: て-form + しまいました. Casual: 〜ちゃった.',
      repeated: true,
      ja: p => `つい${p.pre}${p.c('te')}しまいました。`,
      en: p => `I ended up ${p.ing} ${p.o} without thinking.` },
    { id: 'te-oku', level: 'N4', name: '〜ておきます', meaning: 'do in advance',
      note: 'Doing something now to be ready later: て-form + おきます.',
      repeated: true,
      ja: p => `先[さき]に${p.pre}${p.c('te')}おきます。`,
      en: p => `I'll ${p.v} ${p.o} first, so it's done in advance.` },
    { id: 'te-miru', level: 'N4', name: '〜てみます', meaning: 'try doing',
      note: 'Doing something to see how it goes: て-form + みます.',
      repeated: true,
      ja: p => `一度[いちど]${p.pre}${p.c('te')}みます。`,
      en: p => `I'll try ${p.ing} ${p.o} once.` },
    { id: 'tsumori', level: 'N4', name: '〜つもりです', meaning: 'plan to, intend to',
      note: 'A plan you have already made: dictionary form + つもりです.',
      ja: p => `来年[らいねん]、${p.pre}${p.c('dict')}つもりです。`,
      en: p => `I plan to ${p.v} ${p.o} next year.` },
    { id: 'volitional-to-omou', level: 'N4', name: '〜(よ)うと思っています', meaning: 'thinking of doing',
      note: 'An intention you are considering: volitional form + と思っています.',
      needs: 'volitional',
      ja: p => `${p.pre}${p.c('volitional')}と思[おも]っています。`,
      en: p => `I'm thinking of ${p.ing} ${p.o}.` },
    { id: 'hou-ga-ii', level: 'N4', name: '〜た方がいいです', meaning: 'you\'d better',
      note: 'Advice: た-form + 方がいいです.',
      ja: p => `${p.pre}${p.c('ta')}方[ほう]がいいですよ。`,
      en: p => `You'd better ${p.v} ${p.o}.` },
    { id: 'kamoshirenai', level: 'N4', name: '〜かもしれません', meaning: 'might',
      note: 'Possibility: plain form + かもしれません.',
      ja: p => `明日[あした]、${p.pre}${p.c('dict')}かもしれません。`,
      en: p => `I might ${p.v} ${p.o} tomorrow.` },
    { id: 'te-hoshii', level: 'N4', name: '〜てほしいです', meaning: 'want someone to',
      note: 'Wanting someone else to act: person に + て-form + ほしいです.',
      skip: ['会う', '手伝う'],
      ja: p => `弟[おとうと]に${p.pre}${p.c('te')}ほしいです。`,
      en: p => `I want my little brother to ${p.v} ${p.o}.` },
    { id: 'nagara', level: 'N4', name: '〜ながら', meaning: 'while doing',
      note: 'Two actions at once by the same person: ます-stem + ながら, then the main action.',
      only: NAGARA,
      ja: p => `${p.pre}${p.stem}ながら、${NAGARA[p.key][0]}。`,
      en: p => `I ${NAGARA[p.key][1]} while ${p.ing} ${p.o}.` },
    { id: 'tara', level: 'N4', name: '〜たら', meaning: 'once, when (I\'ve done)',
      note: 'Once one thing has happened, the next follows: た-form + ら.',
      skip: ['寝る', '電話をかける', '連絡する', '待つ', '住む', '勤める', '飼う', '思う', '立つ', '持つ', '座る',
        '気をつける', '注意する', '頑張る', '生活する', '我慢する', '続ける', '笑う', '着く', ...NOT_ORDINARY],
      ja: p => `${p.pre}${p.c('ta')}ら、連絡[れんらく]します。`,
      en: p => `I'll get in touch once I've ${p.pp} ${p.o}.` },
    { id: 'ba-yokatta', level: 'N4', name: '〜ばよかったです', meaning: 'I wish I had',
      note: 'Regret about something you didn\'t do: ば-form + よかったです.',
      needs: 'ba',
      skip: ['立つ', '座る', '持つ', '笑う', '住む', ...NOT_ORDINARY],
      ja: p => `${p.pre}${p.c('ba')}よかったです。`,
      en: p => `I wish I had ${p.pp} ${p.o}.` },
    { id: 'you-ni-naru', level: 'N4', name: '〜ようになりました', meaning: 'can now, have come to',
      note: 'A change in ability: potential form + ようになりました.',
      needs: 'potential',
      only: SKILLS,
      ja: p => `やっと${p.potPre}${p.c('potential')}ようになりました。`,
      en: p => `I can finally ${p.v} ${p.o}.` },
    { id: 'te-ageru', level: 'N4', name: '〜てあげましょうか', meaning: 'shall I … for you?',
      note: 'Offering to do something for someone: て-form + あげましょうか. Use it with care — to a superior it can sound condescending.',
      only: FAVORS,
      ja: p => `${p.pre}${p.c('te')}あげましょうか。`,
      en: p => `Shall I ${p.v} ${p.o} for you?` },
    { id: 'te-kureru', level: 'N4', name: '〜てくれました', meaning: 'did … for me',
      note: 'Someone did something for you (or your group): person が + て-form + くれました.',
      only: FAVORS,
      ja: p => `友達[ともだち]が${p.pre}${p.c('te')}くれました。`,
      en: p => `My friend ${p.past} ${p.o} for me.` },
    { id: 'te-morau', level: 'N4', name: '〜てもらいました', meaning: 'had someone do … for me',
      note: 'You received a favour: person に + て-form + もらいました. Same event as 〜てくれる, seen from your side.',
      only: FAVORS,
      ja: p => `兄[あに]に${p.pre}${p.c('te')}もらいました。`,
      en: p => `I had my big brother ${p.v} ${p.o} for me.` },
    { id: 'passive', level: 'N4', name: 'Passive 〜(ら)れました', meaning: 'had … done to me',
      note: 'The "suffering" passive (迷惑の受身): person に + passive form, for something done that affected you badly. う-verbs 〜あれる, る-verbs 〜られる, する → される.',
      only: SUFFERING_PASSIVE,
      needs: 'passive',
      ja: p => `${SUFFERING_PASSIVE[p.key][0]}に${p.pre}${ruTo(p.c('passive'), 'ました')}。`,
      en: p => `${SUFFERING_PASSIVE[p.key][1]} ${p.past} my ${p.o.replace(/^(a|an|the|my) /, '')}.` },
    { id: 'sugiru', level: 'N4', name: '〜すぎました', meaning: 'did too much',
      note: 'Overdoing it: ます-stem + すぎる (conjugates like a る-verb).',
      only: SUGIRU,
      ja: p => `${p.pre}${p.stem}すぎました。`,
      en: p => SUGIRU[p.key] },
    { id: 'hajimeru', level: 'N4', name: '〜始めました', meaning: 'started doing',
      note: 'The start of an ongoing action: ます-stem + 始めました. Its partners: 〜続ける (keep on) and 〜終わる (finish).',
      only: ONGOING,
      ja: p => `先月[せんげつ]から${p.pre}${p.stem}始[はじ]めました。`,
      en: p => `I started ${p.ing} ${p.o} last month.` },

    // ── N3 ──
    { id: 'causative-passive', level: 'N3', name: '〜させられました', meaning: 'was made to',
      note: 'Being made to do something against your will: causative-passive form. Casual う-verb form: 〜される (書かされる).',
      needs: 'causative-passive',
      ja: p => `父[ちち]に${p.pre}${ruTo(p.c('causative-passive'), 'ました')}。`,
      en: p => `My father made me ${p.v} ${p.o}.` },
    { id: 'beki', level: 'N3', name: '〜べきです', meaning: 'should, ought to',
      note: 'What is right or proper: dictionary form + べきです (する → するべき or すべき).',
      repeated: true,
      ja: p => `${p.pre}${p.c('dict')}べきです。`,
      en: p => `You really ought to ${p.v} ${p.o}.` },
    { id: 'koto-ni-suru', level: 'N3', name: '〜ことにしました', meaning: 'decided to',
      note: 'A decision you made yourself: dictionary form + ことにしました.',
      ja: p => `${p.pre}${p.c('dict')}ことにしました。`,
      en: p => `I've decided to ${p.v} ${p.o}.` },
    { id: 'you-ni-suru', level: 'N3', name: '〜ようにしています', meaning: 'make a point of',
      note: 'A habit you keep up deliberately: dictionary form + ようにしています.',
      repeated: true,
      ja: p => `毎日[まいにち]${p.pre}${p.c('dict')}ようにしています。`,
      en: p => `I make a point of ${p.ing} ${p.o} every day.` },
    { id: 'wake-ni-wa-ikanai', level: 'N3', name: '〜わけにはいきません', meaning: 'can\'t possibly',
      note: 'Something you can\'t do for social or moral reasons: dictionary form + わけにはいきません.',
      ja: p => `今日[きょう]は${p.pre}${p.c('dict')}わけにはいきません。`,
      en: p => `I can't possibly ${p.v} ${p.o} today.` },
    { id: 'koto-wa-nai', level: 'N3', name: '〜ことはありません', meaning: 'there\'s no need to',
      note: 'Reassurance that something is unnecessary: dictionary form + ことはありません.',
      ja: p => `無理[むり]に${p.pre}${p.c('dict')}ことはありません。`,
      en: p => `There's no need to force yourself to ${p.v} ${p.o}.` },
    { id: 'te-bakari', level: 'N3', name: '〜てばかりいます', meaning: 'do nothing but',
      note: 'Doing one thing all the time, usually as a complaint: て-form + ばかりいます.',
      repeated: true,
      ja: p => `最近[さいきん]、${p.pre}${p.c('te')}ばかりいます。`,
      en: p => `Lately I do nothing but ${p.v} ${p.o}.` },
    { id: 'you-to-suru', level: 'N3', name: '〜(よ)うとしました', meaning: 'tried to (but couldn\'t)',
      note: 'An attempt, usually one that failed: volitional form + としました.',
      needs: 'volitional',
      skip: ['笑う', '思う', '考える', '住む', '生活する', ...NOT_ORDINARY],
      ja: p => `${p.pre}${p.c('volitional')}としましたが、できませんでした。`,
      en: p => `I tried to ${p.v} ${p.o}, but I couldn't.` },
    { id: 'zuni', level: 'N3', name: '〜ずに', meaning: 'without doing',
      note: 'Doing something without doing another: ない-form, drop ない, add ずに (しない → せずに). Like 〜ないで, but more written.',
      only: BEDTIME,
      ja: p => `昨日[きのう]は${p.pre}${p.zuni}寝[ね]ました。`,
      en: p => `Yesterday I went to bed without ${p.ing} ${p.o}.` },
  ];

  const PATTERN_BY_ID = Object.fromEntries(PATTERNS.map(p => [p.id, p]));

  // Tells apart verbs spelled alike (聞く "listen" vs 聞く_ask, 書く vs 描く_draw,
  // 買う_buy vs 飼う). Lists of verbs below use these keys.
  const verbKey = verb => (verb.disambig ? `${verb.kanji}_${verb.disambig}` : verb.kanji);

  // 食べない → 食べずに; しない → せずに (する and 〜する verbs).
  function zuniForm(verb, nai) {
    if (verb.type === 'irregular' && verb.reading.endsWith('する')) return nai.slice(0, -3) + 'せずに';
    return nai.slice(0, -2) + 'ずに';
  }

  // The verb's pieces that patterns build sentences from, or null when the
  // verb has no ordinary-action context.
  function pieces(verb) {
    const ctx = global.Examples.contextFor(verb);
    if (!ctx || (ctx.kind && ctx.kind !== 'act') || EXCLUDED_VERBS.includes(verb.kanji)) return null;
    const { inflect, gerund, pastTense } = global.Examples.english;
    const c = form => global.Examples.withKanji(verb, Conjugator.conjugate(verb, form));
    const head = ctx.v.split(' ')[0];
    return {
      ctx,
      key: verbKey(verb),
      pre: ctx.pre || '',
      potPre: ctx.potPre || ctx.pre || '',
      c,
      stem: c('masu').slice(0, -2),
      zuni: zuniForm(verb, c('nai')),
      v: ctx.v,
      o: ctx.o || '',
      ing: inflect(ctx.v, gerund),
      past: inflect(ctx.v, pastTense),
      // "have been to Japan", not "have gone to Japan"
      pp: ctx.v === 'go' && /^to /.test(ctx.o || '') ? 'been' : inflect(ctx.v, w => PARTICIPLE[w] || pastTense(w)),
      head,
    };
  }

  function appliesTo(pattern, verb, p) {
    if (!p) return false;
    if (pattern.only && !pattern.only[p.key]) return false;
    if ((pattern.skip || []).includes(verb.kanji)) return false;
    if (pattern.repeated && ONE_OFF.includes(verb.kanji)) return false;
    if (pattern.needs && (p.ctx.skip || []).includes(pattern.needs)) return false;
    return true;
  }

  // Patterns usable with this verb.
  function patternsFor(verb) {
    const p = pieces(verb);
    return PATTERNS.filter(pattern => appliesTo(pattern, verb, p));
  }

  // Verbs with at least one usable pattern, de-duplicated by spelling+meaning.
  function usableVerbs(verbs) {
    const seen = new Set();
    return verbs.filter(v => {
      const key = verbKey(v);
      if (seen.has(key) || !pieces(v)) return false;
      seen.add(key);
      return true;
    });
  }

  function toKana(ja) {
    return ja.replace(/[一-鿿々〆ヵヶ]+\[([^\]]+)\]/g, '$1');
  }

  // { ja, en, plain, kana } for a verb in a pattern, or null if it doesn't apply.
  function build(verb, patternId) {
    const pattern = PATTERN_BY_ID[patternId];
    const p = pieces(verb);
    if (!pattern || !appliesTo(pattern, verb, p)) return null;
    const ja = pattern.ja(p);
    // Split off the conjugated verb + pattern ending (everything after the
    // object phrase) so the answer can highlight it.
    const pre = pattern.needs === 'potential' ? p.potPre : p.pre;
    const at = pre ? ja.indexOf(pre) : -1;
    const cut = at === -1 ? 0 : at + pre.length;
    const body = ja.replace(/。$/, '');
    return {
      ja,
      before: body.slice(0, cut),
      focus: body.slice(cut),
      en: global.Examples.english.sentence(pattern.en(p)),
      plain: global.Examples.stripFurigana(ja),
      kana: toKana(ja),
      words: glossary(verb, p),
    };
  }

  // The sentence's own word pairs, for the hover hints on the English
  // (en-hover.js): the drilled verb, and its object without the particle
  // (おもちゃを → おもちゃ "toy", 学校[がっこう]に → 学校 "school").
  function glossary(verb, p) {
    const words = [{ ja: verb.kanji, kana: verb.reading, en: p.v, meaning: verb.meaning }];
    const obj = p.pre.replace(/(を|に|へ|で|と|が|から|まで)$/, '');
    const en = p.o.replace(/^(to|at|in|on|for|with|from|by|the|a|an|my|your|some)\s+/g, '').replace(/^(the|a|an|my|your|some)\s+/, '');
    if (obj && en) words.push({ ja: global.Examples.stripFurigana(obj), kana: toKana(obj), en });
    return words;
  }

  // Loose comparison for typed answers: ignores punctuation, spaces and
  // kanji-vs-kana choice (an answer matches either the kanji or all-kana form).
  function normalize(text) {
    return String(text)
      .replace(/[\s　。、．，,.!?！？「」]/g, '')
      .replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
  }

  // Words with a second, equally correct reading: 家 is いえ or うち.
  const ALT_READINGS = { '家[いえ]': 'うち' };

  // The sentence with each such word swapped for its other reading, as
  // [plain, kana] pairs — empty when the sentence has none.
  function altAnswers(ja) {
    let alt = ja;
    Object.keys(ALT_READINGS).forEach(w => { alt = alt.split(w).join(ALT_READINGS[w]); });
    return alt === ja ? [] : [global.Examples.stripFurigana(alt), toKana(alt)];
  }

  function matches(typed, built) {
    const t = normalize(typed);
    if (!t) return false;
    return [built.plain, built.kana, ...altAnswers(built.ja)].some(a => t === normalize(a));
  }

  global.Bunkei = { LEVELS, PATTERNS, PATTERN_BY_ID, patternsFor, usableVerbs, build, matches };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = global.Bunkei;
  }
})(typeof window !== 'undefined' ? window : globalThis);
