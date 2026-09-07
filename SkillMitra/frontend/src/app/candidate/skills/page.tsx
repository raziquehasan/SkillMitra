"use client";

import Image from "next/image";
import Link from "next/link";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";

const skills = [
  {
    name: "JavaScript",
    category: "Programming",
    level: "Advanced",
    score: 85,
    experience: "2 Years",
    status: "Job Ready",
  },
  {
    name: "React",
    category: "Frontend Development",
    level: "Intermediate",
    score: 72,
    experience: "1.5 Years",
    status: "Job Ready",
  },
  {
    name: "SQL",
    category: "Database",
    level: "Intermediate",
    score: 68,
    experience: "1 Year",
    status: "Job Ready",
  },
  {
    name: "Python",
    category: "Programming",
    level: "Basic",
    score: 48,
    experience: "6 Months",
    status: "Needs Improvement",
  },
  {
    name: "HTML & CSS",
    category: "Frontend Development",
    level: "Advanced",
    score: 88,
    experience: "2 Years",
    status: "Job Ready",
  },
  {
    name: "Git & GitHub",
    category: "Development Tools",
    level: "Intermediate",
    score: 70,
    experience: "1 Year",
    status: "Job Ready",
  },
];

const skillGaps = [
  {
    skill: "TypeScript",
    role: "Software Developer",
    priority: "Critical",
    current: "Beginner",
    target: "Intermediate",
  },
  {
    skill: "Advanced Excel",
    role: "Data Analyst",
    priority: "High",
    current: "Beginner",
    target: "Intermediate",
  },
  {
    skill: "Cloud Computing",
    role: "Software Developer",
    priority: "High",
    current: "Beginner",
    target: "Intermediate",
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
      <p className="mt-2 text-3xl font-bold text-[#123b68]">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function SkillLevel({ score }: { score: number }) {
  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-slate-500">Proficiency</span>
        <span className="font-semibold text-[#123b68]">{score}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[#123b68]"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function SkillCard({
  skill,
}: {
  skill: (typeof skills)[number];
}) {
  const ready = skill.status === "Job Ready";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-800">{skill.name}</h3>
          <p className="mt-1 text-xs text-slate-500">{skill.category}</p>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            ready
              ? "bg-green-50 text-green-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {skill.status}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[11px] text-slate-400">Level</p>
          <p className="mt-1 text-sm font-semibold text-slate-700">
            {skill.level}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[11px] text-slate-400">Experience</p>
          <p className="mt-1 text-sm font-semibold text-slate-700">
            {skill.experience}
          </p>
        </div>
      </div>

      <SkillLevel score={skill.score} />
    </div>
  );
}

export default function MySkillsPage() {
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
                <p className="text-xs text-slate-400">SkillMitra</p>
                <p className="font-semibold text-[#123b68]">
                  My Skills
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">
            {/* Intro */}
            <div className="mb-6">
              <p className="text-sm font-medium text-[#c2410c]">
                Candidate Skill Profile
              </p>

              <h1 className="mt-1 text-2xl font-bold text-[#123b68]">
                My Skills
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                View your current skills, proficiency levels and identify
                skills that can improve your career opportunities.
              </p>
            </div>

            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Total Skills"
                value="14"
                description="Skills in your profile"
              />

              <SummaryCard
                label="Job Ready"
                value="10"
                description="Skills ready for jobs"
              />

              <SummaryCard
                label="Skills to Improve"
                value="04"
                description="Need further development"
              />

              <SummaryCard
                label="Overall Readiness"
                value="72%"
                description="Current skill readiness"
              />
            </div>

            {/* Profile Intelligence */}
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#123b68]">
                    Skill Profile Intelligence
                  </p>

                  <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                    Your current profile has a strong foundation in
                    frontend development and programming. Improving
                    TypeScript, Cloud Computing and Advanced Excel can
                    increase your job opportunities.
                  </p>
                </div>

                <Link
                  href="/candidate/recommended-skills"
                  className="shrink-0 rounded-lg bg-[#123b68] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#0f3155]"
                >
                  View Recommended Skills
                </Link>
              </div>
            </div>

            {/* Current Skills */}
            <div className="mt-8">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#123b68]">
                    Current Skills
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Skills currently available in your candidate profile.
                  </p>
                </div>

                <button
                  type="button"
                  className="rounded-lg border border-[#123b68] bg-white px-4 py-2 text-sm font-semibold text-[#123b68] hover:bg-slate-50"
                >
                  + Add Skill
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {skills.map((skill) => (
                  <SkillCard key={skill.name} skill={skill} />
                ))}
              </div>
            </div>

            {/* Skill Gap */}
            <div className="mt-8">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#123b68]">
                  Skills to Improve
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Skills identified from your profile and career
                  opportunities.
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-4">Skill</th>
                        <th className="px-5 py-4">Target Role</th>
                        <th className="px-5 py-4">Current</th>
                        <th className="px-5 py-4">Target</th>
                        <th className="px-5 py-4">Priority</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {skillGaps.map((gap) => (
                        <tr
                          key={gap.skill}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-5 py-4 font-semibold text-slate-800">
                            {gap.skill}
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {gap.role}
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {gap.current}
                          </td>

                          <td className="px-5 py-4 font-medium text-[#123b68]">
                            {gap.target}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                gap.priority === "Critical"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {gap.priority}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Skill Categories */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-[#123b68]">
                Skill Categories
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs text-slate-400">
                    Programming
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[#123b68]">
                    4
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    JavaScript, Python and more
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs text-slate-400">
                    Frontend
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[#123b68]">
                    3
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    React, HTML, CSS
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs text-slate-400">
                    Database
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[#123b68]">
                    2
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    SQL and database skills
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs text-slate-400">
                    Tools
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[#123b68]">
                    5
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Development and productivity
                  </p>
                </div>
              </div>
            </div>

            {/* Career Actions */}
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Link
                href="/candidate/recommended-skills"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md"
              >
                <p className="font-semibold text-[#123b68]">
                  Recommended Skills
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Explore skills that can improve your career
                  opportunities.
                </p>
                <span className="mt-4 inline-block text-sm font-semibold text-[#123b68]">
                  Explore →
                </span>
              </Link>

              <Link
                href="/candidate/skill-gap"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md"
              >
                <p className="font-semibold text-[#123b68]">
                  Skill Gap Analysis
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Understand which skills you need for target roles.
                </p>
                <span className="mt-4 inline-block text-sm font-semibold text-[#123b68]">
                  View Skill Gap →
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
                  Find training opportunities aligned with your
                  skill gaps.
                </p>
                <span className="mt-4 inline-block text-sm font-semibold text-[#123b68]">
                  Explore Training →
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
                    Candidate Intelligence
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Keep your skills updated to improve job matching,
                    recommendations and training opportunities.
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