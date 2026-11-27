#!/usr/bin/env node
// The printable particles & verbs guide: grammar-sheets/tokidoki-grammar-guide.pdf.
// A few A4 pages summing up what each particle does, the exceptions that
// trip learners up, and the verbs to watch (groups, irregulars, transitive
// pairs, verbs that take an unexpected particle, ている, giving/receiving,
// keigo). The content is hand-written below; kanji get furigana with
// 漢字[かんじ] (turned into <ruby>).
//
//   node scripts/render_grammar_guide.mjs [--html <file>]
//   node scripts/stamp_sheet_belts.mjs grammar-sheets
//
// Needs `playwright` (and Chromium) resolvable, like render_sheets_pdfs.mjs.
// --html also writes the print HTML, to look at it in a browser.
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// require(), so a globally installed playwright resolves too.
const { chromium } = createRequire(import.meta.url)("playwright");

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "grammar-sheets", "tokidoki-grammar-guide.pdf");
const TITLE = "Tokidoki — Japanese particles & verbs: a handy guide";

const ruby = (s) =>
  s.replace(/([一-鿿々〆ヶ]+)\[([ぁ-ゖー・]+)\]/g, "<ruby>$1<rt>$2</rt></ruby>");

// One particle: [particle, what it does, [[example, English], …], [pitfall, …]]
const PARTICLES = [
  ["は", "Topic: “as for X…”. Sets what the sentence is about; the new information comes after it. Also contrast: “X, at least / but”.",
    [["私[わたし]は学生[がくせい]です。", "I’m a student."],
     ["肉[にく]は食[た]べますが、魚[さかな]は食[た]べません。", "Meat I eat, but fish I don’t (contrast)."]],
    ["Written は, read <b>wa</b>.",
     "Replaces が and を: 魚[さかな]<b>は</b>食[た]べない, not 魚[さかな]をは. Stacks on the others: に<b>は</b>, で<b>は</b>, と<b>は</b>, から<b>は</b>.",
     "In a negative it often means “not <i>this</i> one”: 高[たか]く<b>は</b>ない “it isn’t <i>expensive</i> (but…)”."]],
  ["が", "Subject, as new information or the answer to “who / what”. Also “but” between two clauses.",
    [["誰[だれ]が来[き]ましたか。— 田中[たなか]さんが来[き]ました。", "Who came? — Tanaka-san did."],
     ["雨[あめ]が降[ふ]っています。", "It’s raining (a new event you just noticed)."]],
    ["Question words take が, never は: 誰[だれ]<b>が</b>, 何[なに]<b>が</b>, どれ<b>が</b>.",
     "Inside a clause the subject is が, not は: 母[はは]<b>が</b>作[つく]った料理[りょうり] “the food Mum made”. (が there may become の: 母[はは]<b>の</b>作[つく]った料理[りょうり].)",
     "The object of likes, skills, wants and needs is が: see the box “が, not を”."]],
  ["を", "Direct object: what the action is done to. Also the space you move through or leave.",
    [["パンを食[た]べます。", "I eat bread."],
     ["公園[こうえん]を散歩[さんぽ]します。橋[はし]を渡[わた]ります。", "I walk in the park. I cross the bridge."]],
    ["Written を, read <b>o</b>.",
     "Leaving a place is を: 家[いえ]<b>を</b>出[で]る “leave home”, 電車[でんしゃ]<b>を</b>降[お]りる “get off the train”, 大学[だいがく]<b>を</b>卒業[そつぎょう]する “graduate”.",
     "Moving through or along: 道[みち]<b>を</b>歩[ある]く, 角[かど]<b>を</b>曲[ま]がる, 空[そら]<b>を</b>飛[と]ぶ."]],
  ["に", "A point: the time something happens, where something is, the place you go to or into, the person you give to or meet, a purpose.",
    [["7時[しちじ]に起[お]きます。", "I get up at 7."],
     ["部屋[へや]に猫[ねこ]がいます。", "There’s a cat in the room."],
     ["友達[ともだち]にプレゼントをあげました。", "I gave my friend a present."],
     ["買[か]い物[もの]に行[い]きます。", "I’m going shopping (purpose: verb stem / noun + に + go/come)."]],
    ["Times with a number or a day take に (3時[さんじ]に, 月曜日[げつようび]に, 2025年[ねん]に); relative times don’t: 今日[きょう], 明日[あした], 毎日[まいにち], 今[いま], 去年[きょねん], 来週[らいしゅう] stand alone.",
     "Being somewhere (いる / ある / 住[す]む / 泊[と]まる) is に; doing something somewhere is で.",
     "Change and choice: 医者[いしゃ]<b>に</b>なる “become a doctor”, コーヒー<b>に</b>する “I’ll have coffee”.",
     "The doer in a passive or the person made to act in a causative: 先生[せんせい]<b>に</b>叱[しか]られた, 子供[こども]<b>に</b>野菜[やさい]を食[た]べさせる."]],
  ["へ", "Direction: “towards”. With go / come / return it works like に.",
    [["日本[にほん]へ行[い]きます。", "I’m going to Japan."]],
    ["Written へ, read <b>e</b>.",
     "Only for direction: you can’t say 7時[しちじ]へ or 友達[ともだち]へあげる. Before の, へ is fine and に isn’t: 母[はは]<b>への</b>手紙[てがみ] “a letter to Mum”."]],
  ["で", "Where an action happens; the means or tool; a reason; a total or limit.",
    [["図書館[としょかん]で勉強[べんきょう]します。", "I study at the library."],
     ["バスで行[い]きます。箸[はし]で食[た]べます。", "I go by bus. I eat with chopsticks."],
     ["風邪[かぜ]で休[やす]みました。", "I was off because of a cold."],
     ["三[みっ]つで500円[えん]です。", "Three for 500 yen."]],
    ["“Exists at” is に, “happens / is held at” is で: 公園[こうえん]<b>に</b>池[いけ]がある, but 公園[こうえん]<b>で</b>お祭[まつ]りがある.",
     "Walking is <i>by foot</i>: 歩[ある]いて行[い]く, not 足[あし]で行[い]く.",
     "Also the “in” of a superlative: 世界[せかい]<b>で</b>一番[いちばん]高[たか]い山[やま] “the highest mountain in the world”."]],
  ["と", "“And” in a complete list of nouns; “with” (together); quoting.",
    [["パンと卵[たまご]を買[か]いました。", "I bought bread and eggs (that’s all)."],
     ["友達[ともだち]と映画[えいが]を見[み]ました。", "I watched a film with a friend."],
     ["「はい」と言[い]いました。", "She said “yes”."]],
    ["Only joins nouns. To join adjectives or verbs use the て-form: 安[やす]<b>くて</b>おいしい, not 安[やす]いとおいしい.",
     "After a plain verb, と also means “whenever / if”: ボタンを押[お]す<b>と</b>開[あ]く “press the button and it opens”.",
     "Together vs one-way: 友達[ともだち]<b>と</b>会[あ]う (we meet up), 友達[ともだち]<b>に</b>会[あ]う (I meet / run into them). Same with 話[はな]す, 結婚[けっこん]する (と only)."]],
  ["や / か", "や: “and” in a list with more left out (“…and so on”, often with など). か: “or”.",
    [["パンや卵[たまご]などを買[か]いました。", "I bought bread, eggs and things."],
     ["お茶[ちゃ]かコーヒーを飲[の]みます。", "I drink tea or coffee."]],
    ["か at the end of a sentence makes a question; in plain speech it’s often dropped for a rising の: 行[い]く<b>の</b>?"]],
  ["も", "“Also / too”; with a number, “as many as”; with a question word and a negative, “none”.",
    [["私[わたし]も行[い]きます。", "I’m going too."],
     ["何[なに]も食[た]べませんでした。", "I didn’t eat anything."],
     ["3時間[さんじかん]も待[ま]ちました。", "I waited a whole three hours."]],
    ["Replaces は, が and を (私[わたし]<b>も</b>, not 私[わたし]はも); stacks on the others: に<b>も</b>, で<b>も</b>, から<b>も</b>.",
     "Question word + も + negative = no one / nothing / nowhere: 誰[だれ]<b>も</b>いない, どこ<b>へも</b>行[い]かない. With a positive, use か: 誰[だれ]<b>か</b>いる “someone is there”.",
     "Question word + でも = any at all: いつ<b>でも</b>, 何[なん]<b>でも</b>."]],
  ["の", "Links nouns (“of / ’s”); turns a clause into a noun; “one” instead of a noun.",
    [["私[わたし]の本[ほん]、日本語[にほんご]の先生[せんせい]", "my book, a Japanese teacher"],
     ["本[ほん]を読[よ]むのが好[す]きです。", "I like reading books."],
     ["赤[あか]いのをください。", "The red one, please."]],
    ["Not between an adjective and a noun: 大[おお]きい家[いえ], not 大[おお]きいの家[いえ]. な-adjectives take な: 静[しず]かな町[まち]. Some “adjectives” are nouns and take の: 病気[びょうき]の人[ひと], 本当[ほんとう]の話[はなし].",
     "の or こと? Sights and sounds you witness take の (歌[うた]っている<b>の</b>が聞[き]こえる); 〜ことができる, 〜ことがある, 趣味[しゅみ]は〜ことです take こと."]],
  ["から / まで / までに", "から: “from”, and “because” after a clause. まで: “until / as far as”. までに: “by (a deadline)”.",
    [["9時[くじ]から5時[ごじ]まで働[はたら]きます。", "I work from 9 to 5."],
     ["暑[あつ]いから窓[まど]を開[あ]けます。", "It’s hot, so I’ll open the window."],
     ["金曜日[きんようび]までに出[だ]してください。", "Please hand it in by Friday."]],
    ["まで = all the time up to; までに = at some point before: 5時[ごじ]まで待[ま]つ “wait until 5”, 5時[ごじ]までに帰[かえ]る “be back by 5”.",
     "から (reason) sounds like your own opinion; ので sounds more objective and polite, better for excuses: 電車[でんしゃ]が遅[おく]れた<b>ので</b>…. Before ので a noun or な-adjective takes な: 学生[がくせい]<b>なので</b>.",
     "Verb て-form + から = “after”: 食[た]べ<b>てから</b>出[で]かける. Plain form + から = “because”: 食[た]べた<b>から</b>…."]],
  ["より / ほど", "より: “than”. ほど + negative: “not as … as”.",
    [["電車[でんしゃ]はバスより速[はや]いです。", "Trains are faster than buses."],
     ["今日[きょう]は昨日[きのう]ほど寒[さむ]くないです。", "Today isn’t as cold as yesterday."]],
    ["Asking which: AとBとどちらが〜ですか — the answer: Aのほうが〜です."]],
  ["ね / よ / よね", "End of sentence. ね: “isn’t it?”, checking or sharing a feeling. よ: telling the listener something they don’t know. よね: “right?”, checking something you’re fairly sure of.",
    [["いい天気[てんき]ですね。", "Lovely weather, isn’t it."],
     ["あの店[みせ]は月曜日[げつようび]休[やす]みですよ。", "That shop is closed on Mondays, you know."]],
    ["Too much よ sounds pushy, especially to a superior; it’s ね that makes speech sound friendly."]],
];

