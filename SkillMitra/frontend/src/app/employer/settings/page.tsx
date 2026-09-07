"use client";

import Image from "next/image";
import { useState } from "react";
import EmployerSidebar from "@/components/employer/EmployerSidebar";

export default function EmployerSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [candidateAlerts, setCandidateAlerts] = useState(true);
  const [skillGapAlerts, setSkillGapAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-slate-800">
      {/* Government Header */}
      <header className="fixed left-0 right-0 top-0 z-50 h-[72px] bg-[#123b68] text-white">
        <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-6 text-sm">
          <div className="flex items-center gap-3">
            <Image
              src="/maharashtra-gov-logo.png"
              alt="Government of Maharashtra"
              width={48}
              height={48}
              priority
              className="h-12 w-12 object-contain"
            />

            <div>
              <div className="font-semibold">
                Government of Maharashtra
              </div>

              <div className="text-[11px] text-blue-100">
                Skills, Employment, Entrepreneurship & Innovation Department
              </div>
            </div>
          </div>

          <div className="hidden font-semibold md:block">
            SkillMitra | Employer Intelligence Portal
          </div>
        </div>
      </header>

      {/* Orange Government Line */}
      <div className="fixed left-0 right-0 top-[72px] z-50 h-1 bg-[#c2410c]" />

      <div className="min-h-screen pt-[76px]">
        {/* Common Employer Sidebar */}
        <EmployerSidebar />

        {/* Main Content */}
        <section className="min-w-0 lg:ml-72">
          {/* Page Header */}
          <div className="border-b border-slate-200 bg-white px-5 py-4 lg:px-8">
            <div className="mx-auto flex max-w-[1250px] items-center gap-4">
              <div className="relative h-14 w-14 shrink-0">
                <Image
                  src="/skillmitra-logo.png"
                  alt="SkillMitra"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  SkillMitra
                </p>

                <p className="font-semibold text-[#123b68]">
                  Employer Settings Portal
                </p>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">
            
            {/* Page Introduction */}
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-[#123b68]">
                Settings
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your Employer Portal preferences, notifications,
                alerts and account settings.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">

              {/* Left Main Settings */}
              <div className="space-y-6 lg:col-span-2">

                {/* Notification Settings */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-xl">
                        🔔
                      </div>

                      <div>
                        <h2 className="font-semibold text-[#123b68]">
                          Notification Settings
                        </h2>

                        <p className="text-xs text-slate-500">
                          Control how SkillMitra sends notifications.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100">

                    <SettingToggle
                      title="Email Notifications"
                      description="Receive important Employer Portal updates by email."
                      enabled={emailNotifications}
                      onChange={() =>
                        setEmailNotifications(!emailNotifications)
                      }
                    />

                    <SettingToggle
                      title="Job & Workforce Alerts"
                      description="Get alerts related to job postings and workforce demand."
                      enabled={jobAlerts}
                      onChange={() => setJobAlerts(!jobAlerts)}
                    />

                    <SettingToggle
                      title="Candidate Alerts"
                      description="Receive notifications when suitable candidates are available."
                      enabled={candidateAlerts}
                      onChange={() =>
                        setCandidateAlerts(!candidateAlerts)
                      }
                    />

                    <SettingToggle
                      title="Skill Gap Alerts"
                      description="Receive updates about important skill shortages."
                      enabled={skillGapAlerts}
                      onChange={() =>
                        setSkillGapAlerts(!skillGapAlerts)
                      }
                    />

                    <SettingToggle
                      title="Weekly Intelligence Report"
                      description="Receive a weekly summary of workforce intelligence."
                      enabled={weeklyReports}
                      onChange={() =>
                        setWeeklyReports(!weeklyReports)
                      }
                    />

                  </div>
                </div>

                {/* Employer Portal Preferences */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xl">
                        ⚙️
                      </div>

                      <div>
                        <h2 className="font-semibold text-[#123b68]">
                          Portal Preferences
                        </h2>

                        <p className="text-xs text-slate-500">
                          Configure your Employer Portal experience.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 p-6">

                    {/* Default Dashboard */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Default Dashboard
                      </label>

                      <select
                        defaultValue="intelligence"
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68] lg:max-w-md"
                      >
                        <option value="intelligence">
                          Employer Intelligence
                        </option>

                        <option value="jobs">
                          My Jobs
                        </option>

                        <option value="candidates">
                          Candidate Matching
                        </option>

                        <option value="skills">
                          Skill Intelligence
                        </option>
                      </select>
                    </div>

                    {/* Default District */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Default District
                      </label>

                      <select
                        defaultValue="pune"
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68] lg:max-w-md"
                      >
                        <option value="pune">Pune</option>
                        <option value="mumbai">Mumbai</option>
                        <option value="nashik">Nashik</option>
                        <option value="nagpur">Nagpur</option>
                        <option value="aurangabad">Aurangabad</option>
                      </select>
                    </div>

                    {/* Default Sector */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Default Sector
                      </label>

                      <select
                        defaultValue="automotive"
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68] lg:max-w-md"
                      >
                        <option value="automotive">
                          Automotive & EV
                        </option>

                        <option value="technology">
                          IT & Technology
                        </option>

                        <option value="manufacturing">
                          Manufacturing
                        </option>

                        <option value="data">
                          Data & Analytics
                        </option>

                        <option value="electrical">
                          Electrical
                        </option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        className="rounded-lg bg-[#123b68] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0e3155]"
                      >
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-xl">
                        🔐
                      </div>

                      <div>
                        <h2 className="font-semibold text-[#123b68]">
                          Security Settings
                        </h2>

                        <p className="text-xs text-slate-500">
                          Manage your Employer Portal security.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-6">

                    <div className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          Password
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Update your account password regularly.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="rounded-lg border border-[#123b68] px-4 py-2 text-sm font-medium text-[#123b68] hover:bg-blue-50"
                      >
                        Change Password
                      </button>
                    </div>

                    <div className="flex flex-col justify-between gap-4 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          Account Security
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Your Employer Portal account is protected.
                        </p>
                      </div>

                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Protected
                      </span>
                    </div>

                  </div>
                </div>

              </div>

              {/* Right Side */}
              <div className="space-y-6">

                {/* Settings Summary */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="font-semibold text-[#123b68]">
                    Settings Summary
                  </h2>

                  <div className="mt-5 space-y-4">

                    <SummaryRow
                      label="Email Notifications"
                      value={emailNotifications ? "On" : "Off"}
                    />

                    <SummaryRow
                      label="Job Alerts"
                      value={jobAlerts ? "On" : "Off"}
                    />

                    <SummaryRow
                      label="Candidate Alerts"
                      value={candidateAlerts ? "On" : "Off"}
                    />

                    <SummaryRow
                      label="Skill Gap Alerts"
                      value={skillGapAlerts ? "On" : "Off"}
                    />

                    <SummaryRow
                      label="Weekly Reports"
                      value={weeklyReports ? "On" : "Off"}
                    />

                  </div>
                </div>

                {/* Current Portal */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                      🏢
                    </div>

                    <div>
                      <h2 className="font-semibold text-[#123b68]">
                        Employer Portal
                      </h2>

                      <p className="text-xs text-slate-500">
                        Current Workspace
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">

                    <div className="flex justify-between border-b border-slate-100 pb-3">
                      <span className="text-slate-500">
                        Portal
                      </span>

                      <span className="font-medium text-slate-700">
                        Employer
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-slate-100 pb-3">
                      <span className="text-slate-500">
                        Intelligence
                      </span>

                      <span className="font-medium text-slate-700">
                        Enabled
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Status
                      </span>

                      <span className="font-semibold text-green-600">
                        Active
                      </span>
                    </div>

                  </div>
                </div>

                {/* Help Card */}
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
                  <div className="flex items-start gap-3">
                    <div className="text-xl">
                      ℹ️
                    </div>

                    <div>
                      <h3 className="font-semibold text-orange-900">
                        Need Help?
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-orange-800">
                        These settings control your Employer Portal
                        notifications and preferences. Changes to account
                        information can be managed from your Profile.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-7 rounded-lg border border-slate-200 bg-white px-5 py-4">
              <p className="text-xs leading-5 text-slate-500">
                <span className="font-semibold text-slate-700">
                  SkillMitra Employer Portal:
                </span>{" "}
                Settings allow employers to manage notifications,
                workforce alerts, skill intelligence updates and portal
                preferences.
              </p>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}


/* ================================
   Toggle Component
================================ */

function SettingToggle({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 px-6 py-5">
      <div>
        <p className="text-sm font-semibold text-slate-700">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        aria-pressed={enabled}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled ? "bg-[#123b68]" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}


/* ================================
   Summary Row
================================ */

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span
        className={`text-xs font-semibold ${
          value === "On"
            ? "text-green-600"
            : value === "Off"
              ? "text-slate-400"
              : "text-[#123b68]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}