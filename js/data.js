// Static game content. Everything the game knows about lives here so new
// locations, helpers, upgrades and features can be added without touching logic.
//
// Effect types (used by upgrades and features, later by events / prestige):
//   { t: 'tapMult',      loc, x }  multiply tap value at a location
//   { t: 'helperMult',   loc, x }  multiply all helper output at a location
//   { t: 'globalMult',        x }  multiply all production everywhere
//   { t: 'tapRatePct',   loc, x }  each tap also yields x * (location's per-second rate)
//   { t: 'offlineHours',      x }  add hours to the offline earnings cap

export const SAVE_KEY = 'fairyclicker.save';
export const SAVE_VERSION = 1;
export const BASE_OFFLINE_HOURS = 8;
export const COST_GROWTH = 1.15;
export const MILESTONES = [25, 50, 100, 150, 200, 300, 400, 500];

export const RESOURCES = {
  dewdrops:   { name: 'Dewdrops',   short: 'Dew',    color: '#8fd8ff' },
  glowspores: { name: 'Glowspores', short: 'Spores', color: '#b8ff8a' },
};

export const LOCATIONS = [
  {
    id: 'pond',
    name: 'Moonlit Pond',
    resource: 'dewdrops',
    tapVerb: 'Tap the pond',
    blurb: 'Still water holds the moon. Every ripple shakes loose a dewdrop.',
    unlockCost: null,
  },
  {
    id: 'mushroom',
    name: 'Mushroom Ring',
    resource: 'glowspores',
    tapVerb: 'Tap the toadstool',
    blurb: 'A ring of glowing toadstools where the fae dance. The great cap at its heart puffs out glowspores.',
    unlockCost: { dewdrops: 1000 },
  },
  // Teasers for future versions. `soon: true` keeps them locked and unpurchasable.
  { id: 'oak',     name: 'Ancient Oak',     soon: true },
  { id: 'grotto',  name: 'Crystal Grotto',  soon: true },
  { id: 'meadow',  name: 'Starfall Meadow', soon: true },
];

export const HELPERS = [
  // Moonlit Pond — gather dewdrops
  { id: 'firefly',     loc: 'pond', name: 'Firefly', plural: 'Fireflies',      desc: 'Blinks dew off the reeds.',               cost: { dewdrops: 15 },      rate: 0.1 },
  { id: 'watersprite', loc: 'pond', name: 'Water Sprite', plural: 'Water Sprites', desc: 'Skips across the surface, splashing.',    cost: { dewdrops: 100 },     rate: 1 },
  { id: 'lilypixie',   loc: 'pond', name: 'Lily Pixie', plural: 'Lily Pixies',   desc: 'Sips from lily cups and shares the rest.', cost: { dewdrops: 1100 },    rate: 8 },
  { id: 'frogbard',    loc: 'pond', name: 'Frog Bard', plural: 'Frog Bards',    desc: 'Sings the water into droplets.',          cost: { dewdrops: 12000 },   rate: 47 },
  { id: 'mothweaver',  loc: 'pond', name: 'Moth Weaver', plural: 'Moth Weavers',  desc: 'Spins silver nets that catch the mist.',  cost: { dewdrops: 130000, glowspores: 2000 }, rate: 260 },

  // Mushroom Ring — gather glowspores
  { id: 'beetle',      loc: 'mushroom', name: 'Glow Beetle', plural: 'Glow Beetles',  desc: 'Shuffles under caps, shaking spores loose.', cost: { glowspores: 15 },     rate: 0.1 },
  { id: 'snail',       loc: 'mushroom', name: 'Spore Snail', plural: 'Spore Snails',  desc: 'Slow, steady, and covered in sparkles.',   cost: { glowspores: 120 },    rate: 1 },
  { id: 'toadtender',  loc: 'mushroom', name: 'Toad Tender', plural: 'Toad Tenders',  desc: 'Waters the ring with pond dew.',           cost: { glowspores: 1300, dewdrops: 3000 },     rate: 9 },
  { id: 'gnome',       loc: 'mushroom', name: 'Mycel Gnome', plural: 'Mycel Gnomes',  desc: 'Coaxes new caps from the dark soil.',      cost: { glowspores: 14000, dewdrops: 40000 },   rate: 50 },
  { id: 'lanternmoth', loc: 'mushroom', name: 'Lantern Moth', plural: 'Lantern Moths', desc: 'Its wingbeats stir up clouds of light.',   cost: { glowspores: 150000, dewdrops: 400000 }, rate: 280 },
];

