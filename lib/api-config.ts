// Backend API configuration — set NEXT_PUBLIC_API_URL in .env.local (see env.example).

function trimEnvValue(value?: string | null): string {
  return String(value || '').replace(/^"|"$/g, '').trim();
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, '');
}

/**
 * Resolves the backend base URL from environment variables.
 * Uses static process.env access so Next.js can inline NEXT_PUBLIC_* on the client.
 */
export function resolveApiBaseUrl(): string {
  // Must use static property access — dynamic process.env[key] is not inlined by Next.js.
  const value = trimEnvValue(
    process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL
  );

  if (value) {
    return normalizeBaseUrl(value);
  }

  throw new Error(
    'Backend URL is not configured. Set NEXT_PUBLIC_API_URL in .env.local (see env.example).'
  );
}

/** Backend base URL, e.g. https://your-api.example.com */
export function getApiBaseUrl(): string {
  return resolveApiBaseUrl();
}

/** Build a full backend URL from a path or endpoint constant. */
export function buildApiUrl(path: string): string {
  const base = getApiBaseUrl();
  if (!path) return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export const API_BASE_URL = resolveApiBaseUrl();

// Token storage keys
export const TOKEN_KEYS = {
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken',
  USER: 'swiftcare_auth',
} as const;

// API endpoint paths (relative to API_BASE_URL)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/signup',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    GOOGLE: '/auth/google',
    GOOGLE_WEB_START: '/auth/google/web/start',
    VERIFY_EMAIL_OTP: '/auth/verify-email-otp',
    RESEND_SIGNUP_OTP: '/auth/resend-signup-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USER: {
    UPLOAD_IMAGE: '/api/user/upload-image',
    CONTACT: '/api/user/contact',
    TOGGLE_FAVORITE: '/api/user/toggle-favorite',
  },
  MAPBOX: {
    GEOCODE: '/api/mapbox/geocode',
    REVERSE_GEOCODE: '/api/mapbox/reverse-geocode',
    STATIC: '/api/mapbox/static',
    EMBED: '/api/mapbox/embed',
    DOCTORS_MAP: '/api/mapbox/doctors-map',
  },
  LOCATION: '/api/location',
  CHATBOT: '/chatbot/chat',
  PAYMENT_INTENT: '/payment/create-intent',
  DOCTORS: '/doctors',
  DOCTORS_VERIFICATION_SUBMIT: '/doctors/verification/submit',
  PATIENTS: '/patients',
  APPOINTMENTS: '/appointments',
  REVIEWS: '/reviews',
  FACILITIES: '/facilities',
  NOTIFICATIONS: '/notifications',
} as const;

// Token expiration times
export const TOKEN_TTL = {
  ACCESS: 15 * 60 * 1000,
  REFRESH: 30 * 24 * 60 * 60 * 1000,
} as const;
