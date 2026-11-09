#!/usr/bin/env node
// Writes vocab-kanji-data.js, the kanji questions of the JLPT Questions page
// (vocab-questions.html), four choices each, as in the exam:
//
//   Kanji reading (漢字読み): the word underlined in kanji, pick its reading,
//     out of other words of the same kind in the same form (楽しかった:
//     たのしかった · うれしかった · いそがしかった · はずかしかった), or
//     out of sound-alikes (がいこく · がいごく · がいこっく · がいごっく).
//   Kanji writing (表記): the word underlined in hiragana, pick how it's
//     written (映画 · 央画 · 映面 · 央面; 泳いで · 海いで · 港いで · 注いで).
//
//   npm install --no-save kuromoji kanji
//   node scripts/build_vocab_kanji.mjs
//
// The sentences are Tokidoki's own (scripts/guess_examples.tsv, through
// scripts/vocab_questions.mjs): each level's words written only with kanji
// of that level or below, the word underlined.
//
// Wrong choices, like the exam's, change one or two parts of the answer:
//
//   Writing swaps a kanji for one that looks like it, from Kanjium's
//   look-alike lists (github.com/mifunetoshiro/kanjium, CC BY-SA 4.0), our
//   confusable kanji groups, or KanjiVG's component trees
//   (kanjivg.tagaini.net, CC BY-SA 3.0) — the same radical in the same
//   place (泳 → 海 港 注), the same other half (映 → 英), or the part
//   itself (映 → 央). Both come in the `kanji` npm package (only its data
//   files are read). Two kanji: the exam's two-by-two (映画, 央画, 映面,
//   央面); one kanji: three others.
//   Reading changes the sounds learners mix up: voicing (こ / ご), long
//   vowels (こ / こう, せ / せい), small っ, small ゃゅょ, a final ん, or
//   another reading of the kanji. Two-by-two again, over two kanji's
//   readings.
//
// A wrong choice is never a real spelling or reading of the word: not in
// the word lists with that reading (会う / 合う), not what kuromoji's
// dictionary has for it.
import { createRequire } from "node:module";
import { writeFileSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WORDS, LEVELS, isKanji, hash, knownKanji, orderedTargets, markup, wordTokens, verbType, conjugateVerb } from "./vocab_questions.mjs";

const require = createRequire(import.meta.url);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
globalThis.window = globalThis;
require("../kanji-quiz-data.js");
require("../kanji-info-data.js");
require("../confusable-kanji-data.js");
require("../vocabulary-data.js");

// ─── Kana ────────────────────────────────────────────────────────────────────

const VOICE = { か: "が", き: "ぎ", く: "ぐ", け: "げ", こ: "ご", さ: "ざ", し: "じ", す: "ず", せ: "ぜ", そ: "ぞ", た: "だ", ち: "ぢ", つ: "づ", て: "で", と: "ど", は: "ば", ひ: "び", ふ: "ぶ", へ: "べ", ほ: "ぼ" };
const UNVOICE = Object.fromEntries(Object.entries(VOICE).map(([a, b]) => [b, a]));
for (const [a, b] of [["ぱ", "は"], ["ぴ", "ひ"], ["ぷ", "ふ"], ["ぺ", "へ"], ["ぽ", "ほ"]]) UNVOICE[a] = b;
const O_ROW = "おこごそぞとどのほぼぽもよろょ";
const U_ROW = "うくぐすずつづぬふぶぷむゆるゅ";
const E_ROW = "えけげせぜてでねへべぺめれ";
const I_ROW = "きぎしじちぢにひびぴみり";
const SMALL = { ゃ: "や", ゅ: "ゆ", ょ: "よ" };
const BEFORE_TSU = "かきくけこさしすせそたちつてとぱぴぷぺぽ";
const kata2hira = (s) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

// Is s a reading a Japanese word could have? (No っ before a vowel or at
// the end, no small ゃ after anything but an i-sound, no word starting with
// ん / っ / a small kana.)
function wellFormed(s) {
  if (!s || /^[んっゃゅょー]/.test(s) || /っ$/.test(s) || /っ[^かきくけこさしすせそたちつてとぱぴぷぺぽがぎぐげござじずぜぞだでどばびぶべぼ]/.test(s)) return false;
  if (/[^きぎしじちぢにひびぴみり][ゃゅょ]/.test(s)) return false;
  if (/(.)\1\1/.test(s) || /ぢ|づ/.test(s)) return false;
  return true;
}

