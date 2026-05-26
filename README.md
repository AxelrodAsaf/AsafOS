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
- Spotify, N12 RSS, map config, and the future resume PDF tile are intended to be served by the separate backend repo.
