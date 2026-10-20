const Conjugator = require('./conjugator.js');
const { ALL_VERBS } = require('./verbs.js');

let passed = 0;
let failed = 0;

function assert(actual, expected, label) {
  if (actual === expected) {
    passed++;
  } else {
    failed++;
    console.log(`  FAIL: ${label}`);
    console.log(`    expected: ${expected}`);
    console.log(`    actual:   ${actual}`);
  }
}

function testVerb(verbData, tests) {
  const label = `${verbData.kanji} (${verbData.reading}) [${verbData.type}]`;
  console.log(`Testing ${label}`);
  for (const [form, expected] of Object.entries(tests)) {
    const result = Conjugator.conjugate(verbData, form);
    assert(result, expected, `${label} → ${form}`);
  }
}

// --- U-verb: 書く (く ending) ---
testVerb(
  { kanji: '書く', reading: 'かく', type: 'u', chapter: 4 },
  {
    'masu': 'かきます',
    'masu-neg': 'かきません',
    'masu-past': 'かきました',
    'masu-past-neg': 'かきませんでした',
    'te': 'かいて',
    'ta': 'かいた',
    'nai': 'かかない',
    'nakatta': 'かかなかった',
    'dict': 'かく',
    'tai': 'かきたい',
    'potential': 'かける',
    'volitional': 'かこう',
    'passive': 'かかれる',
    'causative': 'かかせる',
    'causative-passive': 'かかせられる',
    'ba': 'かけば',
  }
);

// --- U-verb: 話す (す ending) ---
testVerb(
  { kanji: '話す', reading: 'はなす', type: 'u', chapter: 3 },
  {
    'masu': 'はなします',
    'te': 'はなして',
    'ta': 'はなした',
    'nai': 'はなさない',
    'potential': 'はなせる',
    'volitional': 'はなそう',
    'passive': 'はなされる',
    'causative': 'はなさせる',
    'ba': 'はなせば',
  }
);

// --- U-verb: 飲む (む ending) ---
testVerb(
  { kanji: '飲む', reading: 'のむ', type: 'u', chapter: 3 },
  {
    'masu': 'のみます',
    'te': 'のんで',
    'ta': 'のんだ',
    'nai': 'のまない',
    'potential': 'のめる',
    'passive': 'のまれる',
    'causative': 'のませる',
  }
);

// --- U-verb: 遊ぶ (ぶ ending) ---
testVerb(
  { kanji: '遊ぶ', reading: 'あそぶ', type: 'u', chapter: 6 },
  {
    'masu': 'あそびます',
    'te': 'あそんで',
    'ta': 'あそんだ',
    'nai': 'あそばない',
    'potential': 'あそべる',
  }
);

// --- U-verb: 死ぬ (ぬ ending) ---
testVerb(
  { kanji: '死ぬ', reading: 'しぬ', type: 'u', chapter: 6 },
  {
    'masu': 'しにます',
    'te': 'しんで',
    'ta': 'しんだ',
    'nai': 'しなない',
    'potential': 'しねる',
  }
);

// --- U-verb: 待つ (つ ending) ---
testVerb(
  { kanji: '待つ', reading: 'まつ', type: 'u', chapter: 4 },
  {
    'masu': 'まちます',
    'te': 'まって',
    'ta': 'まった',
    'nai': 'またない',
    'potential': 'まてる',
    'passive': 'またれる',
  }
);

// --- U-verb: 買う (う ending) ---
testVerb(
  { kanji: '買う', reading: 'かう', type: 'u', chapter: 4 },
  {
    'masu': 'かいます',
    'te': 'かって',
    'ta': 'かった',
    'nai': 'かわない',
    'potential': 'かえる',
    'volitional': 'かおう',
  }
);

// --- U-verb: 帰る (る ending, u-verb!) ---
testVerb(
  { kanji: '帰る', reading: 'かえる', type: 'u', chapter: 3 },
  {
    'masu': 'かえります',
    'te': 'かえって',
    'ta': 'かえった',
    'nai': 'かえらない',
    'potential': 'かえれる',
  }
);

// --- U-verb: 泳ぐ (ぐ ending) ---
testVerb(
  { kanji: '泳ぐ', reading: 'およぐ', type: 'u', chapter: 5 },
  {
    'masu': 'およぎます',
    'te': 'およいで',
    'ta': 'およいだ',
    'nai': 'およがない',
    'potential': 'およげる',
  }
);

// --- U-verb: 行く (special te-form) ---
testVerb(
  { kanji: '行く', reading: 'いく', type: 'u', chapter: 3 },
  {
    'masu': 'いきます',
    'te': 'いって',
    'ta': 'いった',
    'nai': 'いかない',
    'potential': 'いける',
    'volitional': 'いこう',
  }
);

