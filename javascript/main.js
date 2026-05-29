const themeStorageKey = "asafos-theme";
const backendBaseUrl =
  window.ASAFOS_BACKEND_URL ??
  "https://asafos-backend.onrender.com";
const defaultResumePdfUrl = "./assets/Asaf-Axelrod-Resume.pdf";
const defaultNewsImageFallback =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="110" viewBox="0 0 160 110">
      <rect width="160" height="110" rx="12" fill="#ececec"/>
      <text x="80" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#d40000">N12</text>
    </svg>
  `);

let lastTilePositions = new Map();
let tileReflowFrame = null;
let tileResizeTimeoutId = null;
let frozenGridFrame = null;
const tileReflowStartDelayMs = 85;
let currentGridColumns = 5;
let currentTileWidth = 0;

const getVisibleGridTiles = () => {
  const grid = document.getElementById("grid");

  if (!grid) {
    return [];
  }

  return Array.from(grid.children).filter((tile) => {
    if (!(tile instanceof HTMLElement)) {
      return false;
    }

    if (tile.hidden) {
      return false;
    }

    return window.getComputedStyle(tile).display !== "none";
  });
};

const captureTilePositions = () => {
  return new Map(
    getVisibleGridTiles().map((tile) => [tile, tile.getBoundingClientRect()])
  );
};

const isRectInViewport = (rect) => {
  return (
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < window.innerHeight &&
    rect.left < window.innerWidth
  );
};

const getResponsiveGridColumns = (viewportWidth = window.innerWidth) => {
  if (viewportWidth <= 670) {
    return 2;
  }

  if (viewportWidth <= 890) {
    return 3;
  }

  if (viewportWidth <= 1120) {
    return 4;
  }

  return 5;
};

const applyResponsiveGridColumns = (columnCount) => {
  const grid = document.getElementById("grid");

  if (!grid) {
    return;
  }

  grid.style.setProperty("--grid-columns", String(columnCount));
};

const getCurrentTileWidth = () => {
  const firstTile = getVisibleGridTiles()[0];

  if (!firstTile) {
    return 0;
  }

  return Math.round(firstTile.getBoundingClientRect().width);
};

const freezeGridFrame = () => {
  const grid = document.getElementById("grid");

  if (!grid) {
    return;
  }

  const rect = grid.getBoundingClientRect();
  frozenGridFrame = {
    width: rect.width,
    height: rect.height
  };

  grid.style.width = `${rect.width}px`;
  grid.style.height = `${rect.height}px`;
};

const releaseGridFrame = () => {
  const grid = document.getElementById("grid");

  if (!grid) {
    return;
  }

  grid.style.width = "";
  grid.style.height = "";
  frozenGridFrame = null;
};

const animateTileReflow = () => {
  const nextPositions = captureTilePositions();

  nextPositions.forEach((nextRect, tile) => {
    const previousRect = lastTilePositions.get(tile);

    if (!previousRect) {
      return;
    }

    if (!isRectInViewport(previousRect) && !isRectInViewport(nextRect)) {
      return;
    }

    const deltaX = previousRect.left - nextRect.left;
    const deltaY = previousRect.top - nextRect.top;

    if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
      return;
    }

    tile.style.transition = "none";
    tile.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    tile.getBoundingClientRect();

    window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        tile.style.transition = "transform 320ms cubic-bezier(0.2, 0.9, 0.25, 1.15)";
        tile.style.transform = "";

        const clearTransition = () => {
          tile.style.transition = "";
          tile.removeEventListener("transitionend", clearTransition);
        };

        tile.addEventListener("transitionend", clearTransition);
      });
    }, tileReflowStartDelayMs);
  });

  lastTilePositions = nextPositions;
};

const queueTileReflow = () => {
  if (tileReflowFrame !== null) {
    return;
  }

  tileReflowFrame = window.requestAnimationFrame(() => {
    tileReflowFrame = null;
    releaseGridFrame();
    animateTileReflow();
  });
};

const initializeTileReflow = () => {
  currentGridColumns = getResponsiveGridColumns();
  applyResponsiveGridColumns(currentGridColumns);
  lastTilePositions = captureTilePositions();
  currentTileWidth = getCurrentTileWidth();

  window.addEventListener("resize", () => {
    const nextGridColumns = getResponsiveGridColumns();
    const nextTileWidth = getCurrentTileWidth();

    if (
      nextGridColumns === currentGridColumns &&
      nextTileWidth === currentTileWidth
    ) {
      return;
    }

    if (tileResizeTimeoutId === null) {
      lastTilePositions = captureTilePositions();
      freezeGridFrame();
    }

    window.clearTimeout(tileResizeTimeoutId);
    tileResizeTimeoutId = window.setTimeout(() => {
      tileResizeTimeoutId = null;
      currentGridColumns = getResponsiveGridColumns();
      applyResponsiveGridColumns(currentGridColumns);
      currentTileWidth = getCurrentTileWidth();
      queueTileReflow();
    }, 40);
  });
};

const hideLoadingOverlay = () => {
  const overlay = document.getElementById("page-loading-overlay");

  if (!overlay) {
    return;
  }

  window.setTimeout(() => {
    overlay.classList.add("is-hidden");
  }, 200);
};

const fetchJson = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }

  return response.json();
};

const fetchWithFallback = async (primaryUrl, fallbackUrl) => {
  try {
    return await fetchJson(primaryUrl);
  } catch (error) {
    if (!fallbackUrl) {
      throw error;
    }

    console.warn(`Falling back to ${fallbackUrl} after ${primaryUrl} failed.`, error);
    return fetchJson(fallbackUrl);
  }
};

const loadConfig = async () => {
  try {
    return await fetchJson(`${backendBaseUrl}/api/config`);
  } catch (error) {
    console.warn("Falling back to local defaults after config request failed.", error);
    return null;
  }
};

const formatArticleTime = (value) => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    const match = value.match(/(\d{2}):(\d{2})/);
    return match ? `${match[1]}:${match[2]}` : "";
  }

  return parsed.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
};

const updateGitHubCard = async () => {
  const response = await fetch("https://api.github.com/users/AxelrodAsaf");

  if (!response.ok) {
    throw new Error(`GitHub request failed with ${response.status}`);
  }

  const profile = await response.json();

  document.getElementById("github-followers").textContent =
    `Followers: ${profile.followers}`;
  document.getElementById("github-following").textContent =
    `Following: ${profile.following}`;
  document.getElementById("github-repos").textContent =
    `Repos: ${profile.public_repos}`;

  document.getElementById("github-link").href =
    profile.html_url ?? "https://github.com/AxelrodAsaf/";
};

const updateSpotifyHero = (song) => {
  const tile = document.getElementById("spotify-songs-tile");
  tile.hidden = false;
  document.getElementById("spotify-art-link").href = song.spotifyUrl;
  document.getElementById("spotify-logo-link").href = song.spotifyUrl;
  document.getElementById("spotify-track-link").href = song.spotifyUrl;
  tile.querySelector(".spotify-song-title").textContent = song.trackName;
  tile.querySelector(".spotify-song-artist").textContent = song.artistName;

  const image = tile.querySelector("#spotify-album-art");
  image.src = song.albumImage;
  image.alt = `${song.artistName} - ${song.trackName}`;
};

const updateResumeTile = (resumePdfUrl) => {
  if (!resumePdfUrl) {
    return;
  }

  const grid = document.getElementById("grid");
  const insertionAnchor = document.getElementById("spotify-songs-tile");
  const existingTile = document.getElementById("resume-tile");

  if (existingTile) {
    const downloadLink = existingTile.querySelector(".resume-download-link");

    if (downloadLink) {
      downloadLink.href = resumePdfUrl;
    }

    const frame = existingTile.querySelector(".resume-preview-frame");

    if (frame) {
      frame.src = `${resumePdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
    }

    return;
  }

  const resumeTile = document.createElement("div");
  resumeTile.id = "resume-tile";
  resumeTile.className = "tile long-tile";
  resumeTile.innerHTML = `
    <div class="resume-header">
      <h3 class="resume-header-text">Resume</h3>
    </div>
    <div class="resume-preview-shell">
      <iframe
        class="resume-preview-frame"
        src="${resumePdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH"
        title="Resume preview"
        loading="lazy"
      ></iframe>
      <a
        class="resume-download-overlay resume-download-link tile-link-focus"
        href="${resumePdfUrl}"
        target="_blank"
        rel="noreferrer"
        aria-label="Download resume"
      >
        <i class="fa-solid fa-file-arrow-down"></i>
      </a>
    </div>
  `;

  if (insertionAnchor) {
    insertionAnchor.insertAdjacentElement("afterend", resumeTile);
    return;
  }

  grid.appendChild(resumeTile);
};

