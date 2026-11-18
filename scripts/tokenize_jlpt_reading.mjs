#!/usr/bin/env node
// Build jlpt-reading-words.js from jlpt-reading-data.js: every sentence of
// every JLPT Reading text (and its questions) split into words, each linked
// to a dictionary entry, plus the grammar the sentence uses; table cells and
// email headers are split into words too. Once a text's questions are
// answered, jlpt-reading.js makes the words tappable and explains each
// sentence, like the News pages.
//
// The text is cut into pieces by jlpt-reading.js itself (segments(), keyed
// by segKey()), so the page and this file always agree. Words come from
// jp_words.mjs; grammar from jp_grammar.mjs plus READING_RULES below, for the
// language of notices and business letters (ただし, なお, 〜場合は,
// お〜ください, つきましては…).
//
// Usage (kuromoji isn't a site dependency, so install it just for this):
//   npm install --no-save kuromoji
//   node scripts/tokenize_jlpt_reading.mjs [--misses]
// Missing words go in scripts/jlpt_reading_extra_words.json.
// test_jlpt_reading.js fails when the texts and this file drift apart.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ROOT, createWordFinder, loadSiteData } from './jp_words.mjs';
import { GRAMMAR_EXTRA, detectGrammar } from './jp_grammar.mjs';

const require = createRequire(import.meta.url);
const R = require(path.join(ROOT, 'jlpt-reading.js'));
const PASSAGES = require(path.join(ROOT, 'jlpt-reading-data.js'));
const { STORY_GRAMMAR } = loadSiteData(['stories-data.js', 'mystery-words.js', 'memes-data.js', 'memes-data-2.js']);
const json = f => JSON.parse(readFileSync(path.join(ROOT, 'scripts', f), 'utf8'));

// This page's own list wins over the other pages' lists.
const EXTRA = Object.assign({}, json('sentence_extra_words.json'), json('story_fill_extra_words.json'),
  json('listening_extra_words.json'), json('phrase_extra_words.json'), json('news_extra_words.json'),
  json('jlpt_reading_extra_words.json'));
