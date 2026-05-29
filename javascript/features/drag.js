import {
  getVisibleGridTiles,
  queueTileReflow,
  rememberTilePositions
} from "../layout/reflow.js";

const dragThresholdPx = 8;

const getTileKey = (tile, index) => {
  if (!tile.dataset.tileKey) {
    tile.dataset.tileKey = tile.id || `tile-${index}`;
  }

  return tile.dataset.tileKey;
};

const getTileSpan = (tile) => {
  if (tile.classList.contains("large-long-tile")) {
    return { w: 2, h: 3 };
  }

  if (tile.classList.contains("large-tile")) {
    return { w: 2, h: 2 };
  }

  if (tile.classList.contains("long-tile")) {
    return { w: 2, h: 1 };
  }

  if (tile.classList.contains("tall-tile")) {
    return { w: 1, h: 2 };
  }

  return { w: 1, h: 1 };
};

const isInteractiveTarget = (target) => {
  return Boolean(target.closest("a, button, input, textarea, select, label"));
};

const rectsOverlap = (a, b) => {
  return !(
    a.x + a.w <= b.x ||
    b.x + b.w <= a.x ||
    a.y + a.h <= b.y ||
    b.y + b.h <= a.y
  );
};

const canPlace = (layout, id, nextRect, columns) => {
  if (nextRect.x < 0 || nextRect.y < 0 || nextRect.x + nextRect.w > columns) {
    return false;
  }

  return Array.from(layout.entries()).every(([otherId, otherRect]) => {
    if (otherId === id) {
      return true;
    }

    return !rectsOverlap(nextRect, otherRect);
  });
};

const findFirstFit = (layout, id, span, columns) => {
  for (let y = 0; y < 200; y += 1) {
    for (let x = 0; x <= columns - span.w; x += 1) {
      const nextRect = { x, y, ...span };

      if (canPlace(layout, id, nextRect, columns)) {
        return nextRect;
      }
    }
  }

  return { x: 0, y: 0, ...span };
};

const getGridMetrics = (grid) => {
  const styles = window.getComputedStyle(grid);
  const columns = Number(
    styles.getPropertyValue("--grid-columns").trim() || "5"
  );
  const gap = Number.parseFloat(styles.columnGap || styles.gap || "0");
  const unit =
    (grid.getBoundingClientRect().width - gap * (columns - 1)) / columns;

  return { columns, gap, unit };
};

const packLayout = (tiles, columns, forcedPlacement = null) => {
  const layout = new Map();

  if (forcedPlacement) {
    layout.set(forcedPlacement.id, forcedPlacement.rect);
  }

  tiles.forEach((tile) => {
    if (forcedPlacement && tile.id === forcedPlacement.id) {
      return;
    }

    layout.set(tile.id, findFirstFit(layout, tile.id, tile.span, columns));
  });

  return layout;
};

const sortTileIdsByLayout = (layout) => {
  return Array.from(layout.entries())
    .sort(([, a], [, b]) => {
      if (a.y !== b.y) {
        return a.y - b.y;
      }

      return a.x - b.x;
    })
    .map(([id]) => id);
};

const applyLayout = (tileRegistry, layout, placeholder = null) => {
  tileRegistry.forEach(({ element }, id) => {
    const position = layout.get(id);

    if (!position) {
      return;
    }

    if (placeholder && placeholder.id === id) {
      return;
    }

    element.style.gridColumn = `${position.x + 1} / span ${position.w}`;
    element.style.gridRow = `${position.y + 1} / span ${position.h}`;
  });

  if (placeholder) {
    const position = layout.get(placeholder.id);

    if (position) {
      placeholder.element.style.gridColumn = `${position.x + 1} / span ${position.w}`;
      placeholder.element.style.gridRow = `${position.y + 1} / span ${position.h}`;
    }
  }
};

