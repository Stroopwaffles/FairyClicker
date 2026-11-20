// Procedural audio: every sound is synthesised with the Web Audio API.
// No audio files are downloaded.
//
//   init()             call from a user gesture (tablets block audio until then)
//   setLocation(id)    crossfade to that location's ambience
//   tap(id), buy(), chime(), build(), fanfare()   sound effects
//   settings: { music, sfx, muted } stored per device

const PREFS_KEY = 'fairyclicker.audio';
const DEFAULTS = { music: 0.6, sfx: 0.8, muted: false, style: 'calm' }; // style: 'calm' ambience or 'upbeat' songs

let prefs = { ...DEFAULTS };
try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREFS_KEY) || '{}')); } catch { /* ignore */ }
function savePrefs() { try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch { /* ignore */ } }

let ctx = null;
let master, musicBus, sfxBus, sfxVerb, noiseBuf;
let current = null;          // active ambience
let wantedLocation = null;
let lastTapAt = 0;

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ---------- setup ----------

export function init() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    // Let audio play even when an iPhone/iPad's silent switch is on (Safari 17+).
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* ignore */ }
    ctx = new AC();

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 12; comp.ratio.value = 4;
    comp.attack.value = 0.005; comp.release.value = 0.2;
    master = ctx.createGain();
    master.connect(comp).connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.connect(master);

    // Effects reverb feeds the effects bus so the volume slider controls the echo too.
    const impulse = makeImpulse(3.2, 2.6);
    const conv = ctx.createConvolver(); conv.buffer = impulse;
    sfxVerb = ctx.createGain();
    sfxVerb.connect(conv).connect(sfxBus);

    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

    applyVolumes(true);
  }
  if (ctx.state === 'suspended') ctx.resume();
  if (wantedLocation && !current) startAmbience(wantedLocation);
}

function makeImpulse(seconds, decay) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const ch = buf.getChannelData(c);
    for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

function applyVolumes(instant = false) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const m = prefs.muted ? 0 : 1;
  const set = (param, v) => instant ? param.setValueAtTime(v, t) : param.setTargetAtTime(v, t, 0.08);
  set(master.gain, m * 0.9);
  // Squared curve so the slider feels even to the ear.
  set(musicBus.gain, prefs.music * prefs.music);
  set(sfxBus.gain, prefs.sfx * prefs.sfx);
}

export function getPrefs() { return { ...prefs }; }
export function setPref(key, value) {
  prefs[key] = value;
  savePrefs();
  applyVolumes();
}
export function toggleMute() { setPref('muted', !prefs.muted); return prefs.muted; }

// Switch between calm ambience and upbeat songs, restarting the current place's music.
export function setMusicStyle(style) {
  setPref('style', style);
  if (!ctx || !wantedLocation) return;
  if (current) current.stop();
  current = null;
  startAmbience(wantedLocation);
}

export function suspend() { if (ctx && ctx.state === 'running') ctx.suspend(); }
export function resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }

// ---------- building blocks ----------

// A single enveloped oscillator note.
function tone({ freq, type = 'sine', start = 0, attack = 0.005, decay = 0.3, peak = 0.3,
  to = null, glide = 0.1, dest = sfxBus, wet = 0, pan = 0, verb = sfxVerb }) {
  const t = ctx.currentTime + start;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + glide);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  let node = o.connect(g);
  if (pan) { const p = ctx.createStereoPanner(); p.pan.value = pan; node = node.connect(p); }
  node.connect(dest);
  if (wet) { const s = ctx.createGain(); s.gain.value = wet; node.connect(s).connect(verb); }
  o.start(t);
  o.stop(t + attack + decay + 0.05);
}

// A short burst of filtered noise.
function noise({ start = 0, dur = 0.1, peak = 0.1, type = 'lowpass', freq = 800, q = 0.7, to = null, dest = sfxBus, wet = 0, verb = sfxVerb }) {
  const t = ctx.currentTime + start;
  const s = ctx.createBufferSource();
  s.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
  if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(dest);
  if (wet) { const w = ctx.createGain(); w.gain.value = wet; g.connect(w).connect(verb); }
  s.start(t, Math.random() * 1.5);
  s.stop(t + dur + 0.05);
}

const ready = () => ctx && ctx.state === 'running' && !prefs.muted;

// ---------- sound effects ----------

export function tap(locId, echo = false) {
  if (!ready() || prefs.sfx === 0) return;
  const now = performance.now();
  if (now - lastTapAt < 35) return; // keep rapid multi-finger tapping from turning into noise
  lastTapAt = now;
  const v = rnd(0.88, 1.15);
  if (locId === 'pond') {
    // Water "plip": a falling sine plus a tiny splash.
    tone({ freq: 950 * v, to: 330 * v, glide: 0.11, decay: 0.16, peak: 0.32, wet: 0.25 });
    noise({ dur: 0.05, peak: 0.04, type: 'highpass', freq: 2500 });
  } else if (locId === 'mushroom') {
    // Spongy "pomf": a low thump with a puff of air.
    tone({ freq: 240 * v, to: 110 * v, glide: 0.09, decay: 0.14, peak: 0.38, wet: 0.15 });
    noise({ dur: 0.16, peak: 0.12, type: 'lowpass', freq: 1400 * v, to: 300, wet: 0.2 });
    tone({ freq: 1800 * v, type: 'triangle', start: 0.02, decay: 0.12, peak: 0.03, wet: 0.5 });
  } else if (locId === 'oak') {
    // Hollow wooden "tok" with a warm drip of sap.
    tone({ freq: 420 * v, to: 300 * v, glide: 0.05, type: 'triangle', decay: 0.1, peak: 0.3, wet: 0.2 });
    noise({ dur: 0.04, peak: 0.08, type: 'bandpass', freq: 1800, q: 3 });
    tone({ freq: 700 * v, to: 1300 * v, glide: 0.05, start: 0.07, decay: 0.09, peak: 0.06, wet: 0.4 });
  } else if (locId === 'grotto') {
    // Crystal "ting": inharmonic bell partials with a long shimmer.
    const f = 1400 * v;
    tone({ freq: f, decay: 0.7, peak: 0.16, wet: 0.6 });
    tone({ freq: f * 2.76, decay: 0.4, peak: 0.05, wet: 0.7 });
    tone({ freq: f * 5.4, decay: 0.2, peak: 0.025, wet: 0.8 });
  } else if (locId === 'meadow') {
    // Twinkle: a quick rising sparkle of three notes.
    const base = pick([84, 86, 88, 91]);
    [0, 4, 7].forEach((st, i) => tone({ freq: mtof(base + st), start: i * 0.035, decay: 0.25, peak: 0.09, wet: 0.6, pan: rnd(-0.4, 0.4) }));
  }
  if (echo) {
    // The echo repeats the sparkle softly.
    tone({ freq: rnd(1800, 2400), start: 0.12, decay: 0.3, peak: 0.05, wet: 0.9, pan: rnd(-0.6, 0.6) });
    tone({ freq: rnd(1800, 2400), start: 0.24, decay: 0.3, peak: 0.03, wet: 0.9, pan: rnd(-0.6, 0.6) });
  }
}

