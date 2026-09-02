"use client";

import { useState } from "react";
import { Menu, Bell, User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface TrainingProviderHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  notificationsOpen: boolean;
  onToggleNotifications: () => void;
  profileOpen: boolean;
  onToggleProfile: () => void;
  onLogout: () => void;
}

export function TrainingProviderHeader({
  sidebarOpen,
  onToggleSidebar,
  notificationsOpen,
  onToggleNotifications,
  profileOpen,
  onToggleProfile,
  onLogout,
}: TrainingProviderHeaderProps) {
  const { user } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Toggle & Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-[#1e293b]">Training Provider Portal</h1>
            <p className="text-xs text-slate-500">SkillMitra - Maharashtra Government</p>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button
            onClick={onToggleNotifications}
            className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-slate-600" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileDropdownOpen(!profileDropdownOpen);
                onToggleProfile();
              }}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Profile"
            >
              <div className="h-8 w-8 rounded-full bg-[#1e3a8a] flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-700">{user?.full_name || "User"}</p>
                <p className="text-xs text-slate-500">Training Provider</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-slate-200 shadow-lg">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}