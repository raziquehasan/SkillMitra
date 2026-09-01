"use client";

import { useEffect, useState, useCallback } from "react";
import { GovernmentShell } from "@/app/government/GovernmentShell";
import { api, type District } from "@/lib/api";
import { TrendingUp, Filter } from "lucide-react";

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm text-center">
      <TrendingUp className="mx-auto h-10 w-10 text-slate-400" />
      <p className="mt-4 text-sm text-slate-600">{message}</p>
    </div>
  );
}

interface EmployerInsight {
  district_id: string;
  district_name: string;
  sector_id: string;
  sector_name: string;
  job_role_id: string;
  job_role_title: string;
  posting_count: number;
  required_skills: string[];
  employers: Array<{ employer_id: string; company_name: string }>;
}

export default function EmployerInsightsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterSector, setFilterSector] = useState("");
  const [insights, setInsights] = useState<EmployerInsight[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [dRes, sRes] = await Promise.all([
          api.districts().catch(() => []),
          api.sectors().catch(() => []),
        ]);
        setDistricts(dRes);
        setSectors(sRes);
      } catch {
        setError("Failed to load reference data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadData = useCallback(async () => {
    setFetching(true);
    try {
      const params: { district_id?: string; sector_id?: string } = {};
      if (filterDistrict) params.district_id = filterDistrict;
      if (filterSector) params.sector_id = filterSector;
      const data = await api.governmentEmployerInsights(params).catch(() => []);
      setInsights(data);
      setError(null);
    } catch {
      setError("Failed to load employer insights.");
    } finally {
      setFetching(false);
    }
  }, [filterDistrict, filterSector]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
          <h1 className="text-3xl font-bold text-[#123b68]">Employer Insights</h1>
          <p className="mt-2 text-slate-600">Aggregated employer hiring patterns and top employers by district and sector.</p>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-[#c2410c]" />
            <span className="text-sm font-semibold text-slate-700">Filters</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700">District</label>
              <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} className="mt-1 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm">
                <option value="">All Districts</option>
                {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Sector</label>
              <select value={filterSector} onChange={(e) => setFilterSector(e.target.value)} className="mt-1 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm">
                <option value="">All Sectors</option>
                {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {fetching && (
          <div className="mb-6 text-sm text-slate-600 flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#123b68] border-r-transparent" />
            Loading insights...
          </div>
        )}

        {!fetching && insights.length === 0 && (
          <EmptyState message="No employer insights available for the selected filters." />
        )}

        {!fetching && insights.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#c2410c] mb-4">Employer Insights</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2">District</th>
                  <th className="text-left py-2 px-2">Sector</th>
                  <th className="text-left py-2 px-2">Job Role</th>
                  <th className="text-right py-2 px-2">Posting Count</th>
                  <th className="text-left py-2 px-2">Required Skills</th>
                  <th className="text-left py-2 px-2">Top Employers</th>
                </tr>
              </thead>
              <tbody>
                {insights.map((ins) => (
                  <tr key={`${ins.district_id}-${ins.sector_id}-${ins.job_role_id}`} className="border-b border-slate-100">
                    <td className="py-2 px-2 font-medium">{ins.district_name}</td>
                    <td className="py-2 px-2">{ins.sector_name}</td>
                    <td className="py-2 px-2">{ins.job_role_title}</td>
                    <td className="py-2 px-2 text-right font-medium">{ins.posting_count}</td>
                    <td className="py-2 px-2">
                      <div className="flex flex-wrap gap-1">
                        {ins.required_skills.slice(0, 4).map((s) => (
                          <span key={s} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">{s}</span>
                        ))}
                        {ins.required_skills.length > 4 && (
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">+{ins.required_skills.length - 4}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex flex-wrap gap-1">
                        {ins.employers.slice(0, 3).map((e) => (
                          <span key={e.employer_id} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">{e.company_name}</span>
                        ))}
                        {ins.employers.length > 3 && (
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">+{ins.employers.length - 3}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
