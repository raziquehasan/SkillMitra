
"use client";

import Image from "next/image";
import EmployerSidebar from "@/components/employer/EmployerSidebar";

const recommendedSkills = [
  {
    skill: "EV Battery Technology",
    role: "EV Technician",
    demand: 92,
    supply: 38,
    priority: "Critical",
    reason: "High industry demand with limited skilled candidate supply.",
  },
  {
    skill: "Data Analytics",
    role: "Data Analyst",
    demand: 84,
    supply: 56,
    priority: "High",
    reason: "Increasing demand across multiple industry sectors.",
  },
  {
    skill: "Cloud Computing",
    role: "Software Developer",
    demand: 79,
    supply: 61,
    priority: "Medium",
    reason: "Growing adoption of cloud-based technology.",
  },
  {
    skill: "Advanced Manufacturing",
    role: "Manufacturing Technician",
    demand: 76,
    supply: 42,
    priority: "High",
    reason:
      "Manufacturing employers report a shortage of specialised talent.",
  },
];

export default function RecommendedSkillsPage() {
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

      {/* PAGE AREA */}
      <div className="min-h-screen pt-[76px]">

        <EmployerSidebar />

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
                  Recommended Skills Dashboard
                </p>
              </div>

            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">

            {/* PAGE HEADER */}
            <div className="mb-7">

              <p className="text-xs font-medium text-slate-400">
                Employer Portal / Skill Intelligence
              </p>

              <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">

                <div>
                  <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                    Recommended Skills
                  </h1>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
                    Discover skills that can help employers address hiring
                    gaps and respond to changing labour-market demand.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">

                  <p className="text-xs text-slate-400">
                    Recommendation Area
                  </p>

                  <p className="mt-1 font-semibold text-[#123b68]">
                    Maharashtra
                  </p>

                </div>

              </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <SummaryCard
                title="Recommended Skills"
                value="4"
                description="Skills identified for employers"
                icon="★"
              />

              <SummaryCard
                title="High Priority"
                value="3"
                description="Skills needing immediate attention"
                icon="!"
              />

              <SummaryCard
                title="Growing Demand"
                value="4"
                description="Skills showing strong demand"
                icon="↗"
              />

              <SummaryCard
                title="Skill Gap"
                value="38%"
                description="Average supply-demand gap"
                icon="%"
              />

            </div>

            {/* FILTERS */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">

                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                    Job Role
                  </label>

                  <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]">
                    <option>All Job Roles</option>
                    <option>EV Technician</option>
                    <option>Data Analyst</option>
                    <option>Software Developer</option>
                    <option>Manufacturing Technician</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                    Sector
                  </label>

                  <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]">
                    <option>All Sectors</option>
                    <option>EV / Automotive</option>
                    <option>IT & Technology</option>
                    <option>Manufacturing</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                    Priority
                  </label>

                  <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]">
                    <option>All Priorities</option>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                  </select>
                </div>

                <button className="rounded-lg bg-[#123b68] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0e3155]">
                  Apply Filters
                </button>

              </div>
            </div>

            {/* RECOMMENDED SKILLS */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Skills Recommended for Hiring
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Recommendations are based on demand, candidate supply and
                  identified skill gaps.
                </p>
              </div>

              <div className="space-y-4">

                {recommendedSkills.map((item) => (
                  <SkillRecommendation
                    key={item.skill}
                    skill={item.skill}
                    role={item.role}
                    demand={item.demand}
                    supply={item.supply}
                    priority={item.priority}
                    reason={item.reason}
                  />
                ))}

              </div>
            </div>

            {/* WHY RECOMMENDED */}
            <div className="mt-6 grid gap-6 xl:grid-cols-2">

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                <h2 className="text-lg font-bold text-slate-900">
                  Why These Skills?
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Skill recommendations consider the current labour-market
                  situation.
                </p>

                <div className="mt-5 space-y-4">

                  <ReasonRow
                    title="High Employer Demand"
                    description="Skills frequently required in current job openings."
                  />

                  <ReasonRow
                    title="Limited Candidate Supply"
                    description="Fewer candidates are available with the required skills."
                  />

                  <ReasonRow
                    title="Emerging Industry Need"
                    description="Skills associated with changing technology and industry requirements."
                  />

                  <ReasonRow
                    title="Identified Skill Gap"
                    description="Skills where demand is significantly higher than supply."
                  />

                </div>
              </div>

              {/* SKILL PRIORITY */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                <h2 className="text-lg font-bold text-slate-900">
                  Priority Overview
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Recommended action based on skill priority.
                </p>

                <div className="mt-6 space-y-5">

                  <PriorityBar
                    label="Critical"
                    value={25}
                    description="Immediate recruitment or training attention"
                  />

                  <PriorityBar
                    label="High"
                    value={75}
                    description="Strong recommendation for hiring and upskilling"
                  />

                  <PriorityBar
                    label="Medium"
                    value={50}
                    description="Monitor demand and candidate availability"
                  />

                </div>
              </div>
            </div>

            {/* TRAINING ACTION */}
            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-6">

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                  <h2 className="font-bold text-[#123b68]">
                    Turn Skill Recommendations Into Action
                  </h2>

                  <p className="mt-1 max-w-3xl text-sm leading-6 text-blue-800">
                    Employers can use recommended skills to improve job
                    requirements, identify suitable candidates and work with
                    training providers to address skill shortages.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">

                  <button className="rounded-lg bg-[#123b68] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0e3155]">
                    Find Training
                  </button>

                  <button className="rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#123b68] hover:bg-blue-50">
                    View Candidates
                  </button>

                </div>

              </div>
            </div>

            {/* DATA NOTE */}
            <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-4">

              <p className="text-xs leading-5 text-slate-500">

                <span className="font-semibold text-slate-700">
                  Intelligence data:
                </span>{" "}
                Recommended skills are intended to be populated from
                SkillMitra labour-market intelligence, job requirements and
                candidate skill-supply data when the corresponding API data is
                available.

              </p>

            </div>

          </div>
        </section>
      </div>
    </main>
  );
}

