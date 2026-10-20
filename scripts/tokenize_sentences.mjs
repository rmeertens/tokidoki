#!/usr/bin/env node
// Build sentences-words.js from sentences-data.js: every Sentences-page
// sentence split into words (each linked to a dictionary entry) plus the
// grammar it uses, so the answer side of a sentence card can explain it word
// by word — the same as the Phrases and News pages.
//
// Words come from jp_words.mjs, with sentence_extra_words.json for words the
// site's lists don't have. Grammar comes from the rules in jp_grammar.mjs.
//
// Usage (kuromoji isn't a site dependency, so install it just for this):
//   npm install --no-save kuromoji
//   node scripts/tokenize_sentences.mjs [--misses]
// test_sentences.js fails when the sentences and this file drift apart.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT, createWordFinder, loadSiteData } from './jp_words.mjs';
import { GRAMMAR_EXTRA, detectGrammar } from './jp_grammar.mjs';

const { TRANSLATE_SENTENCES, STORY_GRAMMAR } = loadSiteData(['sentences-data.js', 'stories-data.js', 'mystery-words.js', 'memes-data.js', 'memes-data-2.js']);

const readJson = f => JSON.parse(readFileSync(path.join(ROOT, 'scripts', f), 'utf8'));
const { segment } = await createWordFinder({
  extra: { ...readJson('phrase_extra_words.json'), ...readJson('sentence_extra_words.json') },
  // Words kuromoji misreads in these sentences (いい after と as 言う,
  // かどうか as 銅貨), kept whole.
  whole: [...readJson('phrase_whole_words.json'), '(?<=と)いい', 'かどうか', 'でございます'],
});

// Grammar the Stories notes don't cover, in the same shape.
const GRAMMAR_SENTENCES = {
  'nakute-mo-ii': { level: 'N4', title: '〜なくてもいい — "don\'t have to"', pattern: 'Verb ない-form − い + くても いい', note: 'Says something isn\'t necessary: 来なくてもいい "you don\'t have to come". The opposite of 〜なければいけない.' },
  'mitai': { level: 'N4', title: '〜みたい — "seems / looks like"', pattern: 'Plain form / Noun + みたい(です)', note: 'A guess from what you see or hear: 風邪をひいたみたい "seems to have caught a cold". After a noun it can also mean "like": 歌手みたい "like a singer". Casual next to 〜ようだ.' },
  'te-hoshii': { level: 'N4', title: '〜てほしい — "want (someone) to"', pattern: 'Person に + Verb て-form + ほしい', note: 'Wanting someone else to do something: 父にたばこをやめてほしい "I want my father to quit smoking". 〜ないでほしい: "I don\'t want (them) to".' },
  'naide': { level: 'N4', title: '〜ないで — "without doing"', pattern: 'Verb ない-form + で', note: 'Doing the next thing without doing this one first: 朝ご飯を食べないで来た "came without eating breakfast".' },
  'o-ni-naru': { level: 'N4', title: 'お〜になる — honorific verb', pattern: 'お + verb stem + に なる', note: 'Makes almost any verb respectful when a superior or customer does it: お書きになる "(the teacher) writes", お帰りになる "goes home".' },
  'te-itadakemasen-ka': { level: 'N4', title: '〜ていただけませんか — "could you please"', pattern: 'Verb て-form + いただけませんか', note: 'A very polite request, literally "can\'t I receive the favour of you doing…?": 写真を撮っていただけませんか "could you take a photo?".' },
  'te-yokatta': { level: 'N4', title: '〜てよかった — "I\'m glad that"', pattern: 'Verb て-form + よかった', note: 'Says you\'re glad something happened: 日本に来てよかった "I\'m glad I came to Japan".' },
  'te-sumimasen': { level: 'N4', title: '〜てすみません — "sorry for"', pattern: 'Verb て-form + すみません / ごめん', note: 'Apologises for what you did: 遅れてすみません "sorry I\'m late". For something you didn\'t do: 〜なくてすみません.' },
  'te-kurete-arigatou': { level: 'N4', title: '〜てくれてありがとう — "thanks for"', pattern: 'Verb て-form + くれて ありがとう', note: 'Thanks someone for doing something for you: 手伝ってくれてありがとう "thanks for helping me". Politer: 〜てくださって ありがとうございました.' },
  'koto-ga-dekiru': { level: 'N5', title: '〜ことができる — "can"', pattern: 'Verb dictionary form + ことが できる', note: 'Says you are able to do something: 運転することができる "can drive". Means the same as the potential form, a little more formal.' },
  'no-ga-suki': { level: 'N5', title: '〜のが好き — "like doing"', pattern: 'Verb dictionary form + のが 好き / 上手 / 下手', note: 'の turns the verb into a noun so it can be liked: 料理するのが好き "I like cooking".' },
  'causative-passive': { level: 'N3', title: 'Causative-passive — "be made to"', pattern: 'う-verb: 〜せられる / 〜される, る-verb: 〜させられる', note: 'Being made to do something you didn\'t want to: 野菜を食べさせられた "was made to eat vegetables", 待たされた "was kept waiting". The person who made you is marked with に.' },
  'kadouka': { level: 'N4', title: '〜かどうか — "whether or not"', pattern: 'Plain form + かどうか', note: 'A yes/no question inside a sentence: 来るかどうか分からない "I don\'t know whether (he) will come".' },
  'no-you-na': { level: 'N4', title: '〜のような / 〜のように — "like ~"', pattern: 'Noun + のような + Noun / のようです', note: 'Compares to an example: 母のような料理人 "a cook like my mother", まるでモデルのようです "just like a model".' },
  'tara-dou': { level: 'N4', title: '〜たらどうですか — "why don\'t you"', pattern: 'Verb た-form + ら どうですか', note: 'A suggestion: 先生に相談したらどうですか "why don\'t you talk to the teacher?". Can sound pushy to a superior.' },
  'aida-ni': { level: 'N4', title: '〜間に — "while"', pattern: 'Verb ている / Noun の + 間(に)', note: 'Something happens during a stretch of time: 寝ている間に "while I was asleep". With に it\'s one event during it; without, it lasts the whole time.' },
  'adj-suru': { level: 'N4', title: 'Adjective + する — "make ~"', pattern: 'い-adj 〜く する / な-adj 〜に する', note: 'Changing something on purpose: 部屋をきれいにする "make the room clean", 音を小さくする "turn the sound down". 〜くなる is the change happening by itself.' },
  'mo-emphasis': { level: 'N4', title: 'Number + も — "as many as"', pattern: 'Number + counter + も', note: 'After an amount, も stresses that it\'s a lot: 三時間も "a whole three hours", 五本も "as many as five".' },
  'tagaru': { level: 'N4', title: '〜たがっている — "(someone else) wants to"', pattern: 'Verb ます-stem + たがっている', note: 'You can\'t say 〜たい about other people\'s feelings directly, so for a third person use 〜たがっている: 妹は犬を飼いたがっている "my sister wants to have a dog".' },
  'kenjougo-humble': { level: 'N4', title: 'Humble verbs (謙譲語)', pattern: '行く・来る → 参る, 言う → 申す, いる → おる, する → いたす', note: 'Special verbs that lower yourself (or your family, your company) when speaking to someone you respect: 田中と申します "my name is Tanaka".' },
};
const GRAMMAR = { ...STORY_GRAMMAR, ...GRAMMAR_EXTRA, ...GRAMMAR_SENTENCES };

