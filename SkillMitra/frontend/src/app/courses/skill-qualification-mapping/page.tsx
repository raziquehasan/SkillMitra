
"use client";

import {
  ArrowLeft,
  GraduationCap,
  Link2,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SkillQualificationMappingPage() {
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
              SKILL-QUALIFICATION MAPPING
            </p>

            <h1 className="mt-2 font-serif text-3xl font-semibold text-[#123b68]">
              Map Skills to Qualifications
            </h1>
          </div>

          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Map industry-required skills to relevant qualifications,
            courses and training pathways to improve alignment between
            workforce requirements and available training.
          </p>

          {/* Summary Cards */}
          <div className="mt-6 grid gap-4 md:grid-cols-3">

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <GraduationCap className="h-6 w-6 text-[#c2410c]" />

              <p className="mt-3 text-sm text-slate-500">
                Qualifications Mapped
              </p>

              <p className="mt-1 text-2xl font-bold text-[#123b68]">
                —
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <Link2 className="h-6 w-6 text-[#c2410c]" />

              <p className="mt-3 text-sm text-slate-500">
                Skills Mapped
              </p>

              <p className="mt-1 text-2xl font-bold text-[#123b68]">
                —
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <AlertTriangle className="h-6 w-6 text-[#c2410c]" />

              <p className="mt-3 text-sm text-slate-500">
                Mapping Gaps
              </p>

              <p className="mt-1 text-2xl font-bold text-[#123b68]">
                —
              </p>
            </div>

          </div>

          {/* Mapping Table */}
          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">

            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold text-[#123b68]">
                Skill to Qualification Mapping
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Connect industry-required skills with relevant
                qualifications and training pathways.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">

                <thead className="bg-[#f0f4f8]">
                  <tr>
                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Skill
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Industry Role
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Qualification
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Related Course
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Mapping Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      Skill and qualification mapping data will appear
                      here when published data is available.
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
              This mapping helps training planners identify suitable
              qualifications and courses for industry-required skills
              and highlight areas where relevant training pathways are
              missing or need improvement.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}

