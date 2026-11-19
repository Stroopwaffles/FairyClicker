// Static game content. Everything the game knows about lives here so new
// locations, helpers, upgrades, features and events can be added without touching logic.
//
// Effect types (used by upgrades, features, events, fairy gifts, later prestige).
// `loc: '*'` means every location.
//   { t: 'tapMult',        loc, x }  multiply tap value
//   { t: 'helperMult',     loc, x }  multiply helper output
//   { t: 'globalMult',          x }  multiply all production everywhere
//   { t: 'tapRatePct',     loc, x }  each tap also yields x * (location's per-second rate)
//   { t: 'offlineHours',        x }  add hours to the offline earnings cap
//   { t: 'helperDiscount',      x }  multiply helper costs
//   { t: 'upgradeDiscount',     x }  multiply upgrade and feature costs
//   { t: 'tapEcho',             x }  chance for a tap to count twice
//   { t: 'eventDuration',       x }  multiply event length
//   { t: 'eventFreq',           x }  multiply time between events (lower = more often)
//   { t: 'eventPreview' }            show which event comes next

export const SAVE_KEY = 'fairyclicker.save';
export const SAVE_VERSION = 3;
export const BASE_OFFLINE_HOURS = 8;
export const COST_GROWTH = 1.15;
export const MILESTONES = [25, 50, 100, 150, 200, 300, 400, 500];
export const ACHIEVEMENT_BONUS = 0.01; // +1% to everything per achievement

export const RESOURCES = {
  dewdrops:   { name: 'Dewdrops',   color: '#8fd8ff' },
  glowspores: { name: 'Glowspores', color: '#b8ff8a' },
  ambersap:   { name: 'Amber Sap',  color: '#ffb54d' },
  moonshards: { name: 'Moonshards', color: '#c9b6ff' },
  stardust:   { name: 'Stardust',   color: '#fff0a0' },
};

export const LOCATIONS = [
  {
    id: 'pond', name: 'Moonlit Pond', resource: 'dewdrops', tapVerb: 'Tap the pond',
    blurb: 'Still water holds the moon. Every ripple shakes loose a dewdrop.',
    unlockCost: null,
  },
  {
    id: 'mushroom', name: 'Mushroom Ring', resource: 'glowspores', tapVerb: 'Tap the toadstool',
    blurb: 'A ring of glowing toadstools where the fae dance. The great cap at its heart puffs out glowspores.',
    unlockCost: { dewdrops: 1000 },
  },
  {
    id: 'oak', name: 'Ancient Oak', resource: 'ambersap', tapVerb: 'Tap the hollow',
    blurb: 'The oldest tree in the realm. Golden sap wells up from the hollow in its heart.',
    unlockCost: { dewdrops: 2e6, glowspores: 300000 },
  },
  {
    id: 'grotto', name: 'Crystal Grotto', resource: 'moonshards', tapVerb: 'Tap the crystals',
    blurb: 'Deep beneath the hills, crystals hum with stored moonlight. A gentle tap chips off a shard.',
    unlockCost: { ambersap: 1e6, glowspores: 50e6 },
  },
  {
    id: 'meadow', name: 'Starfall Meadow', resource: 'stardust', tapVerb: 'Tap the fallen star',
    blurb: 'Where stars come to rest. A fallen star glows in the grass, shedding stardust at every touch.',
    unlockCost: { moonshards: 2e6, ambersap: 50e6, dewdrops: 5e9 },
  },
];

