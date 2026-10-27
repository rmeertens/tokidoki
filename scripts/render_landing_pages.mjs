#!/usr/bin/env node
// Writes the practice-first landing pages from the site's own data:
//
//   verb-conjugation-chart.html         verb chart + conjugation quiz
//   wa-vs-ga.html                       は vs が rule of thumb + quiz
//   jlpt-listening-practice.html        listening sample + level links
//
//   node scripts/render_landing_pages.mjs           write the pages
//   node scripts/render_landing_pages.mjs --check   fail if they're stale
//
// Each page opens on a playable mini quiz (landing.js reads it from the
// #lp-data JSON), with a link to the full practice right beside it and the
// reference text underneath. They wear the site's own chrome: style.css,
// the shared header (app.js), and the page nav and scripts cut from
// news.html, so edit those (not these pages) and re-run this. The chart and
// the quiz answers come from
// conjugator.js, particles-data.js / particles-notes.js and listening-data.js,
// so they can't drift from the real drills. The script also keeps these
// pages' entries in sitemap.xml, after the homepage.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://tokidoki.meertens.dev';
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const require = createRequire(import.meta.url);
const CHECK = process.argv.includes('--check');

const RUBY_RE = /([一-鿿々]+)\[([^\]]+)\]/g;
const ruby = s => s.replace(RUBY_RE, '<ruby>$1<rp>(</rp><rt>$2</rt><rp>)</rp></ruby>');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const die = m => { throw new Error(m); };

// ---- data ---------------------------------------------------------------
const C = require('../conjugator.js');
const { ALL_VERBS } = require('../verbs.js');
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ['particles-data.js', 'particles-notes.js', 'listening-data.js', 'listening-audio.js']) {
  vm.runInContext(read(f), ctx, { filename: f });
}
const W = ctx.window;

// ---- 1. verb conjugation ------------------------------------------------
const verb = k => ALL_VERBS.find(v => v.kanji === k) || die(`no verb ${k}`);
const FORM_RULE = {
  te: 'u-verbs: く→いて, ぐ→いで, す→して, む・ぶ・ぬ→んで, う・つ・る→って. ru-verbs: drop る, add て. Watch out for 行く → 行って.',
  ta: 'Built like the て-form, with た (だ after ん): 飲む → 飲んだ.',
  nai: 'u-verbs: change the last sound to its あ-row sound and add ない (う becomes わ: 買わない). ru-verbs: drop る, add ない.',
  potential: 'u-verbs: change the last sound to its え-row sound and add る (話す → 話せる). ru-verbs: drop る, add られる.',
  volitional: 'u-verbs: change the last sound to its お-row sound and add う (話す → 話そう). ru-verbs: drop る, add よう.',
};
const PICKS = [['書く', 'te'], ['行く', 'te'], ['飲む', 'ta'], ['食べる', 'nai'], ['話す', 'potential'], ['見る', 'volitional']];
const WRONG_FORMS = ['masu', 'ta', 'te', 'nai', 'potential', 'volitional', 'passive', 'causative', 'ba', 'nakatta'];

function verbQuestions() {
  return PICKS.map(([k, form]) => {
    const v = verb(k);
    const right = C.conjugate(v, form);
    if (!right) die(`${k} ${form}`);
    const wrong = [];
    for (const f of WRONG_FORMS) {
      const w = C.conjugate(v, f);
      if (f !== form && w && w !== right && !wrong.includes(w)) wrong.push(w);
    }
    return {
      prompt: `<span class="lp-form">${esc(C.FORM_INFO[form].name)}</span> of <span class="lp-word" lang="ja">${esc(v.kanji)}</span>` +
        `<span class="lp-en">${esc(v.reading)} · ${esc(v.meaning)}</span>`,
      options: [right, ...wrong.slice(0, 3)].map(esc),
      answer: 0,
      explain: `<p><strong lang="ja">${esc(v.kanji)} → ${esc(right)}</strong></p><p>${esc(FORM_RULE[form])}</p>`,
    };
  });
}

