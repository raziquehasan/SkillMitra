"use client";

import Image from "next/image";
import EmployerSidebar from "@/components/employer/EmployerSidebar";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

type TrendData = {
  status: string;
  message: string | null;
  increasing_skills: number;
  stable_skills: number;
  emerging_skills: number;
  trend_direction: string | null;
  current_period: string | null;
  historical_data: Array<{
    period_start: string | null;
    period_end: string | null;
    demand_value: number;
  }> | null;
};

export default function SkillTrendsPage() {
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("6months");

  useEffect(() => {
    async function loadTrendData() {
      try {
        setLoading(true);
        setError(null);
        
        const params: any = {};
        if (selectedDistrict) params.district_id = selectedDistrict;
        if (selectedSector) params.sector_id = selectedSector;
        
        // Calculate date range based on selected period
        const now = new Date();
        let dateFrom: Date;
        
        switch (selectedPeriod) {
          case "12months":
            dateFrom = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
          case "2years":
            dateFrom = new Date(now.setFullYear(now.getFullYear() - 2));
            break;
          default: // 6months
            dateFrom = new Date(now.setMonth(now.getMonth() - 6));
        }
        
        params.date_from = dateFrom.toISOString().split('T')[0];
        
        const data = await api.employerIntelligenceTrends(params);
        setTrendData(data);
      } catch (err) {
        console.error("Failed to load trend data:", err);
        setError("Unable to load labour-market intelligence. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadTrendData();
  }, [selectedDistrict, selectedSector, selectedPeriod]);

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-slate-800">

      {/* GOVERNMENT TOP BAR */}
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

      {/* ORANGE LINE */}
      <div className="fixed left-0 right-0 top-[72px] z-50 h-1 bg-[#c2410c]" />

      {/* PAGE LAYOUT */}
      <div className="min-h-screen pt-[76px]">

        {/* EXISTING EMPLOYER SIDEBAR */}
        <EmployerSidebar />

        {/* MAIN CONTENT */}
        <section className="min-w-0 lg:ml-72">

          {/* SKILLMITRA PAGE HEADER */}
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
                  Skill Trends Dashboard
                </p>
              </div>

            </div>
          </div>

          {/* PAGE CONTENT */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">

            {/* PAGE HEADER */}
            <div className="mb-7">

              <p className="text-xs font-semibold text-slate-400">
                SkillMitra / Labour Market Intelligence
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
                Skill Trends
              </h1>

              <p className="mt-2 text-sm text-slate-500 md:text-base">
                Track how skill demand is changing across
                industries and job roles.
              </p>

            </div>

            {/* SUMMARY CARDS */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  Increasing Skills
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  {loading ? "..." : trendData?.increasing_skills ?? "—"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Skills showing increasing demand
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  Stable Skills
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  {loading ? "..." : trendData?.stable_skills ?? "—"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Skills with consistent demand
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  Emerging Skills
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  {loading ? "..." : trendData?.emerging_skills ?? "—"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  New skills gaining industry attention
                </p>
              </div>

            </div>

            {/* FILTERS */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <h2 className="text-lg font-bold text-slate-900">
                Analyse Skill Trends
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-3">

                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                    District
                  </span>

                  <select 
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#123b68]"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                  >
                    <option value="">All Districts</option>
                    <option value="pune-district-id">Pune</option>
                    <option value="mumbai-district-id">Mumbai</option>
                    <option value="nashik-district-id">Nashik</option>
                    <option value="nagpur-district-id">Nagpur</option>
                  </select>
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                    Industry Sector
                  </span>

                  <select 
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#123b68]"
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                  >
                    <option value="">All Sectors</option>
                    <option value="ev-sector-id">EV / Automotive</option>
                    <option value="it-sector-id">IT & Software</option>
                    <option value="manufacturing-sector-id">Manufacturing</option>
                    <option value="healthcare-sector-id">Healthcare</option>
                  </select>
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                    Time Period
                  </span>

                  <select 
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#123b68]"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  >
                    <option value="6months">Last 6 Months</option>
                    <option value="12months">Last 12 Months</option>
                    <option value="2years">Last 2 Years</option>
                  </select>
                </label>

              </div>
            </div>

            {/* ERROR STATE */}
            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
                <p className="font-semibold text-red-800">
                  Error
                </p>
                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* INSUFFICIENT EVIDENCE STATE */}
            {trendData?.status === "insufficient_evidence" && !loading && (
              <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-5">
                <p className="font-semibold text-orange-800">
                  Insufficient Labour-Market Evidence
                </p>
                <p className="mt-1 text-sm text-orange-700">
                  {trendData.message || "There is not enough historical data to calculate skill trends for the selected filters."}
                </p>
              </div>
            )}

            {/* TREND OVERVIEW */}
            {trendData?.status === "available" && (
              <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Skill Demand Trend
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Historical demand analysis based on labour-market data.
                  </p>
                </div>

                <div className="mt-6 flex h-56 items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5">
                  {trendData.historical_data && trendData.historical_data.length > 0 ? (
                    trendData.historical_data.map((data, index) => {
                      const maxDemand = Math.max(...trendData.historical_data!.map(d => d.demand_value));
                      const height = maxDemand > 0 ? (data.demand_value / maxDemand) * 100 : 0;
                      
                      return (
                        <div
                          key={index}
                          className="flex flex-1 flex-col items-center justify-end gap-2"
                        >
                          <div
                            className="w-full max-w-12 rounded-t-lg bg-[#2563eb]"
                            style={{
                              height: `${Math.max(height, 5)}%`, // Minimum 5% height for visibility
                            }}
                          />
                          <span className="text-[10px] text-slate-400">
                            {index + 1}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-500">
                      No historical data available
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">

                  <div>
                    <p className="text-xs text-slate-500">
                      Trend direction
                    </p>

                    <p className="mt-1 font-semibold text-green-600">
                      {trendData.trend_direction ? `↗ ${trendData.trend_direction}` : "—"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-500">
                      Current period
                    </p>

                    <p className="mt-1 font-semibold text-[#123b68]">
                      {trendData.current_period ? new Date(trendData.current_period).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "—"}
                    </p>
                  </div>

                </div>
              </div>
            )}

            {/* INTELLIGENCE NOTICE */}
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">

              <h2 className="font-semibold text-[#123b68]">
                Labour-Market Trend Intelligence
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Skill-trend analytics are calculated from actual historical demand data in the labour market.
              </p>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}