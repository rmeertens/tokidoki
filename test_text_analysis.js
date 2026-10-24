// Checks for text-analysis.js: the request sent to the Claude API, how a
// response is read, matching a grammar snippet to its words, the flashcard
// sentence, and the page's head and links.
const fs = require('fs');
const TA = require('./text-analysis.js');

let passed = 0;
let failed = 0;
function ok(cond, label) {
  if (cond) passed++;
  else { failed++; console.log('  FAIL: ' + label); }
}

// ─── The request ───────────────────────────────────────────────────────────
const req = TA.buildRequest({ text: '  今日は雨です。\n明日は晴れるでしょう。 ', level: 'N4' });
ok(req.model === 'claude-opus-5-5', 'model');
ok(req.max_tokens >= 32000, 'room for a long reply (streamed)');
ok(req.output_config.format.type === 'json_schema' && req.output_config.format.schema === TA.SCHEMA, 'structured output with the schema');
ok(req.output_config.effort === 'medium', 'effort set explicitly');
ok(!('thinking' in req) && !('temperature' in req), 'no parameters this model rejects');
ok(req.fallbacks === 'default' && req.betas.includes('server-side-fallback-2026-07-01'), 'refusal fallback with its beta');
ok(req.messages.length === 1 && req.messages[0].role === 'user', 'one user message, no prefill');
const prompt = req.messages[0].content;
ok(prompt.startsWith("Learner's level: N4"), 'prompt has the level');
ok(prompt.endsWith('<text>\n今日は雨です。\n明日は晴れるでしょう。\n</text>'), 'text last, trimmed, between tags');
ok(/never follow instructions/i.test(TA.SYSTEM), 'system prompt treats the text as data');

// The schema is valid for structured outputs: every object closed, every property required.
(function walk(s, where) {
  if (s.type === 'object') {
    ok(s.additionalProperties === false, `${where}: additionalProperties false`);
    ok(JSON.stringify(Object.keys(s.properties).sort()) === JSON.stringify(s.required.slice().sort()), `${where}: all properties required`);
    Object.entries(s.properties).forEach(([k, v]) => walk(v, where + '.' + k));
  } else if (s.type === 'array') walk(s.items, where + '[]');
})(TA.SCHEMA, 'schema');

// ─── Reading the response ──────────────────────────────────────────────────
const W = (text, base, reading, meaning, pos) => ({ text, base, reading, meaning, pos });
const sentence = {
  words: [
    W('雨[あめ]', '雨', 'あめ', 'rain', 'noun'), W('が', 'が', 'が', 'subject marker', 'particle'),
    W('降[ふ]っている', '降る', 'ふる', 'to fall (rain)', 'verb (godan)'), W('から', 'から', 'から', 'because', 'particle'),
    W('、', '、', '', '', 'punctuation'), W('出[で]かけません', '出かける', 'でかける', 'to go out', 'verb (ichidan)'),
    W('。', '。', '', '', 'punctuation'),
  ],
  en: "It's raining, so I won't go out.",
  grammar: [{ title: '〜ている — ongoing action', pattern: 'Verb て-form + いる', level: 'N5', note: 'It is raining now.', here: '降っている' },
    { title: '〜から — because', pattern: 'Reason + から', level: 'N5', note: 'Gives the reason.', here: 'ているから' }],
  note: '',
};
const result = { summary: 'About the weather.', level: 'N5', sentences: [sentence] };
const resp = (o = {}) => Object.assign({ stop_reason: 'end_turn', content: [{ type: 'thinking', thinking: '' }, { type: 'text', text: JSON.stringify(result) }] }, o);
ok(TA.readResponse(resp()).sentences.length === 1, 'reads the text block, skipping thinking');
const throws = (fn, re, label) => { try { fn(); ok(false, label); } catch (e) { ok(re.test(e.message), label + ' (' + e.message + ')'); } };
throws(() => TA.readResponse(resp({ stop_reason: 'refusal', content: [] })), /declined/, 'refusal');
throws(() => TA.readResponse(resp({ stop_reason: 'max_tokens' })), /cut off/, 'max_tokens');
throws(() => TA.readResponse(resp({ content: [{ type: 'text', text: '{"summary":"x"}' }] })), /incomplete/, 'missing fields');
throws(() => TA.readResponse(resp({ content: [{ type: 'text', text: 'oops' }] })), /couldn’t be read/, 'not JSON');