const CHART_VERBS = [['書く', 'u-verb'], ['食べる', 'ru-verb'], ['する', 'irregular'], ['来る', 'irregular']];
const CHART_FORMS = ['masu', 'masu-neg', 'masu-past', 'te', 'nai', 'ta', 'nakatta', 'tai', 'potential', 'volitional', 'passive', 'causative', 'ba', 'causative-passive'];

function chartTable() {
  const vs = CHART_VERBS.map(([k, t]) => [verb(k), t]);
  let h = '<div class="lp-scroll"><table><thead><tr><th scope="col">Form</th>' +
    vs.map(([v, t]) => `<th scope="col" lang="ja">${esc(v.kanji)}<small>${t}</small></th>`).join('') + '</tr></thead><tbody>';
  for (const f of CHART_FORMS) {
    const info = C.FORM_INFO[f];
    h += `<tr><th scope="row">${esc(info.name)}<small><span lang="ja">${esc(info.nameJp)}</span> · ${info.level}</small></th>` +
      vs.map(([v]) => `<td class="jp" lang="ja">${esc(C.conjugate(v, f) || die(`${v.kanji} ${f}`))}</td>`).join('') + '</tr>';
  }
  return h + '</tbody></table></div>';
}

const TE_ROWS = [
  ['う · つ · る', 'って', '買う → 買って · 待つ → 待って · 帰る → 帰って'],
  ['む · ぶ · ぬ', 'んで', '飲む → 飲んで · 遊ぶ → 遊んで · 死ぬ → 死んで'],
  ['く', 'いて', '書く → 書いて (exception: 行く → 行って)'],
  ['ぐ', 'いで', '泳ぐ → 泳いで'],
  ['す', 'して', '話す → 話して'],
  ['ru-verb る', 'て', '食べる → 食べて · 見る → 見て'],
];
function teTable() {
  return '<div class="lp-scroll"><table><thead><tr><th scope="col">Ending</th><th scope="col">て-form</th><th scope="col">Examples</th></tr></thead><tbody>' +
    TE_ROWS.map(([a, b, c]) => `<tr><td class="jp" lang="ja">${esc(a)}</td><td class="jp" lang="ja">${esc(b)}</td><td class="jp" lang="ja">${esc(c)}</td></tr>`).join('') +
    '</tbody></table></div>';
}

// ---- 2. は vs が --------------------------------------------------------
const WA_GA_IDS = ['wa2', 'ga1', 'ga4', 'wa13', 'ga14', 'wa8'];
const em = s => esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>');

function particleQuestions() {
  return WA_GA_IDS.map(id => {
    const item = W.PARTICLE_QUIZ_ITEMS.find(x => x.id === id) || die(`no particle item ${id}`);
    const note = W.PARTICLE_NOTES[id] || die(`no note ${id}`);
    const other = item.particle === 'は' ? 'が' : 'は';
    const why = note.not[other] || die(`no "${other}" note for ${id}`);
    return {
      prompt: `<span class="jp">${item.beforeHtml}<span class="lp-blank">＿</span>${item.afterHtml}</span><span class="lp-en">${esc(item.en)}</span>`,
      options: ['は', 'が'],
      answer: item.particle === 'は' ? 0 : 1,
      fixed: true,
      explain: `<p><strong lang="ja">${esc(item.particle)}</strong>: ${em(note.why)}</p><p><span lang="ja">${esc(other)}</span>: ${em(why)}</p>`,
    };
  });
}

const WA_GA_BODY = `
<section class="lp-ref">
  <h2 class="lis-heading">The rule of thumb</h2>
  <div class="lp-two">
    <div class="lp-card"><h3>は</h3><p>The <strong>topic</strong>: what the sentence is about, something you both already know.</p>
      <ul><li lang="ja">${ruby('私[わたし]は学生[がくせい]です。')}<em>I am a student.</em></li>
      <li lang="ja">${ruby('これは私[わたし]の傘[かさ]です。')}<em>This is my umbrella.</em></li></ul></div>
    <div class="lp-card"><h3>が</h3><p>The <strong>new information</strong>: existence, ability, likes, and the answer to a question word like 誰 or 何.</p>
      <ul><li lang="ja">${ruby('猫[ねこ]がいます。')}<em>There is a cat.</em></li>
      <li lang="ja">${ruby('誰[だれ]が来[き]ましたか。')}<em>Who came?</em></li>
      <li lang="ja">${ruby('日本語[にほんご]がわかります。')}<em>I understand Japanese.</em></li></ul></div>
  </div>
  <p>Both often share one sentence: in <span lang="ja">${ruby('私[わたし]は寿司[すし]が好[す]きです。')}</span> ("I like sushi") 私 is the topic and 寿司 is the thing that is liked.</p>
</section>`;

