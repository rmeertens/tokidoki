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
    footer.setAttribute('aria-hidden', 'true');
    canvas = document.createElement('canvas');
    canvas.id = 'sushi-belt';
    canvas.title = 'Click a plate to grab it';
    footer.appendChild(canvas);
    document.body.appendChild(footer);
    document.body.classList.add('has-belt-footer');
  }
  const ctx = canvas.getContext('2d');

  const H = 48;
  // The mini strip drops the empty rows above the tallest sushi.
  const TOP = mini ? 18 : 0;
  const PLATE_Y = 25;
  const BELT_Y = 29;
  const COUNTER_Y = 37;
  const SPACING = 34;
  const SPEED = 12;

  const COLORS = {
    W: '#fbf7ee', w: '#e2d9c6',
    S: '#f58a5b', s: '#ffd4bb',
    T: '#d23a3a', t: '#9f2430',
    Y: '#f6c945', y: '#d9a52b',
    N: '#1f3326', n: '#3d5a45',
    O: '#ff7a1a', o: '#ffc27d',
    E: '#ff8a4c', e: '#fff0e2',
    C: '#6fbf5a', I: '#c98a3c', i: '#a0661f',
    K: '#6f9d5c', k: '#4b7240',
    R: '#d23a3a', D: '#3a2418',
    G: '#f7a8b8', g: '#e27f98',
    B: '#c49a6c', P: '#f7f7f4', p: '#cfd0cc',
  };

  const SUSHI = {
    salmon: [
      '...SSSSSSS..',
      '.SSsSSSsSSS.',
      'SSSSsSSSsSSS',
      'WSSSSSSSSSSW',
      'WWWWWWWWWWWW',
      'WWWWWWWWWWWW',
      '.wwwwwwwwww.',
    ],
    tuna: [
      '...TTTTTTT..',
      '.TTtTTTtTTT.',
      'TTTTtTTTtTTT',
      'WTTTTTTTTTTW',
      'WWWWWWWWWWWW',
      'WWWWWWWWWWWW',
      '.wwwwwwwwww.',
    ],
    tamago: [
      'YYYYYYYYYYYY',
      'YYYYYNNYYYYY',
      'yyyyyNNyyyyy',
      'WWWWWNNWWWWW',
      'WWWWWNNWWWWW',
      '.wwwwNNwwww.',
    ],
    maki: [
      '.NNNN..NNNN.',
      'NWWWWNNWWWWN',
      'NWCCWNNWTTWN',
      'NWCCWNNWTTWN',
      'NWWWWNNWWWWN',
      '.NNNN..NNNN.',
    ],
    ikura: [
      '..oO.Oo.oO..',
      '.OOOOoOOOOo.',
      'NNNNNNNNNNNN',
      'NnNNNNNNNNnN',
      'NNNNNNNNNNNN',
      'NNNNNNNNNNNN',
      '.NNNNNNNNNN.',
    ],
    ebi: [
      '..........EE',
      'EEeEEeEEeEEE',
      'eEEeEEeEEeE.',
      'WWWWWWWWWWW.',
      'WWWWWWWWWWW.',
      '.wwwwwwwww..',
    ],
    inari: [
      '..IIIIIIII..',
      '.IIiIIIIiII.',
      'IIIIIIIIIIII',
      'IiIIIIIIIIiI',
      'IIIIIIIIIIII',
      '.iiiiiiiiii.',
    ],
  };
  const SUSHI_KINDS = Object.keys(SUSHI);

  const PLATE = [
    '.PPPPPPPPPPPPPPPP.',
    'AAAAAAAAAAAAAAAAAA',
    '.aaaaaaaaaaaaaaaa.',
    '....aaaaaaaaaa....',
  ];
  const PLATE_COLORS = [
    ['#4f86d9', '#335d9f'],
    ['#e04b3c', '#a3302a'],
    ['#f2c230', '#b88c14'],
    ['#5bb56a', '#3b8448'],
    ['#f29bb8', '#c46e8d'],
    ['#3a3a46', '#22222b'],
  ];

  const PROPS = {
    tea: [
      'kKKKKk',
      'KKKKKK',
      'KKPKKK',
      'KKKKKK',
      'kKKKKk',
      '.kkkk.',
    ],
    soy: [
      '.RR.',
      '.RR.',
      'DDDD',
      'DDDD',
      'DDDD',
      'DDDD',
      'DDDD',
    ],
    gari: [
      '..GgG...',
      '.GGgGGG.',
      'PPPPPPPP',
      '.pppppp.',
    ],
    chopsticks: [
      'BBBBBBBBBBBB',
      '.BBBBBBBBBBBB',
    ],
  };
  const PROP_KINDS = Object.keys(PROPS);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let W = 0;
  let scale = 4;
  let plates = [];
  let props = [];
  let theme = {};
  let offset = 0;
  let lastT = 0;
  let running = false;
  let visible = true;

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
    return { x, kind: pick(SUSHI_KINDS), plate: pick(PLATE_COLORS), grabbedAt: 0 };
  }

  function layout() {
    const cssWidth = canvas.parentElement.clientWidth;
    scale = mini ? 2 : cssWidth < 600 ? 3 : 4;
    W = Math.ceil(cssWidth / scale);
    canvas.width = W;
    canvas.height = H - TOP;
    canvas.style.width = `${W * scale}px`;
    canvas.style.height = `${(H - TOP) * scale}px`;

    const loop = Math.ceil(W / SPACING) * SPACING + SPACING;
    plates = [];
    for (let x = -SPACING; x < loop - SPACING; x += SPACING) plates.push(newPlate(x));

    props = [];
    let x = 10 + Math.floor(Math.random() * 30);
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
      const food = SUSHI[p.kind];
      sprite(food, x + 3, PLATE_Y - food.length + 1 - lift, palette, alpha);
    }
  }

  function drawProps() {
    for (const p of props) {
      const rows = PROPS[p.kind];
      sprite(rows, p.x, COUNTER_Y + 3 - rows.length + 1, {});
    }
  }

  function draw(now) {
    ctx.setTransform(1, 0, 0, 1, 0, -TOP);
    ctx.clearRect(0, 0, W, H);
    drawBelt();
    drawPlates(now);
    drawCounter();
    drawProps();
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
    const shouldRun = visible && !document.hidden && !reducedMotion.matches;
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
        if (!running) {
          const tick = (t) => {
            draw(t);
            if (t - now < 650) requestAnimationFrame(tick);
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
  reducedMotion.addEventListener('change', updateRunning);

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
