import json
import os
import sqlite3

from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__, static_folder=".", static_url_path="")

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "genki.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS srs_cards (
            card_id TEXT PRIMARY KEY,
            ease_factor REAL NOT NULL DEFAULT 2.5,
            interval INTEGER NOT NULL DEFAULT 0,
            repetitions INTEGER NOT NULL DEFAULT 0,
            next_review INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS stats (
            id INTEGER PRIMARY KEY DEFAULT 1,
            total_reviews INTEGER NOT NULL DEFAULT 0,
            total_correct INTEGER NOT NULL DEFAULT 0,
            streak INTEGER NOT NULL DEFAULT 0,
            last_study_date TEXT,
            today_reviews INTEGER NOT NULL DEFAULT 0,
            today_correct INTEGER NOT NULL DEFAULT 0
        );

        INSERT OR IGNORE INTO stats (id) VALUES (1);
    """)

    cols = [row[1] for row in conn.execute("PRAGMA table_info(stats)").fetchall()]
    if "today_reviews" not in cols:
        conn.execute("ALTER TABLE stats ADD COLUMN today_reviews INTEGER NOT NULL DEFAULT 0")
        conn.execute("ALTER TABLE stats ADD COLUMN today_correct INTEGER NOT NULL DEFAULT 0")

    conn.commit()
    conn.close()


# ── Static files ────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory(".", "index.html")


# ── SRS API ─────────────────────────────────────────────────────────────────

@app.route("/api/srs", methods=["GET"])
def get_srs():
    conn = get_db()
    rows = conn.execute("SELECT * FROM srs_cards").fetchall()
    conn.close()
    result = {}
    for row in rows:
        result[row["card_id"]] = {
            "easeFactor": row["ease_factor"],
            "interval": row["interval"],
            "repetitions": row["repetitions"],
            "nextReview": row["next_review"],
        }
    return jsonify(result)


@app.route("/api/srs", methods=["PUT"])
def put_srs():
    data = request.get_json(force=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Expected JSON object"}), 400

    conn = get_db()
    for card_id, state in data.items():
        conn.execute(
            """INSERT INTO srs_cards (card_id, ease_factor, interval, repetitions, next_review)
               VALUES (?, ?, ?, ?, ?)
               ON CONFLICT(card_id) DO UPDATE SET
                 ease_factor = excluded.ease_factor,
                 interval = excluded.interval,
                 repetitions = excluded.repetitions,
                 next_review = excluded.next_review""",
            (
                card_id,
                state.get("easeFactor", 2.5),
                state.get("interval", 0),
                state.get("repetitions", 0),
                state.get("nextReview", 0),
            ),
        )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


@app.route("/api/srs/<path:card_id>", methods=["DELETE"])
def delete_srs_card(card_id):
    conn = get_db()
    conn.execute("DELETE FROM srs_cards WHERE card_id = ?", (card_id,))
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


# ── Stats API ───────────────────────────────────────────────────────────────

@app.route("/api/stats", methods=["GET"])
def get_stats():
    conn = get_db()
    row = conn.execute("SELECT * FROM stats WHERE id = 1").fetchone()
    conn.close()
    if not row:
        return jsonify({"totalReviews": 0, "totalCorrect": 0, "streak": 0, "lastStudyDate": None})
    return jsonify({
        "totalReviews": row["total_reviews"],
        "totalCorrect": row["total_correct"],
        "streak": row["streak"],
        "lastStudyDate": row["last_study_date"],
        "todayReviews": row["today_reviews"],
        "todayCorrect": row["today_correct"],
    })


@app.route("/api/stats", methods=["PUT"])
def put_stats():
    data = request.get_json(force=True)
    conn = get_db()
    conn.execute(
        """UPDATE stats SET
             total_reviews = ?,
             total_correct = ?,
             streak = ?,
             last_study_date = ?,
             today_reviews = ?,
             today_correct = ?
           WHERE id = 1""",
        (
            data.get("totalReviews", 0),
            data.get("totalCorrect", 0),
            data.get("streak", 0),
            data.get("lastStudyDate"),
            data.get("todayReviews", 0),
            data.get("todayCorrect", 0),
        ),
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


# ── Reset API ───────────────────────────────────────────────────────────────

@app.route("/api/reset", methods=["POST"])
def reset_all():
    conn = get_db()
    conn.execute("DELETE FROM srs_cards")
    conn.execute("UPDATE stats SET total_reviews=0, total_correct=0, streak=0, last_study_date=NULL, today_reviews=0, today_correct=0 WHERE id=1")
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


if __name__ == "__main__":
    init_db()
    print("Genki Conjugation Cards server running at http://localhost:5000")
    app.run(debug=True, port=5000)
