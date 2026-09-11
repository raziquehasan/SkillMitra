"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { GovernmentShell } from "@/app/government/GovernmentShell";
import { api, type District, type IndustrySector } from "@/lib/api";
import {
  RefreshCw, MapPin, Users, BookOpen, Briefcase, TrendingUp, 
  BarChart3, Filter, X, Search, ChevronDown, PieChart, 
  AlertTriangle, CheckCircle, ArrowRight, Target, Download,
  Calendar, Building2, GraduationCap, Activity, ArrowDown
} from "lucide-react";



export default function PlacementAnalyticsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Filters
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterSector, setFilterSector] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterJobRole, setFilterJobRole] = useState("");
  const [filterTimePeriod, setFilterTimePeriod] = useState("last_12_months");
  const [filterPlacementStatus, setFilterPlacementStatus] = useState("");

  // Data state
  const [placementData, setPlacementData] = useState<any>(null);

  // Load reference data on mount
  useEffect(() => {
    (async () => {
      try {
        const [dRes, sRes] = await Promise.all([
          api.districts().catch(() => []),
          api.sectors().catch(() => [])
        ]);
        setDistricts(dRes);
        setSectors(sRes);
      } catch {
        /* Ignore errors, fallback to empty arrays */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load placement data
  useEffect(() => {
    const loadPlacementData = async () => {
      setFetching(true);
      setError(null);
      try {
        // Try backend API first
        const [outcomesRes, dashboardRes] = await Promise.all([
          api.placementOutcomes().catch(() => null),
          api.governmentDashboard({ district_id: filterDistrict || undefined }).catch(() => null)
        ]);

        if (outcomesRes && dashboardRes) {
          // Transform backend data into our structure
          const transformed = {
            kpis: {
              total_candidates: outcomesRes.enrolled_count || 0,
              completed_training: outcomesRes.completed_count || 0,
              total_placed: outcomesRes.placement_count || 0,
              placement_rate: outcomesRes.placement_rate ? (outcomesRes.placement_rate * 100) : 0,
              employer_demand: 0,
              candidates_seeking_jobs: 0
            }
          };
          setPlacementData(transformed);
        } else {
          setPlacementData(null);
        }
      } catch {
        setPlacementData(null);
      } finally {
        setFetching(false);
        setLastUpdated(new Date());
      }
    };

    loadPlacementData();
  }, [filterDistrict]);

  // Calculate filtered data
  const filteredData = useMemo(() => {
    return placementData; // Simplified filtering for now
  }, [placementData, filterDistrict, filterSector, filterTimePeriod, filterPlacementStatus]);

  // Active filter count
  const activeFilterCount = [filterDistrict, filterSector, filterCourse, filterJobRole, filterPlacementStatus].filter(Boolean).length;

  // Reset filters
  const resetFilters = () => {
    setFilterDistrict("");
    setFilterSector("");
    setFilterCourse("");
    setFilterJobRole("");
    setFilterTimePeriod("last_12_months");
    setFilterPlacementStatus("");
  };

  // Refresh data
  const refreshData = useCallback(async () => {
    setFetching(true);
    setError(null);
    setLastUpdated(new Date());
    try {
      const [outcomesRes, dashboardRes] = await Promise.all([
        api.placementOutcomes().catch(() => null),
        api.governmentDashboard({ district_id: filterDistrict || undefined }).catch(() => null)
      ]);

      if (outcomesRes && dashboardRes) {
        const transformed = {
          kpis: {
            total_candidates: outcomesRes.enrolled_count || 0,
            completed_training: outcomesRes.completed_count || 0,
            total_placed: outcomesRes.placement_count || 0,
            placement_rate: outcomesRes.placement_rate ? (outcomesRes.placement_rate * 100) : 0,
            employer_demand: 0,
            candidates_seeking_jobs: 0
          }
        };
        setPlacementData(transformed);
      } else {
        setPlacementData(null);
      }
    } catch {
      setPlacementData(null);
    } finally {
      setFetching(false);
    }
  }, [filterDistrict]);

  // Get placement rate color
  const getPlacementRateColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 70) return "text-blue-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "excellent":
      case "high demand":
        return "bg-green-100 text-green-800";
      case "good":
      case "moderate":
        return "bg-blue-100 text-blue-800";
      case "needs improvement":
      case "high":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  if (loading) {
    return (
      <GovernmentShell>
        <div className="min-h-screen bg-[#f4f7fa] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1e3a8a] border-r-transparent" />
            <p className="mt-4 text-sm text-slate-600">Loading placement analytics...</p>
          </div>
        </div>
      </GovernmentShell>
    );
  }

  const data = filteredData;

  return (
    <GovernmentShell>
      <div className="min-h-screen bg-[#f4f7fa]">
        <div className="mx-auto max-w-[1600px] w-full px-5 py-8">
          {/* Page Header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">Placement Analytics</h1>
              <p className="mt-1 text-sm text-slate-600">
                Monitor placement performance, employment outcomes, job-role demand and district-level workforce results across Maharashtra.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <button
                onClick={refreshData}
                disabled={fetching}
                className="text-xs text-slate-600 hover:text-slate-800 flex items-center gap-1"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${fetching ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button className="text-xs text-slate-600 hover:text-slate-800 flex items-center gap-1">
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mb-5 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">District</label>
                <select
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                >
                  <option value="">All Districts</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Sector</label>
                <select
                  value={filterSector}
                  onChange={(e) => setFilterSector(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                >
                  <option value="">All Sectors</option>
                  {sectors.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Course</label>
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                >
                  <option value="">All Courses</option>
                  <option value="ev">EV Service Technician</option>
                  <option value="cnc">CNC Machine Operator</option>
                  <option value="solar">Solar Installation</option>
                </select>
              </div>

              <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Job Role</label>
                <select
                  value={filterJobRole}
                  onChange={(e) => setFilterJobRole(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                >
                  <option value="">All Job Roles</option>
                  <option value="technician">Technician</option>
                  <option value="operator">Operator</option>
                  <option value="developer">Developer</option>
                </select>
              </div>

              <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Time Period</label>
                <select
                  value={filterTimePeriod}
                  onChange={(e) => setFilterTimePeriod(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                >
                  <option value="current_month">Current Month</option>
                  <option value="last_3_months">Last 3 Months</option>
                  <option value="last_6_months">Last 6 Months</option>
                  <option value="last_12_months">Last 12 Months</option>
                </select>
              </div>

              <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Placement Status</label>
                <select
                  value={filterPlacementStatus}
                  onChange={(e) => setFilterPlacementStatus(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                >
                  <option value="">All</option>
                  <option value="placed">Placed</option>
                  <option value="in_training">In Training</option>
                  <option value="job_seeking">Job Seeking</option>
                  <option value="assessment_pending">Assessment Pending</option>
                </select>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <X className="h-3.5 w-3.5" /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* KPI Section */}
          <div className="mb-5 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-[#1e3a8a]/10 text-[#1e3a8a]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total Candidates</p>
                  <p className="text-xl font-bold text-[#1e3a8a]">{data.kpis.total_candidates.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-blue-100 text-blue-700">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Completed Training</p>
                  <p className="text-xl font-bold text-blue-700">{data.kpis.completed_training.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-green-100 text-green-700">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total Placed</p>
                  <p className="text-xl font-bold text-green-700">{data.kpis.total_placed.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-purple-100 text-purple-700">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Placement Rate</p>
                  <p className="text-xl font-bold text-purple-700">{data.kpis.placement_rate}%</p>
                  <p className="text-[10px] text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> 6.8% vs previous
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-amber-100 text-amber-700">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Employer Demand</p>
                  <p className="text-xl font-bold text-amber-700">{data.kpis.employer_demand.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-red-100 text-red-700">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Candidates Seeking Jobs</p>
                  <p className="text-xl font-bold text-red-700">{data.kpis.candidates_seeking_jobs.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Executive Placement Summary */}
          <div className="mb-5 grid gap-5 grid-cols-1 lg:grid-cols-2">
            {/* Placement Performance */}
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Placement Performance</h3>
              <div className="space-y-2">
                {data.placement_trend.map((item: any) => (
                  <div key={item.month} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-8">{item.month}</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1e3a8a] rounded-full transition-all"
                        style={{ width: `${item.placement_rate}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#1e3a8a] w-12 text-right">{item.placement_rate}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500">12-month trend • Current: 81.4% • Previous: 79.0%</p>
              </div>
            </div>

            {/* Employment Status */}
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Employment Status</h3>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <svg viewBox="0 0 36 36" className="h-32 w-32 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3" 
                      strokeDasharray={`${(data.employment_status.placed / (data.employment_status.placed + data.employment_status.in_training + data.employment_status.job_seeking + data.employment_status.assessment_pending)) * 100} ${100 - (data.employment_status.placed / (data.employment_status.placed + data.employment_status.in_training + data.employment_status.job_seeking + data.employment_status.assessment_pending)) * 100}`} />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="3" 
                      strokeDasharray={`${(data.employment_status.in_training / (data.employment_status.placed + data.employment_status.in_training + data.employment_status.job_seeking + data.employment_status.assessment_pending)) * 100} ${100 - (data.employment_status.in_training / (data.employment_status.placed + data.employment_status.in_training + data.employment_status.job_seeking + data.employment_status.assessment_pending)) * 100}`} 
                      strokeDashoffset={`-${(data.employment_status.placed / (data.employment_status.placed + data.employment_status.in_training + data.employment_status.job_seeking + data.employment_status.assessment_pending)) * 100}`} />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="3" 
                      strokeDasharray={`${(data.employment_status.job_seeking / (data.employment_status.placed + data.employment_status.in_training + data.employment_status.job_seeking + data.employment_status.assessment_pending)) * 100} ${100 - (data.employment_status.job_seeking / (data.employment_status.placed + data.employment_status.in_training + data.employment_status.job_seeking + data.employment_status.assessment_pending)) * 100}`} 
                      strokeDashoffset={`-${((data.employment_status.placed + data.employment_status.in_training) / (data.employment_status.placed + data.employment_status.in_training + data.employment_status.job_seeking + data.employment_status.assessment_pending)) * 100}`} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-[#1e293b]">{(data.employment_status.placed + data.employment_status.in_training + data.employment_status.job_seeking + data.employment_status.assessment_pending).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-xs text-slate-600">Placed</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{data.employment_status.placed.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-xs text-slate-600">In Training</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{data.employment_status.in_training.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-xs text-slate-600">Job Seeking</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{data.employment_status.job_seeking.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-400" />
                      <span className="text-xs text-slate-600">Assessment Pending</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{data.employment_status.assessment_pending.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* District Performance */}
          <div className="mb-5 bg-white rounded-md border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#1e293b]">District Placement Performance</h3>
              <button className="text-xs text-[#1e3a8a] hover:text-[#1e3a8a]/80">View All Districts</button>
            </div>
            <div className="space-y-2">
              {data.district_performance.map((district: any) => (
                <div key={district.district} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50">
                  <span className="text-xs font-bold text-slate-400 w-6">{district.rank}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-700">{district.district}</span>
                      <span className={`text-xs font-bold ${getPlacementRateColor(district.placement_rate)}`}>{district.placement_rate}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          district.placement_rate >= 80 ? 'bg-green-500' :
                          district.placement_rate >= 70 ? 'bg-blue-500' :
                          district.placement_rate >= 60 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${district.placement_rate}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500">{district.placed.toLocaleString()} placed</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${getStatusColor(district.status)}`}>
                    {district.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sector Performance */}
          <div className="mb-5 grid gap-5 grid-cols-1 lg:grid-cols-2">
            {/* Placement Outcomes by Sector */}
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Placement Outcomes by Sector</h3>
              <div className="space-y-3">
                {data.sector_performance.map((sector: any) => (
                  <div key={sector.sector} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-700">{sector.sector}</span>
                      <span className={`text-xs font-bold ${getPlacementRateColor(sector.placement_rate)}`}>{sector.placement_rate}%</span>
                    </div>
                    <div className="flex gap-1 h-4">
                      <div className="flex-1 bg-slate-100 rounded-l overflow-hidden relative">
                        <div className="h-full bg-blue-500 absolute left-0 top-0" style={{ width: `${(sector.candidates / 20000) * 100}%` }} />
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] text-slate-600">Candidates</span>
                      </div>
                      <div className="flex-1 bg-slate-100 rounded-r overflow-hidden relative">
                        <div className="h-full bg-green-500 absolute left-0 top-0" style={{ width: `${(sector.placed / 20000) * 100}%` }} />
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] text-slate-600">Placed</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Employer Demand vs Placement */}
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Employer Demand vs Placement</h3>
              <div className="space-y-3">
                {data.sector_performance.map((sector: any) => {
                  const maxVal = Math.max(sector.demand, sector.placed);
                  return (
                    <div key={sector.sector} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-700 w-28 truncate">{sector.sector}</span>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="w-16 text-right">{sector.demand.toLocaleString()}</span>
                          <span className="w-16 text-right">{sector.placed.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 h-6">
                        <div className="flex-1 bg-slate-100 rounded-l overflow-hidden relative">
                          <div className="h-full bg-amber-500 absolute left-0 top-0" style={{ width: `${(sector.demand / maxVal) * 100}%` }} />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-600 font-medium">Demand</span>
                        </div>
                        <div className="flex-1 bg-slate-100 rounded-r overflow-hidden relative">
                          <div className="h-full bg-green-500 absolute left-0 top-0" style={{ width: `${(sector.placed / maxVal) * 100}%` }} />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-600 font-medium">Placed</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-amber-500" />
                  <span className="text-xs text-slate-600">Employer Demand</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span className="text-xs text-slate-600">Placed Candidates</span>
                </div>
              </div>
            </div>
          </div>

          {/* Job Role Analytics */}
          <div className="mb-5 bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-[#1e293b]">Job Role Placement Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <div className="overflow-x-auto w-full">
            <table data-wrapped="true" className="w-full text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Job Role</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-600">Demand</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-600">Trained</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-600">Placed</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-600">Placement Rate</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-600">Demand Gap</th>
                    <th className="px-4 py-3 text-center font-semibold text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.job_role_performance.map((role: any) => (
                    <tr key={role.job_role} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-700">{role.job_role}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{role.demand.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{role.trained.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{role.placed.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold ${getPlacementRateColor(role.placement_rate)}`}>{role.placement_rate}%</span>
                      </td>
                      <td className="px-4 py-3 text-center text-red-600">{role.demand_gap.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${getStatusColor(role.status)}`}>
                          {role.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
            </div>
          </div>

          {/* Course Employment Effectiveness */}
          <div className="mb-5 grid gap-5 grid-cols-1 lg:grid-cols-2">
            {/* Top Performing Courses */}
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Top Performing Courses</h3>
              <div className="space-y-3">
                {data.course_performance.map((course: any) => (
                  <div key={course.course} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-700">{course.course}</span>
                      <span className={`text-xs font-bold ${getPlacementRateColor(course.placement_rate)}`}>{course.placement_rate}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          course.placement_rate >= 80 ? 'bg-green-500' :
                          course.placement_rate >= 70 ? 'bg-blue-500' :
                          'bg-amber-500'
                        }`}
                        style={{ width: `${course.placement_rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Placement Funnel */}
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Course Placement Funnel</h3>
              <div className="space-y-3">
                {data.course_performance[0] && (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-700 w-24">Enrolled</span>
                      <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden relative">
                        <div className="h-full bg-[#1e3a8a] rounded-lg" style={{ width: '100%' }} />
                        <span className="absolute inset-0 flex items-center justify-end pr-3 text-white text-xs font-bold">{data.course_performance[0].enrolled.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-700 w-24">Completed</span>
                      <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden relative">
                        <div className="h-full bg-blue-500 rounded-lg" style={{ width: `${(data.course_performance[0].completed / data.course_performance[0].enrolled) * 100}%` }} />
                        <span className="absolute inset-0 flex items-center justify-end pr-3 text-white text-xs font-bold">{data.course_performance[0].completed.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-slate-700 w-24">Placed</span>
                      <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden relative">
                        <div className="h-full bg-green-500 rounded-lg" style={{ width: `${(data.course_performance[0].placed / data.course_performance[0].enrolled) * 100}%` }} />
                        <span className="absolute inset-0 flex items-center justify-end pr-3 text-white text-xs font-bold">{data.course_performance[0].placed.toLocaleString()}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Skill Placement Analysis */}
          <div className="mb-5 bg-white rounded-md border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Skills Associated with Successful Placement</h3>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {data.skill_placement.map((skill: any) => (
                <div key={skill.skill} className="p-3 bg-slate-50 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-700">{skill.skill}</span>
                    <span className={`text-xs font-bold ${getPlacementRateColor(skill.placement_rate)}`}>{skill.placement_rate}%</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Demand: {skill.demand.toLocaleString()}</span>
                      <span>Gap: {skill.gap.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${skill.placement_rate}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Placement Risk Analysis */}
          <div className="mb-5 bg-white rounded-md border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Placement Risk & Intervention Areas</h3>
            <div className="space-y-2">
              {data.placement_risks.map((risk: any) => (
                <div key={risk.issue} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${getPriorityColor(risk.priority)}`}>
                    {risk.priority}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-slate-700 block">{risk.issue}</span>
                    <span className="text-[10px] text-slate-500">{risk.district} • {risk.affected_candidates.toLocaleString()} candidates • {risk.impact} impact</span>
                  </div>
                  <span className="text-[10px] text-slate-600">{risk.action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Employer Outcomes */}
          <div className="mb-5 bg-white rounded-md border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Employer Hiring Outcomes</h3>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#1e3a8a]">{data.employer_outcomes.employers_participating.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Employers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-700">{data.employer_outcomes.job_openings.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Job Openings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-700">{data.employer_outcomes.candidates_hired.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Candidates Hired</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-700">{data.employer_outcomes.hiring_conversion_rate}%</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Conversion Rate</p>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-600 mb-3">Top Hiring Sectors</p>
              <div className="flex flex-wrap gap-2">
                {data.employer_outcomes.top_hiring_sectors.map((sector: any) => (
                  <span key={sector.sector} className="inline-block bg-blue-50 px-3 py-1 rounded text-xs text-blue-700">
                    {sector.sector}: {sector.hires.toLocaleString()} hires
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* District × Sector Heatmap */}
          <div className="mb-5 bg-white rounded-md border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-[#1e293b] mb-4">District × Sector Placement Performance</h3>
            <div className="overflow-x-auto">
              <div className="overflow-x-auto w-full">
            <table data-wrapped="true" className="w-full text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">District</th>
                    <th className="px-3 py-2 text-center font-semibold text-slate-600">IT & ITES</th>
                    <th className="px-3 py-2 text-center font-semibold text-slate-600">Manufacturing</th>
                    <th className="px-3 py-2 text-center font-semibold text-slate-600">Healthcare</th>
                    <th className="px-3 py-2 text-center font-semibold text-slate-600">Construction</th>
                    <th className="px-3 py-2 text-center font-semibold text-slate-600">Retail</th>
                    <th className="px-3 py-2 text-center font-semibold text-slate-600">Automotive</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.district_sector_heatmap.map((row: any) => (
                    <tr key={row.district}>
                      <td className="px-3 py-2 font-medium text-slate-700">{row.district}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-[10px] font-medium ${
                          row.it_ites >= 80 ? 'bg-green-100 text-green-800' :
                          row.it_ites >= 70 ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>{row.it_ites}%</span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-[10px] font-medium ${
                          row.manufacturing >= 80 ? 'bg-green-100 text-green-800' :
                          row.manufacturing >= 70 ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>{row.manufacturing}%</span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-[10px] font-medium ${
                          row.healthcare >= 80 ? 'bg-green-100 text-green-800' :
                          row.healthcare >= 70 ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>{row.healthcare}%</span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-[10px] font-medium ${
                          row.construction >= 80 ? 'bg-green-100 text-green-800' :
                          row.construction >= 70 ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>{row.construction}%</span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-[10px] font-medium ${
                          row.retail >= 80 ? 'bg-green-100 text-green-800' :
                          row.retail >= 70 ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>{row.retail}%</span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-[10px] font-medium ${
                          row.automotive >= 80 ? 'bg-green-100 text-green-800' :
                          row.automotive >= 70 ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>{row.automotive}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Recommended Actions</h3>
            <div className="space-y-3">
              {data.recommendations.map((rec: any) => (
                <div key={rec.title} className="flex items-start gap-3 p-3 bg-slate-50 rounded">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${getPriorityColor(rec.priority)}`}>
                    {rec.priority}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-slate-700 block">{rec.title}</span>
                    <span className="text-[10px] text-slate-500">{rec.reason} • {rec.district}</span>
                  </div>
                  <button className="text-xs text-[#1e3a8a] hover:text-[#1e3a8a]/80 font-medium">
                    {rec.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </GovernmentShell>
  );
}