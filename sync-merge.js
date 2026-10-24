// Merging saved progress between this device and the user's account.
//
// Everything Tokidoki remembers lives in localStorage under keys starting
// `tokidoki_` or `tokidoki-` (as JSON strings). When someone is logged in,
// sync.js keeps a copy of all of them in their account, and merges the two
// with `mergeAll(base, local, remote)`, where each argument is
// { [key]: rawString } and `base` is what both sides last agreed on (empty
// the first time this device syncs). Working from the base is what lets a
// card deleted on one device stay deleted, and progress made on two devices
// both survive:
//
//   - a key only one side changed since the base: that side's value
//   - both changed: merged by the key's rule below, entry by entry
//   - both changed and there's no rule (settings, notepad text, theme):
//     the account's value the first time a device syncs, this device's after
//
// Rules: the SRS store keeps each card's most recently reviewed schedule;
// the word and kanji decks (and saved grammar) keep every card either side has (unless the
// other side deleted it); stats and the review log add up the reviews done
// on each side, and word lookups the taps; game stores keep the best scores
// and the union of "missed" lists.
//
// The bottom half is how that data is laid out in the account document
// (`encodeAccount` / `decodeAccount`), built so a sync sends little.
(function (global) {
  'use strict';

  const PREFIX_RE = /^tokidoki[_-]/;
  // sync.js's own bookkeeping, never synced.
  const isTracked = key => PREFIX_RE.test(key) && !key.startsWith('tokidoki_sync');

  const DAY = 86400000;

  const parse = raw => { if (raw == null) return undefined; try { return JSON.parse(raw); } catch { return raw; } };
  const isObj = v => v != null && typeof v === 'object' && !Array.isArray(v);

  // Order-insensitive equality for parsed JSON.
  function same(a, b) {
    if (a === b) return true;
    if (Array.isArray(a) || Array.isArray(b)) {
      return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => same(v, b[i]));
    }
    if (!isObj(a) || !isObj(b)) return false;
    const ka = Object.keys(a);
    return ka.length === Object.keys(b).length && ka.every(k => k in b && same(a[k], b[k]));
  }

  // Three-way merge of { id: entry } maps: an entry one side removed (and
  // the other left as it was) goes; one both have goes through `pick`.
  function mergeMap(base, local, remote, pick) {
    base = isObj(base) ? base : {};
    local = isObj(local) ? local : {};
    remote = isObj(remote) ? remote : {};
    const out = {};
    new Set([...Object.keys(local), ...Object.keys(remote)]).forEach(k => {
      const l = local[k], r = remote[k], b = base[k];
      if (l === undefined) { if (!(k in base) || !same(r, b)) out[k] = r; return; }
      if (r === undefined) { if (!(k in base) || !same(l, b)) out[k] = l; return; }
      out[k] = same(l, r) ? l : pick(l, r, b);
    });
    return out;
  }

  // Three-way merge of lists of ids, e.g. the questions someone missed.
  function mergeList(base, local, remote) {
    base = Array.isArray(base) ? base : [];
    local = Array.isArray(local) ? local : [];
    remote = Array.isArray(remote) ? remote : [];
    const gone = new Set(base.filter(x => !local.includes(x) || !remote.includes(x)));
    const out = [];
    [...local, ...remote].forEach(x => { if (!gone.has(x) && !out.includes(x)) out.push(x); });
    return out;
  }

  const keepLocal = l => l;

  // When a card was last graded: gradeCard sets nextReview to now + interval days.
  const reviewedAt = c => (c && c.nextReview || 0) - (c && c.interval || 0) * DAY;
  const laterReview = (l, r) => {
    const tl = reviewedAt(l), tr = reviewedAt(r);
    if (tl !== tr) return tl > tr ? l : r;
    return (r.repetitions || 0) > (l.repetitions || 0) ? r : l;
  };

  const higherScore = (l, r) => ((r && r.score) || 0) > ((l && l.score) || 0) ? r : l;

  // Scores per set plus the ids last missed: word order, story fill, listening,
  // vocab quiz.
  function mergeGameStore(b, l, r) {
    b = isObj(b) ? b : {};
    const out = Object.assign({}, r, l);
    if (isObj(l.best) || isObj(r.best)) out.best = mergeMap(b.best, l.best, r.best, higherScore);
    if (isObj(l.last) || isObj(r.last)) out.last = mergeMap(b.last, l.last, r.last, keepLocal);
    if (Array.isArray(l.missed) || Array.isArray(r.missed)) out.missed = mergeList(b.missed, l.missed, r.missed);
    return out;
  }

  function mergeStats(b, l, r) {
    b = isObj(b) ? b : {};
    const n = v => Number(v) || 0;
    // Reviews done on each side since the base, added together. With no
    // base (first sync) the two may overlap, so just the larger.
    const add = k => Math.max(n(l[k]), n(r[k]), k in b ? n(l[k]) + n(r[k]) - n(b[k]) : 0);
    const out = Object.assign({}, r, l);
    out.totalReviews = add('totalReviews');
    out.totalCorrect = add('totalCorrect');
    const dl = l.lastStudyDate || '', dr = r.lastStudyDate || '';
    if (dl === dr) {
      const sameDay = b.lastStudyDate === dl;
      ['todayReviews', 'todayCorrect'].forEach(k => {
        out[k] = sameDay ? add(k) : Math.max(n(l[k]), n(r[k]));
      });
      out.streak = Math.max(n(l.streak), n(r.streak));
    } else {
      const newer = dl > dr ? l : r;
      ['lastStudyDate', 'streak', 'todayReviews', 'todayCorrect'].forEach(k => { out[k] = newer[k]; });
    }
    return out;
  }

  // Counters (numbers, or arrays and objects of them) that each side only
  // ever adds to: the reviews done on each side since the base, added
  // together. With no base at all (first sync) the two may overlap, so the
  // larger of each.
  function addCounts(l, r, b, first) {
    if (Array.isArray(l) || Array.isArray(r)) {
      l = Array.isArray(l) ? l : []; r = Array.isArray(r) ? r : []; b = Array.isArray(b) ? b : [];
      return Array.from({ length: Math.max(l.length, r.length) }, (_, i) => addCounts(l[i], r[i], b[i], first));
    }
    if (isObj(l) || isObj(r)) {
      l = isObj(l) ? l : {}; r = isObj(r) ? r : {}; b = isObj(b) ? b : {};
      const out = {};
      new Set([...Object.keys(l), ...Object.keys(r)]).forEach(k => { out[k] = addCounts(l[k], r[k], b[k], first); });
      return out;
    }
    const n = v => Number(v) || 0;
    return first ? Math.max(n(l), n(r)) : Math.max(n(l), n(r), n(l) + n(r) - n(b));
  }

  // The review log, { [day]: { [kind]: [reviews, fails, seconds] } }: a day
  // missing from the base was studied on both sides since, so it adds up too.
  const mergeDayLog = (b, l, r) => mergeMap(b, l, r, (le, re, be) => addCounts(le, re, be, !isObj(b)));

  // Mystery chapters: { [chapter]: { step, paws, solved, best } }.
  const mergeChapter = (l, r) => Object.assign({}, r, l, {
    solved: !!(l.solved || r.solved),
    best: Math.max(l.best || 0, r.best || 0),
  });

  // Conversation starters: { answers: { 'topic:N5': { text, t } },
  // feedback: { 'topic:N5': { for, result, t } } } — the newer of each.
  const newerText = (l, r) => ((r && r.t) || 0) > ((l && l.t) || 0) ? r : l;
  function mergeConversation(b, l, r) {
    b = isObj(b) ? b : {};
    const out = Object.assign({}, r, l, { answers: mergeMap(b.answers, l.answers, r.answers, newerText) });
    if (isObj(l.feedback) || isObj(r.feedback)) out.feedback = mergeMap(b.feedback, l.feedback, r.feedback, newerText);
    return out;
  }

  // Word lookups (word-lookups.js), { [word]: [times, last tap] }: the taps
  // on each side added up, and the later last tap.
  const mergeLookups = (b, l, r) => mergeMap(b, l, r, (le, re, be) => {
    const [lt, ll] = Array.isArray(le) ? le : [], [rt, rl] = Array.isArray(re) ? re : [];
    return [addCounts(lt, rt, Array.isArray(be) ? be[0] : 0, !isObj(b)), Math.max(ll || 0, rl || 0)];
  });

  // How to merge a key both sides changed: (base, local, remote) → value.
  const RULES = {
    tokidoki_srs: (b, l, r) => mergeMap(b, l, r, laterReview),
    tokidoki_story_words: (b, l, r) => mergeMap(b, l, r, keepLocal),
    tokidoki_kanji_cards: (b, l, r) => mergeMap(b, l, r, keepLocal),
    tokidoki_saved_grammar: (b, l, r) => mergeMap(b, l, r, keepLocal),
    tokidoki_stats: mergeStats,
    tokidoki_daylog: mergeDayLog,
    tokidoki_review_totals: (b, l, r) => addCounts(l, r, b, !isObj(b)),
    tokidoki_mystery: (b, l, r) => mergeMap(b, l, r, mergeChapter),
    tokidoki_word_order: mergeGameStore,
    tokidoki_story_fill: mergeGameStore,
    tokidoki_particle_story: mergeGameStore,
    tokidoki_bunkei_story: mergeGameStore,
    tokidoki_listening: mergeGameStore,
    tokidoki_vocab_quiz: mergeGameStore,
    tokidoki_conversation: mergeConversation,
    tokidoki_lookups: mergeLookups,
  };

  // One key, as raw strings (null = not set). Returns the merged raw string, or null.
  function mergeKey(key, baseRaw, localRaw, remoteRaw, firstSync) {
    const b = parse(baseRaw), l = parse(localRaw), r = parse(remoteRaw);
    if (same(l, r)) return localRaw;
    if (same(l, b)) return remoteRaw;
    if (same(r, b)) return localRaw;
    const rule = RULES[key];
    if (rule && isObj(l) && isObj(r)) return JSON.stringify(rule(b, l, r));
    // A side that removed the key: keep what the other has.
    if (localRaw == null) return remoteRaw;
    if (remoteRaw == null) return localRaw;
    return firstSync ? remoteRaw : localRaw;
  }

  // { [key]: raw } × 3 → { [key]: raw } of every key that should exist.
  function mergeAll(base, local, remote) {
    base = base || {};
    local = local || {};
    remote = remote || {};
    const firstSync = Object.keys(base).length === 0;
    const out = {};
    new Set([...Object.keys(local), ...Object.keys(remote)]).forEach(key => {
      if (!isTracked(key)) return;
      const v = mergeKey(key, key in base ? base[key] : null,
        key in local ? local[key] : null, key in remote ? remote[key] : null, firstSync);
      if (v != null) out[key] = v;
    });
    return out;
  }

  // Whether two { key: raw } snapshots hold the same data.
  function sameSnapshot(a, b) {
    const ka = Object.keys(a || {}), kb = Object.keys(b || {});
    return ka.length === kb.length && ka.every(k => k in b && same(parse(a[k]), parse(b[k])));
  }

  // ─── The account document ──────────────────────────────────────────────────
  //
  // users/{uid} holds:
  //   data  2 — the format. Older versions of sync.js read `data` as the
  //         progress itself; finding a number there makes them stop with an
  //         error before writing anything, so an old tab can't wipe this.
  //   rev   how many times it's been written; a device that last saw this
  //         rev knows the account still holds what it has, and skips the
  //         download.
  //   k     { [key]: rawString } for every key but the two below.
  //   s     the SRS store, spread over up to 256 fields by a hash of the card
  //         id, one card per line: `<id>\t<ease×100>,<interval>,<reps>,<due
  //         minute>` (ids shortened, see packCards) — about a fifth of the
  //         JSON's size.
  //   l     the review log, one field (a JSON object) per month.
  // Each field is a few kB at most, so a sync writes only the fields that
  // changed (sync.js compares the old and new encodings), and the document
  // stays far below Firestore's 1 MiB limit.
  const FORMAT = 2;
  const MIN = 60000;

  function hash(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return h >>> 0;
  }

  const isCount = v => Number.isInteger(v) && v >= 0;
  const CARD_FIELDS = 'easeFactor,interval,repetitions,nextReview';

  // A card in the compact form, or as JSON if it isn't the usual shape.
  function encodeCard(c) {
    if (isObj(c) && Object.keys(c).sort().join() === CARD_FIELDS.split(',').sort().join()
      && Number.isFinite(c.easeFactor) && isCount(c.interval) && isCount(c.repetitions) && Number.isFinite(c.nextReview)) {
      return `${Math.round(c.easeFactor * 100)},${c.interval},${c.repetitions},${Math.round(c.nextReview / MIN)}`;
    }
    return JSON.stringify(c);
  }

  function decodeCard(v) {
    if (!/^-?\d+,\d+,\d+,-?\d+$/.test(v)) return parse(v);
    const [e, i, r, d] = v.split(',').map(Number);
    return { easeFactor: e / 100, interval: i, repetitions: r, nextReview: d * MIN };
  }

  // A line per card, sorted by id. Ids in a bucket share long beginnings
  // (kanjiquiz_n1_meaning_…), so each line gives how many characters it
  // shares with the line before, then the rest: `21 議\t256,13,3,29336397`.
  // An id that would break the line format goes as JSON, in full.
  function packCards(entries) {
    let prev = '';
    return entries.map(([id, c]) => {
      const v = encodeCard(c);
      let line;
      if (/[\t\n]/.test(id)) line = JSON.stringify([id, v]);
      else {
        let p = 0;
        while (p < id.length && p < prev.length && id[p] === prev[p]) p++;
        line = `${p} ${id.slice(p)}\t${v}`;
      }
      prev = id;
      return line;
    }).join('\n');
  }

  function unpackCards(str) {
    let prev = '';
    return str.split('\n').filter(Boolean).map(line => {
      let id, v;
      if (line[0] === '[') [id, v] = JSON.parse(line);
      else {
        const m = /^(\d+) ([^\t]*)\t(.*)$/.exec(line);
        id = prev.slice(0, Number(m[1])) + m[2];
        v = m[3];
      }
      prev = id;
      return [id, decodeCard(v)];
    });
  }

  const byKey = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

  // Keys stored entry by entry, spread over the fields of one map.
  const SPLIT = {
    tokidoki_srs: {
      field: 's',
      bucket: id => (hash(id) & 255).toString(16).padStart(2, '0'),
      pack: packCards,
      unpack: unpackCards,
    },
    tokidoki_daylog: {
      field: 'l',
      bucket: day => String(day).slice(0, 7),
      pack: entries => JSON.stringify(Object.fromEntries(entries)),
      unpack: str => Object.entries(parse(str) || {}),
    },
  };
  const FIELDS = ['k', ...Object.values(SPLIT).map(x => x.field)];

  // { [key]: raw } → { k: { [key]: raw }, s: { [bucket]: string }, l: {…} }
  function encodeAccount(snap) {
    const out = {};
    FIELDS.forEach(f => { out[f] = {}; });
    Object.keys(snap || {}).forEach(key => {
      const raw = snap[key];
      const split = SPLIT[key];
      const obj = split && parse(raw);
      if (!split || !isObj(obj) || !Object.keys(obj).length) { out.k[key] = raw; return; }
      const buckets = {};
      Object.keys(obj).sort(byKey).forEach(id => { (buckets[split.bucket(id)] = buckets[split.bucket(id)] || []).push([id, obj[id]]); });
      Object.keys(buckets).forEach(b => { out[split.field][b] = split.pack(buckets[b]); });
    });
    return out;
  }

  function decodeAccount(enc) {
    enc = enc || {};
    const out = Object.assign({}, enc.k);
    Object.keys(SPLIT).forEach(key => {
      const { field, unpack } = SPLIT[key];
      const fields = isObj(enc[field]) ? enc[field] : {};
      const names = Object.keys(fields).sort(byKey);
      if (!names.length) return;
      const obj = {};
      names.forEach(n => { unpack(String(fields[n])).forEach(([id, v]) => { obj[id] = v; }); });
      out[key] = JSON.stringify(obj);
    });
    return out;
  }

  // What a snapshot looks like after a trip through the account (cards'
  // ease rounded, due times to the minute), so that alone isn't a change.
  function canonical(snap) {
    const out = Object.assign({}, snap);
    if (out.tokidoki_srs != null) {
      const back = decodeAccount(encodeAccount({ tokidoki_srs: out.tokidoki_srs }));
      out.tokidoki_srs = back.tokidoki_srs;
    }
    return out;
  }

  // The fields that differ between two encodings: [[field, name, value]],
  // value undefined for a field to delete.
  function diffAccount(before, after) {
    const out = [];
    FIELDS.forEach(f => {
      const a = (before && before[f]) || {}, b = (after && after[f]) || {};
      new Set([...Object.keys(a), ...Object.keys(b)]).forEach(n => {
        if (a[n] !== b[n]) out.push([f, n, b[n]]);
      });
    });
    return out;
  }

  const api = {
    isTracked, mergeAll, mergeKey, mergeMap, mergeList, sameSnapshot, same, addCounts,
    FORMAT, FIELDS, encodeAccount, decodeAccount, canonical, diffAccount, encodeCard, decodeCard,
  };
  global.SyncMerge = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
