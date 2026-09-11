"use client";

import Image from "next/image";
import { useState } from "react";

const requirementData = [
  {
    sector: "EV / Automotive",
    role: "EV Technician",
    district: "Pune",
    priority: "High",
    required: 850,
    available: 540,
    gap: 310,
    timeline: "0–2 Years",
  },
  {
    sector: "EV / Automotive",
    role: "Battery Specialist",
    district: "Aurangabad",
    priority: "Very High",
    required: 720,
    available: 390,
    gap: 330,
    timeline: "0–2 Years",
  },
  {
    sector: "IT / Technology",
    role: "AI / ML Engineer",
    district: "Mumbai",
    priority: "Very High",
    required: 690,
    available: 360,
    gap: 330,
    timeline: "0–2 Years",
  },
  {
    sector: "IT / Technology",
    role: "Cloud Engineer",
    district: "Pune",
    priority: "High",
    required: 620,
    available: 410,
    gap: 210,
    timeline: "0–2 Years",
  },
  {
    sector: "Manufacturing",
    role: "Automation Technician",
    district: "Nashik",
    priority: "High",
    required: 640,
    available: 450,
    gap: 190,
    timeline: "2–5 Years",
  },
  {
    sector: "Manufacturing",
    role: "Robotics Technician",
    district: "Nagpur",
    priority: "High",
    required: 560,
    available: 310,
    gap: 250,
    timeline: "2–5 Years",
  },
];

const sectorData = [
  {
    sector: "EV / Automotive",
    workforce: "1,570",
    current: "930",
    gap: "640",
    priority: "Critical",
    focus: "EV Technicians & Battery Specialists",
  },
  {
    sector: "IT / Technology",
    workforce: "1,310",
    current: "770",
    gap: "540",
    priority: "Critical",
    focus: "AI/ML & Cloud Engineers",
  },
  {
    sector: "Manufacturing",
    workforce: "1,200",
    current: "760",
    gap: "440",
    priority: "High",
    focus: "Automation & Robotics",
  },
];

const trainingData = [
  {
    program: "EV Technician Training",
    duration: "6 Months",
    target: 320,
    priority: "Very High",
  },
  {
    program: "AI & Machine Learning",
    duration: "8 Months",
    target: 280,
    priority: "Very High",
  },
  {
    program: "Industrial Automation",
    duration: "6 Months",
    target: 240,
    priority: "High",
  },
];