// Each kanji's readings (kanji-quiz-data.js, N5 to N1): on'yomi in
// hiragana, kun'yomi without okurigana (やす.む → やす).
const KANJI_READINGS = new Map();
for (const k of Object.values(globalThis.KANJI_QUIZ_DATA).flat()) {
  const split = (r) => (r || "").split("・").filter(Boolean);
  KANJI_READINGS.set(k.kanji, {
    on: split(k.on).map(kata2hira),
    kun: [...new Set(split(k.kun).map((r) => r.split(".")[0].replace(/-/g, "")))].filter(Boolean),
  });
}

// How often each kanji is read each way in the JLPT word lists' words
// (guess-words-data.js's kanji-by-kanji split: "会:あ 社:しゃ").
const USED = new Map();
for (const w of WORDS) {
  for (const piece of w[4].split(" ")) {
    const [k, r] = piece.split(":");
    if (!k || !r || [...k].length !== 1) continue;
    if (!USED.has(k)) USED.set(k, new Map());
    USED.get(k).set(r, (USED.get(k).get(r) || 0) + 1);
  }
}

// The readings a learner could mistake for this one: the ones the word
// lists use most, then the kanji's first on'yomi.
function otherReadings(kanji) {
  const used = [...(USED.get(kanji) || new Map())].sort((a, b) => b[1] - a[1]).map(([r]) => r);
  const r = KANJI_READINGS.get(kanji);
  return [...new Set([...used.slice(0, 4), ...(r ? r.on.slice(0, 1) : [])])];
}

// Is s (the kana over one kanji) one of its on'yomi, maybe voiced
// (会社 がいしゃ) or with a final っ (学校 がっこう)?
function isOnReading(kanji, s) {
  const r = KANJI_READINGS.get(kanji);
  if (!r) return false;
  return r.on.some((on) => {
    const voiced = (VOICE[on[0]] || on[0]) + on.slice(1);
    return [on, voiced].some((x) => x === s || (s.endsWith("っ") && "つくちき".includes(x.slice(-1)) && x.slice(0, -1) + "っ" === s));
  });
}

// soundTweaks, and when that gives few, the voicing of those (車: ぐるま,
// しゃ, then じゃ).
function moreTweaks(s, kanji, next) {
  const first = soundTweaks(s, kanji, next);
  if (first.length >= 4) return first;
  const seen = new Set([s, ...first.map((t) => t.kana)]);
  const second = first.flatMap((t) => soundTweaks(t.kana, "", next).filter((u) => u.type === "voice"))
    .filter((u) => !seen.has(u.kana) && seen.add(u.kana))
    .map((u) => ({ kana: u.kana, type: "n" }));
  return [...first, ...second];
}

const swapAt = (chars, i, c) => chars.slice(0, i).join("") + c + chars.slice(i + 1).join("");

