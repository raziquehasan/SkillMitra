"use client";

import { TrainingProviderShell } from "@/app/training-provider/TrainingProviderShell";
import { useState, useEffect } from "react";
import { api, type Course } from "@/lib/api";
import {
  BookOpen,
  Search,
  Filter,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Target,
  BarChart3,
  PieChart,
} from "lucide-react";

export default function CurriculumAlignment() {
  return (
    <TrainingProviderShell>
      <CurriculumAlignmentContent />
    </TrainingProviderShell>
  );
}

function CurriculumAlignmentContent() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [alignmentData, setAlignmentData] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseRes] = await Promise.all([
        api.courses().catch(() => ({ items: [], total: 0 })),
      ]);
      setCourses(courseRes.items || []);
      
      // Try to fetch real alignment data
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/government/course-alignment`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("skillmitra_access_token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setAlignmentData(data);
        } else {
          setAlignmentData(getFallbackAlignmentData());
        }
      } catch {
        setAlignmentData(getFallbackAlignmentData());
      }
    } catch (error) {
      console.error("Failed to fetch alignment data:", error);
      setAlignmentData(getFallbackAlignmentData());
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a] mx-auto" />
          <p className="mt-4 text-sm text-slate-600">Loading curriculum alignment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1e293b]">Curriculum Alignment</h1>
        <p className="mt-2 text-slate-600">
          Align your curriculum with industry skill requirements and identify gaps.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard title="Total Courses" value={courses.length} icon={<BookOpen className="h-5 w-5" />} />
        <KPICard title="Strongly Aligned" value={alignmentData?.alignment?.filter((a: any) => a.alignment_status === "ALIGNED").length || 4} icon={<CheckCircle className="h-5 w-5" />} />
        <KPICard title="Partially Aligned" value={alignmentData?.alignment?.filter((a: any) => a.alignment_status === "PARTIAL").length || 3} icon={<TrendingUp className="h-5 w-5" />} />
        <KPICard title="Needs Review" value={alignmentData?.alignment?.filter((a: any) => a.alignment_status === "NEEDS_REVIEW").length || 2} icon={<AlertTriangle className="h-5 w-5" />} />
      </div>

      {/* Course Filter */}
      <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
            />
          </div>
          <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]">
            <option value="">All Sectors</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="it">IT & Services</option>
            <option value="automotive">Automotive</option>
          </select>
        </div>
      </div>

      {/* Alignment Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Alignment Status
          </h2>
          <div className="flex items-center justify-center py-8">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="62.8" transform="rotate(-90 50 50)" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#eab308" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="188.4" transform="rotate(90 50 50)" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="226.08" transform="rotate(180 50 50)" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#1e3a8a]">78%</p>
                  <p className="text-xs text-slate-500">Avg Alignment</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-slate-600">Strong (44%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm text-slate-600">Partial (33%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-slate-600">Review (23%)</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Skill Coverage Analysis
          </h2>
          <div className="space-y-4">
            {alignmentData?.alignment?.slice(0, 5).map((item: any, index: number) => (
              <div key={index} className="border-b border-slate-200 pb-3 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-[#1e293b]">{item.course_title || `Course ${index + 1}`}</p>
                  <span className={`text-sm font-medium ${
                    item.alignment_status === "ALIGNED" ? "text-green-600" :
                    item.alignment_status === "PARTIAL" ? "text-yellow-600" :
                    "text-red-600"
                  }`}>
                    {item.alignment_status === "ALIGNED" ? "92%" :
                     item.alignment_status === "PARTIAL" ? "78%" :
                     "62%"}
                  </span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      item.alignment_status === "ALIGNED" ? "bg-green-500" :
                      item.alignment_status === "PARTIAL" ? "bg-yellow-500" :
                      "bg-red-500"
                    }`}
                    style={{ width: item.alignment_status === "ALIGNED" ? "92%" :
                                  item.alignment_status === "PARTIAL" ? "78%" :
                                  "62%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course Alignment Directory */}
      <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1e293b] mb-4">Course Alignment Directory</h2>
        <div className="space-y-3">
          {alignmentData?.alignment?.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex-1">
                <p className="font-medium text-[#1e293b]">{item.course_title || `Course ${index + 1}`}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                  <span>Skills: {item.skills_covered?.length || 8}</span>
                  <span>Gaps: {item.gaps?.length || 2}</span>
                  <span>Coverage: {item.skills_covered?.length || 8}/{item.skills_demanded?.length || 10}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded ${
                  item.alignment_status === "ALIGNED" ? "bg-green-100 text-green-800" :
                  item.alignment_status === "PARTIAL" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {item.alignment_status?.replace("_", " ") || "PARTIAL"}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  item.gaps?.length > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                }`}>
                  {item.gaps?.length > 0 ? "High Priority" : "Good"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skill Gaps */}
      <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1e293b] mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Priority Skill Gaps
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { skill: "Digital Tools", gap: 11, severity: "High" },
            { skill: "CNC Machine Operation", gap: 7, severity: "High" },
            { skill: "EV Technology", gap: 7, severity: "High" },
            { skill: "Machine Learning", gap: 7, severity: "High" },
            { skill: "Solar Installation", gap: 6, severity: "Medium" },
            { skill: "Industrial Safety", gap: 2, severity: "Low" },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-[#1e293b]">{item.skill}</p>
                <p className="text-sm text-slate-500">Gap: {item.gap} skills</p>
              </div>
              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                item.severity === "High" ? "bg-red-100 text-red-800" :
                item.severity === "Medium" ? "bg-yellow-100 text-yellow-800" :
                "bg-blue-100 text-blue-800"
              }`}>
                {item.severity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">{icon}</div>
        <p className="text-xs text-slate-500 uppercase tracking-wide">{title}</p>
      </div>
      <p className="text-2xl font-bold text-[#1e3a8a]">{value}</p>
    </div>
  );
}

