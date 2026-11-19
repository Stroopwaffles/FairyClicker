// UI, input and the game loop.
import {
  RESOURCES, LOCATIONS, HELPERS, UPGRADES, FEATURES, LOCATION_BY_ID,
} from './data.js';
import * as G from './game.js';
import { SCENES, SPRITE_COLORS } from './scenes.js';
import * as A from './audio.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// ---------- formatting ----------

const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
export function fmt(n, decimalsUnder = 0) {
  if (!isFinite(n)) return '∞';
  if (n < 10000) {
    if (decimalsUnder && n < decimalsUnder && n % 1 !== 0) return n.toFixed(1);
    return Math.floor(n).toLocaleString('en-US');
  }
  const tier = Math.min(Math.floor(Math.log10(n) / 3), SUFFIXES.length - 1);
  const v = n / Math.pow(1000, tier);
  return (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)) + SUFFIXES[tier];
}
const fmtRate = (n) => fmt(n, 100);

function fmtDuration(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  if (h >= 1) return `${h}h ${m}m`;
  if (m >= 1) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

const ICONS = {
  dewdrops: `<svg class="ricon" viewBox="0 0 32 32"><defs><radialGradient id="ri-d" cx=".35" cy=".55" r=".7"><stop offset="0" stop-color="#e8f8ff"/><stop offset=".5" stop-color="#8fd8ff"/><stop offset="1" stop-color="#3b7fd1"/></radialGradient></defs><path d="M16 3 C16 3 6 15 6 21 a10 10 0 0 0 20 0 C26 15 16 3 16 3z" fill="url(#ri-d)"/><ellipse cx="12" cy="20" rx="2.2" ry="3.5" fill="#fff" opacity=".7"/></svg>`,
  glowspores: `<svg class="ricon" viewBox="0 0 32 32"><defs><radialGradient id="ri-s"><stop offset="0" stop-color="#f4ffe0"/><stop offset=".45" stop-color="#b8ff8a"/><stop offset="1" stop-color="#b8ff8a" stop-opacity="0"/></radialGradient></defs><circle cx="16" cy="16" r="15" fill="url(#ri-s)"/><circle cx="16" cy="16" r="6" fill="#e9ffd2"/><circle cx="8" cy="9" r="2" fill="#d8ffb5"/><circle cx="25" cy="23" r="1.6" fill="#d8ffb5"/></svg>`,
};
const icon = (r) => ICONS[r] || '';

function costHTML(cost) {
  return `<span class="cost">${Object.entries(cost).map(([r, amt]) =>
    `<span class="c${(G.state.res[r] || 0) < amt ? ' short' : ''}" data-r="${r}" data-amt="${amt}">${icon(r)}${fmt(amt)}</span>`
  ).join('')}</span>`;
}
// Update shortfall colouring of an already-rendered cost without rebuilding it.
function refreshCost(el) {
  for (const c of $$('.c', el)) c.classList.toggle('short', (G.state.res[c.dataset.r] || 0) < +c.dataset.amt);
}

// ---------- screens ----------

let started = false;
let tab = 'helpers';
let offlineSummary = null;

function showScreen(id) {
  for (const s of $$('.screen')) s.classList.toggle('active', s.id === id);
}

function renderTitle() {
  const has = G.hasSave();
  $('#btn-continue').hidden = !has;
  $('#btn-new').textContent = has ? 'New Game' : 'Begin';
  $('#btn-new').classList.toggle('primary', !has);
  const card = $('#away-card');
  if (offlineSummary) {
    const rows = Object.entries(offlineSummary.gained).map(([r, amt]) =>
      `<div class="row"><span>${icon(r)} ${RESOURCES[r].name}</span><span>+${fmt(amt)}</span></div>`).join('');
    card.innerHTML = `<h2>While you were away (${fmtDuration(offlineSummary.awayMs)})</h2>${rows}
      ${offlineSummary.capped ? `<div class="note">Your helpers rest after ${fmtDuration(offlineSummary.usedMs)} away.${G.state.locs.pond.features.reedchimes ? '' : ' Build Reed Chimes at the pond to extend it.'}</div>` : ''}`;
    card.hidden = false;
  } else {
    card.hidden = true;
  }
}

function startGame() {
  A.init();
  showScreen('screen-game');
  started = true;
  renderAll();
}

function goHome() {
  G.save();
  started = false;
  offlineSummary = null;
  renderTitle();
  showScreen('screen-title');
}

// ---------- top bar ----------

let resRefs = {};
function renderResBar() {
  const bar = $('#res-bar');
  const visible = Object.keys(RESOURCES).filter((r) =>
    LOCATIONS.some((l) => l.resource === r && G.state.locs[l.id]?.unlocked) || G.state.earned[r] > 0);
  bar.innerHTML = visible.map((r) => `
    <div class="res-chip" data-r="${r}" title="${RESOURCES[r].name}">
      ${icon(r)}<div class="txt"><span class="amt"></span><span class="rate"></span></div>
    </div>`).join('');
  resRefs = {};
  for (const r of visible) {
    const el = $(`.res-chip[data-r="${r}"]`, bar);
    resRefs[r] = { amt: $('.amt', el), rate: $('.rate', el) };
  }
  updateResBar();
}
function updateResBar() {
  const rates = G.d().resRate;
  for (const [r, ref] of Object.entries(resRefs)) {
    ref.amt.textContent = fmt(G.state.res[r]);
    ref.rate.textContent = `${fmtRate(rates[r])}/s`;
  }
}

// ---------- locations ----------

function renderLocTabs() {
  const nav = $('#loc-tabs');
  nav.innerHTML = LOCATIONS.map((l) => {
    const ls = G.state.locs[l.id];
    const cls = ['loc-tab'];
    if (l.soon) cls.push('soon');
    else if (!ls.unlocked) cls.push('locked');
    if (G.state.active === l.id) cls.push('active');
    const right = l.soon ? '<span class="lk">· soon</span>' : !ls?.unlocked ? '<span class="lk">🔒</span>' : icon(l.resource);
    return `<button class="${cls.join(' ')}" data-loc="${l.id}" ${l.soon ? 'disabled' : ''}>${l.name} ${right}</button>`;
  }).join('');
  for (const b of $$('.loc-tab', nav)) b.addEventListener('click', () => switchLocation(b.dataset.loc));
  updateLocTabs();
}
function updateLocTabs() {
  for (const b of $$('.loc-tab.locked')) {
    const l = LOCATION_BY_ID[b.dataset.loc];
    b.classList.toggle('can-unlock', G.canAfford(l.unlockCost));
  }
}

function switchLocation(id) {
  if (G.state.active === id) return;
  G.state.active = id;
  renderAll();
}

let spriteCount = -1;
function renderScene() {
  const id = G.state.active;
  const l = LOCATION_BY_ID[id];
  const ls = G.state.locs[id];
  $('#scene').innerHTML = SCENES[id]();
  $('#scene-name').textContent = l.name;
  const tapEl = $('[data-tap]', $('#scene'));
  tapEl.addEventListener('pointerdown', onTap);
  spriteCount = -1;
  updateSceneFeatures();
  updateSprites();

  const hint = $('#tap-hint');
  hint.textContent = l.tapVerb;
  hint.classList.toggle('faded', ls.taps > 30);

  const overlay = $('#lock-overlay');
  if (!ls.unlocked) {
    overlay.hidden = false;
    overlay.innerHTML = `<div class="lock-card">
      <h2>${l.name}</h2><p>${l.blurb}</p>${costHTML(l.unlockCost)}
      <button class="btn primary big" id="btn-unlock">Unlock</button></div>`;
    $('#btn-unlock').addEventListener('click', () => {
      if (G.unlockLocation(id)) {
        A.fanfare();
        toast(`✨ ${l.name} unlocked!`);
        G.save();
        renderAll();
      }
    });
  } else {
    overlay.hidden = true;
    overlay.innerHTML = '';
  }
  updateSceneRate();
}
function updateSceneRate() {
  const id = G.state.active;
  const r = LOCATION_BY_ID[id].resource;
  const dd = G.d();
  $('#scene-rate').innerHTML = G.state.locs[id].unlocked
    ? `${icon(r)} ${fmtRate(dd.locRate[id])}/s · ${fmt(dd.tapValue[id], 100)} per tap`
    : 'Locked';
}
function updateSceneFeatures() {
  const ls = G.state.locs[G.state.active];
  for (const g of $$('[data-feature]', $('#scene'))) g.classList.toggle('built', !!ls.features[g.dataset.feature]);
}
function updateSprites() {
  const id = G.state.active;
  const ls = G.state.locs[id];
  const total = Object.values(ls.helpers).reduce((a, b) => a + b, 0);
  const n = Math.min(40, total === 0 ? 0 : Math.ceil(Math.sqrt(total) * 3));
  if (n === spriteCount) return;
  spriteCount = n;
  const layer = $('[data-sprites]', $('#scene'));
  if (!layer) return;
  const color = SPRITE_COLORS[id];
  let html = '';
  for (let i = 0; i < n; i++) {
    const x = 80 + Math.random() * 840, y = 230 + Math.random() * 380;
    const style = `--dx:${(Math.random() * 120 - 60).toFixed(0)}px;--dy:${(Math.random() * 90 - 45).toFixed(0)}px;--dur:${(6 + Math.random() * 6).toFixed(1)}s;--delay:${(-Math.random() * 10).toFixed(1)}s`;
    html += `<g class="sprite" style="${style}"><circle cx="${x}" cy="${y}" r="9" fill="${color}" opacity=".25"/><circle cx="${x}" cy="${y}" r="3.5" fill="${color}"/></g>`;
  }
  layer.innerHTML = html;
}

// ---------- tapping ----------

function onTap(e) {
  e.preventDefault();
  const id = G.state.active;
  if (!G.state.locs[id].unlocked) return;
  const v = G.tap(id);
  A.tap(id);
  const target = e.currentTarget;
  target.classList.remove('bump');
  void target.getBoundingClientRect();
  target.classList.add('bump');

  const wrap = $('#scene-wrap').getBoundingClientRect();
  const x = e.clientX - wrap.left, y = e.clientY - wrap.top;
  const color = RESOURCES[LOCATION_BY_ID[id].resource].color;
  const layer = $('#floaters');
  const f = document.createElement('div');
  f.className = 'floater';
  f.style.cssText = `left:${x}px;top:${y}px;color:${color}`;
  f.textContent = `+${fmt(v, 100)}`;
  const rp = document.createElement('div');
  rp.className = 'ripple';
  rp.style.cssText = `left:${x}px;top:${y}px;color:${color}`;
  layer.append(f, rp);
  setTimeout(() => { f.remove(); rp.remove(); }, 1000);
  // Keep the DOM light under very fast multi-finger tapping.
  while (layer.childElementCount > 60) layer.firstElementChild.remove();

  if (G.state.locs[id].taps === 31) $('#tap-hint').classList.add('faded');
  updateResBar();
}

// ---------- panel ----------

let panelUpdaters = [];

function setTab(t) {
  tab = t;
  renderPanel();
}

function renderPanel() {
  for (const b of $$('.ptab')) b.classList.toggle('active', b.dataset.tab === tab);
  const body = $('#panel-body');
  panelUpdaters = [];
  const id = G.state.active;
  const ls = G.state.locs[id];
  if (tab !== 'settings' && !ls.unlocked) {
    body.innerHTML = `<div class="empty">Unlock ${LOCATION_BY_ID[id].name} to see its ${tab}.</div>`;
    return;
  }
  ({ helpers: renderHelpers, upgrades: renderUpgrades, features: renderFeatures, settings: renderSettings })[tab](body);
  updatePanel();
}

function updatePanel() {
  for (const u of panelUpdaters) u();
  updateTabDots();
}

function updateTabDots() {
  const id = G.state.active;
  const ls = G.state.locs[id];
  const dots = {
    upgrades: ls.unlocked && UPGRADES.some((u) => u.loc === id && !ls.upgrades[u.id] && G.canAfford(u.cost)),
    features: ls.unlocked && FEATURES.some((f) => f.loc === id && !ls.features[f.id] && G.featureAvailable(f) && G.canAfford(f.cost)),
  };
  for (const b of $$('.ptab')) {
    const want = !!dots[b.dataset.tab];
    const has = !!$('.dot', b);
    if (want && !has) b.insertAdjacentHTML('beforeend', '<span class="dot"></span>');
    if (!want && has) $('.dot', b).remove();
  }
}

function renderHelpers(body) {
  const id = G.state.active;
  const list = HELPERS.filter((h) => h.loc === id);
  const amt = G.state.settings.buyAmt;
  body.innerHTML = `
    <div class="section-head"><h3>Helpers gather ${RESOURCES[LOCATION_BY_ID[id].resource].name.toLowerCase()} for you</h3>
      <div class="seg" role="group" aria-label="Buy amount">
        ${[1, 10, 'max'].map((a) => `<button data-amt="${a}" class="${a === amt ? 'on' : ''}">${a === 'max' ? 'Max' : '×' + a}</button>`).join('')}
      </div></div>
    <div id="helper-list"></div>`;
  for (const b of $$('.seg button', body)) {
    b.addEventListener('click', () => {
      G.state.settings.buyAmt = b.dataset.amt === 'max' ? 'max' : +b.dataset.amt;
      renderPanel();
    });
  }
  const wrap = $('#helper-list', body);
  list.forEach((h, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    wrap.append(card);
    let lastKey = '';
    const update = () => {
      const ls = G.state.locs[id];
      const owned = ls.helpers[h.id] || 0;
      // Reveal helpers one at a time: show the next one once the previous is owned.
      const prevOwned = i === 0 || (ls.helpers[list[i - 1].id] || 0) > 0;
      const n = G.buyAmountFor(h);
      const cost = G.helperCost(h, owned, n);
      const key = `${owned}|${n}|${prevOwned}|${G.d().helperRate[h.id]}`;
      if (key !== lastKey) {
        lastKey = key;
        if (!prevOwned && owned === 0) {
          card.className = 'card locked';
          card.innerHTML = `<div><div class="name">???</div><div class="desc">Recruit a ${list[i - 1].name} to discover this helper.</div></div>`;
          return;
        }
        card.className = 'card';
        const per = G.d().helperRate[h.id];
        const nm = G.nextMilestone(owned);
        card.innerHTML = `
          <div>
            <div class="name">${h.name} <span class="owned">${owned ? '×' + owned : ''}</span></div>
            <div class="desc">${h.desc}</div>
            <div class="meta">+${fmtRate(per)}/s each${owned ? ` · ${fmtRate(per * owned)}/s total` : ''}
              ${nm ? `<span class="ms">· ×2 at ${nm}</span>` : ''}</div>
          </div>
          <button class="buy"><span class="lbl">Recruit ×${n}</span>${costHTML(cost)}</button>`;
        $('.buy', card).addEventListener('click', () => {
          if (G.buyHelper(h)) {
            const after = G.state.locs[id].helpers[h.id];
            if (nm && after >= nm) {
              A.fanfare();
              toast(`${h.plural} work twice as hard! (${nm} recruited)`);
            } else {
              A.buy();
            }
            onPurchase();
          }
        });
      }
      const btn = $('.buy', card);
      if (btn) {
        btn.disabled = !G.canAfford(cost);
        refreshCost(btn);
      }
    };
    panelUpdaters.push(update);
  });
}

function renderUpgrades(body) {
  const id = G.state.active;
  const ls = G.state.locs[id];
  const list = UPGRADES.filter((u) => u.loc === id);
  const open = list.filter((u) => !ls.upgrades[u.id]);
  const done = list.filter((u) => ls.upgrades[u.id]);
  body.innerHTML = `<div class="section-head"><h3>One-time boosts for ${LOCATION_BY_ID[id].name}</h3></div>`;
  for (const u of [...open, ...done]) {
    const card = document.createElement('div');
    const owned = !!ls.upgrades[u.id];
    card.className = 'card' + (owned ? ' done' : '');
    card.innerHTML = `<div><div class="name">${u.name}</div><div class="desc">${u.desc}</div></div>
      ${owned ? '<div class="check">✓ Owned</div>' : `<button class="buy"><span class="lbl">Buy</span>${costHTML(u.cost)}</button>`}`;
    body.append(card);
    if (!owned) {
      const btn = $('.buy', card);
      btn.addEventListener('click', () => {
        if (G.buyUpgrade(u)) { A.chime(); toast(`${u.name}: ${u.desc}`); onPurchase(true); }
      });
      panelUpdaters.push(() => { btn.disabled = !G.canAfford(u.cost); refreshCost(btn); });
    }
  }
}

function renderFeatures(body) {
  const id = G.state.active;
  const ls = G.state.locs[id];
  const list = FEATURES.filter((f) => f.loc === id);
  body.innerHTML = `<div class="section-head"><h3>Build up ${LOCATION_BY_ID[id].name}</h3></div>`;
  for (const f of list) {
    const card = document.createElement('div');
    const built = !!ls.features[f.id];
    const avail = G.featureAvailable(f);
    card.className = 'card' + (built ? ' done' : !avail ? ' locked' : '');
    const prev = list[list.indexOf(f) - 1];
    card.innerHTML = `<div><div class="name">${f.name}</div><div class="desc">${f.desc}</div>
      ${!built && !avail ? `<div class="meta"><span class="ms">Build ${prev.name} first</span></div>` : ''}</div>
      ${built ? '<div class="check">✓ Built</div>' : `<button class="buy"><span class="lbl">Build</span>${costHTML(f.cost)}</button>`}`;
    body.append(card);
    if (!built) {
      const btn = $('.buy', card);
      btn.addEventListener('click', () => {
        if (G.buildFeature(f)) {
          A.build();
          toast(`🌙 ${f.flavor}`);
          updateSceneFeatures();
          onPurchase(true);
        }
      });
      panelUpdaters.push(() => { btn.disabled = !avail || !G.canAfford(f.cost); refreshCost(btn); });
    }
  }
}

function renderSettings(body) {
  const s = G.state;
  const totalHelpers = Object.values(s.locs).reduce((a, l) => a + Object.values(l.helpers).reduce((x, y) => x + y, 0), 0);
  const ap = A.getPrefs();
  body.innerHTML = `
    <div class="settings-group">
      <h3>Sound</h3>
      <label class="slider"><span>Music &amp; ambience</span><input type="range" id="vol-music" min="0" max="100" value="${Math.round(ap.music * 100)}"></label>
      <label class="slider"><span>Sound effects</span><input type="range" id="vol-sfx" min="0" max="100" value="${Math.round(ap.sfx * 100)}"></label>
      <div class="row"><button class="btn" id="btn-mute2">${ap.muted ? 'Unmute' : 'Mute all'}</button></div>
    </div>
    <div class="settings-group">
      <h3>Move your save to another device</h3>
      <p>Copy this code, then paste it into Import on the other device.</p>
      <textarea id="export-box" readonly></textarea>
      <div class="row"><button class="btn primary" id="btn-copy">Copy code</button><button class="btn" id="btn-refresh-code">Refresh code</button></div>
    </div>
    <div class="settings-group">
      <h3>Import a save</h3>
      <p>Paste a code from another device. This replaces your current progress here.</p>
      <textarea id="import-box" placeholder="FAIRY1:…"></textarea>
      <div class="row"><button class="btn" id="btn-import">Import</button></div>
    </div>
    <div class="settings-group">
      <h3>Stats</h3>
      <div class="stats">
        <span>Total taps</span><span>${fmt(s.stats.taps)}</span>
        <span>Helpers recruited</span><span>${fmt(totalHelpers)}</span>
        ${Object.keys(RESOURCES).map((r) => `<span>${RESOURCES[r].name} gathered</span><span>${fmt(s.earned[r])}</span>`).join('')}
        <span>Time played</span><span>${fmtDuration(s.stats.playMs)}</span>
        <span>Offline earnings limit</span><span>${G.d().offlineHours} hours</span>
      </div>
    </div>
    <div class="settings-group">
      <h3>Game</h3>
      <div class="row">
        <button class="btn" id="btn-save">Save now</button>
        <button class="btn" id="btn-title">Title screen</button>
        <button class="btn danger" id="btn-reset">Reset all progress</button>
      </div>
    </div>`;
  $('#vol-music', body).addEventListener('input', (e) => A.setPref('music', e.target.value / 100));
  $('#vol-sfx', body).addEventListener('input', (e) => A.setPref('sfx', e.target.value / 100));
  $('#vol-sfx', body).addEventListener('change', () => A.buy());
  $('#btn-mute2', body).addEventListener('click', (e) => {
    const m = A.toggleMute();
    e.target.textContent = m ? 'Unmute' : 'Mute all';
    updateMuteBtn();
  });
  const box = $('#export-box', body);
  box.value = G.exportCode();
  $('#btn-refresh-code', body).addEventListener('click', () => { box.value = G.exportCode(); });
  $('#btn-copy', body).addEventListener('click', async () => {
    box.value = G.exportCode();
    try {
      await navigator.clipboard.writeText(box.value);
      toast('Save code copied');
    } catch {
      box.focus(); box.select();
      toast('Select the code and copy it');
    }
  });
  $('#btn-import', body).addEventListener('click', () => {
    const code = $('#import-box', body).value;
    confirmModal('Import this save?', 'Your current progress on this device will be replaced.', 'Import', () => {
      try {
        G.importCode(code);
        toast('Save imported ✨');
        renderAll();
      } catch (err) {
        toast(err.message);
      }
    });
  });
  $('#btn-save', body).addEventListener('click', () => { G.save(); toast('Saved'); });
  $('#btn-title', body).addEventListener('click', goHome);
  $('#btn-reset', body).addEventListener('click', () => {
    confirmModal('Reset everything?', 'All progress on this device will be erased. This can’t be undone.', 'Erase', () => {
      G.wipeSave();
      G.setState(G.freshState());
      G.save();
      tab = 'helpers';
      renderAll();
      toast('A fresh start under the moon');
    }, true);
  });
}

// ---------- shared ----------

function onPurchase(rerenderPanel = false) {
  G.save();
  updateResBar();
  updateSceneRate();
  updateSprites();
  if (rerenderPanel) renderPanel(); else updatePanel();
}

function renderAll() {
  A.setLocation(G.state.active);
  updateMuteBtn();
  renderResBar();
  renderLocTabs();
  renderScene();
  renderPanel();
}

function updateMuteBtn() {
  const muted = A.getPrefs().muted;
  const b = $('#btn-mute');
  b.textContent = muted ? '🔇' : '🔊';
  b.setAttribute('aria-label', muted ? 'Unmute sound' : 'Mute sound');
}

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  $('#toasts').append(t);
  setTimeout(() => t.remove(), 3700);
  while ($('#toasts').childElementCount > 3) $('#toasts').firstElementChild.remove();
}

