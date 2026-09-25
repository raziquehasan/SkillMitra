
"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  TrendingDown,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface CourseDemandAnalysis {
  course_id: string;
  course_title: string;
  demand_level: string;
  demand_signals_count: number;
  oversupply_indicators: string[];
  recommendation: string;
}

export default function CourseDemandAnalysisPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<CourseDemandAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await api.courseDemandAnalysis();
        if (!cancelled) {
          setAnalysis(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load course demand analysis:", err);
          setError("Failed to load course demand analysis data");
          setAnalysis([]);
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
  const coursesAnalysed = analysis.length;
  const lowerDemandCourses = analysis.filter(a => a.demand_level === "Low Demand").length;
  const capacityReviewNeeded = analysis.filter(a => a.oversupply_indicators.length > 0).length;

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
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : coursesAnalysed}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <TrendingDown className="h-6 w-6 text-[#c2410c]" />

              <p className="mt-3 text-sm text-slate-500">
                Lower-Demand Courses
              </p>

              <p className="mt-1 text-2xl font-bold text-[#123b68]">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : lowerDemandCourses}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <AlertTriangle className="h-6 w-6 text-[#c2410c]" />

              <p className="mt-3 text-sm text-slate-500">
                Capacity Review Needed
              </p>

              <p className="mt-1 text-2xl font-bold text-[#123b68]">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : capacityReviewNeeded}
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
                      Demand Level
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Demand Signals
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Oversupply Indicators
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Recommendation
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Loading course demand analysis...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                        {error}
                      </td>
                    </tr>
                  ) : analysis.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                        No course demand analysis data available.
                      </td>
                    </tr>
                  ) : (
                    analysis.map((item, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="px-5 py-3 font-medium text-[#123b68]">
                          {item.course_title}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                            item.demand_level === "High Demand"
                              ? "bg-green-100 text-green-700"
                              : item.demand_level === "Growing"
                              ? "bg-blue-100 text-blue-700"
                              : item.demand_level === "Moderate"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {item.demand_level}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {item.demand_signals_count}
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {item.oversupply_indicators.length > 0 ? (
                            <ul className="list-disc list-inside">
                              {item.oversupply_indicators.map((indicator, i) => (
                                <li key={i} className="text-xs">{indicator}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-green-600">None</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {item.recommendation}
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

