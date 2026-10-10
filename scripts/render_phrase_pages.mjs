#!/usr/bin/env node
// Writes one page per Phrases category, phrases-<id>.html, from
// phrases-data.js and phrases-stories.js. The pages share phrases.html's
// <head> extras, nav and scripts, so edit phrases.html (or the data) and
// re-run this:
//
//   node scripts/render_phrase_pages.mjs
//
// It also adds any missing page to sitemap.xml, after phrases.html. The
// pages are filled in by phrases.js; the static text here is what search
// engines and no-JS readers see.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://tokidoki.meertens.dev';
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(read('phrases-data.js'), ctx);
vm.runInContext(read('phrases-stories.js'), ctx);
const { PHRASES_DATA, PHRASE_GROUPS, PHRASE_STORIES } = ctx.window;

const RUBY_RE = /([一-鿿々]+)\[([^\]]+)\]/g;
const plain = s => s.replace(RUBY_RE, '$1');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// The pieces of phrases.html every category page reuses.
const index = read('phrases.html');
const cut = (from, to) => {
  const i = index.indexOf(from);
  const j = index.indexOf(to, i);
  if (i === -1 || j === -1) throw new Error(`phrases.html: can't find ${from} … ${to}`);
  return index.slice(i, j);
};
const headExtras = cut('  <link rel="stylesheet"', '</head>');
const nav = cut('      <nav class="page-nav"', '</nav>') + '</nav>';
const scripts = cut('  <script src="conjugator.js">', '  <!-- Static content');

// Categories in the order the index lists them.
const groupOrder = id => PHRASE_GROUPS.findIndex(g => g.id === id);
const cats = PHRASES_DATA.slice().sort((a, b) => groupOrder(a.group) - groupOrder(b.group));

function page(cat, i) {
  const story = PHRASE_STORIES[cat.id];
  const group = PHRASE_GROUPS.find(g => g.id === cat.group);
  const prev = cats[i - 1];
  const next = cats[i + 1];
  const titleJa = plain(cat.title);
  const title = `${cat.titleEn} in Japanese — ${titleJa} | Tokidoki`;
  const desc = `${cat.blurb} ${cat.phrases.length} Japanese phrases with furigana, English and audio, and a short story to listen to.`;
  const url = `${SITE}/phrases-${cat.id}.html`;
  const pagerLink = (c, dir) => c
    ? `<a class="btn-secondary phrase-pager-link" href="phrases-${c.id}.html">${dir === 'prev' ? '← ' : ''}${c.emoji} ${esc(c.titleEn)}${dir === 'next' ? ' →' : ''}</a>`
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
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(desc)}">
  <link rel="canonical" href="${url}">
${headExtras}</head>
<body data-mode="phrases" data-category="${cat.id}">
  <!-- Written by scripts/render_phrase_pages.mjs — edit that, phrases.html or the data, not this file. -->
  <div id="app">

    <!-- Header (rendered by renderSharedChrome() in app.js) -->
    <div id="header-mount"></div>

    <main id="screen-chapters" class="screen active">
${nav}
      <p class="phrase-crumbs"><a href="phrases.html">Phrases</a> › <a href="phrases.html#group:${cat.group}">${esc(group ? group.title : '')}</a></p>
      <h2 class="phrase-page-title">
        <span class="phrase-section-emoji" aria-hidden="true">${cat.emoji}</span>
        <span lang="ja" id="phrase-cat-title">${esc(titleJa)}</span>
        <span class="phrase-section-en">${esc(cat.titleEn)}</span>
      </h2>
      <p class="phrase-section-blurb">${esc(cat.blurb)}</p>

      <div class="kana-settings-row phrase-toggles">
        <label class="kana-script-toggle"><input type="checkbox" id="phrase-toggle-furigana"> Furigana</label>
        <label class="kana-script-toggle"><input type="checkbox" id="phrase-toggle-english"> English</label>
        <button type="button" class="btn-secondary speak-toggle hidden" data-speak-toggle aria-pressed="false">&#128266; Speak words on click: Off</button>
      </div>

      <div id="phrase-list"></div>

      <section class="phrase-story${story ? '' : ' hidden'}" id="phrase-story" aria-labelledby="phrase-story-title">
        <div class="phrase-story-label">📖 Story</div>
        <h2 class="phrase-story-title" id="phrase-story-title" lang="ja">${story ? esc(plain(story.title)) : ''}</h2>
        <p class="phrase-story-title-en" id="phrase-story-title-en">${story ? esc(story.titleEn) : ''}</p>
        <p class="phrase-story-hint">Press play to hear the whole story, or tap a line to hear just that line.</p>
        <div class="kana-settings-row phrase-story-controls">
          <button type="button" class="btn-secondary story-read hidden" id="btn-story-read" aria-pressed="false">▶ Read aloud</button>
          <button type="button" class="btn-secondary story-read hidden" id="btn-story-read-slow" aria-pressed="false">🐢 Slowly</button>
        </div>
        <div class="phrase-story-lines" id="phrase-story-lines"></div>
      </section>

      <nav class="phrase-pager" aria-label="More phrases">
        ${pagerLink(prev, 'prev')}
        ${pagerLink(next, 'next')}
      </nav>
    </main>

  </div>

${scripts}
  <!-- Static content for search engines -->
  <section id="seo-content" aria-hidden="true">
    <h2>${esc(cat.titleEn)} in Japanese: ${esc(titleJa)}</h2>
    <p>${esc(cat.blurb)}</p>
    <ul>
${cat.phrases.map(p => `      <li>${esc(plain(p.jp))} — ${esc(p.en)} ${esc(p.note)}</li>`).join('\n')}
    </ul>
${story ? `    <h3>Story: ${esc(plain(story.title))} (${esc(story.titleEn)})</h3>
    <p>
${story.lines.map(([who, jp, en]) => `      ${who ? `${esc(plain(who))}: ` : ''}${esc(plain(jp))} (${esc(en)})`).join('\n')}
    </p>
` : ''}  </section>
</body>
</html>
`;
}

cats.forEach((cat, i) => {
  fs.writeFileSync(path.join(ROOT, `phrases-${cat.id}.html`), page(cat, i));
});

// Sitemap: one entry per page, right after phrases.html.
let sitemap = read('sitemap.xml');
const anchor = `    <loc>${SITE}/phrases.html</loc>`;
const at = sitemap.indexOf(anchor);
if (at === -1) throw new Error('sitemap.xml: no phrases.html entry');
const afterIndex = sitemap.indexOf('</url>\n', at) + '</url>\n'.length;
const missing = cats.filter(c => !sitemap.includes(`${SITE}/phrases-${c.id}.html`)).map(c => `  <url>
    <loc>${SITE}/phrases-${c.id}.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`).join('');
sitemap = sitemap.slice(0, afterIndex) + missing + sitemap.slice(afterIndex);
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);

console.log(`wrote ${cats.length} pages`);
