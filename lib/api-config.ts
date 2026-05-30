// API Configuration
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "https://swiftcare.up.railway.app").replace(/\/+$/, "");

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
    REGISTER: "/auth/signup",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
  },
  CHATBOT: "/chatbot/chat",
  PAYMENT_INTENT: "/payment/create-intent",
  DOCTORS: "/doctors",
  PATIENTS: "/patients",
  APPOINTMENTS: "/appointments",
  REVIEWS: "/reviews",
  FACILITIES: "/facilities",
} as const;

// Token expiration times
export const TOKEN_TTL = {
  ACCESS: 15 * 60 * 1000, // 15 minutes in ms
  REFRESH: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
} as const;

