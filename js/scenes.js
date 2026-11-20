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
    <radialGradient id="p-halo-red"><stop offset="0" stop-color="#ff3a4a" stop-opacity="0.5"/><stop offset="1" stop-color="#ff3a4a" stop-opacity="0"/></radialGradient>
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
  <circle class="moon-halo" cx="700" cy="130" r="150" fill="url(#p-halo)"/>
  <circle class="moon-disc" cx="700" cy="130" r="58" fill="url(#p-moon)"/>
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

function starPath(cx, cy, R, r, rot = -90) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = ((rot + i * 36) * Math.PI) / 180, rad = i % 2 ? r : R;
    d += `${i ? 'L' : 'M'}${(cx + rad * Math.cos(a)).toFixed(1)} ${(cy + rad * Math.sin(a)).toFixed(1)} `;
  }
  return d + 'Z';
}

const oak = () => `
<svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="o-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1b1035"/><stop offset="0.55" stop-color="#4a2350"/><stop offset="1" stop-color="#b8603e"/>
    </linearGradient>
    <linearGradient id="o-bark" x1="0" x2="1">
      <stop offset="0" stop-color="#2a1a14"/><stop offset="0.45" stop-color="#5a3a27"/><stop offset="1" stop-color="#2e1d15"/>
    </linearGradient>
    <radialGradient id="o-hollow" cx="0.5" cy="0.6" r="0.6">
      <stop offset="0" stop-color="#ffcf6b"/><stop offset="0.35" stop-color="#c46d1d"/><stop offset="1" stop-color="#1a0d07"/>
    </radialGradient>
    <radialGradient id="o-glow"><stop offset="0" stop-color="#ffc35a" stop-opacity="0.7"/><stop offset="1" stop-color="#ffc35a" stop-opacity="0"/></radialGradient>
    <radialGradient id="o-leaf" cx="0.4" cy="0.3" r="0.8"><stop offset="0" stop-color="#3f5a32"/><stop offset="1" stop-color="#1a2a1a"/></radialGradient>
  </defs>
  <rect width="1000" height="700" fill="url(#o-sky)"/>
  <g class="stars">${stars(21, 40, 200)}</g>
  <path d="M0 520 Q250 470 500 500 Q750 470 1000 515 L1000 700 L0 700 Z" fill="#24162a"/>
  <path d="M0 580 Q300 540 500 560 Q700 540 1000 585 L1000 700 L0 700 Z" fill="#1a1020"/>

  <!-- canopy -->
  <g fill="url(#o-leaf)">
    <circle cx="300" cy="120" r="150"/><circle cx="500" cy="60" r="190"/><circle cx="720" cy="130" r="160"/>
    <circle cx="180" cy="220" r="110"/><circle cx="830" cy="230" r="110"/><circle cx="420" cy="200" r="130"/><circle cx="600" cy="210" r="130"/>
  </g>
  <g fill="#f2b45a" opacity="0.18"><circle cx="420" cy="80" r="40"/><circle cx="640" cy="120" r="30"/><circle cx="250" cy="170" r="26"/></g>
  <!-- branch for the swing -->
  <path d="M440 290 Q330 250 190 270 L190 284 Q330 266 440 312 Z" fill="#3a271b"/>

  <!-- FEATURE: treehouse library -->
  <g data-feature="library">
    <path d="M560 300 Q680 260 800 290 L800 302 Q680 276 560 322 Z" fill="#3a271b"/>
    <rect x="690" y="200" width="110" height="90" rx="6" fill="#7a5233" stroke="#3b2516" stroke-width="3"/>
    <path d="M675 205 L745 150 L815 205 Z" fill="#5c2f3a" stroke="#3b1d24" stroke-width="3"/>
    <rect x="712" y="225" width="30" height="30" rx="4" fill="#ffd27a" class="pulse"/>
    <rect x="752" y="225" width="30" height="30" rx="4" fill="#ffd27a" class="pulse" style="animation-delay:-1.3s"/>
    <g stroke="#6b4a2e" stroke-width="4"><line x1="700" y1="290" x2="700" y2="420"/><line x1="720" y1="290" x2="720" y2="420"/></g>
    <g stroke="#6b4a2e" stroke-width="3">${[310, 335, 360, 385, 410].map((y) => `<line x1="700" y1="${y}" x2="720" y2="${y}"/>`).join('')}</g>
  </g>

  <!-- the trunk and hollow (tap target) -->
  <g data-tap class="tap-target oak-target">
    <path d="M370 700 Q400 600 410 450 Q415 330 430 230 L570 230 Q585 330 590 450 Q600 600 630 700 Z" fill="url(#o-bark)"/>
    <path d="M330 700 Q380 660 410 610 L420 700 Z M670 700 Q620 660 590 610 L580 700 Z" fill="#3a2519"/>
    <g stroke="#24160f" stroke-width="3" fill="none" opacity="0.7">
      <path d="M450 250 Q445 350 455 470"/><path d="M545 260 Q555 380 540 520"/><path d="M500 560 Q495 620 505 690"/>
    </g>
    <circle cx="500" cy="420" r="120" fill="url(#o-glow)" class="pulse"/>
    <ellipse cx="500" cy="420" rx="58" ry="80" fill="url(#o-hollow)" stroke="#24160f" stroke-width="6"/>
    <g fill="#ffbf4f"><ellipse cx="455" cy="520" rx="6" ry="9"/><ellipse cx="548" cy="360" rx="5" ry="8"/><ellipse cx="540" cy="560" rx="5" ry="7"/></g>
  </g>

  <!-- FEATURE: rope swing -->
  <g data-feature="ropeswing">
    <g class="sway">
      <line x1="225" y1="278" x2="225" y2="520" stroke="#c9a46a" stroke-width="3"/>
      <line x1="285" y1="278" x2="285" y2="520" stroke="#c9a46a" stroke-width="3"/>
      <rect x="212" y="516" width="86" height="12" rx="5" fill="#8a5d34"/>
    </g>
  </g>

  <!-- FEATURE: heartwood core -->
  <g data-feature="heartwood">
    <circle cx="500" cy="420" r="160" fill="url(#o-glow)" class="pulse"/>
    <ellipse cx="500" cy="420" rx="92" ry="116" fill="none" stroke="#ffd27a" stroke-width="3" stroke-dasharray="4 10" class="spin"/>
    <circle cx="500" cy="430" r="22" fill="#fff0c2" class="pulse"/>
  </g>

  <g data-sprites></g>
</svg>`;

