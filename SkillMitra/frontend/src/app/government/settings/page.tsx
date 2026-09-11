
"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-slate-800">

      {/* ================= TOP BAR ================= */}
      <header className="fixed left-0 right-0 top-0 z-50 h-[78px] border-b border-[#0d2f54] bg-[#123b68] text-white">

        <div className="flex h-full items-center justify-between px-5 lg:px-8">

          {/* Government Branding */}
          <div className="flex items-center gap-4">

            <img
              src="/government-logo.png"
              alt="Government of Maharashtra"
              className="h-10 w-auto object-contain"
            />

            <div className="hidden h-9 w-px bg-white/25 sm:block" />

            <div className="hidden sm:block">

              <h1 className="text-lg font-bold text-white">
                Government Portal
              </h1>

              <p className="text-xs text-white/75">
                Skill Development & Planning
              </p>

            </div>

          </div>


          {/* Right Side */}
          <div className="flex items-center gap-4">

            <div className="hidden text-right sm:block">

              <p className="text-sm font-semibold text-white">
                Government Official
              </p>

              <p className="text-xs text-white/70">
                Govt. Officer
              </p>

            </div>

            <button
              type="button"
              className="rounded-lg border border-white/30 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              Logout
            </button>

          </div>

        </div>

      </header>


      {/* ================= ORANGE STRIP ================= */}
      <div className="fixed left-0 right-0 top-[78px] z-50 h-1 bg-[#c2410c]" />


      {/* ================= SIDEBAR ================= */}
      <aside className="fixed bottom-0 left-0 top-[82px] z-40 hidden w-[264px] overflow-y-auto border-r border-slate-200 bg-white lg:block">

        <div className="flex min-h-full flex-col">

          {/* SIDEBAR BRAND */}
          <div className="border-b border-slate-100 px-4 py-3">

            <div className="flex items-center gap-2">

              <img
                src="/skillmitra-logo.png"
                alt="SkillMitra"
                className="h-7 w-auto object-contain"
              />

              <div>

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Government Portal
                </p>

                <p className="mt-0.5 text-xs font-semibold text-[#123b68]">
                  Skill Development & Planning
                </p>

              </div>

            </div>

          </div>


          {/* NAVIGATION */}
          <nav className="flex-1 space-y-1 px-3 py-4">

            <SidebarItem
              icon="⌂"
              label="Dashboard"
              href="/government"
            />

            <SidebarItem
              icon="▣"
              label="Industry Requirements"
              href="/government/industry-requirements"
            />

            <SidebarItem
              icon="✓"
              label="Training Planning"
              href="/government/training-planning"
            />

            <SidebarItem
              icon="▥"
              label="District Analysis"
              href="/government/district-analysis"
            />

            <SidebarItem
              icon="▤"
              label="Reports & Insights"
              href="/government/reports-insights"
            />

            <SidebarItem
              icon="⚙"
              label="Settings"
              href="/government/settings"
              active
            />

          </nav>


          {/* SIDEBAR BOTTOM */}
          <div className="border-t border-slate-100 p-4">

            <div className="rounded-xl bg-[#f0f7ff] p-4">

              <p className="text-xs font-bold text-[#123b68]">
                SkillMitra
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Skill Development for a Stronger Maharashtra
              </p>

            </div>

          </div>

        </div>

      </aside>


      {/* ================= MAIN CONTENT ================= */}
      <section className="min-h-screen bg-[#f4f7fa] pt-[82px] lg:ml-[264px]">

        <div className="mx-auto max-w-[1500px] p-4 lg:p-6">

          {/* PAGE HEADER */}
          <div className="mb-6">

            <p className="text-xs font-semibold uppercase tracking-wider text-[#0755ad]">
              Government • Portal Configuration
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[#123b68]">
              Settings
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage your government portal preferences and notifications.
            </p>

          </div>


          {/* ================= PROFILE SETTINGS ================= */}
          <div className="mb-5 rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 bg-[#f8fbff] px-5 py-4">

              <h3 className="text-sm font-bold text-[#123b68]">
                Profile Settings
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Government account information
              </p>

            </div>


            <div className="grid gap-4 p-5 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-[11px] font-bold text-slate-500">
                  Name
                </label>

                <input
                  type="text"
                  value="Government Official"
                  readOnly
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none"
                />

              </div>


              <div>

                <label className="mb-2 block text-[11px] font-bold text-slate-500">
                  Role
                </label>

                <input
                  type="text"
                  value="Government Official"
                  readOnly
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none"
                />

              </div>

            </div>

          </div>


          {/* ================= NOTIFICATIONS ================= */}
          <div className="mb-5 rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 bg-[#f8fbff] px-5 py-4">

              <h3 className="text-sm font-bold text-[#123b68]">
                Notifications
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Manage government portal alerts and updates.
              </p>

            </div>


            <div className="divide-y divide-slate-100">

              <SettingRow
                title="Portal Notifications"
                description="Receive important dashboard alerts and government planning updates."
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
              />

              <SettingRow
                title="Email Alerts"
                description="Receive updates about reports, workforce demand and skill gaps."
                checked={emailAlerts}
                onChange={() => setEmailAlerts(!emailAlerts)}
              />

            </div>

          </div>


          {/* ================= DASHBOARD PREFERENCES ================= */}
          <div className="mb-5 rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 bg-[#f8fbff] px-5 py-4">

              <h3 className="text-sm font-bold text-[#123b68]">
                Dashboard Preferences
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Configure the default view for government analysis.
              </p>

            </div>


            <div className="p-5">

              <label className="mb-2 block text-[11px] font-bold text-slate-500">
                Default District
              </label>

              <select
                className="h-11 w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >

                <option>All Districts</option>
                <option>Pune</option>
                <option>Mumbai</option>
                <option>Nashik</option>
                <option>Nagpur</option>

              </select>

            </div>

          </div>


          {/* ================= SECURITY ================= */}
          <div className="mb-5 rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 bg-[#f8fbff] px-5 py-4">

              <h3 className="text-sm font-bold text-[#123b68]">
                Security
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Government portal account security information.
              </p>

            </div>


            <div className="p-5">

              <div className="flex items-center justify-between rounded-lg bg-[#f8fafc] p-4">

                <div>

                  <p className="text-xs font-bold text-slate-700">
                    Account Access
                  </p>

                  <p className="mt-1 text-[11px] text-slate-500">
                    Your government portal access is protected through
                    authorized authentication.
                  </p>

                </div>

                <span className="rounded-full bg-[#eaf9ed] px-3 py-1.5 text-[10px] font-bold text-green-600">
                  Protected
                </span>

              </div>

            </div>

          </div>


          {/* ================= SAVE BUTTON ================= */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

            <div>

              <p className="text-xs font-bold text-[#123b68]">
                Save Preferences
              </p>

              <p className="mt-1 text-[10px] text-slate-500">
                Apply your selected portal settings.
              </p>

            </div>

            <button
              type="button"
              className="rounded-lg bg-[#0755ad] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#064795]"
            >
              Save Settings
            </button>

          </div>


          {/* FOOTER */}
          <div className="mt-6 flex flex-col justify-between gap-2 border-t border-slate-200 pt-4 text-[10px] text-slate-400 sm:flex-row">

            <p>
              SkillMitra • Government Skill Intelligence Platform
            </p>

            <p>
              Government Portal Settings
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}


/* ================= SIDEBAR ITEM ================= */

function SidebarItem({
  icon,
  label,
  href,
  active = false,
}: {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
        active
          ? "bg-[#e7f1fc] text-[#0755ad] shadow-[inset_4px_0_0_#0755ad]"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      <span className="w-6 text-center text-lg">
        {icon}
      </span>

      {label}
    </a>
  );
}


/* ================= SETTING ROW ================= */

function SettingRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-5">

      <div>

        <p className="text-xs font-bold text-slate-700">
          {title}
        </p>

        <p className="mt-1 text-[11px] leading-5 text-slate-500">
          {description}
        </p>

      </div>


      <button
        type="button"
        onClick={onChange}
        aria-pressed={checked}
        className={`relative h-5 w-10 shrink-0 rounded-full transition ${
          checked ? "bg-[#0755ad]" : "bg-slate-300"
        }`}
      >

        <span
          className={`absolute top-1 h-3 w-3 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />

      </button>

    </div>
  );
}

