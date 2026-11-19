// Game state, formulas, and persistence. No DOM access in this file.
import {
  SAVE_KEY, SAVE_VERSION, BASE_OFFLINE_HOURS, COST_GROWTH, MILESTONES, ACHIEVEMENT_BONUS,
  RESOURCES, LOCATIONS, HELPERS, FEATURES, EVENTS, FIRST_EVENT_AT, EVENT_GAP,
  LOCATION_BY_ID, UPGRADE_BY_ID, FEATURE_BY_ID, EVENT_BY_ID, GIFT_BY_ID,
  RESOURCE_WEIGHT, STONE_SCALE, STONE_FACTOR, STONE_EXP, STONE_BONUS, FINALE_PRESTIGE, PRESTIGE_REQ_LOC,
  SHRINE, SHRINE_BY_ID, BLOOD_SECONDS, BLOOD_EXP, BLOOD_TAP_EQUIV, CHALICE_VALUE_PER_LEVEL,
  WORKSHOP_BY_ID, HAND_RATES, CRIT_MULT, STREAK_MAX, RES_ORDER, HELPER_BY_ID,
  GATES, GATE_BY_ID, BLOOD_MOON_COOLDOWN_CUT_MIN, COSTUMES, COSTUME_BY_ID,
} from './data.js';
import { DEFAULT_LOOK } from './avatar.js';
import { ACHIEVEMENTS } from './achievements.js';

// ---------- state ----------

