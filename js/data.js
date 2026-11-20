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

// Helper-specific upgrades: two per helper, unlocked by how many you own.
const HELPER_PERKS = {
  firefly: ['Brighter Tails', 'Firefly Lanterns'],        watersprite: ['Splash Dance', 'Tidecallers'],
  lilypixie: ['Lily Cups', 'Petal Ladles'],               frogbard: ['Croaking Chorus', 'Ballad of the Moon'],
  mothweaver: ['Silken Nets', 'Moonsilk Looms'],
  beetle: ['Shiny Shells', 'Beetle Brigade'],             snail: ['Slick Trails', 'Spiral Shells'],
  toadtender: ['Watering Cans', 'Gardeners’ Guild'],      gnome: ['Little Shovels', 'Gnome Tunnels'],
  lanternmoth: ['Brighter Wings', 'Lantern Festival'],
  acornsprite: ['Tiny Hammers', 'Acorn Caps'],            sapsquirrel: ['Bushy Tails', 'Squirrel Relay'],
  woodpecker: ['Steady Beat', 'Drumline'],                dryad: ['Whispering Bark', 'Heartsong'],
  owlsage: ['Old Wisdom', 'Parliament of Owls'],
  crystalmite: ['Sharp Mandibles', 'Glitter Colonies'],   glimmerbat: ['Echo Squeaks', 'Cave Choir'],
  prismpixie: ['Bent Light', 'Rainbow Forge'],            geodegolem: ['Gentle Hands', 'Stone Hearts'],
  echowyrm: ['Pure Notes', 'Wyrmsong'],
  dandelionwisp: ['Fluffier Seeds', 'Wishing Winds'],     starhare: ['Quick Feet', 'Moon Leaps'],
  cometmoth: ['Brighter Trails', 'Comet Swarm'],          wishweaver: ['Spun Wishes', 'Tapestry of Dreams'],
  moonfairy: ['Silver Wands', 'Court of the Moon'],
};
export const HELPER_UPGRADE_TIERS = [
  { req: 10, costMult: 50,   x: 2 },
  { req: 50, costMult: 5000, x: 3 },
];
for (const h of HELPERS) {
  HELPER_UPGRADE_TIERS.forEach((tier, i) => {
    const cost = {};
    for (const [r, amt] of Object.entries(h.cost)) cost[r] = amt * tier.costMult;
    UPGRADES.push({
      id: `${h.id}_perk${i + 1}`, loc: h.loc, helper: h.id, req: tier.req,
      name: HELPER_PERKS[h.id][i], desc: `${h.plural} gather ×${tier.x}`,
      cost, effects: [{ t: 'helperOne', id: h.id, x: tier.x }],
    });
  });
}

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
  { id: 'bloodmoon',  name: 'Blood Moon',        icon: '🩸', desc: 'Crimson Gate cooldown −15 min · castle visits give ×2 Blood Drops', dur: 120, weight: 0.5, req: { gateway: true }, effects: [], special: 'bloodmoon' },
  { id: 'chimes',     name: 'Midnight Chimes',   icon: '🕛', desc: 'Cuckoo Gate cooldown −15 min · clock visits give ×2 Seconds', dur: 120, weight: 0.5, req: { gateway: true }, effects: [], special: 'chimes' },
  { id: 'hightide',   name: 'High Tide',         icon: '🌊', desc: 'Tide Gate cooldown −15 min · palace visits give ×2 Pearls', dur: 120, weight: 0.5, req: { gateway: true }, effects: [], special: 'hightide' },
  { id: 'rainbow',    name: 'Rainbow Day',       icon: '🌈', desc: 'Sky Gate cooldown −15 min · cloud visits give ×2 Sunbeams', dur: 120, weight: 0.5, req: { gateway: true }, effects: [], special: 'rainbow' },
  { id: 'applause',   name: 'Grand Applause',    icon: '👏', desc: 'Palm Gate cooldown −15 min · high-fives count double', dur: 120, weight: 0.5, req: { gateway: true }, effects: [], special: 'applause' },
  { id: 'fairy',      name: 'Wandering Fairy',   icon: '🧚', desc: 'Tap the fairy before she flies off',       dur: 30,  weight: 1.2, effects: [], special: 'fairy' },
];
// Blood Drop exchange. Drops have diminishing returns: a haul is worth
//   BLOOD_SECONDS × drops^BLOOD_EXP  seconds of the chosen place's output
// (output = its helpers per second, or BLOOD_TAP_EQUIV taps a second if that's more),
// times the Vampire's Chalice bonus. ~400 drops ≈ 1.5 min; ~27,000 ≈ 25 min.
export const BLOOD_SECONDS = 2.5;
export const BLOOD_EXP = 0.6;
export const BLOOD_TAP_EQUIV = 3;
export const CHALICE_VALUE_PER_LEVEL = 0.2;
export const FIRST_EVENT_AT = 90;           // seconds of play before the first event
export const EVENT_GAP = [120, 240];        // seconds between events

