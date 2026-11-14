#!/usr/bin/env python3
"""Build per-JLPT-level kanji + meaning lists for the printable practice sheets.

Source data: davidluzgouveia/kanji-data (MIT), a KANJIDIC2-derived dataset
with an unofficial jlpt_new (N5-N1) level mapping matching the widely used
"Tanos" JLPT kanji lists. There is no single canonical order for these lists
(JLPT has not published an official kanji list since 2010, so every app/site
compiles and orders its own) — we sort by Japanese school grade (1-6, then
the secondary-school/jouyou grade 8, then non-jouyou grade 9), which is a
well-defined, independently verifiable convention. Written-frequency rank
breaks ties within a grade.

Usage:
    python3 scripts/generate_kanji_data.py <path-to-kanji-data.json>

Writes kanji-sheets/data/n5.json .. n1.json, each a list of
{"kanji": "...", "meaning": "..."} objects in practice-sheet order.
"""
import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = REPO_ROOT / "kanji-sheets" / "data"

LEVELS = [5, 4, 3, 2, 1]

# A couple of kanji this dataset leaves without a jlpt_new value at all
# (it has jlpt_old but not jlpt_new), even though they're commonly placed
# at a level — confirmed against the Benkyo app's own N5/N4 lists below.
LEVEL_OVERRIDE = {"分": 5, "的": 4}

# Exact kanji order transcribed from the Benkyo app (screenshotted by a
# user), for the two levels we have complete, count-verified data for
# (N5: 80/80, N4: 167/167). There's no official JLPT kanji list to match
# against (JLPT hasn't published one since 2010), so every app orders its
# own — this hardcodes Benkyo's specific sequence for N5/N4 rather than
# trying to derive it. N3/N2/N1 fall back to the grade+frequency sort
# below since we don't have Benkyo's order for those.
MANUAL_ORDER = {
    5: list("一二三四五六七八九十日月白百中千上下見万左右子女母小大外名川水土時火木本先金車前"
            "高学書話語読雨天北毎東電午国友出山入分男行人休何年半父校後食生今西南間聞円来気長"),
    4: list("口田目古明品早世自朝員元的真工有切別町兄少多夕魚黒同字安味妹犬牛特界茶理主注道夏"
            "運京週売言計試止歩正走題建姉転冬立海歌音方地風起家場洋着集習曜店心思意手持研広台"
            "始去会室公堂死買力待秋私答住体仕使代貸花肉以夜旅物屋昼社近質作急事画料図用借度不"
            "族知帰強弟写考教者足院空究終服通銀飯飲館新親青春漢野問開重動病医発文楽英映赤色業"
            "悪紙鳥勉験駅送"),
}

# Drop meaning entries that are noise for a practice sheet. Always-noise:
# radical names and the old-time hour-range glosses that ride along with
# the Chinese-zodiac kanji (e.g. "11pm-1am"). Zodiac labels themselves
# ("Sign Of The Rat") are only dropped if the kanji has another meaning
# left without them, since a few zodiac kanji have no other common gloss.
ALWAYS_NOISE_RE = re.compile(r"radical \(no|^\d{1,2}\s*(am|pm)?\s*-\s*\d{1,2}\s*(am|pm)$", re.I)
ZODIAC_RE = re.compile(r"sign of the|chinese zodiac", re.I)
MAX_LEN = 26


