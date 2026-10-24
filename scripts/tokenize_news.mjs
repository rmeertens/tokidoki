#!/usr/bin/env node
// Build news-words.js from news-data.js: every headline and sentence of every
// news story, at every level, split into words (each linked to a dictionary
// entry) plus the grammar it uses, so tapping a sentence on the News page can
// explain it word by word — the same as the Phrases pages.
//
// Words come from jp_words.mjs, with news_extra_words.json for names and
// news vocabulary the site's lists don't have. Grammar comes from the rules
// in jp_grammar.mjs plus NEWS_RULES below, for the written expressions news
// is full of (〜によると, 〜おそれがある, 〜とみられる…).
//
// Usage (kuromoji isn't a site dependency, so install it just for this):
//   npm install --no-save kuromoji
//   node scripts/tokenize_news.mjs [--misses]
// test_news.js fails when the news and this file drift apart.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT, createWordFinder, loadSiteData } from './jp_words.mjs';
import { GRAMMAR_EXTRA, detectGrammar } from './jp_grammar.mjs';

const { NEWS_ITEMS, STORY_GRAMMAR } = loadSiteData(['news-data.js', 'stories-data.js', 'mystery-words.js', 'memes-data.js', 'memes-data-2.js']);

const readJson = f => JSON.parse(readFileSync(path.join(ROOT, 'scripts', f), 'utf8'));
// Dates, percentages and names kuromoji splits apart; keep them whole.
const NEWS_WHOLE = ['二十四日','松井秀喜','東シナ海','温帯低気圧','皇室典範', '市場', '人工知能', '出場枠', 'とみられる', '16.7%', '49.4%', '43.9%', '15.1%', '18.9%', '51.1%', '22.9%', '8.6%', '5360億円', '13か月', '二人目', '45.56%', '41.64%', '39.5%', '千島列島', '約3.8%', '3.8%', '7.0%', '6月', '6月末', '7%', '0.7%', '10月', '4月', '1%案', '1%分', '8%', '1%', '0%', 'クラウド', '10以上', '弱さ', 'ゲーム差', '3試合制', '硤合', '憲三', 'JR九州', '日本シリーズ', '日本ハム', 'セ・リーグ', 'パ・リーグ', 'アンリ・カガン', '金融庁', '探査機', '保険金', '幹事長', '統一地方選', '党大会', '存在感', '世界初', '参院選', '実仁', '49.8パーセント', '88.6パーセント', '49.7パーセント', '84.2パーセント', '74.4パーセント', '69.7パーセント', '50.1パーセント', '0.3ポイント', '39ポイント', '3.1パーセント', '5.2パーセント', '1.4パーセント', '0.1パーセント', '0.5パーセント', '50パーセント', '4.0度', '3.6度', '4度', '八回目', '世界一', '十一日', '18億3000万円', '2027年度', '80か所', '6か所', '134台', '計134台', '約3700か所', '10年', '二人', '1月', '西アフリカ', 'アンダーパス', '国土交通省', '金メダル', '来年度', '農林水産大臣', '農林水産相', '農林水産', '副大臣', '記者団', '支持者', '情報機関', 'スパイ罪', '特派員', '日本初', 'クルーズ船', '造船所', '船名', '茂木敏充', '武部新', '十五日', '約5パーセント', '6万4426円', '3318円', '3318円安', '4.9％', '4.90％', '3番目', '15％', '約8％', '3600円', '約531万件', '531万件', '十六日', '二十八日', '約14億8000万', 'G20', 'G7', 'ヤマト運輸', '埼玉工業大学', '佐川急便', '九州大学', '香川大学', '九州大', '香川大', 'コアウィーブ', 'アドバンテスト', '祐介', '秋田祐介', 'クロネコ', '後払い', '前日比', '100億ドル', '13年ぶり', '2013年', '2015年', '2023年', '30個', '30号', '3年間', '3時', '3時ごろ', '8年ぶり', 'チャンパー', '三日間', '九段北', '十九日', '米ドル', '靖国神社', '助け合える', 'マーシャル諸島', 'マリアナ諸島', 'トラック諸島', '片山', 'さつき', '秋季', '春季', '第二次', '1383人', '約12万5000人', '約12万5000人分', '1万8000件', '約1万3000人分', 'ドローン', '1万8000件超', 'により', '約16億5000万円', '3回目', '約31億円', '16億5000万円', '3件目'];
const { segment } = await createWordFinder({
  extra: { ...readJson('phrase_extra_words.json'), ...readJson('news_extra_words.json') },
  whole: [...readJson('phrase_whole_words.json'), ...NEWS_WHOLE],
});

