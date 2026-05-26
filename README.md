# AsafOS Frontend

Frontend for AsafOS.

This repo contains the tile-based portfolio UI and static fallback data used by the site.

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
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Notes

- The UI is intentionally close to the original AsafOS design.
- In production, the frontend fetches Spotify, N12 RSS, map config, and the optional resume PDF tile from `https://asafos-backend.onrender.com`.
- If the backend is unavailable, the frontend falls back to the local JSON files for Spotify and news content.