export function freshState() {
  const res = {}, earned = {};
  for (const r of Object.keys(RESOURCES)) { res[r] = 0; earned[r] = 0; }
  const locs = {};
  for (const l of LOCATIONS) {
    locs[l.id] = { unlocked: !l.unlockCost, helpers: {}, upgrades: {}, features: {}, taps: 0 };
  }
  const now = Date.now();
  return {
    v: SAVE_VERSION,
    created: now,
    lastSaved: now,
    active: 'pond',
    clock: 0,                 // seconds of active play; events and buffs run on this
    res,
    earned,                   // lifetime totals (never reset)
    runEarned: { ...earned }, // this run only; decides Moonstones
    locs,
    buffs: [],                // [{ id, kind: 'event'|'gift', ends }]
    ev: { next: FIRST_EVENT_AT, nextId: null, lastId: null, count: 0, seen: {} },
    achievements: {},         // id -> timestamp earned
    blood: { drops: 0, pending: 0, total: 0, best: 0, draculas: 0 }, // Blood Moon
    workshop: {},             // id -> level (resets on prestige)
    gates: { owned: false, visit: null, cd: {}, visits: {} }, // permanent; cd: gateId -> ready-at (ms)
    // The player's fairy (permanent): how she looks, which clothes she owns, which are new.
    avatar: { look: { ...DEFAULT_LOOK }, owned: Object.fromEntries(COSTUMES.filter((c) => c.from === 'starter').map((c) => [c.id, true])), fresh: {}, created: false },
    stats: { taps: 0, playMs: 0, starsCaught: 0, fairiesCaught: 0, echoes: 0, frenzy: false, fullOffline: false },
    settings: { buyAmt: 1, steward: true, stewardMode: 'cheapest' },
    stats2: { crits: 0, lotuses: 0, handTaps: 0 },
    prestige: { count: 0, stones: 0, lifetimeStones: 0, shrine: {}, finaleSeen: false, runStart: now, fastestRunMs: 0, hinted: false },
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

function migrate(s, fromV) {
  if ((fromV || 1) < 3) {
    // Before prestige existed the whole save was one run.
    s.runEarned = { ...s.earned };
    s.prestige.runStart = s.created || Date.now();
  }
  s.v = SAVE_VERSION;
  if (!Array.isArray(s.buffs)) s.buffs = [];
  return s;
}

export let state = freshState();
export function setState(s) { state = s; invalidate(); }

// ---------- derived values (cached, recomputed after anything changes) ----------

let cache = null;
export function invalidate() { cache = null; }

function shrineEffects() {
  const fx = [];
  for (const id of Object.keys(state.prestige.shrine)) if (state.prestige.shrine[id] && SHRINE_BY_ID[id]) fx.push(...SHRINE_BY_ID[id].effects);
  return fx;
}
export const hasShrineEffect = (t) => shrineEffects().some((e) => e.t === t);

function buffEffects(b) {
  if (b.kind === 'event') return EVENT_BY_ID[b.id]?.effects || [];
  if (b.kind === 'gift') return GIFT_BY_ID[b.id]?.effects || [];
  return [];
}

function collectEffects() {
  const fx = [];
  for (const ls of Object.values(state.locs)) {
    for (const id of Object.keys(ls.upgrades)) if (ls.upgrades[id] && UPGRADE_BY_ID[id]) fx.push(...UPGRADE_BY_ID[id].effects);
    for (const id of Object.keys(ls.features)) if (ls.features[id] && FEATURE_BY_ID[id]) fx.push(...FEATURE_BY_ID[id].effects);
  }
  const shrine = shrineEffects();
  fx.push(...shrine);
  const whistle = wl('whistle');
  if (whistle) fx.push({ t: 'helperMult', loc: '*', x: 1 + whistle * 0.1 });
  const lantern = wl('lantern');
  if (lantern) fx.push({ t: 'offlineHours', x: lantern * 2 });
  const noHarm = shrine.some((e) => e.t === 'noHarm');
  for (const b of state.buffs) {
    for (const e of buffEffects(b)) {
      // Kind Fortune removes the slowing half of events.
      if (noHarm && b.kind === 'event' && typeof e.x === 'number' && e.x < 1 && e.t !== 'helperDiscount') continue;
      fx.push(e);
    }
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

export function achievementCount() {
  return Object.keys(state.achievements).length;
}

function derive() {
  const fx = collectEffects();
  const locIds = Object.keys(state.locs);
  const tapMult = {}, helperMult = {}, tapRatePct = {}, helperOne = {};
  for (const l of locIds) { tapMult[l] = 1; helperMult[l] = 1; tapRatePct[l] = 0; }
  const out = {
    globalMult: 1, offlineHours: BASE_OFFLINE_HOURS, helperDiscount: 1, upgradeDiscount: 1,
    tapEcho: 0, eventDuration: 1, eventFreq: 1, eventPreview: false,
    holdTap: false, giftMult: 1,
  };
  const each = (loc, fn) => (loc === '*' ? locIds : [loc]).forEach(fn);
  for (const e of fx) {
    switch (e.t) {
      case 'tapMult': each(e.loc, (l) => { tapMult[l] *= e.x; }); break;
      case 'helperMult': each(e.loc, (l) => { helperMult[l] *= e.x; }); break;
      case 'tapRatePct': each(e.loc, (l) => { tapRatePct[l] += e.x; }); break;
      case 'holdTap': out.holdTap = true; break;
      case 'giftMult': out.giftMult *= e.x; break;
      case 'helperOne': helperOne[e.id] = (helperOne[e.id] || 1) * e.x; break;
      case 'globalMult': out.globalMult *= e.x; break;
      case 'offlineHours': out.offlineHours += e.x; break;
      case 'helperDiscount': out.helperDiscount *= e.x; break;
      case 'upgradeDiscount': out.upgradeDiscount *= e.x; break;
      case 'tapEcho': out.tapEcho += e.x; break;
      case 'eventDuration': out.eventDuration *= e.x; break;
      case 'eventFreq': out.eventFreq *= e.x; break;
      case 'eventPreview': out.eventPreview = true; break;
    }
  }
  // Workshop
  const hand = wl('hand');
  out.hands = hand ? (wl('twinhand') ? 2 : 1) : 0;
  out.handRate = hand ? HAND_RATES[hand - 1] : 0;
  out.critChance = wl('clover') * 0.02;
  out.streakMax = STREAK_MAX[wl('streak')];
  out.bloodMult = 1 + wl('chalice') * CHALICE_VALUE_PER_LEVEL;
  out.bloodPerTap = 1 + wl('chalice');
  out.achievementMult = 1 + achievementCount() * ACHIEVEMENT_BONUS;
  out.stoneMult = 1 + state.prestige.stones * STONE_BONUS;
  const g = out.globalMult * out.achievementMult * out.stoneMult;

  const helperRate = {};
  const locRate = {};
  for (const l of locIds) locRate[l] = 0;
  for (const h of HELPERS) {
    const ls = state.locs[h.loc];
    const n = ls.helpers[h.id] || 0;
    const per = h.rate * milestoneMult(n) * (helperOne[h.id] || 1) * helperMult[h.loc] * g;
    helperRate[h.id] = per;
    if (ls.unlocked) locRate[h.loc] += per * n;
  }
  const tapValue = {};
  for (const l of locIds) tapValue[l] = tapMult[l] * g + tapRatePct[l] * locRate[l];
  const resRate = {};
  for (const r of Object.keys(RESOURCES)) resRate[r] = 0;
  for (const l of locIds) resRate[LOCATION_BY_ID[l].resource] += locRate[l];
  return { ...out, tapValue, helperRate, locRate, resRate, helperOne };
}

export function d() {
  if (!cache) cache = derive();
  return cache;
}

// ---------- costs ----------

const scaleCost = (cost, k) => {
  const out = {};
  for (const [r, amt] of Object.entries(cost)) out[r] = Math.ceil(amt * k);
  return out;
};

export function helperCost(h, owned, n) {
  // Sum of a geometric series: base * g^owned * (g^n - 1) / (g - 1)
  const g = COST_GROWTH;
  return scaleCost(h.cost, d().helperDiscount * Math.pow(g, owned) * (Math.pow(g, n) - 1) / (g - 1));
}

export const upgradeCost = (u) => scaleCost(u.cost, d().upgradeDiscount);
export const featureCost = (f) => scaleCost(f.cost, d().upgradeDiscount);

export function maxAffordable(h, owned) {
  const g = COST_GROWTH;
  const disc = d().helperDiscount;
  let n = Infinity;
  for (const [r, base] of Object.entries(h.cost)) {
    const have = state.res[r];
    const k = Math.floor(Math.log((have * (g - 1)) / (base * disc * Math.pow(g, owned)) + 1) / Math.log(g));
    n = Math.min(n, k);
  }
  n = Math.max(0, n);
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
  state.runEarned[resource] += amt;
}

// Returns { value, echo } — echo means the tap counted twice.
// Returns { value, echo, crit }. `mult` is the tap-streak combo from the UI.
export function tap(locId, mult = 1) {
  let v = d().tapValue[locId] * mult;
  const echo = Math.random() < d().tapEcho;
  if (echo) { v *= 2; state.stats.echoes++; }
  const crit = Math.random() < d().critChance;
  if (crit) { v *= CRIT_MULT; state.stats2.crits++; }
  gain(LOCATION_BY_ID[locId].resource, v);
  state.locs[locId].taps++;
  state.stats.taps++;
  return { value: v, echo, crit };
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

// Helper upgrades need enough of that helper first.
export function upgradeAvailable(u) {
  if (!u.helper) return true;
  return (state.locs[u.loc].helpers[u.helper] || 0) >= u.req;
}

export function buyUpgrade(u) {
  const ls = state.locs[u.loc];
  const cost = upgradeCost(u);
  if (ls.upgrades[u.id] || !upgradeAvailable(u) || !canAfford(cost)) return false;
  pay(cost);
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
  const cost = featureCost(f);
  if (ls.features[f.id] || !featureAvailable(f) || !canAfford(cost)) return false;
  pay(cost);
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
  applyStartHelpers(locId);
  invalidate();
  return true;
}

// Welcome Party: a newly opened place starts with a few helpers.
function applyStartHelpers(locId) {
  if (!hasShrineEffect('startHelpers')) return;
  const list = HELPERS.filter((h) => h.loc === locId);
  const ls = state.locs[locId];
  ls.helpers[list[0].id] = Math.max(ls.helpers[list[0].id] || 0, 10);
  ls.helpers[list[1].id] = Math.max(ls.helpers[list[1].id] || 0, 5);
}

// Advance helper production by `sec` seconds.
export function produce(sec) {
  const rates = d().resRate;
  const gained = {};
  for (const [r, rate] of Object.entries(rates)) {
    if (rate > 0) { gain(r, rate * sec); gained[r] = rate * sec; }
  }
  return gained;
}

// ---------- events & buffs ----------

function eventEligible(e) {
  if (!e.req) return true;
  if (e.req.loc && !state.locs[e.req.loc]?.unlocked) return false;
  if (e.req.gateway && !state.gates.owned) return false;
  if (e.req.feature) {
    const f = FEATURE_BY_ID[e.req.feature];
    if (!state.locs[f.loc].features[f.id]) return false;
  }
  return true;
}

function pickEvent() {
  let pool = EVENTS.filter(eventEligible);
  if (pool.length > 1) pool = pool.filter((e) => e.id !== state.ev.lastId);
  const total = pool.reduce((a, e) => a + e.weight, 0);
  let r = Math.random() * total;
  for (const e of pool) { r -= e.weight; if (r <= 0) return e.id; }
  return pool[pool.length - 1].id;
}

function scheduleNext() {
  const [a, b] = EVENT_GAP;
  state.ev.next = state.clock + (a + Math.random() * (b - a)) * d().eventFreq;
  state.ev.nextId = pickEvent();
}

export const activeEvent = () => state.buffs.find((b) => b.kind === 'event') || null;
export const hasBuff = (id) => state.buffs.some((b) => b.id === id);

function startEvent(id) {
  const e = EVENT_BY_ID[id];
  const dur = e.dur * d().eventDuration * (id === 'fairy' && wl('bell') ? 2 : 1);
  state.buffs.push({ id, kind: 'event', ends: state.clock + dur, dur });
  state.ev.count++;
  state.ev.seen[id] = (state.ev.seen[id] || 0) + 1;
  state.ev.lastId = id;
  if (id === 'bloodmoon') {
    const cd = state.gates.cd.castle || 0;
    state.gates.cd.castle = Math.max(Date.now(), cd - BLOOD_MOON_COOLDOWN_CUT_MIN * 60000);
  }
  invalidate();
}

export function removeBuff(id) {
  const before = state.buffs.length;
  state.buffs = state.buffs.filter((b) => b.id !== id);
  if (state.buffs.length !== before) invalidate();
}

// Advance the play clock: expire buffs and start events.
// Returns { started: [eventId], ended: [buffId] } for the UI to react to.
export function advance(sec) {
  state.clock += sec;
  const happened = { started: [], ended: [] };
  const expired = state.buffs.filter((b) => state.clock >= b.ends);
  if (expired.length) {
    state.buffs = state.buffs.filter((b) => state.clock < b.ends);
    happened.ended.push(...expired.map((b) => b.id));
    invalidate();
  }
  if (state.ev.nextId == null || !eventEligible(EVENT_BY_ID[state.ev.nextId] || {})) {
    state.ev.nextId = pickEvent();
  }
  if (state.clock >= state.ev.next && !activeEvent()) {
    const id = state.ev.nextId;
    startEvent(id);
    happened.started.push(id);
    // The gap starts counting after this event ends.
    scheduleNext();
    state.ev.next += EVENT_BY_ID[id].dur * d().eventDuration;
  }
  return happened;
}

// ---------- Blood Moon ----------

const bloodMoonMult = () => (hasBuff('bloodmoon') ? 2 : 1);

export function tapBlood() {
  if (!visitActive()) return { value: 0, echo: false, crit: false };
  const echo = Math.random() < d().tapEcho;
  const crit = Math.random() < d().critChance;
  const v = d().bloodPerTap * bloodMoonMult() * (echo ? 2 : 1) * (crit ? CRIT_MULT : 1);
  if (echo) state.stats.echoes++;
  if (crit) state.stats2.crits++;
  state.blood.drops += v;
  state.blood.total += v;
  state.stats.taps++;
  return { value: v, echo, crit };
}

// Tapping Dracula in a castle window: a big burst of drops.
export function biteBack() {
  if (!visitActive()) return 0;
  const v = 40 * d().bloodPerTap * bloodMoonMult();
  state.blood.drops += v;
  state.blood.total += v;
  state.blood.draculas++;
  return v;
}

// ---------- Gateways ----------

export const visitActive = () => !!state.gates.visit && Date.now() < state.gates.visit.ends;
export const visitLeftMs = () => (state.gates.visit ? Math.max(0, state.gates.visit.ends - Date.now()) : 0);
export const gateReadyInMs = (id) => Math.max(0, (state.gates.cd[id] || 0) - Date.now());

export function canEnterGate(id) {
  const g = GATE_BY_ID[id];
  return state.gates.owned && g && !g.soon && !state.gates.visit && state.blood.pending <= 0 && gateReadyInMs(id) === 0;
}

export function enterGate(id) {
  if (!canEnterGate(id)) return false;
  const g = GATE_BY_ID[id];
  state.gates.visit = { gate: id, ends: Date.now() + g.visitSec * 1000 };
  state.gates.visits[id] = (state.gates.visits[id] || 0) + 1;
  state.blood.drops = 0;
  return true;
}

// Call regularly: ends a visit whose time is up. Returns true if one just ended.
export function checkVisitEnd(now = Date.now()) {
  const v = state.gates.visit;
  if (!v || now < v.ends) return false;
  const g = GATE_BY_ID[v.gate];
  const B = state.blood;
  B.best = Math.max(B.best, B.drops);
  B.pending += B.drops;
  B.drops = 0;
  state.gates.cd[v.gate] = v.ends + g.cooldownMin * 60000;
  state.gates.visit = null;
  return true;
}

// How many seconds of a place's output a haul of drops is worth (diminishing returns).
export function bloodSeconds(drops) {
  if (drops <= 0) return 0;
  return BLOOD_SECONDS * Math.pow(drops, BLOOD_EXP) * d().bloodMult;
}

// What a haul of drops would become in each unlocked resource: { res: { amount, seconds } }.
export function bloodPreview(drops) {
  const dd = d();
  const secs = bloodSeconds(drops);
  const out = {};
  for (const l of LOCATIONS) {
    if (!state.locs[l.id].unlocked) continue;
    const perSec = Math.max(dd.locRate[l.id], dd.tapValue[l.id] * BLOOD_TAP_EQUIV, 1);
    const amount = perSec * secs;
    if (!out[l.resource] || amount > out[l.resource].amount) out[l.resource] = { amount, seconds: secs };
  }
  return out;
}

export function convertBlood(resource) {
  if (state.blood.pending <= 0) return 0;
  const p = bloodPreview(state.blood.pending)[resource];
  if (!p) return 0;
  const amt = p.amount;
  gain(resource, amt);
  state.blood.pending = 0;
  return amt;
}

export const secondsUntilNextEvent = () => Math.max(0, state.ev.next - state.clock);

// Meteor shower: each caught star gives a burst of stardust.
export function catchStar() {
  const dd = d();
  const amt = Math.max(25, dd.locRate.meadow * 15 + dd.tapValue.meadow * 5);
  gain('stardust', amt);
  state.stats.starsCaught++;
  return amt;
}

export function catchFairy() {
  removeBuff('fairy');
  state.stats.fairiesCaught++;
}

// Returns a summary of what the gift gave.
export function applyGift(id) {
  const gift = GIFT_BY_ID[id];
  if (gift.id === 'bounty') {
    const dd = d();
    const gained = {};
    for (const l of LOCATIONS) {
      if (!state.locs[l.id].unlocked) continue;
      const amt = Math.max(dd.locRate[l.id] * 600, dd.tapValue[l.id] * 100) * dd.giftMult;
      gain(l.resource, amt);
      gained[l.resource] = (gained[l.resource] || 0) + amt;
    }
    return { gained };
  }
  removeBuff(id);
  const dur = gift.dur * d().giftMult;
  state.buffs.push({ id, kind: 'gift', ends: state.clock + dur, dur });
  invalidate();
  return {};
}

// ---------- Workshop ----------

// Workshop level. Items marked `keep` (the Gateway) are stored permanently instead.
export const wl = (id) => (WORKSHOP_BY_ID[id]?.keep ? (state.gates.owned ? 1 : 0) : state.workshop[id] || 0);

// Cost of buying level `level + 1`. Higher levels also ask for later resources.
export function workshopCost(id, level = wl(id)) {
  const w = WORKSHOP_BY_ID[id];
  const value = w.value * Math.pow(w.growth, level);
  const allowed = RES_ORDER.slice(0, Math.min(RES_ORDER.length, Math.max(w.tier || 1, 1 + Math.floor(level / 2))));
  const cost = {};
  for (const r of allowed) {
    const raw = value / RESOURCE_WEIGHT[r] / allowed.length;
    const mag = Math.pow(10, Math.max(0, Math.floor(Math.log10(raw)) - 1));
    cost[r] = Math.max(1, Math.round(raw / mag) * mag); // two significant digits
  }
  return cost;
}

export function workshopAvailable(id) {
  const w = WORKSHOP_BY_ID[id];
  if (wl(id) >= w.max) return false;
  if (w.req?.hand && wl('hand') < w.req.hand) return false;
  return true;
}

export function buyWorkshop(id) {
  if (!workshopAvailable(id)) return false;
  const cost = workshopCost(id);
  if (!canAfford(cost)) return false;
  pay(cost);
  if (WORKSHOP_BY_ID[id].keep) state.gates.owned = true;
  else state.workshop[id] = wl(id) + 1;
  invalidate();
  return true;
}

// Production gained per weighted cost for buying one more of a helper.
function helperValue(h) {
  const ls = state.locs[h.loc];
  const n = ls.helpers[h.id] || 0;
  const dd = d();
  const per = dd.helperRate[h.id] / milestoneMult(n); // rate without milestone bonus
  const gainRate = per * (milestoneMult(n + 1) * (n + 1) - milestoneMult(n) * n);
  const cost = helperCost(h, n, 1);
  const wcost = Object.entries(cost).reduce((a, [r, x]) => a + x * RESOURCE_WEIGHT[r], 0);
  return { gain: gainRate * RESOURCE_WEIGHT[LOCATION_BY_ID[h.loc].resource], wcost, cost };
}

// Helpers the player can see (the next one is revealed once the previous is owned).
export function revealedHelpers(locId) {
  const list = HELPERS.filter((h) => h.loc === locId);
  const ls = state.locs[locId];
  return list.filter((h, i) => i === 0 || (ls.helpers[list[i - 1].id] || 0) > 0 || (ls.helpers[h.id] || 0) > 0);
}

// The Fairy Almanac's pick: best production per cost at a place.
export function almanacPick(locId) {
  let best = null, bv = -1;
  for (const h of revealedHelpers(locId)) {
    const { gain: g, wcost } = helperValue(h);
    const v = g / wcost;
    if (v > bv) { bv = v; best = h; }
  }
  return best;
}

// The Helper Steward recruits one helper if it can. Returns the helper or null.
export function stewardTick(locId) {
  if (!wl('steward') || !state.settings.steward || !state.locs[locId]?.unlocked) return null;
  let pick;
  if (state.settings.stewardMode === 'almanac' && wl('almanac')) {
    pick = almanacPick(locId); // waits and saves up for the Almanac's choice
  } else {
    let low = Infinity;
    for (const h of revealedHelpers(locId)) {
      const { wcost } = helperValue(h);
      if (wcost < low) { low = wcost; pick = h; }
    }
  }
  if (!pick) return null;
  const owned = state.locs[locId].helpers[pick.id] || 0;
  const cost = helperCost(pick, owned, 1);
  if (!canAfford(cost)) return null;
  pay(cost);
  state.locs[locId].helpers[pick.id] = owned + 1;
  invalidate();
  return pick;
}

// Golden Lotus burst at a place.
export function catchLotus(locId) {
  const dd = d();
  const L = Math.max(1, wl('lotus'));
  const amt = Math.max(dd.locRate[locId] * 60, dd.tapValue[locId] * 150) * (1 + (L - 1) * 0.5);
  gain(LOCATION_BY_ID[locId].resource, amt);
  state.stats2.lotuses++;
  return amt;
}

// ---------- prestige ----------

export function runValue() {
  let v = 0;
  for (const [r, w] of Object.entries(RESOURCE_WEIGHT)) v += (state.runEarned[r] || 0) * w;
  return v;
}

export function stonesForRun() {
  return Math.floor(STONE_FACTOR * Math.pow(runValue() / STONE_SCALE, STONE_EXP));
}

// Run value needed for the next whole stone (for a progress bar).
export function valueForStones(n) {
  return STONE_SCALE * Math.pow(n / STONE_FACTOR, 1 / STONE_EXP);
}

export function canPrestige() {
  if (state.gates.visit || state.blood.pending > 0) return false;
  return !!state.locs[PRESTIGE_REQ_LOC]?.unlocked && stonesForRun() >= 1;
}

export const isFinaleNext = () => state.prestige.count + 1 === FINALE_PRESTIGE;
export const inEndless = () => state.prestige.count >= FINALE_PRESTIGE;

// Reset the realm and keep Moonstones. Returns { stones, finale }.
export function prestige() {
  if (!canPrestige()) return null;
  const stones = stonesForRun();
  const P = state.prestige;
  P.count++;
  P.stones += stones;
  P.lifetimeStones += stones;
  const runMs = Date.now() - P.runStart;
  P.fastestRunMs = P.fastestRunMs ? Math.min(P.fastestRunMs, runMs) : runMs;
  P.runStart = Date.now();
  const finale = P.count === FINALE_PRESTIGE;

  // Fresh realm, keeping everything that lasts across runs.
  const fresh = freshState();
  const keep = {
    created: state.created, achievements: state.achievements, stats: state.stats, stats2: state.stats2, settings: state.settings, blood: state.blood, gates: state.gates, avatar: state.avatar,
    earned: state.earned, prestige: P, clock: state.clock,
    ev: { ...fresh.ev, count: state.ev.count, seen: state.ev.seen, next: state.clock + FIRST_EVENT_AT },
  };
  state = Object.assign(fresh, keep);
  invalidate();

  const fx = shrineEffects();
  for (const e of fx) {
    if (e.t === 'keepLocs') for (const l of e.locs) state.locs[l].unlocked = true;
    if (e.t === 'startRes') { state.res.dewdrops += 25000; state.res.glowspores += 2500; }
  }
  if (fx.some((e) => e.t === 'keepFirstFeature')) {
    for (const l of LOCATIONS) {
      const first = FEATURES.find((f) => f.loc === l.id);
      if (first) state.locs[l.id].features[first.id] = true;
    }
  }
  for (const l of LOCATIONS) if (state.locs[l.id].unlocked) applyStartHelpers(l.id);
  invalidate();
  return { stones, finale };
}

export function shrineAvailable(u) {
  const P = state.prestige;
  if (P.shrine[u.id]) return false;
  if (u.minPrestige && P.count < u.minPrestige) return false;
  const path = SHRINE.filter((x) => x.path === u.path);
  const i = path.indexOf(u);
  return i === 0 || !!P.shrine[path[i - 1].id];
}

export function buyShrine(id) {
  const u = SHRINE_BY_ID[id];
  const P = state.prestige;
  if (!shrineAvailable(u) || P.stones < u.cost) return false;
  P.stones -= u.cost;
  P.shrine[id] = true;
  invalidate();
  return true;
}

// ---------- wardrobe ----------

function grant(list) {
  const A = state.avatar;
  const got = [];
  for (const c of list) {
    if (A.owned[c.id]) continue;
    A.owned[c.id] = true;
    A.fresh[c.id] = true;
    got.push(c);
  }
  return got;
}

// A place's costume, granted on the first visit. Returns newly unlocked items.
export function grantPlaceCostume(place) {
  return grant(COSTUMES.filter((c) => c.from?.place === place));
}

// Items unlocked by achievements and prestige. Returns newly unlocked items.
export function checkCostumeUnlocks() {
  const n = achievementCount();
  return grant(COSTUMES.filter((c) => {
    const f = c.from;
    if (!f || f === 'starter') return false;
    if (f.ach) return !!state.achievements[f.ach];
    if (f.achCount) return n >= f.achCount;
    if (f.prestige) return state.prestige.count >= f.prestige;
    return false;
  }));
}

export function wearItem(id) {
  const c = COSTUME_BY_ID[id];
  if (!c || !state.avatar.owned[id]) return false;
  state.avatar.look[c.slot] = id;
  delete state.avatar.fresh[id];
  return true;
}

export function setLook(key, value) {
  state.avatar.look[key] = value;
}

// ---------- achievements ----------

// Returns newly earned achievements.
export function checkAchievements() {
  const dd = d();
  const fresh = [];
  for (const a of ACHIEVEMENTS) {
    if (state.achievements[a.id]) continue;
    let ok = false;
    try { ok = a.check(state, dd); } catch { ok = false; }
    if (ok) { state.achievements[a.id] = Date.now(); fresh.push(a); }
  }
  if (fresh.length) invalidate();
  return fresh;
}

// ---------- offline ----------

// Apply earnings for time spent away. Returns a summary or null if nothing happened.
export function applyOffline(now = Date.now()) {
  const awayMs = now - state.lastSaved;
  if (awayMs < 60_000) return null;
  // Timed boosts don't apply while away.
  const hadBuffs = state.buffs.length > 0;
  const saved = state.buffs;
  if (hadBuffs) { state.buffs = []; invalidate(); }
  const capMs = d().offlineHours * 3600_000;
  const usedMs = Math.min(awayMs, capMs);
  const gained = produce(usedMs / 1000);
  if (hadBuffs) { state.buffs = saved; invalidate(); }
  state.lastSaved = now;
  if (awayMs >= capMs) state.stats.fullOffline = true;
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
    const parsed = JSON.parse(raw);
    setState(migrate(mergeDefaults(freshState(), parsed), parsed.v));
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
  setState(migrate(mergeDefaults(freshState(), parsed), parsed.v));
  save();
}
