"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type CareerPlan = {
  id: string;
  district_id: string | null;
  district_name: string;
  sector: string;
  priority_skills: string[];
  pg_training: string[];
  job_roles: string[];
  created_at: string;
  related_courses: Array<{
    id: string;
    title: string;
    description: string | null;
    district_id: string | null;
    status: string;
    skills_covered: string[];
  }>;
  related_jobs: Array<{
    id: string;
    title: string;
    company_name: string | null;
    district_id: string | null;
    status: string;
    posted_date: string | null;
  }>;
};

const studyOptions = [
  {
    icon: "🔬",
    title: "Science",
    description:
      "For students interested in Science, Mathematics, technology and scientific subjects.",
    options: [
      "PCM – Physics, Chemistry, Mathematics",
      "PCB – Physics, Chemistry, Biology",
      "PCMB – Physics, Chemistry, Mathematics, Biology",
      "Basic Sciences",
      "Engineering & Technology",
      "Medical & Healthcare",
    ],
  },
  {
    icon: "💼",
    title: "Commerce",
    description:
      "For students interested in business, finance, accounts and economics.",
    options: [
      "Accountancy",
      "Economics",
      "Business Studies",
      "Banking & Finance",
      "Management",
      "Entrepreneurship",
    ],
  },
  {
    icon: "🎨",
    title: "Arts / Humanities",
    description:
      "For students interested in society, languages, creativity and humanities.",
    options: [
      "History",
      "Political Science",
      "Geography",
      "Psychology",
      "Sociology",
      "Languages",
      "Law",
      "Media & Journalism",
    ],
  },
  {
    icon: "🛠️",
    title: "ITI",
    description:
      "For students who want to develop practical and technical skills.",
    options: [
      "Electrician",
      "Fitter",
      "Welder",
      "COPA / Computer",
      "Mechanic",
      "Electronics",
      "Plumber",
    ],
  },
  {
    icon: "🏗️",
    title: "Diploma / Polytechnic",
    description:
      "A technical education pathway for students interested in engineering and technology.",
    options: [
      "Civil Engineering",
      "Mechanical Engineering",
      "Electrical Engineering",
      "Computer Engineering",
      "Electronics",
      "Automobile Engineering",
    ],
  },
  {
    icon: "💻",
    title: "Vocational / Skill Courses",
    description:
      "Job-oriented courses focused on practical and industry-relevant skills.",
    options: [
      "Computer & IT",
      "Healthcare",
      "Retail",
      "Tourism & Hospitality",
      "Beauty & Wellness",
      "Media & Design",
      "Agriculture",
    ],
  },
  {
    icon: "🌾",
    title: "Agriculture & Allied Fields",
    description:
      "For students interested in agriculture and related rural-sector fields.",
    options: [
      "Agriculture",
      "Horticulture",
      "Dairy",
      "Fisheries",
      "Animal Husbandry",
    ],
  },
  {
    icon: "🎭",
    title: "Creative & Other Fields",
    description:
      "Explore creative, sports and other specialised education pathways.",
    options: [
      "Fine Arts",
      "Design",
      "Hotel Management",
      "Sports",
      "Performing Arts",
      "Defence-oriented Preparation",
    ],
  },
];

