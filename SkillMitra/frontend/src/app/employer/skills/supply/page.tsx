"use client";

import Image from "next/image";
import { useState } from "react";
import EmployerSidebar from "@/components/employer/EmployerSidebar";

const skills = [
  { name: "JavaScript", candidates: 84, ready: 68, percentage: 81 },
  { name: "React", candidates: 72, ready: 54, percentage: 75 },
  { name: "Python", candidates: 61, ready: 45, percentage: 74 },
  { name: "Data Analysis", candidates: 48, ready: 32, percentage: 67 },
  { name: "EV Technology", candidates: 36, ready: 21, percentage: 58 },
  {
    name: "Industrial Automation",
    candidates: 29,
    ready: 18,
    percentage: 62,
  },
];

export default function CandidateSkillSupplyPage() {
  const [district, setDistrict] = useState("Pune");
  const [sector, setSector] = useState("EV / Automotive");

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-slate-800">
      {/* =========================================================
          GOVERNMENT TOP BAR
      ========================================================== */}

      <header className="fixed left-0 right-0 top-0 z-50 h-[72px] bg-[#123b68] text-white">
        <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-6 text-sm">
          {/* LEFT */}
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
                Skills, Employment, Entrepreneurship & Innovation
                Department
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="hidden font-semibold md:block">
            SkillMitra | Employer Intelligence Portal
          </div>
        </div>
      </header>

      {/* ORANGE LINE */}
      <div className="fixed left-0 right-0 top-[72px] z-50 h-1 bg-[#c2410c]" />

      {/* =========================================================
          MAIN APPLICATION
      ========================================================== */}

      <div className="min-h-screen pt-[76px]">
        {/* SHARED SIDEBAR */}
        <EmployerSidebar />

        {/* MAIN CONTENT */}
        <section className="min-w-0 lg:ml-72">
          {/* =====================================================
              SKILLMITRA PAGE HEADER
          ====================================================== */}

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
                  Candidate Skill Supply Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* =====================================================
              PAGE CONTENT
          ====================================================== */}

          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">
            {/* BREADCRUMB */}

            <div className="mb-5 flex items-center gap-2 text-xs text-slate-400">
              <span>Employer</span>
              <span>›</span>
              <span>Skill Intelligence</span>
              <span>›</span>
              <span className="font-medium text-[#123b68]">
                Candidate Skill Supply
              </span>
            </div>

            {/* PAGE HEADING */}

            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="mb-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#123b68]">
                  SKILL INTELLIGENCE
                </div>

                <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                  Candidate Skill Supply
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
                  Understand the availability of skilled candidates
                  and identify the talent pool available for your
                  hiring needs.
                </p>
              </div>

              <button className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                Export Talent Report
              </button>
            </div>

            {/* =====================================================
                FILTERS
            ====================================================== */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5">
                <h2 className="font-bold text-slate-900">
                  Candidate Supply Analysis
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Select a district and sector to analyse
                  available talent.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <SelectBox
                  label="District"
                  value={district}
                  onChange={setDistrict}
                  options={[
                    "Pune",
                    "Mumbai",
                    "Nagpur",
                    "Nashik",
                    "Aurangabad",
                    "Kolhapur",
                  ]}
                />

                <SelectBox
                  label="Sector"
                  value={sector}
                  onChange={setSector}
                  options={[
                    "EV / Automotive",
                    "IT & Software",
                    "Manufacturing",
                    "Healthcare",
                    "Logistics",
                    "Construction",
                  ]}
                />
              </div>
            </div>

            {/* =====================================================
                SUMMARY CARDS
            ====================================================== */}

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Total Candidates"
                value="330"
                description={`Available in ${district}`}
                icon="◉"
              />

              <SummaryCard
                title="Job Ready"
                value="238"
                description="Candidates meeting requirements"
                icon="✓"
              />

              <SummaryCard
                title="Skills Available"
                value="42"
                description="Skills represented in talent pool"
                icon="◇"
              />

              <SummaryCard
                title="Average Readiness"
                value="72%"
                description="Overall candidate readiness"
                icon="↗"
              />
            </div>

            {/* =====================================================
                CANDIDATE SUPPLY OVERVIEW
            ====================================================== */}

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              {/* READINESS */}

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-slate-900">
                    Candidate Readiness
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Distribution of candidates based on their
                    skill readiness.
                  </p>
                </div>

                <div className="space-y-5">
                  <ReadinessBar
                    label="Job Ready"
                    value={72}
                    count="238 candidates"
                  />

                  <ReadinessBar
                    label="Needs Minor Improvement"
                    value={18}
                    count="59 candidates"
                  />

                  <ReadinessBar
                    label="Needs Significant Improvement"
                    value={10}
                    count="33 candidates"
                  />
                </div>

                <div className="mt-6 rounded-lg bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-[#123b68]">
                    Talent Pool Insight
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Most candidates in the selected region show
                    skills that can support current employer
                    hiring requirements.
                  </p>
                </div>
              </div>

              {/* TALENT AVAILABILITY */}

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-slate-900">
                    Talent Availability
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Candidate availability for the selected
                    sector.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <TalentBox
                    title="Entry Level"
                    value="146"
                    description="Candidates"
                  />

                  <TalentBox
                    title="Mid Level"
                    value="118"
                    description="Candidates"
                  />

                  <TalentBox
                    title="Experienced"
                    value="66"
                    description="Candidates"
                  />

                  <TalentBox
                    title="Actively Seeking"
                    value="192"
                    description="Candidates"
                  />
                </div>

                <div className="mt-5 rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">
                      Talent availability
                    </span>

                    <span className="text-sm font-bold text-green-600">
                      Good
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: "74%" }}
                    />
                  </div>

                  <p className="mt-2 text-right text-xs text-slate-400">
                    74% availability index
                  </p>
                </div>
              </div>
            </div>

            {/* =====================================================
                TOP AVAILABLE SKILLS
            ====================================================== */}

            <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5 md:p-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Top Available Skills
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Skills represented among candidates in{" "}
                  {district}.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                      <th className="px-6 py-4">
                        Skill
                      </th>

                      <th className="px-6 py-4">
                        Candidates
                      </th>

                      <th className="px-6 py-4">
                        Job Ready
                      </th>

                      <th className="px-6 py-4">
                        Readiness
                      </th>

                      <th className="px-6 py-4">
                        Availability
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {skills.map((skill) => (
                      <tr
                        key={skill.name}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-6 py-5">
                          <span className="font-semibold text-slate-800">
                            {skill.name}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600">
                          {skill.candidates}
                        </td>

                        <td className="px-6 py-5 text-sm font-medium text-slate-700">
                          {skill.ready}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-[#123b68]"
                                style={{
                                  width: `${skill.percentage}%`,
                                }}
                              />
                            </div>

                            <span className="text-xs font-semibold text-slate-600">
                              {skill.percentage}%
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                            Available
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* =====================================================
                HIRING INSIGHT
            ====================================================== */}

            <div className="mt-6 rounded-xl border border-orange-100 bg-orange-50 p-5 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-xl font-bold text-orange-600 shadow-sm">
                  !
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-orange-800">
                    Hiring Insight
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-orange-700">
                    Candidate supply should be evaluated together
                    with employer demand and skill gaps. Skills with
                    strong candidate availability may support faster
                    hiring, while low-supply skills may require
                    targeted training or broader sourcing.
                  </p>
                </div>

                <button className="rounded-lg bg-[#123b68] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0e3155]">
                  Find Candidates →
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
   COMPONENTS
============================================================ */

function SelectBox({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-500">
        {label}
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

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
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500">
          {title}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-[#123b68]">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function ReadinessBar({
  label,
  value,
  count,
}: {
  label: string;
  value: number;
  count: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          {label}
        </span>

        <span className="text-xs text-slate-500">
          {count}
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[#123b68]"
          style={{ width: `${value}%` }}
        />
      </div>

      <p className="mt-1 text-right text-xs font-semibold text-slate-500">
        {value}%
      </p>
    </div>
  );
}

function TalentBox({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="text-xs text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-[#123b68]">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}