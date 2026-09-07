"use client";

import Image from "next/image";
import { useState } from "react";
import EmployerSidebar from "@/components/employer/EmployerSidebar";

const questions = [
  "Which skills are difficult to hire?",
  "Which technologies are emerging in your industry?",
  "What skills will be needed in the next 1–2 years?",
  "What should training curriculum improve?",
];

export default function IndustrySurveyPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-slate-800">

      {/* GOVERNMENT HEADER */}
      <header className="fixed left-0 right-0 top-0 z-50 h-[72px] bg-[#123b68] text-white">
        <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-6 text-sm">

          <div className="flex items-center gap-3">
            <Image
              src="/maharashtra-gov-logo.png"
              alt="Government of Maharashtra"
              width={48}
              height={48}
              priority
              className="h-12 w-12 object-contain"
            />

            <div>
              <div className="font-semibold">
                Government of Maharashtra
              </div>

              <div className="text-[11px] text-blue-100">
                Skills, Employment, Entrepreneurship & Innovation Department
              </div>
            </div>
          </div>

          <div className="hidden font-semibold md:block">
            SkillMitra | Employer Intelligence Portal
          </div>

        </div>
      </header>

      {/* ORANGE LINE */}
      <div className="fixed left-0 right-0 top-[72px] z-50 h-1 bg-[#c2410c]" />

      {/* PAGE AREA */}
      <div className="min-h-screen pt-[76px]">

        {/* SIDEBAR */}
        <EmployerSidebar />

        {/* MAIN CONTENT */}
        <section className="min-w-0 lg:ml-72">

          {/* SKILLMITRA PAGE HEADER */}
          <div className="border-b border-slate-200 bg-white px-5 py-4 lg:px-8">
            <div className="mx-auto flex max-w-[1250px] items-center gap-4">

              <div className="relative h-14 w-14 shrink-0">
                <Image
                  src="/skillmitra-logo.png"
                  alt="SkillMitra"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  SkillMitra
                </p>

                <p className="font-semibold text-[#123b68]">
                  Industry Survey Dashboard
                </p>
              </div>

            </div>
          </div>

          {/* CONTENT */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">

            {/* PAGE HEADER */}
            <div className="mb-7">
              <p className="text-xs font-medium text-slate-400">
                Insights
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
                Industry Survey
              </h1>

              <p className="mt-2 max-w-3xl text-sm text-slate-500">
                Share your industry's workforce requirements to help improve
                skill-development planning and training recommendations.
              </p>
            </div>

            {/* INFO CARD */}
            <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
              <h2 className="font-semibold text-[#123b68]">
                Help improve workforce planning
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Your feedback can help identify changing skill requirements,
                hiring challenges and future workforce needs.
              </p>
            </div>

            {/* SURVEY */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">

              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Employer Workforce Survey
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Please provide information based on your industry's current
                  and future hiring requirements.
                </p>
              </div>

              <div className="space-y-6">

                {questions.map((question, index) => (
                  <div
                    key={question}
                    className="rounded-lg border border-slate-200 p-5"
                  >
                    <label className="block">

                      <span className="text-sm font-semibold text-slate-800">
                        {index + 1}. {question}
                      </span>

                      <textarea
                        rows={4}
                        placeholder="Enter your response..."
                        className="mt-3 w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]"
                      />

                    </label>
                  </div>
                ))}

              </div>

              {/* SUBMIT */}
              <div className="mt-7 flex flex-col justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center">

                <p className="text-xs text-slate-400">
                  Responses will support industry skill intelligence.
                </p>

                <button
                  onClick={() => setSubmitted(true)}
                  className="rounded-lg bg-[#123b68] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0e3155]"
                >
                  Submit Industry Feedback
                </button>

              </div>

              {/* SUCCESS MESSAGE */}
              {submitted && (
                <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="font-semibold text-green-800">
                    Feedback submitted successfully.
                  </p>

                  <p className="mt-1 text-sm text-green-700">
                    Thank you for contributing to Maharashtra's workforce
                    skill intelligence.
                  </p>
                </div>
              )}

            </div>

            {/* RELATED INSIGHTS */}
            <div className="mt-6 grid gap-4 md:grid-cols-3">

              <a
                href="/employer/insights"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow"
              >
                <p className="text-sm font-semibold text-slate-900">
                  Employer Insights
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  View workforce and labour-market intelligence.
                </p>
              </a>

              <a
                href="/employer/skills/gaps"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow"
              >
                <p className="text-sm font-semibold text-slate-900">
                  Skill Gaps
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Analyse skills where demand exceeds available supply.
                </p>
              </a>

              <a
                href="/employer/insights/trends"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow"
              >
                <p className="text-sm font-semibold text-slate-900">
                  Demand Trends
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Explore changing workforce and skill demand.
                </p>
              </a>

            </div>

          </div>
        </section>
      </div>
    </main>
  );
}