// Strings kuromoji splits oddly; kept as one word.
const WHOLE = [...json('phrase_whole_words.json'), 'お知らせ', 'お疲れさま', 'お疲れさまです', 'よろしくお願いします', 'ありがとうございます',
  'ありがとうございました', '申し訳ございません', 'ごめんなさい', '日本語', '会議室', '電話番号', '午前中', '今日中', '図書室',
  '自習室', '市民センター', '受付センター', '自転車置き場', '水泳帽', '入会金', '月会費', '身分証明書', '運転免許証', '保険証',
  '学生証', '粗大ごみ', '処理券', '収集日', '休館日', '入館料', '開館時間', '水道管', '管理会社', '居住者', '閲覧室', '新人研修',
  '料理教室', '家庭料理', '晩ご飯', '昼ご飯', '日帰り', '有料席', '実行委員会', '花火大会', '人事部', '営業部', '総務部',
  '情報システム部', '在宅勤務', '社外秘', '防災訓練', '自治会', '配送料', '料金表', '添付ファイル', '募集要項', '私費留学生',
  '国費留学生', '在学証明書', '成績証明書', '推薦書', '申請書', '指導教員', '国際交流', '市役所', '市民会館', '会議室A',
  '会議室B', '大ホール', '入場料', '休館日', '年末年始', '賃貸借契約', '更新料', '更新申込書', '不動産', '宅配便', '再配達',
  '不在票', '時間指定', '持ち込み', '交通費', '資格外活動許可', '在留カード', '学習塾', '弁当工場', '固定席', '法人登記',
  '入会', '日割り', '初月', 'ドロップイン', 'フルタイム', 'デイタイム', 'インターンシップ', '学年不問', '無報酬', '企業努力',
  '燃料費', 'お取引先', '各位', '平素', 'お引き立て', '株式会社', 'お客さん', 'ホームステイ', '肉じゃが', 'ペットボトル',
  'けしゴム', 'パンや', 'きっさてん', 'ひこうじょう', 'すいえい', 'ぎゅうにゅう', 'たんじょうび', 'せんたくもの', 'れいぞうこ',
  'りゅうがくせい', 'じむしょ', 'きょうしつ', 'じゅぎょう', 'おべんとう', 'えんそく', 'もうしこみ', 'うけつけ', 'しゅくだい', 'えいが',
  'ていしょく', 'しごと', 'えき', 'ふくろ', 'ひとつ', '出しかた', '月ようび', '火ようび', '水ようび', '木ようび', '金ようび', '土ようび',
  '日ようび', 'マリア', 'グエン・ミン', 'リ・ナ', 'ミナト・ベース', '青空堂', 'さくら銀行', 'クール便', 'クリーンセンター', 'グループワーク',
  'Wi-Fi', 'ホワイトボード', 'お一人様', 'お一人', '添付ファイル', '私費留学生', '在学証明書', '成績証明書', '指導教員', '新入生',
  '学年不問', '資格外活動許可', '情報システム部', '出退勤', 'コワーキングスペース', 'フィットネスクラブ', '受付時間外', 'ようび',
  '1まい', '4時', 'お使い', '土・日・祝日', '1つ', '解約希望月', '履歴書', '30cm', '更新申込書', '3月中', '法人登記', 'なお',
  'ただし', 'つきましては', 'みどり', 'なんさい', 'でんしゃ', 'こんしゅう', 'まいしゅう', 'りょこう', 'だいどころ', 'やくそく', 'そうじ',
  'いりぐち', 'とちゅう', 'ひらがな', 'かいわ', 'よめる', 'はなせる', 'おやつ', 'さんぽ', '1かい', 'きゅうこう', 'どうぶつえん', 'ミカ', 'ナナ',
  '手ぶくろ', 'レンタサイクル', 'コインパーキング', '領収書', '問診票', '祝前日', '素泊まり', '二食付き', '早割', '模擬面接', '達成率', '省エネ',
  '二十周年', '誘導員', '歩行者', '休工', 'ご高配', 'ご多用中', '券売機', '1割引き', '30分', '20日ごろ', '1時間ごと', '30分ごと', '3丁目',
  'つく', '西公園', '東公園', 'とっても', 'おかけいたしますが', 'クール便', 'あした', 'まい月', '10ぷん', 'お渡し', 'そよかぜ', '約2か月後'];
const { segment } = await createWordFinder({ extra: EXTRA, whole: WHOLE });