/* ============================================================
   REUSABLE COMPONENTS
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

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">
          {icon}
        </div>

        <span className="text-[10px] font-medium text-slate-400">
          Skill Intelligence
        </span>

      </div>

      <p className="mt-4 text-3xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-700">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}

function SkillRecommendation({
  skill,
  role,
  demand,
  supply,
  priority,
  reason,
}: {
  skill: string;
  role: string;
  demand: number;
  supply: number;
  priority: string;
  reason: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-5 transition hover:border-blue-200 hover:shadow-sm">

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

        <div className="min-w-[220px]">

          <div className="flex items-center gap-2">

            <h3 className="font-semibold text-slate-900">
              {skill}
            </h3>

            <PriorityBadge priority={priority} />

          </div>

          <p className="mt-1 text-xs text-slate-500">
            Recommended for:{" "}
            <span className="font-medium text-slate-700">
              {role}
            </span>
          </p>

        </div>

        <div className="flex-1 lg:max-w-[430px]">

          <div className="mb-2 flex items-center justify-between text-xs">

            <span className="text-slate-500">
              Demand
            </span>

            <span className="font-semibold text-[#123b68]">
              {demand}%
            </span>

          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{
                width: `${demand}%`,
              }}
            />
          </div>

          <div className="mb-2 mt-4 flex items-center justify-between text-xs">

            <span className="text-slate-500">
              Candidate Supply
            </span>

            <span className="font-semibold text-emerald-600">
              {supply}%
            </span>

          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{
                width: `${supply}%`,
              }}
            />
          </div>

        </div>

        <div className="lg:w-64">

          <p className="text-xs font-semibold text-slate-500">
            Recommendation Reason
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-600">
            {reason}
          </p>

        </div>

        <button className="rounded-lg border border-blue-200 px-4 py-2.5 text-xs font-semibold text-[#123b68] hover:bg-blue-50">
          View Details
        </button>

      </div>

    </div>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: string;
}) {
  const classes =
    priority === "Critical"
      ? "bg-red-50 text-red-700"
      : priority === "High"
        ? "bg-orange-50 text-orange-700"
        : "bg-yellow-50 text-yellow-700";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${classes}`}
    >
      {priority}
    </span>
  );
}

function ReasonRow({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">

      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
        ✓
      </div>

      <div>

        <p className="text-sm font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>

      </div>

    </div>
  );
}

function PriorityBar({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div>

      <div className="flex items-center justify-between">

        <span className="text-sm font-semibold text-slate-700">
          {label}
        </span>

        <span className="text-xs font-semibold text-slate-500">
          {value}%
        </span>

      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{
            width: `${value}%`,
          }}
        />
      </div>

      <p className="mt-1 text-[11px] text-slate-400">
        {description}
      </p>

    </div>
  );
}

