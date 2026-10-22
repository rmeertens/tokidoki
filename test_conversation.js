// Checks for the Conversation starters: every question has hints and a sample
// answer at each level, with furigana on every kanji, plus the helpers that
// parse hints and add them to your answer, and the sync merge of answers.
const { CONVERSATION_GROUPS, CONVERSATION_TOPICS } = require('./conversation-data.js');
const C = require('./conversation.js');
const M = require('./sync-merge.js');

let passed = 0;
let failed = 0;
function ok(cond, label) {
  if (cond) passed++;
  else { failed++; console.log('  FAIL: ' + label); }
}

const KANJI_RE = /[㐀-䶿一-鿿々〆ヶ]/;
// Kanji left over once every 漢字[よみ] is taken out has no furigana.
function checkMarkup(text, where) {
  ok(!KANJI_RE.test(String(text).replace(/[㐀-䶿一-鿿々〆ヶ]+\[[^\]]+\]/g, '')), `${where}: kanji without furigana in ${JSON.stringify(text)}`);
  ok(!/\[[^\]]*[^ぁ-ゖー\]][^\]]*\]/.test(text), `${where}: furigana that isn't hiragana in ${JSON.stringify(text)}`);
  ok((text.match(/\[/g) || []).length === (text.match(/\]/g) || []).length, `${where}: unbalanced brackets`);
}

// ─── Data ──────────────────────────────────────────────────────────────────
const ids = new Set();
const groups = new Set(CONVERSATION_GROUPS.map(g => g.id));
ok(CONVERSATION_TOPICS.length >= 20, 'at least 20 questions');
const lengths = { N5: [], N4: [], N3: [] };
CONVERSATION_TOPICS.forEach(t => {
  ok(/^[a-z0-9-]+$/.test(t.id) && !ids.has(t.id), `${t.id}: id is a unique slug`);
  ids.add(t.id);
  ok(groups.has(t.group), `${t.id}: known group ${t.group}`);
  C.LEVELS.forEach(level => {
    const where = `${t.id} ${level}`;
    ok(!!t[level], `${where}: has the level`);
    if (!t[level]) return;
    const d = C.levelData(t, level);
    checkMarkup(d.q.ja, where + ' question');
    ok(d.q.en.length > 0, `${where}: question has English`);
    ok(d.words.length >= 4, `${where}: at least 4 words`);
    ok(d.verbs.length >= 3, `${where}: at least 3 verbs`);
    ok(d.grammar.length >= 2, `${where}: at least 2 grammar points`);
    ok(d.start.length === 1, `${where}: a way to begin`);
    [...d.words, ...d.verbs, ...d.start].forEach(h => {
      checkMarkup(h.ja, where);
      ok(h.ja && h.en && !h.ex, `${where}: hint ${JSON.stringify(h.ja)} is 'word|meaning'`);
    });
    d.grammar.forEach(h => {
      checkMarkup(h.ja, where);
      checkMarkup(h.ex, where);
      ok(h.ja && h.en && h.ex && h.exEn, `${where}: grammar ${JSON.stringify(h.ja)} has a meaning, example and English`);
    });
    checkMarkup(d.answer.ja, where + ' answer');
    ok(d.answer.en.length > 20, `${where}: sample answer has English`);
    ok(/[。？！]$/.test(C.plain(d.answer.ja)), `${where}: sample answer ends a sentence`);
    lengths[level].push(C.charCount(C.plain(d.answer.ja)));
  });
  // The levels really differ.
  const w = level => t[level] && t[level].words.join();
  ok(w('N5') !== w('N4') && w('N4') !== w('N3'), `${t.id}: different words per level`);
  ok(t.N5.answer[0] !== t.N4.answer[0] && t.N4.answer[0] !== t.N3.answer[0], `${t.id}: different answers per level`);
  ok(C.charCount(C.plain(t.N3.answer[0])) > C.charCount(C.plain(t.N5.answer[0])), `${t.id}: N3 answer is longer than N5`);
});
const avg = a => a.reduce((x, y) => x + y, 0) / a.length;
ok(avg(lengths.N5) < avg(lengths.N4) && avg(lengths.N4) < avg(lengths.N3), 'sample answers get longer level by level');
CONVERSATION_GROUPS.forEach(g => ok(CONVERSATION_TOPICS.some(t => t.group === g.id), `group ${g.id} has questions`));

