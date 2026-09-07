
"use client";

import Image from "next/image";
import Link from "next/link";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";

const recommendedJobs = [
  {
    id: 1,
    title: "EV Technician",
    company: "Maharashtra Automotive Systems",
    location: "Pune",
    experience: "1–3 Years",
    salary: "₹3.5–5.5 LPA",
    match: 94,
    priority: "Excellent Match",
    skills: ["EV Technology", "Battery Systems", "Diagnostics"],
    reason: "Strong match with your EV and technical skills.",
  },
  {
    id: 2,
    title: "Software Developer",
    company: "Digital Technology Solutions",
    location: "Mumbai",
    experience: "0–2 Years",
    salary: "₹4–7 LPA",
    match: 89,
    priority: "Strong Match",
    skills: ["React", "JavaScript", "SQL"],
    reason: "Your frontend and programming skills match this role.",
  },
  {
    id: 3,
    title: "Data Analyst",
    company: "Industry Analytics Pvt. Ltd.",
    location: "Nashik",
    experience: "1–2 Years",
    salary: "₹4–6 LPA",
    match: 84,
    priority: "Strong Match",
    skills: ["Python", "SQL", "Data Analysis"],
    reason: "Good alignment with your analytical and SQL skills.",
  },
  {
    id: 4,
    title: "Cloud Support Associate",
    company: "Technology Services India",
    location: "Pune",
    experience: "0–2 Years",
    salary: "₹3–5 LPA",
    match: 79,
    priority: "Good Match",
    skills: ["Cloud Computing", "Linux", "Networking"],
    reason: "A suitable opportunity based on your technical profile.",
  },
  {
    id: 5,
    title: "UI/UX Designer",
    company: "Digital Innovation Studio",
    location: "Mumbai",
    experience: "0–2 Years",
    salary: "₹3.5–6 LPA",
    match: 76,
    priority: "Good Match",
    skills: ["Figma", "UI Design", "UX Research"],
    reason: "Relevant opportunity with some skills to improve.",
  },
];

