
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
  }, [location]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch = search === "" || 
        job.title?.toLowerCase().includes(search.toLowerCase()) ||
        job.company_name?.toLowerCase().includes(search.toLowerCase());
      
      const matchesLocation = location === "" || job.district_id === location;
      
      const matchesType = jobType === "All Types" || (job.employment_type && job.employment_type === jobType);
      
      const matchesMatch = minMatch === "All Matches" || 
        (job.skill_match_score && job.skill_match_score >= parseInt(minMatch.replace("%", "")));
      
      return matchesSearch && matchesLocation && matchesType && matchesMatch;
    });
  }, [jobs, search, location, jobType, minMatch]);

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
              <div className="font-semibold">Government of Maharashtra</div>
              <div className="text-[11px] text-blue-100">
                Skills, Employment, Entrepreneurship & Innovation Department
              </div>
            </div>
          </div>
          <div className="hidden font-semibold md:block">SkillMitra | Candidate Portal</div>
        </div>
      </header>

      {/* Orange Line */}
      <div className="fixed left-0 right-0 top-[72px] z-50 h-1 bg-[#c2410c]" />

      <div className="min-h-screen pt-[76px]">
        {/* Candidate Sidebar */}
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
                <p className="text-xs text-slate-400">SkillMitra</p>
                <p className="font-semibold text-[#123b68]">Find Jobs</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#123b68]">Find Jobs</h1>
              <p className="mt-1 text-sm text-slate-500">
                Discover job opportunities that match your skills and experience.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="Job title or company..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Location
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">All Locations</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Job Type
                  </label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    {jobTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Minimum Match
                  </label>
                  <select
                    value={minMatch}
                    onChange={(e) => setMinMatch(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="All Matches">All Matches</option>
                    <option value="70">70%+</option>
                    <option value="80">80%+</option>
                    <option value="90">90%+</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Jobs List */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#123b68]">Available Jobs</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""} found
                  </p>
                </div>
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
                      ▣
                    </div>
                    <h3 className="mt-4 font-semibold text-slate-700">No jobs found</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Try adjusting your search filters
                    </p>
                  </div>
                )}
              </div>
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
            // Optionally refresh the jobs list or show success message
            console.log("Application successful");
          }}
        />
      )}
    </main>
  );
}

function JobCard({ job, onViewDetails }: { job: JobPosting; onViewDetails: () => void }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#123b68]">{job.title}</h3>
              <p className="mt-1 text-sm font-medium text-slate-700">{job.company_name}</p>
            </div>
            {job.skill_match_score && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                {job.skill_match_score}% Match
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
            <span>📍 {job.district_name}</span>
            <span>▣ {job.employment_type || 'Full Time'}</span>
            <span>💰 {job.salary_range || 'Competitive'}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {job.required_skills?.slice(0, 4).map((skill: string) => (
              <span
                key={skill}
                className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600"
              >
                {skill}
              </span>
            ))}
            {!job.required_skills && job.skills?.slice(0, 4).map((skill) => {
              const skillName = typeof skill === 'string' ? skill : skill?.skill?.name || 'Unknown';
              return (
                <span
                  key={skillName}
                  className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600"
                >
                  {skillName}
                </span>
              );
            })}
            {job.required_skills && job.required_skills.length > 4 && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
                +{job.required_skills.length - 4} more
              </span>
            )}
            {!job.required_skills && job.skills && job.skills.length > 4 && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 lg:flex-col lg:items-end">
          <button
            onClick={onViewDetails}
            className="rounded-lg border border-[#123b68] px-4 py-2.5 text-xs font-semibold text-[#123b68] transition hover:bg-blue-50"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
