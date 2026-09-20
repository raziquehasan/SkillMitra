
"use client";

import Image from "next/image";
import EmployerSidebar from "@/components/employer/EmployerSidebar";

const providers = [
  {
    name: "Maharashtra Skill Development Centre",
    location: "Pune",
    specialization: "Automotive & EV Skills",
    courses: 18,
    rating: "4.8",
    status: "Verified",
    skills: ["EV Technology", "Battery Systems", "Automotive"],
  },
  {
    name: "Digital Technology Training Hub",
    location: "Mumbai",
    specialization: "IT & Data Skills",
    courses: 24,
    rating: "4.7",
    status: "Verified",
    skills: ["Python", "Data Analytics", "Cloud"],
  },
  {
    name: "Advanced Manufacturing Training Centre",
    location: "Nashik",
    specialization: "Manufacturing Skills",
    courses: 15,
    rating: "4.6",
    status: "Verified",
    skills: ["Automation", "Industrial Skills", "Quality Control"],
  },
  {
    name: "Industry Skills Development Institute",
    location: "Nagpur",
    specialization: "Technical & Industrial Skills",
    courses: 21,
    rating: "4.7",
    status: "Verified",
    skills: ["Electrical", "Mechanical", "Technical Skills"],
  },
];

export default function TrainingProvidersPage() {
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
            SkillMitra | Industry Portal
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
                  Training Providers Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">
            {/* SUMMARY */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                icon="◇"
                title="Available Providers"
                value="48"
                description="Across Maharashtra"
              />

              <SummaryCard
                icon="✓"
                title="Verified Providers"
                value="42"
                description="Verified training partners"
              />

              <SummaryCard
                icon="★"
                title="Available Courses"
                value="320+"
                description="Industry aligned courses"
              />

              <SummaryCard
                icon="◆"
                title="Skill Areas"
                value="65"
                description="Skills covered"
              />
            </div>

            {/* SEARCH / FILTER */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Find a Training Provider
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Search providers based on location, sector and required
                    skills.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <input
                    type="text"
                    placeholder="Search provider or skill..."
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]"
                  />

                  <select className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#123b68]">
                    <option>All Districts</option>
                    <option>Pune</option>
                    <option>Mumbai</option>
                    <option>Nashik</option>
                    <option>Nagpur</option>
                    <option>Aurangabad</option>
                  </select>

                  <select className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#123b68]">
                    <option>All Skill Areas</option>
                    <option>IT & Technology</option>
                    <option>Automotive & EV</option>
                    <option>Manufacturing</option>
                    <option>Electrical</option>
                    <option>Data & Analytics</option>
                  </select>
                </div>
              </div>
            </div>

            {/* PROVIDER LIST */}
            <div className="mt-6">
              <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Recommended Training Providers
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Providers relevant to your organisation's skill
                    requirements.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  Verified Providers
                </span>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {providers.map((provider) => (
                  <ProviderCard
                    key={provider.name}
                    name={provider.name}
                    location={provider.location}
                    specialization={provider.specialization}
                    courses={provider.courses}
                    rating={provider.rating}
                    status={provider.status}
                    skills={provider.skills}
                  />
                ))}
              </div>
            </div>

            {/* SKILL GAP CONNECTION */}
            <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="font-bold text-orange-900">
                    Address your identified skill gaps
                  </h2>

                  <p className="mt-1 max-w-3xl text-sm text-orange-800">
                    Connect your hiring requirements with suitable training
                    providers to improve the availability of job-ready talent.
                  </p>
                </div>

                <button className="rounded-lg bg-[#123b68] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0e3155]">
                  View Skill Gaps →
                </button>
              </div>
            </div>

            {/* INFORMATION CARD */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg text-[#123b68]">
                  i
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Why connect with training providers?
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Employers can use SkillMitra's skill intelligence to
                    identify workforce gaps and connect with relevant training
                    partners. This supports industry-aligned skill development
                    and helps build a stronger job-ready talent pipeline.
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
   PROVIDER CARD
============================================================ */

function ProviderCard({
  name,
  location,
  specialization,
  courses,
  rating,
  status,
  skills,
}: {
  name: string;
  location: string;
  specialization: string;
  courses: number;
  rating: string;
  status: string;
  skills: string[];
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      {/* TOP */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#123b68] text-xl font-bold text-white">
            T
          </div>

          <div>
            <h3 className="font-bold text-slate-900">
              {name}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {location} · {specialization}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-700">
          {status}
        </span>
      </div>

      {/* STATS */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[10px] font-medium text-slate-400">
            COURSES
          </p>

          <p className="mt-1 text-lg font-bold text-[#123b68]">
            {courses}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[10px] font-medium text-slate-400">
            RATING
          </p>

          <p className="mt-1 text-lg font-bold text-[#123b68]">
            ★ {rating}
          </p>
        </div>
      </div>

      {/* SKILLS */}
      <div className="mt-4">
        <p className="text-xs font-semibold text-slate-600">
          Key Skill Areas
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
      <div className="mt-5 flex gap-3">
        <button className="flex-1 rounded-lg border border-[#123b68] py-2.5 text-sm font-semibold text-[#123b68] hover:bg-blue-50">
          View Details
        </button>

        <button className="flex-1 rounded-lg bg-[#123b68] py-2.5 text-sm font-semibold text-white hover:bg-[#0e3155]">
          Explore Courses
        </button>
      </div>
    </div>
  );
}

