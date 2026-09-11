
"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

const skillsData = [
  {
    skill: "EV Battery Technology",
    sector: "EV / Automotive",
    demand: "Very High",
    availability: "Low",
    gap: "Critical",
    required: 720,
    available: 390,
  },
  {
    skill: "Electric Vehicle Diagnostics",
    sector: "EV / Automotive",
    demand: "High",
    availability: "Medium",
    gap: "High",
    required: 580,
    available: 410,
  },
  {
    skill: "Industrial Automation",
    sector: "Manufacturing",
    demand: "High",
    availability: "Medium",
    gap: "High",
    required: 640,
    available: 450,
  },
  {
    skill: "Artificial Intelligence",
    sector: "IT / Technology",
    demand: "Very High",
    availability: "Low",
    gap: "Critical",
    required: 690,
    available: 360,
  },
  {
    skill: "Machine Learning",
    sector: "IT / Technology",
    demand: "High",
    availability: "Low",
    gap: "Critical",
    required: 520,
    available: 310,
  },
  {
    skill: "Industrial IoT",
    sector: "Manufacturing",
    demand: "Medium",
    availability: "Medium",
    gap: "High",
    required: 430,
    available: 320,
  },
];

const sectorData = [
  {
    sector: "EV / Automotive",
    topSkill: "EV Battery Technology",
    demand: "Very High",
    skills: 8,
    gap: "Critical",
  },
  {
    sector: "IT / Technology",
    topSkill: "Artificial Intelligence",
    demand: "Very High",
    skills: 10,
    gap: "Critical",
  },
  {
    sector: "Manufacturing",
    topSkill: "Industrial Automation",
    demand: "High",
    skills: 7,
    gap: "High",
  },
];

const trainingData = [
  {
    title: "EV Battery & Diagnostics",
    duration: "6 Months",
    demand: "Very High",
    learners: 320,
  },
  {
    title: "Artificial Intelligence & ML",
    duration: "8 Months",
    demand: "Very High",
    learners: 280,
  },
  {
    title: "Industrial Automation",
    duration: "6 Months",
    demand: "High",
    learners: 240,
  },
];

