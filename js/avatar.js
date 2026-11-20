// The player's fairy: a layered SVG built from body options and clothes.
// Drawn in a 200x260 box; the head is centred at (100, 88), the right hand at (134, 175).
// Clothes are purely cosmetic. Which items are owned is tracked in game state;
// the list of items and how they unlock lives in data.js (COSTUMES).

export const SKINS = ['#ffe3cf', '#f6cfae', '#e8b48a', '#c98e62', '#9a6440', '#6e4228', '#d8c8ff', '#bff0d8', '#bfe0ff'];
export const HAIR_COLORS = ['#f7c96b', '#ffe8a8', '#c0763a', '#7a4a2a', '#2a1c18', '#e85a5a', '#ff9fcf', '#b48cff', '#7fd3ff', '#9dffb0', '#f4f1ea'];
export const EYE_COLORS = ['#5a7fd8', '#3f9a6a', '#8a5a2a', '#9a5ad8', '#d8508a', '#2a2a3a'];
export const WING_COLORS = ['#c9a7ff', '#ffb3e0', '#8fd8ff', '#9dffb0', '#ffe27a', '#ffb35a', '#f4f1ea', '#ff6a7a'];

export const HAIR_STYLES = ['long', 'bob', 'pigtails', 'bun', 'pixie', 'curly', 'afro', 'braids', 'ponytail', 'dreads'];
export const FACE_PAINTS = ['none', 'hearts', 'stars', 'whiskers', 'butterfly', 'rainbow', 'moon', 'flowers', 'glitter'];
export const EYE_STYLES = ['round', 'sparkly', 'sleepy', 'happy'];
export const WING_STYLES = ['butterfly', 'dragonfly', 'moth', 'leaf', 'crystal'];
export const EAR_STYLES = ['pointy', 'round'];

export const NAMES = {
  long: 'Long', bob: 'Bob', pigtails: 'Pigtails', bun: 'Bun', pixie: 'Pixie', curly: 'Curly', afro: 'Afro', braids: 'Braids', ponytail: 'Ponytail', dreads: 'Locs & beads',
  none: 'None', hearts: 'Hearts', stars: 'Stars', whiskers: 'Whiskers', rainbow: 'Rainbow', moon: 'Moon', flowers: 'Flowers', glitter: 'Glitter',
  round: 'Round', sparkly: 'Sparkly', sleepy: 'Sleepy', happy: 'Happy',
  butterfly: 'Butterfly', dragonfly: 'Dragonfly', moth: 'Moth', leaf: 'Leaf', crystal: 'Crystal',
  pointy: 'Pointy',
};

export const DEFAULT_LOOK = {
  skin: 0, hair: 'long', hairColor: 0, eyes: 'sparkly', eyeColor: 0,
  wings: 'butterfly', wingColor: 0, ears: 'pointy', blush: true, freckles: false,
  head: 'flower_clip', outfit: 'leaf_dress', feet: 'slippers', held: 'wand',
  familiar: 'pet_bunny', paint: 'none',
};

const mirror = (inner) => `<g transform="translate(200 0) scale(-1 1)">${inner}</g>`;
const both = (inner) => inner + mirror(inner);

// ---------- body parts ----------

const WINGS = {
  butterfly: () => both(`<path d="M100 146 C62 92 24 108 42 148 C52 170 84 162 100 150 Z"/><path d="M100 154 C72 160 54 196 78 202 C92 204 98 182 100 160 Z"/>`),
  dragonfly: () => both(`<ellipse cx="62" cy="128" rx="42" ry="11" transform="rotate(22 62 128)"/><ellipse cx="66" cy="162" rx="36" ry="9" transform="rotate(-14 66 162)"/>`),
  moth: () => both(`<path d="M100 140 Q42 96 20 140 Q48 150 38 188 Q74 172 100 158 Z"/>`),
  leaf: () => both(`<path d="M100 148 Q54 76 28 118 Q44 160 100 152 Z"/><path d="M100 150 Q76 112 40 120" fill="none" stroke-width="1.5"/><path d="M100 158 Q64 168 60 198 Q90 192 100 162 Z"/>`),
  crystal: () => both(`<path d="M100 146 L38 96 L50 152 Z"/><path d="M100 150 L28 140 L60 168 Z"/><path d="M100 156 L56 184 L82 196 Z"/>`),
};

