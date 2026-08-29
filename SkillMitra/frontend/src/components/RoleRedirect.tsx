"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function RoleRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    // Redirect based on user's role
    if (user.roles.includes("candidate")) {
      router.push("/candidate");
    } else if (user.roles.includes("employer")) {
      router.push("/employer");
    } else if (user.roles.includes("training_provider")) {
      router.push("/training-provider");
    } else if (user.roles.includes("government_official") || user.roles.includes("government_admin")) {
      router.push("/government");
    } else {
      // Fallback for unrecognized roles
      router.push("/");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7fa]">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#123b68] border-r-transparent"></div>
        <p className="mt-4 text-sm text-slate-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}