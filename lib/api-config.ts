// API Configuration
export const API_BASE_URL = "https://swiftcare.up.railway.app";

// Token storage keys
export const TOKEN_KEYS = {
  ACCESS: "accessToken",
  REFRESH: "refreshToken",
  USER: "swiftcare_auth",
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
  },
  DOCTORS: "/doctors",
  PATIENTS: "/patients",
  APPOINTMENTS: "/appointments",
  REVIEWS: "/reviews",
} as const;

// Token expiration times
export const TOKEN_TTL = {
  ACCESS: 15 * 60 * 1000, // 15 minutes in ms
  REFRESH: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
} as const;
