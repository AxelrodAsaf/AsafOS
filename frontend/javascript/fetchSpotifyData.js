// Function to fetch Spotify data
export async function fetchSpotifyData(credentials) {
  try {
    // Base64 encode the client id and client secret for authorization
    const encodedCredentials = btoa(`${credentials.spotifyClientID}:${credentials.spotifyClientSecret}`);

    // Request token from Spotify API
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${encodedCredentials}`
      },
      body: 'grant_type=client_credentials'
    });

    // Check if token request was successful
    if (!tokenResponse.ok) {
      throw new Error('Failed to obtain Spotify access token');
    }

    // Parse token response data
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch top artists using the obtained access token
    const topArtistsResponse = await fetch('https://api.spotify.com/v1/me/top/artists', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    // Check if fetching top artists was successful
    if (!topArtistsResponse.ok) {
      throw new Error('Failed to fetch top artists from Spotify API');
    }

    // Parse top artists response data
    const topArtistsData = await topArtistsResponse.json();

    // Fetch recently played songs using the obtained access token
    const recentlyPlayedResponse = await fetch('https://api.spotify.com/v1/me/player/recently-played', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    // Check if fetching recently played songs was successful
    if (!recentlyPlayedResponse.ok) {
      throw new Error('Failed to fetch recently played songs from Spotify API');
    }

    // Parse recently played songs response data
    const recentlyPlayedData = await recentlyPlayedResponse.json();

    // Combine fetched data into a single object
    const data = {
      artists: topArtistsData.items,
      songs: recentlyPlayedData.items
    };

    return data;
  } catch (error) {
    // Handle and log any errors that occur during Spotify API requests
    console.error('Error fetching Spotify data:', error);
    throw error;
  }
}

// Function to load credentials from credentials.json file
async function loadCredentials(filePath) {
  try {
    const response = await fetch(filePath); // Fetch credentials.json file
    const data = await response.json(); // Parse JSON data from the response
    return data; // Return the parsed credentials object
  } catch (error) {
    // Handle and log any errors that occur during credentials loading
    console.error('Error fetching or parsing credentials.json:', error);
    throw error;
  }
}

// Entry point of the application
async function main() {
  try {
    // Load credentials from credentials.json
    const credentials = await loadCredentials('credentials.json');

    // Fetch Spotify data using fetchSpotifyData function with credentials
    const { artists, songs } = await fetchSpotifyData(credentials);

    // Log fetched top artists and recently played songs data
    console.log('Top Artists:', JSON.stringify(artists, null, 2));
    console.log('Recently Played Songs:', JSON.stringify(songs, null, 2));
  } catch (error) {
    // Handle and log any errors that occur during the main process
    console.error('Error:', error);
  }
}

// Run the main function to start fetching Spotify data
main();