// Written-style grammar the Stories notes don't cover, in the same shape.
const GRAMMAR_NEWS = {
  'to-iu-report': { level: 'N3', title: '〜という — "reportedly"', pattern: 'Plain form + という。', note: 'Ending a news sentence with という passes on what someone else said: 可能性は低いという "it is said the chances are low". Often paired with 〜によると.' },
  'osore-ga-aru': { level: 'N3', title: '〜おそれがある — "there is a risk that"', pattern: 'Verb plain form / Noun + の + おそれがある', note: 'A formal warning that something bad could happen: 波が高くなるおそれがある "the waves could get high". Only used for bad outcomes.' },
  'to-mirareru': { level: 'N3', title: '〜とみられる — "is thought to"', pattern: 'Plain form + とみられる', note: 'A careful guess in news writing: 多いとみられる "is expected to be many". The writer avoids stating it as fact.' },
  'mikomi': { level: 'N3', title: '〜見込みだ — "is expected to"', pattern: 'Verb plain form + 見込みだ', note: 'What is forecast or planned to happen: 達する見込みだ "is expected to reach". Common in weather and economic news.' },
  'utagai': { level: 'N3', title: '〜疑いがある — "is suspected of"', pattern: 'Plain form + 疑いがある', note: 'Something not yet proven: 決めていた疑いがある "is suspected of having decided". News uses it until a court decides.' },
  'to-shite-iru': { level: 'N3', title: '〜としている — "says / takes the position"', pattern: 'Quote / plain form + としている', note: 'How the news reports an organisation\'s official line: 「協力する」としている "says it will cooperate".' },
  'to-shite': { level: 'N3', title: '〜として — "saying that / as"', pattern: 'Quote + として', note: 'Gives the reason or claim behind an action: 「議論が必要だ」として反発 "objects, saying debate is needed".' },
  'naka': { level: 'N3', title: '〜中 — "amid, while"', pattern: 'Verb plain form + 中(で)', note: 'The situation in which something happens: 値上げが続く中 "as prices keep rising".' },
  'koto-kara': { level: 'N3', title: '〜ことから — "because (of the fact that)"', pattern: 'Plain form + ことから', note: 'A written way to give a reason, often based on a fact: 時間がかかることから "since it takes time".' },
  'tame-reason': { level: 'N3', title: '〜ため — "because" (written)', pattern: 'Plain form / Noun + の + ため', note: 'In news and notices ため gives a reason, like から: 時間がかかるため "because it takes time". With a verb of intent it means "in order to" instead.' },
  'masu-stem-and': { level: 'N3', title: 'ます-stem + 、 — "and" (written)', pattern: 'Verb ます-stem + 、', note: 'Written Japanese often joins two sentences with the ます-stem instead of the て-form: 変え、 = 変えて、 "changes …, and".' },
  'te-ori': { level: 'N3', title: '〜ており — written 〜ていて', pattern: 'Verb て-form + おり', note: 'The formal, written version of 〜ていて: 反発しており "is objecting, and…".' },
  'ippou-conj': { level: 'N3', title: '一方 — "on the other hand"', pattern: '一方、 + sentence', note: 'At the start of a sentence, 一方 turns to a contrasting side of the story: 一方、野党は… "the opposition, meanwhile, …".' },
  'to-naru': { level: 'N3', title: '〜となる — written 〜になる', pattern: 'Noun + となる', note: 'News and formal writing often use と for になる "become": 10人目となる "becomes the tenth".' },
  'sai': { level: 'N3', title: '〜際 — "when" (formal)', pattern: 'Verb plain form / Noun + の + 際(は / に)', note: 'A formal とき, common in news and notices: 釣りをする際は "when fishing".' },
};
const GRAMMAR = { ...STORY_GRAMMAR, ...GRAMMAR_EXTRA, ...GRAMMAR_NEWS };

