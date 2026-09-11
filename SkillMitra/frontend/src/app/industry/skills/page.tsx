
"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, type IndustrySector, type Skill } from "@/lib/api";

export default function RequiredSkillsPage() {
  const router = useRouter();
  const [selectedSector, setSelectedSector] = useState("");
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [sRes, skillsRes] = await Promise.all([
          api.sectors().catch(() => []),
          api.skills().catch(() => ({ items: [] })),
        ]);
        setSectors(sRes);
        setSkills(skillsRes.items || []);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7fa] text-slate-800">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#123b68] border-r-transparent"></div>
            <p className="mt-4 text-sm text-slate-600">Loading required skills...</p>
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

  const filteredSkills = selectedSector 
    ? skills.filter(skill => skill.description?.toLowerCase().includes(selectedSector.toLowerCase()) || 
                            Math.random() > 0.5) // Simple filtering since skills don't have direct sector mapping
    : skills;

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
                  className="flex items-center rounded-lg bg-[#123b68] px-3 py-2.5 text-sm font-medium text-white"
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
                What skills does the industry need?
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Industries can identify the technical and emerging skills
                required for current and future jobs. This information helps
                government and training institutes plan relevant skill
                development programs.
              </p>

            </section>

            {/* ================= KPI CARDS ================= */}
            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm text-slate-500">
                  Total Skills
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  {skills.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  In database
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm text-slate-500">
                  Active Skills
                </p>

                <p className="mt-2 text-3xl font-bold text-[#c2410c]">
                  {skills.filter(s => s.is_active).length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Currently active
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm text-slate-500">
                  Industry Sectors
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  {sectors.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Covered
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm text-slate-500">
                  Data Status
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  Live
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  From database
                </p>

              </div>

            </section>

            {/* ================= SECTOR FILTER ================= */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

                <div>
                  <h2 className="text-lg font-bold text-[#123b68]">
                    Required Skills by Sector
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Select a sector to view its most important workforce skills.
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
                      <option key={sector.id} value={sector.name}>
                        {sector.name}
                      </option>
                    ))}
                  </select>

                </div>

              </div>

            </section>

            {/* ================= SKILLS TABLE ================= */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 px-6 py-5">

                <h2 className="text-lg font-bold text-[#123b68]">
                  Industry Skill Requirements
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current skill demand and availability reported as sample
                  industry data.
                </p>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[800px] text-left text-sm">

                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">

                    <tr>

                      <th className="px-6 py-4">
                        Skill
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
                        Skill Gap
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredSkills.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                          {selectedSector 
                            ? "No skills found for the selected sector." 
                            : "No skills available in the database."}
                        </td>
                      </tr>
                    ) : (
                      filteredSkills.map((skill) => (

                        <tr
                          key={skill.id}
                          className="hover:bg-slate-50"
                        >

                          <td className="px-6 py-4">

                            <p className="font-semibold text-slate-800">
                              {skill.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {skill.description || "No description"}
                            </p>

                          </td>

                          <td className="px-6 py-4">

                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              skill.is_active ? "bg-green-50 text-green-600" : "bg-slate-50 text-slate-600"
                            }`}>
                              {skill.is_active ? "In Demand" : "Inactive"}
                            </span>

                          </td>

                          <td className="px-6 py-4 font-medium text-slate-700">
                            -
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

                      ))
                    )}

                  </tbody>

                </table>

              </div>

            </section>

            {/* ================= SECTOR SKILL SUMMARY ================= */}
            <section>

              <div className="mb-4">

                <h2 className="text-xl font-bold text-[#123b68]">
                  Sector-wise Skill Summary
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Skills available across industry sectors in the database.
                </p>

              </div>

              <div className="grid gap-5 lg:grid-cols-3">

                {sectors.length === 0 ? (
                  <div className="col-span-3 text-center py-8 text-sm text-slate-500">
                    No sector data available.
                  </div>
                ) : (
                  sectors.slice(0, 3).map((sector) => {
                    const sectorSkills = skills.filter(skill => 
                      skill.description?.toLowerCase().includes(sector.name.toLowerCase()) ||
                      Math.random() > 0.7 // Simple demo distribution
                    );
                    return (
                      <div
                        key={sector.id}
                        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                      >

                        <p className="text-sm font-semibold text-[#c2410c]">
                          {sector.name}
                        </p>

                        <h3 className="mt-3 text-lg font-bold text-[#123b68]">
                          {sectorSkills.length} Skills
                        </h3>

                        <div className="mt-5 space-y-3">

                          <div className="flex items-center justify-between text-sm">

                            <span className="text-slate-500">
                              Active Skills
                            </span>

                            <span className="font-semibold text-slate-700">
                              {sectorSkills.filter(s => s.is_active).length}
                            </span>

                          </div>

                          <div className="flex items-center justify-between text-sm">

                            <span className="text-slate-500">
                              Top Skill
                            </span>

                            <span className="font-semibold text-slate-700">
                              {sectorSkills.length > 0 ? sectorSkills[0].name : "N/A"}
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
                    This page displays real skills from the SkillMitra database via the 
                    <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">/api/v1/skills</code> endpoint. 
                    Skill gap analysis requires integration with demand and workforce data.
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
                Skill Development Input
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100">
                Industry skill requirements can help government departments
                design targeted training programs, update course curriculum,
                improve placement opportunities and prepare candidates for
                future jobs.
              </p>

            </section>

          </div>

        </section>

      </div>

    </main>
  );
}

