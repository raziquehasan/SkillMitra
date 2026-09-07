"use client";

import Image from "next/image";
import EmployerSidebar from "@/components/employer/EmployerSidebar";

export default function IndustryDemandPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fa] text-slate-800">

      {/* GOVERNMENT TOP BAR */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-[#123b68] text-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3 text-sm">

          <div className="flex items-center gap-3">
            <Image
              src="/maharashtra-gov-logo.png"
              alt="Government of Maharashtra"
              width={42}
              height={42}
              className="h-11 w-11 object-contain"
              priority
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

          <div className="hidden md:block font-semibold">
                 SkillMitra | Employer Intelligence Portal
          </div>

        </div>
      </header>

      {/* ORANGE LINE */}
      <div className="fixed left-0 right-0 top-[72px] z-50 h-1 bg-[#c2410c]" />

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
                  Industrial Intelligence Dashboard
                </p>
              </div>

            </div>
          </div>

          {/* DASHBOARD CONTENT */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">

            {/* PAGE HEADER */}
            <div className="mb-7">
              <p className="text-xs font-semibold text-slate-400">
                SkillMitra / Labour Market Intelligence
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
                Industry Demand
              </h1>

              <p className="mt-2 text-sm text-slate-500 md:text-base">
                Understand current industry demand across districts,
                sectors and job roles.
              </p>
            </div>

            {/* FILTERS */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <h2 className="text-lg font-bold text-slate-900">
                Demand Filters
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-3">

                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                    District
                  </span>

                  <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm">
                    <option>Pune</option>
                    <option>Mumbai</option>
                    <option>Nashik</option>
                    <option>Nagpur</option>
                    <option>Aurangabad</option>
                  </select>
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                    Industry Sector
                  </span>

                  <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm">
                    <option>EV / Automotive</option>
                    <option>IT & Software</option>
                    <option>Manufacturing</option>
                    <option>Healthcare</option>
                  </select>
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                    Job Role
                  </span>

                  <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm">
                    <option>EV Technician</option>
                    <option>Software Developer</option>
                    <option>Data Analyst</option>
                    <option>UI/UX Designer</option>
                  </select>
                </label>

              </div>
            </div>

            {/* DEMAND OVERVIEW */}
            <div className="mt-6 grid gap-6 md:grid-cols-3">

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs text-slate-500">
                  Current Job Demand
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  —
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Openings identified
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs text-slate-500">
                  High-Demand Skills
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  —
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Skills with strong industry demand
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs text-slate-500">
                  Demand Trend
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  —
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Based on available intelligence
                </p>
              </div>

            </div>

            {/* REQUIRED SKILLS */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

              <h2 className="text-lg font-bold text-slate-900">
                Top Required Skills
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Skills currently required by industry.
              </p>

              <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-sm text-slate-500">
                  Skill demand data will appear here from the
                  labour-market intelligence API.
                </p>
              </div>

            </div>

            {/* DEMAND ANALYSIS */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

              <h2 className="text-lg font-bold text-slate-900">
                Demand Analysis
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Industry demand insights for the selected district,
                sector and job role.
              </p>

              <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-sm text-slate-500">
                  Detailed demand analysis will be connected to the
                  backend intelligence API.
                </p>
              </div>

            </div>

          </div>
        </section>
      </div>
    </main>
  );
}