// ---- 3. listening -------------------------------------------------------
function listeningQuestions() {
  const sec = W.LISTENING_SECTIONS.find(s => s.id === 'sokuji') || die('no sokuji section');
  return sec.items.filter(it => it.level === 'N5' && W.LISTENING_AUDIO[`sokuji/${it.id}`]).slice(0, 6).map(it => {
    const src = W.LISTENING_AUDIO[`sokuji/${it.id}`].src;
    fs.existsSync(path.join(ROOT, src)) || die(`missing ${src}`);
    const heard = it.lines.map(l => `<span lang="ja">${ruby(l.ja)}</span> (${esc(l.en)})`).join('<br>');
    return {
      prompt: 'Listen to the line, then pick the natural reply.' +
        '<span class="lp-en">Press play, then choose 1, 2 or 3. You can replay it here; the real test plays once.</span>',
      audio: src,
      options: ['1', '2', '3'],
      answer: it.answer,
      fixed: true,
      explain: `<p>${heard}</p><ol>${it.choices.map(c => `<li><span lang="ja">${ruby(c.ja)}</span> — ${esc(c.en)}</li>`).join('')}</ol><p>${esc(it.why)}</p>`,
    };
  });
}

const LISTENING_BODY = `
<section class="lp-ref">
  <h2 class="lis-heading">Pick your level</h2>
  <p>Free JLPT-style listening (聴解) with 438 questions and 15 mock tests, scripts with furigana and English after every question.</p>
  <div class="lp-levels">
    <a class="btn-secondary" href="listening.html" data-cta>N5 practice</a><a class="btn-secondary" href="listening.html" data-cta>N4 practice</a>
    <a class="btn-secondary" href="listening.html" data-cta>N3 practice</a><a class="btn-secondary" href="listening.html" data-cta>N2 practice</a>
  </div>
</section>
<section class="lp-ref">
  <h2 class="lis-heading">What the listening section asks</h2>
  <ul>
    <li><strong lang="ja">課題理解</strong>: hear what someone has to do, then pick it from four pictures.</li>
    <li><strong lang="ja">ポイント理解</strong>: listen for one detail (when, why, which).</li>
    <li><strong lang="ja">発話表現</strong>: a picture with an arrow, then pick what that person says.</li>
    <li><strong lang="ja">即時応答</strong>: the quick-response type above: one line, three replies, pick the natural one.</li>
  </ul>
</section>`;
const VOICE_CREDIT = (read('listening.html').match(/<p class="lis-credits"[^>]*>([^<]+)<\/p>/) || die('no credits line'))[1];

