"use client";

import Image from "next/image";
import EmployerSidebar from "@/components/employer/EmployerSidebar";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

type WorkforceData = {
  status: string;
  message: string | null;
  candidate_supply: number | null;
  skill_supply: number | null;
  applications: number | null;
  skill_availability: Array<{ skill: string; count: number }> | null;
  district_distribution: Array<{ district: string; count: number }> | null;
};

export default function WorkforcePage() {
  const [workforceData, setWorkforceData] = useState<WorkforceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSector, setSelectedSector] = useState("");

  useEffect(() => {
    async function loadWorkforceData() {
      try {
        setLoading(true);
        setError(null);
        
        const params: any = {};
        if (selectedDistrict) params.district_id = selectedDistrict;
        if (selectedSector) params.sector_id = selectedSector;
        
        const data = await api.employerIntelligenceWorkforce(params);
        setWorkforceData(data);
      } catch (err) {
        console.error("Failed to load workforce data:", err);
        setError("Unable to load workforce intelligence. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadWorkforceData();
  }, [selectedDistrict, selectedSector]);

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
                  Workforce Intelligence Dashboard
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
                Workforce Intelligence
              </h1>

              <p className="mt-2 text-sm text-slate-500 md:text-base">
                Understand candidate supply, skill availability, and
                workforce distribution across regions.
              </p>

            </div>

            {/* FILTERS */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <h2 className="text-lg font-bold text-slate-900">
                Analyse Workforce
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">

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
            {workforceData?.status === "insufficient_evidence" && !loading && (
              <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-5">
                <p className="font-semibold text-orange-800">
                  Insufficient Workforce Evidence
                </p>
                <p className="mt-1 text-sm text-orange-700">
                  {workforceData.message || "There is not enough candidate data to provide workforce intelligence."}
                </p>
              </div>
            )}

            {/* WORKFORCE METRICS */}
            {workforceData?.status === "available" && (
              <>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">
                      Candidate Supply
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#123b68]">
                      {workforceData.candidate_supply ?? "—"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Registered candidates
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">
                      Skill Supply
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#123b68]">
                      {workforceData.skill_supply ?? "—"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Total skill entries
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">
                      Applications
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#123b68]">
                      {workforceData.applications ?? "—"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Job applications
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">
                      Districts Covered
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#123b68]">
                      {workforceData.district_distribution?.length ?? "—"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Regions with candidates
                    </p>
                  </div>

                </div>

                {/* SKILL AVAILABILITY */}
                {workforceData.skill_availability && workforceData.skill_availability.length > 0 && (
                  <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

                    <h2 className="text-lg font-bold text-slate-900">
                      Skill Availability
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Most common skills among candidates.
                    </p>

                    <div className="mt-5 space-y-3">
                      {workforceData.skill_availability.slice(0, 10).map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3"
                        >
                          <div className="w-40 text-sm font-medium">
                            {item.skill}
                          </div>

                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">

                            <div
                              className="h-full rounded-full bg-green-600"
                              style={{
                                width: `${Math.min((item.count / (workforceData.skill_availability?.[0]?.count || 1)) * 100, 100)}%`,
                              }}
                            />

                          </div>

                          <span className="w-20 text-right text-xs text-slate-500">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>

                  </div>
                )}

                {/* DISTRICT DISTRIBUTION */}
                {workforceData.district_distribution && workforceData.district_distribution.length > 0 && (
                  <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

                    <h2 className="text-lg font-bold text-slate-900">
                      District Distribution
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Geographic distribution of candidates.
                    </p>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      {workforceData.district_distribution.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 rounded-lg bg-slate-50"
                        >
                          <span className="text-sm font-medium text-slate-900">
                            {item.district}
                          </span>
                          <span className="text-sm font-semibold text-[#123b68]">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>

                  </div>
                )}
              </>
            )}

            {/* INTELLIGENCE NOTICE */}
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">

              <h2 className="font-semibold text-[#123b68]">
                Workforce Intelligence
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Workforce insights are calculated from actual candidate profiles, skills, and application data.
              </p>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}