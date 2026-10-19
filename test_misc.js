// Checks for misc.js: every quiz is well formed and the answer matching
// accepts kana, kanji and romaji but nothing else.
const Misc = require('./misc.js');

let passed = 0;
let failed = 0;
function check(ok, message) {
  if (ok) passed++;
  else { failed++; console.log(`  FAIL: ${message}`); }
}

// ─── Data ────────────────────────────────────────────────────────────────────

const ids = new Set();
Misc.QUIZZES.forEach(q => {
  check(q.id && !ids.has(q.id), `${q.id}: id missing or repeated`);
  ids.add(q.id);
  check(q.title && q.desc && q.glyph, `${q.id}: missing title, description or glyph`);
  q.sections.forEach((sec, si) => {
    check(['find', 'fill'].includes(sec.type), `${q.id}#${si}: unknown type ${sec.type}`);
    check(sec.items.length > 0, `${q.id}#${si}: no items`);
    sec.items.forEach((it, i) => {
      if (sec.type === 'find') {
        check(it.cells.length === sec.columns.length, `${q.id}#${si}.${i}: cells don't match columns`);
        // Every hidden answer can be named on its own.
        const typed = it.accept[0];
        check(Misc.matchItems(sec, typed).includes(i), `${q.id}#${si}.${i}: "${typed}" isn't accepted`);
      } else {
        check(it.prompt && it.answer, `${q.id}#${si}.${i}: missing prompt or answer`);
        check(Misc.matchItems({ items: [it] }, it.answer).length === 1, `${q.id}#${si}.${i}: its own answer isn't accepted`);
      }
    });
  });
});

// ─── RU-verb lookalikes ────────────────────────────────────────────────────

const ru = Misc.QUIZZES.find(q => q.id === 'ru-exceptions').sections[0];
check(Misc.RU_EXCEPTIONS.length === 8, `expected the 8 Genki exceptions, got ${Misc.RU_EXCEPTIONS.length}`);
['帰る', '入る', '知る', '要る', '切る', 'しゃべる', '参る', '走る'].forEach(v =>
  check(Misc.RU_EXCEPTIONS.some(e => e.kanji === v), `${v} missing from the exceptions`));
check(Misc.matchItems(ru, 'kaeru').length === 1, 'romaji kaeru names 帰る');
check(Misc.matchItems(ru, 'カエル').length === 1, 'katakana カエル names 帰る');
check(Misc.matchItems(ru, ' はいる ').length === 1, 'spaces are ignored');
check(Misc.matchItems(ru, 'たべる').length === 0, 'たべる is not an exception');
check(/RU-verb/.test(ru.miss('たべる')), 'typing a RU-verb says so');
const kaeru = Misc.matchItems(ru, 'かえる')[0];
check(Misc.matchItems(ru, 'かえる', new Set([kaeru])).length === 0, 'a found answer is not found again');

// ─── な-adjectives ending in い ──────────────────────────────────────────────

const na = Misc.QUIZZES.find(q => q.id === 'na-ei').sections[0];
check(Misc.matchItems(na, 'yuumei').length === 1, 'romaji yuumei names 有名');
check(Misc.matchItems(na, '綺麗').length === 1, '綺麗 names きれい');
check(Misc.matchItems(na, 'たかい').length === 0, 'たかい is not a な-adjective');
check(/い-adjective/.test(na.miss('たかい')), 'typing an い-adjective says so');

// ─── Ways to say "but" ───────────────────────────────────────────────────────

const but = Misc.QUIZZES.find(q => q.id === 'but').sections[0];
check(but.items.length === 10, `expected 10 ways to say "but", got ${but.items.length}`);
check(Misc.matchItems(but, 'kedo').length === 1, 'romaji kedo names けど');
check(Misc.matchItems(but, 'ga').length === 1, 'romaji ga names が');
check(Misc.matchItems(but, 'ケレドモ').length === 1, 'katakana ケレドモ names けれども');
check(Misc.matchItems(but, 'それでも').length === 1 && Misc.matchItems(but, 'でも').length === 1, 'でも and それでも are separate');
check(Misc.matchItems(but, 'だから').length === 0, 'だから is not "but"');
check(/therefore/.test(but.miss('だから')), 'typing だから says what it means');
check(but.miss('ねこ') === '', 'no hint for unrelated words');

