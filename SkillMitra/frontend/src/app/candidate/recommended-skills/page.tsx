
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";
import { api } from "@/lib/api";

export default function RecommendedSkillsPage() {
  const [recommendedSkills, setRecommendedSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSkills, setHasSkills] = useState<boolean | null>(null);
  const [currentSkillsCount, setCurrentSkillsCount] = useState(0);
  const [recommendationReason, setRecommendationReason] = useState<string | null>(null);
  const [skillGaps, setSkillGaps] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if user has skills
        const skills = await api.candidateSkills();
        setHasSkills(skills.length > 0);
        setCurrentSkillsCount(skills.length);
        
        if (skills.length > 0) {
          // Load recommended skills from new dedicated endpoint
          const recData = await api.candidateRecommendedSkills().catch(() => null);
          if (recData) {
            setRecommendedSkills(recData.recommended_skills || []);
            setRecommendationReason(recData.reason || null);
          }
          
          // Load skill gaps for context
          const gaps = await api.candidateSkillGaps().catch(() => []);
          setSkillGaps(gaps);
        }
      } catch (err) {
        console.error("Failed to load skill data:", err);
        setError("Unable to load skill recommendations. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate summary stats
  const totalRecommended = recommendedSkills.length;
  const criticalSkills = recommendedSkills.filter(s => s.priority === 'Critical').length;
  const highDemandSkills = recommendedSkills.filter(s => s.priority === 'High').length;
  const currentSkills = currentSkillsCount;

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
                  Recommended Skills
                </p>

              </div>

            </div>

          </div>

          {/* Main Content */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">

            {/* Intro */}
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">

              <div>

                <h1 className="text-2xl font-bold text-[#123b68]">
                  Recommended Skills
                </h1>

                <p className="mt-1 max-w-2xl text-sm text-slate-500">
                  Explore skills that can improve your employment
                  opportunities based on current job requirements and
                  your candidate profile.
                </p>

              </div>

              <Link
                href="/candidate/skills"
                className="rounded-lg bg-[#123b68] px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-[#0e3155]"
              >
                View My Skills
              </Link>

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
                        To get personalized skill recommendations, you need to add your current skills to your profile and set your career interests.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href="/candidate/skills"
                      className="shrink-0 rounded-lg border border-amber-600 bg-amber-50 px-4 py-2.5 text-center text-sm font-semibold text-amber-700 hover:bg-amber-100"
                    >
                      Add My Skills
                    </Link>
                    <Link
                      href="/candidate/profile"
                      className="shrink-0 rounded-lg bg-[#123b68] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#0f3155]"
                    >
                      Set Career Interests
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Intelligence Banner */}
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-lg text-[#123b68] shadow-sm">
                    ✦
                  </div>

                  <div>

                    <h2 className="font-bold text-[#123b68]">
                      Skill Intelligence
                    </h2>

                    <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-600">
                      {recommendationReason || "SkillMitra identifies skills that can strengthen your profile by comparing your current skills with relevant employment requirements."}
                    </p>

                  </div>

                </div>

                <div className="rounded-lg bg-white px-5 py-3 text-center shadow-sm">

                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Skills Recommended
                  </p>

                  <p className="text-xl font-bold text-[#123b68]">
                    {String(totalRecommended).padStart(2, '0')}
                  </p>

                </div>

              </div>

            </div>

            {/* Summary Cards */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <SummaryCard
                title="Recommended Skills"
                value={String(totalRecommended).padStart(2, '0')}
                text="Skills identified for your profile"
              />

              <SummaryCard
                title="High Priority"
                value={String(criticalSkills).padStart(2, '0')}
                text="Critical skills requiring attention"
              />

              <SummaryCard
                title="Medium Priority"
                value={String(highDemandSkills).padStart(2, '0')}
                text="Skills with strong relevance"
              />

              <SummaryCard
                title="Current Skills"
                value={String(currentSkills).padStart(2, '0')}
                text="Skills already in your profile"
              />

            </div>

            {/* Skills List */}
            <div className="mt-8">

              <div className="mb-4">

                <h2 className="text-lg font-bold text-[#123b68]">
                  Skills Recommended For You
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Prioritize skills that are relevant to your target
                  employment opportunities.
                </p>

              </div>

              {loading ? (
                <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                  <p className="text-slate-500">Loading skill recommendations...</p>
                </div>
              ) : error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : recommendedSkills.length > 0 ? (
                <div className="space-y-4">

                  {recommendedSkills.map((item, index) => (
                    <SkillCard
                      key={`${item.skill_id}-${index}`}
                      skill={item}
                    />
                  ))}

                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500">
                    {recommendationReason?.includes('career interest') ? '🎯' : '✓'}
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-700">
                    {recommendationReason?.includes('career interest') 
                      ? 'Add a career interest to receive skill recommendations' 
                      : 'No additional skills recommended'}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {recommendationReason?.includes('career interest')
                      ? `Set your career interests in your profile to get personalized skill recommendations.${skillGaps.length > 0 ? ` You currently have ${skillGaps.length} identified skill gap(s).` : ''}`
                      : recommendationReason || 'Your current skills align well with your target roles.'}
                  </p>
                  {recommendationReason?.includes('career interest') && (
                    <div className="mt-4 flex justify-center gap-3">
                      <Link
                        href="/candidate/profile"
                        className="rounded-lg bg-[#123b68] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0f3155]"
                      >
                        Set Career Interests
                      </Link>
                      {skillGaps.length > 0 && (
                        <Link
                          href="/candidate/skill-gap"
                          className="rounded-lg border border-[#123b68] px-4 py-2 text-xs font-semibold text-[#123b68] hover:bg-blue-50"
                        >
                          View Skill Gaps
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Priority Guide */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <h2 className="font-bold text-[#123b68]">
                Skill Priority Guide
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Use skill demand and importance to decide what to learn
                first.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">

                <PriorityCard
                  title="Critical"
                  description="Skills that can significantly improve readiness for relevant roles."
                  badge="Priority 1"
                />

                <PriorityCard
                  title="High"
                  description="Skills with strong relevance across available employment opportunities."
                  badge="Priority 2"
                />

                <PriorityCard
                  title="Medium"
                  description="Useful skills that can broaden your employment options."
                  badge="Priority 3"
                />

              </div>

            </div>

            {/* Learning Path */}
            <div className="mt-7 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">

                <div>

                  <h2 className="font-bold text-[#123b68]">
                    Build Your Skill Profile
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Improve recommended skills through relevant
                    training and learning opportunities.
                  </p>

                </div>

                <Link
                  href="/candidate/training"
                  className="rounded-lg bg-[#123b68] px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-[#0e3155]"
                >
                  Explore Training
                </Link>

              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">

                <LearningStep
                  number="01"
                  title="Select a Skill"
                  text="Choose a recommended skill relevant to your career goal."
                />

                <LearningStep
                  number="02"
                  title="Build Capability"
                  text="Use suitable training and learning opportunities."
                />

                <LearningStep
                  number="03"
                  title="Improve Readiness"
                  text="Strengthen your profile for relevant employment opportunities."
                />

              </div>

            </div>

            {/* Bottom Actions */}
            <div className="mt-7 grid gap-5 md:grid-cols-2">

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#123b68]">
                    △
                  </div>

                  <div>

                    <h3 className="font-semibold text-[#123b68]">
                      Review Skill Gaps
                    </h3>

                    <p className="text-[11px] text-slate-400">
                      Understand which skills need improvement
                    </p>

                  </div>

                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Review your current skill gaps and understand how they
                  relate to available employment opportunities.
                </p>

                <Link
                  href="/candidate/skill-gap"
                  className="mt-4 inline-block rounded-lg border border-[#123b68] px-4 py-2.5 text-xs font-semibold text-[#123b68] transition hover:bg-blue-50"
                >
                  View Skill Gap
                </Link>

              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#123b68]">
                    ★
                  </div>

                  <div>

                    <h3 className="font-semibold text-[#123b68]">
                      Explore Recommended Jobs
                    </h3>

                    <p className="text-[11px] text-slate-400">
                      Find opportunities matching your profile
                    </p>

                  </div>

                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Explore employment opportunities that align with your
                  existing skills and candidate profile.
                </p>

                <Link
                  href="/candidate/recommended-jobs"
                  className="mt-4 inline-block rounded-lg bg-[#123b68] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0e3155]"
                >
                  View Recommended Jobs
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

/* Skill Card */

function SkillCard({
  skill,
}: {
  skill: {
    skill_id: string;
    skill_name: string;
    category: string | null;
    current_proficiency: string | null;
    required_proficiency: string;
    gap_status: string;
    demand_relevance: string;
    priority: string;
    reason: string;
    related_job_roles: string[];
    demand_score: number;
  };
}) {
  const importanceLabel = skill.priority;
  
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-start justify-between gap-3">

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <h3 className="text-base font-bold text-[#123b68]">
                  {skill.skill_name}
                </h3>

                <PriorityBadge
                  importance={importanceLabel}
                />

              </div>

              {skill.category && (
                <p className="mt-1 text-sm font-medium text-slate-700">
                  Category: {skill.category}
                </p>
              )}

              {skill.related_job_roles.length > 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  Relevant Roles: {skill.related_job_roles.slice(0, 2).join(', ')}
                  {skill.related_job_roles.length > 2 && ` +${skill.related_job_roles.length - 2} more`}
                </p>
              )}
            </div>

            <div className="rounded-lg bg-blue-50 px-4 py-2 text-center">

              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Priority
              </p>

              <p className="text-sm font-bold text-[#123b68]">
                {importanceLabel}
              </p>

            </div>

          </div>

          {/* Levels */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">

            <div className="rounded-lg bg-slate-50 px-4 py-3">

              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Current Level
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-700">
                {skill.current_proficiency || 'None'}
              </p>

            </div>

            <div className="rounded-lg bg-blue-50 px-4 py-3">

              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Required Level
              </p>

              <p className="mt-1 text-sm font-semibold text-[#123b68]">
                {skill.required_proficiency || 'Intermediate'}
              </p>

            </div>

          </div>

          {/* Demand and Reason */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">

              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Industry Demand
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-700">
                {skill.demand_relevance}
              </p>

            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">

              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Demand Score
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-700">
                {skill.demand_score > 0 ? Math.round(skill.demand_score) : 'N/A'}
              </p>

            </div>
          </div>

          {/* Reason */}
          <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">

            <p className="text-[11px] leading-5 text-slate-600">

              <span className="font-semibold text-[#123b68]">
                Why recommended?
              </span>{" "}

              {skill.reason}

            </p>

          </div>

        </div>

        {/* Action */}
        <div className="flex shrink-0 gap-2 lg:flex-col">

          <Link
            href="/candidate/training"
            className="rounded-lg border border-[#123b68] px-4 py-2.5 text-center text-xs font-semibold text-[#123b68] transition hover:bg-blue-50"
          >
            Find Training
          </Link>

          <Link
            href="/candidate/skills"
            className="rounded-lg bg-[#123b68] px-5 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-[#0e3155]"
          >
            Add Skill
          </Link>

        </div>

      </div>
    </div>
  );
}

/* Priority Badge */

function PriorityBadge({
  importance,
}: {
  importance: string;
}) {
  const styles: Record<string, string> = {
    Critical: "bg-red-50 text-red-700",
    High: "bg-amber-50 text-amber-700",
    Medium: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        styles[importance] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {importance}
    </span>
  );
}

/* Priority Card */

function PriorityCard({
  title,
  description,
  badge,
}: {
  title: string;
  description: string;
  badge: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">

      <div className="flex items-center justify-between gap-3">

        <h3 className="text-sm font-semibold text-[#123b68]">
          {title}
        </h3>

        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500">
          {badge}
        </span>

      </div>

      <p className="mt-3 text-[11px] leading-5 text-slate-500">
        {description}
      </p>

    </div>
  );
}

/* Learning Step */

function LearningStep({
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

