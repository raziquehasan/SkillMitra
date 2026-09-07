"use client";

import Image from "next/image";
import Link from "next/link";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";

const courses = [
  {
    title: "Advanced Data Analytics",
    provider: "Industry Skill Training Centre",
    category: "Data & Analytics",
    level: "Advanced",
    duration: "10 Weeks",
    mode: "Online + Practical",
    skills: ["Python", "Data Analytics", "SQL"],
    match: 94,
    priority: "High Priority",
  },
  {
    title: "Cloud Computing Fundamentals",
    provider: "Technology Training Partner",
    category: "Cloud & Technology",
    level: "Intermediate",
    duration: "8 Weeks",
    mode: "Online",
    skills: ["Cloud Computing", "Linux", "Networking"],
    match: 89,
    priority: "High Priority",
  },
  {
    title: "Full Stack Web Development",
    provider: "Digital Technology Training Hub",
    category: "Software Development",
    level: "Intermediate",
    duration: "12 Weeks",
    mode: "Online + Practical",
    skills: ["React", "Node.js", "Database"],
    match: 87,
    priority: "Recommended",
  },
  {
    title: "TypeScript for Modern Development",
    provider: "Digital Technology Training Hub",
    category: "Software Development",
    level: "Intermediate",
    duration: "6 Weeks",
    mode: "Online",
    skills: ["TypeScript", "JavaScript", "React"],
    match: 92,
    priority: "Critical Skill",
  },
  {
    title: "Advanced Excel for Data Analysis",
    provider: "Industry Skill Training Centre",
    category: "Data & Analytics",
    level: "Intermediate",
    duration: "6 Weeks",
    mode: "Online + Practical",
    skills: ["Advanced Excel", "Data Analysis", "Reporting"],
    match: 85,
    priority: "High Priority",
  },
  {
    title: "UI/UX Design Fundamentals",
    provider: "Digital Innovation Training Centre",
    category: "Design",
    level: "Beginner",
    duration: "8 Weeks",
    mode: "Online",
    skills: ["Figma", "UI Design", "UX Research"],
    match: 78,
    priority: "Recommended",
  },
];

