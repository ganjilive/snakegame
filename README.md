# Retro Snake

A browser-based retro snake game with a modern pixel aesthetic. No login required — just open the link and play.

**Latest release: [v3.0.0](https://github.com/ganjilive/snakegame/releases/tag/v3.0.0)** on `main` — lives, heart pickups, falling mushrooms, and timed bombs. See [v2.0.0](https://github.com/ganjilive/snakegame/releases/tag/v2.0.0) for Evil Snake only, and [v1.0.0](https://github.com/ganjilive/snakegame/releases/tag/v1.0.0) for the original single-player build.

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

### Lives, Hearts, Mushrooms & Bombs (v3.0.0)

- **3 lives** — fatal collisions cost 1 life and respawn you at center (length 3, score kept); game over when all lives are lost
- **4 ticks of invulnerability** after respawn; the player snake blinks and cannot die from collisions during that window
- **Heart pickups** on empty cells when lives &lt; 3 — about every **22 s** at base speed (40% chance every 60 ticks); restores 1 life, no growth or score
- **Falling mushrooms** from the top (up to **2** on screen, new spawn about every **15 s**); eating one shrinks you by 1 segment; at length 1 it costs 1 life
- **Bomb pickups** on empty cells — about every **30 s** at base speed (40% chance every 80 ticks), visible for **30 ticks** (~**4.5 s** at base speed); blinks urgently when ≤10 ticks remain
- Player eating a bomb kills **all** evil snakes; evil eating a bomb only removes the bomb; player wins ties on frog and bomb cells
- Lives shown as **♥/♡** in the HUD (filled + empty hearts); dedicated SFX for heart, mushroom, life lost, and bomb detonation

## How to play

| Goal | Detail |
|---|---|
| Eat frogs | +10 score; snake grows; game speeds up |
| Avoid evil | Your head touching any evil segment costs 1 life |
| Use evil against itself | Lure it into its own body — it dies and respawns |
| Punish body hits | Evil head on your body kills evil and shrinks you by 1 segment |
| Grab hearts | Restore 1 life when below 3 |
| Grab bombs | Kill all evil snakes before the bomb expires (~4.5 s at base speed) |
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
| You eat a bomb | All evil snakes die; no growth or score |
| Evil snake eats a bomb | Bomb disappears; evil survives |
| Bomb timer expires | Bomb vanishes |
| All lives lost | Game over |
| Evil runs into its own body | Evil dies; new evil respawns immediately |
| Two evil heads collide | Both evil snakes die |
| Evil reaches length 10 after eating | Splits into two evil snakes (oldest removed if over cap of 4) |

During invulnerability after respawn, self-collision and evil contact do not cost a life.

## Evil Snake AI

Each tick, every living evil snake picks a direction:

1. **Safe moves only** — cannot reverse 180°; avoids immediate self-collision
2. **Frog chase** — if a frog exists, BFS pathfinding toward it (wrap-aware)
3. **Hunt** — if your head is within 6 cells (Manhattan, wrap-aware), BFS toward you
4. **Fallback** — score remaining safe directions (closer to frog/player body = better; avoids player and other evil bodies)

## Pickup tuning (v3)

Spawn rates scale with game speed (tick interval shrinks as score rises). Approximate times below use the **150 ms** base tick at score 0.

| Pickup | Constants (`js/game.js`) | Behavior |
|---|---|---|
| Heart | `HEART_SPAWN_INTERVAL` 60, chance 0.4 | Only when lives &lt; 3 and no heart on board; ~22 s between spawns |
| Bomb | `BOMB_SPAWN_INTERVAL` 80, chance 0.4, lifetime 30 ticks | One bomb at a time; ~30 s between spawns, ~4.5 s on screen |
| Mushroom | `MUSHROOM_SPAWN_INTERVAL` 100, max 2 | Spawns at top row; falls 1 cell per tick; ~15 s between spawns |

## Sound effects

| Event | SFX |
|---|---|
| Eat frog | Short rising chiptune |
| Evil dies (collision / self) | Evil death tone |
| Eat heart | Heart chime |
| Eat mushroom | Mushroom tone |
| Lose life (respawn) | Life-lost sting |
| Bomb detonation (player eats) | Single boom; no per-evil death sounds |
| Game over | Mario-style sliding death jingle |

Background music loops while playing (stops on mute or game over).

## Play locally

ES modules require a local server (opening `index.html` directly will not work).

```bash
npx serve .
```

Then open the URL shown in the terminal (usually `http://localhost:3000`).

## Controls

### Desktop (keyboard)

| Key / Action | Effect |
|---|---|
| Arrow keys / WASD | Move |
| Any key | Start from title screen |
| R / Enter | Restart after game over |
| M or SOUND button | Toggle mute |

### Mobile (touch)

On screens 767px wide or narrower, the game fills the phone screen with on-screen controls:

| Action | Effect |
|---|---|
| START button | Start from title screen |
| RESTART button | Restart after game over |
| On-screen D-pad | Move |
| SOUND button | Toggle mute |

## Project structure

```
snakegame/
├── index.html          # Canvas, HUD (score, lives, mute, high score), overlays
├── css/style.css       # Game Boy–style frame, HUD, start/game-over overlays
└── js/
    ├── main.js         # Input, game loop, HUD updates, audio hooks
    ├── game.js         # Rules, collisions, frogs, hearts, bombs, mushrooms, evil snakes
    ├── evil-ai.js      # BFS pathfinding and direction scoring
    ├── renderer.js     # Canvas drawing (player, evil, frogs, hearts, bombs, mushrooms)
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
| **v3.0.0** | tag `v3.0.0` on `main` | 3 lives with respawn and invulnerability, heart pickups, falling mushrooms, timed bombs, lives HUD, new SFX, tuned spawn rates |

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo at [vercel.com](https://vercel.com).
3. Framework preset: **Other** (static site, no build step).
4. Deploy from `main` and share the URL with friends.

## License

MIT
