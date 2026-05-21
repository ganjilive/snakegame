# Retro Snake

A browser-based retro snake game with a modern pixel aesthetic. No login required — just open the link and play.

**Latest release: [v2.0.0](https://github.com/ganjilive/snakegame/releases/tag/v2.0.0)** on `main` — includes the Evil Snake AI opponent. **v3.0.0** (lives, hearts, mushrooms) is in development on `iteration-3`. See [v1.0.0](https://github.com/ganjilive/snakegame/releases/tag/v1.0.0) for the original single-player build.

## Features

### Core (v1.0.0)

- Classic snake on a 20×20 grid with wrap-around walls
- Frogs as food (+10 score each) with a pulsing pixel frog sprite
- Progressive speed: every 50 points, tick interval drops by 5 ms (floor 60 ms)
- Local high score and mute preference saved in `localStorage`
- Chiptune background music and retro sound effects
- Dramatic Mario-style game-over jingle
- Mute toggle via HUD button or `M` key

### Evil Snake (v2.0.0)

- Red AI-controlled opponent(s) that compete for the same frogs
- Pathfinding AI: BFS toward frogs, hunts your head when within 6 cells, otherwise scores safe moves
- Steals frogs and grows — player gets priority if both reach the frog on the same tick
- Self-collision kills the evil snake and **immediately respawns** a new one
- At **length 10**, an evil snake **splits** in half (tail half moves opposite direction); up to **4** evil snakes on screen
- Dedicated evil-death sound effect

### Lives, Hearts & Mushrooms (v3.0.0)

- **3 lives** — fatal collisions cost 1 life and respawn you at center (score kept); game over when all lives are lost
- Brief **invulnerability** after respawn so you don't die instantly again
- **Heart pickups** occasionally appear on empty cells; eating one restores 1 life (max 3)
- **Falling mushrooms** drop from the top of the grid; eating one shrinks your snake by 1 segment
- Mushroom at length 1 costs 1 life (same as an evil body hit at length 1)
- Lives shown as hearts in the HUD; dedicated SFX for heart, mushroom, and life lost

## How to play

| Goal | Detail |
|---|---|
| Eat frogs | +10 score; snake grows; game speeds up |
| Avoid evil | Your head touching any evil segment costs 1 life |
| Use evil against itself | Lure it into its own body — it dies and respawns |
| Punish body hits | Evil head on your body kills evil and shrinks you by 1 segment |
| Grab hearts | Restore 1 life when below 3 (hearts spawn occasionally) |
| Dodge mushrooms | Falling mushrooms shrink you by 1; at length 1 they cost 1 life |

## Collision rules

| Situation | Result |
|---|---|
| Your head hits your own body | Lose 1 life; respawn at center (score kept) |
| Your head hits evil body or head | Lose 1 life; respawn at center |
| Your head hits evil head (head-on) | Lose 1 life; evil dies; you respawn |
| Evil head hits your body | Evil dies; you lose 1 segment |
| Evil head hits your body while you are length 1 | Lose 1 life; respawn |
| Evil head hits your head | Lose 1 life; evil dies; you respawn |
| You eat a heart | +1 life (max 3); no growth or score |
| You eat a falling mushroom (length > 1) | Lose 1 segment |
| You eat a falling mushroom (length 1) | Lose 1 life; respawn |
| All lives lost | Game over |
| Evil runs into its own body | Evil dies; new evil respawns immediately |
| Two evil heads collide | Both evil snakes die |
| Evil reaches length 10 after eating | Splits into two evil snakes (oldest removed if over cap of 4) |

## Evil Snake AI

Each tick, every living evil snake picks a direction:

1. **Safe moves only** — cannot reverse 180°; avoids immediate self-collision
2. **Frog chase** — if a frog exists, BFS pathfinding toward it (wrap-aware)
3. **Hunt** — if your head is within 6 cells (Manhattan, wrap-aware), BFS toward you
4. **Fallback** — score remaining safe directions (closer to frog/player body = better; avoids player and other evil bodies)

## Play locally

ES modules require a local server (opening `index.html` directly will not work).

```bash
npx serve .
```

Then open the URL shown in the terminal (usually `http://localhost:3000`).

## Controls

| Key / Action | Effect |
|---|---|
| Arrow keys / WASD | Move |
| Any key | Start from title screen |
| R / Enter | Restart after game over |
| M or SOUND button | Toggle mute |

## Project structure

```
snakegame/
├── index.html          # Canvas, HUD, start/game-over overlays
├── css/style.css       # Game Boy–style frame and overlays
└── js/
    ├── main.js         # Input, game loop, HUD, audio hooks
    ├── game.js         # Rules, collisions, frogs, hearts, mushrooms, evil snakes
    ├── evil-ai.js      # BFS pathfinding and direction scoring
    ├── renderer.js     # Canvas drawing (player, evil, frogs, hearts, mushrooms)
    ├── audio.js        # Web Audio chiptune music and SFX
    └── storage.js      # localStorage high score + mute flag
```

No build step — static files only, suitable for Vercel or any static host.

## Development history

| Milestone | Branch / tag | Summary |
|---|---|---|
| Initial game | `main` | Retro snake, wrap walls, frogs, speed scaling, chiptune audio, local high scores |
| **v1.0.0** | tag `v1.0.0` on `main` | HUD mute button (`M`), Mario-style death jingle with pitch slides, README |
| **v2.0.0** | tag `v2.0.0` on `main` | Evil Snake AI, frog visuals, collision/split/respawn rules, evil death SFX, title-screen warning |
| **v3.0.0** | branch `iteration-3` | 3 lives with respawn, heart pickups, falling mushrooms, lives HUD, new SFX |

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo at [vercel.com](https://vercel.com).
3. Framework preset: **Other** (static site, no build step).
4. Deploy from `main` and share the URL with friends.

## License

MIT