const grotto = () => `
<svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <radialGradient id="g-bg" cx="0.5" cy="0.55" r="0.75">
      <stop offset="0" stop-color="#2b2366"/><stop offset="0.6" stop-color="#140f35"/><stop offset="1" stop-color="#07061a"/>
    </radialGradient>
    <linearGradient id="g-crys" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f3eaff"/><stop offset="0.45" stop-color="#b79cff"/><stop offset="1" stop-color="#5a3fc0"/>
    </linearGradient>
    <linearGradient id="g-crys2" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e1fbff"/><stop offset="0.5" stop-color="#86d8ff"/><stop offset="1" stop-color="#3b6ac0"/>
    </linearGradient>
    <radialGradient id="g-glow"><stop offset="0" stop-color="#b9a2ff" stop-opacity="0.6"/><stop offset="1" stop-color="#b9a2ff" stop-opacity="0"/></radialGradient>
    <linearGradient id="g-beam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0.35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="g-rainbow" x1="0" x2="1">
      <stop offset="0" stop-color="#ff8fb1"/><stop offset="0.25" stop-color="#ffd27a"/><stop offset="0.5" stop-color="#9dffb0"/><stop offset="0.75" stop-color="#8fd8ff"/><stop offset="1" stop-color="#c9a7ff"/>
    </linearGradient>
  </defs>
  <rect width="1000" height="700" fill="url(#g-bg)"/>
  <!-- cave walls -->
  <path d="M0 0 H1000 V120 Q900 160 860 120 Q800 200 740 140 Q680 180 620 110 Q560 150 500 100 Q440 150 380 110 Q320 180 260 130 Q200 200 140 130 Q80 170 0 120 Z" fill="#0b0920"/>
  <g fill="#0b0920">
    <path d="M200 120 L225 260 L250 125 Z"/><path d="M420 105 L440 220 L460 110 Z"/><path d="M640 112 L668 290 L690 120 Z"/><path d="M800 135 L815 230 L835 140 Z"/>
  </g>
  <path d="M0 700 V420 Q80 400 140 460 Q220 520 300 540 Q500 580 700 540 Q790 520 860 460 Q920 400 1000 420 V700 Z" fill="#0d0b26"/>
  <path d="M0 700 V560 Q250 600 500 610 Q750 600 1000 560 V700 Z" fill="#090719"/>

  <!-- FEATURE: light prisms -->
  <g data-feature="prisms">
    <path d="M440 0 L560 0 L700 620 L300 620 Z" fill="url(#g-beam)" class="pulse"/>
    <path d="M380 560 L420 500 L460 560 Z" fill="url(#g-crys2)" opacity="0.9"/>
    <path d="M330 600 Q500 520 680 600" stroke="url(#g-rainbow)" stroke-width="10" fill="none" opacity="0.45"/>
    <path d="M190 470 L215 430 L240 470 Z" fill="url(#g-crys2)"/><path d="M760 470 L785 430 L810 470 Z" fill="url(#g-crys2)"/>
    <path d="M215 470 L150 610" stroke="url(#g-rainbow)" stroke-width="6" opacity="0.4"/><path d="M785 470 L850 610" stroke="url(#g-rainbow)" stroke-width="6" opacity="0.4"/>
  </g>

  <!-- FEATURE: echo chamber -->
  <g data-feature="echochamber" fill="none" stroke="#c9b6ff">
    <circle cx="500" cy="440" r="210" stroke-width="2" opacity="0.35" class="ring r1"/>
    <circle cx="500" cy="440" r="260" stroke-width="2" opacity="0.25" class="ring r2"/>
    <circle cx="500" cy="440" r="310" stroke-width="2" opacity="0.15" class="ring r3"/>
    <circle cx="500" cy="440" r="235" stroke-width="4" stroke-dasharray="2 22" opacity="0.6" class="spin"/>
  </g>

  <!-- the crystal cluster (tap target) -->
  <g data-tap class="tap-target crystal-target">
    <circle cx="500" cy="440" r="200" fill="url(#g-glow)" class="pulse"/>
    <ellipse cx="500" cy="585" rx="190" ry="26" fill="#000" opacity="0.4"/>
    <path d="M400 580 L370 430 L420 380 L445 580 Z" fill="url(#g-crys2)"/>
    <path d="M555 580 L575 400 L630 360 L640 580 Z" fill="url(#g-crys2)"/>
    <path d="M445 585 L460 300 L500 230 L540 300 L555 585 Z" fill="url(#g-crys)"/>
    <path d="M500 230 L540 300 L555 585 L500 585 Z" fill="#3f2a9a" opacity="0.35"/>
    <path d="M610 585 L650 460 L690 440 L680 585 Z" fill="url(#g-crys)"/>
    <path d="M330 585 L345 480 L380 470 L385 585 Z" fill="url(#g-crys)"/>
    <path d="M470 330 L490 270" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.8"/>
    <path d="M585 420 L598 385" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
  </g>

  <!-- FEATURE: geode vault -->
  <g data-feature="geodevault">
    <circle cx="790" cy="585" r="120" fill="url(#g-glow)" class="pulse"/>
    <path d="M700 620 Q700 520 790 515 Q880 520 880 620 Z" fill="#4a3f5e" stroke="#2a2238" stroke-width="5"/>
    <path d="M720 620 Q722 545 790 540 Q858 545 860 620 Z" fill="#2a1450"/>
    <g fill="url(#g-crys)">
      <path d="M735 620 L750 570 L765 620 Z"/><path d="M760 620 L778 555 L795 620 Z"/><path d="M790 620 L808 560 L822 620 Z"/><path d="M815 620 L832 578 L848 620 Z"/>
    </g>
  </g>

  <g data-sprites></g>
</svg>`;

