// UI, input and the game loop.
import {
  RESOURCES, LOCATIONS, HELPERS, UPGRADES, FEATURES, LOCATION_BY_ID,
  EVENT_BY_ID, FAIRY_GIFTS, GIFT_BY_ID, ACHIEVEMENT_BONUS,
  SHRINE, SHRINE_PATHS, STONE_BONUS, FINALE_PRESTIGE, MILESTONES,
  WORKSHOP, WORKSHOP_GROUPS, WORKSHOP_BY_ID, LOTUS_EVERY, GATES, GATE_BY_ID, BLOOD_MOON_COOLDOWN_CUT_MIN,
  COSTUMES, COSTUME_SLOTS, costumeHint, COSTUME_BONUS, COSTUME_SETS, WEAR_SLOTS, TIME_BUFF, BORROWED_MULT, BORROWED_CAP_SEC, CUCKOO_SECS,
  SIMPLE_WORLDS, PEARL_STRAND_BONUS, SUN_SECS_PER_BEAM, SUN_BANK_CAP_H, HELPING_HANDS_MAX, HELPING_HANDS_SEC, HELPING_HAND_RATE,
} from './data.js?v=3.15.2';
import { ACHIEVEMENTS, ACHIEVEMENT_GROUPS } from './achievements.js?v=3.15.2';
import * as G from './game.js?v=3.15.2';
import { FAMILIARS, FAMILIAR_BY_ID, familiarSVG } from './familiars.js?v=3.15.2';
import { SCENES, CASTLE_WINDOWS } from './scenes.js?v=3.15.2';
import {
  avatarSVG, CROPS, SKINS, HAIR_COLORS, EYE_COLORS, WING_COLORS, HAIR_STYLES, EYE_STYLES, WING_STYLES, EAR_STYLES, NAMES, FACE_PAINTS, MOUTHS,
} from './avatar.js?v=3.15.2';
import { SPRITES, HELPER_VIS, MAX_VISIBLE_PER_HELPER, CALM_VISIBLE_PER_HELPER } from './sprites.js?v=3.15.2';

// Per-device display preferences (not part of the save, like sound settings).
const DISPLAY_KEY = 'fairyclicker.display';
const display = { lessBusy: false, hideFairy: false, chatter: 'chatty' }; // chatter: chatty | quiet | off
try { Object.assign(display, JSON.parse(localStorage.getItem(DISPLAY_KEY) || '{}')); } catch { /* ignore */ }
function saveDisplay() { try { localStorage.setItem(DISPLAY_KEY, JSON.stringify(display)); } catch { /* ignore */ } }
const spriteCap = () => (display.lessBusy ? CALM_VISIBLE_PER_HELPER : MAX_VISIBLE_PER_HELPER);
import * as A from './audio.js?v=3.15.2';

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
  $('#title-fairy').innerHTML = avatarSVG(G.state.avatar.look, { cls: 'idle' });
  const tm = $('#title-moons');
  const count = has ? G.state.prestige.count : 0;
  tm.hidden = count === 0;
  if (count) tm.innerHTML = moonRow(count) + `<div>${G.inEndless() ? `Endless Night · ${count} nights` : `Night ${count + 1} of ${FINALE_PRESTIGE}`}</div>`;
  $('#btn-continue').hidden = !has;
  $('#btn-new').textContent = has ? 'New Game' : 'Begin';
  $('#btn-new').classList.toggle('primary', !has);
  const card = $('#away-card');
  if (offlineSummary) {
    const byPlace = G.wl('lantern') > 0;
    const placeOf = (r) => LOCATIONS.find((l) => l.resource === r);
    const rows = Object.entries(offlineSummary.gained).map(([r, amt]) =>
      `<div class="row"><span>${icon(r)} ${byPlace ? `${placeOf(r).name} · ` : ''}${RESOURCES[r].name}</span><span>+${fmt(amt)}</span></div>`).join('');
    card.innerHTML = `<h2>While you were away (${fmtDuration(offlineSummary.awayMs)})</h2>${rows}
      ${offlineSummary.sunSec ? `<div class="note">☀️ Sunbeams doubled ${fmtDuration(offlineSummary.sunSec * 1000)} of it</div>` : ''}
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
  bloodView = G.visitActive();
  gateView = false;
  // Older saves: give the costumes of places already visited.
  const got = [];
  for (const l of LOCATIONS) if (G.state.locs[l.id].unlocked && l.id !== G.state.active) got.push(...G.grantPlaceCostume(l.id));
  if (G.state.gates.visits.castle) got.push(...G.grantPlaceCostume('castle'));
  got.push(...G.checkCostumeUnlocks());
  renderAll();
  if (got.length) onCostumes(got, true);
  if (!G.state.avatar.created) setTimeout(() => openWardrobe(true), 300);
  else if (G.state.blood.pending > 0) setTimeout(showBloodExchange, 400);
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
    if ((bloodView || gateView) && cls.includes('active')) cls.splice(cls.indexOf('active'), 1);
    return `<button class="${cls.join(' ')}" data-loc="${l.id}" ${l.soon ? 'disabled' : ''}>${l.name} ${right}</button>`;
  }).join('');
  if (G.state.gates.owned) {
    const ready = GATES.some((g) => !g.soon && G.canEnterGate(g.id));
    nav.insertAdjacentHTML('afterbegin', `<button class="loc-tab gates${gateView ? ' active' : ''}${ready ? ' ready' : ''}" data-loc="gates">🌀 Gate Room</button>`);
  }
  if (G.visitActive()) {
    const g = GATE_BY_ID[visitGate()];
    const cls = { castle: 'courtyard', clock: 'clockworks' }[g.id] || `world-${g.id}`;
    nav.insertAdjacentHTML('afterbegin', `<button class="loc-tab ${cls}${bloodView ? ' active' : ''}" data-loc="world">${g.icon} ${g.world}</button>`);
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
  if (id === 'world') {
    if (bloodView || !G.visitActive()) return;
    bloodView = true; gateView = false;
    if (GLOBAL_TABS.includes(tab)) tab = 'helpers';
    renderAll();
    return;
  }
  if (id === 'gates') {
    if (gateView || !G.state.gates.owned) return;
    gateView = true; bloodView = false;
    if (GLOBAL_TABS.includes(tab)) tab = 'helpers';
    renderAll();
    return;
  }
  if (G.state.active === id && !bloodView && !gateView) return;
  bloodView = false; gateView = false;
  G.state.active = id;
  renderAll();
}

function renderScene() {
  if (bloodView) {
    const g = visitGate();
    if (g === 'clock') renderClockworks(); else if (SIMPLE_WORLDS[g]) renderSimpleWorld(g); else renderCourtyard();
    return;
  }
  if (gateView) { renderGateRoom(); return; }
  const id = G.state.active;
  const l = LOCATION_BY_ID[id];
  const ls = G.state.locs[id];
  $('#scene').innerHTML = SCENES[id]();
  $('#scene-name').textContent = l.name;
  const tapEl = $('[data-tap]', $('#scene'));
  tapEl.addEventListener('pointerdown', onTap);
  updateSceneFeatures();
  updateSprites(true);
  requestAnimationFrame(placeHandsAtRest);
  if (ls.unlocked) {
    const got = G.grantPlaceCostume(id);
    if (got.length && G.state.avatar.created) onCostumes(got);
  }

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
    const g = visitGate(), back = `back in ${fmtClock(G.visitLeftMs() / 1000)}`;
    const W = SIMPLE_WORLDS[g];
    $('#scene-rate').innerHTML = g === 'clock' ? `⏳ ${fmt(G.state.clockw.secs)} Seconds · ${back}`
      : W ? `${W.icon} ${fmt(G.state.wv[g].amt)} ${W.currency} · ${back}`
      : `🩸 ${fmt(G.state.blood.drops)} Blood Drops · ${back}`;
    return;
  }
  if (gateView) {
    $('#scene-rate').textContent = 'Choose a gate to step through';
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
    const want = Math.min(owned, spriteCap());
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

// Which other world is being visited (if any), and the view id to tap in.
const visitGate = () => G.state.gates.visit?.gate || null;
const WORLD_VIEW = { castle: 'courtyard', clock: 'clockworks', palace: 'palace', clouds: 'clouds', hands: 'hands' };
const worldId = () => WORLD_VIEW[visitGate()] || 'courtyard';
const isWorld = (id) => Object.values(WORLD_VIEW).includes(id);
const viewId = () => (bloodView ? worldId() : gateView ? 'gates' : G.state.active);

function onTap(e) {
  e.preventDefault();
  const id = viewId();
  if (id === 'gates') return;
  if (isWorld(id) ? !G.visitActive() : !G.state.locs[id].unlocked) return;
  if (G.d().holdTap && !holds.has(e.pointerId)) {
    const target = e.currentTarget, x = e.clientX, y = e.clientY, pid = e.pointerId;
    let first = true;
    holds.set(pid, setInterval(() => {
      if (first) { first = false; return; } // wait a moment so a normal tap isn't doubled
      if (viewId() !== id || (isWorld(id) && !G.visitActive())) { clearInterval(holds.get(pid)); holds.delete(pid); return; }
      doTap(id, target, x, y);
    }, 166));
  }
  doTap(id, e.currentTarget, e.clientX, e.clientY);
}

function doTap(id, target, clientX, clientY, byHand = false) {
  const blood = id === 'courtyard', clock = id === 'clockworks', simple = SIMPLE_WORLDS[id] ? id : null;
  if (!byHand) { buildStreak(); fairyCast(); }
  const { value: v, echo, crit } = blood ? G.tapBlood() : clock ? G.tapClock() : simple ? G.tapWorld(simple) : G.tap(id, streakMult());
  // Hand taps are quieter so a fast hand doesn't drown everything out.
  if (!byHand || Math.random() < 0.3) { if (blood) A.bloodTap(echo); else if (clock) A.tick(echo); else if (simple) A.worldTap(simple, echo); else A.tap(id, echo); }
  if (crit) A.crit();
  if (byHand) G.state.stats2.handTaps++; else trackFrenzy();
  // Restart the bounce at most ~6 times a second so very fast tapping
  // (and enchanted/helping hands) doesn't make the target jitter.
  const nowMs = performance.now();
  if (!target._bumpAt || nowMs - target._bumpAt > 160) {
    target._bumpAt = nowMs;
    target.classList.remove('bump');
    void target.getBoundingClientRect();
    target.classList.add('bump');
  }

  const wrap = $('#scene-wrap').getBoundingClientRect();
  const x = clientX - wrap.left, y = clientY - wrap.top;
  const color = blood ? '#ff4a5a' : clock ? '#ffd27a' : simple ? SIMPLE_WORLDS[simple].color : RESOURCES[LOCATION_BY_ID[id].resource].color;
  const layer = $('#floaters');
  const f = document.createElement('div');
  f.className = 'floater';
  f.style.cssText = `left:${x}px;top:${y}px;color:${color}`;
  f.textContent = `+${fmt(v, 100)}${clock ? 's' : ''}${echo ? ' ×2' : ''}${crit ? ' ✦' : ''}`;
  if (echo) f.classList.add('echo');
  if (crit) f.classList.add('crit');
  if (byHand) f.classList.add('by-hand');
  layer.append(f);
  let rp = null;
  if (!byHand) {
    rp = document.createElement('div');
    rp.className = 'ripple';
    rp.style.cssText = `left:${x}px;top:${y}px;color:${color}`;
    layer.append(rp);
  }
  setTimeout(() => { f.remove(); rp?.remove(); }, 1000);
  // Keep the DOM light under very fast multi-finger tapping.
  while (layer.childElementCount > 60) layer.firstElementChild.remove();

  if (blood) { updateSceneRate(); updateBloodPanel(); return; }
  if (clock) { updateSceneRate(); updateClockPanel(); return; }
  if (simple) { updateSceneRate(); updateWorldPanel(); return; }
  if (G.state.locs[id].taps === 31) $('#tap-hint').classList.add('faded');
  updateResBar();
}

// ---------- panel ----------

let panelUpdaters = [];

function setTab(t) {
  tab = t;
  renderPanel();
}

// These tabs work everywhere, including the Gate Room and other worlds.
const GLOBAL_TABS = ['workshop', 'awards', 'settings'];

function renderPanel() {
  // In the Gate Room or another world, the place tabs show that room's own panel instead.
  const special = (bloodView || gateView) && !GLOBAL_TABS.includes(tab);
  for (const b of $$('.ptab')) b.classList.toggle('active', b.dataset.tab === tab && !special);
  const body = $('#panel-body');
  panelUpdaters = [];
  if (special && bloodView) {
    const g = visitGate();
    if (g === 'clock') renderClockPanel(body); else if (SIMPLE_WORLDS[g]) renderWorldPanel(body, g); else renderBloodPanel(body);
    return;
  }
  if (special) { renderGatePanel(body); return; }
  const id = G.state.active;
  const ls = G.state.locs[id];
  if (!['settings', 'awards', 'workshop'].includes(tab) && !ls.unlocked) {
    body.innerHTML = `<div class="empty">Unlock ${LOCATION_BY_ID[id].name} to see its ${tab}.</div>`;
    return;
  }
  ({ helpers: renderHelpers, upgrades: renderUpgrades, features: renderFeatures, workshop: renderWorkshop, awards: renderAwards, settings: renderSettings })[tab](body);
  updatePanel();
}

let almanacId = null;
function updatePanel() {
  almanacId = G.wl('almanac') && G.state.locs[G.state.active]?.unlocked ? G.almanacPick(G.state.active)?.id : null;
  for (const u of panelUpdaters) u();
  updateTabDots();
}

function updateTabDots() {
  const id = G.state.active;
  const ls = G.state.locs[id];
  const dots = {
    upgrades: ls.unlocked && UPGRADES.some((u) => u.loc === id && !ls.upgrades[u.id] && G.upgradeAvailable(u) && G.canAfford(G.upgradeCost(u))),
    features: ls.unlocked && FEATURES.some((f) => f.loc === id && !ls.features[f.id] && G.featureAvailable(f) && G.canAfford(G.featureCost(f))),
    workshop: WORKSHOP.some((w) => G.workshopAvailable(w.id) && G.canAfford(G.workshopCost(w.id))),
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
          <div class="name">${h.name} <span class="owned"></span><span class="perks"></span><span class="best" hidden>📖 Best value</span></div>
          <div class="desc">${h.desc}</div>
          <div class="meta"></div>
          <div class="ms-wrap"><div class="ms-bar"><i></i></div><div class="ms-label"></div></div>
        </div>
        <button class="buy"><span class="lbl"></span><span class="cost"></span></button>`;
      refs = { owned: $('.owned', card), meta: $('.meta', card), btn: $('.buy', card), lbl: $('.lbl', card), cost: $('.cost', card),
        perks: $('.perks', card), bar: $('.ms-bar i', card), msLabel: $('.ms-label', card), best: $('.best', card) };
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
      refs.best.hidden = almanacId !== h.id;
      card.classList.toggle('best-card', almanacId === h.id);
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
      <h3>Display</h3>
      <div class="style-row"><span>Helpers on screen</span>
        <div class="seg" role="group" aria-label="Helpers on screen">
          <button data-busy="lively" class="${display.lessBusy ? '' : 'on'}">✨ Lively</button>
          <button data-busy="calm" class="${display.lessBusy ? 'on' : ''}">🍃 Less busy</button>
        </div></div>
      <p class="style-note">Lively shows up to ${MAX_VISIBLE_PER_HELPER} of each helper; Less busy shows up to ${CALM_VISIBLE_PER_HELPER}. Helpers off screen still gather.</p>
      <div class="style-row"><span>Show my fairy &amp; familiar in places</span>
        <button class="toggle ${display.hideFairy ? '' : 'on'}" data-act="fairy">${display.hideFairy ? 'Off' : 'On'}</button></div>
      <div class="style-row"><span>Familiar chatter</span>
        <div class="seg" role="group" aria-label="Familiar chatter">
          <button data-chat="chatty" class="${display.chatter === 'chatty' ? 'on' : ''}">💬 Chatty</button>
          <button data-chat="quiet" class="${display.chatter === 'quiet' ? 'on' : ''}">🤫 Quiet</button>
          <button data-chat="off" class="${display.chatter === 'off' ? 'on' : ''}">Off</button>
        </div></div>
    </div>
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
        <span>Pearl Necklace</span><span>${G.pearlStrands()} strands (+${Math.round(G.pearlStrands() * PEARL_STRAND_BONUS * 100)}%)</span>
        <span>Sunny time stored</span><span>${fmtDuration(G.state.wv.clouds.bank * 1000)}</span>
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
  $('[data-act="fairy"]', body).addEventListener('click', (e) => {
    display.hideFairy = !display.hideFairy;
    saveDisplay();
    e.target.classList.toggle('on', !display.hideFairy);
    e.target.textContent = display.hideFairy ? 'Off' : 'On';
    renderAvatarUI();
  });
  for (const b of $$('[data-chat]', body)) {
    b.addEventListener('click', () => {
      display.chatter = b.dataset.chat;
      saveDisplay();
      for (const x of $$('[data-chat]', body)) x.classList.toggle('on', x === b);
      chatTimer = 3;
      if (display.chatter === 'off') hideBubble();
    });
  }
  for (const b of $$('[data-busy]', body)) {
    b.addEventListener('click', () => {
      display.lessBusy = b.dataset.busy === 'calm';
      saveDisplay();
      for (const x of $$('[data-busy]', body)) x.classList.toggle('on', x === b);
      updateSprites(true);
    });
  }
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
  petReact(pickOne(['Yay! An achievement!', 'You did it! 🎉', 'Ooh, shiny trophy!', 'I knew you could!']));
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
  if (b.kind === 'time') return TIME_BUFF;
  if (b.kind === 'hands') return { name: 'Helping Hands', icon: '🙌', desc: `${b.n} extra hand${b.n === 1 ? '' : 's'} tapping with you` };
  return b.kind === 'event' ? EVENT_BY_ID[b.id] : GIFT_BY_ID[b.id];
}

