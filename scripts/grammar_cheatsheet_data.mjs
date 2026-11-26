// The grammar points on grammar-cheatsheet.html, written into the page by
// scripts/render_landing_pages.mjs (the browser never loads this file).
//
// Each section: { id, title, jp, practice: [[href, label]], points: [...] }
// Each point:
//   p      the pattern, as shown (Japanese)
//   lv     'N5' | 'N4' | 'N3' (common study lists; there's no official one)
//   m      what it means, a few words
//   r      how to make it: slots V-dict, V-masu (stem), V-te, V-ta, V-nai,
//          V-vol, N, い-adj, な-adj and plain are highlighted on the page
//   more   a sentence or two more (shown once opened)
//   ex     examples: [Japanese, English]; 漢字[かんじ] furigana, {…} marks
//          the grammar point
//   warn   exceptions and traps
// Text is plain (escaped on the page). Every kanji, in every field, has
// furigana as 漢字[かんじ] (the render script refuses one without).

export const SECTIONS = [
  {
    id: 'particles', title: 'Particles', jp: '助詞[じょし]',
    practice: [['particles-quiz.html', 'Particles quiz'], ['wa-vs-ga.html', 'は vs が']],
    points: [
      {
        p: 'は', lv: 'N5', m: 'topic: “as for X”', r: 'N + は',
        more: 'Sets what the sentence is about; the rest comments on it. It also contrasts one thing with another. Written は, read わ.',
        ex: [['私[わたし]{は}学生[がくせい]です。', 'I am a student.'], ['肉[にく]{は}食[た]べますが、魚[さかな]{は}食[た]べません。', 'Meat I eat, but fish I don’t.']],
        warn: ['Question words can’t be the topic: 誰[だれ]が来[き]ましたか (×誰[だれ]は).', 'Inside a clause that describes a noun, the subject takes が: 母[はは]が作[つく]った料理[りょうり].'],
      },
      {
        p: 'が', lv: 'N5', m: 'subject: who / what (new information)', r: 'N + が',
        more: 'Marks the subject when it is new information, the answer to a question, or after a question word. Also marks the thing liked, wanted, understood or owned with 好[す]き, 嫌[きら]い, 上手[じょうず], 分[わ]かる, 欲[ほ]しい, ある, いる.',
        ex: [['誰[だれ]{が}来[き]ましたか。— 田中[たなか]さん{が}来[き]ました。', 'Who came? — Tanaka came.'], ['私[わたし]は猫[ねこ]{が}好[す]きです。', 'I like cats.']],
        warn: ['After a sentence, が means “but” (see 〜が / 〜けど).', 'Can’t be stacked with も: ×がも, just も.'],
      },
      {
        p: 'を', lv: 'N5', m: 'direct object', r: 'N + を + verb',
        more: 'The thing an action is done to. With movement verbs, it also marks the space you go through (道[みち]を渡[わた]る, 公園[こうえん]を散歩[さんぽ]する) and the place you leave (家[いえ]を出[で]る, 電車[でんしゃ]を降[お]りる).',
        ex: [['パン{を}食[た]べます。', 'I eat bread.'], ['橋[はし]{を}渡[わた]ってください。', 'Please cross the bridge.']],
        warn: ['Written を, read お.', '好[す]き, 分[わ]かる, できる and 欲[ほ]しい take が, not を. With 〜たい both are fine: 水[みず]が / を飲[の]みたい.'],
      },
      {
        p: 'に', lv: 'N5', m: 'at (time), to (place / person), in (where something is)', r: 'N + に',
        more: 'Points at a target: a clock time or date (三[さん]時[じ]に), a destination (学校[がっこう]に行[い]く), the person you give or say something to (友達[ともだち]にあげる), where something exists (机[つくえ]の上[うえ]にある), and the purpose of going (買[か]い物[もの]に行[い]く, 食[た]べに行[い]く).',
        ex: [['七時[しちじ]{に}起[お]きます。', 'I get up at seven.'], ['駅[えき]の前[まえ]{に}本屋[ほんや]があります。', 'There’s a bookshop in front of the station.']],
        warn: ['No に with relative time words: 今日[きょう], 明日[あした], 毎日[まいにち], 先週[せんしゅう], 来年[らいねん] (×明日[あした]に). Days of the week can take it or not.', 'Where you live is に (東京[とうきょう]に住[す]む), but where you work or do anything is で (東京[とうきょう]で働[はたら]く).'],
      },
      {
        p: 'へ', lv: 'N5', m: 'toward (direction)', r: 'N + へ',
        more: 'The direction you move in. With 行[い]く, 来[く]る and 帰[かえ]る it’s almost the same as に: へ stresses the direction, に the arrival.',
        ex: [['来年[らいねん]、日本[にほん]{へ}行[い]きます。', 'I’ll go to Japan next year.']],
        warn: ['Written へ, read え.', 'へ can go before の (友達[ともだち]への手紙[てがみ], a letter to a friend); に can’t (×友達[ともだち]にの).'],
      },
      {
        p: 'で', lv: 'N5', m: 'at (place of action), by / with (means), because of', r: 'N + で',
        more: 'Where an action happens (図書館[としょかん]で勉強[べんきょう]する), the tool or means (箸[はし]で食[た]べる, バスで行[い]く, 日本語[にほんご]で話[はな]す), what something is made of, and a cause (風邪[かぜ]で休[やす]む).',
        ex: [['図書館[としょかん]{で}勉強[べんきょう]します。', 'I study at the library.'], ['電車[でんしゃ]{で}会社[かいしゃ]に行[い]きます。', 'I go to work by train.']],
        warn: ['に vs で: に for where something is or ends up (いる, ある, 住[す]む, 置[お]く); で for where something is done.', 'On foot is 歩[ある]いて, not ×足[あし]で.', 'Events “take place” with で: 学校[がっこう]でパーティーがある.'],
      },
      {
        p: 'と', lv: 'N5', m: 'and (complete list); with', r: 'N + と + N · N + と (together)',
        more: 'Joins nouns into a complete list, or says who you do something with.',
        ex: [['パン{と}牛乳[ぎゅうにゅう]を買[か]いました。', 'I bought bread and milk.'], ['友達[ともだち]{と}映画[えいが]を見[み]ました。', 'I saw a movie with a friend.']],
        warn: ['Only joins nouns. For verbs and adjectives use the て-form: 安[やす]くておいしい.', 'After a verb, と means “when / if” or quotes something (see their own entries).'],
      },
      {
        p: 'や', lv: 'N5', m: 'and (among others)', r: 'N + や + N (+ など)',
        more: 'A list of examples: there are more things than the ones you name. Often closed with など (“and so on”).',
        ex: [['りんご{や}バナナを買[か]いました。', 'I bought apples, bananas and such.']],
        warn: ['と says “exactly these”; や says “these among others”.'],
      },
      {
        p: 'も', lv: 'N5', m: 'also, too; (not) even', r: 'N + も (replaces は / が / を)',
        more: 'Replaces は, が and を, and goes after other particles (にも, でも, とも). With a question word and a negative verb it means “no …”: 何[なに]も (nothing), 誰[だれ]も (no one), どこにも (nowhere).',
        ex: [['私[わたし]{も}行[い]きます。', 'I’ll go too.'], ['何[なに]{も}食[た]べませんでした。', 'I didn’t eat anything.']],
        warn: ['Never stack: ×はも, ×がも, ×をも.', '何[なに]も, 誰[だれ]も and いつも are different: いつも means “always” and takes a positive verb.'],
      },
      {
        p: 'の', lv: 'N5', m: '’s, of; the one', r: 'N + の + N',
        more: 'Joins two nouns: owner (私[わたし]の本[ほん]), kind (日本語[にほんご]の先生[せんせい]), position (机[つくえ]の上[うえ]). On its own it stands for a thing: 赤[あか]いの (the red one), 私[わたし]の (mine).',
        ex: [['これは私[わたし]{の}かばんです。', 'This is my bag.'], ['もっと安[やす]い{の}はありますか。', 'Do you have a cheaper one?']],
        warn: ['な-adjectives take な, not の: きれいな花[はな] (×きれいの花[はな]).', 'Never between an い-adjective and its noun: 高[たか]い本[ほん] (×高[たか]いの本[ほん]).'],
      },
      {
        p: 'から · まで', lv: 'N5', m: 'from · until / as far as', r: 'N + から · N + まで',
        more: 'Starting and end points in time or space: 九[きゅう]時[じ]から五[ご]時[じ]まで, 駅[えき]から家[いえ]まで.',
        ex: [['駅[えき]{から}家[いえ]{まで}歩[ある]きます。', 'I walk from the station to my house.']],
        warn: ['まで = until (the whole time): 五[ご]時[じ]まで働[はたら]く. までに = by (a deadline): 金曜日[きんようび]までに出[だ]してください.', 'After a sentence, から means “because” (see 〜から).'],
      },
      {
        p: 'か', lv: 'N5', m: 'question mark; or; some-', r: 'sentence + か · N + か + N',
        more: 'Turns a polite sentence into a question. Between nouns it means “or” (コーヒーか紅茶[こうちゃ]). After a question word it makes “some-”: 何[なに]か (something), 誰[だれ]か (someone), どこか (somewhere).',
        ex: [['学生[がくせい]です{か}。', 'Are you a student?'], ['何[なに]{か}飲[の]みますか。', 'Will you have something to drink?']],
        warn: ['Casual questions drop か and just rise in tone: 行[い]く？ Plain + か alone can sound rough.'],
      },
      {
        p: 'ね · よ', lv: 'N5', m: 'right? / isn’t it · I tell you', r: 'sentence + ね / よ / よね',
        more: 'ね shares a feeling or checks the listener agrees (いい天気[てんき]ですね). よ gives the listener something new (おいしいですよ). よね checks something you think is true.',
        ex: [['暑[あつ]いです{ね}。', 'It’s hot, isn’t it?'], ['この本[ほん]、面白[おもしろ]い{よ}。', 'This book is good, you know.']],
        warn: ['Too much よ sounds pushy, especially to a superior.'],
      },
      {
        p: 'だけ · しか〜ない', lv: 'N4', m: 'only · nothing but', r: 'N + だけ · N + しか + negative verb',
        more: 'だけ is a neutral “only”. しか〜ない stresses “only that, and it’s not much”.',
        ex: [['百円[ひゃくえん]{だけ}あります。', 'I have just 100 yen.'], ['百円[ひゃくえん]{しか}ありません。', 'I only have 100 yen (that’s all).']],
        warn: ['しか always takes a negative verb, though the meaning is positive.', 'しか replaces が and を but goes after other particles: 東京[とうきょう]にしか.'],
      },
      {
        p: 'でも', lv: 'N4', m: '… or something; any-', r: 'N + でも · question word + でも',
        more: 'After a noun it softens a suggestion (“tea or something”). After a question word it means “any-”: 何[なに]でも (anything), いつでも (any time), どこでも (anywhere).',
        ex: [['お茶[ちゃ]{でも}飲[の]みませんか。', 'Shall we have some tea or something?'], ['いつ{でも}来[き]てください。', 'Come any time.']],
        warn: ['At the start of a sentence, でも means “but”.'],
      },
    ],
  },
  {
    id: 'basics', title: 'Basic sentences', jp: '基本[きほん]の文[ぶん]',
    practice: [['sentences.html', 'Sentences'], ['adjectives.html', 'Adjectives']],
    points: [
      {
        p: 'N です · だ', lv: 'N5', m: 'is / am / are', r: 'N + です (polite) · N + だ (plain)',
        more: 'Negative じゃないです / じゃありません, past でした, past negative じゃなかったです. Plain: だ, じゃない, だった, じゃなかった.',
        ex: [['田中[たなか]{です}。', 'I’m Tanaka.'], ['昨日[きのう]は休[やす]み{でした}。', 'Yesterday was a day off.']],
        warn: ['Never だ after an い-adjective: 高[たか]いです, 高[たか]い (×高[たか]いだ).', 'ではありません is the formal, written version of じゃないです.', 'Casual speech often drops だ: 学生[がくせい]？'],
      },
      {
        p: 'あります · います', lv: 'N5', m: 'there is; have', r: 'place に N が あります (things) / います (people, animals)',
        more: 'ある for things and plants, いる for people and animals. Also “have”: 時間[じかん]があります, 兄[あに]がいます.',
        ex: [['机[つくえ]の上[うえ]に本[ほん]が{あります}。', 'There’s a book on the desk.'], ['公園[こうえん]に子供[こども]が{います}。', 'There are children in the park.']],
        warn: ['The plain negative of ある is ない (×あらない).', 'Put the topic first to say where something is: 本[ほん]は机[つくえ]の上[うえ]にあります.'],
      },
      {
        p: 'これ · それ · あれ · どれ', lv: 'N5', m: 'this · that · that over there · which', r: 'こ (near me) · そ (near you) · あ (far from both) · ど (which?)',
        more: 'The same four start many words: これ (thing), この + N, ここ (place), こちら (way, polite), こんな (this kind of).',
        ex: [['{これ}は何[なん]ですか。', 'What is this?'], ['{あの}人[ひと]は誰[だれ]ですか。', 'Who is that person?']],
        warn: ['この, その, あの and どの must have a noun after them: この本[ほん]は (×このは).', 'For things that aren’t in sight, そ is what only one of you knows, あ what you both know (あの店[みせ], remember?).'],
      },
      {
        p: 'い-adjectives', lv: 'N5', m: 'describing words ending in い', r: 'い-adj: 高[たか]い → 高[たか]くない · 高[たか]かった · 高[たか]くなかった · 高[たか]くて',
        more: 'They conjugate themselves: drop い and add くない (not), かった (was), くなかった (wasn’t), くて (and). Before a noun, just as they are: 高[たか]い本[ほん].',
        ex: [['このカレーは辛[から]{くない}です。', 'This curry isn’t spicy.'], ['旅行[りょこう]は楽[たの]し{かった}です。', 'The trip was fun.']],
        warn: ['いい is irregular: よくない, よかった, よくて.', 'きれい, 嫌[きら]い, 有名[ゆうめい] end in い but are な-adjectives.', 'Past is on the adjective, not です: ×高[たか]いでした.'],
      },
      {
        p: 'な-adjectives', lv: 'N5', m: 'describing words that take な', r: 'な-adj + な + N · な-adj + です / じゃない / でした · な-adj + で (and)',
        more: 'They work like nouns at the end of a sentence (静[しず]かです, 静[しず]かじゃない) and take な before a noun: 静[しず]かな部屋[へや].',
        ex: [['{静[しず]かな}部屋[へや]です。', 'It’s a quiet room.'], ['この町[まち]は{有名[ゆうめい]じゃない}です。', 'This town isn’t famous.']],
        warn: ['Drop な before です: 静[しず]かです (×静[しず]かなです).', '好[す]き and 嫌[きら]い are な-adjectives: 好[す]きな食[た]べ物[もの].'],
      },
      {
        p: '〜く · 〜に (adverbs)', lv: 'N5', m: '-ly: how something is done', r: 'い-adj: 〜い → 〜く · な-adj + に',
        more: 'Turns an adjective into a word that describes a verb.',
        ex: [['早[はや]{く}起[お]きました。', 'I got up early.'], ['{静[しず]かに}話[はな]してください。', 'Please speak quietly.']],
        warn: ['いい → よく: よく分[わ]かりました (“well”); よく also means “often”.'],
      },
    ],
  },
  {
    id: 'verbs', title: 'Verb patterns', jp: '動詞[どうし]の文型[ぶんけい]',
    practice: [['verbs.html', 'Verbs'], ['bunkei.html', 'Bunkei'], ['verb-conjugation-chart.html', 'Conjugation chart']],
    points: [
      {
        p: '〜ます · ません · ました · ませんでした', lv: 'N5', m: 'polite present / future, negative, past', r: 'V-masu + ます · ません · ました · ませんでした',
        more: 'The present also covers the future: 明日[あした]行[い]きます (I’ll go tomorrow). It describes habits, not what’s happening right now.',
        ex: [['毎朝[まいあさ]コーヒーを飲[の]み{ます}。', 'I drink coffee every morning.'], ['昨日[きのう]は勉強[べんきょう]し{ませんでした}。', 'I didn’t study yesterday.']],
        warn: ['“I’m eating (now)” is 食[た]べています, not 食[た]べます.'],
      },
      {
        p: '〜ましょう · 〜ましょうか', lv: 'N5', m: 'let’s · shall I / shall we?', r: 'V-masu + ましょう(か)',
        more: 'ましょう suggests doing something together. ましょうか offers help (持[も]ちましょうか, shall I carry it?) or asks to decide together.',
        ex: [['少[すこ]し休[やす]み{ましょう}。', 'Let’s rest a bit.'], ['窓[まど]を開[あ]け{ましょうか}。', 'Shall I open the window?']],
        warn: ['Plain version: the volitional form (行[い]こう, 食[た]べよう).'],
      },
      {
        p: '〜ませんか', lv: 'N5', m: 'won’t you …? (invitation)', r: 'V-masu + ませんか',
        more: 'A soft invitation that leaves the other person room to say no.',
        ex: [['一緒[いっしょ]に映画[えいが]を見[み]{ませんか}。', 'Would you like to see a movie together?']],
        warn: ['Turn it down softly: 今日[きょう]はちょっと…, not a blunt いいえ.'],
      },
      {
        p: '〜たい', lv: 'N5', m: 'want to (do)', r: 'V-masu + たい (then like an い-adj: たくない, たかった)',
        more: 'Says what you want to do, or asks what the listener wants to do.',
        ex: [['日本[にほん]へ行[い]き{たい}です。', 'I want to go to Japan.'], ['今日[きょう]は何[なに]もし{たくない}。', 'I don’t want to do anything today.']],
        warn: ['Only for “I” and questions to “you”. For others: 〜たがっている (弟[おとうと]は犬[いぬ]を飼[か]いたがっている) or 〜たいと言[い]っている.', 'Wanting a thing is 欲[ほ]しい: 新[あたら]しい車[くるま]が欲[ほ]しい.', 'Asking a superior 〜たいですか is too direct; ask about their plans instead.'],
      },
      {
        p: '〜て (and, then)', lv: 'N5', m: 'and; and then', r: 'V-te … · い-adj → 〜くて · N / な-adj + で',
        more: 'Links actions in the order they happen, or links descriptions. The last verb sets the tense and politeness for the whole sentence.',
        ex: [['朝[あさ]起[お]き{て}、顔[かお]を洗[あら]い{ます}。', 'I get up and wash my face.'], ['この店[みせ]は安[やす]く{て}おいしい。', 'This place is cheap and good.']],
        warn: ['て-form rules (書[か]いて, 飲[の]んで, 行[い]って…): see the conjugation chart.', 'Don’t link a good and a bad point with て; use が / けど: 安[やす]いけど、まずい.'],
      },
      {
        p: '〜てください · 〜ないでください', lv: 'N5', m: 'please do · please don’t', r: 'V-te + ください · V-nai + でください',
        more: 'A polite request or instruction.',
        ex: [['ここに名前[なまえ]を書[か]い{てください}。', 'Please write your name here.'], ['写真[しゃしん]を撮[と]ら{ないでください}。', 'Please don’t take photos.']],
        warn: ['Still a request you expect to be done. To a superior, ask: 〜ていただけませんか.'],
      },
      {
        p: '〜ている', lv: 'N5', m: 'is doing; is (in a state)', r: 'V-te + いる',
        more: 'An action going on now (食[た]べている), a habit (毎朝[まいあさ]走[はし]っている), or, with verbs of change, the state after it happened: 結婚[けっこん]している (is married), 知[し]っている (knows), 来[き]ている (has come and is here).',
        ex: [['今[いま]、雨[あめ]が降[ふ]っ{ています}。', 'It’s raining now.'], ['姉[あね]は結婚[けっこん]し{ています}。', 'My older sister is married.']],
        warn: ['“I know” is 知[し]っています, but “I don’t know” is 知[し]りません (×知[し]っていません).', '行[い]っている means “has gone (and is there)”, not “is going”.', 'Speech drops the い: 食[た]べてる.'],
      },
      {
        p: '〜てもいい', lv: 'N5', m: 'may; it’s OK to', r: 'V-te + も いい(です)',
        more: 'Gives or asks for permission.',
        ex: [['写真[しゃしん]を撮[と]っ{てもいいですか}。', 'May I take a photo?']],
        warn: ['Say yes with ええ、どうぞ; say no softly with すみません、ちょっと….'],
      },
      {
        p: '〜てはいけない', lv: 'N5', m: 'must not', r: 'V-te + は いけない / いけません',
        more: 'Forbids something: rules, or a parent to a child. Casual: 〜ちゃだめ / 〜じゃだめ.',
        ex: [['ここでたばこを吸[す]っ{てはいけません}。', 'You must not smoke here.']],
        warn: ['Sounds strict; don’t say it to a superior.'],
      },
      {
        p: '〜なければならない', lv: 'N5', m: 'must, have to', r: 'V-nai: drop い + ければ ならない / いけない',
        more: 'Literally “if I don’t do it, it won’t do”. Also 〜なくてはいけない. Casual: 〜なきゃ, 〜なくちゃ.',
        ex: [['毎日[まいにち]薬[くすり]を飲[の]ま{なければなりません}。', 'I have to take medicine every day.'], ['もう帰[かえ]ら{なきゃ}。', 'I’ve got to go home.']],
        warn: ['する → しなければ, 来[く]る → 来[こ]なければ (こなければ).'],
      },
      {
        p: '〜なくてもいい', lv: 'N4', m: 'don’t have to', r: 'V-nai: drop い + くても いい',
        more: 'Says something isn’t necessary.',
        ex: [['明日[あした]は来[こ]{なくてもいいです}。', 'You don’t have to come tomorrow.']],
        warn: ['Not the same as “must not” (〜てはいけない).'],
      },
      {
        p: '〜たことがある', lv: 'N5', m: 'have (ever) done', r: 'V-ta + ことがある',
        more: 'Talks about experience: something you have done at some point in your life.',
        ex: [['富士山[ふじさん]に登[のぼ]っ{たことがあります}。', 'I have climbed Mt. Fuji.']],
        warn: ['Not for things just done: “I already ate” is もう食[た]べました.', 'V-dict + ことがある means “sometimes do”: 朝[あさ]ご飯[はん]を食[た]べないことがある.'],
      },
      {
        p: '〜たり〜たりする', lv: 'N5', m: 'do things like A and B', r: 'V-ta + り, V-ta + り する',
        more: 'Gives a few examples of what you do, out of more. One たり alone is fine: 本[ほん]を読[よ]んだりする (things like reading).',
        ex: [['週末[しゅうまつ]は掃除[そうじ]をし{たり}、本[ほん]を読[よ]ん{だりします}。', 'On weekends I do things like cleaning and reading.']],
        warn: ['End with する, which carries the tense: 〜たりしました.', 'Also alternation: 行[い]ったり来[き]たり (back and forth).'],
      },
      {
        p: '〜てから', lv: 'N5', m: 'after doing; since', r: 'V-te + から',
        more: 'First one action, then the next.',
        ex: [['手[て]を洗[あら]っ{てから}、食[た]べます。', 'I eat after washing my hands.']],
        warn: ['Compare 〜た後[あと]で: てから stresses the order (first this, then that).'],
      },
      {
        p: '〜前[まえ]に · 〜た後[あと]で', lv: 'N5', m: 'before · after', r: 'V-dict + 前[まえ]に · V-ta + 後[あと]で · N の + 前[まえ]に / 後[あと]で',
        more: 'Says when one thing happens compared with another.',
        ex: [['寝[ね]る{前[まえ]に}歯[は]を磨[みが]きます。', 'I brush my teeth before I go to bed.'], ['食[た]べた{後[あと]で}散歩[さんぽ]しました。', 'I went for a walk after eating.']],
        warn: ['前[まえ]に always takes the dictionary form, even about the past: 寝[ね]る前[まえ]に読[よ]んだ (×寝[ね]た前[まえ]に).', '後[あと]で always takes the た-form, even about the future.'],
      },
      {
        p: 'もう · まだ', lv: 'N5', m: 'already · not yet / still', r: 'もう + V-ta · まだ + V-te いない',
        more: 'もう 〜ました: already done. まだ 〜ていません: not done yet. まだ + positive: still (まだ雨[あめ]が降[ふ]っている).',
        ex: [['{もう}食[た]べました。', 'I’ve already eaten.'], ['{まだ}食[た]べていません。', 'I haven’t eaten yet.']],
        warn: ['“Not yet” is まだ〜ていません (×まだ〜ませんでした).', 'もう + negative means “no longer”: もう痛[いた]くない.'],
      },
      {
        p: '〜ながら', lv: 'N4', m: 'while (doing two things at once)', r: 'V-masu + ながら',
        more: 'One person does two things at the same time. The main action is the last verb.',
        ex: [['音楽[おんがく]を聞[き]き{ながら}勉強[べんきょう]します。', 'I study while listening to music.']],
        warn: ['Same person for both actions. For two people, or a time span, use 〜間[あいだ](に).'],
      },
      {
        p: '〜つもり', lv: 'N4', m: 'intend to, plan to', r: 'V-dict / V-nai + つもりだ',
        more: 'A firm plan you have made.',
        ex: [['夏休[なつやす]みに国[くに]へ帰[かえ]る{つもりです}。', 'I plan to go home for the summer holidays.']],
        warn: ['行[い]くつもりはない (“no intention at all”) is stronger than 行[い]かないつもり.', 'Asking a superior about their つもり sounds rude; ask about their 予定[よてい].'],
      },
      {
        p: '〜(よ)うと思[おも]う', lv: 'N4', m: 'I think I’ll …, I’m thinking of', r: 'V-vol + と思[おも]う / と思[おも]っている',
        more: 'A plan or decision, softer than つもり.',
        ex: [['来年[らいねん]日本[にほん]へ行[い]こ{うと思[おも]っています}。', 'I’m thinking of going to Japan next year.']],
        warn: ['と思[おも]う: just decided. と思[おも]っている: have been planning it for a while.'],
      },
      {
        p: '〜てみる', lv: 'N4', m: 'try (doing) and see', r: 'V-te + みる',
        more: 'Do something to find out what it’s like.',
        ex: [['この服[ふく]、着[き]{てみ}てもいいですか。', 'May I try these clothes on?']],
        warn: ['“Try (hard), attempt” is 〜ようとする.'],
      },
      {
        p: '〜てしまう', lv: 'N4', m: 'do completely; do (by mistake, sadly)', r: 'V-te + しまう · casual 〜ちゃう / 〜じゃう',
        more: 'Either finished completely (全部[ぜんぶ]食[た]べてしまった) or something that happened and you regret it.',
        ex: [['財布[さいふ]を忘[わす]れ{てしまいました}。', 'I (went and) forgot my wallet.'], ['宿題[しゅくだい]はもうやっ{ちゃった}。', 'I’ve already done all my homework.']],
        warn: ['て → ちゃう, で → じゃう: 飲[の]んじゃった.'],
      },
      {
        p: '〜ておく', lv: 'N4', m: 'do in advance; leave as it is', r: 'V-te + おく · casual 〜とく',
        more: 'Do something now to be ready for later, or leave something in a state.',
        ex: [['旅行[りょこう]の前[まえ]にホテルを予約[よやく]し{ておきます}。', 'I’ll book a hotel before the trip.'], ['窓[まど]を開[あ]け{ておいてください}。', 'Please leave the window open.']],
        warn: ['Casual: やっとく, 買[か]っとく.'],
      },
      {
        p: '〜てある', lv: 'N4', m: 'has been done (and stays so)', r: 'N が + V-te (transitive) + ある',
        more: 'Someone did it on purpose and the result is still there.',
        ex: [['壁[かべ]に地図[ちず]が貼[は]っ{てあります}。', 'A map has been put up on the wall.']],
        warn: ['Only with transitive verbs, and the object takes が.', '窓[まど]が開[あ]いている: the window is open. 窓[まど]が開[あ]けてある: someone opened it (on purpose).'],
      },
      {
        p: '〜ていく · 〜てくる', lv: 'N4', m: 'go / come (doing); change from now on / up to now', r: 'V-te + いく · V-te + くる',
        more: 'Do something and go or come: 傘[かさ]を持[も]っていく (take an umbrella). For change over time, てくる is up to now, ていく from now on.',
        ex: [['傘[かさ]を持[も]っ{ていきます}。', 'I’ll take an umbrella.'], ['だんだん寒[さむ]くなっ{てきました}。', 'It’s getting colder.']],
        warn: ['As helpers, いく and くる are usually written in kana: 持[も]っていく, なってきた.'],
      },
      {
        p: '〜てほしい', lv: 'N4', m: 'want someone to (do)', r: 'person に + V-te + ほしい',
        more: 'What you want someone else to do.',
        ex: [['母[はは]にはずっと元気[げんき]でい{てほしい}。', 'I want my mother to stay well forever.']],
        warn: ['Said straight to someone it can sound demanding; ask with 〜てもらえませんか.'],
      },
      {
        p: '〜始[はじ]める · 〜終[お]わる · 〜続[つづ]ける', lv: 'N4', m: 'start · finish · keep (doing)', r: 'V-masu + 始[はじ]める / 終[お]わる / 続[つづ]ける',
        more: 'Compound verbs for the start, end or continuing of an action.',
        ex: [['雨[あめ]が降[ふ]り{始[はじ]めました}。', 'It started to rain.'], ['この本[ほん]はもう読[よ]み{終[お]わりました}。', 'I’ve finished reading this book.']],
        warn: ['Also 〜出[だ]す for a sudden start: 泣[な]き出[だ]す (burst into tears).'],
      },
    ],
  },
  {
    id: 'change', title: 'Change, ability & decisions', jp: '変化[へんか]・可能[かのう]・決定[けってい]',
    practice: [['verbs.html', 'Verbs'], ['bunkei.html', 'Bunkei']],
    points: [
      {
        p: '〜くなる · 〜になる · 〜くする · 〜にする', lv: 'N5', m: 'become · make (something) …', r: 'い-adj: 〜く + なる / する · な-adj, N + に + なる / する',
        more: 'なる: something changes by itself. する: someone changes it.',
        ex: [['寒[さむ]{くなりました}。', 'It’s got cold.'], ['部屋[へや]をきれい{にしてください}。', 'Please tidy the room.']],
        warn: ['いい → よくなる. N + にする also means “decide on”: コーヒーにします (I’ll have coffee).'],
      },
      {
        p: '〜ことができる', lv: 'N4', m: 'can, be able to', r: 'V-dict + ことができる · N + ができる',
        more: 'Says something is possible. Same meaning as the potential form, a little more formal.',
        ex: [['ここで泳[およ]ぐ{ことができます}。', 'You can swim here.'], ['私[わたし]は日本語[にほんご]{ができます}。', 'I can speak Japanese.']],
        warn: ['The potential form is shorter and more common in speech: 泳[およ]げます.'],
      },
      {
        p: 'Potential form', lv: 'N4', m: 'can (do)', r: 'u-verb: え-row + る (書[か]ける) · ru-verb: られる · する → できる · 来[く]る → 来[こ]られる',
        more: 'The new verb is a ru-verb (書[か]けない, 書[か]けた). The object usually takes が.',
        ex: [['漢字[かんじ]が読[よ]め{ます}。', 'I can read kanji.'], ['刺身[さしみ]は食[た]べ{られません}。', 'I can’t eat sashimi.']],
        warn: ['見[み]える / 聞[き]こえる: can be seen / heard (on its own). 見[み]られる / 聞[き]ける: able to see / listen (have the chance).', '見[み]れる, 食[た]べれる (ら dropped) are common in speech but wrong in writing and on the JLPT.'],
      },
      {
        p: '〜ようになる', lv: 'N4', m: 'come to (be able to), start to', r: 'V-dict / potential + ようになる · V-nai: drop い + くなる',
        more: 'A gradual change in ability or habit.',
        ex: [['日本語[にほんご]が話[はな]せる{ようになりました}。', 'I’ve become able to speak Japanese.'], ['最近[さいきん]、テレビを見[み]な{くなりました}。', 'Lately I’ve stopped watching TV.']],
        warn: ['Negative change: ないようになる is possible but 〜なくなる is more natural.'],
      },
      {
        p: '〜ようにする', lv: 'N4', m: 'try to, make a point of', r: 'V-dict / V-nai + ようにする',
        more: 'An effort you keep up. 〜ようにしている = a habit you try to keep.',
        ex: [['毎日[まいにち]野菜[やさい]を食[た]べる{ようにしています}。', 'I make a point of eating vegetables every day.']],
        warn: ['〜ようにしてください: please make sure to (遅[おく]れないようにしてください).'],
      },
      {
        p: '〜ことにする', lv: 'N4', m: 'decide to', r: 'V-dict / V-nai + ことにする',
        more: 'Your own decision. 〜ことにしている: a rule you have made for yourself.',
        ex: [['来年[らいねん]、留学[りゅうがく]する{ことにしました}。', 'I’ve decided to study abroad next year.']],
        warn: ['Compare ことになる: decided by others or by circumstances.'],
      },
      {
        p: '〜ことになる', lv: 'N4', m: 'it has been decided that', r: 'V-dict / V-nai + ことになる',
        more: 'A decision made by others or by circumstances. 〜ことになっている: it’s the rule.',
        ex: [['来月[らいげつ]、大阪[おおさか]に転勤[てんきん]する{ことになりました}。', 'I’m being transferred to Osaka next month.']],
        warn: ['Often used for your own decisions too, to sound modest: 結婚[けっこん]することになりました.'],
      },
    ],
  },
  {
    id: 'guess', title: 'Guessing, hearsay & thoughts', jp: '推量[すいりょう]・伝聞[でんぶん]',
    practice: [['bunkei.html', 'Bunkei'], ['sentences.html', 'Sentences']],
    points: [
      {
        p: '〜と思[おも]う', lv: 'N5', m: 'I think (that)', r: 'plain + と思[おも]う · N / な-adj + だ + と思[おも]う',
        more: 'Your opinion or guess. For what someone else thinks: 〜と思[おも]っている.',
        ex: [['明日[あした]は晴[は]れる{と思[おも]います}。', 'I think it’ll be sunny tomorrow.'], ['あの人[ひと]は先生[せんせい]だ{と思[おも]います}。', 'I think that person is a teacher.']],
        warn: ['Don’t drop だ after a noun or な-adj: 学生[がくせい]だと思[おも]う (×学生[がくせい]と思[おも]う).', '“I don’t think so” is usually そうは思[おも]わない; “I think it isn’t” is 〜ないと思[おも]う.'],
      },
      {
        p: '〜と言[い]う', lv: 'N5', m: 'say (that)', r: '「quote」と言[い]う · plain + と言[い]う',
        more: 'Quotes words exactly, or reports what someone said. Casual: って.',
        ex: [['田中[たなか]さんは明日[あした]来[こ]ない{と言[い]っていました}。', 'Tanaka said they’re not coming tomorrow.']],
        warn: ['Reported speech keeps the tense the speaker used: 来[こ]ないと言[い]った (said “I won’t come”).'],
      },
      {
        p: '〜という N', lv: 'N4', m: 'an N called …; the N that …', r: 'N / plain + という + N',
        more: 'Names something the listener may not know, or gives the content of a story, news or idea.',
        ex: [['「さくら」{という}店[みせ]を知[し]っていますか。', 'Do you know a shop called “Sakura”?']],
        warn: ['Casual: って: さくらって店[みせ].'],
      },
      {
        p: '〜か · 〜かどうか', lv: 'N4', m: 'whether; (what / when …) inside a sentence', r: 'question word + plain + か · plain + かどうか',
        more: 'Puts a question inside a bigger sentence, before 分[わ]かる, 知[し]る, 聞[き]く, 決[き]める….',
        ex: [['会議[かいぎ]が何時[なんじ]に始[はじ]まる{か}分[わ]かりません。', 'I don’t know what time the meeting starts.'], ['行[い]く{かどうか}まだ決[き]めていません。', 'I haven’t decided whether I’ll go.']],
        warn: ['N and な-adj drop だ: 本当[ほんとう]かどうか (×本当[ほんとう]だかどうか).'],
      },
      {
        p: '〜でしょう · 〜だろう', lv: 'N5', m: 'probably; …right?', r: 'plain + でしょう / だろう (N, な-adj: no だ)',
        more: 'A fairly sure guess, as in a weather forecast. Said with a rising tone it asks for agreement: 疲[つか]れたでしょう？',
        ex: [['明日[あした]は雨[あめ]{でしょう}。', 'It will probably rain tomorrow.']],
        warn: ['For your own guess in conversation, 〜と思[おも]います usually sounds more natural.'],
      },
      {
        p: '〜かもしれない', lv: 'N4', m: 'might, maybe', r: 'plain + かもしれない (N, な-adj: no だ)',
        more: 'About 50/50: less sure than でしょう. Casual: かも.',
        ex: [['午後[ごご]は雨[あめ]が降[ふ]る{かもしれません}。', 'It might rain in the afternoon.']],
        warn: ['No だ: 病気[びょうき]かもしれない (×病気[びょうき]だかもしれない).'],
      },
      {
        p: '〜はずだ', lv: 'N4', m: 'should (be), I expect', r: 'plain + はず · N の / な-adj な + はず',
        more: 'A logical expectation based on what you know.',
        ex: [['電車[でんしゃ]は十時[じゅうじ]に着[つ]く{はずです}。', 'The train should arrive at ten.']],
        warn: ['Not “should” as advice: that’s 〜ほうがいい or 〜べきだ.', '〜はずがない: there’s no way that…'],
      },
      {
        p: '〜そう (looks like)', lv: 'N4', m: 'looks, seems (from what you see)', r: 'V-masu + そう · い-adj (drop い) / な-adj + そう',
        more: 'A guess from how something looks, or something about to happen: 雨[あめ]が降[ふ]りそう (looks like it’ll rain). It works like a な-adj: おいしそうなケーキ.',
        ex: [['このケーキ、おいし{そう}！', 'This cake looks delicious!'], ['雨[あめ]が降[ふ]り{そうです}。', 'It looks like it’s going to rain.']],
        warn: ['いい → よさそう, ない → なさそう.', 'Not for what you can plainly see: a red car is just 赤[あか]い (×赤[あか]そう).', 'かわいそう means “poor thing”, not “looks cute”.'],
      },
      {
        p: '〜そうだ (I hear)', lv: 'N4', m: 'I hear that, apparently', r: 'plain + そうだ (N, な-adj + だ)',
        more: 'Passes on what you heard or read. The source goes with によると.',
        ex: [['天気予報[てんきよほう]によると、明日[あした]は雨[あめ]だ{そうです}。', 'According to the forecast, it’ll rain tomorrow.']],
        warn: ['降[ふ]りそう: looks like rain. 降[ふ]るそう: I hear it’ll rain.', 'そうだ itself never changes: ×そうでした, ×そうじゃない.'],
      },
      {
        p: '〜ようだ · 〜みたいだ', lv: 'N4', m: 'seems; is like', r: 'plain + ようだ (N の, な-adj な) · plain / N + みたいだ (casual)',
        more: 'A guess based on what you notice. Also likeness: 夢[ゆめ]のよう / 夢[ゆめ]みたい (like a dream), and 〜ように (in the way…).',
        ex: [['誰[だれ]もいない{ようです}。', 'It seems no one is here.'], ['まるで子供[こども]{みたい}。', 'Just like a child.']],
        warn: ['みたい goes straight after N and な-adj: 学生[がくせい]みたい (×学生[がくせい]のみたい).'],
      },
      {
        p: '〜らしい', lv: 'N4', m: 'apparently; typical of', r: 'plain + らしい (N, な-adj: no だ) · N + らしい',
        more: 'Hearsay or a guess from what you’ve heard. After a noun: having the typical quality of it: 男[おとこ]らしい, 春[はる]らしい.',
        ex: [['あの店[みせ]は来月[らいげつ]閉[し]まる{らしい}。', 'Apparently that shop is closing next month.'], ['今日[きょう]は春[はる]{らしい}天気[てんき]ですね。', 'Real spring weather today.']],
        warn: ['Feels more distant than そうだ: you heard it somewhere and aren’t vouching for it.'],
      },
    ],
  },
  {
    id: 'linking', title: 'Reasons, contrast & time', jp: '理由[りゆう]・逆接[ぎゃくせつ]・時[とき]',
    practice: [['sentences.html', 'Sentences'], ['bunkei.html', 'Bunkei']],
    points: [
      {
        p: '〜から (because)', lv: 'N5', m: 'because, so', r: 'plain / polite + から (N, な-adj + だ)',
        more: 'Reason first, then the result: 暑[あつ]いから、窓[まど]を開[あ]けます. Or as an answer: どうして？ — 暑[あつ]いからです.',
        ex: [['暑[あつ]い{から}、窓[まど]を開[あ]けます。', 'It’s hot, so I’ll open the window.']],
        warn: ['N and な-adj need だ: 雨[あめ]だから.', 'から can sound like an excuse; use ので when apologising.'],
      },
      {
        p: '〜ので', lv: 'N4', m: 'because, since (softer)', r: 'plain + ので · N / な-adj + な + ので',
        more: 'Sounds more objective and polite than から. Good for excuses and requests.',
        ex: [['風邪[かぜ]をひいた{ので}、休[やす]みます。', 'I have a cold, so I’ll take the day off.']],
        warn: ['N and な-adj take な: 雨[あめ]なので (×雨[あめ]だので).'],
      },
      {
        p: '〜が · 〜けど', lv: 'N5', m: 'but; (soft opener)', r: 'plain / polite + が · けど (casual)',
        more: 'Joins two contrasting sentences. Also softens an opener: すみませんが…, 駅[えき]に行[い]きたいんですけど….',
        ex: [['高[たか]いです{が}、おいしいです。', 'It’s expensive, but good.']],
        warn: ['けれども, けれど: more polite versions of けど.'],
      },
      {
        p: '〜のに', lv: 'N4', m: 'even though (and that’s frustrating)', r: 'plain + のに · N / な-adj + な + のに',
        more: 'The result goes against what you expected, often with disappointment or surprise.',
        ex: [['勉強[べんきょう]した{のに}、試験[しけん]に落[お]ちた。', 'Even though I studied, I failed the exam.']],
        warn: ['The second half can’t be a request or plan: ×雨[あめ]なのに、行[い]きましょう → 雨[あめ]でも行[い]きましょう.'],
      },
      {
        p: '〜ても', lv: 'N4', m: 'even if, even though', r: 'V-te + も · い-adj: 〜くても · N / な-adj + でも',
        more: 'What follows happens anyway. With a question word: no matter …: いくら食[た]べても, 何[なん]回[かい]言[い]っても.',
        ex: [['雨[あめ]が降[ふ]っ{ても}行[い]きます。', 'I’ll go even if it rains.'], ['いくら食[た]べ{ても}太[ふと]らない。', 'No matter how much I eat, I don’t gain weight.']],
        warn: ['いい → よくても.'],
      },
      {
        p: '〜し', lv: 'N4', m: 'and also (giving reasons)', r: 'plain + し (N, な-adj + だし)',
        more: 'Lists reasons, hinting there are more.',
        ex: [['この店[みせ]は安[やす]い{し}、おいしい{し}、よく来[き]ます。', 'This place is cheap, and it’s good, so I come often.']],
        warn: ['One し alone also works: 時間[じかん]もないし… (and I don’t have time anyway…).'],
      },
      {
        p: '〜時[とき](とき)', lv: 'N4', m: 'when', r: 'plain + 時[とき] · N の 時[とき] · な-adj な 時[とき]',
        more: 'The time something happens.',
        ex: [['子供[こども]の{時[とき]}、犬[いぬ]を飼[か]っていました。', 'When I was a child, I had a dog.']],
        warn: ['The tense before 時[とき] shows the order: 日本[にほん]へ行[い]く時[とき]カメラを買[か]った (bought it before going); 行[い]った時[とき] (after arriving).'],
      },
      {
        p: '〜間[あいだ] · 〜間[あいだ]に', lv: 'N4', m: 'while, during · at some point during', r: 'V-dict / V-te いる / N の + 間[あいだ](に)',
        more: '間[あいだ]: the whole time. 間[あいだ]に: something happens once, inside that time.',
        ex: [['夏休[なつやす]みの{間[あいだ]}、ずっと働[はたら]いていました。', 'I worked the whole summer holiday.'], ['留守[るす]の{間[あいだ]に}、泥棒[どろぼう]が入[はい]った。', 'A burglar got in while I was out.']],
        warn: ['With 間[あいだ], the main verb lasts the whole time (ずっと…ていた).'],
      },
      {
        p: '〜ために', lv: 'N4', m: 'in order to; because of', r: 'V-dict / N の + ために',
        more: 'Purpose: 家[いえ]を買[か]うために貯金[ちょきん]する. With a past or a state it gives a cause: 事故[じこ]のために遅[おく]れた.',
        ex: [['日本[にほん]で働[はたら]く{ために}、日本語[にほんご]を勉強[べんきょう]しています。', 'I study Japanese in order to work in Japan.']],
        warn: ['For a purpose you don’t control (potential, なる, ない), use 〜ように: 聞[き]こえるように大[おお]きい声[こえ]で話[はな]す.'],
      },
      {
        p: '〜ように (so that)', lv: 'N4', m: 'so that', r: 'V-dict / V-nai / potential + ように',
        more: 'Aims at a state you can’t directly do: being able to, not forgetting, catching the train.',
        ex: [['忘[わす]れない{ように}、メモします。', 'I’ll write it down so I don’t forget.']],
        warn: ['Same subject and an action you control: use ために instead.'],
      },
    ],
  },
  {
    id: 'if', title: 'Conditionals', jp: '条件[じょうけん]',
    practice: [['verbs.html', 'Verbs (たら, ば)'], ['bunkei.html', 'Bunkei']],
    points: [
      {
        p: '〜たら', lv: 'N4', m: 'if; when (once)', r: 'V-ta + ら · い-adj: 〜かったら · N / な-adj + だったら',
        more: 'The most flexible “if”. Also “once X happens” and, with a past ending, “when I did X, I found…”.',
        ex: [['駅[えき]に着[つ]い{たら}、電話[でんわ]してください。', 'Call me when you get to the station.'], ['窓[まど]を開[あ]け{たら}、雪[ゆき]が降[ふ]っていた。', 'When I opened the window, it was snowing.']],
        warn: ['When in doubt, たら is the safe choice, especially before a request, wish or plan.'],
      },
      {
        p: '〜ば', lv: 'N4', m: 'if (general condition)', r: 'u-verb: え-row + ば · ru-verb: 〜れば · い-adj: 〜ければ · N / な-adj: なら(ば)',
        more: 'Focuses on the condition: if (and only if) this, then that. Common in general truths and advice.',
        ex: [['安[やす]けれ{ば}買[か]います。', 'If it’s cheap, I’ll buy it.'], ['よけれ{ば}、使[つか]ってください。', 'Please use it if you like.']],
        warn: ['いい → よければ.', 'After an action verb, the result usually can’t be a request or plan: ×着[つ]けば電話[でんわ]してください → 着[つ]いたら.', '〜ばよかった: I wish I had: もっと勉強[べんきょう]すればよかった.'],
      },
      {
        p: '〜と (whenever)', lv: 'N4', m: 'when, whenever, if (always)', r: 'V-dict / V-nai + と',
        more: 'A natural or automatic result: every time A, B follows. Directions and machines use it a lot.',
        ex: [['このボタンを押[お]す{と}、水[みず]が出[で]ます。', 'Press this button and water comes out.'], ['春[はる]になる{と}、桜[さくら]が咲[さ]きます。', 'When spring comes, the cherry trees bloom.']],
        warn: ['The result can’t be a request, wish or plan: ×〜と、電話[でんわ]してください.'],
      },
      {
        p: '〜なら', lv: 'N4', m: 'if (that’s the case); as for', r: 'plain / N + なら',
        more: 'Responds to what someone said or a situation: “if that’s so, then…”. Good for advice.',
        ex: [['京都[きょうと]に行[い]く{なら}、秋[あき]がいいですよ。', 'If you’re going to Kyoto, autumn is best.']],
        warn: ['The result can come before the condition: 行[い]くなら切符[きっぷ]を買[か]っておいて (buy the ticket before you go).'],
      },
      {
        p: '〜ば〜ほど', lv: 'N3', m: 'the more …, the more …', r: 'ば-form + same word + ほど',
        more: 'Two things change together.',
        ex: [['練習[れんしゅう]すれ{ば}する{ほど}、上手[じょうず]になります。', 'The more you practise, the better you get.']],
        warn: ['な-adj: 静[しず]かなら静[しず]かなほど / 静[しず]かであればあるほど.'],
      },
    ],
  },
  {
    id: 'compare', title: 'Comparing & advice', jp: '比較[ひかく]・助言[じょげん]',
    practice: [['adjectives.html', 'Adjectives'], ['bunkei.html', 'Bunkei']],
    points: [
      {
        p: 'A は B より〜', lv: 'N5', m: 'A is more … than B', r: 'A は B より + adj',
        more: 'Adjectives don’t change for comparison; より (than) does the work.',
        ex: [['東京[とうきょう]は大阪[おおさか]{より}大[おお]きいです。', 'Tokyo is bigger than Osaka.']],
        warn: ['Also: 大阪[おおさか]より東京[とうきょう]のほうが大[おお]きい.'],
      },
      {
        p: 'A と B と どちらが〜 · 〜のほうが', lv: 'N5', m: 'which is more …? · … is more', r: 'A と B と どちらが + adj か · A のほうが + adj',
        more: 'Asks and answers which of two is more something.',
        ex: [['肉[にく]と魚[さかな]と{どちらが}好[す]きですか。— 魚[さかな]{のほうが}好[す]きです。', 'Which do you like more, meat or fish? — I like fish more.']],
        warn: ['どちら for two choices; for three or more: どれ / 何[なに] / 誰[だれ] + が一番[いちばん].'],
      },
      {
        p: '〜の中[なか]で〜が一番[いちばん]', lv: 'N5', m: 'the most … of', r: 'group の中[なか]で + N が 一番[いちばん] + adj',
        more: 'The superlative: the most of a group.',
        ex: [['果物[くだもの]{の中[なか]で}何[なに]{が一番[いちばん]}好[す]きですか。', 'What fruit do you like best?']],
        warn: ['Pick the question word for the group: 何[なに] (things), 誰[だれ] (people), どこ (places), いつ (times).'],
      },
      {
        p: 'A は B ほど〜ない', lv: 'N4', m: 'A is not as … as B', r: 'A は B ほど + negative adj',
        more: 'Says A falls short of B.',
        ex: [['今年[ことし]の夏[なつ]は去年[きょねん]{ほど}暑[あつ]く{ない}。', 'This summer isn’t as hot as last year.']],
        warn: ['ほど in this sense always needs a negative.'],
      },
      {
        p: '〜ほうがいい', lv: 'N4', m: 'you’d better', r: 'V-ta + ほうがいい · V-nai + ほうがいい',
        more: 'Fairly strong advice.',
        ex: [['今日[きょう]は早[はや]く寝[ね]た{ほうがいいですよ}。', 'You’d better go to bed early tonight.'], ['無理[むり]をしない{ほうがいい}。', 'You’d better not push yourself.']],
        warn: ['Positive advice uses the た-form even about the future; negative uses ない (×なかったほうが).', 'Too direct for a superior.'],
      },
      {
        p: '〜すぎる', lv: 'N4', m: 'too (much)', r: 'V-masu / い-adj (drop い) / な-adj + すぎる',
        more: 'Overdoing something, or more than is good.',
        ex: [['昨日[きのう]は食[た]べ{すぎました}。', 'I ate too much yesterday.'], ['この靴[くつ]は大[おお]き{すぎます}。', 'These shoes are too big.']],
        warn: ['いい → よすぎる, ない → なさすぎる.'],
      },
      {
        p: '〜やすい · 〜にくい', lv: 'N4', m: 'easy to · hard to', r: 'V-masu + やすい / にくい',
        more: 'How easy something is to do. They work like い-adjectives.',
        ex: [['このペンは書[か]き{やすい}。', 'This pen is easy to write with.'], ['この字[じ]は読[よ]み{にくい}。', 'This writing is hard to read.']],
        warn: ['〜づらい: hard to do because it’s painful or awkward.'],
      },
    ],
  },
  {
    id: 'giving', title: 'Giving & receiving', jp: '授受[じゅじゅ]',
    practice: [['bunkei.html', 'Bunkei'], ['sentences.html', 'Sentences']],
    points: [
      {
        p: 'あげる', lv: 'N5', m: 'give (away from me)', r: 'giver は receiver に N を あげる',
        more: 'I give to someone, or one person gives to another (not to my side).',
        ex: [['友達[ともだち]に本[ほん]を{あげました}。', 'I gave my friend a book.']],
        warn: ['Never toward me or my family: use くれる.', 'Polite: さしあげる. To animals and plants: やる.'],
      },
      {
        p: 'くれる', lv: 'N4', m: 'give (to me / my side)', r: 'giver が / は (私[わたし]に) N を くれる',
        more: 'Someone gives to me or someone close to me.',
        ex: [['友達[ともだち]がチョコを{くれました}。', 'My friend gave me chocolate.']],
        warn: ['Only toward the speaker’s side: ×私[わたし]は友達[ともだち]に本[ほん]をくれた.', 'From a superior: くださる.'],
      },
      {
        p: 'もらう', lv: 'N4', m: 'receive, get', r: 'receiver は giver に / から N を もらう',
        more: 'Seen from the one who receives.',
        ex: [['母[はは]に時計[とけい]を{もらいました}。', 'I got a watch from my mother.']],
        warn: ['From a superior: いただく.'],
      },
      {
        p: '〜てあげる · 〜てくれる · 〜てもらう', lv: 'N4', m: 'do (a favour) for · for me · have someone do', r: 'V-te + あげる / くれる / もらう',
        more: 'The same three verbs for favours: who does what for whom.',
        ex: [['母[はは]が弁当[べんとう]を作[つく]っ{てくれました}。', 'My mother made me a packed lunch.'], ['友達[ともだち]に写真[しゃしん]を撮[と]っ{てもらいました}。', 'I had a friend take a photo.']],
        warn: ['〜てあげる to a superior’s face sounds condescending; offer with 〜ましょうか.', 'Polite requests: 〜てもらえませんか, 〜ていただけませんか.'],
      },
    ],
  },
  {
    id: 'voice', title: 'Passive, causative & polite speech', jp: '受身[うけみ]・使役[しえき]・敬語[けいご]',
    practice: [['verbs.html', 'Verbs'], ['verb-conjugation-chart.html', 'Conjugation chart']],
    points: [
      {
        p: 'Passive (〜れる · 〜られる)', lv: 'N4', m: 'be done (to)', r: 'u-verb: あ-row + れる · ru-verb: られる · する → される · 来[く]る → 来[こ]られる · doer に',
        more: 'The one affected becomes the subject; the doer takes に. Also the “suffering passive”: being troubled by something, even with verbs that take no object.',
        ex: [['先生[せんせい]に褒[ほ]め{られました}。', 'I was praised by the teacher.'], ['雨[あめ]に降[ふ]ら{れました}。', 'I got caught in the rain.']],
        warn: ['For ru-verbs, passive and potential look the same (食[た]べられる); context tells.', 'う-verbs ending in う use わ: 言[い]う → 言[い]われる.'],
      },
      {
        p: 'Causative (〜せる · 〜させる)', lv: 'N4', m: 'make / let (someone) do', r: 'u-verb: あ-row + せる · ru-verb: させる · する → させる · 来[く]る → 来[こ]させる',
        more: 'The person made or allowed to act takes に (or を with verbs that have no object).',
        ex: [['子供[こども]に野菜[やさい]を食[た]べ{させます}。', 'I make my child eat vegetables.'], ['少[すこ]し考[かんが]え{させてください}。', 'Please let me think about it a little.']],
        warn: ['〜させてください: “please let me”, a polite way to offer to do something yourself.'],
      },
      {
        p: 'Causative-passive', lv: 'N4', m: 'be made to (do)', r: 'u-verb: あ-row + される / せられる · ru-verb: させられる · する → させられる',
        more: 'You had to do something because someone made you.',
        ex: [['子供[こども]の時[とき]、母[はは]に野菜[やさい]を食[た]べ{させられました}。', 'As a child, I was made to eat vegetables by my mother.']],
        warn: ['The short あ-row + される doesn’t work for す-verbs: 話[はな]させられる (×話[はな]さされる).'],
      },
      {
        p: 'お〜になる (respectful)', lv: 'N4', m: 'polite for others’ actions', r: 'お + V-masu + になる · ご + する-noun + になる',
        more: 'Raises the other person: 社長[しゃちょう]はもうお帰[かえ]りになりました. Also 〜(ら)れる (passive form) as lighter respect: 先生[せんせい]が来[こ]られる.',
        ex: [['この本[ほん]をお読[よ]み{になりましたか}。', 'Have you read this book?']],
        warn: ['Special verbs instead: いらっしゃる (いる / 行[い]く / 来[く]る), 召[め]し上[あ]がる (食[た]べる / 飲[の]む), おっしゃる (言[い]う), ご覧[らん]になる (見[み]る), なさる (する).', 'Never for yourself.'],
      },
      {
        p: 'お〜する (humble)', lv: 'N4', m: 'humble: my action, for you', r: 'お + V-masu + する · ご + する-noun + する',
        more: 'Lowers yourself when you do something for the other person.',
        ex: [['お荷物[にもつ]をお持[も]ち{します}。', 'Let me carry your bag.']],
        warn: ['Special verbs instead: 参[まい]る (行[い]く / 来[く]る), おる (いる), 申[もう]す (言[い]う), いただく (食[た]べる / もらう), 拝見[はいけん]する (見[み]る), いたす (する).', 'Only for actions that involve the other person: ×お読[よ]みする for reading on your own.'],
      },
    ],
  },
  {
    id: 'clauses', title: 'Clauses & nouns from verbs', jp: '名詞[めいし]修飾[しゅうしょく]・名詞[めいし]化[か]',
    practice: [['sentences.html', 'Sentences'], ['word-order.html', 'Word Order']],
    points: [
      {
        p: 'Clause + N', lv: 'N4', m: 'the N that / who …', r: 'plain + N · N の + N · な-adj な + N',
        more: 'A whole sentence in plain form goes straight before a noun to describe it. There is no word for “that / who”.',
        ex: [['{昨日[きのう]買[か]った}本[ほん]', 'the book I bought yesterday'], ['{眼鏡[めがね]をかけている}人[ひと]', 'the person wearing glasses']],
        warn: ['The subject inside takes が (or の), not は: 母[はは]が作[つく]った料理[りょうり].', 'Plain forms only: no です / ます inside.', 'Non-past N and な-adj use の / な, not だ: 医者[いしゃ]の兄[あに], 静[しず]かな町[まち].'],
      },
      {
        p: '〜の · 〜こと', lv: 'N4', m: '(do)ing: turns a verb into a noun', r: 'V-dict / plain + の · こと',
        more: 'Lets a verb act as a noun: 泳[およ]ぐのが好[す]き (I like swimming).',
        ex: [['泳[およ]ぐ{の}が好[す]きです。', 'I like swimming.'], ['趣味[しゅみ]は写真[しゃしん]を撮[と]る{こと}です。', 'My hobby is taking photos.']],
        warn: ['With 見[み]る, 聞[き]く and other senses use の: 彼[かれ]が歌[うた]うのを聞[き]いた.', 'Before です and in set phrases (〜ことができる, 〜ことがある, 〜ことにする) use こと.'],
      },
      {
        p: '〜んです · 〜のだ', lv: 'N4', m: 'it’s that … (explaining)', r: 'plain + んです · N / な-adj + な + んです',
        more: 'Gives or asks for an explanation of the situation. 〜んですが… opens a request: 道[みち]に迷[まよ]ったんですが….',
        ex: [['どうした{んですか}。— 頭[あたま]が痛[いた]い{んです}。', 'What’s wrong? — I have a headache.']],
        warn: ['On every sentence it sounds emotional or pushy; use it when there’s something to explain.'],
      },
    ],
  },
  {
    id: 'n3', title: 'N3 patterns', jp: 'N3の文型[ぶんけい]',
    practice: [['bunkei-story.html', 'Bunkei in the Wild'], ['jlpt-reading.html', 'JLPT Reading']],
    points: [
      {
        p: '〜ところだ', lv: 'N3', m: 'about to · in the middle of · just did', r: 'V-dict + ところ · V-te いる + ところ · V-ta + ところ',
        more: 'Where you are in an action: about to start, doing it right now, or just finished.',
        ex: [['今[いま]から出[で]かける{ところです}。', 'I’m just about to go out.'], ['今[いま]、晩[ばん]ご飯[はん]を食[た]べている{ところです}。', 'I’m in the middle of dinner.']],
        warn: ['V-ta ところ: literally just now. V-ta ばかり: recently, as it feels to the speaker (could be weeks).'],
      },
      {
        p: '〜ばかり', lv: 'N3', m: 'nothing but; just (did)', r: 'N + ばかり · V-te + ばかりいる · V-ta + ばかり',
        more: 'Too much of one thing, often as a complaint. After V-ta: something happened only a short time ago.',
        ex: [['弟[おとうと]はゲーム{ばかり}している。', 'My brother does nothing but play games.'], ['日本[にほん]に来[き]た{ばかり}です。', 'I’ve only just come to Japan.']],
        warn: ['Compare だけ (“only”, neutral) with ばかり (“nothing but”, often critical).'],
      },
      {
        p: '〜ようとする', lv: 'N3', m: 'try to; be about to', r: 'V-vol + とする',
        more: 'An attempt (that may fail), or the moment just before something happens.',
        ex: [['出[で]かけ{ようとした}時[とき]、電話[でんわ]が鳴[な]った。', 'Just as I was about to go out, the phone rang.']],
        warn: ['〜てみる: try it and see. 〜ようとする: attempt it.'],
      },
      {
        p: '〜うちに', lv: 'N3', m: 'while (still); before', r: 'V-dict / V-te いる / い-adj / N の + うちに · V-nai + うちに',
        more: 'Do it while the state lasts, before it changes. ないうちに: before something happens.',
        ex: [['熱[あつ]い{うちに}食[た]べてください。', 'Eat it while it’s hot.'], ['暗[くら]くなら{ないうちに}帰[かえ]りましょう。', 'Let’s go home before it gets dark.']],
        warn: ['Unlike 間[あいだ]に, うちに hints “before it’s too late”.'],
      },
      {
        p: '〜たびに', lv: 'N3', m: 'every time', r: 'V-dict / N の + たびに',
        more: 'Each time A happens, B happens too.',
        ex: [['この歌[うた]を聞[き]く{たびに}、高校[こうこう]時代[じだい]を思[おも]い出[だ]す。', 'Every time I hear this song, I remember high school.']],
        warn: ['Feels stronger than 〜と / 〜時[とき]はいつも: without fail, every single time.'],
      },
      {
        p: '〜ずに', lv: 'N3', m: 'without (doing)', r: 'V-nai (drop ない) + ずに · する → せずに',
        more: 'The written, slightly formal version of 〜ないで.',
        ex: [['朝[あさ]ご飯[はん]を食[た]べ{ずに}出[で]かけた。', 'I went out without eating breakfast.']],
        warn: ['する → せずに (×しずに).'],
      },
      {
        p: '〜わけだ', lv: 'N3', m: 'so that’s why; no wonder', r: 'plain + わけだ · N の / な-adj な + わけだ',
        more: 'A conclusion that follows from what you’ve just learned.',
        ex: [['十年[じゅうねん]も住[す]んでいたのか。日本語[にほんご]が上手[じょうず]な{わけだ}。', 'You lived there ten years? No wonder your Japanese is good.']],
        warn: ['〜わけがない: there’s no way that.'],
      },
      {
        p: '〜わけではない', lv: 'N3', m: 'it’s not (necessarily) that', r: 'plain + わけではない',
        more: 'Denies part of something, or a conclusion the listener might draw.',
        ex: [['嫌[きら]いな{わけではない}けど、あまり食[た]べない。', 'It’s not that I dislike it, but I don’t eat it much.']],
        warn: ['Softer than a straight negative.'],
      },
      {
        p: '〜べきだ', lv: 'N3', m: 'should (it’s right to)', r: 'V-dict + べきだ · する → すべき / するべき',
        more: 'What is right or proper to do. べきではない: shouldn’t.',
        ex: [['約束[やくそく]は守[まも]る{べきだ}。', 'You should keep your promises.']],
        warn: ['No ない before べき: 行[い]くべきではない (×行[い]かないべき).', 'Strong; advice to a person is softer with 〜ほうがいい.'],
      },
      {
        p: '〜に違[ちが]いない', lv: 'N3', m: 'must be (I’m sure)', r: 'plain + に違[ちが]いない (N, な-adj: no だ)',
        more: 'A confident guess.',
        ex: [['電気[でんき]がついている。家[いえ]にいる{に違[ちが]いない}。', 'The lights are on. They must be home.']],
        warn: ['More written; in speech, きっと〜と思[おも]う or 〜はずだ.'],
      },
      {
        p: '〜おかげで · 〜せいで', lv: 'N3', m: 'thanks to · because of (bad)', r: 'plain / N の + おかげで · せいで',
        more: 'おかげで for a good result, せいで to blame something for a bad one.',
        ex: [['先生[せんせい]の{おかげで}合格[ごうかく]できました。', 'I passed thanks to my teacher.'], ['雨[あめ]の{せいで}試合[しあい]が中止[ちゅうし]になった。', 'The match was cancelled because of the rain.']],
        warn: ['おかげで with a bad result is sarcastic.'],
      },
      {
        p: '〜によって · 〜によると', lv: 'N3', m: 'by; depending on · according to', r: 'N + によって · N + によると',
        more: 'によって: depending on (人[ひと]によって違[ちが]う), the means, or who made something in a passive (ピカソによって描[か]かれた). によると: the source of what you heard.',
        ex: [['人[ひと]{によって}考[かんが]え方[かた]が違[ちが]う。', 'Ways of thinking differ from person to person.'], ['ニュース{によると}、台風[たいふう]が来[く]るそうだ。', 'According to the news, a typhoon is coming.']],
        warn: ['によると usually ends with そうだ / らしい / ということだ.'],
      },
      {
        p: '〜について · 〜に対[たい]して', lv: 'N3', m: 'about · toward; in contrast to', r: 'N + について · N + に対[たい]して',
        more: 'について: the topic. に対[たい]して: the target of a feeling or action (客[きゃく]に対[たい]して丁寧[ていねい]だ), or a contrast.',
        ex: [['日本[にほん]の歴史[れきし]{について}調[しら]べています。', 'I’m researching Japanese history.'], ['先生[せんせい]{に対[たい]して}失礼[しつれい]だ。', 'That’s rude toward the teacher.']],
        warn: ['Before a noun: についての本[ほん], に対[たい]する態度[たいど].'],
      },
      {
        p: '〜として', lv: 'N3', m: 'as (in the role of)', r: 'N + として',
        more: 'In the capacity of, or as a kind of.',
        ex: [['留学生[りゅうがくせい]{として}日本[にほん]に来[き]ました。', 'I came to Japan as an exchange student.']],
        warn: ['としては: “for a …” (as a beginner, that’s good).'],
      },
      {
        p: '〜っぽい', lv: 'N3', m: '-ish; tends to', r: 'N / V-masu / い-adj (drop い) + っぽい',
        more: 'Looks like, feels like, or easily does something. Works like an い-adjective.',
        ex: [['彼[かれ]は子供[こども]{っぽい}。', 'He’s childish.'], ['最近[さいきん]、忘[わす]れ{っぽく}なった。', 'I’ve become forgetful lately.']],
        warn: ['Often a little negative; 春[はる]っぽい, 白[しろ]っぽい are neutral.'],
      },
      {
        p: '〜ことはない', lv: 'N3', m: 'there’s no need to', r: 'V-dict + ことはない',
        more: 'Reassures the listener: you don’t need to.',
        ex: [['心配[しんぱい]する{ことはない}よ。', 'There’s no need to worry.']],
        warn: ['Different from 〜たことがない (have never done).'],
      },
      {
        p: '〜とおり(に)', lv: 'N3', m: 'just as, the way', r: 'V-dict / V-ta / N の + とおり · N + どおり',
        more: 'In the same way as something said, written or planned.',
        ex: [['説明書[せつめいしょ]の{とおりに}作[つく]ってください。', 'Please make it as the instructions say.'], ['予定[よてい]{どおり}に終[お]わった。', 'It finished as planned.']],
        warn: ['Straight after a noun it becomes どおり: 予定[よてい]どおり, 時間[じかん]どおり.'],
      },
      {
        p: '〜ように言[い]う · 頼[たの]む', lv: 'N3', m: 'tell / ask (someone) to', r: 'V-dict / V-nai + ように 言[い]う / 頼[たの]む / 注意[ちゅうい]する',
        more: 'Reports an instruction or request.',
        ex: [['医者[いしゃ]にお酒[さけ]を飲[の]まない{ように言[い]われた}。', 'The doctor told me not to drink.']],
        warn: ['Quoting the command itself also works: 飲[の]むなと言[い]われた.'],
      },
      {
        p: '〜さえ', lv: 'N3', m: 'even; 〜さえ〜ば: if only', r: 'N + さえ · N さえ + ば-form',
        more: 'さえ: even (that, the most basic). さえ〜ば: as long as, that’s all it takes.',
        ex: [['忙[いそが]しくて、水[みず]を飲[の]む時間[じかん]{さえ}ない。', 'I’m so busy I don’t even have time to drink water.'], ['時間[じかん]{さえ}あれ{ば}、行[い]けるのに。', 'If only I had the time, I could go.']],
        warn: ['でさえ after a person: 先生[せんせい]でさえ分[わ]からない (even the teacher doesn’t know).'],
      },
      {
        p: '〜っけ', lv: 'N3', m: 'was it …? (trying to remember)', r: 'plain past / だった + っけ',
        more: 'Casual: checks something you’ve forgotten.',
        ex: [['会議[かいぎ]は何時[なんじ]だった{っけ}。', 'What time was the meeting again?']],
        warn: ['Casual only; politely: 〜でしたっけ.'],
      },
    ],
  },
];
