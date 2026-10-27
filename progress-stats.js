// Progress statistics for the account dialog (sync.js), in the spirit of
// Anki's: how many cards have been studied in each kind of practice and how
// many are learned or due, a calendar of reviews, the reviews coming up,
// card intervals, how often answers are right (by card age and by hour), and
// how far the games have got.
//
// Most of it is worked out from what's saved anyway (the SRS store, decks,
// game stores). What Anki reads from its review log comes from two small
// stores kept here, which record every graded flashcard (`record()`, called
// from app.js):
//   tokidoki_daylog         { [local day]: { [kind]: [reviews, fails, seconds] } }
//   tokidoki_review_totals  { hours: [[reviews, fails] × 24],
//                             cards: { learning|young|mature: [reviews, fails] } }
// Totals per day rather than one entry per review keep them to a few kB a
// year; sync-merge.js adds up the counts made on different devices.
//
// `progressStats(data, now)` takes { [key]: rawString } — the same
// `tokidoki_` keys sync-merge.js syncs — so it works on localStorage and in
// tests alike.
(function (global) {
  'use strict';

  const DAY = 86400000;
  // A card whose next review is three weeks or more away counts as learned
  // (what Anki calls "mature").
  const LEARNED_DAYS = 21;
  // Time spent: the gap since the previous review, capped like Anki's
  // answer timer (so a break doesn't count).
  const MAX_SECONDS = 60;

  const LOG_KEY = 'tokidoki_daylog';
  const TOTALS_KEY = 'tokidoki_review_totals';

  // Which practice a card in the shared SRS store (tokidoki_srs) belongs
  // to, by the shape of its id. Word and kanji flashcards are reviewed
  // either way round; the meaning → Japanese schedule is `<id>:recall`.
  const KINDS = [
    { id: 'verbs', label: 'Verb conjugation', test: id => /^\d+_/.test(id) },
    { id: 'adjectives', label: 'Adjectives', test: id => /^adj(sent)?:/.test(id) },
    { id: 'bunkei', label: 'Sentence patterns', test: id => id.startsWith('bunkei:') },
    { id: 'translate', label: 'Translation', test: id => id.startsWith('tr_') },
    { id: 'particles', label: 'Particles', test: id => id.startsWith('particle_') || id.startsWith('vparticle_') },
    { id: 'kana', label: 'Kana', test: id => id.startsWith('kana_') },
    { id: 'kanji', label: 'Kanji quiz', test: id => id.startsWith('kanjiquiz_') || id.startsWith('confusable_') },
    { id: 'words', label: 'Word flashcards', test: id => id.startsWith('story_word:') },
    { id: 'kanjiCards', label: 'Kanji flashcards', test: id => id.startsWith('kanji_card:') },
    { id: 'guess', label: 'GTK - Easy Word Order', test: id => id.startsWith('guess:') },
  ];
  const kindOf = id => { const k = KINDS.find(x => x.test(String(id))); return k ? k.id : 'other'; };

  // A card's age, as Anki splits them: learning (failed or never passed),
  // young, mature.
  const ageOf = c => { const iv = (c && Number(c.interval)) || 0; return iv <= 0 ? 'learning' : iv < LEARNED_DAYS ? 'young' : 'mature'; };

  const parse = raw => { if (raw == null) return null; try { return JSON.parse(raw); } catch { return null; } };
  const isObj = v => v != null && typeof v === 'object' && !Array.isArray(v);
  const obj = raw => { const v = parse(raw); return isObj(v) ? v : {}; };
  const count = o => Object.keys(o).length;
  const n = v => Number(v) || 0;
  // The game stores' `best` also keep the "missed" and quick-mix rounds.
  const sets = best => Object.keys(isObj(best) ? best : {}).filter(k => k !== 'missed' && k !== 'quick').length;

  // Days are the learner's own (local) calendar days, YYYY-MM-DD.
  const pad = x => String(x).padStart(2, '0');
  const localDay = t => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const startOfDay = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const daysBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / DAY);
  const addDays = (t, k) => { const d = new Date(t); d.setDate(d.getDate() + k); return d.getTime(); };

  // ─── Recording reviews ───────────────────────────────────────────────────────

  let lastReview = 0;  // none yet on this page: the first counts as the cap

  // One graded card: its id, its schedule before grading, and the grade
  // (1 = wrong/again). Returns what unrecord() needs to take it back.
  function record(id, prev, grade, now) {
    const store = global.localStorage;
    if (!store) return null;
    now = now == null ? Date.now() : now;
    const entry = {
      day: localDay(now),
      hour: new Date(now).getHours(),
      kind: kindOf(id),
      age: ageOf(prev),
      fail: grade <= 1 ? 1 : 0,
      secs: Math.max(1, Math.min(MAX_SECONDS, Math.round((now - lastReview) / 1000))),
    };
    lastReview = now;
    apply(store, entry, 1);
    return entry;
  }

  // Takes back a review (the "previous card" buttons undo a grade).
  function unrecord(entry) {
    const store = global.localStorage;
    if (store && entry) apply(store, entry, -1);
  }

  function apply(store, e, sign) {
    const read = k => { try { return obj(store.getItem(k)); } catch { return {}; } };
    const bump = (arr, i, by) => { arr[i] = Math.max(0, n(arr[i]) + by); };
    const log = read(LOG_KEY);
    const day = log[e.day] = isObj(log[e.day]) ? log[e.day] : {};
    const k = day[e.kind] = Array.isArray(day[e.kind]) ? day[e.kind] : [0, 0, 0];
    bump(k, 0, sign); bump(k, 1, sign * e.fail); bump(k, 2, sign * e.secs);
    const totals = read(TOTALS_KEY);
    const hours = totals.hours = Array.isArray(totals.hours) ? totals.hours : [];
    for (let h = 0; h < 24; h++) if (!Array.isArray(hours[h])) hours[h] = [0, 0];
    bump(hours[e.hour], 0, sign); bump(hours[e.hour], 1, sign * e.fail);
    const cards = totals.cards = isObj(totals.cards) ? totals.cards : {};
    const age = cards[e.age] = Array.isArray(cards[e.age]) ? cards[e.age] : [0, 0];
    bump(age, 0, sign); bump(age, 1, sign * e.fail);
    try {
      store.setItem(LOG_KEY, JSON.stringify(log));
      store.setItem(TOTALS_KEY, JSON.stringify(totals));
    } catch { /* storage full or blocked */ }
  }

  // ─── The statistics ──────────────────────────────────────────────────────────

  // Interval buckets for the histogram, in days (upper bound inclusive).
  const INTERVALS = [
    { label: '1 day', short: '1d', max: 1 }, { label: '2–3 days', short: '2–3d', max: 3 },
    { label: '4–7 days', short: '4–7d', max: 7 }, { label: '1–2 weeks', short: '1–2w', max: 14 },
    { label: '2–4 weeks', short: '2–4w', max: 30 }, { label: '1–3 months', short: '1–3m', max: 91 },
    { label: '3–6 months', short: '3–6m', max: 182 }, { label: '6 months +', short: '6m+', max: Infinity },
  ];
  const FORECAST_DAYS = 30;
  const CALENDAR_WEEKS = 26;

  function progressStats(data, now) {
    data = data || {};
    now = now == null ? Date.now() : now;
    const today = localDay(now);

    // Cards, from the SRS store.
    const kinds = KINDS.map(k => ({ id: k.id, label: k.label, studied: 0, learned: 0, due: 0 }));
    const ages = { learning: 0, young: 0, mature: 0 };
    const intervals = INTERVALS.map(b => ({ label: b.label, short: b.short, cards: 0 }));
    const forecast = Array.from({ length: FORECAST_DAYS }, (_, i) => ({ day: localDay(addDays(now, i)), cards: 0 }));
    let overdue = 0;
    let easeSum = 0;
    const srs = obj(data.tokidoki_srs);
    Object.keys(srs).forEach(id => {
      const c = srs[id];
      if (!isObj(c)) return;
      const i = KINDS.findIndex(k => k.test(id));
      if (i < 0) return;
      const k = kinds[i];
      const iv = n(c.interval);
      const due = n(c.nextReview);
      k.studied++;
      if (iv >= LEARNED_DAYS) k.learned++;
      ages[ageOf(c)]++;
      easeSum += n(c.easeFactor) || 2.5;
      if (iv > 0) intervals[INTERVALS.findIndex(b => iv <= b.max)].cards++;
      if (due <= now) { k.due++; overdue++; } else {
        const d = daysBetween(now, due);
        if (d < FORECAST_DAYS) forecast[d].cards++;
      }
    });
    const total = kinds.reduce((t, k) => ({
      studied: t.studied + k.studied, learned: t.learned + k.learned, due: t.due + k.due,
    }), { studied: 0, learned: 0, due: 0 });

    // Reviews, from the review log.
    const log = obj(data[LOG_KEY]);
    const perDay = {};
    const perDayKinds = {};
    let reviews = 0, fails = 0, seconds = 0;
    Object.keys(log).forEach(day => {
      const t = [0, 0, 0];
      const byKind = isObj(log[day]) ? log[day] : {};
      Object.values(byKind).forEach(v => {
        if (Array.isArray(v)) for (let j = 0; j < 3; j++) t[j] += n(v[j]);
      });
      if (!t[0]) return;
      perDay[day] = t;
      perDayKinds[day] = byKind;
      reviews += t[0]; fails += t[1]; seconds += t[2];
    });
    let logStreak = 0;
    for (let t = perDay[today] ? now : addDays(now, -1); perDay[localDay(t)]; t = addDays(t, -1)) logStreak++;

    // The older stats store (verb practice and the daily counts) still
    // counts for days before the review log existed.
    const s = obj(data.tokidoki_stats);
    const utcDay = t => new Date(t).toISOString().slice(0, 10);
    const last = s.lastStudyDate || '';
    const oldStreak = last === utcDay(now) || last === utcDay(now - DAY) ? n(s.streak) : 0;
    const oldToday = last === utcDay(now) ? n(s.todayReviews) : 0;
    const todayLog = perDay[today] || [0, 0, 0];

    // The calendar: CALENDAR_WEEKS columns of Monday–Sunday, ending this week.
    // Days with reviews also say how they went, and in which practice.
    const dayKinds = day => {
      const byKind = perDayKinds[day] || {};
      return Object.keys(byKind).map(id => {
        const v = Array.isArray(byKind[id]) ? byKind[id] : [];
        const k = KINDS.find(x => x.id === id);
        return { id, label: k ? k.label : 'Other', reviews: n(v[0]), passed: n(v[0]) - n(v[1]) };
      }).filter(k => k.reviews > 0).sort((a, b) => b.reviews - a.reviews);
    };
    const back = (new Date(now).getDay() + 6) % 7;  // days since Monday
    const first = addDays(now, -back - (CALENDAR_WEEKS - 1) * 7);
    const calendar = [];
    for (let i = 0; i < CALENDAR_WEEKS * 7; i++) {
      const t = addDays(first, i);
      const day = localDay(t);
      if (day > today) { calendar.push({ day, reviews: null }); continue; }
      const [r, f, secs] = perDay[day] || [0, 0, 0];
      calendar.push({ day, reviews: r, passed: r - f, seconds: secs, kinds: r ? dayKinds(day) : [] });
    }

    const totals = obj(data[TOTALS_KEY]);
    const pair = v => (Array.isArray(v) ? [n(v[0]), n(v[1])] : [0, 0]);
    const cardsTotals = isObj(totals.cards) ? totals.cards : {};
    const answers = ['learning', 'young', 'mature'].map(age => {
      const [r, f] = pair(cardsTotals[age]);
      return { age, reviews: r, passed: r - f };
    });
    const hours = Array.from({ length: 24 }, (_, h) => {
      const [r, f] = pair(Array.isArray(totals.hours) ? totals.hours[h] : null);
      return { hour: h, reviews: r, passed: r - f };
    });

    const mystery = obj(data.tokidoki_mystery);
    return {
      streak: Math.max(logStreak, oldStreak),
      reviewsToday: Math.max(todayLog[0], oldToday),
      secondsToday: todayLog[2],
      total,
      kinds: kinds.filter(k => k.studied > 0),
      ages,
      averageEase: total.studied ? easeSum / total.studied : 0,
      overdue,
      forecast,
      intervals,
      log: {
        reviews, passed: reviews - fails, seconds,
        days: Object.keys(perDay).length,
        since: Object.keys(perDay).sort()[0] || null,
      },
      calendar,
      answers,
      hours,
      decks: {
        words: count(obj(data.tokidoki_story_words)),
        kanji: count(obj(data.tokidoki_kanji_cards)),
        grammar: count(obj(data.tokidoki_saved_grammar)),
      },
      games: {
        listening: sets(obj(data.tokidoki_listening).best),
        wordOrder: sets(obj(data.tokidoki_word_order).best),
        storyFill: sets(obj(data.tokidoki_story_fill).best),
        mystery: Object.keys(mystery).filter(k => isObj(mystery[k]) && mystery[k].solved).length,
      },
    };
  }

  const api = { progressStats, record, unrecord, kindOf, localDay, KINDS, LEARNED_DAYS, LOG_KEY, TOTALS_KEY };
  global.ProgressStats = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
