import { themeStorageKey } from "../config.js";
import { updateMapThemes } from "./maps.js";

export const applyTheme = (isDarkMode, maps, mapConfig) => {
  document.body.classList.toggle("dark", isDarkMode);
  localStorage.setItem(themeStorageKey, isDarkMode ? "dark" : "light");
  updateMapThemes(maps, mapConfig, isDarkMode);

  maps.forEach((map) => {
    if (map) {
      setTimeout(() => map.invalidateSize(), 150);
    }
  });
};

export const initializeTheme = (maps, mapConfig) => {
  const toggle = document.getElementById("theme-switch-input");
  const isDarkMode = (localStorage.getItem(themeStorageKey) ?? "light") === "dark";

  toggle.checked = isDarkMode;
  applyTheme(isDarkMode, maps, mapConfig);

  toggle.addEventListener("change", () => {
    applyTheme(toggle.checked, maps, mapConfig);
  });
};
