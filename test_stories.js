// Sanity checks for stories-data.js: every clickable token must resolve to a
// glossary entry, every grammar reference to a STORY_GRAMMAR entry, and every
// grammar snippet must actually occur in its sentence (the reader highlights it).
global.window = global;
require('./stories-data.js');

const { STORIES_DATA, STORY_GLOSSARY, STORY_GRAMMAR } = global;
const PUNCT = new Set(['。', '、', '「', '」', '『', '』', '？', '！', '…']);
const stripFurigana = (s) => s.replace(/\[[^\]]*\]/g, '');

let passed = 0;
let failed = 0;
function check(ok, label) {
  if (ok) passed++;
  else { failed++; console.log(`  FAIL: ${label}`); }
}

const ids = new Set();
STORIES_DATA.forEach(story => {
  check(!ids.has(story.id), `${story.id}: duplicate story id`);
  ids.add(story.id);
  check(['n5', 'n4', 'n3'].includes(story.level), `${story.id}: unknown level ${story.level}`);
  story.sentences.forEach((s, i) => {
    const where = `${story.id} #${i + 1}`;
    const tokens = s.jp.split(' ');
    check(tokens.every(t => t.length > 0), `${where}: double space in jp`);
    tokens.forEach(tok => {
      if (PUNCT.has(tok)) return;
      check(!/[[\]]/.test(tok.replace(/[一-鿿々]+\[[^\]]+\]/g, '')), `${where}: malformed furigana in "${tok}"`);
      const [surface, override] = tok.split('>');
      const key = override || stripFurigana(surface);
      check(Object.prototype.hasOwnProperty.call(STORY_GLOSSARY, key), `${where}: no glossary entry for "${key}"`);
    });
    const plain = tokens.map(t => stripFurigana(t.split('>')[0])).join('');
    check(typeof s.en === 'string' && s.en.length > 0, `${where}: missing English`);
    check(Array.isArray(s.grammar) && s.grammar.length > 0, `${where}: no grammar points`);
    (s.grammar || []).forEach(ref => {
      const [id, snippet] = ref.split(':');
      check(Object.prototype.hasOwnProperty.call(STORY_GRAMMAR, id), `${where}: unknown grammar id "${id}"`);
      if (snippet) check(plain.includes(snippet), `${where}: snippet "${snippet}" not in "${plain}"`);
    });
  });
});

Object.entries(STORY_GLOSSARY).forEach(([key, entry]) => {
  check(Array.isArray(entry) && entry.length === 3 && entry.every(x => typeof x === 'string' && x),
    `glossary "${key}": expected [reading, meaning, pos]`);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
