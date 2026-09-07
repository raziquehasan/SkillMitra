"use client";

import Image from "next/image";
import Link from "next/link";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";

const skills = [
  { name: "JavaScript", level: "Advanced", score: 85 },
  { name: "React", level: "Intermediate", score: 72 },
  { name: "SQL", level: "Intermediate", score: 68 },
  { name: "Python", level: "Basic", score: 48 },
  { name: "HTML & CSS", level: "Advanced", score: 88 },
  { name: "Git & GitHub", level: "Intermediate", score: 70 },
];

function ProfileInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}

function SkillBar({
  name,
  level,
  score,
}: {
  name: string;
  level: string;
  score: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">{name}</p>
          <p className="mt-1 text-xs text-slate-500">{level}</p>
        </div>

        <span className="text-sm font-bold text-[#123b68]">
          {score}%
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[#123b68]"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function CandidateProfilePage() {
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
                  Candidate Profile
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">
            {/* Intro */}
            <div className="mb-6">
              <p className="text-sm font-medium text-[#c2410c]">
                Candidate Information
              </p>

              <h1 className="mt-1 text-2xl font-bold text-[#123b68]">
                My Profile
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Manage your personal information, career profile and
                skills used by SkillMitra for job and training
                recommendations.
              </p>
            </div>

            {/* Profile Overview */}
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              {/* Main Profile Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-2xl font-bold text-[#123b68]">
                      S
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Candidate
                      </p>

                      <h2 className="mt-1 text-xl font-bold text-[#123b68]">
                        SkillMitra Candidate
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Software Development & Technology
                      </p>

                      <span className="mt-2 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                        Profile Active
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="rounded-lg border border-[#123b68] px-4 py-2.5 text-sm font-semibold text-[#123b68] hover:bg-blue-50"
                  >
                    Edit Profile
                  </button>
                </div>

                <div className="mt-7 border-t border-slate-100 pt-6">
                  <h3 className="text-base font-bold text-[#123b68]">
                    Personal Information
                  </h3>

                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <ProfileInfo
                      label="Full Name"
                      value="SkillMitra Candidate"
                    />

                    <ProfileInfo
                      label="Email Address"
                      value="candidate@skillmitra.in"
                    />

                    <ProfileInfo
                      label="Phone Number"
                      value="+91 XXXXX XXXXX"
                    />

                    <ProfileInfo
                      label="Location"
                      value="Pune, Maharashtra"
                    />

                    <ProfileInfo
                      label="Preferred Role"
                      value="Software Developer"
                    />

                    <ProfileInfo
                      label="Experience"
                      value="1–2 Years"
                    />
                  </div>
                </div>

                <div className="mt-7 border-t border-slate-100 pt-6">
                  <h3 className="text-base font-bold text-[#123b68]">
                    Career Preferences
                  </h3>

                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <ProfileInfo
                      label="Preferred Sector"
                      value="IT & Technology"
                    />

                    <ProfileInfo
                      label="Preferred Location"
                      value="Pune / Mumbai"
                    />

                    <ProfileInfo
                      label="Employment Type"
                      value="Full Time"
                    />

                    <ProfileInfo
                      label="Career Interest"
                      value="Software Development"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Completion */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Profile Intelligence
                </p>

                <h3 className="mt-2 text-lg font-bold text-[#123b68]">
                  Profile Completion
                </h3>

                <div className="mt-6 flex items-center justify-center">
                  <div className="flex h-36 w-36 items-center justify-center rounded-full border-[12px] border-blue-100">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-[#123b68]">
                        82%
                      </p>
                      <p className="text-xs text-slate-500">
                        Complete
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      Personal Information
                    </span>
                    <span className="font-semibold text-green-700">
                      Complete
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      Career Preferences
                    </span>
                    <span className="font-semibold text-green-700">
                      Complete
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      Skills
                    </span>
                    <span className="font-semibold text-green-700">
                      Complete
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      Resume
                    </span>
                    <span className="font-semibold text-amber-700">
                      Pending
                    </span>
                  </div>
                </div>

                <div className="mt-6 rounded-lg bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-[#123b68]">
                    Improve your profile
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Add your resume and keep your skills updated to
                    improve job recommendations.
                  </p>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-8">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#123b68]">
                    Current Skills
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Skills currently available in your candidate profile.
                  </p>
                </div>

                <Link
                  href="/candidate/skills"
                  className="text-sm font-semibold text-[#123b68] hover:underline"
                >
                  Manage Skills →
                </Link>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <SkillBar
                      name={skill.name}
                      level={skill.level}
                      score={skill.score}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Career Intelligence */}
            <div className="mt-8">
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#123b68]">
                      Candidate Career Intelligence
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-[#123b68]">
                      Your profile is currently aligned with technology
                      roles.
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                      Based on your current skills, roles such as Software
                      Developer and Data Analyst can be explored. Improving
                      TypeScript, Cloud Computing and Advanced Excel can
                      strengthen your profile further.
                    </p>
                  </div>

                  <Link
                    href="/candidate/skill-gap"
                    className="shrink-0 rounded-lg bg-[#123b68] px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#0f3155]"
                  >
                    View Skill Gap
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
                  Update Skills
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Review and manage your current skill profile.
                </p>

                <span className="mt-4 inline-block text-sm font-semibold text-[#123b68]">
                  Manage Skills →
                </span>
              </Link>

              <Link
                href="/candidate/recommended-jobs"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md"
              >
                <p className="font-semibold text-[#123b68]">
                  Recommended Jobs
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Explore jobs matched with your profile and skills.
                </p>

                <span className="mt-4 inline-block text-sm font-semibold text-[#123b68]">
                  View Jobs →
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
                  Find courses aligned with your career skill gaps.
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
                    SkillMitra Profile Intelligence
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Keep your personal information, career preferences and
                    skills updated so SkillMitra can provide more relevant
                    job and training recommendations.
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