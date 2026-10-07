// Checks for the JLPT-style listening practice (listening-data.js,
// listening.js, listening-art.js, listening-audio.js): every kanji has
// furigana, each part has the right number of choices with a valid answer,
// every picture can be drawn, the spoken script follows the test's order
// (number, question, conversation, question), and every question has a
// recording made from its current script.
global.window = global;
const fs = require('fs');
const path = require('path');
const { SECTIONS } = require('./listening-data.js');
const L = require('./listening.js');
const Art = require('./listening-art.js');
require('./listening-audio.js');
const RECORDINGS = global.LISTENING_AUDIO;

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
  ok(!/[\[\]]/.test(L.plain(text)), `${where}: brackets left in the plain text`);
}

// Markup helpers
ok(L.plain('男[おとこ]の人[ひと]が 話[はな]しています。') === '男の人が話しています。', 'plain drops readings and spaces');
ok(L.reading('男[おとこ]の 人[ひと]') === 'おとこのひと', 'reading uses the furigana');
ok(L.speech('何[なに]で 来[き]ましたか') === 'なにで来ましたか', 'speech says 何 from its furigana');
ok(L.rubyHtml('水[みず]') === '<ruby>水<rt>みず</rt></ruby>', 'rubyHtml');
ok(L.questionOf({ intro: 'AAA。BBBですか。' }) === 'BBBですか。', 'questionOf takes the last sentence');

ok(SECTIONS.map(s => s.num).join() === '1,2,3,4', 'four parts, numbered 1–4');
const ids = new Set();
const VOICES = new Set(['M', 'F']);
const ICON_TYPES = { items: p => p.items.map(([n]) => n), weather: p => [p.am, p.pm] };

for (const section of SECTIONS) {
  furigana(section.ja, section.id);
  ok(['pictures', 'spoken'].includes(section.kind), `${section.id}: kind`);
  ok(section.items.length >= 10, `${section.id}: at least ten questions`);
  const answers = new Set();

  section.items.forEach((item, index) => {
    const where = `${section.id}/${item.id}`;
    ok(!ids.has(item.id), `${where}: duplicate id`);
    ids.add(item.id);
    ok(['N5', 'N4'].includes(item.level), `${where}: level is N5 or N4`);
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
        ok(c.type in Art.PICTURES, `${where} choice ${i}: picture type ${c.type}`);
        (ICON_TYPES[c.type] ? ICON_TYPES[c.type](c) : []).forEach(n => ok(n in Art.ICONS, `${where} choice ${i}: icon ${n}`));
        ok(Art.picture(c).length > 20, `${where} choice ${i}: draws`);
      });
      ok(new Set(item.choices.map(Art.picture)).size === 4, `${where}: the four pictures differ`);
    } else {
      ok(item.choices.length === 3, `${where}: three spoken replies`);
      ok(VOICES.has(item.replyBy || 'M'), `${where}: replyBy`);
      item.choices.forEach((c, i) => {
        furigana(c.ja, `${where} choice ${i}`);
        ok(typeof c.en === 'string' && c.en.length > 0, `${where} choice ${i}: English`);
      });
      if (item.scene) {
        ok(['left', 'right'].includes(item.scene.arrow), `${where}: arrow side`);
        ok(item.scene.left in Art.ROLES && item.scene.right in Art.ROLES, `${where}: scene roles`);
        ok(item.scene.prop in Art.ICONS, `${where}: scene prop`);
        ok(Art.scene(item.scene).includes('lis-art-arrow'), `${where}: scene draws an arrow`);
      }
      ok(!!item.intro || (item.lines || []).length > 0, `${where}: something to respond to`);
    }
    ok(Number.isInteger(item.answer) && item.answer >= 0 && item.answer < item.choices.length, `${where}: answer in range`);

    // The script plays in the test's order.
    const script = L.buildScript(section, item, index + 1);
    ok(script[0].voice === 'N' && script[0].text === `${index + 1}番。`, `${where}: starts with the number`);
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

    // The recording exists and was made from this script.
    const rec = RECORDINGS[L.audioKey(section, item)];
    ok(!!rec, `${where}: has a recording (run scripts/generate_listening_audio.py)`);
    if (rec) {
      ok(rec.hash === L.scriptHash(script), `${where}: recording is out of date (run scripts/generate_listening_audio.py)`);
      ok(fs.existsSync(path.join(__dirname, rec.src)), `${where}: ${rec.src} exists`);
      ok(rec.steps.length === script.length, `${where}: a time for every step`);
      ok(rec.steps.every(([a, b], i) => b > a && (i === 0 || a >= rec.steps[i - 1][1])), `${where}: step times run in order`);
    }
  });
  ok(answers.size > 2, `${section.id}: the answers are spread over the numbers`);
}
ok(Object.keys(RECORDINGS).length === ids.size, 'no recordings for questions that no longer exist');

// Pictures that carry the answer
const cal = Art.picture({ type: 'calendar', mark: 15 });
ok((cal.match(/<circle/g) || []).length === 1, 'calendar circles one day');
ok(/<text x="133" y="60" fill="#5b8fd6"[^>]*>15<\/text>/.test(cal), 'calendar: the 15th is a Saturday');
ok(/<text x="113" y="60" fill="#2b2320"[^>]*>14<\/text>/.test(cal), 'calendar: the 14th is a Friday');
for (const at of Object.keys(Art.MAP_SPOTS)) ok((Art.picture({ type: 'map', at }).match(/★/g) || []).length === 1, `map: one star at ${at}`);
for (const at of Object.keys(Art.ROOM_SPOTS)) ok((Art.picture({ type: 'room', at }).match(/★/g) || []).length === 1, `room: one star at ${at}`);
ok((Art.picture({ type: 'floor', floor: 5 }).match(/★/g) || []).length === 1, 'floor: one floor starred');
ok((Art.picture({ type: 'week', days: [2, 5] }).match(/<circle/g) || []).length === 2, 'week: two days circled');
ok(Art.picture({ type: 'clock', h: 10, m: 15 }) !== Art.picture({ type: 'clock', h: 10, m: 30 }), 'clocks differ by time');
ok((Art.picture({ type: 'items', items: [['apple', 3], ['mandarin', 2]] }).match(/<svg/g) || []).length === 5, 'items repeat by count');
ok((Art.picture({ type: 'people', n: 5 }).match(/<svg/g) || []).length === 5, 'people draws n people');

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
