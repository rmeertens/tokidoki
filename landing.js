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
  if (!dataEl) return;
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
    if (q.audio) html += '<button type="button" class="btn-secondary lp-play" id="lp-play">▶ Play</button>';
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
      '<button type="button" class="btn-primary lp-btn" id="lp-next">' + (last ? 'See my score' : 'Next question') + '</button>';
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
      '<a class="btn-primary lp-btn" id="lp-cta-end" href="' + data.cta.href + '">' + data.cta.label + '</a>' +
      '<button type="button" class="btn-secondary lp-btn" id="lp-again">Try again</button></div>';
    document.getElementById('lp-again').addEventListener('click', function () {
      i = 0; score = 0; started = false; render();
    });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-cta], #lp-cta-end');
    if (a) track('lp_cta_click', { href: a.getAttribute('href') });
  });
  if (!root || !qs.length) return; // a page with no quiz (the verb chart)
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var n = parseInt(e.key, 10);
    if (!n) return;
    var btns = root.querySelectorAll('.lp-opt:not(:disabled)');
    if (btns[n - 1]) btns[n - 1].click();
  });

  render();
})();

// The conjugation chart's rules: each form's button opens the row under it
// (render_landing_pages.mjs writes them hidden), "Show all rules" opens or
// closes every one. --lp-w keeps an open row as wide as the visible part of
// the table when it scrolls sideways.
(function () {
  'use strict';

  var chart = document.querySelector('.lp-chart');
  if (!chart) return;
  var btns = chart.querySelectorAll('.lp-rule-btn');
  var all = document.querySelector('.lp-rules-all');

  function fit() { chart.style.setProperty('--lp-w', chart.clientWidth + 'px'); }

  function set(btn, open) {
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.getElementById(btn.getAttribute('aria-controls')).hidden = !open;
  }

  function sync() {
    var open = chart.querySelectorAll('.lp-rule-btn[aria-expanded="true"]').length;
    if (all) all.textContent = open === btns.length ? 'Hide all rules' : 'Show all rules';
  }

  Array.prototype.forEach.call(btns, function (b) {
    b.addEventListener('click', function () {
      set(b, b.getAttribute('aria-expanded') !== 'true');
      sync();
    });
  });
  if (all) {
    all.hidden = false;
    all.addEventListener('click', function () {
      var open = all.textContent === 'Show all rules';
      Array.prototype.forEach.call(btns, function (b) { set(b, open); });
      sync();
    });
  }
  fit();
  window.addEventListener('resize', fit);
})();

// The grammar cheatsheet: each point is a <details> (it opens without
// JavaScript too); this adds the search box, the level buttons and
// "Open all", and opens a point linked to by #id.
(function () {
  'use strict';

  var tools = document.querySelector('.gc-tools');
  if (!tools) return;
  var items = Array.prototype.slice.call(document.querySelectorAll('.gc-item'));
  var sections = document.querySelectorAll('.gc-section');
  var search = tools.querySelector('.gc-search');
  var lvBtns = tools.querySelectorAll('.gc-lv-btn');
  var all = tools.querySelector('.gc-all');
  var none = tools.querySelector('.gc-none');
  var level = 'All';
  // Search the text as written (後で, without the furigana in between) and
  // the readings on their own (あと), so either finds a point.
  var text = items.map(function (d) {
    var c = d.cloneNode(true);
    var rts = Array.prototype.map.call(c.querySelectorAll('rt'), function (r) { return r.textContent; });
    Array.prototype.forEach.call(c.querySelectorAll('rt, rp'), function (r) { r.remove(); });
    return (c.textContent + ' ' + rts.join(' ')).toLowerCase();
  });

  function shown() { return items.filter(function (d) { return !d.hidden; }); }

  function filter() {
    var q = search.value.trim().toLowerCase();
    items.forEach(function (d, i) {
      d.hidden = !((level === 'All' || d.getAttribute('data-lv') === level) && (!q || text[i].indexOf(q) !== -1));
    });
    Array.prototype.forEach.call(sections, function (s) {
      s.hidden = !s.querySelector('.gc-item:not([hidden])');
    });
    none.hidden = shown().length > 0;
    sync();
  }

  function sync() {
    var vis = shown();
    var open = vis.length && vis.every(function (d) { return d.open; });
    all.textContent = open ? 'Close all' : 'Open all';
  }

  search.addEventListener('input', filter);
  Array.prototype.forEach.call(lvBtns, function (b) {
    b.addEventListener('click', function () {
      level = b.getAttribute('data-lv');
      Array.prototype.forEach.call(lvBtns, function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      filter();
    });
  });
  all.addEventListener('click', function () {
    var open = all.textContent === 'Open all';
    shown().forEach(function (d) { d.open = open; });
    sync();
  });
  items.forEach(function (d) { d.addEventListener('toggle', sync); });

  // The site header is sticky too: the tools stick just under it, and
  // jumps to a section or point stop below both (landing.css).
  function fit() {
    var head = document.getElementById('header');
    var root = document.documentElement.style;
    root.setProperty('--gc-head', (head ? head.offsetHeight : 0) + 'px');
    root.setProperty('--gc-tools', tools.offsetHeight + 'px');
  }
  window.addEventListener('resize', fit);
  window.addEventListener('load', fit);

  function openHash() {
    var d = location.hash && document.getElementById(location.hash.slice(1));
    if (d && d.classList.contains('gc-item')) { d.open = true; d.scrollIntoView(); }
  }
  window.addEventListener('hashchange', openHash);
  tools.hidden = false;
  // app.js draws the header on DOMContentLoaded, so measure after it.
  function start() { fit(); openHash(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