// Verbs whose particle isn't what an English speaker expects.
const PARTICLE_VERBS = [
  ["電車[でんしゃ]<b>に</b>乗[の]る", "get on / ride a train", "not を"],
  ["電車[でんしゃ]<b>を</b>降[お]りる", "get off a train", "leaving: を"],
  ["友達[ともだち]<b>に</b>会[あ]う", "meet a friend", "not を"],
  ["部屋[へや]<b>に</b>入[はい]る", "enter a room", "not を"],
  ["部屋[へや]<b>を</b>出[で]る", "leave a room", "leaving: を"],
  ["椅子[いす]<b>に</b>座[すわ]る", "sit on a chair", "not の上で"],
  ["山[やま]<b>に</b>登[のぼ]る", "climb a mountain", "を for the path"],
  ["先生[せんせい]<b>に</b>聞[き]く", "ask the teacher", "を = the question"],
  ["母[はは]<b>に</b>電話[でんわ]する", "phone Mum", "not を"],
  ["父[ちち]<b>に</b>似[に]ている", "look like Dad", "always ている"],
  ["車[くるま]<b>に</b>気[き]をつける", "watch out for cars", ""],
  ["試験[しけん]<b>に</b>合格[ごうかく]する", "pass an exam", "also 試験に受かる"],
  ["試験[しけん]<b>を</b>受[う]ける", "take an exam", ""],
  ["仕事[しごと]<b>に</b>慣[な]れる", "get used to work", ""],
  ["質問[しつもん]<b>に</b>答[こた]える", "answer a question", "not を"],
  ["彼[かれ]<b>と</b>結婚[けっこん]する", "marry him", "not を"],
  ["道[みち]<b>を</b>渡[わた]る", "cross the road", "path: を"],
  ["日本[にほん]<b>に</b>住[す]む", "live in Japan", "usually 住んでいる"],
  ["テニス<b>を</b>する", "play tennis", "ピアノを弾く, ゲームをする"],
  ["風邪[かぜ]<b>を</b>ひく", "catch a cold", ""],
  ["写真[しゃしん]<b>を</b>撮[と]る", "take a photo", ""],
  ["シャワー<b>を</b>浴[あ]びる", "take a shower", "お風呂に入る"],
];

