export const hideLoadingOverlay = () => {
  const overlay = document.getElementById("page-loading-overlay");

  if (!overlay) {
    return;
  }

  window.setTimeout(() => {
    overlay.classList.add("is-hidden");
  }, 200);
};
