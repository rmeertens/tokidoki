# Tokidoki

## Git workflow

- Always push finished work straight to `main` — no need to ask first, and
  no pull request unless one is asked for. Run the tests (`node test_*.js`)
  before pushing.

## Generated pages

- The Phrases category pages, `phrases-<id>.html`, are written by
  `node scripts/render_phrase_pages.mjs` from `phrases.html` (head, nav,
  scripts) and the phrase data. After changing any of those — including the
  nav on every page — re-run it rather than editing the pages by hand.
- The words and grammar shown when you tap a phrase or story line come from
  `phrases-words.js`, built by `node scripts/tokenize_phrases.mjs` (needs
  `npm install --no-save kuromoji` first). Re-run it after changing
  `phrases-data.js` or `phrases-stories.js`; missing words go in
  `scripts/phrase_extra_words.json`. `test_phrases.js` fails if it's stale.
- The News story pages, `news-<id>.html`, are written by
  `node scripts/render_news_pages.mjs` from `news.html` (head, nav, scripts)
  and `news-data.js`; re-run it after changing either (it also updates the
  sitemap). Their words and grammar come from `news-words.js`, built by
  `node scripts/tokenize_news.mjs` (kuromoji, as above); missing words go in
  `scripts/news_extra_words.json`. `test_news.js` fails if either is stale.
