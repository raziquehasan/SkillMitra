
"use client";

import { useState, useEffect } from "react";
import { api, type District, type IndustrySector } from "@/lib/api";

type DistrictData = {
  district: string;
  district_id: string;
  sector: string;
  required: number;
  available: number;
  gap: number;
  priority: "High" | "Medium" | "Low";
};

export default function DistrictAnalysisPage() {
  const [district, setDistrict] = useState("");
  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [districtData, setDistrictData] = useState<DistrictData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [dRes, sRes] = await Promise.all([
          api.districts().catch(() => []),
          api.sectors().catch(() => []),
        ]);
        setDistricts(dRes);
        setSectors(sRes);

        // Fetch real district analysis data from API
        const response = await api.governmentDashboard({});
        if (response && response.district_intelligence) {
          // Transform API data to match expected format
          // For now, show empty state since district-specific analysis isn't fully implemented
          setDistrictData([]);
        }
      } catch (err) {
        console.error("Failed to load district analysis:", err);
        setError("Failed to load district analysis data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredData =
    !district || district === ""
      ? districtData
      : districtData.filter((item) => item.district === district);

  const totalRequired = filteredData.reduce(
    (sum, item) => sum + item.required,
    0
  );

  const totalAvailable = filteredData.reduce(
    (sum, item) => sum + item.available,
    0
  );

  const totalGap = filteredData.reduce(
    (sum, item) => sum + item.gap,
    0
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7fa] text-slate-800">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#123b68] border-r-transparent"></div>
            <p className="mt-4 text-sm text-slate-600">Loading district analysis...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f4f7fa] text-slate-800">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[#123b68] text-white text-sm rounded hover:bg-[#123b68]/90"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

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
              active
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
      <section className="min-h-screen pt-[82px] lg:ml-[264px]">

        <div className="mx-auto max-w-[1500px] p-4 lg:p-6">

          {/* PAGE TITLE */}
          <div className="mb-5">

            <p className="text-xs font-semibold uppercase tracking-wider text-[#0755ad]">
              Government • District Intelligence
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[#123b68]">
              District Analysis
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              District-wise industry demand and skill gap analysis
            </p>

          </div>


          {/* FILTER */}
          <div className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-4">
              <h3 className="text-sm font-bold text-[#123b68]">
                Filter District Analysis
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Select a district to view workforce demand and skill gaps.
              </p>
            </div>

            <label className="mb-2 block text-[11px] font-bold text-slate-500">
              District
            </label>

            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="h-11 w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Districts</option>
              {districts.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

          </div>


          {/* SUMMARY CARDS */}
          <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">

            <MetricCard
              title="Total Skill Demand"
              value={totalRequired.toString()}
              icon="▤"
            />

            <MetricCard
              title="Available Candidates"
              value={totalAvailable.toString()}
              icon="◉"
            />

            <MetricCard
              title="Skill Gap"
              value={totalGap.toString()}
              icon="⚠"
            />

          </div>


          {/* DISTRICT TABLE */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 bg-[#f8fbff] px-5 py-4">

              <h3 className="text-sm font-bold text-[#123b68]">
                District-wise Skill Gap
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Workforce demand and candidate availability across districts
              </p>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[750px] text-left">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase text-slate-500">

                    <th className="px-5 py-3">
                      District
                    </th>

                    <th className="px-5 py-3">
                      Sector
                    </th>

                    <th className="px-5 py-3">
                      Required
                    </th>

                    <th className="px-5 py-3">
                      Available
                    </th>

                    <th className="px-5 py-3">
                      Gap
                    </th>

                    <th className="px-5 py-3">
                      Priority
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredData.map((item) => (

                    <tr
                      key={item.district}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >

                      <td className="px-5 py-4 text-xs font-bold text-slate-700">
                        {item.district}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-600">
                        {item.sector}
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                        {item.required}
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-green-600">
                        {item.available}
                      </td>

                      <td className="px-5 py-4 text-xs font-bold text-rose-600">
                        {item.gap}
                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
                            item.priority === "High"
                              ? "bg-[#fff0f2] text-rose-600"
                              : item.priority === "Medium"
                              ? "bg-[#fff6e7] text-amber-600"
                              : "bg-[#eaf9ed] text-green-600"
                          }`}
                        >
                          {item.priority}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            {filteredData.length === 0 && (
              <div className="p-10 text-center text-sm text-slate-500">
                District-specific analysis requires demand data integration.
                Use the main Government Dashboard for aggregate state-level insights.
              </div>
            )}

          </div>


          {/* GOVERNMENT ACTION */}
          <div className="mt-5 rounded-xl border border-[#d7eaf7] bg-[#eef8ff] p-5">

            <div className="flex gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lg text-[#0755ad]">
                🏛
              </div>

              <div>

                <p className="text-sm font-bold text-[#123b68]">
                  Government Action
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  High-gap districts should be prioritized for additional
                  training programs and skill development initiatives.
                </p>

              </div>

            </div>

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


/* ================= METRIC CARD ================= */

function MetricCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <p className="text-xs font-medium text-slate-500">
          {title}
        </p>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef7ff] text-lg text-[#0755ad]">
          {icon}
        </div>

      </div>

      <p className="mt-3 text-2xl font-bold text-[#123b68]">
        {value}
      </p>

    </div>
  );
}

