#!/usr/bin/env python3
"""Record the listening practice (listening.html) with VOICEVOX, so every
browser plays the same natural voices instead of whatever text-to-speech
voice the device happens to have.

Each question becomes one MP3 in audio/listening/, laid out the way the JLPT
plays it (number, question, conversation, question again — the steps come
from buildScript() in listening.js, so the timing and wording match the page
exactly). listening-audio.js indexes them: for each question its file, the
hash of the script it was recorded from, and when each line starts and ends,
so the page can highlight the line being spoken and replay any one line.

Every line's reading is checked against the furigana in listening-data.js;
a mismatch (VOICEVOX reading 何で as なんで, say) is printed so the line can
get a `say` override. Questions whose script hasn't changed are skipped.

Usage:
    python3 scripts/generate_listening_audio.py --voicevox DIR [--force]

DIR holds the VOICEVOX CORE pieces (https://github.com/VOICEVOX/voicevox_core,
release 0.16): the voicevox_core Python wheel installed in the running
Python, onnxruntime/lib/libvoicevox_onnxruntime.so.*, the Open JTalk
dictionary in dict/, and the voice models in models/ (VOICEVOX_vvm 0.16:
1.vvm, 2.vvm, 4.vvm, 6.vvm and 15.vvm hold the voices used below).
Needs ffmpeg with libmp3lame.

Voices (credit them where the audio is used — see listening.html):
    narrator   No.7 (アナウンス)
    men        玄野武宏, 青山龍星
    women      冥鳴ひまり, 九州そら
"""
import argparse
import glob
import hashlib
import io
import json
import re
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = REPO_ROOT / "audio" / "listening"
INDEX = REPO_ROOT / "listening-audio.js"

NARRATOR = 30                 # No.7 アナウンス
MEN = [11, 13]                # 玄野武宏, 青山龍星
WOMEN = [14, 16]              # 冥鳴ひまり, 九州そら
LEAD_IN = 0.3                 # seconds of silence before 1番
SPEED = {"N": 0.95, "M": 0.92, "F": 0.92}

DUMP_JS = """
global.window = global;
require(process.argv[1] + '/listening-data.js');
const L = require(process.argv[1] + '/listening.js');
const out = [];
for (const section of global.LISTENING_SECTIONS) {
  section.items.forEach((item, i) => {
    const steps = L.buildScript(section, item, i + 1);
    out.push({ key: L.audioKey(section, item), index: i, steps, hash: L.scriptHash(steps) });
  });
}
process.stdout.write(JSON.stringify(out));
"""


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
    s = "".join(out)
    return s.replace("ハ", "ワ").replace("ヘ", "エ")  # particles は / へ (and their look-alikes)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--voicevox", required=True, help="directory with onnxruntime/, dict/ and models/")
    ap.add_argument("--force", action="store_true", help="re-record every question")
    args = ap.parse_args()

    from voicevox_core.blocking import Onnxruntime, OpenJtalk, Synthesizer, VoiceModelFile

    base = Path(args.voicevox)
    ort_lib = sorted(glob.glob(str(base / "onnxruntime" / "lib" / "libvoicevox_onnxruntime.so*")))[-1]
    synth = Synthesizer(Onnxruntime.load_once(filename=ort_lib), OpenJtalk(str(base / "dict")))
    for vvm in sorted((base / "models").glob("*.vvm")):
        with VoiceModelFile.open(str(vvm)) as model:
            synth.load_voice_model(model)

    items = json.loads(subprocess.check_output(["node", "-e", DUMP_JS, str(REPO_ROOT)]))
    old = {}
    if INDEX.exists():
        m = re.search(r"=\s*(\{.*\});", INDEX.read_text(encoding="utf-8"), re.S)
        if m:
            old = json.loads(m.group(1))

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    index, warnings, recorded = {}, [], 0
    for it in items:
        name = it["key"].replace("/", "-") + ".mp3"
        prev = old.get(it["key"])
        if not args.force and prev and prev["hash"] == it["hash"] and (OUT_DIR / name).exists():
            index[it["key"]] = prev
            continue

        cast = {"N": NARRATOR, "M": MEN[it["index"] % 2], "F": WOMEN[it["index"] % 2]}
        rate, pcm, times = None, bytearray(), []
        for st in it["steps"]:
            style = cast[st["voice"]]
            query = synth.create_audio_query(st["text"], style)
            query.speed_scale = SPEED[st["voice"]]
            query.pre_phoneme_length = 0.05
            query.post_phoneme_length = 0.05
            heard = "".join(m.text for ap_ in query.accent_phrases for m in ap_.moras)
            if st["reading"] and norm(heard) != norm(st["reading"]):
                warnings.append(f"{it['key']}: {st['text']}\n    expected {kata(st['reading'])}\n    voiced   {heard}")
            with wave.open(io.BytesIO(synth.synthesis(query, style))) as w:
                if rate is None:
                    rate = w.getframerate()
                    pcm += b"\0\0" * int(LEAD_IN * rate)
                start = len(pcm) / 2 / rate
                pcm += w.readframes(w.getnframes())
                times.append([round(start, 2), round(len(pcm) / 2 / rate, 2)])
            pcm += b"\0\0" * int(st["pause"] / 1000 * rate)
        pcm += b"\0\0" * int(0.3 * rate)

        with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
            with wave.open(tmp.name, "wb") as w:
                w.setnchannels(1)
                w.setsampwidth(2)
                w.setframerate(rate)
                w.writeframes(bytes(pcm))
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp.name, "-ac", "1", "-ar", "24000",
                            "-codec:a", "libmp3lame", "-b:a", "48k", str(OUT_DIR / name)], check=True)
        index[it["key"]] = {"src": f"audio/listening/{name}", "hash": it["hash"], "steps": times}
        recorded += 1
        print(f"recorded {it['key']} ({times[-1][1]:.1f}s)")

    for stale in set(p.name for p in OUT_DIR.glob("*.mp3")) - {v["src"].split("/")[-1] for v in index.values()}:
        (OUT_DIR / stale).unlink()
        print(f"removed {stale}")

    body = json.dumps(index, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    body = body.replace('},"', '},\n  "').replace('{"', '{\n  "', 1)
    INDEX.write_text(
        "// Generated by scripts/generate_listening_audio.py: one VOICEVOX recording per\n"
        "// listening question, the hash of the script it was recorded from, and when\n"
        "// each line starts and ends (seconds). Voices: VOICEVOX:No.7, VOICEVOX:玄野武宏,\n"
        "// VOICEVOX:青山龍星, VOICEVOX:冥鳴ひまり, VOICEVOX:九州そら.\n"
        f"(function (g) {{ g.LISTENING_AUDIO = {body}; }})(typeof window !== 'undefined' ? window : globalThis);\n",
        encoding="utf-8")
    print(f"{recorded} recorded, {len(index) - recorded} unchanged")
    if warnings:
        print(f"\n{len(warnings)} reading mismatches:")
        print("\n".join(warnings))


if __name__ == "__main__":
    sys.exit(main())
