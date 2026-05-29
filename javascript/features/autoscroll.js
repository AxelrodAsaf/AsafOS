export const initializeAutoScroll = (containerId, speed = 0.35) => {
  const container = document.getElementById(containerId);

  if (!container) {
    return;
  }

  if (container.dataset.autoscrollInitialized === "true") {
    return;
  }

  container.dataset.autoscrollInitialized = "true";

  const hoverTarget = container.closest(".tile") ?? container;
  let paused = false;
  let currentPosition = 0;
  let lastTimestamp = null;

  hoverTarget.addEventListener("mouseenter", () => {
    paused = true;
  });

  hoverTarget.addEventListener("mouseleave", () => {
    paused = false;
  });

  const step = (timestamp) => {
    const maxScrollTop = container.scrollHeight - container.clientHeight;

    if (lastTimestamp === null) {
      lastTimestamp = timestamp;
    }

    const deltaMs = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    if (maxScrollTop <= 0) {
      currentPosition = 0;
      container.scrollTop = 0;
      window.requestAnimationFrame(step);
      return;
    }

    if (!paused) {
      currentPosition += (deltaMs / 16.6667) * speed;

      if (currentPosition >= maxScrollTop) {
        currentPosition = 0;
        container.scrollTop = 0;
      } else {
        container.scrollTop = currentPosition;
      }
    } else {
      currentPosition = container.scrollTop;
    }

    window.requestAnimationFrame(step);
  };

  window.requestAnimationFrame(step);
};