// "が, not を": the thing liked, wanted, understood…
const GA_WORDS = [
  ["好[す]き / 嫌[きら]い", "like / dislike", "猫[ねこ]<b>が</b>好[す]きです"],
  ["上手[じょうず] / 下手[へた] / 得意[とくい]", "good / bad at", "歌[うた]<b>が</b>上手[じょうず]です"],
  ["欲[ほ]しい", "want (a thing)", "車[くるま]<b>が</b>欲[ほ]しい"],
  ["分[わ]かる", "understand", "日本語[にほんご]<b>が</b>分[わ]かる"],
  ["できる / potential", "can", "漢字[かんじ]<b>が</b>読[よ]める (を also heard)"],
  ["ある / いる", "there is; have", "時間[じかん]<b>が</b>ある, 兄[あに]<b>が</b>いる"],
  ["要[い]る", "need", "お金[かね]<b>が</b>要[い]る"],
  ["見[み]える / 聞[き]こえる", "can be seen / heard", "富士山[ふじさん]<b>が</b>見[み]える"],
  ["〜たい", "want to", "水[みず]<b>が</b>/<b>を</b>飲[の]みたい (both fine)"],
];

const TE_FORMS = [
  ["う・つ・る", "っ て", "買[か]う → 買[か]って, 待[ま]つ → 待[ま]って, 帰[かえ]る → 帰[かえ]って"],
  ["む・ぶ・ぬ", "ん で", "読[よ]む → 読[よ]んで, 遊[あそ]ぶ → 遊[あそ]んで, 死[し]ぬ → 死[し]んで"],
  ["く", "い て", "書[か]く → 書[か]いて — but <b>行[い]く → 行[い]って</b>"],
  ["ぐ", "い で", "泳[およ]ぐ → 泳[およ]いで"],
  ["す", "し て", "話[はな]す → 話[はな]して"],
  ["る-verbs", "る → て", "食[た]べる → 食[た]べて, 見[み]る → 見[み]て"],
  ["irregular", "", "する → して, 来[く]る → 来[き]て"],
];

