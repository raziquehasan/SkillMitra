"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function IndustrySettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [demandAlerts, setDemandAlerts] = useState(true);
  const [workforceAlerts, setWorkforceAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [employerProfile, setEmployerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Try to fetch employer profile if authenticated
        const profile = await api.me().catch(() => null);
        if (profile) {
          setEmployerProfile(profile);
        }
      } catch (err) {
        console.error("Failed to load employer profile:", err);
        // Don't set error for settings page - allow anonymous access
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-slate-800">
      {/* Government Header */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-[#123b68] text-white">
        <div className="flex h-[60px] items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image
                src="/government-logo.png"
                alt="Government Logo"
                fill
                className="object-contain"
              />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Government of Maharashtra
              </p>

              <p className="text-[11px] text-blue-100">
                Skill Development & Workforce Intelligence
              </p>
            </div>
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium">Industry Portal</p>

            <p className="text-[11px] text-blue-100">
              Workforce Planning System
            </p>
          </div>
        </div>
      </header>

      {/* Orange Line */}
      <div className="fixed left-0 right-0 top-[60px] z-50 h-1 bg-[#c2410c]" />

      <div className="flex min-h-screen pt-[65px]">
        {/* Sidebar */}
        <aside className="fixed bottom-0 left-0 top-[65px] z-20 hidden w-72 overflow-y-auto border-r border-slate-200 bg-white lg:block">
          <div className="flex h-28 items-center gap-3 border-b border-slate-200 px-7">
            <div className="relative h-14 w-14 shrink-0">
              <Image
                src="/skillmitra-logo.png"
                alt="SkillMitra"
                fill
                className="object-contain"
              />
            </div>

            <div>
              <h1 className="text-xl font-bold text-[#123b68]">
                SkillMitra
              </h1>

              <p className="text-xs text-slate-500">
                Industry Portal
              </p>
            </div>
          </div>

          <nav className="p-4">
            {/* Industry Intelligence */}
            <div className="mb-6">
              <p className="mb-3 px-3 text-[11px] font-bold tracking-wider text-slate-400">
                INDUSTRY INTELLIGENCE
              </p>

              <div className="space-y-1">
                <a
                  href="/industry"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Dashboard
                </a>

                <a
                  href="/industry/demand"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Industry Demand
                </a>

                <a
                  href="/industry/skills"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Required Skills
                </a>

                <a
                  href="/industry/workforce"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Workforce Gap
                </a>

                <a
                  href="/industry/roles"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Emerging Job Roles
                </a>

                <a
                  href="/industry/trends"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Skill Trends
                </a>
              </div>
            </div>

            {/* Industry Requirements */}
            <div>
              <p className="mb-3 px-3 text-[11px] font-bold tracking-wider text-slate-400">
                INDUSTRY REQUIREMENTS
              </p>

              <div className="space-y-1">
                <a
                  href="/industry/requirements"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Workforce Requirements
                </a>

                <a
                  href="/industry/profile"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Industry Profile
                </a>

                <a
                  href="/industry/settings"
                  className="block rounded-lg bg-[#123b68] px-3 py-2.5 text-sm font-medium text-white"
                >
                  Settings
                </a>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <section className="min-w-0 flex-1 lg:ml-72">
          <div className="space-y-7 p-6 lg:p-10">
            {/* Intro */}
            <div>
              <p className="text-sm font-semibold text-[#c2410c]">
                SETTINGS
              </p>

              <h2 className="mt-1 text-3xl font-bold text-[#123b68]">
                Portal Settings
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Manage your industry portal preferences, notifications and
                account settings.
              </p>
            </div>

            {/* Account Settings */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h3 className="text-lg font-bold text-[#123b68]">
                  Account Information
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {employerProfile 
                    ? "Your industry portal account information."
                    : "Login to view your industry portal account information."}
                </p>
              </div>

              <div className="grid gap-5 p-6 md:grid-cols-2">
                {employerProfile ? (
                  <>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Full Name
                      </label>

                      <input
                        type="text"
                        value={employerProfile.full_name || "Not set"}
                        readOnly
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Email
                      </label>

                      <input
                        type="text"
                        value={employerProfile.email || "Not set"}
                        readOnly
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Roles
                      </label>

                      <input
                        type="text"
                        value={employerProfile.roles?.join(", ") || "Not set"}
                        readOnly
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Account Status
                      </label>

                      <div className="mt-2 flex h-[46px] items-center">
                        <span className={`rounded-full px-4 py-2 text-xs font-bold ${
                          employerProfile.is_active 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {employerProfile.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-sm text-slate-500 mb-4">
                      Please login to view and manage your industry portal account settings.
                    </p>
                    <button
                      onClick={() => window.location.href = "/login"}
                      className="px-4 py-2 bg-[#123b68] text-white text-sm rounded hover:bg-[#123b68]/90"
                    >
                      Login to Account
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Notification Settings */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h3 className="text-lg font-bold text-[#123b68]">
                  Notification Settings
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Choose which updates and alerts you want to receive.
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {/* Email Notifications */}
                <div className="flex items-center justify-between gap-5 px-6 py-5">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Email Notifications
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Receive important portal updates through email.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setEmailNotifications(!emailNotifications)
                    }
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      emailNotifications
                        ? "bg-[#123b68]"
                        : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                        emailNotifications
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Demand Alerts */}
                <div className="flex items-center justify-between gap-5 px-6 py-5">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Industry Demand Alerts
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Get notified when major industry demand changes are
                      detected.
                    </p>
                  </div>

                  <button
                    onClick={() => setDemandAlerts(!demandAlerts)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      demandAlerts ? "bg-[#123b68]" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                        demandAlerts ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Workforce Alerts */}
                <div className="flex items-center justify-between gap-5 px-6 py-5">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Workforce Gap Alerts
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Receive alerts about significant workforce shortages.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setWorkforceAlerts(!workforceAlerts)
                    }
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      workforceAlerts
                        ? "bg-[#123b68]"
                        : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                        workforceAlerts
                          ? "left-6"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Weekly Report */}
                <div className="flex items-center justify-between gap-5 px-6 py-5">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Weekly Workforce Report
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Receive a weekly summary of industry workforce
                      intelligence.
                    </p>
                  </div>

                  <button
                    onClick={() => setWeeklyReport(!weeklyReport)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                      weeklyReport ? "bg-[#123b68]" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                        weeklyReport ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Dashboard Preferences */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h3 className="text-lg font-bold text-[#123b68]">
                  Dashboard Preferences
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Customize the information displayed in your industry
                  dashboard.
                </p>
              </div>

              <div className="grid gap-5 p-6 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Default Sector
                  </label>

                  <select className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#123b68]">
                    <option>EV / Automotive</option>
                    <option>IT / Technology</option>
                    <option>Manufacturing</option>
                    <option>All Sectors</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Default Time Range
                  </label>

                  <select className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#123b68]">
                    <option>Current Year</option>
                    <option>Last 6 Months</option>
                    <option>Last 12 Months</option>
                    <option>Next 2 Years</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h3 className="text-lg font-bold text-[#123b68]">
                  Security
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Manage account security and login preferences.
                </p>
              </div>

              <div className="space-y-4 p-6">
                <div className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 p-4 md:flex-row md:items-center">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Password
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Last changed recently.
                    </p>
                  </div>

                  <button className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    Change Password
                  </button>
                </div>

                <div className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 p-4 md:flex-row md:items-center">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Two-Factor Authentication
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Add an extra layer of security to your account.
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-semibold text-yellow-700">
                    Not Enabled
                  </span>
                </div>
              </div>
            </div>

            {/* Save Settings */}
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50 p-6 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-bold text-[#123b68]">
                  Save your preferences
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  Your notification and dashboard preferences can be updated
                  at any time.
                </p>
              </div>

              <button 
                onClick={() => alert("Settings saved successfully!")}
                className="rounded-lg bg-[#123b68] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#0f3157]"
              >
                Save Settings
              </button>
            </div>

            {/* Data Source Notice */}
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-6">
              <div className="flex items-start gap-4">
                <div className="text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#123b68]">Account Integration</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    This page displays user account information from the SkillMitra authentication system via the 
                    <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">/api/v1/auth/me</code> endpoint. 
                    Full employer profile integration requires additional backend endpoints.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}