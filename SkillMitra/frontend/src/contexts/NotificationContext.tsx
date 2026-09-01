"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface DemoNotification {
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "info" | "success";
  timestamp: string;
  read: boolean;
  related_module: string | null;
  navigation_url: string | null;
}

interface NotificationContextType {
  notifications: DemoNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  filterBySeverity: (severity: string | null) => DemoNotification[];
  searchNotifications: (query: string) => DemoNotification[];
  resetFilters: () => void;
  resetDemoData: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Demo notification data - intentionally retained as per requirements
const DEMO_NOTIFICATIONS: DemoNotification[] = [
  {
    id: "notif-001",
    title: "District data synchronization requires attention",
    message: "Data sync between district systems and central dashboard shows inconsistencies for Nashik district.",
    severity: "critical",
    timestamp: new Date().toISOString(), // Today
    read: false,
    related_module: "district-intelligence",
    navigation_url: "/government/district-intelligence",
  },
  {
    id: "notif-002",
    title: "Industry demand dataset is pending review",
    message: "Manufacturing sector demand data for Pune region requires validation before quarterly report generation.",
    severity: "warning",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Today
    read: false,
    related_module: "industry-demand",
    navigation_url: "/government/industry-demand",
  },
  {
    id: "notif-003",
    title: "Monthly employment report is available",
    message: "The monthly employment outcomes report for Maharashtra has been generated and is ready for review.",
    severity: "info",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // Today
    read: false,
    related_module: "employment-outcomes",
    navigation_url: "/government/employment-outcomes",
  },
  {
    id: "notif-004",
    title: "Government report generated successfully",
    message: "Quarterly skill gap analysis report has been generated and sent to department heads.",
    severity: "success",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    read: true,
    related_module: "reports",
    navigation_url: "/government/reports",
  },
  {
    id: "notif-005",
    title: "Training capacity data has been updated",
    message: "Training capacity metrics for all districts have been refreshed with latest enrollment data.",
    severity: "info",
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    read: true,
    related_module: "training-capacity",
    navigation_url: "/government/training-capacity",
  },
  {
    id: "notif-006",
    title: "Placement outcome data requires review",
    message: "Placement outcome data for Q3 shows anomalies and requires manual verification.",
    severity: "warning",
    timestamp: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    read: true,
    related_module: "placement-analytics",
    navigation_url: "/government/placement-analytics",
  },
];

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<DemoNotification[]>(DEMO_NOTIFICATIONS);

  // Load notifications from localStorage or use demo data
  useEffect(() => {
    try {
      const stored = localStorage.getItem("skillmitra_demo_notifications");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate that stored data is an array and has expected structure
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
          setNotifications(parsed);
        } else {
          // Corrupted data, reset to demo
          localStorage.removeItem("skillmitra_demo_notifications");
          setNotifications(DEMO_NOTIFICATIONS);
        }
      }
    } catch (e) {
      // If localStorage fails, just use demo data
      console.error("Failed to load notifications from localStorage:", e);
      setNotifications(DEMO_NOTIFICATIONS);
    }
  }, []);

  // Persist to localStorage whenever notifications change
  useEffect(() => {
    try {
      localStorage.setItem("skillmitra_demo_notifications", JSON.stringify(notifications));
    } catch (e) {
      console.error("Failed to save notifications to localStorage:", e);
    }
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filterBySeverity = (severity: string | null) => {
    if (!severity || severity === "all") return notifications;
    return notifications.filter((n) => n.severity === severity);
  };

  const searchNotifications = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return notifications.filter(
      (n) =>
        n.title.toLowerCase().includes(lowerQuery) ||
        n.message.toLowerCase().includes(lowerQuery) ||
        (n.related_module && n.related_module.toLowerCase().includes(lowerQuery))
    );
  };

  const resetFilters = () => {
    return notifications;
  };

  const resetDemoData = () => {
    localStorage.removeItem("skillmitra_demo_notifications");
    setNotifications(DEMO_NOTIFICATIONS);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllRead,
        filterBySeverity,
        searchNotifications,
        resetFilters,
        resetDemoData,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
