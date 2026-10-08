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
require('./listening-data-2.js');
require('./listening-data-3.js');
require('./listening-data-4.js');
require('./listening-data-5.js');
require('./listening-data-6.js');
require('./listening-data-7.js');
require('./listening-data-8.js');
require('./listening-data-9.js');
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

ok(SECTIONS.map(s => s.id).join() === 'kadai,point,gaiyou,hatsuwa,sokuji', 'five kinds of part');
ok(['N5', 'N4'].every(lv => ['kadai', 'point', 'hatsuwa', 'sokuji'].map(id => L.partNum(SECTIONS.find(s => s.id === id), lv)).join() === '1,2,3,4'), 'N5/N4: parts numbered 1–4');
ok(SECTIONS.map(s => L.partNum(s, 'N3')).join() === '1,2,3,4,5', 'N3: parts numbered 1–5');
ok(['kadai', 'point', 'gaiyou', 'sokuji'].map(id => L.partNum(SECTIONS.find(s => s.id === id), 'N2')).join() === '1,2,3,4', 'N2: parts numbered 1–4, no 発話表現');
const ids = new Set();
const VOICES = new Set(['M', 'F']);
const ICON_TYPES = { items: p => p.items.map(([n]) => (typeof n === 'string' ? n : n.name)), weather: p => [p.am, p.pm] };

