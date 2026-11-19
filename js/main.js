// UI, input and the game loop.
import {
  RESOURCES, LOCATIONS, HELPERS, UPGRADES, FEATURES, LOCATION_BY_ID,
  EVENT_BY_ID, FAIRY_GIFTS, GIFT_BY_ID, ACHIEVEMENT_BONUS,
  SHRINE, SHRINE_PATHS, STONE_BONUS, FINALE_PRESTIGE, MILESTONES,
} from './data.js';
import { ACHIEVEMENTS, ACHIEVEMENT_GROUPS } from './achievements.js';
import * as G from './game.js';
import { SCENES } from './scenes.js';
import { SPRITES, HELPER_VIS, MAX_VISIBLE_PER_HELPER } from './sprites.js';
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
  ambersap: `<svg class="ricon" viewBox="0 0 32 32"><defs><radialGradient id="ri-a" cx=".4" cy=".4" r=".7"><stop offset="0" stop-color="#fff0c2"/><stop offset=".5" stop-color="#ffb54d"/><stop offset="1" stop-color="#b8601a"/></radialGradient></defs><path d="M16 4 C22 10 26 15 26 20 a10 10 0 0 1 -20 0 C6 15 10 10 16 4z" fill="url(#ri-a)"/><circle cx="12.5" cy="18" r="2.6" fill="#fff6d8" opacity=".75"/></svg>`,
  moonshards: `<svg class="ricon" viewBox="0 0 32 32"><defs><linearGradient id="ri-m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f5eeff"/><stop offset=".5" stop-color="#c9b6ff"/><stop offset="1" stop-color="#6b4fd0"/></linearGradient></defs><path d="M16 2 L25 13 L16 30 L7 13 Z" fill="url(#ri-m)"/><path d="M16 2 L25 13 L16 13 Z" fill="#fff" opacity=".35"/><path d="M7 13 H25" stroke="#fff" stroke-opacity=".5"/></svg>`,
  stardust: `<svg class="ricon" viewBox="0 0 32 32"><defs><radialGradient id="ri-t"><stop offset="0" stop-color="#fffef0"/><stop offset=".6" stop-color="#fff0a0"/><stop offset="1" stop-color="#ffc94d"/></radialGradient></defs><path d="M16 2 L19.5 11.5 L29.5 12 L21.6 18.2 L24.4 28 L16 22.4 L7.6 28 L10.4 18.2 L2.5 12 L12.5 11.5 Z" fill="url(#ri-t)"/></svg>`,
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
  const tm = $('#title-moons');
  const count = has ? G.state.prestige.count : 0;
  tm.hidden = count === 0;
  if (count) tm.innerHTML = moonRow(count) + `<div>${G.inEndless() ? `Endless Night · ${count} nights` : `Night ${count + 1} of ${FINALE_PRESTIGE}`}</div>`;
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
  bloodView = G.hasBuff('bloodmoon');
  renderAll();
  if (G.state.blood.pending > 0) setTimeout(showBloodExchange, 400);
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
    if (bloodView && cls.includes('active')) cls.splice(cls.indexOf('active'), 1);
    return `<button class="${cls.join(' ')}" data-loc="${l.id}" ${l.soon ? 'disabled' : ''}>${l.name} ${right}</button>`;
  }).join('');
  if (G.hasBuff('bloodmoon')) {
    nav.insertAdjacentHTML('afterbegin', `<button class="loc-tab courtyard${bloodView ? ' active' : ''}" data-loc="courtyard">🩸 Crimson Courtyard</button>`);
  }
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
  if (id === 'courtyard') {
    if (bloodView || !G.hasBuff('bloodmoon')) return;
    bloodView = true;
    renderAll();
    return;
  }
  if (G.state.active === id && !bloodView) return;
  bloodView = false;
  G.state.active = id;
  renderAll();
}

