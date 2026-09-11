
"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

const rolesData = [
  {
    sector: "EV / Automotive",
    role: "EV Battery Specialist",
    demand: "Very High",
    growth: "Very High",
    skills: "Battery Technology, BMS, Diagnostics",
    openings: 420,
    priority: "Critical",
  },
  {
    sector: "EV / Automotive",
    role: "EV Charging Technician",
    demand: "High",
    growth: "Very High",
    skills: "EV Charging, Electrical Systems",
    openings: 350,
    priority: "High",
  },
  {
    sector: "IT / Technology",
    role: "AI / ML Engineer",
    demand: "Very High",
    growth: "Very High",
    skills: "Python, Machine Learning, AI",
    openings: 390,
    priority: "Critical",
  },
  {
    sector: "IT / Technology",
    role: "Cloud Engineer",
    demand: "High",
    growth: "High",
    skills: "Cloud Computing, DevOps, Networking",
    openings: 310,
    priority: "High",
  },
  {
    sector: "Manufacturing",
    role: "Industrial IoT Technician",
    demand: "High",
    growth: "High",
    skills: "IoT, Sensors, Industrial Networks",
    openings: 280,
    priority: "High",
  },
  {
    sector: "Manufacturing",
    role: "Robotics Technician",
    demand: "High",
    growth: "Very High",
    skills: "Robotics, Automation, PLC",
    openings: 260,
    priority: "High",
  },
];

const sectorRoles = [
  {
    sector: "EV / Automotive",
    roles: 6,
    topRole: "EV Battery Specialist",
    growth: "Very High",
    demand: "Very High",
  },
  {
    sector: "IT / Technology",
    roles: 8,
    topRole: "AI / ML Engineer",
    growth: "Very High",
    demand: "Very High",
  },
  {
    sector: "Manufacturing",
    roles: 7,
    topRole: "Robotics Technician",
    growth: "Very High",
    demand: "High",
  },
];

const futureRoles = [
  {
    role: "EV Battery Specialist",
    reason:
      "Rapid growth of electric mobility and battery manufacturing",
    timeline: "0–2 Years",
  },
  {
    role: "AI / ML Engineer",
    reason: "Increasing AI adoption across industries",
    timeline: "0–2 Years",
  },
  {
    role: "Industrial IoT Technician",
    reason: "Connected machines and smart manufacturing systems",
    timeline: "2–5 Years",
  },
  {
    role: "Robotics Technician",
    reason: "Automation increases robotics support demand",
    timeline: "2–5 Years",
  },
];

export default function EmergingJobRolesPage() {
     const router = useRouter();
  const [selectedSector, setSelectedSector] = useState("All Sectors");

  const filteredRoles =
    selectedSector === "All Sectors"
      ? rolesData
      : rolesData.filter((item) => item.sector === selectedSector);

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
                  Emerging Job Roles
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  21
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Across major sectors
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  Very High Growth
                </p>

                <p className="mt-2 text-3xl font-bold text-[#c2410c]">
                  9
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Fast-growing roles
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  Future Openings
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  2,010
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Estimated opportunities
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  Priority Roles
                </p>

                <p className="mt-2 text-3xl font-bold text-[#c2410c]">
                  7
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Government priority
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
                    Explore emerging roles based on industry sector.
                  </p>
                </div>

                <div className="w-full md:w-56">

                  <label className="mb-1 block text-xs font-semibold text-slate-500">
                    Select Sector
                  </label>

                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#123b68]"
                  >
                    <option>All Sectors</option>
                    <option>EV / Automotive</option>
                    <option>IT / Technology</option>
                    <option>Manufacturing</option>
                  </select>

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

                    {filteredRoles.map((item) => (
                      <tr
                        key={item.role}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >

                        <td className="px-6 py-4 text-sm font-medium text-slate-600">
                          {item.sector}
                        </td>

                        <td className="px-6 py-4 text-sm font-bold text-[#123b68]">
                          {item.role}
                        </td>

                        <td className="px-6 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              item.demand === "Very High"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {item.demand}
                          </span>

                        </td>

                        <td className="px-6 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              item.growth === "Very High"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {item.growth}
                          </span>

                        </td>

                        <td className="max-w-xs px-6 py-4 text-sm text-slate-500">
                          {item.skills}
                        </td>

                        <td className="px-6 py-4 text-sm font-bold text-[#123b68]">
                          {item.openings}
                        </td>

                        <td className="px-6 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              item.priority === "Critical"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {item.priority}
                          </span>

                        </td>

                      </tr>
                    ))}

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

                {sectorRoles.map((item) => (
                  <div
                    key={item.sector}
                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                  >

                    <p className="text-xs font-bold uppercase tracking-wide text-[#c2410c]">
                      {item.sector}
                    </p>

                    <p className="mt-4 text-3xl font-bold text-[#123b68]">
                      {item.roles}
                    </p>

                    <p className="text-xs text-slate-500">
                      Emerging roles
                    </p>

                    <div className="mt-5 border-t border-slate-100 pt-4">

                      <p className="text-xs font-semibold text-slate-400">
                        TOP EMERGING ROLE
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-700">
                        {item.topRole}
                      </p>

                      <div className="mt-4 flex gap-2">

                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                          {item.growth} Growth
                        </span>

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                          {item.demand} Demand
                        </span>

                      </div>

                    </div>

                  </div>
                ))}

              </div>

            </div>

            {/* ================= FUTURE ROLE PIPELINE ================= */}
            <div>

              <div className="mb-4">

                <h2 className="text-xl font-bold text-[#123b68]">
                  Future Job Role Pipeline
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Roles expected to become increasingly important in the
                  coming years.
                </p>

              </div>

              <div className="grid gap-5 md:grid-cols-2">

                {futureRoles.map((item) => (
                  <div
                    key={item.role}
                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <p className="text-xs font-bold uppercase tracking-wide text-[#c2410c]">
                          Future Role
                        </p>

                        <h3 className="mt-2 text-lg font-bold text-[#123b68]">
                          {item.role}
                        </h3>

                      </div>

                      <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                        {item.timeline}
                      </span>

                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-500">
                      {item.reason}
                    </p>

                  </div>
                ))}

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