// ─── Counters ────────────────────────────────────────────────────────────────

const counters = { items: Misc.QUIZZES.find(q => q.id === 'counters').sections.flatMap(sec => sec.items) };
check(counters.items.length === 100, `expected 100 counters, got ${counters.items.length}`);
check(Misc.QUIZZES.find(q => q.id === 'counters').sections.length === 1, 'counters are one list');
const counterFor = p => ({ items: [counters.items.find(it => it.prompt.startsWith(p))] });
check(Misc.matchItems(counterFor('long thin'), 'hon').length === 1, 'romaji hon names 本');
check(Misc.matchItems(counterFor('long thin'), '本').length === 1, 'kanji 本');
check(Misc.matchItems(counterFor('long thin'), 'まい').length === 0, 'まい is not for long things');
check(Misc.matchItems(counterFor('months (how long)'), 'ヶ月').length === 1, 'ヶ月 spelling');
check(Misc.matchItems(counterFor('countries'), 'kakoku').length === 1, 'romaji kakoku');
check(Misc.matchItems(counterFor('pages'), 'ページ').length === 1, 'katakana ページ');
check(Misc.matchItems(counterFor('pages'), 'pe-ji').length === 1, 'romaji pe-ji');
check(new Set(counters.items.map(it => it.accept[0])).size === 100, 'no counter is listed twice');

// ─── Te-form endings ─────────────────────────────────────────────────────────

const te = Misc.QUIZZES.find(q => q.id === 'te-form').sections[0];
const teFor = k => ({ items: [te.items.find(it => it.prompt.startsWith('〜' + k))] });
check(Misc.matchItems(teFor('す'), 'shite').length === 1, 'romaji shite for す');
check(Misc.matchItems(teFor('う'), '買って').length === 1, 'the example verb in full counts');
check(Misc.matchItems(teFor('く'), 'って').length === 0, 'く does not become って');
check(Misc.matchItems(teFor('む'), 'nde').length === 1, 'romaji nde for む');
check(Misc.total(Misc.QUIZZES.find(q => q.id === 'te-form')) === 13, 'te-form has 9 endings + 4 others');

// ─── Fill answers ────────────────────────────────────────────────────────────

const dates = Misc.QUIZZES.find(q => q.id === 'dates').sections[0];
check(Misc.matchItems({ items: [dates.items[0]] }, 'tsuitachi').length === 1, 'romaji tsuitachi');
check(Misc.matchItems({ items: [dates.items[0]] }, 'いちにち').length === 0, 'いちにち is not the 1st');

// ─── Keigo ───────────────────────────────────────────────────────────────────

const keigo = Misc.QUIZZES.find(q => q.id === 'keigo').sections;
const keigoFor = (si, p) => ({ items: [keigo[si].items.find(it => it.prompt.startsWith(p + ' '))] });
check(Misc.matchItems(keigoFor(0, '食べる'), 'meshiagaru').length === 1, 'romaji meshiagaru');
check(Misc.matchItems(keigoFor(0, '食べる'), '召し上がる').length === 1, 'kanji 召し上がる');
check(Misc.matchItems(keigoFor(0, '食べる'), 'いただく').length === 0, 'humble いただく is not the honorific');
check(Misc.matchItems(keigoFor(1, '食べる'), 'itadaku').length === 1, 'humble itadaku');
check(Misc.matchItems(keigoFor(1, '行く'), 'うかがう').length === 1, 'うかがう for humble 行く');
check(Misc.matchItems(keigoFor(0, '言う'), 'ossharu').length === 1, 'romaji ossharu');