function hairBack(style, c) {
  switch (style) {
    case 'long': return `<path d="M58 85 Q52 150 68 190 L132 190 Q148 150 142 85 Q100 40 58 85 Z" fill="${c}"/>`;
    case 'bob': return `<path d="M56 88 Q54 128 70 130 L130 130 Q146 128 144 88 Q100 40 56 88 Z" fill="${c}"/>`;
    case 'pigtails': return `<ellipse cx="54" cy="122" rx="14" ry="28" fill="${c}"/><ellipse cx="146" cy="122" rx="14" ry="28" fill="${c}"/>
      <circle cx="58" cy="96" r="5" fill="#ff7fbf"/><circle cx="142" cy="96" r="5" fill="#ff7fbf"/><path d="M60 86 Q100 40 140 86 Z" fill="${c}"/>`;
    case 'bun': return `<circle cx="100" cy="44" r="17" fill="${c}"/><path d="M60 88 Q100 40 140 88 Z" fill="${c}"/>`;
    case 'pixie': return `<path d="M57 100 Q50 52 78 36 Q98 22 124 32 Q152 46 143 100 Q138 74 100 66 Q62 74 57 100 Z" fill="${c}"/>`;
    case 'braids': {
      const braid = (x) => Array.from({ length: 7 }, (_, i) => `<ellipse cx="${x}" cy="${104 + i * 12}" rx="${9 - i * 0.5}" ry="8"/>`).join('') +
        `<rect x="${x - 5}" y="186" width="10" height="5" rx="2" fill="#ff7fbf"/><path d="M${x - 4} 191 l-2 10 M${x} 191 v11 M${x + 4} 191 l2 10" stroke="${c}" stroke-width="3"/>`;
      return `<path d="M60 86 Q100 40 140 86 Z" fill="${c}"/><g fill="${c}" stroke="#000" stroke-opacity=".12" stroke-width="1.5">${braid(60)}${braid(140)}</g>`;
    }
    case 'ponytail': return `<path d="M60 88 Q100 40 140 88 Z" fill="${c}"/>
      <path d="M122 54 Q160 52 160 96 Q160 140 140 170 Q148 130 138 104 Q132 80 118 70 Z" fill="${c}"/>
      <ellipse cx="124" cy="58" rx="9" ry="7" fill="#ff7fbf"/>`;
    case 'dreads': {
      const beads = ['#ffd24d', '#ff6a7a', '#8fd8ff', '#9dffb0', '#c9a7ff'];
      const locks = [[58, 150], [66, 168], [76, 176], [124, 176], [134, 168], [142, 150], [52, 130], [148, 130]];
      return `<path d="M58 90 Q100 38 142 90 Z" fill="${c}"/>` + locks.map(([x, end], i) =>
        `<path d="M${x} 70 Q${x + (i % 2 ? 4 : -4)} ${(70 + end) / 2} ${x} ${end}" stroke="${c}" stroke-width="10" stroke-linecap="round" fill="none"/>
         <circle cx="${x}" cy="${end - 12 - (i % 3) * 10}" r="4.5" fill="${beads[i % 5]}" stroke="#000" stroke-opacity=".2"/>`).join('');
    }
    case 'afro': return `<g fill="${c}"><circle cx="100" cy="76" r="58"/>${Array.from({ length: 18 }, (_, i) => {
      const a = (i / 18) * Math.PI * 2; return `<circle cx="${(100 + Math.cos(a) * 56).toFixed(1)}" cy="${(76 + Math.sin(a) * 54).toFixed(1)}" r="13"/>`; }).join('')}</g>`;
    case 'curly': return `<g fill="${c}">${[[62, 70], [56, 92], [58, 114], [66, 130], [138, 70], [144, 92], [142, 114], [134, 130], [80, 52], [120, 52], [100, 46]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15"/>`).join('')}</g>`;
  }
  return '';
}

function hairFront(style, c) {
  switch (style) {
    case 'long':
    case 'bob': return `<path d="M60 88 Q62 50 100 48 Q138 50 140 88 Q130 70 112 64 Q100 78 86 66 Q70 72 60 88 Z" fill="${c}"/>`;
    case 'pigtails': return `<path d="M60 86 Q60 48 100 46 Q140 48 140 86 Q120 72 100 74 Q80 72 60 86 Z" fill="${c}"/>`;
    case 'bun': return `<path d="M60 88 Q64 50 100 50 Q136 50 140 88 Q122 64 100 60 Q78 64 60 88 Z" fill="${c}"/>`;
    case 'pixie': return `<path d="M58 94 Q54 54 82 40 Q104 28 126 38 Q148 52 142 90 Q136 70 120 62 Q112 76 92 74 Q76 72 66 80 Q60 86 58 94 Z" fill="${c}"/>
      <path d="M84 40 Q88 22 104 20 Q98 28 100 36 Q108 22 122 26 Q112 30 112 40 Z" fill="${c}"/>
      <path d="M78 52 Q96 44 116 50" stroke="#000" stroke-opacity=".12" stroke-width="2" fill="none"/>`;
    case 'braids': return `<path d="M60 88 Q60 48 100 46 Q140 48 140 88 Q124 66 102 62 L100 50 L98 62 Q76 66 60 88 Z" fill="${c}"/>`;
    case 'ponytail': return `<path d="M60 88 Q62 48 100 46 Q138 48 140 88 Q126 60 100 58 Q74 60 60 88 Z" fill="${c}"/>
      <path d="M72 64 Q100 50 128 60" stroke="#fff" stroke-opacity=".18" stroke-width="3" fill="none"/>`;
    case 'dreads': {
      const beads = ['#ffd24d', '#ff6a7a', '#8fd8ff'];
      return `<path d="M60 86 Q62 48 100 46 Q138 48 140 86 Q120 66 100 64 Q80 66 60 86 Z" fill="${c}"/>` +
        [[70, 104], [84, 84], [116, 84], [130, 104]].map(([x, end], i) =>
          `<path d="M${x} 56 Q${x + (i < 2 ? -3 : 3)} ${(56 + end) / 2} ${x + (i < 2 ? -6 : 6)} ${end}" stroke="${c}" stroke-width="8" stroke-linecap="round" fill="none"/>
           <circle cx="${x + (i < 2 ? -6 : 6)}" cy="${end - 6}" r="3.6" fill="${beads[i % 3]}" stroke="#000" stroke-opacity=".2"/>`).join('');
    }
    case 'afro': return `<g fill="${c}">${Array.from({ length: 9 }, (_, i) => {
      const a = Math.PI * (1.08 + (i / 8) * 0.84); return `<circle cx="${(100 + Math.cos(a) * 40).toFixed(1)}" cy="${(90 + Math.sin(a) * 40).toFixed(1)}" r="11"/>`; }).join('')}</g>`;
    case 'curly': return `<g fill="${c}">${[[70, 64], [86, 54], [102, 52], [118, 56], [132, 66]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13"/>`).join('')}</g>`;
  }
  return '';
}