// Grammar of notices, emails and business letters, in the Stories notes'
// shape (level, title, pattern, note).
const GRAMMAR_READING = {
  'tadashi': { level: 'N3', title: 'ただし — "however (an exception)"', pattern: 'Rule。ただし、 + exception', note: 'Adds an exception or condition to what was just said: 返事は必要ありません。ただし、… "no reply needed — except …". In notices, the question is often about the ただし line.' },
  'nao': { level: 'N3', title: 'なお — "also, please note"', pattern: 'なお、 + extra information', note: 'Adds one more detail at the end of a notice or letter: なお、作業が早く終わった場合は… "note that if the work ends early …". Easy to skip, often what the question asks about.' },
  'ni-kagiri': { level: 'N2', title: '〜に限り — "only (in the case of)"', pattern: 'Noun / plain form + に限り', note: 'Limits something to one case: 申し出た場合に限り全額返金 "a full refund only if you tell us". Also on signs: 本日に限り "today only".' },
  'wo-nozoku': { level: 'N2', title: '〜を除く — "except"', pattern: 'Noun + を除く / を除き', note: 'Leaves something out of a rule: ふたのできる飲み物を除く "except drinks with a lid".' },
  'tsukimashite': { level: 'N2', title: 'つきましては — "accordingly, so"', pattern: 'Reason。つきましては、 + request', note: 'The polite, written そこで of business letters: after the background comes the point — a request or a decision. Read what follows it first.' },
  'o-kudasai': { level: 'N4', title: 'お〜ください / ご〜ください — polite request', pattern: 'お + verb ます-stem + ください / ご + する-noun + ください', note: 'A more polite 〜てください, everywhere in notices: お待ちください "please wait", ご連絡ください "please contact us", ご注意ください "please be careful".' },
  'o-itasu': { level: 'N3', title: 'お〜いたします / ご〜いたします — humble "we will"', pattern: 'お + verb ます-stem / ご + する-noun + いたします', note: 'Humble language for what the writer\'s side will do: お返しいたします "we will return (the money)", ご連絡いたします "we will contact you".' },
  'te-itadaku': { level: 'N4', title: '〜ていただく — polite "have (someone) do"', pattern: 'Verb て-form + いただく', note: 'The humble 〜てもらう. 〜ていただけませんか / 〜ていただけないでしょうか is a very polite request: 案内していただけないでしょうか "could you possibly show them the way?". ご利用いただき "(you) using (our shop)".' },
  'sasete-itadaku': { level: 'N3', title: '〜させていただく — "we will (humbly)"', pattern: 'Verb causative て-form + いただく', note: 'Literally "receive permission to do": a very polite way to announce what the writer will do: 改定させていただきます "we will revise", 調整させていただきます "we will arrange".' },
  'ni-tsuki': { level: 'N3', title: '〜につき — "per / due to / about"', pattern: 'Noun + につき', note: 'Written: 1個につき100円 "100 yen per item", 工事中につき "because of building work". 〜につきましては is the polite "as for …".' },
  'ni-atatte': { level: 'N2', title: '〜にあたって — "when, on the occasion of"', pattern: 'Noun / verb plain form + にあたって / にあたり', note: 'A formal "when doing (something important)": 利用にあたっての注意 "points to note when using it".' },
  'ni-tomonai': { level: 'N2', title: '〜に伴い — "along with, because of"', pattern: 'Noun + に伴い / に伴って', note: 'One change bringing another: 移行作業に伴い、システムを停止します "because of the move, the system will be stopped".' },
  'to-suru': { level: 'N2', title: '〜とする — "is set as, shall be"', pattern: 'Noun / plain form + とする / とし', note: 'How rules are written: 週2日までとし "limited to two days a week, and…", 禁止とします "is prohibited".' },
  'mono-to-shite': { level: 'N2', title: '〜ものとして — "on the assumption that"', pattern: 'Plain form + ものとして', note: 'Treating something as decided: 更新されるものとして手続きを進めます "we will proceed as if you are renewing".' },
  'tame-reason': { level: 'N3', title: '〜ため — "because" (written)', pattern: 'Plain form / Noun + の + ため', note: 'In notices ため gives a reason, like から: 台風が近づいているため "because a typhoon is coming". With a verb of intent it means "in order to" instead.' },
  'sai': { level: 'N3', title: '〜際 — "when" (formal)', pattern: 'Verb plain form / Noun + の + 際(は / に)', note: 'A formal とき, common in notices: その際は "in that case, when doing so".' },
  'te-ori': { level: 'N3', title: '〜ており — written 〜ていて', pattern: 'Verb て-form + おり', note: 'The formal, written version of 〜ていて: 上昇が続いており "(costs) keep rising, and…".' },
  'to-naru': { level: 'N3', title: '〜となる — written 〜になる', pattern: 'Noun + となる', note: 'Formal writing often uses と for になる "become": 期間満了となります "the term comes to an end", 1.5倍となります "is 1.5 times".' },
  'masu-stem-and': { level: 'N3', title: 'ます-stem + 、 — "and" (written)', pattern: 'Verb ます-stem + 、', note: 'Written Japanese often joins two sentences with the ます-stem instead of the て-form: 記入し、 = 記入して、 "fill in …, and".' },
  'mikomi': { level: 'N3', title: '〜見込みだ — "is expected to"', pattern: 'Verb plain form / Noun + の + 見込みだ', note: 'What is forecast: 4月上旬になる見込みです "is expected to be early April".' },
  'you-ni-request': { level: 'N3', title: '〜よう(に) — "so that / please"', pattern: 'Verb plain form + よう(に)', note: 'The aim of an action: 参加していただけるよう "so that you can take part"; ご理解を賜りますようお願い申し上げます "we ask for your understanding".' },
  'reru-honorific': { level: 'N3', title: '〜れる / 〜られる — respectful', pattern: 'Verb passive form, about the reader\'s actions', note: 'The passive form also makes a verb respectful when it describes what the reader or customer does: 希望される場合 "if you wish", チケットを買われたお店 "the shop where you bought the ticket". Nothing is being done to anyone.' },
  'yori-from': { level: 'N3', title: '〜より — "from" (formal)', pattern: 'Time / place + より', note: 'In notices and letters より often means から: 4月1日より "from 1 April". After a comparison it still means "than".' },
  'ni-yori': { level: 'N3', title: '〜により — "by, because of" (written)', pattern: 'Noun + により / によって', note: 'The cause or means, in formal writing: 企業努力により "through our own efforts".' },
};
const GRAMMAR = { ...STORY_GRAMMAR, ...GRAMMAR_EXTRA, ...GRAMMAR_READING };

