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
// other side deleted it); stats add up the reviews done on each side; game
// stores keep the best scores and the union of "missed" lists.
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

  // Scores per set plus the ids last missed: word order, story fill, listening.
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

  // Mystery chapters: { [chapter]: { step, paws, solved, best } }.
  const mergeChapter = (l, r) => Object.assign({}, r, l, {
    solved: !!(l.solved || r.solved),
    best: Math.max(l.best || 0, r.best || 0),
  });

  // How to merge a key both sides changed: (base, local, remote) → value.
  const RULES = {
    tokidoki_srs: (b, l, r) => mergeMap(b, l, r, laterReview),
    tokidoki_story_words: (b, l, r) => mergeMap(b, l, r, keepLocal),
    tokidoki_kanji_cards: (b, l, r) => mergeMap(b, l, r, keepLocal),
    tokidoki_saved_grammar: (b, l, r) => mergeMap(b, l, r, keepLocal),
    tokidoki_stats: mergeStats,
    tokidoki_mystery: (b, l, r) => mergeMap(b, l, r, mergeChapter),
    tokidoki_word_order: mergeGameStore,
    tokidoki_story_fill: mergeGameStore,
    tokidoki_listening: mergeGameStore,
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

  const api = { isTracked, mergeAll, mergeKey, mergeMap, mergeList, sameSnapshot, same };
  global.SyncMerge = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
