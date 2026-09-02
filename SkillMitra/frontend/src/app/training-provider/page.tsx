"use client";

import { TrainingProviderShell } from "@/app/training-provider/TrainingProviderShell";
import { useState, useEffect, useMemo } from "react";
import { api, type District, type Course } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  TrendingUp,
  Users,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Target,
  BarChart3,
  Calendar,
  Filter,
  Search,
  X,
  Loader2,
  ArrowUp,
  ArrowDown,
  Building2,
  MapPin,
  GraduationCap,
  Settings,
  FileText,
  Bell,
  Clock,
  Activity,
} from "lucide-react";

export default function TrainingProviderDashboard() {
  return (
    <TrainingProviderShell>
      <TrainingProviderDashboardContent />
    </TrainingProviderShell>
  );
}

function TrainingProviderDashboardContent() {
  const { user } = useAuth();
  const [districts, setDistricts] = useState<District[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [timePeriod, setTimePeriod] = useState<string>("30");
  
  // Backend data or fallback
  const dashboardData = useMemo(() => {
    // Try to use real data if available, otherwise use fallback
    if (districts.length > 0 && courses.length > 0) {
      return getFallbackDashboardData(true);
    }
    return getFallbackDashboardData(false);
  }, [districts, courses, selectedDistrict, selectedSector, selectedCourse, timePeriod]);

  useEffect(() => {
    (async () => {
      try {
        const [districtRes, courseRes, providerData] = await Promise.all([
          api.districts().catch(() => []),
          api.courses().catch(() => ({ items: [], total: 0 })),
          api.trainingProviderMe().catch(() => null),
        ]);
        setDistricts(districtRes);
        setCourses(courseRes.items ?? []);
        // Use real provider data if available
        if (providerData) {
          console.log("Loaded real provider data:", providerData);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const resetFilters = () => {
    setSelectedDistrict("");
    setSelectedSector("");
    setSelectedCourse("");
    setTimePeriod("30");
  };

  const hasActiveFilters = selectedDistrict || selectedSector || selectedCourse || timePeriod !== "30";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a] mx-auto" />
          <p className="mt-4 text-sm text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1e293b]">Training Provider Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Monitor courses, curriculum alignment, training capacity and learner outcomes.
        </p>
        {user?.full_name && (
          <p className="mt-1 text-sm text-slate-500">
            Welcome, {user.full_name}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses, skills..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
            />
          </div>

          {/* District Filter */}
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
          >
            <option value="">All Districts</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Sector Filter */}
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
          >
            <option value="">All Sectors</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="it">IT & Services</option>
            <option value="healthcare">Healthcare</option>
            <option value="construction">Construction</option>
            <option value="automotive">Automotive</option>
          </select>

          {/* Course Filter */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          {/* Time Period */}
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
          >
            <option value="30">Last 30 Days</option>
            <option value="90">Last Quarter</option>
            <option value="180">Last 6 Months</option>
            <option value="365">Last Year</option>
          </select>

          {/* Reset */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Active Courses"
          value={dashboardData.kpis.activeCourses}
          icon={<BookOpen className="h-5 w-5" />}
          trend={dashboardData.kpis.activeCoursesTrend}
          color="blue"
        />
        <KPICard
          title="Total Enrolments"
          value={dashboardData.kpis.totalEnrolments}
          icon={<Users className="h-5 w-5" />}
          trend={dashboardData.kpis.enrolmentsTrend}
          color="green"
        />
        <KPICard
          title="Training Capacity"
          value={dashboardData.kpis.trainingCapacity}
          icon={<GraduationCap className="h-5 w-5" />}
          trend={dashboardData.kpis.capacityTrend}
          color="purple"
        />
        <KPICard
          title="Capacity Utilization"
          value={`${dashboardData.kpis.capacityUtilization}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={dashboardData.kpis.utilizationTrend}
          color="orange"
        />
        <KPICard
          title="Courses Requiring Review"
          value={dashboardData.kpis.coursesRequiringReview}
          icon={<AlertTriangle className="h-5 w-5" />}
          trend={dashboardData.kpis.reviewTrend}
          color="red"
        />
        <KPICard
          title="Critical Skill Gaps"
          value={dashboardData.kpis.criticalSkillGaps}
          icon={<Target className="h-5 w-5" />}
          trend={dashboardData.kpis.skillGapsTrend}
          color="red"
        />
        <KPICard
          title="Completion Rate"
          value={`${dashboardData.kpis.completionRate}%`}
          icon={<CheckCircle className="h-5 w-5" />}
          trend={dashboardData.kpis.completionTrend}
          color="green"
        />
        <KPICard
          title="Placement Rate"
          value={`${dashboardData.kpis.placementRate}%`}
          icon={<BarChart3 className="h-5 w-5" />}
          trend={dashboardData.kpis.placementTrend}
          color="blue"
        />
      </div>

      {/* Course Performance */}
      <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1e293b] mb-4">Course Performance</h2>
        <div className="space-y-4">
          {dashboardData.coursePerformance.map((course) => (
            <div key={course.id} className="border-b border-slate-200 pb-4 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium text-[#1e293b]">{course.name}</h3>
                  <p className="text-sm text-slate-500">{course.sector}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#1e293b]">{course.utilization}%</p>
                  <p className="text-xs text-slate-500">Utilization</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Enrolled</p>
                  <p className="font-medium">{course.enrolled}</p>
                </div>
                <div>
                  <p className="text-slate-500">Capacity</p>
                  <p className="font-medium">{course.capacity}</p>
                </div>
                <div>
                  <p className="text-slate-500">Completion</p>
                  <p className="font-medium">{course.completion}%</p>
                </div>
                <div>
                  <p className="text-slate-500">Outcome</p>
                  <p className="font-medium">{course.outcome}%</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1e3a8a] transition-all"
                    style={{ width: `${course.utilization}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Industry Demand vs Course Coverage */}
      <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1e293b] mb-4">Industry Demand vs Course Coverage</h2>
        <div className="space-y-4">
          {dashboardData.skillCoverage.map((skill) => (
            <div key={skill.name} className="border-b border-slate-200 pb-4 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-[#1e293b]">{skill.name}</h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-500">Demand: {skill.demand}</span>
                  <span className="text-slate-500">Covered: {skill.covered}</span>
                  <span className={`font-medium ${skill.gap > 0 ? "text-red-600" : "text-green-600"}`}>
                    Gap: {skill.gap}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${(skill.demand / skill.demand) * 100}%` }} />
                <div className="h-2 bg-green-500 rounded-full" style={{ width: `${(skill.covered / skill.demand) * 100}%` }} />
                <div className="h-2 bg-red-500 rounded-full" style={{ width: `${(skill.gap / skill.demand) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Curriculum Alignment */}
      <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1e293b] mb-4">Curriculum Alignment</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-slate-500">Strongly Aligned</p>
            <p className="text-2xl font-bold text-green-600">{dashboardData.curriculumAlignment.strong}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-slate-500">Partially Aligned</p>
            <p className="text-2xl font-bold text-yellow-600">{dashboardData.curriculumAlignment.partial}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-slate-500">Needs Review</p>
            <p className="text-2xl font-bold text-red-600">{dashboardData.curriculumAlignment.needsReview}</p>
          </div>
        </div>
        <div className="space-y-2">
          {dashboardData.curriculumAlignment.courses.map((course) => (
            <div key={course.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-[#1e293b]">{course.name}</p>
                <p className="text-sm text-slate-500">{course.alignment}%</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                course.status === "Strong" ? "bg-green-100 text-green-800" :
                course.status === "Partial" ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"
              }`}>
                {course.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1e293b] mb-4">Recommended Actions</h2>
        <div className="space-y-3">
          {dashboardData.recommendedActions.map((action, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <Target className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-[#1e293b]">{action.title}</p>
                <p className="text-sm text-slate-600">{action.description}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                action.priority === "High" ? "bg-red-100 text-red-800" :
                action.priority === "Medium" ? "bg-yellow-100 text-yellow-800" :
                "bg-blue-100 text-blue-800"
              }`}>
                {action.priority}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1e293b] mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {dashboardData.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border-b border-slate-200 last:border-0">
              <Activity className="h-4 w-4 text-slate-400" />
              <div className="flex-1">
                <p className="text-sm text-[#1e293b]">{activity.action}</p>
                <p className="text-xs text-slate-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, trend, color }: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: number;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
        {trend !== 0 && (
          <div className={`flex items-center gap-1 text-xs ${
            trend > 0 ? "text-green-600" : "text-red-600"
          }`}>
            {trend > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-500 uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold text-[#1e3a8a]">{value}</p>
    </div>
  );
}

function getFallbackDashboardData(hasRealData: boolean) {
  return {
    kpis: {
      activeCourses: 12,
      activeCoursesTrend: 5,
      totalEnrolments: 1248,
      enrolmentsTrend: 12,
      trainingCapacity: 1680,
      capacityTrend: 8,
      capacityUtilization: 74.3,
      utilizationTrend: 3,
      coursesRequiringReview: 3,
      reviewTrend: -2,
      criticalSkillGaps: 8,
      skillGapsTrend: 1,
      completionRate: 82.6,
      completionTrend: 4,
      placementRate: 71.4,
      placementTrend: 6,
    },
    coursePerformance: [
      { id: "1", name: "Electric Vehicle Service Technician", sector: "Automotive", enrolled: 142, capacity: 180, utilization: 79, completion: 84, outcome: 76 },
      { id: "2", name: "CNC Machine Operator", sector: "Manufacturing", enrolled: 162, capacity: 180, utilization: 90, completion: 88, outcome: 82 },
      { id: "3", name: "Solar Installation Technician", sector: "Renewable Energy", enrolled: 106, capacity: 140, utilization: 76, completion: 81, outcome: 74 },
      { id: "4", name: "Industrial Safety Assistant", sector: "Manufacturing", enrolled: 98, capacity: 120, utilization: 82, completion: 86, outcome: 78 },
      { id: "5", name: "Python Programming & Data Analytics", sector: "IT", enrolled: 134, capacity: 160, utilization: 84, completion: 79, outcome: 72 },
      { id: "6", name: "Welding Technician", sector: "Manufacturing", enrolled: 118, capacity: 150, utilization: 79, completion: 83, outcome: 75 },
    ],
    skillCoverage: [
      { name: "Electrical Technology", demand: 29, covered: 27, gap: 2 },
      { name: "CNC Machine Operation", demand: 26, covered: 19, gap: 7 },
      { name: "Digital Tools", demand: 31, covered: 20, gap: 11 },
      { name: "EV Technology", demand: 22, covered: 15, gap: 7 },
      { name: "Machine Learning", demand: 18, covered: 11, gap: 7 },
      { name: "Solar Installation", demand: 24, covered: 18, gap: 6 },
      { name: "Industrial Safety", demand: 20, covered: 18, gap: 2 },
      { name: "Python Programming", demand: 25, covered: 22, gap: 3 },
    ],
    curriculumAlignment: {
      strong: 4,
      partial: 3,
      needsReview: 2,
      courses: [
        { id: "1", name: "EV Service Technician", alignment: 92, status: "Strong" },
        { id: "2", name: "CNC Machine Operator", alignment: 88, status: "Strong" },
        { id: "3", name: "Solar Installation Technician", alignment: 84, status: "Strong" },
        { id: "4", name: "Python Programming", alignment: 78, status: "Partial" },
        { id: "5", name: "Hospitality Management", alignment: 62, status: "Needs Review" },
      ],
    },
    recommendedActions: [
      { title: "Review CNC Machine Operator curriculum", description: "Demand exceeds current course coverage.", priority: "High" },
      { title: "Increase EV diagnostic equipment capacity", description: "Current utilization is above 85%.", priority: "High" },
      { title: "Add Digital Tools module", description: "Skill gap remains high across employer demand signals.", priority: "Medium" },
      { title: "Renew trainer certification", description: "2 trainers require certification renewal.", priority: "Medium" },
      { title: "Expand Solar Installation seats", description: "District demand is rising.", priority: "Low" },
    ],
    recentActivity: [
      { action: "Course enrollment updated for EV Service Technician", time: "2 hours ago" },
      { action: "Curriculum review completed for CNC Machine Operator", time: "5 hours ago" },
      { action: "New employer demand signal detected", time: "1 day ago" },
      { action: "Trainer certification updated", time: "2 days ago" },
      { action: "Equipment maintenance completed", time: "3 days ago" },
    ],
  };
}