const meadow = () => `
<svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="s-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#050a24"/><stop offset="0.6" stop-color="#16245a"/><stop offset="1" stop-color="#2c3f7a"/>
    </linearGradient>
    <linearGradient id="s-milky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#c9b6ff" stop-opacity="0"/><stop offset="0.5" stop-color="#e8dcff" stop-opacity="0.22"/><stop offset="1" stop-color="#c9b6ff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="s-star" cx="0.5" cy="0.45" r="0.6">
      <stop offset="0" stop-color="#fffef0"/><stop offset="0.5" stop-color="#fff0a0"/><stop offset="1" stop-color="#ffc94d"/>
    </radialGradient>
    <radialGradient id="s-glow"><stop offset="0" stop-color="#fff3b0" stop-opacity="0.75"/><stop offset="1" stop-color="#fff3b0" stop-opacity="0"/></radialGradient>
    <linearGradient id="s-hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d3a3a"/><stop offset="1" stop-color="#0c1a1e"/></linearGradient>
    <filter id="s-blur"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>
  <rect width="1000" height="700" fill="url(#s-sky)"/>
  <path d="M-50 380 Q300 120 1050 40 L1050 160 Q400 220 -50 470 Z" fill="url(#s-milky)" filter="url(#s-blur)"/>
  <g class="stars">${stars(33, 160, 420)}</g>
  <g class="shooting">
    <line x1="0" y1="0" x2="80" y2="-30" stroke="#fff" stroke-width="2" stroke-linecap="round" class="shoot s1"/>
    <line x1="0" y1="0" x2="80" y2="-30" stroke="#fff" stroke-width="2" stroke-linecap="round" class="shoot s2"/>
  </g>
  <path d="M0 470 Q200 400 420 440 Q640 480 820 410 Q920 380 1000 400 V700 H0 Z" fill="#183034"/>

  <!-- FEATURE: observatory (on the far hill) -->
  <g data-feature="observatory" transform="translate(-450 16)">
    <rect x="770" y="350" width="50" height="66" fill="#c8c3d8" stroke="#5b5672" stroke-width="3"/>
    <path d="M762 352 Q795 300 828 352 Z" fill="#9aa0c8" stroke="#5b5672" stroke-width="3"/>
    <path d="M800 330 L845 296" stroke="#5b5672" stroke-width="7" stroke-linecap="round"/>
    <rect x="787" y="375" width="16" height="22" rx="3" fill="#ffe08a" class="pulse"/>
  </g>

  <path d="M0 540 Q250 480 500 520 Q750 560 1000 500 V700 H0 Z" fill="url(#s-hill)"/>
  <g stroke="#2f5a4e" stroke-width="3" stroke-linecap="round" opacity="0.8">
    ${Array.from({ length: 40 }, (_, i) => { const x = 20 + i * 25 + (i % 3) * 5, y = 600 + (i % 5) * 18; return `<path d="M${x} ${y} q${(i % 2 ? 4 : -4)} -16 ${(i % 2 ? 8 : -6)} -26"/>`; }).join('')}
  </g>

  <!-- FEATURE: star loom -->
  <g data-feature="starloom">
    <g stroke="#8a6a44" stroke-width="7" stroke-linecap="round"><line x1="170" y1="600" x2="180" y2="440"/><line x1="290" y1="600" x2="280" y2="440"/><line x1="170" y1="445" x2="290" y2="445"/><line x1="172" y1="560" x2="288" y2="560"/></g>
    <g stroke="#fff0a0" stroke-width="2" opacity="0.85" class="pulse">${[195, 210, 225, 240, 255, 270].map((x) => `<line x1="${x}" y1="448" x2="${x}" y2="557"/>`).join('')}</g>
    <path d="M182 500 L278 500" stroke="#c9b6ff" stroke-width="5" opacity="0.8"/>
  </g>

  <!-- FEATURE: wishing stone -->
  <g data-feature="wishingstone">
    <circle cx="760" cy="500" r="90" fill="url(#s-glow)" class="pulse" opacity="0.6"/>
    <path d="M725 590 Q718 470 750 420 Q785 410 800 450 Q810 520 800 590 Z" fill="#6c7088" stroke="#3c3f55" stroke-width="4"/>
    <g fill="none" stroke="#9fe8ff" stroke-width="3" class="pulse"><path d="M752 460 l10 18 l-10 18"/><circle cx="765" cy="530" r="9"/></g>
  </g>

  <!-- the fallen star (tap target) -->
  <g data-tap class="tap-target star-target">
    <circle cx="500" cy="480" r="190" fill="url(#s-glow)" class="pulse"/>
    <ellipse cx="500" cy="590" rx="150" ry="24" fill="#0a1512" opacity="0.6"/>
    <path d="${starPath(500, 480, 125, 55, -80)}" fill="url(#s-star)" stroke="#ffe080" stroke-width="4" stroke-linejoin="round"/>
    <path d="${starPath(500, 480, 70, 30, -80)}" fill="#fffef6" opacity="0.55"/>
    <g fill="#2f5a4e"><path d="M380 600 q10 -40 18 -60 q4 30 -2 60 z"/><path d="M600 600 q6 -45 20 -64 q2 34 -6 64 z"/></g>
  </g>

  <g data-sprites></g>
</svg>`;

