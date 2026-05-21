# Retro Snake

A browser-based retro snake game with a modern pixel aesthetic. No login required — just open the link and play.

## Features

- Classic snake gameplay with wrap-around walls
- Progressive speed as your score grows
- Local high score saved in your browser
- Chiptune background music and retro sound effects
- Dramatic Mario-style game-over jingle
- Mute toggle via HUD button or `M` key
- **Evil Snake** — red AI opponent that steals frogs, hunts you, and splits when it grows large enough

## Evil Snake (iteration-2)

A red AI-controlled snake competes against you:

- Steals frogs and grows — same rules as your snake
- Wraps around walls like you do
- **Evil head hits your body** — evil dies, you lose 1 segment (both die if you're length 1)
- **Your head hits evil** — you die
- **Head-on-head** — both die
- **Evil hits itself** — it dies and immediately respawns
- **Evil reaches length 10** — splits into two evil snakes (max 4 on screen)

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

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo at [vercel.com](https://vercel.com).
3. Framework preset: **Other** (static site, no build step).
4. Deploy and share the URL with friends.

## License

MIT
