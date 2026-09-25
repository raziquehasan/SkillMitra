
"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  BarChart3,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface EmployerTrainingOutcome {
  course_id: string;
  course_title: string;
  employer_requirements: string[];
  training_outcomes: string[];
  alignment_score: number;
  gaps: string[];
}

export default function EmployerTrainingOutcomesPage() {
  const router = useRouter();
  const [outcomes, setOutcomes] = useState<EmployerTrainingOutcome[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await api.employerTrainingOutcomes();
        if (!cancelled) {
          setOutcomes(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load employer training outcomes:", err);
          setError("Failed to load employer training outcomes data");
          setOutcomes([]);
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
  const totalEmployerRequirements = outcomes.reduce((sum, o) => sum + o.employer_requirements.length, 0);
  const totalTrainingOutcomes = outcomes.reduce((sum, o) => sum + o.training_outcomes.length, 0);
  const averageAlignment = outcomes.length > 0 
    ? outcomes.reduce((sum, o) => sum + o.alignment_score, 0) / outcomes.length 
    : 0;
  const alignmentGaps = outcomes.filter(o => o.alignment_score < 70).length;

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
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalEmployerRequirements}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <GraduationCap className="h-6 w-6 text-[#c2410c]" />

              <p className="mt-3 text-sm text-slate-500">
                Training Outcomes
              </p>

              <p className="mt-1 text-2xl font-bold text-[#123b68]">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalTrainingOutcomes}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <BarChart3 className="h-6 w-6 text-[#c2410c]" />

              <p className="mt-3 text-sm text-slate-500">
                Alignment Gaps
              </p>

              <p className="mt-1 text-2xl font-bold text-[#123b68]">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : alignmentGaps}
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
                      Course
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Employer Requirements
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Training Outcomes
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Alignment Score
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Gaps
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Loading employer training outcomes...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                        {error}
                      </td>
                    </tr>
                  ) : outcomes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                        No employer training outcome data available.
                      </td>
                    </tr>
                  ) : (
                    outcomes.map((item, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="px-5 py-3 font-medium text-[#123b68]">
                          {item.course_title}
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          <ul className="list-disc list-inside">
                            {item.employer_requirements.map((req, i) => (
                              <li key={i} className="text-xs">{req}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          <ul className="list-disc list-inside">
                            {item.training_outcomes.map((outcome, i) => (
                              <li key={i} className="text-xs">{outcome}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-slate-200">
                              <div
                                className="h-2 rounded-full bg-[#123b68]"
                                style={{ width: `${item.alignment_score}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-[#123b68]">
                              {item.alignment_score.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {item.gaps.length > 0 ? (
                            <ul className="list-disc list-inside">
                              {item.gaps.map((gap, i) => (
                                <li key={i} className="text-xs text-red-600">{gap}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-green-600">No gaps</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
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

