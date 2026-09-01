"use client";

import { useEffect, useState, useCallback } from "react";
import { GovernmentShell } from "@/app/government/GovernmentShell";
import { api, type District } from "@/lib/api";

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm text-center">
      <p className="text-sm text-slate-600">{message}</p>
    </div>
  );
}

export default function SkillDemandAnalyticsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterSector, setFilterSector] = useState("");
  const [filterJobRole, setFilterJobRole] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [demandData, setDemandData] = useState<any[]>([]);
  const [supplyData, setSupplyData] = useState<Map<string, number>>(new Map());

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
      if (filterSkill) params.skill_id = filterSkill;
      if (filterJobRole) params.job_role_id = filterJobRole;

      const [demand, supply] = await Promise.all([
        api.demandEvidence(params).catch(() => []),
        api.trainingSupplyBySkill({ district_id: filterDistrict || undefined, skill_id: filterSkill || undefined }).catch(() => []),
      ]);

      setDemandData(demand);
      const supplyMap = new Map<string, number>();
      supply.forEach((s: any) => {
        if (s.skill_id) supplyMap.set(s.skill_id, s.available_capacity || 0);
      });
      setSupplyData(supplyMap);
      setError(null);
    } catch {
      setError("Failed to load demand data.");
    } finally {
      setFetching(false);
    }
  }, [filterDistrict, filterSkill, filterJobRole]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getGap = (item: any) => {
    const demand = item.demand_value || 0;
    const supply = supplyData.get(item.skill_id) || 0;
    return demand - supply;
  };

  const getTrend = (demandValue: number) => {
    if (demandValue >= 70) return "Rising";
    if (demandValue >= 40) return "Stable";
    return "Declining";
  };

  const getDemandLevel = (demandValue: number) => {
    if (demandValue >= 70) return { label: "High", cls: "bg-red-100 text-red-800" };
    if (demandValue >= 40) return { label: "Medium", cls: "bg-yellow-100 text-yellow-800" };
    return { label: "Low", cls: "bg-gray-100 text-gray-700" };
  };

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
          <h1 className="text-3xl font-bold text-[#123b68]">Skill Demand Analytics</h1>
          <p className="mt-2 text-slate-600">Analyze skill demand, supply, and gap across districts and sectors.</p>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <div>
              <label className="block text-sm font-semibold text-slate-700">Job Role</label>
              <input type="text" value={filterJobRole} onChange={(e) => setFilterJobRole(e.target.value)} placeholder="Filter by role..." className="mt-1 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Skill</label>
              <input type="text" value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)} placeholder="Filter by skill..." className="mt-1 w-full border border-slate-300 bg-white px-3 py-2.5 text-sm" />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {fetching && (
          <div className="mb-6 text-sm text-slate-600 flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#123b68] border-r-transparent" />
            Loading demand data...
          </div>
        )}

        {!fetching && demandData.length === 0 && (
          <EmptyState message="No skill demand data available for the selected filters." />
        )}

        {!fetching && demandData.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#c2410c] mb-4">Skill Demand Overview</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2">Skill ID</th>
                  <th className="text-right py-2 px-2">Demand Score</th>
                  <th className="text-left py-2 px-2">Trend</th>
                  <th className="text-left py-2 px-2">Level</th>
                  <th className="text-left py-2 px-2">Demand Signals</th>
                  <th className="text-right py-2 px-2">Supply</th>
                  <th className="text-right py-2 px-2">Gap</th>
                </tr>
              </thead>
              <tbody>
                {demandData.map((item: any) => {
                  const demandVal = item.demand_value || 0;
                  const supplyVal = supplyData.get(item.skill_id) || 0;
                  const gap = demandVal - supplyVal;
                  const trend = getTrend(demandVal);
                  const level = getDemandLevel(demandVal);
                  const trendIcon = trend === "Rising" ? "↑" : trend === "Declining" ? "↓" : "→";
                  const trendCls = trend === "Rising" ? "text-green-600" : trend === "Declining" ? "text-red-600" : "text-yellow-600";

                  return (
                    <tr key={item.skill_id} className="border-b border-slate-100">
                      <td className="py-2 px-2 font-medium">{item.skill_id}</td>
                      <td className="py-2 px-2 text-right">{demandVal.toFixed(1)}</td>
                      <td className={`py-2 px-2 ${trendCls}`}>
                        <span className="mr-1">{trendIcon}</span>{trend}
                      </td>
                      <td className="py-2 px-2">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${level.cls}`}>{level.label}</span>
                      </td>
                      <td className="py-2 px-2">{item.demand_value ? "Active" : "—"}</td>
                      <td className="py-2 px-2 text-right">{supplyVal}</td>
                      <td className={`py-2 px-2 text-right font-medium ${gap > 0 ? "text-red-600" : gap < 0 ? "text-green-600" : "text-slate-600"}`}>
                        {gap > 0 ? `+${gap}` : gap}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
