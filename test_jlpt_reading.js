// JLPT Reading (jlpt-reading.html): the texts in jlpt-reading-data.js —
// their shape, furigana, lengths per level and answer highlights — and the
// page's markup, attempts and wiring (jlpt-reading.js).
const fs = require('fs');
const R = require('./jlpt-reading.js');
const DATA = require('./jlpt-reading-data.js');

let passed = 0, failed = 0;
function ok(cond, msg) {
  if (cond) passed++;
  else { failed++; console.log('✗ ' + msg); }
}

// ─── The texts ─────────────────────────────────────────────────────────────

const KANJI = /[㐀-鿿々]/;
// Kanji outside {漢字|かな}: every kanji run needs its furigana.
const bare = s => KANJI.test(String(s).replace(/«\d\||»/g, '').replace(/\{[^|}]+\|[^}]+\}/g, ''));
const braces = s => !/\{[^}]*$|^[^{]*\}/.test(s) && (s.match(/\{/g) || []).length === (s.match(/\}/g) || []).length;

// The official guidelines' lengths, with room either side.
const RANGE = {
  N5: { short: [60, 170], info: [150, 330] },
  N4: { short: [100, 230], info: [220, 480] },
  N3: { short: [140, 260], info: [380, 700] },
  N2: { short: [180, 340], info: [500, 800] },
};