// Blood pool: a thick, low "blup" with the odd high drip.
export function bloodTap(echo = false) {
  if (!ready() || prefs.sfx === 0) return;
  const now = performance.now();
  if (now - lastTapAt < 35) return;
  lastTapAt = now;
  const v = rnd(0.85, 1.15);
  tone({ freq: 170 * v, to: 62 * v, glide: 0.13, decay: 0.2, peak: 0.42, wet: 0.25 });
  noise({ dur: 0.14, peak: 0.1, type: 'lowpass', freq: 500, to: 150 });
  if (Math.random() < 0.3 || echo) tone({ freq: 900 * v, to: 1500 * v, glide: 0.04, start: 0.09, decay: 0.12, peak: 0.06, wet: 0.6 });
}

// Critical tap: a bright sparkle burst.
export function crit() {
  if (!ready()) return;
  [91, 95, 98, 103].forEach((m, i) => tone({ freq: mtof(m), start: i * 0.03, decay: 0.3, peak: 0.07, wet: 0.6, pan: rnd(-0.5, 0.5) }));
  noise({ dur: 0.12, peak: 0.05, type: 'highpass', freq: 5000 });
}

// Golden Lotus: a soft harp glissando when it appears, a chime when caught.
export function lotusAppear() {
  if (!ready()) return;
  [72, 76, 79, 83, 86, 88].forEach((m, i) => tone({ freq: mtof(m), type: 'triangle', start: i * 0.06, decay: 0.7, peak: 0.05, wet: 0.7 }));
}
export function lotus() {
  if (!ready()) return;
  [84, 88, 91, 96].forEach((m, i) => tone({ freq: mtof(m), start: i * 0.05, decay: 1.2, peak: 0.1, wet: 0.7 }));
  tone({ freq: mtof(72), type: 'triangle', decay: 1.4, peak: 0.08, wet: 0.5 });
}

// Dracula: a creepy organ swell when he appears; a bat-shriek and stab when tapped.
export function draculaAppear() {
  if (!ready()) return;
  [50, 53, 56, 59].forEach((m) => tone({ freq: mtof(m), type: 'sawtooth', attack: 0.15, decay: 0.9, peak: 0.025, wet: 0.7 }));
  tone({ freq: mtof(38), type: 'square', attack: 0.1, decay: 1, peak: 0.03, wet: 0.4 });
}
export function draculaHit() {
  if (!ready()) return;
  tone({ freq: 3200, to: 1800, glide: 0.15, type: 'square', decay: 0.16, peak: 0.03, wet: 0.5 });
  tone({ freq: 3600, to: 2100, glide: 0.12, type: 'square', start: 0.1, decay: 0.12, peak: 0.025, wet: 0.5 });
  [62, 65, 69, 74].forEach((m, i) => tone({ freq: mtof(m), type: 'sawtooth', start: 0.15 + i * 0.07, decay: 0.6, peak: 0.04, wet: 0.6 }));
}

// Stepping through a portal: a rising whoosh with a shimmer.
export function portal() {
  if (!ready()) return;
  noise({ dur: 0.9, peak: 0.12, type: 'bandpass', freq: 300, to: 3000, q: 1.5, wet: 0.6 });
  tone({ freq: 220, to: 880, glide: 0.8, type: 'triangle', attack: 0.1, decay: 0.9, peak: 0.08, wet: 0.7 });
  [84, 88, 91, 96].forEach((m, i) => tone({ freq: mtof(m), start: 0.5 + i * 0.06, decay: 0.8, peak: 0.05, wet: 0.8 }));
}

// Clock tap: a crisp tick-tock.
export function tick(echo = false) {
  if (!ready() || prefs.sfx === 0) return;
  const now = performance.now();
  if (now - lastTapAt < 35) return;
  lastTapAt = now;
  const hi = Math.random() < 0.5;
  noise({ dur: 0.03, peak: 0.14, type: 'bandpass', freq: hi ? 3200 : 2200, q: 6 });
  tone({ freq: hi ? 1800 : 1350, decay: 0.05, peak: 0.08, wet: 0.2 });
  if (echo) tone({ freq: 2400, start: 0.1, decay: 0.2, peak: 0.04, wet: 0.7 });
}

// The cuckoo: the classic falling third, twice.
export function cuckoo() {
  if (!ready()) return;
  [0, 0.55].forEach((t) => {
    tone({ freq: mtof(76), start: t, attack: 0.02, decay: 0.22, peak: 0.13, wet: 0.4 });
    tone({ freq: mtof(72), start: t + 0.24, attack: 0.02, decay: 0.3, peak: 0.13, wet: 0.4 });
  });
}

// Sunken Palace / Cloud Isles taps and visitors.
export function worldTap(gate, echo = false) {
  if (!ready() || prefs.sfx === 0) return;
  const now = performance.now();
  if (now - lastTapAt < 35) return;
  lastTapAt = now;
  const v = rnd(0.9, 1.12);
  if (gate === 'taco') {
    // a crunchy bite
    for (let i = 0; i < 3; i++) noise({ start: i * 0.03, dur: 0.04, peak: 0.16, type: 'bandpass', freq: rnd(2500, 4500), q: 2 });
  } else if (gate === 'hands') {
    // a crisp high-five clap
    noise({ dur: 0.08, peak: 0.3, type: 'bandpass', freq: rnd(1400, 2000), q: 1.2, wet: 0.3 });
    noise({ dur: 0.03, peak: 0.12, type: 'highpass', freq: 4000 });
  } else if (gate === 'palace') {
    // a bubbly "bloop"
    tone({ freq: 300 * v, to: 900 * v, glide: 0.1, decay: 0.14, peak: 0.22, wet: 0.5 });
    tone({ freq: 1400 * v, start: 0.05, decay: 0.12, peak: 0.04, wet: 0.7 });
  } else {
    // a soft harp pluck chord
    const base = pick([72, 74, 77, 79]);
    [0, 4, 7].forEach((st, i) => tone({ freq: mtof(base + st), type: 'triangle', start: i * 0.02, decay: 0.5, peak: 0.07, wet: 0.6 }));
  }
  if (echo) tone({ freq: rnd(1800, 2400), start: 0.12, decay: 0.3, peak: 0.04, wet: 0.9 });
}

export function visitor(gate) {
  if (!ready()) return;
  if (gate === 'taco') {
    for (let i = 0; i < 6; i++) noise({ start: i * 0.09, dur: 0.06, peak: 0.08, type: 'highpass', freq: 5000 });
    [72, 76, 79].forEach((m, i) => tone({ freq: mtof(m), type: 'triangle', start: 0.1 + i * 0.1, decay: 0.3, peak: 0.08, wet: 0.4 }));
  } else if (gate === 'hands') {
    [79, 84].forEach((m, i) => tone({ freq: mtof(m), start: i * 0.12, decay: 0.3, peak: 0.08, wet: 0.5 }));
  } else if (gate === 'palace') {
    [67, 71, 74, 79, 83, 86, 91].forEach((m, i) => tone({ freq: mtof(m), type: 'triangle', start: i * 0.05, decay: 0.9, peak: 0.06, wet: 0.8 }));
  } else {
    tone({ freq: 180, to: 320, glide: 0.6, type: 'sine', attack: 0.15, decay: 1.2, peak: 0.12, wet: 0.8 });
    tone({ freq: 320, to: 220, glide: 0.5, type: 'sine', start: 0.8, attack: 0.1, decay: 1, peak: 0.1, wet: 0.8 });
  }
}

