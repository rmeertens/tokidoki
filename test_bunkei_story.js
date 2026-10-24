// Checks for Bunkei in the wild (bunkei-story-data.js, bunkei-story.js):
// every story uses every pattern of the Bunkei drill, each line's pattern is
// marked in its sentence, and every question has a fair set of four choices.
const Bunkei = require('./bunkei-data.js');
const { STORIES, CHAPTERS, CLOSE } = require('./bunkei-story-data.js');
const Story = require('./bunkei-story.js');

let passed = 0;
let failed = 0;
function check(ok, label) {
  if (ok) passed++;
  else { failed++; console.log(`  FAIL: ${label}`); }
}

const LEVELS = ['N5', 'N4', 'N3'];
const rank = level => LEVELS.indexOf(level);
const close = (a, b) => CLOSE.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
const balanced = s => (s.match(/\[/g) || []).length === (s.match(/\]/g) || []).length && !/\[[^\]]*$/.test(s);

// A wrong choice mustn't be a pattern the sentence also uses (outside the
// underlined part), or two choices would be right. Signs of each pattern in
// the plain sentence; the ones that are hard to spot (potential, passive)
// are left out.
const SIGNS = {
  'te-kudasai': /[てで]ください/, 'naide-kudasai': /ないでください/, 'sasete-kudasai': /せてください/,
  tai: /たい(です|と|。|」|の|な|！)|たかった|たくな/, 'masen-ka': /ませんか/, mashou: /ましょう/,
  'te-iru': /[てで]い(ます|る|た|ない|まし)/, 'te-mo-ii': /[てで]も(いい|よい|かまわ)/, 'te-wa-ikenai': /[てで]は(いけ|だめ)/,
  'te-kara': /[てで]から/, 'mae-ni': /前に/, 'nakereba-naranai': /なければ|なきゃ/, 'nakute-mo-ii': /なくても/,
  'ta-koto-ga-aru': /[ただ]ことが[あな]/, 'te-shimau': /[てで]しま|ちゃ[うっ]|じゃ[うっ]/, 'te-oku': /[てで]お(く|き|いた|いて|こう)/,
  'te-miru': /[てで]み(る|ます|た|まし|て|よう)/, 'te-mimashou': /[てで]み(ましょう|よう)/, 'te-kuru': /てき(ます|た|まし)|[てで]くる/,
  tsumori: /つもり/, 'volitional-to-omou': /[おこそとのぼもろよ]うと思/, 'hou-ga-ii': /方がいい/, kamoshirenai: /かもしれ/,
  'te-hoshii': /[てで]ほし/, nagara: /ながら/, tara: /[ただ]ら[、,]/, 'ba-yokatta': /ばよかった/, 'you-ni-naru': /ようにな/,
  'te-ageru': /[てで]あげ/, 'te-kureru': /[てで]くれ/, 'te-morau': /[てで]もら/, sugiru: /すぎ/, hajimeru: /始め/,
  'causative-passive': /させられ|[かさたなまらがばわ]され/, beki: /べき/, 'koto-ni-suru': /ことにし|ことにする/,
  'you-ni-suru': /ようにし/, 'wake-ni-wa-ikanai': /わけにはいか/, 'koto-wa-nai': /ことはな/, 'te-bakari': /[てで]ばかり/,
  'you-to-suru': /[おこそとのぼもろよ]うとし/, zuni: /ずに/,
};
const plain = markup => markup.replace(/\[[^\]]*\]/g, '').replace(/\s+/g, '');

// Every story uses every pattern of the drill, from N5 up.
const storyIds = new Set();
STORIES.forEach(st => {
  check(!storyIds.has(st.id), `${st.id}: duplicate story id`);
  storyIds.add(st.id);
  check(!!(st.title && st.titleEn && st.about && st.emoji), `${st.id}: needs a title, titleEn, about and emoji`);
  const used = new Set(st.chapters.flatMap(c => c.lines.map(l => l.b)));
  Bunkei.PATTERNS.forEach(p => check(used.has(p.id), `${st.id}: pattern ${p.id} (${p.name}) is not in the story`));
  st.chapters.forEach((c, ci) => check(ci === 0 || rank(c.level) >= rank(st.chapters[ci - 1].level), `${c.id}: chapters should go from N5 to N3`));
});
check(STORIES.length >= 6, `expected 6+ stories, got ${STORIES.length}`);
check(CHAPTERS.length === STORIES.reduce((n, st) => n + st.chapters.length, 0), 'CHAPTERS is every story\'s chapters');

