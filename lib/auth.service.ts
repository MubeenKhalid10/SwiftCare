const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");

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

    // Hardcoded admin for testing
    if (normalizedEmail === "admin@swiftcare.com" && password === "admin123") {
      console.log("[v0] Admin hardcoded login successful");
      const adminData: AuthResponse = {
        accessToken: "mock-admin-token-" + Date.now(),
        role: "admin",
        userId: "admin-id-001",
        user: {
          id: "admin-id-001",
          name: "System Admin",
          email: "admin@swiftcare.com",
          role: "admin",
        },
      };
      if (adminData.accessToken) {
        localStorage.setItem("accessToken", adminData.accessToken);
      }
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

    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
    }

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
  specialization?: string;
  location?: {
    label: string;
    coordinates: [number, number];
  };
  schedule?: {
    availableDays: string[];
    availableHours: string[];
  };
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
        roleHint: payload.roleHint,
        specialization: payload.specialization,
        location: payload.location,
        schedule: payload.schedule,
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

  if (data.accessToken) {
    localStorage.setItem("accessToken", data.accessToken);
  }

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

  const res = await fetch(`${BASE_URL}/api/user/upload-image`, {
    method: "POST",
    body: formData,
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

    const res = await fetch(`${BASE_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, roleHint }),
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error("[v0] Google auth failed:", error);
      throw new Error(error.error || "Google authentication failed");
    }

    const data = await res.json();
    console.log("[v0] Google auth successful");

    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
    }

    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Google authentication failed";
    console.error("[v0] Google auth error:", message);
    throw new Error(message);
  }
};

export const refreshAccessToken = async (): Promise<string> => {
  try {
    console.log("[v0] Attempting to refresh access token");

    // Don't refresh for mock admin
    const stored = localStorage.getItem("swiftcare_auth");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.user?.email === "admin@swiftcare.com") {
          console.log("[v0] Skipping token refresh for mock admin");
          return localStorage.getItem("accessToken") || "mock-admin-token";
        }
      } catch (e) {}
    }

    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      console.error("[v0] Token refresh failed, clearing auth state");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("swiftcare_auth");
      throw new Error("Failed to refresh token");
    }

    const data = await res.json();
    console.log("[v0] Token refresh successful");

    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
    }

    return data.accessToken;
  } catch (err) {
    console.error("[v0] Refresh token error:", err);
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

  localStorage.removeItem("accessToken");
  localStorage.removeItem("swiftcare_auth");
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

