import { Axios } from "axios";
import RecentlyPlayed from "./model/RecentlyPlayed";
import SpotifyConfig from "./model/SpotifyConfig";
import { getAccessToken } from "./token";

export const fetchRecentlyPlayed = async (
  http: Axios,
  config: SpotifyConfig
): Promise<RecentlyPlayed | undefined> => {
  console.log("fetch-recently-played.ts |  010  |  Getting an access token...");
  const accessToken = await getAccessToken(http, config);
  console.log("fetch-recently-played.ts |  010  |  Received access token: " + accessToken);
  // const url = "https://api.spotify.com/v1/me/player/recently-played?limit=1";
  const url = "https://api.spotify.com/v1/me/";
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };


  console.log("fetch-recently-played.ts |  019  |  Making a request to the url: " + url);
  const response = await http.get(url, { headers });
  console.log("XXXXXXXXXXXXXXXXXXXXXXXX------------ IT WORKED! Response: " + response);

  if (!response.data || response.status !== 200) {
    throw new Error("Non 200 status received when fetching recently played.");
  }

  const track = response.data.items[0].track;
  return {
    name: track.name,
    url: track.external_urls.spotify,
    imageUrl: track.album.images[0].url,
    previewUrl: track.preview_url,
    artistName: track.album.artists[0].name,
  };
};
