# Retro Snake

A browser-based retro snake game with a modern pixel aesthetic. No login required — just open the link and play.

## Features

- Classic snake gameplay with wrap-around walls
- Progressive speed as your score grows
- Local high score saved in your browser
- Chiptune background music and retro sound effects
- Dramatic Mario-style game-over jingle
- Mute toggle via HUD button or `M` key

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