// Window positions in the courtyard: [x, y, width, height]
export const CASTLE_WINDOWS = [[500, 215, 56, 80], [265, 262, 36, 54], [730, 292, 34, 50]];

// Count Dracula, peering out of a window.
function draculaFace() {
  return `
    <circle class="drac-hit" r="34" fill="transparent"/>
    <path d="M-20 24 L-15 2 L0 16 L15 2 L20 24 Z" fill="#7a0016"/>
    <path d="M-15 2 L-9 10 L0 16 L9 10 L15 2 L13 12 L0 20 L-13 12 Z" fill="#1a0610"/>
    <ellipse cx="0" cy="0" rx="10.5" ry="13.5" fill="#e6dce6"/>
    <path d="M-11 -2 Q-12 -15 0 -16 Q12 -15 11 -2 Q8 -9 4 -9 L0 -4 L-4 -9 Q-8 -9 -11 -2z" fill="#140810"/>
    <path d="M-7.5 -4 L-2 -2.5 M7.5 -4 L2 -2.5" stroke="#140810" stroke-width="1.6" stroke-linecap="round"/>
    <ellipse cx="-4.2" cy="0" rx="2.2" ry="1.3" fill="#ff2a3a"/><ellipse cx="4.2" cy="0" rx="2.2" ry="1.3" fill="#ff2a3a"/>
    <path d="M-1 3 L0 6 L1 3" fill="none" stroke="#b8a8b8" stroke-width=".8"/>
    <path d="M-4.5 8.5 Q0 10.5 4.5 8.5" stroke="#5a0010" stroke-width="1.4" fill="none"/>
    <path d="M-2.6 9 L-2 11.6 L-1.3 9.3 Z M2.6 9 L2 11.6 L1.3 9.3 Z" fill="#fff"/>`;
}

