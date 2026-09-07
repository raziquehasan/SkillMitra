"use client";

import Image from "next/image";
import EmployerSidebar from "@/components/employer/EmployerSidebar";

export default function DemandTrendsPage() {
  const trends = [
    {
      skill: "Electric Vehicle Technology",
      current: "High",
      change: "+18%",
      status: "Growing",
    },
    {
      skill: "Data Analysis",
      current: "High",
      change: "+14%",
      status: "Growing",
    },
    {
      skill: "Software Development",
      current: "High",
      change: "+11%",
      status: "Growing",
    },
    {
      skill: "UI/UX Design",
      current: "Medium",
      change: "+7%",
      status: "Stable",
    },
    {
      skill: "Cloud Computing",
      current: "Medium",
      change: "+9%",
      status: "Growing",
    },
  ];

  const months = [
    { month: "Mar", value: 42 },
    { month: "Apr", value: 50 },
    { month: "May", value: 47 },
    { month: "Jun", value: 61 },
    { month: "Jul", value: 70 },
    { month: "Aug", value: 82 },
  ];

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-slate-800">

      {/* GOVERNMENT HEADER */}
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

      {/* PAGE AREA */}
      <div className="min-h-screen pt-[76px]">

        {/* SIDEBAR */}
        <EmployerSidebar />

        {/* MAIN AREA */}
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
                  Demand Trends Dashboard
                </p>
              </div>

            </div>
          </div>

          {/* CONTENT */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">

            {/* PAGE HEADER */}
            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#123b68]">
                Insights
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
                Demand Trends
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Track changes in workforce and skill demand to understand
                which capabilities are becoming important for employers.
              </p>
            </div>

            {/* FILTER BAR */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Demand Trend Analysis
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Select the period and area you want to analyse.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">

                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-slate-500">
                      District
                    </span>

                    <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#123b68]">
                      <option>Pune</option>
                      <option>Mumbai</option>
                      <option>Nashik</option>
                      <option>Nagpur</option>
                      <option>Aurangabad</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-slate-500">
                      Sector
                    </span>

                    <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#123b68]">
                      <option>All Sectors</option>
                      <option>EV / Automotive</option>
                      <option>IT & Software</option>
                      <option>Manufacturing</option>
                      <option>Healthcare</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-slate-500">
                      Period
                    </span>

                    <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#123b68]">
                      <option>Last 6 Months</option>
                      <option>Last 12 Months</option>
                      <option>Last 3 Months</option>
                    </select>
                  </label>

                </div>
              </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <SummaryCard
                title="Overall Demand"
                value="High"
                description="Current workforce demand"
                icon="↗"
              />

              <SummaryCard
                title="Growing Skills"
                value="18"
                description="Skills showing upward demand"
                icon="↑"
              />

              <SummaryCard
                title="Emerging Roles"
                value="12"
                description="Roles gaining industry demand"
                icon="◉"
              />

              <SummaryCard
                title="Demand Change"
                value="+12%"
                description="Compared with previous period"
                icon="%"
              />

            </div>

            {/* MAIN TREND CHART */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Workforce Demand Trend
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Workforce demand movement for the selected period
                  </p>
                </div>

                <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Last 6 Months
                </span>

              </div>

              {/* CHART */}
              <div className="mt-7 rounded-xl border border-slate-100 bg-slate-50 p-5">

                <div className="flex h-64 items-end gap-3 md:gap-6">

                  {months.map((item) => (
                    <div
                      key={item.month}
                      className="flex h-full flex-1 flex-col justify-end"
                    >

                      <div className="mb-2 text-center text-xs font-semibold text-slate-600">
                        {item.value}
                      </div>

                      <div
                        className="w-full rounded-t-lg bg-[#2563eb] transition-all hover:bg-[#123b68]"
                        style={{ height: `${item.value * 2.2}px` }}
                      />

                      <div className="mt-2 text-center text-xs text-slate-400">
                        {item.month}
                      </div>

                    </div>
                  ))}

                </div>
              </div>
            </div>

            {/* TRENDING SKILLS */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Trending Skills
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Skills showing significant movement in employer demand.
                </p>
              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[650px] text-left text-sm">

                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-slate-500">
                      <th className="pb-3 font-semibold">
                        Skill
                      </th>

                      <th className="pb-3 font-semibold">
                        Current Demand
                      </th>

                      <th className="pb-3 font-semibold">
                        Change
                      </th>

                      <th className="pb-3 font-semibold">
                        Trend
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {trends.map((item) => (
                      <tr
                        key={item.skill}
                        className="border-b border-slate-100 last:border-0"
                      >

                        <td className="py-4 font-semibold text-slate-800">
                          {item.skill}
                        </td>

                        <td className="py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              item.current === "High"
                                ? "bg-green-50 text-green-700"
                                : "bg-yellow-50 text-yellow-700"
                            }`}
                          >
                            {item.current}
                          </span>
                        </td>

                        <td className="py-4 font-semibold text-green-600">
                          {item.change}
                        </td>

                        <td className="py-4">
                          <span className="flex items-center gap-2 text-xs font-medium text-slate-600">

                            <span
                              className={`h-2 w-2 rounded-full ${
                                item.status === "Growing"
                                  ? "bg-green-500"
                                  : "bg-yellow-500"
                              }`}
                            />

                            {item.status}

                          </span>
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>
              </div>
            </div>

            {/* DEMAND INSIGHTS */}
            <div className="mt-6 grid gap-6 xl:grid-cols-2">

              {/* KEY INSIGHTS */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

                <h2 className="text-lg font-bold text-slate-900">
                  Key Demand Insights
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Important observations from workforce demand trends.
                </p>

                <div className="mt-5 space-y-3">

                  <InsightRow
                    number="01"
                    text="Technical and digital skills continue to show strong employer demand."
                  />

                  <InsightRow
                    number="02"
                    text="EV and automotive-related skills are showing increasing demand."
                  />

                  <InsightRow
                    number="03"
                    text="Data and software capabilities remain important across sectors."
                  />

                  <InsightRow
                    number="04"
                    text="Employers can use these trends to plan future hiring and training."
                  />

                </div>
              </div>

              {/* WORKFORCE PLANNING */}
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-5 shadow-sm md:p-6">

                <p className="text-sm font-bold text-orange-800">
                  Workforce Planning
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  Use demand trends for hiring decisions
                </h2>

                <p className="mt-2 text-sm leading-6 text-orange-700">
                  Identify growing skills early and align recruitment,
                  candidate matching and training requirements with changing
                  industry demand.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">

                  <PlanningCard
                    title="Hiring"
                    description="Prioritise skills with increasing demand."
                  />

                  <PlanningCard
                    title="Training"
                    description="Identify skills that need development."
                  />

                </div>
              </div>

            </div>

            {/* QUICK ACTIONS */}
            <div className="mt-6 grid gap-4 md:grid-cols-3">

              <ActionCard
                title="View Skill Gaps"
                description="Analyse skills where demand exceeds candidate supply."
                href="/employer/skills/gaps"
              />

              <ActionCard
                title="Candidate Supply"
                description="Understand available talent and skill distribution."
                href="/employer/skills/supply"
              />

              <ActionCard
                title="Recommended Skills"
                description="Explore skills recommended for your hiring needs."
                href="/employer/skills/recommended"
              />

            </div>

          </div>
        </section>
      </div>
    </main>
  );
}

/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <p className="text-xs font-semibold text-slate-500">
          {title}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">
          {icon}
        </div>

      </div>

      <p className="mt-4 text-2xl font-bold text-[#123b68]">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}

/* ============================================================
   INSIGHT ROW
============================================================ */

function InsightRow({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">

      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#123b68] text-[10px] font-bold text-white">
        {number}
      </div>

      <p className="text-sm leading-5 text-slate-600">
        {text}
      </p>

    </div>
  );
}

/* ============================================================
   PLANNING CARD
============================================================ */

function PlanningCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-orange-200 bg-white p-4">

      <p className="font-semibold text-slate-900">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>

    </div>
  );
}

/* ============================================================
   ACTION CARD
============================================================ */

function ActionCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >

      <h3 className="font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>

      <p className="mt-4 text-xs font-semibold text-blue-600">
        Open section →
      </p>

    </a>
  );
}