"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, type District, type IndustrySector } from "@/lib/api";

export default function IndustryRequirementsPage() {
  const router = useRouter();
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demandData, setDemandData] = useState<any[]>([]);
  const [sectorData, setSectorData] = useState<any[]>([]);
  const [trainingData, setTrainingData] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [dRes, sRes] = await Promise.all([
          api.districts().catch(() => []),
          api.sectors().catch(() => []),
        ]);
        setDistricts(dRes);
        setSectors(sRes);
      } catch (err) {
        console.error("Failed to load reference data:", err);
        setError("Failed to load reference data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const demandRes = await api.industryDemand({
          district_id: selectedDistrict || undefined,
          industry_sector_id: selectedSector || undefined,
        });
        
        if (Array.isArray(demandRes)) {
          setDemandData(demandRes);
        } else {
          setDemandData([]);
        }
      } catch (err) {
        console.error("Failed to load demand data:", err);
        setDemandData([]);
      }
    })();
  }, [selectedDistrict, selectedSector]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7fa] text-slate-800">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#123b68] border-r-transparent"></div>
            <p className="mt-4 text-sm text-slate-600">Loading industry requirements...</p>
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
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-[#123b68] text-white shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0">
              <Image
                src="/skillmitra-logo.png"
                alt="SkillMitra"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold">SkillMitra</h1>
              <p className="text-[11px] text-blue-100">Industry Requirements Portal</p>
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
              <h1 className="text-xl font-bold text-[#123b68]">SkillMitra</h1>
              <p className="text-xs text-slate-500">Industry Portal</p>
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
                  className="block rounded-lg bg-[#123b68] px-3 py-2.5 text-sm font-medium text-white"
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
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
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
                INDUSTRY REQUIREMENTS
              </p>

              <h2 className="mt-1 text-3xl font-bold text-[#123b68]">
                What workforce does the industry need?
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Workforce requirements help identify how many skilled workers
                industries will need across sectors, roles and districts.
              </p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Total Workforce Required
                </p>
                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  {demandData.reduce((sum, d) => sum + (d.aggregate_demand_score || 0), 0).toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Across priority sectors
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Current Workforce
                </p>
                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  0
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Currently available
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Additional Workforce
                </p>
                <p className="mt-2 text-3xl font-bold text-orange-600">
                  {demandData.reduce((sum, d) => sum + (d.aggregate_demand_score || 0), 0).toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Additional workers required
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Planning Priority
                </p>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  {demandData.filter(d => d.aggregate_demand_score > 100).length > 0 ? "Critical" : "Moderate"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {demandData.filter(d => d.aggregate_demand_score > 100).length > 0 ? "Immediate action required" : "Monitor demand"}
                </p>
              </div>
            </div>

            {/* Sector Filter */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h3 className="text-lg font-bold text-[#123b68]">
                    Workforce Requirements by Sector
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Select a sector to view detailed workforce requirements.
                  </p>
                </div>

                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-[#123b68]"
                >
                  <option value="">All Sectors</option>
                  {sectors.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Requirement Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h3 className="text-lg font-bold text-[#123b68]">
                  Detailed Workforce Requirements
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Workforce requirement by sector, role and district.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Sector
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Role
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        District
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Priority
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Required
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Available
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Additional Need
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Timeline
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {demandData.length > 0 ? (
                      demandData.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                            {sectors.find(s => s.id === item.industry_sector_id)?.name || "Unknown Sector"}
                          </td>

                          <td className="px-6 py-4 text-sm font-semibold text-[#123b68]">
                            {item.job_role_title || "Unknown Role"}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {districts.find(d => d.id === item.district_id)?.name || "Unknown District"}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                item.aggregate_demand_score > 100
                                  ? "bg-red-100 text-red-700"
                                  : item.aggregate_demand_score > 50
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {item.aggregate_demand_score > 100 ? "Very High" : item.aggregate_demand_score > 50 ? "High" : "Moderate"}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                            {item.aggregate_demand_score || 0}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            0
                          </td>

                          <td className="px-6 py-4 text-sm font-bold text-orange-600">
                            {item.aggregate_demand_score || 0}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            Insufficient data
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-sm text-slate-400">
                          No workforce requirements data available for the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sector-wise Requirements */}
            <div>
              <h3 className="mb-4 text-lg font-bold text-[#123b68]">
                Sector-wise Workforce Requirements
              </h3>

              <div className="grid gap-5 lg:grid-cols-3">
                {sectorData.map((item) => (
                  <div
                    key={item.sector}
                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-bold text-[#123b68]">
                        {item.sector}
                      </h4>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          item.priority === "Critical"
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-[10px] font-semibold uppercase text-slate-400">
                          Required
                        </p>
                        <p className="mt-1 text-lg font-bold text-slate-700">
                          {item.workforce}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-[10px] font-semibold uppercase text-slate-400">
                          Current
                        </p>
                        <p className="mt-1 text-lg font-bold text-emerald-600">
                          {item.current}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-[10px] font-semibold uppercase text-slate-400">
                          Gap
                        </p>
                        <p className="mt-1 text-lg font-bold text-red-600">
                          {item.gap}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Workforce Focus
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-600">
                        {item.focus}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Training Priorities */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h3 className="text-lg font-bold text-[#123b68]">
                  Workforce Training Priorities
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Suggested training programs based on industry workforce
                  requirements.
                </p>
              </div>

              <div className="grid gap-4 p-6 md:grid-cols-3">
                {trainingData.map((item) => (
                  <div
                    key={item.program}
                    className="rounded-xl border border-slate-200 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-bold text-[#123b68]">
                        {item.program}
                      </h4>

                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                        {item.priority}
                      </span>
                    </div>

                    <p className="mt-4 text-sm text-slate-500">
                      Duration:{" "}
                      <span className="font-semibold text-slate-700">
                        {item.duration}
                      </span>
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Target workforce:{" "}
                      <span className="font-semibold text-slate-700">
                        {item.target}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Government Input */}
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#123b68]">
                Government Input
              </p>

              <h3 className="mt-2 text-lg font-bold text-[#123b68]">
                Workforce planning recommendation
              </h3>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
                Government skill-development programs should prioritize
                high-gap occupations, expand targeted training capacity and
                align training programs with district-level industry demand.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#123b68] shadow-sm">
                  Increase Training Capacity
                </span>

                <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#123b68] shadow-sm">
                  Focus on Critical Gaps
                </span>

                <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#123b68] shadow-sm">
                  District-wise Planning
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}