for (const section of SECTIONS) {
  furigana(section.ja, section.id);
  ok(['pictures', 'spoken', 'summary'].includes(section.kind), `${section.id}: kind`);
  ok(section.items.length >= (section.kind === 'summary' ? 12 : 30), `${section.id}: enough questions (${section.items.length})`);
  const answers = {};

  section.items.forEach((item, index) => {
    const where = `${section.id}/${item.id}`;
    ok(!ids.has(item.id), `${where}: duplicate id`);
    ids.add(item.id);
    ok(L.LEVELS.includes(item.level), `${where}: level is one of ${L.LEVELS.join()}`);
    ok(L.TEST_LAYOUT[item.level][section.id] > 0, `${where}: ${item.level} has a ${section.id} part`);
    ok(typeof item.why === 'string' && item.why.length > 10, `${where}: explanation`);
    answers[item.answer] = (answers[item.answer] || 0) + 1;
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
      if (L.isPhrases(item)) item.choices.forEach((c, i) => { furigana(c.ja, `${where} choice ${i}`); ok(!!c.en, `${where} choice ${i}: English`); });
      ok(L.isPhrases(item) || item.choices.every(c => c.type !== 'phrase'), `${where}: printed phrases are all or nothing`);
      item.choices.forEach((c, i) => {
        ok(c.type in Art.PICTURES, `${where} choice ${i}: picture type ${c.type}`);
        (ICON_TYPES[c.type] ? ICON_TYPES[c.type](c) : []).forEach(n => ok(n in Art.ICONS, `${where} choice ${i}: icon ${n}`));
        ok(Art.picture(c).length > 20, `${where} choice ${i}: draws`);
      });
      ok(new Set(item.choices.map(Art.picture)).size === 4, `${where}: the four pictures differ`);
    } else if (section.kind === 'summary') {
      ok(['N3', 'N2'].includes(item.level), `${where}: summary questions are N3/N2`);
      ok(!!item.intro && item.lines.length >= 2, `${where}: a situation and a talk`);
      furigana(item.question, `${where} question`);
      ok(item.choices.length === 4, `${where}: four spoken choices`);
      item.choices.forEach((c, i) => { furigana(c.ja, `${where} choice ${i}`); ok(!!c.en, `${where} choice ${i}: English`); });
    } else {
      ok(item.choices.length === 3, `${where}: three spoken replies`);
      ok(VOICES.has(item.replyBy || 'M'), `${where}: replyBy`);
      item.choices.forEach((c, i) => {
        furigana(c.ja, `${where} choice ${i}`);
        ok(typeof c.en === 'string' && c.en.length > 0, `${where} choice ${i}: English`);
      });
      if (item.scene) {
        const sc = item.scene;
        ok(['left', 'right'].includes(sc.arrow), `${where}: arrow side`);
        ok(sc.left in Art.ROLES && sc.right in Art.ROLES, `${where}: scene roles`);
        ok(sc.setting in Art.SETTINGS, `${where}: scene setting ${sc.setting}`);
        ok(!sc.prop || sc.prop in Art.ICONS, `${where}: scene prop ${sc.prop}`);
        ok(!sc.holder || ['left', 'right'].includes(sc.holder), `${where}: holder`);
        ok((Art.scene(sc).match(/class="lis-art-q"/g) || []).length === 1, `${where}: one "?" over the speaker`);
      }
      ok(section.id !== 'hatsuwa' || !!item.scene, `${where}: 問題3 has a scene`);
      ok(!!item.intro || (item.lines || []).length > 0, `${where}: something to respond to`);
    }
    ok(Number.isInteger(item.answer) && item.answer >= 0 && item.answer < item.choices.length, `${where}: answer in range`);

    // Each question has a man and a woman from the cast, at a sensible speed.
    const cast = L.castFor(section, item);
    const voiceIds = new Set(Object.values(L.VOICES).map(v => v.id));
    ok(voiceIds.has(cast.M.id) && voiceIds.has(cast.F.id), `${where}: cast from VOICES`);
    ok(cast.M.speed >= 0.75 && cast.M.speed <= 1.3 && cast.F.speed >= 0.75 && cast.F.speed <= 1.35, `${where}: speaking speed in range`);
    if (item.voices) for (const g of Object.keys(item.voices)) ok(item.voices[g] in L.POOLS[g], `${where}: voice pool ${item.voices[g]}`);

    // The script plays in the test's order.
    const script = L.buildScript(section, item, index + 1);
    ok(script[0].voice === 'N' && script[0].text === `${index + 1}番。`, `${where}: starts with the number`);
    ok(script.every(s => s.text && !/[\[\]]/.test(s.text)), `${where}: every step has plain text`);
    if (section.kind === 'pictures') {
      ok(script[1].line === 'intro', `${where}: question before the conversation`);
      ok(script[script.length - 1].line === 'question', `${where}: question again at the end`);
      ok(script.length === item.lines.length + 3, `${where}: one step per line`);
    } else if (section.kind === 'summary') {
      ok(script[1].line === 'intro' && script[script.length - 9].line === 'question', `${where}: the question comes after the talk`);
      ok(script.filter(s => /^choice/.test(s.line)).length === 8 && script.slice(-8).every(s => s.voice === 'N'), `${where}: four choices, numbered, read by the narrator`);
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
      ok(rec.steps.length === L.recorded(script).length && L.recorded(script).length === script.length - 1, `${where}: a time for every recorded step (all but the number)`);
      ok(L.scriptHash(L.buildScript(section, item, 7)) === rec.hash, `${where}: the recording fits whatever number the question has`);
      ok(rec.steps.every(([a, b], i) => b > a && (i === 0 || a >= rec.steps[i - 1][1])), `${where}: step times run in order`);
    }
  });
  const n = section.items[0].choices.length;
  for (let i = 0; i < n; i++) ok((answers[i] || 0) >= section.items.length / n / 2, `${section.id}: answer ${i + 1} is right often enough (${answers[i] || 0})`);
}
ok(Object.keys(RECORDINGS).filter(k => k !== L.NUMBERS_KEY).length === ids.size, 'no recordings for questions that no longer exist');
const numbers = RECORDINGS[L.NUMBERS_KEY];
ok(!!numbers && fs.existsSync(path.join(__dirname, numbers.src)), 'the numbers recording exists');
const longest = Math.max(...SECTIONS.map(s => s.items.length));
ok(numbers && numbers.steps.length >= longest, `numbers go up to ${longest}番, the longest part practised on its own`);

// Voices vary from question to question.
const used = { M: new Set(), F: new Set() };
const speeds = new Set();
SECTIONS.forEach(s => s.items.forEach(it => { const c = L.castFor(s, it); used.M.add(c.M.name); used.F.add(c.F.name); speeds.add(c.M.speed); }));
ok(used.M.size >= 5 && used.F.size >= 5, `at least five men's and five women's voices are used (${used.M.size} / ${used.F.size})`);
ok(speeds.size >= 8, 'speaking speeds vary');
ok(L.castFor(SECTIONS[0], SECTIONS[0].items[0]).M.id === L.castFor(SECTIONS[0], SECTIONS[0].items[0]).M.id, 'casting is stable');

