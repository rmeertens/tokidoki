// The questions on the particles & verbs practice sheets (N5 / N4 / N3,
// 150 each), printed by render_grammar_practice.mjs and checked by
// test_grammar_practice.js. Everything comes from the site's own data,
// picked with a fixed seed so the sheets don't change between runs:
//
//   A  Particles: a sentence with a （　）, four choices. Only questions whose
//      wrong choices were checked to be wrong in that sentence:
//      PARTICLE_QUESTIONS (particle-questions-data.js), the verb + particle
//      items (verb-particles-data.js) and the quiz items that list their own
//      `wrong` (particles-data.js) — the quiz's shared distractor groups can
//      fit too (友達（も）映画を見ました), so those items aren't used — plus
//      EXTRA below.
//   B  Verb forms: write the form, made by conjugator.js from the level's
//      verbs in verbs.js (only forms verbHasForm allows).
//   C  N5: る-verb, う-verb or irregular (the look-alikes first). N4 / N3:
//      が or を with the verb pairs of verb-particles-data.js (開く / 開ける).
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
globalThis.window = globalThis;
require("../particle-questions-data.js");
require("../particles-data.js");
require("../verb-particles-data.js");
const Conjugator = require("../conjugator.js");
const { ALL_VERBS, verbHasForm, verbLevel } = require("../verbs.js");
const { PARTICLE_QUESTIONS, PARTICLE_QUIZ_ITEMS, VERB_PARTICLE_ITEMS, VERB_TRANSITIVITY } = globalThis;

export const LEVELS = ["N5", "N4", "N3"];
export const TOTAL = 150;
// How many questions each section has, per level (A + B + C = 150).
export const SECTIONS = {
  N5: { A: 70, B: 60, C: 20 },
  N4: { A: 55, B: 59, C: 36 },
  N3: { A: 49, B: 60, C: 41 },
};

// More N3 particle questions, written for the sheet: [before, after,
// choices (answer first), why], furigana as 漢字[かな].
const EXTRA = {
  N3: [
    ["忙[いそが]しくて、昼[ひる]ご飯[はん]を食[た]べる時間[じかん]", "ない。", ["さえ", "ばかり", "ほど", "より"], "さえ: “not even” — there isn’t even time to eat lunch. ばかり / ほど / より don’t give that meaning."],
    ["弟[おとうと]はゲーム", "していて、全然[ぜんぜん]勉強[べんきょう]しない。", ["ばかり", "さえ", "しか", "ほど"], "ばかり: “nothing but” — he only plays games. さえ and しか don’t fit a positive sentence like this; ほど is “to the extent”."],
    ["この町[まち]は桜[さくら]", "有名[ゆうめい]です。", ["で", "を", "に", "へ"], "〜で有名[ゆうめい]: famous for something. The reason or cause of the fame takes で."],
    ["環境[かんきょう]問題[もんだい]", "、クラスで話[はな]し合[あ]いました。", ["について", "にとって", "として", "によって"], "について: “about” — the topic of the discussion."],
    ["私[わたし]", "、家族[かぞく]が一番[いちばん]大切[たいせつ]です。", ["にとって", "について", "によって", "まで"], "にとって: “for / to (someone)” before a judgement: to me, family matters most."],
    ["国[くに]", "、習慣[しゅうかん]が違[ちが]います。", ["によって", "について", "にとって", "ばかり"], "によって: “depending on” — customs differ from country to country."],
    ["彼[かれ]は通訳[つうやく]", "その会議[かいぎ]に出[で]た。", ["として", "について", "にとって", "によって"], "として: “as” — the role he attended in."],
    ["この仕事[しごと]は来週[らいしゅう]の金曜日[きんようび]", "終[お]わらせなければならない。", ["までに", "まで", "より", "ほど"], "までに: “by” a deadline — finish at some point before Friday. まで would be “keep doing until Friday”."],
    ["今年[ことし]の夏[なつ]は去年[きょねん]", "暑[あつ]くない。", ["ほど", "まで", "しか", "ばかり"], "ほど + negative: “not as hot as last year”."],
    ["先生[せんせい]", "相談[そうだん]したら、いいアドバイスをもらった。", ["に", "を", "で", "や"], "相談[そうだん]する takes に for the person you ask for advice."],
    ["駅[えき]", "歩[ある]いて十分[じゅっぷん]ぐらいです。", ["まで", "までに", "より", "ほど"], "まで: “as far as” the station. までに is a deadline in time, not a distance."],
    ["パーティーには、知[し]らない人[ひと]", "来[き]ていた。", ["まで", "しか", "ほど", "より"], "まで: “even” — even people I didn’t know came."],
  ],
};

