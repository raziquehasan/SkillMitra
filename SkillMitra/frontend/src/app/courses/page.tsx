
"use client";

import { useEffect, useState } from "react";
import { ExternalLink, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { api, HomepageCourse } from "@/lib/api";

export default function CoursesPage() {
  const router = useRouter();

  const [homepageCourses, setHomepageCourses] = useState<HomepageCourse[]>([]);
  const [homepageCoursesLoading, setHomepageCoursesLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setHomepageCoursesLoading(true);

      try {
        const coursesRes = await api.homepageCourses();

        if (cancelled) return;

        setHomepageCourses(coursesRes);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load homepage courses:", error);
          setHomepageCourses([]);
        }
      } finally {
        if (!cancelled) {
          setHomepageCoursesLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {/* ================= CURRICULUM ALIGNMENT ================= */}
      <section
        id="curriculum-alignment"
        className="border-b border-slate-200 bg-[#f0f4f8]"
      >
        <div className="mx-auto max-w-7xl px-5 py-5 lg:py-6">

          {/* Section Heading */}
          <div className="pt-1">
            <p className="text-sm font-bold tracking-wide text-[#c2410c]">
              04 CURRICULUM ALIGNMENT
            </p>

            <h1 className="mt-2 text-3xl font-semibold text-[#123b68]">
              Keep Training Aligned with Industry
            </h1>
          </div>

          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Course alignment ensures training content matches employer
            requirements and current skill demand.
          </p>

          {/* Alignment Flow */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
            <div className="grid gap-4 md:grid-cols-5">

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-bold text-[#c2410c]">1.</p>
                <p className="mt-2 font-semibold text-[#123b68]">
                  Industry Requirement
                </p>
                <ArrowRight className="mt-4 h-5 w-5 text-slate-400" />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-bold text-[#c2410c]">2.</p>
                <p className="mt-2 font-semibold text-[#123b68]">
                  Required Skills
                </p>
                <ArrowRight className="mt-4 h-5 w-5 text-slate-400" />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-bold text-[#c2410c]">3.</p>
                <p className="mt-2 font-semibold text-[#123b68]">
                  Current Course
                </p>
                <ArrowRight className="mt-4 h-5 w-5 text-slate-400" />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-bold text-[#c2410c]">4.</p>
                <p className="mt-2 font-semibold text-[#123b68]">
                  Skill/Curriculum Gap
                </p>
                <ArrowRight className="mt-4 h-5 w-5 text-slate-400" />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-bold text-[#c2410c]">5.</p>
                <p className="mt-2 font-semibold text-[#123b68]">
                  Recommended Update
                </p>
              </div>

            </div>
          </div>

          {/* Alignment Objectives */}
          
<div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">

  <button
    type="button"
    onClick={() => router.push("/courses/curriculum-gaps")}
    className="rounded-lg border border-slate-200 bg-white p-5 text-left transition hover:border-[#c2410c] hover:shadow-md"
  >
    <p className="font-semibold text-[#123b68]">
      Identify curriculum gaps
    </p>
  </button>

  <button
    type="button"
    onClick={() => router.push("/courses/outdated-content")}
    className="rounded-lg border border-slate-200 bg-white p-5 text-left transition hover:border-[#c2410c] hover:shadow-md"
  >
    <p className="font-semibold text-[#123b68]">
      Identify outdated course content
    </p>
  </button>

 <button
  type="button"
  onClick={() => router.push("/courses/course-demand-analysis")}
  className="rounded-lg border border-slate-200 bg-white p-5 text-left transition hover:border-[#c2410c] hover:shadow-md"
>
  <p className="font-semibold text-[#123b68]">
    Identify oversupplied courses
  </p>
</button>

  <button
    type="button"
    onClick={() => router.push("/courses/skill-qualification-mapping")}
    className="rounded-lg border border-slate-200 bg-white p-5 text-left transition hover:border-[#c2410c] hover:shadow-md"
  >
    <p className="font-semibold text-[#123b68]">
      Map skills to qualifications
    </p>
  </button>

  <button
    type="button"
    onClick={() => router.push("/courses/recommended-updates")}
    className="rounded-lg border border-slate-200 bg-white p-5 text-left transition hover:border-[#c2410c] hover:shadow-md"
  >
    <p className="font-semibold text-[#123b68]">
      Recommend course updates
    </p>
  </button>

  <button
    type="button"
    onClick={() => router.push("/courses/employer-training-outcomes")}
    className="rounded-lg border border-slate-200 bg-white p-5 text-left transition hover:border-[#c2410c] hover:shadow-md"
  >
    <p className="font-semibold text-[#123b68]">
      Compare employer requirements with training outcomes
    </p>
  </button>

</div>


          {/* ================= COURSES ================= */}
          <div className="mt-10">

            <h2 className="text-2xl font-bold text-[#123b68]">
              Courses currently listed
            </h2>

            <p className="mt-2 text-slate-600">
              Course records will display here when they are published in the
              platform catalogue.
            </p>

            {homepageCoursesLoading ? (

              <div className="mt-8 rounded-xl border bg-white py-12 text-center">
                <p className="text-slate-600">
                  Loading courses...
                </p>
              </div>

            ) : homepageCourses.length > 0 ? (

              <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

                {homepageCourses.map((course) => (

                  <article
                    key={course.id}
                    className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                  >

                    {/* Demand */}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        course.demandLevel === "High Demand"
                          ? "bg-green-100 text-green-700"
                          : course.demandLevel === "Growing"
                          ? "bg-blue-100 text-blue-700"
                          : course.demandLevel === "Moderate"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {course.demandLevel}
                    </span>

                    {/* Course Title */}
                    <h3 className="mt-5 text-xl font-bold text-[#123b68]">
                      {course.title}
                    </h3>

                    {/* District */}
                    {course.district && (
                      <p className="mt-2 text-sm text-slate-500">
                        📍 {course.district}
                      </p>
                    )}

                    {/* Skills */}
                    {course.skills.length > 0 && (
                      <p className="mt-3 text-sm text-slate-600">
                        {course.skills.slice(0, 3).join(" • ")}
                        {course.skills.length > 3 && " • ..."}
                      </p>
                    )}

                    {/* Duration */}
                    {course.durationHours && (
                      <p className="mt-2 text-sm text-slate-500">
                        Duration: {course.durationHours} hours
                      </p>
                    )}

                    {/* Provider */}
                    {course.isRelatedProgramme &&
                    course.relatedProgrammeName ? (
                      <p className="mt-2 text-sm text-slate-600">
                        Related Programme: {course.relatedProgrammeName}
                      </p>
                    ) : (
                      course.providerName && (
                        <p className="mt-2 text-sm text-slate-600">
                          Provider: {course.providerName}
                        </p>
                      )
                    )}

                    {/* Buttons */}
                    <div className="mt-5 flex flex-col gap-2">

                      <button
                        onClick={() =>
                          router.push(`/courses/${course.id}`)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded border border-[#123b68] px-4 py-2 text-sm font-semibold text-[#123b68] transition-colors hover:bg-[#123b68] hover:text-white"
                      >
                        View Course →
                      </button>

                      {(course.courseUrl || course.providerUrl) && (
                        <a
                          href={
                            course.courseUrl ||
                            course.providerUrl ||
                            "#"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 text-sm text-blue-600 transition-colors hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Original Source
                        </a>
                      )}

                    </div>
                  </article>

                ))}

              </div>

            ) : (

              <div className="mt-8 rounded-xl border bg-white py-12 text-center">
                <p className="text-slate-600">
                  No courses currently available with official URLs.
                </p>
              </div>

            )}

          </div>

        </div>
      </section>
    </main>
  );
}