function renderScene() {
  if (bloodView) { renderCourtyard(); return; }
  const id = G.state.active;
  const l = LOCATION_BY_ID[id];
  const ls = G.state.locs[id];
  $('#scene').innerHTML = SCENES[id]();
  $('#scene-name').textContent = l.name;
  const tapEl = $('[data-tap]', $('#scene'));
  tapEl.addEventListener('pointerdown', onTap);
  updateSceneFeatures();
  updateSprites(true);

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
  if (bloodView) {
    $('#scene-rate').innerHTML = `🩸 ${fmt(G.state.blood.drops)} Blood Drops`;
    return;
  }
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
// Each recruited helper appears in its place (up to a cap per type), drawn and
// animated in its own style. Positions are seeded so they stay put between renders.
let shownSprites = {}; // helperId -> how many are currently drawn
function seeded(str, i) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  h = Math.imul(h ^ (i + 1) * 2654435761, 16777619);
  let s = (h >>> 0) % 2147483646 + 1;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
function updateSprites(forceAll = false) {
  const id = G.state.active;
  const ls = G.state.locs[id];
  const layer = $('[data-sprites]', $('#scene'));
  if (!layer || !ls) return;
  if (forceAll) { shownSprites = {}; layer.innerHTML = ''; }
  for (const h of HELPERS.filter((x) => x.loc === id)) {
    const owned = ls.helpers[h.id] || 0;
    const want = Math.min(owned, MAX_VISIBLE_PER_HELPER);
    const tier = MILESTONES.filter((m) => owned >= m).length;
    let group = $(`g[data-h="${h.id}"]`, layer);
    if (!group) {
      group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('data-h', h.id);
      layer.append(group);
    }
    const had = shownSprites[h.id] || 0;
    const tierChanged = group.dataset.tier !== String(tier);
    if (want === had && !tierChanged) continue;
    group.dataset.tier = tier;
    const vis = HELPER_VIS[h.id];
    let html = '';
    for (let i = 0; i < want; i++) {
      const r = seeded(h.id, i);
      const [x1, y1, x2, y2] = vis.zone;
      const x = x1 + r() * (x2 - x1), y = y1 + r() * (y2 - y1);
      const flip = r() < 0.5 ? -1 : 1;
      const sc = vis.scale * (0.85 + r() * 0.3);
      const dur = (vis.slow ? 1.8 : 1) * (0.8 + r() * 0.5);
      const delay = -r() * 10;
      // Milestones (25, 50, 100…) give helpers a growing glow.
      const aura = tier ? `<circle class="aura" r="${12 + tier * 2}" fill="${vis.color}" opacity="${Math.min(0.1 + tier * 0.04, 0.3)}"/>` : '';
      const spawn = i >= had && !forceAll ? ' spawn' : '';
      html += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${sc.toFixed(2)})"><g class="hs-in${spawn}">
        <g class="hs a-${vis.anim}" style="--k:${dur.toFixed(2)};--delay:${delay.toFixed(1)}s">${aura}<g transform="scale(${flip} 1)">${SPRITES[h.id]()}</g></g></g></g>`;
    }
    group.innerHTML = html;
    shownSprites[h.id] = want;
  }
}

// ---------- tapping ----------

// Steady Hand (Moon Shrine): holding a finger down keeps tapping.
const holds = new Map();
function stopHold(e) {
  const h = holds.get(e.pointerId);
  if (h) { clearInterval(h); holds.delete(e.pointerId); }
}
window.addEventListener('pointerup', stopHold);
window.addEventListener('pointercancel', stopHold);

const viewId = () => (bloodView ? 'courtyard' : G.state.active);

function onTap(e) {
  e.preventDefault();
  const id = viewId();
  if (id === 'courtyard' ? !G.hasBuff('bloodmoon') : !G.state.locs[id].unlocked) return;
  if (G.d().holdTap && !holds.has(e.pointerId)) {
    const target = e.currentTarget, x = e.clientX, y = e.clientY, pid = e.pointerId;
    let first = true;
    holds.set(pid, setInterval(() => {
      if (first) { first = false; return; } // wait a moment so a normal tap isn't doubled
      if (viewId() !== id || (id === 'courtyard' && !G.hasBuff('bloodmoon'))) { clearInterval(holds.get(pid)); holds.delete(pid); return; }
      doTap(id, target, x, y);
    }, 166));
  }
  doTap(id, e.currentTarget, e.clientX, e.clientY);
}

function doTap(id, target, clientX, clientY) {
  const blood = id === 'courtyard';
  const { value: v, echo } = blood ? G.tapBlood() : G.tap(id);
  if (blood) A.bloodTap(echo); else A.tap(id, echo);
  trackFrenzy();
  target.classList.remove('bump');
  void target.getBoundingClientRect();
  target.classList.add('bump');

  const wrap = $('#scene-wrap').getBoundingClientRect();
  const x = clientX - wrap.left, y = clientY - wrap.top;
  const color = blood ? '#ff4a5a' : RESOURCES[LOCATION_BY_ID[id].resource].color;
  const layer = $('#floaters');
  const f = document.createElement('div');
  f.className = 'floater';
  f.style.cssText = `left:${x}px;top:${y}px;color:${color}`;
  f.textContent = `+${fmt(v, 100)}${echo ? ' ×2' : ''}`;
  if (echo) f.classList.add('echo');
  const rp = document.createElement('div');
  rp.className = 'ripple';
  rp.style.cssText = `left:${x}px;top:${y}px;color:${color}`;
  layer.append(f, rp);
  setTimeout(() => { f.remove(); rp.remove(); }, 1000);
  // Keep the DOM light under very fast multi-finger tapping.
  while (layer.childElementCount > 60) layer.firstElementChild.remove();

  if (blood) { updateSceneRate(); updateBloodPanel(); return; }
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
  for (const b of $$('.ptab')) b.classList.toggle('active', b.dataset.tab === tab && !bloodView);
  const body = $('#panel-body');
  panelUpdaters = [];
  if (bloodView) { renderBloodPanel(body); return; }
  const id = G.state.active;
  const ls = G.state.locs[id];
  if (tab !== 'settings' && tab !== 'awards' && !ls.unlocked) {
    body.innerHTML = `<div class="empty">Unlock ${LOCATION_BY_ID[id].name} to see its ${tab}.</div>`;
    return;
  }
  ({ helpers: renderHelpers, upgrades: renderUpgrades, features: renderFeatures, awards: renderAwards, settings: renderSettings })[tab](body);
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
    upgrades: ls.unlocked && UPGRADES.some((u) => u.loc === id && !ls.upgrades[u.id] && G.upgradeAvailable(u) && G.canAfford(G.upgradeCost(u))),
    features: ls.unlocked && FEATURES.some((f) => f.loc === id && !ls.features[f.id] && G.featureAvailable(f) && G.canAfford(G.featureCost(f))),
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
    // The card's structure is built once; later updates only change text,
    // so the button never gets replaced mid-tap.
    let built = null; // 'locked' | 'open'
    let refs = {};
    let lastKey = '', lastCostKey = '';
    const buildOpen = () => {
      card.className = 'card';
      card.innerHTML = `
        <div>
          <div class="name">${h.name} <span class="owned"></span><span class="perks"></span></div>
          <div class="desc">${h.desc}</div>
          <div class="meta"></div>
          <div class="ms-wrap"><div class="ms-bar"><i></i></div><div class="ms-label"></div></div>
        </div>
        <button class="buy"><span class="lbl"></span><span class="cost"></span></button>`;
      refs = { owned: $('.owned', card), meta: $('.meta', card), btn: $('.buy', card), lbl: $('.lbl', card), cost: $('.cost', card),
        perks: $('.perks', card), bar: $('.ms-bar i', card), msLabel: $('.ms-label', card) };
      refs.btn.addEventListener('click', () => {
        const before = G.state.locs[id].helpers[h.id] || 0;
        const nm = G.nextMilestone(before);
        if (G.buyHelper(h)) {
          const after = G.state.locs[id].helpers[h.id];
          if (nm && after >= nm) {
            A.fanfare();
            toast(`⚡ ${nm} ${h.plural}! They now gather twice as fast`);
            card.classList.remove('levelup'); void card.offsetWidth; card.classList.add('levelup');
          } else {
            A.buy();
          }
          onPurchase();
        }
      });
      built = 'open';
      lastKey = lastCostKey = '';
    };
    const update = () => {
      const ls = G.state.locs[id];
      const owned = ls.helpers[h.id] || 0;
      // Reveal helpers one at a time: show the next one once the previous is owned.
      const prevOwned = i === 0 || (ls.helpers[list[i - 1].id] || 0) > 0;
      if (!prevOwned && owned === 0) {
        if (built !== 'locked') {
          card.className = 'card locked';
          card.innerHTML = `<div><div class="name">???</div><div class="desc">Recruit a ${list[i - 1].name} to discover this helper.</div></div>`;
          built = 'locked';
        }
        return;
      }
      if (built !== 'open') buildOpen();
      const n = G.buyAmountFor(h);
      const cost = G.helperCost(h, owned, n);
      const per = G.d().helperRate[h.id];
      const key = `${owned}|${per}`;
      if (key !== lastKey) {
        lastKey = key;
        const nm = G.nextMilestone(owned);
        const prev = [0, ...MILESTONES].filter((m) => m <= owned).pop();
        refs.owned.textContent = owned ? '×' + owned : '';
        refs.meta.innerHTML = `+${fmtRate(per)}/s each${owned ? ` · ${fmtRate(per * owned)}/s total` : ''}`;
        // Milestone progress: every milestone doubles this helper's gathering.
        const speed = G.milestoneMult(owned);
        refs.bar.style.width = nm ? `${((owned - prev) / (nm - prev)) * 100}%` : '100%';
        refs.msLabel.innerHTML = (speed > 1 ? `<b>Speed ×${speed}</b> · ` : '') +
          (nm ? `${owned}/${nm} → <b>×2 speed</b>` : 'Top speed reached');
        const perks = UPGRADES.filter((u) => u.helper === h.id && ls.upgrades[u.id]).length;
        refs.perks.textContent = perks ? ' ' + '✦'.repeat(perks) : '';
      }
      const costKey = `${n}|${JSON.stringify(cost)}`;
      if (costKey !== lastCostKey) {
        lastCostKey = costKey;
        refs.lbl.textContent = `Recruit ×${n}`;
        refs.cost.outerHTML = costHTML(cost);
        refs.cost = $('.cost', refs.btn);
      }
      refs.btn.disabled = !G.canAfford(cost);
      refreshCost(refs.btn);
    };
    panelUpdaters.push(update);
  });
}

function renderUpgrades(body) {
  const id = G.state.active;
  const ls = G.state.locs[id];
  const placeUps = UPGRADES.filter((u) => u.loc === id && !u.helper);
  const sorted = [...placeUps.filter((u) => !ls.upgrades[u.id]), ...placeUps.filter((u) => ls.upgrades[u.id])];
  body.innerHTML = `<div class="section-head"><h3>Boosts for ${LOCATION_BY_ID[id].name}</h3></div>`;
  for (const u of sorted) body.append(upgradeCard(u));

  // Helper upgrades: shown for helpers you've recruited at least once.
  const helperUps = UPGRADES.filter((u) => u.loc === id && u.helper && (ls.helpers[u.helper] || 0) > 0);
  const head = document.createElement('div');
  head.className = 'section-head';
  head.innerHTML = '<h3>Helper upgrades</h3>';
  body.append(head);
  if (!helperUps.length) {
    body.insertAdjacentHTML('beforeend', '<div class="empty small">Recruit helpers here to discover their upgrades.</div>');
    return;
  }
  const rank = (u) => ls.upgrades[u.id] ? 2 : G.upgradeAvailable(u) ? 0 : 1;
  for (const u of helperUps.sort((a, b) => rank(a) - rank(b))) body.append(upgradeCard(u));
}

function upgradeCard(u) {
  const ls = G.state.locs[u.loc];
  const card = document.createElement('div');
  const owned = !!ls.upgrades[u.id];
  const avail = G.upgradeAvailable(u);
  const h = u.helper ? HELPERS.find((x) => x.id === u.helper) : null;
  card.className = 'card' + (owned ? ' done' : !avail ? ' locked' : '') + (h ? ' perk' : '');
  const sprite = h ? `<svg class="perk-icon" viewBox="-24 -24 48 48" aria-hidden="true">${SPRITES[h.id]()}</svg>` : '';
  const need = h && !avail ? `<div class="meta"><span class="ms">Recruit ${u.req} ${h.plural} (${ls.helpers[h.id] || 0}/${u.req})</span></div>` : '';
  card.innerHTML = `<div class="perk-row">${sprite}<div><div class="name">${u.name}</div><div class="desc">${u.desc}</div>${need}</div></div>
    ${owned ? '<div class="check">✓ Owned</div>' : `<button class="buy"><span class="lbl">Buy</span>${costHTML(G.upgradeCost(u))}</button>`}`;
  if (!owned) {
    const btn = $('.buy', card);
    btn.addEventListener('click', () => {
      if (G.buyUpgrade(u)) {
        A.chime();
        if (h) toast(`✦ ${u.name}: ${u.desc}`);
        onPurchase(true);
        updateSprites();
      }
    });
    panelUpdaters.push(() => { btn.disabled = !avail || !G.canAfford(G.upgradeCost(u)); refreshCost(btn); });
  }
  return card;
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
      ${built ? '<div class="check">✓ Built</div>' : `<button class="buy"><span class="lbl">Build</span>${costHTML(G.featureCost(f))}</button>`}`;
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
      panelUpdaters.push(() => { btn.disabled = !avail || !G.canAfford(G.featureCost(f)); refreshCost(btn); });
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
      <div class="style-row"><span>Music style</span>
        <div class="seg" role="group" aria-label="Music style">
          <button data-style="calm" class="${ap.style === 'upbeat' ? '' : 'on'}">🌙 Calm</button>
          <button data-style="upbeat" class="${ap.style === 'upbeat' ? 'on' : ''}">🎵 Upbeat</button>
        </div></div>
      <p class="style-note">Calm plays gentle ambience. Upbeat gives every place its own song.</p>
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
        <span>Events seen</span><span>${fmt(s.ev.count)}</span>
        <span>Shooting stars caught</span><span>${fmt(s.stats.starsCaught)}</span>
        <span>Achievements</span><span>${G.achievementCount()} / ${ACHIEVEMENTS.length}</span>
        <span>Nights completed (prestiges)</span><span>${s.prestige.count}</span>
        <span>Moonstones earned</span><span>${fmt(s.prestige.lifetimeStones)}</span>
        ${s.prestige.fastestRunMs ? `<span>Fastest night</span><span>${fmtDuration(s.prestige.fastestRunMs)}</span>` : ''}
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
  for (const b of $$('[data-style]', body)) {
    b.addEventListener('click', () => {
      A.init();
      A.setMusicStyle(b.dataset.style);
      for (const x of $$('[data-style]', body)) x.classList.toggle('on', x === b);
      toast(b.dataset.style === 'upbeat' ? '🎵 Upbeat music on' : '🌙 Calm ambience on');
    });
  }
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

// ---------- awards ----------

function renderAwards(body) {
  const n = G.achievementCount();
  const groups = ACHIEVEMENT_GROUPS.map((g) => {
    const items = ACHIEVEMENTS.filter((a) => a.group === g);
    const got = items.filter((a) => G.state.achievements[a.id]).length;
    return `<div class="ach-group"><h4>${g} <span>${got} / ${items.length}</span></h4><div class="ach-grid">
      ${items.map((a) => {
        const earned = !!G.state.achievements[a.id];
        const hide = a.secret && !earned;
        return `<div class="ach${earned ? ' earned' : ''}">
          <div class="ach-icon">${earned ? '🏆' : hide ? '❔' : '🔒'}</div>
          <div><div class="ach-name">${hide ? 'Secret' : a.name}</div><div class="ach-desc">${hide ? 'Keep playing to discover this one.' : a.desc}</div></div>
        </div>`;
      }).join('')}</div></div>`;
  }).join('');
  body.innerHTML = `
    <div class="ach-summary">
      <div class="big">🏆 ${n} <small>/ ${ACHIEVEMENTS.length}</small></div>
      <div>Each achievement adds +${Math.round(ACHIEVEMENT_BONUS * 100)}% to everything you gather.<br>
      Current bonus: <b>+${Math.round(n * ACHIEVEMENT_BONUS * 100)}%</b></div>
    </div>${groups}`;
}

function onAchievements(list) {
  A.achievement();
  for (const a of list) toast(`🏆 Achievement: ${a.name}`);
  G.save();
  updateResBar();
  updateSceneRate();
  if (tab === 'awards' || tab === 'settings') renderPanel();
}

// Detect a burst of fast tapping for the "Tap Frenzy" achievement.
let tapTimes = [];
function trackFrenzy() {
  if (G.state.stats.frenzy) return;
  const now = performance.now();
  tapTimes.push(now);
  while (tapTimes.length && now - tapTimes[0] > 5000) tapTimes.shift();
  if (tapTimes.length >= 40) G.state.stats.frenzy = true;
}

// ---------- events ----------

const fmtClock = (sec) => { sec = Math.ceil(sec); return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; };

function buffInfo(b) {
  return b.kind === 'event' ? EVENT_BY_ID[b.id] : GIFT_BY_ID[b.id];
}

function onEventsChanged({ started, ended }) {
  let bloodChange = false;
  for (const id of started) {
    const e = EVENT_BY_ID[id];
    A.eventStart(id);
    if (id === 'bloodmoon') {
      bloodView = true;
      bloodChange = true;
      bloodFlash();
      toast('🩸 The Blood Moon rises! You are drawn to a castle courtyard…');
    } else {
      toast(`${e.icon} ${e.name}! ${e.desc}`);
    }
  }
  for (const id of ended) {
    if (id === 'fairy') toast('🧚 The fairy flutters away…');
    if (id === 'bloodmoon') { bloodView = false; bloodChange = true; }
  }
  G.save();
  if (bloodChange) {
    renderAll();
    if (G.state.blood.pending > 0) showBloodExchange();
    return;
  }
  renderEvents();
  updateResBar();
  updateSceneRate();
  if (tab === 'helpers') renderPanel(); else updatePanel();
}

// Build the banner, scene overlay and special actors for the current buffs.
function renderEvents() {
  const fx = $('#event-fx');
  const ev = G.activeEvent();
  fx.className = 'event-fx' + (ev ? ' fx-' + ev.id : '');
  const banner = $('#event-banner');
  banner.innerHTML = G.state.buffs.map((b) => {
    const info = buffInfo(b);
    return `<div class="buff" data-id="${b.id}"><div class="buff-icon">${info.icon}</div>
      <div class="buff-txt"><div class="buff-name">${info.name}</div><div class="buff-desc">${info.desc}</div>
      <div class="buff-bar"><i></i></div></div><div class="buff-time"></div></div>`;
  }).join('') + (G.d().eventPreview && !ev ? '<div class="buff preview" id="next-event"></div>' : '');

  const fairyEl = $('#fairy');
  fairyEl.hidden = !G.hasBuff('fairy');
  if (!G.hasBuff('meteor')) $$('.meteor').forEach((m) => m.remove());
  updateEvents();
}

function updateEvents() {
  for (const el of $$('#event-banner .buff[data-id]')) {
    const b = G.state.buffs.find((x) => x.id === el.dataset.id);
    if (!b) continue;
    const left = Math.max(0, b.ends - G.state.clock);
    $('.buff-time', el).textContent = fmtClock(left);
    $('.buff-bar i', el).style.width = `${(left / b.dur) * 100}%`;
  }
  const next = $('#next-event');
  if (next) {
    const e = EVENT_BY_ID[G.state.ev.nextId];
    next.innerHTML = e ? `<div class="buff-icon">🔭</div><div class="buff-txt"><div class="buff-name">Next: ${e.icon} ${e.name}</div><div class="buff-desc">in ${fmtClock(G.secondsUntilNextEvent())}</div></div>` : '';
  }
}

// The wandering fairy drifts in a looping path over the scene.
function moveFairy(now) {
  const el = $('#fairy');
  if (el.hidden) return;
  const w = $('#scene-wrap').clientWidth, h = $('#scene-wrap').clientHeight;
  const t = now / 1000;
  const x = (0.5 + 0.36 * Math.sin(t * 0.55)) * w;
  const y = (0.42 + 0.22 * Math.sin(t * 1.15 + 1)) * h;
  el.style.transform = `translate(${x - 40}px, ${y - 40}px) scaleX(${Math.cos(t * 0.55) > 0 ? 1 : -1})`;
}

function onFairyTap(e) {
  e.preventDefault();
  if (!G.hasBuff('fairy')) return;
  G.catchFairy();
  A.fanfare();
  renderEvents();
  const m = $('#modal');
  m.innerHTML = `<div class="modal-card gift-card" role="dialog" aria-modal="true">
    <h2>🧚 A gift from the fairy</h2><p>She offers you one of three gifts. Choose wisely!</p>
    <div class="gifts">${FAIRY_GIFTS.map((g) => `<button class="gift" data-gift="${g.id}"><span class="gift-icon">${g.icon}</span><b>${g.name}</b><span>${g.desc}</span></button>`).join('')}</div></div>`;
  m.hidden = false;
  for (const b of $$('.gift', m)) {
    b.addEventListener('click', () => {
      const res = G.applyGift(b.dataset.gift);
      m.hidden = true; m.innerHTML = '';
      A.chime();
      if (res.gained) toast(`🎁 ${Object.entries(res.gained).map(([r, a]) => `+${fmt(a)} ${RESOURCES[r].name}`).join(', ')}`);
      else toast(`${GIFT_BY_ID[b.dataset.gift].icon} ${GIFT_BY_ID[b.dataset.gift].name}!`);
      G.save();
      renderEvents();
      updateResBar();
      updateSceneRate();
      updatePanel();
    });
  }
}

// Meteor shower: shooting stars streak across whatever scene you're on.
let meteorTimer = 0;
function spawnMeteors(dt) {
  if (!G.hasBuff('meteor')) return;
  meteorTimer -= dt;
  if (meteorTimer > 0) return;
  meteorTimer = 0.7 + Math.random() * 0.8;
  const wrap = $('#scene-wrap');
  const w = wrap.clientWidth, h = wrap.clientHeight;
  const m = document.createElement('button');
  m.className = 'meteor';
  m.setAttribute('aria-label', 'Shooting star');
  const sx = w * (0.45 + Math.random() * 0.6), sy = -40 + Math.random() * h * 0.25;
  const dist = w * (0.5 + Math.random() * 0.3);
  m.style.cssText = `left:${sx}px;top:${sy}px;--mx:${-dist}px;--my:${dist * 0.45}px;--md:${(2.6 + Math.random()).toFixed(2)}s`;
  m.innerHTML = '<span class="trail"></span><span class="head">✦</span>';
  m.addEventListener('pointerdown', (e) => {
    e.preventDefault(); e.stopPropagation();
    const amt = G.catchStar();
    A.starCatch();
    const r = wrap.getBoundingClientRect();
    floatText(e.clientX - r.left, e.clientY - r.top, `+${fmt(amt)} ✦`, RESOURCES.stardust.color);
    m.remove();
    updateResBar();
  });
  m.addEventListener('animationend', () => m.remove());
  $('#event-layer').append(m);
}

function floatText(x, y, text, color) {
  const f = document.createElement('div');
  f.className = 'floater';
  f.style.cssText = `left:${x}px;top:${y}px;color:${color}`;
  f.textContent = text;
  $('#floaters').append(f);
  setTimeout(() => f.remove(), 1000);
}

// ---------- Blood Moon ----------

let bloodView = false; // showing the Crimson Courtyard

function renderCourtyard() {
  $('#scene').innerHTML = SCENES.courtyard();
  $('#scene-name').textContent = 'Crimson Courtyard';
  $('[data-tap]', $('#scene')).addEventListener('pointerdown', onTap);
  const hint = $('#tap-hint');
  hint.textContent = 'Tap the blood pool';
  hint.classList.remove('faded');
  $('#lock-overlay').hidden = true;
  updateSceneRate();
}

function bloodFlash() {
  const f = document.createElement('div');
  f.className = 'blood-flash';
  document.body.append(f);
  setTimeout(() => f.remove(), 2200);
}

function renderBloodPanel(body) {
  body.innerHTML = `<div class="blood-panel">
    <h3>🩸 The Blood Moon</h3>
    <div class="blood-count"><b id="bp-drops">0</b> Blood Drops</div>
    <div class="buff-bar"><i id="bp-bar"></i></div>
    <div class="bp-time" id="bp-time"></div>
    <p>Tap the blood pool while the moon is red. When it sets, you choose which resource your drops become, at a generous rate. Right now one drop is worth:</p>
    <div class="bp-rates" id="bp-rates"></div>
  </div>`;
  updateBloodPanel();
}

function updateBloodPanel() {
  const el = $('#bp-drops');
  if (!el) return;
  el.textContent = fmt(G.state.blood.drops);
  const b = G.state.buffs.find((x) => x.id === 'bloodmoon');
  if (b) {
    const left = Math.max(0, b.ends - G.state.clock);
    $('#bp-bar').style.width = `${(left / b.dur) * 100}%`;
    $('#bp-time').textContent = `The moon sets in ${fmtClock(left)}`;
  }
  const rates = G.bloodRates();
  $('#bp-rates').innerHTML = Object.entries(rates).map(([r, x]) =>
    `<div>${icon(r)} ${fmt(x, 100)} ${RESOURCES[r].name}</div>`).join('');
}

function showBloodExchange() {
  const pending = G.state.blood.pending;
  if (pending <= 0) return;
  const m = $('#modal');
  const rates = G.bloodRates();
  m.innerHTML = `<div class="modal-card blood-card" role="dialog" aria-modal="true">
    <h2>🩸 The Blood Moon sets</h2>
    <p>You gathered <b>${fmt(pending)}</b> Blood Drops. Choose what they become:</p>
    <div class="blood-choices">${Object.entries(rates).map(([r, x]) => `
      <button class="blood-choice" data-r="${r}">${icon(r)}<span><b>+${fmt(pending * x)}</b> ${RESOURCES[r].name}<small>1 drop = ${fmt(x, 100)}</small></span></button>`).join('')}
    </div></div>`;
  m.hidden = false;
  for (const b of $$('.blood-choice', m)) {
    b.addEventListener('click', () => {
      const amt = G.convertBlood(b.dataset.r);
      m.hidden = true; m.innerHTML = '';
      A.fanfare();
      toast(`🩸 Your Blood Drops became ${fmt(amt)} ${RESOURCES[b.dataset.r].name}`);
      G.save();
      updateResBar();
      updatePanel();
    });
  }
}

// ---------- the moon: prestige, shrine, finale ----------

let moonUid = 0;
// A moon at phase 0 (new) to 5 (full).
function moonSVG(phase, cls = '') {
  const f = Math.max(0, Math.min(1, phase / 5));
  const id = 'mc' + (++moonUid);
  const r = 16, shift = 2 * r * f;
  return `<svg class="moon-svg ${cls}" viewBox="0 0 40 40" aria-hidden="true">
    <defs><clipPath id="${id}"><circle cx="20" cy="20" r="${r}"/></clipPath>
      <radialGradient id="${id}g" cx=".4" cy=".4" r=".7"><stop offset="0" stop-color="#fffbe8"/><stop offset="1" stop-color="#e3d6a6"/></radialGradient></defs>
    <circle cx="20" cy="20" r="${r}" fill="#2b2758" stroke="#6b63b8" stroke-width="1"/>
    ${f > 0 ? `<g clip-path="url(#${id})"><circle cx="20" cy="20" r="${r}" fill="url(#${id}g)"/>${f < 1 ? `<circle cx="${20 - shift}" cy="20" r="${r}" fill="#2b2758"/>` : ''}</g>` : ''}
  </svg>`;
}

function moonRow(count) {
  let html = '<div class="moon-row">';
  for (let i = 1; i <= FINALE_PRESTIGE; i++) html += moonSVG(i, count >= i ? 'lit' : 'dim');
  return html + '</div>';
}

function renderMoonBtn() {
  const P = G.state.prestige;
  $('#btn-moon').innerHTML = `${moonSVG(Math.min(P.count, FINALE_PRESTIGE))}<span class="moon-count">${fmt(P.stones)}</span>`;
  updateMoonBtn();
}
function updateMoonBtn() {
  const b = $('#btn-moon');
  const ready = G.canPrestige();
  b.classList.toggle('ready', ready);
  b.title = ready ? `Moon Shrine: a new night would bring +${G.stonesForRun()} Moonstones` : 'Moon Shrine';
  const c = $('.moon-count', b);
  if (c) c.textContent = fmt(G.state.prestige.stones);
}

function openShrine() {
  A.chime();
  $('#shrine').hidden = false;
  renderShrine();
}
function closeShrine() {
  $('#shrine').hidden = true;
}

function renderShrine() {
  renderPrestigeCard();
  const P = G.state.prestige;
  const paths = SHRINE_PATHS.map((p) => {
    const items = SHRINE.filter((u) => u.path === p.id);
    return `<div class="spath"><h3><span>${p.icon}</span> ${p.name} <small>${p.desc}</small></h3>
      ${items.map((u) => shrineCard(u)).join('')}</div>`;
  }).join('');
  const cap = SHRINE.find((u) => u.path === 'capstone');
  const capHTML = P.count >= cap.minPrestige || P.shrine[cap.id]
    ? `<div class="spath capstone">${shrineCard(cap)}</div>`
    : `<div class="spath capstone teaser"><div class="scard locked"><div><b>A final offering</b><div class="sdesc">Appears after your ${cap.minPrestige}th night.</div></div></div></div>`;
  $('#shrine-paths').innerHTML = paths + capHTML;
  for (const b of $$('#shrine-paths [data-buy]')) {
    b.addEventListener('click', () => {
      if (G.buyShrine(b.dataset.buy)) {
        A.build();
        toast(`🌙 ${SHRINE.find((u) => u.id === b.dataset.buy).name}`);
        G.save();
        renderShrine();
        renderMoonBtn();
        updateResBar();
        updateSceneRate();
        renderPanel();
        const fresh = G.checkAchievements();
        if (fresh.length) onAchievements(fresh);
      }
    });
  }
}

function shrineCard(u) {
  const P = G.state.prestige;
  const owned = !!P.shrine[u.id];
  const avail = G.shrineAvailable(u);
  const afford = P.stones >= u.cost;
  return `<div class="scard${owned ? ' owned' : !avail ? ' locked' : ''}">
    <div><b>${u.name}</b><div class="sdesc">${u.desc}</div></div>
    ${owned ? '<div class="check">✓</div>'
      : `<button class="sbuy" data-buy="${u.id}" ${avail && afford ? '' : 'disabled'}>${moonSVG(5, 'tiny')} ${u.cost}</button>`}
  </div>`;
}

function renderPrestigeCard() {
  const P = G.state.prestige;
  const card = $('#prestige-card');
  const finaleNext = G.isFinaleNext();
  card.innerHTML = `
    ${moonRow(P.count)}
    <div class="night">${G.inEndless() ? `Endless Night · ${P.count} nights` : P.count === 0 ? 'The moon is new' : `Night ${P.count + 1} of ${FINALE_PRESTIGE}`}</div>
    <div class="stones-held">${moonSVG(5, 'small')} <b id="pc-stones"></b> Moonstones <small id="pc-bonus"></small></div>
    <p class="pc-explain">Begin a new night to turn this night's gatherings into Moonstones. Spend them below on lasting gifts, or keep them: each unspent Moonstone adds +${Math.round(STONE_BONUS * 100)}% to everything.</p>
    <div class="pc-gain">A new night now brings <b id="pc-gain"></b></div>
    <div class="pc-bar"><i id="pc-bar"></i></div>
    <div class="pc-next" id="pc-next"></div>
    <button class="btn primary big" id="btn-prestige">${finaleNext ? '🌕 Call the full moon' : '🌙 Begin a new night'}</button>
    <details class="pc-details"><summary>What happens?</summary>
      <p><b>Resets:</b> all resources, helpers, upgrades, features and unlocked places (except those the Shrine keeps).</p>
      <p><b>Stays:</b> Moonstones, Moon Shrine gifts, achievements, stats and settings.</p>
    </details>`;
  $('#btn-prestige').addEventListener('click', doPrestige);
  updatePrestigeCard();
}

function updatePrestigeCard() {
  const P = G.state.prestige;
  const el = $('#pc-stones');
  if (!el) return;
  el.textContent = fmt(P.stones);
  $('#pc-bonus').textContent = P.stones ? `(+${Math.round(P.stones * STONE_BONUS * 100)}% while unspent)` : '';
  const n = G.stonesForRun();
  const lo = G.valueForStones(n), hi = G.valueForStones(n + 1);
  $('#pc-gain').textContent = `+${fmt(n)} Moonstones`;
  $('#pc-bar').style.width = `${Math.max(0, Math.min(1, (G.runValue() - lo) / (hi - lo))) * 100}%`;
  const meadow = G.state.locs.meadow.unlocked;
  $('#pc-next').textContent = G.hasBuff('bloodmoon') || G.state.blood.pending > 0 ? 'Wait for the Blood Moon to set.'
    : !meadow ? 'Unlock the Starfall Meadow to begin a new night.'
    : n < 1 ? 'Gather a little more to earn your first Moonstone.'
    : `Next Moonstone at ${Math.round(((G.runValue() - lo) / (hi - lo)) * 100)}%`;
  $('#btn-prestige').disabled = !G.canPrestige();
}

function doPrestige() {
  if (!G.canPrestige()) return;
  const n = G.stonesForRun();
  const finale = G.isFinaleNext();
  confirmModal(finale ? 'Call the full moon?' : 'Begin a new night?',
    `You'll gain ${n} Moonstones. Your resources, helpers, upgrades, features and places will reset.${finale ? ' This is the fifth night: the full moon will rise.' : ''}`,
    finale ? 'Call the moon' : 'Begin', () => {
      const r = G.prestige();
      if (!r) return;
      G.checkAchievements();
      G.save();
      closeShrine();
      knownUnlockable = new Set();
      tab = 'helpers';
      renderAll();
      if (r.finale) playFinale();
      else {
        moonriseFlash();
        A.fanfare();
        toast(`🌙 A new night begins. +${r.stones} Moonstones`);
        setTimeout(() => openShrine(), 1600);
      }
    });
}

function moonriseFlash() {
  const f = document.createElement('div');
  f.className = 'moonrise-flash';
  f.innerHTML = moonSVG(Math.min(G.state.prestige.count, FINALE_PRESTIGE), 'flash-moon');
  document.body.append(f);
  setTimeout(() => f.remove(), 2600);
}

function playFinale() {
  const el = $('#finale');
  el.hidden = false;
  el.classList.remove('play');
  void el.offsetWidth;
  el.classList.add('play');
  A.finale();
  const s = G.state;
  const lines = [
    'Five nights have passed.',
    'The pond shimmers. The ring glows. The old oak sings.',
    'Crystals hum beneath the hills, and the meadow is full of stars.',
    'The full moon rises over a realm restored.',
  ];
  const text = $('#finale-text');
  text.innerHTML = lines.map((l, i) => `<p style="animation-delay:${3 + i * 3.2}s">${l}</p>`).join('') + `
    <div class="finale-stats" style="animation-delay:${3 + lines.length * 3.2}s">
      <h2>The Realm Restored</h2>
      <div class="stats">
        <span>Time played</span><span>${fmtDuration(s.stats.playMs)}</span>
        <span>Taps</span><span>${fmt(s.stats.taps)}</span>
        <span>Events witnessed</span><span>${fmt(s.ev.count)}</span>
        <span>Achievements</span><span>${G.achievementCount()} / ${ACHIEVEMENTS.length}</span>
        <span>Moonstones earned</span><span>${fmt(s.prestige.lifetimeStones)}</span>
      </div>
      <p class="thanks">Thank you for tending the moonlit realm.<br>The night goes on, as long as you like.</p>
      <button class="btn primary big" id="btn-endless">Continue into the Endless Night</button>
    </div>`;
  $('#btn-endless').addEventListener('click', () => {
    s.prestige.finaleSeen = true;
    G.save();
    el.hidden = true;
    el.classList.remove('play');
    toast('🌕 Endless Night: keep gathering and prestiging as long as you like');
    renderAll();
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
  if (bloodView && !G.hasBuff('bloodmoon')) bloodView = false;
  document.body.classList.toggle('blood', G.hasBuff('bloodmoon'));
  A.setLocation(bloodView ? 'courtyard' : G.state.active);
  updateMuteBtn();
  renderResBar();
  renderLocTabs();
  renderScene();
  renderPanel();
  renderEvents();
  renderMoonBtn();
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
  setTimeout(() => t.remove(), 3000);
  while ($('#toasts').childElementCount > 2) $('#toasts').firstElementChild.remove();
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
let uiAccum = 0, saveAccum = 0, achAccum = 0;
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
    const happened = G.advance(dt);
    if (happened.started.length || happened.ended.length) onEventsChanged(happened);
    moveFairy(now);
    spawnMeteors(dt);
    uiAccum += dt; saveAccum += dt; achAccum += dt;
    if (achAccum >= 1) {
      achAccum = 0;
      const fresh = G.checkAchievements();
      if (fresh.length) onAchievements(fresh);
    }
    if (uiAccum >= 0.2) {
      uiAccum = 0;
      updateEvents();
      updateMoonBtn();
      if (bloodView) updateBloodPanel();
      if (!$('#shrine').hidden) updatePrestigeCard();
      if (!G.state.prestige.hinted && G.canPrestige()) {
        G.state.prestige.hinted = true;
        A.fanfare();
        toast('🌙 The Moon Shrine has awakened! Tap the glowing moon at the top to learn more.');
      }
      updateResBar();
      updatePanel();
      updateLocTabs();
      updateSceneRate();
      for (const l of LOCATIONS) {
        if (G.state.locs[l.id].unlocked) continue;
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
  $('#fairy').addEventListener('pointerdown', onFairyTap);
  $('#btn-moon').addEventListener('click', openShrine);
  $('#btn-shrine-close').addEventListener('click', closeShrine);
  // Stop long-press context menus and pinch-zoom gestures interfering with tapping.
  $('#scene-wrap').addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('gesturestart', (e) => e.preventDefault());

  renderTitle();
  requestAnimationFrame((t) => { last = t; tick(t); });
}

boot();
