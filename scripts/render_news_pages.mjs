#!/usr/bin/env node
// Writes the News pages from news-data.js, news-words.js and news-audio.js:
//
//   news-<id>.html          one per story, carrying just that story's text,
//                           words and recording times;
//   news-week-<monday>.html the headlines of one week, Monday to Sunday;
//   news.html               the last seven days of headlines and a list of
//                           the weeks (its head, nav and scripts are the
//                           template for the others, so edit it and re-run).
//
//   node scripts/render_news_pages.mjs
//
// So adding a day's news rewrites only news.html, this week's page, the new
// stories and the one story before them (its "newer" link) — every other
// page stays as it was, and no page grows with the archive. It also removes
// pages for stories no longer in the data, and keeps sitemap.xml's news
// pages in step, after news.html. The pages are filled in by news.js; the
// static text here is what search engines and no-JS readers see.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://tokidoki.meertens.dev';
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(read('news-data.js'), ctx);
vm.runInContext(read('news-words.js'), ctx);
vm.runInContext(read('news-audio.js'), ctx);
const { NEWS_ITEMS, NEWS_WORDS, NEWS_AUDIO } = ctx.window;
const News = createRequire(import.meta.url)(path.join(ROOT, 'news.js'));
const { LEVELS, weekOf, weekFile, formatDate } = News;
// How many days of news the index shows.
const INDEX_DAYS = 7;

const RUBY_RE = /([一-鿿々]+)\[([^\]]+)\]/g;
const plain = s => s.replace(RUBY_RE, '$1');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pageFile = News.pageFile;
const json = v => JSON.stringify(v).replace(/</g, '\\u003c');

// Structured data so search engines know each page is a dated article.
// `<` is escaped so no text can close the script tag.
const jsonLd = (item, url) => JSON.stringify([{
  '@context': 'https://schema.org',
  '@type': 'NewsArticle',
  headline: item.titleEn,
  description: `${item.titleEn}, rewritten in easy Japanese for JLPT N5, N4 and N3 learners.`,
  url,
  inLanguage: 'ja',
  datePublished: item.date,
  dateModified: item.date,
  image: [`${SITE}/og-image.png`],
  mainEntityOfPage: url,
  isAccessibleForFree: true,
  author: { '@type': 'Organization', name: 'Tokidoki', url: `${SITE}/` },
  publisher: { '@type': 'Organization', name: 'Tokidoki', url: `${SITE}/` },
}, {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Tokidoki', item: `${SITE}/` },
    { '@type': 'ListItem', position: 2, name: 'News', item: `${SITE}/news.html` },
    { '@type': 'ListItem', position: 3, name: item.titleEn, item: url },
  ],
}]).replace(/</g, '\\u003c');

// Search results cut titles at about 60 characters and descriptions at about
// 160, so the headline comes first and the longest tail that still fits
// follows it (or the last, shortest one).
const fit = (head, tails, max) => tails.map(t => head + t).find(s => s.length <= max) || head + tails[tails.length - 1];
const newsTitle = h => fit(h, [' — Easy Japanese News | Tokidoki', ' | Easy Japanese News', ' | Tokidoki'], 65);
const newsDesc = h => fit(`${h}.`, [
  ' Read it in easy Japanese at JLPT N5, N4 or N3, with furigana, audio, and the words and grammar of every line.',
  ' In easy Japanese at JLPT N5, N4 or N3, with furigana, audio, words and grammar.',
  ' In easy Japanese (JLPT N5–N3) with furigana and audio.',
  ' Easy Japanese news, N5–N3.',
], 160);

// The pieces of news.html every story page reuses.
const index = read('news.html');
const cut = (from, to) => {
  const i = index.indexOf(from);
  const j = index.indexOf(to, i);
  if (i === -1 || j === -1) throw new Error(`news.html: can't find ${from} … ${to}`);
  return index.slice(i, j);
};
const headExtras = cut('  <link rel="stylesheet"', '</head>');
const nav = cut('      <nav class="page-nav"', '</nav>') + '</nav>';
const scripts = cut('  <script src="kanji-quiz-data.js">', '  <!-- Static content');
const DATA_RE = /<script id="news-page-data">[\s\S]*?<\/script>/;
if (!DATA_RE.test(scripts)) throw new Error('news.html: no <script id="news-page-data">');
// The scripts, with `data` (window.NAME = value) as the page's own data.
const scriptsWith = data => scripts.replace(DATA_RE, () => `<script id="news-page-data">\n${
  Object.entries(data).map(([k, v]) => `window.${k} = ${json(v)};`).join('\n')}\n  </script>`);

