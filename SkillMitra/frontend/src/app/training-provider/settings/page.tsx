"use client";

import { TrainingProviderShell } from "@/app/training-provider/TrainingProviderShell";
import { useState } from "react";
import {
  Settings,
  Shield,
  Bell,
  BarChart3,
  FileText,
  User,
  Loader2,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <TrainingProviderShell>
      <SettingsContent />
    </TrainingProviderShell>
  );
}

function SettingsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1e293b]">Settings</h1>
        <p className="mt-2 text-slate-600">
          Manage your account, security, and preferences.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="min-w-0 rounded-lg border border-slate-300 bg-white p-6 shadow-sm overflow-hidden">
          <h2 className="text-lg font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account & Security
          </h2>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
              Change Password
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
              Two-Factor Authentication
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
              Login History
            </button>
          </div>
        </div>

        <div className="min-w-0 rounded-lg border border-slate-300 bg-white p-6 shadow-sm overflow-hidden">
          <h2 className="text-lg font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </h2>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
              Email Notifications
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
              In-App Notifications
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
              SMS Notifications
            </button>
          </div>
        </div>

        <div className="min-w-0 rounded-lg border border-slate-300 bg-white p-6 shadow-sm overflow-hidden">
          <h2 className="text-lg font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Dashboard Preferences
          </h2>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
              Default Time Period
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
              Default District
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
              Default Sector
            </button>
          </div>
        </div>

        <div className="min-w-0 rounded-lg border border-slate-300 bg-white p-6 shadow-sm overflow-hidden">
          <h2 className="text-lg font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Preferences
          </h2>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
              Default Report Format
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
              Auto-Generate Reports
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg">
              Report Delivery Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}