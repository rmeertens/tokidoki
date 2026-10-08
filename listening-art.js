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
  const FACE_BASE = `<circle ${f('skin')} cx="16" cy="56" r="7"/><circle ${f('skin')} cx="84" cy="56" r="7"/><circle ${f('skin')} cx="50" cy="54" r="34"/>
    <path fill="${C.hair}" d="M16 50q0-38 34-38t34 38q-10-18-34-20-24 2-34 20z"/>`;
  const EYES = `<g fill="${INK}" stroke="none"><circle cx="38" cy="52" r="3.5"/><circle cx="62" cy="52" r="3.5"/></g>`;
  const NOSE = `<path d="M50 54q-4 9 2 11" stroke-width="2.5"/>`;
  const FACE = `${FACE_BASE}${EYES}${NOSE}<path d="M40 74q10 7 20 0"/>`;
  const BLUSH = `<g fill="${C.pink}" stroke="none" opacity=".7"><circle cx="28" cy="64" r="5"/><circle cx="72" cy="64" r="5"/></g>`;
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

  // A compass with one direction's pointer in red (北 / 南 / 東 / 西).
  const compass = dir => {
    const at = { N: [50, 18], E: [82, 50], S: [50, 82], W: [18, 50] };
    const [x, y] = at[dir];
    const letters = Object.entries(at).map(([d, [lx, ly]]) => `<text x="${lx}" y="${ly + 5}" class="lis-art-glyph" fill="${d === dir ? C.red : INK}" stroke="none">${d}</text>`).join('');
    return `<circle ${f('cream')} cx="50" cy="50" r="44"/><circle cx="50" cy="50" r="30" stroke-width="2" stroke-dasharray="3 5"/>${letters}
      <path fill="${C.red}" d="M50 50L${50 + (x - 50) * 0.62 - (y - 50) * 0.12} ${50 + (y - 50) * 0.62 + (x - 50) * 0.12}L${50 + (x - 50) * 0.8} ${50 + (y - 50) * 0.8}L${50 + (x - 50) * 0.62 + (y - 50) * 0.12} ${50 + (y - 50) * 0.62 - (x - 50) * 0.12}z" stroke-width="2.5"/>
      <circle ${f('dark')} cx="50" cy="50" r="4" stroke-width="2"/>`;
  };
  // A cog: n flat-topped teeth between radii R and r.
  const gearPath = (cx, cy, R, r, n) => {
    const pts = [];
    for (let i = 0; i < n * 4; i++) {
      const a = Math.PI * 2 * i / (n * 4);
      const d = i % 4 < 2 ? R : r;
      pts.push(`${(cx + d * Math.cos(a)).toFixed(1)} ${(cy + d * Math.sin(a)).toFixed(1)}`);
    }
    return `M${pts.join('L')}z`;
  };
  const thermo = (level, color) => `<rect ${f('white')} x="70" y="10" width="16" height="62" rx="8"/><circle ${f(color)} cx="78" cy="78" r="12"/>
    <path d="M78 72V${72 - level}" stroke="${col(color)}" stroke-width="7"/><path d="M86 22h-5M86 34h-5M86 46h-5M86 58h-5" stroke-width="2"/>`;
  const building = (x, y, w, h, color, cols, rows) => {
    const win = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      win.push(`<rect x="${x + 5 + c * ((w - 10) / cols) + 1}" y="${y + 6 + r * 12}" width="${(w - 10) / cols - 4}" height="6"/>`);
    }
    return `<rect ${f(color)} x="${x}" y="${y}" width="${w}" height="${h}"/><g ${f('sky')} stroke-width="1.5">${win.join('')}</g>`;
  };
  const shaker = (color, dots) => `<path ${f(color)} d="M30 40q0-14 20-14t20 14v40a8 8 0 0 1-8 8H38a8 8 0 0 1-8-8z"/><path ${f('silver')} d="M32 30q0-16 18-16t18 16z"/>
    <g fill="${INK}" stroke="none"><circle cx="44" cy="22" r="1.8"/><circle cx="50" cy="19" r="1.8"/><circle cx="56" cy="22" r="1.8"/></g>
    <g fill="${col(dots)}" stroke="none"><circle cx="20" cy="12" r="2"/><circle cx="14" cy="22" r="2"/><circle cx="24" cy="26" r="2"/></g><path d="M36 50h28" stroke="#fff" stroke-width="3" opacity=".7"/>`;

  Object.assign(ICONS, {
    // feelings and doing things
    laugh: `${FACE_BASE}<path d="M31 53q7-8 14 0M55 53q7-8 14 0" stroke-width="3"/><path ${f('red')} d="M37 64h26q-2 18-13 18T37 64z"/>${BLUSH}`,
    cry: `${FACE_BASE}<path d="M31 50q7 6 14 0M55 50q7 6 14 0" stroke-width="3"/><path d="M41 78q9-8 18 0"/>
      <path ${f('sky')} d="M34 56q-6 10-2 16 6 2 6-6-1-5-4-10zM66 56q6 10 2 16-6 2-6-6 1-5 4-10z" stroke-width="2.5"/>`,
    angry: `${FACE_BASE.replace(C.skin, '#f4b9a0')}<path d="M29 40l14 7M71 40l-14 7" stroke-width="4"/>${EYES}<path d="M40 76q10-8 20 0"/>
      <g stroke="${C.red}" stroke-width="4"><path d="M72 18q4 6 10 6M90 18q-6 2-6 8M74 34q2-6 8-6M90 34q-6-2-6-8"/></g>`,
    sleepy: `${FACE_BASE}<path d="M31 53q7 4 14 0M55 53q7 4 14 0" stroke-width="3"/><ellipse ${f('red')} cx="50" cy="73" rx="5" ry="7" stroke-width="2.5"/>
      <text x="80" y="22" class="lis-art-glyph" fill="${C.blue}" stroke="none">Z</text><text x="90" y="10" class="lis-art-text lis-art-bold" fill="${C.blue}" stroke="none">z</text>`,
    surprised: `${FACE_BASE}<path d="M30 38q8-6 14-2M56 36q6-4 14 2" stroke-width="3"/><g ${f('white')} stroke-width="2.5"><circle cx="38" cy="52" r="7"/><circle cx="62" cy="52" r="7"/></g>${EYES}
      <ellipse ${f('red')} cx="50" cy="74" rx="6" ry="8" stroke-width="2.5"/><path d="M88 14v14" stroke="${C.red}" stroke-width="5"/><circle fill="${C.red}" cx="88" cy="36" r="3" stroke="none"/>`,
    happy: `${FACE_BASE}${EYES}<path d="M38 68q12 12 24 0" stroke-width="4"/>${BLUSH}<g fill="${C.pink}" stroke="none"><path d="M86 20c-4-3-6-5-6-7a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 2-2 4-6 7z"/><path d="M14 18c-3-2-4-4-4-5a2 2 0 0 1 4-1 2 2 0 0 1 4 1c0 1-1 3-4 5z"/></g>`,
    tongue: `${FACE}<path ${f('pink')} d="M44 76h12v8a6 6 0 0 1-12 0z" stroke-width="2.5"/>${ring(50, 82, 12)}`,
    beard: `${FACE_BASE}${EYES}${NOSE}<path fill="${C.hair}" d="M18 58q2 32 32 32t32-32q-4 16-14 14-6-8-18-8t-18 8q-10 2-14-14z"/><path fill="${C.hair}" d="M38 70q12-6 24 0-12 4-24 0z"/>`,
    hair: `${FACE}${ring(50, 22, 14)}`,
    eat: `${FACE_BASE}${EYES}<ellipse ${f('red')} cx="50" cy="74" rx="8" ry="6" stroke-width="2.5"/><path d="M94 30L58 70M98 38L62 74" stroke="${C.wood}" stroke-width="4"/>
      <path ${f('white')} d="M54 66l12 2-2 10-12-2z" stroke-width="2.5"/>`,
    drinking: `${FACE}<g transform="rotate(-28 70 76)"><path ${f('white')} d="M58 60h24l-3 30H61z"/><path fill="${C.sky}" stroke="none" d="M59.5 70h21l-2 18H61.5z"/><path d="M58 60h24l-3 30H61z"/></g>`,
    listen: `${FACE}<path ${f('skin')} d="M80 70q14-4 12-20-2-10-8-12-2 8 0 16-4 10-4 16z"/><path d="M94 32q6 8 2 18" stroke="${C.blue}" stroke-width="3"/><path d="M96 24q12 14 2 32" stroke="${C.blue}" stroke-width="3"/>`,
    reading: `${FACE_BASE}<path d="M32 54q6 3 12 0M56 54q6 3 12 0" stroke-width="3"/><path ${f('white')} d="M12 68q19-7 38 2 19-9 38-2v26q-19-6-38 2-19-8-38-2z"/><path d="M50 70v26"/><path d="M20 76q12-3 24 2M56 78q12-5 24-2M20 84q12-3 24 2M56 86q12-5 24-2" stroke-width="2"/>`,
    run: `<circle ${f('orange')} cx="62" cy="16" r="11"/>${tube('M58 32L46 58', 'orange', 13)}${tube('M54 38L70 50L80 40', 'orange', 8)}${tube('M54 38L38 44L30 34', 'orange', 8)}
      ${tube('M46 58L64 70L62 90', 'navy', 10)}${tube('M46 58L32 74L16 72', 'navy', 10)}<path d="M8 30h14M4 44h14M10 58h12" stroke="${C.gray}" stroke-width="3"/>`,
    write: `<rect ${f('white')} x="8" y="30" width="62" height="62" rx="2"/><path d="M16 44q4-3 8 0t8 0 8 0 8 0M16 56q4-3 8 0t8 0 8 0M16 68q4-3 8 0t8 0" stroke-width="2.5"/>
      <path ${f('yellow')} d="M84 8l8 6-30 46-10 4 2-10z"/><path ${f('skin')} d="M66 56q8 0 14 8 6 10-2 18-12 6-20-4-4-8 0-14z"/>`,

    // weather, sky and land
    hot: `<circle ${f('orange')} cx="34" cy="38" r="16"/><g stroke="${C.orange}"><path d="M34 12V6M34 70v-6M8 38H2M60 38h6M16 20l-4-4M52 56l4 4M52 20l4-4M16 56l-4 4"/></g>${thermo(52, 'red')}<path ${f('sky')} d="M24 76q-4 8 0 12 4-4 0-12z" stroke-width="2"/>`,
    cold: `<g stroke="${C.blue}" stroke-width="4"><path d="M34 14v52M12 27l44 26M12 53l44-26"/><path d="M28 20l6 6 6-6M28 60l6-6 6 6" stroke-width="3"/></g>${thermo(10, 'blue')}`,
    chili: `<path ${f('red')} d="M24 26q-10 30 8 52 14 14 46 14-30-14-34-40-2-14 6-22z"/><path ${f('green')} d="M24 26q6-10 18-6 6 2 8 6-10 0-14 6-6-4-12-6z"/><path d="M36 20q0-8 6-14" stroke="${C.leaf}" stroke-width="4"/>
      <path d="M32 44q2 14 10 24" stroke="#fff" stroke-width="3.5" opacity=".7"/>`,
    lemon: `<ellipse ${f('yellow')} cx="40" cy="44" rx="30" ry="22" transform="rotate(-20 40 44)"/><path d="M12 56l-4 4M68 32l4-4" stroke-width="4"/>
      <circle ${f('yellow')} cx="70" cy="70" r="20"/><circle fill="#fff7c8" cx="70" cy="70" r="14" stroke-width="2"/><path d="M70 56v28M56 70h28M60 60l20 20M80 60L60 80" stroke="${C.yellow}" stroke-width="2.5"/>`,
    sky: `<rect ${f('sky')} x="6" y="10" width="88" height="80" rx="10"/><path ${f('white')} d="M18 60a10 10 0 0 1 4-19 13 13 0 0 1 24-4 10 10 0 0 1 12 9 8 8 0 0 1 0 14z" stroke-width="2.5"/>
      <path ${f('white')} d="M60 36a7 7 0 0 1 3-13 9 9 0 0 1 17-3 7 7 0 0 1 8 6 6 6 0 0 1 0 10z" stroke-width="2.5"/><path d="M58 70q5-5 10 0 5-5 10 0M40 80q4-4 8 0 4-4 8 0" stroke-width="2.5"/>`,
    sunny: `<rect ${f('sky')} x="6" y="10" width="88" height="80" rx="10"/><circle ${f('orange')} cx="50" cy="50" r="16"/>
      <g stroke="${C.orange}"><path d="M50 22v-6M50 84v-6M22 50h-6M84 50h-6M30 30l-4-4M70 70l4 4M70 30l4-4M30 70l-4 4"/></g>`,
    sunset: `<rect fill="#f7b267" x="6" y="10" width="88" height="80" rx="10"/><path fill="#f4845f" stroke="none" d="M6 36h88v22H6z"/><path ${f('red')} d="M28 62a22 22 0 0 1 44 0z"/>
      <path ${f('navy')} d="M6 62h88v18a10 10 0 0 1-10 10H16A10 10 0 0 1 6 80z"/><path d="M30 70h16M58 70h14M40 80h20" stroke="#f7b267" stroke-width="2.5"/><path d="M60 22q4-4 8 0 4-4 8 0M70 30q3-3 6 0 3-3 6 0" stroke-width="2.5"/>
      <rect x="6" y="10" width="88" height="80" rx="10"/>`,
    typhoon: `<path d="M50 50a5 5 0 1 1 5 5a11 11 0 1 1-11-11a17 17 0 1 1 17 17a23 23 0 1 1-23-23a29 29 0 1 1 29 29" stroke="${C.blue}" stroke-width="6"/>
      <path d="M50 50a5 5 0 1 1 5 5a11 11 0 1 1-11-11a17 17 0 1 1 17 17a23 23 0 1 1-23-23a29 29 0 1 1 29 29" stroke-width="1.5"/>`,
    earthquake: `<g transform="rotate(-8 46 56)"><rect ${f('wall')} x="26" y="44" width="40" height="32"/><path ${f('red')} d="M18 48l28-24 28 24z"/><rect ${f('sky')} x="34" y="52" width="10" height="10" stroke-width="2.5"/></g>
      <path ${f('brown')} d="M4 80h40l6 8 6-8h40v14H4z"/><path d="M50 88l-4 6M56 80l4-6" stroke-width="2.5"/><path d="M8 40l6-4-6-4M92 40l-6-4 6-4M10 60l6-4-6-4M90 60l-6-4 6-4" stroke="${C.red}" stroke-width="3"/>`,
    north: compass('N'), south: compass('S'), east: compass('E'), west: compass('W'),
    desert: `<circle ${f('orange')} cx="74" cy="22" r="10"/><path ${f('beige')} d="M2 70q24-20 48-4t48-8v36H2z"/><path ${f('wood')} d="M2 82q30-12 56 0t40-4v16H2z" stroke-width="2.5"/>
      <path ${f('green')} d="M28 74V36q0-6 6-6t6 6v38zM28 56h-6q-4 0-4-4V42q0-4 3-4t3 4v8h4M40 50h6v-8q0-4 3-4t3 4v10q0 4-4 4h-8"/>`,
    field: `<path ${f('brown')} d="M2 40h96l-8 52H10z"/><g stroke="${C.choc}" stroke-width="2.5"><path d="M24 40L18 92M42 40l-2 52M58 40l2 52M76 40l6 52"/></g>
      <g ${f('green')} stroke-width="2.5"><path d="M30 52q-6-10 0-14 6 4 0 14zM50 52q-6-10 0-14 6 4 0 14zM68 52q-6-10 0-14 6 4 0 14zM28 76q-8-12 0-18 8 6 0 18zM50 76q-8-12 0-18 8 6 0 18zM72 76q-8-12 0-18 8 6 0 18z"/></g>`,
    hill: `<path ${f('grass')} d="M2 90q14-46 48-50t48 50z"/><path ${f('green')} d="M2 90q30-24 60-14t36 14z"/>${tube('M50 40V26', 'brown', 4)}<circle ${f('green')} cx="50" cy="20" r="10"/><path d="M4 92h92"/>`,
    fountain: `<path d="M50 40q-16-24-34 12M50 40q16-24 34 12M50 40V20" stroke="${C.blue}" stroke-width="4"/><g fill="${C.sky}" stroke="none"><circle cx="50" cy="16" r="5"/><circle cx="14" cy="54" r="3"/><circle cx="86" cy="54" r="3"/></g>
      <path ${f('gray')} d="M8 62h84v10q-4 16-42 16T8 72z"/><path ${f('sky')} d="M14 62q36 8 72 0" stroke-width="2.5"/><rect ${f('gray')} x="44" y="40" width="12" height="22"/>`,

    // buildings and places
    toilet: `<rect ${f('white')} x="54" y="10" width="34" height="40" rx="4"/><path d="M60 18h10" stroke-width="3"/><path ${f('white')} d="M12 48h76q0 22-24 26l4 16H32l4-16Q12 70 12 48z"/>
      <ellipse ${f('sky')} cx="44" cy="50" rx="24" ry="5" stroke-width="2.5"/>`,
    bath: `<g stroke="${C.gray}"><path d="M30 26q-5-6 0-12t0-12M50 26q-5-6 0-12t0-12M70 26q-5-6 0-12t0-12"/></g><path ${f('sky')} d="M6 46h88v14q0 24-26 24H32Q6 84 6 60z"/>
      <path d="M6 46h88" stroke-width="5"/><path d="M24 86l-4 6M76 86l4 6" stroke-width="4"/><circle ${f('yellow')} cx="70" cy="40" r="7"/><path ${f('yellow')} d="M60 46q2-8 10-6 8 0 10 6z"/><path ${f('orange')} d="M76 40l6 1-6 2z" stroke-width="1.5"/>`,
    shower: `<path d="M22 92V20q0-12 14-12h26v10" stroke-width="5"/><path ${f('silver')} d="M48 22h28l6 10H42z"/>
      <g stroke="${C.blue}" stroke-width="3"><path d="M48 40l-4 14M56 40l-2 22M64 40v16M72 40l2 22M80 40l4 14M52 64l-2 10M68 62l2 12M60 66v12"/></g>`,
    kitchen: `<rect ${f('white')} x="6" y="50" width="88" height="40" rx="2"/><path d="M6 58h88M50 58v32" stroke-width="2.5"/><path d="M28 66v16M72 66v16" stroke-width="3"/>
      <ellipse ${f('dark')} cx="28" cy="50" rx="14" ry="3" stroke-width="2"/><path ${f('silver')} d="M14 32h28v14a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4z"/><path d="M14 36H8M42 36h6" stroke-width="4"/>
      <path d="M72 50V30q0-8 8-8h6v6" stroke-width="4"/><path d="M28 24q-4-5 0-10" stroke="${C.gray}"/>`,
    garden: `<path ${f('grass')} d="M2 64h96v28H2z" stroke="none"/>${tube('M76 64V40', 'brown', 6)}<circle ${f('green')} cx="76" cy="30" r="16"/>
      <g ${f('white')} stroke-width="2.5">${[8, 22, 36, 50].map(x => `<path d="M${x} 82V58l5-6 5 6v24z"/>`).join('')}</g><path d="M4 66h58M4 76h58" stroke-width="2.5"/>
      ${flowerHead(30, 46, 'red')}${flowerHead(54, 44, 'yellow')}<path d="M30 52v10M54 50v12" stroke="${C.leaf}"/>`,
    road: `<path ${f('grass')} d="M2 30h96v62H2z" stroke="none"/><path ${f('gray')} d="M44 30h12l38 62H6z"/><path d="M50 36v8M50 52v12M50 74v16" stroke="#fff" stroke-width="4"/>
      <path ${f('sky')} d="M2 8h96v22H2z" stroke="none"/><path d="M2 30h96"/>`,
    town: `${building(6, 40, 24, 50, 'wall', 2, 3)}${building(30, 18, 26, 72, 'silver', 2, 5)}${building(56, 46, 18, 44, 'cream', 1, 3)}${building(74, 30, 20, 60, 'beige', 2, 4)}<path d="M2 90h96"/>`,
    village: `<path ${f('grass')} d="M2 64q48-14 96 0v28H2z"/><g><rect ${f('wall')} x="10" y="56" width="34" height="22"/><path ${f('wood')} d="M4 60L27 30l23 30z"/><rect ${f('brown')} x="22" y="64" width="10" height="14" stroke-width="2.5"/></g>
      <g><rect ${f('wall')} x="56" y="50" width="34" height="22"/><path ${f('wood')} d="M50 54l23-30 23 30z"/><rect ${f('sky')} x="62" y="58" width="10" height="8" stroke-width="2.5"/></g><path d="M2 92h96"/>`,
    hotel: `${building(18, 22, 64, 68, 'cream', 4, 4)}<rect ${f('red')} x="34" y="6" width="32" height="16" rx="3"/><text x="50" y="19" class="lis-art-glyph" fill="#fff" stroke="none">H</text>
      <rect ${f('wall')} x="40" y="72" width="20" height="18"/><path ${f('red')} d="M34 72h32l-4-6H38z" stroke-width="2.5"/><path d="M8 90h84"/>`,
    restaurant: `<rect ${f('wall')} x="12" y="36" width="76" height="52"/><path ${f('red')} d="M8 36h84l-6-14H14z"/><path d="M26 22v14M42 22v14M58 22v14M74 22v14" stroke="#fff" stroke-width="3"/>
      <rect ${f('sky')} x="20" y="48" width="26" height="22" stroke-width="2.5"/><rect ${f('brown')} x="56" y="52" width="22" height="36" stroke-width="2.5"/>
      <circle ${f('white')} cx="33" cy="59" r="8" stroke-width="2"/><path d="M29 54v10M37 54v10" stroke-width="1.5"/><path d="M4 88h92"/>`,
    gradcap: `<path ${f('black')} d="M50 18L6 38l44 20 44-20z"/><path ${f('black')} d="M24 46v18q26 16 52 0V46L50 58z"/><path d="M84 42v24" stroke="${C.yellow}" stroke-width="3"/><path ${f('yellow')} d="M80 64h8l2 12h-12z" stroke-width="2"/>`,
    skyscraper: `${building(30, 8, 40, 82, 'sky', 3, 6)}${building(6, 44, 24, 46, 'silver', 2, 3)}${building(70, 34, 24, 56, 'beige', 2, 4)}<path d="M50 8V2" stroke-width="3"/><path d="M2 90h96"/>`,
    blackboard: `<rect ${f('wood')} x="4" y="12" width="92" height="68" rx="4"/><rect ${f('board')} x="10" y="18" width="80" height="54"/>
      <path d="M18 32h30M18 44h46M18 56h24" stroke="#fff" stroke-width="3" opacity=".8"/><path d="M8 80h84" stroke-width="5"/><rect ${f('white')} x="60" y="74" width="12" height="5" rx="2" stroke-width="2"/>`,
    subway: `<path ${f('grass')} d="M2 10h96v12H2z" stroke="none"/><path ${f('brown')} d="M2 22h96v72H2z" stroke="none"/><path d="M2 22h96"/><circle ${f('dark')} cx="50" cy="60" r="32"/>
      <rect ${f('silver')} x="30" y="40" width="40" height="44" rx="8"/><rect ${f('sky')} x="36" y="46" width="28" height="16" rx="2" stroke-width="2.5"/>
      <g ${f('yellow')} stroke-width="2"><circle cx="38" cy="72" r="3.5"/><circle cx="62" cy="72" r="3.5"/></g><path d="M30 84h40" stroke="${C.blue}" stroke-width="4"/>`,
    crossroads: `<rect ${f('grass')} x="4" y="4" width="92" height="92" rx="8" stroke="none"/><path ${f('gray')} d="M36 4h28v32h32v28H64v32H36V64H4V36h32z"/>
      <g stroke="#fff" stroke-width="3">${[40, 46, 52, 58].map(x => `<path d="M${x + 1} 28v6M${x + 1} 66v6"/>`).join('')}${[40, 46, 52, 58].map(y => `<path d="M28 ${y + 1}h6M66 ${y + 1}h6"/>`).join('')}</g>`,
    escalator: `<path ${f('silver')} d="M6 86h22l46-56h20v14H80L34 92H6z"/><path d="M28 86l46-56" stroke-width="2.5"/>
      <g stroke-width="2">${[0, 1, 2, 3, 4].map(i => `<path d="M${34 + i * 9} ${80 - i * 11}h7v-4"/>`).join('')}</g><path d="M4 72h20l46-56h24" stroke="${C.dark}" stroke-width="5"/>`,
    airport: `<path d="M4 92h92"/><rect ${f('silver')} x="18" y="40" width="14" height="52"/><path ${f('sky')} d="M10 26h30l-4 14H14z"/><path d="M12 26h26" stroke-width="5"/><path d="M25 26V14" stroke-width="3"/>
      <g transform="translate(40 10) scale(.6) rotate(-14 50 50)">${'' /* the plane */}<path ${f('white')} d="M10 50q0-8 10-8h56q16 0 20 8-4 8-20 8H20q-10 0-10-8z"/><path ${f('blue')} d="M40 44L28 20h12l22 24zM40 56L28 80h12l22-24zM14 44l-6-14h8l12 14z"/></g>`,
    church: `<path d="M50 4v16M44 10h12" stroke-width="4"/><path ${f('red')} d="M36 34l14-14 14 14z"/><rect ${f('white')} x="38" y="34" width="24" height="56"/><path ${f('dark')} d="M44 90V76a6 6 0 0 1 12 0v14z"/>
      <rect ${f('wall')} x="14" y="54" width="24" height="36"/><rect ${f('wall')} x="62" y="54" width="24" height="36"/><path ${f('red')} d="M10 56l16-14 12 12M90 56L74 42 62 54"/><circle ${f('yellow')} cx="50" cy="50" r="6" stroke-width="2.5"/><path d="M4 90h92"/>`,
    temple: `<path ${f('gray')} d="M10 84h80v8H10z"/><rect ${f('wood')} x="20" y="50" width="60" height="34"/><path d="M34 50v34M50 50v34M66 50v34" stroke-width="2.5"/>
      <path ${f('dark')} d="M2 54q12-6 18-22h60q6 16 18 22-20-4-48-4T2 54z"/><path ${f('dark')} d="M26 32q8-6 10-18h28q2 12 10 18z"/><path d="M50 14V6" stroke-width="3"/>`,
    factory: `<path ${f('silver')} d="M6 90V50l20-14v14l20-14v14l20-14v14h28v40z"/><rect ${f('red')} x="72" y="18" width="10" height="46"/><path d="M72 26h10" stroke="#fff" stroke-width="3"/>
      <g ${f('silver')} stroke-width="2"><circle cx="80" cy="10" r="6"/><circle cx="92" cy="6" r="4"/></g><g ${f('sky')} stroke-width="2"><rect x="14" y="62" width="12" height="10"/><rect x="34" y="62" width="12" height="10"/><rect x="54" y="62" width="12" height="10"/></g><path d="M2 90h96"/>`,
    parking: `<path d="M50 70v24" stroke-width="5"/><rect ${f('blue')} x="18" y="8" width="64" height="64" rx="8"/><path d="M40 60V22h14a11 11 0 0 1 0 22H40" stroke="#fff" stroke-width="9" stroke-linecap="butt"/>`,
    theater: `<rect ${f('wood')} x="8" y="70" width="84" height="20"/><path ${f('dark')} d="M14 20h72v50H14z"/><path ${f('red')} d="M6 8h88v12H6z"/>
      <path ${f('red')} d="M8 20h24q-4 26 6 50H8zM92 20H68q4 26-6 50h30z"/><circle ${f('yellow')} cx="50" cy="56" r="6" stroke-width="2"/><path d="M44 30l6 14 6-14" stroke="${C.yellow}" stroke-width="2"/>`,

    // things
    magazine: `<rect ${f('pink')} x="20" y="8" width="60" height="84" rx="2"/><rect ${f('white')} x="26" y="14" width="48" height="12" stroke-width="2"/><path d="M30 20h40" stroke-width="3"/>
      <circle ${f('skin')} cx="50" cy="52" r="13" stroke-width="2.5"/><path fill="${C.hair}" d="M37 50q0-16 13-16t13 16q-4-8-13-8t-13 8z" stroke-width="2"/><path ${f('yellow')} d="M30 92q0-18 20-18t20 18z" stroke-width="2.5"/><path d="M26 34h10M66 72h8" stroke-width="2"/>`,
    paper: `<rect ${f('silver')} x="26" y="18" width="56" height="72" rx="2" transform="rotate(8 54 54)"/><rect ${f('white')} x="20" y="12" width="56" height="72" rx="2"/><path d="M62 12v14h14" stroke-width="2.5"/>`,
    mug: `<path d="M70 38h8a12 12 0 0 1 0 24h-8" stroke-width="6"/><rect ${f('blue')} x="20" y="26" width="52" height="60" rx="6"/><path ${f('pink')} d="M46 64c-8-6-12-10-12-14a6 6 0 0 1 12-2 6 6 0 0 1 12 2c0 4-4 8-12 14z" stroke-width="2.5"/>`,
    cigarette: `<g transform="rotate(-20 50 60)"><rect ${f('white')} x="10" y="56" width="64" height="12"/><rect ${f('orange')} x="10" y="56" width="18" height="12"/><rect ${f('red')} x="74" y="56" width="6" height="12" stroke-width="2.5"/></g>
      <path d="M84 40q-6-8 0-14t0-14" stroke="${C.gray}"/>`,
    handkerchief: `<path ${f('sky')} d="M14 20h72v60H14z"/><g stroke="#fff" stroke-width="4" opacity=".9"><path d="M14 36h72M14 52h72M14 68h72M30 20v60M46 20v60M62 20v60M78 20v60"/></g><path d="M14 20h72v60H14z"/><path ${f('white')} d="M86 80L62 80l24-24z" stroke-width="2.5"/>`,
    hanger: `<path d="M50 22q0-12 8-10 6 2 2 10l-10 6L10 50h80L50 28" stroke-width="3.5"/><path ${f('pink')} d="M24 46l-10 10 8 8 6-6v34h44V58l6 6 8-8-10-10q-12 6-26 6t-26-6z"/>`,
    suit: `<path ${f('navy')} d="M32 12l-18 10-8 66h22l2-30 20 30 20-30 2 30h22l-8-66-18-10-18 26z"/><path ${f('white')} d="M32 12l18 26 18-26q-18 6-36 0z" stroke-width="2.5"/>
      <path ${f('red')} d="M46 22h8l2 18-6 8-6-8z" stroke-width="2"/><path d="M32 12l10 30M68 12L58 42" stroke-width="2.5"/>`,
    dressshirt: `<path ${f('white')} d="M34 12l-18 8-10 34 12 4 6-18v52h52V40l6 18 12-4-10-34-18-8-16 10z"/><path ${f('white')} d="M34 12l16 10-8 10zM66 12L50 22l8 10z" stroke-width="2.5"/>
      <path d="M50 24v66" stroke-width="2"/><g fill="${INK}" stroke="none"><circle cx="54" cy="40" r="2"/><circle cx="54" cy="56" r="2"/><circle cx="54" cy="72" r="2"/></g><rect x="62" y="44" width="14" height="12" stroke-width="2"/>`,
    pocket: `<rect ${f('blue')} x="4" y="4" width="92" height="92" rx="4" stroke="none"/><path ${f('blue')} d="M18 24h64v42L50 88 18 66z"/><path d="M24 30h52v34L50 82 24 64z" stroke="${C.yellow}" stroke-width="2" stroke-dasharray="4 3"/>
      <path ${f('white')} d="M40 24V10h16v14" stroke-width="2.5"/><path d="M18 24h64" stroke-width="3"/>`,
    ballpoint: `<g transform="rotate(40 50 50)"><rect ${f('blue')} x="42" y="12" width="16" height="64" rx="4"/><path ${f('white')} d="M42 76h16l-6 14h-4z"/><rect ${f('silver')} x="46" y="4" width="8" height="10" rx="2"/>
      <path d="M58 18h4v30" stroke-width="3"/></g>`,
    fountainpen: `<g transform="rotate(40 50 50)"><rect ${f('black')} x="40" y="6" width="20" height="56" rx="8"/><path ${f('yellow')} d="M40 62h20l-2 8H42z" stroke-width="2.5"/><path ${f('yellow')} d="M42 70h16l-8 24z"/><path d="M50 76v12" stroke-width="2"/><circle fill="${INK}" cx="50" cy="78" r="2" stroke="none"/>
      <path d="M58 12h4v30" stroke="${C.yellow}" stroke-width="3"/></g>`,
    match: `<rect ${f('red')} x="10" y="56" width="52" height="32" rx="3"/><rect ${f('choc')} x="10" y="56" width="52" height="8" stroke-width="2.5"/>
      ${tube('M40 72L80 28', 'wood', 5)}<ellipse ${f('red')} cx="82" cy="26" rx="6" ry="8" transform="rotate(42 82 26)"/><path ${f('orange')} d="M84 22q-10-8-2-20 2 8 8 6 2 10-6 14z" stroke-width="2.5"/>`,
    tape: `<circle ${f('yellow')} cx="44" cy="52" r="34"/><circle ${f('paper')} cx="44" cy="52" r="14"/><circle cx="44" cy="52" r="24" stroke-width="2" opacity=".5"/>
      <path ${f('yellow')} d="M76 62l18 4-4 22-18-10z" stroke-width="2.5"/>`,
    record: `<circle ${f('black')} cx="50" cy="50" r="42"/><circle cx="50" cy="50" r="32" stroke="#555" stroke-width="2"/><circle cx="50" cy="50" r="24" stroke="#555" stroke-width="2"/>
      <circle ${f('red')} cx="50" cy="50" r="13"/><circle ${f('paper')} cx="50" cy="50" r="3" stroke-width="2"/><path d="M24 30q8-10 20-12" stroke="#888" stroke-width="3"/>`,
    fishbowl: `<path ${f('sky')} d="M30 18h40v6q22 12 18 40-4 26-38 26T12 64q-4-28 18-40z"/><path d="M14 44q36 6 72 0" stroke="${C.blue}" stroke-width="2.5"/>
      <path ${f('orange')} d="M36 62q10-12 24-4l8-6v20l-8-6q-14 8-24-4z"/><circle fill="${INK}" cx="42" cy="62" r="2" stroke="none"/><g ${f('white')} stroke-width="2"><circle cx="34" cy="50" r="3"/><circle cx="30" cy="40" r="2"/></g>
      <path ${f('green')} d="M70 86q-6-14 0-24 4 12 0 24z" stroke-width="2"/>`,
    pig: `<path ${f('pink')} d="M24 30l-6-18 18 10zM76 30l6-18-18 10z"/><circle ${f('pink')} cx="50" cy="52" r="34"/>${head(36, 44)}
      <ellipse ${f('rose')} cx="50" cy="64" rx="16" ry="11"/><g fill="${INK}" stroke="none"><ellipse cx="44" cy="64" rx="2.5" ry="4"/><ellipse cx="56" cy="64" rx="2.5" ry="4"/></g>`,
    balloons: `<path d="M30 52q4 20 18 40M54 46q-2 24-6 46M76 54q-10 18-28 38" stroke-width="2"/>
      <ellipse ${f('red')} cx="30" cy="34" rx="16" ry="20"/><ellipse ${f('yellow')} cx="56" cy="26" rx="16" ry="20"/><ellipse ${f('blue')} cx="76" cy="38" rx="15" ry="19"/>
      <g stroke="#fff" stroke-width="3" opacity=".7"><path d="M22 26q2-6 6-8M48 18q2-6 6-8M68 30q2-6 6-8"/></g>`,
    salt: shaker('white', 'silver'),
    pepper: shaker('choc', 'black'),
    sugar: `<g stroke-width="3"><path ${f('white')} d="M14 60l18-8 18 8v22l-18 8-18-8z"/><path d="M14 60l18 8 18-8M32 68v22" stroke-width="2"/>
      <path ${f('white')} d="M50 60l18-8 18 8v22l-18 8-18-8z"/><path d="M50 60l18 8 18-8M68 68v22" stroke-width="2"/>
      <path ${f('white')} d="M32 30l18-8 18 8v22l-18 8-18-8z"/><path d="M32 30l18 8 18-8M50 38v22" stroke-width="2"/></g>`,
    futon: `<path ${f('wood')} d="M4 84l14-30h64l14 30z" stroke-width="2.5"/><path ${f('white')} d="M18 78l10-24h44l10 24z"/><path ${f('blue')} d="M30 78l7-18h42l5 18z"/><path d="M40 66h40M38 72h44" stroke="#fff" stroke-width="2"/>
      <path ${f('white')} d="M26 60q2-6 8-6h10q4 0 2 6l-2 4H24z" stroke-width="2.5"/>`,
    tatami: `<rect ${f('mint')} x="14" y="6" width="72" height="88" rx="2"/><path d="M22 6v88M30 6v88M38 6v88M46 6v88M54 6v88M62 6v88M70 6v88M78 6v88" stroke="${C.green}" stroke-width="1.5"/>
      <rect fill="${C.board}" x="10" y="6" width="8" height="88" stroke-width="2.5"/><rect fill="${C.board}" x="82" y="6" width="8" height="88" stroke-width="2.5"/>`,
    manga: `<rect ${f('white')} x="14" y="6" width="72" height="88" rx="2"/><g stroke-width="2.5"><rect x="20" y="12" width="60" height="26"/><rect x="20" y="44" width="26" height="44"/><rect x="52" y="44" width="28" height="44"/></g>
      <path ${f('white')} d="M30 18h30a6 6 0 0 1 0 12H44l-6 6v-6h-8a6 6 0 0 1 0-12z" stroke-width="2"/><circle cx="33" cy="64" r="7" stroke-width="2"/><path d="M58 82l8-22 8 22" stroke-width="2"/><path d="M58 52l4 4M70 50l-2 6" stroke="${C.red}" stroke-width="2"/>`,
    thief: `<path ${f('wood')} d="M64 58q24-6 30 14 2 18-18 18-16-2-16-16z"/><path d="M72 56q2-8 8-6" stroke-width="2.5"/>
      ${FACE_BASE}<path fill="${C.black}" d="M14 44h72v14H14z" stroke-width="2"/><g ${f('white')} stroke="none"><ellipse cx="38" cy="51" rx="6" ry="4"/><ellipse cx="62" cy="51" rx="6" ry="4"/></g>${EYES}<path d="M42 76h16"/>`,
    lantern: `<path d="M50 2v8" stroke-width="3"/><rect ${f('black')} x="34" y="10" width="32" height="8" rx="2"/><rect ${f('black')} x="34" y="80" width="32" height="8" rx="2"/>
      <path ${f('red')} d="M36 18q-18 31 0 62h28q18-31 0-62z"/><path d="M26 34h48M22 49h56M26 64h48" stroke-width="2" opacity=".6"/><path d="M50 88v8" stroke-width="3"/>`,
    faucet: `<path d="M8 30h28" stroke-width="6"/><path ${f('silver')} d="M32 22h30q16 0 16 16v10H64v-6q0-6-6-6H32z"/><rect ${f('silver')} x="42" y="10" width="10" height="12"/><path d="M34 6h26" stroke-width="5"/>
      <path ${f('sky')} d="M71 56q-6 10-6 14a6 6 0 0 0 12 0q0-4-6-14z" stroke-width="2.5"/><path d="M71 80v4M71 88v4" stroke="${C.blue}" stroke-width="3"/>`,
    ricesack: `<path ${f('cream')} d="M24 26q-6 30 0 62h52q6-32 0-62z"/><path d="M24 26q26-8 52 0M30 16q20 6 40 0l6 10H24z" stroke-width="2.5"/><circle ${f('white')} cx="50" cy="58" r="14" stroke-width="2.5"/>
      <g ${f('white')} stroke-width="1.5"><ellipse cx="45" cy="56" rx="2.5" ry="4" transform="rotate(-20 45 56)"/><ellipse cx="53" cy="54" rx="2.5" ry="4" transform="rotate(20 53 54)"/><ellipse cx="50" cy="63" rx="2.5" ry="4"/></g>`,
    sandals: `<g ${f('orange')}><path d="M18 20q14-10 22 4 4 30-2 56-10 10-18 0-8-30-2-60z"/><path d="M60 20q14-10 22 4 4 30-2 56-10 10-18 0-8-30-2-60z"/></g>
      <path d="M29 30l-9 20M29 30l9 20M71 30l-9 20M71 30l9 20" stroke="${C.blue}" stroke-width="5"/>`,
    drawer: `<rect ${f('wood')} x="10" y="10" width="64" height="80" rx="2"/><path d="M10 36h64M10 62h64" stroke-width="2.5"/><path d="M36 22h12M36 76h12" stroke-width="4"/>
      <path ${f('wood')} d="M26 40h64l-6 22H20z"/><path ${f('cream')} d="M32 40h52l-2 6H34z" stroke-width="2"/><path d="M48 52h16" stroke-width="4"/>`,
    speaker: `<path ${f('dark')} d="M10 36h16l22-18v64L26 64H10z"/><g stroke="${C.blue}" stroke-width="4"><path d="M60 38q8 12 0 24M70 28q16 22 0 44M80 18q24 32 0 64"/></g>`,
    tools: `${tube('M20 80L64 36', 'wood', 8)}<path ${f('silver')} d="M56 18l26 26-8 8-26-26z"/><path ${f('silver')} d="M80 80L34 34"/>${tube('M80 80L40 40', 'silver', 8)}
      <path ${f('silver')} d="M30 18a14 14 0 0 0 4 22l6-6-6-6 6-6-4-4z" stroke-width="3"/>`,
    branch: `<path d="M10 86Q40 60 90 20M44 60q8-16 4-30M64 42q14 2 22 14" stroke="${C.brown}" stroke-width="5"/>
      <g ${f('green')} stroke-width="2.5"><path d="M48 30q-12-6-8-18 10 6 8 18z"/><path d="M86 56q4-12 14-10-4 12-14 10z"/><path d="M90 20q-2-12 8-14 0 12-8 14z"/><path d="M26 74q-12 2-16-8 10-2 16 8z"/></g>`,
    curtain: `<rect ${f('sky')} x="16" y="12" width="68" height="70"/><path d="M6 10h88" stroke-width="5"/>
      <path ${f('rose')} d="M10 10h22q-2 30 6 46-6 6-6 34H10z"/><path ${f('rose')} d="M90 10H68q2 30-6 46 6 6 6 34h22z"/><path d="M16 56h20M84 56H64" stroke="${C.yellow}" stroke-width="4"/>`,
    cart: `<path d="M4 16h14l12 50h50l8-38H24" stroke-width="5"/><path d="M30 66l-4 10h56" stroke-width="4"/><circle ${f('dark')} cx="34" cy="86" r="6"/><circle ${f('dark')} cx="76" cy="86" r="6"/>
      <rect ${f('red')} x="34" y="20" width="16" height="22" stroke-width="2.5"/><circle ${f('green')} cx="62" cy="34" r="10" stroke-width="2.5"/><rect ${f('yellow')} x="44" y="40" width="30" height="16" stroke-width="2.5"/>`,
    shelves: `<rect ${f('wood')} x="10" y="6" width="80" height="88"/><path d="M10 34h80M10 64h80" stroke-width="4"/><path d="M10 94v4M90 94v4" stroke-width="4"/>
      <g stroke-width="2.5"><rect ${f('red')} x="18" y="14" width="8" height="20"/><rect ${f('blue')} x="27" y="12" width="8" height="22"/><rect ${f('yellow')} x="36" y="16" width="8" height="18"/>
      <path ${f('sky')} d="M58 34V22q0-4 4-4h12q4 0 4 4v12z"/><path ${f('green')} d="M22 64q-2-14 8-16h8q10 2 8 16z"/><rect ${f('white')} x="58" y="44" width="22" height="20" rx="3"/></g>`,
    finger: `<path ${f('skin')} d="M26 92V62q-2-10 4-12l6-2V16q0-8 7-8t7 8v32l14 2q8 2 8 10v4q6 0 8 6v12q0 10-10 20z"/><path d="M50 50v14M64 54v10" stroke-width="2.5"/>`,
    onsen: `<path ${f('red')} d="M14 62q0 26 36 26t36-26q-4 8-36 8T14 62z"/><path d="M14 62q0-10 14-12M86 62q0-10-14-12" stroke="${C.red}" stroke-width="5"/>
      <g stroke="${C.red}" stroke-width="5"><path d="M34 52q-8-8 0-16t0-16M50 52q-8-8 0-16t0-16M66 52q-8-8 0-16t0-16"/></g>`,
    circle: `<circle cx="50" cy="50" r="36" stroke="${C.red}" stroke-width="9"/>`,
    square: `<rect x="16" y="16" width="68" height="68" stroke="${C.blue}" stroke-width="9" stroke-linejoin="miter"/>`,
    plant: `<path ${f('green')} d="M50 60q-30-4-34-30 24 0 34 30zM50 60q30-4 34-30-24 0-34 30zM50 60q-12-26 0-48 12 22 0 48z"/><path d="M50 60V48" stroke-width="3"/>
      <path ${f('orange')} d="M28 60h44l-6 32H34z"/><path ${f('orange')} d="M24 56h52v8H24z"/>`,
    lightswitch: `<rect ${f('white')} x="24" y="8" width="52" height="84" rx="6"/><rect ${f('silver')} x="38" y="26" width="24" height="48" rx="4"/><path ${f('white')} d="M40 30h20v20H40z" stroke-width="2.5"/>
      <g fill="${INK}" stroke="none"><circle cx="50" cy="16" r="2.5"/><circle cx="50" cy="84" r="2.5"/></g>`,
    soup: `<g stroke="${C.gray}"><path d="M34 32q-5-6 0-12t0-12M50 32q-5-6 0-12t0-12M66 32q-5-6 0-12t0-12"/></g><path ${f('white')} d="M8 44h84q-2 36-42 36T8 44z"/><ellipse fill="${C.orange}" cx="50" cy="45" rx="40" ry="6"/>
      <path ${f('white')} d="M30 84h40" stroke-width="5"/>${tube('M72 40L92 18', 'silver', 5)}`,
    ski: `${tube('M14 88L80 10', 'red', 6)}${tube('M30 92L92 22', 'red', 6)}<path d="M80 10q6-6 10 0M92 22q6-4 6 4" stroke-width="3"/>
      <path d="M22 18l50 72M36 14l44 66" stroke-width="3"/><circle ${f('black')} cx="24" cy="22" r="5" stroke-width="2"/><circle ${f('black')} cx="38" cy="18" r="5" stroke-width="2"/>`,
    skate: `<path ${f('white')} d="M24 12h22q4 22 18 30 22 6 22 22v6H20V22q0-10 4-10z"/><path d="M30 26h12M30 36h14M32 46h16" stroke-width="2.5"/><path ${f('red')} d="M20 62h66v8H20z"/>
      <path d="M26 70v10M78 70v10" stroke-width="3"/><path ${f('silver')} d="M12 80h80q4 0 4-6" stroke-width="4"/>`,
    album: `<rect ${f('green')} x="14" y="8" width="72" height="84" rx="4"/><path d="M22 8v84" stroke-width="2.5"/><rect ${f('white')} x="34" y="22" width="40" height="32" stroke-width="2.5" transform="rotate(-6 54 38)"/>
      <path ${f('sky')} d="M38 28h32v20H38z" stroke-width="2" transform="rotate(-6 54 38)"/><rect ${f('cream')} x="36" y="64" width="38" height="14" rx="2" stroke-width="2.5"/>`,
    plank: `<path ${f('wood')} d="M8 34l70-20 14 10-70 20z"/><path ${f('wood')} d="M22 44l70-20v14L22 58z"/><path ${f('brown')} d="M8 34l14 10v14L8 48z"/><path d="M30 36q20-8 36-12M44 42q14-4 24-8" stroke="${C.brown}" stroke-width="2"/>`,
    riceplant: `<path d="M50 92V40M40 92q0-30-14-48M60 92q0-30 14-48" stroke="${C.leaf}" stroke-width="4"/><path ${f('green')} d="M50 70q-20-6-28-24 18 4 28 24zM50 64q20-8 30-20-20 2-30 20z" stroke-width="2.5"/>
      <g ${f('yellow')} stroke-width="2">${[[50, 34], [46, 26], [54, 22], [26, 46], [22, 38], [74, 46], [78, 38], [50, 16]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3.5" ry="5"/>`).join('')}</g>`,
    sofa: `<rect ${f('red')} x="14" y="24" width="72" height="34" rx="8"/><rect ${f('red')} x="6" y="44" width="16" height="36" rx="6"/><rect ${f('red')} x="78" y="44" width="16" height="36" rx="6"/>
      <rect ${f('red')} x="20" y="54" width="60" height="22" rx="4"/><path d="M50 54v22" stroke-width="2.5"/><path d="M14 80v8M86 80v8" stroke-width="5"/>`,
    whiskey: `<path ${f('wood')} d="M14 34h30v54H14z"/><rect ${f('wood')} x="22" y="12" width="14" height="22"/><rect ${f('black')} x="21" y="6" width="16" height="8" stroke-width="2.5"/><rect ${f('cream')} x="18" y="50" width="22" height="20" stroke-width="2.5"/>
      <path ${f('white')} d="M56 52h34l-4 36H60z"/><path fill="${C.wood}" stroke="none" d="M57.5 68h31l-2.5 18H60z"/><path d="M56 52h34l-4 36H60z"/><rect ${f('sky')} x="64" y="60" width="12" height="12" rx="2" stroke-width="2" transform="rotate(12 70 66)"/>`,
    satellite: `<g transform="rotate(-30 50 50)"><rect ${f('blue')} x="2" y="40" width="30" height="20"/><path d="M12 40v20M22 40v20" stroke="#fff" stroke-width="2"/><rect ${f('blue')} x="68" y="40" width="30" height="20"/><path d="M78 40v20M88 40v20" stroke="#fff" stroke-width="2"/>
      <path d="M32 50h8M60 50h8" stroke-width="3"/><rect ${f('yellow')} x="40" y="38" width="20" height="24" rx="2"/><path ${f('silver')} d="M50 38V30M42 22q8 10 16 0z" stroke-width="2.5"/></g>`,
    card: `<rect ${f('blue')} x="6" y="20" width="88" height="60" rx="6"/><rect fill="${C.dark}" x="6" y="32" width="88" height="10" stroke="none"/><rect ${f('yellow')} x="16" y="48" width="16" height="12" rx="2" stroke-width="2.5"/>
      <path d="M16 70h40" stroke="#fff" stroke-width="3" stroke-dasharray="6 3"/><circle ${f('red')} cx="72" cy="62" r="8" stroke-width="2"/><circle ${f('orange')} cx="82" cy="62" r="8" stroke-width="2"/>`,
    basket: `<path d="M22 46q0-34 28-34t28 34" stroke-width="5"/><path ${f('wood')} d="M10 44h80l-8 44H18z"/><g stroke="${C.brown}" stroke-width="2.5"><path d="M14 58h72M16 72h68M30 44l-2 44M50 44v44M70 44l2 44"/></g>`,
    katana: `<path ${f('silver')} d="M24 72L88 8q4 0 2 6L30 78z"/><path d="M34 66L84 14" stroke="#fff" stroke-width="2"/><ellipse ${f('yellow')} cx="26" cy="74" rx="10" ry="4" transform="rotate(45 26 74)"/>
      ${tube('M22 78L8 92', 'black', 7)}<path d="M18 82l-4 4M14 86l-2 2" stroke="${C.white}" stroke-width="2"/>`,
    templebell: `<path d="M6 12h88" stroke="${C.brown}" stroke-width="8"/><path d="M14 12v80M86 12v80" stroke="${C.brown}" stroke-width="5"/><path d="M50 16v6" stroke-width="4"/>
      <path ${f('green')} d="M36 22h28q6 0 6 8v40q0 6 6 8H24q6-2 6-8V30q0-8 6-8z"/><g fill="${INK}" stroke="none" opacity=".35">${[32, 40, 48].map(y => [40, 50, 60].map(x => `<circle cx="${x}" cy="${y}" r="2"/>`).join('')).join('')}</g>
      <path d="M30 58h40" stroke-width="2.5"/><circle ${f('yellow')} cx="50" cy="66" r="4" stroke-width="2"/>`,
    can: `<rect ${f('red')} x="28" y="14" width="44" height="74" rx="6"/><ellipse ${f('silver')} cx="50" cy="16" rx="22" ry="6"/><path d="M44 14h10" stroke-width="3"/>
      <path d="M28 40q22 14 44 0v20q-22 14-44 0z" fill="#fff" stroke="none"/><path d="M36 26v52" stroke="#fff" stroke-width="3" opacity=".5"/><rect x="28" y="14" width="44" height="74" rx="6"/>`,
    gears: `<path ${f('silver')} d="${gearPath(38, 56, 32, 24, 10)}"/><circle ${f('paper')} cx="38" cy="56" r="9"/>
      <path ${f('orange')} d="${gearPath(72, 28, 20, 14, 8)}"/><circle ${f('paper')} cx="72" cy="28" r="6"/>`,
    campfire: `<path ${f('orange')} d="M50 72c-16 0-24-10-22-22 2-10 10-14 10-26 8 4 12 12 12 18 4-4 4-10 2-16 14 8 22 22 20 32-2 10-10 14-22 14z"/>
      <path ${f('yellow')} d="M50 70c-7 0-10-5-9-11s6-7 7-12c6 4 10 9 10 14s-3 9-8 9z" stroke-width="2.5"/>${tube('M16 90L84 74', 'brown', 8)}${tube('M16 74L84 90', 'brown', 8)}`,
    safe: `<rect ${f('dark')} x="10" y="12" width="80" height="72" rx="6"/><rect ${f('silver')} x="18" y="20" width="64" height="56" rx="3"/><circle ${f('white')} cx="50" cy="48" r="16"/>
      <path d="M50 34v6M50 56v6M36 48h6M58 48h6" stroke-width="2"/><path d="M50 48l8-6" stroke="${C.red}" stroke-width="3"/><path d="M74 38v20" stroke-width="5"/><path d="M16 84v8M84 84v8" stroke-width="5"/>`,
    muscle: `<path ${f('skin')} d="M8 86V66q0-10 10-12l20-2q-6-12-4-24 2-14 16-18 10-2 14 6l2 8q-2 6-8 6l-6-2q-2 8 2 16 12-8 26-2 12 8 10 26-2 18-24 20H8z"/><path d="M50 52q10-6 20 0" stroke-width="2.5"/><path d="M84 30l8-6M88 42l10-2M80 20l4-8" stroke="${C.orange}" stroke-width="3"/>`,
    chain: `<g stroke-width="7">${[0, 1, 2, 3].map(i => `<rect x="${6 + i * 20}" y="${i % 2 ? 42 : 36}" width="30" height="${i % 2 ? 16 : 28}" rx="${i % 2 ? 8 : 14}"/>`).join('')}</g>
      <g stroke="${C.silver}" stroke-width="3.5">${[0, 1, 2, 3].map(i => `<rect x="${6 + i * 20}" y="${i % 2 ? 42 : 36}" width="30" height="${i % 2 ? 16 : 28}" rx="${i % 2 ? 8 : 14}"/>`).join('')}</g>`,
    xmastree: `<rect ${f('brown')} x="44" y="80" width="12" height="12"/><path ${f('green')} d="M50 10L18 52h12L12 82h76L70 52h12z"/><path ${f('yellow')} d="${starPath(50, 12, 10, 4)}" stroke-width="2"/>
      <g stroke-width="2"><circle ${f('red')} cx="40" cy="44" r="4"/><circle ${f('blue')} cx="60" cy="56" r="4"/><circle ${f('yellow')} cx="34" cy="70" r="4"/><circle ${f('red')} cx="64" cy="74" r="4"/></g><path d="M30 60q20 8 40-6" stroke="${C.yellow}" stroke-width="2.5"/>`,
    lipstick: `<rect ${f('black')} x="34" y="52" width="32" height="40" rx="3"/><rect ${f('yellow')} x="38" y="36" width="24" height="18"/><path ${f('red')} d="M42 36V20l16-10v26z"/><path d="M38 64h24" stroke="${C.yellow}" stroke-width="3"/>`,
    coin: `<circle ${f('yellow')} cx="50" cy="50" r="36"/><circle cx="50" cy="50" r="27" stroke-width="2.5"/><text x="50" y="58" class="lis-art-glyph lis-art-glyph-lg" fill="${INK}" stroke="none">100</text><path d="M28 28q6-8 16-10" stroke="#fff" stroke-width="3.5"/>`,
    parcel: `<path ${f('wood')} d="M10 34l40-16 40 16v40L50 92 10 74z"/><path d="M10 34l40 16 40-16M50 50v42" stroke-width="2.5"/>
      <path d="M30 26l40 16v14M30 42l40-16" stroke="${C.red}" stroke-width="4"/><path d="M30 42v40M70 42v40" stroke="${C.red}" stroke-width="3"/><rect ${f('white')} x="56" y="58" width="22" height="14" stroke-width="2" transform="skewY(-22)"/>`,
    wheat: `<path d="M50 92V20M50 92q-10-20-26-30M50 92q10-20 26-30" stroke="${C.wood}" stroke-width="3"/>
      <g fill="${C.yellow}" stroke-width="2">${[24, 32, 40, 48].map(y => `<ellipse cx="44" cy="${y}" rx="4" ry="6" transform="rotate(-30 44 ${y})"/><ellipse cx="56" cy="${y}" rx="4" ry="6" transform="rotate(30 56 ${y})"/>`).join('')}<ellipse cx="50" cy="14" rx="4" ry="6"/>
      ${[[22, 58], [28, 52], [78, 58], [72, 52]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3.5" ry="5" transform="rotate(${x < 50 ? -50 : 50} ${x} ${y})"/>`).join('')}</g>`,
    banknote: `<rect ${f('beige')} x="4" y="22" width="92" height="56" rx="3"/><rect x="10" y="28" width="80" height="44" rx="2" stroke-width="2"/><circle ${f('white')} cx="70" cy="50" r="13" stroke-width="2.5"/>
      <circle ${f('skin')} cx="70" cy="47" r="5" stroke-width="2"/><path d="M62 60q8-8 16 0" stroke-width="2"/><text x="32" y="58" class="lis-art-glyph lis-art-glyph-lg" fill="${INK}" stroke="none">¥</text>`,
    sprout: `<path ${f('brown')} d="M14 74q36-12 72 0v16H14z"/><path d="M50 76V44" stroke="${C.leaf}" stroke-width="5"/><path ${f('green')} d="M50 48q-6-22-30-20 2 22 30 20zM50 44q4-24 30-24 0 24-30 24z"/>`,
    blanket: `<path ${f('purple')} d="M8 36h84v40H8z"/><path ${f('purple')} d="M8 36q-4 10 4 14l-4 12q-4 8 4 14"/><path d="M8 48h84M8 62h84" stroke="#fff" stroke-width="2" stroke-dasharray="5 4"/>
      <path ${f('pink')} d="M8 22h84v14H8z"/><path d="M14 76v8M28 76v8M42 76v8M56 76v8M70 76v8M84 76v8" stroke-width="2"/>`,
    lighter: `<rect ${f('red')} x="30" y="36" width="36" height="56" rx="6"/><rect ${f('silver')} x="30" y="24" width="36" height="14" rx="2"/><circle ${f('dark')} cx="56" cy="30" r="5" stroke-width="2"/>
      <path ${f('orange')} d="M42 22c-6-6-2-14 2-20 2 6 8 8 6 16-1 4-4 6-8 4z" stroke-width="2.5"/>`,
    soba: `<rect ${f('wood')} x="6" y="62" width="88" height="10"/><path d="M10 72v14h80V72" stroke-width="3"/><path ${f('choc')} d="M14 62q8-28 36-28t36 28z"/>
      <path d="M22 60q8-18 28-20M30 60q6-14 24-14M38 60q6-8 18-8M60 40q14 4 20 20M52 46q12 4 16 14" stroke="#a88b6a" stroke-width="2.5"/><path ${f('green')} d="M48 30q2-6 8-4-2 6-8 4z" stroke-width="2"/>`,
    scale: `<rect ${f('silver')} x="10" y="40" width="80" height="50" rx="10"/><rect ${f('white')} x="26" y="50" width="48" height="24" rx="4"/><path d="M50 74L42 54" stroke="${C.red}" stroke-width="3"/>
      <path d="M32 58h4M40 54l2 3M50 52v4M60 54l-2 3M68 58h-4" stroke-width="2"/>`,
    typewriter: `<path ${f('green')} d="M10 52l8-18h64l8 18v32H10z"/><rect ${f('white')} x="28" y="8" width="44" height="30" stroke-width="2.5"/><path d="M34 18h30M34 26h24" stroke-width="2"/><rect ${f('dark')} x="20" y="30" width="60" height="8" rx="4"/>
      <g ${f('white')} stroke-width="1.5">${[0, 1, 2].map(r => [0, 1, 2, 3, 4, 5, 6].map(c => `<circle cx="${22 + c * 9.3 + r * 3}" cy="${58 + r * 9}" r="3.2"/>`).join('')).join('')}</g>`,
    treasure: `<path ${f('brown')} d="M10 50h80v40H10z"/><path ${f('brown')} d="M10 50q0-28 40-28t40 28z"/><path d="M10 50h80M30 24v66M70 24v66" stroke="${C.yellow}" stroke-width="5"/><rect ${f('yellow')} x="42" y="44" width="16" height="16" rx="2"/>
      <path ${f('yellow')} d="M20 22l4-8 4 8-4 4zM76 18l3-6 3 6-3 3z" stroke-width="1.5"/>`,
    cheese: `<path ${f('yellow')} d="M8 64l66-40 18 22v32L8 82z"/><path d="M74 24v22l18 0M74 46L8 64" stroke-width="2.5"/><g ${f('orange')} stroke-width="2"><ellipse cx="30" cy="72" rx="5" ry="4"/><ellipse cx="60" cy="66" rx="6" ry="5"/><circle cx="80" cy="60" r="3"/><circle cx="50" cy="48" r="3.5"/></g>`,
    dress: `<path ${f('purple')} d="M38 8l4 14-6 20-22 50h72L64 42l-6-20 4-14-12 6z"/><path d="M36 42h28" stroke="${C.yellow}" stroke-width="4"/><path d="M40 60q-6 16-12 32M60 60q6 16 12 32" stroke-width="2" opacity=".6"/>`,
    rope: `<g stroke-width="11">${[30, 22, 14].map((r, i) => `<circle cx="50" cy="48" r="${r}"/>`).join('')}<path d="M80 48q4 30 14 44"/></g>
      <g stroke="${C.wood}" stroke-width="6" stroke-dasharray="5 2">${[30, 22, 14].map(r => `<circle cx="50" cy="48" r="${r}"/>`).join('')}<path d="M80 48q4 30 14 44"/></g>`,
    violin: `<g transform="rotate(30 50 50) translate(6 4) scale(.9)"><path ${f('brown')} d="M38 40q-8-6-4-14 6-6 16-4 10-2 16 4 4 8-4 14 4 6 0 10 10 6 8 18-2 14-20 16-18-2-20-16-2-12 8-18-4-4 0-10z"/>
      <path d="M44 56q-4 4 0 8M56 56q4 4 0 8" stroke-width="2"/><rect ${f('black')} x="46" y="2" width="8" height="34"/><path d="M48 6v74M52 6v74" stroke-width="1"/><rect ${f('black')} x="44" y="76" width="12" height="6" rx="2" stroke-width="2"/></g>
      <path d="M8 86L92 30" stroke="${C.brown}" stroke-width="3"/>`,
    passport: `<rect ${f('red')} x="20" y="6" width="60" height="88" rx="4"/><circle cx="50" cy="40" r="14" stroke="${C.yellow}" stroke-width="3"/><path d="M50 26v28M36 40h28M40 30q10 10 20 0M40 50q10-10 20 0" stroke="${C.yellow}" stroke-width="2"/>
      <path d="M34 68h32M38 76h24" stroke="${C.yellow}" stroke-width="3"/>`,
    feather: `<path ${f('white')} d="M20 86q4-50 34-70 22-14 34-8-2 22-18 42-18 24-50 36z"/><path d="M14 92L72 24" stroke-width="3"/><path d="M40 60l-12-4M50 48l-12-6M58 38l-8-8M44 58l14 2M54 46l14 0M62 36l10-2" stroke-width="2"/>`,
    bottle: `<rect ${f('green')} x="30" y="40" width="40" height="52" rx="8"/><path ${f('green')} d="M40 10h20v14q10 6 10 18H30q0-12 10-18z"/><rect ${f('wood')} x="40" y="4" width="20" height="10" rx="2"/>
      <rect ${f('cream')} x="36" y="54" width="28" height="22" rx="2" stroke-width="2.5"/><path d="M36 46v38" stroke="#fff" stroke-width="3" opacity=".6"/>`,
    recorder: `<g transform="rotate(35 50 50)"><path ${f('cream')} d="M44 4h12v10l-2 4v64l4 10H42l4-10V18l-2-4z"/><path d="M44 10h12" stroke-width="2.5"/><g fill="${INK}" stroke="none">${[30, 40, 50, 60, 70].map(y => `<circle cx="50" cy="${y}" r="2.5"/>`).join('')}</g></g>
      <g stroke="${C.blue}" stroke-width="2.5"><path d="M12 24v12M16 22v12M12 36a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM16 34a3 3 0 1 1-6 0"/></g>`,
    paperbag: `<path ${f('wood')} d="M18 30h64l-4 62H22z"/><path ${f('wood')} d="M18 30l8-12h48l8 12" stroke-width="2.5"/><path d="M38 30q0-16 12-16t12 16" stroke-width="3"/><path ${f('green')} d="M38 22q-6-10 2-16 6 8-2 16zM46 22q2-14 12-16-2 12-12 16z" stroke-width="2"/>`,
    brush: `<g transform="rotate(35 50 50)"><rect ${f('wood')} x="44" y="4" width="12" height="60" rx="3"/><path d="M44 12h12" stroke-width="2"/><path ${f('black')} d="M44 64h12q4 16-6 30-10-14-6-30z"/></g><path d="M8 88q20-8 34 0" stroke="${C.black}" stroke-width="5"/>`,
    bench: `<path d="M18 62v26M82 62v26" stroke-width="5"/><rect ${f('wood')} x="10" y="54" width="80" height="10" rx="2"/><rect ${f('wood')} x="10" y="22" width="80" height="10" rx="2"/><rect ${f('wood')} x="10" y="36" width="80" height="10" rx="2"/><path d="M18 32v22M82 32v22" stroke-width="4"/>`,
    gem: `<path ${f('sky')} d="M24 16h52l18 22-44 50L6 38z"/><path d="M6 38h88M24 16l14 22 12-22 12 22 14-22M38 38l12 50 12-50" stroke-width="2.5"/><path d="M28 28l4-6" stroke="#fff" stroke-width="3.5"/>`,
    pine: `<path d="M48 92V54l-8-14M50 70l14-16" stroke="${C.brown}" stroke-width="7"/><path d="M48 92V54l-8-14M50 70l14-16" stroke-width="1.5"/>
      <g ${f('leaf')}><path d="M16 46q14-16 40-10 4 10-10 14-18 4-30-4z"/><path d="M50 56q16-14 40-6-2 10-16 12-14 2-24-6z"/><path d="M26 28q16-20 44-12 2 10-12 14-20 4-32-2z"/></g><path d="M2 92h96"/>`,
    fence: `<path d="M4 44h92M4 70h92" stroke="${C.brown}" stroke-width="7"/><path d="M4 44h92M4 70h92" stroke-width="1.5"/>
      <g ${f('wood')}>${[10, 30, 50, 70, 90].map(x => `<path d="M${x - 6} 92V24l6-8 6 8v68z"/>`).join('')}</g><path ${f('grass')} d="M2 88h96v6H2z" stroke="none"/>`,
    brickwall: `<rect ${f('red')} x="4" y="14" width="92" height="76"/><g stroke="${C.cream}" stroke-width="2.5">${[0, 1, 2, 3, 4, 5].map(r => `<path d="M4 ${27 + r * 12.6}h92"/>`).join('')}
      ${[0, 1, 2, 3, 4, 5].map(r => [0, 1, 2, 3].map(c => `<path d="M${(r % 2 ? 14 : 26) + c * 24} ${14 + r * 12.6}v12.6"/>`).join('')).join('')}</g><rect x="4" y="14" width="92" height="76"/>`,
    shield: `<path ${f('silver')} d="M50 6l38 12q2 46-38 76Q10 64 12 18z"/><path ${f('blue')} d="M50 16l28 9q0 34-28 56-28-22-28-56z"/><path ${f('yellow')} d="${starPath(50, 46, 14, 6)}" stroke-width="2"/>`,
    pudding: `<ellipse ${f('white')} cx="50" cy="84" rx="40" ry="8"/><path ${f('yellow')} d="M28 34h44l10 46H18z"/><path ${f('choc')} d="M28 34q22-8 44 0l2 10q-12 6-22 0-12 6-26 0z"/>
      <circle ${f('red')} cx="50" cy="22" r="7" stroke-width="2.5"/><path d="M50 15q2-6 6-8" stroke-width="2"/><path d="M28 56q2 14-2 22" stroke="#fff" stroke-width="3" opacity=".6"/>`,
    brain: `<path ${f('pink')} d="M48 16q-12-6-20 2-12 0-14 12-10 6-6 18-4 12 6 20 2 12 16 12 8 8 18 2zM52 16q12-6 20 2 12 0 14 12 10 6 6 18 4 12-6 20-2 12-16 12-8 8-18 2z"/>
      <path d="M50 16v66M28 30q8 4 6 12M24 54q10-2 12 8M72 30q-8 4-6 12M76 54q-10-2-12 8M40 70q4 6 0 10M60 70q-4 6 0 10" stroke-width="2.5"/>`,
    inkbottle: `<path ${f('navy')} d="M18 48q0-12 14-14h36q14 2 14 14v36a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6z"/><rect ${f('black')} x="34" y="16" width="32" height="18" rx="3"/><rect ${f('white')} x="28" y="54" width="44" height="22" rx="3" stroke-width="2.5"/>
      <path ${f('blue')} d="M50 58q-6 8-6 11a6 6 0 0 0 12 0q0-3-6-11z" stroke-width="2"/>`,
    judogi: `<path ${f('white')} d="M30 12L8 24v24h20v42h44V48h20V24L70 12z"/><path d="M40 12l10 30 10-30" stroke-width="3"/><path d="M50 42L40 90" stroke-width="2.5"/>
      <rect ${f('black')} x="26" y="50" width="48" height="10"/>${tube('M44 60l-8 22', 'black', 6)}${tube('M56 60l8 22', 'black', 6)}`,
    luggage: `<rect ${f('wood')} x="8" y="46" width="44" height="42" rx="3"/><path d="M8 60h44M30 46v42" stroke="${C.brown}" stroke-width="3"/>
      <rect ${f('blue')} x="54" y="30" width="38" height="58" rx="6"/><path d="M66 30v-8h14v8" stroke-width="4"/><path d="M60 46h26" stroke-width="2"/>
      <rect ${f('red')} x="16" y="20" width="30" height="26" rx="4"/><path d="M24 20v-6h14v6" stroke-width="3"/>`,
  });

  // A calendar page with the day's element on it (月 moon, 火 fire, 水 water…).
  const weekday = el => `<rect ${f('white')} x="8" y="10" width="84" height="84" rx="6"/><path ${f('red')} d="M8 16a6 6 0 0 1 6-6h72a6 6 0 0 1 6 6v10H8z"/><path d="M28 4v12M72 4v12" stroke-width="4"/>
    <g transform="translate(25 30) scale(.6)">${el}</g>`;
  const SOIL = `<path ${f('brown')} d="M8 84q8-40 42-44t42 44z"/><g fill="${C.choc}" stroke="none"><circle cx="34" cy="66" r="3"/><circle cx="56" cy="58" r="3"/><circle cx="66" cy="74" r="3"/><circle cx="44" cy="78" r="2.5"/></g>`;
  const hand = (x, y, rot, color = 'skin') => `<g transform="translate(${x} ${y}) rotate(${rot})"><path ${f(color)} d="M-12 14v-18q0-6 6-6h16q8 0 8 8v16z"/><path ${f(color)} d="M-12 -2q-8-2-8-8 2-6 10-2z"/></g>`;
  const thumb = up => `<g${up ? '' : ' transform="rotate(180 50 50)"'}><path ${f('skin')} d="M30 46h14l8-26q2-8 10-6 6 2 4 12l-4 14h16q8 0 8 8l-6 30q-2 8-10 8H44q-6 0-8-4H30z"/>
    <rect ${f(up ? 'blue' : 'red')} x="14" y="44" width="18" height="44" rx="2"/><path d="M68 58h12M66 70h12" stroke-width="2.5"/></g>`;
  const symbol = (d, color) => `<path d="${d}" stroke="${INK}" stroke-width="16"/><path d="${d}" stroke="${col(color)}" stroke-width="10"/>`;

  Object.assign(ICONS, {
    // days of the week
    monday: weekday(ICONS.moon), tuesday: weekday(ICONS.fire), wednesday: weekday(ICONS.water), thursday: weekday(ICONS.tree),
    friday: weekday(ICONS.coin), saturday: weekday(SOIL), sunday: weekday(ICONS.sun),

    // meals and food
    breakfast: `<ellipse ${f('white')} cx="50" cy="60" rx="44" ry="30"/><path ${f('wood')} d="M14 50q0-14 10-14h20q10 0 10 14v26H14z"/><path ${f('cream')} d="M19 52q0-10 7-10h16q7 0 7 10v20H19z" stroke-width="2"/>
      <path ${f('white')} d="M60 46q14-8 26 2 6 12-4 20-14 6-24-4-6-10 2-18z"/><circle ${f('yellow')} cx="72" cy="56" r="7" stroke-width="2.5"/>`,
    dinner: `<path ${f('dark')} d="M4 72h92v14H4z"/><ellipse ${f('white')} cx="30" cy="62" rx="20" ry="10"/><path ${f('white')} d="M18 52q12-10 24 0z" stroke-width="2.5"/>
      <path ${f('rose')} d="M54 60q14-12 36 0-12 10-36 0z"/><path d="M90 60l6-6v12z" stroke-width="2.5"/><path ${f('yellow')} d="M82 10a14 14 0 1 0 10 22 11 11 0 0 1-10-22z" stroke-width="2.5"/>
      <g fill="${C.yellow}" stroke="none"><circle cx="20" cy="16" r="2"/><circle cx="44" cy="24" r="2"/><circle cx="60" cy="10" r="2"/></g>`,
    honey: `<path ${f('orange')} d="M26 40q0-10 10-10h28q10 0 10 10v42a8 8 0 0 1-8 8H34a8 8 0 0 1-8-8z"/><rect ${f('white')} x="24" y="20" width="52" height="12" rx="3"/>
      <path ${f('yellow')} d="M50 46l10 6v12l-10 6-10-6V52z" stroke-width="2.5"/><path ${f('orange')} d="M60 20q4 12 0 18" stroke-width="2.5"/><ellipse ${f('yellow')} cx="82" cy="20" rx="7" ry="5" stroke-width="2"/><path d="M78 16l-2-6M86 16l2-6" stroke-width="2"/>`,
    steak: `<ellipse ${f('dark')} cx="50" cy="64" rx="46" ry="24"/><ellipse ${f('silver')} cx="50" cy="60" rx="40" ry="20"/><path ${f('brown')} d="M24 56q2-16 28-16 26 2 24 18-4 12-26 12-28-2-26-14z"/>
      <path d="M34 50l10 12M48 46l12 14M62 48l8 10" stroke="${C.choc}" stroke-width="3"/><g stroke="${C.gray}"><path d="M30 34q-4-6 0-12M50 30q-4-6 0-12M70 34q-4-6 0-12"/></g>`,
    butter: `<ellipse ${f('white')} cx="50" cy="70" rx="44" ry="16"/><path ${f('yellow')} d="M24 46l34-12 22 12v20L46 78 24 66z"/><path d="M24 46l22 12 34-12M46 58v20" stroke-width="2.5"/>`,
    misosoup: `<path ${f('red')} d="M10 46h80q-2 40-40 40T10 46z"/><ellipse fill="#c98a4b" cx="50" cy="47" rx="38" ry="7"/><g stroke-width="2"><rect ${f('white')} x="30" y="42" width="8" height="7"/><rect ${f('white')} x="56" y="44" width="8" height="7"/></g>
      <path d="M42 44q6 2 10-2" stroke="${C.leaf}" stroke-width="3"/><g stroke="${C.gray}"><path d="M36 34q-4-6 0-12M60 34q-4-6 0-12"/></g>`,
    feast: `<path ${f('wood')} d="M4 60h92v10H4z"/><path d="M14 70v20M86 70v20" stroke-width="5"/><ellipse ${f('white')} cx="26" cy="56" rx="18" ry="6"/><path ${f('brown')} d="M14 54q12-20 24 0z"/>
      <ellipse ${f('white')} cx="72" cy="56" rx="20" ry="6"/><path ${f('red')} d="M58 54q2-10 10-10h8q10 2 10 10z"/><path ${f('green')} d="M40 50q4-14 10-14t10 14z"/><circle ${f('yellow')} cx="50" cy="28" r="6" stroke-width="2.5"/><path d="M50 22v-8" stroke-width="2"/>`,
    mealset: `<ellipse ${f('white')} cx="50" cy="56" rx="26" ry="26"/><circle cx="50" cy="56" r="18" stroke-width="2"/><path d="M14 30v50M10 30v14q0 6 4 6t4-6V30" stroke-width="3"/><path ${f('silver')} d="M84 30q8 6 4 26h-4z"/><path d="M86 56v24" stroke-width="3"/>`,
    chawan: `<path ${f('white')} d="M10 40h80q-4 40-40 40T10 40z"/><ellipse ${f('cream')} cx="50" cy="41" rx="40" ry="6"/><path d="M26 56q6-4 12 0t12 0 12 0 12 0" stroke="${C.blue}" stroke-width="3"/><path d="M34 80h32v8H34z" stroke-width="3"/>`,
    icedrink: `<path ${f('white')} d="M24 22h52l-6 70H30z"/><path fill="${C.orange}" stroke="none" d="M27 40h46l-5 50H32z"/><path d="M24 22h52l-6 70H30z"/>
      <g ${f('white')} stroke-width="2"><rect x="34" y="36" width="14" height="14" rx="2" transform="rotate(14 41 43)"/><rect x="52" y="44" width="14" height="14" rx="2" transform="rotate(-10 59 51)"/></g><path d="M60 22l14-18" stroke="${C.red}" stroke-width="5"/>`,

    // feelings and the body
    sad: `${FACE_BASE}${EYES}<path d="M30 42q6-4 12 0M58 42q6-4 12 0" stroke-width="3" transform="rotate(0)"/><path d="M40 78q10-10 20 0"/>`,
    love: `${FACE_BASE}<g fill="${C.red}" stroke="none"><path d="M38 60c-6-4-9-7-9-10a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 3-3 6-9 10z"/><path d="M62 60c-6-4-9-7-9-10a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 3-3 6-9 10z"/></g><path d="M40 70q10 10 20 0" stroke-width="3.5"/>${BLUSH}`,
    yuck: `${FACE_BASE.replace(C.skin, '#cfe6b8')}<path d="M31 50l12 4M69 50l-12 4" stroke-width="3"/><path d="M38 76q4-6 8 0t8 0 8 0" stroke-width="3"/><path ${f('pink')} d="M48 78h10v6a5 5 0 0 1-10 0z" stroke-width="2"/>`,
    tired: `${FACE_BASE}<path d="M31 54q7-3 14 0M55 54q7-3 14 0" stroke-width="3"/><path d="M40 76h20" stroke-width="3"/><g stroke="${C.blue}" stroke-width="2.5"><path d="M30 28v10M40 26v10M50 26v10"/></g><path ${f('sky')} d="M80 34q-6 10-2 14 6 0 4-8z" stroke-width="2"/>`,
    ouch: `${FACE_BASE}<path d="M31 50l12 4M31 58l12-4M69 50l-12 4M69 58l-12-4" stroke-width="3"/><path d="M40 76q10-6 20 0" stroke-width="3"/>
      <rect ${f('beige')} x="58" y="26" width="26" height="10" rx="5" transform="rotate(-30 71 31)"/><g stroke="${C.red}" stroke-width="3"><path d="M10 20l6 6M6 32h8M18 10l2 8"/></g>`,
    mask: `${FACE_BASE}<path d="M31 50q7-4 14 0M55 50q7-4 14 0" stroke-width="3"/><path ${f('white')} d="M26 60q24-6 48 0v14q-24 10-48 0z"/><path d="M26 62L16 56M74 62l10-6" stroke-width="2.5"/><path d="M34 66h32M34 72h32" stroke-width="1.5"/>`,
    fever: `${FACE_BASE.replace(C.skin, '#f7b9a4')}<path d="M31 52q7-4 14 0M55 52q7-4 14 0" stroke-width="3"/><path d="M48 72l30 18" stroke-width="7"/><path d="M48 72l30 18" stroke="${C.white}" stroke-width="3"/><circle fill="${C.red}" cx="50" cy="73" r="3" stroke="none"/>
      <path ${f('sky')} d="M52 18q-12 4-16 2 4 8 16 6z" stroke-width="2"/><rect ${f('white')} x="30" y="12" width="40" height="12" rx="4" stroke-width="2.5"/>`,
    think: `${FACE_BASE}${EYES}<path d="M42 74h16" stroke-width="3"/><path ${f('skin')} d="M24 90q0-14 12-14h4v14z" stroke-width="2.5"/>
      <circle ${f('white')} cx="82" cy="20" r="14" stroke-width="2.5"/><circle ${f('white')} cx="68" cy="38" r="3" stroke-width="2"/><text x="82" y="26" class="lis-art-glyph" fill="${C.blue}" stroke="none">?</text>`,
    noisy: `${FACE_BASE}<path d="M31 52l12 4M69 52l-12 4" stroke-width="3"/><path d="M42 76q8-6 16 0" stroke-width="3"/>${hand(14, 62, 0)}${hand(86, 62, 0).replace('translate(86 62) rotate(0)', 'translate(86 62) scale(-1 1)')}
      <g stroke="${C.red}" stroke-width="3"><path d="M4 30l8 6M2 44h8M92 30l-8 6M96 44h-8"/></g>`,
    shh: `${FACE_BASE}<path d="M31 50q7 4 14 0M55 50q7 4 14 0" stroke-width="3"/><path d="M42 76h16" stroke-width="3"/><rect ${f('skin')} x="46" y="58" width="9" height="36" rx="4.5"/><text x="86" y="40" class="lis-art-glyph" fill="${C.blue}" stroke="none">…</text>`,
    yummy: `${FACE_BASE}<path d="M31 54q7-7 14 0M55 54q7-7 14 0" stroke-width="3"/><path d="M38 70q12 10 24 0z" ${f('red')} stroke-width="3"/><path ${f('pink')} d="M54 72q8 2 8 8-6 2-10-4z" stroke-width="2"/>${BLUSH}<path fill="${C.yellow}" d="${starPath(86, 18, 8, 3.5)}" stroke-width="2"/>`,
    sing: `${FACE_BASE}<path d="M31 50q7-6 14 0M55 50q7-6 14 0" stroke-width="3"/><ellipse ${f('red')} cx="50" cy="72" rx="7" ry="8" stroke-width="2.5"/><g fill="${INK}" stroke="none"><ellipse cx="84" cy="34" rx="5" ry="4"/><ellipse cx="12" cy="24" rx="4" ry="3"/></g><path d="M89 34V14l6 4M16 24V8" stroke-width="2.5"/>`,
    talk: `<path ${f('blue')} d="M6 88q0-24 20-24t20 24z"/><circle ${f('skin')} cx="26" cy="50" r="13"/><path ${f('pink')} d="M54 88q0-24 20-24t20 24z"/><circle ${f('skin')} cx="74" cy="50" r="13"/>
      <path ${f('white')} d="M10 8h36a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6H26l-8 8v-8h-8a6 6 0 0 1-6-6V14a6 6 0 0 1 6-6z" stroke-width="2.5"/><path d="M14 16h28M14 22h20" stroke-width="2"/>
      <path ${f('white')} d="M62 16h28a6 6 0 0 1 6 6v6a6 6 0 0 1-6 6h-6v6l-8-6H62a6 6 0 0 1-6-6v-6a6 6 0 0 1 6-6z" stroke-width="2.5"/><path d="M64 25h22" stroke-width="2"/>`,
    chat: `<path ${f('sky')} d="M8 14h48a8 8 0 0 1 8 8v20a8 8 0 0 1-8 8H30l-12 10V50h-10a8 8 0 0 1-8-8V22a8 8 0 0 1 8-8z"/>
      <path ${f('pink')} d="M44 46h40a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8h-6v10l-12-10H44a8 8 0 0 1-8-8V54a8 8 0 0 1 8-8z"/><g fill="${INK}" stroke="none"><circle cx="22" cy="32" r="3"/><circle cx="32" cy="32" r="3"/><circle cx="42" cy="32" r="3"/><circle cx="54" cy="62" r="3"/><circle cx="64" cy="62" r="3"/><circle cx="74" cy="62" r="3"/></g>`,
    washhands: `<g stroke="${C.blue}" stroke-width="3"><path d="M50 4v14M42 8l2 10M58 8l-2 10"/></g><path ${f('skin')} d="M18 90V60q-4-22 14-30l16 18-6 8 10 4V90z"/><path ${f('skin')} d="M82 90V60q4-22-14-30L52 48l6 8-10 4V90z"/>
      <g ${f('white')} stroke-width="2"><circle cx="30" cy="46" r="6"/><circle cx="68" cy="40" r="7"/><circle cx="50" cy="62" r="5"/><circle cx="82" cy="54" r="4"/><circle cx="16" cy="58" r="4"/></g>`,
    pray: `<path ${f('skin')} d="M48 92V42q0-28-6-30-4-2-8 6L24 54q-4 10 2 18l8 20zM52 92V42q0-28 6-30 4-2 8 6l10 36q4 10-2 18l-8 20z"/><path d="M50 40v52" stroke-width="2.5"/>
      <rect ${f('purple')} x="24" y="84" width="52" height="10" rx="3"/><g stroke="${C.yellow}" stroke-width="3"><path d="M18 18l6 6M82 18l-6 6M50 2v6"/></g>`,
    thumbsup: thumb(true),
    thumbsdown: thumb(false),
    okhand: `<path ${f('skin')} d="M30 92V58q-6-4-6-12 0-14 14-16 10 0 14 8l4-24q2-8 9-6 6 2 4 10l-4 20 4-24q2-8 9-6 6 2 4 10l-4 22 6-16q4-6 9-3 4 4 2 10l-8 26q-4 30-30 34z"/>
      <circle ${f('paper')} cx="40" cy="44" r="6" stroke-width="2.5"/><path d="M40 30q10-2 14 8-2 10-14 12" stroke-width="2.5"/>`,
    question: `<path ${f('skin')} d="M34 92V44q0-6 6-6t6 6v18-30q0-8 7-8t7 8v40l6-8q6-4 10 2l-12 24q-6 6-14 6z"/><circle ${f('yellow')} cx="72" cy="22" r="18"/><text x="72" y="30" class="lis-art-glyph lis-art-glyph-lg" fill="${INK}" stroke="none">?</text>`,
    who: `<circle ${f('dark')} cx="44" cy="34" r="20"/><path ${f('dark')} d="M10 92q0-36 34-36t34 36z"/><circle ${f('yellow')} cx="78" cy="22" r="16"/><text x="78" y="30" class="lis-art-glyph lis-art-glyph-lg" fill="${INK}" stroke="none">?</text>`,
    male: symbol('M40 60a20 20 0 1 1 1 0M54 46l26-26M60 20h20v20', 'blue'),
    female: symbol('M50 56a22 22 0 1 1 1 0M50 56v32M38 76h24', 'rose'),
    check: symbol('M16 52l22 22 46-50', 'green'),
    cross: symbol('M20 20l60 60M80 20L20 80', 'red'),
    math: `<rect ${f('white')} x="6" y="6" width="88" height="88" rx="10"/><path d="M50 6v88M6 50h88" stroke-width="2.5"/><g stroke="${C.red}" stroke-width="5"><path d="M28 16v20M18 26h20M62 26h20M64 64l16 16M80 64L64 80M18 72h20"/></g><g fill="${C.red}" stroke="none"><circle cx="28" cy="64" r="3"/><circle cx="28" cy="80" r="3"/></g>`,

    // doing things
    swing: `<path d="M16 6h68" stroke="${C.red}" stroke-width="6"/><path d="M20 6L8 92M80 6l12 86" stroke="${C.red}" stroke-width="5"/><path d="M44 8l-6 56M60 8l6 56" stroke-width="2.5"/>
      <rect ${f('wood')} x="32" y="62" width="40" height="7" rx="2"/><circle ${f('skin')} cx="52" cy="34" r="9"/>${tube('M52 44v14', 'yellow', 9)}${tube('M48 62l-6 14M58 62l6 14', 'blue', 6)}`,
    opendoor: `<path d="M8 92h84"/><rect ${f('wall')} x="24" y="8" width="52" height="84"/><path ${f('dark')} d="M28 12h44v80H28z" stroke="none"/><path ${f('brown')} d="M28 12l20 8v80l-20-8z"/><circle ${f('yellow')} cx="43" cy="56" r="3" stroke-width="2"/>
      <path d="M58 52h28M78 44l8 8-8 8" stroke="${C.green}" stroke-width="5"/>`,
    pushbutton: `<rect ${f('silver')} x="10" y="50" width="80" height="40" rx="6"/><ellipse ${f('red')} cx="50" cy="66" rx="22" ry="10"/><path d="M28 66v-6M72 66v-6" stroke-width="2"/>
      <path ${f('skin')} d="M40 52V20q0-6 6-6t6 6v18l14 2q8 2 6 10l-4 10H44z"/><path d="M78 20l8-8M84 32h10M70 12l2-10" stroke="${C.orange}" stroke-width="3"/>`,
    dance: `<circle ${f('skin')} cx="54" cy="14" r="10"/>${tube('M52 26l-4 30', 'pink', 13)}${tube('M50 32L28 22L18 8', 'skin', 6)}${tube('M50 32l22 4 14-12', 'skin', 6)}
      <path ${f('pink')} d="M48 50l-18 24h40z"/>${tube('M44 72l-8 20', 'skin', 6)}${tube('M56 72l18 10', 'skin', 6)}<g fill="${INK}" stroke="none"><ellipse cx="86" cy="58" rx="4" ry="3"/></g><path d="M90 58V44" stroke-width="2.5"/>`,
    slip: `<path ${f('yellow')} d="M30 84q-10-6-4-14 8 2 14 8 8-8 16-6-2 8-10 12 12 2 14 8-14 2-30-8z"/><circle ${f('skin')} cx="66" cy="18" r="9"/>${tube('M64 28L50 48', 'blue', 11)}${tube('M50 48L72 60L88 50', 'navy', 8)}
      ${tube('M50 48L36 62', 'navy', 8)}${tube('M58 34L80 26M58 34L38 30', 'blue', 6)}<path d="M8 92h84"/><path d="M24 70l-6-6M18 76l-8-2" stroke="${C.orange}" stroke-width="3"/>`,
    bugnet: `${tube('M84 92L48 52', 'wood', 6)}<ellipse ${f('white')} cx="34" cy="36" rx="22" ry="20" opacity=".8"/><ellipse cx="34" cy="36" rx="22" ry="20" stroke-width="4"/>
      <path d="M14 28l40 0M14 44h40M26 18v38M42 18v38" stroke-width="1.5" opacity=".6"/><g transform="translate(62 2) scale(.32)">${ICONS.ladybug}</g>`,
    furoshiki: `<path ${f('green')} d="M14 50q36-20 72 0l6 34q-42 10-84 0z"/><path ${f('green')} d="M38 40q-12-24 6-28 10 6 6 24zM62 40q12-24-6-28-10 6-6 24z"/>
      <g fill="#fff" stroke="none" opacity=".8"><path d="M24 64q4-6 8 0t8 0M58 70q4-6 8 0t8 0M40 80q4-6 8 0"/></g><path d="M24 64q4-6 8 0t8 0M58 70q4-6 8 0t8 0M40 80q4-6 8 0" stroke="#fff" stroke-width="2.5"/>`,
    planting: `<path ${f('brown')} d="M4 74q46-14 92 0v20H4z"/>${tube('M70 74L88 20', 'wood', 5)}<path ${f('silver')} d="M60 66l10 12 12-4-6-14z"/>
      <path d="M36 74V52" stroke="${C.leaf}" stroke-width="4"/><path ${f('green')} d="M36 56q-16-2-18-16 14-2 18 16zM36 54q4-16 18-16-2 14-18 16z"/>`,
    wateringcan: `<path ${f('blue')} d="M24 40h40v44H24z"/><path d="M28 40q16-26 32 0" stroke-width="4"/><path ${f('blue')} d="M64 52l22-20 6 6-24 28z"/><path ${f('silver')} d="M84 30l10-6 2 12-8 2z" stroke-width="2.5"/>
      <g stroke="${C.sky}" stroke-width="3"><path d="M90 46l-2 10M96 44l-1 10"/></g><path d="M24 50h40" stroke="#fff" stroke-width="3"/><path ${f('green')} d="M84 90q-8-14 0-20 8 6 0 20z" stroke-width="2"/>`,
    clothesline: `<path d="M4 18h92" stroke-width="2.5"/><path ${f('blue')} d="M10 18h26l4 12-6 2v30H12V32l-6-2z"/><path ${f('pink')} d="M48 18h16l8 50H40z"/><path ${f('white')} d="M76 18h16v34l-8-6-8 6z"/>
      <g fill="${C.red}" stroke-width="1.5"><rect x="20" y="13" width="5" height="10"/><rect x="54" y="13" width="5" height="10"/><rect x="82" y="13" width="5" height="10"/></g><circle ${f('orange')} cx="80" cy="84" r="8"/><g stroke="${C.orange}" stroke-width="2.5"><path d="M80 70v-4M66 84h-4M94 84h4"/></g>`,
    roller: `<rect ${f('blue')} x="8" y="10" width="64" height="22" rx="8"/><path d="M72 21h12v24H44v14" stroke-width="5"/>${tube('M44 60v32', 'red', 8)}<path ${f('blue')} d="M10 32h60v30H10z" stroke="none" opacity=".5"/>`,
    origami: `<path ${f('red')} d="M8 58l38-20 8 18z"/><path ${f('rose')} d="M46 38l40-22-26 46z"/><path ${f('red')} d="M54 56l6 6 24 8-16-24z"/><path ${f('rose')} d="M30 70l24-14 6 6z"/><path d="M8 58L2 46" stroke-width="3"/>`,
    broken: `<path ${f('white')} d="M8 56q20-22 38-2l-6 12-12-2z"/><path ${f('white')} d="M54 50q18-16 38 4-12 14-30 10z"/><path ${f('white')} d="M30 74l14-8 10 6 8-4 4 10-36 2z"/>
      <path d="M50 30l-6 10 8 4-6 8" stroke="${C.red}" stroke-width="3"/><g stroke="${C.gray}" stroke-width="3"><path d="M20 30l-6-6M80 30l6-6M50 18v-8"/></g>`,
    koma: `<path ${f('red')} d="M14 42q36-20 72 0l-36 48z"/><path ${f('yellow')} d="M22 38q28-14 56 0l-6 8q-22-10-44 0z"/><path ${f('white')} d="M30 54q20-8 40 0l-6 8q-14-6-28 0z"/>${tube('M50 34V12', 'wood', 6)}
      <path d="M4 24q8-6 16-2M96 24q-8-6-16-2" stroke="${C.gray}" stroke-width="3"/>`,
    paperplane: `<path ${f('white')} d="M6 52l88-38-30 70-16-22z"/><path ${f('silver')} d="M48 62l46-48-30 52z" stroke-width="2.5"/><path d="M48 62l-2 24 14-14" stroke-width="2.5"/><path d="M4 74q14-6 20 4M2 90q14-8 26 0" stroke="${C.gray}" stroke-width="2.5" stroke-dasharray="4 4"/>`,
    dolly: `<path d="M24 6v80h56" stroke-width="5"/><path d="M24 6h-8" stroke-width="5"/><circle ${f('dark')} cx="30" cy="88" r="8"/><circle ${f('silver')} cx="30" cy="88" r="3" stroke-width="2"/>
      <rect ${f('wood')} x="30" y="52" width="40" height="32"/><rect ${f('wood')} x="34" y="22" width="32" height="30"/><path d="M50 22v30M50 52v32" stroke="${C.brown}" stroke-width="2.5"/>`,
    moving: `<rect ${f('white')} x="4" y="28" width="60" height="44" rx="2"/><path ${f('orange')} d="M64 40h18l14 18v14H64z"/><path ${f('sky')} d="M70 46h10l8 11H70z" stroke-width="2.5"/>
      <rect ${f('wood')} x="12" y="40" width="20" height="18" stroke-width="2.5"/><rect ${f('wood')} x="36" y="44" width="20" height="14" stroke-width="2.5"/><path ${f('red')} d="M12 34l4-4h6l-2 4z" stroke-width="1.5"/>
      ${[18, 44, 80].map(x => `<circle ${f('dark')} cx="${x}" cy="74" r="8"/><circle ${f('silver')} cx="${x}" cy="74" r="3" stroke-width="2"/>`).join('')}`,
    fishingrod: `<path d="M8 90L76 10" stroke="${C.brown}" stroke-width="5"/><path d="M76 10q14 30 4 60" stroke-width="1.5"/><path ${f('red')} d="M80 70a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" stroke-width="1.5"/>
      <circle ${f('silver')} cx="22" cy="74" r="7" stroke-width="2.5"/><path ${f('sky')} d="M62 84q10-10 22-4l8-6v18l-8-6q-12 6-22-2z" stroke-width="2.5"/><path d="M50 96q8-4 16 0t16 0" stroke="${C.blue}" stroke-width="2.5"/>`,
    gasflame: `<rect ${f('silver')} x="8" y="62" width="84" height="26" rx="4"/><circle ${f('dark')} cx="24" cy="76" r="5" stroke-width="2"/><circle ${f('dark')} cx="76" cy="76" r="5" stroke-width="2"/>
      <ellipse ${f('dark')} cx="50" cy="62" rx="26" ry="5"/><g fill="${C.blue}" stroke-width="2">${[28, 38, 50, 62, 72].map(x => `<path d="M${x} 58q-5-10 0-20 5 10 0 20z"/>`).join('')}</g><g fill="${C.sky}" stroke="none">${[28, 38, 50, 62, 72].map(x => `<path d="M${x} 56q-2-6 0-10 2 4 0 10z"/>`).join('')}</g>`,
    grill: `<path ${f('dark')} d="M8 60h84l-8 24H16z"/><g stroke="${C.orange}" stroke-width="3"><path d="M20 72q4-4 8 0M44 72q4-4 8 0M68 72q4-4 8 0"/></g><path d="M8 56h84" stroke-width="2.5"/>
      ${[28, 50, 72].map(x => `<path d="M${x - 20} 40l40 16" stroke="${C.wood}" stroke-width="3"/><g ${f('brown')} stroke-width="2"><rect x="${x - 10}" y="38" width="9" height="9" rx="2" transform="rotate(22 ${x} 44)"/><rect x="${x + 1}" y="42" width="9" height="9" rx="2" transform="rotate(22 ${x} 44)"/></g>`).join('')}
      <g stroke="${C.gray}"><path d="M30 26q-4-6 0-12M60 24q-4-6 0-12"/></g>`,
    magnifier: `${tube('M60 60L88 88', 'brown', 9)}<circle ${f('sky')} cx="40" cy="40" r="28"/><circle cx="40" cy="40" r="28" stroke-width="6"/><path d="M24 32q4-12 16-12" stroke="#fff" stroke-width="4"/>`,

    // signs and symbols
    warning: `<path ${f('yellow')} d="M50 8l44 80H6z"/><path d="M50 36v26" stroke-width="7"/><circle fill="${INK}" cx="50" cy="74" r="4.5" stroke="none"/>`,
    stopsign: `<path d="M50 70v24" stroke-width="5"/><path ${f('red')} d="M34 4h32l22 22v22L66 70H34L12 48V26z"/><text x="50" y="44" class="lis-art-glyph" fill="#fff" stroke="none">STOP</text>`,
    exitsign: `<rect ${f('green')} x="6" y="20" width="88" height="60" rx="4"/><rect ${f('white')} x="56" y="28" width="30" height="44" stroke-width="2.5"/><circle fill="#fff" cx="38" cy="34" r="6" stroke="none"/>
      <path d="M36 42l-6 14 10 4-4 14M34 50l-12 4M36 46l12 4 6-6M30 60l-10 10" stroke="#fff" stroke-width="5"/><path d="M58 28l14 10v34" stroke-width="2"/>`,
    entrance: `<path d="M50 92h46"/><rect ${f('wall')} x="56" y="10" width="36" height="82"/><path ${f('brown')} d="M60 14h28v78H60z"/><circle ${f('yellow')} cx="82" cy="54" r="3" stroke-width="2"/>
      <path d="M8 54h34M32 44l10 10-10 10" stroke="${C.green}" stroke-width="7"/>`,
    info: `<circle ${f('blue')} cx="50" cy="50" r="40"/><circle fill="#fff" cx="50" cy="28" r="6" stroke="none"/><path d="M42 42h10v32M40 74h20" stroke="#fff" stroke-width="7"/>`,
    parasol: `<path d="M50 30v62" stroke-width="4"/><path ${f('red')} d="M6 40Q50 0 94 40q-11-8-22 0-11-8-22 0-11-8-22 0-11-8-22 0z"/><path d="M28 40L50 14l22 26" stroke-width="2"/><path ${f('beige')} d="M2 86q48-10 96 0v10H2z" stroke="none"/>
      <path ${f('white')} d="M62 76h28l-4 10H66z" stroke-width="2.5"/><ellipse ${f('yellow')} cx="24" cy="84" rx="14" ry="5" stroke-width="2.5"/>`,
    nametag: `<rect ${f('white')} x="8" y="22" width="84" height="56" rx="6"/><path ${f('red')} d="M8 28a6 6 0 0 1 6-6h72a6 6 0 0 1 6 6v10H8z"/><path d="M20 58h60" stroke-width="2" stroke-dasharray="3 3"/><path d="M50 22v-12" stroke-width="3"/><circle ${f('silver')} cx="50" cy="10" r="4" stroke-width="2"/>`,
    pricetag: `<path ${f('yellow')} d="M50 8h34a6 6 0 0 1 6 6v34L48 90a6 6 0 0 1-8 0L10 60a6 6 0 0 1 0-8z"/><circle ${f('paper')} cx="74" cy="24" r="6"/><text x="48" y="60" class="lis-art-glyph lis-art-glyph-lg" fill="${INK}" stroke="none" transform="rotate(-45 48 54)">¥</text>`,
    target: `<circle ${f('white')} cx="46" cy="54" r="38"/><circle ${f('red')} cx="46" cy="54" r="28"/><circle ${f('white')} cx="46" cy="54" r="18"/><circle ${f('red')} cx="46" cy="54" r="8"/><path d="M46 54L90 10" stroke-width="3.5"/><path ${f('yellow')} d="M84 6l10 0 0 10-6-4z" stroke-width="2"/>`,
    uturn: `<path d="M28 90V40a22 22 0 0 1 44 0v26" stroke="${INK}" stroke-width="16"/><path d="M28 90V40a22 22 0 0 1 44 0v26" stroke="${C.blue}" stroke-width="10"/><path ${f('blue')} d="M56 62h32L72 90z"/>`,
    finishflag: `<path d="M14 92V8" stroke-width="5"/><path ${f('white')} d="M16 10h66v44H16z"/><g fill="${INK}" stroke="none">${[0, 1, 2, 3].map(r => [0, 1, 2, 3, 4, 5].map(c => ((r + c) % 2 ? '' : `<rect x="${16 + c * 11}" y="${10 + r * 11}" width="11" height="11"/>`)).join('')).join('')}</g><path d="M16 10h66v44H16z"/>`,
    hourglass: `<path d="M20 8h60M20 92h60" stroke="${C.brown}" stroke-width="8"/><path ${f('sky')} d="M28 12h44q0 22-18 38 18 16 18 38H28q0-22 18-38-18-16-18-38z" opacity=".9"/>
      <path ${f('yellow')} d="M36 26h28q-4 12-14 20-10-8-14-20zM50 54v4M30 88q2-16 20-18 18 2 20 18z" stroke-width="2"/>`,
    heightchart: `<rect ${f('cream')} x="56" y="6" width="28" height="88"/><path d="M56 16h10M56 28h6M56 40h10M56 52h6M56 64h10M56 76h6" stroke-width="2.5"/><path d="M14 26h66" stroke="${C.red}" stroke-width="3" stroke-dasharray="4 3"/>
      <circle ${f('skin')} cx="34" cy="36" r="10"/><path fill="${C.hair}" d="M24 34q0-12 10-12t10 12q-4-6-10-6t-10 6z" stroke-width="2"/>${tube('M34 48v24', 'green', 12)}${tube('M30 74v18M38 74v18', 'navy', 6)}`,
    tapemeasure: `<rect ${f('yellow')} x="8" y="30" width="48" height="48" rx="12"/><circle ${f('silver')} cx="32" cy="54" r="10"/><path ${f('yellow')} d="M56 64h38v12H56z"/>
      <path d="M62 64v5M68 64v3M74 64v5M80 64v3M86 64v5" stroke-width="2"/><rect ${f('red')} x="88" y="60" width="6" height="20" stroke-width="2"/>`,
    binoculars: `<rect ${f('dark')} x="42" y="30" width="16" height="14" rx="3"/><path ${f('dark')} d="M14 30q0-8 8-8h12q8 0 8 8v20H14zM58 30q0-8 8-8h12q8 0 8 8v20H58z"/>
      <circle ${f('dark')} cx="28" cy="64" r="20"/><circle ${f('dark')} cx="72" cy="64" r="20"/><circle ${f('sky')} cx="28" cy="64" r="12" stroke-width="2.5"/><circle ${f('sky')} cx="72" cy="64" r="12" stroke-width="2.5"/>
      <path d="M22 58l6-6M66 58l6-6" stroke="#fff" stroke-width="3"/>`,
    toothbrush: `<g transform="rotate(-30 50 50)"><rect ${f('blue')} x="8" y="46" width="64" height="10" rx="5"/><rect ${f('white')} x="70" y="42" width="24" height="10" rx="2"/>
      <g stroke="${C.sky}" stroke-width="3">${[73, 78, 83, 88].map(x => `<path d="M${x} 42v-10"/>`).join('')}</g></g><g ${f('white')} stroke-width="2"><circle cx="78" cy="78" r="5"/><circle cx="88" cy="70" r="3"/></g>`,
    crayons: `${['red', 'yellow', 'blue', 'green'].map((c, i) => `<g transform="rotate(${-24 + i * 16} 50 92)"><rect ${f(c)} x="44" y="22" width="12" height="60" rx="2"/><path ${f(c)} d="M44 22l6-14 6 14z"/><path d="M44 40h12M44 70h12" stroke-width="2"/></g>`).join('')}`,
    filmroll: `<rect ${f('dark')} x="18" y="20" width="40" height="60" rx="6"/><rect ${f('yellow')} x="22" y="30" width="32" height="40" rx="2"/><rect ${f('dark')} x="30" y="10" width="16" height="12" rx="2"/>
      <path ${f('choc')} d="M58 34h36v36H58z"/><g fill="${C.paper}" stroke="none">${[38, 48, 58].map(y => `<rect x="64" y="${y - 2}" width="5" height="5"/><rect x="84" y="${y - 2}" width="5" height="5"/>`).join('')}</g>`,
    room: `<path ${f('wall')} d="M4 8h92v62H4z" stroke="none"/><path ${f('floor')} d="M4 70h92v24H4z" stroke="none"/><path d="M4 70h92"/><rect ${f('sky')} x="56" y="16" width="30" height="26" stroke-width="2.5"/><path d="M71 16v26M56 29h30" stroke-width="2"/>
      <rect ${f('wood')} x="10" y="46" width="34" height="30" rx="2" stroke-width="2.5"/><path d="M14 76v8M40 76v8" stroke-width="3"/><path ${f('green')} d="M62 64q-4-14 6-18 8 6 2 18z" stroke-width="2"/><rect ${f('orange')} x="60" y="64" width="12" height="12" stroke-width="2"/>`,

    // places and things
    cinema: `<rect ${f('dark')} x="4" y="6" width="92" height="88" rx="4"/><rect ${f('white')} x="14" y="14" width="72" height="40" rx="2"/><path ${f('sky')} d="M34 26l16 8-16 8z" stroke-width="2.5"/>
      <g ${f('red')} stroke-width="2">${[14, 32, 50, 68].map(x => `<path d="M${x} 74q0-8 9-8t9 8v10H${x}z"/>`).join('')}</g>`,
    depato: `<rect ${f('cream')} x="10" y="26" width="80" height="64"/><path ${f('red')} d="M6 26h88v8H6z"/>${building(14, 38, 72, 30, 'cream', 4, 2).replace(/<rect fill="[^"]+" x="14" y="38" width="72" height="30"\/>/, '')}
      <rect ${f('sky')} x="38" y="72" width="24" height="18" stroke-width="2.5"/><path d="M30 26V8M50 26V4M70 26V8" stroke-width="2.5"/><path ${f('red')} d="M30 8h12v8H30zM50 4h12v8H50z" stroke-width="2"/><path ${f('yellow')} d="M70 8h12v8H70z" stroke-width="2"/><path d="M4 90h92"/>`,
    newstv: `<rect ${f('dark')} x="6" y="12" width="88" height="62" rx="6"/><rect ${f('sky')} x="12" y="18" width="76" height="50"/><circle ${f('skin')} cx="38" cy="38" r="8" stroke-width="2"/><path ${f('navy')} d="M26 60q0-12 12-12t12 12z" stroke-width="2"/>
      <rect ${f('red')} x="12" y="58" width="76" height="10" stroke-width="2"/><path d="M56 30h24M56 38h20" stroke-width="2.5"/><path d="M36 74l-6 14M64 74l6 14M24 88h52" stroke-width="3"/>`,
    forecast: `<rect ${f('dark')} x="6" y="12" width="88" height="62" rx="6"/><rect ${f('sky')} x="12" y="18" width="76" height="50"/>
      <g transform="translate(14 22) scale(.4)">${ICONS.sun}</g><g transform="translate(50 22) scale(.4)">${ICONS.rain}</g><path d="M36 74l-6 14M64 74l6 14M24 88h52" stroke-width="3"/>`,
    weather: `<circle ${f('orange')} cx="38" cy="38" r="18"/><g stroke="${C.orange}"><path d="M38 10V4M10 38H4M18 18l-4-4M58 18l4-4M18 58l-4 4"/></g>
      <path ${f('white')} d="M38 82a14 14 0 0 1 4-27 18 18 0 0 1 34-6 13 13 0 0 1 14 14 10 10 0 0 1 0 19z"/>`,
    genkan: `<path ${f('wood')} d="M4 54h92v10H4z"/><path ${f('gray')} d="M4 64h92v28H4z"/><path ${f('wall')} d="M4 8h92v46H4z" stroke="none"/><rect ${f('brown')} x="34" y="10" width="32" height="44"/>
      <g ${f('blue')} stroke-width="2.5"><path d="M18 76q0-8 8-8h6l6 6v8H18z"/><path d="M40 78q0-8 8-8h6l6 6v8H40z"/></g><g ${f('red')} stroke-width="2.5"><path d="M64 80q0-6 6-6h6l6 6v6H64z"/></g>`,
    koban: `<rect ${f('white')} x="16" y="34" width="68" height="56"/><path ${f('navy')} d="M10 34l40-22 40 22z"/><circle ${f('red')} cx="50" cy="8" r="5"/><path d="M50 13v4" stroke-width="2"/>
      <circle ${f('yellow')} cx="50" cy="28" r="5" stroke-width="2"/><rect ${f('sky')} x="40" y="56" width="20" height="34" stroke-width="2.5"/><rect ${f('sky')} x="22" y="46" width="12" height="12" stroke-width="2.5"/><rect ${f('sky')} x="66" y="46" width="12" height="12" stroke-width="2.5"/><path d="M6 90h88"/>`,
    gallery: `<rect ${f('wall')} x="4" y="4" width="92" height="92" rx="4" stroke="none"/><rect ${f('wood')} x="20" y="14" width="60" height="48" rx="2"/><rect ${f('sky')} x="28" y="22" width="44" height="32"/>
      <path ${f('green')} d="M28 54l14-16 10 10 8-6 12 12z" stroke-width="2"/><circle ${f('yellow')} cx="62" cy="30" r="4" stroke-width="2"/><path d="M50 4v10" stroke-width="2"/><path d="M20 90V80h20v10M60 90V80h20v10" stroke="${C.red}" stroke-width="2"/><path d="M14 80h72" stroke="${C.red}" stroke-width="2.5"/>`,
    ryokan: `<path ${f('dark')} d="M2 34q24-6 48-26 24 20 48 26z"/><rect ${f('wood')} x="10" y="34" width="80" height="54"/><path d="M30 34v54M70 34v54" stroke-width="2.5"/>
      <path ${f('navy')} d="M32 36h36v26H32z"/><path d="M44 36v26M56 36v26" stroke="${C.paper}" stroke-width="2"/><path d="M4 88h92"/><circle ${f('red')} cx="18" cy="52" r="5" stroke-width="2"/><circle ${f('red')} cx="82" cy="52" r="5" stroke-width="2"/>`,
    barberpole: `<rect ${f('silver')} x="34" y="4" width="32" height="10" rx="4"/><rect ${f('silver')} x="34" y="86" width="32" height="10" rx="4"/><rect ${f('white')} x="38" y="14" width="24" height="72"/>
      <g stroke="${C.red}" stroke-width="5">${[0, 1, 2, 3].map(i => `<path d="M38 ${24 + i * 18}l24 -12"/>`).join('')}</g><g stroke="${C.blue}" stroke-width="5">${[0, 1, 2, 3].map(i => `<path d="M38 ${33 + i * 18}l24 -12"/>`).join('')}</g><rect x="38" y="14" width="24" height="72"/>`,
    dentist: `${ICONS.tooth}<path d="M90 92L66 52" stroke-width="4"/><circle ${f('silver')} cx="64" cy="48" r="9" stroke-width="3"/>`,
    hospitalbed: `<rect ${f('silver')} x="6" y="40" width="10" height="46" rx="2"/><rect ${f('silver')} x="84" y="52" width="10" height="34" rx="2"/><rect ${f('white')} x="16" y="58" width="68" height="12"/><path ${f('sky')} d="M36 50h48v20H36z"/>
      <rect ${f('white')} x="18" y="48" width="18" height="10" rx="4"/><path d="M20 18h16v6M28 24v30" stroke-width="2.5"/><path ${f('mint')} d="M22 4h12v16H22z" stroke-width="2"/><circle ${f('dark')} cx="22" cy="90" r="4" stroke-width="2"/><circle ${f('dark')} cx="80" cy="90" r="4" stroke-width="2"/>`,
    reception: `<path ${f('wood')} d="M4 58h92v34H4z"/><path d="M4 66h92" stroke-width="2.5"/><path ${f('yellow')} d="M30 54a14 12 0 0 1 28 0z"/><path d="M26 56h36M44 42v-4" stroke-width="3"/>
      <rect ${f('white')} x="66" y="40" width="22" height="16" stroke-width="2" transform="rotate(-8 77 48)"/><path d="M70 46h12M70 51h8" stroke-width="1.5" transform="rotate(-8 77 48)"/>`,
    register: `<path ${f('silver')} d="M8 56h84v36H8z"/><path ${f('dark')} d="M16 26h44v30H16z"/><rect ${f('mint')} x="22" y="32" width="32" height="10" stroke-width="2"/><g ${f('white')} stroke-width="1.5">${[0, 1, 2].map(c => `<rect x="${22 + c * 12}" y="46" width="8" height="6"/>`).join('')}</g>
      <rect ${f('cream')} x="22" y="72" width="56" height="14" stroke-width="2"/><path d="M44 79h12" stroke-width="3"/><path ${f('white')} d="M64 26h20v30H64z" stroke-width="2.5"/><path d="M68 34h12M68 42h8" stroke-width="2"/>`,
    gaspump: `<rect ${f('red')} x="14" y="20" width="44" height="70" rx="4"/><rect ${f('white')} x="22" y="30" width="28" height="18" stroke-width="2.5"/><path d="M28 36h16M28 42h10" stroke-width="2"/><path d="M8 90h56" stroke-width="5"/>
      <path d="M58 56h12q8 0 8-8V24l-10-10" stroke-width="4"/><path ${f('dark')} d="M64 8l10 8-6 6-10-8z"/><path ${f('yellow')} d="M30 66q-6 8-6 12a6 6 0 0 0 12 0q0-4-6-12z" stroke-width="2"/>`,
    lighthouse: `<path ${f('sky')} d="M2 84q24-8 48 0t48 0v12H2z" stroke="none"/><path ${f('gray')} d="M20 84q30-14 60 0z"/><path ${f('white')} d="M38 30h24l6 50H32z"/><path ${f('red')} d="M37 42h26l1.5 12H35.5zM34.5 64h31l1.5 12H33z" stroke="none"/><path d="M38 30h24l6 50H32z"/>
      <rect ${f('yellow')} x="40" y="16" width="20" height="14"/><path ${f('red')} d="M36 16l14-12 14 12z"/><g stroke="${C.yellow}" stroke-width="3"><path d="M30 20L8 14M70 20l22-6M30 26L10 30M70 26l20 4"/></g>`,
    countryside: `<path ${f('green')} d="M2 50l26-30 18 18 14-12 38 24z"/><path ${f('grass')} d="M2 50h96v44H2z"/><g stroke="${C.leaf}" stroke-width="2">${[60, 70, 80, 90].map(y => `<path d="M6 ${y}h88"/>`).join('')}</g>
      <path ${f('sky')} d="M2 50h96v8H2z" stroke-width="2"/><g><rect ${f('wall')} x="64" y="62" width="20" height="14" stroke-width="2.5"/><path ${f('wood')} d="M60 64l14-12 14 12z" stroke-width="2.5"/></g>`,
    policecar: `<path ${f('white')} d="M4 60l10-20h50l16 20h12v18H4z"/><path ${f('black')} d="M4 66h88v12H4z"/><path ${f('sky')} d="M20 44h18v14H14zM44 44h18l10 14H44z" stroke-width="2.5"/>
      <rect ${f('red')} x="34" y="30" width="16" height="10" rx="3"/><circle ${f('dark')} cx="22" cy="80" r="9"/><circle ${f('dark')} cx="74" cy="80" r="9"/><circle ${f('silver')} cx="22" cy="80" r="3" stroke-width="2"/><circle ${f('silver')} cx="74" cy="80" r="3" stroke-width="2"/>`,
    crash: `<g transform="rotate(14 30 60)"><path ${f('red')} d="M2 66l8-16h30l10 16v14H2z"/><circle ${f('dark')} cx="14" cy="82" r="7"/><circle ${f('dark')} cx="40" cy="82" r="7"/></g>
      <g transform="rotate(-14 70 60)"><path ${f('blue')} d="M98 66l-8-16H60l-10 16v14h48z"/><circle ${f('dark')} cx="86" cy="82" r="7"/><circle ${f('dark')} cx="60" cy="82" r="7"/></g><path ${f('yellow')} d="${starPath(50, 34, 20, 9)}" stroke-width="2.5"/>`,
    breakdown: `<path ${f('green')} d="M4 62l10-20h44l14 20h14v18H4z"/><path ${f('sky')} d="M20 46h14v14H12zM40 46h14l10 14H40z" stroke-width="2.5"/><circle ${f('dark')} cx="22" cy="82" r="9"/><circle ${f('dark')} cx="70" cy="82" r="9"/>
      <g ${f('silver')} stroke-width="2.5"><circle cx="80" cy="34" r="8"/><circle cx="88" cy="20" r="6"/><circle cx="76" cy="12" r="5"/></g><path ${f('yellow')} d="M50 20l-8 14h8l-4 12 12-16h-8l6-10z" stroke-width="2"/>`,
    concert: `<rect ${f('dark')} x="4" y="4" width="92" height="92" rx="4"/><path fill="${C.yellow}" opacity=".35" stroke="none" d="M30 4l-14 64h68L70 4z"/><rect ${f('wood')} x="4" y="68" width="92" height="12"/>
      <path d="M50 68V44" stroke-width="3"/><circle ${f('silver')} cx="50" cy="38" r="6" stroke-width="2.5"/><g fill="${C.white}" stroke="none"><ellipse cx="20" cy="32" rx="5" ry="4"/><ellipse cx="80" cy="26" rx="5" ry="4"/></g><path d="M25 32V16M85 26V10" stroke="#fff" stroke-width="2.5"/>
      <g ${f('black')} stroke-width="2">${[16, 34, 52, 70, 88].map(x => `<circle cx="${x}" cy="90" r="7"/>`).join('')}</g>`,
    meeting: `<ellipse ${f('wood')} cx="50" cy="64" rx="40" ry="16"/><g>${[[16, 46, 'blue'], [38, 38, 'red'], [62, 38, 'green'], [84, 46, 'orange']].map(([x, y, c]) => `<path ${f(c)} d="M${x - 9} ${y + 16}q0-14 9-14t9 14z" stroke-width="2.5"/><circle ${f('skin')} cx="${x}" cy="${y - 4}" r="7" stroke-width="2.5"/>`).join('')}</g>
      <ellipse ${f('wood')} cx="50" cy="64" rx="40" ry="16"/><rect ${f('white')} x="32" y="58" width="14" height="10" stroke-width="2"/><rect ${f('white')} x="56" y="60" width="14" height="10" stroke-width="2"/>`,
    hanami: `${tube('M70 70V36', 'brown', 7)}${tube('M70 46L54 34', 'brown', 5)}<g ${f('pink')} stroke-width="2.5"><circle cx="56" cy="24" r="14"/><circle cx="76" cy="20" r="16"/><circle cx="88" cy="36" r="10"/></g>
      <path ${f('blue')} d="M4 76l40-8 44 8-40 10z"/><ellipse ${f('red')} cx="34" cy="74" rx="10" ry="4" stroke-width="2"/><rect ${f('white')} x="50" y="70" width="10" height="8" stroke-width="2"/><g fill="${C.pink}" stroke="none"><circle cx="20" cy="40" r="2.5"/><circle cx="34" cy="54" r="2.5"/><circle cx="12" cy="60" r="2.5"/></g>`,
    trophy: `<path ${f('yellow')} d="M28 10h44v24q0 22-22 24-22-2-22-24z"/><path d="M28 18H14q0 18 16 20M72 18h14q0 18-16 20" stroke-width="4"/><path ${f('yellow')} d="M44 58h12v14H44z"/>
      <rect ${f('brown')} x="30" y="72" width="40" height="18" rx="2"/><path fill="#fff" d="${starPath(50, 30, 9, 4)}" stroke="none"/>`,
    randoseru: `<path ${f('red')} d="M18 34q0-24 32-24t32 24v52a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6z"/><path ${f('red')} d="M18 34q32-14 64 0v26q-32 10-64 0z"/><rect ${f('yellow')} x="44" y="52" width="12" height="10" rx="2" stroke-width="2.5"/>
      <path d="M26 72h48" stroke-width="2.5"/><path d="M86 30q8 20 0 46" stroke="${C.red}" stroke-width="5"/>`,
    diploma: `<rect ${f('cream')} x="10" y="30" width="80" height="34" rx="17"/><circle ${f('cream')} cx="27" cy="47" r="17"/><path d="M20 47h60" stroke-width="2"/><path ${f('red')} d="M54 30h8v34h-8z" stroke-width="2"/>
      <path ${f('red')} d="M54 64l-6 20 10-6 6 8-2-22z" stroke-width="2"/>`,
    diary: `<rect ${f('pink')} x="16" y="8" width="64" height="84" rx="4"/><path d="M26 8v84" stroke-width="2.5"/><rect ${f('white')} x="38" y="22" width="32" height="16" rx="2" stroke-width="2.5"/>
      <rect ${f('yellow')} x="74" y="42" width="14" height="16" rx="2"/><path d="M80 42v-6a6 6 0 0 1 12 0v6" stroke-width="3"/><path ${f('red')} d="M54 72c-5-4-8-6-8-9a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 3-3 5-8 9z" stroke-width="2"/>`,
    fax: `<rect ${f('white')} x="30" y="8" width="40" height="32" stroke-width="2.5"/><path d="M36 18h28M36 26h20" stroke-width="2"/><path ${f('silver')} d="M8 36h84v40H8z"/><rect ${f('dark')} x="16" y="44" width="30" height="14" rx="2"/><path ${f('white')} d="M24 76h52v16H24z" stroke-width="2.5"/>
      <g ${f('white')} stroke-width="1.5">${[0, 1, 2].map(r => [0, 1, 2].map(c => `<rect x="${58 + c * 10}" y="${42 + r * 10}" width="6" height="6"/>`).join('')).join('')}</g>`,
    sandcastle: `<path ${f('beige')} d="M2 84q48-10 96 0v12H2z" stroke="none"/><path ${f('wood')} d="M20 84V54h12v-8h6v8h8V40h8v-8h6v8h8v14h8v-8h6v8h6v30z"/><rect ${f('dark')} x="42" y="66" width="12" height="18" rx="6" stroke-width="2"/>
      <path d="M58 32V16" stroke-width="2"/><path ${f('red')} d="M58 16l12 4-12 4z" stroke-width="2"/><path ${f('blue')} d="M80 70h14l-2 14H82z" stroke-width="2.5"/>`,
    seasons: `<rect ${f('pink')} x="6" y="6" width="44" height="44"/><rect ${f('sky')} x="50" y="6" width="44" height="44"/><rect ${f('orange')} x="6" y="50" width="44" height="44"/><rect ${f('white')} x="50" y="50" width="44" height="44"/>
      <g transform="translate(8 8) scale(.4)">${ICONS.sakura}</g><g transform="translate(52 8) scale(.4)">${ICONS.sun}</g><g transform="translate(8 52) scale(.4)">${ICONS.leaves}</g><g transform="translate(52 52) scale(.4)">${ICONS.snow}</g>`,
    ghost: `<path ${f('white')} d="M20 90V42q0-32 30-32t30 32v48l-10-8-10 8-10-8-10 8-10-8z"/><g fill="${INK}" stroke="none"><ellipse cx="40" cy="44" rx="5" ry="7"/><ellipse cx="60" cy="44" rx="5" ry="7"/></g><ellipse ${f('dark')} cx="50" cy="64" rx="7" ry="9" stroke-width="2"/>
      <path d="M10 30l-6 6M90 30l6 6" stroke="${C.purple}" stroke-width="3"/>`,
    kadomatsu: `<path ${f('wood')} d="M14 66h72l-6 28H20z"/><path d="M18 76h64M20 86h60" stroke="${C.brown}" stroke-width="2.5"/>
      <g ${f('green')}><path d="M30 66V30l8-10v46z"/><path d="M42 66V12l8-8v62z"/><path d="M54 66V22l8-10v54z"/></g><path d="M30 30l8-10M42 12l8-8M54 22l8-10" stroke-width="2.5"/>
      <path ${f('leaf')} d="M66 66q2-24 14-30 4 16-6 30zM20 66q-2-20 8-26 4 14-2 26z" stroke-width="2.5"/><g fill="${C.red}" stroke="none"><circle cx="72" cy="56" r="3"/><circle cx="76" cy="50" r="3"/></g>`,
    popper: `<path ${f('yellow')} d="M10 92l18-56 38 38z"/><path d="M18 66l20 20M24 50l26 26" stroke="${C.red}" stroke-width="3"/><path ${f('red')} d="M28 36l38 38" stroke-width="3"/>
      <g stroke-width="3"><path d="M56 30q8-12 22-8" stroke="${C.blue}"/><path d="M68 44q12-6 22 2" stroke="${C.green}"/><path d="M44 18q2-12 12-14" stroke="${C.pink}"/></g>
      <g stroke="none"><circle fill="${C.red}" cx="84" cy="14" r="3.5"/><circle fill="${C.yellow}" cx="90" cy="30" r="3"/><rect fill="${C.green}" x="62" y="8" width="6" height="6" transform="rotate(30 65 11)"/><rect fill="${C.purple}" x="80" y="56" width="6" height="6" transform="rotate(20 83 59)"/></g>`,
    flask: `<path ${f('white')} d="M40 8h20v28l26 46a6 6 0 0 1-6 10H20a6 6 0 0 1-6-10l26-46z"/><path fill="${C.green}" stroke="none" d="M30 60h40l13 23a4 4 0 0 1-4 6H21a4 4 0 0 1-4-6z"/><path d="M40 8h20v28l26 46a6 6 0 0 1-6 10H20a6 6 0 0 1-6-10l26-46z"/>
      <path d="M36 8h28" stroke-width="5"/><g ${f('white')} stroke-width="2"><circle cx="44" cy="72" r="4"/><circle cx="56" cy="80" r="3"/><circle cx="52" cy="50" r="3"/></g>`,
    shapes: `<circle ${f('red')} cx="28" cy="30" r="20"/><path ${f('yellow')} d="M72 8l22 40H50z"/><rect ${f('blue')} x="12" y="58" width="34" height="34"/><path ${f('green')} d="${starPath(72, 74, 20, 9)}"/>`,
    dumbbell: `<path d="M24 50h52" stroke-width="8"/><rect ${f('dark')} x="10" y="28" width="14" height="44" rx="3"/><rect ${f('dark')} x="76" y="28" width="14" height="44" rx="3"/><rect ${f('dark')} x="2" y="36" width="10" height="28" rx="3"/><rect ${f('dark')} x="88" y="36" width="10" height="28" rx="3"/>`,
    weight: `<path ${f('dark')} d="M26 34h48l14 56H12z"/><path d="M38 34q0-24 12-24t12 24" stroke-width="7"/><text x="50" y="74" class="lis-art-glyph lis-art-glyph-lg" fill="#fff" stroke="none">10kg</text>`,
    snail: `<path ${f('skin')} d="M6 80h70q8 0 10-10l4-26-8-2-4 18H6z"/><path d="M84 42l-4-14M90 42l2-14" stroke-width="2.5"/><g fill="${INK}" stroke="none"><circle cx="80" cy="28" r="3"/><circle cx="92" cy="28" r="3"/></g>
      <circle ${f('orange')} cx="42" cy="54" r="26"/><path d="M42 54a5 5 0 1 1 5 5a11 11 0 1 1-11-11a17 17 0 1 1 17 17" stroke-width="3"/>`,
    steering: `<circle cx="50" cy="50" r="38" stroke="${INK}" stroke-width="14"/><circle cx="50" cy="50" r="38" stroke="${C.dark}" stroke-width="8"/><circle ${f('silver')} cx="50" cy="50" r="12"/>
      <path d="M38 50H14M62 50h24M50 62v24" stroke="${INK}" stroke-width="10"/><path d="M38 50H14M62 50h24M50 62v24" stroke="${C.silver}" stroke-width="5"/>`,
    kettle: `<g stroke="${C.gray}"><path d="M84 30q-4-6 0-12t0-12M92 34q-4-6 0-12"/></g><path ${f('silver')} d="M18 84q-6-30 10-44h44q16 14 10 44z"/><path ${f('silver')} d="M76 56l14-20 4 4-12 26z"/>
      <path d="M30 40q0-24 20-24t20 24" stroke-width="5"/><ellipse ${f('dark')} cx="50" cy="40" rx="22" ry="5"/><circle ${f('dark')} cx="50" cy="34" r="4"/><path ${f('orange')} d="M22 92q28-8 56 0z" stroke-width="2.5"/><path d="M30 58q2 14 0 20" stroke="#fff" stroke-width="3" opacity=".7"/>`,
    slope: `<path ${f('sky')} d="M2 6h96v88H2z" stroke="none"/><path ${f('grass')} d="M2 94L98 30v64z"/><path ${f('gray')} d="M2 94L98 40v12L18 94z"/><g transform="translate(46 40) scale(.36)">${ICONS.walk}</g>`,
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
