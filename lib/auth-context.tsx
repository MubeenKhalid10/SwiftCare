"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  login as loginService,
  register as registerService,
  verifyEmailOtp as verifyEmailOtpService,
  logout as logoutService,
  getAccessToken,
  googleAuth as googleAuthService,
} from "./auth.service";
import type { AuthState, LoginCredentials, RegisterData, User } from "./types";
import type { GoogleRedirectSession } from "./google-auth";

interface RegisterResult {
  success: boolean;
  error?: string;
  email?: string;
  role?: "patient" | "doctor";
  userId?: string;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<RegisterResult>;
  verifyOtp: (email: string, role: "patient" | "doctor", otp: string) => Promise<{ success: boolean; error?: string }>;
  googleAuth: (idToken: string, roleHint: "patient" | "doctor") => Promise<{ success: boolean; error?: string }>;
  completeGoogleRedirect: (session: GoogleRedirectSession) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  getUser: () => User | null;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_STORAGE_KEY = "swiftcare_auth";
const ACCESS_TOKEN_KEY = "accessToken";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type StoredAuth = {
  user?: User;
  expiresAt?: number;
};

const isBrowser = (): boolean => typeof window !== "undefined" && typeof localStorage !== "undefined";

const readStoredAuth = (): StoredAuth | null => {
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
  const stored = readStoredAuth();
  if (!stored) return true;
  if (!stored.expiresAt) {
    writeStoredAuth({ ...stored, expiresAt: Date.now() + SESSION_TTL_MS });
    return true;
  }
  if (stored.expiresAt <= Date.now()) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return false;
  }
  return true;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initializeAuth = () => {
      if (!isBrowser()) {
        setAuthState((p) => ({ ...p, isLoading: false }));
        return;
      }

      if (!ensureSessionExpiry()) {
        setAuthState((p) => ({ ...p, isLoading: false }));
        return;
      }

      const accessToken = getAccessToken();
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);

