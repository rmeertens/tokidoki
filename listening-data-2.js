(function (global) {
  'use strict';

  // More listening questions (see listening-data.js for the format): ones
  // built from small templates — meeting times, prices, how many to buy,
  // dates, floors and platforms — each filled in with several situations.
  // Numbers are written in kanji with their exact readings (十時十五分 is
  // 十時[じゅうじ]十五分[じゅうごふん]), so the furigana, the recording and the
  // reading check all agree.

  const add = global.LISTENING_ADD;

  // ─── Numbers and their readings ────────────────────────────────────────────

  const DIG = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const ONES = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう'];
  const TENS = ['', 'じゅう', 'にじゅう', 'さんじゅう', 'よんじゅう', 'ごじゅう', 'ろくじゅう', 'ななじゅう', 'はちじゅう', 'きゅうじゅう'];
  const HUNDREDS = ['', 'ひゃく', 'にひゃく', 'さんびゃく', 'よんひゃく', 'ごひゃく', 'ろっぴゃく', 'ななひゃく', 'はっぴゃく', 'きゅうひゃく'];
  const THOUSANDS = ['', 'せん', 'にせん', 'さんぜん', 'よんせん', 'ごせん', 'ろくせん', 'ななせん', 'はっせん', 'きゅうせん'];

  function kanjiNum(n) {
    const [th, h, t, o] = [Math.floor(n / 1000), Math.floor(n / 100) % 10, Math.floor(n / 10) % 10, n % 10];
    return (th ? (th > 1 ? DIG[th] : '') + '千' : '') + (h ? (h > 1 ? DIG[h] : '') + '百' : '')
      + (t ? (t > 1 ? DIG[t] : '') + '十' : '') + DIG[o];
  }
  function readNum(n) {
    return THOUSANDS[Math.floor(n / 1000)] + HUNDREDS[Math.floor(n / 100) % 10] + TENS[Math.floor(n / 10) % 10] + ONES[n % 10];
  }
  const yen = n => `${kanjiNum(n)}円[${readNum(n)}えん]`;
  const yenEn = n => `${n.toLocaleString('en-US')} yen`;

  const HOURS = ['', 'いち', 'に', 'さん', 'よ', 'ご', 'ろく', 'しち', 'はち', 'く', 'じゅう', 'じゅういち', 'じゅうに'];
  const MIN_ONES = ['ぷん', 'いっぷん', 'にふん', 'さんぷん', 'よんぷん', 'ごふん', 'ろっぷん', 'ななふん', 'はっぷん', 'きゅうふん'];
  function readMin(m) {
    const t = Math.floor(m / 10), o = m % 10;
    if (!o) return ['', 'じゅっ', 'にじゅっ', 'さんじゅっ', 'よんじゅっ', 'ごじゅっ'][t] + 'ぷん';
    return TENS[t] + MIN_ONES[o];
  }
  const mins = m => `${kanjiNum(m)}分[${readMin(m)}]`;
  // 十時[じゅうじ]十五分[じゅうごふん]; half past is 半 unless `noHan`.
  const time = (h, m, noHan) => `${kanjiNum(h)}時[${HOURS[h]}じ]` + (!m ? '' : m === 30 && !noHan ? '半[はん]' : mins(m));
  const timeEn = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
  const addMin = ([h, m], d) => { const t = h * 60 + m + d; return [Math.floor(t / 60), t % 60]; };

  const TSU = ['', '一[ひと]つ', '二[ふた]つ', '三[みっ]つ', '四[よっ]つ', '五[いつ]つ', '六[むっ]つ', '七[なな]つ', '八[やっ]つ', '九[ここの]つ', '十[とお]'];
  const PEOPLE = ['', '一人[ひとり]', '二人[ふたり]', '三人[さんにん]', '四人[よにん]', '五人[ごにん]', '六人[ろくにん]', '七人[ななにん]', '八人[はちにん]', '九人[きゅうにん]', '十人[じゅうにん]'];
  const mai = n => `${kanjiNum(n)}枚[${readNum(n)}まい]`;
  const FLOORS = ['', 'いっかい', 'にかい', 'さんがい', 'よんかい', 'ごかい', 'ろっかい', 'ななかい', 'はっかい'];
  const floorJa = n => `${kanjiNum(n)}階[${FLOORS[n]}]`;
  const DATES = { 17: 'じゅうしちにち', 1: 'ついたち', 2: 'ふつか', 3: 'みっか', 4: 'よっか', 5: 'いつか', 6: 'むいか', 7: 'なのか', 8: 'ようか', 9: 'ここのか', 10: 'とおか', 14: 'じゅうよっか', 20: 'はつか', 24: 'にじゅうよっか' };
  const dateJa = d => `${kanjiNum(d)}日[${DATES[d] || readNum(d) + 'にち'}]`;
  const ord = d => d + (d % 10 === 1 && d !== 11 ? 'st' : d % 10 === 2 && d !== 12 ? 'nd' : d % 10 === 3 && d !== 13 ? 'rd' : 'th');

  // Four choices with the right one at `at` and the others in order. Wrong
  // answers that repeat (or equal the right one) are replaced by `step`
  // above the largest, so the four pictures always differ.
  function place(right, others, at, step) {
    const out = [];
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    others.forEach(o => { if (out.length < 3 && !same(o, right) && !out.some(x => same(x, o))) out.push(o); });
    while (out.length < 3 && step) {
      const top = [right, ...out].reduce((a, b) => (step(a) > step(b) ? a : b));
      out.push(step(top));
    }
    out.splice(at, 0, right);
    return out;
  }
  const up = n => (typeof n === 'number' ? n + (n >= 300 ? 100 : 1) : n);
  const clocks = (right, others, at) => place(right, others, at).map(([h, m]) => ({ type: 'clock', h, m }));

  // ─── Times ─────────────────────────────────────────────────────────────────

  // Meeting time: one suggestion, a clash, a new time.
  const MEET = [
    { id: 'meet-cafe', level: 'N5', place: ['駅[えき]の 前[まえ]の 喫茶店[きっさてん]', 'the café in front of the station'], first: [2, 0], alt: [2, 30], why: 'the first time', reason: ['二時[にじ]は 授業[じゅぎょう]が あります', 'I have a class at two'], answer: 2, others: [[2, 0], [3, 0], [1, 30]] },
    { id: 'meet-library', level: 'N5', place: ['図書館[としょかん]', 'the library'], first: [10, 0], alt: [11, 0], reason: ['十時[じゅうじ]は ちょっと 早[はや]いです', 'ten is a little early'], answer: 0, others: [[10, 0], [10, 30], [11, 30]] },
    { id: 'meet-park', level: 'N5', place: ['公園[こうえん]の 入[い]り口[ぐち]', 'the park entrance'], first: [9, 30], alt: [9, 45], reason: ['九時半[くじはん]は 少[すこ]し 早[はや]いです', 'half past nine is a bit early'], answer: 3, others: [[9, 30], [9, 15], [10, 45]] },
    { id: 'meet-evening', level: 'N4', place: ['駅[えき]の 改札[かいさつ]', 'the station ticket gates'], first: [6, 0], alt: [6, 40], reason: ['六時[ろくじ]だと 仕事[しごと]が 終[お]わらないかもしれません', 'I might not have finished work by six'], answer: 1, others: [[6, 0], [6, 20], [7, 40]] },
    { id: 'meet-lunch', level: 'N4', place: ['レストランの 前[まえ]', 'the front of the restaurant'], first: [12, 0], alt: [12, 30], reason: ['十二時[じゅうにじ]までは 会議[かいぎ]が あります', 'I have a meeting until twelve'], answer: 2, others: [[12, 0], [11, 30], [1, 30]] },
    { id: 'meet-museum', level: 'N5', place: ['美術館[びじゅつかん]の 入[い]り口[ぐち]', 'the art museum entrance'], first: [1, 0], alt: [1, 45], reason: ['一時[いちじ]は 昼[ひる]ご飯[はん]を 食[た]べています', 'I’ll be having lunch at one'], answer: 1, others: [[1, 0], [1, 15], [2, 45]] },
    { id: 'meet-dept', level: 'N5', place: ['デパートの 前[まえ]', 'the front of the department store'], first: [5, 0], alt: [5, 30], reason: ['五時[ごじ]までは アルバイトが あります', 'I have my part-time job until five'], answer: 3, others: [[5, 0], [4, 30], [6, 30]] },
  ];
  add('kadai', MEET.map(t => ({
    id: t.id, level: t.level,
    intro: '男[おとこ]の人[ひと]と 女[おんな]の人[ひと]が 話[はな]しています。二人[ふたり]は 何時[なんじ]に 会[あ]いますか。',
    lines: [
      { who: 'M', ja: `明日[あした]、${t.place[0]}で 会[あ]いませんか。`, en: `Shall we meet at ${t.place[1]} tomorrow?` },
      { who: 'F', ja: 'いいですよ。何時[なんじ]が いいですか。', en: 'Sure. What time is good?' },
      { who: 'M', ja: `${time(...t.first)}は どうですか。`, en: `How about ${timeEn(...t.first)}?` },
      { who: 'F', ja: `すみません、${t.reason[0]}。${time(...t.alt)}でも いいですか。`, en: `Sorry, ${t.reason[1]}. Would ${timeEn(...t.alt)} be OK?` },
      { who: 'M', ja: `ええ、いいですよ。じゃ、${time(...t.alt)}に。`, en: `Yes, fine. ${timeEn(...t.alt)} then.` },
    ],
    choices: clocks(t.alt, t.others, t.answer),
    answer: t.answer,
    why: `${timeEn(...t.first)} doesn’t suit her (${t.reason[1]}), so they meet at ${timeEn(...t.alt)}.`,
  })));

  // Concert or film: meet some minutes before it starts.
  const BEFORE = [
    { id: 'concert-before', level: 'N4', what: ['コンサート', 'concert'], start: [7, 0], said: 10, agreed: 30, answer: 3 },
    { id: 'film-before', level: 'N4', what: ['映画[えいが]', 'film'], start: [1, 30], said: 5, agreed: 20, answer: 0 },
    { id: 'game-before', level: 'N4', what: ['サッカーの 試合[しあい]', 'football match'], start: [3, 0], said: 15, agreed: 40, answer: 2 },
    { id: 'talk-before', level: 'N4', what: ['講演会[こうえんかい]', 'talk'], start: [10, 30], said: 5, agreed: 15, answer: 1 },
  ];
  add('kadai', BEFORE.map(t => {
    const right = addMin(t.start, -t.agreed);
    const wrongSaid = addMin(t.start, -t.said);
    return {
      id: t.id, level: t.level,
      intro: '女[おんな]の人[ひと]と 男[おとこ]の人[ひと]が 話[はな]しています。二人[ふたり]は 何時[なんじ]に 会[あ]いますか。',
      lines: [
        { who: 'F', ja: `${t.what[0]}は ${time(...t.start)}からですね。`, en: `The ${t.what[1]} starts at ${timeEn(...t.start)}, right?` },
        { who: 'M', ja: `ええ。じゃ、${mins(t.said)}前[まえ]に 入[い]り口[ぐち]で 会[あ]いましょうか。`, en: `Yes. Shall we meet at the entrance ${t.said} minutes before?` },
        { who: 'F', ja: `${mins(t.said)}前[まえ]だと、人[ひと]が 多[おお]くて 大変[たいへん]ですよ。${mins(t.agreed)}前[まえ]に しませんか。`, en: `${t.said} minutes before, it’ll be really crowded. How about ${t.agreed} minutes before?` },
        { who: 'M', ja: 'そうですね。そう しましょう。', en: 'Good point. Let’s do that.' },
      ],
      choices: clocks(right, [wrongSaid, t.start, addMin(right, -30)], t.answer),
      answer: t.answer,
      why: `They meet ${t.agreed} minutes before the ${timeEn(...t.start)} start: ${timeEn(...right)}. (${t.said} minutes before was his first idea.)`,
    };
  }));

  // A class or meeting moved to a new time.
  const MOVED = [
    { id: 'class-moved', level: 'N5', who: ['先生[せんせい]が 学生[がくせい]に', 'teacher'], what: ['授業[じゅぎょう]', 'class'], usual: [9, 0], now: [10, 30], reason: ['朝[あさ]、会議[かいぎ]が あります', 'I have a meeting in the morning'], answer: 2, others: [[9, 0], [10, 0], [9, 30]] },
    { id: 'meeting-moved', level: 'N4', who: ['会社[かいしゃ]で 女[おんな]の人[ひと]が', 'colleague'], what: ['会議[かいぎ]', 'meeting'], usual: [2, 0], now: [3, 15], reason: ['部長[ぶちょう]が 二時[にじ]まで 出[で]かけています', 'the manager is out until two'], answer: 1, others: [[2, 0], [2, 15], [3, 45]] },
    { id: 'practice-moved', level: 'N5', who: ['先生[せんせい]が 学生[がくせい]に', 'teacher'], what: ['テニスの 練習[れんしゅう]', 'tennis practice'], usual: [4, 0], now: [4, 45], reason: ['コートの 掃除[そうじ]が あります', 'the courts are being cleaned'], answer: 0, others: [[4, 0], [4, 15], [5, 45]] },
    { id: 'party-moved', level: 'N4', who: ['会社[かいしゃ]で 女[おんな]の人[ひと]が', 'colleague'], what: ['歓迎会[かんげいかい]', 'welcome party'], usual: [6, 0], now: [7, 0], reason: ['部長[ぶちょう]の 会議[かいぎ]が 長[なが]く なりそうです', 'the manager’s meeting looks like running long'], answer: 3, others: [[6, 0], [6, 30], [7, 30]] },
    { id: 'swim-moved', level: 'N5', who: ['先生[せんせい]が 学生[がくせい]に', 'teacher'], what: ['水泳[すいえい]の 授業[じゅぎょう]', 'swimming class'], usual: [11, 0], now: [1, 30], reason: ['朝[あさ]は プールの 掃除[そうじ]が あります', 'the pool is being cleaned in the morning'], answer: 2, others: [[11, 0], [11, 30], [1, 0]] },
  ];
  add('point', MOVED.map(t => ({
    id: t.id, level: t.level,
    intro: `${t.who[0]} 話[はな]しています。明日[あした]の ${t.what[0]}は 何時[なんじ]に 始[はじ]まりますか。`,
    lines: [
      { who: t.who[1] === 'colleague' ? 'F' : 'M', ja: `明日[あした]の ${t.what[0]}は いつもは ${time(...t.usual)}からですが、${t.reason[0]}。`, en: `Tomorrow’s ${t.what[1]} usually starts at ${timeEn(...t.usual)}, but ${t.reason[1]}.` },
      { who: t.who[1] === 'colleague' ? 'F' : 'M', ja: `ですから、明日[あした]は ${time(...t.now)}から 始[はじ]めます。遅[おく]れないで ください。`, en: `So tomorrow we’ll start at ${timeEn(...t.now)}. Please don’t be late.` },
    ],
    choices: clocks(t.now, t.others, t.answer),
    answer: t.answer,
    why: `Usually ${timeEn(...t.usual)}, but tomorrow it starts at ${timeEn(...t.now)} (${t.reason[1]}).`,
  })));

  // Train running late.
  const LATE = [
    { id: 'train-late', level: 'N4', at: [8, 10], late: 15, cause: ['雪[ゆき]', 'snow'], answer: 1 },
    { id: 'bus-late', level: 'N4', at: [5, 40], late: 10, cause: ['事故[じこ]', 'an accident'], vehicle: ['バス', 'bus'], answer: 3 },
  ];
  add('point', LATE.map(t => {
    const v = t.vehicle || ['電車[でんしゃ]', 'train'];
    const right = addMin(t.at, t.late);
    return {
      id: t.id, level: t.level,
      intro: `駅[えき]で 女[おんな]の人[ひと]と 男[おとこ]の人[ひと]が 話[はな]しています。${v[0]}は 何時[なんじ]に 来[き]ますか。`,
      lines: [
        { who: 'F', ja: `すみません、次[つぎ]の ${v[0]}は 何時[なんじ]ですか。`, en: `Excuse me, what time is the next ${v[1]}?` },
        { who: 'M', ja: `${time(...t.at, true)}ですが、今日[きょう]は ${t.cause[0]}で ${mins(t.late)} 遅[おく]れて いるそうですよ。`, en: `It’s the ${timeEn(...t.at)}, but apparently it’s running ${t.late} minutes late today because of ${t.cause[1]}.` },
        { who: 'F', ja: 'そうですか。ありがとうございます。', en: 'I see. Thank you.' },
      ],
      choices: clocks(right, [t.at, addMin(t.at, -t.late), addMin(right, 10)], t.answer),
      answer: t.answer,
      why: `Timetabled for ${timeEn(...t.at)}, but ${t.late} minutes late: ${timeEn(...right)}.`,
    };
  }));

  // Getting up on weekdays and at the weekend.
  const WAKE = [
    { id: 'wake-sunday', level: 'N5', who: 'F', weekday: [6, 30], sunday: [9, 0], answer: 2, others: [[6, 30], [7, 0], [10, 0]] },
    { id: 'wake-saturday', level: 'N5', who: 'M', weekday: [7, 0], sunday: [10, 30], day: ['土曜日[どようび]', 'Saturday'], answer: 0, others: [[7, 0], [11, 30], [10, 0]] },
    { id: 'wake-holiday', level: 'N5', who: 'F', weekday: [7, 30], sunday: [8, 45], day: ['土曜日[どようび]', 'Saturday'], answer: 3, others: [[7, 30], [9, 45], [8, 15]] },
  ];
  add('point', WAKE.map(t => {
    const day = t.day || ['日曜日[にちようび]', 'Sunday'];
    const asker = t.who === 'F' ? 'M' : 'F';
    const person = t.who === 'F' ? ['女[おんな]の人[ひと]', 'she'] : ['男[おとこ]の人[ひと]', 'he'];
    return {
      id: t.id, level: t.level,
      intro: `男[おとこ]の人[ひと]と 女[おんな]の人[ひと]が 話[はな]しています。${person[0]}は ${day[0]}に 何時[なんじ]に 起[お]きますか。`,
      lines: [
        { who: asker, ja: '毎朝[まいあさ] 何時[なんじ]に 起[お]きますか。', en: 'What time do you get up every morning?' },
        { who: t.who, ja: `月曜日[げつようび]から 金曜日[きんようび]までは ${time(...t.weekday)}に 起[お]きます。`, en: `Monday to Friday I get up at ${timeEn(...t.weekday)}.` },
        { who: asker, ja: `早[はや]いですね。${day[0]}もですか。`, en: `That’s early. ${day[1]} too?` },
        { who: t.who, ja: `いいえ、${day[0]}は ゆっくり 寝[ね]て、${time(...t.sunday)}に 起[お]きます。`, en: `No, on ${day[1]} I sleep in and get up at ${timeEn(...t.sunday)}.` },
      ],
      choices: clocks(t.sunday, t.others, t.answer),
      answer: t.answer,
      why: `${timeEn(...t.weekday)} is for weekdays; on ${day[1]} ${person[1]} gets up at ${timeEn(...t.sunday)}.`,
    };
  }));

  // ─── Prices ────────────────────────────────────────────────────────────────

  const yenChoices = (right, others, at) => place(right, others, at, up).map(y => ({ type: 'price', yen: y }));

  const SHOP = [
    { id: 'price-bread', level: 'N5', a: ['パン', 'bread rolls', 'つ'], ap: 120, an: 2, b: ['牛乳[ぎゅうにゅう]', 'milk', '本'], bp: 180, bn: 1, answer: 1 },
    { id: 'price-pens', level: 'N5', a: ['ボールペン', 'ballpoint pens', '本'], ap: 150, an: 3, b: ['ノート', 'notebook', '冊'], bp: 200, bn: 1, answer: 3 },
    { id: 'price-fruit', level: 'N5', a: ['りんご', 'apples', 'つ'], ap: 100, an: 4, b: ['バナナ', 'bananas', '本'], bp: 150, bn: 2, answer: 0 },
    { id: 'price-onigiri', level: 'N5', a: ['おにぎり', 'rice balls', 'つ'], ap: 130, an: 3, b: ['お茶[ちゃ]', 'tea', '本'], bp: 150, bn: 1, answer: 2 },
    { id: 'price-coffee', level: 'N5', a: ['コーヒー', 'coffees', 'つ'], ap: 300, an: 2, b: ['ケーキ', 'cake', 'つ'], bp: 450, bn: 1, answer: 0 },
  ];
  const COUNT = {
    つ: n => TSU[n],
    本: n => `${kanjiNum(n)}本[${['', 'いっぽん', 'にほん', 'さんぼん', 'よんほん', 'ごほん'][n]}]`,
    冊: n => `${kanjiNum(n)}冊[${['', 'いっさつ', 'にさつ', 'さんさつ', 'よんさつ'][n]}]`,
  };
  add('point', SHOP.map(t => {
    const right = t.ap * t.an + t.bp * t.bn;
    const others = [t.ap * t.an, t.ap + t.bp * t.bn, right + t.ap].filter(x => x !== right);
    return {
      id: t.id, level: t.level,
      intro: '店[みせ]で 男[おとこ]の人[ひと]と 店[みせ]の人[ひと]が 話[はな]しています。男[おとこ]の人[ひと]は 全部[ぜんぶ]で いくら 払[はら]いますか。',
      lines: [
        { who: 'M', ja: `すみません、この ${t.a[0]}は いくらですか。`, en: `Excuse me, how much are these ${t.a[1]}?` },
        { who: 'F', ja: `一[ひと]つ ${yen(t.ap)}です。`, en: `${yenEn(t.ap)} each.` },
        { who: 'M', ja: `じゃ、${t.a[0]}を ${COUNT[t.a[2]](t.an)}と、${t.b[0]}を ${COUNT[t.b[2]](t.bn)} ください。`, en: `Then ${t.an} ${t.a[1]} and ${t.bn} ${t.b[1]}, please.` },
        { who: 'F', ja: `${t.b[0]}は ${t.bn > 1 ? '一[ひと]つ ' : ''}${yen(t.bp)}ですから、全部[ぜんぶ]で ${yen(right)}です。`, en: `The ${t.b[1]} ${t.bn > 1 ? 'are' : 'is'} ${yenEn(t.bp)}${t.bn > 1 ? ' each' : ''}, so that’s ${yenEn(right)} altogether.` },
      ],
      choices: yenChoices(right, others, t.answer),
      answer: t.answer,
      why: `${t.an} × ${t.ap} + ${t.bn} × ${t.bp} = ${yenEn(right)}.`,
    };
  }));

  // Tickets: adults and children.
  const TICKETS = [
    { id: 'price-zoo', level: 'N5', where: ['動物園[どうぶつえん]', 'zoo'], adult: 600, child: 300, adults: 2, kids: 1, answer: 2 },
    { id: 'price-museum', level: 'N4', where: ['美術館[びじゅつかん]', 'art museum'], adult: 800, child: 400, adults: 1, kids: 2, answer: 1 },
    { id: 'price-cinema', level: 'N5', where: ['映画館[えいがかん]', 'cinema'], adult: 1800, child: 1000, adults: 2, kids: 2, answer: 3 },
  ];
  add('point', TICKETS.map(t => {
    const right = t.adult * t.adults + t.child * t.kids;
    return {
      id: t.id, level: t.level,
      intro: `${t.where[0]}で 女[おんな]の人[ひと]と 受付[うけつけ]の 人[ひと]が 話[はな]しています。女[おんな]の人[ひと]は いくら 払[はら]いますか。`,
      lines: [
        { who: 'F', ja: `大人[おとな]${PEOPLE[t.adults]}と 子[こ]ども${PEOPLE[t.kids]} お願[ねが]いします。`, en: `${t.adults} adult${t.adults > 1 ? 's' : ''} and ${t.kids} child${t.kids > 1 ? 'ren' : ''}, please.` },
        { who: 'M', ja: `はい。大人[おとな]は ${yen(t.adult)}、子[こ]どもは ${yen(t.child)}です。`, en: `Certainly. Adults are ${yenEn(t.adult)} and children ${yenEn(t.child)}.` },
        { who: 'M', ja: `全部[ぜんぶ]で ${yen(right)}に なります。`, en: `That comes to ${yenEn(right)}.` },
      ],
      choices: yenChoices(right, [t.adult * (t.adults + t.kids), t.adult + t.child, right + t.child], t.answer),
      answer: t.answer,
      why: `${t.adults} × ${t.adult} + ${t.kids} × ${t.child} = ${yenEn(right)}.`,
    };
  }));

  // A discount when buying two.
  const SALE = [
    { id: 'price-tshirt', level: 'N4', item: ['Tシャツ', 'T-shirt', 'ティーシャツ'], price: 1500, off: 500, answer: 0 },
    { id: 'price-cups', level: 'N4', item: ['コップ', 'glass', 'コップ'], price: 800, off: 300, answer: 2 },
    { id: 'price-umbrella', level: 'N4', item: ['傘[かさ]', 'umbrella', 'かさ'], price: 1200, off: 400, answer: 1 },
  ];
  add('point', SALE.map(t => {
    const right = t.price * 2 - t.off;
    return {
      id: t.id, level: t.level,
      intro: '店[みせ]で 女[おんな]の人[ひと]と 店[みせ]の人[ひと]が 話[はな]しています。女[おんな]の人[ひと]は いくら 払[はら]いますか。',
      lines: [
        { who: 'F', ja: `この ${t.item[0]}は いくらですか。`, en: `How much is this ${t.item[1]}?`, say: `この${t.item[2]}はいくらですか。` },
        { who: 'M', ja: `${yen(t.price)}です。今日[きょう]は 二[ふた]つ 買[か]うと、${yen(t.off)} 安[やす]く なりますよ。`, en: `${yenEn(t.price)}. Today, if you buy two, it’s ${yenEn(t.off)} cheaper.` },
        { who: 'F', ja: 'じゃあ、二[ふた]つ ください。', en: 'Then I’ll take two.' },
      ],
      choices: yenChoices(right, [t.price * 2, t.price, t.price - t.off], t.answer),
      answer: t.answer,
      why: `Two at ${yenEn(t.price)} is ${yenEn(t.price * 2)}, minus ${yenEn(t.off)}: ${yenEn(right)}.`,
    };
  }));

  // ─── How many ──────────────────────────────────────────────────────────────

  const BUY = [
    { id: 'count-oranges', level: 'N5', icon: 'mandarin', item: ['みかん', 'mandarins'], family: 4, extra: 2, answer: 3 },
    { id: 'count-cakes', level: 'N5', icon: 'cake', item: ['ケーキ', 'cakes'], family: 3, extra: 1, answer: 1 },
    { id: 'count-apples', level: 'N5', icon: 'apple', item: ['りんご', 'apples'], family: 5, extra: 1, answer: 2 },
    { id: 'count-onigiri', level: 'N5', icon: 'onigiri', item: ['おにぎり', 'rice balls'], family: 3, extra: 2, answer: 0 },
  ];
  add('kadai', BUY.map(t => {
    const right = t.family + t.extra;
    const ns = place(right, [t.family, right + 1, t.family - 1], t.answer, up);
    return {
      id: t.id, level: t.level,
      intro: `女[おんな]の人[ひと]と 男[おとこ]の人[ひと]が 話[はな]しています。男[おとこ]の人[ひと]は ${t.item[0]}を いくつ 買[か]いますか。`,
      lines: [
        { who: 'F', ja: `${t.item[0]}を 買[か]って きて くれませんか。`, en: `Could you go and buy some ${t.item[1]}?` },
        { who: 'M', ja: `いいですよ。うちは ${PEOPLE[t.family]}だから、${TSU[t.family]}ですね。`, en: `Sure. There are ${t.family} of us, so ${t.family}, right?` },
        { who: 'F', ja: `あ、今日[きょう]は お客[きゃく]さんが ${PEOPLE[t.extra]} 来[き]ますから、${TSU[right]} お願[ねが]いします。`, en: `Oh, ${t.extra === 1 ? 'a guest is' : t.extra + ' guests are'} coming today, so ${right}, please.` },
        { who: 'M', ja: `わかりました。${TSU[right]}ですね。`, en: `Got it. ${right}.` },
      ],
      choices: ns.map(n => ({ type: 'items', items: [[t.icon, n]] })),
      answer: t.answer,
      why: `${t.family} in the family plus ${t.extra} guest${t.extra > 1 ? 's' : ''}: ${right}.`,
    };
  }));

  const STAMPS = [
    { id: 'count-stamps', level: 'N5', first: 5, final: 6, answer: 1 },
    { id: 'count-postcards', level: 'N5', first: 4, final: 3, icon: 'postcard', item: ['はがき', 'postcards'], answer: 2 },
  ];
  add('kadai', STAMPS.map(t => {
    const item = t.item || ['切手[きって]', 'stamps'];
    const ns = place(t.final, [t.first, t.final + 2, t.first + 3], t.answer, up);
    return {
      id: t.id, level: t.level,
      intro: `郵便局[ゆうびんきょく]で 男[おとこ]の人[ひと]と 女[おんな]の人[ひと]が 話[はな]しています。男[おとこ]の人[ひと]は ${item[0]}を 何枚[なんまい] 買[か]いますか。`,
      lines: [
        { who: 'M', ja: `すみません、${item[0]}を ${mai(t.first)} ください。`, en: `Excuse me, ${t.first} ${item[1]}, please.` },
        { who: 'F', ja: `はい、${mai(t.first)}ですね。`, en: `Certainly, ${t.first}.` },
        { who: 'M', ja: t.final > t.first ? `あ、すみません、やっぱり もう 一枚[いちまい] ください。` : `あ、すみません、やっぱり 一枚[いちまい] 少[すく]なく して ください。`, en: t.final > t.first ? 'Oh, sorry — actually, one more, please.' : 'Oh, sorry — actually, one fewer, please.' },
        { who: 'F', ja: `では、${mai(t.final)}ですね。`, en: `So that’s ${t.final}.` },
      ],
      choices: ns.map(n => ({ type: 'items', items: [[t.icon || 'stamp', n]] })),
      answer: t.answer,
      why: `He first asks for ${t.first}, then changes it: ${t.final}.`,
    };
  }));

  // Glasses for a party: people coming, minus those who can't.
  const CUPS = [
    { id: 'count-drinks', level: 'N4', icon: 'drink', invited: 8, cant: 2, answer: 0 },
    { id: 'count-plates', level: 'N4', icon: 'plate', invited: 6, cant: 1, answer: 3 },
  ];
  add('kadai', CUPS.map(t => {
    const right = t.invited - t.cant;
    const ns = place(right, [t.invited, right - 1, t.invited + 1], t.answer, up);
    const thing = t.icon === 'plate' ? ['お皿[さら]', 'plates', '枚'] : ['飲[の]み物[もの]', 'drinks', '本'];
    const n = k => thing[2] === '枚' ? mai(k) : `${kanjiNum(k)}本[${['', 'いっぽん', 'にほん', 'さんぼん', 'よんほん', 'ごほん', 'ろっぽん', 'ななほん', 'はっぽん', 'きゅうほん'][k]}]`;
    return {
      id: t.id, level: t.level,
      intro: `パーティーの 前[まえ]に 女[おんな]の人[ひと]と 男[おとこ]の人[ひと]が 話[はな]しています。${thing[0]}は いくつ 用意[ようい]しますか。`,
      lines: [
        { who: 'F', ja: `今日[きょう]の パーティーは ${PEOPLE[t.invited]} 来[く]る 予定[よてい]でしたよね。`, en: `${t.invited} people were supposed to come to today’s party, weren’t they?` },
        { who: 'M', ja: `ええ。でも、さっき ${PEOPLE[t.cant]} 来[こ]られなく なったと 連絡[れんらく]が ありました。`, en: `Yes. But I just heard that ${t.cant} can’t come any more.` },
        { who: 'F', ja: `じゃあ、${thing[0]}は ${n(right)} 用意[ようい]して ください。`, en: `Then please get ${right} ${thing[1]} ready.` },
      ],
      choices: ns.map(k => ({ type: 'items', items: [[t.icon, k]] })),
      answer: t.answer,
      why: `${t.invited} were coming, ${t.cant} can’t: ${right}.`,
    };
  }));

  // ─── Dates (calendar month starting on a Saturday) ─────────────────────────

  const dates = (right, others, at) => place(right, others, at).map(d => ({ type: 'calendar', mark: d }));
  const MOVED_DATE = [
    { id: 'date-party', level: 'N5', what: ['パーティー', 'party'], was: 10, now: 17, why: ['先生[せんせい]が 来[こ]られません', 'the teacher can’t come'], answer: 2, others: [10, 16, 18] },
    { id: 'date-trip', level: 'N4', what: ['旅行[りょこう]', 'trip'], was: 8, now: 15, why: ['ホテルが いっぱいでした', 'the hotel was full'], answer: 0, others: [8, 14, 22] },
    { id: 'date-test', level: 'N5', what: ['テスト', 'test'], was: 20, now: 13, why: ['二十日[はつか]は 休[やす]みの 日[ひ]です', 'the 20th is a holiday'], answer: 1, others: [20, 12, 6] },
  ];
  add('point', MOVED_DATE.map(t => ({
    id: t.id, level: t.level,
    intro: `男[おとこ]の人[ひと]と 女[おんな]の人[ひと]が 話[はな]しています。${t.what[0]}は 何日[なんにち]に なりましたか。`,
    lines: [
      { who: 'M', ja: `${t.what[0]}は ${dateJa(t.was)}でしたね。`, en: `The ${t.what[1]} was on the ${ord(t.was)}, wasn’t it?` },
      { who: 'F', ja: `それが、${t.why[0]}から、${dateJa(t.now)}に なりました。`, en: `About that — ${t.why[1]}, so it’s now on the ${ord(t.now)}.` },
      { who: 'M', ja: `そうですか。${dateJa(t.now)}ですね。わかりました。`, en: `I see. The ${ord(t.now)}. Got it.` },
    ],
    choices: dates(t.now, t.others, t.answer),
    answer: t.answer,
    why: `It was the ${ord(t.was)}, but ${t.why[1]}, so it moved to the ${ord(t.now)}.`,
  })));

  const NEXT_SAT = [
    { id: 'date-saturday', level: 'N4', busy: 8, go: 15, plan: ['美術館[びじゅつかん]', 'art museum'], answer: 3 },
    { id: 'date-sunday', level: 'N4', busy: 9, go: 16, plan: ['海[うみ]', 'sea'], sunday: true, answer: 1 },
  ];
  add('kadai', NEXT_SAT.map(t => {
    const day = t.sunday ? ['日曜日[にちようび]', 'Sunday'] : ['土曜日[どようび]', 'Saturday'];
    return {
      id: t.id, level: t.level,
      intro: `男[おとこ]の人[ひと]と 女[おんな]の人[ひと]が 話[はな]しています。二人[ふたり]は 何日[なんにち]に ${t.plan[0]}へ 行[い]きますか。`,
      lines: [
        { who: 'M', ja: `今度[こんど]の ${day[0]}、${t.plan[0]}へ 行[い]きませんか。`, en: `Shall we go to the ${t.plan[1]} this ${day[1]}?` },
        { who: 'F', ja: `${dateJa(t.busy)}ですか。その 日[ひ]は アルバイトが あるんです。`, en: `The ${ord(t.busy)}? I have my part-time job that day.` },
        { who: 'M', ja: `じゃあ、次[つぎ]の ${day[0]}は どうですか。`, en: `Then how about the ${day[1]} after?` },
        { who: 'F', ja: `${dateJa(t.go)}ですね。大丈夫[だいじょうぶ]です。`, en: `The ${ord(t.go)}. That’s fine.` },
      ],
      choices: dates(t.go, [t.busy, t.go - 1, t.go + 7], t.answer),
      answer: t.answer,
      why: `She works on the ${ord(t.busy)}, so they go the next ${day[1]}, the ${ord(t.go)}.`,
    };
  }));

  // ─── Floors, platforms, bus numbers ────────────────────────────────────────

  const FLOOR_Q = [
    { id: 'floor-restaurant', level: 'N5', want: ['レストラン', 'restaurant'], first: 7, real: 8, answer: 3, others: [7, 6, 5] },
    { id: 'floor-books', level: 'N5', want: ['本[ほん]売[う]り場[ば]', 'book department'], first: 4, real: 2, answer: 0, others: [4, 3, 5] },
    { id: 'floor-toys', level: 'N5', want: ['おもちゃ売[う]り場[ば]', 'toy department'], first: 5, real: 6, answer: 2, others: [5, 4, 7] },
  ];
  add('kadai', FLOOR_Q.map(t => ({
    id: t.id, level: t.level,
    intro: `デパートで 男[おとこ]の人[ひと]と 店[みせ]の人[ひと]が 話[はな]しています。男[おとこ]の人[ひと]は 何階[なんかい]へ 行[い]きますか。`,
    lines: [
      { who: 'M', ja: `すみません、${t.want[0]}は ${floorJa(t.first)}ですか。`, en: `Excuse me, is the ${t.want[1]} on floor ${t.first}?` },
      { who: 'F', ja: `いいえ、先月[せんげつ]から ${floorJa(t.real)}に なりました。`, en: `No, since last month it’s been on floor ${t.real}.` },
      { who: 'M', ja: `${floorJa(t.real)}ですね。ありがとうございます。`, en: `Floor ${t.real}. Thank you.` },
    ],
    choices: place(t.real, t.others, t.answer).map(n => ({ type: 'floor', floor: n, floors: 8 })),
    answer: t.answer,
    why: `It moved from floor ${t.first} to floor ${t.real} last month.`,
  })));

  const PLATFORM = [
    { id: 'platform-tokyo', level: 'N5', usual: 3, today: 5, answer: 1, others: [3, 4, 2] },
    { id: 'platform-osaka', level: 'N4', usual: 6, today: 2, answer: 2, others: [6, 1, 8] },
    { id: 'platform-yokohama', level: 'N5', usual: 4, today: 7, answer: 0, others: [4, 5, 1] },
  ];
  add('kadai', PLATFORM.map(t => ({
    id: t.id, level: t.level,
    intro: '駅[えき]で 女[おんな]の人[ひと]と 駅員[えきいん]が 話[はな]しています。女[おんな]の人[ひと]は 何番線[なんばんせん]へ 行[い]きますか。',
    lines: [
      { who: 'F', ja: `すみません、東京[とうきょう]行[ゆ]きの 電車[でんしゃ]は ${kanjiNum(t.usual)}番線[${readNum(t.usual)}ばんせん]ですか。`, en: `Excuse me, does the train to Tokyo leave from platform ${t.usual}?` },
      { who: 'M', ja: `いつもは そうですが、今日[きょう]は 工事[こうじ]で ${kanjiNum(t.today)}番線[${readNum(t.today)}ばんせん]からです。`, en: `Usually, yes, but today because of construction work it’s from platform ${t.today}.` },
      { who: 'F', ja: 'わかりました。ありがとうございます。', en: 'I see. Thank you.' },
    ],
    choices: place(t.today, t.others, t.answer).map(n => ({ type: 'platform', num: n })),
    answer: t.answer,
    why: `Usually platform ${t.usual}, but today it’s platform ${t.today} (工事, construction work).`,
  })));

  global.LISTENING_HELPERS = { kanjiNum, readNum, yen, time, mins, TSU, PEOPLE, mai, floorJa, dateJa };
})(typeof window !== 'undefined' ? window : globalThis);