export default function RequiredSkillsPage() {

      const router = useRouter();
  const [selectedSector, setSelectedSector] =
    useState("EV / Automotive");

  const filteredSkills = skillsData.filter(
    (item) => item.sector === selectedSector
  );

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-slate-800">

      {/* ================= GOVERNMENT HEADER ================= */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-[#123b68] text-white">
        <div className="flex min-h-[60px] items-center justify-between px-6">

          <div className="flex items-center gap-3">

            <div className="relative h-10 w-10 shrink-0">
              <Image
                src="/government-logo.png"
                alt="Government of Maharashtra"
                fill
                priority
                className="object-contain"
              />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Government of Maharashtra
              </p>

              <p className="text-[10px] text-blue-100">
                Skills, Employment, Entrepreneurship & Innovation Department
              </p>
            </div>

          </div>

          <div className="flex items-center gap-6">

            <span className="hidden text-sm font-medium md:block">
              SkillMitra Industry Portal
            </span>

            <button 
               onClick={() => router.push("/login")}
            className="rounded-md border border-white/30 px-4 py-2 text-sm hover:bg-white/10">
              Logout
            </button>

          </div>

        </div>
      </header>

      {/* ================= ORANGE LINE ================= */}
      <div className="fixed left-0 right-0 top-[60px] z-50 h-1 bg-[#c2410c]" />

      {/* ================= MAIN LAYOUT ================= */}
      <div className="flex min-h-screen pt-[65px]">

        {/* ================= SIDEBAR ================= */}
        <aside className="fixed bottom-0 left-0 top-[65px] z-20 hidden w-72 overflow-y-auto border-r border-slate-200 bg-white lg:block">

          {/* Sidebar Branding */}
          <div className="flex h-28 items-center gap-3 border-b border-slate-200 px-7">

            <div className="relative h-14 w-14 shrink-0">
              <Image
                src="/skillmitra-logo.png"
                alt="SkillMitra"
                fill
                className="object-contain"
              />
            </div>

            <div>
              <h1 className="text-xl font-bold text-[#123b68]">
                SkillMitra
              </h1>

              <p className="text-xs text-slate-500">
                Industry Portal
              </p>
            </div>

          </div>

          {/* Sidebar Navigation */}
          <nav className="p-4">

            {/* INDUSTRY INTELLIGENCE */}
            <div className="mb-6">

              <p className="mb-3 px-3 text-[11px] font-bold tracking-wider text-slate-400">
                INDUSTRY INTELLIGENCE
              </p>

              <div className="space-y-1">

                <a
                  href="/industry"
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Dashboard
                </a>

                <a
                  href="/industry/demand"
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Industry Demand
                </a>

                <a
                  href="/industry/skills"
                  className="flex items-center rounded-lg bg-[#123b68] px-3 py-2.5 text-sm font-medium text-white"
                >
                  Required Skills
                </a>

                <a
                  href="/industry/workforce"
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Workforce Gap
                </a>

                <a
                  href="/industry/roles"
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Emerging Job Roles
                </a>

                <a
                  href="/industry/trends"
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Skill Trends
                </a>

              </div>

            </div>

            {/* INDUSTRY REQUIREMENTS */}
            <div>

              <p className="mb-3 px-3 text-[11px] font-bold tracking-wider text-slate-400">
                INDUSTRY REQUIREMENTS
              </p>

              <div className="space-y-1">

                <a
                  href="/industry/requirements"
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Workforce Requirements
                </a>

                <a
                  href="/industry/profile"
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Industry Profile
                </a>

                <a
                  href="/industry/settings"
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Settings
                </a>

              </div>

            </div>

          </nav>

        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <section className="min-w-0 flex-1 lg:ml-72">

          <div className="space-y-7 p-6 lg:p-10">

            {/* ================= INTRO ================= */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <p className="text-xs font-bold uppercase tracking-wider text-[#c2410c]">
                INDUSTRY → GOVERNMENT
              </p>

              <h1 className="mt-2 text-2xl font-bold text-[#123b68]">
                What skills does the industry need?
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Industries can identify the technical and emerging skills
                required for current and future jobs. This information helps
                government and training institutes plan relevant skill
                development programs.
              </p>

            </section>

            {/* ================= KPI CARDS ================= */}
            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm text-slate-500">
                  Total Required Skills
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  25
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Across major sectors
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm text-slate-500">
                  Critical Skills
                </p>

                <p className="mt-2 text-3xl font-bold text-[#c2410c]">
                  8
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Immediate industry need
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm text-slate-500">
                  High Demand Skills
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  12
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Growing workforce requirement
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <p className="text-sm text-slate-500">
                  Training Priority
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  High
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Government action required
                </p>

              </div>

            </section>

            {/* ================= SECTOR FILTER ================= */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

                <div>
                  <h2 className="text-lg font-bold text-[#123b68]">
                    Required Skills by Sector
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Select a sector to view its most important workforce skills.
                  </p>
                </div>

                <div>

                  <label className="mb-2 block text-xs font-semibold text-slate-500">
                    SECTOR
                  </label>

                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-[#123b68]"
                  >
                    <option>EV / Automotive</option>
                    <option>IT / Technology</option>
                    <option>Manufacturing</option>
                  </select>

                </div>

              </div>

            </section>

            {/* ================= SKILLS TABLE ================= */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 px-6 py-5">

                <h2 className="text-lg font-bold text-[#123b68]">
                  Industry Skill Requirements
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current skill demand and availability reported as sample
                  industry data.
                </p>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[800px] text-left text-sm">

                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">

                    <tr>

                      <th className="px-6 py-4">
                        Skill
                      </th>

                      <th className="px-6 py-4">
                        Demand
                      </th>

                      <th className="px-6 py-4">
                        Required
                      </th>

                      <th className="px-6 py-4">
                        Available
                      </th>

                      <th className="px-6 py-4">
                        Skill Gap
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredSkills.map((item) => (

                      <tr
                        key={item.skill}
                        className="hover:bg-slate-50"
                      >

                        <td className="px-6 py-4">

                          <p className="font-semibold text-slate-800">
                            {item.skill}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {item.sector}
                          </p>

                        </td>

                        <td className="px-6 py-4">

                          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#c2410c]">
                            {item.demand}
                          </span>

                        </td>

                        <td className="px-6 py-4 font-medium text-slate-700">
                          {item.required}
                        </td>

                        <td className="px-6 py-4 font-medium text-slate-700">
                          {item.available}
                        </td>

                        <td className="px-6 py-4">

                          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                            {item.gap}
                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </section>

            {/* ================= SECTOR SKILL SUMMARY ================= */}
            <section>

              <div className="mb-4">

                <h2 className="text-xl font-bold text-[#123b68]">
                  Sector-wise Skill Priorities
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Skills that industries are expected to require the most.
                </p>

              </div>

              <div className="grid gap-5 lg:grid-cols-3">

                {sectorData.map((item) => (

                  <div
                    key={item.sector}
                    className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                  >

                    <p className="text-sm font-semibold text-[#c2410c]">
                      {item.sector}
                    </p>

                    <h3 className="mt-3 text-lg font-bold text-[#123b68]">
                      {item.topSkill}
                    </h3>

                    <div className="mt-5 space-y-3">

                      <div className="flex items-center justify-between text-sm">

                        <span className="text-slate-500">
                          Demand
                        </span>

                        <span className="font-semibold text-slate-700">
                          {item.demand}
                        </span>

                      </div>

                      <div className="flex items-center justify-between text-sm">

                        <span className="text-slate-500">
                          Skills Identified
                        </span>

                        <span className="font-semibold text-slate-700">
                          {item.skills}
                        </span>

                      </div>

                      <div className="flex items-center justify-between text-sm">

                        <span className="text-slate-500">
                          Skill Gap
                        </span>

                        <span className="font-semibold text-red-600">
                          {item.gap}
                        </span>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </section>

            {/* ================= TRAINING PRIORITIES ================= */}
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-5">

                <h2 className="text-lg font-bold text-[#123b68]">
                  Recommended Training Priorities
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Training areas that can help reduce the identified industry
                  skill gaps.
                </p>

              </div>

              <div className="grid gap-4 md:grid-cols-3">

                {trainingData.map((item) => (

                  <div
                    key={item.title}
                    className="rounded-lg border border-slate-200 p-5"
                  >

                    <h3 className="font-semibold text-slate-800">
                      {item.title}
                    </h3>

                    <div className="mt-4 space-y-2 text-sm">

                      <div className="flex justify-between">

                        <span className="text-slate-500">
                          Duration
                        </span>

                        <span className="font-medium">
                          {item.duration}
                        </span>

                      </div>

                      <div className="flex justify-between">

                        <span className="text-slate-500">
                          Industry Demand
                        </span>

                        <span className="font-medium text-[#c2410c]">
                          {item.demand}
                        </span>

                      </div>

                      <div className="flex justify-between">

                        <span className="text-slate-500">
                          Target Learners
                        </span>

                        <span className="font-medium">
                          {item.learners}
                        </span>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </section>

            {/* ================= GOVERNMENT INPUT ================= */}
            <section className="rounded-xl bg-[#123b68] p-6 text-white shadow-sm">

              <p className="text-xs font-bold uppercase tracking-wider text-orange-200">
                INDUSTRY → GOVERNMENT
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Skill Development Input
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100">
                Industry skill requirements can help government departments
                design targeted training programs, update course curriculum,
                improve placement opportunities and prepare candidates for
                future jobs.
              </p>

            </section>

          </div>

        </section>

      </div>

    </main>
  );
}