// ─── Helpers ───────────────────────────────────────────────────────────────
ok(C.rubyHtml('日本[にほん]へ') === '<ruby>日本<rt>にほん</rt></ruby>へ', 'rubyHtml');
ok(C.plain('食[た]べました') === '食べました', 'plain');
ok(C.kana('食[た]べました') === 'たべました', 'kana');
ok(JSON.stringify(C.parseHint('〜たいです|want to …|行[い]きたいです。|I want to go.')) ===
  JSON.stringify({ ja: '〜たいです', en: 'want to …', ex: '行[い]きたいです。', exEn: 'I want to go.' }), 'parseHint');
ok(C.insertable('〜歳[さい]') === '歳', 'insertable drops 〜');
ok(C.insertable('〜から来[き]ました') === 'から来ました', 'insertable keeps the rest');
let r = C.insertAt('私は。', 2, 2, '学生です');
ok(r.value === '私は学生です。' && r.caret === 6, 'insertAt puts text at the caret');
r = C.insertAt('abc', 1, 2, 'X');
ok(r.value === 'aXc' && r.caret === 2, 'insertAt replaces the selection');
r = C.insertAt('', null, null, '犬');
ok(r.value === '犬' && r.caret === 1, 'insertAt with no caret appends');
ok(C.charCount('日本 語\nです') === 5, 'charCount skips spaces');
ok(C.answerKey('food', 'N4') === 'food:N4', 'answerKey');
const items = C.hintItems(C.levelData(CONVERSATION_TOPICS[0], 'N5'));
ok(items[0].id === 'words-0' && items[0].step === 'words', 'hintItems: words first');
ok(new Set(items.map(h => h.id)).size === items.length, 'hintItems: unique ids');
ok(items[items.length - 1].step === 'start', 'hintItems: the way to begin last');

// ─── Hints your answer uses ────────────────────────────────────────────────
const weekend = C.hintItems(C.levelData(CONVERSATION_TOPICS.find(t => t.id === 'weekend'), 'N4'));
const usedIn = text => C.usedHints(text, weekend);
const has = (text, id) => usedIn(text).includes(id);
ok(has('久しぶりに友達に会いました。', 'words-0'), 'uses: a word in kanji');
ok(has('ひさしぶりに', 'words-0'), 'uses: the same word in kana');
ok(has('友達に会いました。', 'verbs-1'), 'uses: a verb in another form (会う → 会いました)');
ok(!has('会社に行きました。', 'verbs-1'), 'uses: a lone kanji inside another word does not count (会社)');
ok(has('疲れました', 'verbs-2') && has('つかれた', 'verbs-2'), 'uses: verb stems, kanji or kana');
ok(has('掃除をしたり、洗濯をしたりしました。', 'grammar-0'), 'uses: a pattern with two parts (〜たり〜たりしました)');
ok(!has('掃除をしました。', 'grammar-0'), 'uses: half a pattern does not count');
ok(has('食べてから', 'grammar-1'), 'uses: 〜てから');
ok(!has('せんた', 'words-2'), 'uses: nouns are not cut short (洗濯 needs all of せんたく)');
ok(usedIn('').length === 0 && usedIn('はい。').length === 0, 'uses: nothing in a short answer');
// Every hint can be spotted when you write it out: its words in its own example
// or its plain form.
CONVERSATION_TOPICS.forEach(t => C.LEVELS.forEach(level => {
  C.hintItems(C.levelData(t, level)).forEach(h => {
    if (C.matchForms(h, h.step).length && h.step !== 'grammar') ok(C.usedHints(C.insertable(h.ja), [h]).length === 1, `${t.id} ${level}: ${h.ja} is spotted when written`);
  });
}));

