"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { GovernmentShell } from "@/app/government/GovernmentShell";
import { api, type District, type IndustrySector } from "@/lib/api";
import { 
  BarChart3, Filter, X, Search, 
  MapPin, Users, Building2, TrendingUp, 
  AlertCircle, RefreshCw, CheckCircle, AlertTriangle,
  ArrowRight, Target
} from "lucide-react";

type DistrictCapacity = {
  district_id: string;
  district_name: string;
  trainingCentres: number;
  capacity: number;
  filledSeats: number;
  availableSeats: number;
  industryDemand: number;
  utilisation: number;
  capacityStatus: string;
};

type CentreCapacity = {
  id: string;
  centre: string;
  district: string;
  capacity: number;
  filled: number;
  available: number;
  utilisation: number;
  status: string;
};

const demoDistrictCapacity: DistrictCapacity[] = [
  {
    district_id: "d-pune",
    district_name: "Pune",
    trainingCentres: 8,
    capacity: 220,
    filledSeats: 188,
    availableSeats: 32,
    industryDemand: 260,
    utilisation: 85.5,
    capacityStatus: "Near Capacity",
  },
  {
    district_id: "d-mumbai",
    district_name: "Mumbai",
    trainingCentres: 12,
    capacity: 250,
    filledSeats: 224,
    availableSeats: 26,
    industryDemand: 290,
    utilisation: 89.6,
    capacityStatus: "Near Capacity",
  },
  {
    district_id: "d-nashik",
    district_name: "Nashik",
    trainingCentres: 5,
    capacity: 140,
    filledSeats: 91,
    availableSeats: 49,
    industryDemand: 125,
    utilisation: 65.0,
    capacityStatus: "Healthy",
  },
  {
    district_id: "d-nagpur",
    district_name: "Nagpur",
    trainingCentres: 6,
    capacity: 160,
    filledSeats: 104,
    availableSeats: 56,
    industryDemand: 170,
    utilisation: 65.0,
    capacityStatus: "Capacity Gap",
  },
  {
    district_id: "d-thane",
    district_name: "Thane",
    trainingCentres: 7,
    capacity: 180,
    filledSeats: 135,
    availableSeats: 45,
    industryDemand: 160,
    utilisation: 75.0,
    capacityStatus: "Healthy",
  },
  {
    district_id: "d-kolhapur",
    district_name: "Kolhapur",
    trainingCentres: 4,
    capacity: 90,
    filledSeats: 52,
    availableSeats: 38,
    industryDemand: 85,
    utilisation: 57.8,
    capacityStatus: "Available",
  },
  {
    district_id: "d-solapur",
    district_name: "Solapur",
    trainingCentres: 3,
    capacity: 70,
    filledSeats: 48,
    availableSeats: 22,
    industryDemand: 65,
    utilisation: 68.6,
    capacityStatus: "Healthy",
  },
  {
    district_id: "d-amravati",
    district_name: "Amravati",
    trainingCentres: 3,
    capacity: 60,
    filledSeats: 18,
    availableSeats: 42,
    industryDemand: 55,
    utilisation: 30.0,
    capacityStatus: "Low Utilisation",
  },
  {
    district_id: "d-navi-mumbai",
    district_name: "Navi Mumbai",
    trainingCentres: 6,
    capacity: 150,
    filledSeats: 120,
    availableSeats: 30,
    industryDemand: 140,
    utilisation: 80.0,
    capacityStatus: "Healthy",
  },
  {
    district_id: "d-chh-sambhajinagar",
    district_name: "Chhatrapati Sambhajinagar",
    trainingCentres: 4,
    capacity: 100,
    filledSeats: 62,
    availableSeats: 38,
    industryDemand: 95,
    utilisation: 62.0,
    capacityStatus: "Healthy",
  },
];

const demoCentreCapacity: CentreCapacity[] = [
  { id: "C001", centre: "Maharashtra Skill Development Centre", district: "Pune", capacity: 160, filled: 132, available: 28, utilisation: 82.5, status: "Near Capacity" },
  { id: "C002", centre: "Mumbai Technical Training Centre", district: "Mumbai", capacity: 200, filled: 185, available: 15, utilisation: 92.5, status: "Near Capacity" },
  { id: "C003", centre: "Thane Digital Skills Academy", district: "Thane", capacity: 100, filled: 95, available: 5, utilisation: 95.0, status: "Near Capacity" },
  { id: "C004", centre: "Navi Mumbai Advanced Manufacturing Hub", district: "Navi Mumbai", capacity: 150, filled: 120, available: 30, utilisation: 80.0, status: "Healthy" },
  { id: "C005", centre: "Nagpur Skill Development Academy", district: "Nagpur", capacity: 140, filled: 84, available: 56, utilisation: 60.0, status: "Healthy" },
  { id: "C006", centre: "Nashik Industrial Training Institute", district: "Nashik", capacity: 120, filled: 76, available: 44, utilisation: 63.3, status: "Healthy" },
  { id: "C007", centre: "Solapur Healthcare Training Centre", district: "Solapur", capacity: 60, filled: 48, available: 12, utilisation: 80.0, status: "Healthy" },
  { id: "C008", centre: "Chhatrapati Sambhajinagar IT Centre", district: "Chhatrapati Sambhajinagar", capacity: 110, filled: 78, available: 32, utilisation: 70.9, status: "Healthy" },
];