const ids = new Set();
for (const p of DATA) {
  const at = p.id;
  ok(!ids.has(p.id), `${at}: id used twice`);
  ids.add(p.id);
  ok(p.id.startsWith(p.level.toLowerCase() + '-'), `${at}: id starts with its level`);
  ok(R.LEVELS.includes(p.level), `${at}: level ${p.level}`);
  ok(p.type in R.TYPES, `${at}: type ${p.type}`);
  ok(p.form in R.FORMS, `${at}: form ${p.form}`);
  ok(p.title && p.en && p.en.split('\n').length >= 2, `${at}: title and English`);
  ok(Array.isArray(p.words) && p.words.length >= 3 && p.words.every(w => w.length === 3 && w[2]), `${at}: a few words, [word, reading, meaning]`);
  ok(p.questions.length >= 1 && p.questions.length <= 2, `${at}: one or two questions`);
  if (p.level === 'N5' || p.type === 'short') ok(p.questions.length === 1, `${at}: one question (N5 and short texts)`);

  const len = R.length(p);
  const [lo, hi] = RANGE[p.level][p.type];
  ok(len >= lo && len <= hi, `${at}: ${len} characters, expected ${lo}–${hi} for ${p.level} ${p.type}`);

  // Furigana everywhere.
  const strings = [p.text, ...p.questions.flatMap(q => [q.q, ...q.choices.map(c => c[0])]), ...p.words.map(w => w[0])];
  strings.forEach(s => ok(!bare(s), `${at}: kanji without furigana in “${R.plain(s)}”`));
  strings.forEach(s => ok(braces(s), `${at}: unbalanced {} in “${s}”`));
  // N5 is spaced between phrases, the others aren't.
  const body = p.text.split('\n').filter(l => !/^[|#>@]/.test(l)).join('');
  if (p.level === 'N5') ok(/[ぁ-ん] [ぁ-んァ-ン㐀-鿿{]/.test(body), `${at}: N5 text spaced between phrases`);
  else ok(!/[ぁ-ん] [ぁ-ん]/.test(body.replace(/\{[^}]+\}/g, '')), `${at}: only N5 texts are spaced`);

  // Each question's answer is marked in the text («n|…»), and nothing else.
  const marks = [...p.text.matchAll(/«(\d)\|/g)].map(m => Number(m[1]));
  ok((p.text.match(/«/g) || []).length === (p.text.match(/»/g) || []).length, `${at}: unbalanced «»`);
  p.questions.forEach((q, i) => {
    ok(marks.includes(i + 1), `${at}: question ${i + 1}'s answer isn't marked in the text`);
    ok(q.q && q.en && q.why && q.why.length > 40, `${at} Q${i + 1}: question, English, explanation`);
    ok(q.choices.length === 4 && q.choices.every(c => c.length === 2 && c[0] && c[1]), `${at} Q${i + 1}: four [Japanese, English] choices`);
    ok(new Set(q.choices.map(c => R.plain(c[0]))).size === 4, `${at} Q${i + 1}: four different choices`);
  });
  ok(marks.every(n => n >= 1 && n <= p.questions.length), `${at}: a mark for a question that isn't there`);

  // The markup renders: marks balanced, every table row as wide as its header.
  const html = R.textHtml(p, new Set([1, 2]));
  ok((html.match(/<mark/g) || []).length === (html.match(/<\/mark>/g) || []).length, `${at}: <mark> balanced`);
  ok(!/[«»{}]/.test(html.replace(/<[^>]+>/g, '')), `${at}: markup left in the rendered text`);
  for (const t of html.match(/<table[\s\S]*?<\/table>/g) || []) {
    const widths = (t.match(/<tr>[\s\S]*?<\/tr>/g) || []).map(r => (r.match(/<t[hd]>/g) || []).length);
    ok(widths.every(w => w === widths[0]), `${at}: table rows of different widths (${widths.join(', ')})`);
  }
  ok(R.plain(R.instructions(p)).includes('1・2・3・4'), `${at}: instructions`);
}

for (const level of R.LEVELS) {
  for (const type of Object.keys(R.TYPES)) {
    ok(DATA.filter(p => p.level === level && p.type === type).length >= 2, `${level}: at least two ${type} texts`);
  }
}
// Harder levels read longer texts.
const avg = (level, type) => { const l = DATA.filter(p => p.level === level && p.type === type).map(R.length); return l.reduce((a, b) => a + b, 0) / l.length; };
for (const type of ['short', 'info']) {
  ok(avg('N5', type) < avg('N3', type) && avg('N4', type) < avg('N2', type) && avg('N3', type) < avg('N2', type), `${type} texts get longer with the level`);
}

// ─── Markup ────────────────────────────────────────────────────────────────

ok(R.inlineHtml('{駅|えき}で«1|{待|ま}つ»') === '<ruby>駅<rt>えき</rt></ruby>で<mark class="jr-key" data-q="1"><ruby>待<rt>ま</rt></ruby>つ</mark>', 'inlineHtml: ruby and a mark');
ok(R.inlineHtml('«2|a»', new Set([2])).includes('jr-key jr-key-on'), 'inlineHtml: an answered question\'s mark is on');
ok(R.inlineHtml('<b>') === '&lt;b&gt;', 'inlineHtml escapes');
ok(JSON.stringify(R.splitTop('{件名|けんめい}|{明日|あした}', '|')) === '["{件名|けんめい}","{明日|あした}"]', 'splitTop skips the | in furigana');
ok(JSON.stringify(R.splitTop('«1|a» | b', ' | ')) === '["«1|a»","b"]', 'splitTop skips the | in a mark');
const sample = { level: 'N3', type: 'short', form: 'email', text: '@件名|お知らせ\n# 見出し\n|! a | b\n| 1 | 2\n本文\n> 名前' };
const sh = R.textHtml(sample);
ok(sh.includes('<dl class="jr-mail-head"><div><dt>件名</dt><dd>お知らせ</dd></div></dl>'), 'textHtml: email header');
ok(sh.includes('<p class="jr-title">見出し</p>') && sh.includes('<p class="jr-right">名前</p>') && sh.includes('<p>本文</p>'), 'textHtml: heading, right-aligned line, paragraph');
ok(sh.includes('<tr><th>a</th><th>b</th></tr><tr><td>1</td><td>2</td></tr>'), 'textHtml: table');
ok(R.instructions({ level: 'N5', type: 'info', form: 'flyer', text: '# 「A」の きょうしつ' }).includes('「『A』の きょうしつ」'), 'instructions: quotes in a title become 『』');

// ─── Attempts ──────────────────────────────────────────────────────────────

let seed = 1;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const p0 = DATA.find(p => p.questions.length === 2);
const a = R.makeAttempt(p0, rand);
ok(a.length === 2 && a.every(x => x.pick === null && [...x.order].sort().join() === '0,1,2,3'), 'makeAttempt: each question\'s choices shuffled');
ok(!R.finished(a) && R.shownKeys(a).size === 0, 'a new attempt is unfinished, nothing highlighted');
a[1].pick = 0;
ok(R.shownKeys(a).has(2) && !R.shownKeys(a).has(1), 'answering question 2 highlights its part');
a[0].pick = 3;
ok(R.finished(a) && R.score(a) === 1, 'score counts the right answers');
let firstMoved = 0;
for (let i = 0; i < 50; i++) if (R.makeAttempt(p0, rand)[0].order[0] !== 0) firstMoved++;
ok(firstMoved > 20, 'the answer isn\'t always choice 1');

const n5 = DATA.filter(p => p.level === 'N5');
ok(R.nextPassage(DATA, n5[0].id, {}).id === n5[1].id, 'next: the following text of the level');
ok(R.nextPassage(DATA, n5[n5.length - 1].id, {}).id === n5[0].id, 'next: wraps round within the level');
const best = { [n5[1].id]: { score: 1, total: 1 } };
ok(R.nextPassage(DATA, n5[0].id, best).id === n5[2].id, 'next: skips texts already done perfectly');

// ─── Words and sentences ───────────────────────────────────────────────────

ok(JSON.stringify(R.splitSentences('あ。い？「う。え」お。')) === '["あ。","い？","「う。え」お。"]', 'splitSentences: at 。？, not inside 「」');
ok(JSON.stringify(R.splitSentences('{日本|にほん}。」 次')) === '["{日本|にほん}。」 ","次"]', 'splitSentences: a closing bracket or space stays with its sentence');
ok(JSON.stringify(R.enSentences('Open 9 a.m.–5 p.m. (last entry 4 p.m.) Closed Mondays. Ask Mr. Sato.')) === '["Open 9 a.m.–5 p.m. (last entry 4 p.m.) Closed Mondays.","Ask Mr. Sato."]', 'enSentences: not after a.m. / p.m. / Mr.');
ok(R.segKey('«1|{雨|あめ}»') === R.segKey('{雨|あめ}') && R.segKey('a') !== R.segKey('b'), 'segKey ignores the answer marks');
ok(JSON.stringify(R.markRanges('{雨|あめ}が«1|ふったら»。')) === '[{"n":1,"from":2,"to":6}]', 'markRanges: plain-text offsets');
ok(JSON.stringify(R.snippetPieces(['{雨|あめ}', ['が', 'が'], ['ふったら', '降る']], 'がふった')) === '[1,2]', 'snippetPieces: the words a snippet covers');

// Every sentence of every text has its own English.
for (const p of DATA) {
  ok(p.text.split('\n').length === p.en.split('\n').length, `${p.id}: one English line per line of the text`);
  p.text.split('\n').forEach((line, i) => {
    const k = R.lineKind(line);
    if (!['title', 'right', 'p'].includes(k.kind)) return;
    const ja = R.splitSentences(R.stripMarks(k.body)).length, en = R.enSentences(p.en.split('\n')[i]).length;
    ok(ja === en, `${p.id} line ${i + 1}: ${ja} Japanese sentences but ${en} English ones`);
  });
}

// jlpt-reading-words.js matches the texts (scripts/tokenize_jlpt_reading.mjs).
const rerun = 'run node scripts/tokenize_jlpt_reading.mjs';
require('./jlpt-reading-words.js');
const W = globalThis.JLPT_READING_WORDS;
const wanted = new Map();
for (const p of DATA) for (const s of R.segments(p)) {
  const key = R.segKey(s.ja);
  wanted.set(key, (wanted.get(key) || false) || s.sentence);
  const e = W.lines[key];
  ok(!!e, `${p.id}: no words for “${R.plain(s.ja)}” — ${rerun}`);
  if (!e) continue;
  ok(e.w.map(x => R.plain(typeof x === 'string' ? x : x[0])).join('') === R.plain(s.ja), `${p.id}: words of “${R.plain(s.ja)}” out of date — ${rerun}`);
  e.w.filter(Array.isArray).forEach(([, k]) => ok(!!W.gloss[k], `${p.id}: no gloss for ${k}`));
  if (s.sentence) {
    ok(Array.isArray(e.g), `${p.id}: no grammar for “${R.plain(s.ja)}” — ${rerun}`);
    (e.g || []).forEach(([gid, snip]) => ok(!!W.grammar[gid] && R.plain(s.ja).includes(snip), `${p.id}: grammar ${gid} “${snip}”`));
  }
}
ok(Object.keys(W.lines).every(k => wanted.has(k)), `words for text that's gone — ${rerun}`);
const allWords = Object.values(W.lines).flatMap(e => e.w.filter(Array.isArray));
ok(allWords.length > 3000, `${allWords.length} tappable words`);
// Grammar of notices is explained where it's used.
const used = new Set(Object.values(W.lines).flatMap(e => (e.g || []).map(([g]) => g)));
for (const g of ['tadashi', 'nao', 'baai', 'o-kudasai', 'tsukimashite', 'sasete-itadaku', 'te-itadaku', 'ni-kagiri', 'sou-hearsay', 'made-ni']) ok(used.has(g), `grammar ${g} found somewhere`);
const sentenceG = (id, n) => W.lines[R.segKey(R.sentences(DATA.find(p => p.id === id))[n].ja)].g.map(([g]) => g);
ok(!sentenceG('n3-notice-water', 5).includes('o-kudasai'), 'ためておいてください is not お〜ください');
ok(sentenceG('n2-email-shipping', 4).includes('tsukimashite') && sentenceG('n2-email-shipping', 4).includes('sasete-itadaku'), 'つきましては … 改定させていただく');
// Numbers with a counter are one word, glossed from the counter.
ok(W.gloss['1,000円(1,000えん)'] && W.gloss['1,000円(1,000えん)'][1] === '1,000 yen', '1,000円 is one word');
ok(W.gloss['金(きん)'] && /Friday/.test(W.gloss['金(きん)'][1]), '（金） is Friday');

// Rendering: the words and the highlights cover the text exactly.
const strip = h => h.replace(/<rt>[^<]*<\/rt>/g, '').replace(/<[^>]+>/g, '').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
for (const p of DATA) {
  p.text.split('\n').forEach((line, i) => {
    const k = R.lineKind(line);
    const parts = k.cells || [k.body];
    for (const m of parts) {
      if (!R.stripMarks(m || '').trim()) continue;
      const html = R.wordsHtml(m, { words: W, shown: new Set([1, 2]), split: !k.cells, line: i });
      ok(strip(html) === R.plain(m), `${p.id} line ${i + 1}: rendered words differ from the text`);
      if (/«\d\|/.test(m)) ok(html.includes('jr-key-on'), `${p.id} line ${i + 1}: answer highlight lost`);
    }
  });
}
const wh = R.wordsHtml('{雨|あめ}がふったら。', { words: W, split: true, line: 3 });
ok(/class="jr-sent" data-sid="3:0"/.test(wh) || !W.lines[R.segKey('{雨|あめ}がふったら。')], 'wordsHtml: sentences carry their sid');

// ─── The page ──────────────────────────────────────────────────────────────

const html = fs.readFileSync('jlpt-reading.html', 'utf8');
ok(html.includes('data-mode="jlpt-reading"') && html.includes('jlpt-reading.js') && html.includes('jlpt-reading-data.js'), 'page loads its scripts');
ok(html.includes('<link rel="canonical" href="https://tokidoki.meertens.dev/jlpt-reading.html">') && html.includes('og:url" content="https://tokidoki.meertens.dev/jlpt-reading.html"') && html.includes('G-XXWYNZC7YH') && html.includes('og-image.png') && html.includes('favicon.svg'), 'page head');
ok((html.match(/<h1[ >]/g) || []).length === 1 && /<section id="seo-content"[^>]*>\s*<h1>/.test(html), 'one h1, first in #seo-content');
for (const id of ['jr-panel', 'jr-panel-body', 'jr-panel-close', 'jr-tools', 'jr-view-text', 'jr-view-sentences', 'jr-opt-english', 'jr-english-wrap', 'jr-tools-hint', 'jr-levels', 'jr-list-short', 'jr-list-info', 'jr-level-progress', 'jr-opt-furigana', 'jr-opt-furigana-q', 'screen-jlpt-reading', 'jr-title', 'jr-quit', 'jr-instructions', 'jr-paper', 'jr-questions', 'jr-after', 'jr-score', 'jr-score-msg', 'jr-translation', 'jr-words', 'btn-jr-next', 'btn-jr-retry', 'btn-jr-home', 'btn-jr-reset']) {
  ok(html.includes(`id="${id}"`), `page has #${id}`);
}
ok(html.includes('pronounce.js') && html.includes('word-lookups.js') && fs.readFileSync('jlpt-reading.js', 'utf8').includes("'jlpt-reading-words.js?v="), 'page loads the word panel\'s scripts (and the words once needed)');
ok(fs.readFileSync('sitemap.xml', 'utf8').includes('/jlpt-reading.html</loc>'), 'in sitemap.xml');
ok(fs.readFileSync('app.js', 'utf8').includes("mode === 'jlpt-reading'"), 'app.js leaves the page to jlpt-reading.js');
ok(/tokidoki_jlpt_reading: mergeGameStore/.test(fs.readFileSync('sync-merge.js', 'utf8')), 'sync-merge.js merges the scores');
ok(fs.readFileSync('index.html', 'utf8').includes('href="jlpt-reading.html"'), 'the homepage links to it');
const missing = fs.readdirSync('.').filter(f => f.endsWith('.html') && fs.readFileSync(f, 'utf8').includes('class="page-nav"'))
  .filter(f => !fs.readFileSync(f, 'utf8').includes('href="jlpt-reading.html"'));
ok(!missing.length, 'every page nav links to it' + (missing.length ? ': ' + missing.join(', ') : ''));

console.log(`jlpt reading: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