// conversation-words.js is made from conversation-data.js.
{
  const W = require('./conversation-words.js');
  const hash = require('crypto').createHash('sha1').update(require('fs').readFileSync(require.resolve('./conversation-data.js'))).digest('hex').slice(0, 16);
  ok(W.source === hash, 'conversation-words.js is up to date — run node scripts/build_conversation_words.mjs (after npm install --no-save kuromoji)');
  CONVERSATION_TOPICS.forEach(t => C.LEVELS.forEach(level => C.hintItems(C.levelData(t, level)).forEach(h => {
    if (h.step === 'words' || h.step === 'verbs') ok(Array.isArray(h.lemmas) && h.lemmas.length > 0, `${t.id} ${level} ${h.ja}: has dictionary forms`);
  })));
}
// Splitting answers into words.
const split = t => C.segment(t).map(x => x.surface).join('|');
ok(split('わたしは日本に住んでいます') === 'わたし|は|日本|に|住んでいます', 'segment: 日本 is one word, 住んでいます another');
ok(split('とても面白かったです') === 'とても|面白かったです', 'segment: 面白かった is one word (not 面白 + かった)');
ok(split('どようびに ともだちと えいがを みました') === 'どようび|に|ともだち|と|えいが|を|みました', 'segment: kana with spaces');
ok(split('ちちとははとあにがいます') === 'ちち|と|はは|と|あに|が|います', 'segment: kana without spaces');
ok(split('彼しかいません') === '彼|しか|いません', 'segment: しか|いません, not し|かいません');