// Patterns found in the text: `rx` matches the grammar itself; the snippet
// shown also takes in `back` words before it (default 1). Points the shared
// rules found in the same stretch (`replaces`) are dropped, as misreadings.
const READING_RULES = [
  { id: 'tadashi', rx: /ただし(?=、)/, back: 0 },
  { id: 'nao', rx: /^・?なお(?=、)/, back: 0 },
  { id: 'baai', rx: /場合(?=[はにでも、])/, replaces: ['ni-particle', 'wa-topic'] },
  { id: 'ni-kagiri', rx: /に限り/, replaces: ['ni-particle'] },
  { id: 'wo-nozoku', rx: /を除[くき]/, replaces: ['wo-object'] },
  { id: 'tsukimashite', rx: /つきましては/, back: 0, replaces: ['te-sequence', 'masu', 'wa-topic'] },
  { id: 'o-kudasai', rx: /[おご][一-鿿](?:(?![おご])[一-鿿ぁ-ん]){0,5}ください/, back: 0, replaces: ['te-kudasai', 'o-honorific'] },
  { id: 'o-itasu', rx: /[おご][一-鿿]{1,4}[ぁ-ん]?(?:いた|致)し(?:ます|ました)/, back: 0, replaces: ['masu', 'o-honorific'] },
  { id: 'kenjougo', rx: /(?<![おご][一-鿿]{1,4}[ぁ-ん]?)(?:いた|致)し(?:ます|ました)/, replaces: ['masu', 'masu-past'] },
  { id: 'sasete-itadaku', rx: /させていただ/, back: 1, replaces: ['te-sequence', 'causative', 'masu', 'te-morau'] },
  { id: 'te-itadaku', rx: /(?<!させ)[てで]いただ/, replaces: ['te-sequence', 'te-morau'] },
  { id: 'ni-tsuki', rx: /につき(?!まして)/, replaces: ['ni-particle'] },
  { id: 'ni-atatte', rx: /にあた(?:って|り)/, replaces: ['ni-particle', 'te-sequence'] },
  { id: 'ni-tomonai', rx: /に伴い/, replaces: ['ni-particle'] },
  { id: 'to-suru', rx: /(?:まで|禁止)と(?:し(?=、)|します)/, back: 0, replaces: ['to-and', 'to-with', 'to-quote', 'masu', 'made'] },
  { id: 'mono-to-shite', rx: /ものとして/, replaces: ['to-quote', 'te-sequence'] },
  { id: 'tame-reason', rx: /ため(?![にの])/, replaces: ['tame-ni'] },
  { id: 'sai', rx: /(?<!実)際(?=[はに、])/ },
  { id: 'te-ori', rx: /ており(?!ま)/, replaces: ['te-sequence'] },
  { id: 'to-naru', rx: /とな(?:る|ります|りました)/, replaces: ['to-with', 'to-and', 'plain-form'] },
  { id: 'mikomi', rx: /見込み/ },
  { id: 'koto-ni-naru', rx: /ことにな(?:り|っ)/, replaces: ['ni-naru'] },
  { id: 'koto-ga-dekiru', rx: /ことができ/ },
  { id: 'kadouka', rx: /かどうか/, replaces: ['ka-question'] },
  { id: 'sou-hearsay', rx: /(?<=[るうくすつぬぶむいただ])そう(?:です|だ)/, replaces: ['desu', 'da-plain'] },
  { id: 'you-ni-request', rx: /(?<=[るうくすつぬぶむ])よう(?:に)?(?=、|お願い)/, back: 1 },
  { id: 'ni-yori', rx: /により/, replaces: ['ni-particle'] },
  { id: 'reru-honorific', rx: /(?:さ|か|ま|わ|た|ら)れ(?:る|た)(?=(?:場合|方|お店|店|際))/, back: 1, replaces: ['passive'] },
  { id: 'yori-from', rx: /(?:日|分|時|月)より/, back: 1, replaces: ['yori'] },
  { id: 'ni-yoru-to', rx: /によると/, replaces: ['ni-particle', 'to-conditional'] },
  { id: 'tame-ni', rx: /ために/, replaces: ['ni-particle'] },
  { id: 'te-hoshii', rx: /てほしい/ },
];