function onEventsChanged({ started, ended }) {
  let bloodChange = false;
  for (const id of started) {
    const e = EVENT_BY_ID[id];
    A.eventStart(id);
    if (id === 'bloodmoon') {
      bloodChange = true;
      bloodFlash();
      toast(`🩸 The Blood Moon rises! The Crimson Gate's cooldown shrinks by ${BLOOD_MOON_COOLDOWN_CUT_MIN} min, and castle visits give ×2 Blood Drops`);
    } else {
      toast(`${e.icon} ${e.name}! ${e.desc}`);
    }
  }
  for (const id of ended) {
    if (id === 'fairy') toast('🧚 The fairy flutters away…');
    if (id === 'bloodmoon') bloodChange = true;
  }
  G.save();
  if (bloodChange) {
    renderAll();
    return;
  }
  renderEvents();
  renderHands();
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
    <div class="gifts">${FAIRY_GIFTS.filter((g) => !g.bell || G.wl('bell')).map((g) => `<button class="gift" data-gift="${g.id}"><span class="gift-icon">${g.icon}</span><b>${g.name}</b><span>${g.desc}</span></button>`).join('')}</div></div>`;
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
  const catchIt = (cx, cy) => {
    if (!m.isConnected) return;
    const amt = G.catchStar();
    A.starCatch();
    const r = wrap.getBoundingClientRect();
    floatText(cx - r.left, cy - r.top, `+${fmt(amt)} ✦`, RESOURCES.stardust.color);
    m.remove();
    updateResBar();
  };
  m.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); catchIt(e.clientX, e.clientY); });
  m.addEventListener('animationend', () => m.remove());
  $('#event-layer').append(m);
  // Star Magnet: the star is pulled in and caught on its own.
  if (G.wl('magnet')) {
    setTimeout(() => {
      if (!m.isConnected) return;
      const b = m.getBoundingClientRect();
      m.classList.add('magnet');
      setTimeout(() => catchIt(b.left + b.width / 2, b.top + b.height / 2), 250);
    }, 600 + Math.random() * 700);
  }
}

function floatText(x, y, text, color) {
  const f = document.createElement('div');
  f.className = 'floater';
  f.style.cssText = `left:${x}px;top:${y}px;color:${color}`;
  f.textContent = text;
  $('#floaters').append(f);
  setTimeout(() => f.remove(), 1000);
}

// ---------- Workshop ----------

function renderWorkshop(body) {
  body.innerHTML = `<div class="section-head"><h3>Realm-wide upgrades · reset when you prestige</h3></div>` +
    WORKSHOP_GROUPS.map((g) => `<div class="ws-group"><h4>${g}</h4>${WORKSHOP.filter((w) => w.group === g).map((w) => `<div class="card ws" data-ws="${w.id}"></div>`).join('')}</div>`).join('');
  for (const w of WORKSHOP) {
    const card = $(`[data-ws="${w.id}"]`, body);
    const draw = () => {
      const l = G.wl(w.id);
      const maxed = l >= w.max;
      const locked = !maxed && !G.workshopAvailable(w.id);
      card.className = 'card ws' + (maxed ? ' done' : locked ? ' locked' : '');
      const lvl = w.max > 1 ? `<span class="lvl">Lv ${l}/${w.max}</span>` : l ? '<span class="lvl">Owned</span>' : '';
      const req = locked && w.req?.hand ? `<div class="meta"><span class="ms">Needs Enchanted Hand level ${w.req.hand}</span></div>` : '';
      const next = !maxed && l > 0 ? `<div class="meta">Next: ${w.next(l)}</div>` : '';
      let extra = '';
      if (w.id === 'steward' && l) {
        const st = G.state.settings;
        extra = `<div class="ws-controls">
          <button class="toggle ${st.steward ? 'on' : ''}" data-act="steward">${st.steward ? 'On' : 'Off'}</button>
          <div class="seg" role="group" aria-label="Steward mode">
            <button data-mode="cheapest" class="${st.stewardMode !== 'almanac' ? 'on' : ''}">Cheapest</button>
            <button data-mode="almanac" class="${st.stewardMode === 'almanac' ? 'on' : ''}" ${G.wl('almanac') ? '' : 'disabled title="Needs the Fairy Almanac"'}>📖 Follow the Almanac</button>
          </div></div>`;
      }
      card.innerHTML = `<div class="ws-main"><div class="ws-icon">${w.icon}</div><div>
          <div class="name">${w.name} ${lvl}</div><div class="desc">${w.desc(l)}</div>${next}${req}${extra}</div></div>
        ${maxed ? '<div class="check">✓ Maxed</div>' : `<button class="buy"><span class="lbl">${l ? 'Upgrade' : 'Buy'}</span>${costHTML(G.workshopCost(w.id))}</button>`}`;
      const btn = $('.buy', card);
      if (btn) btn.addEventListener('click', () => {
        if (!G.buyWorkshop(w.id)) return;
        A.build();
        toast(`${w.icon} ${w.name}${w.max > 1 ? ` level ${G.wl(w.id)}` : ''}!`);
        G.save();
        renderPanel(); // other cards can depend on this one (e.g. Almanac → Steward)
        renderHands();
        if (w.keep) { renderLocTabs(); toast('🌀 The Gate Room is open: find it at the start of the place tabs'); }
        updateResBar();
        updateSceneRate();
        updatePanel();
        const fresh = G.checkAchievements();
        if (fresh.length) onAchievements(fresh);
      });
      const tog = $('[data-act="steward"]', card);
      if (tog) tog.addEventListener('click', () => { G.state.settings.steward = !G.state.settings.steward; draw(); });
      for (const mb of $$('[data-mode]', card)) mb.addEventListener('click', () => { G.state.settings.stewardMode = mb.dataset.mode; draw(); });
    };
    draw();
    panelUpdaters.push(() => {
      const btn = $('.buy', card);
      if (btn) { btn.disabled = !G.workshopAvailable(w.id) || !G.canAfford(G.workshopCost(w.id)); refreshCost(btn); }
    });
  }
}

// --- Enchanted Hand(s): tap what you're tapping, wherever you are ---
const HAND_SVG = `<svg viewBox="0 0 64 64" aria-hidden="true">
  <defs><radialGradient id="hand-g" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#fff6ff"/><stop offset="1" stop-color="#c9a7ff"/></radialGradient></defs>
  <circle cx="32" cy="34" r="26" fill="#c9a7ff" opacity=".25"/>
  <path d="M28 6 a4 4 0 0 1 8 0 V28 l2 -1 a4 4 0 0 1 7 1 l1 1 a4 4 0 0 1 7 2 l0 2 a4 4 0 0 1 7 3 V44 q0 14 -14 16 H32 q-10 0 -14 -9 L10 36 a4 4 0 0 1 6 -5 l8 8 Z" fill="url(#hand-g)" stroke="#8f6ee6" stroke-width="2"/>
  <g fill="#fff8c0"><circle cx="12" cy="12" r="2"/><circle cx="52" cy="14" r="1.5"/><circle cx="56" cy="50" r="1.8"/></g>
</svg>`;

function renderHands() {
  const layer = $('#hands');
  const dd = G.d();
  const n = started ? dd.hands + dd.tempHands : 0;
  if (layer.childElementCount === n) { placeHandsAtRest(); return; }
  layer.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const h = document.createElement('div');
    h.className = 'hand' + (i % 2 ? ' twin' : '') + (i >= dd.hands ? ' temp' : '');
    h.innerHTML = HAND_SVG;
    layer.append(h);
  }
  placeHandsAtRest();
}

function tapTargetBox() {
  const t = $('#scene [data-tap]');
  if (!t) return null;
  const wr = $('#scene-wrap').getBoundingClientRect();
  const b = t.getBoundingClientRect();
  return { t, x: b.left - wr.left, y: b.top - wr.top, w: b.width, h: b.height, wr };
}

function placeHandsAtRest() {
  const box = tapTargetBox();
  if (!box) return;
  $$('#hands .hand').forEach((h, i) => {
    // Hands fan out around the target: two rows of up to five.
    const x = box.x + box.w * (0.18 + (i % 5) * 0.16), y = box.y + box.h * (0.55 + Math.floor(i / 5) * 0.2);
    h.style.transform = `translate(${x - 26}px, ${y - 4}px)${i % 2 ? ' scaleX(-1)' : ''}`;
  });
}

let handAccum = 0, handTurn = 0;
function tickHands(dt) {
  const dd = G.d();
  if ((!dd.hands && !dd.tempHands) || !$('#modal').hidden || !$('#shrine').hidden) return;
  const id = viewId();
  if (id === 'gates' || (isWorld(id) ? !G.visitActive() : !G.state.locs[id]?.unlocked)) return;
  // Helping Hands from High-Five Heights tap at least HELPING_HAND_RATE a second.
  handAccum += dt * (dd.handRate * dd.hands + Math.max(HELPING_HAND_RATE, dd.handRate) * dd.tempHands);
  let n = 0;
  while (handAccum >= 1 && n++ < 12) {
    handAccum -= 1;
    const box = tapTargetBox();
    if (!box) return;
    // Tap somewhere in the middle of the target.
    const x = box.x + box.w * (0.3 + Math.random() * 0.4), y = box.y + box.h * (0.4 + Math.random() * 0.35);
    const hands = $$('#hands .hand');
    const hand = hands[handTurn++ % hands.length];
    if (hand) {
      const twin = hand.classList.contains('twin');
      hand.style.transform = `translate(${x - 26}px, ${y - 4}px)${twin ? ' scaleX(-1)' : ''}`;
      hand.classList.remove('tapping'); void hand.offsetWidth; hand.classList.add('tapping');
    }
    doTap(id, box.t, box.wr.left + x, box.wr.top + y, true);
  }
}
window.addEventListener('resize', () => { if (started) placeHandsAtRest(); });

// --- Tap Streak: tap steadily to build a combo ---
let combo = 0, lastPlayerTap = 0;
function buildStreak() {
  if (!G.wl('streak')) return;
  const now = performance.now();
  combo = now - lastPlayerTap < 1000 ? combo + 1 : 1;
  lastPlayerTap = now;
}
function streakMult() {
  const max = G.d().streakMax;
  return max > 1 ? Math.min(max, 1 + combo * 0.02) : 1;
}
function tickStreak(dt) {
  const el = $('#streak');
  const max = G.d().streakMax;
  if (max <= 1) { el.hidden = true; return; }
  if (performance.now() - lastPlayerTap > 1200) combo = Math.max(0, combo - dt * 40);
  const m = streakMult();
  el.hidden = m < 1.04;
  if (!el.hidden) {
    $('.streak-label', el).textContent = `🔥 Streak ×${m.toFixed(2)}`;
    $('.streak-bar i', el).style.width = `${((m - 1) / (max - 1)) * 100}%`;
    el.classList.toggle('full', m >= max);
  }
}

// --- Golden Lotus: drifts across now and then ---
let lotusTimer = 60;
function tickLotus(dt) {
  const L = G.wl('lotus');
  if (!L || bloodView || gateView || $('#event-layer .lotus')) return;
  lotusTimer -= dt;
  if (lotusTimer > 0) return;
  lotusTimer = LOTUS_EVERY[L - 1] * (0.7 + Math.random() * 0.6);
  const wrap = $('#scene-wrap');
  const el = document.createElement('button');
  el.className = 'lotus';
  el.setAttribute('aria-label', 'Golden lotus');
  el.style.setProperty('--ly', `${20 + Math.random() * 45}%`);
  el.innerHTML = `<svg viewBox="-30 -24 60 44"><circle r="22" fill="#ffd24d" opacity=".25"/>
    ${[-60, -30, 0, 30, 60].map((a) => `<ellipse rx="6" ry="16" fill="#ffe27a" stroke="#d9a520" stroke-width="1" transform="rotate(${a}) translate(0 -8)"/>`).join('')}
    <circle r="5" fill="#fff6c8"/><ellipse cy="12" rx="20" ry="4" fill="#3f8f5e"/></svg>`;
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault(); e.stopPropagation();
    if (bloodView || gateView) return;
    const amt = G.catchLotus(G.state.active);
    A.lotus();
    const r = wrap.getBoundingClientRect();
    floatText(e.clientX - r.left, e.clientY - r.top, `🪷 +${fmt(amt)}`, '#ffd24d');
    toast(`🪷 Golden Lotus! +${fmt(amt)} ${RESOURCES[LOCATION_BY_ID[G.state.active].resource].name}`);
    el.remove();
    updateResBar();
  });
  el.addEventListener('animationend', () => el.remove());
  $('#event-layer').append(el);
  A.lotusAppear();
}

// --- Helper Steward: recruits at the place you're viewing ---
let stewardAccum = 0;
function tickSteward(dt) {
  if (!G.wl('steward') || !G.state.settings.steward || bloodView || gateView) return;
  stewardAccum += dt;
  if (stewardAccum < 2) return;
  stewardAccum = 0;
  const h = G.stewardTick(G.state.active);
  if (h) {
    if (Math.random() < 0.5) A.buy();
    updateSprites();
    updateSceneRate();
    updateResBar();
    if (tab === 'helpers') updatePanel();
  }
}

// --- Dracula peers out of the castle windows during the Blood Moon ---
let draculaTimer = 5, draculaHide = null;
function setupDracula() {
  draculaTimer = 3 + Math.random() * 4;
  for (const g of $$('#scene .dracula')) {
    g.addEventListener('pointerdown', (e) => {
      e.preventDefault(); e.stopPropagation();
      if (!g.classList.contains('show')) return;
      const v = G.biteBack();
      A.draculaHit();
      hideDracula();
      const r = $('#scene-wrap').getBoundingClientRect();
      floatText(e.clientX - r.left, e.clientY - r.top, `🩸 +${fmt(v)}`, '#ff4a5a');
      toast(`🧛 You startled Dracula! +${fmt(v)} Blood Drops`);
      updateSceneRate();
      updateBloodPanel();
    });
  }
}
function hideDracula() {
  clearTimeout(draculaHide);
  $$('#scene .dracula.show').forEach((g) => g.classList.remove('show'));
  $$('#scene .win.red').forEach((w) => w.classList.remove('red'));
}
function tickDracula(dt) {
  if (!bloodView || !G.visitActive() || visitGate() !== 'castle' || $('#scene .dracula.show')) return;
  draculaTimer -= dt;
  if (draculaTimer > 0) return;
  draculaTimer = 6 + Math.random() * 6;
  const i = Math.floor(Math.random() * CASTLE_WINDOWS.length);
  const g = $(`#scene .dracula[data-drac="${i}"]`);
  if (!g) return;
  g.classList.add('show');
  $(`#scene .win[data-win="${i}"]`)?.classList.add('red');
  A.draculaAppear();
  draculaHide = setTimeout(hideDracula, 1700);
}

