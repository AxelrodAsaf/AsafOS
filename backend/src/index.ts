import express from "express";
import cors from "cors";
import Spotify from "./spotify";

const port = process.env.PORT || 3000;
const app = express();
app.use(cors());

const spotify = new Spotify({
  secret: '12821036fe64443ab89af49c5fa2f46c',
  clientId: '212ea1d8208543dd9c65ac6e4a0dad1c',
  refreshToken: "",
});

app.use(function (req, res, next) {
  console.log("index.ts                 |  016  |  +==================== Starting request ====================+");
  console.log("index.ts                 |  017  |  Time: ", Date.now());
  console.log("index.ts                 |  018  |  Request URL: ", req.originalUrl);
  console.log("index.ts                 |  019  |  Request Type: ", req.method);
  console.log("index.ts                 |  020  |  ----");
  next();
});

app.get("/v1/spotify", async function (req, res) {
  return spotify
    .fetchRecentlyPlayed()
    .then((played) => res.send(played))
    .catch((error) => {
      console.log("index.ts                 |  029  |  Error: " + error);
      console.log("index.ts                 |  030  |  ---- ");
      res.status(500).send({ error: error.message });
    });
});

app.listen(port, () => console.log(`🛰️  Listening on port ${port} =============================================+`));
