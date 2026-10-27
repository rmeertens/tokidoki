// ▶ / 🐢 on the phrase cards of blog-japanese-for-tourists.html: plays one
// phrase from the post's single VOICEVOX recording, using the start and end
// times in #pb-data (written by scripts/render_tourist_post.mjs).
(function () {
  const el = document.getElementById('pb-data');
  if (!el || typeof Audio === 'undefined') return;
  const data = JSON.parse(el.textContent);
  const SLOW_RATE = 0.7;
  const audio = new Audio();
  audio.preload = 'none';
  let loaded = false;
  let playing = null;  // { to, btn }

  function stop() {
    if (!playing) return;
    playing.btn.classList.remove('playing');
    playing = null;
    audio.pause();
  }

  function play(id, slow, btn) {
    const t = data.t[id];
    if (!t) return;
    stop();
    const mine = { to: t[1], btn };
    playing = mine;
    btn.classList.add('playing');
    if (!loaded) { audio.src = data.src; loaded = true; }
    audio.playbackRate = slow ? SLOW_RATE : 1;
    const seek = () => { try { audio.currentTime = t[0]; } catch { /* not loaded yet */ } };
    if (audio.readyState >= 1) seek();
    else audio.addEventListener('loadedmetadata', () => { if (playing === mine) seek(); }, { once: true });
    audio.play().catch(() => { if (playing === mine) stop(); });
    // timeupdate only fires a few times a second; check every frame so the
    // next phrase doesn't start playing.
    const watch = () => {
      if (playing !== mine) return;
      if (audio.currentTime >= mine.to) stop();
      else requestAnimationFrame(watch);
    };
    requestAnimationFrame(watch);
  }

  audio.addEventListener('ended', stop);
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-p]');
    if (!btn) return;
    if (playing && playing.btn === btn) { stop(); return; }
    play(btn.dataset.p, btn.dataset.slow === '1', btn);
  });
  for (const b of document.querySelectorAll('[data-p]')) if (!data.t[b.dataset.p]) b.hidden = true;
})();