const isPunct = p => !p.key && /^[、。「」　\s]+$/.test(p.src.replace(/\[[^\]]*\]/g, ''));

function readingGrammar(morphs, plain, pieces) {
  let g = detectGrammar(morphs, plain, GRAMMAR);
  for (const rule of READING_RULES) {
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
    for (let n = rule.back === undefined ? 1 : rule.back; n > 0 && k > 0 && !isPunct(pieces[k - 1]); n--) k--;
    const from = Math.min(coreFrom, pieces[k] ? pieces[k].from : coreFrom);
    g.push([rule.id, plain.slice(from, coreTo).replace(/^[・\s　]+/, '')]);
  }
  g = g.map(([id, sn]) => [id, sn.replace(/^[）」』\s　]+/, '')]);
  const madeNi = g.find(([id]) => id === 'made-ni');
  if (madeNi) g = g.filter(([id, sn]) => !(id === 'ni-particle' && madeNi[1].endsWith(sn)));
  // Written Japanese joins sentences with the ます-stem: 記入し、 for 記入して、.
  const i = morphs.findIndex((m, j) => m.pos === '動詞' && m.pos_detail_1 === '自立' && !['いる', 'おる', 'ある'].includes(m.basic_form) && m.conjugated_form === '連用形' && morphs[j + 1] && morphs[j + 1].surface_form === '、');
  if (i !== -1) {
    const p = pieces.find(q => q.from <= morphs[i].from && morphs[i].from < q.to);
    if (p) g.push(['masu-stem-and', plain.slice(p.from, p.to)]);
  }
  return g;
}

// ─── Our {漢字|かな} markup ⇄ the word finder's 漢字[かな] ─────────────────────
//
// The word finder keeps a reading with the kanji run before it; ours can
// also cover digits and kana ({20日|はつか}). Those go to the word finder as
// plain text, and every word's markup is cut from our own markup afterwards,
// keeping each {…|…} whole.

function ourUnits(markup) {
  const out = [];
  const re = /\{([^|}]+)\|([^}]+)\}|[\s\S]/gu;
  let m;
  while ((m = re.exec(markup))) out.push(m[1] ? { text: m[1], src: m[0] } : { text: m[0], src: m[0] });
  return out;
}
const toFinder = markup => markup.replace(/\{([^|}]+)\|([^}]+)\}/g, (all, base, reading) => (/^[㐀-䶿一-鿿々〆ヶ]+$/.test(base) ? `${base}[${reading}]` : base));

