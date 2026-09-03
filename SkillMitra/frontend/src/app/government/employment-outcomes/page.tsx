"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { GovernmentShell } from "@/app/government/GovernmentShell";
import { api, type District, type IndustrySector } from "@/lib/api";
import {
  TrendingUp, Users, Award, Briefcase,
  GraduationCap, Target, AlertCircle, RefreshCw,
  MapPin, X, BarChart3, CheckCircle, Building2,
  ClipboardList, ArrowUpRight, ArrowDownRight
} from "lucide-react";

interface DistrictEmployment {
  district_id: string;
  district_name: string;
  registered: number;
  profileCompleted: number;
  skillAssessed: number;
  enrolled: number;
  completed: number;
  job_ready: number;
  interviewed: number;
  selected: number;
  placed: number;
  job_seeking: number;
  placement_rate: number;
  outcome_status: string;
}

interface SectorEmployment {
  sector_name: string;
  enrolled: number;
  completed: number;
  placed: number;
  placement_rate: number;
  avg_salary: number;
}

interface CourseEmployment {
  course_name: string;
  sector: string;
  enrolled: number;
  completed: number;
  placed: number;
  placement_rate: number;
}

interface JobRoleEmployment {
  role_name: string;
  sector: string;
  demand: number;
  filled: number;
  avg_salary: number;
}

interface MonthlyTrend {
  month: string;
  placements: number;
  completions: number;
  applications: number;
  rate: number;
}

const demoDistrictEmployment: DistrictEmployment[] = [
  { district_id: "d-pune", district_name: "Pune", registered: 28000, profileCompleted: 24500, skillAssessed: 19800, enrolled: 12500, completed: 6200, job_ready: 5800, interviewed: 5100, selected: 4200, placed: 3800, job_seeking: 400, placement_rate: 61.3, outcome_status: "Strong" },
  { district_id: "d-mumbai", district_name: "Mumbai", registered: 24000, profileCompleted: 21000, skillAssessed: 17200, enrolled: 10800, completed: 5400, job_ready: 5100, interviewed: 4600, selected: 3900, placed: 3500, job_seeking: 350, placement_rate: 64.8, outcome_status: "Strong" },
  { district_id: "d-nashik", district_name: "Nashik", registered: 12000, profileCompleted: 10500, skillAssessed: 8400, enrolled: 4800, completed: 2400, job_ready: 2200, interviewed: 1900, selected: 1500, placed: 1200, job_seeking: 180, placement_rate: 50.0, outcome_status: "Stable" },
  { district_id: "d-nagpur", district_name: "Nagpur", registered: 15000, profileCompleted: 13200, skillAssessed: 10600, enrolled: 6200, completed: 3000, job_ready: 2700, interviewed: 2300, selected: 1800, placed: 1450, job_seeking: 220, placement_rate: 48.3, outcome_status: "Needs Attention" },
  { district_id: "d-thane", district_name: "Thane", registered: 18000, profileCompleted: 15800, skillAssessed: 12400, enrolled: 7200, completed: 3500, job_ready: 3200, interviewed: 2800, selected: 2300, placed: 1950, job_seeking: 280, placement_rate: 55.7, outcome_status: "Stable" },
  { district_id: "d-kolhapur", district_name: "Kolhapur", registered: 8000, profileCompleted: 6900, skillAssessed: 5400, enrolled: 2800, completed: 1500, job_ready: 1350, interviewed: 1100, selected: 850, placed: 650, job_seeking: 120, placement_rate: 43.3, outcome_status: "Needs Attention" },
  { district_id: "d-solapur", district_name: "Solapur", registered: 7000, profileCompleted: 6000, skillAssessed: 4700, enrolled: 2400, completed: 1300, job_ready: 1150, interviewed: 920, selected: 680, placed: 510, job_seeking: 110, placement_rate: 39.2, outcome_status: "Needs Attention" },
  { district_id: "d-amravati", district_name: "Amravati", registered: 6000, profileCompleted: 5200, skillAssessed: 4000, enrolled: 2000, completed: 1100, job_ready: 950, interviewed: 720, selected: 480, placed: 340, job_seeking: 95, placement_rate: 30.9, outcome_status: "Needs Attention" },
  { district_id: "d-navi-mumbai", district_name: "Navi Mumbai", registered: 14000, profileCompleted: 12200, skillAssessed: 9800, enrolled: 5600, completed: 2700, job_ready: 2500, interviewed: 2200, selected: 1850, placed: 1600, job_seeking: 200, placement_rate: 59.3, outcome_status: "Strong" },
  { district_id: "d-chh-sambhajinagar", district_name: "Chhatrapati Sambhajinagar", registered: 9000, profileCompleted: 7800, skillAssessed: 6100, enrolled: 3200, completed: 1700, job_ready: 1500, interviewed: 1200, selected: 880, placed: 660, job_seeking: 140, placement_rate: 38.8, outcome_status: "Needs Attention" },
  { district_id: "d-aurangabad", district_name: "Aurangabad", registered: 10000, profileCompleted: 8700, skillAssessed: 6800, enrolled: 3600, completed: 1800, job_ready: 1600, interviewed: 1350, selected: 1020, placed: 780, job_seeking: 150, placement_rate: 43.3, outcome_status: "Needs Attention" },
  { district_id: "d-sangli", district_name: "Sangli", registered: 6500, profileCompleted: 5600, skillAssessed: 4300, enrolled: 2200, completed: 1100, job_ready: 980, interviewed: 820, selected: 620, placed: 480, job_seeking: 85, placement_rate: 43.6, outcome_status: "Needs Attention" },
  { district_id: "d-ahmednagar", district_name: "Ahmednagar", registered: 7500, profileCompleted: 6500, skillAssessed: 5100, enrolled: 2600, completed: 1300, job_ready: 1150, interviewed: 940, selected: 710, placed: 540, job_seeking: 100, placement_rate: 41.5, outcome_status: "Needs Attention" },
];

