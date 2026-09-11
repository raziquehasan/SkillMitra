"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

const industryDemandData = [
  {
    sector: "EV / Automotive",
    role: "EV Technician",
    district: "Pune",
    demand: "Very High",
    required: 850,
    available: 540,
    gap: 310,
  },
  {
    sector: "IT / Technology",
    role: "AI / ML Engineer",
    district: "Pune",
    demand: "Very High",
    required: 620,
    available: 410,
    gap: 210,
  },
  {
    sector: "Manufacturing",
    role: "Automation Technician",
    district: "Nashik",
    demand: "High",
    required: 480,
    available: 360,
    gap: 120,
  },
  {
    sector: "Healthcare",
    role: "Medical Equipment Technician",
    district: "Mumbai",
    demand: "High",
    required: 420,
    available: 300,
    gap: 120,
  },
  {
    sector: "Renewable Energy",
    role: "Solar Technician",
    district: "Nagpur",
    demand: "High",
    required: 390,
    available: 280,
    gap: 110,
  },
];

const sectorSummary = [
  {
    sector: "EV / Automotive",
    demand: "Very High",
    requirement: 1470,
    gap: 540,
  },
  {
    sector: "IT / Technology",
    demand: "Very High",
    requirement: 620,
    gap: 210,
  },
  {
    sector: "Manufacturing",
    demand: "High",
    requirement: 480,
    gap: 120,
  },
  {
    sector: "Healthcare",
    demand: "High",
    requirement: 420,
    gap: 120,
  },
];

const districtSummary = [
  {
    district: "Pune",
    sectors: 2,
    workforce: 1470,
    gap: 520,
  },
  {
    district: "Nashik",
    sectors: 1,
    workforce: 480,
    gap: 120,
  },
  {
    district: "Mumbai",
    sectors: 1,
    workforce: 420,
    gap: 120,
  },
  {
    district: "Nagpur",
    sectors: 1,
    workforce: 390,
    gap: 110,
  },
];

