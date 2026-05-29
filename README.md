# AsafOS Frontend

AsafOS is the frontend for [asafos.netlify.app](https://asafos.netlify.app/frontend/), a personal resume/portfolio site built as a tile-based interface.

Instead of a standard resume page, the site presents experience, education, music, reading, maps, and live integrations as a grid of interactive tiles. The goal is to feel personal and memorable while still functioning as a concise professional snapshot.

## What This Repo Contains

- The tile-based website UI
- Static assets and images
- Frontend rendering logic for Spotify, Goodreads, Strava, GitHub, news, maps, audio, and resume content
- Local fallback JSON files used when live backend data is unavailable

## Live Site

- Website: [https://asafos.netlify.app/frontend/](https://asafos.netlify.app/frontend/)

## How It Works

The frontend is intentionally lightweight:

- `index.html` defines the tile layout
- `styles.css` defines the visual system and responsive behavior
- `javascript/` is split by responsibility:
  - `features/` for tile-specific behavior
  - `services/` for API helpers
  - `layout/` for grid/reflow behavior
  - `config.js` for shared frontend configuration
  - `main.js` as the boot/orchestration layer

Most live data comes from the backend service on Render. If that backend is unavailable, some tiles can fall back to local JSON.

## Running Locally

```bash
cd "/Users/asafaxelrod/Desktop/AsafOS - Codex/frontend"
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

## Notes

- The visual direction intentionally stays close to the original AsafOS look.
- The frontend expects the backend to provide live Spotify, Strava, Goodreads, map, news, and config data.
- This repo is primarily maintained as the source for Asaf’s portfolio site, not as a general-purpose frontend starter.
