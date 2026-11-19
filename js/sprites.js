// Helper sprites: one small SVG drawing per helper, plus where it lives in its
// scene (zone, in the scene's 1000x700 coordinates) and how it moves (anim).
// Drawings are centred on 0,0 and about 40 units tall.
//
// Animation classes (see css/style.css):
//   flit   wander in little loops        skip   hop across water
//   bob    float up and down             hop    small jumps in place
//   glide  slow figure-of-eight          crawl  walk left/right, turning round
//   climb  go up and down a trunk        peck   rapid knocking
//   sway   gentle rocking                tilt   head tilts with pauses
//   zigzag bat-like darting              orbit  circle around a point
//   slither wave along                   drift  rise slowly and fade, then repeat
//   bound  big arcing leaps

const eyes = (x1, x2, y, r = 1.6, c = '#1b1030') => `<circle cx="${x1}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x2}" cy="${y}" r="${r}" fill="${c}"/>`;
const wingPair = (fill, rx = 9, ry = 5, y = -6, op = 0.65) =>
  `<ellipse class="wing" cx="-7" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" opacity="${op}" transform="rotate(-25 -7 ${y})"/>
   <ellipse class="wing w2" cx="7" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" opacity="${op}" transform="rotate(25 7 ${y})"/>`;

export const SPRITES = {
  // ---------- Moonlit Pond ----------
  firefly: () => `
    <circle class="glowdot" cx="0" cy="5" r="11" fill="#fff36a" opacity=".35"/>
    ${wingPair('#f4fbff', 6, 3.5, -6, 0.45)}
    <ellipse cx="0" cy="-3" rx="3" ry="4.5" fill="#3a2e22"/>
    <circle class="glowdot" cx="0" cy="5" r="5.5" fill="#fff9a8"/>
    <circle cx="0" cy="5" r="2.5" fill="#ffffff"/>`,

  watersprite: () => `
    <path d="M0 -18 C8 -6 12 0 12 6 a12 12 0 0 1 -24 0 C-12 0 -8 -6 0 -18z" fill="#7fd3ff" stroke="#c6efff" stroke-width="1.5"/>
    <ellipse cx="-4" cy="2" rx="2.5" ry="4" fill="#e8f8ff" opacity=".7"/>
    ${eyes(-3.5, 3.5, 4, 1.7)}
    <path d="M-3 9 q3 2.5 6 0" stroke="#1b1030" stroke-width="1.2" fill="none"/>
    <circle cx="-15" cy="12" r="2" fill="#bfefff"/><circle cx="15" cy="10" r="1.6" fill="#bfefff"/>`,

  lilypixie: () => `
    <ellipse cx="0" cy="13" rx="15" ry="5" fill="#3f8f5e"/>
    ${wingPair('#ffd1ea', 8, 5, -6, 0.6)}
    <path d="M-7 10 L0 -4 L7 10 Z" fill="#ff9fcf"/>
    <circle cx="0" cy="-8" r="5.5" fill="#ffe3cf"/>
    <path d="M-6 -9 q6 -9 12 0 q-3 -3 -6 -2 q-3 -1 -6 2z" fill="#ff7fbf"/>
    ${eyes(-2, 2, -7, 0.9)}`,

  frogbard: () => `
    <ellipse cx="0" cy="6" rx="14" ry="11" fill="#5bbf6a"/>
    <circle cx="-7" cy="-5" r="5" fill="#5bbf6a"/><circle cx="7" cy="-5" r="5" fill="#5bbf6a"/>
    <circle cx="-7" cy="-5" r="3" fill="#fff"/><circle cx="7" cy="-5" r="3" fill="#fff"/>
    ${eyes(-7, 7, -5, 1.6)}
    <path d="M-6 3 q6 4 12 0" stroke="#2c6b45" stroke-width="1.5" fill="none"/>
    <ellipse cx="9" cy="10" rx="5" ry="6" fill="#b07a42" transform="rotate(-30 9 10)"/>
    <line x1="12" y1="5" x2="20" y2="-6" stroke="#7a5230" stroke-width="2"/>
    <text class="note" x="14" y="-12" font-size="10" fill="#fff3a0">♪</text>`,

  mothweaver: () => `
    <line x1="0" y1="6" x2="0" y2="26" stroke="#dfe6ff" stroke-width="1" opacity=".7"/>
    <ellipse class="wing" cx="-10" cy="-2" rx="11" ry="8" fill="#c9c2ff" opacity=".85" transform="rotate(-20 -10 -2)"/>
    <ellipse class="wing w2" cx="10" cy="-2" rx="11" ry="8" fill="#c9c2ff" opacity=".85" transform="rotate(20 10 -2)"/>
    <circle cx="-10" cy="-2" r="3" fill="#8a7fe0"/><circle cx="10" cy="-2" r="3" fill="#8a7fe0"/>
    <ellipse cx="0" cy="0" rx="3" ry="8" fill="#f2efff"/>
    <path d="M-2 -8 q-4 -6 -7 -6 M2 -8 q4 -6 7 -6" stroke="#f2efff" stroke-width="1" fill="none"/>`,

  // ---------- Mushroom Ring ----------
  beetle: () => `
    <g stroke="#1d3a2a" stroke-width="1.5"><line x1="-8" y1="4" x2="-13" y2="9"/><line x1="0" y1="6" x2="0" y2="11"/><line x1="8" y1="4" x2="13" y2="9"/></g>
    <ellipse cx="0" cy="0" rx="12" ry="8" fill="#1f5a4a"/>
    <line x1="0" y1="-8" x2="0" y2="8" stroke="#123a30" stroke-width="1.2"/>
    <circle class="glowdot" cx="-5" cy="-1" r="2.2" fill="#b8ff8a"/><circle class="glowdot" cx="5" cy="2" r="2" fill="#b8ff8a"/>
    <circle cx="13" cy="0" r="4" fill="#163f34"/>`,

  snail: () => `
    <path d="M-16 8 Q-4 4 12 8 L14 10 L-16 10 Z" fill="#efe2c4"/>
    <line x1="10" y1="7" x2="13" y2="-3" stroke="#efe2c4" stroke-width="1.6"/><line x1="13" y1="7" x2="17" y2="-2" stroke="#efe2c4" stroke-width="1.6"/>
    <circle cx="13" cy="-3" r="1.5" fill="#1b1030"/><circle cx="17" cy="-2" r="1.5" fill="#1b1030"/>
    <circle cx="-3" cy="-1" r="10" fill="#a06bff"/>
    <path d="M-3 -1 m0 -6 a6 6 0 1 1 -5 9 a3.5 3.5 0 1 1 4 -5" stroke="#e6d6ff" stroke-width="1.6" fill="none"/>
    <circle class="glowdot" cx="-3" cy="-1" r="12" fill="#c8ff9a" opacity=".18"/>`,

  toadtender: () => `
    <ellipse cx="0" cy="6" rx="13" ry="10" fill="#8a9a52"/>
    <circle cx="-6" cy="-3" r="4" fill="#8a9a52"/><circle cx="6" cy="-3" r="4" fill="#8a9a52"/>
    ${eyes(-6, 6, -3, 1.8)}
    <ellipse cx="0" cy="-8" rx="13" ry="3" fill="#e6c36a"/><path d="M-6 -9 q6 -9 12 0z" fill="#e6c36a"/>
    <path d="M10 6 h10 l4 -4 M12 6 v8 h8 v-8" stroke="#7fb8d8" stroke-width="2" fill="#a8d8f0"/>
    <circle cx="25" cy="4" r="1.2" fill="#bfefff"/><circle cx="27" cy="8" r="1" fill="#bfefff"/>`,

  gnome: () => `
    <path d="M-8 14 L-7 -2 L7 -2 L8 14 Z" fill="#3a6fd0"/>
    <circle cx="0" cy="-6" r="6" fill="#ffd8bf"/>
    <path d="M-7 -6 Q0 14 7 -6 Q0 -2 -7 -6z" fill="#f4f1ea"/>
    <path d="M-8 -9 L0 -28 L8 -9 Z" fill="#d83a4a"/>
    <circle cx="0" cy="-5" r="1.6" fill="#f4a08a"/>
    <line x1="10" y1="-4" x2="14" y2="14" stroke="#8a5d34" stroke-width="2"/><path d="M11 13 h7 l-2 5 h-4z" fill="#9aa3b8"/>`,

  lanternmoth: () => `
    <line x1="0" y1="4" x2="0" y2="14" stroke="#3a2d1f" stroke-width="1"/>
    <circle class="glowdot" cx="0" cy="19" r="10" fill="#ffc861" opacity=".35"/>
    <rect x="-4" y="13" width="8" height="10" rx="3" fill="#ffe08a"/>
    <ellipse class="wing" cx="-9" cy="-3" rx="10" ry="7" fill="#e8b27a" opacity=".9" transform="rotate(-25 -9 -3)"/>
    <ellipse class="wing w2" cx="9" cy="-3" rx="10" ry="7" fill="#e8b27a" opacity=".9" transform="rotate(25 9 -3)"/>
    <ellipse cx="0" cy="-2" rx="3" ry="7" fill="#7a5233"/>`,

  // ---------- Ancient Oak ----------
  acornsprite: () => `
    ${wingPair('#fff2d0', 6, 3.5, -2, 0.55)}
    <ellipse cx="0" cy="4" rx="8" ry="10" fill="#b5773e"/>
    <path d="M-9 -4 Q0 -14 9 -4 Q0 -1 -9 -4z" fill="#6b4423"/><line x1="0" y1="-11" x2="2" y2="-15" stroke="#6b4423" stroke-width="2"/>
    ${eyes(-3, 3, 3, 1.4)}
    <line x1="9" y1="2" x2="15" y2="-6" stroke="#6b4423" stroke-width="2"/><rect x="12" y="-10" width="7" height="4" rx="1" fill="#9aa3b8"/>`,

  sapsquirrel: () => `
    <path d="M-4 10 C-22 8 -22 -16 -8 -14 C-16 -6 -12 4 -4 4 z" fill="#d97a34"/>
    <ellipse cx="2" cy="4" rx="8" ry="9" fill="#e8893c"/>
    <circle cx="6" cy="-6" r="6" fill="#e8893c"/>
    <path d="M3 -11 l1 -5 l3 4z M8 -11 l2 -5 l2 5z" fill="#e8893c"/>
    <circle cx="8" cy="-7" r="1.4" fill="#1b1030"/>
    <ellipse cx="8" cy="6" rx="3.5" ry="4.5" fill="#ffbf4f"/>`,

  woodpecker: () => `
    <path d="M-6 14 L-3 4 L0 14z" fill="#222"/>
    <ellipse cx="0" cy="2" rx="7" ry="10" fill="#2a2a2a"/>
    <ellipse cx="1" cy="4" rx="4" ry="7" fill="#f2f2f2"/>
    <circle cx="2" cy="-9" r="6" fill="#2a2a2a"/>
    <path d="M-2 -14 Q2 -20 7 -13 Z" fill="#e0342c"/>
    <path d="M7 -9 L16 -8 L7 -6z" fill="#e8c24a"/>
    <circle cx="4" cy="-10" r="1.3" fill="#fff"/>`,

  dryad: () => `
    <path d="M-10 20 Q-8 2 -4 -4 L4 -4 Q8 2 10 20 Z" fill="#4f9a5a"/>
    <path d="M-10 20 l4 -6 l3 6 l3 -6 l3 6 l3 -6 l4 6z" fill="#3d7f48"/>
    <circle cx="0" cy="-10" r="6.5" fill="#a8d8a0"/>
    <g fill="#5fbf6a"><circle cx="-6" cy="-15" r="4"/><circle cx="0" cy="-18" r="4.5"/><circle cx="6" cy="-15" r="4"/><circle cx="-8" cy="-9" r="3"/><circle cx="8" cy="-9" r="3"/></g>
    ${eyes(-2.3, 2.3, -10, 1.1, '#1f3a20')}
    <circle class="glowdot" cx="-11" cy="4" r="2" fill="#ffd27a"/>`,

  owlsage: () => `
    <ellipse cx="0" cy="4" rx="13" ry="15" fill="#8a6440"/>
    <ellipse cx="0" cy="8" rx="8" ry="9" fill="#d9bf94"/>
    <path d="M-12 -9 l-2 -8 l7 5z M12 -9 l2 -8 l-7 5z" fill="#8a6440"/>
    <circle cx="-5" cy="-4" r="5" fill="#fff6d8"/><circle cx="5" cy="-4" r="5" fill="#fff6d8"/>
    <g class="blink"><circle cx="-5" cy="-4" r="2.5" fill="#1b1030"/><circle cx="5" cy="-4" r="2.5" fill="#1b1030"/></g>
    <circle cx="-5" cy="-4" r="5.5" fill="none" stroke="#c9a46a" stroke-width="1"/><circle cx="5" cy="-4" r="5.5" fill="none" stroke="#c9a46a" stroke-width="1"/>
    <path d="M-2 1 L0 5 L2 1z" fill="#e8b84a"/>`,

  // ---------- Crystal Grotto ----------
  crystalmite: () => `
    <g stroke="#5a4a8a" stroke-width="1.4"><line x1="-6" y1="3" x2="-11" y2="8"/><line x1="0" y1="4" x2="0" y2="9"/><line x1="6" y1="3" x2="11" y2="8"/></g>
    <ellipse cx="0" cy="2" rx="9" ry="5" fill="#4a3d7a"/>
    <path d="M-6 0 L-3 -10 L0 -2 L3 -12 L6 0z" fill="#c9b6ff" stroke="#f3eaff" stroke-width=".8"/>
    <circle cx="10" cy="2" r="3.5" fill="#4a3d7a"/><circle cx="11" cy="1" r="1" fill="#e6dcff"/>`,

  glimmerbat: () => `
    <path class="wing" d="M-2 0 Q-10 -12 -22 -4 Q-16 -2 -16 4 Q-10 0 -8 6 Q-5 2 -2 4z" fill="#5a3f9a"/>
    <path class="wing w2" d="M2 0 Q10 -12 22 -4 Q16 -2 16 4 Q10 0 8 6 Q5 2 2 4z" fill="#5a3f9a"/>
    <ellipse cx="0" cy="2" rx="5" ry="7" fill="#3f2a72"/>
    <path d="M-4 -4 l-1 -5 l3 3z M4 -4 l1 -5 l-3 3z" fill="#3f2a72"/>
    ${eyes(-2, 2, 0, 1.2, '#d6c8ff')}`,

  prismpixie: () => `
    <path class="wing" d="M-2 -4 L-16 -14 L-12 4z" fill="#8fd8ff" opacity=".7"/>
    <path class="wing w2" d="M2 -4 L16 -14 L12 4z" fill="#ffb3e6" opacity=".7"/>
    <path d="M-6 12 L0 -2 L6 12 Z" fill="#c9b6ff"/>
    <circle cx="0" cy="-7" r="5" fill="#f3eaff"/>
    <path d="M-5 -9 L0 -16 L5 -9z" fill="#9dffb0"/>
    ${eyes(-1.8, 1.8, -7, 0.9)}`,

  geodegolem: () => `
    <rect x="-14" y="-6" width="28" height="24" rx="7" fill="#7a7488"/>
    <rect x="-20" y="-2" width="7" height="16" rx="3" fill="#6a6478"/><rect x="13" y="-2" width="7" height="16" rx="3" fill="#6a6478"/>
    <rect x="-9" y="-18" width="18" height="14" rx="5" fill="#857f94"/>
    <g fill="#b79cff"><path d="M-12 -6 l3 -8 l3 8z"/><path d="M4 -6 l4 -10 l3 10z"/><path d="M-3 6 l3 -7 l3 7z"/></g>
    <circle class="glowdot" cx="-4" cy="-11" r="2" fill="#d6c8ff"/><circle class="glowdot" cx="4" cy="-11" r="2" fill="#d6c8ff"/>
    <rect x="-12" y="18" width="9" height="6" rx="2" fill="#6a6478"/><rect x="3" y="18" width="9" height="6" rx="2" fill="#6a6478"/>`,

  echowyrm: () => `
    ${[[-24, 3.5], [-18, 4.5], [-12, 5.5], [-6, 6.5], [0, 7]].map(([x, r], i) => `<circle class="seg" cx="${x}" cy="0" r="${r}" fill="${i % 2 ? '#b79cff' : '#9a7ff0'}" style="animation-delay:${-i * 0.15}s"/>`).join('')}
    <ellipse cx="9" cy="-1" rx="8" ry="6" fill="#c9b6ff"/>
    <path d="M6 -6 l-2 -6 l4 4z M11 -6 l1 -6 l2 5z" fill="#e6dcff"/>
    <circle cx="11" cy="-2" r="1.5" fill="#1b1030"/>
    <path class="note" d="M18 -4 q4 -3 8 0 M19 0 q5 -2 9 1" stroke="#e6dcff" stroke-width="1" fill="none"/>`,

  // ---------- Starfall Meadow ----------
  dandelionwisp: () => `
    <circle class="glowdot" r="12" fill="#fffbe0" opacity=".25"/>
    <g stroke="#fffbe8" stroke-width="1">${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<line x1="0" y1="0" x2="${(Math.cos(a) * 10).toFixed(1)}" y2="${(Math.sin(a) * 10).toFixed(1)}"/>`; }).join('')}</g>
    <circle r="2.5" fill="#fff6c8"/>
    <line x1="0" y1="2" x2="0" y2="12" stroke="#d8e8c0" stroke-width="1"/>`,

  starhare: () => `
    <ellipse cx="0" cy="6" rx="13" ry="9" fill="#f2f0ff"/>
    <circle cx="10" cy="-3" r="6.5" fill="#f2f0ff"/>
    <ellipse cx="8" cy="-15" rx="2.5" ry="8" fill="#f2f0ff" transform="rotate(-12 8 -15)"/>
    <ellipse cx="13" cy="-15" rx="2.5" ry="8" fill="#e6e2ff" transform="rotate(12 13 -15)"/>
    <circle cx="12" cy="-4" r="1.4" fill="#1b1030"/>
    <path d="M-4 2 l1.5 3 l3.3 .4 l-2.4 2.3 l.6 3.3 l-3 -1.6 l-3 1.6 l.6 -3.3 l-2.4 -2.3 l3.3 -.4z" fill="#fff0a0"/>
    <circle cx="-13" cy="4" r="3" fill="#fff"/>`,

  cometmoth: () => `
    <path d="M-4 0 L-34 -6 L-34 6 Z" fill="#fff0a0" opacity=".35"/>
    <ellipse class="wing" cx="-3" cy="-7" rx="10" ry="6" fill="#ffd27a" opacity=".85" transform="rotate(-30 -3 -7)"/>
    <ellipse class="wing w2" cx="-3" cy="7" rx="10" ry="6" fill="#ffd27a" opacity=".85" transform="rotate(30 -3 7)"/>
    <ellipse cx="0" cy="0" rx="9" ry="3" fill="#fff6d0"/>
    <circle class="glowdot" cx="8" cy="0" r="3" fill="#fffbe8"/>`,

  wishweaver: () => `
    <path d="M-11 16 Q-10 -2 0 -6 Q10 -2 11 16 Z" fill="#6a5acd"/>
    <circle cx="0" cy="-10" r="6" fill="#ffe3cf"/>
    <path d="M-7 -11 Q0 -22 7 -11 Q0 -15 -7 -11z" fill="#3a2f8a"/>
    ${eyes(-2.2, 2.2, -10, 1)}
    <circle class="glowdot" cx="10" cy="6" r="5" fill="#fff0a0"/>
    <path d="M10 6 Q18 -4 24 4 T36 0" stroke="#fff0a0" stroke-width="1" fill="none" opacity=".8"/>
    <g fill="#fff0a0"><circle cx="-8" cy="2" r=".9"/><circle cx="-4" cy="10" r=".9"/><circle cx="5" cy="12" r=".9"/></g>`,

  moonfairy: () => `
    <circle class="glowdot" r="16" fill="#e6e2ff" opacity=".2"/>
    ${wingPair('#e6f0ff', 10, 6, -6, 0.7)}
    <path d="M-7 14 L0 -2 L7 14 Z" fill="#dfe3ff"/>
    <circle cx="0" cy="-7" r="5.5" fill="#ffe8d8"/>
    <path d="M-6 -8 q6 -10 12 0 q-6 -4 -12 0z" fill="#f4f1ea"/>
    ${eyes(-2, 2, -6, 0.9)}
    <line x1="6" y1="0" x2="14" y2="-12" stroke="#c9c2e0" stroke-width="1.5"/>
    <path d="M14 -20 a5 5 0 1 0 4 8 a4 4 0 1 1 -4 -8z" fill="#fff6c8"/>`,
};

// Where each helper lives and how it moves.
// zone = [x1, y1, x2, y2] in scene coordinates; scale = drawing size.
export const HELPER_VIS = {
  firefly:     { anim: 'flit',   zone: [200, 260, 800, 470], scale: 1.0, color: '#fff3a0' },
  watersprite: { anim: 'skip',   zone: [250, 480, 720, 580], scale: 1.3, color: '#8fd8ff' },
  lilypixie:   { anim: 'bob',    zone: [260, 470, 760, 590], scale: 1.4, color: '#ffb3e0' },
  frogbard:    { anim: 'hop',    zone: [200, 600, 800, 660], scale: 1.5, color: '#9dffb0' },
  mothweaver:  { anim: 'glide',  zone: [220, 170, 780, 380], scale: 1.5, color: '#d6c8ff' },

  beetle:      { anim: 'crawl',  zone: [200, 600, 780, 660], scale: 1.3, color: '#b8ff8a' },
  snail:       { anim: 'crawl',  zone: [200, 610, 780, 665], scale: 1.4, color: '#c8a2ff', slow: true },
  toadtender:  { anim: 'hop',    zone: [220, 560, 780, 630], scale: 1.5, color: '#e6c36a' },
  gnome:       { anim: 'sway',   zone: [220, 550, 780, 630], scale: 1.5, color: '#ff9fb3' },
  lanternmoth: { anim: 'glide',  zone: [220, 180, 780, 380], scale: 1.4, color: '#ffc861' },

  acornsprite: { anim: 'flit',   zone: [300, 250, 700, 520], scale: 1.2, color: '#ffd27a' },
  sapsquirrel: { anim: 'climb',  zone: [430, 300, 570, 620], scale: 1.4, color: '#ffb54d' },
  woodpecker:  { anim: 'peck',   zone: [415, 260, 590, 560], scale: 1.4, color: '#ff8f7a' },
  dryad:       { anim: 'sway',   zone: [200, 590, 800, 650], scale: 1.6, color: '#9dffb0' },
  owlsage:     { anim: 'tilt',   zone: [220, 190, 780, 280], scale: 1.6, color: '#ffd98a' },

  crystalmite: { anim: 'crawl',  zone: [200, 610, 800, 660], scale: 1.3, color: '#c9b6ff' },
  glimmerbat:  { anim: 'zigzag', zone: [220, 170, 780, 380], scale: 1.4, color: '#b79cff' },
  prismpixie:  { anim: 'orbit',  zone: [300, 260, 700, 480], scale: 1.4, color: '#8fd8ff' },
  geodegolem:  { anim: 'sway',   zone: [200, 600, 800, 645], scale: 1.6, color: '#b79cff', slow: true },
  echowyrm:    { anim: 'slither',zone: [220, 200, 760, 420], scale: 1.6, color: '#e6dcff' },

  dandelionwisp: { anim: 'drift', zone: [200, 380, 800, 600], scale: 1.2, color: '#fffbe0' },
  starhare:    { anim: 'bound',  zone: [200, 600, 760, 660], scale: 1.5, color: '#fff0a0' },
  cometmoth:   { anim: 'glide',  zone: [220, 160, 780, 360], scale: 1.4, color: '#ffd27a' },
  wishweaver:  { anim: 'bob',    zone: [200, 560, 780, 630], scale: 1.6, color: '#c9b6ff' },
  moonfairy:   { anim: 'flit',   zone: [220, 220, 780, 460], scale: 1.6, color: '#e6e2ff' },
};

export const MAX_VISIBLE_PER_HELPER = 10;
