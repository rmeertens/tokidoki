// JLPT-style vocabulary questions built from Tokidoki's own example
// sentences (guess-words-data.js, from scripts/guess_examples.tsv): the
// sentence each word was written for, with that word underlined (kanji
// reading / writing) or blanked out (fill in the blank, with three wrong
// choices of the same kind and level from other topics).
//
// Shared by scripts/render_vocab_sheets.mjs (the printable sheets) and
// scripts/build_vocab_fill.mjs (vocab-fill-data.js, the practice page).
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
globalThis.window = globalThis;
require("../guess-words-data.js");
require("../kanji-quiz-data.js");
require("../vocab-groups.js");
export const WORDS = globalThis.GUESS_WORDS;
const KANJI = globalThis.KANJI_QUIZ_DATA;

export const LEVELS = ["N5", "N4", "N3"];

export const isKanji = (ch) => /[㐀-鿿々〆ヶ]/.test(ch);
export const isKana = (ch) => /[぀-ヿ]/.test(ch);
const isHiragana = (ch) => /[ぁ-ゖ]/.test(ch || "");

export function hash(s) {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.codePointAt(0), 16777619) >>> 0;
  return h;
}

// The kanji a learner at this level knows (kanji-quiz-data.js, cumulative).
export function knownKanji(level) {
  const upto = { N5: ["n5"], N4: ["n5", "n4"], N3: ["n5", "n4", "n3"] }[level];
  return new Set(upto.flatMap((l) => KANJI[l].map((k) => k.kanji)));
}

// "{駅|えき}で{友達|ともだち}に…" → [{ text, kana }], kana null for plain text,
// plain text split into single characters.
export function parseSentence(s) {
  const tokens = [];
  const re = /\{([^|}]+)\|([^}]+)\}|([^{])/g;
  let m;
  while ((m = re.exec(s))) {
    if (m[3] !== undefined) tokens.push({ text: m[3], kana: null });
    else tokens.push({ text: m[1], kana: m[2] });
  }
  return tokens;
}

export const markup = (tokens) => tokens.map((t) => (t.kana ? `{${t.text}|${t.kana}}` : t.text)).join("");
export const reading = (tokens) => tokens.map((t) => t.kana || t.text).join("");

// The run of tokens that spells the word (or, for an inflected verb or
// adjective, its leading part that still holds all its kanji, with the
// okurigana it takes in this sentence: 通う in 通っています → 通って).
// Returns { start, end, reading, text, full } or null.
export function findTarget(tokens, word, kana) {
  const lastKanji = [...word].reduce((at, ch, i) => (isKanji(ch) ? i : at), -1);
  if (lastKanji < 0) return null;
  const chars = [...word];
  for (let len = chars.length; len > lastKanji; len--) {
    const want = chars.slice(0, len).join("");
    for (let start = 0; start < tokens.length; start++) {
      let text = "";
      let end = start;
      while (end < tokens.length && text.length < want.length) text += tokens[end++].text;
      if (text !== want) continue;
      const span = tokens.slice(start, end);
      if (!span.every((t) => t.kana || isKana(t.text))) continue;
      const r = reading(span);
      // The furigana must agree with the word's own reading.
      if (len === chars.length ? r !== kana : !kana.startsWith(r)) continue;
      const target = { start, end, reading: r, text: want, full: len === chars.length };
      return target.full ? target : extendOkurigana(tokens, target, word, kana);
    }
  }
  return null;
}

const restOf = (tokens, at) => {
  let rest = "";
  for (let i = at; i < tokens.length && !tokens[i].kana && isHiragana(tokens[i].text); i++) rest += tokens[i].text;
  return rest;
};

const TE = "てたでだ";
const I_E_ROW = "いきぎしじちぢにひびぴみりえけげせぜてでねへべぺめれ";
function extendOkurigana(tokens, target, word, kana) {
  const rest = restOf(tokens, target.end);
  let ext = "";
  if (word.endsWith("する")) ext = "";
  else if (word.endsWith("い") && !isKana(target.text.slice(-1))) {
    ext = ["かった", "くて", "く", "い"].find((e) => rest.startsWith(e)) || "";
  } else if (word.endsWith("る") && I_E_ROW.includes(kana.slice(-2, -1)) && !"りっ".includes(rest[0] || "")) {
    // Ichidan (見る, 食べる): the stem doesn't change; 帰る / 入る are godan
    // and show it with り / っ.
    ext = TE.includes(rest[0]) ? rest[0] : "";
  } else if (rest[0] && "っんいし".includes(rest[0]) && rest[1] && TE.includes(rest[1])) {
    ext = rest.slice(0, 2);
  } else if (rest[0] && "あいうえおかきくけこがぎぐげごさしすせそたちつてとなにぬねのばびぶべぼまみむめもらりるれろわ".includes(rest[0])) {
    ext = rest[0];
  }
  return { ...target, end: target.end + ext.length, reading: target.reading + ext, text: target.text + ext };
}

// ─── Conjugation (just what the blanks need) ───────────────────────────────

