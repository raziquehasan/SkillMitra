"use client";

import Image from "next/image";
import Link from "next/link";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";

const skillGaps = [
  {
    skill: "TypeScript",
    targetRole: "Software Developer",
    currentLevel: "Beginner",
    requiredLevel: "Intermediate",
    gap: 32,
    priority: "Critical",
    reason: "Frequently required for modern software development roles.",
  },
  {
    skill: "Advanced Excel",
    targetRole: "Data Analyst",
    currentLevel: "Beginner",
    requiredLevel: "Intermediate",
    gap: 28,
    priority: "High",
    reason: "Important for data analysis, reporting and business insights.",
  },
  {
    skill: "Cloud Computing",
    targetRole: "Software Developer",
    currentLevel: "Beginner",
    requiredLevel: "Intermediate",
    gap: 25,
    priority: "High",
    reason: "Cloud knowledge can improve opportunities in modern software roles.",
  },
  {
    skill: "UX Research",
    targetRole: "UI/UX Designer",
    currentLevel: "Beginner",
    requiredLevel: "Intermediate",
    gap: 20,
    priority: "Medium",
    reason: "Useful for understanding users and creating better digital experiences.",
  },
];

const roleAnalysis = [
  {
    role: "Software Developer",
    match: 78,
    strong: ["JavaScript", "React", "SQL"],
    missing: ["TypeScript", "Cloud Computing"],
  },
  {
    role: "Data Analyst",
    match: 71,
    strong: ["Python", "SQL"],
    missing: ["Advanced Excel", "Power BI"],
  },
  {
    role: "UI/UX Designer",
    match: 66,
    strong: ["HTML & CSS"],
    missing: ["UX Research", "Design Systems"],
  },
];

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-[#123b68]">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const classes =
    priority === "Critical"
      ? "bg-red-50 text-red-700"
      : priority === "High"
      ? "bg-amber-50 text-amber-700"
      : "bg-blue-50 text-blue-700";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${classes}`}
    >
      {priority}
    </span>
  );
}

export default function SkillGapPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fa] text-slate-800">
      {/* Government Header */}
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
            SkillMitra | Candidate Portal
          </div>
        </div>
      </header>

      {/* Orange Line */}
      <div className="fixed left-0 right-0 top-[72px] z-50 h-1 bg-[#c2410c]" />

      <div className="min-h-screen pt-[76px]">
        {/* Candidate Sidebar */}
        <CandidateSidebar />

        {/* Main Content */}
        <section className="min-w-0 lg:ml-72">
          {/* Page Header */}
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
                  Skill Gap Analysis
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">
            {/* Intro */}
            <div className="mb-6">
              <p className="text-sm font-medium text-[#c2410c]">
                Candidate Intelligence
              </p>

              <h1 className="mt-1 text-2xl font-bold text-[#123b68]">
                Skill Gap Analysis
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Understand the difference between your current skills and
                the skills required for relevant career opportunities.
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Skill Gaps"
                value="04"
                description="Skills to improve"
              />

              <SummaryCard
                label="Critical Gaps"
                value="01"
                description="High-impact skill gap"
              />

              <SummaryCard
                label="High Priority"
                value="02"
                description="Skills requiring attention"
              />

              <SummaryCard
                label="Current Readiness"
                value="72%"
                description="Overall skill readiness"
              />
            </div>

            {/* Intelligence Banner */}
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#123b68]">
                    Your Skill Gap Overview
                  </p>

                  <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                    Your strongest areas are JavaScript, React, SQL and
                    frontend development. Adding the identified skills can
                    improve your match with more job opportunities.
                  </p>
                </div>

                <Link
                  href="/candidate/recommended-skills"
                  className="shrink-0 rounded-lg bg-[#123b68] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#0f3155]"
                >
                  Recommended Skills
                </Link>
              </div>
            </div>

            {/* Skill Gap Table */}
            <div className="mt-8">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#123b68]">
                  Identified Skill Gaps
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Skills that can improve your readiness for target roles.
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-4">Skill</th>
                        <th className="px-5 py-4">Target Role</th>
                        <th className="px-5 py-4">Current</th>
                        <th className="px-5 py-4">Required</th>
                        <th className="px-5 py-4">Gap</th>
                        <th className="px-5 py-4">Priority</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {skillGaps.map((item) => (
                        <tr
                          key={item.skill}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-semibold text-slate-800">
                                {item.skill}
                              </p>

                              <p className="mt-1 max-w-xs text-xs text-slate-500">
                                {item.reason}
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {item.targetRole}
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {item.currentLevel}
                          </td>

                          <td className="px-5 py-4 font-medium text-[#123b68]">
                            {item.requiredLevel}
                          </td>

                          <td className="px-5 py-4">
                            <span className="font-semibold text-slate-700">
                              {item.gap}%
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <PriorityBadge priority={item.priority} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Gap Cards */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-[#123b68]">
                Priority Skill Gaps
              </h2>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {skillGaps.map((item) => (
                  <div
                    key={item.skill}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {item.skill}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Target role: {item.targetRole}
                        </p>
                      </div>

                      <PriorityBadge priority={item.priority} />
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-[11px] text-slate-400">
                          Current
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {item.currentLevel}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-[11px] text-slate-400">
                          Required
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#123b68]">
                          {item.requiredLevel}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-[11px] text-slate-400">
                          Gap
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#c2410c]">
                          {item.gap}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-slate-500">
                          Current → Required
                        </span>

                        <span className="font-semibold text-[#123b68]">
                          {item.gap}% gap
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#123b68]"
                          style={{
                            width: `${100 - item.gap}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Role Analysis */}
            <div className="mt-8">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#123b68]">
                  Career Role Analysis
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  See how your current skills align with selected career
                  roles.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {roleAnalysis.map((role) => (
                  <div
                    key={role.role}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-slate-800">
                        {role.role}
                      </h3>

                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-[#123b68]">
                        {role.match}% Match
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-slate-500">
                          Skill Match
                        </span>

                        <span className="font-semibold text-[#123b68]">
                          {role.match}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#123b68]"
                          style={{ width: `${role.match}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Strong Skills
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {role.strong.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Skills to Improve
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {role.missing.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Action */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#c2410c]">
                    Recommended Next Step
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-[#123b68]">
                    Close your highest-priority skill gaps
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Start with TypeScript, followed by Advanced Excel and
                    Cloud Computing. These skills are aligned with roles
                    that match your current profile.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/candidate/recommended-skills"
                    className="rounded-lg bg-[#123b68] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f3155]"
                  >
                    View Skills
                  </Link>

                  <Link
                    href="/candidate/training"
                    className="rounded-lg border border-[#123b68] bg-white px-4 py-2.5 text-sm font-semibold text-[#123b68] hover:bg-slate-50"
                  >
                    Find Training
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Link
                href="/candidate/skills"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md"
              >
                <p className="font-semibold text-[#123b68]">
                  My Skills
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Review your current skills and proficiency levels.
                </p>

                <span className="mt-4 inline-block text-sm font-semibold text-[#123b68]">
                  View Skills →
                </span>
              </Link>

              <Link
                href="/candidate/recommended-skills"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md"
              >
                <p className="font-semibold text-[#123b68]">
                  Recommended Skills
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Explore skills recommended for your career goals.
                </p>

                <span className="mt-4 inline-block text-sm font-semibold text-[#123b68]">
                  Explore →
                </span>
              </Link>

              <Link
                href="/candidate/training"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md"
              >
                <p className="font-semibold text-[#123b68]">
                  Training & Courses
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Find courses that can help close your skill gaps.
                </p>

                <span className="mt-4 inline-block text-sm font-semibold text-[#123b68]">
                  Find Training →
                </span>
              </Link>
            </div>

            {/* Footer Note */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#123b68]">
                  ✦
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#123b68]">
                    SkillMitra Intelligence
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Skill gap insights help you understand which skills
                    can improve your job readiness and career opportunities.
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