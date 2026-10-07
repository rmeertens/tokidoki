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
  const SPEAK_AS_KANA = new Set(['何', '降', '十分', '要', '後']);
  const speech = markup => pieces(markup).map(p => (p.r && SPEAK_AS_KANA.has(p.t) ? p.r : p.t)).join('').replace(/ /g, '');

  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function rubyHtml(markup) {
    return pieces(markup).map(p => p.r
      ? `<ruby>${esc(p.t)}<rt>${esc(p.r)}</rt></ruby>`
      : esc(p.t.replace(/ /g, ''))).join('');
  }

  // The question asked again after the conversation: the intro's last sentence.
  function questionOf(item) {
    if (item.question) return item.question;
    if (!item.intro) return '';
    const sentences = item.intro.split('。').map(s => s.trim()).filter(Boolean);
    return sentences[sentences.length - 1] + '。';
  }

  // ─── The spoken script ─────────────────────────────────────────────────────

  // What is played for one question, as { voice: 'N' | 'M' | 'F', text,
  // reading, pause, line } steps: N is the narrator, reading the expected
  // kana (for checking the recording), pause the silence after it in ms,
  // and line the transcript row it belongs to.
  function buildScript(section, item, number) {
    const steps = [];
    const step = (voice, markup, say, pause, line) => steps.push({
      voice, text: say || speech(markup), reading: say ? '' : reading(markup), pause, line,
    });
    step('N', '', number + '番。', 700, 'num');

    if (section.kind === 'pictures') {
      step('N', item.intro, item.sayIntro, 1200, 'intro');
      item.lines.forEach((l, i) => step(l.who, l.ja, l.say, 450, 'line' + i));
      step('N', questionOf(item), '', 0, 'question');
      return steps;
    }

    if (item.intro) step('N', item.intro, item.sayIntro, 900, 'intro');
    (item.lines || []).forEach((l, i) => step(l.who, l.ja, l.say, 900, 'line' + i));
    const by = item.replyBy || 'M';
    item.choices.forEach((c, i) => {
      step('N', NUMBERS[i] + '。', '', 250, 'choice' + i);
      step(by, c.ja, c.say, i < item.choices.length - 1 ? 700 : 0, 'choice' + i);
    });
    return steps;
  }

  // A short fingerprint of what a recording has to say, so a test can tell
  // when listening-data.js changed without the audio being re-recorded.
  function scriptHash(steps) {
    const s = JSON.stringify(steps.map(st => [st.voice, st.text, st.pause]));
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(16).padStart(8, '0');
  }

  const audioKey = (section, item) => section.id + '/' + item.id;

  const api = { pieces, plain, reading, speech, rubyHtml, questionOf, buildScript, scriptHash, audioKey };
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
  const settings = Object.assign({ speed: 1, exam: false, script: false, furigana: true, level: 'all' }, load(SETTINGS_KEY, {}));
  const store = Object.assign({ best: {}, missed: [] }, load(STORE_KEY, {}));
  if (!Array.isArray(store.missed)) store.missed = [];

  const $ = id => document.getElementById(id);
  let session = null;   // { id, queue: [{ section, item, number, answered, picked, played }], pos }
  let playsLeft = Infinity;

  // ─── Playback: recordings ──────────────────────────────────────────────────

  const audio = new Audio();
  audio.preload = 'auto';
  let player = null;    // what is playing: { kind: 'file' | 'tts', steps, stopAt, onDone }
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

  // Plays [from, to) seconds of a question's recording (to = null: the end).
  function playFile(rec, steps, from, to, onDone) {
    stopAudio();
    const url = new URL(rec.src, location.href).href;
    if (audio.src !== url) audio.src = url;
    audio.playbackRate = settings.speed;
    audio.defaultPlaybackRate = settings.speed;
    player = { kind: 'file', rec, steps, stopAt: to, onDone };
    const mine = player;
    try { audio.currentTime = from; } catch { /* seeks once it has loaded */ }
    if (from && audio.readyState < 1) {
      audio.addEventListener('loadedmetadata', () => { if (player === mine) audio.currentTime = from; }, { once: true });
    }
    // play() is called right here, inside the tap that asked for it: iOS and
    // Chrome only allow audio to start from a user gesture.
    const p = audio.play();
    if (p && p.catch) p.catch(err => {
      if (player !== mine) return;
      player = null;
      if (err && err.name === 'NotAllowedError') {
        if (onDone) onDone(null);
        updatePlayer();
        setStatus('Tap ▶ to listen');
        return;
      }
      fallbackToSpeech(steps, onDone);
    });
    updatePlayer();
  }

  audio.addEventListener('timeupdate', () => {
    if (!player || player.kind !== 'file') return;
    const t = audio.currentTime;
    const i = player.rec.steps.findIndex(([a, b]) => t >= a && t < b + 0.15);
    markStep(i >= 0 ? player.steps[i] : null);
    if (player.stopAt != null && t >= player.stopAt) { audio.pause(); finishPlayback(true); return; }
    if (audio.duration) setProgress(t / audio.duration);
  });
  audio.addEventListener('ended', () => {
    if (player && player.kind === 'file') { setProgress(1); finishPlayback(true); }
  });
  audio.addEventListener('error', () => {
    if (!player || player.kind !== 'file') return;
    const { steps, onDone } = player;
    player = null;
    fallbackToSpeech(steps, onDone);
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
    if (rec) playFile(rec, steps, 0, null, onDone);
    else fallbackToSpeech(steps, onDone);
  }

  function playLine(key) {
    const q = current();
    const steps = stepsFor(q);
    const rec = recordingFor(q);
    const idx = steps.map((s, i) => (s.line === key ? i : -1)).filter(i => i >= 0);
    if (!idx.length) return;
    if (rec) playFile(rec, steps, rec.steps[idx[0]][0], rec.steps[idx[idx.length - 1]][1] + 0.05, null);
    else fallbackToSpeech(idx.map(i => Object.assign({}, steps[i], { pause: 0 })), null);
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

  function queueFor(id) {
    const queue = [];
    const sections = id === 'all' || id === 'missed' ? SECTIONS : SECTIONS.filter(s => s.id === id);
    sections.forEach(section => {
      let number = 0;
      section.items.forEach(item => {
        if (id === 'missed' ? !store.missed.includes(keyOf(section, item)) : !levelOk(item)) return;
        queue.push({ section, item, number: ++number, answered: false, picked: null, played: false });
      });
    });
    return queue;
  }

  function renderHome() {
    const total = queueFor('all').length;
    const bestAll = store.best['all-' + settings.level];
    $('lis-start-meta').textContent = `All four parts · ${total} questions${bestAll ? ` · best ${bestAll.score}/${bestAll.total}` : ''}`;
    document.querySelectorAll('[data-level]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.level === settings.level)));
    $('lis-sections').innerHTML = SECTIONS.map(s => {
      const n = s.items.filter(levelOk).length;
      const b = store.best[s.id + '-' + settings.level];
      return `<button class="lis-part-row" data-section="${s.id}"${n ? '' : ' disabled'}>
        <span class="lis-part-badge" lang="ja">問題${s.num}</span>
        <span class="lis-part-body">
          <span class="lis-part-title">${esc(s.en)} <span class="lis-part-ja" lang="ja">${esc(plain(s.ja))}</span></span>
          <span class="lis-part-desc">${esc(s.desc)}</span>
        </span>
        <span class="lis-part-meta">${n} Qs${b ? `<br>best ${b.score}/${b.total}` : ''}</span>
        <span class="lis-part-go" aria-hidden="true">›</span>
      </button>`;
    }).join('');
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

  function start(id) {
    const queue = queueFor(id);
    if (!queue.length) return;
    session = { id, queue, pos: 0 };
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
    $('lis-part').innerHTML = `<span class="lis-part-badge" lang="ja">問題${section.num}</span> ${esc(section.en)} <span class="lis-level">${item.level}</span>`;
    $('lis-number').textContent = `${q.number}番`;
    $('lis-progress-text').textContent = `${session.pos + 1} / ${session.queue.length}`;
    $('lis-bar-fill').style.width = `${(session.pos / session.queue.length) * 100}%`;
    $('lis-instructions').textContent = section.kind === 'pictures'
      ? 'Listen to the conversation, then pick the picture that answers the question.'
      : item.scene ? 'Look at the picture. Which reply does the person with the red arrow say?'
        : 'There is no picture. Listen to the line, then pick the most natural reply.';
    setProgress(0);

    const stage = $('lis-stage');
    if (section.kind === 'pictures') {
      stage.innerHTML = `<div class="lis-choices lis-choices-pics">${item.choices.map((c, i) =>
        `<button class="lis-choice" data-choice="${i}" aria-label="Picture ${i + 1}">
          <span class="lis-choice-num">${i + 1}</span>
          <span class="lis-choice-pic">${Art.picture(c)}</span></button>`).join('')}</div>`;
    } else {
      stage.innerHTML = (item.scene ? Art.scene(item.scene) : '')
        + `<p class="lis-choices-label">Which reply did you hear?</p>
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
    const row = (key, voice, ja, en, extra = '') =>
      `<div class="lis-line${extra}" data-line="${key}" data-voice="${voice}" role="button" tabindex="0" title="Play this line">
        <span class="lis-who" lang="ja">${who[voice]}</span>
        <span class="lis-ja" lang="ja">${rubyHtml(ja)}</span>
        ${en ? `<span class="lis-en">${esc(en)}</span>` : ''}
      </div>`;
    const rows = [];
    if (item.intro) rows.push(row('intro', 'N', item.intro, '', ' lis-line-narr'));
    (item.lines || []).forEach((l, i) => rows.push(row('line' + i, l.who, l.ja, l.en)));
    if (section.kind === 'pictures') {
      rows.push(row('question', 'N', questionOf(item), '', ' lis-line-narr'));
    } else {
      item.choices.forEach((c, i) => {
        const mark = q.answered ? (i === item.answer ? ' lis-line-right' : i === q.picked ? ' lis-line-wrong' : '') : '';
        rows.push(row('choice' + i, item.replyBy || 'M', `${i + 1}. ${c.ja}`, q.answered ? c.en : '', ' lis-line-choice' + mark));
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
    if (q.section.kind === 'spoken') {
      document.querySelectorAll('.lis-choice-text').forEach((el, n) => { el.innerHTML = rubyHtml(q.item.choices[n].ja); });
    }
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
    if (session.id !== 'missed') {
      const key = session.id + '-' + settings.level;
      const prev = store.best[key];
      if (!prev || score > prev.score) store.best[key] = { score, total };
      save(STORE_KEY, store);
    }
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
      `<li><span class="lis-part-badge" lang="ja">問題${b.section.num}</span> ${esc(b.section.en)} <b>${b.right}/${b.total}</b>${b.missed.length ? ` <span class="lis-missed">missed ${b.missed.map(n => n + '番').join(', ')}</span>` : ''}</li>`).join('');
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

  $('lis-start').addEventListener('click', () => start('all'));
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
  $('btn-lis-again').addEventListener('click', () => start(session.id));
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
