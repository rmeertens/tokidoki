// Finding the grammar a sentence uses, shared by the build scripts that make
// sentences explainable (tokenize_phrases.mjs, tokenize_news.mjs).
//
// detectGrammar(morphs, plain, GRAMMAR) takes kuromoji's morphemes (with
// `from` offsets, as jp_words.mjs segment() returns them) and the plain text,
// and returns [grammar id, snippet] pairs. GRAMMAR is the Stories grammar
// notes (STORY_GRAMMAR) plus GRAMMAR_EXTRA below.

// Grammar the Stories notes don't cover, in the same shape.
export const GRAMMAR_EXTRA = {
  'ni-particle': { level: 'N5', title: 'に — "to / at / on"', pattern: 'Noun + に', note: 'Marks where something goes or ends up, the person you do something to, or a point in time: 駅に着く "arrive at the station", 友達に送る "send to a friend", 七時に "at seven".' },
  'de-particle': { level: 'N5', title: 'で — "at / by / with"', pattern: 'Noun + で', note: 'Marks where an action happens (駅で待つ "wait at the station"), or the means or condition (LINEで "by LINE", 六時でいい "six o\'clock is fine").' },
  'ta-plain': { level: 'N5', title: '〜た — plain past', pattern: 'Verb / adjective + た', note: 'The casual past: 食べた "ate", 行った "went", 楽しかった "was fun". The polite version is 〜ました / 〜かったです.' },
  'nai-plain': { level: 'N5', title: '〜ない — plain negative', pattern: 'Verb ない-form', note: 'The casual "don\'t / doesn\'t": 行かない "won\'t go", 出られない "can\'t get out". Polite: 〜ません.' },
  'zu-classical': { level: 'N3', title: '〜ず / 〜ぬ — classical negative', pattern: 'Verb ない-stem + ず / ぬ', note: 'Old written Japanese for 〜ない, still heard in proverbs and famous quotes: 鳴かぬ = 鳴かない "doesn\'t sing", 造らず = 造らないで "without creating".' },
  'da-plain': { level: 'N5', title: 'だ / である — plain "is"', pattern: 'Noun / な-adj + だ', note: 'The casual (だ) or written (である) form of です. 猫である "is a cat" sounds bookish; 爆発だ "is an explosion" is everyday plain speech.' },
  'masu-you-ni': { level: 'N4', title: '〜ますように — "may…"', pattern: 'Verb ます-form + ように', note: 'A wish or prayer: 上手になりますように "may I get better". Written on Tanabata strips and shrine plaques.' },
  'command': { level: 'N3', title: 'Imperative — orders', pattern: 'う-verb: 〜え / る-verb: 〜ろ', note: 'A blunt command: 生きろ "live!", 見ろ "look!", 抱け "embrace!". Used in anime, sports and slogans — rude in daily life.' },
  'te-ru': { level: 'N4', title: '〜てる — casual 〜ている', pattern: 'Verb て-form + る', note: 'Spoken Japanese drops the い of 〜ている: 待ってる "I\'m waiting", 似合ってる "it suits you". Past: 〜てた.' },
  'chau': { level: 'N4', title: '〜ちゃう — casual 〜てしまう', pattern: 'Verb て-form → 〜ちゃう / 〜じゃう', note: 'The spoken form of 〜てしまう: did it completely, or did it by accident. 夏バテしちゃった "the heat got to me".' },
  'na-ending': { level: 'N4', title: 'な — soft ending', pattern: 'Sentence + な', note: 'A sentence-final な talks half to yourself: いいな "that\'s nice", 古いな "that\'s old". With a verb (〜てな) in Kansai it\'s a friendly "OK?".' },
};

// ─── Grammar rules ───────────────────────────────────────────────────────────
//
// Each rule looks at kuromoji's morphemes and adds [grammar id, snippet], the
// snippet being the stretch of the sentence the point covers (shown and
// highlighted on the page). One entry per id per sentence.

const isVerb = m => m && m.pos === '動詞';
const isAdj = m => m && m.pos === '形容詞';
const isPunct = m => !m || m.pos === '記号' || /^[。、！？…〜!?「」（）　\s]+$/.test(m.surface_form);
const GO = new Set(['行く', '来る', '帰る', '着く', '入る', '乗る', '戻る', '出る']);
const TIME_SUFFIX = /(時|分|日|月|年|曜日|週|朝|夜|昼|後|前|ごろ|半)$/;

