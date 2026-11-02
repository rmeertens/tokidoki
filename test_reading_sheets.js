// Kanji reading worksheets (scripts/render_reading_sheets.mjs): the
// underlined span and its answer, and that every level fills a sheet.
const assert = require('assert');
const fs = require('fs');

(async () => {
  const m = await import('./scripts/render_reading_sheets.mjs');
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

  for (const level of m.LEVELS) {
    const qs = m.pickQuestions(level);
    assert.strictEqual(qs.length, m.PER_SHEET, level);
    for (const q of qs) assert.ok(/^[ぁ-ゖー]+$/.test(q.target.reading), q.w[0]);
    const html = m.renderSheet(level);
    assert.strictEqual((html.match(/class="q"/g) || []).length, m.PER_SHEET);
    assert.ok(fs.existsSync(`kanji-sheets/tokidoki-kanji-reading-${level.toLowerCase()}.pdf`), level);
  }
  console.log('reading sheets: ok');
})().catch((e) => { console.error(e); process.exit(1); });
