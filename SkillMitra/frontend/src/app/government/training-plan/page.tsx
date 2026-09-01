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

interface DistrictPlan {
  id: string;
  district_id: string;
  period_start: string;
  period_end: string;
  status: string;
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

export default function TrainingPlanPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [plan, setPlan] = useState<DistrictPlan | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [plans, setPlans] = useState<DistrictPlan[]>([]);

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
      setPlan(null);
      setRecommendations([]);
      setPlans([]);
      setFetching(false);
      return;
    }
    setFetching(true);
    try {
      const [recs, planList] = await Promise.all([
        api.districtRecommendations(filterDistrict).catch(() => ({ recommendations: [] })),
        api.districtPlans({ district_id: filterDistrict }).catch(() => []),
      ]);
      const planData = recs as any;
      setPlan(planData.plan || planData.district_training_plan || null);
      setRecommendations(Array.isArray(planData.recommendations) ? planData.recommendations : []);
      setPlans(Array.isArray(planList) ? planList : []);
      setError(null);
    } catch {
      setError("Failed to load training plan.");
    } finally {
      setFetching(false);
    }
  }, [filterDistrict]);

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

  const districtName = districts.find((d) => d.id === filterDistrict)?.name || "";

  return (
    <div className="min-h-screen bg-[#f4f7fa]">
      <div className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#123b68]">District Training Plan</h1>
          <p className="mt-2 text-slate-600">Review district-level training plans, recommendations, and government actions.</p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
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
          {plan && (
            <div>
              <label className="block text-sm font-semibold text-slate-700">Plan Status</label>
              <div className="mt-2">
                <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${plan.status === "ACTIVE" ? "bg-green-100 text-green-800" : plan.status === "DRAFT" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-700"}`}>
                  {plan.status}
                </span>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {fetching && (
          <div className="mb-6 text-sm text-slate-600 flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#123b68] border-r-transparent" />
            Loading training plan...
          </div>
        )}

        {!filterDistrict && !fetching && (
          <EmptyState message="Select a district to view training plan." />
        )}

        {!fetching && filterDistrict && plan && recommendations.length === 0 && (
          <EmptyState message={`No training plan recommendations available for ${districtName}.`} />
        )}

        {!fetching && recommendations.length > 0 && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#c2410c] mb-4">
                District Training Plan — {districtName}
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-xs text-slate-500">Period</p>
                    <p className="font-semibold text-[#123b68]">
                      {plan?.period_start && plan?.period_end
                        ? `${new Date(plan.period_start).toLocaleDateString()} - ${new Date(plan.period_end).toLocaleDateString()}`
                        : "—"}
                    </p>
                  </div>
                <div>
                  <p className="text-xs text-slate-500">Total Recommendations</p>
                  <p className="font-semibold text-[#123b68]">{recommendations.length}</p>
                </div>
                  <div>
                    <p className="text-xs text-slate-500">Status</p>
                    <p className="font-semibold text-[#123b68]">{plan?.status}</p>
                  </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#c2410c] mb-4">Intelligence Chain</p>
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div key={rec.plan_item_id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-[#123b68]">Skill: {rec.skill_id}</p>
                      <ActionBadge action={rec.recommended_action} />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-xs text-slate-500">Job Role</p>
                        <p className="text-sm text-slate-700">{rec.job_role_id || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Demand</p>
                        <p className="text-sm text-slate-700">{rec.demand_value != null ? rec.demand_value.toFixed(1) : "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Gap</p>
                        <p className={`text-sm font-medium ${rec.gap_value != null && rec.gap_value > 0 ? "text-red-600" : "text-slate-700"}`}>
                          {rec.gap_value != null ? rec.gap_value.toFixed(1) : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Review Status</p>
                        <p className="text-sm text-slate-700">{rec.review_status || "—"}</p>
                      </div>
                    </div>
                    {rec.rationale && (
                      <p className="mt-2 text-xs text-slate-600">{rec.rationale}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