// --- Ru-verb: 食べる ---
testVerb(
  { kanji: '食べる', reading: 'たべる', type: 'ru', chapter: 3 },
  {
    'masu': 'たべます',
    'masu-neg': 'たべません',
    'masu-past': 'たべました',
    'te': 'たべて',
    'ta': 'たべた',
    'nai': 'たべない',
    'nakatta': 'たべなかった',
    'tai': 'たべたい',
    'potential': 'たべられる',
    'volitional': 'たべよう',
    'passive': 'たべられる',
    'causative': 'たべさせる',
    'causative-passive': 'たべさせられる',
    'ba': 'たべれば',
  }
);

// --- Ru-verb: 見る ---
testVerb(
  { kanji: '見る', reading: 'みる', type: 'ru', chapter: 3 },
  {
    'masu': 'みます',
    'te': 'みて',
    'nai': 'みない',
    'potential': 'みられる',
    'volitional': 'みよう',
  }
);

// --- Irregular: する ---
testVerb(
  { kanji: 'する', reading: 'する', type: 'irregular', chapter: 3 },
  {
    'masu': 'します',
    'masu-neg': 'しません',
    'te': 'して',
    'ta': 'した',
    'nai': 'しない',
    'nakatta': 'しなかった',
    'tai': 'したい',
    'potential': 'できる',
    'volitional': 'しよう',
    'passive': 'される',
    'causative': 'させる',
    'causative-passive': 'させられる',
    'ba': 'すれば',
  }
);

// --- Irregular: 来る ---
testVerb(
  { kanji: '来る', reading: 'くる', type: 'irregular', chapter: 3 },
  {
    'masu': 'きます',
    'masu-neg': 'きません',
    'te': 'きて',
    'ta': 'きた',
    'nai': 'こない',
    'nakatta': 'こなかった',
    'tai': 'きたい',
    'potential': 'こられる',
    'volitional': 'こよう',
    'passive': 'こられる',
    'causative': 'こさせる',
    'ba': 'くれば',
  }
);

// --- Irregular: 勉強する (compound する) ---
testVerb(
  { kanji: '勉強する', reading: 'べんきょうする', type: 'irregular', chapter: 3 },
  {
    'masu': 'べんきょうします',
    'te': 'べんきょうして',
    'nai': 'べんきょうしない',
    'potential': 'べんきょうできる',
    'volitional': 'べんきょうしよう',
    'passive': 'べんきょうされる',
  }
);

// --- Irregular: 持ってくる (compound くる) ---
testVerb(
  { kanji: '持ってくる', reading: 'もってくる', type: 'irregular', chapter: 6 },
  {
    'masu': 'もってきます',
    'te': 'もってきて',
    'nai': 'もってこない',
    'potential': 'もってこられる',
  }
);

// --- ある: plain negative is ない, not あらない ---
testVerb(
  { kanji: 'ある', reading: 'ある', type: 'u', chapter: 4 },
  {
    'masu': 'あります',
    'masu-neg': 'ありません',
    'nai': 'ない',
    'nakatta': 'なかった',
    'ta': 'あった',
  }
);

// --- Honorific verbs with an い polite stem ---
testVerb(
  { kanji: 'いらっしゃる', reading: 'いらっしゃる', type: 'u', chapter: 19 },
  {
    'masu': 'いらっしゃいます',
    'masu-past': 'いらっしゃいました',
    'te': 'いらっしゃって',
    'nai': 'いらっしゃらない',
  }
);
testVerb(
  { kanji: 'おっしゃる', reading: 'おっしゃる', type: 'u', chapter: 19 },
  { 'masu': 'おっしゃいます', 'masu-neg': 'おっしゃいません' }
);
testVerb(
  { kanji: '下さる', reading: 'くださる', type: 'u', chapter: 19 },
  { 'masu': 'くださいます', 'masu-past-neg': 'くださいませんでした', 'ta': 'くださった' }
);
testVerb(
  { kanji: '召し上がる', reading: 'めしあがる', type: 'u', chapter: 19 },
  { 'masu': 'めしあがります' }
);

// --- Kanji spellings of adjectives ---
console.log('Testing adjective kanji spellings');
assert(Conjugator.conjugateKanji({ kanji: '元気', reading: 'げんき', type: 'na-adj' }, 'adj-past'), '元気だった', '元気 → adj-past (kanji)');
assert(Conjugator.conjugateKanji({ kanji: '好き', reading: 'すき', type: 'na-adj' }, 'adj-neg'), '好きじゃない', '好き → adj-neg (kanji)');
assert(Conjugator.conjugateKanji({ kanji: '高い', reading: 'たかい', type: 'i-adj' }, 'adj-past'), '高かった', '高い → adj-past (kanji)');
assert(Conjugator.conjugateKanji({ kanji: 'きれい', reading: 'きれい', type: 'na-adj' }, 'adj-te'), null, 'きれい has no kanji spelling');

