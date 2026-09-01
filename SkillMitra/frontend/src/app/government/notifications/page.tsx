"use client";

import { useState, useMemo } from "react";
import { GovernmentShell } from "@/app/government/GovernmentShell";
import { useNotifications, type DemoNotification } from "@/contexts/NotificationContext";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Filter,
  Search,
  X,
  Loader2,
  Inbox,
  Check,
} from "lucide-react";

type SeverityFilter = "all" | "critical" | "warning" | "info" | "success" | "unread";

const severityConfig = {
  critical: { icon: AlertTriangle, badge: "bg-red-100 text-red-800 border-red-200", dot: "bg-red-500" },
  warning: { icon: AlertCircle, badge: "bg-yellow-100 text-yellow-800 border-yellow-200", dot: "bg-yellow-500" },
  info: { icon: Info, badge: "bg-blue-100 text-blue-800 border-blue-200", dot: "bg-blue-500" },
  success: { icon: CheckCircle, badge: "bg-green-100 text-green-800 border-green-200", dot: "bg-green-500" },
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllRead, resetDemoData } = useNotifications();
  const [filter, setFilter] = useState<SeverityFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotification, setSelectedNotification] = useState<DemoNotification | null>(null);

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Apply severity filter
    if (filter === "unread") {
      filtered = filtered.filter((n) => !n.read);
    } else if (filter !== "all") {
      filtered = filtered.filter((n) => n.severity === filter);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query) ||
          (n.related_module && n.related_module.toLowerCase().includes(query))
      );
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications, filter, searchQuery]);

  // Group notifications by time period
  const groupedNotifications = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayNotifications: DemoNotification[] = [];
    const earlierNotifications: DemoNotification[] = [];

    filteredNotifications.forEach((n) => {
      const notifDate = new Date(n.timestamp);
      notifDate.setHours(0, 0, 0, 0);

      if (notifDate.getTime() === today.getTime()) {
        todayNotifications.push(n);
      } else {
        earlierNotifications.push(n);
      }
    });

    return { today: todayNotifications, earlier: earlierNotifications };
  }, [filteredNotifications]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    return {
      total: notifications.length,
      unread: notifications.filter((n) => !n.read).length,
      critical: notifications.filter((n) => n.severity === "critical").length,
      today: notifications.filter((n) => {
        const today = new Date();
        const notifDate = new Date(n.timestamp);
        return (
          notifDate.getDate() === today.getDate() &&
          notifDate.getMonth() === today.getMonth() &&
          notifDate.getFullYear() === today.getFullYear()
        );
      }).length,
    };
  }, [notifications]);

  const handleResetFilters = () => {
    setFilter("all");
    setSearchQuery("");
  };

  const hasActiveFilters = filter !== "all" || searchQuery.trim() !== "";

  return (
    <GovernmentShell>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
          <span>Government Portal</span>
          <span>/</span>
          <span className="text-[#1e3a8a] font-medium">Alerts & Notifications</span>
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="h-7 w-7 text-[#1e3a8a]" />
            <h1 className="text-3xl font-bold text-[#1e293b]">Alerts & Notifications</h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold bg-[#c2410c] text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-slate-600">
            System alerts, data updates, reports and platform notifications.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Total</p>
            <p className="text-2xl font-bold text-[#1e3a8a]">{summaryStats.total}</p>
          </div>
          <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Unread</p>
            <p className="text-2xl font-bold text-[#c2410c]">{summaryStats.unread}</p>
          </div>
          <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Critical</p>
            <p className="text-2xl font-bold text-red-600">{summaryStats.critical}</p>
          </div>
          <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Today</p>
            <p className="text-2xl font-bold text-[#1e3a8a]">{summaryStats.today}</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
              />
            </div>

            {/* Severity Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-slate-500" />
              {(["all", "unread", "critical", "warning", "info", "success"] as SeverityFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    filter === s
                      ? "bg-[#1e3a8a] text-white border-[#1e3a8a]"
                      : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {/* Reset */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Mark All Read */}
        <div className="mb-4 flex justify-between items-center">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#1e3a8a] border border-[#1e3a8a] rounded-lg hover:bg-[#1e3a8a]/5 transition-colors"
            >
              <Check className="h-4 w-4" />
              Mark all as read
            </button>
          )}
          <button
            onClick={resetDemoData}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            title="Reset demo notifications to initial state"
          >
            Reset demo data
          </button>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-6">
            {/* Today */}
            {groupedNotifications.today.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1e3a8a]" />
                  Today
                </h3>
                <div className="space-y-3">
                  {groupedNotifications.today.map((n) => {
                    const config = severityConfig[n.severity as keyof typeof severityConfig] || severityConfig.info;
                    const Icon = config.icon;
                    return (
                      <div
                        key={n.id}
                        className={`rounded-lg border bg-white shadow-sm transition-all ${
                          !n.read ? "border-l-4 border-l-[#c2410c] border-slate-300" : "border-slate-300"
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Severity Icon */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.badge}`}>
                              <Icon className="h-5 w-5" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-1">
                                <h3 className={`text-sm font-semibold ${!n.read ? "text-[#1e293b]" : "text-slate-600"}`}>
                                  {n.title}
                                </h3>
                                <span className="text-xs text-slate-500 whitespace-nowrap">
                                  {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 mb-2">{n.message}</p>
                              <div className="flex items-center gap-4 text-xs">
                                {n.related_module && (
                                  <span className="text-slate-500">
                                    Module: <span className="font-medium text-slate-700">{n.related_module}</span>
                                  </span>
                                )}
                                {!n.read && (
                                  <button
                                    onClick={() => markAsRead(n.id)}
                                    className="text-[#c2410c] font-medium hover:underline"
                                  >
                                    Mark as read
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              {!n.read && (
                                <div className="w-2 h-2 rounded-full bg-[#c2410c]" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Earlier */}
            {groupedNotifications.earlier.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Earlier
                </h3>
                <div className="space-y-3">
                  {groupedNotifications.earlier.map((n) => {
                    const config = severityConfig[n.severity as keyof typeof severityConfig] || severityConfig.info;
                    const Icon = config.icon;
                    return (
                      <div
                        key={n.id}
                        className={`rounded-lg border bg-white shadow-sm transition-all ${
                          !n.read ? "border-l-4 border-l-[#c2410c] border-slate-300" : "border-slate-300"
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Severity Icon */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.badge}`}>
                              <Icon className="h-5 w-5" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-1">
                                <h3 className={`text-sm font-semibold ${!n.read ? "text-[#1e293b]" : "text-slate-600"}`}>
                                  {n.title}
                                </h3>
                                <span className="text-xs text-slate-500 whitespace-nowrap">
                                  {new Date(n.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 mb-2">{n.message}</p>
                              <div className="flex items-center gap-4 text-xs">
                                {n.related_module && (
                                  <span className="text-slate-500">
                                    Module: <span className="font-medium text-slate-700">{n.related_module}</span>
                                  </span>
                                )}
                                {!n.read && (
                                  <button
                                    onClick={() => markAsRead(n.id)}
                                    className="text-[#c2410c] font-medium hover:underline"
                                  >
                                    Mark as read
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              {!n.read && (
                                <div className="w-2 h-2 rounded-full bg-[#c2410c]" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-300 bg-white p-12 shadow-sm text-center">
            <Inbox className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-sm text-slate-500 mb-2">No notifications found</p>
            <p className="text-xs text-slate-400">
              {hasActiveFilters
                ? "Try adjusting your filters or search query."
                : "Notifications will appear here as system events occur."}
            </p>
          </div>
        )}
      </div>
    </GovernmentShell>
  );
}