export const initializeTileDrag = () => {
  const grid = document.getElementById("grid");

  if (!grid || grid.dataset.dragInitialized === "true") {
    return;
  }

  grid.dataset.dragInitialized = "true";

  const visibleTiles = getVisibleGridTiles();
  const tileRegistry = new Map(
    visibleTiles.map((tile, index) => {
      const id = getTileKey(tile, index);
      return [
        id,
        {
          id,
          element: tile,
          span: getTileSpan(tile)
        }
      ];
    })
  );
  let tileOrder = Array.from(tileRegistry.values()).map((tile) => tile.id);

  let { columns } = getGridMetrics(grid);
  let currentLayout = packLayout(
    tileOrder.map((id) => tileRegistry.get(id)),
    columns
  );
  let pendingDrag = null;
  let dragState = null;
  let suppressClick = false;
  let resizeTimeoutId = null;

  applyLayout(tileRegistry, currentLayout);

  const clearPendingDrag = () => {
    pendingDrag = null;
  };

  const moveDraggedTile = (clientX, clientY) => {
    if (!dragState) {
      return;
    }

    const { tile, offsetX, offsetY } = dragState;
    tile.style.left = `${clientX - offsetX}px`;
    tile.style.top = `${clientY - offsetY}px`;
  };

  const buildForcedPlacement = (clientX, clientY) => {
    if (!dragState) {
      return null;
    }

    const gridRect = grid.getBoundingClientRect();
    const metrics = getGridMetrics(grid);
    const left = clientX - gridRect.left - dragState.offsetX;
    const top = clientY - gridRect.top - dragState.offsetY;
    const x = Math.max(
      0,
      Math.min(
        metrics.columns - dragState.span.w,
        Math.round(left / (metrics.unit + metrics.gap))
      )
    );
    const y = Math.max(0, Math.round(top / (metrics.unit + metrics.gap)));

    return {
      id: dragState.id,
      rect: { x, y, ...dragState.span }
    };
  };

  const updatePreviewLayout = (clientX, clientY) => {
    if (!dragState) {
      return;
    }

    const forcedPlacement = buildForcedPlacement(clientX, clientY);

    if (!forcedPlacement) {
      return;
    }

    rememberTilePositions();
    currentLayout = packLayout(
      tileOrder.map((id) => tileRegistry.get(id)),
      columns,
      forcedPlacement
    );
    applyLayout(tileRegistry, currentLayout, {
      id: dragState.id,
      element: dragState.placeholder
    });
    queueTileReflow();
  };

  const cleanupDrag = () => {
    if (!dragState) {
      return;
    }

    const { id, tile, placeholder } = dragState;
    grid.classList.remove("is-dragging-tiles");
    rememberTilePositions();
    placeholder.remove();
    tile.classList.remove("tile-dragging");

    tile.style.position = "";
    tile.style.left = "";
    tile.style.top = "";
    tile.style.width = "";
    tile.style.height = "";
    tile.style.margin = "";
    tile.style.zIndex = "";
    tile.style.pointerEvents = "";
    tile.style.transition = "";
    tile.style.transform = "";

    tileOrder = sortTileIdsByLayout(currentLayout);
    applyLayout(tileRegistry, currentLayout);
    queueTileReflow();
    dragState = null;
    suppressClick = true;

    tileRegistry.get(id).element = tile;

    window.setTimeout(() => {
      suppressClick = false;
    }, 0);
  };

  const beginDrag = (tile, clientX, clientY) => {
    const id = tile.dataset.tileKey;
    const rect = tile.getBoundingClientRect();
    const placeholder = document.createElement("div");
    placeholder.className = `${tile.className} tile-placeholder`;
    placeholder.style.width = `${rect.width}px`;
    placeholder.style.height = `${rect.height}px`;
    grid.appendChild(placeholder);

    dragState = {
      id,
      tile,
      placeholder,
      span: getTileSpan(tile),
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top
    };

    grid.classList.add("is-dragging-tiles");
    tile.classList.add("tile-dragging");
    tile.style.position = "fixed";
    tile.style.left = `${rect.left}px`;
    tile.style.top = `${rect.top}px`;
    tile.style.width = `${rect.width}px`;
    tile.style.height = `${rect.height}px`;
    tile.style.margin = "0";
    tile.style.zIndex = "1000";
    tile.style.pointerEvents = "none";
    tile.style.transition = "none";

    moveDraggedTile(clientX, clientY);
    updatePreviewLayout(clientX, clientY);
  };

  grid.addEventListener(
    "click",
    (event) => {
      if (!suppressClick) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
    },
    true
  );

  grid.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) {
      return;
    }

    const target = event.target;

    if (!(target instanceof HTMLElement) || isInteractiveTarget(target)) {
      return;
    }

    const tile = target.closest(".tile");

    if (!(tile instanceof HTMLElement) || !grid.contains(tile) || tile.hidden) {
      return;
    }

    pendingDrag = {
      tile,
      startX: event.clientX,
      startY: event.clientY
    };
  });

  window.addEventListener("pointermove", (event) => {
    if (pendingDrag && !dragState) {
      const distance = Math.hypot(
        event.clientX - pendingDrag.startX,
        event.clientY - pendingDrag.startY
      );

      if (distance >= dragThresholdPx) {
        beginDrag(pendingDrag.tile, event.clientX, event.clientY);
        clearPendingDrag();
      }
    }

    if (!dragState) {
      return;
    }

    moveDraggedTile(event.clientX, event.clientY);
    updatePreviewLayout(event.clientX, event.clientY);
  });

  window.addEventListener("pointerup", () => {
    clearPendingDrag();
    cleanupDrag();
  });

  window.addEventListener("pointercancel", () => {
    clearPendingDrag();
    cleanupDrag();
  });

  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimeoutId);
    resizeTimeoutId = window.setTimeout(() => {
      const nextColumns = getGridMetrics(grid).columns;

      if (nextColumns === columns || dragState) {
        return;
      }

      columns = nextColumns;
      rememberTilePositions();
      currentLayout = packLayout(
        tileOrder.map((id) => tileRegistry.get(id)),
        columns
      );
      applyLayout(tileRegistry, currentLayout);
      queueTileReflow();
    }, 60);
  });
};