export default function Class10Page() {
  const [showCareerPlanning, setShowCareerPlanning] = useState(false);
  const [careerData, setCareerData] = useState<CareerPlan[]>([]);
  const [districts, setDistricts] = useState<Array<{district_id: string; district_name: string; plan_count: number}>>([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCareerPlanning = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [districtsData, data] = await Promise.all([
        api.careerPlanningDistricts().catch(() => []),
        api.careerPlanning({ district_id: selectedDistrict || undefined }).catch(() => ({ plans: [] })),
      ]);
      
      setDistricts(districtsData);
      setCareerData(data.plans);
      setShowCareerPlanning(true);
    } catch (err) {
      console.error("Failed to load career planning:", err);
      setError("Unable to load career planning data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">

      {/* Top Bar */}
      <div className="border-b bg-slate-100">
        <div className="mx-auto max-w-7xl px-6 py-2 text-sm text-slate-600">
          Government of Maharashtra | Skill Development, Employment &
          Entrepreneurship Department
        </div>
      </div>

      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link href="/">
            <img
              src="/skillmitra-logo.png"
              alt="SkillMitra"
              className="h-16 w-auto"
            />
          </Link>

          <Link
            href="/"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            ← Home
          </Link>

        </div>
      </header>

      {/* Hero */}
      <section className="bg-blue-700 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">

          <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">
            Career Planning • Class 10
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            What Can You Study After Class 10?
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-7 text-blue-100">
            Explore different study, skill and career pathways available
            after Class 10. Choose a path based on your interests and goals.
          </p>

        </div>
      </section>

      {/* Study Options */}
      <section className="mx-auto max-w-7xl px-6 py-12">

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Study & Career Pathways
          </h2>

          <p className="mt-2 text-slate-600">
            Explore the major education and career options available after Class 10.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">

          {studyOptions.map((field) => (
            <div
              key={field.title}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  {field.icon}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {field.title}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {field.description}
                  </p>
                </div>

              </div>

              <div className="mt-5 border-t pt-5">

                <p className="mb-3 text-sm font-semibold text-slate-700">
                  Areas you can explore:
                </p>

                <div className="grid gap-2 sm:grid-cols-2">

                  {field.options.map((option) => (
                    <div
                      key={option}
                      className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    >
                      ✓ {option}
                    </div>
                  ))}

                </div>

              </div>

            </div>
          ))}

        </div>

      </section>

      {/* Career Planning Intelligence Section */}
      <section className="mx-auto max-w-7xl px-6 pb-12">

        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                District Career Intelligence
              </h2>

              <p className="mt-2 text-slate-600">
                View real career planning data for Maharashtra districts based on industry analysis and labour market demand.
              </p>
            </div>

            <button
              onClick={loadCareerPlanning}
              disabled={loading}
              className="rounded-lg bg-[#123b68] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0f3155] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "View Career Intelligence →"}
            </button>

          </div>

        </div>

      </section>

      {/* Career Planning Modal/Section */}
      {showCareerPlanning && (
        <section className="mx-auto max-w-7xl px-6 pb-12">

          <div className="rounded-xl border bg-white p-6 shadow-sm">

            <div className="mb-6 grid gap-4 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  District
                </label>

                <select 
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  <option value="">All Districts</option>
                  {districts.map((district) => (
                    <option key={district.district_id} value={district.district_id}>
                      {district.district_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={loadCareerPlanning}
                  disabled={loading}
                  className="rounded-lg bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Refresh Data"}
                </button>
              </div>

            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {careerData.length > 0 ? (
              <div className="space-y-4">

                <h3 className="text-lg font-bold text-slate-900">
                  Career Planning Data
                </h3>

                {careerData.slice(0, 5).map((plan) => (
                  <div
                    key={plan.id}
                    className="rounded-lg border border-slate-200 p-4"
                  >

                    <div className="flex flex-wrap items-center gap-3 mb-3">

                      <span className="font-semibold text-slate-900">
                        {plan.district_name}
                      </span>

                      <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                        {plan.sector}
                      </span>

                    </div>

                    <div className="grid gap-3 md:grid-cols-3 text-sm">

                      <div>
                        <p className="font-semibold text-slate-700">Skills:</p>
                        <p className="text-slate-600">{plan.priority_skills.slice(0, 3).join(", ")}{plan.priority_skills.length > 3 ? "..." : ""}</p>
                      </div>

                      <div>
                        <p className="font-semibold text-slate-700">Training:</p>
                        <p className="text-slate-600">{plan.pg_training.slice(0, 2).join(", ")}{plan.pg_training.length > 2 ? "..." : ""}</p>
                      </div>

                      <div>
                        <p className="font-semibold text-slate-700">Roles:</p>
                        <p className="text-slate-600">{plan.job_roles.join(", ")}</p>
                      </div>

                    </div>

                    {plan.related_courses && plan.related_courses.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="font-semibold text-slate-700 text-sm">Related Courses:</p>
                        <div className="mt-2 space-y-1">
                          {plan.related_courses.slice(0, 2).map((course) => (
                            <div key={course.id} className="text-xs text-slate-600">
                              • {course.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {plan.related_jobs && plan.related_jobs.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="font-semibold text-slate-700 text-sm">Live Jobs:</p>
                        <div className="mt-2 space-y-1">
                          {plan.related_jobs.slice(0, 2).map((job) => (
                            <div key={job.id} className="text-xs text-slate-600">
                              • {job.title} {job.company_name && `(${job.company_name})`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                ))}

                {careerData.length > 5 && (
                  <p className="text-sm text-slate-500 text-center">
                    Showing 5 of {careerData.length} career plans
                  </p>
                )}

              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                {loading ? "Loading career planning data..." : "No career planning data available for the selected district."}
              </div>
            )}

          </div>

        </section>
      )}

      {/* Career Guidance */}
      <section className="mx-auto max-w-7xl px-6 pb-12">

        <div className="rounded-2xl border bg-white p-7 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900">
            How Should You Choose?
          </h2>

          <p className="mt-2 text-slate-600">
            Consider your interests, strengths, subjects and future career goals
            before selecting a pathway.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">

            <div className="rounded-xl bg-blue-50 p-4">
              <p className="font-semibold text-slate-900">
                ❤️ Your Interests
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Which subjects or fields do you enjoy the most?
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <p className="font-semibold text-slate-900">
                💡 Your Strengths
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Which subjects and skills are you strongest in?
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <p className="font-semibold text-slate-900">
                🎯 Your Career Goal
              </p>
              <p className="mt-1 text-sm text-slate-600">
                What type of career would you like to pursue in the future?
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <p className="font-semibold text-slate-900">
                📚 Your Learning Path
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Choose between academic education, diploma, ITI or skill training.
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-14">

        <div className="rounded-2xl bg-slate-900 p-7 text-white">

          <h2 className="text-2xl font-bold">
            Plan Your Career with SkillMitra
          </h2>

          <p className="mt-2 max-w-2xl text-slate-300">
            Explore skills, courses, industry demand and career opportunities
            to make informed career decisions.
          </p>

          <Link
            href="/"
            className="mt-5 inline-block rounded-lg bg-white px-5 py-3 font-semibold text-slate-900 hover:bg-slate-100"
          >
            Explore SkillMitra →
          </Link>

        </div>

      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-sm text-slate-500">
          © 2026 SkillMitra — Career Planning
        </div>
      </footer>

    </main>
  );
}