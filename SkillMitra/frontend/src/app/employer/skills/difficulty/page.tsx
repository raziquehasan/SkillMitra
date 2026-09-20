
"use client";

import Image from "next/image";
import EmployerSidebar from "@/components/employer/EmployerSidebar";

const difficultyData = [
  {
    skill: "EV Battery Technology",
    demand: 86,
    supply: 32,
    difficulty: "High",
    openings: 24,
  },
  {
    skill: "Advanced Manufacturing",
    demand: 78,
    supply: 41,
    difficulty: "High",
    openings: 19,
  },
  {
    skill: "Data Analytics",
    demand: 72,
    supply: 54,
    difficulty: "Medium",
    openings: 16,
  },
  {
    skill: "Cloud Computing",
    demand: 68,
    supply: 48,
    difficulty: "Medium",
    openings: 12,
  },
];

export default function HiringDifficultyPage() {
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
            SkillMitra | Industry Portal
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
                  Hiring Difficulty Dashboard
                </p>
              </div>

            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">

            {/* PAGE HEADER */}
            <div className="mb-7">

              <p className="text-xs font-medium text-slate-400">
                Industry Portal / Skill Intelligence
              </p>

              <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">

                <div>
                  <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                    Hiring Difficulty
                  </h1>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
                    Identify skills that are difficult to hire for by comparing
                    industry demand with available candidate supply.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">

                  <p className="text-xs text-slate-400">
                    Analysis Area
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
                title="High Difficulty Skills"
                value="2"
                description="Skills with major supply gaps"
                icon="!"
              />

              <SummaryCard
                title="Medium Difficulty"
                value="2"
                description="Skills requiring attention"
                icon="~"
              />

              <SummaryCard
                title="Critical Openings"
                value="43"
                description="Openings affected by skill gaps"
                icon="□"
              />

              <SummaryCard
                title="Supply Coverage"
                value="44%"
                description="Average candidate availability"
                icon="%"
              />

            </div>

            {/* MAIN GRID */}
            <div className="mt-6 grid gap-6 xl:grid-cols-3">

              {/* DIFFICULTY OVERVIEW */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">

                <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Skill Hiring Difficulty
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Demand versus available candidate supply
                    </p>
                  </div>

                  <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-[#123b68]">
                    <option>All Sectors</option>
                    <option>EV / Automotive</option>
                    <option>IT & Technology</option>
                    <option>Manufacturing</option>
                  </select>

                </div>

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[700px] text-left text-sm">

                    <thead>
                      <tr className="border-b border-slate-200 text-xs text-slate-500">

                        <th className="pb-3 font-semibold">
                          Skill
                        </th>

                        <th className="pb-3 font-semibold">
                          Demand
                        </th>

                        <th className="pb-3 font-semibold">
                          Candidate Supply
                        </th>

                        <th className="pb-3 font-semibold">
                          Openings
                        </th>

                        <th className="pb-3 font-semibold">
                          Difficulty
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {difficultyData.map((item) => (
                        <tr
                          key={item.skill}
                          className="border-b border-slate-100 last:border-0"
                        >

                          <td className="py-4 font-semibold text-slate-800">
                            {item.skill}
                          </td>

                          <td className="py-4">

                            <div className="flex items-center gap-2">

                              <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-blue-600"
                                  style={{
                                    width: `${item.demand}%`,
                                  }}
                                />
                              </div>

                              <span className="text-xs text-slate-500">
                                {item.demand}%
                              </span>

                            </div>

                          </td>

                          <td className="py-4">

                            <div className="flex items-center gap-2">

                              <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-emerald-500"
                                  style={{
                                    width: `${item.supply}%`,
                                  }}
                                />
                              </div>

                              <span className="text-xs text-slate-500">
                                {item.supply}%
                              </span>

                            </div>

                          </td>

                          <td className="py-4 font-medium text-slate-700">
                            {item.openings}
                          </td>

                          <td className="py-4">
                            <DifficultyBadge
                              difficulty={item.difficulty}
                            />
                          </td>

                        </tr>
                      ))}

                    </tbody>

                  </table>

                </div>
              </div>

              {/* DIFFICULTY SCALE */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                <h2 className="text-lg font-bold text-slate-900">
                  Difficulty Scale
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Hiring difficulty is determined by the relationship between
                  employer demand and candidate skill supply.
                </p>

                <div className="mt-6 space-y-4">

                  <DifficultyInfo
                    label="Critical"
                    description="Very high demand with very limited candidate supply."
                    className="bg-red-50 text-red-700"
                  />

                  <DifficultyInfo
                    label="High"
                    description="Demand significantly exceeds available talent."
                    className="bg-orange-50 text-orange-700"
                  />

                  <DifficultyInfo
                    label="Medium"
                    description="Some shortage exists in the available talent pool."
                    className="bg-yellow-50 text-yellow-700"
                  />

                  <DifficultyInfo
                    label="Low"
                    description="Candidate supply is sufficient for current demand."
                    className="bg-emerald-50 text-emerald-700"
                  />

                </div>
              </div>

            </div>

            {/* DIFFICULT-TO-HIRE SKILLS */}
            <div className="mt-6 rounded-xl border border-orange-200 bg-white p-6 shadow-sm">

              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Difficult-to-Hire Skills
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Skills where employers may require additional recruitment
                    or training support.
                  </p>
                </div>

                <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
                  2 High Difficulty Areas
                </span>

              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">

                <SkillDifficultyCard
                  skill="EV Battery Technology"
                  reason="High industry demand but limited skilled candidate availability."
                  demand="86%"
                  supply="32%"
                />

                <SkillDifficultyCard
                  skill="Advanced Manufacturing"
                  reason="Growing manufacturing requirements with limited specialised talent."
                  demand="78%"
                  supply="41%"
                />

              </div>
            </div>

            {/* RECOMMENDED ACTION */}
            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-6">

              <div className="flex flex-col gap-4 md:flex-row md:items-start">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-lg font-bold text-[#123b68] shadow-sm">
                  →
                </div>

                <div>

                  <h2 className="font-bold text-[#123b68]">
                    Recommended Employer Action
                  </h2>

                  <p className="mt-1 max-w-3xl text-sm leading-6 text-blue-800">
                    For skills with high hiring difficulty, employers can
                    consider expanding candidate sourcing, working with training
                    providers and identifying upskilling requirements.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">

                    <button className="rounded-lg bg-[#123b68] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0e3155]">
                      Find Training Providers
                    </button>

                    <button className="rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#123b68] hover:bg-blue-50">
                      View Candidate Supply
                    </button>

                  </div>

                </div>

              </div>
            </div>

            {/* DATA NOTE */}
            <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-4">

              <p className="text-xs leading-5 text-slate-500">

                <span className="font-semibold text-slate-700">
                  Intelligence data:
                </span>{" "}
                Hiring difficulty indicators are intended to be populated from
                SkillMitra labour-market intelligence and candidate-supply data
                when the corresponding API data is available.

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

        <span className="text-xs text-slate-400">
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

function DifficultyBadge({
  difficulty,
}: {
  difficulty: string;
}) {
  const classes =
    difficulty === "High"
      ? "bg-orange-50 text-orange-700"
      : difficulty === "Medium"
        ? "bg-yellow-50 text-yellow-700"
        : "bg-emerald-50 text-emerald-700";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}
    >
      {difficulty}
    </span>
  );
}

function DifficultyInfo({
  label,
  description,
  className,
}: {
  label: string;
  description: string;
  className: string;
}) {
  return (
    <div className={`rounded-lg p-4 ${className}`}>

      <p className="text-sm font-bold">
        {label}
      </p>

      <p className="mt-1 text-xs leading-5">
        {description}
      </p>

    </div>
  );
}

function SkillDifficultyCard({
  skill,
  reason,
  demand,
  supply,
}: {
  skill: string;
  reason: string;
  demand: string;
  supply: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-5">

      <div className="flex items-start justify-between gap-3">

        <div>

          <h3 className="font-semibold text-slate-900">
            {skill}
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {reason}
          </p>

        </div>

        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-700">
          HIGH
        </span>

      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">

        <div className="rounded-lg bg-slate-50 p-3">

          <p className="text-[11px] text-slate-400">
            Demand
          </p>

          <p className="mt-1 text-lg font-bold text-[#123b68]">
            {demand}
          </p>

        </div>

        <div className="rounded-lg bg-slate-50 p-3">

          <p className="text-[11px] text-slate-400">
            Supply
          </p>

          <p className="mt-1 text-lg font-bold text-emerald-600">
            {supply}
          </p>

        </div>

      </div>

    </div>
  );
}

