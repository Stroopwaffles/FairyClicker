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
| `js/audio.js` | Generated sound effects, ambience, castle theme and finale music |
| `tools/sim.mjs` | Pacing simulator for balancing |
| `js/main.js` | UI, input and the game loop |
