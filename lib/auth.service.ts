import { buildApiUrl, API_ENDPOINTS } from './api-config';
const ACCESS_TOKEN_KEY = "accessToken";
const AUTH_STORAGE_KEY = "swiftcare_auth";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type StoredAuth = {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: "patient" | "doctor" | "admin";
  };
  expiresAt?: number;
};

const isBrowser = (): boolean => typeof window !== "undefined" && typeof localStorage !== "undefined";

const getStoredAuth = (): StoredAuth | null => {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
};

const writeStoredAuth = (data: StoredAuth): void => {
  if (!isBrowser()) return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
};

const ensureSessionExpiry = (): boolean => {
  const stored = getStoredAuth();
  if (!stored) return true;
  if (!stored.expiresAt) {
    const expiresAt = Date.now() + SESSION_TTL_MS;
    writeStoredAuth({ ...stored, expiresAt });
    return true;
  }
  if (stored.expiresAt <= Date.now()) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return false;
  }
  return true;
};

export interface AuthResponse {
  accessToken: string;
  role: "patient" | "doctor" | "admin";
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: "patient" | "doctor" | "admin";
  };
}

export interface GoogleAuthPayload {
  idToken: string;
  roleHint: "patient" | "doctor";
}

export interface SignupResponse {
  message: string;
  email: string;
  role: "patient" | "doctor";
  userId: string;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const normalizedEmail = email.trim();

    const res = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.LOGIN), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail, password }),
      credentials: "include",
    });

    if (!res.ok) {
      const raw = await res.text().catch(() => "");
      let parsed: Record<string, unknown> = {};
      if (raw) {
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = {};
        }
      }

      if (process.env.NODE_ENV === 'development') console.error("[auth] Login failed:", res.status, parsed || raw);

      // Special handling for unverified email
      if (res.status === 403 && parsed.error === "Email not verified") {
        const err = new Error("Email not verified") as Error & { status: number };
        (err as any).status = 403;
        throw err;
      }

      const message =
        (typeof parsed.error === "string" && parsed.error) ||
        (typeof parsed.message === "string" && parsed.message) ||
        (raw && raw.trim()) ||
        "Invalid credentials";
      throw new Error(message);
    }

    const data = await res.json();

    // Store access token for Authorization header
    if (data.accessToken && isBrowser()) {
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    }
    // Refresh token is stored in HTTPONLY cookie by backend, don't duplicate in localStorage

    return data;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Network error — backend may be unavailable";
    throw err instanceof Error ? err : new Error(errorMessage);
  }
};

export const register = async (payload: {
  name: string;
  email: string;
  password: string;
  roleHint: "patient" | "doctor";
  phone?: string;
  specialization?: string;
  location?: {
    label: string;
    coordinates?: [number, number];
    clinicName?: string;
    source?: "browser" | "ip" | "address" | "manual";
  };
  schedule?: {
    availableDays: string[];
    availableHours: string[];
  };
  clinicName?: string;
}): Promise<SignupResponse> => {
  try {
    const res = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.REGISTER), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        phone: payload.phone,
        roleHint: payload.roleHint,
        specialization: payload.specialization,
        location: payload.location,
        schedule: payload.schedule,
        clinicName: payload.clinicName,
      }),
      credentials: "include",
    });

    if (!res.ok) {
      const raw = await res.text().catch(() => "");
      let parsed: any = {};
      try { parsed = JSON.parse(raw); } catch { parsed = {}; }
      console.error("[v0] Signup failed with status:", res.status, "Parsed:", parsed, "Raw:", raw);
      throw new Error(parsed.error || parsed.message || "Registration failed");
    }

    const data = await res.json();

    // No tokens are returned at this stage – user must verify OTP first
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    console.error("[v0] Registration error:", message);
    throw new Error(message);
  }
};

/* ── Verify Email OTP (completes signup) ── */

export const verifyEmailOtp = async (
  email: string,
  roleHint: "patient" | "doctor",
  otp: string
): Promise<AuthResponse> => {
  const res = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.VERIFY_EMAIL_OTP), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, roleHint, otp }),
    credentials: "include",
  });

  if (!res.ok) {
    const parsed = await res.json().catch(() => ({}));
    throw new Error(parsed.error || "Verification failed");
  }

  const data: AuthResponse = await res.json();

  // Store access token for Authorization header
  if (data.accessToken && isBrowser()) {
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
  }
  // Refresh token is stored in HTTPONLY cookie by backend, don't duplicate in localStorage

  return data;
};