      if (accessToken && stored) {
        try {
          const parsed = JSON.parse(stored) as StoredAuth;
          if (parsed?.user) {
            setAuthState({
              user: parsed.user,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
        } catch (e) {
          console.error("[v0] Failed to parse stored auth:", e);
          // Clear corrupted auth data
          localStorage.removeItem(AUTH_STORAGE_KEY);
          localStorage.removeItem(ACCESS_TOKEN_KEY);
        }
      } else if (!accessToken) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }

      setAuthState((p) => ({ ...p, isLoading: false }));
    };

    initializeAuth();
  }, []);

  /* ── Fetch Full Profile (if missing Name/Avatar) ── */
  useEffect(() => {
    if (authState.isAuthenticated && authState.user && authState.user.role !== "admin") {
      const fetchProfile = async () => {
        try {
          const { getPatientById } = await import("./api");
          const { getDoctorById } = await import("./api");
          
          let data = null;
          if (authState.user?.role === "patient") {
            data = await getPatientById(authState.user.id);
          } else if (authState.user?.role === "doctor") {
            data = await getDoctorById(authState.user.id);
          }
          
          if (data) {
            const updates: Partial<User> = {
              name: data.name, 
              email: (data as any).credentials?.email || (data as any).email || authState.user?.email,
              avatar: (data as any).avatar || (data as any).image 
            };
            
            // For doctors, also fetch verification status
            if (authState.user?.role === "doctor" && (data as any).accountStatus?.verificationStatus) {
              updates.verificationStatus = (data as any).accountStatus.verificationStatus;
            }
            
            updateUser(updates);
          }
        } catch (err) {
          console.error("[v0] Background profile fetch failed:", err);
        }
      };
      
      fetchProfile();
    }
  }, [authState.isAuthenticated, authState.user?.id, authState.user?.role]);

  /* ── Login ── */
  const login = async ({ email, password }: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState((p) => ({ ...p, isLoading: true }));
      const response = await loginService(email, password);

      const user: User = {
        id: response.userId,
        name: response.user?.name || "",
        email: response.user?.email || email,
        role: response.role,
      };

      // For doctors, try to fetch verification status
      if (response.role === "doctor") {
        try {
          const { getDoctorById } = await import("./api");
          const doctorData = await getDoctorById(response.userId);
          if (doctorData?.accountStatus?.verificationStatus) {
            user.verificationStatus = doctorData.accountStatus.verificationStatus;
          }
        } catch (err) {
          console.error("[v0] Failed to fetch doctor verification status:", err);
        }
      }

      writeStoredAuth({ user, expiresAt: Date.now() + SESSION_TTL_MS });
      setAuthState({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      console.error("[v0] Login error:", errorMessage);
      setAuthState((p) => ({ ...p, isLoading: false }));
      return { success: false, error: errorMessage };
    }
  };

  /* ── Register (step 1 – sends OTP, does NOT authenticate) ── */
  const register = async (data: RegisterData): Promise<RegisterResult> => {
    try {
      setAuthState((p) => ({ ...p, isLoading: true }));

      const roleHint = data.role || "patient";
      const response = await registerService({
        name: data.name,
        email: data.email,
        password: data.password,
        roleHint,
        phone: data.phone,
        specialization: data.specialization,
        location: data.location,
        schedule: data.schedule,
        clinicName: data.clinicName,
      });

      setAuthState((p) => ({ ...p, isLoading: false }));

      return {
        success: true,
        email: response.email,
        role: response.role as "patient" | "doctor",
        userId: response.userId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      console.error("[v0] Registration error:", errorMessage);
      setAuthState((p) => ({ ...p, isLoading: false }));
      return { success: false, error: errorMessage };
    }
  };

  /* ── Verify OTP (step 2 – completes signup and authenticates) ── */
  const verifyOtp = async (
    email: string,
    role: "patient" | "doctor",
    otp: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState((p) => ({ ...p, isLoading: true }));
      const response = await verifyEmailOtpService(email, role, otp);

      const user: User = {
        id: response.userId,
        name: "",
        email,
        role: response.role,
      };

      // For doctors, try to fetch verification status
      if (response.role === "doctor") {
        try {
          const { getDoctorById } = await import("./api");
          const doctorData = await getDoctorById(response.userId);
          if (doctorData?.accountStatus?.verificationStatus) {
            user.verificationStatus = doctorData.accountStatus.verificationStatus;
          }
        } catch (err) {
          console.error("[v0] Failed to fetch doctor verification status:", err);
        }
      }

      writeStoredAuth({ user, expiresAt: Date.now() + SESSION_TTL_MS });
      setAuthState({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Verification failed";
      setAuthState((p) => ({ ...p, isLoading: false }));
      return { success: false, error: errorMessage };
    }
  };

  /* ── Google Auth ── */
  const persistGoogleSession = async (
    response: {
      userId: string;
      role: "patient" | "doctor" | "admin";
      name?: string;
      email?: string;
      accessToken: string;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    if (!response?.userId) {
      return { success: false, error: "Invalid response from Google authentication" };
    }

    const user: User = {
      id: response.userId,
      name: response.name || "",
      email: response.email || "",
      role: response.role || "patient",
    };

    if (!["patient", "doctor", "admin"].includes(user.role)) {
      user.role = "patient";
    }

    if (user.role === "doctor") {
      try {
        const { getDoctorById } = await import("./api");
        const doctorData = await getDoctorById(user.id);
        if (doctorData?.accountStatus?.verificationStatus) {
          user.verificationStatus = doctorData.accountStatus.verificationStatus;
        }
      } catch (err) {
        console.error("[v0] Failed to fetch doctor verification status:", err);
      }
    }

    if (isBrowser()) {
      localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    }

    writeStoredAuth({ user, expiresAt: Date.now() + SESSION_TTL_MS });
    setAuthState({ user, isAuthenticated: true, isLoading: false });
    return { success: true };
  };

  const googleAuth = async (idToken: string, roleHint: "patient" | "doctor"): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState((p) => ({ ...p, isLoading: true }));
      const response = await googleAuthService(idToken, roleHint);
      const result = await persistGoogleSession({
        userId: response.user?.id || response.userId,
        role: response.user?.role || response.role || "patient",
        name: response.user?.name,
        email: response.user?.email,
        accessToken: response.accessToken,
      });

      if (!result.success) {
        setAuthState((p) => ({ ...p, isLoading: false }));
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Google authentication failed";
      console.error("[v0] Google auth error:", errorMessage);
      setAuthState((p) => ({ ...p, isLoading: false }));
      return { success: false, error: errorMessage };
    }
  };

  const completeGoogleRedirect = async (
    session: GoogleRedirectSession
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState((p) => ({ ...p, isLoading: true }));

      if (isBrowser()) {
        localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }

      return persistGoogleSession({
        userId: session.userId,
        role: session.role,
        name: session.name,
        email: session.email,
        accessToken: session.accessToken,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Google authentication failed";
      console.error("[google redirect]", errorMessage);
      setAuthState((p) => ({ ...p, isLoading: false }));
      return { success: false, error: errorMessage };
    }
  };

  /* ── Logout ── */
  const logout = async () => {
    try {
      await logoutService();
    } catch (err) {
      console.error("[v0] Logout error:", err);
    }
    if (isBrowser()) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  };

  const getUser = () => authState.user;
  
  const updateUser = (updates: Partial<User>) => {
    setAuthState(prev => {
      if (!prev.user) return prev;
      const updatedUser = { ...prev.user, ...updates };
      
      // Update local storage to persist between refreshes
      if (isBrowser()) {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as StoredAuth;
            parsed.user = updatedUser;
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
          } catch (e) {
            console.error("[v0] Failed to update local storage user:", e);
          }
        }
      }
      
      return { ...prev, user: updatedUser };
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, verifyOtp, googleAuth, completeGoogleRedirect, logout, getUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
