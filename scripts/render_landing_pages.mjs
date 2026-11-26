#!/usr/bin/env node
// Writes the practice-first landing pages from the site's own data:
//
//   verb-conjugation-chart.html         verb conjugation chart
//   wa-vs-ga.html                       は vs が rule of thumb + quiz
//   jlpt-listening-practice.html        listening sample + level links
//   grammar-cheatsheet.html             N5–N1 grammar, one line per point
//
//   node scripts/render_landing_pages.mjs           write the pages
//   node scripts/render_landing_pages.mjs --check   fail if they're stale
//
// The は/が and listening pages open on a playable mini quiz (landing.js
// reads it from the #lp-data JSON), with a link to the full practice right
// beside it and the reference text underneath; the verb page is just the
// chart (a page without `quiz` gets no quiz). They wear the site's own chrome: style.css,
// the shared header (app.js), and the page nav and scripts cut from
// news.html, so edit those (not these pages) and re-run this. The chart and
// the quiz answers come from
// conjugator.js, particles-data.js / particles-notes.js and listening-data.js,
// so they can't drift from the real drills. The script also keeps these
// pages' entries in sitemap.xml, after the homepage.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://tokidoki.meertens.dev';
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const require = createRequire(import.meta.url);
const CHECK = process.argv.includes('--check');

const RUBY_RE = /([一-鿿々]+)\[([^\]]+)\]/g;
const ruby = s => s.replace(RUBY_RE, '<ruby>$1<rp>(</rp><rt>$2</rt><rp>)</rp></ruby>');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const die = m => { throw new Error(m); };

// ---- data ---------------------------------------------------------------
const C = require('../conjugator.js');
const { ALL_VERBS } = require('../verbs.js');
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ['particles-data.js', 'particles-notes.js', 'listening-data.js', 'listening-audio.js']) {
  vm.runInContext(read(f), ctx, { filename: f });
}
const W = ctx.window;

// ---- 1. verb conjugation ------------------------------------------------
const verb = k => ALL_VERBS.find(v => v.kanji === k) || die(`no verb ${k}`);
const CHART_VERBS = [['書く', 'u-verb'], ['食べる', 'ru-verb'], ['する', 'irregular'], ['来る', 'irregular']];
const CHART_FORMS = ['masu', 'masu-neg', 'masu-past', 'mashou', 'te', 'nai', 'ta', 'nakatta', 'tari', 'tara', 'tai', 'potential', 'volitional', 'passive', 'causative', 'ba', 'causative-passive', 'imperative', 'prohibitive', 'zu', 'naide', 'nakute', 'nakereba', 'chau'];

// Splits a conjugated form the way the drills colour an answer
// (formatConjugatedWithStem in app.js): [stem, changed kana, ending]. The
// stem stays grey, the changed kana plain, the ending in the form's colour.
// Irregular verbs take the longest ending they share with the ru- or u-verb
// (し + ます, こ + られる); what's left is the changed part.
function splitForm(v, f) {
  const out = C.conjugate(v, f) || die(`${v.kanji} ${f}`);
  const r = v.reading;
  if (f === 'prohibitive') return [r, '', out.slice(r.length)];
  if (v.type === 'ru') return [r.slice(0, -1), '', out.slice(r.length - 1)];
  if (v.type === 'u') {
    const base = r.slice(0, -1), rest = out.slice(base.length);
    // The command is just the え-row kana: that kana is the ending.
    return f === 'imperative' ? [base, '', rest] : [base, rest[0], rest.slice(1)];
  }
  const ends = ['ru', 'u'].map(t => splitForm(CHART_VERBS.map(([k]) => verb(k)).find(x => x.type === t), f)[2])
    .filter(e => e && out.endsWith(e) && out.length > e.length).sort((a, b) => b.length - a.length);
  return ends.length ? ['', out.slice(0, -ends[0].length), ends[0]] : ['', out, ''];
}
const colored = ([stem, changed, ending]) =>
  (stem ? `<span class="conjugation-stem">${esc(stem)}</span>` : '') +
  (changed ? `<span class="conjugation-changed">${esc(changed)}</span>` : '') +
  (ending ? `<span class="conjugation-ending">${esc(ending)}</span>` : '');