CLOSE.forEach(pair => pair.forEach(id => check(!!Bunkei.PATTERN_BY_ID[id], `CLOSE: unknown pattern ${id}`)));

const ids = new Set();
CHAPTERS.forEach(c => {
  check(!ids.has(c.id), `${c.id}: duplicate chapter id`);
  ids.add(c.id);
  check(LEVELS.includes(c.level), `${c.id}: bad level ${c.level}`);
  check(!!c.title && !!c.titleEn && c.lines.length >= 6, `${c.id}: needs a title and 6+ lines`);
  c.lines.forEach((l, i) => {
    const where = `${c.id} line ${i + 1}`;
    const p = Bunkei.PATTERN_BY_ID[l.b];
    check(!!p, `${where}: unknown pattern ${l.b}`);
    if (p) check(rank(p.level) <= rank(c.level), `${where}: ${l.b} is ${p.level}, above the chapter's ${c.level}`);
    check(/[。」！？]$/.test(l.ja), `${where}: should end a sentence: ${l.ja}`);
    check(!!l.en && /[.!?”]$/.test(l.en), `${where}: needs an English sentence`);
    check(balanced(l.ja), `${where}: furigana brackets don't match`);
    check(!/[一-鿿々]/.test(l.ja.replace(/[一-鿿々]+\[[^\]]+\]/g, '')), `${where}: kanji without furigana`);
    const parts = Story.splitAt(l);
    check(!!parts, `${where}: "${l.hl}" is not in the sentence`);
    if (parts) check(balanced(parts[0]) && balanced(parts[1]), `${where}: "${l.hl}" cuts through a furigana`);
    check(Array.isArray(l.wrong) && l.wrong.length === 3 && new Set(l.wrong).size === 3, `${where}: needs three different wrong choices`);
    (l.wrong || []).forEach(w => {
      const wp = Bunkei.PATTERN_BY_ID[w];
      check(!!wp, `${where}: unknown wrong choice ${w}`);
      check(w !== l.b, `${where}: the answer is also a wrong choice`);
      check(!close(w, l.b), `${where}: ${w} means nearly the same as ${l.b}`);
      if (wp) check(rank(wp.level) <= rank(c.level), `${where}: wrong choice ${w} is above the chapter's level`);
      const rest = parts ? plain(parts[0]) + '／' + plain(parts[2]) : '';
      if (SIGNS[w]) check(!SIGNS[w].test(rest), `${where}: wrong choice ${w} is also in the sentence: ${plain(l.ja)}`);
    });
    const meanings = [l.b, ...(l.wrong || [])].map(id => (Bunkei.PATTERN_BY_ID[id] || {}).meaning);
    check(new Set(meanings).size === 4, `${where}: two choices read the same`);
    if (l.note) check(!/\[/.test(l.note), `${where}: notes are plain text`);
  });
});

// The page's pure parts.
const line = CHAPTERS[0].lines[0];
const choices = Story.choicesFor(line, () => 0.5);
check(choices.length === 4 && choices.includes(line.b) && line.wrong.every(w => choices.includes(w)), 'choicesFor: the answer and the three wrong ones');
check(Story.kana('日本[にほん]に 来[く]る') === 'にほんにくる', `kana: ${Story.kana('日本[にほん]に 来[く]る')}`);
check(Story.rubyHtml('日本[にほん]へ') === '<ruby>日本<rt>にほん</rt></ruby>へ', 'rubyHtml');
const ch = CHAPTERS[0];
check(Story.score(ch, ch.lines.map(l => l.b)) === ch.lines.length, 'score: all right');
check(Story.score(ch, ch.lines.map(l => l.wrong[0])) === 0, 'score: all wrong');

const lines = CHAPTERS.reduce((n, c) => n + c.lines.length, 0);
console.log(`bunkei story: ${STORIES.length} stories, ${CHAPTERS.length} chapters, ${lines} sentences`);
console.log(`${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
