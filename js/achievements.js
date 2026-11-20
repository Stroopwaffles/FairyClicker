// Achievements. Each `check(s, d)` gets the game state and derived values.
// `secret: true` hides the description until earned.
import { HELPERS, FEATURES, LOCATIONS, EVENTS, SHRINE } from './data.js?v=3.8';

const helpersTotal = (s) => Object.values(s.locs).reduce((a, l) => a + Object.values(l.helpers).reduce((x, y) => x + y, 0), 0);
const featuresAt = (s, loc) => FEATURES.filter((f) => f.loc === loc).every((f) => s.locs[loc].features[f.id]);
const rosterAt = (s, loc) => HELPERS.filter((h) => h.loc === loc).every((h) => (s.locs[loc].helpers[h.id] || 0) > 0);
const anyHelperAt = (s, n) => Object.values(s.locs).some((l) => Object.values(l.helpers).some((c) => c >= n));
const fmtShort = (n) => n >= 1e9 ? n / 1e9 + 'B' : n >= 1e6 ? n / 1e6 + 'M' : n >= 1e3 ? n / 1e3 + 'K' : String(n);

const list = [];
const add = (a) => list.push(a);

// Tapping
[[1, 'First Ripple'], [100, 'Getting the Hang of It'], [1000, 'Busy Fingers'], [10000, 'Tireless'], [50000, 'Legendary Tapper']]
  .forEach(([n, name]) => add({ id: `taps${n}`, group: 'Tapping', name, desc: `Tap ${n.toLocaleString('en-US')} time${n > 1 ? 's' : ''}`, check: (s) => s.stats.taps >= n }));

// Gathering
const gather = {
  dewdrops:   [[1e3, 'Morning Dew'], [1e6, 'Overflowing Pond'], [1e9, 'Ocean of Dew']],
  glowspores: [[1e3, 'Spore Collector'], [1e6, 'Glowing Cloud'], [1e9, 'Luminous Fog']],
  ambersap:   [[1e3, 'Sticky Fingers'], [1e6, 'Amber Hoard'], [1e9, 'River of Gold']],
  moonshards: [[1e3, 'Shard Seeker'], [1e6, 'Crystal Cache']],
  stardust:   [[1e3, 'Pocketful of Stars'], [1e6, 'Galaxy in a Jar']],
};
const resNames = { dewdrops: 'Dewdrops', glowspores: 'Glowspores', ambersap: 'Amber Sap', moonshards: 'Moonshards', stardust: 'Stardust' };
for (const [r, tiers] of Object.entries(gather)) {
  for (const [n, name] of tiers) {
    add({ id: `earn_${r}_${n}`, group: 'Gathering', name, desc: `Gather ${fmtShort(n)} ${resNames[r]} in total`, check: (s) => s.earned[r] >= n });
  }
}
add({ id: 'rate1k', group: 'Gathering', name: 'Steady Stream', desc: 'Earn 1,000 of any resource per second', check: (s, d) => Object.values(d.resRate).some((x) => x >= 1000) });
add({ id: 'rate1m', group: 'Gathering', name: 'Torrent', desc: 'Earn 1M of any resource per second', check: (s, d) => Object.values(d.resRate).some((x) => x >= 1e6) });

// Helpers
[[10, 'A Little Help'], [50, 'Growing Court'], [150, 'Bustling Realm'], [300, 'Fae Host'], [600, 'The Whole Kingdom']]
  .forEach(([n, name]) => add({ id: `helpers${n}`, group: 'Helpers', name, desc: `Recruit ${n} helpers in total`, check: (s) => helpersTotal(s) >= n }));
add({ id: 'century', group: 'Helpers', name: 'Century', desc: 'Own 100 of a single helper', check: (s) => anyHelperAt(s, 100) });
const rosterNames = { pond: 'Pond Choir', mushroom: 'Ring of Friends', oak: 'Family Tree', grotto: 'Crystal Company', meadow: 'Star Gazers' };
for (const l of LOCATIONS) {
  add({ id: `roster_${l.id}`, group: 'Helpers', name: rosterNames[l.id], desc: `Recruit every kind of helper at the ${l.name}`, check: (s) => rosterAt(s, l.id) });
}

// Places
for (const l of LOCATIONS.slice(1)) {
  add({ id: `unlock_${l.id}`, group: 'Places', name: `Into the ${l.name.split(' ').pop()}`, desc: `Unlock the ${l.name}`, check: (s) => s.locs[l.id].unlocked });
}
add({ id: 'feature1', group: 'Places', name: 'Home Improvement', desc: 'Build your first feature', check: (s) => Object.values(s.locs).some((l) => Object.values(l.features).some(Boolean)) });
const completeNames = { pond: 'Pond Perfected', mushroom: 'Royal Ring', oak: 'Heart of the Oak', grotto: 'Crystal Clear', meadow: 'Written in the Stars' };
for (const l of LOCATIONS) {
  add({ id: `complete_${l.id}`, group: 'Places', name: completeNames[l.id], desc: `Build every feature at the ${l.name}`, check: (s) => featuresAt(s, l.id) });
}
add({ id: 'realmrestored', group: 'Places', name: 'Realm Renewed', desc: 'Build every feature everywhere', check: (s) => LOCATIONS.every((l) => featuresAt(s, l.id)) });

