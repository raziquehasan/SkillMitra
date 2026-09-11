"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, type IndustrySector, type District, type IndustryDemand } from "@/lib/api";

export default function WorkforceGapPage() {
  const router = useRouter();
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [demandData, setDemandData] = useState<IndustryDemand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [sRes, dRes] = await Promise.all([
          api.sectors().catch(() => []),
          api.districts().catch(() => []),
        ]);
        setSectors(sRes);
        setDistricts(dRes);
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
      if (!selectedSector && !selectedDistrict) return;
      
      try {
        const demand = await api.industryDemand({
          industry_sector_id: selectedSector || undefined,
          district_id: selectedDistrict || undefined,
        });
        setDemandData(Array.isArray(demand) ? demand : []);
      } catch (err) {
        console.error("Failed to load demand data:", err);
        setDemandData([]);
      }
    })();
  }, [selectedSector, selectedDistrict]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7fa] text-slate-800">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#123b68] border-r-transparent"></div>
            <p className="mt-4 text-sm text-slate-600">Loading workforce gap data...</p>
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

      {/* ================= GOVERNMENT HEADER ================= */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-[#123b68] text-white">
        <div className="flex min-h-[60px] items-center justify-between px-6">

          <div className="flex items-center gap-3">

            <div className="relative h-10 w-10 shrink-0">
              <Image
                src="/government-logo.png"
                alt="Government of Maharashtra"
                fill
                priority
                className="object-contain"
              />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Government of Maharashtra
              </p>

              <p className="text-[10px] text-blue-100">
                Skills, Employment, Entrepreneurship & Innovation Department
              </p>
            </div>

          </div>

          <div className="flex items-center gap-6">

            <span className="hidden text-sm font-medium md:block">
              SkillMitra Industry Portal
            </span>

            <button 
             onClick={() => router.push("/login")}
            className="rounded-md border border-white/30 px-4 py-2 text-sm hover:bg-white/10">
              Logout
            </button>

          </div>

        </div>
      </header>

      {/* ================= ORANGE LINE ================= */}
      <div className="fixed left-0 right-0 top-[60px] z-50 h-1 bg-[#c2410c]" />

      {/* ================= MAIN LAYOUT ================= */}
      <div className="flex min-h-screen pt-[65px]">

        {/* ================= SIDEBAR ================= */}
        <aside className="fixed bottom-0 left-0 top-[65px] z-20 hidden w-72 overflow-y-auto border-r border-slate-200 bg-white lg:block">

          {/* Sidebar Branding */}
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

          {/* Sidebar Navigation */}
          <nav className="p-4">

            {/* INDUSTRY INTELLIGENCE */}
            <div className="mb-6">

              <p className="mb-3 px-3 text-[11px] font-bold tracking-wider text-slate-400">
                INDUSTRY INTELLIGENCE
              </p>

              <div className="space-y-1">

                <a
                  href="/industry"
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Dashboard
                </a>

                <a
                  href="/industry/demand"
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Industry Demand
                </a>

                <a
                  href="/industry/skills"
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Required Skills
                </a>

                <a
                  href="/industry/workforce"
                  className="flex items-center rounded-lg bg-[#123b68] px-3 py-2.5 text-sm font-medium text-white"
                >
                  Workforce Gap
                </a>

                <a
                  href="/industry/roles"
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Emerging Job Roles
                </a>

                <a
                  href="/industry/trends"
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Skill Trends
                </a>

              </div>

            </div>

            {/* INDUSTRY REQUIREMENTS */}
            <div>

              <p className="mb-3 px-3 text-[11px] font-bold tracking-wider text-slate-400">
                INDUSTRY REQUIREMENTS
              </p>

              <div className="space-y-1">

                <a
                  href="/industry/requirements"
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Workforce Requirements
                </a>

                <a
                  href="/industry/profile"
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Industry Profile
                </a>

                <a
                  href="/industry/settings"
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Settings
                </a>

              </div>

            </div>

          </nav>

        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <section className="min-w-0 flex-1 lg:ml-72">

          <div className="space-y-7 p-6 lg:p-10">

            {/* ================= INTRO ================= */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <p className="text-xs font-bold uppercase tracking-wider text-[#c2410c]">
                INDUSTRY → GOVERNMENT
              </p>

              <h1 className="mt-2 text-2xl font-bold text-[#123b68]">
                Where is the workforce gap?
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Industries can identify where skilled workforce availability
                is lower than current demand. This information helps government
                departments plan targeted training, employment and placement
                initiatives.
              </p>

            </section>

            {/* ================= KPI CARDS ================= */}
            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Demand Records
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  {demandData.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Industry demand signals
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  High Demand Areas
                </p>

                <p className="mt-2 text-3xl font-bold text-[#c2410c]">
                  {demandData.filter(d => (d.aggregate_demand_score || 0) > 5).length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Score &gt; 5.0
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Sectors Covered
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  {sectors.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Industry sectors
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Districts Covered
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  {districts.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Geographic areas
                </p>
              </div>

            </section>

            {/* ================= SECTOR FILTER ================= */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

                <div>
                  <h2 className="text-lg font-bold text-[#123b68]">
                    Workforce Gap by Sector
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Select a sector to view its current workforce requirement
                    and availability.
                  </p>
                </div>

                <div>

                  <label className="mb-2 block text-xs font-semibold text-slate-500">
                    SECTOR
                  </label>

                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-[#123b68]"
                  >
                    <option value="">All Sectors</option>
                    {sectors.map((sector) => (
                      <option key={sector.id} value={sector.id}>
                        {sector.name}
                      </option>
                    ))}
                  </select>

                </div>

                <div>

                  <label className="mb-2 block text-xs font-semibold text-slate-500">
                    DISTRICT
                  </label>

                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-[#123b68]"
                  >
                    <option value="">All Districts</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>

                </div>

              </div>

            </section>

            {/* ================= WORKFORCE TABLE ================= */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 px-6 py-5">

                <h2 className="text-lg font-bold text-[#123b68]">
                  Workforce Gap Analysis
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current workforce demand and availability reported as sample
                  industry data.
                </p>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[900px] text-left text-sm">

                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">

                    <tr>

                      <th className="px-6 py-4">
                        Sector
                      </th>

                      <th className="px-6 py-4">
                        Role
                      </th>

                      <th className="px-6 py-4">
                        District
                      </th>

                      <th className="px-6 py-4">
                        Demand
                      </th>

                      <th className="px-6 py-4">
                        Required
                      </th>

                      <th className="px-6 py-4">
                        Available
                      </th>

                      <th className="px-6 py-4">
                        Gap
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {demandData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">
                          {selectedSector || selectedDistrict 
                            ? "No demand data found for the selected filters. Try different criteria." 
                            : "Select a sector or district to view workforce gap analysis."}
                        </td>
                      </tr>
                    ) : (
                      demandData.map((demand) => {
                        const sector = sectors.find(s => s.id === demand.industry_sector_id);
                        const district = districts.find(d => d.id === demand.district_id);
                        const demandScore = demand.aggregate_demand_score || 0;
                        const demandLevel = demandScore >= 7.5 ? "Very High" : 
                                           demandScore >= 5.0 ? "High" : 
                                           demandScore >= 2.5 ? "Moderate" : "Low";
                        
                        return (
                          <tr
                            key={demand.id}
                            className="hover:bg-slate-50"
                          >

                            <td className="px-6 py-4">
                              <p className="font-semibold text-slate-800">
                                {sector?.name || "Unknown Sector"}
                              </p>
                            </td>

                            <td className="px-6 py-4">
                              <p className="font-medium text-slate-700">
                                {demand.job_role_id ? `Role: ${demand.job_role_id.toString().slice(0, 8)}...` : "General Demand"}
                              </p>
                            </td>

                            <td className="px-6 py-4 text-slate-600">
                              {district?.name || "Unknown District"}
                            </td>

                            <td className="px-6 py-4">

                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                demandLevel === "Very High" ? "bg-orange-50 text-orange-700" :
                                demandLevel === "High" ? "bg-red-50 text-red-700" :
                                "bg-blue-50 text-blue-700"
                              }`}>
                                {demandLevel}
                              </span>

                            </td>

                            <td className="px-6 py-4 font-medium text-slate-700">
                              {demandScore.toFixed(1)}
                            </td>

                            <td className="px-6 py-4 font-medium text-slate-700">
                              -
                            </td>

                            <td className="px-6 py-4">

                              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                                Analysis Required
                              </span>

                            </td>

                          </tr>
                        );
                      })
                    )}

                  </tbody>

                </table>

              </div>

            </section>

            {/* ================= SECTOR SUMMARY ================= */}
            <section>

              <div className="mb-4">

                <h2 className="text-xl font-bold text-[#123b68]">
                  Sector-wise Workforce Gap
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Sectors with the highest workforce shortages requiring
                  immediate attention.
                </p>

              </div>

              <div className="grid gap-5 lg:grid-cols-3">

                {sectors.length === 0 ? (
                  <div className="col-span-3 text-center py-8 text-sm text-slate-500">
                    No sector data available.
                  </div>
                ) : (
                  sectors.slice(0, 3).map((sector) => {
                    const sectorDemand = demandData.filter(d => d.industry_sector_id === sector.id);
                    const avgDemand = sectorDemand.length > 0 
                      ? sectorDemand.reduce((acc, d) => acc + (d.aggregate_demand_score || 0), 0) / sectorDemand.length
                      : 0;
                    const highDemandCount = sectorDemand.filter(d => (d.aggregate_demand_score || 0) > 5).length;
                    
                    return (
                      <div
                        key={sector.id}
                        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                      >

                        <p className="text-sm font-semibold text-[#c2410c]">
                          {sector.name}
                        </p>

                        <h3 className="mt-3 text-lg font-bold text-[#123b68]">
                          {sectorDemand.length} Records
                        </h3>

                        <div className="mt-5 space-y-3">

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">
                              Avg Demand Score
                            </span>

                            <span className="font-semibold text-slate-700">
                              {avgDemand.toFixed(1)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">
                              High Demand Areas
                            </span>

                            <span className="font-semibold text-red-600">
                              {highDemandCount}
                            </span>
                          </div>

                        </div>

                      </div>
                    );
                  })
                )}

              </div>

            </section>

            {/* ================= DATA SOURCE NOTICE ================= */}
            <section className="rounded-xl bg-blue-50 border border-blue-100 p-6">
              <div className="flex items-start gap-4">
                <div className="text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#123b68]">Data Source</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    This page displays workforce gap analysis from industry demand data via the 
                    <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">/api/v1/demand/industries</code> endpoint. 
                    Full workforce gap analysis requires integration with training capacity and candidate data.
                  </p>
                </div>
              </div>
            </section>

          </div>

        </section>

      </div>

    </main>
  );
}