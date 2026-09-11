"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, type IndustrySector } from "@/lib/api";

export default function SkillTrendsPage() {
  const router = useRouter();
  const [selectedSector, setSelectedSector] = useState("");
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [futureForecasts, setFutureForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [sRes] = await Promise.all([
          api.sectors().catch(() => []),
        ]);
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
        // Try to fetch future demand forecasts
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/demand/future?limit=20`);
        if (response.ok) {
          const data = await response.json();
          setFutureForecasts(data);
        } else {
          setFutureForecasts([]);
        }
      } catch (err) {
        console.error("Failed to load future demand forecasts:", err);
        setFutureForecasts([]);
      }
    })();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7fa] text-slate-800">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#123b68] border-r-transparent"></div>
            <p className="mt-4 text-sm text-slate-600">Loading skill trends...</p>
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

  const filteredTrends = selectedSector 
    ? futureForecasts.filter(item => item.industry_sector_id === selectedSector)
    : futureForecasts;

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
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
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
                  className="flex items-center rounded-lg bg-[#123b68] px-3 py-2.5 text-sm font-medium text-white"
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
                Which skills are growing fastest?
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Skill trends help identify technologies and capabilities that
                are becoming increasingly important across industries. This
                information helps government and training institutes prepare
                workers for future employment opportunities.
              </p>

            </section>

            {/* ================= KPI CARDS ================= */}
            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm text-slate-500">
                  Total Forecasts
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  {futureForecasts.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Future demand predictions
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm text-slate-500">
                  High Confidence
                </p>

                <p className="mt-2 text-3xl font-bold text-[#c2410c]">
                  {futureForecasts.filter(f => f.confidence_level === "high").length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Reliable predictions
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm text-slate-500">
                  Rising Trends
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  {futureForecasts.filter(f => f.growth_indicator === "rising").length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Skills with upward trajectory
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm text-slate-500">
                  Data Status
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  {futureForecasts.length > 0 ? "Live" : "Pending"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {futureForecasts.length > 0 ? "From demand forecasts" : "Run forecast generation"}
                </p>

              </div>

            </section>

            {/* ================= SECTOR FILTER ================= */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

                <div>

                  <h2 className="text-lg font-bold text-[#123b68]">
                    Skill Trends by Sector
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Select a sector to view its most important growing skills.
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

              </div>

            </section>

            {/* ================= SKILL TRENDS TABLE ================= */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 px-6 py-5">

                <h2 className="text-lg font-bold text-[#123b68]">
                  Emerging Skill Trends
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Skills showing increasing demand across major industry
                  sectors.
                </p>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[900px] text-left text-sm">

                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">

                    <tr>

                      <th className="px-6 py-4">
                        Skill
                      </th>

                      <th className="px-6 py-4">
                        Sector
                      </th>

                      <th className="px-6 py-4">
                        Current Demand
                      </th>

                      <th className="px-6 py-4">
                        Growth
                      </th>

                      <th className="px-6 py-4">
                        Trend
                      </th>

                      <th className="px-6 py-4">
                        Adoption
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredTrends.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                          {futureForecasts.length === 0 
                            ? "No forecast data available. Generate future demand forecasts to see skill trends." 
                            : "No trends found for the selected sector."}
                        </td>
                      </tr>
                    ) : (
                      filteredTrends.map((forecast) => (

                        <tr
                          key={forecast.id}
                          className="hover:bg-slate-50"
                        >

                          <td className="px-6 py-4">

                            <p className="font-semibold text-slate-800">
                              Skill ID: {forecast.skill_id?.toString().slice(0, 8)}...
                            </p>

                          </td>

                          <td className="px-6 py-4 text-slate-600">
                            {sectors.find(s => s.id === forecast.industry_sector_id)?.name || "Unknown"}
                          </td>

                          <td className="px-6 py-4">

                            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#c2410c]">
                              {forecast.current_demand_level || "Unknown"}
                            </span>

                          </td>

                          <td className="px-6 py-4">

                            <span className="font-semibold text-[#123b68]">
                              {forecast.growth_indicator || "Unknown"}
                            </span>

                          </td>

                          <td className="px-6 py-4">

                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                              {forecast.forecast_level || "Unknown"}
                            </span>

                          </td>

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-3">

                              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">

                                <div
                                  className="h-full rounded-full bg-[#123b68]"
                                  style={{
                                    width: `${Math.round(forecast.confidence_score * 100)}%`,
                                  }}
                                />

                              </div>

                              <span className="text-xs font-semibold text-slate-600">
                                {Math.round(forecast.confidence_score * 100)}%
                              </span>

                            </div>

                          </td>

                        </tr>

                      ))
                    )}

                  </tbody>

                </table>

              </div>

            </section>

            {/* ================= SECTOR TREND SUMMARY ================= */}
            <section>

              <div className="mb-4">

                <h2 className="text-xl font-bold text-[#123b68]">
                  Sector-wise Trend Summary
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Skill trend analysis across industry sectors based on demand forecasts.
                </p>

              </div>

              <div className="grid gap-5 lg:grid-cols-3">

                {futureForecasts.length === 0 ? (
                  <div className="col-span-3 rounded-xl border border-amber-200 bg-amber-50 p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-amber-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-amber-800">Insufficient Data</h3>
                        <p className="mt-1 text-sm text-amber-700">
                          No future demand forecasts available. Generate forecasts using the 
                          <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">POST /api/v1/demand/future/generate</code> endpoint to enable trend analysis.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  sectors.slice(0, 3).map((sector) => {
                    const sectorForecasts = futureForecasts.filter(f => f.industry_sector_id === sector.id);
                    const highGrowth = sectorForecasts.filter(f => f.growth_indicator === "rising" || f.growth_indicator === "very_high");
                    return (
                      <div
                        key={sector.id}
                        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                      >

                        <p className="text-sm font-semibold text-[#c2410c]">
                          {sector.name}
                        </p>

                        <h3 className="mt-3 text-lg font-bold text-[#123b68]">
                          {sectorForecasts.length} Forecasts
                        </h3>

                        <div className="mt-5 space-y-3">

                          <div className="flex items-center justify-between text-sm">

                            <span className="text-slate-500">
                              High Growth
                            </span>

                            <span className="font-semibold text-slate-700">
                              {highGrowth.length}
                            </span>

                          </div>

                          <div className="flex items-center justify-between text-sm">

                            <span className="text-slate-500">
                              Avg Confidence
                            </span>

                            <span className="font-semibold text-slate-700">
                              {sectorForecasts.length > 0 
                                ? Math.round(sectorForecasts.reduce((acc, f) => acc + f.confidence_score, 0) / sectorForecasts.length * 100) + "%"
                                : "N/A"}
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
                    This page displays skill trends from future demand forecasts via the 
                    <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">/api/v1/demand/future</code> endpoint. 
                    Forecasts are generated using historical demand analysis and trend signals.
                  </p>
                </div>
              </div>
            </section>

            {/* ================= GOVERNMENT INPUT ================= */}
            <section className="rounded-xl bg-[#123b68] p-6 text-white shadow-sm">

              <p className="text-xs font-bold uppercase tracking-wider text-orange-200">
                INDUSTRY → GOVERNMENT
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Future Skill Development Input
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100">
                Skill trend information can help government departments
                identify future-ready technologies, update training curricula,
                create new skill programs and prepare candidates for emerging
                employment opportunities.
              </p>

            </section>

          </div>

        </section>

      </div>

    </main>
  );
}