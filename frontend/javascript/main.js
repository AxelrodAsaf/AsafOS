import { fetchSpotifyData } from './fetchSpotifyData.js';
import { updateSpotifyArtistsTile } from './updateSpotifyArtistsTile.js';
import { updateSpotifySongsTile } from './updateSpotifySongsTile.js';
import { updateSpotifySongsListTile } from './updateSpotifySongsListTile.js';
import { fetchGitHubInfo } from './githubInfo.js';
import { updateMapStyle } from './mapStyleUpdate.js';
import './newsArticles.js';
import './imageCarousel.js';
import './scrollNews.js';
// import './scrollArtists.js';
// import './scrollSongs.js';

document.addEventListener('DOMContentLoaded', async function () {
  try {
    // GitHub information retrieval
    let temp = fetchGitHubInfo('axelrodasaf');

    // Fetch Spotify data and update tiles
    const { artists, songs } = await fetchSpotifyData();
    // updateSpotifyArtistsTile(artists);
    // updateSpotifySongsTile(songs);
    // updateSpotifySongsListTile(songs);
  } catch (error) {
    console.error('Error:', error);
  }

  function updateTheme(isDarkMode) {
    const mapStyle = isDarkMode ? 'alidade_smooth_dark' : 'alidade_smooth';
    // dynatraceImg.src = isDarkMode ? './assets/DYNATRACEWHITE.png' : './assets/DYNATRACE.png';

    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    updateMapStyle(mapStyle);
  }

  // Theme switch functionality
  const toggle = document.getElementById('theme-switch-input');
  // const dynatraceImg = document.getElementById('dynatrace-img');

  if (toggle) {
    toggle.addEventListener('click', function () {
      const isDarkMode = toggle.checked;
      updateTheme(isDarkMode);
    });
  } else {
    console.error('Element with id "theme-switch-input" not found.');
  }



  const auth_link = "https://www.strava.com/oaut/token";

  function getActivites(res) {
    const activities_link = `https://www.strava.com/api/v3/athlete/activities?access_token=${res.access_token}`;
    fetch(activities_link)
      .then((res) => console.log(res.json()));
  }

  function reAuthorize() {
    // Fetch credentials from credentials.json
    fetch('./credentials.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(credentials => {
        // Access credentials here
        const stravaClientId = credentials.stravaClientId;
        const stravaClientSecret = credentials.stravaClientSecret;
        const stravaRefreshToken = credentials.stravaRefreshToken;

        // Use the credentials in the request
        fetch(auth_link, {
          method: 'post',
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            client_id: stravaClientId,
            client_secret: stravaClientSecret,
            refresh_token: stravaRefreshToken,
            grant_type: 'refresh_token'
          })
        })
          .then(res => res.json())
          .then(res => console.log(res))
          .then(res => getActivites(res))
          .then(res => console.log(res))
          .catch(error => console.error('Error during Strava API interaction:', error));
      })
      .catch(error => console.error('Error fetching credentials:', error));
  }

  reAuthorize();



});
