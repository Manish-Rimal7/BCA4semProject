/**
 * Centralized API configuration for Re-Nest frontend.
 * Always targets the backend server running on port 8091 connected to local MongoDB.
 */

const rawUrl =
  import.meta.env["VITE_API_URL"] ||
  (typeof window !== "undefined" && window.location.origin
    ? `${window.location.origin}/api`
    : "http://100.67.216.41:4050/api");

export const API_BASE_URL = rawUrl.replace(/\/+$/, "");
export default API_BASE_URL;
