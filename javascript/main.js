const themeStorageKey = "asafos-theme";

const fetchJson = async (path) => {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }

  return response.json();
};

const updateGitHubCard = async () => {
  const response = await fetch("https://api.github.com/users/AxelrodAsaf");

  if (!response.ok) {
    throw new Error(`GitHub request failed with ${response.status}`);
  }

  const profile = await response.json();

  document.getElementById("github-username").textContent =
    profile.login ?? "AxelrodAsaf";
  document.getElementById("github-followers").textContent =
    `Followers: ${profile.followers}`;
  document.getElementById("github-following").textContent =
    `Following: ${profile.following}`;
  document.getElementById("github-repos").textContent =
    `Repos: ${profile.public_repos}`;

  document.getElementById("github-tile").href =
    profile.html_url ?? "https://github.com/AxelrodAsaf/";
};

const updateSpotifyHero = (song) => {
  const tile = document.getElementById("spotify-songs-tile");
  tile.href = song.spotifyUrl;
  tile.querySelector(".spotify-song-title").textContent = song.trackName;
  tile.querySelector(".spotify-song-artist").textContent = song.artistName;

  const image = tile.querySelector("#spotify-album-art");
  image.src = song.albumImage;
  image.alt = `${song.artistName} - ${song.trackName}`;
};

const updateSpotifySongsList = (songs) => {
  const tableBody = document.querySelector("#spotify-songs-table tbody");
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
  const tableBody = document.querySelector("#spotify-artists-table tbody");
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

const updateNews = (articles) => {
  const tableBody = document.getElementById("news-table-body");
  tableBody.innerHTML = "";

  articles.forEach((article) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <a href="${article.link}" target="_blank" rel="noreferrer">${article.title}</a>
        <div class="news-meta">${article.pubDate}</div>
      </td>
      <td>
        <a href="${article.link}" target="_blank" rel="noreferrer">
          <img src="${article.image}" alt="${article.title}">
        </a>
      </td>
    `;
    tableBody.appendChild(row);
  });
};

const buildMap = (containerId, coordinates, zoom) => {
  const container = document.getElementById(containerId);

  if (!container || !window.L) {
    return null;
  }

  const map = window.L.map(containerId, {
    attributionControl: false,
    zoomControl: false
  }).setView(coordinates, zoom);

  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  window.L.marker(coordinates).addTo(map);

  return map;
};

const applyTheme = (isDarkMode, maps) => {
  document.body.classList.toggle("dark", isDarkMode);
  localStorage.setItem(themeStorageKey, isDarkMode ? "dark" : "light");

  maps.forEach((map) => {
    if (map) {
      setTimeout(() => map.invalidateSize(), 150);
    }
  });
};

const initializeTheme = (maps) => {
  const toggle = document.getElementById("theme-switch-input");
  const isDarkMode = (localStorage.getItem(themeStorageKey) ?? "light") === "dark";

  toggle.checked = isDarkMode;
  applyTheme(isDarkMode, maps);

  toggle.addEventListener("change", () => {
    applyTheme(toggle.checked, maps);
  });
};

const initializeCarousel = () => {
  const carousel = document.querySelector(".carousel");

  if (!carousel) {
    return;
  }

  const slides = [...carousel.querySelectorAll(".img-container")];
  let activeIndex = 0;

  setInterval(() => {
    activeIndex = (activeIndex + 1) % slides.length;
    carousel.scrollTo({
      left: slides[activeIndex].offsetLeft,
      behavior: "smooth",
    });
  }, 3500);
};

const initializeAudioPlayer = () => {
  const playPauseButton = document.getElementById("galgalatz");
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
  const maps = [
    buildMap("map-seattle", [47.6252, -122.2021], 9.5),
    buildMap("map-herzliya", [32.1663, 34.8436], 11.5)
  ];

  initializeTheme(maps);
  initializeCarousel();
  initializeAudioPlayer();

  try {
    const [songs, artists, articles] = await Promise.all([
      fetchJson("./recentSongs.json"),
      fetchJson("./topArtists.json"),
      fetchJson("./newsArticles.json")
    ]);

    if (songs.length > 0) {
      updateSpotifyHero(songs[0]);
      updateSpotifySongsList(songs);
    }

    updateSpotifyArtists(artists);
    updateNews(articles);
    await updateGitHubCard();
  } catch (error) {
    console.error("Failed to initialize old-style UI:", error);
  }
});
