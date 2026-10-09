// Sanity checks for memes-data.js, which the Stories reader also renders:
// every clickable token must resolve to a glossary entry (the stories', the
// mystery game's or the memes' own), every grammar reference to a
// STORY_GRAMMAR entry, and every grammar snippet must occur in its sentence.
// Meme-only entries must not shadow existing ones — they'd be silently skipped.
global.window = global;
require('./stories-data.js');
require('./mystery-words.js');
const before = { glossary: { ...global.STORY_GLOSSARY }, grammar: { ...global.STORY_GRAMMAR } };
require('./memes-data.js');
const before2 = { glossary: { ...global.STORY_GLOSSARY }, grammar: { ...global.STORY_GRAMMAR } };
require('./memes-data-2.js');

const { MEMES_DATA, MEME_GLOSSARY, MEME_GRAMMAR, MEME_GLOSSARY_2, MEME_GRAMMAR_2, STORY_GLOSSARY, STORY_GRAMMAR, STORIES_DATA } = global;
const PUNCT = new Set(['。', '、', '「', '」', '『', '』', '？', '！', '…']);
const KINDS = ['dajare', 'slang', 'pop', 'story', 'riddle', 'senryu', 'meme', 'twister', 'aruaru', 'trivia', 'kotowaza'];
const stripFurigana = (s) => s.replace(/\[[^\]]*\]/g, '');
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

let passed = 0;
let failed = 0;
function check(ok, label) {
  if (ok) passed++;
  else { failed++; console.log(`  FAIL: ${label}`); }
}

Object.keys(MEME_GLOSSARY).forEach(key => check(!has(before.glossary, key), `MEME_GLOSSARY "${key}" already in STORY_GLOSSARY`));
Object.keys(MEME_GRAMMAR).forEach(id => check(!has(before.grammar, id), `MEME_GRAMMAR "${id}" already in STORY_GRAMMAR`));
Object.keys(MEME_GLOSSARY_2).forEach(key => check(!has(before2.glossary, key), `MEME_GLOSSARY_2 "${key}" already in STORY_GLOSSARY`));
Object.keys(MEME_GRAMMAR_2).forEach(id => check(!has(before2.grammar, id), `MEME_GRAMMAR_2 "${id}" already in STORY_GRAMMAR`));

const storyIds = new Set(STORIES_DATA.map(s => s.id));
const ids = new Set();
const used = new Set();
MEMES_DATA.forEach(item => {
  check(!ids.has(item.id) && !storyIds.has(item.id), `${item.id}: duplicate id`);
  ids.add(item.id);
  check(['n5', 'n4', 'n3'].includes(item.level), `${item.id}: unknown level ${item.level}`);
  check(KINDS.includes(item.kind), `${item.id}: unknown kind ${item.kind}`);
  check(['short', 'long'].includes(item.size), `${item.id}: size must be short or long`);
  if (item.size === 'short') check(item.sentences.length <= 3, `${item.id}: short item with ${item.sentences.length} sentences`);
  if (item.size === 'long') check(item.sentences.length >= 5, `${item.id}: long item with only ${item.sentences.length} sentences`);
  check(typeof item.emoji === 'string' && item.emoji.length > 0, `${item.id}: missing emoji`);
  check(typeof item.punch === 'string' && item.punch.length > 20, `${item.id}: missing punch explanation`);
  check(typeof item.titleEn === 'string' && item.titleEn.length > 0, `${item.id}: missing English title`);
  item.sentences.forEach((s, i) => {
    const where = `${item.id} #${i + 1}`;
    const tokens = s.jp.split(' ');
    check(tokens.every(t => t.length > 0), `${where}: double space in jp`);
    tokens.forEach(tok => {
      if (PUNCT.has(tok)) return;
      check(!/[[\]]/.test(tok.replace(/[一-鿿々]+\[[^\]]+\]/g, '')), `${where}: malformed furigana in "${tok}"`);
      const [surface, override] = tok.split('>');
      const key = override || stripFurigana(surface);
      used.add(key);
      check(has(STORY_GLOSSARY, key), `${where}: no glossary entry for "${key}"`);
    });
    const plain = tokens.map(t => stripFurigana(t.split('>')[0])).join('');
    check(typeof s.en === 'string' && s.en.length > 0, `${where}: missing English`);
    check(Array.isArray(s.grammar) && s.grammar.length > 0, `${where}: no grammar points`);
    (s.grammar || []).forEach(ref => {
      const i2 = ref.indexOf(':');
      const id = i2 === -1 ? ref : ref.slice(0, i2);
      const snippet = i2 === -1 ? '' : ref.slice(i2 + 1);
      check(has(STORY_GRAMMAR, id), `${where}: unknown grammar id "${id}"`);
      if (snippet) check(plain.includes(snippet), `${where}: snippet "${snippet}" not in "${plain}"`);
    });
  });
});

['n5', 'n4', 'n3'].forEach(level => ['short', 'long'].forEach(size => {
  check(MEMES_DATA.filter(m => m.level === level && m.size === size).length >= 5, `${level} ${size}: fewer than 5 items`);
}));

Object.entries({ ...MEME_GLOSSARY, ...MEME_GLOSSARY_2 }).forEach(([key, entry]) => {
  check(Array.isArray(entry) && entry.length === 3 && entry.every(x => typeof x === 'string' && x),
    `glossary "${key}": expected [reading, meaning, pos]`);
  check(used.has(key), `glossary "${key}": never used`);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
