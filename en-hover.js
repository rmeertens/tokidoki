// Hover hints on the English of a "translate into Japanese" prompt (Bunkei
// drill, Sentences page): hover or tap an English word to see a Japanese
// word for it. Words are looked up in the JLPT vocabulary list
// (vocabulary-data.js) after reducing them to a base form (breaking → break,
// scolded → scold, broke → break, toys → toy), plus any word pairs the page
// passes in. When the answer sentence is known, the Japanese word it
// actually uses wins — so "breaking" shows 壊す, not another word for break —
// and other matches are marked as only a dictionary suggestion. Grammar
// words (I, the, after, can…) get no hint: they map to the pattern, not a
// word.
//
//   EnHover.render(el, english, { ja, kana, words })
//     ja, kana   the answer sentence (plain text, and all in kana)
//     words      extra pairs [{ ja, kana, en, meaning }] for this sentence
//
// lookup() and baseForms() are pure and exported for test_en_hover.js.
(function (global) {
  'use strict';

  const STOP = new Set(('i me my mine myself you your yours he him his she her hers it its we us our they them their '
    + 'a an the this that these those there here to of in on at by for with from into onto about as and or but so '
    + 'is am are was were be been being do does did done have has had having will would can could should shall may might must '
    + 'not no nt t s d ll ve re m let lets please very too also just then than if when while after before because until since '
    + 'what who where why how which every each some any all one ones off up out over again more most much many').split(' '));

  const IRREGULAR = {
    broke: 'break', broken: 'break', got: 'get', gotten: 'get', went: 'go', gone: 'go', ate: 'eat', eaten: 'eat',
    saw: 'see', seen: 'see', came: 'come', took: 'take', taken: 'take', gave: 'give', given: 'give', made: 'make',
    bought: 'buy', brought: 'bring', thought: 'think', taught: 'teach', caught: 'catch', wrote: 'write',
    written: 'write', spoke: 'speak', spoken: 'speak', told: 'tell', said: 'say', found: 'find', left: 'leave',
    felt: 'feel', met: 'meet', sat: 'sit', stood: 'stand', ran: 'run', swam: 'swim', swum: 'swim', sang: 'sing',
    sung: 'sing', drank: 'drink', drunk: 'drink', drove: 'drive', driven: 'drive', rode: 'ride', ridden: 'ride',
    forgot: 'forget', forgotten: 'forget', began: 'begin', begun: 'begin', chose: 'choose', chosen: 'choose',
    fell: 'fall', fallen: 'fall', knew: 'know', known: 'know', slept: 'sleep', kept: 'keep', lost: 'lose',
    paid: 'pay', sent: 'send', spent: 'spend', built: 'build', understood: 'understand', woke: 'wake',
    woken: 'wake', wore: 'wear', worn: 'wear', threw: 'throw', thrown: 'throw', grew: 'grow', grown: 'grow',
    hung: 'hang', lent: 'lend', sold: 'sell', shot: 'shoot', fought: 'fight', bit: 'bite', hid: 'hide', led: 'lead', meant: 'mean', dug: 'dig', held: 'hold', stole: 'steal', stolen: 'steal', drew: 'draw', drawn: 'draw',
    flew: 'fly', flown: 'fly', heard: 'hear', became: 'become', put: 'put', cut: 'cut', hit: 'hit', shut: 'shut',
    children: 'child', men: 'man', women: 'woman', people: 'person', feet: 'foot', teeth: 'tooth', mice: 'mouse',
    better: 'good', best: 'good', worse: 'bad', worst: 'bad', mum: 'mother', mom: 'mother', dad: 'father',
  };

  // Verbs so loose in English that a dictionary guess would mislead: they
  // only get a hint when the answer sentence has the word.
  const NO_GUESS = new Set(['get', 'make', 'take', 'put', 'keep', 'turn', 'set', 'go', 'come', 'have', 'give', 'look', 'run', 'touch', 'once', 'way', 'thing', 'time', 'wish', 'try', 'seem', 'plan', 'hope', 'able', 'use', 'mind', 'like', 'sure', 'bit', 'little']);

  // Common phrases, as one hint each.
  const PHRASES = [
    ['get in touch', '連絡する', 'れんらくする', 'to get in touch, to contact'], ['get up', '起きる', 'おきる', 'to get up'],
    ['get on', '乗る', 'のる', 'to get on (a train…)'], ['get off', '降りる', 'おりる', 'to get off'],
    ['take off', '脱ぐ', 'ぬぐ', 'to take off (clothes)'], ['put on', '着る', 'きる', 'to put on (clothes)'],
    ['look for', '探す', 'さがす', 'to look for'], ['look after', '世話をする', 'せわをする', 'to look after'],
    ['take a bath', 'お風呂に入る', 'おふろにはいる', 'to take a bath'], ['take a picture', '写真を撮る', 'しゃしんをとる', 'to take a picture'],
    ['take a photo', '写真を撮る', 'しゃしんをとる', 'to take a photo'], ['go home', '帰る', 'かえる', 'to go home'],
    ['come back', '戻る', 'もどる', 'to come back'], ['turn on', 'つける', 'つける', 'to turn on'], ['turn off', '消す', 'けす', 'to turn off'],
    ['watch', '見る', 'みる', 'to watch'], ['listen', '聞く', 'きく', 'to listen'], ['phone', '電話', 'でんわ', 'phone, to phone'],
    ['right now', '今', 'いま', 'right now'], ['every day', '毎日', 'まいにち', 'every day'], ['tomorrow', '明日', 'あした', 'tomorrow'],
  ].map(([en, ja, kana, meaning]) => ({ en, entry: { ja, kana, meaning, level: 'n5' } }));

  // Names, languages and places the vocabulary list doesn't spell out.
  const NAMES = [
    ['Japanese', '日本語', 'にほんご', 'Japanese (language)'], ['Japanese', '日本人', 'にほんじん', 'a Japanese person'],
    ['Japan', '日本', 'にほん', 'Japan'], ['English', '英語', 'えいご', 'English (language)'],
    ['Chinese', '中国語', 'ちゅうごくご', 'Chinese (language)'], ['China', '中国', 'ちゅうごく', 'China'],
    ['Korean', '韓国語', 'かんこくご', 'Korean (language)'], ['Korea', '韓国', 'かんこく', 'Korea'],
    ['America', 'アメリカ', 'アメリカ', 'America'], ['American', 'アメリカ人', 'アメリカじん', 'an American'],
    ['Tokyo', '東京', 'とうきょう', 'Tokyo'], ['Kyoto', '京都', 'きょうと', 'Kyoto'], ['Osaka', '大阪', 'おおさか', 'Osaka'],
    ['France', 'フランス', 'フランス', 'France'], ['French', 'フランス語', 'フランスご', 'French (language)'],
    ['kanji', '漢字', 'かんじ', 'kanji'], ['hiragana', 'ひらがな', 'ひらがな', 'hiragana'], ['katakana', 'カタカナ', 'カタカナ', 'katakana'],
  ].map(([en, ja, kana, meaning]) => ({ en: en.toLowerCase(), entry: { ja, kana, meaning, level: 'n5' } }));

  // The forms a word could have come from: itself, an irregular base, and
  // what is left after taking off -s / -es / -ies, -ed / -d / -ied, -ing,
  // -er / -est and -ly (undoubling a final consonant, or putting back an e).
  function baseForms(word) {
    const w = word.toLowerCase();
    const out = [w];
    const add = x => { if (x && x.length > 1 && !out.includes(x)) out.push(x); };
    if (IRREGULAR[w]) add(IRREGULAR[w]);
    const undouble = x => (/([bcdfgklmnprstvz])\1$/.test(x) ? x.slice(0, -1) : null);
    for (const [end, repl] of [['ies', 'y'], ['ied', 'y'], ['ves', 'f'], ['es', ''], ['s', ''], ['ed', ''], ['ed', 'e'], ['d', ''],
      ['ing', ''], ['ing', 'e'], ['iest', 'y'], ['ier', 'y'], ['est', ''], ['er', ''], ['est', 'e'], ['er', 'e'], ['ly', ''], ['ily', 'y']]) {
      if (w.length > end.length + 1 && w.endsWith(end)) {
        const stem = w.slice(0, -end.length) + repl;
        add(stem);
        if (!repl) add(undouble(stem));
      }
    }
    return out;
  }

  // English word → vocabulary entries whose meaning uses it. A meaning like
  // "To break, to break down" gives the phrases "break" and "break down";
  // an entry scores higher when the word is a whole phrase on its own.
  let INDEX = null;
  function index() {
    if (INDEX) return INDEX;
    INDEX = new Map();
    const put = (key, entry, exact) => {
      if (!INDEX.has(key)) INDEX.set(key, []);
      const list = INDEX.get(key);
      const had = list.find(x => x.entry === entry);
      if (had) had.exact = had.exact || exact;
      else list.push({ entry, exact });
    };
    const data = global.VOCAB_DATA || {};
    Object.keys(data).forEach(level => (data[level] || []).forEach(e => {
      const entry = { ja: e.kanji, kana: e.kana, meaning: e.meaning, level };
      String(e.meaning).toLowerCase().replace(/\([^)]*\)/g, ' ').split(/[,;/]/).forEach(phrase => {
        const words = phrase.replace(/[^a-z' -]/g, ' ').trim().replace(/^(to|a|an|the)\s+/, '').split(/\s+/).filter(Boolean);
        if (!words.length) return;
        if (words.length === 1) put(words[0], entry, true);
        else {
          if (words.length <= 3) put(words.join(' '), entry, true); // "every day" → 毎日
          words.filter(x => !STOP.has(x)).forEach(x => put(x, entry, false));
        }
      });
    }));
    NAMES.forEach(({ en, entry }) => put(en, entry, true));
    PHRASES.forEach(({ en, entry }) => put(en, entry, true));
    return INDEX;
  }

  // The kana a verb or adjective's last kana turns into when it conjugates.
  const ROWS = {
    う: 'わいうえおっ', く: 'かきくけこい', ぐ: 'がぎぐげごい', す: 'さしすせそ', つ: 'たちつてとっ',
    ぬ: 'なにぬねのん', ぶ: 'ばびぶべぼん', む: 'まみむめもん', る: 'らりるれろっ', い: 'いかくけ',
  };

  // Does the answer sentence use this Japanese word? Kanji words count when
  // their kanji part is there (壊す in 壊して, 叱る in 叱られました); kana words
  // when the kana is (おもちゃ), or their reading appears in the sentence's kana.
  function usedIn(entry, ja, kana) {
    if (!ja && !kana) return false;
    const word = entry.ja || '';
    if (word && ja && ja.includes(word)) return true;
    const head = word.match(/^[㐀-䶿一-鿿々〆ヶ]+/);
    if (head && ja) {
      // A kanji word with okurigana, as a conjugated verb or adjective: the
      // kanji plus its okurigana up to the last kana (壊れる → 壊れ, 食べる →
      // 食べ), or for one kana the kanji plus any form of it (叱る → 叱ら…,
      // 壊す → 壊し…), so 壊れる doesn't match 壊して.
      const oku = word.slice(head[0].length);
      if (!/^[ぁ-ゖ]+$/.test(oku)) return false; // a compound (飲み物): only whole
      if (oku.length >= 2 && ja.includes(head[0] + oku.slice(0, -1))) return true;
      if (oku.length === 1) {
        const row = ROWS[oku] || oku;
        for (let i = 0; i < ja.length; i++) {
          if (ja.startsWith(head[0], i) && row.includes(ja[i + head[0].length] || '')) return true;
        }
      }
    }
    const reading = entry.kana || '';
    if (reading.length >= 2 && kana) {
      const stem = /[うくぐすつぬぶむる]$/.test(reading) && reading.length > 2 ? reading.slice(0, -1) : reading;
      if (!/[㐀-䶿一-鿿]/.test(word) && kana.includes(stem)) return true;
    }
    return false;
  }

  // Japanese words for one English word: { found: [...] } in the sentence,
  // or { suggested: [...] } from the dictionary.
  const PARTICIPLE = new Set(Object.keys(IRREGULAR).filter(w => /en$|[^e]t$|ne$|wn$|ung$|uck$/.test(w)));
  function lookup(word, sentence = {}, next = '') {
    const clean = String(word).toLowerCase().replace(/[^a-z' ]/g, '').replace(/n't$/, '').replace(/'(s|m|re|ve|ll|d)$/, '');
    if (!clean) return null;
    // The sentence's own pairs come first, even for words that are usually
    // grammar ("her" → 彼女, "here" → ここ, "have" a pet → 飼う).
    const own = (sentence.words || []).filter(w => String(w.en).toLowerCase().split(/[\s/]+/).some(x => baseForms(clean).includes(x)));
    if (own.length && !(/^(get|got|make|made|let)$/.test(clean) && /^(to|me|him|her|them|us)$|ed$/i.test(next))) {
      return { found: own.map(w => ({ ja: w.ja, kana: w.kana, meaning: w.meaning || w.en })).slice(0, 2) };
    }
    if (STOP.has(clean)) return null;
    if (clean === 'right' && /^now$/i.test(next)) return null; // "right now" is just now
    if (/^(make|made|makes|making|let|lets)$/.test(clean) && /^(to|me|him|her|them|us)$/i.test(next)) return null; // causative
    // "got scolded", "get lost": get as a passive or a change, not a word.
    const n = String(next).toLowerCase();
    if (/^(get|gets|got|gotten|getting)$/.test(clean) && (/ed$/.test(n) || PARTICIPLE.has(n) || /^(lost|married|up|better|worse|tired|angry|sick|hurt)$/.test(n))) return null;
    const forms = clean.includes(' ') ? [clean] : baseForms(clean).filter(f => !STOP.has(f));
    const ja = sentence.ja || '';
    const kana = sentence.kana || '';
    const hits = [];
    forms.forEach((form, k) => (index().get(form) || []).forEach(({ entry, exact }) => {
      if (hits.some(h => h.entry.ja === entry.ja && h.entry.kana === entry.kana)) return;
      const inSentence = usedIn(entry, ja, kana);
      const score = (inSentence ? 100 : 0) + (exact ? 20 : 0) - k * 2 + ({ n5: 6, n4: 4, n3: 2 }[String(entry.level).toLowerCase()] || 0) + (entry.ja.length > 1 ? 1 : 0);
      hits.push({ entry, score, inSentence });
    }));
    if (!hits.length) return null;
    if (!hits.some(h => h.inSentence) && forms.some(f => NO_GUESS.has(f))) return null;
    hits.sort((a, b) => b.score - a.score);
    const found = hits.filter(h => h.inSentence);
    const pick = list => list.map(h => h.entry).filter((e, i, all) => all.findIndex(x => x.ja === e.ja) === i).slice(0, 2);
    return found.length ? { found: pick(found) } : { suggested: pick(hits) };
  }

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ─── The page part ─────────────────────────────────────────────────────────

  let tip = null;
  let shownFor = null;

  function tipEl() {
    if (tip) return tip;
    tip = document.createElement('div');
    tip.className = 'en-hover-tip hidden';
    tip.setAttribute('role', 'tooltip');
    document.body.appendChild(tip);
    document.addEventListener('click', e => { if (!e.target.closest('.en-word') && !e.target.closest('.en-hover-tip')) hide(); });
    // Follow the word when the page scrolls or resizes.
    const follow = () => { if (shownFor) { if (shownFor.isConnected) show(shownFor); else hide(); } };
    window.addEventListener('scroll', follow, { passive: true });
    window.addEventListener('resize', follow);
    return tip;
  }

  function show(span) {
    const res = span._enHover;
    if (!res) return;
    const t = tipEl();
    const list = res.found || res.suggested;
    t.innerHTML = list.map(e => `<div class="en-hover-row">
        <span class="en-hover-ja" lang="ja">${esc(e.ja)}</span>${e.kana && e.kana !== e.ja ? `<span class="en-hover-kana" lang="ja">${esc(e.kana)}</span>` : ''}
        <span class="en-hover-en">${esc(e.meaning || '')}</span></div>`).join('')
      + (res.found ? '' : '<div class="en-hover-note">Dictionary word — the answer may say it differently</div>');
    t.classList.remove('hidden');
    const r = span.getBoundingClientRect();
    const w = t.offsetWidth;
    const left = Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2));
    const above = r.top - t.offsetHeight - 8;
    t.style.left = `${left + window.scrollX}px`;
    t.style.top = `${(above > 8 ? above : r.bottom + 8) + window.scrollY}px`;
    shownFor = span;
    span.classList.add('en-word-on');
  }

  function hide() {
    if (!tip) return;
    tip.classList.add('hidden');
    if (shownFor) shownFor.classList.remove('en-word-on');
    shownFor = null;
  }

  // Replaces el's text with the English, each word that has a hint wrapped
  // in a focusable span.
  function render(el, english, sentence = {}) {
    if (!el) return;
    hide();
    el.textContent = '';
    // Notes in brackets — "(honorific)", "(polite)" — are left as they are.
    String(english).split(/(\([^)]*\))/).forEach(chunk => {
      if (/^\(/.test(chunk)) { el.appendChild(document.createTextNode(chunk)); return; }
      const parts = chunk.split(/(\b[A-Za-z][A-Za-z']*\b)/);
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!/^[A-Za-z]/.test(part)) { el.appendChild(document.createTextNode(part)); continue; }
        // Two or three words that are one entry ("every day" → 毎日, "get in
        // touch" → 連絡する) get one hint.
        let phrase = null, used = 0;
        for (const n of [3, 2]) {
          const ws = [];
          for (let k = 0; k < n; k++) {
            const w = parts[i + 2 * k];
            if (!w || !/^[A-Za-z]/.test(w) || (k && parts[i + 2 * k - 1] !== ' ')) break;
            ws.push(w);
          }
          if (ws.length !== n || !index().has(ws.join(' ').toLowerCase())) continue;
          const r = lookup(ws.join(' ').toLowerCase(), sentence);
          if (r && (r.found || n === 3 || /^(get|take|put|look|turn|go|come)$/i.test(ws[0]))) { phrase = r; used = n; break; }
        }
        const res = phrase || lookup(part, sentence, parts[i + 2] || '');
        if (!res) { el.appendChild(document.createTextNode(part)); continue; }
        const span = document.createElement('span');
        span.className = 'en-word' + (res.found ? '' : ' en-word-dict');
        span.textContent = phrase ? parts.slice(i, i + 2 * used - 1).join('') : part;
        if (phrase) i += 2 * (used - 1);
        span.tabIndex = 0;
        span._enHover = res;
        // A mouse shows on hover; a finger shows on tap and hides on a tap
        // elsewhere (touch also fires mouse events, so those are ignored).
        span.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') show(span); });
        span.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hide(); });
        span.addEventListener('focus', () => show(span));
        span.addEventListener('blur', hide);
        span.addEventListener('click', e => { e.stopPropagation(); show(span); });
        el.appendChild(span);
      }
    });
  }

  // Kana of furigana HTML (<ruby>漢字<rt>かんじ</rt></ruby>…), for pages
  // whose sentences come as ruby HTML.
  function kanaOfRuby(html) {
    return String(html).replace(/<rp>[^<]*<\/rp>/g, '').replace(/<ruby>[^<]*<rt>([^<]*)<\/rt><\/ruby>/g, '$1').replace(/<[^>]+>/g, '');
  }

  const api = { render, lookup, baseForms, kanaOfRuby, hide };
  global.EnHover = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
