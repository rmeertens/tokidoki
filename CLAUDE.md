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