// Patterns found in the text, as on the News pages. `rx` matches the grammar
// itself; the snippet also takes in the word before it (`back` words,
// default 1). Points the shared rules found in the same stretch (`replaces`)
// are dropped, since they're the same words misread — the が of 〜ほうがいい
// isn't the subject marker. `from` limits a rule to chapters from then on.
const SENTENCE_RULES = [
  { id: 'dewa-arimasen', rx: /(?:では|じゃ)ありません/, replaces: ['wa-topic', 'masen'] },
  { id: 'ni-aru', rx: /に(?:(?!こと)[^。、に]){1,8}が(?:あります|ありました|ありませ|います|いました|いませ|ある|いる)/, back: 2, replaces: ['ni-particle', 'ni-time', 'ga-subject'] },
  { id: 'nani-mo-neg', rx: /(?:何|なに|だれ|誰|どこ)(?:に|へ)?も(?=[^。]*(?:ませ|ない|なかっ))/, back: 0, replaces: ['mo-also'] },
  { id: 'ga-suki', rx: /が(?:大)?(?:好き|嫌い|きらい)/, replaces: ['ga-subject'] },
  { id: 'no-ga-suki', rx: /のが(?:大)?(?:好き|嫌い|上手|下手|楽しい)/, replaces: ['ga-subject', 'ga-suki'] },
  { id: 'koto-ga-dekiru', rx: /ことができ/, replaces: ['ga-subject', 'koto-nominalizer'] },
  { id: 'tari', rx: /(?:たり|だり)[^。]*(?:たり|だり)(?:する|します|しました|して)/, back: 1, replaces: [] },
  { id: 'ta-koto-ga-aru', rx: /[ただ]ことが(?:あり|ある|あります|ありません)/, replaces: ['ta-plain', 'da-plain', 'ga-subject', 'masu', 'masen'] },
  { id: 'ni-iku-purpose', rx: /[いきしちにびみりべけえせ]に(?=行|来|帰|東京へ行)/, replaces: ['ni-destination', 'ni-particle'] },
  { id: 'dochira', rx: /と(?:、)?どちらが/, back: 0, replaces: ['to-and', 'ga-subject'] },
  { id: 'no-naka-de-ichiban', rx: /中で[^。]*一番/, back: 1, replaces: ['no-possessive', 'de-particle'] },
  { id: 'tagaru', rx: /たがって/, replaces: ['tai', 'te-iru'] },
  { id: 'nakereba-naranai', rx: /なければ(?:なりませんでした|なりません|ならない|いけません|いけない)/, replaces: ['nakereba-naranai', 'ba-conditional', 'masen'] },
  { id: 'hou-ga-ii', rx: /(?:ほう|方)がいい/, replaces: ['ga-subject', 'i-adj-desu'] },
  { id: 'hou-ga', rx: /(?:ほう|(?<![みりいきし])方)が(?!いい)/, replaces: ['ga-subject', 'no-possessive'] },
  { id: 'tsumori', rx: /つもり/, replaces: ['desu'] },
  { id: 'mo-emphasis', rx: /(?:時間|本|杯|キロ|人|回)も(?![、。])/, replaces: ['mo-also'] },
  { id: 'sou-hearsay', rx: /(?:[るたいだ]|ない)そう(?:です|だ)/, replaces: ['desu', 'da-plain'] },
  { id: 'sou-looks', rx: /(?<=[^るたい、。\s])そう(?:です|だ|な|に)/, replaces: ['desu', 'da-plain', 'na-adj-noun'] },
  { id: 'kamoshirenai', rx: /かもしれ(?:ない|ません)/, back: 1, replaces: ['masen'] },
  { id: 'nakute-mo-ii', rx: /なくても(?:いい|大丈夫)/, replaces: ['nai-plain', 'mo-also', 'te-mo', 'te-mo-ii', 'i-adj-desu'] },
  { id: 'te-mo-ii', rx: /(?<!な[くか])[てで]も(?:いい|よろしい)/, replaces: ['mo-also', 'i-adj-desu', 'te-mo'] },
  { id: 'te-mo', rx: /(?<!な[くか])[てで]も(?=、)|くても(?=、)|でも(?=、)/, replaces: ['mo-also', 'demo-suggest', 'kute'] },
  { id: 'te-miru', rx: /[てで]み(?=たい|ます|る|て|ました)/, replaces: ['te-sequence'] },
  { id: 'tai', rx: /[てで]みたい/, back: 0, replaces: ['desu'] },
  { id: 'mitai', rx: /(?<![てで])みたい/, replaces: ['desu'] },
  { id: 'te-hoshii', rx: /[てで](?:ほしい|欲しい)/, replaces: ['te-sequence', 'i-adj-desu', 'hoshii'] },
  { id: 'naide', rx: /ないで(?!ください|ほしい|す|しょう)/, replaces: ['nai-plain'] },
  { id: 'te-itadakemasen-ka', rx: /[てで]いただけ(?:ません|ない)(?:か|でしょうか)?/, replaces: ['te-iru', 'ta-plain', 'dake', 'masen-ka', 'masen', 'te-morau'] },
  { id: 'te-yokatta', rx: /[てで]よかった/, replaces: ['te-sequence', 'i-adj-past', 'desu'] },
  { id: 'ba-yokatta', rx: /ばよかった/, back: 1, replaces: ['ba-conditional', 'nakereba-naranai', 'i-adj-past', 'desu'] },
  { id: 'te-sumimasen', rx: /[てで](?:すみません|ごめん)/, replaces: ['te-sequence'] },
  { id: 'te-kurete-arigatou', rx: /[てで](?:くれて|くださって)、?ありがとう/, replaces: ['te-kureru', 'te-sequence'] },
  { id: 'to-ii', rx: /といい(?:ですね|なあ|な|ね)/, back: 1, replaces: ['to-conditional', 'to-quote', 'i-adj-desu', 'desu', 'ne', 'na-ending'] },
  { id: 'tara-dou', rx: /[ただ]らどう/, replaces: ['tara', 'desu'] },
  { id: 'toki', rx: /(?<![一二三四五六七八九十何])時(?=、|に|は)|とき(?=[、はに])/, overParticles: true, replaces: ['ni-time', 'ni-particle', 'no-possessive'] },
  { id: 'mae-ni', rx: /[るい]前に/, replaces: ['ni-time'] },
  { id: 'te-kara', rx: /[てで]から/, replaces: ['kara-from'] },
  { id: 'ni-yoru-to', rx: /によると/, replaces: ['ni-particle', 'to-conditional'] },
  { id: 'hazu', rx: /はず/, replaces: ['desu', 'deshita', 'da-plain'] },
  { id: 'volitional-to-omou', rx: /[こそとのぼもろごおよ]うと思/, replaces: ['volitional', 'to-omou'] },
  { id: 'tte', rx: /んだって|って(?=。|$)/, replaces: ['n-desu'] },
  { id: 'nasai', rx: /(?<!ごめん)なさい(?!ま)/ },
  { id: 'no-you-na', rx: /のよう(?:な|に|です)/, replaces: ['no-possessive', 'desu', 'you-ni'] },
  { id: 'kadouka', rx: /かどうか/, replaces: ['embedded-question'] },
  { id: 'embedded-question', rx: /(?:る|た|い)か(?=(?:知|分|覚|教|聞))/ },
  { id: 'aida-ni', rx: /(?<!時)間(?:に(?!合)|、)/, replaces: ['ni-particle'] },
  { id: 'adj-suru', rx: /(?<![なを])くし(?=ま|て)|きれいにし(?=ま|て)/, replaces: ['ni-suru-choice'] },
  { id: 'koto-ni-shite-iru', rx: /ことにしてい/, replaces: ['ni-suru-choice', 'te-iru'] },
  { id: 'koto-ni-suru', rx: /ことにし(?!てい)/, replaces: ['ni-suru-choice'] },
  { id: 'kata', rx: /(?:み|り|い|き)方(?=[をがはの])/ },
  { id: 'o-ni-naru', rx: /[おご][一-鿿ぁ-ん]{1,4}にな(?:り|る)/, from: 19, back: 0, replaces: ['ni-naru'] },
  { id: 'sonkeigo', rx: /いらっしゃ|おっしゃ|召し上が|なさ(?:いま|る|っ)|(?:くだ|下)さ(?:いま|って|る)|ご覧|ご存知/, from: 19, back: 0 },
  { id: 'kenjougo-humble', rx: /申し|申[すせ]|参り|参る|伺|致し|いたし|[てで]おり|おります|拝見|存じ|お目にかか|ございま/, from: 20, back: 0, replaces: ['te-sequence', 'plain-form'] },
  { id: 'kenjougo', rx: /[おご][一-鿿ぁ-ん]{1,4}(?:し|いたし)ま|(?<![てで])(?:いただ|頂)(?:き|け)/, from: 20, back: 0 },
  { id: 'causative-passive', rx: /(?:さ)?せられ|[かたなまらわがば]され/, from: 22, back: 1, replaces: ['causative', 'passive'] },
];

