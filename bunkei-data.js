(function (global) {
  'use strict';

  // Sentence patterns (文型, bunkei) for the Bunkei drill (bunkei.html): one
  // verb is put through many patterns — 〜させてください, 〜なければなりません,
  // 〜かもしれません… — and the learner translates each English sentence.
  //
  // Sentences are generated, not hand-written: each pattern conjugates the
  // verb with Conjugator and wraps it in the verb's natural object phrase from
  // examples.js (食べる → 寿司を, 行く → 学校に). Only verbs whose context is an
  // ordinary action (kind 'act') are used, since patterns like "please let
  // me" or "you must" don't make sense for 忘れる or 雨が降る.
  //
  // Each pattern has:
  //   ja(p)      Japanese, in 漢字[かんじ] furigana markup
  //   en(p)      English
  //   skip       verbs (by kanji) where the pattern reads unnaturally
  //   needs      a conjugation form the verb context may opt out of via `skip`
  // Relies on conjugator.js (a top-level `const Conjugator`, so referenced as
  // a bare global rather than via window) and examples.js being loaded first.
  //
  // where `p` gives the verb's pieces: pre (object phrase), c(form) for a
  // conjugation with kanji restored, stem (ます stem), v/o (English verb and
  // object), and a few derived English forms.

  const LEVELS = ['N5', 'N4', 'N3'];

  // English past participles that differ from the simple past.
  const PARTICIPLE = {
    be: 'been', begin: 'begun', break: 'broken', choose: 'chosen', come: 'come', do: 'done',
    draw: 'drawn', drink: 'drunk', drive: 'driven', eat: 'eaten', fall: 'fallen', forget: 'forgotten',
    get: 'gotten', give: 'given', go: 'gone', grow: 'grown', know: 'known', ride: 'ridden', run: 'run',
    see: 'seen', sightsee: 'been sightseeing', sing: 'sung', speak: 'spoken', steal: 'stolen',
    swim: 'swum', take: 'taken', wake: 'woken', withdraw: 'withdrawn', write: 'written', become: 'become',
  };

  // Verbs of motion / existence, whose 〜ている means a resulting state
  // ("has gone", "is here") rather than "is doing now".
  const STATE_TE_IRU = ['行く', '来る', '帰る', '出かける', '入る', 'いる', 'ある', '起きる', '座る', '立つ', '乗る', '降りる', '結婚する', '卒業する'];

  // One-off life events: fine with "I've decided to" or "might", but not with
  // patterns marked `repeated` — ones that imply repetition, trying it out or
  // doing it together ("every day", "let's … together", "try … once").
  const ONE_OFF = ['卒業する', '結婚する', '就職する', '留学する', '離婚する', '優勝する', '引っ越す', 'なる', '別れる', '付き合う', '入学する'];

  // Existence verbs read oddly in almost every pattern ("please let me be in
  // the classroom"), so they're left out of the drill.
  const EXCLUDED_VERBS = ['いる', 'ある'];

  // Drops the final る of a ru-verb-like form (potential, causative…) and adds an ending.
  const ruTo = (form, ending) => form.slice(0, -1) + ending;
  // 食べない → 食べな + ending (〜なければ, 〜なくて)
  const naiTo = (nai, ending) => nai.slice(0, -1) + ending;

  const PATTERNS = [
    // ── N5 ──
    { id: 'te-kudasai', level: 'N5', name: '〜てください', meaning: 'please do',
      note: 'A polite request: て-form + ください.',
      ja: p => `${p.pre}${p.c('te')}ください。`,
      en: p => `Please ${p.v} ${p.o}.` },
    { id: 'naide-kudasai', level: 'N5', name: '〜ないでください', meaning: 'please don\'t',
      note: 'A polite request not to do something: ない-form + でください.',
      ja: p => `${p.pre}${p.c('nai')}でください。`,
      en: p => `Please don't ${p.v} ${p.o}.` },
    { id: 'tai', level: 'N5', name: '〜たいです', meaning: 'want to',
      note: 'Your own wish: ます-stem + たい. It conjugates like an い-adjective.',
      ja: p => `${p.pre}${p.c('tai')}です。`,
      en: p => `I want to ${p.v} ${p.o}.` },
    { id: 'masen-ka', level: 'N5', name: '〜ませんか', meaning: 'won\'t you…? (invitation)',
      note: 'A polite invitation: ます-stem + ませんか.',
      repeated: true,
      ja: p => `一緒[いっしょ]に${p.pre}${p.stem}ませんか。`,
      en: p => `Would you like to ${p.v} ${p.o} together?` },
    { id: 'mashou', level: 'N5', name: '〜ましょう', meaning: 'let\'s',
      note: 'A suggestion to do something together: ます-stem + ましょう.',
      repeated: true,
      ja: p => `一緒[いっしょ]に${p.pre}${p.stem}ましょう。`,
      en: p => `Let's ${p.v} ${p.o} together.` },
    { id: 'te-iru', level: 'N5', name: '〜ています', meaning: 'am doing (now)',
      note: 'An action in progress: て-form + います.',
      repeated: true,
      skip: STATE_TE_IRU,
      ja: p => `今[いま]、${p.pre}${p.c('te')}います。`,
      en: p => `I'm ${p.ing} ${p.o} right now.` },
    { id: 'te-mo-ii', level: 'N5', name: '〜てもいいですか', meaning: 'may I…?',
      note: 'Asking permission: て-form + もいいですか.',
      ja: p => `${p.pre}${p.c('te')}もいいですか。`,
      en: p => `May I ${p.v} ${p.o}?` },
    { id: 'te-wa-ikenai', level: 'N5', name: '〜てはいけません', meaning: 'must not',
      note: 'Prohibition: て-form + はいけません.',
      ja: p => `${p.pre}${p.c('te')}はいけません。`,
      en: p => `You must not ${p.v} ${p.o}.` },

    // ── N4 ──
    { id: 'potential', level: 'N4', name: 'Potential 〜(ら)れます', meaning: 'can',
      note: 'Ability: う-verbs 〜える, る-verbs 〜られる, する → できる, くる → こられる. The object often takes が.',
      needs: 'potential',
      ja: p => `${p.potPre}${ruTo(p.c('potential'), 'ます')}。`,
      en: p => `I can ${p.v} ${p.o}.` },
    { id: 'potential-neg', level: 'N4', name: 'Potential 〜(ら)れません', meaning: 'can\'t',
      note: 'Inability: the potential form, made negative like any る-verb.',
      needs: 'potential',
      ja: p => `${p.potPre}${ruTo(p.c('potential'), 'ません')}。`,
      en: p => `I can't ${p.v} ${p.o}.` },
    { id: 'nakereba-naranai', level: 'N4', name: '〜なければなりません', meaning: 'must, have to',
      note: 'Obligation: ない-form, drop い, add ければなりません. Casual: 〜なきゃ.',
      ja: p => `${p.pre}${naiTo(p.c('nai'), 'ければなりません')}。`,
      en: p => `I have to ${p.v} ${p.o}.` },
    { id: 'nakute-mo-ii', level: 'N4', name: '〜なくてもいいです', meaning: 'don\'t have to',
      note: 'No obligation: ない-form, drop い, add くてもいいです.',
      ja: p => `${p.pre}${naiTo(p.c('nai'), 'くてもいいです')}。`,
      en: p => `You don't have to ${p.v} ${p.o}.` },
    { id: 'sasete-kudasai', level: 'N4', name: '〜させてください', meaning: 'please let me',
      note: 'Asking permission to do something yourself: causative て-form + ください.',
      needs: 'causative',
      ja: p => `${p.pre}${ruTo(p.c('causative'), 'て')}ください。`,
      en: p => `Please let me ${p.v} ${p.o}.` },
    { id: 'ta-koto-ga-aru', level: 'N4', name: '〜たことがあります', meaning: 'have (ever) done',
      note: 'Past experience: た-form + ことがあります.',
      repeated: true,
      ja: p => `${p.pre}${p.c('ta')}ことがあります。`,
      en: p => `I have ${p.pp} ${p.o} before.` },
    { id: 'te-shimau', level: 'N4', name: '〜てしまいました', meaning: 'ended up doing (regret)',
      note: 'Something done that you regret, or did completely: て-form + しまいました. Casual: 〜ちゃった.',
      repeated: true,
      ja: p => `つい${p.pre}${p.c('te')}しまいました。`,
      en: p => `I ended up ${p.ing} ${p.o} without thinking.` },
    { id: 'te-oku', level: 'N4', name: '〜ておきます', meaning: 'do in advance',
      note: 'Doing something now to be ready later: て-form + おきます.',
      repeated: true,
      ja: p => `先[さき]に${p.pre}${p.c('te')}おきます。`,
      en: p => `I'll ${p.v} ${p.o} first, so it's done in advance.` },
    { id: 'te-miru', level: 'N4', name: '〜てみます', meaning: 'try doing',
      note: 'Doing something to see how it goes: て-form + みます.',
      repeated: true,
      ja: p => `一度[いちど]${p.pre}${p.c('te')}みます。`,
      en: p => `I'll try ${p.ing} ${p.o} once.` },
    { id: 'tsumori', level: 'N4', name: '〜つもりです', meaning: 'plan to, intend to',
      note: 'A plan you have already made: dictionary form + つもりです.',
      ja: p => `来年[らいねん]、${p.pre}${p.c('dict')}つもりです。`,
      en: p => `I plan to ${p.v} ${p.o} next year.` },
    { id: 'volitional-to-omou', level: 'N4', name: '〜(よ)うと思っています', meaning: 'thinking of doing',
      note: 'An intention you are considering: volitional form + と思っています.',
      needs: 'volitional',
      ja: p => `${p.pre}${p.c('volitional')}と思[おも]っています。`,
      en: p => `I'm thinking of ${p.ing} ${p.o}.` },
    { id: 'hou-ga-ii', level: 'N4', name: '〜た方がいいです', meaning: 'you\'d better',
      note: 'Advice: た-form + 方がいいです.',
      ja: p => `${p.pre}${p.c('ta')}方[ほう]がいいですよ。`,
      en: p => `You'd better ${p.v} ${p.o}.` },
    { id: 'kamoshirenai', level: 'N4', name: '〜かもしれません', meaning: 'might',
      note: 'Possibility: plain form + かもしれません.',
      ja: p => `明日[あした]、${p.pre}${p.c('dict')}かもしれません。`,
      en: p => `I might ${p.v} ${p.o} tomorrow.` },
    { id: 'te-hoshii', level: 'N4', name: '〜てほしいです', meaning: 'want someone to',
      note: 'Wanting someone else to act: person に + て-form + ほしいです.',
      skip: ['会う', '手伝う'],
      ja: p => `弟[おとうと]に${p.pre}${p.c('te')}ほしいです。`,
      en: p => `I want my little brother to ${p.v} ${p.o}.` },

    // ── N3 ──
    { id: 'causative-passive', level: 'N3', name: '〜させられました', meaning: 'was made to',
      note: 'Being made to do something against your will: causative-passive form. Casual う-verb form: 〜される (書かされる).',
      needs: 'causative-passive',
      ja: p => `父[ちち]に${p.pre}${ruTo(p.c('causative-passive'), 'ました')}。`,
      en: p => `My father made me ${p.v} ${p.o}.` },
    { id: 'beki', level: 'N3', name: '〜べきです', meaning: 'should, ought to',
      note: 'What is right or proper: dictionary form + べきです (する → するべき or すべき).',
      repeated: true,
      ja: p => `${p.pre}${p.c('dict')}べきです。`,
      en: p => `You really ought to ${p.v} ${p.o}.` },
    { id: 'koto-ni-suru', level: 'N3', name: '〜ことにしました', meaning: 'decided to',
      note: 'A decision you made yourself: dictionary form + ことにしました.',
      ja: p => `${p.pre}${p.c('dict')}ことにしました。`,
      en: p => `I've decided to ${p.v} ${p.o}.` },
    { id: 'you-ni-suru', level: 'N3', name: '〜ようにしています', meaning: 'make a point of',
      note: 'A habit you keep up deliberately: dictionary form + ようにしています.',
      repeated: true,
      ja: p => `毎日[まいにち]${p.pre}${p.c('dict')}ようにしています。`,
      en: p => `I make a point of ${p.ing} ${p.o} every day.` },
    { id: 'wake-ni-wa-ikanai', level: 'N3', name: '〜わけにはいきません', meaning: 'can\'t possibly',
      note: 'Something you can\'t do for social or moral reasons: dictionary form + わけにはいきません.',
      ja: p => `今日[きょう]は${p.pre}${p.c('dict')}わけにはいきません。`,
      en: p => `I can't possibly ${p.v} ${p.o} today.` },
    { id: 'koto-wa-nai', level: 'N3', name: '〜ことはありません', meaning: 'there\'s no need to',
      note: 'Reassurance that something is unnecessary: dictionary form + ことはありません.',
      ja: p => `無理[むり]に${p.pre}${p.c('dict')}ことはありません。`,
      en: p => `There's no need to force yourself to ${p.v} ${p.o}.` },
    { id: 'te-bakari', level: 'N3', name: '〜てばかりいます', meaning: 'do nothing but',
      note: 'Doing one thing all the time, usually as a complaint: て-form + ばかりいます.',
      repeated: true,
      ja: p => `最近[さいきん]、${p.pre}${p.c('te')}ばかりいます。`,
      en: p => `Lately I do nothing but ${p.v} ${p.o}.` },
  ];

  const PATTERN_BY_ID = Object.fromEntries(PATTERNS.map(p => [p.id, p]));

  // 食べない → 食べずに; しない → せずに (する and 〜する verbs).
  function zuniForm(verb, nai) {
    if (verb.type === 'irregular' && verb.reading.endsWith('する')) return nai.slice(0, -3) + 'せずに';
    return nai.slice(0, -2) + 'ずに';
  }

  // The verb's pieces that patterns build sentences from, or null when the
  // verb has no ordinary-action context.
  function pieces(verb) {
    const ctx = global.Examples.contextFor(verb);
    if (!ctx || (ctx.kind && ctx.kind !== 'act') || EXCLUDED_VERBS.includes(verb.kanji)) return null;
    const { inflect, gerund, pastTense } = global.Examples.english;
    const c = form => global.Examples.withKanji(verb, Conjugator.conjugate(verb, form));
    const head = ctx.v.split(' ')[0];
    return {
      ctx,
      pre: ctx.pre || '',
      potPre: ctx.potPre || ctx.pre || '',
      c,
      stem: c('masu').slice(0, -2),
      zuni: zuniForm(verb, c('nai')),
      v: ctx.v,
      o: ctx.o || '',
      ing: inflect(ctx.v, gerund),
      // "have been to Japan", not "have gone to Japan"
      pp: ctx.v === 'go' && /^to /.test(ctx.o || '') ? 'been' : inflect(ctx.v, w => PARTICIPLE[w] || pastTense(w)),
      head,
    };
  }

  function appliesTo(pattern, verb, p) {
    if (!p) return false;
    if ((pattern.skip || []).includes(verb.kanji)) return false;
    if (pattern.repeated && ONE_OFF.includes(verb.kanji)) return false;
    if (pattern.needs && (p.ctx.skip || []).includes(pattern.needs)) return false;
    return true;
  }

  // Patterns usable with this verb.
  function patternsFor(verb) {
    const p = pieces(verb);
    return PATTERNS.filter(pattern => appliesTo(pattern, verb, p));
  }

  // Verbs with at least one usable pattern, de-duplicated by spelling+meaning.
  function usableVerbs(verbs) {
    const seen = new Set();
    return verbs.filter(v => {
      const key = v.disambig ? `${v.kanji}_${v.disambig}` : v.kanji;
      if (seen.has(key) || !pieces(v)) return false;
      seen.add(key);
      return true;
    });
  }

  function toKana(ja) {
    return ja.replace(/[一-鿿々〆ヵヶ]+\[([^\]]+)\]/g, '$1');
  }

  // { ja, en, plain, kana } for a verb in a pattern, or null if it doesn't apply.
  function build(verb, patternId) {
    const pattern = PATTERN_BY_ID[patternId];
    const p = pieces(verb);
    if (!pattern || !appliesTo(pattern, verb, p)) return null;
    const ja = pattern.ja(p);
    // Split off the conjugated verb + pattern ending (everything after the
    // object phrase) so the answer can highlight it.
    const pre = pattern.needs === 'potential' ? p.potPre : p.pre;
    const at = pre ? ja.indexOf(pre) : -1;
    const cut = at === -1 ? 0 : at + pre.length;
    const body = ja.replace(/。$/, '');
    return {
      ja,
      before: body.slice(0, cut),
      focus: body.slice(cut),
      en: global.Examples.english.sentence(pattern.en(p)),
      plain: global.Examples.stripFurigana(ja),
      kana: toKana(ja),
    };
  }

  // Loose comparison for typed answers: ignores punctuation, spaces and
  // kanji-vs-kana choice (an answer matches either the kanji or all-kana form).
  function normalize(text) {
    return String(text)
      .replace(/[\s　。、．，,.!?！？「」]/g, '')
      .replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
  }

  function matches(typed, built) {
    const t = normalize(typed);
    if (!t) return false;
    return t === normalize(built.plain) || t === normalize(built.kana);
  }

  global.Bunkei = { LEVELS, PATTERNS, PATTERN_BY_ID, patternsFor, usableVerbs, build, matches };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = global.Bunkei;
  }
})(typeof window !== 'undefined' ? window : globalThis);