// A familiar's chirp when it speaks; pitch gives each one its own voice.
export function chirp(pitch = 1) {
  if (!ready()) return;
  const f = 880 * pitch;
  tone({ freq: f, to: f * 1.25, glide: 0.06, decay: 0.09, peak: 0.07, wet: 0.3 });
  tone({ freq: f * 1.12, to: f * 1.5, glide: 0.06, start: 0.1, decay: 0.12, peak: 0.06, wet: 0.3 });
}

// A familiar storming off: quick footsteps fading away.
export function runAway() {
  if (!ready()) return;
  for (let i = 0; i < 6; i++) noise({ start: i * 0.09, dur: 0.05, peak: 0.08 * (1 - i / 7), type: 'bandpass', freq: i % 2 ? 900 : 700, q: 3 });
  tone({ freq: 700, to: 300, glide: 0.4, decay: 0.45, peak: 0.05, wet: 0.4 });
}

// The Conspiracy Gnome exploding: a comic boom and a fizzy puff of spores.
export function boom() {
  if (!ready()) return;
  tone({ freq: 160, to: 40, glide: 0.4, type: 'sine', decay: 0.6, peak: 0.45 });
  noise({ dur: 0.7, peak: 0.3, type: 'lowpass', freq: 2400, to: 200, wet: 0.5 });
  for (let i = 0; i < 8; i++) tone({ freq: rnd(1200, 2400), start: 0.15 + i * 0.05, decay: 0.15, peak: 0.03, wet: 0.7, pan: rnd(-0.8, 0.8) });
}

export function starCatch() {
  if (!ready()) return;
  [88, 91, 95, 100].forEach((m, i) => tone({ freq: mtof(m), start: i * 0.04, decay: 0.35, peak: 0.08, wet: 0.7, pan: rnd(-0.5, 0.5) }));
}

export function achievement() {
  if (!ready()) return;
  [72, 79, 84].forEach((m, i) => tone({ freq: mtof(m), type: 'triangle', start: i * 0.1, decay: 1, peak: 0.12, wet: 0.5 }));
  tone({ freq: mtof(88), start: 0.32, attack: 0.02, decay: 1.6, peak: 0.08, wet: 0.8 });
  tone({ freq: mtof(91), start: 0.32, attack: 0.02, decay: 1.6, peak: 0.05, wet: 0.8 });
}

// A short sound that sets the mood for each event.
export function eventStart(id) {
  if (!ready()) return;
  switch (id) {
    case 'rain':
      for (let i = 0; i < 14; i++) noise({ start: i * 0.06, dur: 0.05, peak: 0.05, type: 'highpass', freq: rnd(2500, 5000) });
      break;
    case 'fog':
      noise({ dur: 2, peak: 0.12, type: 'lowpass', freq: 300, to: 900, wet: 0.6 });
      tone({ freq: 220, to: 196, glide: 2, attack: 0.6, decay: 1.6, peak: 0.06, wet: 0.6 });
      break;
    case 'owlcouncil':
      [0, 0.55, 1.3].forEach((t) => tone({ freq: 400, to: 360, glide: 0.25, start: t, attack: 0.05, decay: 0.35, peak: 0.1, wet: 0.6 }));
      break;
    case 'sporebloom':
      for (let i = 0; i < 8; i++) tone({ freq: 220 * rnd(0.8, 1.3), to: 110, glide: 0.1, start: i * 0.09, decay: 0.12, peak: 0.12, wet: 0.3 });
      break;
    case 'meteor':
      noise({ dur: 1.2, peak: 0.1, type: 'bandpass', freq: 4000, to: 600, q: 2, wet: 0.5 });
      starCatch();
      break;
    case 'bloodmoon':
      // A tolling bell and an organ stab
      [0, 1.4].forEach((t) => {
        tone({ freq: 98, start: t, decay: 3, peak: 0.22, wet: 0.7 });
        tone({ freq: 98 * 2.0, start: t, decay: 2.2, peak: 0.08, wet: 0.7 });
        tone({ freq: 98 * 2.76, start: t, decay: 1.6, peak: 0.06, wet: 0.8 });
        tone({ freq: 98 * 5.4, start: t, decay: 0.9, peak: 0.03, wet: 0.8 });
      });
      [50, 53, 57, 62].forEach((m) => tone({ freq: mtof(m), type: 'sawtooth', start: 0.05, attack: 0.02, decay: 1.6, peak: 0.035, wet: 0.6 }));
      break;
    case 'chimes':
      // Twelve soft bell strokes, sped up
      for (let i = 0; i < 12; i++) {
        tone({ freq: 523, start: i * 0.22, decay: 1.2, peak: 0.07, wet: 0.7 });
        tone({ freq: 523 * 2.76, start: i * 0.22, decay: 0.5, peak: 0.02, wet: 0.8 });
      }
      break;
    case 'hightide':
      noise({ dur: 2.2, peak: 0.14, type: 'lowpass', freq: 200, to: 1200, wet: 0.6 });
      noise({ start: 1, dur: 1.6, peak: 0.1, type: 'lowpass', freq: 1200, to: 200, wet: 0.6 });
      break;
    case 'tacotuesday':
      [67, 71, 74, 79, 74, 79].forEach((m, i) => tone({ freq: mtof(m), type: 'square', start: i * 0.1, decay: 0.15, peak: 0.04, wet: 0.3 }));
      break;
    case 'applause':
      for (let i = 0; i < 40; i++) noise({ start: Math.random() * 1.8, dur: 0.04, peak: 0.07, type: 'bandpass', freq: rnd(1200, 2600), q: 1.5, wet: 0.4 });
      break;
    case 'rainbow':
      [72, 76, 79, 83, 86, 88, 91].forEach((m, i) => tone({ freq: mtof(m), type: 'triangle', start: i * 0.08, decay: 1, peak: 0.06, wet: 0.7 }));
      break;
    case 'fairy':
      for (let i = 0; i < 10; i++) tone({ freq: mtof(pick([88, 91, 93, 95, 98, 100])), start: i * 0.06, decay: 0.4, peak: 0.05, wet: 0.8, pan: rnd(-0.8, 0.8) });
      break;
    default: // moonrise
      [67, 74, 79, 83, 86].forEach((m, i) => tone({ freq: mtof(m), start: i * 0.15, attack: 0.08, decay: 2, peak: 0.07, wet: 0.8 }));
  }
}

export function buy() {
  if (!ready()) return;
  const base = pick([76, 79, 81]);
  tone({ freq: mtof(base), type: 'triangle', decay: 0.35, peak: 0.16, wet: 0.35 });
  tone({ freq: mtof(base + 7), type: 'triangle', start: 0.06, decay: 0.45, peak: 0.13, wet: 0.4 });
}

export function chime() {
  if (!ready()) return;
  [79, 84, 88].forEach((m, i) => tone({ freq: mtof(m), type: 'sine', start: i * 0.07, decay: 0.7, peak: 0.13, wet: 0.5 }));
}

export function build() {
  if (!ready()) return;
  [72, 76, 79, 84, 88].forEach((m, i) => {
    tone({ freq: mtof(m), type: 'triangle', start: i * 0.09, decay: 0.9, peak: 0.12, wet: 0.55 });
    tone({ freq: mtof(m + 12), type: 'sine', start: i * 0.09 + 0.01, decay: 0.6, peak: 0.04, wet: 0.7 });
  });
}

