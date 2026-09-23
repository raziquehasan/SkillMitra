"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, type District, type IndustrySector, type Skill, type JobRole, type ProficiencyLevel, type EmergingTechnology } from "@/lib/api";

export default function DemandIntelligencePage() {
  const router = useRouter();
  
  // Filter states
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedJobRole, setSelectedJobRole] = useState("");
  const [selectedProficiency, setSelectedProficiency] = useState("");
  const [selectedEmergingTech, setSelectedEmergingTech] = useState("");
  
  // Data states
  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [proficiencyLevels, setProficiencyLevels] = useState<ProficiencyLevel[]>([]);
  const [emergingTechnologies, setEmergingTechnologies] = useState<EmergingTechnology[]>([]);
  
  const [demandData, setDemandData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to convert demand score to demand level (matching backend semantics)
  const getDemandLevel = (score: number) => {
    if (score >= 80) return "Very High";
    if (score >= 60) return "High";
    if (score >= 40) return "Medium";
    return "Low";
  };

  const getDemandLevelColor = (score: number) => {
    if (score >= 80) return "bg-red-50 text-red-600";
    if (score >= 60) return "bg-orange-50 text-orange-600";
    if (score >= 40) return "bg-yellow-50 text-yellow-600";
    return "bg-green-50 text-green-600";
  };

  // Load reference data
  useEffect(() => {
    (async () => {
      try {
        const [dRes, sRes, skillRes, roleRes, profRes, techRes] = await Promise.all([
          api.districts().catch(() => []),
          api.sectors().catch(() => []),
          api.skills().catch(() => ({ items: [], total: 0 })),
          api.jobRoles().catch(() => []),
          api.proficiencyLevels().catch(() => []),
          api.emergingTechnologies().catch(() => []),
        ]);
        
        setDistricts(dRes);
        setSectors(sRes);
        setSkills(skillRes.items ?? []);
        setJobRoles(roleRes);
        setProficiencyLevels(profRes);
        setEmergingTechnologies(techRes);
      } catch (err) {
        console.error("Failed to load reference data:", err);
        setError("Failed to load reference data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load demand data when filters change
  useEffect(() => {
    (async () => {
      try {
        const demandRes = await api.industryDemand({
          district_id: selectedDistrict || undefined,
          industry_sector_id: selectedSector || undefined,
          skill_id: selectedSkill || undefined,
          job_role_id: selectedJobRole || undefined,
          proficiency_level_id: selectedProficiency || undefined,
          emerging_technology_id: selectedEmergingTech || undefined,
        });
        
        if (Array.isArray(demandRes)) {
          setDemandData(demandRes);
        } else {
          setDemandData([]);
        }
      } catch (err) {
        console.error("Failed to load demand data:", err);
        setDemandData([]);
      }
    })();
  }, [selectedDistrict, selectedSector, selectedSkill, selectedJobRole, selectedProficiency, selectedEmergingTech]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7fa] text-slate-800">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#123b68] border-r-transparent"></div>
            <p className="mt-4 text-sm text-slate-600">Loading demand intelligence...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f4f7fa] text-slate-800">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[#123b68] text-white text-sm rounded hover:bg-[#123b68]/90"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-slate-800">
      {/* Government Top Bar */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-[#123b68] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0">
                <img 
                  src="/maharashtra-gov-logo.png" 
                  alt="Government of Maharashtra"
                  className="h-10 w-10 object-contain"
                />
              </div>
              <div>
                <p className="text-xs font-semibold">Government of Maharashtra</p>
                <p className="text-[11px] text-white/80">Skills, Employment, Entrepreneurship & Innovation Department</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm lg:block">SkillMitra</span>
            <Link href="/" className="text-sm hover:underline">Home</Link>
          </div>
        </div>
      </header>

      <div className="fixed left-0 right-0 top-[60px] z-50 h-1 bg-[#c2410c]" />

      {/* Main Content */}
      <div className="min-h-screen pt-[65px]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-5 lg:px-6">
          
          {/* Page Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-wide text-[#c2410c]">DEMAND INTELLIGENCE</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
              Explore Labour-Market Demand
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              Analyse demand across skills, districts, sectors, job roles, emerging technologies and proficiency levels.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Demand Analysis Filters</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-500">DISTRICT</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">All Districts</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-500">INDUSTRY SECTOR</label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">All Sectors</option>
                  {sectors.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-500">SKILL</label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">All Skills</option>
                  {skills.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-500">JOB ROLE</label>
                <select
                  value={selectedJobRole}
                  onChange={(e) => setSelectedJobRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">All Roles</option>
                  {jobRoles.map((r) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-500">PROFICIENCY LEVEL</label>
                <select
                  value={selectedProficiency}
                  onChange={(e) => setSelectedProficiency(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">All Levels</option>
                  {proficiencyLevels.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-500">EMERGING TECHNOLOGY</label>
                <select
                  value={selectedEmergingTech}
                  onChange={(e) => setSelectedEmergingTech(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">All Technologies</option>
                  {emergingTechnologies.map((t) => (
                    <option key={t.id} value={t.id}>{t.technology_name}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* KPI Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Demand Records</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {demandData.length.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-slate-400">Across all sectors</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">High Demand Roles</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {demandData.filter(d => d.aggregate_demand_score >= 60).length}
              </p>
              <p className="mt-1 text-xs text-slate-400">Requiring attention</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Active Sectors</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {new Set(demandData.map(d => d.industry_sector_id).filter(Boolean)).size}
              </p>
              <p className="mt-1 text-xs text-slate-400">With recorded demand</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">High Demand Jobs</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {demandData.filter(d => d.aggregate_demand_score >= 40).length}
              </p>
              <p className="mt-1 text-xs text-slate-400">Roles with significant demand</p>
            </div>
          </div>

          {/* Demand Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Current Workforce Demand</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="px-4 py-3 text-xs font-bold text-slate-400">SECTOR</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400">JOB ROLE</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400">DISTRICT</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400">PROFICIENCY</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400">DEMAND LEVEL</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-400">DEMAND SCORE</th>
                  </tr>
                </thead>
                <tbody>
                  {demandData.length > 0 ? (
                    demandData.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100">
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {sectors.find(s => s.id === item.industry_sector_id)?.name || "Unknown Sector"}
                        </td>
                        <td className="px-4 py-4 font-semibold text-slate-700">
                          {item.job_role_title || "Unknown Role"}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500">
                          {districts.find(d => d.id === item.district_id)?.name || "Unknown District"}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {proficiencyLevels.find(p => p.id === item.proficiency_level_id)?.name || "Unknown"}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getDemandLevelColor(item.aggregate_demand_score || 0)}`}>
                            {getDemandLevel(item.aggregate_demand_score || 0)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                          {item.aggregate_demand_score || 0}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                        No demand data available for this selection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Future Demand Forecast Section */}
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Future Demand Forecast</h2>
            <p className="text-sm text-slate-600 mb-4">
              Future demand forecasts are not available yet. Forecasts will appear when sufficient historical labour-market evidence and trend data are available.
            </p>
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">
                Forecasts require historical demand analysis, job posting signals, and trend data from the SkillMitra platform.
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}