function eyes(style, color, skin) {
  const one = (x) => {
    switch (style) {
      case 'round': return `<ellipse cx="${x}" cy="96" rx="7.5" ry="8.5" fill="#fff"/><circle cx="${x}" cy="97" r="5.5" fill="${color}"/><circle cx="${x}" cy="97" r="2.6" fill="#1b1030"/><circle cx="${x - 2}" cy="94.5" r="1.8" fill="#fff"/>`;
      case 'sparkly': return `<ellipse cx="${x}" cy="96" rx="8" ry="9.5" fill="#1b1030"/><ellipse cx="${x}" cy="98" rx="6.5" ry="7" fill="${color}"/><ellipse cx="${x}" cy="101" rx="5" ry="3.5" fill="#fff" opacity=".25"/>
        <circle cx="${x - 2.5}" cy="93" r="2.6" fill="#fff"/><circle cx="${x + 2.5}" cy="100" r="1.3" fill="#fff"/>`;
      case 'sleepy': return `<ellipse cx="${x}" cy="97" rx="7.5" ry="7" fill="#fff"/><circle cx="${x}" cy="99" r="5" fill="${color}"/><circle cx="${x}" cy="99" r="2.4" fill="#1b1030"/>
        <path d="M${x - 8.5} 97 Q${x} 87 ${x + 8.5} 97 L${x + 8.5} 89 L${x - 8.5} 89 Z" fill="${skin}"/><path d="M${x - 8} 96.5 Q${x} 92 ${x + 8} 96.5" stroke="#1b1030" stroke-width="2" fill="none"/>`;
      case 'happy': return `<path d="M${x - 7} 99 Q${x} 89 ${x + 7} 99" stroke="#1b1030" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    }
    return '';
  };
  return one(84) + one(116);
}

function ears(style, skin) {
  if (style === 'round') return `<circle cx="60" cy="98" r="9" fill="${skin}"/><circle cx="140" cy="98" r="9" fill="${skin}"/>`;
  return both(`<path d="M64 92 L42 76 L60 108 Z" fill="${skin}"/><path d="M60 94 L48 84 L58 102 Z" fill="#000" opacity=".06"/>`);
}

// ---------- face paint (drawn on the face, under the eyes) ----------
function facePaint(kind) {
  const heart = (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 3 C-6 -2 -4 -7 0 -4 C4 -7 6 -2 0 3 Z" fill="${c}"/>`;
  switch (kind) {
    case 'hearts': return heart(74, 110, 1.3, '#ff4a7a') + heart(126, 110, 1.3, '#ff4a7a') + heart(66, 102, 0.7, '#ff8fb3');
    case 'stars': return star(73, 110, 5, '#ffd24d') + star(127, 110, 5, '#ffd24d') + star(130, 86, 3, '#fff6c8');
    case 'whiskers': return `<ellipse cx="100" cy="104" rx="4" ry="3" fill="#3a2a3a"/><g stroke="#3a2a3a" stroke-width="1.6" stroke-linecap="round">
      <path d="M86 106 L66 102 M86 110 L66 112 M114 106 L134 102 M114 110 L134 112"/></g>`;
    case 'butterfly': return `<g opacity=".75"><path d="M100 96 Q80 72 66 82 Q62 98 80 104 Q66 112 76 120 Q92 118 100 104 Z" fill="#c06bff"/>
      <path d="M100 96 Q120 72 134 82 Q138 98 120 104 Q134 112 124 120 Q108 118 100 104 Z" fill="#ff7fbf"/></g>
      <g fill="#fff" opacity=".8"><circle cx="72" cy="88" r="2"/><circle cx="128" cy="88" r="2"/></g>`;
    case 'rainbow': return `<g fill="none" stroke-width="2.6" stroke-linecap="round">${['#ff6a7a', '#ffb35a', '#ffe27a', '#6ad880', '#6ac0ff', '#b79cff'].map((c, i) =>
      `<path d="M${116 + i * 0} ${118 - i * 2.6} q10 -14 20 -6" stroke="${c}" transform="translate(${-2 + i * 0.5} ${i * 0})"/>`).join('')}</g>`;
    case 'moon': return `<path d="M100 60 a8 8 0 1 0 6 13 a6 6 0 1 1 -6 -13 z" fill="#fff6c8" stroke="#d9a520" stroke-width=".8"/>
      <g fill="#fff6c8"><circle cx="90" cy="70" r="1.4"/><circle cx="112" cy="68" r="1.4"/><circle cx="74" cy="104" r="1.2"/><circle cx="126" cy="104" r="1.2"/></g>`;
    case 'flowers': return `<path d="M64 76 Q70 92 66 106" stroke="#3f8f5e" stroke-width="1.8" fill="none"/>
      ${[[64, 76, '#ff9fcf'], [70, 92, '#c9a7ff'], [66, 106, '#ffd24d']].map(([x, y, c]) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map((a) =>
        `<circle r="2.4" cy="-3" fill="${c}" transform="rotate(${a})"/>`).join('')}<circle r="1.6" fill="#fff"/></g>`).join('')}`;
    case 'glitter': return `<g fill="#fff">${[[74, 106, 1.6], [79, 111, 1.1], [70, 112, 1.2], [126, 106, 1.6], [121, 111, 1.1], [130, 112, 1.2], [82, 104, 0.9], [118, 104, 0.9]].map(([x, y, r]) =>
      `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g><g fill="#ffd6f4">${[[76, 116], [124, 116]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3"/>`).join('')}</g>`;
  }
  return '';
}

// ---------- clothes ----------
// Each item returns { back?, front } markup. `back` is drawn behind the body.

const star = (cx, cy, r, fill) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = ((-90 + i * 36) * Math.PI) / 180, rr = i % 2 ? r * 0.45 : r;
    d += `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)} `;
  }
  return `<path d="${d}Z" fill="${fill}"/>`;
};
const bodice = (fill) => `<path d="M80 132 Q100 126 120 132 L122 160 L78 160 Z" fill="${fill}"/>`;
const bell = (fill, hem = 202) => `<path d="M78 158 Q60 ${hem - 2} 62 ${hem} Q100 ${hem + 10} 138 ${hem} Q140 ${hem - 2} 122 158 Z" fill="${fill}"/>`;
const gown = (fill) => `<path d="M78 156 Q66 220 56 238 L144 238 Q134 220 122 156 Z" fill="${fill}"/>`;

export const ITEMS = {
  // Headwear
  none_head: { front: '' },
  flower_clip: { front: `<g transform="translate(130 62)">${[0, 72, 144, 216, 288].map((a) => `<circle r="5.5" cx="0" cy="-7" fill="#ff9fcf" transform="rotate(${a})"/>`).join('')}<circle r="4" fill="#ffe27a"/></g>` },
  bow: { front: `<g transform="translate(78 54) rotate(-15)"><path d="M0 0 L-18 -10 L-18 10 Z M0 0 L18 -10 L18 10 Z" fill="#ff7fbf"/><circle r="5" fill="#ff5aa8"/></g>` },
  lily_crown: { front: `<ellipse cx="100" cy="56" rx="38" ry="9" fill="none" stroke="#3f8f5e" stroke-width="5"/>
    ${[66, 84, 116, 134].map((x) => `<ellipse cx="${x}" cy="${x === 66 || x === 134 ? 58 : 50}" rx="7" ry="4" fill="#5fbf6a"/>`).join('')}
    <g transform="translate(100 46)">${[0, 60, 120, 180, 240, 300].map((a) => `<ellipse rx="3.5" ry="8" cy="-6" fill="#ffd1ea" transform="rotate(${a})"/>`).join('')}<circle r="3.5" fill="#ffe27a"/></g>` },
  toadstool_cap: { front: `<path d="M56 72 Q58 20 100 18 Q142 20 144 72 Q100 58 56 72 Z" fill="#e0342c"/>
    <g fill="#fff"><circle cx="80" cy="42" r="7"/><circle cx="112" cy="32" r="6"/><circle cx="126" cy="54" r="5"/><circle cx="96" cy="56" r="4"/></g>` },
  acorn_cap: { front: `<path d="M60 70 Q62 28 100 26 Q138 28 140 70 Q100 60 60 70 Z" fill="#8a5d34"/>
    <path d="M66 58 L134 58 M72 44 L128 44 M84 32 L116 32" stroke="#6b4423" stroke-width="2"/><rect x="96" y="12" width="8" height="16" rx="3" fill="#6b4423"/>` },
  crystal_tiara: { front: `<path d="M62 64 Q100 46 138 64" stroke="#d6c8ff" stroke-width="5" fill="none"/>
    <path d="M92 52 L100 26 L108 52 Z" fill="#b79cff" stroke="#f3eaff"/><path d="M76 58 L80 40 L86 56 Z" fill="#8fd8ff"/><path d="M114 56 L120 40 L124 58 Z" fill="#8fd8ff"/>` },
  star_crown: { front: `<path d="M66 62 L66 38 L80 50 L90 30 L100 46 L110 30 L120 50 L134 38 L134 62 Z" fill="#ffd24d" stroke="#d9a520" stroke-width="2"/>
    ${star(100, 54, 6, '#fff6c8')}<circle cx="78" cy="56" r="3" fill="#8fd8ff"/><circle cx="122" cy="56" r="3" fill="#ff9fcf"/>` },
  bat_band: { front: `<path d="M60 70 Q100 40 140 70" stroke="#1a0610" stroke-width="6" fill="none"/>
    ${both('<path d="M68 58 Q54 38 38 46 Q46 50 46 56 Q52 52 56 58 Q60 54 64 60 Z" fill="#1a0610"/>')}` },
  moon_crown: { front: `<path d="M62 66 Q100 50 138 66" stroke="#e6e2ff" stroke-width="4" fill="none"/>
    <path d="M100 30 a12 12 0 1 0 9 20 a9 9 0 1 1 -9 -20 z" fill="#fff6c8" stroke="#e6e2ff"/>` },
  lotus_crown: { front: `<g transform="translate(100 46)">${[-60, -30, 0, 30, 60].map((a) => `<ellipse rx="5" ry="14" fill="#ffe27a" stroke="#d9a520" transform="rotate(${a}) translate(0 -8)"/>`).join('')}<circle r="5" fill="#fff6c8"/></g>` },
  witch_hat: { front: `<ellipse cx="100" cy="58" rx="56" ry="11" fill="#5a3aa8"/><path d="M72 56 L110 -2 Q116 6 112 12 L130 56 Z" fill="#6a4ac0"/>
    <rect x="76" y="44" width="52" height="8" fill="#3a2478"/><rect x="96" y="43" width="10" height="10" rx="2" fill="#ffd24d"/>` },
  cuckoo_hat: { front: `<path d="M64 66 Q66 30 100 26 Q134 30 136 66 Q100 58 64 66 Z" fill="#6b3e1c"/><path d="M60 68 L100 34 L140 68" fill="none" stroke="#3f8f5e" stroke-width="6" stroke-linecap="round"/>
    <rect x="90" y="40" width="20" height="18" rx="3" fill="#3a2010"/><g transform="translate(110 46)"><ellipse rx="10" ry="7" fill="#4a9ad8"/><circle cx="7" cy="-5" r="5.5" fill="#5ab0ea"/><path d="M12 -6 L19 -4 L12 -2 Z" fill="#ffb03a"/><circle cx="8" cy="-6" r="1.4" fill="#1b1030"/></g>` },
  shell_crown: { front: `<path d="M64 66 Q100 48 136 66" stroke="#ffd6e8" stroke-width="5" fill="none"/>
    <g transform="translate(100 46)"><path d="M-16 8 Q-18 -14 0 -18 Q18 -14 16 8 Z" fill="#ffb3d0" stroke="#e07aa8" stroke-width="2"/>${[-8, -3, 3, 8].map((x) => `<path d="M0 6 L${x} -14" stroke="#e07aa8" stroke-width="1.5"/>`).join('')}</g>
    <circle cx="78" cy="60" r="5" fill="#f4f8ff"/><circle cx="122" cy="60" r="5" fill="#f4f8ff"/>` },
  rainbow_band: { front: `${['#ff8a9a', '#ffb35a', '#ffe27a', '#9ae87a', '#8fd8ff', '#b79cff'].map((c, i) => `<path d="M${62 + i * 2} 70 Q100 ${38 + i * 3} ${138 - i * 2} 70" stroke="${c}" stroke-width="3.2" fill="none"/>`).join('')}
    <g fill="#fff"><circle cx="64" cy="70" r="8"/><circle cx="58" cy="64" r="6"/><circle cx="136" cy="70" r="8"/><circle cx="142" cy="64" r="6"/></g>` },
  halo: { front: `<ellipse cx="100" cy="26" rx="30" ry="7" fill="none" stroke="#fff3a0" stroke-width="5" opacity=".9"/><ellipse cx="100" cy="26" rx="30" ry="7" fill="none" stroke="#fff" stroke-width="1.5"/>` },

  // Outfits
  leaf_dress: { front: `${bodice('#5fbf6a')}<path d="M78 158 L64 198 L72 192 L80 200 L88 192 L96 200 L104 192 L112 200 L120 192 L128 200 L136 198 L122 158 Z" fill="#4f9a5a"/>
    <path d="M100 160 V196 M88 164 L82 190 M112 164 L118 190" stroke="#3d7f48" stroke-width="1.5"/>` },
  petal_dress: { front: `${bodice('#ff9fcf')}${[[72, 182, -25], [86, 188, -10], [100, 190, 0], [114, 188, 10], [128, 182, 25]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="22" fill="${r % 20 ? '#ffb3d9' : '#ff8fc4'}" transform="rotate(${r} ${x} ${y})"/>`).join('')}` },
  lily_dress: { front: `${bodice('#8fd8ff')}${bell('#6fc3ee')}<path d="M80 134 Q100 146 120 134 Q118 128 100 130 Q82 128 80 134 Z" fill="#5fbf6a"/>
    <g transform="translate(112 162)">${[0, 72, 144, 216, 288].map((a) => `<ellipse rx="3" ry="6" cy="-5" fill="#ffd1ea" transform="rotate(${a})"/>`).join('')}<circle r="3" fill="#ffe27a"/></g>` },
  spore_dress: { front: `${bodice('#8a4fd0')}${bell('#6a3aa8')}<g fill="#b8ff8a">${[[76, 186], [92, 176], [110, 190], [124, 178], [100, 198], [84, 198]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3"/>`).join('')}</g>` },
  leaf_tunic: { front: `<path d="M80 132 L120 132 L126 188 L74 188 Z" fill="#7a5233"/><rect x="76" y="160" width="48" height="6" fill="#3a2a1a"/>
    <rect x="96" y="159" width="8" height="8" rx="1" fill="#e6c36a"/><path d="M80 132 L90 146 L100 134 L110 146 L120 132 Z" fill="#5fbf6a"/>` },
  amethyst_gown: { front: `${bodice('#b79cff')}${gown('#9a7ff0')}<path d="M100 160 L86 236 M100 160 L114 236 M100 160 L100 236" stroke="#e6dcff" stroke-width="1.2" opacity=".6"/>
    <path d="M94 134 L100 146 L106 134 Z" fill="#e6dcff"/>` },
  starlight_robe: { front: `<path d="M80 132 Q100 126 120 132 L122 156 Q134 220 144 238 L56 238 Q66 220 78 156 Z" fill="#2a3a7a"/>
    <path d="M56 238 L144 238" stroke="#ffd24d" stroke-width="4"/><path d="M100 132 V238" stroke="#ffd24d" stroke-width="2"/>
    ${star(80, 196, 5, '#ffd24d')}${star(122, 210, 4, '#fff6c8')}${star(110, 170, 3.5, '#fff6c8')}${star(88, 224, 3, '#ffd24d')}` },
  vampire_cape: { back: `<path d="M74 132 L48 240 Q100 228 152 240 L126 132 Z" fill="#1a0610"/><path d="M80 134 L60 236 Q100 226 140 236 L120 134 Z" fill="#7a0016"/>
      <path d="M80 134 L60 102 L92 128 Z M120 134 L140 102 L108 128 Z" fill="#7a0016"/>`,
    front: `<path d="M84 132 L116 132 L118 188 L82 188 Z" fill="#2a0a14"/><path d="M92 132 L100 150 L108 132 Z" fill="#f4f1ea"/><circle cx="100" cy="150" r="4" fill="#c8102e"/>
      <g fill="#c8a24a"><circle cx="100" cy="164" r="1.8"/><circle cx="100" cy="176" r="1.8"/></g>` },
  moon_gown: { front: `${bodice('#e8e6ff')}${gown('#d8d4ff')}<path d="M56 238 Q100 226 144 238" stroke="#b79cff" stroke-width="4" fill="none"/>
    <path d="M100 136 a8 8 0 1 0 6 13 a6 6 0 1 1 -6 -13 z" fill="#fff6c8"/>${star(80, 210, 3, '#fff')}${star(120, 196, 3, '#fff')}` },
  clock_coat: { front: `<path d="M80 132 Q100 126 120 132 L130 214 L70 214 Z" fill="#6b3e1c"/><path d="M100 132 V214" stroke="#3a2010" stroke-width="2"/>
    <path d="M86 132 L100 152 L114 132" fill="#f4f1ea"/><g fill="#d9a530" stroke="#a87418">${[160, 176, 192].map((y) => `<circle cx="106" cy="${y}" r="3"/>`).join('')}</g>
    <circle cx="86" cy="186" r="9" fill="#e8d6a8" stroke="#a87418" stroke-width="2"/><path d="M86 186 v-6 M86 186 h4" stroke="#3a2010" stroke-width="1.5"/>
    <path d="M70 214 L64 222 L136 222 L130 214 Z" fill="#5a3216"/>` },
  mermaid_gown: { front: `<path d="M80 132 Q100 124 120 132 L120 150 L80 150 Z" fill="#ffb3d0"/>
    <path d="M80 148 Q74 190 84 214 Q92 228 88 236 L112 236 Q108 228 116 214 Q126 190 120 148 Z" fill="#3ab0a0"/>
    <g fill="none" stroke="#2a8a80" stroke-width="1.5">${[160, 176, 192, 208].map((y) => `<path d="M86 ${y} q5 5 10 0 q5 5 10 0 q5 5 10 0"/>`).join('')}</g>
    <path d="M88 236 Q70 248 66 242 Q82 236 92 230 Z M112 236 Q130 248 134 242 Q118 236 108 230 Z" fill="#5ad0c0"/>
    <g fill="#f4f8ff"><circle cx="88" cy="134" r="2.4"/><circle cx="96" cy="137" r="2.4"/><circle cx="104" cy="137" r="2.4"/><circle cx="112" cy="134" r="2.4"/></g>` },
  cloud_dress: { front: `${bodice('#8fd8ff')}
    <g fill="#ffffff" stroke="#d8e4f8" stroke-width="2"><circle cx="72" cy="186" r="16"/><circle cx="90" cy="194" r="18"/><circle cx="110" cy="194" r="18"/><circle cx="128" cy="186" r="16"/>
      <circle cx="82" cy="170" r="14"/><circle cx="100" cy="168" r="16"/><circle cx="118" cy="170" r="14"/></g>
    <path d="M86 186 q14 -10 28 0" stroke="#ffb3d9" stroke-width="3" fill="none"/>` },
  couch_potato: { front: (skin) => `
    <path d="M70 186 Q68 214 72 240 L96 240 L100 204 L104 240 L128 240 Q132 214 130 186 Z" fill="#9a9aa4"/>
    <path d="M70 196 L130 196" stroke="#7a7a84" stroke-width="3"/><path d="M98 196 l-3 10 M102 196 l3 10" stroke="#e8e8ee" stroke-width="1.5"/>
    <path d="M86 218 q4 8 0 16 M116 216 q-3 8 1 16" stroke="#7a7a84" stroke-width="1.5" fill="none"/>
    <ellipse cx="100" cy="174" rx="42" ry="30" fill="${skin}"/>
    <path d="M84 130 L80 158 Q60 168 62 182 Q100 196 138 182 Q140 168 120 158 L116 130 Q108 138 100 138 Q92 138 84 130 Z" fill="#f2efe4"/>
    <path d="M84 130 L80 158 M116 130 L120 158" stroke="#d8d2c0" stroke-width="2"/>
    <g fill="#b89a5a" opacity=".55"><ellipse cx="90" cy="164" rx="6" ry="4"/><ellipse cx="114" cy="172" rx="4" ry="3"/><circle cx="104" cy="150" r="2.5"/></g>
    <g fill="#d86a3a" opacity=".5"><ellipse cx="78" cy="176" rx="3.5" ry="2.5"/><circle cx="122" cy="160" r="2"/></g>
    <path d="M70 186 Q100 204 130 186" fill="none" stroke="${skin}" stroke-width="6"/>
    <ellipse cx="100" cy="192" rx="2.6" ry="1.8" fill="#000" opacity=".25"/>` },
  tinker_apron: { front: `<path d="M80 132 L120 132 L122 188 L78 188 Z" fill="#5a8ad0"/><path d="M86 140 L114 140 L118 198 L82 198 Z" fill="#b5773e"/>
    <rect x="92" y="170" width="16" height="12" rx="2" fill="#9a6232"/><path d="M104 168 L110 156" stroke="#9aa3b8" stroke-width="3" stroke-linecap="round"/>
    <path d="M86 140 L80 132 M114 140 L120 132" stroke="#8a5d34" stroke-width="2"/>` },

  // Shoes
  none_feet: { front: (skin) => `<ellipse cx="91" cy="241" rx="6" ry="4" fill="${skin}"/><ellipse cx="109" cy="241" rx="6" ry="4" fill="${skin}"/>` },
  slippers: { front: `<ellipse cx="90" cy="242" rx="9" ry="5" fill="#ffb3d9"/><ellipse cx="110" cy="242" rx="9" ry="5" fill="#ffb3d9"/><circle cx="86" cy="240" r="2" fill="#fff"/><circle cx="114" cy="240" r="2" fill="#fff"/>` },
  boots: { front: both('<path d="M84 222 h13 v18 q0 7 -8 7 h-8 q-4 0 -4 -4 q0 -4 7 -4 z" fill="#8a5d34"/>') },
  flats: { front: `<ellipse cx="90" cy="242" rx="9" ry="4.5" fill="#d83a4a"/><ellipse cx="110" cy="242" rx="9" ry="4.5" fill="#d83a4a"/>` },
  crystal_shoes: { front: `<path d="M81 244 L86 236 L98 238 L98 246 Z" fill="#c9b6ff" stroke="#f3eaff"/><path d="M119 244 L114 236 L102 238 L102 246 Z" fill="#c9b6ff" stroke="#f3eaff"/>` },
  star_boots: { front: both('<path d="M84 222 h13 v18 q0 7 -8 7 h-8 q-4 0 -4 -4 q0 -4 7 -4 z" fill="#2a3a7a"/>') + `${star(90, 230, 3.5, '#ffd24d')}${star(110, 230, 3.5, '#ffd24d')}` },

  // Held items (in the right hand at about 134,175)
  none_held: { front: '' },
  wand: { front: `<line x1="134" y1="178" x2="150" y2="140" stroke="#f4f1ea" stroke-width="3" stroke-linecap="round"/>${star(152, 136, 8, '#ffe27a')}` },
  dewdrop_wand: { front: `<line x1="134" y1="178" x2="150" y2="142" stroke="#c6efff" stroke-width="3" stroke-linecap="round"/><path d="M152 122 C158 132 160 136 160 140 a8 8 0 0 1 -16 0 C144 136 146 132 152 122 z" fill="#7fd3ff" stroke="#e8f8ff"/>` },
  mushroom_staff: { front: `<line x1="132" y1="206" x2="146" y2="126" stroke="#d9d0b8" stroke-width="4" stroke-linecap="round"/><path d="M130 128 Q146 104 162 128 Z" fill="#c06bff"/><circle cx="140" cy="120" r="2.5" fill="#fff"/><circle cx="152" cy="122" r="2" fill="#fff"/>` },
  amber_lantern: { front: `<path d="M134 176 L140 186" stroke="#3a2d1f" stroke-width="2"/><circle cx="141" cy="198" r="16" fill="#ffc35a" opacity=".3"/><rect x="134" y="186" width="14" height="20" rx="4" fill="#ffbf4f" stroke="#8a5d34" stroke-width="2"/>` },
  crystal_wand: { front: `<line x1="134" y1="178" x2="150" y2="144" stroke="#e6dcff" stroke-width="3" stroke-linecap="round"/><path d="M146 146 L152 118 L160 146 Z" fill="#b79cff" stroke="#f3eaff"/>` },
  star_wand: { front: `<line x1="134" y1="178" x2="152" y2="142" stroke="#ffd24d" stroke-width="3" stroke-linecap="round"/>${star(156, 134, 12, '#ffe27a')}<path d="M144 132 Q132 124 120 128" stroke="#fff6c8" stroke-width="2" fill="none" opacity=".7"/>` },
  pocket_watch: { front: `<path d="M134 176 Q140 168 146 160" stroke="#d9a530" stroke-width="2" fill="none" stroke-dasharray="3 2"/>
    <circle cx="150" cy="150" r="13" fill="#d9a530" stroke="#a87418" stroke-width="2"/><circle cx="150" cy="150" r="10" fill="#fff8e6"/>
    <path d="M150 150 V143 M150 150 L155 152" stroke="#2a1608" stroke-width="1.6" stroke-linecap="round"/><rect x="147" y="134" width="6" height="4" rx="1" fill="#d9a530"/>` },
  trident: { front: `<line x1="134" y1="206" x2="150" y2="120" stroke="#e8c870" stroke-width="4" stroke-linecap="round"/>
    <path d="M140 122 L144 100 L148 120 M150 120 L152 96 L156 122 M160 124 L162 104 L164 126" stroke="#e8c870" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M140 124 Q152 132 164 126" stroke="#e8c870" stroke-width="3.5" fill="none"/><circle cx="148" cy="134" r="3.5" fill="#8fd8ff"/>` },
  parasol: { front: `<line x1="134" y1="178" x2="146" y2="110" stroke="#c9a46a" stroke-width="3" stroke-linecap="round"/>
    <path d="M106 112 Q146 70 186 112 Q176 104 166 112 Q156 104 146 112 Q136 104 126 112 Q116 104 106 112 Z" fill="#ffb3d9" stroke="#e07aa8" stroke-width="2"/>
    <path d="M146 76 Q140 94 146 112 M146 76 Q126 92 126 112 M146 76 Q166 92 166 112" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>` },
  rose: { front: `<path d="M134 178 Q144 160 146 146" stroke="#3f8f5e" stroke-width="3" fill="none"/><path d="M144 160 q8 -2 8 -8" stroke="#3f8f5e" stroke-width="2.5" fill="none"/>
    <circle cx="147" cy="142" r="8" fill="#c8102e"/><path d="M142 140 q5 -5 10 0 q-5 3 -10 0" fill="#8a0a20"/>` },
};

