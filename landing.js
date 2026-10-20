// Mini quiz for the practice-first landing pages (scripts/render_landing_pages.mjs).
// The questions are embedded in the page as JSON (#lp-data), so the first
// question is on screen the moment the page loads: no clicks to start.
//
//   { page, cta: { href, label }, questions: [{
//       prompt,   HTML shown above the choices
//       options,  HTML for each choice button
//       answer,   index of the right option
//       explain,  HTML shown after answering
//       audio?,   mp3 to play (listening)
//       fixed?    keep the options in this order (1, 2, 3)
//   }] }
(function () {
  'use strict';

  var root = document.getElementById('lp-quiz');
  var dataEl = document.getElementById('lp-data');
  if (!root || !dataEl) return;
  var data = JSON.parse(dataEl.textContent);
  var qs = data.questions;
  var i = 0, score = 0, started = false, audio = null;

  function track(name, extra) {
    try {
      if (typeof gtag === 'function') {
        var p = { page: data.page };
        for (var k in extra) p[k] = extra[k];
        gtag('event', name, p);
      }
    } catch (e) { /* analytics must never break the quiz */ }
  }

  function shuffle(n, keep) {
    var a = [];
    for (var j = 0; j < n; j++) a.push(j);
    if (keep) return a;
    for (var k = n - 1; k > 0; k--) {
      var r = Math.floor(Math.random() * (k + 1));
      var t = a[k]; a[k] = a[r]; a[r] = t;
    }
    return a;
  }

  function stopAudio() { if (audio) { audio.pause(); audio = null; } }

  function render() {
    stopAudio();
    var q = qs[i];
    var order = shuffle(q.options.length, q.fixed);
    var html = '<div class="lp-progress"><span>Question ' + (i + 1) + ' of ' + qs.length +
      '</span><span class="lp-bar"><i style="width:' + (i / qs.length * 100) + '%"></i></span></div>' +
      '<div class="lp-prompt">' + q.prompt + '</div>';
    if (q.audio) html += '<button type="button" class="lp-play" id="lp-play">▶ Play</button>';
    html += '<div class="lp-options" role="group" aria-label="Choices">';
    order.forEach(function (idx, pos) {
      html += '<button type="button" class="lp-opt" data-i="' + idx + '" aria-keyshortcuts="' + (pos + 1) + '">' +
        q.options[idx] + '</button>';
    });
    html += '</div><div class="lp-feedback" aria-live="polite"></div>';
    root.innerHTML = html;
    root.setAttribute('data-q', i);

    var play = document.getElementById('lp-play');
    if (play) {
      play.addEventListener('click', function () {
        if (!audio) {
          audio = new Audio(q.audio);
          audio.addEventListener('ended', function () { play.textContent = '▶ Play again'; });
        }
        audio.currentTime = 0;
        audio.play();
        play.textContent = '♪ Playing…';
      });
    }
    var btns = root.querySelectorAll('.lp-opt');
    Array.prototype.forEach.call(btns, function (b) {
      b.addEventListener('click', function () { answer(+b.getAttribute('data-i')); });
    });
  }

  function answer(pick) {
    var q = qs[i];
    if (root.getAttribute('data-done') === String(i)) return;
    root.setAttribute('data-done', i);
    if (!started) { started = true; track('lp_quiz_start', {}); }
    var ok = pick === q.answer;
    if (ok) score++;
    Array.prototype.forEach.call(root.querySelectorAll('.lp-opt'), function (b) {
      var idx = +b.getAttribute('data-i');
      b.disabled = true;
      if (idx === q.answer) b.classList.add('right');
      else if (idx === pick) b.classList.add('wrong');
    });
    var last = i === qs.length - 1;
    root.querySelector('.lp-feedback').innerHTML =
      '<div class="lp-verdict ' + (ok ? 'ok' : 'no') + '">' + (ok ? 'Correct!' : 'Not quite.') + '</div>' +
      '<div class="lp-explain">' + q.explain + '</div>' +
      '<button type="button" class="lp-btn" id="lp-next">' + (last ? 'See my score' : 'Next question') + '</button>';
    var next = document.getElementById('lp-next');
    next.focus();
    next.addEventListener('click', function () { if (last) finish(); else { i++; render(); } });
  }

  function finish() {
    stopAudio();
    track('lp_quiz_complete', { score: score, total: qs.length });
    root.removeAttribute('data-done');
    root.innerHTML = '<div class="lp-score"><strong>' + score + ' / ' + qs.length + '</strong>' +
      '<p>' + (score === qs.length ? 'Perfect run.' : 'Nice work. The full practice shows you the ones you miss again.') + '</p>' +
      '<a class="lp-btn" id="lp-cta-end" href="' + data.cta.href + '">' + data.cta.label + '</a>' +
      '<button type="button" class="lp-btn alt" id="lp-again">Try again</button></div>';
    document.getElementById('lp-again').addEventListener('click', function () {
      i = 0; score = 0; started = false; render();
    });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-cta], #lp-cta-end');
    if (a) track('lp_cta_click', { href: a.getAttribute('href') });
  });
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var n = parseInt(e.key, 10);
    if (!n) return;
    var btns = root.querySelectorAll('.lp-opt:not(:disabled)');
    if (btns[n - 1]) btns[n - 1].click();
  });

  render();
})();