const demoSectorEmployment: SectorEmployment[] = [
  { sector_name: "IT & ITES", enrolled: 18500, completed: 8500, placed: 6970, placement_rate: 82.0, avg_salary: 28500 },
  { sector_name: "Manufacturing", enrolled: 15200, completed: 7200, placed: 5472, placement_rate: 76.0, avg_salary: 18500 },
  { sector_name: "Healthcare", enrolled: 9800, completed: 4800, placed: 3408, placement_rate: 71.0, avg_salary: 22000 },
  { sector_name: "Construction", enrolled: 8500, completed: 4200, placed: 2856, placement_rate: 68.0, avg_salary: 16000 },
  { sector_name: "Retail", enrolled: 7200, completed: 3800, placed: 2394, placement_rate: 63.0, avg_salary: 14500 },
  { sector_name: "Automotive", enrolled: 5800, completed: 2800, placed: 1764, placement_rate: 63.0, avg_salary: 17500 },
  { sector_name: "Hospitality", enrolled: 5100, completed: 3100, placed: 1829, placement_rate: 59.0, avg_salary: 13500 },
  { sector_name: "Renewable Energy", enrolled: 3900, completed: 2100, placed: 1260, placement_rate: 60.0, avg_salary: 20000 },
];

const demoCourseEmployment: CourseEmployment[] = [
  { course_name: "Python Programming & Data Analytics", sector: "IT & ITES", enrolled: 3500, completed: 2800, placed: 2296, placement_rate: 82.0 },
  { course_name: "Electric Vehicle Service Technician", sector: "Automotive", enrolled: 4200, completed: 3200, placed: 2624, placement_rate: 82.0 },
  { course_name: "CNC Machine Operator", sector: "Manufacturing", enrolled: 3800, completed: 2900, placed: 2262, placement_rate: 78.0 },
  { course_name: "Solar Installation Technician", sector: "Renewable Energy", enrolled: 2800, completed: 2100, placed: 1617, placement_rate: 77.0 },
  { course_name: "Healthcare Assistant", sector: "Healthcare", enrolled: 2600, completed: 2000, placed: 1400, placement_rate: 70.0 },
  { course_name: "Industrial Safety Assistant", sector: "Manufacturing", enrolled: 3200, completed: 2400, placed: 1728, placement_rate: 72.0 },
  { course_name: "Welding Technician", sector: "Manufacturing", enrolled: 2200, completed: 1700, placed: 1190, placement_rate: 70.0 },
  { course_name: "Hospitality & Tourism Management", sector: "Hospitality", enrolled: 1900, completed: 1400, placed: 812, placement_rate: 58.0 },
];

