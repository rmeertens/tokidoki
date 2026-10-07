// 聴解 — JLPT-style listening practice (listening.html). Each question is
// played with the browser's Japanese text-to-speech the way the test plays
// it: the number, the situation and question, the conversation, then the
// question again. The answer is picked from four pictures (問題1, 2) or from
// three replies that are only spoken (問題3, 4). Afterwards the script is
// shown with furigana and English, and any line can be played again.
//
// The questions live in listening-data.js. The pure parts (markup, the
// spoken script, the pictures) are exported for test_listening.js.
(function (global) {
  'use strict';

  const KANJI = '㐀-䶿一-鿿々〆ヶ';
  const RUBY_RE = new RegExp('([' + KANJI + ']+)\\[([^\\]]+)\\]', 'g');
  const STORE_KEY = 'tokidoki_listening';
  const SETTINGS_KEY = 'tokidoki_listening_settings';
  const NUMBERS = ['いち', 'に', 'さん', 'よん'];

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
  // pause, line } steps (N is the narrator; pause is the silence after it in
  // ms; line points pictured steps at the transcript row they belong to).
  function buildScript(section, item, number) {
    const steps = [];
    const say = (voice, text, pause, line) => steps.push({ voice, text, pause, line });
    say('N', number + '番。', 700, 'num');

    if (section.kind === 'pictures') {
      say('N', item.sayIntro || plain(item.intro), 1200, 'intro');
      item.lines.forEach((l, i) => say(l.who, l.say || plain(l.ja), 450, 'line' + i));
      say('N', plain(questionOf(item)), 0, 'question');
      return steps;
    }

    if (item.intro) say('N', item.sayIntro || plain(item.intro), 900, 'intro');
    (item.lines || []).forEach((l, i) => say(l.who, l.say || plain(l.ja), 900, 'line' + i));
    const by = item.replyBy || 'M';
    item.choices.forEach((c, i) => {
      say('N', NUMBERS[i] + '。', 250, 'choice' + i);
      say(by, c.say || plain(c.ja), i < item.choices.length - 1 ? 700 : 0, 'choice' + i);
    });
    return steps;
  }

  // ─── Pictures ──────────────────────────────────────────────────────────────

  function itemsPic(p) {
    const out = [];
    p.items.forEach(([e, n]) => { for (let i = 0; i < n; i++) out.push(`<span>${e}</span>`); });
    return `<div class="lis-items${out.length === 1 ? ' lis-items-one' : ''}">${out.join('')}</div>`;
  }

  function clockPic(p) {
    const ticks = [];
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      const r1 = i % 3 ? 40 : 36;
      ticks.push(`<line x1="${50 + r1 * Math.sin(a)}" y1="${50 - r1 * Math.cos(a)}" x2="${50 + 44 * Math.sin(a)}" y2="${50 - 44 * Math.cos(a)}"/>`);
    }
    const ha = ((p.h % 12) + p.m / 60) * Math.PI / 6;
    const ma = p.m * Math.PI / 30;
    return `<svg class="lis-svg" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="46" class="lis-face"/>
      <g class="lis-ink" stroke-width="2.5" stroke-linecap="round">${ticks.join('')}</g>
      <line class="lis-ink" x1="50" y1="50" x2="${50 + 24 * Math.sin(ha)}" y2="${50 - 24 * Math.cos(ha)}" stroke-width="5" stroke-linecap="round"/>
      <line class="lis-ink" x1="50" y1="50" x2="${50 + 36 * Math.sin(ma)}" y2="${50 - 36 * Math.cos(ma)}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="3.5" class="lis-dot"/>
    </svg>`;
  }

  function personPic(p) {
    const hairBack = p.hair === 'long'
      ? '<path class="lis-hair" d="M22 34 Q22 12 40 12 Q58 12 58 34 L60 62 Q40 68 20 62 Z"/>' : '';
    const hairTop = p.hair === 'long'
      ? '<path class="lis-hair" d="M24 30 Q26 14 40 14 Q54 14 56 30 Q48 22 40 23 Q32 22 24 30 Z"/>'
      : '<path class="lis-hair" d="M24 31 Q24 13 40 13 Q56 13 56 31 Q52 22 40 22 Q28 22 24 31 Z"/>';
    const glasses = p.glasses
      ? '<g class="lis-stroke" stroke-width="1.8"><circle cx="33.5" cy="33" r="5"/><circle cx="46.5" cy="33" r="5"/><line x1="38.5" y1="33" x2="41.5" y2="33"/></g>' : '';
    const hat = p.hat
      ? '<g class="lis-hat"><path d="M27 22 Q27 6 40 6 Q53 6 53 22 Z"/><ellipse cx="40" cy="22" rx="24" ry="4.5"/></g>' : '';
    return `<svg class="lis-svg" viewBox="0 0 80 112" aria-hidden="true">
      ${hairBack}
      <path class="lis-shirt" d="M18 96 Q18 58 40 56 Q62 58 62 96 Z"/>
      <rect class="lis-skin" x="35" y="46" width="10" height="10" rx="3"/>
      <circle class="lis-skin" cx="40" cy="32" r="16"/>
      ${hairTop}
      <circle class="lis-ink" cx="33.5" cy="33" r="1.6"/><circle class="lis-ink" cx="46.5" cy="33" r="1.6"/>
      <path class="lis-stroke" d="M35 40 Q40 44 45 40" stroke-width="1.6" stroke-linecap="round"/>
      ${glasses}${hat}
      <g class="lis-legs"><rect x="27" y="96" width="9" height="15" rx="2"/><rect x="44" y="96" width="9" height="15" rx="2"/></g>
    </svg>`;
  }

  // Three weeks of a month that starts on a Saturday, so the 8th and the
  // 15th are Saturdays and the 14th a Friday.
  function calendarPic(p) {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const cells = days.map((d, i) =>
      `<text x="${12 + i * 20}" y="13" class="lis-cal-head${i === 0 ? ' lis-sun' : i === 6 ? ' lis-sat' : ''}">${d}</text>`);
    for (let n = 2; n <= 22; n++) {
      const i = (n - 2) % 7;
      const row = Math.floor((n - 2) / 7);
      const x = 12 + i * 20;
      const y = 33 + row * 20;
      if (n === p.mark) cells.push(`<circle cx="${x}" cy="${y - 4.5}" r="8.5" class="lis-mark"/>`);
      cells.push(`<text x="${x}" y="${y}" class="lis-cal-day${i === 0 ? ' lis-sun' : i === 6 ? ' lis-sat' : ''}">${n}</text>`);
    }
    return `<svg class="lis-svg lis-wide" viewBox="0 0 144 78" aria-hidden="true">
      <line x1="2" y1="18" x2="142" y2="18" class="lis-rule"/>${cells.join('')}
    </svg>`;
  }

  function weatherPic(p) {
    return `<div class="lis-weather">
      <div><span class="lis-weather-icon">${p.am}</span><span class="lis-weather-label" lang="ja">午前</span></div>
      <span class="lis-weather-arrow" aria-hidden="true">→</span>
      <div><span class="lis-weather-icon">${p.pm}</span><span class="lis-weather-label" lang="ja">午後</span></div>
    </div>`;
  }

  // A street from above: the bank in the middle of the far side, and the
  // spot being asked about starred.
  const MAP_SPOTS = { left: [6, 6], right: [110, 6], front: [58, 78], corner: [110, 78] };
  function mapPic(p) {
    const blocks = [[6, 6], [58, 6], [110, 6], [6, 78], [58, 78], [110, 78]].map(([x, y]) => {
      const isBank = x === 58 && y === 6;
      const isMark = MAP_SPOTS[p.at][0] === x && MAP_SPOTS[p.at][1] === y;
      return `<rect x="${x}" y="${y}" width="44" height="34" rx="4" class="${isMark ? 'lis-mark-block' : isBank ? 'lis-bank' : 'lis-block'}"/>`
        + (isBank ? `<text x="${x + 22}" y="${y + 22}" class="lis-map-label">銀行</text>` : '')
        + (isMark ? `<text x="${x + 22}" y="${y + 25}" class="lis-map-star">★</text>` : '');
    });
    return `<svg class="lis-svg lis-wide" viewBox="0 0 160 118" aria-hidden="true">
      <rect x="0" y="46" width="160" height="26" class="lis-road"/>
      <line x1="4" y1="59" x2="156" y2="59" class="lis-road-line"/>
      ${blocks.join('')}
    </svg>`;
  }

  function pricePic(p) {
    return `<div class="lis-price" lang="ja">${p.yen}<small>円</small></div>`;
  }

  const PICTURES = {
    items: itemsPic, clock: clockPic, person: personPic, calendar: calendarPic,
    weather: weatherPic, map: mapPic, price: pricePic,
  };

  function pictureHtml(p) {
    const draw = PICTURES[p.type];
    return draw ? draw(p) : '';
  }

  // 問題3: the scene, with an arrow over the person who speaks.
  function sceneHtml(s) {
    const arrow = '<span class="lis-bubble">？</span><span class="lis-arrow" aria-hidden="true">⬇</span>';
    return `<div class="lis-scene" aria-hidden="true">
      <div class="lis-scene-person">${s.arrow === 'left' ? arrow : '<span class="lis-arrow-gap"></span>'}<span>${s.left}</span></div>
      <div class="lis-scene-prop">${s.prop}</div>
      <div class="lis-scene-person">${s.arrow === 'right' ? arrow : '<span class="lis-arrow-gap"></span>'}<span>${s.right}</span></div>
    </div>`;
  }

  const api = { pieces, plain, rubyHtml, questionOf, buildScript, pictureHtml, sceneHtml, PICTURES, MAP_SPOTS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.Listening = api;
  if (typeof document === 'undefined') return;

  // ─── Voices ────────────────────────────────────────────────────────────────

  const synth = 'speechSynthesis' in global ? global.speechSynthesis : null;
  const MALE = /otoya|keita|ichiro|hattori|daichi|naoki|kenji|takumi|male|男/i;
  const FEMALE = /kyoko|nanami|haruka|ayumi|sayaka|mizuki|o-ren|aoi|mayu|shiori|nanako|female|女/i;

  function voiceScore(v) {
    const n = v.name;
    let score = 0;
    if (/natural|neural/i.test(n)) score += 50;
    if (/premium/i.test(n)) score += 45;
    if (/enhanced|siri/i.test(n)) score += 35;
    if (/google/i.test(n)) score += 25;
    if (/online/i.test(n)) score += 10;
    if (/compact|espeak/i.test(n)) score -= 20;
    return score;
  }

  // Narrator, man and woman. With a male and a female Japanese voice each
  // speaker gets their own; with only one voice the pitch tells them apart.
  function castVoices() {
    const ja = (synth ? synth.getVoices() : [])
      .filter(v => /^ja\b|^ja[-_]/i.test(v.lang))
      .sort((a, b) => voiceScore(b) - voiceScore(a));
    const male = ja.find(v => MALE.test(v.name)) || null;
    const female = ja.find(v => FEMALE.test(v.name) && !MALE.test(v.name)) || null;
    const any = ja[0] || null;
    const narrator = female || any;
    return {
      found: ja.length > 0,
      N: { voice: narrator, pitch: 1 },
      F: female ? { voice: female, pitch: female === narrator ? 1.15 : 1 } : { voice: any, pitch: 1.3 },
      M: male ? { voice: male, pitch: 1 } : { voice: any, pitch: 0.7 },
    };
  }

  // ─── State ─────────────────────────────────────────────────────────────────

  function load(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  }

  const SECTIONS = global.LISTENING_SECTIONS || [];
  const settings = Object.assign({ slow: false, once: false, script: false, furigana: true }, load(SETTINGS_KEY, {}));
  const best = load(STORE_KEY, {});

  const $ = id => document.getElementById(id);
  let session = null;   // { id, queue: [{ section, item, number, answered, picked, played }], pos }
  let playToken = 0;
  let playing = false;
  let playsLeft = Infinity;
  let autoTimer = 0;

  const PROMPTS = {
    pictures: 'Listen to the conversation, then pick the picture that answers the question.',
    hatsuwa: 'Look at the picture. Which reply does the person with the red arrow say?',
    sokuji: 'There is no picture. Listen to the line, then pick the most natural reply.',
  };
  const promptFor = section => section.kind === 'pictures' ? PROMPTS.pictures : PROMPTS[section.id] || PROMPTS.sokuji;

  // ─── Playback ──────────────────────────────────────────────────────────────

  function stopAudio() {
    playToken++;
    playing = false;
    clearTimeout(autoTimer);
    if (synth) synth.cancel();
    document.querySelectorAll('.lis-speaking').forEach(el => el.classList.remove('lis-speaking'));
    updatePlayer();
  }

  // Resolves with false when the browser refuses to speak (no user gesture
  // yet), so the caller can stop and wait for the play button.
  function speakOne(step, token, cast) {
    return new Promise(resolve => {
      if (token !== playToken) return resolve(true);
      const u = new SpeechSynthesisUtterance(step.text);
      const c = cast[step.voice] || cast.N;
      u.lang = 'ja-JP';
      if (c.voice) { u.voice = c.voice; u.lang = c.voice.lang; }
      u.pitch = c.pitch;
      u.rate = settings.slow ? 0.7 : 0.95;
      let done = false;
      const finish = ok => { if (!done) { done = true; clearTimeout(guard); resolve(ok); } };
      // Some browsers never fire onend for an utterance; don't hang on it.
      const guard = setTimeout(() => finish(true), 2500 + step.text.length * 400 / u.rate);
      u.onend = () => finish(true);
      u.onerror = e => finish(!(e && e.error === 'not-allowed'));
      synth.speak(u);
    });
  }

  const wait = ms => new Promise(r => setTimeout(r, ms));
  const SPEAKER = { N: 'Narrator', M: 'Man · 男の人', F: 'Woman · 女の人' };

  // Plays a list of steps. `onDone(finished)` runs when it ends by itself.
  async function playSteps(steps, onDone) {
    if (!synth) return;
    stopAudio();
    const token = playToken;
    const cast = castVoices();
    playing = true;
    setProgress(0);
    updatePlayer();
    await wait(80); // Chrome sometimes drops an utterance queued right after cancel().
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (token !== playToken) return;
      const row = step.line && document.querySelector(`[data-line="${step.line}"]`);
      if (row) row.classList.add('lis-speaking');
      setStatus(SPEAKER[step.voice] || '', true);
      const spoke = await speakOne(step, token, cast);
      if (row) row.classList.remove('lis-speaking');
      if (token !== playToken) return;
      if (!spoke) { playing = false; setProgress(0); if (onDone) onDone(false); updatePlayer(); return; }
      setProgress((i + 1) / steps.length);
      if (step.pause) await wait(settings.slow ? step.pause * 1.4 : step.pause);
    }
    if (token !== playToken) return;
    playing = false;
    if (onDone) onDone(true);
    updatePlayer();
  }

  function playCurrent() {
    const q = current();
    if (!q || playing || (!q.answered && playsLeft <= 0)) return;
    const counts = !q.answered;
    if (counts) playsLeft--;
    playSteps(buildScript(q.section, q.item, q.number), finished => {
      if (finished) q.played = true;
      else if (counts) playsLeft++; // blocked before it started: give the play back
    });
  }

  function setStatus(text, live) {
    const el = $('lis-status');
    if (!el) return;
    el.textContent = text;
    el.classList.toggle('lis-status-live', !!live);
  }

  function setProgress(f) {
    const el = $('lis-audio-fill');
    if (el) el.style.width = `${Math.round(f * 100)}%`;
  }

  function updatePlayer() {
    const btn = $('lis-play');
    const q = current();
    if (!btn || !q) return;
    const locked = !q.answered && playsLeft <= 0 && !playing;
    btn.classList.toggle('lis-playing', playing);
    btn.innerHTML = playing ? '<span aria-hidden="true">■</span>' : (q.played || q.answered ? '<span aria-hidden="true">↻</span>' : '<span aria-hidden="true">▶</span>');
    btn.setAttribute('aria-label', playing ? 'Stop' : q.played ? 'Play again' : 'Play');
    btn.disabled = !synth || locked;
    const done = !playing && (q.played || q.answered);
    $('lis-audio').classList.toggle('lis-audio-done', done);
    if (playing) return;
    setProgress(done ? 1 : 0);
    if (!synth) setStatus('No Japanese voice — read the script below');
    else if (q.answered) setStatus('Tap ↻ to hear it again, or tap a line in the script');
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

  function bestText(id) {
    const b = best[id];
    return b ? `Best ${b.score}/${b.total}` : '';
  }

  function renderHome() {
    const total = SECTIONS.reduce((n, s) => n + s.items.length, 0);
    $('lis-start-meta').textContent = `All four parts · ${total} questions${best.all ? ' · ' + bestText('all') : ''}`;
    $('lis-sections').innerHTML = SECTIONS.map(s => `
      <button class="lis-part-row" data-section="${s.id}">
        <span class="lis-part-badge" lang="ja">問題${s.num}</span>
        <span class="lis-part-body">
          <span class="lis-part-title">${esc(s.en)} <span class="lis-part-ja" lang="ja">${esc(plain(s.ja))}</span></span>
          <span class="lis-part-desc">${esc(s.desc)}</span>
        </span>
        <span class="lis-part-meta">${s.items.length} Qs${best[s.id] ? `<br>${bestText(s.id)}` : ''}</span>
        <span class="lis-part-go" aria-hidden="true">›</span>
      </button>`).join('');
    ['slow', 'once', 'script', 'furigana'].forEach(k => { $('lis-opt-' + k).checked = !!settings[k]; });
    $('lis-no-voice').classList.toggle('hidden', !!synth && castVoices().found);
    document.body.classList.toggle('lis-no-furigana', !settings.furigana);
  }

  function start(id) {
    const chosen = id === 'all' ? SECTIONS : SECTIONS.filter(s => s.id === id);
    const queue = [];
    chosen.forEach(section => section.items.forEach((item, i) =>
      queue.push({ section, item, number: i + 1, answered: false, picked: null, played: false })));
    if (!queue.length) return;
    session = { id, queue, pos: 0 };
    show('screen-listening');
    renderQuestion();
  }

  function renderQuestion() {
    stopAudio();
    const q = current();
    const { section, item } = q;
    playsLeft = settings.once ? 1 : Infinity;
    $('lis-part').innerHTML = `<span class="lis-part-badge" lang="ja">問題${section.num}</span> ${esc(section.en)}`;
    $('lis-number').textContent = `${q.number}番`;
    $('lis-progress-text').textContent = `${session.pos + 1} / ${session.queue.length}`;
    $('lis-bar-fill').style.width = `${(session.pos / session.queue.length) * 100}%`;
    $('lis-instructions').textContent = promptFor(section);
    setProgress(0);

    const stage = $('lis-stage');
    if (section.kind === 'pictures') {
      stage.innerHTML = `<div class="lis-choices lis-choices-pics">${item.choices.map((c, i) =>
        `<button class="lis-choice" data-choice="${i}" aria-label="Picture ${i + 1}">
          <span class="lis-choice-num">${i + 1}</span>
          <span class="lis-choice-pic">${pictureHtml(c)}</span></button>`).join('')}</div>`;
    } else {
      stage.innerHTML = (item.picture ? sceneHtml(item.picture) : '')
        + `<p class="lis-choices-label">Which reply did you hear?</p>
          <div class="lis-choices lis-choices-spoken">${item.choices.map((c, i) =>
          `<button class="lis-choice" data-choice="${i}" aria-label="Reply ${i + 1}">
            <span class="lis-choice-num">${i + 1}</span><span class="lis-choice-text" lang="ja"></span></button>`).join('')}</div>`;
    }
    renderScript();
    $('lis-result').classList.add('hidden');
    updatePlayer();
    // Play straight away, like the test. If the browser won't speak without
    // a tap first, the play button waits for one.
    if (synth) autoTimer = setTimeout(playCurrent, 450);
  }

  // The script: hidden until the answer is picked (or always, with the
  // "show the script" option). Each row can be tapped to hear it again.
  function renderScript() {
    const q = current();
    const { section, item } = q;
    const visible = q.answered || settings.script || !synth;
    const box = $('lis-script');
    box.classList.toggle('hidden', !visible);
    if (!visible) { $('lis-script-body').innerHTML = ''; return; }
    const who = { N: '', M: '男', F: '女' };
    const row = (key, voice, ja, en, extra = '', sayText) =>
      `<div class="lis-line${extra}" data-line="${key}" data-voice="${voice}" data-say="${esc(sayText || plain(ja))}" role="button" tabindex="0" title="Play this line">
        <span class="lis-who" lang="ja">${who[voice]}</span>
        <span class="lis-ja" lang="ja">${rubyHtml(ja)}</span>
        ${en ? `<span class="lis-en">${esc(en)}</span>` : ''}
      </div>`;
    const rows = [];
    if (item.intro) rows.push(row('intro', 'N', item.intro, '', ' lis-line-narr', item.sayIntro));
    (item.lines || []).forEach((l, i) => rows.push(row('line' + i, l.who, l.ja, l.en, '', l.say)));
    if (section.kind === 'pictures') {
      rows.push(row('question', 'N', questionOf(item), '', ' lis-line-narr'));
    } else {
      item.choices.forEach((c, i) => {
        const mark = q.answered ? (i === item.answer ? ' lis-line-right' : i === q.picked ? ' lis-line-wrong' : '') : '';
        rows.push(row('choice' + i, item.replyBy || 'M', `${i + 1}. ${c.ja}`, q.answered ? c.en : '', ' lis-line-choice' + mark, c.say));
      });
    }
    $('lis-script-body').innerHTML = rows.join('');
  }

  function pick(i) {
    const q = current();
    if (!q || q.answered) return;
    stopAudio();
    q.answered = true;
    q.picked = i;
    const right = i === q.item.answer;
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
    $('lis-result-title').textContent = right ? '正解！ Correct' : `Not quite — the answer is ${q.item.answer + 1}`;
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
      renderQuestion();
      window.scrollTo(0, 0);
    } else {
      finish();
    }
  }

  function finish() {
    stopAudio();
    const score = session.queue.filter(q => q.picked === q.item.answer).length;
    const total = session.queue.length;
    const prev = best[session.id];
    if (!prev || score > prev.score) { best[session.id] = { score, total }; save(STORE_KEY, best); }
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
    show('screen-listening-done');
  }

  function goHome() {
    stopAudio();
    session = null;
    renderHome();
    show('screen-chapters');
  }

  // ─── Events ────────────────────────────────────────────────────────────────

  $('lis-start').addEventListener('click', () => start('all'));
  $('lis-sections').addEventListener('click', e => {
    const row = e.target.closest('[data-section]');
    if (row) start(row.dataset.section);
  });
  ['slow', 'once', 'script', 'furigana'].forEach(k => $('lis-opt-' + k).addEventListener('change', e => {
    settings[k] = e.target.checked;
    save(SETTINGS_KEY, settings);
    document.body.classList.toggle('lis-no-furigana', !settings.furigana);
  }));
  $('lis-play').addEventListener('click', () => (playing ? stopAudio() : playCurrent()));
  $('lis-stage').addEventListener('click', e => {
    const btn = e.target.closest('.lis-choice');
    if (btn) pick(Number(btn.dataset.choice));
  });
  function playRow(el) {
    playSteps([{ voice: el.dataset.voice, text: el.dataset.say, pause: 0, line: el.dataset.line }]);
  }
  $('lis-script-body').addEventListener('click', e => {
    const row = e.target.closest('.lis-line');
    if (row) playRow(row);
  });
  $('lis-script-body').addEventListener('keydown', e => {
    const row = e.target.closest('.lis-line');
    if (row && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); playRow(row); }
  });
  $('btn-lis-next').addEventListener('click', next);
  $('lis-quit').addEventListener('click', goHome);
  $('btn-lis-again').addEventListener('click', () => start(session.id));
  $('btn-lis-home').addEventListener('click', goHome);

  document.addEventListener('keydown', e => {
    if (!session || !$('screen-listening').classList.contains('active')) return;
    if (e.target.closest && e.target.closest('input, textarea, select, .lis-line, summary')) return;
    const q = current();
    const n = Number(e.key);
    if (n >= 1 && n <= q.item.choices.length && !q.answered) { e.preventDefault(); pick(n - 1); }
    else if ((e.key === ' ' || e.key === 'Enter') && q.answered) { e.preventDefault(); next(); }
    else if (e.key === 'p' || e.key === 'P' || e.key === 'r' || e.key === 'R') { e.preventDefault(); playing ? stopAudio() : playCurrent(); }
  });

  if (synth) {
    const refresh = () => { if ($('screen-chapters').classList.contains('active')) renderHome(); };
    if (synth.addEventListener) synth.addEventListener('voiceschanged', refresh);
    else synth.onvoiceschanged = refresh;
  }
  window.addEventListener('pagehide', stopAudio);
  renderHome();
})(typeof window !== 'undefined' ? window : globalThis);