function split(markup) {
  const { pieces, morphs, plain } = segment(toFinder(markup));
  // The word finder can lose a character (two prefixes in a row, as in the
  // kana ごご); stop rather than shift every word after it.
  pieces.forEach((p, i) => {
    if (p.from !== (i ? pieces[i - 1].to : 0) || p.src.replace(/\[[^\]]*\]/g, '') !== plain.slice(p.from, p.to)) {
      throw new Error(`words don't line up in “${markup}” at “${p.src}” — write the word in kanji with furigana`);
    }
  });
  const us = ourUnits(markup);
  if (us.map(u => u.text).join('') !== plain) throw new Error(`plain text differs: ${markup}`);
  const owner = [];
  us.forEach((u, i) => { for (const _ of u.text) owner.push(i); });
  const merged = [];
  for (const p of pieces) {
    const prev = merged[merged.length - 1];
    if (prev && owner[p.from] === owner[prev.to - 1]) {
      prev.to = p.to;
      if (!prev.key || prev.key.miss) prev.key = p.key;
    } else merged.push({ ...p });
  }
  merged.forEach(p => { p.src = us.slice(owner[p.from], owner[p.to - 1] + 1).map(u => u.src).join(''); });
  return { pieces: fixPieces(numbersWhole(merged, plain)), morphs, plain };
}

// A number and its counter as one word (kuromoji splits 1,000円 into 1 / , /
// 000 / 円 and 6月 into 6 / 月): runs of digits, a comma or point between
// digits, then a counter (and 半 / ごろ / すぎ after 時).
function numbersWhole(pieces, plain) {
  const COUNTER_WORDS = new Set(COUNTERS.map(([c]) => c).concat(['時', '半', 'ごろ', 'すぎ']));
  const text = p => plain.slice(p.from, p.to);
  const isNum = p => /^(?:第)?[0-9０-９]+$/.test(text(p));
  const out = [];
  for (let i = 0; i < pieces.length; i++) {
    if (!isNum(pieces[i])) {
      const g = /^[0-9０-９]/.test(text(pieces[i])) && numberGloss(text(pieces[i]), pieces[i].src);
      out.push(g ? { ...pieces[i], key: g } : pieces[i]);
      continue;
    }
    let j = i;
    while (pieces[j + 2] && /^[,.]$/.test(text(pieces[j + 1])) && /^[0-9０-９]/.test(text(pieces[j + 2]))) j += 2;
    let k = j;
    let tail = '';
    while (pieces[k + 1] && COUNTER_WORDS.has(text(pieces[k + 1])) && COUNTERS.some(([c]) => c.startsWith(tail + text(pieces[k + 1])) || c === tail + text(pieces[k + 1]))) { tail += text(pieces[k + 1]); k++; }
    const run = pieces.slice(i, k + 1);
    const piece = { src: run.map(p => p.src).join(''), from: run[0].from, to: run[run.length - 1].to, key: null };
    const surface = plain.slice(piece.from, piece.to);
    const num = numberGloss(surface, piece.src);
    piece.key = num || (k === i ? pieces[i].key : null);
    if (num || k > i) { out.push(piece); i = k; } else out.push(pieces[i]);
  }
  return out;
}

// Words told apart by the text's own furigana: a lone weekday kanji
// （金）, {土|ど} is the day of the week; 方 read かた is "person".
const READING_FIXES = {
  '月|げつ': ['月(げつ)', ['げつ', 'Monday (short for 月曜日)', 'noun']],
  '火|か': ['火(か)', ['か', 'Tuesday (short for 火曜日)', 'noun']],
  '水|すい': ['水(すい)', ['すい', 'Wednesday (short for 水曜日)', 'noun']],
  '木|もく': ['木(もく)', ['もく', 'Thursday (short for 木曜日)', 'noun']],
  '金|きん': ['金(きん)', ['きん', 'Friday (short for 金曜日)', 'noun']],
  '土|ど': ['土(ど)', ['ど', 'Saturday (short for 土曜日)', 'noun']],
  '日|にち': ['日(にち)', ['にち', 'Sunday (short for 日曜日)', 'noun']],
  '方|かた': ['方(かた)', ['かた', 'person (polite: この方, …の方); (〜方) way of …ing', 'noun']],
  '何|なん': ['何(なん)', ['なん', 'what (read なん before d, n and t sounds: 何ですか)', 'question word']],
  '後|あと': ['後(あと)', ['あと', 'after, later', 'noun']],
};
function fixPieces(pieces) {
  return pieces.map((p, i) => {
    const m = /^\{([^|}]+)\|([^}]+)\}$/.exec(p.src);
    const fix = m && READING_FIXES[`${m[1]}|${m[2]}`];
    if (fix) return { ...p, key: fix };
    // 〜は何か。 is the written question "what is it?", not 何か "something".
    if (p.key && p.key[0] === '何か' && pieces[i + 1] && /^。/.test(pieces[i + 1].src)) return { ...p, key: ['何か(question)', ['なにか', 'what is it? (written question: 〜は何か)', 'question word']] };
    return p;
  });
}