const updateSpotifySongsList = (songs) => {
  const tile = document.getElementById("spotify-songs-list");
  const tableBody = document.querySelector("#spotify-songs-table tbody");
  tile.hidden = false;
  tableBody.innerHTML = "";

  songs.forEach((song) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <a href="${song.spotifyUrl}" target="_blank" rel="noreferrer">
          <img src="${song.albumImage}" alt="${song.artistName} - ${song.trackName}">
        </a>
      </td>
      <td>
        <a href="${song.spotifyUrl}" target="_blank" rel="noreferrer">${song.trackName}</a>
      </td>
      <td>${song.artistName}</td>
    `;
    tableBody.appendChild(row);
  });
};

const updateSpotifyArtists = (artists) => {
  const tile = document.getElementById("spotify-artists-tile");
  const tableBody = document.querySelector("#spotify-artists-table tbody");
  tile.hidden = false;
  tableBody.innerHTML = "";

  artists.forEach((artist, index) => {
    const pictureRow = document.createElement("tr");
    pictureRow.innerHTML = `
      <td>
        <a href="${artist.artistUrl}" target="_blank" rel="noreferrer">
          <img src="${artist.artistImage}" alt="${artist.artistName}">
        </a>
      </td>
      <td>
        <a href="${artist.artistUrl}" target="_blank" rel="noreferrer">${artist.artistName}</a>
      </td>
    `;
    tableBody.appendChild(pictureRow);

    if (index < artists.length - 1) {
      const spacerRow = document.createElement("tr");
      spacerRow.innerHTML = `<td colspan="2"><div class="artistSpacerLine"></div></td>`;
      tableBody.appendChild(spacerRow);
    }
  });
};

const updateGoodreadsCurrentBook = (book) => {
  const tile = document.getElementById("goodreads-current-tile");

  if (!tile) {
    return;
  }

  if (!book || !book.title || !book.imageUrl) {
    tile.hidden = true;
    return;
  }

  tile.hidden = false;
  const bookLink = book.link || "https://www.goodreads.com/user/show/200705407-asaf-axelrod";
  document.getElementById("goodreads-current-cover-link").href = bookLink;
  document.getElementById("goodreads-current-title-link").href = bookLink;
  document.getElementById("goodreads-current-cover").src = book.imageUrl;
  document.getElementById("goodreads-current-title").textContent = book.title;
  document.getElementById("goodreads-current-author").textContent = book.author;
};

const renderRatingStars = (rating) => {
  const fullStars = "★".repeat(Math.max(0, Math.min(5, rating)));
  const emptyStars = "☆".repeat(Math.max(0, 5 - rating));
  return `${fullStars}${emptyStars}`;
};

const updateGoodreadsRatedBooks = (books) => {
  const tile = document.getElementById("goodreads-ratings-tile");
  const tableBody = document.querySelector("#goodreads-ratings-table tbody");

  if (!tile || !tableBody) {
    return;
  }

  const validBooks = (books ?? []).filter(
    (book) => book?.title && book?.imageUrl && book?.author
  );

  if (validBooks.length === 0) {
    tile.hidden = true;
    tableBody.innerHTML = "";
    return;
  }

  tile.hidden = false;
  tableBody.innerHTML = "";

  validBooks.forEach((book) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <a href="${book.link}" target="_blank" rel="noreferrer">
          <img src="${book.imageUrl}" alt="${book.title}">
        </a>
      </td>
      <td>
        <a href="${book.link}" target="_blank" rel="noreferrer" class="goodreads-book-title">${book.title}</a>
        <div class="goodreads-book-author">${book.author}</div>
        <div class="goodreads-book-rating">${renderRatingStars(book.rating)}</div>
      </td>
    `;
    tableBody.appendChild(row);
  });
};

