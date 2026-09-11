
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import EmployerSidebar from "@/components/employer/EmployerSidebar";

type MatchingCandidate = {
  id: number;
  name: string;
  role: string;
  location: string;
  experience: string;
  matchedSkills: string[];
  missingSkills: string[];
  match: number;
  status: "Strong Match" | "Good Match" | "Partial Match";
};

const matchingCandidates: MatchingCandidate[] = [
  {
    id: 1,
    name: "Aarav Patil",
    role: "EV Technician",
    location: "Pune",
    experience: "2 Years",
    matchedSkills: ["EV Systems", "Battery", "Diagnostics"],
    missingSkills: [],
    match: 94,
    status: "Strong Match",
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "Software Developer",
    location: "Pune",
    experience: "1 Year",
    matchedSkills: ["React", "JavaScript", "SQL"],
    missingSkills: ["TypeScript"],
    match: 89,
    status: "Strong Match",
  },
  {
    id: 3,
    name: "Rahul Deshmukh",
    role: "Data Analyst",
    location: "Nashik",
    experience: "2 Years",
    matchedSkills: ["Python", "SQL", "Power BI"],
    missingSkills: ["Advanced Excel"],
    match: 82,
    status: "Good Match",
  },
  {
    id: 4,
    name: "Sneha Kulkarni",
    role: "UI/UX Designer",
    location: "Mumbai",
    experience: "1 Year",
    matchedSkills: ["Figma", "UI Design"],
    missingSkills: ["UX Research", "Design Systems"],
    match: 76,
    status: "Partial Match",
  },
];

const jobRequirements = {
  "EV Technician": [
    "EV Systems",
    "Battery Technology",
    "Vehicle Diagnostics",
    "Electrical Systems",
  ],
  "Software Developer": [
    "React",
    "JavaScript",
    "TypeScript",
    "SQL",
  ],
  "Data Analyst": [
    "Python",
    "SQL",
    "Power BI",
    "Advanced Excel",
  ],
  "UI/UX Designer": [
    "Figma",
    "UI Design",
    "UX Research",
    "Design Systems",
  ],
};

