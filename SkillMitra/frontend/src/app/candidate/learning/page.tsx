"use client";

import Image from "next/image";
import Link from "next/link";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";

const learningCourses = [
  {
    title: "Advanced Data Analytics",
    provider: "Industry Skill Training Centre",
    category: "Data & Analytics",
    duration: "10 Weeks",
    progress: 72,
    completed: "7 of 10 Weeks",
    status: "In Progress",
    skills: ["Python", "Data Analytics", "SQL"],
    next: "Advanced Data Visualization",
  },
  {
    title: "Cloud Computing Fundamentals",
    provider: "Technology Training Partner",
    category: "Cloud & Technology",
    duration: "8 Weeks",
    progress: 45,
    completed: "3 of 8 Weeks",
    status: "In Progress",
    skills: ["Cloud Computing", "Linux", "Networking"],
    next: "Cloud Service Models",
  },
  {
    title: "Full Stack Web Development",
    provider: "Digital Technology Training Hub",
    category: "Software Development",
    duration: "12 Weeks",
    progress: 100,
    completed: "12 of 12 Weeks",
    status: "Completed",
    skills: ["React", "Node.js", "Database"],
    next: "Course Completed",
  },
];

const completedCourses = [
  {
    title: "HTML & CSS Fundamentals",
    provider: "Digital Technology Training Hub",
    completedOn: "18 Aug 2026",
    skills: ["HTML", "CSS", "Responsive Design"],
  },
  {
    title: "JavaScript Programming",
    provider: "Technology Training Partner",
    completedOn: "02 Aug 2026",
    skills: ["JavaScript", "DOM", "ES6+"],
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

function StatusBadge({ status }: { status: string }) {
  const completed = status === "Completed";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        completed
          ? "bg-green-50 text-green-700"
          : "bg-blue-50 text-[#123b68]"
      }`}
    >
      {status}
    </span>
  );
}

function LearningCard({
  course,
}: {
  course: (typeof learningCourses)[number];
}) {
  const completed = course.progress === 100;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-xl text-[#123b68]">
          ▤
        </div>

        <StatusBadge status={course.status} />
      </div>

      <h3 className="mt-4 text-base font-bold text-slate-800">
        {course.title}
      </h3>

      <p className="mt-1 text-sm font-medium text-[#123b68]">
        {course.provider}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {course.category}
      </p>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 p-3">
        <div>
          <p className="text-[11px] text-slate-400">
            Duration
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            {course.duration}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[11px] text-slate-400">
            Progress
          </p>

          <p className="mt-1 text-sm font-bold text-[#123b68]">
            {course.progress}%
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Course Progress
          </span>

          <span className="font-medium text-slate-600">
            {course.completed}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#123b68]"
            style={{ width: `${course.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Skills
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          {course.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#123b68]"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
        <p className="text-[11px] text-slate-400">
          {completed ? "Course Status" : "Next Learning Step"}
        </p>

        <p className="mt-1 text-sm font-medium text-slate-700">
          {course.next}
        </p>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <button
          type="button"
          className="w-full rounded-lg bg-[#123b68] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f3155]"
        >
          {completed ? "View Certificate" : "Continue Learning"}
        </button>
      </div>
    </div>
  );
}

export default function MyLearningPage() {
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
                  My Learning
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">
            {/* Intro */}
            <div className="mb-6">
              <p className="text-sm font-medium text-[#c2410c]">
                Learning Progress
              </p>

              <h1 className="mt-1 text-2xl font-bold text-[#123b68]">
                My Learning
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Track your ongoing courses, completed training and progress
                toward improving your career skills.
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Active Courses"
                value="02"
                description="Courses currently in progress"
              />

              <SummaryCard
                label="Completed"
                value="01"
                description="Courses successfully completed"
              />

              <SummaryCard
                label="Learning Hours"
                value="86"
                description="Hours spent learning"
              />

              <SummaryCard
                label="Overall Progress"
                value="72%"
                description="Current learning progress"
              />
            </div>

            {/* Learning Intelligence */}
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#123b68]">
                    Learning Intelligence
                  </p>

                  <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                    You are actively developing skills in data analytics,
                    cloud computing and software development. Continue your
                    current learning path to strengthen your job readiness.
                  </p>
                </div>

                <Link
                  href="/candidate/training"
                  className="shrink-0 rounded-lg bg-[#123b68] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#0f3155]"
                >
                  Explore More Courses
                </Link>
              </div>
            </div>

            {/* Current Learning */}
            <div className="mt-8">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#123b68]">
                  Current Learning
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Courses you are currently pursuing.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {learningCourses.map((course) => (
                  <LearningCard
                    key={course.title}
                    course={course}
                  />
                ))}
              </div>
            </div>

            {/* Learning Progress */}
            <div className="mt-8">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#123b68]">
                  Learning Progress
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your progress across active and completed learning.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="space-y-6">
                  {learningCourses.map((course) => (
                    <div key={course.title}>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {course.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {course.provider}
                          </p>
                        </div>

                        <div className="text-sm font-bold text-[#123b68]">
                          {course.progress}%
                        </div>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#123b68]"
                          style={{
                            width: `${course.progress}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Completed Courses */}
            <div className="mt-8">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#123b68]">
                  Completed Courses
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Training programs you have successfully completed.
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-4">
                          Course
                        </th>

                        <th className="px-5 py-4">
                          Provider
                        </th>

                        <th className="px-5 py-4">
                          Completed On
                        </th>

                        <th className="px-5 py-4">
                          Skills
                        </th>

                        <th className="px-5 py-4">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {completedCourses.map((course) => (
                        <tr
                          key={course.title}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-5 py-4 font-semibold text-slate-800">
                            {course.title}
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {course.provider}
                          </td>

                          <td className="px-5 py-4 text-slate-600">
                            {course.completedOn}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {course.skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-medium text-[#123b68]"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                              Completed
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Learning Goals */}
            <div className="mt-8">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#123b68]">
                  Learning Goals
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Focus areas based on your current skill gaps.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">
                      TypeScript
                    </p>

                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                      Critical
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Build intermediate TypeScript skills for software
                    development opportunities.
                  </p>

                  <div className="mt-4 h-2 rounded-full bg-slate-100">
                    <div className="h-full w-[30%] rounded-full bg-[#123b68]" />
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Learning progress: 30%
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">
                      Cloud Computing
                    </p>

                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                      High
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Learn cloud fundamentals and deployment concepts.
                  </p>

                  <div className="mt-4 h-2 rounded-full bg-slate-100">
                    <div className="h-full w-[45%] rounded-full bg-[#123b68]" />
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Learning progress: 45%
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">
                      Advanced Excel
                    </p>

                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                      High
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Improve spreadsheet, reporting and data analysis skills.
                  </p>

                  <div className="mt-4 h-2 rounded-full bg-slate-100">
                    <div className="h-full w-[20%] rounded-full bg-[#123b68]" />
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Learning progress: 20%
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Link
                href="/candidate/training"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md"
              >
                <p className="font-semibold text-[#123b68]">
                  Find More Courses
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Explore additional training opportunities aligned with
                  your profile.
                </p>

                <span className="mt-4 inline-block text-sm font-semibold text-[#123b68]">
                  Explore Courses →
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
                  Check which skills should be improved next.
                </p>

                <span className="mt-4 inline-block text-sm font-semibold text-[#123b68]">
                  View Analysis →
                </span>
              </Link>

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
            </div>

            {/* Footer Note */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#123b68]">
                  ✦
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#123b68]">
                    SkillMitra Learning Intelligence
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Keep progressing through relevant training to strengthen
                    your skills and improve your readiness for suitable job
                    opportunities.
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