// The Blood Moon's castle courtyard (only reachable during the event).
const courtyard = () => `
<svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="c-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#12030a"/><stop offset="0.55" stop-color="#3a0814"/><stop offset="1" stop-color="#5a1020"/>
    </linearGradient>
    <radialGradient id="c-moon" cx="0.42" cy="0.4" r="0.65">
      <stop offset="0" stop-color="#ff8a7a"/><stop offset="0.6" stop-color="#d0283c"/><stop offset="1" stop-color="#8a0f22"/>
    </radialGradient>
    <radialGradient id="c-halo"><stop offset="0" stop-color="#ff3a4a" stop-opacity="0.5"/><stop offset="1" stop-color="#ff3a4a" stop-opacity="0"/></radialGradient>
    <radialGradient id="c-blood" cx="0.45" cy="0.35" r="0.7">
      <stop offset="0" stop-color="#c8102e"/><stop offset="0.6" stop-color="#7a0016"/><stop offset="1" stop-color="#3a0008"/>
    </radialGradient>
    <linearGradient id="c-stone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4258"/><stop offset="1" stop-color="#2a2434"/></linearGradient>
    <linearGradient id="c-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1e2a"/><stop offset="1" stop-color="#120a12"/></linearGradient>
    <radialGradient id="c-torch"><stop offset="0" stop-color="#ffb35a" stop-opacity="0.8"/><stop offset="1" stop-color="#ff5a2a" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1000" height="700" fill="url(#c-sky)"/>
  <g class="stars" opacity="0.6">${stars(66, 50, 260)}</g>
  <circle cx="720" cy="140" r="170" fill="url(#c-halo)" class="pulse"/>
  <circle cx="720" cy="140" r="70" fill="url(#c-moon)"/>
  <circle cx="700" cy="125" r="10" fill="#a8142a" opacity="0.5"/><circle cx="742" cy="160" r="7" fill="#a8142a" opacity="0.45"/>

  <!-- castle silhouette -->
  <g fill="#0c0610">
    <path d="M140 440 V250 l20 -40 l20 40 V440z"/>
    <path d="M230 440 V180 l35 -80 l35 80 V440z"/>
    <path d="M330 440 V300 h340 V440z"/>
    <path d="M330 300 v-24 h20 v12 h20 v-12 h20 v12 h20 v-12 h20 v12 h20 v-12 h20 v12 h20 v-12 h20 v12 h20 v-12 h20 v12 h20 v-12 h20 v12 h20 v-12 h20 v12 h20 v-12 h20 v24z"/>
    <path d="M430 300 V150 l70 -110 l70 110 V300z"/>
    <path d="M700 440 V200 l30 -70 l30 70 V440z"/>
    <path d="M800 440 V270 l22 -45 l22 45 V440z"/>
  </g>
  <g fill="#ffb35a" class="pulse">
    <rect x="400" y="340" width="10" height="18" rx="5"/><rect x="590" y="340" width="10" height="18" rx="5"/>
  </g>
  <!-- Arched windows: Dracula peers out of one now and then -->
  ${CASTLE_WINDOWS.map(([x, y, w, h], i) => `
    <path class="win" data-win="${i}" d="M${x - w / 2} ${y + h / 2} V${y - h / 2 + w / 2} a${w / 2} ${w / 2} 0 0 1 ${w} 0 V${y + h / 2} Z" fill="#ffb35a"/>
    <line x1="${x}" y1="${y - h / 2 + 2}" x2="${x}" y2="${y + h / 2}" stroke="#0c0610" stroke-width="2"/>
    <g class="dracula" data-drac="${i}" transform="translate(${x} ${y + h * 0.08}) scale(${(w / 40).toFixed(2)})">${draculaFace()}</g>`).join('')}
  <!-- bats circling the towers -->
  <g fill="#0c0610">
    ${[[300, 120, 0], [600, 90, 1.2], [820, 200, 2.1], [380, 200, 3]].map(([x, y, d]) => `<g class="bat" style="animation-delay:-${d}s"><path transform="translate(${x} ${y})" d="M0 0 q-8 -8 -18 -2 q6 0 6 6 q4 -4 6 0 q2 -4 6 0 q0 -6 6 -6 q-10 -6 -18 2z"/></g>`).join('')}
  </g>

  <!-- courtyard walls with arches -->
  <path d="M0 470 V380 H1000 V470 Z" fill="#231a26"/>
  ${[60, 200, 340, 620, 760, 900].map((x) => `<path d="M${x - 40} 470 V420 a40 40 0 0 1 80 0 V470z" fill="#120a12"/>`).join('')}
  <rect y="470" width="1000" height="230" fill="url(#c-floor)"/>
  <g stroke="#3a2a3a" stroke-width="2" opacity="0.6">
    ${[520, 570, 630].map((y) => `<line x1="0" y1="${y}" x2="1000" y2="${y}"/>`).join('')}
    ${[-300, -150, 0, 150, 300].map((dx) => `<line x1="${500 + dx * 0.4}" y1="470" x2="${500 + dx * 2.2}" y2="700"/>`).join('')}
  </g>

  <!-- torches -->
  ${[[150, 420], [850, 420]].map(([x, y]) => `
    <circle cx="${x}" cy="${y - 30}" r="70" fill="url(#c-torch)" class="flicker"/>
    <rect x="${x - 4}" y="${y - 20}" width="8" height="60" fill="#3a2a2a"/>
    <path d="M${x - 10} ${y - 22} q10 -36 20 0z" fill="#ffb35a" class="flicker"/>`).join('')}

  <!-- the blood pool (tap target) -->
  <g data-tap class="tap-target blood-target">
    <ellipse cx="500" cy="590" rx="250" ry="62" fill="#000" opacity="0.45"/>
    <ellipse cx="500" cy="572" rx="235" ry="64" fill="url(#c-stone)" stroke="#5a5068" stroke-width="3"/>
    <ellipse class="blood-surface" cx="500" cy="566" rx="205" ry="48" fill="url(#c-blood)"/>
    <ellipse cx="455" cy="552" rx="60" ry="9" fill="#ff8a8a" opacity="0.35" class="shimmer"/>
    <path d="M482 566 V470 h36 V566" fill="url(#c-stone)" stroke="#5a5068" stroke-width="2"/>
    <ellipse cx="500" cy="470" rx="46" ry="12" fill="#4a4258" stroke="#5a5068" stroke-width="2"/>
    <path d="M488 470 q12 -40 24 0" fill="#3a3248"/>
    <path class="drip" d="M500 480 v70" stroke="#a8102a" stroke-width="5" stroke-linecap="round"/>
  </g>
  <g fill="#c8102e" opacity="0.85"><circle cx="280" cy="640" r="5"/><circle cx="720" cy="650" r="4"/><circle cx="640" cy="672" r="3"/></g>

  <g data-sprites></g>
</svg>`;


