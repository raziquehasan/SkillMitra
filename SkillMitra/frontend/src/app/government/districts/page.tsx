"use client";

import { useEffect, useState, useCallback } from "react";
import { GovernmentShell } from "@/app/government/GovernmentShell";
import { api, type District } from "@/lib/api";

type TabKey = "priority-industries" | "skill-gaps" | "high-demand" | "capacity";

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm text-center">
      <p className="text-sm text-slate-600">{message}</p>
    </div>
  );
}

export default function DistrictOverviewPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [tab, setTab] = useState<TabKey>("priority-industries");
  const [intelligence, setIntelligence] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [fetching, setFetching] = useState(false);

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

  const loadDistrictData = useCallback(async (districtId: string) => {
    setFetching(true);
    try {
      const [intel, recs] = await Promise.all([
        api.districtIntelligence(districtId).catch(() => null),
        api.districtRecommendations(districtId).catch(() => null),
      ]);
      setIntelligence(intel);
      setRecommendations(recs);
    } catch {
      setError("Failed to load district data.");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      loadDistrictData(selectedDistrict);
    } else {
      setIntelligence(null);
      setRecommendations(null);
    }
  }, [selectedDistrict, loadDistrictData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7fa]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#123b68] border-r-transparent" />
          <p className="mt-4 text-sm text-slate-600">Loading districts...</p>
        </div>
      </div>
    );
  }

  const districtName = districts.find((d) => d.id === selectedDistrict)?.name || "";

  const tabs: { key: TabKey; label: string }[] = [
    { key: "priority-industries", label: "Priority Industries" },
    { key: "skill-gaps", label: "Skill Gaps" },
    { key: "high-demand", label: "High-Demand Roles" },
    { key: "capacity", label: "Capacity Gap" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fa]">
      <div className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#123b68]">District Overview</h1>
          <p className="mt-2 text-slate-600">Select a district to view intelligence, skill gaps, and recommendations.</p>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Select District</label>
          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setError(null);
            }}
            className="w-full md:w-80 border border-slate-300 bg-white px-3 py-2.5 text-sm"
          >
            <option value="">-- Select a district --</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {fetching && (
          <div className="mb-6 text-sm text-slate-600 flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#123b68] border-r-transparent" />
            Loading district data...
          </div>
        )}

        {!fetching && selectedDistrict && !intelligence && !error && (
          <EmptyState message="No intelligence data available for the selected district." />
        )}

        {intelligence && (
          <>
            <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase">Priority Industries</p>
                <p className="mt-2 text-lg font-bold text-[#123b68]">
                  {intelligence.demand?.top_skills?.length || 0} identified
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase">High-Demand Roles</p>
                <p className="mt-2 text-lg font-bold text-[#123b68]">
                  {intelligence.skill_gaps?.length || 0} roles
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase">Skill Gaps</p>
                <p className="mt-2 text-lg font-bold text-[#123b68]">
                  {intelligence.skill_gaps?.length || 0} gaps
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase">Existing Training Capacity</p>
                <p className="mt-2 text-lg font-bold text-[#123b68]">
                  {intelligence.capacity?.course_offerings || 0} offerings
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase">Capacity Gap</p>
                <p className="mt-2 text-lg font-bold text-[#123b68]">
                  {intelligence.capacity?.capacity_status || "—"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase">Recommended Training Action</p>
                <p className="mt-2 text-lg font-bold text-[#c2410c]">
                  {recommendations?.total_recommendations || 0} actions
                </p>
              </div>
            </div>

            <div className="mb-6 flex gap-2 overflow-x-auto border-b border-slate-200 pb-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-t-lg ${
                    tab === t.key
                      ? "bg-[#123b68] text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "priority-industries" && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#c2410c] mb-4">Priority Industries</p>
                {!intelligence.demand?.top_skills?.length ? (
                  <p className="text-sm text-slate-600">No priority industries data available.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-2">Skill</th>
                        <th className="text-right py-2 px-2">Demand Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {intelligence.demand.top_skills.map((ts: any) => (
                        <tr key={ts.skill_id} className="border-b border-slate-100">
                          <td className="py-2 px-2 font-medium">{ts.skill_name || ts.skill_id}</td>
                          <td className="py-2 px-2 text-right">{ts.demand_score?.toFixed(1) || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {tab === "skill-gaps" && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#c2410c] mb-4">Skill Gaps</p>
                {!intelligence.skill_gaps?.length ? (
                  <p className="text-sm text-slate-600">No skill gap data available.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-2">Skill ID</th>
                        <th className="text-left py-2 px-2">Job Role</th>
                        <th className="text-right py-2 px-2">Demand Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {intelligence.skill_gaps.map((sg: any) => (
                        <tr key={sg.demand_id} className="border-b border-slate-100">
                          <td className="py-2 px-2 font-medium">{sg.skill_id}</td>
                          <td className="py-2 px-2">{sg.job_role_id || "—"}</td>
                          <td className="py-2 px-2 text-right">{sg.demand_score?.toFixed(1) || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {tab === "high-demand" && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#c2410c] mb-4">High-Demand Roles</p>
                {!intelligence.skill_gaps?.length ? (
                  <p className="text-sm text-slate-600">No high-demand role data available.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-2">Skill ID</th>
                        <th className="text-left py-2 px-2">Job Role</th>
                        <th className="text-right py-2 px-2">Demand Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {intelligence.skill_gaps.map((sg: any) => (
                        <tr key={sg.demand_id} className="border-b border-slate-100">
                          <td className="py-2 px-2 font-medium">{sg.skill_id}</td>
                          <td className="py-2 px-2">{sg.job_role_id || "—"}</td>
                          <td className="py-2 px-2 text-right">{sg.demand_score?.toFixed(1) || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {tab === "capacity" && (
              <div className="space-y-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#c2410c] mb-4">Capacity Overview</p>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs text-slate-500">Total Demand</p>
                      <p className="font-semibold text-[#123b68]">{intelligence.capacity?.total_demand || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Verified Providers</p>
                      <p className="font-semibold text-[#123b68]">{intelligence.capacity?.verified_providers || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Course Offerings</p>
                      <p className="font-semibold text-[#123b68]">{intelligence.capacity?.course_offerings || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total Capacity</p>
                      <p className="font-semibold text-[#123b68]">{intelligence.capacity?.total_capacity || 0}</p>
                    </div>
                  </div>
                </div>
                {recommendations?.recommendations?.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#c2410c] mb-4">Recommended Actions</p>
                    <div className="space-y-3">
                      {recommendations.recommendations.map((rec: any) => (
                        <div key={rec.plan_item_id || rec.skill_id} className="border-b border-slate-100 pb-3 last:border-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-[#123b68]">Skill: {rec.skill_id}</p>
                            {rec.recommended_action && (
                              <span className="px-2 py-1 bg-[#c2410c] text-white text-xs rounded">
                                {rec.recommended_action.replace(/_/g, " ")}
                              </span>
                            )}
                          </div>
                          {rec.rationale && <p className="text-sm text-slate-600 mt-1">{rec.rationale}</p>}
                          {rec.gap_value != null && (
                            <p className="text-sm text-slate-600">Gap: {rec.gap_value}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {!selectedDistrict && (
          <EmptyState message="Please select a district to view detailed intelligence." />
        )}
      </div>
    </div>
  );
}
