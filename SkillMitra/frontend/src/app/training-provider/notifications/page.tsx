"use client";

import { TrainingProviderShell } from "@/app/training-provider/TrainingProviderShell";
import { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Loader2,
  X,
} from "lucide-react";

export default function NotificationsPage() {
  return (
    <TrainingProviderShell>
      <NotificationsContent />
    </TrainingProviderShell>
  );
}

function NotificationsContent() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // For now, use fallback data since backend notification endpoint might not exist
      setNotifications(getFallbackNotifications());
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications(getFallbackNotifications());
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === "all") return true;
    return notif.category === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a] mx-auto" />
          <p className="mt-4 text-sm text-slate-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1e293b]">Notifications</h1>
          <p className="mt-2 text-slate-600">
            Stay updated with important alerts and updates.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
          Mark all as read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {["all", "critical", "action_required", "information", "system"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === f
                ? "bg-[#1e3a8a] text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {f.replace("_", " ").toUpperCase()}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-500">
            No notifications found.
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-lg border ${
                !notif.read ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  notif.category === "critical" ? "bg-red-100 text-red-600" :
                  notif.category === "action_required" ? "bg-yellow-100 text-yellow-600" :
                  notif.category === "information" ? "bg-blue-100 text-blue-600" :
                  "bg-slate-100 text-slate-600"
                }`}>
                  {notif.category === "critical" && <AlertTriangle className="h-5 w-5" />}
                  {notif.category === "action_required" && <Clock className="h-5 w-5" />}
                  {notif.category === "information" && <Info className="h-5 w-5" />}
                  {notif.category === "system" && <Bell className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-[#1e293b]">{notif.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                    </div>
                    {!notif.read && (
                      <button className="p-1 hover:bg-slate-200 rounded-lg">
                        <X className="h-4 w-4 text-slate-400" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{notif.time}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function getFallbackNotifications() {
  return [
    {
      id: "1",
      title: "EV Technology demand increased by 18%",
      message: "Industry demand for EV Technology skills has increased significantly in your district. Consider expanding related training programs.",
      category: "critical",
      read: false,
      time: "2 hours ago",
    },
    {
      id: "2",
      title: "CNC course utilization crossed 90%",
      message: "Your CNC Machine Operator course is at 90% capacity. Consider adding more batches or expanding capacity.",
      category: "action_required",
      read: false,
      time: "5 hours ago",
    },
    {
      id: "3",
      title: "2 trainer certifications expire this month",
      message: "Trainers Rajesh Kumar and Priya Sharma have certifications expiring within 30 days. Schedule renewal training.",
      category: "action_required",
      read: false,
      time: "1 day ago",
    },
    {
      id: "4",
      title: "Curriculum review required for 3 courses",
      message: "The following courses require curriculum review: Electric Vehicle Service, Python Programming, and Industrial Safety.",
      category: "information",
      read: true,
      time: "2 days ago",
    },
    {
      id: "5",
      title: "System maintenance scheduled",
      message: "Scheduled system maintenance on Sunday 2AM-4AM. Some features may be temporarily unavailable.",
      category: "system",
      read: true,
      time: "3 days ago",
    },
  ];
}