// Each form's row is tinted in the colour the drills give it; its button
// opens a row underneath with the form's rules (FORM_INFO's explanation,
// the same text as the drills' reference). landing.js does the opening.
function chartTable() {
  const vs = CHART_VERBS.map(([k, t]) => [verb(k), t]);
  let h = '<p class="lp-chart-help">Tap a form to see how it\'s made. ' +
    '<span class="lp-key"><span class="conjugation-stem">stays</span> · <span class="conjugation-changed">changes</span> · ' +
    '<span class="conjugation-ending" style="--form-color:var(--accent)">ending</span></span> ' +
    '<button type="button" class="lp-rules-all" hidden>Show all rules</button></p>' +
    '<div class="lp-scroll lp-chart"><table><thead><tr><th scope="col">Form</th>' +
    vs.map(([v, t]) => `<th scope="col" lang="ja">${esc(v.kanji)}<small>${t}</small></th>`).join('') + '</tr></thead><tbody>';
  for (const f of CHART_FORMS) {
    const info = C.FORM_INFO[f];
    if (!info.explanation) die(`no explanation for ${f}`);
    h += `<tr class="lp-form-row" style="--form-color:${info.color}"><th scope="row">` +
      `<button type="button" class="lp-rule-btn" aria-expanded="false" aria-controls="rule-${f}">` +
      `<span class="lp-form-name"><span class="form-pill" lang="ja">${esc(info.symbol)}</span>${esc(info.name)}</span>` +
      `<small><span lang="ja">${esc(info.nameJp)}</span> · ${info.level}</small></button></th>` +
      vs.map(([v]) => `<td class="jp" lang="ja">${colored(splitForm(v, f))}</td>`).join('') + '</tr>' +
      `<tr class="lp-rule" id="rule-${f}" style="--form-color:${info.color}" hidden><td colspan="${vs.length + 1}">` +
      `<div class="ref-explanation">${info.explanation}</div></td></tr>`;
  }
  return h + '</tbody></table></div>';
}

const TE_ROWS = [
  ['う · つ · る', 'って', '買う → 買って · 待つ → 待って · 帰る → 帰って'],
  ['む · ぶ · ぬ', 'んで', '飲む → 飲んで · 遊ぶ → 遊んで · 死ぬ → 死んで'],
  ['く', 'いて', '書く → 書いて (exception: 行く → 行って)'],
  ['ぐ', 'いで', '泳ぐ → 泳いで'],
  ['す', 'して', '話す → 話して'],
  ['ru-verb る', 'て', '食べる → 食べて · 見る → 見て'],
];
function teTable() {
  return '<div class="lp-scroll"><table><thead><tr><th scope="col">Ending</th><th scope="col">て-form</th><th scope="col">Examples</th></tr></thead><tbody>' +
    TE_ROWS.map(([a, b, c]) => `<tr><td class="jp" lang="ja">${esc(a)}</td><td class="jp" lang="ja">${esc(b)}</td><td class="jp" lang="ja">${esc(c)}</td></tr>`).join('') +
    '</tbody></table></div>';
}

// ---- 2. は vs が --------------------------------------------------------
const WA_GA_IDS = ['wa2', 'ga1', 'ga4', 'wa13', 'ga14', 'wa8'];
const em = s => esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>');

function particleQuestions() {
  return WA_GA_IDS.map(id => {
    const item = W.PARTICLE_QUIZ_ITEMS.find(x => x.id === id) || die(`no particle item ${id}`);
    const note = W.PARTICLE_NOTES[id] || die(`no note ${id}`);
    const other = item.particle === 'は' ? 'が' : 'は';
    const why = note.not[other] || die(`no "${other}" note for ${id}`);
    return {
      prompt: `<span class="jp">${item.beforeHtml}<span class="lp-blank">＿</span>${item.afterHtml}</span><span class="lp-en">${esc(item.en)}</span>`,
      options: ['は', 'が'],
      answer: item.particle === 'は' ? 0 : 1,
      fixed: true,
      explain: `<p><strong lang="ja">${esc(item.particle)}</strong>: ${em(note.why)}</p><p><span lang="ja">${esc(other)}</span>: ${em(why)}</p>`,
    };
  });
}