export default function WorkforceRequirementsPage() {
  const [selectedSector, setSelectedSector] = useState("All Sectors");

  const filteredData =
    selectedSector === "All Sectors"
      ? requirementData
      : requirementData.filter((item) => item.sector === selectedSector);

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-slate-800">
      {/* Government Header */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-[#123b68] text-white">
        <div className="flex h-[60px] items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image
                src="/government-logo.png"
                alt="Government Logo"
                fill
                className="object-contain"
              />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Government of Maharashtra
              </p>
              <p className="text-[11px] text-blue-100">
                Skill Development & Workforce Intelligence
              </p>
            </div>
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium">Industry Portal</p>
            <p className="text-[11px] text-blue-100">
              Workforce Planning System
            </p>
          </div>
        </div>
      </header>

      {/* Orange Line */}
      <div className="fixed left-0 right-0 top-[60px] z-50 h-1 bg-[#c2410c]" />

      <div className="flex min-h-screen pt-[65px]">
        {/* Sidebar */}
        <aside className="fixed bottom-0 left-0 top-[65px] z-20 hidden w-72 overflow-y-auto border-r border-slate-200 bg-white lg:block">
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
              <h1 className="text-xl font-bold text-[#123b68]">SkillMitra</h1>
              <p className="text-xs text-slate-500">Industry Portal</p>
            </div>
          </div>

          <nav className="p-4">
            {/* Industry Intelligence */}
            <div className="mb-6">
              <p className="mb-3 px-3 text-[11px] font-bold tracking-wider text-slate-400">
                INDUSTRY INTELLIGENCE
              </p>

              <div className="space-y-1">
                <a
                  href="/industry"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Dashboard
                </a>

                <a
                  href="/industry/demand"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Industry Demand
                </a>

                <a
                  href="/industry/skills"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Required Skills
                </a>

                <a
                  href="/industry/workforce"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Workforce Gap
                </a>

                <a
                  href="/industry/roles"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Emerging Job Roles
                </a>

                <a
                  href="/industry/trends"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
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
                  className="block rounded-lg bg-[#123b68] px-3 py-2.5 text-sm font-medium text-white"
                >
                  Workforce Requirements
                </a>

                <a
                  href="/industry/profile"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Industry Profile
                </a>

                <a
                  href="/industry/settings"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Settings
                </a>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <section className="min-w-0 flex-1 lg:ml-72">
          <div className="space-y-7 p-6 lg:p-10">
            {/* Intro */}
            <div>
              <p className="text-sm font-semibold text-[#c2410c]">
                INDUSTRY REQUIREMENTS
              </p>

              <h2 className="mt-1 text-3xl font-bold text-[#123b68]">
                What workforce does the industry need?
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Workforce requirements help identify how many skilled workers
                industries will need across sectors, roles and districts.
              </p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Total Workforce Required
                </p>
                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  4,080
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Across priority sectors
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Current Workforce
                </p>
                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  2,460
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Currently available
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Additional Workforce
                </p>
                <p className="mt-2 text-3xl font-bold text-orange-600">
                  1,620
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Additional workers required
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Planning Priority
                </p>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  Critical
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Immediate action required
                </p>
              </div>
            </div>

            {/* Sector Filter */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h3 className="text-lg font-bold text-[#123b68]">
                    Workforce Requirements by Sector
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Select a sector to view detailed workforce requirements.
                  </p>
                </div>

                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-[#123b68]"
                >
                  <option>All Sectors</option>
                  <option>EV / Automotive</option>
                  <option>IT / Technology</option>
                  <option>Manufacturing</option>
                </select>
              </div>
            </div>

            {/* Requirement Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h3 className="text-lg font-bold text-[#123b68]">
                  Detailed Workforce Requirements
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Workforce requirement by sector, role and district.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Sector
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Role
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        District
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Priority
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Required
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Available
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Additional Need
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Timeline
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredData.map((item) => (
                      <tr
                        key={`${item.role}-${item.district}`}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                          {item.sector}
                        </td>

                        <td className="px-6 py-4 text-sm font-semibold text-[#123b68]">
                          {item.role}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {item.district}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              item.priority === "Very High"
                                ? "bg-red-100 text-red-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {item.priority}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                          {item.required}
                        </td>

                        <td className="px-6 py-4 text-sm font-semibold text-emerald-600">
                          {item.available}
                        </td>

                        <td className="px-6 py-4 text-sm font-bold text-red-600">
                          {item.gap}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {item.timeline}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sector-wise Requirements */}
            <div>
              <h3 className="mb-4 text-lg font-bold text-[#123b68]">
                Sector-wise Workforce Requirements
              </h3>

              <div className="grid gap-5 lg:grid-cols-3">
                {sectorData.map((item) => (
                  <div
                    key={item.sector}
                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-bold text-[#123b68]">
                        {item.sector}
                      </h4>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          item.priority === "Critical"
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-[10px] font-semibold uppercase text-slate-400">
                          Required
                        </p>
                        <p className="mt-1 text-lg font-bold text-slate-700">
                          {item.workforce}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-[10px] font-semibold uppercase text-slate-400">
                          Current
                        </p>
                        <p className="mt-1 text-lg font-bold text-emerald-600">
                          {item.current}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-[10px] font-semibold uppercase text-slate-400">
                          Gap
                        </p>
                        <p className="mt-1 text-lg font-bold text-red-600">
                          {item.gap}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Workforce Focus
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-600">
                        {item.focus}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Training Priorities */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h3 className="text-lg font-bold text-[#123b68]">
                  Workforce Training Priorities
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Suggested training programs based on industry workforce
                  requirements.
                </p>
              </div>

              <div className="grid gap-4 p-6 md:grid-cols-3">
                {trainingData.map((item) => (
                  <div
                    key={item.program}
                    className="rounded-xl border border-slate-200 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-bold text-[#123b68]">
                        {item.program}
                      </h4>

                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                        {item.priority}
                      </span>
                    </div>

                    <p className="mt-4 text-sm text-slate-500">
                      Duration:{" "}
                      <span className="font-semibold text-slate-700">
                        {item.duration}
                      </span>
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Target workforce:{" "}
                      <span className="font-semibold text-slate-700">
                        {item.target}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Government Input */}
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#123b68]">
                Government Input
              </p>

              <h3 className="mt-2 text-lg font-bold text-[#123b68]">
                Workforce planning recommendation
              </h3>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
                Government skill-development programs should prioritize
                high-gap occupations, expand targeted training capacity and
                align training programs with district-level industry demand.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#123b68] shadow-sm">
                  Increase Training Capacity
                </span>

                <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#123b68] shadow-sm">
                  Focus on Critical Gaps
                </span>

                <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#123b68] shadow-sm">
                  District-wise Planning
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}