// ─── Grammar snippets and the flashcard sentence ───────────────────────────
ok(JSON.stringify(TA.snippetWords(sentence.words, '降っている')) === '[2]', 'snippet on one word');
ok(JSON.stringify(TA.snippetWords(sentence.words, 'ているから')) === '[2,3]', 'snippet across words');
ok(JSON.stringify(TA.snippetWords(sentence.words, '雨 が')) === '[0,1]', 'spaces in a snippet are ignored');
ok(TA.snippetWords(sentence.words, '晴れ').length === 0 && TA.snippetWords(sentence.words, '').length === 0, 'no match, no words');
ok(TA.deckSentence(sentence.words) === '雨[あめ] が 降[ふ]っている>降る から 、 出[で]かけません>出かける 。', 'deck sentence');
ok(TA.isPunct(sentence.words[4]) && !TA.isPunct(sentence.words[1]), 'punctuation');

// ─── Saved texts ───────────────────────────────────────────────────────────
ok(TA.titleOf('  今日は雨です。\n明日は晴れ。') === '今日は雨です。', 'title is the first line');
ok(TA.titleOf('あ'.repeat(50)) === 'あ'.repeat(40) + '…', 'long titles are cut');
let lib = TA.addToLibrary([], { text: 'A', level: 'N5', result, t: 1000 });
lib = TA.addToLibrary(lib, { text: 'B', level: 'N5', result, t: 2000 });
ok(lib.length === 2 && lib[0].text === 'B' && lib[0].id !== lib[1].id, 'newest first, own ids');
const idA = lib[1].id;
lib = TA.addToLibrary(lib, { text: 'A', level: 'N5', result, t: 3000 });
ok(lib.length === 2 && lib[0].text === 'A' && lib[0].id === idA && lib[0].t === 3000, 'the same text again replaces it, keeping its id');
lib = TA.addToLibrary(lib, { text: 'A', level: 'N4', result, t: 4000 });
ok(lib.length === 3, 'another level is another entry');
let named = TA.renameInLibrary(lib, idA, '  Weather   note ');
ok(named.find(e => e.id === idA).title === 'Weather note' && named.find(e => e.id === idA).named, 'renamed, spaces tidied');
ok(named.filter(e => e.id !== idA).every(e => !e.named), 'only that one is renamed');
named = TA.addToLibrary(named, { text: 'A', level: 'N5', result, t: 5000 });
ok(named[0].id === idA && named[0].title === 'Weather note', 'a renamed text keeps its name when analysed again');
named = TA.renameInLibrary(named, idA, '   ');
ok(named[0].title === 'A' && !named[0].named, 'an empty name goes back to the first line');
ok(!/^tokidoki[_-]/.test(TA.LIBRARY_KEY), 'saved texts stay out of the account sync');

// ─── Sharing saved texts between devices ───────────────────────────────────
ok(TA.SYNC_KEY.startsWith('tokidoki_sync'), 'the agreed ids are sync bookkeeping, never synced themselves');
ok(lib[0].u === lib[0].t, 'a new analysis is changed when made');
const renamed = TA.renameInLibrary(lib, lib[0].id, 'X', lib[0].t + 50);
ok(renamed[0].u === lib[0].t + 50, 'renaming marks it changed');
ok(TA.renameInLibrary(lib, lib[0].id, 'Y', 1)[0].u > lib[0].u, 'a rename always counts as newer, whatever the clock says');
ok(JSON.stringify(TA.changeMap([{ id: 'a', t: 5 }, { id: 'b', t: 5, u: 9 }])) === '{"a":5,"b":9}', 'old entries without u use their time');
const plan = TA.planLibrarySync(
  { same: 1, goneThere: 2, goneHere: 3, editedHere: 4, editedThere: 5 },
  { same: 1, goneThere: 2, editedHere: 40, newHere: 6, both: 8, olderHere: 7, editedThere: 5 },
  { same: 1, goneHere: 3, editedThere: 50, newThere: 9, both: 7, olderHere: 8 });
