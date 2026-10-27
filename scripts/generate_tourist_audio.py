#!/usr/bin/env python3
"""Record the phrases of the "Japanese for tourists" blog post with VOICEVOX.

All phrases go into one MP3, audio/tourist/phrases.mp3, in the order the
post shows them, with a pause after each. audio/tourist/phrases.json holds
the hash of the script it was recorded from and when each phrase starts and
ends, which render_tourist_post.mjs inlines in the page so ▶ / 🐢 can play
one phrase. What is said, by which voice and how fast comes from
`render_tourist_post.mjs --script` (the phrases are in
tourist-phrases-data.js). As for the News, each phrase is voiced from its
kanji and its reading is checked against the furigana, falling back to the
furigana where VOICEVOX misreads. Skipped when the script hasn't changed.

Usage:
    python3 scripts/generate_tourist_audio.py --voicevox DIR [--force | --check]

DIR is set up as described in CLAUDE.md. The voices (玄野武宏, 冥鳴ひまり)
are credited on the page, as their terms ask. Needs ffmpeg with libmp3lame.
"""
import argparse
import glob
import io
import json
import os
import subprocess
import sys
import wave
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from generate_news_audio import distance, encode, expected, norm, pieces, speech  # noqa: E402

REPO_ROOT = Path(__file__).resolve().parent.parent
OUT = REPO_ROOT / "audio" / "tourist" / "phrases.mp3"
INDEX = REPO_ROOT / "audio" / "tourist" / "phrases.json"
LEAD_IN = 0.3


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--voicevox", required=True, help="directory with onnxruntime/, dict/ and models/")
    ap.add_argument("--force", action="store_true", help="record even if the script hasn't changed")
    ap.add_argument("--check", action="store_true", help="only check every phrase's reading; record nothing")
    args = ap.parse_args()

    script = json.loads(subprocess.check_output(["node", str(REPO_ROOT / "scripts" / "render_tourist_post.mjs"), "--script"]))
    if not args.check and not args.force and INDEX.exists() and OUT.exists():
        if json.loads(INDEX.read_text(encoding="utf-8")).get("hash") == script["hash"]:
            print("recording up to date")
            return 0

    from voicevox_core.blocking import Onnxruntime, OpenJtalk, Synthesizer, VoiceModelFile

    base = Path(args.voicevox)
    ort_lib = sorted(glob.glob(str(base / "onnxruntime" / "lib" / "libvoicevox_onnxruntime.so*")))[-1]
    synth = Synthesizer(Onnxruntime.load_once(filename=ort_lib), OpenJtalk(str(base / "dict")), cpu_num_threads=os.cpu_count() or 4)
    for vid in sorted({st["voice"] for st in script["steps"]}):
        for vvm in sorted((base / "models").glob("*.vvm")):
            with VoiceModelFile.open(str(vvm)) as model:
                if any(s.id == vid for c in model.metas for s in c.styles) and not synth.is_loaded_voice_model(model.id):
                    synth.load_voice_model(model)

    def heard(text, style):
        q = synth.create_audio_query(text, style)
        return q, norm("".join(m.text for p in q.accent_phrases for m in p.moras))

    def query_for(st):
        """The audio query for a phrase, with kanji swapped for furigana until
        it reads as the furigana says. Returns (query, note or None)."""
        want = expected(st["text"])
        kana = set()
        q, got = heard(speech(st["text"], kana), st["voice"])
        if want.match(got):
            return q, None
        target = norm("".join(r or t for t, r in pieces(st["text"])))
        best = distance(got, target)
        for i in [i for i, (_, r) in enumerate(pieces(st["text"])) if r]:
            q2, got2 = heard(speech(st["text"], kana | {i}), st["voice"])
            d = distance(got2, target)
            if d < best:
                kana.add(i)
                q, got, best = q2, got2, d
            if want.match(got):
                return q, "read from furigana: " + "、".join(pieces(st["text"])[k][0] for k in sorted(kana))
        return q, f"still reads differently: {st['text']}\n    expected {target}\n    voiced   {got}"

    notes = []
    if args.check:
        for st in script["steps"]:
            _, note = query_for(st)
            if note:
                notes.append(f"{st['id']}: {note}")
        print("\n".join(notes))
        bad = sum("still reads" in n for n in notes)
        print(f"{len(script['steps'])} phrases checked, {bad} reading mismatches")
        return 1 if bad else 0

    rate, pcm, times = None, bytearray(), {}
    for st in script["steps"]:
        query, note = query_for(st)
        if note:
            notes.append(f"{st['id']}: {note}")
        query.speed_scale = st["speed"]
        query.pre_phoneme_length = 0.05
        query.post_phoneme_length = 0.05
        with wave.open(io.BytesIO(synth.synthesis(query, st["voice"]))) as w:
            if rate is None:
                rate = w.getframerate()
                pcm += b"\0\0" * int(LEAD_IN * rate)
            start = len(pcm) / 2 / rate
            pcm += w.readframes(w.getnframes())
            times[st["id"]] = [round(start, 2), round(len(pcm) / 2 / rate, 2)]
        pcm += b"\0\0" * int(st["pause"] / 1000 * rate)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    encode(pcm, rate, OUT)
    INDEX.write_text(json.dumps({"hash": script["hash"], "src": "audio/tourist/phrases.mp3", "t": times},
                                ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"recorded {len(times)} phrases ({len(pcm) / 2 / rate:.1f}s)")
    if notes:
        print("\n" + "\n".join(notes))
    return 1 if any("still reads" in n for n in notes) else 0


if __name__ == "__main__":
    sys.exit(main())