export default function TrainingCapacityPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [districtData, setDistrictData] = useState<DistrictCapacity[]>([]);
  const [centreData, setCentreData] = useState<CentreCapacity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterSector, setFilterSector] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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
      } catch (err) {
        console.error("Failed to load filter options:", err);
      }
    })();
  }, []);

  const loadCapacity = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUsingDemoData(false);
    try {
      const capRes = await api.trainingCapacityReport("all").catch(() => null);
      
      if (capRes && Array.isArray(capRes) && capRes.length > 0) {
        const mapped: DistrictCapacity[] = capRes.map((item: Record<string, unknown>) => {
          const capacity = Number(item.total_capacity) || 0;
          const filled = Number(item.filled_seats) || 0;
          const demand = Number(item.total_demand) || 0;
          return {
            district_id: String(item.district_id || ""),
            district_name: String(item.district_name || ""),
            trainingCentres: Number(item.verified_providers) || 0,
            capacity,
            filledSeats: filled,
            availableSeats: capacity - filled,
            industryDemand: demand,
            utilisation: capacity > 0 ? (filled / capacity) * 100 : 0,
            capacityStatus: getCapacityStatusLabel(capacity > 0 ? (filled / capacity) * 100 : 0, demand, capacity - filled),
          };
        });
        setDistrictData(mapped);
        setCentreData([]);
        setUsingDemoData(false);
      } else {
        let demoFiltered = [...demoDistrictCapacity];
        if (filterDistrict) {
          demoFiltered = demoFiltered.filter((d) => d.district_id === filterDistrict);
        }
        if (searchQuery) {
          demoFiltered = demoFiltered.filter((d) =>
            d.district_name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        setDistrictData(demoFiltered);
        setCentreData(demoCentreCapacity);
        setUsingDemoData(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load training capacity");
      let demoFiltered = [...demoDistrictCapacity];
      if (filterDistrict) {
        demoFiltered = demoFiltered.filter((d) => d.district_id === filterDistrict);
      }
      setDistrictData(demoFiltered);
      setCentreData(demoCentreCapacity);
      setUsingDemoData(true);
    } finally {
      setLoading(false);
    }
  }, [filterDistrict, searchQuery]);

  useEffect(() => {
    loadCapacity();
  }, [loadCapacity]);

  const clearFilters = () => {
    setFilterDistrict("");
    setFilterSector("");
    setSearchQuery("");
  };

  const activeFilterCount = [filterDistrict, filterSector, searchQuery].filter(Boolean).length;

  const kpiData = useMemo(() => {
    const totalCapacity = districtData.reduce((sum, d) => sum + d.capacity, 0);
    const filledSeats = districtData.reduce((sum, d) => sum + d.filledSeats, 0);
    const availableSeats = totalCapacity - filledSeats;
    const industryDemand = districtData.reduce((sum, d) => sum + d.industryDemand, 0);
    const capacityGap = Math.max(industryDemand - availableSeats, 0);
    const utilisation = totalCapacity > 0 ? ((filledSeats / totalCapacity) * 100) : 0;
    return { totalCapacity, filledSeats, availableSeats, industryDemand, capacityGap, utilisation };
  }, [districtData]);

  const capacityInsights = useMemo(() => {
    const insights: string[] = [];
    const highUtil = districtData.filter((d) => d.utilisation >= 85);
    if (highUtil.length > 0) {
      insights.push(`${highUtil.length} district${highUtil.length > 1 ? "s" : ""} operating above 85% utilisation.`);
    }
    if (kpiData.availableSeats > 0) {
      insights.push(`${kpiData.availableSeats.toLocaleString()} seats remain available across selected districts.`);
    }
    const gapDistricts = districtData.filter((d) => d.capacityStatus === "Capacity Gap");
    if (gapDistricts.length > 0) {
      insights.push(`Capacity gap highest in ${gapDistricts.map((d) => d.district_name).join(", ")}.`);
    }
    if (insights.length === 0) {
      insights.push("No significant capacity signal for the current selection.");
    }
    return insights;
  }, [districtData, kpiData]);

  function getCapacityStatusLabel(utilisation: number, demand?: number, available?: number): string {
    if (demand && available && demand > available) return "Capacity Gap";
    if (utilisation >= 85) return "Near Capacity";
    if (utilisation >= 60) return "Healthy";
    if (utilisation >= 30) return "Available";
    return "Low Utilisation";
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Near Capacity":
        return "bg-amber-100 text-amber-700";
      case "Healthy":
        return "bg-green-100 text-green-700";
      case "Available":
        return "bg-blue-100 text-blue-700";
      case "Low Utilisation":
        return "bg-slate-100 text-slate-600";
      case "Capacity Gap":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getUtilizationColor = (utilisation: number) => {
    if (utilisation >= 85) return "bg-amber-500";
    if (utilisation >= 60) return "bg-[#1e3a8a]";
    if (utilisation >= 30) return "bg-blue-400";
    return "bg-slate-400";
  };

  return (
    <GovernmentShell>
      <div className="bg-[#F5F7FA] p-4 md:p-6">
        <div className="max-w-[1600px] mx-auto">
          {/* Page Header */}
          <div className="mb-5">
            <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">Training Capacity</h1>
            <p className="text-sm text-slate-600 mt-1">
              Analyse training capacity against job-market demand across Maharashtra districts.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-md border border-slate-200 p-4 mb-5 shadow-sm">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">District</label>
                <select
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] bg-white"
                >
                  <option value="">All Districts</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[180px]">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Sector</label>
                <select
                  value={filterSector}
                  onChange={(e) => setFilterSector(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] bg-white"
                >
                  <option value="">All Sectors</option>
                  {sectors.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search district..."
                    className="w-full border border-slate-300 rounded pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                  />
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium px-3 py-2 rounded hover:bg-red-50 transition-colors whitespace-nowrap"
                >
                  <X className="h-3.5 w-3.5" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* KPI Summary Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
            <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-[#1e3a8a]/10 text-[#1e3a8a]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total Capacity</p>
                  <p className="text-xl font-bold text-[#1e3a8a]">{kpiData.totalCapacity.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-green-100 text-green-700">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Filled Seats</p>
                  <p className="text-xl font-bold text-[#1e3a8a]">{kpiData.filledSeats.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-blue-100 text-blue-700">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Available Seats</p>
                  <p className="text-xl font-bold text-[#1e3a8a]">{kpiData.availableSeats.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-purple-100 text-purple-700">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Industry Demand</p>
                  <p className="text-xl font-bold text-[#1e3a8a]">{kpiData.industryDemand.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-amber-100 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Capacity Gap</p>
                  <p className="text-xl font-bold text-[#1e3a8a]">{kpiData.capacityGap.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && !usingDemoData && (
            <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-700 font-medium">Unable to load training capacity</p>
              </div>
              <p className="text-xs text-red-600 mt-1 ml-6">{error}</p>
              <button
                onClick={loadCapacity}
                className="mt-2 ml-6 flex items-center gap-1 text-xs text-red-700 hover:text-red-800 font-medium"
              >
                <RefreshCw className="h-3 w-3" />
                Try again
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
                    <div className="h-4 w-20 bg-slate-200 rounded animate-pulse mb-2" />
                    <div className="h-6 w-16 bg-slate-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-md border border-slate-200 p-6 shadow-sm h-64">
                  <div className="h-4 w-40 bg-slate-200 rounded animate-pulse mb-4" />
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-md border border-slate-200 p-6 shadow-sm h-64">
                  <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-4" />
                  <div className="h-32 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {!loading && districtData.length > 0 && (
            <>
              {/* Main Capacity Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
                {/* Training Capacity vs Demand */}
                <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Training Capacity vs Demand</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-purple-600" />
                        <span className="text-xs text-slate-600">Industry Demand</span>
                      </div>
                      <span className="text-sm font-bold text-[#1e3a8a]">{kpiData.industryDemand.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-[#1e3a8a]" />
                        <span className="text-xs text-slate-600">Training Capacity</span>
                      </div>
                      <span className="text-sm font-bold text-[#1e3a8a]">{kpiData.totalCapacity.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-slate-600">Filled Seats</span>
                      </div>
                      <span className="text-sm font-bold text-[#1e3a8a]">{kpiData.filledSeats.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span className="text-xs text-slate-600">Available Capacity</span>
                      </div>
                      <span className="text-sm font-bold text-[#1e3a8a]">{kpiData.availableSeats.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Capacity Utilisation */}
                <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Capacity Utilisation</h3>
                  <div className="text-center mb-4">
                    <p className="text-4xl font-bold text-[#1e3a8a]">{kpiData.utilisation.toFixed(1)}%</p>
                    <p className="text-xs text-slate-500 mt-1">Overall Utilisation</p>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                    <div
                      className={`h-full rounded-full ${getUtilizationColor(kpiData.utilisation)}`}
                      style={{ width: `${Math.min(kpiData.utilisation, 100)}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded text-center">
                      <p className="text-lg font-bold text-[#1e3a8a]">{kpiData.filledSeats.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500">Filled</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded text-center">
                      <p className="text-lg font-bold text-green-600">{kpiData.availableSeats.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500">Available</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* District-wise Training Capacity */}
              <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm mb-5">
                <h3 className="text-sm font-semibold text-[#1e293b] mb-4">District-wise Training Capacity</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[900px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left py-3 px-4 font-semibold text-[#1e293b]">District</th>
                        <th className="text-right py-3 px-4 font-semibold text-[#1e293b]">Centres</th>
                        <th className="text-right py-3 px-4 font-semibold text-[#1e293b]">Capacity</th>
                        <th className="text-right py-3 px-4 font-semibold text-[#1e293b]">Filled</th>
                        <th className="text-right py-3 px-4 font-semibold text-[#1e293b]">Available</th>
                        <th className="text-right py-3 px-4 font-semibold text-[#1e293b]">Demand</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#1e293b] min-w-[140px]">Utilisation</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#1e293b]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {districtData.map((district, index) => (
                        <tr key={`${district.district_id}-${index}`} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" />
                              <span className="font-medium text-[#1e293b]">{district.district_name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right text-slate-600">{district.trainingCentres}</td>
                          <td className="py-3 px-4 text-right font-medium text-[#1e293b]">{district.capacity}</td>
                          <td className="py-3 px-4 text-right font-medium text-[#1e3a8a]">{district.filledSeats}</td>
                          <td className="py-3 px-4 text-right text-slate-500">{district.availableSeats}</td>
                          <td className="py-3 px-4 text-right text-slate-600">{district.industryDemand}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-20 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${getUtilizationColor(district.utilisation)}`}
                                  style={{ width: `${Math.min(district.utilisation, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-600 w-12 text-right">
                                {district.utilisation.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${getStatusBadge(district.capacityStatus)}`}>
                              {district.capacityStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Centre Capacity + Capacity Signals */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
                {/* Centre Capacity Table */}
                <div className="lg:col-span-2 bg-white rounded-md border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Training Centre Capacity</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[600px]">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="text-left py-2.5 px-3 font-semibold text-[#1e293b]">Centre</th>
                          <th className="text-left py-2.5 px-3 font-semibold text-[#1e293b]">District</th>
                          <th className="text-right py-2.5 px-3 font-semibold text-[#1e293b]">Capacity</th>
                          <th className="text-right py-2.5 px-3 font-semibold text-[#1e293b]">Filled</th>
                          <th className="text-right py-2.5 px-3 font-semibold text-[#1e293b]">Available</th>
                          <th className="text-right py-2.5 px-3 font-semibold text-[#1e293b]">Util %</th>
                          <th className="text-left py-2.5 px-3 font-semibold text-[#1e293b]">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {centreData.map((centre, index) => (
                          <tr key={`${centre.id}-${index}`} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3 font-medium text-[#1e293b] truncate max-w-[180px]" title={centre.centre}>
                              {centre.centre}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">{centre.district}</td>
                            <td className="py-2.5 px-3 text-right text-[#1e293b]">{centre.capacity}</td>
                            <td className="py-2.5 px-3 text-right text-[#1e3a8a]">{centre.filled}</td>
                            <td className="py-2.5 px-3 text-right text-slate-500">{centre.available}</td>
                            <td className="py-2.5 px-3 text-right text-slate-600">{centre.utilisation.toFixed(1)}%</td>
                            <td className="py-2.5 px-3">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${getStatusBadge(centre.status)}`}>
                                {centre.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Capacity Signals */}
                <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Capacity Signals</h3>
                  <div className="space-y-3">
                    {capacityInsights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-2 p-2.5 bg-slate-50 rounded">
                        <AlertCircle className="h-4 w-4 text-[#1e3a8a] flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-600">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Empty State */}
          {!loading && !error && districtData.length === 0 && (
            <div className="rounded-md border border-slate-200 bg-white shadow-sm p-10 text-center">
              <BarChart3 className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-700">No training capacity data available</p>
              <p className="mt-1 text-xs text-slate-500">Try changing the selected district or filters.</p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-4 inline-flex items-center gap-1 text-xs text-[#1e3a8a] hover:text-[#1e3a8a]/80 font-medium"
                >
                  <X className="h-3 w-3" />
                  Reset Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </GovernmentShell>
  );
}
