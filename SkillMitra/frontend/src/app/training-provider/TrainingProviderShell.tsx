"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { TrainingProviderLayout } from "@/app/training-provider/TrainingProviderLayout";
import { useAuth } from "@/contexts/AuthContext";

interface TrainingProviderShellProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function TrainingProviderShell({
  children,
  allowedRoles = ["training_provider"],
}: TrainingProviderShellProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    const hasRequiredRole = allowedRoles.some((role) => user.roles.includes(role));
    if (hasRequiredRole) {
      setAuthorized(true);
    } else {
      const redirectMap: Record<string, string> = {
        candidate: "/candidate",
        employer: "/employer",
        training_provider: "/training-provider",
        government_official: "/government",
        government_admin: "/government",
      };
      const userRole = user.roles[0];
      router.push(redirectMap[userRole] || "/");
    }
  }, [loading, isAuthenticated, user, allowedRoles, router]);

  if (!authorized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7fa]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1e3a8a] border-r-transparent" />
          <p className="mt-4 text-sm text-slate-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return <TrainingProviderLayout>{children}</TrainingProviderLayout>;
}