const demoJobRoleEmployment: JobRoleEmployment[] = [
  { role_name: "Data Analyst", sector: "IT & ITES", demand: 4500, filled: 3200, avg_salary: 32000 },
  { role_name: "Software Developer", sector: "IT & ITES", demand: 5200, filled: 3800, avg_salary: 35000 },
  { role_name: "EV Technician", sector: "Automotive", demand: 3800, filled: 2600, avg_salary: 22000 },
  { role_name: "CNC Operator", sector: "Manufacturing", demand: 4200, filled: 3100, avg_salary: 20000 },
  { role_name: "Healthcare Worker", sector: "Healthcare", demand: 3500, filled: 2400, avg_salary: 18000 },
  { role_name: "Solar Technician", sector: "Renewable Energy", demand: 2600, filled: 1600, avg_salary: 19000 },
  { role_name: "Construction Supervisor", sector: "Construction", demand: 2800, filled: 1800, avg_salary: 24000 },
  { role_name: "Retail Manager", sector: "Retail", demand: 3200, filled: 2100, avg_salary: 18000 },
];

const demoTrend: MonthlyTrend[] = [
  { month: "Jan", placements: 1200, completions: 1800, applications: 2400, rate: 66.7 },
  { month: "Feb", placements: 1350, completions: 1950, applications: 2600, rate: 69.2 },
  { month: "Mar", placements: 1500, completions: 2100, applications: 2850, rate: 71.4 },
  { month: "Apr", placements: 1680, completions: 2300, applications: 3100, rate: 73.0 },
  { month: "May", placements: 1850, completions: 2500, applications: 3400, rate: 74.0 },
  { month: "Jun", placements: 1950, completions: 2650, applications: 3600, rate: 73.6 },
  { month: "Jul", placements: 2100, completions: 2800, applications: 3900, rate: 75.0 },
  { month: "Aug", placements: 2250, completions: 2950, applications: 4100, rate: 76.3 },
  { month: "Sep", placements: 2400, completions: 3100, applications: 4400, rate: 77.4 },
  { month: "Oct", placements: 2550, completions: 3250, applications: 4600, rate: 78.5 },
  { month: "Nov", placements: 2700, completions: 3400, applications: 4900, rate: 79.4 },
  { month: "Dec", placements: 2850, completions: 3550, applications: 5100, rate: 80.3 },
];

