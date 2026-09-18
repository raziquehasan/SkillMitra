
"use client";

import Image from "next/image";
import Link from "next/link";

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';
import { useState, useEffect } from "react";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";
import { api } from "@/lib/api";

export default function RecommendedJobsPage() {
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobRole, setSelectedJobRole] = useState<string | null>(null);
  const [jobRoles, setJobRoles] = useState<any[]>([]);
  const [hasSkills, setHasSkills] = useState<boolean | null>(null);

  useEffect(() => {
    const loadJobRoles = async () => {
      try {
        const response = await api.jobRoles();
        setJobRoles(response);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load job roles:", err);
        setError("Unable to load job roles. Please try again.");
        setLoading(false);
      }
    };

    // Check if user has skills and load recommendations if yes
    const checkSkillsAndLoadRecommendations = async () => {
      try {
        const skills = await api.candidateSkills();
        setHasSkills(skills.length > 0);
        
        // Load skill-based job recommendations if user has skills
        if (skills.length > 0) {
          const jobRecData = await api.candidateJobRecommendations().catch(() => null);
          if (jobRecData && jobRecData.recommended_jobs && jobRecData.recommended_jobs.length > 0) {
            setRecommendation({
              demand: null,
              required_skills: [],
              recommended_courses: [],
              recommended_jobs: jobRecData.recommended_jobs,
              reason: jobRecData.reason
            });
          }
        }
      } catch (err) {
        console.error("Failed to check skills:", err);
        setHasSkills(false);
      }
    };

    loadJobRoles();
    checkSkillsAndLoadRecommendations();
  }, []);

  const loadRecommendations = async (jobRoleId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Try job recommendations based on skills first
      const jobRecData = await api.candidateJobRecommendations().catch(() => null);
      
      if (jobRecData && jobRecData.recommended_jobs && jobRecData.recommended_jobs.length > 0) {
        setRecommendation({
          demand: null,
          required_skills: [],
          recommended_courses: [],
          recommended_jobs: jobRecData.recommended_jobs,
          reason: jobRecData.reason
        });
        setSelectedJobRole(jobRoleId);
        setLoading(false);
        return;
      }
      
      // Fallback to career recommendation if no skill-based recommendations
      const response = await api.careerRecommendation({
        job_role_id: jobRoleId,
      });
      
      if (response.message && !response.demand) {
        setError(response.message);
        setRecommendation(null);
      } else if (response.demand) {
        setRecommendation(response);
        setSelectedJobRole(jobRoleId);
      } else {
        setError("No valid recommendations available for this job role.");
        setRecommendation(null);
      }
    } catch (err) {
      console.error("Failed to load recommendations:", err);
      setError("Unable to load recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
                  Recommended Jobs
                </p>

              </div>

            </div>

          </div>

          {/* Main Content */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">

            {/* Intro */}
            <div className="mb-6">

              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

                <div>

                  <h1 className="text-2xl font-bold text-[#123b68]">
                    Recommended Jobs
                  </h1>

                  <p className="mt-1 max-w-2xl text-sm text-slate-500">
                    Explore job opportunities recommended for you based on
                    your skills, experience and candidate profile.
                  </p>

                </div>

                <Link
                  href="/candidate/jobs"
                  className="rounded-lg bg-[#123b68] px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-[#0e3155]"
                >
                  Find All Jobs
                </Link>

              </div>

            </div>

            {/* Job Role Selection */}
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="font-bold text-slate-900">
                  Select Job Role for Recommendations
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Choose a job role to see personalized job recommendations based on your skills.
                </p>
              </div>

              {loading && !selectedJobRole ? (
                <p className="text-slate-500">Loading job roles...</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-3">
                  {jobRoles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => loadRecommendations(role.id)}
                      className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
                        selectedJobRole === role.id
                          ? "border-[#123b68] bg-blue-50 text-[#123b68]"
                          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-[#123b68]"
                      }`}
                    >
                      <div className="font-semibold">{role.title}</div>
                      {role.description && (
                        <div className="mt-1 text-xs text-slate-500 line-clamp-2">
                          {role.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* No Skills Empty State */}
            {hasSkills === false && (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-600">
                      🎯
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-amber-900">
                        Add Your Skills First
                      </h2>
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-amber-800">
                        To get personalized job recommendations, you need to add your current skills to your profile. 
                        This helps us match you with opportunities that align with your actual capabilities.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/candidate/skills"
                    className="shrink-0 rounded-lg bg-[#123b68] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#0f3155]"
                  >
                    Add My Skills
                  </Link>
                </div>
              </div>
            )}

            {/* Intelligence Banner */}
            {recommendation ? (
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-lg text-[#123b68] shadow-sm">
                      ✦
                    </div>

                    <div>

                      <h2 className="font-bold text-[#123b68]">
                        Skill-Based Job Recommendations
                      </h2>

                      <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-600">
                        {recommendation.message || "Recommendations based on your skills and job requirements."}
                      </p>

                    </div>

                  </div>

                  <div className="rounded-lg bg-white px-4 py-3 text-center shadow-sm">

                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      Match
                    </p>

                    <p className="text-xl font-bold text-[#123b68]">
                      {recommendation.skill_match_percentage}%
                    </p>

                    <p className="text-[10px] text-slate-500">
                      Skill Alignment
                    </p>

                  </div>

                </div>

              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Select a job role above to see personalized recommendations.
                </p>
              </div>
            )}

            {/* Summary */}
            {recommendation ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <SummaryCard
                  title="Recommended Jobs"
                  value={String(recommendation.recommended_jobs?.length || 0)}
                  text="Jobs matching your skills"
                />

                <SummaryCard
                  title="High Match"
                  value={String(recommendation.recommended_jobs?.filter((j: any) => j.skill_match_score >= 80).length || 0)}
                  text="80%+ skill alignment"
                />

                <SummaryCard
                  title="Good Match"
                  value={String(recommendation.recommended_jobs?.filter((j: any) => j.skill_match_score >= 60).length || 0)}
                  text="60%+ skill alignment"
                />

                <SummaryCard
                  title="Average Match"
                  value={String(recommendation.recommended_jobs?.filter((j: any) => j.skill_match_score >= 50).length || 0)}
                  text="50%+ skill alignment"
                />

              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <SummaryCard
                  title="Recommended Jobs"
                  value="--"
                  text="Select a job role"
                />

                <SummaryCard
                  title="90%+ Match"
                  value="--"
                  text="Excellent skill alignment"
                />

                <SummaryCard
                  title="80%+ Match"
                  value="--"
                  text="Strong opportunities"
                />

                <SummaryCard
                  title="Skills Considered"
                  value="--"
                  text="Skills from your profile"
                />

              </div>
            )}

            {/* Recommended List */}
            <div className="mt-8">

              <div className="mb-4">

                <h2 className="text-lg font-bold text-[#123b68]">
                  Jobs Recommended For You
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Higher match scores indicate stronger alignment with
                  your current skills.
                </p>

              </div>

              {loading ? (
                <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                  <p className="text-slate-500">Loading recommendations...</p>
                </div>
              ) : error ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-12 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-xl text-amber-600">
                    ⚠
                  </div>
                  <h3 className="mt-4 font-semibold text-amber-800">
                    No Recommendations Available
                  </h3>
                  <p className="mt-2 text-sm text-amber-700">
                    {error}
                  </p>
                  <div className="mt-6 flex justify-center gap-3">
                    <Link
                      href="/candidate/skills"
                      className="rounded-lg border border-amber-600 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                    >
                      Update My Skills
                    </Link>
                    <Link
                      href="/candidate/jobs"
                      className="rounded-lg bg-[#123b68] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0e3155]"
                    >
                      Browse All Jobs
                    </Link>
                  </div>
                </div>
              ) : recommendation && (recommendation.demand || recommendation.recommended_jobs) ? (
                <div className="space-y-4">
                  {recommendation.message && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm text-amber-800">{recommendation.message}</p>
                    </div>
                  )}
                  
                  {/* Skill-based job recommendations */}
                  {recommendation.recommended_jobs && recommendation.recommended_jobs.length > 0 ? (
                    <div className="space-y-4">
                      {recommendation.recommended_jobs.map((job: any) => (
                        <div key={job.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-base font-bold text-[#123b68]">
                                {job.title}
                              </h3>
                              <p className="mt-1 text-sm text-slate-500">
                                {job.company_name || 'Company not specified'}
                              </p>
                              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                                <span>📍 {job.district_name || 'Location not specified'}</span>
                                <span>Skills: {job.required_skills?.slice(0, 3).join(', ') || 'Not specified'}</span>
                              </div>
                            </div>
                            <div className="rounded-lg bg-green-50 px-4 py-2 text-center">
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-green-600">
                                Match
                              </p>
                              <p className="text-lg font-bold text-green-700">
                                {job.skill_match_score}%
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-3">
                            <Link
                              href={`/candidate/jobs`}
                              className="rounded-lg bg-[#123b68] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0f3155]"
                            >
                              View Details
                            </Link>
                            {job.job_url && (
                              <a
                                href={job.job_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg border border-[#123b68] px-4 py-2 text-xs font-semibold text-[#123b68] hover:bg-blue-50"
                              >
                                Apply
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recommendation.demand ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-bold text-[#123b68]">
                            {recommendation.demand.job_role_title || 'Job Role'}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {recommendation.demand.district_name || 'Location not specified'}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                            <span>Demand: {recommendation.demand.demand_trend || 'Not specified'}</span>
                            <span>Job Postings: {recommendation.demand.relevant_job_postings_count || 0}</span>
                          </div>
                        </div>
                        <div className="rounded-lg bg-green-50 px-4 py-2 text-center">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-green-600">
                            Match
                          </p>
                          <p className="text-lg font-bold text-green-700">
                            {recommendation.skill_match_percentage}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500">
                    ✦
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-700">
                    No recommendations available
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Select a job role to see personalized recommendations.
                  </p>
                </div>
              )}

            </div>

            {/* How Recommendations Work */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <h2 className="font-bold text-[#123b68]">
                How Job Recommendations Work
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                SkillMitra uses your candidate information to identify
                relevant employment opportunities.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-4">

                <RecommendationStep
                  number="01"
                  title="Your Skills"
                  text="Your current skills and competencies"
                />

                <RecommendationStep
                  number="02"
                  title="Job Requirements"
                  text="Skills required by available jobs"
                />

                <RecommendationStep
                  number="03"
                  title="Skill Matching"
                  text="Your profile is compared with job needs"
                />

                <RecommendationStep
                  number="04"
                  title="Recommendation"
                  text="Relevant opportunities are identified"
                />

              </div>

            </div>

            {/* Improve Recommendations */}
            <div className="mt-7 grid gap-5 md:grid-cols-2">

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#123b68]">
                    ◆
                  </div>

                  <div>

                    <h3 className="font-semibold text-[#123b68]">
                      Improve Your Job Matches
                    </h3>

                    <p className="text-[11px] text-slate-400">
                      Keep your candidate profile updated
                    </p>

                  </div>

                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Adding relevant skills and keeping your profile updated
                  can help identify more suitable opportunities.
                </p>

                <Link
                  href="/candidate/skills"
                  className="mt-4 inline-block rounded-lg border border-[#123b68] px-4 py-2.5 text-xs font-semibold text-[#123b68] transition hover:bg-blue-50"
                >
                  Update My Skills
                </Link>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#123b68]">
                    △
                  </div>

                  <div>

                    <h3 className="font-semibold text-[#123b68]">
                      Identify Skill Gaps
                    </h3>

                    <p className="text-[11px] text-slate-400">
                      Understand skills you may need to improve
                    </p>

                  </div>

                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Review your skill gaps and explore relevant training
                  opportunities to improve your employment readiness.
                </p>

                <Link
                  href="/candidate/skill-gap"
                  className="mt-4 inline-block rounded-lg bg-[#123b68] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0e3155]"
                >
                  View Skill Gap
                </Link>

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

      <p className="mt-2 text-xs text-slate-500">
        {text}
      </p>

    </div>
  );
}



/* Recommendation Step */

function RecommendationStep({
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

