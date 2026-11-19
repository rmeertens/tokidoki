// The other right answers to a Sentences card, and why each is right.
//
// English → Japanese: every version a typed answer counts as right, each
// tagged with how it differs from the sentence as written (`kinds`):
//   order        another word order (sentence-orders.js)
//   no-watashi / add-watashi     with or without 私は ("I" sentences)
//   no-anata / add-anata         with or without あなたは ("you" questions)
//   no-watashino / add-watashino 母 or 私の母 for "my mother"
//   negative     〜ないです / 〜ありません, では / じゃ
//   uchi         家 read うち as well as いえ
//   boku         僕 for 私
// The rules make each other's versions too (another word order without
// 私は, …), up to MAX versions.
//
// Japanese → English: English is checked loosely — contractions, Mr. / Ms. /
// -san for さん, a / the / my where Japanese doesn't say — and `english`
// lists the other ways worth showing.
//
// `shown` picks what the answer side lists under "Also correct", and WHY
// says why each is right (also shown when a typed answer was one of them).

(function (global) {
  'use strict';

  const Orders = global.SentenceOrders || (typeof require === 'function' ? require('./sentence-orders.js') : null);

  const MAX = 800;

  const WHY = {
    order: ['Word order', 'The phrases before the verb can come in any order: their particles (に, と, を…) say what each one does, not where it stands.'],
    'no-watashi': ['Without 私は', 'When it\'s clear you mean yourself, Japanese usually leaves 私は out.'],
    'add-watashi': ['With 私は', 'Saying 私は is fine too, though Japanese often leaves it out when it\'s clear.'],
    'no-anata': ['Without あなたは', 'Japanese usually leaves あなたは out: it\'s clear who\'s being asked.'],
    'add-anata': ['With あなたは', 'Right, though Japanese usually leaves あなた out — it can sound too direct.'],
    'no-watashino': ['Without 私の', '母, 父, 兄… on their own already mean "my mother / father / brother", so 私の can go.'],
    'add-watashino': ['With 私の', '私の is fine, though 母, 父, 兄… on their own already mean "my …".'],
    negative: ['Polite negative', '〜ないです and 〜ありません are both polite negatives (〜ありません is a little more formal), and じゃ is the everyday form of では.'],
    uchi: ['家 as うち', '家 ("home") can be read いえ or うち.'],
    boku: ['僕 for 私', '僕 is another word for "I", used mostly by boys and men.'],
    san: ['Mr. or Ms.', 'さん is used for men and women alike, so Mr., Ms. or just -san all fit.'],
    article: ['a / the / my', 'Japanese doesn\'t say "a", "the" or "my" here, so any of them fits.'],
  };
  // Shown under "Also correct" (the rest only when typed), and how many of
  // each.
  const SHOW = { order: 2, 'no-watashi': 1, 'no-anata': 1, 'no-watashino': 1, negative: 3, uchi: 1 };

  const ruby = (k, r) => `<ruby>${k}<rp>(</rp><rt>${r}</rt><rp>)</rp></ruby>`;
  const plain = html => html.replace(/<rp>.*?<\/rp>|<rt>.*?<\/rt>|<\/?ruby>/g, '');
  const WATASHI = ruby('私', 'わたし');
  const FAMILY = {
    母: 'mother|mom', 父: 'father|dad', 兄: 'older brother|big brother', 姉: 'older sister|big sister',
    弟: 'younger brother|little brother', 妹: 'younger sister|little sister', 両親: 'parents',
    家族: 'family', 祖母: 'grandmother|grandma', 祖父: 'grandfather|grandpa',
  };
  const FAMILY_RE = new RegExp(`<ruby>(${Object.keys(FAMILY).join('|')})<rp>`);

  // ─── English → Japanese ───────────────────────────────────────────────────

  // Each rule takes a version's jaHtml (and the sentence) and returns the
  // other jaHtml it can be, as [kind, jaHtml].
  const RULES = [
    // 私の母 → 母; 母 → 私の母 for "my mother".
    (html, s) => {
      const out = [];
      const m = new RegExp(`${WATASHI.replace(/[()]/g, '\\$&')}の(?=<ruby>(${Object.keys(FAMILY).join('|')})<rp>)`).exec(html);
      if (m) out.push(['no-watashino', html.replace(m[0], '')]);
      else {
        const f = FAMILY_RE.exec(html);
        // Not 私は私の姉に….
        if (f && html[f.index - 1] !== 'の' && !html.includes(WATASHI) && new RegExp(`\\bmy (${FAMILY[f[1]]})\\b`, 'i').test(s.en || '')) {
          out.push(['add-watashino', html.slice(0, f.index) + WATASHI + 'の' + html.slice(f.index)]);
        }
      }
      return out;
    },
    // あなたは: out, or in for a question to "you".
    (html, s, line) => {
      if (/あなたは/.test(html)) return [['no-anata', html.replace(/あなたは、?/, '')]];
      const en = s.en || '';
      const toYou = /\?$/.test(en) && (/^(Are|Do|Did|Will|Were|Have|Can|Could|Would) you\b/.test(en)
        || /^(What|Where|When|Who|How|Which|Why)\b.*\byou\b/.test(en));
      // Not to a teacher or by name, not in a request or invitation (あなた
      // would be rude or odd there), and not next to another topic
      // (あなたは昨日は…).
      const topic = line && line.w.some(p => Array.isArray(p) && p[1] === 'は');
      if (toYou && line && !topic && !/あなた|君|先生|さん|様|社長|部長|<rt>お|ませんか|ましょう|いただ|くださ|^(お|ご)/.test(html)) {
        return [['add-anata', 'あなたは' + html]];
      }
      return [];
    },
    // 〜ないです / 〜ありません, では / じゃ.
    html => {
      const m = /(く|じゃ|では)(ありませんでした|なかったです|ありません|ないです)/.exec(html);
      if (m) {
        const past = /でした|かった/.test(m[2]);
        const stems = m[1] === 'く' ? ['く'] : ['では', 'じゃ'];
        const ends = past ? ['ありませんでした', 'なかったです'] : ['ありません', 'ないです'];
        const out = [];
        stems.forEach(st => ends.forEach(e => {
          if (st + e !== m[0]) out.push(['negative', html.slice(0, m.index) + st + e + html.slice(m.index + m[0].length)]);
        }));
        return out;
      }
      // Plain じゃない / ではない.
      const p = /(じゃ|では)(なかった|ない)(?!です)/.exec(html);
      if (p) return [['negative', html.slice(0, p.index) + (p[1] === 'じゃ' ? 'では' : 'じゃ') + p[2] + html.slice(p.index + p[0].length)]];
      return [];
    },
    // 家 read うち.
    html => {
      const ie = ruby('家', 'いえ');
      return html.includes(ie) ? [['uchi', html.split(ie).join('うち')]] : [];
    },
    // 僕 for 私 in a sentence about "I" (not a humble one: 僕と申します).
    (html, s) => (html.includes(WATASHI) && /\b(I|me|my)\b/.test(s.en || '') && !/humble|honorific/.test(s.en || '')
      && !/申|おり|いたし|伺|参り|存じ/.test(html)
      ? [['boku', html.split(WATASHI).join(ruby('僕', 'ぼく'))]] : []),
  ];

  // Every version that counts as right, the sentence itself first, as
  // { ja, jaHtml, kinds }. `line` / `gloss` are its SENTENCE_WORDS entry
  // (for the word orders); without them only the other rules apply.
  function japanese(sentence, line, gloss) {
    const own = { ja: sentence.ja, jaHtml: sentence.jaHtml || sentence.ja, kinds: [] };
    let list = Orders && line && gloss ? Orders.variants(sentence, line, gloss) : [own];
    list = list.map(v => ({ ja: v.ja, jaHtml: v.jaHtml, kinds: v.kinds || [] }));
    const seen = new Set(list.map(v => v.jaHtml));
    RULES.forEach(rule => {
      list.slice().forEach(v => {
        rule(v.jaHtml, sentence, line).forEach(([kind, jaHtml]) => {
          if (seen.has(jaHtml) || list.length >= MAX) return;
          seen.add(jaHtml);
          list.push({ ja: plain(jaHtml), jaHtml, kinds: v.kinds.concat(kind) });
        });
      });
    });
    return list;
  }

  // What the answer side lists: [{ kind, label, why, items: [{ ja, jaHtml }
  // or { en }], more }] — versions that differ in one way only.
  function shown(versions) {
    const groups = new Map();
    versions.forEach(v => {
      if (!v.kinds || v.kinds.length !== 1) return;
      const kind = v.kinds[0];
      if (!SHOW[kind] && kind !== 'san') return;
      if (!groups.has(kind)) groups.set(kind, { kind, label: WHY[kind][0], why: WHY[kind][1], items: [], more: 0 });
      const g = groups.get(kind);
      if (g.items.length < (SHOW[kind] || 3)) g.items.push(v);
      else g.more++;
    });
    return [...groups.values()];
  }

  // Why a matched version is right: [label, why] for each way it differs.
  const reasons = kinds => (kinds || []).filter(k => WHY[k]).map(k => WHY[k]);

  // ─── Japanese → English ───────────────────────────────────────────────────

  const POSSESSIVE = /(私|わたし|僕|ぼく|あなた|君|彼|彼女|私たち)の/;

  // Steps that loosen an English answer, in order; `note` is said when the
  // match needed it.
  const EN_STEPS = [
    { kind: null, when: () => true, apply: s => s
      .replace(/[’‘`]/g, "'")
      .replace(/\bcan't\b|\bcannot\b/g, 'can not').replace(/\bwon't\b/g, 'will not').replace(/\bshan't\b/g, 'shall not')
      .replace(/n't\b/g, ' not').replace(/'m\b/g, ' am').replace(/'re\b/g, ' are').replace(/'ve\b/g, ' have')
      .replace(/'ll\b/g, ' will').replace(/'d better\b/g, ' had better').replace(/'d\b/g, ' would')
      .replace(/\b(it|he|she|that|this|what|where|who|there|here|how|when|why|which)'s\b/g, '$1 is')
      .replace(/\bmom\b|\bmum\b/g, 'mother').replace(/\bdad\b/g, 'father').replace(/\bok\b|\bokay\b/g, 'all right') },
    { kind: 'san', when: ja => /さん/.test(ja), apply: s => s
      .replace(/\b(mr|ms|mrs|miss)\.? ?([a-z]+)/g, '$2').replace(/\b([a-z]+)[- ]san\b/g, '$1') },
    { kind: 'article', when: () => true, apply: (s, ja) => {
      let out = s.replace(/\b(a|an|the)\b/g, 'the');
      if (!POSSESSIVE.test(ja)) out = out.replace(/\b(my|your|our)\b/g, 'the');
      return out;
    } },
  ];
  const enKey = s => s.replace(/[\s.,!?;:"'()（）。、！？「」-]/g, '');

  // Whether a typed English answer is right for the sentence: null if not,
  // else the [label, why] of each way it differs.
  function matchEnglish(typed, sentence) {
    const ja = sentence.ja || '';
    const t0 = String(typed).normalize('NFKC').toLowerCase();
    const a0 = String(sentence.en || '').normalize('NFKC').toLowerCase()
      .replace(/\s*\((humble|honorific|polite|casual)\)\s*/g, ' ');
    const steps = EN_STEPS.filter(st => st.when(ja));
    const matches = skip => {
      let t = t0, a = a0;
      if (enKey(t) === enKey(a)) return true;
      for (const st of steps) {
        if (st === skip) continue;
        t = st.apply(t, ja); a = st.apply(a, ja);
        if (enKey(t) === enKey(a)) return true;
      }
      return false;
    };
    if (!matches(null)) return null;
    // Each loosening the match needed.
    return steps.filter(st => st.kind && !matches(st)).map(st => WHY[st.kind]);
  }

  // The other English answers worth showing: Ms. for Mr. (and the reverse)
  // and -san, when the Japanese only says さん.
  function english(sentence) {
    const en = sentence.en || '';
    const out = [{ en, kinds: [] }];
    const m = /\b(Mr|Ms|Mrs|Miss)\. ([A-Z][a-z]+)/.exec(en);
    if (m && /さん/.test(sentence.ja || '') && !/\b(he|she|him|her|his|hers)\b/i.test(en)) {
      const other = m[1] === 'Mr' ? 'Ms' : 'Mr';
      out.push({ en: en.replace(m[0], `${other}. ${m[2]}`), kinds: ['san'] });
      out.push({ en: en.replace(m[0], `${m[2]}-san`), kinds: ['san'] });
    }
    return out;
  }

  const api = { japanese, english, shown, reasons, matchEnglish, WHY };
  global.SentenceAlternatives = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
