const BASE_URL = "https://swiftcare.up.railway.app";

export interface AuthResponse {
  accessToken: string;
  role: "patient" | "doctor";
  userId: string;
}

export interface GoogleAuthPayload {
  idToken: string;
  roleHint: "patient" | "doctor";
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log("[v0] Login attempt for:", email);
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
       // CRITICAL: Include cookies for httpOnly refresh token
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error("[v0] Login failed with status:", res.status, error);
      throw new Error(error.error || "Invalid credentials");
    }

    const data = await res.json();
    console.log("[v0] Login successful, role:", data.role);
    
    // Store only access token (refresh token is in httpOnly cookie)
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
    }
    
    return data;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Network error - backend may be unavailable";
    console.error("[v0] Login error:", errorMessage);
    throw new Error(errorMessage);
  }
};

export const register = async (payload: {
  name: string;
  email: string;
  password: string;
  roleHint: "patient" | "doctor";
}): Promise<AuthResponse> => {
  try {
    console.log("[v0] Signup attempt for:", payload.email, "as", payload.roleHint);
    
    // Backend only supports patient signup
    if (payload.roleHint !== "patient") {
      throw new Error("Only patient signup is currently available. Doctor registration coming soon!");
    }

    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        roleHint: payload.roleHint,
      }),
    // CRITICAL: Include cookies for httpOnly refresh token
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error("[v0] Signup failed:", error);
      throw new Error(error.error || "Registration failed");
    }

    const data = await res.json();
    console.log("[v0] Signup successful");
    
    // Store only access token (refresh token is in httpOnly cookie)
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
    }
    
    return data;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    console.error("[v0] Registration error:", message);
    throw new Error(message);
  }
};

export const googleAuth = async (idToken: string, roleHint: "patient" | "doctor"): Promise<AuthResponse> => {
  try {
    console.log("[v0] Google auth attempt as", roleHint);
    
    const res = await fetch(`${BASE_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, roleHint }),
      credentials: "include", // CRITICAL: Include cookies for httpOnly refresh token
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error("[v0] Google auth failed:", error);
      throw new Error(error.error || "Google authentication failed");
    }

    const data = await res.json();
    console.log("[v0] Google auth successful");
    
    // Store only access token (refresh token is in httpOnly cookie)
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
    
    // Don't send any body or auth header - backend reads from httpOnly cookie
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // CRITICAL: Send cookies with request
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
      credentials: "include", // CRITICAL: Send cookies to clear them
    });
  } catch (err) {
    console.error("[v0] Logout error:", err);
  }
  
  // Clear local storage
  localStorage.removeItem("accessToken");
  localStorage.removeItem("swiftcare_auth");
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem("accessToken");
};