// ---- pages --------------------------------------------------------------
const PAGES = [
  {
    file: 'verb-conjugation-chart.html',
    title: 'Japanese Verb Conjugation Chart (JLPT N5 & N4) | Tokidoki',
    desc: 'Free Japanese verb conjugation chart for JLPT N5 & N4 (te, ta, nai, potential, volitional, passive, causative) with a quick quiz you can start right now.',
    shortTitle: 'Japanese Verb Conjugation Chart & Quiz | Tokidoki',
    h1: 'Japanese verb conjugation chart (JLPT N5 & N4)',
    cta: { href: 'verbs.html', label: 'Practice all forms with spaced repetition →', lead: 'jump straight into the full drills →' },
    teaches: 'Japanese verb conjugation',
    hero: { face: '食', kicker: '動詞の活用 · JLPT N5 & N4', card: ['Verb Conjugation Chart', 'Every N5 & N4 form at a glance · 6-question quiz'] },
    quiz: verbQuestions(),
    body: `<section class="lp-ref"><h2 class="lis-heading">Conjugation chart</h2>${chartTable()}</section>
<section class="lp-ref"><h2 class="lis-heading">て-form endings</h2>${teTable()}</section>
<section class="lp-ref lp-next"><p>The chart above is generated by the same rules as the drills.</p><a class="btn-primary lp-btn" href="verbs.html" data-cta>Drill every form by JLPT level →</a></section>`,
  },
  {
    file: 'wa-vs-ga.html',
    title: 'は vs が: When to Use Each Japanese Particle (Quiz) | Tokidoki',
    desc: 'は or が? A short rule of thumb and a 6-question quiz on the Japanese topic marker は and the subject marker が. Free, no login.',
    shortTitle: 'は vs が — Japanese Particle Quiz | Tokidoki',
    h1: 'は vs が: which particle?',
    cta: { href: 'particles-quiz.html', label: 'Practice all particles →', lead: 'open the full particle quiz →' },
    teaches: 'Japanese particles は and が',
    hero: { face: 'は', kicker: '助詞 · Topic or subject?', card: ['は vs が', 'Topic or subject? · rule of thumb + quiz'] },
    quiz: particleQuestions(),
    body: WA_GA_BODY,
  },
  {
    file: 'jlpt-listening-practice.html',
    title: 'JLPT Listening Practice (N5–N2): Free Audio Quiz | Tokidoki',
    desc: 'Free JLPT listening practice: try real-format quick-response questions with audio right now, then continue to 438 questions and 15 mock tests for N5–N2.',
    shortTitle: 'JLPT Listening Practice (N5–N2) | Tokidoki',
    h1: 'JLPT listening practice (N5–N2)',
    cta: { href: 'listening.html', label: 'Open the full listening practice →', lead: 'open the full practice →' },
    teaches: 'JLPT listening comprehension',
    hero: { face: '聴', kicker: '聴解 · JLPT N5–N2', card: ['JLPT Listening Sampler', 'Try real-format audio questions · N5–N2'] },
    quiz: listeningQuestions(),
    body: LISTENING_BODY,
    credit: VOICE_CREDIT,
  },
];

// The site chrome every page shares, cut from news.html: its stylesheet,
// the page nav (with no page marked current) and the scripts behind the
// header (theme toggle, login and sync).
const NEWS = read('news.html');
const cut = (from, to) => {
  const i = NEWS.indexOf(from);
  const j = NEWS.indexOf(to, i);
  if (i === -1 || j === -1) die(`news.html: can't find ${from} … ${to}`);
  return NEWS.slice(i, j);
};
const STYLE = cut('  <link rel="stylesheet" href="style.css', '\n') + '\n';
const NAV = (cut('      <nav class="page-nav"', '</nav>') + '</nav>')
  .replace(/ class="page-nav-item active" href="([^"]+)" aria-current="page"/g, ' class="page-nav-item" href="$1"');
const SCRIPTS = ['app.js', 'sync-merge.js', 'progress-stats.js', 'sync.js']
  .map(f => (NEWS.match(new RegExp(`  <script src="${f.replace('.', '\\.')}[^"]*"></script>\n`)) || die(`news.html: no ${f}`))[0]).join('');

// The hand-written blog posts (blog.html lists them, with these guides).
const BLOG_POSTS = [
  ['blog-japanese-for-tourists.html', 'Japanese for Tourists', "The phrases you'll actually use · blog post"],
  ['blog-graded-stories.html', 'Learn Japanese with Graded Stories', 'How to read, and where to find stories · blog post'],
  ['blog-learning-japanese.html', "How I'm Learning Japanese", 'Tips & resources for every level · blog post'],
];

function render(p) {
  const url = `${SITE}/${p.file}`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'LearningResource', name: p.h1, description: p.desc, url,
    inLanguage: 'en', learningResourceType: 'quiz', educationalLevel: 'Beginner', isAccessibleForFree: true, teaches: p.teaches,
    isPartOf: { '@type': 'WebSite', name: 'Tokidoki', url: `${SITE}/` },
  };
  const data = { page: p.file.replace('.html', ''), cta: p.cta, questions: p.quiz };
  const json = o => JSON.stringify(o).replace(/</g, '\\u003c');
  const more = [...BLOG_POSTS, ...PAGES.filter(x => x !== p).map(x => [x.file, ...x.hero.card])]
    .map(([file, title, sub]) => `<a class="chapter-card" href="${file}">` +
      `<div class="chapter-card-title">${esc(title)}</div><div class="chapter-card-sub">${esc(sub)}</div></a>`).join('');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(p.title)}</title>
  <meta name="description" content="${esc(p.desc)}">
  <meta property="og:title" content="${esc(p.shortTitle)}">
  <meta property="og:description" content="${esc(p.desc)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="Tokidoki">
  <meta property="og:locale" content="en_US">
  <meta property="og:image" content="${SITE}/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Tokidoki — free Japanese practice, one plate at a time">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(p.shortTitle)}">
  <meta name="twitter:description" content="${esc(p.desc)}">
  <meta name="twitter:image" content="${SITE}/og-image.png">
  <link rel="canonical" href="${url}">