// Verb forms per level, with how they're named on the sheet.
const FORMS = {
  N5: ["masu", "masu-neg", "masu-past", "masu-past-neg", "te", "ta", "nai", "nakatta", "tai", "mashou"],
  N4: ["potential", "volitional", "ba", "tara", "passive", "causative", "imperative", "nakereba", "te", "nai"],
  N3: ["causative-passive", "passive", "causative", "zu", "potential", "ba", "volitional", "imperative", "chau", "nakereba"],
};
export const FORM_NAMES = {
  masu: "polite (〜ます)", "masu-neg": "polite negative (〜ません)", "masu-past": "polite past (〜ました)",
  "masu-past-neg": "polite past negative", te: "て-form", ta: "た-form (plain past)", nai: "ない-form",
  nakatta: "plain past negative", tai: "〜たい (want to)", mashou: "〜ましょう (let's)",
  potential: "potential (can)", volitional: "volitional (let's, plain)", ba: "〜ば (if)", tara: "〜たら (if / when)",
  passive: "passive", causative: "causative (make / let)", imperative: "command", nakereba: "〜なければ",
  "causative-passive": "causative-passive (be made to)", zu: "〜ず (without)", chau: "〜ちゃう / じゃう (casual)",
};
// Verbs from which levels each sheet conjugates.
const VERB_LEVELS = { N5: ["N5"], N4: ["N4", "N5"], N3: ["N3", "N4"] };

// ─── helpers ───
function hash(s) {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.codePointAt(0), 16777619);
  return h >>> 0;
}
function rng(seed) {
  let a = hash(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(list, seed) {
  const r = rng(seed);
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
// All markup becomes 漢字[かな].
const fromBraces = (s) => s.replace(/\{([^|}]+)\|([^}]+)\}/g, "$1[$2]");
// The quiz data keeps only ruby HTML: back to 漢字[かな].
const fromHtml = (h) => h.replace(/<ruby>([^<]+)<rp>\(<\/rp><rt>([^<]+)<\/rt><rp>\)<\/rp><\/ruby>/g, "$1[$2]");
export const plain = (s) => s.replace(/\[[^\]]*\]/g, "");

// Take n, spread over the answers: round-robin by answer, each group shuffled.
function spread(items, n, seed) {
  const groups = new Map();
  for (const q of shuffle(items, seed)) {
    if (!groups.has(q.answer)) groups.set(q.answer, []);
    groups.get(q.answer).push(q);
  }
  const out = [];
  const lists = [...groups.values()];
  while (out.length < n && lists.some((l) => l.length)) {
    for (const l of lists) if (l.length && out.length < n) out.push(l.shift());
  }
  if (out.length < n) throw new Error(`only ${out.length} of ${n} questions (${seed})`);
  return shuffle(out, seed + ":order");
}