export function fanfare() {
  if (!ready()) return;
  [67, 71, 74, 79].forEach((m, i) => tone({ freq: mtof(m), type: 'triangle', start: i * 0.12, decay: 1.2, peak: 0.13, wet: 0.5 }));
  [79, 83, 86, 91].forEach((m) => tone({ freq: mtof(m), type: 'sine', start: 0.5, attack: 0.05, decay: 1.8, peak: 0.05, wet: 0.8 }));
  for (let i = 0; i < 8; i++) tone({ freq: mtof(pick([91, 93, 95, 98, 100])), start: 0.55 + i * 0.07, decay: 0.3, peak: 0.03, wet: 0.9, pan: rnd(-0.7, 0.7) });
}

// ---------- ambience ----------

// Chords are MIDI notes; sparkles pick from the scale.
const AMBIENCES = {
  pond: {
    // Dreamy D-major / lydian colours
    chords: [[50, 57, 64, 66, 69], [43, 55, 59, 62, 66], [47, 54, 57, 61, 64], [45, 52, 57, 59, 64]],
    scale: [74, 76, 78, 81, 83, 86, 88, 90],
    padType: 'sine', cutoff: 1100, sparkleEvery: [2.5, 6],
    layers: [crickets, water],
  },
  mushroom: {
    // Mysterious A-dorian
    chords: [[45, 52, 59, 60, 67], [41, 53, 57, 60, 64], [38, 50, 57, 60, 65], [40, 52, 55, 59, 62]],
    scale: [69, 72, 74, 76, 78, 81, 84],
    padType: 'triangle', cutoff: 750, sparkleEvery: [3, 7],
    layers: [drips, hum],
  },
  oak: {
    // Warm F-major, a touch of folk
    chords: [[41, 53, 57, 60, 65], [46, 53, 58, 62, 65], [43, 55, 58, 62, 67], [48, 55, 60, 64, 67]],
    scale: [72, 74, 77, 79, 81, 84, 86],
    padType: 'triangle', cutoff: 900, sparkleEvery: [3, 7],
    layers: [wind, owls],
  },
  grotto: {
    // Ethereal E-lydian with a cold shimmer
    chords: [[40, 52, 56, 59, 63], [45, 57, 61, 64, 68], [42, 54, 58, 61, 66], [47, 54, 59, 63, 66]],
    scale: [76, 78, 80, 82, 83, 87, 88, 90, 94],
    padType: 'sine', cutoff: 1500, sparkleEvery: [1.5, 4],
    layers: [drips, shimmer],
  },
  meadow: {
    // Wide open C major / sus chords
    chords: [[36, 48, 55, 62, 67], [41, 53, 60, 65, 69], [45, 52, 59, 64, 67], [43, 50, 55, 62, 67]],
    scale: [79, 81, 84, 86, 88, 91, 93, 96],
    padType: 'sine', cutoff: 1300, sparkleEvery: [1.8, 4.5],
    layers: [wind, crickets],
  },
  courtyard: { custom: castleTheme },
  clockworks: { custom: (c) => playSong(MUSIC_BOX, c) },
  palace: {
    // Dreamy undersea: soft lydian chords, lapping water and rising bubbles
    chords: [[50, 57, 64, 68], [52, 59, 66, 69], [47, 54, 61, 66], [49, 56, 63, 68]],
    scale: [74, 76, 78, 80, 81, 83, 85, 88],
    padType: 'sine', cutoff: 900, sparkleEvery: [2, 5],
    layers: [water, bubbles],
  },
  clouds: { custom: (c) => playSong(SKY_SONG, c) },
  taco: { custom: (c) => playSong({ ...SONGS.mushroom, bpm: 120, lead: 'marimba', leadPeak: 0.13, drums: { kick: [0, 6, 10], snare: [4, 12], shaker: [1, 3, 5, 7, 9, 11, 13, 15], wood: [2, 14] } }, c) },
  hands: { custom: (c) => playSong({ ...SONGS.pond, bpm: 132, drums: { kick: [0, 8], snare: [4, 12], wood: [2, 6, 10, 14], shaker: [1, 3, 5, 7, 9, 11, 13, 15] } }, c) },
  gates: {
    // Mysterious whole-tone shimmer for the hall of portals
    chords: [[48, 55, 62, 66], [46, 53, 60, 64], [44, 51, 58, 62], [46, 53, 60, 64]],
    scale: [72, 74, 76, 78, 80, 82, 84, 86],
    padType: 'sine', cutoff: 1400, sparkleEvery: [1.5, 3.5],
    layers: [hum, shimmer],
  },
};

export function setLocation(id) {
  wantedLocation = id;
  if (!ctx) return;
  if (current && current.id === id) return;
  if (current) current.stop();
  current = null;
  if (id) startAmbience(id);
}

function startAmbience(id) {
  const def = prefs.style === 'upbeat' && SONGS[id] ? { custom: (ctx2) => playSong(SONGS[id], ctx2) } : AMBIENCES[id];
  if (!def) return;
  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, ctx.currentTime);
  out.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 2.5);
  out.connect(musicBus);
  // Ambience reverb runs through `out` so it fades with the location.
  const verb = ctx.createGain();
  const conv = ctx.createConvolver(); conv.buffer = makeImpulse(3.2, 2.6);
  verb.connect(conv).connect(out);

  let alive = true;
  let chordTimer = null;
  const stops = [];
  const every = (fn, [a, b]) => {
    const loop = () => { if (!alive) return; fn(); setTimeout(loop, rnd(a, b) * 1000); };
    setTimeout(loop, rnd(a, b) * 500);
  };

  if (def.custom) {
    def.custom({ out, verb, stops });
  } else {
  // Pad: one chord every ~9s, overlapping so it never stops.
  const padFilter = ctx.createBiquadFilter();
  padFilter.type = 'lowpass'; padFilter.frequency.value = def.cutoff; padFilter.Q.value = 0.5;
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05;
  const lfoAmt = ctx.createGain(); lfoAmt.gain.value = def.cutoff * 0.4;
  lfo.connect(lfoAmt).connect(padFilter.frequency); lfo.start();
  stops.push(() => lfo.stop());
  padFilter.connect(out);
  const padVerb = ctx.createGain(); padVerb.gain.value = 0.5; padVerb.connect(verb);
  let ci = 0;
  const playChord = () => {
    if (ctx.state !== 'running') return;
    const chord = def.chords[ci++ % def.chords.length];
    const t = ctx.currentTime, len = 11;
    chord.forEach((m, i) => {
      for (const det of [-6, 6]) {
        const o = ctx.createOscillator();
        o.type = def.padType; o.frequency.value = mtof(m); o.detune.value = det + rnd(-3, 3);
        const g = ctx.createGain();
        const peak = (i === 0 ? 0.05 : 0.03);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(peak, t + 3.5);
        g.gain.setValueAtTime(peak, t + len - 4);
        g.gain.exponentialRampToValueAtTime(0.0001, t + len);
        o.connect(g).connect(padFilter);
        g.connect(padVerb);
        o.start(t); o.stop(t + len + 0.1);
      }
    });
  };
  playChord();
  chordTimer = setInterval(playChord, 9000);

  // Sparkles: occasional bell-like notes drifting left and right.
  every(() => {
    if (ctx.state !== 'running') return;
    const n = Math.random() < 0.3 ? 2 : 1;
    for (let i = 0; i < n; i++) {
      tone({ freq: mtof(pick(def.scale)), type: 'sine', start: i * 0.18, attack: 0.01, decay: 1.6, peak: 0.035, dest: out, wet: 0.8, verb, pan: rnd(-0.8, 0.8) });
    }
  }, def.sparkleEvery);

  for (const layer of def.layers) layer({ out, verb, every, stops });
  }

  current = {
    id,
    stop() {
      const t = ctx.currentTime;
      out.gain.cancelScheduledValues(t);
      out.gain.setValueAtTime(Math.max(out.gain.value, 0.0001), t);
      out.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
      alive = false;
      clearInterval(chordTimer);
      setTimeout(() => { stops.forEach((f) => { try { f(); } catch { /* ignore */ } }); out.disconnect(); }, 1700);
    },
  };
}