// Gifts the wandering fairy offers (the player picks one).
export const FAIRY_GIFTS = [
  { id: 'bounty',  name: 'Dew of Plenty',   icon: '🎁', desc: 'Instantly gain 10 minutes of production of everything' },
  { id: 'wings',   name: 'Quickened Wings', icon: '🦋', desc: 'All helpers ×3 for 60 seconds', dur: 60, effects: [{ t: 'helperMult', loc: '*', x: 3 }] },
  { id: 'fingers', name: 'Starlit Fingers', icon: '✨', desc: 'All taps ×10 for 45 seconds',   dur: 45, effects: [{ t: 'tapMult', loc: '*', x: 10 }] },
  // Only offered with the Fairy Bell from the Workshop
  { id: 'moonbeam', name: 'Moonbeam Blessing', icon: '🌕', desc: 'Everything ×4 for 40 seconds', dur: 40, bell: true, effects: [{ t: 'globalMult', x: 4 }] },
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
export const STONE_FACTOR = 1.5;           // stones = floor(FACTOR * (value / SCALE) ^ EXP)
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

// ---------- Workshop: realm-wide upgrades (reset on prestige) ----------
// `value` is the price of level 1 in Dewdrop-equivalents (see RESOURCE_WEIGHT);
// each level costs `growth` times more. Higher levels also ask for later resources;
// `tier` sets how many resource types even level 1 needs.
export const HAND_RATES = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];   // taps per second at levels 1–10
export const CRIT_MULT = 10;
export const STREAK_MAX = [1, 1.5, 2, 2.5];                       // combo cap at levels 0–3

