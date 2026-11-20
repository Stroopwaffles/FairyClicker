// Familiars: little animal companions for the player's fairy (purely cosmetic).
// Each has a drawing (viewBox -50 -50 100 100, sitting, facing the viewer),
// a chirp pitch for its voice, and personality lines for its speech bubbles.
// Which familiars are owned is tracked with the wardrobe (slot 'familiar' in COSTUMES).

const eyes = (x, y, gap = 13, r = 6, c = '#1b1030') => `
  <g class="pet-eyes"><circle cx="${x - gap}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x + gap}" cy="${y}" r="${r}" fill="${c}"/>
  <circle cx="${x - gap - r * 0.35}" cy="${y - r * 0.4}" r="${r * 0.38}" fill="#fff"/><circle cx="${x + gap - r * 0.35}" cy="${y - r * 0.4}" r="${r * 0.38}" fill="#fff"/></g>`;
const blush = (y, gap = 22, c = '#ff8fa3') => `<ellipse cx="${-gap}" cy="${y}" rx="6" ry="3.5" fill="${c}" opacity=".55"/><ellipse cx="${gap}" cy="${y}" rx="6" ry="3.5" fill="${c}" opacity=".55"/>`;
const smile = (y, c = '#6a3a3a') => `<path d="M-5 ${y} q5 5 10 0" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
const feet = (c, y = 40) => `<ellipse cx="-14" cy="${y}" rx="10" ry="6" fill="${c}"/><ellipse cx="14" cy="${y}" rx="10" ry="6" fill="${c}"/>`;

export const FAMILIARS = [
  {
    id: 'pet_bunny', name: 'Bunny', pitch: 1.3,
    draw: () => `
      <ellipse cx="-12" cy="-34" rx="8" ry="22" fill="#f4f1ea" transform="rotate(-10 -12 -34)"/><ellipse cx="12" cy="-34" rx="8" ry="22" fill="#f4f1ea" transform="rotate(10 12 -34)"/>
      <ellipse cx="-12" cy="-34" rx="4" ry="15" fill="#ffc8d8" transform="rotate(-10 -12 -34)"/><ellipse cx="12" cy="-34" rx="4" ry="15" fill="#ffc8d8" transform="rotate(10 12 -34)"/>
      <ellipse cx="0" cy="22" rx="28" ry="24" fill="#f4f1ea"/>${feet('#ffffff')}
      <circle cx="0" cy="-4" r="25" fill="#ffffff"/>${eyes(0, -6, 10, 5)}${blush(4, 17)}
      <path d="M-3 2 l3 3 l3 -3 z" fill="#ff8fa3"/>${smile(7)}`,
    lines: ['*wiggles nose*', 'Hop hop!', 'Is that a carrot? No? Oh well.', 'My ears hear everything!', 'Boing!'],
  },
  {
    id: 'pet_kitten', name: 'Kitten', pitch: 1.2,
    draw: () => `
      <path d="M26 30 Q46 20 40 0" stroke="#f4a860" stroke-width="7" fill="none" stroke-linecap="round" class="pet-tail"/>
      <ellipse cx="0" cy="22" rx="26" ry="22" fill="#f4a860"/>${feet('#ffd0a0')}
      <path d="M-24 -18 L-20 -42 L-4 -26 Z M24 -18 L20 -42 L4 -26 Z" fill="#f4a860"/><path d="M-20 -22 L-18 -35 L-9 -26 Z M20 -22 L18 -35 L9 -26 Z" fill="#ffc8d8"/>
      <circle cx="0" cy="-6" r="25" fill="#f4a860"/><path d="M-10 -28 l4 8 M0 -30 v9 M10 -28 l-4 8" stroke="#d8803a" stroke-width="3" stroke-linecap="round"/>
      ${eyes(0, -6, 10, 5.5, '#3a6a2a')}${blush(4, 17)}<path d="M-3 1 l3 3 l3 -3 z" fill="#ff8fa3"/>${smile(6)}
      <path d="M-14 2 h-12 M-14 6 l-11 3 M14 2 h12 M14 6 l11 3" stroke="#8a5a3a" stroke-width="1.2"/>`,
    lines: ['Mew!', '*purrs*', 'I could nap for a hundred years.', 'Something moved! …it was me.', 'Pet me. Now. Please.'],
  },
  {
    id: 'pet_hedgehog', name: 'Hedgehog', pitch: 1.0,
    draw: () => `
      <path d="M-34 20 L-40 4 L-30 -6 L-34 -22 L-20 -24 L-18 -40 L-4 -32 L4 -44 L12 -30 L24 -38 L26 -22 L40 -18 L34 -4 L42 8 L32 22 Z" fill="#8a6440"/>
      <ellipse cx="0" cy="18" rx="28" ry="22" fill="#a07a50"/>${feet('#d8b890')}
      <ellipse cx="0" cy="4" rx="22" ry="20" fill="#f0d8b0"/>${eyes(0, 0, 9, 4.5)}${blush(10, 15)}
      <circle cx="0" cy="8" r="3.5" fill="#3a2a1a"/>${smile(12)}
      <g fill="#c06bff"><path d="M18 -36 Q24 -48 30 -36 Z"/></g><rect x="23" y="-36" width="2" height="6" fill="#efe2c4"/>`,
    lines: ['Prickly, but friendly!', 'I found a mushroom! It found me first.', '*curls into a ball*', 'Spikes are just hugs with extra steps.'],
  },
  {
    id: 'pet_fox', name: 'Fox Kit', pitch: 1.1,
    draw: () => `
      <path d="M22 30 Q50 26 44 0 Q40 18 26 20 Z" fill="#e8783a" class="pet-tail"/><path d="M44 0 Q46 8 40 12 Q42 4 44 0 Z" fill="#fff"/>
      <ellipse cx="0" cy="22" rx="24" ry="22" fill="#e8783a"/><ellipse cx="0" cy="26" rx="13" ry="16" fill="#fff4e8"/>${feet('#3a2a1a')}
      <path d="M-26 -16 L-24 -44 L-6 -26 Z M26 -16 L24 -44 L6 -26 Z" fill="#e8783a"/><path d="M-22 -22 L-21 -36 L-11 -26 Z M22 -22 L21 -36 L11 -26 Z" fill="#3a2a1a"/>
      <path d="M-27 -10 Q-26 -32 0 -32 Q26 -32 27 -10 Q22 12 0 14 Q-22 12 -27 -10 Z" fill="#e8783a"/>
      <path d="M-22 -2 Q-12 2 0 14 Q12 2 22 -2 Q14 12 0 16 Q-14 12 -22 -2 Z" fill="#fff4e8"/>
      ${eyes(0, -8, 10, 5)}<circle cx="0" cy="6" r="3.5" fill="#1b1030"/>${blush(2, 17)}`,
    lines: ['Yip!', 'I definitely did not take that acorn.', 'Race you to the next upgrade!', 'Fox fact: we are the best.', '*sly grin*'],
  },
  {
    id: 'pet_axolotl', name: 'Axolotl', pitch: 1.4,
    draw: () => `
      <path d="M22 26 Q44 24 46 8 Q36 18 24 16 Z" fill="#ffb3d0" class="pet-tail"/>
      <ellipse cx="0" cy="20" rx="26" ry="20" fill="#ffc8dc"/>${feet('#ffb3d0', 36)}
      ${[-1, 1].map((s) => [[-6, 0], [0, 0], [6, 0]].map(([dy]) => `<path d="M${s * 26} ${-10 + dy} q${s * 14} -4 ${s * 20} ${-8 + dy}" stroke="#ff7aa8" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')).join('')}
      <ellipse cx="0" cy="-4" rx="28" ry="23" fill="#ffc8dc"/>${eyes(0, -6, 13, 4.5)}${blush(4, 18, '#ff6a9a')}
      <path d="M-8 6 q8 6 16 0" stroke="#a8326a" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
    lines: ['Blub!', 'Crystals are like shiny water.', 'I can regrow a tail. Can you?', '*happy wiggle*', 'Hehe, sparkly.'],
  },
  {
    id: 'pet_owlet', name: 'Owlet', pitch: 0.9,
    draw: () => `
      <ellipse cx="0" cy="12" rx="30" ry="34" fill="#a08060"/><ellipse cx="0" cy="20" rx="20" ry="22" fill="#e8d6b8"/>
      <path d="M-14 18 q4 4 8 0 M6 18 q4 4 8 0 M-6 28 q4 4 8 0" stroke="#c0a888" stroke-width="2" fill="none"/>
      <path d="M-28 -16 L-30 -36 L-14 -24 Z M28 -16 L30 -36 L14 -24 Z" fill="#a08060"/>${feet('#e8b84a', 44)}
      <circle cx="-12" cy="-8" r="12" fill="#fff6e0"/><circle cx="12" cy="-8" r="12" fill="#fff6e0"/>
      ${eyes(0, -8, 12, 7)}<path d="M-4 2 L0 9 L4 2 Z" fill="#e8b84a"/>
      <path d="M-22 -22 q10 -6 20 2 M22 -22 q-10 -6 -20 2" stroke="#7a5a3a" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    lines: ['Hoo! Hoo!', 'A wise fairy saves a few Moonstones.', 'Stars are just very far-away lanterns.', 'I read that in a book. A big one.', '*blinks slowly*'],
  },
  {
    id: 'pet_bat', name: 'Bat Pup', pitch: 1.5,
    draw: () => `
      <path d="M-16 6 Q-36 -14 -50 -2 Q-42 2 -42 10 Q-34 6 -30 14 Q-24 8 -16 16 Z" fill="#4a3a6a" class="pet-wing"/>
      <path d="M16 6 Q36 -14 50 -2 Q42 2 42 10 Q34 6 30 14 Q24 8 16 16 Z" fill="#4a3a6a" class="pet-wing r"/>
      <ellipse cx="0" cy="18" rx="22" ry="22" fill="#5a4a7a"/>${feet('#3a2a5a', 38)}
      <path d="M-20 -12 L-24 -40 L-6 -24 Z M20 -12 L24 -40 L6 -24 Z" fill="#5a4a7a"/><path d="M-18 -18 L-20 -33 L-10 -24 Z M18 -18 L20 -33 L10 -24 Z" fill="#ff9fb3"/>
      <circle cx="0" cy="-4" r="22" fill="#5a4a7a"/>${eyes(0, -6, 9, 5.5, '#ff4a6a')}${blush(4, 15)}
      <path d="M-5 6 q5 4 10 0" stroke="#2a1a3a" stroke-width="2" fill="none"/><path d="M-3 7 l1 3 l1 -3 M1 7 l1 3 l1 -3" fill="#fff" stroke="#fff" stroke-width=".8"/>`,
    lines: ['Squeak!', 'I like it upside down.', 'Dracula is actually very nice. Mostly.', '*flaps excitedly*', 'Night time is the best time!'],
  },
  {
    id: 'pet_mouse', name: 'Clockwork Mouse', pitch: 1.6,
    draw: () => `
      <path d="M22 30 Q46 34 44 14" stroke="#c9a46a" stroke-width="3" fill="none" class="pet-tail"/>
      <ellipse cx="0" cy="22" rx="24" ry="20" fill="#b8b0c0"/>${feet('#ffc8d8', 38)}
      <circle cx="-22" cy="-22" r="14" fill="#b8b0c0"/><circle cx="22" cy="-22" r="14" fill="#b8b0c0"/>
      <circle cx="-22" cy="-22" r="8" fill="#ffc8d8"/><circle cx="22" cy="-22" r="8" fill="#ffc8d8"/>
      <circle cx="0" cy="-4" r="22" fill="#c8c0d0"/>${eyes(0, -6, 9, 5)}${blush(4, 15)}
      <circle cx="0" cy="4" r="3" fill="#ff8fa3"/><path d="M-8 4 h-12 M8 4 h12" stroke="#7a7088" stroke-width="1.2"/>
      <g transform="translate(0 24)"><circle r="8" fill="#d9a530"/><rect x="-1.5" y="-14" width="3" height="8" fill="#d9a530"/><rect x="-6" y="-16" width="12" height="3" rx="1.5" fill="#d9a530" class="key"/></g>`,
    lines: ['Tick-tock! Squeak!', 'Wind me up and watch me go!', 'Every second counts. I counted them.', '*whirrs happily*', 'Cuckoo! …no wait, that is the bird.'],
  },
  {
    id: 'pet_otter', name: 'Otter', pitch: 1.0,
    draw: () => `
      <path d="M20 32 Q44 34 42 16 Q34 26 22 24 Z" fill="#8a5a3a" class="pet-tail"/>
      <ellipse cx="0" cy="18" rx="26" ry="26" fill="#9a6a44"/><ellipse cx="0" cy="22" rx="17" ry="18" fill="#e8c8a0"/>${feet('#7a4a2a', 42)}
      <circle cx="-20" cy="-18" r="7" fill="#9a6a44"/><circle cx="20" cy="-18" r="7" fill="#9a6a44"/>
      <circle cx="0" cy="-6" r="24" fill="#9a6a44"/><ellipse cx="0" cy="4" rx="14" ry="10" fill="#e8c8a0"/>
      ${eyes(0, -10, 10, 5)}<ellipse cx="0" cy="0" rx="4.5" ry="3.5" fill="#3a2a1a"/>${smile(5, '#3a2a1a')}
      <path d="M-12 2 h-10 M12 2 h10" stroke="#5a3a1a" stroke-width="1.2"/>
      <g transform="translate(0 20)"><path d="M-10 4 Q0 -10 10 4 Z" fill="#ffb3d0" stroke="#e07aa8" stroke-width="1.5"/></g>`,
    lines: ['Splish splash!', 'I keep my favourite shell in my pocket.', 'Let us float for a bit…', '*holds your hand so you do not drift*', 'Pearls! Pearls everywhere!'],
  },
  {
    id: 'pet_lamb', name: 'Cloud Lamb', pitch: 1.25,
    draw: () => `
      ${feet('#6a6070', 42)}
      <g fill="#ffffff" stroke="#dde4f4" stroke-width="2">${[[-20, 20], [0, 26], [20, 20], [-24, 2], [24, 2], [-12, -14], [12, -14], [0, 6]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="16"/>`).join('')}</g>
      <ellipse cx="-22" cy="-6" rx="9" ry="5" fill="#8a8094" transform="rotate(-25 -22 -6)"/><ellipse cx="22" cy="-6" rx="9" ry="5" fill="#8a8094" transform="rotate(25 22 -6)"/>
      <ellipse cx="0" cy="0" rx="17" ry="19" fill="#8a8094"/>${eyes(0, -2, 7, 4.5)}${blush(8, 12)}
      <path d="M-3 8 l3 3 l3 -3" stroke="#3a3048" stroke-width="2" fill="none"/>
      <g fill="#fff"><circle cx="-6" cy="-20" r="7"/><circle cx="6" cy="-20" r="7"/><circle cx="0" cy="-24" r="7"/></g>`,
    lines: ['Baa-utiful day!', 'I am 90% cloud.', 'Sunbeams make my wool extra fluffy.', '*bounces softly*', 'Want to count me? I make you sleepy.'],
  },
  {
    id: 'pet_dragon', name: 'Dragon Hatchling', pitch: 0.85,
    draw: () => `
      <path d="M22 28 Q46 30 40 8 L48 4 L38 0 Q38 18 22 20 Z" fill="#5ac08a" class="pet-tail"/>
      <path d="M-18 0 Q-40 -20 -46 0 Q-36 0 -34 10 Z" fill="#8ae0b0" class="pet-wing"/><path d="M18 0 Q40 -20 46 0 Q36 0 34 10 Z" fill="#8ae0b0" class="pet-wing r"/>
      <ellipse cx="0" cy="20" rx="24" ry="22" fill="#5ac08a"/><ellipse cx="0" cy="24" rx="14" ry="16" fill="#fff0b8"/>
      <path d="M-8 14 h16 M-9 22 h18 M-8 30 h16" stroke="#e8d088" stroke-width="2"/>${feet('#4aa874', 40)}
      <path d="M-14 -26 L-18 -42 L-6 -30 Z M14 -26 L18 -42 L6 -30 Z" fill="#fff0b8"/>
      <ellipse cx="0" cy="-8" rx="25" ry="22" fill="#5ac08a"/>${eyes(0, -10, 10, 6, '#3a2a6a')}${blush(2, 17)}
      <circle cx="-5" cy="3" r="1.6" fill="#2a6a4a"/><circle cx="5" cy="3" r="1.6" fill="#2a6a4a"/>${smile(7, '#2a6a4a')}
      <g fill="#e8783a"><path d="M-6 -30 l6 -8 l6 8 z"/></g>`,
    lines: ['Rawr! (That was very scary.)', 'One day I will be ENORMOUS.', '*tiny smoke puff*', 'I am guarding your treasure. All of it.', 'Dragons love Moonstones. It is known.'],
  },
  {
    id: 'pet_foal', name: 'Moon Foal', pitch: 1.05,
    draw: () => `
      <path d="M20 10 Q40 12 36 34 Q32 22 22 22 Z" fill="#c9b6ff" class="pet-tail"/>
      <ellipse cx="0" cy="22" rx="24" ry="20" fill="#f4f1ff"/>${feet('#c9b6ff', 40)}
      <path d="M-14 -24 L-16 -36 L-6 -28 Z M14 -24 L16 -36 L6 -28 Z" fill="#f4f1ff"/>
      <path d="M0 -26 L-4 -48 L4 -48 Z" fill="#fff0a0" stroke="#e8c84a" stroke-width="1.5"/>
      <path d="M-12 -26 Q-30 -14 -22 10 Q-16 -6 -8 -18 Z" fill="#c9b6ff"/>
      <ellipse cx="0" cy="-6" rx="22" ry="22" fill="#f4f1ff"/>${eyes(0, -8, 9, 6, '#5a3aa8')}${blush(4, 15)}
      <ellipse cx="0" cy="8" rx="9" ry="6" fill="#ffe0f0"/><circle cx="-3" cy="8" r="1.4" fill="#a87ab8"/><circle cx="3" cy="8" r="1.4" fill="#a87ab8"/>
      <path d="M8 -20 a6 6 0 1 0 4 10 a4.5 4.5 0 1 1 -4 -10 z" fill="#fff6c8"/>`,
    annoyed: ['Hmph! Unicorns need dignity.', 'Please… no more boops.'],
    lines: ['Neigh~!', 'The full moon is my favourite.', '*sparkly prance*', 'You restored the whole realm. You are amazing!', 'Moonbeams taste like vanilla.'],
  },
  {
    // Unlocked by recruiting 50 Mycel Gnomes. Not the brightest mushroom in the ring.
    id: 'pet_gnome', name: 'Conspiracy Gnome', pitch: 0.7, explodes: true,
    draw: () => `
      <ellipse cx="-12" cy="44" rx="11" ry="6" fill="#5a3418"/><ellipse cx="12" cy="44" rx="11" ry="6" fill="#5a3418"/>
      <ellipse cx="0" cy="22" rx="34" ry="26" fill="#3a6fd0"/><rect x="-34" y="26" width="68" height="7" fill="#5a3418"/><rect x="-6" y="25" width="12" height="9" rx="2" fill="#e8c24a"/>
      <circle cx="-34" cy="16" r="9" fill="#ffd8bf"/><circle cx="34" cy="16" r="9" fill="#ffd8bf"/>
      <circle cx="0" cy="-8" r="22" fill="#ffd8bf"/>
      <path d="M-22 -4 Q-26 34 0 30 Q26 34 22 -4 Q14 8 0 6 Q-14 8 -22 -4 Z" fill="#f4f1ea"/>
      <path d="M-24 -14 L0 -56 L24 -14 Z" fill="#d83a4a"/>
      <path d="M-25 -14 L25 -14 L22 -20 L-22 -20 Z" fill="#c8ccd8" stroke="#9aa0b4" stroke-width="1"/>
      <path d="M-18 -18 l4 -2 l3 2 l4 -2 l3 2 l4 -2 l3 2 l4 -2 l3 2" stroke="#e8ecf4" stroke-width="1" fill="none"/>
      <g class="pet-eyes"><circle cx="-9" cy="-8" r="6.5" fill="#fff"/><circle cx="9" cy="-8" r="4.5" fill="#fff"/>
        <circle cx="-6" cy="-7" r="3" fill="#1b1030"/><circle cx="7" cy="-6" r="2.3" fill="#1b1030"/></g>
      <ellipse cx="0" cy="2" rx="7" ry="6" fill="#f4a08a"/>${blush(-1, 16)}
      <path d="M-5 13 q5 3 10 -1" stroke="#8a5a4a" stroke-width="2" fill="none"/>`,
    lines: [
      'The moon isn’t real. It’s a lantern the owls hung up to spy on us.',
      'Wake up! Fireflies don’t glow naturally. Big Toadstool puts it in the dew.',
      'Who’s minting all these Moonstones, hmm? HMM?',
      'Prestige is a hoax to reset our hard-earned spores. Think about it.',
      'The mermaid is a government plant. Well, seaweed. Same thing.',
      'Abolish the Toadstool Throne! No crowns without caps!',
      'Back in my day, helpers worked for free and we LIKED it.',
      'Sap Squirrels pay zero acorns in tax. Zero! Look it up.',
      'Pearls are just fish teeth. Do your own research.',
      'I did my own research. I read half a leaf.',
      'Cloud whales are drones. Ever seen a baby one? Exactly.',
      'Dracula is the only honest politician left in this realm.',
      'If the world is round, why do my mushrooms grow flat? Checkmate.',
      'Achievements are how they track you. I have zero. On purpose.',
      'The Owl Council meets in secret. On Tuesdays. Probably.',
      'Gates? Portals? Nah. It’s all done with mirrors and glitter.',
      'Vote gnome! Free hats for everyone! (Hats not included.)',
      'The pond is only wet because THEY want you to think it’s wet.',
    ],
    annoyed: ['Hey! Personal space! It’s in the Forest Constitution!', 'You’re one of THEM, aren’t you?', 'I know my rights!', 'This is exactly what Big Toadstool wants!'],
  },
];
// More personality lines and grumpy lines, merged into each familiar above.
const MORE = {
  pet_bunny: {
    lines: ['I hid a snack under that mushroom. Do not look.', 'Your wings are so shiny today!', 'Thump thump! That means I love you.', 'Can we go to the meadow? The grass there is extra crunchy.',
      'I counted all the stars. Then I forgot. Then I counted again.', 'Ears up! Something exciting is coming!', 'Binky time! *spins in the air*'],
    annoyed: ['My ears are getting tangled!', 'Thump! THUMP! (That means stop.)', 'Bunnies need personal space too!', 'I’m about to hop away…'],
  },
  pet_kitten: {
    lines: ['I knocked a dewdrop off the lily pad. On purpose.', 'If I fits, I sits.', 'That firefly is mocking me.', 'Wake me when something shiny happens.',
      'I would help gather, but I am busy being adorable.', '*stretches dramatically*', 'You may pet me exactly three times.'],
    annoyed: ['*swishes tail angrily*', 'That was four times. I said three.', 'Hssss! …sorry. But really.', 'I will knock something over. I swear it.'],
  },
  pet_hedgehog: {
    lines: ['I rolled down a hill! It was great!', 'Snuffle snuffle… found a beetle. He said hi.', 'I am small but mighty. Mostly small.', 'Do you think the toadstool is comfy? I do.',
      'I keep my best leaf on my back. Look!', 'Night walks are my favourite walks.', 'Hug me gently. Very gently.'],
    annoyed: ['Ow! Ow! Prickles go both ways!', '*puffs up spikes*', 'Hedgehogs need naps, not pokes!', 'Curling up in three… two…'],
  },
  pet_fox: {
    lines: ['Let us take a shortcut. I know a secret path!', 'That squirrel owes me three acorns.', 'Shh… I am sneaking. Am I sneaking well?', 'I could totally outrun a star hare. Probably.',
      'Who, me? I was just sitting here innocently.', 'Ooh, is that Amber Sap? Sticky and sweet!', 'A clever fox always has a plan. I have four.'],
    annoyed: ['Hey! Paws off the tail!', 'I will remember this, you know.', 'You are lucky I like you.', 'Okay, okay, I yield! Stop!'],
  },
  pet_axolotl: {
    lines: ['Blub blub! That means hello.', 'I am smiling all the time. It is my face.', 'The crystals sing if you are very quiet.', 'Do you ever just… float?',
      'I like it cool and dark and sparkly.', 'My frills are wiggly. Look! Wiggle wiggle.', 'Water is my best friend. You are second.'],
    annoyed: ['Blub! Too many boops!', 'My frills are getting frazzled!', 'I am going to hide under a rock…', 'Even my smile is tired now.'],
  },
  pet_owlet: {
    lines: ['Did you know? Moonlight is just sunlight on its night shift.', 'Patience, young fairy. The helpers will gather.', 'Who? Who? …oh, sorry, force of habit.', 'Every upgrade is a lesson.',
      'I have read every book in the Treehouse Library. Twice.', 'A balanced realm is a happy realm.', 'My eyes are big because the night is big.'],
    annoyed: ['Pecking order, please!', 'Wise owls do not enjoy poking.', 'I will need to consult the Owl Council about this.', 'Hoo! That is quite enough.'],
  },
  pet_bat: {
    lines: ['Bats are just mice with fancy capes!', 'I can hear the moon humming.', 'Upside down, everything looks like a smile.', 'The castle smells like old roses and drama.',
      'Eek! A moth! …oh, it’s just a Lantern Moth. Hi!', 'Night snacks are the best snacks.', 'I am cute AND spooky. Very rare.'],
    annoyed: ['Squeak squeak! (Rude!)', 'I am going to hang upside down and ignore you.', 'My ears are ringing!', 'Echo… echo… stop… stop…'],
  },
  pet_mouse: {
    lines: ['My key turns all by itself. Spooky, right?', 'I run on springs and cheese.', 'Tick… tick… squeak… tock…', 'If I stop moving, just give me a little wind.',
      'Gears are like friends. They work together!', 'I ate a cog once. Do not recommend.', 'Time flies when you are clicking!'],
    annoyed: ['My gears are getting wound up!', 'Overclocking! Overclocking!', '*springs boing everywhere*', 'Squeak! You will strip my threads!'],
  },
  pet_otter: {
    lines: ['Holding hands so we do not float away!', 'I found the shiniest rock. It is yours now.', 'Back floats are the best floats.', 'The mermaid taught me a song. It goes blub.',
      'Ooh, a clam! …I will not eat it. Promise.', 'Wet fur, warm heart!', 'Shall we go for a swim? You can borrow my pebble.'],
    annoyed: ['Splash! Okay, that was on purpose.', 'You are making my fur all ruffled!', 'I am going to go float somewhere quiet.', 'Even otters have limits!'],
  },
  pet_lamb: {
    lines: ['If you count me, you get sleepy. Try it!', 'I am made of the fluffiest cloud. Squish!', 'Raindrops tickle my wool.', 'Baa! That means I am happy.',
      'Let us lie down and watch the clouds. Wait, I am one.', 'Soft and sleepy… soft and sleepy…', 'Rainbows taste like candyfloss.'],
    annoyed: ['Baaa! Too much squishing!', 'I am getting all frizzy!', 'Even clouds can rain on you, you know.', 'I am drifting away… on purpose.'],
  },
  pet_dragon: {
    lines: ['Behold my mighty wings! They are small. But mighty.', 'I will guard your Moonstones with my life.', 'I sneezed and a tiny flame came out. Did you see?', 'When I grow up I will be as big as the Ancient Oak.',
      'Treasure! Where? Oh. It’s you. You are treasure.', 'Dragons do not nap. We… plan with our eyes closed.', 'Fear me! …or pet me. Either is fine.'],
    annoyed: ['RAWR! (That was a warning rawr.)', '*very small smoke puff of anger*', 'You dare poke a dragon?!', 'I am getting… heated.'],
  },
  pet_foal: {
    lines: ['Every step I take leaves a little stardust.', 'The full moon sings to me. It is very off-key.', 'Make a wish on my horn! (No refunds.)', 'Gallop with me through the meadow!',
      'I am made of moonbeams and good manners.', 'You restored the realm. I knew you could!', 'Sparkle sparkle! That is just me existing.'],
    annoyed: ['My mane! You are messing up my mane!', 'Moon foals deserve gentle boops only.'],
  },
  pet_gnome: {
    lines: ['Helpers? More like spies. Every single one of them.', 'Why do you think the Grotto is so sparkly? Cover-up.', 'Echoes are just the cave repeating THEIR talking points.',
      'They call it a Golden Lotus. I call it surveillance.', 'Cuckoo clock? Yeah. That’s what they WANT you to call it.', 'My hat is lined for a reason. You’ll see.',
      'Unspent Moonstones? That’s how they keep you complacent.', 'I run for Mushroom Mayor every year. The polls are rigged.'],
    annoyed: ['Is this a citizen’s arrest? I know my mushroom rights!', 'You just proved my theory. Thanks.'],
  },
};
for (const f of FAMILIARS) {
  const m = MORE[f.id];
  if (!m) continue;
  f.lines = [...f.lines, ...m.lines];
  f.annoyed = [...(f.annoyed || []), ...m.annoyed];
}

export const FAMILIAR_BY_ID = Object.fromEntries(FAMILIARS.map((f) => [f.id, f]));

// Where accessories sit on each familiar: top of head, neck, eye line and eye gap.
const ANCHOR = {
  pet_bunny: { top: -27, neck: 19, eyes: -6, gap: 10 },   pet_kitten: { top: -30, neck: 16, eyes: -6, gap: 10 },
  pet_hedgehog: { top: -36, neck: 22, eyes: 0, gap: 9 },  pet_fox: { top: -31, neck: 14, eyes: -8, gap: 10 },
  pet_axolotl: { top: -26, neck: 18, eyes: -6, gap: 13 }, pet_owlet: { top: -24, neck: 8, eyes: -8, gap: 12 },
  pet_bat: { top: -26, neck: 16, eyes: -6, gap: 9 },      pet_mouse: { top: -26, neck: 16, eyes: -6, gap: 9 },
  pet_otter: { top: -29, neck: 18, eyes: -10, gap: 10 },  pet_lamb: { top: -28, neck: 18, eyes: -2, gap: 7 },
  pet_dragon: { top: -30, neck: 13, eyes: -10, gap: 10 }, pet_foal: { top: -28, neck: 16, eyes: -8, gap: 9, side: true },
  pet_gnome: { top: -46, neck: 30, eyes: -8, gap: 9 },
};

// Accessory drawings (positioned with an anchor). Unlocks live with the wardrobe (slot 'petacc').
export const PET_ACCESSORIES = {
  none_acc: () => '',
  bow_tie: (a) => `<g transform="translate(0 ${a.neck})"><path d="M0 0 L-11 -7 L-11 7 Z M0 0 L11 -7 L11 7 Z" fill="#d83a4a"/><circle r="3.5" fill="#a8283a"/></g>`,
  bandana: (a) => `<g transform="translate(0 ${a.neck - 3})"><path d="M-17 -2 Q0 4 17 -2 L0 13 Z" fill="#3a8ad8"/><g fill="#fff"><circle cx="-6" cy="2" r="1.4"/><circle cx="5" cy="3" r="1.4"/><circle cx="0" cy="8" r="1.2"/></g></g>`,
  party_hat: (a) => `<g transform="translate(${a.side ? 10 : 0} ${a.top + 2}) rotate(${a.side ? 15 : -8})"><path d="M-10 0 L0 -26 L10 0 Z" fill="#ff7fbf"/><path d="M-6 -8 L6 -8 M-3 -16 L3 -16" stroke="#ffe27a" stroke-width="2.5"/><circle cy="-27" r="3.5" fill="#ffe27a"/></g>`,
  flower_crown: (a) => `<g transform="translate(0 ${a.top + 3})"><path d="M-18 0 Q0 -6 18 0" stroke="#3f8f5e" stroke-width="3" fill="none"/>${[-14, -5, 5, 14].map((x, i) =>
    `<g transform="translate(${x} ${i % 3 ? -4 : -2})">${[0, 72, 144, 216, 288].map((r) => `<circle r="2.4" cy="-2.6" fill="${['#ff9fcf', '#ffe27a', '#c9a7ff', '#8fd8ff'][i]}" transform="rotate(${r})"/>`).join('')}<circle r="1.4" fill="#fff"/></g>`).join('')}</g>`,
  bell_collar: (a) => `<g transform="translate(0 ${a.neck})"><path d="M-16 -3 Q0 4 16 -3" stroke="#c06bff" stroke-width="4" fill="none"/><circle cy="4" r="5" fill="#ffd24d" stroke="#d9a520"/><path d="M-2 5 h4" stroke="#8a6a1a" stroke-width="1.5"/></g>`,
  acorn_hat: (a) => `<g transform="translate(${a.side ? 10 : 0} ${a.top + 3})"><path d="M-13 0 Q-12 -14 0 -15 Q12 -14 13 0 Q0 -3 -13 0 Z" fill="#8a5d34"/><path d="M-10 -5 h20 M-8 -10 h16" stroke="#6b4423" stroke-width="1.5"/><rect x="-1.5" y="-21" width="3" height="7" rx="1.5" fill="#6b4423"/></g>`,
  mini_tiara: (a) => `<g transform="translate(0 ${a.top + 3})"><path d="M-12 0 Q0 -4 12 0" stroke="#d6c8ff" stroke-width="2.5" fill="none"/><path d="M-3 -2 L0 -14 L3 -2 Z" fill="#b79cff" stroke="#f3eaff" stroke-width=".8"/><path d="M-9 -1 l2 -7 l2 7 Z M5 -1 l2 -7 l2 7 Z" fill="#8fd8ff"/></g>`,
  star_shades: (a) => `<g transform="translate(0 ${a.eyes})">${[-a.gap, a.gap].map((x) => `<path transform="translate(${x} 0)" d="M0 -8 L2.3 -2.5 L8 -2.5 L3.5 1.2 L5 7 L0 3.6 L-5 7 L-3.5 1.2 L-8 -2.5 L-2.3 -2.5 Z" fill="#2a2a4a" stroke="#ffd24d" stroke-width="1.4"/>`).join('')}<path d="M${-a.gap + 7} -1 H${a.gap - 7}" stroke="#ffd24d" stroke-width="1.6"/></g>`,
  vampire_collar: (a) => `<g transform="translate(0 ${a.neck - 2})"><path d="M-18 -6 L-14 8 L0 2 L14 8 L18 -6 L0 0 Z" fill="#1a0610"/><path d="M-14 -4 L-11 5 L0 1 L11 5 L14 -4 L0 1 Z" fill="#a0142e"/><circle cy="3" r="2.5" fill="#ff4a5a"/></g>`,
  top_hat: (a) => `<g transform="translate(${a.side ? 10 : 0} ${a.top + 2}) rotate(${a.side ? 12 : -6})"><rect x="-14" y="-3" width="28" height="4" rx="2" fill="#2a1a2a"/><rect x="-9" y="-20" width="18" height="18" rx="2" fill="#2a1a2a"/><rect x="-9" y="-8" width="18" height="3.5" fill="#d9a530"/></g>`,
  pearl_necklace: (a) => `<g transform="translate(0 ${a.neck - 2})">${Array.from({ length: 9 }, (_, i) => { const t = (i / 8) * Math.PI; return `<circle cx="${(-Math.cos(t) * 15).toFixed(1)}" cy="${(Math.sin(t) * 6).toFixed(1)}" r="2.6" fill="#f4f8ff" stroke="#c8d4f0" stroke-width=".6"/>`; }).join('')}</g>`,
  rainbow_scarf: (a) => `<g transform="translate(0 ${a.neck - 2})">${['#ff8a9a', '#ffe27a', '#8fd8ff'].map((c, i) => `<path d="M-17 ${-4 + i * 3} Q0 ${2 + i * 3} 17 ${-4 + i * 3}" stroke="${c}" stroke-width="3" fill="none"/>`).join('')}<path d="M8 2 l4 14 l-5 0 z" fill="#b79cff"/></g>`,
  tiny_glove: (a) => `<g transform="translate(14 ${a.neck + 2}) rotate(20)"><rect x="-5" y="-12" width="10" height="14" rx="4" fill="#ffd24d" stroke="#d9a520"/><rect x="-1.5" y="-20" width="4" height="10" rx="2" fill="#ffd24d" stroke="#d9a520"/></g>`,
  tinfoil_hat: (a) => `<g transform="translate(${a.side ? 10 : 0} ${a.top + 2})"><path d="M-13 0 L-3 -22 L2 -14 L6 -24 L13 0 Z" fill="#c8ccd8" stroke="#9aa0b4" stroke-width="1.5"/><path d="M-8 -6 l5 -3 l3 4 l5 -5" stroke="#eef0f6" stroke-width="1.2" fill="none"/></g>`,
  propeller_cap: (a) => `<g transform="translate(${a.side ? 10 : 0} ${a.top + 3})"><path d="M-13 0 Q-12 -12 0 -12 Q12 -12 13 0 Z" fill="#3a6fd0"/><path d="M-13 0 Q0 -5 13 0" stroke="#ffd24d" stroke-width="2" fill="none"/>
    <rect x="-1" y="-17" width="2" height="6" fill="#555"/><g class="prop"><ellipse cx="-7" cy="-17" rx="7" ry="2" fill="#d83a4a"/><ellipse cx="7" cy="-17" rx="7" ry="2" fill="#ffd24d"/></g></g>`,
  pet_halo: (a) => `<g transform="translate(0 ${a.top - 8})"><ellipse rx="13" ry="3.5" fill="none" stroke="#fff3a0" stroke-width="3"/></g>`,
};

export function familiarSVG(id, cls = '', acc = 'none_acc') {
  const f = FAMILIAR_BY_ID[id];
  if (!f) return '';
  const draw = PET_ACCESSORIES[acc];
  const extra = draw && ANCHOR[id] ? draw(ANCHOR[id]) : '';
  return `<svg class="familiar ${cls}" viewBox="-52 -52 104 104" aria-hidden="true">${f.draw()}${extra}</svg>`;
}
