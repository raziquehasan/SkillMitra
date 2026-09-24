
"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, MapPin } from "lucide-react";
import { api } from "@/lib/api";

export default function OutcomesPage() {
  const [jobs, setJobs] = useState<
    Awaited<ReturnType<typeof api.jobs>>["items"]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const jobRes = await api.jobs();

        if (cancelled) return;

        setJobs(jobRes.items ?? []);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load jobs:", error);
          setJobs([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const diverseJobs = useMemo(() => {
    if (!jobs.length) return [];

    const seen = new Set<string>();
    const diverse: typeof jobs = [];

    for (const job of jobs) {
      const key = `${
        job.employer_name || job.company_name || "unknown"
      }|${job.title}`;

      if (!seen.has(key)) {
        seen.add(key);
        diverse.push(job);
      }

      if (diverse.length >= 4) break;
    }

    return diverse;
  }, [jobs]);

  return (
    <main className="min-h-screen bg-white">
      <section
        id="outcomes"
        className="border-b border-slate-200 bg-white"
        aria-labelledby="outcomes-heading"
      >
        <div className="mx-auto max-w-7xl px-5 py-5 lg:py-6">

          {/* Section Heading */}
          <div className="pt-1">
            <p className="text-sm font-bold tracking-wide text-[#c2410c]">
              PLACEMENT OUTCOMES
            </p>

            <h1
              id="outcomes-heading"
              className="mt-2 font-serif text-3xl font-semibold text-[#123b68]"
            >
              Measure Whether Training Leads to Employment
            </h1>
          </div>

          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Placement analytics measure whether training leads to employment,
            available through authorised platform views.
          </p>

          <div className="mt-6 border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-600">
              Placement analytics will be displayed as validated outcome data
              becomes available.
            </p>
          </div>

          <h2 className="mt-8 text-xl font-semibold text-[#123b68]">
            Current job postings
          </h2>

          {loading ? (
            <p className="mt-4 text-sm text-slate-600">
              Loading job postings...
            </p>
          ) : diverseJobs.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {diverseJobs.map((job) => (
                <article
                  key={job.id}
                  className="border border-slate-200 bg-white p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Employer
                  </p>

                  <h3 className="mt-1 text-lg font-semibold text-[#123b68]">
                    {job.company_name ||
                      job.employer_name ||
                      "Unknown Company"}
                  </h3>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {job.title}
                  </p>

                  {job.district_name && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                      <MapPin className="h-3 w-3" />
                      {job.district_name}
                    </p>
                  )}

                  {job.skills && job.skills.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Skills
                      </p>

                      <div className="mt-1 flex flex-wrap gap-1">
                        {job.skills.slice(0, 4).map((skill, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700"
                          >
                            {typeof skill === "string"
                              ? skill
                              : String(
                                  (skill as any)?.skill?.name || ""
                                )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(job.job_url ||
                    job.employer_careers_url ||
                    job.employer_website) && (
                    <a
                      href={
                        job.job_url ||
                        job.employer_careers_url ||
                        job.employer_website ||
                        "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#123b68] hover:text-[#0d2d4d]"
                    >
                      View Job
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-600">
              Openings will appear here when job postings exist in the
              employment module.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