export const WORKSHOP_GROUPS = ['Tapping', 'Helpers', 'Events & surprises', 'Gateways', 'Comfort'];
export const WORKSHOP = [
  { id: 'hand', group: 'Tapping', icon: '✋', name: 'Enchanted Hand', max: 10, value: 300, growth: 6,
    desc: (l) => l ? `Taps along with you ${HAND_RATES[l - 1]}× a second` : 'A magic hand follows you and taps what you tap',
    next: (l) => `${HAND_RATES[l]} taps a second` },
  { id: 'twinhand', group: 'Tapping', icon: '🤲', name: 'Twin Hand', max: 1, value: 2e8, growth: 1, tier: 3, req: { hand: 5 },
    desc: () => 'A second enchanted hand joins the first', next: () => 'Two hands tapping' },
  { id: 'clover', group: 'Tapping', icon: '🍀', name: 'Lucky Clover', max: 5, value: 5000, growth: 8,
    desc: (l) => l ? `${l * 2}% chance for a critical tap worth ×${CRIT_MULT}` : `Taps can be critical: worth ×${CRIT_MULT}`,
    next: (l) => `${(l + 1) * 2}% chance` },
  { id: 'streak', group: 'Tapping', icon: '🔥', name: 'Tap Streak', max: 3, value: 2000, growth: 12,
    desc: (l) => l ? `Keep tapping to build a combo up to ×${STREAK_MAX[l]}` : 'Keep tapping to build a combo meter',
    next: (l) => `Combo up to ×${STREAK_MAX[l + 1]}` },

  { id: 'steward', group: 'Helpers', icon: '🧹', name: 'Helper Steward', max: 1, value: 10000, growth: 1,
    desc: () => 'Recruits helpers for you at the place you’re viewing', next: () => 'Automatic recruiting' },
  { id: 'almanac', group: 'Helpers', icon: '📖', name: 'Fairy Almanac', max: 1, value: 3000, growth: 1,
    desc: () => 'Marks which helper is the best value. The Steward can follow it', next: () => 'Best-value advice' },
  { id: 'whistle', group: 'Helpers', icon: '📯', name: 'Fairy Whistle', max: 10, value: 1000, growth: 4,
    desc: (l) => l ? `All helpers +${l * 10}%` : 'All helpers gather more', next: (l) => `+${(l + 1) * 10}%` },

  { id: 'lotus', group: 'Events & surprises', icon: '🪷', name: 'Golden Lotus', max: 5, value: 20000, growth: 6,
    desc: (l) => l ? `A golden lotus drifts by about every ${Math.round(LOTUS_EVERY[l - 1] / 60)} min. Tap it for a burst` : 'A rare golden lotus drifts by. Tap it for a burst',
    next: (l) => `About every ${Math.round(LOTUS_EVERY[l] / 60)} min, bigger bursts` },
  { id: 'magnet', group: 'Events & surprises', icon: '🧲', name: 'Star Magnet', max: 1, value: 5e8, growth: 1, tier: 5,
    desc: () => 'Shooting stars are caught automatically', next: () => 'Catch every shooting star' },
  { id: 'chalice', group: 'Events & surprises', icon: '🍷', name: 'Vampire’s Chalice', max: 3, value: 1e5, growth: 10, tier: 2,
    desc: (l) => l ? `Blood Drop hauls worth +${l * 20}% and +${l} drop per tap` : 'Bigger castle hauls and better exchanges',
    next: (l) => `+${(l + 1) * 20}% value, +${l + 1} per tap` },
  { id: 'bell', group: 'Events & surprises', icon: '🔔', name: 'Fairy Bell', max: 1, value: 1e6, growth: 1, tier: 2,
    desc: () => 'The Wandering Fairy stays twice as long and offers a 4th gift', next: () => 'A longer visit and a new gift' },

  { id: 'gateway', group: 'Gateways', icon: '🌀', name: 'Moonlit Gateway', max: 1, value: 5e6, growth: 1, tier: 3, keep: true,
    desc: (l) => l ? 'The Gate Room is open. Visit it from the place tabs' : 'Opens a Gate Room of portals to other worlds. Stays through prestiges',
    next: () => 'Open the Gate Room' },
  { id: 'lantern', group: 'Comfort', icon: '🏮', name: 'Moon Lantern', max: 3, value: 50000, growth: 8,
    desc: (l) => l ? `Offline earnings last ${l * 2} hours longer, with a summary by place` : 'Longer offline earnings and a summary by place',
    next: (l) => `+${(l + 1) * 2} hours` },
];
export const LOTUS_EVERY = [300, 240, 190, 150, 120]; // seconds of play between lotuses at levels 1–5
export const WORKSHOP_BY_ID = byId(WORKSHOP);
export const RES_ORDER = ['dewdrops', 'glowspores', 'ambersap', 'moonshards', 'stardust'];

