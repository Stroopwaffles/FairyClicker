// Headless pacing simulation of a casual player.
// Usage: node tools/sim.mjs [days] [tapsPerSec]
// Env: POLICY=double (prestige when it doubles lifetime Moonstones) or slow (when growth stalls)
// Load the same stamped module URLs the game uses (see tools/stamp-version.mjs).
import { readFileSync } from 'node:fs';
const V = (readFileSync(new URL('../index.html', import.meta.url), 'utf8').match(/window\.FC_V = '([^']*)'/) || [])[1] || '';
const G = await import(new URL('../js/game.js' + V, import.meta.url));
const D = await import(new URL('../js/data.js' + V, import.meta.url));

const DAYS = +(process.argv[2] || 6);
const TAPS = +(process.argv[3] || 3);
// Session start hours each day and their length in minutes.
const SESSIONS = [[8, 20], [13, 20], [19, 20], [22, 20]];
const W = D.RESOURCE_WEIGHT;
const FIRST_STONES = +(process.env.FIRST || 10);

let now = 0; // simulated ms since start
const realNow = Date.now;
Date.now = () => now;
G.setState(G.freshState());

const log = [];
const mark = (what) => log.push(`${fmtT(now)}  ${what}`);
function fmtT(ms) { const h = ms / 3600e3; return `day ${Math.floor(h / 24) + 1} ${String(Math.floor(h % 24)).padStart(2, '0')}:${String(Math.floor((ms / 60e3) % 60)).padStart(2, '0')} (play ${(G.state.stats.playMs / 3600e3).toFixed(1)}h)`; }

function weightedRate(tapLoc) {
  const d = G.d();
  let v = 0;
  for (const [r, rate] of Object.entries(d.resRate)) v += rate * W[r];
  if (tapLoc) {
    // Player taps (with a typical streak) plus Enchanted Hand taps, with expected crits.
    const crit = 1 + d.critChance * (D.CRIT_MULT - 1);
    const taps = TAPS * (1 + (d.streakMax - 1) * 0.6) + d.hands * d.handRate;
    v += taps * crit * d.tapValue[tapLoc] * W[D.LOCATION_BY_ID[tapLoc].resource];
  }
  return v;
}
const wCost = (cost) => Object.entries(cost).reduce((a, [r, x]) => a + x * W[r], 0);

// Which location to tap: a newly opened place until it's established (like a real
// player would), otherwise the one with the best weighted tap value.
function bestTapLoc() {
  const d = G.d();
  const total = weightedRate(null);
  const open = D.LOCATIONS.filter((l) => G.state.locs[l.id].unlocked);
  const newest = open[open.length - 1];
  if (d.locRate[newest.id] * W[newest.resource] < total * 0.05) return newest.id;
  let best = 'pond', bv = -1;
  for (const l of open) {
    const v = d.tapValue[l.id] * W[l.resource];
    if (v > bv) { bv = v; best = l.id; }
  }
  return best;
}

function candidates() {
  const out = [];
  const s = G.state;
  for (const l of D.LOCATIONS) {
    if (!s.locs[l.id].unlocked && l.unlockCost) out.push({ kind: 'unlock', id: l.id, cost: l.unlockCost, buy: () => G.unlockLocation(l.id), name: 'unlock ' + l.name, priority: true });
  }
  for (const h of D.HELPERS) {
    if (!s.locs[h.loc].unlocked) continue;
    const owned = s.locs[h.loc].helpers[h.id] || 0;
    out.push({ kind: 'helper', cost: G.helperCost(h, owned, 1), buy: () => { s.settings.buyAmt = 1; return G.buyHelper(h); }, apply: () => { s.locs[h.loc].helpers[h.id] = owned + 1; }, undo: () => { s.locs[h.loc].helpers[h.id] = owned; } });
  }
  for (const u of D.UPGRADES) {
    if (!s.locs[u.loc].unlocked || s.locs[u.loc].upgrades[u.id] || !G.upgradeAvailable(u)) continue;
    out.push({ kind: 'upgrade', cost: G.upgradeCost(u), buy: () => G.buyUpgrade(u), apply: () => { s.locs[u.loc].upgrades[u.id] = true; }, undo: () => { delete s.locs[u.loc].upgrades[u.id]; }, name: u.name });
  }
  for (const f of D.FEATURES) {
    if (!s.locs[f.loc].unlocked || s.locs[f.loc].features[f.id] || !G.featureAvailable(f)) continue;
    // Features with non-production effects get a flat bonus so they're still bought eventually.
    out.push({ kind: 'feature', cost: G.featureCost(f), buy: () => G.buildFeature(f), apply: () => { s.locs[f.loc].features[f.id] = true; }, undo: () => { delete s.locs[f.loc].features[f.id]; }, name: f.name });
  }
  for (const w of D.WORKSHOP) {
    if (!G.workshopAvailable(w.id)) continue;
    const lvl = G.wl(w.id);
    out.push({ kind: 'workshop', cost: G.workshopCost(w.id), buy: () => G.buyWorkshop(w.id), apply: () => { s.workshop[w.id] = lvl + 1; }, undo: () => { if (lvl) s.workshop[w.id] = lvl; else delete s.workshop[w.id]; }, name: w.name });
  }
  return out;
}

