// Checks for the News page: every story in news-data.js has a unique id, a
// date, sources, and an N5, N4 and N3 version with a headline and sentences
// in sound furigana markup (every kanji with a kana reading — the 🔊 buttons
// read those). news-words.js (scripts/tokenize_news.mjs) must cover every
// headline and sentence exactly, with every word and grammar point it names.
// Every story has its own page, news-<id>.html (scripts/render_news_pages.mjs).
// Also checks news.js's helpers.
const fs = require('fs');
global.window = global;
require('./news-data.js');
require('./news-words.js');
const News = require('./news.js');

const { NEWS_ITEMS, NEWS_WORDS } = global;
const RUBY = /([一-鿿々]+)\[([^\]]*)\]/g;
const KANJI = /[一-鿿々]/;
const KANA = /^[ぁ-ゖァ-ヺー]+$/;

let passed = 0;
let failed = 0;
function check(ok, label) {
  if (ok) passed++;
  else { failed++; console.log(`  FAIL: ${label}`); }
}

function checkMarkup(jp, where) {
  let m;
  RUBY.lastIndex = 0;
  while ((m = RUBY.exec(jp))) check(KANA.test(m[2]), `${where}: reading "${m[2]}" for ${m[1]} isn't kana`);
  const rest = jp.replace(RUBY, '');
  check(!/[[\]]/.test(rest), `${where}: stray bracket in "${jp}"`);
  check(!KANJI.test(rest), `${where}: kanji without furigana in "${jp}"`);
}

