// The particles & verbs practice sheets (scripts/grammar_practice_questions.mjs,
// printed by render_grammar_practice.mjs): 150 questions per level, each
// with one answer among its choices and an explanation for the key.
const fs = require('fs');
const path = require('path');

let failed = 0;
const check = (ok, msg) => { if (!ok) { failed++; console.error('FAIL:', msg); } };

(async () => {
  const { LEVELS, TOTAL, SECTIONS, buildLevel, plain } = await import('./scripts/grammar_practice_questions.mjs');
  for (const level of LEVELS) {
    const s = SECTIONS[level];
    check(s.A + s.B + s.C === TOTAL, `${level}: sections add up to ${s.A + s.B + s.C}`);
    const b = buildLevel(level);
    const all = [...b.A, ...b.B, ...b.C];
    check(all.length === TOTAL, `${level}: ${all.length} questions`);
    check(b.A.length === s.A && b.B.length === s.B && b.C.length === s.C, `${level}: section sizes`);
    for (const q of all) {
      const label = `${level} ${q.kind} ${plain(q.before || q.verb)}`;
      check(typeof q.why === 'string' && q.why.length > 5 && !/undefined/.test(q.why), `${label}: no explanation`);
      if (q.choices) {
        check(q.choices.includes(q.answer), `${label}: answer not a choice`);
        check(new Set(q.choices).size === q.choices.length, `${label}: repeated choice`);
      }
      for (const t of [q.before, q.after, q.verb].filter(Boolean)) {
        check(!/[一-鿿々](?![一-鿿々]*\[)/.test(t), `${label}: kanji without furigana in ${t}`);
      }
    }
    const sentences = b.A.map((q) => plain(q.before + '|' + q.after));
    check(new Set(sentences).size === sentences.length, `${level}: a particle question twice`);
    const verbs = b.B.map((q) => q.verb);
    check(new Set(verbs).size === verbs.length, `${level}: a verb twice in section B`);
    check(b.A.every((q) => q.choices.length === 4), `${level}: particle questions need four choices`);
    const pdf = path.join(__dirname, 'grammar-sheets', `tokidoki-grammar-practice-${level.toLowerCase()}.pdf`);
    check(fs.existsSync(pdf), `${pdf} missing: run node scripts/render_grammar_practice.mjs`);
  }
  // N4 and N3 share the verb-pair sentences: none on both sheets.
  const n4 = new Set(buildLevel('N4').C.map((q) => q.before + q.after));
  check(buildLevel('N3').C.every((q) => !n4.has(q.before + q.after)), 'a pair sentence on both N4 and N3');
  if (failed) { console.error(`${failed} failed`); process.exit(1); }
  console.log('grammar practice: ok');
})();