check(Misc.rubyHtml('召[め]し上[あ]がる') === '<ruby>召<rt>め</rt></ruby>し<ruby>上<rt>あ</rt></ruby>がる', 'furigana markup');
check(Misc.rubyKana('ご覧[らん]になる') === 'ごらんになる' && Misc.rubyPlain('ご覧[らん]になる') === 'ご覧になる', 'kana and plain forms');
keigo.forEach((sec, si) => sec.items.forEach(it => {
  check(!/[[\]]/.test(it.prompt + it.answer + it.card.word + it.card.kana), `keigo ${si}: markup left in ${it.prompt}`);
  check(!/[一-鿿]/.test(it.card.kana), `keigo ${si}: ${it.card.word} has no full reading`);
}));
const itadaku = keigo[1].items.find(it => it.answer === 'いただく').card;
check(/eat.*drink.*receive/.test(itadaku.meaning), 'いただく card lists every verb it stands for');

// ─── Bunkei patterns ─────────────────────────────────────────────────────────

global.Conjugator = require('./conjugator.js');
require('./examples.js');
const Bunkei = require('./bunkei-data.js');
const { GENKI_VERBS } = require('./verbs.js');
const bunkei = Misc.QUIZZES.find(q => q.id === 'bunkei').sections;
const bunkeiRows = bunkei.flatMap(sec => sec.items.map(it => ({ ...it, level: sec.label })));
// Same patterns, levels and forms as the Bunkei drill, in the same order.
check(bunkeiRows.map(it => it.id).join() === Bunkei.PATTERNS.map(p => p.id).join(), 'bunkei: patterns differ from bunkei-data.js');
Bunkei.PATTERNS.forEach(p => {
  const it = bunkeiRows.find(r => r.id === p.id);
  if (!it) return;
  check(it.level === p.level, `bunkei ${p.id}: level ${it.level}, drill says ${p.level}`);
  check(it.answer === p.name.replace(/^\w+ /, ''), `bunkei ${p.id}: form ${it.answer}, drill says ${p.name}`);
  check(it.prompt.startsWith(p.meaning + ' '), `bunkei ${p.id}: meaning differs from the drill's "${p.meaning}"`);
  // The example is what the drill builds for that verb.
  const verb = GENKI_VERBS.find(v => v.kanji === it.prompt.match(/\(([^()]+)\)$/)[1] && !v.disambig);
  const built = Bunkei.build(verb, p.id);
  const example = it.accept[2];
  check(built && built.plain.includes(example), `bunkei ${p.id}: drill sentence "${built && built.plain}" doesn't contain ${example}`);
});
const bunkeiFor = id => ({ items: [bunkeiRows.find(it => it.id === id)] });
check(Misc.matchItems(bunkeiFor('sasete-kudasai'), 'させてください').length === 1, 'bunkei: the ending counts');
check(Misc.matchItems(bunkeiFor('sasete-kudasai'), 'tabesasetekudasai').length === 1, 'bunkei: the whole example in romaji counts');
check(Misc.matchItems(bunkeiFor('sasete-kudasai'), 'てください').length === 0, 'bunkei: てください is not "please let me"');
check(Misc.matchItems(bunkeiFor('hou-ga-ii'), 'たほうがいいです').length === 1, 'bunkei: kana for 方');
check(Misc.matchItems(bunkeiFor('potential'), 'られます').length === 1, 'bunkei: られます without the brackets');
check(Misc.matchItems(bunkeiFor('volitional-to-omou'), 'ようとおもっています').length === 1, 'bunkei: kana for 思って');
check(Misc.matchItems(bunkeiFor('te-kureru'), '作ってくれました').length === 1, 'bunkei: favours use 作る');

// ─── Shuffle ─────────────────────────────────────────────────────────────────

const mixed = Misc.shuffled(9);
check(mixed.length === 9 && [...mixed].sort((a, b) => a - b).every((v, i) => v === i), 'shuffled is a permutation');
check(Misc.shuffled(5, () => 0).join('') === '12340', 'shuffled follows its random source');

// ─── Best scores ─────────────────────────────────────────────────────────────

check(Misc.better(undefined, { score: 1, time: 9 }), 'first result is best');
check(Misc.better({ score: 5, time: 60 }, { score: 6, time: 99 }), 'higher score wins');
check(!Misc.better({ score: 6, time: 60 }, { score: 6, time: 70 }), 'slower same score loses');
check(Misc.formatTime(75) === '1:15', 'formatTime');

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
