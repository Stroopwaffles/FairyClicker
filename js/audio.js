// Procedural audio: every sound is synthesised with the Web Audio API.
// No audio files are downloaded.
//
//   init()             call from a user gesture (tablets block audio until then)
//   setLocation(id)    crossfade to that location's ambience
//   tap(id), buy(), chime(), build(), fanfare()   sound effects
//   settings: { music, sfx, muted } stored per device

const PREFS_KEY = 'fairyclicker.audio';
const DEFAULTS = { music: 0.6, sfx: 0.8, muted: false };

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

export function tap(locId) {
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
  const def = AMBIENCES[id];
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
