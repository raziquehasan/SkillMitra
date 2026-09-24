
"use client";

import {
  ArrowLeft,
  RefreshCw,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function RecommendedUpdatesPage() {
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
              RECOMMENDED COURSE UPDATES
            </p>

            <h1 className="mt-2 font-serif text-3xl font-semibold text-[#123b68]">
              Recommend Course Updates
            </h1>
          </div>

          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Recommend updates to course content based on industry demand,
            emerging skills, curriculum gaps and changing workforce
            requirements.
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
              <RefreshCw className="h-6 w-6 text-[#c2410c]" />

              <p className="mt-3 text-sm text-slate-500">
                Updates Recommended
              </p>

              <p className="mt-1 text-2xl font-bold text-[#123b68]">
                —
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <CheckCircle className="h-6 w-6 text-[#c2410c]" />

              <p className="mt-3 text-sm text-slate-500">
                Priority Updates
              </p>

              <p className="mt-1 text-2xl font-bold text-[#123b68]">
                —
              </p>
            </div>

          </div>

          {/* Recommendation Table */}
          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">

            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold text-[#123b68]">
                Course Update Recommendations
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Identify course areas that may require new skills,
                revised content or updated training components.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">

                <thead className="bg-[#f0f4f8]">
                  <tr>
                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Course
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Current Skill Area
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Industry Requirement
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Recommended Update
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Priority
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      Course update recommendations will appear here
                      when published data is available.
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
              These recommendations can support curriculum planners in
              deciding which course content, skills or training
              components may need to be reviewed and updated.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}