// --- nature layers ---

function crickets({ out, every }) {
  every(() => {
    if (ctx.state !== 'running') return;
    const freq = rnd(4200, 5200), pan = rnd(-0.9, 0.9), pulses = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < pulses; i++) {
      tone({ freq, start: i * 0.055, attack: 0.004, decay: 0.03, peak: 0.012, dest: out, pan });
    }
  }, [0.4, 1.8]);
}

function water({ out, stops }) {
  // Gentle lapping: looping noise through a low band-pass, slowly swelling.
  const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 380; f.Q.value = 0.8;
  const g = ctx.createGain(); g.gain.value = 0.025;
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.12;
  const amt = ctx.createGain(); amt.gain.value = 0.015;
  lfo.connect(amt).connect(g.gain);
  s.connect(f).connect(g).connect(out);
  s.start(); lfo.start();
  stops.push(() => { s.stop(); lfo.stop(); });
}

function drips({ out, verb, every }) {
  every(() => {
    if (ctx.state !== 'running') return;
    const f = rnd(900, 1500);
    tone({ freq: f, to: f * 1.9, glide: 0.04, attack: 0.002, decay: 0.12, peak: 0.05, dest: out, wet: 0.9, verb, pan: rnd(-0.8, 0.8) });
  }, [1.2, 4]);
}

function hum({ out, stops }) {
  const g = ctx.createGain(); g.gain.value = 0.018;
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.08;
  const amt = ctx.createGain(); amt.gain.value = 0.01;
  lfo.connect(amt).connect(g.gain);
  const oscs = [55, 82.4].map((fr) => { const o = ctx.createOscillator(); o.frequency.value = fr; o.connect(g); o.start(); return o; });
  g.connect(out); lfo.start();
  stops.push(() => { oscs.forEach((o) => o.stop()); lfo.stop(); });
}

function wind({ out, stops }) {
  // Soft breeze: band-passed noise whose brightness drifts slowly.
  const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 700; f.Q.value = 0.6;
  const fl = ctx.createOscillator(); fl.frequency.value = 0.07;
  const fa = ctx.createGain(); fa.gain.value = 400;
  fl.connect(fa).connect(f.frequency);
  const g = ctx.createGain(); g.gain.value = 0.018;
  const gl = ctx.createOscillator(); gl.frequency.value = 0.11;
  const ga = ctx.createGain(); ga.gain.value = 0.012;
  gl.connect(ga).connect(g.gain);
  src.connect(f).connect(g).connect(out);
  src.start(); fl.start(); gl.start();
  stops.push(() => { src.stop(); fl.stop(); gl.stop(); });
}

function owls({ out, verb, every }) {
  every(() => {
    if (ctx.state !== 'running') return;
    const f = rnd(330, 400), pan = rnd(-0.8, 0.8);
    tone({ freq: f, to: f * 0.92, glide: 0.25, attack: 0.06, decay: 0.3, peak: 0.035, dest: out, wet: 0.7, verb, pan });
    tone({ freq: f * 0.95, to: f * 0.85, glide: 0.4, start: 0.45, attack: 0.08, decay: 0.5, peak: 0.03, dest: out, wet: 0.7, verb, pan });
  }, [9, 20]);
}

function shimmer({ out, verb, every }) {
  every(() => {
    if (ctx.state !== 'running') return;
    const f = rnd(3000, 5200);
    tone({ freq: f, attack: 0.2, decay: 1.5, peak: 0.01, dest: out, wet: 1, verb, pan: rnd(-0.9, 0.9) });
  }, [0.5, 1.6]);
}

// The finale: a short piece that swells as the full moon rises (~22 seconds).
export function finale() {
  if (!ctx || prefs.muted) return;
  if (ctx.state === 'suspended') ctx.resume();
  const back = wantedLocation;
  setLocation(null); // let the ambience fade so the piece can breathe
  const prog = [
    [50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 61],
    [50, 57, 62, 66], [43, 55, 59, 64], [45, 57, 61, 64], [50, 57, 62, 66, 69],
  ];
  const beat = 0.42;
  prog.forEach((chord, ci) => {
    const t0 = ci * beat * 6 + 0.5;
    const last = ci === prog.length - 1;
    // Warm chord underneath
    chord.forEach((m) => tone({ freq: mtof(m), type: 'triangle', start: t0, attack: 0.6, decay: last ? 7 : beat * 6, peak: 0.035, dest: musicBus, wet: 0.5, verb: sfxVerb }));
    // Rising arpeggio on top
    const arp = [...chord.slice(1).map((m) => m + 12), chord[1] + 24, chord[2] + 24];
    arp.forEach((m, i) => tone({ freq: mtof(m), start: t0 + i * beat, decay: 1.4, peak: 0.06 + ci * 0.006, dest: musicBus, wet: 0.7, verb: sfxVerb, pan: (i % 2 ? 0.3 : -0.3) }));
    if (last) {
      for (let i = 0; i < 16; i++) tone({ freq: mtof(pick([86, 88, 90, 93, 95, 98])), start: t0 + 1 + i * 0.18, decay: 1.2, peak: 0.03, dest: musicBus, wet: 0.9, verb: sfxVerb, pan: rnd(-0.8, 0.8) });
    }
  });
  // Bring the location ambience back afterwards.
  setTimeout(() => { if (wantedLocation === null) setLocation(back); }, 26000);
}

// ---------- Crimson Courtyard theme ----------
// An original gothic piece in D minor (harmonic minor) at 150 BPM: harpsichord
// arpeggios, an organ holding the chords, a pumping octave bass, a square-wave
// lead and simple drums. 8 bars that loop.
const CASTLE = {
  step: 60 / 150 / 4, // a sixteenth note
  roots: [38, 34, 36, 33, 38, 31, 33, 38],                 // D Bb C A D G A D (bass, MIDI)
  chords: [[62, 65, 69], [58, 62, 65], [60, 64, 67], [57, 61, 64], [62, 65, 69], [55, 58, 62], [57, 61, 64], [62, 65, 69]],
  // Melody in eighth notes per bar: [midi or null, length in eighths]
  melody: [
    [[74, 2], [77, 1], [76, 1], [74, 1], [73, 1], [74, 2]],
    [[70, 2], [74, 1], [77, 1], [82, 2], [81, 1], [79, 1]],
    [[79, 2], [76, 1], [72, 1], [79, 1], [77, 1], [76, 2]],
    [[73, 1], [76, 1], [81, 2], [79, 1], [77, 1], [76, 1], [73, 1]],
    [[74, 1], [69, 1], [74, 1], [77, 1], [81, 2], [79, 1], [77, 1]],
    [[79, 2], [82, 1], [81, 1], [79, 1], [77, 1], [79, 2]],
    [[77, 1], [76, 1], [74, 1], [73, 1], [76, 2], [81, 2]],
    [[74, 4], [null, 2], [69, 1], [73, 1]],
  ],
};
// Turn the melody into a map: sixteenth-step index -> [midi, steps]
const CASTLE_MELODY = (() => {
  const map = {};
  CASTLE.melody.forEach((bar, b) => {
    let pos = b * 16;
    for (const [m, len] of bar) { if (m) map[pos] = [m, len * 2]; pos += len * 2; }
  });
  return map;
})();