export default function RecommendedJobsPage() {
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

        {/* Sidebar */}
        <CandidateSidebar />

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
                  Recommended Jobs
                </p>

              </div>

            </div>

          </div>

          {/* Main Content */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">

            {/* Intro */}
            <div className="mb-6">

              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

                <div>

                  <h1 className="text-2xl font-bold text-[#123b68]">
                    Recommended Jobs
                  </h1>

                  <p className="mt-1 max-w-2xl text-sm text-slate-500">
                    Explore job opportunities recommended for you based on
                    your skills, experience and candidate profile.
                  </p>

                </div>

                <Link
                  href="/candidate/jobs"
                  className="rounded-lg bg-[#123b68] px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-[#0e3155]"
                >
                  Find All Jobs
                </Link>

              </div>

            </div>

            {/* Intelligence Banner */}
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-lg text-[#123b68] shadow-sm">
                    ✦
                  </div>

                  <div>

                    <h2 className="font-bold text-[#123b68]">
                      Skill-Based Job Recommendations
                    </h2>

                    <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-600">
                      These opportunities are selected according to the
                      skills available in your candidate profile and the
                      requirements of available jobs.
                    </p>

                  </div>

                </div>

                <div className="rounded-lg bg-white px-4 py-3 text-center shadow-sm">

                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Recommended
                  </p>

                  <p className="text-xl font-bold text-[#123b68]">
                    12
                  </p>

                  <p className="text-[10px] text-slate-500">
                    Opportunities
                  </p>

                </div>

              </div>

            </div>

            {/* Summary */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <SummaryCard
                title="Recommended Jobs"
                value="12"
                text="Jobs matched to your profile"
              />

              <SummaryCard
                title="90%+ Match"
                value="03"
                text="Excellent skill alignment"
              />

              <SummaryCard
                title="80%+ Match"
                value="08"
                text="Strong opportunities"
              />

              <SummaryCard
                title="Skills Considered"
                value="14"
                text="Skills from your profile"
              />

            </div>

            {/* Recommended List */}
            <div className="mt-8">

              <div className="mb-4">

                <h2 className="text-lg font-bold text-[#123b68]">
                  Jobs Recommended For You
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Higher match scores indicate stronger alignment with
                  your current skills.
                </p>

              </div>

              <div className="space-y-4">

                {recommendedJobs.map((job) => (
                  <RecommendedJobCard
                    key={job.id}
                    job={job}
                  />
                ))}

              </div>

            </div>

            {/* How Recommendations Work */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <h2 className="font-bold text-[#123b68]">
                How Job Recommendations Work
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                SkillMitra uses your candidate information to identify
                relevant employment opportunities.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-4">

                <RecommendationStep
                  number="01"
                  title="Your Skills"
                  text="Your current skills and competencies"
                />

                <RecommendationStep
                  number="02"
                  title="Job Requirements"
                  text="Skills required by available jobs"
                />

                <RecommendationStep
                  number="03"
                  title="Skill Matching"
                  text="Your profile is compared with job needs"
                />

                <RecommendationStep
                  number="04"
                  title="Recommendation"
                  text="Relevant opportunities are identified"
                />

              </div>

            </div>

            {/* Improve Recommendations */}
            <div className="mt-7 grid gap-5 md:grid-cols-2">

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#123b68]">
                    ◆
                  </div>

                  <div>

                    <h3 className="font-semibold text-[#123b68]">
                      Improve Your Job Matches
                    </h3>

                    <p className="text-[11px] text-slate-400">
                      Keep your candidate profile updated
                    </p>

                  </div>

                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Adding relevant skills and keeping your profile updated
                  can help identify more suitable opportunities.
                </p>

                <Link
                  href="/candidate/skills"
                  className="mt-4 inline-block rounded-lg border border-[#123b68] px-4 py-2.5 text-xs font-semibold text-[#123b68] transition hover:bg-blue-50"
                >
                  Update My Skills
                </Link>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#123b68]">
                    △
                  </div>

                  <div>

                    <h3 className="font-semibold text-[#123b68]">
                      Identify Skill Gaps
                    </h3>

                    <p className="text-[11px] text-slate-400">
                      Understand skills you may need to improve
                    </p>

                  </div>

                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Review your skill gaps and explore relevant training
                  opportunities to improve your employment readiness.
                </p>

                <Link
                  href="/candidate/skill-gap"
                  className="mt-4 inline-block rounded-lg bg-[#123b68] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0e3155]"
                >
                  View Skill Gap
                </Link>

              </div>

            </div>

          </div>

        </section>
      </div>
    </main>
  );
}

/* Summary Card */

function SummaryCard({
  title,
  value,
  text,
}: {
  title: string;
  value: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-[#123b68]">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {text}
      </p>

    </div>
  );
}

/* Recommended Job Card */

function RecommendedJobCard({
  job,
}: {
  job: (typeof recommendedJobs)[number];
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-start justify-between gap-3">

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <h3 className="text-base font-bold text-[#123b68]">
                  {job.title}
                </h3>

                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-[#123b68]">
                  Recommended
                </span>

              </div>

              <p className="mt-1 text-sm font-medium text-slate-700">
                {job.company}
              </p>

            </div>

            <div className="rounded-lg bg-green-50 px-4 py-2 text-center">

              <p className="text-[10px] font-semibold uppercase tracking-wide text-green-600">
                Skill Match
              </p>

              <p className="text-xl font-bold text-green-700">
                {job.match}%
              </p>

            </div>

          </div>

          {/* Job Info */}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">

            <span>📍 {job.location}</span>

            <span>◷ {job.experience}</span>

            <span>₹ {job.salary}</span>

          </div>

          {/* Skills */}
          <div className="mt-4">

            <p className="mb-2 text-[11px] font-semibold text-slate-500">
              Matching Skills
            </p>

            <div className="flex flex-wrap gap-2">

              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600"
                >
                  {skill}
                </span>
              ))}

            </div>

          </div>

          {/* Reason */}
          <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3">

            <p className="text-[11px] text-slate-500">
              <span className="font-semibold text-[#123b68]">
                Why this job?
              </span>{" "}
              {job.reason}
            </p>

          </div>

        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-2 lg:flex-col">

          <button
            type="button"
            className="rounded-lg border border-[#123b68] px-4 py-2.5 text-xs font-semibold text-[#123b68] transition hover:bg-blue-50"
          >
            View Details
          </button>

          <button
            type="button"
            className="rounded-lg bg-[#123b68] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0e3155]"
          >
            Apply Now
          </button>

        </div>

      </div>
    </div>
  );
}

/* Recommendation Step */

function RecommendationStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#123b68] text-xs font-bold text-white">
          {number}
        </div>

        <h3 className="text-sm font-semibold text-[#123b68]">
          {title}
        </h3>

      </div>

      <p className="mt-3 text-[11px] leading-5 text-slate-500">
        {text}
      </p>

    </div>
  );
}

