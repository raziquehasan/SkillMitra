"use client";

import { useEffect, useState, useCallback } from "react";
import { GovernmentShell } from "@/app/government/GovernmentShell";
import { api, type District, type IndustrySector } from "@/lib/api";

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import {
  Users,
  MapPin,
  GraduationCap,
  Search,
  X,
  Filter,
  TrendingUp,
  Briefcase,
  Building2,
} from "lucide-react";

type FilterState = {
  district_id: string;
  sector_id: string;
  skill_id: string;
  training_status: string;
  employment_status: string;
  search: string;
};

const emptyFilters: FilterState = {
  district_id: "",
  sector_id: "",
  skill_id: "",
  training_status: "",
  employment_status: "",
  search: "",
};

type Candidate = {
  candidate_id: string;
  name: string | null;
  district_id: string | null;
  district_name: string | null;
  current_status: string | null;
  education_level: string | null;
  skills: string[];
};

type GovernmentCandidatesResponse = {
  candidates: Candidate[];
  total: number;
  by_district: Array<{
    district_id: string;
    district_name: string;
    count: number;
  }>;
  filters: {
    district_id: string | null;
    sector_id: string | null;
    skill_id: string | null;
    training_status: string | null;
    employment_status: string | null;
  } | null;
};

export default function CandidatesPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [districtStats, setDistrictStats] = useState<Array<{ district_id: string; district_name: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [districtResponse, sectorResponse] = await Promise.all([
          api.districts().catch(() => []),
          api.sectors().catch(() => []),
        ]);
        setDistricts(districtResponse);
        setSectors(sectorResponse);
      } catch (err) {
        console.error("Failed to load lookup data:", err);
      }
    };

    loadLookups();
  }, []);

  const loadCandidates = useCallback(async () => {
    setLoading(true);
    setErrorInfo(null);

    try {
      const data = await api.governmentCandidates({
        district_id: filters.district_id || undefined,
        sector_id: filters.sector_id || undefined,
        skill_id: filters.skill_id || undefined,
        training_status: filters.training_status || undefined,
        employment_status: filters.employment_status || undefined,
      }) as GovernmentCandidatesResponse;

      setCandidates(data.candidates);
      setDistrictStats(data.by_district);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load candidates";
      console.error("Candidates error:", message);
      setErrorInfo(message);
      setCandidates([]);
      setDistrictStats([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const clearFilters = () => setFilters(emptyFilters);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // Filter candidates by search term (client-side search for name)
  const filteredCandidates = candidates.filter(candidate => {
    if (!filters.search) return true;
    const searchTerm = filters.search.toLowerCase();
    return (
      candidate.name?.toLowerCase().includes(searchTerm) ||
      candidate.district_name?.toLowerCase().includes(searchTerm) ||
      candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm))
    );
  });

  const totalCandidates = candidates.length;
  const totalDistricts = districtStats.length;

  return (
    <GovernmentShell>
      <div className="bg-[#F5F7FA] p-4 md:p-6">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-5">
            <h1 className="text-4xl font-bold tracking-tight text-[#1e293b]">Candidates</h1>
            <p className="mt-1 text-base text-slate-600">
              View candidate profiles, skills, and workforce distribution across districts.
            </p>
          </div>

          <div className="mb-5 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-[180px] flex-1">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">District</label>
                <select
                  value={filters.district_id}
                  onChange={(event) => setFilters((prev) => ({ ...prev, district_id: event.target.value }))}
                  className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#1e3a8a] focus:outline-none focus:ring-1 focus:ring-[#1e3a8a]"
                >
                  <option value="">All Districts</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-[180px] flex-1">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Sector</label>
                <select
                  value={filters.sector_id}
                  onChange={(event) => setFilters((prev) => ({ ...prev, sector_id: event.target.value }))}
                  className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#1e3a8a] focus:outline-none focus:ring-1 focus:ring-[#1e3a8a]"
                >
                  <option value="">All Sectors</option>
                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-[220px] flex-1">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Search</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={filters.search}
                    onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                    placeholder="Search by name, district, or skill..."
                    className="w-full rounded border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-[#1e3a8a] focus:outline-none focus:ring-1 focus:ring-[#1e3a8a]"
                  />
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 whitespace-nowrap rounded px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                >
                  <X className="h-3.5 w-3.5" /> Reset
                </button>
              )}
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Total Candidates", value: totalCandidates, color: "bg-[#1e3a8a]/10 text-[#1e3a8a]", icon: Users },
              { label: "Districts Covered", value: totalDistricts, color: "bg-emerald-100 text-emerald-700", icon: MapPin },
              { label: "Filtered Results", value: filteredCandidates.length, color: "bg-blue-100 text-blue-700", icon: Filter },
              { label: "Active Status", value: candidates.filter(c => c.current_status === "active").length, color: "bg-violet-100 text-violet-700", icon: TrendingUp },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`rounded p-2 ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                    <p className="text-xl font-bold text-[#1e293b]">{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 h-4 w-48 animate-pulse rounded bg-slate-200" />
              <div className="space-y-3">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="h-10 animate-pulse rounded bg-slate-100" />
                ))}
              </div>
            </div>
          ) : errorInfo ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-6 shadow-sm">
              <p className="text-sm font-medium text-red-700">Unable to load candidates</p>
              <p className="mt-1 text-xs text-red-600">{errorInfo}</p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="rounded-md border border-slate-200 bg-white p-10 text-center shadow-sm">
              <Users className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-700">No candidates found</p>
              <p className="mt-1 text-xs text-slate-500">Try changing the selected filters or search term.</p>
            </div>
          ) : (
            <>
              <div className="mb-5 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-[#1e293b]">Candidates by District</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {districtStats.map((stat) => (
                    <div key={stat.district_id} className="rounded border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-700">{stat.district_name}</span>
                        </div>
                        <span className="text-sm font-bold text-[#1e3a8a]">{stat.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <h2 className="text-base font-semibold text-[#1e293b]">Candidate List</h2>
                </div>
                <div className="divide-y divide-slate-200">
                  {filteredCandidates.map((candidate) => (
                    <div key={candidate.candidate_id} className="px-4 py-4 hover:bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-slate-400" />
                            <h3 className="text-sm font-medium text-[#1e293b]">
                              {candidate.name || "Unknown Candidate"}
                            </h3>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
                            {candidate.district_name && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-slate-400" />
                                <span>{candidate.district_name}</span>
                              </div>
                            )}
                            {candidate.education_level && (
                              <div className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3 text-slate-400" />
                                <span>{candidate.education_level}</span>
                              </div>
                            )}
                            {candidate.current_status && (
                              <div className="flex items-center gap-1">
                                <Briefcase className="h-3 w-3 text-slate-400" />
                                <span>{candidate.current_status}</span>
                              </div>
                            )}
                          </div>
                          {candidate.skills.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {candidate.skills.slice(0, 5).map((skill, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                                >
                                  {skill}
                                </span>
                              ))}
                              {candidate.skills.length > 5 && (
                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                  +{candidate.skills.length - 5} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </GovernmentShell>
  );
}