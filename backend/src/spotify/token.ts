import { Axios } from "axios";
import qs from "qs";
import SpotifyConfig from "./model/SpotifyConfig";

let spotifyAccessToken: string | undefined;

export const refreshAccessToken = async (
  http: Axios,
  config: SpotifyConfig
) => {
  console.log("token.ts                 |  010  |  Refreshing access token");
  console.log("token.ts                 |  011  |  ----");

  const url = "https://accounts.spotify.com/api/token";
  const auth = Buffer.from(
    `${config.clientId}:${config.secret}`,
    "binary"
  ).toString("base64");
  const form = {
    grant_type: "client_credentials",
    refresh_token: config.refreshToken,
    // scope: "user-read-recently-played"
  };
  const headers = {
    "content-type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${auth}`,
  };

  console.log(`token.ts                 |  029  |  URL: ${url}`);
  console.log(`token.ts                 |  030  |  Headers: ${JSON.stringify(headers)}`);
  const r = await http.post(url, qs.stringify(form), { headers });
  // console.log("token.ts                 |  032  |  response: ", r.data);
  if (!r.data || r.status != 200) {
    console.log(`token.ts                 |  034  |  Failed to refresh token - ${r.data}`);
    return;
  }
  spotifyAccessToken = r.data.access_token;
  console.log("token.ts                 |  038  |  spotifyAccessToken:   ", spotifyAccessToken);
  return spotifyAccessToken;
};

export const getAccessToken = async (http: Axios, config: SpotifyConfig) => {
  return spotifyAccessToken
    ? spotifyAccessToken
    : await refreshAccessToken(http, config);
};