export const HELPERS = [
  // Moonlit Pond — dewdrops
  { id: 'firefly',     loc: 'pond', name: 'Firefly', plural: 'Fireflies',          desc: 'Blinks dew off the reeds.',                cost: { dewdrops: 15 },      rate: 0.1 },
  { id: 'watersprite', loc: 'pond', name: 'Water Sprite', plural: 'Water Sprites', desc: 'Skips across the surface, splashing.',     cost: { dewdrops: 100 },     rate: 1 },
  { id: 'lilypixie',   loc: 'pond', name: 'Lily Pixie', plural: 'Lily Pixies',     desc: 'Sips from lily cups and shares the rest.', cost: { dewdrops: 1100 },    rate: 8 },
  { id: 'frogbard',    loc: 'pond', name: 'Frog Bard', plural: 'Frog Bards',       desc: 'Sings the water into droplets.',           cost: { dewdrops: 12000 },   rate: 47 },
  { id: 'mothweaver',  loc: 'pond', name: 'Moth Weaver', plural: 'Moth Weavers',   desc: 'Spins silver nets that catch the mist.',   cost: { dewdrops: 130000, glowspores: 2000 }, rate: 260 },

  // Mushroom Ring — glowspores
  { id: 'beetle',      loc: 'mushroom', name: 'Glow Beetle', plural: 'Glow Beetles',   desc: 'Shuffles under caps, shaking spores loose.', cost: { glowspores: 15 },     rate: 0.1 },
  { id: 'snail',       loc: 'mushroom', name: 'Spore Snail', plural: 'Spore Snails',   desc: 'Slow, steady, and covered in sparkles.',     cost: { glowspores: 120 },    rate: 1 },
  { id: 'toadtender',  loc: 'mushroom', name: 'Toad Tender', plural: 'Toad Tenders',   desc: 'Waters the ring with pond dew.',             cost: { glowspores: 1300, dewdrops: 3000 },     rate: 9 },
  { id: 'gnome',       loc: 'mushroom', name: 'Mycel Gnome', plural: 'Mycel Gnomes',   desc: 'Coaxes new caps from the dark soil.',        cost: { glowspores: 14000, dewdrops: 40000 },   rate: 50 },
  { id: 'lanternmoth', loc: 'mushroom', name: 'Lantern Moth', plural: 'Lantern Moths', desc: 'Its wingbeats stir up clouds of light.',     cost: { glowspores: 150000, dewdrops: 400000 }, rate: 280 },

  // Ancient Oak — amber sap
  { id: 'acornsprite', loc: 'oak', name: 'Acorn Sprite', plural: 'Acorn Sprites',   desc: 'Taps the bark with a tiny acorn hammer.',  cost: { ambersap: 15 },     rate: 0.1 },
  { id: 'sapsquirrel', loc: 'oak', name: 'Sap Squirrel', plural: 'Sap Squirrels',   desc: 'Ferries golden droplets down the trunk.',  cost: { ambersap: 120 },    rate: 1 },
  { id: 'woodpecker',  loc: 'oak', name: 'Woodpecker Drummer', plural: 'Woodpecker Drummers', desc: 'Drums a rhythm that makes the sap flow.', cost: { ambersap: 1300, glowspores: 20000 }, rate: 9 },
  { id: 'dryad',       loc: 'oak', name: 'Dryad Keeper', plural: 'Dryad Keepers',   desc: 'Speaks to the tree, and the tree answers.', cost: { ambersap: 14000, glowspores: 250000 }, rate: 50 },
  { id: 'owlsage',     loc: 'oak', name: 'Owl Sage', plural: 'Owl Sages',           desc: 'Knows every secret vein of the old wood.',  cost: { ambersap: 150000, dewdrops: 50e6 },  rate: 280 },

  // Crystal Grotto — moonshards
  { id: 'crystalmite', loc: 'grotto', name: 'Crystal Mite', plural: 'Crystal Mites', desc: 'Nibbles glittering crumbs off the walls.',  cost: { moonshards: 15 },   rate: 0.1 },
  { id: 'glimmerbat',  loc: 'grotto', name: 'Glimmer Bat', plural: 'Glimmer Bats',   desc: 'Its squeaks crack shards loose.',          cost: { moonshards: 120 },  rate: 1 },
  { id: 'prismpixie',  loc: 'grotto', name: 'Prism Pixie', plural: 'Prism Pixies',   desc: 'Bends moonlight into solid slivers.',      cost: { moonshards: 1300, ambersap: 20000 },  rate: 9 },
  { id: 'geodegolem',  loc: 'grotto', name: 'Geode Golem', plural: 'Geode Golems',   desc: 'Gently cracks open sleeping geodes.',       cost: { moonshards: 14000, ambersap: 250000 }, rate: 50 },
  { id: 'echowyrm',    loc: 'grotto', name: 'Echo Wyrm', plural: 'Echo Wyrms',       desc: 'Sings a note so pure the crystals answer.', cost: { moonshards: 150000, glowspores: 50e6 }, rate: 280 },

  // Starfall Meadow — stardust
  { id: 'dandelionwisp', loc: 'meadow', name: 'Dandelion Wisp', plural: 'Dandelion Wisps', desc: 'Drifts by, collecting dust on its fluff.', cost: { stardust: 15 },   rate: 0.1 },
  { id: 'starhare',    loc: 'meadow', name: 'Star Hare', plural: 'Star Hares',         desc: 'Bounds through the grass kicking up glitter.', cost: { stardust: 120 }, rate: 1 },
  { id: 'cometmoth',   loc: 'meadow', name: 'Comet Moth', plural: 'Comet Moths',       desc: 'Leaves a sparkling trail wherever it flies.',  cost: { stardust: 1300, moonshards: 20000 },  rate: 9 },
  { id: 'wishweaver',  loc: 'meadow', name: 'Wish Weaver', plural: 'Wish Weavers',     desc: 'Spins stray wishes into stardust.',            cost: { stardust: 14000, moonshards: 250000 }, rate: 50 },
  { id: 'moonfairy',   loc: 'meadow', name: 'Moon Fairy', plural: 'Moon Fairies',      desc: 'Calls the stars down to rest.',                cost: { stardust: 150000, ambersap: 50e6 },   rate: 280 },
];

