"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';
import CandidateSidebar from "@/components/candidate/CandidateSidebar";
import { api } from "@/lib/api";

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-[#123b68]">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const completed = status === "Completed" || status === "completed";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        completed
          ? "bg-green-50 text-green-700"
          : "bg-blue-50 text-[#123b68]"
      }`}
    >
      {status}
    </span>
  );
}

function LearningCard({
  enrollment,
}: {
  enrollment: any;
}) {
  const course = enrollment.course;
  const completed = enrollment.status === 'completed';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-xl text-[#123b68]">
          ▤
        </div>

        <StatusBadge status={completed ? "Completed" : "In Progress"} />
      </div>

      <h3 className="mt-4 text-base font-bold text-slate-800">
        {course?.title || 'Course'}
      </h3>

      <p className="mt-1 text-sm font-medium text-[#123b68]">
        {course?.delivery_mode || 'In Person'}
      </p>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 p-3">
        <div>
          <p className="text-[11px] text-slate-400">
            Duration
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            {course?.duration_hours ? `${course.duration_hours} hours` : 'Not specified'}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[11px] text-slate-400">
            Status
          </p>

          <p className="mt-1 text-sm font-bold text-[#123b68]">
            {enrollment.status === 'enrolled' ? 'In Progress' : enrollment.status}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Enrollment Date
          </span>

          <span className="font-medium text-slate-600">
            {enrollment.enrollment_date
              ? new Date(enrollment.enrollment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'Not specified'}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#123b68]"
            style={{ width: completed ? '100%' : '0%' }}
          />
        </div>
      </div>

      {enrollment.grade_outcome && (
        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
          <p className="text-[11px] text-slate-400">
            Grade/Outcome
          </p>

          <p className="mt-1 text-sm font-medium text-slate-700">
            {enrollment.grade_outcome}
          </p>
        </div>
      )}

      <div className="mt-4 border-t border-slate-100 pt-4">
        <button
          type="button"
          className="w-full rounded-lg bg-[#123b68] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f3155]"
        >
          {completed ? "View Certificate" : "Continue Learning"}
        </button>
      </div>
    </div>
  );
}

export default function MyLearningPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [enrollmentsData, coursesData] = await Promise.all([
          api.candidateEnrollments(),
          api.courses()
        ]);
        setEnrollments(enrollmentsData);
        setCourses(coursesData.items);
      } catch (err) {
        console.error("Failed to load learning data:", err);
        setError("Unable to load learning data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Separate enrollments into active and completed
  const activeEnrollments = enrollments.filter(e => e.status === 'enrolled');
  const completedEnrollments = enrollments.filter(e => e.status === 'completed');

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
                  My Learning
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">
            {/* Intro */}
            <div className="mb-6">
              <p className="text-sm font-medium text-[#c2410c]">
                Learning Progress
              </p>

              <h1 className="mt-1 text-2xl font-bold text-[#123b68]">
                My Learning
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Track your ongoing courses, completed training and progress
                toward improving your career skills.
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Active Courses"
                value={String(activeEnrollments.length).padStart(2, "0")}
                description="Courses currently in progress"
              />

              <SummaryCard
                label="Completed"
                value={String(completedEnrollments.length).padStart(2, "0")}
                description="Courses successfully completed"
              />

              <SummaryCard
                label="Available Courses"
                value={String(courses.length)}
                description="Total courses in system"
              />

              <SummaryCard
                label="Total Enrollments"
                value={String(enrollments.length)}
                description="Your course enrollments"
              />
            </div>

            {/* Learning Intelligence */}
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#123b68]">
                    Learning Intelligence
                  </p>

                  <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                    You are actively developing skills in data analytics,
                    cloud computing and software development. Continue your
                    current learning path to strengthen your job readiness.
                  </p>
                </div>

                <Link
                  href="/candidate/training"
                  className="shrink-0 rounded-lg bg-[#123b68] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#0f3155]"
                >
                  Explore More Courses
                </Link>
              </div>
            </div>

            {/* Current Learning */}
            <div className="mt-8">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#123b68]">
                  Current Learning
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Courses you are currently pursuing.
                </p>
              </div>

              {loading ? (
                <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                  <p className="text-slate-500">Loading learning data...</p>
                </div>
              ) : error ? (
                <div className="rounded-xl border border-red-200 bg-white px-6 py-12 text-center shadow-sm">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : activeEnrollments.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {activeEnrollments.map((enrollment) => (
                    <LearningCard
                      key={enrollment.id}
                      enrollment={enrollment}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500">
                    ▤
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-700">
                    No active courses
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    You are not currently enrolled in any courses.
                  </p>
                  <Link
                    href="/candidate/training"
                    className="mt-4 inline-block rounded-lg bg-[#123b68] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0e3155]"
                  >
                    Explore Courses
                  </Link>
                </div>
              )}
            </div>

            {/* Learning Progress */}
            <div className="mt-8">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#123b68]">
                  Learning Progress
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your progress across active and completed learning.
                </p>
              </div>

              {activeEnrollments.length > 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="space-y-6">
                    {activeEnrollments.map((enrollment) => (
                      <div key={enrollment.id}>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {enrollment.course?.title || 'Course'}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {enrollment.course?.delivery_mode || 'In Person'} • {enrollment.course?.duration_hours || 0} hours
                            </p>
                          </div>

                          <div className="text-sm font-bold text-[#123b68]">
                            {enrollment.status === 'enrolled' ? 'In Progress' : enrollment.status}
                          </div>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-[#123b68]"
                            style={{
                              width: enrollment.status === 'completed' ? '100%' : '0%',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">No active learning progress to display.</p>
                </div>
              )}
            </div>

            {/* Completed Courses */}
            <div className="mt-8">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#123b68]">
                  Completed Courses
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Training programs you have successfully completed.
                </p>
              </div>

              {completedEnrollments.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-5 py-4">
                            Course
                          </th>

                          <th className="px-5 py-4">
                            Duration
                          </th>

                          <th className="px-5 py-4">
                            Completed On
                          </th>

                          <th className="px-5 py-4">
                            Grade
                          </th>

                          <th className="px-5 py-4">
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {completedEnrollments.map((enrollment) => (
                          <tr
                            key={enrollment.id}
                            className="hover:bg-slate-50"
                          >
                            <td className="px-5 py-4 font-semibold text-slate-800">
                              {enrollment.course?.title || 'Course'}
                            </td>

                            <td className="px-5 py-4 text-slate-600">
                              {enrollment.course?.duration_hours ? `${enrollment.course.duration_hours} hours` : 'Not specified'}
                            </td>

                            <td className="px-5 py-4 text-slate-600">
                              {enrollment.completion_date
                                ? new Date(enrollment.completion_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                : 'Not specified'}
                            </td>

                            <td className="px-5 py-4 text-slate-600">
                              {enrollment.grade_outcome || 'Not specified'}
                            </td>

                            <td className="px-5 py-4">
                              <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                                Completed
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500">
                    ✓
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-700">
                    No completed courses
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    You haven't completed any courses yet.
                  </p>
                </div>
              )}
            </div>

            {/* Learning Goals */}
            <div className="mt-8">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#123b68]">
                  Learning Goals
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Focus areas based on your current skill gaps.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Learning goals will be personalized based on your skill gaps and career interests. Check back after updating your skills and profile.
                </p>
                <Link
                  href="/candidate/skills"
                  className="mt-4 inline-block rounded-lg bg-[#123b68] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0e3155]"
                >
                  Update Skills
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Link
                href="/candidate/training"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md"
              >
                <p className="font-semibold text-[#123b68]">
                  Find More Courses
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Explore additional training opportunities aligned with
                  your profile.
                </p>

                <span className="mt-4 inline-block text-sm font-semibold text-[#123b68]">
                  Explore Courses →
                </span>
              </Link>

              <Link
                href="/candidate/skill-gap"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md"
              >
                <p className="font-semibold text-[#123b68]">
                  Skill Gap Analysis
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Check which skills should be improved next.
                </p>

                <span className="mt-4 inline-block text-sm font-semibold text-[#123b68]">
                  View Analysis →
                </span>
              </Link>

              <Link
                href="/candidate/skills"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md"
              >
                <p className="font-semibold text-[#123b68]">
                  My Skills
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Review your current skills and proficiency levels.
                </p>

                <span className="mt-4 inline-block text-sm font-semibold text-[#123b68]">
                  View Skills →
                </span>
              </Link>
            </div>

            {/* Footer Note */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#123b68]">
                  ✦
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#123b68]">
                    SkillMitra Learning Intelligence
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Keep progressing through relevant training to strengthen
                    your skills and improve your readiness for suitable job
                    opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}