// ---------- Gate Room ----------

let gateView = false; // showing the Gate Room

function gateSceneSVG() {
  const slots = [[204, 'hands'], [352, 'clouds'], [500, 'clock'], [648, 'castle'], [796, 'palace']];
  const stars = Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 97) % 1000}" cy="${(i * 53) % 260}" r="${(i % 3) * 0.6 + 0.6}" fill="#fff" opacity=".6"/>`).join('');
  return `<svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <linearGradient id="gr-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c0a26"/><stop offset="1" stop-color="#1c1846"/></linearGradient>
      <linearGradient id="gr-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2550"/><stop offset="1" stop-color="#110e2a"/></linearGradient>
      <radialGradient id="gr-castle"><stop offset="0" stop-color="#ff6a7a"/><stop offset=".55" stop-color="#a0142e"/><stop offset="1" stop-color="#3a0814"/></radialGradient>
      <radialGradient id="gr-clock"><stop offset="0" stop-color="#ffe08a"/><stop offset=".55" stop-color="#c07a20"/><stop offset="1" stop-color="#4a2a08"/></radialGradient>
      <radialGradient id="gr-palace"><stop offset="0" stop-color="#bff0ff"/><stop offset=".55" stop-color="#2a8ac0"/><stop offset="1" stop-color="#08304a"/></radialGradient>
      <radialGradient id="gr-hands"><stop offset="0" stop-color="#fff0d8"/><stop offset=".55" stop-color="#ff9f6a"/><stop offset="1" stop-color="#7a3418"/></radialGradient>
      <radialGradient id="gr-clouds"><stop offset="0" stop-color="#fff6ff"/><stop offset=".55" stop-color="#ffb3e0"/><stop offset="1" stop-color="#7a5aa8"/></radialGradient>
      <radialGradient id="gr-sealed"><stop offset="0" stop-color="#3a3a6a"/><stop offset="1" stop-color="#14122e"/></radialGradient>
      <radialGradient id="gr-glow"><stop offset="0" stop-color="#c9a7ff" stop-opacity=".5"/><stop offset="1" stop-color="#c9a7ff" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="1000" height="700" fill="url(#gr-bg)"/>
    <g>${stars}</g>
    <path d="M0 0 H1000 V90 Q500 30 0 90 Z" fill="#090720"/>
    ${[90, 360, 640, 910].map((x) => `<rect x="${x - 22}" y="60" width="44" height="480" fill="#1a1640" stroke="#2e2864" stroke-width="3"/>`).join('')}
    <rect y="540" width="1000" height="160" fill="url(#gr-floor)"/>
    <ellipse cx="500" cy="610" rx="420" ry="40" fill="none" stroke="#c9a7ff" stroke-opacity=".25" stroke-width="2"/>
    <g fill="none" stroke="#c9a7ff" stroke-opacity=".35" stroke-width="2" class="spin" style="transform-origin:500px 610px">
      <ellipse cx="500" cy="610" rx="300" ry="28" stroke-dasharray="6 18"/>
    </g>
    ${slots.map(([x, id]) => {
      const g = GATE_BY_ID[id];
      const sealed = g.soon;
      return `<g class="portal${sealed ? ' sealed' : ''}" data-gate="${id}">
        <circle cx="${x}" cy="380" r="150" fill="url(#gr-glow)" pointer-events="none" class="${sealed ? '' : 'pulse'}"/>
        <path d="M${x - 62} 560 V350 a62 62 0 0 1 124 0 V560 Z" fill="#2e2864" stroke="#5a50a8" stroke-width="5"/>
        <path class="portal-face" d="M${x - 51} 556 V354 a51 51 0 0 1 102 0 V556 Z" fill="url(#${sealed ? 'gr-sealed' : 'gr-' + id})"/>
        ${sealed
          ? `<g opacity=".75"><path d="M${x - 14} 418 v-12 a14 14 0 0 1 28 0 v12" fill="none" stroke="#7a72c8" stroke-width="5"/>
               <rect x="${x - 22}" y="416" width="44" height="34" rx="6" fill="#4a4290"/><circle cx="${x}" cy="430" r="5" fill="#14122e"/><rect x="${x - 2}" y="432" width="4" height="9" fill="#14122e"/></g>`
          : `<g fill="none" stroke="#ffd6dc" stroke-opacity=".6">
               <circle class="swirl" cx="${x}" cy="450" r="40" stroke-width="4" stroke-dasharray="30 22" style="transform-origin:${x}px 450px"/>
               <circle class="swirl rev" cx="${x}" cy="450" r="24" stroke-width="3" stroke-dasharray="18 14" style="transform-origin:${x}px 450px"/></g>
             ${{
               clock: `<circle cx="${x}" cy="510" r="22" fill="#fff8e6" opacity=".85"/><path d="M${x} 510 v-14 M${x} 510 h10" stroke="#4a2a08" stroke-width="3" stroke-linecap="round"/>`,
               castle: `<path d="M${x - 30} 520 l12 -40 l12 18 l12 -32 l12 26 l12 -12 l0 40 z" fill="#1a0610" opacity=".85"/>`,
               palace: `<path d="M${x - 26} 526 Q${x} 486 ${x + 26} 526 Z" fill="#ffb3d0" opacity=".9"/><circle cx="${x}" cy="514" r="8" fill="#fff"/>`,
               hands: `<text x="${x}" y="530" text-anchor="middle" font-size="40">✋</text>`,
               clouds: `<g fill="#fff" opacity=".95"><ellipse cx="${x}" cy="520" rx="30" ry="12"/><circle cx="${x - 12}" cy="510" r="12"/><circle cx="${x + 10}" cy="506" r="14"/></g>`,
             }[id] || ''}`}
        <rect class="portal-hit" x="${x - 64}" y="280" width="128" height="325" fill="transparent"/>
        <text x="${x}" y="592" text-anchor="middle" font-size="13" fill="#e6dcff" font-family="Quicksand, sans-serif" font-weight="700">${sealed ? 'Sealed' : g.world}</text>
        <text class="portal-status" x="${x}" y="618" text-anchor="middle" font-size="17" fill="#c9b6ff" font-family="Quicksand, sans-serif"></text>
      </g>`;
    }).join('')}
  </svg>`;
}

