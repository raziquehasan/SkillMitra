"use client";

import { TrainingProviderShell } from "@/app/training-provider/TrainingProviderShell";
import { useState } from "react";
import {
  BarChart3,
  FileText,
  Download,
  Filter,
  Calendar,
  Loader2,
  Search,
  CheckCircle,
  Clock,
} from "lucide-react";

export default function ReportsPage() {
  return (
    <TrainingProviderShell>
      <ReportsContent />
    </TrainingProviderShell>
  );
}

function ReportsContent() {
  const reports = [
    {
      id: "1",
      name: "District Skill Gap Report",
      description: "Analysis of skill gaps in your district with recommendations",
      type: "Strategic",
      lastGenerated: "2024-01-15",
      status: "ready",
    },
    {
      id: "2",
      name: "Industry Demand Report",
      description: "Current industry demand signals and trends",
      type: "Market Intelligence",
      lastGenerated: "2024-01-10",
      status: "ready",
    },
    {
      id: "3",
      name: "Training Capacity Report",
      description: "Current training capacity and utilization analysis",
      type: "Operational",
      lastGenerated: "2024-01-08",
      status: "ready",
    },
    {
      id: "4",
      name: "Course Alignment Report",
      description: "Curriculum alignment with industry requirements",
      type: "Quality",
      lastGenerated: "2024-01-05",
      status: "ready",
    },
    {
      id: "5",
      name: "Placement Outcome Report",
      description: "Learner placement and employment outcomes",
      type: "Impact",
      lastGenerated: "2024-01-01",
      status: "ready",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1e293b]">Reports & Analytics</h1>
        <p className="mt-2 text-slate-600">
          Generate and view comprehensive reports on training operations and outcomes.
        </p>
      </div>

      {/* Report Filters */}
      <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
            />
          </div>
          <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]">
            <option value="">All Types</option>
            <option value="strategic">Strategic</option>
            <option value="operational">Operational</option>
            <option value="quality">Quality</option>
            <option value="impact">Impact</option>
          </select>
          <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]">
            <option value="">All Time Periods</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last Quarter</option>
            <option value="180">Last 6 Months</option>
            <option value="365">Last Year</option>
          </select>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            <Filter className="h-4 w-4" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard title="Total Reports" value={reports.length} icon={<FileText className="h-5 w-5" />} color="blue" />
        <KPICard title="Ready to Generate" value={reports.filter(r => r.status === "ready").length} icon={<CheckCircle className="h-5 w-5" />} color="green" />
        <KPICard title="Generated This Month" value={3} icon={<Calendar className="h-5 w-5" />} color="purple" />
        <KPICard title="Scheduled Reports" value={2} icon={<Clock className="h-5 w-5" />} color="orange" />
      </div>

      {/* Reports Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <div key={report.id} className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs text-slate-500">{report.type}</span>
            </div>
            <h3 className="font-semibold text-[#1e293b] mb-2">{report.name}</h3>
            <p className="text-sm text-slate-600 mb-4">{report.description}</p>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
              <span>Last generated: {report.lastGenerated}</span>
              <span className="inline-flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                Ready
              </span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-[#1e3a8a] border border-[#1e3a8a] rounded-lg hover:bg-[#1e3a8a]/5 transition-colors">
                <Download className="h-4 w-4" />
                Generate
              </button>
              <button className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1e293b] mb-4">Recent Report Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#1e293b]">District Skill Gap Report generated</p>
              <p className="text-xs text-slate-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#1e293b]">Training Capacity Report generated</p>
              <p className="text-xs text-slate-500">1 day ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#1e293b]">Placement Outcome Report scheduled</p>
              <p className="text-xs text-slate-500">3 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, color }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
      <p className="text-xs text-slate-500 uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold text-[#1e3a8a]">{value}</p>
    </div>
  );
}