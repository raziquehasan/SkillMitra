"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

const demandData = [
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
    sector: "IT / Technology",
    role: "AI / ML Engineer",
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
    demand: "Medium",
    required: 480,
    available: 360,
    gap: 120,
  },
];

const skills = [
  {
    name: "EV Battery Technology",
    sector: "EV / Automotive",
    demand: "Very High",
    availability: "Low",
    gap: "Critical",
  },
  {
    name: "Electric Vehicle Diagnostics",
    sector: "EV / Automotive",
    demand: "High",
    availability: "Medium",
    gap: "High",
  },
  {
    name: "Industrial Automation",
    sector: "Manufacturing",
    demand: "High",
    availability: "Medium",
    gap: "High",
  },
  {
    name: "Artificial Intelligence",
    sector: "IT / Technology",
    demand: "Very High",
    availability: "Low",
    gap: "Critical",
  },
];

const emergingRoles = [
  {
    role: "EV Battery Specialist",
    sector: "EV / Automotive",
    demand: "Very High",
    future: "Very High",
  },
  {
    role: "EV Charging Technician",
    sector: "EV / Automotive",
    demand: "High",
    future: "Very High",
  },
  {
    role: "Industrial IoT Technician",
    sector: "Manufacturing",
    demand: "Medium",
    future: "High",
  },
  {
    role: "AI / ML Engineer",
    sector: "IT / Technology",
    demand: "High",
    future: "Very High",
  },
];

