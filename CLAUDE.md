# Tokidoki

## Git workflow

- Always push finished work straight to `main` — no need to ask first, and
  no pull request unless one is asked for. Run the tests (`node test_*.js`)
  before pushing.

## SEO and analytics

- Every page's `<head>` carries the Google tag (G-XXWYNZC7YH), a unique
  title and description, canonical + `og:url`, the shared share image
  (`og-image.png`, 1200×630, `summary_large_image`), and the favicon links.
  Copy the head of an existing page when adding one, and add it to
  `sitemap.xml` (the generated pages are added by their scripts).
- The header's site name is a `<span>`; each page's one `<h1>` is the first
  heading in its `#seo-content` section.

## Login, sync and statistics

- Optional login (`sync.js`) keeps every `tokidoki_` / `tokidoki-`
  localStorage key in one Firestore document per user, `users/{uid}`.
  `sync-merge.js` merges it with this device's copy (rules per key) and
  defines the document layout: `data: 2` (the format; a number so old cached
  `sync.js` versions fail before writing), `rev`, `k` (plain keys), `s` (the
  SRS store, compacted and spread over 256 hash buckets), `l` (review log by
  month). It's built to be cheap: a sync reads only `data`/`rev` and
  downloads the rest only if another device wrote since, then writes just
  the fields that changed, with an `updateTime` precondition. It uses
  Firestore's REST API with the login's ID token — no Firestore SDK.
- Changing the layout means a new `data` number and converting the old one
  in `run()` (as format 1 is). Add a merge rule in `sync-merge.js` for any
  new key that two devices can both add to (counts, collections).
- The account dialog's statistics come from `progress-stats.js`. Every
  graded flashcard is recorded there (`ProgressStats.record`, called via
  `logReview()` in `app.js`; undo calls `unrecord`) into
  `tokidoki_daylog` and `tokidoki_review_totals`. New study modes that grade
  SRS cards should call `logReview()` too, and new card id prefixes go in
  `KINDS`. `test_sync.js` and `test_progress_stats.js` cover both.

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

- The words and grammar shown under an answered Sentences card come from
  `sentences-words.js`, built by `node scripts/tokenize_sentences.mjs`
  (kuromoji, as above) from `sentences-data.js`. Re-run it after changing a
  sentence; missing words go in `scripts/sentence_extra_words.json`, and
  Genki grammar the shared rules miss goes in `SENTENCE_RULES` there.
  `test_sentences.js` fails if it's stale.
- A typed English → Japanese Sentences answer also counts in another word
  order (友達と日曜日に… for 日曜日に友達と…) and with or without 私は for an
  "I" sentence: `sentence-orders.js` builds those versions from the words in
  `sentences-words.js`, conservatively (only noun phrases before a simple
  verb move; nothing moves into or out of a clause). `test_sentence_orders.js`
  lists what must and mustn't be accepted.

- The Vocab Quiz's topic sets (`vocab-groups.js`) are built by
  `node scripts/build_vocab_groups.mjs` (kuromoji, as above) from
  `vocabulary-data.js`: part of speech from kuromoji, topic from keywords in
  the English meaning (`THEMES` in the script), 20–50 words per set. Fix a
  word in the wrong topic in `scripts/vocab_group_overrides.json` and re-run;
  `test_vocab_groups.js` fails if a word is missing or a set is out of range.

## Recorded voices (VOICEVOX)

