
"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface CurriculumGap {
  course_id: string;
  course_title: string;
  required_skill_id: string;
  required_skill_name: string;
  curriculum_coverage: string;
  gap: string;
  priority: string;
}

export default function CurriculumGapsPage() {
  const router = useRouter();
  const [gaps, setGaps] = useState<CurriculumGap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await api.curriculumGaps();
        if (!cancelled) {
          setGaps(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load curriculum gaps:", err);
          setError("Failed to load curriculum gap data");
          setGaps([]);
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

  // Calculate summary stats
  const coursesReviewed = new Set(gaps.map(g => g.course_id)).size;
  const totalGaps = gaps.length;
  const coursesNeedingReview = coursesReviewed;

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-[#1b2838]">
      {/* Top Government Line */}
      <div className="h-1 bg-[#c2410c]" />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-5 lg:py-6">

          {/* Back Button */}
          <button
            type="button"
            onClick={() => router.push("/courses")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#123b68] hover:text-[#c2410c]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </button>

          {/* Heading */}
          <div className="pt-1">
            <p className="text-sm font-bold tracking-wide text-[#c2410c]">
              CURRICULUM GAPS
            </p>

            <h1 className="mt-2 font-serif text-3xl font-semibold text-[#123b68]">
              Identify Curriculum Gaps
            </h1>
          </div>

          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Identify where current course content does not fully cover the
            skills required by industries and employers.
          </p>

          {/* Summary Cards */}
          <div className="mt-6 grid gap-4 md:grid-cols-3">

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <BookOpen className="h-6 w-6 text-[#c2410c]" />

              <p className="mt-3 text-sm text-slate-500">
                Courses Reviewed
              </p>

              <p className="mt-1 text-2xl font-bold text-[#123b68]">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : coursesReviewed}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <AlertTriangle className="h-6 w-6 text-[#c2410c]" />

              <p className="mt-3 text-sm text-slate-500">
                Curriculum Gaps
              </p>

              <p className="mt-1 text-2xl font-bold text-[#123b68]">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalGaps}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <BookOpen className="h-6 w-6 text-[#c2410c]" />

              <p className="mt-3 text-sm text-slate-500">
                Courses Needing Review
              </p>

              <p className="mt-1 text-2xl font-bold text-[#123b68]">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : coursesNeedingReview}
              </p>
            </div>

          </div>

          {/* Data Table */}
          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">

            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold text-[#123b68]">
                Curriculum Gap Analysis
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Course-level comparison between current curriculum and
                industry-required skills.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">

                <thead className="bg-[#f0f4f8]">
                  <tr>
                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Course
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Required Skill
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Curriculum Coverage
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Gap
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center text-slate-500">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Loading curriculum gap data...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center text-slate-500">
                        {error}
                      </td>
                    </tr>
                  ) : gaps.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center text-slate-500">
                        No curriculum gaps found. Courses are well-aligned with industry requirements.
                      </td>
                    </tr>
                  ) : (
                    gaps.map((gap, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="px-5 py-3 font-medium text-[#123b68]">
                          {gap.course_title}
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {gap.required_skill_name}
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {gap.curriculum_coverage}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                            gap.priority === "High" 
                              ? "bg-red-100 text-red-700" 
                              : gap.priority === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}>
                            {gap.gap}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

              </table>
            </div>

          </div>

        </div>
      </section>
    </main>
  );
}