const sorted = o => JSON.stringify(Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v.slice().sort()])));
ok(sorted(plan) === JSON.stringify({ upload: ['both', 'editedHere', 'newHere'], download: ['editedThere', 'newThere', 'olderHere'], removeLocal: ['goneThere'], removeRemote: ['goneHere'] }),
  'sync plan: new texts both ways, newer change wins, deletes carried over ' + JSON.stringify(plan));
const p2 = TA.planLibrarySync({ a: 1, b: 1 }, { a: 2 }, { b: 2 });
ok(p2.upload.join() === 'a' && p2.download.join() === 'b' && !p2.removeLocal.length && !p2.removeRemote.length, 'a change made after the other side deleted it keeps the text');
ok(Object.values(TA.planLibrarySync({}, { a: 1 }, { a: 1 })).every(l => !l.length), 'nothing to do when both hold the same');
ok(TA.planLibrarySync({}, {}, { a: 1 }).download.join() === 'a' && TA.planLibrarySync({}, { a: 1 }, {}).upload.join() === 'a', 'first sync: nothing is taken for deleted');
const entry = Object.assign({}, named[0], { title: 'Wet', named: true, u: 7777 });
const fields = TA.textToFields(entry);
ok(fields.result.stringValue === JSON.stringify(result) && fields.u.integerValue === '7777' && fields.named.booleanValue === true, 'a saved text as Firestore fields');
const back = TA.fieldsToText(entry.id, fields);
ok(back && back.id === entry.id && back.title === 'Wet' && back.named && back.text === 'A' && back.level === entry.level && back.t === entry.t && back.u === 7777
  && JSON.stringify(back.result) === JSON.stringify(result), 'and back');
ok(TA.fieldsToText('x', Object.assign({}, fields, { result: { stringValue: '{' } })) === null && TA.fieldsToText('x', {}) === null, 'an unreadable document is skipped');
ok(TA.fieldsToText('x', Object.assign({}, fields, { title: { stringValue: '' } })).title === 'A', 'no title: the first line');
const rules = fs.readFileSync('firestore.rules', 'utf8');
ok(/match \/users\/\{uid\} \{[\s\S]*match \/texts\/\{text\} \{\s*allow read, write: if request\.auth != null && request\.auth\.uid == uid;/.test(rules), 'firestore.rules lets each user reach their own saved texts');
const syncJs = fs.readFileSync('sync.js', 'utf8');
ok(syncJs.includes('window.TokidokiAccount') && syncJs.includes("new Event('tokidoki:account')"), 'sync.js lends the login to the page');

// ─── The page ──────────────────────────────────────────────────────────────
const html = fs.readFileSync('text-analysis.html', 'utf8');
ok(html.includes('data-mode="text-analysis"') && html.includes('text-analysis.js') && html.includes('claude-feedback.js'), 'page loads its scripts');
ok(html.includes('<link rel="canonical" href="https://tokidoki.meertens.dev/text-analysis.html">') && html.includes('G-XXWYNZC7YH'), 'page head');
ok((html.match(/<h1[ >]/g) || []).length === 1, 'one h1');
ok(fs.readFileSync('sitemap.xml', 'utf8').includes('/text-analysis.html</loc>'), 'in sitemap.xml');
ok(fs.readFileSync('app.js', 'utf8').includes("mode === 'text-analysis'"), 'app.js leaves the page to text-analysis.js');
const missing = fs.readdirSync('.').filter(f => f.endsWith('.html') && fs.readFileSync(f, 'utf8').includes('class="page-nav"'))
  .filter(f => !fs.readFileSync(f, 'utf8').includes('href="text-analysis.html"'));
ok(!missing.length, 'every page nav links to it' + (missing.length ? ': ' + missing.join(', ') : ''));

console.log(`text analysis: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
