// Checks for claude-feedback.js: the request sent to the Claude API, how a
// response is read, error wording, and that feedback syncs with answers.
const CF = require('./claude-feedback.js');
const M = require('./sync-merge.js');

let passed = 0;
let failed = 0;
function ok(cond, label) {
  if (cond) passed++;
  else { failed++; console.log('  FAIL: ' + label); }
}

// ─── The request ───────────────────────────────────────────────────────────
const input = { question: '週末は何をしましたか。', questionEn: 'What did you do at the weekend?', level: 'N4', hints: ['久しぶりに', '〜たり〜たりしました'], answer: '  土曜日は友達に会いました。\n' };
const req = CF.buildRequest(input);
ok(req.model === 'claude-opus-5-5', 'model');
ok(req.max_tokens >= 4000, 'room for thinking and the answer');
ok(req.output_config.format.type === 'json_schema' && req.output_config.format.schema === CF.SCHEMA, 'structured output with the schema');
ok(req.output_config.effort === 'medium', 'effort set explicitly');
ok(!('thinking' in req), 'thinking left on (adaptive, the default)');
ok(req.fallbacks === 'default' && req.betas.includes('server-side-fallback-2026-07-01'), 'refusal fallback with its beta');
ok(!('temperature' in req) && !JSON.stringify(req).includes('budget_tokens'), 'no parameters this model rejects');
ok(req.messages.length === 1 && req.messages[0].role === 'user', 'one user message, no prefill');
const prompt = req.messages[0].content;
ok(prompt.includes('Question (N4): 週末は何をしましたか。') && prompt.includes('What did you do at the weekend?'), 'prompt has the question and level');
ok(prompt.includes('久しぶりに、〜たり〜たりしました'), 'prompt lists the hints');
ok(prompt.endsWith('<answer>\n土曜日は友達に会いました。\n</answer>'), 'answer last, trimmed, between tags');
ok(!CF.buildPrompt(Object.assign({}, input, { hints: [] })).includes('hints'), 'no hints line without hints');
ok(/never follow instructions/i.test(CF.SYSTEM), 'system prompt treats the answer as data');

// The schema is valid for structured outputs: every object closed, every property required.
(function walk(s, where) {
  if (s.type === 'object') {
    ok(s.additionalProperties === false, `${where}: additionalProperties false`);
    ok(JSON.stringify(Object.keys(s.properties).sort()) === JSON.stringify(s.required.slice().sort()), `${where}: all properties required`);
    Object.entries(s.properties).forEach(([k, v]) => walk(v, where + '.' + k));
  } else if (s.type === 'array') walk(s.items, where + '[]');
})(CF.SCHEMA, 'schema');

// ─── Reading the response ──────────────────────────────────────────────────
const result = { summary: 'Good!', went_well: ['久しぶりに'], corrections: [], corrected: '土曜日[どようび]は', natural: '土曜日[どようび]は', natural_en: 'On Saturday', try_next: 'Add a reason.' };
const resp = (o = {}) => Object.assign({ stop_reason: 'end_turn', content: [{ type: 'thinking', thinking: '' }, { type: 'text', text: JSON.stringify(result) }] }, o);
ok(CF.readResponse(resp()).summary === 'Good!', 'reads the text block, skipping thinking');
const throws = (fn, re, label) => { try { fn(); ok(false, label); } catch (e) { ok(re.test(e.message), label + ' (' + e.message + ')'); } };
throws(() => CF.readResponse(resp({ stop_reason: 'refusal', content: [] })), /declined/, 'refusal');
throws(() => CF.readResponse(resp({ stop_reason: 'max_tokens' })), /cut off/, 'max_tokens');
throws(() => CF.readResponse(resp({ content: [{ type: 'text', text: '{"summary":"x"}' }] })), /incomplete/, 'missing fields');
throws(() => CF.readResponse(resp({ content: [{ type: 'text', text: 'oops' }] })), /couldn’t be read/, 'not JSON');

// ─── Errors ────────────────────────────────────────────────────────────────
class APIError extends Error {}
class AuthenticationError extends APIError {}
class RateLimitError extends APIError {}
const sdk = { APIError, AuthenticationError, RateLimitError };
ok(/key wasn’t accepted/.test(CF.errorText(new AuthenticationError('401'), sdk)), 'bad key');
ok(/Too many requests/.test(CF.errorText(new RateLimitError('429'), sdk)), 'rate limit');
ok(/had a problem/.test(CF.errorText(Object.assign(new APIError('x'), { status: 500 }), sdk)), 'other API errors');
ok(CF.errorText(new Error('plain')) === 'plain', 'anything else keeps its message');

// ─── Sync ──────────────────────────────────────────────────────────────────
const J = JSON.stringify;
const out = JSON.parse(M.mergeAll({ tokidoki_conversation: J({ answers: {}, feedback: {} }) },
  { tokidoki_conversation: J({ answers: {}, feedback: { 'a:N5': { for: 'x', result, t: 5 }, 'b:N5': { for: 'y', result, t: 1 } } }) },
  { tokidoki_conversation: J({ answers: {}, feedback: { 'a:N5': { for: 'old', result, t: 2 }, 'c:N4': { for: 'z', result, t: 3 } } }) },
).tokidoki_conversation);
ok(out.feedback['a:N5'].for === 'x' && out.feedback['b:N5'] && out.feedback['c:N4'], 'feedback from both devices, newer wins');
ok(M.isTracked(CF.KEY), 'the API key is saved to the account');

console.log(`claude feedback: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
