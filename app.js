const THEME_STORAGE_KEY = "asafos-codex-theme";

const readJson = async (path) => {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }

  return response.json();
};

const renderLinks = (container, links, className) => {
  container.innerHTML = "";

  links.forEach((link) => {
    const anchor = document.createElement("a");
    anchor.className = className;
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.textContent = link.label;
    container.appendChild(anchor);
  });
};

const renderProfile = (profile) => {
  document.getElementById("hero-name").textContent = profile.name;
  document.getElementById("hero-location").textContent = profile.location;
  document.getElementById("hero-title").textContent = profile.title;
  document.getElementById("hero-summary").textContent = profile.summary;
  document.getElementById("hero-current").textContent = profile.current;
  document.getElementById("hero-open-to").textContent = profile.openTo;

  renderLinks(
    document.getElementById("hero-actions"),
    profile.primaryLinks,
    "button-link button-link--primary"
  );

  const aboutList = document.getElementById("about-list");
  aboutList.innerHTML = "";
  profile.about.forEach((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    aboutList.appendChild(p);
  });

  const highlightsList = document.getElementById("highlights-list");
  highlightsList.innerHTML = "";
  profile.highlights.forEach((highlight) => {
    const item = document.createElement("li");
    item.textContent = highlight;
    highlightsList.appendChild(item);
  });

  const experienceList = document.getElementById("experience-list");
  experienceList.innerHTML = "";
  profile.experience.forEach((item) => {
    const article = document.createElement("article");
    article.className = "timeline-item";
    article.innerHTML = `
      <div class="timeline-item__header">
        <h3 class="timeline-item__title">${item.role} · ${item.company}</h3>
        <span class="timeline-item__range">${item.range}</span>
      </div>
      <p class="timeline-item__meta">${item.summary}</p>
    `;
    experienceList.appendChild(article);
  });

  const educationList = document.getElementById("education-list");
  educationList.innerHTML = "";
  profile.education.forEach((item) => {
    const article = document.createElement("article");
    article.className = "stack-item";
    article.innerHTML = `
      <div class="stack-item__header">
        <h3 class="stack-item__title">${item.title}</h3>
        <span class="stack-item__range">${item.range}</span>
      </div>
      <p class="stack-item__meta">${item.summary}</p>
    `;
    educationList.appendChild(article);
  });

  renderLinks(
    document.getElementById("profile-links"),
    profile.secondaryLinks,
    "profile-link"
  );

  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";
  profile.gallery.forEach((image) => {
    const img = document.createElement("img");
    img.src = image.src;
    img.alt = image.alt;
    gallery.appendChild(img);
  });
};

const renderGithub = async (username) => {
  const response = await fetch(`https://api.github.com/users/${username}`);

  if (!response.ok) {
    throw new Error(`GitHub request failed with ${response.status}`);
  }

  const profile = await response.json();

  document.getElementById("github-name").textContent =
    profile.name ?? profile.login;

  const metrics = [
    { label: "Followers", value: profile.followers },
    { label: "Following", value: profile.following },
    { label: "Public repos", value: profile.public_repos },
  ];

  const metricsContainer = document.getElementById("github-metrics");
  metricsContainer.innerHTML = "";

  metrics.forEach((metric) => {
    const div = document.createElement("div");
    div.className = "metric";
    div.innerHTML = `
      <span>${metric.label}</span>
      <strong class="metric__value">${metric.value}</strong>
    `;
    metricsContainer.appendChild(div);
  });
};

const renderSpotifyNowPlaying = async (fallbackSong) => {
  const container = document.getElementById("spotify-now-playing");
  const spotifyEndpoint = window.ASAFOS_SPOTIFY_ENDPOINT ?? "";
  let song = fallbackSong;

  if (spotifyEndpoint) {
    try {
      const response = await fetch(spotifyEndpoint);

      if (response.ok) {
        song = await response.json();
      }
    } catch {
      song = fallbackSong;
    }
  }

  container.innerHTML = `
    <img src="${song.imageUrl}" alt="${song.name}">
    <div>
      <h3 class="spotify-now__title">${song.name}</h3>
      <p class="spotify-now__artist">${song.artistName}</p>
      <a class="spotify-now__link" href="${song.url}" target="_blank" rel="noreferrer">
        Open in Spotify
      </a>
    </div>
  `;
};

const renderMediaList = (containerId, items, badgeLabel) => {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  items.forEach((item) => {
    const article = document.createElement("article");
    article.className = "list-item list-item--media";
    article.innerHTML = `
      <img src="${item.imageUrl}" alt="${item.name}">
      <div>
        <div class="list-item__header">
          <h3 class="list-item__title">${item.name}</h3>
          ${
            badgeLabel
              ? `<span class="list-item__badge">${badgeLabel}</span>`
              : ""
          }
        </div>
        <p class="list-item__meta">${item.artistName}</p>
      </div>
    `;

    const link = document.createElement("a");
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.appendChild(article);
    container.appendChild(link);
  });
};

const renderArtistList = (artists) => {
  const container = document.getElementById("top-artists-list");
  container.innerHTML = "";

  artists.forEach((artist) => {
    const anchor = document.createElement("a");
    anchor.href = artist.url;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.innerHTML = `
      <article class="list-item list-item--media">
        <img src="${artist.imageUrl}" alt="${artist.name}">
        <div>
          <h3 class="list-item__title">${artist.name}</h3>
          <p class="list-item__meta">Spotify artist profile</p>
        </div>
      </article>
    `;
    container.appendChild(anchor);
  });
};

const renderUpdates = (updates) => {
  const container = document.getElementById("updates-list");
  container.innerHTML = "";

  updates.forEach((update) => {
    const article = document.createElement("article");
    article.className = "list-item";
    article.innerHTML = `
      <div class="list-item__header">
        <h3 class="list-item__title">${update.title}</h3>
        <span class="list-item__badge">${update.date}</span>
      </div>
      <p class="list-item__meta">${update.summary}</p>
    `;
    container.appendChild(article);
  });
};

const setTheme = (theme) => {
  document.body.dataset.theme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  document.getElementById("theme-toggle-value").textContent =
    theme === "light" ? "Light" : "Dark";
};

const initializeTheme = () => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) ?? "dark";
  setTheme(savedTheme);

  document.getElementById("theme-toggle").addEventListener("click", () => {
    setTheme(document.body.dataset.theme === "light" ? "dark" : "light");
  });
};

const main = async () => {
  initializeTheme();

  const [profile, recentSongs, topArtists, updates] = await Promise.all([
    readJson("./data/site-content.json"),
    readJson("./data/recent-songs.json"),
    readJson("./data/top-artists.json"),
    readJson("./data/updates.json"),
  ]);

  renderProfile(profile);
  renderMediaList("recent-songs-list", recentSongs, "Recent");
  renderArtistList(topArtists);
  renderUpdates(updates);
  await Promise.all([
    renderGithub(profile.githubUsername),
    renderSpotifyNowPlaying(recentSongs[0]),
  ]);
};

main().catch((error) => {
  console.error(error);
});