const updateNews = (articles) => {
  const tile = document.getElementById("news-list");
  const tableBody = document.getElementById("news-table-body");
  tile.hidden = false;
  tableBody.innerHTML = "";

  articles.forEach((article) => {
    const imageUrl = article.image || defaultNewsImageFallback;
    const articleTime = formatArticleTime(article.pubDate);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <a href="${article.link}" target="_blank" rel="noreferrer">${article.title}</a>
        <div class="news-meta">${articleTime}</div>
      </td>
      <td>
        <a href="${article.link}" target="_blank" rel="noreferrer">
          <img src="${imageUrl}" alt="${article.title}">
        </a>
      </td>
    `;

    const image = row.querySelector("img");
    image.addEventListener("error", () => {
      image.src = defaultNewsImageFallback;
    }, { once: true });

    tableBody.appendChild(row);
  });
};

const decodePolyline = (encoded) => {
  let index = 0;
  let latitude = 0;
  let longitude = 0;
  const coordinates = [];

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const latitudeDelta = result & 1 ? ~(result >> 1) : result >> 1;
    latitude += latitudeDelta;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const longitudeDelta = result & 1 ? ~(result >> 1) : result >> 1;
    longitude += longitudeDelta;

    coordinates.push([latitude / 1e5, longitude / 1e5]);
  }

  return coordinates;
};

const updateStravaTile = (activity, mapConfig, isDarkMode) => {
  const tile = document.getElementById("strava-tile");

  if (!tile || !activity || !window.L || !activity.polyline) {
    return null;
  }

  const route = decodePolyline(activity.polyline);

  if (route.length === 0) {
    return null;
  }

  tile.hidden = false;
  document.getElementById("strava-topbar-link").href =
    activity.url ?? "https://www.strava.com/";
  document.getElementById("strava-distance").textContent =
    `${activity.distanceKilometers.toFixed(2)} km`;
  document.getElementById("strava-time").textContent =
    activity.movingTimeLabel || "--";
  document.getElementById("strava-pace").textContent =
    activity.paceLabel || "--";

  const map = window.L.map("strava-map", {
    attributionControl: false,
    dragging: false,
    doubleClickZoom: false,
    scrollWheelZoom: false,
    zoomControl: false,
    boxZoom: false,
    keyboard: false,
    tap: false,
    touchZoom: false
  });

  const layer = createTileLayer(mapConfig, isDarkMode);

  if (layer) {
    layer.addTo(map);
    map.getContainer()._leafletTileLayer = layer;
  }

  const polyline = window.L.polyline(route, {
    color: "#fc5200",
    weight: 5,
    opacity: 0.95
  }).addTo(map);

  map.fitBounds(polyline.getBounds(), {
    padding: [18, 18]
  });

  setTimeout(() => map.invalidateSize(), 150);
  return map;
};

const initializeAutoScroll = (containerId, speed = 0.35) => {
  const container = document.getElementById(containerId);

  if (!container) {
    return;
  }

  if (container.dataset.autoscrollInitialized === "true") {
    return;
  }

  container.dataset.autoscrollInitialized = "true";

  const hoverTarget = container.closest(".tile") ?? container;
  let paused = false;
  let currentPosition = 0;
  let lastTimestamp = null;

  hoverTarget.addEventListener("mouseenter", () => {
    paused = true;
  });

  hoverTarget.addEventListener("mouseleave", () => {
    paused = false;
  });

  const step = (timestamp) => {
    const maxScrollTop = container.scrollHeight - container.clientHeight;

    if (lastTimestamp === null) {
      lastTimestamp = timestamp;
    }

    const deltaMs = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    if (maxScrollTop <= 0) {
      currentPosition = 0;
      container.scrollTop = 0;
      window.requestAnimationFrame(step);
      return;
    }

    if (!paused) {
      currentPosition += (deltaMs / 16.6667) * speed;

      if (currentPosition >= maxScrollTop) {
        currentPosition = 0;
        container.scrollTop = 0;
      } else {
        container.scrollTop = currentPosition;
      }
    } else {
      currentPosition = container.scrollTop;
    }

    window.requestAnimationFrame(step);
  };

  window.requestAnimationFrame(step);
};

const createTileLayer = (mapConfig, isDarkMode) => {
  const defaultConfig = {
    tileUrlTemplate: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  };

  if (!window.L) {
    return null;
  }

  const config = mapConfig ?? defaultConfig;
  let tileUrlTemplate = config.tileUrlTemplate ?? defaultConfig.tileUrlTemplate;

  if (config.provider === "stadia") {
    const currentStyle = config.style ?? "alidade_smooth";
    const nextStyle = isDarkMode
      ? currentStyle.replace("_dark", "") + "_dark"
      : currentStyle.replace("_dark", "");

    tileUrlTemplate = tileUrlTemplate.replace(
      `/tiles/${currentStyle}/`,
      `/tiles/${nextStyle}/`
    );
  }

  return window.L.tileLayer(tileUrlTemplate, {
    attribution: config.attribution ?? defaultConfig.attribution,
    maxZoom: 20
  });
};

const buildMap = (containerId, coordinates, zoom, mapConfig, isDarkMode) => {
  const container = document.getElementById(containerId);

  if (!container || !window.L) {
    return null;
  }

  const tile = container.closest(".tile");

  if (tile) {
    tile.hidden = false;
  }

  const map = window.L.map(containerId, {
    attributionControl: false,
    zoomControl: false,
    dragging: false,
    doubleClickZoom: false,
    scrollWheelZoom: false,
    boxZoom: false,
    keyboard: false,
    touchZoom: false,
    tap: false
  }).setView(coordinates, zoom);

  const layer = createTileLayer(mapConfig, isDarkMode);

  if (layer) {
    layer.addTo(map);
    container._leafletTileLayer = layer;
  }

  return map;
};

const updateMapThemes = (maps, mapConfig, isDarkMode) => {
  maps.forEach((map) => {
    if (!map) {
      return;
    }

    const container = map.getContainer();
    const previousLayer = container._leafletTileLayer;
    const nextLayer = createTileLayer(mapConfig, isDarkMode);

    if (previousLayer) {
      map.removeLayer(previousLayer);
    }

    if (nextLayer) {
      nextLayer.addTo(map);
      container._leafletTileLayer = nextLayer;
    }
  });
};

const applyTheme = (isDarkMode, maps, mapConfig) => {
  document.body.classList.toggle("dark", isDarkMode);
  localStorage.setItem(themeStorageKey, isDarkMode ? "dark" : "light");
  updateMapThemes(maps, mapConfig, isDarkMode);

  maps.forEach((map) => {
    if (map) {
      setTimeout(() => map.invalidateSize(), 150);
    }
  });
};

const initializeTheme = (maps, mapConfig) => {
  const toggle = document.getElementById("theme-switch-input");
  const isDarkMode = (localStorage.getItem(themeStorageKey) ?? "light") === "dark";

  toggle.checked = isDarkMode;
  applyTheme(isDarkMode, maps, mapConfig);

  toggle.addEventListener("change", () => {
    applyTheme(toggle.checked, maps, mapConfig);
  });
};

const initializeCarousel = () => {
  const carousel = document.querySelector(".carousel");
  const galleryTile = document.querySelector(".gallery-tile");

  if (!carousel || !galleryTile) {
    return;
  }

  const slides = [...carousel.querySelectorAll(".img-container")];
  let activeIndex = 0;
  let paused = false;

  carousel.querySelectorAll("img").forEach((image) => {
    image.draggable = false;
  });

  galleryTile.addEventListener("mouseenter", () => {
    paused = true;
  });

  galleryTile.addEventListener("mouseleave", () => {
    paused = false;
  });

  setInterval(() => {
    if (paused) {
      return;
    }

    activeIndex = (activeIndex + 1) % slides.length;
    carousel.scrollTo({
      left: slides[activeIndex].offsetLeft,
      behavior: "smooth",
    });
  }, 3500);
};

const initializeAudioPlayer = () => {
  const playPauseButton = document.getElementById("galgalatz-toggle-button");
  const playIcon = document.getElementById("glglz-play-icon");
  const pauseIcon = document.getElementById("glglz-pause-icon");
  const audioPlayer = document.getElementById("audio-player");

  playPauseButton.addEventListener("click", async () => {
    if (audioPlayer.paused) {
      try {
        await audioPlayer.play();
        playIcon.style.display = "none";
        pauseIcon.style.display = "block";
      } catch (error) {
        console.error("Failed to play audio:", error);
      }
      return;
    }

    audioPlayer.pause();
    playIcon.style.display = "block";
    pauseIcon.style.display = "none";
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  initializeTileReflow();

  try {
    const [config, songs, artists, articles, latestRun, goodreads] = await Promise.all([
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

    const isDarkMode = (localStorage.getItem(themeStorageKey) ?? "light") === "dark";
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
