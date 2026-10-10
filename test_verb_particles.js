// Sanity checks for verb-particles-data.js: every overview verb is tagged
// transitive / intransitive, every 自動詞・他動詞 pair is complete, and every
// quiz item has one right answer with an explanation for each wrong one.
global.window = global;
require('./verb-particles-data.js');
const { VERB_PARTICLE_VERBS, VERB_TRANSITIVITY, VERB_PARTICLE_ITEMS } = global;

let failed = 0;
const check = (ok, msg) => { if (!ok) { failed++; console.error('FAIL:', msg); } };

for (const v of VERB_PARTICLE_VERBS) {
  check(['vi', 'vt', 'pair'].includes(v.type), `${v.verb}: type must be vi, vt or pair`);
  // An object marked with を means transitive, unless it's a motion verb's route.
  if (v.type === 'vi' && v.frames.some(f => /〕を/.test(f))) {
    check(/place|route|bridge|vehicle|school/.test(v.frames.join()), `${v.verb}: vi with a を object`);
  }
}

const seen = new Set();
for (const g of VERB_TRANSITIVITY.groups) {
  check(g.vi && g.vt && g.pairs.length, 'group needs endings and pairs');
  for (const p of g.pairs) {
    check(p.noun && p.vi && p.vt && p.en, `incomplete pair ${JSON.stringify(p)}`);
    check(p.vi !== p.vt, `${p.vi}: vi and vt are the same`);
    const key = p.vi + p.vt;
    check(!seen.has(key), `duplicate pair ${key}`);
    seen.add(key);
  }
}
for (const k of VERB_TRANSITIVITY.intro) check(['vi', 'vt'].includes(k.type), 'intro type');
for (const o of VERB_TRANSITIVITY.only) check(['vi', 'vt'].includes(o.type) && o.verbs.length, 'only list');

const ids = new Set();
for (const item of VERB_PARTICLE_ITEMS) {
  check(!ids.has(item.id), `duplicate item id ${item.id}`);
  ids.add(item.id);
  check(item.wrong.length === 3 && !item.wrong.includes(item.particle), `${item.id}: needs 3 wrong choices, not the answer`);
  for (const w of item.wrong) check(item.note.not[w], `${item.id}: no explanation for ${w}`);
}

if (failed) { console.error(`${failed} check(s) failed`); process.exit(1); }
console.log(`verb particles: ${VERB_PARTICLE_VERBS.length} verbs, ${seen.size} pairs, ${ids.size} quiz items OK`);