function renderGateRoom() {
  $('#scene').innerHTML = gateSceneSVG();
  $('#scene-name').textContent = 'Gate Room';
  const hint = $('#tap-hint');
  hint.textContent = '';
  hint.classList.add('faded');
  $('#lock-overlay').hidden = true;
  for (const p of $$('#scene .portal:not(.sealed)')) {
    p.addEventListener('pointerdown', (e) => { e.preventDefault(); tryEnterGate(p.dataset.gate); });
  }
  updateSceneRate();
  updateGates();
}

function renderGatePanel(body) {
  body.innerHTML = `<div class="section-head"><h3>Gates to other worlds</h3></div>
    <p class="gate-intro">Step through a gate for a short visit. When you come back, the gate rests for a while before it opens again, even while the game is closed.</p>
    ${GATES.map((g) => g.soon
      ? `<div class="card gate-card locked"><div class="ws-main"><div class="ws-icon">🔒</div><div><div class="name">Sealed Gate</div><div class="desc">A new world will open here in a future update.</div></div></div></div>`
      : `<div class="card gate-card" data-gcard="${g.id}"><div class="ws-main"><div class="ws-icon">${g.icon}</div><div>
          <div class="name">${g.world} <span class="lvl">${g.visitSec}s visit · ${g.cooldownMin} min rest</span></div>
          <div class="desc">${g.blurb}</div><div class="meta gate-status"></div></div></div>
          <button class="buy gate-enter" data-enter="${g.id}"><span class="lbl">Step through</span><span class="gate-btn-txt">Enter</span></button></div>`).join('')}`;
  for (const b of $$('[data-enter]', body)) b.addEventListener('click', () => tryEnterGate(b.dataset.enter));
  updateGates();
}

function gateStatus(id) {
  if (G.state.gates.visit) return G.state.gates.visit.gate === id ? 'You are visiting now' : 'Finish your current visit first';
  if (G.state.blood.pending > 0) return 'Exchange your Blood Drops first';
  const ms = G.gateReadyInMs(id);
  if (ms > 0) return `Resting · ready in ${fmtClock(ms / 1000)}`;
  return 'Ready to enter';
}

function updateGates() {
  for (const g of GATES) {
    if (g.soon) continue;
    const st = gateStatus(g.id);
    const ok = G.canEnterGate(g.id);
    const card = $(`[data-gcard="${g.id}"]`);
    if (card) {
      $('.gate-status', card).textContent = (G.hasBuff('bloodmoon') && g.id === 'castle' ? '🩸 Blood Moon: ×2 drops! · ' : '') + st;
      $('[data-enter]', card).disabled = !ok;
      card.classList.toggle('ready', ok);
    }
    const p = $(`#scene .portal[data-gate="${g.id}"]`);
    if (p) {
      p.classList.toggle('resting', !ok);
      $('.portal-status', p).textContent = ok ? '✨ Ready' : G.gateReadyInMs(g.id) > 0 ? `Ready in ${fmtClock(G.gateReadyInMs(g.id) / 1000)}` : '';
    }
  }
}

function tryEnterGate(id) {
  if (!G.enterGate(id)) { A.buy(); return; }
  A.portal();
  portalFlash(GATE_BY_ID[id].color);
  bloodView = true; gateView = false;
  if (GLOBAL_TABS.includes(tab)) tab = 'helpers';
  G.save();
  toast(`🌀 You step through the ${GATE_BY_ID[id].name}…`);
  setTimeout(renderAll, 350);
}

