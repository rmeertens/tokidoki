// Splitting Japanese text into dictionary words, shared by the build scripts
// that make text tappable (tokenize_story_fill.mjs, tokenize_phrases.mjs).
//
// Words are found with the kuromoji morphological analyser and grouped the
// way the Stories page groups them: a verb or adjective keeps its endings
// (起きます, 運べなかった), particles stand alone. Each word is looked up, in
// order, in `extra`, the Stories glossary (stories-data.js +
// mystery-words.js) and the JLPT vocabulary list (vocabulary-data.js).
// Readings are kept whole: a word never splits a `漢字[よみ]` group.
//
// kuromoji isn't a site dependency; install it just for the build:
//   npm install --no-save kuromoji
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(process.cwd(), 'x.js'));

export const kata2hira = s => (s || '').replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const display = key => key.replace(/\(.*\)$/, '');

// Loads site data files into one sandbox and returns its window.
export function loadSiteData(files) {
  const box = { window: {} };
  vm.createContext(box);
  for (const f of files) vm.runInContext(readFileSync(path.join(ROOT, f), 'utf8'), box);
  return box.window;
}

// Markup → units: a `漢字[よみ]` group or one character, with its plain text.
export function units(markup) {
  const out = [];
  const re = /([㐀-䶿一-鿿々〆ヶ]+)\[([^\]]+)\]|([\s\S])/gu;
  let m;
  while ((m = re.exec(markup))) out.push(m[1] ? { text: m[1], src: m[0] } : { text: m[3], src: m[3] });
  return out;
}

const CONTENT = new Set(['名詞', '動詞', '形容詞', '副詞', '連体詞', '接続詞', '感動詞']);

