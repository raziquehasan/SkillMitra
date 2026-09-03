"use client";

import { useEffect, useState, useCallback } from "react";
import { GovernmentShell } from "@/app/government/GovernmentShell";
import { api, type District } from "@/lib/api";

function EmptyState({ message }: { message: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-8 shadow-sm text-center overflow-hidden">
      <p className="text-sm text-slate-600">{message}</p>
    </div>
  );
}

export default function IndustryDemandPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterSector, setFilterSector] = useState("");
  const [industries, setIndustries] = useState<any[]>([]);
  const [employerInsights, setEmployerInsights] = useState<any[]>([]);

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
      const params: { district_id?: string; sector_id?: string } = {};
      if (filterDistrict) params.district_id = filterDistrict;
      if (filterSector) params.sector_id = filterSector;

      const [ind, insights] = await Promise.all([
        api.demandIndustries().catch(() => []),
        api.governmentEmployerInsights(params).catch(() => []),
      ]);
      setIndustries(ind);
      setEmployerInsights(insights);
      setError(null);
    } catch {
      setError("Failed to load industry demand data.");
    } finally {
      setFetching(false);
    }
  }, [filterDistrict, filterSector]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const aggregated = (() => {
    const map = new Map<string, any>();
    [...industries, ...employerInsights].forEach((item) => {
      const sectorName = item.sector_name || item.industry_sector_name || item.sector || "Unknown";
      const jobRole = item.job_role_title || item.job_role || "Unknown";
      const key = `${sectorName}|${jobRole}`;

      if (!map.has(key)) {
        map.set(key, {
          sector: sectorName,
          jobRole,
          demandScore: 0,
          postingCount: 0,
          requiredSkills: new Set<string>(),
        });
      }

      const entry = map.get(key)!;
      const score = item.aggregate_demand_score || item.demand_score || 0;
      entry.demandScore = Math.max(entry.demandScore, score);
      entry.postingCount += item.posting_count || item.relevant_job_postings_count || 0;
      if (item.required_skills && Array.isArray(item.required_skills)) {
        item.required_skills.forEach((s: string) => entry.requiredSkills.add(s));
      }
    });

    return Array.from(map.values()).sort((a, b) => b.demandScore - a.demandScore);
  })();

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
          <h1 className="text-3xl font-bold text-[#123b68]">Industry Demand</h1>
          <p className="mt-2 text-slate-600">View aggregated demand by sector and job role.</p>
        </div>

        <div className="min-w-0 mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm overflow-hidden">
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
            Loading data...
          </div>
        )}

        {!fetching && aggregated.length === 0 && (
          <EmptyState message="No industry demand data available for the selected filters." />
        )}

        {!fetching && aggregated.length > 0 && (
          <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#c2410c] mb-4">Sector Demand Overview</p>
            <div className="overflow-x-auto w-full">
            <table data-wrapped="true" className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2">Sector</th>
                  <th className="text-left py-2 px-2">Job Role</th>
                  <th className="text-left py-2 px-2">Required Skills</th>
                  <th className="text-right py-2 px-2">Demand Score</th>
                  <th className="text-right py-2 px-2">Posting Count</th>
                </tr>
              </thead>
              <tbody>
                {aggregated.map((entry, idx) => (
                  <tr key={`${entry.sector}|${entry.jobRole}|${idx}`} className="border-b border-slate-100">
                    <td className="py-2 px-2 font-medium">{entry.sector}</td>
                    <td className="py-2 px-2">{entry.jobRole}</td>
                    <td className="py-2 px-2">
                      <div className="flex flex-wrap gap-1">
                        {[...entry.requiredSkills].slice(0, 5).map((s) => (
                          <span key={s} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right font-medium">{entry.demandScore.toFixed(1)}</td>
                    <td className="py-2 px-2 text-right">{entry.postingCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        )}
      </div>
    </div>
  );
}
