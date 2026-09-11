"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { GovernmentShell } from "@/app/government/GovernmentShell";
import { api, type District, type IndustrySector } from "@/lib/api";

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';
import {
  GraduationCap,
  X,
  Search,
  MapPin,
  Users,
  Building2,
  TrendingUp,
  ArrowUpRight,
  Briefcase,
  Target,
  BarChart3,
} from "lucide-react";

type FilterState = {
  district_id: string;
  sector_id: string;
  status: string;
  provider: string;
  course: string;
};

const emptyFilters: FilterState = {
  district_id: "",
  sector_id: "",
  status: "",
  provider: "",
  course: "",
};

type TrainingProgram = {
  offering_id: string;
  course_id: string;
  course_title: string;
  provider_id: string;
  provider_name: string;
  district_id: string;
  district_name: string;
  sanctioned_seats: number;
  active_seats: number;
  utilized_seats: number;
  available_seats: number;
  status: string;
  sector: string | null;
  source: string;
};



const toNumber = (value: unknown): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const normalizeStatus = (value: unknown): string => {
  const normalized = String(value ?? "").trim().toUpperCase();
  if (["ACTIVE", "RUNNING", "OPEN"].includes(normalized)) return "ACTIVE";
  if (["UPCOMING", "SCHEDULED", "NEW"].includes(normalized)) return "UPCOMING";
  if (["COMPLETED", "FINISHED", "CLOSED"].includes(normalized)) return "COMPLETED";
  if (["SUSPENDED", "INACTIVE", "PAUSED"].includes(normalized)) return "SUSPENDED";
  return normalized || "ACTIVE";
};

const normalizeProgram = (raw: any): TrainingProgram => {
  const sanctioned_seats = Math.max(toNumber(raw?.sanctioned_seats ?? raw?.active_seats ?? 0), 0);
  const active_seats = Math.max(toNumber(raw?.active_seats ?? sanctioned_seats), 0);
  const utilized_seats = Math.max(toNumber(raw?.utilized_seats ?? 0), 0);
  const available_seats = Math.max(active_seats - utilized_seats, 0);

  return {
    offering_id: String(raw?.offering_id ?? raw?.id ?? crypto.randomUUID()),
    course_id: String(raw?.course_id ?? ""),
    course_title: String(raw?.course_title ?? "Training Program"),
    provider_id: String(raw?.provider_id ?? ""),
    provider_name: String(raw?.provider_name ?? "Training Provider"),
    district_id: String(raw?.district_id ?? ""),
    district_name: String(raw?.district_name ?? "Unknown District"),
    sanctioned_seats,
    active_seats,
    utilized_seats,
    available_seats,
    status: normalizeStatus(raw?.status ?? "ACTIVE"),
    sector: raw?.sector ?? null,
    source: String(raw?.source ?? "supabase"),
  };
};



