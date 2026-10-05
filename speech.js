// Speak your answer: a microphone button next to an answer box fills it in
// with the browser's speech recognition. It listens in Japanese, or in
// English when the box expects English (its lang attribute). Browsers
// without speech recognition (e.g. Firefox) simply get no button.
(function (global) {
  'use strict';

  const Recognition = global.SpeechRecognition || global.webkitSpeechRecognition;

  const MIC_SVG = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    + '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="17" x2="12" y2="22"/></svg>';

  // The recogniser adds sentence punctuation the answers don't have.
  function clean(text) {
    return text.replace(/[。、．，,.!?！？]+$/g, '').trim();
  }

  // Every recogniser that is listening right now, so stopAll() can end them.
  const active = new Set();

  // Called when an answer is checked or a new card appears, so late
  // results never overwrite a graded answer.
  function stopAll() {
    active.forEach(rec => { rec.cancelled = true; rec.abort(); });
  }

  function attach(input) {
    if (!Recognition || !input || input.dataset.speech) return;
    input.dataset.speech = 'on';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-mic';
    btn.title = 'Speak your answer';
    btn.setAttribute('aria-label', 'Speak your answer');
    btn.innerHTML = MIC_SVG;
    input.insertAdjacentElement('afterend', btn);

    let rec = null;

    btn.addEventListener('click', () => {
      if (rec) { rec.stop(); return; }
      if (input.disabled) return;

      rec = new Recognition();
      rec.lang = (input.getAttribute('lang') || 'ja').startsWith('ja') ? 'ja-JP' : 'en-US';
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      const before = input.value;
      rec.onresult = (e) => {
        if (e.target.cancelled) return;
        let text = '';
        for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
        input.value = clean(text);
      };
      rec.onerror = (e) => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          btn.title = 'Microphone access was blocked';
        }
        if (!input.value) input.value = before;
      };
      rec.onend = (e) => {
        active.delete(e.target);
        rec = null;
        btn.classList.remove('listening');
        if (!e.target.cancelled && !input.disabled) input.focus();
      };

      btn.classList.add('listening');
      try { rec.start(); active.add(rec); } catch { rec = null; btn.classList.remove('listening'); }
    });
  }

  global.Speech = { supported: !!Recognition, attach, stopAll };
})(typeof window !== 'undefined' ? window : globalThis);
