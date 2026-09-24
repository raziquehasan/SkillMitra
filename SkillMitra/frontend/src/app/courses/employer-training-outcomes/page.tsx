
"use client";

import {
  ArrowLeft,
  Building2,
  GraduationCap,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function EmployerTrainingOutcomesPage() {
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
              EMPLOYER & TRAINING OUTCOMES
            </p>

            <h1 className="mt-2 font-serif text-3xl font-semibold text-[#123b68]">
              Compare Employer Requirements with Training Outcomes
            </h1>
          </div>

          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Compare the skills and qualifications expected by employers
            with the outcomes produced through existing training and
            courses.
          </p>

          {/* Summary Cards */}
          <div className="mt-6 grid gap-4 md:grid-cols-3">

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <Building2 className="h-6 w-6 text-[#c2410c]" />

              <p className="mt-3 text-sm text-slate-500">
                Employer Requirements
              </p>

              <p className="mt-1 text-2xl font-bold text-[#123b68]">
                —
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <GraduationCap className="h-6 w-6 text-[#c2410c]" />

              <p className="mt-3 text-sm text-slate-500">
                Training Outcomes
              </p>

              <p className="mt-1 text-2xl font-bold text-[#123b68]">
                —
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <BarChart3 className="h-6 w-6 text-[#c2410c]" />

              <p className="mt-3 text-sm text-slate-500">
                Alignment Gaps
              </p>

              <p className="mt-1 text-2xl font-bold text-[#123b68]">
                —
              </p>
            </div>

          </div>

          {/* Comparison Table */}
          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">

            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold text-[#123b68]">
                Employer and Training Outcome Comparison
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Compare employer expectations with the skills and
                qualifications reported through training outcomes.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">

                <thead className="bg-[#f0f4f8]">
                  <tr>
                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Industry Role
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Employer Requirement
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Training Outcome
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Required Qualification
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Alignment Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      Employer and training outcome data will appear here
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
              This comparison can help training planners understand
              whether existing courses are producing outcomes that match
              the skills and qualifications expected by employers.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}