function castleTheme({ out, verb, stops }) {
  const st = CASTLE.step;
  // Instrument buses
  const bassF = ctx.createBiquadFilter(); bassF.type = 'lowpass'; bassF.frequency.value = 650; bassF.connect(out);
  const harpF = ctx.createBiquadFilter(); harpF.type = 'lowpass'; harpF.frequency.value = 3200; harpF.connect(out);
  const organF = ctx.createBiquadFilter(); organF.type = 'lowpass'; organF.frequency.value = 1300; organF.connect(out);
  const leadF = ctx.createBiquadFilter(); leadF.type = 'lowpass'; leadF.frequency.value = 2600; leadF.connect(out);
  const leadVerb = ctx.createGain(); leadVerb.gain.value = 0.35; leadF.connect(leadVerb).connect(verb);
  const organVerb = ctx.createGain(); organVerb.gain.value = 0.5; organF.connect(organVerb).connect(verb);

  const note = (dest, type, freq, t, dur, peak, attack = 0.005) => {
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.setValueAtTime(peak, t + Math.max(attack, dur * 0.6));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(dest);
    o.start(t); o.stop(t + dur + 0.02);
    return o;
  };
  const drum = (t, kind) => {
    if (kind === 'kick') {
      const o = ctx.createOscillator(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.32, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.connect(g).connect(out); o.start(t); o.stop(t + 0.2);
    } else {
      const s = ctx.createBufferSource(); s.buffer = noiseBuf;
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = kind === 'snare' ? 1400 : 7000;
      const g = ctx.createGain(); const dur = kind === 'snare' ? 0.13 : 0.035;
      g.gain.setValueAtTime(kind === 'snare' ? 0.09 : 0.025, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f).connect(g).connect(out); s.start(t, Math.random()); s.stop(t + dur + 0.02);
    }
  };

  function schedule(step, t) {
    const bar = Math.floor(step / 16) % 8, s = step % 16;
    const root = CASTLE.roots[bar], chord = CASTLE.chords[bar];
    // Bass: pumping octaves on eighth notes
    if (s % 2 === 0) note(bassF, 'square', mtof(root + (s % 4 === 0 ? 0 : 12)), t, st * 1.8, 0.05);
    // Harpsichord: broken chord in sixteenths, up and back
    const pattern = [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 1];
    const tones = [...chord, chord[0] + 12];
    const hn = tones[pattern[s]] + 12;
    note(harpF, 'sawtooth', mtof(hn), t, st * 1.4, 0.018, 0.002);
    note(harpF, 'square', mtof(hn), t, st * 0.9, 0.008, 0.002);
    // Organ: hold the chord for the whole bar
    if (s === 0) for (const m of chord) for (const det of [-5, 5]) {
      const o = note(organF, 'sawtooth', mtof(m - 12), t, st * 16, 0.009, 0.04);
      o.detune.value = det;
    }
    // Lead melody
    const mel = CASTLE_MELODY[(bar * 16) + s];
    if (mel) {
      const dur = mel[1] * st * 0.95;
      const o = note(leadF, 'square', mtof(mel[0]), t, dur, 0.032, 0.01);
      // a little vibrato on longer notes
      if (mel[1] >= 4) {
        const lfo = ctx.createOscillator(); lfo.frequency.value = 6;
        const amt = ctx.createGain(); amt.gain.value = 6;
        lfo.connect(amt).connect(o.detune); lfo.start(t + 0.15); lfo.stop(t + dur);
      }
      note(leadF, 'sawtooth', mtof(mel[0] - 12), t, dur, 0.012, 0.01);
    }
    // Drums
    if (s === 0 || s === 8 || s === 10) drum(t, 'kick');
    if (s === 4 || s === 12) drum(t, 'snare');
    if (s % 2 === 1) drum(t, 'hat');
  }

  let step = 0;
  let next = ctx.currentTime + 0.15;
  const timer = setInterval(() => {
    if (ctx.state !== 'running') { next = ctx.currentTime + 0.1; return; }
    while (next < ctx.currentTime + 0.3) {
      schedule(step, next);
      next += st;
      step = (step + 1) % 128;
    }
  }, 50);
  stops.push(() => clearInterval(timer));
}

// ---------- Upbeat songs ----------
// Each place has an original looping song. A song lists, per bar: a chord
// (MIDI notes), a bass root, and a melody of [midi or null, length in steps].
// Patterns are arrays the length of one bar (stepsPerBar).

const R = null; // a rest
export const SONGS = {
  // Bouncy marimba pop
  pond: {
    bpm: 124, stepsPerBar: 16,
    chords: [[65, 69, 72], [62, 65, 69], [58, 62, 65], [60, 64, 67], [65, 69, 72], [57, 60, 64], [58, 62, 65], [60, 64, 67]],
    roots: [41, 38, 46, 36, 41, 45, 46, 36],
    melody: [
      [[72, 2], [77, 2], [76, 2], [72, 2], [74, 4], [72, 4]],
      [[69, 2], [74, 2], [72, 2], [69, 2], [65, 4], [69, 4]],
      [[70, 2], [74, 2], [77, 2], [79, 2], [77, 4], [74, 4]],
      [[76, 4], [74, 2], [72, 2], [79, 8]],
      [[81, 2], [79, 2], [77, 2], [76, 2], [77, 4], [72, 4]],
      [[76, 2], [72, 2], [69, 2], [72, 2], [76, 4], [81, 4]],
      [[82, 4], [81, 2], [79, 2], [77, 2], [74, 2], [70, 4]],
      [[72, 2], [76, 2], [79, 2], [84, 2], [79, 8]],
    ],
    lead: 'marimba', leadPeak: 0.16,
    bass: 'pluck', bassPattern: [0, R, R, R, R, R, 12, R, 7, R, R, R, 12, R, R, R], bassPeak: 0.17,
    arp: 'pluck', arpPattern: [R, R, 0, R, R, R, 1, R, R, R, 2, R, R, R, 1, R], arpPeak: 0.06, arpOct: 12,
    drums: { kick: [0, 8], snare: [4, 12], shaker: [1, 3, 5, 7, 9, 11, 13, 15] },
  },
  // Funky and syncopated
  mushroom: {
    bpm: 112, stepsPerBar: 16,
    chords: [[57, 60, 64, 67], [62, 66, 69, 72], [57, 60, 64, 67], [62, 66, 69], [64, 67, 71, 74], [62, 66, 69], [60, 64, 67], [62, 66, 69]],
    roots: [45, 38, 45, 38, 40, 38, 36, 38],
    melody: [
      [[69, 2], [R, 1], [72, 1], [74, 2], [76, 2], [R, 2], [74, 2], [72, 2], [69, 2]],
      [[66, 2], [69, 2], [72, 2], [74, 2], [72, 4], [69, 4]],
      [[76, 2], [76, 1], [74, 1], [72, 2], [69, 2], [67, 4], [69, 4]],
      [[74, 3], [72, 1], [69, 4], [66, 4], [69, 4]],
      [[71, 2], [74, 2], [76, 2], [79, 2], [78, 2], [76, 2], [74, 4]],
      [[78, 2], [76, 2], [74, 2], [72, 2], [74, 8]],
      [[72, 2], [76, 2], [79, 4], [76, 2], [72, 2], [76, 4]],
      [[78, 4], [74, 4], [69, 8]],
    ],
    lead: 'clav', leadPeak: 0.075,
    bass: 'square', bassPattern: [0, R, R, 12, R, R, 0, R, 7, R, 12, R, R, R, 10, R], bassPeak: 0.06,
    arp: 'stab', arpPattern: [R, R, R, R, 'chord', R, R, R, R, R, R, R, 'chord', R, R, R], arpPeak: 0.025, arpOct: 0,
    drums: { kick: [0, 7, 10], snare: [4, 12], wood: [2, 6, 11, 14], hat: [1, 3, 5, 9, 13, 15] },
  },
  // Folk jig in 6/8
  oak: {
    bpm: 300, stepsPerBar: 6, // each step is an eighth note of a lively jig
    chords: [[55, 59, 62], [60, 64, 67], [55, 59, 62], [62, 66, 69], [55, 59, 62], [64, 67, 71], [60, 64, 67], [62, 66, 69]],
    roots: [43, 48, 43, 38, 43, 40, 48, 38],
    melody: [
      [[67, 1], [71, 1], [74, 1], [79, 2], [74, 1]],
      [[76, 1], [72, 1], [76, 1], [79, 2], [76, 1]],
      [[74, 1], [71, 1], [67, 1], [71, 1], [74, 1], [71, 1]],
      [[69, 2], [66, 1], [62, 3]],
      [[67, 1], [71, 1], [74, 1], [79, 1], [78, 1], [79, 1]],
      [[76, 1], [79, 1], [76, 1], [71, 2], [67, 1]],
      [[72, 1], [76, 1], [72, 1], [69, 1], [72, 1], [76, 1]],
      [[74, 3], [78, 1], [81, 2]],
    ],
    lead: 'fiddle', leadPeak: 0.07,
    bass: 'pluck', bassPattern: [0, R, R, 7, R, R], bassPeak: 0.17,
    arp: 'strum', arpPattern: ['chord', R, R, 'chord', R, R], arpPeak: 0.045, arpOct: 0,
    drums: { tom: [0, 3], shaker: [0, 1, 2, 3, 4, 5], wood: [5] },
  },
  // Sparkly synth-pop
  grotto: {
    bpm: 120, stepsPerBar: 16,
    chords: [[64, 67, 71], [60, 64, 67], [62, 67, 71], [62, 66, 69], [64, 67, 71], [60, 64, 67], [57, 60, 64], [59, 63, 66, 69]],
    roots: [40, 36, 43, 38, 40, 36, 45, 35],
    melody: [
      [[79, 4], [78, 2], [76, 2], [71, 4], [74, 4]],
      [[76, 4], [72, 2], [76, 2], [79, 8]],
      [[78, 4], [79, 2], [78, 2], [74, 4], [71, 4]],
      [[74, 4], [76, 2], [78, 2], [81, 8]],
      [[83, 4], [81, 2], [79, 2], [78, 4], [76, 4]],
      [[79, 4], [76, 2], [72, 2], [76, 8]],
      [[72, 2], [74, 2], [76, 2], [79, 2], [81, 4], [79, 4]],
      [[78, 4], [75, 4], [71, 8]],
    ],
    lead: 'glass', leadPeak: 0.07,
    bass: 'square', bassPattern: [0, R, 0, R, 12, R, 0, R, 0, R, 0, R, 12, R, 7, R], bassPeak: 0.05,
    arp: 'bell', arpPattern: [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 2, 3, 2], arpPeak: 0.03, arpOct: 12,
    drums: { kick: [0, 8], snare: [4, 12], hat: [2, 6, 10, 14] },
  },
  // Uplifting chiptune
  meadow: {
    bpm: 128, stepsPerBar: 16,
    chords: [[60, 64, 67], [59, 62, 67], [57, 60, 64], [57, 60, 65], [60, 64, 67], [59, 62, 67], [57, 60, 65], [59, 62, 67]],
    roots: [36, 43, 45, 41, 36, 43, 41, 43],
    melody: [
      [[72, 2], [76, 2], [79, 2], [84, 2], [83, 4], [79, 4]],
      [[79, 2], [81, 2], [83, 2], [86, 2], [84, 4], [83, 4]],
      [[81, 2], [79, 2], [76, 2], [72, 2], [76, 4], [81, 4]],
      [[77, 4], [79, 2], [81, 2], [84, 8]],
      [[88, 4], [86, 2], [84, 2], [83, 4], [79, 4]],
      [[83, 2], [84, 2], [86, 4], [83, 4], [79, 4]],
      [[81, 2], [79, 2], [77, 2], [76, 2], [77, 4], [81, 4]],
      [[79, 4], [83, 4], [86, 8]],
    ],
    lead: 'chip', leadPeak: 0.035,
    bass: 'triangle', bassPattern: [0, R, 12, R, 0, R, 12, R, 0, R, 12, R, 0, R, 12, R], bassPeak: 0.12,
    arp: 'pluck', arpPattern: [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3], arpPeak: 0.022, arpOct: 12,
    drums: { kick: [0, 4, 8, 12], snare: [4, 12], hat: [2, 6, 10, 14] },
  },
};

function playSong(song, { out, verb, stops }) {
  const st = 60 / song.bpm / (song.stepsPerBar === 6 ? 1 : 4);
  const bars = song.chords.length;
  const total = bars * song.stepsPerBar;
  const mel = {};
  song.melody.forEach((bar, b) => {
    let pos = b * song.stepsPerBar;
    for (const [m, len] of bar) { if (m) mel[pos] = [m, len]; pos += len; }
  });

  const leadF = ctx.createBiquadFilter(); leadF.type = 'lowpass'; leadF.frequency.value = 3200; leadF.connect(out);
  const lv = ctx.createGain(); lv.gain.value = 0.3; leadF.connect(lv).connect(verb);
  const bassF = ctx.createBiquadFilter(); bassF.type = 'lowpass'; bassF.frequency.value = 900; bassF.connect(out);
  const backF = ctx.createBiquadFilter(); backF.type = 'lowpass'; backF.frequency.value = 3500; backF.connect(out);
  const bv = ctx.createGain(); bv.gain.value = 0.35; backF.connect(bv).connect(verb);

  const osc = (dest, type, freq, t, dur, peak, attack = 0.005, hold = 0.3) => {
    const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.setValueAtTime(peak, t + Math.max(attack, dur * hold));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(dest);
    o.start(t); o.stop(t + dur + 0.02);
    return o;
  };
  // Simple instruments built from oscillators
  const play = (inst, dest, m, t, len, peak) => {
    const f = mtof(m), dur = len * st;
    switch (inst) {
      case 'marimba': osc(dest, 'sine', f, t, Math.min(dur, 0.45), peak, 0.003, 0.05); osc(dest, 'sine', f * 4, t, 0.08, peak * 0.3, 0.002, 0.05); break;
      case 'pluck': osc(dest, 'triangle', f, t, Math.min(dur, 0.3), peak, 0.003, 0.1); break;
      case 'clav': osc(dest, 'square', f, t, Math.min(dur * 0.7, 0.25), peak, 0.003, 0.2); osc(dest, 'sawtooth', f * 2, t, 0.06, peak * 0.4, 0.002, 0.1); break;
      case 'stab': osc(dest, 'sawtooth', f, t, 0.18, peak, 0.004, 0.3); break;
      case 'strum': osc(dest, 'triangle', f, t, 0.35, peak, 0.004, 0.1); break;
      case 'bell': osc(dest, 'sine', f, t, 0.35, peak, 0.003, 0.05); osc(dest, 'sine', f * 2.76, t, 0.15, peak * 0.3, 0.002, 0.05); break;
      case 'glass': osc(dest, 'sine', f, t, dur * 0.95, peak, 0.01, 0.5); osc(dest, 'triangle', f * 2, t, dur * 0.6, peak * 0.25, 0.01, 0.3); break;
      case 'chip': {
        const o = osc(dest, 'square', f, t, dur * 0.9, peak, 0.004, 0.7);
        if (len >= 4) { const l = ctx.createOscillator(); l.frequency.value = 7; const a = ctx.createGain(); a.gain.value = 12; l.connect(a).connect(o.detune); l.start(t + 0.12); l.stop(t + dur); }
        break;
      }
      case 'fiddle': {
        const o = osc(dest, 'sawtooth', f, t, dur * 0.95, peak, 0.03, 0.7);
        const l = ctx.createOscillator(); l.frequency.value = 5.5; const a = ctx.createGain(); a.gain.value = 10; l.connect(a).connect(o.detune); l.start(t + 0.05); l.stop(t + dur);
        break;
      }
      default: osc(dest, inst, f, t, dur * 0.9, peak, 0.004, 0.5);
    }
  };
  const drum = (kind, t) => {
    const n = (hp, peak, dur, type = 'highpass') => {
      const s = ctx.createBufferSource(); s.buffer = noiseBuf;
      const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = hp;
      const g = ctx.createGain(); g.gain.setValueAtTime(peak, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f).connect(g).connect(out); s.start(t, Math.random()); s.stop(t + dur + 0.02);
    };
    const thump = (f0, f1, peak, dur) => {
      const o = ctx.createOscillator(); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.7);
      const g = ctx.createGain(); g.gain.setValueAtTime(peak, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(out); o.start(t); o.stop(t + dur + 0.02);
    };
    if (kind === 'kick') thump(140, 45, 0.3, 0.18);
    if (kind === 'tom') thump(110, 70, 0.22, 0.2);
    if (kind === 'snare') { n(1500, 0.08, 0.13); thump(220, 180, 0.05, 0.08); }
    if (kind === 'hat') n(7500, 0.025, 0.04);
    if (kind === 'shaker') n(6000, 0.016, 0.06, 'bandpass');
    if (kind === 'wood') thump(900, 850, 0.06, 0.05);
  };

  function schedule(step, t) {
    const bar = Math.floor(step / song.stepsPerBar), s = step % song.stepsPerBar;
    const chord = song.chords[bar], root = song.roots[bar];
    const bp = song.bassPattern[s];
    if (bp !== null && bp !== undefined) play(song.bass, bassF, root + bp, t, 2, song.bassPeak);
    const ap = song.arpPattern[s];
    if (ap === 'chord') for (const m of chord) play(song.arp, backF, m + song.arpOct, t + Math.random() * 0.012, 2, song.arpPeak);
    else if (ap !== null && ap !== undefined) {
      const tones = [...chord, chord[0] + 12];
      play(song.arp, backF, tones[ap % tones.length] + song.arpOct, t, 1, song.arpPeak);
    }
    const m = mel[step];
    if (m) play(song.lead, leadF, m[0], t, m[1], song.leadPeak);
    for (const [kind, steps] of Object.entries(song.drums)) if (steps.includes(s)) drum(kind, t);
  }

  let step = 0;
  let next = ctx.currentTime + 0.2;
  const timer = setInterval(() => {
    if (ctx.state !== 'running') { next = ctx.currentTime + 0.1; return; }
    while (next < ctx.currentTime + 0.3) {
      schedule(step, next);
      next += st;
      step = (step + 1) % total;
    }
  }, 50);
  stops.push(() => clearInterval(timer));
}

// The Clockworks: a music-box waltz in 3/4 with a ticking clock underneath (original).
const MUSIC_BOX = {
  bpm: 200, stepsPerBar: 6, // each step is an eighth note: 6 per 3/4 bar
  chords: [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62], [60, 64, 67], [52, 55, 60], [53, 57, 62], [55, 59, 65]],
  roots: [36, 33, 41, 43, 36, 40, 38, 43],
  melody: [
    [[84, 2], [79, 1], [76, 1], [79, 2]],
    [[81, 2], [76, 1], [72, 1], [76, 2]],
    [[77, 1], [81, 1], [84, 2], [81, 2]],
    [[79, 3], [77, 1], [74, 2]],
    [[76, 1], [79, 1], [84, 2], [88, 2]],
    [[86, 2], [84, 1], [83, 1], [84, 2]],
    [[81, 1], [77, 1], [74, 2], [77, 2]],
    [[79, 4], [83, 2]],
  ],
  lead: 'bell', leadPeak: 0.11,
  bass: 'pluck', bassPattern: [0, R, 7, R, 7, R], bassPeak: 0.1,
  arp: 'bell', arpPattern: [R, R, 1, R, 2, R], arpPeak: 0.035, arpOct: 12,
  drums: { wood: [0, 2, 4], shaker: [1, 3, 5] },
};