export function detectGrammar(morphs, plain, GRAMMAR) {
  const found = [];
  const seen = new Set();
  const add = (id, from, to) => {
    if (!GRAMMAR[id]) throw new Error(`unknown grammar id ${id}`);
    if (seen.has(id)) return;
    const snippet = plain.slice(Math.max(0, from), to).replace(/^[、。！？…\s　]+|[、。！？…\s　]+$/g, '');
    if (!snippet) return;
    seen.add(id);
    found.push([id, snippet]);
  };
  const M = morphs;
  const end = i => M[i].from + M[i].surface_form.length;
  const s = i => (M[i] ? M[i].surface_form : '');
  const b = i => (M[i] ? M[i].basic_form : '');
  // Start of the word before morph i (for particles: "ケンは").
  const wordStart = i => {
    let j = i - 1;
    if (j < 0) return M[i].from;
    while (j > 0 && ['助動詞'].includes(M[j].pos)) j--;
    while (j > 0 && M[j].pos === '名詞' && M[j - 1].pos === '名詞') j--;
    return M[j].from;
  };
  // The verb or adjective a chain of endings hangs off.
  const headStart = i => {
    let j = i - 1;
    const ending = k => M[k].pos === '助動詞' || (M[k].pos === '動詞' && ['接尾', '非自立'].includes(M[k].pos_detail_1)) ||
      (M[k].pos === '助詞' && M[k].pos_detail_1 === '接続助詞' && ['て', 'で'].includes(M[k].surface_form) && M[k + 1] && M[k + 1].pos_detail_1 === '非自立');
    while (j > 0 && ending(j)) j--;
    return M[j] ? M[j].from : M[i].from;
  };

  for (let i = 0; i < M.length; i++) {
    const m = M[i];
    const S = m.surface_form, B = m.basic_form, P = m.pos, D = m.pos_detail_1;
    const prev = M[i - 1], next = M[i + 1];

    // ── Polite endings ──
    if (B === 'ます' && P === '助動詞') {
      const h = headStart(i);
      if (S === 'ませ' && s(i + 1) === 'ん' && s(i + 2) === 'でし') add('masen-deshita', h, end(i + 3));
      else if (S === 'ませ' && s(i + 1) === 'ん' && s(i + 2) === 'か') add('masen-ka', h, end(i + 2));
      else if (S === 'ませ' && s(i + 1) === 'ん') add('masen', h, end(i + 1));
      else if (S === 'まし' && s(i + 1) === 'た') add('masu-past', h, end(i + 1));
      else if (S === 'ましょ' && s(i + 2) === 'か') add('mashou-ka', h, end(i + 2));
      else if (S === 'ましょ') add('mashou', h, end(i + 1));
      else if (S === 'ます' && s(i + 1) === 'よう' && s(i + 2) === 'に') add('masu-you-ni', h, end(i + 2));
      else add('masu', h, end(i));
      continue;
    }
    if (B === 'です' && P === '助動詞') {
      if (S === 'でし' && s(i + 1) === 'た') add('deshita', wordStart(i), end(i + 1));
      else if (S === 'でしょ') add('deshou', wordStart(i), end(i + 1 < M.length && s(i + 1) === 'う' ? i + 1 : i));
      else if (isAdj(prev)) add('i-adj-desu', prev.from, end(i));
      else if (prev && ['ん', 'の'].includes(prev.surface_form) && prev.pos_detail_1 === '非自立' && M[i - 2] && ['動詞', '形容詞', '助動詞'].includes(M[i - 2].pos)) add('n-desu', headStart(i - 1), end(s(i + 1) === 'か' ? i + 1 : i));
      else add('desu', wordStart(i), end(i));
      continue;
    }
    if (P === '助動詞' && (B === 'だ' || S === 'で' && s(i + 1) === 'ある' || S === 'で' && s(i + 1) === 'あっ')) {
      if (S === 'な' && next && next.pos === '名詞' && prev && prev.pos_detail_1 === '形容動詞語幹') add('na-adj-noun', prev.from, end(i + 1));
      else if (S === 'に' && prev && prev.pos_detail_1 === '形容動詞語幹') add('na-adverb', prev.from, end(i));
      else if (S === 'なら') add('nara', wordStart(i), end(i));
      else if (prev && ['ん', 'の'].includes(prev.surface_form) && prev.pos_detail_1 === '非自立' && S === 'だ') add('n-desu', headStart(i - 1), end(i));
      else if (S === 'だ' || S === 'だっ' || (S === 'で' && ['ある', 'あっ'].includes(s(i + 1)))) add('da-plain', wordStart(i), end(S === 'で' ? i + 1 : i));
      else if (S === 'で') add('de-particle', wordStart(i), end(i));
      continue;
    }

    // ── Verb endings ──
    if (P === '助動詞' && B === 'た' && !['まし', 'でし'].includes(s(i - 1))) {
      if (S === 'たら' || S === 'だら') add('tara', headStart(i), end(i));
      else if (isAdj(prev) && prev.conjugated_form === '連用タ接続') add('i-adj-past', prev.from, end(i));
      else if (prev && ['てる', 'て'].includes(prev.surface_form)) { /* てた: counted as てる */ }
      else add('ta-plain', headStart(i), end(i));
      continue;
    }
    if (isAdj(m) && B === 'ない' && m.conjugated_form === '連用テ接続' && next && next.basic_form === 'なる') { add('naku-naru', m.from, end(i + 1)); continue; }
    if (P === '助動詞' && B === 'ない') {
      if (next && next.basic_form === 'なる' && S === 'なく') { add('naku-naru', headStart(i), end(i + 1)); continue; }
      if (isAdj(prev) || (prev && prev.surface_form.endsWith('く') && prev.pos === '形容詞')) add('i-adj-neg', prev.from, end(i));
      else if (S === 'なけれ' && s(i + 1) === 'ば') add('nakereba-naranai', headStart(i), end(i + 3 < M.length ? i + 3 : i + 1));
      else if (s(i + 1) === 'で' && s(i + 2) === 'ください') add('naide-kudasai', headStart(i), end(i + 2));
      else if (isPunct(next) && next && /[？?]/.test(next.surface_form) && isVerb(prev)) add('nai-invitation', headStart(i), end(i + 1));
      else add('nai-plain', headStart(i), end(i));
      continue;
    }
    if (P === '助動詞' && (B === 'ぬ' || B === 'ず')) { add('zu-classical', headStart(i), end(i)); continue; }
    if (P === '助動詞' && B === 'たい') { add('tai', headStart(i), end(i)); continue; }
    if (P === '助動詞' && (B === 'う' || B === 'よう') && !['ましょ', 'でしょ', 'だろ'].includes(s(i - 1))) { add('volitional', headStart(i), end(i)); continue; }
    if (P === '助動詞' && ['らしい'].includes(B)) { add('rashii', wordStart(i), end(i)); continue; }
    if (P === '動詞' && D === '接尾' && ['れる', 'られる'].includes(B)) {
      // In a polite question about the listener (お仕事は何をされているんですか)
      // される is respect, not passive.
      const honorific = /^[おご]/.test(plain) && /か[？?]?$/.test(plain);
      add(honorific ? 'sonkeigo' : 'passive', headStart(i), end(i));
      continue;
    }
    if (P === '動詞' && D === '接尾' && ['せる', 'させる'].includes(B)) { add('causative', headStart(i), end(i)); continue; }
    if (P === '動詞' && ['すぎる', '過ぎる'].includes(B) && prev && ['動詞', '形容詞'].includes(prev.pos)) { add('sugiru', prev.from, end(i)); continue; }
    if (P === '動詞' && D === '非自立' && B === 'てる') { add('te-ru', headStart(i), end(i)); continue; }
    if (P === '動詞' && D === '非自立' && ['ちゃう', 'じゃう'].includes(B)) { add('chau', headStart(i), end(i)); continue; }
    if (isVerb(m) && m.conjugated_form === '命令ｅ' || isVerb(m) && m.conjugated_form === '命令ｒｏ' || isVerb(m) && m.conjugated_form === '命令ｙｏ') {
      if (B === 'くださる') add('te-kudasai', headStart(i), end(i));
      else if (B === 'なさる') add('nasai', headStart(i), end(i));
      else if (!(B === 'しまう' && s(i - 1) === 'て')) add('command', m.from, end(i));
      else add('te-shimau', headStart(i), end(i));
      continue;
    }
    if (P === '助詞' && D === '接続助詞' && ['て', 'で'].includes(S) && prev && ['動詞', '形容詞', '助動詞'].includes(prev.pos) && prev.basic_form !== 'ない') {
      const h = isAdj(prev) ? prev.from : headStart(i);
      const n = next ? next.basic_form : '';
      if (isAdj(prev)) add('kute', h, end(i));
      else if (n === 'いる') add('te-iru', h, end(i + 1));
      else if (n === 'くださる') add('te-kudasai', h, end(i + 1));
      else if (n === 'しまう') add('te-shimau', h, end(i + 1));
      else if (n === 'みる') add('te-miru', h, end(i + 1));
      else if (n === 'くれる') add(s(i + 2) === 'ませ' && s(i + 4) === 'か' ? 'te-kuremasen-ka' : 'te-kureru', h, end(i + 1));
      else if (n === 'あげる') add('te-ageru', h, end(i + 1));
      else if (['もらう', 'いただく', 'いただける', 'もらえる'].includes(n)) add('te-morau', h, end(i + 1));
      else if (n === 'おく') add('te-oku', h, end(i + 1));
      else if (n === 'くる') add('te-kuru', h, end(i + 1));
      else if (n === 'いく') add('te-iku', h, end(i + 1));
      else if (n === 'ある') add('te-aru', h, end(i + 1));
      else if (s(i + 1) === 'から') add('te-kara', h, end(i + 1));
      else if (s(i + 1) === 'も' && b(i + 2) === 'いい') add('te-mo-ii', h, end(i + 2));
      else if (s(i + 1) === 'も') add('te-mo', h, end(i + 1));
      else if (s(i + 1) === 'は' && b(i + 2) === 'いける') add('te-wa-ikenai', h, end(i + 2));
      else if (!next || /^[。！？…!?]/.test(next.surface_form) || ['ね', 'よ', 'な'].includes(s(i + 1))) add('te-request', h, end(i));
      else add('te-sequence', h, end(i));
      continue;
    }
    if (P === '助詞' && D === '接続助詞' && S === 'ば') { add('ba-conditional', headStart(i), end(i)); continue; }
    if (P === '助詞' && D === '接続助詞' && S === 'ながら') { add('nagara', headStart(i), end(i)); continue; }

    if (isVerb(m) && D === '自立' && m.conjugated_form === '基本形' && (!next || isPunct(next) || (next.pos === '助詞' && next.pos_detail_1 === '終助詞'))) add('plain-form', m.from, end(i));

    // ── Adjectives ──
    if (isAdj(m) && m.conjugated_form === '連用テ接続' && B !== 'ない' && next && next.basic_form === 'なる') { add('ku-naru', m.from, end(i + 1)); continue; }
    if (isAdj(m) && m.conjugated_form === '基本形' && next && next.pos === '名詞' && !['非自立', '接尾'].includes(next.pos_detail_1)) { add('i-adj-noun', m.from, end(i + 1)); continue; }

    // ── Particles ──
    if (P !== '助詞') continue;
    const w = wordStart(i);
    // Sentence endings take the whole verb before them: してね, not てね.
    const fin = prev && prev.pos === '助詞' && ['て', 'で'].includes(prev.surface_form) ? headStart(i - 1) : w;
    if (S === 'は' && D === '係助詞') {
      if (prev && prev.surface_form === 'に') add('ni-wa', prev.from, end(i));
      else add('wa-topic', w, end(i));
    } else if (S === 'が' && D === '格助詞') add('ga-subject', w, end(i));
    else if (S === 'が' && D === '接続助詞') add('ga-but', w, end(i));
    else if (S === 'を' && D === '格助詞') add('wo-object', w, end(i));
    else if (S === 'に' && D === '格助詞') {
      if (next && next.basic_form === 'なる') add('ni-naru', w, end(i + 1));
      else if (next && next.basic_form === 'する') add('ni-suru-choice', w, end(i + 1));
      else if (next && GO.has(next.basic_form)) add('ni-destination', w, end(i + 1));
      else if (prev && (TIME_SUFFIX.test(prev.surface_form) || prev.pos_detail_1 === '副詞可能')) add('ni-time', w, end(i));
      else if (!(prev && prev.surface_form === 'よう')) add('ni-particle', w, end(i));
    } else if (S === 'で' && D === '格助詞') {
      if (prev && /人$/.test(prev.surface_form) && prev.surface_form !== '人') add('de-together', w, end(i));
      else add('de-particle', w, end(i));
    } else if (S === 'の' && D === '連体化') add('no-possessive', w, end(i + 1));
    else if (S === 'と' && D === '並立助詞') add('to-and', w, end(i + 1));
    else if (S === 'と' && D === '格助詞' && m.pos_detail_2 === '引用') {
      if (next && next.basic_form === 'する' && prev && prev.pos === '助動詞' && ['う', 'よう'].includes(prev.basic_form)) add('you-to-suru', headStart(i - 1), end(i + 1));
      else if (next && next.basic_form === '思う') add('to-omou', w, end(i + 1));
      else if (next && ['言う', '申す'].includes(next.basic_form)) add('to-iu', w, end(i + 1));
      else add('to-quote', w, end(i + 1));
    } else if (S === 'と' && D === '格助詞') add('to-with', w, end(i));
    else if (S === 'と' && D === '接続助詞') add('to-conditional', headStart(i), end(i));
    else if (S === 'も' && D === '係助詞') add('mo-also', w, end(i));
    else if (S === 'から' && D === '格助詞') add('kara-from', w, end(i));
    else if (S === 'から' && D === '接続助詞') add('kara-reason', headStart(i), end(i));
    else if (S === 'まで' && s(i + 1) === 'に') add('made-ni', w, end(i + 1));
    else if (S === 'まで') add('made', w, end(i));
    else if (S === 'より') add('yori', w, end(i));
    else if (S === 'や' && D === '並立助詞') add('ya-and', w, end(i + 1));
    else if (S === 'へ') add('he-direction', w, end(i));
    else if (S === 'か' && (!next || isPunct(next)) && !(s(i - 1) === 'ん' && s(i - 2) === 'ませ') && s(i - 2) !== 'ましょ') add('ka-question', fin, end(i));
    else if (S === 'よ' && D === '終助詞') add('yo', fin, end(i));
    else if (['ね', 'ねえ', 'ねー'].includes(S) && D === '終助詞') add('ne', fin, end(i));
    else if (S === 'な' && D === '終助詞') add('na-ending', fin, end(i));
    else if (S === 'ぞ' && GRAMMAR.zo) add('zo', w, end(i));
    else if (S === 'ので') add('node', headStart(i), end(i));
    else if (S === 'のに' && D === '接続助詞') add('noni', headStart(i), end(i));
    else if (['けど', 'けれど', 'けれども'].includes(S)) add('keredo', headStart(i), end(i));
    else if (S === 'し' && D === '接続助詞') add('shi', headStart(i), end(i));
    else if (S === 'だけ') add('dake', w, end(i));
    else if (S === 'しか') add('shika-nai', w, end(i));
    else if (['ぐらい', 'くらい'].includes(S)) add('gurai', w, end(i));
    else if (S === 'って') add('tte', w, end(i));
    else if (S === 'でも' && D === '副助詞') add('demo-suggest', w, end(i));
  }

  // Patterns easier to see in the text than in the morphemes.
  const re = (id, rx) => { const m = plain.match(rx); if (m) add(id, m.index, m.index + m[0].length); };
  re('o-honorific', /[おご][一-鿿ぁ-ん]{1,4}ください/);
  re('kana', /かな(?=[？。！]|$)/);
  re('te-shimau', /て\s*しま[うっえ]/);
  re('kuse-ni', /くせに/);
  re('to-iu-name', /[」]?という/);
  re('nagara', /ながら/);
  re('kamoshirenai', /かもしれない/);
  return found;
}
