// Hand-built SVG scenes for each location. Each scene has:
//   - a tap target element with [data-tap]
//   - feature groups with [data-feature="id"] that appear once built
//   - a <g data-sprites> layer where helper sprites drift around
// viewBox is 1000x700; the scene is cropped with "slice" so it always fills.

function rand(seed) {
  // Small deterministic PRNG so stars don't jump around between renders.
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

function stars(seed, n, maxY) {
  const r = rand(seed);
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = (r() * 1000).toFixed(1), y = (r() * maxY).toFixed(1);
    const s = (r() * 1.6 + 0.4).toFixed(2), delay = (r() * 4).toFixed(2);
    out += `<circle class="star" cx="${x}" cy="${y}" r="${s}" style="animation-delay:${delay}s"/>`;
  }
  return out;
}

const pond = () => `
<svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="p-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0b0b2b"/><stop offset="0.6" stop-color="#1f1e57"/><stop offset="1" stop-color="#3a2f6e"/>
    </linearGradient>
    <radialGradient id="p-moon" cx="0.45" cy="0.4" r="0.6">
      <stop offset="0" stop-color="#fffbe8"/><stop offset="0.7" stop-color="#f1e9c6"/><stop offset="1" stop-color="#d9cfa5"/>
    </radialGradient>
    <radialGradient id="p-halo"><stop offset="0" stop-color="#fff6cf" stop-opacity="0.45"/><stop offset="1" stop-color="#fff6cf" stop-opacity="0"/></radialGradient>
    <radialGradient id="p-water" cx="0.5" cy="0.35" r="0.7">
      <stop offset="0" stop-color="#3f5aa8"/><stop offset="0.6" stop-color="#22306e"/><stop offset="1" stop-color="#141a45"/>
    </radialGradient>
    <linearGradient id="p-ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1c2a3f"/><stop offset="1" stop-color="#0c1322"/>
    </linearGradient>
    <radialGradient id="p-wellglow"><stop offset="0" stop-color="#bff3ff" stop-opacity="0.9"/><stop offset="1" stop-color="#bff3ff" stop-opacity="0"/></radialGradient>
    <filter id="p-blur"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>

  <rect width="1000" height="700" fill="url(#p-sky)"/>
  <g class="stars">${stars(7, 90, 330)}</g>
  <circle cx="700" cy="130" r="150" fill="url(#p-halo)"/>
  <circle cx="700" cy="130" r="58" fill="url(#p-moon)"/>
  <circle cx="680" cy="118" r="9" fill="#e3d9b0" opacity="0.6"/><circle cx="718" cy="148" r="6" fill="#e3d9b0" opacity="0.5"/>

  <!-- distant tree line -->
  <path d="M0 360 Q40 300 80 345 Q110 280 150 340 Q190 290 230 350 Q270 310 300 355 L340 350 Q380 300 420 352 Q470 320 520 356 Q570 300 610 350 Q660 315 700 355 Q750 290 800 350 Q840 305 880 348 Q930 290 1000 345 L1000 420 L0 420 Z" fill="#131a3a"/>
  <rect y="400" width="1000" height="300" fill="url(#p-ground)"/>

  <!-- the pond (tap target) -->
  <g data-tap class="tap-target pond-target">
    <ellipse cx="500" cy="540" rx="400" ry="125" fill="#0c1430" opacity="0.6"/>
    <ellipse class="pond-water" cx="500" cy="530" rx="380" ry="112" fill="url(#p-water)" stroke="#5c78c8" stroke-opacity="0.35" stroke-width="3"/>
    <ellipse cx="640" cy="515" rx="44" ry="13" fill="#fff6d4" opacity="0.55" filter="url(#p-blur)"/>
    <ellipse class="shimmer" cx="640" cy="515" rx="26" ry="4" fill="#fffbe8" opacity="0.8"/>
    <path class="shimmer s2" d="M330 520 q30 -6 60 0" stroke="#a8c4ff" stroke-width="2" fill="none" opacity="0.5"/>
    <path class="shimmer s3" d="M520 570 q40 -7 80 0" stroke="#a8c4ff" stroke-width="2" fill="none" opacity="0.4"/>
    <path class="shimmer" d="M400 470 q25 -5 50 0" stroke="#a8c4ff" stroke-width="2" fill="none" opacity="0.4"/>
  </g>

  <!-- reeds (always) -->
  <g stroke="#2f5a4a" stroke-width="5" stroke-linecap="round" fill="none">
    <path d="M170 560 q-6 -80 4 -150"/><path d="M190 565 q8 -70 -2 -130"/><path d="M205 560 q-4 -60 10 -110"/>
    <path d="M820 560 q6 -90 -6 -160"/><path d="M840 565 q-5 -70 4 -120"/>
  </g>
  <g fill="#6b4b3a"><rect x="167" y="405" width="10" height="34" rx="5"/><rect x="809" y="398" width="10" height="36" rx="5"/></g>

  <!-- FEATURE: lily pads -->
  <g data-feature="lilypads">
    <g fill="#3f8f5e" stroke="#2c6b45" stroke-width="2">
      <path d="M300 540 a40 15 0 1 0 6 -14 l-6 14 z"/>
      <path d="M720 560 a46 17 0 1 0 8 -15 l-8 15 z"/>
      <path d="M560 495 a32 12 0 1 0 5 -11 l-5 11 z"/>
      <path d="M420 590 a36 13 0 1 0 6 -12 l-6 12 z"/>
    </g>
    <g fill="#ffd1ea"><circle cx="300" cy="530" r="9"/><circle cx="728" cy="550" r="10"/></g>
    <g fill="#fff3fa"><circle cx="300" cy="528" r="4"/><circle cx="728" cy="548" r="4"/></g>
  </g>

  <!-- FEATURE: stone bridge -->
  <g data-feature="bridge">
    <path d="M250 480 Q370 370 490 480 L470 488 Q370 405 270 488 Z" fill="#7a7f95" stroke="#4e5268" stroke-width="3"/>
    <g fill="#5b9467" opacity="0.8"><circle cx="300" cy="450" r="7"/><circle cx="430" cy="440" r="6"/><circle cx="370" cy="425" r="5"/></g>
  </g>

  <!-- FEATURE: moonwell -->
  <g data-feature="moonwell" transform="translate(-170 -88)">
    <circle cx="905" cy="455" r="70" fill="url(#p-wellglow)" class="pulse"/>
    <ellipse cx="905" cy="470" rx="48" ry="16" fill="#9fdcff"/>
    <path d="M857 470 v28 q48 22 96 0 v-28" fill="#8a8fa8" stroke="#4e5268" stroke-width="3"/>
    <ellipse cx="905" cy="470" rx="48" ry="16" fill="none" stroke="#c7cbe0" stroke-width="4"/>
  </g>

  <!-- FEATURE: reed chimes -->
  <g data-feature="reedchimes" transform="translate(60 0)">
    <path d="M100 395 q60 20 120 0" stroke="#c9b48a" stroke-width="2" fill="none"/>
    <g fill="#ffe7a3" class="sway"><rect x="118" y="400" width="5" height="26" rx="2"/><rect x="150" y="407" width="5" height="32" rx="2"/><rect x="182" y="404" width="5" height="22" rx="2"/></g>
  </g>

  <g data-sprites></g>
</svg>`;

