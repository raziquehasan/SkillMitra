"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { GovernmentShell } from "@/app/government/GovernmentShell";
import { api, type District, type IndustrySector } from "@/lib/api";

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  GovernmentFilters, 
  DEFAULT_GOVERNMENT_FILTERS, 
  parseGovernmentFilters, 
  governmentFiltersToQueryParams,
  isFiltersActive,
  getDateRangeFromTimePeriod,
  getGovernmentApiParams
} from "@/lib/governmentFilters";
import { 
  TrendingUp, Users, Building2, GraduationCap, Award, 
  AlertTriangle, BarChart3, MapPin, Target, FileText, 
  ArrowRight, ChevronDown, Activity, ArrowDown, Filter, X,
  Briefcase, Zap, CheckCircle, Clock, Users2, 
  ClipboardCheck, Lightbulb, Settings, Bell, UserCircle, HelpCircle, LogOut
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";

interface GovDashboard {
  kpis: {
    districts_covered: number;
    active_demand_signals: number;
    high_demand_skills: number;
    critical_skill_gaps: number;
    critical_gap_demand_records: number;
    training_capacity_gaps: number;
    courses_requiring_review: number;
    placement_outcomes_count: number;
  };
  district_intelligence: {
    district_id: string;
    district_name: string;
    source_type: string | null;
    total_demand: number;
    verified_providers: number;
    total_capacity: number;
    capacity_status: string;
  } | null;
  skill_gaps: Array<{
    skill_id: string;
    skill_name: string | null;
    demand_count: number | null;
    training_coverage: string | null;
    gap_signal: string | null;
    course_count: number;
  }>;
  training_capacity: {
    district_id: string;
    district_name: string;
    total_demand: number;
    verified_providers: number;
    course_offerings: number;
    total_capacity: number;
    capacity_status: string
  } | null;
  course_alignment: Array<{
    course_id: string;
    course_title: string;
    alignment_status: string;
    skills_covered: string[];
    skills_demanded: string[];
    gaps: string[];
  }>;
  employer_demand: Array<{
    sector: string | null;
    job_role: string | null;
    required_skills: string[];
    posting_count: number;
  }>;
  district_training_plan: {
    district_id: string;
    district_name: string;
    plan_id: string;
    plan_status: string;
    total_recommendations: number;
    recommendations: Array<{
      plan_item_id: string;
      skill_id: string;
      job_role_id: string | null;
      demand_value: number | null;
      gap_value: number | null;
      recommended_action: string | null;
      review_status: string | null;
      rationale: string | null;
      course_id: string | null;
    }>;
  } | null;
}

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<GovDashboard | null>(null);
  const [fetching, setFetching] = useState(false);
  
  // Initialize filters from URL params or defaults
  const [filters, setFilters] = useState<GovernmentFilters>(() => {
    const initialFilters = parseGovernmentFilters(searchParams);
    return {
      ...DEFAULT_GOVERNMENT_FILTERS,
      ...initialFilters
    };
  });
  
  const [filterTime, setFilterTime] = useState("all_available");
  
  // Extract individual filter values for UI
  const filterDistrict = filters.district_id || "";
  const filterSector = filters.sector_id || "";

  useEffect(() => {
    (async () => {
      try {
        const [dRes, sRes] = await Promise.all([
          api.districts().catch(() => []),
          api.sectors().catch(() => []),
        ]);
        setDistricts(dRes);
        setSectors(sRes);
      } catch (error) {
        console.error("Failed to load districts/sectors:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadDashboard = useCallback(async () => {
    setFetching(true);
    try {
      // Calculate date range from time period and fetch real data
      const dateRange = getDateRangeFromTimePeriod(filterTime);
      const filtersWithDate = {
        ...filters,
        start_date: dateRange?.start_date || filters.start_date,
        end_date: dateRange?.end_date || filters.end_date,
      };

      const apiParams = getGovernmentApiParams(filtersWithDate);
      const data = await api.governmentDashboard(apiParams);
      // Add placement_outcomes_count to kpis if it exists at top level
      const dashboardWithPlacement = {
        ...data,
        kpis: {
          ...data.kpis,
          placement_outcomes_count: (data as any).placement_outcomes_count || 0
        }
      };
      setDashboard(dashboardWithPlacement);
    } catch (error: any) {
      console.error("API call failed:", error);
      setDashboard(null); // Will show error state
    } finally {
      setFetching(false);
    }
  }, [filters, filterTime]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const resetFilters = () => {
    const resetFilters = DEFAULT_GOVERNMENT_FILTERS;
    setFilters(resetFilters);
    setFilterTime("all_available");
    
    // Update URL
    const queryParams = governmentFiltersToQueryParams(resetFilters);
    router.push(`/government?${new URLSearchParams(queryParams).toString()}`);
  };
  
  const handleFilterChange = (key: keyof GovernmentFilters, value: string | null) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || null
    }));
  };
  
  // Update URL when filters change (using replace to avoid history buildup)
  useEffect(() => {
    const queryParams = governmentFiltersToQueryParams(filters);
    const queryString = new URLSearchParams(queryParams).toString();
    router.replace(`/government${queryString ? `?${queryString}` : ''}`);
  }, [filters, router]);

  const selectedDistrictName = districts.find((d) => d.id === filters.district_id)?.name || "All Districts";
  const selectedSectorName = sectors.find((s) => s.id === filters.sector_id)?.name || "All Sectors";

  // Get display name for time period
  const getTimePeriodName = (value: string) => {
    switch (value) {
      case "all_available": return "All Available Data";
      case "current_month": return "Current Month";
      case "last_30_days": return "Last 30 Days";
      case "last_quarter": return "Last Quarter";
      case "last_6_months": return "Last 6 Months";
      case "last_12_months": return "Last 12 Months";
      case "year_to_date": return "Year to Date";
      default: return value;
    }
  };
  const selectedTimePeriodName = getTimePeriodName(filterTime);

  // Backend handles filtering via API, so use dashboard directly
  const currentDashboard = dashboard;

  // Skill demand ranking data (horizontal bar chart)
  const skillDemandData = currentDashboard?.skill_gaps
    .filter(gap => gap.demand_count !== null)
    .sort((a, b) => (b.demand_count || 0) - (a.demand_count || 0))
    .slice(0, 8)
    .map((gap) => ({
      name: gap.skill_name || gap.skill_id,
      demand: gap.demand_count || 0,
      coverage: gap.training_coverage
    })) || [];

  // Capacity data
  const capacityData = currentDashboard?.training_capacity ? [
    { name: 'Demand', value: currentDashboard.training_capacity.total_demand },
    { name: 'Verified Capacity', value: currentDashboard.training_capacity.total_capacity },
    { name: 'Capacity Gap', value: Math.max(0, currentDashboard.training_capacity.total_demand - currentDashboard.training_capacity.total_capacity) }
  ] : [];

  // Government Blue Color Palette
  const GOVERNMENT_BLUE = '#1e3a8a';      // Deep institutional blue
  const GOVERNMENT_BLUE_LIGHT = '#3b82f6'; // Lighter institutional blue
  const GOVERNMENT_NAVY = '#1e293b';     // Dark navy for headings
  const MUTED_BLUE = '#64748b';          // Muted blue for secondary elements
  const WARNING_ORANGE = '#f59e0b';      // Subtle orange for warnings
  const CRITICAL_RED = '#dc2626';        // Subtle red for critical states
  
  const COLORS = [GOVERNMENT_BLUE, GOVERNMENT_BLUE_LIGHT, MUTED_BLUE, WARNING_ORANGE, CRITICAL_RED];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1e3a8a] border-r-transparent"></div>
          <p className="mt-4 text-sm text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentDashboard && !fetching) {
    return (
      <GovernmentShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm text-slate-600">Unable to load data. Please try again.</p>
            <button
              onClick={loadDashboard}
              className="mt-4 px-4 py-2 bg-[#1e3a8a] text-white text-sm rounded-lg hover:bg-[#1e3a8a]/90"
            >
              Retry
            </button>
          </div>
        </div>
      </GovernmentShell>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Subtle top loading bar when fetching */}
      {fetching && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[#1e3a8a]/20 overflow-hidden">
          <div className="h-full bg-[#1e3a8a] animate-pulse" style={{ width: '100%' }} />
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#1e293b]">
            Job Intelligence Dashboard
          </h1>
          {fetching && (
            <span className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-solid border-[#1e3a8a] border-r-transparent" />
              Updating...
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Monitor job-market demand, skill gaps, training capacity and employment outcomes across Maharashtra.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="min-w-0 mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-[#1e3a8a]" />
          <span className="text-sm font-semibold text-slate-700">Filters</span>
          {(filters.district_id || filters.sector_id) && (
            <button
              onClick={resetFilters}
              className="text-xs text-[#1e3a8a] hover:text-[#1e3a8a]/80 flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Reset Filters
            </button>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
            <select
              value={filters.district_id || ""}
              onChange={(e) => handleFilterChange("district_id", e.target.value)}
              className="w-full border border-slate-300 bg-white px-3 py-2 text-sm rounded focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
            >
              <option value="">All Districts</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Sector</label>
            <select
              value={filters.sector_id || ""}
              onChange={(e) => handleFilterChange("sector_id", e.target.value)}
              className="w-full border border-slate-300 bg-white px-3 py-2 text-sm rounded focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
            >
              <option value="">All Sectors</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Time Period</label>
            <select
              value={filterTime}
              onChange={(e) => setFilterTime(e.target.value)}
              className="w-full border border-slate-300 bg-white px-3 py-2 text-sm rounded focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
            >
              <option value="all_available">All Available Data</option>
              <option value="current_month">Current Month</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_quarter">Last Quarter</option>
              <option value="last_6_months">Last 6 Months</option>
              <option value="last_12_months">Last 12 Months</option>
              <option value="year_to_date">Year to Date</option>
            </select>
          </div>
        </div>
        {(filters.district_id || filters.sector_id || filterTime !== "all_available") && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-600">
              Active filters: <span className="font-medium text-[#1e3a8a]">{selectedDistrictName}</span>
              {filters.sector_id && <span className="font-medium text-[#1e3a8a]"> + {selectedSectorName}</span>}
              {filterTime !== "all_available" && <span className="font-medium text-[#1e3a8a]"> + {selectedTimePeriodName}</span>}
            </p>
          </div>
        )}
      </div>


      {currentDashboard && (
        <div className="space-y-6">
          {/* KPI Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <KpiCard
              label="Districts Covered"
              value={currentDashboard.kpis.districts_covered}
              icon={<MapPin className="h-5 w-5" />}
            />
            <KpiCard
              label="Active Demand Signals"
              value={currentDashboard.kpis.active_demand_signals}
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <KpiCard
              label="High-Demand Skills"
              value={currentDashboard.kpis.high_demand_skills}
              icon={<Zap className="h-5 w-5" />}
            />
            <KpiCard
              label="Critical Skill Gaps"
              value={currentDashboard.kpis.critical_skill_gaps}
              icon={<AlertTriangle className="h-5 w-5" />}
              subtitle="Unique skills without coverage"
              critical={currentDashboard.kpis.critical_skill_gaps > 0}
            />
            <KpiCard
              label="Gap Demand Records"
              value={currentDashboard.kpis.critical_gap_demand_records}
              icon={<AlertTriangle className="h-5 w-5" />}
              subtitle="Demand records for uncovered skills"
              critical={currentDashboard.kpis.critical_gap_demand_records > 0}
            />
            <KpiCard
              label="Training Capacity Gaps"
              value={currentDashboard.kpis.training_capacity_gaps}
              icon={<BarChart3 className="h-5 w-5" />}
              critical={currentDashboard.kpis.training_capacity_gaps > 0}
            />
          </div>

          {/* Decision Support Pipeline */}
          <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-5 w-5 text-[#1e3a8a]" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[#1e3a8a]">Decision Support Pipeline</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">From job-market demand to training and employment outcomes</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full">
              <PipelineStage
                stage="01"
                title="Industry Demand"
                value={currentDashboard.kpis.active_demand_signals}
                subtitle="signals"
                icon={<TrendingUp className="h-4 w-4" />}
                alert={false}
              />
              <PipelineStage
                stage="02"
                title="Skill Gap"
                value={currentDashboard.kpis.critical_skill_gaps}
                subtitle="critical skills"
                icon={<AlertTriangle className="h-4 w-4" />}
                alert={currentDashboard.kpis.critical_skill_gaps > 0}
              />
              <PipelineStage
                stage="03"
                title="Course Alignment"
                value={currentDashboard.course_alignment.length}
                subtitle="courses aligned"
                icon={<GraduationCap className="h-4 w-4" />}
                alert={false}
              />
              <PipelineStage
                stage="04"
                title="Training Capacity"
                value={currentDashboard?.training_capacity?.total_capacity || 0}
                subtitle="verified seats"
                icon={<Users2 className="h-4 w-4" />}
                alert={currentDashboard?.kpis.training_capacity_gaps > 0}
              />
              <PipelineStage
                stage="05"
                title="Placement Outcomes"
                value={currentDashboard?.kpis?.placement_outcomes_count || 0}
                subtitle="placements"
                icon={<Briefcase className="h-4 w-4" />}
                alert={false}
              />
            </div>
          </div>

          {/* Main Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Skill Demand Ranking */}
            <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#1e293b]">Skill Demand Ranking</h3>
                  <p className="text-xs text-slate-500 mt-1">Top skills by current job-market demand</p>
                </div>
                <button 
                  onClick={() => router.push("/government/skill-gaps")}
                  className="text-xs text-[#1e3a8a] hover:text-[#1e3a8a]/80 flex items-center gap-1 font-medium"
                >
                  View Details <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              {skillDemandData.length > 0 ? (
                <div className="space-y-3">
                  {skillDemandData.map((skill, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-6">{index + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-[#1e293b] truncate">{skill.name}</span>
                          <span className="text-sm font-bold text-[#1e3a8a]">{skill.demand}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#1e3a8a] rounded-full"
                            style={{ width: `${(skill.demand / Math.max(...skillDemandData.map(s => s.demand))) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No skill demand data available for the selected filters." />
              )}
            </div>

            {/* Demand vs Training Capacity */}
            <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#1e293b]">Demand vs Training Capacity</h3>
                  <p className="text-xs text-slate-500 mt-1">Training capacity analysis for {selectedDistrictName}</p>
                </div>
                <button
                  onClick={() => router.push("/government/training-capacity")}
                  className="text-xs text-[#1e3a8a] hover:text-[#1e3a8a]/80 flex items-center gap-1 font-medium"
                >
                  View Details <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              {currentDashboard.training_capacity ? (
                <>
                  {currentDashboard.training_capacity.total_capacity === 0 && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs text-amber-800">
                        <strong>Note:</strong> No verified training capacity is currently recorded for this selection.
                      </p>
                    </div>
                  )}
                  <div className="space-y-3">
                    {capacityData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-[#1e293b]">{item.name}</span>
                        <span className="text-lg font-bold text-[#1e3a8a]">{item.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState message="No capacity data available for the selected filters." />
              )}
            </div>
          </div>

          {/* Critical Skill Gap Analysis */}
          <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#1e293b]">Critical Skill Gap Analysis</h3>
                <p className="text-xs text-slate-500 mt-1">Skills without training coverage</p>
              </div>
              <button
                onClick={() => router.push("/government/skill-gaps")}
                className="text-xs text-[#1e3a8a] hover:text-[#1e3a8a]/80 flex items-center gap-1 font-medium flex-shrink-0"
              >
                View All <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {currentDashboard.skill_gaps.length > 0 ? (
              <div className="overflow-x-auto -mx-6 px-6 pb-2">
                <div className="overflow-x-auto w-full">
            <table data-wrapped="true" className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 font-semibold text-[#1e293b] whitespace-nowrap">Skill</th>
                      <th className="text-left py-2 px-3 font-semibold text-[#1e293b] whitespace-nowrap">Demand</th>
                      <th className="text-left py-2 px-3 font-semibold text-[#1e293b] whitespace-nowrap">Coverage Status</th>
                      <th className="text-left py-2 px-3 font-semibold text-[#1e293b] whitespace-nowrap">Gap Severity</th>
                      <th className="text-left py-2 px-3 font-semibold text-[#1e293b] whitespace-nowrap">Course Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDashboard.skill_gaps.slice(0, 8).map((gap, index) => (
                      <tr key={`${gap.skill_id}-${index}`} className="border-b border-slate-100">
                        <td className="py-2 px-3 font-medium text-[#1e293b] whitespace-nowrap">{gap.skill_name || gap.skill_id}</td>
                        <td className="py-2 px-3 whitespace-nowrap">{gap.demand_count || 0}</td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs ${
                            gap.training_coverage === "Available"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {gap.training_coverage || "None"}
                          </span>
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs ${
                            gap.gap_signal === "Critical Gap"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {gap.gap_signal || "Unknown"}
                          </span>
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          {gap.course_count > 0 ? `${gap.course_count} courses` : "None"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
          </div>
              </div>
            ) : (
              <EmptyState message="No skill gap data available for the selected filters." />
            )}
          </div>

          {/* Course Alignment */}
          <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#1e293b]">Course Alignment</h3>
                <p className="text-xs text-slate-500 mt-1">Training courses vs industry demand</p>
              </div>
              <button
                onClick={() => router.push("/government/course-alignment")}
                className="text-xs text-[#1e3a8a] hover:text-[#1e3a8a]/80 flex items-center gap-1 font-medium flex-shrink-0"
              >
                View Details <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {currentDashboard.course_alignment.length > 0 ? (
              <div className="space-y-3">
                {currentDashboard.course_alignment.slice(0, 5).map((course) => (
                  <div key={course.course_id} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <span className="text-sm font-medium text-[#1e293b]">{course.course_title}</span>
                      <span className={`px-2 py-1 rounded text-xs self-start sm:self-auto ${
                        course.alignment_status === "ALIGNED"
                          ? "bg-green-100 text-green-700"
                          : course.alignment_status === "PARTIAL"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {course.alignment_status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
                      <span>Skills Covered: {course.skills_covered.length}</span>
                      <span>Skills Demanded: {course.skills_demanded.length}</span>
                      {course.gaps.length > 0 && <span className="text-red-600">Gaps: {course.gaps.length}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No course alignment data available for the selected filters." />
            )}
          </div>

          {/* Employer Demand */}
          <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#1e293b]">Employer Demand by Industry</h3>
                <p className="text-xs text-slate-500 mt-1">Current job postings and requirements</p>
              </div>
              <button
                onClick={() => router.push("/government/employer-demand")}
                className="text-xs text-[#1e3a8a] hover:text-[#1e3a8a]/80 flex items-center gap-1 font-medium flex-shrink-0"
              >
                View Details <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {currentDashboard.employer_demand.length > 0 ? (
              <div className="space-y-3">
                {currentDashboard.employer_demand.slice(0, 5).map((ed, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-lg gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1e293b] truncate">{ed.job_role || "—"}</p>
                      <p className="text-xs text-slate-500 truncate">{ed.sector || "—"}</p>
                      {ed.required_skills && ed.required_skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {ed.required_skills.slice(0, 3).map((skill, sidx) => (
                            <span key={sidx} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full truncate max-w-[120px]">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0 border-t border-slate-200 sm:border-0 pt-2 sm:pt-0">
                      <p className="text-lg font-bold text-[#1e3a8a]">{ed.posting_count}</p>
                      <p className="text-xs text-slate-500">postings</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No employer demand data available for the selected filters." />
            )}
          </div>

          {/* District Overview */}
          <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#1e293b]">District Overview</h3>
                <p className="text-xs text-slate-500 mt-1">{selectedDistrictName}</p>
              </div>
              <Activity className="h-4 w-4 text-[#1e3a8a] flex-shrink-0" />
            </div>
            {currentDashboard.district_intelligence ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Total Demand</p>
                  <p className="text-2xl font-bold text-[#1e3a8a]">{currentDashboard.district_intelligence.total_demand?.toLocaleString() || 0}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Verified Providers</p>
                  <p className="text-2xl font-bold text-[#1e3a8a]">{currentDashboard.district_intelligence.verified_providers || 0}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Total Training Capacity</p>
                  <p className="text-2xl font-bold text-[#1e3a8a]">{currentDashboard.district_intelligence.total_capacity?.toLocaleString() || 0}</p>
                </div>
              </div>
            ) : (
              <EmptyState message="Select a district to view district-level data." />
            )}
          </div>

          {/* Placement Outcomes */}
          <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#1e293b]">Placement Outcomes</h3>
                <p className="text-xs text-slate-500 mt-1">Training-to-employment pipeline</p>
              </div>
            </div>
            <div className="p-8 text-center text-slate-500">
              <Award className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">No placement data available yet.</p>
              <p className="text-xs text-slate-400 mt-1">Placement tracking will be available once candidates complete training.</p>
            </div>
          </div>

          {/* Government Actions */}
          <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#1e293b]">Recommended Government Actions</h3>
                <p className="text-xs text-slate-500 mt-1">Based on demand, skill gaps and training capacity analysis</p>
              </div>
              <button
                onClick={() => router.push("/government/recommended-actions")}
                className="text-xs text-[#1e3a8a] hover:text-[#1e3a8a]/80 flex items-center gap-1 font-medium"
              >
                View All <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {currentDashboard.district_training_plan?.recommendations && currentDashboard.district_training_plan.recommendations.length > 0 ? (
              <div className="space-y-3">
                {currentDashboard.district_training_plan.recommendations.slice(0, 4).map((rec) => (
                  <div key={rec.plan_item_id} className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                    <div className="flex-shrink-0 mt-0.5">
                      <Lightbulb className="h-4 w-4 text-[#1e3a8a]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-sm font-medium text-[#1e293b]">{rec.skill_id}</p>
                        {rec.recommended_action && (
                          <span className="px-2 py-0.5 bg-[#1e3a8a] text-white text-xs rounded whitespace-nowrap">
                            {rec.recommended_action.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                      {rec.rationale && (
                        <p className="text-xs text-slate-600">{rec.rationale}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No recommendations available for the selected district." />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ 
  label, 
  value, 
  icon, 
  subtitle,
  critical = false
}: { 
  label: string; 
  value: string | number | null; 
  icon: React.ReactNode;
  subtitle?: string;
  critical?: boolean;
}) {
  return (
    <div className={`rounded-lg border ${critical ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'} p-4 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="mt-2 text-2xl font-bold text-[#1e3a8a]">
            {value !== null && value !== undefined ? (typeof value === 'number' ? value.toLocaleString() : value) : "—"}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${critical ? 'bg-red-100 text-red-600' : 'bg-[#1e3a8a]/10 text-[#1e3a8a]'}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function PipelineStage({ 
  stage,
  title, 
  value, 
  subtitle, 
  icon,
  alert = false
}: { 
  stage: string;
  title: string; 
  value: number; 
  subtitle: string;
  icon: React.ReactNode;
  alert?: boolean;
}) {
  return (
    <div className={`w-full min-w-0 rounded-lg border p-3 min-h-[110px] max-h-[130px] flex flex-col ${
      alert 
        ? 'border-red-200 bg-red-50' 
        : 'border-slate-200 bg-white'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-[#1e3a8a]/60">{stage}</span>
        <div className={`p-1.5 rounded-lg ${
          alert 
            ? 'bg-red-100 text-red-600' 
            : 'bg-[#1e3a8a]/10 text-[#1e3a8a]'
        }`}>
          {icon}
        </div>
      </div>
      <p className="text-xl font-bold text-[#1e3a8a] flex-1">
        {value !== null && value !== undefined ? (typeof value === 'number' ? value.toLocaleString() : value) : "—"}
      </p>
      <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      <p className="text-xs font-medium text-[#1e293b] mt-1">{title}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export default function GovernmentDashboard() {
  return (
    <GovernmentShell>
      <DashboardContent />
    </GovernmentShell>
  );
}