"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";
import { api } from "@/lib/api";

export default function CareerRecommendationPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load candidate profile
      const profileData = await api.candidateProfile();
      setProfile(profileData);

      // Load candidate skills
      const skillsData = await api.candidateSkills();
      setSkills(skillsData);

      // Load career guidance recommendation if profile has career interests
      if (profileData?.career_interests?.length > 0) {
        const interestId = profileData.career_interests[0].target_job_role_id;
        const recData = await api.careerRecommendation(interestId);
        setRecommendation(recData);
      }
    } catch (err) {
      console.error("Failed to load career recommendation data:", err);
      setError("Unable to load career recommendation data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f4f7fa]">
        <CandidateSidebar />
        <main className="flex-1 lg:ml-72">
          <div className="flex h-[calc(100vh-76px)] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#123b68] border-t-transparent"></div>
              <p className="text-slate-600">Loading career recommendations...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#f4f7fa]">
        <CandidateSidebar />
        <main className="flex-1 lg:ml-72">
          <div className="flex h-[calc(100vh-76px)] items-center justify-center">
            <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
              <p className="text-red-700">{error}</p>
              <button
                onClick={loadData}
                className="mt-4 rounded-lg bg-[#123b68] px-6 py-2 text-white hover:bg-[#0d2a47]"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f4f7fa]">
      <CandidateSidebar />
      <main className="flex-1 lg:ml-72">
        <div className="p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#123b68]">
              Career Recommendation
            </h1>
            <p className="mt-2 text-slate-600">
              Explore career paths based on your skills, skill gaps and current industry demand.
            </p>
          </div>

          {/* Career Profile Summary */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Total Skills
              </p>
              <p className="mt-2 text-3xl font-bold text-[#123b68]">
                {skills.length}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Skills in your profile
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Career Interests
              </p>
              <p className="mt-2 text-3xl font-bold text-[#123b68]">
                {profile?.career_interests?.length || 0}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Target career roles
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Job Readiness
              </p>
              <p className="mt-2 text-3xl font-bold text-[#123b68]">
                {recommendation?.job_readiness_percentage 
                  ? `${recommendation.job_readiness_percentage}%` 
                  : 'N/A'}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Based on skill match
              </p>
            </div>
          </div>

          {/* Career Recommendation Details */}
          {recommendation ? (
            <div className="space-y-6">
              {/* Recommended Career Role */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold text-[#123b68]">
                  Recommended Career Path
                </h2>
                
                <div className="mb-4">
                  <p className="text-2xl font-semibold text-slate-800">
                    {recommendation.job_role_title}
                  </p>
                </div>

                {/* Industry Demand */}
                {recommendation.industry_demand && (
                  <div className="mb-4 rounded-lg bg-blue-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Industry Demand
                    </p>
                    <div className="mt-2 flex items-center gap-4">
                      <div>
                        <p className="text-lg font-bold text-[#123b68]">
                          {recommendation.industry_demand.demand_trend || 'Moderate'}
                        </p>
                        <p className="text-xs text-slate-500">
                          Demand Trend
                        </p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-[#123b68]">
                          {recommendation.industry_demand.demand_signals_count || 0}
                        </p>
                        <p className="text-xs text-slate-500">
                          Demand Signals
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Skill Match */}
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Skill Match
                  </p>
                  <div className="mt-2">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-slate-600">
                        {recommendation.matched_skill_count} of {recommendation.total_required_skills} skills matched
                      </span>
                      <span className="font-bold text-[#123b68]">
                        {recommendation.skill_match_percentage}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-[#123b68]"
                        style={{ width: `${recommendation.skill_match_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Missing Skills */}
                {recommendation.missing_skills && recommendation.missing_skills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Missing Skills
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {recommendation.missing_skills.map((skill: any) => (
                        <span
                          key={skill.id}
                          className="rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-700"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Courses */}
                {recommendation.recommended_courses && recommendation.recommended_courses.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Recommended Training
                    </p>
                    <div className="mt-2 space-y-2">
                      {recommendation.recommended_courses.slice(0, 3).map((course: any, index: number) => (
                        <div
                          key={index}
                          className="rounded-lg border border-slate-200 p-3"
                        >
                          <p className="font-semibold text-slate-800">
                            {course.title}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {course.why}
                          </p>
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/candidate/training"
                      className="mt-3 inline-block rounded-lg bg-[#123b68] px-4 py-2 text-sm text-white hover:bg-[#0d2a47]"
                    >
                      View All Training
                    </Link>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Link
                  href="/candidate/skill-gap"
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#123b68]"
                >
                  <p className="text-sm font-semibold text-slate-800">
                    View Skill Gap
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Analyze your skill gaps
                  </p>
                </Link>

                <Link
                  href="/candidate/recommended-skills"
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#123b68]"
                >
                  <p className="text-sm font-semibold text-slate-800">
                    Recommended Skills
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Skills to improve
                  </p>
                </Link>

                <Link
                  href="/candidate/recommended-jobs"
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#123b68]"
                >
                  <p className="text-sm font-semibold text-slate-800">
                    Recommended Jobs
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Jobs matching your profile
                  </p>
                </Link>
              </div>
            </div>
          ) : (
            /* No Career Interests Set */
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-800">
                  Set Your Career Interests
                </p>
                <p className="mt-2 text-slate-600">
                  Add career interests to your profile to get personalized career recommendations.
                </p>
                <Link
                  href="/candidate/profile"
                  className="mt-4 inline-block rounded-lg bg-[#123b68] px-6 py-2 text-white hover:bg-[#0d2a47]"
                >
                  Update Profile
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