// Headlines only, for the index and week pages.
const headline = it => ({ id: it.id, date: it.date, emoji: it.emoji, titleEn: it.titleEn,
  levels: Object.fromEntries(LEVELS.filter(l => it.levels[l]).map(l => [l, { title: it.levels[l].title }])) });

// A story's own words, grammar and recordings.
function storyData(item) {
  const lines = {}, gloss = {}, grammar = {}, audio = {};
  LEVELS.filter(l => item.levels[l]).forEach(l => {
    ['t', ...item.levels[l].lines.keys()].forEach(n => {
      const id = News.lineId(item, l, n);
      const line = NEWS_WORDS.lines[id];
      if (!line) return;
      lines[id] = line;
      line.w.forEach(p => { if (Array.isArray(p)) gloss[p[1]] = NEWS_WORDS.gloss[p[1]]; });
      line.g.forEach(([gid]) => { if (NEWS_WORDS.grammar[gid]) grammar[gid] = NEWS_WORDS.grammar[gid]; });
    });
    const rec = NEWS_AUDIO[News.audioKey(item, l)];
    if (rec) audio[News.audioKey(item, l)] = rec;
  });
  return { NEWS_ITEMS: [item], NEWS_WORDS: { gloss, grammar, lines }, NEWS_AUDIO: audio };
}

function page(item, i) {
  // Newest first: the previous page is the newer story.
  const newer = NEWS_ITEMS[i - 1];
  const older = NEWS_ITEMS[i + 1];
  const title = newsTitle(item.titleEn);
  const desc = newsDesc(item.titleEn);
  const url = `${SITE}/${pageFile(item.id)}`;
  const pagerLink = (it, dir) => it
    ? `<a class="btn-secondary phrase-pager-link" href="${pageFile(it.id)}">${dir === 'newer' ? '← ' : ''}${it.emoji} ${esc(it.titleEn)}${dir === 'older' ? ' →' : ''}</a>`
    : '<span></span>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" id="viewport-meta" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:type" content="article">
  <meta property="article:published_time" content="${item.date}">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="Tokidoki">
  <meta property="og:locale" content="en_US">
  <meta property="og:image" content="${SITE}/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Tokidoki — free Japanese practice, one plate at a time">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(desc)}">
  <meta name="twitter:image" content="${SITE}/og-image.png">
  <link rel="canonical" href="${url}">
  <script type="application/ld+json">${jsonLd(item, url)}</script>
${headExtras}</head>
<body data-mode="news" data-story="${esc(item.id)}">
  <!-- Written by scripts/render_news_pages.mjs — edit that, news.html or news-data.js, not this file. -->
  <div id="app">

    <!-- Header (rendered by renderSharedChrome() in app.js) -->
    <div id="header-mount"></div>

    <main id="screen-news" class="screen active">
${nav}
      <p class="phrase-crumbs"><a href="news.html">News</a> › <a href="${weekFile(weekOf(item.date))}#day-${item.date}"><span id="news-date">${esc(formatDate(item.date))}</span></a></p>
      <div class="story-head news-head">
        <div class="news-head-row">
          <span class="news-head-emoji" aria-hidden="true">${item.emoji}</span>
          <div class="lis-levels news-levels" role="group" aria-label="Level" id="news-levels">
            <span class="lis-levels-label">Level</span>
${LEVELS.map(l => `            <button type="button" data-level="${l}" aria-pressed="false">${l}</button>`).join('\n')}
          </div>
        </div>
        <h2 class="story-title" id="news-title" lang="ja">${esc(plain(item.levels.N5.title))}</h2>
        <p class="story-title-en" id="news-title-en">${esc(item.titleEn)}</p>
      </div>
      <div class="kana-settings-row story-toggles">
        <label class="kana-script-toggle"><input type="checkbox" id="news-toggle-furigana"> Furigana</label>
        <label class="kana-script-toggle"><input type="checkbox" id="news-toggle-english"> English</label>
        <button type="button" class="btn-secondary story-read hidden" id="btn-news-read" aria-pressed="false">▶ Read aloud</button>
        <button type="button" class="btn-secondary story-read hidden" id="btn-news-read-slow" aria-pressed="false">🐢 Slowly</button>
        <button type="button" class="btn-secondary speak-toggle hidden" data-speak-toggle aria-pressed="false">&#128266; Speak words on click: Off</button>
      </div>

      <div class="story-layout">
        <article class="story-text" id="news-text"></article>
        <aside class="story-panel" id="news-panel" aria-live="polite">
          <button class="icon-btn story-panel-close" id="news-panel-close" aria-label="Close">✕</button>
          <div id="news-panel-body"></div>
        </aside>
      </div>

      <nav class="phrase-pager story-pager" aria-label="More news">
        ${pagerLink(newer, 'newer')}
        ${pagerLink(older, 'older')}
      </nav>
      <p class="lis-credits">Read by VOICEVOX:No.7</p>
    </main>

  </div>