// One-time purchases.
export const UPGRADES = [
  // Pond
  { id: 'ripples',       loc: 'pond', name: 'Moonlit Ripples',  desc: 'Pond taps ×2',       cost: { dewdrops: 100 },    effects: [{ t: 'tapMult', loc: 'pond', x: 2 }] },
  { id: 'silvercurrent', loc: 'pond', name: 'Silver Current',   desc: 'Pond taps ×2',       cost: { dewdrops: 5000 },   effects: [{ t: 'tapMult', loc: 'pond', x: 2 }] },
  { id: 'dewair',        loc: 'pond', name: 'Dew-Laden Air',    desc: 'Pond helpers ×1.5',  cost: { dewdrops: 25000 },  effects: [{ t: 'helperMult', loc: 'pond', x: 1.5 }] },
  { id: 'tidalecho',     loc: 'pond', name: 'Tidal Echo',       desc: 'Each pond tap also gives 3% of pond production per second', cost: { dewdrops: 60000 }, effects: [{ t: 'tapRatePct', loc: 'pond', x: 0.03 }] },
  { id: 'sporedew',      loc: 'pond', name: 'Spore-Dusted Dew', desc: 'Pond helpers ×1.25', cost: { glowspores: 3000 }, effects: [{ t: 'helperMult', loc: 'pond', x: 1.25 }] },

  // Mushroom
  { id: 'sporepuffs',   loc: 'mushroom', name: 'Spore Puffs',    desc: 'Toadstool taps ×2',     cost: { glowspores: 100 },  effects: [{ t: 'tapMult', loc: 'mushroom', x: 2 }] },
  { id: 'glowinggills', loc: 'mushroom', name: 'Glowing Gills',  desc: 'Toadstool taps ×2',     cost: { glowspores: 5000 }, effects: [{ t: 'tapMult', loc: 'mushroom', x: 2 }] },
  { id: 'dampearth',    loc: 'mushroom', name: 'Damp Earth',     desc: 'Mushroom helpers ×1.5', cost: { glowspores: 20000, dewdrops: 50000 }, effects: [{ t: 'helperMult', loc: 'mushroom', x: 1.5 }] },
  { id: 'myceliumweb',  loc: 'mushroom', name: 'Mycelium Web',   desc: 'Each toadstool tap also gives 3% of mushroom production per second', cost: { glowspores: 50000 }, effects: [{ t: 'tapRatePct', loc: 'mushroom', x: 0.03 }] },
  { id: 'amberlanterns',loc: 'mushroom', name: 'Amber Lanterns', desc: 'Mushroom helpers ×1.25', cost: { ambersap: 3000 },  effects: [{ t: 'helperMult', loc: 'mushroom', x: 1.25 }] },

  // Oak
  { id: 'knotholes',  loc: 'oak', name: 'Knotholes',     desc: 'Hollow taps ×2',     cost: { ambersap: 100 },   effects: [{ t: 'tapMult', loc: 'oak', x: 2 }] },
  { id: 'amberglow',  loc: 'oak', name: 'Amberglow',     desc: 'Hollow taps ×2',     cost: { ambersap: 5000 },  effects: [{ t: 'tapMult', loc: 'oak', x: 2 }] },
  { id: 'deeproots',  loc: 'oak', name: 'Deep Roots',    desc: 'Oak helpers ×1.5',   cost: { ambersap: 20000, glowspores: 200000 }, effects: [{ t: 'helperMult', loc: 'oak', x: 1.5 }] },
  { id: 'sapflow',    loc: 'oak', name: 'Rising Sapflow',desc: 'Each hollow tap also gives 3% of oak production per second', cost: { ambersap: 50000 }, effects: [{ t: 'tapRatePct', loc: 'oak', x: 0.03 }] },
  { id: 'shardbark',  loc: 'oak', name: 'Shard-Studded Bark', desc: 'Oak helpers ×1.25', cost: { moonshards: 3000 }, effects: [{ t: 'helperMult', loc: 'oak', x: 1.25 }] },

  // Grotto
  { id: 'facets',      loc: 'grotto', name: 'Polished Facets', desc: 'Crystal taps ×2',     cost: { moonshards: 100 },  effects: [{ t: 'tapMult', loc: 'grotto', x: 2 }] },
  { id: 'resonance',   loc: 'grotto', name: 'Resonance',       desc: 'Crystal taps ×2',     cost: { moonshards: 5000 }, effects: [{ t: 'tapMult', loc: 'grotto', x: 2 }] },
  { id: 'crystalveins',loc: 'grotto', name: 'Crystal Veins',   desc: 'Grotto helpers ×1.5', cost: { moonshards: 20000, ambersap: 200000 }, effects: [{ t: 'helperMult', loc: 'grotto', x: 1.5 }] },
  { id: 'harmonics',   loc: 'grotto', name: 'Harmonics',       desc: 'Each crystal tap also gives 3% of grotto production per second', cost: { moonshards: 50000 }, effects: [{ t: 'tapRatePct', loc: 'grotto', x: 0.03 }] },
  { id: 'stardustglaze',loc: 'grotto', name: 'Stardust Glaze', desc: 'Grotto helpers ×1.25', cost: { stardust: 3000 }, effects: [{ t: 'helperMult', loc: 'grotto', x: 1.25 }] },

  // Meadow
  { id: 'stargazing',     loc: 'meadow', name: 'Stargazing',      desc: 'Star taps ×2',        cost: { stardust: 100 },  effects: [{ t: 'tapMult', loc: 'meadow', x: 2 }] },
  { id: 'wishfulthinking',loc: 'meadow', name: 'Wishful Thinking',desc: 'Star taps ×2',        cost: { stardust: 5000 }, effects: [{ t: 'tapMult', loc: 'meadow', x: 2 }] },
  { id: 'solarwind',      loc: 'meadow', name: 'Solar Wind',      desc: 'Meadow helpers ×1.5', cost: { stardust: 20000, moonshards: 200000 }, effects: [{ t: 'helperMult', loc: 'meadow', x: 1.5 }] },
  { id: 'constellations', loc: 'meadow', name: 'Constellations',  desc: 'Each star tap also gives 3% of meadow production per second', cost: { stardust: 50000 }, effects: [{ t: 'tapRatePct', loc: 'meadow', x: 0.03 }] },
  { id: 'cosmicharmony',  loc: 'meadow', name: 'Cosmic Harmony',  desc: 'Everything everywhere ×1.25', cost: { stardust: 500000, moonshards: 2e6 }, effects: [{ t: 'globalMult', x: 1.25 }] },
];

