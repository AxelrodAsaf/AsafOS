import { backendBaseUrl } from "../config.js";

export const fetchJson = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }

  return response.json();
};

export const fetchWithFallback = async (primaryUrl, fallbackUrl) => {
  try {
    return await fetchJson(primaryUrl);
  } catch (error) {
    if (!fallbackUrl) {
      throw error;
    }

    console.warn(`Falling back to ${fallbackUrl} after ${primaryUrl} failed.`, error);
    return fetchJson(fallbackUrl);
  }
};

export const loadConfig = async () => {
  try {
    return await fetchJson(`${backendBaseUrl}/api/config`);
  } catch (error) {
    console.warn("Falling back to local defaults after config request failed.", error);
    return null;
  }
};
