"use client";

import { useEffect, useState, useCallback } from "react";
import { GovernmentShell } from "@/app/government/GovernmentShell";
import { api, type District } from "@/lib/api";
import { FileText, BarChart3 } from "lucide-react";

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm text-center">
      <FileText className="mx-auto h-10 w-10 text-slate-400" />
      <p className="mt-4 text-sm text-slate-600">{message}</p>
    </div>
  );
}

interface IndustrySurvey {
  skill_id: string;
  skill_name: string;
  job_role_id: string | null;
  job_role_title: string | null;
  response_count: number;
  difficulty_distribution: Record<string, number>;
  top_employers: string[];
}

interface EmployerSurvey {
  id: string;
  title: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
}

export default function IndustrySurveysPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [industrySurveys, setIndustrySurveys] = useState<IndustrySurvey[]>([]);
  const [employerSurveys, setEmployerSurveys] = useState<EmployerSurvey[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const dRes = await api.districts().catch(() => []);
        setDistricts(dRes);
      } catch {
        setError("Failed to load districts.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadData = useCallback(async () => {
    setFetching(true);
    try {
      const params: { district_id?: string; skill_id?: string; job_role_id?: string } = {};
      if (filterDistrict) params.district_id = filterDistrict;
      const [industry, employer] = await Promise.all([
        api.governmentIndustrySurveys(params).catch(() => []),
        api.employerSurveys().catch(() => []),
      ]);
      setIndustrySurveys(industry);
      setEmployerSurveys(employer);
      setError(null);
    } catch {
      setError("Failed to load industry surveys.");
    } finally {
      setFetching(false);
    }
  }, [filterDistrict]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalResponses = industrySurveys.reduce((sum, s) => sum + s.response_count, 0);
  const maxDifficulty = Math.max(
    ...industrySurveys.flatMap((s) => Object.values(s.difficulty_distribution)),
    1
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7fa]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#123b68] border-r-transparent" />
          <p className="mt-4 text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fa]">
      <div className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#123b68]">Industry Surveys</h1>
          <p className="mt-2 text-slate-600">Employer survey responses, demand signals, and skill difficulty analysis.</p>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Filter by District</label>
          <select
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            className="w-full md:w-80 border border-slate-300 bg-white px-3 py-2.5 text-sm"
          >
            <option value="">All Districts</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {fetching && (
          <div className="mb-6 text-sm text-slate-600 flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#123b68] border-r-transparent" />
            Loading survey data...
          </div>
        )}

        {!fetching && employerSurveys.length === 0 && industrySurveys.length === 0 && (
          <EmptyState message="No industry survey data available." />
        )}

        {!fetching && employerSurveys.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#c2410c] mb-4">Survey List</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2">Survey Title</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-right py-2 px-2">Response Count</th>
                  <th className="text-left py-2 px-2">Start Date</th>
                  <th className="text-left py-2 px-2">End Date</th>
                </tr>
              </thead>
              <tbody>
                {employerSurveys.map((survey) => (
                  <tr key={survey.id} className="border-b border-slate-100">
                    <td className="py-2 px-2 font-medium">{survey.title}</td>
                    <td className="py-2 px-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${survey.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                        {survey.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right">{industrySurveys.filter((s) => s.skill_id === survey.id).reduce((sum, s) => sum + s.response_count, 0) || "—"}</td>
                    <td className="py-2 px-2">{survey.start_date ? new Date(survey.start_date).toLocaleDateString() : "—"}</td>
                    <td className="py-2 px-2">{survey.end_date ? new Date(survey.end_date).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!fetching && industrySurveys.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#c2410c] mb-4">Demand Signals by Skill & Role</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2">Skill</th>
                  <th className="text-left py-2 px-2">Job Role</th>
                  <th className="text-right py-2 px-2">Response Count</th>
                  <th className="text-left py-2 px-2">Top Employers</th>
                </tr>
              </thead>
              <tbody>
                {industrySurveys.map((survey, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-2 px-2 font-medium">{survey.skill_name}</td>
                    <td className="py-2 px-2">{survey.job_role_title || "—"}</td>
                    <td className="py-2 px-2 text-right font-medium">{survey.response_count}</td>
                    <td className="py-2 px-2">
                      <div className="flex flex-wrap gap-1">
                        {survey.top_employers.slice(0, 3).map((e) => (
                          <span key={e} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">{e}</span>
                        ))}
                        {survey.top_employers.length > 3 && (
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">+{survey.top_employers.length - 3}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!fetching && industrySurveys.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#c2410c] mb-4">Difficulty Distribution</p>
            <div className="space-y-4">
              {industrySurveys.map((survey, idx) => (
                <div key={idx} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-[#123b68] mb-2">{survey.skill_name}</p>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-slate-400" />
                    <div className="flex-1 space-y-1">
                      {Object.entries(survey.difficulty_distribution).map(([level, count]) => (
                        <div key={level} className="flex items-center gap-2">
                          <span className="text-xs text-slate-600 w-24">{level}</span>
                          <div className="flex-1 h-2 rounded-full bg-slate-200">
                            <div
                              className="h-2 rounded-full bg-[#c2410c]"
                              style={{ width: maxDifficulty > 0 ? `${Math.min((count / maxDifficulty) * 100, 100)}%` : "0%" }}
                            />
                          </div>
                          <span className="text-xs text-slate-600 w-8 text-right">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