// A gear outline centred at 0,0 (radius r, n teeth).
function gearPath(r, n, tooth = 0.18) {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a0 = (i / (n * 2)) * Math.PI * 2, a1 = ((i + 1) / (n * 2)) * Math.PI * 2;
    const rr = i % 2 ? r : r * (1 + tooth);
    d += `${i ? 'L' : 'M'}${(rr * Math.cos(a0)).toFixed(1)} ${(rr * Math.sin(a0)).toFixed(1)} L${(rr * Math.cos(a1)).toFixed(1)} ${(rr * Math.sin(a1)).toFixed(1)} `;
  }
  return d + 'Z';
}

// The Cuckoo Clockworks: inside a giant cuckoo clock.
const clockworks = () => `
<svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="k-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1608"/><stop offset="1" stop-color="#4a2a12"/></linearGradient>
    <linearGradient id="k-wood" x1="0" x2="1"><stop offset="0" stop-color="#6b3e1c"/><stop offset=".5" stop-color="#8a5228"/><stop offset="1" stop-color="#5a3216"/></linearGradient>
    <radialGradient id="k-face" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#fff8e6"/><stop offset="1" stop-color="#e8d6a8"/></radialGradient>
    <linearGradient id="k-brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset=".5" stop-color="#d9a530"/><stop offset="1" stop-color="#a87418"/></linearGradient>
    <radialGradient id="k-glow"><stop offset="0" stop-color="#ffd27a" stop-opacity=".45"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1000" height="700" fill="url(#k-bg)"/>
  <!-- background gears turning -->
  <g fill="#3a2010" stroke="#5a3418" stroke-width="3">
    <g transform="translate(130 180)"><path class="gear" d="${gearPath(110, 14)}"/><circle r="30" fill="#2a1608"/></g>
    <g transform="translate(880 230)"><path class="gear rev" d="${gearPath(90, 12)}"/><circle r="24" fill="#2a1608"/></g>
    <g transform="translate(860 560)"><path class="gear" d="${gearPath(70, 10)}"/><circle r="18" fill="#2a1608"/></g>
    <g transform="translate(150 560)"><path class="gear rev" d="${gearPath(80, 11)}"/><circle r="20" fill="#2a1608"/></g>
  </g>
  <g fill="url(#k-brass)" opacity=".75">
    <g transform="translate(250 330)"><path class="gear rev fast" d="${gearPath(46, 9)}"/><circle r="12" fill="#5a3418"/></g>
    <g transform="translate(760 380)"><path class="gear fast" d="${gearPath(40, 8)}"/><circle r="10" fill="#5a3418"/></g>
  </g>
  <!-- chains and weights -->
  <g stroke="#c9a46a" stroke-width="3" stroke-dasharray="6 4"><line x1="400" y1="0" x2="400" y2="520"/><line x1="600" y1="0" x2="600" y2="470"/></g>
  <g fill="url(#k-brass)"><path d="M386 520 h28 l-4 70 h-20 z"/><path d="M586 470 h28 l-4 70 h-20 z"/></g>
  <path d="M386 520 l14 -18 l14 18 z M586 470 l14 -18 l14 18 z" fill="#3f8f5e"/>

  <!-- the clock (tap target) -->
  <g data-tap class="tap-target clock-target">
    <circle cx="500" cy="300" r="250" fill="url(#k-glow)" class="pulse"/>
    <!-- house-shaped case -->
    <path d="M330 220 L500 80 L670 220 Z" fill="#5a3216" stroke="#3a2010" stroke-width="5"/>
    <path d="M310 228 L500 64 L690 228" fill="none" stroke="#3f8f5e" stroke-width="14" stroke-linecap="round"/>
    <rect x="350" y="214" width="300" height="250" rx="10" fill="url(#k-wood)" stroke="#3a2010" stroke-width="5"/>
    <g fill="#3f8f5e">${[[355, 236], [645, 236], [355, 446], [645, 446]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9"/>`).join('')}</g>
    <!-- cuckoo door -->
    <rect x="470" y="128" width="60" height="70" rx="6" fill="#3a2010"/>
    <path class="cuckoo-door" d="M472 130 h28 v66 h-28 z" fill="#8a5228" stroke="#3a2010" stroke-width="2"/>
    <path class="cuckoo-door r" d="M500 130 h28 v66 h-28 z" fill="#8a5228" stroke="#3a2010" stroke-width="2"/>
    <!-- face -->
    <circle cx="500" cy="338" r="104" fill="url(#k-brass)"/>
    <circle cx="500" cy="338" r="92" fill="url(#k-face)"/>
    ${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<circle cx="${(500 + Math.sin(a) * 76).toFixed(1)}" cy="${(338 - Math.cos(a) * 76).toFixed(1)}" r="${i % 3 ? 3.5 : 6}" fill="#5a3216"/>`; }).join('')}
    <g class="hand-min" style="transform-origin:500px 338px"><rect x="497" y="262" width="6" height="80" rx="3" fill="#2a1608"/></g>
    <g class="hand-hr" style="transform-origin:500px 338px"><rect x="495" y="290" width="10" height="52" rx="5" fill="#2a1608"/></g>
    <circle cx="500" cy="338" r="9" fill="url(#k-brass)" stroke="#2a1608" stroke-width="2"/>
    <!-- pendulum -->
    <g class="pendulum" style="transform-origin:500px 464px">
      <rect x="496" y="464" width="8" height="130" fill="url(#k-brass)"/>
      <circle cx="500" cy="606" r="30" fill="url(#k-brass)" stroke="#a87418" stroke-width="3"/>
      <circle cx="492" cy="598" r="9" fill="#fff6c8" opacity=".6"/>
    </g>
  </g>

  <!-- the cuckoo bird: pops out of its door now and then -->
  <g class="cuckoo" transform="translate(500 166)">
    <circle class="cuckoo-hit" r="46" fill="transparent"/>
    <rect x="-6" y="-2" width="70" height="6" rx="3" fill="#6b3e1c"/>
    <g transform="translate(58 -6)">
      <ellipse rx="22" ry="16" fill="#4a9ad8"/>
      <circle cx="16" cy="-12" r="12" fill="#5ab0ea"/>
      <path d="M26 -14 L40 -10 L26 -6 Z" fill="#ffb03a"/>
      <circle cx="19" cy="-15" r="2.6" fill="#1b1030"/>
      <path d="M-20 -4 L-36 -14 L-30 2 Z" fill="#3a7ab8"/>
      <ellipse cx="-2" cy="2" rx="10" ry="6" fill="#3a7ab8"/>
    </g>
  </g>

  <g data-sprites></g>
</svg>`;

export const SCENES = { pond, mushroom, oak, grotto, meadow, courtyard, clockworks };

// Sprite colour per location (helpers drawn as drifting motes).
export const SPRITE_COLORS = { pond: '#fff3a0', mushroom: '#c8ff9a', oak: '#ffc35a', grotto: '#d6c8ff', meadow: '#fff8c8' };