function onVisitEnd(res) {
  A.portal();
  portalFlash('#c9a7ff');
  bloodView = false;
  gateView = G.state.gates.owned;
  if (GLOBAL_TABS.includes(tab)) tab = 'helpers';
  G.save();
  renderAll();
  if (res?.gate === 'clock') showBorrowedTime(res);
  else if (SIMPLE_WORLDS[res?.gate]) showWorldResult(res);
  else if (G.state.blood.pending > 0) showBloodExchange();
}

function portalFlash(color) {
  const f = document.createElement('div');
  f.className = 'portal-flash';
  f.style.setProperty('--pc', color);
  document.body.append(f);
  setTimeout(() => f.remove(), 1200);
}

// ---------- Your fairy & the wardrobe ----------

function renderAvatarUI() {
  const look = G.state.avatar.look;
  const btn = $('#btn-avatar');
  btn.innerHTML = avatarSVG(look, { viewBox: CROPS.face }) + (Object.keys(G.state.avatar.fresh).length ? '<span class="dot"></span>' : '');
  const f = $('#my-fairy');
  f.hidden = !started || display.hideFairy;
  f.classList.toggle('in-gates', gateView); // in the Gate Room she floats above the portals
  if (!f.hidden) f.innerHTML = avatarSVG(look, { cls: 'idle' });
  $('#title-fairy').innerHTML = avatarSVG(look, { cls: 'idle' });
  // Familiar beside the fairy
  const pet = $('#my-pet');
  const pid = FAMILIAR_BY_ID[look.familiar] ? look.familiar : null;
  pet.hidden = f.hidden || !pid || petAway;
  pet.classList.toggle('in-gates', gateView);
  // A different familiar: clear the old one's speech bubble so lines never appear to come from the wrong pet.
  if (pet.dataset.who !== String(pid)) { hideBubble(); pet.dataset.who = String(pid); }
  if (!pet.hidden && pet.dataset.pet !== pid) { pet.innerHTML = familiarSVG(pid, 'idle'); pet.dataset.pet = pid; }
  if (pet.hidden) hideBubble();
  $('#title-pet').innerHTML = pid ? familiarSVG(pid, 'idle') : '';
}

let castAt = 0;
function fairyCast() {
  const f = $('#my-fairy');
  if (f.hidden) return;
  const now = performance.now();
  if (now - castAt < 400) return;
  castAt = now;
  f.classList.remove('cast'); void f.offsetWidth; f.classList.add('cast');
}

function onCostumes(list, quiet = false) {
  if (!list.length) return;
  if (!quiet) petReact(list.some((c) => c.slot === 'familiar') ? 'A new friend! Hello, hello!' : 'Ooh, new clothes! Try them on!');
  if (!quiet) A.chime();
  const names = list.map((c) => c.name);
  toast(`👗 New in your wardrobe: ${names.length > 3 ? `${names.slice(0, 3).join(', ')} and ${names.length - 3} more` : names.join(', ')}`);
  G.save();
  renderAvatarUI();
  if (!$('#wardrobe').hidden) renderWardrobe();
}

let wdTab = 'body', wdCreate = false;
function openWardrobe(create) {
  wdCreate = create;
  wdTab = 'body';
  $('#wd-title').textContent = create ? (G.state.stats.taps ? 'Meet your fairy' : 'Create your fairy') : 'Wardrobe';
  $('#wd-sub').textContent = create ? 'This is you! Choose how you look. You can change it any time from the portrait at the top.' : 'Change your look any time. Visit new places and reach milestones to unlock more clothes.';
  $('#btn-wd-done').textContent = create ? 'Begin ✨' : 'Done';
  $('#wardrobe').hidden = false;
  hideBubble();
  A.chime();
  renderWardrobe();
}
function closeWardrobe() {
  $('#wardrobe').hidden = true;
  // Clothing bonuses may have changed
  updateResBar(); updateSceneRate(); updatePanel();
  if (!G.state.avatar.created) G.state.avatar.created = true;
  G.save();
  renderAvatarUI();
  if (G.state.blood.pending > 0) setTimeout(showBloodExchange, 300);
}

function renderWardrobe() {
  const look = G.state.avatar.look;
  $('#wd-fairy').innerHTML = avatarSVG(look, { cls: 'idle' });
  // What the current outfit gives
  const worn = WEAR_SLOTS.map((sl) => COSTUME_BONUS[look[sl]]?.[0]).filter(Boolean);
  const sets = G.wornSets().map((p) => COSTUME_SETS[p][0]);
  $('#wd-bonus').innerHTML = `<h4>Outfit bonuses</h4>` + (worn.length || sets.length
    ? worn.map((t) => `<div>✦ ${t}</div>`).join('') + sets.map((t) => `<div class="set">★ ${t}</div>`).join('')
    : '<div class="muted">Wear clothes to get small bonuses.</div>') +
    '<div class="muted small">Wear every piece from one place for a set bonus.</div>';
  for (const b of $$('[data-wtab]')) b.classList.toggle('on', b.dataset.wtab === wdTab);
  const list = $('#wd-list');
  const thumb = (patch, crop, on, attrs, extra = '') =>
    `<button class="wd-thumb${on ? ' on' : ''}" ${attrs}>${avatarSVG({ ...look, ...patch }, { viewBox: crop })}${extra}</button>`;
  const swatches = (key, colors) => `<div class="wd-swatches">${colors.map((c, i) =>
    `<button class="wd-swatch${look[key] === i ? ' on' : ''}" style="background:${c}" data-look="${key}" data-val="${i}" aria-label="Colour ${i + 1}"></button>`).join('')}</div>`;
  const styles = (key, opts, crop) => `<div class="wd-grid">${opts.map((o) =>
    thumb({ [key]: o }, crop, look[key] === o, `data-look="${key}" data-val="${o}" aria-label="${NAMES[o]}"`, `<span>${NAMES[o]}</span>`)).join('')}</div>`;

  if (wdTab === 'body') {
    list.innerHTML = `
      <h4>Skin</h4>${swatches('skin', SKINS)}
      <h4>Hair</h4>${styles('hair', HAIR_STYLES, CROPS.hair)}${swatches('hairColor', HAIR_COLORS)}
      <h4>Eyes</h4>${styles('eyes', EYE_STYLES, CROPS.eyes)}${swatches('eyeColor', EYE_COLORS)}
      <h4>Expression</h4>${styles('mouth', MOUTHS, CROPS.face)}
      <h4>Wings</h4>${styles('wings', WING_STYLES, CROPS.wings)}${swatches('wingColor', WING_COLORS)}
      <h4>Ears</h4>${styles('ears', EAR_STYLES, CROPS.ears)}
      <h4>Extras</h4><div class="wd-toggles">
        <button class="toggle ${look.blush ? 'on' : ''}" data-flag="blush">Rosy cheeks</button>
        <button class="toggle ${look.freckles ? 'on' : ''}" data-flag="freckles">Freckles</button></div>`;
  } else if (wdTab === 'paint') {
    list.innerHTML = `<h4>Face paint</h4><p class="wd-note">A little sparkle for special nights. Free to change any time.</p>${styles('paint', FACE_PAINTS, CROPS.face)}`;
  } else if (wdTab === 'pets') {
    const owned = G.state.avatar.owned, fresh = G.state.avatar.fresh;
    const pets = COSTUMES.filter((c) => c.slot === 'familiar');
    const have = pets.filter((c) => owned[c.id] && c.id !== 'none_pet').length;
    list.innerHTML = `<h4>Familiars <small>${have}/${pets.length - 1}</small></h4>
      <p class="wd-note">A little friend who sits beside you and chats now and then. Tap them in a place to say hello!</p>
      <div class="wd-grid pets">${pets.map((c) => {
        const own = !!owned[c.id];
        const art = c.id === 'none_pet' ? '<div class="no-pet">✕</div>' : familiarSVG(c.id);
        return `<button class="wd-thumb${look.familiar === c.id ? ' on' : ''}" data-wear="${c.id}" ${own ? '' : 'disabled'} title="${own ? c.name : costumeHint(c)}">
          ${art}<span>${own ? c.name : '🔒 ' + costumeHint(c)}</span>${fresh[c.id] ? '<i class="new">New</i>' : ''}</button>`;
      }).join('')}</div>`;
  } else {
    const owned = G.state.avatar.owned, fresh = G.state.avatar.fresh;
    list.innerHTML = COSTUME_SLOTS.map((slot) => {
      const items = COSTUMES.filter((c) => c.slot === slot.id);
      const have = items.filter((c) => owned[c.id]).length;
      return `<h4>${slot.name} <small>${have}/${items.length}</small></h4><div class="wd-grid">${items.map((c) => {
        const own = !!owned[c.id];
        return thumb({ [slot.id]: c.id }, CROPS[slot.id], look[slot.id] === c.id,
          `data-wear="${c.id}" ${own ? '' : 'disabled'} title="${own ? c.name : costumeHint(c)}"`,
          `<span>${own ? c.name : '🔒 ' + costumeHint(c)}</span>${COSTUME_BONUS[c.id] ? `<em>${COSTUME_BONUS[c.id][0]}</em>` : ''}${fresh[c.id] ? '<i class="new">New</i>' : ''}`);
      }).join('')}</div>`;
    }).join('');
  }
  for (const b of $$('[data-look]', list)) {
    b.addEventListener('click', () => {
      const v = b.dataset.val;
      G.setLook(b.dataset.look, /^\d+$/.test(v) ? +v : v);
      A.buy();
      renderWardrobe();
    });
  }
  for (const b of $$('[data-flag]', list)) {
    b.addEventListener('click', () => { G.setLook(b.dataset.flag, !look[b.dataset.flag]); A.buy(); renderWardrobe(); });
  }
  for (const b of $$('[data-wear]', list)) {
    b.addEventListener('click', () => { if (G.wearItem(b.dataset.wear)) { A.chime(); renderWardrobe(); renderAvatarUI(); } });
  }
  // Viewing the clothes or familiars tab clears the "new" markers.
  if (wdTab === 'clothes' || wdTab === 'pets') setTimeout(() => { G.state.avatar.fresh = {}; renderAvatarUI(); }, 0);
}