// ─── Build ───────────────────────────────────────────────────────────────────

// A number and its counter (500円, 9時, 2階, 5冊…), glossed from the counter
// rather than listed one by one; the reading is the text's own.
const COUNTERS = [
  ['時ごろ', n => `around ${n} o'clock`], ['時すぎ', n => `just after ${n} o'clock`], ['時半ごろ', n => `around half past ${n}`], ['時半', n => `half past ${n}`],
  ['時間', n => `${n} hour${n === '1' ? '' : 's'}`], ['時', n => `${n} o'clock`], ['分', n => `${n} minute${n === '1' ? '' : 's'}`],
  ['日間', n => `${n} days`], ['日後', n => `${n} days later`], ['日前', n => `${n} days before`], ['日', n => `the ${ordinal(n)} (of the month); ${n} day${n === '1' ? '' : 's'}`],
  ['か月分', n => `${n} month${n === '1' ? "'s" : "s'"} worth`], ['か月', n => `${n} month${n === '1' ? '' : 's'}`], ['週間', n => `${n} week${n === '1' ? '' : 's'}`],
  ['万円', n => `${Number(n.replace(/,/g, '')) * 10000 > 0 ? (Number(n.replace(/,/g, '')) * 10000).toLocaleString('en') : n + '0,000'} yen`], ['円', n => `${n} yen`],
  ['階', n => `floor ${n}`], ['人', n => `${n} ${n === '1' ? 'person' : 'people'}`], ['名程度', n => `about ${n} people`], ['名', n => `${n} people (formal)`],
  ['冊', n => `${n} (books, magazines)`], ['枚', n => `${n} (tickets, sheets, flat things)`], ['まい', n => `${n} (flat things: bags, sheets)`],
  ['回', n => `${n} time${n === '1' ? '' : 's'}`], ['歳', n => `${n} years old`], ['さい', n => `${n} years old`], ['倍', n => `${n} times (as much)`],
  ['割', n => `${n}0 percent`], ['個', n => `${n} (items)`], ['台', n => `${n} (cars, machines)`], ['年度', n => `the ${n} (school / business) year`],
  ['年生', n => `year ${n} (of school / university)`], ['年', n => `the year ${n}`], ['月', n => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][n - 1] || `month ${n}`], ['号', n => `No. ${n}`],
  ['点', n => `${n} item${n === '1' ? '' : 's'}`], ['本', n => `${n} (bottles, long things)`], ['辺', n => `${n} sides`], ['社', n => `${n} companies`],
  ['こ', n => `${n} (things)`], ['つ', n => `${n} (things)`], ['泊', n => `${n} night${n === '1' ? '' : 's'} (staying)`],
  ['室', n => `${n} room${n === '1' ? '' : 's'}`], ['部', n => `${n} cop${n === '1' ? 'y' : 'ies'}`], ['丁目', n => `${n}-chome (block ${n} of a district)`],
  ['時間ごと', n => `every ${n} hour${n === '1' ? '' : 's'}`], ['分ごと', n => `every ${n} minutes`], ['日ごろ', n => `around the ${ordinal(n)}`],
  ['か月後', n => `${n} month${n === '1' ? '' : 's'} later`], ['日目', n => `day ${n}`], ['人目', n => `the ${ordinal(n)} person`], ['回分', n => `${n} times' worth`],
  ['千円', n => `${n},000 yen`], ['ぷん', n => `${n} minutes`], ['ふん', n => `${n} minutes`], ['cm', n => `${n} centimetres`], ['kg', n => `${n} kilograms`],
];
const ordinal = n => n + ((/1[123]$/.test(n) ? 'th' : { 1: 'st', 2: 'nd', 3: 'rd' }[n.slice(-1)]) || 'th');
const kanaOf = src => src.replace(/\{[^|}]+\|([^}]+)\}/g, '$1');
function numberGloss(surface, src) {
  const nth = /^第([0-9０-９]+)$/.exec(surface);
  if (nth) return [`${surface}(${kanaOf(src)})`, [kanaOf(src), `the ${ordinal(nth[1])}`, 'number']];
  const m = /^([0-9０-９][0-9０-９,.]*)(.*)$/.exec(surface);
  if (!m) return null;
  const hit = COUNTERS.find(([c]) => c === m[2]);
  return hit ? [`${surface}(${kanaOf(src)})`, [kanaOf(src), hit[1](m[1]), 'number']] : null;
}

