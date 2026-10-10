#!/usr/bin/env python3
"""Record the News stories (news-<id>.html) with VOICEVOX, so every browser
plays the same natural newsreader voice instead of whatever text-to-speech
voice the device happens to have.

Each story becomes one MP3 per level in audio/news/, <id>-<level>.mp3: the
headline, then every sentence. What is said, by which voice, how fast and
with what pauses comes from audioScript() in news.js. news-audio.js indexes
the files: for each story and level its file, the hash of the script it was
recorded from, and when the headline and each sentence start and end, so
the page can highlight the sentence being read and play any one sentence.

Each sentence is given to the voice as written, in kanji, which gives the
most natural accent. Its reading is then checked against the furigana; when
they differ (VOICEVOX reading 今日 as こんにち, say), kanji are swapped for
their furigana one at a time until it reads right. Numbers have no furigana
and are left to VOICEVOX, which reads dates, counters and percentages well.
Stories whose script hasn't changed are skipped; recordings for stories that
are gone are removed.

Usage:
    python3 scripts/generate_news_audio.py --voicevox DIR [--force | --check]

DIR holds the VOICEVOX CORE pieces (https://github.com/VOICEVOX/voicevox_core,
release 0.16) laid out as for generate_listening_audio.py — see CLAUDE.md
for how to download them. The newsreader, No.7 (style 30), is in 6.vvm.
Needs ffmpeg with libmp3lame. The voice is credited on the News pages, as
its terms ask.
"""
import argparse
import glob
import io
import json
import os
import re
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = REPO_ROOT / "audio" / "news"
INDEX = REPO_ROOT / "news-audio.js"
LEAD_IN = 0.3  # seconds of silence at the start of each recording

DUMP_JS = """
global.window = global;
require(process.argv[1] + '/news-data.js');
const N = require(process.argv[1] + '/news.js');
const out = [];
for (const item of global.NEWS_ITEMS) {
  for (const level of N.LEVELS) {
    if (!item.levels[level]) continue;
    const script = N.audioScript(item, level);
    out.push({ key: N.audioKey(item, level), file: item.id + '-' + level + '.mp3', steps: script, hash: N.scriptHash(script) });
  }
}
process.stdout.write(JSON.stringify(out));
"""

RUBY = re.compile(r"([㐀-䶿一-鿿々〆ヶ]+)\[([^\]]+)\]")


def pieces(markup):
    """`漢字[かんじ]` markup → [(text, reading or None)]."""
    out, last = [], 0
    for m in RUBY.finditer(markup):
        if m.start() > last:
            out.append((markup[last:m.start()], None))
        out.append((m.group(1), m.group(2)))
        last = m.end()
    if last < len(markup):
        out.append((markup[last:], None))
    return out


def kata(s):
    return "".join(chr(ord(c) + 0x60) if "ぁ" <= c <= "ゖ" else c for c in s)


VOWEL = {}
for row, v in [("アカサタナハマヤラワガザダバパァャ", "a"), ("イキシチニヒミリギジヂビピィ", "i"),
               ("ウクスツヌフムユルグズヅブプゥュ", "u"), ("エケセテネヘメレゲゼデベペェ", "e"),
               ("オコソトノホモヨロヲゴゾドボポォョ", "o")]:
    for c in row:
        VOWEL[c] = v


def norm(s):
    """Katakana with punctuation gone and long vowels and particles folded,
    so えいが / エーガ and こんにちは / コンニチワ compare equal."""
    s = re.sub(r"[^ァ-ヴー]", "", kata(s))
    s = s.replace("ヲ", "オ").replace("ヅ", "ズ").replace("ヂ", "ジ")
    out = []
    for c in s:
        prev = VOWEL.get(out[-1]) if out else None
        if c == "ー" or (c == "ウ" and prev in ("o", "u")) or (c == "イ" and prev == "e"):
            out.append({"a": "ア", "i": "イ", "u": "ウ", "e": "エ", "o": "オ"}.get(prev, c) if prev else c)
        else:
            out.append(c)
    return "".join(out).replace("ハ", "ワ").replace("ヘ", "エ")


def expected(markup):
    """A regex for how the sentence should sound: its furigana, with any
    number (and the % or counter VOICEVOX reads with it) matching anything."""
    reading = "".join(r or t for t, r in pieces(markup))
    parts = re.split(r"[0-9０-９][0-9０-９,.%％]*", reading)
    return re.compile(".+?".join(re.escape(norm(p)) for p in parts) + r"\Z")


