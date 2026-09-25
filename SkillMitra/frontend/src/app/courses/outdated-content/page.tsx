
"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, RefreshCw, AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface OutdatedContent {
  course_id: string;
  course_title: string;
  current_content: string;
  current_industry_skill: string;
  review_status: string;
  suggested_update: string;
  last_updated: string | null;
}

export default function OutdatedContentPage() {
  const router = useRouter();
  const [content, setContent] = useState<OutdatedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await api.outdatedContent();
        if (!cancelled) {
          setContent(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load outdated content:", err);
          setError("Failed to load outdated content data");
          setContent([]);
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
  const coursesReviewed = content.length;
  const contentRequiringReview = content.filter(c => c.review_status === "Needs Review").length;
  const recommendedUpdates = content.length;

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-[#1b2838]">
      {/* Top Orange Line */}
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
              OUTDATED COURSE CONTENT
            </p>

            <h1 className="mt-2 font-serif text-3xl font-semibold text-[#123b68]">
              Identify Outdated Course Content
            </h1>
          </div>

          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Identify course content that may no longer match current
            industry requirements, technologies and job-related skills.
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
                Content Requiring Review
              </p>

              <p className="mt-1 text-2xl font-bold text-[#123b68]">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : contentRequiringReview}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <RefreshCw className="h-6 w-6 text-[#c2410c]" />

              <p className="mt-3 text-sm text-slate-500">
                Recommended Updates
              </p>

              <p className="mt-1 text-2xl font-bold text-[#123b68]">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : recommendedUpdates}
              </p>
            </div>

          </div>

          {/* Analysis Table */}
          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">

            <div className="border-b border-slate-200 p-5">
              <h2 className="text-xl font-bold text-[#123b68]">
                Course Content Review
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Compare existing course content with current industry
                requirements and identify areas that may need updating.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">

                <thead className="bg-[#f0f4f8]">
                  <tr>
                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Course
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Current Content
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Current Industry Skill
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Review Status
                    </th>

                    <th className="px-5 py-3 font-semibold text-[#123b68]">
                      Suggested Update
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Loading outdated content data...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                        {error}
                      </td>
                    </tr>
                  ) : content.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                        All course content is up-to-date with current industry requirements.
                      </td>
                    </tr>
                  ) : (
                    content.map((item, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="px-5 py-3 font-medium text-[#123b68]">
                          {item.course_title}
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {item.current_content}
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {item.current_industry_skill}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                            item.review_status === "Needs Review"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}>
                            {item.review_status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {item.suggested_update}
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