// Location features: built in order, each changes how the scene looks.
export const FEATURES = [
  // Pond
  { id: 'lilypads',   loc: 'pond', name: 'Lily Pads',    desc: 'Pond taps ×1.5', flavor: 'Lily pads bloom across the water.', cost: { dewdrops: 2500 }, effects: [{ t: 'tapMult', loc: 'pond', x: 1.5 }] },
  { id: 'bridge',     loc: 'pond', name: 'Stone Bridge', desc: 'Pond helpers ×1.25 · invites the Gentle Rain event', flavor: 'A mossy bridge arches over the pond.', cost: { dewdrops: 30000, glowspores: 500 }, effects: [{ t: 'helperMult', loc: 'pond', x: 1.25 }] },
  { id: 'moonwell',   loc: 'pond', name: 'Moonwell',     desc: 'Pond helpers ×2', flavor: 'The Moonwell glows with captured moonlight.', cost: { dewdrops: 250000, glowspores: 20000 }, effects: [{ t: 'helperMult', loc: 'pond', x: 2 }] },
  { id: 'reedchimes', loc: 'pond', name: 'Reed Chimes',  desc: 'Offline earnings last 2 hours longer', flavor: 'Reed chimes tinkle in the night breeze.', cost: { dewdrops: 1000000, glowspores: 100000 }, effects: [{ t: 'offlineHours', x: 2 }] },

  // Mushroom
  { id: 'lanterns',    loc: 'mushroom', name: 'Fairy Lanterns',   desc: 'Toadstool taps ×2', flavor: 'Fairy lanterns light up the ring.', cost: { glowspores: 1500, dewdrops: 8000 }, effects: [{ t: 'tapMult', loc: 'mushroom', x: 2 }] },
  { id: 'sporegarden', loc: 'mushroom', name: 'Spore Garden',     desc: 'Mushroom helpers ×2', flavor: 'A spore garden sprouts and glows.', cost: { glowspores: 40000, dewdrops: 100000 }, effects: [{ t: 'helperMult', loc: 'mushroom', x: 2 }] },
  { id: 'throne',      loc: 'mushroom', name: 'Toadstool Throne', desc: 'Everything everywhere ×1.5', flavor: 'A throne grows for the Fairy Queen.', cost: { glowspores: 400000, dewdrops: 2000000 }, effects: [{ t: 'globalMult', x: 1.5 }] },

  // Oak
  { id: 'ropeswing', loc: 'oak', name: 'Rope Swing',        desc: 'Hollow taps ×2', flavor: 'A rope swing sways from a low branch.', cost: { ambersap: 1500, glowspores: 30000 }, effects: [{ t: 'tapMult', loc: 'oak', x: 2 }] },
  { id: 'library',   loc: 'oak', name: 'Treehouse Library', desc: 'All upgrades and features cost 15% less', flavor: 'A treehouse library nestles in the branches.', cost: { ambersap: 40000, glowspores: 500000 }, effects: [{ t: 'upgradeDiscount', x: 0.85 }] },
  { id: 'heartwood', loc: 'oak', name: 'Heartwood Core',    desc: 'Oak helpers ×2', flavor: 'The heart of the oak awakens with a golden glow.', cost: { ambersap: 400000, dewdrops: 100e6 }, effects: [{ t: 'helperMult', loc: 'oak', x: 2 }] },

  // Grotto
  { id: 'prisms',      loc: 'grotto', name: 'Light Prisms',  desc: 'Grotto helpers ×1.5', flavor: 'Prisms scatter rainbows across the cave.', cost: { moonshards: 1500, ambersap: 30000 }, effects: [{ t: 'helperMult', loc: 'grotto', x: 1.5 }] },
  { id: 'echochamber', loc: 'grotto', name: 'Echo Chamber',  desc: 'Every tap, anywhere, has a 20% chance to count twice', flavor: 'The Echo Chamber hums. Your taps ring twice.', cost: { moonshards: 40000, ambersap: 500000 }, effects: [{ t: 'tapEcho', x: 0.2 }] },
  { id: 'geodevault',  loc: 'grotto', name: 'Geode Vault',   desc: 'Grotto helpers ×2', flavor: 'A great geode splits open, glittering.', cost: { moonshards: 400000, glowspores: 100e6 }, effects: [{ t: 'helperMult', loc: 'grotto', x: 2 }] },

  // Meadow
  { id: 'starloom',     loc: 'meadow', name: 'Star Loom',     desc: 'Star taps ×2', flavor: 'A loom of starlight hums in the grass.', cost: { stardust: 1500, moonshards: 30000 }, effects: [{ t: 'tapMult', loc: 'meadow', x: 2 }] },
  { id: 'wishingstone', loc: 'meadow', name: 'Wishing Stone', desc: 'Events come 25% more often and last 50% longer', flavor: 'The Wishing Stone glows with old runes.', cost: { stardust: 40000, moonshards: 500000 }, effects: [{ t: 'eventFreq', x: 0.75 }, { t: 'eventDuration', x: 1.5 }] },
  { id: 'observatory',  loc: 'meadow', name: 'Observatory',   desc: 'Meadow helpers ×2 · see which event is coming next', flavor: 'An observatory rises on the hill.', cost: { stardust: 400000, ambersap: 100e6 }, effects: [{ t: 'helperMult', loc: 'meadow', x: 2 }, { t: 'eventPreview' }] },
];