const PAIRS = [
  ["開[あ]く", "開[あ]ける", "open"],
  ["閉[し]まる", "閉[し]める", "close"],
  ["始[はじ]まる", "始[はじ]める", "begin"],
  ["終[お]わる", "終[お]える", "end"],
  ["止[と]まる", "止[と]める", "stop"],
  ["付[つ]く", "付[つ]ける", "turn on; attach"],
  ["消[き]える", "消[け]す", "go out; turn off"],
  ["入[はい]る", "入[い]れる", "go in; put in"],
  ["出[で]る", "出[だ]す", "come out; take out"],
  ["落[お]ちる", "落[お]とす", "fall; drop"],
  ["壊[こわ]れる", "壊[こわ]す", "break"],
  ["決[き]まる", "決[き]める", "be decided; decide"],
  ["変[か]わる", "変[か]える", "change"],
  ["集[あつ]まる", "集[あつ]める", "gather"],
  ["起[お]きる", "起[お]こす", "get up; wake someone"],
  ["並[なら]ぶ", "並[なら]べる", "line up"],
  ["届[とど]く", "届[とど]ける", "arrive; deliver"],
  ["見[み]つかる", "見[み]つける", "be found; find"],
];

const KEIGO = [
  ["行[い]く・来[く]る・いる", "いらっしゃる", "参[まい]る (行く・来る), おる (いる)"],
  ["言[い]う", "おっしゃる", "申[もう]す"],
  ["する", "なさる", "いたす"],
  ["食[た]べる・飲[の]む", "召[め]し上[あ]がる", "いただく"],
  ["見[み]る", "ご覧[らん]になる", "拝見[はいけん]する"],
  ["知[し]っている", "ご存[ぞん]じだ", "存[ぞん]じている"],
  ["くれる / もらう", "くださる", "いただく (もらう)"],
  ["会[あ]う", "お会[あ]いになる", "お目[め]にかかる"],
  ["聞[き]く・訪[たず]ねる", "お聞[き]きになる", "伺[うかが]う"],
];