function confirmModal(title, text, okLabel, onOk, danger = false) {
  const m = $('#modal');
  m.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true"><h2></h2><p></p>
    <div class="row"><button class="btn" data-x>Cancel</button><button class="btn ${danger ? 'danger' : 'primary'}" data-ok></button></div></div>`;
  $('h2', m).textContent = title;
  $('p', m).textContent = text;
  $('[data-ok]', m).textContent = okLabel;
  m.hidden = false;
  const close = () => { m.hidden = true; m.innerHTML = ''; };
  $('[data-x]', m).addEventListener('click', close);
  $('[data-ok]', m).addEventListener('click', () => { close(); onOk(); });
  m.addEventListener('click', (e) => { if (e.target === m) close(); }, { once: true });
}

// ---------- loop ----------

let last = performance.now();
let uiAccum = 0, saveAccum = 0;
let knownUnlockable = new Set();

function tick(now) {
  let dt = (now - last) / 1000;
  last = now;
  if (dt < 0) dt = 0;
  if (started) {
    // Long gaps (tab in background) are handled by the offline catch-up on visibility change.
    dt = Math.min(dt, 1);
    G.produce(dt);
    G.state.stats.playMs += dt * 1000;
    uiAccum += dt; saveAccum += dt;
    if (uiAccum >= 0.2) {
      uiAccum = 0;
      updateResBar();
      updatePanel();
      updateLocTabs();
      updateSceneRate();
      for (const l of LOCATIONS) {
        if (l.soon || G.state.locs[l.id].unlocked) continue;
        if (G.canAfford(l.unlockCost) && !knownUnlockable.has(l.id)) {
          knownUnlockable.add(l.id);
          toast(`${l.name} can now be unlocked!`);
        }
      }
    }
    if (saveAccum >= 5) { saveAccum = 0; G.save(); }
  }
  requestAnimationFrame(tick);
}

// Catch up when returning to the tab / app.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') A.suspend();
  else A.resume();
  if (!started) return;
  if (document.visibilityState === 'hidden') {
    G.save();
  } else {
    const sum = G.applyOffline();
    last = performance.now();
    if (sum) {
      const parts = Object.entries(sum.gained).map(([r, a]) => `+${fmt(a)} ${RESOURCES[r].name}`).join(', ');
      toast(`Welcome back! Your helpers gathered ${parts}`);
    }
    G.save();
    updateResBar();
  }
});
window.addEventListener('pagehide', () => { if (started) G.save(); });

// ---------- boot ----------

function boot() {
  if (G.load()) offlineSummary = G.applyOffline();
  if (G.hasSave()) G.save();
  for (const l of LOCATIONS) if (!l.soon && G.canAfford(l.unlockCost || {})) knownUnlockable.add(l.id);

  $('#btn-continue').addEventListener('click', startGame);
  $('#btn-new').addEventListener('click', () => {
    const begin = () => {
      G.wipeSave();
      G.setState(G.freshState());
      G.save();
      knownUnlockable = new Set();
      tab = 'helpers';
      startGame();
    };
    if (G.hasSave()) confirmModal('Start a new game?', 'Your current progress on this device will be erased.', 'Start over', begin, true);
    else begin();
  });
  $('#btn-home').addEventListener('click', goHome);
  $('#btn-mute').addEventListener('click', () => {
    A.init();
    A.toggleMute();
    updateMuteBtn();
    if (tab === 'settings') renderPanel();
  });
  // Any touch wakes the audio if the browser put it to sleep.
  document.addEventListener('pointerdown', () => A.resume(), { passive: true });
  for (const b of $$('.ptab')) b.addEventListener('click', () => setTab(b.dataset.tab));
  // Stop long-press context menus and pinch-zoom gestures interfering with tapping.
  $('#scene-wrap').addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('gesturestart', (e) => e.preventDefault());

  renderTitle();
  requestAnimationFrame((t) => { last = t; tick(t); });
}

boot();