const isPunct = p => !p.key && /^[、。「」　\s]+$/.test(p.src.replace(/\[[^\]]*\]/g, ''));

function sentenceGrammar(chapter, morphs, plain, pieces) {
  let g = detectGrammar(morphs, plain, GRAMMAR);
  // 飲んだ, 休んだ: kuromoji calls the past ending だ the copula.
  g = g.map(([id, snip]) => [id === 'da-plain' && morphs.some((m, i) => m.surface_form === 'だ' && morphs[i - 1] && morphs[i - 1].pos === '動詞' && snip.endsWith(morphs[i - 1].surface_form + 'だ')) ? 'ta-plain' : id, snip]);
  // と after a person and before a verb of doing is "with", not "and".
  const PERSON = /(?:友達|先生|家族|彼女|彼|母|父|兄|姉|弟|妹)と/;
  g = g.map(([id, snip]) => ((id === 'to-and' || id === 'to-quote') && PERSON.test(snip) ? ['to-with', snip.match(PERSON)[0]] : [id, snip]));
  if (/とどちら/.test(plain)) g = g.filter(([id]) => id !== 'to-quote');
  g = g.map(([id, snip]) => [id, snip.replace(/^[」「]+/, '')]);
  // 〜ておいてください isn't the お of お〜ください.
  g = g.filter(([id, snip]) => !(id === 'o-honorific' && snip.startsWith('おいて')));
  // Before the passive (chapter 21), 〜られる on a る-verb is the potential:
  // 食べられます "can eat", 来られない "can't come".
  if (chapter < 21) g = g.map(([id, snip]) => [id === 'passive' && snip.endsWith('られ') ? 'potential' : id, snip]);
  // う-verb potentials (話せる, 読める) are words of their own.
  const pot = pieces.find(p => p.key && !p.key.miss && /potential/.test(p.key[1][2]));
  if (pot && !g.some(([id]) => id === 'potential')) g.push(['potential', plain.slice(pot.from, pot.to)]);
  for (const rule of SENTENCE_RULES) {
    if (rule.from && chapter < rule.from) continue;
    const m = rule.rx.exec(plain);
    if (!m) continue;
    const coreFrom = m.index, coreTo = m.index + m[0].length;
    if (rule.replaces) {
      g = g.filter(([id, snippet]) => {
        if (!rule.replaces.includes(id)) return true;
        for (let at = plain.indexOf(snippet); at !== -1; at = plain.indexOf(snippet, at + 1)) {
          if (at < coreTo && at + snippet.length > coreFrom) return false;
        }
        return true;
      });
    }
    if (g.some(([id]) => id === rule.id)) continue;
    let k = pieces.findIndex(p => p.from <= coreFrom && coreFrom < p.to);
    // Take in the word before, unless the match already starts inside one;
    // a particle before it (を, に) stays out.
    const isParticle = p => p.key && !p.key.miss && /particle/.test(p.key[1][2]);
    const inside = k >= 0 && pieces[k].from < coreFrom;
    for (let n = inside ? 0 : rule.overParticles ? 2 : rule.back === undefined ? 1 : rule.back; n > 0 && k > 0 && !isPunct(pieces[k - 1]) && (rule.overParticles || !isParticle(pieces[k - 1])); n--) k--;
    const from = Math.min(coreFrom, pieces[k] ? pieces[k].from : coreFrom);
    g.push([rule.id, plain.slice(from, coreTo).replace(/^[、。]+/, '')]);
  }
  return g;
}

