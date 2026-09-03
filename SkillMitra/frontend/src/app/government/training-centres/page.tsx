"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { GovernmentShell } from "@/app/government/GovernmentShell";
import { api, type District } from "@/lib/api";
import { 
  MapPin, Filter, X, Search, 
  Building2, Users, GraduationCap, TrendingUp, 
  AlertCircle, RefreshCw, CheckCircle, AlertTriangle,
  Wrench
} from "lucide-react";

type TrainingCentre = {
  provider_id: string;
  provider_name: string;
  district_id: string;
  district_name: string;
  course_count: number;
  trainer_count: number;
  equipment_count: number;
  total_capacity: number;
  filled_seats: number;
  available_seats: number;
  utilization: number | null;
  verification_status: string;
  equipment_status?: string;
};

const demoTrainingCentres: TrainingCentre[] = [
  {
    provider_id: "DEMO-TC001",
    provider_name: "Maharashtra Skill Development Centre",
    district_id: "d-pune",
    district_name: "Pune",
    course_count: 12,
    trainer_count: 18,
    equipment_count: 24,
    total_capacity: 160,
    filled_seats: 132,
    available_seats: 28,
    utilization: 82.5,
    verification_status: "VERIFIED",
    equipment_status: "Ready",
  },
  {
    provider_id: "DEMO-TC002",
    provider_name: "Nashik Industrial Training Institute",
    district_id: "d-nashik",
    district_name: "Nashik",
    course_count: 8,
    trainer_count: 11,
    equipment_count: 15,
    total_capacity: 120,
    filled_seats: 76,
    available_seats: 44,
    utilization: 63.3,
    verification_status: "VERIFIED",
    equipment_status: "Ready",
  },
  {
    provider_id: "DEMO-TC003",
    provider_name: "Nagpur Skill Development Academy",
    district_id: "d-nagpur",
    district_name: "Nagpur",
    course_count: 10,
    trainer_count: 14,
    equipment_count: 18,
    total_capacity: 140,
    filled_seats: 84,
    available_seats: 56,
    utilization: 60.0,
    verification_status: "VERIFIED",
    equipment_status: "Partial",
  },
  {
    provider_id: "DEMO-TC004",
    provider_name: "Mumbai Technical Training Centre",
    district_id: "d-mumbai",
    district_name: "Mumbai",
    course_count: 15,
    trainer_count: 22,
    equipment_count: 30,
    total_capacity: 200,
    filled_seats: 185,
    available_seats: 15,
    utilization: 92.5,
    verification_status: "VERIFIED",
    equipment_status: "Ready",
  },
  {
    provider_id: "DEMO-TC005",
    provider_name: "Aurangabad Vocational Institute",
    district_id: "d-aurangabad",
    district_name: "Aurangabad",
    course_count: 6,
    trainer_count: 8,
    equipment_count: 10,
    total_capacity: 80,
    filled_seats: 22,
    available_seats: 58,
    utilization: 27.5,
    verification_status: "VERIFIED",
    equipment_status: "Needs Attention",
  },
  {
    provider_id: "DEMO-TC006",
    provider_name: "Solapur Healthcare Training Centre",
    district_id: "d-solapur",
    district_name: "Solapur",
    course_count: 5,
    trainer_count: 7,
    equipment_count: 9,
    total_capacity: 60,
    filled_seats: 48,
    available_seats: 12,
    utilization: 80.0,
    verification_status: "VERIFIED",
    equipment_status: "Ready",
  },
  {
    provider_id: "DEMO-TC007",
    provider_name: "Kolhapur Tourism & Hospitality Institute",
    district_id: "d-kolhapur",
    district_name: "Kolhapur",
    course_count: 7,
    trainer_count: 9,
    equipment_count: 12,
    total_capacity: 90,
    filled_seats: 52,
    available_seats: 38,
    utilization: 57.8,
    verification_status: "VERIFIED",
    equipment_status: "Partial",
  },
  {
    provider_id: "DEMO-TC008",
    provider_name: "Thane Digital Skills Academy",
    district_id: "d-thane",
    district_name: "Thane",
    course_count: 9,
    trainer_count: 12,
    equipment_count: 20,
    total_capacity: 100,
    filled_seats: 95,
    available_seats: 5,
    utilization: 95.0,
    verification_status: "VERIFIED",
    equipment_status: "Ready",
  },
  {
    provider_id: "DEMO-TC009",
    provider_name: "Amravati Agricultural Training Centre",
    district_id: "d-amravati",
    district_name: "Amravati",
    course_count: 4,
    trainer_count: 5,
    equipment_count: 6,
    total_capacity: 50,
    filled_seats: 18,
    available_seats: 32,
    utilization: 36.0,
    verification_status: "PENDING",
    equipment_status: "Needs Attention",
  },
  {
    provider_id: "DEMO-TC010",
    provider_name: "Navi Mumbai Advanced Manufacturing Hub",
    district_id: "d-navi-mumbai",
    district_name: "Navi Mumbai",
    course_count: 11,
    trainer_count: 16,
    equipment_count: 22,
    total_capacity: 150,
    filled_seats: 120,
    available_seats: 30,
    utilization: 80.0,
    verification_status: "VERIFIED",
    equipment_status: "Ready",
  },
  {
    provider_id: "DEMO-TC011",
    provider_name: "Ratnagiri Marine Training Institute",
    district_id: "d-ratnagiri",
    district_name: "Ratnagiri",
    course_count: 3,
    trainer_count: 4,
    equipment_count: 5,
    total_capacity: 40,
    filled_seats: 12,
    available_seats: 28,
    utilization: 30.0,
    verification_status: "PENDING",
    equipment_status: "Partial",
  },
  {
    provider_id: "DEMO-TC012",
    provider_name: "Chhatrapati Sambhajinagar IT Centre",
    district_id: "d-chh-sambhajinagar",
    district_name: "Chhatrapati Sambhajinagar",
    course_count: 8,
    trainer_count: 10,
    equipment_count: 14,
    total_capacity: 110,
    filled_seats: 78,
    available_seats: 32,
    utilization: 70.9,
    verification_status: "VERIFIED",
    equipment_status: "Ready",
  },
];

