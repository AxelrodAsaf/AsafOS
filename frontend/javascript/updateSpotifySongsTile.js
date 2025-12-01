export function updateSpotifySongsTile() {
  fetch('././recentSongs.json')
    .then(response => response.json())
    .then(data => {
      const spotifySongTile = document.getElementById('spotify-songs-tile');
      const songTitleElement = spotifySongTile.querySelector('.spotify-song-title');
      const songArtistElement = spotifySongTile.querySelector('.spotify-song-artist');
      const songAlbumArtElement = spotifySongTile.querySelector('#spotify-album-art');

      if (data.length > 0) {
        const latestSong = data[0];
        songTitleElement.textContent = latestSong.trackName;
        songArtistElement.textContent = latestSong.artistName;
        songAlbumArtElement.src = latestSong.albumImage;
        songAlbumArtElement.alt = `${latestSong.artistName} - ${latestSong.trackName} Album Cover`;

        spotifySongTile.href = latestSong.spotifyUrl;
      } else {
        songTitleElement.textContent = '';
        songArtistElement.textContent = '';
        songAlbumArtElement.src = './assets/SPOTIFY.png';
        songAlbumArtElement.alt = 'Album Cover';
      }
    })
    .catch(error => {
      console.error('Error fetching or parsing recentSongs.json:', error);
    });
}
