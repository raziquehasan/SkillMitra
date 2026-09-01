"use client";

import { X } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: "critical" | "warning" | "info";
  href: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Critical Skill Gap Identified",
    message: "Pune district shows critical shortage in advanced manufacturing skills.",
    timestamp: "2 minutes ago",
    read: false,
    severity: "critical",
    href: "/government/skill-gaps",
  },
  {
    id: "2",
    title: "Training Capacity Alert",
    message: "Nashik district training capacity is 40% below demand.",
    timestamp: "15 minutes ago",
    read: false,
    severity: "warning",
    href: "/government/training-capacity",
  },
  {
    id: "3",
    title: "New Industry Demand Signal",
    message: "12 new employer postings detected in the IT sector across Mumbai.",
    timestamp: "1 hour ago",
    read: false,
    severity: "info",
    href: "/government/industry-demand",
  },
  {
    id: "4",
    title: "District Training Plan Update",
    message: "Ahmednagar district training plan has been submitted for review.",
    timestamp: "3 hours ago",
    read: true,
    severity: "info",
    href: "/government/training-plan",
  },
];

const severityConfig = {
  critical: {
    badge: "bg-red-100 text-red-800",
    dot: "bg-red-500",
  },
  warning: {
    badge: "bg-yellow-100 text-yellow-800",
    dot: "bg-yellow-500",
  },
  info: {
    badge: "bg-blue-100 text-blue-800",
    dot: "bg-blue-500",
  },
};

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform border-l border-slate-200 bg-white shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-[#123b68]">Notifications</h2>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-slate-100"
            aria-label="Close notifications"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="h-1 bg-[#c2410c]" />

        <div className="flex h-full flex-col overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-3">
            <span className="text-sm text-slate-600">
              {mockNotifications.filter((n) => !n.read).length} unread notifications
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {mockNotifications.map((notification) => {
              const severityStyle = severityConfig[notification.severity];
              return (
                <Link
                  key={notification.id}
                  href={notification.href}
                  onClick={onClose}
                  className={`block border-b border-slate-100 px-5 py-4 hover:bg-slate-50 transition-colors ${
                    !notification.read ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${severityStyle.dot}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-[#123b68] truncate">
                          {notification.title}
                        </p>
                        <span
                          className={`flex-shrink-0 rounded px-2 py-0.5 text-xs font-medium ${severityStyle.badge}`}
                        >
                          {notification.severity}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{notification.timestamp}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
