export function updateSpotifyArtistsTile() {
  fetch('././topArtists.json')
    .then(response => response.json())
    .then(data => {
      const spotifyArtistsTable = document.getElementById('spotify-artists-table').querySelector('tbody');
      spotifyArtistsTable.innerHTML = '';

      data.forEach((artist, index) => {
        // Create row for artist picture
        const pictureRow = document.createElement('tr');
        const pictureCell = document.createElement('td');
        const artistLink = document.createElement('a');
        artistLink.href = artist.artistUrl;
        artistLink.target = "_blank";
        const artistPicture = document.createElement('img');
        artistPicture.src = artist.artistImage;
        artistPicture.alt = `${artist.artistName} Picture`;
        artistLink.appendChild(artistPicture);
        pictureCell.appendChild(artistLink);
        pictureRow.appendChild(pictureCell);

        // Create row for artist name
        const nameRow = document.createElement('tr');
        const nameCell = document.createElement('td');
        const nameLink = document.createElement('a');
        nameLink.href = artist.artistUrl;
        nameLink.textContent = artist.artistName;
        nameLink.target = "_blank";
        nameCell.appendChild(nameLink);
        nameRow.appendChild(nameCell);

        // Append rows to table
        spotifyArtistsTable.appendChild(pictureRow);
        spotifyArtistsTable.appendChild(nameRow);

        // Add a separator div after each artist except the last one
        if (index < data.length - 1) {
          const separatorRow = document.createElement('tr');
          const separatorCell = document.createElement('td');
          const separatorDiv = document.createElement('div');
          separatorDiv.className = 'artistSpacerLine';
          separatorCell.appendChild(separatorDiv);
          separatorRow.appendChild(separatorCell);
          spotifyArtistsTable.appendChild(separatorRow);
        }
      });
    })
    .catch(error => {
      console.error('Error fetching or parsing topArtists.json:', error);
    });
}
