// Illustrations for the listening practice (listening.html), drawn as inline
// SVG in one style — dark rounded outlines over soft flat colours — like the
// line drawings in a JLPT test booklet. Pictures sit on a light "paper"
// panel in both themes, so the colours here are fixed rather than themed.
//
// picture(spec) draws one answer choice, scene(spec) the 問題3 picture with
// an arrow over the person who speaks. The spec types are listed in PICTURES.
(function (global) {
  'use strict';

  const INK = '#2b2320';
  const C = {
    red: '#e8594a', orange: '#f39a3b', yellow: '#f6c945', green: '#62b06f', leaf: '#4f9a5c',
    blue: '#5b8fd6', sky: '#a9cdf2', navy: '#34477a', brown: '#a8744f', choc: '#6b4029',
    cream: '#fbefd9', paper: '#fffdf8', gray: '#c9c3bb', dark: '#5a5560', pink: '#f2a0b0',
    skin: '#f6d5b8', hair: '#3d2b22', white: '#ffffff', wood: '#d9a86c',
  };

  const svg = (inner, vb = '0 0 100 100', cls = '') =>
    `<svg class="lis-art${cls ? ' ' + cls : ''}" viewBox="${vb}" aria-hidden="true">`
    + `<g fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`;
  const f = color => `fill="${color}"`;

  // ─── Icons (each fills a 100×100 box) ─────────────────────────────────────

  const ICONS = {
    apple: `<path ${f(C.red)} d="M50 30C36 18 14 26 16 52c2 24 20 38 34 32 14 6 32-8 34-32 2-26-20-34-34-22z"/>
      <path d="M50 30q0-10 5-17"/><path ${f(C.green)} d="M55 21q11-11 18-3-9 9-18 3z"/>
      <ellipse cx="32" cy="46" rx="5" ry="8" fill="#fff" stroke="none" opacity=".6"/>`,
    banana: `<path ${f(C.yellow)} d="M20 30q8 46 62 40 6-1 5-7-44 3-55-36-6-5-12 3z"/>
      <path d="M24 38q14 26 52 28" stroke-width="2.5"/><path ${f(C.brown)} d="M17 26l7-6 4 6-6 5z"/>`,
    mandarin: `<circle ${f(C.orange)} cx="50" cy="56" r="32"/><path ${f(C.leaf)} d="M50 26q6-12 18-10-4 12-18 10z"/>
      <circle cx="50" cy="26" r="2.5" ${f(C.leaf)}/><g fill="${INK}" stroke="none" opacity=".25"><circle cx="38" cy="50" r="1.6"/><circle cx="60" cy="64" r="1.6"/><circle cx="64" cy="46" r="1.6"/><circle cx="44" cy="70" r="1.6"/></g>`,
    bento: `<rect ${f(C.red)} x="10" y="28" width="80" height="54" rx="9"/><rect ${f(C.white)} x="18" y="36" width="34" height="38" rx="4"/>
      <circle ${f(C.red)} cx="35" cy="55" r="5"/><rect ${f(C.yellow)} x="58" y="36" width="24" height="16" rx="4"/>
      <path ${f(C.green)} d="M58 74q0-16 12-16t12 16z"/>`,
    drink: `<path ${f(C.sky)} d="M40 12h20v10l8 10v52a6 6 0 0 1-6 6H38a6 6 0 0 1-6-6V32l8-10z"/>
      <rect ${f(C.blue)} x="38" y="6" width="24" height="10" rx="3"/><rect ${f(C.white)} x="32" y="46" width="36" height="20"/>
      <path d="M42 56h16" stroke-width="2.5"/>`,
    umbrella: `<path ${f(C.blue)} d="M8 52Q12 14 50 12q38 2 42 40-7-7-14 0-7-7-14 0-7-7-14 0-7-7-14 0-7-7-14 0-7-7-14 0z"/>
      <path d="M50 12V6M50 52v28q0 10-9 10t-9-9"/>`,
    bike: `<circle cx="24" cy="66" r="16"/><circle cx="76" cy="66" r="16"/>
      <path d="M24 66l16-28h28M40 38l12 28 16-28M76 66 64 30h-8M52 66h-4M34 30h12"/><path stroke="${C.red}" stroke-width="5" d="M40 38l12 28 16-28H40z" opacity=".55"/>`,
    train: `<rect ${f(C.green)} x="8" y="24" width="84" height="48" rx="12"/><rect ${f(C.sky)} x="18" y="32" width="18" height="16" rx="3"/>
      <rect ${f(C.sky)} x="42" y="32" width="18" height="16" rx="3"/><rect ${f(C.sky)} x="66" y="32" width="18" height="16" rx="3"/>
      <path stroke="${C.white}" stroke-width="5" d="M12 58h76"/><path d="M8 58h84"/>
      <circle ${f(C.dark)} cx="28" cy="76" r="6"/><circle ${f(C.dark)} cx="72" cy="76" r="6"/><path d="M4 84h92"/>`,
    taxi: `<path ${f(C.yellow)} d="M10 62q0-12 12-14l12-14h32l12 14q12 2 12 14v10H10z"/>
      <path ${f(C.sky)} d="M38 38h11v12H28zM53 38h11l10 12H53z"/><rect ${f(C.white)} x="40" y="24" width="20" height="10" rx="3"/>
      <circle ${f(C.dark)} cx="28" cy="74" r="9"/><circle ${f(C.dark)} cx="72" cy="74" r="9"/>`,
    shopping: `<path ${f(C.pink)} d="M22 36h56l-5 52H27z"/><path d="M36 36v-8a14 14 0 0 1 28 0v8"/>
      <path ${f(C.white)} d="M40 54h20v14H40z"/>`,
    hospital: `<rect ${f(C.white)} x="16" y="20" width="68" height="68" rx="4"/><rect ${f(C.red)} x="42" y="30" width="16" height="36" stroke="none"/>
      <rect ${f(C.red)} x="32" y="40" width="36" height="16" stroke="none"/><rect ${f(C.sky)} x="42" y="72" width="16" height="16"/>`,
    film: `<rect ${f(C.dark)} x="14" y="38" width="72" height="48" rx="5"/><path ${f(C.dark)} d="M14 38l2-16 70-10 2 16z"/>
      <g stroke="${C.white}" stroke-width="5"><path d="M30 20l8 14M50 17l8 14M70 14l8 14"/></g><path d="M14 54h72" stroke="${C.white}" stroke-width="2.5"/>`,
    book: `<path ${f(C.white)} d="M50 26q-18-10-40-6v58q22-4 40 6zM50 26q18-10 40-6v58q-22-4-40 6z"/>
      <path d="M20 34q14-2 24 4M20 46q14-2 24 4M56 38q10-6 24-4M56 50q10-6 24-4" stroke-width="2.5"/>`,
    copier: `<rect ${f(C.gray)} x="12" y="36" width="76" height="46" rx="6"/><path ${f(C.dark)} d="M20 28h60v8H20z"/>
      <path ${f(C.white)} d="M60 44h30v-6"/><rect ${f(C.white)} x="62" y="40" width="30" height="12"/><circle ${f(C.green)} cx="24" cy="48" r="4"/>
      <path d="M20 66h40"/>`,
    aircon: `<rect ${f(C.white)} x="8" y="22" width="84" height="34" rx="10"/><path d="M14 46h72"/><circle ${f(C.green)} cx="80" cy="32" r="3"/>
      <g stroke="${C.blue}"><path d="M26 64q-4 8 0 16M50 64q-4 8 0 16M74 64q-4 8 0 16"/></g>`,
    tea: `<path ${f(C.green)} d="M24 40h52l-6 40a8 8 0 0 1-8 6H38a8 8 0 0 1-8-6z"/><path d="M28 56h44" stroke="${C.white}" stroke-width="3"/>
      <path ${f(C.white)} d="M18 88h64"/><g stroke="${C.gray}"><path d="M40 32q-5-6 0-12t0-12M58 32q-5-6 0-12t0-12"/></g>`,
    phone: `<rect ${f(C.white)} x="16" y="40" width="68" height="44" rx="8"/><path ${f(C.dark)} d="M18 30q32-16 64 0l-4 12q-28-10-56 0z"/>
      <g fill="${INK}" stroke="none"><circle cx="38" cy="56" r="3"/><circle cx="50" cy="56" r="3"/><circle cx="62" cy="56" r="3"/><circle cx="38" cy="68" r="3"/><circle cx="50" cy="68" r="3"/><circle cx="62" cy="68" r="3"/></g>`,
    flower: `<path ${f(C.leaf)} d="M38 58l12 34 12-34z"/><path d="M50 58v-10M40 58l-6-14M60 58l6-14"/>
      <g ${f(C.pink)}><circle cx="50" cy="34" r="9"/><circle cx="32" cy="38" r="8"/><circle cx="68" cy="38" r="8"/></g>
      <g ${f(C.yellow)}><circle cx="50" cy="34" r="3.5"/><circle cx="32" cy="38" r="3"/><circle cx="68" cy="38" r="3"/></g><path ${f(C.red)} d="M42 70h16l-8 8z"/>`,
    cd: `<circle ${f(C.sky)} cx="46" cy="54" r="34"/><circle ${f(C.white)} cx="46" cy="54" r="10"/><path d="M46 28a26 26 0 0 1 24 16" stroke="${C.white}" stroke-width="4"/>
      <path d="M76 14v26"/><ellipse ${f(INK)} cx="70" cy="40" rx="7" ry="5"/><path d="M76 14q8 2 10 10"/>`,
    milk: `<path ${f(C.white)} d="M28 36l12-20h22l10 20v52H28z"/><path d="M28 36h44M40 16l-4 20"/><path ${f(C.blue)} d="M28 54h44v18H28z"/>`,
    egg: `<path ${f(C.cream)} d="M34 30c-12 0-20 22-20 36a20 20 0 0 0 40 0c0-14-8-36-20-36z"/>
      <path ${f(C.cream)} d="M66 22c-12 0-20 22-20 36a20 20 0 0 0 40 0c0-14-8-36-20-36z"/>`,
    bread: `<path ${f(C.wood)} d="M18 84V46q-8-4-6-14 4-14 38-14t38 14q2 10-6 14v38z"/><path ${f(C.cream)} d="M26 78V48q-6-4-4-10 4-8 28-8t28 8q2 6-4 10v30z" stroke-width="2.5"/>`,
    wallet: `<rect ${f(C.brown)} x="12" y="30" width="76" height="52" rx="8"/><path ${f(C.choc)} d="M60 46h28v20H60a10 10 0 0 1 0-20z"/>
      <circle ${f(C.yellow)} cx="64" cy="56" r="4"/>`,
    sleep: `<rect ${f(C.blue)} x="8" y="56" width="84" height="22" rx="4"/><path d="M8 50v38M92 66v22"/><rect ${f(C.white)} x="12" y="48" width="22" height="10" rx="5"/>
      <circle ${f(C.skin)} cx="24" cy="44" r="9"/><path ${f(C.sky)} d="M30 52h56q4 0 4 4H30z"/>
      <g stroke-width="3"><path d="M54 14h10l-10 12h10M70 28h7l-7 8h7"/></g>`,
    rain: `<path ${f(C.gray)} d="M24 62a14 14 0 0 1 2-28 20 20 0 0 1 38-4 15 15 0 0 1 12 32z"/>
      <g stroke="${C.blue}" stroke-width="4"><path d="M32 72l-4 10M50 72l-4 10M68 72l-4 10"/></g>`,
    sun: `<circle ${f(C.orange)} cx="50" cy="50" r="18"/><g stroke="${C.orange}" stroke-width="5">
      <path d="M50 12v12M50 76v12M12 50h12M76 50h12M23 23l8 8M69 69l8 8M77 23l-8 8M31 69l-8 8"/></g>`,
    cloud: `<path ${f(C.white)} d="M24 70a16 16 0 0 1 2-32 22 22 0 0 1 42-4 18 18 0 0 1 10 36z"/>`,
    key: `<circle ${f(C.yellow)} cx="30" cy="50" r="16"/><circle ${f(C.paper)} cx="30" cy="50" r="5"/><path ${f(C.yellow)} d="M44 44h44v12h-8v10h-8V56h-6v8h-8v-8H44z"/>`,
    pen: `<path ${f(C.blue)} d="M70 14l16 16-46 46-20 4 4-20z"/><path d="M24 60l16 16M62 22l16 16"/><path ${f(INK)} d="M20 80l4-10 6 6z"/>`,
    shirt: `<path ${f(C.sky)} d="M36 14l-24 12 8 18 10-4v46h40V40l10 4 8-18-24-12q-6 8-14 8t-14-8z"/>`,
    camera: `<rect ${f(C.dark)} x="10" y="32" width="80" height="50" rx="8"/><path ${f(C.dark)} d="M34 32l6-10h20l6 10"/>
      <circle ${f(C.sky)} cx="50" cy="57" r="15"/><circle cx="50" cy="57" r="7"/><rect ${f(C.white)} x="72" y="38" width="10" height="6" rx="2"/>`,
    rice: `<path ${f(C.white)} d="M20 46q30-22 60 0"/><path ${f(C.red)} d="M14 46h72q-2 32-36 34-34-2-36-34z"/><path d="M38 80h24"/>
      <path d="M58 22l30-14M62 28l30-12" stroke="${C.brown}" stroke-width="4"/>`,
    gift: `<rect ${f(C.red)} x="16" y="40" width="68" height="46" rx="4"/><rect ${f(C.pink)} x="12" y="30" width="76" height="14" rx="3"/>
      <path ${f(C.yellow)} d="M44 30h12v56H44z"/><path ${f(C.yellow)} d="M50 30q-20-20-24-6t24 6zM50 30q20-20 24-6t-24 6z"/>`,
    house: `<path ${f(C.red)} d="M10 48 50 14l40 34z"/><rect ${f(C.cream)} x="20" y="48" width="60" height="40"/><rect ${f(C.brown)} x="42" y="62" width="16" height="26"/>
      <rect ${f(C.sky)} x="26" y="56" width="12" height="12"/><rect ${f(C.sky)} x="62" y="56" width="12" height="12"/>`,
    box: `<path ${f(C.wood)} d="M12 38l38-16 38 16v40L50 94 12 78z"/><path d="M12 38l38 16 38-16M50 54v40"/><path d="M30 30l38 16" stroke-width="2.5"/>`,
    computer: `<rect ${f(C.dark)} x="14" y="18" width="72" height="48" rx="5"/><rect ${f(C.sky)} x="20" y="24" width="60" height="36" stroke="none"/>
      <path ${f(C.gray)} d="M40 66h20l4 12H36z"/><path d="M28 84h44"/>`,
    plate: `<ellipse ${f(C.white)} cx="50" cy="60" rx="38" ry="18"/><ellipse cx="50" cy="58" rx="24" ry="10" stroke-width="2.5"/>
      <path d="M8 30v26M14 30v26M20 30v26M8 46h12M14 56v28" stroke-width="3"/><path ${f(C.gray)} d="M88 30q-8 10 0 26v28" />`,
    ticket: `<path ${f(C.yellow)} d="M10 32h80v12a8 8 0 0 0 0 16v12H10V60a8 8 0 0 0 0-16z"/><path d="M66 34v36" stroke-dasharray="4 5" stroke-width="2.5"/>`,
    person: `<circle ${f(C.blue)} cx="50" cy="30" r="14"/><path ${f(C.blue)} d="M24 88q0-38 26-38t26 38z"/>`,
  };

  // An icon with a red ✕ over it ("the train wasn't running").
  const crossed = name => `${ICONS[name]}<g stroke="${C.red}" stroke-width="7"><path d="M14 14l72 72M86 14 14 86"/></g>`;
  ICONS['train-stopped'] = crossed('train');

  function icon(name) {
    return svg(ICONS[name] || '');
  }

  // ─── People ────────────────────────────────────────────────────────────────

  // One person, front on, in an 80×120 box (a child is drawn smaller).
  //   hair: 'short' | 'long' | 'bob' | 'bald'   top: 'shirt' | 'dress' | 'coat' | 'sweater' | 'suit' | 'apron'
  //   bottom: 'trousers' | 'skirt' (ignored for a dress)   glasses, hat, tie, bowtie, bag: booleans
  //   under: the colour of a dress showing below a coat
  //   colors: top / bottom / hat, from C
  function personBody(p) {
    const top = C[p.topColor] || (p.top === 'suit' ? C.navy : p.top === 'coat' ? C.dark : p.top === 'dress' ? C.white : C.blue);
    const bottom = C[p.bottomColor] || (p.top === 'suit' ? C.navy : C.dark);
    const parts = [];
    // back hair
    if (p.hair === 'long') parts.push(`<path ${f(C.hair)} d="M23 34q0-24 17-24t17 24l3 28q-20 6-40 0z"/>`);
    if (p.hair === 'bob') parts.push(`<path ${f(C.hair)} d="M22 34q0-24 18-24t18 24v14q-18 4-36 0z"/>`);
    // legs
    const longDress = p.top === 'dress' || p.top === 'coat';
    if (!longDress && p.bottom === 'skirt') {
      parts.push(`<path ${f(C.skin)} d="M31 92v20h6V92M43 92v20h6V92"/>`);
      parts.push(`<path ${f(bottom)} d="M24 80h32l4 16H20z"/>`);
    } else if (!longDress) {
      parts.push(`<path ${f(bottom)} d="M26 78h28l1 34H43l-3-24-3 24H25z"/>`);
    } else {
      parts.push(`<path ${f(p.top === 'coat' && !p.under ? bottom : C.skin)} d="M30 94v18h7V94M43 94v18h7V94"/>`);
    }
    parts.push(`<path ${f(C.dark)} d="M24 112h14v4H22zM42 112h14q2 0 2 4H42z"/>`);
    // arms + body
    parts.push(`<path ${f(top)} d="M22 54q-6 14-6 30h7l4-22M58 54q6 14 6 30h-7l-4-22"/>`);
    parts.push(`<circle ${f(C.skin)} cx="19.5" cy="87" r="3.5"/><circle ${f(C.skin)} cx="60.5" cy="87" r="3.5"/>`);
    if (p.top === 'coat' && p.under) parts.push(`<path ${f(C[p.under])} d="M21 90h38l3 12H18z"/>`);
    if (p.top === 'dress') parts.push(`<path ${f(top)} d="M28 50h24l10 46H18z"/>`);
    else if (p.top === 'coat') parts.push(`<path ${f(top)} d="M26 50h28l6 46H20z"/><path d="M40 52v44" stroke-width="2.5"/><circle ${f(INK)} cx="44" cy="66" r="1.8" stroke="none"/><circle ${f(INK)} cx="44" cy="78" r="1.8" stroke="none"/>`);
    else parts.push(`<path ${f(top)} d="M26 50h28l2 32H24z"/>`);
    if (p.top === 'sweater') parts.push(`<path d="M25 76h30" stroke-width="2.5"/><path d="M33 50q7 6 14 0" stroke-width="2.5"/>`);
    if (p.top === 'suit') parts.push(`<path ${f(C.white)} d="M34 50l6 14 6-14z"/><path ${f(C.red)} d="M38.5 54h3l1.5 14-3 4-3-4z" stroke-width="2"/>`);
    else if (p.tie) parts.push(`<path ${f(C.red)} d="M38.5 52h3l1.5 14-3 4-3-4z" stroke-width="2"/>`);
    if (p.top === 'apron') parts.push(`<path ${f(C.white)} d="M30 58h20l2 26H28z"/><path d="M30 58l-2-8M50 58l2-8" stroke-width="2.5"/>`);
    if (p.bowtie) parts.push(`<path ${f(INK)} d="M34 50l6 3 6-3v8l-6-3-6 3z" stroke-width="1.5"/>`);
    if (p.bag) parts.push(`<path d="M28 52l28 26" stroke="${C.brown}" stroke-width="3"/><rect ${f(C.brown)} x="54" y="74" width="14" height="12" rx="3"/>`);
    // neck + head
    parts.push(`<rect ${f(C.skin)} x="35" y="42" width="10" height="9" rx="2" stroke-width="3"/>`);
    parts.push(`<circle ${f(C.skin)} cx="40" cy="30" r="15"/>`);
    // front hair
    if (p.hair === 'short') parts.push(`<path ${f(C.hair)} d="M25 30q-1-17 15-17t15 17q-4-8-15-8-7 0-10 3-3 2-5 5z"/>`);
    else if (p.hair === 'long' || p.hair === 'bob') parts.push(`<path ${f(C.hair)} d="M25 30q0-16 15-16t15 16q-6-9-15-9-4 6-15 9z"/>`);
    else if (p.hair === 'bald') parts.push(`<path d="M27 26q2-6 6-8M53 26q-2-6-6-8" stroke="${C.gray}" stroke-width="4"/>`);
    // face
    parts.push(`<g fill="${INK}" stroke="none"><circle cx="34" cy="31" r="1.8"/><circle cx="46" cy="31" r="1.8"/></g>`);
    parts.push(`<path d="M36 38q4 3 8 0" stroke-width="2.2"/>`);
    parts.push(`<g fill="${C.pink}" stroke="none" opacity=".7"><circle cx="29" cy="36" r="2.5"/><circle cx="51" cy="36" r="2.5"/></g>`);
    if (p.glasses) parts.push(`<g stroke-width="2.2"><circle cx="34" cy="31" r="5"/><circle cx="46" cy="31" r="5"/><path d="M39 31h2M29 30l-4-2M51 30l4-2"/></g>`);
    if (p.hat) parts.push(`<path ${f(C[p.hatColor] || C.red)} d="M27 20q0-16 13-16t13 16z"/><ellipse ${f(C[p.hatColor] || C.red)} cx="40" cy="20" rx="22" ry="4.5"/>`);
    return parts.join('');
  }

  function person(p) {
    const scale = p.child ? 0.78 : 1;
    const inner = scale === 1 ? personBody(p) : `<g transform="translate(${40 - 40 * scale} ${120 - 120 * scale}) scale(${scale})">${personBody(p)}</g>`;
    return svg(inner, '0 0 80 120', 'lis-art-person');
  }

  // ─── Built pictures ────────────────────────────────────────────────────────

  function items(p) {
    const list = [];
    p.items.forEach(([name, n]) => { for (let i = 0; i < n; i++) list.push(name); });
    const size = list.length === 1 ? 'lis-art-xl' : list.length <= 3 ? 'lis-art-lg' : 'lis-art-sm';
    return `<div class="lis-art-items ${size}">${list.map(icon).join('')}</div>`;
  }

  function clock(p) {
    const ticks = [];
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      const r1 = i % 3 ? 36 : 31;
      ticks.push(`<path d="M${(50 + r1 * Math.sin(a)).toFixed(1)} ${(50 - r1 * Math.cos(a)).toFixed(1)}L${(50 + 40 * Math.sin(a)).toFixed(1)} ${(50 - 40 * Math.cos(a)).toFixed(1)}" stroke-width="${i % 3 ? 2.5 : 4}"/>`);
    }
    const ha = ((p.h % 12) + p.m / 60) * Math.PI / 6;
    const ma = p.m * Math.PI / 30;
    return svg(`<circle ${f(C.white)} cx="50" cy="50" r="45" stroke-width="5"/>${ticks.join('')}
      <path d="M50 50L${(50 + 22 * Math.sin(ha)).toFixed(1)} ${(50 - 22 * Math.cos(ha)).toFixed(1)}" stroke-width="6"/>
      <path d="M50 50L${(50 + 33 * Math.sin(ma)).toFixed(1)} ${(50 - 33 * Math.cos(ma)).toFixed(1)}" stroke-width="3.5"/>
      <circle ${f(C.red)} cx="50" cy="50" r="4" stroke-width="2"/>`, '0 0 100 100', 'lis-art-clock');
  }

  // Three weeks of a month that starts on a Saturday, so the 8th and the
  // 15th are Saturdays and the 14th a Friday.
  const DAYS = ['日', '月', '火', '水', '木', '金', '土'];
  const dayColor = i => (i === 0 ? C.red : i === 6 ? C.blue : INK);
  function calendar(p) {
    const cells = DAYS.map((d, i) =>
      `<text x="${13 + i * 20}" y="17" fill="${dayColor(i)}" stroke="none" class="lis-art-text lis-art-bold">${d}</text>`);
    for (let n = 2; n <= 22; n++) {
      const i = (n - 2) % 7;
      const row = Math.floor((n - 2) / 7);
      const x = 13 + i * 20;
      const y = 40 + row * 20;
      if (n === p.mark) cells.push(`<circle cx="${x}" cy="${y - 4.5}" r="9" stroke="${C.red}" stroke-width="2.5"/>`);
      cells.push(`<text x="${x}" y="${y}" fill="${dayColor(i)}" stroke="none" class="lis-art-text">${n}</text>`);
    }
    return svg(`<rect ${f(C.white)} x="2" y="2" width="142" height="80" rx="6" stroke-width="2.5"/>
      <path d="M2 24h142" stroke-width="2"/>${cells.join('')}`, '0 0 146 84', 'lis-art-wide');
  }

  // A week strip with the given days (0 = 日) circled.
  function week(p) {
    const cells = DAYS.map((d, i) => {
      const x = 12 + i * 20;
      const on = p.days.includes(i);
      return (on ? `<circle cx="${x}" cy="24" r="9.5" fill="${C.yellow}" stroke="${INK}" stroke-width="2.5"/>` : '')
        + `<text x="${x}" y="29" fill="${dayColor(i)}" stroke="none" class="lis-art-text lis-art-bold">${d}</text>`;
    });
    return svg(`<rect ${f(C.white)} x="1.5" y="8" width="141" height="32" rx="6" stroke-width="2.5"/>${cells.join('')}`, '0 0 144 48', 'lis-art-wide');
  }

  function weather(p) {
    return `<div class="lis-art-weather">
      <div>${icon(p.am)}<span lang="ja">午前</span></div>
      <span class="lis-art-then" aria-hidden="true">→</span>
      <div>${icon(p.pm)}<span lang="ja">午後</span></div>
    </div>`;
  }

  // A street from above: the bank in the middle of the far side, and the
  // spot being asked about starred.
  const MAP_SPOTS = { left: [6, 6], right: [110, 6], front: [58, 78], corner: [110, 78] };
  function map(p) {
    const blocks = [[6, 6], [58, 6], [110, 6], [6, 78], [58, 78], [110, 78]].map(([x, y]) => {
      const bank = x === 58 && y === 6;
      const mark = MAP_SPOTS[p.at][0] === x && MAP_SPOTS[p.at][1] === y;
      return `<rect x="${x}" y="${y}" width="44" height="34" rx="4" fill="${mark ? C.yellow : bank ? C.sky : C.white}" stroke-width="2.5"/>`
        + (bank ? `<text x="${x + 22}" y="${y + 22}" class="lis-art-text lis-art-bold" fill="${INK}" stroke="none">銀行</text>` : '')
        + (mark ? `<text x="${x + 22}" y="${y + 27}" class="lis-art-star" fill="${C.red}" stroke="none">★</text>` : '');
    });
    return svg(`<rect x="0" y="45" width="160" height="28" fill="${C.gray}" stroke="none"/>
      <path d="M4 59h152" stroke="${C.white}" stroke-width="3" stroke-dasharray="8 7"/>${blocks.join('')}`, '0 0 160 118', 'lis-art-wide');
  }

  // A six-floor building with one floor marked.
  function floor(p) {
    const rows = [];
    for (let n = 1; n <= 6; n++) {
      const y = 112 - n * 16;
      const on = n === p.floor;
      rows.push(`<rect x="22" y="${y}" width="56" height="16" fill="${on ? C.yellow : C.white}" stroke-width="2.5"/>`
        + `<text x="36" y="${y + 12}" class="lis-art-text lis-art-bold" fill="${INK}" stroke="none">${n}F</text>`
        + (on ? `<text x="62" y="${y + 13}" class="lis-art-star" fill="${C.red}" stroke="none">★</text>` : `<rect x="54" y="${y + 4}" width="16" height="8" fill="${C.sky}" stroke-width="2"/>`));
    }
    return svg(`<path ${f(C.gray)} d="M18 16h64v-6H18z"/>${rows.join('')}<path d="M10 112h80"/>`, '0 0 100 118');
  }

  // A room seen from the front: window in the middle, a bookshelf on the
  // right, the door on the left; the starred spot is where something goes.
  const ROOM_SPOTS = { window: 72, 'shelf-left': 112, 'shelf-right': 168, door: 40 };
  function room(p) {
    const x = ROOM_SPOTS[p.at];
    return svg(`<rect ${f(C.cream)} x="2" y="2" width="196" height="116" rx="4" stroke-width="2.5"/>
      <path d="M2 96h196" stroke-width="2.5"/>
      <rect ${f(C.brown)} x="12" y="30" width="30" height="66"/><circle ${f(C.yellow)} cx="36" cy="64" r="2.5" stroke-width="2"/>
      <rect ${f(C.sky)} x="62" y="20" width="56" height="44"/><path d="M90 20v44M62 42h56" stroke-width="2.5"/>
      <rect ${f(C.wood)} x="128" y="36" width="28" height="60"/><path d="M128 56h28M128 76h28" stroke-width="2.5"/>
      <g stroke="none"><rect x="132" y="42" width="5" height="13" fill="${C.red}"/><rect x="139" y="44" width="5" height="11" fill="${C.blue}"/><rect x="146" y="41" width="5" height="14" fill="${C.green}"/>
      <rect x="132" y="62" width="5" height="13" fill="${C.yellow}"/><rect x="140" y="63" width="5" height="12" fill="${C.pink}"/></g>
      <circle cx="${x + (p.at === 'window' ? 18 : 0)}" cy="96" r="13" fill="${C.yellow}" stroke="${C.red}" stroke-width="3"/>
      <text x="${x + (p.at === 'window' ? 18 : 0)}" y="102" class="lis-art-star" fill="${C.red}" stroke="none">★</text>`, '0 0 200 120', 'lis-art-wide');
  }

  // A desk, a chair, a bag and a shelf, with the key in one of them.
  const KEY_SPOTS = { desk: [100, 38], chair: [147, 96], bag: [31, 98], shelf: [42, 18] };
  function keyScene(p) {
    const [kx, ky] = KEY_SPOTS[p.at];
    return svg(`<path d="M2 110h196" stroke-width="2.5"/>
      <rect ${f(C.wood)} x="36" y="50" width="88" height="10"/><path d="M44 60v50M116 60v50" stroke-width="5"/>
      <path ${f(C.brown)} d="M132 66h30v8h-30zM136 74v36M158 74v36M158 66V36h6v38" />
      <path ${f(C.pink)} d="M14 86h34l-3 24H17z"/><path d="M22 86q9-12 18 0"/>
      <path ${f(C.wood)} d="M16 26h52v-6H16z"/><path d="M22 26l6 8M62 26l-6 8" stroke-width="2.5"/>
      <g transform="translate(${kx - 17} ${ky - 13}) scale(.36)">${ICONS.key}</g>
      <circle cx="${kx}" cy="${ky}" r="20" stroke="${C.red}" stroke-width="3" stroke-dasharray="5 5"/>`, '0 0 200 116', 'lis-art-wide');
  }

  function people(p) {
    return `<div class="lis-art-items ${p.n > 4 ? 'lis-art-xs' : 'lis-art-sm'}">${Array.from({ length: p.n }, () => icon('person')).join('')}</div>`;
  }

  function bus(p) {
    return svg(`<rect ${f(C.green)} x="8" y="18" width="84" height="58" rx="10"/><rect ${f(C.white)} x="20" y="24" width="60" height="18" rx="3"/>
      <text x="50" y="39" class="lis-art-num" fill="${INK}" stroke="none">${p.num}</text>
      <rect ${f(C.sky)} x="16" y="48" width="68" height="16" rx="3"/><path d="M50 48v16" stroke-width="2.5"/>
      <circle ${f(C.yellow)} cx="20" cy="70" r="3" stroke-width="2"/><circle ${f(C.yellow)} cx="80" cy="70" r="3" stroke-width="2"/>
      <rect ${f(C.dark)} x="16" y="76" width="12" height="10" rx="2"/><rect ${f(C.dark)} x="72" y="76" width="12" height="10" rx="2"/>`);
  }

  function cake(p) {
    const body = p.flavor === 'chocolate' ? C.choc : C.white;
    const cream = p.flavor === 'chocolate' ? '#8a5639' : C.pink;
    const berries = p.flavor === 'strawberry'
      ? `<g ${f(C.red)}><path d="M36 30q-6-8 0-12t6 6q0 4-6 6z"/><path d="M52 26q-6-8 0-12t6 6q0 4-6 6z"/><path d="M68 30q-6-8 0-12t6 6q0 4-6 6z"/></g>`
      : `<g ${f(C.choc)}><rect x="34" y="20" width="10" height="8" rx="2"/><rect x="58" y="20" width="10" height="8" rx="2"/></g>`;
    const shape = p.shape === 'round'
      ? `<path ${f(body)} d="M14 40v34q36 18 72 0V40"/><ellipse ${f(cream)} cx="50" cy="40" rx="36" ry="12"/><path d="M14 58q36 14 72 0" stroke="${cream}" stroke-width="6"/>`
      : `<path ${f(body)} d="M12 44l38 14 38-14v30L50 90 12 74z"/><path ${f(cream)} d="M12 44l38-14 38 14-38 14z"/><path d="M50 58v32"/><path d="M14 60l36 13 36-13" stroke="${cream}" stroke-width="5"/>`;
    return svg(`<ellipse ${f(C.white)} cx="50" cy="88" rx="44" ry="8" stroke-width="2.5"/>${shape}${berries}`);
  }

  function text(p) {
    return `<div class="lis-art-label${String(p.text).length > 8 ? ' lis-art-small' : ''}" lang="ja">${String(p.text).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))}</div>`;
  }

  function price(p) {
    return `<div class="lis-art-label lis-art-price" lang="ja">${p.yen}<small>円</small></div>`;
  }

  const PICTURES = {
    items, clock, calendar, week, weather, map, floor, room, key: keyScene, people, bus, cake, text, price,
    person: p => person(p),
  };

  function picture(p) {
    const draw = PICTURES[p.type];
    return draw ? draw(p) : '';
  }

  // 問題3: two people and a prop between them, with an arrow and a "?"
  // bubble over whoever speaks.
  const ROLES = {
    boy: { hair: 'short', top: 'shirt', topColor: 'blue', bottom: 'trousers', child: true },
    girl: { hair: 'bob', top: 'dress', topColor: 'pink', child: true },
    student: { hair: 'short', top: 'shirt', topColor: 'white', tie: true, bottom: 'trousers', bottomColor: 'navy', bag: true },
    teacher: { hair: 'short', top: 'suit', glasses: true },
    woman: { hair: 'long', top: 'sweater', topColor: 'orange', bottom: 'skirt', bottomColor: 'navy' },
    man: { hair: 'short', top: 'sweater', topColor: 'green', bottom: 'trousers' },
    waiter: { hair: 'short', top: 'shirt', topColor: 'white', bowtie: true, bottom: 'trousers' },
    clerk: { hair: 'bob', top: 'apron', topColor: 'sky', bottom: 'trousers' },
    office: { hair: 'short', top: 'suit' },
    officeWoman: { hair: 'bob', top: 'suit', topColor: 'dark', bottom: 'skirt', bottomColor: 'dark' },
    tourist: { hair: 'short', top: 'shirt', topColor: 'yellow', bottom: 'trousers', hat: true, hatColor: 'green', bag: true },
    grandma: { hair: 'bob', top: 'sweater', topColor: 'pink', bottom: 'skirt', glasses: true },
  };

  function scene(s) {
    const who = (role, speaks) => `<div class="lis-art-actor">
        ${speaks ? '<span class="lis-art-bubble">？</span><span class="lis-art-arrow" aria-hidden="true">▼</span>' : '<span class="lis-art-gap"></span>'}
        ${person(ROLES[role] || ROLES.man)}</div>`;
    return `<div class="lis-art-scene" aria-hidden="true">
      ${who(s.left, s.arrow === 'left')}
      <div class="lis-art-prop">${icon(s.prop)}</div>
      ${who(s.right, s.arrow === 'right')}
    </div>`;
  }

  const api = { picture, scene, icon, person, PICTURES, ICONS, ROLES, MAP_SPOTS, ROOM_SPOTS, KEY_SPOTS };
  global.ListeningArt = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