// The readings learners mix up with s, the kana over one kanji (or a word
// written as one ruby, 今日): [{ kana, type }]. next is the kana after it.
// Voicing anywhere; the rest, as in the exam, only in on'yomi: long vowels
// (こ / こう, せ / せい), a final ん, small ゃゅょ, and っ where the next
// sound allows it (がく / がっ before こう).
function soundTweaks(s, kanji, next) {
  const out = [];
  const add = (kana, type) => out.push({ kana, type });
  const chars = [...s];
  chars.forEach((c, i) => {
    const swap = VOICE[c] || UNVOICE[c];
    if (swap) add(swapAt(chars, i, swap), "voice");
  });
  const on = kanji.length === 1 && isOnReading(kanji, s);
  if (on) {
    const last = chars[chars.length - 1];
    const prev = chars[chars.length - 2];
    if (last === "う" && prev && (O_ROW + U_ROW).includes(prev)) add(s.slice(0, -1), "long");
    // (Not after く / つ: 学, 物 are never long.)
    else if ((O_ROW + U_ROW).includes(last) && !"くつ".includes(last)) add(s + "う", "long");
    if (last === "い" && prev && E_ROW.includes(prev)) add(s.slice(0, -1), "long");
    else if (E_ROW.includes(last)) add(s + "い", "long");
    if (last === "っ") for (const c of "くつ") add(s.slice(0, -1) + c, "tsu");
    else if ("つく".includes(last) && chars.length >= 2 && next && BEFORE_TSU.includes(next)) add(s.slice(0, -1) + "っ", "tsu");
    chars.forEach((c, i) => {
      if (SMALL[c]) add(swapAt(chars, i, SMALL[c]), "small");
      if (SMALL[c]) for (const o of "ゃゅょ") if (o !== c) add(swapAt(chars, i, o), "small");
    });
    if (last === "ん" && chars.length > 1) add(s.slice(0, -1), "n");
    else if (chars.length === 2 && !"ういっ".includes(last)) add(s + "ん", "n");
  }
  // Another reading of the same kanji (生: せい / しょう; 木: き / もく).
  for (const x of otherReadings(kanji)) if (Math.abs(x.length - s.length) <= 1) add(x, "other");
  const seen = new Set([s]);
  return out.filter((t) => wellFormed(t.kana) && !seen.has(t.kana) && seen.add(t.kana));
}

// ─── Kanji that look alike ────────────────────────────────────────────────

const DATA = process.env.KANJI_DATA || path.join(ROOT, "node_modules/kanji/dist/data");
const LOOKALIKE = JSON.parse(readFileSync(path.join(DATA, "kanjium/kanjium-lookalikes.json"), "utf8"));
const TREE_DIR = path.join(DATA, "kanji-tree");
const TREE_FILES = new Set(readdirSync(TREE_DIR));
function tree(ch) {
  const f = ch.codePointAt(0).toString(16).padStart(5, "0") + ".json";
  return TREE_FILES.has(f) ? JSON.parse(readFileSync(path.join(TREE_DIR, f), "utf8")) : null;
}

// The kanji wrong choices come from: N5 to N2.
const LEVEL_OF = new Map();
for (const l of ["n5", "n4", "n3", "n2"]) for (const k of globalThis.KANJI_QUIZ_DATA[l]) LEVEL_OF.set(k.kanji, l);
const POOL = [...LEVEL_OF.keys()];

// A kanji's parts: the top level (氵 永 for 泳, with their places) and every
// part below.
const PARTS = new Map();
function parts(ch) {
  if (PARTS.has(ch)) return PARTS.get(ch);
  const t = tree(ch);
  const top = (t && t.g ? t.g : []).map((g) => g.element).filter(Boolean);
  const all = new Set();
  const walk = (n) => { for (const g of n.g || []) { if (g.element) all.add(g.element); walk(g); } };
  if (t) walk(t);
  const p = { top, all };
  PARTS.set(ch, p);
  return p;
}

const GROUP_OF = new Map();
globalThis.CONFUSABLE_KANJI_GROUPS.forEach((g, i) => g.kanji.forEach((k) => GROUP_OF.set(k, i)));

