"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { GovernmentShell } from "@/app/government/GovernmentShell";
import { api, type District, type IndustrySector } from "@/lib/api";
import { 
  Users, UserCheck, GraduationCap, Briefcase, 
  TrendingUp, MapPin, Search, X, AlertCircle, 
  RefreshCw, Target, Award, BarChart3, PieChart as PieChartIcon
} from "lucide-react";

interface CandidateIntelligence {
  total: number;
  by_district: Array<{ district_id: string; district_name: string; count: number }>;
  by_skill: Array<{ skill_id: string; skill_name: string; count: number }>;
  by_sector: Array<{ sector_id: string; sector_name: string; count: number }>;
}

interface DistrictCandidate {
  district_id: string;
  district_name: string;
  totalCandidates: number;
  registered: number;
  profileCompleted: number;
  skillsAssessed: number;
  enrolled: number;
  completed: number;
  placed: number;
  employmentRate: number;
}

interface SkillData {
  skill_name: string;
  candidate_supply: number;
  industry_demand: number;
}

interface SectorData {
  sector_name: string;
  candidates: number;
}

const demoDistrictCandidates: DistrictCandidate[] = [
  { district_id: "d-pune", district_name: "Pune", totalCandidates: 28000, registered: 24000, profileCompleted: 21000, skillsAssessed: 16000, enrolled: 8500, completed: 6200, placed: 5200, employmentRate: 18.6 },
  { district_id: "d-mumbai", district_name: "Mumbai", totalCandidates: 24000, registered: 21000, profileCompleted: 18500, skillsAssessed: 15000, enrolled: 7200, completed: 5400, placed: 4800, employmentRate: 20.0 },
  { district_id: "d-nashik", district_name: "Nashik", totalCandidates: 12000, registered: 10500, profileCompleted: 8800, skillsAssessed: 6500, enrolled: 3200, completed: 2400, placed: 1800, employmentRate: 15.0 },
  { district_id: "d-nagpur", district_name: "Nagpur", totalCandidates: 15000, registered: 13000, profileCompleted: 11200, skillsAssessed: 8500, enrolled: 4100, completed: 3000, placed: 2300, employmentRate: 15.3 },
  { district_id: "d-thane", district_name: "Thane", totalCandidates: 18000, registered: 15500, profileCompleted: 13200, skillsAssessed: 10000, enrolled: 4800, completed: 3500, placed: 2900, employmentRate: 16.1 },
  { district_id: "d-kolhapur", district_name: "Kolhapur", totalCandidates: 8000, registered: 6800, profileCompleted: 5600, skillsAssessed: 4200, enrolled: 2000, completed: 1500, placed: 1100, employmentRate: 13.8 },
  { district_id: "d-solapur", district_name: "Solapur", totalCandidates: 7000, registered: 6000, profileCompleted: 5000, skillsAssessed: 3800, enrolled: 1800, completed: 1300, placed: 900, employmentRate: 12.9 },
  { district_id: "d-amravati", district_name: "Amravati", totalCandidates: 6000, registered: 5200, profileCompleted: 4300, skillsAssessed: 3200, enrolled: 1500, completed: 1100, placed: 750, employmentRate: 12.5 },
  { district_id: "d-navi-mumbai", district_name: "Navi Mumbai", totalCandidates: 14000, registered: 12000, profileCompleted: 10200, skillsAssessed: 7800, enrolled: 3600, completed: 2700, placed: 2100, employmentRate: 15.0 },
  { district_id: "d-chh-sambhajinagar", district_name: "Chhatrapati Sambhajinagar", totalCandidates: 9000, registered: 7800, profileCompleted: 6500, skillsAssessed: 4900, enrolled: 2300, completed: 1700, placed: 1200, employmentRate: 13.3 },
];

