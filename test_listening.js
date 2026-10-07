// Checks for the JLPT-style listening practice (listening-data.js /
// listening.js): every kanji has furigana, each part has the right number of
// choices with a valid answer, every picture can be drawn, and the spoken
// script follows the test's order (number, question, conversation, question).
global.window = global;
const { SECTIONS } = require('./listening-data.js');
const L = require('./listening.js');

let passed = 0;
let failed = 0;
function ok(cond, label) {
  if (cond) passed++;
  else { failed++; console.log('  FAIL: ' + label); }
}

const BARE_KANJI = /[㐀-䶿一-鿿々〆ヶ]/;
const bare = markup => L.pieces(markup).filter(p => !p.r).map(p => p.t).join('');
function furigana(text, where) {
  ok(typeof text === 'string' && text.length > 0, `${where}: missing text`);
  ok(!BARE_KANJI.test(bare(text)), `${where}: kanji without furigana in ${JSON.stringify(text)}`);
  ok(!/\[[^\]]*$|^[^\[]*\]/.test(text), `${where}: unbalanced brackets in ${JSON.stringify(text)}`);
  ok(!/[\[\]]/.test(L.plain(text)), `${where}: brackets left in the spoken text`);
}

// Markup helpers
ok(L.plain('男[おとこ]の人[ひと]が 話[はな]しています。') === '男の人が話しています。', 'plain drops readings and spaces');
ok(L.rubyHtml('水[みず]') === '<ruby>水<rt>みず</rt></ruby>', 'rubyHtml');
ok(L.questionOf({ intro: 'AAA。BBBですか。' }) === 'BBBですか。', 'questionOf takes the last sentence');

ok(SECTIONS.map(s => s.num).join() === '1,2,3,4', 'four parts, numbered 1–4');
const ids = new Set();
const VOICES = new Set(['M', 'F']);

for (const section of SECTIONS) {
  furigana(section.ja, section.id);
  ok(['pictures', 'spoken'].includes(section.kind), `${section.id}: kind`);
  ok(section.items.length >= 3, `${section.id}: at least three questions`);
  const answers = new Set();

  for (const item of section.items) {
    const where = `${section.id}/${item.id}`;
    ok(!ids.has(item.id), `${where}: duplicate id`);
    ids.add(item.id);
    ok(typeof item.why === 'string' && item.why.length > 10, `${where}: explanation`);
    answers.add(item.answer);
    if (item.intro) furigana(item.intro, `${where} intro`);
    if (item.sayIntro) ok(!/[\[\]]/.test(item.sayIntro), `${where}: sayIntro is plain text`);
    (item.lines || []).forEach((l, i) => {
      furigana(l.ja, `${where} line ${i}`);
      ok(VOICES.has(l.who), `${where} line ${i}: speaker is M or F`);
      ok(typeof l.en === 'string' && l.en.length > 0, `${where} line ${i}: English`);
    });

    if (section.kind === 'pictures') {
      ok(!!item.intro && item.lines.length >= 2, `${where}: a question and a conversation`);
      ok(/か。$/.test(L.questionOf(item)), `${where}: the intro ends with a question`);
      ok(item.choices.length === 4, `${where}: four pictures`);
      item.choices.forEach((c, i) => {
        ok(c.type in L.PICTURES, `${where} choice ${i}: picture type ${c.type}`);
        ok(L.pictureHtml(c).length > 20, `${where} choice ${i}: draws`);
      });
      const drawn = item.choices.map(L.pictureHtml);
      ok(new Set(drawn).size === 4, `${where}: the four pictures differ`);
    } else {
      ok(item.choices.length === 3, `${where}: three spoken replies`);
      ok(VOICES.has(item.replyBy || 'M'), `${where}: replyBy`);
      item.choices.forEach((c, i) => {
        furigana(c.ja, `${where} choice ${i}`);
        ok(typeof c.en === 'string' && c.en.length > 0, `${where} choice ${i}: English`);
      });
      if (item.picture) {
        ok(['left', 'right'].includes(item.picture.arrow), `${where}: arrow side`);
        ok(L.sceneHtml(item.picture).includes('lis-arrow'), `${where}: scene draws an arrow`);
      }
      ok(!!item.intro || (item.lines || []).length > 0, `${where}: something to respond to`);
    }
    ok(Number.isInteger(item.answer) && item.answer >= 0 && item.answer < item.choices.length, `${where}: answer in range`);

    // The script plays in the test's order.
    const script = L.buildScript(section, item, 1);
    ok(script[0].voice === 'N' && script[0].text === '1番。', `${where}: starts with the number`);
    ok(script.every(s => s.text && !/[\[\]]/.test(s.text)), `${where}: every step has plain text`);
    if (section.kind === 'pictures') {
      ok(script[1].line === 'intro', `${where}: question before the conversation`);
      ok(script[script.length - 1].line === 'question', `${where}: question again at the end`);
      ok(script.length === item.lines.length + 3, `${where}: one step per line`);
    } else {
      const spoken = script.filter(s => /^choice/.test(s.line));
      ok(spoken.length === item.choices.length * 2, `${where}: each reply numbered and spoken`);
      ok(script[script.length - 1].line === 'choice' + (item.choices.length - 1), `${where}: ends on the last reply`);
    }
  }
  ok(answers.size > 1, `${section.id}: the answers aren't all the same number`);
}

// Pictures that carry the answer
const cal = L.pictureHtml({ type: 'calendar', mark: 15 });
ok((cal.match(/lis-mark/g) || []).length === 1, 'calendar circles one day');
ok(/<text x="132" y="53" class="lis-cal-day lis-sat">15<\/text>/.test(cal), 'calendar: the 15th is a Saturday');
ok(/<text x="112" y="53" class="lis-cal-day">14<\/text>/.test(cal), 'calendar: the 14th is a Friday');
for (const at of Object.keys(L.MAP_SPOTS)) {
  ok((L.pictureHtml({ type: 'map', at }).match(/★/g) || []).length === 1, `map: one star at ${at}`);
}
ok(L.pictureHtml({ type: 'clock', h: 10, m: 15 }) !== L.pictureHtml({ type: 'clock', h: 10, m: 30 }), 'clocks differ by time');
ok((L.pictureHtml({ type: 'items', items: [['🍎', 3], ['🍊', 2]] }).match(/<span>/g) || []).length === 5, 'items repeat by count');

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