// Simple kanji the component trees say little about (日 has no parts), with
// the look-alikes the exam would use for them; picked by hand.
const SIMPLE_LIKE = new Map(`
  日目白田旧 月用円肉 木本未末 本木未体 川州小山 二三工土 三二王工 十千土干 千十干午
  心必思忍 火大犬灯 口日目回 女安好母 母毎毒海 父文交欠 西四両酉 南商両角 来米未末
  左右石在 右左石名 高京商古 長表良帳 前削首刷 白自日百 食飲良養 赤走去示 後役得待
  事争書車 別列利則 電雷雪雲 北比化背 上止土占 下不丁干 人入八大 大犬太天 入人八込
  八人入穴 小少水心 見貝兄児 金全余会 生主牛王 水氷永求 五互吾王 半平羊午 年午平干
  雨両雪画 万方力刀 毎母海梅 気汽史文 工土士江 足定走促 考老者孝 中申虫史 山出岩仙
  子字了予 円丹内用 何伺河荷 天夫大未 先失生光 九丸力乙 四西匹囲 六穴文市 七匕化切
  分今公穴 今令合会 外夕処多 名各多石 国囲固困 学字覚栄 校交枝較 社祖神視 車東軍庫
  語話読誤 話語活舌 読続語売 書昼画事 休体木本 立位竜音 早旱草卓 花化茶苦 草早花荒
  手毛年失 目日自貝 耳取恥身 犬大太丈 魚漁魯黒 鳥島烏馬 牛午半生 馬鳥駅島 毛手尾宅
  門問間開 間問聞関 聞問間開 同向司何 店広庄座 道遊進首 週周過遇 新親雑断 古早占右
  元先完兄 兄元見況 弟第弗弱 妹姉味末 姉妹市肺 安女宇案 正止定整 少小歩劣 多夕名移
  東車東凍 東車束東 京高涼景 町田丁庁 村材林木 林森木村 森林木禁 石右岩名 空究穴突
  青晴清情 晴青清晶 雪雨雷電 雲電雪曇 春秋泰奏 夏夕憂冬 秋春私科 冬各終夕 朝潮期幹
  昼書画尽 夜液校夏 今会令合 午牛干年 毎海母梅 週過道遇
`.trim().split(/\s+/).map((g) => [g[0], [...g.slice(1)].filter((c) => c !== g[0])]));

// How much c looks like k (0: not at all).
function likeness(k, c) {
  let s = 0;
  if ((SIMPLE_LIKE.get(k) || []).includes(c)) s += 12;
  if ((LOOKALIKE[k] || []).includes(c) || (LOOKALIKE[c] || []).includes(k)) s += 10;
  if (GROUP_OF.has(k) && GROUP_OF.get(k) === GROUP_OF.get(c)) s += 6;
  const pk = parts(k), pc = parts(c);
  if (pk.top.length > 1 && pk.top.includes(c)) s += 6; // 映 → 央
  if (pc.top.length > 1 && pc.top.includes(k)) s += 4; // 央 → 映
  if (pk.top.length > 1 && pk.top.length === pc.top.length) {
    pk.top.forEach((part, i) => { if (pc.top[i] === part) s += 5; }); // 泳 → 海 (氵 on the left)
  }
  for (const part of pk.all) if (pc.all.has(part) && !pk.top.includes(part)) s += 1;
  return s;
}

const LIKE = new Map();
function lookalikes(k) {
  if (!LIKE.has(k)) {
    LIKE.set(k, [...new Set([...POOL, ...(SIMPLE_LIKE.get(k) || [])])].filter((c) => c !== k)
      .map((c) => ({ c, s: likeness(k, c) }))
      .filter((x) => x.s >= 5)
      // A kanji with no parts (日, 口, 一) only if it's listed as a look-alike.
      .filter((x) => parts(x.c).all.size || x.s >= 10)
      .sort((a, b) => b.s - a.s || hash(k + a.c) - hash(k + b.c))
      .map((x) => x.c));
  }
  return LIKE.get(k);
}

// ─── Real words ──────────────────────────────────────────────────────────────

const LISTED = new Map(); // written form → Set of readings
const listWord = (w, r) => { if (!LISTED.has(w)) LISTED.set(w, new Set()); LISTED.get(w).add(r); };
for (const w of WORDS) listWord(w[0], w[1]);
for (const level of Object.values(globalThis.VOCAB_DATA)) for (const e of level) listWord(e.kanji, e.kana);

let tokenizer;
// kuromoji's readings of a whole written word (if it knows it as one word).
function dictReadings(written) {
  const toks = tokenizer.tokenize(written);
  if (toks.length !== 1 || toks[0].word_type !== "KNOWN" || !toks[0].reading) return [];
  return [kata2hira(toks[0].reading)];
}
const isRealSpelling = (written, kana) => (LISTED.get(written) || new Set()).has(kana) || dictReadings(written).includes(kana);

// ─── Questions ───────────────────────────────────────────────────────────────

