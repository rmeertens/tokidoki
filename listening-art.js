// Illustrations for the listening practice (listening.html), drawn as inline
// SVG in one style — dark rounded outlines over soft flat colours — like the
// line drawings in a JLPT test booklet. Pictures sit on a light "paper"
// panel in both themes, so the colours here are fixed rather than themed.
//
//   picture(spec)  one answer choice; spec.type is a key of PICTURES
//   scene(spec)    the 問題3 picture: a setting, two people and a prop, with
//                  an arrow and a "?" over whoever speaks
//   icon(name)     one object from ICONS (or { name, color, pattern })
//   person(spec)   one person (see personBody for the options)
(function (global) {
  'use strict';

  const INK = '#2b2320';
  const C = {
    red: '#e8594a', orange: '#f39a3b', yellow: '#f6c945', green: '#62b06f', leaf: '#4f9a5c', mint: '#a8dcc0',
    blue: '#5b8fd6', sky: '#a9cdf2', navy: '#34477a', purple: '#9b7cc9', brown: '#a8744f', choc: '#6b4029',
    cream: '#fbefd9', paper: '#fffdf8', gray: '#c9c3bb', silver: '#e4e0da', dark: '#4a4550', pink: '#f2a0b0',
    rose: '#d9567a', skin: '#f6d5b8', hair: '#3d2b22', white: '#ffffff', wood: '#d9a86c', black: '#2f2b33',
    wall: '#f7ecd8', floor: '#e2c49a', grass: '#bfe3a4', board: '#3f6e57', beige: '#ecd9b8',
  };
  const col = c => C[c] || c;

  const svg = (inner, vb = '0 0 100 100', cls = '') =>
    `<svg class="lis-art${cls ? ' ' + cls : ''}" viewBox="${vb}" aria-hidden="true">`
    + `<g fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`;
  const f = color => `fill="${col(color)}"`;
  // A limb or strap drawn as an outlined tube.
  const tube = (d, color, w = 8) => `<path d="${d}" stroke="${INK}" stroke-width="${w + 4}"/><path d="${d}" stroke="${col(color)}" stroke-width="${w}"/>`;

  // ─── Objects (each fills a 100×100 box) ────────────────────────────────────

  const flowerHead = (x, y, color) => `<g ${f(color)}><circle cx="${x}" cy="${y - 6}" r="6"/><circle cx="${x + 6}" cy="${y}" r="6"/><circle cx="${x}" cy="${y + 6}" r="6"/><circle cx="${x - 6}" cy="${y}" r="6"/></g><circle ${f('yellow')} cx="${x}" cy="${y}" r="4"/>`;

  const ICONS = {
    // food and drink
    apple: `<path ${f('red')} d="M50 30C36 18 14 26 16 52c2 24 20 38 34 32 14 6 32-8 34-32 2-26-20-34-34-22z"/>
      <path d="M50 30q0-10 5-17"/><path ${f('green')} d="M55 21q11-11 18-3-9 9-18 3z"/>
      <ellipse cx="32" cy="46" rx="5" ry="8" fill="#fff" stroke="none" opacity=".6"/>`,
    banana: `<path ${f('yellow')} d="M20 30q8 46 62 40 6-1 5-7-44 3-55-36-6-5-12 3z"/>
      <path d="M24 38q14 26 52 28" stroke-width="2.5"/><path ${f('brown')} d="M17 26l7-6 4 6-6 5z"/>`,
    mandarin: `<circle ${f('orange')} cx="50" cy="56" r="32"/><path ${f('leaf')} d="M50 26q6-12 18-10-4 12-18 10z"/>
      <circle cx="50" cy="26" r="2.5" ${f('leaf')}/><g fill="${INK}" stroke="none" opacity=".25"><circle cx="38" cy="50" r="1.6"/><circle cx="60" cy="64" r="1.6"/><circle cx="64" cy="46" r="1.6"/><circle cx="44" cy="70" r="1.6"/></g>`,
    strawberry: `<path ${f('red')} d="M50 88C30 78 18 58 22 42q4-10 28-10t28 10c4 16-8 36-28 46z"/><path ${f('green')} d="M30 34l8-12 6 8 6-10 6 10 6-8 8 12q-20 8-40 0z"/>
      <g fill="#fff" stroke="none" opacity=".8"><circle cx="40" cy="50" r="2"/><circle cx="56" cy="48" r="2"/><circle cx="48" cy="62" r="2"/><circle cx="62" cy="62" r="2"/><circle cx="38" cy="66" r="2"/></g>`,
    bento: `<rect ${f('red')} x="10" y="28" width="80" height="54" rx="9"/><rect ${f('white')} x="18" y="36" width="34" height="38" rx="4"/>
      <circle ${f('red')} cx="35" cy="55" r="5"/><rect ${f('yellow')} x="58" y="36" width="24" height="16" rx="4"/>
      <path ${f('green')} d="M58 74q0-16 12-16t12 16z"/>`,
    onigiri: `<path ${f('white')} d="M50 14C36 14 12 62 14 76q2 12 36 12t36-12C88 62 64 14 50 14z"/><path ${f('black')} d="M34 60h32v28H34z"/>`,
    bread: `<path ${f('wood')} d="M18 84V46q-8-4-6-14 4-14 38-14t38 14q2 10-6 14v38z"/><path ${f('cream')} d="M26 78V48q-6-4-4-10 4-8 28-8t28 8q2 6-4 10v30z" stroke-width="2.5"/>`,
    egg: `<path ${f('cream')} d="M34 30c-12 0-20 22-20 36a20 20 0 0 0 40 0c0-14-8-36-20-36z"/>
      <path ${f('cream')} d="M66 22c-12 0-20 22-20 36a20 20 0 0 0 40 0c0-14-8-36-20-36z"/>`,
    milk: `<path ${f('white')} d="M28 36l12-20h22l10 20v52H28z"/><path d="M28 36h44M40 16l-4 20"/><path ${f('blue')} d="M28 54h44v18H28z"/>`,
    drink: `<path ${f('sky')} d="M40 12h20v10l8 10v52a6 6 0 0 1-6 6H38a6 6 0 0 1-6-6V32l8-10z"/>
      <rect ${f('blue')} x="38" y="6" width="24" height="10" rx="3"/><rect ${f('white')} x="32" y="46" width="36" height="20"/>
      <path d="M42 56h16" stroke-width="2.5"/>`,
    juice: `<path ${f('white')} d="M28 24h44l-6 64H34z"/><path ${f('orange')} d="M31 42h38l-4 44H35z" stroke="none"/><path d="M28 24h44l-6 64H34z"/><path d="M56 24l10-16" stroke="${C.red}" stroke-width="5"/>
      <circle ${f('orange')} cx="70" cy="30" r="10"/>`,
    coffee: `<path ${f('white')} d="M18 36h52v28a20 20 0 0 1-20 20H38a20 20 0 0 1-20-20z"/><path d="M70 42h6a10 10 0 0 1 0 20h-6"/><ellipse ${f('choc')} cx="44" cy="38" rx="24" ry="5"/>
      <path ${f('white')} d="M10 88h68"/><g stroke="${C.gray}"><path d="M34 26q-4-5 0-10t0-10M52 26q-4-5 0-10t0-10"/></g>`,
    tea: `<path ${f('green')} d="M24 40h52l-6 40a8 8 0 0 1-8 6H38a8 8 0 0 1-8-6z"/><path d="M28 56h44" stroke="${C.white}" stroke-width="3"/>
      <path ${f('white')} d="M18 88h64"/><g stroke="${C.gray}"><path d="M40 32q-5-6 0-12t0-12M58 32q-5-6 0-12t0-12"/></g>`,
    beer: `<path ${f('yellow')} d="M26 30h40v54a6 6 0 0 1-6 6H32a6 6 0 0 1-6-6z"/><path ${f('white')} d="M24 32q0-14 12-12 6-10 16-4 12-6 16 6 4 10-4 10H24z"/><path d="M66 42h8a8 8 0 0 1 8 8v14a8 8 0 0 1-8 8h-8"/>`,
    curry: `<ellipse ${f('white')} cx="50" cy="62" rx="44" ry="24"/><path ${f('white')} d="M12 62q2-20 30-22 8 10 4 30-20 8-34-8z"/>
      <path fill="#c98a2c" d="M44 40q34-6 46 18-2 16-44 16-6-16-2-34z"/><g stroke-width="2"><rect ${f('orange')} x="58" y="50" width="9" height="8" rx="2"/><rect ${f('yellow')} x="72" y="56" width="9" height="8" rx="2"/><rect ${f('orange')} x="54" y="62" width="8" height="7" rx="2"/></g>
      <path d="M70 22l22-14" stroke="${C.silver}" stroke-width="5"/><path d="M70 22l22-14" stroke-width="1.5"/><ellipse ${f('silver')} cx="66" cy="26" rx="8" ry="5" transform="rotate(-32 66 26)"/>`,
    ramen: `<path ${f('red')} d="M10 46h80q-4 38-40 40-36-2-40-40z"/><ellipse ${f('cream')} cx="50" cy="46" rx="40" ry="10"/>
      <path d="M26 46q6-6 12 0t12 0 12 0 12 0" stroke="${C.yellow}" stroke-width="4"/><circle ${f('white')} cx="66" cy="44" r="6" stroke-width="2.5"/><circle ${f('yellow')} cx="66" cy="44" r="2.5" stroke="none"/>
      <path d="M58 30l30-22M64 34l30-20" stroke="${C.brown}" stroke-width="4"/>`,
    sushi: `<rect ${f('wood')} x="6" y="62" width="88" height="14" rx="4"/><path d="M14 76v10M86 76v10"/>
      <rect ${f('white')} x="14" y="44" width="30" height="18" rx="7"/><path ${f('orange')} d="M12 46q16-14 34 0z"/>
      <rect ${f('white')} x="54" y="44" width="30" height="18" rx="7"/><path ${f('red')} d="M52 46q16-14 34 0z"/>`,
    sandwich: `<path ${f('cream')} d="M14 70l36-46 36 46z"/><path d="M20 62h60" stroke="${C.green}" stroke-width="6"/><path d="M24 56h52" stroke="${C.pink}" stroke-width="5"/><path d="M14 70l36-46 36 46z"/>
      <path ${f('wood')} d="M10 74h80v8H10z"/>`,
    cake: `<path ${f('white')} d="M18 50v30q32 14 64 0V50"/><ellipse ${f('pink')} cx="50" cy="50" rx="32" ry="10"/><path d="M18 64q32 12 64 0" stroke="${C.pink}" stroke-width="5"/>
      <g ${f('red')}><circle cx="38" cy="44" r="5"/><circle cx="54" cy="42" r="5"/><circle cx="66" cy="46" r="4"/></g>`,
    sweets: `<path ${f('yellow')} d="M30 50L8 34v32z"/><path ${f('yellow')} d="M70 50l22-16v32z"/><ellipse ${f('pink')} cx="50" cy="50" rx="24" ry="17"/>
      <path d="M38 36q-6 14 0 28M50 33q-6 17 0 34M62 36q-6 14 0 28" stroke="#fff" stroke-width="3.5"/><ellipse cx="50" cy="50" rx="24" ry="17"/>`,
    rice: `<path ${f('white')} d="M20 46q30-22 60 0"/><path ${f('red')} d="M14 46h72q-2 32-36 34-34-2-36-34z"/><path d="M38 80h24"/>
      <path d="M58 22l30-14M62 28l30-12" stroke="${C.brown}" stroke-width="4"/>`,
    plate: `<ellipse ${f('white')} cx="50" cy="56" rx="30" ry="20"/><ellipse cx="50" cy="55" rx="18" ry="11" stroke-width="2.5"/>
      <path d="M8 26v20q0 6 4 6t4-6V26M12 52v34M8 26v14M12 26v14M16 26v14" stroke-width="2.5"/><path ${f('silver')} d="M86 26q-8 6-6 26h6v34" stroke-width="3"/>`,
    dishes: `<ellipse ${f('white')} cx="50" cy="74" rx="40" ry="12"/><ellipse ${f('white')} cx="50" cy="64" rx="40" ry="12"/><ellipse ${f('white')} cx="50" cy="54" rx="40" ry="12"/>
      <g fill="${C.sky}" stroke="none"><circle cx="70" cy="30" r="7"/><circle cx="82" cy="40" r="5"/><circle cx="60" cy="20" r="4"/></g>`,
    // things
    umbrella: `<path ${f('blue')} d="M8 52Q12 14 50 12q38 2 42 40-7-7-14 0-7-7-14 0-7-7-14 0-7-7-14 0-7-7-14 0-7-7-14 0z"/>
      <path d="M50 12V6M50 52v28q0 10-9 10t-9-9"/>`,
    bag: `<path ${f('pink')} d="M18 40h64l-4 46H22z"/><path d="M34 40v-8a16 16 0 0 1 32 0v8"/><rect ${f('yellow')} x="44" y="52" width="12" height="8" rx="2"/>`,
    shopping: `<path ${f('pink')} d="M22 36h56l-5 52H27z"/><path d="M36 36v-8a14 14 0 0 1 28 0v8"/><path ${f('white')} d="M40 54h20v14H40z"/>`,
    wallet: `<rect ${f('brown')} x="12" y="30" width="76" height="52" rx="8"/><path ${f('choc')} d="M60 46h28v20H60a10 10 0 0 1 0-20z"/>
      <circle ${f('yellow')} cx="64" cy="56" r="4"/>`,
    key: `<circle ${f('yellow')} cx="30" cy="50" r="16"/><circle ${f('paper')} cx="30" cy="50" r="5"/><path ${f('yellow')} d="M44 44h44v12h-8v10h-8V56h-6v8h-8v-8H44z"/>`,
    pen: `<path ${f('blue')} d="M70 14l16 16-46 46-20 4 4-20z"/><path d="M24 60l16 16M62 22l16 16"/><path ${f(INK)} d="M20 80l4-10 6 6z"/>`,
    pencil: `<path ${f('yellow')} d="M70 14l16 16-46 46-20 4 4-20z"/><path ${f('cream')} d="M24 60l16 16-20 4z"/><path ${f(INK)} d="M20 80l2-7 5 5z"/><path ${f('pink')} d="M70 14l16 16 4-4a6 6 0 0 0 0-8l-8-8a6 6 0 0 0-8 0z"/>`,
    notebook: `<rect ${f('sky')} x="20" y="12" width="60" height="78" rx="4"/><path d="M30 12v78" stroke-width="2.5"/><rect ${f('white')} x="40" y="24" width="30" height="12" rx="2" stroke-width="2.5"/>
      <g stroke-width="2.5"><path d="M16 26h8M16 42h8M16 58h8M16 74h8"/></g>`,
    film: `<rect ${f('dark')} x="14" y="38" width="72" height="48" rx="5"/><path ${f('dark')} d="M14 38l2-16 70-10 2 16z"/>
      <g stroke="${C.white}" stroke-width="5"><path d="M30 20l8 14M50 17l8 14M70 14l8 14"/></g><path d="M14 54h72" stroke="${C.white}" stroke-width="2.5"/>`,
    book: `<path ${f('white')} d="M50 26q-18-10-40-6v58q22-4 40 6zM50 26q18-10 40-6v58q-22-4-40 6z"/>
      <path d="M20 34q14-2 24 4M20 46q14-2 24 4M56 38q10-6 24-4M56 50q10-6 24-4" stroke-width="2.5"/>`,
    books: `<rect ${f('red')} x="14" y="24" width="16" height="64" rx="2"/><rect ${f('blue')} x="32" y="16" width="18" height="72" rx="2"/><rect ${f('green')} x="52" y="28" width="14" height="60" rx="2"/>
      <path ${f('yellow')} d="M70 30l12-4 14 58-12 4z"/><path d="M6 88h90"/>`,
    dictionary: `<rect ${f('navy')} x="18" y="14" width="64" height="76" rx="5"/><path d="M24 80h58" stroke="${C.white}" stroke-width="4"/>
      <text x="50" y="56" class="lis-art-glyph" fill="${C.white}" stroke="none">辞書</text>`,
    letter: `<rect ${f('white')} x="10" y="26" width="80" height="54" rx="4"/><path d="M10 28l40 30 40-30"/><rect ${f('red')} x="70" y="32" width="12" height="14" stroke-width="2"/>`,
    postcard: `<rect ${f('white')} x="10" y="22" width="80" height="56" rx="3"/><rect ${f('sky')} x="16" y="28" width="38" height="44" stroke-width="2.5"/><path ${f('green')} d="M16 72l12-18 10 10 8-8 8 16z" stroke-width="2"/>
      <circle ${f('orange')} cx="44" cy="38" r="5" stroke-width="2"/><path d="M62 46h22M62 56h22M62 66h22" stroke-width="2.5"/>`,
    stamp: `<rect ${f('white')} x="14" y="10" width="72" height="80" rx="2" stroke-width="3" stroke-dasharray="5 4"/><rect ${f('sky')} x="22" y="18" width="56" height="64"/>
      <path ${f('green')} d="M22 82l16-24 12 12 10-10 18 22z" stroke-width="2.5"/><circle ${f('red')} cx="60" cy="34" r="7" stroke-width="2.5"/>
      <text x="36" y="40" class="lis-art-glyph" fill="${INK}" stroke="none">84</text>`,
    ticket: `<path ${f('yellow')} d="M10 32h80v12a8 8 0 0 0 0 16v12H10V60a8 8 0 0 0 0-16z"/><path d="M66 34v36" stroke-dasharray="4 5" stroke-width="2.5"/>`,
    camera: `<rect ${f('dark')} x="10" y="32" width="80" height="50" rx="8"/><path ${f('dark')} d="M34 32l6-10h20l6 10"/>
      <circle ${f('sky')} cx="50" cy="57" r="15"/><circle cx="50" cy="57" r="7"/><rect ${f('white')} x="72" y="38" width="10" height="6" rx="2"/>`,
    phone: `<path ${f('red')} d="M18 82l8-30h48l8 30z"/><circle ${f('white')} cx="50" cy="66" r="11"/><g fill="${INK}" stroke="none"><circle cx="50" cy="59" r="2"/><circle cx="56" cy="63" r="2"/><circle cx="56" cy="70" r="2"/><circle cx="50" cy="73" r="2"/><circle cx="44" cy="70" r="2"/><circle cx="44" cy="63" r="2"/></g>
      <path ${f('dark')} d="M12 42q0-16 16-16h44q16 0 16 16v6H74v-8H26v8H12z"/><path d="M82 72q10 2 8 12t8 8" stroke-width="2.5"/>`,
    smartphone: `<rect ${f('dark')} x="28" y="8" width="44" height="84" rx="8"/><rect ${f('sky')} x="33" y="18" width="34" height="58" rx="2" stroke="none"/><circle ${f('gray')} cx="50" cy="84" r="3" stroke-width="2"/>`,
    watch: `<path ${f('brown')} d="M38 8h24v84H38z"/><circle ${f('white')} cx="50" cy="50" r="22" stroke-width="4"/><path d="M50 50V36M50 50l10 6" stroke-width="3"/>`,
    necklace: `<path d="M18 16q32 70 64 0" stroke="${C.yellow}" stroke-width="5"/><path d="M18 16q32 70 64 0" stroke-width="1.5"/><path ${f('rose')} d="M50 64l10 12-10 14-10-14z"/>`,
    glasses: `<circle ${f('sky')} cx="30" cy="54" r="16"/><circle ${f('sky')} cx="70" cy="54" r="16"/><path d="M46 52q4-4 8 0M14 50L6 40M86 50l8-10" />`,
    hat: `<ellipse ${f('wood')} cx="50" cy="66" rx="44" ry="12"/><path ${f('wood')} d="M28 64q0-34 22-34t22 34"/><path d="M28 56q22 8 44 0" stroke="${C.red}" stroke-width="6"/>`,
    tshirt: `<path ${f('sky')} d="M36 14l-24 12 8 18 10-4v46h40V40l10 4 8-18-24-12q-6 8-14 8t-14-8z"/>`,
    shoes: `<path ${f('white')} d="M6 70h88v8a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z"/><path ${f('red')} d="M8 70q0-26 18-30l10 10q16 0 28 8 18 4 28 12z"/>
      <path ${f('white')} d="M8 70q2-14 10-20l4 20z" stroke-width="2.5"/><path d="M34 50l6-6M42 54l6-6M50 58l6-6" stroke="#fff" stroke-width="3"/><path d="M34 50l6-6M42 54l6-6M50 58l6-6" stroke-width="1"/>`,
    towel: `<path d="M10 18h80" stroke="${C.brown}" stroke-width="6"/><path d="M10 18h80" stroke-width="1.5"/><circle ${f('brown')} cx="10" cy="18" r="5" stroke-width="2.5"/><circle ${f('brown')} cx="90" cy="18" r="5" stroke-width="2.5"/>
      <path ${f('sky')} d="M22 16h56v70q0 4-4 4H26q-4 0-4-4z"/><path ${f('blue')} d="M22 16h56v10H22z" stroke-width="2.5"/><path d="M22 70h56M22 78h56" stroke="#fff" stroke-width="4"/><path d="M30 90v6M40 90v6M50 90v6M60 90v6M70 90v6" stroke-width="2"/>`,
    swimsuit: `<path ${f('blue')} d="M30 12h10q4 14 10 14t10-14h10l-2 30q10 10 10 30-18 6-20 18H42q-2-12-20-18 0-20 10-30z"/>`,
    goggles: `<path d="M8 50q42-30 84 0" stroke="${C.blue}" stroke-width="5"/><rect ${f('sky')} x="16" y="42" width="30" height="22" rx="11"/><rect ${f('sky')} x="54" y="42" width="30" height="22" rx="11"/><path d="M46 52h8"/>`,
    doll: `<circle ${f('skin')} cx="50" cy="32" r="16"/><path ${f('hair')} d="M34 30q0-16 16-16t16 16q-6-8-16-8t-16 8z"/><path ${f('red')} d="M30 90l8-42h24l8 42z"/><path ${f('yellow')} d="M38 62h24v6H38z"/>
      <g fill="${INK}" stroke="none"><circle cx="44" cy="34" r="2"/><circle cx="56" cy="34" r="2"/></g>`,
    teddy: `<circle ${f('wood')} cx="28" cy="22" r="10"/><circle ${f('wood')} cx="72" cy="22" r="10"/><circle ${f('wood')} cx="50" cy="38" r="24"/><ellipse ${f('wood')} cx="50" cy="78" rx="26" ry="18"/>
      <ellipse ${f('cream')} cx="50" cy="46" rx="10" ry="7"/><circle ${f(INK)} cx="50" cy="43" r="3" stroke="none"/><g fill="${INK}" stroke="none"><circle cx="40" cy="32" r="2.5"/><circle cx="60" cy="32" r="2.5"/></g>`,
    game: `<path ${f('dark')} d="M22 36h56q16 0 16 22 0 24-14 24-10 0-16-12H36q-6 12-16 12C6 82 6 58 6 58q0-22 16-22z"/>
      <path d="M24 50v14M17 57h14" stroke="${C.white}" stroke-width="4"/><circle ${f('red')} cx="70" cy="52" r="4" stroke="none"/><circle ${f('yellow')} cx="78" cy="60" r="4" stroke="none"/>`,
    soccer: `<circle ${f('white')} cx="50" cy="50" r="38"/><path ${f(INK)} d="M50 34l14 10-6 16H42l-6-16z" stroke-width="2"/><path d="M50 34V14M64 44l18-6M58 60l12 16M42 60L30 76M36 44l-18-6" stroke-width="2.5"/>`,
    baseball: `<circle ${f('white')} cx="50" cy="50" r="38"/><path d="M26 22q14 28 0 56M74 22q-14 28 0 56" stroke="${C.red}" stroke-width="3"/>`,
    tennis: `<ellipse ${f('white')} cx="44" cy="40" rx="26" ry="30"/><path d="M28 30h32M24 42h40M28 54h32M34 18v44M44 12v56M54 18v44" stroke-width="1.5"/><path d="M58 64l26 26" stroke="${C.red}" stroke-width="8"/><circle ${f('yellow')} cx="80" cy="30" r="9"/>`,
    medicine: `<rect ${f('white')} x="28" y="30" width="44" height="58" rx="6"/><rect ${f('red')} x="32" y="14" width="36" height="16" rx="3"/><path d="M50 46v24M38 58h24" stroke="${C.red}" stroke-width="6"/>`,
    thermometer: `<rect ${f('white')} x="40" y="8" width="20" height="62" rx="10"/><circle ${f('red')} cx="50" cy="78" r="14"/><path d="M50 30v44" stroke="${C.red}" stroke-width="7"/><path d="M60 22h6M60 34h6M60 46h6" stroke-width="2.5"/>`,
    broom: `<path d="M66 8L42 58" stroke="${C.brown}" stroke-width="6"/><path ${f('yellow')} d="M34 54l18 8-6 30H14z"/><path d="M26 74l-4 16M36 76l-4 16M44 76l-2 16" stroke-width="2"/>`,
    trash: `<path ${f('gray')} d="M22 30h56l-6 60H28z"/><rect ${f('dark')} x="16" y="20" width="68" height="10" rx="3"/><path d="M42 12h16v8H42z"/><path d="M40 42v38M50 42v38M60 42v38" stroke-width="2.5"/>`,
    gift: `<rect ${f('red')} x="16" y="40" width="68" height="46" rx="4"/><rect ${f('pink')} x="12" y="30" width="76" height="14" rx="3"/>
      <path ${f('yellow')} d="M44 30h12v56H44z"/><path ${f('yellow')} d="M50 30q-20-20-24-6t24 6zM50 30q20-20 24-6t-24 6z"/>`,
    tulip: `<path ${f('red')} d="M30 22l8 10 12-14 12 14 8-10v20q0 22-20 22T30 42z"/><path d="M50 64v28" stroke="${C.leaf}" stroke-width="5"/><path ${f('green')} d="M50 82q-18-2-22-18 16 0 22 18zM50 78q16-4 20-18-16 2-20 18z" stroke-width="2.5"/>`,
    flower: `<path ${f('leaf')} d="M38 58l12 34 12-34z"/><path d="M50 58v-10M40 58l-6-14M60 58l6-14"/>${flowerHead(50, 32, 'pink')}${flowerHead(30, 40, 'pink')}${flowerHead(70, 40, 'pink')}<path ${f('red')} d="M42 70h16l-8 8z"/>`,
    cd: `<circle ${f('sky')} cx="46" cy="54" r="34"/><circle ${f('white')} cx="46" cy="54" r="10"/><path d="M46 28a26 26 0 0 1 24 16" stroke="${C.white}" stroke-width="4"/>
      <path d="M76 14v26"/><ellipse ${f(INK)} cx="70" cy="40" rx="7" ry="5"/><path d="M76 14q8 2 10 10"/>`,
    box: `<path ${f('wood')} d="M12 38l38-16 38 16v40L50 94 12 78z"/><path d="M12 38l38 16 38-16M50 54v40"/><path d="M30 30l38 16" stroke-width="2.5"/>`,
    computer: `<rect ${f('dark')} x="14" y="18" width="72" height="48" rx="5"/><rect ${f('sky')} x="20" y="24" width="60" height="36" stroke="none"/>
      <path ${f('gray')} d="M40 66h20l4 12H36z"/><path d="M28 84h44"/>`,
    copier: `<rect ${f('white')} x="30" y="10" width="40" height="34" rx="2"/><path d="M36 20h28M36 28h28M36 36h18" stroke-width="2.5"/>
      <rect ${f('gray')} x="10" y="38" width="80" height="38" rx="7"/><rect ${f('dark')} x="22" y="46" width="56" height="7" rx="3" stroke-width="2.5"/><circle ${f('green')} cx="78" cy="64" r="4" stroke-width="2.5"/>
      <path ${f('white')} d="M22 76h56l6 14H16z"/>`,
    aircon: `<rect ${f('white')} x="8" y="22" width="84" height="34" rx="10"/><path d="M14 46h72"/><circle ${f('green')} cx="80" cy="32" r="3"/>
      <g stroke="${C.blue}"><path d="M26 64q-4 8 0 16M50 64q-4 8 0 16M74 64q-4 8 0 16"/></g>`,
    tv: `<rect ${f('dark')} x="8" y="18" width="84" height="56" rx="6"/><rect ${f('sky')} x="15" y="25" width="70" height="42" stroke="none"/><path d="M40 74l-6 12M60 74l6 12M28 88h44"/>`,
    fridge: `<rect ${f('white')} x="24" y="6" width="52" height="88" rx="6"/><path d="M24 38h52M32 18v12M32 48v16"/>`,
    washer: `<rect ${f('white')} x="16" y="10" width="68" height="80" rx="6"/><path d="M16 26h68"/><circle ${f('sky')} cx="50" cy="58" r="20"/><circle cx="50" cy="58" r="12" stroke-width="2.5"/><circle ${f('red')} cx="70" cy="18" r="3" stroke-width="2"/>`,
    lamp: `<path ${f('yellow')} d="M30 46l10-30h20l10 30z"/><path d="M50 46v34"/><path ${f('dark')} d="M30 80h40v8H30z"/>`,
    clock: `<circle ${f('white')} cx="50" cy="50" r="38" stroke-width="5"/><path d="M50 50V26M50 50l14 8" stroke-width="5"/>`,
    alarm: `<circle ${f('red')} cx="50" cy="54" r="32"/><circle ${f('white')} cx="50" cy="54" r="24"/><path d="M50 54V38M50 54l10 6" stroke-width="4"/><path ${f('red')} d="M18 26a14 14 0 0 1 20-8zM82 26a14 14 0 0 0-20-8z"/><path d="M30 84l-6 8M70 84l6 8"/>`,
    // places and transport
    bike: `<circle cx="24" cy="66" r="16"/><circle cx="76" cy="66" r="16"/>
      <path d="M24 66l16-28h28M40 38l12 28 16-28M76 66 64 30h-8M52 66h-4M34 30h12"/><path stroke="${C.red}" stroke-width="5" d="M40 38l12 28 16-28H40z" opacity=".55"/>`,
    train: `<rect ${f('green')} x="8" y="24" width="84" height="48" rx="12"/><rect ${f('sky')} x="18" y="32" width="18" height="16" rx="3"/>
      <rect ${f('sky')} x="42" y="32" width="18" height="16" rx="3"/><rect ${f('sky')} x="66" y="32" width="18" height="16" rx="3"/>
      <path stroke="${C.white}" stroke-width="5" d="M12 58h76"/><path d="M8 58h84"/>
      <circle ${f('dark')} cx="28" cy="76" r="6"/><circle ${f('dark')} cx="72" cy="76" r="6"/><path d="M4 84h92"/>`,
    shinkansen: `<path ${f('white')} d="M4 70V40q0-10 10-10h40q30 0 42 30v10z"/><path ${f('sky')} d="M58 36h12q12 4 18 18H58z"/><path d="M4 58h92" stroke="${C.blue}" stroke-width="5"/><path d="M4 58h92" stroke-width="1.5"/>
      <rect ${f('sky')} x="14" y="38" width="12" height="10" rx="2" stroke-width="2.5"/><rect ${f('sky')} x="32" y="38" width="12" height="10" rx="2" stroke-width="2.5"/><path d="M2 80h96"/>`,
    bus: `<rect ${f('orange')} x="8" y="22" width="84" height="52" rx="10"/><rect ${f('sky')} x="16" y="30" width="18" height="18" rx="3"/><rect ${f('sky')} x="40" y="30" width="18" height="18" rx="3"/><rect ${f('sky')} x="64" y="30" width="20" height="30" rx="3"/>
      <circle ${f('dark')} cx="26" cy="76" r="8"/><circle ${f('dark')} cx="72" cy="76" r="8"/>`,
    taxi: `<path ${f('yellow')} d="M10 62q0-12 12-14l12-14h32l12 14q12 2 12 14v10H10z"/>
      <path ${f('sky')} d="M38 38h11v12H28zM53 38h11l10 12H53z"/><rect ${f('white')} x="40" y="24" width="20" height="10" rx="3"/>
      <circle ${f('dark')} cx="28" cy="74" r="9"/><circle ${f('dark')} cx="72" cy="74" r="9"/>`,
    car: `<path ${f('red')} d="M10 62q0-12 12-14l12-14h32l12 14q12 2 12 14v10H10z"/><path ${f('sky')} d="M38 38h11v12H28zM53 38h11l10 12H53z"/>
      <circle ${f('dark')} cx="28" cy="74" r="9"/><circle ${f('dark')} cx="72" cy="74" r="9"/>`,
    plane: `<path ${f('white')} d="M8 52q0-8 10-8h56q18 0 20 8-2 8-20 8H18q-10 0-10-8z"/><path ${f('sky')} d="M40 46L28 20h10l20 26zM40 58L28 84h10l20-26zM14 46l-6-14h8l10 14z"/><path d="M76 48h8" stroke-width="2.5"/>`,
    ship: `<path ${f('white')} d="M8 58h84l-12 22H20z"/><rect ${f('red')} x="34" y="36" width="34" height="22"/><rect ${f('dark')} x="46" y="20" width="10" height="16"/><path d="M4 86q8-6 16 0t16 0 16 0 16 0 16 0 16 0" stroke="${C.blue}"/>`,
    walk: `<circle ${f('blue')} cx="54" cy="16" r="11"/>${tube('M53 32L48 60', 'blue', 13)}${tube('M48 60L34 88', 'blue', 10)}${tube('M48 60L64 86', 'blue', 10)}
      ${tube('M52 38L38 56', 'blue', 8)}${tube('M52 38L68 52', 'blue', 8)}<path d="M28 90h12M60 88h12" stroke-width="5"/>`,
    hospital: `<rect ${f('white')} x="16" y="20" width="68" height="68" rx="4"/><rect ${f('red')} x="42" y="30" width="16" height="36" stroke="none"/>
      <rect ${f('red')} x="32" y="40" width="36" height="16" stroke="none"/><rect ${f('sky')} x="42" y="72" width="16" height="16"/>`,
    school: `<path ${f('cream')} d="M8 44h84v44H8z"/><path ${f('red')} d="M8 44l42-22 42 22z"/><circle ${f('white')} cx="50" cy="34" r="6" stroke-width="2.5"/>
      <g ${f('sky')} stroke-width="2.5"><rect x="16" y="54" width="14" height="12"/><rect x="70" y="54" width="14" height="12"/></g><rect ${f('brown')} x="42" y="62" width="16" height="26"/>`,
    house: `<path ${f('red')} d="M10 48 50 14l40 34z"/><rect ${f('cream')} x="20" y="48" width="60" height="40"/><rect ${f('brown')} x="42" y="62" width="16" height="26"/>
      <rect ${f('sky')} x="26" y="56" width="12" height="12"/><rect ${f('sky')} x="62" y="56" width="12" height="12"/>`,
    shop: `<rect ${f('cream')} x="12" y="36" width="76" height="52"/><path ${f('red')} d="M8 22h84l-4 16H12z"/><path d="M8 38h84" /><path ${f('white')} d="M12 38q8 10 16 0 8 10 16 0 8 10 16 0 8 10 16 0 8 10 16 0" stroke-width="2"/>
      <rect ${f('sky')} x="20" y="54" width="28" height="22"/><rect ${f('brown')} x="56" y="54" width="22" height="34"/>`,
    cafe: `<rect ${f('cream')} x="12" y="36" width="76" height="52"/><path ${f('green')} d="M8 22h84l-4 16H12z"/><rect ${f('sky')} x="20" y="50" width="30" height="24"/><rect ${f('brown')} x="58" y="52" width="20" height="36"/>
      <path ${f('white')} d="M28 58h14v8a7 7 0 0 1-14 0z" stroke-width="2"/>`,
    bookstore: `<rect ${f('cream')} x="12" y="36" width="76" height="52"/><path ${f('blue')} d="M8 22h84l-4 16H12z"/><rect ${f('white')} x="20" y="48" width="38" height="28"/>
      <g stroke-width="2"><rect ${f('red')} x="24" y="56" width="6" height="18"/><rect ${f('yellow')} x="32" y="54" width="6" height="20"/><rect ${f('green')} x="40" y="58" width="6" height="16"/><rect ${f('pink')} x="48" y="55" width="6" height="19"/></g><rect ${f('brown')} x="64" y="52" width="16" height="36"/>`,
    park: `<rect ${f('grass')} x="6" y="70" width="88" height="18" rx="4" stroke="none"/><path d="M30 78V54" stroke="${C.brown}" stroke-width="6"/><circle ${f('green')} cx="30" cy="40" r="20"/>
      <path ${f('wood')} d="M54 66h36v6H54z"/><path d="M58 72v12M86 72v12M54 58h36" stroke-width="3"/>`,
    station: `<rect ${f('cream')} x="10" y="40" width="80" height="48"/><path ${f('dark')} d="M6 32h88v10H6z"/><rect ${f('white')} x="30" y="12" width="40" height="20" rx="3"/>
      <text x="50" y="27" class="lis-art-glyph" fill="${INK}" stroke="none">駅</text><rect ${f('sky')} x="22" y="52" width="56" height="36"/><path d="M50 52v36"/>`,
    gate: `<rect ${f('silver')} x="10" y="40" width="16" height="48"/><rect ${f('silver')} x="42" y="40" width="16" height="48"/><rect ${f('silver')} x="74" y="40" width="16" height="48"/>
      <path ${f('orange')} d="M26 56h8v8h-8zM58 56h8v8h-8z" stroke-width="2"/><rect ${f('green')} x="14" y="44" width="8" height="6" stroke-width="1.5"/><rect ${f('green')} x="46" y="44" width="8" height="6" stroke-width="1.5"/><path d="M4 88h92"/>`,
    library: `<path ${f('cream')} d="M10 42h80v46H10z"/><path ${f('sky')} d="M6 42L50 14l44 28z"/><path ${f('white')} d="M50 26q-7-4-14-2v12q7-2 14 2zM50 26q7-4 14-2v12q-7-2-14 2z" stroke-width="2"/>
      <g ${f('white')}><rect x="18" y="48" width="8" height="40"/><rect x="38" y="48" width="8" height="40"/><rect x="54" y="48" width="8" height="40"/><rect x="74" y="48" width="8" height="40"/></g><path d="M6 88h88"/>`,
    pool: `<rect ${f('sky')} x="8" y="36" width="84" height="48" rx="6"/><path d="M14 52q8-6 16 0t16 0 16 0 16 0 8 0M14 68q8-6 16 0t16 0 16 0 16 0 8 0" stroke="${C.white}" stroke-width="3"/><path d="M76 36V16M86 36V16M76 22h10M76 30h10" stroke-width="3"/>`,
    mountain: `<path ${f('green')} d="M4 86l32-50 16 22 12-18 32 46z"/><path ${f('white')} d="M30 46l6-10 7 10-6 4zM58 46l6-6 6 8-6 2z" stroke-width="2.5"/><circle ${f('orange')} cx="80" cy="22" r="9"/>`,
    beach: `<rect ${f('sky')} x="4" y="40" width="92" height="26" stroke="none"/><path ${f('beige')} d="M4 66q46-12 92 0v22H4z" stroke="none"/><path d="M4 66q46-12 92 0"/><circle ${f('orange')} cx="78" cy="22" r="10"/>
      <path d="M30 84V48" stroke="${C.brown}" stroke-width="3"/><path ${f('red')} d="M10 50q20-18 40 0z"/>`,
    // nature, weather and seasons
    sun: `<circle ${f('orange')} cx="50" cy="50" r="18"/><g stroke="${C.orange}" stroke-width="5">
      <path d="M50 12v12M50 76v12M12 50h12M76 50h12M23 23l8 8M69 69l8 8M77 23l-8 8M31 69l-8 8"/></g>`,
    moon: `<path ${f('yellow')} d="M62 14a38 38 0 1 0 24 62A30 30 0 0 1 62 14z"/><g fill="${C.yellow}" stroke="none"><circle cx="24" cy="20" r="3"/><circle cx="16" cy="44" r="2"/></g>`,
    cloud: `<path ${f('white')} d="M24 70a16 16 0 0 1 2-32 22 22 0 0 1 42-4 18 18 0 0 1 10 36z"/>`,
    cloudy: `<path ${f('gray')} d="M24 70a16 16 0 0 1 2-32 22 22 0 0 1 42-4 18 18 0 0 1 10 36z"/>`,
    rain: `<path ${f('gray')} d="M24 62a14 14 0 0 1 2-28 20 20 0 0 1 38-4 15 15 0 0 1 12 32z"/>
      <g stroke="${C.blue}" stroke-width="4"><path d="M32 72l-4 10M50 72l-4 10M68 72l-4 10"/></g>`,
    snow: `<path ${f('white')} d="M24 60a14 14 0 0 1 2-28 20 20 0 0 1 38-4 15 15 0 0 1 12 32z"/>
      <g ${f('sky')} stroke-width="2"><circle cx="30" cy="76" r="5"/><circle cx="50" cy="82" r="5"/><circle cx="70" cy="76" r="5"/></g>`,
    wind: `<path d="M10 40h52a10 10 0 1 0-10-10M10 56h70a10 10 0 1 1-10 10M10 72h36" stroke="${C.blue}" stroke-width="5"/>`,
    sakura: `<path d="M50 90V60M50 60L30 40M50 66l22-22" stroke="${C.brown}" stroke-width="6"/>${flowerHead(30, 34, 'pink')}${flowerHead(72, 38, 'pink')}${flowerHead(50, 24, 'pink')}${flowerHead(18, 56, 'pink')}${flowerHead(82, 60, 'pink')}`,
    leaves: `<path ${f('orange')} d="M30 20q30 0 30 30-30 0-30-30z"/><path ${f('red')} d="M70 44q16 24-6 40-16-24 6-40z"/><path ${f('yellow')} d="M20 60q24-6 32 18-24 6-32-18z"/><path d="M30 20l26 26M64 84l6-36M20 60l30 16" stroke-width="2"/>`,
    snowman: `<circle ${f('white')} cx="50" cy="68" r="24"/><circle ${f('white')} cx="50" cy="32" r="16"/><path ${f('red')} d="M36 44h28v6H36z" stroke-width="2"/><path ${f('orange')} d="M50 32l12 3-12 3z" stroke-width="1.5"/>
      <g fill="${INK}" stroke="none"><circle cx="44" cy="28" r="2"/><circle cx="56" cy="28" r="2"/><circle cx="50" cy="62" r="2.5"/><circle cx="50" cy="72" r="2.5"/></g>`,
    tree: `<path d="M50 88V58" stroke="${C.brown}" stroke-width="8"/><circle ${f('green')} cx="50" cy="40" r="28"/>`,
    // animals
    cat: `<path ${f('orange')} d="M22 34l6-22 14 14h16l14-14 6 22q6 12 0 24-8 20-28 20t-28-20q-6-12 0-24z"/><g fill="${INK}" stroke="none"><circle cx="38" cy="46" r="3"/><circle cx="62" cy="46" r="3"/></g>
      <path d="M46 56l4 3 4-3M16 52h12M16 60h12M72 52h12M72 60h12" stroke-width="2"/>`,
    dog: `<path ${f('wood')} d="M26 30q24-16 48 0 8 16 4 32-8 20-28 20t-28-20q-4-16 4-32z"/><path ${f('brown')} d="M26 30q-14 2-14 22 10 2 16-8zM74 30q14 2 14 22-10 2-16-8z"/>
      <ellipse ${f(INK)} cx="50" cy="60" rx="6" ry="4" stroke="none"/><g fill="${INK}" stroke="none"><circle cx="40" cy="46" r="3"/><circle cx="60" cy="46" r="3"/></g><path d="M50 64v6q-6 4-10 0M50 70q6 4 10 0" stroke-width="2"/>`,
    bird: `<path ${f('yellow')} d="M20 56q0-26 30-26 22 0 26 18l12 4-12 6q-4 22-30 22-26 0-26-24z"/><path ${f('orange')} d="M30 54q12-4 22 8-14 6-22-8z"/><circle ${f(INK)} cx="64" cy="46" r="3" stroke="none"/><path d="M40 78l-4 10M54 78v10" stroke-width="3"/>`,
    fish: `<path ${f('blue')} d="M14 50q20-26 50-16 10 4 16 16-6 12-16 16-30 10-50-16z"/><path ${f('blue')} d="M80 50l14-14v28z"/><circle ${f(INK)} cx="30" cy="46" r="3" stroke="none"/><path d="M44 38q6 12 0 24" stroke-width="2.5"/>`,
    // activities
    sleep: `<rect ${f('blue')} x="8" y="56" width="84" height="22" rx="4"/><path d="M8 50v38M92 66v22"/><rect ${f('white')} x="12" y="48" width="22" height="10" rx="5"/>
      <circle ${f('skin')} cx="24" cy="44" r="9"/><path ${f('sky')} d="M30 52h56q4 0 4 4H30z"/>
      <g stroke-width="3"><path d="M54 14h10l-10 12h10M70 28h7l-7 8h7"/></g>`,
    cooking: `<path d="M30 90q4-10 0-16M44 92q4-12 0-18M58 90q4-10 0-16" stroke="${C.orange}" stroke-width="4"/>
      <circle ${f('dark')} cx="44" cy="46" r="32"/><circle fill="#6e6874" cx="44" cy="46" r="26" stroke="none"/><path d="M74 42h20a5 5 0 0 1 0 10H74" ${f('brown')}/>
      <path ${f('white')} d="M30 40q4-14 16-10 14-2 14 10 6 10-6 16-12 6-20-2-10-4-4-14z" stroke-width="2.5"/><circle ${f('yellow')} cx="44" cy="44" r="7" stroke-width="2.5"/>`,
    swim: `<path ${f('sky')} d="M2 60q8-6 16 0t16 0 16 0 16 0 16 0 16 0V96H2z" stroke="none"/><path d="M2 60q8-6 16 0t16 0 16 0 16 0 16 0 16 0" stroke="${C.blue}" stroke-width="4"/>
      ${tube('M44 58Q50 24 78 30', 'skin', 9)}<circle ${f('skin')} cx="80" cy="31" r="5.5" stroke-width="3"/>
      <circle ${f('skin')} cx="30" cy="54" r="12"/><path ${f('red')} d="M18 52q2-14 12-14t12 14z"/><path d="M22 54h16" stroke="${C.sky}" stroke-width="5"/><path d="M22 54h16" stroke-width="1.5"/>
      <path d="M2 78q8-6 16 0t16 0 16 0 16 0 16 0 16 0" stroke="#fff" stroke-width="3"/>`,
    karaoke: `<rect ${f('dark')} x="40" y="10" width="20" height="32" rx="10"/><path d="M50 42v40M36 84h28" stroke-width="5"/><g ${f(INK)} stroke="none"><ellipse cx="22" cy="62" rx="6" ry="4"/><ellipse cx="80" cy="44" rx="6" ry="4"/></g><path d="M27 62V40l8-2M85 44V24l6-2" stroke-width="2.5"/>`,
    music: `<g ${f(INK)} stroke="none"><ellipse cx="30" cy="74" rx="12" ry="9"/><ellipse cx="72" cy="64" rx="12" ry="9"/></g><path d="M41 74V22l42-10v52" stroke-width="5"/><path d="M41 34l42-10" stroke-width="8"/>`,
    paint: `<path ${f('cream')} d="M50 12C24 12 8 30 8 52s16 36 34 36c8 0 6-10 12-14 8-4 16 4 26-4 10-8 12-20 6-34C80 22 66 12 50 12z"/><g stroke="none"><circle cx="30" cy="40" r="7" ${f('red')}/><circle cx="50" cy="30" r="7" ${f('blue')}/><circle cx="70" cy="40" r="7" ${f('yellow')}/><circle cx="28" cy="62" r="7" ${f('green')}/></g>`,
    hiking: `<path ${f('green')} d="M4 88l34-58 18 26 10-14 30 46z"/><path d="M20 84l14-10-6-12 12-10-4-14" stroke="#fff" stroke-width="3.5" stroke-dasharray="3 6"/>
      <path d="M38 30V8" stroke-width="3"/><path ${f('red')} d="M38 8l18 6-18 6z" stroke-width="2.5"/>${tube('M70 88V60', 'brown', 4)}<rect ${f('orange')} x="62" y="54" width="18" height="20" rx="5" stroke-width="2.5"/>`,
    study: `<rect ${f('sky')} x="10" y="50" width="56" height="38" rx="3"/><path d="M38 50v38" stroke-width="2.5"/><path d="M16 60h16M16 70h16M44 60h16M44 70h16" stroke-width="2.5"/><path ${f('yellow')} d="M78 18l10 6-24 44-10 4 0-10z"/>`,
    homework: `<rect ${f('white')} x="20" y="10" width="60" height="80" rx="4"/><path d="M30 28h40M30 42h40M30 56h40M30 70h24" stroke-width="2.5"/><path d="M62 62l6 8 14-18" stroke="${C.red}" stroke-width="5"/>`,
    work: `<rect ${f('brown')} x="12" y="34" width="76" height="50" rx="6"/><path d="M38 34v-8h24v8"/><path d="M12 52h76" stroke-width="2.5"/><rect ${f('yellow')} x="44" y="48" width="12" height="10" rx="2" stroke-width="2.5"/>`,
    person: `<circle ${f('blue')} cx="50" cy="30" r="14"/><path ${f('blue')} d="M24 88q0-38 26-38t26 38z"/>`,
  };
  ICONS.shirt = ICONS.tshirt;

  // An object with a red ✕ over it ("the train wasn't running").
  const crossed = name => `${ICONS[name]}<g stroke="${C.red}" stroke-width="7"><path d="M14 14l72 72M86 14 14 86"/></g>`;
  ICONS['train-stopped'] = crossed('train');

  // ─── More objects, for the vocabulary page's Picture → Word cards ──────────

  const starPath = (cx, cy, R, r) => {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 5 * i - Math.PI / 2;
      const d = i % 2 ? r : R;
      pts.push(`${(cx + d * Math.cos(a)).toFixed(1)} ${(cy + d * Math.sin(a)).toFixed(1)}`);
    }
    return `M${pts.join('L')}z`;
  };
  const drop = color => `<path ${f(color)} d="M50 10C40 30 22 46 22 62a28 28 0 0 0 56 0C78 46 60 30 50 10z"/><path d="M34 62q0 12 10 16" stroke="#fff" stroke-width="4"/>`;
  const swatch = color => `<path ${f(color)} d="M50 12c22 0 38 12 38 30 0 14-12 18-20 18-6 0-9 6-5 12 5 9-2 16-13 16-22 0-38-16-38-38s16-38 38-38z"/>
    <circle ${f('paper')} cx="30" cy="52" r="5" stroke-width="2.5"/><path d="M76 14l-10 26" stroke="${C.wood}" stroke-width="6"/>`;
  // A face, with one part ringed in red (or an arrow onto the top of the head).
  const FACE = `<circle ${f('skin')} cx="16" cy="56" r="7"/><circle ${f('skin')} cx="84" cy="56" r="7"/><circle ${f('skin')} cx="50" cy="54" r="34"/>
    <path fill="${C.hair}" d="M16 50q0-38 34-38t34 38q-10-18-34-20-24 2-34 20z"/>
    <g fill="${INK}" stroke="none"><circle cx="38" cy="52" r="3.5"/><circle cx="62" cy="52" r="3.5"/></g>
    <path d="M50 54q-4 9 2 11" stroke-width="2.5"/><path d="M40 74q10 7 20 0"/>`;
  const ring = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" stroke="${C.red}" stroke-width="4"/>`;
  // A ball against a table or box, for 上 / 下 / 中.
  const TABLE = `<path ${f('wood')} d="M12 44h76v8H12z"/><path d="M20 52v38M80 52v38" stroke-width="5"/>`;
  const BALL = (x, y) => `<circle ${f('red')} cx="${x}" cy="${y}" r="12"/><path d="M${x - 6} ${y - 4}q3-4 7-4" stroke="#fff" stroke-width="3"/>`;
  const turnSign = flip => `<circle ${f('blue')} cx="50" cy="50" r="40"/><g${flip ? ' transform="translate(100 0) scale(-1 1)"' : ''}>
    <path d="M38 78V54q0-14 14-14h14" stroke="#fff" stroke-width="10" stroke-linecap="butt"/><path fill="#fff" stroke="none" d="M62 26l20 14-20 14z"/></g>`;
  const pagoda = () => {
    const parts = [`<path d="M50 4v14" stroke-width="3"/><path d="M45 8h10M45 12h10" stroke-width="2"/>`];
    for (let i = 0; i < 4; i++) {
      const y = 86 - i * 18, w = 40 - i * 7, b = 18 - i * 3;
      parts.unshift(`<rect ${f('red')} x="${50 - b}" y="${y - 12}" width="${2 * b}" height="12"/><path ${f('dark')} d="M${50 - w} ${y - 12}q${w} -6 ${2 * w} 0l-8-6H${58 - w}z"/>`);
    }
    return `<path d="M8 90h84"/>${parts.reverse().join('')}`;
  };
  const head = (x, y) => `<g fill="${INK}" stroke="none"><circle cx="${x}" cy="${y}" r="3.5"/><circle cx="${100 - x}" cy="${y}" r="3.5"/></g>`;
  // Two-pass outline: everything drawn thick in ink, then again in colour on top.
  const solid = (shapes, color) => `<g fill="${INK}" stroke="${INK}" stroke-width="7">${shapes}</g><g fill="${col(color)}" stroke="${col(color)}" stroke-width="0">${shapes}</g>`;

  Object.assign(ICONS, {
    // food and drink
    grapes: `<path d="M50 8v16"/><path ${f('leaf')} d="M52 14q14-12 26-2-12 10-26 2z"/>
      <g ${f('purple')}><circle cx="50" cy="78" r="12"/><circle cx="39" cy="58" r="12"/><circle cx="61" cy="58" r="12"/><circle cx="28" cy="38" r="12"/><circle cx="50" cy="36" r="12"/><circle cx="72" cy="38" r="12"/></g>
      <g fill="#fff" stroke="none" opacity=".6"><circle cx="45" cy="73" r="3"/><circle cx="23" cy="33" r="3"/><circle cx="34" cy="53" r="3"/></g>`,
    icecream: `<path ${f('wood')} d="M34 50l16 42 16-42z"/><path d="M40 60l14 10M38 52l20 14M62 56l-16 12" stroke-width="2"/>
      <circle ${f('cream')} cx="50" cy="24" r="13"/><circle ${f('pink')} cx="50" cy="44" r="16"/>`,
    vegetables: `<path ${f('orange')} d="M14 88Q22 54 54 36q12 2 10 14Q46 72 14 88z"/><path ${f('green')} d="M58 38q0-20 10-28 4 12-4 26zM62 42q14-10 24-6-8 10-20 10z"/>
      <path d="M32 66l6 4M26 76l6 3M44 54l5 4" stroke-width="2.5"/>
      <circle ${f('red')} cx="72" cy="72" r="17"/><path ${f('green')} d="M72 56l4 4 6-2-4 5 4 4-7-1-3 5-3-5-7 1 4-4-4-5 6 2z" stroke-width="2"/>`,
    meat: `<path ${f('rose')} d="M14 50q0-26 36-28t38 22q2 26-32 34-42 6-42-28z"/><path d="M28 42q14 8 28 0t22 10M34 60q10 4 20 0" stroke="#fff" stroke-width="5"/>`,
    drumstick: `${tube('M56 56L78 78', 'white', 9)}<circle ${f('white')} cx="82" cy="74" r="6" stroke-width="3"/><circle ${f('white')} cx="74" cy="84" r="6" stroke-width="3"/>
      <ellipse ${f('wood')} cx="40" cy="40" rx="30" ry="22" transform="rotate(45 40 40)"/><path d="M28 30q6-6 14-6" stroke="#fff" stroke-width="3.5" opacity=".7"/>`,
    lollipop: `${tube('M50 58V94', 'white', 5)}<circle ${f('pink')} cx="50" cy="36" r="24"/>
      <path d="M50 36m-4 0a4 4 0 1 1 8 0a8 8 0 1 1-16 0a12 12 0 1 1 24 0a16 16 0 1 1-32 0" stroke="#fff" stroke-width="3"/>`,
    beans: `<path ${f('green')} d="M10 66q10-34 44-38t38 6q-10 22-44 32T10 66z"/><g ${f('mint')}><circle cx="30" cy="56" r="9"/><circle cx="50" cy="48" r="9"/><circle cx="70" cy="40" r="9"/></g>`,
    wine: `<path ${f('white')} d="M30 12h40q2 36-20 42-22-6-20-42z"/><path fill="#a3263f" stroke="none" d="M32 28h36q-2 22-18 24-16-2-18-24z"/><path d="M30 12h40q2 36-20 42-22-6-20-42z"/>
      <path d="M50 54v28M34 86h32"/><path d="M36 18q-1 10 2 18" stroke="#fff" stroke-width="3"/>`,
    sake: `<path ${f('white')} d="M35 10h12v10q0 6 8 14 10 12 6 30-4 22-20 22t-20-22q-4-18 6-30 8-8 8-14z"/><path d="M24 52h34" stroke="${C.blue}" stroke-width="5"/>
      <path ${f('white')} d="M66 70h24l-3 16H69z"/>`,
    soysauce: `<path ${f('red')} d="M42 12h16v14H42z"/><path d="M58 18l8-4" stroke-width="3"/><path ${f('choc')} d="M32 42q0-12 10-16h16q10 4 10 16v42a4 4 0 0 1-4 4H36a4 4 0 0 1-4-4z"/>
      <rect ${f('white')} x="38" y="52" width="24" height="22" rx="2" stroke-width="2.5"/><path d="M44 60h12M44 66h12" stroke-width="2"/>`,
    glass: `<path ${f('white')} d="M26 16h48l-6 72H32z"/><path fill="${C.sky}" stroke="none" d="M29 44h42l-4 42H33z"/><path d="M26 16h48l-6 72H32z"/><path d="M29 44h42" stroke-width="2.5"/>
      <path d="M34 24l2 14" stroke="#fff" stroke-width="3.5"/>`,
    water: drop('sky'),
    blood: drop('red'),
    salad: `<path ${f('green')} d="M16 52q2-18 20-16 4-16 22-10 14-6 22 10 10 4 6 16z"/><path ${f('mint')} d="M30 50q4-12 16-12M56 50q6-12 18-10" stroke-width="2.5"/>
      <circle ${f('red')} cx="40" cy="42" r="6"/><circle ${f('red')} cx="64" cy="40" r="6"/><path ${f('white')} d="M10 52h80q-4 34-40 34T10 52z"/>`,
    jam: `<rect ${f('rose')} x="24" y="34" width="52" height="54" rx="8"/><rect ${f('white')} x="22" y="18" width="56" height="16" rx="3"/><path d="M26 26h48" stroke="${C.red}" stroke-width="3" stroke-dasharray="4 4"/>
      <rect ${f('cream')} x="34" y="50" width="32" height="24" rx="3" stroke-width="2.5"/><circle ${f('red')} cx="50" cy="62" r="5" stroke-width="2"/>`,
    watermelon: `<path ${f('green')} d="M6 34a44 44 0 0 0 88 0z"/><path ${f('red')} d="M14 34a36 36 0 0 0 72 0z"/>
      <g fill="${INK}" stroke="none"><ellipse cx="34" cy="46" rx="2" ry="3.5"/><ellipse cx="50" cy="52" rx="2" ry="3.5"/><ellipse cx="66" cy="46" rx="2" ry="3.5"/><ellipse cx="42" cy="62" rx="2" ry="3.5"/><ellipse cx="58" cy="62" rx="2" ry="3.5"/></g>`,
    blacktea: `<ellipse ${f('white')} cx="44" cy="80" rx="36" ry="7"/><path ${f('white')} d="M18 42h52q0 34-26 34T18 42z"/><path d="M68 48h6a8 8 0 0 1 0 16h-6"/>
      <ellipse fill="#b5532a" cx="44" cy="43" rx="25" ry="4"/><path d="M50 42L62 16" stroke-width="2"/><rect ${f('yellow')} x="56" y="6" width="14" height="12" rx="2" stroke-width="2.5"/>`,
    spoon: `${tube('M50 44V92', 'silver', 7)}<ellipse ${f('silver')} cx="50" cy="26" rx="14" ry="18"/><path d="M44 18q-2 8 2 14" stroke="#fff" stroke-width="3"/>`,
    fork: `${tube('M50 44V92', 'silver', 7)}<path d="M38 10v22M50 10v22M62 10v22" stroke-width="4"/><path ${f('silver')} d="M36 28h28q0 16-14 18-14-2-14-18z"/>`,
    knife: `<path ${f('silver')} d="M42 8q22 4 16 52H42z"/><rect ${f('brown')} x="40" y="58" width="20" height="32" rx="6"/><g fill="${INK}" stroke="none"><circle cx="50" cy="68" r="2"/><circle cx="50" cy="80" r="2"/></g>`,
    chopsticks: `${tube('M20 86L76 10', 'wood', 5)}${tube('M34 90L88 18', 'wood', 5)}<rect ${f('red')} x="20" y="78" width="26" height="10" rx="5" stroke-width="2.5"/>`,
    pot: `<path d="M50 30q-6-8 0-14t0-12M34 30q-6-8 0-14M66 30q-6-8 0-14" stroke="${C.gray}"/>
      <path d="M16 52H6M84 52h10" stroke-width="6"/><path ${f('silver')} d="M16 44h68v32a12 12 0 0 1-12 12H28a12 12 0 0 1-12-12z"/>
      <path ${f('silver')} d="M12 44q38-20 76 0z"/><rect ${f('dark')} x="44" y="30" width="12" height="6" rx="3"/>`,

    // nature
    river: `<path ${f('sky')} d="M30 6q-12 20 4 42t-6 46h42q18-26 2-46T62 6z"/><path d="M44 28q4-3 8 0M50 60q4-3 8 0M42 80q4-3 8 0" stroke="#fff" stroke-width="3"/>
      <path d="M12 40l4-8 4 8M76 70l4-8 4 8M10 74l4-8 4 8" stroke="${C.leaf}"/>`,
    wave: `<path ${f('blue')} d="M6 90V64C10 34 32 18 56 18c22 0 36 20 26 34-8 10-24 6-24-4 0-8 8-10 12-6l24 22v26z"/>
      <path d="M16 74q8-34 40-42" stroke="#fff" stroke-width="3.5"/><path d="M64 80q10-4 22 0" stroke="#fff" stroke-width="3"/>`,
    island: `<ellipse ${f('sky')} cx="50" cy="80" rx="46" ry="12"/><path ${f('beige')} d="M16 80q34-30 68 0z"/>${tube('M48 72q0-26 10-42', 'brown', 5)}
      <path ${f('green')} d="M58 30q-22-10-32 6 14-6 32-6zM58 30q16-14 32-2-16-2-32 2zM58 30q-6-18 8-24-2 12-8 24zM58 30q18 0 26 16-12-8-26-16z" stroke-width="2.5"/>`,
    pond: `<path d="M80 52V20M88 54V30" stroke="${C.leaf}"/><rect ${f('brown')} x="77" y="18" width="6" height="16" rx="3" stroke-width="2.5"/><rect ${f('brown')} x="85" y="28" width="6" height="14" rx="3" stroke-width="2.5"/>
      <ellipse ${f('sky')} cx="48" cy="64" rx="42" ry="24"/><path ${f('green')} d="M38 66a12 6 0 1 0-2-9l2 9z" stroke-width="2.5"/><path d="M56 56q8-4 16 0M54 74q6-3 12 0" stroke="#fff" stroke-width="3"/>`,
    forest: `<path d="M8 90h84"/>${tube('M24 90V76', 'brown', 6)}${tube('M76 90V76', 'brown', 6)}${tube('M50 90V64', 'brown', 6)}
      <path ${f('leaf')} d="M50 6l24 58H26z"/><path ${f('green')} d="M24 30l20 48H4z"/><path ${f('green')} d="M76 30l20 48H56z"/>`,
    grass: `<path ${f('green')} d="M20 88q-4-30 8-52 2 30-2 52zM36 88q0-40 18-64-6 40-8 64zM56 88q4-30 22-46-10 24-12 46zM72 88q6-20 18-28-6 14-8 28z"/>
      <path ${f('leaf')} d="M28 88q-10-20-20-26 12 4 26 26zM62 88q-4-24-12-34 10 8 18 34z"/><path d="M8 88h84"/>`,
    leaf: `<path ${f('green')} d="M16 84q-6-50 40-62 26-6 32-10-2 32-14 48-20 28-58 24z"/><path d="M16 84Q44 56 78 22M36 64l-2-14M50 50l14 2M60 40l-2-12M44 58l14 4" stroke-width="2.5"/>`,
    stone: `<ellipse fill="${INK}" stroke="none" opacity=".15" cx="50" cy="84" rx="38" ry="6"/><path ${f('gray')} d="M12 72q-4-24 18-36 16-14 34-6 24 8 24 30 0 22-38 24-34 2-38-12z"/>
      <path d="M32 44q8-6 16-4" stroke="#fff" stroke-width="3.5"/><path d="M56 62l8 6M62 52l4 2" stroke-width="2.5"/>`,
    star: `<path ${f('yellow')} d="${starPath(50, 54, 42, 18)}"/><path d="M40 40l6-6" stroke="#fff" stroke-width="3"/>`,
    thunder: `<path ${f('dark')} d="M22 58a14 14 0 0 1 2-28 18 18 0 0 1 34-8 14 14 0 0 1 22 12 12 12 0 0 1-2 24z"/>
      <path ${f('yellow')} d="M52 50l-14 24h12l-6 20 24-30H54l8-14z"/>`,
    ice: `<path ${f('sky')} d="M10 56l22-10 22 10v26l-22 10-22-10z"/><path d="M10 56l22 10 22-10M32 66v26" stroke-width="2.5"/>
      <path ${f('sky')} d="M46 30l22-10 22 10v26l-22 10-22-10z"/><path d="M46 30l22 10 22-10M68 40v26" stroke-width="2.5"/>
      <path d="M16 64v8M52 38v8M74 46l8-4" stroke="#fff" stroke-width="3"/>`,
    fire: `<path ${f('orange')} d="M50 90c-20 0-30-14-28-30 2-14 12-20 12-34 10 6 14 16 14 24 4-6 4-14 2-22 18 10 28 30 26 44-2 12-12 18-26 18z"/>
      <path ${f('yellow')} d="M50 88c-10 0-14-8-12-16 2-8 8-10 10-18 8 6 14 14 14 22 0 8-6 12-12 12z" stroke-width="2.5"/>`,
    houseFire: `<rect ${f('wall')} x="12" y="54" width="48" height="34"/><path ${f('brown')} d="M4 58l32-28 32 28z"/><rect ${f('yellow')} x="20" y="64" width="12" height="12" stroke-width="2.5"/><rect ${f('brown')} x="40" y="66" width="12" height="22" stroke-width="2.5"/>
      <path ${f('orange')} d="M56 88c-12 0-18-8-16-18 2-10 10-12 10-24 8 4 10 10 10 16 4-4 4-10 2-16 14 8 20 22 18 32-2 6-8 10-24 10z"/>
      <path ${f('yellow')} d="M60 86c-6 0-8-4-7-9 1-5 5-6 6-10 5 4 8 8 8 12s-3 7-7 7z" stroke-width="2.5"/><path d="M30 26q-4-6 0-12M42 22q-4-6 0-12" stroke="${C.gray}"/>`,
    globe: `<circle ${f('sky')} cx="50" cy="50" r="40"/><path ${f('green')} d="M22 36q8-12 22-10 6 8-2 14-4 10-14 6-8-2-6-10zM52 52q12-6 22 2 4 12-6 18-4 8-12 2-8-10-4-22zM56 16q10-2 16 6-8 4-16-6zM20 62q8 0 10 8-4 6-8 2z" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="40"/>`,
    sunrise: `<g stroke="${C.orange}"><path d="M50 34V20M26 46l-9-8M74 46l9-8M16 62H4M84 62h12"/></g><path ${f('orange')} d="M24 70a26 26 0 0 1 52 0z"/>
      <path d="M6 70h88"/><path d="M22 80h22M56 80h22M36 88h28" stroke="${C.blue}"/>`,
    night: `<rect ${f('navy')} x="8" y="10" width="84" height="80" rx="10"/><path ${f('yellow')} d="M58 22a24 24 0 1 0 18 40 20 20 0 0 1-18-40z"/>
      <g fill="#fff" stroke="none"><path d="${starPath(26, 30, 6, 2.5)}"/><path d="${starPath(78, 24, 4, 1.8)}"/><path d="${starPath(30, 70, 4, 1.8)}"/><path d="${starPath(76, 76, 5, 2)}"/></g>`,

    // home and things
    chair: `<rect ${f('wood')} x="30" y="10" width="40" height="40" rx="4"/><path d="M38 20v22M50 20v22M62 20v22" stroke-width="2.5"/>
      <path d="M30 60v30M70 60v30" stroke-width="5"/><path ${f('wood')} d="M22 50h56v10H22z"/>`,
    desk: `<rect ${f('wood')} x="58" y="44" width="30" height="44"/><path d="M58 58h30M58 72h30" stroke-width="2.5"/><g fill="${INK}" stroke="none"><circle cx="73" cy="51" r="2"/><circle cx="73" cy="65" r="2"/><circle cx="73" cy="80" r="2"/></g>
      <path d="M16 44v44" stroke-width="5"/><rect ${f('wood')} x="8" y="36" width="84" height="10" rx="2"/>
      <path d="M22 36V24l8-10" stroke-width="3"/><path ${f('yellow')} d="M24 18l12-10 8 10z" stroke-width="2.5"/>`,
    table: `<path d="M22 50v38M78 50v38" stroke-width="5"/><path d="M34 50v30M66 50v30" stroke-width="3.5"/><path ${f('wood')} d="M8 40h84l-6 10H14z"/>
      <path ${f('white')} d="M40 40v-14h16v14" stroke-width="2.5"/><circle ${f('red')} cx="48" cy="20" r="6" stroke-width="2.5"/>`,
    bed: `<rect ${f('wood')} x="6" y="28" width="12" height="60" rx="3"/><path d="M18 74h76v10M90 84v4" stroke-width="4"/>
      <rect ${f('white')} x="18" y="56" width="74" height="16"/><path ${f('blue')} d="M40 50h52v26H40z"/><rect ${f('white')} x="20" y="44" width="20" height="12" rx="5"/>`,
    window: `<rect ${f('sky')} x="16" y="12" width="68" height="66" rx="3"/><path d="M50 12v66M16 45h68"/><path d="M24 34l10-10M58 34l10-10" stroke="#fff" stroke-width="3.5"/>
      <rect ${f('wood')} x="10" y="78" width="80" height="8" rx="2"/>`,
    door: `<path d="M10 92h80"/><rect ${f('brown')} x="26" y="8" width="48" height="84" rx="3"/><rect x="34" y="16" width="32" height="26" rx="2" stroke-width="2.5"/><rect x="34" y="56" width="32" height="28" rx="2" stroke-width="2.5"/>
      <circle ${f('yellow')} cx="66" cy="49" r="4.5" stroke-width="2.5"/>`,
    stairs: `<path ${f('wood')} d="M8 90V74h17V58h17V42h17V26h17V10h16v80z"/><path d="M8 66L76 4" stroke-width="3"/><path d="M16 74V59M33 58V43M50 42V27M67 26V11" stroke-width="2.5"/>`,
    elevator: `<rect ${f('silver')} x="16" y="24" width="68" height="68" rx="2"/><path d="M50 24v68"/><path d="M34 40v36M66 40v36" stroke="#fff" stroke-width="3"/>
      <rect ${f('dark')} x="32" y="6" width="36" height="13" rx="3"/><path fill="${C.yellow}" stroke="none" d="M38 16l5-7 5 7zM52 9l5 7 5-7z"/>`,
    mirror: `<path d="M50 76v12M32 90h36" stroke-width="5"/><ellipse ${f('wood')} cx="50" cy="42" rx="30" ry="36"/><ellipse ${f('sky')} cx="50" cy="42" rx="21" ry="27"/>
      <path d="M38 34l10-10M40 48l16-16" stroke="#fff" stroke-width="3.5"/>`,
    money: `<rect ${f('mint')} x="8" y="20" width="64" height="38" rx="3"/><rect x="14" y="26" width="52" height="26" rx="2" stroke-width="2"/><circle ${f('white')} cx="40" cy="39" r="9" stroke-width="2.5"/>
      <circle ${f('silver')} cx="32" cy="74" r="14"/><circle cx="32" cy="74" r="8" stroke-width="2"/><circle ${f('yellow')} cx="64" cy="70" r="18"/><circle cx="64" cy="70" r="5" stroke-width="2.5"/>`,
    bank: `<path ${f('silver')} d="M8 34l42-24 42 24z"/><rect ${f('white')} x="14" y="34" width="72" height="50"/><path d="M8 86h84" stroke-width="5"/>
      <circle ${f('yellow')} cx="50" cy="52" r="14"/><text x="50" y="58" class="lis-art-glyph" fill="${INK}" stroke="none">¥</text>
      <rect ${f('sky')} x="20" y="44" width="12" height="16" stroke-width="2.5"/><rect ${f('sky')} x="68" y="44" width="12" height="16" stroke-width="2.5"/><rect ${f('dark')} x="42" y="68" width="16" height="16" stroke-width="2.5"/>`,
    postoffice: `<rect ${f('white')} x="14" y="34" width="72" height="52"/><rect ${f('red')} x="10" y="22" width="80" height="14" rx="2"/><path d="M8 88h84" stroke-width="4"/>
      <text x="50" y="34" class="lis-art-glyph" fill="#fff" stroke="none">〒</text>
      <rect ${f('sky')} x="20" y="44" width="20" height="16" stroke-width="2.5"/><rect ${f('sky')} x="60" y="44" width="20" height="16" stroke-width="2.5"/><rect ${f('sky')} x="40" y="64" width="20" height="22" stroke-width="2.5"/>`,
    mailbox: `<rect ${f('dark')} x="40" y="74" width="20" height="16"/><path ${f('red')} d="M28 30a22 16 0 0 1 44 0v46H28z"/><path d="M38 38h24" stroke-width="5"/>
      <text x="50" y="66" class="lis-art-glyph" fill="#fff" stroke="none">〒</text>`,
    radio: `<path d="M70 34L84 8" stroke-width="3"/><path d="M28 34v-8h26v8" stroke-width="3"/><rect ${f('orange')} x="10" y="34" width="80" height="52" rx="8"/>
      <circle ${f('cream')} cx="34" cy="60" r="15"/><g fill="${INK}" stroke="none"><circle cx="34" cy="60" r="2"/><circle cx="27" cy="54" r="2"/><circle cx="41" cy="54" r="2"/><circle cx="27" cy="66" r="2"/><circle cx="41" cy="66" r="2"/></g>
      <rect ${f('cream')} x="56" y="46" width="26" height="12" rx="2" stroke-width="2.5"/><path d="M66 46v12" stroke="${C.red}" stroke-width="2.5"/><circle ${f('dark')} cx="62" cy="72" r="4.5" stroke-width="2.5"/><circle ${f('dark')} cx="76" cy="72" r="4.5" stroke-width="2.5"/>`,
    lightbulb: `<g stroke="${C.orange}"><path d="M16 26l-8-4M84 26l8-4M50 4v2M24 8l3 5M76 8l-3 5"/></g>
      <path ${f('yellow')} d="M50 12a26 26 0 0 0-16 46c4 4 6 7 6 12h20c0-5 2-8 6-12a26 26 0 0 0-16-46z"/><path d="M44 70V52l-6-8M56 70V52l6-8" stroke-width="2"/>
      <rect ${f('silver')} x="38" y="70" width="24" height="14" rx="3"/><path d="M38 77h24" stroke-width="2"/><path d="M44 90h12" stroke-width="4"/>`,
    vase: `<path d="M44 34q-6-12-14-16M50 34V12M56 34q6-12 14-18" stroke="${C.leaf}"/>${flowerHead(30, 16, 'red')}${flowerHead(50, 12, 'yellow')}${flowerHead(70, 16, 'pink')}
      <path ${f('blue')} d="M38 40q-14 14-14 28 0 20 26 20t26-20q0-14-14-28v-8H38z"/><path d="M28 62h44" stroke="#fff" stroke-width="3"/>`,
    soap: `<rect ${f('pink')} x="14" y="46" width="72" height="36" rx="12"/><path d="M26 56q4-4 10-4" stroke="#fff" stroke-width="3.5"/>
      <g ${f('white')} stroke-width="2.5"><circle cx="30" cy="32" r="8"/><circle cx="50" cy="22" r="11"/><circle cx="72" cy="32" r="7"/><circle cx="84" cy="16" r="4"/></g>`,
    calendar: `<rect ${f('white')} x="12" y="18" width="76" height="70" rx="4"/><path ${f('red')} d="M12 22a4 4 0 0 1 4-4h68a4 4 0 0 1 4 4v14H12z"/><path d="M30 10v14M70 10v14" stroke-width="5"/>
      <g fill="${INK}" stroke="none">${[0, 1, 2].map(r => [0, 1, 2, 3, 4].map(c => `<rect x="${20 + c * 13}" y="${44 + r * 13}" width="7" height="7" rx="1"/>`).join('')).join('')}</g>
      <circle cx="49.5" cy="60.5" r="7" stroke="${C.red}" stroke-width="3"/>`,
    map: `<path ${f('cream')} d="M8 24l28-8 28 8 28-8v62l-28 8-28-8-28 8z"/><path d="M36 16v62M64 24v62" stroke-width="2.5"/>
      <path d="M16 66q14-20 30-8t26-20" stroke="${C.red}" stroke-dasharray="4 5" stroke-width="3"/><path ${f('red')} d="M78 18a8 8 0 0 1 8 8c0 6-8 14-8 14s-8-8-8-14a8 8 0 0 1 8-8z" stroke-width="2.5"/><circle ${f('white')} cx="78" cy="26" r="2.5" stroke="none"/>`,
    newspaper: `<path ${f('silver')} d="M18 22h70v68H18z"/><rect ${f('white')} x="10" y="14" width="70" height="72" rx="2"/><rect fill="${INK}" x="18" y="22" width="54" height="10" stroke="none"/>
      <rect ${f('sky')} x="18" y="40" width="24" height="20" stroke-width="2.5"/><path d="M48 42h24M48 50h24M48 58h24M18 68h54M18 76h54" stroke-width="2.5"/>`,
    handLetter: `<rect ${f('white')} x="24" y="8" width="52" height="54" rx="2"/><path d="M32 20q4-3 8 0t8 0 8 0 8 0M32 30q4-3 8 0t8 0 8 0 8 0M32 40q4-3 8 0t8 0" stroke-width="2.5"/>
      <path ${f('sky')} d="M12 42h76v46H12z"/><path d="M12 42l38 26 38-26" stroke-width="3"/><path ${f('red')} d="M50 72c-6-5-10-8-10-12a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 4-4 7-10 12z" stroke-width="2"/>`,
    photo: `<rect ${f('white')} x="10" y="18" width="80" height="64" rx="3" transform="rotate(-6 50 50)"/><g transform="rotate(-6 50 50)"><rect ${f('sky')} x="18" y="26" width="64" height="42"/>
      <path ${f('green')} d="M18 68l20-26 12 14 10-10 22 22z" stroke-width="2.5"/><circle ${f('yellow')} cx="68" cy="38" r="6" stroke-width="2.5"/></g>`,
    eraser: `<path ${f('white')} d="M12 58l40-30 36 22-40 30z"/><path ${f('blue')} d="M34 42l18-14 36 22-18 14z"/><path ${f('silver')} d="M12 58v12l36 22V80z"/><path ${f('blue')} d="M48 80v12l40-30V50z"/>
      <path d="M48 36l26 16" stroke="#fff" stroke-width="2.5"/>`,
    scissors: `${tube('M40 66L84 12', 'silver', 7)}${tube('M60 66L16 12', 'silver', 7)}<circle fill="${INK}" cx="50" cy="54" r="3.5" stroke="none"/>
      <circle ${f('red')} cx="32" cy="78" r="13"/><circle ${f('paper')} cx="32" cy="78" r="5.5"/><circle ${f('red')} cx="68" cy="78" r="13"/><circle ${f('paper')} cx="68" cy="78" r="5.5"/>`,
    thread: `<rect ${f('red')} x="32" y="22" width="36" height="56"/><path d="M32 32h36M32 42h36M32 52h36M32 62h36M32 72h36" stroke-width="1.5"/>
      <rect ${f('wood')} x="24" y="12" width="52" height="10" rx="3"/><rect ${f('wood')} x="24" y="78" width="52" height="10" rx="3"/>
      <path d="M68 58q18 6 12 22-4 10 6 14" stroke="${C.red}" stroke-width="3"/>`,
    button: `<circle ${f('blue')} cx="50" cy="50" r="36"/><circle cx="50" cy="50" r="27" stroke-width="2.5"/>
      <g fill="${INK}" stroke="none"><circle cx="41" cy="41" r="4.5"/><circle cx="59" cy="41" r="4.5"/><circle cx="41" cy="59" r="4.5"/><circle cx="59" cy="59" r="4.5"/></g><path d="M28 34q4-6 10-8" stroke="#fff" stroke-width="3"/>`,
    socks: `<path ${f('silver')} d="M44 6h22v46l20 14q8 8 0 16-6 6-14 0L48 66q-4-4-4-10z"/><path d="M44 16h22" stroke="${C.blue}" stroke-width="4"/>
      <path ${f('red')} d="M18 14h22v46l20 14q8 8 0 16-6 6-14 0L22 74q-4-4-4-10z"/><path d="M18 24h22" stroke="#fff" stroke-width="4"/><path d="M48 80q4 4 0 8" stroke-width="2.5"/>`,
    skirt: `<path ${f('pink')} d="M34 20h32l20 64q-36 10-72 0z"/><path d="M42 24l-10 60M50 24v62M58 24l10 60" stroke-width="2.5"/><rect ${f('rose')} x="32" y="12" width="36" height="12" rx="2"/>`,
    trousers: `<path ${f('navy')} d="M28 12h44l6 78H56L50 38 44 90H22z"/><path d="M28 22h44" stroke-width="2.5"/><path d="M50 22v10" stroke-width="2"/>`,
    sweater: `<path ${f('green')} d="M34 12l-18 8-10 52 12 3 8-30v41h48V45l8 30 12-3-10-52-18-8q-16 12-32 0z"/><path d="M34 12q16 14 32 0" stroke-width="3"/>
      <path d="M30 40l5 5 5-5 5 5 5-5 5 5 5-5 5 5 5-5" stroke="#fff" stroke-width="2.5"/><path d="M26 80h48M8 66l10 3M92 66l-10 3" stroke-width="2.5"/>`,
    coat: `<path ${f('brown')} d="M34 10l-16 8-10 60 10 2 10-34v46h44V46l10 34 10-2-10-60-16-8-16 14z"/><path d="M34 10l10 26 6-12M66 10l-10 26-6-12" stroke-width="2.5"/>
      <path d="M50 36v56" stroke-width="2"/><path d="M28 62h44" stroke-width="5"/><g fill="${INK}" stroke="none"><circle cx="56" cy="44" r="2.5"/><circle cx="56" cy="74" r="2.5"/></g>`,
    necktie: `<path d="M28 8l14 6M72 8l-14 6"/><path ${f('red')} d="M45 22h10l8 50-13 16-13-16z"/><path d="M47 34l8-6M45 48l12-8M44 62l14-10" stroke="${C.yellow}" stroke-width="3"/>
      <path ${f('red')} d="M40 10h20l-4 12H44z"/>`,
    gloves: `<path ${f('purple')} d="M30 88V68q-12-4-16-16-4-10 4-12 8 0 12 12V30q0-20 20-20t20 20v58z"/><path d="M50 14v22" stroke-width="2.5"/>
      <rect ${f('white')} x="28" y="74" width="44" height="16" rx="3"/><g fill="#fff" stroke="none"><circle cx="44" cy="40" r="3"/><circle cx="58" cy="52" r="3"/><circle cx="42" cy="60" r="3"/></g>`,
    ring: `<ellipse cx="50" cy="62" rx="28" ry="24" stroke="${INK}" stroke-width="14"/><ellipse cx="50" cy="62" rx="28" ry="24" stroke="${C.yellow}" stroke-width="8"/>
      <path ${f('sky')} d="M36 28l6-12h16l6 12-14 16z"/><path d="M36 28h28M44 16l-2 12 8 16M56 16l2 12-8 16" stroke-width="2"/>`,
    belt: `<path d="M6 52q44-18 88 0" stroke="${INK}" stroke-width="19"/><path d="M6 52q44-18 88 0" stroke="${C.brown}" stroke-width="12"/>
      <g fill="${INK}" stroke="none"><circle cx="72" cy="46" r="2.2"/><circle cx="81" cy="49" r="2.2"/></g>
      <rect ${f('yellow')} x="36" y="30" width="26" height="28" rx="4"/><rect fill="${C.brown}" x="43" y="37" width="12" height="14" stroke-width="2.5"/><path d="M42 44h14" stroke-width="2.5"/>`,
    kimono: `<path ${f('rose')} d="M30 12L6 24v28h22v38h44V52h22V24L70 12z"/><path ${f('white')} d="M40 12l10 30 10-30" stroke-width="2.5"/><path d="M50 42L38 90" stroke-width="2.5"/>
      <rect ${f('yellow')} x="28" y="48" width="44" height="12"/><g fill="#fff" stroke="none">${[[16, 36], [82, 36], [40, 74], [60, 80]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3"/>`).join('')}</g>`,
    syringe: `<g transform="rotate(-40 50 50)"><path d="M66 50h22" stroke-width="2.5"/><rect ${f('sky')} x="24" y="40" width="42" height="20" rx="2"/><path d="M32 40v7M40 40v7M48 40v7M56 40v7" stroke-width="2"/>
      <path d="M24 50H8M8 38v24M24 34v32" stroke-width="4"/></g>`,
    suitcase: `<path d="M38 28V16h24v12" stroke-width="5"/><rect ${f('orange')} x="14" y="28" width="72" height="56" rx="8"/><path d="M34 28v56M66 28v56" stroke-width="3"/>
      <circle ${f('dark')} cx="26" cy="88" r="4" stroke-width="2.5"/><circle ${f('dark')} cx="74" cy="88" r="4" stroke-width="2.5"/>`,
    guitar: `<g transform="rotate(32 50 50) translate(6 6) scale(.88)"><path ${f('orange')} d="M50 36c10 0 14 8 12 16 12 4 16 14 12 24-4 10-14 14-24 14s-20-4-24-14c-4-10 0-20 12-24-2-8 2-16 12-16z"/>
      <circle fill="${INK}" cx="50" cy="62" r="6" stroke="none"/><rect ${f('choc')} x="46" y="8" width="8" height="40"/><rect ${f('choc')} x="43" y="0" width="14" height="12" rx="2"/>
      <path d="M48 12v66M52 12v66" stroke-width="1"/><rect ${f('choc')} x="41" y="76" width="18" height="5" stroke-width="2"/></g>`,
    piano: `<path d="M16 74v16M84 74v16" stroke-width="5"/><rect ${f('black')} x="8" y="16" width="84" height="44" rx="4"/><rect ${f('white')} x="36" y="24" width="28" height="18" stroke-width="2.5"/>
      <path d="M40 30h20M40 36h14" stroke-width="1.5"/><rect ${f('white')} x="8" y="56" width="84" height="20"/>
      <path d="M20 56v20M32 56v20M44 56v20M56 56v20M68 56v20M80 56v20" stroke-width="1.5"/>
      <g fill="${INK}" stroke="none">${[17, 29, 53, 65, 77].map(x => `<rect x="${x}" y="56" width="6" height="12"/>`).join('')}</g>`,
    ball: `<circle ${f('white')} cx="50" cy="52" r="38"/><path ${f('red')} d="M50 14A38 38 0 0 0 50 90Q30 52 50 14z" stroke="none"/><path ${f('blue')} d="M50 14A38 38 0 0 1 50 90Q70 52 50 14z" stroke="none"/>
      <path d="M50 14Q30 52 50 90M50 14Q70 52 50 90"/><circle cx="50" cy="52" r="38"/><path d="M30 30q6-6 14-8" stroke="#fff" stroke-width="3.5"/>`,
    flag: `<path d="M20 92V10" stroke-width="5"/><circle ${f('yellow')} cx="20" cy="8" r="4.5"/><path ${f('white')} d="M22 14h62v42H22z"/><circle fill="${C.red}" cx="53" cy="35" r="11" stroke="none"/>`,
    bell: `<path d="M50 14V7" stroke-width="5"/><circle ${f('yellow')} cx="50" cy="82" r="7"/><path ${f('yellow')} d="M50 14c-16 0-24 14-24 30v18l-8 12h64l-8-12V44c0-16-8-30-24-30z"/>
      <path d="M36 40q2-12 10-16" stroke="#fff" stroke-width="3.5"/><path d="M10 40q-4 10 0 20M90 40q4 10 0 20" stroke="${C.orange}" stroke-width="3"/>`,
    tent: `<path d="M4 86h92"/><path ${f('orange')} d="M10 86L50 18l40 68z"/><path ${f('dark')} d="M50 42l-12 44h24z"/><path d="M50 18v24M50 18l-6-10M50 18l6-10" stroke-width="3"/>`,
    pagoda: pagoda(),
    castle: `<path ${f('gray')} d="M12 92l8-24h60l8 24z"/><path d="M24 80h12M48 84h14M66 76h10" stroke-width="2"/>
      <rect ${f('white')} x="26" y="50" width="48" height="18"/><rect ${f('white')} x="34" y="28" width="32" height="16"/><rect ${f('white')} x="42" y="12" width="16" height="10"/>
      <path ${f('navy')} d="M12 54L24 42H76L88 54Z"/><path ${f('navy')} d="M22 32L32 20H68L78 32Z"/><path ${f('navy')} d="M34 14L42 4H58L66 14Z"/>
      <g ${f('dark')} stroke-width="2"><rect x="34" y="57" width="6" height="6"/><rect x="47" y="57" width="6" height="6"/><rect x="60" y="57" width="6" height="6"/><rect x="47" y="34" width="6" height="6"/></g>`,
    shrine: `<rect ${f('red')} x="24" y="24" width="9" height="66"/><rect ${f('red')} x="67" y="24" width="9" height="66"/><rect ${f('red')} x="18" y="36" width="64" height="7"/>
      <path ${f('dark')} d="M6 16q44 10 88 0v9q-44 10-88 0z"/><rect ${f('red')} x="46" y="26" width="8" height="10" stroke-width="2.5"/>`,
    bridge: `<path d="M14 66v14M86 66v14" stroke-width="6"/><path ${f('sky')} d="M2 78h96v12H2z" stroke="none"/><path d="M8 84q6-3 12 0M60 86q6-3 12 0" stroke="#fff" stroke-width="2.5"/>
      <path d="M18 54V40M34 49V35M50 46V32M66 49V35M82 54V40" stroke-width="3"/><path d="M6 48q44-32 88 0" stroke-width="3.5"/>
      <path ${f('red')} d="M6 62q44-32 88 0v8q-44-30-88 0z"/>`,
    trafficlight: `<path d="M50 64v28" stroke-width="6"/><rect ${f('dark')} x="6" y="32" width="88" height="34" rx="10"/>
      <circle ${f('green')} cx="27" cy="49" r="10"/><circle fill="#8a7a3c" cx="50" cy="49" r="10"/><circle fill="#7a3a34" cx="73" cy="49" r="10"/>`,
    tunnel: `<path ${f('green')} d="M4 86q8-62 46-68t46 68z"/><path d="M28 86V62a22 22 0 0 1 44 0v24" stroke="${C.gray}" stroke-width="8"/><path ${f('dark')} d="M32 86V62a18 18 0 0 1 36 0v24z"/>
      <path ${f('silver')} d="M40 86h20l14 8H26z" stroke-width="2.5"/>`,
    truck: `<rect ${f('white')} x="4" y="26" width="58" height="46" rx="2"/><path ${f('blue')} d="M62 38h18l14 18v16H62z"/><path ${f('sky')} d="M68 44h10l8 11H68z" stroke-width="2.5"/>
      ${[20, 44, 80].map(x => `<circle ${f('dark')} cx="${x}" cy="74" r="9"/><circle ${f('silver')} cx="${x}" cy="74" r="3" stroke-width="2"/>`).join('')}`,
    motorbike: `<path d="M22 70l14-18h30l12 18M70 50l-6-16h-8M64 34h12" stroke-width="4"/>
      <circle ${f('dark')} cx="22" cy="70" r="14"/><circle ${f('silver')} cx="22" cy="70" r="5" stroke-width="2.5"/><circle ${f('dark')} cx="78" cy="70" r="14"/><circle ${f('silver')} cx="78" cy="70" r="5" stroke-width="2.5"/>
      <path ${f('red')} d="M36 54q14-14 30-4v8H36z"/><path ${f('black')} d="M26 48h20l-2 8H28z" stroke-width="2.5"/>`,
    rocket: `<g transform="rotate(35 50 50) translate(5 2) scale(.92)"><path ${f('orange')} d="M38 64h24l-12 30z"/><path ${f('yellow')} d="M43 64h14l-7 16z" stroke-width="2"/>
      <path ${f('red')} d="M34 46l-14 18 14 4zM66 46l14 18-14 4z"/><path ${f('white')} d="M50 6c14 12 18 32 16 58H34c-2-26 2-46 16-58z"/>
      <path ${f('red')} d="M50 6c6 5 10 11 12 18H38c2-7 6-13 12-18z"/><circle ${f('sky')} cx="50" cy="38" r="8"/></g>`,
    steamtrain: `<g ${f('silver')} stroke-width="2.5"><circle cx="28" cy="14" r="7"/><circle cx="40" cy="8" r="5"/></g><path ${f('black')} d="M18 40V28h-4v-6h16v6h-4v12z"/>
      <rect ${f('black')} x="10" y="40" width="50" height="26" rx="4"/><rect ${f('red')} x="58" y="24" width="32" height="42" rx="2"/><rect ${f('sky')} x="64" y="30" width="18" height="12" stroke-width="2.5"/>
      <path ${f('red')} d="M10 58l-6 12h10z"/>${[24, 44, 74].map(x => `<circle ${f('red')} cx="${x}" cy="74" r="10"/><circle ${f('dark')} cx="${x}" cy="74" r="3" stroke-width="2"/>`).join('')}`,
    sailboat: `<path d="M50 8v62"/><path ${f('red')} d="M54 12q26 26 26 54H54z"/><path ${f('white')} d="M46 20Q36 44 22 64h24z"/><path ${f('white')} d="M10 70h80l-12 16H22z"/>
      <path d="M6 92q8-4 16 0t16 0 16 0 16 0 16 0" stroke="${C.blue}" stroke-width="3"/>`,
    rowboat: `<path d="M18 40l66 36" stroke-width="3.5"/><path ${f('wood')} d="M74 70l14 8-4 6-14-8z" stroke-width="2.5"/>
      <path ${f('wood')} d="M6 52h88q-6 24-30 24H36Q12 76 6 52z"/><path d="M12 58q38 8 76 0" stroke-width="2.5"/>
      <path d="M4 88q8-4 16 0t16 0 16 0 16 0 16 0" stroke="${C.blue}" stroke-width="3"/>`,
    crown: `<path ${f('yellow')} d="M12 76V30l20 20 18-28 18 28 20-20v46z"/><rect ${f('yellow')} x="12" y="70" width="76" height="14"/>
      <circle ${f('red')} cx="50" cy="77" r="4" stroke-width="2"/><circle ${f('blue')} cx="30" cy="77" r="3.5" stroke-width="2"/><circle ${f('blue')} cx="70" cy="77" r="3.5" stroke-width="2"/>
      <g ${f('white')} stroke-width="2"><circle cx="12" cy="28" r="4"/><circle cx="50" cy="20" r="4"/><circle cx="88" cy="28" r="4"/></g>`,

    // animals
    monkey: `<circle ${f('brown')} cx="18" cy="50" r="12"/><circle ${f('skin')} cx="18" cy="50" r="6" stroke-width="2.5"/><circle ${f('brown')} cx="82" cy="50" r="12"/><circle ${f('skin')} cx="82" cy="50" r="6" stroke-width="2.5"/>
      <circle ${f('brown')} cx="50" cy="50" r="32"/><path ${f('skin')} d="M50 38c-10-10-26-4-24 10 0 6-4 14 2 22 6 8 16 10 22 10s16-2 22-10c6-8 2-16 2-22 2-14-14-20-24-10z"/>
      ${head(41, 50)}<g fill="${INK}" stroke="none"><circle cx="46" cy="64" r="1.6"/><circle cx="54" cy="64" r="1.6"/></g><path d="M42 72q8 5 16 0" stroke-width="2.5"/>`,
    rabbit: `<g ${f('white')}><ellipse cx="36" cy="26" rx="9" ry="22" transform="rotate(-10 36 26)"/><ellipse cx="64" cy="26" rx="9" ry="22" transform="rotate(10 64 26)"/></g>
      <g fill="${C.pink}" stroke="none"><ellipse cx="36" cy="28" rx="4" ry="15" transform="rotate(-10 36 28)"/><ellipse cx="64" cy="28" rx="4" ry="15" transform="rotate(10 64 28)"/></g>
      <ellipse ${f('white')} cx="50" cy="64" rx="28" ry="25"/>${head(40, 60)}<path ${f('pink')} d="M46 68h8l-4 5z" stroke-width="2"/><path d="M50 73v4M44 78q6 3 12 0" stroke-width="2"/>
      <g fill="${C.pink}" stroke="none" opacity=".6"><circle cx="32" cy="70" r="4"/><circle cx="68" cy="70" r="4"/></g>`,
    horse: `<path ${f('brown')} d="M30 24l4-16 10 12zM70 24l-4-16-10 12z"/><path ${f('brown')} d="M34 18q16-8 32 0l6 40q0 30-22 30T28 58z"/>
      <path ${f('choc')} d="M40 16q10-12 20 0-4 12-10 18-6-6-10-18z"/><ellipse ${f('beige')} cx="50" cy="74" rx="17" ry="13"/>
      ${head(38, 46)}<g fill="${INK}" stroke="none"><ellipse cx="44" cy="76" rx="2" ry="3"/><ellipse cx="56" cy="76" rx="2" ry="3"/></g>`,
    cow: `<path ${f('cream')} d="M32 28l-8-14 14 8zM68 28l8-14-14 8z"/><g ${f('white')}><ellipse cx="18" cy="42" rx="12" ry="7"/><ellipse cx="82" cy="42" rx="12" ry="7"/></g>
      <ellipse ${f('white')} cx="50" cy="48" rx="28" ry="26"/><path fill="${C.black}" stroke="none" d="M56 26q16 0 20 16-12 4-20-4z"/><ellipse ${f('pink')} cx="50" cy="70" rx="22" ry="14"/>
      ${head(40, 48)}<g fill="${INK}" stroke="none"><ellipse cx="42" cy="70" rx="3" ry="4"/><ellipse cx="58" cy="70" rx="3" ry="4"/></g>`,
    elephant: `<g ${f('gray')}><ellipse cx="20" cy="46" rx="18" ry="25"/><ellipse cx="80" cy="46" rx="18" ry="25"/></g><g fill="${C.pink}" stroke="none" opacity=".5"><ellipse cx="20" cy="46" rx="10" ry="16"/><ellipse cx="80" cy="46" rx="10" ry="16"/></g>
      <circle ${f('gray')} cx="50" cy="44" r="25"/><path ${f('white')} d="M36 60q-6 10 0 16l4-14zM64 60q6 10 0 16l-4-14z" stroke-width="2.5"/>
      <path ${f('gray')} d="M42 54v24q0 12 12 12 8 0 8-8h-5q-1 3-3 3-5 0-5-7V54z"/>${head(40, 40)}`,
    tiger: `<circle ${f('orange')} cx="24" cy="26" r="11"/><circle ${f('orange')} cx="76" cy="26" r="11"/><circle ${f('orange')} cx="50" cy="54" r="34"/>
      <path d="M50 20v12M40 22l3 9M60 22l-3 9M16 50h10M74 50h10M18 62h9M73 62h9" stroke-width="4"/>
      <ellipse ${f('white')} cx="50" cy="68" rx="19" ry="13"/>${head(38, 48)}<path fill="${INK}" d="M44 58h12l-6 7z" stroke-width="2"/><path d="M50 65v5M42 72q8 4 16 0" stroke-width="2.5"/>`,
    mouse: `<circle ${f('gray')} cx="24" cy="32" r="18"/><circle ${f('pink')} cx="24" cy="32" r="10" stroke-width="2.5"/><circle ${f('gray')} cx="76" cy="32" r="18"/><circle ${f('pink')} cx="76" cy="32" r="10" stroke-width="2.5"/>
      <ellipse ${f('gray')} cx="50" cy="60" rx="27" ry="25"/>${head(40, 56)}<circle ${f('pink')} cx="50" cy="68" r="4" stroke-width="2"/>
      <path d="M40 70H18M40 74l-20 5M60 70h22M60 74l20 5" stroke-width="2"/>`,
    mosquito: `<g fill="${C.sky}" stroke-width="2.5" opacity=".9"><ellipse cx="36" cy="30" rx="10" ry="20" transform="rotate(-35 36 30)"/><ellipse cx="58" cy="26" rx="10" ry="20" transform="rotate(25 58 26)"/></g>
      <path d="M44 52L24 70l-6 20M50 54l-6 22-2 16M56 52l12 20 4 18M38 46L18 52 6 66" stroke-width="2.5"/>
      <ellipse ${f('dark')} cx="58" cy="48" rx="22" ry="7" transform="rotate(20 58 48)"/><circle ${f('dark')} cx="34" cy="40" r="7"/><path d="M28 40L8 32" stroke-width="2.5"/>`,
    shell: `<path ${f('pink')} d="M40 80h20l-2 10H42z"/><path ${f('pink')} d="M50 84L12 46q-2-32 38-34 40 2 38 34z"/>
      <path d="M50 84L24 22M50 84L38 13M50 84V12M50 84l12-71M50 84l26-62" stroke-width="2.5"/>`,
    ladybug: `<path d="M30 40l-16-6M28 56H10M32 72l-14 10M70 40l16-6M72 56h18M68 72l14 10M42 20l-6-12M58 20l6-12" stroke-width="3"/>
      <circle fill="${C.black}" cx="50" cy="28" r="14"/><ellipse ${f('red')} cx="50" cy="58" rx="30" ry="32"/><path d="M50 28v62" stroke-width="3"/>
      <g fill="${INK}" stroke="none"><circle cx="36" cy="48" r="5"/><circle cx="64" cy="48" r="5"/><circle cx="34" cy="70" r="5"/><circle cx="66" cy="70" r="5"/></g>`,
    baby: `<path ${f('sky')} d="M24 64q26-10 52 0l-4 28H28z"/><path d="M36 74h28" stroke="#fff" stroke-width="3"/><circle ${f('skin')} cx="50" cy="40" r="25"/>
      <path d="M46 16q4-10 12-6" stroke-width="3"/><path d="M36 40q4 3 8 0M56 40q4 3 8 0" stroke-width="2.5"/><g fill="${C.pink}" stroke="none" opacity=".7"><circle cx="34" cy="48" r="4.5"/><circle cx="66" cy="48" r="4.5"/></g>
      <circle ${f('pink')} cx="50" cy="54" r="5.5" stroke-width="2.5"/>`,

    // the body
    face: FACE,
    eye: `${FACE}${ring(38, 52, 10)}`,
    ear: `${FACE}${ring(84, 56, 11)}`,
    nose: `${FACE}${ring(50, 59, 10)}`,
    mouth: `${FACE}${ring(50, 74, 13)}`,
    head: `${FACE}<path d="M92 4L70 18" stroke="${C.red}" stroke-width="5"/><path fill="${C.red}" stroke="none" d="M62 24l4-14 10 8z"/>`,
    tooth: `<path ${f('white')} d="M22 28q0-16 16-16 6 0 12 4 6-4 12-4 16 0 16 16 0 14-6 24-2 8-4 30-2 10-9 0l-6-22q-3-5-6 0l-6 22q-7 10-9 0-2-22-4-30-6-10-6-24z"/><path d="M32 26q2-6 8-6" stroke="${C.sky}" stroke-width="3.5"/>`,
    hand: `<path ${f('skin')} d="M30 90V58l-12-16q-4-8 4-10 6-2 10 6l8 10V18q0-6 6-6t6 6v26-30q0-6 6-6t6 6v30-24q0-6 6-6t6 6v28-16q0-6 6-6t6 6v32q0 20-18 26z"/>`,
    foot: `<path ${f('skin')} d="M40 92c-12 0-16-10-14-24 2-12 0-22 4-32 4-10 22-12 28-2 6 10 2 22 6 32 6 14 2 26-12 26z"/>
      <g ${f('skin')} stroke-width="3"><circle cx="32" cy="22" r="7"/><circle cx="45" cy="15" r="6"/><circle cx="57" cy="14" r="5"/><circle cx="67" cy="18" r="4.5"/><circle cx="74" cy="25" r="4"/></g>`,
    heart: `<path ${f('red')} d="M50 88C20 66 10 50 12 34c2-14 16-22 28-16 6 3 9 8 10 12 1-4 4-9 10-12 12-6 26 2 28 16 2 16-8 32-38 54z"/><path d="M24 34q2-8 10-8" stroke="#fff" stroke-width="4"/>`,
    bone: solid(`<circle cx="22" cy="64" r="10"/><circle cx="30" cy="78" r="10"/><circle cx="70" cy="22" r="10"/><circle cx="78" cy="36" r="10"/><path d="M28 70L72 30" stroke-width="14"/>`, 'white'),

    // colours, places
    'swatch-red': swatch('red'), 'swatch-blue': swatch('blue'), 'swatch-yellow': swatch('yellow'), 'swatch-white': swatch('white'),
    'swatch-black': swatch('black'), 'swatch-green': swatch('green'), 'swatch-brown': swatch('brown'),
    above: `${TABLE}${BALL(50, 30)}`,
    below: `${TABLE}${BALL(50, 76)}`,
    inside: `<path ${f('choc')} d="M20 46l12-14h36l12 14z"/>${BALL(50, 42)}<path ${f('wood')} d="M20 46h60v42H20z"/>
      <path ${f('wood')} d="M20 46L8 34M80 46l12-12" stroke-width="4"/><path d="M34 60h32" stroke-width="2.5"/>`,
    'turn-right': turnSign(false),
    'turn-left': turnSign(true),
  });

  // icon('cat') or icon({ name: 'umbrella', color: 'red', pattern: 'dots' }):
  // color swaps the object's main colour (its first fill), so "the red
  // umbrella" or "the black cat" can be drawn from one shape.
  function icon(spec) {
    const name = typeof spec === 'string' ? spec : spec.name;
    let inner = ICONS[name] || '';
    if (spec.color) inner = inner.replace(/fill="[^"]+"/, `fill="${col(spec.color)}"`);
    if (spec.pattern === 'dots') inner += `<g fill="#fff" stroke="none" opacity=".9"><circle cx="30" cy="38" r="3.5"/><circle cx="50" cy="26" r="3.5"/><circle cx="70" cy="38" r="3.5"/><circle cx="40" cy="47" r="3"/><circle cx="60" cy="47" r="3"/></g>`;
    if (spec.pattern === 'stripes') inner += `<g stroke="#fff" stroke-width="4" opacity=".9"><path d="M30 42l6-24M46 48l4-34M62 48l0-34M76 44l-4-24"/></g>`;
    if (spec.big) inner = `<g transform="translate(-10 -10) scale(1.2)">${inner}</g>`;
    if (spec.small) inner = `<g transform="translate(22 30) scale(.56)">${inner}</g>`;
    return svg(inner);
  }

  // ─── People ────────────────────────────────────────────────────────────────

  // One person, front on, in a 100×150 box:
  //   hair       'short' | 'spiky' | 'long' | 'bob' | 'ponytail' | 'bun' | 'bald'
  //   hairColor  a colour (default dark brown; `old` people get gray)
  //   top        'shirt' | 'tshirt' | 'sweater' | 'jacket' | 'suit' | 'dress' |
  //              'coat' | 'apron' | 'sailor' | 'whitecoat' | 'vest'
  //   topColor, bottom ('trousers' | 'skirt' | 'shorts'), bottomColor
  //   under      colour of a dress showing below a coat
  //   pose       'down' | 'wave' | 'hold' | 'point'
  //   glasses, hat, cap, tie, bowtie, bag, backpack, scarf, mustache: true
  //   hatColor, scarfColor, backpackColor, child (drawn smaller), old
  function personBody(p) {
    const hairColor = col(p.hairColor || (p.old ? 'gray' : 'hair'));
    const top = col(p.topColor || { suit: 'navy', coat: 'dark', dress: 'white', whitecoat: 'white', sailor: 'white', vest: 'white', jacket: 'blue', apron: 'sky' }[p.top] || 'blue');
    const bottom = col(p.bottomColor || ({ suit: 'navy', sailor: 'navy', vest: 'black' }[p.top] || 'dark'));
    const hand = (x, y) => `<circle ${f('skin')} cx="${x}" cy="${y}" r="5.5" stroke-width="3"/>`;
    const parts = [];

    // hair behind the head, backpack
    if (p.hair === 'long') parts.push(`<path fill="${hairColor}" d="M26 44q0-30 24-30t24 30l3 34q-27 8-54 0z"/>`);
    if (p.hair === 'bob') parts.push(`<path fill="${hairColor}" d="M25 44q0-30 25-30t25 30v18q-25 6-50 0z"/>`);
    if (p.hair === 'ponytail') parts.push(`<path fill="${hairColor}" d="M68 30q16 4 12 30-4 10-8 4 4-18-8-26z"/>`);
    if (p.backpack) parts.push(`<rect ${f(p.backpackColor || 'red')} x="24" y="66" width="52" height="40" rx="10"/>`);

    // legs and shoes
    const longTop = ['dress', 'coat', 'whitecoat'].includes(p.top);
    if (p.top === 'coat' && p.under) parts.push(`<path fill="${col(p.under)}" d="M30 118h40l4 12H26z"/>`);
    if (!longTop && p.bottom === 'skirt') {
      parts.push(tube('M43 114V138', 'skin', 6) + tube('M57 114V138', 'skin', 6));
      parts.push(`<path fill="${bottom}" d="M33 104h34l6 20H27z"/>`);
    } else if (!longTop && p.bottom === 'shorts') {
      parts.push(tube('M43 118V138', 'skin', 7) + tube('M57 118V138', 'skin', 7));
      parts.push(`<path fill="${bottom}" d="M33 104h34l2 18H54l-4-8-4 8H31z"/>`);
    } else if (!longTop) {
      parts.push(tube('M43 110V138', bottom, 10) + tube('M57 110V138', bottom, 10));
    } else {
      const leg = p.top === 'coat' && !p.under ? bottom : 'skin';
      parts.push(tube('M43 120V138', leg, 6) + tube('M57 120V138', leg, 6));
    }
    parts.push(`<path ${f('black')} d="M34 137h12q3 0 3 5v2H33q-3 0-3-3 0-4 4-4zM54 137h12q4 0 4 4 0 3-3 3H51v-2q0-5 3-5z" stroke-width="2.5"/>`);

    // arms: behind the body unless they hold something in front
    const arm = {
      down: [[25, 104], [75, 104]],
      wave: [[25, 104], [84, 42]],
      hold: [[44, 94], [56, 94]],
      point: [[25, 104], [95, 74]],
    }[p.pose || 'down'];
    const sleeve = p.top === 'tshirt' ? 'skin' : top;
    const drawArms = () => {
      const [l, r] = arm;
      const toL = p.pose === 'hold' ? `Q22 88 ${l[0]} ${l[1]}` : `L${l[0]} ${l[1]}`;
      const toR = p.pose === 'hold' ? `Q78 88 ${r[0]} ${r[1]}` : p.pose === 'wave' ? `Q84 62 ${r[0]} ${r[1]}` : `L${r[0]} ${r[1]}`;
      return tube(`M32 70${toL}`, sleeve, 9) + tube(`M68 70${toR}`, sleeve, 9)
        + (p.top === 'tshirt' ? tube('M32 70l-2 8', top, 10) + tube(p.pose === 'wave' ? 'M68 70l4 -6' : 'M68 70l2 8', top, 10) : '')
        + hand(l[0], l[1]) + hand(r[0], r[1]);
    };
    // body
    if (p.top === 'dress') parts.push(`<path fill="${top}" d="M36 64h28l14 58H22z"/>`);
    else if (p.top === 'coat' || p.top === 'whitecoat') parts.push(`<path fill="${top}" d="M32 64h36l6 58H26z"/><path d="M50 66v56" stroke-width="2.5"/>`
      + (p.top === 'coat' ? `<g fill="${INK}" stroke="none"><circle cx="55" cy="84" r="2"/><circle cx="55" cy="100" r="2"/></g>` : '<path d="M58 92h8" stroke-width="2.5"/>'));
    else parts.push(`<path fill="${top}" d="M33 64h34q4 0 4 8l-2 38H31l-2-38q0-8 4-8z"/>`);
    if (p.top === 'sweater') parts.push('<path d="M32 102h36" stroke-width="2.5"/><path d="M42 64q8 7 16 0" stroke-width="2.5"/>');
    if (p.top === 'shirt' || p.top === 'vest' || p.top === 'whitecoat') parts.push(`<path ${f('white')} d="M42 64l8 8 8-8z" stroke-width="2.5"/>`);
    if (p.top === 'jacket') parts.push(`<path ${f('white')} d="M44 64h12v44H44z" stroke-width="2.5"/><path d="M44 64l-4 18M56 64l4 18" stroke-width="2.5"/>`);
    if (p.top === 'suit') parts.push(`<path ${f('white')} d="M43 64l7 18 7-18z" stroke-width="2.5"/><path d="M43 64l-3 20 10-2M57 64l3 20-10-2" stroke-width="2.5"/>`);
    if (p.top === 'vest') parts.push(`<path ${f('black')} d="M33 65h8l7 14v29H31l-2-36q0-7 4-7zM67 65h-8l-7 14v29h17l2-36q0-7-4-7z" stroke-width="2.5"/><g fill="#fff" stroke="none"><circle cx="50" cy="88" r="1.6"/><circle cx="50" cy="98" r="1.6"/></g>`);
    if (p.top === 'sailor') parts.push(`<path ${f('navy')} d="M33 64h34l-6 16H39z" stroke-width="2.5"/><path ${f('red')} d="M44 76l6 8 6-8z" stroke-width="2"/>`);
    if (p.top === 'apron') parts.push(`<path ${f('white')} d="M38 74h24l3 34H35z"/><path d="M38 74l-3-10M62 74l3-10" stroke-width="2.5"/>`);
    if (p.tie || p.top === 'suit') parts.push(`<path ${f('red')} d="M48 66h4l2 18-4 5-4-5z" stroke-width="2"/>`);
    if (p.bowtie) parts.push(`<path ${f(INK)} d="M42 64l8 4 8-4v9l-8-4-8 4z" stroke-width="1.5"/>`);
    if (p.scarf) parts.push(`<path ${f(p.scarfColor || 'red')} d="M36 62h28v8H36zM56 68h7v18h-7z" stroke-width="2.5"/>`);
    if (p.bag) parts.push(`<path d="M36 66l34 34" stroke="${C.brown}" stroke-width="3"/><rect ${f('brown')} x="66" y="96" width="18" height="15" rx="4"/>`);
    if (p.backpack) parts.push(`<path d="M36 66v24M64 66v24" stroke="${C.dark}" stroke-width="4"/>`);
    parts.push(drawArms());

    // neck, ears and head
    parts.push(`<rect ${f('skin')} x="44" y="56" width="12" height="10" rx="3" stroke-width="3"/>`);
    parts.push(`<circle ${f('skin')} cx="28" cy="40" r="4.5" stroke-width="2.5"/><circle ${f('skin')} cx="72" cy="40" r="4.5" stroke-width="2.5"/>`);
    parts.push(`<circle ${f('skin')} cx="50" cy="38" r="22"/>`);

    // hair in front
    const H = hairColor;
    if (p.hair === 'short' || p.hair === 'ponytail') parts.push(`<path fill="${H}" d="M28 40q-2-26 22-26t22 26q-6-12-22-12-10 0-14 4-4 4-8 8z"/>`);
    else if (p.hair === 'spiky') parts.push(`<path fill="${H}" d="M28 38l-2-14 8 4 2-12 8 8 6-12 6 12 8-8 2 12 8-4-2 14q-8-10-22-10t-22 10z"/>`);
    else if (p.hair === 'long' || p.hair === 'bob') parts.push(`<path fill="${H}" d="M28 40q0-26 22-26t22 26q-10-10-22-12-6 8-22 12z"/>`);
    else if (p.hair === 'bun') parts.push(`<circle fill="${H}" cx="50" cy="13" r="9"/><path fill="${H}" d="M28 40q0-26 22-26t22 26q-4-12-22-12t-22 12z"/>`);
    else if (p.hair === 'bald') parts.push(`<path fill="${H}" d="M28 44q-2-12 4-16 2 8 0 16zM72 44q2-12-4-16-2 8 0 16z" stroke-width="2.5"/>`);

    // face
    if (p.old) parts.push('<path d="M38 31q4-2 7 0M55 31q4-2 7 0" stroke-width="2"/>');
    parts.push(`<g fill="${INK}" stroke="none"><ellipse cx="42" cy="40" rx="2.4" ry="3"/><ellipse cx="58" cy="40" rx="2.4" ry="3"/></g>`);
    parts.push('<path d="M44 49q6 5 12 0" stroke-width="2.5"/>');
    parts.push(`<g fill="${C.pink}" stroke="none" opacity=".7"><ellipse cx="35" cy="47" rx="4" ry="2.5"/><ellipse cx="65" cy="47" rx="4" ry="2.5"/></g>`);
    if (p.mustache) parts.push(`<path fill="${H}" d="M42 46q8-5 16 0-8 3-16 0z" stroke-width="2"/>`);
    if (p.glasses) parts.push('<g stroke-width="2.5"><circle cx="42" cy="40" r="6.5"/><circle cx="58" cy="40" r="6.5"/><path d="M48.5 40h3M35.5 39l-8-2M64.5 39l8-2"/></g>');
    if (p.hat) parts.push(`<path ${f(p.hatColor || 'red')} d="M34 26q0-20 16-20t16 20z"/><ellipse ${f(p.hatColor || 'red')} cx="50" cy="26" rx="27" ry="5.5"/>`);
    if (p.cap) parts.push(`<path ${f(p.hatColor || 'blue')} d="M30 30q0-18 20-18t20 18z"/><path ${f(p.hatColor || 'blue')} d="M60 28q16 0 22 6H56z"/>`);
    return parts.join('');
  }

  function person(p) {
    const scale = p.child ? 0.78 : 1;
    const inner = scale === 1 ? personBody(p) : `<g transform="translate(${50 - 50 * scale} ${150 - 150 * scale}) scale(${scale})">${personBody(p)}</g>`;
    return svg(inner, '0 0 100 150', 'lis-art-person');
  }

  // ─── Built pictures ────────────────────────────────────────────────────────

  function items(p) {
    const list = [];
    p.items.forEach(entry => {
      const [spec, n] = Array.isArray(entry) ? entry : [entry, 1];
      for (let i = 0; i < n; i++) list.push(spec);
    });
    const size = list.length === 1 ? 'lis-art-xl' : list.length === 2 ? 'lis-art-lg' : list.length <= 4 ? 'lis-art-md' : list.length <= 6 ? 'lis-art-sm' : 'lis-art-xs';
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
    return svg(`<circle ${f('white')} cx="50" cy="50" r="45" stroke-width="5"/>${ticks.join('')}
      <path d="M50 50L${(50 + 22 * Math.sin(ha)).toFixed(1)} ${(50 - 22 * Math.cos(ha)).toFixed(1)}" stroke-width="6"/>
      <path d="M50 50L${(50 + 33 * Math.sin(ma)).toFixed(1)} ${(50 - 33 * Math.cos(ma)).toFixed(1)}" stroke-width="3.5"/>
      <circle ${f('red')} cx="50" cy="50" r="4" stroke-width="2"/>`, '0 0 100 100', 'lis-art-clock');
  }

  // A digital clock: for times like 7:40 that read more clearly so.
  function digital(p) {
    return `<div class="lis-art-digital">${p.h}:${String(p.m).padStart(2, '0')}</div>`;
  }

  // Three weeks of a month. `start`: weekday of the 1st (0 = 日; default 6,
  // so the 8th and 15th are Saturdays). `mark` is circled.
  const DAYS = ['日', '月', '火', '水', '木', '金', '土'];
  const dayColor = i => (i === 0 ? C.red : i === 6 ? C.blue : INK);
  function calendar(p) {
    const startDow = p.start == null ? 6 : p.start;
    const first = (7 - startDow) % 7 + 1; // the first Sunday of the month
    const month = p.month ? `<text x="73" y="-3" class="lis-art-text lis-art-bold" fill="${INK}" stroke="none">${p.month}月</text>` : '';
    const cells = DAYS.map((d, i) =>
      `<text x="${13 + i * 20}" y="17" fill="${dayColor(i)}" stroke="none" class="lis-art-text lis-art-bold">${d}</text>`);
    const base = p.mark > first + 20 ? first + 7 : first;
    for (let k = 0; k < 21; k++) {
      const n = base + k;
      const i = k % 7;
      const x = 13 + i * 20;
      const y = 40 + Math.floor(k / 7) * 20;
      if (n === p.mark) cells.push(`<circle cx="${x}" cy="${y - 4.5}" r="9" stroke="${C.red}" stroke-width="2.5"/>`);
      cells.push(`<text x="${x}" y="${y}" fill="${dayColor(i)}" stroke="none" class="lis-art-text">${n}</text>`);
    }
    return svg(`${month}<rect ${f('white')} x="2" y="2" width="142" height="80" rx="6" stroke-width="2.5"/>
      <path d="M2 24h142" stroke-width="2"/>${cells.join('')}`, p.month ? '0 -16 146 100' : '0 0 146 84', 'lis-art-wide');
  }

  // A week strip with the given days (0 = 日) circled.
  function week(p) {
    const cells = DAYS.map((d, i) => {
      const x = 12 + i * 20;
      const on = p.days.includes(i);
      return (on ? `<circle cx="${x}" cy="24" r="9.5" fill="${C.yellow}" stroke="${INK}" stroke-width="2.5"/>` : '')
        + `<text x="${x}" y="29" fill="${dayColor(i)}" stroke="none" class="lis-art-text lis-art-bold">${d}</text>`;
    });
    return svg(`<rect ${f('white')} x="1.5" y="8" width="141" height="32" rx="6" stroke-width="2.5"/>${cells.join('')}`, '0 0 144 48', 'lis-art-wide');
  }

  function weather(p) {
    return `<div class="lis-art-weather">
      <div>${icon(p.am)}<span lang="ja">${p.amLabel || '午前'}</span></div>
      <span class="lis-art-then" aria-hidden="true">→</span>
      <div>${icon(p.pm)}<span lang="ja">${p.pmLabel || '午後'}</span></div>
    </div>`;
  }

  // A street from above: a landmark in the middle of the far side (the
  // bank, unless `label` says otherwise) and the spot asked about starred.
  const MAP_SPOTS = { left: [6, 6], right: [110, 6], front: [58, 78], corner: [110, 78], 'front-left': [6, 78] };
  function map(p) {
    const label = p.label || '銀行';
    const blocks = [[6, 6], [58, 6], [110, 6], [6, 78], [58, 78], [110, 78]].map(([x, y]) => {
      const mid = x === 58 && y === 6;
      const mark = MAP_SPOTS[p.at][0] === x && MAP_SPOTS[p.at][1] === y;
      return `<rect x="${x}" y="${y}" width="44" height="34" rx="4" fill="${mark ? C.yellow : mid ? C.sky : C.white}" stroke-width="2.5"/>`
        + (mid ? `<text x="${x + 22}" y="${y + 22}" class="lis-art-text lis-art-bold" fill="${INK}" stroke="none">${label}</text>` : '')
        + (mark ? `<text x="${x + 22}" y="${y + 27}" class="lis-art-star" fill="${C.red}" stroke="none">★</text>` : '');
    });
    return svg(`<rect x="0" y="45" width="160" height="28" fill="${C.gray}" stroke="none"/>
      <path d="M4 59h152" stroke="${C.white}" stroke-width="3" stroke-dasharray="8 7"/>${blocks.join('')}`, '0 0 160 118', 'lis-art-wide');
  }

  // A route on a grid of streets from the station at the bottom: `turns` is
  // a list of 'up' | 'left' | 'right' moves of one block, the end starred.
  function route(p) {
    let x = 80, y = 104;
    const pts = [[x, y]];
    const step = { up: [0, -30], left: [-36, 0], right: [36, 0] };
    p.turns.forEach(t => { x += step[t][0]; y += step[t][1]; pts.push([x, y]); });
    const grid = [];
    for (let gx = 8; gx <= 152; gx += 36) grid.push(`<path d="M${gx} 12V104" stroke="${C.silver}" stroke-width="10"/>`);
    for (let gy = 14; gy <= 104; gy += 30) grid.push(`<path d="M8 ${gy}H152" stroke="${C.silver}" stroke-width="10"/>`);
    return svg(`<rect ${f('grass')} x="0" y="0" width="160" height="120" stroke="none"/>${grid.join('')}
      <rect ${f('white')} x="62" y="106" width="36" height="12" rx="2" stroke-width="2"/><text x="80" y="116" class="lis-art-text lis-art-bold" fill="${INK}" stroke="none">駅</text>
      <path d="M${pts.map(q => q.join(' ')).join('L')}" stroke="${C.red}" stroke-width="5" stroke-dasharray="1 9"/>
      <circle cx="${x}" cy="${y}" r="9" fill="${C.yellow}" stroke="${C.red}" stroke-width="3"/><text x="${x}" y="${y + 4}" class="lis-art-star lis-art-star-sm" fill="${C.red}" stroke="none">★</text>`, '0 0 160 120', 'lis-art-wide');
  }

  // A building with one floor marked.
  function floor(p) {
    const rows = [];
    const n = p.floors || 6;
    for (let k = 1; k <= n; k++) {
      const y = 112 - k * 16;
      const on = k === p.floor;
      rows.push(`<rect x="22" y="${y}" width="56" height="16" fill="${on ? C.yellow : C.white}" stroke-width="2.5"/>`
        + `<text x="36" y="${y + 12}" class="lis-art-text lis-art-bold" fill="${INK}" stroke="none">${k}F</text>`
        + (on ? `<text x="62" y="${y + 13}" class="lis-art-star" fill="${C.red}" stroke="none">★</text>` : `<rect x="54" y="${y + 4}" width="16" height="8" fill="${C.sky}" stroke-width="2"/>`));
    }
    const roof = 112 - n * 16;
    return svg(`<path ${f('gray')} d="M18 ${roof}h64v-6H18z"/>${rows.join('')}<path d="M10 112h80"/>`, `0 ${roof - 10} 100 ${128 - roof}`);
  }

  // A room seen from the front: door, window and a bookshelf; the starred
  // spot is where something goes.
  const ROOM_SPOTS = { window: 90, 'shelf-left': 112, 'shelf-right': 168, door: 40 };
  function room(p) {
    const x = ROOM_SPOTS[p.at];
    return svg(`<rect ${f('cream')} x="2" y="2" width="196" height="116" rx="4" stroke-width="2.5"/>
      <rect ${f('floor')} x="2" y="96" width="196" height="22" stroke="none"/><path d="M2 96h196" stroke-width="2.5"/>
      <rect ${f('brown')} x="12" y="30" width="30" height="66"/><circle ${f('yellow')} cx="36" cy="64" r="2.5" stroke-width="2"/>
      <rect ${f('sky')} x="62" y="20" width="56" height="44"/><path d="M90 20v44M62 42h56" stroke-width="2.5"/>
      <rect ${f('wood')} x="128" y="36" width="28" height="60"/><path d="M128 56h28M128 76h28" stroke-width="2.5"/>
      <g stroke="none"><rect x="132" y="42" width="5" height="13" fill="${C.red}"/><rect x="139" y="44" width="5" height="11" fill="${C.blue}"/><rect x="146" y="41" width="5" height="14" fill="${C.green}"/>
      <rect x="132" y="62" width="5" height="13" fill="${C.yellow}"/><rect x="140" y="63" width="5" height="12" fill="${C.pink}"/></g>
      <circle cx="${x}" cy="102" r="13" fill="${C.yellow}" stroke="${C.red}" stroke-width="3"/>
      <text x="${x}" y="108" class="lis-art-star" fill="${C.red}" stroke="none">★</text>`, '0 0 200 120', 'lis-art-wide');
  }

  // A desk, a chair, a bag and a wall shelf, with the thing (default: a key)
  // in one of them.
  const KEY_SPOTS = { desk: [100, 38], chair: [147, 96], bag: [31, 98], shelf: [42, 14] };
  function keyScene(p) {
    const [kx, ky] = KEY_SPOTS[p.at];
    return svg(`<path d="M2 110h196" stroke-width="2.5"/>
      <rect ${f('wood')} x="66" y="50" width="88" height="10"/><path d="M74 60v50M146 60v50" stroke-width="5"/>
      <path ${f('brown')} d="M132 76h30v8h-30zM136 84v26M158 84v26M158 76V46h6v38"/>
      <path ${f('pink')} d="M14 86h34l-3 24H17z"/><path d="M22 86q9-12 18 0"/>
      <path ${f('wood')} d="M16 26h52v-6H16z"/><path d="M22 26l6 8M62 26l-6 8" stroke-width="2.5"/>
      <g transform="translate(${kx - 17} ${ky - 13}) scale(.36)">${ICONS[p.thing || 'key']}</g>
      <circle cx="${kx}" cy="${ky}" r="20" stroke="${C.red}" stroke-width="3" stroke-dasharray="5 5"/>`, '0 0 200 116', 'lis-art-wide');
  }

  // Cinema seats, five rows of six, with one seat starred.
  function seats(p) {
    const cells = [`<rect ${f('dark')} x="20" y="4" width="120" height="14" rx="3"/><text x="80" y="15" class="lis-art-text" fill="${C.white}" stroke="none">スクリーン</text>`];
    'ABCDE'.split('').forEach((r, ri) => {
      cells.push(`<text x="9" y="${38 + ri * 18}" class="lis-art-text lis-art-bold" fill="${INK}" stroke="none">${r}</text>`);
      for (let c = 1; c <= 6; c++) {
        const x = 22 + (c - 1) * 21 + (c > 3 ? 6 : 0);
        const on = p.row === r && p.seat === c;
        cells.push(`<rect x="${x}" y="${26 + ri * 18}" width="16" height="14" rx="3" fill="${on ? C.yellow : C.pink}" stroke-width="2"/>`
          + (on ? `<text x="${x + 8}" y="${38 + ri * 18}" class="lis-art-star lis-art-star-sm" fill="${C.red}" stroke="none">★</text>` : ''));
      }
    });
    for (let c = 1; c <= 6; c++) cells.push(`<text x="${22 + (c - 1) * 21 + (c > 3 ? 6 : 0) + 8}" y="126" class="lis-art-text" fill="${INK}" stroke="none">${c}</text>`);
    return svg(cells.join(''), '0 0 160 130', 'lis-art-wide');
  }

  function people(p) {
    return `<div class="lis-art-items ${p.n > 6 ? 'lis-art-xs' : p.n > 4 ? 'lis-art-sm' : 'lis-art-md'}">${Array.from({ length: p.n }, () => icon('person')).join('')}</div>`;
  }

  // A bus front with its route number.
  function bus(p) {
    return svg(`<rect ${f(p.color || 'green')} x="8" y="18" width="84" height="58" rx="10"/><rect ${f('white')} x="20" y="24" width="60" height="18" rx="3"/>
      <text x="50" y="39" class="lis-art-num" fill="${INK}" stroke="none">${p.num}</text>
      <rect ${f('sky')} x="16" y="48" width="68" height="16" rx="3"/><path d="M50 48v16" stroke-width="2.5"/>
      <circle ${f('yellow')} cx="20" cy="70" r="3" stroke-width="2"/><circle ${f('yellow')} cx="80" cy="70" r="3" stroke-width="2"/>
      <rect ${f('dark')} x="16" y="76" width="12" height="10" rx="2"/><rect ${f('dark')} x="72" y="76" width="12" height="10" rx="2"/>`);
  }

  // A station platform sign with its 番線 number.
  function platform(p) {
    return svg(`<path d="M30 70v24M70 70v24" stroke-width="5"/><rect ${f('white')} x="8" y="20" width="84" height="50" rx="6"/>
      <circle ${f('green')} cx="32" cy="45" r="16"/><text x="32" y="51" class="lis-art-num" fill="${C.white}" stroke="none">${p.num}</text>
      <text x="67" y="50" class="lis-art-text lis-art-bold lis-art-text-lg" fill="${INK}" stroke="none">番線</text>`);
  }

  function cake(p) {
    const body = p.flavor === 'chocolate' ? C.choc : C.white;
    const cream = p.flavor === 'chocolate' ? '#8a5639' : C.pink;
    const berries = p.flavor === 'strawberry'
      ? `<g ${f('red')}><path d="M36 30q-6-8 0-12t6 6q0 4-6 6z"/><path d="M52 26q-6-8 0-12t6 6q0 4-6 6z"/><path d="M68 30q-6-8 0-12t6 6q0 4-6 6z"/></g>`
      : `<g ${f('choc')}><rect x="34" y="20" width="10" height="8" rx="2"/><rect x="58" y="20" width="10" height="8" rx="2"/></g>`;
    const shape = p.shape === 'round'
      ? `<path fill="${body}" d="M14 40v34q36 18 72 0V40"/><ellipse fill="${cream}" cx="50" cy="40" rx="36" ry="12"/><path d="M14 58q36 14 72 0" stroke="${cream}" stroke-width="6"/>`
      : `<path fill="${body}" d="M12 44l38 14 38-14v30L50 90 12 74z"/><path fill="${cream}" d="M12 44l38-14 38 14-38 14z"/><path d="M50 58v32"/><path d="M14 60l36 13 36-13" stroke="${cream}" stroke-width="5"/>`;
    return svg(`<ellipse ${f('white')} cx="50" cy="88" rx="44" ry="8" stroke-width="2.5"/>${shape}${berries}`);
  }

  // A house with features: floors (1 or 2), roof colour, a tree, a car.
  function home(p) {
    const two = p.floors === 2;
    const top = two ? 30 : 52;
    return svg(`<path d="M2 96h156" stroke-width="2.5"/>
      ${p.tree ? `<path d="M140 96V70" stroke="${C.brown}" stroke-width="6"/><circle ${f('green')} cx="140" cy="58" r="16"/>` : ''}
      ${p.car ? `<g transform="translate(88 58) scale(.4)">${ICONS.car}</g>` : ''}
      <path fill="${col(p.roof || 'red')}" d="M12 ${top}l38-24 38 24z"/><rect ${f('cream')} x="20" y="${top}" width="60" height="${96 - top}"/>
      <rect ${f('brown')} x="44" y="70" width="14" height="26"/><rect ${f('sky')} x="26" y="64" width="12" height="12"/><rect ${f('sky')} x="64" y="64" width="12" height="12"/>
      ${two ? `<rect ${f('sky')} x="26" y="38" width="12" height="12"/><rect ${f('sky')} x="64" y="38" width="12" height="12"/>` : ''}`, '0 0 160 100', 'lis-art-wide');
  }

  // When to do something (take medicine…): one picture per time of day.
  const TIMES = { morning: ['sun', '朝'], noon: ['rice', '昼'], night: ['moon', '夜'], bed: ['sleep', '寝る前'] };
  function times(p) {
    return `<div class="lis-art-times">${p.when.map(w => `<div>${icon(TIMES[w][0])}<span lang="ja">${TIMES[w][1]}</span></div>`).join('')}</div>`;
  }

  function text(p) {
    return `<div class="lis-art-label${String(p.text).length > 8 ? ' lis-art-small' : ''}" lang="ja">${String(p.text).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))}</div>`;
  }

  // A printed choice in Japanese (N3, N2). The page draws these itself with
  // furigana; this plain version is for anything else that asks.
  function phrase(p) {
    return `<div class="lis-art-label lis-art-small" lang="ja">${String(p.ja).replace(/\[[^\]]*\]/g, '').replace(/ /g, '')}</div>`;
  }

  function price(p) {
    return `<div class="lis-art-label lis-art-price" lang="ja">${p.yen.toLocaleString('en-US')}<small>円</small></div>`;
  }

  const PICTURES = {
    items, clock, digital, calendar, week, weather, map, route, floor, room, key: keyScene, seats, people,
    bus, platform, cake, home, times, text, price, phrase,
    person: p => person(p),
  };

  function picture(p) {
    const draw = PICTURES[p.type];
    return draw ? draw(p) : '';
  }

  // ─── 問題3 scenes ──────────────────────────────────────────────────────────

  const ROLES = {
    boy: { hair: 'spiky', top: 'tshirt', topColor: 'blue', bottom: 'shorts', bottomColor: 'navy', child: true },
    girl: { hair: 'ponytail', top: 'dress', topColor: 'pink', child: true },
    student: { hair: 'short', top: 'shirt', topColor: 'white', tie: true, bottom: 'trousers', bottomColor: 'navy', bag: true },
    schoolgirl: { hair: 'long', top: 'sailor', bottom: 'skirt' },
    teacher: { hair: 'short', top: 'suit', glasses: true },
    teacherWoman: { hair: 'bun', top: 'jacket', topColor: 'purple', bottom: 'skirt', glasses: true },
    woman: { hair: 'long', top: 'sweater', topColor: 'orange', bottom: 'skirt', bottomColor: 'navy' },
    woman2: { hair: 'bob', top: 'jacket', topColor: 'green', bottom: 'trousers' },
    man: { hair: 'short', top: 'sweater', topColor: 'green', bottom: 'trousers' },
    man2: { hair: 'spiky', top: 'jacket', topColor: 'red', bottom: 'trousers', bottomColor: 'navy' },
    waiter: { hair: 'short', top: 'vest', bowtie: true },
    clerk: { hair: 'bob', top: 'apron', topColor: 'sky', bottom: 'trousers' },
    clerkMan: { hair: 'short', top: 'apron', topColor: 'green', bottom: 'trousers', cap: true, hatColor: 'green' },
    office: { hair: 'short', top: 'suit' },
    officeWoman: { hair: 'bob', top: 'suit', topColor: 'dark', bottom: 'skirt', bottomColor: 'dark' },
    tourist: { hair: 'short', top: 'tshirt', topColor: 'yellow', bottom: 'shorts', hat: true, hatColor: 'green', backpack: true },
    grandma: { hair: 'bun', top: 'sweater', topColor: 'purple', bottom: 'skirt', glasses: true, old: true },
    grandpa: { hair: 'bald', top: 'jacket', topColor: 'brown', bottom: 'trousers', mustache: true, glasses: true, old: true },
    mother: { hair: 'bob', top: 'apron', topColor: 'pink', bottom: 'skirt', bottomColor: 'blue' },
    father: { hair: 'short', top: 'shirt', topColor: 'sky', bottom: 'trousers', glasses: true },
    doctor: { hair: 'short', top: 'whitecoat', glasses: true },
    nurse: { hair: 'bun', top: 'whitecoat', topColor: 'mint' },
    friend: { hair: 'ponytail', top: 'tshirt', topColor: 'red', bottom: 'trousers', bottomColor: 'blue' },
    friendMan: { hair: 'spiky', top: 'tshirt', topColor: 'green', bottom: 'trousers', bottomColor: 'blue' },
  };

  // Settings, drawn in a 320×200 frame behind the people.
  const room2 = (wall = 'wall', ground = 'floor') => `<rect ${f(wall)} x="0" y="0" width="320" height="200" stroke="none"/><rect ${f(ground)} x="0" y="168" width="320" height="32" stroke="none"/><path d="M0 168h320" stroke-width="2.5"/>`;
  const SETTINGS = {
    plain: () => room2(),
    home: () => `${room2()}<rect ${f('brown')} x="128" y="34" width="64" height="134"/><circle ${f('yellow')} cx="180" cy="104" r="4" stroke-width="2.5"/><rect ${f('silver')} x="108" y="160" width="104" height="10" stroke-width="2.5"/>`,
    living: () => `${room2()}<rect ${f('sky')} x="116" y="26" width="88" height="62" rx="3"/><path d="M160 26v62M116 56h88" stroke-width="2.5"/><path ${f('cream')} d="M106 22h14v72h-14zM200 22h14v72h-14z" stroke-width="2.5"/>`,
    kitchen: () => `${room2()}<rect ${f('white')} x="96" y="96" width="128" height="72"/><rect ${f('silver')} x="96" y="90" width="128" height="8"/><path d="M128 110h20M176 110h20" stroke-width="3"/>
      <rect ${f('wood')} x="104" y="24" width="112" height="40"/><path d="M160 24v40" stroke-width="2.5"/>`,
    classroom: () => `${room2()}<rect ${f('board')} x="74" y="20" width="172" height="80" rx="3" stroke-width="4"/><path d="M86 44h60M86 62h90M86 80h40" stroke="#fff" stroke-width="2.5" opacity=".75"/><path d="M74 104h172" stroke="${C.brown}" stroke-width="5"/>`,
    office: () => `${room2('wall', 'silver')}<rect ${f('sky')} x="104" y="18" width="112" height="56" rx="2"/><path d="M104 32h112M104 46h112M104 60h112" stroke-width="2"/><rect ${f('wood')} x="110" y="122" width="100" height="10"/><path d="M118 132v36M202 132v36" stroke-width="5"/>
      <g transform="translate(138 82) scale(.42)">${ICONS.computer}</g>`,
    shop: () => `${room2()}<rect ${f('wood')} x="96" y="16" width="128" height="96"/><path d="M96 48h128M96 80h128" stroke-width="3"/>
      <g stroke-width="2"><rect ${f('red')} x="104" y="26" width="18" height="22"/><rect ${f('blue')} x="126" y="30" width="18" height="18"/><rect ${f('yellow')} x="148" y="24" width="20" height="24"/><rect ${f('green')} x="172" y="28" width="18" height="20"/><rect ${f('pink')} x="194" y="26" width="22" height="22"/>
      <rect ${f('sky')} x="104" y="58" width="22" height="22"/><rect ${f('orange')} x="130" y="56" width="18" height="24"/><rect ${f('purple')} x="152" y="60" width="20" height="20"/><rect ${f('mint')} x="176" y="56" width="18" height="24"/><rect ${f('red')} x="198" y="58" width="18" height="22"/></g>`,
    clothes: () => `${room2()}<path d="M100 26h120" stroke-width="4"/><g stroke-width="2.5"><path ${f('red')} d="M108 30l-8 6 4 8 4-2v24h22V42l4 2 4-8-8-6q-4 4-11 4t-11-4z"/><path ${f('sky')} d="M150 30l-8 6 4 8 4-2v24h22V42l4 2 4-8-8-6q-4 4-11 4t-11-4z"/><path ${f('yellow')} d="M192 30l-8 6 4 8 4-2v24h22V42l4 2 4-8-8-6q-4 4-11 4t-11-4z"/></g>
      <rect ${f('white')} x="232" y="20" width="40" height="120" rx="3"/>`,
    restaurant: () => `${room2()}<path d="M120 0v24M200 0v24" stroke-width="2"/><path ${f('yellow')} d="M108 24h24l6 14h-36zM188 24h24l6 14h-36z" stroke-width="2.5"/>
      <rect ${f('white')} x="104" y="122" width="112" height="12" rx="2"/><path d="M116 134v34M204 134v34" stroke-width="5"/>`,
    street: () => `<rect ${f('sky')} x="0" y="0" width="320" height="200" stroke="none"/><rect ${f('silver')} x="0" y="164" width="320" height="36" stroke="none"/><path d="M0 164h320" stroke-width="2.5"/>
      <rect ${f('cream')} x="96" y="40" width="58" height="124"/><rect ${f('beige')} x="166" y="70" width="60" height="94"/>
      <g ${f('white')} stroke-width="2.5"><rect x="106" y="54" width="14" height="16"/><rect x="130" y="54" width="14" height="16"/><rect x="106" y="86" width="14" height="16"/><rect x="130" y="86" width="14" height="16"/><rect x="178" y="84" width="14" height="16"/><rect x="202" y="84" width="14" height="16"/></g>
      <circle ${f('white')} cx="196" cy="40" r="11" stroke="none"/><circle ${f('white')} cx="212" cy="35" r="14" stroke="none"/><circle ${f('white')} cx="228" cy="41" r="10" stroke="none"/>`,
    rain: () => `<rect ${f('silver')} x="0" y="0" width="320" height="200" stroke="none"/><rect ${f('gray')} x="0" y="164" width="320" height="36" stroke="none"/><path d="M0 164h320" stroke-width="2.5"/>
      <g stroke="${C.blue}" stroke-width="3">${Array.from({ length: 22 }, (_, i) => `<path d="M${10 + (i * 47) % 300} ${12 + (i * 29) % 130}l-4 10"/>`).join('')}</g>`,
    station: () => `${room2('wall', 'silver')}<rect ${f('white')} x="118" y="20" width="84" height="30" rx="4"/><text x="160" y="42" class="lis-art-glyph lis-art-glyph-lg" fill="${INK}" stroke="none">駅</text>
      <g transform="translate(110 80)">${ICONS.gate}</g>`,
    train: () => `${room2('wall', 'silver')}<rect ${f('sky')} x="96" y="30" width="56" height="50" rx="6"/><rect ${f('sky')} x="168" y="30" width="56" height="50" rx="6"/><path d="M84 14h152" stroke-width="4"/>
      <g stroke-width="2.5"><path d="M110 14v12M160 14v12M210 14v12"/><circle cx="110" cy="31" r="5"/><circle cx="160" cy="31" r="5"/><circle cx="210" cy="31" r="5"/></g>
      <rect ${f('blue')} x="96" y="120" width="128" height="20" rx="6"/><rect ${f('blue')} x="96" y="98" width="128" height="22" rx="6"/>`,
    hospital: () => `${room2('white', 'mint')}<rect ${f('silver')} x="104" y="104" width="112" height="22" rx="4"/><rect ${f('white')} x="104" y="94" width="30" height="14" rx="6"/><path d="M108 126v42M212 126v42" stroke-width="5"/>
      <path ${f('mint')} d="M228 14v150h24V14z" stroke-width="2.5"/>`,
    park: () => `<rect ${f('sky')} x="0" y="0" width="320" height="200" stroke="none"/><rect ${f('grass')} x="0" y="150" width="320" height="50" stroke="none"/><path d="M0 150h320" stroke-width="2.5"/>
      <path d="M160 152v-50" stroke="${C.brown}" stroke-width="10"/><circle ${f('green')} cx="160" cy="80" r="38"/>`,
    night: () => `<rect fill="#2c3559" x="0" y="0" width="320" height="200" stroke="none"/><rect ${f('silver')} x="0" y="164" width="320" height="36" stroke="none"/><path d="M0 164h320" stroke-width="2.5"/>
      <g transform="translate(130 6) scale(.6)">${ICONS.moon}</g><g fill="#fff" stroke="none"><circle cx="40" cy="30" r="2"/><circle cx="270" cy="50" r="2"/><circle cx="230" cy="20" r="1.5"/><circle cx="90" cy="60" r="1.5"/></g>`,
  };

  // A held prop sits between the hands of whoever holds it; otherwise
  // between the two people, on the table if the setting has one.
  function scene(s) {
    const setting = (SETTINGS[s.setting] || SETTINGS.plain)();
    const tableTop = { restaurant: 122, office: 122 }[s.setting];
    const actor = (role, x, speaks, pose) => {
      const spec = Object.assign({}, ROLES[role] || ROLES.man, pose ? { pose } : {});
      const scale = spec.child ? 0.66 : 0.84;
      const y = 168 - 150 * scale + 5;
      const body = `<g transform="translate(${x - 50 * scale} ${y}) scale(${scale})">${personBody(spec)}</g>`;
      const flag = speaks
        ? `<rect x="${x - 16}" y="${y - 42}" width="32" height="25" rx="11" fill="#fff" stroke="${C.red}" stroke-width="3"/><text x="${x}" y="${y - 23}" class="lis-art-q" fill="${C.red}" stroke="none">?</text>
           <path d="M${x - 8} ${y - 13}h16l-8 11z" fill="${C.red}" stroke="none"/>` : '';
      return { body, flag, scale, y };
    };
    const L = actor(s.left, 70, s.arrow === 'left', s.leftPose || (s.holder === 'left' ? 'hold' : null));
    const R = actor(s.right, 250, s.arrow === 'right', s.rightPose || (s.holder === 'right' ? 'hold' : null));
    let prop = '';
    if (s.prop) {
      const holder = s.holder === 'left' ? [70, L] : s.holder === 'right' ? [250, R] : null;
      const at = s.propAt || (holder ? 'hands' : tableTop ? 'table' : 'floor');
      const size = s.propSize || (holder ? 30 : at === 'high' ? 44 : 48);
      let px = 160 - size / 2, py;
      if (holder) { px = holder[0] - size / 2; py = holder[1].y + 92 * holder[1].scale - size / 2; }
      else if (at === 'table') py = tableTop - size + 6;
      else if (at === 'high') py = 18;
      else py = 168 - size + 4;
      prop = `<g transform="translate(${px} ${py}) scale(${size / 100})">${ICONS[s.prop] || ''}</g>`;
    }
    const heldFront = s.holder ? prop : '';
    return `<div class="lis-art-scene">${svg(setting + (s.holder ? '' : prop) + L.body + R.body + heldFront + L.flag + R.flag, '0 0 320 200', 'lis-art-scene-svg')}</div>`;
  }

  const api = { picture, scene, icon, person, PICTURES, ICONS, ROLES, SETTINGS, MAP_SPOTS, ROOM_SPOTS, KEY_SPOTS, C };
  global.ListeningArt = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