export default function IndustryDashboard() {
    const router = useRouter();
  const [selectedDistrict, setSelectedDistrict] = useState("Pune");
  const [selectedSector, setSelectedSector] =
    useState("EV / Automotive");

  const filteredDemand = demandData.filter(
    (item) =>
      item.district === selectedDistrict &&
      item.sector === selectedSector
  );

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
  className="text-sm hover:underline"
>
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
                className="mb-1 block rounded-md bg-[#123b68] px-4 py-3 text-sm font-semibold text-white"
              >
                Dashboard
              </a>

              <a
                href="/industry/demand"
                className="block rounded-md px-4 py-3 text-sm text-slate-600 hover:bg-slate-50"
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

          {/* ================= PAGE HEADER ================= */}
          <div className="border-b border-slate-200 bg-white px-6 py-5 lg:px-10">

            <div className="flex items-center gap-4">

              {/* SkillMitra Logo */}
              <div className="relative h-14 w-14 shrink-0">
                <Image
                  src="/skillmitra-logo.png"
                  alt="SkillMitra"
                  fill
                  priority
                  className="object-contain"
                />
              </div>

              {/* Dashboard Title */}
              <div>

                <p className="text-sm font-medium text-slate-400">
                  SkillMitra
                </p>

                <h2 className="text-2xl font-bold text-[#123b68]">
                  Industry Intelligence Dashboard
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Understand current industry requirements and future skill demand.
                </p>

              </div>
            </div>
          </div>

          <div className="space-y-7 p-6 lg:p-10">

            {/* ================= WELCOME ================= */}
            <section className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">

              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

                <div>

                  <p className="mb-2 text-sm font-semibold text-[#c2410c]">
                    INDUSTRY → GOVERNMENT
                  </p>

                  <h1 className="text-3xl font-bold text-slate-900">
                    What does the market need?
                  </h1>

                  <p className="mt-3 max-w-3xl text-base leading-7 text-slate-500">
                    Industry shares its current workforce requirements,
                    required skills, emerging job roles and future demand
                    with SkillMitra.
                  </p>

                </div>

                <div className="rounded-xl bg-[#eef5fb] px-6 py-5">

                  <p className="text-xs font-medium text-slate-500">
                    Selected District
                  </p>

                  <p className="mt-1 text-lg font-bold text-[#123b68]">
                    📍 {selectedDistrict}
                  </p>

                </div>
              </div>
            </section>

            {/* ================= KPI CARDS ================= */}
            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-xl">
                  📊
                </div>

                <p className="text-sm font-medium text-slate-500">
                  Workforce Required
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  1,950
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Current industry requirement
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-xl">
                  🧠
                </div>

                <p className="text-sm font-medium text-slate-500">
                  High-Demand Skills
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  24
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Skills currently needed
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-xl">
                  ⚠️
                </div>

                <p className="text-sm font-medium text-slate-500">
                  Critical Skill Gaps
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  8
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Skills with limited availability
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-xl">
                  🚀
                </div>

                <p className="text-sm font-medium text-slate-500">
                  Emerging Roles
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  12
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Roles expected to grow
                </p>

              </div>
            </section>

            {/* ================= DEMAND FILTER ================= */}
            <section className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">

              <div className="mb-6">

                <h2 className="text-xl font-bold text-slate-900">
                  Industry Demand
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  What workforce does the industry need?
                </p>

              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-2">

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
                    <option>Pune</option>
                    <option>Nashik</option>
                    <option>Nagpur</option>
                    <option>Mumbai</option>
                    <option>Aurangabad</option>
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
                    <option>EV / Automotive</option>
                    <option>IT / Technology</option>
                    <option>Manufacturing</option>
                  </select>

                </div>
              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[750px]">

                  <thead>
                    <tr className="border-b border-slate-200 text-left">

                      <th className="px-4 py-4 text-xs font-bold text-slate-400">
                        JOB ROLE
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

                          <td className="px-4 py-5 font-semibold text-slate-700">
                            {item.role}
                          </td>

                          <td className="px-4 py-5">

                            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                              {item.demand}
                            </span>

                          </td>

                          <td className="px-4 py-5 text-sm text-slate-600">
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
                          colSpan={5}
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

            {/* ================= REQUIRED SKILLS ================= */}
            <section className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">

              <div className="mb-6">

                <h2 className="text-xl font-bold text-slate-900">
                  Required Skills
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Which skills are actually required in the market?
                </p>

              </div>

              <div className="grid gap-4 md:grid-cols-2">

                {skills.map((skill) => (

                  <div
                    key={skill.name}
                    className="rounded-lg border border-slate-200 p-5"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <h3 className="font-semibold text-slate-800">
                          {skill.name}
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          {skill.sector}
                        </p>

                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          skill.gap === "Critical"
                            ? "bg-red-50 text-red-600"
                            : "bg-orange-50 text-orange-600"
                        }`}
                      >
                        {skill.gap} Gap
                      </span>

                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4">

                      <div>

                        <p className="text-xs text-slate-400">
                          Market Demand
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {skill.demand}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs text-slate-400">
                          Availability
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {skill.availability}
                        </p>

                      </div>

                    </div>
                  </div>

                ))}

              </div>
            </section>

            {/* ================= EMERGING ROLES ================= */}
            <section className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">

              <div className="mb-6">

                <h2 className="text-xl font-bold text-slate-900">
                  Emerging Job Roles
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Which new roles are expected to grow?
                </p>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[700px]">

                  <thead>

                    <tr className="border-b border-slate-200 text-left">

                      <th className="px-4 py-4 text-xs font-bold text-slate-400">
                        JOB ROLE
                      </th>

                      <th className="px-4 py-4 text-xs font-bold text-slate-400">
                        SECTOR
                      </th>

                      <th className="px-4 py-4 text-xs font-bold text-slate-400">
                        CURRENT DEMAND
                      </th>

                      <th className="px-4 py-4 text-xs font-bold text-slate-400">
                        FUTURE DEMAND
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {emergingRoles.map((item) => (

                      <tr
                        key={item.role}
                        className="border-b border-slate-100"
                      >

                        <td className="px-4 py-5 font-semibold text-slate-700">
                          {item.role}
                        </td>

                        <td className="px-4 py-5 text-sm text-slate-500">
                          {item.sector}
                        </td>

                        <td className="px-4 py-5 text-sm font-semibold text-slate-700">
                          {item.demand}
                        </td>

                        <td className="px-4 py-5">

                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                            {item.future}
                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>
                </table>
              </div>
            </section>

            {/* ================= FUTURE DEMAND ================= */}
            <section className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">

              <div className="mb-6">

                <h2 className="text-xl font-bold text-slate-900">
                  Future Skill Demand
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  What skills will the industry need in the coming months?
                </p>

              </div>

              <div className="grid gap-5 md:grid-cols-3">

                <div className="rounded-xl bg-slate-50 p-6">

                  <p className="text-sm font-semibold text-[#123b68]">
                    Next 3 Months
                  </p>

                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    18 Skills
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Immediate workforce requirements
                  </p>

                </div>

                <div className="rounded-xl bg-slate-50 p-6">

                  <p className="text-sm font-semibold text-[#123b68]">
                    Next 6 Months
                  </p>

                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    27 Skills
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Expected increase in skill demand
                  </p>

                </div>

                <div className="rounded-xl bg-slate-50 p-6">

                  <p className="text-sm font-semibold text-[#123b68]">
                    Next 1 Year
                  </p>

                  <p className="mt-3 text-2xl font-bold text-slate-900">
                    41 Skills
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Long-term industry requirements
                  </p>

                </div>

              </div>
            </section>

            {/* ================= GOVERNMENT INPUT ================= */}
            <section className="rounded-xl border border-[#123b68]/20 bg-[#123b68] p-7 text-white shadow-sm">

              <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">

                <div>

                  <p className="text-xs font-bold tracking-wider text-white/70">
                    INDUSTRY → GOVERNMENT
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Industry Requirements
                  </h2>

                  <p className="mt-3 max-w-3xl text-sm leading-6 text-white/80">
                    Industry data collected through SkillMitra can help the
                    Government identify skill gaps, plan training programs
                    and understand which skills will be required in the
                    future.
                  </p>

                </div>

                <div className="rounded-lg bg-white px-6 py-4 text-center">

                  <p className="text-xs font-medium text-slate-500">
                    Government Input
                  </p>

                  <p className="mt-1 font-bold text-[#123b68]">
                    Training Requirements
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