const demoSkills: SkillData[] = [
  { skill_name: "Electrical Technology", candidate_supply: 2900, industry_demand: 3500 },
  { skill_name: "CNC Machine Operation", candidate_supply: 2600, industry_demand: 3000 },
  { skill_name: "Industrial Safety", candidate_supply: 1800, industry_demand: 2400 },
  { skill_name: "EV Technology", candidate_supply: 1500, industry_demand: 2200 },
  { skill_name: "Python Programming", candidate_supply: 2200, industry_demand: 2800 },
  { skill_name: "Diagnostics", candidate_supply: 1400, industry_demand: 1600 },
  { skill_name: "Digital Tools", candidate_supply: 3200, industry_demand: 3500 },
  { skill_name: "Solar Installation", candidate_supply: 900, industry_demand: 1400 },
  { skill_name: "Healthcare Assistant", candidate_supply: 1600, industry_demand: 2000 },
  { skill_name: "Welding Technician", candidate_supply: 1200, industry_demand: 1500 },
];

const demoSectors: SectorData[] = [
  { sector_name: "IT & ITES", candidates: 18500 },
  { sector_name: "Manufacturing", candidates: 15200 },
  { sector_name: "Healthcare", candidates: 9800 },
  { sector_name: "Construction", candidates: 8500 },
  { sector_name: "Retail", candidates: 7200 },
  { sector_name: "Hospitality", candidates: 5800 },
  { sector_name: "Automotive", candidates: 5100 },
  { sector_name: "Renewable Energy", candidates: 3900 },
];

