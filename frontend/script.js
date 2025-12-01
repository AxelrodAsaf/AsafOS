document.addEventListener("DOMContentLoaded", function () {
  // function updateSpotifyArtistsTile() {
  //   fetch('./topArtists.json')
  //     .then(response => response.json())
  //     .then(data => {
  //       const spotifyArtistsTable = document.getElementById('spotify-artists-table').querySelector('tbody');
  //       spotifyArtistsTable.innerHTML = '';

  //       data.forEach((artist, index) => {
  //         // Create row for artist picture
  //         const pictureRow = document.createElement('tr');
  //         const pictureCell = document.createElement('td');
  //         const artistLink = document.createElement('a');
  //         artistLink.href = artist.artistUrl;
  //         artistLink.target = "_blank";
  //         const artistPicture = document.createElement('img');
  //         artistPicture.src = artist.artistImage;
  //         artistPicture.alt = `${artist.artistName} Picture`;
  //         artistLink.appendChild(artistPicture);
  //         pictureCell.appendChild(artistLink);
  //         pictureRow.appendChild(pictureCell);

  //         // Create row for artist name
  //         const nameRow = document.createElement('tr');
  //         const nameCell = document.createElement('td');
  //         const nameLink = document.createElement('a');
  //         nameLink.href = artist.artistUrl;
  //         nameLink.textContent = artist.artistName;
  //         nameLink.target = "_blank";
  //         nameCell.appendChild(nameLink);
  //         nameRow.appendChild(nameCell);

  //         // Append rows to table
  //         spotifyArtistsTable.appendChild(pictureRow);
  //         spotifyArtistsTable.appendChild(nameRow);

  //         // Add a separator div after each artist except the last one
  //         if (index < data.length - 1) {
  //           const separatorRow = document.createElement('tr');
  //           const separatorCell = document.createElement('td');
  //           const separatorDiv = document.createElement('div');
  //           separatorDiv.className = 'artistSpacerLine';
  //           separatorCell.appendChild(separatorDiv);
  //           separatorRow.appendChild(separatorCell);
  //           spotifyArtistsTable.appendChild(separatorRow);
  //         }
  //       });
  //     })
  //     .catch(error => {
  //       console.error('Error fetching or parsing topArtists.json:', error);
  //     });
  // }
  // function updateSpotifySongsTile() {
  //   // Fetch the recentSongs.json file
  //   fetch('./recentSongs.json')
  //     .then(response => response.json())
  //     .then(data => {
  //       // Update the Spotify songs tile with the latest song data
  //       const spotifySongTile = document.getElementById('spotify-songs-tile');
  //       const songTitleElement = spotifySongTile.querySelector('.spotify-song-title');
  //       const songArtistElement = spotifySongTile.querySelector('.spotify-song-artist');
  //       const songAlbumArtElement = spotifySongTile.querySelector('#spotify-album-art');

  //       if (data.length > 0) {
  //         const latestSong = data[0]; // Assuming the first song in the array is the latest
  //         songTitleElement.textContent = latestSong.trackName;
  //         songArtistElement.textContent = latestSong.artistName;
  //         songAlbumArtElement.src = latestSong.albumImage;
  //         songAlbumArtElement.alt = `${latestSong.artistName} - ${latestSong.trackName} Album Cover`;

  //         // Update the Spotify tile link and song URL
  //         spotifySongTile.href = latestSong.spotifyUrl;
  //       } else {
  //         // Clear the tile if there's no data
  //         songTitleElement.textContent = '';
  //         songArtistElement.textContent = '';
  //         songAlbumArtElement.src = './assets/SPOTIFY.png';
  //         songAlbumArtElement.alt = 'Album Cover';
  //       }
  //     })
  //     .catch(error => {
  //       console.error('Error fetching or parsing recentSongs.json:', error);
  //     });
  // }
  // function updateSpotifySongsListTile() {
  //   // Fetch the recentSongs.json file
  //   fetch('./recentSongs.json')
  //     .then(response => response.json())
  //     .then(data => {
  //       // Update the table of recently played songs
  //       const spotifySongsTable = document.getElementById('spotify-songs-table').querySelector('tbody');
  //       spotifySongsTable.innerHTML = ''; // Clear any existing rows

  //       data.forEach(song => {
  //         const row = document.createElement('tr');

  //         // Create cell for album picture
  //         const pictureCell = document.createElement('td');
  //         const albumLink = document.createElement('a');
  //         albumLink.href = song.spotifyUrl;
  //         albumLink.target = "_blank"; // Open link in new tab
  //         const albumPicture = document.createElement('img');
  //         albumPicture.src = song.albumImage;
  //         albumPicture.alt = `${song.artistName} - ${song.trackName} Album Cover`;
  //         albumPicture.style.width = '75%'; // Adjust width as needed
  //         albumPicture.style.height = albumPicture.style.width;
  //         albumLink.appendChild(albumPicture);
  //         pictureCell.appendChild(albumLink);

  //         // Create cell for track name
  //         const trackCell = document.createElement('td');
  //         const trackLink = document.createElement('a');
  //         trackLink.href = song.spotifyUrl;
  //         trackLink.textContent = song.trackName;
  //         trackLink.target = "_blank"; // Open link in new tab
  //         trackCell.appendChild(trackLink);

  //         // Create cell for artist name
  //         const artistCell = document.createElement('td');
  //         artistCell.textContent = song.artistName;

  //         // Append cells to row
  //         row.appendChild(pictureCell);
  //         row.appendChild(trackCell);
  //         row.appendChild(artistCell);

  //         // Append row to table
  //         spotifySongsTable.appendChild(row);
  //       });
  //     })
  //     .catch(error => {
  //       console.error('Error fetching or parsing recentSongs.json:', error);
  //     });
  // }

  // // Call the update functions when the DOM is fully loaded
  // updateSpotifyArtistsTile();
  // updateSpotifySongsTile();
  // updateSpotifySongsListTile();

});
