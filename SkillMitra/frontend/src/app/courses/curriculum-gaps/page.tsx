
"use client";

import { ArrowLeft, BookOpen, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CurriculumGapsPage() {
  const router = useRouter();

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
                —
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <AlertTriangle className="h-6 w-6 text-[#c2410c]" />

              <p className="mt-3 text-sm text-slate-500">
                Curriculum Gaps
              </p>

              <p className="mt-1 text-2xl font-bold text-[#123b68]">
                —
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <BookOpen className="h-6 w-6 text-[#c2410c]" />

              <p className="mt-3 text-sm text-slate-500">
                Courses Needing Review
              </p>

              <p className="mt-1 text-2xl font-bold text-[#123b68]">
                —
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
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      Curriculum gap data will appear here when
                      published data is available.
                    </td>
                  </tr>
                </tbody>

              </table>
            </div>

          </div>

        </div>
      </section>
    </main>
  );
}

