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

export default function GraduationPage() {
  const [careerData, setCareerData] = useState<CareerPlan[]>([]);
  const [districts, setDistricts] = useState<Array<{district_id: string; district_name: string; plan_count: number}>>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Starting to load career planning data...");
        
        // Load districts and sectors in parallel
        const [districtsData, sectorsData] = await Promise.all([
          api.careerPlanningDistricts().catch((err) => {
            console.error("Error loading districts:", err);
            return [];
          }),
          api.careerPlanningSectors().catch((err) => {
            console.error("Error loading sectors:", err);
            return [];
          }),
        ]);
        
        console.log("Districts data:", districtsData);
        console.log("Sectors data:", sectorsData);
        
        setDistricts(districtsData);
        setSectors(sectorsData);
        
        // Load career planning data
        const params: any = {};
        if (selectedDistrict) params.district_id = selectedDistrict;
        if (selectedSector) params.sector = selectedSector;
        
        console.log("Loading career plans with params:", params);
        const data = await api.careerPlanning(params);
        console.log("Career plans data:", data);
        setCareerData(data.plans);
      } catch (err) {
        console.error("Failed to load career planning data:", err);
        setError("Unable to load career planning data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [selectedDistrict, selectedSector]);

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
      <section className="bg-emerald-700 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">

          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-100">
            Career Planning • Graduation
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            District Career Intelligence
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-7 text-emerald-100">
            Explore career opportunities, required skills, training pathways
            and job roles across Maharashtra districts based on real labour market data.
          </p>

        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-7xl px-6 py-8">

        <div className="rounded-xl border bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-slate-900">
            Filter by District & Sector
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">

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
                    {district.district_name} ({district.plan_count} plans)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Sector
              </label>

              <select 
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
              >
                <option value="">All Sectors</option>
                {sectors.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>

          </div>

        </div>

      </section>

      {/* Error State */}
      {error && (
        <section className="mx-auto max-w-7xl px-6 pb-8">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <p className="font-semibold text-red-800">
              Error
            </p>
            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>
          </div>
        </section>
      )}

      {/* Career Planning Data */}
      <section className="mx-auto max-w-7xl px-6 pb-12">

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Loading career planning data...</p>
          </div>
        ) : careerData.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
            <p className="text-slate-500">
              No career planning data available for the selected filters.
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            {careerData.map((plan) => (
              <div
                key={plan.id}
                className="rounded-xl border bg-white p-6 shadow-sm"
              >

                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                  <div className="flex-1">

                    <div className="flex flex-wrap items-center gap-3 mb-4">

                      <h3 className="text-xl font-bold text-slate-900">
                        {plan.sector}
                      </h3>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {plan.district_name}
                      </span>

                    </div>

                    {/* Priority Skills */}
                    <div className="mb-4">
                      <p className="mb-2 text-sm font-semibold text-slate-700">
                        Priority Skills
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {plan.priority_skills.map((skill, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* PG Training */}
                    <div className="mb-4">
                      <p className="mb-2 text-sm font-semibold text-slate-700">
                        PG / Training
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {plan.pg_training.map((training, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700"
                          >
                            {training}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Job Roles */}
                    <div className="mb-4">
                      <p className="mb-2 text-sm font-semibold text-slate-700">
                        Career / Job Roles
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {plan.job_roles.map((role, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Related Courses */}
                    {plan.related_courses && plan.related_courses.length > 0 && (
                      <div className="mb-4">
                        <p className="mb-2 text-sm font-semibold text-slate-700">
                          Related Training Courses
                        </p>

                        <div className="space-y-2">
                          {plan.related_courses.map((course) => (
                            <div
                              key={course.id}
                              className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                            >
                              <p className="text-sm font-medium text-slate-900">
                                {course.title}
                              </p>
                              {course.description && (
                                <p className="mt-1 text-xs text-slate-600">
                                  {course.description}
                                </p>
                              )}
                              <div className="mt-2 flex flex-wrap gap-1">
                                {course.skills_covered.map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Related Jobs */}
                    {plan.related_jobs && plan.related_jobs.length > 0 && (
                      <div>
                        <p className="mb-2 text-sm font-semibold text-slate-700">
                          Live Job Opportunities
                        </p>

                        <div className="space-y-2">
                          {plan.related_jobs.map((job) => (
                            <div
                              key={job.id}
                              className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                            >
                              <p className="text-sm font-medium text-slate-900">
                                {job.title}
                              </p>
                              {job.company_name && (
                                <p className="mt-1 text-xs text-slate-600">
                                  {job.company_name}
                                </p>
                              )}
                              {job.posted_date && (
                                <p className="mt-1 text-xs text-slate-500">
                                  Posted: {new Date(job.posted_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </section>

      {/* Info Section */}
      <section className="mx-auto max-w-7xl px-6 pb-12">

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">

          <h2 className="text-lg font-bold text-blue-900">
            Career Planning Intelligence
          </h2>

          <p className="mt-2 text-sm text-blue-800">
            This career planning data is based on actual district-level industry analysis,
            skill requirements, and job market demand. Use this information to make
            informed decisions about your education and career pathway.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-3">

            <div className="rounded-lg bg-white p-4">
              <p className="text-xs font-semibold text-slate-700">
                🎯 Skills
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Priority skills for each sector
              </p>
            </div>

            <div className="rounded-lg bg-white p-4">
              <p className="text-xs font-semibold text-slate-700">
                📚 Training
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Recommended PG and training programs
              </p>
            </div>

            <div className="rounded-lg bg-white p-4">
              <p className="text-xs font-semibold text-slate-700">
                💼 Roles
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Career roles and job opportunities
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-14">

        <div className="rounded-2xl bg-slate-900 p-7 text-white">

          <h2 className="text-2xl font-bold">
            Explore Skills & Courses
          </h2>

          <p className="mt-2 max-w-2xl text-slate-300">
            Find training courses and skill development programs that align
            with your career goals and district opportunities.
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