"use client";

import Image from "next/image";
import EmployerSidebar from "@/components/employer/EmployerSidebar";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

type SkillData = {
  id: string;
  name: string;
  demand: number;
  associated_roles: string[];
  required_proficiency: string | null;
  mapped_training_count: number;
};

export default function RequiredSkillsPage() {
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedDemand, setSelectedDemand] = useState("");

  useEffect(() => {
    async function loadSkills() {
      try {
        setLoading(true);
        setError(null);
        
        const params: any = {};
        if (selectedDistrict) params.district_id = selectedDistrict;
        if (selectedSector) params.sector_id = selectedSector;
        
        const data = await api.employerIntelligenceSkills(params);
        
        // Filter by demand level if selected
        let filteredData = data;
        if (selectedDemand === "high") {
          filteredData = data.filter(s => s.demand >= 100);
        } else if (selectedDemand === "growing") {
          filteredData = data.filter(s => s.demand >= 50 && s.demand < 100);
        } else if (selectedDemand === "moderate") {
          filteredData = data.filter(s => s.demand > 0 && s.demand < 50);
        }
        
        setSkills(filteredData);
      } catch (err) {
        console.error("Failed to load skills:", err);
        setError("Unable to load skills data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadSkills();
  }, [selectedDistrict, selectedSector, selectedDemand]);

  // Calculate summary statistics
  const requiredCount = skills.filter(s => s.demand > 0).length;
  const highDemandCount = skills.filter(s => s.demand >= 100).length;
  const growingCount = skills.filter(s => s.demand >= 50 && s.demand < 100).length;

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
                  Required Skills Dashboard
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
                Required Skills
              </h1>

              <p className="mt-2 text-sm text-slate-500 md:text-base">
                Understand the skills currently required by
                employers across different industries.
              </p>

            </div>

            {/* SUMMARY CARDS */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  Required Skills
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  {loading ? "..." : requiredCount}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Skills identified from available job demand
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  High-Demand Skills
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  {loading ? "..." : highDemandCount}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Skills with strong employer demand
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  Growing Skills
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  {loading ? "..." : growingCount}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Skills showing increasing demand
                </p>
              </div>

            </div>

            {/* FILTERS */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <h2 className="text-lg font-bold text-slate-900">
                Explore Required Skills
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
                    Demand Level
                  </span>

                  <select 
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#123b68]"
                    value={selectedDemand}
                    onChange={(e) => setSelectedDemand(e.target.value)}
                  >
                    <option value="">All Levels</option>
                    <option value="high">High</option>
                    <option value="growing">Growing</option>
                    <option value="moderate">Moderate</option>
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

            {/* SKILLS LIST */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Top Required Skills
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Skills that employers are looking for across
                  the labour market.
                </p>
              </div>

              {loading ? (
                <div className="mt-5 text-center text-slate-500">
                  Loading skills...
                </div>
              ) : skills.length === 0 ? (
                <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-sm text-slate-500">
                    No skills available for the selected filters.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-3">

                  {skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-slate-50"
                    >

                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                        <div>

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="font-semibold text-slate-900">
                              {skill.name}
                            </h3>

                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                              Demand: {skill.demand}
                            </span>

                          </div>

                          <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                            <span>Training Available: {skill.mapped_training_count} courses</span>
                            {skill.associated_roles.length > 0 && (
                              <span>Roles: {skill.associated_roles.slice(0, 3).join(", ")}</span>
                            )}
                          </div>

                        </div>

                        <div className="flex items-center gap-3">

                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            skill.demand >= 100 ? "bg-green-50 text-green-700" :
                            skill.demand >= 50 ? "bg-blue-50 text-blue-700" :
                            skill.demand > 0 ? "bg-yellow-50 text-yellow-700" :
                            "bg-slate-100 text-slate-600"
                          }`}>
                            {skill.demand >= 100 ? "High" :
                             skill.demand >= 50 ? "Growing" :
                             skill.demand > 0 ? "Moderate" : "Low"}
                          </span>

                          {skill.required_proficiency && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              {skill.required_proficiency}
                            </span>
                          )}

                        </div>

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </div>

            {/* INTELLIGENCE NOTICE */}
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">

              <h2 className="font-semibold text-[#123b68]">
                Skill Intelligence
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Required-skill insights are calculated from actual demand data and job postings in the labour market.
              </p>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}