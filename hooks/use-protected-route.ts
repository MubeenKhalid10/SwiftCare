'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/**
 * Hook to protect routes and ensure user is authenticated
 * Redirects to login if not authenticated
 */
export function useProtectedRoute(requiredRole?: "patient" | "doctor" | "admin") {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated
      if (!isAuthenticated) {
        router.push("/auth/login");
        return;
      }

      // Check role if required
      if (requiredRole && user?.role !== requiredRole) {
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
