// The phrases of the "Japanese for tourists" blog post
// (blog-japanese-for-tourists.html), in the order the post shows them.
//
// Each phrase:  { id, ro, en, jp, note?, who? }
//   ro    romaji (Hepburn, long vowels as ō / ū), shown first
//   en    what it means in practice
//   jp    the Japanese, with furigana as 漢字[かんじ]; this is what gets recorded
//   note  optional HTML under the phrase
//   short optional shorter meaning, for when it's shown as an answer
//   who   'staff' for what shop and restaurant staff say to you (another
//         voice); otherwise it's something you say
// An exchange is { ask: <staff phrase>, answers: [phrase ids], answerNote? }:
// a question you'll be asked, and what to answer.
//
// After changing a phrase, re-record (scripts/generate_tourist_audio.py) and
// re-run node scripts/render_tourist_post.mjs; test_tourist_phrases.js fails
// while either is stale.
(function (g) {
  const VOICES = {
    you: { id: 11, name: '玄野武宏', speed: 0.95 },
    staff: { id: 14, name: '冥鳴ひまり', speed: 1.0 },
  };

  const SECTIONS = [
    {
      id: 'basics',
      title: 'The five words that do most of the work',
      intro: 'If you learn nothing else, learn these. With them, some pointing and a smile, you can get through most of a trip.',
      items: [
        { id: 'sumimasen', ro: 'Sumimasen', en: 'Excuse me / sorry / thanks for the trouble', jp: 'すみません', note: 'The most useful word in Japan. Use it to call a waiter, to get past someone on the train, to stop a stranger and ask the way, and when someone holds a door for you.' },
        { id: 'arigato', ro: 'Arigatō gozaimasu', en: 'Thank you', jp: 'ありがとうございます', note: 'Plain <em>arigatō</em> is for friends. With staff and strangers, add <em>gozaimasu</em>.' },
        { id: 'onegai', ro: 'Onegai shimasu', en: 'Please / yes, please', short: 'Yes, please', jp: 'お願[ねが]いします', note: 'Put it after anything you want (<em>Mizu, onegai shimasu</em>: water, please), or say it on its own to accept what you’re offered.' },
        { id: 'daijobu', ro: 'Daijōbu desu', en: 'No, thank you (literally “I’m fine”)', short: 'No, thanks', jp: '大丈夫[だいじょうぶ]です', note: 'The polite way to turn down a bag, a receipt or a point card. Add a small wave of the hand.' },
        { id: 'kore', ro: 'Kore o kudasai', en: 'This one, please', jp: 'これをください', note: 'Point at the menu picture, the snack in the display case or a photo on your phone. You’ve just ordered.' },
      ],
    },
    {
      id: 'numbers',
      title: 'Counting to three',
      intro: 'For ordering and for saying how many you are, these six cover almost every case. Show the number with your fingers too.',
      items: [
        { id: 'hitotsu', ro: 'Hitotsu', en: 'One (of something)', jp: '一[ひと]つ', note: '<em>Kore o hitotsu kudasai</em>: one of these, please.' },
        { id: 'futatsu', ro: 'Futatsu', en: 'Two', jp: '二[ふた]つ' },
        { id: 'mittsu', ro: 'Mittsu', en: 'Three', jp: '三[みっ]つ' },
        { id: 'hitori', ro: 'Hitori desu', en: 'Just one person', jp: '一人[ひとり]です', note: 'People are counted differently from things.' },
        { id: 'futari', ro: 'Futari desu', en: 'Two people', jp: '二人[ふたり]です' },
        { id: 'sannin', ro: 'San-nin desu', en: 'Three people', jp: '三人[さんにん]です' },
      ],
    },
    {
      id: 'shops',
      title: 'At the convenience store and in shops',
      intro: 'The konbini is where you’ll hear the most Japanese, and it’s always the same few questions. You don’t need to catch every word: listen for the key word, then answer <em>Onegai shimasu</em> (yes, please) or <em>Daijōbu desu</em> (no, thanks).',
      items: [
        { id: 'irasshaimase', who: 'staff', ro: 'Irasshaimase!', en: 'Welcome!', jp: 'いらっしゃいませ！', note: 'Called out when you walk in. Customers don’t answer it; a nod is plenty.' },
        { ask: { id: 'fukuro', who: 'staff', ro: 'Fukuro wa go-riyō desu ka?', en: 'Do you need a bag?', jp: '袋[ふくろ]はご利用[りよう]ですか？', note: 'Bags cost a few yen, so you’ll always be asked. Listen for <em>fukuro</em>.' }, answers: ['onegai', 'daijobu'] },
        { ask: { id: 'atatame', who: 'staff', ro: 'Atatamemasu ka?', en: 'Shall I heat it up?', jp: '温[あたた]めますか？', note: 'For bento, onigiri and the like.' }, answers: ['onegai', 'daijobu'] },
        { ask: { id: 'ohashi', who: 'staff', ro: 'Ohashi wa otsuke shimasu ka?', en: 'Would you like chopsticks?', jp: 'お箸[はし]はおつけしますか？' }, answers: ['onegai', 'daijobu'] },
        { ask: { id: 'pointo', who: 'staff', ro: 'Pointo kādo wa omochi desu ka?', en: 'Do you have a point card?', jp: 'ポイントカードはお持[も]ちですか？' }, answers: ['nai'] },
        { id: 'nai', ro: 'Nai desu', en: 'I don’t (have one)', jp: 'ないです' },
        { id: 'arimasu', ro: 'Kore wa arimasu ka?', en: 'Do you have this?', jp: 'これはありますか？', note: 'Say it while you show a photo on your phone.' },
        { id: 'ikura', ro: 'Ikura desu ka?', en: 'How much is it?', jp: 'いくらですか？' },
        { id: 'kado', ro: 'Kādo de haraemasu ka?', en: 'Can I pay by card?', jp: 'カードで払[はら]えますか？', note: 'Cards and IC cards (Suica, PASMO, ICOCA) work in most places, but small restaurants and shrines are often cash only.' },
        { id: 'shichaku', ro: 'Shichaku shite mo ii desu ka?', en: 'May I try this on?', jp: '試着[しちゃく]してもいいですか？' },
        { id: 'menzei', ro: 'Menzei dekimasu ka?', en: 'Can I buy this tax-free?', jp: '免税[めんぜい]できますか？', note: 'Look for the Tax-Free sign, and have your passport with you.' },
        { id: 'shosho', who: 'staff', ro: 'Shōshō omachi kudasai', en: 'One moment, please', jp: '少々[しょうしょう]お待[ま]ちください' },
        { id: 'arigatogozaimashita', who: 'staff', ro: 'Arigatō gozaimashita', en: 'Thank you (for coming)', jp: 'ありがとうございました', note: 'As you leave. A nod, or your own <em>arigatō gozaimasu</em>, is a nice touch.' },
      ],
    },
    {
      id: 'restaurant',
      title: 'In restaurants',
      intro: 'To call the staff, just say <em>Sumimasen!</em> out loud, even across the room; waiting to catch someone’s eye can take all evening. Many places also have a call button on the table.',
      items: [
        { ask: { id: 'nanmei', who: 'staff', ro: 'Nanmei-sama desu ka?', en: 'How many people?', jp: '何名様[なんめいさま]ですか？', note: 'Asked the moment you walk in.' }, answers: ['hitori', 'futari', 'sannin'], answerNote: 'Hold up your fingers as you say it.' },
        { id: 'kochira', who: 'staff', ro: 'Kochira e dōzo', en: 'This way, please', jp: 'こちらへどうぞ' },
        { id: 'eigomenyu', ro: 'Eigo no menyū wa arimasu ka?', en: 'Do you have an English menu?', jp: '英語[えいご]のメニューはありますか？' },
        { id: 'osusume', ro: 'Osusume wa nan desu ka?', en: 'What do you recommend?', jp: 'おすすめは何[なん]ですか？', note: 'Great at small places with no pictures on the menu.' },
        { ask: { id: 'chumon', who: 'staff', ro: 'Go-chūmon wa okimari desu ka?', en: 'Are you ready to order?', jp: 'ご注文[ちゅうもん]はお決[き]まりですか？' }, answers: ['kore', 'motto'] },
        { id: 'motto', ro: 'Mō sukoshi matte kudasai', en: 'Could you give us a little longer?', short: 'Not yet', jp: 'もう少[すこ]し待[ま]ってください' },
        { id: 'nama', ro: 'Nama bīru, futatsu', en: 'Two draught beers', jp: '生[なま]ビール、二[ふた]つ', note: 'Often shortened to just <em>nama</em>.' },
        { id: 'mizu', ro: 'Omizu kudasai', en: 'Water, please', jp: 'お水[みず]ください', note: 'Water and tea are usually free.' },
        { id: 'niku', ro: 'Niku ga taberaremasen', en: 'I can’t eat meat', jp: '肉[にく]が食[た]べられません', note: 'Swap <em>niku</em> for <em>sakana</em> (fish), <em>tamago</em> (egg) or <em>ebi</em> (shrimp). For a serious allergy, carry it written down in Japanese too: fish stock (dashi) is in almost everything.' },
        { id: 'kashikomari', who: 'staff', ro: 'Kashikomarimashita', en: 'Certainly', jp: 'かしこまりました', note: 'After you’ve ordered.' },
        { ask: { id: 'ijo', who: 'staff', ro: 'Ijō de yoroshii desu ka?', en: 'Will that be all?', jp: '以上[いじょう]でよろしいですか？' }, answers: ['hai'] },
        { id: 'hai', ro: 'Hai', en: 'Yes', jp: 'はい' },
        { id: 'itadakimasu', ro: 'Itadakimasu', en: 'Said before you eat', jp: 'いただきます' },
        { id: 'gochiso', ro: 'Gochisōsama deshita', en: 'Thank you for the meal', jp: 'ごちそうさまでした', note: 'Say it to the chef on your way out; it always gets a smile.' },
        { id: 'kaikei', ro: 'Okaikei onegai shimasu', en: 'The bill, please', jp: 'お会計[かいけい]お願[ねが]いします', note: 'Usually you take the bill to the register by the door instead of paying at the table. Don’t tip, anywhere: it isn’t expected.' },
        { id: 'betsubetsu', ro: 'Betsubetsu de onegai shimasu', en: 'Separate bills, please', jp: '別々[べつべつ]でお願[ねが]いします' },
      ],
    },
    {
      id: 'trains',
      title: 'Trains and finding your way',
      intro: 'The one pattern to know is <em>… wa doko desu ka?</em>, “where is …?”. Show the place on your phone at the same time, and the answer will come with a lot of pointing.',
      items: [
        { id: 'toire', ro: 'Toire wa doko desu ka?', en: 'Where is the toilet?', jp: 'トイレはどこですか？' },
        { id: 'eki', ro: 'Eki wa doko desu ka?', en: 'Where is the station?', jp: '駅[えき]はどこですか？' },
        { id: 'ikitai', ro: 'Shibuya ni ikitai desu', en: 'I want to go to Shibuya', jp: '渋谷[しぶや]に行[い]きたいです', note: 'Swap in any place name.' },
        { id: 'tomarimasu', ro: 'Kono densha wa Shibuya ni tomarimasu ka?', en: 'Does this train stop at Shibuya?', jp: 'この電車[でんしゃ]は渋谷[しぶや]に止[と]まりますか？', note: 'Express and rapid trains skip stations, so it’s worth asking on the platform.' },
        { id: 'aruite', ro: 'Aruite ikemasu ka?', en: 'Can I walk there?', jp: '歩[ある]いて行[い]けますか？' },
        { id: 'migi', who: 'staff', ro: 'Migi', en: 'Right', jp: '右[みぎ]' },
        { id: 'hidari', who: 'staff', ro: 'Hidari', en: 'Left', jp: '左[ひだり]' },
        { id: 'massugu', who: 'staff', ro: 'Massugu', en: 'Straight on', jp: 'まっすぐ' },
        { id: 'tsugi', who: 'staff', ro: 'Tsugi wa, Shibuya desu', en: 'The next stop is Shibuya', jp: '次[つぎ]は、渋谷[しぶや]です', note: 'The station names are usually shown and announced in English too.' },
        { id: 'doa', who: 'staff', ro: 'Doa ga shimarimasu', en: 'The doors are closing', jp: 'ドアが閉[し]まります' },
      ],
    },
    {
      id: 'hotel',
      title: 'At the hotel or ryokan',
      items: [
        { id: 'checkin', ro: 'Chekku-in onegai shimasu', en: 'Check-in, please', jp: 'チェックインお願[ねが]いします' },
        { id: 'yoyaku', ro: 'Yoyaku shite imasu', en: 'I have a reservation', jp: '予約[よやく]しています' },
        { ask: { id: 'namae', who: 'staff', ro: 'Onamae o onegai shimasu', en: 'Your name, please', jp: 'お名前[なまえ]をお願[ねが]いします' }, answers: [], answerNote: 'Just say your name, adding <em>desu</em>: “Smith desu.”' },
        { ask: { id: 'pasupoto', who: 'staff', ro: 'Pasupōto o onegai shimasu', en: 'Your passport, please', jp: 'パスポートをお願[ねが]いします', note: 'Hotels must check foreign guests’ passports.' }, answers: ['hai'] },
        { id: 'nimotsu', ro: 'Nimotsu o azukatte moraemasu ka?', en: 'Could you keep my luggage?', jp: '荷物[にもつ]を預[あず]かってもらえますか？', note: 'Before check-in or after check-out. Almost every hotel will.' },
        { id: 'wifi', ro: 'Waifai no pasuwādo wa nan desu ka?', en: 'What’s the Wi-Fi password?', jp: 'ワイファイのパスワードは何[なん]ですか？' },
        { id: 'asagohan', ro: 'Asagohan wa nanji kara desu ka?', en: 'What time is breakfast from?', jp: '朝[あさ]ごはんは何時[なんじ]からですか？' },
      ],
    },
    {
      id: 'understand',
      title: 'When you don’t understand',
      intro: 'These keep a conversation going instead of ending it, and people are usually very happy to help someone who tries.',
      items: [
        { id: 'moichido', ro: 'Mō ichido onegai shimasu', en: 'Once more, please', jp: 'もう一度[いちど]お願[ねが]いします' },
        { id: 'yukkuri', ro: 'Yukkuri onegai shimasu', en: 'Slowly, please', jp: 'ゆっくりお願[ねが]いします' },
        { id: 'sukoshi', ro: 'Nihongo wa sukoshi dake desu', en: 'I only speak a little Japanese', jp: '日本語[にほんご]は少[すこ]しだけです' },
        { id: 'eigo', ro: 'Eigo wa daijōbu desu ka?', en: 'Is English OK?', jp: '英語[えいご]は大丈夫[だいじょうぶ]ですか？', note: 'Softer than “do you speak English?”, which can put people on the spot.' },
        { id: 'kaite', ro: 'Kaite moraemasu ka?', en: 'Could you write it down?', jp: '書[か]いてもらえますか？', note: 'Handy for prices and times.' },
        { id: 'wakarimasen', ro: 'Wakarimasen', en: 'I don’t understand', jp: 'わかりません' },
        { id: 'wakarimashita', ro: 'Wakarimashita', en: 'Got it / I understand', jp: 'わかりました' },
      ],
    },
    {
      id: 'emergency',
      title: 'If something goes wrong',
      intro: 'Emergency numbers: <strong>119</strong> for an ambulance or fire, <strong>110</strong> for the police. The Japan National Tourism Organization runs a 24-hour <a href="https://www.japan.travel/en/plan/hotline/" rel="noopener">Japan Visitor Hotline</a> (<strong>050-3816-2787</strong>, or +81-50-3816-2787 from abroad) in English, Chinese and Korean.',
      items: [
        { id: 'tasukete', ro: 'Tasukete!', en: 'Help!', jp: '助[たす]けて！' },
        { id: 'kyukyusha', ro: 'Kyūkyūsha o yonde kudasai', en: 'Please call an ambulance', jp: '救急車[きゅうきゅうしゃ]を呼[よ]んでください' },
        { id: 'byoin', ro: 'Byōin wa doko desu ka?', en: 'Where is a hospital?', jp: '病院[びょういん]はどこですか？' },
        { id: 'itai', ro: 'Atama ga itai desu', en: 'I have a headache', jp: '頭[あたま]が痛[いた]いです', note: 'Swap <em>atama</em> (head) for <em>onaka</em> (stomach) or point at what hurts.' },
        { id: 'saifu', ro: 'Saifu o nakushimashita', en: 'I’ve lost my wallet', jp: '財布[さいふ]をなくしました', note: 'Lost things are handed in remarkably often in Japan.' },
        { id: 'koban', ro: 'Kōban wa doko desu ka?', en: 'Where is the police box?', jp: '交番[こうばん]はどこですか？', note: 'A <em>kōban</em> is a small neighbourhood police post, found near most stations.' },
      ],
    },
  ];

  // Every phrase, in order, exchanges' questions included.
  function phrases() {
    const out = [];
    for (const s of SECTIONS) for (const it of s.items) out.push(it.ask || it);
    return out;
  }

  const api = { VOICES, SECTIONS, phrases };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else g.TOURIST_PHRASES = api;
})(typeof window !== 'undefined' ? window : globalThis);
