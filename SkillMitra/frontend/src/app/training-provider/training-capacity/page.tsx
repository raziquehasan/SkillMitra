"use client";

import { TrainingProviderShell } from "@/app/training-provider/TrainingProviderShell";
import { useState } from "react";
import {
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Loader2,
} from "lucide-react";

export default function TrainingCapacity() {
  return (
    <TrainingProviderShell>
      <TrainingCapacityContent />
    </TrainingProviderShell>
  );
}

function TrainingCapacityContent() {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e3a8a] mx-auto" />
          <p className="mt-4 text-sm text-slate-600">Loading capacity data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1e293b]">Training Capacity</h1>
        <p className="mt-2 text-slate-600">
          Monitor training capacity, utilization, and infrastructure readiness.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KPICard title="Total Capacity" value="1,680" icon={<Users className="h-5 w-5" />} />
        <KPICard title="Occupied Seats" value="1,248" icon={<CheckCircle className="h-5 w-5" />} />
        <KPICard title="Available Seats" value="432" icon={<TrendingUp className="h-5 w-5" />} />
        <KPICard title="Utilization" value="74.3%" icon={<BarChart3 className="h-5 w-5" />} />
      </div>

      <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1e293b] mb-4">Capacity by Course</h2>
        <div className="space-y-4">
          {[
            { course: "CNC Machine Operator", capacity: 180, enrolled: 162, available: 18, utilization: 90 },
            { course: "EV Service Technician", capacity: 140, enrolled: 106, available: 34, utilization: 76 },
            { course: "Solar Installation", capacity: 160, enrolled: 124, available: 36, utilization: 78 },
            { course: "Python Programming", capacity: 120, enrolled: 98, available: 22, utilization: 82 },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-[#1e293b]">{item.course}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                  <span>Capacity: {item.capacity}</span>
                  <span>Enrolled: {item.enrolled}</span>
                  <span>Available: {item.available}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1e3a8a]" style={{ width: `${item.utilization}%` }} />
                </div>
                <span className="text-sm font-medium text-[#1e3a8a]">{item.utilization}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
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