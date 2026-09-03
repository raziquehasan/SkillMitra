"use client";

import { TrainingProviderShell } from "@/app/training-provider/TrainingProviderShell";
import { useState, useEffect } from "react";
import { api, type Course } from "@/lib/api";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Users,
  GraduationCap,
  TrendingUp,
  Edit2,
  Eye,
  Loader2,
} from "lucide-react";

export default function MyCourses() {
  return (
    <TrainingProviderShell>
      <MyCoursesContent />
    </TrainingProviderShell>
  );
}

function MyCoursesContent() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.courses();
      setCourses(response.items || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      setCourses(getFallbackCourses());
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = !selectedSector || course.delivery_mode === selectedSector;
    const matchesStatus = !selectedStatus || course.status === selectedStatus;
    return matchesSearch && matchesSector && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a] mx-auto" />
          <p className="mt-4 text-sm text-slate-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1e293b]">My Courses</h1>
          <p className="mt-2 text-slate-600">
            Manage your training courses and curriculum.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1e3a8a] rounded-lg hover:bg-[#1e3a8a]/90 transition-colors">
          <Plus className="h-4 w-4" />
          Add Course
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard title="Total Courses" value={courses.length} icon={<BookOpen className="h-5 w-5" />} />
        <KPICard title="Active" value={courses.filter(c => c.status === "active").length} icon={<GraduationCap className="h-5 w-5" />} />
        <KPICard title="Upcoming" value={courses.filter(c => c.status === "upcoming").length} icon={<TrendingUp className="h-5 w-5" />} />
        <KPICard title="Total Enrolments" value={1248} icon={<Users className="h-5 w-5" />} />
      </div>

      {/* Filters */}
      <div className="min-w-0 rounded-lg border border-slate-300 bg-white p-4 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
            />
          </div>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
          >
            <option value="">All Sectors</option>
            <option value="classroom">Classroom</option>
            <option value="online">Online</option>
            <option value="hybrid">Hybrid</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Course List */}
      <div className="min-w-0 rounded-lg border border-slate-300 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
            <table data-wrapped="true" className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Course</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Sector</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Duration</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Capacity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Enrolled</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Utilization</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredCourses.map((course) => (
              <tr key={course.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <BookOpen className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1e293b]">{course.title}</p>
                      <p className="text-xs text-slate-500">{course.description?.substring(0, 50)}...</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{course.delivery_mode || "Classroom"}</td>
                <td className="px-4 py-3 text-sm text-slate-600">12 weeks</td>
                <td className="px-4 py-3 text-sm text-slate-600">180</td>
                <td className="px-4 py-3 text-sm text-slate-600">142</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#1e3a8a]" style={{ width: "79%" }} />
                    </div>
                    <span className="text-sm text-slate-600">79%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                    course.status === "active" ? "bg-green-100 text-green-800" :
                    course.status === "upcoming" ? "bg-blue-100 text-blue-800" :
                    "bg-slate-100 text-slate-800"
                  }`}>
                    {course.status || "Active"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg" title="View">
                      <Eye className="h-4 w-4 text-slate-600" />
                    </button>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg" title="Edit">
                      <Edit2 className="h-4 w-4 text-slate-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
          </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-300 bg-white p-4 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">{icon}</div>
        <p className="text-xs text-slate-500 uppercase tracking-wide">{title}</p>
      </div>
      <p className="text-2xl font-bold text-[#1e3a8a]">{value}</p>
    </div>
  );
}

function getFallbackCourses(): Course[] {
  return [
    { id: "1", title: "Electric Vehicle Service Technician", description: "Comprehensive EV repair and maintenance training", district_id: null, status: "active", delivery_mode: "classroom" },
    { id: "2", title: "CNC Machine Operator", description: "Precision machining and CNC operation skills", district_id: null, status: "active", delivery_mode: "classroom" },
    { id: "3", title: "Solar Installation Technician", description: "Solar panel installation and maintenance", district_id: null, status: "active", delivery_mode: "hybrid" },
    { id: "4", title: "Python Programming & Data Analytics", description: "Programming and data analysis with Python", district_id: null, status: "upcoming", delivery_mode: "online" },
    { id: "5", title: "Industrial Safety Assistant", description: "Workplace safety and compliance training", district_id: null, status: "active", delivery_mode: "classroom" },
    { id: "6", title: "Welding Technician", description: "Various welding techniques and safety", district_id: null, status: "active", delivery_mode: "classroom" },
  ];
}