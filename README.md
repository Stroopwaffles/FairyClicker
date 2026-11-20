# Fairy Clicker

A moonlit fairy idle/clicker game. Tap each location to gather its resource, recruit helpers that keep gathering while you're away, and build features that change how each place looks.

Designed for tablets first, then desktop, then phones. It's plain HTML, CSS and JavaScript with no build step.

## Play

Once GitHub Pages is on, the game is at `https://stroopwaffles.github.io/FairyClicker/`.

To switch Pages on: in the repo go to **Settings → Pages**. Under **Build and deployment** choose **Deploy from a branch**, pick the branch (and `/ (root)`), then press **Save**. The site appears after a minute or two.

## Run locally

ES modules need a web server, so opening the HTML file directly won't work:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## What's in version 1

- Welcome screen with Continue / New Game and a "while you were away" summary
- **Moonlit Pond** (tap the pond for Dewdrops) and **Mushroom Ring** (tap the toadstool for Glowspores)
- 5 helpers per location; each one's output doubles at 25, 50, 100… owned
- One-time upgrades and 3–4 buildable features per location that appear in the scene
- Offline earnings for up to 8 hours (Reed Chimes add 2 more)
- Automatic saving, plus a save code you can copy to move progress between devices

### Version 1.1: sound

- All audio is generated in the browser with the Web Audio API, so there are no sound files
- A tap sound for each location, chimes for purchases, and fanfares for unlocks and milestones
- Ambience for each location: slowly changing chords and drifting bell notes, plus crickets and water at the pond, or drips and a low hum in the Mushroom Ring
- Mute button in the top bar; music and effects volume sliders in Settings (remembered on each device)

### Version 2: the full realm, events and achievements

- Three new locations, each with its own thing to tap, 5 helpers, 5 upgrades and 3 features:
  - **Ancient Oak:** tap the hollow for Amber Sap
  - **Crystal Grotto:** tap the crystals for Moonshards
  - **Starfall Meadow:** tap the fallen star for Stardust
- Later helpers, upgrades and features cost resources from other locations, so every place stays useful
- Random events every few minutes, each with a banner, a timer and its own look and sound: Moonrise Blessing, Gentle Rain, Spore Bloom, Meteor Shower (tap the shooting stars), Owl Council, Mischief Fog, and the Wandering Fairy (catch her and choose one of three gifts)
- New features change events: the Stone Bridge invites rain, the Wishing Stone makes events more frequent and longer, the Observatory shows the next event, and the Echo Chamber makes taps sometimes count twice
- 52 achievements, including a few secret ones, in a new Awards tab. Each one gives +1% to everything
- New tap sounds and ambience for each location, plus sounds for events and achievements
- Version 1 saves carry over automatically

### Version 3: prestige, the Moon Shrine and the finale

- **Begin a new night (prestige):** once the Starfall Meadow is open, reset the realm to earn **Moonstones**. The more you gathered this run, the more you get. Each unspent Moonstone adds +1% to everything
- **Moon Shrine:** 17 permanent upgrades in four paths (Tides for tapping, Kinship for helpers, Wayfinding for progress, Fate for events), plus a final capstone that appears after the 4th night. Highlights include hold-to-tap, starting helpers, and keeping places unlocked
- **Moon phases:** the moon in the top bar and on the title screen fills in with each night. It glows when a new night is worth starting
- **The finale:** on the 5th prestige the full moon rises over the restored realm, with its own music and a summary of your journey. Afterwards the game continues in **Endless Night**
- 8 new moon achievements (60 in total)
- **Balancing:** tuned with a pacing simulator so a casual player (about 80 minutes a day) reaches the finale in about 6 days, and each night runs faster than the last

### Version 3.1: living helpers and the Blood Moon

