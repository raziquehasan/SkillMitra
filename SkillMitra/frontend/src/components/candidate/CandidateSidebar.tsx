
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";

const navigation = [
  {
    label: "My Skills",
    href: "/candidate/skills",
    icon: "◆",
  },
  {
    label: "Skill Gap",
    href: "/candidate/skill-gap",
    icon: "△",
  },
  {
    label: "Recommended Skills",
    href: "/candidate/recommended-skills",
    icon: "✓",
  },
  {
    label: "Training & Courses",
    href: "/candidate/training",
    icon: "▤",
  },
  {
    label: "My Learning",
    href: "/candidate/learning",
    icon: "◉",
  },
  {
    label: "Recommended Jobs",
    href: "/candidate/recommended-jobs",
    icon: "★",
  },
  {
    label: "Find Jobs",
    href: "/candidate/jobs",
    icon: "⌕",
  },
  {
    label: "My Applications",
    href: "/candidate/applications",
    icon: "▣",
  },
  {
    label: "Career Recommendation",
    href: "/candidate/career-recommendation",
    icon: "✦",
  },
  {
    label: "Profile",
    href: "/candidate/profile",
    icon: "●",
  },
  {
    label: "Settings",
    href: "/candidate/settings",
    icon: "⚙",
  },
];

export default function CandidateSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await api.logout();
      sessionStorage.removeItem("skillmitra_access_token");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if API call fails, clear local storage and redirect
      sessionStorage.removeItem("skillmitra_access_token");
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="fixed left-0 top-[76px] z-40 hidden h-[calc(100vh-76px)] w-72 overflow-y-auto border-r border-slate-200 bg-white lg:block">
      {/* SkillMitra Sidebar Header */}
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="flex items-center gap-3">
          {/* SkillMitra Logo */}
          <div className="relative h-14 w-14 shrink-0">
            <Image
              src="/skillmitra-logo.png"
              alt="SkillMitra Logo"
              fill
              priority
              className="object-contain"
            />
          </div>

          {/* Portal Name */}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              SkillMitra
            </p>

            <h2 className="mt-1 text-base font-bold text-[#123b68]">
              Candidate Portal
            </h2>

            <p className="mt-1 text-[11px] leading-4 text-slate-500">
              Career & Skill Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-4">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </p>

        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              item.href === "/candidate"
                ? pathname === "/candidate"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#123b68] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-[#123b68]"
                }`}
              >
                {/* Navigation Icon */}
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-base ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "bg-slate-100 text-[#123b68]"
                  }`}
                >
                  {item.icon}
                </span>

                {/* Navigation Label */}
                <span className="truncate">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="mx-3 mb-4">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-red-100 text-red-600">
            {isLoggingOut ? "..." : "↩"}
          </span>
          <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </div>

      {/* Candidate Intelligence Card */}
      <div className="mx-4 mb-5 mt-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-[#123b68] shadow-sm">
            ✦
          </div>

          <p className="text-xs font-semibold text-[#123b68]">
            Candidate Intelligence
          </p>
        </div>

        <p className="mt-2 text-[11px] leading-5 text-slate-600">
          Find suitable jobs, understand your skill gaps and explore
          relevant training opportunities.
        </p>
      </div>
    </aside>
  );
}

