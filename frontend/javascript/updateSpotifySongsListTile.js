export function updateSpotifySongsListTile() {
  fetch('./recentSongs.json')
    .then(response => response.json())
    .then(data => {
      const spotifySongsTable = document.getElementById('spotify-songs-table').querySelector('tbody');
      spotifySongsTable.innerHTML = '';

      data.forEach(song => {
        const row = document.createElement('tr');

        // Create cell for album picture
        const pictureCell = document.createElement('td');
        const albumLink = document.createElement('a');
        albumLink.href = song.spotifyUrl;
        albumLink.target = "_blank";
        const albumPicture = document.createElement('img');
        albumPicture.src = song.albumImage;
        albumPicture.alt = `${song.artistName} - ${song.trackName} Album Cover`;
        albumPicture.style.width = '75%';
        albumPicture.style.height = albumPicture.style.width;
        albumLink.appendChild(albumPicture);
        pictureCell.appendChild(albumLink);

        // Create cell for track name
        const trackCell = document.createElement('td');
        const trackLink = document.createElement('a');
        trackLink.href = song.spotifyUrl;
        trackLink.textContent = song.trackName;
        trackLink.target = "_blank";
        trackCell.appendChild(trackLink);

        // Create cell for artist name
        const artistCell = document.createElement('td');
        artistCell.textContent = song.artistName;

        // Append cells to row
        row.appendChild(pictureCell);
        row.appendChild(trackCell);
        row.appendChild(artistCell);

        // Append row to table
        spotifySongsTable.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Error fetching or parsing recentSongs.json:', error);
    });
}
