import { createTileLayer } from "./maps.js";

const decodePolyline = (encoded) => {
  let index = 0;
  let latitude = 0;
  let longitude = 0;
  const coordinates = [];

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const latitudeDelta = result & 1 ? ~(result >> 1) : result >> 1;
    latitude += latitudeDelta;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const longitudeDelta = result & 1 ? ~(result >> 1) : result >> 1;
    longitude += longitudeDelta;

    coordinates.push([latitude / 1e5, longitude / 1e5]);
  }

  return coordinates;
};

export const updateStravaTile = (activity, mapConfig, isDarkMode) => {
  const tile = document.getElementById("strava-tile");

  if (!tile || !activity || !window.L || !activity.polyline) {
    return null;
  }

  const route = decodePolyline(activity.polyline);

  if (route.length === 0) {
    return null;
  }

  tile.hidden = false;
  document.getElementById("strava-topbar-link").href =
    activity.url ?? "https://www.strava.com/";
  document.getElementById("strava-distance").textContent =
    `${activity.distanceKilometers.toFixed(2)} km`;
  document.getElementById("strava-time").textContent =
    activity.movingTimeLabel || "--";
  document.getElementById("strava-pace").textContent =
    activity.paceLabel || "--";

  const map = window.L.map("strava-map", {
    attributionControl: false,
    dragging: false,
    doubleClickZoom: false,
    scrollWheelZoom: false,
    zoomControl: false,
    boxZoom: false,
    keyboard: false,
    tap: false,
    touchZoom: false
  });

  const layer = createTileLayer(mapConfig, isDarkMode);

  if (layer) {
    layer.addTo(map);
    map.getContainer()._leafletTileLayer = layer;
  }

  const polyline = window.L.polyline(route, {
    color: "#fc5200",
    weight: 5,
    opacity: 0.95
  }).addTo(map);

  map.fitBounds(polyline.getBounds(), {
    padding: [18, 18]
  });

  setTimeout(() => map.invalidateSize(), 150);
  return map;
};