// Word w's question at this level: the sentence around the target, the
// target as markup, and what's needed for both kinds.
function base(level) {
  const known = knownKanji(level);
  return orderedTargets(level)
    .filter((c) => [...c.target.text].every((ch) => !isKanji(ch) || known.has(ch)))
    // 達 in 達して reads たっ: half a word, not a question.
    .filter((c) => !c.target.reading.endsWith("っ"))
    .map((c) => ({
      w: c.w,
      tokens: c.tokens.slice(c.target.start, c.target.end),
      b: markup(c.tokens.slice(0, c.target.start)),
      t: markup(c.tokens.slice(c.target.start, c.target.end)),
      a: markup(c.tokens.slice(c.target.end)),
      text: c.target.text,
      reading: c.target.reading,
      full: c.target.full,
    }));
}

// The exam's two-by-two: answer, first part changed, second changed, both.
function twoByTwo(slots, make) {
  // slots: [{ at, options: [...] }] — at most two used.
  if (slots.length >= 2) {
    const [x, y] = slots;
    for (const ox of x.options) {
      for (const oy of y.options) {
        const c = [make([[x.at, ox]]), make([[y.at, oy]]), make([[x.at, ox], [y.at, oy]])];
        if (c.every(Boolean) && new Set(c).size === 3) return c;
      }
    }
    return null;
  }
  if (slots.length === 1) {
    const c = [];
    for (const o of slots[0].options) {
      const v = make([[slots[0].at, o]]);
      if (v && !c.includes(v)) c.push(v);
      if (c.length === 3) return c;
    }
  }
  return null;
}

// Pick two slots (the ones with the most options), in their order in the word.
const bestTwo = (slots, salt) => slots
  .filter((s) => s.options.length)
  .sort((a, b) => b.options.length - a.options.length || hash(salt + a.at) - hash(salt + b.at))
  .slice(0, 2)
  .sort((a, b) => a.at - b.at);

function writing(q) {
  const w = q.w;
  const chars = [...q.text];
  const word = [...w[0]];
  const slots = chars.map((ch, at) => ({ at, options: isKanji(ch) ? lookalikes(ch).filter((c) => !chars.includes(c)) : [] }));
  const make = (subs) => {
    const t = chars.slice(), b = word.slice();
    for (const [at, c] of subs) { t[at] = c; b[at] = c; }
    const baseWord = b.join("");
    if (isRealSpelling(baseWord, w[1]) || isRealSpelling(t.join(""), q.reading)) return null;
    return t.join("");
  };
  const picked = slots.filter((s) => s.options.length).length >= 2 ? bestTwo(slots, w[0]) : slots.filter((s) => s.options.length);
  const wrong = twoByTwo(picked, make);
  if (!wrong && process.env.DEBUG) console.log("✗", q.t, JSON.stringify(slots.filter((s) => isKanji(chars[s.at])).map((s) => [chars[s.at], s.options.slice(0, 6).join("")])));
  return wrong && [q.text, ...wrong];
}