export default function TrainingProgramsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
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

  const loadPrograms = useCallback(async () => {
    setLoading(true);
    setErrorInfo(null);

    try {
      const data = await api.trainingPrograms({
        district_id: filters.district_id || undefined,
        sector_id: filters.sector_id || undefined,
        status: filters.status || undefined,
        search: filters.provider || filters.course ? `${filters.provider} ${filters.course}`.trim() : undefined,
      });

      const normalized = Array.isArray(data) ? data.map(normalizeProgram) : [];
      setPrograms(normalized);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load training programs";
      console.error("Training programs error:", message);
      setErrorInfo(message);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  const clearFilters = () => setFilters(emptyFilters);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const kpis = useMemo(() => {
    const total = programs.length;
    const active = programs.filter((program) => program.status === "ACTIVE").length;
    const totalCapacity = programs.reduce((sum, program) => sum + program.active_seats, 0);
    const totalEnrollment = programs.reduce((sum, program) => sum + program.utilized_seats, 0);
    const averageUtilization = totalCapacity > 0 ? ((totalEnrollment / totalCapacity) * 100).toFixed(1) : "0.0";

    return {
      total,
      active,
      totalCapacity,
      totalEnrollment,
      averageUtilization,
    };
  }, [programs]);

  const programUtilization = useMemo(() => {
    return [...programs]
      .map(program => ({
        ...program,
        utilization: program.active_seats > 0 ? Math.round((program.utilized_seats / program.active_seats) * 100) : 0
      }))
      .sort((a, b) => b.utilization - a.utilization)
      .slice(0, 5);
  }, [programs]);

  const capacityVsEnrollment = useMemo(() => {
    return [...programs].slice(0, 5).map((program) => ({
      name: program.course_title && program.course_title.length > 18 ? `${program.course_title.slice(0, 18)}...` : program.course_title || 'Unknown',
      capacity: program.active_seats,
      enrolled: program.utilized_seats,
    }));
  }, [programs]);

  const statusBreakdown = useMemo(() => {
    const statusMap = {
      ACTIVE: 0,
      UPCOMING: 0,
      COMPLETED: 0,
      SUSPENDED: 0,
    };

    programs.forEach((program) => {
      if (statusMap[program.status as keyof typeof statusMap] !== undefined) {
        statusMap[program.status as keyof typeof statusMap] += 1;
      }
    });

    return Object.entries(statusMap)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [programs]);

  const sectorSummary = useMemo(() => {
    const totals = new Map<string, number>();
    programs.forEach((program) => {
      if (program.sector) {
        totals.set(program.sector, (totals.get(program.sector) ?? 0) + 1);
      }
    });

    return [...totals.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [programs]);

  const statusStyles: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    UPCOMING: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-slate-200 text-slate-700",
    SUSPENDED: "bg-red-100 text-red-700",
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return "bg-emerald-500";
    if (utilization >= 60) return "bg-[#1e3a8a]";
    if (utilization >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  const totalStatus = statusBreakdown.reduce((sum, item) => sum + Number(item.value), 0);
  const donutGradient = statusBreakdown.length
    ? `conic-gradient(${[
        ["#10b981", Number(statusBreakdown.find((x) => x.name === "ACTIVE")?.value ?? 0)],
        ["#3b82f6", Number(statusBreakdown.find((x) => x.name === "UPCOMING")?.value ?? 0)],
        ["#94a3b8", Number(statusBreakdown.find((x) => x.name === "COMPLETED")?.value ?? 0)],
        ["#ef4444", Number(statusBreakdown.find((x) => x.name === "SUSPENDED")?.value ?? 0)],
      ]
        .map(([color, value]) => `${color} ${((Number(value) / Math.max(totalStatus, 1)) * 100).toFixed(2)}%`)
        .join(", ")})`
    : "conic-gradient(#e2e8f0 0% 100%)";

  return (
    <GovernmentShell>
      <div className="bg-[#F5F7FA] p-4 md:p-6">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-5">
            <h1 className="text-4xl font-bold tracking-tight text-[#1e293b]">Training Programs</h1>
            <p className="mt-1 text-base text-slate-600">
              Monitor training program offerings, enrollment, capacity and utilization across districts.
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

              <div className="min-w-[150px] flex-1">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Status</label>
                <select
                  value={filters.status}
                  onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
                  className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#1e3a8a] focus:outline-none focus:ring-1 focus:ring-[#1e3a8a]"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>

              <div className="min-w-[220px] flex-1">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Search Provider</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={filters.provider}
                    onChange={(event) => setFilters((prev) => ({ ...prev, provider: event.target.value }))}
                    placeholder="Search by provider name..."
                    className="w-full rounded border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-[#1e3a8a] focus:outline-none focus:ring-1 focus:ring-[#1e3a8a]"
                  />
                </div>
              </div>

              <div className="min-w-[220px] flex-1">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Search Course</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={filters.course}
                    onChange={(event) => setFilters((prev) => ({ ...prev, course: event.target.value }))}
                    placeholder="Search by course name..."
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

          <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-5">
            {[
              { label: "Total Programs", value: kpis.total, color: "bg-[#1e3a8a]/10 text-[#1e3a8a]", icon: GraduationCap },
              { label: "Active Programs", value: kpis.active, color: "bg-emerald-100 text-emerald-700", icon: TrendingUp },
              { label: "Total Enrollment", value: kpis.totalEnrollment.toLocaleString(), color: "bg-blue-100 text-blue-700", icon: Users },
              { label: "Total Capacity", value: kpis.totalCapacity.toLocaleString(), color: "bg-amber-100 text-amber-700", icon: Building2 },
              { label: "Average Utilization", value: `${kpis.averageUtilization}%`, color: "bg-violet-100 text-violet-700", icon: BarChart3 },
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
          ) : programs.length === 0 ? (
            <div className="rounded-md border border-slate-200 bg-white p-10 text-center shadow-sm">
              <GraduationCap className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-700">No training programs found</p>
              <p className="mt-1 text-xs text-slate-500">Try changing the selected district, sector, or status.</p>
            </div>
          ) : (
            <>
              <div className="mb-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
                <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-[#1e293b]">Program Utilization</h2>
                    <span className="text-xs text-slate-500">Top programs</span>
                  </div>
                  <div className="space-y-4">
                    {programUtilization.map((program) => {
                      const utilization = program.active_seats > 0 ? Math.round((program.utilized_seats / program.active_seats) * 100) : 0;
                      return (
                        <div key={program.offering_id}>
                          <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                            <span className="max-w-[70%] truncate">{program.course_title}</span>
                            <span className="font-medium text-[#1e293b]">{utilization}%</span>
                          </div>
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${getUtilizationColor(utilization)}`}
                              style={{ width: `${utilization}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-[#1e293b]">Program Status</h2>
                    <span className="text-xs text-slate-500">Current mix</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative h-28 w-28 shrink-0 rounded-full" style={{ background: donutGradient }} />
                    <div className="flex-1 space-y-2 text-xs">
                      {statusBreakdown.map((item) => (
                        <div key={item.name} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-block h-2.5 w-2.5 rounded-full ${
                                item.name === "ACTIVE"
                                  ? "bg-emerald-500"
                                  : item.name === "UPCOMING"
                                    ? "bg-blue-500"
                                    : item.name === "COMPLETED"
                                      ? "bg-slate-500"
                                      : "bg-red-500"
                              }`}
                            />
                            <span className="text-slate-600">{item.name}</span>
                          </div>
                          <span className="font-medium text-[#1e293b]">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-5 grid gap-5 xl:grid-cols-[1.3fr_0.9fr]">
                <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-[#1e293b]">Capacity vs Enrollment</h2>
                    <span className="text-xs text-slate-500">Top programs</span>
                  </div>
                  <div className="space-y-4">
                    {capacityVsEnrollment.map((program) => (
                      <div key={program.name}>
                        <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                          <span className="truncate pr-2">{program.name}</span>
                          <span className="font-medium text-[#1e293b]">{program.enrolled}/{program.capacity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-[#1e3a8a]" style={{ width: `${Math.min((program.enrolled / program.capacity) * 100, 100)}%` }} />
                          </div>
                          <div className="h-2.5 w-10 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min((program.capacity / Math.max(program.capacity, 1)) * 100, 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-[#1e293b]">Sector Summary</h2>
                    <span className="text-xs text-slate-500">Programs</span>
                  </div>
                  <div className="space-y-3">
                    {sectorSummary.map((sector) => (
                      <div key={sector.name}>
                        <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                          <span>{sector.name}</span>
                          <span className="font-medium text-[#1e293b]">{sector.value}</span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-[#1e3a8a]"
                            style={{ width: `${(sector.value / Math.max(...sectorSummary.map((item) => item.value), 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-[#1e3a8a]" />
                    <h2 className="text-base font-semibold text-[#1e293b]">Program Directory</h2>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Target className="h-3.5 w-3.5" />
                    {programs.length} programs
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <div className="overflow-x-auto w-full">
            <table data-wrapped="true" className="min-w-[1100px] w-full text-sm">
                    <thead className="bg-slate-50 text-left text-[#1e293b]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Course</th>
                        <th className="px-4 py-3 font-semibold">Provider</th>
                        <th className="px-4 py-3 font-semibold">District</th>
                        <th className="px-4 py-3 font-semibold">Sector</th>
                        <th className="px-4 py-3 text-right font-semibold">Capacity</th>
                        <th className="px-4 py-3 text-right font-semibold">Enrolled</th>
                        <th className="px-4 py-3 text-right font-semibold">Available</th>
                        <th className="px-4 py-3 font-semibold">Utilization</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {programs.map((program) => {
                        const utilization = program.active_seats > 0 ? Math.round((program.utilized_seats / program.active_seats) * 100) : 0;
                        return (
                          <tr key={program.offering_id} className="border-t border-slate-100 hover:bg-slate-50">
                            <td className="px-4 py-3">
                              <div className="font-medium text-[#1e293b]">{program.course_title}</div>
                              {program.source === "demo" && (
                                <span className="mt-1 inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700">
                                  Demo
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-600">{program.provider_name}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                {program.district_name}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{program.sector || "General"}</td>
                            <td className="px-4 py-3 text-right font-medium text-[#1e293b]">{program.active_seats}</td>
                            <td className="px-4 py-3 text-right font-medium text-[#1e3a8a]">{program.utilized_seats}</td>
                            <td className="px-4 py-3 text-right text-slate-600">{program.available_seats}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="h-2.5 w-20 overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className={`h-full rounded-full ${getUtilizationColor(utilization)}`}
                                    style={{ width: `${utilization}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-slate-600">{utilization}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex rounded px-2 py-1 text-[11px] font-medium ${statusStyles[program.status] ?? "bg-slate-200 text-slate-700"}`}>
                                {program.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
          </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </GovernmentShell>
  );
}
