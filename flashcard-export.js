(function (global) {
  'use strict';

  // Exports the Stories page's saved words in three formats, entirely in the
  // browser:
  //
  //   - CSV (UTF-8 with BOM, so Excel shows the Japanese correctly)
  //   - Anki deck (.apkg): a zip holding a legacy `collection.anki2` SQLite
  //     database, built with sql.js (vendor/sql.js, loaded only on demand)
  //   - Printable flashcards: a new window laid out as cut-out cards on A4,
  //     fronts then backs (mirrored for double-sided printing), which the
  //     browser's print dialog can save as a PDF
  //
  // Each card passed in is a plain object:
  //   { key, word, reading, meaning, pos, sentence, sentenceEn, story, level }
  // where `sentence` uses the site's inline `kanji[reading]` furigana markup.

  const FURIGANA_RE = /([一-鿿々]+)\[([^\]]+)\]/g;

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  // Anki fields are HTML, but only these three need escaping there; leaving
  // quotes alone keeps the fields readable in Anki's editor.
  function escapeField(text) {
    return String(text).replace(/[&<>]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]));
  }

  function plainText(text) {
    return text.replace(FURIGANA_RE, '$1');
  }

  function rubyHtml(text) {
    return escapeHtml(text).replace(FURIGANA_RE, '<ruby>$1<rt>$2</rt></ruby>');
  }

  // Anki's {{furigana:}} filter treats everything from the previous space up
  // to the bracket as the base text, so every kanji run needs a leading space
  // (Anki hides it when rendering).
  function ankiFurigana(text) {
    return escapeField(text).replace(FURIGANA_RE, ' $1[$2]').trim();
  }

  function download(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function dateStamp() {
    return new Date().toISOString().slice(0, 10);
  }

  // ─── CSV ─────────────────────────────────────────────────────────────────────

  function toCsv(cards) {
    const header = ['Word', 'Reading', 'Meaning', 'Part of speech', 'Sentence', 'Sentence (furigana)', 'Translation', 'Story', 'Level'];
    const rows = cards.map(c => [
      c.word, c.reading, c.meaning, c.pos,
      plainText(c.sentence), c.sentence, c.sentenceEn, c.story, c.level,
    ]);
    const quote = v => {
      const s = String(v == null ? '' : v);
      return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return [header, ...rows].map(r => r.map(quote).join(',')).join('\r\n') + '\r\n';
  }

  function exportCsv(cards) {
    download(`tokidoki-flashcards-${dateStamp()}.csv`,
      new Blob(['\uFEFF' + toCsv(cards)], { type: 'text/csv;charset=utf-8' }));
  }

  // ─── Zip (store-only) ────────────────────────────────────────────────────────

  let crcTable = null;
  function crc32(bytes) {
    if (!crcTable) {
      crcTable = new Uint32Array(256);
      for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
        crcTable[n] = c >>> 0;
      }
    }
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) crc = crcTable[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  // files: [{ name, data: Uint8Array }] → Uint8Array of a zip with no compression.
  function makeZip(files) {
    const enc = new TextEncoder();
    const chunks = [];
    const central = [];
    let offset = 0;

    files.forEach(f => {
      const name = enc.encode(f.name);
      const crc = crc32(f.data);
      const local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true);
      local.setUint16(4, 20, true);              // version needed
      local.setUint16(8, 0, true);               // method: store
      local.setUint32(14, crc, true);
      local.setUint32(18, f.data.length, true);  // compressed size
      local.setUint32(22, f.data.length, true);  // uncompressed size
      local.setUint16(26, name.length, true);
      chunks.push(new Uint8Array(local.buffer), name, f.data);

      const cen = new DataView(new ArrayBuffer(46));
      cen.setUint32(0, 0x02014b50, true);
      cen.setUint16(4, 20, true);
      cen.setUint16(6, 20, true);
      cen.setUint32(16, crc, true);
      cen.setUint32(20, f.data.length, true);
      cen.setUint32(24, f.data.length, true);
      cen.setUint16(28, name.length, true);
      cen.setUint32(42, offset, true);
      central.push(new Uint8Array(cen.buffer), name);

      offset += 30 + name.length + f.data.length;
    });

    const centralSize = central.reduce((n, c) => n + c.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, files.length, true);
    end.setUint16(10, files.length, true);
    end.setUint32(12, centralSize, true);
    end.setUint32(16, offset, true);

    const parts = [...chunks, ...central, new Uint8Array(end.buffer)];
    const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
    let pos = 0;
    parts.forEach(p => { out.set(p, pos); pos += p.length; });
    return out;
  }

  // ─── Anki (.apkg) ────────────────────────────────────────────────────────────

  // Fixed ids so re-importing an updated export reuses the same note type and
  // deck, and notes (matched by guid) are updated instead of duplicated.
  const ANKI_MODEL_ID = 1728050000001;
  const ANKI_DECK_ID = 1728050000002;
  const ANKI_DECK_NAME = 'Tokidoki::Story words';
  const ANKI_FIELDS = ['Word', 'Reading', 'Meaning', 'PartOfSpeech', 'Sentence', 'SentenceEnglish', 'Story'];

  const ANKI_CSS = `.card { font-family: "Hiragino Kaku Gothic Pro", "Yu Gothic", "Noto Sans JP", sans-serif; font-size: 20px; text-align: center; color: #2b2320; background: #fffaf1; }
.word { font-size: 48px; font-weight: bold; margin: 20px 0; }
.reading { font-size: 26px; color: #6c5d53; }
.meaning { font-size: 22px; font-weight: bold; margin: 10px 0; }
.pos { font-size: 14px; color: #a3928a; }
.sentence { font-size: 22px; margin-top: 24px; line-height: 2; }
.sentence-en { font-size: 16px; color: #6c5d53; }
.story { font-size: 12px; color: #a3928a; margin-top: 12px; }
.nightMode.card, .night_mode .card { color: #efe8de; background: #211e28; }`;

  const ANKI_FRONT = '<div class="word">{{Word}}</div>';
  const ANKI_BACK = `{{FrontSide}}
<hr id="answer">
<div class="reading">{{Reading}}</div>
<div class="meaning">{{Meaning}}</div>
<div class="pos">{{PartOfSpeech}}</div>
{{#Sentence}}<div class="sentence">{{furigana:Sentence}}</div>{{/Sentence}}
{{#SentenceEnglish}}<div class="sentence-en">{{SentenceEnglish}}</div>{{/SentenceEnglish}}
{{#Story}}<div class="story">from “{{Story}}”</div>{{/Story}}`;

  const ANKI_SCHEMA = `
CREATE TABLE col (id integer primary key, crt integer not null, mod integer not null, scm integer not null, ver integer not null, dty integer not null, usn integer not null, ls integer not null, conf text not null, models text not null, decks text not null, dconf text not null, tags text not null);
CREATE TABLE notes (id integer primary key, guid text not null, mid integer not null, mod integer not null, usn integer not null, tags text not null, flds text not null, sfld integer not null, csum integer not null, flags integer not null, data text not null);
CREATE TABLE cards (id integer primary key, nid integer not null, did integer not null, ord integer not null, mod integer not null, usn integer not null, type integer not null, queue integer not null, due integer not null, ivl integer not null, factor integer not null, reps integer not null, lapses integer not null, left integer not null, odue integer not null, odid integer not null, flags integer not null, data text not null);
CREATE TABLE revlog (id integer primary key, cid integer not null, usn integer not null, ivl integer not null, lastIvl integer not null, factor integer not null, time integer not null, type integer not null);
CREATE TABLE graves (usn integer not null, oid integer not null, type integer not null);
CREATE INDEX ix_notes_usn on notes (usn);
CREATE INDEX ix_cards_usn on cards (usn);
CREATE INDEX ix_revlog_usn on revlog (usn);
CREATE INDEX ix_cards_nid on cards (nid);
CREATE INDEX ix_cards_sched on cards (did, queue, due);
CREATE INDEX ix_revlog_cid on revlog (cid);
CREATE INDEX ix_notes_csum on notes (csum);`;

  let sqlJsPromise = null;
  function loadSqlJs() {
    if (!sqlJsPromise) {
      sqlJsPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'vendor/sql.js/sql-wasm.js';
        script.onload = () => global.initSqlJs({ locateFile: f => `vendor/sql.js/${f}` }).then(resolve, reject);
        script.onerror = () => reject(new Error('Could not load the SQLite library'));
        document.head.appendChild(script);
      }).catch(err => { sqlJsPromise = null; throw err; });
    }
    return sqlJsPromise;
  }

  // Anki's duplicate-check checksum: first 8 hex digits of the SHA-1 of the
  // note's sort field with HTML stripped.
  async function ankiChecksum(text) {
    const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text.replace(/<[^>]*>/g, '')));
    const hex = Array.from(new Uint8Array(digest).slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join('');
    return parseInt(hex, 16);
  }

  async function buildApkg(cards) {
    const SQL = await loadSqlJs();
    const db = new SQL.Database();
    db.run(ANKI_SCHEMA);

    const nowMs = Date.now();
    const now = Math.floor(nowMs / 1000);

    const model = {
      id: ANKI_MODEL_ID, name: 'Tokidoki Story Word', type: 0, mod: now, usn: -1, sortf: 0, did: ANKI_DECK_ID,
      tmpls: [{ name: 'Word → Meaning', ord: 0, qfmt: ANKI_FRONT, afmt: ANKI_BACK, did: null, bqfmt: '', bafmt: '' }],
      flds: ANKI_FIELDS.map((name, ord) => ({ name, ord, sticky: false, rtl: false, font: 'Arial', size: 20, media: [] })),
      css: ANKI_CSS,
      latexPre: '\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n',
      latexPost: '\\end{document}',
      latexsvg: false,
      req: [[0, 'any', [0]]],
      tags: [], vers: [],
    };
    const deckBase = { collapsed: false, conf: 1, desc: '', dyn: 0, extendNew: 10, extendRev: 50, lrnToday: [0, 0], newToday: [0, 0], revToday: [0, 0], timeToday: [0, 0], usn: -1, mod: now };
    const decks = {
      1: { ...deckBase, id: 1, name: 'Default' },
      [ANKI_DECK_ID]: { ...deckBase, id: ANKI_DECK_ID, name: ANKI_DECK_NAME, desc: 'Words saved while reading stories on Tokidoki (tokidoki.meertens.dev).' },
    };
    const dconf = {
      1: {
        id: 1, name: 'Default', mod: 0, usn: 0, maxTaken: 60, autoplay: true, timer: 0, replayq: true, dyn: false,
        new: { bury: true, delays: [1, 10], initialFactor: 2500, ints: [1, 4, 7], order: 1, perDay: 20, separate: true },
        lapse: { delays: [10], leechAction: 0, leechFails: 8, minInt: 1, mult: 0 },
        rev: { bury: true, ease4: 1.3, fuzz: 0.05, ivlFct: 1, maxIvl: 36500, minSpace: 1, perDay: 100 },
      },
    };
    const conf = { activeDecks: [1], curDeck: 1, newSpread: 0, collapseTime: 1200, timeLim: 0, estTimes: true, dueCounts: true, curModel: ANKI_MODEL_ID, nextPos: cards.length + 1, sortType: 'noteFld', sortBackwards: false, addToCur: true };

    db.run('INSERT INTO col VALUES (1, ?, ?, ?, 11, 0, 0, 0, ?, ?, ?, ?, ?)', [
      now, nowMs, nowMs, JSON.stringify(conf), JSON.stringify({ [ANKI_MODEL_ID]: model }),
      JSON.stringify(decks), JSON.stringify(dconf), '{}',
    ]);

    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      const fields = [
        escapeField(c.word), escapeField(c.reading), escapeField(c.meaning), escapeField(c.pos),
        c.sentence ? ankiFurigana(c.sentence) : '', escapeField(c.sentenceEn || ''), escapeField(c.story || ''),
      ];
      const noteId = nowMs + i;
      const tags = ` tokidoki ${String(c.level || '').toLowerCase()} `.replace(/\s+/g, ' ');
      db.run('INSERT INTO notes VALUES (?, ?, ?, ?, -1, ?, ?, ?, ?, 0, \'\')', [
        noteId, `tokidoki-story:${c.key}`, ANKI_MODEL_ID, now, tags,
        fields.join('\x1f'), fields[0], await ankiChecksum(fields[0]),
      ]);
      db.run('INSERT INTO cards VALUES (?, ?, ?, 0, ?, -1, 0, 0, ?, 0, 0, 0, 0, 0, 0, 0, 0, \'\')', [
        noteId, noteId, ANKI_DECK_ID, now, i + 1,
      ]);
    }

    const sqlite = db.export();
    db.close();
    return makeZip([
      { name: 'collection.anki2', data: sqlite },
      { name: 'media', data: new TextEncoder().encode('{}') },
    ]);
  }

  async function exportAnki(cards) {
    const zip = await buildApkg(cards);
    download(`tokidoki-flashcards-${dateStamp()}.apkg`, new Blob([zip], { type: 'application/octet-stream' }));
  }

  // ─── Printable cards ─────────────────────────────────────────────────────────

  const PRINT_COLS = 2;
  const PRINT_ROWS = 5;

  function printHtml(cards) {
    const perPage = PRINT_COLS * PRINT_ROWS;
    const pages = [];
    for (let start = 0; start < cards.length; start += perPage) {
      const slice = cards.slice(start, start + perPage);
      while (slice.length < perPage) slice.push(null);
      const fronts = slice.map(c => c
        ? `<div class="cell front"><div class="word">${escapeHtml(c.word)}</div></div>`
        : '<div class="cell empty"></div>');
      // Backs are mirrored left-to-right within each row, so after flipping
      // the sheet on its long edge each back lands behind its own front.
      const backs = [];
      for (let r = 0; r < PRINT_ROWS; r++) {
        const row = slice.slice(r * PRINT_COLS, (r + 1) * PRINT_COLS).reverse();
        row.forEach(c => backs.push(c
          ? `<div class="cell back">
              ${c.reading !== c.word ? `<div class="reading">${escapeHtml(c.reading)}</div>` : ''}
              <div class="meaning">${escapeHtml(c.meaning)}</div>
              <div class="pos">${escapeHtml(c.pos)}</div>
              ${c.sentence ? `<div class="sentence">${rubyHtml(c.sentence)}</div>` : ''}
              ${c.sentenceEn ? `<div class="sentence-en">${escapeHtml(c.sentenceEn)}</div>` : ''}
            </div>`
          : '<div class="cell empty"></div>'));
      }
      pages.push(`<section class="sheet">${fronts.join('')}</section>`);
      pages.push(`<section class="sheet">${backs.join('')}</section>`);
    }

    return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>Tokidoki flashcards</title>
<style>
  @page { size: A4; margin: 10mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: "Hiragino Kaku Gothic Pro", "Yu Gothic", "Meiryo", "Noto Sans JP", sans-serif; color: #2b2320; background: #e9e4da; }
  .note { max-width: 190mm; margin: 12px auto; padding: 12px 16px; background: #fffaf1; border: 1px solid #e5d6bf; border-radius: 10px; font: 14px/1.5 system-ui, sans-serif; }
  .note button { margin-top: 8px; padding: 8px 14px; border: none; border-radius: 8px; background: #3a57a6; color: #fff; font-weight: 600; cursor: pointer; }
  .sheet { width: 190mm; height: 277mm; margin: 0 auto 12px; background: #fff; display: grid;
           grid-template-columns: repeat(${PRINT_COLS}, 1fr); grid-template-rows: repeat(${PRINT_ROWS}, 1fr); }
  .cell { border: 0.3mm dashed #b9ad9c; display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; padding: 4mm 5mm; overflow: hidden; }
  .cell.empty { border-color: transparent; }
  .word { font-size: 30pt; font-weight: 700; }
  .reading { font-size: 14pt; color: #6c5d53; }
  .meaning { font-size: 12pt; font-weight: 700; margin-top: 1mm; }
  .pos { font-size: 8pt; color: #8c7d72; margin-top: 0.5mm; }
  .sentence { font-size: 10pt; line-height: 1.9; margin-top: 2mm; }
  .sentence rt { font-size: 0.5em; color: #6c5d53; }
  .sentence-en { font-size: 8pt; color: #6c5d53; }
  @media print {
    body { background: none; }
    .note { display: none; }
    .sheet { margin: 0; page-break-after: always; break-after: page; }
    .sheet:last-child { page-break-after: auto; break-after: auto; }
  }
</style>
</head>
<body>
  <div class="note">
    <strong>${cards.length} flashcard${cards.length === 1 ? '' : 's'}</strong> — word fronts and answer backs on alternating pages.
    Print double-sided (flip on long edge), or choose “Save as PDF” as the printer to get a PDF, then cut along the dashed lines.
    <br><button onclick="window.print()">Print / Save as PDF</button>
  </div>
  ${pages.join('\n')}
</body>
</html>`;
  }

  function exportPrint(cards) {
    const win = window.open('', '_blank');
    if (!win) throw new Error('Pop-up blocked — allow pop-ups for this site to print flashcards.');
    win.document.open();
    win.document.write(printHtml(cards));
    win.document.close();
    // Give fonts a moment to settle before opening the print dialog.
    setTimeout(() => { win.focus(); win.print(); }, 400);
  }

  global.FlashcardExport = { toCsv, exportCsv, buildApkg, exportAnki, printHtml, exportPrint };
})(window);
