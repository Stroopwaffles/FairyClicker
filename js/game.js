// Game state, formulas, and persistence. No DOM access in this file.
import {
  SAVE_KEY, SAVE_VERSION, BASE_OFFLINE_HOURS, COST_GROWTH, MILESTONES,
  RESOURCES, LOCATIONS, HELPERS, UPGRADES, FEATURES,
  LOCATION_BY_ID, UPGRADE_BY_ID, FEATURE_BY_ID,
} from './data.js';

// ---------- state ----------

export function freshState() {
  const res = {}, earned = {};
  for (const r of Object.keys(RESOURCES)) { res[r] = 0; earned[r] = 0; }
  const locs = {};
  for (const l of LOCATIONS) {
    if (l.soon) continue;
    locs[l.id] = { unlocked: !l.unlockCost, helpers: {}, upgrades: {}, features: {}, taps: 0 };
  }
  const now = Date.now();
  return {
    v: SAVE_VERSION,
    created: now,
    lastSaved: now,
    active: 'pond',
    res,
    earned,
    locs,
    stats: { taps: 0, playMs: 0 },
    settings: { buyAmt: 1 },
  };
}

// Deep-merge a loaded save on top of a fresh state so new fields get defaults.
function mergeDefaults(base, loaded) {
  if (typeof base !== 'object' || base === null || Array.isArray(base)) {
    return loaded === undefined ? base : loaded;
  }
  const out = { ...base };
  if (loaded && typeof loaded === 'object') {
    for (const k of Object.keys(loaded)) {
      out[k] = k in base ? mergeDefaults(base[k], loaded[k]) : loaded[k];
    }
  }
  return out;
}

export let state = freshState();
export function setState(s) { state = s; invalidate(); }

// ---------- derived values (cached, recomputed after purchases) ----------

let cache = null;
export function invalidate() { cache = null; }

function collectEffects() {
  const fx = [];
  for (const [locId, ls] of Object.entries(state.locs)) {
    for (const id of Object.keys(ls.upgrades)) if (ls.upgrades[id]) fx.push(...UPGRADE_BY_ID[id].effects);
    for (const id of Object.keys(ls.features)) if (ls.features[id]) fx.push(...FEATURE_BY_ID[id].effects);
  }
  return fx;
}

export function milestoneMult(count) {
  let m = 1;
  for (const t of MILESTONES) if (count >= t) m *= 2;
  return m;
}
export function nextMilestone(count) {
  return MILESTONES.find((t) => count < t) ?? null;
}

function derive() {
  const fx = collectEffects();
  const tapMult = {}, helperMult = {}, tapRatePct = {};
  let globalMult = 1, offlineHours = BASE_OFFLINE_HOURS;
  for (const l of Object.keys(state.locs)) { tapMult[l] = 1; helperMult[l] = 1; tapRatePct[l] = 0; }
  for (const e of fx) {
    switch (e.t) {
      case 'tapMult': tapMult[e.loc] *= e.x; break;
      case 'helperMult': helperMult[e.loc] *= e.x; break;
      case 'tapRatePct': tapRatePct[e.loc] += e.x; break;
      case 'globalMult': globalMult *= e.x; break;
      case 'offlineHours': offlineHours += e.x; break;
    }
  }
  const helperRate = {}; // per single helper, fully multiplied
  const locRate = {};
  for (const l of Object.keys(state.locs)) locRate[l] = 0;
  for (const h of HELPERS) {
    const ls = state.locs[h.loc];
    if (!ls) continue;
    const n = ls.helpers[h.id] || 0;
    const per = h.rate * milestoneMult(n) * helperMult[h.loc] * globalMult;
    helperRate[h.id] = per;
    if (ls.unlocked) locRate[h.loc] += per * n;
  }
  const tapValue = {};
  for (const l of Object.keys(state.locs)) {
    tapValue[l] = tapMult[l] * globalMult + tapRatePct[l] * locRate[l];
  }
  const resRate = {};
  for (const r of Object.keys(RESOURCES)) resRate[r] = 0;
  for (const l of Object.keys(state.locs)) resRate[LOCATION_BY_ID[l].resource] += locRate[l];
  return { tapValue, helperRate, locRate, resRate, offlineHours, globalMult };
}

export function d() {
  if (!cache) cache = derive();
  return cache;
}

// ---------- costs ----------

export function helperCost(h, owned, n) {
  // Sum of a geometric series: base * g^owned * (g^n - 1) / (g - 1)
  const g = COST_GROWTH;
  const factor = Math.pow(g, owned) * (Math.pow(g, n) - 1) / (g - 1);
  const out = {};
  for (const [r, base] of Object.entries(h.cost)) out[r] = Math.ceil(base * factor);
  return out;
}

