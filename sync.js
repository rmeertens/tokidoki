// Optional login, to keep progress in a Firebase account and share it
// between devices. Without logging in nothing changes: progress stays in
// localStorage as always.
//
// Adds an account button to the header. Logging in is by email link (no
// passwords): enter your email, click the link we send. Logged in, everything under the
// `tokidoki_` / `tokidoki-` keys is copied to Firestore, one document per
// user (users/{uid}, field `data`: { [key]: rawString }), and merged with
// what's there by sync-merge.js. A sync runs when a page loads, a couple of
// seconds after anything is saved, and when the tab is hidden.
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
  const PUSH_DELAY = 2500;

  if (!FIREBASE_CONFIG || !window.SyncMerge || !window.localStorage) return;
  const { isTracked, mergeAll, sameSnapshot } = window.SyncMerge;

  const store = window.localStorage;
  const get = k => { try { return store.getItem(k); } catch { return null; } };
  const set = (k, v) => { try { store.setItem(k, v); } catch { /* storage full or blocked */ } };
  const del = k => { try { store.removeItem(k); } catch { /* storage unavailable */ } };

  // ─── Watching saves ──────────────────────────────────────────────────────────

  let writingOwn = false;   // our own writes don't count as changes
  let changedSinceLoad = false;
  let pushTimer = null;

  function noteChange(key) {
    if (writingOwn || !isTracked(String(key))) return;
    changedSinceLoad = true;
    if (!user) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => sync(), PUSH_DELAY);
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
  function firebase() {
    if (!fb) {
      fb = Promise.all([
        import(`${SDK}/firebase-app.js`),
        import(`${SDK}/firebase-auth.js`),
        import(`${SDK}/firebase-firestore-lite.js`),
      ]).then(([app, auth, fs]) => {
        const a = app.initializeApp(FIREBASE_CONFIG);
        return { auth, fs, authObj: auth.getAuth(a), db: fs.getFirestore(a) };
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
          if (!was) sync({ initial: true });
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

  function forget() {
    del(UID_KEY);
    del(BASE_KEY);
    del(TIME_KEY);
  }

  // ─── Syncing ─────────────────────────────────────────────────────────────────

  let syncing = null;
  let again = false;
  let status = '';

  function sync(opts) {
    if (!user) return Promise.resolve();
    if (syncing) { again = true; return syncing; }
    clearTimeout(pushTimer);
    status = 'Syncing…';
    render();
    syncing = run(opts || {}).then(() => {
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

  async function run({ initial }) {
    const { fs, db } = await firebase();
    const uid = user.uid;
    const ref = fs.doc(db, 'users', uid);
    const changesBefore = changedSinceLoad;
    const local = snapshot();
    const snap = await fs.getDoc(ref);
    const remote = (snap.exists() && snap.data().data) || {};
    if (!user || user.uid !== uid) return;
    const merged = mergeAll(loadBase(), local, remote);

    if (!sameSnapshot(remote, merged)) {
      await fs.setDoc(ref, { data: merged, updatedAt: Date.now() });
    }

    // Only bring the merged data into this page straight after it loads (or
    // after logging in), when nothing has been saved yet — then reload so the
    // page shows it. Later on the page's own copy in memory would overwrite
    // it, so the account keeps the merge and this device picks it up on the
    // next page load: the base stays what this device has, so that works.
    const localChanged = !sameSnapshot(local, merged);
    const canApply = initial && changesBefore === changedSinceLoad && sameSnapshot(local, snapshot());
    if (localChanged && canApply) {
      writingOwn = true;
      try {
        Object.keys(local).forEach(k => { if (!(k in merged)) del(k); });
        Object.keys(merged).forEach(k => { if (merged[k] !== local[k]) set(k, merged[k]); });
      } finally { writingOwn = false; }
      set(BASE_KEY, JSON.stringify(merged));
    } else {
      set(BASE_KEY, JSON.stringify(localChanged ? local : merged));
    }
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

  // ─── Account button and dialog ───────────────────────────────────────────────

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>';

  let button = null;
  let overlay = null;
  let mode = 'email';   // or 'sent' (link on its way) / 'confirm' (link opened here, email needed)
  let sentTo = '';
  let message = null;   // { text, error }
  let busy = false;

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
    // Rebuilding the form would wipe what's being typed, so only when it changes.
    const view = JSON.stringify([user && user.email, status, user && lastSynced(), !!syncing, mode, sentTo, message, busy]);
    if (body.dataset.view === view) return;
    body.dataset.view = view;
    const msg = message ? `<p class="account-msg${message.error ? ' account-error' : ''}" role="status">${esc(message.text)}</p>` : '';
    const dis = busy ? ' disabled' : '';
    const title = overlay.querySelector('#account-title');

    if (user) {
      title.textContent = 'Your account';
      body.innerHTML = `
        <p class="account-text">Logged in as <strong>${esc(user.email)}</strong>. Your progress is saved to your account and shared with every device you log in on.</p>
        <p class="account-sub">${esc(status || lastSynced())}</p>
        ${msg}
        <div class="account-actions">
          <button type="button" class="btn-secondary" data-account-act="sync"${dis || (syncing ? ' disabled' : '')}>Sync now</button>
          <button type="button" class="btn-secondary" data-account-act="logout"${dis}>Log out</button>
        </div>
        <p class="account-sub">Logging out keeps your progress on this device.</p>`;
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
      : 'Optional: log in to keep your progress safe and pick it up on other devices. Enter your email and we’ll send you a link to log in with. No password needed. Progress you’ve already made on this device comes along.';
    const email = (overlay.querySelector('input[name=email]') || {}).value || sentTo || '';
    body.innerHTML = `
      <p class="account-text">${intro}</p>
      <form class="account-form" novalidate>
        <label class="account-field">
          <span>Email</span>
          <input type="email" name="email" autocomplete="email" required value="${esc(email)}">
        </label>
        ${msg}
        <button type="submit" class="btn-primary account-submit"${dis}>${confirming ? 'Log in' : 'Email me a login link'}</button>
      </form>`;
  }

  const ERRORS = {
    'auth/invalid-email': 'That doesn’t look like an email address.',
    'auth/missing-email': 'Enter your email address.',
    'auth/invalid-action-code': 'This login link has expired or was already used. Send yourself a new one.',
    'auth/expired-action-code': 'This login link has expired. Send yourself a new one.',
    'auth/quota-exceeded': 'Too many login emails have been sent today. Please try again tomorrow.',
    'auth/too-many-requests': 'Too many tries. Wait a minute and try again.',
    'auth/operation-not-allowed': 'Logging in by email link isn’t switched on yet.',
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
    if (act === 'change') {
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
      await sync();
      message = status ? { text: status, error: true } : null;
      render();
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
