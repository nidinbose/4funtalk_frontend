import axios from "axios";

// ─── Axios Instance ──────────────────────────────────────────────────────────
// No baseURL set — requests use relative paths (e.g. /api/auth/login).
// In development, Vite proxy forwards /api/* → https://api.support4funtalk.com
// In production, requests go directly to the same origin that serves the app.
const API = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ────────────────────────────────────────────────────
// Reads the JWT from the 'auth' key persisted by authSlice's saveAuth helper.
API.interceptors.request.use(
  (config) => {
    try {
      const raw = localStorage.getItem("auth");
      const token = raw ? JSON.parse(raw).token : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch { /* ignore parse errors */ }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ───────────────────────────────────────────────────
// Handles global 401 Unauthorized → clears auth and redirects to login.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;