// The sentences carry <ruby> markup; the word finder reads 漢字[かんじ].
export const rubyToMarkup = html => html
  .replace(/<ruby>(.*?)<rp>\(<\/rp><rt>(.*?)<\/rt><rp>\)<\/rp><\/ruby>/g, '$1[$2]')
  .replace(/<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g, '$1[$2]');

const gloss = {};
const grammarUsed = new Set();
const lines = {};
const misses = new Map();

function analyse(chapter, id, markup) {
  const { pieces, morphs, plain } = segment(markup);
  const words = [];
  pieces.forEach(({ src, key }) => {
    if (key && key.miss) {
      if (key.miss.length > 1) misses.set(key.miss, (misses.get(key.miss) || []).concat(id));
      words.push(src);
    } else if (key) {
      gloss[key[0]] = key[1];
      words.push([src, key[0]]);
    } else words.push(src);
  });
  const w = words.reduce((acc, t) => {
    if (typeof t === 'string' && typeof acc[acc.length - 1] === 'string') acc[acc.length - 1] += t;
    else acc.push(t);
    return acc;
  }, []);
  const g = sentenceGrammar(chapter, morphs, plain, pieces);
  g.forEach(([gid]) => {
    if (!GRAMMAR[gid]) throw new Error(`unknown grammar id ${gid}`);
    grammarUsed.add(gid);
  });
  lines[id] = { w, g };
}