export function maxAffordable(h, owned) {
  const g = COST_GROWTH;
  let n = Infinity;
  for (const [r, base] of Object.entries(h.cost)) {
    const have = state.res[r];
    const k = Math.floor(Math.log((have * (g - 1)) / (base * Math.pow(g, owned)) + 1) / Math.log(g));
    n = Math.min(n, k);
  }
  n = Math.max(0, n);
  // Guard against rounding: step down until truly affordable.
  while (n > 0 && !canAfford(helperCost(h, owned, n))) n--;
  return n;
}

export function canAfford(cost) {
  for (const [r, amt] of Object.entries(cost)) if ((state.res[r] || 0) < amt) return false;
  return true;
}

function pay(cost) {
  for (const [r, amt] of Object.entries(cost)) state.res[r] -= amt;
}

// ---------- actions ----------

export function gain(resource, amt) {
  state.res[resource] += amt;
  state.earned[resource] += amt;
}

export function tap(locId) {
  const v = d().tapValue[locId];
  gain(LOCATION_BY_ID[locId].resource, v);
  state.locs[locId].taps++;
  state.stats.taps++;
  return v;
}

export function buyAmountFor(h) {
  const owned = state.locs[h.loc].helpers[h.id] || 0;
  const mode = state.settings.buyAmt;
  if (mode === 'max') return Math.max(1, maxAffordable(h, owned));
  return mode;
}

export function buyHelper(h) {
  const ls = state.locs[h.loc];
  const owned = ls.helpers[h.id] || 0;
  const n = buyAmountFor(h);
  const cost = helperCost(h, owned, n);
  if (!canAfford(cost)) return false;
  pay(cost);
  ls.helpers[h.id] = owned + n;
  invalidate();
  return true;
}

export function buyUpgrade(u) {
  const ls = state.locs[u.loc];
  if (ls.upgrades[u.id] || !canAfford(u.cost)) return false;
  pay(u.cost);
  ls.upgrades[u.id] = true;
  invalidate();
  return true;
}

export function featureAvailable(f) {
  const ls = state.locs[f.loc];
  const list = FEATURES.filter((x) => x.loc === f.loc);
  const i = list.indexOf(f);
  return i === 0 || !!ls.features[list[i - 1].id];
}

export function buildFeature(f) {
  const ls = state.locs[f.loc];
  if (ls.features[f.id] || !featureAvailable(f) || !canAfford(f.cost)) return false;
  pay(f.cost);
  ls.features[f.id] = true;
  invalidate();
  return true;
}

export function unlockLocation(locId) {
  const l = LOCATION_BY_ID[locId];
  const ls = state.locs[locId];
  if (!ls || ls.unlocked || !canAfford(l.unlockCost)) return false;
  pay(l.unlockCost);
  ls.unlocked = true;
  invalidate();
  return true;
}

// Advance the simulation by `sec` seconds of helper production.
export function produce(sec) {
  const rates = d().resRate;
  const gained = {};
  for (const [r, rate] of Object.entries(rates)) {
    if (rate > 0) { gain(r, rate * sec); gained[r] = rate * sec; }
  }
  return gained;
}

// Apply earnings for time spent away. Returns a summary or null if nothing happened.
export function applyOffline(now = Date.now()) {
  const awayMs = now - state.lastSaved;
  if (awayMs < 60_000) return null;
  const capMs = d().offlineHours * 3600_000;
  const usedMs = Math.min(awayMs, capMs);
  const gained = produce(usedMs / 1000);
  state.lastSaved = now;
  if (!Object.keys(gained).length) return null;
  return { awayMs, usedMs, capped: awayMs > capMs, gained };
}

// ---------- persistence ----------

export function save() {
  state.lastSaved = Date.now();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch { return false; }
}

export function hasSave() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch { return false; }
}

export function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    setState(mergeDefaults(freshState(), JSON.parse(raw)));
    return true;
  } catch { return false; }
}

export function wipeSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
}

const EXPORT_PREFIX = 'FAIRY1:';

export function exportCode() {
  state.lastSaved = Date.now();
  const bytes = new TextEncoder().encode(JSON.stringify(state));
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return EXPORT_PREFIX + btoa(bin);
}

export function importCode(code) {
  code = (code || '').trim();
  if (!code.startsWith(EXPORT_PREFIX)) throw new Error('That doesn’t look like a Fairy Clicker save code.');
  let parsed;
  try {
    const bin = atob(code.slice(EXPORT_PREFIX.length));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    parsed = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new Error('The save code is damaged or incomplete.');
  }
  if (!parsed || typeof parsed !== 'object' || !parsed.res || !parsed.locs) {
    throw new Error('The save code is missing game data.');
  }
  setState(mergeDefaults(freshState(), parsed));
  save();
}