- **Every helper has its own look and movement.** Fireflies flit, frogs hop, snails crawl, squirrels climb the trunk, bats dart, the Echo Wyrm slithers and dandelion wisps drift upward. Each one you recruit appears in its place (up to 10 of each kind on screen)
- **Milestones are visible:** each helper card shows a progress bar to the next ×2 speed boost (25, 50, 100…). Hitting one flashes the card, plays a fanfare and gives those helpers a growing glow in the scene
- **Helper upgrades:** two per helper (50 in all), unlocked at 10 and 50 owned, shown with the helper's portrait in the Upgrades tab
- **Blood Moon:** a rare event. The moon turns red and you're drawn to the **Crimson Courtyard** of a vampire castle, where you tap a blood pool for Blood Drops to original gothic music (harpsichord, organ, pumping bass). When it sets, you choose which resource the drops become, at a generous rate
- Two new achievements for the Blood Moon

### Version 3.2: upbeat soundtrack

- **Music style setting** (⚙ → Sound): choose **Calm** (gentle ambience) or **Upbeat**, where every place has its own original looping song. It's remembered on each device
  - Moonlit Pond: bouncy marimba pop · Mushroom Ring: funky clavinet groove · Ancient Oak: a fiddle jig in 6/8 · Crystal Grotto: sparkly synth-pop · Starfall Meadow: uplifting chiptune
- The Blood Moon always plays its castle theme

### Version 3.3: the Workshop

A new **Workshop** tab of realm-wide upgrades (they reset when you prestige):

| Upgrade | Levels | Effect |
|---|---|---|
| ✋ Enchanted Hand | 10 | A magic hand follows you and taps what you tap, from 1 to 10 times a second |
| 🤲 Twin Hand | 1 | A second hand (needs Enchanted Hand level 5) |
| 🍀 Lucky Clover | 5 | 2–10% chance for a critical tap worth ×10 |
| 🔥 Tap Streak | 3 | Keep tapping to build a combo up to ×1.5 / ×2 / ×2.5 |
| 🧹 Helper Steward | 1 | Recruits helpers at the place you're viewing; switch on/off; can follow the Almanac |
| 📖 Fairy Almanac | 1 | Marks the best-value helper |
| 📯 Fairy Whistle | 10 | All helpers +10% per level |
| 🪷 Golden Lotus | 5 | A golden lotus drifts by now and then; tap it for a burst |
| 🧲 Star Magnet | 1 | Shooting stars are caught automatically |
| 🍷 Vampire's Chalice | 3 | Blood Drops worth more, and more per tap |
| 🔔 Fairy Bell | 1 | The fairy stays twice as long and offers a 4th gift (Moonbeam Blessing) |
| 🏮 Moon Lantern | 3 | Longer offline earnings and a summary by place |

During the Blood Moon, **Dracula** now peers out of the castle windows. Tap him before he vanishes for a big burst of Blood Drops. Five new achievements go with these.

### Version 3.4: the Gate Room

- **🌀 Moonlit Gateway** (Workshop, one-time): opens the **Gate Room**, a hall of portals reached from the start of the place tabs. Unlike other Workshop items, it **stays through prestiges**
- **Crimson Gate:** step through for a 75-second visit to the Crimson Castle. Tap the blood pool, catch Dracula in the windows, then exchange your Blood Drops when the gate pulls you home. The gate then rests for 30 minutes. Cooldowns run on real time, so they finish even while the game is closed
- **Blood Moon (reworked):** no longer pulls you away. While it's up, the moon turns red, the Crimson Gate's cooldown drops by 15 minutes, and castle visits give ×2 Blood Drops
- Two sealed gates wait for future worlds
- New achievements: *Between Worlds* and *Frequent Guest*

### Version 3.5: less busy display

- **Settings → Display → Helpers on screen:** *Lively* shows up to 10 of each helper; *Less busy* shows up to 5. It's remembered on each device, and helpers off screen still gather

### Version 3.6: Blood Drop rebalance

- Blood Drops now have **diminishing returns**: a haul is worth about 1.5 minutes of a place's gathering for ~400 drops, rising to about 20–30 minutes for a fully upgraded Blood Moon visit (before, big hauls were worth 100+ hours)
- The Vampire's Chalice gives +20% value per level (was +50%); its extra drops per tap are unchanged
- The exchange shows each total and how much gathering time it equals

### Version 3.7: your fairy