function getFallbackAlignmentData() {
  return {
    alignment: [
      {
        course_id: "1",
        course_title: "EV Service Technician",
        alignment_status: "ALIGNED",
        skills_covered: ["Electrical Systems", "EV Diagnostics", "Battery Management", "Safety Protocols"],
        skills_demanded: ["Electrical Systems", "EV Diagnostics", "Battery Management", "Safety Protocols", "Software Updates"],
        gaps: ["Software Updates"],
      },
      {
        course_id: "2",
        course_title: "CNC Machine Operator",
        alignment_status: "ALIGNED",
        skills_covered: ["CNC Programming", "Machine Setup", "Quality Control", "Safety", "Maintenance"],
        skills_demanded: ["CNC Programming", "Machine Setup", "Quality Control", "Safety", "Maintenance"],
        gaps: [],
      },
      {
        course_id: "3",
        course_title: "Solar Installation Technician",
        alignment_status: "ALIGNED",
        skills_covered: ["Solar Panel Installation", "Electrical Wiring", "System Design", "Safety", "Troubleshooting"],
        skills_demanded: ["Solar Panel Installation", "Electrical Wiring", "System Design", "Safety", "Troubleshooting"],
        gaps: [],
      },
      {
        course_id: "4",
        course_title: "Python Programming",
        alignment_status: "PARTIAL",
        skills_covered: ["Python Basics", "Data Structures", "Algorithms", "Debugging"],
        skills_demanded: ["Python Basics", "Data Structures", "Algorithms", "Debugging", "Machine Learning", "Data Visualization"],
        gaps: ["Machine Learning", "Data Visualization"],
      },
      {
        course_id: "5",
        course_title: "Hospitality Management",
        alignment_status: "NEEDS_REVIEW",
        skills_covered: ["Customer Service", "Housekeeping", "Front Office"],
        skills_demanded: ["Customer Service", "Housekeeping", "Front Office", "Food Service", "Revenue Management", "Digital Booking Systems"],
        gaps: ["Food Service", "Revenue Management", "Digital Booking Systems"],
      },
    ],
  };
}