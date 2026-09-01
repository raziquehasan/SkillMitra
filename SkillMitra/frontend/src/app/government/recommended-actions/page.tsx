"use client";

import { useEffect, useState, useCallback } from "react";
import { GovernmentShell } from "@/app/government/GovernmentShell";
import { api, type District } from "@/lib/api";
import { Target, ChevronDown } from "lucide-react";

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm text-center">
      <Target className="mx-auto h-10 w-10 text-slate-400" />
      <p className="mt-4 text-sm text-slate-600">{message}</p>
    </div>
  );
}

interface Recommendation {
  plan_item_id: string;
  skill_id: string;
  job_role_id: string | null;
  demand_value: number | null;
  gap_value: number | null;
  recommended_action: string | null;
  review_status: string | null;
  rationale: string | null;
  course_id: string | null;
}

function getPriority(gap: number | null): { label: string; cls: string } {
  if (gap == null) return { label: "Unknown", cls: "bg-gray-100 text-gray-700" };
  if (gap > 50) return { label: "Critical", cls: "bg-red-100 text-red-800" };
  if (gap > 20) return { label: "High", cls: "bg-orange-100 text-orange-800" };
  if (gap > 5) return { label: "Medium", cls: "bg-yellow-100 text-yellow-800" };
  return { label: "Low", cls: "bg-green-100 text-green-800" };
}

function ActionBadge({ action }: { action: string | null }) {
  if (!action) return null;
  const cls = action.includes("CAPACITY") || action.includes("Trainer") || action.includes("Equipment")
    ? "bg-red-100 text-red-800"
    : action.includes("Curriculum") || action.includes("Course")
    ? "bg-yellow-100 text-yellow-800"
    : "bg-blue-100 text-blue-800";
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${cls}`}>
      {action.replace(/_/g, " ")}
    </span>
  );
}

export default function RecommendedActionsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

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
    if (!filterDistrict) {
      setRecommendations([]);
      setFetching(false);
      return;
    }
    setFetching(true);
    try {
      const data = await api.districtRecommendations(filterDistrict).catch(() => ({ recommendations: [] }));
      const planData = data as any;
      const recs = Array.isArray(planData.recommendations) ? planData.recommendations : [];
      setRecommendations(recs);
      setError(null);
    } catch {
      setError("Failed to load recommended actions.");
    } finally {
      setFetching(false);
    }
  }, [filterDistrict]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReviewStatus = async (planItemId: string, newStatus: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.plan_item_id === planItemId ? { ...r, review_status: newStatus } : r))
    );
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

  const districtName = districts.find((d) => d.id === filterDistrict)?.name || "";

  return (
    <div className="min-h-screen bg-[#f4f7fa]">
      <div className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#123b68]">Recommended Actions</h1>
          <p className="mt-2 text-slate-600">Review and update recommended actions for district training plans.</p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700">District</label>
            <div className="relative mt-2">
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="w-full border border-slate-300 bg-white px-3 py-2 text-sm appearance-none pr-10"
              >
                <option value="">Select a district...</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {fetching && (
          <div className="mb-6 text-sm text-slate-600 flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#123b68] border-r-transparent" />
            Loading recommendations...
          </div>
        )}

        {!filterDistrict && !fetching && (
          <EmptyState message="Select a district to view recommended actions." />
        )}

        {!fetching && filterDistrict && recommendations.length === 0 && (
          <EmptyState message={`No recommended actions available for ${districtName}.`} />
        )}

        {!fetching && recommendations.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#c2410c] mb-4">Recommended Actions — {districtName}</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2">Skill</th>
                  <th className="text-left py-2 px-2">Job Role</th>
                  <th className="text-right py-2 px-2">Demand</th>
                  <th className="text-right py-2 px-2">Gap</th>
                  <th className="text-left py-2 px-2">Recommended Action</th>
                  <th className="text-left py-2 px-2">Review Status</th>
                  <th className="text-left py-2 px-2">Rationale</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.map((rec) => {
                  const priority = getPriority(rec.gap_value);
                  return (
                    <tr key={rec.plan_item_id} className="border-b border-slate-100">
                      <td className="py-2 px-2 font-medium">{rec.skill_id}</td>
                      <td className="py-2 px-2">{rec.job_role_id || "—"}</td>
                      <td className="py-2 px-2 text-right">{rec.demand_value != null ? rec.demand_value.toFixed(1) : "—"}</td>
                      <td className="py-2 px-2 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className={`font-medium ${rec.gap_value != null && rec.gap_value > 0 ? "text-red-600" : "text-slate-700"}`}>
                            {rec.gap_value != null ? rec.gap_value.toFixed(1) : "—"}
                          </span>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${priority.cls}`}>
                            {priority.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        <ActionBadge action={rec.recommended_action} />
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={rec.review_status || ""}
                          onChange={(e) => handleReviewStatus(rec.plan_item_id, e.target.value)}
                          className="border border-slate-300 bg-white px-2 py-1 text-xs"
                        >
                          <option value="">Pending</option>
                          <option value="APPROVED">Approved</option>
                          <option value="REJECTED">Rejected</option>
                          <option value="IN_PROGRESS">In Progress</option>
                        </select>
                      </td>
                      <td className="py-2 px-2 text-xs text-slate-600 max-w-xs">
                        {rec.rationale || "—"}
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
