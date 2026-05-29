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

const formatTickLabel = (seconds) => {
  const roundedSeconds = Math.max(0, Math.round(seconds));
  const totalMinutes = Math.floor(roundedSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}:${String(minutes).padStart(2, "0")}`;
};

const buildChartGeometry = (points) => {
  if (!points || points.length === 0) {
    return {
      linePath: "",
      areaPath: "",
      xAxis: null,
      yAxis: null,
      ticks: [],
      yLabels: []
    };
  }

  const minTime = points[0].timeSeconds;
  const maxTime = points[points.length - 1].timeSeconds;
  const minHeartRate = Math.min(...points.map((point) => point.heartRate));
  const maxHeartRate = Math.max(...points.map((point) => point.heartRate));
  const timeRange = Math.max(1, maxTime - minTime);
  const heartRateRange = Math.max(1, maxHeartRate - minHeartRate);
  const left = 10;
  const right = 92;
  const top = 22;
  const bottom = 68;

  const coordinates = points.map((point) => {
    const x = left + ((point.timeSeconds - minTime) / timeRange) * (right - left);
    const y =
      bottom -
      ((point.heartRate - minHeartRate) / heartRateRange) * (bottom - top);

    return [x, y];
  });

  const linePath = coordinates
    .map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");
  const areaPath = `${linePath} L ${coordinates[coordinates.length - 1][0].toFixed(2)} ${bottom} L ${coordinates[0][0].toFixed(2)} ${bottom} Z`;

  const tickCount = 4;
  const ticks = Array.from({ length: tickCount + 1 }, (_, index) => {
    const ratio = index / tickCount;
    const x = left + ratio * (right - left);
    const timeSeconds = ratio * timeRange;

    return {
      x,
      label: formatTickLabel(timeSeconds)
    };
  });

  const yLabels = Array.from({ length: 3 }, (_, index) => {
    const ratio = index / 2;
    const heartRate = Math.round(maxHeartRate - ratio * heartRateRange);
    const y = top + ratio * (bottom - top);

    return {
      y,
      label: String(heartRate)
    };
  });

  return {
    linePath,
    areaPath,
    xAxis: { x1: left, y1: bottom, x2: right, y2: bottom },
    yAxis: { x1: left, y1: top, x2: left, y2: bottom },
    ticks,
    yLabels,
    top,
    bottom,
    left,
    right,
    minHeartRate,
    heartRateRange
  };
};

export const updateStravaActivityTile = (activity) => {
  const tile = document.getElementById("strava-activity-tile");

  if (!tile || !activity || !Array.isArray(activity.chartPoints) || activity.chartPoints.length === 0) {
    return;
  }

  tile.hidden = false;
  document.getElementById("strava-activity-topbar-link").href =
    activity.url ?? "https://www.strava.com/";
  document.getElementById("strava-activity-time").textContent =
    activity.movingTimeLabel || "--";
  document.getElementById("strava-activity-avg-hr").textContent =
    activity.averageHeartRate ? `${activity.averageHeartRate} bpm` : "--";
  document.getElementById("strava-activity-max-hr").textContent =
    activity.maxHeartRate ? `${activity.maxHeartRate} bpm` : "--";

  const {
    linePath,
    areaPath,
    xAxis,
    yAxis,
    ticks,
    yLabels,
    top,
    bottom,
    left,
    right,
    minHeartRate,
    heartRateRange
  } = buildChartGeometry(activity.chartPoints);
  document.getElementById("strava-activity-line").setAttribute("d", linePath);
  document.getElementById("strava-activity-area").setAttribute("d", areaPath);

  const xAxisElement = document.getElementById("strava-activity-axis-x");
  const yAxisElement = document.getElementById("strava-activity-axis-y");
  const ticksGroup = document.getElementById("strava-activity-axis-ticks");
  const yLabelsGroup = document.getElementById("strava-activity-axis-y-labels");
  const avgLineElement = document.getElementById("strava-activity-avg-line");
  const maxLineElement = document.getElementById("strava-activity-max-line");

  if (
    xAxis &&
    yAxis &&
    xAxisElement &&
    yAxisElement &&
    ticksGroup &&
    yLabelsGroup &&
    avgLineElement &&
    maxLineElement
  ) {
    xAxisElement.setAttribute("x1", xAxis.x1);
    xAxisElement.setAttribute("y1", xAxis.y1);
    xAxisElement.setAttribute("x2", xAxis.x2);
    xAxisElement.setAttribute("y2", xAxis.y2);

    yAxisElement.setAttribute("x1", yAxis.x1);
    yAxisElement.setAttribute("y1", yAxis.y1);
    yAxisElement.setAttribute("x2", yAxis.x2);
    yAxisElement.setAttribute("y2", yAxis.y2);

    const toChartY = (heartRate) =>
      bottom - ((heartRate - minHeartRate) / heartRateRange) * (bottom - top);

    const averageHeartRate = Number(activity.averageHeartRate);
    const maxHeartRate = Number(activity.maxHeartRate);
    const avgY = Number.isFinite(averageHeartRate) ? toChartY(averageHeartRate) : null;
    const maxY = Number.isFinite(maxHeartRate) ? toChartY(maxHeartRate) : null;

    const setReferenceLine = (element, y) => {
      if (!Number.isFinite(y)) {
        element.setAttribute("x1", "0");
        element.setAttribute("y1", "0");
        element.setAttribute("x2", "0");
        element.setAttribute("y2", "0");
        return;
      }

      element.setAttribute("x1", left);
      element.setAttribute("y1", y.toFixed(2));
      element.setAttribute("x2", right);
      element.setAttribute("y2", y.toFixed(2));
    };

    setReferenceLine(avgLineElement, avgY);
    setReferenceLine(maxLineElement, maxY);

    ticksGroup.innerHTML = ticks
      .map(
        ({ x, label }) => `
          <line class="strava-activity-tick-mark" x1="${x.toFixed(2)}" y1="${xAxis.y1}" x2="${x.toFixed(2)}" y2="${(xAxis.y1 + 2.8).toFixed(2)}"></line>
          <text class="strava-activity-tick-label" x="${x.toFixed(2)}" y="${(xAxis.y1 + 7.4).toFixed(2)}" text-anchor="middle">${label}</text>
        `
      )
      .join("");

    yLabelsGroup.innerHTML = yLabels
      .map(
        ({ y, label }) => `
          <text class="strava-activity-y-label" x="${(left - 1.4).toFixed(2)}" y="${(y + 1.2).toFixed(2)}" text-anchor="end">${label}</text>
        `
      )
      .join("");
  }

  const label = activity.sportType
    ? `Latest Activity (${activity.sportType})`
    : "Latest Activity";
  const labelElement = document.querySelector("#strava-activity-topbar-link .strava-label");

  if (labelElement) {
    labelElement.textContent = label;
  }
};