const mushroom = () => `
<svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="m-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0a1420"/><stop offset="0.6" stop-color="#132b2a"/><stop offset="1" stop-color="#1b3a2d"/>
    </linearGradient>
    <linearGradient id="m-ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1d3324"/><stop offset="1" stop-color="#0b1810"/>
    </linearGradient>
    <radialGradient id="m-cap" cx="0.4" cy="0.3" r="0.8">
      <stop offset="0" stop-color="#ff8fd0"/><stop offset="0.6" stop-color="#b8399a"/><stop offset="1" stop-color="#6e1f63"/>
    </radialGradient>
    <radialGradient id="m-glow"><stop offset="0" stop-color="#c8ff9a" stop-opacity="0.55"/><stop offset="1" stop-color="#c8ff9a" stop-opacity="0"/></radialGradient>
    <radialGradient id="m-lantern"><stop offset="0" stop-color="#fff2b0"/><stop offset="0.5" stop-color="#ffc861" stop-opacity="0.7"/><stop offset="1" stop-color="#ffc861" stop-opacity="0"/></radialGradient>
    <linearGradient id="m-stem" x1="0" x2="1"><stop offset="0" stop-color="#d9d0b8"/><stop offset="1" stop-color="#f5eedb"/></linearGradient>
  </defs>

  <rect width="1000" height="700" fill="url(#m-sky)"/>
  <g class="stars">${stars(13, 50, 220)}</g>
  <!-- tree trunks framing the clearing -->
  <g fill="#0d1a14">
    <path d="M0 0 h110 q-10 300 30 470 h-140 z"/>
    <path d="M1000 0 h-120 q15 280 -20 470 h140 z"/>
    <path d="M180 0 h40 q-6 250 14 430 h-60 q14 -200 6 -430z" opacity="0.7"/>
    <path d="M800 0 h40 q-8 220 8 420 h-58 q16 -200 10 -420z" opacity="0.7"/>
  </g>
  <ellipse cx="500" cy="560" rx="520" ry="190" fill="url(#m-ground)"/>
  <circle cx="500" cy="420" r="280" fill="url(#m-glow)" class="pulse"/>

  <!-- FEATURE: fairy lanterns -->
  <g data-feature="lanterns">
    <path d="M110 150 Q300 260 500 190 Q700 120 890 170" stroke="#3a2d1f" stroke-width="2" fill="none"/>
    ${[[200, 205], [320, 222], [430, 205], [570, 172], [680, 150], [800, 158]].map(([x, y], i) => `
      <line x1="${x}" y1="${y}" x2="${x}" y2="${y + 22}" stroke="#3a2d1f" stroke-width="1.5"/>
      <circle cx="${x}" cy="${y + 34}" r="30" fill="url(#m-lantern)" class="pulse" style="animation-delay:${i * 0.4}s"/>
      <rect x="${x - 7}" y="${y + 22}" width="14" height="20" rx="5" fill="#ffe08a"/>`).join('')}
  </g>

  <!-- ring of small mushrooms -->
  ${[[180, 520, 0.7], [280, 470, 0.55], [390, 445, 0.45], [610, 445, 0.45], [720, 470, 0.55], [820, 520, 0.7], [700, 610, 0.8], [300, 610, 0.8]].map(([x, y, s], i) => `
    <g transform="translate(${x} ${y}) scale(${s})">
      <rect x="-12" y="-10" width="24" height="60" rx="10" fill="url(#m-stem)"/>
      <path d="M-60 -6 Q0 -80 60 -6 Z" fill="${i % 2 ? '#7fd1ff' : '#c06bff'}" opacity="0.95"/>
      <circle cx="-20" cy="-30" r="6" fill="#fff" opacity="0.7"/><circle cx="18" cy="-24" r="5" fill="#fff" opacity="0.6"/>
    </g>`).join('')}

  <!-- FEATURE: spore garden -->
  <g data-feature="sporegarden">
    ${[[90, 640], [150, 665], [210, 650], [790, 650], [850, 668], [910, 640], [470, 680], [540, 676]].map(([x, y], i) => `
      <g transform="translate(${x} ${y})" class="pulse" style="animation-delay:${i * 0.3}s">
        <circle r="22" fill="url(#m-glow)"/>
        <rect x="-3" y="-4" width="6" height="16" rx="3" fill="#d8f5c8"/>
        <path d="M-12 -2 Q0 -18 12 -2 Z" fill="#a6ff6e"/>
      </g>`).join('')}
  </g>

  <!-- FEATURE: toadstool throne -->
  <g data-feature="throne">
    <g transform="translate(860 470)">
      <rect x="-26" y="-20" width="52" height="110" rx="14" fill="url(#m-stem)"/>
      <path d="M-70 -14 Q0 -100 70 -14 Z" fill="#ffcf5c"/>
      <path d="M-34 -20 h68 v-55 q-34 -26 -68 0 z" fill="#d9a63a" opacity="0.9"/>
      <path d="M-18 -92 l8 -16 l10 12 l10 -12 l8 16 z" fill="#ffe9a0"/>
    </g>
  </g>

  <!-- the great toadstool (tap target) -->
  <g data-tap class="tap-target toad-target">
    <ellipse cx="500" cy="600" rx="150" ry="22" fill="#000" opacity="0.35"/>
    <path d="M455 420 Q448 520 440 600 h120 Q552 520 545 420 Z" fill="url(#m-stem)"/>
    <path d="M462 470 q38 14 76 0" stroke="#c9bfa5" stroke-width="3" fill="none"/>
    <path class="toad-cap" d="M300 430 Q300 250 500 240 Q700 250 700 430 Q600 455 500 450 Q400 455 300 430 Z" fill="url(#m-cap)" stroke="#5a1650" stroke-width="3"/>
    <g fill="#ffe9fb" class="spots">
      <circle cx="420" cy="320" r="22"/><circle cx="520" cy="290" r="16"/><circle cx="600" cy="350" r="24"/>
      <circle cx="370" cy="390" r="14"/><circle cx="500" cy="375" r="18"/><circle cx="640" cy="410" r="12"/>
    </g>
  </g>

  <g data-sprites></g>
</svg>`;

export const SCENES = { pond, mushroom };

// Sprite colour per location (helpers drawn as drifting motes).
export const SPRITE_COLORS = { pond: '#fff3a0', mushroom: '#c8ff9a' };
