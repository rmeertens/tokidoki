// How often, and when last, each word was tapped to see its meaning.
//
// Stories, Memes & Jokes, News, the Mystery and Story Fill-in call
// `WordLookups.record(key)` when a word is tapped, with the same key the word
// is saved to the flashcards under (tokidoki_story_words). Kept in
// tokidoki_lookups as { [key]: [times, last tap (ms)] }, for words saved or
// not, so a word looked up before it was saved still counts. The Flashcards
// page shows the counts and can review in order of the most recent or the
// most frequent lookups. sync-merge.js adds up taps made on two devices.
(function (global) {
  'use strict';

  const KEY = 'tokidoki_lookups';
  // Past this many words, the ones looked up longest ago are dropped.
  const MAX = 3000;

  function load() {
    try {
      const v = JSON.parse(global.localStorage.getItem(KEY));
      return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
    } catch { return {}; }
  }

  function record(key, now = Date.now()) {
    if (!key) return;
    const all = load();
    const [times] = all[key] || [0];
    all[key] = [times + 1, now];
    const keys = Object.keys(all);
    if (keys.length > MAX) {
      keys.sort((a, b) => all[a][1] - all[b][1]).slice(0, keys.length - MAX).forEach(k => { delete all[k]; });
    }
    try { global.localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* storage full or off */ }
  }

  // { times, last } for a word (0 / 0 if never looked up).
  function get(key, all = load()) {
    const e = all[key];
    return e ? { times: e[0] || 0, last: e[1] || 0 } : { times: 0, last: 0 };
  }

  // Cards ({ key, meta: { added } }) in review order: 'recent' (last looked
  // up first) or 'often' (most lookups first, then the most recent). Words
  // never looked up come last, newest saved first.
  function sortCards(cards, order, all = load()) {
    const at = c => get(c.key, all);
    const byAdded = (a, b) => ((b.meta && b.meta.added) || 0) - ((a.meta && a.meta.added) || 0);
    return cards.slice().sort((a, b) => {
      const la = at(a), lb = at(b);
      if (order === 'often' && la.times !== lb.times) return lb.times - la.times;
      return (lb.last - la.last) || byAdded(a, b);
    });
  }

  // "3× · 2 days ago", or '' if never looked up.
  function describe(key, now = Date.now(), all = load()) {
    const { times, last } = get(key, all);
    if (!times) return '';
    const mins = Math.max(0, Math.round((now - last) / 60000));
    const ago = mins < 1 ? 'just now'
      : mins < 60 ? `${mins} min ago`
        : mins < 1440 ? `${Math.round(mins / 60)} h ago`
          : Math.round(mins / 1440) === 1 ? 'yesterday' : `${Math.round(mins / 1440)} days ago`;
    return `${times}× · ${ago}`;
  }

  const api = { KEY, record, load, get, sortCards, describe };
  global.WordLookups = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
