"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Not authenticated
    if (!isAuthenticated || !user) {
      router.push(redirectTo);
      return;
    }

    // Check role permissions if roles are specified
    if (allowedRoles && allowedRoles.length > 0) {
      const hasRequiredRole = allowedRoles.some((role) =>
        user.roles.includes(role)
      );

      if (!hasRequiredRole) {
        // Redirect to appropriate dashboard based on user's actual role
        if (user.roles.includes("candidate")) {
          router.push("/candidate");
        } else if (user.roles.includes("employer")) {
          router.push("/employer");
        } else if (user.roles.includes("training_provider")) {
          router.push("/training-provider");
        } else if (user.roles.includes("government_official") || user.roles.includes("government_admin")) {
          router.push("/government");
        } else {
          // Fallback to home if role is unrecognized
          router.push("/");
        }
        return;
      }
    }
  }, [loading, isAuthenticated, user, allowedRoles, redirectTo, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7fa]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#123b68] border-r-transparent"></div>
          <p className="mt-4 text-sm text-slate-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or wrong role (redirect will happen)
  if (!isAuthenticated || !user) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.some((role) =>
      user.roles.includes(role)
    );
    if (!hasRequiredRole) {
      return null;
    }
  }

  return <>{children}</>;
}