function readingQ(q) {
  const w = q.w;
  // The kana of each ruby (one kanji, or a whole word like 今日), and where
  // it starts in the target's reading.
  // A ruby over several kanji (電話|でんわ) is split by the word's own
  // kanji-by-kanji reading where that spells it (電|でん 話|わ).
  const split = wordTokens(w) || [];
  const pieces = (t) => {
    if ([...t.text].length < 2) return [t];
    for (let i = 0; i < split.length; i++) {
      let text = "", kana = "", j = i;
      while (j < split.length && text.length < t.text.length) { text += split[j].text; kana += split[j].kana || split[j].text; j++; }
      if (text === t.text && kana === t.kana && split.slice(i, j).every((x) => x.kana)) return split.slice(i, j);
    }
    return [t];
  };
  const segs = [];
  let pos = 0;
  for (const t of q.tokens.flatMap((t) => (t.kana ? pieces(t) : [t]))) {
    const kana = t.kana || t.text;
    if (t.kana) segs.push({ at: segs.length, start: pos, kana, kanji: t.text });
    pos += kana.length;
  }
  // Changes only where the target's reading and the word's agree (not in
  // okurigana that conjugates), so the word's own reading can be checked.
  let common = 0;
  while (common < q.reading.length && q.reading[common] === w[1][common]) common++;
  const usable = segs.filter((s) => s.start + s.kana.length <= common);
  const ORDER = ["voice", "long", "tsu", "small", "other", "n"];
  const slots = usable.map((s) => ({
    at: s.at,
    seg: s,
    options: moreTweaks(s.kana, s.kanji, q.reading[s.start + s.kana.length])
      .sort((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type) || hash(w[0] + a.kana) - hash(w[0] + b.kana))
      .map((t) => t.kana),
  }));
  const bySeg = new Map(segs.map((s) => [s.at, s]));
  const make = (subs) => {
    let r = q.reading, b = w[1];
    // Right to left, so earlier positions stay put.
    for (const [at, kana] of subs.slice().sort((x, y) => y[0] - x[0])) {
      const s = bySeg.get(at);
      r = r.slice(0, s.start) + kana + r.slice(s.start + s.kana.length);
      b = b.slice(0, s.start) + kana + b.slice(s.start + s.kana.length);
    }
    if (!wellFormed(r) || r === q.reading) return null;
    if (isRealSpelling(w[0], b)) return null;
    for (const [written, readings] of LISTED) if (written === w[0] && readings.has(b)) return null;
    return r;
  };
  const picked = slots.filter((s) => s.options.length).length >= 2 ? bestTwo(slots, w[0]) : slots.filter((s) => s.options.length);
  const wrong = twoByTwo(picked, make);
  if (!wrong && process.env.DEBUG) console.log("✗", q.t, JSON.stringify(slots.map((s) => [s.seg.kanji, s.seg.kana, s.options])));
  return wrong && [q.reading, ...wrong];
}

// ─── Reading, other words as the wrong choices ────────────────────────────

// The kind of word, as far as the wrong choices go.
const wordClass = (w) => {
  const pos = w[7] || "";
  if (/^(expression · )?verb/.test(pos) && w[0] !== "来る") return "verb";
  if (/い-adjective/.test(pos)) return "i-adj";
  if (/な-adjective/.test(pos)) return "na-adj";
  if (/number|counter/.test(pos)) return "number";
  if (/adverb/.test(pos) && !/noun/.test(pos)) return "adverb";
  return "noun";
};

// How the target spells word w: { form } — "full" (as listed), a verb's
// "te" / "ta" / "i" (ます stem) / "a" (ない stem), or an い-adjective's
// ending ("かった", "くて", "く") — or null.
function formOf(q) {
  const w = q.w;
  if (q.full) return { form: "full" };
  const cls = wordClass(w);
  if (cls === "verb") {
    const type = verbType(w[0], w[1]);
    if (!type) return null;
    for (const form of ["te", "ta", "i", "a"]) if (conjugateVerb(w[0], type, form, w[0]) === q.text) return { form };
    return null;
  }
  if (cls === "i-adj" && w[0].endsWith("い")) {
    const ext = q.text.slice(w[0].length - 1);
    return ["かった", "くて", "く"].includes(ext) ? { form: ext } : null;
  }
  return null;
}

// Word d's reading in that form, or null.
function inForm(d, form) {
  if (form === "full") return d[1];
  if (["かった", "くて", "く"].includes(form)) return d[1].endsWith("い") && d[1] !== "いい" ? d[1].slice(0, -1) + form : null;
  const type = verbType(d[0], d[1]);
  return type ? conjugateVerb(d[1], type, form, d[0]) : null;
}

const LEVEL_RANK = { N5: 0, N4: 1, N3: 2 };
// Never a wrong choice: words a learner shouldn't run into as a distractor.
const AVOID = new Set(["自殺", "殺人", "殺す", "死亡", "死"]);

