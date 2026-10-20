#!/usr/bin/env python3
"""Render the per-grammar-point translation worksheets to standalone print HTML.

Reads sentence-sheets/data/<chunk>.json (see extract_sentence_data.mjs) and
writes, per grammar chunk, four sheets:
  - <chunk>-to-english.html          Japanese sentences shown, write the English translation
  - <chunk>-to-english-answers.html  answer key for that sheet — Japanese
                                      question printed first, English answer below
  - <chunk>-to-japanese.html         English sentences shown, write the Japanese translation
  - <chunk>-to-japanese-answers.html answer key for that sheet — English
                                      question printed first, Japanese answer below
Each answer key mirrors its own worksheet's direction (question always
before its answer) rather than one answer key covering both directions,
where the fixed field order would be backwards for one of them.
Those files are then printed to PDF (see render_sheets_pdfs.mjs).
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from sheet_html import render_sentence_answers_page, render_sentence_worksheet_page

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = REPO_ROOT / "sentence-sheets" / "data"


def main():
    if len(sys.argv) != 2:
        print("usage: render_sentence_html.py <out-dir>")
        sys.exit(1)
    out_dir = Path(sys.argv[1])
    out_dir.mkdir(parents=True, exist_ok=True)

    sheets = sorted((json.loads(p.read_text()) for p in DATA_DIR.glob("*.json")), key=lambda d: d["order"])
    for data in sheets:
        title = f"{data['level']} — {data['title']}"
        items = data["sentences"]

        stem = f"tokidoki-sentences-{data['id']}"

        to_english = render_sentence_worksheet_page(
            f"{title}: Translate to English",
            f"{data['level']} grammar — read each Japanese sentence and write its English translation on the lines below.",
            items, "jaHtml", "jp",
        )
        (out_dir / f"{stem}-to-english.html").write_text(to_english)

        to_english_answers = render_sentence_answers_page(
            f"{title}: Translate to English — Answer Key", items, "to-english",
        )
        (out_dir / f"{stem}-to-english-answers.html").write_text(to_english_answers)

        to_japanese = render_sentence_worksheet_page(
            f"{title}: Translate to Japanese",
            f"{data['level']} grammar — read each English sentence and write its Japanese translation on the lines below.",
            items, "en", "en",
        )
        (out_dir / f"{stem}-to-japanese.html").write_text(to_japanese)

        to_japanese_answers = render_sentence_answers_page(
            f"{title}: Translate to Japanese — Answer Key", items, "to-japanese",
        )
        (out_dir / f"{stem}-to-japanese-answers.html").write_text(to_japanese_answers)

        print(f"{data['id']} ({data['level']}): {len(items)} sentences → 4 sheets")


if __name__ == "__main__":
    main()