def distance(a, b):
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def speech(markup, kana):
    """The text given to the voice: kanji, except the groups in `kana`, which
    are spoken from their furigana. Spaces in headlines become pauses."""
    text = "".join(r if i in kana else t for i, (t, r) in enumerate(pieces(markup)))
    return re.sub(r"[ 　]+", "、", text.strip())


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--voicevox", required=True, help="directory with onnxruntime/, dict/ and models/")
    ap.add_argument("--force", action="store_true", help="re-record every story")
    ap.add_argument("--check", action="store_true", help="only check every sentence's reading; record nothing")
    args = ap.parse_args()

    from voicevox_core.blocking import Onnxruntime, OpenJtalk, Synthesizer, VoiceModelFile

    base = Path(args.voicevox)
    ort_lib = sorted(glob.glob(str(base / "onnxruntime" / "lib" / "libvoicevox_onnxruntime.so*")))[-1]
    synth = Synthesizer(Onnxruntime.load_once(filename=ort_lib), OpenJtalk(str(base / "dict")), cpu_num_threads=os.cpu_count() or 4)
    items = json.loads(subprocess.check_output(["node", "-e", DUMP_JS, str(REPO_ROOT)]))
    for vid in sorted({st["voice"] for it in items for st in it["steps"]}):
        for vvm in sorted((base / "models").glob("*.vvm")):
            with VoiceModelFile.open(str(vvm)) as model:
                if any(s.id == vid for c in model.metas for s in c.styles) and not synth.is_loaded_voice_model(model.id):
                    synth.load_voice_model(model)

    def heard(text, style):
        q = synth.create_audio_query(text, style)
        return q, norm("".join(m.text for p in q.accent_phrases for m in p.moras))

    def query_for(st):
        """The audio query for a step, with kanji swapped for furigana until
        it reads as the furigana says. Returns (query, note or None)."""
        want = expected(st["text"])
        kana = set()
        q, got = heard(speech(st["text"], kana), st["voice"])
        if want.match(got):
            return q, None
        groups = [i for i, (_, r) in enumerate(pieces(st["text"])) if r]
        target = norm("".join(r or t for t, r in pieces(st["text"])))
        best = distance(got, target)
        for i in groups:
            q2, got2 = heard(speech(st["text"], kana | {i}), st["voice"])
            d = distance(got2, target)
            if d < best:
                kana.add(i)
                q, got, best = q2, got2, d
            if want.match(got):
                spoken = [pieces(st["text"])[k][0] for k in sorted(kana)]
                return q, f"read from furigana: {'、'.join(spoken)}"
        return q, f"still reads differently: {st['text']}\n    expected {target}\n    voiced   {got}"

    old = {}
    if INDEX.exists():
        m = re.search(r"=\s*(\{.*\});", INDEX.read_text(encoding="utf-8"), re.S)
        if m:
            old = json.loads(m.group(1))

    if args.check:
        bad = 0
        for it in items:
            for st in it["steps"]:
                _, note = query_for(st)
                if note:
                    print(f"{it['key']}: {note}")
                    bad += note.startswith("still")
        print(f"{len(items)} recordings checked, {bad} reading mismatches")
        return 1 if bad else 0

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    index, notes, recorded = {}, [], 0
    for it in items:
        prev = old.get(it["key"])
        if not args.force and prev and prev["hash"] == it["hash"] and (OUT_DIR / it["file"]).exists():
            index[it["key"]] = prev
            continue
        rate, pcm, times = None, bytearray(), []
        for st in it["steps"]:
            query, note = query_for(st)
            if note:
                notes.append(f"{it['key']}: {note}")
            query.speed_scale = st["speed"]
            query.pre_phoneme_length = 0.05
            query.post_phoneme_length = 0.05
            with wave.open(io.BytesIO(synth.synthesis(query, st["voice"]))) as w:
                if rate is None:
                    rate = w.getframerate()
                    pcm += b"\0\0" * int(LEAD_IN * rate)
                start = len(pcm) / 2 / rate
                pcm += w.readframes(w.getnframes())
                times.append([round(start, 2), round(len(pcm) / 2 / rate, 2)])
            pcm += b"\0\0" * int(st["pause"] / 1000 * rate)
        encode(pcm, rate, OUT_DIR / it["file"])
        index[it["key"]] = {"src": f"audio/news/{it['file']}", "hash": it["hash"], "title": times[0], "steps": times[1:]}
        recorded += 1
        print(f"recorded {it['key']} ({times[-1][1]:.1f}s)")
        write_index({**old, **index})  # saved as it goes, so an interrupted run can resume

    for stale in set(p.name for p in OUT_DIR.glob("*.mp3")) - {v["src"].split("/")[-1] for v in index.values()}:
        (OUT_DIR / stale).unlink()
        print(f"removed {stale}")
    write_index(index)
    print(f"{recorded} recorded, {len(index) - recorded} unchanged")
    if notes:
        print("\n" + "\n".join(notes))
    return 1 if any("still reads" in n for n in notes) else 0


def encode(pcm, rate, path):
    with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
        with wave.open(tmp.name, "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(rate)
            w.writeframes(bytes(pcm))
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp.name, "-ac", "1", "-ar", "24000",
                        "-codec:a", "libmp3lame", "-b:a", "48k", str(path)], check=True)


def write_index(index):
    body = json.dumps(index, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    body = body.replace('},"', '},\n  "').replace('{"', '{\n  "', 1)
    tmp = INDEX.with_suffix(".tmp")
    tmp.write_text(
        "// Generated by scripts/generate_news_audio.py: one VOICEVOX recording per news\n"
        "// story and level, the hash of the script it was recorded from (audioScript()\n"
        "// in news.js), and when the headline and each sentence start and end (seconds).\n"
        f"(function (g) {{ g.NEWS_AUDIO = {body}; }})(typeof window !== 'undefined' ? window : globalThis);\n",
        encoding="utf-8")
    tmp.replace(INDEX)


if __name__ == "__main__":
    sys.exit(main())