# KANJIDIC's first two glosses are sometimes not what a learner needs first
# (校 "Exam, School", 西 "West, Spain", 米 "Rice, Usa", 着 "Don, Arrive"):
# these replace them. N5 to N3 only.
MEANING_OVERRIDE = {
    "見": "See, Look",
    "校": "School",
    "西": "West",
    "本": "Book, Origin",
    "金": "Gold, Money",
    "京": "Capital",
    "着": "Wear, Arrive",
    "春": "Spring",
    "弟": "Younger Brother",
    "飲": "Drink",
    "的": "Target, -like",
    "院": "Institution",
    "目": "Eye",
    "朝": "Morning",
    "鳥": "Bird",
    "服": "Clothing",
    "米": "Rice, America",
    "働": "Work",
    "参": "Participate, Visit",
    "経": "Pass Through, Sutra",
    "様": "Mr./Ms., Manner",
    "機": "Machine, Opportunity",
    "積": "Pile Up, Volume",
    "冷": "Cool, Cold",
    "除": "Exclude, Remove",
    "首": "Neck",
    "頭": "Head",
    "昔": "Long Ago",
    "係": "Person In Charge",
    "困": "Be Troubled",
    "険": "Steep, Dangerous",
    "済": "Finish, Settle",
    "飛": "Fly",
    "申": "Say (humble)",
    "才": "Talent, Years Old",
    "役": "Role, Duty",
    "治": "Govern, Cure",
    "暗": "Dark",
    "座": "Sit, Seat",
    "背": "Back, Height",
    "余": "Surplus, Excess",
    "似": "Resemble",
    "望": "Hope, Wish",
    "葉": "Leaf",
    "流": "Flow, Current",
    "号": "Number, Sign",
    "両": "Both",
    "在": "Exist, Be Located",
    "精": "Spirit, Refined",
    "徒": "Follower, On Foot",
    "面": "Face, Surface",
    "神": "God, Spirit",
    "配": "Distribute",
    "乗": "Ride",
    "深": "Deep",
    "歯": "Tooth",
    "君": "You, Mr.",
    "陽": "Sun, Sunshine",
    "記": "Write Down, Record",
    "向": "Face, Toward",
    "由": "Reason",
    "礼": "Thanks, Bow",
    "然": "So, Thus",
    "割": "Divide, Proportion",
    "若": "Young",
    "数": "Number, Count",
    "当": "Hit, This",
    "直": "Straight, Fix",
    "番": "Number, Turn",
    "活": "Life, Lively",
    "調": "Investigate, Tone",
    "解": "Solve, Untie",
    "欲": "Want, Desire",
}


def clean_meaning(meanings):
    if not meanings:
        return ""
    base = [m for m in meanings if not ALWAYS_NOISE_RE.search(m)]
    if not base:
        base = meanings
    non_zodiac = [m for m in base if not ZODIAC_RE.search(m)]
    filtered = non_zodiac if non_zodiac else base
    text = ", ".join(filtered[:2])
    if len(text) > MAX_LEN:
        text = text[:MAX_LEN].rsplit(" ", 1)[0].rstrip(",") + "…"
    return text


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)
    src = json.loads(Path(sys.argv[1]).read_text())

    by_level = {lvl: [] for lvl in LEVELS}
    for kanji, info in src.items():
        lvl = LEVEL_OVERRIDE.get(kanji, info.get("jlpt_new"))
        if lvl in by_level:
            by_level[lvl].append({
                "kanji": kanji,
                "meaning": MEANING_OVERRIDE.get(kanji) or clean_meaning(info.get("meanings")),
                "grade": info.get("grade") or 99,
                "freq": info.get("freq"),
                "strokes": info.get("strokes") or 0,
            })

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for lvl in LEVELS:
        items = by_level[lvl]
        by_kanji = {it["kanji"]: it for it in items}

        if lvl in MANUAL_ORDER:
            order = MANUAL_ORDER[lvl]
            assert set(order) == set(by_kanji), (
                f"N{lvl} manual order doesn't match the level's kanji set: "
                f"missing={set(by_kanji) - set(order)} extra={set(order) - set(by_kanji)}"
            )
            items = [by_kanji[k] for k in order]
        else:
            items.sort(key=lambda x: (
                x["grade"],
                x["freq"] is None,
                x["freq"] if x["freq"] is not None else 0,
                x["strokes"],
                x["kanji"],
            ))

        out = [{"kanji": it["kanji"], "meaning": it["meaning"]} for it in items]
        out_path = OUT_DIR / f"n{lvl}.json"
        out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
        print(f"N{lvl}: {len(out)} kanji -> {out_path.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