// Random events. `req` limits when an event can happen.
// `special` events have custom behaviour in the UI (meteor stars, the wandering fairy).
export const EVENTS = [
  { id: 'moonrise',   name: 'Moonrise Blessing', icon: '🌕', desc: 'Everything earns ×2',                     dur: 60,  weight: 1.2, effects: [{ t: 'globalMult', x: 2 }] },
  { id: 'rain',       name: 'Gentle Rain',       icon: '🌧️', desc: 'Pond helpers ×3 · Meadow helpers ×½',     dur: 90,  weight: 1, req: { feature: 'bridge' }, effects: [{ t: 'helperMult', loc: 'pond', x: 3 }, { t: 'helperMult', loc: 'meadow', x: 0.5 }] },
  { id: 'sporebloom', name: 'Spore Bloom',       icon: '🍄', desc: 'Toadstool taps ×5',                       dur: 45,  weight: 1, req: { loc: 'mushroom' }, effects: [{ t: 'tapMult', loc: 'mushroom', x: 5 }] },
  { id: 'meteor',     name: 'Meteor Shower',     icon: '🌠', desc: 'Tap the shooting stars for Stardust',     dur: 30,  weight: 1, req: { loc: 'meadow' }, effects: [], special: 'meteor' },
  { id: 'owlcouncil', name: 'Owl Council',       icon: '🦉', desc: 'Helpers cost 25% less',                    dur: 120, weight: 1, req: { loc: 'oak' }, effects: [{ t: 'helperDiscount', x: 0.75 }] },
  { id: 'fog',        name: 'Mischief Fog',      icon: '🌫️', desc: 'Taps ×3 · helpers ×½',                     dur: 60,  weight: 0.8, req: { loc: 'grotto' }, effects: [{ t: 'tapMult', loc: '*', x: 3 }, { t: 'helperMult', loc: '*', x: 0.5 }] },
  { id: 'fairy',      name: 'Wandering Fairy',   icon: '🧚', desc: 'Tap the fairy before she flies off',       dur: 30,  weight: 1.2, effects: [], special: 'fairy' },
];
export const FIRST_EVENT_AT = 90;           // seconds of play before the first event
export const EVENT_GAP = [120, 240];        // seconds between events