// One-time purchases. `req` (optional) = { helper: id, count } must be met to show.
export const UPGRADES = [
  // Pond
  { id: 'ripples',      loc: 'pond', name: 'Moonlit Ripples', desc: 'Pond taps ×2',                cost: { dewdrops: 100 },     effects: [{ t: 'tapMult', loc: 'pond', x: 2 }] },
  { id: 'silvercurrent',loc: 'pond', name: 'Silver Current',  desc: 'Pond taps ×2',                cost: { dewdrops: 5000 },    effects: [{ t: 'tapMult', loc: 'pond', x: 2 }] },
  { id: 'dewair',       loc: 'pond', name: 'Dew-Laden Air',   desc: 'Pond helpers ×1.5',           cost: { dewdrops: 25000 },   effects: [{ t: 'helperMult', loc: 'pond', x: 1.5 }] },
  { id: 'tidalecho',    loc: 'pond', name: 'Tidal Echo',      desc: 'Each pond tap also gives 3% of pond production per second', cost: { dewdrops: 60000 }, effects: [{ t: 'tapRatePct', loc: 'pond', x: 0.03 }] },
  { id: 'sporedew',     loc: 'pond', name: 'Spore-Dusted Dew',desc: 'Pond helpers ×1.25',          cost: { glowspores: 3000 },  effects: [{ t: 'helperMult', loc: 'pond', x: 1.25 }] },

  // Mushroom
  { id: 'sporepuffs',   loc: 'mushroom', name: 'Spore Puffs',   desc: 'Toadstool taps ×2',        cost: { glowspores: 100 },   effects: [{ t: 'tapMult', loc: 'mushroom', x: 2 }] },
  { id: 'glowinggills', loc: 'mushroom', name: 'Glowing Gills', desc: 'Toadstool taps ×2',        cost: { glowspores: 5000 },  effects: [{ t: 'tapMult', loc: 'mushroom', x: 2 }] },
  { id: 'dampearth',    loc: 'mushroom', name: 'Damp Earth',    desc: 'Mushroom helpers ×1.5',    cost: { glowspores: 20000, dewdrops: 50000 }, effects: [{ t: 'helperMult', loc: 'mushroom', x: 1.5 }] },
  { id: 'myceliumweb',  loc: 'mushroom', name: 'Mycelium Web',  desc: 'Each toadstool tap also gives 3% of mushroom production per second', cost: { glowspores: 50000 }, effects: [{ t: 'tapRatePct', loc: 'mushroom', x: 0.03 }] },
];

// Location features: built in order, each changes how the scene looks.
export const FEATURES = [
  // Pond
  { id: 'lilypads',   loc: 'pond', name: 'Lily Pads',   desc: 'Pond taps ×1.5',                    flavor: 'Lily pads bloom across the water.',          cost: { dewdrops: 2500 },                        effects: [{ t: 'tapMult', loc: 'pond', x: 1.5 }] },
  { id: 'bridge',     loc: 'pond', name: 'Stone Bridge',desc: 'Pond helpers ×1.25',                flavor: 'A mossy bridge arches over the pond.',      cost: { dewdrops: 30000, glowspores: 500 },     effects: [{ t: 'helperMult', loc: 'pond', x: 1.25 }] },
  { id: 'moonwell',   loc: 'pond', name: 'Moonwell',    desc: 'Pond helpers ×2',                   flavor: 'The Moonwell glows with captured moonlight.', cost: { dewdrops: 250000, glowspores: 20000 },  effects: [{ t: 'helperMult', loc: 'pond', x: 2 }] },
  { id: 'reedchimes', loc: 'pond', name: 'Reed Chimes', desc: 'Offline earnings last 2 hours longer', flavor: 'Reed chimes tinkle in the night breeze.',    cost: { dewdrops: 1000000, glowspores: 100000 },effects: [{ t: 'offlineHours', x: 2 }] },

  // Mushroom
  { id: 'lanterns',   loc: 'mushroom', name: 'Fairy Lanterns', desc: 'Toadstool taps ×2',        flavor: 'Fairy lanterns light up the ring.',        cost: { glowspores: 1500, dewdrops: 8000 },       effects: [{ t: 'tapMult', loc: 'mushroom', x: 2 }] },
  { id: 'sporegarden',loc: 'mushroom', name: 'Spore Garden',   desc: 'Mushroom helpers ×2',      flavor: 'A spore garden sprouts and glows.',        cost: { glowspores: 40000, dewdrops: 100000 },    effects: [{ t: 'helperMult', loc: 'mushroom', x: 2 }] },
  { id: 'throne',     loc: 'mushroom', name: 'Toadstool Throne', desc: 'Everything everywhere ×1.5', flavor: 'A throne grows for the Fairy Queen.',   cost: { glowspores: 400000, dewdrops: 2000000 },  effects: [{ t: 'globalMult', x: 1.5 }] },
];

export const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));
export const LOCATION_BY_ID = byId(LOCATIONS);
export const HELPER_BY_ID = byId(HELPERS);
export const UPGRADE_BY_ID = byId(UPGRADES);
export const FEATURE_BY_ID = byId(FEATURES);
