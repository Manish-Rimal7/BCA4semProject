/**
 * Centralized API configuration for Re-Nest frontend.
 * Always targets the backend server running on port 8091 connected to local MongoDB.
 */

export const API_BASE_URL =
    import.meta.env["VITE_API_URL"] || "http://100.67.216.41:4050/api";
export default API_BASE_URL;
