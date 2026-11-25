// Checks the practice-first landing pages written by
// scripts/render_landing_pages.mjs: they're up to date, each has the head
// CLAUDE.md asks for, one visible <h1>, the quiz data is sound, and each is
// in sitemap.xml.
const fs = require('fs');
const { execFileSync } = require('child_process');

let passed = 0, failed = 0;
function ok(cond, label) {
  if (cond) passed++;
  else { failed++; console.log(`  FAIL: ${label}`); }
}

const PAGES = ['verb-conjugation-chart', 'wa-vs-ga', 'jlpt-listening-practice', 'grammar-cheatsheet'];
const NO_QUIZ = ['verb-conjugation-chart', 'grammar-cheatsheet']; // the chart / list is the page
const sitemap = fs.readFileSync('sitemap.xml', 'utf8');

try {
  execFileSync('node', ['scripts/render_landing_pages.mjs', '--check'], { stdio: 'pipe' });
  ok(true, 'up to date');
} catch (e) {
  ok(false, 'pages are stale: run node scripts/render_landing_pages.mjs');
}

for (const name of PAGES) {
  const file = `${name}.html`;
  console.log(`Testing ${file}`);
  const html = fs.readFileSync(file, 'utf8');
  const url = `https://tokidoki.meertens.dev/${file}`;
  const title = ((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '').replace(/&amp;/g, '&');
  ok(title.length >= 10 && title.length <= 62, `${file}: title length (${title.length})`);
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  ok(desc.length >= 80 && desc.length <= 170, `${file}: description length (${desc.length})`);
  ok(html.includes(`<link rel="canonical" href="${url}">`), `${file}: canonical`);
  ok(html.includes(`<meta property="og:url" content="${url}">`), `${file}: og:url`);
  ok(html.includes('og-image.png') && html.includes('summary_large_image'), `${file}: share image`);
  ok(html.includes('G-XXWYNZC7YH'), `${file}: Google tag`);
  ok((html.match(/<h1[ >]/g) || []).length === 1, `${file}: exactly one h1`);
  ok(html.includes('landing.js'), `${file}: landing.js`);
  ok(sitemap.includes(`<loc>${url}</loc>`), `${file}: in sitemap.xml`);
  if (NO_QUIZ.includes(name)) { ok(!html.includes('id="lp-quiz"'), `${file}: no quiz`); continue; }
  ok(html.includes('id="lp-quiz"'), `${file}: quiz mount`);

  const m = html.match(/<script type="application\/json" id="lp-data">([\s\S]*?)<\/script>/);
  ok(!!m, `${file}: lp-data present`);
  if (!m) continue;
  const data = JSON.parse(m[1]);
  ok(data.questions.length >= 5, `${file}: at least 5 questions`);
  ok(fs.existsSync(data.cta.href), `${file}: cta target exists`);
  data.questions.forEach((q, i) => {
    const label = `${file} q${i + 1}`;
    ok(q.answer >= 0 && q.answer < q.options.length, `${label}: answer in range`);
    ok(new Set(q.options).size === q.options.length, `${label}: options are distinct`);
    ok(q.explain && q.explain.length > 10, `${label}: has an explanation`);
    if (q.audio) ok(fs.existsSync(q.audio), `${label}: audio file exists`);
  });
}

// The grammar cheatsheet: every point has its one line, examples and
// exceptions (render_landing_pages.mjs also refuses examples with kanji
// lacking furigana), and the ids that deep links use are unique.
{
  const html = fs.readFileSync('grammar-cheatsheet.html', 'utf8');
  const items = html.match(/<details class="gc-item"[\s\S]*?<\/details>/g) || [];
  ok(items.length >= 100, `grammar cheatsheet: at least 100 points (${items.length})`);
  const ids = items.map(x => (x.match(/ id="([^"]+)"/) || [])[1]);
  ok(new Set(ids).size === ids.length, 'grammar cheatsheet: unique ids');
  items.forEach((x, i) => {
    const label = `grammar point ${ids[i]}`;
    ok(/data-lv="N[345]"/.test(x), `${label}: level`);
    ok(/class="gc-m">[^<]+</.test(x) && /class="gc-r">./.test(x), `${label}: meaning and rule`);
    ok(/class="gc-ja"[^>]*>.*<b>/.test(x), `${label}: an example marking the grammar`);
    ok(/class="gc-warn"/.test(x), `${label}: exceptions`);
  });
  for (const page of ['index.html', 'blog.html']) {
    ok(fs.readFileSync(page, 'utf8').includes('href="grammar-cheatsheet.html"'), `${page} links to the grammar cheatsheet`);
  }
}

ok(fs.readFileSync('index.html', 'utf8').includes('href="wa-vs-ga.html"'), 'homepage links to the landing pages');

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
