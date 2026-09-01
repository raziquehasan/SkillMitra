"use client";

import { useEffect, useState, useCallback } from "react";
import { GovernmentShell } from "@/app/government/GovernmentShell";
import { api, type District } from "@/lib/api";
import { ClipboardList, ChevronDown } from "lucide-react";

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm text-center">
      <ClipboardList className="mx-auto h-10 w-10 text-slate-400" />
      <p className="mt-4 text-sm text-slate-600">{message}</p>
    </div>
  );
}

interface CapacityData {
  district_id: string;
  district_name: string;
  total_demand: number;
  verified_providers: number;
  course_offerings: number;
  total_capacity: number;
  capacity_status: string;
}

interface Classification {
  district_id: string;
  skill_id: string;
  demand_score: number | null;
  available_capacity: number;
  classification: string;
}

export default function CapacityPlanningPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [capacity, setCapacity] = useState<CapacityData | null>(null);
  const [classification, setClassification] = useState<Classification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const dRes = await api.districts().catch(() => []);
        setDistricts(dRes);
      } catch (err) {
        console.error("Failed to load districts:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadCapacity = useCallback(async () => {
    if (!filterDistrict) {
      setCapacity(null);
      setClassification([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [capRes, classRes] = await Promise.all([
        api.trainingCapacity(filterDistrict),
        api.trainingCapacityClassification({ district_id: filterDistrict }),
      ]);
      setCapacity(capRes);
      setClassification(classRes);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load capacity planning");
    } finally {
      setLoading(false);
    }
  }, [filterDistrict]);

  useEffect(() => {
    loadCapacity();
  }, [loadCapacity]);

  const maxDemand = classification.length > 0 ? Math.max(...classification.map((c) => c.demand_score ?? 0)) : 1;
  const maxCapacity = classification.length > 0 ? Math.max(...classification.map((c) => c.available_capacity)) : 1;
  const trainerGap = capacity ? Math.max(capacity.total_demand - capacity.verified_providers, 0) : 0;
  const equipmentGap = capacity ? Math.max(capacity.total_demand - capacity.course_offerings, 0) : 0;
  const utilization = capacity && capacity.total_demand > 0
    ? ((capacity.total_capacity / capacity.total_demand) * 100).toFixed(1)
    : "0";

  const districtName = districts.find((d) => d.id === filterDistrict)?.name || "";

  if (loading && !filterDistrict) {
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
    <GovernmentShell>
      <div className="min-h-screen bg-[#f4f7fa]">
        <div className="mx-auto max-w-7xl px-5 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#123b68]">Capacity Planning</h1>
            <p className="mt-2 text-slate-600">
              Analyze current capacity versus required capacity, trainer gaps, equipment gaps, and utilization rates.
            </p>
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
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!filterDistrict && (
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm text-center">
              <ClipboardList className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-sm text-slate-600">Select a district to view capacity planning details.</p>
            </div>
          )}

          {loading && filterDistrict && (
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#123b68] border-r-transparent" />
              <p className="mt-4 text-sm text-slate-600">Loading capacity data...</p>
            </div>
          )}

          {!loading && capacity && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#c2410c] mb-4">
                  Capacity Overview — {capacity.district_name}
                </p>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-xs text-slate-500">Total Demand</p>
                    <p className="font-semibold text-[#123b68]">{capacity.total_demand}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Total Capacity</p>
                    <p className="font-semibold text-[#123b68]">{capacity.total_capacity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Course Offerings</p>
                    <p className="font-semibold text-[#123b68]">{capacity.course_offerings}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Verified Providers</p>
                    <p className="font-semibold text-[#123b68]">{capacity.verified_providers}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Trainer Gap</p>
                    <p className="font-semibold text-red-600">{trainerGap}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Equipment Gap</p>
                    <p className="font-semibold text-red-600">{equipmentGap}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-slate-500">Utilization</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-3 flex-1 rounded-full bg-slate-200">
                      <div
                        className="h-3 rounded-full bg-[#c2410c]"
                        style={{
                          width: `${Math.min((capacity.total_capacity / (capacity.total_demand || 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600">{utilization}%</span>
                  </div>
                </div>
                <div className="mt-4">
                  <span
                    className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                      capacity.capacity_status === "SUFFICIENT"
                        ? "bg-green-100 text-green-800"
                        : capacity.capacity_status === "GAP"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {capacity.capacity_status}
                  </span>
                </div>
              </div>

              {classification.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#c2410c] mb-4">
                    Skill-Level Classification
                  </p>
                  <div className="space-y-4">
                    {classification.map((item) => (
                      <div key={item.skill_id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-[#123b68]">Skill: {item.skill_id}</p>
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              item.classification === "SUFFICIENT"
                                ? "bg-green-100 text-green-800"
                                : item.classification === "GAP"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {item.classification}
                          </span>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Demand Score</p>
                            <div className="h-2 w-full rounded-full bg-slate-200">
                              <div
                                className="h-2 rounded-full bg-[#123b68]"
                                style={{
                                  width: maxDemand > 0 ? `${Math.min((item.demand_score ?? 0) / maxDemand, 1) * 100}%` : "0%",
                                }}
                              />
                            </div>
                            <p className="mt-1 text-xs text-slate-600">{item.demand_score ?? "—"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Available Capacity</p>
                            <div className="h-2 w-full rounded-full bg-slate-200">
                              <div
                                className="h-2 rounded-full bg-[#c2410c]"
                                style={{
                                  width: maxCapacity > 0 ? `${Math.min(item.available_capacity / maxCapacity, 1) * 100}%` : "0%",
                                }}
                              />
                            </div>
                            <p className="mt-1 text-xs text-slate-600">{item.available_capacity}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && filterDistrict && !capacity && !error && (
            <EmptyState message={`No capacity planning data available for ${districtName || "the selected district"}.`} />
          )}
        </div>
      </div>
    </GovernmentShell>
  );
}
