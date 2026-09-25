
"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  BookOpen,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface RecommendedUpdate {
  course_id: string;
  course_title: string;
  update_type: string;
  priority: string;
  suggested_changes: string[];
  impact: string;
}

export default function RecommendedUpdatesPage() {
  const router = useRouter();
  const [updates, setUpdates] = useState<RecommendedUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await api.recommendedUpdates();
        if (!cancelled) {
          setUpdates(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load recommended updates:", err);
          setError("Failed to load recommended updates data");
          setUpdates([]);
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
  const coursesReviewed = updates.length;
  const updatesRecommended = updates.length;
  const priorityUpdates = updates.filter(u => u.priority === "High").length;

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
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : coursesReviewed}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <RefreshCw className="h-6 w-6 text-[#c2410c]" />

              <p className="mt-3 text-sm text-slate-500">
                Updates Recommended
              </p>

              <p className="mt-1 text-2xl font-bold text-[#123b68]">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : updatesRecommended}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <CheckCircle className="h-6 w-6 text-[#c2410c]" />

              <p className="mt-3 text-sm text-slate-500">
                Priority Updates
              </p>

              <p className="mt-1 text-2xl font-bold text-[#123b68]">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : priorityUpdates}
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
                      Update Type
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Priority
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Suggested Changes
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Impact
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Loading recommended updates...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                        {error}
                      </td>
                    </tr>
                  ) : updates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                        No course update recommendations needed. Courses are well-aligned.
                      </td>
                    </tr>
                  ) : (
                    updates.map((item, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="px-5 py-3 font-medium text-[#123b68]">
                          {item.course_title}
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {item.update_type}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                            item.priority === "High"
                              ? "bg-red-100 text-red-700"
                              : item.priority === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}>
                            {item.priority}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          <ul className="list-disc list-inside">
                            {item.suggested_changes.map((change, i) => (
                              <li key={i} className="text-xs">{change}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {item.impact}
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