// Answers as a learner might type them (kana or kanji, spaces or not, other
// forms of the words): the hints each must unlock, and some it mustn't.
const LEARNER = [
  // A second set, written before the word matcher was run on it.

  ['weekend', 'N5', 'にちようびは こうえんに いきました。ともだちと はなしました。', ['日曜日', '公園', '行きました', '友達', '話しました', '〜ました'], ['映画']],
  ['weekend', 'N4', '久しぶりに友達に会って、カフェで話したり、散歩したりしました。', ['久しぶりに', 'カフェ', '散歩', '会う', '〜たり〜たりしました'], ['洗濯', '片付ける']],
  ['family', 'N5', 'いもうとが ふたり います。母は やさしいです。', ['妹', '母', '優しいです', 'います'], ['犬', '父']],
  ['food', 'N4', '魚より肉のほうが好きです。母がよく焼き魚を作ってくれました。', ['焼き魚', '作ってくれる', 'AよりBのほうが', '〜てくれる'], ['納豆']],
  ['hometown', 'N5', 'えきのちかくに おおきい スーパーが あります。でも、みせは すくないです。', ['駅', 'スーパー', 'あります', '少ないです', '〜に〜があります'], ['川', '静かです']],
  ['morning', 'N5', 'まいあさ 6じに おきて、パンを たべます。', ['パン', '起きます', '食べます'], ['シャワー', 'コーヒー']],
  ['today', 'N4', '電車が遅れて、会社に遅刻してしまいました。', ['遅刻', '遅れる', '〜てしまいました'], ['会議']],
  ['hobby', 'N5', 'しゅみは テニスです。よく こうえんで テニスを します。', ['テニス', 'します', 'よく〜ます'], ['音楽', '本']],
  ['travel', 'N5', 'きょうとに いきたいです。おてらを みたいです。', ['お寺', '行きたいです', '見たいです', '〜に行きたいです'], ['海', '温泉']],
  ['season', 'N5', 'あきが いちばん すきです。すずしいですから。', ['秋', '涼しいです', '〜が一番好きです'], ['桜', '冬']],
  ['cooking', 'N4', '一人暮らしを始めてから、自炊するようにしています。', ['自炊', '始める', '〜ようにしています'], ['外食']],
  ['shopping', 'N3', 'ジャケットに一目ぼれして、ついかってしまいました。', ['一目ぼれ', 'つい〜てしまう'], ['口コミ']],
  ['childhood', 'N4', '子供のころ、毎日虫を集めていました。', ['虫', '集める', '〜ていました'], ['森']],
  ['friend', 'N4', '親友とは大学で知り合いました。いつも話を聞いてくれます。', ['親友', '知り合う', '話を聞く', '〜てくれます'], ['性格']],
  ['smartphone', 'N5', 'まいにち スマホで しゃしんを とります。ちずも みます。', ['スマホ', '写真', '撮ります', '地図', '見ます', '〜で〜ます'], ['友達']],
  ['future', 'N5', 'いつか せんせいに なりたいです。', ['先生', 'なりたいです', 'いつか〜たいです', '〜になりたいです'], ['医者']],

  ['weekend', 'N5', 'どようびに ともだちと えいがを みました。たのしかったです。', ['土曜日', '友達', '映画', '〜ました', '〜かったです'], ['公園', '〜と一緒に']],
  ['weekend', 'N5', '土曜日は友達と映画を見ました。面白かったです。', ['土曜日', '友達', '映画', '〜ました', '〜かったです'], ['日曜日']],
  ['family', 'N5', 'ちちと ははと あにが います。いぬも います。', ['父', '母', '兄', '犬', 'います'], ['姉', '妹', '弟']],
  ['friend', 'N5', 'ゆきさんは とても あかるくて おもしろい ひとです。', ['明るい', '面白い', '〜人です'], ['背が高い']],
  ['friend', 'N5', 'ケンさんは背が高くて、明るい人です。よく話します。', ['背が高い', '明るい', '話します', '〜人です'], ['面白い']],
  ['food', 'N5', 'わたしは すしが いちばん すきです。でも にくは あまり たべません。', ['すし', '肉', '好きです', '食べます', '一番〜', 'あまり〜ません'], ['野菜']],
  ['hometown', 'N5', 'わたしの まちは ちいさくて しずかです。えきの まえに スーパーが あります。', ['町', '駅', 'スーパー', '小さいです', '静かです', 'あります', '〜に〜があります', '〜くて、〜'], ['川', 'レストラン']],
  ['today', 'N5', 'けさ 7じに おきました。うちに かえってから ねました。', ['起きました', '帰りました', '〜てから'], ['働きました']],
  ['best-trip', 'N5', 'きょねん かぞくと うみで およいで、たのしかったです。', ['去年', '家族', '海', '泳ぎました', '楽しかったです', '〜かったです'], ['天気']],
  ['morning', 'N4', 'まず コーヒーを のみながら ニュースを みます。', ['まず', 'ニュース', '〜ながら'], ['お弁当']],
  ['hobby', 'N4', 'ギターを ひくことが すきです。まいにち れんしゅうを つづけています。', ['ギター', '練習', '続ける'], ['曲']],
  ['shopping', 'N4', 'セールで そうじきを かいました。かってよかったです。', ['セール', '掃除機', '〜てよかった'], ['ネット']],
  ['city-country', 'N4', '年をとったら、いなかで のんびり くらしたいです。', ['年をとる', '暮らす'], ['家賃']],
  ['best-trip', 'N4', 'みちに まよって しまいました。でも 地元の人が あんないしてくれました。', ['道に迷う', '地元の人', '案内する', '〜てしまいました'], ['鳥居']],
  ['hobby', 'N3', 'さいきん しょうぎに はまっています。やればやるほど おもしろいです。', ['将棋', 'はまる', '〜ば〜ほど'], ['仲間']],
  ['weekend', 'N3', 'おゆに ゆっくり つかって、げんきに なりました。', ['つかる'], ['家事']],
  ['season', 'N3', '空気が澄んでいて、山がよく見えます。', ['空気が澄む'], ['こたつ']],
  ['introduce', 'N5', 'わたしは がくせいです。にほんごを べんきょうしています。', ['学生', '勉強しています'], ['会社員']],
];
LEARNER.forEach(([id, level, answer, must, mustNot]) => {
  const items = C.hintItems(C.levelData(CONVERSATION_TOPICS.find(t => t.id === id), level));
  const used = new Set(C.usedHints(answer, items).map(x => C.plain(items.find(h => h.id === x).ja)));
  must.forEach(m => ok(used.has(m), `learner ${id} ${level}: ${m} spotted in ${answer}`));
  mustNot.forEach(m => ok(!used.has(m), `learner ${id} ${level}: ${m} not spotted in ${answer}`));
});
// Forms of words, and words inside other words.
const usedIn2 = (id, level, text) => { const items = C.hintItems(C.levelData(CONVERSATION_TOPICS.find(t => t.id === id), level)); return C.usedHints(text, items).map(x => C.plain(items.find(h => h.id === x).ja)); };
ok(usedIn2('friend', 'N5', '明るくて').includes('明るい') && usedIn2('friend', 'N5', 'あかるかった').includes('明るい'), 'uses: an adjective in other forms');
ok(usedIn2('today', 'N5', '朝七時に').includes('朝'), 'uses: a lone kanji next to a number (朝七時)');
ok(usedIn2('shopping', 'N5', '五千円でした').includes('〜円'), 'uses: a counter after a number (五千円)');
ok(!usedIn2('travel', 'N5', '北海道に行きたい').includes('海'), 'uses: 海 is not in 北海道');
ok(!usedIn2('hobby', 'N5', '日本の歌').includes('本'), 'uses: 本 is not in 日本');
ok(!usedIn2('shopping', 'N5', 'とても面白かったです').includes('買いました') && !usedIn2('shopping', 'N5', '彼しかいません').length, 'uses: かった in 面白かった is not 買った');
ok(!usedIn2('hometown', 'N5', '両立しやすくなりました').includes('少ないです'), 'uses: すくな in やすくなりました is not 少ない');
ok(usedIn2('family', 'N4', '父に似ているとよく言われます').includes('〜と言われます'), 'uses: a word between a pattern\'s particle and the rest');
ok(usedIn2('hometown', 'N4', '静かだし、自然も多いし').includes('〜し、〜し'), 'uses: 〜し、〜し');
ok(usedIn2('season', 'N4', '食べすぎた').includes('〜すぎます') && usedIn2('season', 'N4', '暑すぎる').includes('〜すぎます'), 'uses: a polite pattern in its plain past and dictionary forms (〜すぎます → すぎた, すぎる)');
ok(usedIn2('future', 'N3', 'ずっと働いてきた').includes('〜てきました'), 'uses: 〜てきました as 〜てきた');
ok(usedIn2('introduce', 'N5', 'わたしはアンナです').includes('私は〜です'), 'uses: 私は〜です in kana');
ok(usedIn2('why-japanese', 'N5', 'えいごで').includes('〜語で') && !usedIn2('why-japanese', 'N5', 'でんしゃで').includes('〜語で'), 'uses: 〜語で needs a language');

