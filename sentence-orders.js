// Other ways to say a Sentences-page sentence that a typed English → Japanese
// answer should count as right. Japanese word order is free before the verb,
// so 日曜日に友達と写真を撮りました can as well be 友達と日曜日に写真を撮りました;
// and a sentence about "I" reads just as well with or without 私は.
//
// The sentence comes split into words by sentences-words.js. It's cut into
// phrases, each ending in a case particle (は が を に で へ から まで より も,
// と as "with") or a time word on its own (毎日, 昨日); the last phrase is
// the predicate and stays last. The phrases just before it that hold only
// nouns (no verb or adjective, so no clause of their own) can go in any
// order; anything before a phrase with a verb, adjective or clause comma
// stays where it is, since moving it could pull it out of its clause
// (友達が作った料理を食べた).

(function (global) {
  'use strict';

  const CASE = new Set(['は', 'が', 'を', 'に', 'で', 'へ', 'から', 'まで', 'より', 'も']);
  // Time words that stand on their own before the verb (no particle).
  const TIME = new Set(['毎日', '毎朝', '毎晩', '毎週', '毎月', '毎年', '今日', '明日', '昨日',
    '今朝', '今晩', '今夜', '今週', '来週', '先週', '今月', '来月', '先月', '今年', '来年', '去年',
    '週末', '今', 'いつ', 'いつも', 'ときどき', '時々', 'たいてい', '大抵', 'たぶん']);
  // At most this many phrases are shuffled (6! orders).
  const MAX_PHRASES = 6;

  const plain = src => src.replace(/\[[^\]]*\]/g, '');

  function token(piece, gloss) {
    if (!Array.isArray(piece)) return { src: piece, text: piece, key: null, pos: 'punct' };
    const [src, key] = piece;
    const g = gloss[key];
    return { src, text: plain(src), key, pos: g ? g[2] : '', meaning: g ? g[1] : '' };
  }

  const textOf = ph => ph.map(t => t.text).join('');

  // A word that can sit in a movable phrase: nouns and their like.
  function nounish(t) {
    if (t.pos === 'particle') return true;
    if (/noun|name|number|counter|question word|adverb/.test(t.pos)) return true;
    // Words filed by JLPT level: a noun when it isn't conjugated and doesn't mean "to …".
    if (/^JLPT/.test(t.pos)) return t.text === t.key && !/^(\(.*?\) )?to /i.test(t.meaning) && !/[いし]$/.test(t.text);
    return false;
  }

  // The sentence's words cut into phrases, the predicate last.
  function phrases(line, gloss, toWith) {
    const toks = line.w.map(p => token(p, gloss));
    const out = [];
    let cur = [];
    const isParticle = t => t && t.pos === 'particle';
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i];
      cur.push(t);
      const next = toks[i + 1];
      if (t.text === '、' && cur.length > 1) { out.push(cur); cur = []; continue; }
      if (next && next.text === '、') continue;
      // A time word on its own (not 今日の…, not 毎日は…).
      if (cur.length === 1 && TIME.has(t.key) && next && !isParticle(next) && next.pos !== 'punct') {
        out.push(cur); cur = []; continue;
      }
      if (!isParticle(t) || isParticle(next)) continue;
      // The run of particles just ended at t.
      let s = cur.length - 1;
      while (s > 0 && isParticle(cur[s - 1])) s--;
      const run = cur.slice(s).map(x => x.text).join('');
      let cut = CASE.has(t.text) || run === 'から' || run === 'まで' || run === 'より';
      // と only as "with" (友達と), not "and" (肉と魚) or a quote; not と一緒に.
      if (run.slice(-1) === 'と') {
        const upTo = textOf(cur);
        cut = toWith.some(snip => upTo.endsWith(snip)) && !(next && next.key === '一緒');
      }
      // では / じゃ / でも before ありません belongs to the predicate.
      if (/^(で|では|じゃ|でも)$/.test(run) && next && /^(ある|ない|ござる)$/.test(next.key)) cut = false;
      if (cut && next && next.pos !== 'punct') { out.push(cur); cur = []; }
    }
    if (cur.length) out.push(cur);
    return out;
  }

  const FINAL = new Set(['か', 'ね', 'よ', 'な', 'わ']);

  // Whether the predicate is one verb, adjective or noun + です, with nothing
  // after it but endings — not 晴れると思います or 母が作ったケーキです, whose
  // inner clause the phrases before it may belong to.
  function simplePredicate(ph) {
    const words = ph.filter(t => t.pos !== 'punct');
    if (!words.length || /copula|auxiliary/.test(words[0].pos) || words[0].pos === 'particle') return false;
    let i = 0;
    while (i < words.length && nounish(words[i]) && words[i].pos !== 'particle') i++;
    let ended = false;
    for (; i < words.length; i++) {
      const t = words[i];
      if (t.pos === 'particle' && FINAL.has(t.text)) { ended = true; continue; }
      // A particle, noun, 〜かどうか / 〜という or anything after a か/ね:
      // a second clause.
      if (ended || t.pos === 'particle' || nounish(t) || t.pos === 'expression' && i < words.length - 1) return false;
    }
    return true;
  }

  // Whether a phrase can change places: nouns only, a comma only after a
  // time word or a topic (昨日、 / 私は、).
  function movable(ph, after) {
    const words = ph.filter(t => t.pos !== 'punct');
    if (!words.length || !words.every(nounish)) return false;
    if (ph.some(t => t.pos === 'punct' && t.text !== '、')) return false;
    const text = textOf(words);
    // Set phrases: 気をつける.
    if (text === '気を') return false;
    // 医者になる, お帰りになる, 静かにする: the に goes with the verb.
    if (/に$/.test(text) && after && /^(なる|する)$/.test(after.key)) return false;
    if (ph.some(t => t.text === '、')) return words.length === 1 && TIME.has(words[0].key) || /は$/.test(text);
    return true;
  }

  const ending = ph => textOf(ph.filter(t => t.pos !== 'punct')).replace(/、$/, '');
  const isTime = ph => ph.length && TIME.has(ph[0].key) && ph.filter(t => t.pos !== 'punct').length === 1;

  const EXIST = new Set(['ある', 'いる', 'ござる', 'おる', 'いらっしゃる']);

  // Orders that still read as natural Japanese: two phrases with the same
  // particle (家に泥棒に入られた, 田中さんが一番背が高い) keep their order,
  // and the topic (〜は) comes first or after one time phrase (日曜日に私は…)
  // — or a place in a sentence of where something is (教室に先生はいない).
  function natural(order, ctx) {
    for (let i = 0; i < order.length; i++) {
      const e = ending(order[i]);
      for (let j = i + 1; j < order.length; j++) {
        if (/[にがを]$/.test(e) && ending(order[j]).slice(-1) === e.slice(-1) && ctx.index.get(order[j]) < ctx.index.get(order[i])) return false;
      }
      if (/は$/.test(e) && i > 1) return false;
      if (/は$/.test(e) && i === 1) {
        const first = order[0];
        const time = isTime(first) || ctx.timePhrases.some(snip => ending(first) === snip);
        const place = ctx.exist && /(に|で)$/.test(ending(first));
        if (!time && !place) return false;
      }
    }
    return true;
  }

  function permutations(list) {
    if (list.length <= 1) return [list];
    const out = [];
    list.forEach((x, i) => {
      permutations(list.slice(0, i).concat(list.slice(i + 1))).forEach(p => out.push([x].concat(p)));
    });
    return out;
  }

  // Each word's own furigana HTML, cut from the sentence's.
  function attachHtml(toks, jaHtml) {
    const units = [];
    const re = /<ruby>(.*?)<rp>\(<\/rp><rt>.*?<\/rt><rp>\)<\/rp><\/ruby>|[\s\S]/g;
    let m;
    while ((m = re.exec(jaHtml || ''))) units.push({ html: m[0], text: m[1] !== undefined ? m[1] : m[0] });
    let u = 0;
    for (const t of toks) {
      let html = '', text = '';
      while (text.length < t.text.length && u < units.length) { html += units[u].html; text += units[u].text; u++; }
      if (text !== t.text) return false;
      t.html = html;
    }
    return u === units.length;
  }

  const WATASHI = [
    { src: '私[わたし]', text: '私', key: '私', pos: 'pronoun', html: '<ruby>私<rp>(</rp><rt>わたし</rt><rp>)</rp></ruby>' },
    { src: 'は', text: 'は', key: 'は', pos: 'particle', html: 'は' },
  ];
  const isWatashiWa = ph => /^(私|わたし)は、?$/.test(textOf(ph));

  // Every accepted way to write a sentence, as { ja, jaHtml }; the first is
  // the sentence as written. `line` is its entry in SENTENCE_WORDS.lines,
  // `en` its English (an "I" sentence takes 私は or leaves it out).
  function variants(sentence, line, gloss) {
    const own = { ja: sentence.ja, jaHtml: sentence.jaHtml || sentence.ja };
    if (!line || !gloss) return [own];
    const toWith = line.g.filter(([id]) => id === 'to-with').map(([, snip]) => snip);
    const ph = phrases(line, gloss, toWith);
    if (!attachHtml([].concat(...ph), own.jaHtml)) return [own];
    const pred = ph[ph.length - 1];
    let start = ph.length - 1;
    if (simplePredicate(pred)) {
      while (start > 0 && movable(ph[start - 1], ph[start][0])) start--;
    }
    const fixed = ph.slice(0, start);
    const free = ph.slice(start, ph.length - 1);
    const ctx = {
      index: new Map(free.map((p, i) => [p, i])),
      timePhrases: line.g.filter(([id]) => id === 'ni-time').map(([, snip]) => snip),
      exist: pred.some(t => EXIST.has(t.key)),
    };
    let orders = free.length <= MAX_PHRASES ? permutations(free).filter(o => natural(o, ctx)) : [];
    orders = [free].concat(orders);
    let sentences = orders.map(o => fixed.concat(o, [pred]));

    // With or without 私は when the English is about "I".
    if (/^I\b/.test(sentence.en || '')) {
      const extra = [];
      const mine = ph.some(p => /^(私|わたし|僕|ぼく)/.test(textOf(p)));
      sentences.forEach(list => {
        if (isWatashiWa(list[0])) extra.push(list.slice(1));
        else if (!mine) extra.push([WATASHI].concat(list));
      });
      sentences = sentences.concat(extra);
    }

    const seen = new Set();
    const out = [];
    sentences.forEach(list => {
      const toks = [].concat(...list);
      const ja = toks.map(t => t.text).join('');
      if (seen.has(ja) || !ja.replace(/[。、？！?!]/g, '')) return;
      seen.add(ja);
      out.push({ ja, jaHtml: toks.map(t => t.html).join('') });
    });
    return out;
  }

  const api = { variants, phrases };
  global.SentenceOrders = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