// The exam's other kind of reading question: the wrong choices are other
// words of the same kind, in the same form, that the learner knows (this
// level or below): 楽しかった — うれしかった · いそがしかった ·
// はずかしかった; 習って — かよって · まって · のこって. Words that end the
// same way (しい, って) and are about as long come first.
// Returns [[kana, word, reading, meaning]…], the answer first, or null.
function wordsQ(q, level) {
  const w = q.w;
  const use = formOf(q);
  if (!use) return null;
  const cls = wordClass(w);
  const taken = new Set([q.reading, w[1]]);
  const tail = (r) => r.slice(-2);
  const wrong = WORDS
    .filter((d) => d !== w && d[0] !== w[0] && !AVOID.has(d[0]) && LEVEL_RANK[d[3]] <= LEVEL_RANK[level] && wordClass(d) === cls)
    // Not another word written with the same kanji (上手 / 上).
    .filter((d) => ![...d[0]].some((ch) => isKanji(ch) && w[0].includes(ch)))
    .map((d) => ({ d, kana: inForm(d, use.form) }))
    .filter((x) => x.kana && wellFormed(x.kana) && !isRealSpelling(w[0], x.d[1]) && !(LISTED.get(w[0]) || new Set()).has(x.d[1]))
    .map((x) => ({
      ...x,
      score: Math.abs(x.kana.length - q.reading.length) + (tail(x.kana) === tail(q.reading) ? 0 : 2) +
        (tail(x.d[1]) === tail(w[1]) ? 0 : 1) + (x.d[3] === level ? 0 : 1),
    }))
    .sort((a, b) => a.score - b.score || hash(w[0] + a.d[0]) - hash(w[0] + b.d[0]))
    .filter((x) => !taken.has(x.kana) && !taken.has(x.d[1]) && taken.add(x.kana) && taken.add(x.d[1]))
    .slice(0, 3);
  if (wrong.length < 3) return null;
  return [[q.reading, w[0], w[1], w[2]], ...wrong.map((x) => [x.kana, x.d[0], x.d[1], x.d[2]])];
}

// Per level, one entry per word with either kind of question:
// { w, k, m, en, b, t, a, r: [reading choices] | null, x: [written choices] | null,
//   v: [[kana, word, reading, meaning]…] (reading, other words) | null }.
export function kanjiData() {
  const out = {};
  for (const level of LEVELS) {
    out[level] = base(level)
      .map((q) => ({ q, r: readingQ(q), x: writing(q), v: wordsQ(q, level) }))
      .filter(({ r, x, v }) => r || x || v)
      .map(({ q, r, x, v }) => ({ w: q.w[0], k: q.w[1], m: q.w[2], en: q.w[9], b: q.b, t: q.t, a: q.a, r, x, v }));
  }
  return out;
}

function file(data) {
  const levels = LEVELS.map((level) =>
    `    ${level}: [\n${data[level].map((q) => `      ${JSON.stringify(q)},`).join("\n")}\n    ],`).join("\n");
  return `(function (global) {
  'use strict';

  // Generated by scripts/build_vocab_kanji.mjs — do not hand-edit.
  //
  // Kanji reading (漢字読み) and kanji writing (表記) questions for the JLPT
  // Questions page, per level: w / k / m the word, its reading and meaning,
  // en the sentence in English, b / t / a the sentence before the
  // underlined word, the word and after it (furigana as {漢字|かな}); r the
  // reading question's choices (sound-alikes), v the other reading
  // question's (other words in the same form, [kana, word, reading,
  // meaning]), x the writing question's (the word written four ways), the
  // answer first, or null. The sentences are Tokidoki's own
  // (scripts/guess_examples.tsv); look-alike kanji from Kanjium
  // (CC BY-SA 4.0) and KanjiVG (CC BY-SA 3.0).

  global.VOCAB_KANJI = {
${levels}
  };
})(typeof window !== 'undefined' ? window : globalThis);
`;
}

// The file as the script writes it (test_vocab_questions.js checks that
// vocab-kanji-data.js is up to date).
export async function kanjiFile() {
  const kuromoji = require(path.join(ROOT, "node_modules/kuromoji"));
  tokenizer = await new Promise((resolve, reject) =>
    kuromoji.builder({ dicPath: path.join(ROOT, "node_modules/kuromoji/dict") }).build((err, tk) => (err ? reject(err) : resolve(tk))));
  const data = kanjiData();
  return { data, text: file(data) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { data, text } = await kanjiFile();
  writeFileSync(path.join(ROOT, "vocab-kanji-data.js"), text);
  for (const [kind, f] of [["reading", "r"], ["writing", "x"], ["reading (words)", "v"]]) {
    console.log(`${kind}: ${LEVELS.map((l) => `${l} ${data[l].filter((q) => q[f]).length}`).join(", ")}`);
  }
}