// Patterns found in the text. `rx` matches the grammar itself; the snippet
// shown on the page also takes in the word before it (`back` words, default
// 1), so 多いとみられる rather than とみられる. Points the shared rules found
// in the same stretch of text (`replaces`) are dropped, since they're the
// same words misread — the よると of 〜によると isn't 〜と "when".
const NEWS_RULES = [
  { id: 'ni-yoru-to', rx: /によると/, replaces: ['ni-particle', 'to-conditional'] },
  { id: 'to-iu-report', rx: /という(?=。)/, replaces: ['to-iu-name', 'to-quote', 'plain-form'] },
  { id: 'osore-ga-aru', rx: /おそれがあ(?:る|ります)/, back: 2, replaces: ['plain-form'] },
  { id: 'to-mirareru', rx: /とみられ(?:る|ます)/, replaces: ['to-quote', 'passive'] },
  { id: 'mikomi', rx: /見込み/ },
  { id: 'utagai', rx: /疑いがあ(?:る|ります)/, back: 2, replaces: ['plain-form', 'masu', 'ga-subject'] },
  { id: 'to-shite-iru', rx: /としている/, back: 0, replaces: ['to-quote', 'te-iru'] },
  { id: 'to-shite', rx: /として(?!い)/, back: 0 },
  { id: 'naka', rx: /中(?=、)/ },
  { id: 'koto-kara', rx: /ことから/, replaces: ['kara-from'] },
  { id: 'tame-reason', rx: /ため(?![にの])/, replaces: ['tame-ni'] },
  { id: 'te-ori', rx: /ており/, replaces: ['te-sequence'] },
  { id: 'ippou-conj', rx: /^一方(?=、)/, back: 0 },
  { id: 'sai', rx: /(?<!実)際(?=[はに、])/ },
  { id: 'toki', rx: /とき(?=[はに、])/, replaces: ['ni-particle'] },
  { id: 'tari', rx: /[たださ]り[^。]*たりする/, replaces: [] },
  { id: 'you-ni-suru', rx: /ようにしましょう/, replaces: ['ni-suru-choice', 'mashou'] },
  { id: 'sou-looks', rx: /そう(?:です|だ)(?=。|$)/, replaces: ['desu', 'da-plain'] },
  { id: 'kamoshirenai', rx: /かもしれません/, back: 2, replaces: ['masen'] },
  { id: 'to-quote', rx: /ないと(?=言|話|強調)/, back: 0, replaces: ['to-conditional'] },
  { id: 'ni-tsuite', rx: /について/ },
  { id: 'tame-ni', rx: /ために/, replaces: ['ni-particle'] },
  { id: 'nakereba-naranai', rx: /なければなりませんでした/, replaces: ['ba-conditional', 'masen-deshita', 'deshita'] },
  { id: 'to-naru', rx: /となる/, replaces: ['to-with', 'plain-form'] },
  { id: 'you-ni-naru', rx: /ようになり/, replaces: ['ni-naru', 'ni-particle'] },
  { id: 'koto-ni-naru', rx: /ことになり/, replaces: ['ni-naru'] },
];

const isPunct = p => !p.key && /^[、。「」　\s]+$/.test(p.src.replace(/\[[^\]]*\]/g, ''));

