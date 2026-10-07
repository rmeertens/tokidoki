// Checks for the ことば探偵クロ mystery (mystery-data.js / mystery.js): every
// line is in the Stories token format with each word in the glossary and each
// grammar snippet in its line, every kanji has furigana, every answer accepts
// its own kanji and kana spellings (also typed in romaji), filled-in lines and
// model answers agree with the accepted answers, and each step is well formed.
global.window = global;
require('./answer-diff.js');
require('./stories-data.js');
require('./mystery-words.js');
const Romaji = require('./romaji.js');
const { CAST, CHAPTERS } = require('./mystery-data.js');
const M = require('./mystery.js');
const { STORY_GLOSSARY, STORY_GRAMMAR } = global;

let passed = 0;
let failed = 0;
function ok(cond, label) {
  if (cond) passed++;
  else { failed++; console.log('  FAIL: ' + label); }
}

const BARE_KANJI = /[㐀-䶿一-鿿々〆ヶ]/;
const PUNCT = new Set(['。', '、', '「', '」', '『', '』', '？', '！', '…']);
const bare = markup => M.pieces(markup).filter(p => !p.r).map(p => p.t).join('');
const KINDS = new Set(['say', 'place', 'clue', 'fill', 'ask', 'meaning', 'riddle', 'testimony']);
const WHO = new Set([...Object.keys(CAST), 'narr', 'you']);

function furigana(text, where) {
  ok(!BARE_KANJI.test(bare(text)), `${where}: kanji without furigana in ${JSON.stringify(text)}`);
  ok(!/\[[^\]]*$|^[^\[]*\]/.test(text), `${where}: unbalanced brackets in ${JSON.stringify(text)}`);
}

// A tokenized line, with a fill step's answer put in place of {_}.
function line(ja, where, g, fill) {
  ok(!/  |^ | $/.test(ja), `${where}: stray spaces in ${JSON.stringify(ja)}`);
  let toks = ja.split(' ');
  if (fill !== undefined) toks = toks.flatMap(t => (t === '{_}' ? fill.split(' ') : [t.replace('{_}', fill)]));
  toks.forEach(t => {
    if (PUNCT.has(t)) return;
    const [surface, key] = t.split('>');
    furigana(surface, where);
    const k = key || M.plain(surface);
    ok(Object.prototype.hasOwnProperty.call(STORY_GLOSSARY, k), `${where}: no glossary entry for "${k}"`);
  });
  const text = toks.map(t => M.plain(t.split('>')[0])).join('');
  (g || []).forEach(ref => {
    const i = ref.indexOf(':');
    const id = i === -1 ? ref : ref.slice(0, i);
    const snippet = i === -1 ? '' : ref.slice(i + 1);
    ok(Object.prototype.hasOwnProperty.call(STORY_GRAMMAR, id), `${where}: unknown grammar "${id}"`);
    if (snippet) ok(text.includes(snippet), `${where}: snippet "${snippet}" not in "${text}"`);
  });
  return text;
}

