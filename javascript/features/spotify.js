export const updateSpotifyHero = (song) => {
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

export const updateSpotifySongsList = (songs) => {
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

export const updateSpotifyArtists = (artists) => {
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