// Events
add({ id: 'event1', group: 'Events', name: 'Something Stirs', desc: 'Experience your first event', check: (s) => s.ev.count >= 1 });
add({ id: 'event10', group: 'Events', name: 'Eventful Nights', desc: 'Experience 10 events', check: (s) => s.ev.count >= 10 });
add({ id: 'event50', group: 'Events', name: 'Weather Watcher', desc: 'Experience 50 events', check: (s) => s.ev.count >= 50 });
add({ id: 'eventall', group: 'Events', name: 'Seen It All', desc: 'Experience every kind of event', check: (s) => EVENTS.filter((e) => !e.req?.gateway).every((e) => s.ev.seen[e.id]) });
add({ id: 'bloodmoon1', group: 'Events', name: 'Once in a Blood Moon', desc: 'Witness the Blood Moon', check: (s) => s.ev.seen.bloodmoon >= 1 });
add({ id: 'clock1', group: 'Events', name: 'Time Traveller', desc: 'Visit the Cuckoo Clockworks', check: (s) => (s.gates.visits.clock || 0) >= 1 });
add({ id: 'clock600', group: 'Events', name: 'Ten Minutes to Spare', desc: 'Collect 600 Seconds in one clock visit', check: (s) => s.clockw.best >= 600 });
add({ id: 'cuckoo10', group: 'Events', name: 'Cuckoo!', desc: 'Catch the cuckoo bird 10 times', check: (s) => s.clockw.cuckoos >= 10 });
add({ id: 'gateway', group: 'Events', name: 'Between Worlds', desc: 'Open the Moonlit Gateway', check: (s) => s.gates.owned });
add({ id: 'castle10', group: 'Events', name: 'Frequent Guest', desc: 'Visit the Crimson Castle 10 times', check: (s) => (s.gates.visits.castle || 0) >= 10 });
add({ id: 'blood300', group: 'Events', name: 'Sanguine Harvest', desc: 'Collect 300 Blood Drops in a single castle visit', check: (s) => s.blood.best >= 300 });
add({ id: 'stars25', group: 'Events', name: 'Star Catcher', desc: 'Catch 25 shooting stars', check: (s) => s.stats.starsCaught >= 25 });
add({ id: 'fairy5', group: 'Events', name: 'Fairy Friend', desc: 'Catch the wandering fairy 5 times', check: (s) => s.stats.fairiesCaught >= 5 });

// Workshop
add({ id: 'handy', group: 'Workshop', name: 'Lend a Hand', desc: 'Get the Enchanted Hand', check: (s) => (s.workshop.hand || 0) >= 1 });
add({ id: 'masterhand', group: 'Workshop', name: 'Sleight of Hand', desc: 'Raise the Enchanted Hand to level 10', check: (s) => (s.workshop.hand || 0) >= 10 });
add({ id: 'crits100', group: 'Workshop', name: 'Four-Leaf Fortune', desc: 'Land 100 critical taps', check: (s) => s.stats2.crits >= 100 });
add({ id: 'lotus10', group: 'Workshop', name: 'Lotus Gatherer', desc: 'Catch 10 Golden Lotuses', check: (s) => s.stats2.lotuses >= 10 });
add({ id: 'bitebak', group: 'Events', name: 'Bite Back', desc: 'Tap Dracula in the castle window 5 times', check: (s) => s.blood.draculas >= 5 });

// The Moon
add({ id: 'newmoon', group: 'The Moon', name: 'New Moon', desc: 'Prestige for the first time', check: (s) => s.prestige.count >= 1 });
add({ id: 'halfmoon', group: 'The Moon', name: 'Half Moon', desc: 'Prestige 3 times', check: (s) => s.prestige.count >= 3 });
add({ id: 'realmrestored2', group: 'The Moon', name: 'The Full Moon Rises', desc: 'Restore the fairy realm (prestige 5 times)', check: (s) => s.prestige.count >= 5 });
add({ id: 'endless10', group: 'The Moon', name: 'Endless Night', desc: 'Prestige 10 times', check: (s) => s.prestige.count >= 10 });
add({ id: 'shrine1', group: 'The Moon', name: 'First Offering', desc: 'Buy a Moon Shrine upgrade', check: (s) => Object.keys(s.prestige.shrine).length >= 1 });
add({ id: 'shrinepath', group: 'The Moon', name: 'Devoted', desc: 'Complete a whole Moon Shrine path', check: (s) => ['tides', 'kinship', 'way', 'fate'].some((p) => SHRINE.filter((u) => u.path === p).every((u) => s.prestige.shrine[u.id])) });
add({ id: 'shrineall', group: 'The Moon', name: 'Keeper of the Shrine', desc: 'Buy every Moon Shrine upgrade', check: (s) => SHRINE.every((u) => s.prestige.shrine[u.id]) });
add({ id: 'stones100', group: 'The Moon', name: 'Moonstone Hoard', desc: 'Earn 100 Moonstones in total', check: (s) => s.prestige.lifetimeStones >= 100 });

// Secrets
add({ id: 'frenzy', group: 'Secrets', secret: true, name: 'Tap Frenzy', desc: 'Tap 40 times in 5 seconds', check: (s) => s.stats.frenzy });
add({ id: 'echoes', group: 'Secrets', secret: true, name: 'Echo… echo…', desc: 'Have 100 taps echo', check: (s) => s.stats.echoes >= 100 });
add({ id: 'nightowl', group: 'Secrets', secret: true, name: 'Night Owl', desc: 'Play for a total of 2 hours', check: (s) => s.stats.playMs >= 2 * 3600e3 });
add({ id: 'patience', group: 'Secrets', secret: true, name: 'Patience of the Moon', desc: 'Return after your helpers have worked the full offline time', check: (s) => s.stats.fullOffline });

export const ACHIEVEMENTS = list;
export const ACHIEVEMENT_GROUPS = ['Tapping', 'Gathering', 'Helpers', 'Places', 'Events', 'Workshop', 'The Moon', 'Secrets'];