- **You're a fairy now.** A new game starts with *Create your fairy*; older saves get *Meet your fairy* on the next Continue
- **Body:** 9 skin tones, 6 hairstyles in 11 colours, 4 eye styles in 6 colours, 5 wing types in 8 colours, pointy or round ears, rosy cheeks and freckles
- **Clothes** (purely cosmetic) in four slots (headwear, outfit, shoes, in hand), 37 items in all
  - Each place gives its own costume on your first visit (Pond, Mushroom Ring, Oak, Grotto, Meadow, and the Crimson Castle)
  - Others unlock with achievements (10 and 25 achieved, Golden Lotuses, the Enchanted Hand) and prestige (first night, and the finale)
- **Wardrobe:** open it from your portrait in the top bar or by tapping your fairy in a scene; change anything at any time. *Surprise me* picks a random look from what you own
- Your fairy hovers in each scene and flicks her wand when you tap, and greets you on the title screen. You can hide her from scenes in Settings → Display
- Your look and wardrobe stay through prestiges and travel with save codes

### Version 3.8: the Cuckoo Clockworks

- **⏰ Cuckoo Gate:** a second gate in the Gate Room, to the inside of a giant cuckoo clock (60-second visit, 45-minute rest)
- Tap the clock to collect **Seconds** (1 per tap, 2 on an echo, 5 on a crit; the Enchanted Hand helps). The **cuckoo bird** pops out of its door now and then: tap it for +30 Seconds
- When the gate pulls you home, your Seconds become **⏳ Borrowed Time: everything ×2** for that many seconds of play. It adds to any time you have left, up to 30 minutes, and carries through prestige
- **🕛 Midnight Chimes** (new event): cuts 15 minutes off the Cuckoo Gate's rest, and clock visits give ×2 Seconds
- A clockmaker costume (cuckoo hat, clockmaker's coat, pocket watch), a music-box waltz, and three new achievements

### Version 3.9: the Sunken Palace and the Cloud Isles

The Gate Room now has four portals.

- **🐚 Tide Gate → Sunken Palace** (60-second visit, 60-minute rest): tap the giant clam for **Pearls**, and catch the mermaid when she peeks out of the seaweed (+25). Pearls are strung onto your **📿 Pearl Necklace**: every strand is **+2% to everything, forever**, even through prestiges. Strand *n* needs 50 × *n* more pearls
- **☁️ Sky Gate → Cloud Isles** (60-second visit, 45-minute rest): tap the rainbow cloud for **Sunbeams**, and catch the cloud whale as it drifts by (+25). Each Sunbeam stores **30 seconds of double offline earnings** (up to 12 hours), used up the next time you're away
- New events **🌊 High Tide** and **🌈 Rainbow Day** each cut 15 minutes off their gate's rest and double that world's haul
- Costumes: seashell crown, mermaid gown, little trident; rainbow headband, cloud puff dress, sky parasol
- Undersea ambience with bubbles, a floaty Cloud Isles song, and four new achievements

### Version 3.10: familiars

- **12 familiars**: cute animal companions who sit beside your fairy in every place and on the title screen. Choose one in the Wardrobe's new **🐾 Familiars** tab
  - Bunny and Kitten from the start; Hedgehog, Fox Kit, Axolotl and Owlet from the Mushroom Ring, Oak, Grotto and Meadow; Bat Pup, Clockwork Mouse, Otter and Cloud Lamb from the four gate worlds; Dragon Hatchling from your first prestige; Moon Foal from the finale
- **Speech bubbles**: every so often your familiar says something in its own voice: about where you are, the current event, useful hints (an affordable upgrade, a ready gate, the moon calling for a new night), or just its personality. It cheers when you earn achievements and clothes
- **Tap your familiar** to make it hop and say something
- **Settings → Display → Familiar chatter**: Chatty, Quiet or Off
- Two new achievements
- Fix: the Workshop, Awards and Settings tabs now work in the Gate Room and during gate visits

### Version 3.11: the Conspiracy Gnome and grumpy familiars

- **🍄 Conspiracy Gnome** familiar: unlocks once you've recruited 50 Mycel Gnomes in the Mushroom Ring. He has a tinfoil-lined hat and a head full of in-world conspiracy theories ("The moon isn't real. It's a lantern the owls hung up to spy on us.")
- **Familiars get annoyed:** tap one more than 4 times in a row and it gets grumpy; at 9 it storms off for 30 seconds. Pausing for 2 seconds calms it down
- **The gnome explodes instead**, and a different familiar you own takes his place. He stays in your wardrobe for next time
- Three new secret achievements

### Version 3.14: High-Five Heights

- **✋ Palm Gate → High-Five Heights** (60-second visit, 40-minute rest): high-five the big friendly hand, and catch the shy hand when it peeks up (+10)
- High-fives earn **helping hands**, up to 8, each needing more than the last (10, 15, 20 … 45; 220 for all eight). When the gate pulls you home, they **tap with you for 3 minutes** wherever you are (2 taps a second each, or your Enchanted Hand's speed if faster)
- **👏 Grand Applause** event: cuts 15 minutes off the Palm Gate's rest and doubles high-fives
- A Foam Hand to hold, and two new achievements
- The Gate Room now has five portals; fixed portal glows overlapping so taps always enter the gate you meant

### Version 3.15: clothes with bonuses

- **Every clothing item now gives a small bonus while worn**, matching its theme. For example: each place's hat and outfit boost that place's helpers +10%, its wand or staff boosts its taps +20%; the castle pieces raise Blood Drop value; Cloud Isles pieces add offline time; rare items like the Halo and Full Moon Gown give +5% to everything
- **Matching sets:** wear every piece from one place for a set bonus (×1.25 to that place, or a gate-world perk)
- The Wardrobe shows each item's bonus and an **Outfit bonuses** summary of what you're wearing

### Version 3.16: familiar accessories

- **16 accessories** for familiars (purely cosmetic), chosen in Wardrobe → Familiars. Whatever's worn stays on when you switch familiars, and each one is placed to fit every animal
  - From the start: Bow Tie, Bandana, Party Hat
  - From places and gates: Flower Crown (Pond), Bell Collar (Mushroom Ring), Acorn Hat (Oak), Tiny Tiara (Grotto), Star Shades (Meadow), Vampire Collar (Castle), Top Hat (Clockworks), Pearl Necklace (Sunken Palace), Rainbow Scarf (Cloud Isles), Tiny Foam Glove (High-Five Heights)
  - Specials: Tinfoil Hat (50 Mycel Gnomes), Propeller Cap (first prestige), Little Halo (the finale)

## Releasing an update

Browsers may keep old copies of the game's files for a while. Before pushing a release, stamp a new version so every browser fetches fresh files:

```sh
node tools/stamp-version.mjs 3.7.1   # updates index.html and every import in js/
```

If an update doesn't show up, a hard refresh (Ctrl+Shift+R, or Cmd+Shift+R on Mac) always loads the latest files. The version number is shown at the bottom of the title screen.

## Balancing tool

`tools/sim.mjs` plays the game headlessly as a casual player and logs when each place unlocks and when each prestige happens:

```sh
POLICY=double node tools/sim.mjs 10 3   # 10 days, 3 taps per second
```

## Code layout

| File | Purpose |
|---|---|
| `index.html` | Page shell: title screen and game screen |
| `css/style.css` | Styles and responsive layout |
| `js/data.js` | All game content: locations, helpers, upgrades, features, events, Moon Shrine |
| `js/achievements.js` | Achievement list and unlock conditions |
| `js/game.js` | State, formulas, saving and loading (no DOM) |
| `js/scenes.js` | SVG artwork for each location and the Crimson Courtyard |
| `js/sprites.js` | Helper drawings, where they live and how they move |
| `js/avatar.js` | The player's fairy: body options and clothing drawings |
| `js/familiars.js` | Familiar drawings and personality lines |
| `js/audio.js` | Generated sound effects, ambience, castle theme and finale music |
| `tools/sim.mjs` | Pacing simulator for balancing |
| `tools/stamp-version.mjs` | Stamps a release version onto file URLs so updates aren't hidden by caching |
| `js/main.js` | UI, input and the game loop |