// Nearly every grammar point is spotted in its own example sentence.
let spotted = 0, grammarTotal = 0;
CONVERSATION_TOPICS.forEach(t => C.LEVELS.forEach(level => {
  C.hintItems(C.levelData(t, level)).filter(h => h.step === 'grammar').forEach(h => {
    grammarTotal++;
    if (C.usedHints(C.plain(h.ex), [h]).length) spotted++;
  });
}));
ok(spotted === grammarTotal, `uses: every grammar point spotted in its own example (${spotted}/${grammarTotal})`);
ok(has('友達と会うことにしました', 'verbs-1'), 'uses: 会う in its dictionary form');

// ─── Writing in kanji ──────────────────────────────────────────────────────
const dict = C.buildKanjiDict(CONVERSATION_TOPICS);
const kanji = (text, upto) => C.toKanji(text, dict, upto == null ? text.length + 1 : upto).text;
ok(kanji('どようび は ともだちと えいがを みました。') === '土曜日 は 友達と 映画を 見ました。', 'kanji: words become kanji');
ok(kanji('わたしはかわいいねこが') === '私はかわいい猫が', 'kanji: a noun after an adjective');
ok(kanji('いいえ、') === 'いいえ、', 'kanji: いいえ is not 家');
ok(kanji('かいしゃい', 5) === 'かいしゃい', 'kanji: a word that might go on (かいしゃ|い) waits');
ok(kanji('かいしゃいんです', 8) === '会社員です', 'kanji: the longest word wins');
ok(kanji('どようび', 4) === 'どようび', 'kanji: the word at the caret stays kana');
ok(kanji('すし と ケーキ') === 'すし と ケーキ', 'kanji: words without kanji stay');
let k = C.toKanji('ははと ', dict, 4);
ok(k.text === '母と ' && k.caret === 3 && k.changed[0].to === '母', 'kanji: caret moves with the shorter text');
ok(kanji('あいました。') === '会いました。' && kanji('かえって ') === '帰って ', 'kanji: verbs in other forms (会う, 帰る)');
ok(kanji('べんきょうしました。') === '勉強しました。' && kanji('たべてから') === '食べてから', 'kanji: する verbs and ichidan verbs');
ok(kanji('いまs', 3) === 'いまs' && kanji('います。') === 'います。', 'kanji: romaji still being typed is not the end of a word (いま|s → います, not 今す)');
ok(kanji('いまは ') === '今は ', 'kanji: いま before a particle is still 今');
const cands = C.buildKanjiCandidates(CONVERSATION_TOPICS, [], [{ kanji: '居間', kana: 'いま' }, { kanji: '走る', kana: 'はしる' }]);
ok(cands.get('いま')[0] === '今' && cands.get('いま').includes('居間'), 'candidates: every spelling, the commonest first');
ok((cands.get('はしります') || []).includes('走ります') && (cands.get('はしって') || []).includes('走って'), 'candidates: vocabulary verbs bring their forms');
const vf = (w, r) => C.verbForms(w, r).forms;
ok(vf('見る', 'みる').includes('て') && vf('帰る', 'かえる').includes('って'), 'verbForms: 見る is ichidan, 帰る is godan');
ok(vf('行く', 'いく').includes('って') && vf('泳ぐ', 'およぐ').includes('いで') && vf('読む', 'よむ').includes('んで'), 'verbForms: te-forms');
ok(C.verbForms('来る', 'くる') === null && C.verbForms('名前', 'なまえ') === null, 'verbForms: 来る and nouns are left alone');
ok(dict.get('なか') === '中' && dict.get('かわ') === '川', 'kanji: the commonest spelling of a reading');
ok(!dict.has('はん') && !dict.has('きも'), 'kanji: no pieces of longer words (ご飯, 気持ち)');
[...dict].forEach(([r, w]) => ok(/^[ぁ-ゖー]+$/.test(r) && /[㐀-䶿一-鿿々]/.test(w), `kanji: ${r} → ${w} is kana → kanji`));

// ─── Sync ──────────────────────────────────────────────────────────────────
const J = JSON.stringify;
const base = { answers: { 'food:N5': { text: 'すしです。', t: 1 }, 'hobby:N5': { text: 'テニス', t: 1 } } };
const out = JSON.parse(M.mergeAll({ tokidoki_conversation: J(base) },
  { tokidoki_conversation: J({ answers: { 'food:N5': { text: 'ラーメンです。', t: 5 }, 'hobby:N5': { text: 'テニス', t: 1 }, 'family:N4': { text: '四人家族です。', t: 3 } } }) },
  { tokidoki_conversation: J({ answers: { 'food:N5': { text: 'そばです。', t: 4 }, 'season:N3': { text: '冬です。', t: 6 } } }) },
).tokidoki_conversation);
ok(out.answers['food:N5'].text === 'ラーメンです。', 'sync: the newer answer wins');
ok(out.answers['family:N4'] && out.answers['season:N3'], 'sync: answers from both devices kept');
ok(!out.answers['hobby:N5'], 'sync: an answer cleared on one device stays cleared');

console.log(`conversation: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
