# Retro Snake

A browser-based retro snake game with wrap-around walls, progressive speed, local high scores, and chiptune audio.

## Run locally

ES modules require a local server (opening `index.html` directly in the browser will not work).

```bash
npx serve .
```

Then open the URL shown in the terminal (usually `http://localhost:3000`).

## Controls

| Key | Action |
|---|---|
| Arrow keys / WASD | Move |
| Any key | Start from title screen |
| R / Enter | Restart after game over |
| M | Toggle mute |

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo in [Vercel](https://vercel.com).
3. Framework preset: **Other** (static site, no build step).
4. Deploy and share the URL.