const part = (id, key, skin) => {
  const it = ITEMS[id];
  if (!it) return '';
  const v = it[key];
  return typeof v === 'function' ? v(skin) : v || '';
};

// Build the fairy. `opts.viewBox` crops (for thumbnails); `opts.cls` adds a class.
export function avatarSVG(look, opts = {}) {
  const L = { ...DEFAULT_LOOK, ...look };
  const skin = SKINS[L.skin] || SKINS[0];
  const hairC = HAIR_COLORS[L.hairColor] || HAIR_COLORS[0];
  const eyeC = EYE_COLORS[L.eyeColor] || EYE_COLORS[0];
  const wingC = WING_COLORS[L.wingColor] || WING_COLORS[0];
  const head = L.head || 'none_head', outfit = L.outfit || 'leaf_dress', feet = L.feet || 'none_feet', held = L.held || 'none_held';
  return `<svg class="avatar ${opts.cls || ''}" viewBox="${opts.viewBox || '0 0 200 260'}" aria-hidden="true">
    <g class="av-wings" fill="${wingC}" fill-opacity=".62" stroke="#fff" stroke-opacity=".8" stroke-width="1.5">${(WINGS[L.wings] || WINGS.butterfly)()}</g>
    ${hairBack(L.hair, hairC)}
    ${part(outfit, 'back', skin)}
    <rect x="87" y="186" width="9" height="54" rx="4.5" fill="${skin}"/><rect x="104" y="186" width="9" height="54" rx="4.5" fill="${skin}"/>
    ${part(feet, 'front', skin)}
    <rect x="94" y="120" width="12" height="16" fill="${skin}"/>
    ${part(outfit, 'front', skin)}
    <g class="av-arm-l"><path d="M81 138 Q66 156 68 178" stroke="${skin}" stroke-width="9" stroke-linecap="round" fill="none"/></g>
    <g class="av-arm-r"><path d="M119 138 Q132 152 134 172" stroke="${skin}" stroke-width="9" stroke-linecap="round" fill="none"/>${part(held, 'front', skin)}</g>
    ${ears(L.ears, skin)}
    <circle cx="100" cy="90" r="40" fill="${skin}"/>
    ${facePaint(L.paint)}
    ${eyes(L.eyes, eyeC, skin)}
    <path d="M94 110 Q100 115.5 106 110" stroke="#b05a6a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    ${L.blush ? '<ellipse cx="76" cy="108" rx="7" ry="4" fill="#ff8fa3" opacity=".5"/><ellipse cx="124" cy="108" rx="7" ry="4" fill="#ff8fa3" opacity=".5"/>' : ''}
    ${L.freckles ? '<g fill="#a0603a" opacity=".55"><circle cx="78" cy="104" r="1.2"/><circle cx="82" cy="107" r="1.2"/><circle cx="76" cy="109" r="1.1"/><circle cx="122" cy="104" r="1.2"/><circle cx="118" cy="107" r="1.2"/><circle cx="124" cy="109" r="1.1"/></g>' : ''}
    ${hairFront(L.hair, hairC)}
    ${part(head, 'front', skin)}
  </svg>`;
}

// Crops for wardrobe thumbnails, by what's being chosen.
export const CROPS = {
  head: '30 -6 140 130', outfit: '36 110 128 140', feet: '62 210 76 44', held: '96 100 84 120',
  hair: '18 2 164 200', eyes: '62 74 76 44', wings: '0 70 200 150', ears: '28 60 144 70', face: '50 40 100 100',
};