export default function CandidateMatchingPage() {
  const [selectedJob, setSelectedJob] =
    useState("EV Technician");

  const [location, setLocation] =
    useState("All Locations");

  const requirements =
    jobRequirements[selectedJob as keyof typeof jobRequirements];

  const filteredCandidates = useMemo(() => {
    return matchingCandidates
      .filter((candidate) => {
        const locationMatch =
          location === "All Locations" ||
          candidate.location === location;

        return locationMatch;
      })
      .sort((a, b) => b.match - a.match);
  }, [location]);

  const averageMatch =
    filteredCandidates.length > 0
      ? Math.round(
          filteredCandidates.reduce(
            (total, candidate) => total + candidate.match,
            0
          ) / filteredCandidates.length
        )
      : 0;

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

      {/* PAGE LAYOUT */}
      <div className="min-h-screen pt-[76px]">
        {/* EMPLOYER SIDEBAR */}
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
                  Candidate Matching Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* PAGE CONTENT */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">
            {/* PAGE HEADER */}
            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  SkillMitra / Hiring Intelligence
                </p>

                <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
                  Candidate Matching
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
                  Identify candidates whose skills and experience
                  best match your job requirements.
                </p>
              </div>

              <Link
                href="/employer/candidates"
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-[#123b68] hover:bg-blue-50 hover:text-[#123b68]"
              >
                ← Candidate Pool
              </Link>
            </div>

            {/* JOB MATCHING CONTROL */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Find Best-Matching Candidates
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select a job role to compare required skills
                  with candidate skill profiles.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* JOB ROLE */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                    Job Role
                  </label>

                  <select
                    value={selectedJob}
                    onChange={(e) =>
                      setSelectedJob(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]"
                  >
                    {Object.keys(jobRequirements).map(
                      (job) => (
                        <option key={job} value={job}>
                          {job}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* LOCATION */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                    Candidate Location
                  </label>

                  <select
                    value={location}
                    onChange={(e) =>
                      setLocation(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]"
                  >
                    <option>All Locations</option>
                    <option>Pune</option>
                    <option>Mumbai</option>
                    <option>Nashik</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SELECTED JOB REQUIREMENTS */}
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5 md:p-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Selected Job
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-[#123b68]">
                    {selectedJob}
                  </h2>

                  <p className="mt-1 text-sm text-slate-600">
                    Skills required for successful job matching.
                  </p>
                </div>

                <div className="rounded-lg bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs text-slate-400">
                    Required Skills
                  </p>

                  <p className="mt-1 text-xl font-bold text-[#123b68]">
                    {requirements.length}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {requirements.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#123b68]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* MATCHING SUMMARY */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Candidates Analysed"
                value={filteredCandidates.length}
                description="Profiles evaluated"
              />

              <MetricCard
                title="Strong Matches"
                value={
                  filteredCandidates.filter(
                    (candidate) =>
                      candidate.status === "Strong Match"
                  ).length
                }
                description="High compatibility"
              />

              <MetricCard
                title="Average Match"
                value={`${averageMatch}%`}
                description="Across candidates"
              />

              <MetricCard
                title="Skill Gaps"
                value={
                  filteredCandidates.filter(
                    (candidate) =>
                      candidate.missingSkills.length > 0
                  ).length
                }
                description="Candidates needing training"
              />
            </div>

            {/* MATCHING RESULTS */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-5 md:flex-row md:items-center">
                <div>
                  <h2 className="font-bold text-slate-900">
                    Matching Results
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Candidates ranked by skill compatibility.
                  </p>
                </div>

                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  Skill-Based Matching
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredCandidates.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="font-semibold text-slate-700">
                      No candidates found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Try selecting another location.
                    </p>
                  </div>
                ) : (
                  filteredCandidates.map(
                    (candidate, index) => (
                      <MatchingCandidateCard
                        key={candidate.id}
                        candidate={candidate}
                        rank={index + 1}
                      />
                    )
                  )
                )}
              </div>
            </div>

            {/* HOW MATCHING WORKS */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <h2 className="text-lg font-bold text-slate-900">
                How Candidate Matching Works
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                SkillMitra compares employer requirements with
                candidate profiles to support better hiring decisions.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <ProcessCard
                  number="01"
                  title="Job Requirements"
                  description="Identify the skills and requirements needed for the selected job role."
                />

                <ProcessCard
                  number="02"
                  title="Skill Comparison"
                  description="Compare required skills with skills available in candidate profiles."
                />

                <ProcessCard
                  number="03"
                  title="Match & Skill Gap"
                  description="Rank candidates and highlight missing skills that may require training."
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ============================================================
   METRIC CARD
============================================================ */

function MetricCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold text-[#123b68]">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* ============================================================
   MATCHING CANDIDATE CARD
============================================================ */

function MatchingCandidateCard({
  candidate,
  rank,
}: {
  candidate: MatchingCandidate;
  rank: number;
}) {
  const statusClasses =
    candidate.status === "Strong Match"
      ? "bg-green-50 text-green-700"
      : candidate.status === "Good Match"
      ? "bg-blue-50 text-blue-700"
      : "bg-orange-50 text-orange-700";

  return (
    <div className="p-5 transition hover:bg-slate-50 md:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
        {/* RANK */}
        <div className="flex items-center gap-4 xl:w-16">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
            #{rank}
          </div>
        </div>

        {/* PROFILE */}
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#123b68] text-lg font-bold text-white">
            {candidate.name.charAt(0)}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900">
                {candidate.name}
              </h3>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClasses}`}
              >
                {candidate.status}
              </span>
            </div>

            <p className="mt-1 text-sm font-medium text-[#123b68]">
              {candidate.role}
            </p>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>
                Location: {candidate.location}
              </span>

              <span>
                Experience: {candidate.experience}
              </span>
            </div>

            {/* MATCHED SKILLS */}
            <div className="mt-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Matched Skills
              </p>

              <div className="flex flex-wrap gap-2">
                {candidate.matchedSkills.map(
                  (skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
                    >
                      ✓ {skill}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* MISSING SKILLS */}
            {candidate.missingSkills.length > 0 && (
              <div className="mt-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Skill Gaps
                </p>

                <div className="flex flex-wrap gap-2">
                  {candidate.missingSkills.map(
                    (skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700"
                      >
                        + {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MATCH */}
        <div className="flex items-center justify-between gap-5 border-t border-slate-100 pt-4 xl:w-64 xl:border-t-0 xl:pt-0">
          <div className="min-w-32">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500">
                Match Score
              </p>

              <p className="text-sm font-bold text-[#123b68]">
                {candidate.match}%
              </p>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#123b68]"
                style={{
                  width: `${candidate.match}%`,
                }}
              />
            </div>
          </div>

          <button className="shrink-0 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#123b68] hover:bg-blue-50 hover:text-[#123b68]">
            View →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PROCESS CARD
============================================================ */

function ProcessCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-[#123b68]">
        {number}
      </div>

      <h3 className="mt-4 font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