const WA_GA_BODY = `
<section class="lp-ref">
  <h2 class="lis-heading">The rule of thumb</h2>
  <div class="lp-two">
    <div class="lp-card"><h3>は</h3><p>The <strong>topic</strong>: what the sentence is about, something you both already know.</p>
      <ul><li lang="ja">${ruby('私[わたし]は学生[がくせい]です。')}<em>I am a student.</em></li>
      <li lang="ja">${ruby('これは私[わたし]の傘[かさ]です。')}<em>This is my umbrella.</em></li></ul></div>
    <div class="lp-card"><h3>が</h3><p>The <strong>new information</strong>: existence, ability, likes, and the answer to a question word like 誰 or 何.</p>
      <ul><li lang="ja">${ruby('猫[ねこ]がいます。')}<em>There is a cat.</em></li>
      <li lang="ja">${ruby('誰[だれ]が来[き]ましたか。')}<em>Who came?</em></li>
      <li lang="ja">${ruby('日本語[にほんご]がわかります。')}<em>I understand Japanese.</em></li></ul></div>
  </div>
  <p>Both often share one sentence: in <span lang="ja">${ruby('私[わたし]は寿司[すし]が好[す]きです。')}</span> ("I like sushi") 私 is the topic and 寿司 is the thing that is liked.</p>
</section>`;

// ---- 3. listening -------------------------------------------------------
function listeningQuestions() {
  const sec = W.LISTENING_SECTIONS.find(s => s.id === 'sokuji') || die('no sokuji section');
  return sec.items.filter(it => it.level === 'N5' && W.LISTENING_AUDIO[`sokuji/${it.id}`]).slice(0, 6).map(it => {
    const src = W.LISTENING_AUDIO[`sokuji/${it.id}`].src;
    fs.existsSync(path.join(ROOT, src)) || die(`missing ${src}`);
    const heard = it.lines.map(l => `<span lang="ja">${ruby(l.ja)}</span> (${esc(l.en)})`).join('<br>');
    return {
      prompt: 'Listen to the line, then pick the natural reply.' +
        '<span class="lp-en">Press play, then choose 1, 2 or 3. You can replay it here; the real test plays once.</span>',
      audio: src,
      options: ['1', '2', '3'],
      answer: it.answer,
      fixed: true,
      explain: `<p>${heard}</p><ol>${it.choices.map(c => `<li><span lang="ja">${ruby(c.ja)}</span> — ${esc(c.en)}</li>`).join('')}</ol><p>${esc(it.why)}</p>`,
    };
  });
}

const LISTENING_BODY = `
<section class="lp-ref">
  <h2 class="lis-heading">Pick your level</h2>
  <p>Free JLPT-style listening (聴解) with 900 questions and 32 mock tests, scripts with furigana and English after every question.</p>
  <div class="lp-levels">
    <a class="btn-secondary" href="listening.html" data-cta>N5 practice</a><a class="btn-secondary" href="listening.html" data-cta>N4 practice</a>
    <a class="btn-secondary" href="listening.html" data-cta>N3 practice</a><a class="btn-secondary" href="listening.html" data-cta>N2 practice</a>
  </div>
</section>
<section class="lp-ref">
  <h2 class="lis-heading">What the listening section asks</h2>
  <ul>
    <li><strong lang="ja">課題理解</strong>: hear what someone has to do, then pick it from four pictures.</li>
    <li><strong lang="ja">ポイント理解</strong>: listen for one detail (when, why, which).</li>
    <li><strong lang="ja">発話表現</strong>: a picture with an arrow, then pick what that person says.</li>
    <li><strong lang="ja">即時応答</strong>: the quick-response type above: one line, three replies, pick the natural one.</li>
  </ul>
</section>`;
const VOICE_CREDIT = (read('listening.html').match(/<p class="lis-credits"[^>]*>([^<]+)<\/p>/) || die('no credits line'))[1];

