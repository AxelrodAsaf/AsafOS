import {
  backendBaseUrl,
  defaultResumePdfUrl,
  themeStorageKey
} from "./config.js";
import {
  fetchJson,
  fetchWithFallback,
  loadConfig
} from "./services/api.js";
import { initializeTileReflow, queueTileReflow } from "./layout/reflow.js";
import { updateGitHubCard } from "./features/github.js";
import {
  updateSpotifyArtists,
  updateSpotifyHero,
  updateSpotifySongsList
} from "./features/spotify.js";
import {
  updateGoodreadsCurrentBook,
  updateGoodreadsRatedBooks
} from "./features/goodreads.js";
import { updateNews } from "./features/news.js";
import { updateResumeTile } from "./features/resume.js";
import { buildMap } from "./features/maps.js";
import { updateStravaTile } from "./features/strava.js";
import { initializeTheme } from "./features/theme.js";
import { initializeCarousel } from "./features/gallery.js";
import { initializeAudioPlayer } from "./features/audio.js";
import { hideLoadingOverlay } from "./features/loading.js";
import { initializeAutoScroll } from "./features/autoscroll.js";

document.addEventListener("DOMContentLoaded", async () => {
  initializeTileReflow();

  try {
    const [config, songs, artists, articles, latestRun, goodreads] =
      await Promise.all([
        loadConfig(),
        fetchWithFallback(
          `${backendBaseUrl}/api/spotify/recent-songs?limit=50`,
          "./recentSongs.json"
        ),
        fetchWithFallback(
          `${backendBaseUrl}/api/spotify/top-artists?limit=20`,
          "./topArtists.json"
        ),
        fetchWithFallback(
          `${backendBaseUrl}/api/news/n12`,
          "./newsArticles.json"
        ),
        fetchJson(`${backendBaseUrl}/api/strava/latest-run`).catch(() => null),
        fetchJson(`${backendBaseUrl}/api/goodreads?limit=25`).catch(() => null)
      ]);

    const isDarkMode =
      (localStorage.getItem(themeStorageKey) ?? "light") === "dark";
    const mapConfig = config?.map ?? null;
    const stravaMap = updateStravaTile(latestRun, mapConfig, isDarkMode);
    const maps = [
      buildMap("map-seattle", [47.6252, -122.2021], 9.5, mapConfig, isDarkMode),
      buildMap("map-herzliya", [32.1663, 34.8436], 11.5, mapConfig, isDarkMode),
      stravaMap
    ];

    initializeTheme(maps, mapConfig);
    initializeCarousel();
    initializeAudioPlayer();

    if (songs.length > 0) {
      updateSpotifyHero(songs[0]);
      updateSpotifySongsList(songs);
    }

    updateSpotifyArtists(artists);
    updateGoodreadsCurrentBook(goodreads?.currentBook ?? null);
    updateGoodreadsRatedBooks(goodreads?.ratedBooks ?? []);
    updateNews(articles);
    updateResumeTile(config?.resumePdfUrl ?? defaultResumePdfUrl);
    initializeAutoScroll("spotify-songs-scroll-container", 0.3);
    initializeAutoScroll("news-scroll-container", 0.25);
    initializeAutoScroll("spotify-artists-container", 0.22);
    initializeAutoScroll("goodreads-ratings-scroll-container", 0.24);
    await updateGitHubCard();
    queueTileReflow();
  } catch (error) {
    console.error("Failed to initialize old-style UI:", error);
  } finally {
    window.requestAnimationFrame(() => {
      hideLoadingOverlay();
      queueTileReflow();
    });
  }
});