function surpriseMe() {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const idx = (arr) => Math.floor(Math.random() * arr.length);
  const L = G.state.avatar.look;
  Object.assign(L, {
    skin: idx(SKINS), hair: pick(HAIR_STYLES), hairColor: idx(HAIR_COLORS), eyes: pick(EYE_STYLES), eyeColor: idx(EYE_COLORS),
    wings: pick(WING_STYLES), wingColor: idx(WING_COLORS), ears: pick(EAR_STYLES), blush: Math.random() < 0.7, freckles: Math.random() < 0.3,
    paint: Math.random() < 0.4 ? pick(FACE_PAINTS) : 'none',
    mouth: Math.random() < 0.5 ? 'smile' : pick(MOUTHS),
  });
  for (const slot of COSTUME_SLOTS) {
    const owned = COSTUMES.filter((c) => c.slot === slot.id && G.state.avatar.owned[c.id] && !c.id.startsWith('none'));
    if (owned.length) L[slot.id] = pick(owned).id;
  }
  A.fanfare();
  renderWardrobe();
  renderAvatarUI();
}

// ---------- Cuckoo Clockworks ----------

function renderClockworks() {
  $('#scene').innerHTML = SCENES.clockworks();
  const got = G.grantPlaceCostume('clock');
  if (got.length) setTimeout(() => onCostumes(got), 600);
  requestAnimationFrame(placeHandsAtRest);
  $('#scene-name').textContent = 'Cuckoo Clockworks';
  $('[data-tap]', $('#scene')).addEventListener('pointerdown', onTap);
  const bird = $('#scene .cuckoo');
  bird.addEventListener('pointerdown', (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!bird.classList.contains('show')) return;
    const v = G.catchCuckoo();
    A.cuckoo();
    hideCuckoo();
    const r = $('#scene-wrap').getBoundingClientRect();
    floatText(e.clientX - r.left, e.clientY - r.top, `⏳ +${v}s`, '#ffd27a');
    toast(`🐦 Cuckoo! +${v} Seconds`);
    updateSceneRate();
    updateClockPanel();
  });
  cuckooTimer = 4 + Math.random() * 3;
  const hint = $('#tap-hint');
  hint.textContent = 'Tap the clock';
  hint.classList.remove('faded');
  $('#lock-overlay').hidden = true;
  updateSceneRate();
}

let cuckooTimer = 5, cuckooHide = null;
function hideCuckoo() {
  clearTimeout(cuckooHide);
  $('#scene .cuckoo')?.classList.remove('show');
  $$('#scene .cuckoo-door').forEach((d) => d.classList.remove('open'));
}
function tickCuckoo(dt) {
  if (!bloodView || visitGate() !== 'clock' || !G.visitActive() || $('#scene .cuckoo.show')) return;
  cuckooTimer -= dt;
  if (cuckooTimer > 0) return;
  cuckooTimer = 7 + Math.random() * 6;
  const bird = $('#scene .cuckoo');
  if (!bird) return;
  $$('#scene .cuckoo-door').forEach((d) => d.classList.add('open'));
  bird.classList.add('show');
  A.cuckoo();
  cuckooHide = setTimeout(hideCuckoo, 1800);
}

function renderClockPanel(body) {
  body.innerHTML = `<div class="blood-panel clock-panel">
    <h3>⏰ The Cuckoo Clockworks</h3>
    <div class="blood-count"><b id="cp-secs">0</b> Seconds collected</div>
    <div class="buff-bar"><i id="cp-bar"></i></div>
    <div class="bp-time" id="cp-time"></div>
    <p id="cp-chimes"></p>
    <p>Tap the clock and catch the cuckoo when it pops out. When the gate pulls you home, your Seconds become <b>Borrowed Time</b>: everything ×${BORROWED_MULT} for that many seconds (up to ${BORROWED_CAP_SEC / 60} minutes in total).</p>
    <div class="bp-rates"><div id="cp-preview"></div></div>
  </div>`;
  updateClockPanel();
}

function updateClockPanel() {
  const el = $('#cp-secs');
  if (!el) return;
  const C = G.state.clockw;
  el.textContent = fmt(C.secs);
  const v = G.state.gates.visit;
  if (v) {
    const left = G.visitLeftMs() / 1000;
    $('#cp-bar').style.width = `${(left / GATE_BY_ID[v.gate].visitSec) * 100}%`;
    $('#cp-time').textContent = `The gate pulls you home in ${fmtClock(left)}`;
  }
  $('#cp-chimes').textContent = G.hasBuff('chimes') ? '🕛 Midnight Chimes: every Second counts double!' : '';
  const total = Math.min(BORROWED_CAP_SEC, G.borrowedLeft() + C.secs);
  $('#cp-preview').textContent = `⏳ Borrowed Time so far: ${fmtDuration(total * 1000)} of everything ×${BORROWED_MULT}`;
}

function showBorrowedTime(res) {
  const m = $('#modal');
  const left = G.borrowedLeft();
  m.innerHTML = `<div class="modal-card clock-card" role="dialog" aria-modal="true">
    <h2>⏳ Borrowed Time</h2>
    <p>You collected <b>${fmt(res.secs)}</b> Seconds in the Clockworks.</p>
    ${res.added > 0
      ? `<p class="big-line">Everything ×${BORROWED_MULT} for <b>${fmtDuration(left * 1000)}</b></p>
         ${res.added < res.secs ? `<p class="small">Borrowed Time is capped at ${BORROWED_CAP_SEC / 60} minutes.</p>` : ''}`
      : '<p>No Seconds this time. Tap the clock on your next visit!</p>'}
    <p class="small">It counts down while you play.</p>
    <div class="row"><button class="btn primary" data-ok>Wonderful!</button></div></div>`;
  m.hidden = false;
  if (res.added > 0) A.fanfare();
  $('[data-ok]', m).addEventListener('click', () => { m.hidden = true; m.innerHTML = ''; });
  renderEvents();
  updateResBar();
  updateSceneRate();
}

// ---------- Sunken Palace & Cloud Isles ----------

function renderSimpleWorld(g) {
  const W = SIMPLE_WORLDS[g], gate = GATE_BY_ID[g];
  $('#scene').innerHTML = SCENES[W.scene]();
  const got = G.grantPlaceCostume(g);
  if (got.length) setTimeout(() => onCostumes(got), 600);
  requestAnimationFrame(placeHandsAtRest);
  $('#scene-name').textContent = gate.world;
  $('[data-tap]', $('#scene')).addEventListener('pointerdown', onTap);
  const pop = $('#scene .popup');
  pop.addEventListener('pointerdown', (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!pop.classList.contains('show')) return;
    const v = G.catchVisitor(g);
    A.visitor(g);
    hideVisitor();
    const r = $('#scene-wrap').getBoundingClientRect();
    floatText(e.clientX - r.left, e.clientY - r.top, `${W.icon} +${v}`, W.color);
    toast({ palace: `🧜 The mermaid gives you ${v} Pearls!`, clouds: `🐋 The cloud whale showers you with ${v} Sunbeams!`, hands: `🤚 The shy hand gives you a secret high-five! +${v}` }[g]);
    updateSceneRate();
    updateWorldPanel();
  });
  visitorTimer = 4 + Math.random() * 3;
  const hint = $('#tap-hint');
  hint.textContent = { palace: 'Tap the giant clam', clouds: 'Tap the rainbow cloud', hands: 'High-five the big hand!' }[g];
  hint.classList.remove('faded');
  $('#lock-overlay').hidden = true;
  updateSceneRate();
}

let visitorTimer = 5, visitorHide = null;
function hideVisitor() {
  clearTimeout(visitorHide);
  $('#scene .popup')?.classList.remove('show');
}
function tickVisitor(dt) {
  const g = visitGate();
  if (!bloodView || !SIMPLE_WORLDS[g] || !G.visitActive() || $('#scene .popup.show')) return;
  visitorTimer -= dt;
  if (visitorTimer > 0) return;
  visitorTimer = 8 + Math.random() * 6;
  const pop = $('#scene .popup');
  if (!pop) return;
  pop.classList.add('show');
  A.visitor(g);
  visitorHide = setTimeout(hideVisitor, g === 'clouds' ? 4500 : 2000);
}

function renderWorldPanel(body, g) {
  const W = SIMPLE_WORLDS[g], gate = GATE_BY_ID[g];
  const explain = g === 'hands'
    ? `High-five the big hand and catch the shy hand when it peeks up. Every few high-fives earns a <b>helping hand</b> (up to ${HELPING_HANDS_MAX}). Each one needs more than the last. When the gate pulls you home, they tap with you for <b>${HELPING_HANDS_SEC / 60} minutes</b>.`
    : g === 'palace'
    ? `Tap the clam and catch the mermaid when she peeks out. When the gate pulls you home, your Pearls are strung onto your <b>Pearl Necklace</b>. Every strand is <b>+${Math.round(PEARL_STRAND_BONUS * 100)}% to everything, forever</b>, even through prestiges.`
    : `Tap the rainbow cloud and catch the cloud whale as it drifts by. Each Sunbeam stores <b>${SUN_SECS_PER_BEAM} seconds of double offline earnings</b> (up to ${SUN_BANK_CAP_H} hours), used up the next time you're away.`;
  body.innerHTML = `<div class="blood-panel world-panel ${g}" data-world="${g}">
    <h3>${gate.icon} The ${gate.world}</h3>
    <div class="blood-count"><b id="wp-amt">0</b> ${W.currency} collected</div>
    <div class="buff-bar"><i id="wp-bar"></i></div>
    <div class="bp-time" id="wp-time"></div>
    <p id="wp-event"></p>
    <p>${explain}</p>
    <div class="bp-rates"><div id="wp-preview"></div></div>
  </div>`;
  updateWorldPanel();
}

function updateWorldPanel() {
  const panel = $('.world-panel');
  if (!panel) return;
  const g = panel.dataset.world, W = G.state.wv[g];
  $('#wp-amt').textContent = fmt(W.amt);
  const v = G.state.gates.visit;
  if (v) {
    const left = G.visitLeftMs() / 1000;
    $('#wp-bar').style.width = `${(left / GATE_BY_ID[v.gate].visitSec) * 100}%`;
    $('#wp-time').textContent = `The gate pulls you home in ${fmtClock(left)}`;
  }
  const ev = SIMPLE_WORLDS[g].event;
  $('#wp-event').textContent = G.hasBuff(ev) ? `${EVENT_BY_ID[ev].icon} ${EVENT_BY_ID[ev].name}: every ${SIMPLE_WORLDS[g].currency.slice(0, -1)} counts double!` : '';
  if (g === 'hands') {
    const n = G.helpingHandsFor(W.amt);
    const next = n < HELPING_HANDS_MAX ? G.highFivesFor(n + 1) - W.amt : 0;
    $('#wp-preview').innerHTML = `<div class="hand-row">${Array.from({ length: HELPING_HANDS_MAX }, (_, i) => `<span class="${i < n ? 'on' : ''}">✋</span>`).join('')}</div>` +
      (n < HELPING_HANDS_MAX ? `${n} helping hand${n === 1 ? '' : 's'} · next in <b>${fmt(next)}</b> high-fives` : '<b>All 8 helping hands earned!</b>');
  } else if (g === 'palace') {
    const now = G.pearlStrands(), after = G.pearlStrands(W.strung + W.amt);
    const next = G.pearlsForStrands(after + 1) - (W.strung + W.amt);
    $('#wp-preview').innerHTML = `📿 Necklace: ${now} strand${now === 1 ? '' : 's'} (+${Math.round(now * PEARL_STRAND_BONUS * 100)}%)` +
      (after > now ? ` → <b>${after}</b> after this visit` : '') + ` · next strand in ${fmt(next)} Pearls`;
  } else {
    const bank = Math.min(G.sunBankCap(), W.bank + W.amt * SUN_SECS_PER_BEAM);
    $('#wp-preview').textContent = `☀️ Sunny time stored: ${fmtDuration(bank * 1000)} of double offline earnings`;
  }
}

