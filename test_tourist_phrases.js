// Checks the "Japanese for tourists" blog post (blog-japanese-for-tourists.html):
// its phrase sections are up to date with tourist-phrases-data.js, the
// recording matches the phrases, and every phrase has its times on the page.
const fs = require('fs');
const { execFileSync } = require('child_process');
const T = require('./tourist-phrases-data.js');

let passed = 0;
let failed = 0;
function check(ok, label) {
  if (ok) passed++;
  else { failed++; console.log(`  FAIL: ${label}`); }
}

const script = JSON.parse(execFileSync('node', ['scripts/render_tourist_post.mjs', '--script'], { encoding: 'utf8' }));
const rec = JSON.parse(fs.readFileSync('audio/tourist/phrases.json', 'utf8'));
check(rec.hash === script.hash, 'audio/tourist/phrases.json is stale: re-run scripts/generate_tourist_audio.py');
check(fs.existsSync(rec.src), `${rec.src} is missing`);

let fresh = true;
try { execFileSync('node', ['scripts/render_tourist_post.mjs', '--check'], { stdio: 'pipe' }); } catch { fresh = false; }
check(fresh, 'blog-japanese-for-tourists.html is stale: run node scripts/render_tourist_post.mjs');

const page = fs.readFileSync('blog-japanese-for-tourists.html', 'utf8');
const data = JSON.parse(page.match(/<script type="application\/json" id="pb-data">(.*?)<\/script>/)[1]);
let last = 0;
for (const p of T.phrases()) {
  const t = data.t[p.id];
  check(t && t[1] > t[0], `${p.id}: no recording times on the page`);
  check(!t || t[0] >= last, `${p.id}: recorded out of order`);
  if (t) last = t[1];
  check(/^[A-Z]/.test(p.ro) && !/[぀-ヿ一-鿿]/.test(p.ro), `${p.id}: romaji should start with a capital and have no Japanese`);
  check(!/[〜~]/.test(p.jp), `${p.id}: write a full example, not a pattern with 〜 (it's recorded)`);
}
for (const v of Object.values(T.VOICES)) check(page.includes(`VOICEVOX:${v.name}`), `voice ${v.name} not credited`);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
