// JLPT Reading (jlpt-reading.html): Tokidoki's own practice texts in the
// style of the JLPT reading section's practical texts, N5 to N2.
//
//   type 'short' — 内容理解（短文）: a notice, email, memo or invitation;
//     the question asks what someone must do, what the writer most wants
//     to say, or what matches the text.
//   type 'info'  — 情報検索: a flyer, price list or timetable; the question
//     gives someone's situation and asks which option fits.
//
// Lengths follow the official guidelines (short texts ~80 characters at N5,
// 100–200 at N4, 150–200 at N3, ~200 at N2; information texts ~250 at N5,
// ~400 at N4, ~600 at N3, ~700 at N2). N5 texts are spaced between phrases,
// as on the N5 paper.
//
// Markup, one line per line of the text:
//   {漢字|かんじ}  furigana            # heading      > right-aligned line
//   @label|value  an email header line   |! a | b      table header row
//   | a | b       table row              «1|…»         the part of the text
//                                                     question 1's answer
//                                                     rests on (highlighted
//                                                     once it's answered)
// Each question: q (Japanese), en, choices [[Japanese, English], …] with
// the answer first (shuffled on screen), why (English). words: the harder
// words, [word, reading, meaning]. en: the whole text in English.
(function (global) {
  'use strict';

  const JLPT_READING = [

    // ─── N5 ──────────────────────────────────────────────────────────────

    {
      id: 'n5-memo-laundry', level: 'N5', type: 'short', form: 'memo',
      title: 'A note from Mum',
      text: `はなこへ
お{母|かあ}さんは きょう、しごとの あとで ともだちと ばんごはんを {食|た}べます。{夜|よる} 9{時|じ}ごろ かえります。はなこの ばんごはんは れいぞうこの {中|なか}に あります。それから、«1|{雨|あめ}が ふったら、にわの せんたくものを {中|なか}に {入|い}れて ください»。
> {母|はは}より`,
      en: `Hanako,
I'm having dinner with a friend after work today. I'll be home at around nine in the evening. Your dinner is in the fridge. And if it rains, please bring the washing in from the garden.
Mum`,
      questions: [{
        q: 'はなこさんは きょう {何|なに}を しなければ なりませんか。',
        en: 'What does Hanako have to do today?',
        choices: [
          ['{雨|あめ}が ふったら、せんたくものを {中|なか}に {入|い}れる。', 'If it rains, bring the washing in.'],
          ['ばんごはんを つくって、れいぞうこに {入|い}れる。', 'Make dinner and put it in the fridge.'],
          ['{夜|よる} 9{時|じ}に お{母|かあ}さんと ばんごはんを {食|た}べる。', 'Have dinner with Mum at 9 p.m.'],
          ['ともだちと いっしょに ばんごはんを {食|た}べる。', 'Have dinner with a friend.'],
        ],
        why: 'The request is the last sentence: 雨が ふったら … 入れて ください, “if it rains, please bring the washing in”. Dinner is already in the fridge (れいぞうこの 中に あります), and it’s Mum, not Hanako, who eats with a friend and comes home at nine. Watch who does what — mixing up the people is the oldest trap in the book.',
      }],
      words: [['れいぞうこ', '', 'fridge'], ['せんたくもの', '', 'the washing, laundry'], ['にわ', '', 'garden'], ['ふったら', '', 'if (it) falls — 〜たら, “if / when”'], ['〜より', '', 'from … (at the end of a letter)']],
    },

    {
      id: 'n5-notice-party', level: 'N5', type: 'short', form: 'notice',
      title: 'A party for the students',
      text: `# りゅうがくせいの みなさんへ
3{月|がつ}{20日|はつか}（{金|きん}）に、{学校|がっこう}の {前|まえ}の こうえんで パーティーを します。{雨|あめ}の {日|ひ}は きょうしつで します。ひるの 12{時|じ}から 3{時|じ}までです。
«1|{飲|の}みものは {学校|がっこう}に あります。みなさんは {食|た}べものを ひとつ もって きて ください»。
«1|パーティーに {来|く}る {人|ひと}は、3{月|がつ}13{日|にち}までに じむしょで {名前|なまえ}を {書|か}いて ください»。
> さくら{日本語|にほんご}{学校|がっこう}`,
      en: `To all international students
On Friday 20 March we're having a party in the park in front of the school. If it rains, it will be in a classroom. It runs from 12 noon to 3 p.m.
The school has drinks. Please each bring one thing to eat.
If you're coming to the party, please write your name at the office by 13 March.
Sakura Japanese Language School`,
      questions: [{
        q: 'パーティーに {行|い}きたい {人|ひと}は、どう しなければ なりませんか。',
        en: 'What do people who want to go to the party have to do?',
        choices: [
          ['3{月|がつ}13{日|にち}までに {名前|なまえ}を {書|か}いて、パーティーの {日|ひ}に {食|た}べものを もって いく。', 'Write their name by 13 March, and bring something to eat on the day.'],
          ['3{月|がつ}13{日|にち}までに {名前|なまえ}を {書|か}いて、パーティーの {日|ひ}に {飲|の}みものを もって いく。', 'Write their name by 13 March, and bring a drink on the day.'],
          ['パーティーの {日|ひ}に {名前|なまえ}を {書|か}いて、{食|た}べものを もって いく。', 'Write their name on the day of the party, and bring something to eat.'],
          ['パーティーの {日|ひ}に {名前|なまえ}を {書|か}いて、{飲|の}みものを もって いく。', 'Write their name on the day of the party, and bring a drink.'],
        ],
        why: 'Two things: write your name at the office by 13 March (13日までに — “by”, a deadline), and bring one thing to eat — the school already has the drinks. The JLPT loves this two-by-two pattern: check each half of each choice against the text.',
      }],
      words: [['りゅうがくせい', '', 'international student'], ['こうえん', '', 'park'], ['きょうしつ', '', 'classroom'], ['じむしょ', '', 'office'], ['もって くる', '', 'to bring (here)'], ['〜までに', '', 'by … (a deadline)']],
    },

    {
      id: 'n5-message-movie', level: 'N5', type: 'short', form: 'message',
      title: 'About tomorrow’s film',
      text: `マリアさん
あしたの えいがですが、ごめんなさい。{午前|ごぜん}は しゅくだいが あるので、{行|い}けません。«1|{午後|ごご}の 3{時|じ}の えいがでも いいですか»。いいなら、2{時|じ}45{分|ふん}に えきの {前|まえ}で あいましょう。
> リン`,
      en: `Maria,
About tomorrow's film — sorry. I have homework in the morning, so I can't go then. Would the 3 p.m. showing be OK? If it is, let's meet in front of the station at 2:45.
Lin`,
      questions: [{
        q: 'リンさんが いちばん いいたい ことは {何|なん}ですか。',
        en: 'What does Lin most want to say?',
        choices: [
          ['{午後|ごご}の えいがに したい こと。', 'That Lin wants to see the afternoon showing.'],
          ['あしたは えいがに {行|い}けない こと。', 'That Lin can’t go to the film tomorrow.'],
          ['しゅくだいを てつだって ほしい こと。', 'That Lin wants help with homework.'],
          ['3{時|じ}に えきの {前|まえ}で あいたい こと。', 'That Lin wants to meet in front of the station at 3.'],
        ],
        why: 'Lin can’t make the morning (午前は … 行けません), so the point is the question after it: 午後の 3時の えいがでも いいですか, “would the 3 p.m. film be OK?”. Lin still wants to go tomorrow, and the meeting time is 2:45 — 3:00 is when the film starts.',
      }],
      words: [['えいが', '', 'film, movie'], ['しゅくだい', '', 'homework'], ['〜でも いいですか', '', 'would … be OK?'], ['あいましょう', '', 'let’s meet']],
    },

    {
      id: 'n5-notice-garbage', level: 'N5', type: 'short', form: 'notice',
      title: 'Rubbish days',
      text: `# ごみの {出|だ}しかた
・もえる ごみ（かみ、{食|た}べもの など）：{月|げつ}ようびと {木|もく}ようび
・びん、かん：{水|すい}ようび
・ペットボトル：{金|きん}ようび
«1|ごみは あさ 8{時|じ}までに {出|だ}して ください»。«1|{前|まえ}の {日|ひ}の {夜|よる}に {出|だ}さないで ください»。
> みどりアパート`,
      en: `How to put out rubbish
• Burnable rubbish (paper, food etc.): Mondays and Thursdays
• Glass bottles and cans: Wednesdays
• Plastic bottles: Fridays
Please put rubbish out by 8 in the morning. Please don't put it out the night before.
Midori Apartments`,
      questions: [{
        q: 'やまださんは {火|か}ようびの {夜|よる}に ジュースを {飲|の}みました。ジュースの びんは いつ {出|だ}しますか。',
        en: 'Mr Yamada drank a bottle of juice on Tuesday night. When does he put the (glass) bottle out?',
        choices: [
          ['{水|すい}ようびの あさ 8{時|じ}までに', 'On Wednesday, by 8 in the morning'],
          ['{火|か}ようびの {夜|よる}に', 'On Tuesday night'],
          ['{水|すい}ようびの {夜|よる}に', 'On Wednesday night'],
          ['{金|きん}ようびの あさ 8{時|じ}までに', 'On Friday, by 8 in the morning'],
        ],
        why: 'Glass bottles (びん) go out on Wednesday, by 8 in the morning (あさ 8時までに) — and never the night before (前の 日の 夜に 出さないで). Friday is for plastic bottles (ペットボトル), not glass ones.',
      }],
      words: [['ごみ', '', 'rubbish, garbage'], ['{出|だ}す', 'だす', 'to put out'], ['もえる', '', 'to burn'], ['びん', '', '(glass) bottle'], ['かん', '', 'can'], ['ペットボトル', '', 'plastic bottle']],
    },

    {
      id: 'n5-info-swimming', level: 'N5', type: 'info', form: 'flyer',
      title: 'Children’s swimming classes',
      text: `# さくら{市|し} スポーツセンター「こどもの すいえい きょうしつ」
|! クラス | なんさい | ようび | {時間|じかん}
| A | 6さい〜8さい | {月|げつ}・{水|すい} | {午後|ごご}4:00〜5:00
| B | 6さい〜8さい | {土|ど} | {午前|ごぜん}10:00〜11:30
| C | 9さい〜12さい | {火|か}・{木|もく} | {午後|ごご}5:00〜6:00
| «1|D» | «1|9さい〜12さい» | «1|{土|ど}» | «1|{午後|ごご}1:00〜2:30»
・おかねは どの クラスも 1か{月|げつ} 3,000{円|えん}です。
・はじめての {人|ひと}は、すいえいの ぼうしを かって ください（500{円|えん}）。
・もうしこみは スポーツセンターの うけつけで して ください。`,
      en: `Sakura City Sports Centre — swimming classes for children
Class | Age | Days | Time
A | 6–8 | Mon, Wed | 4:00–5:00 p.m.
B | 6–8 | Sat | 10:00–11:30 a.m.
C | 9–12 | Tue, Thu | 5:00–6:00 p.m.
D | 9–12 | Sat | 1:00–2:30 p.m.
• Every class costs 3,000 yen a month.
• New swimmers, please buy a swimming cap (500 yen).
• Please apply at the Sports Centre's reception desk.`,
      questions: [{
        q: 'キムさんの むすこは 9さいです。{火|か}ようびと {木|もく}ようびは ピアノの きょうしつに {行|い}きます。キムさんの むすこは どの クラスに {入|はい}りますか。',
        en: 'Ms Kim’s son is nine. On Tuesdays and Thursdays he goes to piano lessons. Which class does he join?',
        choices: [['D', 'D'], ['A', 'A'], ['B', 'B'], ['C', 'C']],
        why: 'Nine years old rules out A and B (6–8). C is on Tuesday and Thursday — the piano days. That leaves D, Saturday afternoon. In 情報検索 you never need the whole text: find the rows that pass each condition.',
      }],
      words: [['すいえい', '', 'swimming'], ['きょうしつ', '', 'class, lessons'], ['なんさい', '', 'how old'], ['ぼうし', '', 'cap, hat'], ['もうしこみ', '', 'applying, application'], ['うけつけ', '', 'reception desk'], ['むすこ', '', '(my) son']],
    },

    {
      id: 'n5-info-lunch', level: 'N5', type: 'info', form: 'flyer',
      title: 'A café’s lunch menu',
      text: `# きっさてん「もり」 ランチ メニュー
ランチの {時間|じかん}：{午前|ごぜん}11{時|じ}〜{午後|ごご}2{時|じ}
|! | ランチ | ねだん
| A | カレーライス（とりにく） | 800{円|えん}
| B | さかなの ていしょく | 900{円|えん}
| «1|C» | «1|やさいの スパゲッティ» | «1|700{円|えん}»
| D | ハンバーグの ていしょく | 1,000{円|えん}
・«1|ランチと いっしょに {飲|の}みものを たのむと、{飲|の}みものは 200{円|えん}です»。
・{午後|ごご}2{時|じ}から 5{時|じ}までは、ケーキと {飲|の}みものだけです。
・みせは {月|げつ}ようびは やすみです。`,
      en: `Café Mori — lunch menu
Lunch is served 11 a.m.–2 p.m.
 | Lunch | Price
A | Curry and rice (chicken) | 800 yen
B | Fish set meal | 900 yen
C | Vegetable spaghetti | 700 yen
D | Hamburg steak set meal | 1,000 yen
• Drinks ordered with a lunch are 200 yen.
• From 2 to 5 p.m. we serve only cake and drinks.
• We're closed on Mondays.`,
      questions: [{
        q: 'アンナさんは 12{時|じ}に この みせに {行|い}きます。にくは {食|た}べません。ランチと {飲|の}みものを たのみます。ぜんぶで 1,000{円|えん}までに したいです。アンナさんは どれを たのみますか。',
        en: 'Anna goes to the café at 12. She doesn’t eat meat. She’ll order a lunch and a drink, for 1,000 yen at most. Which does she order?',
        choices: [
          ['Cの ランチと {飲|の}みもの', 'Lunch C and a drink'],
          ['Aの ランチと {飲|の}みもの', 'Lunch A and a drink'],
          ['Bの ランチと {飲|の}みもの', 'Lunch B and a drink'],
          ['Dの ランチと {飲|の}みもの', 'Lunch D and a drink'],
        ],
        why: 'No meat rules out A (chicken, とりにく) and D (hamburg steak). A drink with lunch adds 200 yen: B comes to 1,100 yen — over her 1,000. C is 700 + 200 = 900 yen.',
      }],
      words: [['きっさてん', '', 'café, coffee shop'], ['ねだん', '', 'price'], ['とりにく', '', 'chicken (meat)'], ['ていしょく', '', 'set meal'], ['たのむ', '', 'to order, to ask for'], ['〜だけ', '', 'only …']],
    },

    {
      id: 'n5-memo-shopping', level: 'N5', type: 'short', form: 'memo',
      title: 'A shopping list',
      text: `トムさん
わたしは {今日|きょう} おそく かえります。«1|スーパーで かいものを して ください»。
・たまご（10こ）
・ぎゅうにゅう（1{本|ぽん}）
・パン
«1|パンは スーパーで かわないで ください。{駅|えき}の {前|まえ}の パンやで かって ください»。スーパーの パンは あまり おいしくないです。
おかねは つくえの {上|うえ}に あります。
> ゆみ`,
      en: `Tom,
I'll be home late today. Please do the shopping at the supermarket.
• Eggs (10)
• Milk (1 carton)
• Bread
Please don't buy the bread at the supermarket. Please buy it at the bakery in front of the station. The supermarket's bread isn't very good.
The money is on the desk.
Yumi`,
      questions: [{
        q: 'トムさんは どこで {何|なに}を かいますか。',
        en: 'Where does Tom buy what?',
        choices: [
          ['スーパーで たまごと ぎゅうにゅう、パンやで パンを かう。', 'Eggs and milk at the supermarket, bread at the bakery.'],
          ['スーパーで たまごと ぎゅうにゅうと パンを かう。', 'Eggs, milk and bread at the supermarket.'],
          ['パンやで たまごと パン、スーパーで ぎゅうにゅうを かう。', 'Eggs and bread at the bakery, milk at the supermarket.'],
          ['{駅|えき}の {前|まえ}の スーパーで ぜんぶ かう。', 'Everything at the supermarket in front of the station.'],
        ],
        why: 'Most things come from the supermarket, but the bread is the exception: パンは スーパーで かわないで … パンやで かって ください. And it’s the bakery, not a supermarket, that is in front of the station. A list with one exception after it is a favourite N5 pattern.',
      }],
      words: [['たまご', '', 'egg'], ['ぎゅうにゅう', '', 'milk'], ['パンや', '', 'bakery'], ['〜ないで ください', '', 'please don’t …'], ['あまり 〜ない', '', 'not very …']],
    },

    {
      id: 'n5-notice-test-room', level: 'N5', type: 'short', form: 'notice',
      title: 'Tomorrow’s test',
      text: `# 2{年|ねん}Aクラスの みなさんへ
あしたの {日本語|にほんご}の じゅぎょうは、いつもの きょうしつでは ありません。«1|3かいの 305きょうしつです»。{時間|じかん}は おなじです。
あしたは テストが あります。«1|じしょは つかいませんから、もって こなくても いいです»。えんぴつと けしゴムを もって きて ください。
> やまだ`,
      en: `To everyone in class 2A
Tomorrow's Japanese class isn't in the usual classroom. It's in room 305 on the third floor. The time is the same.
There's a test tomorrow. You won't use dictionaries, so you don't need to bring one. Please bring a pencil and an eraser.
Yamada`,
      questions: [{
        q: 'あした、{学生|がくせい}は どう しますか。',
        en: 'What do the students do tomorrow?',
        choices: [
          ['305きょうしつへ {行|い}きます。じしょは もって いきません。', 'Go to room 305, without a dictionary.'],
          ['305きょうしつへ {行|い}きます。じしょを もって いきます。', 'Go to room 305, with a dictionary.'],
          ['いつもの きょうしつへ {行|い}きます。じしょは もって いきません。', 'Go to the usual classroom, without a dictionary.'],
          ['いつもの きょうしつへ {行|い}きます。じしょを もって いきます。', 'Go to the usual classroom, with a dictionary.'],
        ],
        why: 'Two halves to check. The room: not the usual one (いつもの きょうしつでは ありません) but 305 on the third floor. The dictionary: もって こなくても いいです — “you don’t have to bring it”. Only the pencil and eraser are needed.',
      }],
      words: [['じゅぎょう', '', 'class, lesson'], ['きょうしつ', '', 'classroom'], ['じしょ', '', 'dictionary'], ['〜なくても いいです', '', 'you don’t have to …'], ['けしゴム', '', 'eraser']],
    },

    {
      id: 'n5-invite-birthday', level: 'N5', type: 'short', form: 'invite',
      title: 'A birthday party',
      text: `ジムさん
こんどの {土|ど}ようび、わたしの いえで たんじょうびの パーティーを します。{夜|よる} 6{時|じ}からです。ぜひ {来|き}て ください。
わたしの いえは {駅|えき}から とおいです。«1|{駅|えき}に ついたら、でんわを ください。くるまで むかえに {行|い}きます»。
プレゼントは いりません。
> けんた`,
      en: `Jim,
This Saturday I'm having a birthday party at my house. It starts at 6 in the evening. Please do come.
My house is a long way from the station. When you get to the station, please phone me. I'll come and pick you up by car.
You don't need to bring a present.
Kenta`,
      questions: [{
        q: 'ジムさんは {駅|えき}に ついたら、{何|なに}を しますか。',
        en: 'What does Jim do when he gets to the station?',
        choices: [
          ['けんたさんに でんわを します。', 'Phone Kenta.'],
          ['けんたさんの いえまで あるいて {行|い}きます。', 'Walk to Kenta’s house.'],
          ['タクシーで けんたさんの いえへ {行|い}きます。', 'Take a taxi to Kenta’s house.'],
          ['プレゼントを かいに {行|い}きます。', 'Go and buy a present.'],
        ],
        why: '駅に ついたら、でんわを ください — “when you get to the station, call me”: Kenta will come by car, because the house is far. No present is needed (いりません), so there’s nothing to buy.',
      }],
      words: [['たんじょうび', '', 'birthday'], ['とおい', '', 'far'], ['つく', '', 'to arrive'], ['むかえに {行|い}く', 'むかえにいく', 'to go and pick (someone) up'], ['いりません', '', 'not needed']],
    },

    {
      id: 'n5-notice-hike', level: 'N5', type: 'short', form: 'notice',
      title: 'The school hike',
      text: `# あしたの えんそく
あしたは みんなで さくら{山|やま}へ {行|い}きます。あさ 8{時|じ}{半|はん}に {学校|がっこう}の {前|まえ}に {来|き}て ください。おべんとうと {水|みず}を もって きて ください。
«1|{雨|あめ}の {日|ひ}は えんそくは ありません。{学校|がっこう}で いつもの じゅぎょうが あります。でも、おべんとうは もって きて ください»。`,
      en: `Tomorrow's school trip
Tomorrow we're all going to Mount Sakura. Please come to the front of the school at 8:30 in the morning. Please bring a packed lunch and water.
If it rains, there's no trip. There will be the usual lessons at school. But please bring a packed lunch anyway.`,
      questions: [{
        q: 'あした {雨|あめ}が ふったら、{学生|がくせい}は どう しますか。',
        en: 'If it rains tomorrow, what do the students do?',
        choices: [
          ['{学校|がっこう}へ {行|い}きます。おべんとうを もって いきます。', 'Go to school, with a packed lunch.'],
          ['{学校|がっこう}へ {行|い}きます。おべんとうは もって いきません。', 'Go to school, without a packed lunch.'],
          ['さくら{山|やま}へ {行|い}きます。おべんとうを もって いきます。', 'Go to Mount Sakura, with a packed lunch.'],
          ['{学校|がっこう}を やすみます。', 'Stay home from school.'],
        ],
        why: 'On a rainy day there’s no trip but normal lessons (いつもの じゅぎょうが あります), and でも (“but”) adds the catch: bring your lunch anyway. でも and けど often introduce exactly the detail the question asks about.',
      }],
      words: [['えんそく', '', 'school trip, hike'], ['おべんとう', '', 'packed lunch'], ['じゅぎょう', '', 'class, lesson'], ['でも', '', 'but']],
    },

    {
      id: 'n5-info-bus', level: 'N5', type: 'info', form: 'flyer',
      title: 'The airport bus',
      text: `# さくら{駅|えき} → ひこうじょう バス
|! バス | さくら{駅|えき}を でる | ひこうじょうに つく
| 1 | 7:10 | 8:00
| «1|2» | «1|7:40» | «1|8:30»
| 3 | 8:20 | 9:20
| 4 | 9:00 | 9:50
・«1|あさ 8{時|じ}から 9{時|じ}までは みちが こみますから、{時間|じかん}が かかります»。
・おかねは おとな 1,200{円|えん}、こども 600{円|えん}です。
・バスの きっぷは {駅|えき}の 1かいで かって ください。
・バスの {中|なか}で {食|た}べものを {食|た}べないで ください。`,
      en: `Sakura Station → airport bus
Bus | Leaves Sakura Station | Arrives at the airport
1 | 7:10 | 8:00
2 | 7:40 | 8:30
3 | 8:20 | 9:20
4 | 9:00 | 9:50
• From 8 to 9 in the morning the roads are busy, so the trip takes longer.
• Fares: adults 1,200 yen, children 600 yen.
• Please buy bus tickets on the first floor of the station.
• Please don't eat on the bus.`,
      questions: [{
        q: 'リーさんは ひこうじょうに 9{時|じ}までに つきたいです。いちばん おそい バスは どれですか。',
        en: 'Lee wants to get to the airport by 9. Which is the latest bus he can take?',
        choices: [['2の バス', 'Bus 2'], ['1の バス', 'Bus 1'], ['3の バス', 'Bus 3'], ['4の バス', 'Bus 4']],
        why: 'Look at the arrival column, not the departure one. Bus 3 leaves at 8:20 but only arrives at 9:20 — the roads are busy between 8 and 9. Bus 2 arrives at 8:30, so it’s the last one that’s in time. (Bus 1 is in time too, but earlier.)',
      }],
      words: [['ひこうじょう', '', 'airport'], ['でる', '', 'to leave, depart'], ['みち', '', 'road'], ['こむ', '', 'to be crowded, busy'], ['きっぷ', '', 'ticket']],
    },

    {
      id: 'n5-info-sale', level: 'N5', type: 'info', form: 'flyer',
      title: 'The supermarket’s cheap days',
      text: `# スーパー「みどり」 やすい {日|ひ}
|! ようび | やすい もの
| {月|げつ}ようび | やさい
| «1|{水|すい}ようび» | «1|さかなと にく»
| {金|きん}ようび | パンと ぎゅうにゅう
| {土|ど}ようび・{日|にち}ようび | おかしと ジュース
・«1|みせは あさ 10{時|じ}から {夜|よる} 9{時|じ}までです»。
・{火|か}ようびは やすみです。
・3,000{円|えん}より たくさん かった {人|ひと}は、みせの {人|ひと}が いえまで もって {行|い}きます。
・ふくろは 1まい 5{円|えん}です。
・みせは {駅|えき}から あるいて 5ふんです。くるまは 30だい とめられます。`,
      en: `Midori Supermarket — cheap days
Day | Cheap items
Monday | Vegetables
Wednesday | Fish and meat
Friday | Bread and milk
Saturday and Sunday | Sweets and juice
• The shop is open from 10 a.m. to 9 p.m.
• We're closed on Tuesdays.
• If you spend more than 3,000 yen, our staff will bring your shopping to your home.
• Bags are 5 yen each.
• The shop is a 5-minute walk from the station. There's parking for 30 cars.`,
      questions: [{
        q: 'マリさんの しごとは {月|げつ}ようびから {金|きん}ようびまでで、{夜|よる} 7{時|じ}に おわります。マリさんは さかなを やすく かいたいです。いつ {行|い}きますか。',
        en: 'Mari works Monday to Friday and finishes at 7 p.m. She wants to buy fish cheaply. When does she go?',
        choices: [
          ['{水|すい}ようびの {夜|よる} 8{時|じ}', 'Wednesday at 8 p.m.'],
          ['{水|すい}ようびの あさ 10{時|じ}', 'Wednesday at 10 a.m.'],
          ['{火|か}ようびの {夜|よる} 8{時|じ}', 'Tuesday at 8 p.m.'],
          ['{土|ど}ようびの あさ 10{時|じ}', 'Saturday at 10 a.m.'],
        ],
        why: 'Fish is cheap on Wednesday. On Wednesday morning she’s at work, but the shop is open until 9 at night, so 8 p.m. after work is fine. Tuesday the shop is closed, and on Saturday it’s sweets and juice that are cheap, not fish.',
      }],
      words: [['やすい', '', 'cheap'], ['やさい', '', 'vegetables'], ['さかな', '', 'fish'], ['にく', '', 'meat'], ['おかし', '', 'sweets, snacks'], ['やすみ', '', 'closed, day off']],
    },

    {
      id: 'n5-memo-dog', level: 'N5', type: 'short', form: 'memo',
      title: 'Looking after the dog',
      text: `ケンへ
お{父|とう}さんと お{母|かあ}さんは あした {朝|あさ}から りょこうに {行|い}きます。かえるのは あさっての {夜|よる}です。
«1|ポチの ごはんは {朝|あさ}と {夜|よる}に あげて ください»。ごはんは だいどころの {右|みぎ}の たなに あります。
«1|さんぽは {夕方|ゆうがた} 1かいで いいです»。
> {母|はは}より`,
      en: `Ken,
Dad and I are going on a trip from tomorrow morning. We'll be back the night after tomorrow.
Please feed Pochi in the morning and at night. The food is on the shelf on the right in the kitchen.
One walk in the evening is enough.
Mum`,
      questions: [{
        q: 'ケンさんは あした {何|なに}を しなければ なりませんか。',
        en: 'What does Ken have to do tomorrow?',
        choices: [
          ['{朝|あさ}と {夜|よる}に ポチに ごはんを あげて、{夕方|ゆうがた} さんぽに {行|い}く。', 'Feed Pochi in the morning and at night, and walk him in the evening.'],
          ['{朝|あさ}だけ ポチに ごはんを あげて、{夕方|ゆうがた} さんぽに {行|い}く。', 'Feed Pochi only in the morning, and walk him in the evening.'],
          ['{朝|あさ}と {夜|よる}に ポチに ごはんを あげて、{朝|あさ}と {夕方|ゆうがた} さんぽに {行|い}く。', 'Feed Pochi morning and night, and walk him morning and evening.'],
          ['お{父|とう}さんと お{母|かあ}さんと りょこうに {行|い}く。', 'Go on the trip with Mum and Dad.'],
        ],
        why: 'Two halves again: food in the morning and at night (朝と 夜に あげて ください), and one walk, in the evening (夕方 1かいで いいです — “one time is fine”). It’s Mum and Dad who go on the trip.',
      }],
      words: [['りょこう', '', 'trip, travel'], ['あさって', '', 'the day after tomorrow'], ['だいどころ', '', 'kitchen'], ['たな', '', 'shelf'], ['さんぽ', '', 'walk'], ['〜で いいです', '', '… is fine, … is enough']],
    },

    {
      id: 'n5-message-late', level: 'N5', type: 'short', form: 'message',
      title: 'Running late',
      text: `アリさん
ごめんなさい。でんしゃが おくれて います。やくそくの 3{時|じ}には {行|い}けません。«1|3{時|じ}{半|はん}ごろに つきます»。
«1|{駅|えき}の {前|まえ}の きっさてんで まって いて ください»。
> ミカ`,
      en: `Ali,
Sorry. The train is late. I can't make it by three, the time we agreed. I'll get there at about half past three.
Please wait for me at the café in front of the station.
Mika`,
      questions: [{
        q: 'アリさんは どう しますか。',
        en: 'What does Ali do?',
        choices: [
          ['{駅|えき}の {前|まえ}の きっさてんで ミカさんを まつ。', 'Wait for Mika at the café in front of the station.'],
          ['{駅|えき}の {前|まえ}で 3{時|じ}まで まって、かえる。', 'Wait in front of the station until three, then go home.'],
          ['でんしゃに のって、ミカさんを むかえに {行|い}く。', 'Take the train and go to meet Mika.'],
          ['3{時|じ}{半|はん}に ミカさんに でんわを する。', 'Phone Mika at half past three.'],
        ],
        why: 'Mika will be about half an hour late (3時半ごろに つきます) and asks Ali to wait at the café: きっさてんで まって いて ください — “please be waiting”.',
      }],
      words: [['おくれる', '', 'to be late'], ['やくそく', '', 'promise; arrangement to meet'], ['つく', '', 'to arrive'], ['きっさてん', '', 'café'], ['まって いて ください', '', 'please wait (and be there)']],
    },

    {
      id: 'n5-notice-pool', level: 'N5', type: 'short', form: 'notice',
      title: 'The pool is closed',
      text: `# プールの お{知|し}らせ
«1|7{月|がつ}{10日|とおか}から 12{日|にち}まで、プールの そうじを します»。この {3日|みっか}は プールに {入|はい}れません。
«1|13{日|にち}から また {入|はい}れます»。
シャワーと トイレは つかえます。
> さくら{市|し} スポーツセンター`,
      en: `Notice about the pool
From 10 to 12 July we will clean the pool. You can't use the pool on these three days.
You can swim again from the 13th.
The showers and toilets can be used.
Sakura City Sports Centre`,
      questions: [{
        q: 'プールに {入|はい}れるのは いつですか。',
        en: 'On which day can you use the pool?',
        choices: [
          ['7{月|がつ}13{日|にち}', '13 July'],
          ['7{月|がつ}{10日|とおか}', '10 July'],
          ['7{月|がつ}11{日|にち}', '11 July'],
          ['7{月|がつ}12{日|にち}', '12 July'],
        ],
        why: 'The pool is cleaned from the 10th to the 12th (10日から 12日まで — both days included), and opens again from the 13th (13日から また 入れます). The showers stay open, but not the pool.',
      }],
      words: [['お{知|し}らせ', 'おしらせ', 'notice'], ['そうじ', '', 'cleaning'], ['{入|はい}れる', 'はいれる', 'can go in'], ['また', '', 'again'], ['つかえる', '', 'can be used']],
    },

    {
      id: 'n5-memo-key', level: 'N5', type: 'short', form: 'memo',
      title: 'Where the key is',
      text: `リーさんへ
わたしは {今日|きょう} {学校|がっこう}の あとで アルバイトに {行|い}きます。かえるのは {夜|よる} 10{時|じ}ごろです。
へやの かぎは ドアの {前|まえ}の {花|はな}の {下|した}に あります。
«1|へやを でる ときは、かぎを かけて、また {花|はな}の {下|した}に おいて ください»。
> ナナ`,
      en: `Lee,
I'm going to my part-time job after school today. I'll be home at around ten at night.
The key to the room is under the flowers in front of the door.
When you leave the room, please lock it and put the key back under the flowers.
Nana`,
      questions: [{
        q: 'リーさんは へやを でる とき、かぎを どう しますか。',
        en: 'What does Lee do with the key when leaving the room?',
        choices: [
          ['かぎを かけて、{花|はな}の {下|した}に おく。', 'Lock the door and put the key under the flowers.'],
          ['かぎを かけて、ナナさんに わたす。', 'Lock the door and give the key to Nana.'],
          ['かぎを かけないで、{花|はな}の {下|した}に おく。', 'Put the key under the flowers without locking up.'],
          ['かぎを もって アルバイトに {行|い}く。', 'Take the key to the part-time job.'],
        ],
        why: 'The last line is the request: lock up (かぎを かけて) and put the key back under the flowers (また 花の 下に おいて). Nana is at work until ten, so there is no one to hand it to.',
      }],
      words: [['アルバイト', '', 'part-time job'], ['かぎ', '', 'key'], ['かぎを かける', '', 'to lock'], ['でる', '', 'to leave, go out'], ['おく', '', 'to put, leave (something somewhere)']],
    },

    {
      id: 'n5-message-restaurant', level: 'N5', type: 'short', form: 'message',
      title: 'A new restaurant for tomorrow',
      text: `みなさん
あしたの ばんごはんの みせが かわりました。«1|「さくら」は やすみですから、となりの「もみじ」に します»。{時間|じかん}は おなじ {夜|よる} 7{時|じ}です。
「もみじ」は カレーの みせです。おかねは ひとり 1,500{円|えん}ぐらいです。
> タン`,
      en: `Everyone,
The restaurant for tomorrow's dinner has changed. "Sakura" is closed, so we'll go to "Momiji" next door. The time is the same, seven in the evening.
"Momiji" is a curry restaurant. It's about 1,500 yen per person.
Tan`,
      questions: [{
        q: 'タンさんが いちばん いいたい ことは {何|なん}ですか。',
        en: 'What does Tan most want to say?',
        choices: [
          ['あしたの みせが「もみじ」に かわった こと。', 'That tomorrow’s restaurant has changed to Momiji.'],
          ['あしたの {時間|じかん}が かわった こと。', 'That tomorrow’s time has changed.'],
          ['「さくら」は カレーの みせだ と いう こと。', 'That Sakura is a curry restaurant.'],
          ['ばんごはんの おかねが たかい こと。', 'That dinner is expensive.'],
        ],
        why: 'The first line says what changed — the restaurant (みせが かわりました) — and the next says to what: Momiji, because Sakura is closed. The time stays the same (おなじ 夜 7時), and it’s Momiji that serves curry.',
      }],
      words: [['ばんごはん', '', 'dinner'], ['みせ', '', 'shop, restaurant'], ['かわる', '', 'to change'], ['となり', '', 'next door'], ['〜に します', '', 'to decide on …'], ['ぐらい', '', 'about']],
    },

    {
      id: 'n5-notice-library-days', level: 'N5', type: 'short', form: 'notice',
      title: 'Library closing days',
      text: `# としょかんの やすみ
としょかんは まいしゅう {月|げつ}ようびが やすみです。
でも、«1|こんしゅうは {水|すい}ようびも やすみです»。{本|ほん}の せいりを します。
«1|{本|ほん}を かえしたい {人|ひと}は、いりぐちの {右|みぎ}の ポストに {入|い}れて ください»。
> みどり{図書館|としょかん}`,
      en: `Library closing days
The library is closed every Monday.
But this week it's also closed on Wednesday. We'll be sorting the books.
If you want to return books, please put them in the box to the right of the entrance.
Midori Library`,
      questions: [{
        q: 'ジョンさんは こんしゅうの {水|すい}ようびに {本|ほん}を かえしたいです。どう しますか。',
        en: 'John wants to return a book on Wednesday this week. What does he do?',
        choices: [
          ['いりぐちの {右|みぎ}の ポストに {入|い}れる。', 'Put it in the box to the right of the entrance.'],
          ['{月|げつ}ようびに かえしに {行|い}く。', 'Go and return it on Monday.'],
          ['としょかんの {人|ひと}に わたす。', 'Give it to someone at the library.'],
          ['{木|もく}ようびまで かえせない。', 'He can’t return it until Thursday.'],
        ],
        why: 'This week the library is closed on Wednesday too (こんしゅうは 水ようびも やすみ), so there’s nobody inside — but books can go in the box by the entrance any time (ポストに 入れて ください). Monday is the regular closing day.',
      }],
      words: [['としょかん', '', 'library'], ['まいしゅう', '', 'every week'], ['こんしゅう', '', 'this week'], ['せいり', '', 'sorting, tidying'], ['かえす', '', 'to return, give back'], ['いりぐち', '', 'entrance']],
    },

    {
      id: 'n5-info-cinema', level: 'N5', type: 'info', form: 'flyer',
      title: 'This week’s films',
      text: `# さくらシネマ　こんしゅうの えいが
|! えいが | {時間|じかん} | だれの えいが
| «1|A　ねこの たび» | «1|10:00 / 13:30» | «1|こどもと おとな»
| B　{山|やま}の {上|うえ}で | 11:00 / 15:00 | おとな
| C　ロボットくん | 12:30 / 16:00 | こども
| D　とうきょうの {夜|よる} | 18:00 / 20:30 | おとな
・おかね：おとな 1,800{円|えん}、こども（12さいまで）1,000{円|えん}
・«1|{水|すい}ようびは おとなも こどもも 1,000{円|えん}です»。
・{月|げつ}ようびは やすみです。
・えいがの {中|なか}で ものを {食|た}べないで ください。`,
      en: `Sakura Cinema — this week's films
Film | Times | For
A A Cat's Journey | 10:00 / 13:30 | Children and adults
B On the Mountain | 11:00 / 15:00 | Adults
C Robot-kun | 12:30 / 16:00 | Children
D Tokyo Night | 18:00 / 20:30 | Adults
• Prices: adults 1,800 yen, children (up to 12) 1,000 yen
• On Wednesdays it's 1,000 yen for adults and children alike.
• We're closed on Mondays.
• Please don't eat during the film.`,
      questions: [{
        q: 'ゆいさんは {水|すい}ようびの ごぜんに、7さいの むすめと えいがを みたいです。どの えいがを みて、ふたりで いくら はらいますか。',
        en: 'Yui wants to see a film on Wednesday morning with her seven-year-old daughter. Which film do they see, and how much do the two of them pay?',
        choices: [
          ['Aを みて、2,000{円|えん} はらう。', 'They see A and pay 2,000 yen.'],
          ['Aを みて、2,800{円|えん} はらう。', 'They see A and pay 2,800 yen.'],
          ['Cを みて、2,000{円|えん} はらう。', 'They see C and pay 2,000 yen.'],
          ['Bを みて、2,800{円|えん} はらう。', 'They see B and pay 2,800 yen.'],
        ],
        why: 'In the morning only A (10:00) and B (11:00) are on, and B is for adults, so A. On Wednesdays everyone pays 1,000 yen: 1,000 × 2 = 2,000 yen. C is a children’s film, but it starts at 12:30 — not the morning.',
      }],
      words: [['えいが', '', 'film, movie'], ['おとな', '', 'adult'], ['こども', '', 'child'], ['ごぜん', '', 'morning, a.m.'], ['むすめ', '', '(my) daughter'], ['はらう', '', 'to pay']],
    },

    {
      id: 'n5-info-train', level: 'N5', type: 'info', form: 'flyer',
      title: 'Morning trains',
      text: `# さくら{駅|えき}から みどり{駅|えき}まで（あさ）
|! でんしゃ | さくら{駅|えき}を でる | みどり{駅|えき}に つく
| ふつう | 7:05 | 7:50
| «1|きゅうこう» | «1|7:15» | «1|7:40»
| ふつう | 7:25 | 8:10
| きゅうこう | 7:45 | 8:10
・きゅうこうは とちゅうの {駅|えき}に とまりません。
・きっぷは きゅうこうも ふつうと おなじ 300{円|えん}です。
・あさ 7{時|じ}から 9{時|じ}までは とても こみます。
・でんしゃの {中|なか}で でんわを しないで ください。`,
      en: `Sakura Station to Midori Station (mornings)
Train | Leaves Sakura | Arrives at Midori
Local | 7:05 | 7:50
Express | 7:15 | 7:40
Local | 7:25 | 8:10
Express | 7:45 | 8:10
• The express doesn't stop at the stations on the way.
• The express costs the same as the local train: 300 yen.
• Trains are very crowded from 7 to 9 in the morning.
• Please don't talk on the phone on the train.`,
      questions: [{
        q: 'マイクさんは 8{時|じ}に みどり{駅|えき}の {前|まえ}で ともだちと あいます。いちばん おそい でんしゃで {行|い}きたいです。どの でんしゃに のりますか。',
        en: 'Mike is meeting a friend in front of Midori Station at 8. He wants to take the latest train he can. Which train does he take?',
        choices: [
          ['7:15の きゅうこう', 'The 7:15 express'],
          ['7:05の ふつう', 'The 7:05 local'],
          ['7:25の ふつう', 'The 7:25 local'],
          ['7:45の きゅうこう', 'The 7:45 express'],
        ],
        why: 'Look at the arrival column. The 7:25 local and the 7:45 express both arrive at 8:10 — too late. The 7:15 express leaves after the 7:05 local but arrives first, at 7:40: that’s the latest train that’s in time.',
      }],
      words: [['ふつう', '', 'local (train); ordinary'], ['きゅうこう', '', 'express'], ['とちゅう', '', 'on the way'], ['とまる', '', 'to stop'], ['こむ', '', 'to be crowded'], ['おそい', '', 'late; slow']],
    },

    {
      id: 'n5-info-zoo', level: 'N5', type: 'info', form: 'flyer',
      title: 'Zoo tickets',
      text: `# みどり どうぶつえん
あいて いる {時間|じかん}：{午前|ごぜん} 9{時|じ}〜{午後|ごご} 5{時|じ}
|! | おとな | こども（6さい〜15さい）
| {一人|ひとり} | 800{円|えん} | «1|300{円|えん}»
| 10{人|にん}より {多|おお}い グループ（{一人|ひとり}） | 600{円|えん} | 200{円|えん}
・«1|5さいまでの こどもは おかねが いりません»。
・まい{月|つき} {1日|ついたち}は、«1|おとなも 600{円|えん}です»。
・パンダの へやは {午後|ごご} 3{時|じ}までです。
・どうぶつに {食|た}べものを あげないで ください。`,
      en: `Midori Zoo
Open: 9 in the morning to 5 in the afternoon
 | Adults | Children (6–15)
One person | 800 yen | 300 yen
Groups of more than 10 (per person) | 600 yen | 200 yen
• Children up to 5 go free.
• On the 1st of every month, adults pay 600 yen too.
• The panda house closes at 3 in the afternoon.
• Please don't feed the animals.`,
      questions: [{
        q: 'やまださんは 5{月|がつ}{1日|ついたち}に、おくさんと 10さいの むすこと 4さいの むすめと 4{人|にん}で {行|い}きます。ぜんぶで いくらですか。',
        en: 'Mr Yamada goes on 1 May with his wife, his ten-year-old son and his four-year-old daughter — four of them. How much is it in total?',
        choices: [
          ['1,500{円|えん}', '1,500 yen'],
          ['1,900{円|えん}', '1,900 yen'],
          ['1,800{円|えん}', '1,800 yen'],
          ['1,200{円|えん}', '1,200 yen'],
        ],
        why: 'It’s the 1st of the month, so the two adults pay 600 each: 1,200. The ten-year-old pays the children’s price, 300. The four-year-old is free (5さいまで … いりません). 1,200 + 300 = 1,500 yen.',
      }],
      words: [['どうぶつえん', '', 'zoo'], ['あいて いる', '', 'open'], ['グループ', '', 'group'], ['いりません', '', 'not needed'], ['おくさん', '', '(someone’s) wife'], ['むすこ', '', '(my) son']],
    },

    {
      id: 'n5-info-japanese-class', level: 'N5', type: 'info', form: 'flyer',
      title: 'Free Japanese classes',
      text: `# さくら{市|し} {日本語|にほんご} きょうしつ
|! クラス | ようび | {時間|じかん} | どんな {人|ひと}
| はじめて | {火|か} | 10:00〜11:30 | ひらがなを ならいたい {人|ひと}
| «1|やさしい» | «1|{木|もく}» | «1|19:00〜20:30» | «1|ひらがなが よめる {人|ひと}»
| ふつう | {土|ど} | 10:00〜12:00 | かんたんな かいわが できる {人|ひと}
| はなそう | {日|にち} | 14:00〜16:00 | {日本語|にほんご}で すこし はなせる {人|ひと}
・おかねは いりません。
・{本|ほん}は きょうしつで かします。
・はじめての {人|ひと}は、じゅぎょうの 10ぷん {前|まえ}に きて ください。`,
      en: `Sakura City Japanese classes
Class | Day | Time | For
Beginners | Tue | 10:00–11:30 | People who want to learn hiragana
Easy | Thu | 19:00–20:30 | People who can read hiragana
Standard | Sat | 10:00–12:00 | People who can hold a simple conversation
Let's talk | Sun | 14:00–16:00 | People who can speak a little Japanese
• Classes are free.
• Books are lent in class.
• If it's your first time, please come 10 minutes before the class.`,
      questions: [{
        q: 'ホアさんは ひらがなが よめますが、かいわは まだ できません。{月|げつ}ようびから {金|きん}ようびまで、あさから {夕方|ゆうがた} 6{時|じ}まで しごとです。どの クラスが いいですか。',
        en: 'Hoa can read hiragana but can’t hold a conversation yet. She works from morning to 6 in the evening, Monday to Friday. Which class suits her?',
        choices: [
          ['やさしい', 'Easy'],
          ['はじめて', 'Beginners'],
          ['ふつう', 'Standard'],
          ['はなそう', 'Let’s talk'],
        ],
        why: 'Standard and Let’s talk need some conversation, which Hoa doesn’t have yet. Beginners is for learning hiragana — she can already read it — and it’s on a weekday morning, when she works. Easy, on Thursday evening at 7, fits both her level and her hours.',
      }],
      words: [['きょうしつ', '', 'class, classroom'], ['ならう', '', 'to learn'], ['かいわ', '', 'conversation'], ['かんたん', '', 'simple, easy'], ['かす', '', 'to lend'], ['じゅぎょう', '', 'lesson, class']],
    },

    // ─── N4 ──────────────────────────────────────────────────────────────

    {
      id: 'n4-notice-classrooms', level: 'N4', type: 'short', form: 'notice',
      title: 'Building work at school',
      text: `# {学生|がくせい}のみなさんへ
{来週|らいしゅう}の{月曜日|げつようび}から{水曜日|すいようび}まで、2{階|かい}のトイレと{教室|きょうしつ}の{工事|こうじ}をします。この{3日間|みっかかん}、2{階|かい}の{教室|きょうしつ}は{使|つか}えません。«1|2{階|かい}で{授業|じゅぎょう}があるクラスは、1{階|かい}の101{教室|きょうしつ}で{授業|じゅぎょう}をします»。
{図書室|としょしつ}は2{階|かい}にありますが、いつもと{同|おな}じように{使|つか}えます。ただ、{工事|こうじ}の{音|おと}がうるさいので、{静|しず}かに{勉強|べんきょう}したい{人|ひと}は3{階|がい}の{自習室|じしゅうしつ}を{使|つか}ってください。
> さくら{日本語|にほんご}{学校|がっこう}`,
      en: `To all students
From Monday to Wednesday next week there will be building work on the second-floor toilets and classrooms. For these three days the second-floor classrooms can't be used. Classes that are normally on the second floor will be held in room 101 on the ground floor.
The library is on the second floor, but it can be used as usual. However, the work will be noisy, so if you want to study quietly, please use the study room on the third floor.
Sakura Japanese Language School`,
      questions: [{
        q: 'このお{知|し}らせから{分|わ}かることは{何|なん}ですか。',
        en: 'What can you tell from this notice?',
        choices: [
          ['{来週|らいしゅう}の{月曜日|げつようび}から{水曜日|すいようび}まで、2{階|かい}の{教室|きょうしつ}の{授業|じゅぎょう}は101{教室|きょうしつ}でする。', 'From Monday to Wednesday next week, the second-floor classes are held in room 101.'],
          ['{来週|らいしゅう}の{月曜日|げつようび}から{水曜日|すいようび}まで、{図書室|としょしつ}は{使|つか}えない。', 'From Monday to Wednesday next week, the library can’t be used.'],
          ['{静|しず}かに{勉強|べんきょう}したい{人|ひと}は、{図書室|としょしつ}を{使|つか}ったほうがいい。', 'People who want to study quietly should use the library.'],
          ['2{階|かい}のトイレは、{来週|らいしゅう}の{木曜日|もくようび}から{使|つか}えなくなる。', 'The second-floor toilets can’t be used from next Thursday.'],
        ],
        why: 'The third sentence says it: classes normally on the second floor move to room 101. The library is on the second floor but stays open (いつもと同じように使えます) — it’s just noisy, so for quiet study you go to the third-floor study room, not the library. The work is Monday to Wednesday; nothing is said about Thursday.',
      }],
      words: [['{工事|こうじ}', 'こうじ', 'building work, construction'], ['{授業|じゅぎょう}', 'じゅぎょう', 'class, lesson'], ['{図書室|としょしつ}', 'としょしつ', 'library (room)'], ['{自習室|じしゅうしつ}', 'じしゅうしつ', 'self-study room'], ['うるさい', '', 'noisy'], ['ただ', '', 'but, however (adds a condition)']],
    },

    {
      id: 'n4-email-meeting', level: 'N4', type: 'short', form: 'email',
      title: 'Tomorrow’s meeting',
      text: `@{件名|けんめい}|{明日|あした}の{会議|かいぎ}
@{送信者|そうしんしゃ}|{田中|たなか}
{営業部|えいぎょうぶ}のみなさん
お{疲|つか}れさまです。{田中|たなか}です。
{明日|あした}の{会議|かいぎ}ですが、{山田|やまだ}{部長|ぶちょう}が{午前中|ごぜんちゅう}、お{客|きゃく}さんの{会社|かいしゃ}へ{行|い}くことになりました。それで、{会議|かいぎ}の{時間|じかん}を10{時|じ}から{午後|ごご}2{時|じ}に{変|か}えます。{場所|ばしょ}は{同|おな}じ3{階|がい}の{会議室|かいぎしつ}です。
«1|{会議|かいぎ}で{使|つか}う{資料|しりょう}は、{今日|きょう}の5{時|じ}までにわたしに{送|おく}ってください»。わたしがまとめてコピーしておきます。
よろしくお{願|ねが}いします。`,
      en: `Subject: Tomorrow's meeting
From: Tanaka
To everyone in Sales,
Thanks for your hard work. This is Tanaka.
About tomorrow's meeting: Mr Yamada, our manager, now has to visit a client's office in the morning. So I'm moving the meeting from ten in the morning to two in the afternoon. It's in the same place, the meeting room on the third floor.
Please send me the materials for the meeting by 5 o'clock today. I'll copy them all together.
Thank you.`,
      questions: [{
        q: 'このメールを{読|よ}んで、{営業部|えいぎょうぶ}の{人|ひと}は{今日|きょう}、{何|なに}をしなければなりませんか。',
        en: 'After reading this email, what must the people in Sales do today?',
        choices: [
          ['5{時|じ}までに、{会議|かいぎ}の{資料|しりょう}を{田中|たなか}さんに{送|おく}る。', 'Send the meeting materials to Tanaka by 5.'],
          ['{午前|ごぜん}10{時|じ}に、3{階|がい}の{会議室|かいぎしつ}へ{行|い}く。', 'Go to the third-floor meeting room at 10 a.m.'],
          ['{会議|かいぎ}の{資料|しりょう}をコピーして、{山田|やまだ}{部長|ぶちょう}にわたす。', 'Copy the meeting materials and give them to Mr Yamada.'],
          ['{山田|やまだ}{部長|ぶちょう}に、{会議|かいぎ}の{時間|じかん}が{変|か}わったことを{伝|つた}える。', 'Tell Mr Yamada that the meeting time has changed.'],
        ],
        why: '“Today” is the key word: the one job for today is sending your materials to Tanaka by five (今日の5時までに … 送ってください). Tanaka does the copying (わたしが … コピーしておきます), and the meeting itself is tomorrow at 2, not 10.',
      }],
      words: [['{件名|けんめい}', 'けんめい', 'subject (of an email)'], ['{営業部|えいぎょうぶ}', 'えいぎょうぶ', 'sales department'], ['{部長|ぶちょう}', 'ぶちょう', 'department manager'], ['{資料|しりょう}', 'しりょう', 'materials, documents'], ['〜ことになりました', '', 'it has been decided that …'], ['まとめて', '', 'all together']],
    },

    {
      id: 'n4-invite-farewell', level: 'N4', type: 'short', form: 'invite',
      title: 'A farewell party',
      text: `キムさんへ
こんにちは。{来月|らいげつ}、{国|くに}へ{帰|かえ}ることになりました。{日本|にほん}にいる{間|あいだ}、{本当|ほんとう}にお{世話|せわ}になりました。
それで、15{日|にち}の{土曜日|どようび}の{夜|よる}6{時|じ}から、わたしのアパートで{小|ちい}さいパーティーをしようと{思|おも}っています。{料理|りょうり}はわたしが{作|つく}りますが、«1|{飲|の}み{物|もの}はみなさんに{持|も}ってきてもらいたいです»。{来|こ}られるかどうか、«1|{10日|とおか}までに{教|おし}えてください»。
> ジョン`,
      en: `Dear Kim,
Hello. I'm going back to my country next month. Thank you so much for everything while I've been in Japan.
So I'm thinking of having a small party at my flat from 6 p.m. on Saturday the 15th. I'll make the food, but I'd like everyone to bring drinks. Please let me know by the 10th whether you can come.
John`,
      questions: [{
        q: 'キムさんがパーティーに{行|い}くなら、{何|なに}をしなければなりませんか。',
        en: 'If Kim goes to the party, what does she have to do?',
        choices: [
          ['{10日|とおか}までにジョンさんに{返事|へんじ}をして、パーティーの{日|ひ}に{飲|の}み{物|もの}を{持|も}っていく。', 'Reply to John by the 10th, and bring drinks on the day.'],
          ['{10日|とおか}までにジョンさんに{返事|へんじ}をして、パーティーの{日|ひ}に{料理|りょうり}を{作|つく}って{持|も}っていく。', 'Reply to John by the 10th, and make some food to bring on the day.'],
          ['15{日|にち}までにジョンさんに{返事|へんじ}をして、パーティーの{日|ひ}に{飲|の}み{物|もの}を{持|も}っていく。', 'Reply to John by the 15th, and bring drinks on the day.'],
          ['{返事|へんじ}はしないで、パーティーの{日|ひ}に{飲|の}み{物|もの}を{持|も}っていく。', 'Not reply, and bring drinks on the day.'],
        ],
        why: '持ってきてもらいたい — John wants the guests to bring drinks; he’s cooking himself. And 来られるかどうか、10日までに教えてください: tell him by the 10th whether you can come. The 15th is the party itself.',
      }],
      words: [['お{世話|せわ}になりました', 'おせわになりました', 'thank you for all your help'], ['〜ようと{思|おも}っています', 'ようとおもっています', 'I’m thinking of …'], ['{持|も}ってきてもらいたい', 'もってきてもらいたい', 'I’d like (you) to bring'], ['〜かどうか', '', 'whether or not …'], ['{返事|へんじ}', 'へんじ', 'reply']],
    },

    {
      id: 'n4-memo-phone', level: 'N4', type: 'short', form: 'memo',
      title: 'A phone message',
      text: `リーさん
12{時|じ}{半|はん}ごろ、ABC{旅行|りょこう}の{松本|まつもと}さんから{電話|でんわ}がありました。{来週|らいしゅう}の{出張|しゅっちょう}のホテルのことで、{聞|き}きたいことがあるそうです。«1|{松本|まつもと}さんは3{時|じ}まで{会社|かいしゃ}にいないので、3{時|じ}すぎに{電話|でんわ}をしてください»。{電話番号|でんわばんごう}は03-1234-5678です。
それから、{出張|しゅっちょう}の{飛行機|ひこうき}のチケットは、{明日|あした}{届|とど}くそうです。
> {中村|なかむら}　12:40`,
      en: `Mr Lee,
Around 12:30 Ms Matsumoto from ABC Travel phoned. She has a question about the hotel for your business trip next week. She's out of the office until 3, so please call her after 3. Her number is 03-1234-5678.
Also, she says the plane tickets for the trip will arrive tomorrow.
Nakamura, 12:40`,
      questions: [{
        q: 'このメモを{読|よ}んで、リーさんは{何|なに}をしなければなりませんか。',
        en: 'After reading this memo, what must Mr Lee do?',
        choices: [
          ['3{時|じ}すぎに{松本|まつもと}さんに{電話|でんわ}をする。', 'Phone Ms Matsumoto after 3.'],
          ['3{時|じ}までに{松本|まつもと}さんに{電話|でんわ}をする。', 'Phone Ms Matsumoto before 3.'],
          ['ホテルに{電話|でんわ}をして、{聞|き}きたいことを{聞|き}く。', 'Phone the hotel and ask his questions.'],
          ['{明日|あした}、{飛行機|ひこうき}のチケットを{取|と}りに{行|い}く。', 'Go and collect the plane tickets tomorrow.'],
        ],
        why: 'Matsumoto is out until three, so call after three (3時すぎに). It’s Matsumoto who has the question about the hotel (聞きたいことがある — そうです means “she says”), and the tickets come by themselves: 届く means “to be delivered”.',
      }],
      words: [['{出張|しゅっちょう}', 'しゅっちょう', 'business trip'], ['〜そうです', '', 'I hear / they say that …'], ['〜すぎ', '', 'past …, after …'], ['{届|とど}く', 'とどく', 'to arrive, to be delivered']],
    },

    {
      id: 'n4-info-cooking', level: 'N4', type: 'info', form: 'flyer',
      title: 'Autumn cooking classes',
      text: `# みどり{市民|しみん}センター　{秋|あき}の{料理|りょうり}{教室|きょうしつ}
|! {教室|きょうしつ} | {日|ひ}にち | {時間|じかん} | {料金|りょうきん}
| ① {日本|にほん}の{家庭|かてい}{料理|りょうり} | 10{月|がつ}{4日|よっか}・11{日|にち}・18{日|にち}（{土|ど}） | 10:00〜12:00 | 3{回|かい}で4,500{円|えん}
| «1|② かんたんなおかし» | «1|10{月|がつ}{5日|いつか}（{日|にち}）» | «1|14:00〜16:00» | 1,800{円|えん}
| ③ {一人|ひとり}で{作|つく}る{晩|ばん}ご{飯|はん} | 10{月|がつ}{8日|ようか}・15{日|にち}・22{日|にち}（{水|すい}） | 18:30〜20:30 | 3{回|かい}で4,200{円|えん}
| ④ {子|こ}どもといっしょにパン{作|づく}り | 10{月|がつ}12{日|にち}（{日|にち}） | 10:00〜12:00 | {親子|おやこ}で2,500{円|えん}
・{料金|りょうきん}は{材料|ざいりょう}のお{金|かね}です。«2|{最初|さいしょ}の{日|ひ}に{払|はら}ってください»。
・エプロンとタオルを{持|も}ってきてください。
・④は、{小学生|しょうがくせい}とその{親|おや}が{申|もう}し{込|こ}めます。
・«2|{申|もう}し{込|こ}み：9{月|がつ}{20日|はつか}（{土|ど}）の{朝|あさ}9{時|じ}から、{電話|でんわ}か{市民|しみん}センターの{受付|うけつけ}で»。{先|さき}に{申|もう}し{込|こ}んだ{人|ひと}から、それぞれ20{人|にん}までです。`,
      en: `Midori Community Centre — Autumn cooking classes
Class | Dates | Time | Fee
① Japanese home cooking | 4, 11, 18 Oct (Sat) | 10:00–12:00 | 4,500 yen for 3 sessions
② Easy sweets | 5 Oct (Sun) | 14:00–16:00 | 1,800 yen
③ Dinner for one | 8, 15, 22 Oct (Wed) | 18:30–20:30 | 4,200 yen for 3 sessions
④ Bread-making with your child | 12 Oct (Sun) | 10:00–12:00 | 2,500 yen per parent and child
• The fee is for the ingredients. Please pay on the first day.
• Please bring an apron and a towel.
• ④ is for primary-school children and their parents.
• Applications: from 9 a.m. on Saturday 20 September, by phone or at the Community Centre's reception desk. Each class takes the first 20 people to apply.`,
      questions: [{
        q: '{会社員|かいしゃいん}のハンさんは、{平日|へいじつ}は{夜|よる}7{時|じ}まで{仕事|しごと}をしています。{土曜日|どようび}の{午前|ごぜん}はテニスをしています。ハンさんが{一人|ひとり}で{行|い}ける{教室|きょうしつ}はどれですか。',
        en: 'Mr Han is an office worker. On weekdays he works until 7 p.m., and on Saturday mornings he plays tennis. Which class can he go to on his own?',
        choices: [['②', '② Easy sweets'], ['①', '① Japanese home cooking'], ['③', '③ Dinner for one'], ['④', '④ Bread-making with your child']],
        why: 'Check each class against his week: ① is Saturday morning (tennis), ③ starts at 6:30 on a Wednesday (he works till 7), and ④ is for a primary-school child with a parent. ② on Sunday afternoon is free.',
      }, {
        q: '{申|もう}し{込|こ}みについて、{正|ただ}しいものはどれですか。',
        en: 'Which is true about applying?',
        choices: [
          ['9{月|がつ}{20日|はつか}から、{電話|でんわ}か{受付|うけつけ}で{申|もう}し{込|こ}める。', 'From 20 September, you can apply by phone or at the desk.'],
          ['9{月|がつ}{20日|はつか}より{前|まえ}でも、{電話|でんわ}なら{申|もう}し{込|こ}める。', 'You can apply by phone even before 20 September.'],
          ['{料金|りょうきん}は、{申|もう}し{込|こ}むときに{受付|うけつけ}で{払|はら}う。', 'You pay the fee at the desk when you apply.'],
          ['{申|もう}し{込|こ}んだ{人|ひと}は、だれでも{教室|きょうしつ}に{参加|さんか}できる。', 'Everyone who applies can take part.'],
        ],
        why: 'Applications open at 9 a.m. on 20 September, by phone or at the desk — not earlier, by either. The fee is paid on the first day of the class (最初の日に払ってください), and each class takes only the first 20 people (先に申し込んだ人から … 20人まで).',
      }],
      words: [['{料金|りょうきん}', 'りょうきん', 'fee, charge'], ['{家庭|かてい}{料理|りょうり}', 'かていりょうり', 'home cooking'], ['{材料|ざいりょう}', 'ざいりょう', 'ingredients, materials'], ['{親子|おやこ}', 'おやこ', 'parent and child'], ['{申|もう}し{込|こ}む', 'もうしこむ', 'to apply, to sign up'], ['{受付|うけつけ}', 'うけつけ', 'reception desk'], ['それぞれ', '', 'each']],
    },

    {
      id: 'n4-info-museum', level: 'N4', type: 'info', form: 'flyer',
      title: 'Museum tickets',
      text: `# みどり{美術館|びじゅつかん}
{入館料|にゅうかんりょう}
|! | {大人|おとな} | {大学生|だいがくせい} | {高校生|こうこうせい}{以下|いか}
| {一人|ひとり} | 1,200{円|えん} | «1|800{円|えん}» | «1|{無料|むりょう}»
| 20{人|にん}{以上|いじょう}のグループ（{一人|ひとり}） | 1,000{円|えん} | 600{円|えん} | {無料|むりょう}
・«1|65{歳|さい}{以上|いじょう}の{方|かた}は、{大人|おとな}の{料金|りょうきん}の{半分|はんぶん}です»。{年|とし}が{分|わ}かる{物|もの}を{見|み}せてください。
・{毎月|まいつき}{第|だい}1{日曜日|にちようび}は、だれでも{無料|むりょう}です。
・{特別展|とくべつてん}「{江戸|えど}の{着物|きもの}」（4{月|がつ}{1日|ついたち}〜5{月|がつ}31{日|にち}）を{見|み}る{方|かた}は、{入館料|にゅうかんりょう}のほかに500{円|えん}かかります。
・{館内|かんない}で{写真|しゃしん}をとることはできません。
・{車|くるま}いすを{無料|むりょう}で{貸|か}しています。{受付|うけつけ}で{言|い}ってください。
{開館|かいかん}{時間|じかん}：{午前|ごぜん}9{時|じ}30{分|ぷん}〜{午後|ごご}5{時|じ}（«2|{入館|にゅうかん}は{午後|ごご}4{時|じ}30{分|ぷん}まで»）
{休館日|きゅうかんび}：«2|{月曜日|げつようび}（{月曜日|げつようび}が{祝日|しゅくじつ}の{時|とき}は、{次|つぎ}の{火曜日|かようび}）»`,
      en: `Midori Art Museum
Admission
 | Adults | University students | High-school students and younger
One person | 1,200 yen | 800 yen | Free
Groups of 20 or more (per person) | 1,000 yen | 600 yen | Free
• Visitors aged 65 and over pay half the adult price. Please show something with your age on it.
• Admission is free for everyone on the first Sunday of every month.
• Visitors to the special exhibition "Kimono of Edo" (1 April–31 May) pay 500 yen on top of admission.
• Photography is not allowed inside the museum.
• Wheelchairs can be borrowed free of charge. Please ask at reception.
Opening hours: 9:30 a.m.–5 p.m. (last entry 4:30 p.m.)
Closed: Mondays (when Monday is a public holiday, the following Tuesday)`,
      questions: [{
        q: '{大学生|だいがくせい}のマイさんは、11{月|がつ}の{第|だい}2{土曜日|どようび}に、70{歳|さい}のおばあさんと{高校生|こうこうせい}の{弟|おとうと}と3{人|にん}で{行|い}きます。3{人|にん}で{全部|ぜんぶ}でいくら{払|はら}いますか。',
        en: 'Mai, a university student, goes on the second Saturday of November with her 70-year-old grandmother and her brother, who is in high school. How much do the three of them pay in total?',
        choices: [['1,400{円|えん}', '1,400 yen'], ['0{円|えん}', '0 yen'], ['2,000{円|えん}', '2,000 yen'], ['2,800{円|えん}', '2,800 yen']],
        why: 'Mai pays the student price, 800 yen. Her grandmother is over 65, so half the adult price: 600 yen. Her brother is in high school: free. 800 + 600 + 0 = 1,400. It’s the second Saturday, not the first Sunday, so the free day doesn’t apply.',
      }, {
        q: '{美術館|びじゅつかん}に{入|はい}れるのはどれですか。',
        en: 'When can you get into the museum?',
        choices: [
          ['{祝日|しゅくじつ}の{月曜日|げつようび}の{午後|ごご}3{時|じ}', '3 p.m. on a Monday that’s a public holiday'],
          ['{祝日|しゅくじつ}ではない{月曜日|げつようび}の{午前|ごぜん}10{時|じ}', '10 a.m. on a Monday that isn’t a holiday'],
          ['{日曜日|にちようび}の{午後|ごご}4{時|じ}45{分|ふん}', '4:45 p.m. on a Sunday'],
          ['{祝日|しゅくじつ}の{月曜日|げつようび}の{次|つぎ}の{日|ひ}の{午前|ごぜん}11{時|じ}', '11 a.m. on the day after a holiday Monday'],
        ],
        why: 'Mondays are normally closed — but when Monday is a public holiday the museum opens, and closes on the Tuesday after instead. So the holiday Monday works and the Tuesday after it doesn’t. 4:45 is too late: last entry is 4:30 (入館は午後4時30分まで).',
      }],
      words: [['{美術館|びじゅつかん}', 'びじゅつかん', 'art museum'], ['{入館料|にゅうかんりょう}', 'にゅうかんりょう', 'admission fee'], ['{無料|むりょう}', 'むりょう', 'free (of charge)'], ['{以上|いじょう} / {以下|いか}', 'いじょう / いか', '… or more / … or less'], ['{半分|はんぶん}', 'はんぶん', 'half'], ['{休館日|きゅうかんび}', 'きゅうかんび', 'closing day'], ['{祝日|しゅくじつ}', 'しゅくじつ', 'public holiday']],
    },

    {
      id: 'n4-email-absent', level: 'N4', type: 'short', form: 'email',
      title: 'Off sick tomorrow',
      text: `@{件名|けんめい}|{明日|あした}の{授業|じゅぎょう}を{休|やす}みます
@{送信者|そうしんしゃ}|グエン・ミン
{佐藤|さとう}{先生|せんせい}
グエンです。{昨日|きのう}の{夜|よる}から{熱|ねつ}があるので、{明日|あした}の{授業|じゅぎょう}を{休|やす}ませてください。
{明日|あした}{出|だ}す{宿題|しゅくだい}の{作文|さくぶん}は、もう{書|か}きました。«1|{同|おな}じクラスのリンさんに{渡|わた}しておきますので、リンさんから{受|う}け{取|と}ってください»。
{来週|らいしゅう}の{月曜日|げつようび}には{行|い}けると{思|おも}います。どうぞよろしくお{願|ねが}いします。`,
      en: `Subject: Missing class tomorrow
From: Nguyen Minh
Dear Ms Sato,
This is Nguyen. I've had a fever since last night, so please let me miss class tomorrow.
I've already written the essay that's due tomorrow. I'll give it to Lin, who's in the same class, so please get it from her.
I think I'll be able to come on Monday next week. Thank you.`,
      questions: [{
        q: 'グエンさんは、{宿題|しゅくだい}の{作文|さくぶん}をどうしますか。',
        en: 'What will Nguyen do with the essay homework?',
        choices: [
          ['リンさんに{渡|わた}して、{先生|せんせい}に{出|だ}してもらう。', 'Give it to Lin, who hands it in to the teacher.'],
          ['{明日|あした}、{自分|じぶん}で{学校|がっこう}へ{持|も}っていく。', 'Take it to school himself tomorrow.'],
          ['メールで{先生|せんせい}に{送|おく}る。', 'Email it to the teacher.'],
          ['{来週|らいしゅう}の{月曜日|げつようび}に、{先生|せんせい}に{出|だ}す。', 'Hand it in to the teacher next Monday.'],
        ],
        why: 'The essay is done; Nguyen will leave it with Lin (渡しておきます) and asks the teacher to collect it from her (リンさんから受け取ってください). Monday is when Nguyen expects to be back, not when the essay comes in.',
      }],
      words: [['{熱|ねつ}', 'ねつ', 'fever'], ['{休|やす}ませてください', 'やすませてください', 'please let me take time off'], ['{作文|さくぶん}', 'さくぶん', 'essay, composition'], ['{渡|わた}しておく', 'わたしておく', 'to hand over (in advance)'], ['{受|う}け{取|と}る', 'うけとる', 'to receive, collect']],
    },

    {
      id: 'n4-notice-bicycles', level: 'N4', type: 'short', form: 'notice',
      title: 'Bicycles at the dorm',
      text: `# {自転車|じてんしゃ}を{使|つか}っている{人|ひと}へ
{寮|りょう}の{自転車|じてんしゃ}{置|お}き{場|ば}に、だれも{使|つか}っていない{自転車|じてんしゃ}がたくさんあって、{困|こま}っています。
«1|{使|つか}っている{自転車|じてんしゃ}には、11{月|がつ}30{日|にち}までに、{名前|なまえ}と{部屋|へや}の{番号|ばんごう}を{書|か}いたシールをはってください»。シールは{事務所|じむしょ}でもらえます。
12{月|がつ}になってもシールがはっていない{自転車|じてんしゃ}は、{寮|りょう}が{捨|す}てます。
> さくら{寮|りょう}　{事務所|じむしょ}`,
      en: `To everyone who uses a bicycle
The dormitory's bicycle park is full of bicycles nobody uses, and this is a problem.
By 30 November, please put a sticker with your name and room number on any bicycle you use. You can get stickers at the office.
Bicycles that still have no sticker in December will be thrown away by the dormitory.
Sakura Dormitory office`,
      questions: [{
        q: '{自転車|じてんしゃ}を{使|つか}っている{人|ひと}は、どうしなければなりませんか。',
        en: 'What must people who use a bicycle do?',
        choices: [
          ['11{月|がつ}30{日|にち}までに、{事務所|じむしょ}でシールをもらって{自転車|じてんしゃ}にはる。', 'By 30 November, get a sticker at the office and put it on their bicycle.'],
          ['11{月|がつ}30{日|にち}までに、{自転車|じてんしゃ}を{事務所|じむしょ}に{持|も}っていく。', 'By 30 November, take their bicycle to the office.'],
          ['12{月|がつ}になったら、{自転車|じてんしゃ}{置|お}き{場|ば}から{自転車|じてんしゃ}を{出|だ}す。', 'Take their bicycle out of the bicycle park in December.'],
          ['12{月|がつ}までに、{使|つか}っていない{自転車|じてんしゃ}を{捨|す}てる。', 'Throw away unused bicycles before December.'],
        ],
        why: 'The request is the sticker: name and room number, on your bicycle, by 30 November; the stickers come from the office. Throwing away the unmarked bicycles is what the dormitory will do (寮が捨てます), not the students.',
      }],
      words: [['{寮|りょう}', 'りょう', 'dormitory'], ['{自転車|じてんしゃ}{置|お}き{場|ば}', 'じてんしゃおきば', 'bicycle park'], ['{困|こま}る', 'こまる', 'to have a problem'], ['はる', '', 'to stick on'], ['{捨|す}てる', 'すてる', 'to throw away']],
    },

    {
      id: 'n4-memo-gas', level: 'N4', type: 'short', form: 'memo',
      title: 'A note to a flatmate',
      text: `サラへ
{今日|きょう}の{午後|ごご}、ガス{会社|がいしゃ}の{人|ひと}が{点検|てんけん}に{来|く}ることになったよ。2{時|じ}から4{時|じ}の{間|あいだ}に{来|く}るそうだ。わたしはアルバイトがあって{家|いえ}にいないから、サラが{家|いえ}にいてくれる？
«1|もし{無理|むり}なら、ガス{会社|がいしゃ}に{電話|でんわ}して、{別|べつ}の{日|ひ}にしてもらって»。{電話番号|でんわばんごう}は{冷蔵庫|れいぞうこ}にはってあるよ。
> まゆみ`,
      en: `Sarah,
Someone from the gas company is coming this afternoon to do an inspection. They say they'll come between 2 and 4. I've got my part-time job and won't be home, so could you be in?
If you can't, phone the gas company and ask them to make it another day. The number is stuck on the fridge.
Mayumi`,
      questions: [{
        q: 'サラさんが{今日|きょう}の{午後|ごご}{出|で}かけるなら、{何|なに}をしなければなりませんか。',
        en: 'If Sarah goes out this afternoon, what must she do?',
        choices: [
          ['ガス{会社|がいしゃ}に{電話|でんわ}して、{点検|てんけん}の{日|ひ}を{変|か}えてもらう。', 'Phone the gas company and get the inspection moved.'],
          ['まゆみさんに{電話|でんわ}して、{家|いえ}にいてもらう。', 'Phone Mayumi and ask her to stay home.'],
          ['2{時|じ}から4{時|じ}まで、{家|いえ}でガス{会社|がいしゃ}の{人|ひと}を{待|ま}つ。', 'Wait at home for the gas company from 2 to 4.'],
          ['{冷蔵庫|れいぞうこ}に{電話番号|でんわばんごう}をはっておく。', 'Stick the phone number on the fridge.'],
        ],
        why: 'もし無理なら — “if you can’t (be home)” — is exactly Sarah’s case: then she should call the gas company and have them come another day (別の日にしてもらって). Waiting at home is what Mayumi hoped for if Sarah stays in; the number is already on the fridge.',
      }],
      words: [['{点検|てんけん}', 'てんけん', 'inspection'], ['〜てくれる？', 'てくれる', 'could you …? (casual)'], ['{無理|むり}', 'むり', 'impossible, too much'], ['{別|べつ}の', 'べつの', 'another, different'], ['〜てもらって', 'てもらって', 'get (them) to … (casual request)']],
    },

    {
      id: 'n4-letter-thanks', level: 'N4', type: 'short', form: 'letter',
      title: 'A letter after a homestay',
      text: `{田中|たなか}さんのお{父|とう}さん、お{母|かあ}さん
お{元気|げんき}ですか。{先月|せんげつ}はホームステイでたいへんお{世話|せわ}になりました。お{母|かあ}さんの{料理|りょうり}は、{毎日|まいにち}とてもおいしかったです。
{国|くに}に{帰|かえ}ってから、{家族|かぞく}に{日本|にほん}の{料理|りょうり}を{作|つく}ってあげました。«1|それで、お{願|ねが}いがあるのですが、お{母|かあ}さんの{肉|にく}じゃがの{作|つく}り{方|かた}を{教|おし}えていただけませんか»。{家族|かぞく}にもう{一度|いちど}{食|た}べさせたいのです。
また{日本|にほん}に{行|い}ったら、ぜひ{会|あ}いに{行|い}きます。
> アンナ`,
      en: `Dear Mr and Mrs Tanaka,
How are you? Thank you so much for everything during my homestay last month. Your cooking was delicious every day.
Since I got home I've cooked Japanese food for my family. So I have a favour to ask: could you tell me how you make your nikujaga? I'd like my family to have it again.
When I'm next in Japan, I'll be sure to come and see you.
Anna`,
      questions: [{
        q: 'アンナさんがこの{手紙|てがみ}で{一番|いちばん}{言|い}いたいことは{何|なん}ですか。',
        en: 'What does Anna most want to say in this letter?',
        choices: [
          ['{肉|にく}じゃがの{作|つく}り{方|かた}を{教|おし}えてほしい。', 'She’d like to be told how to make nikujaga.'],
          ['{家族|かぞく}に{日本|にほん}の{料理|りょうり}を{作|つく}ってあげた。', 'She cooked Japanese food for her family.'],
          ['ホームステイの{料理|りょうり}がおいしかった。', 'The food at her homestay was delicious.'],
          ['もう{一度|いちど}{日本|にほん}に{行|い}きたい。', 'She wants to go to Japan again.'],
        ],
        why: 'The thanks and the cooking at home are true but lead up to the point: お願いがあるのですが (“I have a favour to ask”) … 教えていただけませんか. In letters, お願いがあるのですが is a strong signal that the main point comes next.',
      }],
      words: [['お{世話|せわ}になりました', 'おせわになりました', 'thank you for looking after me'], ['〜てあげる', 'てあげる', 'to do … for someone'], ['お{願|ねが}いがあるのですが', 'おねがいがあるのですが', 'I have a favour to ask'], ['〜ていただけませんか', 'ていただけませんか', 'could you please …?'], ['{食|た}べさせる', 'たべさせる', 'to let / have (someone) eat']],
    },

    {
      id: 'n4-info-library', level: 'N4', type: 'info', form: 'flyer',
      title: 'Borrowing from the library',
      text: `# さくら{市立|しりつ}{図書館|としょかん}　{本|ほん}の{借|か}り{方|かた}
|! | {借|か}りられる{数|かず} | {借|か}りられる{日数|にっすう}
| «1|{本|ほん}・{雑誌|ざっし}» | «1|10{冊|さつ}まで» | «2|2{週間|しゅうかん}»
| «1|CD・DVD» | «1|3{枚|まい}まで» | 1{週間|しゅうかん}
| «1|{新|あたら}しい{雑誌|ざっし}（{今月|こんげつ}の{号|ごう}）» | «1|{借|か}りられません» | ―
・{図書館|としょかん}カードを{作|つく}る{時|とき}は、{住所|じゅうしょ}が{分|わ}かるもの（{在留|ざいりゅう}カードなど）を{持|も}ってきてください。
・{市内|しない}に{住|す}んでいる{人|ひと}と、{市内|しない}の{学校|がっこう}や{会社|かいしゃ}に{通|かよ}っている{人|ひと}が{作|つく}れます。
・«2|もう{一度|いちど}{借|か}りたい{時|とき}は、{返|かえ}す{日|ひ}までに{電話|でんわ}かインターネットで{連絡|れんらく}してください。1{回|かい}だけ、{同|おな}じ{日数|にっすう}{延|の}ばせます»。（ほかの{人|ひと}が{予約|よやく}している{物|もの}はできません。）
・{休館日|きゅうかんび}：{毎週|まいしゅう}{月曜日|げつようび}`,
      en: `Sakura City Library — how to borrow
 | How many | For how long
Books, magazines | Up to 10 | 2 weeks
CDs, DVDs | Up to 3 | 1 week
New magazines (this month's issue) | Can't be borrowed | —
• To make a library card, bring something that shows your address (such as a residence card).
• Cards are for people who live in the city, or who go to school or work in the city.
• If you want to borrow something again, contact us by phone or online by the return date. You can extend it once, for the same length of time. (Not for items someone else has reserved.)
• Closed: every Monday`,
      questions: [{
        q: 'チェンさんは、{本|ほん}を5{冊|さつ}と、DVDを2{枚|まい}と、{今月|こんげつ}の{雑誌|ざっし}を1{冊|さつ}{借|か}りたいと{思|おも}っています。チェンさんが{借|か}りられるものはどれですか。',
        en: 'Chen would like to borrow 5 books, 2 DVDs and 1 copy of this month’s magazine. What can Chen borrow?',
        choices: [
          ['{本|ほん}5{冊|さつ}とDVD2{枚|まい}', '5 books and 2 DVDs'],
          ['{本|ほん}5{冊|さつ}と{今月|こんげつ}の{雑誌|ざっし}1{冊|さつ}', '5 books and this month’s magazine'],
          ['{本|ほん}5{冊|さつ}とDVD2{枚|まい}と{今月|こんげつ}の{雑誌|ざっし}1{冊|さつ}', '5 books, 2 DVDs and this month’s magazine'],
          ['{本|ほん}5{冊|さつ}だけ', 'Only the 5 books'],
        ],
        why: 'Five books is under the limit of 10, two DVDs under the limit of 3 — but this month’s issue of a magazine can’t be borrowed at all (借りられません).',
      }, {
        q: 'チェンさんは10{月|がつ}{1日|ついたち}に{本|ほん}を{借|か}りました。まだ{読|よ}み{終|お}わっていないので、もう{少|すこ}し{借|か}りたいです。どうすればいいですか。',
        en: 'Chen borrowed a book on 1 October. Not having finished it, Chen would like to keep it a bit longer. What should Chen do?',
        choices: [
          ['10{月|がつ}15{日|にち}までに{電話|でんわ}かインターネットで{連絡|れんらく}して、2{週間|しゅうかん}{延|の}ばす。', 'Phone or go online by 15 October and extend it by 2 weeks.'],
          ['10{月|がつ}15{日|にち}に{図書館|としょかん}へ{行|い}って、{新|あたら}しいカードを{作|つく}る。', 'Go to the library on 15 October and make a new card.'],
          ['10{月|がつ}{8日|ようか}までに{連絡|れんらく}して、1{週間|しゅうかん}{延|の}ばす。', 'Get in touch by 8 October and extend it by 1 week.'],
          ['{本|ほん}を{返|かえ}さないで、{何回|なんかい}でも{延|の}ばす。', 'Keep extending it as often as Chen likes without returning it.'],
        ],
        why: 'Books are lent for 2 weeks, so it’s due back on 15 October. Before then Chen contacts the library by phone or online, and can extend it once, for the same length — another 2 weeks. A week is the period for CDs and DVDs.',
      }],
      words: [['{借|か}りる', 'かりる', 'to borrow'], ['{雑誌|ざっし}', 'ざっし', 'magazine'], ['{号|ごう}', 'ごう', 'issue (of a magazine)'], ['{在留|ざいりゅう}カード', 'ざいりゅうカード', 'residence card'], ['{延|の}ばす', 'のばす', 'to extend'], ['{予約|よやく}', 'よやく', 'reservation']],
    },

    {
      id: 'n4-info-bustour', level: 'N4', type: 'info', form: 'flyer',
      title: 'Day trips by bus',
      text: `# {日帰|ひがえ}りバスツアー　11{月|がつ}のご{案内|あんない}
|! コース | {日|ひ}にち | {時間|じかん} | {大人|おとな} | {子|こ}ども
| «1|A　{富士山|ふじさん}と{湖|みずうみ}» | «1|11{月|がつ}{3日|みっか}・17{日|にち}（{日|にち}）» | 7:30〜19:00 | 8,000{円|えん} | 5,000{円|えん}
| B　{京都|きょうと}のお{寺|てら} | 11{月|がつ}{9日|ここのか}・23{日|にち}（{土|ど}） | 7:00〜20:30 | 9,500{円|えん} | 6,000{円|えん}
| C　みかんがり | 11{月|がつ}{10日|とおか}・24{日|にち}（{日|にち}） | 8:30〜17:00 | «2|6,500{円|えん}» | 4,000{円|えん}
| D　{温泉|おんせん}とおいしい{昼|ひる}ご{飯|はん} | {毎週|まいしゅう}{水曜日|すいようび} | 9:00〜18:00 | 7,000{円|えん} | ―
・{子|こ}どもの{料金|りょうきん}は{小学生|しょうがくせい}です。«2|{小学生|しょうがくせい}より{小|ちい}さい{子|こ}どもは{無料|むりょう}です»。
・Dは、{中学生|ちゅうがくせい}{以上|いじょう}の{方|かた}だけ{申|もう}し{込|こ}めます。
・«1|{料金|りょうきん}には{昼|ひる}ご{飯|はん}が{入|はい}っています（Cは、{昼|ひる}ご{飯|はん}はありません。お{弁当|べんとう}を{持|も}ってきてください）»。
・{出発|しゅっぱつ}の{場所|ばしょ}：さくら{駅|えき}{北口|きたぐち}　{申|もう}し{込|こ}み：{出発|しゅっぱつ}の{3日|みっか}{前|まえ}まで`,
      en: `Day trips by bus — November
Course | Dates | Times | Adults | Children
A Mount Fuji and the lakes | 3 and 17 Nov (Sun) | 7:30–19:00 | 8,000 yen | 5,000 yen
B Temples of Kyoto | 9 and 23 Nov (Sat) | 7:00–20:30 | 9,500 yen | 6,000 yen
C Mandarin picking | 10 and 24 Nov (Sun) | 8:30–17:00 | 6,500 yen | 4,000 yen
D Hot springs and a good lunch | Every Wednesday | 9:00–18:00 | 7,000 yen | —
• The children's price is for primary-school children. Children younger than primary-school age go free.
• D is only for people of junior-high age and over.
• Lunch is included in the price (except C, which has no lunch: please bring a packed lunch).
• Departure: Sakura Station north exit; applications up to 3 days before departure.`,
      questions: [{
        q: '{山本|やまもと}さんは、11{月|がつ}の{日曜日|にちようび}に、{妻|つま}と{小学生|しょうがくせい}の{息子|むすこ}と3{人|にん}で{行|い}きたいと{思|おも}っています。{昼|ひる}ご{飯|はん}が{料金|りょうきん}に{入|はい}っているコースがいいです。どのコースにしますか。',
        en: 'Mr Yamamoto wants to go on a Sunday in November with his wife and his son, who is at primary school. He wants a course with lunch included. Which course does he choose?',
        choices: [['A', 'A'], ['B', 'B'], ['C', 'C'], ['D', 'D']],
        why: 'Sundays rule out B (Saturdays) and D (Wednesdays — and D isn’t for children). That leaves A and C, and C has no lunch (Cは、昼ご飯はありません). So A.',
      }, {
        q: '{田中|たなか}さんは、{大学生|だいがくせい}の{娘|むすめ}と4{歳|さい}の{娘|むすめ}と3{人|にん}で、Cのコースに{行|い}きます。3{人|にん}で{全部|ぜんぶ}でいくらですか。',
        en: 'Ms Tanaka is going on course C with her daughter, a university student, and her four-year-old daughter. How much is it for the three of them?',
        choices: [['13,000{円|えん}', '13,000 yen'], ['10,500{円|えん}', '10,500 yen'], ['17,000{円|えん}', '17,000 yen'], ['19,500{円|えん}', '19,500 yen']],
        why: 'A university student pays the adult price, so that’s 6,500 × 2 = 13,000. The four-year-old is younger than primary-school age, so free. The children’s price (4,000) is only for primary-school children.',
      }],
      words: [['{日帰|ひがえ}り', 'ひがえり', 'day trip'], ['みかんがり', '', 'mandarin picking'], ['{温泉|おんせん}', 'おんせん', 'hot spring'], ['{小学生|しょうがくせい}', 'しょうがくせい', 'primary-school child'], ['{無料|むりょう}', 'むりょう', 'free (of charge)'], ['{出発|しゅっぱつ}', 'しゅっぱつ', 'departure']],
    },

    {
      id: 'n4-email-club', level: 'N4', type: 'short', form: 'email',
      title: 'Saturday’s tennis practice',
      text: `@{件名|けんめい}|{土曜日|どようび}の{練習|れんしゅう}について
@{送信|そうしん}{者|しゃ}|テニス{部|ぶ}　{高田|たかだ}
テニス{部|ぶ}のみなさん
{今週|こんしゅう}の{土曜日|どようび}は{雨|あめ}の{予報|よほう}なので、«1|{練習|れんしゅう}は{外|そと}のコートではなく、{体育館|たいいくかん}でします»。{時間|じかん}は{同|おな}じ9{時|じ}からです。
«1|{体育館|たいいくかん}に{入|はい}るときは、{中|なか}で{使|つか}う{靴|くつ}が{必要|ひつよう}です»。ラケットは{部|ぶ}のものを{貸|か}すので、{持|も}ってこなくてもいいです。
{練習|れんしゅう}の{後|あと}、みんなで{昼|ひる}ご{飯|はん}を{食|た}べに{行|い}きましょう。`,
      en: `Subject: About Saturday's practice
From: Takada, tennis club
To everyone in the tennis club,
Rain is forecast for this Saturday, so practice will be in the gym, not on the outdoor courts. It starts at the same time, 9 o'clock.
You need indoor shoes to go into the gym. You don't need to bring a racket, because the club will lend you one.
After practice, let's all go and have lunch.`,
      questions: [{
        q: '{土曜日|どようび}の{練習|れんしゅう}に{行|い}く{人|ひと}は、どうしなければなりませんか。',
        en: 'What must people going to Saturday’s practice do?',
        choices: [
          ['9{時|じ}に{体育館|たいいくかん}へ{行|い}く。{体育館|たいいくかん}で{使|つか}う{靴|くつ}を{持|も}っていく。', 'Go to the gym at 9, with indoor shoes.'],
          ['9{時|じ}に{外|そと}のコートへ{行|い}く。ラケットを{持|も}っていく。', 'Go to the outdoor courts at 9, with a racket.'],
          ['9{時|じ}に{体育館|たいいくかん}へ{行|い}く。ラケットを{持|も}っていく。', 'Go to the gym at 9, with a racket.'],
          ['9{時|じ}に{外|そと}のコートへ{行|い}く。{体育館|たいいくかん}で{使|つか}う{靴|くつ}を{持|も}っていく。', 'Go to the outdoor courts at 9, with indoor shoes.'],
        ],
        why: 'Two halves: the place moves to the gym (外のコートではなく、体育館で), and what to bring is indoor shoes (中で使う靴が必要です). Rackets are lent by the club — 持ってこなくてもいい, “you don’t have to bring one”.',
      }],
      words: [['{練習|れんしゅう}', 'れんしゅう', 'practice'], ['{予報|よほう}', 'よほう', 'forecast'], ['{体育館|たいいくかん}', 'たいいくかん', 'gym, sports hall'], ['〜ではなく', '', 'not …, but'], ['{貸|か}す', 'かす', 'to lend'], ['〜なくてもいい', '', 'don’t have to …']],
    },

    {
      id: 'n4-notice-elevator', level: 'N4', type: 'short', form: 'notice',
      title: 'Lift inspection',
      text: `# エレベーター{点検|てんけん}のお{知|し}らせ
{住|す}んでいるみなさんへ
«1|10{月|がつ}{20日|はつか}（{火|か}）の{午後|ごご}1{時|じ}から4{時|じ}まで、エレベーターの{点検|てんけん}をします»。«1|この{間|あいだ}、エレベーターは{使|つか}えません»ので、{階段|かいだん}を{使|つか}ってください。
{車|くるま}いすを{使|つか}っている{方|かた}や、{重|おも}い{荷物|にもつ}がある{方|かた}は、{前|まえ}の{日|ひ}までに{管理人|かんりにん}にご{連絡|れんらく}ください。
> さくらマンション　{管理人|かんりにん}`,
      en: `Notice of lift inspection
To all residents
The lift will be inspected on Tuesday 20 October from 1 to 4 in the afternoon. During this time the lift can't be used, so please use the stairs.
If you use a wheelchair or have heavy luggage, please contact the manager by the day before.
Sakura Mansion, manager`,
      questions: [{
        q: 'このお{知|し}らせで{一番|いちばん}{伝|つた}えたいことは{何|なん}ですか。',
        en: 'What does this notice most want to say?',
        choices: [
          ['{20日|はつか}の{午後|ごご}、エレベーターが{使|つか}えないこと', 'That the lift can’t be used on the afternoon of the 20th'],
          ['{20日|はつか}の{午後|ごご}、{階段|かいだん}の{点検|てんけん}をすること', 'That the stairs are being inspected on the afternoon of the 20th'],
          ['{重|おも}い{荷物|にもつ}は、{管理人|かんりにん}が{運|はこ}ぶこと', 'That the manager will carry heavy luggage'],
          ['{車|くるま}いすを{貸|か}すこと', 'That wheelchairs can be borrowed'],
        ],
        why: 'The notice exists to say the lift is out of action from 1 to 4 on the 20th — so use the stairs. The last line only asks people who would have trouble with the stairs to get in touch; it doesn’t say the manager will carry anything.',
      }],
      words: [['{点検|てんけん}', 'てんけん', 'inspection'], ['{階段|かいだん}', 'かいだん', 'stairs'], ['{車|くるま}いす', 'くるまいす', 'wheelchair'], ['{荷物|にもつ}', 'にもつ', 'luggage, things to carry'], ['{管理人|かんりにん}', 'かんりにん', '(building) manager'], ['ご{連絡|れんらく}ください', 'ごれんらくください', 'please contact (us)']],
    },

    {
      id: 'n4-memo-report', level: 'N4', type: 'short', form: 'memo',
      title: 'The wrong theme',
      text: `ジェイソンさん
{先週|せんしゅう}{出|だ}してもらったレポートですが、テーマが{違|ちが}っていました。«1|{今回|こんかい}のテーマは「わたしの{町|まち}」です»。「わたしの{国|くに}」は{来月|らいげつ}のテーマです。
«1|もう{一度|いちど}{書|か}いて、{今週|こんしゅう}の{金曜日|きんようび}までに{出|だ}してください»。{書|か}いたレポートは{来月|らいげつ}{使|つか}えるので、{捨|す}てないでください。
> {木村|きむら}`,
      en: `Jason,
The report you handed in last week was on the wrong theme. This time the theme is "My town". "My country" is next month's theme.
Please write it again and hand it in by Friday this week. You can use the report you wrote next month, so don't throw it away.
Kimura`,
      questions: [{
        q: 'ジェイソンさんは{何|なに}をしなければなりませんか。',
        en: 'What must Jason do?',
        choices: [
          ['「わたしの{町|まち}」のレポートを{書|か}いて、{金曜日|きんようび}までに{出|だ}す。', 'Write a report on “My town” and hand it in by Friday.'],
          ['「わたしの{国|くに}」のレポートを{書|か}き{直|なお}して、{金曜日|きんようび}までに{出|だ}す。', 'Rewrite the “My country” report and hand it in by Friday.'],
          ['{来月|らいげつ}、「わたしの{町|まち}」のレポートを{出|だ}す。', 'Hand in a “My town” report next month.'],
          ['{書|か}いたレポートを{捨|す}てて、{新|あたら}しいテーマを{考|かんが}える。', 'Throw away the report and think of a new theme.'],
        ],
        why: 'Jason wrote about “My country”, which is next month’s theme; this time it’s “My town”, due this Friday (今週の金曜日までに). The old report is kept for next month — 捨てないでください.',
      }],
      words: [['レポート', '', 'report, essay'], ['{違|ちが}う', 'ちがう', 'to be wrong, different'], ['{今回|こんかい}', 'こんかい', 'this time'], ['テーマ', '', 'theme, topic'], ['もう{一度|いちど}', 'もういちど', 'once more'], ['{捨|す}てる', 'すてる', 'to throw away']],
    },

    {
      id: 'n4-letter-visit', level: 'N4', type: 'short', form: 'letter',
      title: 'A friend is coming to Japan',
      text: `ゆきさんへ
お{元気|げんき}ですか。{来年|らいねん}の3{月|がつ}に、{家族|かぞく}と{日本|にほん}へ{旅行|りょこう}に{行|い}くことになりました。{東京|とうきょう}に{一週間|いっしゅうかん}ぐらいいる{予定|よてい}です。
«1|ゆきさんは{東京|とうきょう}に{住|す}んでいるので、{子|こ}どもといっしょに{楽|たの}しめる{場所|ばしょ}を{教|おし}えてくれませんか»。{両親|りょうしん}は{古|ふる}いお{寺|てら}が{見|み}たいそうです。
{会|あ}えるのを{楽|たの}しみにしています。
> マリア`,
      en: `Dear Yuki,
How are you? Next March I'm going on a trip to Japan with my family. We plan to stay in Tokyo for about a week.
You live in Tokyo, so could you tell me some places where we can have fun with children? My parents say they'd like to see old temples.
I'm looking forward to seeing you.
Maria`,
      questions: [{
        q: 'マリアさんがこの{手紙|てがみ}で{一番|いちばん}{言|い}いたいことは{何|なん}ですか。',
        en: 'What does Maria most want to say in this letter?',
        choices: [
          ['{子|こ}どもと{楽|たの}しめる{場所|ばしょ}を{教|おし}えてほしい。', 'She’d like to be told places to enjoy with children.'],
          ['{東京|とうきょう}で{古|ふる}いお{寺|てら}が{見|み}たい。', 'She wants to see old temples in Tokyo.'],
          ['{来年|らいねん}の3{月|がつ}から{日本|にほん}に{住|す}む。', 'She will live in Japan from next March.'],
          ['ゆきさんの{家|いえ}に{泊|と}まりたい。', 'She’d like to stay at Yuki’s house.'],
        ],
        why: 'The trip is the background; the request is 〜を教えてくれませんか, “could you tell me …?”: places to have fun with children. It’s her parents who want to see temples (見たいそうです — “they say”).',
      }],
      words: [['{旅行|りょこう}', 'りょこう', 'trip'], ['{予定|よてい}', 'よてい', 'plan'], ['{楽|たの}しめる', 'たのしめる', 'can enjoy'], ['〜てくれませんか', '', 'could you … (for me)?'], ['{両親|りょうしん}', 'りょうしん', 'parents'], ['〜そうです', '', 'they say …, I hear …']],
    },

    {
      id: 'n4-notice-lost', level: 'N4', type: 'short', form: 'notice',
      title: 'Lost property',
      text: `# {忘|わす}れ{物|もの}のお{知|し}らせ
{先週|せんしゅう}の{日本語|にほんご}スピーチ{大会|たいかい}の{後|あと}、ホールに{次|つぎ}の{物|もの}が{忘|わす}れてありました。
・{青|あお}いかさ　・{黒|くろ}い{手|て}ぶくろ　・{名前|なまえ}のないノート
«1|{自分|じぶん}の{物|もの}だと{思|おも}う{人|ひと}は、{事務|じむ}{室|しつ}に{取|と}りに{来|き}てください»。«1|{今月|こんげつ}の{終|お}わりまでに{取|と}りに{来|こ}ない{物|もの}は、{捨|す}てます»。
> {国際|こくさい}センター　{事務|じむ}{室|しつ}`,
      en: `Lost property
After last week's Japanese speech contest, the following things were left in the hall.
• A blue umbrella • Black gloves • A notebook with no name
If you think something is yours, please come and collect it from the office. Things not collected by the end of this month will be thrown away.
International Centre office`,
      questions: [{
        q: 'かさを{忘|わす}れた{人|ひと}は、どうしなければなりませんか。',
        en: 'What must the person who left the umbrella do?',
        choices: [
          ['{今月|こんげつ}の{終|お}わりまでに、{事務|じむ}{室|しつ}に{取|と}りに{行|い}く。', 'Collect it from the office by the end of this month.'],
          ['{来月|らいげつ}、ホールに{取|と}りに{行|い}く。', 'Collect it from the hall next month.'],
          ['{事務|じむ}{室|しつ}に{電話|でんわ}して、{送|おく}ってもらう。', 'Phone the office and have it sent.'],
          ['{次|つぎ}のスピーチ{大会|たいかい}の{日|ひ}に、ホールに{取|と}りに{行|い}く。', 'Collect it from the hall on the day of the next speech contest.'],
        ],
        why: 'Lost things are kept at the office (事務室に取りに来てください), not in the hall, and only until the end of the month — after that they’re thrown away (捨てます).',
      }],
      words: [['{忘|わす}れ{物|もの}', 'わすれもの', 'something left behind'], ['{大会|たいかい}', 'たいかい', 'contest, competition'], ['{手|て}ぶくろ', 'てぶくろ', 'gloves'], ['{事務|じむ}{室|しつ}', 'じむしつ', 'office'], ['{取|と}りに{来|く}る', 'とりにくる', 'to come and collect'], ['{終|お}わり', 'おわり', 'end']],
    },

    {
      id: 'n4-email-hotel', level: 'N4', type: 'short', form: 'email',
      title: 'A hotel booking',
      text: `@{件名|けんめい}|ご{予約|よやく}の{確認|かくにん}
@{送信|そうしん}{者|しゃ}|ホテルみなと
スミス{様|さま}
ご{予約|よやく}ありがとうございます。{次|つぎ}のとおり、ご{予約|よやく}を{受|う}け{付|つ}けました。
{日|ひ}にち：11{月|がつ}{3日|みっか}から2{泊|はく}　{部屋|へや}：{二人部屋|ふたりべや}
チェックインは{午後|ごご}3{時|じ}から、チェックアウトは{午前|ごぜん}10{時|じ}までです。«1|{朝食|ちょうしょく}は{料金|りょうきん}に{入|はい}っていません»。«1|{朝食|ちょうしょく}が{必要|ひつよう}な{方|かた}は、1{回|かい}1,200{円|えん}で、{前|まえ}の{日|ひ}の{夜|よる}までにフロントでお{申|もう}し{込|こ}みください»。`,
      en: `Subject: Booking confirmation
From: Hotel Minato
Dear Mr Smith,
Thank you for your booking. We have taken your booking as follows.
Dates: 2 nights from 3 November   Room: twin room
Check-in is from three in the afternoon, and check-out is by ten in the morning. Breakfast is not included in the price. If you would like breakfast, it is 1,200 yen each time; please book it at the front desk by the evening before.`,
      questions: [{
        q: 'スミスさんがホテルで{朝|あさ}ご{飯|はん}を{食|た}べたいとき、どうしますか。',
        en: 'If Mr Smith wants to have breakfast at the hotel, what does he do?',
        choices: [
          ['{前|まえ}の{日|ひ}の{夜|よる}までにフロントで{申|もう}し{込|こ}んで、1,200{円|えん}{払|はら}う。', 'Book at the front desk by the evening before, and pay 1,200 yen.'],
          ['{何|なに}もしなくても、{朝|あさ}ご{飯|はん}が{食|た}べられる。', 'Nothing — breakfast is included.'],
          ['その{日|ひ}の{朝|あさ}、フロントで{申|もう}し{込|こ}む。', 'Book at the front desk that morning.'],
          ['メールで{申|もう}し{込|こ}んで、ホテルの{料金|りょうきん}といっしょに{払|はら}う。', 'Book by email and pay with the room charge.'],
        ],
        why: 'Breakfast isn’t in the price (料金に入っていません). It costs 1,200 yen each time, booked at the front desk by the evening before (前の日の夜までに) — not on the morning itself.',
      }],
      words: [['{予約|よやく}', 'よやく', 'booking, reservation'], ['{確認|かくにん}', 'かくにん', 'confirmation'], ['{泊|はく}', 'はく', '(counter for) nights'], ['{朝食|ちょうしょく}', 'ちょうしょく', 'breakfast'], ['{料金|りょうきん}', 'りょうきん', 'charge, price'], ['フロント', '', 'front desk']],
    },

    {
      id: 'n4-info-clinic', level: 'N4', type: 'info', form: 'flyer',
      title: 'Clinic opening hours',
      text: `# さくらクリニック　{診察|しんさつ}{時間|じかん}
|! | {月|げつ} | {火|か} | {水|すい} | {木|もく} | {金|きん} | {土|ど}
| {午前|ごぜん} 9:00〜12:00 | ○ | ○ | ○ | ○ | ○ | «2|○»
| {午後|ごご} 3:00〜6:00 | ○ | ○ | ― | ○ | ○ | ―
| «1|{夜|よる} 6:00〜8:00» | ― | «1|○» | ― | ― | «1|○» | ―
・{日曜日|にちようび}と{祝日|しゅくじつ}は{休|やす}みです。
・«1|{受付|うけつけ}は、{終|お}わる{時間|じかん}の30{分|ぷん}{前|まえ}までです»。
・はじめての{方|かた}は、{保険|ほけん}{証|しょう}を{持|も}ってきてください。
・{予約|よやく}はいりません。{来|き}た{順番|じゅんばん}に{診|み}ます。
・{熱|ねつ}がある{方|かた}は、{入|はい}る{前|まえ}に{受付|うけつけ}に{電話|でんわ}してください。
・{駐車|ちゅうしゃ}{場|じょう}は5{台|だい}です。となりのスーパーの{駐車|ちゅうしゃ}{場|じょう}は{使|つか}わないでください。
・{薬|くすり}は、クリニックの{前|まえ}の{薬局|やっきょく}でもらってください。`,
      en: `Sakura Clinic — consultation hours
 | Mon | Tue | Wed | Thu | Fri | Sat
Morning 9:00–12:00 | ○ | ○ | ○ | ○ | ○ | ○
Afternoon 3:00–6:00 | ○ | ○ | — | ○ | ○ | —
Evening 6:00–8:00 | — | ○ | — | — | ○ | —
• Closed on Sundays and public holidays.
• Reception closes 30 minutes before the end of each session.
• On your first visit, please bring your health insurance card.
• No appointment needed. Patients are seen in the order they arrive.
• If you have a fever, please phone reception before you come in.
• There are 5 parking spaces. Please don't use the supermarket car park next door.
• Please get your medicine at the pharmacy in front of the clinic.`,
      questions: [{
        q: 'リンさんは{平日|へいじつ}は{毎日|まいにち}、{夕方|ゆうがた}5{時|じ}40{分|ぷん}まで{仕事|しごと}があります。{仕事|しごと}の{後|あと}に、このクリニックへ{行|い}きたいです。{何|なに}{曜日|ようび}に{行|い}けますか。',
        en: 'Lin works until 5:40 p.m. every weekday, and wants to go to the clinic after work. On which days can Lin go?',
        choices: [
          ['{火曜日|かようび}と{金曜日|きんようび}', 'Tuesday and Friday'],
          ['{月曜日|げつようび}と{金曜日|きんようび}', 'Monday and Friday'],
          ['{火曜日|かようび}と{木曜日|もくようび}', 'Tuesday and Thursday'],
          ['{水曜日|すいようび}と{土曜日|どようび}', 'Wednesday and Saturday'],
        ],
        why: 'The afternoon session ends at 6, but reception closes 30 minutes earlier, at 5:30 — before Lin finishes work. So it has to be the evening session (6–8), which is only on Tuesdays and Fridays.',
      }, {
        q: 'このクリニックについて、{正|ただ}しいものはどれですか。',
        en: 'Which is true about this clinic?',
        choices: [
          ['{土曜日|どようび}の{午前|ごぜん}に、{診|み}てもらえる。', 'You can be seen on Saturday morning.'],
          ['{日曜日|にちようび}の{午前|ごぜん}に、{診|み}てもらえる。', 'You can be seen on Sunday morning.'],
          ['{予約|よやく}をしなければならない。', 'You must make an appointment.'],
          ['{水曜日|すいようび}の{夜|よる}に、{診|み}てもらえる。', 'You can be seen on Wednesday evening.'],
        ],
        why: 'Saturday has a morning session (the ○ under 土). Sundays are closed, Wednesday has only the morning, and no appointment is needed (予約はいりません).',
      }],
      words: [['{診察|しんさつ}', 'しんさつ', 'medical examination, consultation'], ['{祝日|しゅくじつ}', 'しゅくじつ', 'public holiday'], ['{受付|うけつけ}', 'うけつけ', 'reception'], ['{保険|ほけん}{証|しょう}', 'ほけんしょう', 'health insurance card'], ['{順番|じゅんばん}', 'じゅんばん', 'order, turn'], ['{診|み}る', 'みる', 'to examine (a patient)']],
    },

    {
      id: 'n4-info-bike', level: 'N4', type: 'info', form: 'flyer',
      title: 'Renting a bicycle',
      text: `# レンタサイクル「みどり」
|! {自転車|じてんしゃ} | 2{時間|じかん} | 1{日|にち}（9:00〜18:00）
| ふつうの{自転車|じてんしゃ} | 500{円|えん} | 1,000{円|えん}
| «1|{電動|でんどう}{自転車|じてんしゃ}» | 800{円|えん} | «1|1,500{円|えん}»
| «2|{子|こ}ども{用|よう}{自転車|じてんしゃ}» | «2|300{円|えん}» | 600{円|えん}
・2{時間|じかん}を{過|す}ぎたら、1{時間|じかん}ごとに300{円|えん}{払|はら}ってください。
・{借|か}りるときに、{名前|なまえ}と{住所|じゅうしょ}が{分|わ}かるもの（パスポートなど）を{見|み}せてください。
・«2|{電動|でんどう}{自転車|じてんしゃ}は、{中学生|ちゅうがくせい}{以上|いじょう}の{方|かた}だけ{借|か}りられます»。
・{雨|あめ}の{日|ひ}は{休|やす}みです。
・{自転車|じてんしゃ}は、{借|か}りた{店|みせ}に{返|かえ}してください。
・かぎをなくしたときは、1,000{円|えん}{払|はら}ってください。`,
      en: `Midori bicycle hire
Bicycle | 2 hours | 1 day (9:00–18:00)
Ordinary bicycle | 500 yen | 1,000 yen
Electric bicycle | 800 yen | 1,500 yen
Children's bicycle | 300 yen | 600 yen
• After 2 hours, please pay 300 yen for each extra hour.
• When you hire a bicycle, please show something with your name and address on it (such as a passport).
• Electric bicycles can only be hired by people of junior-high-school age and over.
• Closed on rainy days.
• Please return the bicycle to the shop you hired it from.
• If you lose the key, please pay 1,000 yen.`,
      questions: [{
        q: '{大学生|だいがくせい}のカルロスさんは、{朝|あさ}9{時|じ}から{夕方|ゆうがた}6{時|じ}まで、{電動|でんどう}{自転車|じてんしゃ}で{町|まち}を{回|まわ}りたいと{思|おも}っています。いくら{払|はら}いますか。',
        en: 'Carlos, a university student, wants to ride around town on an electric bicycle from 9 a.m. to 6 p.m. How much does he pay?',
        choices: [
          ['1,500{円|えん}', '1,500 yen'],
          ['800{円|えん}', '800 yen'],
          ['1,000{円|えん}', '1,000 yen'],
          ['2,900{円|えん}', '2,900 yen'],
        ],
        why: '9 to 6 is the whole-day slot (1日（9:00〜18:00）), and a day on an electric bicycle is 1,500 yen. Paying by the hour would be 800 + 7 × 300 = 2,900 yen — the day rate is much cheaper.',
      }, {
        q: '10{歳|さい}の{子|こ}どもについて、{正|ただ}しいものはどれですか。',
        en: 'Which is true about a ten-year-old child?',
        choices: [
          ['{子|こ}ども{用|よう}{自転車|じてんしゃ}を、2{時間|じかん}300{円|えん}で{借|か}りられる。', 'They can hire a children’s bicycle for 300 yen for 2 hours.'],
          ['{電動|でんどう}{自転車|じてんしゃ}を{借|か}りられる。', 'They can hire an electric bicycle.'],
          ['{雨|あめ}の{日|ひ}でも{借|か}りられる。', 'They can hire a bicycle even on rainy days.'],
          ['ふつうの{自転車|じてんしゃ}を、2{時間|じかん}300{円|えん}で{借|か}りられる。', 'They can hire an ordinary bicycle for 300 yen for 2 hours.'],
        ],
        why: 'Electric bicycles are for junior-high age and over, so a ten-year-old can’t take one. The children’s bicycle is 300 yen for 2 hours; an ordinary one costs 500, not 300. Nobody can hire on rainy days.',
      }],
      words: [['レンタサイクル', '', 'bicycle hire'], ['{電動|でんどう}{自転車|じてんしゃ}', 'でんどうじてんしゃ', 'electric bicycle'], ['〜{用|よう}', 'よう', 'for … (子ども用: for children)'], ['{過|す}ぎる', 'すぎる', 'to pass, go over'], ['〜ごとに', '', 'every …, per …'], ['{以上|いじょう}', 'いじょう', '… and over']],
    },

    {
      id: 'n4-info-concert', level: 'N4', type: 'info', form: 'flyer',
      title: 'A winter concert',
      text: `# さくら{市民|しみん}オーケストラ　{冬|ふゆ}のコンサート
{日|ひ}にち：12{月|がつ}{14日|じゅうよっか}（{日|にち}）{午後|ごご}2{時|じ}から
{場所|ばしょ}：さくら{市民|しみん}ホール
|! {席|せき} | {一般|いっぱん} | {学生|がくせい}
| S{席|せき} | 4,000{円|えん} | 3,000{円|えん}
| «1|A{席|せき}» | «1|3,000{円|えん}» | «1|2,000{円|えん}»
| B{席|せき} | 2,000{円|えん} | 1,000{円|えん}
・«1|{学生|がくせい}{料金|りょうきん}は、{中学生|ちゅうがくせい}から{大学生|だいがくせい}までです»。{学生|がくせい}{証|しょう}を{見|み}せてください。
・«1|{小学生|しょうがくせい}{以下|いか}は、{大人|おとな}といっしょなら{無料|むりょう}です»（{席|せき}は{大人|おとな}のひざの{上|うえ}）。
・チケットは、ホールの{受付|うけつけ}と{電話|でんわ}で{売|う}っています。
・コンサートの{間|ま}は、{写真|しゃしん}をとったり、{電話|でんわ}を{使|つか}ったりしないでください。
・ホールの{近|ちか}くに{駐車|ちゅうしゃ}{場|じょう}はありませんので、{電車|でんしゃ}かバスで{来|き}てください。`,
      en: `Sakura Citizens' Orchestra — winter concert
Date: Sunday 14 December, from 2 p.m.
Place: Sakura Civic Hall
Seat | General | Students
S | 4,000 yen | 3,000 yen
A | 3,000 yen | 2,000 yen
B | 2,000 yen | 1,000 yen
• The student price is for junior-high to university students. Please show your student card.
• Children of primary-school age and under go free with an adult (sitting on the adult's lap).
• Tickets are sold at the hall's reception desk and by phone.
• During the concert, please don't take photos or use your phone.
• There is no car park near the hall, so please come by train or bus.`,
      questions: [{
        q: '{会社|かいしゃ}{員|いん}の{松田|まつだ}さんは、{大学生|だいがくせい}の{息子|むすこ}と{小学|しょうがく}2{年生|ねんせい}の{娘|むすめ}と3{人|にん}で、A{席|せき}で{聞|き}きたいと{思|おも}っています。{全部|ぜんぶ}でいくらですか。',
        en: 'Mr Matsuda, an office worker, wants to go in A seats with his son, a university student, and his daughter, who is in the second year of primary school. How much is it in total?',
        choices: [
          ['5,000{円|えん}', '5,000 yen'],
          ['6,000{円|えん}', '6,000 yen'],
          ['7,000{円|えん}', '7,000 yen'],
          ['8,000{円|えん}', '8,000 yen'],
        ],
        why: 'Mr Matsuda pays the general A price, 3,000; his son is a university student, so 2,000; his daughter is at primary school, so she’s free with an adult. 3,000 + 2,000 + 0 = 5,000 yen.',
      }],
      words: [['{市民|しみん}', 'しみん', 'citizen'], ['{席|せき}', 'せき', 'seat'], ['{一般|いっぱん}', 'いっぱん', 'general (admission)'], ['{学生|がくせい}{証|しょう}', 'がくせいしょう', 'student card'], ['{以下|いか}', 'いか', '… and under'], ['{無料|むりょう}', 'むりょう', 'free (of charge)']],
    },

    {
      id: 'n4-info-exchange', level: 'N4', type: 'info', form: 'flyer',
      title: 'November events at the international centre',
      text: `# {国際|こくさい}{交流|こうりゅう}センター　11{月|がつ}のイベント
|! イベント | {日|ひ}にち | {時間|じかん} | お{金|かね} | {申|もう}し{込|こ}み
| {日本語|にほんご}でおしゃべり | {毎週|まいしゅう}{水曜日|すいようび} | 18:30〜20:00 | {無料|むりょう} | «2|いらない»
| «1|{着物|きもの}を{着|き}てみよう» | «1|11{月|がつ}{9日|ここのか}（{日|にち}）» | 13:00〜15:00 | «1|1,000{円|えん}» | «1|{必要|ひつよう}（15{人|にん}まで）»
| {日本|にほん}の{料理|りょうり}を{作|つく}ろう | 11{月|がつ}22{日|にち}（{土|ど}） | 10:00〜13:00 | 1,500{円|えん} | {必要|ひつよう}（12{人|にん}まで）
| {書道|しょどう}{体験|たいけん} | 11{月|がつ}30{日|にち}（{日|にち}） | 14:00〜16:00 | 500{円|えん} | «2|いらない»
・«1|{申|もう}し{込|こ}みが{必要|ひつよう}なイベントは、イベントの{3日|みっか}{前|まえ}までに、センターの{受付|うけつけ}か{電話|でんわ}で{申|もう}し{込|こ}んでください»。
・«1|お{金|かね}は、イベントの{日|ひ}に{払|はら}ってください»。
・どのイベントも、{日本|にほん}に{住|す}んでいる{外国|がいこく}の{方|かた}ならだれでも{参加|さんか}できます。`,
      en: `International Exchange Centre — November events
Event | Date | Time | Cost | Booking
Chatting in Japanese | Every Wednesday | 18:30–20:00 | Free | Not needed
Try on a kimono | Sun 9 Nov | 13:00–15:00 | 1,000 yen | Needed (up to 15 people)
Let's cook Japanese food | Sat 22 Nov | 10:00–13:00 | 1,500 yen | Needed (up to 12 people)
Try calligraphy | Sun 30 Nov | 14:00–16:00 | 500 yen | Not needed
• For events that need booking, please book at the centre's reception desk or by phone at least 3 days before the event.
• Please pay on the day of the event.
• Any foreign resident of Japan can take part in any event.`,
      questions: [{
        q: 'キムさんは、{着物|きもの}を{着|き}てみたいです。どうしなければなりませんか。',
        en: 'Kim would like to try on a kimono. What must Kim do?',
        choices: [
          ['11{月|がつ}{6日|むいか}までに{申|もう}し{込|こ}んで、{当日|とうじつ}1,000{円|えん}{払|はら}う。', 'Book by 6 November and pay 1,000 yen on the day.'],
          ['11{月|がつ}{9日|ここのか}に{申|もう}し{込|こ}んで、{当日|とうじつ}1,000{円|えん}{払|はら}う。', 'Book on 9 November and pay 1,000 yen on the day.'],
          ['{申|もう}し{込|こ}まないで、{当日|とうじつ}500{円|えん}{払|はら}う。', 'Not book, and pay 500 yen on the day.'],
          ['11{月|がつ}{6日|むいか}までに{申|もう}し{込|こ}んで、そのとき1,000{円|えん}{払|はら}う。', 'Book by 6 November and pay 1,000 yen when booking.'],
        ],
        why: 'The kimono event needs booking (必要), 3 days before the 9th — so by the 6th. The money is paid on the day of the event (イベントの日に払って), not when you book. 500 yen is the calligraphy price.',
      }, {
        q: '{申|もう}し{込|こ}みをしなくても{参加|さんか}できるイベントはどれですか。',
        en: 'Which events can you join without booking?',
        choices: [
          ['「{日本語|にほんご}でおしゃべり」と「{書道|しょどう}{体験|たいけん}」', '“Chatting in Japanese” and “Try calligraphy”'],
          ['「{着物|きもの}を{着|き}てみよう」と「{日本|にほん}の{料理|りょうり}を{作|つく}ろう」', '“Try on a kimono” and “Let’s cook Japanese food”'],
          ['「{日本|にほん}の{料理|りょうり}を{作|つく}ろう」と「{書道|しょどう}{体験|たいけん}」', '“Let’s cook Japanese food” and “Try calligraphy”'],
          ['「{日本語|にほんご}でおしゃべり」と「{着物|きもの}を{着|き}てみよう」', '“Chatting in Japanese” and “Try on a kimono”'],
        ],
        why: 'Read down the last column: いらない (“not needed”) for the Wednesday chat and for calligraphy; the kimono and cooking events need booking (必要).',
      }],
      words: [['{国際|こくさい}{交流|こうりゅう}', 'こくさいこうりゅう', 'international exchange'], ['おしゃべり', '', 'chatting'], ['{着物|きもの}', 'きもの', 'kimono'], ['{書道|しょどう}', 'しょどう', 'calligraphy'], ['{体験|たいけん}', 'たいけん', '(a) try, experience'], ['{参加|さんか}', 'さんか', 'taking part']],
    },

    // ─── N3 ──────────────────────────────────────────────────────────────

    {
      id: 'n3-email-order', level: 'N3', type: 'short', form: 'email',
      title: 'A delayed order',
      text: `@{件名|けんめい}|ご{注文|ちゅうもん}の{商品|しょうひん}について
@{送信者|そうしんしゃ}|みどり{書店|しょてん}　オンラインショップ
{山下|やました}{様|さま}
いつもみどり{書店|しょてん}をご{利用|りよう}いただき、ありがとうございます。
3{月|がつ}{10日|とおか}にご{注文|ちゅうもん}いただいた『{日本|にほん}の{城|しろ}』ですが、{出版社|しゅっぱんしゃ}に{在庫|ざいこ}がなく、お{届|とど}けが4{月|がつ}{上旬|じょうじゅん}になる{見込|みこ}みです。お{待|ま}ちいただける{場合|ばあい}は、このメールへのご{返信|へんしん}は{必要|ひつよう}ありません。«1|キャンセルをご{希望|きぼう}の{場合|ばあい}は、3{月|がつ}{20日|はつか}までにご{連絡|れんらく}ください»。お{支払|しはら}いいただいた{代金|だいきん}は、すぐにお{返|かえ}しいたします。
ご{迷惑|めいわく}をおかけして、{申|もう}し{訳|わけ}ございません。`,
      en: `Subject: About the item you ordered
From: Midori Books online shop
Dear Mr Yamashita,
Thank you for shopping with Midori Books.
The book you ordered on 10 March, "Castles of Japan", is out of stock at the publisher, and we expect to deliver it in early April. If you are happy to wait, there is no need to reply to this email. If you would like to cancel, please contact us by 20 March. We will refund your payment straight away.
We apologise for the inconvenience.`,
      questions: [{
        q: '{山下|やました}さんが、{注文|ちゅうもん}した{本|ほん}を{待|ま}たない{場合|ばあい}、どうしなければならないか。',
        en: 'If Mr Yamashita doesn’t want to wait for the book, what must he do?',
        choices: [
          ['3{月|がつ}{20日|はつか}までに、{書店|しょてん}に{連絡|れんらく}する。', 'Contact the bookshop by 20 March.'],
          ['4{月|がつ}{上旬|じょうじゅん}までに、{書店|しょてん}に{連絡|れんらく}する。', 'Contact the bookshop by early April.'],
          ['{何|なに}もしなくてもいい。', 'Nothing.'],
          ['{出版社|しゅっぱんしゃ}に{連絡|れんらく}して、{代金|だいきん}を{返|かえ}してもらう。', 'Contact the publisher and get his money back.'],
        ],
        why: 'Waiting needs no reply (返信は必要ありません) — cancelling does: contact the shop by 20 March. Early April is when the book should arrive, and it’s the shop, not the publisher, that refunds the money (お返しいたします).',
      }],
      words: [['{在庫|ざいこ}', 'ざいこ', 'stock'], ['{上旬|じょうじゅん}', 'じょうじゅん', 'the first ten days of a month'], ['{見込|みこ}み', 'みこみ', 'expectation, forecast'], ['{返信|へんしん}', 'へんしん', 'reply'], ['ご{希望|きぼう}の{場合|ばあい}は', 'ごきぼうのばあいは', 'if you wish …'], ['{代金|だいきん}', 'だいきん', 'payment, price']],
    },

    {
      id: 'n3-notice-water', level: 'N3', type: 'short', form: 'notice',
      title: 'Water outage',
      text: `# {断水|だんすい}のお{知|し}らせ
{居住者|きょじゅうしゃ}の{皆様|みなさま}
{水道管|すいどうかん}の{点検|てんけん}のため、{下記|かき}の{日時|にちじ}に{断水|だんすい}いたします。
{日時|にちじ}：6{月|がつ}{8日|ようか}（{火|か}）{午前|ごぜん}9{時|じ}〜{午後|ごご}3{時|じ}
この{間|あいだ}は、{台所|だいどころ}、お{風呂|ふろ}、トイレの{水|みず}が{出|で}ません。{必要|ひつよう}な{水|みず}は、{前日|ぜんじつ}までにためておいてください。なお、{作業|さぎょう}が{早|はや}く{終|お}わった{場合|ばあい}は、その{時点|じてん}で{水|みず}が{出|で}るようになります。«1|{作業|さぎょう}の{後|あと}、しばらく{水|みず}がにごることがありますが、{少|すこ}し{流|なが}せばきれいになります»。
ご{協力|きょうりょく}をお{願|ねが}いいたします。
> さくらハイツ{管理|かんり}{会社|がいしゃ}`,
      en: `Notice of water outage
To all residents
The water will be turned off at the time below so the water pipes can be inspected.
When: Tuesday 8 June, 9 a.m.–3 p.m.
During this time no water will come out in the kitchen, bath or toilet. Please store the water you need by the day before. If the work finishes early, the water will come back on at that point. After the work the water may be cloudy for a while, but it will clear if you let it run a little.
Thank you for your cooperation.
Sakura Heights management company`,
      questions: [{
        q: 'このお{知|し}らせの{内容|ないよう}と{合|あ}っているものはどれか。',
        en: 'Which matches what this notice says?',
        choices: [
          ['{水|みず}がにごっていたら、しばらく{流|なが}してから{使|つか}えばいい。', 'If the water is cloudy, you can use it after letting it run for a while.'],
          ['6{月|がつ}{8日|ようか}は、{一日中|いちにちじゅう}{水|みず}が{使|つか}えない。', 'There’s no water all day on 8 June.'],
          ['6{月|がつ}{8日|ようか}の{午後|ごご}3{時|じ}より{前|まえ}に、{水|みず}が{出|で}ることはない。', 'On 8 June the water won’t come back before 3 p.m.'],
          ['{水|みず}をためておきたい{人|ひと}は、{管理|かんり}{会社|がいしゃ}に{申|もう}し{込|こ}む。', 'People who want to store water apply to the management company.'],
        ],
        why: 'The outage is 9 to 3, not all day, and the water may come back early (早く終わった場合は、その時点で水が出る). Storing water is up to each household — there’s nothing to apply for. The last sentence before the closing says cloudy water clears if you run it a little (少し流せばきれいになります). In a notice, なお and ただし lines are where the questions hide.',
      }],
      words: [['{断水|だんすい}', 'だんすい', 'water outage'], ['{居住者|きょじゅうしゃ}', 'きょじゅうしゃ', 'resident'], ['{点検|てんけん}', 'てんけん', 'inspection'], ['{下記|かき}', 'かき', 'below, the following'], ['ためる', '', 'to store, to collect'], ['なお', '', 'also, note that … (adds a detail)'], ['にごる', '', 'to become cloudy'], ['{時点|じてん}', 'じてん', 'point (in time)']],
    },

    {
      id: 'n3-memo-training', level: 'N3', type: 'short', form: 'memo',
      title: 'A change to the training day',
      text: `ワンさん
お{疲|つか}れさまです。{明日|あした}の{新人|しんじん}{研修|けんしゅう}の{件|けん}です。{講師|こうし}の{森|もり}さんが{急|きゅう}に{出張|しゅっちょう}することになったため、{午前|ごぜん}の「ビジネスマナー」と{午後|ごご}の「パソコン{研修|けんしゅう}」の{順番|じゅんばん}を{入|い}れ{替|か}えることになりました。«1|そこで、{明日|あした}の{朝|あさ}9{時|じ}に、{新人|しんじん}の{皆|みな}さんを{会議室|かいぎしつ}ではなく、4{階|かい}のパソコン{室|しつ}に{案内|あんない}していただけないでしょうか»。{昼食|ちゅうしょく}は{予定|よてい}どおり{会議室|かいぎしつ}でとります。{資料|しりょう}は{私|わたし}が{今日中|きょうじゅう}にパソコン{室|しつ}に{置|お}いておきます。
よろしくお{願|ねが}いします。
> {小林|こばやし}`,
      en: `Ms Wang,
Thanks for your hard work. This is about tomorrow's training for new staff. Mr Mori, the trainer, suddenly has to go on a business trip, so we're swapping the order of the morning "Business manners" session and the afternoon "Computer training". So could you take the new staff to the computer room on the 4th floor at 9 tomorrow morning, instead of the meeting room? Lunch will be in the meeting room as planned. I'll put the materials in the computer room today.
Thank you.
Kobayashi`,
      questions: [{
        q: '{小林|こばやし}さんがワンさんに{一番|いちばん}{頼|たの}みたいことは{何|なに}か。',
        en: 'What does Kobayashi most want to ask Ms Wang to do?',
        choices: [
          ['{明日|あした}の{朝|あさ}、{新人|しんじん}をパソコン{室|しつ}に{連|つ}れて{行|い}くこと', 'Take the new staff to the computer room tomorrow morning'],
          ['{森|もり}さんの{代|か}わりに、ビジネスマナーの{研修|けんしゅう}をすること', 'Teach the business-manners session instead of Mr Mori'],
          ['{新人|しんじん}の{昼食|ちゅうしょく}を{会議室|かいぎしつ}に{準備|じゅんび}すること', 'Get lunch ready for the new staff in the meeting room'],
          ['{研修|けんしゅう}の{資料|しりょう}をパソコン{室|しつ}に{置|お}いておくこと', 'Put the training materials in the computer room'],
        ],
        why: 'The request is the sentence ending 〜ていただけないでしょうか (“could you possibly …”), and そこで (“so”) leads into it: take the new staff to the 4th-floor computer room at nine instead of the meeting room. Kobayashi will put out the materials (私が … 置いておきます), lunch doesn’t change, and Mori’s session just moves to the afternoon.',
      }],
      words: [['{新人|しんじん}{研修|けんしゅう}', 'しんじんけんしゅう', 'training for new staff'], ['{講師|こうし}', 'こうし', 'trainer, lecturer'], ['{入|い}れ{替|か}える', 'いれかえる', 'to swap'], ['そこで', '', 'so, therefore'], ['{案内|あんない}する', 'あんない', 'to show (someone) the way'], ['{予定|よてい}どおり', 'よていどおり', 'as planned']],
    },

    {
      id: 'n3-notice-library', level: 'N3', type: 'short', form: 'notice',
      title: 'A request from the library',
      text: `# {図書館|としょかん}からのお{願|ねが}い
{最近|さいきん}、{館内|かんない}で{飲|の}み{物|もの}を{飲|の}んだり、お{菓子|かし}を{食|た}べたりする{人|ひと}が{増|ふ}えています。{先月|せんげつ}は、こぼれたジュースで{本|ほん}が5{冊|さつ}{汚|よご}れ、{使|つか}えなくなりました。
ふたのできる{飲|の}み{物|もの}は、これまでどおり1{階|かい}のラウンジで{飲|の}むことができます。しかし、«1|2{階|かい}から4{階|かい}の{閲覧室|えつらんしつ}には、{今後|こんご}、{飲|の}み{物|もの}を{持|も}って{入|はい}らないでください»。また、ラウンジ{以外|いがい}での{食事|しょくじ}も{禁止|きんし}です。
{皆|みな}さんが{気持|きも}ちよく{図書館|としょかん}を{使|つか}えるよう、ご{協力|きょうりょく}をお{願|ねが}いします。`,
      en: `A request from the library
More and more people have been drinking and eating snacks inside the library. Last month five books were ruined by spilt juice and can no longer be used.
Drinks with a lid can still be had in the lounge on the ground floor, as before. However, from now on please do not take drinks into the reading rooms on floors 2 to 4. Eating anywhere other than the lounge is also not allowed.
Please help us keep the library pleasant for everyone.`,
      questions: [{
        q: 'このお{知|し}らせで、{一番|いちばん}{伝|つた}えたいことは{何|なに}か。',
        en: 'What does this notice most want to say?',
        choices: [
          ['{閲覧室|えつらんしつ}に{飲|の}み{物|もの}を{持|も}って{入|はい}ってはいけないこと', 'That you mustn’t take drinks into the reading rooms'],
          ['ジュースで{汚|よご}れた{本|ほん}の{代|か}わりに、{新|あたら}しい{本|ほん}を{買|か}ったこと', 'That new books were bought to replace the ones ruined by juice'],
          ['ふたのできる{飲|の}み{物|もの}なら、{館内|かんない}のどこで{飲|の}んでもいいこと', 'That drinks with a lid are fine anywhere in the library'],
          ['これからは、ラウンジでも{飲|の}み{物|もの}を{飲|の}んではいけないこと', 'That from now on you can’t drink even in the lounge'],
        ],
        why: 'The ruined books are the reason; the point comes after しかし (“however”): no drinks in the reading rooms on floors 2–4 from now on. Drinks with lids are still fine — but only in the lounge (これまでどおり … ラウンジで飲むことができます). In “what does the writer most want to say” questions, look for the request or opinion after しかし, そこで or ですから.',
      }],
      words: [['{館内|かんない}', 'かんない', 'inside the building'], ['こぼれる', '', 'to spill'], ['{汚|よご}れる', 'よごれる', 'to get dirty'], ['ふた', '', 'lid'], ['{閲覧室|えつらんしつ}', 'えつらんしつ', 'reading room'], ['{今後|こんご}', 'こんご', 'from now on'], ['{禁止|きんし}', 'きんし', 'not allowed, prohibited']],
    },

    {
      id: 'n3-info-fitness', level: 'N3', type: 'info', form: 'flyer',
      title: 'Gym membership plans',
      text: `# フィットネスクラブ「ゆうゆう」{会員|かいいん}プラン
|! プラン | {利用|りよう}できる{日|ひ}・{時間|じかん} | {月会費|つきかいひ}
| フルタイム | {毎日|まいにち}　7:00〜23:00 | 9,800{円|えん}
| デイタイム | {平日|へいじつ}　10:00〜17:00 | 6,000{円|えん}
| «1|ナイト» | «1|{毎日|まいにち}　19:00〜23:00» | «1|6,800{円|えん}»
| ホリデー | {土|ど}・{日|にち}・{祝日|しゅくじつ}　7:00〜21:00 | 5,500{円|えん}
| {学生|がくせい} | {毎日|まいにち}　7:00〜23:00（{高校生|こうこうせい}・{大学生|だいがくせい}・{専門|せんもん}{学校|がっこう}{生|せい}） | 5,000{円|えん}
■{入会|にゅうかい}の{時|とき}に{必要|ひつよう}なもの
・«2|{入会金|にゅうかいきん}　3,000{円|えん}（{今月中|こんげつちゅう}に{入会|にゅうかい}した{方|かた}は{無料|むりょう}）»
・«2|{最初|さいしょ}の2か{月分|げつぶん}の{月会費|つきかいひ}»
・{身分|みぶん}{証明書|しょうめいしょ}（{運転|うんてん}{免許証|めんきょしょう}、{保険証|ほけんしょう}など。{学生|がくせい}プランの{方|かた}は{学生証|がくせいしょう}も）
・«2|プールを{利用|りよう}する{方|かた}は、{水泳帽|すいえいぼう}（{受付|うけつけ}で500{円|えん}で{販売|はんばい}しています）»
■ご{注意|ちゅうい}
・{毎月|まいつき}{第|だい}3{火曜日|かようび}は、どのプランも{休館日|きゅうかんび}です。
・プランの{変更|へんこう}は、{毎月|まいつき}{20日|はつか}までに{受付|うけつけ}にお{申|もう}し{出|で}ください。{翌月|よくげつ}から{変更|へんこう}になります。
・{退会|たいかい}する{場合|ばあい}は、{退会|たいかい}する{月|つき}の{前|まえ}の{月|つき}の{20日|はつか}までに、{受付|うけつけ}で{手続|てつづ}きをしてください。
■そのほか
・「1{日|にち}{体験|たいけん}」：{会員|かいいん}でない{方|かた}も、1{回|かい}1,500{円|えん}で{利用|りよう}できます（お{一人|ひとり}1{回|かい}まで）。
・タオルの{貸|か}し{出|だ}し：1{回|かい}200{円|えん}
・{駐車場|ちゅうしゃじょう}：{会員|かいいん}の{方|かた}は2{時間|じかん}まで{無料|むりょう}です。`,
      en: `Yuyu Fitness Club — membership plans
Plan | Days and hours | Monthly fee
Full-time | Every day, 7:00–23:00 | 9,800 yen
Daytime | Weekdays, 10:00–17:00 | 6,000 yen
Night | Every day, 19:00–23:00 | 6,800 yen
Holiday | Sat, Sun and public holidays, 7:00–21:00 | 5,500 yen
Student | Every day, 7:00–23:00 (high school, university and vocational school students) | 5,000 yen
What you need to join
• Joining fee: 3,000 yen (free for anyone who joins this month)
• The monthly fee for the first two months
• ID (driving licence, health insurance card etc.; on the Student plan, your student card too)
• If you'll use the pool: a swimming cap (on sale at reception for 500 yen)
Please note
• The club is closed for all plans on the third Tuesday of every month.
• To change plans, tell reception by the 20th of the month. The change starts the following month.
• To leave the club, complete the paperwork at reception by the 20th of the month before the month you leave.
Other
• One-day trial: non-members can use the club for 1,500 yen a visit (once per person).
• Towel hire: 200 yen a time
• Car park: free for members for up to 2 hours.`,
      questions: [{
        q: '{会社員|かいしゃいん}の{高橋|たかはし}さんは、{平日|へいじつ}は{夜|よる}8{時|じ}まで{仕事|しごと}があり、{週末|しゅうまつ}は{家族|かぞく}と{出|で}かけることが{多|おお}い。{仕事|しごと}の{後|あと}に{運動|うんどう}したいと{思|おも}っている。{高橋|たかはし}さんに{合|あ}うプランの{中|なか}で、{一番|いちばん}{安|やす}いのはどれか。',
        en: 'Mr Takahashi is an office worker who works until 8 p.m. on weekdays and often goes out with his family at weekends. He wants to exercise after work. Of the plans that suit him, which is the cheapest?',
        choices: [['ナイト', 'Night'], ['フルタイム', 'Full-time'], ['デイタイム', 'Daytime'], ['ホリデー', 'Holiday']],
        why: 'After 8 p.m. on a weekday, only Full-time (to 23:00) and Night (19:00–23:00) are open to him. Daytime ends at five, and Holiday is weekends only. Of the two, Night is cheaper: 6,800 yen against 9,800.',
      }, {
        q: '{大学生|だいがくせい}のリンさんは、{今月|こんげつ}25{日|にち}に{学生|がくせい}プランで{入会|にゅうかい}する。プールも{使|つか}いたいが、{水泳帽|すいえいぼう}は{持|も}っていない。{入会|にゅうかい}の{日|ひ}にいくら{払|はら}うか。',
        en: 'Lin, a university student, joins on the Student plan on the 25th of this month. She wants to use the pool too, but has no swimming cap. How much does she pay on the day she joins?',
        choices: [['10,500{円|えん}', '10,500 yen'], ['5,500{円|えん}', '5,500 yen'], ['10,000{円|えん}', '10,000 yen'], ['13,500{円|えん}', '13,500 yen']],
        why: 'Joining this month means no joining fee. She pays the first two months up front: 2 × 5,000 = 10,000 yen, plus 500 for a swimming cap — 10,500 yen. The 20th-of-the-month rule is for changing plans, not for joining.',
      }],
      words: [['{会員|かいいん}', 'かいいん', 'member'], ['{月会費|つきかいひ}', 'つきかいひ', 'monthly fee'], ['{入会金|にゅうかいきん}', 'にゅうかいきん', 'joining fee'], ['{身分|みぶん}{証明書|しょうめいしょ}', 'みぶんしょうめいしょ', 'ID, proof of identity'], ['{水泳帽|すいえいぼう}', 'すいえいぼう', 'swimming cap'], ['{販売|はんばい}', 'はんばい', 'sale, selling'], ['{翌月|よくげつ}', 'よくげつ', 'the following month']],
    },

    {
      id: 'n3-info-sodai', level: 'N3', type: 'info', form: 'flyer',
      title: 'Throwing away large items',
      text: `# {粗大|そだい}ごみの{出|だ}し{方|かた}
{粗大|そだい}ごみとは、{一番|いちばん}{長|なが}いところが30cm{以上|いじょう}の{家具|かぐ}や{自転車|じてんしゃ}などのことです。
«1|※エアコン・テレビ・{冷蔵庫|れいぞうこ}・{洗濯機|せんたくき}は、{粗大|そだい}ごみとして{出|だ}すことができません。{買|か}った{店|みせ}か、{市|し}のリサイクル{受付|うけつけ}に{連絡|れんらく}してください»。
■{出|だ}し{方|かた}
① {粗大|そだい}ごみ{受付|うけつけ}センターに{申|もう}し{込|こ}む（{収集日|しゅうしゅうび}の{7日|なのか}{前|まえ}まで）
　«1|{電話|でんわ}：{月|げつ}〜{土|ど}　9:00〜17:00　インターネット：24{時間|じかん}»
② コンビニやスーパーで「{粗大|そだい}ごみ{処理券|しょりけん}」を{買|か}う
③ {処理券|しょりけん}に{名前|なまえ}を{書|か}いて、ごみにはる（«2|ごみ1{点|てん}に1{枚|まい}»）
④ {収集日|しゅうしゅうび}の{朝|あさ}8{時|じ}までに、{決|き}められた{場所|ばしょ}に{出|だ}す
■{処理券|しょりけん}の{料金|りょうきん}
|! {品物|しなもの} | {料金|りょうきん}
| «2|いす・{自転車|じてんしゃ}・{小|ちい}さい{棚|たな}» | «2|400{円|えん}»
| «2|{机|つくえ}»・{本棚|ほんだな}・ふとん | «2|800{円|えん}»
| ソファー・ベッド | 1,600{円|えん}
■{申|もう}し{込|こ}みの{時|とき}に{伝|つた}えること
{名前|なまえ}・{住所|じゅうしょ}・{電話|でんわ}{番号|ばんごう}・{品物|しなもの}の{種類|しゅるい}と{数|かず}
※{自分|じぶん}でクリーンセンターに{持|も}って{行|い}く{場合|ばあい}は、{処理券|しょりけん}はいりません（10kgごとに200{円|えん}）。
※まだ{使|つか}える{家具|かぐ}は、{市|し}のホームページの「ゆずります{掲示板|けいじばん}」で、ほしい{人|ひと}にゆずることもできます。`,
      en: `How to put out large rubbish
Large rubbish means furniture, bicycles and so on whose longest side is 30 cm or more.
* Air conditioners, TVs, fridges and washing machines can't be put out as large rubbish. Contact the shop you bought them from, or the city's recycling desk.
How to put it out
① Apply to the Large Rubbish Centre (at least 7 days before the collection day)
   Phone: Mon–Sat 9:00–17:00   Internet: 24 hours
② Buy a "large rubbish ticket" at a convenience store or supermarket
③ Write your name on the ticket and stick it on the item (one ticket per item)
④ Put it out at the set place by 8 a.m. on the collection day
Ticket prices
Item | Price
Chair, bicycle, small shelf | 400 yen
Desk, bookcase, futon | 800 yen
Sofa, bed | 1,600 yen
What to tell us when you apply
Your name, address and phone number, and the kind and number of items
* If you take items to the Clean Centre yourself, no ticket is needed (200 yen per 10 kg).
* Furniture that can still be used can also be given to someone who wants it, through the "Free to a good home" board on the city's website.`,
      questions: [{
        q: 'アリさんは{日曜日|にちようび}の{夜|よる}、{古|ふる}いテレビと{自転車|じてんしゃ}を{捨|す}てることにした。{次|つぎ}の{収集日|しゅうしゅうび}は{10日|とおか}{後|ご}である。アリさんはどうすればいいか。',
        en: 'On Sunday evening Ali decides to throw away an old TV and a bicycle. The next collection day is in ten days. What should he do?',
        choices: [
          ['インターネットで{自転車|じてんしゃ}を{申|もう}し{込|こ}み、テレビは{買|か}った{店|みせ}などに{連絡|れんらく}する。', 'Apply for the bicycle online, and contact the shop he bought the TV from (or the recycling desk).'],
          ['{電話|でんわ}で{受付|うけつけ}センターに、テレビと{自転車|じてんしゃ}を{申|もう}し{込|こ}む。', 'Phone the centre and apply for both the TV and the bicycle.'],
          ['{処理券|しょりけん}を{買|か}って、テレビと{自転車|じてんしゃ}にはる。', 'Buy tickets and stick them on the TV and the bicycle.'],
          ['{収集日|しゅうしゅうび}の{朝|あさ}、テレビと{自転車|じてんしゃ}を{決|き}められた{場所|ばしょ}に{出|だ}す。', 'Put the TV and the bicycle out at the set place on the collection day.'],
        ],
        why: 'The ※ line is the trap: a TV can’t go out as large rubbish at all — it goes back to the shop or the recycling desk. The bicycle can, and at ten days ahead he’s in time. On a Sunday evening the phone line is closed (Mon–Sat, 9–5), but the internet is open 24 hours.',
      }, {
        q: 'アリさんは、ほかに{机|つくえ}を{一|ひと}つと、いすを{二|ふた}つ{出|だ}すことにした。{自転車|じてんしゃ}と{合|あ}わせて、{処理券|しょりけん}は{全部|ぜんぶ}でいくら{必要|ひつよう}か。',
        en: 'Ali also decides to put out a desk and two chairs. Together with the bicycle, how much do the tickets cost in all?',
        choices: [['2,000{円|えん}', '2,000 yen'], ['1,600{円|えん}', '1,600 yen'], ['2,400{円|えん}', '2,400 yen'], ['3,600{円|えん}', '3,600 yen']],
        why: 'Bicycle 400 + desk 800 + two chairs at 400 each (800) = 2,000 yen. The TV needs no ticket — it isn’t large rubbish.',
      }],
      words: [['{粗大|そだい}ごみ', 'そだいごみ', 'oversized rubbish'], ['{家具|かぐ}', 'かぐ', 'furniture'], ['{収集日|しゅうしゅうび}', 'しゅうしゅうび', 'collection day'], ['{処理券|しょりけん}', 'しょりけん', 'disposal ticket'], ['はる', '', 'to stick on'], ['{決|き}められた', 'きめられた', 'set, designated'], ['{品物|しなもの}', 'しなもの', 'item, goods']],
    },

    {
      id: 'n3-email-interview', level: 'N3', type: 'short', form: 'email',
      title: 'An interview invitation',
      text: `@{件名|けんめい}|{面接|めんせつ}{日程|にってい}のご{連絡|れんらく}
@{送信者|そうしんしゃ}|さくら{食品|しょくひん}　{人事部|じんじぶ}　{森|もり}
リ・ナ{様|さま}
このたびは、{弊社|へいしゃ}の{求人|きゅうじん}にご{応募|おうぼ}いただき、ありがとうございました。{書類|しょるい}{選考|せんこう}の{結果|けっか}、{面接|めんせつ}にお{越|こ}しいただくことになりました。{面接|めんせつ}の{候補日|こうほび}は、{次|つぎ}の{3日|みっか}です。
① 6{月|がつ}{10日|とおか}（{水|すい}）14{時|じ}〜　② 6{月|がつ}11{日|にち}（{木|もく}）10{時|じ}〜　③ 6{月|がつ}12{日|にち}（{金|きん}）16{時|じ}〜
«1|ご{都合|つごう}のよい{日|ひ}を、6{月|がつ}{5日|いつか}（{金|きん}）までに、このメールへのご{返信|へんしん}でお{知|し}らせください»。いずれの{日|ひ}も{難|むずか}しい{場合|ばあい}は、その{旨|むね}をお{書|か}きください。{別|べつ}の{日|ひ}を{調整|ちょうせい}いたします。
{当日|とうじつ}は、{履歴書|りれきしょ}のコピーをお{持|も}ちください。`,
      en: `Subject: Your interview dates
From: Mori, Human Resources, Sakura Foods
Dear Ms Li Na,
Thank you for applying for our vacancy. Following the screening of your documents, we would like to invite you to an interview. The possible dates are the following three:
① Wed 10 June from 14:00 ② Thu 11 June from 10:00 ③ Fri 12 June from 16:00
Please let us know which date suits you by replying to this email by Friday 5 June. If none of the dates is possible, please say so. We will arrange another day.
On the day, please bring a copy of your CV.`,
      questions: [{
        q: 'リさんが、まずしなければならないことは{何|なに}か。',
        en: 'What must Ms Li do first?',
        choices: [
          ['6{月|がつ}{5日|いつか}までに、{都合|つごう}のいい{日|ひ}をメールで{知|し}らせる。', 'Email which date suits her by 5 June.'],
          ['6{月|がつ}{5日|いつか}までに、{履歴書|りれきしょ}のコピーを{送|おく}る。', 'Send a copy of her CV by 5 June.'],
          ['6{月|がつ}{10日|とおか}から12{日|にち}のうち、{都合|つごう}のいい{日|ひ}に{会社|かいしゃ}へ{行|い}く。', 'Go to the company on whichever day from 10 to 12 June suits her.'],
          ['{3日|みっか}とも{都合|つごう}が{悪|わる}い{場合|ばあい}は、{別|べつ}の{会社|かいしゃ}に{応募|おうぼ}する。', 'If none of the three days suits her, apply to another company.'],
        ],
        why: 'まず (“first”) is the key: before any interview she has to reply with a date by 5 June. The CV copy is brought on the day (当日は … お持ちください), not sent, and if no date works the company will find another one (別の日を調整いたします).',
      }],
      words: [['{面接|めんせつ}', 'めんせつ', 'interview'], ['{求人|きゅうじん}', 'きゅうじん', 'job vacancy'], ['{候補日|こうほび}', 'こうほび', 'possible date'], ['ご{都合|つごう}のよい', 'ごつごうのよい', 'convenient (for you)'], ['その{旨|むね}', 'そのむね', 'to that effect'], ['{調整|ちょうせい}する', 'ちょうせい', 'to arrange, adjust'], ['{履歴書|りれきしょ}', 'りれきしょ', 'CV, résumé']],
    },

    {
      id: 'n3-notice-garbage-days', level: 'N3', type: 'short', form: 'notice',
      title: 'New rubbish collection days',
      text: `# ごみの{収集日|しゅうしゅうび}が{変|か}わります
さくら{町|ちょう}の{皆様|みなさま}
{来年|らいねん}4{月|がつ}1{日|ついたち}から、ごみの{収集日|しゅうしゅうび}が{次|つぎ}のように{変|か}わります。
・«1|{燃|も}えるごみ：{月|げつ}・{木|もく}　→　{火|か}・{金|きん}»
・プラスチック：{水|すい}　→　{変|か}わりません
・びん・{缶|かん}：{第|だい}2・{第|だい}4{金曜日|きんようび}　→　{第|だい}1・{第|だい}3{月曜日|げつようび}
«1|これまで{燃|も}えるごみを{出|だ}していた{月曜日|げつようび}と{木曜日|もくようび}には、4{月|がつ}から{収集|しゅうしゅう}に{来|き}ません»。{曜日|ようび}を{間違|まちが}えて{出|だ}されたごみは{回収|かいしゅう}できませんので、ご{注意|ちゅうい}ください。
{新|あたら}しいカレンダーは、3{月|がつ}{中|ちゅう}に{各|かく}{家庭|かてい}に{配|くば}ります。
> さくら{町役場|ちょうやくば}　{環境課|かんきょうか}`,
      en: `The rubbish collection days are changing
To all residents of Sakura Town
From 1 April next year, the rubbish collection days will change as follows.
• Burnable rubbish: Mon, Thu → Tue, Fri
• Plastics: Wed → no change
• Bottles and cans: 2nd and 4th Friday → 1st and 3rd Monday
From April there will be no collection on Mondays and Thursdays, the days burnable rubbish used to be put out. Rubbish put out on the wrong day can't be collected, so please take care.
The new calendar will be delivered to every household during March.
Sakura Town Office, Environment Section`,
      questions: [{
        q: 'このお{知|し}らせの{内容|ないよう}と{合|あ}っているものはどれか。',
        en: 'Which matches what this notice says?',
        choices: [
          ['4{月|がつ}から、{燃|も}えるごみは{火曜日|かようび}と{金曜日|きんようび}に{出|だ}す。', 'From April, burnable rubbish goes out on Tuesdays and Fridays.'],
          ['4{月|がつ}から、プラスチックは{月曜日|げつようび}に{出|だ}す。', 'From April, plastics go out on Mondays.'],
          ['4{月|がつ}から、びんと{缶|かん}は{毎週|まいしゅう}{金曜日|きんようび}に{出|だ}す。', 'From April, bottles and cans go out every Friday.'],
          ['{新|あたら}しいカレンダーは、4{月|がつ}に{町役場|ちょうやくば}でもらえる。', 'The new calendar can be picked up at the town office in April.'],
        ],
        why: 'The arrows give before → after: burnable rubbish moves from Monday/Thursday to Tuesday/Friday. Plastics stay on Wednesday, bottles and cans move to the 1st and 3rd Monday (not every week), and the calendar is delivered to each home in March (配ります), not collected in April.',
      }],
      words: [['{収集日|しゅうしゅうび}', 'しゅうしゅうび', 'collection day'], ['{燃|も}えるごみ', 'もえるごみ', 'burnable rubbish'], ['{第|だい}2', 'だいに', 'the second (of the month)'], ['{回収|かいしゅう}する', 'かいしゅう', 'to collect'], ['{配|くば}る', 'くばる', 'to hand out, deliver'], ['{町役場|ちょうやくば}', 'ちょうやくば', 'town office']],
    },

    {
      id: 'n3-memo-shift', level: 'N3', type: 'short', form: 'memo',
      title: 'A shift swap',
      text: `キムさん
お{疲|つか}れさま。{来週|らいしゅう}のシフトのことで{相談|そうだん}です。{土曜日|どようび}に{入|はい}っている{田村|たむら}さんが、{大学|だいがく}の{試験|しけん}で{休|やす}むことになりました。
«1|それで、キムさんに、{土曜日|どようび}の10{時|じ}から18{時|じ}まで、{代|か}わりに{入|はい}ってもらえないかと{思|おも}っています»。その{代|か}わり、キムさんが{入|はい}っている{金曜日|きんようび}の{夜|よる}は、ほかの{人|ひと}に{頼|たの}むので、{休|やす}んでもらってかまいません。
{無理|むり}なら{断|ことわ}ってもらって{大丈夫|だいじょうぶ}です。{今週|こんしゅう}の{木曜日|もくようび}までに{返事|へんじ}をください。
> {店長|てんちょう}　{青木|あおき}`,
      en: `Kim,
Thanks for your hard work. I want to ask you about next week's shifts. Tamura, who works on Saturday, has a university exam and will be off.
So I was wondering if you could work in Tamura's place on Saturday from 10 to 6. In return, I'll ask someone else to do your Friday evening, so you're welcome to take that off.
If you can't, it's fine to say no. Please let me know by Thursday this week.
Aoki, store manager`,
      questions: [{
        q: '{店長|てんちょう}がキムさんに{一番|いちばん}{頼|たの}みたいことは{何|なに}か。',
        en: 'What does the manager most want to ask Kim?',
        choices: [
          ['{土曜日|どようび}に、{田村|たむら}さんの{代|か}わりに{働|はたら}くこと', 'To work on Saturday in Tamura’s place'],
          ['{金曜日|きんようび}の{夜|よる}も{土曜日|どようび}も{働|はたら}くこと', 'To work both Friday evening and Saturday'],
          ['{田村|たむら}さんの{試験|しけん}の{勉強|べんきょう}を{手伝|てつだ}うこと', 'To help Tamura study for the exam'],
          ['{金曜日|きんようび}の{夜|よる}に{働|はたら}く{人|ひと}を{探|さが}すこと', 'To find someone to work on Friday evening'],
        ],
        why: '〜てもらえないかと思っています is a polite request: work Saturday 10–6 instead of Tamura. In return Kim gets Friday evening off — the manager will find cover (ほかの人に頼む), so Kim doesn’t work both days and doesn’t have to look for anyone.',
      }],
      words: [['シフトに{入|はい}る', 'シフトにはいる', 'to work a shift'], ['{相談|そうだん}', 'そうだん', 'consultation, asking advice'], ['{代|か}わりに', 'かわりに', 'instead of, in place of'], ['その{代|か}わり', 'そのかわり', 'in return'], ['〜てかまいません', 'てかまいません', 'it’s fine to …'], ['{断|ことわ}る', 'ことわる', 'to say no, decline']],
    },

    {
      id: 'n3-notice-fireworks', level: 'N3', type: 'short', form: 'notice',
      title: 'Fireworks postponed',
      text: `# 「さくら{川|がわ}{花火|はなび}{大会|たいかい}」{延期|えんき}のお{知|し}らせ
8{月|がつ}{2日|ふつか}（{土|ど}）に{予定|よてい}していた{花火|はなび}{大会|たいかい}は、{台風|たいふう}が{近|ちか}づいているため、8{月|がつ}{9日|ここのか}（{土|ど}）に{延期|えんき}することになりました。{時間|じかん}と{場所|ばしょ}は{変|か}わりません。
«1|すでに{有料|ゆうりょう}{席|せき}のチケットをお{買|か}い{求|もと}めの{方|かた}は、そのまま{9日|ここのか}にお{使|つか}いいただけます»。{9日|ここのか}にご{来場|らいじょう}できない{方|かた}には、チケット{代|だい}をお{返|かえ}しします。8{月|がつ}{8日|ようか}までに、チケットを{買|か}われたお{店|みせ}でお{手続|てつづ}きください。
なお、{9日|ここのか}も{天気|てんき}が{悪|わる}い{場合|ばあい}は{中止|ちゅうし}とし、その{際|さい}はホームページでお{知|し}らせします。
> さくら{川|がわ}{花火|はなび}{大会|たいかい}{実行|じっこう}{委員会|いいんかい}`,
      en: `Sakura River Fireworks postponed
Because a typhoon is approaching, the fireworks display planned for Saturday 2 August has been postponed to Saturday 9 August. The time and place are unchanged.
If you have already bought a ticket for a paid seat, you can use it as it is on the 9th. If you can't come on the 9th, we will refund the ticket price. Please do this by 8 August at the shop where you bought the ticket.
If the weather is bad on the 9th as well, the display will be cancelled, and we will announce this on our website.
Sakura River Fireworks organising committee`,
      questions: [{
        q: '{有料|ゆうりょう}{席|せき}のチケットを{持|も}っている{人|ひと}について、{正|ただ}しいものはどれか。',
        en: 'Which is true about people who have a ticket for a paid seat?',
        choices: [
          ['そのチケットで、8{月|がつ}{9日|ここのか}の{花火|はなび}{大会|たいかい}を{見|み}ることができる。', 'They can watch the fireworks on 9 August with that ticket.'],
          ['{新|あたら}しいチケットと{交換|こうかん}しなければならない。', 'They must exchange it for a new ticket.'],
          ['チケット{代|だい}は、{全員|ぜんいん}に{返|かえ}してもらえる。', 'Everyone gets their money back.'],
          ['8{月|がつ}{9日|ここのか}{以降|いこう}に、ホームページで{払|はら}い{戻|もど}しの{手続|てつづ}きをする。', 'They apply for a refund on the website after 9 August.'],
        ],
        why: 'そのまま9日にお使いいただけます — the same ticket works on the 9th, no exchange needed. Refunds are only for people who can’t come, at the shop where they bought it, by the 8th. The website is only for news of a cancellation.',
      }],
      words: [['{延期|えんき}', 'えんき', 'postponement'], ['{有料|ゆうりょう}{席|せき}', 'ゆうりょうせき', 'paid seat'], ['お{買|か}い{求|もと}めの{方|かた}', 'おかいもとめのかた', 'those who have bought (polite)'], ['そのまま', '', 'as it is'], ['{来場|らいじょう}', 'らいじょう', 'coming to the venue'], ['{中止|ちゅうし}', 'ちゅうし', 'cancellation'], ['{実行|じっこう}{委員会|いいんかい}', 'じっこういいんかい', 'organising committee']],
    },

    {
      id: 'n3-info-parttime', level: 'N3', type: 'info', form: 'flyer',
      title: 'Part-time jobs near the station',
      text: `# アルバイト{募集|ぼしゅう}　〜さくら{駅|えき}{周辺|しゅうへん}のお{店|みせ}〜
|! お{店|みせ} | {仕事|しごと} | {時間|じかん} | {時給|じきゅう} | {条件|じょうけん}
| ① カフェ「もみじ」 | ホール・レジ | 7:00〜12:00 | 1,150{円|えん} | «1|{週|しゅう}{3日|みっか}{以上|いじょう}»。{日本語|にほんご}で{接客|せっきゃく}できる{方|かた}
| «1|② {書店|しょてん}「{青空堂|あおぞらどう}」» | {本|ほん}の{整理|せいり}・レジ | 17:00〜22:00 | 1,200{円|えん} | «1|{週|しゅう}{2日|ふつか}〜OK。{土日|どにち}どちらか{入|はい}れる{方|かた}»
| «2|③ {弁当|べんとう}{工場|こうじょう}» | おかずを{詰|つ}める | «2|22:00〜{翌|よく}5:00» | «2|1,450{円|えん}» | «1|{週|しゅう}{4日|よっか}{以上|いじょう}»。{日本語|にほんご}が{苦手|にがて}でもOK
| ④ {学習|がくしゅう}{塾|じゅく}「のびのび」 | {事務|じむ}・{電話|でんわ}の{受付|うけつけ} | 16:00〜21:00 | 1,250{円|えん} | {週|しゅう}{2日|ふつか}〜OK。«1|{平日|へいじつ}のみ»
・«2|どのお{店|みせ}も、{交通費|こうつうひ}は1{日|にち}500{円|えん}まで{出|で}ます»。
・{留学生|りゅうがくせい}の{方|かた}は、{在留|ざいりゅう}カードの「{資格外|しかくがい}{活動|かつどう}{許可|きょか}」を{確認|かくにん}します。{週|しゅう}28{時間|じかん}を{超|こ}えて{働|はたら}くことはできません。
・{応募|おうぼ}：{各|かく}{店|てん}に{電話|でんわ}してください。{面接|めんせつ}の{時|とき}に{履歴書|りれきしょ}（{写真|しゃしん}{付|つ}き）を{持|も}ってきてください。
・{未経験|みけいけん}の{方|かた}も{歓迎|かんげい}します。{最初|さいしょ}の1{週間|しゅうかん}は、{先輩|せんぱい}が{仕事|しごと}を{教|おし}えます。
・③は、{仕事|しごと}の{後|あと}にお{弁当|べんとう}を{無料|むりょう}で{食|た}べることができます。`,
      en: `Part-time staff wanted — shops around Sakura Station
Shop | Work | Hours | Hourly pay | Conditions
① Café Momiji | Floor and till | 7:00–12:00 | 1,150 yen | 3 days a week or more; must be able to serve customers in Japanese
② Aozorado bookshop | Shelving and till | 17:00–22:00 | 1,200 yen | From 2 days a week; must be able to work Saturday or Sunday
③ Packed-lunch factory | Filling lunch boxes | 22:00–5:00 | 1,450 yen | 4 days a week or more; weak Japanese OK
④ Nobinobi cram school | Office work, answering the phone | 16:00–21:00 | 1,250 yen | From 2 days a week; weekdays only
• Every shop pays travel expenses of up to 500 yen a day.
• International students: we check the "permission to work" on your residence card. You can't work more than 28 hours a week.
• To apply, phone the shop. Please bring a CV with a photo to the interview.
• No experience needed. For the first week, an experienced colleague will show you the work.
• At ③ you can have a packed lunch for free after your shift.`,
      questions: [{
        q: '{大学生|だいがくせい}のアさんは、{土曜日|どようび}と{日曜日|にちようび}だけ{働|はたら}きたいと{思|おも}っている。アさんが{応募|おうぼ}できるのはどれか。',
        en: 'A, a university student, wants to work on Saturdays and Sundays only. Which job can A apply for?',
        choices: [['②', '② The bookshop'], ['①', '① The café'], ['③', '③ The lunch factory'], ['④', '④ The cram school']],
        why: 'Weekends only means two days a week at most. The café wants 3 days or more and the factory 4 or more; the cram school is weekdays only. The bookshop takes 2 days a week and actually wants someone for Saturday or Sunday.',
      }, {
        q: 'ジョンさんは、③で{週|しゅう}{4日|よっか}{働|はたら}くことにした。{交通費|こうつうひ}も{入|い}れると、1{週間|しゅうかん}でいくらもらえるか。',
        en: 'John decides to work 4 days a week at ③. Including travel expenses, how much does he get a week?',
        choices: [['42,600{円|えん}', '42,600 yen'], ['40,600{円|えん}', '40,600 yen'], ['44,600{円|えん}', '44,600 yen'], ['34,800{円|えん}', '34,800 yen']],
        why: '22:00 to 5:00 is 7 hours: 1,450 × 7 = 10,150 yen a night, × 4 = 40,600. Travel is up to 500 a day: + 2,000 = 42,600. (4 × 7 = 28 hours, just inside the 28-hour limit for students.)',
      }],
      words: [['{募集|ぼしゅう}', 'ぼしゅう', 'recruiting, wanted'], ['{時給|じきゅう}', 'じきゅう', 'hourly pay'], ['{条件|じょうけん}', 'じょうけん', 'condition, requirement'], ['{接客|せっきゃく}', 'せっきゃく', 'serving customers'], ['{苦手|にがて}', 'にがて', 'weak at, not good at'], ['{交通費|こうつうひ}', 'こうつうひ', 'travel expenses'], ['{超|こ}える', 'こえる', 'to exceed']],
    },

    {
      id: 'n3-info-delivery', level: 'N3', type: 'info', form: 'flyer',
      title: 'Parcel delivery charges',
      text: `# さくら{運輸|うんゆ}　{宅配便|たくはいびん}の{料金|りょうきん}（さくら{県|けん}から{送|おく}る{場合|ばあい}）
|! サイズ（3{辺|へん}の{合計|ごうけい}） | {重|おも}さ | {県内|けんない}・となりの{県|けん} | {関東|かんとう}・{関西|かんさい} | {北海道|ほっかいどう}・{沖縄|おきなわ}
| «2|60cmまで» | «2|2kgまで» | 900{円|えん} | 1,100{円|えん} | «2|1,500{円|えん}»
| 80cmまで | 5kgまで | 1,150{円|えん} | 1,400{円|えん} | 2,000{円|えん}
| «1|100cmまで» | «1|10kgまで» | 1,400{円|えん} | «1|1,700{円|えん}» | 2,500{円|えん}
| 120cmまで | 15kgまで | 1,700{円|えん} | 2,000{円|えん} | 3,000{円|えん}
«1|※サイズと{重|おも}さのうち、{大|おお}きいほうの{料金|りょうきん}になります»。
・«2|{持|も}ち{込|こ}み{割引|わりびき}：お{店|みせ}やコンビニに{荷物|にもつ}を{持|も}ってきた{場合|ばあい}、1{個|こ}につき100{円|えん}{引|ひ}きます»。
・{集荷|しゅうか}：{電話|でんわ}かホームページで{申|もう}し{込|こ}むと、{家|いえ}まで{荷物|にもつ}を{取|と}りに{行|い}きます（{無料|むりょう}）。
・{時間|じかん}{指定|してい}：{午前中|ごぜんちゅう}、14〜16{時|じ}、16〜18{時|じ}、18〜20{時|じ}、19〜21{時|じ}から{選|えら}べます（{無料|むりょう}）。
・«2|クール{便|びん}（{冷|つめ}たい{物|もの}）：{上|うえ}の{料金|りょうきん}に、60cmまで＋250{円|えん}»、80cmまで＋350{円|えん}、100cmまで＋500{円|えん}。
・{再配達|さいはいたつ}：{不在|ふざい}の{時|とき}は、{不在票|ふざいひょう}の{電話番号|でんわばんごう}かホームページから{申|もう}し{込|こ}んでください。`,
      en: `Sakura Transport — parcel charges (sending from Sakura Prefecture)
Size (sum of 3 sides) | Weight | This and neighbouring prefectures | Kanto, Kansai | Hokkaido, Okinawa
Up to 60 cm | Up to 2 kg | 900 yen | 1,100 yen | 1,500 yen
Up to 80 cm | Up to 5 kg | 1,150 yen | 1,400 yen | 2,000 yen
Up to 100 cm | Up to 10 kg | 1,400 yen | 1,700 yen | 2,500 yen
Up to 120 cm | Up to 15 kg | 1,700 yen | 2,000 yen | 3,000 yen
* Whichever of size and weight gives the higher charge applies.
• Drop-off discount: 100 yen off per parcel if you bring it to one of our shops or a convenience store.
• Collection: apply by phone or on our website and we'll pick the parcel up from your home (free).
• Delivery time slots: morning, 14–16, 16–18, 18–20 or 19–21 (free).
• Chilled delivery: on top of the charges above, +250 yen up to 60 cm, +350 up to 80 cm, +500 up to 100 cm.
• Redelivery: if you were out, apply using the phone number on the missed-delivery slip or on our website.`,
      questions: [{
        q: '3{辺|へん}の{合計|ごうけい}が70cmで、{重|おも}さが8kgの{荷物|にもつ}を{関西|かんさい}に{送|おく}る。{家|いえ}まで{取|と}りに{来|き}てもらう{場合|ばあい}、{料金|りょうきん}はいくらか。',
        en: 'A parcel whose three sides add up to 70 cm and which weighs 8 kg is going to Kansai, collected from home. How much does it cost?',
        choices: [['1,700{円|えん}', '1,700 yen'], ['1,400{円|えん}', '1,400 yen'], ['1,600{円|えん}', '1,600 yen'], ['2,500{円|えん}', '2,500 yen']],
        why: 'By size (70 cm) it would be the 80 cm row, but by weight (8 kg) it’s the 100 cm / 10 kg row, and the ※ line says the higher one applies: 1,700 yen to Kansai. It’s collected from home, so no drop-off discount.',
      }, {
        q: '{北海道|ほっかいどう}の{友達|ともだち}に、{冷|つめ}たいケーキ（60cm、1kg）を{送|おく}りたい。コンビニに{持|も}って{行|い}って{送|おく}る。いくらかかるか。',
        en: 'You want to send a chilled cake (60 cm, 1 kg) to a friend in Hokkaido, dropping it off at a convenience store. How much does it cost?',
        choices: [['1,650{円|えん}', '1,650 yen'], ['1,750{円|えん}', '1,750 yen'], ['1,400{円|えん}', '1,400 yen'], ['1,850{円|えん}', '1,850 yen']],
        why: '60 cm / 1 kg to Hokkaido is 1,500 yen. Chilled adds 250 for up to 60 cm: 1,750. Dropping it off at a convenience store takes 100 off: 1,650 yen.',
      }],
      words: [['{宅配便|たくはいびん}', 'たくはいびん', 'parcel delivery'], ['{合計|ごうけい}', 'ごうけい', 'total'], ['{持|も}ち{込|こ}み', 'もちこみ', 'bringing in (yourself)'], ['{割引|わりびき}', 'わりびき', 'discount'], ['{指定|してい}', 'してい', 'specifying, choosing'], ['{再配達|さいはいたつ}', 'さいはいたつ', 'redelivery'], ['{不在票|ふざいひょう}', 'ふざいひょう', 'missed-delivery slip']],
    },

    {
      id: 'n3-email-return', level: 'N3', type: 'short', form: 'email',
      title: 'Returning an item',
      text: `@{件名|けんめい}|{返品|へんぴん}についてのご{案内|あんない}
@{送信|そうしん}{者|しゃ}|さくらネットショップ　お{客様|きゃくさま}{窓口|まどぐち}
{佐々木|ささき}{様|さま}
お{問|と}い{合|あ}わせいただいた{商品|しょうひん}の{返品|へんぴん}について、ご{案内|あんない}いたします。
{返品|へんぴん}は、{商品|しょうひん}がお{手元|てもと}に{届|とど}いてから{8日|ようか}{以内|いない}で、{未|み}{使用|しよう}のものに{限|かぎ}り{受|う}け{付|つ}けております。«1|お{客様|きゃくさま}のご{都合|つごう}による{返品|へんぴん}の{場合|ばあい}、{送料|そうりょう}はお{客様|きゃくさま}のご{負担|ふたん}となります»。なお、{商品|しょうひん}に{傷|きず}があった{場合|ばあい}は、{当店|とうてん}が{送料|そうりょう}を{負担|ふたん}いたします。
«1|{返品|へんぴん}をご{希望|きぼう}の{際|さい}は、{商品|しょうひん}と{一緒|いっしょ}に{届|とど}いた{納品書|のうひんしょ}を{同封|どうふう}してください»。`,
      en: `Subject: About returning an item
From: Sakura Net Shop, customer service
Dear Ms Sasaki,
We are writing about returning the item you asked about.
Returns are accepted only for unused items, within 8 days of the item reaching you. If you are returning an item for your own reasons, you pay the postage. However, if the item was damaged, we will pay the postage.
If you would like to return it, please enclose the delivery note that came with the item.`,
      questions: [{
        q: '{佐々木|ささき}さんは、{届|とど}いた{服|ふく}のサイズが{合|あ}わなかったので、{着|き}ないで{返品|へんぴん}したい。どうすればいいか。',
        en: 'The clothes Ms Sasaki received don’t fit, so she wants to return them unworn. What should she do?',
        choices: [
          ['{送料|そうりょう}を{自分|じぶん}で{払|はら}い、{納品書|のうひんしょ}と{一緒|いっしょ}に{服|ふく}を{送|おく}る。', 'Pay the postage herself and send the clothes with the delivery note.'],
          ['{送料|そうりょう}は{店|みせ}が{払|はら}うので、{服|ふく}だけを{送|おく}る。', 'Send only the clothes, since the shop pays the postage.'],
          ['{納品書|のうひんしょ}を{送|おく}って、{新|あたら}しい{服|ふく}を{送|おく}ってもらう。', 'Send the delivery note and have new clothes sent.'],
          ['{一度|いちど}{着|き}てみてから、{8日|ようか}{以内|いない}に{送|おく}る。', 'Try them on once, then send them within 8 days.'],
        ],
        why: 'A wrong size is the customer’s own reason (お客様のご都合), so she pays the postage; the shop pays only when the item was damaged (なお、… 傷があった場合). And the delivery note must go in the parcel (納品書を同封してください). Worn items can’t be returned — 未使用のものに限り.',
      }],
      words: [['{返品|へんぴん}', 'へんぴん', 'returning goods'], ['お{手元|てもと}', 'おてもと', '(in) your hands'], ['{未|み}{使用|しよう}', 'みしよう', 'unused'], ['{送料|そうりょう}', 'そうりょう', 'postage'], ['{負担|ふたん}', 'ふたん', 'bearing (a cost)'], ['{納品書|のうひんしょ}', 'のうひんしょ', 'delivery note'], ['{同封|どうふう}', 'どうふう', 'enclosing']],
    },

    {
      id: 'n3-notice-parking', level: 'N3', type: 'short', form: 'notice',
      title: 'Work on the car park',
      text: `# {駐車|ちゅうしゃ}{場|じょう}の{工事|こうじ}について
{居住|きょじゅう}{者|しゃ}の{皆様|みなさま}
{駐車|ちゅうしゃ}{場|じょう}の{線|せん}を{引|ひ}き{直|なお}す{工事|こうじ}を、{下記|かき}のとおり{行|おこな}います。
{日時|にちじ}：9{月|がつ}{6日|むいか}（{土|ど}）{午前|ごぜん}8{時|じ}〜{午後|ごご}5{時|じ}
«1|{工事|こうじ}の{間|あいだ}は{駐車|ちゅうしゃ}{場|じょう}に{車|くるま}を{止|と}めることができません»。«1|{前日|ぜんじつ}の{夜|よる}10{時|じ}までに、{車|くるま}を{近|ちか}くのコインパーキングなどに{移動|いどう}してください»。コインパーキングの{料金|りょうきん}は、{管理|かんり}{組合|くみあい}が{負担|ふたん}します。«1|{領収|りょうしゅう}{書|しょ}を{管理人|かんりにん}{室|しつ}に{出|だ}してください»。
> さくらハイツ{管理|かんり}{組合|くみあい}`,
      en: `About work on the car park
To all residents
Work to repaint the lines in the car park will be carried out as follows.
When: Saturday 6 September, 8 a.m. to 5 p.m.
Cars can't be parked in the car park during the work. Please move your car to a nearby coin car park or similar by 10 at night the day before. The management association will pay the coin parking charge. Please hand the receipt in to the manager's office.
Sakura Heights management association`,
      questions: [{
        q: '{車|くるま}を{持|も}っている{居住|きょじゅう}{者|しゃ}は、どうしなければならないか。',
        en: 'What must residents with a car do?',
        choices: [
          ['{5日|いつか}の{夜|よる}10{時|じ}までに{車|くるま}を{移動|いどう}し、{駐車|ちゅうしゃ}{料金|りょうきん}の{領収|りょうしゅう}{書|しょ}を{管理人|かんりにん}{室|しつ}に{出|だ}す。', 'Move the car by 10 p.m. on the 5th, and hand the parking receipt in to the manager’s office.'],
          ['{6日|むいか}の{朝|あさ}8{時|じ}までに{車|くるま}を{移動|いどう}し、{駐車|ちゅうしゃ}{料金|りょうきん}を{自分|じぶん}で{払|はら}う。', 'Move the car by 8 a.m. on the 6th, and pay the parking charge themselves.'],
          ['{6日|むいか}は{車|くるま}を{使|つか}わないで、{駐車|ちゅうしゃ}{場|じょう}に{止|と}めておく。', 'Not use the car on the 6th and leave it in the car park.'],
          ['{管理|かんり}{組合|くみあい}に、{車|くるま}を{移動|いどう}してもらう。', 'Have the management association move the car.'],
        ],
        why: 'The deadline is the night before the work (前日の夜10時まで), so the 5th, not the morning of the 6th. The association pays for the coin parking, but only if you hand in the receipt (領収書を … 出してください).',
      }],
      words: [['{駐車|ちゅうしゃ}{場|じょう}', 'ちゅうしゃじょう', 'car park'], ['{工事|こうじ}', 'こうじ', '(building) work'], ['{引|ひ}き{直|なお}す', 'ひきなおす', 'to redraw'], ['{移動|いどう}', 'いどう', 'moving'], ['{管理|かんり}{組合|くみあい}', 'かんりくみあい', 'management association'], ['{領収|りょうしゅう}{書|しょ}', 'りょうしゅうしょ', 'receipt']],
    },

    {
      id: 'n3-memo-client', level: 'N3', type: 'short', form: 'memo',
      title: 'Getting ready for a visitor',
      text: `{山口|やまぐち}さん
{明日|あした}の{午後|ごご}2{時|じ}に、ABC{商事|しょうじ}の{方|かた}が{新|あたら}しい{商品|しょうひん}の{説明|せつめい}を{聞|き}きに{来|こ}られます。{私|わたし}は{午前|ごぜん}{中|ちゅう}、{外|そと}での{会議|かいぎ}があり、{会社|かいしゃ}に{戻|もど}るのは1{時|じ}{半|はん}ごろになります。
«1|それまでに、{説明|せつめい}に{使|つか}う{資料|しりょう}を5{部|ぶ}コピーして、{会議|かいぎ}{室|しつ}に{用意|ようい}しておいてもらえますか»。{資料|しりょう}は{共有|きょうゆう}フォルダの「{新|しん}{商品|しょうひん}」に{入|はい}っています。お{茶|ちゃ}は{私|わたし}が{戻|もど}ってから{頼|たの}みます。
> {部長|ぶちょう}　{村上|むらかみ}`,
      en: `Ms Yamaguchi,
Tomorrow at two in the afternoon, people from ABC Trading are coming to hear about the new product. I have a meeting outside in the morning, and I'll be back at the office around half past one.
Could you copy five sets of the materials for the presentation and have them ready in the meeting room by then? The materials are in the "New product" folder on the shared drive. I'll order the tea when I get back.
Murakami, department manager`,
      questions: [{
        q: '{山口|やまぐち}さんが、{明日|あした}の1{時|じ}{半|はん}までにしなければならないことは{何|なに}か。',
        en: 'What must Ms Yamaguchi do by half past one tomorrow?',
        choices: [
          ['{資料|しりょう}を5{部|ぶ}コピーして、{会議|かいぎ}{室|しつ}に{用意|ようい}しておく。', 'Copy five sets of the materials and have them ready in the meeting room.'],
          ['ABC{商事|しょうじ}の{人|ひと}に、{新|あたら}しい{商品|しょうひん}の{説明|せつめい}をする。', 'Explain the new product to the people from ABC Trading.'],
          ['{部長|ぶちょう}の{代|か}わりに、{外|そと}での{会議|かいぎ}に{出|で}る。', 'Go to the outside meeting in the manager’s place.'],
          ['{会議|かいぎ}{室|しつ}に、お{茶|ちゃ}を{用意|ようい}しておく。', 'Have tea ready in the meeting room.'],
        ],
        why: 'それまでに (“by then”) points back to the manager’s return at half past one, and 〜てもらえますか is the request: five copies of the materials, ready in the meeting room. The manager will give the explanation and order the tea himself after getting back (私が戻ってから頼みます).',
      }],
      words: [['{商事|しょうじ}', 'しょうじ', 'trading (company)'], ['{来|こ}られる', 'こられる', 'to come (respectful)'], ['{資料|しりょう}', 'しりょう', 'materials, documents'], ['〜{部|ぶ}', 'ぶ', 'copies (counter)'], ['{用意|ようい}', 'ようい', 'preparing'], ['{共有|きょうゆう}', 'きょうゆう', 'shared']],
    },

    {
      id: 'n3-notice-typhoon', level: 'N3', type: 'short', form: 'notice',
      title: 'School on typhoon days',
      text: `# {台風|たいふう}の{時|とき}の{授業|じゅぎょう}について
{保護|ほご}{者|しゃ}の{皆様|みなさま}
{台風|たいふう}が{近|ちか}づいた{時|とき}は、{次|つぎ}のようにします。
・«1|{朝|あさ}7{時|じ}の{時点|じてん}で、さくら{市|し}に「{警報|けいほう}」が{出|で}ている{場合|ばあい}は、{授業|じゅぎょう}を{休|やす}みにします»。
・7{時|じ}より{後|あと}に{警報|けいほう}が{出|で}た{場合|ばあい}は、{子|こ}どもたちの{安全|あんぜん}を{考|かんが}えて{学校|がっこう}で{判断|はんだん}し、メールでお{知|し}らせします。
・{注意報|ちゅういほう}だけの{場合|ばあい}は、ふだんどおり{授業|じゅぎょう}があります。
{休|やす}みになっても、{授業|じゅぎょう}を{別|べつ}の{日|ひ}に{行|おこな}うことはありません。
> さくら{小学校|しょうがっこう}`,
      en: `Lessons when a typhoon comes
To all parents and guardians
When a typhoon is approaching, we will do the following.
• If a "warning" is in force for Sakura City at 7 in the morning, there will be no lessons.
• If a warning is issued after 7, the school will decide with the children's safety in mind and let you know by email.
• If there is only an advisory, there will be lessons as usual.
Even if lessons are cancelled, they will not be made up on another day.
Sakura Primary School`,
      questions: [{
        q: '{朝|あさ}6{時|じ}{半|はん}に{警報|けいほう}が{出|で}て、{朝|あさ}7{時|じ}にもまだ{出|で}ていた。この{日|ひ}はどうなるか。',
        en: 'A warning was issued at 6:30 a.m. and was still in force at 7. What happens that day?',
        choices: [
          ['{授業|じゅぎょう}は{休|やす}みになる。', 'There are no lessons.'],
          ['{学校|がっこう}がメールで{知|し}らせるまで{待|ま}つ。', 'Parents wait until the school emails.'],
          ['ふだんどおり{授業|じゅぎょう}がある。', 'There are lessons as usual.'],
          ['{授業|じゅぎょう}は{午後|ごご}から{始|はじ}まる。', 'Lessons start in the afternoon.'],
        ],
        why: 'What counts is whether a warning is in force at 7 a.m. (朝7時の時点で) — here it is, so lessons are off. The school only decides case by case (and emails) when a warning comes after 7; an advisory (注意報) alone changes nothing.',
      }],
      words: [['{台風|たいふう}', 'たいふう', 'typhoon'], ['{保護|ほご}{者|しゃ}', 'ほごしゃ', 'parent, guardian'], ['{時点|じてん}', 'じてん', 'point (in time)'], ['{警報|けいほう}', 'けいほう', '(weather) warning'], ['{注意報|ちゅういほう}', 'ちゅういほう', '(weather) advisory'], ['{判断|はんだん}', 'はんだん', 'decision, judgement']],
    },

    {
      id: 'n3-email-volunteer', level: 'N3', type: 'short', form: 'email',
      title: 'The river clean-up',
      text: `@{件名|けんめい}|{日曜日|にちようび}の{清掃|せいそう}ボランティアについて
@{送信|そうしん}{者|しゃ}|さくら{川|がわ}をきれいにする{会|かい}　{原田|はらだ}
ボランティアの{皆|みな}さん
{今週|こんしゅう}{日曜日|にちようび}の{川|かわ}の{清掃|せいそう}ですが、{参加|さんか}{希望|きぼう}の{方|かた}が{予想|よそう}より{多|おお}かったため、{集合|しゅうごう}{場所|ばしょ}を{二|ふた}つに{分|わ}けることにしました。
«1|{名字|みょうじ}が「あ」から「な」で{始|はじ}まる{方|かた}は{西公園|にしこうえん}、「は」から「わ」で{始|はじ}まる{方|かた}は{東公園|ひがしこうえん}に、9{時|じ}に{集|あつ}まってください»。{軍手|ぐんて}とごみ{袋|ぶくろ}は、こちらで{用意|ようい}します。«1|{飲|の}み{物|もの}は{各自|かくじ}でお{持|も}ちください»。`,
      en: `Subject: About Sunday's clean-up volunteering
From: Harada, Sakura River Clean-up Group
To all volunteers,
About this Sunday's river clean-up: more people want to take part than we expected, so we have decided to split the meeting point into two.
If your surname begins with a sound from あ to な, please gather at West Park, and from は to わ at East Park, at 9 o'clock. We will provide work gloves and rubbish bags. Please bring your own drinks.`,
      questions: [{
        q: '「{森|もり}」という{名字|みょうじ}の{人|ひと}は、{日曜日|にちようび}にどうすればいいか。',
        en: 'What should someone with the surname Mori do on Sunday?',
        choices: [
          ['9{時|じ}に{東公園|ひがしこうえん}へ{行|い}く。{飲|の}み{物|もの}を{持|も}っていく。', 'Go to East Park at 9, with a drink.'],
          ['9{時|じ}に{西公園|にしこうえん}へ{行|い}く。{飲|の}み{物|もの}を{持|も}っていく。', 'Go to West Park at 9, with a drink.'],
          ['9{時|じ}に{東公園|ひがしこうえん}へ{行|い}く。{軍手|ぐんて}とごみ{袋|ぶくろ}を{持|も}っていく。', 'Go to East Park at 9, with work gloves and rubbish bags.'],
          ['9{時|じ}に{西公園|にしこうえん}へ{行|い}く。{軍手|ぐんて}とごみ{袋|ぶくろ}を{持|も}っていく。', 'Go to West Park at 9, with work gloves and rubbish bags.'],
        ],
        why: '森 is read もり, which starts with ま — between は and わ, so East Park. Gloves and bags are provided (こちらで用意します); drinks are each person’s own (各自でお持ちください).',
      }],
      words: [['{清掃|せいそう}', 'せいそう', 'cleaning'], ['{予想|よそう}', 'よそう', 'expectation'], ['{集合|しゅうごう}', 'しゅうごう', 'meeting, gathering'], ['{名字|みょうじ}', 'みょうじ', 'surname'], ['{軍手|ぐんて}', 'ぐんて', 'work gloves'], ['{各自|かくじ}', 'かくじ', 'each person']],
    },

    {
      id: 'n3-notice-bikeshare', level: 'N3', type: 'short', form: 'notice',
      title: 'Bike-share prices go up',
      text: `# シェアサイクル{料金|りょうきん}{変更|へんこう}のお{知|し}らせ
いつも「さくらサイクル」をご{利用|りよう}いただき、ありがとうございます。
{自転車|じてんしゃ}の{修理|しゅうり}や{電池|でんち}の{交換|こうかん}にかかる{費用|ひよう}が{上|あ}がっているため、«1|4{月|がつ}{1日|ついたち}から、{最初|さいしょ}の30{分|ぷん}の{料金|りょうきん}を150{円|えん}から200{円|えん}に{変更|へんこう}します»。その{後|あと}の30{分|ぷん}ごとの{料金|りょうきん}100{円|えん}と、{月額|げつがく}プランの{料金|りょうきん}は{変|か}わりません。
これからも、{安全|あんぜん}で{便利|べんり}なサービスを{目指|めざ}してまいります。
> さくらサイクル{株式会社|かぶしきがいしゃ}`,
      en: `Notice of bike-share price change
Thank you for using Sakura Cycle.
Because the cost of repairing bicycles and changing batteries is rising, from 1 April the price for the first 30 minutes will change from 150 yen to 200 yen. The price of 100 yen for each 30 minutes after that, and the price of the monthly plan, will not change.
We will keep working to provide a safe and convenient service.
Sakura Cycle Co., Ltd.`,
      questions: [{
        q: 'このお{知|し}らせで、{一番|いちばん}{伝|つた}えたいことは{何|なに}か。',
        en: 'What does this notice most want to say?',
        choices: [
          ['4{月|がつ}から、{最初|さいしょ}の30{分|ぷん}の{料金|りょうきん}が{上|あ}がること', 'That from April the price of the first 30 minutes goes up'],
          ['4{月|がつ}から、{月額|げつがく}プランの{料金|りょうきん}が{上|あ}がること', 'That from April the monthly plan costs more'],
          ['{自転車|じてんしゃ}の{修理|しゅうり}のため、サービスを{休|やす}むこと', 'That the service is stopping for bicycle repairs'],
          ['4{月|がつ}から、30{分|ぷん}ごとの{料金|りょうきん}が100{円|えん}になること', 'That from April each 30 minutes costs 100 yen'],
        ],
        why: 'The rising costs are the reason (〜ため); the change is the first 30 minutes, from 150 to 200 yen. Each later 30 minutes was already 100 yen and stays that way, and the monthly plan doesn’t change.',
      }],
      words: [['シェアサイクル', '', 'bike share'], ['{修理|しゅうり}', 'しゅうり', 'repair'], ['{電池|でんち}', 'でんち', 'battery'], ['{交換|こうかん}', 'こうかん', 'replacing, exchange'], ['{費用|ひよう}', 'ひよう', 'cost'], ['{月額|げつがく}', 'げつがく', 'monthly (charge)'], ['{目指|めざ}す', 'めざす', 'to aim for']],
    },

    {
      id: 'n3-info-apartments', level: 'N3', type: 'info', form: 'flyer',
      title: 'Flats to rent',
      text: `# さくら{不動産|ふどうさん}　おすすめの{部屋|へや}
|! {名前|なまえ} | {家賃|やちん}（{月|つき}） | {広|ひろ}さ | {駅|えき}から | そのほか
| ① コーポ{桜|さくら} | 52,000{円|えん} | 1K（20㎡） | {歩|ある}いて15{分|ふん} | 2{階|かい}。ペット{不可|ふか}
| «1|② ハイツみどり» | «1|68,000{円|えん}» | 1DK（30㎡） | «1|{歩|ある}いて5{分|ふん}» | 3{階|がい}。«1|ペット{可|か}（{小型|こがた}{犬|けん}・{猫|ねこ}）»
| «2|③ メゾン{青葉|あおば}» | «2|61,000{円|えん}» | 1K（25㎡） | {歩|ある}いて8{分|ぷん} | 1{階|かい}。ペット{不可|ふか}。«2|{楽器|がっき}{可|か}»
| ④ サンハウス | 58,000{円|えん} | 1K（22㎡） | バス10{分|ぷん} | 5{階|かい}。ペット{可|か}（{猫|ねこ}のみ）
・«1|{家賃|やちん}のほかに、{毎月|まいつき}{管理|かんり}{費|ひ}が3,000{円|えん}かかります（②は5,000{円|えん}）»。
・«2|{契約|けいやく}の{時|とき}に、{敷金|しききん}（{家賃|やちん}1か{月|げつ}{分|ぶん}）と{礼金|れいきん}（{家賃|やちん}1か{月|げつ}{分|ぶん}）が{必要|ひつよう}です。③は{礼金|れいきん}なし»。
・{駐車|ちゅうしゃ}{場|じょう}は、①と④にのみあります（{月|つき}8,000{円|えん}）。
・どの{部屋|へや}も、{見学|けんがく}は{予約|よやく}{制|せい}です。お{電話|でんわ}でお{申|もう}し{込|こ}みください。
・{契約|けいやく}の{時|とき}には、ほかに{火災|かさい}{保険|ほけん}{料|りょう}（2{年|ねん}で20,000{円|えん}）と{鍵|かぎ}の{交換|こうかん}{代|だい}（15,000{円|えん}）がかかります。
・インターネットは、どの{部屋|へや}も{無料|むりょう}で{使|つか}えます。
・お{申|もう}し{込|こ}みから{入居|にゅうきょ}まで、だいたい2{週間|しゅうかん}かかります。`,
      en: `Sakura Real Estate — recommended flats
Name | Rent (monthly) | Size | From the station | Other
① Corpo Sakura | 52,000 yen | 1K (20 m²) | 15 min on foot | 2nd floor. No pets
② Heights Midori | 68,000 yen | 1DK (30 m²) | 5 min on foot | 3rd floor. Pets OK (small dogs, cats)
③ Maison Aoba | 61,000 yen | 1K (25 m²) | 8 min on foot | 1st floor. No pets. Instruments OK
④ Sun House | 58,000 yen | 1K (22 m²) | 10 min by bus | 5th floor. Pets OK (cats only)
• On top of the rent, there is a management fee of 3,000 yen a month (5,000 yen for ②).
• When you sign the contract, a deposit (one month's rent) and key money (one month's rent) are needed. There is no key money for ③.
• Only ① and ④ have parking (8,000 yen a month).
• Viewings for all flats are by appointment. Please book by phone.
• When you sign the contract, fire insurance (20,000 yen for 2 years) and a lock change (15,000 yen) are also charged.
• All flats have free internet.
• It takes about 2 weeks from application to moving in.`,
      questions: [{
        q: '{猫|ねこ}を{飼|か}っている{会社|かいしゃ}{員|いん}のハンさんは、{駅|えき}から{歩|ある}いて10{分|ぷん}{以内|いない}の{部屋|へや}を{探|さが}している。{家賃|やちん}と{管理|かんり}{費|ひ}を{合|あ}わせて、{毎月|まいつき}いくら{払|はら}うことになるか。',
        en: 'Han, an office worker who has a cat, is looking for a flat within 10 minutes’ walk of the station. How much will Han pay each month, rent and management fee together?',
        choices: [
          ['73,000{円|えん}', '73,000 yen'],
          ['71,000{円|えん}', '71,000 yen'],
          ['68,000{円|えん}', '68,000 yen'],
          ['64,000{円|えん}', '64,000 yen'],
        ],
        why: 'Cats are allowed only in ② and ④, and ④ is a bus ride away, so it’s ②: 68,000 yen. Its management fee is 5,000, not the usual 3,000 (②は5,000円): 73,000 yen a month.',
      }, {
        q: 'ピアノを{弾|ひ}く{学生|がくせい}のチェンさんが{選|えら}ぶ{部屋|へや}で、{契約|けいやく}の{時|とき}に{払|はら}う{敷金|しききん}と{礼金|れいきん}は、{合|あ}わせていくらか。',
        en: 'Chen, a student who plays the piano, chooses a flat. How much are the deposit and key money together at signing?',
        choices: [
          ['61,000{円|えん}', '61,000 yen'],
          ['122,000{円|えん}', '122,000 yen'],
          ['104,000{円|えん}', '104,000 yen'],
          ['0{円|えん}', '0 yen'],
        ],
        why: 'Only ③ allows instruments (楽器可). The deposit is one month’s rent, 61,000 yen, and ③ has no key money (③は礼金なし), so 61,000 yen in all.',
      }],
      words: [['{不動産|ふどうさん}', 'ふどうさん', 'real estate'], ['{家賃|やちん}', 'やちん', 'rent'], ['{不可|ふか} / {可|か}', 'ふか / か', 'not allowed / allowed'], ['{管理|かんり}{費|ひ}', 'かんりひ', 'management fee'], ['{敷金|しききん}', 'しききん', 'deposit'], ['{礼金|れいきん}', 'れいきん', 'key money'], ['{楽器|がっき}', 'がっき', 'musical instrument']],
    },

    {
      id: 'n3-info-courses', level: 'N3', type: 'info', form: 'flyer',
      title: 'Spring courses at the community college',
      text: `# さくら{市民|しみん}{大学|だいがく}　{春|はる}の{講座|こうざ}
|! {講座|こうざ} | {曜日|ようび}・{時間|じかん} | {回数|かいすう} | {受講|じゅこう}{料|りょう} | {定員|ていいん}
| A　はじめての{写真|しゃしん} | {火|か}　10:00〜12:00 | 6{回|かい} | «2|6,000{円|えん}» | 20{名|めい}
| B　{英語|えいご}で{話|はな}そう | {水|すい}　19:00〜20:30 | 10{回|かい} | «2|12,000{円|えん}» | 15{名|めい}
| «1|C　{体|からだ}にやさしいヨガ» | «1|{土|ど}　9:30〜11:00» | 8{回|かい} | «1|8,000{円|えん}» | 25{名|めい}
| «1|D　{地域|ちいき}の{歴史|れきし}を{歩|ある}く» | «1|{日|にち}　13:00〜16:00» | 4{回|かい} | «1|4,000{円|えん}» | 30{名|めい}
■«1|{受講|じゅこう}できる{方|かた}：さくら{市内|しない}に{住|す}んでいるか、{通勤|つうきん}・{通学|つうがく}している16{歳|さい}{以上|いじょう}の{方|かた}»
■{申|もう}し{込|こ}み：3{月|がつ}{1日|ついたち}〜15{日|にち}に、はがきかホームページで。«1|{一人|ひとり}2{講座|こうざ}まで»。
■{定員|ていいん}を{超|こ}えた{場合|ばあい}は{抽選|ちゅうせん}です。{結果|けっか}は3{月|がつ}{20日|はつか}ごろお{知|し}らせします。
■«2|65{歳|さい}{以上|いじょう}の{方|かた}は、{受講|じゅこう}{料|りょう}が{半額|はんがく}になります»。
■Cは{動|うご}きやすい{服|ふく}で{来|き}てください。Dは{雨|あめ}でも{行|おこな}います。
■{受講|じゅこう}{料|りょう}は、{最初|さいしょ}の{講座|こうざ}の{日|ひ}に{会場|かいじょう}で{払|はら}ってください。{一度|いちど}{払|はら}った{受講|じゅこう}{料|りょう}は、お{返|かえ}しできません。
■{会場|かいじょう}：さくら{市民|しみん}センター（Dは、{市役所前|しやくしょまえ}に{集合|しゅうごう}）
■お{問|と}い{合|あ}わせ：さくら{市民|しみん}{大学|だいがく}{事務|じむ}{局|きょく}（{平日|へいじつ}9:00〜17:00）`,
      en: `Sakura Community College — spring courses
Course | Day and time | Sessions | Fee | Places
A Photography for beginners | Tue 10:00–12:00 | 6 | 6,000 yen | 20
B Let's speak English | Wed 19:00–20:30 | 10 | 12,000 yen | 15
C Gentle yoga | Sat 9:30–11:00 | 8 | 8,000 yen | 25
D Walking through local history | Sun 13:00–16:00 | 4 | 4,000 yen | 30
Who can take a course: people aged 16 or over who live, work or study in Sakura City
Applications: 1–15 March, by postcard or on our website. Up to 2 courses per person.
If a course is oversubscribed, places are drawn by lot. Results will be sent around 20 March.
People aged 65 or over pay half the fee.
For C, please wear clothes you can move in easily. D goes ahead even if it rains.
Please pay the fee at the venue on the day of the first session. Fees cannot be refunded once paid.
Venue: Sakura Community Centre (for D, meet in front of City Hall)
Enquiries: Sakura Community College office (weekdays 9:00–17:00)`,
      questions: [{
        q: '{隣|となり}の{市|し}に{住|す}み、さくら{市|し}の{会社|かいしゃ}に{勤|つと}めている{田中|たなか}さん（35{歳|さい}）は、{平日|へいじつ}は{夜|よる}8{時|じ}まで{仕事|しごと}がある。{土日|どにち}の{講座|こうざ}に{二|ふた}つ{申|もう}し{込|こ}みたい。{受講|じゅこう}{料|りょう}は{全部|ぜんぶ}でいくらか。',
        en: 'Mr Tanaka (35) lives in the next city and works for a company in Sakura City; on weekdays he works until 8 p.m. He wants to apply for two weekend courses. How much are the fees in total?',
        choices: [
          ['12,000{円|えん}', '12,000 yen'],
          ['6,000{円|えん}', '6,000 yen'],
          ['16,000{円|えん}', '16,000 yen'],
          ['20,000{円|えん}', '20,000 yen'],
        ],
        why: 'He works in the city (通勤), so he can take courses even though he lives elsewhere. The weekend courses are C (Saturday, 8,000) and D (Sunday, 4,000) — two, the most allowed: 12,000 yen.',
      }, {
        q: '70{歳|さい}の{山本|やまもと}さんは、AとBに{申|もう}し{込|こ}みたい。{受講|じゅこう}{料|りょう}は{全部|ぜんぶ}でいくらか。',
        en: 'Ms Yamamoto, who is 70, wants to apply for A and B. How much are the fees in total?',
        choices: [
          ['9,000{円|えん}', '9,000 yen'],
          ['18,000{円|えん}', '18,000 yen'],
          ['6,000{円|えん}', '6,000 yen'],
          ['12,000{円|えん}', '12,000 yen'],
        ],
        why: 'A and B cost 6,000 + 12,000 = 18,000 yen, but people aged 65 and over pay half (半額): 9,000 yen.',
      }],
      words: [['{講座|こうざ}', 'こうざ', 'course'], ['{受講|じゅこう}{料|りょう}', 'じゅこうりょう', 'course fee'], ['{定員|ていいん}', 'ていいん', 'number of places'], ['{通勤|つうきん}・{通学|つうがく}', 'つうきん・つうがく', 'commuting to work / school'], ['{抽選|ちゅうせん}', 'ちゅうせん', 'drawing lots'], ['{半額|はんがく}', 'はんがく', 'half price']],
    },

    {
      id: 'n3-info-hotel', level: 'N3', type: 'info', form: 'flyer',
      title: 'Hotel room plans',
      text: `# ホテルさくら　{宿泊|しゅくはく}プラン（2{名|めい}1{室|しつ}・1{泊|はく}の{料金|りょうきん}）
|! プラン | {食事|しょくじ} | {平日|へいじつ} | {土曜|どよう}・{祝|しゅく}{前日|ぜんじつ}
| ① {素泊|すど}まり | なし | 12,000{円|えん} | 16,000{円|えん}
| «2|② {朝食|ちょうしょく}{付|つ}き» | {朝食|ちょうしょく} | «2|15,000{円|えん}» | «1|19,000{円|えん}»
| ③ {二食|にしょく}{付|つ}き | {朝食|ちょうしょく}・{夕食|ゆうしょく} | 22,000{円|えん} | 26,000{円|えん}
| ④ {早|はや}{割|わり}（{朝食|ちょうしょく}{付|つ}き） | {朝食|ちょうしょく} | 13,000{円|えん} | 17,000{円|えん}
・«1|④は、{宿泊|しゅくはく}{日|び}の30{日|にち}{前|まえ}までにご{予約|よやく}の{場合|ばあい}のみご{利用|りよう}いただけます。キャンセル・{変更|へんこう}はできません»。
・{小学生|しょうがくせい}は{大人|おとな}{料金|りょうきん}の70%、{小学校|しょうがっこう}{入学|にゅうがく}{前|まえ}のお{子様|こさま}（{食事|しょくじ}・{布団|ふとん}なし）は{無料|むりょう}です。
・«2|キャンセル{料|りょう}（①〜③）：{前日|ぜんじつ}は{料金|りょうきん}の50%、{当日|とうじつ}は100%いただきます»。
・チェックイン 15:00〜　チェックアウト 〜11:00
・{駐車|ちゅうしゃ}{場|じょう}は1{泊|はく}1,000{円|えん}です。
・{大|だい}{浴場|よくじょう}は、15:00〜24:00と6:00〜9:00にご{利用|りよう}いただけます。
・{夕食|ゆうしょく}は、18:00〜20:00に1{階|かい}のレストランでお{召|め}し{上|あ}がりください。
・ペットを{連|つ}れてのご{宿泊|しゅくはく}はできません。`,
      en: `Hotel Sakura — room plans (per room for 2 people, per night)
Plan | Meals | Weekdays | Saturdays and the night before a holiday
① Room only | None | 12,000 yen | 16,000 yen
② With breakfast | Breakfast | 15,000 yen | 19,000 yen
③ Half board | Breakfast and dinner | 22,000 yen | 26,000 yen
④ Early-bird (with breakfast) | Breakfast | 13,000 yen | 17,000 yen
• ④ is only available if you book at least 30 days before your stay. It can't be cancelled or changed.
• Primary-school children pay 70% of the adult price; children who haven't started school yet (no meals or futon) stay free.
• Cancellation fee (① to ③): 50% of the price the day before, 100% on the day.
• Check-in from 15:00, check-out by 11:00
• Parking is 1,000 yen per night.
• The large public bath is open 15:00–24:00 and 6:00–9:00.
• Dinner is served 18:00–20:00 in the restaurant on the ground floor.
• Guests can't stay with pets.`,
      questions: [{
        q: '{来月|らいげつ}の{土曜日|どようび}に{二人|ふたり}で{泊|と}まりたい。{予約|よやく}は{今日|きょう}（{宿泊|しゅくはく}{日|び}の40{日|にち}{前|まえ}）する。{朝食|ちょうしょく}は{食|た}べたいが、{予定|よてい}が{変|か}わるかもしれないので、キャンセルできるプランがいい。{一番|いちばん}{安|やす}いのはどれか。',
        en: 'Two people want to stay on a Saturday next month, booking today (40 days ahead). They want breakfast, but their plans may change, so they want a plan they can cancel. Which is the cheapest?',
        choices: [
          ['② 19,000{円|えん}', '② 19,000 yen'],
          ['④ 17,000{円|えん}', '④ 17,000 yen'],
          ['① 16,000{円|えん}', '① 16,000 yen'],
          ['③ 26,000{円|えん}', '③ 26,000 yen'],
        ],
        why: '④ is cheaper and they’re booking early enough, but it can’t be cancelled (キャンセル・変更はできません). ① has no breakfast. So the cheapest that fits is ② at the Saturday price, 19,000 yen.',
      }, {
        q: '{平日|へいじつ}に②で{泊|と}まる{予定|よてい}だったが、{前|まえ}の{日|ひ}に{急|きゅう}に{行|い}けなくなった。キャンセル{料|りょう}はいくらか。',
        en: 'Someone was going to stay on plan ② on a weekday, but suddenly can’t go, the day before. How much is the cancellation fee?',
        choices: [
          ['7,500{円|えん}', '7,500 yen'],
          ['15,000{円|えん}', '15,000 yen'],
          ['0{円|えん}', '0 yen'],
          ['9,500{円|えん}', '9,500 yen'],
        ],
        why: 'Cancelling the day before costs 50% of the price (前日は料金の50%). ② on a weekday is 15,000 yen, so 7,500 yen. 9,500 would be half the Saturday price.',
      }],
      words: [['{宿泊|しゅくはく}', 'しゅくはく', 'staying (at a hotel)'], ['{素泊|すど}まり', 'すどまり', 'room only'], ['〜{付|つ}き', 'つき', 'with …'], ['{祝|しゅく}{前日|ぜんじつ}', 'しゅくぜんじつ', 'the day before a public holiday'], ['{早|はや}{割|わり}', 'はやわり', 'early-booking discount'], ['キャンセル{料|りょう}', 'キャンセルりょう', 'cancellation fee']],
    },

    {
      id: 'n3-info-healthcheck', level: 'N3', type: 'info', form: 'flyer',
      title: 'The company health check',
      text: `# {健康|けんこう}{診断|しんだん}のお{知|し}らせ
{社員|しゃいん}の{皆|みな}さん
{今年|ことし}の{健康|けんこう}{診断|しんだん}を、{次|つぎ}の{日程|にってい}で{行|おこな}います。
|! {日|ひ}にち | {時間|じかん} | {受|う}ける{人|ひと}
| 6{月|がつ}{9日|ここのか}（{火|か}） | 9:00〜11:30 | {営業|えいぎょう}{部|ぶ}
| 6{月|がつ}{10日|とおか}（{水|すい}） | 9:00〜11:30 | {総務|そうむ}{部|ぶ}・{経理|けいり}{部|ぶ}
| 6{月|がつ}11{日|にち}（{木|もく}） | 9:00〜11:30 | {開発|かいはつ}{部|ぶ}
| «1|6{月|がつ}12{日|にち}（{金|きん}）» | «1|13:00〜15:30» | «1|{上|うえ}の{日|ひ}に{受|う}けられなかった{人|ひと}»
・{前|まえ}の{日|ひ}の{夜|よる}9{時|じ}{以降|いこう}は、{水|みず}{以外|いがい}は{何|なに}も{食|た}べたり{飲|の}んだりしないでください。
・{午前|ごぜん}に{受|う}ける{人|ひと}は、{朝|あさ}ご{飯|はん}を{食|た}べないで{来|き}てください。«2|{午後|ごご}に{受|う}ける{人|ひと}は、{朝|あさ}7{時|じ}までに{軽|かる}い{朝食|ちょうしょく}をとってもかまいません»。
・{当日|とうじつ}は{保険|ほけん}{証|しょう}と、{前|まえ}に{配|くば}った{問診|もんしん}{票|ひょう}を{持|も}ってきてください。
・{受|う}けなかった{人|ひと}は、{自分|じぶん}で{病院|びょういん}に{行|い}って{受|う}け、{結果|けっか}を{総務|そうむ}{部|ぶ}に{出|だ}さなければなりません。
・{会場|かいじょう}は、{本社|ほんしゃ}8{階|かい}の{大|だい}{会議|かいぎ}{室|しつ}です。
・{結果|けっか}は、7{月|がつ}{中旬|ちゅうじゅん}に{一人|ひとり}ずつ{封筒|ふうとう}でお{渡|わた}しします。
・{当日|とうじつ}に{体調|たいちょう}が{悪|わる}い{人|ひと}は{無理|むり}をしないで{総務|そうむ}{部|ぶ}に{連絡|れんらく}し、12{日|にち}に{受|う}けてください。
> {総務|そうむ}{部|ぶ}`,
      en: `Notice of health checks
To all staff
This year's health checks will be held on the following dates.
Date | Time | For
Tue 9 June | 9:00–11:30 | Sales
Wed 10 June | 9:00–11:30 | General Affairs and Accounts
Thu 11 June | 9:00–11:30 | Development
Fri 12 June | 13:00–15:30 | Anyone who couldn't come on their day
• From 9 p.m. the night before, please don't eat or drink anything except water.
• If your check is in the morning, please come without breakfast. If your check is in the afternoon, you may have a light breakfast before 7 in the morning.
• On the day, please bring your health insurance card and the questionnaire handed out earlier.
• Anyone who doesn't have the check must go to a hospital themselves for one, and hand the results in to General Affairs.
• The venue is the large meeting room on the 8th floor of the head office.
• Results will be handed to each person in an envelope in mid-July.
• If you feel unwell on the day, don't push yourself: contact General Affairs and have your check on the 12th.
General Affairs`,
      questions: [{
        q: '{経理|けいり}{部|ぶ}の{木下|きのした}さんは、6{月|がつ}{10日|とおか}は{朝|あさ}から{大阪|おおさか}へ{出張|しゅっちょう}することになった。{健康|けんこう}{診断|しんだん}はいつ{受|う}けるか。',
        en: 'Mr Kinoshita in Accounts now has a business trip to Osaka from the morning of 10 June. When does he have his health check?',
        choices: [
          ['6{月|がつ}12{日|にち}の{午後|ごご}', 'The afternoon of 12 June'],
          ['6{月|がつ}{10日|とおか}の{午前|ごぜん}', 'The morning of 10 June'],
          ['6{月|がつ}11{日|にち}の{午前|ごぜん}', 'The morning of 11 June'],
          ['{自分|じぶん}で{病院|びょういん}に{行|い}って{受|う}ける', 'He goes to a hospital himself'],
        ],
        why: 'Accounts is on the 10th, when he’s away. The 12th (afternoon) is for anyone who couldn’t come on their own day (上の日に受けられなかった人). The 11th is Development’s day, and the hospital is only for people who miss the check altogether.',
      }, {
        q: '{木下|きのした}さんは、{健康|けんこう}{診断|しんだん}の{日|ひ}の{朝|あさ}、どうすればいいか。',
        en: 'What should Mr Kinoshita do on the morning of his check?',
        choices: [
          ['{朝|あさ}7{時|じ}までなら、{軽|かる}い{朝|あさ}ご{飯|はん}を{食|た}べてもいい。', 'He may have a light breakfast, as long as it’s before 7.'],
          ['{朝|あさ}ご{飯|はん}も{水|みず}も、{何|なに}もとらないで{行|い}く。', 'Go without breakfast or even water.'],
          ['{朝|あさ}ご{飯|はん}を{食|た}べないで、9{時|じ}までに{行|い}く。', 'Go by 9 without breakfast.'],
          ['{朝|あさ}、{保険|ほけん}{証|しょう}を{総務|そうむ}{部|ぶ}に{出|だ}しに{行|い}く。', 'Take his insurance card to General Affairs in the morning.'],
        ],
        why: 'His check is on the afternoon of the 12th, and afternoon people may have a light breakfast before 7 (朝7時までに軽い朝食をとってもかまいません). Water is allowed for everyone; going without breakfast is the rule for the morning checks.',
      }],
      words: [['{健康|けんこう}{診断|しんだん}', 'けんこうしんだん', 'health check'], ['{日程|にってい}', 'にってい', 'schedule'], ['{経理|けいり}{部|ぶ}', 'けいりぶ', 'accounts department'], ['{以降|いこう}', 'いこう', 'from … on'], ['〜てもかまいません', '', 'it’s all right to …'], ['{問診|もんしん}{票|ひょう}', 'もんしんひょう', 'medical questionnaire'], ['{出張|しゅっちょう}', 'しゅっちょう', 'business trip']],
    },

    // ─── N2 ──────────────────────────────────────────────────────────────

    {
      id: 'n2-email-shipping', level: 'N2', type: 'short', form: 'email',
      title: 'A change in delivery charges',
      text: `@{件名|けんめい}|{配送料|はいそうりょう}{改定|かいてい}のお{知|し}らせ
@{送信者|そうしんしゃ}|{株式会社|かぶしきがいしゃ}みどり{物流|ぶつりゅう}　{営業部|えいぎょうぶ}
お{取引先|とりひきさき}{各位|かくい}
{平素|へいそ}より{格別|かくべつ}のお{引|ひ}き{立|た}てを{賜|たまわ}り、{誠|まこと}にありがとうございます。
さて、{弊社|へいしゃ}ではこれまで、{燃料費|ねんりょうひ}の{高騰|こうとう}を{企業|きぎょう}{努力|どりょく}により{吸収|きゅうしゅう}し、{配送料|はいそうりょう}を{据|す}え{置|お}いてまいりました。しかしながら、コストの{上昇|じょうしょう}が{続|つづ}いており、{現行|げんこう}の{料金|りょうきん}を{維持|いじ}することが{困難|こんなん}な{状況|じょうきょう}となりました。つきましては、{誠|まこと}に{勝手|かって}ながら、«1|4{月|がつ}1{日|にち}ご{注文|ちゅうもん}{分|ぶん}より、{配送料|はいそうりょう}を{改定|かいてい}させていただくことになりました»。なお、3{月|がつ}31{日|にち}までにいただいたご{注文|ちゅうもん}につきましては、お{届|とど}けが4{月|がつ}{以降|いこう}となる{場合|ばあい}でも、{従来|じゅうらい}の{料金|りょうきん}を{適用|てきよう}いたします。
{新|あたら}しい{料金表|りょうきんひょう}は{添付|てんぷ}ファイルにてご{確認|かくにん}ください。{何卒|なにとぞ}ご{理解|りかい}を{賜|たまわ}りますよう、お{願|ねが}い{申|もう}し{上|あ}げます。`,
      en: `Subject: Notice of revised delivery charges
From: Midori Logistics Co., Ltd., Sales Department
To all our business partners,
Thank you very much for your continued custom.
Until now we have absorbed the rising cost of fuel through our own efforts and kept our delivery charges unchanged. However, costs keep rising, and it has become difficult to maintain the current charges. We therefore regret to inform you that delivery charges will be revised for orders placed from 1 April. Orders received by 31 March will be charged at the old rate, even if they are delivered in April or later.
Please see the attached file for the new charges. We ask for your kind understanding.`,
      questions: [{
        q: 'このメールで{最|もっと}も{伝|つた}えたいことは{何|なに}か。',
        en: 'What does this email most want to communicate?',
        choices: [
          ['4{月|がつ}1{日|にち}{以降|いこう}の{注文|ちゅうもん}から、{配送料|はいそうりょう}が{変|か}わること', 'That delivery charges change for orders from 1 April'],
          ['{燃料費|ねんりょうひ}が{上|あ}がったため、3{月|がつ}31{日|にち}で{注文|ちゅうもん}の{受付|うけつけ}をやめること', 'That because fuel costs rose, they’ll stop taking orders after 31 March'],
          ['4{月|がつ}{以降|いこう}に{届|とど}く{商品|しょうひん}は、すべて{新|あたら}しい{配送料|はいそうりょう}になること', 'That every item delivered from April on will have the new charges'],
          ['これまでも{燃料費|ねんりょうひ}に{合|あ}わせて、{配送料|はいそうりょう}を{上|あ}げてきたこと', 'That they have been raising charges in line with fuel costs all along'],
        ],
        why: 'Everything before つきましては is background (rising costs); the message is what follows it: from orders placed on 1 April, delivery charges change (改定させていただく, a humble “we will revise”). Orders by 31 March keep the old rate even if delivered in April, and until now the charges were kept the same (据え置いてまいりました), not raised. In business letters, look for つきましては, さて and なお: they mark the point, the topic and the extra detail.',
      }],
      words: [['{改定|かいてい}', 'かいてい', 'revision (of prices, rules)'], ['{各位|かくい}', 'かくい', 'to all (in a letter’s address)'], ['{高騰|こうとう}', 'こうとう', 'sharp rise (in prices)'], ['{据|す}え{置|お}く', 'すえおく', 'to leave unchanged'], ['{困難|こんなん}', 'こんなん', 'difficult'], ['つきましては', '', 'accordingly, therefore (formal)'], ['{従来|じゅうらい}', 'じゅうらい', 'previous, until now'], ['{適用|てきよう}', 'てきよう', 'application (of a rule, rate)']],
    },

    {
      id: 'n2-notice-drill', level: 'N2', type: 'short', form: 'notice',
      title: 'The neighbourhood disaster drill',
      text: `# {防災|ぼうさい}{訓練|くんれん}についてのお{知|し}らせ
{例年|れいねん}、{秋|あき}の{防災|ぼうさい}{訓練|くんれん}には{多|おお}くの{方|かた}にご{参加|さんか}いただいておりますが、{参加者|さんかしゃ}の{大半|たいはん}はご{高齢|こうれい}の{方|かた}で、{日中|にっちゅう}お{仕事|しごと}をされている{世代|せだい}の{参加|さんか}は1{割|わり}にも{満|み}たないのが{現状|げんじょう}です。
{災害|さいがい}はいつ{起|お}こるかわかりません。{夜間|やかん}や{休日|きゅうじつ}に{起|お}きた{場合|ばあい}、{地域|ちいき}で{頼|たよ}りになるのは、むしろ{若|わか}い{世代|せだい}の{皆|みな}さんです。そこで{今年|ことし}は、«1|{一人|ひとり}でも{多|おお}くの{方|かた}に{参加|さんか}していただけるよう、{訓練|くんれん}を{平日|へいじつ}の{昼間|ひるま}から{日曜日|にちようび}の{午前|ごぜん}に{移|うつ}して{実施|じっし}することにいたしました»。
ご{家族|かぞく}おそろいでのご{参加|さんか}を、お{待|ま}ちしております。
> {桜町|さくらまち}{自治会|じちかい}`,
      en: `About the disaster drill
Every year many people take part in our autumn disaster drill, but most of them are elderly; fewer than one in ten come from the generation that works during the day.
No one knows when a disaster will strike. If it happens at night or on a holiday, it is in fact the younger generation that the neighbourhood will rely on. So this year, so that as many people as possible can take part, we have moved the drill from a weekday daytime to Sunday morning.
We look forward to seeing whole families there.
Sakuramachi Residents' Association`,
      questions: [{
        q: 'この{文章|ぶんしょう}で、{自治会|じちかい}が{最|もっと}も{伝|つた}えたいことは{何|なに}か。',
        en: 'What does the residents’ association most want to say in this text?',
        choices: [
          ['{若|わか}い{世代|せだい}にも{参加|さんか}してもらうため、{訓練|くんれん}の{日時|にちじ}を{変|か}えたこと', 'That they changed the drill’s day and time so younger people can join'],
          ['{防災|ぼうさい}{訓練|くんれん}に{参加|さんか}する{高齢者|こうれいしゃ}が、{年々|ねんねん}{減|へ}っていること', 'That fewer elderly people take part each year'],
          ['{災害|さいがい}は、{夜間|やかん}や{休日|きゅうじつ}に{起|お}こることが{多|おお}いこと', 'That disasters mostly happen at night or on holidays'],
          ['{訓練|くんれん}には、{家族|かぞく}{全員|ぜんいん}で{参加|さんか}しなければならないこと', 'That whole families must take part'],
        ],
        why: 'そこで (“so”) introduces the decision the notice exists for: the drill moves from a weekday daytime to Sunday morning so that more people — the working generation — can come. Most participants are elderly (nothing says fewer each year); a disaster can strike at any time (not “mostly at night”); and families are welcomed (お待ちしております), not required.',
      }],
      words: [['{防災|ぼうさい}{訓練|くんれん}', 'ぼうさいくんれん', 'disaster drill'], ['{大半|たいはん}', 'たいはん', 'the majority'], ['{満|み}たない', 'みたない', 'to fall short of'], ['{現状|げんじょう}', 'げんじょう', 'the present situation'], ['{頼|たよ}りになる', 'たよりになる', 'to be someone to rely on'], ['むしろ', '', 'rather, if anything'], ['{実施|じっし}する', 'じっし', 'to carry out, to hold'], ['{自治会|じちかい}', 'じちかい', 'residents’ association']],
    },

    {
      id: 'n2-notice-remote', level: 'N2', type: 'short', form: 'notice',
      title: 'Rules for working from home',
      text: `{社員|しゃいん}{各位|かくい}
> {総務部|そうむぶ}
# {在宅|ざいたく}{勤務|きんむ}{制度|せいど}の{利用|りよう}について
{来月|らいげつ}から{始|はじ}まる{在宅|ざいたく}{勤務|きんむ}{制度|せいど}について、{利用|りよう}にあたっての{注意|ちゅうい}{事項|じこう}をお{知|し}らせします。
{在宅|ざいたく}{勤務|きんむ}は{週|しゅう}{2日|ふつか}までとし、{利用|りよう}する{日|ひ}の{前日|ぜんじつ}までに{上司|じょうし}の{承認|しょうにん}を{得|え}てください。ただし、«1|{急|きゅう}な{体調|たいちょう}{不良|ふりょう}や{家族|かぞく}の{看病|かんびょう}など、やむを{得|え}ない{事情|じじょう}がある{場合|ばあい}に{限|かぎ}り、{当日|とうじつ}の{朝|あさ}の{申請|しんせい}も{認|みと}めます»。その{際|さい}は{始業|しぎょう}{時刻|じこく}の30{分|ぷん}{前|まえ}までに{上司|じょうし}へ{電話|でんわ}で{連絡|れんらく}し、システム{上|じょう}の{申請|しんせい}は{後日|ごじつ}{行|おこな}ってください。
なお、{社外秘|しゃがいひ}の{資料|しりょう}を{自宅|じたく}へ{持|も}ち{帰|かえ}ることは、これまでどおり{禁止|きんし}とします。`,
      en: `To all staff
General Affairs Department
Using the work-from-home scheme
Here are the points to note when using the work-from-home scheme that starts next month.
Working from home is limited to two days a week, and must be approved by your manager by the day before. However, only when there are unavoidable circumstances, such as suddenly feeling unwell or caring for a sick family member, applications on the morning itself will also be accepted. In that case, phone your manager at least 30 minutes before work starts, and make the application in the system afterwards.
Taking confidential documents home remains prohibited, as before.`,
      questions: [{
        q: 'このお{知|し}らせによると、{当日|とうじつ}の{朝|あさ}に{在宅|ざいたく}{勤務|きんむ}を{申請|しんせい}できるのはどのような{場合|ばあい}か。',
        en: 'According to this notice, when can you apply to work from home on the morning itself?',
        choices: [
          ['{子|こ}どもが{急|きゅう}に{熱|ねつ}を{出|だ}し、{家|いえ}で{看病|かんびょう}する{必要|ひつよう}がある{場合|ばあい}', 'When your child suddenly has a fever and you need to look after them at home'],
          ['{前日|ぜんじつ}に{上司|じょうし}が{不在|ふざい}で、{承認|しょうにん}を{得|え}られなかった{場合|ばあい}', 'When your manager was away the day before, so you couldn’t get approval'],
          ['その{週|しゅう}の{在宅|ざいたく}{勤務|きんむ}を、すでに{2日|ふつか}{使|つか}ってしまった{場合|ばあい}', 'When you’ve already used your two days that week'],
          ['{社外秘|しゃがいひ}の{資料|しりょう}を{使|つか}って、{自宅|じたく}で{作業|さぎょう}したい{場合|ばあい}', 'When you want to work at home with confidential documents'],
        ],
        why: 'ただし … に限り (“however, only when …”) marks the one exception: unavoidable circumstances such as sudden illness or caring for a sick family member. A child’s sudden fever is the second of those. An absent manager isn’t mentioned, the two-day limit has no exception, and confidential papers may not leave the office at all.',
      }],
      words: [['{在宅|ざいたく}{勤務|きんむ}', 'ざいたくきんむ', 'working from home'], ['{承認|しょうにん}を{得|え}る', 'しょうにんをえる', 'to get approval'], ['やむを{得|え}ない', 'やむをえない', 'unavoidable'], ['〜に{限|かぎ}り', 'にかぎり', 'only in the case of …'], ['{看病|かんびょう}', 'かんびょう', 'nursing (a sick person)'], ['{申請|しんせい}', 'しんせい', 'application, request'], ['{後日|ごじつ}', 'ごじつ', 'later, at a later date'], ['{社外秘|しゃがいひ}', 'しゃがいひ', 'confidential (not to leave the company)']],
    },

    {
      id: 'n2-info-scholarship', level: 'N2', type: 'info', form: 'flyer',
      title: 'A city scholarship for international students',
      text: `# さくら{市|し}{留学生|りゅうがくせい}{奨学金|しょうがくきん}　{募集|ぼしゅう}{要項|ようこう}（2027{年度|ねんど}）
■{対象|たいしょう}　{次|つぎ}のすべてに{当|あ}てはまる{人|ひと}
・«1|{市内|しない}の{大学|だいがく}・{大学院|だいがくいん}・{専門|せんもん}{学校|がっこう}に{在籍|ざいせき}する{私費|しひ}{留学生|りゅうがくせい}»
・«1|2027{年|ねん}4{月|がつ}1{日|ついたち}{現在|げんざい}、30{歳|さい}{以下|いか}の{人|ひと}»
・«1|{前年度|ぜんねんど}に{取得|しゅとく}した{単位|たんい}の8{割|わり}{以上|いじょう}の{成績|せいせき}がB{以上|いじょう}の{人|ひと}»（{新入生|しんにゅうせい}は{入学|にゅうがく}{試験|しけん}の{成績|せいせき}で{判断|はんだん}します）
・«1|ほかの{奨学金|しょうがくきん}（{月額|げつがく}3{万|まん}{円|えん}{以上|いじょう}）を{受|う}けていない{人|ひと}»
■{金額|きんがく}・{期間|きかん}　{月額|げつがく}4{万|まん}{円|えん}、2027{年|ねん}4{月|がつ}〜2028{年|ねん}3{月|がつ}の12か{月|げつ}（{返済|へんさい}は{不要|ふよう}）
■{人数|にんずう}　15{名|めい}{程度|ていど}
■{応募|おうぼ}{方法|ほうほう}
«2|{次|つぎ}の{書類|しょるい}を、{在籍|ざいせき}している{学校|がっこう}の{留学生|りゅうがくせい}{担当|たんとう}{窓口|まどぐち}に{提出|ていしゅつ}してください»。{市役所|しやくしょ}への{直接|ちょくせつ}の{提出|ていしゅつ}は{受|う}け{付|つ}けません。
① {申請書|しんせいしょ}（{市|し}のホームページからダウンロード）　② {在学|ざいがく}{証明書|しょうめいしょ}　③ {成績|せいせき}{証明書|しょうめいしょ}　④ {推薦書|すいせんしょ}（{指導|しどう}{教員|きょういん}または{担任|たんにん}が{作成|さくせい}したもの）　⑤ {写真|しゃしん}1{枚|まい}（{縦|たて}4cm×{横|よこ}3cm、3か{月|げつ}{以内|いない}に{撮影|さつえい}したもの）
■{締|し}め{切|き}り　2027{年|ねん}4{月|がつ}{20日|はつか}（{火|か}）。«2|{各|かく}{学校|がっこう}の{窓口|まどぐち}の{締|し}め{切|き}りはこれより{早|はや}い{場合|ばあい}がありますので、{必|かなら}ず{確認|かくにん}してください»。
■{選考|せんこう}{方法|ほうほう}
{書類|しょるい}{審査|しんさ}の{上|うえ}、5{月|がつ}{中旬|ちゅうじゅん}に{面接|めんせつ}を{行|おこな}います。{面接|めんせつ}の{日時|にちじ}は{学校|がっこう}を{通|つう}じてお{知|し}らせします。
■その{他|た}
・{選考|せんこう}{結果|けっか}は、6{月|がつ}{上旬|じょうじゅん}に{学校|がっこう}を{通|つう}じて{通知|つうち}します。
・{奨学生|しょうがくせい}には、{年|ねん}に2{回|かい}、{市|し}の{国際|こくさい}{交流|こうりゅう}イベントにボランティアとして{参加|さんか}していただきます。
・{奨学金|しょうがくきん}は、{毎月|まいつき}25{日|にち}に{本人|ほんにん}{名義|めいぎ}の{銀行|ぎんこう}{口座|こうざ}に{振|ふ}り{込|こ}みます。
・{退学|たいがく}・{休学|きゅうがく}した{場合|ばあい}は、その{翌月|よくげつ}から{支給|しきゅう}を{停止|ていし}します。
{問|と}い{合|あ}わせ：さくら{市役所|しやくしょ}　{国際|こくさい}{交流|こうりゅう}{課|か}（{平日|へいじつ}8:30〜17:15）`,
      en: `Sakura City Scholarship for International Students — application guidelines (2027 academic year)
Who can apply: anyone who meets all of the following
• A privately funded international student enrolled at a university, graduate school or vocational school in the city
• Aged 30 or under as of 1 April 2027
• Grade B or above in at least 80% of the credits earned in the previous year (new students are judged on their entrance exam results)
• Not receiving another scholarship (of 30,000 yen a month or more)
Amount and period: 40,000 yen a month for the 12 months from April 2027 to March 2028 (no repayment needed)
Places: about 15
How to apply
Submit the following documents to the international student office of the school you attend. Applications sent directly to City Hall are not accepted.
① Application form (download from the city's website) ② Certificate of enrolment ③ Academic transcript ④ Letter of recommendation (written by your supervisor or class teacher) ⑤ One photo (4 cm × 3 cm, taken within the last 3 months)
Deadline: Tuesday 20 April 2027. Your school's office may have an earlier deadline, so be sure to check.
Selection
After the documents are screened, interviews will be held in mid-May. The interview date and time will be sent through your school.
Other
• Results will be sent through your school in early June.
• Scholarship students take part twice a year as volunteers in the city's international exchange events.
• The scholarship is paid on the 25th of each month into a bank account in the student's own name.
• If a student leaves or takes a break from their school, payments stop from the following month.
Enquiries: Sakura City Hall, International Exchange Division (weekdays 8:30–17:15)`,
      questions: [{
        q: '{次|つぎ}の4{人|にん}のうち、この{奨学金|しょうがくきん}に{応募|おうぼ}できるのは{誰|だれ}か。',
        en: 'Which of these four people can apply for the scholarship?',
        choices: [
          ['{市内|しない}の{専門|せんもん}{学校|がっこう}で{学|まな}ぶ22{歳|さい}の{私費|しひ}{留学生|りゅうがくせい}。{去年|きょねん}の{単位|たんい}の9{割|わり}がB{以上|いじょう}で、{月額|げつがく}2{万|まん}{円|えん}の{奨学金|しょうがくきん}を{受|う}けている。', 'A 22-year-old privately funded student at a vocational school in the city. B or above in 90% of last year’s credits; receives a scholarship of 20,000 yen a month.'],
          ['{市内|しない}の{大学院|だいがくいん}で{学|まな}ぶ32{歳|さい}の{私費|しひ}{留学生|りゅうがくせい}。{去年|きょねん}の{成績|せいせき}はすべてA。', 'A 32-year-old privately funded student at a graduate school in the city. All As last year.'],
          ['{市内|しない}の{大学|だいがく}で{学|まな}ぶ24{歳|さい}の{国費|こくひ}{留学生|りゅうがくせい}。{去年|きょねん}の{単位|たんい}の8{割|わり}がB{以上|いじょう}。', 'A 24-year-old government-funded student at a university in the city. B or above in 80% of last year’s credits.'],
          ['さくら{市|し}に{住|す}み、{隣|となり}の{市|し}の{大学|だいがく}に{通|かよ}う20{歳|さい}の{私費|しひ}{留学生|りゅうがくせい}。{去年|きょねん}の{単位|たんい}の9{割|わり}がB{以上|いじょう}。', 'A 20-year-old privately funded student who lives in Sakura but attends a university in the next city. B or above in 90% of last year’s credits.'],
        ],
        why: 'Check each condition in turn. 32 is over the age limit (30歳以下). A government-funded student (国費) isn’t privately funded (私費). Living in the city isn’t enough — the school must be in the city (市内の大学 … に在籍). The vocational-school student passes everything: the other scholarship is only 20,000 yen a month, under the 30,000-yen line.',
      }, {
        q: 'この{奨学金|しょうがくきん}に{応募|おうぼ}したい{人|ひと}は、どうしなければならないか。',
        en: 'What must someone who wants to apply do?',
        choices: [
          ['{自分|じぶん}の{学校|がっこう}の{窓口|まどぐち}の{締|し}め{切|き}りを{確|たし}かめて、{書類|しょるい}を{窓口|まどぐち}に{出|だ}す。', 'Check their own school office’s deadline, and hand the documents in there.'],
          ['{書類|しょるい}をそろえて、4{月|がつ}{20日|はつか}までに{市役所|しやくしょ}に{持|も}って{行|い}く。', 'Get the documents together and take them to City Hall by 20 April.'],
          ['{推薦書|すいせんしょ}を{書|か}いてもらい、6{月|がつ}{上旬|じょうじゅん}までに{学校|がっこう}に{出|だ}す。', 'Get a letter of recommendation written and hand it to their school by early June.'],
          ['{応募|おうぼ}する{前|まえ}に、{市|し}の{国際|こくさい}{交流|こうりゅう}イベントにボランティアとして{参加|さんか}する。', 'Volunteer at one of the city’s exchange events before applying.'],
        ],
        why: 'Documents go to your own school’s international office (在籍している学校の … 窓口), never straight to City Hall, and the school’s deadline may be earlier than 20 April — hence 必ず確認してください. Early June is when results come out, and volunteering is something scholarship students do afterwards.',
      }],
      words: [['{募集|ぼしゅう}{要項|ようこう}', 'ぼしゅうようこう', 'application guidelines'], ['{対象|たいしょう}', 'たいしょう', 'who it’s for, eligibility'], ['{在籍|ざいせき}する', 'ざいせき', 'to be enrolled'], ['{私費|しひ} / {国費|こくひ}', 'しひ / こくひ', 'privately funded / government-funded'], ['{単位|たんい}', 'たんい', '(course) credit'], ['{月額|げつがく}', 'げつがく', 'monthly amount'], ['{返済|へんさい}', 'へんさい', 'repayment'], ['{推薦書|すいせんしょ}', 'すいせんしょ', 'letter of recommendation'], ['{選考|せんこう}', 'せんこう', 'selection']],
    },

    {
      id: 'n2-info-hall', level: 'N2', type: 'info', form: 'flyer',
      title: 'Booking a room at the civic hall',
      text: `# みなと{市民|しみん}{会館|かいかん}　{施設|しせつ}{利用|りよう}のご{案内|あんない}
■{利用|りよう}{料金|りょうきん}（1{区分|くぶん}あたり）
|! {部屋|へや} | {定員|ていいん} | {午前|ごぜん} 9:00〜12:00 | {午後|ごご} 13:00〜17:00 | {夜間|やかん} 18:00〜21:30
| {大|だい}ホール | 300{名|めい} | 12,000{円|えん} | 16,000{円|えん} | 18,000{円|えん}
| «1|{会議室|かいぎしつ}A» | «1|40{名|めい}» | 2,000{円|えん} | «1|2,600{円|えん}» | 3,000{円|えん}
| {会議室|かいぎしつ}B | «1|20{名|めい}» | 1,200{円|えん} | 1,600{円|えん} | 1,800{円|えん}
| {和室|わしつ} | «1|15{名|めい}» | 1,000{円|えん} | 1,300{円|えん} | 1,500{円|えん}
※{市外|しがい}にお{住|す}まいの{方|かた}が{利用|りよう}される{場合|ばあい}は、{上記|じょうき}{料金|りょうきん}の1.5{倍|ばい}となります。
※{入場料|にゅうじょうりょう}を{徴収|ちょうしゅう}する{催|もよお}しの{場合|ばあい}は、{上記|じょうき}{料金|りょうきん}に1{区分|くぶん}あたり3,000{円|えん}を{加算|かさん}します。
※{大|だい}ホールのピアノを{使用|しよう}する{場合|ばあい}は、{別途|べっと}1{区分|くぶん}2,000{円|えん}がかかります。
■{予約|よやく}
・«2|{利用|りよう}{日|び}の3か{月|げつ}{前|まえ}の{月|つき}の1{日|ついたち}から、{窓口|まどぐち}または{電話|でんわ}で{受|う}け{付|つ}けます（{市外|しがい}の{方|かた}は2か{月|げつ}{前|まえ}の{月|つき}の1{日|ついたち}から）»。
・キャンセルは、{利用|りよう}{日|び}の{7日|なのか}{前|まえ}までにお{申|もう}し{出|で}いただいた{場合|ばあい}に{限|かぎ}り、{全額|ぜんがく}{返金|へんきん}いたします。
・お{支払|しはら}いは、ご{予約|よやく}から10{日|にち}{以内|いない}に{窓口|まどぐち}でお{願|ねが}いします。{期限|きげん}までにお{支払|しはら}いがない{場合|ばあい}、ご{予約|よやく}は{取|と}り{消|け}しとなります。
■{備品|びひん}の{貸|か}し{出|だ}し（1{区分|くぶん}あたり）
プロジェクター 1,000{円|えん}　／　マイク 500{円|えん}（{大|だい}ホールは{無料|むりょう}）　／　ホワイトボード {無料|むりょう}
■ご{注意|ちゅうい}
・{駐車場|ちゅうしゃじょう}は50{台|だい}です（1{時間|じかん}200{円|えん}。{会館|かいかん}をご{利用|りよう}の{方|かた}は3{時間|じかん}まで{無料|むりょう}）。
・{会議室|かいぎしつ}・{和室|わしつ}での{飲食|いんしょく}はご{遠慮|えんりょ}ください（ふたのできる{飲|の}み{物|もの}を{除|のぞ}く）。
・{休館日|きゅうかんび}：{毎月|まいつき}{第|だい}2{月曜日|げつようび}、{年末|ねんまつ}{年始|ねんし}（12{月|がつ}29{日|にち}〜1{月|がつ}{3日|みっか}）`,
      en: `Minato Civic Hall — guide to using the rooms
Charges (per session)
Room | Capacity | Morning 9:00–12:00 | Afternoon 13:00–17:00 | Evening 18:00–21:30
Main hall | 300 | 12,000 yen | 16,000 yen | 18,000 yen
Meeting room A | 40 | 2,000 yen | 2,600 yen | 3,000 yen
Meeting room B | 20 | 1,200 yen | 1,600 yen | 1,800 yen
Japanese-style room | 15 | 1,000 yen | 1,300 yen | 1,500 yen
* People living outside the city pay 1.5 times the charges above.
* For events that charge admission, 3,000 yen per session is added to the charges above.
* Using the main hall's piano costs an extra 2,000 yen per session.
Bookings
• Taken at the desk or by phone from the 1st of the month three months before the day of use (for people outside the city, from the 1st of the month two months before).
• Cancellations are refunded in full only if made at least 7 days before the day of use.
• Please pay at the desk within 10 days of booking. Bookings not paid by then are cancelled.
Equipment hire (per session)
Projector 1,000 yen / Microphone 500 yen (free in the main hall) / Whiteboard free
Please note
• The car park has 50 spaces (200 yen an hour; free for up to 3 hours for hall users).
• No eating or drinking in the meeting rooms or the Japanese-style room (except drinks with a lid).
• Closed: second Monday of each month, and over New Year (29 December–3 January)`,
      questions: [{
        q: '{市内|しない}に{住|す}むグエンさんは、9{月|がつ}12{日|にち}の{午後|ごご}1{時|じ}から、25{人|にん}で{入場|にゅうじょう}{無料|むりょう}の{日本語|にほんご}スピーチの{練習会|れんしゅうかい}を{開|ひら}きたい。{一番|いちばん}{安|やす}い{部屋|へや}を{使|つか}う{場合|ばあい}、{利用|りよう}{料金|りょうきん}はいくらか。',
        en: 'Ms Nguyen, who lives in the city, wants to hold a free Japanese speech practice for 25 people from 1 p.m. on 12 September. If she uses the cheapest room she can, how much does it cost?',
        choices: [['2,600{円|えん}', '2,600 yen'], ['1,600{円|えん}', '1,600 yen'], ['3,900{円|えん}', '3,900 yen'], ['5,600{円|えん}', '5,600 yen']],
        why: 'Twenty-five people won’t fit in meeting room B (20) or the Japanese-style room (15), so the cheapest room that fits is meeting room A: 2,600 yen for an afternoon. She lives in the city (no × 1.5) and entry is free (no + 3,000).',
      }, {
        q: 'グエンさんの{友人|ゆうじん}で、{隣|となり}の{市|し}に{住|す}むサラさんも、{同|おな}じ9{月|がつ}12{日|にち}に{会議室|かいぎしつ}Bを{借|か}りたいと{考|かんが}えている。サラさんが{予約|よやく}できるのはいつからか。',
        en: 'Sarah, a friend of Ms Nguyen who lives in the next city, also wants to book meeting room B for 12 September. From when can she book it?',
        choices: [['7{月|がつ}1{日|ついたち}', '1 July'], ['6{月|がつ}1{日|ついたち}', '1 June'], ['6{月|がつ}12{日|にち}', '12 June'], ['7{月|がつ}12{日|にち}', '12 July']],
        why: 'City residents can book from the 1st of the month three months ahead — 1 June for a September booking — but people from outside the city (市外の方) only from the 1st of the month two months ahead: 1 July. It’s always the 1st, never the same date as the booking.',
      }],
      words: [['{施設|しせつ}', 'しせつ', 'facility'], ['{区分|くぶん}', 'くぶん', 'section, (time) slot'], ['{定員|ていいん}', 'ていいん', 'capacity'], ['{市外|しがい}', 'しがい', 'outside the city'], ['{徴収|ちょうしゅう}する', 'ちょうしゅう', 'to collect (a fee)'], ['{加算|かさん}する', 'かさん', 'to add (to a charge)'], ['{別途|べっと}', 'べっと', 'separately, extra'], ['{全額|ぜんがく}{返金|へんきん}', 'ぜんがくへんきん', 'full refund']],
    },
    {
      id: 'n2-email-reschedule', level: 'N2', type: 'short', form: 'email',
      title: 'Asking to move a meeting',
      text: `@{件名|けんめい}|{打|う}ち{合|あ}わせ{日程|にってい}{変更|へんこう}のお{願|ねが}い
@{送信者|そうしんしゃ}|{株式会社|かぶしきがいしゃ}みどりデザイン　{小川|おがわ}
さくら{商事|しょうじ}{株式会社|かぶしきがいしゃ}　{営業部|えいぎょうぶ}　{中島|なかじま}{様|さま}
いつも{大変|たいへん}お{世話|せわ}になっております。みどりデザインの{小川|おがわ}でございます。
{来週|らいしゅう}{10日|とおか}（{火|か}）14{時|じ}からお{約束|やくそく}しておりました{新|しん}{商品|しょうひん}パッケージの{打|う}ち{合|あ}わせにつきまして、{誠|まこと}に{恐縮|きょうしゅく}ながら、{日程|にってい}の{変更|へんこう}をお{願|ねが}いしたく、ご{連絡|れんらく}いたしました。{弊社|へいしゃ}の{担当|たんとう}デザイナーが{急|きゅう}きょ{海外|かいがい}{出張|しゅっちょう}に{同行|どうこう}することとなり、{当日|とうじつ}の{出席|しゅっせき}が{難|むずか}しくなったためでございます。
«1|つきましては、12{日|にち}（{木|もく}）{以降|いこう}で、{中島|なかじま}{様|さま}のご{都合|つごう}のよい{日時|にちじ}を{二|に}、{三|さん}お{知|し}らせいただけますでしょうか»。ご{提案|ていあん}いただいた{中|なか}から{調整|ちょうせい}させていただきます。
こちらの{都合|つごう}で{大変|たいへん}{申|もう}し{訳|わけ}ございませんが、{何卒|なにとぞ}よろしくお{願|ねが}い{申|もう}し{上|あ}げます。`,
      en: `Subject: Request to reschedule our meeting
From: Ogawa, Midori Design Inc.
Mr Nakajima, Sales Department, Sakura Trading Co., Ltd.
Thank you as always for your support. This is Ogawa from Midori Design.
I am writing, with apologies, to ask whether we could move the meeting on packaging for the new product that we had arranged for 14:00 on Tuesday the 10th next week. Our designer in charge has suddenly had to accompany a business trip abroad and can no longer attend that day.
Could you therefore let me know two or three dates and times that suit you, from Thursday the 12th onwards? We will arrange the meeting from among your suggestions.
I am very sorry for the trouble this causes on our side, and thank you for your understanding.`,
      questions: [{
        q: 'このメールで{小川|おがわ}さんが{最|もっと}も{伝|つた}えたいことは{何|なに}か。',
        en: 'What does Ogawa most want to communicate in this email?',
        choices: [
          ['{打|う}ち{合|あ}わせの{日|ひ}を{変|か}えたいので、{都合|つごう}のいい{日時|にちじ}を{教|おし}えてほしい。', 'She wants to move the meeting, and asks for dates and times that suit.'],
          ['デザイナーの{代|か}わりに、{自分|じぶん}が{打|う}ち{合|あ}わせに{出席|しゅっせき}する。', 'She will attend the meeting in place of the designer.'],
          ['12{日|にち}の{打|う}ち{合|あ}わせに{出席|しゅっせき}してほしい。', 'She wants Mr Nakajima to attend a meeting on the 12th.'],
          ['{海外|かいがい}{出張|しゅっちょう}のため、{打|う}ち{合|あ}わせを{取|と}りやめたい。', 'Because of a business trip abroad, she wants to call off the meeting.'],
        ],
        why: 'The reason (the designer’s trip) is background; つきましては leads to the request: tell me two or three times that suit you, from the 12th on. The meeting is moved, not cancelled, and the 12th is the earliest possible day, not a fixed date.',
      }],
      words: [['{打|う}ち{合|あ}わせ', 'うちあわせ', 'meeting, discussion'], ['{日程|にってい}', 'にってい', 'schedule, date'], ['{恐縮|きょうしゅく}ながら', 'きょうしゅくながら', 'I’m sorry to ask, but'], ['{急|きゅう}きょ', 'きゅうきょ', 'suddenly, at short notice'], ['{同行|どうこう}する', 'どうこう', 'to accompany'], ['{以降|いこう}', 'いこう', 'from … on'], ['{提案|ていあん}', 'ていあん', 'suggestion, proposal']],
    },

    {
      id: 'n2-notice-system', level: 'N2', type: 'short', form: 'notice',
      title: 'A weekend system shutdown',
      text: `{社員|しゃいん}{各位|かくい}
> {情報|じょうほう}システム{部|ぶ}
# {社内|しゃない}システム{停止|ていし}のお{知|し}らせ
サーバー{移行|いこう}{作業|さぎょう}に{伴|ともな}い、{下記|かき}の{日時|にちじ}に{社内|しゃない}システムを{停止|ていし}いたします。
{停止|ていし}{日時|にちじ}：11{月|がつ}22{日|にち}（{土|ど}）8:00〜23{日|にち}（{日|にち}）20:00
{期間中|きかんちゅう}は、{勤怠|きんたい}{管理|かんり}、{経費|けいひ}{精算|せいさん}、{社内|しゃない}メールのいずれもご{利用|りよう}いただけません。«1|{休日|きゅうじつ}に{出勤|しゅっきん}{予定|よてい}の{方|かた}は、{出|しゅっ}{退勤|たいきん}{時刻|じこく}を{紙|かみ}の{記録|きろく}{用紙|ようし}に{記入|きにゅう}し、{24日|にじゅうよっか}（{月|げつ}）{中|じゅう}に{各|かく}{部署|ぶしょ}の{担当者|たんとうしゃ}へ{提出|ていしゅつ}してください»。
なお、{社外|しゃがい}からのメールは{期間中|きかんちゅう}も{受信|じゅしん}されますが、{閲覧|えつらん}できるのは{作業|さぎょう}{完了|かんりょう}{後|ご}となります。`,
      en: `To all staff
Information Systems Department
Notice of internal system shutdown
Because of work to move to new servers, the internal systems will be shut down at the time below.
Shutdown: Saturday 22 November 8:00 to Sunday 23 November 20:00
During this time, attendance records, expense claims and internal email will all be unavailable. Staff due to work on the weekend should write their start and finish times on the paper record form and hand it to the person in charge in their department during Monday the 24th.
Email from outside the company will still be received during this time, but can only be read once the work is complete.`,
      questions: [{
        q: '22{日|にち}に{休日|きゅうじつ}{出勤|しゅっきん}する{人|ひと}は、どうしなければならないか。',
        en: 'What must someone who works on Saturday the 22nd do?',
        choices: [
          ['{出勤|しゅっきん}と{退勤|たいきん}の{時刻|じこく}を{用紙|ようし}に{書|か}き、{24日|にじゅうよっか}に{担当者|たんとうしゃ}に{出|だ}す。', 'Write their start and finish times on the form and hand it in on the 24th.'],
          ['{24日|にじゅうよっか}に、{勤怠|きんたい}{管理|かんり}システムに{出勤|しゅっきん}{時刻|じこく}を{入力|にゅうりょく}する。', 'Enter their start time in the attendance system on the 24th.'],
          ['23{日|にち}の20{時|じ}{以降|いこう}に、{社内|しゃない}メールで{担当者|たんとうしゃ}に{知|し}らせる。', 'Tell the person in charge by internal email after 20:00 on the 23rd.'],
          ['22{日|にち}に{情報|じょうほう}システム{部|ぶ}へ{行|い}って、{出勤|しゅっきん}を{記録|きろく}してもらう。', 'Go to Information Systems on the 22nd and have their attendance recorded.'],
        ],
        why: 'With the attendance system down, the notice gives a paper route: times on the record form (記録用紙に記入し), handed to the department’s person in charge on Monday the 24th (24日中に). Nothing says to type it into the system afterwards or to email it.',
      }],
      words: [['{停止|ていし}', 'ていし', 'shutdown, stop'], ['{移行|いこう}', 'いこう', 'move, migration'], ['〜に{伴|ともな}い', 'にともない', 'along with, because of'], ['{勤怠|きんたい}{管理|かんり}', 'きんたいかんり', 'attendance records'], ['{経費|けいひ}{精算|せいさん}', 'けいひせいさん', 'expense claims'], ['{出|しゅっ}{退勤|たいきん}', 'しゅったいきん', 'arriving and leaving work'], ['{閲覧|えつらん}', 'えつらん', 'reading, viewing']],
    },

    {
      id: 'n2-letter-lease', level: 'N2', type: 'short', form: 'letter',
      title: 'Renewing a flat’s lease',
      text: `{入居者|にゅうきょしゃ}{様|さま}
> さくら{不動産|ふどうさん}{株式会社|かぶしきがいしゃ}
# {賃貸|ちんたい}{借|しゃく}{契約|けいやく}{更新|こうしん}のご{案内|あんない}
{現在|げんざい}ご{入居|にゅうきょ}{中|ちゅう}のお{部屋|へや}の{賃貸|ちんたい}{借|しゃく}{契約|けいやく}は、{来年|らいねん}3{月|がつ}31{日|にち}をもって{期間|きかん}{満了|まんりょう}となります。{引|ひ}き{続|つづ}きご{入居|にゅうきょ}を{希望|きぼう}される{場合|ばあい}は、{同封|どうふう}の{更新|こうしん}{申込書|もうしこみしょ}にご{記入|きにゅう}の{上|うえ}、1{月|がつ}31{日|にち}までにご{返送|へんそう}ください。{更新|こうしん}{後|ご}の{家賃|やちん}に{変更|へんこう}はございません。なお、{更新料|こうしんりょう}として{家賃|やちん}の1か{月|げつ}{分|ぶん}を、2{月|がつ}{末日|まつじつ}までにお{振|ふ}り{込|こ}みください。
«1|ご{退去|たいきょ}を{予定|よてい}されている{場合|ばあい}も、{退去|たいきょ}の1か{月|げつ}{前|まえ}までに{書面|しょめん}にてお{知|し}らせください»。«1|{期限|きげん}までにご{連絡|れんらく}がない{場合|ばあい}は、{契約|けいやく}を{更新|こうしん}されるものとして{手続|てつづ}きを{進|すす}めさせていただきます»。`,
      en: `To the tenant
Sakura Real Estate Co., Ltd.
Renewal of your rental agreement
The rental agreement for the flat you live in ends on 31 March next year. If you would like to stay, please fill in the enclosed renewal form and return it by 31 January. The rent will not change after renewal. A renewal fee of one month's rent is to be paid by bank transfer by the end of February.
If you plan to move out, please also let us know in writing at least one month before you leave. If we hear nothing by the deadline, we will go ahead on the basis that you are renewing the agreement.`,
      questions: [{
        q: '3{月|がつ}{末|まつ}で{引|ひ}っ{越|こ}す{予定|よてい}の{人|ひと}は、どうしなければならないか。',
        en: 'What must someone who plans to move out at the end of March do?',
        choices: [
          ['2{月|がつ}{末|まつ}までに、{退去|たいきょ}することを{書面|しょめん}で{知|し}らせる。', 'Tell the agency in writing by the end of February that they’re leaving.'],
          ['1{月|がつ}31{日|にち}までに、{更新|こうしん}{申込書|もうしこみしょ}を{返送|へんそう}する。', 'Return the renewal form by 31 January.'],
          ['2{月|がつ}{末|まつ}までに、{更新料|こうしんりょう}を{振|ふ}り{込|こ}む。', 'Pay the renewal fee by the end of February.'],
          ['{特|とく}に{何|なに}も{連絡|れんらく}しなくてよい。', 'Nothing in particular.'],
        ],
        why: 'Leaving on 31 March means writing at least a month before: by the end of February. And the last sentence makes silence costly: with no word by the deadline, the lease is treated as renewed (更新されるものとして). The form and the fee are for people who stay.',
      }],
      words: [['{賃貸|ちんたい}{借|しゃく}{契約|けいやく}', 'ちんたいしゃくけいやく', 'rental agreement'], ['{満了|まんりょう}', 'まんりょう', 'expiry (of a term)'], ['{同封|どうふう}', 'どうふう', 'enclosed'], ['{更新料|こうしんりょう}', 'こうしんりょう', 'renewal fee'], ['{退去|たいきょ}', 'たいきょ', 'moving out'], ['{書面|しょめん}にて', 'しょめんにて', 'in writing'], ['〜ものとして', 'ものとして', 'on the assumption that …']],
    },

    {
      id: 'n2-info-internship', level: 'N2', type: 'info', form: 'flyer',
      title: 'Summer internships',
      text: `# 2027{年|ねん}{夏|なつ}　インターンシップ{募集|ぼしゅう}（さくら{市内|しない}{企業|きぎょう}）
|! {企業|きぎょう} | {内容|ないよう} | {期間|きかん} | {対象|たいしょう} | {待遇|たいぐう}
| A　さくら{銀行|ぎんこう} | {窓口|まどぐち}{業務|ぎょうむ}の{見学|けんがく}・グループワーク | «2|8{月|がつ}{4日|よっか}〜{8日|ようか}（{5日間|いつかかん}）» | «1|{大学|だいがく}3{年生|ねんせい}» | {日当|にっとう}5,000{円|えん}
| «1|B　みどり{旅行|りょこう}» | {海外|かいがい}ツアーの{企画|きかく} | 8{月|がつ}18{日|にち}〜29{日|にち}（{土日|どにち}{休|やす}み） | «1|{大学生|だいがくせい}・{大学院生|だいがくいんせい}（{英語|えいご}で{日常|にちじょう}{会話|かいわ}ができる{方|かた}）» | «1|{日当|にっとう}6,000{円|えん}・{交通費|こうつうひ}{支給|しきゅう}»
| C　ひかりソフト | アプリ{開発|かいはつ}（チームで1つのアプリを{作|つく}る） | «2|8{月|がつ}{1日|ついたち}〜31{日|にち}（{週|しゅう}{3日|みっか}{以上|いじょう}・{期間中|きかんちゅう}の{希望日|きぼうび}）» | «1|{理系|りけい}の{大学生|だいがくせい}・{大学院生|だいがくいんせい}（プログラミング{経験|けいけん}{必須|ひっす}）» | {時給|じきゅう}1,300{円|えん}
| D　さくら{新聞社|しんぶんしゃ} | {記者|きしゃ}の{取材|しゅざい}に{同行|どうこう}・{記事|きじ}{作成|さくせい} | «2|9{月|がつ}{1日|ついたち}〜{5日|いつか}（{5日間|いつかかん}）» | {学年|がくねん}{不問|ふもん} | «1|{無報酬|むほうしゅう}（{昼食|ちゅうしょく}{付|つ}き）»
・{応募|おうぼ}はすべて「さくら{市|し}インターンシップ」のウェブサイトから。{応募|おうぼ}{締|し}め{切|き}りは{各社|かくしゃ}とも6{月|がつ}30{日|にち}です。
・«2|1{人|にん}2{社|しゃ}まで{応募|おうぼ}できます。ただし、{期間|きかん}が{重|かさ}なる{企業|きぎょう}に{同時|どうじ}に{応募|おうぼ}することはできません»。
・{留学生|りゅうがくせい}の{方|かた}も{応募|おうぼ}できます（C・Dは{日本語|にほんご}{能力|のうりょく}{試験|しけん}N2{以上|いじょう}が{必要|ひつよう}）。
・{選考|せんこう}：{書類|しょるい}{選考|せんこう}の{後|あと}、«2|A・Bは{面接|めんせつ}、C・Dは{課題|かだい}の{提出|ていしゅつ}»があります。
・{参加者|さんかしゃ}には{修了証|しゅうりょうしょう}を{発行|はっこう}します。{単位|たんい}として{認|みと}められるかどうかは、{各|かく}{大学|だいがく}にお{問|と}い{合|あ}わせください。
{問|と}い{合|あ}わせ：さくら{市役所|しやくしょ}　{産業|さんぎょう}{振興課|しんこうか}（{平日|へいじつ}9:00〜17:00）`,
      en: `Summer 2027 internships (companies in Sakura City)
Company | What you do | When | Who for | Pay
A Sakura Bank | Observing counter work, group work | 4–8 Aug (5 days) | Third-year university students | 5,000 yen a day
B Midori Travel | Planning overseas tours | 18–29 Aug (weekends off) | University and graduate students (able to hold an everyday conversation in English) | 6,000 yen a day, travel paid
C Hikari Soft | App development (a team builds one app) | 1–31 Aug (3+ days a week, days of your choice) | Science and engineering university and graduate students (programming experience required) | 1,300 yen an hour
D Sakura Shimbun | Going on reporting with journalists, writing articles | 1–5 Sept (5 days) | Any year | Unpaid (lunch provided)
• All applications through the "Sakura City Internships" website. Deadline for every company: 30 June.
• You can apply to up to 2 companies. However, you can't apply at the same time to companies whose dates overlap.
• International students may apply (C and D require JLPT N2 or above).
• Selection: after document screening, interviews for A and B, and an assignment to submit for C and D.
• Participants receive a certificate of completion. Ask your own university whether it counts for credits.
Enquiries: Sakura City Hall, Industry Promotion Division (weekdays 9:00–17:00)`,
      questions: [{
        q: '{文系|ぶんけい}の{大学|だいがく}2{年生|ねんせい}で、{英語|えいご}の{日常|にちじょう}{会話|かいわ}ができる{留学生|りゅうがくせい}のパクさん（N2{合格|ごうかく}）は、{報酬|ほうしゅう}がもらえるインターンシップに{参加|さんか}したい。パクさんが{応募|おうぼ}できるのはどれか。',
        en: 'Park is a second-year humanities student from abroad who can hold an everyday conversation in English (and has passed N2). Park wants a paid internship. Which can Park apply for?',
        choices: [['B', 'B'], ['A', 'A'], ['C', 'C'], ['D', 'D']],
        why: 'A is for third-year students only; C is for science and engineering students with programming experience; D is unpaid (無報酬). B takes any university student who can hold an everyday conversation in English, and pays 6,000 yen a day.',
      }, {
        q: '{応募|おうぼ}について、{正|ただ}しいものはどれか。',
        en: 'Which is true about applying?',
        choices: [
          ['AとDに{同時|どうじ}に{応募|おうぼ}することができる。', 'You can apply to A and D at the same time.'],
          ['AとCに{同時|どうじ}に{応募|おうぼ}することができる。', 'You can apply to A and C at the same time.'],
          ['3{社|しゃ}に{応募|おうぼ}して、{選考|せんこう}に{通|とお}った{会社|かいしゃ}を{選|えら}ぶことができる。', 'You can apply to 3 companies and pick from the ones that accept you.'],
          ['Cに{応募|おうぼ}する{人|ひと}は、{面接|めんせつ}を{受|う}けなければならない。', 'Applicants to C have to do an interview.'],
        ],
        why: 'A (4–8 August) and D (1–5 September) don’t overlap, so applying to both is allowed. C runs all of August, so it overlaps A. The limit is two companies, and C’s selection is an assignment, not an interview.',
      }],
      words: [['{待遇|たいぐう}', 'たいぐう', 'pay and conditions'], ['{日当|にっとう}', 'にっとう', 'daily allowance'], ['{支給|しきゅう}', 'しきゅう', 'provision, payment'], ['{理系|りけい} / {文系|ぶんけい}', 'りけい / ぶんけい', 'sciences / humanities'], ['{必須|ひっす}', 'ひっす', 'required'], ['{学年|がくねん}{不問|ふもん}', 'がくねんふもん', 'any year (of study)'], ['{無報酬|むほうしゅう}', 'むほうしゅう', 'unpaid'], ['{課題|かだい}', 'かだい', 'assignment, task']],
    },

    {
      id: 'n2-info-coworking', level: 'N2', type: 'info', form: 'flyer',
      title: 'Coworking space plans',
      text: `# コワーキングスペース「ミナト・ベース」{料金|りょうきん}プラン
|! プラン | {利用|りよう}{時間|じかん} | {料金|りょうきん} | {主|おも}なサービス
| ドロップイン | {平日|へいじつ} 9:00〜18:00 | «1|1{時間|じかん}500{円|えん}（1{日|にち}{上限|じょうげん}2,000{円|えん}）» | フリー{席|せき}・Wi-Fi・ドリンク
| «1|デイタイム{会員|かいいん}» | «1|{平日|へいじつ} 9:00〜18:00» | «1|{月額|げつがく}12,000{円|えん}» | フリー{席|せき}・Wi-Fi・ドリンク・{会議室|かいぎしつ}（{月|つき}4{時間|じかん}まで{無料|むりょう}）
| フルタイム{会員|かいいん} | {毎日|まいにち} 24{時間|じかん} | {月額|げつがく}20,000{円|えん} | デイタイム{会員|かいいん}のサービス＋ロッカー・{郵便物|ゆうびんぶつ}の{受|う}け{取|と}り
| «2|{固定席|こていせき}{会員|かいいん}» | «2|{毎日|まいにち} 24{時間|じかん}» | «2|{月額|げつがく}30,000{円|えん}» | «2|フルタイム{会員|かいいん}のサービス＋{専用|せんよう}デスク・{住所|じゅうしょ}の{登記|とうき}»
・{会議室|かいぎしつ}：{会員|かいいん}の{方|かた}は、{無料|むりょう}{時間|じかん}を{超|こ}えた{分|ぶん}は1{時間|じかん}1,000{円|えん}、ドロップインの{方|かた}は1{時間|じかん}1,500{円|えん}でご{利用|りよう}いただけます。
・«2|{入会金|にゅうかいきん}：{月額|げつがく}{会員|かいいん}は5,000{円|えん}（{初回|しょかい}のみ）»。{月|つき}の{途中|とちゅう}で{入会|にゅうかい}された{場合|ばあい}、{初月|しょげつ}の{料金|りょうきん}は{日割|ひわ}りで{計算|けいさん}します。
・«2|{法人|ほうじん}{登記|とうき}（{住所|じゅうしょ}を{会社|かいしゃ}の{所在地|しょざいち}として{登録|とうろく}すること）は、{固定席|こていせき}{会員|かいいん}のみ{可能|かのう}です»。
・{解約|かいやく}は、{解約|かいやく}{希望|きぼう}{月|づき}の{前月|ぜんげつ}{20日|はつか}までにお{申|もう}し{出|で}ください。
・{土日|どにち}・{祝日|しゅくじつ}は、ドロップインのご{利用|りよう}はできません。
・{受付|うけつけ}{時間|じかん}{外|がい}にご{利用|りよう}の{会員|かいいん}{様|さま}は、{会員|かいいん}カードで{入口|いりぐち}のドアを{開|あ}けてください。
・{見学|けんがく}は{随時|ずいじ}{受|う}け{付|つ}けております。{平日|へいじつ}には1{日|にち}{無料|むりょう}{体験|たいけん}（お{一人|ひとり}{様|さま}1{回|かい}{限|かぎ}り）もございます。`,
      en: `Minato Base coworking space — plans
Plan | Hours | Price | Main services
Drop-in | Weekdays 9:00–18:00 | 500 yen an hour (2,000 yen a day at most) | Hot desk, Wi-Fi, drinks
Daytime member | Weekdays 9:00–18:00 | 12,000 yen a month | Hot desk, Wi-Fi, drinks, meeting room (free up to 4 hours a month)
Full-time member | Every day, 24 hours | 20,000 yen a month | Daytime services + locker and mail handling
Fixed-desk member | Every day, 24 hours | 30,000 yen a month | Full-time services + your own desk and company registration at our address
• Meeting room: members pay 1,000 yen an hour beyond their free hours; drop-in users 1,500 yen an hour.
• Joining fee: 5,000 yen for monthly members (first time only). If you join part-way through a month, the first month is charged by the day.
• Company registration (registering our address as your company's address) is for fixed-desk members only.
• To cancel, tell us by the 20th of the month before the month you want to leave.
• Drop-in is not available at weekends or on public holidays.
• Members using the space outside reception hours open the front door with their membership card.
• Visits are welcome at any time. On weekdays there is also a free one-day trial (once per person).`,
      questions: [{
        q: 'フリーランスのデザイナーの{木村|きむら}さんは、{平日|へいじつ}の{昼間|ひるま}に{週|しゅう}{3日|みっか}ほど、1{日|にち}6{時間|じかん}ずつ{作業|さぎょう}したい。{会議室|かいぎしつ}は{使|つか}わない。1か{月|げつ}{続|つづ}けて{利用|りよう}する{場合|ばあい}、{一番|いちばん}{安|やす}いのはどのプランか。',
        en: 'Kimura, a freelance designer, wants to work about three weekdays a week, six hours a day, without using the meeting room. Over a whole month, which plan is cheapest?',
        choices: [['デイタイム{会員|かいいん}', 'Daytime member'], ['ドロップイン', 'Drop-in'], ['フルタイム{会員|かいいん}', 'Full-time member'], ['{固定席|こていせき}{会員|かいいん}', 'Fixed-desk member']],
        why: 'Six hours of drop-in would be 3,000 yen, but the daily cap makes it 2,000 — still about 12 days × 2,000 = 24,000 yen a month. Daytime membership covers the same weekday hours for 12,000 (17,000 even with the joining fee). The 24-hour plans cost more and give nothing Kimura needs.',
      }, {
        q: '{会社|かいしゃ}を{立|た}ち{上|あ}げる{予定|よてい}の{田中|たなか}さんは、このスペースの{住所|じゅうしょ}で{会社|かいしゃ}を{登記|とうき}し、{夜|よる}や{週末|しゅうまつ}にも{作業|さぎょう}したい。{月|つき}の{初|はじ}めに{入会|にゅうかい}する{場合|ばあい}、{最初|さいしょ}の{月|つき}に{払|はら}う{金額|きんがく}はいくらか。',
        en: 'Tanaka is setting up a company, wants to register it at this address, and wants to work evenings and weekends too. Joining at the start of a month, how much does Tanaka pay for the first month?',
        choices: [['35,000{円|えん}', '35,000 yen'], ['30,000{円|えん}', '30,000 yen'], ['25,000{円|えん}', '25,000 yen'], ['20,000{円|えん}', '20,000 yen']],
        why: 'Registering a company at this address is only possible on the fixed-desk plan (固定席会員のみ), which is also open 24 hours: 30,000 yen. Add the one-off 5,000-yen joining fee: 35,000. Joining at the start of the month means no day-by-day calculation.',
      }],
      words: [['{上限|じょうげん}', 'じょうげん', 'upper limit, cap'], ['{月額|げつがく}', 'げつがく', 'monthly charge'], ['{固定席|こていせき}', 'こていせき', 'fixed (own) desk'], ['{登記|とうき}', 'とうき', 'registration (of a company)'], ['{日割|ひわ}り', 'ひわり', 'calculated by the day'], ['{所在地|しょざいち}', 'しょざいち', 'address, location'], ['{解約|かいやく}', 'かいやく', 'cancellation (of a contract)']],
    },

    {
      id: 'n2-email-defect', level: 'N2', type: 'short', form: 'email',
      title: 'A faulty kettle',
      text: `@{件名|けんめい}|お{問|と}い{合|あ}わせの{件|けん}（ご{注文|ちゅうもん}{番号|ばんごう}：A-2307）
@{送信|そうしん}{者|しゃ}|{株式会社|かぶしきがいしゃ}みどり{家電|かでん}　お{客様|きゃくさま}{相談|そうだん}{室|しつ}
{高木|たかぎ}{様|さま}
このたびは、{弊社|へいしゃ}の{電気|でんき}ケトルに{不具合|ふぐあい}があったとのこと、{大変|たいへん}ご{迷惑|めいわく}をおかけし、{誠|まこと}に{申|もう}し{訳|わけ}ございません。
お{手数|てすう}をおかけいたしますが、«1|{本|ほん}メールに{添付|てんぷ}した{着払|ちゃくばら}い{伝票|でんぴょう}を{印刷|いんさつ}していただき、お{手元|てもと}の{製品|せいひん}を{弊社|へいしゃ}までご{返送|へんそう}いただけますでしょうか»。{到着|とうちゃく}{後|ご}、{検品|けんぴん}のうえ、{新|あたら}しい{製品|せいひん}を{発送|はっそう}いたします。なお、{交換|こうかん}ではなく{返金|へんきん}をご{希望|きぼう}の{場合|ばあい}は、{返送|へんそう}の{際|さい}に「{返金|へんきん}{希望|きぼう}」と{書|か}いたメモを{製品|せいひん}と{一緒|いっしょ}にお{入|い}れください。
{今後|こんご}このようなことがないよう、{品質|ひんしつ}{管理|かんり}を{徹底|てってい}してまいります。`,
      en: `Subject: Your enquiry (order no. A-2307)
From: Midori Electric Co., Ltd., Customer Service
Dear Ms Takagi,
We are very sorry for the trouble caused by the fault in our electric kettle.
We apologise for the inconvenience, but could you print the cash-on-delivery shipping label attached to this email and send the product back to us? Once it arrives and has been checked, we will send you a new one. If you would prefer a refund rather than an exchange, please put a note saying "refund please" in with the product when you send it back.
We will make sure our quality control prevents this from happening again.`,
      questions: [{
        q: '{高木|たかぎ}さんが{新|あたら}しい{製品|せいひん}を{受|う}け{取|と}るためには、まず{何|なに}をしなければならないか。',
        en: 'To get a new product, what must Ms Takagi do first?',
        choices: [
          ['{添付|てんぷ}の{伝票|でんぴょう}を{印刷|いんさつ}して、ケトルを{会社|かいしゃ}に{送|おく}り{返|かえ}す。', 'Print the attached label and send the kettle back to the company.'],
          ['{送料|そうりょう}を{払|はら}って、ケトルを{買|か}った{店|みせ}に{持|も}って{行|い}く。', 'Pay the postage and take the kettle to the shop where she bought it.'],
          ['「{返金|へんきん}{希望|きぼう}」と{書|か}いたメモを{会社|かいしゃ}に{送|おく}る。', 'Send the company a note saying “refund please”.'],
          ['{新|あたら}しい{製品|せいひん}が{届|とど}いてから、{古|ふる}いケトルを{送|おく}り{返|かえ}す。', 'Send the old kettle back once the new one arrives.'],
        ],
        why: 'The request is 〜ていただけますでしょうか: print the label and send the kettle back. The new one is sent only after it arrives and is checked (到着{後|ご}、検品のうえ). The label is cash-on-delivery (着払い), so she doesn’t pay postage, and the “refund” note is only for someone who wants their money back instead.',
      }],
      words: [['{不具合|ふぐあい}', 'ふぐあい', 'fault, defect'], ['お{手数|てすう}をおかけいたしますが', 'おてすうをおかけいたしますが', 'sorry to trouble you, but'], ['{着払|ちゃくばら}い', 'ちゃくばらい', 'cash on delivery (the receiver pays postage)'], ['{伝票|でんぴょう}', 'でんぴょう', 'slip, (shipping) label'], ['{検品|けんぴん}', 'けんぴん', 'inspecting goods'], ['〜のうえ', '', 'after …ing'], ['{徹底|てってい}する', 'てっていする', 'to be thorough']],
    },

    {
      id: 'n2-notice-gym-fee', level: 'N2', type: 'short', form: 'notice',
      title: 'Membership fees are going up',
      text: `# {会員|かいいん}の{皆様|みなさま}へ　{月|つき}{会費|かいひ}{改定|かいてい}のお{知|し}らせ
{平素|へいそ}より{当|とう}クラブをご{利用|りよう}いただき、{誠|まこと}にありがとうございます。
{近年|きんねん}の{光熱|こうねつ}{費|ひ}の{上昇|じょうしょう}に{伴|ともな}い、«1|2027{年|ねん}4{月|がつ}より、{全|ぜん}プランの{月|つき}{会費|かいひ}を{一律|いちりつ}1,000{円|えん}{値上|ねあ}げさせていただくこととなりました»。ただし、«1|2027{年|ねん}3{月|がつ}{末日|まつじつ}までにご{入会|にゅうかい}された{方|かた}は、2028{年|ねん}3{月|がつ}{分|ぶん}までは{現在|げんざい}の{月|つき}{会費|かいひ}のままご{利用|りよう}いただけます»。
{会員|かいいん}の{皆様|みなさま}にはご{負担|ふたん}をおかけいたしますが、{何卒|なにとぞ}ご{理解|りかい}{賜|たまわ}りますようお{願|ねが}い{申|もう}し{上|あ}げます。
> フィットネスクラブ「ゆうゆう」`,
      en: `To all members: notice of revised monthly fees
Thank you very much for your continued use of our club.
Because of the rise in heating and electricity costs in recent years, from April 2027 the monthly fee for every plan will go up by a flat 1,000 yen. However, members who join by the end of March 2027 can keep paying the current monthly fee until the March 2028 payment.
We are sorry for the extra burden on our members, and ask for your kind understanding.
Yuyu Fitness Club`,
      questions: [{
        q: 'このお{知|し}らせの{内容|ないよう}と{合|あ}っているものはどれか。',
        en: 'Which matches what this notice says?',
        choices: [
          ['{今|いま}すでに{会員|かいいん}の{人|ひと}は、2028{年|ねん}4{月|がつ}{分|ぶん}から{月|つき}{会費|かいひ}が{上|あ}がる。', 'For people who are already members, the fee goes up from the April 2028 payment.'],
          ['2027{年|ねん}4{月|がつ}から、すべての{会員|かいいん}の{月|つき}{会費|かいひ}が{上|あ}がる。', 'From April 2027, every member’s fee goes up.'],
          ['2027{年|ねん}3{月|がつ}までに{入会|にゅうかい}すれば、ずっと{今|いま}の{月|つき}{会費|かいひ}で{利用|りよう}できる。', 'Joining by March 2027 means paying the current fee for good.'],
          ['プランによって、{値上|ねあ}げの{金額|きんがく}が{違|ちが}う。', 'The increase is different for each plan.'],
        ],
        why: 'ただし introduces the exception: anyone who joins by the end of March 2027 — which includes people who are members now — keeps the old fee until the March 2028 payment, so their fee rises from April 2028. It’s not “for good”, and the rise is the same 1,000 yen for every plan (一律).',
      }],
      words: [['{改定|かいてい}', 'かいてい', 'revision (of prices)'], ['{光熱|こうねつ}{費|ひ}', 'こうねつひ', 'heating and electricity costs'], ['{一律|いちりつ}', 'いちりつ', 'across the board, flat'], ['{値上|ねあ}げ', 'ねあげ', 'price rise'], ['{末日|まつじつ}', 'まつじつ', 'the last day (of a month)'], ['〜のまま', '', 'as it is, unchanged']],
    },

    {
      id: 'n2-memo-weekly-report', level: 'N2', type: 'short', form: 'memo',
      title: 'A new way to write the weekly report',
      text: `{課員|かいん}{各位|かくい}
> {営業|えいぎょう}{企画|きかく}{課|か}　{課長|かちょう}　{松井|まつい}
{来月|らいげつ}から、{週報|しゅうほう}の{書|か}き{方|かた}を{一部|いちぶ}{変更|へんこう}します。
これまでは、{訪問|ほうもん}した{取引|とりひき}{先|さき}と{商談|しょうだん}の{内容|ないよう}をすべて{書|か}いてもらっていましたが、{今後|こんご}は«1|「{成果|せいか}があったもの」と「{問題|もんだい}が{起|お}きているもの」に{絞|しぼ}って{書|か}いてください»。{商談|しょうだん}の{細|こま}かい{記録|きろく}は、{顧客|こきゃく}{管理|かんり}システムに{入力|にゅうりょく}するだけで{構|かま}いません。
{提出|ていしゅつ}{期限|きげん}は、これまでどおり{毎週|まいしゅう}{金曜日|きんようび}の17{時|じ}です。なお、{変更|へんこう}に{伴|ともな}い{書式|しょしき}も{新|あたら}しいものに{替|か}えますので、{来週|らいしゅう}{中|ちゅう}に{共有|きょうゆう}フォルダに{置|お}いておきます。`,
      en: `To all section members
Matsui, Manager, Sales Planning Section
From next month, part of the way the weekly report is written will change.
Until now we have asked you to write about every client you visited and everything discussed, but from now on please only write about deals that produced results and deals where problems are arising. Detailed records of meetings only need to be entered in the customer management system.
The deadline stays the same: 17:00 every Friday. With this change, the form will also be replaced by a new one, which I will put in the shared folder during next week.`,
      questions: [{
        q: 'このメモで{課長|かちょう}が{最|もっと}も{伝|つた}えたいことは{何|なに}か。',
        en: 'What does the section manager most want to say in this memo?',
        choices: [
          ['{週報|しゅうほう}には、{成果|せいか}があった{商談|しょうだん}と{問題|もんだい}が{起|お}きている{商談|しょうだん}だけを{書|か}けばいい。', 'The weekly report need only cover deals with results and deals with problems.'],
          ['{週報|しゅうほう}の{提出|ていしゅつ}{期限|きげん}が{変|か}わる。', 'The deadline for the weekly report is changing.'],
          ['{商談|しょうだん}の{記録|きろく}は、{週報|しゅうほう}にも{顧客|こきゃく}{管理|かんり}システムにもすべて{書|か}く。', 'Every meeting must be recorded both in the report and in the system.'],
          ['{来週|らいしゅう}から、{新|あたら}しい{書式|しょしき}で{週報|しゅうほう}を{出|だ}さなければならない。', 'From next week, reports must be on the new form.'],
        ],
        why: 'The change is 今後は … に絞って書いてください: only the deals with results or problems. The deadline stays as it was (これまでどおり), details go only in the system (入力するだけで構いません), and the new form is put out next week for use from next month.',
      }],
      words: [['{各位|かくい}', 'かくい', 'to all (in an address)'], ['{週報|しゅうほう}', 'しゅうほう', 'weekly report'], ['{取引|とりひき}{先|さき}', 'とりひきさき', 'client, business partner'], ['{商談|しょうだん}', 'しょうだん', 'business talks, deal'], ['〜に{絞|しぼ}る', 'にしぼる', 'to narrow down to …'], ['{顧客|こきゃく}', 'こきゃく', 'customer'], ['{書式|しょしき}', 'しょしき', 'form, format']],
    },

    {
      id: 'n2-notice-demolition', level: 'N2', type: 'short', form: 'notice',
      title: 'Demolition work next door',
      text: `# {近隣|きんりん}の{皆様|みなさま}へ　{解体|かいたい}{工事|こうじ}のお{知|し}らせ
このたび、{下記|かき}の{建物|たてもの}の{解体|かいたい}{工事|こうじ}を{行|おこな}うこととなりました。{工事|こうじ}{期間|きかん}{中|ちゅう}は、{騒音|そうおん}や{振動|しんどう}などでご{迷惑|めいわく}をおかけいたしますが、ご{理解|りかい}とご{協力|きょうりょく}をお{願|ねが}い{申|もう}し{上|あ}げます。
{工事|こうじ}{場所|ばしょ}：さくら{町|まち}3{丁目|ちょうめ}　{旧|きゅう}さくら{銀行|ぎんこう}ビル
{工事|こうじ}{期間|きかん}：2027{年|ねん}1{月|がつ}12{日|にち}〜3{月|がつ}31{日|にち}（{日曜|にちよう}・{祝日|しゅくじつ}は{休|きゅう}{工|こう}）
{作業|さぎょう}{時間|じかん}：{午前|ごぜん}8{時|じ}30{分|ぷん}〜{午後|ごご}5{時|じ}30{分|ぷん}
«1|{特|とく}に{大|おお}きな{音|おと}が{出|で}る{作業|さぎょう}は、{午前|ごぜん}9{時|じ}から{正午|しょうご}まで、および{午後|ごご}1{時|じ}から4{時|じ}までの{時間|じかん}に{限|かぎ}って{行|おこな}います»。また、{工事|こうじ}{車両|しゃりょう}が{出入|でい}りする{際|さい}は{誘導|ゆうどう}{員|いん}を{配置|はいち}し、{歩行|ほこう}{者|しゃ}の{安全|あんぜん}を{確保|かくほ}いたします。
> {施工|しこう}：みどり{建設|けんせつ}{株式会社|かぶしきがいしゃ}`,
      en: `To our neighbours: notice of demolition work
We will be demolishing the building below. We apologise for the noise, vibration and other trouble during the work, and ask for your understanding and cooperation.
Site: the former Sakura Bank building, 3-chome, Sakura-machi
Period: 12 January to 31 March 2027 (no work on Sundays and public holidays)
Working hours: 8:30 in the morning to 5:30 in the afternoon
Particularly noisy work will be done only from 9 in the morning to noon, and from 1 to 4 in the afternoon. When construction vehicles come and go, guides will be posted to keep pedestrians safe.
Contractor: Midori Construction Co., Ltd.`,
      questions: [{
        q: 'この{工事|こうじ}について、{正|ただ}しいものはどれか。',
        en: 'Which is true about this work?',
        choices: [
          ['{大|おお}きな{音|おと}の{出|で}る{作業|さぎょう}は、{昼|ひる}の12{時|じ}から1{時|じ}の{間|あいだ}には{行|おこな}われない。', 'No noisy work is done between 12 and 1.'],
          ['{作業|さぎょう}は、{毎日|まいにち}{午前|ごぜん}8{時|じ}30{分|ぷん}から{行|おこな}われる。', 'Work starts at 8:30 every day.'],
          ['{大|おお}きな{音|おと}の{出|で}る{作業|さぎょう}は、{午後|ごご}5{時|じ}30{分|ぷん}まで{続|つづ}く。', 'Noisy work continues until 5:30.'],
          ['{工事|こうじ}{車両|しゃりょう}が{出入|でい}りする{時|とき}は、{歩行|ほこう}{者|しゃ}は{通|とお}れなくなる。', 'Pedestrians can’t pass when construction vehicles come and go.'],
        ],
        why: 'Noisy work is limited (〜に限って) to 9–12 and 1–4, so the lunch hour is quiet. Sundays and holidays are off (not every day), work in general — not noisy work — runs to 5:30, and guides keep pedestrians safe rather than stopping them.',
      }],
      words: [['{近隣|きんりん}', 'きんりん', 'neighbourhood'], ['{解体|かいたい}', 'かいたい', 'demolition'], ['{騒音|そうおん}', 'そうおん', 'noise'], ['{振動|しんどう}', 'しんどう', 'vibration'], ['〜に{限|かぎ}って', 'にかぎって', 'only (at / in) …'], ['{誘導|ゆうどう}{員|いん}', 'ゆうどういん', 'traffic guide'], ['{確保|かくほ}', 'かくほ', 'securing, ensuring']],
    },

    {
      id: 'n2-letter-anniversary', level: 'N2', type: 'short', form: 'letter',
      title: 'An anniversary party invitation',
      text: `{株式会社|かぶしきがいしゃ}さくら{商事|しょうじ}　{営業|えいぎょう}{部長|ぶちょう}　{中島|なかじま}{様|さま}
> {株式会社|かぶしきがいしゃ}みどりデザイン　{代表|だいひょう}{取締役|とりしまりやく}　{小川|おがわ}{健|けん}
# {創立|そうりつ}{二|に}{十|じゅう}{周年|しゅうねん}{記念|きねん}パーティーのご{案内|あんない}
{拝啓|はいけい}　{晩秋|ばんしゅう}の{候|こう}、{貴社|きしゃ}ますますご{清栄|せいえい}のこととお{喜|よろこ}び{申|もう}し{上|あ}げます。{平素|へいそ}は{格別|かくべつ}のご{高配|こうはい}を{賜|たまわ}り、{厚|あつ}く{御礼|おれい}{申|もう}し{上|あ}げます。
さて、{弊社|へいしゃ}はおかげさまで、この12{月|がつ}に{創立|そうりつ}{二|に}{十|じゅう}{周年|しゅうねん}を{迎|むか}えることとなりました。つきましては、{日頃|ひごろ}お{世話|せわ}になっている{皆様|みなさま}への{感謝|かんしゃ}を{込|こ}めて、{記念|きねん}パーティーを{催|もよお}したく{存|ぞん}じます。
ご{多用|たよう}{中|ちゅう}とは{存|ぞん}じますが、«1|ご{出席|しゅっせき}の{可否|かひ}を、11{月|がつ}28{日|にち}までに{同封|どうふう}のはがきにてお{知|し}らせくださいますよう»お{願|ねが}い{申|もう}し{上|あ}げます。　{敬具|けいぐ}`,
      en: `Mr Nakajima, Sales Manager, Sakura Trading Co., Ltd.
Ken Ogawa, President, Midori Design Inc.
Invitation to our 20th anniversary party
Dear Sir, In this late autumn season, we hope your company continues to prosper. We are deeply grateful for your exceptional support.
We are happy to say that this December our company will celebrate the 20th anniversary of its founding. To thank everyone who has supported us, we would like to hold an anniversary party.
We know you are busy, but we would be grateful if you could let us know whether you can attend, using the enclosed postcard, by 28 November. Yours sincerely`,
      questions: [{
        q: '{中島|なかじま}さんがしなければならないことは{何|なに}か。',
        en: 'What must Mr Nakajima do?',
        choices: [
          ['11{月|がつ}28{日|にち}までに、{出席|しゅっせき}するかどうかをはがきで{知|し}らせる。', 'Say by postcard, by 28 November, whether he will attend.'],
          ['11{月|がつ}28{日|にち}に、パーティーに{出席|しゅっせき}する。', 'Attend the party on 28 November.'],
          ['12{月|がつ}までに、お{祝|いわ}いの{品|しな}を{送|おく}る。', 'Send an anniversary gift by December.'],
          ['パーティーに{出席|しゅっせき}する{人数|にんずう}を、{電話|でんわ}で{知|し}らせる。', 'Phone to say how many people will attend.'],
        ],
        why: 'Everything before the last paragraph is formal greeting and background. The request is ご出席の可否を … はがきにてお知らせくださいますよう: whether he can attend (可否 — yes or no), by the 28th, on the enclosed postcard. The 28th is the reply deadline, not the party.',
      }],
      words: [['{創立|そうりつ}', 'そうりつ', 'founding'], ['{周|しゅう}{年|ねん}', 'しゅうねん', '… th anniversary'], ['{拝啓|はいけい} / {敬具|けいぐ}', 'はいけい / けいぐ', 'formal letter opening / closing'], ['ご{高配|こうはい}', 'ごこうはい', '(your) kind consideration'], ['{催|もよお}す', 'もよおす', 'to hold (an event)'], ['{可否|かひ}', 'かひ', 'yes or no; whether'], ['ご{多用|たよう}{中|ちゅう}', 'ごたようちゅう', 'while you are busy']],
    },

    {
      id: 'n2-email-recall', level: 'N2', type: 'short', form: 'email',
      title: 'A product recall',
      text: `@{件名|けんめい}|【{重要|じゅうよう}】{製品|せいひん}の{自主|じしゅ}{回収|かいしゅう}のお{知|し}らせとお{願|ねが}い
@{送信|そうしん}{者|しゃ}|{株式会社|かぶしきがいしゃ}ひかり{電機|でんき}　お{客様|きゃくさま}{窓口|まどぐち}
お{客様|きゃくさま}{各位|かくい}
{弊社|へいしゃ}が2025{年|ねん}10{月|がつ}から2026{年|ねん}3{月|がつ}までに{販売|はんばい}いたしました{充電|じゅうでん}{式|しき}{扇風機|せんぷうき}「そよかぜ」の{一部|いちぶ}{製品|せいひん}において、バッテリーが{異常|いじょう}に{発熱|はつねつ}するおそれがあることが{判明|はんめい}いたしました。
{対象|たいしょう}{製品|せいひん}をお{持|も}ちのお{客様|きゃくさま}は、«1|{直|ただ}ちにご{使用|しよう}を{中止|ちゅうし}し、{充電|じゅうでん}{器|き}をコンセントから{抜|ぬ}いていただきますよう»お{願|ねが}いいたします。{対象|たいしょう}かどうかは、{本体|ほんたい}の{裏面|りめん}に{記載|きさい}された{製造|せいぞう}{番号|ばんごう}で{確認|かくにん}できます。{対象|たいしょう}{製品|せいひん}は{弊社|へいしゃ}が{無償|むしょう}で{回収|かいしゅう}し、{代金|だいきん}を{全額|ぜんがく}{返金|へんきん}いたします。«1|{回収|かいしゅう}のお{申|もう}し{込|こ}みは、{専用|せんよう}ダイヤルまたはホームページにて{承|うけたまわ}っております»。`,
      en: `Subject: [Important] Voluntary recall of a product
From: Hikari Electric Co., Ltd., customer service
To all our customers,
We have found that the battery in some of the "Soyokaze" rechargeable fans we sold between October 2025 and March 2026 may overheat.
If you have one of the affected products, please stop using it at once and unplug the charger. You can check whether yours is affected by the serial number on the back of the fan. We will collect affected products free of charge and refund the full price. Collection can be requested on our dedicated phone line or on our website.`,
      questions: [{
        q: '{対象|たいしょう}の{扇風機|せんぷうき}を{持|も}っている{人|ひと}がすべきことは{何|なに}か。',
        en: 'What should someone with an affected fan do?',
        choices: [
          ['{使|つか}うのをやめ、{専用|せんよう}ダイヤルかホームページで{回収|かいしゅう}を{申|もう}し{込|こ}む。', 'Stop using it and request a collection by phone or on the website.'],
          ['{充電|じゅうでん}{器|き}を{新|あたら}しいものに{替|か}えて、{使|つか}い{続|つづ}ける。', 'Replace the charger and keep using it.'],
          ['{製造|せいぞう}{番号|ばんごう}を{確認|かくにん}し、{買|か}った{店|みせ}に{持|も}って{行|い}く。', 'Check the serial number and take it to the shop where they bought it.'],
          ['{扇風機|せんぷうき}を{会社|かいしゃ}に{送|おく}り、{修理|しゅうり}してもらう。', 'Send the fan to the company to be repaired.'],
        ],
        why: 'Two steps: stop using it now and unplug the charger (直ちにご使用を中止し…), then request collection on the dedicated line or the website (専用ダイヤルまたはホームページにて). The company collects it and refunds the money — no shop visit and no repair.',
      }],
      words: [['{自主|じしゅ}{回収|かいしゅう}', 'じしゅかいしゅう', 'voluntary recall'], ['{発熱|はつねつ}', 'はつねつ', 'heating up'], ['〜おそれがある', '', 'there is a risk that …'], ['{判明|はんめい}', 'はんめい', 'becoming clear, being found'], ['{直|ただ}ちに', 'ただちに', 'at once'], ['{無償|むしょう}', 'むしょう', 'free of charge'], ['{承|うけたまわ}る', 'うけたまわる', 'to accept (humble)']],
    },

    {
      id: 'n2-info-subsidy', level: 'N2', type: 'info', form: 'flyer',
      title: 'A grant for energy-saving appliances',
      text: `# さくら{市|し}　{省|しょう}エネ{家電|かでん}{買|か}い{替|か}え{補助|ほじょ}{金|きん}
{市民|しみん}の{皆様|みなさま}が、{省|しょう}エネ{性能|せいのう}の{高|たか}い{家電|かでん}に{買|か}い{替|か}える{際|さい}、{購入|こうにゅう}{費用|ひよう}の{一部|いちぶ}を{補助|ほじょ}します。
|! {対象|たいしょう}{製品|せいひん} | {条件|じょうけん} | {補助|ほじょ}{額|がく}
| «1|エアコン» | «1|{省|しょう}エネ{基準|きじゅん}{達成|たっせい}{率|りつ}100%{以上|いじょう}» | «1|{購入|こうにゅう}{額|がく}の20%（{上限|じょうげん}3{万|まん}{円|えん}）»
| «2|{冷蔵庫|れいぞうこ}» | «2|{省|しょう}エネ{基準|きじゅん}{達成|たっせい}{率|りつ}100%{以上|いじょう}・{容量|ようりょう}250L{以上|いじょう}» | «2|{購入|こうにゅう}{額|がく}の20%（{上限|じょうげん}2{万|まん}{円|えん}）»
| «2|LED{照明|しょうめい}» | {居間|いま}・{台所|だいどころ}などに{設置|せっち}するもの | «2|{購入|こうにゅう}{額|がく}の50%（{上限|じょうげん}5{千|せん}{円|えん}）»
■{対象|たいしょう}となる{方|かた}
・{市内|しない}に{住民|じゅうみん}{登録|とうろく}があり、{市|し}{税|ぜい}を{滞納|たいのう}していない{方|かた}
・«1|2026{年|ねん}4{月|がつ}1{日|にち}{以降|いこう}に、{市内|しない}の{登録|とうろく}{店|てん}で{購入|こうにゅう}し、{設置|せっち}まで{完了|かんりょう}した{方|かた}»
■{申請|しんせい}{方法|ほうほう}
{購入|こうにゅう}{日|び}から3か{月|げつ}{以内|いない}に、{申請|しんせい}{書|しょ}・{領収|りょうしゅう}{書|しょ}（{原本|げんぽん}）・{保証書|ほしょうしょ}の{写|うつ}しを、{市役所|しやくしょ}{環境|かんきょう}{課|か}へ{郵送|ゆうそう}または{持参|じさん}してください。«2|{申請|しんせい}は1{世帯|せたい}につき1{回|かい}{限|かぎ}り、{補助|ほじょ}{額|がく}は{合計|ごうけい}5{万|まん}{円|えん}まで»です。
■{注意|ちゅうい}
・{中古|ちゅうこ}{品|ひん}、インターネット{通販|つうはん}での{購入|こうにゅう}は{対象|たいしょう}{外|がい}です。
・リースやレンタルの{製品|せいひん}も{対象|たいしょう}{外|がい}です。
・{予算|よさん}{額|がく}に{達|たっ}した{時点|じてん}で{受付|うけつけ}を{終了|しゅうりょう}します。
■{審査|しんさ}と{支払|しはら}い
{申請|しんせい}{書類|しょるい}を{審査|しんさ}のうえ、{約|やく}2か{月|げつ}{後|ご}に{指定|してい}の{口座|こうざ}へ{振|ふ}り{込|こ}みます。{書類|しょるい}に{不備|ふび}がある{場合|ばあい}は{支払|しはら}いが{遅|おく}れることがありますので、ご{注意|ちゅうい}ください。
{登録|とうろく}{店|てん}の{一覧|いちらん}は、{市|し}のホームページでご{確認|かくにん}いただけます。
お{問|と}い{合|あ}わせ：さくら{市役所|しやくしょ}　{環境|かんきょう}{課|か}（{平日|へいじつ}8:30〜17:15）`,
      en: `Sakura City — grant for replacing appliances with energy-saving ones
When residents replace an appliance with a highly energy-efficient one, the city pays part of the cost.
Product | Condition | Grant
Air conditioner | 100% or more of the energy-saving standard | 20% of the price (up to 30,000 yen)
Fridge | 100% or more of the energy-saving standard, capacity 250 L or more | 20% of the price (up to 20,000 yen)
LED lighting | Fitted in a living room, kitchen etc. | 50% of the price (up to 5,000 yen)
Who can apply
• Registered residents of the city who are not behind with city taxes
• People who bought the product at a registered shop in the city on or after 1 April 2026, and have had it installed
How to apply
Within 3 months of the date of purchase, send or bring the application form, the original receipt and a copy of the guarantee to the Environment Division at City Hall. Each household can apply once, for up to 50,000 yen in all.
Please note
• Second-hand goods and goods bought online are not covered.
• Leased and rented products are not covered either.
• Applications close when the budget runs out.
Checking and payment
After your application has been checked, the grant will be paid into your chosen account about 2 months later. Please note that payment may be delayed if anything is missing from your documents.
A list of registered shops can be found on the city's website.
Enquiries: Sakura City Hall, Environment Division (weekdays 8:30–17:15)`,
      questions: [{
        q: '{鈴木|すずき}さんは、2026{年|ねん}5{月|がつ}に{市内|しない}の{登録|とうろく}{店|てん}でエアコン（{基準|きじゅん}{達成|たっせい}{率|りつ}120%）を18{万|まん}{円|えん}で{買|か}い、{設置|せっち}してもらった。{補助|ほじょ}{額|がく}はいくらか。',
        en: 'In May 2026 Ms Suzuki bought an air conditioner (120% of the standard) for 180,000 yen at a registered shop in the city, and had it installed. How much is the grant?',
        choices: [
          ['3{万|まん}{円|えん}', '30,000 yen'],
          ['3{万|まん}6{千|せん}{円|えん}', '36,000 yen'],
          ['1{万|まん}8{千|せん}{円|えん}', '18,000 yen'],
          ['5{万|まん}{円|えん}', '50,000 yen'],
        ],
        why: '20% of 180,000 yen is 36,000 yen, but the air-conditioner grant is capped at 30,000 (上限3万円). Everything else fits: bought after 1 April 2026, at a registered shop in the city, and installed.',
      }, {
        q: '{鈴木|すずき}さんは、{同|おな}じ{申請|しんせい}で、{冷蔵庫|れいぞうこ}（{容量|ようりょう}300L・{基準|きじゅん}{達成|たっせい}{率|りつ}110%・15{万|まん}{円|えん}）とLED{照明|しょうめい}（2{万|まん}{円|えん}）の{分|ぶん}も{申|もう}し{込|こ}んだ。{補助|ほじょ}{額|がく}は{全部|ぜんぶ}でいくらか。',
        en: 'In the same application, Ms Suzuki also claims for a fridge (300 L, 110% of the standard, 150,000 yen) and LED lighting (20,000 yen). How much is the grant in total?',
        choices: [
          ['5{万|まん}{円|えん}', '50,000 yen'],
          ['5{万|まん}5{千|せん}{円|えん}', '55,000 yen'],
          ['4{万|まん}5{千|せん}{円|えん}', '45,000 yen'],
          ['7{万|まん}6{千|せん}{円|えん}', '76,000 yen'],
        ],
        why: 'Air conditioner 30,000 (capped); fridge 20% of 150,000 = 30,000, capped at 20,000; LED 50% of 20,000 = 10,000, capped at 5,000. That adds up to 55,000 — but one household gets at most 50,000 yen in all (合計5万円まで).',
      }],
      words: [['{省|しょう}エネ', 'しょうエネ', 'energy-saving'], ['{補助|ほじょ}{金|きん}', 'ほじょきん', 'grant, subsidy'], ['{達成|たっせい}{率|りつ}', 'たっせいりつ', 'rate of achievement'], ['{上限|じょうげん}', 'じょうげん', 'upper limit'], ['{滞納|たいのう}', 'たいのう', 'being behind with payments'], ['{世帯|せたい}', 'せたい', 'household'], ['{予算|よさん}', 'よさん', 'budget']],
    },

    {
      id: 'n2-info-railpass', level: 'N2', type: 'info', form: 'flyer',
      title: 'Rail and bus passes',
      text: `# みどり{鉄道|てつどう}　お{得|とく}なきっぷのご{案内|あんない}
|! きっぷ | {有効|ゆうこう}{期間|きかん} | {利用|りよう}できる{範囲|はんい} | {大人|おとな} | {小児|しょうに}
| 1{日|にち}フリーきっぷ | 1{日|にち} | みどり{鉄道|てつどう}{全線|ぜんせん} | 1,800{円|えん} | 900{円|えん}
| «2|{2日|ふつか}フリーきっぷ» | «2|{連続|れんぞく}する{2日間|ふつかかん}» | みどり{鉄道|てつどう}{全線|ぜんせん}・{路線|ろせん}バス | 3,200{円|えん} | 1,600{円|えん}
| «1|{週末|しゅうまつ}パス» | «1|{土|ど}・{日|にち}・{祝日|しゅくじつ}のうち1{日|にち}» | «1|みどり{鉄道|てつどう}{全線|ぜんせん}・{路線|ろせん}バス» | «1|1,500{円|えん}» | 750{円|えん}
| {回数|かいすう}{券|けん}（11{枚|まい}つづり） | {発売|はつばい}{日|び}から3か{月|げつ} | {指定|してい}した{区間|くかん} | {普通|ふつう}{運賃|うんちん}の10{回分|かいぶん} | {普通|ふつう}{運賃|うんちん}の10{回分|かいぶん}
・«2|{小児|しょうに}は{小学生|しょうがくせい}です。{小学生|しょうがくせい}{未満|みまん}のお{子様|こさま}は、{大人|おとな}1{名|めい}につき2{名|めい}まで{無料|むりょう}です»。
・«2|フリーきっぷ・{週末|しゅうまつ}パスは、{駅|えき}の{窓口|まどぐち}と{券売|けんばい}{機|き}で{当日|とうじつ}のみ{発売|はつばい}します（{前売|まえう}りはありません）»。
・«2|{特急|とっきゅう}にご{乗車|じょうしゃ}の{場合|ばあい}は、{別|べつ}に{特急|とっきゅう}{券|けん}が{必要|ひつよう}です»。
・{週末|しゅうまつ}パスは、{年末年始|ねんまつねんし}（12{月|がつ}30{日|にち}〜1{月|がつ}{3日|みっか}）もご{利用|りよう}いただけます。
・{回数|かいすう}{券|けん}の{払|はら}い{戻|もど}しには{手数料|てすうりょう}220{円|えん}がかかり、{使用|しよう}{済|ず}みの{分|ぶん}は{普通|ふつう}{運賃|うんちん}で{計算|けいさん}します。
・きっぷをなくされた{場合|ばあい}、{再|さい}{発行|はっこう}はいたしません。
・フリーきっぷ・{週末|しゅうまつ}パスをお{持|も}ちの{方|かた}は、{沿線|えんせん}の{美術館|びじゅつかん}・{博物館|はくぶつかん}の{入館|にゅうかん}{料|りょう}が1{割|わり}{引|び}きになります（{入館|にゅうかん}の{際|さい}にきっぷをお{見|み}せください）。
・{2日|ふつか}フリーきっぷは、1{日|にち}{目|め}に{初|はじ}めて{改札|かいさつ}を{通|とお}る{時|とき}に、{日付|ひづけ}が{入|はい}ります。
お{問|と}い{合|あ}わせ：みどり{鉄道|てつどう}お{客様|きゃくさま}センター（{毎日|まいにち}7:00〜21:00）`,
      en: `Midori Railway — money-saving tickets
Ticket | Valid for | Where you can use it | Adults | Children
1-day free pass | 1 day | All Midori Railway lines | 1,800 yen | 900 yen
2-day free pass | 2 days in a row | All Midori Railway lines and local buses | 3,200 yen | 1,600 yen
Weekend pass | 1 day on a Saturday, Sunday or holiday | All Midori Railway lines and local buses | 1,500 yen | 750 yen
Book of tickets (11) | 3 months from the date of sale | A section you choose | The price of 10 ordinary fares | The price of 10 ordinary fares
• Children means primary-school children. Up to 2 children under primary-school age travel free with each adult.
• Free passes and weekend passes are sold on the day only, at station ticket offices and machines (no advance sales).
• If you take a limited express, you need a separate limited express ticket.
• The weekend pass can also be used over New Year (30 December to 3 January).
• Refunds on books of tickets cost a 220-yen fee, and the tickets you have used are charged at the ordinary fare.
• Lost tickets cannot be reissued.
• With a free pass or weekend pass, you get 10% off admission at art galleries and museums along the line (show your ticket when you go in).
• The 2-day free pass is dated when you first go through the ticket gate on day 1.
Enquiries: Midori Railway Customer Centre (daily 7:00–21:00)`,
      questions: [{
        q: '{大人|おとな}2{人|にん}で、{日曜日|にちようび}に{一|いち}{日|にち}、みどり{鉄道|てつどう}の{電車|でんしゃ}と{路線|ろせん}バスを{使|つか}って{観光|かんこう}したい。{一番|いちばん}{安|やす}く{済|す}むきっぷを{買|か}うと、2{人|にん}でいくらか。',
        en: 'Two adults want to spend a Sunday sightseeing by Midori Railway trains and local buses. Buying the cheapest ticket that works, how much do the two of them pay?',
        choices: [
          ['3,000{円|えん}', '3,000 yen'],
          ['3,600{円|えん}', '3,600 yen'],
          ['6,400{円|えん}', '6,400 yen'],
          ['1,500{円|えん}', '1,500 yen'],
        ],
        why: 'The weekend pass covers one Saturday, Sunday or holiday, trains and buses, for 1,500 yen: 3,000 for two. The 1-day free pass costs more and doesn’t cover buses; the 2-day pass is for two days.',
      }, {
        q: 'きっぷについて、{正|ただ}しいものはどれか。',
        en: 'Which is true about these tickets?',
        choices: [
          ['3{歳|さい}と5{歳|さい}の{子|こ}どもは、{大人|おとな}1{人|にん}と{一緒|いっしょ}なら{無料|むりょう}で{乗|の}れる。', 'A 3-year-old and a 5-year-old ride free with one adult.'],
          ['{週末|しゅうまつ}パスは、{前|まえ}の{日|ひ}に{駅|えき}の{窓口|まどぐち}で{買|か}える。', 'The weekend pass can be bought at the station the day before.'],
          ['フリーきっぷがあれば、{特急|とっきゅう}にもそのまま{乗|の}れる。', 'With a free pass you can ride limited expresses as it is.'],
          ['{2日|ふつか}フリーきっぷは、{土曜日|どようび}と{次|つぎ}の{週|しゅう}の{土曜日|どようび}に{使|つか}える。', 'The 2-day pass can be used on a Saturday and the Saturday after.'],
        ],
        why: 'Children under primary-school age ride free, up to two per adult — so the 3- and 5-year-old are free. Passes are sold on the day only, limited expresses need a separate ticket, and the 2-day pass is for two days in a row (連続する2日間).',
      }],
      words: [['お{得|とく}', 'おとく', 'good value'], ['{有効|ゆうこう}{期間|きかん}', 'ゆうこうきかん', 'period of validity'], ['{範囲|はんい}', 'はんい', 'range, area'], ['{小児|しょうに}', 'しょうに', 'child (fares)'], ['{回数|かいすう}{券|けん}', 'かいすうけん', 'book of tickets'], ['{前売|まえう}り', 'まえうり', 'advance sale'], ['{払|はら}い{戻|もど}し', 'はらいもどし', 'refund']],
    },

    {
      id: 'n2-info-afterschool', level: 'N2', type: 'info', form: 'flyer',
      title: 'After-school childcare',
      text: `# さくら{市|し}　{放課後|ほうかご}{児童|じどう}クラブ　{利用|りよう}{案内|あんない}
■{対象|たいしょう}：{市内|しない}の{小学校|しょうがっこう}に{通|かよ}う1〜6{年生|ねんせい}で、{保護|ほご}{者|しゃ}が{仕事|しごと}などのため、{放課後|ほうかご}に{家庭|かてい}にいない{児童|じどう}
■{開所|かいしょ}{時間|じかん}
・{授業|じゅぎょう}のある{日|ひ}：{放課後|ほうかご}〜{午後|ごご}7{時|じ}
・{土曜日|どようび}・{長期|ちょうき}{休業|きゅうぎょう}{中|ちゅう}（{夏休|なつやす}みなど）：{午前|ごぜん}8{時|じ}〜{午後|ごご}7{時|じ}
・{日曜日|にちようび}・{祝日|しゅくじつ}・{年末年始|ねんまつねんし}は{休|やす}み
■{利用|りよう}{料|りょう}（{月額|げつがく}）
|! {区分|くぶん} | {利用|りよう}{料|りょう} | おやつ{代|だい}
| «2|{通年|つうねん}{利用|りよう}» | «2|6,000{円|えん}» | «2|1,500{円|えん}»
| {夏休|なつやす}みのみ{利用|りよう}（7・8{月|がつ}） | 10,000{円|えん} | 1,500{円|えん}
・«2|{兄弟|きょうだい}{姉妹|しまい}が{同時|どうじ}に{利用|りよう}する{場合|ばあい}、2{人|にん}{目|め}{以降|いこう}の{利用|りよう}{料|りょう}は{半額|はんがく}になります（おやつ{代|だい}は{全員|ぜんいん}{同額|どうがく}）»。
・{市民|しみん}{税|ぜい}が{非課税|ひかぜい}の{世帯|せたい}は、{利用|りよう}{料|りょう}が{免除|めんじょ}になります。
・{利用|りよう}{料|りょう}とおやつ{代|だい}は、{毎月|まいつき}{10日|とおか}に{指定|してい}の{口座|こうざ}から{引|ひ}き{落|お}とします。
■{申|もう}し{込|こ}み
«1|1{月|がつ}{6日|むいか}〜1{月|がつ}31{日|にち}に、{利用|りよう}するクラブではなく、{市役所|しやくしょ}の{子育|こそだ}て{支援|しえん}{課|か}へ{申込|もうしこみ}{書|しょ}と{就労|しゅうろう}{証明|しょうめい}{書|しょ}を{提出|ていしゅつ}してください»。{結果|けっか}は3{月|がつ}{上旬|じょうじゅん}に{郵送|ゆうそう}でお{知|し}らせします。{年度|ねんど}の{途中|とちゅう}からの{利用|りよう}も、{空|あ}きがあれば{随時|ずいじ}{受|う}け{付|つ}けます。
■{持|も}ち{物|もの}：{上|うえ}ばき、{水筒|すいとう}、{着替|きが}え。{持|も}ち{物|もの}には{必|かなら}ず{名前|なまえ}を{書|か}いてください。
■お{迎|むか}え：{午後|ごご}6{時|じ}{以降|いこう}は、{保護|ほご}{者|しゃ}または{保護|ほご}{者|しゃ}が{届|とど}け{出|で}た{方|かた}がお{迎|むか}えに{来|き}てください。{児童|じどう}だけで{帰宅|きたく}することはできません。
■お{問|と}い{合|あ}わせ：さくら{市役所|しやくしょ}　{子育|こそだ}て{支援|しえん}{課|か}（{平日|へいじつ}8:30〜17:15）`,
      en: `Sakura City — after-school children's clubs: how to use them
For: children in years 1–6 at a primary school in the city whose parents are not at home after school because of work or similar
Opening hours
• School days: after school until 7 p.m.
• Saturdays and long holidays (summer holidays etc.): 8 a.m. to 7 p.m.
• Closed on Sundays, public holidays and over New Year
Fees (monthly)
Type | Fee | Snacks
All year | 6,000 yen | 1,500 yen
Summer holidays only (July and August) | 10,000 yen | 1,500 yen
• When brothers and sisters use a club at the same time, the fee for the second child and after is halved (snacks cost the same for everyone).
• Households exempt from city resident tax pay no fee.
• Fees and snack money are taken from your chosen bank account on the 10th of each month.
Applications
From 6 to 31 January, please hand in the application form and a certificate of employment to the Childcare Support Division at City Hall, not to the club you will use. Results will be posted to you in early March. Children can also join part-way through the year whenever there is space.
What to bring: indoor shoes, a water bottle and a change of clothes. Please write your child's name on everything.
Collection: after 6 p.m., children must be collected by a parent or by someone the parents have registered. Children cannot go home on their own.
Enquiries: Sakura City Hall, Childcare Support Division (weekdays 8:30–17:15)`,
      questions: [{
        q: '{申|もう}し{込|こ}みについて、{正|ただ}しいものはどれか。',
        en: 'Which is true about applying?',
        choices: [
          ['1{月|がつ}{中|ちゅう}に、{市役所|しやくしょ}に{申込|もうしこみ}{書|しょ}と{就労|しゅうろう}{証明|しょうめい}{書|しょ}を{出|だ}す。', 'Hand the form and the certificate of employment in to City Hall in January.'],
          ['1{月|がつ}{中|ちゅう}に、{利用|りよう}するクラブに{申込|もうしこみ}{書|しょ}を{出|だ}す。', 'Hand the form in to the club you will use, in January.'],
          ['{年度|ねんど}の{途中|とちゅう}からは、{申|もう}し{込|こ}めない。', 'You can’t apply part-way through the year.'],
          ['3{月|がつ}{上旬|じょうじゅん}までに、{就労|しゅうろう}{証明|しょうめい}{書|しょ}を{郵送|ゆうそう}する。', 'Post the certificate of employment by early March.'],
        ],
        why: 'Applications go to City Hall’s Childcare Support Division, “not to the club you will use” (利用するクラブではなく), between 6 and 31 January. Early March is when results arrive, and late joiners are accepted when there is space (随時受け付けます).',
      }, {
        q: '{小学|しょうがく}3{年生|ねんせい}と1{年生|ねんせい}の{兄弟|きょうだい}が、{通年|つうねん}{利用|りよう}する。1か{月|げつ}に{払|はら}う{金額|きんがく}は、{全部|ぜんぶ}でいくらか。',
        en: 'Two brothers, in years 3 and 1 of primary school, use the club all year. How much is paid in total each month?',
        choices: [
          ['12,000{円|えん}', '12,000 yen'],
          ['10,500{円|えん}', '10,500 yen'],
          ['15,000{円|えん}', '15,000 yen'],
          ['9,000{円|えん}', '9,000 yen'],
        ],
        why: 'The first child pays 6,000 yen and the second half that, 3,000. Snacks are 1,500 each — not halved (おやつ代は全員同額): 6,000 + 3,000 + 1,500 + 1,500 = 12,000 yen.',
      }],
      words: [['{放課後|ほうかご}', 'ほうかご', 'after school'], ['{児童|じどう}', 'じどう', 'child (of primary-school age)'], ['{開所|かいしょ}', 'かいしょ', 'opening'], ['{長期|ちょうき}{休業|きゅうぎょう}', 'ちょうききゅうぎょう', 'long holidays'], ['{非課税|ひかぜい}', 'ひかぜい', 'not taxed'], ['{免除|めんじょ}', 'めんじょ', 'exemption'], ['{就労|しゅうろう}{証明|しょうめい}{書|しょ}', 'しゅうろうしょうめいしょ', 'certificate of employment']],
    },

    {
      id: 'n2-info-seminar', level: 'N2', type: 'info', form: 'flyer',
      title: 'Job-hunting seminars',
      text: `# {就職|しゅうしょく}{支援|しえん}セミナー　2{月|がつ}のスケジュール
さくら{市|し}{若者|わかもの}サポートステーション
|! {日程|にってい} | テーマ | {時間|じかん} | {形式|けいしき} | {定員|ていいん}
| «2|2{月|がつ}{4日|よっか}（{水|すい}）» | «2|{自己|じこ}{分析|ぶんせき}と{自己|じこ}PRの{書|か}き{方|かた}» | 14:00〜16:00 | {会場|かいじょう} | 20{名|めい}
| «1|2{月|がつ}{10日|とおか}（{火|か}）» | {業界|ぎょうかい}{研究|けんきゅう}：IT・{情報|じょうほう}{通信|つうしん} | «1|19:00〜20:30» | «1|オンライン» | 50{名|めい}
| 2{月|がつ}{14日|じゅうよっか}（{土|ど}） | {模擬|もぎ}{面接|めんせつ}（{個人|こじん}） | 10:00〜16:00（1{人|にん}30{分|ぷん}） | {会場|かいじょう} | 12{名|めい}
| «1|2{月|がつ}21{日|にち}（{土|ど}）» | {外国|がいこく}{人|じん}{留学生|りゅうがくせい}のための{就職|しゅうしょく}{活動|かつどう} | 13:00〜15:00 | «1|{会場|かいじょう}・オンライン» | 30{名|めい}
■{対象|たいしょう}：おおむね15〜39{歳|さい}で、{就職|しゅうしょく}を{目指|めざ}している{方|かた}（{学生|がくせい}も{可|か}）
■{参加|さんか}{費|ひ}：{無料|むりょう}
■«2|{申|もう}し{込|こ}み：{各|かく}セミナーの{3日|みっか}{前|まえ}までに、ウェブサイトの{申込|もうしこみ}フォームから»。
・«2|{模擬|もぎ}{面接|めんせつ}は、2{月|がつ}{4日|よっか}のセミナーに{参加|さんか}した{方|かた}のみ{申|もう}し{込|こ}めます»。
・オンラインのセミナーは、{前日|ぜんじつ}までに{参加|さんか}{用|よう}のURLをメールでお{送|おく}りします。
・{会場|かいじょう}：さくら{市|し}{産業|さんぎょう}{会館|かいかん}3{階|がい}
・{当日|とうじつ}の{様子|ようす}を{写真|しゃしん}に{撮|と}り、ウェブサイトに{載|の}せることがあります。
・{服装|ふくそう}は{自由|じゆう}ですが、{模擬|もぎ}{面接|めんせつ}の{日|ひ}は、できるだけスーツでお{越|こ}しください。
・キャンセルの{場合|ばあい}は、{必|かなら}ず{前日|ぜんじつ}までにご{連絡|れんらく}ください。{連絡|れんらく}なしで{欠席|けっせき}された{方|かた}は、{次回|じかい}{以降|いこう}のお{申|もう}し{込|こ}みをお{断|ことわ}りすることがあります。
お{問|と}い{合|あ}わせ：さくら{市|し}{若者|わかもの}サポートステーション（{火|ひ}〜{土|ど}　10:00〜18:00）`,
      en: `Job-hunting support seminars — February schedule
Sakura City Youth Support Station
Date | Theme | Time | Format | Places
Wed 4 Feb | Self-analysis and writing your self-PR | 14:00–16:00 | In person | 20
Tue 10 Feb | Industry research: IT and telecommunications | 19:00–20:30 | Online | 50
Sat 14 Feb | Mock interviews (one-to-one) | 10:00–16:00 (30 min each) | In person | 12
Sat 21 Feb | Job hunting for international students | 13:00–15:00 | In person and online | 30
For: people aged roughly 15–39 who are looking for work (students welcome)
Cost: free
Applications: using the form on our website, at least 3 days before each seminar.
• Mock interviews are only open to people who took part in the seminar on 4 February.
• For online seminars, we will email you the URL to join by the day before.
• Venue: Sakura City Industry Hall, 3rd floor
• We may take photos on the day and put them on our website.
• Dress as you like, but please wear a suit if you can for the mock interviews.
• If you need to cancel, please let us know by the day before. We may turn down future applications from people who miss a seminar without telling us.
Enquiries: Sakura City Youth Support Station (Tue–Sat 10:00–18:00)`,
      questions: [{
        q: '{平日|へいじつ}は{午後|ごご}6{時|じ}まで{大学|だいがく}で{授業|じゅぎょう}がある{留学生|りゅうがくせい}のアンさんは、オンラインで{参加|さんか}できるセミナーに{出|で}たい。{参加|さんか}できるのはどれか。',
        en: 'An, an international student with university classes until 6 p.m. on weekdays, wants to join seminars she can attend online. Which can she attend?',
        choices: [
          ['2{月|がつ}{10日|とおか}と2{月|がつ}21{日|にち}', '10 and 21 February'],
          ['2{月|がつ}{4日|よっか}と2{月|がつ}21{日|にち}', '4 and 21 February'],
          ['2{月|がつ}{10日|とおか}だけ', 'Only 10 February'],
          ['2{月|がつ}{14日|じゅうよっか}と2{月|がつ}21{日|にち}', '14 and 21 February'],
        ],
        why: 'Online is possible on the 10th (from 7 p.m., after her classes) and on the 21st (a Saturday, in person or online). The 4th and the 14th are in-person only — and the 4th is on a weekday afternoon.',
      }, {
        q: '{模擬|もぎ}{面接|めんせつ}に{参加|さんか}したい{人|ひと}は、どうすればいいか。',
        en: 'What should someone who wants to do a mock interview do?',
        choices: [
          ['2{月|がつ}{4日|よっか}のセミナーに{参加|さんか}し、2{月|がつ}11{日|にち}までに{模擬|もぎ}{面接|めんせつ}に{申|もう}し{込|こ}む。', 'Take part in the seminar on 4 February, and apply for the mock interview by 11 February.'],
          ['2{月|がつ}{14日|じゅうよっか}に{会場|かいじょう}へ{行|い}って、その{場|ば}で{申|もう}し{込|こ}む。', 'Go to the venue on 14 February and apply there.'],
          ['2{月|がつ}{4日|よっか}のセミナーに{申|もう}し{込|こ}めば、{模擬|もぎ}{面接|めんせつ}には{申|もう}し{込|こ}まなくていい。', 'Applying for the 4 February seminar is enough; no separate application is needed.'],
          ['2{月|がつ}21{日|にち}までに、ウェブサイトから{申|もう}し{込|こ}む。', 'Apply on the website by 21 February.'],
        ],
        why: 'Mock interviews are only for people who attended the 4 February seminar (2月4日のセミナーに参加した方のみ), and every seminar must be booked on the website 3 days ahead — for the 14th, by the 11th. There’s no applying on the day.',
      }],
      words: [['{就職|しゅうしょく}', 'しゅうしょく', 'finding a job'], ['{支援|しえん}', 'しえん', 'support'], ['{自己|じこ}{分析|ぶんせき}', 'じこぶんせき', 'self-analysis'], ['{業界|ぎょうかい}', 'ぎょうかい', 'industry'], ['{模擬|もぎ}{面接|めんせつ}', 'もぎめんせつ', 'mock interview'], ['おおむね', '', 'roughly, about'], ['{形式|けいしき}', 'けいしき', 'format']],
    },

  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = JLPT_READING;
  global.JLPT_READING = JLPT_READING;
})(typeof window !== 'undefined' ? window : globalThis);