function newsGrammar(morphs, plain, pieces) {
  let g = detectGrammar(morphs, plain, GRAMMAR);
  for (const rule of NEWS_RULES) {
    const m = rule.rx.exec(plain);
    if (!m) continue;
    const coreFrom = m.index, coreTo = m.index + m[0].length;
    if (rule.replaces) {
      g = g.filter(([id, snippet]) => {
        if (!rule.replaces.includes(id)) return true;
        // Dropped if any place the snippet occurs overlaps the match.
        for (let at = plain.indexOf(snippet); at !== -1; at = plain.indexOf(snippet, at + 1)) {
          if (at < coreTo && at + snippet.length > coreFrom) return false;
        }
        return true;
      });
    }
    if (g.some(([id]) => id === rule.id)) continue;
    let k = pieces.findIndex(p => p.from <= coreFrom && coreFrom < p.to);
    for (let n = rule.back === undefined ? 1 : rule.back; n > 0 && k > 0 && !isPunct(pieces[k - 1]); n--) k--;
    const from = Math.min(coreFrom, pieces[k] ? pieces[k].from : coreFrom);
    g.push([rule.id, plain.slice(from, coreTo)]);
  }
  // Written Japanese joins sentences with the ます-stem: 変え、 for 変えて、.
  const i = morphs.findIndex((m, j) => m.pos === '動詞' && m.pos_detail_1 === '自立' && !['いる', 'おる', 'ある'].includes(m.basic_form) && m.conjugated_form === '連用形' && morphs[j + 1] && morphs[j + 1].surface_form === '、');
  if (i !== -1) {
    const p = pieces.find(q => q.from <= morphs[i].from && morphs[i].from < q.to);
    g.push(['masu-stem-and', plain.slice(p.from, p.to)]);
  }
  return g;
}

// ─── Build ───────────────────────────────────────────────────────────────────

const gloss = {};
const grammarUsed = new Set();
const lines = {};
const misses = new Map();

function analyse(id, markup) {
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
  const g = newsGrammar(morphs, plain, pieces);
  g.forEach(([gid]) => {
    if (!GRAMMAR[gid]) throw new Error(`unknown grammar id ${gid}`);
    grammarUsed.add(gid);
  });
  lines[id] = { w, g };
}

for (const item of NEWS_ITEMS) {
  for (const [level, v] of Object.entries(item.levels)) {
    analyse(`${item.id}:${level}:t`, v.title);
    v.lines.forEach((l, i) => analyse(`${item.id}:${level}:${i}`, l[0]));
  }
}

const sorted = o => Object.fromEntries(Object.keys(o).sort().map(k => [k, o[k]]));
const grammar = sorted(Object.fromEntries([...grammarUsed].map(id => [id, GRAMMAR[id]])));
// One entry a line, so adding a day's news adds lines instead of rewriting
// one huge one.
const entries = o => `{\n${Object.entries(o).map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)}`).join(',\n')}\n}`;
const js = `// Generated by scripts/tokenize_news.mjs from news-data.js — do not edit.
// NEWS_WORDS.lines['<story id>:<level>:<n>'] (sentence n) or
// ['<story id>:<level>:t'] (the headline) is { w, g }: w lists the sentence's
// pieces — a string is plain text, [markup, key] a word whose [reading,
// meaning, part of speech] is gloss[key] — and g lists its grammar as
// [id, snippet], explained in grammar[id].
(function (global) {
  'use strict';
  global.NEWS_WORDS = {
${['gloss', 'grammar', 'lines'].map(k => `"${k}":${entries({ gloss: sorted(gloss), grammar, lines }[k])}`).join(',\n')}
};
})(typeof window !== 'undefined' ? window : globalThis);
`;
writeFileSync(path.join(ROOT, 'news-words.js'), js);
console.log(`${Object.keys(lines).length} sentences, ${Object.keys(gloss).length} words, ${grammarUsed.size} grammar points; ${misses.size} words not found`);
if (process.argv.includes('--misses')) [...misses].forEach(([k, ids]) => console.log(k, ids.length, ids[0]));
