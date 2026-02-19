"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { login as loginService, register as registerService, logout as logoutService, getAccessToken, googleAuth as googleAuthService } from "./auth.service";
import type { AuthState, LoginCredentials, RegisterData, User } from "./types";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  googleAuth: (idToken: string, roleHint: "patient" | "doctor") => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  getUser: () => User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_STORAGE_KEY = "swiftcare_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    console.log("[v0] Auth context initializing");
    // Check if we have tokens and stored user info
    const accessToken = getAccessToken();
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);

    if (accessToken && stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.user) {
          console.log("[v0] Restored auth state for user:", parsed.user.email);
          setAuthState({
            user: parsed.user,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      } catch (e) {
        console.error("[v0] Failed to parse stored auth:", e);
      }
    }

    console.log("[v0] No stored auth found");
    setAuthState((p) => ({ ...p, isLoading: false }));
  }, []);

  const login = async ({ email, password }: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState((p) => ({ ...p, isLoading: true }));
      const response = await loginService(email, password);

      // Build user object from response
      const user: User = {
        id: response.userId,
        name: "", // Will be fetched from backend if needed
        email: email,
        role: response.role,
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user }));
      setAuthState({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      console.error("[v0] Login error:", errorMessage);
      setAuthState((p) => ({ ...p, isLoading: false }));
      return { success: false, error: errorMessage };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState((p) => ({ ...p, isLoading: true }));
      
      const roleHint = data.role || "patient";
      const response = await registerService({
        name: data.name,
        email: data.email,
        password: data.password,
        roleHint,
      });

      // Build user object from response
      const user: User = {
        id: response.userId,
        name: data.name,
        email: data.email,
        role: response.role,
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user }));
      setAuthState({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      console.error("[v0] Registration error:", errorMessage);
      setAuthState((p) => ({ ...p, isLoading: false }));
      return { success: false, error: errorMessage };
    }
  };

  const googleAuth = async (idToken: string, roleHint: "patient" | "doctor"): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState((p) => ({ ...p, isLoading: true }));
      const response = await googleAuthService(idToken, roleHint);

      // Build user object from response
      const user: User = {
        id: response.userId,
        name: "", // Google provides this in the token, backend should return it
        email: "", // Same as above
        role: response.role,
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user }));
      setAuthState({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Google authentication failed";
      console.error("[v0] Google auth error:", errorMessage);
      setAuthState((p) => ({ ...p, isLoading: false }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await logoutService();
    } catch (err) {
      console.error("[v0] Logout error:", err);
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  };

  const getUser = () => authState.user;

  return (
    <AuthContext.Provider value={{ ...authState, login, register, googleAuth, logout, getUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