// U-verbs whose る follows an i- or e-sound.
const GODAN_RU = new Set("帰る 入る 知る 要る 切る 走る 減る 限る 参る 滑る 握る 蹴る 喋る 散る 焦る 茂る 混じる 交じる 遮る 覆る 陥る 照る 練る 湿る 捻る 罵る 煎る 齧る 毟る 漲る 迸る 嘲る 甦る 蘇る 翻る".split(" "));
const ROWS = { う: "わいうえお", く: "かきくけこ", ぐ: "がぎぐげご", す: "さしすせそ", つ: "たちつてと", ぬ: "なにぬねの", ぶ: "ばびぶべぼ", む: "まみむめも", る: "らりるれろ" };
const TE_OF = { う: "って", つ: "って", る: "って", く: "いて", ぐ: "いで", す: "して", ぬ: "んで", ぶ: "んで", む: "んで" };

// "godan", "ichidan" or null (する, 来る and anything else irregular).
export function verbType(word, kana) {
  if (word === "来る" || word.endsWith("する") || kana === "くる") return null;
  const end = kana.slice(-1);
  if (!ROWS[end]) return null;
  if (end !== "る") return "godan";
  if (GODAN_RU.has(word)) return "godan";
  return I_E_ROW.includes(kana.slice(-2, -1)) ? "ichidan" : "godan";
}

// The verb (written form or reading alike: only the end changes) in the
// form: "i" (the ます stem), "a" (the ない stem), "te", "ta".
export function conjugateVerb(s, type, form, word) {
  const head = s.slice(0, -1);
  const end = s.slice(-1);
  if (type === "ichidan") return head + { i: "", a: "", te: "て", ta: "た" }[form];
  if (form === "i") return head + ROWS[end][1];
  if (form === "a") return head + ROWS[end][0];
  let te = TE_OF[end];
  if (word === "行く" || word === "いく") te = "って";
  if (word === "問う") te = "うて";
  return head + (form === "te" ? te : te.replace("て", "た").replace("で", "だ"));
}

const MASU_ENDINGS = ["ませんでした", "ましょう", "ました", "ません", "ます"];
const NAI_ENDINGS = ["なかった", "なくて", "ないで", "ない"];

// How the verb is used in the sentence: { form, ending } or null.
function verbUse(w, tokens, target) {
  const type = verbType(w[0], w[1]);
  if (!type) return null;
  const rest = restOf(tokens, target.end);
  for (const form of ["te", "ta"]) {
    if (conjugateVerb(w[0], type, form, w[0]) === target.text) return { type, form, ending: "" };
  }
  if (conjugateVerb(w[0], type, "i", w[0]) === target.text) {
    const ending = MASU_ENDINGS.find((e) => rest.startsWith(e));
    if (ending) return { type, form: "i", ending };
  }
  if (conjugateVerb(w[0], type, "a", w[0]) === target.text) {
    const ending = NAI_ENDINGS.find((e) => rest.startsWith(e));
    if (ending) return { type, form: "a", ending };
  }
  return null;
}

// ─── Words as markup ─────────────────────────────────────────────────────────

// The word with furigana on each kanji, from its kanji-by-kanji split
// ("会:あ"), or null if the split doesn't spell the reading.
export function wordTokens(w) {
  const pieces = w[4].split(" ").map((p) => p.split(":")[1]);
  const tokens = [];
  let k = 0;
  for (const ch of w[0]) {
    if (isKanji(ch)) {
      if (k >= pieces.length) return null;
      tokens.push({ text: ch, kana: pieces[k++] });
    } else tokens.push({ text: ch, kana: null });
  }
  if (k !== pieces.length || reading(tokens) !== w[1]) {
    // Readings that don't split (今日 きょう): one ruby on the whole word.
    if ([...w[0]].every(isKanji)) return [{ text: w[0], kana: w[1] }];
    return null;
  }
  return tokens;
}

// The word's tokens with its last `drop` characters replaced by `add`.
function respell(tokens, drop, add) {
  const out = tokens.slice(0, tokens.length - drop);
  for (const ch of add) out.push({ text: ch, kana: null });
  return out;
}

// ─── Fill in the blank ─────────────────────────────────────────────────────

const THEME = new Map();
for (const level of Object.values(globalThis.VOCAB_GROUPS)) {
  for (const g of level) for (const key of g.words) THEME.set(key, g.theme);
}
const themeOf = (w) => THEME.get(`${w[0]}|${w[1]}`);

const posClass = (w) => w[7];

// Spellings the list has but learners rarely see; never a wrong choice.
const RARE_SPELLING = new Set(["在る", "有る", "居る", "終る", "為る", "成る", "見える", "下さる"]);

// What goes in the blank for word w: { tokens: [...], kana } in the form
// the question needs, or null if w can't take that form.
function asChoice(w, use) {
  const tokens = wordTokens(w);
  if (!tokens) return null;
  if (use.kind === "word") return { tokens, w };
  if (use.kind === "adj") {
    if (!w[0].endsWith("い") || w[0] === "いい" || /ない$/.test(w[0]) && w[0].length <= 2) return null;
    return { tokens: respell(tokens, 1, use.ext), w };
  }
  const type = verbType(w[0], w[1]);
  if (!type) return null;
  const form = conjugateVerb(w[1], type, use.form, w[0]) + use.ending;
  const drop = 1;
  const add = form.slice(w[1].length - 1);
  return { tokens: respell(tokens, drop, add), w };
}

