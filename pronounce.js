// Pronunciation with the browser's speech engine, shared by every page that
// shows Japanese words.
//
//   Pronounce.buttonsHtml(kana)  → 🔊 / 🐢 buttons that read `kana` aloud at a
//                                  natural pace or slowly. Clicks on them are
//                                  handled here and go no further, so they
//                                  never also flip a card or open a panel.
//   Pronounce.onClick(kana)      → call from a word's click handler: reads it
//                                  aloud when "Speak words on click" is on.
//   Pronounce.speakAll(texts, {slow, onStart(i), onDone(finished)})
//                                → reads several texts one after another (a
//                                  whole story), calling onStart before each
//                                  and onDone once at the end or on stop().
//   Pronounce.stop()             → stops whatever is being read.
//   <button data-speak-toggle>   → becomes the "Speak words on click" switch.
//                                  The setting is shared by all pages.
//
// Voices are ranked the same way as on the Notepad, and the voice picked
// there is used everywhere. Pass kana where possible — a voice reading kanji
// can pick the wrong reading. Browsers without speech get no buttons.
(function (global) {
  'use strict';

  const synth = 'speechSynthesis' in global ? global.speechSynthesis : null;
  const AUTO_KEY = 'tokidoki-speak-on-click';
  const NOTEPAD_VOICE_KEY = 'tokidoki-notepad-voice';

  function voiceScore(v) {
    const n = v.name;
    let score = 0;
    if (/natural|neural/i.test(n)) score += 50;      // Edge: Nanami / Keita Online (Natural)
    if (/premium/i.test(n)) score += 45;             // macOS / iOS downloadable voices
    if (/enhanced|siri/i.test(n)) score += 35;
    if (/google/i.test(n)) score += 25;              // Chrome: Google 日本語
    if (/online/i.test(n)) score += 10;
    if (!v.localService) score += 5;
    if (/^ja[-_]JP$/i.test(v.lang)) score += 2;
    if (/compact|espeak/i.test(n)) score -= 20;
    return score;
  }

  function chosenVoice() {
    const voices = synth.getVoices()
      .filter(v => /^ja\b|^ja[-_]/i.test(v.lang))
      .sort((a, b) => voiceScore(b) - voiceScore(a));
    let want = '';
    try { want = JSON.parse(localStorage.getItem(NOTEPAD_VOICE_KEY)) || ''; } catch { /* none picked */ }
    return voices.find(v => v.voiceURI === want) || voices[0] || null;
  }

  let current = null; // keep a reference, or Chrome may drop the utterance
  let sequence = null; // the speakAll() run in progress, if any

  function utterance(text, slow) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    const voice = chosenVoice();
    if (voice) { u.voice = voice; u.lang = voice.lang; }
    u.rate = slow ? 0.6 : 0.95;
    return u;
  }

  const clean = text => String(text || '').replace(/[～~〜]/g, '').trim();

  function speak(text, slow) {
    if (!synth) return;
    text = clean(text);
    if (!text) return;
    endSequence(false);
    try {
      synth.cancel();
      const u = utterance(text, slow);
      current = u;
      // Chrome sometimes drops an utterance queued right after cancel().
      setTimeout(() => { if (current === u) synth.speak(u); }, 50);
    } catch { /* speech unavailable */ }
  }

  function endSequence(finished) {
    const run = sequence;
    if (!run) return;
    sequence = null;
    if (run.onDone) run.onDone(finished);
  }

  // One utterance per text, each queued when the last ends, so the caller
  // can follow along (and so long stories don't hit Chrome's length limits).
  function speakAll(texts, opts = {}) {
    if (!synth) return;
    stop();
    const run = { texts: texts.map(clean), i: -1, slow: !!opts.slow, onStart: opts.onStart, onDone: opts.onDone };
    sequence = run;
    const next = () => {
      if (sequence !== run) return;
      run.i++;
      while (run.i < run.texts.length && !run.texts[run.i]) run.i++;
      if (run.i >= run.texts.length) { endSequence(true); return; }
      if (run.onStart) run.onStart(run.i);
      try {
        const u = utterance(run.texts[run.i], run.slow);
        u.onend = next;
        u.onerror = () => { if (sequence === run) endSequence(false); };
        current = u;
        synth.speak(u);
      } catch { endSequence(false); }
    };
    // As in speak(): give cancel() a moment before queueing.
    setTimeout(next, 50);
  }

  function stop() {
    endSequence(false);
    current = null;
    try { if (synth) synth.cancel(); } catch { /* speech unavailable */ }
  }

  const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

  function buttonsHtml(text, extraClass) {
    if (!synth || !text) return '';
    const t = esc(text);
    return `<span class="speak-pair${extraClass ? ' ' + extraClass : ''}">`
      + `<button type="button" class="speak-btn" data-say="${t}" title="Listen" aria-label="Listen to ${t}"><span aria-hidden="true">🔊</span></button>`
      + `<button type="button" class="speak-btn" data-say="${t}" data-slow="1" title="Listen slowly" aria-label="Listen to ${t} slowly"><span aria-hidden="true">🐢</span></button>`
      + '</span>';
  }

  // ─── "Speak words on click" ────────────────────────────────────────────────

  let auto = false;
  try {
    const v = localStorage.getItem(AUTO_KEY);
    auto = v === null ? localStorage.getItem('tokidoki-vocab-autospeak') === '1' : v === '1';
  } catch { /* storage unavailable */ }

  function renderToggles() {
    document.querySelectorAll('[data-speak-toggle]').forEach(btn => {
      btn.classList.toggle('hidden', !synth);
      btn.setAttribute('aria-pressed', auto);
      btn.innerHTML = `&#128266;<span class="speak-toggle-label"> Speak words on click:</span> ${auto ? 'On' : 'Off'}`;
      btn.title = `Speak words on click: ${auto ? 'On' : 'Off'}`;
    });
  }

  function setAuto(on) {
    auto = !!on;
    try { localStorage.setItem(AUTO_KEY, auto ? '1' : '0'); } catch { /* storage unavailable */ }
    renderToggles();
  }

  function onClick(text) {
    if (auto) speak(text, false);
  }

  if (typeof document !== 'undefined') {
    // Capture phase, so the click stops here before the card or word under
    // the button reacts to it.
    document.addEventListener('click', (e) => {
      const btn = e.target.closest && e.target.closest('.speak-btn[data-say], [data-speak-toggle]');
      if (!btn) return;
      e.stopPropagation();
      if (btn.hasAttribute('data-speak-toggle')) setAuto(!auto);
      else speak(btn.dataset.say, !!btn.dataset.slow);
    }, true);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderToggles);
    else renderToggles();
  }

  global.Pronounce = {
    supported: !!synth,
    speak,
    speakAll,
    stop,
    get reading() { return !!sequence; },
    buttonsHtml,
    onClick,
    get auto() { return auto; },
    setAuto,
  };
})(typeof window !== 'undefined' ? window : globalThis);
