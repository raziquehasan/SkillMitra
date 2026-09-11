
"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import EmployerSidebar from "@/components/employer/EmployerSidebar";
import { api } from "@/lib/api";

export default function CandidatesPage() {
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All Locations");
  const [status, setStatus] = useState("All Status");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.employerCandidates();
        setCandidates(response);
      } catch (err) {
        console.error("Failed to load candidates:", err);
        setError("Unable to load candidates. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, []);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        candidate.name?.toLowerCase().includes(searchText) ||
        candidate.education_level?.toLowerCase().includes(searchText) ||
        candidate.current_status?.toLowerCase().includes(searchText);

      // For now, we'll filter by status based on current_status
      const matchesStatus =
        status === "All Status" ||
        candidate.current_status === status;

      return matchesSearch && matchesStatus;
    });
  }, [search, location, status, candidates]);

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
                  Candidates Dashboard
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
                  SkillMitra / Hiring
                </p>

                <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
                  Candidates
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
                  Discover candidates based on skills, job roles,
                  location and employment readiness.
                </p>
              </div>

              <Link
                href="/employer/candidates/matching"
                className="inline-flex items-center justify-center rounded-lg bg-[#123b68] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0e3155]"
              >
                Smart Candidate Matching →
              </Link>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Total Candidates"
                value={candidates.length}
                description="Candidates available"
              />

              <SummaryCard
                title="Active Status"
                value={
                  candidates.filter(
                    (candidate) => candidate.current_status === "Active"
                  ).length
                }
                description="Currently active"
              />

              <SummaryCard
                title="High Match"
                value={
                  candidates.filter(
                    (candidate) => candidate.match_score >= 80
                  ).length
                }
                description="80%+ skill match"
              />

              <SummaryCard
                title="Average Match"
                value={`${Math.round(
                  candidates.length > 0
                    ? candidates.reduce(
                        (total, candidate) => total + candidate.match_score,
                        0
                      ) / candidates.length
                    : 0
                )}%`}
                description="Skill-based matching"
              />
            </div>

            {/* FILTER CARD */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="font-bold text-slate-900">
                  Find Candidates
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Search candidates by name, role or skill.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {/* SEARCH */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                    Search
                  </label>

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, role or skill..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]"
                  />
                </div>

                {/* LOCATION */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                    Location
                  </label>

                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]"
                  >
                    <option>All Locations</option>
                    <option>Pune</option>
                    <option>Mumbai</option>
                    <option>Nashik</option>
                  </select>
                </div>

                {/* STATUS */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                    Candidate Status
                  </label>

                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]"
                  >
                    <option>All Status</option>
                    <option>Job Ready</option>
                    <option>Available</option>
                    <option>Needs Training</option>
                  </select>
                </div>
              </div>
            </div>

            {/* CANDIDATE LIST */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-5 md:flex-row md:items-center">
                <div>
                  <h2 className="font-bold text-slate-900">
                    Candidate Pool
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {filteredCandidates.length} candidates found
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#123b68]">
                  Skill Intelligence
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {loading ? (
                  <div className="p-10 text-center">
                    <p className="text-slate-500">Loading candidates...</p>
                  </div>
                ) : error ? (
                  <div className="p-10 text-center">
                    <p className="text-red-600">{error}</p>
                  </div>
                ) : filteredCandidates.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="font-semibold text-slate-700">
                      No candidates found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Try changing your search or filters.
                    </p>
                  </div>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                    />
                  ))
                )}
              </div>
            </div>

            {/* INFORMATION CARD */}
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
              <h3 className="font-semibold text-[#123b68]">
                Candidate Intelligence
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Candidate matching will use the skills required by
                employer job postings and compare them with candidate
                skill profiles to identify suitable talent and skill gaps.
              </p>

              <Link
                href="/employer/candidates/matching"
                className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline"
              >
                Explore Candidate Matching →
              </Link>
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
   CANDIDATE CARD
============================================================ */

function CandidateCard({
  candidate,
}: {
  candidate: any;
}) {
  return (
    <div className="p-5 transition hover:bg-slate-50">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        {/* PROFILE */}
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#123b68] text-lg font-bold text-white">
            {candidate.name?.charAt(0) || 'C'}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900">
                {candidate.name || 'Unknown Candidate'}
              </h3>

              <StatusBadge status={candidate.current_status || 'Available'} />
            </div>

            <p className="mt-1 text-sm font-medium text-[#123b68]">
              {candidate.education_level || 'Education not specified'}
            </p>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>
                Skills Matched: {candidate.matched_skills_count}/{candidate.total_required_skills}
              </span>

              <span>
                Match Score: {candidate.match_score}%
              </span>
            </div>

            {/* SKILLS */}
            <div className="mt-3 flex flex-wrap gap-2">
              {candidate.skills && candidate.skills.length > 0 ? (
                candidate.skills.slice(0, 3).map((skillId: string, index: number) => (
                  <span
                    key={index}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                  >
                    Skill {index + 1}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No skills specified</span>
              )}
            </div>
          </div>
        </div>

        {/* MATCH + ACTION */}
        <div className="flex shrink-0 items-center gap-5 xl:pl-5">
          <div className="text-center">
            <p className="text-xs text-slate-400">
              Match
            </p>

            <p className="mt-1 text-2xl font-bold text-[#123b68]">
              {candidate.match_score}%
            </p>

            <p className="text-[10px] text-slate-400">
              Skill compatibility
            </p>
          </div>

          <button className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#123b68] hover:bg-blue-50 hover:text-[#123b68]">
            View Profile →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const classes =
    status === "Active" || status === "Job Ready"
      ? "bg-green-50 text-green-700"
      : status === "Available"
      ? "bg-blue-50 text-blue-700"
      : "bg-orange-50 text-orange-700";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${classes}`}
    >
      {status || 'Unknown'}
    </span>
  );
}


