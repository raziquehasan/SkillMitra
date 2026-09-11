
"use client";

import Image from "next/image";
import Link from "next/link";

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const filters = [
  "All Applications",
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview",
  "Rejected",
];

export default function MyApplicationsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All Applications");
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadApplications = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await api.applications();
        setApplications(response);
      } catch (err) {
        console.error("Failed to load applications:", err);
        const errorMessage = err instanceof Error ? err.message : 'Unable to load applications. Please try again.';
        
        // If authentication error, redirect to login
        if (errorMessage.includes('credentials') || errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
          setError('Authentication expired. Please log in again.');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadApplications();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, router]);

  const filteredApplications =
    activeFilter === "All Applications"
      ? applications
      : applications.filter(
          (application) => application.status === activeFilter
        );

  const totalApplications = applications.length;
  const underReview = applications.filter(
    (item) => item.status === "Under Review"
  ).length;
  const shortlisted = applications.filter(
    (item) => item.status === "Shortlisted"
  ).length;
  const interviews = applications.filter(
    (item) => item.status === "Interview"
  ).length;

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
                <p className="text-xs text-slate-400">
                  SkillMitra
                </p>

                <p className="font-semibold text-[#123b68]">
                  My Applications
                </p>
              </div>

            </div>
          </div>

          {/* Main Content */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">

            {/* Intro */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#123b68]">
                My Applications
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Track the jobs you have applied for and monitor the
                progress of your applications.
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <SummaryCard
                title="Total Applications"
                value={String(totalApplications).padStart(2, "0")}
                description="Jobs you have applied for"
              />

              <SummaryCard
                title="Under Review"
                value={String(underReview).padStart(2, "0")}
                description="Applications being reviewed"
              />

              <SummaryCard
                title="Shortlisted"
                value={String(shortlisted).padStart(2, "0")}
                description="Applications shortlisted"
              />

              <SummaryCard
                title="Interviews"
                value={String(interviews).padStart(2, "0")}
                description="Interview opportunities"
              />

            </div>

            {/* Application Status Overview */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">

                <div>
                  <h2 className="font-bold text-[#123b68]">
                    Application Status
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    View and filter your current job applications.
                  </p>
                </div>

                <Link
                  href="/candidate/jobs"
                  className="rounded-lg bg-[#123b68] px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-[#0e3155]"
                >
                  Find More Jobs
                </Link>

              </div>

              {/* Filters */}
              <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">

                {filters.map((filter) => {
                  const isActive = activeFilter === filter;

                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveFilter(filter)}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        isActive
                          ? "bg-[#123b68] text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-[#123b68]"
                      }`}
                    >
                      {filter}
                    </button>
                  );
                })}

              </div>

            </div>

            {/* Applications List */}
            <div className="mt-7">

              <div className="mb-4 flex items-center justify-between">

                <div>
                  <h2 className="text-lg font-bold text-[#123b68]">
                    Applications
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {filteredApplications.length} application
                    {filteredApplications.length !== 1 ? "s" : ""} found.
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-[#123b68]">
                  {activeFilter}
                </span>

              </div>

              <div className="space-y-4">

                {loading ? (
                  <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                    <p className="text-slate-500">Loading applications...</p>
                  </div>
                ) : error ? (
                  <div className="rounded-xl border border-red-200 bg-white px-6 py-12 text-center shadow-sm">
                    <p className="text-red-600">{error}</p>
                  </div>
                ) : filteredApplications.length > 0 ? (
                  filteredApplications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                    />
                  ))
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">

                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500">
                      ▣
                    </div>

                    <h3 className="mt-4 font-semibold text-slate-700">
                      No applications found
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      There are no applications under this status.
                    </p>

                  </div>
                )}

              </div>
            </div>

            {/* Application Journey */}
            <div className="mt-7 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <h2 className="font-bold text-[#123b68]">
                Application Journey
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Understand the typical progress of your job application.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-4">

                <JourneyStep
                  number="01"
                  title="Applied"
                  text="Application submitted"
                />

                <JourneyStep
                  number="02"
                  title="Under Review"
                  text="Employer reviewing profile"
                />

                <JourneyStep
                  number="03"
                  title="Shortlisted"
                  text="Candidate selected for next stage"
                />

                <JourneyStep
                  number="04"
                  title="Interview"
                  text="Interview or further assessment"
                />

              </div>

            </div>

            {/* Candidate Intelligence */}
            <div className="mt-7 grid gap-5 md:grid-cols-2">

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#123b68] shadow-sm">
                    ✦
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#123b68]">
                      Candidate Intelligence
                    </h3>

                    <p className="text-[11px] text-slate-500">
                      Skill-based application insight
                    </p>
                  </div>

                </div>

                <p className="mt-4 text-xs leading-5 text-slate-600">
                  Your applications are matched against job requirements
                  using your current skills and candidate profile.
                </p>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">

                <h3 className="font-semibold text-[#123b68]">
                  Improve Your Opportunities
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Keep your skills and profile updated to discover more
                  relevant opportunities.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">

                  <Link
                    href="/candidate/skills"
                    className="rounded-lg border border-[#123b68] px-3 py-2 text-xs font-semibold text-[#123b68] hover:bg-blue-50"
                  >
                    Update Skills
                  </Link>

                  <Link
                    href="/candidate/profile"
                    className="rounded-lg bg-[#123b68] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0e3155]"
                  >
                    Update Profile
                  </Link>

                </div>

              </div>

            </div>

          </div>
        </section>
      </div>
    </main>
  );
}

/* Summary Card */

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-[#123b68]">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}

/* Application Card */

function ApplicationCard({
  application,
}: {
  application: any;
}) {
  // Format applied date
  const appliedDate = application.applied_at
    ? new Date(application.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Not specified';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-start justify-between gap-3">

            <div>
              <h3 className="text-base font-bold text-[#123b68]">
                {application.job_title || 'Job Title Not Specified'}
              </h3>

              <p className="mt-1 text-sm font-medium text-slate-700">
                {application.job_company_name || 'Company Not Specified'}
              </p>
            </div>

            <ApplicationStatus status={application.status} />

          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">

            <span>📍 {application.job_district_name || 'Location not specified'}</span>

            <span>
              Applied: {appliedDate}
            </span>

          </div>

        </div>

        <div className="flex shrink-0 items-center gap-3 lg:flex-col lg:items-end">

          <button
            type="button"
            className="rounded-lg border border-[#123b68] px-4 py-2.5 text-xs font-semibold text-[#123b68] transition hover:bg-blue-50"
          >
            View Application
          </button>

        </div>

      </div>
    </div>
  );
}

/* Status */

function ApplicationStatus({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
    Applied: "bg-slate-100 text-slate-600",
    "Under Review": "bg-amber-50 text-amber-700",
    Shortlisted: "bg-green-50 text-green-700",
    Interview: "bg-blue-50 text-blue-700",
    Rejected: "bg-red-50 text-red-700",
    PENDING: "bg-slate-100 text-slate-600",
    UNDER_REVIEW: "bg-amber-50 text-amber-700",
    SHORTLISTED: "bg-green-50 text-green-700",
    INTERVIEW: "bg-blue-50 text-blue-700",
    REJECTED: "bg-red-50 text-red-700",
    ACCEPTED: "bg-green-50 text-green-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
        styles[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

/* Journey Step */

function JourneyStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

      <div className="flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#123b68] text-xs font-bold text-white">
          {number}
        </div>

        <h3 className="text-sm font-semibold text-[#123b68]">
          {title}
        </h3>

      </div>

      <p className="mt-3 text-[11px] leading-5 text-slate-500">
        {text}
      </p>

    </div>
  );
}