// ---- 4. grammar cheatsheet ----------------------------------------------
// One line per grammar point (pattern, meaning, how to make it); each is a
// <details> that opens to more explanation, examples and the traps. The
// points are hand-written in scripts/grammar_cheatsheet_data.mjs; landing.js
// adds the search box, level filter and "Open all".
const { SECTIONS: GRAMMAR } = await import('./grammar_cheatsheet_data.mjs');
const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const SLOT_RE = /(V-(?:dict|masu|te|ta|nai|vol)|い-adj|な-adj|\bplain\b|\bN\b)/g;
// Every kanji on the page has furigana (漢字[かんじ] in the data), so the
// rules and notes are as readable as the examples.
// @{pattern} in the data links to the point with that pattern (the build
// fails if there's none); @{label|href} links anywhere.
const POINT_IDS = new Map(GRAMMAR.flatMap(s => s.points.map((g, i) => [g.p, `${s.id}-${i + 1}`])));
const LINK_RE = /@\{([^}|]+)(?:\|([^}]+))?\}/g;
const jp = s => {
  let out = '', last = 0;
  for (const m of s.matchAll(LINK_RE)) {
    const href = m[2] || (POINT_IDS.has(m[1]) ? `#${POINT_IDS.get(m[1])}` : die(`no grammar point ${m[1]} to link to`));
    out += ruby(esc(s.slice(last, m.index))) + `<a class="gc-link" href="${esc(href)}">${ruby(esc(m[1]))}</a>`;
    last = m.index + m[0].length;
  }
  return out + ruby(esc(s.slice(last)));
};
const slots = s => jp(s).replace(SLOT_RE, '<span class="gc-slot">$1</span>');
const marked = s => jp(s).replace(/\{([^}]+)\}/g, '<b>$1</b>');
const GRAMMAR_COUNT = GRAMMAR.reduce((n, s) => n + s.points.length, 0);

function grammarBody() {
  const ids = new Set();
  const toc = GRAMMAR.map(s => `<a href="#${s.id}">${esc(s.title)}</a>`).join('');
  let h = `<section class="lp-ref gc-tools" hidden>
        <div class="gc-bar">
          <input type="search" class="gc-search" placeholder="Search: て, nara, because, passive…" aria-label="Search the grammar points (Japanese, romaji or English)">
          <div class="gc-levels" role="group" aria-label="JLPT level">` +
    ['All', ...LEVELS].map(l => `<button type="button" class="gc-lv-btn" data-lv="${l}" aria-pressed="${l === 'All'}">${l}</button>`).join('') +
    `</div>
          <button type="button" class="lp-rules-all gc-all">Open all</button>
        </div>
        <p class="gc-none" hidden>Nothing matches. Try a shorter word, or another level.</p>
      </section>
      <section class="lp-ref gc-key">
        <p><b>How to read the rules:</b> <span class="gc-slot">V-dict</span> <ruby>食<rp>(</rp><rt>た</rt><rp>)</rp></ruby>べる · <span class="gc-slot">V-masu</span> <ruby>食<rp>(</rp><rt>た</rt><rp>)</rp></ruby>べ(ます) · <span class="gc-slot">V-te</span> <ruby>食<rp>(</rp><rt>た</rt><rp>)</rp></ruby>べて · <span class="gc-slot">V-ta</span> <ruby>食<rp>(</rp><rt>た</rt><rp>)</rp></ruby>べた · <span class="gc-slot">V-nai</span> <ruby>食<rp>(</rp><rt>た</rt><rp>)</rp></ruby>べない · <span class="gc-slot">V-vol</span> <ruby>食<rp>(</rp><rt>た</rt><rp>)</rp></ruby>べよう · <span class="gc-slot">N</span> noun · <span class="gc-slot">plain</span> plain form (<ruby>食<rp>(</rp><rt>た</rt><rp>)</rp></ruby>べる, <ruby>食<rp>(</rp><rt>た</rt><rp>)</rp></ruby>べない, <ruby>食<rp>(</rp><rt>た</rt><rp>)</rp></ruby>べた, <ruby>食<rp>(</rp><rt>た</rt><rp>)</rp></ruby>べなかった). Tap a line for more, examples and exceptions. Levels follow common study lists; the JLPT doesn’t publish an official one.</p>
        <nav class="gc-toc" aria-label="Sections">${toc}</nav>
      </section>`;
  for (const s of GRAMMAR) {
    h += `\n      <section class="lp-ref gc-section" id="${s.id}"><h2 class="lis-heading">${esc(s.title)} <span class="gc-jp" lang="ja">${jp(s.jp)}</span></h2><div class="gc-list">`;
    s.points.forEach((g, i) => {
      if (!LEVELS.includes(g.lv)) die(`${s.id} ${g.p}: level ${g.lv}`);
      for (const k of ['p', 'm', 'r', 'more']) if (!g[k]) die(`${s.id} ${g.p}: no ${k}`);
      for (const t of [s.jp, g.p, g.m, g.r, g.more, ...g.ex.flat(), ...g.warn]) {
        if (/[一-鿿々]/.test(t.replace(RUBY_RE, ''))) die(`${s.id} ${g.p}: kanji without furigana in ${t}`);
      }
      if (!g.ex?.length || !g.warn?.length) die(`${s.id} ${g.p}: needs examples and exceptions`);
      for (const [ja] of g.ex) {
        if (!/\{[^}]+\}/.test(ja)) die(`${s.id} ${g.p}: example doesn't mark the grammar: ${ja}`);
      }
      const id = `${s.id}-${i + 1}`;
      if (ids.has(id)) die(`duplicate id ${id}`);
      ids.add(id);
      h += `<details class="gc-item" id="${id}" data-lv="${g.lv}"><summary>` +
        `<span class="gc-p" lang="ja">${jp(g.p)}</span>` +
        `<span class="gc-sum"><span class="gc-m">${jp(g.m)}</span><span class="gc-r">${slots(g.r)}</span></span>` +
        `<span class="gc-lv gc-${g.lv.toLowerCase()}">${g.lv}</span></summary><div class="gc-more">` +
        `<p>${jp(g.more)}</p>` +
        `<ul class="gc-ex">${g.ex.map(([ja, en]) => `<li><span class="gc-ja" lang="ja">${marked(ja)}</span><span class="gc-en">${jp(en)}</span></li>`).join('')}</ul>` +
        `<div class="gc-warn"><span class="gc-warn-title">Watch out</span><ul>${g.warn.map(w => `<li>${jp(w)}</li>`).join('')}</ul></div>` +
        (g.links ? `<p class="gc-practice">Practise: ${g.links.map(([href, label]) => `<a href="${href}">${jp(label)} →</a>`).join(' · ')}</p>` : '') +
        `</div></details>`;
    });
    h += '</div>' + (s.practice.length ? `<p class="gc-practice">Practise: ${s.practice.map(([href, label]) => `<a href="${href}">${esc(label)} →</a>`).join(' · ')}</p>` : '') + '</section>';
  }
  return h + `\n      <section class="lp-ref lp-next"><p>Rules stick once you use them.</p><a class="btn-primary lp-btn" href="bunkei.html" data-cta>Drill the patterns in Bunkei →</a></section>`;
}

