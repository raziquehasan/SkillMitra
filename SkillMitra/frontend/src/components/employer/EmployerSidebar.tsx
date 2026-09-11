"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";

const menuSections = [
  {
    title: "",
    items: [
      { label: "Dashboard", href: "/employer", icon: "▣" },
    ],
  },
  {
    title: "LABOUR MARKET INTELLIGENCE",
    items: [
      { label: "Industry Demand", href: "/employer/intelligence", icon: "◉" },
      { label: "Emerging Job Roles", href: "/employer/intelligence/roles", icon: "↗" },
      { label: "Required Skills", href: "/employer/intelligence/skills", icon: "◇" },
      { label: "Skill Trends", href: "/employer/intelligence/trends", icon: "⌁" },
    ],
  },
  {
    title: "HIRING",
    items: [
      { label: "My Jobs", href: "/employer/jobs", icon: "▤" },
      { label: "Post a Job", href: "/employer/jobs/new", icon: "+" },
      { label: "Candidates", href: "/employer/candidates", icon: "◉" },
      { label: "Candidate Matching", href: "/employer/candidates/matching", icon: "◇" },
    ],
  },
  {
    title: "SKILL INTELLIGENCE",
    items: [
      { label: "Skill Gaps", href: "/employer/skills/gaps", icon: "△" },
      { label: "Candidate Skill Supply", href: "/employer/skills/supply", icon: "♢" },
      { label: "Hiring Difficulty", href: "/employer/skills/difficulty", icon: "!" },
      { label: "Recommended Skills", href: "/employer/skills/recommended", icon: "★" },
    ],
  },
  {
    title: "TRAINING",
    items: [
      { label: "Recommended Courses", href: "/employer/training/courses", icon: "▥" },
      { label: "Training Providers", href: "/employer/training/providers", icon: "♧" },
      { label: "Training Requirements", href: "/employer/training/requirements", icon: "✓" },
    ],
  },
  {
    title: "INSIGHTS",
    items: [
      { label: "Employer Insights", href: "/employer/insights", icon: "◫" },
      { label: "Industry Survey", href: "/employer/insights/survey", icon: "☷" },
      { label: "Demand Trends", href: "/employer/insights/trends", icon: "↗" },
    ],
  },
  {
    title: "PROFILE",
    items: [
      { label: "My Profile", href: "/employer/profile", icon: "○" },
      { label: "Settings", href: "/employer/settings", icon: "⚙" },
    ],
  },
];

export default function EmployerSidebar() {
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
      
      {/* Logo / Brand */}
      <div className="border-b border-slate-200 px-5 py-5">
        <Link href="/employer" className="block">
          <div className="flex items-center gap-3">
            
            <div className="relative h-12 w-12 shrink-0">
              <Image
                src="/skillmitra-logo.png"
                alt="SkillMitra"
                fill
                className="object-contain"
                priority
              />
            </div>

            <div>
              <p className="text-lg font-bold text-[#123b68]">
                SkillMitra
              </p>

              <p className="text-[11px] leading-tight text-slate-500">
                Employer Portal
              </p>
            </div>

          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-4">
        {menuSections.map((section) => (
          <div key={section.title} className="mb-5">
            
            {section.title && (
              <p className="mb-2 px-3 text-[10px] font-bold tracking-wider text-slate-400">
                {section.title}
              </p>
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/employer"
                    ? pathname === "/employer"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                      isActive
                        ? "bg-[#123b68] font-semibold text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#123b68]"
                    }`}
                  >
                    <span className="flex w-5 justify-center text-sm">
                      {item.icon}
                    </span>

                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="mx-3 mb-4">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex w-5 justify-center text-sm">
            {isLoggingOut ? "..." : "↩"}
          </span>
          <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
}