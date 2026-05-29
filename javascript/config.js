export const themeStorageKey = "asafos-theme";

export const backendBaseUrl =
  window.ASAFOS_BACKEND_URL ??
  "https://asafos-backend.onrender.com";

export const defaultResumePdfUrl = "./assets/Asaf-Axelrod-Resume.pdf";

export const defaultNewsImageFallback =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="110" viewBox="0 0 160 110">
      <rect width="160" height="110" rx="12" fill="#ececec"/>
      <text x="80" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#d40000">N12</text>
    </svg>
  `);