Listening questions and News stories play pre-recorded MP3s made with
[VOICEVOX](https://voicevox.hiroshiba.jp/) instead of the browser's own
text-to-speech, so every device hears the same natural voice. Everything
else (single words, 🔊 on phrases, stories) still uses the browser voice via
`pronounce.js`.

- **Listening** — `scripts/generate_listening_audio.py` →
  `audio/listening/*.mp3` + `listening-audio.js`. The cast is `VOICES` /
  `NARRATOR` / `POOLS` in `listening.js` (style ids); `castFor()` picks a man
  and a woman per question from a hash of its id, and `buildScript()` sets
  the lines, pauses and speed.
- **News** — `scripts/generate_news_audio.py` → `audio/news/<id>-<level>.mp3`
  + `news-audio.js`. One newsreader, `NEWS_VOICE` in `news.js` (No.7
  アナウンス, style 30, in `6.vvm`), at `NEWS_SPEED` per level;
  `audioScript()` there is what gets said (headline, then each sentence).
  Re-run after changing a story — `test_news.js` fails when a recording's
  hash no longer matches its text.
- Both generators record the kanji text (most natural accent), compare
  VOICEVOX's reading with the furigana, and fall back to the furigana where
  it misreads (日本 as にっぽん, 行った as いった). Listening uses a fixed
  list (`SPEAK_AS_KANA`) plus per-line `say` overrides; News swaps kanji for
  their furigana automatically. `--check` only checks readings; unchanged
  scripts are skipped (`--force` re-records everything).
- The index files hold each recording's script hash and the start/end time
  of every line, which the pages use to highlight and replay single lines.
  The 🐢 buttons play the same file slower (`playbackRate`).
- Credit the voices on the page that plays them, as their terms require:
  `VOICEVOX:<character name>` (see the credits line on `listening.html` and
  the News pages).

Setting up VOICEVOX CORE 0.16 (not a site dependency; keep it out of the
repo, e.g. in a scratch directory). Its `download-linux-x64` tool needs the
GitHub API, which isn't reachable from the cloud sessions, so fetch the
release files directly:

```sh
VV=/path/to/vv; mkdir -p $VV/models $VV/onnxruntime $VV/dict && cd $VV
GH=https://github.com
curl -sSLO $GH/VOICEVOX/voicevox_core/releases/download/0.16.1/voicevox_core-0.16.1-cp310-abi3-manylinux_2_34_x86_64.whl
curl -sSL $GH/VOICEVOX/onnxruntime-builder/releases/download/voicevox_onnxruntime-1.17.3/voicevox_onnxruntime-linux-x64-1.17.3.tgz | tar xz -C onnxruntime --strip-components=1
curl -sSL $GH/r9y9/open_jtalk/releases/download/v1.11.1/open_jtalk_dic_utf_8-1.11.tar.gz | tar xz -C dict --strip-components=1
for n in 0 1 2 4 6 9 10 12 15 21; do curl -sSL -o models/$n.vvm $GH/VOICEVOX/voicevox_vvm/releases/download/0.16.1/$n.vvm; done
python3 -m venv venv && venv/bin/pip install voicevox_core-0.16.1-*.whl
cd - && $VV/venv/bin/python scripts/generate_news_audio.py --voicevox $VV
```

The listening voices need all ten models; News needs only `6.vvm`. ffmpeg
(with libmp3lame) encodes the MP3s. A News run takes about 15 seconds per
story and level on a cloud session.

## Adding today's news (daily task)

The News section gets three new stories a day. Each is real news from
Japan, told at N5, N4 and N3. To add them:

1. **Pick three stories.** Search the web for the last day or two of Japan
   news (Japan Times, Japan Today, nippon.com, NHK, Kyodo/Jiji via
   nippon.com, and Japanese-language searches, which often turn up more).
   Mix the topics: something serious (politics, economy, incidents),
   something from science, culture or sport, and avoid repeating a topic
   from the last few days unless there's real news. Skip stories that are
   mainly about violent crime or tragedy. Check every fact (dates,
   numbers, names, readings of names) against at least one source; say
   "may", "is suspected", "is expected" where the source does. Never
   invent quotes. Note the source URLs.
2. **Write them in `news-data.js`**, at the top of `NEWS_ITEMS` (newest
   first), using the format described at the top of that file:
   - `id` is `<date>-<short-slug>`, `date` is today.
   - **N5**: 6–7 short です/ます sentences, mostly N5 words; a harder word
     is fine with a note. **N4**: 6–7 sentences, more detail, N4 grammar.
     **N3**: 6–7 sentences in plain newspaper style (〜た / 〜だ / 〜ている,
     によると, 〜とみられる, 〜おそれがある…). N3 sentences must be longer
     on average than N5 (the test checks).
   - Furigana on every kanji run, as `漢字[かんじ]`. Write dates whose
     reading is special in kanji (七日[なのか], 十日[とおか],
     十四日[じゅうよっか]) so the voices read them right; other numbers can
     be digits with furigana on the counter only (4社[しゃ], 2022年[ねん]).
     Use the official reading for names (日本[にっぽん]シリーズ).
   - A note (third element of a line) on anything the word and grammar
     lists don't explain: a news expression, a name, background. Notes are
     plain text — no furigana markup.
3. **Build the word lists**: `node scripts/tokenize_news.mjs --misses`
   (after `npm install --no-save kuromoji`). Add every missing word to
   `scripts/news_extra_words.json` as `[reading, meaning, part of speech]`;
   names and compounds kuromoji splits oddly also go in `NEWS_WHOLE` in
   that script. Re-run until 0 words are missing, then look over the new
   lines' words and grammar (a word linked to the wrong entry, like 弱さ →
   差, or a grammar point that doesn't fit). Fix by adding a word, tightening
   a rule in `NEWS_RULES`, or rephrasing the sentence.
4. **Make the pages**: `node scripts/render_news_pages.mjs` (story pages,
   pager links, sitemap).
5. **Record the audio**: set up VOICEVOX as above, then
   `.../venv/bin/python scripts/generate_news_audio.py --voicevox $VV --check`
   (every reading must match) and the same without `--check` to record. Only
   the new stories are recorded.
6. **Test and push**: `node test_news.js` (and the other tests), look at
   the new pages in a browser if you can (Playwright + Chromium is
   available: serve the repo with `python3 -m http.server` and open
   `news.html`), then commit and push to `main`.
