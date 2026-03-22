const Conjugator = require('./conjugator.js');
const { GENKI_VERBS } = require('./verbs.js');

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

// --- Test getFormsForChapter ---
console.log('\nTesting getFormsForChapter...');
const ch3Forms = Conjugator.getFormsForChapter(3);
assert(ch3Forms.includes('masu'), true, 'Ch3 has masu');
assert(ch3Forms.includes('masu-neg'), true, 'Ch3 has masu-neg');
assert(ch3Forms.includes('te'), false, 'Ch3 does NOT have te');

const ch6Forms = Conjugator.getFormsForChapter(6);
assert(ch6Forms.includes('te'), true, 'Ch6 has te');
assert(ch6Forms.includes('nai'), false, 'Ch6 does NOT have nai');

const ch13Forms = Conjugator.getFormsForChapter(13);
assert(ch13Forms.includes('potential'), true, 'Ch13 has potential');
assert(ch13Forms.includes('passive'), false, 'Ch13 does NOT have passive');

const ch23Forms = Conjugator.getFormsForChapter(23);
assert(ch23Forms.includes('causative-passive'), true, 'Ch23 has causative-passive');
assert(ch23Forms.length, Conjugator.ALL_FORMS.length, 'Ch23 has all forms');

// --- Verify all verbs in DB can be conjugated without error ---
console.log('\nConjugating all verbs across all forms...');
let conjErrors = 0;
GENKI_VERBS.forEach(v => {
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
