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

## Roadmap

- **Version 2:** Ancient Oak, Crystal Grotto and Starfall Meadow, random events, and achievements
- **Version 3:** prestige (Moonstones and the Moon Shrine), a finale after 5 prestiges with endless mode afterwards, and balancing

## Code layout

| File | Purpose |
|---|---|
| `index.html` | Page shell: title screen and game screen |
| `css/style.css` | Styles and responsive layout |
| `js/data.js` | All game content: locations, helpers, upgrades, features |
| `js/game.js` | State, formulas, saving and loading (no DOM) |
| `js/scenes.js` | SVG artwork for each location |
| `js/audio.js` | Generated sound effects and ambience |
| `js/main.js` | UI, input and the game loop |