/* ── Resend OTP (re-triggers signup endpoint) ── */

export const resendSignupOtp = async (
  email: string,
  roleHint: "patient" | "doctor"
): Promise<SignupResponse> => {
  const res = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.RESEND_SIGNUP_OTP), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, roleHint }),
    credentials: "include",
  });

  if (!res.ok) {
    const parsed = await res.json().catch(() => ({}));
    throw new Error(parsed.error || "Failed to resend code");
  }

  return res.json();
};

/* ── Forgot Password ── */

export const forgotPassword = async (
  email: string,
  roleHint: "patient" | "doctor"
): Promise<{ message: string }> => {
  const res = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.FORGOT_PASSWORD), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, roleHint }),
    credentials: "include",
  });

  if (!res.ok) {
    const parsed = await res.json().catch(() => ({}));
    throw new Error(parsed.error || "Password reset failed");
  }

  return res.json();
};

/* ── Reset Password ── */

export const resetPassword = async (
  email: string,
  roleHint: "patient" | "doctor",
  otp: string,
  newPassword: string
): Promise<{ message: string }> => {
  const res = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.RESET_PASSWORD), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, roleHint, otp, newPassword }),
    credentials: "include",
  });

  if (!res.ok) {
    const parsed = await res.json().catch(() => ({}));
    throw new Error(parsed.error || "Password reset failed");
  }

  return res.json();
};

/* ── Upload Profile Image ── */

export const uploadProfileImage = async (
  userId: string,
  role: "patient" | "doctor",
  file: File
): Promise<{ message: string; imageUrl: string }> => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("userId", userId);
  formData.append("role", role);

  const token = getAccessToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(buildApiUrl(API_ENDPOINTS.USER.UPLOAD_IMAGE), {
    method: "POST",
    body: formData,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const parsed = await res.json().catch(() => ({}));
    throw new Error(parsed.error || "Image upload failed");
  }

  return res.json();
};

export const googleAuth = async (idToken: string, roleHint: "patient" | "doctor"): Promise<AuthResponse> => {
  try {
    const res = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.GOOGLE), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, roleHint }),
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error("[v0] Google auth failed with status:", res.status);
      console.error("[v0] Backend response:", error);
      throw new Error(error.error || `Google authentication failed (${res.status})`);
    }

    const data = await res.json();

    // Store access token for Authorization header
    if (data.accessToken && isBrowser()) {
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    }
    // Refresh token is stored in HTTPONLY cookie by backend, don't duplicate in localStorage

    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Google authentication failed";
    console.error("[v0] Google auth error:", message);
    console.error("[v0] Full error object:", err);
    throw new Error(message);
  }
};

export const refreshAccessToken = async (): Promise<string> => {
  try {
    // Backend stores refresh token in HTTPONLY cookie, send credentials: 'include'
    const res = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.REFRESH), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // This sends the refreshToken cookie
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      if (res.status !== 401) {
        console.error("[v0] Token refresh failed with status:", res.status)
        console.error("[v0] Backend error response:", errorData)
      }
      if (isBrowser()) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
      if (res.status === 401) {
        throw new Error("Unauthorized")
      }
      throw new Error(errorData.error || `Token refresh failed (${res.status})`)
    }

    const data = await res.json();

    // Update access token if provided (backend may also send via cookie)
    if (data.accessToken && isBrowser()) {
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    }

    return data.accessToken || getAccessToken() || "";
  } catch (err) {
    if (!(err instanceof Error && (err.message === "Unauthorized" || err.message === "No refresh token"))) {
      console.error("[v0] Refresh token error:", err)
    }
    throw err;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await fetch(buildApiUrl(API_ENDPOINTS.AUTH.LOGOUT), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
  } catch (err) {
    console.error("[v0] Logout error:", err);
  }

  // Clear all auth tokens and data
  if (isBrowser()) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};

/* ── Get Access Token (Session Persistence) ── */
export const getAccessToken = (): string | null => {
  if (!isBrowser()) return null;
  if (!ensureSessionExpiry()) return null;
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  return token;
};

/* ── Check if user has valid session ── */
export const hasValidSession = (): boolean => {
  if (!isBrowser()) return false;
  if (!ensureSessionExpiry()) return false;
  const token = getAccessToken();
  const authData = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!token || !authData) {
    return false;
  }

  try {
    JSON.parse(authData);
    return true;
  } catch {
    return false;
  }
};

/* ── Clear all auth data securely ── */
export const clearAuthData = (): void => {
  if (!isBrowser()) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

