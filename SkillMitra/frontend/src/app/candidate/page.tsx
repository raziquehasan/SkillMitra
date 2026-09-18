
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";
import { api } from "@/lib/api";

type CandidateSkill = {
  id: string;
  candidate_id: string;
  skill_id: string;
  skill_name: string | null;
  proficiency_level_id: string;
  proficiency_level_name: string | null;
  source: string;
  verification_status: string;
  last_assessed_date: string | null;
  evidence_reference: string | null;
};

export default function CandidateDashboardPage() {
  const [hasSkills, setHasSkills] = useState<boolean | null>(null);
  const [dismissedOnboarding, setDismissedOnboarding] = useState(false);
  const [candidateSkills, setCandidateSkills] = useState<CandidateSkill[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [trainingRecommendations, setTrainingRecommendations] = useState<any[]>([]);
  const [skillGaps, setSkillGaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load data in parallel
        const [skills, profileData, apps, jobRecs, trainingRecs, gaps] = await Promise.all([
          api.candidateSkills().catch(() => []),
          api.candidateProfile().catch(() => null),
          api.applications().catch(() => []),
          api.candidateJobRecommendations().catch(() => ({ recommended_jobs: [] })),
          api.candidateTrainingRecommendations().catch(() => ({ recommended_courses: [] })),
          api.candidateSkillGaps().catch(() => [])
        ]);

        setHasSkills(skills.length > 0);
        setCandidateSkills(skills);
        setProfile(profileData);
        setApplications(apps);
        setRecommendedJobs(jobRecs.recommended_jobs || []);
        setTrainingRecommendations(trainingRecs.recommended_courses || []);
        setSkillGaps(gaps);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setHasSkills(false);
      } finally {
        setLoading(false);
      }
    };

    // Check if user has dismissed the onboarding
    const dismissed = localStorage.getItem("skillmitra_onboarding_dismissed");
    setDismissedOnboarding(dismissed === "true");

    loadData();
  }, []);

  const handleDismissOnboarding = () => {
    localStorage.setItem("skillmitra_onboarding_dismissed", "true");
    setDismissedOnboarding(true);
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
        {/* Candidate Sidebar */}
        <CandidateSidebar />

        {/* Main Content */}
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
                  Candidate Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">

            {/* Welcome */}
            <div className="mb-7 rounded-xl bg-[#123b68] p-6 text-white shadow-sm">
              <p className="text-sm text-blue-100">
                Welcome to SkillMitra
              </p>

              <h1 className="mt-1 text-2xl font-bold">
                Candidate Career Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">
                Discover suitable employment opportunities, understand
                your skill gaps and explore training recommendations
                based on your career goals.
              </p>
            </div>

            {/* Onboarding Prompt for New Candidates */}
            {hasSkills === false && !dismissedOnboarding && (
              <div className="mb-7 rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-600">
                      🎯
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-amber-900">
                        Complete Your Skills Profile
                      </h2>
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-amber-800">
                        Add your current skills to get personalized job recommendations and skill gap analysis. 
                        This helps us match you with the right opportunities based on your actual capabilities.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={handleDismissOnboarding}
                      className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
                    >
                      Remind Me Later
                    </button>
                    <Link
                      href="/candidate/skills"
                      className="rounded-lg bg-[#123b68] px-4 py-2 text-center text-sm font-semibold text-white hover:bg-[#0f3155]"
                    >
                      Add My Skills
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                title="Profile Completion"
                value={`${profile?.profile_completion || 0}%`}
                description="Complete your profile"
                icon="👤"
              />

              <SummaryCard
                title="Applications"
                value={String(applications.length)}
                description="Jobs applied"
                icon="▣"
              />

              <SummaryCard
                title="Recommended Jobs"
                value={String(recommendedJobs.length)}
                description="Matching opportunities"
                icon="★"
              />

              <SummaryCard
                title="Skills"
                value={String(candidateSkills.length)}
                description="Skills in your profile"
                icon="◆"
              />
            </div>

            {/* Main Grid */}
            <div className="mt-6 grid gap-6 lg:grid-cols-3">

              {/* Applications */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                  <div>
                    <h2 className="font-semibold text-[#123b68]">
                      Recent Applications
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Track your latest job applications.
                    </p>
                  </div>

                  <Link
                    href="/candidate/applications"
                    className="text-xs font-semibold text-[#123b68] hover:underline"
                  >
                    View All
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
                  {applications.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <p className="text-sm text-slate-500">No applications yet</p>
                      <Link
                        href="/candidate/jobs"
                        className="mt-2 inline-block text-xs font-semibold text-[#123b68] hover:underline"
                      >
                        Browse jobs to apply
                      </Link>
                    </div>
                  ) : (
                    applications.slice(0, 3).map((application) => (
                      <div
                        key={application.id}
                        className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            {application.job_title || application.course_title || 'Application'}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {application.employer_name || application.provider_name || 'N/A'}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {new Date(application.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <ApplicationStatus status={application.status} />
                      </div>
                    ))
                  )}
                  {applications.length > 3 && (
                    <div className="px-6 py-3 text-center">
                      <Link
                        href="/candidate/applications"
                        className="text-xs font-semibold text-[#123b68] hover:underline"
                      >
                        View all {applications.length} applications
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Completion */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-[#123b68]">
                  Profile Completion
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Improve your profile to get better job matches.
                </p>

                <div className="mt-6 flex items-center justify-center">
                  <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-[10px] border-blue-100">
                    <div 
                      className="absolute inset-[-10px] rounded-full border-[10px] border-transparent border-t-[#123b68] border-r-[#123b68]"
                      style={{
                        transform: `rotate(${(profile?.profile_completion || 0) * 3.6 - 90}deg)`,
                        transition: 'transform 0.5s ease-in-out'
                      }}
                    />

                    <div className="text-center">
                      <p className="text-2xl font-bold text-[#123b68]">
                        {profile?.profile_completion || 0}%
                      </p>

                      <p className="text-[10px] text-slate-400">
                        Complete
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/candidate/profile"
                  className="mt-6 block rounded-lg bg-[#123b68] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[#0e3155]"
                >
                  Complete Profile
                </Link>
              </div>
            </div>

            {/* Recommended Jobs */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-[#123b68]">
                    Recommended Jobs
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Opportunities matching your skills and profile.
                  </p>
                </div>

                <Link
                  href="/candidate/recommended-jobs"
                  className="text-xs font-semibold text-[#123b68] hover:underline"
                >
                  View Recommendations →
                </Link>
              </div>

              <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
                {recommendedJobs.length === 0 ? (
                  <div className="col-span-full px-6 py-8 text-center">
                    <p className="text-sm text-slate-500">
                      {hasSkills ? 'No job recommendations available yet' : 'Add skills to get job recommendations'}
                    </p>
                    {!hasSkills && (
                      <Link
                        href="/candidate/skills"
                        className="mt-2 inline-block text-xs font-semibold text-[#123b68] hover:underline"
                      >
                        Add your skills
                      </Link>
                    )}
                  </div>
                ) : (
                  recommendedJobs.slice(0, 3).map((job) => (
                    <div
                      key={job.id}
                      className="rounded-lg border border-slate-200 p-5 transition hover:border-blue-200 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-bold text-slate-700">
                            {job.title}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            {job.company_name || 'Company'}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {job.district_name || 'Location'}
                          </p>
                        </div>

                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                          {job.skill_match_score}% Match
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.required_skills?.slice(0, 3).map((skill: string) => (
                          <span
                            key={skill}
                            className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-[#123b68]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <Link
                        href="/candidate/jobs"
                        className="mt-5 block rounded-lg border border-[#123b68] px-4 py-2.5 text-center text-xs font-semibold text-[#123b68] hover:bg-blue-50"
                      >
                        View Job
                      </Link>
                    </div>
                  ))
                )}
                {recommendedJobs.length > 3 && (
                  <div className="col-span-full px-6 py-3 text-center">
                    <Link
                      href="/candidate/recommended-jobs"
                      className="text-xs font-semibold text-[#123b68] hover:underline"
                    >
                      View all {recommendedJobs.length} recommended jobs
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Skills + Skill Gap */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">

              {/* My Skills */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                  <div>
                    <h2 className="font-semibold text-[#123b68]">
                      My Skills
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Your current skill profile.
                    </p>
                  </div>

                  <Link
                    href="/candidate/skills"
                    className="text-xs font-semibold text-[#123b68] hover:underline"
                  >
                    Manage
                  </Link>
                </div>

                <div className="space-y-5 p-6">
                  {candidateSkills.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-slate-500">No skills added yet</p>
                      <Link
                        href="/candidate/skills"
                        className="mt-2 inline-block text-xs font-semibold text-[#123b68] hover:underline"
                      >
                        Add your first skill
                      </Link>
                    </div>
                  ) : (
                    candidateSkills.slice(0, 4).map((skill) => (
                      <div key={skill.id}>
                        <div className="mb-2 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-700">
                              {skill.skill_name || "Unknown Skill"}
                            </p>

                            <p className="text-[11px] text-slate-400">
                              {skill.proficiency_level_name || "Unknown Level"}
                            </p>
                          </div>

                          <span className={`text-xs font-semibold ${
                            skill.verification_status === "verified" ? "text-green-600" : "text-slate-500"
                          }`}>
                            {skill.verification_status === "verified" ? "Verified" : 
                             skill.verification_status === "pending" ? "Pending" : "Unverified"}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-[#123b68]"
                            style={{
                              width: `${skill.proficiency_level_name === "Advanced" ? 85 : 
                                     skill.proficiency_level_name === "Intermediate" ? 65 : 
                                     skill.proficiency_level_name === "Beginner" ? 40 : 50}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                  {candidateSkills.length > 4 && (
                    <Link
                      href="/candidate/skills"
                      className="block text-center text-xs font-semibold text-[#123b68] hover:underline"
                    >
                      View all {candidateSkills.length} skills
                    </Link>
                  )}
                </div>
              </div>

              {/* Skill Gap */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-5">
                  <h2 className="font-semibold text-[#123b68]">
                    Skill Gap Overview
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Understand the skills you can improve for better
                    opportunities.
                  </p>
                </div>

                <div className="p-6">
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                      Improvement Areas
                    </p>

                    <h3 className="mt-2 text-lg font-bold text-orange-900">
                      {skillGaps.length} Skills
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-orange-800">
                      {skillGaps.length > 0 
                        ? "Some recommended jobs require skills that are not fully covered in your current profile."
                        : "Your current skill profile covers the requirements for available opportunities."}
                    </p>
                  </div>

                  <div className="mt-5 space-y-3">
                    {skillGaps.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-slate-500">No skill gaps identified</p>
                      </div>
                    ) : (
                      skillGaps.slice(0, 3).map((gap, index) => (
                        <SkillGapRow
                          key={index}
                          skill={gap.skill_name || gap.skill || `Skill ${index + 1}`}
                          status={gap.gap_status || gap.status || "Recommended"}
                        />
                      ))
                    )}
                  </div>

                  <Link
                    href="/candidate/skill-gap"
                    className="mt-5 block rounded-lg bg-[#123b68] px-4 py-3 text-center text-xs font-semibold text-white hover:bg-[#0e3155]"
                  >
                    View Skill Gap
                  </Link>
                </div>
              </div>
            </div>

            {/* Training Recommendations */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-[#123b68]">
                    Training & Course Recommendations
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Build skills that can improve your employment
                    opportunities.
                  </p>
                </div>

                <Link
                  href="/candidate/training"
                  className="text-xs font-semibold text-[#123b68] hover:underline"
                >
                  Explore Training →
                </Link>
              </div>

              <div className="grid gap-4 p-5 md:grid-cols-3">
                {trainingRecommendations.length === 0 ? (
                  <div className="col-span-full px-6 py-8 text-center">
                    <p className="text-sm text-slate-500">
                      {hasSkills ? 'No training recommendations available yet' : 'Add skills to get training recommendations'}
                    </p>
                    {!hasSkills && (
                      <Link
                        href="/candidate/skills"
                        className="mt-2 inline-block text-xs font-semibold text-[#123b68] hover:underline"
                      >
                        Add your skills
                      </Link>
                    )}
                  </div>
                ) : (
                  trainingRecommendations.slice(0, 3).map((course, index) => (
                    <TrainingCard
                      key={course.course_id || index}
                      title={course.course_title || course.title || 'Course'}
                      provider={course.provider_name || course.provider || 'Training Provider'}
                      duration={course.duration_hours ? `${Math.ceil(course.duration_hours / 40)} Weeks` : course.duration || 'Duration TBD'}
                      skill={course.addresses_gaps?.[0] || course.skill || course.skills?.[0] || 'Skill Development'}
                      courseId={course.course_id}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6">
              <h2 className="mb-4 text-lg font-semibold text-[#123b68]">
                Quick Actions
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <QuickAction
                  title="Find Jobs"
                  description="Explore available opportunities"
                  href="/candidate/jobs"
                />

                <QuickAction
                  title="My Applications"
                  description="Track your applications"
                  href="/candidate/applications"
                />

                <QuickAction
                  title="Update Skills"
                  description="Manage your skill profile"
                  href="/candidate/skills"
                />

                <QuickAction
                  title="Explore Training"
                  description="Improve your career skills"
                  href="/candidate/training"
                />
              </div>
            </div>

            {/* Information Note */}
            <div className="mt-7 rounded-lg border border-slate-200 bg-white px-5 py-4">
              <p className="text-xs leading-5 text-slate-500">
                <span className="font-semibold text-slate-700">
                  SkillMitra Candidate Portal:
                </span>{" "}
                The dashboard provides candidates with employment
                opportunities, application tracking, skill intelligence
                and training recommendations.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}


/* =========================================
   Summary Card
========================================= */

function SummaryCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-[#123b68]">
            {value}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg text-[#123b68]">
          {icon}
        </div>
      </div>
    </div>
  );
}


/* =========================================
   Application Status
========================================= */

function ApplicationStatus({
  status,
}: {
  status: string;
}) {
  const statusClass =
    status === "Shortlisted"
      ? "bg-green-100 text-green-700"
      : status === "Under Review"
        ? "bg-blue-100 text-blue-700"
        : "bg-slate-100 text-slate-600";

  return (
    <span
      className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass}`}
    >
      {status}
    </span>
  );
}


/* =========================================
   Skill Gap Row
========================================= */

function SkillGapRow({
  skill,
  status,
}: {
  skill: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-100 text-xs font-bold text-orange-700">
          !
        </div>

        <span className="text-sm font-medium text-slate-700">
          {skill}
        </span>
      </div>

      <span className="text-[11px] font-semibold text-orange-600">
        {status}
      </span>
    </div>
  );
}


/* =========================================
   Training Card
========================================= */

function TrainingCard({
  title,
  provider,
  duration,
  skill,
  courseId,
}: {
  title: string;
  provider: string;
  duration: string;
  skill: string;
  courseId?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg">
        📚
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-700">
        {title}
      </h3>

      <p className="mt-1 text-xs text-slate-500">
        {provider}
      </p>

      <div className="mt-4 flex items-center justify-between text-[11px]">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-[#123b68]">
          {skill}
        </span>

        <span className="text-slate-400">
          {duration}
        </span>
      </div>

      <Link
        href={courseId ? `/candidate/training/${courseId}` : "/candidate/training"}
        className="mt-4 block text-center text-xs font-semibold text-[#123b68] hover:underline"
      >
        View Course →
      </Link>
    </div>
  );
}


/* =========================================
   Quick Action
========================================= */

function QuickAction({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <h3 className="text-sm font-semibold text-[#123b68]">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>

      <p className="mt-4 text-xs font-semibold text-[#123b68]">
        Open →
      </p>
    </Link>
  );
}

