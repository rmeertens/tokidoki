// JLPT-style vocabulary questions: the underlined / blanked word and its
// answer (scripts/vocab_questions.mjs), the printable sheets
// (scripts/render_vocab_sheets.mjs), the fill-in data (vocab-fill-data.js,
// scripts/build_vocab_fill.mjs), the similar-meaning questions
// (similar-meaning-data.js) and the practice page's rounds
// (vocab-questions.js).
const assert = require('assert');
const fs = require('fs');

(async () => {
  const m = await import('./scripts/vocab_questions.mjs');
  const sheets = await import('./scripts/render_vocab_sheets.mjs');
  const build = await import('./scripts/build_vocab_fill.mjs');

  // ─── The underlined word ───
  const t = (s, word, kana) => {
    const target = m.findTarget(m.parseSentence(s), word, kana);
    return target && `${target.text}=${target.reading}`;
  };
  assert.strictEqual(t('あには{会社|かいしゃ}に{通|かよ}っています。', '通う', 'かよう'), '通って=かよって');
  assert.strictEqual(t('{駅|えき}で{友達|ともだち}に{会|あ}います。', '会う', 'あう'), '会い=あい');
  assert.strictEqual(t('テレビを{見|み}ます。', '見る', 'みる'), '見=み');
  assert.strictEqual(t('{切手|きって}を{集|あつ}めています。', '集める', 'あつめる'), '集めて=あつめて');
  assert.strictEqual(t('{家|いえ}に{帰|かえ}ります。', '帰る', 'かえる'), '帰り=かえり');
  assert.strictEqual(t('{昨日|きのう}は{寒|さむ}かったです。', '寒い', 'さむい'), '寒かった=さむかった');
  assert.strictEqual(t('{毎日|まいにち}{勉強|べんきょう}します。', '勉強する', 'べんきょうする'), '勉強=べんきょう');
  assert.strictEqual(t('{様々|さまざま}な{国|くに}', '様々', 'さまざま'), '様々=さまざま');
  // Furigana that disagrees with the word's reading: not a question.
  assert.strictEqual(t('{今日|こんにち}は', '今日', 'きょう'), null);

  // ─── Conjugating the wrong choices ───
  const c = (w, k, form) => m.conjugateVerb(w, m.verbType(w, k), form, w);
  assert.strictEqual(c('書く', 'かく', 'te'), '書いて');
  assert.strictEqual(c('行く', 'いく', 'te'), '行って');
  assert.strictEqual(c('泳ぐ', 'およぐ', 'ta'), '泳いだ');
  assert.strictEqual(c('読む', 'よむ', 'i'), '読み');
  assert.strictEqual(c('帰る', 'かえる', 'i'), '帰り');
  assert.strictEqual(c('食べる', 'たべる', 'te'), '食べて');
  assert.strictEqual(c('買う', 'かう', 'a'), '買わ');
  assert.strictEqual(m.verbType('来る', 'くる'), null);
  assert.strictEqual(m.verbType('勉強する', 'べんきょうする'), null);

  // ─── Reading and writing sheets ───
  for (const level of m.LEVELS) {
    for (const kind of ['reading', 'writing']) {
      const qs = sheets.pickQuestions(level, kind);
      assert.strictEqual(qs.length, sheets.PER_SHEET, `${level} ${kind}`);
      for (const q of qs) assert.ok(/^[ぁ-ゖー]+$/.test(q.target.reading), q.w[0]);
      const html = sheets.renderSheet(level, kind);
      assert.strictEqual((html.match(/class="q"/g) || []).length, sheets.PER_SHEET);
      assert.ok(fs.existsSync(`kanji-sheets/tokidoki-kanji-${kind}-${level.toLowerCase()}.pdf`), `${level} ${kind} pdf`);
    }
    // Reading parts 1–6: 50 words each, no word in two parts.
    const parts = [1, 2, 3, 4, 5, 6].map(n => sheets.pickQuestions(level, 'reading', n));
    for (const qs of parts) assert.strictEqual(qs.length, sheets.PER_SHEET, `${level} reading part`);
    assert.strictEqual(new Set(parts.flat().map(q => q.w[0] + q.w[1])).size, 6 * sheets.PER_SHEET, `${level}: a word in two parts`);
    for (const n of [2, 3, 4, 5, 6]) {
      assert.ok(fs.existsSync(`kanji-sheets/tokidoki-kanji-reading-${level.toLowerCase()}-part${n}.pdf`), `${level} part ${n} pdf`);
      assert.ok(sheets.renderSheet(level, 'reading', n).includes(`Part ${n}`));
    }
    // Reading sheets give each sentence's English in the answers only, not
    // under the question; writing sheets don't give it.
    const q1 = sheets.pickQuestions(level, 'reading', 1)[0];
    const reading1 = sheets.renderSheet(level, 'reading', 1);
    const en1 = q1.w[9].replace(/&/g, '&amp;').replace(/</g, '&lt;');
    assert.ok(!reading1.includes('<div class="en">'), `${level}: English under the questions`);
    assert.ok(reading1.split('<div class="key">')[1].includes(`<span class="key-word key-en">${en1}</span>`), `${level}: English in the answers`);
    assert.ok(!sheets.renderSheet(level, 'writing').includes('key-en'));
    // The writing sheet shows the word in hiragana, never its kanji.
    for (const q of sheets.pickQuestions(level, 'writing')) {
      assert.ok(sheets.renderSheet(level, 'writing').includes(`<span class="target">${q.target.reading}</span>`));
    }
  }

  // ─── Fill in the blank ───
  assert.strictEqual(fs.readFileSync('vocab-fill-data.js', 'utf8'), build.fillFile(),
    'vocab-fill-data.js is stale: run node scripts/build_vocab_fill.mjs');
  const fill = build.fillData();
  for (const level of m.LEVELS) {
    assert.ok(fill[level].length >= sheets.FILL_PER_SHEET, `${level}: ${fill[level].length} fill-in questions`);
    for (const q of fill[level]) {
      assert.strictEqual(q.c.length, 4, q.w);
      const shown = q.c.map(x => x[0].replace(/\{([^|}]+)\|[^}]+\}/g, '$1'));
      assert.strictEqual(new Set(shown).size, 4, `${q.w}: ${shown}`);
      assert.strictEqual(new Set(q.c.map(x => x[2])).size, 4, `${q.w}: same reading twice`);
      assert.strictEqual(q.c[0][1], q.w);
    }
    assert.ok(fs.existsSync(`vocab-sheets/tokidoki-vocab-fill-${level.toLowerCase()}.pdf`));
  }
  // A verb blank: every choice in the sentence's form.
  const shu = fill.N4.find(q => q.w === '集める');
  assert.ok(shu.c.every(x => /[てで]$/.test(x[0])), JSON.stringify(shu.c));

  // ─── Similar meaning ───
  const SIMILAR = require('./similar-meaning-data.js');
  for (const level of m.LEVELS) {
    assert.strictEqual(SIMILAR[level].length, 60, level);
    assert.strictEqual(new Set(SIMILAR[level].map(q => q.q)).size, 60, `${level}: a question twice`);
    for (const q of SIMILAR[level]) {
      assert.strictEqual(q.wrong.length, 3, q.q);
      assert.strictEqual((q.q.match(/_/g) || []).length, 2, `${q.q}: one underlined part`);
      const all = [q.q, q.ok, ...q.wrong];
      for (const s of all) {
        assert.ok(!/\{[^}]*\{|\}[^{]*\}/.test(s) && (s.match(/\{/g) || []).length === (s.match(/\}/g) || []).length, `furigana markup: ${s}`);
        assert.ok(/[。？]$/.test(s), `ends with 。: ${s}`);
      }
      assert.strictEqual(new Set([q.ok, ...q.wrong]).size, 4, q.q);
      assert.ok(q.en && q.note, q.q);
      assert.ok(q.okEn && Array.isArray(q.wrongEn) && q.wrongEn.length === 3 && q.wrongEn.every(Boolean), `English for each choice: ${q.q}`);
    }
    assert.strictEqual(sheets.similarParts(level), 3);
    for (const n of [1, 2, 3]) {
      assert.ok(fs.existsSync(`vocab-sheets/tokidoki-vocab-similar-${level.toLowerCase()}${n === 1 ? '' : `-part${n}`}.pdf`), `${level} similar part ${n}`);
      assert.strictEqual((sheets.renderSimilarSheet(level, n).match(/class="mc"/g) || []).length, 20);
    }
  }

  // ─── The practice page ───
  const VQ = require('./vocab-questions.js');
  global.window = global;
  require('./vocab-fill-data.js');
  const sets = VQ.sets(global.VOCAB_FILL, SIMILAR);
  assert.deepStrictEqual(sets.map(s => s.id), ['fill-N5', 'fill-N4', 'fill-N3', 'similar-N5', 'similar-N4', 'similar-N3']);
  let seed = 1;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const set = sets[3];
  const now = 1_000_000_000_000;
  const id = k => VQ.cardId(set, set.questions[k]);
  assert.strictEqual(id(0), `vq:similar-N5:${VQ.plain(SIMILAR.N5[0].q)}`);
  assert.strictEqual(VQ.cardId(sets[0], sets[0].questions[0]), `vq:fill-N5:${global.VOCAB_FILL.N5[0].w}|${global.VOCAB_FILL.N5[0].k}`);
  // Questions 19 and 4 due, 7 not due yet, the rest new.
  const srs = { [id(19)]: { nextReview: now - 5 }, [id(4)]: { nextReview: now - 1 }, [id(7)]: { nextReview: now + 9e7 } };
  assert.deepStrictEqual(VQ.counts(set, i => srs[i], now), { due: 2, fresh: set.questions.length - 3 });
  const round = VQ.makeRound(set, i => srs[i], rand, now);
  assert.strictEqual(round.length, VQ.ROUND);
  assert.ok(round.some(q => q.i === 19) && round.some(q => q.i === 4), 'due questions come first');
  assert.ok(!round.some(q => q.i === 7), 'not due yet, while there are new ones');
  assert.strictEqual(new Set(round.map(q => q.i)).size, VQ.ROUND);
  for (const q of round) assert.deepStrictEqual(q.order.slice().sort(), [0, 1, 2, 3]);
  // All seen and none due: the ones due soonest.
  const seen = Object.fromEntries(set.questions.map((q, k) => [id(k), { nextReview: now + 1000 * (k + 1) }]));
  assert.deepStrictEqual(VQ.makeRound(set, i => seen[i], rand, now).map(q => q.i).sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  // Scoring, and what still needs answering: wrong, or marked Again.
  round.forEach((q, k) => { q.pick = k < 7 ? 0 : 2; q.grade = k === 0 ? 1 : 4; });
  assert.strictEqual(VQ.score(round), 7);
  assert.deepStrictEqual(VQ.toRedo(round).map(q => q.i), [round[0], ...round.slice(7)].map(q => q.i));
  // No question twice in a round, for every set, however the cards stand.
  for (const s of sets) {
    assert.strictEqual(new Set(s.questions.map(q => VQ.cardId(s, q))).size, s.questions.length, `${s.id}: two questions share a card`);
    for (let t = 0; t < 20; t++) {
      const states = Object.fromEntries(s.questions.map(q => [VQ.cardId(s, q), rand() < 0.5 ? undefined : { nextReview: now + (rand() - 0.5) * 1e9 }]));
      const r = VQ.makeRound(s, i => states[i], rand, now);
      assert.strictEqual(new Set(r.map(q => q.i)).size, r.length, `${s.id}: a question twice in a round`);
    }
  }
  assert.strictEqual(VQ.underlinedHtml('a_{駅|えき}_b'), 'a<span class="vq-target"><ruby>駅<rt>えき</rt></ruby></span>b');

  console.log('vocab questions: ok');
})().catch((e) => { console.error(e); process.exit(1); });