const esc = (s) => s; // the content above is trusted, hand-written markup

function particleBlock([p, what, examples, notes]) {
  return `<section class="pt">
  <h3><span class="jp">${p}</span></h3>
  <p class="what">${ruby(what)}</p>
  <ul class="ex">${examples.map(([jp, en]) => `<li><span class="jp">${ruby(jp)}</span> <span class="en">${esc(en)}</span></li>`).join("")}</ul>
  <ul class="notes">${notes.map((n) => `<li>${ruby(n)}</li>`).join("")}</ul>
</section>`;
}

const table = (head, rows, cls = "") =>
  `<table class="${cls}"><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${ruby(c)}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;

const html = ruby(`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>${TITLE}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: A4; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1a1a1a; font-size: 8.4pt; line-height: 1.38; }
  .jp, ruby, td, .ex { font-family: 'IPAPGothic', 'IPAGothic', 'Noto Sans CJK JP', sans-serif; }
  rt { font-size: 52%; color: #555; }
  b { color: #b3261e; font-weight: 700; }
  h1 { font-size: 16pt; }
  .intro { font-size: 8.6pt; color: #555; margin: 1mm 0 3.5mm; }
  h2 { font-size: 11.5pt; margin: 3.5mm 0 2mm; padding: 1mm 2mm; background: #f3ece0; border-left: 1.2mm solid #b3261e; break-after: avoid; column-span: all; }
  .cols { column-count: 2; column-gap: 6mm; }
  .pt { break-inside: avoid; margin-bottom: 2.6mm; padding-bottom: 2mm; border-bottom: 0.25mm solid #e2dccf; }
  .pt h3 { font-size: 13pt; line-height: 1.1; display: inline; margin-right: 1.5mm; }
  .pt .what { display: inline; }
  .ex { list-style: none; margin: 1mm 0 0.8mm 2mm; }
  .ex li { margin: 0.4mm 0; }
  .ex .en { font-family: 'Segoe UI', system-ui, sans-serif; color: #555; font-size: 7.8pt; }
  .notes { margin-left: 4mm; font-size: 7.9pt; }
  .notes li { margin: 0.5mm 0; }
  .notes li::marker { color: #b3261e; content: "⚠ "; }
  .box { break-inside: avoid; border: 0.35mm solid #d8cfbf; border-radius: 1.5mm; padding: 2mm 2.5mm; margin-bottom: 3mm; background: #fcfaf6; }
  .box h4 { font-size: 9.5pt; margin-bottom: 1mm; }
  .box p { margin: 0.8mm 0; }
  .box ul { margin-left: 4mm; }
  .box li { margin: 0.4mm 0; }
  table { width: 100%; border-collapse: collapse; font-size: 7.9pt; margin-top: 1mm; }
  th { text-align: left; font-family: 'Segoe UI', system-ui, sans-serif; font-size: 7.4pt; color: #666; border-bottom: 0.35mm solid #bbb; padding: 0.6mm 1mm; }
  td { border-bottom: 0.2mm solid #e5e0d6; padding: 0.7mm 1mm; vertical-align: top; }
  tr { break-inside: avoid; }
  .page { break-before: page; }
  .two { display: flex; gap: 6mm; align-items: flex-start; }
  .two > div { flex: 1 1 0; min-width: 0; }
  .small { font-size: 7.6pt; color: #555; }
</style></head><body>
<h1>Particles &amp; verbs: a handy guide</h1>
<p class="intro">What each particle does, the exceptions that trip learners up (marked ⚠), and the verbs
to watch: groups, odd ones out, verb pairs and verbs that take an unexpected particle. N5–N3.
More at tokidoki.meertens.dev — the Particles quiz and the grammar cheatsheet.</p>

<h2>1 · The particles</h2>
<div class="cols">
${PARTICLES.map(particleBlock).join("\n")}
<div class="box">
  <h4>は or が? Four quick tests</h4>
  <ul>
    <li>Answering “who / which / what”: <span class="jp">が</span>. <span class="jp">${ruby("私[わたし]<b>が</b>やります。")}</span> “<i>I’ll</i> do it.”</li>
    <li>Something new you just noticed or report: <span class="jp">が</span>. <span class="jp">${ruby("あ、バス<b>が</b>来[き]た！")}</span></li>
    <li>Talking <i>about</i> something already known, or a general fact: <span class="jp">は</span>. <span class="jp">${ruby("象[ぞう]<b>は</b>鼻[はな]<b>が</b>長[なが]い。")}</span> “Elephants: their trunks are long.”</li>
    <li>Inside a describing clause or after a “when / if / because” clause: <span class="jp">が</span>. <span class="jp">${ruby("雨[あめ]<b>が</b>降[ふ]ったら…")}</span></li>
  </ul>
</div>
</div>

<h2 class="page">2 · Verbs: which particle, and polite forms</h2>
<div class="two"><div>
<div class="box">
  <h4>に or で for a place?</h4>
  <p><span class="jp">に</span> = where something <i>is</i> or where you <i>end up</i>; <span class="jp">で</span> = where an action <i>takes place</i>.</p>
  ${table(["に", "で"], [
    ["東京[とうきょう]<b>に</b>住[す]んでいる", "東京[とうきょう]<b>で</b>働[はたら]いている"],
    ["机[つくえ]の上[うえ]<b>に</b>ある", "机[つくえ]の上[うえ]<b>で</b>書[か]く"],
    ["ここ<b>に</b>座[すわ]って / 置[お]いて", "ここ<b>で</b>待[ま]って"],
    ["ホテル<b>に</b>泊[と]まる", "ホテル<b>で</b>食[た]べる"],
  ])}
  <p class="small">⚠ Events (parties, meetings, accidents) “are” with で: 会議[かいぎ]は3階[さんがい]<b>で</b>あります.</p>
</div>
<div class="box">
  <h4>が, not を: likes, wants, skills, needs</h4>
  <p>These describe a state, not an action, so the “object” is marked with <span class="jp">が</span>.</p>
  ${table(["word", "meaning", "example"], GA_WORDS)}
</div>
<div class="box">
  <h4>Polite verbs (keigo) with their own words</h4>
  ${table(["verb", "respectful (them)", "humble (me)"], KEIGO)}
  <p class="small">Others: お / ご + stem + になる (お待[ま]ちになる) to respect, お / ご + stem + する (お持[も]ちします) to be humble.</p>
</div>
</div><div>
<div class="box">
  <h4>Verbs with a surprising particle</h4>
  ${table(["Japanese", "English", "note"], PARTICLE_VERBS.map(([a, b, c]) => [a, b, c]))}
</div>
<div class="box">
  <h4>Giving and receiving</h4>
  ${table(["verb", "direction", "example"], [
    ["あげる", "I / my side → others", "私[わたし]は妹[いもうと]<b>に</b>本[ほん]をあげた"],
    ["くれる", "others → me / my side", "友達[ともだち]<b>が</b>(私[わたし]に)本[ほん]をくれた"],
    ["もらう", "I receive from someone", "私[わたし]は友達[ともだち]<b>に</b>/<b>から</b>本[ほん]をもらった"],
  ])}
  <p class="small">⚠ Never あげる towards yourself: 友達[ともだち]が私[わたし]にあげた is wrong — use くれた. The same verbs after a て-form give and receive favours: 母[はは]が作[つく]って<b>くれた</b> “Mum made it for me”. Upwards: さしあげる / くださる / いただく.</p>
</div>
<div class="box">
  <h4>いる or ある?</h4>
  <p><span class="jp">いる</span> for people and animals, <span class="jp">ある</span> for things, plants and events. 子供[こども]<b>が</b>二人[ふたり]いる “I have two children”; 明日[あした]テスト<b>が</b>ある “there’s a test tomorrow”. ⚠ A taxi or bus with a driver, waiting: タクシーがいる is fine.</p>
</div>
</div></div>

<h2 class="page">3 · Verb forms to pay attention to</h2>
<div class="two"><div>
<div class="box">
  <h4>Groups: る-verbs and う-verbs</h4>
  <p><b style="color:inherit">る-verbs</b> (ichidan) end in <span class="jp">-iる / -eる</span>: 食[た]べる → 食[た]べます, 食[た]べない. Everything else is an <b style="color:inherit">う-verb</b> (godan): 書[か]く → 書[か]きます, 書[か]かない.</p>
  <p>⚠ These end in -iる / -eる but are <b>う-verbs</b> — ます-form ります, て-form って:</p>
  <p class="jp">${ruby("帰[かえ]る　入[はい]る　走[はし]る　知[し]る　切[き]る　要[い]る　限[かぎ]る　減[へ]る　喋[しゃべ]る　滑[すべ]る　蹴[け]る　照[て]る　握[にぎ]る　参[まい]る　焦[あせ]る　混[ま]じる")}</p>
  <p class="small">帰[かえ]る → 帰[かえ]ります, 帰[かえ]って, 帰[かえ]らない (not 帰[かえ]ない). Same-sound pairs: 着[き]る “wear” is a る-verb (着[き]て), 切[き]る “cut” a う-verb (切[き]って); 変[か]える “change” vs 帰[かえ]る “go home”.</p>
</div>
<div class="box">
  <h4>The irregulars</h4>
  ${table(["verb", "ない", "ます", "て / た", "potential"], [
    ["する", "しない", "します", "して / した", "できる"],
    ["来[く]る", "来[こ]ない", "来[き]ます", "来[き]て / 来[き]た", "来[こ]られる"],
  ])}
  <ul>
    <li>行[い]く: て / た-form 行[い]<b>って</b> / 行[い]<b>った</b> (not 行[い]いて).</li>
    <li>ある: negative is just <b>ない</b> (not あらない).</li>
    <li>-う verbs: negative <b>-わない</b>: 買[か]う → 買[か]<b>わ</b>ない, 言[い]う → 言[い]<b>わ</b>ない.</li>
    <li>いらっしゃる, おっしゃる, くださる, なさる, ござる: ます-form <b>-います</b> (いらっしゃ<b>い</b>ます), command <b>-い</b> (ください).</li>
    <li>Noun + する (勉強[べんきょう]する, 電話[でんわ]する) conjugates like する.</li>
  </ul>
</div>
<div class="box">
  <h4>て-form at a glance (う-verbs)</h4>
  ${table(["ending", "becomes", "examples"], TE_FORMS)}
  <p class="small">た-form: the same with た / だ (読[よ]んだ, 泳[およ]いだ). Also たら, たり, ている, てください.</p>
</div>
<div class="box">
  <h4>〜ている: “doing now” or “in that state”</h4>
  <p>With an action verb it’s ongoing: 食[た]べている “is eating”. With a verb of change it’s the result: 結婚[けっこん]している “is married”, 死[し]んでいる “is dead”, 来[き]ている “is here (has come)”, 窓[まど]が開[あ]いている “the window is open”.</p>
  <p>⚠ Always ている in the positive: 知[し]っている, 住[す]んでいる, 持[も]っている, 似[に]ている, 太[ふと]っている / 痩[や]せている (“is fat / thin”). But “don’t know” is 知[し]<b>らない</b> / 知[し]<b>りません</b>, not 知[し]っていない.</p>
  <p>⚠ 分[わ]かる, ある, いる, できる are already states: 分[わ]かります, not 分[わ]かっています, for “I understand”.</p>
</div>
</div><div>
<div class="box">
  <h4>Verb pairs: it happens (が) vs someone does it (を)</h4>
  ${table(["it happens (が)", "someone does it (を)", "meaning"], PAIRS)}
  <p>ドア<b>が</b>開[あ]く “the door opens” · ドア<b>を</b>開[あ]ける “I open the door”.</p>
  <p>⚠ The result: 開[あ]い<b>ている</b> “it’s open” (just is) vs 開[あ]け<b>てある</b> “it’s been left open (on purpose)”. てある takes the “someone does it” verb with が.</p>
</div>
<div class="box">
  <h4>Potential: “can do”</h4>
  <ul>
    <li>る-verbs: る → <b>られる</b> (食[た]べられる). In speech often 食[た]べれる — fine to hear, avoid in writing.</li>
    <li>う-verbs: last sound to the え-row + る: 書[か]く → 書[か]ける, 話[はな]す → 話[はな]せる, 買[か]う → 買[か]える.</li>
    <li>する → <b>できる</b>, 来[く]る → <b>来[こ]られる</b>. All potentials are る-verbs.</li>
    <li>⚠ Already “can”: 分[わ]かる, 見[み]える, 聞[き]こえる, できる — no extra potential. 見[み]られる = “able to see (get a chance)”, 見[み]える = “visible”.</li>
    <li>る-verb potential looks the same as the passive (食[た]べられる): context tells.</li>
  </ul>
</div>
</div></div>
</body></html>`);

const htmlArg = process.argv.indexOf("--html");
if (htmlArg !== -1) await writeFile(process.argv[htmlArg + 1], html);

await mkdir(path.dirname(OUT), { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });
  await page.pdf({
    path: OUT,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:8px; width:100%; padding:0 10mm; color:#888;">${TITLE}</div>`,
    footerTemplate: `<div style="font-size:8px; width:100%; padding:0 10mm; color:#888; display:flex; justify-content:flex-end;"><span class="pageNumber"></span>&nbsp;/&nbsp;<span class="totalPages"></span></div>`,
    margin: { top: "14mm", bottom: "12mm", left: "12mm", right: "12mm" },
  });
  console.log(`-> ${path.relative(ROOT, OUT)}`);
} finally {
  await browser.close();
}
