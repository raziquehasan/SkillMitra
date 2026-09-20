
"use client";

import { useState } from "react";
import Image from "next/image";
import EmployerSidebar from "@/components/employer/EmployerSidebar";

const insights = [
  {
    title: "Hiring Overview",
    value: "—",
    description: "Current hiring activity across your organisation",
    icon: "▣",
  },
  {
    title: "Skill Demand",
    value: "—",
    description: "Skills currently required for your hiring needs",
    icon: "◆",
  },
  {
    title: "Skill Gaps",
    value: "—",
    description: "Critical gaps identified in your hiring pipeline",
    icon: "△",
  },
  {
    title: "Candidate Supply",
    value: "—",
    description: "Available talent matching your requirements",
    icon: "◉",
  },
];

const demandData = [
  { skill: "Technical Skills", demand: 82 },
  { skill: "Digital Skills", demand: 68 },
  { skill: "Communication", demand: 56 },
  { skill: "Industry Skills", demand: 74 },
];

const observations = [
  "Industry demand should be compared with available candidate skills.",
  "Critical skill gaps can indicate areas where additional training may be required.",
  "Hiring insights can help employers plan future recruitment requirements.",
];

export default function EmployerInsightsPage() {
  const [district, setDistrict] = useState("Pune");
  const [sector, setSector] = useState("All Sectors");
  const [period, setPeriod] = useState("Last 6 Months");

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
            SkillMitra | Industry Portal
          </div>
        </div>
      </header>

      {/* ORANGE LINE */}
      <div className="fixed left-0 right-0 top-[72px] z-50 h-1 bg-[#c2410c]" />

      <div className="min-h-screen pt-[76px]">
        {/* SHARED SIDEBAR */}
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
                  Employer Insights Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">
            {/* PAGE INTRO */}
            <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  SkillMitra / Insights
                </p>

                <h1 className="mt-1 text-2xl font-bold text-slate-900">
                  Employer Insights
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Understand hiring activity, workforce demand and emerging
                  skill requirements.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
                <p className="text-[11px] text-slate-400">
                  Intelligence View
                </p>

                <p className="text-sm font-semibold text-[#123b68]">
                  Employer
                </p>
              </div>
            </div>

            {/* FILTERS */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="font-bold text-slate-900">
                  Insight Filters
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Select the area you want to analyse.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Filter
                  label="District"
                  value={district}
                  options={["Pune", "Mumbai", "Nagpur", "Nashik"]}
                  onChange={setDistrict}
                />

                <Filter
                  label="Sector"
                  value={sector}
                  options={[
                    "All Sectors",
                    "EV / Automotive",
                    "IT & Software",
                    "Manufacturing",
                    "Healthcare",
                  ]}
                  onChange={setSector}
                />

                <Filter
                  label="Period"
                  value={period}
                  options={[
                    "Last 3 Months",
                    "Last 6 Months",
                    "Last 12 Months",
                  ]}
                  onChange={setPeriod}
                />
              </div>
            </div>

            {/* KPI */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {insights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-lg font-bold text-[#123b68]">
                      {item.icon}
                    </div>

                    <p className="text-sm font-semibold text-slate-600">
                      {item.title}
                    </p>
                  </div>

                  <p className="mt-5 text-3xl font-bold text-[#123b68]">
                    {item.value}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* MAIN INSIGHT AREA */}
            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              {/* DEMAND */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Workforce Demand
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Current skill demand for {district}
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {sector}
                  </span>
                </div>

                <div className="mt-6 space-y-5">
                  {demandData.map((item) => (
                    <div key={item.skill}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">
                          {item.skill}
                        </span>

                        <span className="text-xs font-semibold text-slate-500">
                          {item.demand}%
                        </span>
                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#123b68]"
                          style={{ width: `${item.demand}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-[#123b68]">
                    Demand Insight
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Skill demand can be monitored against candidate supply to
                    identify recruitment and training priorities.
                  </p>
                </div>
              </div>

              {/* HIRING INSIGHT */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Hiring Intelligence
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Key observations for employer workforce planning
                </p>

                <div className="mt-5 space-y-3">
                  {observations.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-3 rounded-lg border border-slate-200 p-4"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-[#123b68]">
                        {index + 1}
                      </div>

                      <p className="text-sm leading-6 text-slate-600">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <p className="text-sm font-semibold text-orange-800">
                    Planning Priority
                  </p>

                  <p className="mt-1 text-xs leading-5 text-orange-700">
                    Use identified skill gaps and demand signals to support
                    recruitment and training decisions.
                  </p>
                </div>
              </div>
            </div>

            {/* WORKFORCE DEMAND TREND */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Workforce Demand Trend
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Skill and workforce demand movement over time
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {period}
                </span>
              </div>

              {/* CHART */}
              <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Demand Index
                    </p>

                    <p className="text-2xl font-bold text-[#123b68]">
                      84%
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400">
                      Current period
                    </p>

                    <p className="text-sm font-semibold text-green-600">
                      ↑ Increasing
                    </p>
                  </div>
                </div>

                {/* GRID + BARS */}
                <div className="relative h-64">
                  {/* Horizontal lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    <div className="border-t border-slate-200" />
                    <div className="border-t border-slate-200" />
                    <div className="border-t border-slate-200" />
                    <div className="border-t border-slate-200" />
                    <div className="border-t border-slate-200" />
                  </div>

                  {/* Bars */}
                  <div className="absolute inset-0 flex items-end justify-between gap-3 px-2">
                    {[
                      { month: "Jan", value: 35 },
                      { month: "Feb", value: 48 },
                      { month: "Mar", value: 43 },
                      { month: "Apr", value: 58 },
                      { month: "May", value: 67 },
                      { month: "Jun", value: 61 },
                      { month: "Jul", value: 76 },
                      { month: "Aug", value: 84 },
                    ].map((item) => (
                      <div
                        key={item.month}
                        className="flex h-full flex-1 flex-col items-center justify-end"
                      >
                        {/* Value */}
                        <span className="mb-2 text-[10px] font-semibold text-slate-500">
                          {item.value}%
                        </span>

                        {/* Bar */}
                        <div
                          className="w-full max-w-12 rounded-t-md bg-[#123b68] transition-all hover:bg-[#2563eb]"
                          style={{
                            height: `${item.value}%`,
                          }}
                        />

                        {/* Month */}
                        <span className="mt-2 text-[10px] font-medium text-slate-400">
                          {item.month}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* INSIGHT */}
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs text-slate-400">
                    Starting Demand
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    35%
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    January
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs text-slate-400">
                    Current Demand
                  </p>

                  <p className="mt-1 text-xl font-bold text-[#123b68]">
                    84%
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    August
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs text-slate-400">
                    Overall Movement
                  </p>

                  <p className="mt-1 text-xl font-bold text-green-600">
                    +49%
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Demand increased
                  </p>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <InsightAction
                title="View Skill Gaps"
                description="Analyse skills where employer demand exceeds candidate supply."
                href="/employer/skills/gaps"
              />

              <InsightAction
                title="View Candidate Supply"
                description="Understand available talent and their skill distribution."
                href="/employer/skills/supply"
              />

              <InsightAction
                title="View Demand Trends"
                description="Explore changing skill and workforce demand."
                href="/employer/insights/trends"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ============================================================
   FILTER
============================================================ */

function Filter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-500">
        {label}
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ============================================================
   INSIGHT ACTION
============================================================ */

function InsightAction({
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
      className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <h3 className="font-semibold text-slate-900 group-hover:text-[#123b68]">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>

      <p className="mt-4 text-xs font-semibold text-blue-600">
        Explore →
      </p>
    </a>
  );
}


