"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

const workforceData = [
  {
    sector: "EV / Automotive",
    role: "EV Technician",
    district: "Pune",
    demand: "High",
    required: 850,
    available: 540,
    gap: 310,
  },
  {
    sector: "EV / Automotive",
    role: "Battery Specialist",
    district: "Aurangabad",
    demand: "Very High",
    required: 720,
    available: 390,
    gap: 330,
  },
  {
    sector: "IT / Technology",
    role: "AI / ML Engineer",
    district: "Mumbai",
    demand: "Very High",
    required: 690,
    available: 360,
    gap: 330,
  },
  {
    sector: "IT / Technology",
    role: "Cloud Engineer",
    district: "Pune",
    demand: "High",
    required: 620,
    available: 410,
    gap: 210,
  },
  {
    sector: "Manufacturing",
    role: "Automation Technician",
    district: "Nashik",
    demand: "High",
    required: 640,
    available: 450,
    gap: 190,
  },
  {
    sector: "Manufacturing",
    role: "Robotics Technician",
    district: "Nagpur",
    demand: "High",
    required: 560,
    available: 310,
    gap: 250,
  },
];

const sectorData = [
  {
    sector: "EV / Automotive",
    required: 1570,
    available: 930,
    gap: 640,
    priority: "Critical",
  },
  {
    sector: "IT / Technology",
    required: 1310,
    available: 770,
    gap: 540,
    priority: "Critical",
  },
  {
    sector: "Manufacturing",
    required: 1200,
    available: 760,
    gap: 440,
    priority: "High",
  },
];

const districtData = [
  {
    district: "Pune",
    sector: "EV / Automotive",
    gap: 310,
    priority: "High",
  },
  {
    district: "Mumbai",
    sector: "IT / Technology",
    gap: 330,
    priority: "Critical",
  },
  {
    district: "Aurangabad",
    sector: "EV / Automotive",
    gap: 330,
    priority: "Critical",
  },
  {
    district: "Nagpur",
    sector: "Manufacturing",
    gap: 250,
    priority: "High",
  },
];

export default function WorkforceGapPage() {
     const router = useRouter();
  const [selectedSector, setSelectedSector] = useState("All Sectors");

  const filteredWorkforce =
    selectedSector === "All Sectors"
      ? workforceData
      : workforceData.filter((item) => item.sector === selectedSector);

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
                  className="flex items-center rounded-lg bg-[#123b68] px-3 py-2.5 text-sm font-medium text-white"
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
                Where is the workforce gap?
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Industries can identify where skilled workforce availability
                is lower than current demand. This information helps government
                departments plan targeted training, employment and placement
                initiatives.
              </p>

            </section>

            {/* ================= KPI CARDS ================= */}
            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Total Workforce Required
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  4,080
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Across major sectors
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Workforce Available
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  2,460
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Existing skilled workforce
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Total Workforce Gap
                </p>

                <p className="mt-2 text-3xl font-bold text-[#c2410c]">
                  1,620
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Immediate workforce shortage
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Priority Level
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  Critical
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Government action required
                </p>
              </div>

            </section>

            {/* ================= SECTOR FILTER ================= */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

                <div>
                  <h2 className="text-lg font-bold text-[#123b68]">
                    Workforce Gap by Sector
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Select a sector to view its current workforce requirement
                    and availability.
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
                    <option>All Sectors</option>
                    <option>EV / Automotive</option>
                    <option>IT / Technology</option>
                    <option>Manufacturing</option>
                  </select>

                </div>

              </div>

            </section>

            {/* ================= WORKFORCE TABLE ================= */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 px-6 py-5">

                <h2 className="text-lg font-bold text-[#123b68]">
                  Workforce Gap Analysis
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current workforce demand and availability reported as sample
                  industry data.
                </p>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[900px] text-left text-sm">

                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">

                    <tr>

                      <th className="px-6 py-4">
                        Sector
                      </th>

                      <th className="px-6 py-4">
                        Role
                      </th>

                      <th className="px-6 py-4">
                        District
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
                        Gap
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredWorkforce.map((item) => (

                      <tr
                        key={`${item.role}-${item.district}`}
                        className="hover:bg-slate-50"
                      >

                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-800">
                            {item.sector}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-700">
                            {item.role}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {item.district}
                        </td>

                        <td className="px-6 py-4">

                          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#c2410c]">
                            {item.demand}
                          </span>

                        </td>

                        <td className="px-6 py-4 font-medium text-slate-700">
                          {item.required}
                        </td>

                        <td className="px-6 py-4 font-medium text-slate-700">
                          {item.available}
                        </td>

                        <td className="px-6 py-4">

                          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                            {item.gap}
                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </section>

            {/* ================= SECTOR SUMMARY ================= */}
            <section>

              <div className="mb-4">

                <h2 className="text-xl font-bold text-[#123b68]">
                  Sector-wise Workforce Gap
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Sectors with the highest workforce shortages requiring
                  immediate attention.
                </p>

              </div>

              <div className="grid gap-5 lg:grid-cols-3">

                {sectorData.map((item) => (

                  <div
                    key={item.sector}
                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                  >

                    <p className="text-sm font-semibold text-[#c2410c]">
                      {item.sector}
                    </p>

                    <h3 className="mt-3 text-lg font-bold text-[#123b68]">
                      Workforce Shortage
                    </h3>

                    <div className="mt-5 space-y-3">

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">
                          Required
                        </span>

                        <span className="font-semibold text-slate-700">
                          {item.required}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">
                          Available
                        </span>

                        <span className="font-semibold text-slate-700">
                          {item.available}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">
                          Workforce Gap
                        </span>

                        <span className="font-semibold text-red-600">
                          {item.gap}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">
                          Priority
                        </span>

                        <span className="font-semibold text-[#c2410c]">
                          {item.priority}
                        </span>
                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </section>

            {/* ================= DISTRICT GAP ================= */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-5">

                <h2 className="text-lg font-bold text-[#123b68]">
                  District-wise Workforce Gap
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Districts where workforce shortages are most visible.
                </p>

              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                {districtData.map((item) => (

                  <div
                    key={item.district}
                    className="rounded-lg border border-slate-200 p-5"
                  >

                    <p className="text-sm font-semibold text-[#c2410c]">
                      {item.district}
                    </p>

                    <h3 className="mt-2 font-semibold text-slate-800">
                      {item.sector}
                    </h3>

                    <div className="mt-4 flex items-center justify-between">

                      <span className="text-sm text-slate-500">
                        Gap
                      </span>

                      <span className="font-bold text-red-600">
                        {item.gap}
                      </span>

                    </div>

                    <p className="mt-2 text-xs font-medium text-slate-500">
                      Priority: {item.priority}
                    </p>

                  </div>

                ))}

              </div>

            </section>

            {/* ================= GOVERNMENT INPUT ================= */}
            <section className="rounded-xl bg-[#123b68] p-6 text-white shadow-sm">

              <p className="text-xs font-bold uppercase tracking-wider text-orange-200">
                INDUSTRY → GOVERNMENT
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Workforce Development Input
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100">
                Workforce gap information can help government departments
                identify shortage areas, increase training capacity, support
                placement programs and prepare skilled candidates for
                high-demand industry roles.
              </p>

            </section>

          </div>

        </section>

      </div>

    </main>
  );
}