export default function EmploymentOutcomesPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterSector, setFilterSector] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterJobRole, setFilterJobRole] = useState("");
  const [filterEmploymentStatus, setFilterEmploymentStatus] = useState("");
  const [usingDemoData, setUsingDemoData] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [dRes, sRes] = await Promise.all([
          api.districts().catch(() => []),
          api.sectors().catch(() => []),
        ]);
        setDistricts(dRes);
        setSectors(sRes);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadData = useCallback(async () => {
    setFetching(true);
    setError(null);
    try {
      const outcomesRes = await api.placementOutcomeReport().catch(() => null);
      if (outcomesRes && outcomesRes.placement_rate !== null) {
        setUsingDemoData(false);
      } else {
        setUsingDemoData(true);
      }
    } catch {
      setError("Could not validate credentials.");
      setUsingDemoData(true);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { loadData(); }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const clearFilters = () => {
    setFilterDistrict("");
    setFilterSector("");
    setFilterCourse("");
    setFilterJobRole("");
    setFilterEmploymentStatus("");
  };

  const activeFilterCount = [filterDistrict, filterSector, filterCourse, filterJobRole, filterEmploymentStatus].filter(Boolean).length;

  const filteredDistricts = useMemo(() => {
    let data = [...demoDistrictEmployment];
    if (filterDistrict) data = data.filter((d) => d.district_id === filterDistrict);
    return data;
  }, [filterDistrict]);

  const kpiData = useMemo(() => {
    const totalRegistered = filteredDistricts.reduce((sum, d) => sum + d.registered, 0);
    const totalCompleted = filteredDistricts.reduce((sum, d) => sum + d.completed, 0);
    const totalPlaced = filteredDistricts.reduce((sum, d) => sum + d.placed, 0);
    const totalJobSeeking = filteredDistricts.reduce((sum, d) => sum + d.job_seeking, 0);
    const totalInterviewed = filteredDistricts.reduce((sum, d) => sum + d.interviewed, 0);
    const totalSelected = filteredDistricts.reduce((sum, d) => sum + d.selected, 0);
    const totalJobReady = filteredDistricts.reduce((sum, d) => sum + d.job_ready, 0);
    const totalEnrolled = filteredDistricts.reduce((sum, d) => sum + d.enrolled, 0);
    const placementRate = totalCompleted > 0 ? (totalPlaced / totalCompleted) * 100 : 0;
    const completionRate = totalEnrolled > 0 ? (totalCompleted / totalEnrolled) * 100 : 0;
    const avgSalary = demoSectorEmployment.reduce((sum, s) => sum + s.avg_salary, 0) / demoSectorEmployment.length;
    return { totalRegistered, totalCompleted, totalPlaced, totalJobSeeking, totalInterviewed, totalSelected, totalJobReady, totalEnrolled, placementRate, completionRate, avgSalary };
  }, [filteredDistricts]);

  const funnelData = useMemo(() => {
    const c = kpiData.totalCompleted;
    const jr = kpiData.totalJobReady;
    const iv = kpiData.totalInterviewed;
    const s = kpiData.totalSelected;
    const p = kpiData.totalPlaced;
    return [
      { label: "Training Completed", value: c, pct: 100 },
      { label: "Job Ready", value: jr, pct: c > 0 ? (jr / c) * 100 : 0 },
      { label: "Interviewed", value: iv, pct: jr > 0 ? (iv / jr) * 100 : 0 },
      { label: "Selected", value: s, pct: iv > 0 ? (s / iv) * 100 : 0 },
      { label: "Placed / Employed", value: p, pct: s > 0 ? (p / s) * 100 : 0 },
    ];
  }, [kpiData]);

  const employmentStatusData = useMemo(() => {
    const placed = kpiData.totalPlaced;
    const jobSeeking = kpiData.totalJobSeeking;
    const inProcess = kpiData.totalInterviewed - kpiData.totalSelected;
    const awaiting = kpiData.totalJobReady - kpiData.totalInterviewed;
    return [
      { label: "Placed / Employed", value: placed, color: "bg-green-500" },
      { label: "Job Seeking", value: Math.max(jobSeeking, 0), color: "bg-amber-500" },
      { label: "Interview Process", value: Math.max(inProcess, 0), color: "bg-blue-500" },
      { label: "Awaiting Placement", value: Math.max(awaiting, 0), color: "bg-slate-400" },
    ];
  }, [kpiData]);

  const totalStatus = employmentStatusData.reduce((sum, d) => sum + d.value, 0);
  const topDistricts = useMemo(() => [...filteredDistricts].sort((a, b) => b.placement_rate - a.placement_rate).slice(0, 5), [filteredDistricts]);
  const underperformingDistricts = useMemo(() => filteredDistricts.filter((d) => d.placement_rate < 50).sort((a, b) => a.placement_rate - b.placement_rate), [filteredDistricts]);

  const insights = useMemo(() => {
    const items: string[] = [];
    const top = topDistricts[0];
    if (top) items.push(`Placement performance is strongest in ${top.district_name} (${top.placement_rate}% placement rate).`);
    const topSector = demoSectorEmployment.reduce((best, s) => s.placed > best.placed ? s : best, demoSectorEmployment[0]);
    if (topSector) items.push(`${topSector.sector_name} accounts for the largest share of placements (${topSector.placed.toLocaleString()}).`);
    if (underperformingDistricts.length > 0) items.push(`${underperformingDistricts.length} district${underperformingDistricts.length > 1 ? "s" : ""} are below the 50% placement-rate threshold.`);
    const lowPlacementSectors = demoSectorEmployment.filter((s) => s.placement_rate < 65);
    if (lowPlacementSectors.length > 0) items.push(`Increase employer engagement in ${lowPlacementSectors.map((s) => s.sector_name).join(", ")}.`);
    const highDemandRoles = demoJobRoleEmployment.filter((r) => r.demand > r.filled * 1.2);
    if (highDemandRoles.length > 0) items.push(`Critical talent gap in: ${highDemandRoles.map((r) => r.role_name).join(", ")}.`);
    if (items.length === 0) items.push("No significant employment signal for the current selection.");
    return items;
  }, [topDistricts, underperformingDistricts]);

  const recommendedActions = useMemo(() => {
    const actions: { priority: string; text: string }[] = [];
    if (underperformingDistricts.length > 0) {
      actions.push({ priority: "High", text: `Deploy placement drives in ${underperformingDistricts.slice(0, 3).map(d => d.district_name).join(", ")} — below 50% placement rate.` });
    }
    const lowPlacementSectors = demoSectorEmployment.filter((s) => s.placement_rate < 65);
    if (lowPlacementSectors.length > 0) {
      actions.push({ priority: "High", text: `Organize sector-specific job fairs for ${lowPlacementSectors.map(s => s.sector_name).join(", ")}.` });
    }
    actions.push({ priority: "Medium", text: `Expand counseling for ${kpiData.totalJobSeeking.toLocaleString()} candidates actively seeking employment.` });
    const highDemandRoles = demoJobRoleEmployment.filter((r) => r.demand > r.filled * 1.2);
    if (highDemandRoles.length > 0) {
      actions.push({ priority: "Medium", text: `Align training curriculum with demand for ${highDemandRoles.map(r => r.role_name).join(", ")}.` });
    }
    actions.push({ priority: "Low", text: "Review courses with high completion but low placement conversion for curriculum updates." });
    return actions;
  }, [underperformingDistricts, kpiData]);

  const formatNumber = (n: number) => n.toLocaleString();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1e3a8a] border-r-transparent" />
          <p className="mt-4 text-sm text-slate-600">Loading employment outcomes...</p>
        </div>
      </div>
    );
  }

  return (
    <GovernmentShell>
      <div className="bg-[#F5F7FA] p-4 md:p-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">Employment & Placement Analytics</h1>
                <p className="text-sm text-slate-600 mt-1">Monitor placement, employment conversion and workforce outcomes across Maharashtra.</p>
              </div>
              {fetching && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Refreshing...
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-md border border-slate-200 p-4 mb-5 shadow-sm">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[150px]">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">District</label>
                <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] bg-white">
                  <option value="">All Districts</option>
                  {districts.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
                </select>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Sector</label>
                <select value={filterSector} onChange={(e) => setFilterSector(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] bg-white">
                  <option value="">All Sectors</option>
                  {sectors.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                </select>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Course</label>
                <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] bg-white">
                  <option value="">All Courses</option>
                  {demoCourseEmployment.map((c) => (<option key={c.course_name} value={c.course_name}>{c.course_name}</option>))}
                </select>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Job Role</label>
                <select value={filterJobRole} onChange={(e) => setFilterJobRole(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] bg-white">
                  <option value="">All Job Roles</option>
                  {demoJobRoleEmployment.map((r) => (<option key={r.role_name} value={r.role_name}>{r.role_name}</option>))}
                </select>
              </div>
              <div className="flex-1 min-w-[170px]">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Employment Status</label>
                <select value={filterEmploymentStatus} onChange={(e) => setFilterEmploymentStatus(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] bg-white">
                  <option value="">All Statuses</option>
                  <option value="placed">Placed</option>
                  <option value="seeking">Job Seeking</option>
                  <option value="interview">Interview Process</option>
                </select>
              </div>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium px-3 py-2 rounded hover:bg-red-50 transition-colors whitespace-nowrap">
                  <X className="h-3.5 w-3.5" /> Reset
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-5">
            <KpiCard icon={<Users className="h-5 w-5" />} label="Total Registered" value={kpiData.totalRegistered} />
            <KpiCard icon={<GraduationCap className="h-5 w-5" />} label="Completed Training" value={kpiData.totalCompleted} />
            <KpiCard icon={<Award className="h-5 w-5" />} label="Placed" value={kpiData.totalPlaced} />
            <KpiCard icon={<TrendingUp className="h-5 w-5" />} label="Placement Rate" value={`${kpiData.placementRate.toFixed(1)}%`} />
            <KpiCard icon={<Target className="h-5 w-5" />} label="Job Seeking" value={kpiData.totalJobSeeking} />
            <KpiCard icon={<Briefcase className="h-5 w-5" />} label="Avg Salary" value={`₹${Math.round(kpiData.avgSalary / 1000)}K`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Employment Conversion Funnel</h3>
              <div className="space-y-3">
                {funnelData.map((stage, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600">{stage.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#1e293b]">{formatNumber(stage.value)}</span>
                        {idx > 0 && <span className="text-[10px] text-slate-400">({stage.pct.toFixed(1)}%)</span>}
                      </div>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1e3a8a] rounded-full transition-all" style={{ width: `${stage.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Employment Status Distribution</h3>
              <div className="flex items-center gap-6">
                <div className="relative h-32 w-32 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="h-32 w-32 -rotate-90">
                    {employmentStatusData.reduce((acc, item, idx) => {
                      const pct = totalStatus > 0 ? (item.value / totalStatus) * 100 : 0;
                      const offset = acc.offset;
                      const dasharray = `${pct} ${100 - pct}`;
                      acc.elements.push(
                        <circle key={idx} cx="18" cy="18" r="15.9155" fill="none" strokeWidth="3.5" stroke={item.color.replace("bg-", "#")} strokeDasharray={dasharray} strokeDashoffset={`${-offset}`} strokeLinecap="round" />
                      );
                      acc.offset += pct;
                      return acc;
                    }, { elements: [] as React.ReactNode[], offset: 0 }).elements}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-[#1e3a8a]">{formatNumber(totalStatus)}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  {employmentStatusData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded ${item.color}`} />
                        <span className="text-xs text-slate-600">{item.label}</span>
                      </div>
                      <span className="text-xs font-medium text-[#1e293b]">{formatNumber(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Placements by Sector</h3>
              <div className="space-y-2.5">
                {[...demoSectorEmployment].sort((a, b) => b.placed - a.placed).map((sector, idx) => {
                  const maxP = Math.max(...demoSectorEmployment.map((s) => s.placed));
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-600">{sector.sector_name}</span>
                        <span className="text-xs font-medium text-[#1e3a8a]">{formatNumber(sector.placed)}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#1e3a8a] rounded-full" style={{ width: `${(sector.placed / maxP) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Sector-wise Placement Rate</h3>
              <div className="space-y-2.5">
                {[...demoSectorEmployment].sort((a, b) => b.placement_rate - a.placement_rate).map((sector, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600">{sector.sector_name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#1e3a8a]">{sector.placement_rate}%</span>
                        <span className="text-[10px] text-slate-400">₹{(sector.avg_salary / 1000).toFixed(0)}K avg</span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1e3a8a] rounded-full" style={{ width: `${sector.placement_rate}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Placement Trend (12-Month)</h3>
              <div className="flex items-end gap-1 h-36">
                {demoTrend.map((month, idx) => {
                  const maxP = Math.max(...demoTrend.map((m) => m.placements));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-[#1e3a8a] rounded-t transition-all hover:bg-[#2563eb]" style={{ height: `${(month.placements / maxP) * 100}%` }} title={`${month.month}: ${formatNumber(month.placements)} placements`} />
                      <span className="text-[9px] text-slate-500">{month.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Placement Rate Trend</h3>
              <div className="relative h-36">
                <svg className="w-full h-full" viewBox="0 0 480 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="rateGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon fill="url(#rateGradient)" points={`0,120 ${demoTrend.map((m, idx) => `${(idx / (demoTrend.length - 1)) * 480},${120 - (m.rate / 100) * 110}`).join(" ")} 480,120`} />
                  <polyline fill="none" stroke="#1e3a8a" strokeWidth="2" points={demoTrend.map((m, idx) => `${(idx / (demoTrend.length - 1)) * 480},${120 - (m.rate / 100) * 110}`).join(" ")} />
                  {demoTrend.map((m, idx) => (<circle key={idx} cx={(idx / (demoTrend.length - 1)) * 480} cy={120 - (m.rate / 100) * 110} r="3" fill="#1e3a8a" />))}
                </svg>
                <div className="absolute bottom-0 left-0 right-0 flex justify-between">
                  {demoTrend.filter((_, i) => i % 3 === 0).map((m, idx) => (<span key={idx} className="text-[9px] text-slate-500">{m.month}</span>))}
                </div>
                <div className="absolute top-1 right-2 text-[10px] text-green-600 font-medium flex items-center gap-0.5">
                  <ArrowUpRight className="h-3 w-3" /> +13.6pp
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm mb-5">
            <h3 className="text-sm font-semibold text-[#1e293b] mb-4">District-wise Employment Outcomes</h3>
            <div className="overflow-x-auto">
              <div className="overflow-x-auto w-full">
            <table data-wrapped="true" className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 font-semibold text-[#1e293b]">District</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#1e293b]">Registered</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#1e293b]">Completed</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#1e293b]">Placed</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#1e293b]">Job Seeking</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#1e293b] min-w-[120px]">Placement Rate</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#1e293b]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDistricts.map((d, idx) => (
                    <tr key={`${d.district_id}-${idx}`} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4"><div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" /><span className="font-medium text-[#1e293b]">{d.district_name}</span></div></td>
                      <td className="py-3 px-4 text-right text-[#1e293b]">{formatNumber(d.registered)}</td>
                      <td className="py-3 px-4 text-right text-[#1e293b]">{formatNumber(d.completed)}</td>
                      <td className="py-3 px-4 text-right font-medium text-[#1e3a8a]">{formatNumber(d.placed)}</td>
                      <td className="py-3 px-4 text-right text-slate-500">{formatNumber(d.job_seeking)}</td>
                      <td className="py-3 px-4"><div className="flex items-center gap-2"><div className="h-2 w-16 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#1e3a8a] rounded-full" style={{ width: `${d.placement_rate}%` }} /></div><span className="text-xs font-medium text-slate-600 w-12 text-right">{d.placement_rate}%</span></div></td>
                      <td className="py-3 px-4"><span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${d.outcome_status === "Strong" ? "bg-green-100 text-green-700" : d.outcome_status === "Stable" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{d.outcome_status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Top Performing Districts</h3>
              <div className="space-y-2.5">
                {topDistricts.map((d, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded">
                    <span className="text-xs font-bold text-[#1e3a8a] w-5">{idx + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs text-slate-600">{d.district_name}</span>
                        <span className="text-xs font-medium text-[#1e3a8a]">{d.placement_rate}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#1e3a8a] rounded-full" style={{ width: `${d.placement_rate}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Districts Requiring Attention</h3>
              {underperformingDistricts.length > 0 ? (
                <div className="space-y-2.5">
                  {underperformingDistricts.map((d, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-amber-50 rounded">
                      <div>
                        <p className="text-xs font-medium text-[#1e293b]">{d.district_name}</p>
                        <p className="text-[10px] text-slate-500">{d.placed} placed of {d.completed} completed</p>
                      </div>
                      <span className="text-xs font-bold text-amber-600">{d.placement_rate}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-green-50 rounded text-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-xs text-green-700">All districts above 50% threshold</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Course-wise Placement Outcomes</h3>
              <div className="space-y-2.5">
                {demoCourseEmployment.map((c, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600 truncate max-w-[200px]" title={c.course_name}>{c.course_name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{c.placed}/{c.completed}</span>
                        <span className="text-xs font-medium text-[#1e3a8a]">{c.placement_rate}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1e3a8a] rounded-full" style={{ width: `${c.placement_rate}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Job Role Demand vs Filled</h3>
              <div className="space-y-2.5">
                {demoJobRoleEmployment.map((r, idx) => {
                  const fillRate = r.demand > 0 ? (r.filled / r.demand) * 100 : 0;
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-600 truncate max-w-[150px]" title={r.role_name}>{r.role_name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{r.filled}/{r.demand}</span>
                          <span className="text-xs font-medium text-[#1e3a8a]">₹{(r.avg_salary / 1000).toFixed(0)}K</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${fillRate >= 70 ? "bg-green-500" : fillRate >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${fillRate}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Training-to-Employment Conversion</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <span className="text-xs text-slate-600">Enrolled → Completed</span>
                  <span className="text-sm font-bold text-[#1e3a8a]">{kpiData.completionRate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <span className="text-xs text-slate-600">Completed → Job Ready</span>
                  <span className="text-sm font-bold text-[#1e3a8a]">{kpiData.totalCompleted > 0 ? ((kpiData.totalJobReady / kpiData.totalCompleted) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <span className="text-xs text-slate-600">Job Ready → Interviewed</span>
                  <span className="text-sm font-bold text-[#1e3a8a]">{kpiData.totalJobReady > 0 ? ((kpiData.totalInterviewed / kpiData.totalJobReady) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <span className="text-xs text-slate-600">Interviewed → Selected</span>
                  <span className="text-sm font-bold text-[#1e3a8a]">{kpiData.totalInterviewed > 0 ? ((kpiData.totalSelected / kpiData.totalInterviewed) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <span className="text-xs text-slate-600">Selected → Placed</span>
                  <span className="text-sm font-bold text-[#1e3a8a]">{kpiData.totalSelected > 0 ? ((kpiData.totalPlaced / kpiData.totalSelected) * 100).toFixed(1) : 0}%</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Employment Intelligence Signals</h3>
              <div className="space-y-3">
                {insights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-3 bg-slate-50 rounded">
                    <AlertCircle className="h-4 w-4 text-[#1e3a8a] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm mb-5">
            <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Recommended Government Actions</h3>
            <div className="space-y-3">
              {recommendedActions.map((action, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded">
                  <span className={`mt-0.5 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${action.priority === "High" ? "bg-red-100 text-red-700" : action.priority === "Medium" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                    {action.priority}
                  </span>
                  <p className="text-xs text-slate-600 flex-1">{action.text}</p>
                </div>
              ))}
            </div>
          </div>

          {error && !usingDemoData && (
            <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
              <button onClick={loadData} className="mt-2 ml-6 flex items-center gap-1 text-xs text-red-700 hover:text-red-800 font-medium">
                <RefreshCw className="h-3 w-3" />
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </GovernmentShell>
  );
}

function KpiCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded bg-[#1e3a8a]/10 text-[#1e3a8a]">
          {icon}
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-lg font-bold text-[#1e3a8a]">{typeof value === "number" ? value.toLocaleString() : value}</p>
        </div>
      </div>
    </div>
  );
}