const gloss = {};
const grammarUsed = new Set();
const lines = {};
const misses = new Map();

for (const passage of PASSAGES) {
  for (const { ja, sentence } of R.segments(passage)) {
    const key = R.segKey(ja);
    if (lines[key] && (lines[key].g || !sentence)) continue;
    const { pieces, morphs, plain } = split(ja);
    const words = [];
    pieces.forEach(({ src, key: k }) => {
      const num = k && k.miss ? numberGloss(k.miss, src) : null;
      if (num) {
        gloss[num[0]] = num[1];
        words.push([src, num[0]]);
      } else if (k && k.miss) {
        if (/[^\s0-9０-９,.:〜~ー・%％()（）①-⑨A-Z×\-/、：㎡]/.test(k.miss)) misses.set(k.miss, (misses.get(k.miss) || []).concat(passage.id));
        words.push(src);
      } else if (k && /^[0-9０-９,.:]+$/.test(R.plain(src))) {
        words.push(src);
      } else if (k) {
        gloss[k[0]] = k[1];
        words.push([src, k[0]]);
      } else words.push(src);
    });
    const w = words.reduce((acc, t) => {
      if (typeof t === 'string' && typeof acc[acc.length - 1] === 'string') acc[acc.length - 1] += t;
      else acc.push(t);
      return acc;
    }, []);
    const entry = { w };
    if (sentence) {
      entry.g = readingGrammar(morphs, plain, pieces);
      entry.g.forEach(([gid]) => {
        if (!GRAMMAR[gid]) throw new Error(`unknown grammar id ${gid}`);
        grammarUsed.add(gid);
      });
    }
    lines[key] = entry;
  }
}

const sorted = o => Object.fromEntries(Object.keys(o).sort().map(k => [k, o[k]]));
const grammar = sorted(Object.fromEntries([...grammarUsed].map(id => [id, GRAMMAR[id]])));
const entries = o => `{\n${Object.entries(o).map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)}`).join(',\n')}\n}`;
const js = `// Generated by scripts/tokenize_jlpt_reading.mjs from jlpt-reading-data.js — do not edit.
// JLPT_READING_WORDS.lines[segKey(markup)] is { w, g }: w lists the pieces —
// a string is plain text, [markup, key] a word whose [reading, meaning, part
// of speech] is gloss[key] — and g (sentences only) lists its grammar as
// [id, snippet], explained in grammar[id].
(function (global) {
  'use strict';
  global.JLPT_READING_WORDS = {
${['gloss', 'grammar', 'lines'].map(k => `"${k}":${entries({ gloss: sorted(gloss), grammar, lines: sorted(lines) }[k])}`).join(',\n')}
};
})(typeof window !== 'undefined' ? window : globalThis);
`;
writeFileSync(path.join(ROOT, 'jlpt-reading-words.js'), js);
console.log(`${Object.keys(lines).length} pieces of text, ${Object.keys(gloss).length} words, ${grammarUsed.size} grammar points; ${misses.size} words not found`);
if (process.argv.includes('--misses')) [...misses].sort((a, b) => b[1].length - a[1].length).forEach(([k, ids]) => console.log(k, ids.length, ids[0]));