function showWorldResult(res) {
  const m = $('#modal');
  const W = SIMPLE_WORLDS[res.gate];
  let inner;
  if (res.gate === 'hands') {
    inner = `<h2>🙌 Helping Hands</h2>
      <p>You landed <b>${fmt(res.amt)}</b> high-fives in High-Five Heights.</p>
      <div class="hand-row">${Array.from({ length: HELPING_HANDS_MAX }, (_, i) => `<span class="${i < res.n ? 'on' : ''}">✋</span>`).join('')}</div>
      ${res.n > 0 ? `<p class="big-line"><b>${res.n}</b> helping hand${res.n === 1 ? '' : 's'} will tap with you for <b>${HELPING_HANDS_SEC / 60} minutes</b></p>`
        : `<p>Not quite enough for a helping hand. ${G.highFivesFor(1)} high-fives earns the first!</p>`}`;
    renderHands();
  } else if (res.gate === 'palace') {
    const gained = res.after - res.before;
    const beads = Math.min(res.after, 40);
    inner = `<h2>📿 Your Pearl Necklace</h2>
      <p>You gathered <b>${fmt(res.amt)}</b> Pearls in the Sunken Palace.</p>
      <div class="necklace">${'<i></i>'.repeat(beads)}</div>
      ${gained > 0
        ? `<p class="big-line">+${gained} strand${gained === 1 ? '' : 's'}! Everything is now <b>+${Math.round(res.after * PEARL_STRAND_BONUS * 100)}%</b>, forever</p>`
        : `<p class="big-line">${res.after} strand${res.after === 1 ? '' : 's'} (+${Math.round(res.after * PEARL_STRAND_BONUS * 100)}%)</p>
           <p class="small">${fmt(G.pearlsForStrands(res.after + 1) - G.state.wv.palace.strung)} more Pearls for the next strand.</p>`}`;
  } else {
    inner = `<h2>☀️ Sunny Days Ahead</h2>
      <p>You gathered <b>${fmt(res.amt)}</b> Sunbeams on the Cloud Isles.</p>
      <p class="big-line">Your next <b>${fmtDuration(res.bank * 1000)}</b> away earns <b>double</b></p>
      ${res.added < res.amt * SUN_SECS_PER_BEAM ? `<p class="small">Sunny time is capped at ${SUN_BANK_CAP_H} hours.</p>` : ''}`;
  }
  m.innerHTML = `<div class="modal-card world-card ${res.gate}" role="dialog" aria-modal="true">${inner}
    <div class="row"><button class="btn primary" data-ok>Lovely!</button></div></div>`;
  m.hidden = false;
  if (res.amt > 0) A.fanfare();
  $('[data-ok]', m).addEventListener('click', () => { m.hidden = true; m.innerHTML = ''; });
  updateResBar();
  updateSceneRate();
}

// ---------- Familiars & their chatter ----------

const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
let chatTimer = 12, lastLine = '', bubbleHide = null;

function currentPet() {
  const id = G.state.avatar.look.familiar;
  return FAMILIAR_BY_ID[id] && !$('#my-pet').hidden ? FAMILIAR_BY_ID[id] : null;
}

const PLACE_LINES = {
  pond: ['The moon looks lovely in the water.', 'Listen… the frogs are singing.', 'Splashy splashy!'],
  mushroom: ['The toadstools are glowing extra bright!', 'Mushrooms! Do not eat the purple ones.', 'I can hear the fae dancing.'],
  oak: ['This tree is older than the moon. Maybe.', 'Smells like warm honey here.', 'Hello, Mister Oak!'],
  grotto: ['Everything sparkles! Even me!', 'Hello… hello… hello… (echo!)', 'Crystals hum if you listen closely.'],
  meadow: ['A shooting star! Make a wish!', 'The stars feel close enough to touch.', 'Shall we lie in the grass and count stars?'],
  courtyard: ['Is it just me, or is it chilly in here?', 'Keep an eye on those windows…', 'So. Much. Red.'],
  clockworks: ['Tick… tock… tick…', 'Catch the cuckoo!', 'Every tap is a second saved!'],
  palace: ['Bubbles!', 'I think the mermaid likes you.', 'Every pearl makes the necklace longer!'],
  hands: ['Up top!', 'So many hands… none of them are mine.', 'High five! …I have paws.'],
  hands: ['Up top!', 'So many hands… none of them are mine.', 'High five! …I have paws.'],
  clouds: ['Wheee, so high up!', 'Look, a whale in the sky!', 'Soft as… well, a cloud.'],
  gates: ['So many doors… where to?', 'Each gate smells different. This one smells like adventure.'],
};
const EVENT_LINES = {
  moonrise: 'The moon is blessing us! Everything doubles!', rain: 'Pitter-patter… the pond loves the rain.',
  sporebloom: 'Spores everywhere! Tap the toadstool!', meteor: 'Shooting stars! Quick, tap them!',
  owlcouncil: 'The owls are meeting. Helpers are cheaper!', fog: 'Spooky fog… but our taps feel stronger!',
  fairy: 'Look! A fairy! Catch her!', bloodmoon: 'The moon turned red… the castle calls.',
  chimes: 'Midnight! The clock gate is waking up.', hightide: 'High tide! Pearls galore!', rainbow: 'A rainbow! The sky gate shines.',
  applause: 'Everyone’s clapping! The Palm Gate wants a high-five!',
};

// Helpful things worth mentioning right now.
function helpfulLines() {
  const out = [];
  const ev = G.activeEvent();
  if (ev && EVENT_LINES[ev.id]) out.push(EVENT_LINES[ev.id]);
  if (G.borrowedLeft() > 0) out.push('Borrowed Time! Everything is extra speedy!');
  if (G.canPrestige()) out.push('The moon is calling… a new night awaits.');
  if (G.state.gates.owned && !G.state.gates.visit && GATES.some((g) => !g.soon && G.canEnterGate(g.id))) out.push('A gate is ready to visit!');
  const id = G.state.active, ls = G.state.locs[id];
  if (!bloodView && !gateView && ls?.unlocked) {
    if (UPGRADES.some((u) => u.loc === id && !ls.upgrades[u.id] && G.upgradeAvailable(u) && G.canAfford(G.upgradeCost(u)))) out.push('Ooh, we can afford an upgrade!');
    if (FEATURES.some((f) => f.loc === id && !ls.features[f.id] && G.featureAvailable(f) && G.canAfford(G.featureCost(f)))) out.push('We could build something new here!');
  }
  if (WORKSHOP.some((w) => G.workshopAvailable(w.id) && G.canAfford(G.workshopCost(w.id)))) out.push('The Workshop has something for us!');
  for (const l of LOCATIONS) if (!G.state.locs[l.id].unlocked && G.canAfford(l.unlockCost)) { out.push(`We can open the ${l.name}!`); break; }
  return out;
}

function chooseLine(pet) {
  const help = helpfulLines();
  const place = PLACE_LINES[viewId()] || [];
  let pool;
  const r = Math.random();
  if (help.length && r < 0.5) pool = help;
  else if (r < 0.75 && place.length) pool = place;
  else pool = pet.lines;
  let line = pickOne(pool);
  if (line === lastLine) line = pickOne(pet.lines);
  lastLine = line;
  return line;
}

function hideBubble() {
  clearTimeout(bubbleHide);
  const b = $('#pet-bubble');
  if (b) b.hidden = true;
}

function petSay(text) {
  const pet = currentPet();
  if (!pet || !text) return;
  const b = $('#pet-bubble');
  b.textContent = text;
  b.hidden = false;
  // Position above the familiar, kept inside the scene.
  const wrap = $('#scene-wrap').getBoundingClientRect();
  const pr = $('#my-pet').getBoundingClientRect();
  const bw = b.offsetWidth, bh = b.offsetHeight;
  let x = pr.left - wrap.left + pr.width / 2 - bw / 2;
  x = Math.max(8, Math.min(wrap.width - bw - 8, x));
  let y = pr.top - wrap.top - bh - 10;
  // Below the familiar if there's no room above, or in the Gate Room (so it doesn't cover the fairy).
  const below = y < 8 || $('#my-pet').classList.contains('in-gates');
  b.classList.toggle('below', below);
  if (below) y = pr.bottom - wrap.top + 10;
  b.style.left = `${x}px`;
  b.style.top = `${y}px`;
  b.style.setProperty('--tail', `${pr.left - wrap.left + pr.width / 2 - x}px`);
  b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
  A.chirp(pet.pitch);
  clearTimeout(bubbleHide);
  bubbleHide = setTimeout(hideBubble, Math.min(7000, 2600 + text.length * 70));
}

// React to something now (if chatter is on), resetting the idle timer.
function petReact(text) {
  if (display.chatter === 'off' || !currentPet()) return;
  setTimeout(() => petSay(text), 500);
  chatTimer = chatGap();
}

const chatGap = () => (display.chatter === 'quiet' ? 90 + Math.random() * 60 : 30 + Math.random() * 30);

function tickChatter(dt) {
  if (display.chatter === 'off' || !$('#modal').hidden || !$('#shrine').hidden || !$('#wardrobe').hidden) return;
  chatTimer -= dt;
  if (chatTimer > 0) return;
  chatTimer = chatGap();
  const pet = currentPet();
  if (pet) petSay(chooseLine(pet));
}

// ---- Annoyance: too many pats in a row and your familiar has had enough ----
const ANNOY_WARN = 5, ANNOY_LEAVE = 9, AWAY_SECONDS = 30;
const ANNOYED_LINES = ['Hey! That tickles!', 'Okay, okay, that’s enough pats.', 'Hmph!', 'I’m warning you…', 'Too many boops!'];
let annoy = 0, lastPat = 0, petAway = false, leaving = false, awayOverride = null;

