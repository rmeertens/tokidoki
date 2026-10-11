// Optional login, to keep progress in a Firebase account and share it
// between devices. Without logging in nothing changes: progress stays in
// localStorage as always.
//
// Adds an account button to the header. Logging in is with Google (a popup)
// or by email link (no passwords): enter your email, click the link we
// send. Logged out, saving every 20th word shows a note pointing at the
// button. Logged in, the dialog sums up what's been studied
// (progress-stats.js), and everything under the
// `tokidoki_` / `tokidoki-` keys is copied to Firestore, one document per
// user (users/{uid}, laid out as sync-merge.js describes), and merged with
// what's there by sync-merge.js. A sync runs when a page loads (at most
// every couple of minutes), when saving pauses, and when the tab is hidden.
//
// To keep database use and data transfer low, a sync first reads just the
// account's revision number; it downloads the rest only if another device
// has written since, and then writes only the fields that changed. It talks
// to Firestore's REST API directly (with the login's ID token, so
// firestore.rules still applies), which is what allows reading part of a
// document — and saves downloading the Firestore SDK.
//
// Firebase is only downloaded for people who open the login dialog or are
// logged in. Set FIREBASE_CONFIG to null to hide the button altogether.
(function () {
  'use strict';

  // Public by design: it only names the Firebase project. firestore.rules is
  // what keeps each account's data to its owner.
  const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyCbBS7IM7i76JaUBNSpHS3nX4kbK9o1Df8',
    authDomain: 'tokidoki---japanese-learning.firebaseapp.com',
    projectId: 'tokidoki---japanese-learning',
    storageBucket: 'tokidoki---japanese-learning.firebasestorage.app',
    messagingSenderId: '539818655318',
    appId: '1:539818655318:web:ef9bcebeb8acff28d645f7',
  };
  const SDK = 'https://www.gstatic.com/firebasejs/11.0.2';

  const UID_KEY = 'tokidoki_sync_uid';      // set while logged in, so pages know to load Firebase
  const BASE_KEY = 'tokidoki_sync_base';    // what this device and the account last agreed on
  const TIME_KEY = 'tokidoki_sync_time';    // when that was
  const RELOAD_KEY = 'tokidoki_sync_reload';
  const REV_KEY = 'tokidoki_sync_rev';      // the account's rev when it last held exactly the base
  // Saves are batched to keep database use low: a sync goes out once saving
  // has paused for PUSH_DELAY, or MAX_WAIT after the first unsent save during
  // non-stop study, and straight away when the tab is hidden or closed.
  const PUSH_DELAY = 30000;
  const MAX_WAIT = 120000;
  // A page load only checks the account when it's been this long since the
  // last sync (or something here hasn't been sent yet).
  const PULL_EVERY = 120000;

  if (!FIREBASE_CONFIG || !window.SyncMerge || !window.localStorage) return;
  const { isTracked, mergeAll, sameSnapshot, FORMAT, FIELDS, encodeAccount, decodeAccount, canonical, diffAccount } = window.SyncMerge;

  const store = window.localStorage;
  const get = k => { try { return store.getItem(k); } catch { return null; } };
  const set = (k, v) => { try { store.setItem(k, v); } catch { /* storage full or blocked */ } };
  const del = k => { try { store.removeItem(k); } catch { /* storage unavailable */ } };

  // ─── Watching saves ──────────────────────────────────────────────────────────

  let writingOwn = false;   // our own writes don't count as changes
  let changedSinceLoad = false;
  let pushTimer = null;
  let pendingSince = 0;     // when the oldest unsent save happened

  function noteChange(key) {
    if (writingOwn || !isTracked(String(key))) return;
    changedSinceLoad = true;
    if (DECK_KEYS.includes(key)) remindToLogIn();
    if (!user) return;
    if (!pendingSince) pendingSince = Date.now();
    clearTimeout(pushTimer);
    const wait = Math.max(0, Math.min(PUSH_DELAY, pendingSince + MAX_WAIT - Date.now()));
    pushTimer = setTimeout(() => sync(), wait);
  }

  // ─── Reminder ────────────────────────────────────────────────────────────────
  //
  // Every REMIND_EVERY words (or kanji) someone saves to their flashcard
  // decks while logged out, a hand-drawn note points at the account button.

  const DECK_KEYS = ['tokidoki_story_words', 'tokidoki_kanji_cards'];
  const REMIND_EVERY = 20;

  function savedCount() {
    let n = 0;
    DECK_KEYS.forEach(k => { try { n += Object.keys(JSON.parse(get(k)) || {}).length; } catch { /* unreadable deck */ } });
    return n;
  }

  const REMINDED_KEY = 'tokidoki_sync_reminded';  // the last milestone shown, so each shows once

  function remindToLogIn() {
    const n = savedCount();
    const milestone = Math.floor(n / REMIND_EVERY);
    if (milestone <= (Number(get(REMINDED_KEY)) || 0)) return;
    if (user || get(UID_KEY) || !window.TokidokiCoachMark) return;
    set(REMINDED_KEY, String(milestone));
    window.TokidokiCoachMark.show('#btn-account', 'login to sync progress<br>between devices');
  }

  const proto = Object.getPrototypeOf(store);
  const origSet = proto.setItem;
  const origRemove = proto.removeItem;
  proto.setItem = function (k, v) { origSet.call(this, k, v); if (this === store) noteChange(k); };
  proto.removeItem = function (k) { origRemove.call(this, k); if (this === store) noteChange(k); };

  function snapshot() {
    const out = {};
    for (let i = 0; i < store.length; i++) {
      const k = store.key(i);
      if (isTracked(k)) out[k] = store.getItem(k);
    }
    return out;
  }

  function loadBase() {
    try { return JSON.parse(get(BASE_KEY)) || {}; } catch { return {}; }
  }

  // ─── Firebase ────────────────────────────────────────────────────────────────

  let fb = null;
  let loaded = null;  // the same, once downloaded (a popup must open without waiting)
  function firebase() {
    if (!fb) {
      fb = Promise.all([
        import(`${SDK}/firebase-app.js`),
        import(`${SDK}/firebase-auth.js`),
      ]).then(([app, auth]) => {
        const a = app.initializeApp(FIREBASE_CONFIG);
        loaded = { auth, authObj: auth.getAuth(a) };
        return loaded;
      });
      fb.catch(() => { fb = null; });
    }
    return fb;
  }

  let user = null;
  let ready = null;  // resolves once Firebase has said who's logged in

  function start() {
    if (ready) return ready;
    ready = firebase().then(f => new Promise(resolve => {
      let first = true;
      f.auth.onAuthStateChanged(f.authObj, u => {
        const was = user;
        user = u;
        if (u) {
          set(UID_KEY, u.uid);
          if (!was && needsPull()) sync({ initial: true });
        } else {
          forget();
        }
        render();
        if (first) { first = false; resolve(); }
      });
    }));
    ready.catch(() => { ready = null; });
    return ready;
  }

  // Whether this page load should check the account: not if this device
  // synced moments ago, holds what the account holds (it knows the rev), and
  // nothing has changed here since.
  function needsPull() {
    const last = Number(get(TIME_KEY)) || 0;
    return Date.now() - last > PULL_EVERY || !get(REV_KEY) || !sameSnapshot(canonical(snapshot()), loadBase());
  }

  function forget() {
    del(UID_KEY);
    del(BASE_KEY);
    del(TIME_KEY);
    del(REV_KEY);
  }

  // ─── Firestore (REST) ────────────────────────────────────────────────────────

  const DOCS = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents`;

  async function api(method, path, body) {
    const token = await user.getIdToken();
    const res = await fetch(DOCS + path, {
      method,
      headers: Object.assign({ Authorization: 'Bearer ' + token }, body ? { 'Content-Type': 'application/json' } : {}),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 404 && method === 'GET') return null;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error((json.error && json.error.message) || 'HTTP ' + res.status);
      err.status = json.error && json.error.status;
      throw err;
    }
    return json;
  }

  // Firestore's typed values ↔ plain ones (strings, integers and maps are all we store).
  function fromValue(v) {
    if (!v) return undefined;
    if ('stringValue' in v) return v.stringValue;
    if ('integerValue' in v) return Number(v.integerValue);
    if ('doubleValue' in v) return v.doubleValue;
    if ('booleanValue' in v) return v.booleanValue;
    if ('mapValue' in v) return fromFields(v.mapValue.fields);
    if ('arrayValue' in v) return (v.arrayValue.values || []).map(fromValue);
    return null;
  }
  function fromFields(fields) {
    const out = {};
    Object.keys(fields || {}).forEach(k => { out[k] = fromValue(fields[k]); });
    return out;
  }
  function toValue(v) {
    if (typeof v === 'number') return { integerValue: String(v) };
    if (typeof v === 'string') return { stringValue: v };
    const fields = {};
    Object.keys(v).forEach(k => { fields[k] = toValue(v[k]); });
    return { mapValue: { fields } };
  }

  // A field path; names that aren't plain identifiers go in backquotes.
  const fieldPath = (...names) => names.map(n => /^[A-Za-z_][A-Za-z_0-9]*$/.test(n) ? n : '`' + n.replace(/[\\`]/g, '\\$&') + '`').join('.');

  // Someone else wrote between our read and write: read again and retry.
  const CONFLICTS = ['FAILED_PRECONDITION', 'ABORTED', 'ALREADY_EXISTS', 'NOT_FOUND'];
  const isConflict = err => !!err && CONFLICTS.includes(err.status);

  // ─── Syncing ─────────────────────────────────────────────────────────────────

  let syncing = null;
  let again = false;
  let status = '';

  function sync(opts) {
    if (!user) return Promise.resolve();
    if (syncing) { again = true; return syncing; }
    clearTimeout(pushTimer);
    pushTimer = null;
    pendingSince = 0;
    status = 'Syncing…';
    render();
    syncing = runRetrying(opts || {}).then(() => {
      status = '';
    }, err => {
      console.warn('Tokidoki sync failed', err);
      status = 'Couldn’t sync just now — your progress is still saved on this device.';
    }).then(() => {
      syncing = null;
      render();
      if (again) { again = false; return sync(); }
    });
    return syncing;
  }

  async function runRetrying(opts) {
    for (let tries = 1; ; tries++) {
      try { return await run(opts); } catch (err) { if (!isConflict(err) || tries >= 3) throw err; }
    }
  }

  async function run({ initial }) {
    const uid = user.uid;
    const doc = '/users/' + encodeURIComponent(uid);
    const changesBefore = changedSinceLoad;
    const rawLocal = snapshot();
    const local = canonical(rawLocal);
    let base = canonical(loadBase());

    // Just the format and revision first: if the account is still at the rev
    // this device last agreed with, it holds the base and needn't be downloaded.
    const meta = await api('GET', `${doc}?mask.fieldPaths=data&mask.fieldPaths=rev`);
    // No account document (new, or deleted): nothing has been agreed with
    // it, so this device's progress goes up rather than being taken for
    // deleted.
    if (!meta) base = {};
    const m = meta ? fromFields(meta.fields) : {};
    let updateTime = meta && meta.updateTime;
    let rev = Number(m.rev) || 0;
    let remote = {};
    let remoteEnc = encodeAccount({});
    let legacy = false;
    if (meta && m.data === FORMAT && rev > 0 && String(rev) === get(REV_KEY)) {
      remote = base;
      remoteEnc = encodeAccount(base);
    } else if (meta) {
      const full = await api('GET', doc);
      if (!full) throw Object.assign(new Error('Account document went away'), { status: 'NOT_FOUND' });
      const f = fromFields(full.fields);
      updateTime = full.updateTime;
      rev = Number(f.rev) || 0;
      if (f.data === FORMAT) {
        remoteEnc = {};
        FIELDS.forEach(k => { remoteEnc[k] = f[k] || {}; });
        remote = decodeAccount(remoteEnc);
      } else {
        // The first format: { data: { [key]: raw } }. Rewritten in full below.
        legacy = true;
        if (f.data && typeof f.data === 'object') remote = canonical(f.data);
        else base = {};  // nothing readable there: as for no document
      }
    }
    if (!user || user.uid !== uid) return;
    const merged = mergeAll(base, local, remote);
    const mergedEnc = encodeAccount(merged);

    // Write only the fields that changed (all of them when converting the
    // old format), and only if the account is still as we read it.
    const changes = legacy ? null : diffAccount(remoteEnc, mergedEnc);
    const empty = !meta && !Object.keys(merged).length;
    if (!empty && (legacy || !meta || changes.length)) {
      rev += 1;
      const fields = { data: toValue(FORMAT), rev: toValue(rev) };
      let paths = ['data', 'rev'];
      if (changes) {
        changes.forEach(([f, n, v]) => {
          paths.push(fieldPath(f, n));
          if (v === undefined) return;
          fields[f] = fields[f] || { mapValue: { fields: {} } };
          fields[f].mapValue.fields[n] = toValue(v);
        });
      } else {
        FIELDS.forEach(f => { fields[f] = toValue(mergedEnc[f]); });
        paths = paths.concat(FIELDS, ['updatedAt']);
      }
      await api('POST', ':commit', {
        writes: [{
          update: { name: `projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/users/${uid}`, fields },
          updateMask: { fieldPaths: paths },
          currentDocument: meta ? { updateTime } : { exists: false },
        }],
      });
    }

    // Only bring the merged data into this page straight after it loads (or
    // after logging in), when nothing has been saved yet — then reload so the
    // page shows it. Later on the page's own copy in memory would overwrite
    // it, so the account keeps the merge and this device picks it up on the
    // next page load: the base stays what this device has, so that works
    // (and the next sync downloads the account again, as it isn't the base).
    const localChanged = !sameSnapshot(local, merged);
    const canApply = initial && changesBefore === changedSinceLoad && sameSnapshot(rawLocal, snapshot());
    if (localChanged && canApply) {
      writingOwn = true;
      try {
        Object.keys(rawLocal).forEach(k => { if (!(k in merged)) del(k); });
        Object.keys(merged).forEach(k => { if (merged[k] !== rawLocal[k]) set(k, merged[k]); });
      } finally { writingOwn = false; }
    }
    const agreed = !localChanged || canApply;
    set(BASE_KEY, JSON.stringify(agreed ? merged : local));
    if (agreed && rev > 0) set(REV_KEY, String(rev));
    else del(REV_KEY);
    set(TIME_KEY, String(Date.now()));

    if (localChanged && canApply) reloadOnce();
  }

  function reloadOnce() {
    let last = 0;
    try { last = Number(sessionStorage.getItem(RELOAD_KEY)) || 0; } catch { /* no session storage */ }
    if (Date.now() - last < 15000) return;
    try { sessionStorage.setItem(RELOAD_KEY, String(Date.now())); } catch { /* no session storage */ }
    location.reload();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && pushTimer) sync();
  });
  window.addEventListener('pagehide', () => { if (pushTimer) sync(); });

  // ─── Account button and dialog ───────────────────────────────────────────────

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>';

  let button = null;
  let overlay = null;
  let mode = 'email';   // or 'sent' (link on its way) / 'confirm' (link opened here, email needed)
  let sentTo = '';
  let message = null;   // { text, error }
  let busy = false;
  let syncButton = '';  // 'spin' while a "Sync now" runs, 'done' for a moment after

  function mount() {
    const right = document.querySelector('#header .header-right');
    if (!right) return;
    button = document.createElement('button');
    button.id = 'btn-account';
    button.className = 'icon-btn';
    button.innerHTML = ICON;
    button.addEventListener('click', open);
    right.insertBefore(button, right.firstChild);

    overlay = document.createElement('div');
    overlay.id = 'account-overlay';
    overlay.className = 'settings-overlay hidden';
    overlay.innerHTML = `
      <div class="settings-overlay-backdrop"></div>
      <div class="settings-overlay-content account-dialog" role="dialog" aria-modal="true" aria-labelledby="account-title">
        <div class="settings-overlay-header">
          <h2 id="account-title" class="settings-overlay-title">Save your progress</h2>
          <button class="settings-overlay-close" aria-label="Close">✕</button>
        </div>
        <div class="account-body"></div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('.settings-overlay-backdrop').addEventListener('click', close);
    overlay.querySelector('.settings-overlay-close').addEventListener('click', close);
    overlay.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    overlay.addEventListener('submit', onSubmit);
    overlay.addEventListener('click', onClick);
    render();
  }

  function open(keepMessage) {
    if (keepMessage !== true) message = null;
    overlay.classList.remove('hidden');
    render();
    if (!user) {
      start().catch(() => {
        message = { text: 'Couldn’t reach the login service. Check your connection and try again.', error: true };
        render();
      });
    }
    const first = overlay.querySelector('input, .account-actions button');
    if (first) first.focus();
  }

  function close() {
    overlay.classList.add('hidden');
    if (button) button.focus();
  }

  function lastSynced() {
    const t = Number(get(TIME_KEY));
    if (!t) return 'Not synced yet';
    const d = new Date(t);
    const today = new Date().toDateString() === d.toDateString();
    return 'Last synced ' + (today ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleString());
  }

  function render() {
    if (!button) return;
    const loggedIn = !!user || (!ready && !!get(UID_KEY));
    button.classList.toggle('account-in', loggedIn);
    button.setAttribute('aria-label', loggedIn ? 'Account — progress saved' : 'Log in to save your progress');
    button.title = loggedIn ? 'Account' : 'Log in to save your progress';
    if (!overlay || overlay.classList.contains('hidden')) return;

    const body = overlay.querySelector('.account-body');
    const stats = user ? statsHtml() : '';
    // Rebuilding the form would wipe what's being typed, so only when it changes.
    const view = JSON.stringify([user && user.email, status, user && lastSynced(), !!syncing, mode, sentTo, message, busy, stats, syncButton]);
    if (body.dataset.view === view) return;
    body.dataset.view = view;
    const msg = message ? `<p class="account-msg${message.error ? ' account-error' : ''}" role="status">${esc(message.text)}</p>` : '';
    const dis = busy ? ' disabled' : '';
    const title = overlay.querySelector('#account-title');

    if (user) {
      const moreOpen = !!body.querySelector('.stat-more[open]');
      const refocus = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.accountAct;
      const syncLabel = syncButton === 'spin' ? `${SPINNER}<span>Syncing…</span>`
        : syncButton === 'done' ? `${CHECK}<span>Synced</span>` : 'Sync now';
      title.textContent = 'Your account';
      body.innerHTML = `
        <p class="account-text">Logged in as <strong>${esc(user.email)}</strong>. Your progress is saved to your account and shared with every device you log in on.</p>
        <p class="account-sub">${esc(status || lastSynced())}</p>
        ${msg}
        ${stats}
        <div class="account-actions">
          <button type="button" class="btn-secondary account-sync${syncButton ? ' account-sync-' + syncButton : ''}" data-account-act="sync" aria-live="polite"${dis || (syncing || syncButton ? ' disabled' : '')}>${syncLabel}</button>
          <button type="button" class="btn-secondary" data-account-act="logout"${dis}>Log out</button>
        </div>
        <p class="account-sub">Logging out keeps your progress on this device.</p>`;
      if (moreOpen) body.querySelector('.stat-more').open = true;
      if (refocus) { const b = body.querySelector(`[data-account-act="${refocus}"]`); if (b) b.focus(); }
      return;
    }

    if (mode === 'sent') {
      title.textContent = 'Check your email';
      body.innerHTML = `
        <p class="account-text">We sent a login link to <strong>${esc(sentTo)}</strong>. Open it on this device to log in. No password needed.</p>
        <p class="account-sub">It can take a minute to arrive. Not there? Check your spam folder.</p>
        ${msg}
        <div class="account-actions">
          <button type="button" class="btn-secondary" data-account-act="resend"${dis}>Send it again</button>
          <button type="button" class="btn-secondary" data-account-act="change"${dis}>Use another email</button>
        </div>`;
      return;
    }

    const confirming = mode === 'confirm';
    title.textContent = confirming ? 'Finish logging in' : 'Save your progress';
    const intro = confirming
      ? 'This login link was opened on a different device or browser than the one it was sent from. Enter your email again to finish logging in.'
      : 'Optional: log in to keep your progress safe and pick it up on other devices. No password needed. Progress you’ve already made on this device comes along.';
    const google = confirming ? '' : `
      <button type="button" class="account-google" data-account-act="google"${dis}>${GOOGLE_ICON}<span>Continue with Google</span></button>
      <div class="account-or"><span>or get a login link by email</span></div>`;
    const email = (overlay.querySelector('input[name=email]') || {}).value || sentTo || '';
    body.innerHTML = `
      <p class="account-text">${intro}</p>
      ${google}
      <form class="account-form" novalidate>
        <label class="account-field">
          <span>Email</span>
          <input type="email" name="email" autocomplete="email" required value="${esc(email)}">
        </label>
        ${msg}
        <button type="submit" class="btn-primary account-submit"${dis}>${confirming ? 'Log in' : 'Email me a login link'}</button>
      </form>`;
  }

  // ─── Progress summary ────────────────────────────────────────────────────────
  //
  // Logged in, the dialog also shows what's been studied so far, Anki style,
  // worked out by progress-stats.js from what's saved here. The charts are
  // small inline SVGs in the accent colour; hovering a bar or day names it.

  const num = v => Number(v).toLocaleString();
  const plural = (v, one, many) => `${num(v)} ${v === 1 ? one : (many || one + 's')}`;
  const pct = (part, whole) => whole ? Math.round(100 * part / whole) + '%' : '—';
  function duration(secs) {
    const m = Math.round(secs / 60);
    return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`;
  }
  const dateLabel = day => new Date(day + 'T12:00:00').toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  // Bars from a baseline, with a rounded top; each column carries a hover title.
  function barsSvg(values, titles, height) {
    const W = 440, H = height || 72, gap = 2;
    const max = Math.max(1, ...values);
    const w = (W - gap * (values.length - 1)) / values.length;
    const cols = values.map((v, i) => {
      const x = +(i * (w + gap)).toFixed(2);
      const h = v ? Math.max(2, Math.round((v / max) * (H - 4))) : 0;
      const r = Math.min(3, w / 2, h);
      const y = H - h;
      const bar = h ? `<path class="stat-bar" d="M${x},${H}V${y + r}Q${x},${y} ${x + r},${y}H${(x + w - r).toFixed(2)}Q${(x + w).toFixed(2)},${y} ${(x + w).toFixed(2)},${y + r}V${H}Z"/>` : '';
      return `<g><title>${esc(titles[i])}</title><rect class="stat-hit" x="${x}" y="0" width="${w.toFixed(2)}" height="${H}"/>${bar}</g>`;
    }).join('');
    return `<svg class="stat-chart" viewBox="0 0 ${W} ${H + 1}" role="img" aria-hidden="true"><line class="stat-axis" x1="0" x2="${W}" y1="${H + 0.5}" y2="${H + 0.5}"/>${cols}</svg>`;
  }

  // Labels under a chart, each at a fraction of its width (0 = left edge).
  const axis = ticks => `<div class="stat-axis-labels">${ticks.map(([at, l]) => {
    const pos = at <= 0 ? 'left:0' : at >= 1 ? 'right:0' : `left:${(at * 100).toFixed(2)}%;transform:translateX(-50%)`;
    return `<span style="${pos}">${esc(l)}</span>`;
  }).join('')}</div>`;
  const barCentre = (i, count) => (i + 0.5) / count;

  // A GitHub-style calendar: a column per week, Monday at the top.
  function calendarSvg(days) {
    const cell = 13, gap = 3, weeks = days.length / 7;
    const max = Math.max(1, ...days.map(d => d.reviews || 0));
    const level = v => (!v ? 0 : Math.min(4, Math.ceil((v / max) * 4)));
    const rects = days.map((d, i) => {
      if (d.reviews == null) return '';
      const x = Math.floor(i / 7) * (cell + gap), y = (i % 7) * (cell + gap);
      return `<rect class="stat-day stat-l${level(d.reviews)}" x="${x}" y="${y}" width="${cell}" height="${cell}" rx="3"><title>${esc(dateLabel(d.day))}: ${plural(d.reviews, 'review')}</title></rect>`;
    }).join('');
    return `<svg class="stat-chart stat-calendar" viewBox="0 0 ${weeks * (cell + gap) - gap} ${7 * (cell + gap) - gap}" role="img" aria-hidden="true">${rects}</svg>`;
  }

  function statsHtml() {
    if (!window.ProgressStats) return '';
    const p = window.ProgressStats.progressStats(snapshot());
    const tile = (v, label) => `<div class="account-tile"><span class="account-tile-num">${num(v)}</span><span class="account-tile-label">${label}</span></div>`;
    const tiles = `
      <div class="account-tiles">
        ${tile(p.streak, 'day streak')}
        ${tile(p.reviewsToday, 'reviewed today')}
        ${tile(p.total.studied, 'cards studied')}
        ${tile(p.total.learned, 'cards learned')}
      </div>`;
    const lg = p.log;
    const summary = lg.reviews
      ? `<p class="account-sub">${plural(lg.reviews, 'review')} on ${plural(lg.days, 'day')} since ${esc(dateLabel(lg.since))} · ${duration(lg.seconds)} · ${pct(lg.passed, lg.reviews)} right${p.secondsToday ? ` · ${duration(p.secondsToday)} today` : ''}</p>`
      : '';

    const calendar = `
      <div class="stat-block">
        <h4 class="stat-title">Reviews, last 6 months</h4>
        ${calendarSvg(p.calendar)}
        <div class="stat-legend"><span>Less</span>${[0, 1, 2, 3, 4].map(l => `<i class="stat-l${l}"></i>`).join('')}<span>More</span></div>
      </div>`;

    const week = p.forecast.slice(0, 7).reduce((t, d) => t + d.cards, 0);
    const forecast = `
      <div class="stat-block">
        <h4 class="stat-title">Coming up</h4>
        <p class="account-sub">${plural(p.overdue, 'card')} due now · ${plural(week, 'more card')} in the next 7 days</p>
        ${barsSvg(p.forecast.map(d => d.cards), p.forecast.map((d, i) => `${i ? dateLabel(d.day) : 'Later today'}: ${plural(d.cards, 'card')}`))}
        ${axis([[0, 'Today'], ...[7, 14, 21, 28].map(d => [barCentre(d, p.forecast.length), `+${d / 7} wk`])])}
      </div>`;

    const rows = p.kinds.map(k => `
        <tr><th scope="row">${esc(k.label)}</th><td>${num(k.studied)}</td><td>${num(k.learned)}</td><td>${num(k.due)}</td></tr>`).join('');
    const table = rows ? `
      <table class="account-stats-table">
        <thead><tr><td></td><th scope="col">Studied</th><th scope="col">Learned</th><th scope="col">Due</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="account-sub">Learned: next review three weeks or more away. Due: ready to review now.</p>`
      : '<p class="account-sub">Nothing reviewed yet — study some flashcards and your progress shows up here.</p>';

    const AGE = { learning: 'Learning (new or missed)', young: 'Young (under 3 weeks)', mature: 'Mature (3 weeks +)' };
    const answers = p.answers.some(a => a.reviews) ? `
        <div class="stat-block">
          <h4 class="stat-title">Answers by card age</h4>
          <table class="account-stats-table">
            <thead><tr><td></td><th scope="col">Reviews</th><th scope="col">Right</th></tr></thead>
            <tbody>${p.answers.map(a => `<tr><th scope="row">${AGE[a.age]}</th><td>${num(a.reviews)}</td><td>${pct(a.passed, a.reviews)}</td></tr>`).join('')}</tbody>
          </table>
        </div>` : '';
    const cards = p.total.studied ? `
        <div class="stat-block">
          <h4 class="stat-title">Card intervals</h4>
          <p class="account-sub">${plural(p.ages.learning, 'card')} learning · ${num(p.ages.young)} young · ${num(p.ages.mature)} mature · average ease ${Math.round(p.averageEase * 100)}%</p>
          ${barsSvg(p.intervals.map(b => b.cards), p.intervals.map(b => `${b.label}: ${plural(b.cards, 'card')}`), 56)}
          ${axis(p.intervals.map((b, i) => [barCentre(i, p.intervals.length), b.short]))}
        </div>` : '';
    const hours = p.hours.some(h => h.reviews) ? `
        <div class="stat-block">
          <h4 class="stat-title">Time of day</h4>
          ${barsSvg(p.hours.map(h => h.reviews), p.hours.map(h => `${h.hour}:00–${h.hour + 1}:00: ${plural(h.reviews, 'review')}, ${pct(h.passed, h.reviews)} right`), 56)}
          ${axis([0, 6, 12, 18, 24].map(h => [h / 24, h + ':00']))}
        </div>` : '';
    const more = answers || cards || hours ? `
      <details class="stat-more">
        <summary>More statistics</summary>
        ${answers}${cards}${hours}
      </details>` : '';

    const { decks, games } = p;
    const extra = [
      decks.words && `${plural(decks.words, 'word')} in your flashcards`,
      decks.kanji && `${plural(decks.kanji, 'kanji', 'kanji')} in your kanji flashcards`,
      decks.grammar && `${plural(decks.grammar, 'grammar point')} saved`,
      games.listening && `${plural(games.listening, 'listening test')} taken`,
      games.wordOrder && `${plural(games.wordOrder, 'word order set')} done`,
      games.storyFill && `${plural(games.storyFill, 'story fill passage')} done`,
      games.mystery && `${plural(games.mystery, 'mystery chapter')} solved`,
    ].filter(Boolean);
    const list = extra.length ? `<ul class="account-stats-extra">${extra.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : '';
    return `
      <section class="account-stats" aria-labelledby="account-stats-title">
        <h3 id="account-stats-title" class="account-stats-title">Your progress</h3>
        ${tiles}${summary}${calendar}${forecast}${table}${more}${list}
      </section>`;
  }

  const SPINNER = '<span class="account-spinner" aria-hidden="true"></span>';
  const CHECK = '<svg class="account-check" viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="10" cy="10" r="8.5"/><path d="M6 10.4l2.7 2.7L14.2 7.4"/></svg>';

  const GOOGLE_ICON = '<svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';

  const ERRORS = {
    'auth/popup-blocked': 'Your browser blocked the Google login window. Allow pop-ups for this site and try again.',
    'auth/account-exists-with-different-credential': 'There’s already an account with this email. Log in with an email link instead.',
    'auth/unauthorized-domain': 'Logging in isn’t set up for this website yet.',
    'auth/invalid-email': 'That doesn’t look like an email address.',
    'auth/missing-email': 'Enter your email address.',
    'auth/invalid-action-code': 'This login link has expired or was already used. Send yourself a new one.',
    'auth/expired-action-code': 'This login link has expired. Send yourself a new one.',
    'auth/quota-exceeded': 'Too many login emails have been sent today. Please try again tomorrow.',
    'auth/too-many-requests': 'Too many tries. Wait a minute and try again.',
    'auth/operation-not-allowed': 'This way of logging in isn’t switched on yet.',
    'auth/unauthorized-continue-uri': 'Logging in isn’t set up for this website yet.',
    'auth/network-request-failed': 'Couldn’t reach the login service. Check your connection.',
  };
  const errorText = err => ERRORS[err && err.code] || 'Something went wrong. Please try again.';

  // ─── Email link login ────────────────────────────────────────────────────────
  //
  // We email a link back to the page they're on. Opening it lands here with
  // ?mode=signIn&oobCode=… on the URL, which finishLink() turns into a login.
  // The address is remembered (EMAIL_KEY) so the same browser doesn't have
  // to ask for it again.

  const EMAIL_KEY = 'tokidoki_sync_email';
  const LINK_PARAMS = ['apiKey', 'oobCode', 'mode', 'continueUrl', 'lang', 'tenantId'];
  let pendingLink = null;

  function linkInUrl() {
    const p = new URLSearchParams(location.search);
    return p.get('mode') === 'signIn' && p.has('oobCode');
  }

  // Take the login code off the address bar, so it isn't bookmarked or shared.
  function cleanUrl() {
    const url = new URL(location.href);
    LINK_PARAMS.forEach(k => url.searchParams.delete(k));
    history.replaceState(history.state, '', url.pathname + url.search + url.hash);
  }

  async function sendLink(email) {
    await start();
    const { auth, authObj } = await firebase();
    await auth.sendSignInLinkToEmail(authObj, email, {
      url: location.origin + location.pathname,
      handleCodeInApp: true,
    });
    set(EMAIL_KEY, email);
    sentTo = email;
    mode = 'sent';
  }

  async function finishLink(email) {
    busy = true;
    message = null;
    render();
    try {
      await start();
      const { auth, authObj } = await firebase();
      if (!auth.isSignInWithEmailLink(authObj, pendingLink)) throw { code: 'auth/invalid-action-code' };
      await auth.signInWithEmailLink(authObj, email, pendingLink);
      pendingLink = null;
      del(EMAIL_KEY);
      mode = 'email';
      message = { text: 'You’re logged in. Your progress is now saved to your account.' };
    } catch (err) {
      if (err && err.code === 'auth/invalid-email' && mode === 'confirm') {
        message = { text: 'That isn’t the email this link was sent to.', error: true };
      } else {
        pendingLink = null;
        mode = 'email';
        message = { text: errorText(err), error: true };
      }
    }
    busy = false;
    render();
  }

  function handleLink() {
    pendingLink = location.href;
    cleanUrl();
    const email = get(EMAIL_KEY);
    mode = email ? 'email' : 'confirm';
    open(true);
    if (email) finishLink(email);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (busy) return;
    const email = e.target.email.value.trim();
    if (mode === 'confirm' && pendingLink) return finishLink(email);
    busy = true;
    message = null;
    render();
    try {
      await sendLink(email);
    } catch (err) {
      message = { text: errorText(err), error: true };
    }
    busy = false;
    render();
    const input = overlay.querySelector('input[name=email]');
    if (input && !input.value) input.value = email;
  }

  async function onClick(e) {
    const t = e.target.closest('[data-account-act]');
    if (!t || !overlay.contains(t)) return;
    const act = t.dataset.accountAct;
    if (act === 'google') {
      // Open the popup straight from the click, or pop-up blockers stop it.
      if (!loaded) {
        message = { text: 'Still loading, try again in a moment.', error: true };
        render();
        start().catch(() => {});
        return;
      }
      const popup = loaded.auth.signInWithPopup(loaded.authObj, new loaded.auth.GoogleAuthProvider());
      busy = true;
      message = null;
      render();
      try {
        await popup;
        mode = 'email';
        message = { text: 'You’re logged in. Your progress is now saved to your account.' };
      } catch (err) {
        const closed = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled'];
        if (!closed.includes(err && err.code)) message = { text: errorText(err), error: true };
      }
      busy = false;
      render();
    } else if (act === 'change') {
      mode = 'email';
      message = null;
      render();
      overlay.querySelector('input[name=email]').focus();
    } else if (act === 'resend') {
      busy = true;
      message = null;
      render();
      try {
        await sendLink(sentTo);
        message = { text: 'Sent a new link. Use the newest email.' };
      } catch (err) {
        message = { text: errorText(err), error: true };
      }
      busy = false;
      render();
    } else if (act === 'sync') {
      // A spinner while it runs (at least a moment, so it doesn't just
      // flicker), then a check mark that draws itself.
      syncButton = 'spin';
      message = null;
      render();
      await Promise.all([sync(), new Promise(r => setTimeout(r, 600))]);
      const failed = !!status;
      message = failed ? { text: status, error: true } : null;
      syncButton = failed ? '' : 'done';
      render();
      if (!failed) setTimeout(() => { if (syncButton === 'done') { syncButton = ''; render(); } }, 1800);
    } else if (act === 'logout') {
      busy = true;
      render();
      try {
        if (pushTimer) await sync();
        const { auth, authObj } = await firebase();
        await auth.signOut(authObj);
        mode = 'email';
        message = { text: 'Logged out. Your progress is still on this device.' };
      } catch {
        message = { text: 'Couldn’t log out. Please try again.', error: true };
      }
      busy = false;
      render();
    }
  }

  function init() {
    mount();
    if (overlay && linkInUrl()) handleLink();
    else if (get(UID_KEY)) start().catch(() => { render(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
