(function (global) {
  'use strict';

  // Particle questions (文法形式の判断), JLPT style: a sentence with a
  // （　）, and four particles to choose from. Tokidoki's own sentences.
  //
  // POINTS: the grammar points the questions test, by id —
  //   name    the particle(s), as shown
  //   use     which use of it (several points can share a particle: に for
  //           time, for a place where something is, for a destination…)
  //   gist    one line: what it means
  //   about   paragraphs explaining the grammar point
  //   keep    what to keep in mind (rules, common mix-ups)
  //   bunpro  the slug of Bunpro's page for it,
  //           https://bunpro.jp/grammar_points/<slug> (checked to exist;
  //           several points can share a page)
  //
  // N5 / N4 / N3: the questions —
  //   b, a    the sentence before and after the （　）
  //   c       the four choices, the answer first
  //   p       the grammar point (an id in POINTS)
  //   en      what the sentence means
  //   x       why each choice is right / wrong, in the order of c
  //
  // Furigana as {漢字|かな}. Every wrong choice must be wrong in the
  // sentence, not just less likely. Used by vocab-questions.js;
  // test_vocab_questions.js checks the data.

  const POINTS = {
    // ─── N5 ───
    wa: {
      name: 'は', use: 'Topic marker', gist: '“As for X…” — what the sentence is about.', bunpro: 'は',
      about: [
        'は (written は, read わ) marks the topic: the thing you are going to say something about. Everything after は is the comment. 私は学生です is literally “as for me, (I) am a student”.',
        'The topic is usually something both people already know about — yourself, the person you are talking to, something just mentioned. That is why は is used for plain statements of fact and introductions.',
        'は also contrasts: 肉は食べますが、魚は食べません — “meat I eat, but fish I don’t”. Putting は on two things sets them against each other.',
      ],
      keep: [
        'A question word (だれ, なに, どこ, どれ) is never followed by は: it is new information, so it takes が — だれが来ましたか.',
        'は can replace が and を (私が → 私は, 本を → 本は), and is added after other particles (に → には, で → では).',
        'In a negative sentence, は often appears where you’d expect が or を, to contrast: 魚は食べません.',
      ],
    },
    ga: {
      name: 'が', use: 'Subject marker', gist: 'Marks who or what does, is or has something — often new information.', bunpro: 'が',
      about: [
        'が marks the subject: the person or thing that does the action, or that something is true of. Where は says “as for X”, が points at X: 田中さんが来ました is “*Tanaka-san* came”.',
        'Use が when the subject is new information — after a question word (だれが, なにが, どれが) and in the answer to one — and when you simply describe what is happening: 雨が降っています, “it’s raining”.',
        'Some words take が for what would be the object in English: 好き / きらい (like / dislike), 上手 / 下手 (good / bad at), わかる (understand), できる (can do), ほしい (want), and ある / いる (there is): 猫が好きです, 日本語がわかります, 公園に子どもがいます.',
      ],
      keep: [
        'Question words take が, never は: 何がありますか, だれが行きますか.',
        'Inside a clause that describes a noun, the subject takes が (or の), not は: 母が作ったケーキ.',
        '好き, わかる, できる, ほしい, ある, いる: the thing liked / understood / had takes が, not を.',
      ],
    },
    wo: {
      name: 'を', use: 'Object marker', gist: 'Marks what the action is done to — and the place you move through or leave.', bunpro: 'を',
      about: [
        'を (read お) marks the direct object: the thing the action is done to. パンを食べます, 本を読みます, 映画を見ます.',
        'With verbs of movement, を marks the place you move through or along: 公園を散歩します (walk in / through the park), 道を渡ります (cross the road), 空を飛びます (fly through the sky).',
        'With verbs of leaving, を marks the place you leave: 家を出ます (leave home), バスを降ります (get off the bus), 大学を卒業します (graduate from university).',
      ],
      keep: [
        'Some verbs that take an object in English take に in Japanese: バスに乗ります (not バスを), 先生に会います (not 先生を), 部屋に入ります.',
        '好き, わかる, できる, ほしい take が, not を.',
        'を never follows a place where you simply do something — that’s で: 図書館で本を読みます.',
      ],
    },
    'ni-time': {
      name: 'に', use: 'Time (at / on / in)', gist: 'Marks the point in time when something happens.', bunpro: 'に',
      about: [
        'に after a time word marks when the action happens: 七時に起きます (get up at seven), 日曜日に行きます (go on Sunday), 2020年に (in 2020).',
        'Think of に as pointing at a spot on the time line — the same に that points at a spot in space (机の上に) or a destination (学校に).',
      ],
      keep: [
        'Times with a number (七時, 三月, 2020年) and days of the week take に.',
        'Relative times do NOT take に: 今日, 明日, 昨日, 毎日, 毎朝, 今, 来年, 先週 — 明日行きます, not 明日に行きます.',
        'で is not used for a point in time. 日曜日で is wrong; 日曜日に is right.',
      ],
    },
    'ni-place': {
      name: 'に', use: 'Place of existence', gist: 'Where something or someone is — with いる and ある.', bunpro: 'に',
      about: [
        'With いる (people, animals) and ある (things), に marks where it is: 机の上に猫がいます, 駅の前に銀行があります.',
        'The same に goes with verbs of staying in a place: 東京に住んでいます (live in Tokyo), ここに座ってください (sit here).',
        'Compare で, which marks where an action takes place: 公園で遊びます (play in the park). に is where something exists; で is where something happens.',
      ],
      keep: [
        'いる / ある / 住む / 座る / 置く → に. 遊ぶ / 食べる / 働く / 勉強する → で.',
        '会社に働いています is a common mistake: 働く is an action, so 会社で働いています. (会社に勤めています is right — 勤める takes に.)',
      ],
    },
    'ni-dest': {
      name: 'に', use: 'Destination', gist: 'Where you go, come, arrive or enter.', bunpro: 'に',
      about: [
        'With verbs of movement — 行く, 来る, 帰る, 着く (arrive), 入る (enter) — に marks the end point: 学校に行きます, 八時に駅に着きました, 部屋に入ります.',
        'に focuses on the arrival point. へ (also “to”) focuses on the direction of the movement; with 行く / 来る / 帰る both are fine, but with 着く and 入る, に is the natural one.',
      ],
      keep: [
        'Destination: に or へ. Starting point: から (or を for leaving: 家を出る).',
        'Never で or を for the destination: 学校で行きます / 学校を着きました are wrong.',
      ],
    },
    'ni-target': {
      name: 'に', use: 'Person or thing the action is aimed at', gist: 'To whom you give, meet, ask — and what you get on or into.', bunpro: 'に',
      about: [
        'に marks the person something is given, sent, said or taught to: 母に花をあげました, 友だちに手紙を書きます, 先生に聞きます.',
        'It also marks the target of verbs where English uses a direct object: 先生に会います (meet the teacher), バスに乗ります (get on / ride the bus), 試験に合格します (pass the exam).',
      ],
      keep: [
        '会う and 乗る take に, not を — 友だちを会いました and バスを乗りました are classic mistakes.',
        'With 会う, と is also possible (友だちと会う, “meet up with”, both sides arranged it); に is “meet / run into”.',
        'もらう can take に or から for the giver: 友だちにもらった / 友だちからもらった.',
      ],
    },
    he: {
      name: 'へ', use: 'Direction', gist: '“To / toward” a place — with verbs of going and coming.', bunpro: 'へ',
      about: [
        'へ (written へ, read え) marks the direction you move in: 日本へ行きます, 東へ向かいます. It goes with 行く, 来る, 帰る and other verbs of movement.',
        'へ and に are often interchangeable with 行く / 来る / 帰る. へ puts a bit more weight on the journey or direction, に on the destination itself.',
        'へ is also used in letters and on presents: 母へ (to Mother).',
      ],
      keep: [
        'へ is only for direction of movement — never for where something is (机の上へ猫がいます is wrong) or for time.',
        'Before の, use へ, not に: 日本への旅行 (a trip to Japan).',
      ],
    },
    'de-place': {
      name: 'で', use: 'Place of an action', gist: 'Where something happens.', bunpro: 'で',
      about: [
        'で marks the place where an action is done: 図書館で本を読みます, 会社で働いています, 公園で遊びます.',
        'Contrast に: に marks where something is (いる / ある) or where you go; で marks the stage on which you do something.',
      ],
      keep: [
        'Ask “is something being DONE there?” — yes: で. Just existing / living there, or going there: に.',
        'いる and ある take に: 教室に学生がいます. (Only when ある means an event “takes place” does it take で: 公園で祭りがあります.)',
      ],
    },
    'de-means': {
      name: 'で', use: 'Means or tool', gist: '“By / with / in” — how you do something.', bunpro: 'で',
      about: [
        'で marks the means, tool or method: バスで行きます (by bus), はしで食べます (with chopsticks), 日本語で話します (in Japanese), ペンで書きます (with a pen).',
        'It is the same で as for places, seen another way: the thing that makes the action possible.',
      ],
      keep: [
        'Transport is で: 電車で, 車で, 自転車で. On foot is 歩いて, not 足で.',
        'Getting on the vehicle itself is に: バスに乗ります. Going by it is で: バスで行きます.',
        'と is for doing something together with a person, not for tools: 友だちと食べます vs はしで食べます.',
      ],
    },
    'to-and': {
      name: 'と', use: '“And” (a complete list)', gist: 'Joins nouns: A and B (and that’s all).', bunpro: 'と-and',
      about: [
        'と joins nouns into a list: りんごとみかんを買いました, 父と母は医者です. It means the list is complete — apples and oranges, nothing else.',
        'や also means “and”, but with や the list is just examples (“things like apples and oranges”).',
      ],
      keep: [
        'と only joins nouns. To join verbs or adjectives, use the て-form: 安くておいしい.',
        'Complete list → と. Examples, “and so on” → や (often with など).',
      ],
    },
    'to-with': {
      name: 'と', use: '“With” (together with someone)', gist: 'Who you do something with.', bunpro: 'と-with',
      about: [
        'と marks the person you do something with: 友だちと映画を見ます, 母と話しました. Both people take part in the action equally.',
        'Add いっしょに for “together”: 友だちといっしょに行きます.',
      ],
      keep: [
        'と is “with” a person; “with” a tool is で: 友だちと食べる / はしで食べる.',
        'Verbs that need two people — 結婚する, けんかする, 話す, 会う — take と: 田中さんと結婚しました.',
      ],
    },
    mo: {
      name: 'も', use: '“Also / too” — and “not … any” with question words', gist: 'The same is true of this one too.', bunpro: 'も',
      about: [
        'も means “too / also”: 山田さんも先生です (Yamada-san is a teacher too). It replaces は, が and を: 私は → 私も, 本を → 本も. Other particles stay in front of it: 東京にも行きました.',
        'In a negative sentence it’s “not … either”: 私も行きません (I’m not going either).',
        'After a question word with a negative verb, it means “nothing / nobody / nowhere”: 何も食べませんでした (I didn’t eat anything), だれもいません (nobody is here), どこも行きません.',
      ],
      keep: [
        '何も / だれも / どこも + negative = nothing / nobody / nowhere. With a positive verb you need か: 何か食べました (I ate something).',
        'A も B も = both A and B (or neither, with a negative): 肉も魚も好きです.',
        'も takes the place of は / が / を — never stack them (はも, をも are wrong).',
      ],
    },
    no: {
      name: 'の', use: 'Possession and linking nouns', gist: 'X の Y — X’s Y, or a Y of / about X.', bunpro: 'の',
      about: [
        'の joins two nouns, the first describing the second: 私のかさ (my umbrella), 日本語の本 (a Japanese(-language) book), 東京の大学 (a university in Tokyo), 友だちの田中さん (my friend Tanaka-san).',
        'The noun after の is the main one; the one before tells you which, whose or what kind.',
      ],
      keep: [
        'Two nouns side by side almost always need の: 日本語の先生, not 日本語先生.',
        'い-adjectives and な-adjectives don’t take の before a noun: 高い本, きれいな花 (not 高いの本).',
        'The second noun can be left out when it’s clear: このかさは私のです (this umbrella is mine).',
      ],
    },
    ya: {
      name: 'や', use: '“And” (examples from a longer list)', gist: 'A, B and so on — things like A and B.', bunpro: 'や',
      about: [
        'や lists nouns as examples, implying there is more: 本やペンがあります (there are books, pens and the like). It’s often finished off with など: 本やペンなど.',
        'と says the list is complete; や says “for example”.',
      ],
      keep: [
        'や joins nouns only — not verbs or adjectives. For actions as examples use 〜たり〜たりする.',
        'など at the end of the list goes with や, not with と.',
      ],
    },
    'kara-from': {
      name: 'から', use: '“From” — a starting point', gist: 'Where or when something starts, or who it comes from.', bunpro: 'から',
      about: [
        'から marks a starting point in space (駅から歩きます, from the station), in time (九時から始まります, starts at / from nine) or the person something comes from (友だちからもらいました, got it from a friend).',
        'It pairs with まで: 九時から五時まで (from nine to five), 東京から大阪まで.',
      ],
      keep: [
        'から after a noun (no だ) is “from”: 駅から. With だ / a sentence before it, it’s “because”: 雨だから.',
        '始まる / 始める with a time: 九時から or 九時に both work. まで is never right there — 始まる has a start, not an end.',
        'Giver of もらう / 借りる: から or に.',
      ],
    },
    made: {
      name: 'まで', use: '“Until / as far as” (with nouns)', gist: 'The end point in time or space.', bunpro: 'noun-まで',
      about: [
        'まで marks the end point: 駅まで歩きます (walk as far as the station), 五時まで働きます (work until five), 八月三十一日までです (until August 31).',
        'It often pairs with から: 月曜日から金曜日まで (Monday to Friday).',
        'The action goes on all the way to the end point — keep working until five, walk all the way to the station.',
      ],
      keep: [
        'まで = “until” (the action continues up to then). までに = “by” (a deadline for something done once) — see までに.',
        'まで is the end, から the start: don’t swap them.',
      ],
    },
    'kara-because': {
      name: 'から', use: '“Because / so” (a reason)', gist: 'Reason から, result.', bunpro: 'から-because',
      about: [
        'After a sentence, から gives the reason for what follows: 雨が降っていますから、傘を持って行きます (it’s raining, so I’ll take an umbrella).',
        'It attaches to the plain or polite form: 高いから / 高いですから, 行くから / 行きますから; after a noun or な-adjective add だ: 雨だから, 静かだから.',
        'から can sound a little more personal or assertive than ので, and it can be followed by a request or opinion freely: 危ないから、やめて.',
      ],
      keep: [
        'Order: reason first, then から, then the result. (English “because” can come either side; から can’t.)',
        'Noun + だから = because; noun + から = from.',
        'ので means the same and is a bit softer and more polite.',
      ],
    },
    node: {
      name: 'ので', use: '“Because / so” (softer)', gist: 'Reason ので, result — a natural, polite way to give a reason.', bunpro: 'ので',
      about: [
        'ので gives a reason, like から, but presents it as a matter of fact rather than the speaker’s own argument. That makes it sound softer and more polite — good for excuses and requests: 頭が痛いので、今日は休みます.',
        'After a noun or な-adjective it becomes なので: 雨なので, 静かなので.',
      ],
      keep: [
        'Noun / な-adjective + な + ので (雨なので), not だので.',
        'ので and から are both “because”; のに is the opposite, “even though”.',
      ],
    },
    ka: {
      name: 'か', use: 'Question marker', gist: 'Turns a sentence into a question.', bunpro: 'か',
      about: [
        'か at the end of a sentence makes it a question: 学生ですか (are you a student?), トイレはどこですか (where is the toilet?).',
        'In polite speech か replaces the question mark; in casual speech a rising tone often does the job instead.',
      ],
      keep: [
        'A question word (どこ, なに, だれ) still needs か at the end in polite speech: どこですか.',
        '何か / だれか / どこか = something / someone / somewhere.',
      ],
    },
    ne: {
      name: 'ね', use: '“…isn’t it?” — sharing a feeling, seeking agreement', gist: 'You and I both know / feel this, right?', bunpro: 'ね',
      about: [
        'ね at the end of a sentence invites the listener to agree, or shows you share their view: 今日は暑いですね (it’s hot today, isn’t it). The answer is often another ね: そうですね.',
        'It also checks something you think is true: 明日は休みですね (tomorrow’s a day off, right?).',
      ],
      keep: [
        'ね = we both know this. よ = I’m telling you something you don’t know. よね = I think so, right?',
        'Commenting on the weather or a shared experience: ね.',
      ],
    },
    yo: {
      name: 'よ', use: '“…you know” — telling new information', gist: 'I’m telling you something you may not know.', bunpro: 'よ',
      about: [
        'よ at the end of a sentence tells the listener something new, or stresses that you mean it: このケーキ、おいしいですよ (this cake is good, you know — try it).',
        'It is used for advice, recommendations and gentle corrections. Used too much, or to tell someone something they obviously know, it can sound pushy.',
      ],
      keep: [
        'よ = information the listener doesn’t have. ね = information you both share.',
        'Answering a question about your own experience (“is it good?” — “yes, very!”), よ fits; か would turn your answer into a question.',
      ],
    },
    dake: {
      name: 'だけ', use: '“Only / just” (with a positive verb)', gist: 'Only this much and no more — said neutrally.', bunpro: 'だけ',
      about: [
        'だけ limits something: 卵が一つだけあります (there’s just one egg), 三人だけ来ました (only three people came), 見るだけです (I’m just looking).',
        'It goes with any kind of verb, positive or negative, and simply states the limit.',
      ],
      keep: [
        'だけ + positive verb; しか + negative verb. 一つだけあります = 一つしかありません — both “only one”, but しか stresses that it’s not enough.',
        'だけ can replace が / を (卵だけ食べた) or follow other particles (東京にだけ).',
      ],
    },
    'yori-hou': {
      name: 'より', use: 'A より B のほうが… (comparison)', gist: 'B is more … than A.', bunpro: 'より-のほうが',
      about: [
        'To compare two things: A より B のほうが + adjective — B is more … than A. バスより電車のほうが速いです (the train is faster than the bus).',
        'より goes right after the thing that is LESS: バスより = “compared with the bus”. ほう (方) means “side”, so 電車のほうが is “the train side is…”.',
        'To ask which: AとBとどちらが…ですか — 電車とバスとどちらが速いですか.',
      ],
      keep: [
        'より marks the smaller side, のほうが the bigger. Swapping them swaps the meaning.',
        'ほど is also a comparison, but only with a negative: バスは電車ほど速くない.',
      ],
    },
    kurai: {
      name: 'くらい / ぐらい', use: '“About” (an amount)', gist: 'Roughly this amount, time or number.', bunpro: 'くらい1',
      about: [
        'くらい / ぐらい after a number or amount means “about, around”: 十分ぐらいかかります (it takes about ten minutes), 百人くらい来ました.',
        'くらい and ぐらい are the same; ぐらい is more common in speech.',
      ],
      keep: [
        'For an amount or length: ぐらい. For a point in time (“around three o’clock”), ごろ is the usual word: 三時ごろ.',
        'ほど can also mean “about” with numbers, but sounds more formal.',
      ],
    },
    // ─── N4 ───
    shika: {
      name: 'しか', use: 'しか〜ない — “only” (and not enough)', gist: 'Nothing but this — with a negative verb.', bunpro: 'しか-ない',
      about: [
        'しか always goes with a negative verb: 百円しかありません (I only have 100 yen — literally “apart from 100 yen I don’t have”). 三時間しか寝ませんでした (I only slept three hours).',
        'Compared with だけ, しか〜ない stresses that the amount is small or not enough.',
      ],
      keep: [
        'しか + negative, always. しかあります is wrong; use だけあります.',
        'だけ + negative is something else: 百円だけありません would be “only the 100 yen is missing”.',
        'しか replaces が / を; other particles stay in front: 東京にしか行きません.',
      ],
    },
    yori: {
      name: 'より', use: '“Than” (comparison)', gist: 'X is more … than Y — Y より.', bunpro: 'より',
      about: [
        'より means “than” and goes after the thing being compared against: 今年の夏は去年より暑いです (this summer is hotter than last year).',
        'It also follows verbs and phrases: 思ったより簡単でした (it was easier than I thought).',
        'In a full comparison it pairs with のほうが: 肉より魚のほうが好きです.',
      ],
      keep: [
        'より + positive comparison (more …). ほど + negative (not as … as).',
        '思ったより = “than I expected” — a very common pattern.',
      ],
    },
    hodo: {
      name: 'ほど', use: '“Not as … as”; “to the point that”; 〜ば〜ほど', gist: 'The extent of something.', bunpro: 'ほど',
      about: [
        'X は Y ほど〜ない: X is not as … as Y. 今年の冬は去年ほど寒くないです (this winter isn’t as cold as last year). 思ったほど難しくなかった (it wasn’t as hard as I thought).',
        'ほど also gives an extent, “so … that”: 泣きたいほど痛かった (it hurt so much I wanted to cry).',
        '〜ば〜ほど: the more …, the more …: 勉強すればするほど面白くなる.',
      ],
      keep: [
        'Comparison with ほど needs a negative: 去年ほど寒くない. For a positive comparison, use より: 去年より寒い.',
        '泣きたいほど and 泣きたいくらい are close; ほど sounds a little stronger and more written.',
      ],
    },
    demo: {
      name: 'でも', use: '“…or something”; “even”; “any-” (with question words)', gist: 'Softens a suggestion, or means “even / any”.', bunpro: 'でも',
      about: [
        'After a noun in a suggestion, でも means “… or something”, making it sound casual and open: お茶でも飲みませんか (how about some tea or something?).',
        'After a noun it can mean “even”: 子どもでも読めます (even a child can read it).',
        'After a question word it means “any-”: だれでも (anyone), いつでも (any time), 何でも (anything — read なんでも).',
      ],
      keep: [
        'だれでも / 何でも + positive = anyone / anything. だれも / 何も + negative = nobody / nothing.',
        'お茶でも is a gentle suggestion, not “even tea”.',
      ],
    },
    madeni: {
      name: 'までに', use: '“By” (a deadline)', gist: 'Something done once, no later than then.', bunpro: 'までに',
      about: [
        'までに sets a deadline for an action that happens once: 金曜日までに出してください (please hand it in by Friday). 五時までに帰ります (I’ll be home by five).',
        'まで, without に, is “until”: the action goes on all the time up to that point (五時まで働きます, I work until five).',
      ],
      keep: [
        'One-off action (出す, 帰る, 終わる, 決める) → までに. Continuing action or state (待つ, 働く, いる, 寝る) → まで.',
        'Test: “by Friday” → までに; “until Friday” → まで.',
      ],
    },
    'made-verb': {
      name: 'まで', use: 'Verb + まで — “until (something happens)”', gist: 'Keep doing A until B happens.', bunpro: 'v-まで',
      about: [
        'A dictionary-form verb + まで says how long something goes on: until that thing happens. 雨がやむまで待ちましょう (let’s wait until the rain stops). 分かるまで聞いてください (keep asking until you understand).',
        'The action before it keeps going the whole time — 待つ, いる, 勉強する.',
      ],
      keep: [
        'The verb before まで is in the dictionary form, even when talking about the past: 暗くなるまで遊んだ.',
        'Deadline for a one-off action: までに (雨がやむまでに帰りたい — I want to be home before the rain stops).',
      ],
    },
    shishi: {
      name: 'し', use: '〜し、〜し — listing reasons', gist: 'A, and B (and that’s why…).', bunpro: 'し-し',
      about: [
        'し after a plain or polite sentence lists reasons or points, all of the same weight: この店は安いし、おいしいし、いつも混んでいます (this place is cheap, and it’s good, so it’s always busy).',
        'Often only one し is said and the other reasons are implied: 雨だし、出かけたくない (it’s raining (among other things), so I don’t want to go out).',
        'After a noun or な-adjective, add だ: 雨だし, 静かだし.',
      ],
      keep: [
        'し follows a whole sentence (安いし, 行くし, 雨だし) — unlike や, which joins nouns.',
        'The last reason can end with から instead: 安いし、おいしいから.',
      ],
    },
    toka: {
      name: 'とか', use: '〜とか〜とか — examples (casual)', gist: 'Things like A, B …', bunpro: 'とか-とか',
      about: [
        'とか lists examples, like や, but can follow verbs and whole phrases too, and is more casual: 映画を見るとか、本を読むとかしています (I do things like watch films and read books).',
        'With nouns it works like や: すしとかラーメンとかが好きです.',
      ],
      keep: [
        'とか can follow verbs; や can’t. For actions in polite / written style, use 〜たり〜たりする.',
        'The last とか is often followed by する / が / を / particles: 〜とかしています.',
      ],
    },
    dakedenaku: {
      name: 'だけでなく', use: '“Not only … but also”', gist: 'A だけでなく B も — not just A, B too.', bunpro: 'だけでなく',
      about: [
        'A だけでなく B も: not only A but B as well. 彼女は英語だけでなく、中国語も話せます (she speaks not only English but Chinese too).',
        'It is だけ (only) + でなく (not being). In speech you’ll also hear だけじゃなく(て).',
      ],
      keep: [
        'The second part usually has も: 〜だけでなく、〜も.',
        'Don’t confuse with しか (only — with a negative verb).',
      ],
    },
    'ni-freq': {
      name: 'に', use: 'Frequency — “per”', gist: 'How many times within a period: 一週間に三回.', bunpro: 'に-frequency',
      about: [
        'Period + に + number of times: how often something happens. 一週間に三回 (three times a week), 一日に二回 (twice a day), 一年に一度 (once a year).',
        'に marks the period as the frame the count happens in.',
      ],
      keep: [
        'The pattern is fixed: [period] に [count] — 一日に三回, 月に一回.',
        'を and が don’t fit here; the period isn’t an object or a subject.',
      ],
    },
    'ga-but': {
      name: 'が', use: '“But”; softening an opening', gist: 'Sentence が, sentence — but; or a polite lead-in.', bunpro: 'が-but',
      about: [
        'が after a sentence joins it to a contrasting one: 日本語は難しいですが、面白いです (Japanese is hard, but interesting). It’s more formal than けど.',
        'It also softens an opening, without real contrast: すみませんが、窓を開けてもいいですか (excuse me, but may I open the window?). 田中ですが、… (this is Tanaka…).',
      ],
      keep: [
        'This が follows a full sentence (〜です / 〜ます / plain form), not a noun — that’s the subject が.',
        'Reason → から / ので; contrast → が / けど.',
      ],
    },
    'no-subject': {
      name: 'の', use: 'Subject inside a describing clause (が → の)', gist: '母の作ったケーキ — the cake my mother made.', bunpro: 'の-subject',
      about: [
        'In a clause that describes a noun, the subject can be marked with の instead of が: 母が作ったケーキ = 母の作ったケーキ (the cake my mother made). 背の高い人 (a tall person — “a person whose height is high”).',
        'This only works inside such a clause, right before the noun it describes.',
      ],
      keep: [
        'Only in a clause before a noun: 母の作ったケーキ is fine, 母の作りました is not.',
        'は is never used inside such a clause: 母は作ったケーキ is wrong.',
      ],
    },
    // ─── N3 ───
    'ni-tsuite': {
      name: 'について', use: '“About, concerning”', gist: 'The subject matter of talking, writing, thinking.', bunpro: 'について',
      about: [
        'Noun + について: about, on the subject of. 日本の歴史についてレポートを書きました (I wrote a report on Japanese history). この問題について話し合いましょう.',
        'It goes with verbs of speaking, thinking, writing, studying, asking, knowing.',
        'Before a noun: についての — 日本についての本 (a book about Japan).',
      ],
      keep: [
        'について = the topic you talk / write about. に対して = the target an attitude or action is directed at. にとって = from someone’s point of view.',
      ],
    },
    'ni-totte': {
      name: 'にとって', use: '“For (someone), from their point of view”', gist: 'Judged from X’s standpoint.', bunpro: 'に取って',
      about: [
        'Person + にとって + a judgement: from that person’s point of view. 私にとって、家族は一番大切です (to me, family is the most important thing). この仕事は初心者にとって難しい.',
        'What follows is an evaluation: 大切, 難しい, うれしい, 便利, 問題だ.',
      ],
      keep: [
        'にとって is followed by a judgement (adjective), not an action. For an action toward someone, use に対して.',
        '“For” as in “a present for you” is not にとって: あなたへのプレゼント / あなたのためのプレゼント.',
      ],
    },
    toshite: {
      name: 'として', use: '“As” (a role, position or purpose)', gist: 'In the capacity of X.', bunpro: 'として',
      about: [
        'Noun + として: in the role or capacity of. 彼は留学生として日本に来ました (he came to Japan as an exchange student). 趣味として絵を描いています (I paint as a hobby).',
        'It names what something counts as: 先生として, 親として, 記念として (as a souvenir).',
      ],
      keep: [
        'として = in the role of. にとって = from the point of view of. 親として言う (I say this as a parent) vs 親にとって大切だ (it matters to parents).',
      ],
    },
    'ni-yotte': {
      name: 'によって', use: '“Depending on”; “by” (in passives); “because of”', gist: 'Varies with X / done by X.', bunpro: 'によって-による',
      about: [
        '“Depending on”: 考え方は人によって違います (ways of thinking differ from person to person). 国によって (depending on the country).',
        'The doer in a passive sentence, especially for creating, discovering or inventing: この小説は有名な作家によって書かれました.',
        'Cause or means, in formal writing: 台風によって電車が止まった (the trains stopped because of the typhoon).',
      ],
      keep: [
        'によって 違う / 変わる / 異なる = depends on. Very common pattern.',
        'Passive with 書かれる / 建てられる / 発見される / 作られる: by X = Xによって (not Xに, which is for everyday passives).',
        'によると (according to) is a different pattern: 天気予報によると.',
      ],
    },
    'ni-taishite': {
      name: 'に対して', use: '“Toward, to”; “in contrast to”', gist: 'Directed at X — or set against X.', bunpro: 'に対して',
      about: [
        'Toward a person or thing an action or attitude is aimed at: 先生は学生の質問に対して、ていねいに答えました (the teacher answered the student’s question carefully). 親に対して失礼だ.',
        'In contrast to: 兄が静かなのに対して、弟はよく話す (whereas the older brother is quiet, the younger one talks a lot).',
        'Before a noun: に対する — 質問に対する答え.',
      ],
      keep: [
        'に対して = aimed at / opposed to. について = about (topic). にとって = from the viewpoint of.',
        'Contrast use: [sentence]のに対して — with の to make the sentence a noun.',
      ],
    },
    sae: {
      name: 'さえ / でさえ', use: '“Even” (an extreme example)', gist: 'Even X — so of course the rest too.', bunpro: 'さえ',
      about: [
        'さえ picks out an extreme case to show how far something goes: 忙しくて、水を飲む時間さえなかった (I was so busy I didn’t even have time to drink water). If not even that, certainly nothing more.',
        'After a person (the doer), でさえ is common: 先生でさえ解けなかった (even the teacher couldn’t solve it).',
        'さえ〜ば means “if only, as long as”: 時間さえあれば (if only I had time).',
      ],
      keep: [
        'さえ is stronger and more written than も / でも for “even”.',
        'It replaces が / を; other particles stay before it: 子どもにさえ分かる.',
      ],
    },
    koso: {
      name: 'こそ', use: '“Precisely, it’s X that…”; “this time for sure”', gist: 'Strongly singles out X.', bunpro: 'こそ',
      about: [
        'こそ puts strong emphasis on a word: this one, and no other. 今年こそ合格したい (this year, I really want to pass — after failing before).',
        'The set reply こちらこそ: when someone thanks you or says よろしくお願いします, こちらこそ means “no — it’s me who should say that / likewise”.',
        'からこそ: precisely because.',
      ],
      keep: [
        'こちらこそ is the fixed reply to よろしく / ありがとう / すみません.',
        'こそ is emphasis, not “even” (さえ) or “only” (だけ / しか / ばかり).',
      ],
    },
    bakari: {
      name: 'ばかり', use: '“Nothing but, always”', gist: 'Doing only X — usually a complaint.', bunpro: 'ばかり',
      about: [
        'Noun + ばかり + verb: only that, over and over: 弟はゲームばかりしている (my brother does nothing but play games). 文句ばかり言う.',
        'て-form + ばかりいる: 寝てばかりいる (does nothing but sleep).',
        'It often carries criticism: too much of one thing.',
      ],
      keep: [
        'ばかり = all the time, too much (often negative feeling). だけ = only (neutral). しか〜ない = only (not enough).',
        '〜たばかり (just did) is a different pattern: 食べたばかり.',
      ],
    },
    'ni-kurabete': {
      name: 'に比べて', use: '“Compared with”', gist: 'Setting X beside Y.', bunpro: 'に比べて',
      about: [
        'Noun + に比べて (くらべて): compared with. 去年に比べて、今年は雪が多い (compared with last year, there’s a lot of snow this year).',
        'It is close to より, but puts the comparison up front and stresses the contrast.',
      ],
      keep: [
        'Xに比べて、Y は… = Xより、Yのほうが… in meaning.',
        'Also written に比べると / に比べ.',
      ],
    },
  };

  const Q = (b, a, c, p, en, x) => ({ b, a, c, p, en, x });

  global.PARTICLE_QUESTIONS = {
    POINTS,
    N5: [
      Q('わたし', '{田中|たなか}です。', ['は', 'を', 'へ', 'で'], 'wa', 'I am Tanaka.',
        ['わたし is the topic: “as for me, (I) am Tanaka”.', 'を marks an object, and です has none.', 'へ is a direction of movement.', 'で marks a place of action or a means — nothing is done here.']),
      Q('これ', 'なんですか。', ['は', 'を', 'に', 'で'], 'wa', 'What is this?',
        ['これ is the topic you’re asking about: “as for this, what is it?”.', 'を needs an action verb; です is not one.', 'に would make これ a place or a target.', 'で would make これ a tool or a place.']),
      Q('{肉|にく}は{食|た}べますが、{魚|さかな}', '{食|た}べません。', ['は', 'が', 'に', 'で'], 'wa', 'I eat meat, but I don’t eat fish.',
        ['は contrasts: meat I eat — fish I don’t. Two は set the two against each other.', 'が would make the fish the one doing the eating.', 'に would make the fish a target or place.', 'で would make the fish a tool — “eat with fish”.']),
      Q('だれ', '{来|き}ましたか。', ['が', 'は', 'を', 'で'], 'ga', 'Who came?',
        ['A question word that is the subject takes が: だれが来ましたか.', 'A question word never takes は — it’s new information, and は is for what’s already known.', 'を marks an object; 来る has none.', 'で marks a place or means, not who came.']),
      Q('{冷蔵庫|れいぞうこ}に{何|なに}', 'ありますか。', ['が', 'は', 'を', 'で'], 'ga', 'What is in the fridge?',
        ['With ある, the thing that is there takes が — and question words take が.', 'A question word can’t take は.', 'ある has no object, so を is wrong.', 'で would make 何 a place or means.']),
      Q('わたしは{猫|ねこ}', '{好|す}きです。', ['が', 'で', 'へ', 'に'], 'ga', 'I like cats.',
        ['好き takes が for what you like: 猫が好きです.', 'で would mean “by means of cats”.', 'へ is the direction of movement.', 'に would make the cat a target or place.']),
      Q('{公園|こうえん}に{子|こ}どもたち', 'います。', ['が', 'を', 'で', 'へ'], 'ga', 'There are children in the park.',
        ['With いる, who is there takes が. (The place, 公園, already has に.)', 'いる has no object.', 'で marks a place of action — and the children aren’t a place.', 'へ is a direction of movement.']),
      Q('{毎朝|まいあさ}パン', '{食|た}べます。', ['を', 'が', 'に', 'で'], 'wo', 'I eat bread every morning.',
        ['The bread is what’s eaten — the object, を.', 'パンが食べます would make the bread the one eating.', 'に marks a time, place or target, not what you eat.', 'パンで食べます is “eat by means of bread” — and then nothing is eaten.']),
      Q('{七時|しちじ}に{家|いえ}', '{出|で}ます。', ['を', 'で', 'へ', 'が'], 'wo', 'I leave home at seven.',
        ['With 出る (leave), the place you leave takes を: 家を出ます.', 'で would be where an action happens, not the place you leave.', 'へ is the direction you go to — you don’t go to home here.', 'が would make the house the one leaving.']),
      Q('{毎朝|まいあさ}、{公園|こうえん}', '{散歩|さんぽ}します。', ['を', 'に', 'が', 'と'], 'wo', 'I take a walk in the park every morning.',
        ['With verbs of moving, を marks the place you move through: 公園を散歩します. (公園で is also fine — but it isn’t a choice.)', 'に is a destination or where something is: you’d need 散歩に行く.', 'が would make the park the one walking.', 'と would mean walking together with the park.']),
      Q('{日曜日|にちようび}', '{京都|きょうと}へ{行|い}きます。', ['に', 'で', 'を', 'が'], 'ni-time', 'I’m going to Kyoto on Sunday.',
        ['Days of the week take に for “on”: 日曜日に.', 'で is never used for a point in time.', 'を marks an object or a place you move through, not a time.', 'が would make Sunday the one going.']),
      Q('{机|つくえ}の{上|うえ}', '{猫|ねこ}がいます。', ['に', 'で', 'を', 'へ'], 'ni-place', 'There is a cat on the desk.',
        ['With いる / ある, where something is takes に.', 'で marks where an action is done; いる is just being there.', 'を marks an object or a path.', 'へ is a direction of movement.']),
      Q('{八時|はちじ}に{学校|がっこう}', '{着|つ}きました。', ['に', 'で', 'を', 'と'], 'ni-dest', 'I arrived at school at eight.',
        ['着く (arrive) takes に for where you arrive.', 'で would be where an action takes place — arriving happens at the end point, に.', 'を is for a place you leave or pass through.', 'と would mean arriving together with the school.']),
      Q('わたしは{母|はは}', '{花|はな}をあげました。', ['に', 'を', 'で', 'や'], 'ni-target', 'I gave my mother flowers.',
        ['The person you give to takes に.', 'The flowers already have を; your mother isn’t what you gave.', 'で would make your mother a place or a tool.', 'や lists nouns — “mother and flowers” as what you gave.']),
      Q('{駅|えき}でバス', '{乗|の}りました。', ['に', 'を', 'で', 'が'], 'ni-target', 'I got on the bus at the station.',
        ['乗る takes に for what you get on: バスに乗ります.', 'バスを乗りました is a common mistake — 乗る doesn’t take を.', 'The station already has で; バスで would mean going by bus, and 乗る needs to know what you got on.', 'が would make the bus the one getting on.']),
      Q('{駅|えき}で{先生|せんせい}', '{会|あ}いました。', ['に', 'を', 'で', 'へ'], 'ni-target', 'I met my teacher at the station.',
        ['会う takes に for the person you meet (と is also possible, but it’s not a choice).', '先生を会いました is a common mistake — 会う doesn’t take を.', 'で would make the teacher a place or a tool.', 'へ is a direction of movement.']),
      Q('{来年|らいねん}、{日本|にほん}', '{行|い}きます。', ['へ', 'を', 'で', 'と'], 'he', 'I’m going to Japan next year.',
        ['へ marks the direction of movement: 日本へ行きます. (に is also fine — but it’s not a choice.)', '日本を行きます is wrong; を with movement is for a place you pass through.', 'で would be the place where you do the going.', 'と would mean going together with Japan.']),
      Q('{図書館|としょかん}', '{本|ほん}を{読|よ}みます。', ['で', 'に', 'を', 'へ'], 'de-place', 'I read books at the library.',
        ['Reading is an action done in the library: で.', 'に is for where something IS (いる / ある) or where you go, not where you do something.', 'The book already has を.', 'へ is a direction of movement.']),
      Q('{毎日|まいにち}{会社|かいしゃ}', '{働|はたら}いています。', ['で', 'に', 'を', 'へ'], 'de-place', 'I work at a company every day.',
        ['働く is an action, so the place takes で.', '会社に働いています is a common mistake: に goes with 勤める, or with いる / ある.', 'を would make the company what you work on.', 'へ is a direction of movement.']),
      Q('バス', '{学校|がっこう}へ{行|い}きます。', ['で', 'に', 'を', 'と'], 'de-means', 'I go to school by bus.',
        ['Means of transport takes で: バスで行きます.', 'に goes with 乗る (バスに乗る), not with 行く.', 'を with 行く is a place you pass through, not the bus.', 'と would mean going together with the bus, like a friend.']),
      Q('わたしはあした{友|とも}だち', '{映画|えいが}を{見|み}ます。', ['と', 'を', 'に', 'へ'], 'to-with', 'I’m going to see a film with a friend tomorrow.',
        ['と marks the person you do something with.', 'The film already has を; your friend isn’t what you watch.', 'に would make your friend a target — like giving to them.', 'へ is a direction of movement.']),
      Q('りんご', 'みかんを{買|か}いました。', ['と', 'を', 'に', 'が'], 'to-and', 'I bought apples and mandarins.',
        ['と joins two nouns: apples and mandarins (and nothing else).', 'Only one を, at the end of the list: りんごとみかんを.', 'に would make the apples a place or target.', 'が would make the apples the buyer.']),
      Q('{父|ちち}', '{母|はは}は{医者|いしゃ}です。', ['と', 'も', 'を', 'に'], 'to-and', 'My father and mother are doctors.',
        ['と joins 父 and 母 into one topic.', '父も母は… mixes two topic markers; it would have to be 父も母も.', 'を marks an object; です has none.', 'に would make father a place or target.']),
      Q('{机|つくえ}の{上|うえ}に{本|ほん}', 'ペンなどがあります。', ['や', 'を', 'で', 'へ'], 'ya', 'There are books, pens and so on on the desk.',
        ['や lists examples, and など at the end says “and so on”.', 'を marks an object; ある has none.', 'で would make the book a place or tool.', 'へ is a direction of movement.']),
      Q('これは{私|わたし}', 'かさです。', ['の', 'が', 'を', 'に'], 'no', 'This is my umbrella.',
        ['の joins 私 to かさ: my umbrella.', 'これは私がかさです isn’t a sentence — two subjects for one です.', 'を marks an object; です has none.', 'に would make 私 a place or target.']),
      Q('{日本語|にほんご}', '{本|ほん}を{買|か}いました。', ['の', 'を', 'が', 'へ'], 'no', 'I bought a Japanese(-language) book.',
        ['の joins two nouns: a book of Japanese.', 'There can only be one を with 買う, and it belongs to 本.', 'が would make 日本語 the buyer.', 'へ is a direction of movement.']),
      Q('{田中|たなか}さんは{先生|せんせい}です。{山田|やまだ}さん', '{先生|せんせい}です。', ['も', 'を', 'に', 'で'], 'mo', 'Tanaka-san is a teacher. Yamada-san is a teacher too.',
        ['も: the same is true of Yamada-san — “too”.', 'を marks an object; です has none.', 'に would make Yamada-san a place or target.', 'で would make Yamada-san a place or tool.']),
      Q('{昨日|きのう}は{何|なに}', '{食|た}べませんでした。', ['も', 'が', 'を', 'で'], 'mo', 'I didn’t eat anything yesterday.',
        ['何も + negative = nothing: “I didn’t eat anything”.', '何が would make “what” the eater — and a question would need か.', '何を食べませんでした is “what didn’t you eat” — a question with no か.', 'で would be “by means of what”.']),
      Q('{会議|かいぎ}は{九時|くじ}', '{始|はじ}まります。', ['から', 'まで', 'を', 'や'], 'kara-from', 'The meeting starts at nine.',
        ['から marks the starting point in time: from nine.', 'まで is the end point — 始まる has a start, not an end.', 'を marks an object; 始まる has none.', 'や lists nouns.']),
      Q('これは{友|とも}だち', 'もらった{本|ほん}です。', ['から', 'まで', 'で', 'を'], 'kara-from', 'This is a book I got from a friend.',
        ['から marks who it came from. (に is also fine with もらう — but it’s not a choice.)', 'まで is an end point.', 'で would make the friend a place or a tool.', 'を would make the friend what you received.']),
      Q('{家|いえ}から{駅|えき}', '{歩|ある}いて{十分|じゅっぷん}です。', ['まで', 'より', 'や', 'が'], 'made', 'It’s a ten-minute walk from my house to the station.',
        ['から … まで: from … to. まで marks the end point.', 'より is “than” — nothing is compared.', 'や lists nouns.', 'が would make the station the one walking.']),
      Q('{雨|あめ}が{降|ふ}っています', '、{傘|かさ}を{持|も}って{行|い}きます。', ['から', 'まで', 'を', 'や'], 'kara-because', 'It’s raining, so I’ll take an umbrella.',
        ['から after a sentence gives the reason: because it’s raining.', 'まで after a sentence would be “until” — and needs the dictionary form (降るまで).', 'を doesn’t follow a sentence.', 'や joins nouns only.']),
      Q('{頭|あたま}が{痛|いた}い', '、{今日|きょう}は{休|やす}みます。', ['ので', 'まで', 'より', 'や'], 'node', 'My head hurts, so I’m taking today off.',
        ['ので gives the reason, softly — a good way to give an excuse.', 'まで after 痛い would be “until it hurts”.', 'より is “than” — nothing is compared.', 'や joins nouns only.']),
      Q('すみません、トイレはどこです', '。', ['か', 'を', 'と', 'に'], 'ka', 'Excuse me, where is the toilet?',
        ['か makes it a question. A question word (どこ) still needs か at the end.', 'を doesn’t end a sentence.', 'と doesn’t end a sentence.', 'に doesn’t end a sentence.']),
      Q('A「{今日|きょう}は{暑|あつ}いです', '。」B「ええ、{本当|ほんとう}に{暑|あつ}いですね。」', ['ね', 'を', 'に', 'で'], 'ne', 'A: “It’s hot today, isn’t it?” B: “Yes, it really is.”',
        ['ね invites agreement about something you both feel — and B agrees.', 'を doesn’t end a sentence.', 'に doesn’t end a sentence.', 'で doesn’t end a sentence.']),
      Q('A「この{店|みせ}のケーキ、おいしいですか。」B「ええ、とてもおいしいです', '。」', ['よ', 'か', 'を', 'に'], 'yo', 'A: “Is the cake here good?” B: “Yes, it’s very good!”',
        ['よ tells A something they don’t know yet — B has tried it.', 'か would turn B’s answer into another question.', 'を doesn’t end a sentence.', 'に doesn’t end a sentence.']),
      Q('{冷蔵庫|れいぞうこ}には{卵|たまご}が{一|ひと}つ', 'あります。', ['だけ', 'しか', 'も', 'を'], 'dake', 'There’s just one egg in the fridge.',
        ['だけ: only one — with a positive verb.', 'しか needs a negative verb: 一つしかありません.', '一つも goes with a negative: 一つもありません (not a single one).', 'The egg already has が, and ある has no object.']),
      Q('バス', '{電車|でんしゃ}のほうが{速|はや}いです。', ['より', 'から', 'まで', 'ほど'], 'yori-hou', 'The train is faster than the bus.',
        ['A より B のほうが: B is more … than A.', 'から would be “from the bus”.', 'まで would be “as far as the bus”.', 'ほど compares only with a negative: 電車ほど速くない.']),
      Q('{駅|えき}まで{十分|じゅっぷん}', 'かかります。', ['ぐらい', 'まで', 'や', 'を'], 'kurai', 'It takes about ten minutes to the station.',
        ['ぐらい after an amount of time: about ten minutes.', 'The sentence already has まで (to the station); 十分まで would be “up to ten minutes”, which かかる doesn’t take.', 'や lists nouns.', 'を marks an object.']),
    ],
    N4: [
      Q('{財布|さいふ}に{百円|ひゃくえん}', 'ありません。', ['しか', 'だけ', 'まで', 'より'], 'shika', 'I only have 100 yen in my wallet.',
        ['しか + negative: nothing but 100 yen — and that’s not much.', 'だけ with a negative means “only that is missing”: 百円だけありません, not what’s meant.', 'まで would be “up to 100 yen”.', 'より would be “than 100 yen” with nothing compared.']),
      Q('{昨日|きのう}は{三時間|さんじかん}', '{寝|ね}ませんでした。', ['しか', 'だけ', 'から', 'を'], 'shika', 'I only slept three hours last night.',
        ['しか + negative: only three hours.', 'だけ + a negative verb would mean “the only thing I didn’t do was sleep three hours”.', 'から would be “since three hours”.', '寝る has no object.']),
      Q('{今年|ことし}の{夏|なつ}は{去年|きょねん}', '{暑|あつ}いです。', ['より', 'ほど', 'から', 'まで'], 'yori', 'This summer is hotter than last year.',
        ['より: hotter than last year.', 'ほど compares only with a negative: 去年ほど暑くない.', 'から would be “since last year”; 暑いです isn’t something that starts.', 'まで would be “until last year”.']),
      Q('{思|おも}った', '{簡単|かんたん}でした。', ['より', 'ほど', 'しか', 'だけ'], 'yori', 'It was easier than I thought.',
        ['思ったより: than I expected.', '思ったほど needs a negative: 思ったほど難しくなかった.', 'しか needs a negative.', '思っただけ is “I only thought (it)”, which doesn’t fit.']),
      Q('{今年|ことし}の{冬|ふゆ}は{去年|きょねん}', '{寒|さむ}くないです。', ['ほど', 'しか', 'まで', 'を'], 'hodo', 'This winter isn’t as cold as last year.',
        ['X ほど〜ない: not as … as X.', '去年しか寒くない would be “only last year is cold” — and it doesn’t fit the topic.', 'まで would be “until last year”.', '寒い has no object.']),
      Q('このテストは{思|おも}った', '{難|むずか}しくなかったです。', ['ほど', 'しか', 'だけ', 'まで'], 'hodo', 'This test wasn’t as hard as I thought.',
        ['思ったほど〜ない: not as … as I thought.', 'しか needs a noun or amount before it, not 思った.', '思っただけ: “I only thought” — doesn’t fit.', 'まで would be “until I thought”.']),
      Q('{喉|のど}が{渇|かわ}きましたね。お{茶|ちゃ}', '{飲|の}みませんか。', ['でも', 'ほど', 'まで', 'より'], 'demo', 'I’m thirsty. Shall we have some tea or something?',
        ['でも softens the suggestion: tea or something.', 'ほど is extent or comparison.', 'まで would be “as far as tea”.', 'より would compare with tea, but nothing is compared.']),
      Q('この{漢字|かんじ}は{子|こ}ども', '{読|よ}めます。', ['でも', 'しか', 'ほど', 'を'], 'demo', 'Even a child can read this kanji.',
        ['でも: even a child.', 'しか needs a negative: 子どもしか読めません.', 'ほど needs a negative to compare.', 'The child isn’t what is read.']),
      Q('この{問題|もんだい}は{誰|だれ}', 'わかります。', ['でも', 'を', 'に', 'ほど'], 'demo', 'Anyone can understand this problem.',
        ['Question word + でも: anyone.', 'を: わかる doesn’t take を.', 'に would make 誰 the target.', 'ほど after a question word isn’t used.']),
      Q('レポートは{金曜日|きんようび}', '{出|だ}してください。', ['までに', 'まで', 'から', 'ほど'], 'madeni', 'Please hand in the report by Friday.',
        ['Handing in happens once — the deadline is までに.', 'まで is for an action that goes on until then: “keep handing it in until Friday”.', 'から would be “from Friday on”.', 'ほど is extent or comparison.']),
      Q('{夏休|なつやす}みは{八月|はちがつ}{三十一日|さんじゅういちにち}', 'です。', ['まで', 'までに', 'より', 'ほど'], 'made', 'Summer holidays go on until August 31.',
        ['まで: the holidays continue up to that day.', 'までに is a deadline for a one-off action; a holiday isn’t done once.', 'より would compare.', 'ほど is extent or comparison.']),
      Q('{雨|あめ}がやむ', '、ここで{待|ま}ちましょう。', ['まで', 'までに', 'より', 'ほど'], 'made-verb', 'Let’s wait here until the rain stops.',
        ['待つ goes on the whole time: wait until it stops — まで.', 'までに is a deadline for a one-off action; waiting isn’t.', 'より would compare with the rain stopping.', 'ほど is extent.']),
      Q('この{店|みせ}は{安|やす}いし、おいしい', '、いつも{混|こ}んでいます。', ['し', 'や', 'ほど', 'を'], 'shishi', 'This place is cheap and good, so it’s always busy.',
        ['し lists reasons after a sentence: cheap, (and) good — so busy.', 'や joins nouns only, not adjectives.', 'ほど after おいしい would be “so tasty that…”, and the comma and いつも don’t follow from it.', 'を doesn’t follow an adjective.']),
      Q('{今日|きょう}は{雨|あめ}だ', '、{寒|さむ}いし、{出|で}かけたくないです。', ['し', 'や', 'を', 'も'], 'shishi', 'It’s raining, and it’s cold, so I don’t want to go out.',
        ['し lists reasons; a noun takes だ before し: 雨だし.', 'や joins nouns, not sentences (雨だ is a sentence).', 'を doesn’t follow だ.', 'も doesn’t follow だ.']),
      Q('{週末|しゅうまつ}は{映画|えいが}を{見|み}るとか、{本|ほん}を{読|よ}む', 'しています。', ['とか', 'や', 'と', 'も'], 'toka', 'At weekends I do things like watch films and read books.',
        ['とか lists example actions — and the first one already has とか.', 'や can’t follow a verb.', 'と after a verb would be “if / when”, and doesn’t lead into します.', 'も after a verb doesn’t fit here.']),
      Q('{日本|にほん}の{食|た}べ{物|もの}では、すしとかラーメン', 'が{好|す}きです。', ['とか', 'や', 'と', 'も'], 'toka', 'Of Japanese foods, I like things like sushi and ramen.',
        ['とか … とか: the first とか is there, so the second matches it.', 'やが isn’t possible — や doesn’t end a list.', 'とが isn’t possible either.', 'もが isn’t possible.']),
      Q('{彼女|かのじょ}は{英語|えいご}', '、{中国語|ちゅうごくご}も{話|はな}せます。', ['だけでなく', 'しか', 'ほど', 'までに'], 'dakedenaku', 'She can speak not only English but also Chinese.',
        ['だけでなく … も: not only … but also.', 'しか needs a negative.', 'ほど is extent or comparison.', 'までに is a deadline.']),
      Q('{一週間|いっしゅうかん}', '{三回|さんかい}ジムに{行|い}きます。', ['に', 'を', 'が', 'と'], 'ni-freq', 'I go to the gym three times a week.',
        ['[period] に [count]: three times per week.', 'を would make the week an object.', 'が would make the week the one going.', 'と would mean “with a week”.']),
      Q('{一日|いちにち}', '{二回|にかい}、この{薬|くすり}を{飲|の}んでください。', ['に', 'を', 'が', 'や'], 'ni-freq', 'Please take this medicine twice a day.',
        ['[period] に [count]: twice a day.', 'The medicine already has を.', 'が would make the day the one taking it.', 'や lists nouns.']),
      Q('{日本語|にほんご}は{難|むずか}しいです', '、{面白|おもしろ}いです。', ['が', 'から', 'ので', 'ほど'], 'ga-but', 'Japanese is difficult, but interesting.',
        ['が after a sentence: but.', 'から would be “because it’s difficult, it’s interesting”.', 'ので is “because” too.', 'ほど doesn’t follow です.']),
      Q('すみません', '、{窓|まど}を{開|あ}けてもいいですか。', ['が', 'から', 'ので', 'し'], 'ga-but', 'Excuse me, but may I open the window?',
        ['が softens an opening: すみませんが…', 'から would make “excuse me” the reason for opening the window.', 'ので, the same.', 'し lists reasons.']),
      Q('これは{母|はは}', '{作|つく}ったケーキです。', ['の', 'を', 'で', 'へ'], 'no-subject', 'This is a cake my mother made.',
        ['In a clause before a noun, the subject can take の: 母の作ったケーキ. (が is also fine — but it’s not a choice.)', 'を would make your mother what was made.', 'で would make her the place or tool.', 'へ is a direction.']),
    ],
    N3: [
      Q('{日本|にほん}の{歴史|れきし}', 'レポートを{書|か}きました。', ['について', 'にとって', 'として', 'によって'], 'ni-tsuite', 'I wrote a report on Japanese history.',
        ['について: about — the subject of the report.', 'にとって is a point of view, followed by a judgement.', 'として is a role: “as Japanese history”.', 'によって would be “depending on / by means of history”.']),
      Q('この{問題|もんだい}', '、みんなで{話|はな}し{合|あ}いましょう。', ['について', 'にとって', 'として', 'に比べて'], 'ni-tsuite', 'Let’s all talk this problem over.',
        ['について: the topic of the discussion.', 'にとって needs a person, and a judgement after it.', 'として: “as this problem” — a role, which doesn’t fit.', 'に比べて would compare, but nothing is compared.']),
      Q('{私|わたし}', '、{家族|かぞく}は{一番|いちばん}{大切|たいせつ}です。', ['にとって', 'について', 'によって', 'に対して'], 'ni-totte', 'To me, family is the most important thing.',
        ['にとって: from my point of view + a judgement (大切).', 'について would be “about me”.', 'によって would be “depending on me”.', 'に対して is an action or attitude aimed at someone.']),
      Q('この{仕事|しごと}は{初心者|しょしんしゃ}', '{少|すこ}し{難|むずか}しい。', ['にとって', 'について', 'として', 'ばかり'], 'ni-totte', 'This job is a little difficult for beginners.',
        ['にとって: for beginners, judged from their side.', 'について would be “about beginners”.', 'として would make the job a beginner.', 'ばかり would be “nothing but beginners”.']),
      Q('{彼|かれ}は{留学生|りゅうがくせい}', '{日本|にほん}に{来|き}ました。', ['として', 'にとって', 'について', 'によって'], 'toshite', 'He came to Japan as an exchange student.',
        ['として: in the role of an exchange student.', 'にとって needs a judgement after it.', 'について would be “about exchange students”.', 'によって would be “by means of / depending on exchange students”.']),
      Q('{趣味|しゅみ}', '、{絵|え}を{描|か}いています。', ['として', 'にとって', 'について', 'に対して'], 'toshite', 'I paint pictures as a hobby.',
        ['として: as a hobby — what the painting counts as.', 'にとって would be “from the hobby’s point of view”.', 'について would be “about my hobby”.', 'に対して would aim the painting at the hobby.']),
      Q('{考|かんが}え{方|かた}は{人|ひと}', '{違|ちが}います。', ['によって', 'にとって', 'について', 'として'], 'ni-yotte', 'Ways of thinking differ from person to person.',
        ['によって違う: differs depending on the person.', 'にとって would be “to a person, ways of thinking are different”, which says something else.', 'について would be “about people”.', 'として would be “as a person”.']),
      Q('この{小説|しょうせつ}は{有名|ゆうめい}な{作家|さっか}', '{書|か}かれました。', ['によって', 'にとって', 'について', 'に対して'], 'ni-yotte', 'This novel was written by a famous author.',
        ['In a passive about creating something, the doer takes によって.', 'にとって is a point of view.', 'について would be “about a famous author”.', 'に対して would aim the writing at the author.']),
      Q('{兄|あに}が{静|しず}かなの', '、{弟|おとうと}はよく{話|はな}す。', ['に対して', 'にとって', 'について', 'として'], 'ni-taishite', 'Whereas my older brother is quiet, my younger brother talks a lot.',
        ['のに対して: in contrast to.', 'にとって is a point of view.', 'について: about his being quiet — doesn’t lead to a contrast.', 'として: as his being quiet — not a role.']),
      Q('{先生|せんせい}は{学生|がくせい}の{質問|しつもん}', '、ていねいに{答|こた}えました。', ['に対して', 'にとって', 'として', 'までに'], 'ni-taishite', 'The teacher answered the student’s question carefully.',
        ['に対して: the answer is aimed at the question.', 'にとって needs a person and a judgement.', 'として would make the teacher the question.', 'までに is a deadline.']),
      Q('{去年|きょねん}', '、{今年|ことし}は{雪|ゆき}が{多|おお}い。', ['に比べて', 'にとって', 'として', 'について'], 'ni-kurabete', 'Compared with last year, there’s a lot of snow this year.',
        ['に比べて: compared with last year.', 'にとって would be last year’s point of view.', 'として: as last year — a role.', 'について: about last year.']),
      Q('{忙|いそが}しくて、{水|みず}を{飲|の}む{時間|じかん}', 'なかった。', ['さえ', 'ばかり', 'ほど', 'について'], 'sae', 'I was so busy I didn’t even have time to drink water.',
        ['さえ: not even that much — so certainly nothing more.', 'ばかり: “nothing but time” — the opposite.', 'ほど needs something to compare with.', 'について: about time.']),
      Q('この{問題|もんだい}は{先生|せんせい}', '{解|と}けなかった。', ['でさえ', 'ばかり', 'について', 'までに'], 'sae', 'Even the teacher couldn’t solve this problem.',
        ['でさえ: even the teacher — so the rest of us had no chance.', 'ばかり: “nothing but the teacher”.', 'について: about the teacher.', 'までに is a deadline.']),
      Q('A「よろしくお{願|ねが}いします。」B「こちら', '、よろしくお{願|ねが}いします。」', ['こそ', 'さえ', 'ばかり', 'ほど'], 'koso', 'A: “Nice to meet you.” B: “Likewise — nice to meet you too.”',
        ['こちらこそ: the set reply — “no, it’s me who should say that”.', 'こちらさえ: “even this side” — doesn’t fit a greeting.', 'こちらばかり: “only this side”.', 'こちらほど: “to this extent”.']),
      Q('{今年|ことし}', '{日本語能力試験|にほんごのうりょくしけん}に{合格|ごうかく}したい。', ['こそ', 'さえ', 'ばかり', 'について'], 'koso', 'This year, I really want to pass the JLPT.',
        ['こそ: this year for sure (after not passing before).', 'さえ: “even this year” — doesn’t fit a wish.', 'ばかり: “nothing but this year”.', 'について: about this year.']),
      Q('{弟|おとうと}は{勉強|べんきょう}しないで、ゲーム', 'している。', ['ばかり', 'こそ', 'ほど', 'について'], 'bakari', 'My brother doesn’t study — he does nothing but play games.',
        ['ばかり: nothing but games — a complaint.', 'こそ would praise the games: “it’s games, for sure”.', 'ほど: to the extent of games.', 'について: about games.']),
      Q('{彼|かれ}はいつも{文句|もんく}', '{言|い}っている。', ['ばかり', 'ほど', 'について', 'までに'], 'bakari', 'He’s always complaining.',
        ['ばかり: nothing but complaints.', 'ほど: to the extent of complaints.', 'について: about complaints — but then what does he say?', 'までに is a deadline.']),
      Q('{泣|な}きたい', '{痛|いた}かった。', ['ほど', 'ばかり', 'さえ', 'こそ'], 'hodo', 'It hurt so much I wanted to cry.',
        ['ほど: to the extent of wanting to cry.', 'ばかり doesn’t follow 〜たい.', 'さえ doesn’t follow 〜たい.', 'こそ doesn’t follow 〜たい here.']),
      Q('{日本語|にほんご}は{勉強|べんきょう}すればする', '{面白|おもしろ}くなる。', ['ほど', 'ばかり', 'さえ', 'まで'], 'hodo', 'The more you study Japanese, the more interesting it gets.',
        ['〜ば〜ほど: the more …, the more ….', 'ばかり doesn’t complete 〜ば〜.', 'さえ doesn’t complete 〜ば〜.', 'まで: “until you study” — and the ば would be left hanging.']),
    ],
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = global.PARTICLE_QUESTIONS;
})(typeof window !== 'undefined' ? window : globalThis);
