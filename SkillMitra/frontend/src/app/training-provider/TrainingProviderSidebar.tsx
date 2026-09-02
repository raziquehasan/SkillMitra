"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Users,
  Factory,
  MapPin,
  Building2,
  BarChart3,
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

interface TrainingProviderSidebarProps {
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
      { label: "Dashboard", href: "/training-provider", icon: <LayoutDashboard className="h-4 w-4" /> },
    ],
  },
  {
    title: "Training",
    sectionKey: "training",
    items: [
      { label: "My Courses", href: "/training-provider/courses", icon: <GraduationCap className="h-4 w-4" /> },
      { label: "Curriculum Alignment", href: "/training-provider/curriculum-alignment", icon: <BookOpen className="h-4 w-4" /> },
      { label: "Training Capacity", href: "/training-provider/training-capacity", icon: <TrendingUp className="h-4 w-4" /> },
      { label: "Training Schedule", href: "/training-provider/training-schedule", icon: <Users className="h-4 w-4" /> },
    ],
  },
  {
    title: "Intelligence",
    sectionKey: "intelligence",
    items: [
      { label: "Industry Demand", href: "/training-provider/industry-demand", icon: <Factory className="h-4 w-4" /> },
      { label: "Skill Gaps", href: "/training-provider/skill-gaps", icon: <MapPin className="h-4 w-4" /> },
      { label: "District Demand", href: "/training-provider/district-demand", icon: <Building2 className="h-4 w-4" /> },
    ],
  },
  {
    title: "Operations",
    sectionKey: "operations",
    items: [
      { label: "Trainers", href: "/training-provider/trainers", icon: <Users className="h-4 w-4" /> },
      { label: "Equipment & Infrastructure", href: "/training-provider/equipment", icon: <Building2 className="h-4 w-4" /> },
      { label: "Enrollments", href: "/training-provider/enrollments", icon: <Users className="h-4 w-4" /> },
      { label: "Assessments & Outcomes", href: "/training-provider/assessments", icon: <FileText className="h-4 w-4" /> },
    ],
  },
  {
    title: "Reports",
    sectionKey: "reports",
    items: [
      { label: "Reports & Analytics", href: "/training-provider/reports", icon: <BarChart3 className="h-4 w-4" /> },
    ],
  },
  {
    title: "Institute",
    sectionKey: "institute",
    items: [
      { label: "Institute Profile", href: "/training-provider/institute-profile", icon: <Building2 className="h-4 w-4" /> },
      { label: "Certifications & Compliance", href: "/training-provider/certifications", icon: <Shield className="h-4 w-4" /> },
    ],
  },
  {
    title: "Account",
    sectionKey: "account",
    items: [
      { label: "Notifications", href: "/training-provider/notifications", icon: <Shield className="h-4 w-4" /> },
      { label: "Support", href: "/training-provider/support", icon: <HelpCircle className="h-4 w-4" /> },
      { label: "Profile", href: "/training-provider/profile", icon: <UserCircle className="h-4 w-4" /> },
      { label: "Settings", href: "/training-provider/settings", icon: <Settings className="h-4 w-4" /> },
      { label: "Logout", href: "#", icon: <LogOut className="h-4 w-4" />, action: "logout" },
    ],
  },
];

export function TrainingProviderSidebar({ open, onClose, activeSection, onLogout }: TrainingProviderSidebarProps) {
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
    if (href === "/training-provider") return pathname === "/training-provider";
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
          <span className="text-xs text-slate-600">Training Provider Portal</span>
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
                <span className="text-xs text-slate-600">Training Provider Portal</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-green-500" title="Training Provider Portal" />
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}