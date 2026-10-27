// The order new words come in on the GTK - Easy Word Order page: a greedy path
// that makes as many words as possible guessable when they arrive. A port
// of GuessWithAnki's core/path.py (https://github.com/BlaiseLabs/GuessWithAnki,
// MIT), run in the browser each time the page plans, from what this learner
// has already studied.
//
// A word is a list of pieces, each a kanji with the reading it has there
// (電:でん). A word is guessable at its place when it's judged guessable
// (`g`, from guess-words-data.js) and every piece is in hand:
//   fresh   met in a word within the last `window` new words
//   mature  in a word whose card has a mature interval
// Each place takes, of the words left, the one that is guessable right now
// (1 + 1/d, d = how many words back its oldest fresh piece was met), plus
// `setup` for each guessable word it brings to one missing piece (a quarter
// for two missing), divided by the number of new pieces the word itself
// brings: openers come one new piece at a time, and a plain opener (itself
// guessable) counts more than an irregular one. Ties keep the list's own
// order. Only the next `ahead` places are planned; the rest keep the list's
// order after them.
//
// Items: { key, pieces: [...], g: guessable?, own: 0..1 how guessable the
// word itself is, mature: (studied words) a mature card }.
(function (global) {
  'use strict';

  const DEFAULTS = { window: 40, ahead: 300, setup: 0.1 };

  class State {
    // `started`: studied items, oldest first.
    constructor(started, opts) {
      this.W = opts.window;
      this.last = new Map();      // piece → place last met
      this.from = new Map();      // piece → key of the word it was last met in
      this.mature = new Set();
      started.forEach((it, i) => {
        this.place(it, i - started.length);
        if (it.mature) it.pieces.forEach(p => this.mature.add(p));
      });
    }

    known(p, pos) {
      return (this.last.has(p) && pos - this.last.get(p) <= this.W) || this.mature.has(p);
    }

    place(it, pos) {
      for (const p of new Set(it.pieces)) {
        this.last.set(p, pos);
        this.from.set(p, it.key);
      }
    }
  }

  // The score of placing `it` at pos: 0 unless it's guessable there.
  function value(it, pos, st) {
    if (!it.g || !it.pieces.length || !it.pieces.every(p => st.known(p, pos))) return 0;
    const fresh = it.pieces.filter(p => st.last.has(p) && pos - st.last.get(p) <= st.W).map(p => pos - st.last.get(p));
    return 1 + (fresh.length ? Math.min(...fresh.map(d => 1 / Math.max(1, d))) : 0);
  }

  // The new items in their planned order, each with `guess` (guessable when
  // it arrives) and `hints` ({ piece: key of the word it was met in }).
  function plan(started, fresh, options) {
    const opts = Object.assign({}, DEFAULTS, options);
    const st = new State(started, opts);
    const pool = fresh.slice();
    // Each word's distinct pieces, worked out once.
    const uniq = new Map(fresh.map(it => [it.key, [...new Set(it.pieces)]]));
    const left = new Set(fresh.filter(it => it.g).map(it => it.key));
    const out = [];
    const steps = Math.min(opts.ahead, pool.length);
    for (let pos = 0; pos < steps; pos++) {
      // What each missing piece would set up: words one piece short of guessable.
      const setsUp = new Map();
      const own = new Map();
      for (const k of left) {
        const miss = uniq.get(k).filter(p => !st.known(p, pos));
        if (miss.length === 1) {
          setsUp.set(miss[0], (setsUp.get(miss[0]) || 0) + 1);
          own.set(k, [miss[0], 1]);
        } else if (miss.length === 2) {
          miss.forEach(p => setsUp.set(p, (setsUp.get(p) || 0) + 0.25));
          own.set(k, [null, 0.5]);
        }
      }
      let best = 0, bestScore = 0, bestGuess = false;
      for (let i = 0; i < pool.length; i++) {
        const c = pool[i];
        if (!c.pieces.length) continue;
        const ps = uniq.get(c.key);
        let su = 0;
        let newPieces = 0;
        for (const p of ps) {
          su += setsUp.get(p) || 0;
          if (!st.known(p, pos)) newPieces++;
        }
        // Only a word with every piece in hand can be guessable now.
        const v = newPieces === 0 ? value(c, pos, st) : 0;
        let s = v;
        const o = own.get(c.key);
        if (o && (o[0] === null || ps.includes(o[0]))) su -= o[1];
        // An opener is a word to learn too: one new piece at a time, and better a plain one.
        s += opts.setup * su / Math.max(1, newPieces) * (0.5 + 0.5 * c.own);
        if (s > bestScore) { best = i; bestScore = s; bestGuess = v > 0; }
      }
      const pick = pool.splice(best, 1)[0];
      const hints = {};
      if (bestGuess) pick.pieces.forEach(p => { hints[p] = st.from.get(p); });
      st.place(pick, pos);
      left.delete(pick.key);
      out.push(Object.assign({}, pick, { guess: bestGuess, hints }));
    }
    return out.concat(pool.map(it => Object.assign({}, it, { guess: false, hints: {} })));
  }

  // How many of the first n items of `order` are guessable when they arrive
  // (the path's measure, for any order).
  function countGuessable(started, order, n, options) {
    const opts = Object.assign({}, DEFAULTS, options);
    const st = new State(started, opts);
    let got = 0;
    order.slice(0, n).forEach((it, pos) => {
      if (value(it, pos, st) > 0) got++;
      st.place(it, pos);
    });
    return got;
  }

  const api = { plan, countGuessable, DEFAULTS };
  global.GuessPath = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
