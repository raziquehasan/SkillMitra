
"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, type IndustrySector, type District } from "@/lib/api";

export default function EmergingJobRolesPage() {
     const router = useRouter();
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [jobRoles, setJobRoles] = useState<any[]>([]);
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
        const roles = await api.jobRoles(selectedSector || undefined, selectedDistrict || undefined);
        setJobRoles(roles);
      } catch (err) {
        console.error("Failed to load job roles:", err);
        setJobRoles([]);
      }
    })();
  }, [selectedSector, selectedDistrict]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7fa] text-slate-800">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#123b68] border-r-transparent"></div>
            <p className="mt-4 text-sm text-slate-600">Loading emerging job roles...</p>
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
            className="rounded-md border border-blue-200/40 px-4 py-2 text-xs font-semibold hover:bg-white/10">
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

            {/* Industry Intelligence */}
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
                  className="flex items-center rounded-lg bg-[#123b68] px-3 py-2.5 text-sm font-medium text-white"
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

            {/* Industry Requirements */}
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

            {/* ================= PAGE INTRO ================= */}
            <div>

              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#c2410c]">
                INDUSTRY → GOVERNMENT
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-[#123b68]">
                Which jobs are emerging?
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Identify new and rapidly growing job roles across industries.
                This intelligence helps government departments and training
                institutions prepare the workforce for future employment
                opportunities.
              </p>

            </div>

            {/* ================= KPI CARDS ================= */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  Total Job Roles
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  {jobRoles.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {selectedSector ? "Filtered by sector" : "Across all sectors"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  Active Roles
                </p>

                <p className="mt-2 text-3xl font-bold text-[#c2410c]">
                  {jobRoles.filter(role => role.is_active).length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Currently active positions
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  Available Sectors
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  {sectors.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Industry sectors covered
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  Districts Covered
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  {districts.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Geographic coverage
                </p>
              </div>

            </div>

            {/* ================= FILTER SECTION ================= */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                  <h2 className="text-lg font-bold text-[#123b68]">
                    Emerging Roles by Sector
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Explore emerging roles based on industry sector and district.
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="w-full md:w-48">
                    <label className="mb-1 block text-xs font-semibold text-slate-500">
                      Select Sector
                    </label>
                    <select
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#123b68]"
                    >
                      <option value="">All Sectors</option>
                      {sectors.map((sector) => (
                        <option key={sector.id} value={sector.id}>
                          {sector.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full md:w-48">
                    <label className="mb-1 block text-xs font-semibold text-slate-500">
                      Select District
                    </label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#123b68]"
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

              </div>

            </div>

            {/* ================= EMERGING JOB ROLES TABLE ================= */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 px-6 py-5">

                <h2 className="text-lg font-bold text-[#123b68]">
                  Emerging Job Roles
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Roles showing strong future demand and growth potential.
                </p>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[900px] text-left">

                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Sector
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Emerging Role
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Demand
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Growth
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Required Skills
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Openings
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Priority
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {jobRoles.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">
                          {selectedSector || selectedDistrict 
                            ? "No job roles found for the selected filters. Try different criteria." 
                            : "Select a sector or district to view job roles."}
                        </td>
                      </tr>
                    ) : (
                      jobRoles.map((role) => (
                        <tr
                          key={role.id}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                        >

                          <td className="px-6 py-4 text-sm font-medium text-slate-600">
                            {role.industry_sector_id || "General"}
                          </td>

                          <td className="px-6 py-4 text-sm font-bold text-[#123b68]">
                            {role.title}
                          </td>

                          <td className="px-6 py-4">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                role.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {role.is_active ? "Active" : "Inactive"}
                            </span>

                          </td>

                          <td className="px-6 py-4">

                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                              Available
                            </span>

                          </td>

                          <td className="max-w-xs px-6 py-4 text-sm text-slate-500">
                            {role.description || "No description available"}
                          </td>

                          <td className="px-6 py-4 text-sm font-bold text-[#123b68]">
                            -
                          </td>

                          <td className="px-6 py-4">

                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                              Standard
                            </span>

                          </td>

                        </tr>
                      ))
                    )}

                  </tbody>

                </table>

              </div>

            </div>

            {/* ================= SECTOR-WISE ROLES ================= */}
            <div>

              <div className="mb-4">

                <h2 className="text-xl font-bold text-[#123b68]">
                  Sector-wise Emerging Roles
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Sector-level view of emerging workforce opportunities.
                </p>

              </div>

              <div className="grid gap-5 md:grid-cols-3">

                {sectors.length === 0 ? (
                  <div className="col-span-3 text-center py-8 text-sm text-slate-500">
                    No sector data available. Load sectors to view sector-wise roles.
                  </div>
                ) : (
                  sectors.map((sector) => {
                    const sectorRoles = jobRoles.filter(role => 
                      role.industry_sector_id === sector.id
                    );
                    return (
                      <div
                        key={sector.id}
                        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                      >

                        <p className="text-xs font-bold uppercase tracking-wide text-[#c2410c]">
                          {sector.name}
                        </p>

                        <p className="mt-4 text-3xl font-bold text-[#123b68]">
                          {sectorRoles.length}
                        </p>

                        <p className="text-xs text-slate-500">
                          Available roles
                        </p>

                        <div className="mt-5 border-t border-slate-100 pt-4">

                          <p className="text-xs font-semibold text-slate-400">
                            TOP ROLE
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-700">
                            {sectorRoles.length > 0 ? sectorRoles[0].title : "No roles"}
                          </p>

                          <div className="mt-4 flex gap-2">

                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                              {sectorRoles.filter(r => r.is_active).length} Active
                            </span>

                          </div>

                        </div>

                      </div>
                    );
                  })
                )}

              </div>

            </div>

            {/* ================= DATA SOURCE NOTICE ================= */}
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-6">
              <div className="flex items-start gap-4">
                <div className="text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#123b68]">Data Source</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    This page displays real job roles from the SkillMitra database via the 
                    <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">/api/v1/industry/job-roles</code> endpoint. 
                    Data is filtered by industry sector and district based on demand records.
                  </p>
                </div>
              </div>
            </div>

            {/* ================= GOVERNMENT INPUT ================= */}
            <div className="rounded-xl border border-[#dbe5ef] bg-white p-6 shadow-sm">

              <div className="flex flex-col gap-4 md:flex-row md:items-start">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#123b68] text-white">
                  <span className="text-lg font-bold">G</span>
                </div>

                <div>

                  <p className="text-xs font-bold uppercase tracking-widest text-[#c2410c]">
                    GOVERNMENT INPUT
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#123b68]">
                    Future Workforce Preparation
                  </h2>

                  <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-500">
                    Emerging role intelligence can help government departments
                    update training programs, introduce new courses, and align
                    skill development initiatives with future industry demand.
                  </p>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">

                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-sm font-bold text-[#123b68]">
                        Update Training
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Align existing training programs with emerging roles.
                      </p>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-sm font-bold text-[#123b68]">
                        New Courses
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Introduce courses for high-growth technologies.
                      </p>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-sm font-bold text-[#123b68]">
                        Workforce Planning
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Prepare candidates for future employment opportunities.
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}

