#!/usr/bin/env node
// Writes one page per news story, news-<id>.html, from news-data.js. The
// pages share news.html's <head> extras, nav and scripts, so edit news.html
// (or the data) and re-run this:
//
//   node scripts/render_news_pages.mjs
//
// It also removes pages for stories no longer in the data, and keeps
// sitemap.xml's news pages in step, after news.html. The pages are filled
// in by news.js; the static text here is what search engines and no-JS
// readers see.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://tokidoki.meertens.dev';
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(read('news-data.js'), ctx);
const { NEWS_ITEMS } = ctx.window;
const LEVELS = ['N5', 'N4', 'N3'];

const RUBY_RE = /([一-鿿々]+)\[([^\]]+)\]/g;
const plain = s => s.replace(RUBY_RE, '$1');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pageFile = id => `news-${id}.html`;

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

function page(item, i) {
  // Newest first: the previous page is the newer story.
  const newer = NEWS_ITEMS[i - 1];
  const older = NEWS_ITEMS[i + 1];
  const title = `${item.titleEn} — easy Japanese news (N5–N3) | Tokidoki`;
  const desc = `${item.titleEn}. Read this news story in easy Japanese at JLPT N5, N4 or N3, and tap any sentence for its words and grammar.`;
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
  <meta property="og:url" content="${url}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(desc)}">
  <link rel="canonical" href="${url}">
${headExtras}</head>
<body data-mode="news" data-story="${esc(item.id)}">
  <!-- Written by scripts/render_news_pages.mjs — edit that, news.html or news-data.js, not this file. -->
  <div id="app">

    <!-- Header (rendered by renderSharedChrome() in app.js) -->
    <div id="header-mount"></div>

    <main id="screen-news" class="screen active">
${nav}
      <p class="phrase-crumbs"><a href="news.html">News</a> › <span id="news-date">${esc(item.date)}</span></p>
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

${scripts}
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

NEWS_ITEMS.forEach((item, i) => fs.writeFileSync(path.join(ROOT, pageFile(item.id)), page(item, i)));

// Pages for stories that are gone.
const ids = new Set(NEWS_ITEMS.map(it => pageFile(it.id)));
const stale = fs.readdirSync(ROOT).filter(f => /^news-\d{4}-\d{2}-\d{2}-.+\.html$/.test(f) && !ids.has(f));
stale.forEach(f => fs.unlinkSync(path.join(ROOT, f)));

// Sitemap: the story pages right after news.html, newest first.
let sitemap = read('sitemap.xml').replace(/  <url>\n    <loc>[^<]*\/news-\d{4}-[^<]*<\/loc>\n[\s\S]*?<\/url>\n/g, '');
const anchor = `    <loc>${SITE}/news.html</loc>`;
const at = sitemap.indexOf(anchor);
if (at === -1) throw new Error('sitemap.xml: no news.html entry');
const afterIndex = sitemap.indexOf('</url>\n', at) + '</url>\n'.length;
const entries = NEWS_ITEMS.map(it => `  <url>
    <loc>${SITE}/${pageFile(it.id)}</loc>
    <lastmod>${it.date}</lastmod>
    <priority>0.6</priority>
  </url>
`).join('');
sitemap = sitemap.slice(0, afterIndex) + entries + sitemap.slice(afterIndex);
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);

console.log(`wrote ${NEWS_ITEMS.length} pages${stale.length ? `, removed ${stale.length}` : ''}`);