export default function CandidatesPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterSector, setFilterSector] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [filterTrainingStatus, setFilterTrainingStatus] = useState("");
  const [filterEmploymentStatus, setFilterEmploymentStatus] = useState("");
  const [apiData, setApiData] = useState<CandidateIntelligence | null>(null);
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
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadData = useCallback(async () => {
    setFetching(true);
    setError(null);
    try {
      const res = await api.governmentCandidates({
        district_id: filterDistrict || undefined,
      });
      if (res && res.total > 0) {
        setApiData(res);
        setUsingDemoData(false);
      } else {
        setApiData(null);
        setUsingDemoData(true);
      }
    } catch {
      setError("Failed to load candidate data");
      setApiData(null);
      setUsingDemoData(true);
    } finally {
      setFetching(false);
    }
  }, [filterDistrict]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const clearFilters = () => {
    setFilterDistrict("");
    setFilterSector("");
    setFilterSkill("");
    setFilterTrainingStatus("");
    setFilterEmploymentStatus("");
  };

  const activeFilterCount = [filterDistrict, filterSector, filterSkill, filterTrainingStatus, filterEmploymentStatus].filter(Boolean).length;

  const filteredDistricts = useMemo(() => {
    let data = [...demoDistrictCandidates];
    if (filterDistrict) {
      data = data.filter((d) => d.district_id === filterDistrict);
    }
    return data;
  }, [filterDistrict]);

  const kpiData = useMemo(() => {
    const totalCandidates = filteredDistricts.reduce((sum, d) => sum + d.totalCandidates, 0);
    const registered = filteredDistricts.reduce((sum, d) => sum + d.registered, 0);
    const skillsAssessed = filteredDistricts.reduce((sum, d) => sum + d.skillsAssessed, 0);
    const enrolled = filteredDistricts.reduce((sum, d) => sum + d.enrolled, 0);
    const placed = filteredDistricts.reduce((sum, d) => sum + d.placed, 0);
    const employmentRate = totalCandidates > 0 ? (placed / totalCandidates) * 100 : 0;
    const trainingParticipation = registered > 0 ? (enrolled / registered) * 100 : 0;
    return { totalCandidates, registered, skillsAssessed, enrolled, placed, employmentRate, trainingParticipation };
  }, [filteredDistricts]);

  const funnelData = useMemo(() => {
    const registered = kpiData.registered;
    const profileCompleted = filteredDistricts.reduce((sum, d) => sum + d.profileCompleted, 0);
    const skillsAssessed = kpiData.skillsAssessed;
    const enrolled = kpiData.enrolled;
    const completed = filteredDistricts.reduce((sum, d) => sum + d.completed, 0);
    const placed = kpiData.placed;
    return [
      { label: "Registered", value: registered, pct: 100 },
      { label: "Profile Completed", value: profileCompleted, pct: registered > 0 ? (profileCompleted / registered) * 100 : 0 },
      { label: "Skill Assessed", value: skillsAssessed, pct: profileCompleted > 0 ? (skillsAssessed / profileCompleted) * 100 : 0 },
      { label: "Enrolled", value: enrolled, pct: skillsAssessed > 0 ? (enrolled / skillsAssessed) * 100 : 0 },
      { label: "Completed", value: completed, pct: enrolled > 0 ? (completed / enrolled) * 100 : 0 },
      { label: "Placed / Employed", value: placed, pct: completed > 0 ? (placed / completed) * 100 : 0 },
    ];
  }, [filteredDistricts, kpiData]);

  const employmentStatusData = useMemo(() => {
    const placed = kpiData.placed;
    const enrolled = kpiData.enrolled - filteredDistricts.reduce((sum, d) => sum + d.completed, 0);
    const jobSeeking = kpiData.skillsAssessed - kpiData.enrolled;
    const pending = kpiData.registered - kpiData.skillsAssessed;
    return [
      { label: "Placed / Employed", value: placed, color: "bg-green-500" },
      { label: "In Training", value: Math.max(enrolled, 0), color: "bg-blue-500" },
      { label: "Job Seeking", value: Math.max(jobSeeking, 0), color: "bg-amber-500" },
      { label: "Assessment Pending", value: Math.max(pending, 0), color: "bg-slate-400" },
    ];
  }, [kpiData, filteredDistricts]);

  const totalEmployment = employmentStatusData.reduce((sum, d) => sum + d.value, 0);

  const insights = useMemo(() => {
    const items: string[] = [];
    if (kpiData.enrolled > 0) {
      items.push(`${kpiData.enrolled.toLocaleString()} candidates are currently enrolled in training.`);
    }
    const topDistrict = filteredDistricts.reduce((best, d) => d.employmentRate > best.employmentRate ? d : best, filteredDistricts[0]);
    if (topDistrict) {
      items.push(`Employment conversion is strongest in ${topDistrict.district_name} (${topDistrict.employmentRate}%).`);
    }
    const topSector = demoSectors.reduce((best, s) => s.candidates > best.candidates ? s : best, demoSectors[0]);
    if (topSector) {
      items.push(`${topSector.sector_name} has the largest candidate concentration (${topSector.candidates.toLocaleString()}).`);
    }
    const supplyGap = demoSkills.filter((s) => s.industry_demand > s.candidate_supply);
    if (supplyGap.length > 0) {
      items.push(`Candidate supply is below industry demand for ${supplyGap.map((s) => s.skill_name).join(", ")}.`);
    }
    if (items.length === 0) {
      items.push("No significant candidate signal for the current selection.");
    }
    return items;
  }, [kpiData, filteredDistricts]);

  const formatNumber = (n: number) => n.toLocaleString();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1e3a8a] border-r-transparent" />
          <p className="mt-4 text-sm text-slate-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <GovernmentShell>
      <div className="bg-[#F5F7FA] p-4 md:p-6">
        <div className="max-w-[1500px] mx-auto">
          {/* Page Header */}
          <div className="mb-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">Candidates Intelligence</h1>
                <p className="text-sm text-slate-600 mt-1">
                  Monitor candidate registrations, skills, training participation and employment outcomes across Maharashtra.
                </p>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-md border border-slate-200 p-4 mb-5 shadow-sm">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[160px]">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">District</label>
                <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] bg-white">
                  <option value="">All Districts</option>
                  {districts.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
                </select>
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Sector</label>
                <select value={filterSector} onChange={(e) => setFilterSector(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] bg-white">
                  <option value="">All Sectors</option>
                  {sectors.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                </select>
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Skill</label>
                <select value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] bg-white">
                  <option value="">All Skills</option>
                  {demoSkills.map((s) => (<option key={s.skill_name} value={s.skill_name}>{s.skill_name}</option>))}
                </select>
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Training Status</label>
                <select value={filterTrainingStatus} onChange={(e) => setFilterTrainingStatus(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] bg-white">
                  <option value="">All Statuses</option>
                  <option value="enrolled">Enrolled</option>
                  <option value="completed">Completed</option>
                  <option value="not_enrolled">Not Enrolled</option>
                </select>
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Employment Status</label>
                <select value={filterEmploymentStatus} onChange={(e) => setFilterEmploymentStatus(e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] bg-white">
                  <option value="">All Statuses</option>
                  <option value="placed">Placed</option>
                  <option value="seeking">Job Seeking</option>
                  <option value="not_placed">Not Placed</option>
                </select>
              </div>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium px-3 py-2 rounded hover:bg-red-50 transition-colors whitespace-nowrap">
                  <X className="h-3.5 w-3.5" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-5">
            <KpiCard icon={<Users className="h-5 w-5" />} label="Total Candidates" value={kpiData.totalCandidates} />
            <KpiCard icon={<UserCheck className="h-5 w-5" />} label="Registered" value={kpiData.registered} />
            <KpiCard icon={<GraduationCap className="h-5 w-5" />} label="Skills Assessed" value={kpiData.skillsAssessed} />
            <KpiCard icon={<Briefcase className="h-5 w-5" />} label="Enrolled" value={kpiData.enrolled} />
            <KpiCard icon={<Award className="h-5 w-5" />} label="Placed" value={kpiData.placed} />
            <KpiCard icon={<TrendingUp className="h-5 w-5" />} label="Employment Rate" value={`${kpiData.employmentRate.toFixed(1)}%`} />
          </div>

          {/* Row 2: Funnel + Employment Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            {/* Candidate Journey Funnel */}
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Candidate Journey</h3>
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
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1e3a8a] rounded-full transition-all" style={{ width: `${stage.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Employment Status Donut */}
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Candidate Employment Status</h3>
              <div className="flex items-center gap-6">
                <div className="relative h-32 w-32 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="h-32 w-32 -rotate-90">
                    {employmentStatusData.reduce((acc, item, idx) => {
                      const pct = totalEmployment > 0 ? (item.value / totalEmployment) * 100 : 0;
                      const offset = acc.offset;
                      const dasharray = `${pct} ${100 - pct}`;
                      acc.elements.push(
                        <circle
                          key={idx}
                          cx="18" cy="18" r="15.9155"
                          fill="none"
                          strokeWidth="3.5"
                          stroke={item.color.replace("bg-", "#")}
                          strokeDasharray={dasharray}
                          strokeDashoffset={`${-offset}`}
                          strokeLinecap="round"
                        />
                      );
                      acc.offset += pct;
                      return acc;
                    }, { elements: [] as React.ReactNode[], offset: 0 }).elements}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-[#1e3a8a]">{formatNumber(totalEmployment)}</span>
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

          {/* Row 3: Sector + Training Participation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            {/* Candidates by Sector */}
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Candidates by Sector</h3>
              <div className="space-y-2.5">
                {demoSectors.map((sector, idx) => {
                  const maxCandidates = Math.max(...demoSectors.map((s) => s.candidates));
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-600">{sector.sector_name}</span>
                        <span className="text-xs font-medium text-[#1e293b]">{formatNumber(sector.candidates)}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#1e3a8a] rounded-full" style={{ width: `${(sector.candidates / maxCandidates) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Training Participation */}
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Training Participation</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <span className="text-xs text-slate-600">Registered → Assessed</span>
                  <span className="text-sm font-bold text-[#1e3a8a]">{kpiData.registered > 0 ? ((kpiData.skillsAssessed / kpiData.registered) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <span className="text-xs text-slate-600">Assessed → Enrolled</span>
                  <span className="text-sm font-bold text-[#1e3a8a]">{kpiData.skillsAssessed > 0 ? ((kpiData.enrolled / kpiData.skillsAssessed) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <span className="text-xs text-slate-600">Enrolled → Completed</span>
                  <span className="text-sm font-bold text-[#1e3a8a]">{kpiData.enrolled > 0 ? ((filteredDistricts.reduce((s, d) => s + d.completed, 0) / kpiData.enrolled) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <span className="text-xs text-slate-600">Completed → Placed</span>
                  <span className="text-sm font-bold text-[#1e3a8a]">{filteredDistricts.reduce((s, d) => s + d.completed, 0) > 0 ? ((kpiData.placed / filteredDistricts.reduce((s, d) => s + d.completed, 0)) * 100).toFixed(1) : 0}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 4: Skill Supply vs Demand + Employment Outcomes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            {/* Skill Supply vs Demand */}
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Candidate Supply vs Industry Demand</h3>
              <div className="space-y-3">
                {demoSkills.slice(0, 6).map((skill, idx) => {
                  const maxVal = Math.max(...demoSkills.map((s) => Math.max(s.candidate_supply, s.industry_demand)));
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-600 truncate max-w-[140px]" title={skill.skill_name}>{skill.skill_name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-[#1e3a8a]">{formatNumber(skill.candidate_supply)}</span>
                          <span className="text-[10px] text-slate-400">vs</span>
                          <span className="text-[10px] text-amber-600">{formatNumber(skill.industry_demand)}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#1e3a8a] rounded-full" style={{ width: `${(skill.candidate_supply / maxVal) * 100}%` }} />
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(skill.industry_demand / maxVal) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Employment Outcomes */}
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Employment Outcomes</h3>
              <div className="space-y-3">
                {demoSectors.slice(0, 6).map((sector, idx) => {
                  const placed = Math.round(sector.candidates * (0.12 + Math.random() * 0.08));
                  return (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded">
                      <span className="text-xs text-slate-600">{sector.sector_name}</span>
                      <span className="text-xs font-medium text-[#1e3a8a]">{formatNumber(placed)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 5: District-wise Analysis */}
          <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm mb-5">
            <h3 className="text-sm font-semibold text-[#1e293b] mb-4">District-wise Candidate Intelligence</h3>
            <div className="overflow-x-auto">
              <div className="overflow-x-auto w-full">
            <table data-wrapped="true" className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 font-semibold text-[#1e293b]">District</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#1e293b]">Candidates</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#1e293b]">Assessed</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#1e293b]">Enrolled</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#1e293b]">Placed</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#1e293b] min-w-[120px]">Employment Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDistricts.map((district, idx) => (
                    <tr key={`${district.district_id}-${idx}`} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-medium text-[#1e293b]">{district.district_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-[#1e293b]">{formatNumber(district.totalCandidates)}</td>
                      <td className="py-3 px-4 text-right text-slate-600">{formatNumber(district.skillsAssessed)}</td>
                      <td className="py-3 px-4 text-right text-slate-600">{formatNumber(district.enrolled)}</td>
                      <td className="py-3 px-4 text-right font-medium text-[#1e3a8a]">{formatNumber(district.placed)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#1e3a8a] rounded-full" style={{ width: `${Math.min(district.employmentRate * 5, 100)}%` }} />
                          </div>
                          <span className="text-xs font-medium text-slate-600 w-12 text-right">{district.employmentRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
            </div>
          </div>

          {/* Row 6: Top Skills + Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            {/* Top Candidate Skills */}
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Top Candidate Skills</h3>
              <div className="space-y-2.5">
                {demoSkills.map((skill, idx) => {
                  const maxSupply = Math.max(...demoSkills.map((s) => s.candidate_supply));
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-5">{idx + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs text-slate-600">{skill.skill_name}</span>
                          <span className="text-xs font-medium text-[#1e3a8a]">{formatNumber(skill.candidate_supply)}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#1e3a8a] rounded-full" style={{ width: `${(skill.candidate_supply / maxSupply) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Candidate Intelligence Signals */}
            <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Candidate Intelligence Signals</h3>
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

          {/* Error State */}
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