${scriptsWith(storyData(item))}
  <!-- Static content for search engines -->
  <section id="seo-content" aria-hidden="true">
    <h1>${esc(item.titleEn)}</h1>
${LEVELS.filter(l => item.levels[l]).map(l => {
    const v = item.levels[l];
    return `    <h2>${l}: ${esc(plain(v.title))}</h2>
    <p>
${v.lines.map(([jp, en]) => `      ${esc(plain(jp))} (${esc(en)})`).join('\n')}
    </p>`;
  }).join('\n')}
  </section>
</body>
</html>
`;
}

// ─── Weeks ──────────────────────────────────────────────────────────────────

const weeks = [...new Set(NEWS_ITEMS.map(it => weekOf(it.date)))].sort().reverse();
const weekItems = monday => NEWS_ITEMS.filter(it => weekOf(it.date) === monday);
const dayMonth = iso => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' });
const longDate = iso => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const plusDays = (iso, n) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const weekName = monday => `Week of ${longDate(monday)}`;
const storyCount = n => `${n} ${n === 1 ? 'story' : 'stories'}`;

// The list of every week, newest first, for news.html.
const archiveHtml = () => `
        <h2 class="phrase-group-title">Older news, by week</h2>
        <ul class="news-archive-list">
${weeks.map(w => `          <li><a href="${weekFile(w)}">${esc(weekName(w))} <span class="news-archive-count">${storyCount(weekItems(w).length)}</span></a></li>`).join('\n')}
        </ul>
      `;

function weekPage(monday, i) {
  const items = weekItems(monday);
  const newer = weeks[i - 1];
  const older = weeks[i + 1];
  const url = `${SITE}/${weekFile(monday)}`;
  const sunday = plusDays(monday, 6);
  const range = `${dayMonth(monday)} – ${longDate(sunday)}`;
  const title = `Easy Japanese News, ${weekName(monday)} | Tokidoki`;
  const desc = `Japan's news from ${range} in easy Japanese at JLPT N5, N4 and N3: ${storyCount(items.length)} with furigana, audio, words and grammar.`;
  const ld = [{
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Easy Japanese News, ${weekName(monday)}`,
    description: desc,
    url,
    inLanguage: 'en',
    hasPart: items.map(it => ({ '@type': 'NewsArticle', headline: it.titleEn, url: `${SITE}/${pageFile(it.id)}`, datePublished: it.date })),
    isPartOf: { '@type': 'WebSite', name: 'Tokidoki', url: `${SITE}/` },
  }, {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Tokidoki', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'News', item: `${SITE}/news.html` },
      { '@type': 'ListItem', position: 3, name: weekName(monday), item: url },
    ],
  }];
  const pagerLink = (w, dir) => w
    ? `<a class="btn-secondary phrase-pager-link" href="${weekFile(w)}">${dir === 'newer' ? '← ' : ''}${esc(weekName(w))}${dir === 'older' ? ' →' : ''}</a>`
    : '<span></span>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" id="viewport-meta" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="Tokidoki">
  <meta property="og:locale" content="en_US">
  <meta property="og:image" content="${SITE}/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Tokidoki — free Japanese practice, one plate at a time">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(desc)}">
  <meta name="twitter:image" content="${SITE}/og-image.png">
  <link rel="canonical" href="${url}">
  <script type="application/ld+json">${json(ld)}</script>
${headExtras}</head>
<body data-mode="news" data-week="${monday}">
  <!-- Written by scripts/render_news_pages.mjs — edit that, news.html or news-data.js, not this file. -->
  <div id="app">

    <!-- Header (rendered by renderSharedChrome() in app.js) -->
    <div id="header-mount"></div>

    <main id="screen-news" class="screen active">
${nav}
      <p class="phrase-crumbs"><a href="news.html">News</a> › ${esc(weekName(monday))}</p>
      <section class="lis-hero news-hero">
        <div class="lis-hero-face" aria-hidden="true">報</div>
        <div>
          <p class="lis-hero-kicker" lang="ja">やさしいニュース · JLPT N5–N3</p>
          <h2 class="lis-hero-title">News: ${esc(range)}</h2>
          <p class="lis-hero-sub">${storyCount(items.length)} from Japan, each written three times — at N5, N4 and N3.</p>
        </div>
      </section>

      <div class="kana-settings-row phrase-toggles news-toggles">
        <div class="lis-levels news-levels" role="group" aria-label="Level" id="news-index-levels">
          <span class="lis-levels-label">Level</span>
${LEVELS.map(l => `          <button type="button" data-level="${l}" aria-pressed="false">${l}</button>`).join('\n')}
        </div>
        <label class="kana-script-toggle"><input type="checkbox" id="news-toggle-furigana"> Furigana</label>
      </div>

      <div id="news-headlines" class="news-headlines">${News.headlinesHtml(items, 'N5')}</div>

      <nav class="phrase-pager story-pager" aria-label="More weeks">
        ${pagerLink(newer, 'newer')}
        ${pagerLink(older, 'older')}
      </nav>
      <p class="news-archive-latest"><a href="news.html">Latest news</a> · <a href="news.html#news-archive">All weeks</a></p>
      <p class="lis-credits">Read by VOICEVOX:No.7</p>
    </main>

  </div>

${scriptsWith({ NEWS_ITEMS: items.map(headline) })}
  <!-- Static content for search engines -->
  <section id="seo-content" aria-hidden="true">
    <h1>Easy Japanese news: ${esc(range)}</h1>
    <p>
      ${storyCount(items.length)} from Japan, each told in simple Japanese at JLPT N5, N4 and N3.
    </p>
    <ul>
${items.map(it => `      <li><a href="${pageFile(it.id)}">${esc(it.titleEn)}</a> (${esc(plain(it.levels.N5 ? it.levels.N5.title : ''))})</li>`).join('\n')}
    </ul>
  </section>
</body>
</html>
`;
}

// Writes `file` only when it changes, so an unchanged page keeps its date.
let written = 0;
function write(file, text) {
  const full = path.join(ROOT, file);
  if (fs.existsSync(full) && fs.readFileSync(full, 'utf8') === text) return;
  fs.writeFileSync(full, text);
  written++;
}

NEWS_ITEMS.forEach((item, i) => write(pageFile(item.id), page(item, i)));
weeks.forEach((w, i) => write(weekFile(w), weekPage(w, i)));

// news.html: the last INDEX_DAYS days of news, and the weeks.
const recentDays = [...new Set(NEWS_ITEMS.map(it => it.date))].slice(0, INDEX_DAYS);
const recent = NEWS_ITEMS.filter(it => recentDays.includes(it.date));
const replaceBetween = (text, open, close, inner) => {
  const i = text.indexOf(open);
  const j = text.indexOf(close, i + open.length);
  if (i === -1 || j === -1) throw new Error(`news.html: can't find ${open} … ${close}`);
  return text.slice(0, i + open.length) + inner + text.slice(j);
};
let indexHtml = index.replace(DATA_RE, () => scriptsWith({ NEWS_ITEMS: recent.map(headline) }).match(DATA_RE)[0]);
indexHtml = replaceBetween(indexHtml, '<div id="news-headlines" class="news-headlines">', '</div>\n\n      <nav class="news-archive"', News.headlinesHtml(recent, 'N5'));
indexHtml = replaceBetween(indexHtml, '<nav class="news-archive" id="news-archive" aria-label="Older news">', '</nav>', archiveHtml());
write('news.html', indexHtml);

// Pages for stories and weeks that are gone.
const keep = new Set([...NEWS_ITEMS.map(it => pageFile(it.id)), ...weeks.map(weekFile)]);
const stale = fs.readdirSync(ROOT).filter(f => /^news-(week-)?\d{4}-\d{2}-\d{2}(-.+)?\.html$/.test(f) && !keep.has(f));
stale.forEach(f => fs.unlinkSync(path.join(ROOT, f)));

// Sitemap: the week pages, then the story pages, right after news.html,
// newest first.
let sitemap = read('sitemap.xml').replace(/  <url>\n    <loc>[^<]*\/news-(?:week-)?\d{4}-[^<]*<\/loc>\n[\s\S]*?<\/url>\n/g, '');
const anchor = `    <loc>${SITE}/news.html</loc>`;
const at = sitemap.indexOf(anchor);
if (at === -1) throw new Error('sitemap.xml: no news.html entry');
const afterIndex = sitemap.indexOf('</url>\n', at) + '</url>\n'.length;
const entry = (file, date, priority) => `  <url>
    <loc>${SITE}/${file}</loc>
    <lastmod>${date}</lastmod>
    <priority>${priority}</priority>
  </url>
`;
const entries = weeks.map(w => entry(weekFile(w), weekItems(w)[0].date, '0.5')).join('')
  + NEWS_ITEMS.map(it => entry(pageFile(it.id), it.date, '0.6')).join('');
sitemap = sitemap.slice(0, afterIndex) + entries + sitemap.slice(afterIndex);
write('sitemap.xml', sitemap);

console.log(`${NEWS_ITEMS.length} stories in ${weeks.length} weeks: ${written} files written${stale.length ? `, ${stale.length} removed` : ''}`);
