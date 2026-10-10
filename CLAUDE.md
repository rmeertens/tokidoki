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