// One question per word that can be asked this way, in a fixed shuffled
// order: { word, kana, en, before, after, choices: [answer, 3 wrong] },
// each choice [markup, word, kana, meaning].
export function buildFill(level) {
  const pool = WORDS.filter((w) => w[3] === level && w[0] !== "来る");
  const out = [];
  for (const w of pool) {
    const tokens = parseSentence(w[8]);
    const target = findTarget(tokens, w[0], w[1]);
    if (!target) continue;
    let use = null;
    let end = target.end;
    let answer = tokens.slice(target.start, target.end);
    if (target.full && w[7] !== "verb" && w[7] !== "い-adjective") {
      use = { kind: "word", pos: posClass(w) };
    } else if (w[7] === "い-adjective") {
      const ext = target.full ? "い" : target.text.slice(w[0].length - 1);
      if (!["い", "く", "くて", "かった"].includes(ext) || w[0] === "いい") continue;
      use = { kind: "adj", ext, pos: w[7] };
    } else if (w[7] === "verb" && !target.full) {
      const v = verbUse(w, tokens, target);
      if (!v) continue;
      use = { kind: "verb", ...v, pos: "verb" };
      answer = tokens.slice(target.start, target.end + v.ending.length);
      end = target.end + v.ending.length;
    } else continue;
    const answerChoice = { tokens: answer, w };
    const sentenceText = reading(tokens);
    const taken = new Set([w[0], w[1]]);
    const wrong = pool
      .filter((d) => d !== w && !RARE_SPELLING.has(d[0]) && posClass(d) === use.pos && d[0] !== w[0] && d[1] !== w[1])
      .filter((d) => !themeOf(w) || themeOf(d) !== themeOf(w))
      .filter((d) => ![...d[0]].some((ch) => isKanji(ch) && w[0].includes(ch)))
      .map((d) => asChoice(d, use))
      .filter((c) => c && !sentenceText.includes(reading(c.tokens)))
      .map((c) => ({ c, near: Math.abs(c.w[1].length - w[1].length) <= 1 ? 0 : 1, h: hash(w[0] + "|" + c.w[0]) }))
      .sort((a, b) => a.near - b.near || a.h - b.h)
      .map((x) => x.c)
      .filter((c) => !taken.has(c.w[1]) && !taken.has(c.w[0]) && taken.add(c.w[1]) && taken.add(c.w[0]))
      .slice(0, 3);
    if (wrong.length < 3) continue;
    out.push({
      word: w[0],
      kana: w[1],
      en: w[9],
      before: markup(tokens.slice(0, target.start)),
      after: markup(tokens.slice(end)),
      choices: [answerChoice, ...wrong].map((c) => [markup(c.tokens), c.w[0], c.w[1], c.w[2]]),
    });
  }
  return out.sort((a, b) => hash(a.word + a.kana) - hash(b.word + b.kana));
}

// ─── Reading / writing ───────────────────────────────────────────────────────

// Words to underline at this level, in a fixed shuffled order (`salt`
// gives the writing sheets other words than the reading ones): first the
// words written only with kanji of this level or below, as in the exam,
// then the level's other words, which reach for harder kanji. One word per
// set of kanji (青 and 青い: only one of them).
export function orderedTargets(level, salt = "") {
  const known = knownKanji(level);
  const order = (a, b) => hash(salt + a.w[0] + a.w[1]) - hash(salt + b.w[0] + b.w[1]);
  const all = WORDS.filter((w) => w[3] === level)
    // 来る's sentences carry its dictionary reading (来[く]ます), not the
    // conjugated one, so it can't be an answer as is.
    .filter((w) => w[0] !== "来る")
    .map((w) => ({ w, tokens: parseSentence(w[8]) }))
    .map((c) => ({ ...c, target: findTarget(c.tokens, c.w[0], c.w[1]) }))
    .filter((c) => c.target);
  const inLevel = (c) => [...c.target.text].every((ch) => !isKanji(ch) || known.has(ch));
  const seen = new Set();
  const out = [];
  for (const c of [...all.filter(inLevel).sort(order), ...all.filter((c) => !inLevel(c)).sort(order)]) {
    const key = [...c.target.text].filter(isKanji).join("");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

export const pickTargets = (level, count, salt = "") => orderedTargets(level, salt).slice(0, count);

// The fill-in questions checked by hand (scripts/vocab_fill_reviewed.json:
// only one choice fits the sentence), in that order. A word listed twice
// in the vocabulary takes its first sentence.
export function reviewedFill(level) {
  const reviewed = require("./vocab_fill_reviewed.json")[level];
  const all = buildFill(level);
  return reviewed.map((key) => {
    const q = all.find((x) => `${x.word}|${x.kana}` === key);
    if (!q) throw new Error(`${level} ${key}: no longer a fill-in question — check it again`);
    return q;
  });
}