// ---- pages --------------------------------------------------------------
const PAGES = [
  {
    file: 'verb-conjugation-chart.html',
    title: 'Japanese Verb Conjugation Chart (JLPT N5 & N4) | Tokidoki',
    desc: 'Free Japanese verb conjugation chart for JLPT N5 & N4 (te, ta, nai, potential, volitional, passive, causative): tap any form to see how it is made.',
    shortTitle: 'Japanese Verb Conjugation Chart (JLPT N5 & N4) | Tokidoki',
    h1: 'Japanese verb conjugation chart (JLPT N5 & N4)',
    cta: { href: 'verbs.html', label: 'Practice all forms with spaced repetition →', lead: 'jump straight into the full drills →' },
    teaches: 'Japanese verb conjugation',
    hero: { face: '食', kicker: '動詞の活用 · JLPT N5 & N4', card: ['Verb Conjugation Chart', 'Every N5 & N4 form at a glance · how each is made'] },
    sub: 'Free, no login. Every N5 & N4 form at a glance, or',
    body: `<section class="lp-ref"><h2 class="lis-heading">Conjugation chart</h2>${chartTable()}</section>
<section class="lp-ref"><h2 class="lis-heading">て-form endings</h2>${teTable()}</section>
<section class="lp-ref lp-next"><p>The chart above is generated by the same rules as the drills.</p><a class="btn-primary lp-btn" href="verbs.html" data-cta>Drill every form by JLPT level →</a></section>`,
  },
  {
    file: 'wa-vs-ga.html',
    title: 'は vs が: When to Use Each Japanese Particle (Quiz) | Tokidoki',
    desc: 'は or が? A short rule of thumb and a 6-question quiz on the Japanese topic marker は and the subject marker が. Free, no login.',
    shortTitle: 'は vs が — Japanese Particle Quiz | Tokidoki',
    h1: 'は vs が: which particle?',
    cta: { href: 'particles-quiz.html', label: 'Practice all particles →', lead: 'open the full particle quiz →' },
    teaches: 'Japanese particles は and が',
    hero: { face: 'は', kicker: '助詞 · Topic or subject?', card: ['は vs が', 'Topic or subject? · rule of thumb + quiz'] },
    quiz: particleQuestions(),
    body: WA_GA_BODY,
  },
  {
    file: 'jlpt-listening-practice.html',
    title: 'JLPT Listening Practice (N5–N2): Free Audio Quiz | Tokidoki',
    desc: 'Free JLPT listening practice: try real-format quick-response questions with audio right now, then continue to 900 questions and 32 mock tests for N5–N2.',
    shortTitle: 'JLPT Listening Practice (N5–N2) | Tokidoki',
    h1: 'JLPT listening practice (N5–N2)',
    cta: { href: 'listening.html', label: 'Open the full listening practice →', lead: 'open the full practice →' },
    teaches: 'JLPT listening comprehension',
    hero: { face: '聴', kicker: '聴解 · JLPT N5–N2', card: ['JLPT Listening Sampler', 'Try real-format audio questions · N5–N2'] },
    quiz: listeningQuestions(),
    body: LISTENING_BODY,
    credit: VOICE_CREDIT,
  },
  {
    file: 'grammar-cheatsheet.html',
    title: 'Big Japanese Grammar Cheat Sheet (JLPT N5–N1) | Tokidoki',
    desc: `${GRAMMAR_COUNT} Japanese grammar points for JLPT N5–N1, one line each: what it means and how to make it. Tap any for examples and exceptions.`,
    shortTitle: 'Big Japanese Grammar Cheat Sheet (N5–N1) | Tokidoki',
    h1: 'Big Japanese grammar cheatsheet (JLPT N5–N1)',
    cta: { href: 'bunkei.html', label: 'Drill the patterns in Bunkei →', lead: 'drill the patterns →' },
    teaches: 'Japanese grammar',
    hero: { face: '文', kicker: '文法 · JLPT N5–N1', card: ['Big Grammar Cheatsheet', 'N5–N1, one line each · tap for more'] },
    sub: `Free, no login. ${GRAMMAR_COUNT} grammar points, one line each, or`,
    scripts: ['romaji.js?v=8'], // the search box takes romaji (nara → なら)
    body: grammarBody(),
  },
];

