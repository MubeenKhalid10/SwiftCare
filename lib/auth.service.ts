const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "https://swiftcare.up.railway.app").replace(/\/+$/, "");
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
    console.log("[v0] Login attempt for:", normalizedEmail);

    // Temporary hardcoded admin login
    if (normalizedEmail === "admin@swiftcare.com" && password === "admin123") {
      const adminData: AuthResponse = {
        accessToken: `mock-admin-token-${Date.now()}`,
        role: "admin",
        userId: "admin-id-001",
        user: {
          id: "admin-id-001",
          name: "System Admin",
          email: "admin@swiftcare.com",
          role: "admin",
        },
      };

      if (isBrowser()) {
        localStorage.setItem(ACCESS_TOKEN_KEY, adminData.accessToken);
        writeStoredAuth({
          user: adminData.user,
          expiresAt: Date.now() + SESSION_TTL_MS,
        });
      }

      console.log("[v0] Hardcoded admin login successful");
      return adminData;
    }

    const res = await fetch(`${BASE_URL}/auth/login`, {
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

      console.error("[v0] Login failed with status:", res.status, parsed || raw);

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
    console.log("[v0] Login successful, role:", data.role);

    // Store access token for Authorization header
    if (data.accessToken && isBrowser()) {
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    }
    // Refresh token is stored in HTTPONLY cookie by backend, don't duplicate in localStorage

    return data;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Network error - backend may be unavailable";
    console.error("[v0] Login error:", errorMessage);
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
    console.log("[v0] Signup attempt for:", payload.email, "as", payload.roleHint);

    const res = await fetch(`${BASE_URL}/auth/signup`, {
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
    console.log("[v0] Signup successful – OTP sent to", data.email);

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
  const res = await fetch(`${BASE_URL}/auth/verify-email-otp`, {
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
  name: string,
  email: string,
  password: string,
  roleHint: "patient" | "doctor"
): Promise<SignupResponse> => {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, roleHint }),
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
  const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
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
  const res = await fetch(`${BASE_URL}/auth/reset-password`, {
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

  const res = await fetch(`${BASE_URL}/api/user/upload-image`, {
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
    console.log("[v0] Google auth attempt as", roleHint);
    console.log("[v0] Sending idToken to backend at:", `${BASE_URL}/auth/google`);

    const res = await fetch(`${BASE_URL}/auth/google`, {
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
    console.log("[v0] Google auth successful");

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
    console.log("[v0] Attempting to refresh access token");

    const currentToken = getAccessToken()
    if (!currentToken) {
      throw new Error("Unauthorized")
    }

    // Backend stores refresh token in HTTPONLY cookie, send credentials: 'include'
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
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
    console.log("[v0] Token refresh successful");

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
    console.log("[v0] Logging out");

    await fetch(`${BASE_URL}/auth/logout`, {
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
  console.log("[v0] All auth tokens cleared");
};

/* ── Get Access Token (Session Persistence) ── */
export const getAccessToken = (): string | null => {
  if (!isBrowser()) return null;
  if (!ensureSessionExpiry()) return null;
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    console.log("[v0] Access token found in localStorage");
  }
  return token;
};

/* ── Check if user has valid session ── */
export const hasValidSession = (): boolean => {
  if (!isBrowser()) return false;
  if (!ensureSessionExpiry()) return false;
  const token = getAccessToken();
  const authData = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!token || !authData) {
    console.log("[v0] No valid session found");
    return false;
  }

  try {
    JSON.parse(authData);
    console.log("[v0] Valid session found");
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
  console.log("[v0] Auth data cleared");
};

