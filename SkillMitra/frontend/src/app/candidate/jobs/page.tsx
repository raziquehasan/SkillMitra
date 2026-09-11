
"use client";

import Image from "next/image";
import Link from "next/link";

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';
import { useMemo, useState, useEffect } from "react";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";
import { JobDetailsModal } from "@/components/JobDetailsModal";
import { api, type JobPosting } from "@/lib/api";

const jobTypes = ["All Types", "Full Time", "Part Time", "Internship"];

export default function FindJobsPage() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState<string>("");
  const [jobType, setJobType] = useState("All Types");
  const [minMatch, setMinMatch] = useState("All Matches");
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [districts, setDistricts] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load districts and jobs in parallel
        const [districtsData, jobsData] = await Promise.all([
          api.districts(),
          api.jobs(location ? { district_id: location } : {})
        ]);
        
        setDistricts(districtsData);
        setJobs(jobsData.items);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Unable to load jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Reload jobs when location or search filter changes
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.jobs({
          district_id: location || undefined,
          search: search || undefined
        });
        setJobs(response.items);
      } catch (err) {
        console.error("Failed to load jobs:", err);
        setError("Unable to load jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (districts.length > 0) {
      loadJobs();
    }
  }, [location, search]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Location and search filtering is now done at API level
      // For now, filter by status only since job_type isn't in the schema
      const matchesType =
        jobType === "All Types" || job.status === jobType;

      // Since we don't have match scores from the API yet, show all jobs
      const matchesScore = true;

      return matchesType && matchesScore;
    });
  }, [jobType, minMatch, jobs]);

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
                  Find Jobs
                </p>
              </div>

            </div>
          </div>

          {/* Main Content */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">

            {/* Intro */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#123b68]">
                Find Jobs
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Discover suitable job opportunities based on your skills,
                experience and career preferences.
              </p>
            </div>

            {/* Search Section */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="grid gap-4 lg:grid-cols-[1fr_200px_180px_180px]">

                {/* Search */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Search Jobs
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                      ⌕
                    </span>

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search job title, company or skill..."
                      className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Location
                  </label>

                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#123b68]"
                    disabled={loading}
                  >
                    <option value="">All Locations</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Job Type */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Job Type
                  </label>

                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#123b68]"
                  >
                    {jobTypes.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>

                {/* Match */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Skill Match
                  </label>

                  <select
                    value={minMatch}
                    onChange={(e) => setMinMatch(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-[#123b68]"
                  >
                    <option>All Matches</option>
                    <option>90%+</option>
                    <option>80%+</option>
                    <option>70%+</option>
                  </select>
                </div>

              </div>

              {/* Search Info */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">

                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-[#123b68]">
                    {filteredJobs.length}
                  </span>{" "}
                  suitable opportunities
                </p>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-[#123b68]">
                  Skill-based Job Discovery
                </span>

              </div>
            </div>

            {/* Recommended Banner */}
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">

              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-[#123b68] shadow-sm">
                      ✦
                    </span>

                    <h2 className="font-semibold text-[#123b68]">
                      Jobs Matched to Your Skills
                    </h2>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    SkillMitra recommends opportunities based on your
                    current skills, experience and job requirements.
                  </p>
                </div>

                <Link
                  href="/candidate/recommended-jobs"
                  className="rounded-lg bg-[#123b68] px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-[#0e3155]"
                >
                  View Recommended Jobs
                </Link>

              </div>
            </div>

            {/* Job Listings */}
            <div className="mt-7">

              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#123b68]">
                    Available Opportunities
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Explore jobs currently relevant to your profile.
                  </p>
                </div>

                <span className="text-xs font-medium text-slate-500">
                  {filteredJobs.length} Jobs
                </span>
              </div>

              <div className="space-y-4">

                {loading ? (
                  <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                    <p className="text-slate-500">Loading jobs...</p>
                  </div>
                ) : error ? (
                  <div className="rounded-xl border border-red-200 bg-white px-6 py-12 text-center shadow-sm">
                    <p className="text-red-600">{error}</p>
                  </div>
                ) : filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      onViewDetails={() => setSelectedJob(job)}
                    />
                  ))
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500">
                      ⌕
                    </div>

                    <h3 className="mt-4 font-semibold text-slate-700">
                      {location ? "No jobs available for this district" : "No jobs found"}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {location 
                        ? "Try selecting a different location or check back later."
                        : "Try changing your search or filters."
                      }
                    </p>

                  </div>
                )}

              </div>
            </div>

            {/* Skill Intelligence */}
            <div className="mt-7 grid gap-5 md:grid-cols-3">

              <InfoCard
                title="Available Jobs"
                value={String(jobs.length)}
                text="Total job opportunities available in the system."
              />

              <InfoCard
                title="Filtered Results"
                value={String(filteredJobs.length)}
                text="Jobs matching your current search criteria."
              />

              <InfoCard
                title="Job Status"
                value="Active"
                text="Showing active and open job postings."
              />

            </div>

          </div>
        </section>
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApplySuccess={() => {
            // Refresh applications list if needed
            setSelectedJob(null);
          }}
        />
      )}
    </main>
  );
}

/* Job Card */

function JobCard({
  job,
  onViewDetails,
}: {
  job: JobPosting;
  onViewDetails: () => void;
}) {
  // Extract skill names from the job posting
  const skillNames = job.skills.map(skill =>
    typeof skill === 'string' ? skill : (skill as any)?.skill?.name || ''
  ).filter(Boolean);

  // Format posted date
  const postedDate = job.posted_date
    ? new Date(job.posted_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : 'Recently';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-start justify-between gap-3">

            <div>
              <h3 className="text-base font-bold text-[#123b68]">
                {job.title}
              </h3>

              <p className="mt-1 text-sm font-medium text-slate-700">
                {job.company_name || job.employer_name || 'Company'}
              </p>
            </div>

            <div className="rounded-lg bg-green-50 px-3 py-2 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-green-600">
                Status
              </p>

              <p className="text-lg font-bold text-green-700">
                {job.status}
              </p>
            </div>

          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">

            <span>📍 {job.district_name || 'Location not specified'}</span>
            <span>▣ {job.job_role_title || 'Role not specified'}</span>
            <span>Posted: {postedDate}</span>

          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {skillNames.length > 0 ? (
              skillNames.map((skill, index) => (
                <span
                  key={index}
                  className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">No skills specified</span>
            )}
          </div>

        </div>

        <div className="flex shrink-0 gap-2 lg:flex-col">

          <button
            type="button"
            onClick={onViewDetails}
            className="rounded-lg border border-[#123b68] px-4 py-2.5 text-xs font-semibold text-[#123b68] transition hover:bg-blue-50"
          >
            View Details
          </button>

          <button
            type="button"
            onClick={onViewDetails}
            className="rounded-lg bg-[#123b68] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0e3155]"
          >
            Apply Now
          </button>

        </div>

      </div>
    </div>
  );
}

/* Info Card */

function InfoCard({
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

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {text}
      </p>

    </div>
  );
}