// The site chrome every page shares, cut from news.html: its stylesheet,
// the page nav (with no page marked current) and the scripts behind the
// header (theme toggle, login and sync).
const NEWS = read('news.html');
const cut = (from, to) => {
  const i = NEWS.indexOf(from);
  const j = NEWS.indexOf(to, i);
  if (i === -1 || j === -1) die(`news.html: can't find ${from} … ${to}`);
  return NEWS.slice(i, j);
};
const STYLE = cut('  <link rel="stylesheet" href="style.css', '\n') + '\n';
const NAV = (cut('      <nav class="page-nav"', '</nav>') + '</nav>')
  .replace(/ class="page-nav-item active" href="([^"]+)" aria-current="page"/g, ' class="page-nav-item" href="$1"');
const SCRIPTS = ['app.js', 'sync-merge.js', 'progress-stats.js', 'sync.js']
  .map(f => (NEWS.match(new RegExp(`  <script src="${f.replace('.', '\\.')}[^"]*"></script>\n`)) || die(`news.html: no ${f}`))[0]).join('');

// The hand-written blog posts (blog.html lists them, with these guides).
const BLOG_POSTS = [
  ['blog-ai-language-partner.html', 'AI as a Conversation Partner', 'One link to paste, starters & role-plays · blog post'],
  ['blog-japanese-for-tourists.html', 'Japanese for Tourists', 'Romaji & audio for every phrase · blog post'],
  ['blog-graded-stories.html', 'Learn Japanese with Graded Stories', 'How to read, and where to find stories · blog post'],
  ['blog-learning-japanese.html', "How I'm Learning Japanese", 'Tips & resources for every level · blog post'],
];

function render(p) {
  const url = `${SITE}/${p.file}`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'LearningResource', name: p.h1, description: p.desc, url,
    inLanguage: 'en', learningResourceType: p.quiz ? 'quiz' : 'reference', educationalLevel: 'Beginner', isAccessibleForFree: true, teaches: p.teaches,
    isPartOf: { '@type': 'WebSite', name: 'Tokidoki', url: `${SITE}/` },
  };
  const data = { page: p.file.replace('.html', ''), cta: p.cta, questions: p.quiz || [] };
  const json = o => JSON.stringify(o).replace(/</g, '\\u003c');
  const more = [...BLOG_POSTS, ...PAGES.filter(x => x !== p).map(x => [x.file, ...x.hero.card])]
    .map(([file, title, sub]) => `<a class="chapter-card" href="${file}">` +
      `<div class="chapter-card-title">${esc(title)}</div><div class="chapter-card-sub">${esc(sub)}</div></a>`).join('');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(p.title)}</title>
  <meta name="description" content="${esc(p.desc)}">
  <meta property="og:title" content="${esc(p.shortTitle)}">
  <meta property="og:description" content="${esc(p.desc)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="Tokidoki">
  <meta property="og:locale" content="en_US">
  <meta property="og:image" content="${SITE}/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Tokidoki — free Japanese practice, one plate at a time">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(p.shortTitle)}">
  <meta name="twitter:description" content="${esc(p.desc)}">
  <meta name="twitter:image" content="${SITE}/og-image.png">
  <link rel="canonical" href="${url}">
