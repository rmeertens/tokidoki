// Pixel-art kaiten-zushi belt: full size in the hub hero, and a small cropped
// strip in a footer on every other page. Drawn at a tiny logical resolution
// and upscaled with `image-rendering: pixelated`, so every sprite below is
// literally one character per pixel. Waits for DOMContentLoaded so app.js has
// already rendered the header and applied the saved theme.
document.addEventListener('DOMContentLoaded', () => {
  let canvas = document.getElementById('sushi-belt');
  const mini = !canvas;
  if (mini) {
    const footer = document.createElement('footer');
    footer.className = 'belt-footer';
    canvas = document.createElement('canvas');
    canvas.id = 'sushi-belt';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.title = 'Click a plate to grab it';
    footer.appendChild(canvas);
    document.body.appendChild(footer);
    document.body.classList.add('has-belt-footer');
  }
  const ctx = canvas.getContext('2d');

  const H = 48;
  // The mini strip drops the empty rows above the tallest rider.
  const TOP = mini ? 13 : 0;
  const PLATE_Y = 25;
  const BELT_Y = 29;
  const COUNTER_Y = 37;
  const SPACING = 34;
  const SPEED = 12;
  const RARE_CHANCE = 0.04;

  const { COLORS, SUSHI, PLATE, PLATE_COLORS, PROPS, RARE, RARE_PLATE, HEART } = window.TokidokiSushi;
  const SUSHI_KINDS = Object.keys(SUSHI);
  const PROP_KINDS = Object.keys(PROPS);
  const RARE_KINDS = Object.keys(RARE);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let W = 0;
  let scale = 4;
  let plates = [];
  let props = [];
  let hearts = [];
  let theme = {};
  let offset = 0;
  let lastT = 0;
  let running = false;
  let visible = true;

  // Play/pause switch: a button set into the front of the counter, drawn on
  // the canvas in the counter's own wood. An invisible button sits over it
  // for clicks and keyboard. The choice is remembered; without one the belt
  // runs unless the system asks for reduced motion.
  const PAUSE_KEY = 'tokidoki-belt-paused';
  let paused;
  try {
    const saved = localStorage.getItem(PAUSE_KEY);
    paused = saved === null ? reducedMotion.matches : saved === '1';
  } catch {
    paused = reducedMotion.matches;
  }

  // d = shaded edge, l = lit edge, f = face; the icon goes over the face.
  const BOX_X = 3;
  const BOX_Y = COUNTER_Y + 4;
  const BOX = [
    'ddddddddl',
    'dfffffffl',
    'dfffffffl',
    'dfffffffl',
    'dfffffffl',
    'dfffffffl',
    'dllllllll',
  ];
  const ICONS = {
    play: ['ii...', 'iiii.', 'iiiii', 'iiii.', 'ii...'],
    pause: ['ii.ii', 'ii.ii', 'ii.ii', 'ii.ii', 'ii.ii'],
  };
  let boxHover = false;
  let boxDown = false;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'belt-toggle';
  canvas.parentElement.appendChild(toggle);
  function syncToggle() {
    const label = paused ? 'Start the sushi belt' : 'Stop the sushi belt';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    toggle.setAttribute('aria-pressed', String(!paused));
  }
  const redrawIfStill = () => { if (!running) draw(performance.now()); };
  toggle.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem(PAUSE_KEY, paused ? '1' : '0'); } catch {}
    syncToggle();
    updateRunning();
    redrawIfStill();
  });
  toggle.addEventListener('pointerenter', () => { boxHover = true; redrawIfStill(); });
  toggle.addEventListener('pointerleave', () => { boxHover = boxDown = false; redrawIfStill(); });
  toggle.addEventListener('pointerdown', () => { boxDown = true; redrawIfStill(); });
  toggle.addEventListener('pointerup', () => { boxDown = false; redrawIfStill(); });
  syncToggle();

  function readTheme() {
    const cs = getComputedStyle(document.documentElement);
    const v = (name) => cs.getPropertyValue(name).trim();
    theme = {
      slat: v('--belt-slat'),
      slatSeam: v('--belt-seam'),
      steel: v('--belt-steel'),
      steelDark: v('--belt-steel-dark'),
      shadow: v('--belt-shadow'),
      counterTop: v('--counter-top'),
      counterEdge: v('--counter-edge'),
      counter: v('--counter'),
      grain: v('--counter-grain'),
    };
  }

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function newPlate(x) {
    if (Math.random() < RARE_CHANCE) {
      return { x, rare: pick(RARE_KINDS), plate: RARE_PLATE, grabbedAt: 0 };
    }
    return { x, kind: pick(SUSHI_KINDS), plate: pick(PLATE_COLORS), grabbedAt: 0 };
  }

  function riderSprite(p, now) {
    if (!p.rare) return SUSHI[p.kind];
    const frames = RARE[p.rare];
    return frames[Math.floor(now / 450) % frames.length];
  }

  function layout() {
    const cssWidth = canvas.parentElement.clientWidth;
    scale = mini ? 2 : cssWidth < 600 ? 3 : 4;
    W = Math.ceil(cssWidth / scale);
    canvas.width = W;
    canvas.height = H - TOP;
    canvas.style.width = `${W * scale}px`;
    canvas.style.height = `${(H - TOP) * scale}px`;
    // Line the hit area up with the drawn button (the footer pads the canvas
    // down), growing it to a comfortable size on the small strip.
    const pad = Math.max(0, Math.ceil((28 - BOX.length * scale) / 2));
    Object.assign(toggle.style, {
      left: `${canvas.offsetLeft + BOX_X * scale - pad}px`,
      top: `${canvas.offsetTop + (BOX_Y - TOP) * scale - pad}px`,
      width: `${BOX[0].length * scale + 2 * pad}px`,
      height: `${BOX.length * scale + 2 * pad}px`,
    });

    const loop = Math.ceil(W / SPACING) * SPACING + SPACING;
    plates = [];
    for (let x = -SPACING; x < loop - SPACING; x += SPACING) plates.push(newPlate(x));

    props = [];
    // Keep the counter props clear of the play/pause button.
    let x = BOX_X + BOX[0].length + 4 + Math.floor(Math.random() * 30);
    while (x < W - 14) {
      props.push({ x, kind: pick(PROP_KINDS) });
      x += 60 + Math.floor(Math.random() * 90);
    }
  }

  function sprite(rows, x, y, palette, alpha = 1) {
    ctx.globalAlpha = alpha;
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      for (let c = 0; c < row.length; c++) {
        const ch = row[c];
        if (ch === '.') continue;
        ctx.fillStyle = palette[ch] || COLORS[ch];
        ctx.fillRect(Math.round(x) + c, y + r, 1, 1);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawBelt() {
    const shift = Math.floor(offset) % 6;

    ctx.fillStyle = theme.slat;
    ctx.fillRect(0, BELT_Y, W, 4);
    ctx.fillStyle = theme.slatSeam;
    for (let x = shift - 6; x < W; x += 6) ctx.fillRect(x, BELT_Y, 1, 4);

    ctx.fillStyle = theme.steel;
    ctx.fillRect(0, BELT_Y + 4, W, 3);
    ctx.fillStyle = theme.steelDark;
    ctx.fillRect(0, BELT_Y + 4, W, 1);
    for (let x = shift - 6; x < W; x += 6) ctx.fillRect(x, BELT_Y + 5, 2, 1);

    ctx.fillStyle = theme.shadow;
    ctx.fillRect(0, BELT_Y + 7, W, 1);
  }

  function drawCounter() {
    ctx.fillStyle = theme.counterTop;
    ctx.fillRect(0, COUNTER_Y, W, 4);
    ctx.fillStyle = theme.counterEdge;
    ctx.fillRect(0, COUNTER_Y + 4, W, 1);
    ctx.fillStyle = theme.counter;
    ctx.fillRect(0, COUNTER_Y + 5, W, H - COUNTER_Y - 5);
    ctx.fillStyle = theme.grain;
    for (let x = 7; x < W; x += 23) {
      ctx.fillRect(x, COUNTER_Y + 7, 9, 1);
      ctx.fillRect(x + 11, COUNTER_Y + 9, 6, 1);
    }
  }

  function drawPlates(now) {
    for (const p of plates) {
      const x = p.x + (offset % SPACING);
      if (x < -20 || x > W + 2) continue;
      let lift = 0;
      let alpha = 1;
      if (p.grabbedAt) {
        const t = (now - p.grabbedAt) / 600;
        if (t >= 1) continue;
        lift = Math.round(t * 14);
        alpha = 1 - t;
      }
      const palette = { A: p.plate[0], a: p.plate[1] };
      sprite(PLATE, x, PLATE_Y - lift, palette, alpha);
      const rider = riderSprite(p, now);
      const rx = x + Math.floor((PLATE[0].length - rider[0].length) / 2);
      sprite(rider, rx, PLATE_Y - rider.length + 1 - lift, palette, alpha);
    }
  }

  function drawHearts(now) {
    hearts = hearts.filter((h) => now - h.t0 < 1200);
    for (const h of hearts) {
      const t = (now - h.t0) / 1200;
      sprite(HEART, h.x, h.y - Math.round(t * 12), {}, 1 - t);
    }
  }

  function drawProps() {
    for (const p of props) {
      const rows = PROPS[p.kind];
      sprite(rows, p.x, COUNTER_Y + 3 - rows.length + 1, {});
    }
  }

  function drawSwitch() {
    // Pressed, the shading flips so the button looks pushed into the wood.
    const shade = theme.grain;
    const lit = theme.counterEdge;
    sprite(BOX, BOX_X, BOX_Y, {
      d: boxDown ? lit : shade,
      l: boxDown ? shade : lit,
      f: boxHover ? theme.counterEdge : theme.counterTop,
    });
    const icon = paused ? ICONS.play : ICONS.pause;
    sprite(icon, BOX_X + 2, BOX_Y + 1, { i: paused ? COLORS.F : COLORS.T });
  }

  function draw(now) {
    ctx.setTransform(1, 0, 0, 1, 0, -TOP);
    ctx.clearRect(0, 0, W, H);
    drawBelt();
    drawPlates(now);
    drawCounter();
    drawProps();
    drawSwitch();
    drawHearts(now);
  }

  // Plates live at fixed slots; `offset % SPACING` slides every slot along
  // together, and when the belt has moved one full slot the last plate is
  // recycled to the front as a fresh one.
  function advance(dt) {
    const before = Math.floor(offset / SPACING);
    offset += SPEED * dt;
    const after = Math.floor(offset / SPACING);
    for (let i = before; i < after; i++) {
      plates.pop();
      plates.unshift(newPlate(-SPACING));
      plates.forEach((p, idx) => { p.x = (idx - 1) * SPACING; });
    }
  }

  function frame(t) {
    if (!running) return;
    const dt = lastT ? Math.min((t - lastT) / 1000, 0.1) : 0;
    lastT = t;
    advance(dt);
    draw(t);
    requestAnimationFrame(frame);
  }

  function updateRunning() {
    const shouldRun = visible && !document.hidden && !paused;
    if (shouldRun && !running) {
      running = true;
      lastT = 0;
      requestAnimationFrame(frame);
    } else if (!shouldRun) {
      running = false;
      draw(performance.now());
    }
  }

  canvas.addEventListener('pointerdown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const lx = (e.clientX - rect.left) / scale;
    const ly = (e.clientY - rect.top) / scale + TOP;
    if (ly > BELT_Y + 2) return;
    const now = performance.now();
    for (const p of plates) {
      const x = p.x + (offset % SPACING);
      if (!p.grabbedAt && lx >= x && lx <= x + 18) {
        p.grabbedAt = now;
        if (p.rare) hearts.push({ x: Math.round(x) + 6, y: Math.max(PLATE_Y - 16, TOP + 12), t0: now });
        if (!running) {
          const tick = (t) => {
            draw(t);
            if (t - now < 1250) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
        break;
      }
    }
  });

  new ResizeObserver(() => { layout(); draw(performance.now()); }).observe(canvas.parentElement);
  new MutationObserver(() => { readTheme(); draw(performance.now()); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; updateRunning(); })
    .observe(canvas);
  document.addEventListener('visibilitychange', updateRunning);
  reducedMotion.addEventListener('change', () => {
    let saved = null;
    try { saved = localStorage.getItem(PAUSE_KEY); } catch {}
    if (saved === null) { paused = reducedMotion.matches; syncToggle(); }
    updateRunning();
  });

  // The header takes on the hero's wall colour while it sits over the hero,
  // then settles back to the page colour once the belt scrolls under it.
  const header = document.getElementById('header');
  if (header && !mini) {
    let ticking = false;
    const syncHeader = () => {
      ticking = false;
      const overHero = canvas.getBoundingClientRect().top > header.offsetHeight;
      document.body.classList.toggle('header-over-hero', overHero);
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(syncHeader); }
    }, { passive: true });
    syncHeader();
  }

  readTheme();
  layout();
  draw(performance.now());
  updateRunning();
});
