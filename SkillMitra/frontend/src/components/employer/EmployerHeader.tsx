
"use client";

import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function EmployerHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="fixed right-0 top-76px z-30 h-20 border-b border-slate-200 bg-white lg:left-72">
      <div className="flex h-full items-center justify-between px-5 lg:px-8">

        {/* Branding */}
        <div className="flex items-center gap-4">

          {/* Government Logo */}
          <div className="relative h-12 w-12 shrink-0">
            <Image
              src="/government-logo.png"
              alt="Government of Maharashtra"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Government Text */}
          <div className="hidden md:block">
            <p className="text-xs font-medium text-slate-500">
              Government of Maharashtra
            </p>

            <h2 className="text-sm font-semibold text-[#123b68]">
              Skills, Employment, Entrepreneurship & Innovation Department
            </h2>
          </div>

          {/* Divider */}
          <div className="hidden h-10 w-px bg-slate-300 md:block" />

          {/* SkillMitra Logo */}
          <div className="relative h-12 w-12 shrink-0">
            <Image
              src="/skillmitra-logo.png"
              alt="SkillMitra"
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* SkillMitra Text */}
          <div className="hidden sm:block">
            <p className="text-xs text-slate-400">
              SkillMitra
            </p>

            <p className="font-semibold text-[#123b68]">
              Employer Intelligence Dashboard
            </p>
          </div>

        </div>

        {/* Profile */}
        <div className="relative">

          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50"
          >

            {/* Avatar */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#123b68] text-sm font-bold text-white">
              {user?.full_name?.charAt(0)?.toUpperCase() || "E"}
            </div>

            {/* User Information */}
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-slate-700">
                {user?.full_name || "Employer"}
              </p>

              <p className="text-xs text-slate-500">
                Employer
              </p>
            </div>

            <span className="text-xs text-slate-400">
              ▼
            </span>

          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 top-14 w-52 rounded-lg border border-slate-200 bg-white py-2 shadow-lg">

              <button
                onClick={() => {
                  setProfileOpen(false);
                  router.push("/employer/profile");
                }}
                className="block w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50"
              >
                My Profile
              </button>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  router.push("/employer/settings");
                }}
                className="block w-full px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50"
              >
                Settings
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Logout
              </button>

            </div>
          )}

        </div>

      </div>
    </header>
  );
}