${STYLE}  <link rel="stylesheet" href="landing.css?v=8">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="icon" href="favicon.ico" sizes="48x48">
  <link rel="apple-touch-icon" href="apple-touch-icon.png">
  <meta name="theme-color" content="#f6f0e4" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#16141b" media="(prefers-color-scheme: dark)">
  <script type="application/ld+json">${json(ld)}</script>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXWYNZC7YH"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXWYNZC7YH');
  </script>
</head>
<body data-mode="guide">
  <!-- Written by scripts/render_landing_pages.mjs — edit that, not this file. -->
  <div id="app">

    <!-- Header (rendered by renderSharedChrome() in app.js) -->
    <div id="header-mount"></div>

    <main class="screen active lp">
${NAV}
      <section class="lis-hero lp-hero">
        <div class="lis-hero-face lp-hero-face" aria-hidden="true" lang="ja">${p.hero.face}</div>
        <div>
          <p class="lis-hero-kicker" lang="ja">${esc(p.hero.kicker)}</p>
          <h1 class="lis-hero-title">${esc(p.h1)}</h1>
          <p class="lis-hero-sub">${p.sub ? esc(p.sub) : `Free, no login. Warm up with ${p.quiz.length} quick questions, or`} <a href="${p.cta.href}" data-cta>${p.cta.lead}</a></p>
        </div>
      </section>
${p.quiz ? `      <div class="lp-quiz" id="lp-quiz"><noscript><p><a href="${p.cta.href}">${p.cta.label}</a></p></noscript></div>
` : ''}      ${p.body}
      <section class="lp-ref">
        <h2 class="lis-heading">More from the blog</h2>
        <div class="chapter-grid">${more}</div>
        <p><a href="blog.html">All posts &amp; tips →</a></p>
      </section>${p.credit ? `
      <p class="lis-credits">Voices: ${esc(p.credit.replace(/^Voices:\s*/, ''))}</p>` : ''}
    </main>

  </div>

  <script type="application/json" id="lp-data">${json(data)}</script>
${SCRIPTS}${p.scripts ? p.scripts.map(f => `  <script src="${f}"></script>\n`).join('') : ''}  <script src="landing.js?v=9"></script>
</body>
</html>
`;
}

// ---- sitemap ------------------------------------------------------------
function renderSitemap() {
  let s = read('sitemap.xml');
  const entry = p => `  <url>\n    <loc>${SITE}/${p.file}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
  for (const p of PAGES) {
    s = s.replace(new RegExp(`  <url>\\n    <loc>${SITE}/${p.file}</loc>\\n[\\s\\S]*?</url>\\n`), '');
  }
  const home = `    <loc>${SITE}/</loc>`;
  const at = s.indexOf(home);
  if (at === -1) die('sitemap.xml: no homepage entry');
  const after = s.indexOf('</url>\n', at) + '</url>\n'.length;
  return s.slice(0, after) + PAGES.map(entry).join('') + s.slice(after);
}

// ---- write / check ------------------------------------------------------
const outputs = [...PAGES.map(p => [p.file, render(p)]), ['sitemap.xml', renderSitemap()]];
let stale = 0;
for (const [f, text] of outputs) {
  const file = path.join(ROOT, f);
  const same = fs.existsSync(file) && fs.readFileSync(file, 'utf8') === text;
  if (same) continue;
  stale++;
  if (CHECK) console.error(`stale: ${f}`);
  else { fs.writeFileSync(file, text); console.log(`wrote ${f}`); }
}
if (CHECK && stale) { console.error('Run: node scripts/render_landing_pages.mjs'); process.exit(1); }
if (!stale) console.log('landing pages up to date');