const ids = new Set();
CHAPTERS.forEach(ch => {
  ok(!ids.has(ch.id), `duplicate chapter id ${ch.id}`);
  ids.add(ch.id);
  furigana(ch.title, ch.id);
  ch.steps.forEach((s, i) => {
    const where = `${ch.id}#${i}`;
    ok(KINDS.has(s.type), `${where}: unknown step type ${s.type}`);
    if (s.who) ok(WHO.has(s.who), `${where}: unknown speaker ${s.who}`);
    if (s.type === 'place') furigana(s.ja, where);
    if (s.type === 'clue') { furigana(s.name, where); if (s.ja) line(s.ja, where, s.g); }
    if (s.type === 'say' || s.type === 'riddle') line(s.ja, where, s.g);

    if (s.type === 'fill') {
      ok(s.ja.split('{_}').length === 2, `${where}: a fill line needs exactly one {_}`);
      ok(typeof s.fill === 'string', `${where}: a fill step needs \`fill\``);
      line(s.ja.replace(/\{_\}/, '？'), where + ' (unsolved)');
      const blank = s.ja.split(' ').find(t => t.includes('{_}'));
      const filled = blank === '{_}' ? s.fill.split(' ').map(t => M.plain(t.split('>')[0])).join('') : M.plain(blank.split('>')[0].replace('{_}', s.fill));
      const answer = blank === '{_}' ? filled : M.plain(s.fill);
      ok(M.match(answer, s.answers), `${where}: fill "${s.fill}" doesn't match its answers`);
      line(s.ja, where, s.g, s.fill);
    }
    if (s.type === 'ask') {
      ok(typeof s.line === 'string', `${where}: an ask step needs \`line\``);
      ok(M.match(line(s.line, where, s.g), s.answers), `${where}: model line doesn't match its answers`);
    }
    if (s.type === 'testimony') {
      ok(s.wrong >= 0 && s.wrong < s.lines.length, `${where}: wrong index out of range`);
      ok(!s.lines[s.wrong].no, `${where}: the contradiction shouldn't have a rebuttal`);
      furigana(s.title, where);
      s.lines.forEach(l => {
        line(l.ja, where, l.g);
        if (l.no) { ok(WHO.has(l.no[0]), `${where}: rebuttal speaker`); line(l.no[1], where + ' rebuttal'); }
      });
      ok(!!s.hint, `${where}: testimony needs a hint`);
    }
    if (['fill', 'ask', 'meaning', 'riddle'].includes(s.type)) {
      ok(s.answers && s.answers.length > 0, `${where}: no answers`);
      ok(!!s.hint && !!s.note, `${where}: needs a hint and a note`);
      if (s.type === 'meaning') {
        s.answers.forEach(a => ok(M.matchEnglish(a, s.answers), `${where}: ${a} doesn't match itself`));
        return;
      }
      s.answers.forEach(a => {
        furigana(a, where);
        ok(M.match(M.plain(a), s.answers), `${where}: kanji form of ${a} rejected`);
        ok(M.match(M.reading(a), s.answers), `${where}: kana form of ${a} rejected`);
      });
    }
  });
});
line('ちょっと 待[ま]った>待つ ！', 'objection line', ['plain-form:待った']);

// Typing romaji, the way a player without a Japanese keyboard would.
const romaji = (text, answers) => M.match(Romaji.toHiragana(text, true), answers);
const step = (id, type, n = 0) => CHAPTERS.find(c => c.id === id).steps.filter(s => s.type === type)[n];

ok(romaji('yoroshiku onegaishimasu', step('melonpan', 'ask').answers), 'romaji greeting');
ok(romaji('yane ni nani ga imasu ka', step('melonpan', 'ask', 1).answers), 'romaji roof question');
ok(!M.match('やねになにがありますか', step('melonpan', 'ask', 1).answers), 'あります is rejected for a living thing');
ok(romaji('furaipan', step('melonpan', 'riddle').answers), 'romaji katakana answer');
ok(romaji('mittsu', step('melonpan', 'fill', 3).answers), 'romaji small tsu');
ok(romaji('sanjijuugofun', step('clocktower', 'fill').answers), 'romaji time');
ok(M.match('3時15分', step('clocktower', 'fill').answers), 'digits with kanji');
ok(M.match('三時15分', step('clocktower', 'fill').answers) === false, 'half-kanji, half-digit time is not listed');
ok(M.match('時計台のかぎはだれが持っていますか', step('clocktower', 'ask').answers), 'mixed kanji and kana');
ok(M.match('時計台の鍵は、誰が持っていますか？', step('clocktower', 'ask').answers), 'punctuation is ignored');
ok(romaji('mise wo misasete kudasai', step('arrested', 'ask').answers), 'romaji causative request');
ok(romaji('moushiwake arimasen deshita', step('arrested', 'ask', 2).answers), 'romaji apology');
ok(!M.match('', step('melonpan', 'fill').answers), 'empty answer rejected');
ok(M.matchEnglish('It was a replica!', step('teabowl', 'meaning', 1).answers), 'English keyword inside a sentence');
ok(!M.matchEnglish('the real one', step('teabowl', 'meaning', 1).answers), 'wrong English rejected');
ok(M.matchEnglish('she fed him', step('arrested', 'meaning', 1).answers), 'English "fed"');
ok(M.distance('ふらいぱm', step('melonpan', 'riddle').answers) <= 2, 'near miss is close');
ok(M.distance('なべ', step('melonpan', 'riddle').answers) > 2, 'different word is not close');

// The answer a wrong try is compared against follows the player's own spelling.
const keyAsk = step('clocktower', 'ask').answers;
ok(M.expected('とけいだいのかぎはだれがもってますか', keyAsk) === 'とけいだいのかぎはだれがもっていますか', 'kana try → kana answer');
ok(M.expected('時計台のかぎはだれが持ってますか', keyAsk) === '時計台のかぎはだれが持っていますか', 'mixed try → mixed answer');
ok(M.expected('すいようび', step('melonpan', 'fill').answers) === 'すいようび', 'exact kana form');

console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