// `extra`: words neither list has (or has with a different sense), as
// { word or "word(reading)": [reading, meaning, part of speech] }.
// `whole`: strings kuromoji splits oddly, kept as one noun.
export async function createWordFinder({ extra = {}, whole = [] } = {}) {
  const { STORY_GLOSSARY: GLOSSARY, VOCAB_DATA } = loadSiteData(['stories-data.js', 'mystery-words.js', 'vocabulary-data.js']);
  const kuromoji = require('kuromoji');

  const vocab = [];
  // The list spells some する-nouns' readings with する (出席 → しゅっせきする).
  for (const [level, list] of Object.entries(VOCAB_DATA)) list.forEach(w => vocab.push({ ...w, level,
    kana: !w.kanji.endsWith('する') && w.kana.endsWith('する') && w.kanji !== w.kana ? w.kana.slice(0, -2) : w.kana }));

  // The dictionary entry for a word: [key, [reading, meaning, pos]] or null.
  function lookup(base, reading, content = true) {
    const sense = `${base}(${reading})`;
    if (extra[sense]) return [sense, extra[sense]];
    if (extra[base]) return [base, extra[base]];
    if (GLOSSARY[base]) return [base, GLOSSARY[base]];
    const sensed = Object.keys(GLOSSARY).filter(k => display(k) === base);
    const match = sensed.find(k => GLOSSARY[k][0] === reading) || sensed[0];
    if (match) return [match, GLOSSARY[match]];
    const v = vocab.filter(w => w.kanji === base);
    const hit = v.find(w => w.kana === reading) || v[0] || vocab.find(w => w.kana === base && w.kanji === base);
    if (hit) return [base, [hit.kana, hit.meaning.replace(/^To /, 'to '), `JLPT ${hit.level.toUpperCase()} word`]];
    // A word written in kana: the entry with that reading.
    if (content && /^[ぁ-ゖー]+$/.test(base)) {
      const g = Object.keys(GLOSSARY).find(k => GLOSSARY[k][0] === base && !k.includes('('));
      if (g) return [g, GLOSSARY[g]];
      const v2 = vocab.find(w => w.kana === base);
      if (v2) return [v2.kanji, [v2.kana, v2.meaning.replace(/^To /, 'to '), `JLPT ${v2.level.toUpperCase()} word`]];
    }
    return null;
  }

  // Morphemes → words, Stories style.
  function group(morphs) {
    const words = [];
    let prefix = null;
    for (const m of morphs) {
      const prev = words[words.length - 1];
      const head = prev && prev.head;
      const pos = m.pos, d1 = m.pos_detail_1;
      const attach = prev && !prev.closed && (
        (pos === '助動詞' && head && ['動詞', '形容詞', '助動詞'].includes(prev.last.pos)) ||
        (pos === '助動詞' && prev.copula) ||
        (pos === '助詞' && d1 === '接続助詞' && ['て', 'で', 'ば'].includes(m.surface_form) && ['動詞', '形容詞', '助動詞'].includes(prev.last.pos)) ||
        (pos === '動詞' && d1 === '接尾' && head) ||
        (pos === '名詞' && d1 === '接尾' && head && head.pos === '名詞') ||
        (pos === '名詞' && d1 === '数' && prev.last.pos_detail_1 === '数')
      );
      if (attach) {
        prev.morphs.push(m);
        prev.last = m;
        if (m.pos === '助動詞' && !['動詞', '形容詞'].includes(head.pos)) prev.copula = true;
        if (pos === '名詞') prev.compound = true;
        continue;
      }
      if (pos === '接頭詞') { prefix = m; continue; }
      const w = { morphs: prefix ? [prefix, m] : [m], last: m, head: CONTENT.has(pos) || pos === '助動詞' ? m : null, prefix };
      if (pos === '助動詞') w.copula = true;
      if (pos === '記号') w.closed = true;
      prefix = null;
      words.push(w);
    }
    return words;
  }

  function keyFor(w) {
    const surface = w.morphs.map(m => m.surface_form).join('');
    const reading = kata2hira(w.morphs.map(m => m.reading || m.surface_form).join(''));
    if (w.last.pos === '記号') return null;
    const tries = [];
    const h = w.head || w.morphs[w.morphs.length - 1];
    const hi = w.morphs.indexOf(h);
    const pre = w.morphs.slice(0, hi).map(m => m.surface_form).join('');
    if (w.compound || w.prefix) tries.push([surface, reading]);
    // A number and its counter (一年, 五分) is looked up whole or not at all.
    if (w.compound && h.pos_detail_1 === '数') return lookup(surface, reading) || { miss: surface, surface };
    const basic = h.basic_form && h.basic_form !== '*' ? h.basic_form : h.surface_form;
    if (w.prefix) tries.push([pre + basic, null]);
    tries.push([basic, kata2hira(h.reading)]);
    if (h.surface_form !== basic) tries.push([h.surface_form, kata2hira(h.reading)]);
    // A lone で that kuromoji reads as the copula (一人では) is shown as the particle.
    if (surface === 'で' && h.pos === '助動詞') return lookup('で', 'で', false);
    const content = CONTENT.has(h.pos);
    for (const [b, r] of tries) { const hit = lookup(b, r, content); if (hit) return hit; }
    return { miss: basic, surface };
  }

  const tokenizer = await new Promise((res, rej) => kuromoji.builder({ dicPath: path.join(path.dirname(require.resolve('kuromoji')), '..', 'dict') })
    .build((e, t) => (e ? rej(e) : res(t))));

  function analyse(text) {
    if (!whole.length) return tokenizer.tokenize(text);
    const re = new RegExp(whole.join('|'), 'g');
    const out = [];
    let last = 0;
    for (const m of text.matchAll(re)) {
      if (m.index > last) out.push(...tokenizer.tokenize(text.slice(last, m.index)));
      out.push({ surface_form: m[0], pos: '名詞', pos_detail_1: '一般', basic_form: m[0], reading: m[0] });
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push(...tokenizer.tokenize(text.slice(last)));
    return out;
  }

  // Splits a piece of furigana markup into words. Returns
  //   pieces: [{ src, key }] covering the markup in order, where key is
  //           [glossKey, [reading, meaning, pos]], { miss, surface } when the
  //           word isn't in any list, or null for punctuation;
  //   morphs: kuromoji's morphemes for the plain text, each with `from`, its
  //           offset in `plain`;
  //   plain:  the text without furigana.
  function segment(markup) {
    const us = units(markup);
    const plain = us.map(u => u.text).join('');
    // Plain-text offset → unit index.
    const owner = [];
    us.forEach((u, i) => { for (const _ of u.text) owner.push(i); });
    const morphs = analyse(plain);
    let at = 0;
    morphs.forEach(m => { m.from = at; at += m.surface_form.length; });
    const words = group(morphs);
    let pos = 0;
    const spans = words.map(w => {
      const len = w.morphs.reduce((n, m) => n + m.surface_form.length, 0);
      const span = { from: pos, to: pos + len, key: keyFor(w), reading: kata2hira(w.morphs.map(m => m.reading || m.surface_form).join('')) };
      pos += len;
      return span;
    });
    // Merge words that would split a reading group.
    const merged = [];
    for (const s of spans) {
      const prev = merged[merged.length - 1];
      if (prev && owner[s.from] === owner[prev.to - 1]) {
        prev.to = s.to;
        prev.reading += s.reading;
        const whole = lookup(plain.slice(prev.from, prev.to), prev.reading);
        if (whole) prev.key = whole;
        else if (!prev.key || prev.key.miss) prev.key = s.key;
      } else merged.push({ ...s });
    }
    const pieces = merged.map(s => ({
      src: us.slice(owner[s.from], owner[s.to - 1] + 1).map(u => u.src).join(''),
      key: s.key,
      from: s.from,
      to: s.to,
    }));
    return { pieces, morphs, plain };
  }

  return { lookup, segment };
}
