
"use client";

import Image from "next/image";
import EmployerSidebar from "@/components/employer/EmployerSidebar";

const requirements = [
  {
    skill: "Advanced Data Analytics",
    sector: "IT & Technology",
    demand: "Very High",
    candidates: 38,
    required: 95,
    gap: 57,
    priority: "Critical",
  },
  {
    skill: "Electric Vehicle Technology",
    sector: "Automotive",
    demand: "High",
    candidates: 42,
    required: 82,
    gap: 40,
    priority: "High",
  },
  {
    skill: "Industrial Automation",
    sector: "Manufacturing",
    demand: "High",
    candidates: 51,
    required: 76,
    gap: 25,
    priority: "High",
  },
  {
    skill: "Cloud Computing",
    sector: "IT & Technology",
    demand: "Medium",
    candidates: 64,
    required: 78,
    gap: 14,
    priority: "Medium",
  },
];

export default function TrainingRequirementsPage() {
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
                  Training Requirements Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">
            {/* SUMMARY CARDS */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                icon="!"
                title="Critical Requirements"
                value="08"
                description="Immediate attention"
              />

              <SummaryCard
                icon="◆"
                title="High Priority"
                value="15"
                description="Skills with high demand"
              />

              <SummaryCard
                icon="◇"
                title="Skills Identified"
                value="32"
                description="Training skill areas"
              />

              <SummaryCard
                icon="✓"
                title="Training Coverage"
                value="68%"
                description="Current requirement coverage"
              />
            </div>

            {/* PRIORITY BANNER */}
            <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 font-bold text-orange-700">
                    !
                  </div>

                  <div>
                    <h2 className="font-bold text-orange-900">
                      Training priorities detected
                    </h2>

                    <p className="mt-1 text-sm text-orange-800">
                      Several skills show a significant difference between
                      employer demand and available candidate supply.
                    </p>
                  </div>
                </div>

                <button className="rounded-lg bg-[#123b68] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0e3155]">
                  View Skill Gaps →
                </button>
              </div>
            </div>

            {/* FILTERS */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Training Requirement Analysis
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Filter requirements based on sector, priority and demand.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <select className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#123b68]">
                    <option>All Sectors</option>
                    <option>IT & Technology</option>
                    <option>Automotive</option>
                    <option>Manufacturing</option>
                    <option>Healthcare</option>
                  </select>

                  <select className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#123b68]">
                    <option>All Priorities</option>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                  </select>

                  <select className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#123b68]">
                    <option>All Demand Levels</option>
                    <option>Very High</option>
                    <option>High</option>
                    <option>Medium</option>
                  </select>
                </div>
              </div>
            </div>

            {/* REQUIREMENT TABLE */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Identified Training Requirements
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Skills where additional training can improve candidate
                    availability.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Labour Market Intelligence
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-slate-500">
                      <th className="pb-3 pr-4">
                        Skill / Training Area
                      </th>

                      <th className="pb-3 pr-4">
                        Sector
                      </th>

                      <th className="pb-3 pr-4">
                        Demand
                      </th>

                      <th className="pb-3 pr-4">
                        Candidate Supply
                      </th>

                      <th className="pb-3 pr-4">
                        Required
                      </th>

                      <th className="pb-3 pr-4">
                        Gap
                      </th>

                      <th className="pb-3">
                        Priority
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {requirements.map((item) => (
                      <tr
                        key={item.skill}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-4 pr-4">
                          <p className="font-semibold text-slate-900">
                            {item.skill}
                          </p>
                        </td>

                        <td className="py-4 pr-4 text-slate-600">
                          {item.sector}
                        </td>

                        <td className="py-4 pr-4">
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            {item.demand}
                          </span>
                        </td>

                        <td className="py-4 pr-4 font-medium text-slate-700">
                          {item.candidates}
                        </td>

                        <td className="py-4 pr-4 font-medium text-slate-700">
                          {item.required}
                        </td>

                        <td className="py-4 pr-4">
                          <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                            {item.gap}
                          </span>
                        </td>

                        <td className="py-4">
                          <PriorityBadge priority={item.priority} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RECOMMENDED ACTIONS */}
            <div className="mt-6">
              <h2 className="text-lg font-bold text-slate-900">
                Recommended Training Actions
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Actions employers can take to address identified training
                requirements.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <ActionCard
                  icon="◆"
                  title="Find Training Providers"
                  description="Connect with providers offering courses for identified skill gaps."
                  button="Find Providers"
                />

                <ActionCard
                  icon="★"
                  title="Explore Courses"
                  description="Review industry-aligned courses relevant to your required skills."
                  button="View Courses"
                />

                <ActionCard
                  icon="✓"
                  title="Review Skill Gaps"
                  description="Analyse the difference between required skills and candidate supply."
                  button="View Gap Report"
                />
              </div>
            </div>

            {/* INSIGHT */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-[#123b68]">
                  i
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    How training requirements are identified
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    SkillMitra can use labour-market demand, employer
                    requirements and candidate skill-supply information to
                    identify areas where additional training may be required.
                    These insights can help employers and training partners
                    align training with industry needs.
                  </p>
                </div>
              </div>
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
  icon,
  title,
  value,
  description,
}: {
  icon: string;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-blue-600">
          {icon}
        </div>

        <p className="text-xs font-semibold text-slate-600">
          {title}
        </p>
      </div>

      <p className="mt-4 text-3xl font-bold text-[#123b68]">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* ============================================================
   PRIORITY BADGE
============================================================ */

function PriorityBadge({ priority }: { priority: string }) {
  const styles =
    priority === "Critical"
      ? "bg-red-50 text-red-600"
      : priority === "High"
        ? "bg-orange-50 text-orange-700"
        : "bg-yellow-50 text-yellow-700";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}
    >
      {priority}
    </span>
  );
}

/* ============================================================
   ACTION CARD
============================================================ */

function ActionCard({
  icon,
  title,
  description,
  button,
}: {
  icon: string;
  title: string;
  description: string;
  button: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-lg text-[#123b68]">
        {icon}
      </div>

      <h3 className="mt-4 font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-5 text-slate-500">
        {description}
      </p>

      <button className="mt-4 text-sm font-semibold text-[#123b68] hover:underline">
        {button} →
      </button>
    </div>
  );
}

