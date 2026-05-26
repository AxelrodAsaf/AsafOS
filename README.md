# AsafOS Frontend

Frontend for AsafOS.

This repo contains the original-style tile-based portfolio UI, image assets, and local fallback JSON data.

## Structure

- `index.html`
- `styles.css`
- `javascript/main.js`
- `assets/`
- `recentSongs.json`
- `topArtists.json`
- `newsArticles.json`

## Local Run

```bash
cd "/Users/asafaxelrod/Desktop/AsafOS - Codex/frontend"
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Notes

- The UI is intentionally close to the original AsafOS design.
- The frontend uses `https://asafos-backend.onrender.com` as its backend in both local and deployed use, unless `window.ASAFOS_BACKEND_URL` is explicitly overridden before `javascript/main.js` loads.
- In production, the frontend fetches Spotify, N12 RSS, map config, and the optional resume PDF tile from the backend.
- If the backend is unavailable, the frontend falls back to the local JSON files for Spotify and news content.
- The workspace-level TODO is kept at `/Users/asafaxelrod/Desktop/AsafOS - Codex/TODO.md`, not inside this repo.