export default function IndustryDemandPage() {
    const router = useRouter();
  const [selectedDistrict, setSelectedDistrict] =
    useState("All Districts");

  const [selectedSector, setSelectedSector] =
    useState("All Sectors");

  const filteredDemand = industryDemandData.filter((item) => {
    const districtMatch =
      selectedDistrict === "All Districts" ||
      item.district === selectedDistrict;

    const sectorMatch =
      selectedSector === "All Sectors" ||
      item.sector === selectedSector;

    return districtMatch && sectorMatch;
  });

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-slate-800">

      {/* ================= TOP GOVERNMENT BAR ================= */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-[#123b68] text-white">
        <div className="flex min-h-[60px] items-center justify-between px-6 lg:px-10">

          {/* Government Branding */}
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
              <p className="text-xs font-semibold">
                Government of Maharashtra
              </p>

              <p className="text-[11px] text-white/80">
                Skills, Employment, Entrepreneurship & Innovation Department
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div className="hidden items-center gap-6 md:flex">
            <span className="text-sm font-medium">
              SkillMitra Industry Portal
            </span>

            <button 
               onClick={() => router.push("/login")}
            className="text-sm hover:underline">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ================= ORANGE GOVERNMENT LINE ================= */}
      <div className="fixed left-0 right-0 top-[60px] z-50 h-1 bg-[#c2410c]" />

      {/* ================= MAIN LAYOUT ================= */}
      <div className="flex min-h-screen pt-[65px]">

        {/* ================= SIDEBAR ================= */}
        <aside className="fixed bottom-0 left-0 top-[65px] z-20 hidden w-72 overflow-y-auto border-r border-slate-200 bg-white lg:block">

          {/* SkillMitra Branding */}
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

          {/* Navigation */}
          <nav className="p-4">

            <div className="mb-6">

              <p className="mb-3 px-3 text-[11px] font-bold tracking-wider text-slate-400">
                INDUSTRY INTELLIGENCE
              </p>

              <a
                href="/industry"
                className="mb-1 block rounded-md px-4 py-3 text-sm text-slate-600 hover:bg-slate-50"
              >
                Dashboard
              </a>

              <a
                href="/industry/demand"
                className="mb-1 block rounded-md bg-[#123b68] px-4 py-3 text-sm font-semibold text-white"
              >
                Industry Demand
              </a>

              <a
                href="/industry/skills"
                className="block rounded-md px-4 py-3 text-sm text-slate-600 hover:bg-slate-50"
              >
                Required Skills
              </a>

              <a
                href="/industry/workforce"
                className="block rounded-md px-4 py-3 text-sm text-slate-600 hover:bg-slate-50"
              >
                Workforce Gap
              </a>

              <a
                href="/industry/roles"
                className="block rounded-md px-4 py-3 text-sm text-slate-600 hover:bg-slate-50"
              >
                Emerging Job Roles
              </a>

              <a
                href="/industry/trends"
                className="block rounded-md px-4 py-3 text-sm text-slate-600 hover:bg-slate-50"
              >
                Skill Trends
              </a>
            </div>

            <div>

              <p className="mb-3 px-3 text-[11px] font-bold tracking-wider text-slate-400">
                INDUSTRY REQUIREMENTS
              </p>

              <a
                href="/industry/requirements"
                className="block rounded-md px-4 py-3 text-sm text-slate-600 hover:bg-slate-50"
              >
                Workforce Requirements
              </a>

              <a
                href="/industry/profile"
                className="block rounded-md px-4 py-3 text-sm text-slate-600 hover:bg-slate-50"
              >
                Industry Profile
              </a>

              <a
                href="/industry/settings"
                className="block rounded-md px-4 py-3 text-sm text-slate-600 hover:bg-slate-50"
              >
                Settings
              </a>
            </div>
          </nav>
        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <section className="min-w-0 flex-1 lg:ml-72">

        

          <div className="space-y-7 p-6 lg:p-10">

            {/* ================= INTRODUCTION ================= */}
            <section className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">

              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

                <div>

                  <p className="mb-2 text-sm font-semibold text-[#c2410c]">
                    INDUSTRY DEMAND
                  </p>

                  <h1 className="text-3xl font-bold text-slate-900">
                    Where is workforce demand highest?
                  </h1>

                  <p className="mt-3 max-w-3xl text-base leading-7 text-slate-500">
                    This section provides an overview of current workforce
                    requirements reported by different industries and
                    highlights areas where skilled workers are in short supply.
                  </p>

                </div>

                <div className="rounded-xl bg-[#eef5fb] px-6 py-5">

                  <p className="text-xs font-medium text-slate-500">
                    Demand Status
                  </p>

                  <p className="mt-1 text-lg font-bold text-[#123b68]">
                    Active Monitoring
                  </p>

                </div>

              </div>
            </section>

            {/* ================= DEMAND KPI ================= */}
            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-xl">
                  📊
                </div>

                <p className="text-sm font-medium text-slate-500">
                  Total Workforce Demand
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  3,380
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Across monitored sectors
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-xl">
                  🔥
                </div>

                <p className="text-sm font-medium text-slate-500">
                  High Demand Roles
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  5
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Requiring immediate attention
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-xl">
                  ⚠️
                </div>

                <p className="text-sm font-medium text-slate-500">
                  Workforce Gap
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  870
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Additional workers required
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-xl">
                  🏭
                </div>

                <p className="text-sm font-medium text-slate-500">
                  Active Sectors
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  5
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Sectors reporting demand
                </p>

              </div>

            </section>

            {/* ================= FILTER ================= */}
            <section className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">

              <div className="mb-6">

                <h2 className="text-xl font-bold text-slate-900">
                  Explore Workforce Demand
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select a district or sector to view specific demand.
                </p>

              </div>

              <div className="grid gap-4 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-xs font-semibold text-slate-500">
                    DISTRICT
                  </label>

                  <select
                    value={selectedDistrict}
                    onChange={(e) =>
                      setSelectedDistrict(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#123b68]"
                  >
                    <option>All Districts</option>
                    <option>Pune</option>
                    <option>Nashik</option>
                    <option>Mumbai</option>
                    <option>Nagpur</option>
                  </select>

                </div>

                <div>

                  <label className="mb-2 block text-xs font-semibold text-slate-500">
                    INDUSTRY / SECTOR
                  </label>

                  <select
                    value={selectedSector}
                    onChange={(e) =>
                      setSelectedSector(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#123b68]"
                  >
                    <option>All Sectors</option>
                    <option>EV / Automotive</option>
                    <option>IT / Technology</option>
                    <option>Manufacturing</option>
                    <option>Healthcare</option>
                    <option>Renewable Energy</option>
                  </select>

                </div>

              </div>
            </section>

            {/* ================= DEMAND TABLE ================= */}
            <section className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">

              <div className="mb-6">

                <h2 className="text-xl font-bold text-slate-900">
                  Current Workforce Demand
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Role-wise requirement and workforce availability.
                </p>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[800px]">

                  <thead>
                    <tr className="border-b border-slate-200 text-left">

                      <th className="px-4 py-4 text-xs font-bold text-slate-400">
                        SECTOR
                      </th>

                      <th className="px-4 py-4 text-xs font-bold text-slate-400">
                        JOB ROLE
                      </th>

                      <th className="px-4 py-4 text-xs font-bold text-slate-400">
                        DISTRICT
                      </th>

                      <th className="px-4 py-4 text-xs font-bold text-slate-400">
                        DEMAND
                      </th>

                      <th className="px-4 py-4 text-xs font-bold text-slate-400">
                        REQUIRED
                      </th>

                      <th className="px-4 py-4 text-xs font-bold text-slate-400">
                        AVAILABLE
                      </th>

                      <th className="px-4 py-4 text-xs font-bold text-slate-400">
                        GAP
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {filteredDemand.length > 0 ? (

                      filteredDemand.map((item) => (

                        <tr
                          key={item.role}
                          className="border-b border-slate-100"
                        >

                          <td className="px-4 py-5 text-sm text-slate-600">
                            {item.sector}
                          </td>

                          <td className="px-4 py-5 font-semibold text-slate-700">
                            {item.role}
                          </td>

                          <td className="px-4 py-5 text-sm text-slate-500">
                            {item.district}
                          </td>

                          <td className="px-4 py-5">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                item.demand === "Very High"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-orange-50 text-orange-600"
                              }`}
                            >
                              {item.demand}
                            </span>

                          </td>

                          <td className="px-4 py-5 text-sm font-semibold text-slate-700">
                            {item.required}
                          </td>

                          <td className="px-4 py-5 text-sm text-slate-600">
                            {item.available}
                          </td>

                          <td className="px-4 py-5 font-bold text-[#c2410c]">
                            {item.gap}
                          </td>

                        </tr>

                      ))

                    ) : (

                      <tr>

                        <td
                          colSpan={7}
                          className="px-4 py-8 text-center text-sm text-slate-400"
                        >
                          No current demand data available for this selection.
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </section>

            {/* ================= SECTOR SUMMARY ================= */}
            <section className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">

              <div className="mb-6">

                <h2 className="text-xl font-bold text-slate-900">
                  Sector-wise Demand
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Overview of workforce requirements across major sectors.
                </p>

              </div>

              <div className="grid gap-4 md:grid-cols-2">

                {sectorSummary.map((item) => (

                  <div
                    key={item.sector}
                    className="rounded-lg border border-slate-200 p-5"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <h3 className="font-semibold text-slate-800">
                          {item.sector}
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          Workforce requirement
                        </p>

                      </div>

                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                        {item.demand}
                      </span>

                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4">

                      <div>

                        <p className="text-xs text-slate-400">
                          Required
                        </p>

                        <p className="mt-1 text-xl font-bold text-slate-800">
                          {item.requirement}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs text-slate-400">
                          Skill Gap
                        </p>

                        <p className="mt-1 text-xl font-bold text-[#c2410c]">
                          {item.gap}
                        </p>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </section>

            {/* ================= DISTRICT DEMAND ================= */}
            <section className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">

              <div className="mb-6">

                <h2 className="text-xl font-bold text-slate-900">
                  District-wise Demand
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Compare workforce requirements across districts.
                </p>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[650px]">

                  <thead>

                    <tr className="border-b border-slate-200 text-left">

                      <th className="px-4 py-4 text-xs font-bold text-slate-400">
                        DISTRICT
                      </th>

                      <th className="px-4 py-4 text-xs font-bold text-slate-400">
                        ACTIVE SECTORS
                      </th>

                      <th className="px-4 py-4 text-xs font-bold text-slate-400">
                        WORKFORCE REQUIRED
                      </th>

                      <th className="px-4 py-4 text-xs font-bold text-slate-400">
                        WORKFORCE GAP
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {districtSummary.map((item) => (

                      <tr
                        key={item.district}
                        className="border-b border-slate-100"
                      >

                        <td className="px-4 py-5 font-semibold text-slate-700">
                          {item.district}
                        </td>

                        <td className="px-4 py-5 text-sm text-slate-600">
                          {item.sectors}
                        </td>

                        <td className="px-4 py-5 text-sm font-semibold text-slate-700">
                          {item.workforce}
                        </td>

                        <td className="px-4 py-5 font-bold text-[#c2410c]">
                          {item.gap}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </section>

            {/* ================= DEMAND INSIGHTS ================= */}
            <section className="rounded-xl border border-[#123b68]/20 bg-[#123b68] p-7 text-white shadow-sm">

              <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">

                <div>

                  <p className="text-xs font-bold tracking-wider text-white/70">
                    INDUSTRY INSIGHT
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Key Demand Observation
                  </h2>

                  <p className="mt-3 max-w-3xl text-sm leading-6 text-white/80">
                    EV, Automotive and Technology sectors show strong
                    workforce demand. The available workforce is currently
                    lower than industry requirements, creating opportunities
                    for targeted skill development and training programs.
                  </p>

                </div>

                <div className="rounded-lg bg-white px-6 py-4 text-center">

                  <p className="text-xs font-medium text-slate-500">
                    Priority
                  </p>

                  <p className="mt-1 font-bold text-[#123b68]">
                    High Demand Sectors
                  </p>

                </div>

              </div>

            </section>

          </div>
        </section>
      </div>
    </main>
  );
}