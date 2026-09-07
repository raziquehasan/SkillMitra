
"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";

const jobs = [
  {
    id: 1,
    title: "EV Technician",
    company: "Maharashtra Automotive Systems",
    location: "Pune",
    type: "Full Time",
    experience: "1–3 Years",
    salary: "₹3.5–5.5 LPA",
    skills: ["EV Technology", "Battery Systems", "Vehicle Diagnostics"],
    match: 94,
    posted: "2 days ago",
  },
  {
    id: 2,
    title: "Software Developer",
    company: "Digital Technology Solutions",
    location: "Mumbai",
    type: "Full Time",
    experience: "0–2 Years",
    salary: "₹4–7 LPA",
    skills: ["React", "JavaScript", "SQL"],
    match: 89,
    posted: "3 days ago",
  },
  {
    id: 3,
    title: "Data Analyst",
    company: "Industry Analytics Pvt. Ltd.",
    location: "Nashik",
    type: "Full Time",
    experience: "1–2 Years",
    salary: "₹4–6 LPA",
    skills: ["Python", "SQL", "Data Analysis"],
    match: 84,
    posted: "4 days ago",
  },
  {
    id: 4,
    title: "UI/UX Designer",
    company: "Digital Innovation Studio",
    location: "Mumbai",
    type: "Full Time",
    experience: "0–2 Years",
    salary: "₹3.5–6 LPA",
    skills: ["Figma", "UI Design", "UX Research"],
    match: 78,
    posted: "5 days ago",
  },
  {
    id: 5,
    title: "Cloud Support Associate",
    company: "Technology Services India",
    location: "Pune",
    type: "Full Time",
    experience: "0–2 Years",
    salary: "₹3–5 LPA",
    skills: ["Cloud Computing", "Linux", "Networking"],
    match: 76,
    posted: "1 week ago",
  },
  {
    id: 6,
    title: "Manufacturing Technician",
    company: "Advanced Manufacturing Solutions",
    location: "Nagpur",
    type: "Full Time",
    experience: "1–3 Years",
    salary: "₹3–5 LPA",
    skills: ["Industrial Automation", "Electrical", "Quality Control"],
    match: 73,
    posted: "1 week ago",
  },
];

const locations = ["All Locations", "Pune", "Mumbai", "Nashik", "Nagpur"];
const jobTypes = ["All Types", "Full Time", "Part Time", "Internship"];

export default function FindJobsPage() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All Locations");
  const [jobType, setJobType] = useState("All Types");
  const [minMatch, setMinMatch] = useState("All Matches");

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        job.title.toLowerCase().includes(searchText) ||
        job.company.toLowerCase().includes(searchText) ||
        job.skills.some((skill) =>
          skill.toLowerCase().includes(searchText)
        );

      const matchesLocation =
        location === "All Locations" || job.location === location;

      const matchesType =
        jobType === "All Types" || job.type === jobType;

      const matchesScore =
        minMatch === "All Matches" ||
        (minMatch === "90%+" && job.match >= 90) ||
        (minMatch === "80%+" && job.match >= 80) ||
        (minMatch === "70%+" && job.match >= 70);

      return (
        matchesSearch &&
        matchesLocation &&
        matchesType &&
        matchesScore
      );
    });
  }, [search, location, jobType, minMatch]);

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
                  >
                    {locations.map((item) => (
                      <option key={item}>{item}</option>
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

                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500">
                      ⌕
                    </div>

                    <h3 className="mt-4 font-semibold text-slate-700">
                      No jobs found
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Try changing your search or filters.
                    </p>

                  </div>
                )}

              </div>
            </div>

            {/* Skill Intelligence */}
            <div className="mt-7 grid gap-5 md:grid-cols-3">

              <InfoCard
                title="Profile Match"
                value="82%"
                text="Your current profile is ready for suitable opportunities."
              />

              <InfoCard
                title="Skills Available"
                value="14"
                text="Skills are currently available in your candidate profile."
              />

              <InfoCard
                title="Recommended Jobs"
                value="12"
                text="Jobs have been identified as relevant to your profile."
              />

            </div>

          </div>
        </section>
      </div>
    </main>
  );
}

/* Job Card */

function JobCard({
  job,
}: {
  job: (typeof jobs)[number];
}) {
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
                {job.company}
              </p>
            </div>

            <div className="rounded-lg bg-green-50 px-3 py-2 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-green-600">
                Skill Match
              </p>

              <p className="text-lg font-bold text-green-700">
                {job.match}%
              </p>
            </div>

          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">

            <span>📍 {job.location}</span>
            <span>▣ {job.type}</span>
            <span>◷ {job.experience}</span>
            <span>₹ {job.salary}</span>

          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {job.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600"
              >
                {skill}
              </span>
            ))}
          </div>

          <p className="mt-4 text-[11px] text-slate-400">
            Posted {job.posted}
          </p>

        </div>

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

