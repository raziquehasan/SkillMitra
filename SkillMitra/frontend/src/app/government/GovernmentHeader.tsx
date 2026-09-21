"use client";

import { useState } from "react";
import { Bell, ChevronDown, LogOut, Settings, HelpCircle, User, PanelLeftClose, PanelLeftOpen, Check, AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";

interface GovernmentHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  notificationsOpen: boolean;
  onToggleNotifications: () => void;
  profileOpen: boolean;
  onToggleProfile: () => void;
  onLogout: () => void;
}

function BrandMark({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="inline-flex h-10 items-center border border-slate-300 bg-white px-2 text-xs font-bold text-[#1e3a8a]">
        {alt}
      </span>
    );
  }
  return (
    <img src={src} alt={alt} className={`object-contain ${className ?? ""}`} onError={() => setFailed(true)} />
  );
}

export function GovernmentHeader({
  sidebarOpen,
  onToggleSidebar,
  notificationsOpen,
  onToggleNotifications,
  profileOpen,
  onToggleProfile,
  onLogout,
}: GovernmentHeaderProps) {
  const { user } = useAuth();
  const { notifications, unreadCount, markAllRead, markAsRead } = useNotifications();

  const recentNotifications = notifications.slice(0, 5);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return AlertTriangle;
      case "warning":
        return AlertCircle;
      case "success":
        return CheckCircle;
      default:
        return Info;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      case "success":
        return "text-green-500";
      default:
        return "text-blue-500";
    }
  };

  const initials = user?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "GO";

  return (
    <header className="sticky top-0 z-50 bg-[#1e3a8a] text-white">
      <div className="h-0.5 bg-[#3b82f6]" />
      <div className="mx-auto flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded p-1.5 hover:bg-white/10 transition-colors lg:hidden"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
          </button>
          <div className="flex items-center gap-3">
            <BrandMark
              src="/maharashtra-gov-logo.png"
              alt="Emblem of the Government of Maharashtra"
              className="h-8 w-auto"
            />
            <div className="hidden md:flex flex-col">
              <span className="text-sm font-semibold text-white">Government of Maharashtra</span>
              <span className="text-xs text-white/70 leading-tight">
                Skills, Employment, Entrepreneurship & Innovation Department
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 border-l border-white/20 pl-4">
            <span className="text-xs text-white/60">SkillMitra</span>
            <span className="text-xs text-white/40">Official Portal</span>
          </div>

          <div className="relative">
            <button
              onClick={onToggleNotifications}
              className="relative rounded p-1.5 hover:bg-white/10 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#3b82f6] text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-32px)] rounded-lg border border-slate-200 bg-white shadow-lg z-50">
                <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#1e293b]">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => {
                        markAllRead();
                      }}
                      className="text-xs text-[#1e3a8a] hover:underline flex items-center gap-1"
                    >
                      <Check className="h-3 w-3" />
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {recentNotifications.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {recentNotifications.map((n) => {
                        const Icon = getSeverityIcon(n.severity);
                        return (
                          <div
                            key={n.id}
                            className={`p-3 hover:bg-slate-50 cursor-pointer ${!n.read ? "bg-blue-50/30" : ""}`}
                            onClick={() => {
                              if (!n.read) {
                                markAsRead(n.id);
                              }
                              if (n.navigation_url) {
                                window.location.href = n.navigation_url;
                              }
                            }}
                          >
                            <div className="flex items-start gap-2">
                              <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${getSeverityColor(n.severity)}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-[#1e293b] truncate">{n.title}</p>
                                <p className="text-xs text-slate-500 truncate mt-0.5">{n.message}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                  {new Date(n.timestamp).toLocaleString()}
                                </p>
                              </div>
                              {!n.read && (
                                <div className="w-2 h-2 rounded-full bg-[#c2410c] flex-shrink-0 mt-1" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-xs text-slate-500">No notifications</p>
                    </div>
                  )}
                </div>
                <div className="border-t border-slate-100 px-4 py-2">
                  <Link
                    href="/government/notifications"
                    onClick={onToggleNotifications}
                    className="block text-xs text-center text-[#1e3a8a] hover:underline font-medium"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={onToggleProfile}
              className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-white/10 transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3b82f6] text-xs font-bold">
                {initials}
              </div>
              <span className="hidden text-xs font-medium md:inline">
                {user?.full_name || "User"}
              </span>
              <ChevronDown className="h-3 w-3 text-white/70" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 max-w-[calc(100vw-32px)] rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
                <div className="border-b border-slate-100 px-3 py-2">
                  <p className="text-xs font-semibold text-[#1e293b]">{user?.full_name || "User"}</p>
                  <p className="text-xs text-slate-500">
                    {user?.roles.includes("government_admin") ? "Government Admin" : "Government Official"}
                  </p>
                </div>
                <Link
                  href="/government/profile"
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <User className="h-3.5 w-3.5" />
                  My Profile
                </Link>
                <Link
                  href="/government/settings"
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </Link>
                <Link
                  href="/government/support"
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  Help & Support
                </Link>
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button
                    onClick={onLogout}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
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
