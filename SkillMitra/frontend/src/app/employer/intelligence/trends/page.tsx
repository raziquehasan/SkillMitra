"use client";

import Image from "next/image";
import EmployerSidebar from "@/components/employer/EmployerSidebar";

const trends = [
  {
    skill: "Electric Vehicle Technology",
    sector: "EV / Automotive",
    trend: "Increasing",
    description:
      "Growing relevance of electric vehicle technologies in the automotive sector.",
  },
  {
    skill: "Software Development",
    sector: "IT & Software",
    trend: "High",
    description:
      "Software development skills continue to remain important across technology-driven industries.",
  },
  {
    skill: "Data Analysis",
    sector: "IT & Software",
    trend: "Increasing",
    description:
      "Data analysis capabilities are becoming increasingly important for business decision-making.",
  },
  {
    skill: "UI/UX Design",
    sector: "IT & Software",
    trend: "Growing",
    description:
      "Digital products are increasing demand for user experience and interface design skills.",
  },
];

export default function SkillTrendsPage() {
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
            SkillMitra | Employer Intelligence Portal
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
                  Skill Trends Dashboard
                </p>
              </div>

            </div>
          </div>

          {/* PAGE CONTENT */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">

            {/* PAGE HEADER */}
            <div className="mb-7">

              <p className="text-xs font-semibold text-slate-400">
                SkillMitra / Labour Market Intelligence
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
                Skill Trends
              </h1>

              <p className="mt-2 text-sm text-slate-500 md:text-base">
                Track how skill demand is changing across
                industries and job roles.
              </p>

            </div>

            {/* SUMMARY CARDS */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  Increasing Skills
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  —
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Skills showing increasing demand
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  Stable Skills
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  —
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Skills with consistent demand
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  Emerging Skills
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  —
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  New skills gaining industry attention
                </p>
              </div>

            </div>

            {/* FILTERS */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <h2 className="text-lg font-bold text-slate-900">
                Analyse Skill Trends
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-3">

                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                    District
                  </span>

                  <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#123b68]">
                    <option>All Districts</option>
                    <option>Pune</option>
                    <option>Mumbai</option>
                    <option>Nashik</option>
                    <option>Nagpur</option>
                  </select>
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                    Industry Sector
                  </span>

                  <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#123b68]">
                    <option>All Sectors</option>
                    <option>EV / Automotive</option>
                    <option>IT & Software</option>
                    <option>Manufacturing</option>
                    <option>Healthcare</option>
                  </select>
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                    Time Period
                  </span>

                  <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#123b68]">
                    <option>Last 6 Months</option>
                    <option>Last 12 Months</option>
                    <option>Last 2 Years</option>
                  </select>
                </label>

              </div>
            </div>

            {/* TREND OVERVIEW */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Skill Demand Trend
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Indicative trend view based on labour-market
                  demand.
                </p>
              </div>

              <div className="mt-6 flex h-56 items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5">

                {[35, 45, 40, 55, 62, 72, 68, 82, 88, 94].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="flex flex-1 flex-col items-center justify-end gap-2"
                    >
                      <div
                        className="w-full max-w-12 rounded-t-lg bg-[#2563eb]"
                        style={{
                          height: `${height}%`,
                        }}
                      />

                      <span className="text-[10px] text-slate-400">
                        {index + 1}
                      </span>
                    </div>
                  )
                )}

              </div>

              <div className="mt-4 flex items-center justify-between">

                <div>
                  <p className="text-xs text-slate-500">
                    Trend direction
                  </p>

                  <p className="mt-1 font-semibold text-green-600">
                    ↗ Increasing
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-500">
                    Current period
                  </p>

                  <p className="mt-1 font-semibold text-[#123b68]">
                    August 2026
                  </p>
                </div>

              </div>
            </div>

            {/* TRENDING SKILLS */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Trending Skills
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Skills showing notable demand movement.
                </p>
              </div>

              <div className="mt-5 space-y-3">

                {trends.map((item) => (
                  <div
                    key={item.skill}
                    className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-slate-50"
                  >

                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                      <div>

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="font-semibold text-slate-900">
                            {item.skill}
                          </h3>

                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                            {item.sector}
                          </span>

                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          {item.description}
                        </p>

                      </div>

                      <span className="whitespace-nowrap rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        ↗ {item.trend}
                      </span>

                    </div>

                  </div>
                ))}

              </div>
            </div>

            {/* INTELLIGENCE NOTICE */}
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">

              <h2 className="font-semibold text-[#123b68]">
                Labour-Market Trend Intelligence
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Skill-trend analytics will be connected to
                SkillMitra&apos;s backend intelligence services when
                the required labour-market data is available.
              </p>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}