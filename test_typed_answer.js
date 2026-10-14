// Checks for typed-answer.js: typed meanings and Japanese words are marked
// right or wrong the way the Vocabulary and Flashcards typing modes need.
const TypedAnswer = require('./typed-answer.js');

let passed = 0;
let failed = 0;
function meaning(typed, m, want) {
  const got = TypedAnswer.checkMeaning(typed, m);
  if (got === want) passed++;
  else { failed++; console.log(`  FAIL: "${typed}" for "${m}" → "${got}" (expected "${want}")`); }
}
function ja(typed, answers, want) {
  const got = TypedAnswer.checkJapanese(typed, answers);
  if (got === want) passed++;
  else { failed++; console.log(`  FAIL: ${typed} for ${answers.join('/')} → ${got} (expected ${want})`); }
}

meaning('to meet', 'To meet, to see', 'exact');
meaning('see', 'To meet, to see', 'exact');
meaning('Meet, see', 'To meet, to see', 'exact');
meaning('meet, run', 'To meet, to see', '');
meaning('open', 'To open (v.t.)', 'exact');
meaning('older brother', '(my) older brother (humble)', 'exact');
meaning('my older brother', '(my) older brother (humble)', 'exact');
meaning('fall', 'Fall (season)', 'exact');
meaning('cheerful', 'Bright (in reference to personality or weather); cheerful', 'exact');
meaning('bright', 'Bright (in reference to personality or weather); cheerful', 'exact');
meaning('warmhearted', 'Kind, warm(hearted), thick, deep', 'exact');
meaning('warm', 'Kind, warm(hearted), thick, deep', 'exact');
meaning('oh', 'Ah!, Oh!', 'exact');
meaning('day after tomorow', 'Day after tomorrow', 'close');
meaning('breakfest', 'Breakfast', 'close');
meaning('red', 'Blue', '');
meaning('bed', 'Red', '');
meaning('', 'Red', '');
meaning('tired', 'To be tired', 'exact');
meaning('topic marker', 'topic marker ("as for…")', 'exact');
meaning('as for', 'topic marker ("as for…")', '');

ja('あう', ['会う', 'あう'], true);
ja('会う', ['会う', 'あう'], true);
ja('アウ', ['会う', 'あう'], true);
ja('てれび', ['テレビ', 'テレビ'], true);
ja('あい', ['会う', 'あう'], false);
ja('', ['会う', 'あう'], false);
ja(' あ う ', ['会う', 'あう'], true);
// A leading ～ (counters, suffixes) never has to be typed.
ja('かい', ['～階', '～かい'], true);
ja('階', ['～階', '～かい'], true);
ja('～かい', ['～階', '～かい'], true);
ja('さん', ['～さん', '～さん'], true);
meaning('years old', '~ years old', 'exact');
meaning("o'clock", "~ o'clock (time)", 'exact');

const readings = TypedAnswer.kanjiReadings({ on: 'ジョウ・ショウ', kun: 'うえ・-うえ・あ.がる' });
if (readings.join(',') === 'ジョウ,ショウ,うえ,うえ,あがる') passed++;
else { failed++; console.log(`  FAIL: kanjiReadings → ${readings.join(',')}`); }

// kanji-ime.js: what Space goes through for a reading.
const KanjiIme = require('./kanji-ime.js');
const choices = KanjiIme.choices('あお', k => (k === 'あお' ? ['青'] : []));
if (choices.join(',') === 'あお,青,アオ') passed++;
else { failed++; console.log(`  FAIL: choices → ${choices.join(',')}`); }
const kata = KanjiIme.choices('テレビ', () => []);
if (kata.join(',') === 'テレビ,てれび') passed++;
else { failed++; console.log(`  FAIL: katakana choices → ${kata.join(',')}`); }

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