// ---------- Gateways: portals to other worlds, opened from the Gate Room ----------
// Visits and cooldowns run on real time, so cooldowns finish even while the game is closed.
export const GATES = [
  { id: 'castle', name: 'Crimson Gate', world: 'Crimson Castle', icon: '🏰', color: '#d0283c',
    blurb: 'A vampire’s castle under a red moon. Tap the blood pool for Blood Drops and watch the windows…',
    visitSec: 75, cooldownMin: 30 },
  { id: 'clock', name: 'Cuckoo Gate', world: 'Cuckoo Clockworks', icon: '⏰', color: '#e0a040',
    blurb: 'Inside a giant cuckoo clock. Tap the clock to collect Seconds, then spend them as Borrowed Time: everything ×2 for that long.',
    visitSec: 60, cooldownMin: 45 },
  { id: 'palace', name: 'Tide Gate', world: 'Sunken Palace', icon: '🐚', color: '#3ab0d0',
    blurb: 'An undersea palace. Tap the giant clam for Pearls; they’re strung into a necklace that boosts everything forever.',
    visitSec: 60, cooldownMin: 60 },
  { id: 'hands', name: 'Palm Gate', world: 'High-Five Heights', icon: '✋', color: '#ffb36a',
    blurb: 'A friendly realm of giant hands. High-five the big hand to earn up to 8 helping hands that tap with you for 3 minutes.',
    visitSec: 60, cooldownMin: 40 },
  { id: 'clouds', name: 'Sky Gate', world: 'Cloud Isles', icon: '☁️', color: '#ffb3e0',
    blurb: 'Floating islands above the clouds. Tap the rainbow cloud for Sunbeams; they make your next time away earn double.',
    visitSec: 60, cooldownMin: 45 },
];
export const GATE_BY_ID = byId(GATES);
export const BLOOD_MOON_COOLDOWN_CUT_MIN = 15;

// Cuckoo Clockworks: Seconds collected become "Borrowed Time", a boost to all
// production lasting that many seconds of play (added to any time left, up to the cap).
export const BORROWED_MULT = 2;
export const BORROWED_CAP_SEC = 30 * 60;
export const CLOCK_CRIT_SECS = 5;      // a critical tap gives this many seconds
export const CUCKOO_SECS = 30;         // tapping the cuckoo bird
export const CHIMES_COOLDOWN_CUT_MIN = 15;
// Gate events: which gate each one helps (cooldown cut, ×2 haul while it lasts).
export const GATE_EVENTS = { bloodmoon: 'castle', chimes: 'clock', hightide: 'palace', rainbow: 'clouds', applause: 'hands' };
export const GATE_EVENT_CUT_MIN = 15;

// Sunken Palace and Cloud Isles share one set of rules: tap for a currency,
// catch the pop-up visitor for a bonus, then the haul becomes the world's reward.
export const SIMPLE_WORLDS = {
  palace: { currency: 'Pearls', icon: '🦪', color: '#e6f4ff', critAmt: 5, popupAmt: 25, popup: 'mermaid', event: 'hightide', scene: 'palace' },
  clouds: { currency: 'Sunbeams', icon: '☀️', color: '#ffe27a', critAmt: 5, popupAmt: 25, popup: 'whale', event: 'rainbow', scene: 'clouds' },
  hands: { currency: 'High-fives', icon: '✋', color: '#ffd6a8', critAmt: 3, popupAmt: 10, popup: 'shyhand', event: 'applause', scene: 'heights' },
};
// High-Five Heights: hand k needs HAND_STEP_BASE + HAND_STEP_GROWTH × k more high-fives (10, 15, 20 … 45).
export const HELPING_HANDS_MAX = 8;
export const HAND_STEP_BASE = 5;
export const HAND_STEP_GROWTH = 5;
export const HELPING_HANDS_SEC = 180;
export const HELPING_HAND_RATE = 2; // taps a second each (or the Enchanted Hand's rate, if faster)
// Pearl Necklace: strand n needs PEARL_STRAND_STEP × n more pearls; each strand is +2% to everything, forever.
export const PEARL_STRAND_STEP = 50;
export const PEARL_STRAND_BONUS = 0.02;
// Sunbeams: each stores this many seconds of double offline earnings, up to the cap.
export const SUN_SECS_PER_BEAM = 30;
export const SUN_BANK_CAP_H = 12;

export const TIME_BUFF = { id: 'borrowed', name: 'Borrowed Time', icon: '⏳', desc: `Everything ×${BORROWED_MULT}` };