${STYLE}  <link rel="stylesheet" href="landing.css?v=2">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="icon" href="favicon.ico" sizes="48x48">
  <link rel="apple-touch-icon" href="apple-touch-icon.png">
  <meta name="theme-color" content="#f6f0e4" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#16141b" media="(prefers-color-scheme: dark)">
  <script type="application/ld+json">${json(ld)}</script>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXWYNZC7YH"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXWYNZC7YH');
  </script>
</head>
<body data-mode="guide">
  <!-- Written by scripts/render_landing_pages.mjs — edit that, not this file. -->
  <div id="app">

    <!-- Header (rendered by renderSharedChrome() in app.js) -->
    <div id="header-mount"></div>

    <main class="screen active lp">
${NAV}
      <section class="lis-hero lp-hero">
        <div class="lis-hero-face lp-hero-face" aria-hidden="true" lang="ja">${p.hero.face}</div>
        <div>
          <p class="lis-hero-kicker" lang="ja">${esc(p.hero.kicker)}</p>
          <h1 class="lis-hero-title">${esc(p.h1)}</h1>
          <p class="lis-hero-sub">Free, no login. Warm up with ${p.quiz.length} quick questions, or <a href="${p.cta.href}" data-cta>${p.cta.lead}</a></p>
        </div>
      </section>
      <div class="lp-quiz" id="lp-quiz"><noscript><p><a href="${p.cta.href}">${p.cta.label}</a></p></noscript></div>
      ${p.body}
      <section class="lp-ref">
        <h2 class="lis-heading">More from the blog</h2>
        <div class="chapter-grid">${more}</div>
        <p><a href="blog.html">All posts &amp; tips →</a></p>
      </section>${p.credit ? `
      <p class="lis-credits">Voices: ${esc(p.credit.replace(/^Voices:\s*/, ''))}</p>` : ''}
    </main>

  </div>

  <script type="application/json" id="lp-data">${json(data)}</script>
${SCRIPTS}  <script src="landing.js?v=2"></script>
</body>
</html>
`;
}

// ---- sitemap ------------------------------------------------------------
function renderSitemap() {
  let s = read('sitemap.xml');
  const entry = p => `  <url>\n    <loc>${SITE}/${p.file}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
  for (const p of PAGES) {
    s = s.replace(new RegExp(`  <url>\\n    <loc>${SITE}/${p.file}</loc>\\n[\\s\\S]*?</url>\\n`), '');
  }
  const home = `    <loc>${SITE}/</loc>`;
  const at = s.indexOf(home);
  if (at === -1) die('sitemap.xml: no homepage entry');
  const after = s.indexOf('</url>\n', at) + '</url>\n'.length;
  return s.slice(0, after) + PAGES.map(entry).join('') + s.slice(after);
}

// ---- write / check ------------------------------------------------------
const outputs = [...PAGES.map(p => [p.file, render(p)]), ['sitemap.xml', renderSitemap()]];
let stale = 0;
for (const [f, text] of outputs) {
  const file = path.join(ROOT, f);
  const same = fs.existsSync(file) && fs.readFileSync(file, 'utf8') === text;
  if (same) continue;
  stale++;
  if (CHECK) console.error(`stale: ${f}`);
  else { fs.writeFileSync(file, text); console.log(`wrote ${f}`); }
}
if (CHECK && stale) { console.error('Run: node scripts/render_landing_pages.mjs'); process.exit(1); }
if (!stale) console.log('landing pages up to date');