function bubbles({ out, verb, every }) {
  every(() => {
    if (ctx.state !== 'running') return;
    const f = rnd(500, 900), n = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) tone({ freq: f * (1 + i * 0.2), to: f * 2.2, glide: 0.06, start: i * 0.09, attack: 0.003, decay: 0.08, peak: 0.03, dest: out, wet: 0.8, verb, pan: rnd(-0.7, 0.7) });
  }, [0.8, 2.5]);
}

// The Cloud Isles: a light, floaty pop tune (original).
const SKY_SONG = {
  bpm: 104, stepsPerBar: 16,
  chords: [[65, 69, 72, 76], [62, 65, 69, 72], [70, 74, 77, 81], [72, 76, 79], [65, 69, 72, 76], [69, 72, 76], [70, 74, 77], [72, 76, 79, 82]],
  roots: [41, 38, 46, 48, 41, 45, 46, 48],
  melody: [
    [[81, 4], [79, 2], [77, 2], [76, 4], [77, 4]],
    [[74, 6], [72, 2], [69, 8]],
    [[77, 4], [79, 2], [81, 2], [82, 4], [81, 4]],
    [[79, 12], [R, 4]],
    [[84, 4], [81, 2], [79, 2], [77, 4], [81, 4]],
    [[79, 6], [76, 2], [72, 8]],
    [[74, 4], [77, 4], [81, 4], [79, 4]],
    [[77, 12], [R, 4]],
  ],
  lead: 'glass', leadPeak: 0.07,
  bass: 'pluck', bassPattern: [0, R, R, R, R, R, 7, R, 12, R, R, R, 7, R, R, R], bassPeak: 0.13,
  arp: 'bell', arpPattern: [0, R, 1, R, 2, R, 3, R, 2, R, 1, R, 2, R, 3, R], arpPeak: 0.028, arpOct: 12,
  drums: { kick: [0, 10], shaker: [2, 6, 10, 14], wood: [4, 12] },
};
