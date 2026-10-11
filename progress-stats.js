// A summary of someone's progress, for the account dialog (sync.js): how
// many cards they've studied in each kind of practice, how many of those
// are well learned or due, how big their flashcard decks are, and how far
// they've got in the games.
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
  ];

  const parse = raw => { if (raw == null) return null; try { return JSON.parse(raw); } catch { return null; } };
  const isObj = v => v != null && typeof v === 'object' && !Array.isArray(v);
  const obj = raw => { const v = parse(raw); return isObj(v) ? v : {}; };
  const count = o => Object.keys(o).length;
  // The game stores' `best` also keep the "missed" and quick-mix rounds.
  const sets = best => Object.keys(isObj(best) ? best : {}).filter(k => k !== 'missed' && k !== 'quick').length;

  const isoDay = t => new Date(t).toISOString().slice(0, 10);

  function progressStats(data, now) {
    data = data || {};
    now = now == null ? Date.now() : now;

    const kinds = KINDS.map(k => ({ id: k.id, label: k.label, studied: 0, learned: 0, due: 0 }));
    const srs = obj(data.tokidoki_srs);
    Object.keys(srs).forEach(id => {
      const c = srs[id];
      if (!isObj(c)) return;
      const i = KINDS.findIndex(k => k.test(id));
      if (i < 0) return;
      const k = kinds[i];
      k.studied++;
      if ((Number(c.interval) || 0) >= LEARNED_DAYS) k.learned++;
      if ((Number(c.nextReview) || 0) <= now) k.due++;
    });
    const total = kinds.reduce((t, k) => ({
      studied: t.studied + k.studied, learned: t.learned + k.learned, due: t.due + k.due,
    }), { studied: 0, learned: 0, due: 0 });

    // The streak and today's count are only current if they studied today
    // (or, for the streak, yesterday). Dates are UTC days, as app.js keeps them.
    const s = obj(data.tokidoki_stats);
    const today = isoDay(now);
    const last = s.lastStudyDate || '';
    const streak = last === today || last === isoDay(now - DAY) ? Number(s.streak) || 0 : 0;
    const reviewsToday = last === today ? Number(s.todayReviews) || 0 : 0;

    const mystery = obj(data.tokidoki_mystery);
    return {
      streak,
      reviewsToday,
      total,
      kinds: kinds.filter(k => k.studied > 0),
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

  const api = { progressStats, KINDS, LEARNED_DAYS };
  global.ProgressStats = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
