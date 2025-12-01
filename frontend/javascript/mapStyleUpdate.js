export function updateMapStyle(mapStyle) {
  const mapTilesURL = `https://tiles.stadiamaps.com/tiles/${mapStyle}/{z}/{x}/{y}{r}.png`;

  const seattleMapElement = document.getElementById('map-seattle');
  const herzliyaMapElement = document.getElementById('map-herzliya');

  if (seattleMapElement) {
    if (!seattleMapElement._leaflet_map) {
      const seattleMap = L.map(seattleMapElement).setView([47.6252, -122.2021], 9.5);
      seattleMapElement._leaflet_map = seattleMap;
    }
    L.tileLayer(mapTilesURL, { maxZoom: 20 }).addTo(seattleMapElement._leaflet_map);
  } else {
    console.error('Element with id map-seattle not found.');
  }

  if (herzliyaMapElement) {
    if (!herzliyaMapElement._leaflet_map) {
      const herzliyaMap = L.map(herzliyaMapElement).setView([32.1663, 34.8436], 11.5);
      herzliyaMapElement._leaflet_map = herzliyaMap;
    }
    L.tileLayer(mapTilesURL, { maxZoom: 20 }).addTo(herzliyaMapElement._leaflet_map);
  } else {
    console.error('Element with id map-herzliya not found.');
  }
}

updateMapStyle('alidade_smooth_dark');
