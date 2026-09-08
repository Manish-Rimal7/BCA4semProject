/**
 * Centralized API configuration for Re-Nest frontend.
 * Reads from VITE_API_URL if defined, with fallback to external backend or proxy.
 */

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env["VITE_API_URL"];
  if (envUrl && typeof envUrl === "string" && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/+$/, "");
  }

  // Fallback to local backend server on port 8091
  return "http://localhost:8091/api";
};

export const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;
