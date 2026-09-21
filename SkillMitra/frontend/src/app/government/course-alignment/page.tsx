"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { GovernmentShell } from "@/app/government/GovernmentShell";
import { api, type District, type IndustrySector, type Course, type CourseAlignmentData, type SkillCoverage, type DistrictAlignmentSummary } from "@/lib/api";
import {
  BookOpen, GraduationCap, Target, AlertTriangle, MapPin,
  Filter, X, Search, ChevronDown, BarChart3, PieChart,
  TrendingUp, ArrowRight, CheckCircle, XCircle, AlertCircle, Plus, Building2, Users
} from "lucide-react";
export default function CourseAlignmentPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [alignmentData, setAlignmentData] = useState<CourseAlignmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingDemoData, setUsingDemoData] = useState(false);

  // Filters
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterSector, setFilterSector] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSkill, setFilterSkill] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  
  // Assign Program Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [assignData, setAssignData] = useState({
    course_id: "",
    provider_id: "",
    district_id: "",
    sanctioned_seats: 100,
    active_seats: 100,
    status: "active"
  });
  
  // For loading providers
  const [providers, setProviders] = useState<any[]>([]);

  // Pause/Deactivate Course Modal State
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseLoading, setPauseLoading] = useState(false);
  const [pauseError, setPauseError] = useState<string | null>(null);
  const [pauseSuccess, setPauseSuccess] = useState<string | null>(null);
  const [pauseData, setPauseData] = useState({
    course_id: "",
    title: "",
    current_status: "",
    new_status: "draft"
  });

  // Request New Proposal Modal State
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalLoading, setProposalLoading] = useState(false);
  const [proposalError, setProposalError] = useState<string | null>(null);
  const [proposalSuccess, setProposalSuccess] = useState<string | null>(null);
  const [proposalData, setProposalData] = useState({
    course_id: "",
    district_id: filterDistrict,
    sector_id: "",
    requested_skills: [] as string[],
    requested_capacity: "",
    reason: ""
  });

  // Load reference data on mount
  useEffect(() => {
    (async () => {
      try {
        const [dRes, sRes, cRes] = await Promise.all([
          api.districts().catch(() => []),
          api.sectors().catch(() => []),
          api.courses().catch(() => ({ items: [] }))
        ]);
        setDistricts(dRes);
        setSectors(sRes);
        setCourses(cRes.items);
      } catch {
        /* Ignore errors, fallback to empty arrays */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load providers when assign modal opens
  useEffect(() => {
    if (showAssignModal) {
      const loadProviders = async () => {
        try {
          const data = await api.trainingCentres();
          setProviders(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Failed to load providers:", err);
          setProviders([]);
        }
      };
      loadProviders();
    }
  }, [showAssignModal]);

  // Load alignment data - reload when district filter changes to get fresh data from backend
  const loadAlignmentData = useCallback(async () => {
    setFetching(true);
    setError(null);
    try {
      // Use real government dashboard API which returns actual course alignment data with skills and demand
      const dashboardData = await api.governmentDashboard({
        district_id: filterDistrict || undefined,
        sector_id: filterSector || undefined,
      }).catch(() => null);
      
      // Also get training programs data for capacity information
      const trainingProgramsData = await api.trainingPrograms({
        district_id: filterDistrict || undefined,
        sector_id: filterSector || undefined,
        status: filterStatus || undefined,
      }).catch(() => []);
      
      // Create a map of course_id to capacity data
      const capacityMap = new Map<string, { utilized_seats: number; active_seats: number }>();
      if (Array.isArray(trainingProgramsData)) {
        trainingProgramsData.forEach((program: any) => {
          capacityMap.set(program.course_id, {
            utilized_seats: program.utilized_seats || 0,
            active_seats: program.active_seats || 0
          });
        });
      }
      
      if (dashboardData && dashboardData.course_alignment && Array.isArray(dashboardData.course_alignment)) {
        // Transform dashboard course alignment to CourseAlignmentData format
        const transformed = dashboardData.course_alignment.map((item: any): CourseAlignmentData => {
          const capacityData = capacityMap.get(item.course_id) || { utilized_seats: 0, active_seats: 0 };
          
          return {
            course_id: item.course_id || "",
            course_title: item.course_title || "Training Program",
            provider: item.provider || "No Provider Assigned",
            sector: item.sector || "No Sector Assigned",
            district_id: item.district_id || null,
            district_name: item.district_name || "Unknown District",
            alignment_status: (item.alignment_status === "ALIGNED" ? "ALIGNED" : 
                           item.alignment_status === "PARTIAL" ? "PARTIAL" : 
                           item.alignment_status === "NOT_ALIGNED" ? "NEEDS_REVIEW" :
                           item.alignment_status === "NO_DEMAND" ? "ALIGNED" : 
                           item.alignment_status === "NEEDS_REVIEW" ? "NEEDS_REVIEW" : "PARTIAL") as "ALIGNED" | "PARTIAL" | "NEEDS_REVIEW",
            skills_covered: item.skills_covered || [],
            skills_demanded: item.skills_demanded || [],
            gaps: item.gaps || [],
            coverage_percentage: item.coverage_percentage || 0,
            priority: "Medium", // Will be calculated based on gaps
            utilized_seats: capacityData.utilized_seats,
            active_seats: capacityData.active_seats
          };
        });
        setAlignmentData(transformed);
        setUsingDemoData(false);
      } else {
        // No real data available - show honest empty state
        setAlignmentData([]);
        setUsingDemoData(false);
      }
    } catch (err) {
      console.error("Failed to load course alignment data:", err);
      setError("Unable to load course alignment data. Please try again.");
      setAlignmentData([]);
      setUsingDemoData(false);
    } finally {
      setFetching(false);
    }
  }, [filterDistrict, filterSector, filterStatus]); // Reload when filters change

  useEffect(() => {
    loadAlignmentData();
  }, [loadAlignmentData]);

  // Filter data - enhanced with proper dependency tracking
  const filteredData = useMemo(() => {
    return alignmentData.filter((item) => {
      // District filter - REMOVED: Backend already filters by district_id
      // Don't double-filter as backend handles district filtering
      
      // Sector filter - use sector name for comparison (since sector_id may not be available)
      if (filterSector && item.sector !== filterSector) return false;
      
      // Course filter
      if (filterCourse && item.course_id !== filterCourse) return false;
      
      // Status filter
      if (filterStatus && item.alignment_status !== filterStatus) return false;
      
      // Skill search filter
      if (filterSkill) {
        const searchLower = filterSkill.toLowerCase();
        const skillMatch = 
          item.skills_covered.some(s => s.toLowerCase().includes(searchLower)) ||
          item.skills_demanded.some(s => s.toLowerCase().includes(searchLower)) ||
          item.gaps.some(s => s.toLowerCase().includes(searchLower));
        if (!skillMatch) return false;
      }
      
      return true;
    });
  }, [alignmentData, filterSector, filterCourse, filterStatus, filterSkill]);

  // Calculate KPIs with unique skills
  const kpis = useMemo(() => {
    const totalCourses = filteredData.length;
    const alignedCourses = filteredData.filter(c => c.alignment_status === "ALIGNED").length;
    const partialCourses = filteredData.filter(c => c.alignment_status === "PARTIAL").length;
    const needsReviewCourses = filteredData.filter(c => c.alignment_status === "NEEDS_REVIEW").length;
    
    // Count unique training centres
    const uniqueCentres = new Set(
      filteredData.map(c => c.provider)
    ).size;
    
    // Count unique skills covered
    const skillsCovered = new Set(
      filteredData.flatMap(c => c.skills_covered)
    ).size;
    
    // Count unique skills with gaps
    const skillsWithGaps = new Set(
      filteredData.flatMap(c => c.gaps)
    ).size;
    
    // Calculate average alignment safely
    const averageAlignment = totalCourses > 0 
      ? Math.round(filteredData.reduce((sum, c) => sum + c.coverage_percentage, 0) / totalCourses)
      : 0;

    return { totalCourses, alignedCourses, partialCourses, needsReviewCourses, uniqueCentres, skillsCovered, skillsWithGaps, averageAlignment };
  }, [filteredData]);

  // Active filter count (excluding district since it's handled by backend)
  const activeFilterCount = [filterSector, filterCourse, filterStatus, filterSkill].filter(Boolean).length;

  // Reset filters
  const resetFilters = () => {
    setFilterDistrict("");
    setFilterSector("");
    setFilterCourse("");
    setFilterStatus("");
    setFilterSkill("");
    setSelectedCourseId("");
  };

  // Get alignment status styling
  const getAlignmentStatus = (status: string) => {
    switch (status) {
      case "ALIGNED":
        return { label: "ALIGNED", color: "bg-green-100 text-green-800" };
      case "PARTIAL":
        return { label: "PARTIAL", color: "bg-yellow-100 text-yellow-800" };
      case "NEEDS_REVIEW":
        return { label: "NEEDS REVIEW", color: "bg-red-100 text-red-800" };
      default:
        return { label: status, color: "bg-gray-100 text-gray-800" };
    }
  };

  // Get priority styling
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600";
      case "Medium":
        return "text-yellow-600";
      case "Low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  // Calculate skill coverage from filtered data - using real skill data from course alignment
  const skillCoverageData = useMemo(() => {
    if (filteredData.length === 0) return [];
    
    // Aggregate skill gaps across all courses
    const skillGapMap = new Map<string, { demand: number; coverage: number; gap: number }>();
    
    filteredData.forEach(course => {
      course.gaps.forEach(gap => {
        const current = skillGapMap.get(gap) || { demand: 0, coverage: 0, gap: 0 };
        // Count how many courses have this gap as a proxy for demand
        current.demand += 1;
        // Count how many courses cover this skill as a proxy for coverage
        if (course.skills_covered.includes(gap)) {
          current.coverage += 1;
        }
        // Calculate gap
        current.gap = Math.max(0, current.demand - current.coverage);
        skillGapMap.set(gap, current);
      });
    });
    
    // Convert to array and sort by gap
    return Array.from(skillGapMap.entries())
      .map(([skill_name, data]) => ({
        skill_name,
        demand: data.demand,
        coverage: data.coverage,
        gap: data.gap
      }))
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 10);
  }, [filteredData]);

  // Calculate district summary from filtered data
  const districtSummaryData = useMemo(() => {
    const districtMap = new Map<string, DistrictAlignmentSummary>();

    filteredData.forEach(course => {
      if (!course.district_id) return;
      
      const current = districtMap.get(course.district_id) || {
        district_id: course.district_id,
        district_name: course.district_name || course.district_id,
        total_courses: 0,
        strong_alignment: 0,
        partial: 0,
        needs_review: 0,
        average_alignment: 0
      };

      current.total_courses += 1;
      if (course.alignment_status === "ALIGNED") current.strong_alignment += 1;
      else if (course.alignment_status === "PARTIAL") current.partial += 1;
      else current.needs_review += 1;

      districtMap.set(course.district_id, current);
    });

    // Calculate averages
    districtMap.forEach(summary => {
      const coursesInDistrict = filteredData.filter(c => c.district_id === summary.district_id);
      if (coursesInDistrict.length > 0) {
        summary.average_alignment = Math.round(
          coursesInDistrict.reduce((sum, c) => sum + c.coverage_percentage, 0) / coursesInDistrict.length
        );
      }
    });

    return Array.from(districtMap.values()).sort((a, b) => b.average_alignment - a.average_alignment);
  }, [filteredData]);

  // Selected course detail
  const selectedCourse = selectedCourseId ? filteredData.find(c => c.course_id === selectedCourseId) : null;

  // Priority skill gaps with real calculations based on course data
  const prioritySkillGaps = useMemo(() => {
    const gapMap = new Map<string, { count: number; courses: string[] }>();
    
    filteredData.forEach(course => {
      course.gaps.forEach(gap => {
        const current = gapMap.get(gap) || { count: 0, courses: [] };
        current.count += 1;
        current.courses.push(course.course_title);
        gapMap.set(gap, current);
      });
    });

    return Array.from(gapMap.entries())
      .map(([skill, { count, courses }]) => {
        // Calculate learner gap based on course count and capacity
        // Use actual active_seats as a proxy for potential learners affected
        const totalCapacity = filteredData
          .filter(c => c.gaps.includes(skill))
          .reduce((sum, c) => sum + (c.active_seats || 0), 0);
        
        const learnerGap = totalCapacity > 0 ? totalCapacity : count * 50; // Fallback to reasonable estimate
        
        return {
          skill,
          count,
          courses,
          learnerGap,
          severity: count >= 3 ? "Critical" : count >= 2 ? "High" : "Moderate"
        };
      })
      .sort((a, b) => b.learnerGap - a.learnerGap)
      .slice(0, 5);
  }, [filteredData]);

  // Alignment status distribution
  const alignmentDistribution = useMemo(() => {
    const aligned = filteredData.filter(c => c.alignment_status === "ALIGNED").length;
    const partial = filteredData.filter(c => c.alignment_status === "PARTIAL").length;
    const needsReview = filteredData.filter(c => c.alignment_status === "NEEDS_REVIEW").length;
    const total = filteredData.length;
    
    return {
      aligned: total > 0 ? Math.round((aligned / total) * 100) : 0,
      partial: total > 0 ? Math.round((partial / total) * 100) : 0,
      needsReview: total > 0 ? Math.round((needsReview / total) * 100) : 0
    };
  }, [filteredData]);

  // Top courses by alignment
  const topCoursesByAlignment = useMemo(() => {
    return [...filteredData]
      .sort((a, b) => b.coverage_percentage - a.coverage_percentage)
      .slice(0, 8);
  }, [filteredData]);

  if (loading) {
    return (
      <GovernmentShell>
        <div className="min-h-screen bg-[#f4f7fa] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1e3a8a] border-r-transparent" />
            <p className="mt-4 text-sm text-slate-600">Loading course alignment data...</p>
          </div>
        </div>
      </GovernmentShell>
    );
  }

  return (
    <GovernmentShell>
      <div className="min-h-screen bg-[#f4f7fa]">
        <div className="mx-auto max-w-[1600px] w-full px-5 py-8">
          {/* Page Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">Course Alignment</h1>
              <p className="mt-1 text-sm text-slate-600">
                Analyze how well training courses address industry-demanded skills across Maharashtra.
              </p>
            </div>
            <button className="px-4 py-2 bg-[#1e3a8a] text-white text-sm font-medium rounded hover:bg-[#1e3a8a]/90 transition-colors">
              Add Training Program
            </button>
          </div>

          {/* District Context Panel */}
          <div className="mb-5 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#1e3a8a]" />
                <div>
                  <p className="text-sm font-semibold text-[#1e293b]">
                    {filterDistrict 
                      ? `${districts.find(d => d.id === filterDistrict)?.name || 'Selected District'} District`
                      : "All Maharashtra Districts"
                    }
                  </p>
                  <p className="text-xs text-slate-500">
                    {filteredData.length} courses available for analysis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFilterDistrict("")}
                className="text-xs text-[#1e3a8a] hover:text-[#1e3a8a]/80 font-medium"
              >
                Change District
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
                  onChange={(e) => {
                    setFilterCourse(e.target.value);
                    setSelectedCourseId(e.target.value);
                  }}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                >
                  <option value="">All Courses</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Alignment Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                >
                  <option value="">All Statuses</option>
                  <option value="ALIGNED">Aligned</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="NEEDS_REVIEW">Needs Review</option>
                </select>
              </div>

              <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Skill Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={filterSkill}
                    onChange={(e) => setFilterSkill(e.target.value)}
                    placeholder="Search skill..."
                    className="w-full border border-slate-300 rounded pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                  />
                </div>
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

          {/* Empty State - Enhanced for District Context */}
          {filteredData.length === 0 && !fetching && (
            <div className="rounded-md border border-slate-200 bg-white p-8 shadow-sm text-center">
              <Filter className="mx-auto h-12 w-12 text-slate-400" />
              <p className="mt-4 text-sm text-slate-600">No course alignment records available</p>
              <p className="mt-1 text-xs text-slate-500">
                {filterDistrict 
                  ? `No course offerings found for ${districts.find(d => d.id === filterDistrict)?.name || 'selected district'}. Try changing filters or assign a training program to a centre.`
                  : "No course offerings found. Assign a training program to a training centre to create alignment records."
                }
              </p>
              <button 
                onClick={() => setShowAssignModal(true)}
                className="mt-4 px-4 py-2 bg-[#1e3a8a] text-white text-sm font-medium rounded hover:bg-[#1e3a8a]/90 transition-colors"
              >
                Assign Program to Centre
              </button>
            </div>
          )}

          {filteredData.length > 0 && (
            <>
              {/* Top KPI Row - 6 Cards */}
              <div className="mb-5 grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                <div className="bg-white rounded-md border border-slate-200 p-3 shadow-sm">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total Districts</p>
                  <p className="text-lg font-bold text-[#1e3a8a]">{districts.length}</p>
                </div>

                <div className="bg-white rounded-md border border-slate-200 p-3 shadow-sm">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Training Centres</p>
                  <p className="text-lg font-bold text-[#1e3a8a]">{kpis.uniqueCentres}</p>
                </div>

                <div className="bg-white rounded-md border border-slate-200 p-3 shadow-sm">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Active Programs</p>
                  <p className="text-lg font-bold text-green-700">{kpis.alignedCourses}</p>
                </div>

                <div className="bg-white rounded-md border border-slate-200 p-3 shadow-sm">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">High Skill-Gap Areas</p>
                  <p className="text-lg font-bold text-amber-700">{kpis.skillsWithGaps}</p>
                </div>

                <div className="bg-white rounded-md border border-slate-200 p-3 shadow-sm">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Courses Under Review</p>
                  <p className="text-lg font-bold text-red-700">
                    {kpis.needsReviewCourses}
                  </p>
                </div>

                <div className="bg-white rounded-md border border-slate-200 p-3 shadow-sm">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Paused/Inactive</p>
                  <p className="text-lg font-bold text-slate-500">
                    {kpis.partialCourses}
                  </p>
                </div>
              </div>

              {/* Three-Column Analytics Section */}
              <div className="mb-5 grid gap-5 grid-cols-1 lg:grid-cols-3">
                {/* LEFT: Top Skill Gaps */}
                <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-[#1e293b] mb-3">
                    Top Skill Gaps in {filterDistrict ? districts.find(d => d.id === filterDistrict)?.name : "Maharashtra"}
                  </h3>
                  <div className="space-y-2">
                    {skillCoverageData.slice(0, 5).map((skill, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-700 truncate">{skill.skill_name}</span>
                            <span className="text-xs font-bold text-[#1e3a8a]">
                              {Math.round((skill.gap / (skill.demand || 1)) * 100)}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#1e3a8a] rounded-full transition-all"
                              style={{ width: `${Math.min(100, Math.round((skill.gap / (skill.demand || 1)) * 100))}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CENTER: Capacity Utilization by Program */}
                <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-[#1e293b] mb-3">
                    Capacity Utilization by Program
                  </h3>
                  <div className="space-y-3">
                    {skillCoverageData.slice(0, 4).map((program, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-700 truncate">{program.skill_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${Math.min(100, (program.demand / (program.demand + program.coverage || 1)) * 100)}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">Capacity: {program.demand}</p>
                          </div>
                          <div className="flex-1">
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${Math.min(100, (program.coverage / (program.demand + program.coverage || 1)) * 100)}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">Enrolled: {program.coverage}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT: Training Centers Status */}
                <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-[#1e293b] mb-3">
                    Training Centers in {filterDistrict ? districts.find(d => d.id === filterDistrict)?.name : "Maharashtra"}
                  </h3>
                  <div className="flex items-center justify-center mb-3">
                    <div className="relative">
                      <svg viewBox="0 0 36 36" className="h-24 w-24 -rotate-90">
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="3"
                          strokeDasharray={`${alignmentDistribution.aligned} ${100 - alignmentDistribution.aligned}`}
                          strokeDashoffset="0"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke="#eab308"
                          strokeWidth="3"
                          strokeDasharray={`${alignmentDistribution.partial} ${100 - alignmentDistribution.partial}`}
                          strokeDashoffset={`-${alignmentDistribution.aligned}`}
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="3"
                          strokeDasharray={`${alignmentDistribution.needsReview} ${100 - alignmentDistribution.needsReview}`}
                          strokeDashoffset={`-${alignmentDistribution.aligned + alignmentDistribution.partial}`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-[#1e293b]">{filteredData.length}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-slate-600">Active</span>
                      </div>
                      <span className="font-semibold text-slate-700">{alignmentDistribution.aligned}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        <span className="text-slate-600">Under Review</span>
                      </div>
                      <span className="font-semibold text-slate-700">{alignmentDistribution.partial}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-slate-600">Paused</span>
                      </div>
                      <span className="font-semibold text-slate-700">{alignmentDistribution.needsReview}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Training Programs Table */}
              <div className="mb-5 bg-white rounded-md border border-slate-200 shadow-sm">
                <div className="p-4 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-[#1e293b]">
                    Training Programs & Centers in {filterDistrict ? districts.find(d => d.id === filterDistrict)?.name : "Maharashtra"}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 text-xs">#</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 text-xs">Training Center</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 text-xs">Course / Program</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 text-xs">Skill Area</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 text-xs">Current Enrollment</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 text-xs">Capacity</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 text-xs">Status</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 text-xs">Demand (District)</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 text-xs">Gap</th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700 text-xs">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.slice(0, 10).map((course, index) => (
                        <tr key={course.course_id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="py-2 px-3 text-slate-600">{index + 1}</td>
                          <td className="py-2 px-3 text-slate-700 font-medium">{course.provider}</td>
                          <td className="py-2 px-3 text-slate-700">{course.course_title}</td>
                          <td className="py-2 px-3 text-slate-600">{course.sector}</td>
                          <td className="py-2 px-3 text-slate-600">{course.utilized_seats || 0}</td>
                          <td className="py-2 px-3 text-slate-600">{course.active_seats || 0}</td>
                          <td className="py-2 px-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              course.alignment_status === "ALIGNED" ? "bg-green-100 text-green-800" :
                              course.alignment_status === "PARTIAL" ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {course.alignment_status === "ALIGNED" ? "Active" :
                               course.alignment_status === "PARTIAL" ? "Under Review" :
                               course.alignment_status === "NEEDS_REVIEW" ? "Paused" : "Unknown"}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-600">High</td>
                          <td className="py-2 px-3 text-slate-600">
                            {course.gaps.length > 0 ? `${course.gaps.length} skills` : "None"}
                          </td>
                          <td className="py-2 px-3">
                            <button className="text-xs text-[#1e3a8a] hover:text-[#1e3a8a]/80 font-medium">
                              {course.gaps.length > 2 ? "Increase Capacity" : "View Details"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Detailed KPI Cards */}
              <div className="mb-5 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-[#1e3a8a]/10 text-[#1e3a8a]">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total Courses</p>
                      <p className="text-xl font-bold text-[#1e3a8a]">{kpis.totalCourses}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-green-100 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide">Aligned Courses</p>
                      <p className="text-xl font-bold text-green-700">{kpis.alignedCourses}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-indigo-100 text-indigo-700">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide">Training Centres</p>
                      <p className="text-xl font-bold text-indigo-700">{kpis.uniqueCentres}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-blue-100 text-blue-700">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total Capacity</p>
                      <p className="text-xl font-bold text-blue-700">{filteredData.reduce((sum, c) => sum + (c.active_seats || 0), 0)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-green-100 text-green-700">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide">Total Enrollment</p>
                      <p className="text-xl font-bold text-green-700">{filteredData.reduce((sum, c) => sum + (c.utilized_seats || 0), 0)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-purple-100 text-purple-700">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide">Average Alignment</p>
                      <p className="text-xl font-bold text-purple-700">{kpis.averageAlignment}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right-Side District Insights */}
              <div className="mb-5 grid gap-5 grid-cols-1 lg:grid-cols-2">
                {/* District Insights */}
                <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-[#1e3a8a]" />
                    <h3 className="text-sm font-semibold text-[#1e293b]">District Insights</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">High Demand Skills</span>
                      <span className="font-semibold text-[#1e3a8a]">{skillCoverageData.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Current Training Capacity</span>
                      <span className="font-semibold text-green-700">
                        {skillCoverageData.reduce((sum, s) => sum + s.coverage, 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Skill/Capacity Gap</span>
                      <span className="font-semibold text-amber-700">
                        {skillCoverageData.reduce((sum, s) => sum + s.gap, 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Training Programs</span>
                      <span className="font-semibold text-slate-700">{kpis.totalCourses}</span>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4 text-[#1e3a8a]" />
                    <h3 className="text-sm font-semibold text-[#1e293b]">Recommendations</h3>
                  </div>
                  {prioritySkillGaps.length > 0 ? (
                    <div className="space-y-2">
                      {prioritySkillGaps.slice(0, 4).map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full mt-1 ${
                            item.severity === "Critical" ? "bg-red-500" :
                            item.severity === "High" ? "bg-amber-500" : "bg-blue-500"
                          }`} />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-slate-700">{item.skill}</p>
                            <p className="text-[10px] text-slate-500">
                              {item.severity} gap - {item.learnerGap} learners affected
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No skill gap data available. Assign programs to centres to generate recommendations.</p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-5 bg-white rounded-md border border-slate-200 p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-[#1e293b] mb-3">Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setShowAssignModal(true)}
                    className="px-3 py-1.5 bg-[#1e3a8a] text-white text-xs font-medium rounded hover:bg-[#1e3a8a]/90 transition-colors"
                  >
                    Assign Program to Center
                  </button>
                  <button 
                    onClick={() => {
                      if (selectedCourseId) {
                        const selectedCourse = courses.find(c => c.id === selectedCourseId);
                        if (selectedCourse) {
                          setPauseData({
                            course_id: selectedCourse.id,
                            title: selectedCourse.title,
                            current_status: selectedCourse.status || 'unknown',
                            new_status: selectedCourse.status === 'active' ? 'draft' : 'active'
                          });
                          setShowPauseModal(true);
                        }
                      } else {
                        alert("Please select a course first to pause or deactivate.");
                      }
                    }}
                    className="px-3 py-1.5 bg-amber-100 text-amber-800 text-xs font-medium rounded hover:bg-amber-200 transition-colors"
                  >
                    Pause / Deactivate Course
                  </button>
                  <button 
                    onClick={() => {
                      setShowProposalModal(true);
                      setProposalData({
                        ...proposalData,
                        district_id: filterDistrict || ""
                      });
                    }}
                    className="px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-medium rounded hover:bg-blue-200 transition-colors"
                  >
                    Request New Proposal
                  </button>
                  <button 
                    onClick={() => {
                      if (filterDistrict) {
                        window.location.href = `/government/districts?district=${filterDistrict}`;
                      } else {
                        alert("Please select a district first to view district report.");
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-100 text-slate-800 text-xs font-medium rounded hover:bg-slate-200 transition-colors"
                  >
                    View District Report
                  </button>
                </div>
              </div>

              {/* Recent Actions - Disabled until real audit log is implemented */}
              {/* 
              <div className="bg-white rounded-md border border-slate-200 p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-[#1e293b] mb-3">Recent Actions</h3>
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">No recent actions available. Audit log coming soon.</p>
                </div>
              </div>
              */}

              {/* Course Alignment Overview - Keep existing section */}
              <div className="mb-5 grid gap-5 grid-cols-1 lg:grid-cols-2">
                <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Course Alignment Overview</h3>
                  <div className="space-y-3">
                    {topCoursesByAlignment.map((course, index) => (
                      <div key={course.course_id} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-700 truncate">{course.course_title}</span>
                            <span className="text-xs font-bold text-[#1e3a8a]">{course.coverage_percentage}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#1e3a8a] rounded-full transition-all"
                              style={{ width: `${course.coverage_percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Alignment Status</h3>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <svg viewBox="0 0 36 36" className="h-32 w-32 -rotate-90">
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="3"
                          strokeDasharray={`${alignmentDistribution.aligned} ${100 - alignmentDistribution.aligned}`}
                          strokeDashoffset="0"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke="#eab308"
                          strokeWidth="3"
                          strokeDasharray={`${alignmentDistribution.partial} ${100 - alignmentDistribution.partial}`}
                          strokeDashoffset={`-${alignmentDistribution.aligned}`}
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="3"
                          strokeDasharray={`${alignmentDistribution.needsReview} ${100 - alignmentDistribution.needsReview}`}
                          strokeDashoffset={`-${alignmentDistribution.aligned + alignmentDistribution.partial}`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-[#1e293b]">{filteredData.length}</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span className="text-xs text-slate-600">Strong Alignment</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{alignmentDistribution.aligned}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <span className="text-xs text-slate-600">Partial Alignment</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{alignmentDistribution.partial}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span className="text-xs text-slate-600">Needs Review</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{alignmentDistribution.needsReview}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skill Coverage Analysis */}
              <div className="mb-5 bg-white rounded-md border border-slate-200 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Skill Coverage Analysis</h3>
                <div className="space-y-3">
                  {skillCoverageData.map((skill) => (
                    <div key={skill.skill_name} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-700">{skill.skill_name}</span>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>Demand: {skill.demand.toLocaleString()}</span>
                          <span>Coverage: {skill.coverage.toLocaleString()}</span>
                          <span className="text-red-600">Gap: {skill.gap.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <div className="h-2 bg-slate-100 rounded-l-full overflow-hidden flex-1">
                          <div
                            className="h-full bg-blue-500 rounded-l-full"
                            style={{ width: `${(skill.coverage / skill.demand) * 100}%` }}
                          />
                        </div>
                        <div className="h-2 bg-red-100 rounded-r-full overflow-hidden flex-1">
                          <div
                            className="h-full bg-red-500 rounded-r-full"
                            style={{ width: `${(skill.gap / skill.demand) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Demand vs Coverage & Priority Gaps */}
              <div className="mb-5 grid gap-5 grid-cols-1 lg:grid-cols-2">
                {/* Industry Demand vs Course Coverage */}
                <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Industry Demand vs Course Coverage</h3>
                  <div className="space-y-4">
                    {skillCoverageData.slice(0, 6).map((skill) => {
                      const maxVal = Math.max(skill.demand, skill.coverage);
                      const demandPercent = (skill.demand / maxVal) * 100;
                      const coveragePercent = (skill.coverage / maxVal) * 100;
                      
                      return (
                        <div key={skill.skill_name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-700 w-32 truncate">{skill.skill_name}</span>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span className="w-16 text-right">{skill.demand.toLocaleString()}</span>
                              <span className="w-16 text-right">{skill.coverage.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-1 h-8">
                            <div className="flex-1 bg-slate-100 rounded-l overflow-hidden relative">
                              <div
                                className="h-full bg-blue-500 absolute left-0 top-0 transition-all"
                                style={{ width: `${demandPercent}%` }}
                              />
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-600 font-medium">
                                Demand
                              </span>
                            </div>
                            <div className="flex-1 bg-slate-100 rounded-r overflow-hidden relative">
                              <div
                                className="h-full bg-green-500 absolute left-0 top-0 transition-all"
                                style={{ width: `${coveragePercent}%` }}
                              />
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-600 font-medium">
                                Coverage
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-blue-500" />
                      <span className="text-xs text-slate-600">Industry Demand</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500" />
                      <span className="text-xs text-slate-600">Course Coverage</span>
                    </div>
                  </div>
                </div>

                {/* Priority Skill Gaps */}
                <div className="bg-white rounded-md border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Priority Skill Gaps</h3>
                  <div className="space-y-2">
                    {prioritySkillGaps.map((item, index) => (
                      <div key={item.skill} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50">
                        <span className="text-xs font-bold text-slate-400 w-5">{String(index + 1).padStart(2, '0')}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium text-slate-700 block">{item.skill}</span>
                          <span className="text-[10px] text-slate-500">Gap: {item.learnerGap.toLocaleString()} learners • {item.count} courses affected</span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          item.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                          item.severity === 'High' ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {item.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Course Alignment Directory */}
              <div className="mb-5 bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-[#1e293b]">Course Alignment Directory</h3>
                </div>
                <div className="overflow-x-auto">
                  <div className="overflow-x-auto w-full">
            <table data-wrapped="true" className="w-full text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Course</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Provider</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">District</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">Sector</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-600">Skills Covered</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-600">Skills Required</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-600">Alignment</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-600">Priority</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-600">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredData.map((course) => {
                        const status = getAlignmentStatus(course.alignment_status);
                        return (
                          <tr
                            key={course.course_id}
                            className="hover:bg-slate-50 cursor-pointer"
                            onClick={() => setSelectedCourseId(course.course_id)}
                          >
                            <td className="px-4 py-3 font-medium text-slate-700">{course.course_title}</td>
                            <td className="px-4 py-3 text-slate-600">{course.provider}</td>
                            <td className="px-4 py-3 text-slate-600">{course.district_name || "N/A"}</td>
                            <td className="px-4 py-3 text-slate-600">{course.sector}</td>
                            <td className="px-4 py-3 text-center text-slate-600">{course.skills_covered.length}</td>
                            <td className="px-4 py-3 text-center text-slate-600">{course.skills_demanded.length}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#1e3a8a] rounded-full"
                                    style={{ width: `${course.coverage_percentage}%` }}
                                  />
                                </div>
                                <span className="text-xs font-semibold text-[#1e3a8a] w-10 text-right">{course.coverage_percentage}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-xs font-medium ${getPriorityStyle(course.priority)}`}>
                                {course.priority}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${status.color}`}>
                                {status.label}
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

              {/* Selected Course Detail */}
              {selectedCourse && (
                <div className="mb-5 bg-white rounded-md border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Course Alignment Detail</h3>
                  <div className="grid gap-5 grid-cols-1 lg:grid-cols-3">
                    {/* Course Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-base font-bold text-[#1e293b]">{selectedCourse.course_title}</h4>
                          <p className="text-xs text-slate-600 mt-1">{selectedCourse.provider} • {selectedCourse.district_name || "N/A"} • {selectedCourse.sector}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Overall Alignment</p>
                            <p className="text-2xl font-bold text-[#1e3a8a]">{selectedCourse.coverage_percentage}%</p>
                          </div>
                          <div className="relative w-16 h-16">
                            <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                              <circle
                                cx="18"
                                cy="18"
                                r="15.9"
                                fill="none"
                                stroke="#e2e8f0"
                                strokeWidth="3"
                              />
                              <circle
                                cx="18"
                                cy="18"
                                r="15.9"
                                fill="none"
                                stroke="#1e3a8a"
                                strokeWidth="3"
                                strokeDasharray={`${selectedCourse.coverage_percentage} ${100 - selectedCourse.coverage_percentage}`}
                                strokeDashoffset="0"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                        <div className="bg-slate-50 rounded p-3">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-2">Required Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedCourse.skills_demanded.map((skill) => (
                              <span key={skill} className="inline-block bg-slate-200 px-2 py-0.5 rounded text-[10px] text-slate-700">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="bg-green-50 rounded p-3">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-2">Covered</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedCourse.skills_covered.map((skill) => (
                              <span key={skill} className="inline-block bg-green-100 px-2 py-0.5 rounded text-[10px] text-green-700">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="bg-red-50 rounded p-3">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-2">Gaps</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedCourse.gaps.length > 0 ? (
                              selectedCourse.gaps.map((skill) => (
                                <span key={skill} className="inline-block bg-red-100 px-2 py-0.5 rounded text-[10px] text-red-700">
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-green-600">No gaps</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-2">Recommended Alignment Actions</p>
                      <div className="space-y-2">
                        {selectedCourse.gaps.length > 0 ? (
                          selectedCourse.gaps.map((gap) => (
                            <div key={gap} className="flex items-start gap-2 p-2 bg-amber-50 rounded">
                              <ArrowRight className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-slate-700">Add {gap} module to curriculum</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-start gap-2 p-2 bg-green-50 rounded">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-slate-700">Course is well-aligned with industry demand</span>
                          </div>
                        )}
                        {selectedCourse.coverage_percentage < 80 && (
                          <div className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                            <ArrowRight className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-slate-700">Increase practical training components</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* District Alignment Summary */}
              <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-[#1e293b]">District Alignment Summary</h3>
                </div>
                <div className="overflow-x-auto">
                  <div className="overflow-x-auto w-full">
            <table data-wrapped="true" className="w-full text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">District</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-600">Courses</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-600">Strong Alignment</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-600">Partial</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-600">Needs Review</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-600">Average Alignment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {districtSummaryData.length > 0 ? (
                        districtSummaryData.map((district) => (
                          <tr key={district.district_id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-700 flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              {district.district_name}
                            </td>
                            <td className="px-4 py-3 text-center text-slate-600">{district.total_courses}</td>
                            <td className="px-4 py-3 text-center text-green-600">{district.strong_alignment}</td>
                            <td className="px-4 py-3 text-center text-yellow-600">{district.partial}</td>
                            <td className="px-4 py-3 text-center text-red-600">{district.needs_review}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="font-semibold text-[#1e3a8a]">{district.average_alignment}%</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                            No district data available for current filters
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
          </div>
                </div>
              </div>
            </>
          )}

          {/* Assign Program to Centre Modal */}
          {showAssignModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[#1e293b]">Assign Program to Centre</h2>
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {assignSuccess ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-3" />
                    <p className="text-sm font-medium text-slate-700">{assignSuccess}</p>
                    <button
                      onClick={() => {
                        setShowAssignModal(false);
                        setAssignSuccess(null);
                        // Trigger reload by changing filter
                        setFilterDistrict(filterDistrict);
                      }}
                      className="mt-4 bg-[#1e3a8a] text-white px-4 py-2 rounded text-sm font-medium"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setAssignLoading(true);
                    setAssignError(null);

                    try {
                      await api.assignProgramToCentre({
                        course_id: assignData.course_id,
                        provider_id: assignData.provider_id,
                        district_id: assignData.district_id,
                        sanctioned_seats: assignData.sanctioned_seats,
                        active_seats: assignData.active_seats,
                        status: assignData.status,
                      });
                      setAssignSuccess("Program assigned to centre successfully!");
                    } catch (error: any) {
                      setAssignError(error.message || "Failed to assign program to centre");
                    } finally {
                      setAssignLoading(false);
                    }
                  }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Training Program *</label>
                        <select
                          required
                          value={assignData.course_id}
                          onChange={(e) => setAssignData({...assignData, course_id: e.target.value})}
                          className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                        >
                          <option value="">Select Program</option>
                          {courses.map((c) => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Training Centre *</label>
                        <select
                          required
                          value={assignData.provider_id}
                          onChange={(e) => setAssignData({...assignData, provider_id: e.target.value})}
                          className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                        >
                          <option value="">Select Centre</option>
                          {providers.map((p) => (
                            <option key={p.provider_id} value={p.provider_id}>{p.provider_name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">District *</label>
                        <select
                          required
                          value={assignData.district_id}
                          onChange={(e) => setAssignData({...assignData, district_id: e.target.value})}
                          className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                        >
                          <option value="">Select District</option>
                          {districts.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Sanctioned Seats</label>
                          <input
                            type="number"
                            value={assignData.sanctioned_seats}
                            onChange={(e) => setAssignData({...assignData, sanctioned_seats: parseInt(e.target.value) || 0})}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Active Seats</label>
                          <input
                            type="number"
                            value={assignData.active_seats}
                            onChange={(e) => setAssignData({...assignData, active_seats: parseInt(e.target.value) || 0})}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                        <select
                          value={assignData.status}
                          onChange={(e) => setAssignData({...assignData, status: e.target.value})}
                          className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>

                      {assignError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          {assignError}
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAssignModal(false)}
                          className="flex-1 border border-slate-300 text-slate-700 px-4 py-2 rounded text-sm font-medium hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={assignLoading}
                          className="flex-1 bg-[#1e3a8a] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#1e3a8a]/90 disabled:opacity-50"
                        >
                          {assignLoading ? "Assigning..." : "Assign Program"}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Pause/Deactivate Course Modal */}
          {showPauseModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[#1e293b]">Pause / Deactivate Course</h2>
                  <button
                    onClick={() => setShowPauseModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {pauseSuccess ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-3" />
                    <p className="text-sm font-medium text-slate-700">{pauseSuccess}</p>
                    <button
                      onClick={() => {
                        setShowPauseModal(false);
                        setPauseSuccess(null);
                        // Reload data to show updated status
                        loadAlignmentData();
                      }}
                      className="mt-4 bg-[#1e3a8a] text-white px-4 py-2 rounded text-sm font-medium"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setPauseLoading(true);
                    setPauseError(null);

                    try {
                      await api.updateCourseStatus(pauseData.course_id, pauseData.new_status);
                      setPauseSuccess(`Course status updated to ${pauseData.new_status}`);
                      // Reload courses to reflect the status change
                      const coursesData = await api.courses();
                      setCourses(coursesData.items || []);
                      // Reload alignment data to update the table
                      await loadAlignmentData();
                    } catch (error: any) {
                      setPauseError(error.message || "Failed to update course status");
                    } finally {
                      setPauseLoading(false);
                    }
                  }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Course</label>
                        <input
                          type="text"
                          value={pauseData.title}
                          disabled
                          className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-slate-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Current Status</label>
                        <input
                          type="text"
                          value={pauseData.current_status}
                          disabled
                          className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-slate-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">New Status *</label>
                        <select
                          required
                          value={pauseData.new_status}
                          onChange={(e) => setPauseData({...pauseData, new_status: e.target.value})}
                          className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                        >
                          <option value="draft">Draft (Paused)</option>
                          <option value="active">Active</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>

                      {pauseError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          {pauseError}
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowPauseModal(false)}
                          className="flex-1 border border-slate-300 text-slate-700 px-4 py-2 rounded text-sm font-medium hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={pauseLoading}
                          className="flex-1 bg-amber-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
                        >
                          {pauseLoading ? "Updating..." : "Update Status"}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Request New Proposal Modal */}
          {showProposalModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[#1e293b]">Request New Training Proposal</h2>
                  <button
                    onClick={() => setShowProposalModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {proposalSuccess ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-3" />
                    <p className="text-sm font-medium text-slate-700">{proposalSuccess}</p>
                    <button
                      onClick={() => {
                        setShowProposalModal(false);
                        setProposalSuccess(null);
                      }}
                      className="mt-4 bg-[#1e3a8a] text-white px-4 py-2 rounded text-sm font-medium"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setProposalLoading(true);
                    setProposalError(null);

                    try {
                      await api.createTrainingProposal({
                        course_id: proposalData.course_id || undefined,
                        district_id: proposalData.district_id,
                        sector_id: proposalData.sector_id || undefined,
                        requested_skills: proposalData.requested_skills,
                        requested_capacity: proposalData.requested_capacity ? parseInt(proposalData.requested_capacity) : undefined,
                        reason: proposalData.reason,
                      });
                      setProposalSuccess("Training proposal submitted successfully!");
                      // Reset form
                      setProposalData({
                        course_id: "",
                        district_id: filterDistrict,
                        sector_id: "",
                        requested_skills: [],
                        requested_capacity: "",
                        reason: ""
                      });
                    } catch (error: any) {
                      setProposalError(error.message || "Failed to submit proposal");
                    } finally {
                      setProposalLoading(false);
                    }
                  }}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Course (Optional)</label>
                        <select
                          value={proposalData.course_id}
                          onChange={(e) => setProposalData({...proposalData, course_id: e.target.value})}
                          className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                        >
                          <option value="">Select Course (Optional)</option>
                          {courses.map((c) => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">District *</label>
                        <select
                          required
                          value={proposalData.district_id}
                          onChange={(e) => setProposalData({...proposalData, district_id: e.target.value})}
                          className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                        >
                          <option value="">Select District</option>
                          {districts.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Sector (Optional)</label>
                        <select
                          value={proposalData.sector_id}
                          onChange={(e) => setProposalData({...proposalData, sector_id: e.target.value})}
                          className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                        >
                          <option value="">Select Sector</option>
                          {sectors.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Requested Capacity</label>
                        <input
                          type="number"
                          value={proposalData.requested_capacity}
                          onChange={(e) => setProposalData({...proposalData, requested_capacity: e.target.value})}
                          className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Reason *</label>
                        <textarea
                          required
                          value={proposalData.reason}
                          onChange={(e) => setProposalData({...proposalData, reason: e.target.value})}
                          className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                          rows={3}
                        />
                      </div>

                      {proposalError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          {proposalError}
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowProposalModal(false)}
                          className="flex-1 border border-slate-300 text-slate-700 px-4 py-2 rounded text-sm font-medium hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={proposalLoading}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                          {proposalLoading ? "Submitting..." : "Submit Proposal"}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </GovernmentShell>
  );
}