// Tap and swipe for the self-graded flashcards (Stories / Memes flashcards,
// Kanji Quiz, Kana, Verbs, Adjectives, Build Your Own, Sentences, Bunkei).
//
// Every one of those is a `.card` holding a "Show Answer" `.btn-reveal` and,
// once revealed, a `.grade-buttons` row with `.btn-again` (didn't know) and
// `.btn-easy` (got it). This drives those same buttons, so each page keeps its
// own grading:
//
//   - tapping the card (anywhere that isn't a button, link, input or the kana
//     drawing canvas) while its answer is hidden shows the answer;
//   - dragging the card sideways tilts it, and letting go past the
//     threshold flies it off: left = again, right = got it. That works
//     before the answer is shown too (it's shown, then graded, since the
//     pages only take a grade for a revealed card). A shorter drag springs
//     back.
//
// Works with touch, pen and mouse; vertical drags still scroll the page.
(function (global) {
  'use strict';

  if (!global.document) return;
  const doc = global.document;

  const IGNORE = 'button, a, input, textarea, select, label, summary, canvas, [role="button"], [contenteditable], .kana-canvas-wrap';
  const START = 10;          // px before a drag counts as a swipe
  const FLY_MS = 180;

  const visible = el => !!el && el.offsetParent !== null && !el.closest('.hidden');

  // The flashcard a target sits in: a `.card` with grade buttons.
  function cardOf(target) {
    const card = target.closest && target.closest('.card');
    return card && card.querySelector('.grade-buttons') ? card : null;
  }

  const revealButton = card => [...card.querySelectorAll('.btn-reveal')].find(visible) || null;
  const gradeButton = (card, right) => {
    const btn = card.querySelector(right ? '.grade-buttons .btn-easy' : '.grade-buttons .btn-again');
    return visible(btn) ? btn : null;
  };

  // ── Tap to reveal ──

  // The click a drag ends with isn't a tap: swallow clicks for a moment after.
  let suppressUntil = 0;

  doc.addEventListener('click', e => {
    if (Date.now() < suppressUntil) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const card = cardOf(e.target);
    if (!card || e.target.closest(IGNORE)) return;
    const sel = global.getSelection && global.getSelection();
    if (sel && !sel.isCollapsed && card.contains(sel.anchorNode)) return; // selecting text
    const btn = revealButton(card);
    if (btn) btn.click();
  }, true);

  // ── Swipe to grade ──

  let drag = null; // { card, id, x, y, dx, active }

  function setTilt(card, dx) {
    const width = card.offsetWidth || 300;
    const p = Math.max(-1, Math.min(1, dx / threshold(card)));
    card.style.transform = `translateX(${dx}px) rotate(${(dx / width) * 12}deg)`;
    card.style.setProperty('--swipe', Math.abs(p).toFixed(2));
    card.classList.toggle('swipe-left', dx < 0);
    card.classList.toggle('swipe-right', dx > 0);
  }

  function clearTilt(card, animate) {
    card.classList.toggle('swipe-settle', !!animate);
    card.classList.remove('swiping', 'swipe-left', 'swipe-right');
    card.style.transform = '';
    card.style.removeProperty('--swipe');
    if (animate) setTimeout(() => card.classList.remove('swipe-settle'), 220);
  }

  const threshold = card => Math.min(110, (card.offsetWidth || 300) * 0.28);

  // While a card is held, the page itself stays put: no overscroll bounce,
  // pull-to-refresh or swipe-back (html.swipe-lock in style.css).
  const lockPage = on => doc.documentElement.classList.toggle('swipe-lock', on);

  doc.addEventListener('pointerdown', e => {
    if (drag || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const card = cardOf(e.target);
    if (!card || card.classList.contains('swipe-flying')) return;
    if (e.target.closest('input, textarea, select, canvas, .kana-canvas-wrap')) return;
    // Gradable now, or once its answer is shown (not while typing an answer).
    if (!(gradeButton(card, false) && gradeButton(card, true)) && !revealButton(card)) return;
    drag = { card, id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, active: false };
  });

  // Pointer events can't stop the browser scrolling — only the touch events
  // can. As soon as a touch on a card heads more sideways than up or down,
  // its moves are cancelled, so the page neither scrolls nor pans while the
  // card follows the finger. A touch that heads up or down scrolls as usual.
  let touch = null; // { x, y, dir: null | 'x' | 'y' }
  doc.addEventListener('touchstart', e => {
    touch = e.touches.length === 1 && cardOf(e.target) && !e.target.closest('input, textarea, select, canvas, .kana-canvas-wrap')
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY, dir: null }
      : null;
  }, { passive: true });
  doc.addEventListener('touchmove', e => {
    if (!touch || e.touches.length !== 1) return;
    if (!touch.dir) {
      const dx = Math.abs(e.touches[0].clientX - touch.x);
      const dy = Math.abs(e.touches[0].clientY - touch.y);
      if (dx < 3 && dy < 3) return;
      touch.dir = dx > dy ? 'x' : 'y';
    }
    if (touch.dir === 'x' && drag && e.cancelable) e.preventDefault();
  }, { passive: false });
  doc.addEventListener('touchend', () => { touch = null; }, { passive: true });
  doc.addEventListener('touchcancel', () => { touch = null; }, { passive: true });

  doc.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.active) {
      if (touch && touch.dir === 'y') { drag = null; return; } // scrolling
      if (Math.abs(dy) > START && Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
      if (Math.abs(dx) < START) return;
      drag.active = true;
      // Follow the finger from here, without jumping by the slop.
      drag.x += Math.sign(dx) * START;
      drag.card.classList.add('swiping');
      lockPage(true);
      try { drag.card.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
    }
    e.preventDefault();
    drag.dx = e.clientX - drag.x;
    setTilt(drag.card, drag.dx);
  });

  function endDrag(e, cancelled) {
    if (!drag || e.pointerId !== drag.id) return;
    const { card, dx, active } = drag;
    drag = null;
    if (!active) return;
    lockPage(false);
    if (!cancelled) suppressUntil = Date.now() + 400;
    if (cancelled || Math.abs(dx) < threshold(card)) { clearTilt(card, true); return; }
    fly(card, dx > 0);
  }

  // Throws the card off to one side, presses the grade button (showing the
  // answer first if it's still hidden), and brings the next card in.
  function fly(card, right) {
    const reveal = gradeButton(card, right) ? null : revealButton(card);
    if (!reveal && !gradeButton(card, right)) { clearTilt(card, true); return; }
    card.classList.remove('swiping');
    card.classList.add('swipe-flying');
    const off = (global.innerWidth || 800) * (right ? 1 : -1);
    card.style.transform = `translateX(${off}px) rotate(${right ? 20 : -20}deg)`;
    setTimeout(() => {
      card.classList.remove('swipe-flying');
      clearTilt(card, false);
      suppressUntil = 0; // these clicks are ours
      if (reveal) reveal.click();
      const btn = gradeButton(card, right);
      if (btn) btn.click();
      card.classList.add('swipe-enter');
      setTimeout(() => card.classList.remove('swipe-enter'), 220);
    }, FLY_MS);
  }

  doc.addEventListener('pointerup', e => endDrag(e, false));
  doc.addEventListener('pointercancel', e => endDrag(e, true));

  // "Swipe ← didn't know · got it →" under each card's grade buttons.
  function addHints() {
    doc.querySelectorAll('.card .grade-buttons').forEach(row => {
      if (row.nextElementSibling && row.nextElementSibling.classList.contains('swipe-hint')) return;
      const hint = doc.createElement('div');
      hint.className = 'swipe-hint';
      hint.innerHTML = '<span aria-hidden="true">←</span> swipe the card <span aria-hidden="true">→</span>';
      hint.setAttribute('aria-hidden', 'true');
      row.after(hint);
    });
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', addHints);
  else addHints();

  global.SwipeCards = { fly };
})(typeof window !== 'undefined' ? window : globalThis);