// --- Every accepted answer for an adjective card ---
console.log('Testing accepted adjective answers');
const adjAns = (kanji, reading, type, form, opts) => Conjugator.adjAnswers({ kanji, reading, type }, form, opts).join(' / ');
assert(adjAns('高い', 'たかい', 'i-adj', 'adj-neg'), 'たかくない / 高くない', '高い → plain kana and kanji');
assert(adjAns('静か', 'しずか', 'na-adj', 'adj-neg'), 'しずかじゃない / 静かじゃない / しずかではない / 静かではない', '静か → じゃない or ではない');
assert(adjAns('静か', 'しずか', 'na-adj', 'adj-past-neg'), 'しずかじゃなかった / 静かじゃなかった / しずかではなかった / 静かではなかった', '静か → じゃなかった or ではなかった');
assert(adjAns('静か', 'しずか', 'na-adj', 'adj-past'), 'しずかだった / 静かだった', '静か → past has one ending');
assert(adjAns('おもしろい', 'おもしろい', 'i-adj', 'adj-past'), 'おもしろかった / 面白かった', 'おもしろい → 面白い');
assert(adjAns('いい', 'いい', 'i-adj', 'adj-present'), 'いい / よい / 良い', 'いい → よい, 良い');
assert(adjAns('いい', 'いい', 'i-adj', 'adj-te'), 'よくて / 良くて', 'いい → 良くて');
assert(adjAns('かっこいい', 'かっこいい', 'i-adj', 'adj-neg'), 'かっこよくない / かっこ良くない', 'かっこいい → かっこ良くない');
assert(adjAns('ハンサム', 'はんさむ', 'na-adj', 'adj-present'), 'ハンサムだ / はんさむだ', 'ハンサム shown in katakana first');
assert(adjAns('速い', 'はやい', 'i-adj', 'adj-neg'), 'はやくない / 速くない / 早くない', 'はやい "fast / early" → 早い too');
assert(adjAns('速い', 'はやい', 'i-adj', 'adj-neg', { sameSense: true }), 'はやくない / 速くない', 'not 早い in a sentence about speed');
assert(adjAns('暖かい', 'あたたかい', 'i-adj', 'adj-neg', { sameSense: true }), 'あたたかくない / 暖かくない', 'not 温かい in a sentence about the weather');

// --- Test getFormsForLevel ---
console.log('\nTesting getFormsForLevel...');
const n5Forms = Conjugator.getFormsForLevel('N5');
assert(n5Forms.includes('masu'), true, 'N5 has masu');
assert(n5Forms.includes('te'), true, 'N5 has te');
assert(n5Forms.includes('tai'), true, 'N5 has tai');
assert(n5Forms.includes('potential'), false, 'N5 does NOT have potential');
assert(Conjugator.getFormsForLevel('N4').length, Conjugator.ALL_FORMS.length, 'N4 has all forms');

// --- Test the Verbs page chunks ---
console.log('\nTesting verb chunks...');
const { VERB_CHUNKS, getChunkCards, verbLevel } = require('./verbs.js');
ALL_VERBS.forEach(v => assert(!!verbLevel(v), true, `${v.kanji} is in a chunk`));
const pairs = new Set();
VERB_CHUNKS.forEach(c => getChunkCards(c).forEach(([v, f]) => {
  const key = `${v.chapter}_${v.reading}_${v.disambig || ''}_${f}`;
  assert(pairs.has(key), false, `${v.kanji} ${f} is in one chunk only (${c.id})`);
  pairs.add(key);
}));
const cardsOf = id => getChunkCards(VERB_CHUNKS.find(c => c.id === id));
assert(cardsOf('n5-basics').some(([v, f]) => f === 'potential'), false, 'N5 chunks drill N5 forms only');
assert(cardsOf('n4-potential').some(([v]) => v.kanji === '食べる'), true, 'N4 potential chunk has 食べる');
assert(cardsOf('n4-potential').some(([v]) => v.kanji === 'ある'), false, 'no potential for ある');
assert(cardsOf('n4-keigo').some(([, f]) => f === 'passive'), false, 'keigo verbs keep to the N5 forms');

// --- Verify all verbs in DB can be conjugated without error ---
console.log('\nConjugating all verbs across all forms...');
let conjErrors = 0;
ALL_VERBS.forEach(v => {
  Conjugator.ALL_FORMS.forEach(f => {
    try {
      const result = Conjugator.conjugate(v, f);
      if (!result || result.length === 0) {
        console.log(`  EMPTY: ${v.reading} → ${f}`);
        conjErrors++;
      }
    } catch (e) {
      console.log(`  ERROR: ${v.reading} → ${f}: ${e.message}`);
      conjErrors++;
    }
  });
});
console.log(`  All-verb conjugation: ${conjErrors === 0 ? 'PASS' : conjErrors + ' errors'}`);

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0 && conjErrors === 0) {
  console.log('All tests passed!');
} else {
  process.exit(1);
}
