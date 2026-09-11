"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

const trendsData = [
  {
    skill: "Artificial Intelligence",
    sector: "IT / Technology",
    currentDemand: "Very High",
    growth: "Very High",
    trend: "Rising",
    adoption: 88,
  },
  {
    skill: "Machine Learning",
    sector: "IT / Technology",
    currentDemand: "High",
    growth: "Very High",
    trend: "Rising",
    adoption: 82,
  },
  {
    skill: "EV Battery Technology",
    sector: "EV / Automotive",
    currentDemand: "Very High",
    growth: "Very High",
    trend: "Rising",
    adoption: 86,
  },
  {
    skill: "Industrial IoT",
    sector: "Manufacturing",
    currentDemand: "High",
    growth: "High",
    trend: "Rising",
    adoption: 74,
  },
  {
    skill: "Cloud Computing",
    sector: "IT / Technology",
    currentDemand: "High",
    growth: "High",
    trend: "Growing",
    adoption: 78,
  },
  {
    skill: "Robotics & Automation",
    sector: "Manufacturing",
    currentDemand: "High",
    growth: "Very High",
    trend: "Rising",
    adoption: 80,
  },
];

const sectorTrends = [
  {
    sector: "EV / Automotive",
    topSkill: "EV Battery Technology",
    growth: "Very High",
    outlook: "Strong growth expected",
  },
  {
    sector: "IT / Technology",
    topSkill: "Artificial Intelligence",
    growth: "Very High",
    outlook: "Rapid technology adoption",
  },
  {
    sector: "Manufacturing",
    topSkill: "Robotics & Automation",
    growth: "High",
    outlook: "Automation-driven demand",
  },
];

const futureSkills = [
  {
    skill: "Generative AI",
    reason: "Rapid adoption of AI-powered business applications",
    horizon: "0–2 Years",
  },
  {
    skill: "Battery Management Systems",
    reason: "Growing EV and battery manufacturing ecosystem",
    horizon: "0–2 Years",
  },
  {
    skill: "Industrial IoT",
    reason: "Connected machines and smart manufacturing",
    horizon: "2–5 Years",
  },
  {
    skill: "Advanced Robotics",
    reason: "Increasing industrial automation requirements",
    horizon: "2–5 Years",
  },
];

export default function SkillTrendsPage() {
     const router = useRouter();
  const [selectedSector, setSelectedSector] = useState("All Sectors");

  const filteredTrends =
    selectedSector === "All Sectors"
      ? trendsData
      : trendsData.filter((item) => item.sector === selectedSector);

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
                  className="flex items-center rounded-lg bg-[#123b68] px-3 py-2.5 text-sm font-medium text-white"
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
                Which skills are growing fastest?
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Skill trends help identify technologies and capabilities that
                are becoming increasingly important across industries. This
                information helps government and training institutes prepare
                workers for future employment opportunities.
              </p>

            </section>

            {/* ================= KPI CARDS ================= */}
            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm text-slate-500">
                  Fast-Growing Skills
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  14
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Skills showing strong growth
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm text-slate-500">
                  Very High Growth
                </p>

                <p className="mt-2 text-3xl font-bold text-[#c2410c]">
                  7
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Emerging technology skills
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm text-slate-500">
                  Emerging Technologies
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  9
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Future-focused skill areas
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm text-slate-500">
                  Future Priority
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  High
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Government preparation required
                </p>

              </div>

            </section>

            {/* ================= SECTOR FILTER ================= */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

                <div>

                  <h2 className="text-lg font-bold text-[#123b68]">
                    Skill Trends by Sector
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Select a sector to view its most important growing skills.
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

            {/* ================= SKILL TRENDS TABLE ================= */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 px-6 py-5">

                <h2 className="text-lg font-bold text-[#123b68]">
                  Emerging Skill Trends
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Skills showing increasing demand across major industry
                  sectors.
                </p>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[900px] text-left text-sm">

                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">

                    <tr>

                      <th className="px-6 py-4">
                        Skill
                      </th>

                      <th className="px-6 py-4">
                        Sector
                      </th>

                      <th className="px-6 py-4">
                        Current Demand
                      </th>

                      <th className="px-6 py-4">
                        Growth
                      </th>

                      <th className="px-6 py-4">
                        Trend
                      </th>

                      <th className="px-6 py-4">
                        Adoption
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredTrends.map((item) => (

                      <tr
                        key={item.skill}
                        className="hover:bg-slate-50"
                      >

                        <td className="px-6 py-4">

                          <p className="font-semibold text-slate-800">
                            {item.skill}
                          </p>

                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {item.sector}
                        </td>

                        <td className="px-6 py-4">

                          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#c2410c]">
                            {item.currentDemand}
                          </span>

                        </td>

                        <td className="px-6 py-4">

                          <span className="font-semibold text-[#123b68]">
                            {item.growth}
                          </span>

                        </td>

                        <td className="px-6 py-4">

                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                            ↑ {item.trend}
                          </span>

                        </td>

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">

                              <div
                                className="h-full rounded-full bg-[#123b68]"
                                style={{
                                  width: `${item.adoption}%`,
                                }}
                              />

                            </div>

                            <span className="text-xs font-semibold text-slate-600">
                              {item.adoption}%
                            </span>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </section>

            {/* ================= SECTOR TREND SUMMARY ================= */}
            <section>

              <div className="mb-4">

                <h2 className="text-xl font-bold text-[#123b68]">
                  Sector-wise Skill Trends
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Top growing skill areas across major industry sectors.
                </p>

              </div>

              <div className="grid gap-5 lg:grid-cols-3">

                {sectorTrends.map((item) => (

                  <div
                    key={item.sector}
                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                  >

                    <p className="text-sm font-semibold text-[#c2410c]">
                      {item.sector}
                    </p>

                    <h3 className="mt-3 text-lg font-bold text-[#123b68]">
                      {item.topSkill}
                    </h3>

                    <div className="mt-5 space-y-3">

                      <div className="flex items-center justify-between text-sm">

                        <span className="text-slate-500">
                          Growth
                        </span>

                        <span className="font-semibold text-slate-700">
                          {item.growth}
                        </span>

                      </div>

                      <div className="flex items-center justify-between text-sm">

                        <span className="text-slate-500">
                          Market Outlook
                        </span>

                        <span className="font-semibold text-slate-700">
                          {item.outlook}
                        </span>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </section>

            {/* ================= FUTURE SKILLS ================= */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-5">

                <h2 className="text-lg font-bold text-[#123b68]">
                  Future Skill Pipeline
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Skills expected to become increasingly important in the
                  coming years.
                </p>

              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                {futureSkills.map((item) => (

                  <div
                    key={item.skill}
                    className="rounded-lg border border-slate-200 p-5"
                  >

                    <p className="text-xs font-bold uppercase tracking-wider text-[#c2410c]">
                      {item.horizon}
                    </p>

                    <h3 className="mt-2 font-semibold text-slate-800">
                      {item.skill}
                    </h3>

                    <p className="mt-3 text-sm leading-5 text-slate-500">
                      {item.reason}
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
                Future Skill Development Input
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100">
                Skill trend information can help government departments
                identify future-ready technologies, update training curricula,
                create new skill programs and prepare candidates for emerging
                employment opportunities.
              </p>

            </section>

          </div>

        </section>

      </div>

    </main>
  );
}