check(Array.isArray(NEWS_ITEMS) && NEWS_ITEMS.length >= 3, 'expected at least 3 news stories');
const ids = new Set();
NEWS_ITEMS.forEach((item, k) => {
  const name = item.id || `story ${k + 1}`;
  check(/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/.test(item.id || '') && !ids.has(item.id), `${name}: id must be unique and start with the date`);
  ids.add(item.id);
  check(/^\d{4}-\d{2}-\d{2}$/.test(item.date || '') && item.id.startsWith(item.date), `${name}: date missing or not the id's date`);
  check(k === 0 || item.date <= NEWS_ITEMS[k - 1].date, `${name}: newest stories go first`);
  ['emoji', 'titleEn'].forEach(f => check(typeof item[f] === 'string' && item[f].length > 0, `${name}: missing ${f}`));
  check(Array.isArray(item.sources) && item.sources.length > 0 && item.sources.every(s => s.name && /^https:\/\//.test(s.url)), `${name}: needs sources with a name and https url`);
  News.LEVELS.forEach(level => {
    const v = item.levels && item.levels[level];
    check(!!v, `${name}: no ${level} version`);
    if (!v) return;
    check(typeof v.title === 'string' && v.title.length > 0, `${name} ${level}: missing title`);
    checkMarkup(v.title || '', `${name} ${level} title`);
    check(Array.isArray(v.lines) && v.lines.length >= 5, `${name} ${level}: fewer than 5 sentences`);
    (v.lines || []).forEach((l, i) => {
      const where = `${name} ${level} line ${i + 1}`;
      check(Array.isArray(l) && (l.length === 2 || l.length === 3), `${where}: expected [jp, en] or [jp, en, note]`);
      const [jp, en, note] = l;
      check(typeof jp === 'string' && jp.length > 0 && typeof en === 'string' && en.length > 0, `${where}: missing jp or en`);
      check(note === undefined || (typeof note === 'string' && note.length > 0), `${where}: empty note`);
      checkMarkup(jp || '', where);
    });
  });
  Object.keys(item.levels || {}).forEach(l => check(News.LEVELS.includes(l), `${name}: unknown level ${l}`));
});

// The levels should really differ: N3 sentences are longer on average than N5.
const avg = (item, level) => {
  const lines = item.levels[level].lines.map(l => News.plainText(l[0]).length);
  return lines.reduce((a, b) => a + b, 0) / lines.length;
};
NEWS_ITEMS.forEach(item => check(avg(item, 'N3') > avg(item, 'N5'), `${item.id}: N3 sentences aren't longer than N5`));

// ─── Words and grammar (news-words.js) ───────────────────────────────────────

const stale = 'run node scripts/tokenize_news.mjs';
const lineIds = new Set();
NEWS_ITEMS.forEach(item => News.LEVELS.forEach(level => {
  const v = item.levels[level];
  if (!v) return;
  [[News.lineId(item, level, 't'), v.title], ...v.lines.map((l, i) => [News.lineId(item, level, i), l[0]])].forEach(([id, jp]) => {
    lineIds.add(id);
    const line = NEWS_WORDS.lines[id];
    check(!!line, `${id}: no words — ${stale}`);
    if (!line) return;
    check(line.w.map(p => (typeof p === 'string' ? p : p[0])).join('') === jp, `${id}: words don't match the text — ${stale}`);
    line.w.filter(p => typeof p !== 'string').forEach(([, key]) => {
      const g = NEWS_WORDS.gloss[key];
      check(Array.isArray(g) && g.length === 3 && g.every(x => typeof x === 'string' && x), `${id}: bad gloss for "${key}"`);
    });
    const text = News.plainText(jp);
    line.g.forEach(([gid, snippet]) => {
      const g = NEWS_WORDS.grammar[gid];
      check(!!g && !!g.title && !!g.pattern && !!g.note && !!g.level, `${id}: grammar "${gid}" missing or incomplete`);
      check(text.includes(snippet), `${id}: grammar snippet "${snippet}" not in "${text}"`);
    });
    const src = News.lineSource(NEWS_ITEMS, id);
    check(!!src && src.jp === jp, `${id}: lineSource() doesn't find it`);
  });
}));
Object.keys(NEWS_WORDS.lines).forEach(id => check(lineIds.has(id), `news-words.js has a line ${id} that no longer exists — ${stale}`));
const sentences = [...lineIds].filter(id => !id.endsWith(':t')).map(id => NEWS_WORDS.lines[id]).filter(Boolean);
check(sentences.every(l => l.g.length > 0), 'every sentence should have some grammar');
check(sentences.every(l => l.w.filter(Array.isArray).length >= 2), 'every sentence should have tappable words');

// ─── Recordings (news-audio.js) ──────────────────────────────────────────────
// scripts/generate_news_audio.py records every story at every level; each
// recording must match the text it was made from, with a time for the
// headline and every sentence, and its file must exist.

require('./news-audio.js');
const AUDIO = global.NEWS_AUDIO || {};
const reRecord = 'run scripts/generate_news_audio.py (see CLAUDE.md)';
const audioKeys = new Set();
NEWS_ITEMS.forEach(item => News.LEVELS.forEach(level => {
  if (!item.levels[level]) return;
  const key = News.audioKey(item, level);
  audioKeys.add(key);
  const rec = AUDIO[key];
  check(!!rec, `${key}: no recording — ${reRecord}`);
  if (!rec) return;
  check(rec.hash === News.scriptHash(News.audioScript(item, level)), `${key}: recording is out of date — ${reRecord}`);
  check(rec.src === `audio/news/${item.id}-${level}.mp3` && fs.existsSync(`${__dirname}/${rec.src}`), `${key}: missing file ${rec.src}`);
  check(Array.isArray(rec.title) && rec.title.length === 2, `${key}: no headline time`);
  check(Array.isArray(rec.steps) && rec.steps.length === item.levels[level].lines.length, `${key}: needs a time for every sentence`);
  const times = [rec.title, ...(rec.steps || [])];
  check(times.every((t, i) => t[0] < t[1] && (i === 0 || t[0] >= times[i - 1][1])), `${key}: times out of order`);
}));
Object.keys(AUDIO).forEach(k => check(audioKeys.has(k), `news-audio.js has ${k}, a story that's gone — ${reRecord}`));
fs.readdirSync(`${__dirname}/audio/news`).forEach(f => check(Object.values(AUDIO).some(r => r.src === `audio/news/${f}`), `audio/news/${f} isn't used — ${reRecord}`));

// ─── Helpers ─────────────────────────────────────────────────────────────────

check(News.deckSentence({ w: [['食[た]べ物[もの]', '食べ物'], 'の', ['高[たか]く', '高い']] }) === '食[た]べ物[もの] の 高[たか]く>高い', 'deckSentence() marks words written differently');
check(News.rubyHtml('海[うみ]<b>') === '<ruby>海<rp>(</rp><rt>うみ</rt><rp>)</rp></ruby>&lt;b&gt;', 'rubyHtml() adds ruby and escapes');
check(News.kanaText('台風[たいふう]が来[く]る') === 'たいふうがくる', 'kanaText() reads the furigana');
check(News.lineSource(NEWS_ITEMS, 'nope:N5:0') === null, 'lineSource() of an unknown story is null');

// ─── The page ────────────────────────────────────────────────────────────────

const html = fs.readFileSync(`${__dirname}/news.html`, 'utf8');
['news-data.js', 'news-words.js', 'news-audio.js', 'news.js', 'app.js'].forEach(f => check(html.includes(`src="${f}`), `news.html doesn't load ${f}`));
['news-headlines', 'news-index-levels', 'news-toggle-furigana', 'news-saved-grammar-list', 'news-saved-grammar-count'].forEach(id => check(html.includes(`id="${id}"`), `news.html has no #${id}`));

// One page per story, written by scripts/render_news_pages.mjs.
const pages = fs.readdirSync(__dirname).filter(f => /^news-\d{4}-.+\.html$/.test(f));
const renderIt = 'run node scripts/render_news_pages.mjs';
NEWS_ITEMS.forEach(item => {
  const file = News.pageFile(item.id);
  check(pages.includes(file), `${file} missing — ${renderIt}`);
  if (!pages.includes(file)) return;
  const page = fs.readFileSync(`${__dirname}/${file}`, 'utf8');
  check(page.includes(`data-story="${item.id}"`), `${file}: wrong story — ${renderIt}`);
  ['news-text', 'news-panel', 'news-panel-body', 'news-levels', 'news-toggle-furigana', 'news-toggle-english', 'btn-news-read', 'btn-news-read-slow'].forEach(id => check(page.includes(`id="${id}"`), `${file} has no #${id} — ${renderIt}`));
  News.LEVELS.forEach(l => check(page.includes(News.plainText(item.levels[l].title)), `${file}: ${l} text out of date — ${renderIt}`));
  check(fs.readFileSync(`${__dirname}/sitemap.xml`, 'utf8').includes(`/${file}`), `${file} missing from sitemap.xml — ${renderIt}`);
});
pages.forEach(f => check(NEWS_ITEMS.some(it => News.pageFile(it.id) === f), `${f} is for a story that's gone — ${renderIt}`));
fs.readdirSync(__dirname).filter(f => f.endsWith('.html') && f !== 'index.html' && /class="page-nav"/.test(fs.readFileSync(`${__dirname}/${f}`, 'utf8'))).forEach(f => {
  check(fs.readFileSync(`${__dirname}/${f}`, 'utf8').includes('href="news.html"'), `${f}: nav has no News link`);
});
check(fs.readFileSync(`${__dirname}/sitemap.xml`, 'utf8').includes('/news.html'), 'news.html missing from sitemap.xml');

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
