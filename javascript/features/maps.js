export const createTileLayer = (mapConfig, isDarkMode) => {
  const defaultConfig = {
    tileUrlTemplate: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  };

  if (!window.L) {
    return null;
  }

  const config = mapConfig ?? defaultConfig;
  let tileUrlTemplate = config.tileUrlTemplate ?? defaultConfig.tileUrlTemplate;

  if (config.provider === "stadia") {
    const currentStyle = config.style ?? "alidade_smooth";
    const nextStyle = isDarkMode
      ? currentStyle.replace("_dark", "") + "_dark"
      : currentStyle.replace("_dark", "");

    tileUrlTemplate = tileUrlTemplate.replace(
      `/tiles/${currentStyle}/`,
      `/tiles/${nextStyle}/`
    );
  }

  return window.L.tileLayer(tileUrlTemplate, {
    attribution: config.attribution ?? defaultConfig.attribution,
    maxZoom: 20
  });
};

export const buildMap = (containerId, coordinates, zoom, mapConfig, isDarkMode) => {
  const container = document.getElementById(containerId);

  if (!container || !window.L) {
    return null;
  }

  const tile = container.closest(".tile");

  if (tile) {
    tile.hidden = false;
  }

  const map = window.L.map(containerId, {
    attributionControl: false,
    zoomControl: false,
    dragging: false,
    doubleClickZoom: false,
    scrollWheelZoom: false,
    boxZoom: false,
    keyboard: false,
    touchZoom: false,
    tap: false
  }).setView(coordinates, zoom);

  const layer = createTileLayer(mapConfig, isDarkMode);

  if (layer) {
    layer.addTo(map);
    container._leafletTileLayer = layer;
  }

  return map;
};

export const updateMapThemes = (maps, mapConfig, isDarkMode) => {
  maps.forEach((map) => {
    if (!map) {
      return;
    }

    const container = map.getContainer();
    const previousLayer = container._leafletTileLayer;
    const nextLayer = createTileLayer(mapConfig, isDarkMode);

    if (previousLayer) {
      map.removeLayer(previousLayer);
    }

    if (nextLayer) {
      nextLayer.addTo(map);
      container._leafletTileLayer = nextLayer;
    }
  });
};