// Gifts the wandering fairy offers (the player picks one).
export const FAIRY_GIFTS = [
  { id: 'bounty',  name: 'Dew of Plenty',   icon: '🎁', desc: 'Instantly gain 10 minutes of production of everything' },
  { id: 'wings',   name: 'Quickened Wings', icon: '🦋', desc: 'All helpers ×3 for 60 seconds', dur: 60, effects: [{ t: 'helperMult', loc: '*', x: 3 }] },
  { id: 'fingers', name: 'Starlit Fingers', icon: '✨', desc: 'All taps ×10 for 45 seconds',   dur: 45, effects: [{ t: 'tapMult', loc: '*', x: 10 }] },
];

export const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
export const LOCATION_BY_ID = byId(LOCATIONS);
export const HELPER_BY_ID = byId(HELPERS);
export const UPGRADE_BY_ID = byId(UPGRADES);
export const FEATURE_BY_ID = byId(FEATURES);
export const EVENT_BY_ID = byId(EVENTS);
export const GIFT_BY_ID = byId(FAIRY_GIFTS);

// ---------- Prestige: Moonstones and the Moon Shrine ----------
// Run value: each resource's earnings this run are weighted, then turned into Moonstones.
export const RESOURCE_WEIGHT = { dewdrops: 1, glowspores: 2, ambersap: 10, moonshards: 40, stardust: 150 };
export const STONE_SCALE = 1e10;         // run value that gives the first few stones
export const STONE_FACTOR = 5;           // stones = floor(FACTOR * (value / SCALE) ^ EXP)
export const STONE_EXP = 0.4;
export const STONE_BONUS = 0.01;         // each unspent Moonstone: +1% to everything
export const FINALE_PRESTIGE = 5;        // the soft ending happens on this prestige
export const PRESTIGE_REQ_LOC = 'meadow';// must unlock this location before prestiging

// Shrine paths. Within a path, upgrades are bought in order.
export const SHRINE_PATHS = [
  { id: 'tides',   name: 'Tides',      icon: '🌊', desc: 'Tapping' },
  { id: 'kinship', name: 'Kinship',    icon: '🧚', desc: 'Helpers' },
  { id: 'way',     name: 'Wayfinding', icon: '🗺️', desc: 'Progress' },
  { id: 'fate',    name: 'Fate',       icon: '🔮', desc: 'Events' },
];