// ---------- Fairy wardrobe (purely cosmetic) ----------
// Drawings live in avatar.js. `from` says how each item is unlocked:
//   'starter' · { place: id } (first visit) · { ach: id } · { achCount: n } · { prestige: n }
export const COSTUME_SLOTS = [
  { id: 'head', name: 'Headwear', none: 'none_head' },
  { id: 'outfit', name: 'Outfit' },
  { id: 'feet', name: 'Shoes', none: 'none_feet' },
  { id: 'held', name: 'In hand', none: 'none_held' },
];
export const COSTUMES = [
  { id: 'none_head', slot: 'head', name: 'Nothing', from: 'starter' },
  { id: 'flower_clip', slot: 'head', name: 'Flower Clip', from: 'starter' },
  { id: 'bow', slot: 'head', name: 'Ribbon Bow', from: 'starter' },
  { id: 'lily_crown', slot: 'head', name: 'Lily Crown', from: { place: 'pond' } },
  { id: 'toadstool_cap', slot: 'head', name: 'Toadstool Cap', from: { place: 'mushroom' } },
  { id: 'acorn_cap', slot: 'head', name: 'Acorn Cap', from: { place: 'oak' } },
  { id: 'crystal_tiara', slot: 'head', name: 'Crystal Tiara', from: { place: 'grotto' } },
  { id: 'star_crown', slot: 'head', name: 'Star Crown', from: { place: 'meadow' } },
  { id: 'bat_band', slot: 'head', name: 'Bat Headband', from: { place: 'castle' } },
  { id: 'moon_crown', slot: 'head', name: 'Moon Circlet', from: { prestige: 1 } },
  { id: 'lotus_crown', slot: 'head', name: 'Golden Lotus Crown', from: { ach: 'lotus10' } },
  { id: 'witch_hat', slot: 'head', name: 'Starry Witch Hat', from: { achCount: 25 } },
  { id: 'halo', slot: 'head', name: 'Moonlight Halo', from: { prestige: 5 } },

  { id: 'leaf_dress', slot: 'outfit', name: 'Leaf Dress', from: 'starter' },
  { id: 'petal_dress', slot: 'outfit', name: 'Petal Dress', from: 'starter' },
  { id: 'lily_dress', slot: 'outfit', name: 'Lily Pad Dress', from: { place: 'pond' } },
  { id: 'spore_dress', slot: 'outfit', name: 'Glowspore Dress', from: { place: 'mushroom' } },
  { id: 'leaf_tunic', slot: 'outfit', name: 'Woodland Tunic', from: { place: 'oak' } },
  { id: 'amethyst_gown', slot: 'outfit', name: 'Amethyst Gown', from: { place: 'grotto' } },
  { id: 'starlight_robe', slot: 'outfit', name: 'Starlight Robe', from: { place: 'meadow' } },
  { id: 'vampire_cape', slot: 'outfit', name: 'Vampire Cape', from: { place: 'castle' } },
  { id: 'tinker_apron', slot: 'outfit', name: 'Tinker’s Apron', from: { ach: 'handy' } },
  { id: 'couch_potato', slot: 'outfit', name: 'Couch Potato', from: { helper: 'gnome', count: 50 } },
  { id: 'moon_gown', slot: 'outfit', name: 'Full Moon Gown', from: { prestige: 5 } },

  { id: 'none_feet', slot: 'feet', name: 'Barefoot', from: 'starter' },
  { id: 'slippers', slot: 'feet', name: 'Petal Slippers', from: 'starter' },
  { id: 'boots', slot: 'feet', name: 'Forest Boots', from: 'starter' },
  { id: 'flats', slot: 'feet', name: 'Ruby Flats', from: { achCount: 10 } },
  { id: 'crystal_shoes', slot: 'feet', name: 'Crystal Shoes', from: { place: 'grotto' } },
  { id: 'star_boots', slot: 'feet', name: 'Star Boots', from: { place: 'meadow' } },

  { id: 'none_held', slot: 'held', name: 'Nothing', from: 'starter' },
  { id: 'wand', slot: 'held', name: 'Star Wand', from: 'starter' },
  { id: 'dewdrop_wand', slot: 'held', name: 'Dewdrop Wand', from: { place: 'pond' } },
  { id: 'mushroom_staff', slot: 'held', name: 'Mushroom Staff', from: { place: 'mushroom' } },
  { id: 'amber_lantern', slot: 'held', name: 'Amber Lantern', from: { place: 'oak' } },
  { id: 'crystal_wand', slot: 'held', name: 'Crystal Wand', from: { place: 'grotto' } },
  { id: 'star_wand', slot: 'held', name: 'Shooting Star Wand', from: { place: 'meadow' } },
  { id: 'rose', slot: 'held', name: 'Midnight Rose', from: { place: 'castle' } },
  { id: 'cuckoo_hat', slot: 'head', name: 'Cuckoo Hat', from: { place: 'clock' } },
  { id: 'clock_coat', slot: 'outfit', name: 'Clockmaker’s Coat', from: { place: 'clock' } },
  { id: 'foam_finger', slot: 'held', name: 'Foam Hand', from: { place: 'hands' } },
  { id: 'shell_crown', slot: 'head', name: 'Seashell Crown', from: { place: 'palace' } },
  { id: 'mermaid_gown', slot: 'outfit', name: 'Mermaid Gown', from: { place: 'palace' } },
  { id: 'trident', slot: 'held', name: 'Little Trident', from: { place: 'palace' } },
  { id: 'rainbow_band', slot: 'head', name: 'Rainbow Headband', from: { place: 'clouds' } },
  { id: 'cloud_dress', slot: 'outfit', name: 'Cloud Puff Dress', from: { place: 'clouds' } },
  { id: 'parasol', slot: 'held', name: 'Sky Parasol', from: { place: 'clouds' } },
  // Familiars (drawn in familiars.js) unlock like clothes
  { id: 'none_pet', slot: 'familiar', name: 'No familiar', from: 'starter' },
  { id: 'pet_bunny', slot: 'familiar', name: 'Bunny', from: 'starter' },
  { id: 'pet_kitten', slot: 'familiar', name: 'Kitten', from: 'starter' },
  { id: 'pet_hedgehog', slot: 'familiar', name: 'Hedgehog', from: { place: 'mushroom' } },
  { id: 'pet_fox', slot: 'familiar', name: 'Fox Kit', from: { place: 'oak' } },
  { id: 'pet_axolotl', slot: 'familiar', name: 'Axolotl', from: { place: 'grotto' } },
  { id: 'pet_owlet', slot: 'familiar', name: 'Owlet', from: { place: 'meadow' } },
  { id: 'pet_bat', slot: 'familiar', name: 'Bat Pup', from: { place: 'castle' } },
  { id: 'pet_mouse', slot: 'familiar', name: 'Clockwork Mouse', from: { place: 'clock' } },
  { id: 'pet_otter', slot: 'familiar', name: 'Otter', from: { place: 'palace' } },
  { id: 'pet_lamb', slot: 'familiar', name: 'Cloud Lamb', from: { place: 'clouds' } },
  { id: 'pet_dragon', slot: 'familiar', name: 'Dragon Hatchling', from: { prestige: 1 } },
  { id: 'pet_foal', slot: 'familiar', name: 'Moon Foal', from: { prestige: 5 } },
  { id: 'pet_gnome', slot: 'familiar', name: 'Conspiracy Gnome', from: { helper: 'gnome', count: 50 } },
  // Familiar accessories (drawn in familiars.js), worn by whichever familiar is out
  { id: 'none_acc', slot: 'petacc', name: 'Nothing', from: 'starter' },
  { id: 'bow_tie', slot: 'petacc', name: 'Bow Tie', from: 'starter' },
  { id: 'bandana', slot: 'petacc', name: 'Bandana', from: 'starter' },
  { id: 'party_hat', slot: 'petacc', name: 'Party Hat', from: 'starter' },
  { id: 'flower_crown', slot: 'petacc', name: 'Flower Crown', from: { place: 'pond' } },
  { id: 'bell_collar', slot: 'petacc', name: 'Bell Collar', from: { place: 'mushroom' } },
  { id: 'acorn_hat', slot: 'petacc', name: 'Acorn Hat', from: { place: 'oak' } },
  { id: 'mini_tiara', slot: 'petacc', name: 'Tiny Tiara', from: { place: 'grotto' } },
  { id: 'star_shades', slot: 'petacc', name: 'Star Shades', from: { place: 'meadow' } },
  { id: 'vampire_collar', slot: 'petacc', name: 'Vampire Collar', from: { place: 'castle' } },
  { id: 'top_hat', slot: 'petacc', name: 'Top Hat', from: { place: 'clock' } },
  { id: 'pearl_necklace', slot: 'petacc', name: 'Pearl Necklace', from: { place: 'palace' } },
  { id: 'rainbow_scarf', slot: 'petacc', name: 'Rainbow Scarf', from: { place: 'clouds' } },
  { id: 'tiny_glove', slot: 'petacc', name: 'Tiny Foam Glove', from: { place: 'hands' } },
  { id: 'tinfoil_hat', slot: 'petacc', name: 'Tinfoil Hat', from: { helper: 'gnome', count: 50 } },
  { id: 'propeller_cap', slot: 'petacc', name: 'Propeller Cap', from: { prestige: 1 } },
  { id: 'pet_halo', slot: 'petacc', name: 'Little Halo', from: { prestige: 5 } },
  { id: 'pocket_watch', slot: 'held', name: 'Pocket Watch', from: { place: 'clock' } },
];
export const COSTUME_BY_ID = byId(COSTUMES);
export const COSTUME_PLACE_NAMES = { pond: 'Moonlit Pond', mushroom: 'Mushroom Ring', oak: 'Ancient Oak', grotto: 'Crystal Grotto', meadow: 'Starfall Meadow', castle: 'Crimson Castle', clock: 'Cuckoo Clockworks', palace: 'Sunken Palace', clouds: 'Cloud Isles', hands: 'High-Five Heights' };