for (const [ch, list] of Object.entries(TRANSLATE_SENTENCES)) {
  list.forEach((s, i) => analyse(Number(ch), `${ch}:${i}`, rubyToMarkup(s.jaHtml || s.ja)));
}

const sorted = o => Object.fromEntries(Object.keys(o).sort().map(k => [k, o[k]]));
const grammar = sorted(Object.fromEntries([...grammarUsed].map(id => [id, GRAMMAR[id]])));
const js = `// Generated by scripts/tokenize_sentences.mjs from sentences-data.js — do not edit.
// SENTENCE_WORDS.lines['<chapter>:<n>'] (sentence n of a chapter) is { w, g }:
// w lists the sentence's pieces — a string is plain text, [markup, key] a word
// whose [reading, meaning, part of speech] is gloss[key] — and g lists its
// grammar as [id, snippet], explained in grammar[id].
(function (global) {
  'use strict';
  global.SENTENCE_WORDS = ${JSON.stringify({ gloss: sorted(gloss), grammar, lines })};
})(typeof window !== 'undefined' ? window : globalThis);
`;
writeFileSync(path.join(ROOT, 'sentences-words.js'), js);
console.log(`${Object.keys(lines).length} sentences, ${Object.keys(gloss).length} words, ${grammarUsed.size} grammar points; ${misses.size} words not found`);
if (process.argv.includes('--misses')) [...misses].forEach(([k, ids]) => console.log(k, ids.length, ids[0]));