function patPet() {
  const pet = currentPet();
  if (!pet || leaving) return;
  G.state.stats2.pats++;
  // Annoyance counts pats in a row; a 2-second pause and it calms down.
  const now = performance.now();
  annoy = now - lastPat > 2000 ? 1 : annoy + 1;
  lastPat = now;
  const el = $('#my-pet');
  if (annoy >= ANNOY_LEAVE) { if (pet.explodes) explodePet(pet); else runAway(pet); return; }
  if (annoy >= ANNOY_WARN) {
    el.classList.remove('hop', 'grumpy'); void el.offsetWidth; el.classList.add('grumpy');
    const lines = pet.annoyed?.length && Math.random() < 0.6 ? pet.annoyed : ANNOYED_LINES;
    petSay(annoy >= ANNOY_LEAVE - 1 ? (pet.explodes ? 'Stop it… I’m getting all… fizzy…' : 'One more and I’m leaving!') : pickOne(lines));
  } else {
    el.classList.remove('hop', 'grumpy'); void el.offsetWidth; el.classList.add('hop');
    petSay(Math.random() < 0.6 ? pickOne(pet.lines) : chooseLine(pet));
  }
  chatTimer = chatGap();
}

function runAway(pet) {
  const secs = awayOverride ?? AWAY_SECONDS;
  leaving = true;
  G.state.stats2.runaways++;
  const el = $('#my-pet');
  petSay('That’s it, I’m out of here!');
  A.runAway();
  el.classList.remove('hop', 'grumpy'); void el.offsetWidth; el.classList.add('run');
  setTimeout(() => {
    el.classList.remove('run');
    petAway = true; leaving = false; annoy = 0;
    hideBubble();
    renderAvatarUI();
    toast(`💨 Your ${pet.name} ran off in a huff. It’ll be back in ${secs} seconds.`);
  }, 900);
  setTimeout(() => {
    petAway = false;
    renderAvatarUI();
    const back = $('#my-pet');
    back.classList.remove('return'); void back.offsetWidth; back.classList.add('return');
    chatTimer = chatGap();
    setTimeout(() => petSay(pickOne(['I’m back. Be gentle this time!', 'Okay, I forgive you. Mostly.', '*sulks back in*'])), 600);
  }, 900 + secs * 1000);
  G.save();
}

// The Conspiracy Gnome doesn't run away. He explodes, and someone else takes his place.
function explodePet(pet) {
  leaving = true;
  G.state.stats2.gnomeBooms++;
  const el = $('#my-pet');
  hideBubble();
  A.boom();
  el.classList.remove('hop', 'grumpy'); void el.offsetWidth; el.classList.add('boom');
  const wrap = $('#scene-wrap').getBoundingClientRect(), r = el.getBoundingClientRect();
  const cx = r.left - wrap.left + r.width / 2, cy = r.top - wrap.top + r.height / 2;
  const fx = document.createElement('div');
  fx.className = 'pet-boom';
  fx.style.cssText = `left:${cx}px;top:${cy}px`;
  fx.innerHTML = '<span class="flash"></span>' + Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2, d = 50 + Math.random() * 50;
    return `<i style="--dx:${(Math.cos(a) * d).toFixed(0)}px;--dy:${(Math.sin(a) * d).toFixed(0)}px;background:${['#d83a4a', '#3a6fd0', '#f4f1ea', '#b8ff8a', '#c8ccd8'][i % 5]}"></i>`;
  }).join('');
  $('#scene-wrap').append(fx);
  setTimeout(() => fx.remove(), 1400);
  setTimeout(() => {
    el.classList.remove('boom');
    // Swap in a different familiar the player owns.
    const owned = COSTUMES.filter((c) => c.slot === 'familiar' && c.id !== pet.id && c.id !== 'none_pet' && G.state.avatar.owned[c.id]);
    const next = pickOne(owned);
    if (next) G.wearItem(next.id);
    leaving = false; annoy = 0;
    renderAvatarUI();
    const nel = $('#my-pet');
    nel.classList.remove('return'); void nel.offsetWidth; nel.classList.add('return');
    toast(`💥 The Conspiracy Gnome exploded!${next ? ` Your ${next.name} takes his place.` : ''}`);
    setTimeout(() => petSay(pickOne(['…Did the gnome just explode? Anyway, hi!', 'I heard a bang. Is everyone okay?', 'He said the moon was fake right before. Just saying.'])), 700);
    G.save();
    const fresh = G.checkAchievements();
    if (fresh.length) onAchievements(fresh);
  }, 650);
}

// ---------- Blood Moon ----------

let bloodView = false; // visiting the Crimson Castle (courtyard scene)

function renderCourtyard() {
  $('#scene').innerHTML = SCENES.courtyard();
  const got = G.grantPlaceCostume('castle');
  if (got.length) setTimeout(() => onCostumes(got), 600);
  setupDracula();
  requestAnimationFrame(placeHandsAtRest);
  $('#scene-name').textContent = 'Crimson Castle';
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
    <h3>🏰 The Crimson Castle</h3>
    <div class="blood-count"><b id="bp-drops">0</b> Blood Drops</div>
    <div class="buff-bar"><i id="bp-bar"></i></div>
    <div class="bp-time" id="bp-time"></div>
    <p id="bp-moon"></p>
    <p>Tap the blood pool and watch the windows. When the gate pulls you home, you choose which resource your drops become. Right now they'd be worth:</p>
    <div class="bp-rates" id="bp-rates"></div>
  </div>`;
  updateBloodPanel();
}

function updateBloodPanel() {
  const el = $('#bp-drops');
  if (!el) return;
  el.textContent = fmt(G.state.blood.drops);
  const v = G.state.gates.visit;
  if (v) {
    const left = G.visitLeftMs() / 1000;
    $('#bp-bar').style.width = `${(left / GATE_BY_ID[v.gate].visitSec) * 100}%`;
    $('#bp-time').textContent = `The gate pulls you home in ${fmtClock(left)}`;
  }
  $('#bp-moon').textContent = G.hasBuff('bloodmoon') ? '🩸 The Blood Moon is up: every drop counts double!' : '';
  const prev = G.bloodPreview(G.state.blood.drops);
  $('#bp-rates').innerHTML = Object.entries(prev).map(([r, x]) =>
    `<div>${icon(r)} ${fmt(x.amount)} ${RESOURCES[r].name}</div>`).join('') +
    (G.state.blood.drops ? `<div class="bp-note">≈ ${fmtDuration(Object.values(prev)[0].seconds * 1000)} of that place's gathering</div>` : '');
}

function showBloodExchange() {
  const pending = G.state.blood.pending;
  if (pending <= 0) return;
  const m = $('#modal');
  const prev = G.bloodPreview(pending);
  m.innerHTML = `<div class="modal-card blood-card" role="dialog" aria-modal="true">
    <h2>🌀 Back through the gate</h2>
    <p>You gathered <b>${fmt(pending)}</b> Blood Drops. Choose what they become:</p>
    <div class="blood-choices">${Object.entries(prev).map(([r, x]) => `
      <button class="blood-choice" data-r="${r}">${icon(r)}<span><b>+${fmt(x.amount)}</b> ${RESOURCES[r].name}<small>≈ ${fmtDuration(x.seconds * 1000)} of ${LOCATIONS.find((l) => l.resource === r).name}'s gathering</small></span></button>`).join('')}
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
      if (gateView) renderAll();
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
  $('#pc-next').textContent = G.state.gates.visit || G.state.blood.pending > 0 ? 'Finish your gate visit first.'
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
  if (bloodView && !G.visitActive()) bloodView = false;
  if (gateView && !G.state.gates.owned) gateView = false;
  document.body.classList.toggle('blood', G.hasBuff('bloodmoon'));
  A.setLocation(bloodView ? worldId() : gateView ? 'gates' : G.state.active);
  updateMuteBtn();
  renderResBar();
  renderLocTabs();
  renderScene();
  renderPanel();
  renderEvents();
  renderMoonBtn();
  renderHands();
  renderAvatarUI();
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
    tickHands(dt);
    tickStreak(dt);
    tickLotus(dt);
    tickSteward(dt);
    tickDracula(dt);
    tickCuckoo(dt);
    tickVisitor(dt);
    tickChatter(dt);
    uiAccum += dt; saveAccum += dt; achAccum += dt;
    if (achAccum >= 1) {
      achAccum = 0;
      const fresh = G.checkAchievements();
      if (fresh.length) onAchievements(fresh);
      const clothes = G.checkCostumeUnlocks();
      if (clothes.length) onCostumes(clothes);
    }
    if (uiAccum >= 0.2) {
      uiAccum = 0;
      updateEvents();
      updateMoonBtn();
      if (bloodView) { updateBloodPanel(); updateClockPanel(); updateWorldPanel(); updateSceneRate(); }
      if (gateView) updateGates();
      const ended = G.checkVisitEnd();
      if (ended) onVisitEnd(ended);
      else if (G.state.gates.owned && !G.state.gates.visit) {
        // Let the player know when a gate comes off cooldown.
        const ready = GATES.some((g) => !g.soon && G.canEnterGate(g.id));
        const tabEl = $('.loc-tab.gates');
        if (tabEl && tabEl.classList.contains('ready') !== ready) {
          tabEl.classList.toggle('ready', ready);
          if (ready) toast('🌀 The Crimson Gate is ready again');
        }
      }
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
      toast(`Welcome back! Your helpers gathered ${parts}${sum.sunSec ? ` (☀️ ${fmtDuration(sum.sunSec * 1000)} doubled by Sunbeams)` : ''}`);
    }
    G.save();
    updateResBar();
  }
});
window.addEventListener('pagehide', () => { if (started) G.save(); });

// Test hook: only with ?debug in the URL.
if (new URLSearchParams(location.search).has('debug')) {
  window.__fc = { lotusNow: () => { lotusTimer = 0; }, draculaNow: () => { draculaTimer = 0; }, chatNow: () => { chatTimer = 0; }, awaySeconds: (n) => { awayOverride = n; } };
}

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
  $('#btn-avatar').addEventListener('click', () => openWardrobe(false));
  $('#my-fairy').addEventListener('click', () => openWardrobe(false));
  $('#my-pet').addEventListener('click', patPet);
  $('#btn-wd-done').addEventListener('click', closeWardrobe);
  $('#btn-wd-random').addEventListener('click', surpriseMe);
  for (const b of $$('[data-wtab]')) b.addEventListener('click', () => { wdTab = b.dataset.wtab; renderWardrobe(); });
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