export const SHRINE = [
  // Tides — tapping
  { id: 'moontouch',   path: 'tides', name: 'Moonlit Touch',   desc: 'All taps ×3',                                   cost: 2,   effects: [{ t: 'tapMult', loc: '*', x: 3 }] },
  { id: 'doubleecho',  path: 'tides', name: 'Double Ripple',   desc: 'Taps have an extra 15% chance to count twice',   cost: 8,   effects: [{ t: 'tapEcho', x: 0.15 }] },
  { id: 'steadyhand',  path: 'tides', name: 'Steady Hand',     desc: 'Hold your finger down to tap 6 times a second',  cost: 30,  effects: [{ t: 'holdTap' }] },
  { id: 'tidalsurge',  path: 'tides', name: 'Tidal Surge',     desc: 'Every tap also gives 5% of that place’s production per second', cost: 100, effects: [{ t: 'tapRatePct', loc: '*', x: 0.05 }] },

  // Kinship — helpers
  { id: 'kindred',     path: 'kinship', name: 'Kindred Spirits',   desc: 'All helpers ×3',                                        cost: 2,   effects: [{ t: 'helperMult', loc: '*', x: 3 }] },
  { id: 'faebargain',  path: 'kinship', name: 'Fae Bargain',       desc: 'Helpers cost half as much',                              cost: 8,   effects: [{ t: 'helperDiscount', x: 0.5 }] },
  { id: 'welcome',     path: 'kinship', name: 'Welcome Party',     desc: 'Each place starts with 10 of its first helper and 5 of its second', cost: 30, effects: [{ t: 'startHelpers' }] },
  { id: 'moonbonds',   path: 'kinship', name: 'Bonds of Moonlight',desc: 'All helpers ×5',                                         cost: 120,  effects: [{ t: 'helperMult', loc: '*', x: 5 }] },

  // Wayfinding — progress
  { id: 'pocketdew',   path: 'way', name: 'Pocket of Dew',     desc: 'Start each run with 25,000 Dewdrops and 2,500 Glowspores', cost: 2,  effects: [{ t: 'startRes' }] },
  { id: 'longnight',   path: 'way', name: 'Long Night',        desc: 'Offline earnings last 4 hours longer',                     cost: 6,  effects: [{ t: 'offlineHours', x: 4 }] },
  { id: 'paths',       path: 'way', name: 'Remembered Paths',  desc: 'The Mushroom Ring and Ancient Oak stay unlocked',          cost: 20, effects: [{ t: 'keepLocs', locs: ['mushroom', 'oak'] }] },
  { id: 'foundations', path: 'way', name: 'First Foundations', desc: 'The first feature at every place stays built',             cost: 50, effects: [{ t: 'keepFirstFeature' }] },
  { id: 'farpaths',    path: 'way', name: 'Far Paths',         desc: 'The Crystal Grotto and Starfall Meadow stay unlocked too',  cost: 120, effects: [{ t: 'keepLocs', locs: ['grotto', 'meadow'] }] },

  // Fate — events
  { id: 'omens',       path: 'fate', name: 'Gathering Omens',  desc: 'Events come 25% more often',                       cost: 3,  effects: [{ t: 'eventFreq', x: 0.75 }] },
  { id: 'lingering',   path: 'fate', name: 'Lingering Magic',  desc: 'Events last 50% longer',                           cost: 12, effects: [{ t: 'eventDuration', x: 1.5 }] },
  { id: 'kindfortune', path: 'fate', name: 'Kind Fortune',     desc: 'Events no longer slow anything down',              cost: 35, effects: [{ t: 'noHarm' }] },
  { id: 'fairyfavor',  path: 'fate', name: 'Fairy’s Favor',    desc: 'Fairy gifts are twice as strong',                  cost: 90, effects: [{ t: 'giftMult', x: 2 }] },

  // Capstone — appears after the 4th prestige
  { id: 'fullmoon', path: 'capstone', name: 'Call of the Full Moon', desc: 'Everything ×5. The full moon is ready to rise.', cost: 150, minPrestige: 4, effects: [{ t: 'globalMult', x: 5 }] },
];
export const SHRINE_BY_ID = byId(SHRINE);
