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

export default function EmergingJobRolesPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterSector, setFilterSector] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [technologies, setTechnologies] = useState<any[]>([]);
  const [skillsMap, setSkillsMap] = useState<Map<string, any[]>>(new Map());

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

  const loadTechnologies = useCallback(async () => {
    setFetching(true);
    try {
      const params: { sector_id?: string; district_id?: string } = {};
      if (filterSector) params.sector_id = filterSector;
      if (filterDistrict) params.district_id = filterDistrict;
      const data = await api.emergingTechnologies(params);
      setTechnologies(data);

      const skills = new Map<string, any[]>();
      for (const tech of data) {
        try {
          const s = await apiFetch<any[]>(`/api/v1/emerging-technologies/${tech.id}/skills`);
          skills.set(tech.id, s);
        } catch {
          skills.set(tech.id, []);
        }
      }
      setSkillsMap(skills);
      setError(null);
    } catch {
      setError("Failed to load emerging technologies.");
    } finally {
      setFetching(false);
    }
  }, [filterSector, filterDistrict]);

  useEffect(() => {
    loadTechnologies();
  }, [loadTechnologies]);

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

  const getConfidenceColor = (confidence: string) => {
    switch (confidence?.toUpperCase()) {
      case "HIGH": return "bg-green-100 text-green-800";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800";
      case "LOW": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction?.toUpperCase()) {
      case "UP": return "↗";
      case "DOWN": return "↘";
      case "STABLE": return "→";
      default: return "→";
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction?.toUpperCase()) {
      case "UP": return "text-green-600";
      case "DOWN": return "text-red-600";
      case "STABLE": return "text-yellow-600";
      default: return "text-slate-600";
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa]">
      <div className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#123b68]">Emerging Job Roles</h1>
          <p className="mt-2 text-slate-600">Explore emerging technologies and their related job roles.</p>
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
            Loading emerging technologies...
          </div>
        )}

        {!fetching && technologies.length === 0 && (
          <EmptyState message="No emerging technologies data available for the selected filters." />
        )}

        {!fetching && technologies.length > 0 && (
          <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#c2410c] mb-4">Emerging Technologies & Roles</p>
            <div className="overflow-x-auto w-full">
            <table data-wrapped="true" className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2">Technology</th>
                  <th className="text-left py-2 px-2">Trend</th>
                  <th className="text-right py-2 px-2">Growth</th>
                  <th className="text-left py-2 px-2">Confidence</th>
                  <th className="text-left py-2 px-2">Related Skills</th>
                  <th className="text-left py-2 px-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {technologies.map((tech) => {
                  const trendIcon = getTrendIcon(tech.trend_direction);
                  const trendCls = getTrendColor(tech.trend_direction);
                  const confidenceCls = getConfidenceColor(tech.confidence);
                  const techSkills = skillsMap.get(tech.id) || [];

                  return (
                    <tr key={tech.id} className="border-b border-slate-100">
                      <td className="py-2 px-2 font-medium">{tech.technology_name}</td>
                      <td className={`py-2 px-2 ${trendCls}`}>
                        <span className="mr-1">{trendIcon}</span>
                        {tech.trend_direction || "—"}
                      </td>
                      <td className="py-2 px-2 text-right">{tech.growth_indicator != null ? `${tech.growth_indicator}%` : "—"}</td>
                      <td className="py-2 px-2">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${confidenceCls}`}>
                          {tech.confidence || "—"}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        {techSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {techSkills.slice(0, 5).map((s: any) => (
                              <span key={s.skill_id || s.id} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                                {s.name || s.skill_name || s.skill_id}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-2 px-2 max-w-xs truncate text-slate-600">{tech.notes || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </div>
        )}
      </div>
    </div>
  );
}

async function apiFetch<T>(path: string): Promise<T> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const token = typeof window !== "undefined" ? sessionStorage.getItem("skillmitra_access_token") : null;
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") detail = body.detail;
    } catch {
      /* keep default */
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}
