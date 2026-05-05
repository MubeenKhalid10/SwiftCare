'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getAccessToken } from "@/lib/auth.service";

/**
 * Hook to protect routes and ensure user is authenticated with valid access token
 * Redirects to login if not authenticated or token is missing
 */
export function useProtectedRoute(requiredRole?: "patient" | "doctor" | "admin") {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      const accessToken = getAccessToken();

      // Not authenticated or no access token
      if (!isAuthenticated || !accessToken) {
        console.log("[v0] Access denied - redirecting to login (authenticated:", isAuthenticated, "token:", !!accessToken, ")");
        router.push("/auth/login");
        return;
      }

      // Check role if required
      if (requiredRole && user?.role !== requiredRole) {
        console.log("[v0] Role mismatch - redirecting (required:", requiredRole, "actual:", user?.role, ")");
        // Redirect to appropriate dashboard
        if (user?.role === "doctor") {
          router.push("/doctor/dashboard");
        } else if (user?.role === "patient") {
          router.push("/patient/dashboard");
        } else if (user?.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router]);

  return { user, isAuthenticated, isLoading };
}