// ─── A: particles ───
function particlePool(level) {
  const pool = [];
  for (const q of PARTICLE_QUESTIONS[level] || []) {
    pool.push({ before: fromBraces(q.b), after: fromBraces(q.a), choices: q.c, en: q.en, why: fromBraces(q.x[0]) });
  }
  for (const q of VERB_PARTICLE_ITEMS.filter((q) => q.level === level)) {
    pool.push({ before: fromHtml(q.beforeHtml), after: fromHtml(q.afterHtml), choices: [q.particle, ...q.wrong], en: q.en, why: q.note.why });
  }
  for (const q of PARTICLE_QUIZ_ITEMS.filter((q) => q.level === level && q.wrong)) {
    pool.push({ before: fromHtml(q.beforeHtml), after: fromHtml(q.afterHtml), choices: [q.particle, ...q.wrong], en: q.en, why: q.note.why });
  }
  for (const [before, after, choices, why] of EXTRA[level] || []) pool.push({ before, after, choices, why });
  // The same sentence can be in two of the sets.
  const seen = new Set();
  return pool
    .filter((q) => {
      const key = plain(q.before) + "（）" + plain(q.after);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((q) => ({ ...q, answer: q.choices[0] }));
}

function sectionA(level) {
  return spread(particlePool(level), SECTIONS[level].A, `A:${level}`).map((q) => {
    const choices = shuffle(q.choices, `A:${level}:${plain(q.before)}`);
    return { kind: "particle", before: q.before, after: q.after, choices, answer: q.answer, answerIndex: choices.indexOf(q.answer), en: q.en, why: q.why };
  });
}

// ─── B: verb forms ───
// Set phrases (鍵をかける, 持ってくる, 遅くなる) aren't asked.
const PHRASE = /を|が|[てで](くる|いく)$|くなる$/;
// …and a few more that verbs.js still allows these forms for (治れる).
const JUST_HAPPENS = ["治る", "直る", "込む", "似合う"];
const WILLED = ["tai", "mashou", "volitional", "potential", "passive", "causative", "causative-passive", "imperative"];
// Kanji with furigana on the stem: 帰る → 帰[かえ]る.
export function verbRuby(v) {
  const k = v.kanji;
  let i = 0;
  while (i < k.length && i < v.reading.length && k[k.length - 1 - i] === v.reading[v.reading.length - 1 - i]) i++;
  const stem = k.slice(0, k.length - i);
  if (!/[一-鿿々]/.test(stem)) return k;
  // Only simple words: one kanji run followed by kana.
  if (!/^[一-鿿々]+$/.test(stem)) return null;
  return stem + "[" + v.reading.slice(0, v.reading.length - i) + "]" + k.slice(k.length - i);
}

function sectionB(level) {
  const verbs = ALL_VERBS.filter((v) => VERB_LEVELS[level].includes(verbLevel(v)) && verbRuby(v) !== null && !PHRASE.test(v.kanji));
  // Every verb + form pair this level could ask, keyed by form.
  const pairs = [];
  for (const form of FORMS[level]) {
    for (const v of verbs) {
      if (!verbHasForm(v, form)) continue;
      // Things that just happen (疲れる, 見つかる) have no potential; keep
      // them to the plain forms here too: no 疲れたい, 見つかられる.
      if ((!verbHasForm(v, "potential") || JUST_HAPPENS.includes(v.kanji)) && WILLED.includes(form)) continue;
      const kana = Conjugator.conjugate(v, form);
      const kanji = Conjugator.conjugateKanji(v, form) || kana;
      pairs.push({ v, form, answer: form, kana, kanji });
    }
  }
  // One verb at most once per sheet; forms spread evenly.
  const used = new Set();
  const byForm = FORMS[level].map((f) => shuffle(pairs.filter((p) => p.form === f), `B:${level}:${f}`));
  const out = [];
  while (out.length < SECTIONS[level].B) {
    let added = false;
    for (const list of byForm) {
      while (list.length && used.has(list[0].v.kanji)) list.shift();
      if (list.length && out.length < SECTIONS[level].B) {
        const p = list.shift();
        used.add(p.v.kanji);
        out.push(p);
        added = true;
      }
    }
    if (!added) throw new Error(`${level}: not enough verbs for section B`);
  }
  return shuffle(out, `B:${level}:order`).map((p) => ({
    kind: "form",
    verb: verbRuby(p.v),
    meaning: p.v.meaning,
    form: p.form,
    formName: FORM_NAMES[p.form],
    answer: p.kanji,
    kana: p.kana,
    why: formWhy(p.v, p.form),
  }));
}

// ─── why: the rule each verb answer follows ───
const I_E_ROW = /[いきぎしじちぢにひびぴみりえけげせぜてでねへべぺめれ]る$/;
const TE_RULE = { う: "う → って", つ: "つ → って", る: "る → って", む: "む → んで", ぶ: "ぶ → んで", ぬ: "ぬ → んで", く: "く → いて", ぐ: "ぐ → いで", す: "す → して" };

// Which kind of verb, and what's tricky about it.
function verbKind(v) {
  if (v.type === "irregular") {
    if (v.reading.endsWith("する")) return v.reading === "する" ? "する is irregular" : "a する-verb (conjugates like する)";
    if (v.reading.endsWith("くる")) return "来る is irregular";
    return "irregular";
  }
  if (v.type === "ru") return "る-verb";
  return I_E_ROW.test(v.reading) ? "う-verb, though it looks like a る-verb" : "う-verb";
}

export function formWhy(v, form) {
  const kind = verbKind(v);
  const isRu = v.type === "ru";
  const suru = v.type === "irregular" && v.reading.endsWith("する");
  const kuru = v.type === "irregular" && v.reading.endsWith("くる");
  const end = v.reading.slice(-1);
  const iku = v.reading.endsWith("いく");
  const honor = ["いらっしゃる", "おっしゃる", "くださる", "なさる", "ござる"].some((h) => v.reading.endsWith(h));
  const iStem = isRu ? "drop る" : suru ? "する → し" : kuru ? "来る → 来(き)" : honor ? "る → い (honorific verbs)" : "last sound to the い-row";
  const te = isRu ? "drop る, add て" : suru ? "して" : kuru ? "来(き)て" : iku ? "行く is the exception: 行って" : TE_RULE[end];
  const ta = te.replace(/て/g, "た").replace(/で$/, "だ");
  const nai = isRu ? "drop る, add ない" : suru ? "しない" : kuru ? "来(こ)ない" : v.reading === "ある" ? "ある → ない (exception)" : end === "う" ? "う → わ + ない" : "last sound to the あ-row + ない";
  const R = {
    masu: `${kind}: ${iStem} + ます.`,
    "masu-neg": `${kind}: ${iStem} + ません.`,
    "masu-past": `${kind}: ${iStem} + ました.`,
    "masu-past-neg": `${kind}: ${iStem} + ませんでした.`,
    mashou: `${kind}: ${iStem} + ましょう.`,
    tai: `${kind}: ${iStem} + たい.`,
    te: `${kind}: ${te}.`,
    ta: `${kind}: as the て-form, with た: ${ta}.`,
    nai: `${kind}: ${nai}.`,
    nakatta: `${kind}: ${nai}, then ない → なかった.`,
    potential: isRu ? `る-verb: drop る + られる.` : suru ? "する → できる." : kuru ? "来る → 来(こ)られる." : `${kind}: last sound to the え-row + る.`,
    volitional: isRu ? "る-verb: drop る + よう." : suru ? "する → しよう." : kuru ? "来る → 来(こ)よう." : `${kind}: last sound to the お-row + う.`,
    ba: isRu ? "る-verb: drop る + れば." : suru ? "する → すれば." : kuru ? "来る → 来(く)れば." : `${kind}: last sound to the え-row + ば.`,
    tara: `た-form + ら (${kind}: ${ta}).`,
    passive: isRu ? "る-verb: drop る + られる." : suru ? "する → される." : kuru ? "来る → 来(こ)られる." : `${kind}: ${end === "う" ? "う → わ" : "last sound to the あ-row"} + れる.`,
    causative: isRu ? "る-verb: drop る + させる." : suru ? "する → させる." : kuru ? "来る → 来(こ)させる." : `${kind}: ${end === "う" ? "う → わ" : "last sound to the あ-row"} + せる.`,
    "causative-passive": isRu ? "る-verb: drop る + させられる." : suru ? "する → させられる." : kuru ? "来る → 来(こ)させられる." : `${kind}: ${end === "う" ? "う → わ" : "あ-row"} + せられる${end === "す" ? "" : " (spoken also 〜される)"}.`,
    imperative: isRu ? "る-verb: drop る + ろ." : suru ? "する → しろ." : kuru ? "来る → 来(こ)い." : honor ? "honorific verbs: る → い." : `${kind}: last sound to the え-row.`,
    nakereba: `${kind}: ${nai}, then ない → なければ.`,
    zu: suru ? "する → せず (not しず)." : `${kind}: the ない-form without ない, + ず${kuru ? " (来(こ)ず)" : ""}.`,
    chau: `て-form (${te}), then て → ちゃう / で → じゃう.`,
  };
  return R[form];
}

export function groupWhy(v) {
  if (v.type === "irregular") return v.reading === "する" || v.reading === "くる" ? "one of the two irregular verbs (する, 来る)." : "noun + する conjugates like する.";
  if (v.type === "ru") return `ends in -${I_E_ROW.test(v.reading) ? "iる / -eる" : "る"} and is a る-verb: ${Conjugator.conjugate(v, "masu")}, ${Conjugator.conjugate(v, "te")}.`;
  if (I_E_ROW.test(v.reading)) return `looks like a る-verb, but is one of the う-verb exceptions: ${Conjugator.conjugate(v, "masu")}, ${Conjugator.conjugate(v, "te")}.`;
  return v.reading.endsWith("る") ? `ends in -aる / -uる / -oる, so a う-verb: ${Conjugator.conjugate(v, "masu")}.` : `doesn’t end in る, so a う-verb: ${Conjugator.conjugate(v, "masu")}.`;
}

// ─── C ───
export function verbGroup(v) {
  return v.type === "irregular" ? "irregular" : v.type === "ru" ? "る-verb" : "う-verb";
}

function sectionC_groups(level) {
  const verbs = ALL_VERBS.filter((v) => verbLevel(v) === level && verbRuby(v) !== null && !v.kanji.includes(" "));
  const tricky = verbs.filter((v) => v.type === "u" && I_E_ROW.test(v.reading));
  const ru = verbs.filter((v) => v.type === "ru");
  const other = verbs.filter((v) => v.type === "irregular" || (v.type === "u" && !I_E_ROW.test(v.reading)));
  const n = SECTIONS[level].C;
  const pick = [
    ...shuffle(tricky, "C:tricky").slice(0, Math.round(n * 0.45)),
    ...shuffle(ru, "C:ru").slice(0, Math.round(n * 0.35)),
  ];
  pick.push(...shuffle(other, "C:other").slice(0, n - pick.length));
  return shuffle(pick, "C:order").map((v) => ({ kind: "group", verb: verbRuby(v), meaning: v.meaning, answer: verbGroup(v), why: groupWhy(v) }));
}

// Every pair sentence, in the data's order (easier pairs first).
function pairSentences() {
  const out = [];
  for (const g of VERB_TRANSITIVITY.groups) {
    for (const p of g.pairs) {
      for (const side of ["vi", "vt"]) {
        const [jp, en, why] = p.ex[side];
        const m = jp.match(/^(.*)\{(が|を)\}(.*)$/);
        out.push({ pair: p.vi + "・" + p.vt, before: m[1], after: m[3], answer: m[2], en, why });
      }
    }
  }
  return out;
}

function sectionC_pairs(level) {
  const all = pairSentences();
  // N4 takes the first pairs, N3 the last ones.
  const n4 = all.slice(0, SECTIONS.N4.C);
  const n3 = all.slice(all.length - SECTIONS.N3.C);
  if (SECTIONS.N4.C + SECTIONS.N3.C > all.length) throw new Error("not enough pair sentences");
  return shuffle(level === "N4" ? n4 : n3, `C:${level}`).map((q) => ({ kind: "pair", ...q, choices: ["が", "を"] }));
}

export function buildLevel(level) {
  return {
    level,
    A: sectionA(level),
    B: sectionB(level),
    C: level === "N5" ? sectionC_groups(level) : sectionC_pairs(level),
  };
}
