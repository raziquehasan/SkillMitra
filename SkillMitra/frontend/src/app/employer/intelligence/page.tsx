"use client";

import Image from "next/image";
import EmployerSidebar from "@/components/employer/EmployerSidebar";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

type DemandData = {
  total_demand: number;
  open_job_postings: number;
  districts_covered: number;
  top_roles: Array<{ id: string; title: string; demand: number }>;
  top_sectors: Array<{ id: string; name: string; demand: number }>;
  top_skills: Array<{ id: string; name: string; demand: number }>;
};

export default function IndustryDemandPage() {
  const [demandData, setDemandData] = useState<DemandData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [districts, setDistricts] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [jobRoles, setJobRoles] = useState<any[]>([]);

  useEffect(() => {
    async function loadReferenceData() {
      try {
        const [districtsData, sectorsData, jobRolesData] = await Promise.all([
          api.districts().catch(() => []),
          api.sectors().catch(() => []),
          api.jobRoles().catch(() => [])
        ]);
        setDistricts(districtsData);
        setSectors(sectorsData);
        setJobRoles(jobRolesData);
      } catch (err) {
        console.error("Failed to load reference data:", err);
      }
    }

    loadReferenceData();
  }, []);

  useEffect(() => {
    async function loadDemandData() {
      try {
        setLoading(true);
        setError(null);
        
        const params: any = {};
        if (selectedDistrict) params.district_id = selectedDistrict;
        if (selectedSector) params.sector_id = selectedSector;
        if (selectedRole) params.job_role_id = selectedRole;
        
        const data = await api.employerIntelligenceDemand(params);
        setDemandData(data);
      } catch (err) {
        console.error("Failed to load demand data:", err);
        setError("Unable to load demand intelligence. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadDemandData();
  }, [selectedDistrict, selectedSector, selectedRole]);

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-slate-800">

      {/* GOVERNMENT TOP BAR */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-[#123b68] text-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3 text-sm">

          <div className="flex items-center gap-3">
            <Image
              src="/maharashtra-gov-logo.png"
              alt="Government of Maharashtra"
              width={42}
              height={42}
              className="h-11 w-11 object-contain"
              priority
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

          <div className="hidden md:block font-semibold">
                 SkillMitra | Industry Portal
          </div>

        </div>
      </header>

      {/* ORANGE LINE */}
      <div className="fixed left-0 right-0 top-[72px] z-50 h-1 bg-[#c2410c]" />

      <div className="min-h-screen pt-[76px]">

  <EmployerSidebar />

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
                  Industry Dashboard
                </p>
              </div>

            </div>
          </div>

          {/* DASHBOARD CONTENT */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">

            {/* PAGE HEADER */}
            <div className="mb-7">
              <p className="text-xs font-semibold text-slate-400">
                SkillMitra / Industry Dashboard
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
                Industry Demand
              </h1>

              <p className="mt-2 text-sm text-slate-500 md:text-base">
                Understand current industry demand across districts,
                sectors and job roles.
              </p>
            </div>

            {/* FILTERS */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <h2 className="text-lg font-bold text-slate-900">
                Demand Filters
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-3">

                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                    District
                  </span>

                  <select 
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                  >
                    <option value="">All Districts</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>{district.name}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                    Industry Sector
                  </span>

                  <select 
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                  >
                    <option value="">All Sectors</option>
                    {sectors.map((sector) => (
                      <option key={sector.id} value={sector.id}>{sector.name}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                    Job Role
                  </span>

                  <select 
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="">All Roles</option>
                    {jobRoles.map((role) => (
                      <option key={role.id} value={role.id}>{role.title}</option>
                    ))}
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

            {/* DEMAND OVERVIEW */}
            <div className="mt-6 grid gap-6 md:grid-cols-3">

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs text-slate-500">
                  Current Job Demand
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  {loading ? "..." : demandData?.open_job_postings ?? "—"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Openings identified
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs text-slate-500">
                  High-Demand Skills
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  {loading ? "..." : demandData?.top_skills.length ?? "—"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Skills with strong industry demand
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs text-slate-500">
                  Total Demand Score
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  {loading ? "..." : demandData?.total_demand ?? "—"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Aggregate demand across all sectors
                </p>
              </div>

            </div>

            {/* REQUIRED SKILLS */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

              <h2 className="text-lg font-bold text-slate-900">
                Top Required Skills
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Skills currently required by industry.
              </p>

              {loading ? (
                <div className="mt-5 text-center text-slate-500">
                  Loading skill demand data...
                </div>
              ) : demandData?.top_skills && demandData.top_skills.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {demandData.top_skills.slice(0, 5).map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center gap-3"
                    >
                      <div className="w-40 text-sm font-medium">
                        {skill.name}
                      </div>

                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">

                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{
                            width: `${Math.min((skill.demand / (demandData.top_skills[0]?.demand || 1)) * 100, 100)}%`,
                          }}
                        />

                      </div>

                      <span className="w-20 text-right text-xs text-slate-500">
                        {skill.demand}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-sm text-slate-500">
                    No skill demand data available for the selected filters.
                  </p>
                </div>
              )}

            </div>

            {/* DEMAND ANALYSIS */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

              <h2 className="text-lg font-bold text-slate-900">
                Demand Analysis
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Industry demand insights for the selected district,
                sector and job role.
              </p>

              {loading ? (
                <div className="mt-5 text-center text-slate-500">
                  Loading demand analysis...
                </div>
              ) : demandData ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  
                  {/* Top Roles */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Top Job Roles</h3>
                    {demandData.top_roles.length > 0 ? (
                      <div className="space-y-2">
                        {demandData.top_roles.slice(0, 5).map((role) => (
                          <div key={role.id} className="flex justify-between text-sm">
                            <span className="text-slate-700">{role.title}</span>
                            <span className="font-medium text-slate-900">{role.demand}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No role data available</p>
                    )}
                  </div>

                  {/* Top Sectors */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Top Sectors</h3>
                    {demandData.top_sectors.length > 0 ? (
                      <div className="space-y-2">
                        {demandData.top_sectors.slice(0, 5).map((sector) => (
                          <div key={sector.id} className="flex justify-between text-sm">
                            <span className="text-slate-700">{sector.name}</span>
                            <span className="font-medium text-slate-900">{sector.demand}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No sector data available</p>
                    )}
                  </div>

                </div>
              ) : (
                <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-sm text-slate-500">
                    No demand analysis data available for the selected filters.
                  </p>
                </div>
              )}

            </div>

          </div>
        </section>
      </div>
    </main>
  );
}