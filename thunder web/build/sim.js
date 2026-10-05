/* ---- BIOBUZZ simulator page (opened from Resources) ----
   The simulator (gzip+base64 in #biobuzzSrc) is inflated the first time #simulator is opened and runs in an
   iframe from a Blob URL, so its CSS/JS never touch the team site. The page covers the whole viewport and
   starts with a small launcher: mode + language only, everything else is the game's default settings.
   Start goes full screen and drops straight into the chosen mode. Leaving pauses the match and its audio. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const page = $('simulator'), frame = $('simFrame'), ifr = $('simIframe'), launch = $('simLaunch'), float = $('simFloat');
  if (!page || !ifr) return;
  const SIM_KEY = 'biobuzz-sim-v2';
  let blobUrl = null, building = null, booted = false, mode = 'match', pending = null, readyT = null, isOpen = false;

  const simWin = () => { try { return ifr.contentWindow; } catch (e) { return null; } };
  const simApp = () => { const w = simWin(); try { return w && w.BBAPP && w.BBUI ? w : null; } catch (e) { return null; } };
  const ready = () => { const w = simApp(); try { return !!(w && w.BBAPP.mode && w.BBAPP.mode !== 'boot'); } catch (e) { return false; } };
  function status(msg, err) { const el = $('simStatus'); el.textContent = msg; el.classList.toggle('err', !!err); }

  // ---------------------------------------------------------------- language (one switch for site + game)
  const siteLang = () => (window.TCI18N && window.TCI18N.lang) || 'en';
  function seedSimLang(l) {   // the game reads this before it boots
    try { const o = JSON.parse(localStorage.getItem(SIM_KEY) || 'null') || {}; if (o.lang !== l) { o.lang = l; localStorage.setItem(SIM_KEY, JSON.stringify(o)); } } catch (e) {}
  }
  function pushSimLang(l) {
    const w = simWin(); if (!w) return;
    try {
      if (w.BBAPP && w.BBAPP.set && w.BBAPP.set.lang !== l) { w.BBAPP.set.lang = l; w.BBAPP.save && w.BBAPP.save(); }
      if (w.BBI18N && w.BBI18N.lang !== l) w.BBI18N.set(l);
    } catch (e) {}
  }
  function hookSimLang() {   // a change made in the game's own Settings flows back to the site
    const w = simWin();
    try {
      if (w && w.BBI18N && !w.BBI18N.__tcHooked) {
        const inner = w.BBI18N.set.bind(w.BBI18N);
        w.BBI18N.set = function (l) { inner(l); if (window.TCI18N && window.TCI18N.lang !== l) window.TCI18N.set(l, 'sim'); };
        w.BBI18N.__tcHooked = true;
      }
    } catch (e) {}
    pushSimLang(siteLang());
  }
  function syncLangButtons() {
    document.querySelectorAll('#simLang [data-lang]').forEach(b => b.setAttribute('aria-checked', b.dataset.lang === siteLang() ? 'true' : 'false'));
  }
  window.addEventListener('tc-lang', e => { seedSimLang(e.detail.lang); if (e.detail.from !== 'sim') pushSimLang(e.detail.lang); syncLangButtons(); });
  $('simLang').addEventListener('click', e => { const b = e.target.closest('[data-lang]'); if (b && window.TCI18N) window.TCI18N.set(b.dataset.lang); syncLangButtons(); });

  // ---------------------------------------------------------------- mode
  function setMode(m) { mode = m; document.querySelectorAll('#simMode [data-mode]').forEach(b => b.setAttribute('aria-checked', b.dataset.mode === m ? 'true' : 'false')); }
  $('simMode').addEventListener('click', e => { const b = e.target.closest('[data-mode]'); if (b) setMode(b.dataset.mode); });

  // ---------------------------------------------------------------- loading
  function getBlobUrl() {
    if (blobUrl) return Promise.resolve(blobUrl);
    if (building) return building;
    building = (async () => {
      if (typeof DecompressionStream === 'undefined') throw new Error('This browser is too old to run the simulator. Please update Chrome, Edge, Firefox or Safari.');
      const b64 = $('biobuzzSrc').textContent.replace(/\s+/g, '');
      const res = await fetch('data:application/octet-stream;base64,' + b64);
      const html = await new Response(res.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
      blobUrl = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
      return blobUrl;
    })();
    building.catch(() => { building = null; });
    return building;
  }
  function watchReady() {
    clearInterval(readyT);
    const t0 = Date.now();
    readyT = setInterval(() => {
      if (ready()) {
        clearInterval(readyT); readyT = null;
        status('Ready'); $('simStart').removeAttribute('aria-busy');
        if (pending) run();
      } else if (Date.now() - t0 > 30000) {
        clearInterval(readyT); readyT = null;
        status('The simulator is taking long to start. Check your internet connection (three.js is loaded from a CDN).', true);
        if (pending) { pending = null; showLaunch(false); }
      }
    }, 250);
  }
  async function boot() {
    if (booted) return;
    booted = true;
    seedSimLang(siteLang());
    status('Loading simulator…');
    try {
      const url = await getBlobUrl();
      ifr.src = url;
      watchReady();
    } catch (e) {
      booted = false;
      status(String(e && e.message || e), true);
    }
  }
  ifr.addEventListener('load', () => { if (blobUrl && ifr.src === blobUrl) hookSimLang(); });

  // ---------------------------------------------------------------- launcher <-> game
  function showLaunch(show) {
    launch.hidden = !show; float.hidden = show;
    if (show) setTimeout(() => { const b = $('simStart'); try { b.focus({ preventScroll: true }); } catch (e) {} }, 30);
  }
  function enterFullscreen() {
    if (document.fullscreenElement || document.webkitFullscreenElement) return;
    const req = frame.requestFullscreen || frame.webkitRequestFullscreen;
    if (!req) return;                                   // iPhone Safari: the page already fills the screen
    try { const p = req.call(frame, { navigationUI: 'hide' }); if (p && p.catch) p.catch(() => {}); } catch (e) {}
  }
  function exitFullscreen() {
    const fe = document.fullscreenElement || document.webkitFullscreenElement;
    if (!fe) return;
    try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) {}
  }
  function run() {
    const w = simApp(); if (!w || !pending) return;
    const m = pending; pending = null;
    try {
      const S = w.BBAPP, UI = w.BBUI;
      if (w.BBAU && w.BBAU.ctx && w.BBAU.ctx.state === 'suspended') w.BBAU.ctx.resume();
      if (S.mode !== 'menu' && S.toMenu) S.toMenu();
      if (m === 'match' || m === 'practice') S.start(m); else UI.show(m);
    } catch (e) { status(String(e && e.message || e), true); showLaunch(true); return; }
    setTimeout(() => { try { ifr.focus(); simWin().focus(); } catch (e) {} }, 60);
  }
  function start() {
    enterFullscreen();
    pending = mode;
    showLaunch(false);
    if (ready()) run();
    else { $('simStart').setAttribute('aria-busy', 'true'); status('Starting…'); boot(); }
  }
  $('simStart').addEventListener('click', start);
  launch.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.target.closest('a')) { e.preventDefault(); start(); } });
  // clicking the dimmed backdrop (opened from ☰ over a game) goes back to the game
  launch.addEventListener('click', e => { if (e.target === launch && simApp() && simApp().BBAPP.mode !== 'menu') showLaunch(false); });
  $('simMenuBtn').addEventListener('click', () => {
    const w = simApp();
    try { const S = w && w.BBAPP; if (S && S.mode === 'play' && !S.paused && S.sim && S.sim.phase !== 'done') S.togglePause(); } catch (e) {}
    showLaunch(true);
  });
  frame.addEventListener('pointerdown', e => { if (!launch.contains(e.target) && !float.contains(e.target)) { try { ifr.focus(); } catch (er) {} } });

  // ---------------------------------------------------------------- entering / leaving the page
  function onLeave() {
    document.documentElement.classList.remove('sim-open');
    exitFullscreen();
    pending = null;
    const w = simWin(); if (!w) return;
    try {
      const S = w.BBAPP;
      if (S && S.mode === 'play' && !S.paused && S.sim && S.sim.phase !== 'done' && S.togglePause) S.togglePause();
      if (w.BBAU && w.BBAU.ctx && w.BBAU.ctx.state === 'running') w.BBAU.ctx.suspend();
    } catch (e) {}
  }
  function onEnter() {
    document.documentElement.classList.add('sim-open');
    syncLangButtons(); setMode(mode);
    showLaunch(true);
    if (ready()) status('Ready');
    boot();
  }
  window.__simRoute = function () {
    const open = location.hash.replace(/^#/, '') === 'simulator';
    if (open && !isOpen) onEnter();
    else if (!open && isOpen) onLeave();
    isOpen = open;
  };
  window.__simRoute();          // deep link straight to #simulator
})();
