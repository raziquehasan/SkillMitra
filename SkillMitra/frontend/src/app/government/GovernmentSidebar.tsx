"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Map,
  FileSearch,
  BarChart3,
  Users,
  Briefcase,
  TrendingUp,
  Award,
  BarChart,
  Target,
  ClipboardList,
  FileText,
  Shield,
  UserCircle,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  X,
  Settings,
} from "lucide-react";

interface GovernmentSidebarProps {
  open: boolean;
  onClose: () => void;
  activeSection: string;
  onLogout: () => void;
}

interface NavSection {
  title: string;
  sectionKey: string;
  items: { label: string; href: string; icon: React.ReactNode; action?: string }[];
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    sectionKey: "overview",
    items: [
      { label: "Dashboard", href: "/government", icon: <LayoutDashboard className="h-4 w-4" /> },
    ],
  },
  {
    title: "Training",
    sectionKey: "training",
    items: [
      { label: "Training Programs", href: "/government/training-programs", icon: <GraduationCap className="h-4 w-4" /> },
      { label: "Training Centres", href: "/government/training-centres", icon: <Map className="h-4 w-4" /> },
      { label: "Course Alignment", href: "/government/course-alignment", icon: <FileSearch className="h-4 w-4" /> },
      { label: "Training Capacity", href: "/government/training-capacity", icon: <BarChart3 className="h-4 w-4" /> },
    ],
  },
  {
    title: "Workforce",
    sectionKey: "workforce",
    items: [
      { label: "Candidates", href: "/government/candidates", icon: <Users className="h-4 w-4" /> },
      { label: "Employment Outcomes", href: "/government/employment-outcomes", icon: <Award className="h-4 w-4" /> },
      { label: "Placement Analytics", href: "/government/placement-analytics", icon: <BarChart className="h-4 w-4" /> },
    ],
  },
  {
    title: "Industry",
    sectionKey: "industry",
    items: [
      { label: "Employer Demand", href: "/government/employer-demand", icon: <Briefcase className="h-4 w-4" /> },
      { label: "Employer Insights", href: "/government/employer-insights", icon: <TrendingUp className="h-4 w-4" /> },
      { label: "Industry Surveys", href: "/government/industry-surveys", icon: <FileText className="h-4 w-4" /> },
    ],
  },
  {
    title: "Planning",
    sectionKey: "planning",
    items: [
      { label: "District Training Plan", href: "/government/training-plan", icon: <Target className="h-4 w-4" /> },
      { label: "Capacity Planning", href: "/government/capacity-planning", icon: <ClipboardList className="h-4 w-4" /> },
      { label: "Recommended Actions", href: "/government/recommended-actions", icon: <BarChart className="h-4 w-4" /> },
    ],
  },
  {
    title: "Reports",
    sectionKey: "reports",
    items: [
      { label: "Reports & Analytics", href: "/government/reports", icon: <BarChart3 className="h-4 w-4" /> },
    ],
  },
  {
    title: "System",
    sectionKey: "system",
    items: [
      { label: "Alerts & Notifications", href: "/government/notifications", icon: <Shield className="h-4 w-4" /> },
      { label: "User Management", href: "/government/users", icon: <Users className="h-4 w-4" /> },
      { label: "Settings", href: "/government/settings", icon: <Settings className="h-4 w-4" /> },
    ],
  },
  {
    title: "Account",
    sectionKey: "account",
    items: [
      { label: "My Profile", href: "/government/profile", icon: <UserCircle className="h-4 w-4" /> },
      { label: "Support", href: "/government/support", icon: <HelpCircle className="h-4 w-4" /> },
      { label: "Logout", href: "#", icon: <LogOut className="h-4 w-4" />, action: "logout" },
    ],
  },
];

export function GovernmentSidebar({ open, onClose, activeSection, onLogout }: GovernmentSidebarProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    activeSection,
    "overview",
  ]);

  const toggleSection = (sectionKey: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionKey)
        ? prev.filter((key) => key !== sectionKey)
        : [...prev, sectionKey]
    );
  };

  const isActive = (href: string) => {
    if (href === "/government") return pathname === "/government";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <span className="text-sm font-bold text-[#0a1628]">SkillMitra</span>
        <button
          onClick={onClose}
          className="rounded p-1 hover:bg-slate-100 lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5 text-slate-500" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        {navSections.map((section) => {
          const isExpanded = expandedSections.includes(section.sectionKey);
          const hasActiveItem = section.items.some((item) => isActive(item.href));

          return (
            <div key={section.sectionKey} className="mb-1">
              <button
                onClick={() => toggleSection(section.sectionKey)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  hasActiveItem
                    ? "text-[#0a1628] bg-slate-50"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{section.title}</span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </button>

              {isExpanded && (
                <div className="ml-2 mt-1 space-y-1">
                  {section.items.map((item) => {
                    const active = isActive(item.href);
                    if (item.action === "logout") {
                      return (
                        <button
                          key={item.href}
                          onClick={() => {
                            onLogout();
                            if (window.innerWidth < 1024) onClose();
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </button>
                      );
                    }
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => {
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                          active
                            ? "bg-[#1e3a8a] text-white"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs text-slate-600">Maharashtra Government</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 transform border-r border-slate-200 transition-all duration-300 lg:translate-x-0 lg:static lg:block ${
          open ? "w-64 translate-x-0" : "w-16 -translate-x-full"
        } ${!open ? "lg:w-16 lg:translate-x-0" : ""}`}
      >
        <div className="flex h-full flex-col bg-white">
          {!open && (
            <div className="flex items-center justify-center border-b border-slate-200 px-4 py-3">
              <span className="text-xs font-bold text-[#0a1628]">SM</span>
            </div>
          )}
          {open && (
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <span className="text-sm font-bold text-[#0a1628]">SkillMitra</span>
              <button
                onClick={onClose}
                className="rounded p-1 hover:bg-slate-100 lg:hidden"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
            {navSections.map((section) => {
              const isExpanded = expandedSections.includes(section.sectionKey);
              const hasActiveItem = section.items.some((item) => isActive(item.href));

              return (
                <div key={section.sectionKey} className="mb-1">
                  {open ? (
                    <>
                      <button
                        onClick={() => toggleSection(section.sectionKey)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          hasActiveItem
                            ? "text-[#0a1628] bg-slate-50"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span>{section.title}</span>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="ml-2 mt-1 space-y-1">
                          {section.items.map((item) => {
                            const active = isActive(item.href);
                            if (item.action === "logout") {
                              return (
                                <button
                                  key={item.href}
                                  onClick={() => {
                                    onLogout();
                                    if (window.innerWidth < 1024) onClose();
                                  }}
                                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  {item.icon}
                                  <span>{item.label}</span>
                                </button>
                              );
                            }
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => {
                                  if (window.innerWidth < 1024) onClose();
                                }}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                                  active
                                    ? "bg-[#1e3a8a] text-white"
                                    : "text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                {item.icon}
                                <span>{item.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const active = isActive(item.href);
                        if (item.action === "logout") {
                          return (
                            <button
                              key={item.href}
                              onClick={() => onLogout()}
                              title={item.label}
                              className="flex items-center justify-center rounded-lg px-2 py-2 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              {item.icon}
                            </button>
                          );
                        }
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            title={item.label}
                            className={`flex items-center justify-center rounded-lg px-2 py-2 transition-colors ${
                              active
                                ? "bg-[#1e3a8a] text-white"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {item.icon}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="border-t border-slate-200 p-3">
            {open ? (
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs text-slate-600">Maharashtra Government</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-green-500" title="Maharashtra Government" />
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
