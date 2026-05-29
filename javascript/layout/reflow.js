let lastTilePositions = new Map();
let tileReflowFrame = null;
let tileResizeTimeoutId = null;

const tileReflowStartDelayMs = 85;

let currentGridColumns = 5;
let currentTileWidth = 0;

export const getVisibleGridTiles = () => {
  const grid = document.getElementById("grid");

  if (!grid) {
    return [];
  }

  return Array.from(grid.children).filter((tile) => {
    if (!(tile instanceof HTMLElement)) {
      return false;
    }

    if (tile.hidden) {
      return false;
    }

    return window.getComputedStyle(tile).display !== "none";
  });
};

export const captureTilePositions = () => {
  return new Map(
    getVisibleGridTiles().map((tile) => [tile, tile.getBoundingClientRect()])
  );
};

const isRectInViewport = (rect) => {
  return (
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < window.innerHeight &&
    rect.left < window.innerWidth
  );
};

const getResponsiveGridColumns = (viewportWidth = window.innerWidth) => {
  if (viewportWidth <= 670) {
    return 2;
  }

  if (viewportWidth <= 890) {
    return 3;
  }

  if (viewportWidth <= 1120) {
    return 4;
  }

  return 5;
};

const applyResponsiveGridColumns = (columnCount) => {
  const grid = document.getElementById("grid");

  if (!grid) {
    return;
  }

  grid.style.setProperty("--grid-columns", String(columnCount));
};

const getCurrentTileWidth = () => {
  const firstTile = getVisibleGridTiles()[0];

  if (!firstTile) {
    return 0;
  }

  return Math.round(firstTile.getBoundingClientRect().width);
};

const freezeGridFrame = () => {
  const grid = document.getElementById("grid");

  if (!grid) {
    return;
  }

  const rect = grid.getBoundingClientRect();

  grid.style.width = `${rect.width}px`;
  grid.style.height = `${rect.height}px`;
};

const releaseGridFrame = () => {
  const grid = document.getElementById("grid");

  if (!grid) {
    return;
  }

  grid.style.width = "";
  grid.style.height = "";
};

const animateTileReflow = () => {
  const nextPositions = captureTilePositions();

  nextPositions.forEach((nextRect, tile) => {
    const previousRect = lastTilePositions.get(tile);

    if (!previousRect) {
      return;
    }

    if (!isRectInViewport(previousRect) && !isRectInViewport(nextRect)) {
      return;
    }

    const deltaX = previousRect.left - nextRect.left;
    const deltaY = previousRect.top - nextRect.top;

    if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
      return;
    }

    tile.style.transition = "none";
    tile.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    tile.getBoundingClientRect();

    window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        tile.style.transition = "transform 320ms cubic-bezier(0.2, 0.9, 0.25, 1.15)";
        tile.style.transform = "";

        const clearTransition = () => {
          tile.style.transition = "";
          tile.removeEventListener("transitionend", clearTransition);
        };

        tile.addEventListener("transitionend", clearTransition);
      });
    }, tileReflowStartDelayMs);
  });

  lastTilePositions = nextPositions;
};

export const queueTileReflow = () => {
  if (tileReflowFrame !== null) {
    return;
  }

  tileReflowFrame = window.requestAnimationFrame(() => {
    tileReflowFrame = null;
    releaseGridFrame();
    animateTileReflow();
  });
};

export const rememberTilePositions = () => {
  lastTilePositions = captureTilePositions();
};

export const initializeTileReflow = () => {
  currentGridColumns = getResponsiveGridColumns();
  applyResponsiveGridColumns(currentGridColumns);
  lastTilePositions = captureTilePositions();
  currentTileWidth = getCurrentTileWidth();

  window.addEventListener("resize", () => {
    const nextGridColumns = getResponsiveGridColumns();
    const nextTileWidth = getCurrentTileWidth();

    if (
      nextGridColumns === currentGridColumns &&
      nextTileWidth === currentTileWidth
    ) {
      return;
    }

    if (tileResizeTimeoutId === null) {
      lastTilePositions = captureTilePositions();
      freezeGridFrame();
    }

    window.clearTimeout(tileResizeTimeoutId);
    tileResizeTimeoutId = window.setTimeout(() => {
      tileResizeTimeoutId = null;
      currentGridColumns = getResponsiveGridColumns();
      applyResponsiveGridColumns(currentGridColumns);
      currentTileWidth = getCurrentTileWidth();
      queueTileReflow();
    }, 40);
  });
};