export default function TrainingCentresPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [centres, setCentres] = useState<TrainingCentre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [usingDemoData, setUsingDemoData] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const dRes = await api.districts().catch(() => []);
        setDistricts(dRes);
      } catch (err) {
        console.error("Failed to load districts:", err);
      }
    })();
  }, []);

  const loadCentres = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUsingDemoData(false);
    try {
      const data = await api.trainingCentres({
        district_id: filterDistrict || undefined,
      });
      
      let fetchedCentres = Array.isArray(data) ? data : [];
      
      if (fetchedCentres.length === 0) {
        let demoFiltered = [...demoTrainingCentres];
        if (filterDistrict) {
          demoFiltered = demoFiltered.filter((c) => c.district_id === filterDistrict);
        }
        if (filterStatus) {
          demoFiltered = demoFiltered.filter((c) => {
            const util = c.total_capacity > 0 ? (c.filled_seats / c.total_capacity) * 100 : 0;
            const status = getCapacityStatusLabel(util);
            return status === filterStatus;
          });
        }
        if (searchQuery) {
          demoFiltered = demoFiltered.filter((c) =>
            c.provider_name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        setCentres(demoFiltered);
        setUsingDemoData(true);
      } else {
        let filtered = fetchedCentres;
        if (filterStatus) {
          filtered = filtered.filter((c) => {
            const util = c.total_capacity > 0 ? (c.filled_seats / c.total_capacity) * 100 : 0;
            const status = getCapacityStatusLabel(util);
            return status === filterStatus;
          });
        }
        if (searchQuery) {
          filtered = filtered.filter((c) =>
            c.provider_name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        setCentres(filtered);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load training centres");
      let demoFiltered = [...demoTrainingCentres];
      if (filterDistrict) {
        demoFiltered = demoFiltered.filter((c) => c.district_id === filterDistrict);
      }
      setCentres(demoFiltered);
      setUsingDemoData(true);
    } finally {
      setLoading(false);
    }
  }, [filterDistrict, filterStatus, searchQuery]);

  useEffect(() => {
    loadCentres();
  }, [loadCentres]);

  const clearFilters = () => {
    setFilterDistrict("");
    setFilterStatus("");
    setSearchQuery("");
  };

  const activeFilterCount = [filterDistrict, filterStatus, searchQuery].filter(Boolean).length;

  const kpiData = useMemo(() => {
    const totalCentres = centres.length;
    const totalCapacity = centres.reduce((sum, c) => sum + c.total_capacity, 0);
    const filledSeats = centres.reduce((sum, c) => sum + c.filled_seats, 0);
    const availableSeats = totalCapacity - filledSeats;
    const avgUtilization = totalCapacity > 0 ? ((filledSeats / totalCapacity) * 100).toFixed(1) : "0.0";
    return { totalCentres, totalCapacity, filledSeats, availableSeats, avgUtilization };
  }, [centres]);

  const capacityOverview = useMemo(() => {
    let highUtil = 0;
    let moderateUtil = 0;
    let lowUtil = 0;
    centres.forEach((c) => {
      const util = c.total_capacity > 0 ? (c.filled_seats / c.total_capacity) * 100 : 0;
      if (util >= 70) highUtil++;
      else if (util >= 40) moderateUtil++;
      else lowUtil++;
    });
    return { highUtil, moderateUtil, lowUtil };
  }, [centres]);

  const getCapacityStatusLabel = (utilization: number) => {
    if (utilization >= 85) return "Near Capacity";
    if (utilization >= 60) return "Healthy";
    if (utilization >= 30) return "Available";
    return "Low Utilisation";
  };

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
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getEquipmentBadge = (status: string) => {
    switch (status) {
      case "Ready":
        return "bg-green-100 text-green-700";
      case "Partial":
        return "bg-amber-100 text-amber-700";
      case "Needs Attention":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 85) return "bg-amber-500";
    if (utilization >= 60) return "bg-[#1e3a8a]";
    if (utilization >= 30) return "bg-blue-400";
    return "bg-slate-400";
  };

  return (
    <GovernmentShell>
      <div className="bg-[#F5F7FA] p-4 md:p-6">
        <div className="max-w-[1500px] mx-auto">
          {/* Page Header */}
          <div className="mb-5">
            <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">Training Centres</h1>
            <p className="text-sm text-slate-600 mt-1">
              Monitor training centre capacity, trainer availability, equipment readiness and utilisation across districts.
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

              <div className="flex-1 min-w-[160px]">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Capacity Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] bg-white"
                >
                  <option value="">All Statuses</option>
                  <option value="Near Capacity">Near Capacity</option>
                  <option value="Healthy">Healthy</option>
                  <option value="Available">Available</option>
                  <option value="Low Utilisation">Low Utilisation</option>
                </select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Search Centre</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by centre name..."
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
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total Centres</p>
                  <p className="text-xl font-bold text-[#1e3a8a]">{kpiData.totalCentres}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-blue-100 text-blue-700">
                  <GraduationCap className="h-5 w-5" />
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
                <div className="p-2 rounded bg-amber-100 text-amber-700">
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
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Avg Utilisation</p>
                  <p className="text-xl font-bold text-[#1e3a8a]">{kpiData.avgUtilization}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Capacity Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            {/* Utilisation Distribution */}
            <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-3">Centre Capacity Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-amber-500" />
                    <span className="text-xs text-slate-600">High Utilisation (70-100%)</span>
                  </div>
                  <span className="text-sm font-bold text-[#1e3a8a]">{capacityOverview.highUtil}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ width: `${kpiData.totalCentres > 0 ? (capacityOverview.highUtil / kpiData.totalCentres) * 100 : 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-[#1e3a8a]" />
                    <span className="text-xs text-slate-600">Moderate Utilisation (40-69%)</span>
                  </div>
                  <span className="text-sm font-bold text-[#1e3a8a]">{capacityOverview.moderateUtil}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#1e3a8a] rounded-full" 
                    style={{ width: `${kpiData.totalCentres > 0 ? (capacityOverview.moderateUtil / kpiData.totalCentres) * 100 : 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-slate-400" />
                    <span className="text-xs text-slate-600">Low Utilisation (0-39%)</span>
                  </div>
                  <span className="text-sm font-bold text-[#1e3a8a]">{capacityOverview.lowUtil}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-slate-400 rounded-full" 
                    style={{ width: `${kpiData.totalCentres > 0 ? (capacityOverview.lowUtil / kpiData.totalCentres) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Capacity Status Summary */}
            <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-3">Capacity Status</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total Capacity</p>
                  <p className="text-lg font-bold text-[#1e3a8a]">{kpiData.totalCapacity.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Filled Seats</p>
                  <p className="text-lg font-bold text-[#1e3a8a]">{kpiData.filledSeats.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Available Seats</p>
                  <p className="text-lg font-bold text-green-600">{kpiData.availableSeats.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Overall Status</p>
                  <div className="flex items-center gap-1 mt-1">
                    {Number(kpiData.avgUtilization) >= 70 ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Healthy</span>
                      </>
                    ) : Number(kpiData.avgUtilization) >= 40 ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium text-amber-600">Moderate</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-500">Low</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Data Label */}
          {usingDemoData && (
            <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-700 font-medium">
              <Building2 className="h-3.5 w-3.5" />
              Illustrative Demo Data
            </div>
          )}

          {/* Error State */}
          {error && !usingDemoData && (
            <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-700 font-medium">Unable to load training centres</p>
              </div>
              <p className="text-xs text-red-600 mt-1 ml-6">{error}</p>
              <button
                onClick={loadCentres}
                className="mt-2 ml-6 flex items-center gap-1 text-xs text-red-700 hover:text-red-800 font-medium"
              >
                <RefreshCw className="h-3 w-3" />
                Try again
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
              </div>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4 border-b border-slate-100 flex items-center gap-4">
                  <div className="h-4 w-44 bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && centres.length === 0 && (
            <div className="rounded-md border border-slate-200 bg-white shadow-sm p-10 text-center">
              <Building2 className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-700">No training centres found</p>
              <p className="mt-1 text-xs text-slate-500">No centres match the selected filters.</p>
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

          {/* Training Centres Table */}
          {!loading && centres.length > 0 && (
            <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-x-auto">
              <div className="overflow-x-auto w-full">
            <table data-wrapped="true" className="w-full text-sm min-w-[1200px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 font-semibold text-[#1e293b] min-w-[200px]">Centre</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#1e293b] min-w-[100px]">District</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#1e293b] min-w-[70px]">Courses</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#1e293b] min-w-[70px]">Trainers</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#1e293b] min-w-[100px]">Equipment</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#1e293b] min-w-[80px]">Capacity</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#1e293b] min-w-[80px]">Filled</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#1e293b] min-w-[80px]">Available</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#1e293b] min-w-[130px]">Utilisation</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#1e293b] min-w-[110px]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {centres.map((centre, index) => {
                    const utilization = centre.total_capacity > 0
                      ? ((centre.filled_seats / centre.total_capacity) * 100)
                      : 0;
                    const capStatus = getCapacityStatusLabel(utilization);
                    return (
                      <tr key={`${centre.provider_id}-${index}`} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-medium text-[#1e293b] truncate" title={centre.provider_name}>
                            {centre.provider_name}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {centre.district_name}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600">{centre.course_count}</td>
                        <td className="py-3 px-4 text-right text-slate-600">{centre.trainer_count}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${getEquipmentBadge(centre.equipment_status || "Unknown")}`}>
                            {centre.equipment_status || "Unknown"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-[#1e293b]">{centre.total_capacity}</td>
                        <td className="py-3 px-4 text-right font-medium text-[#1e3a8a]">{centre.filled_seats}</td>
                        <td className="py-3 px-4 text-right text-slate-500">{centre.total_capacity - centre.filled_seats}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-16 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${getUtilizationColor(utilization)}`}
                                style={{ width: `${Math.min(utilization, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-600 w-12 text-right">
                              {utilization.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${getStatusBadge(capStatus)}`}>
                            {capStatus}
                          </span>
                        </td>
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
    </GovernmentShell>
  );
}
