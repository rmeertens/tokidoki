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
  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = JLPT_READING;
  global.JLPT_READING = JLPT_READING;
})(typeof window !== 'undefined' ? window : globalThis);
