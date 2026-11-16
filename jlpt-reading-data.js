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
I'm having dinner with a friend after work today. I'll be home around 9 p.m. Your dinner is in the fridge. And if it rains, please bring the washing in from the garden.
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
About tomorrow's film — sorry, I have homework in the morning, so I can't go then. Would the 3 p.m. showing be OK? If it is, let's meet in front of the station at 2:45.
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
About tomorrow's meeting: Mr Yamada, our manager, now has to visit a client's office in the morning. So I'm moving the meeting from 10 a.m. to 2 p.m. It's in the same place, the meeting room on the third floor.
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
• Departure: Sakura Station north exit. Applications: up to 3 days before departure.`,
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
Please let us know which date suits you by replying to this email by Friday 5 June. If none of the dates is possible, please say so, and we will arrange another day.
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

  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = JLPT_READING;
  global.JLPT_READING = JLPT_READING;
})(typeof window !== 'undefined' ? window : globalThis);
