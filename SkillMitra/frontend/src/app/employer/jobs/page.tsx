"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import EmployerSidebar from "@/components/employer/EmployerSidebar";
import { api, type JobPosting } from "@/lib/api";

export default function MyJobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      try {
        const response = await api.jobs();
        setJobs(response.items ?? []);
      } catch (error) {
        console.error("Failed to load jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, []);

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
            SkillMitra | Industry Portal
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
                  My Jobs Dashboard
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
                  My Jobs
                </h1>

                <p className="mt-2 text-sm text-slate-500 md:text-base">
                  Manage your job postings and monitor your hiring activity.
                </p>
              </div>

              <Link
                href="/employer/jobs/new"
                className="rounded-lg bg-[#123b68] px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#0e3155]"
              >
                + Post a Job
              </Link>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* TOTAL JOB POSTINGS */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  Total Job Postings
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  {loading ? "..." : jobs.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Jobs posted through SkillMitra
                </p>
              </div>

              {/* ACTIVE JOBS */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  Active Jobs
                </p>

                <p className="mt-2 text-3xl font-bold text-green-600">
                  {loading ? "..." : jobs.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Currently available postings
                </p>
              </div>

              {/* APPLICATIONS */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">
                  Candidate Applications
                </p>

                <p className="mt-2 text-3xl font-bold text-[#123b68]">
                  —
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Application intelligence will be connected later
                </p>
              </div>
            </div>

            {/* JOBS LIST */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Job Postings
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Your current hiring requirements.
                </p>
              </div>

              {/* LOADING */}
              {loading ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-sm text-slate-500">
                    Loading job postings...
                  </p>
                </div>
              ) : jobs.length === 0 ? (
                /* EMPTY STATE */
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="font-semibold text-slate-700">
                    No job postings found
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Your job postings will appear here.
                  </p>

                  <Link
                    href="/employer/jobs/new"
                    className="mt-4 inline-block rounded-lg bg-[#123b68] px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    + Post Your First Job
                  </Link>
                </div>
              ) : (
                /* JOBS */
                <div className="space-y-3">
                  {jobs.map((job: any, index) => (
                    <div
                      key={job.id ?? index}
                      className="rounded-xl border border-slate-200 p-5 transition hover:border-blue-200 hover:bg-slate-50"
                    >
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        {/* JOB INFORMATION */}
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-900">
                              {job.title ||
                                job.job_title ||
                                "Job Posting"}
                            </h3>

                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                              Active
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-slate-500">
                            {job.location || "Location not specified"}
                          </p>

                          {job.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                              {job.description}
                            </p>
                          )}
                        </div>

                        {/* ACTIONS */}
                        <div className="flex items-center gap-3">
                          <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white">
                            View
                          </button>

                          <button className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50">
                            Manage
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}