// Mock tests: the JLPT layout, every question at most once.
for (const level of L.LEVELS) {
  const tests = L.mockTests(SECTIONS, level);
  ok(tests.length >= (level === 'N5' || level === 'N4' ? 3 : 2), `${level}: enough mock tests (${tests.length})`);
  const layout = L.TEST_LAYOUT[level];
  const seen = new Set();
  tests.forEach(t => {
    ok(t.sections.map(s => s.id).join() === Object.keys(layout).join(), `${t.id}: parts in order`);
    ok(t.parts.map(p => p.length).join() === Object.values(layout).join(), `${t.id}: ${Object.values(layout).join('/')} questions per part`);
    t.parts.forEach((part, i) => part.forEach(({ section, item }) => {
      ok(section === t.sections[i] && item.level === level, `${t.id}: ${item.id} belongs in part ${i + 1}`);
      ok(!seen.has(item.id), `${t.id}: ${item.id} is in one test only`);
      seen.add(item.id);
    }));
  });
}

// prepare() rotated the choices once: running it again changes nothing.
const before = JSON.stringify(SECTIONS.map(s => s.items.map(i => i.answer)));
L.prepare(SECTIONS);
ok(JSON.stringify(SECTIONS.map(s => s.items.map(i => i.answer))) === before, 'prepare is idempotent');

// Pictures that carry the answer
const cal = Art.picture({ type: 'calendar', mark: 15 });
ok((cal.match(/<circle/g) || []).length === 1, 'calendar circles one day');
ok(/<text x="133" y="60" fill="#5b8fd6"[^>]*>15<\/text>/.test(cal), 'calendar: the 15th is a Saturday');
ok(/<text x="113" y="60" fill="#2b2320"[^>]*>14<\/text>/.test(cal), 'calendar: the 14th is a Friday');
const cal24 = Art.picture({ type: 'calendar', mark: 24 });
ok(/>24<\/text>/.test(cal24) && (cal24.match(/<circle/g) || []).length === 1, 'calendar: late dates are shown and circled');
for (const at of Object.keys(Art.MAP_SPOTS)) ok((Art.picture({ type: 'map', at }).match(/★/g) || []).length === 1, `map: one star at ${at}`);
for (const at of Object.keys(Art.ROOM_SPOTS)) ok((Art.picture({ type: 'room', at }).match(/★/g) || []).length === 1, `room: one star at ${at}`);
ok((Art.picture({ type: 'floor', floor: 5 }).match(/★/g) || []).length === 1, 'floor: one floor starred');
ok((Art.picture({ type: 'week', days: [2, 5] }).match(/<circle/g) || []).length === 2, 'week: two days circled');
ok(Art.picture({ type: 'clock', h: 10, m: 15 }) !== Art.picture({ type: 'clock', h: 10, m: 30 }), 'clocks differ by time');
ok((Art.picture({ type: 'items', items: [['apple', 3], ['mandarin', 2]] }).match(/<svg/g) || []).length === 5, 'items repeat by count');
ok((Art.picture({ type: 'people', n: 5 }).match(/<svg/g) || []).length === 5, 'people draws n people');
ok(Art.picture({ type: 'items', items: [[{ name: 'umbrella', color: 'red' }, 1]] }).includes('#e8594a'), 'icons can be recoloured');
ok((Art.picture({ type: 'route', turns: ['up', 'up', 'right'] }).match(/★/g) || []).length === 1, 'route: one goal');
ok((Art.picture({ type: 'seats', row: 'C', seat: 4 }).match(/★/g) || []).length === 1, 'seats: one seat starred');
for (const role of Object.keys(Art.ROLES)) ok(Art.person(Art.ROLES[role]).length > 500, `role ${role} draws`);
for (const setting of Object.keys(Art.SETTINGS)) ok(Art.scene({ setting, left: 'man', right: 'woman', arrow: 'left' }).includes('<svg'), `setting ${setting} draws`);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