// How to unlock an item, in words (for locked items in the wardrobe).
export function costumeHint(c) {
  const f = c.from;
  if (f === 'starter') return '';
  if (f.place) return `Visit the ${COSTUME_PLACE_NAMES[f.place]}`;
  if (f.achCount) return `Earn ${f.achCount} achievements`;
  if (f.prestige === 5) return 'Restore the realm (the finale)';
  if (f.prestige) return 'Begin your first new night (prestige)';
  if (f.ach === 'lotus10') return 'Catch 10 Golden Lotuses';
  if (f.ach === 'handy') return 'Get the Enchanted Hand';
  if (f.helper) return `Recruit ${f.count} Mycel Gnomes`;
  return 'Keep playing';
}

// ---------- Clothing bonuses (only while worn) ----------
// [short description, effects]. Effects use the same types as upgrades, plus
// { t: 'bloodMult', x } for Blood Drop value.
const H = (loc, x) => ({ t: 'helperMult', loc, x });
const T = (loc, x) => ({ t: 'tapMult', loc, x });
export const COSTUME_BONUS = {
  flower_clip: ['Pond taps +10%', [T('pond', 1.1)]],
  bow: ['All taps +5%', [T('*', 1.05)]],
  leaf_dress: ['Pond helpers +5%', [H('pond', 1.05)]],
  petal_dress: ['All taps +5%', [T('*', 1.05)]],
  slippers: ['Offline +30 min', [{ t: 'offlineHours', x: 0.5 }]],
  boots: ['All helpers +3%', [H('*', 1.03)]],
  wand: ['All taps +5%', [T('*', 1.05)]],

  lily_crown: ['Pond helpers +10%', [H('pond', 1.1)]],
  lily_dress: ['Pond helpers +10%', [H('pond', 1.1)]],
  dewdrop_wand: ['Pond taps +20%', [T('pond', 1.2)]],
  toadstool_cap: ['Mushroom helpers +10%', [H('mushroom', 1.1)]],
  spore_dress: ['Mushroom helpers +10%', [H('mushroom', 1.1)]],
  mushroom_staff: ['Toadstool taps +20%', [T('mushroom', 1.2)]],
  acorn_cap: ['Oak helpers +10%', [H('oak', 1.1)]],
  leaf_tunic: ['Oak helpers +10%', [H('oak', 1.1)]],
  amber_lantern: ['Offline +1 hour', [{ t: 'offlineHours', x: 1 }]],
  crystal_tiara: ['Grotto helpers +10%', [H('grotto', 1.1)]],
  amethyst_gown: ['Grotto helpers +10%', [H('grotto', 1.1)]],
  crystal_shoes: ['+3% echo chance', [{ t: 'tapEcho', x: 0.03 }]],
  crystal_wand: ['Crystal taps +20%', [T('grotto', 1.2)]],
  star_crown: ['Meadow helpers +10%', [H('meadow', 1.1)]],
  starlight_robe: ['Meadow helpers +10%', [H('meadow', 1.1)]],
  star_boots: ['Events 5% more often', [{ t: 'eventFreq', x: 0.95 }]],
  star_wand: ['Star taps +20%', [T('meadow', 1.2)]],

  bat_band: ['Blood Drops +10%', [{ t: 'bloodMult', x: 1.1 }]],
  vampire_cape: ['Blood Drops +10%', [{ t: 'bloodMult', x: 1.1 }]],
  rose: ['Blood Drops +10%', [{ t: 'bloodMult', x: 1.1 }]],
  cuckoo_hat: ['Events last 5% longer', [{ t: 'eventDuration', x: 1.05 }]],
  clock_coat: ['Everything +3%', [{ t: 'globalMult', x: 1.03 }]],
  pocket_watch: ['Events last 5% longer', [{ t: 'eventDuration', x: 1.05 }]],
  shell_crown: ['All helpers +3%', [H('*', 1.03)]],
  mermaid_gown: ['All helpers +3%', [H('*', 1.03)]],
  trident: ['All taps +10%', [T('*', 1.1)]],
  rainbow_band: ['Offline +1 hour', [{ t: 'offlineHours', x: 1 }]],
  cloud_dress: ['Offline +1 hour', [{ t: 'offlineHours', x: 1 }]],
  parasol: ['Offline +1 hour', [{ t: 'offlineHours', x: 1 }]],
  foam_finger: ['All taps +10%', [T('*', 1.1)]],

  moon_crown: ['Everything +3%', [{ t: 'globalMult', x: 1.03 }]],
  lotus_crown: ['Everything +3%', [{ t: 'globalMult', x: 1.03 }]],
  witch_hat: ['Events last 10% longer', [{ t: 'eventDuration', x: 1.1 }]],
  halo: ['Everything +5%', [{ t: 'globalMult', x: 1.05 }]],
  moon_gown: ['Everything +5%', [{ t: 'globalMult', x: 1.05 }]],
  tinker_apron: ['Helpers cost 3% less', [{ t: 'helperDiscount', x: 0.97 }]],
  flats: ['All taps +5%', [T('*', 1.05)]],
  couch_potato: ['Offline +2 hours (very relaxed)', [{ t: 'offlineHours', x: 2 }]],
};

// Matching sets: wear every piece from one place for an extra bonus.
export const COSTUME_SETS = {
  pond: ['Moonlit Pond set: pond ×1.25', [H('pond', 1.25), T('pond', 1.25)]],
  mushroom: ['Mushroom Ring set: mushroom ×1.25', [H('mushroom', 1.25), T('mushroom', 1.25)]],
  oak: ['Ancient Oak set: oak ×1.25', [H('oak', 1.25), T('oak', 1.25)]],
  grotto: ['Crystal Grotto set: grotto ×1.25', [H('grotto', 1.25), T('grotto', 1.25)]],
  meadow: ['Starfall Meadow set: meadow ×1.25', [H('meadow', 1.25), T('meadow', 1.25)]],
  castle: ['Crimson Castle set: Blood Drops +25%', [{ t: 'bloodMult', x: 1.25 }]],
  clock: ['Clockworks set: everything +5%', [{ t: 'globalMult', x: 1.05 }]],
  palace: ['Sunken Palace set: everything +5%', [{ t: 'globalMult', x: 1.05 }]],
  clouds: ['Cloud Isles set: offline +2 hours', [{ t: 'offlineHours', x: 2 }]],
};
export const WEAR_SLOTS = ['head', 'outfit', 'feet', 'held'];
