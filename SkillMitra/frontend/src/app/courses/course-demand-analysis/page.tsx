
"use client";

import {
  ArrowLeft,
  BookOpen,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function CourseDemandAnalysisPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-[#1b2838]">
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
              COURSE DEMAND ANALYSIS
            </p>

            <h1 className="mt-2 font-serif text-3xl font-semibold text-[#123b68]">
              Analyse Course Supply and Industry Demand
            </h1>
          </div>

          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Compare available training capacity with industry demand to
            identify courses that may need capacity review or better
            alignment with emerging workforce requirements.
          </p>

          {/* Summary Cards */}
          <div className="mt-6 grid gap-4 md:grid-cols-3">

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <BookOpen className="h-6 w-6 text-[#c2410c]" />

              <p className="mt-3 text-sm text-slate-500">
                Courses Analysed
              </p>

              <p className="mt-1 text-2xl font-bold text-[#123b68]">
                —
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <TrendingDown className="h-6 w-6 text-[#c2410c]" />

              <p className="mt-3 text-sm text-slate-500">
                Lower-Demand Courses
              </p>

              <p className="mt-1 text-2xl font-bold text-[#123b68]">
                —
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <AlertTriangle className="h-6 w-6 text-[#c2410c]" />

              <p className="mt-3 text-sm text-slate-500">
                Capacity Review Needed
              </p>

              <p className="mt-1 text-2xl font-bold text-[#123b68]">
                —
              </p>
            </div>

          </div>

          {/* Analysis Table */}
          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">

            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold text-[#123b68]">
                Course Supply and Demand Analysis
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Compare course availability with recorded industry demand
                to identify areas where training capacity may need review.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">

                <thead className="bg-[#f0f4f8]">
                  <tr>
                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Course
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      District
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Training Availability
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Industry Demand
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Supply-Demand Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      Course supply and demand data will appear here when
                      published data is available.
                    </td>
                  </tr>
                </tbody>

              </table>
            </div>
          </div>

          {/* Planning Note */}
          <div className="mt-6 rounded-lg border border-[#c2410c]/20 bg-[#fff7ed] p-5">
            <h2 className="font-semibold text-[#123b68]">
              Planning Use
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              This analysis can help training planners review whether
              existing course capacity should be maintained, adjusted,
              redirected or aligned with emerging industry demand.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}

