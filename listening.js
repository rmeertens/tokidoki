// 聴解 — JLPT-style listening practice (listening.html). Each question plays
// the way the test does: the number, the situation and question, the
// conversation, then the question again. The answer is picked from four
// pictures (問題1, 2) or from three replies that are only spoken (問題3, 4).
// Afterwards the script is shown with furigana and English, and any line can
// be played again.
//
// The audio is recorded ahead of time (scripts/generate_listening_audio.py →
// audio/listening/*.mp3, indexed by listening-audio.js), one file per
// question with the time each line starts and ends. When a recording is
// missing or won't load, the browser's own Japanese voice reads the script.
//
// The questions live in listening-data.js and the pictures are drawn by
// listening-art.js. The pure parts (markup, the spoken script and its hash)
// are exported for test_listening.js and the audio generator.
(function (global) {
  'use strict';

  const KANJI = '㐀-䶿一-鿿々〆ヶ';
  const RUBY_RE = new RegExp('([' + KANJI + ']+)\\[([^\\]]+)\\]', 'g');
  const STORE_KEY = 'tokidoki_listening';
  const SETTINGS_KEY = 'tokidoki_listening_settings';
  const NUMBERS = ['いち', 'に', 'さん', 'よん'];
  const ANSWER_SECONDS = 12;

  // ─── Markup ────────────────────────────────────────────────────────────────

  function pieces(markup) {
    const out = [];
    let last = 0;
    String(markup).replace(RUBY_RE, (m, t, r, i) => {
      if (i > last) out.push({ t: markup.slice(last, i) });
      out.push({ t, r });
      last = i + m.length;
      return m;
    });
    if (last < markup.length) out.push({ t: markup.slice(last) });
    return out;
  }

  // Plain text drops the spaces between words, which are only there to keep
  // the markup readable.
  const plain = markup => pieces(markup).map(p => p.t).join('').replace(/ /g, '');
  const reading = markup => pieces(markup).map(p => p.r || p.t).join('').replace(/ /g, '');

  // What a voice is given to say: the kanji text, except for words voices
  // often read the wrong way (何[なん] as なに, 降[ふ]り as おり, 十分[じゅっぷん]
  // as じゅうぶん), which are spoken from their furigana. The audio generator
  // checks every other reading against the furigana too.
  const SPEAK_AS_KANA = new Set(['何', '降', '十分', '要', '後', '行', '辛', '薬', '角', '開', '何色', '二十歳', '日本', '時計', '五分', '垂', '方', '眠', '第三', '手数', '切']);
  const speech = markup => pieces(markup).map(p => (p.r && SPEAK_AS_KANA.has(p.t) ? p.r : p.t)).join('').replace(/ /g, '');

  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function rubyHtml(markup) {
    return pieces(markup).map(p => p.r
      ? `<ruby>${esc(p.t)}<rt>${esc(p.r)}</rt></ruby>`
      : esc(p.t.replace(/ /g, ''))).join('');
  }

  // Choices printed as Japanese text (N3, N2) rather than drawn.
  const isPhrases = item => item.choices.every(c => c.type === 'phrase');

  // Which 問題 a part is at each level: the JLPT numbers its parts per level,
  // and N3 and N2 have a 概要理解 part (N2 no 発話表現).
  const PART_NUMS = {
    N5: { kadai: 1, point: 2, hatsuwa: 3, sokuji: 4 },
    N4: { kadai: 1, point: 2, hatsuwa: 3, sokuji: 4 },
    N3: { kadai: 1, point: 2, gaiyou: 3, hatsuwa: 4, sokuji: 5 },
    N2: { kadai: 1, point: 2, gaiyou: 3, sokuji: 4 },
  };
  const partNum = (section, level) => (PART_NUMS[level] || PART_NUMS.N3)[section.id] || PART_NUMS.N3[section.id];

  // The question asked again after the conversation: the intro's last sentence.
  function questionOf(item) {
    if (item.question) return item.question;
    if (!item.intro) return '';
    const sentences = item.intro.split('。').map(s => s.trim()).filter(Boolean);
    return sentences[sentences.length - 1] + '。';
  }

  // ─── Voices ────────────────────────────────────────────────────────────────

  // The recorded cast (VOICEVOX voices, by style id). Each question gets a
  // man and a woman from these pools — adult unless the item asks for
  // `voices: { M: 'young' | 'child' | 'old', F: … }` — picked from a hash of
  // its id, so the voices vary from question to question but never change
  // between recordings. Pitch (F0) measured on one test sentence: men
  // 80–165 Hz, women 200–360 Hz.
  const NARRATOR = { id: 30, name: 'No.7', speed: 1.0 };
  const VOICES = {
    takehiro: { id: 11, name: '玄野武宏', speed: 1.0 },
    ryusei: { id: 13, name: '青山龍星', speed: 1.0 },
    mesuo: { id: 21, name: '剣崎雌雄', speed: 1.0 },
    shuji: { id: 52, name: '雀松朱司', speed: 1.0 },
    sorin: { id: 53, name: '麒ヶ島宗麟', speed: 1.0 },
    kotaro: { id: 12, name: '白上虎太郎', speed: 1.0 },
    jii: { id: 42, name: 'ちび式じい', speed: 1.08 },
    himari: { id: 14, name: '冥鳴ひまり', speed: 1.0 },
    sora: { id: 16, name: '九州そら', speed: 1.15 },
    metan: { id: 2, name: '四国めたん', speed: 1.0 },
    mochiko: { id: 20, name: 'もち子さん', speed: 1.0 },
    itako: { id: 109, name: '東北イタコ', speed: 1.0 },
    tsumugi: { id: 8, name: '春日部つむぎ', speed: 1.0 },
    hau: { id: 10, name: '雨晴はう', speed: 1.0 },
  };
  const POOLS = {
    M: { adult: ['takehiro', 'ryusei', 'mesuo', 'shuji', 'sorin'], young: ['kotaro', 'takehiro'], child: ['kotaro'], old: ['jii', 'sorin'] },
    F: { adult: ['himari', 'sora', 'metan', 'mochiko', 'itako'], young: ['tsumugi', 'metan'], child: ['hau'], old: ['itako', 'sora'] },
  };

  function hashString(s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h;
  }

  // Some speakers talk faster or slower, like real people: about one N4–N2
  // conversation in six is brisk (and one in twelve slower), and one N5
  // conversation in eight slow. N3 and N2 are faster to begin with.
  function paceOf(section, item) {
    const h = hashString(section.id + '/' + item.id + '/pace') % 24;
    if (item.level === 'N5') return h < 3 ? 'slow' : '';
    return h < 4 ? 'fast' : h < 6 ? 'slow' : '';
  }

  // { N, M, F } → { id, name, speed } for one question. Speed is VOICEVOX's
  // speed scale: N5 conversations a touch slower than natural, N4 natural to
  // brisk, and `pace: 'slow' | 'fast'` on an item for a slow or fast talker.
  function castFor(section, item) {
    const key = section.id + '/' + item.id;
    const want = item.voices || {};
    const pace = item.pace || paceOf(section, item);
    const base = ({ N5: 0.94, N4: 1.04, N3: 1.08, N2: 1.12 }[item.level] || 1) + ({ slow: -0.08, fast: 0.1 }[pace] || 0);
    const pick = g => {
      const h = hashString(key + '/' + g);
      const pool = POOLS[g][want[g] || 'adult'];
      const v = VOICES[pool[h % pool.length]];
      const jitter = ((h >>> 8) % 7 - 3) * 0.015;
      return { id: v.id, name: v.name, speed: +Math.min(1.3, Math.max(0.8, base * v.speed + jitter)).toFixed(2) };
    };
    return { N: Object.assign({}, NARRATOR), M: pick('M'), F: pick('F') };
  }

  // ─── The spoken script ─────────────────────────────────────────────────────

  // What is played for one question, as { voice: 'N' | 'M' | 'F', text,
  // reading, pause, line, style, speed } steps: N is the narrator, reading
  // the expected kana (for checking the recording), pause the silence after
  // it in ms, line the transcript row it belongs to, and style / speed the
  // VOICEVOX voice that records it.
  function buildScript(section, item, number) {
    const cast = castFor(section, item);
    const steps = [];
    const step = (voice, markup, say, pause, line) => steps.push({
      voice, text: say || speech(markup), reading: say ? '' : reading(markup), pause, line,
      style: cast[voice].id, speed: cast[voice].speed,
    });
    step('N', '', number + '番。', 700, 'num');

    if (section.kind === 'pictures') {
      // Printed choices (N3, N2) get time to read them before the talk.
      step('N', item.intro, item.sayIntro, isPhrases(item) ? 3500 : 1200, 'intro');
      item.lines.forEach((l, i) => step(l.who, l.ja, l.say, 450, 'line' + i));
      step('N', questionOf(item), '', 0, 'question');
      return steps;
    }

    if (section.kind === 'summary') {
      // 概要理解: the situation, the talk, and only then the question and
      // four spoken choices, read by the narrator.
      step('N', item.intro, item.sayIntro, 900, 'intro');
      item.lines.forEach((l, i) => step(l.who, l.ja, l.say, 500, 'line' + i));
      step('N', item.question, '', 800, 'question');
      item.choices.forEach((c, i) => {
        step('N', '', NUMBERS[i] + '。', 250, 'choice' + i);
        step('N', c.ja, c.say, i < item.choices.length - 1 ? 700 : 0, 'choice' + i);
      });
      return steps;
    }

    if (item.intro) step('N', item.intro, item.sayIntro, 900, 'intro');
    (item.lines || []).forEach((l, i) => step(l.who, l.ja, l.say, 900, 'line' + i));
    const by = item.replyBy || 'M';
    item.choices.forEach((c, i) => {
      step('N', '', NUMBERS[i] + '。', 250, 'choice' + i);
      step(by, c.ja, c.say, i < item.choices.length - 1 ? 700 : 0, 'choice' + i);
    });
    return steps;
  }

  // A short fingerprint of what a recording has to say, so a test can tell
  // when listening-data.js changed without the audio being re-recorded.
  //
  // The question number isn't part of a recording — 3番 in its part's list
  // may be 5番 in a mock test — so the number step is left out here and in
  // the recording, and played from the narrator's numbers file instead.
  const recorded = steps => steps.filter(st => st.line !== 'num');
  function scriptHash(steps) {
    return hashString(JSON.stringify(recorded(steps).map(st => [st.voice, st.text, st.pause, st.style, st.speed]))).toString(16).padStart(8, '0');
  }

  const audioKey = (section, item) => section.id + '/' + item.id;
  const NUMBERS_KEY = '_numbers'; // the recording of 1番, 2番, … in listening-audio.js

  // Called once on the loaded questions: rotates each question's choices so
  // its answer lands on a position picked from its id, which spreads the
  // right answers evenly over 1–4 (or 1–3). Everything after this — the page,
  // the spoken script, the recordings — sees the rotated order.
  function prepare(sections) {
    sections.forEach(section => section.items.forEach(item => {
      if (item.prepared) return;
      const n = item.choices.length;
      const target = hashString(audioKey(section, item) + '/answer') % n;
      const shift = (target - item.answer + n) % n;
      item.choices = item.choices.map((_, i) => item.choices[(i - shift + n) % n]);
      item.answer = target;
      item.prepared = true;
    }));
    return sections;
  }

  // Mock tests in the layout of the real listening section: questions per
  // part for each level, as in the JLPT (N5: 7 / 6 / 5 / 6, N4: 8 / 7 / 5 / 8,
  // N3: 6 / 6 / 3 / 4 / 9; N2: 5 / 6 / 5 / 12, without its 統合理解 part).
  // A level's questions are spread over its tests in a fixed shuffled order,
  // so each test mixes kinds of question; as many full tests are made as the
  // questions allow.
  const TEST_LAYOUT = {
    N5: { kadai: 7, point: 6, hatsuwa: 5, sokuji: 6 },
    N4: { kadai: 8, point: 7, hatsuwa: 5, sokuji: 8 },
    N3: { kadai: 6, point: 6, gaiyou: 3, hatsuwa: 4, sokuji: 9 },
    N2: { kadai: 5, point: 6, gaiyou: 5, sokuji: 12 },
  };
  const LEVELS = Object.keys(TEST_LAYOUT);
  function mockTests(sections, level) {
    const parts = sections.filter(section => TEST_LAYOUT[level][section.id]);
    const pools = parts.map(section => section.items
      .filter(item => item.level === level)
      .map(item => ({ section, item, h: hashString(audioKey(section, item) + '/test') }))
      .sort((a, b) => a.h - b.h));
    const sizes = parts.map(section => TEST_LAYOUT[level][section.id]);
    const count = Math.min(...pools.map((pool, i) => Math.floor(pool.length / sizes[i])));
    const tests = [];
    for (let t = 0; t < count; t++) {
      tests.push({ id: `${level}-${t + 1}`, level, number: t + 1, sections: parts, parts: pools.map((pool, i) => pool.slice(t * sizes[i], (t + 1) * sizes[i])) });
    }
    return tests;
  }

  const api = { pieces, plain, reading, speech, rubyHtml, questionOf, buildScript, scriptHash, recorded, audioKey, NUMBERS_KEY, castFor, prepare, mockTests, TEST_LAYOUT, LEVELS, partNum, isPhrases, VOICES, NARRATOR, POOLS };
  if (global.LISTENING_SECTIONS) prepare(global.LISTENING_SECTIONS);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.Listening = api;
  if (typeof document === 'undefined') return;

  const Art = global.ListeningArt;
  const RECORDINGS = global.LISTENING_AUDIO || {};

  // ─── State ─────────────────────────────────────────────────────────────────

  function load(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  }

  const SECTIONS = global.LISTENING_SECTIONS || [];
  const settings = Object.assign({ speed: 1, exam: false, script: false, furigana: true, level: 'all', setSize: 5 }, load(SETTINGS_KEY, {}));
  const store = Object.assign({ best: {}, missed: [], setPos: {} }, load(STORE_KEY, {}));
  if (!store.setPos) store.setPos = {};
  if (!Array.isArray(store.missed)) store.missed = [];

  const $ = id => document.getElementById(id);
  let session = null;   // { id, queue: [{ section, item, number, answered, picked, played }], pos }
  let playsLeft = Infinity;

  // ─── Playback: recordings ──────────────────────────────────────────────────

  const audio = new Audio();
  audio.preload = 'auto';
  let player = null;    // what is playing: { kind: 'file', segments, index, onDone } or { kind: 'tts', steps, onDone }
  let ttsToken = 0;

  const synth = 'speechSynthesis' in global ? global.speechSynthesis : null;
  const SPEAKER = { N: 'Narrator', M: 'Man · 男の人', F: 'Woman · 女の人' };

  function stopAudio() {
    if (player && player.kind === 'file') audio.pause();
    ttsToken++;
    if (synth && player && player.kind === 'tts') synth.cancel();
    player = null;
    clearSpeaking();
    updatePlayer();
  }

  function clearSpeaking() {
    document.querySelectorAll('.lis-speaking').forEach(el => el.classList.remove('lis-speaking'));
  }

  function markStep(step) {
    clearSpeaking();
    if (!step) return;
    document.querySelectorAll(`[data-line="${step.line}"]`).forEach(el => el.classList.add('lis-speaking'));
    setStatus(SPEAKER[step.voice] || '', true);
  }

  function finishPlayback(ok) {
    const p = player;
    player = null;
    clearSpeaking();
    if (p && p.onDone) p.onDone(ok);
    updatePlayer();
  }

  // Plays recordings as a queue of segments — the question number, then the
  // question; or one line — each { rec, from, to, times, steps }: from / to
  // in seconds (to = null: the end of the file), and times[i] when steps[i]
  // is spoken. `gap` is a pause in ms before a segment starts.
  function playSegments(segments, onDone) {
    stopAudio();
    player = { kind: 'file', segments, index: 0, onDone, fallback: segments.flatMap(sg => sg.steps) };
    startSegment(player, 0);
    updatePlayer();
  }

  function startSegment(mine, i) {
    const seg = mine.segments[i];
    mine.index = i;
    mine.switching = false;
    const url = new URL(seg.rec.src, location.href).href;
    if (audio.src !== url) audio.src = url;
    audio.playbackRate = settings.speed;
    audio.defaultPlaybackRate = settings.speed;
    try { audio.currentTime = seg.from; } catch { /* seeks once it has loaded */ }
    if (seg.from && audio.readyState < 1) {
      audio.addEventListener('loadedmetadata', () => { if (player === mine && mine.index === i) audio.currentTime = seg.from; }, { once: true });
    }
    // The first play() happens inside the tap that asked for it: iOS and
    // Chrome only allow audio to start from a user gesture. Later segments
    // reuse the same element, which then stays allowed.
    const p = audio.play();
    if (p && p.catch) p.catch(err => {
      if (player !== mine) return;
      player = null;
      if (err && err.name === 'NotAllowedError') {
        if (mine.onDone) mine.onDone(null);
        updatePlayer();
        setStatus('Tap ▶ to listen');
        return;
      }
      fallbackToSpeech(mine.fallback, mine.onDone);
    });
  }

  function nextSegment(mine) {
    if (mine.switching) return; // timeupdate and ended can both arrive
    mine.switching = true;
    if (mine.index + 1 >= mine.segments.length) { setProgress(1); finishPlayback(true); return; }
    audio.pause();
    const gap = mine.segments[mine.index + 1].gap || 0;
    const go = () => { if (player === mine) startSegment(mine, mine.index + 1); };
    if (gap) setTimeout(go, gap / settings.speed); else go();
  }

  audio.addEventListener('timeupdate', () => {
    if (!player || player.kind !== 'file' || player.switching) return;
    const mine = player;
    const seg = mine.segments[mine.index];
    const t = audio.currentTime;
    const i = seg.times.findIndex(([a, b]) => t >= a && t < b + 0.15);
    markStep(i >= 0 ? seg.steps[i] : null);
    if (seg.to != null && t >= seg.to) { nextSegment(mine); return; }
    if (seg.to == null && audio.duration) setProgress(t / audio.duration);
  });
  audio.addEventListener('ended', () => { if (player && player.kind === 'file') nextSegment(player); });
  audio.addEventListener('error', () => {
    if (!player || player.kind !== 'file') return;
    const { fallback, onDone } = player;
    player = null;
    fallbackToSpeech(fallback, onDone);
  });

  // ─── Playback: the browser's voice, when there is no recording ─────────────

  const MALE = /otoya|keita|ichiro|hattori|daichi|naoki|kenji|takumi|male|男/i;
  const FEMALE = /kyoko|nanami|haruka|ayumi|sayaka|mizuki|o-ren|aoi|mayu|shiori|nanako|female|女/i;
  function voiceScore(v) {
    const n = v.name;
    let score = 0;
    if (/natural|neural/i.test(n)) score += 50;
    if (/premium/i.test(n)) score += 45;
    if (/enhanced|siri/i.test(n)) score += 35;
    if (/google/i.test(n)) score += 25;
    if (/compact|espeak/i.test(n)) score -= 20;
    return score;
  }
  function castVoices() {
    const ja = (synth ? synth.getVoices() : [])
      .filter(v => /^ja\b|^ja[-_]/i.test(v.lang))
      .sort((a, b) => voiceScore(b) - voiceScore(a));
    const male = ja.find(v => MALE.test(v.name)) || null;
    const female = ja.find(v => FEMALE.test(v.name) && !MALE.test(v.name)) || null;
    const any = ja[0] || null;
    return {
      found: ja.length > 0,
      N: { voice: female || any, pitch: 1 },
      F: female ? { voice: female, pitch: 1.15 } : { voice: any, pitch: 1.3 },
      M: male ? { voice: male, pitch: 1 } : { voice: any, pitch: 0.7 },
    };
  }
  const canSpeak = () => !!synth && castVoices().found;

  function fallbackToSpeech(steps, onDone) {
    if (!canSpeak()) {
      player = null;
      if (onDone) onDone(false);
      revealScriptAnyway();
      updatePlayer();
      setStatus('The audio couldn’t play here — read the script below');
      return;
    }
    playSpeech(steps, onDone);
  }

  const wait = ms => new Promise(r => setTimeout(r, ms));
  async function playSpeech(steps, onDone) {
    stopAudio();
    const token = ttsToken;
    const cast = castVoices();
    const mine = player = { kind: 'tts', steps, onDone };
    updatePlayer();
    await wait(80); // Chrome drops an utterance queued right after cancel().
    for (let i = 0; i < steps.length; i++) {
      if (token !== ttsToken) return;
      const st = steps[i];
      markStep(st);
      await new Promise(resolve => {
        const u = new SpeechSynthesisUtterance(st.text);
        const c = cast[st.voice] || cast.N;
        u.lang = 'ja-JP';
        if (c.voice) { u.voice = c.voice; u.lang = c.voice.lang; }
        u.pitch = c.pitch;
        u.rate = 0.95 * settings.speed;
        const guard = setTimeout(resolve, 2500 + st.text.length * 400 / u.rate);
        u.onend = u.onerror = () => { clearTimeout(guard); resolve(); };
        mine.utterance = u; // keep a reference, or Chrome may never fire onend
        if (synth.paused) synth.resume();
        synth.speak(u);
      });
      if (token !== ttsToken) return;
      setProgress((i + 1) / steps.length);
      if (st.pause) await wait(st.pause / settings.speed);
    }
    if (token === ttsToken) finishPlayback(true);
  }

  // ─── Playing a question ────────────────────────────────────────────────────

  const stepsFor = q => buildScript(q.section, q.item, q.number);
  function recordingFor(q) {
    const rec = RECORDINGS[audioKey(q.section, q.item)];
    return rec && rec.hash === scriptHash(stepsFor(q)) ? rec : null;
  }

  function playCurrent() {
    const q = current();
    if (!q || player || (!q.answered && playsLeft <= 0)) return;
    const counts = !q.answered;
    if (counts) playsLeft--;
    stopTimer();
    const steps = stepsFor(q);
    const onDone = ok => {
      if (ok) {
        q.played = true;
        if (!q.answered && settings.exam) startTimer();
      } else if (counts) playsLeft++; // never started: give the play back
      updatePlayer();
    };
    const rec = recordingFor(q);
    if (!rec) { fallbackToSpeech(steps, onDone); return; }
    const segments = [];
    const nums = RECORDINGS[NUMBERS_KEY];
    const at = nums && nums.steps[q.number - 1];
    if (at) segments.push({ rec: nums, from: Math.max(0, at[0] - 0.05), to: at[1] + 0.05, times: [at], steps: [steps[0]] });
    segments.push({ rec, from: 0, to: null, times: rec.steps, steps: recorded(steps), gap: at ? 450 : 0 });
    playSegments(segments, onDone);
  }

  function playLine(key) {
    const q = current();
    const steps = stepsFor(q);
    const rec = recordingFor(q);
    const lines = recorded(steps);
    const idx = lines.map((s, i) => (s.line === key ? i : -1)).filter(i => i >= 0);
    if (!idx.length) return;
    if (rec) {
      const times = idx.map(i => rec.steps[i]);
      playSegments([{ rec, from: times[0][0], to: times[times.length - 1][1] + 0.05, times, steps: idx.map(i => lines[i]) }], null);
    } else fallbackToSpeech(idx.map(i => Object.assign({}, lines[i], { pause: 0 })), null);
  }

  // Exam mode: like the test, a few seconds to answer once the audio ends.
  let timer = null;
  function startTimer() {
    stopTimer();
    const endAt = Date.now() + ANSWER_SECONDS * 1000;
    const tick = () => {
      const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setStatus(`Choose your answer — ${left}s`);
      setProgress(Math.max(0, (endAt - Date.now()) / (ANSWER_SECONDS * 1000)));
      if (left <= 0) { stopTimer(); pick(-1); }
    };
    $('lis-audio').classList.add('lis-timing');
    timer = setInterval(tick, 200);
    tick();
  }
  function stopTimer() {
    clearInterval(timer);
    timer = null;
    const el = $('lis-audio');
    if (el) el.classList.remove('lis-timing');
  }

  function setStatus(text, live) {
    const el = $('lis-status');
    if (!el) return;
    el.textContent = text;
    el.classList.toggle('lis-status-live', !!live);
  }

  function setProgress(f) {
    const el = $('lis-audio-fill');
    if (el) el.style.width = `${Math.round(Math.min(1, f) * 100)}%`;
  }

  function updatePlayer() {
    const btn = $('lis-play');
    const q = current();
    if (!btn || !q) return;
    const playing = !!player;
    const locked = !q.answered && playsLeft <= 0 && !playing;
    btn.classList.toggle('lis-playing', playing);
    btn.innerHTML = playing ? '<span aria-hidden="true">■</span>' : (q.played || q.answered ? '<span aria-hidden="true">↻</span>' : '<span aria-hidden="true">▶</span>');
    btn.setAttribute('aria-label', playing ? 'Stop' : q.played ? 'Play again' : 'Play');
    btn.disabled = locked;
    const done = !playing && (q.played || q.answered);
    $('lis-audio').classList.toggle('lis-audio-done', done);
    if (playing && !$('lis-status').classList.contains('lis-status-live')) setStatus('Listening…', true);
    if (playing || timer) return;
    setProgress(done ? 1 : 0);
    if (q.answered) setStatus('Tap ↻ to hear it again, or tap any line of the script');
    else if (locked) setStatus('Exam mode: the audio plays once. Choose your answer.');
    else if (q.played) setStatus(q.section.kind === 'pictures' ? 'Now choose a picture ↓' : 'Now choose the reply you heard ↓');
    else setStatus('Tap ▶ to listen');
  }

  // ─── Screens ───────────────────────────────────────────────────────────────

  function current() { return session ? session.queue[session.pos] : null; }

  function show(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === screen));
    window.scrollTo(0, 0);
  }

  const levelOk = item => settings.level === 'all' || item.level === settings.level;
  const keyOf = (section, item) => section.id + '/' + item.id;
  const TESTS = LEVELS.flatMap(level => mockTests(SECTIONS, level));
  const LEVEL_NAME = { all: 'all levels', N5: 'N5', N4: 'N4', N3: 'N3', N2: 'N2' };
  const numOf = section => partNum(section, settings.level === 'all' ? 'N3' : settings.level);

  // Practising one part goes through it in sets (5, 10, or all at once),
  // remembering where the last set ended.
  const setKey = id => id + '-' + settings.level;
  function setInfo(id, n) {
    const size = settings.setSize && settings.setSize < n ? settings.setSize : n;
    const pos = (store.setPos[setKey(id)] || 0) % Math.max(1, n);
    return { size, pos, number: Math.floor(pos / size) + 1, count: Math.ceil(n / size) };
  }

  // A session's questions, numbered 1番, 2番… within each part.
  function queueFor(id) {
    let picked;
    const test = TESTS.find(t => t.id === id);
    if (test) picked = test.parts.flat();
    else if (id === 'missed') {
      picked = SECTIONS.flatMap(section => section.items.filter(item => store.missed.includes(keyOf(section, item))).map(item => ({ section, item })));
      if (settings.setSize) picked = picked.slice(0, settings.setSize);
    } else if (id === 'quick') {
      const pool = SECTIONS.flatMap(section => section.items.filter(levelOk).map(item => ({ section, item, r: Math.random() })));
      picked = pool.sort((x, y) => x.r - y.r).slice(0, settings.setSize || 20)
        .sort((x, y) => SECTIONS.indexOf(x.section) - SECTIONS.indexOf(y.section));
    } else {
      const sections = id === 'all' ? SECTIONS : SECTIONS.filter(s => s.id === id);
      const all = sections.flatMap(section => section.items.filter(levelOk).map(item => ({ section, item })));
      const { size, pos } = setInfo(id, all.length);
      picked = all.concat(all).slice(pos, pos + size);
      // Each question keeps its number in its part, whichever set it falls in.
      const numberOf = e => all.filter(o => o.section === e.section).indexOf(e) + 1;
      return picked.map(e => ({
        section: e.section, item: e.item, number: numberOf(e),
        answered: false, picked: null, played: false,
      }));
    }
    const count = {};
    return picked.map(({ section, item }) => ({
      section, item, number: (count[section.id] = (count[section.id] || 0) + 1),
      answered: false, picked: null, played: false,
    }));
  }

  const bestKey = id => (TESTS.some(t => t.id === id) || id === 'missed' || id === 'quick' ? id : id + '-' + settings.level);

  function renderHome() {
    document.querySelectorAll('[data-level]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.level === settings.level)));
    const tests = TESTS.filter(t => settings.level === 'all' || t.level === settings.level);
    $('lis-tests').innerHTML = tests.map(t => {
      const b = store.best[t.id];
      const n = t.parts.reduce((k, p) => k + p.length, 0);
      return `<button class="lis-test" data-test="${t.id}">
        <span class="lis-test-level">${t.level}</span>
        <span class="lis-test-name" lang="ja">模擬試験 ${t.number}</span>
        <span class="lis-test-meta">${n} questions${b ? ` · best <b>${b.score}/${b.total}</b>` : ''}</span>
        <span class="lis-test-go" aria-hidden="true">▶</span>
      </button>`;
    }).join('');
    $('lis-quick-meta').textContent = `${settings.setSize || 20} random questions · ${LEVEL_NAME[settings.level]}`;
    document.querySelectorAll('[data-set]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.set) === settings.setSize)));
    $('lis-tests-none').classList.toggle('hidden', !!tests.length);
    $('lis-sections').innerHTML = SECTIONS.filter(s => s.items.some(levelOk)).map(s => {
      const n = s.items.filter(levelOk).length;
      const b = store.best[s.id + '-' + settings.level];
      const set = setInfo(s.id, n);
      return `<button class="lis-part-row" data-section="${s.id}">
        <span class="lis-part-badge" lang="ja">問題${numOf(s)}</span>
        <span class="lis-part-body">
          <span class="lis-part-title">${esc(s.en)} <span class="lis-part-ja" lang="ja">${esc(plain(s.ja))}</span></span>
          <span class="lis-part-desc">${esc(s.desc)}</span>
        </span>
        <span class="lis-part-meta">${set.count > 1 ? `set ${set.number}/${set.count}<br>` : ''}${n} Qs${b ? `<br>best ${b.score}/${b.total}` : ''}</span>
        <span class="lis-part-go" aria-hidden="true">›</span>
      </button>`;
    }).join('');
    const total = SECTIONS.reduce((k, s) => k + s.items.filter(levelOk).length, 0);
    $('lis-total').textContent = total;
    const missed = queueFor('missed').length;
    $('lis-review').classList.toggle('hidden', !missed);
    $('lis-review-count').textContent = missed;
    $('lis-opt-exam').checked = settings.exam;
    $('lis-opt-script').checked = settings.script;
    $('lis-opt-furigana').checked = settings.furigana;
    document.querySelectorAll('[data-speed]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.speed) === settings.speed)));
    $('lis-no-voice').classList.toggle('hidden', !!Object.keys(RECORDINGS).length || canSpeak());
    document.body.classList.toggle('lis-no-furigana', !settings.furigana);
  }

  function start(id, again) {
    const queue = again ? again.map(q => Object.assign({}, q, { answered: false, picked: null, played: false })) : queueFor(id);
    if (!queue.length) return;
    const test = TESTS.find(t => t.id === id);
    session = { id, queue, pos: 0, title: test ? `${test.level} 模擬試験 ${test.number}` : '' };
    show('screen-listening');
    renderQuestion();
  }

  function renderQuestion() {
    stopAudio();
    stopTimer();
    scriptForced = false;
    const q = current();
    const { section, item } = q;
    playsLeft = settings.exam ? 1 : Infinity;
    $('lis-part').innerHTML = `<span class="lis-part-badge" lang="ja">問題${partNum(section, item.level)}</span> ${esc(section.en)} <span class="lis-level">${session.title ? esc(session.title) : item.level}</span>`;
    $('lis-number').textContent = `${q.number}番`;
    $('lis-progress-text').textContent = `${session.pos + 1} / ${session.queue.length}`;
    $('lis-bar-fill').style.width = `${(session.pos / session.queue.length) * 100}%`;
    $('lis-instructions').textContent = section.kind === 'pictures'
      ? (isPhrases(item) ? 'Read the choices while the question is read out, then listen and pick the answer.' : 'Listen to the conversation, then pick the picture that answers the question.')
      : section.kind === 'summary' ? 'Listen to the whole talk. The question and the four choices come at the end, and are only spoken.'
        : item.scene ? 'Look at the picture. Which reply does the person with the red arrow say?'
          : 'There is no picture. Listen to the line, then pick the most natural reply.';
    setProgress(0);

    const stage = $('lis-stage');
    if (section.kind === 'pictures' && isPhrases(item)) {
      stage.innerHTML = `<div class="lis-choices lis-choices-phrases">${item.choices.map((c, i) =>
        `<button class="lis-choice" data-choice="${i}" aria-label="Choice ${i + 1}">
          <span class="lis-choice-num">${i + 1}</span><span class="lis-choice-phrase"><span lang="ja">${rubyHtml(c.ja)}</span><span class="lis-choice-en hidden">${esc(c.en || '')}</span></span></button>`).join('')}</div>`;
    } else if (section.kind === 'pictures') {
      stage.innerHTML = `<div class="lis-choices lis-choices-pics">${item.choices.map((c, i) =>
        `<button class="lis-choice" data-choice="${i}" aria-label="Picture ${i + 1}">
          <span class="lis-choice-num">${i + 1}</span>
          <span class="lis-choice-pic">${Art.picture(c)}</span></button>`).join('')}</div>`;
    } else {
      stage.innerHTML = (item.scene ? Art.scene(item.scene) : '')
        + `<p class="lis-choices-label">${section.kind === 'summary' ? 'Which answer did you hear?' : 'Which reply did you hear?'}</p>
          <div class="lis-choices lis-choices-spoken">${item.choices.map((c, i) =>
          `<button class="lis-choice" data-choice="${i}" aria-label="Reply ${i + 1}">
            <span class="lis-choice-num">${i + 1}</span><span class="lis-choice-text" lang="ja"></span></button>`).join('')}</div>`;
    }
    renderScript();
    $('lis-result').classList.add('hidden');
    updatePlayer();
    // Start straight away, like the test. This runs inside the tap or key
    // press that opened the question, which browsers require before audio.
    playCurrent();
  }

  let scriptForced = false;
  function revealScriptAnyway() { scriptForced = true; renderScript(); }

  // The script: hidden until the answer is picked (or always, with the
  // "show the script" option). Each row can be tapped to hear it again.
  function renderScript() {
    const q = current();
    if (!q) return;
    const { section, item } = q;
    const visible = q.answered || settings.script || scriptForced;
    const box = $('lis-script');
    box.classList.toggle('hidden', !visible);
    if (!visible) { $('lis-script-body').innerHTML = ''; return; }
    const who = { N: '', M: '男', F: '女' };
    const cast = castFor(section, item);
    const row = (key, voice, ja, en, extra = '') =>
      `<div class="lis-line${extra}" data-line="${key}" data-voice="${voice}" role="button" tabindex="0" title="Play this line">
        <span class="lis-who" lang="ja">${who[voice]}${voice !== 'N' && RECORDINGS[audioKey(section, item)] ? `<span class="lis-voice-name">${esc(cast[voice].name)}</span>` : ''}</span>
        <span class="lis-ja" lang="ja">${rubyHtml(ja)}</span>
        ${en ? `<span class="lis-en">${esc(en)}</span>` : ''}
      </div>`;
    const rows = [];
    if (item.intro) rows.push(row('intro', 'N', item.intro, '', ' lis-line-narr'));
    (item.lines || []).forEach((l, i) => rows.push(row('line' + i, l.who, l.ja, l.en)));
    if (section.kind === 'pictures') {
      rows.push(row('question', 'N', questionOf(item), '', ' lis-line-narr'));
    } else {
      if (section.kind === 'summary') rows.push(row('question', 'N', item.question, '', ' lis-line-narr'));
      item.choices.forEach((c, i) => {
        const mark = q.answered ? (i === item.answer ? ' lis-line-right' : i === q.picked ? ' lis-line-wrong' : '') : '';
        rows.push(row('choice' + i, section.kind === 'summary' ? 'N' : item.replyBy || 'M', `${i + 1}. ${c.ja}`, q.answered ? c.en : '', ' lis-line-choice' + mark));
      });
    }
    $('lis-script-body').innerHTML = rows.join('');
  }

  function pick(i) {
    const q = current();
    if (!q || q.answered) return;
    stopAudio();
    stopTimer();
    q.answered = true;
    q.picked = i;
    const right = i === q.item.answer;
    const key = keyOf(q.section, q.item);
    store.missed = store.missed.filter(k => k !== key);
    if (!right) store.missed.push(key);
    save(STORE_KEY, store);
    document.querySelectorAll('.lis-choice').forEach(btn => {
      const n = Number(btn.dataset.choice);
      btn.disabled = true;
      btn.classList.toggle('lis-right', n === q.item.answer);
      btn.classList.toggle('lis-wrong', n === i && !right);
      btn.classList.toggle('lis-dim', n !== i && n !== q.item.answer);
    });
    if (q.section.kind !== 'pictures') {
      document.querySelectorAll('.lis-choice-text').forEach((el, n) => { el.innerHTML = rubyHtml(q.item.choices[n].ja); });
    }
    document.querySelectorAll('.lis-choice-en').forEach(el => el.classList.remove('hidden'));
    const res = $('lis-result');
    res.className = 'lis-result ' + (right ? 'lis-result-right' : 'lis-result-wrong');
    $('lis-result-icon').textContent = right ? '○' : '×';
    $('lis-result-title').textContent = right ? '正解！ Correct'
      : i < 0 ? `Time’s up — the answer is ${q.item.answer + 1}` : `Not quite — the answer is ${q.item.answer + 1}`;
    $('lis-result-why').textContent = q.item.why;
    $('btn-lis-next').textContent = session.pos + 1 < session.queue.length ? 'Next question →' : 'See results →';
    renderScript();
    $('lis-script').open = true;
    updatePlayer();
    res.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    $('btn-lis-next').focus({ preventScroll: true });
  }

  function next() {
    if (!session) return;
    if (session.pos + 1 < session.queue.length) {
      session.pos++;
      window.scrollTo(0, 0);
      renderQuestion();
    } else {
      finish();
    }
  }

  function finish() {
    stopAudio();
    stopTimer();
    const score = session.queue.filter(q => q.picked === q.item.answer).length;
    const total = session.queue.length;
    if (session.id !== 'missed' && session.id !== 'quick') {
      const key = bestKey(session.id);
      const prev = store.best[key];
      if (!prev || score > prev.score) store.best[key] = { score, total };
      save(STORE_KEY, store);
    }
    const isPart = SECTIONS.some(sec => sec.id === session.id) || session.id === 'all';
    if (isPart) {
      const n = SECTIONS.filter(sec => session.id === 'all' || sec.id === session.id).reduce((k, sec) => k + sec.items.filter(levelOk).length, 0);
      const { size, pos, count } = setInfo(session.id, n);
      store.setPos[setKey(session.id)] = (pos + size) % n;
      save(STORE_KEY, store);
      $('btn-lis-next-set').classList.toggle('hidden', count < 2);
      $('btn-lis-next-set').textContent = `Next ${size} →`;
    } else $('btn-lis-next-set').classList.add('hidden');
    $('lis-done-score').textContent = `${score} / ${total}`;
    $('lis-done-accuracy').textContent = `${Math.round(score / total * 100)}%`;
    const bySection = [];
    session.queue.forEach(q => {
      let s = bySection.find(b => b.section === q.section);
      if (!s) bySection.push(s = { section: q.section, right: 0, total: 0, missed: [] });
      s.total++;
      if (q.picked === q.item.answer) s.right++; else s.missed.push(q.number);
    });
    $('lis-done-parts').innerHTML = bySection.map(b =>
      `<li><span class="lis-part-badge" lang="ja">問題${partNum(b.section, session.queue[0].item.level)}</span> ${esc(b.section.en)} <b>${b.right}/${b.total}</b>${b.missed.length ? ` <span class="lis-missed">missed ${b.missed.map(n => n + '番').join(', ')}</span>` : ''}</li>`).join('');
    const missed = queueFor('missed').length;
    $('btn-lis-review-missed').classList.toggle('hidden', !missed);
    $('btn-lis-review-missed').textContent = `Review mistakes (${missed})`;
    show('screen-listening-done');
  }

  function goHome() {
    stopAudio();
    stopTimer();
    session = null;
    renderHome();
    show('screen-chapters');
  }

  // ─── Events ────────────────────────────────────────────────────────────────

  $('lis-tests').addEventListener('click', e => {
    const card = e.target.closest('[data-test]');
    if (card) start(card.dataset.test);
  });
  $('lis-quick').addEventListener('click', () => start('quick'));
  $('lis-review').addEventListener('click', () => start('missed'));
  $('lis-sections').addEventListener('click', e => {
    const row = e.target.closest('[data-section]');
    if (row) start(row.dataset.section);
  });
  document.querySelectorAll('[data-level]').forEach(b => b.addEventListener('click', () => {
    settings.level = b.dataset.level;
    save(SETTINGS_KEY, settings);
    renderHome();
  }));
  document.querySelectorAll('[data-set]').forEach(b => b.addEventListener('click', () => {
    settings.setSize = Number(b.dataset.set);
    save(SETTINGS_KEY, settings);
    renderHome();
  }));
  $('btn-lis-next-set').addEventListener('click', () => start(session.id));
  document.querySelectorAll('[data-speed]').forEach(b => b.addEventListener('click', () => {
    settings.speed = Number(b.dataset.speed);
    save(SETTINGS_KEY, settings);
    renderHome();
  }));
  ['exam', 'script', 'furigana'].forEach(k => $('lis-opt-' + k).addEventListener('change', e => {
    settings[k] = e.target.checked;
    save(SETTINGS_KEY, settings);
    document.body.classList.toggle('lis-no-furigana', !settings.furigana);
  }));
  $('lis-play').addEventListener('click', () => (player ? stopAudio() : playCurrent()));
  $('lis-stage').addEventListener('click', e => {
    const btn = e.target.closest('.lis-choice');
    if (btn) pick(Number(btn.dataset.choice));
  });
  $('lis-script-body').addEventListener('click', e => {
    const row = e.target.closest('.lis-line');
    if (row) playLine(row.dataset.line);
  });
  $('lis-script-body').addEventListener('keydown', e => {
    const row = e.target.closest('.lis-line');
    if (row && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); playLine(row.dataset.line); }
  });
  $('btn-lis-next').addEventListener('click', next);
  $('lis-quit').addEventListener('click', goHome);
  $('btn-lis-again').addEventListener('click', () => start(session.id, session.queue));
  $('btn-lis-review-missed').addEventListener('click', () => start('missed'));
  $('btn-lis-home').addEventListener('click', goHome);

  document.addEventListener('keydown', e => {
    if (!session || !$('screen-listening').classList.contains('active')) return;
    if (e.target.closest && e.target.closest('input, textarea, select, .lis-line, summary')) return;
    const q = current();
    const n = Number(e.key);
    if (n >= 1 && n <= q.item.choices.length && !q.answered) { e.preventDefault(); pick(n - 1); }
    else if ((e.key === ' ' || e.key === 'Enter') && q.answered) { e.preventDefault(); next(); }
    else if (e.key === 'p' || e.key === 'P' || e.key === 'r' || e.key === 'R') { e.preventDefault(); player ? stopAudio() : playCurrent(); }
  });

  if (synth) {
    const refresh = () => { if ($('screen-chapters').classList.contains('active')) renderHome(); };
    if (synth.addEventListener) synth.addEventListener('voiceschanged', refresh);
    else synth.onvoiceschanged = refresh;
  }
  window.addEventListener('pagehide', stopAudio);
  renderHome();
})(typeof window !== 'undefined' ? window : globalThis);
