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

interface TrainingGap {
  district_id: string;
  skill_id: string;
  demand_value: number | null;
  available_capacity: number;
  capacity_gap: number | null;
}

function getPriority(gap: number | null): { label: string; cls: string } {
  if (gap == null) return { label: "Unknown", cls: "bg-gray-100 text-gray-700" };
  if (gap > 50) return { label: "Critical", cls: "bg-red-100 text-red-800" };
  if (gap > 20) return { label: "High", cls: "bg-orange-100 text-orange-800" };
  if (gap > 5) return { label: "Medium", cls: "bg-yellow-100 text-yellow-800" };
  return { label: "Low", cls: "bg-green-100 text-green-800" };
}

export default function SkillGapsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [gaps, setGaps] = useState<TrainingGap[]>([]);

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

  const loadGaps = useCallback(async (districtId: string) => {
    setFetching(true);
    try {
      const data = await api.trainingGaps(districtId);
      setGaps(data);
      setError(null);
    } catch {
      setError("Failed to load training gaps.");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (filterDistrict) {
      loadGaps(filterDistrict);
    } else {
      setGaps([]);
    }
  }, [filterDistrict, loadGaps]);

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

  const districtName = districts.find((d) => d.id === filterDistrict)?.name || "";

  return (
    <div className="min-h-screen bg-[#f4f7fa]">
      <div className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#123b68]">Skill Gaps</h1>
          <p className="mt-2 text-slate-600">Identify skill gaps between demand and training capacity.</p>
        </div>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Filter by District</label>
          <select
            value={filterDistrict}
            onChange={(e) => {
              setFilterDistrict(e.target.value);
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
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {fetching && (
          <div className="mb-6 text-sm text-slate-600 flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#123b68] border-r-transparent" />
            Loading skill gaps...
          </div>
        )}

        {!fetching && filterDistrict && gaps.length === 0 && (
          <EmptyState message={`No skill gap data available for ${districtName || "the selected district"}.`} />
        )}

        {!fetching && gaps.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#c2410c] mb-4">Skill Gap Analysis {districtName && `— ${districtName}`}</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2">Skill ID</th>
                  <th className="text-right py-2 px-2">Demand</th>
                  <th className="text-right py-2 px-2">Candidate Supply</th>
                  <th className="text-right py-2 px-2">Training Capacity</th>
                  <th className="text-right py-2 px-2">Gap</th>
                  <th className="text-left py-2 px-2">Priority</th>
                </tr>
              </thead>
              <tbody>
                {gaps.map((gap) => {
                  const gapVal = gap.capacity_gap != null ? gap.capacity_gap : (gap.demand_value || 0) - gap.available_capacity;
                  const priority = getPriority(gapVal);

                  return (
                    <tr key={gap.skill_id} className="border-b border-slate-100">
                      <td className="py-2 px-2 font-medium">{gap.skill_id}</td>
                      <td className="py-2 px-2 text-right">{gap.demand_value?.toFixed(1) || "—"}</td>
                      <td className="py-2 px-2 text-right">—</td>
                      <td className="py-2 px-2 text-right">{gap.available_capacity}</td>
                      <td className={`py-2 px-2 text-right font-medium ${gapVal > 0 ? "text-red-600" : "text-green-600"}`}>
                        {gapVal > 0 ? `+${gapVal.toFixed(1)}` : gapVal.toFixed(1)}
                      </td>
                      <td className="py-2 px-2">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${priority.cls}`}>
                          {priority.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!filterDistrict && (
          <EmptyState message="Please select a district to view skill gaps." />
        )}
      </div>
    </div>
  );
}