function scoreAll(tapLoc) {
  const base = weightedRate(tapLoc);
  const list = candidates();
  for (const c of list) {
    if (c.priority) { c.score = Infinity; continue; }
    c.apply(); G.invalidate();
    const gain = weightedRate(tapLoc) - base;
    c.undo(); G.invalidate();
    // Payback ratio, with a floor so utility purchases still happen when cheap.
    c.score = Math.max(gain, base * 0.02) / Math.max(1, wCost(c.cost));
  }
  return list.sort((a, b) => b.score - a.score);
}

function shop(tapLoc) {
  for (let k = 0; k < 40; k++) {
    const list = scoreAll(tapLoc);
    // Buy the best item if affordable; otherwise save for it unless it's far away
    // (then buy the best affordable one).
    const best = list[0];
    let pick = null;
    if (best && G.canAfford(best.cost)) pick = best;
    else {
      const rate = G.d().resRate;
      const wait = best ? Math.max(...Object.entries(best.cost).map(([r, x]) => (x - G.state.res[r]) / Math.max(rate[r], 1e-9))) : Infinity;
      if (wait > 120) pick = list.find((c) => G.canAfford(c.cost)) || null;
    }
    if (!pick) return;
    pick.buy();
    if (pick.kind === 'unlock') mark(`★ ${pick.name}  (run value ${G.runValue().toExponential(2)})`);
    if (pick.kind === 'feature') mark(`  built ${pick.name}`);
  }
}

function buyShrine() {
  let bought = true;
  while (bought) {
    bought = false;
    const avail = D.SHRINE.filter((u) => G.shrineAvailable(u) && G.state.prestige.stones >= u.cost).sort((a, b) => a.cost - b.cost);
    if (avail.length) { G.buyShrine(avail[0].id); bought = true; mark(`  shrine: ${avail[0].name} (${avail[0].cost})`); }
  }
}

// Prestige policy: once allowed, prestige when this run's stones stop growing quickly
// (less than 15% more over the last 2 hours of real time) or when they at least double what we hold.
let lastCheck = { t: 0, stones: 0 };
function maybePrestige() {
  if (!G.canPrestige()) return false;
  const st = G.stonesForRun();
  const held = G.state.prestige.lifetimeStones;
  const slow = now - lastCheck.t >= 2 * 3600e3 && st < lastCheck.stones * 1.15;
  if (now - lastCheck.t >= 2 * 3600e3) lastCheck = { t: now, stones: st };
  if ((process.env.POLICY !== "double" && slow) || (held > 0 && st >= held * (process.env.POLICY === "double" ? 1 : 2) && st >= 10) || (G.state.prestige.count === 0 && st >= FIRST_STONES)) {
    const r = G.prestige();
    mark(`🌙 PRESTIGE #${G.state.prestige.count}: +${r.stones} stones (lifetime ${G.state.prestige.lifetimeStones})${r.finale ? '  *** FINALE ***' : ''}`);
    buyShrine();
    lastCheck = { t: now, stones: 0 };
    return r.finale;
  }
  return false;
}

let finaleAt = null;
outer:
for (let day = 0; day < DAYS; day++) {
  {
    const dd = G.d();
    mark('STATUS ' + Object.keys(G.state.res).map((r) => `${r.slice(0,4)} ${G.state.res[r].toExponential(1)} (+${dd.resRate[r].toExponential(1)}/s)`).join(' | ') + ` tap@${bestTapLoc()} val ${dd.tapValue[bestTapLoc()].toExponential(1)} stones ${G.stonesForRun()} value ${G.runValue().toExponential(2)}`);
  }
  for (const [hour, mins] of SESSIONS) {
    const start = (day * 24 + hour) * 3600e3;
    // offline gap
    if (start > now) {
      G.state.lastSaved = now;
      now = start;
      G.applyOffline(now);
    }
    for (let t = 0; t < mins * 60; t++) {
      now += 1000;
      const loc = bestTapLoc();
      G.produce(1);
      for (let k = 0; k < TAPS; k++) G.tap(loc, 1 + (G.d().streakMax - 1) * 0.6);
      const dd = G.d();
      const handTaps = dd.hands * dd.handRate;
      for (let k = 0; k < Math.floor(handTaps); k++) G.tap(loc);
      if (Math.random() < handTaps % 1) G.tap(loc);
      G.state.stats.playMs += 1000;
      G.advance(1);
      if (t % 5 === 0) shop(loc);
      if (t % 30 === 0) { G.checkAchievements(); if (maybePrestige() && !finaleAt) { finaleAt = now; break outer; } }
    }
  }
}
Date.now = realNow;
console.log(log.join('\n'));
console.log('\nachievements:', G.achievementCount(), ' prestiges:', G.state.prestige.count, ' shrine bought:', Object.keys(G.state.prestige.shrine).length, '/', D.SHRINE.length,
  ' stones held:', G.state.prestige.stones, ' finale:', finaleAt ? fmtT(finaleAt) : 'not reached');
