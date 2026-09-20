
"use client";

import Image from "next/image";
import EmployerSidebar from "@/components/employer/EmployerSidebar";

const courses = [
  {
    title: "Electric Vehicle Technology",
    provider: "Skill Development Training Provider",
    level: "Intermediate",
    duration: "8 Weeks",
    skills: ["EV Technology", "Battery Systems", "Vehicle Diagnostics"],
  },
  {
    title: "Advanced Data Analytics",
    provider: "Industry Skill Training Centre",
    level: "Advanced",
    duration: "10 Weeks",
    skills: ["Python", "Data Analytics", "SQL"],
  },
  {
    title: "Full Stack Web Development",
    provider: "Technology Training Partner",
    level: "Intermediate",
    duration: "12 Weeks",
    skills: ["React", "Node.js", "Database"],
  },
];

export default function RecommendedCoursesPage() {
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
                  Recommended Courses Dashboard
                </p>
              </div>

            </div>
          </div>

          {/* PAGE BODY */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">

            {/* PAGE HEADER */}
            <div className="mb-7">

              <p className="text-xs font-medium text-slate-400">
                Industry Portal / Training
              </p>

              <div className="mt-2">
                <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                  Recommended Courses
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
                  Training courses recommended based on your industry's
                  identified skill requirements and hiring gaps.
                </p>
              </div>

            </div>

            {/* SUMMARY CARDS */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <SummaryCard
                title="Recommended Courses"
                value="12"
                description="Based on skill gaps"
                icon="▣"
              />

              <SummaryCard
                title="High Priority Skills"
                value="08"
                description="Skills requiring training"
                icon="◆"
              />

              <SummaryCard
                title="Training Providers"
                value="24"
                description="Available providers"
                icon="◇"
              />

              <SummaryCard
                title="Industry Aligned"
                value="92%"
                description="Course relevance"
                icon="✓"
              />

            </div>

            {/* FILTERS */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Training Recommendations
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Courses aligned with current employer skill requirements.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">

                  <select className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#123b68]">
                    <option>All Sectors</option>
                    <option>IT & Technology</option>
                    <option>Automotive</option>
                    <option>Manufacturing</option>
                    <option>Healthcare</option>
                  </select>

                  <select className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#123b68]">
                    <option>All Levels</option>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>

                </div>

              </div>
            </div>

            {/* RECOMMENDED COURSES */}
            <div className="mt-6">

              <div className="mb-4 flex items-center justify-between">

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Courses for Your Skill Gaps
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Recommended using labour-market and skill-gap intelligence.
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  AI Assisted
                </span>

              </div>

              <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">

                {courses.map((course) => (
                  <CourseCard
                    key={course.title}
                    title={course.title}
                    provider={course.provider}
                    level={course.level}
                    duration={course.duration}
                    skills={course.skills}
                  />
                ))}

              </div>

            </div>

            {/* SKILL GAP CONNECTION */}
            <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-5">

              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div>
                  <h2 className="font-bold text-orange-900">
                    Training linked to identified skill gaps
                  </h2>

                  <p className="mt-1 max-w-3xl text-sm text-orange-800">
                    These recommendations help employers address skills where
                    industry demand is higher than available candidate supply.
                  </p>
                </div>

                <button className="rounded-lg bg-[#123b68] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0e3155]">
                  View Skill Gaps
                </button>

              </div>

            </div>

            {/* PROVIDER CTA */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Need a specific training program?
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Explore verified training providers that can address your
                    organisation's required skills.
                  </p>
                </div>

                <button className="rounded-lg border border-[#123b68] px-5 py-2.5 text-sm font-semibold text-[#123b68] hover:bg-blue-50">
                  Find Training Providers →
                </button>

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

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-lg text-blue-600">
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
   COURSE CARD
============================================================ */

function CourseCard({
  title,
  provider,
  level,
  duration,
  skills,
}: {
  title: string;
  provider: string;
  level: string;
  duration: string;
  skills: string[];
}) {
  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

      {/* COURSE ICON */}
      <div className="flex items-start justify-between">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-[#123b68]">
          ★
        </div>

        <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-semibold text-green-700">
          Recommended
        </span>

      </div>

      {/* COURSE INFO */}
      <h3 className="mt-4 text-lg font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-xs text-slate-500">
        {provider}
      </p>

      {/* COURSE META */}
      <div className="mt-4 grid grid-cols-2 gap-3">

        <div className="rounded-lg bg-slate-50 p-3">

          <p className="text-[10px] font-medium text-slate-400">
            LEVEL
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            {level}
          </p>

        </div>

        <div className="rounded-lg bg-slate-50 p-3">

          <p className="text-[10px] font-medium text-slate-400">
            DURATION
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            {duration}
          </p>

        </div>

      </div>

      {/* SKILLS */}
      <div className="mt-4">

        <p className="text-xs font-semibold text-slate-600">
          Skills Covered
        </p>

        <div className="mt-2 flex flex-wrap gap-2">

          {skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600"
            >
              {skill}
            </span>
          ))}

        </div>

      </div>

      {/* ACTION */}
      <button className="mt-5 w-full rounded-lg border border-[#123b68] py-2.5 text-sm font-semibold text-[#123b68] transition hover:bg-[#123b68] hover:text-white">
        View Course →
      </button>

    </div>
  );
}