const learningPaths = [
  {
    step: "01",
    title: "Close Critical Skill Gap",
    skill: "TypeScript",
    description:
      "Build intermediate TypeScript skills to improve software development opportunities.",
  },
  {
    step: "02",
    title: "Strengthen Technical Skills",
    skill: "Cloud Computing",
    description:
      "Learn cloud fundamentals and deployment concepts for modern technology roles.",
  },
  {
    step: "03",
    title: "Improve Data Skills",
    skill: "Advanced Excel",
    description:
      "Develop advanced spreadsheet and data analysis capabilities.",
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
    priority === "Critical Skill"
      ? "bg-red-50 text-red-700"
      : priority === "High Priority"
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

function CourseCard({
  course,
}: {
  course: (typeof courses)[number];
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-xl text-[#123b68]">
          ▤
        </div>

        <PriorityBadge priority={course.priority} />
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

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[11px] text-slate-400">Level</p>
          <p className="mt-1 text-sm font-semibold text-slate-700">
            {course.level}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[11px] text-slate-400">Duration</p>
          <p className="mt-1 text-sm font-semibold text-slate-700">
            {course.duration}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-slate-50 p-3">
        <p className="text-[11px] text-slate-400">Learning Mode</p>
        <p className="mt-1 text-sm font-semibold text-slate-700">
          {course.mode}
        </p>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Skills Covered
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

      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400">
              Profile Relevance
            </p>

            <p className="mt-1 text-lg font-bold text-[#123b68]">
              {course.match}%
            </p>
          </div>

          <button
            type="button"
            className="rounded-lg bg-[#123b68] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0f3155]"
          >
            View Course
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TrainingCoursesPage() {
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
                  Training & Courses
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">
            {/* Intro */}
            <div className="mb-6">
              <p className="text-sm font-medium text-[#c2410c]">
                Learning & Development
              </p>

              <h1 className="mt-1 text-2xl font-bold text-[#123b68]">
                Training & Courses
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Explore training opportunities and courses aligned with
                your current skills, career interests and identified skill
                gaps.
              </p>
            </div>

            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Recommended Courses"
                value="12"
                description="Courses matched to your profile"
              />

              <SummaryCard
                label="High Priority"
                value="05"
                description="Courses linked to skill gaps"
              />

              <SummaryCard
                label="Training Providers"
                value="24"
                description="Available training providers"
              />

              <SummaryCard
                label="Skill Alignment"
                value="92%"
                description="Average course relevance"
              />
            </div>

            {/* Intelligence Banner */}
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#123b68]">
                    Personalized Learning Recommendations
                  </p>

                  <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                    These courses are selected based on your current skills,
                    identified skill gaps and the requirements of relevant
                    job roles.
                  </p>
                </div>

                <Link
                  href="/candidate/skill-gap"
                  className="shrink-0 rounded-lg bg-[#123b68] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#0f3155]"
                >
                  View Skill Gaps
                </Link>
              </div>
            </div>

            {/* Filters */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-base font-bold text-[#123b68]">
                  Find Training
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Filter courses based on your learning requirements.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-500">
                    Search Course
                  </label>

                  <input
                    type="text"
                    placeholder="Search courses..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-500">
                    Category
                  </label>

                  <select className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]">
                    <option>All Categories</option>
                    <option>Software Development</option>
                    <option>Data & Analytics</option>
                    <option>Cloud & Technology</option>
                    <option>Design</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-500">
                    Level
                  </label>

                  <select className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]">
                    <option>All Levels</option>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Recommended Courses */}
            <div className="mt-8">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#123b68]">
                  Recommended Courses
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Training opportunities most relevant to your current
                  career profile.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard
                    key={course.title}
                    course={course}
                  />
                ))}
              </div>
            </div>

            {/* Learning Path */}
            <div className="mt-8">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#123b68]">
                  Suggested Learning Path
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  A simple sequence to strengthen your priority skills.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="grid gap-5 md:grid-cols-3">
                  {learningPaths.map((item) => (
                    <div
                      key={item.step}
                      className="relative rounded-xl border border-slate-100 bg-slate-50 p-5"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#123b68] text-xs font-bold text-white">
                        {item.step}
                      </div>

                      <h3 className="mt-4 font-semibold text-slate-800">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-sm font-semibold text-[#123b68]">
                        {item.skill}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Training Benefits */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-[#123b68]">
                Why Training Matters
              </h2>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#123b68]">
                    ✓
                  </div>

                  <h3 className="mt-4 font-semibold text-slate-800">
                    Close Skill Gaps
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Develop skills that are currently missing from your
                    profile.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#123b68]">
                    ★
                  </div>

                  <h3 className="mt-4 font-semibold text-slate-800">
                    Improve Job Matching
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Strengthen your profile for roles that match your
                    career interests.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#123b68]">
                    ↗
                  </div>

                  <h3 className="mt-4 font-semibold text-slate-800">
                    Build Career Readiness
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Improve technical and professional capabilities through
                    structured learning.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Link
                href="/candidate/learning"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md"
              >
                <p className="font-semibold text-[#123b68]">
                  My Learning
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Track the courses and training you are currently
                  pursuing.
                </p>

                <span className="mt-4 inline-block text-sm font-semibold text-[#123b68]">
                  View Learning →
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
                  Discover skills that can improve your career
                  opportunities.
                </p>

                <span className="mt-4 inline-block text-sm font-semibold text-[#123b68]">
                  Explore Skills →
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
                  Understand which skills should be improved first.
                </p>

                <span className="mt-4 inline-block text-sm font-semibold text-[#123b68]">
                  View Analysis →
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
                    Training recommendations are designed to connect your
                    skill gaps with relevant learning opportunities.
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