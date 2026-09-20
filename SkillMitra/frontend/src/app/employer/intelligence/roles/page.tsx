"use client";

import Image from "next/image";
import EmployerSidebar from "@/components/employer/EmployerSidebar";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

type RoleData = {
  id: string;
  title: string;
  sector: string | null;
  open_postings: number;
  demand_count: number;
  demand_classification: string | null;
};

export default function EmergingJobRolesPage() {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSector, setSelectedSector] = useState("");

  useEffect(() => {
    async function loadRoles() {
      try {
        setLoading(true);
        setError(null);
        
        const params: any = {};
        if (selectedDistrict) params.district_id = selectedDistrict;
        if (selectedSector) params.sector_id = selectedSector;
        
        const data = await api.employerIntelligenceRoles(params);
        setRoles(data);
      } catch (err) {
        console.error("Failed to load roles:", err);
        setError("Unable to load job roles data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadRoles();
  }, [selectedDistrict, selectedSector]);

  // Calculate summary statistics
  const emergingCount = roles.filter(r => r.demand_classification === "Low" && r.demand_count > 0).length;
  const highDemandCount = roles.filter(r => r.demand_classification === "High").length;
  const growingCount = roles.filter(r => r.demand_classification === "Moderate").length;

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
            SkillMitra | Industry Portal
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
          Emerging Job Roles Dashboard
        </p>
      </div>

    </div>
  </div>

  <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">

            {/* PAGE HEADER */}
            <div className="mb-7">

              <p className="text-xs font-semibold text-slate-400">
                SkillMitra / Labour Market Intelligence
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
                Emerging Job Roles
              </h1>

              <p className="mt-2 text-sm text-slate-500 md:text-base">
                Identify emerging and growing job roles based on
                industry demand and labour-market intelligence.
              </p>

            </div>

            {/* SUMMARY CARDS */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  Emerging Roles
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  {loading ? "..." : emergingCount}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Roles identified from available intelligence
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  High-Demand Roles
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  {loading ? "..." : highDemandCount}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Roles with strong industry demand
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  Growing Roles
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  {loading ? "..." : growingCount}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Roles showing increasing demand
                </p>
              </div>

            </div>

            {/* FILTERS */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <h2 className="text-lg font-bold text-slate-900">
                Explore Job Roles
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

            {/* JOB ROLES */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

              <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Emerging & Growing Roles
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Job roles requiring attention from employers and
                    the skill-development ecosystem.
                  </p>
                </div>

              </div>

              {loading ? (
                <div className="mt-5 text-center text-slate-500">
                  Loading job roles...
                </div>
              ) : roles.length === 0 ? (
                <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-sm text-slate-500">
                    No job roles available for the selected filters.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-3">

                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-slate-50"
                    >

                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                        <div>

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="font-semibold text-slate-900">
                              {role.title}
                            </h3>

                            {role.sector && (
                              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                                {role.sector}
                              </span>
                            )}

                          </div>

                          <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                            <span>Openings: {role.open_postings}</span>
                            <span>Demand Score: {role.demand_count}</span>
                          </div>

                        </div>

                        <div className="flex items-center gap-3">

                          {role.demand_classification && (
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              role.demand_classification === "High" ? "bg-green-50 text-green-700" :
                              role.demand_classification === "Moderate" ? "bg-blue-50 text-blue-700" :
                              "bg-yellow-50 text-yellow-700"
                            }`}>
                              {role.demand_classification}
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
                Labour-Market Intelligence
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Job-role insights are calculated from actual demand data and job postings in the labour market.
              </p>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}