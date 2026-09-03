"use client";

import { TrainingProviderShell } from "@/app/training-provider/TrainingProviderShell";

export default function TrainingSchedule() {
  return (
    <TrainingProviderShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1e293b]">Training Schedule</h1>
          <p className="mt-2 text-slate-600">Manage training schedules and batch allocations.</p>
        </div>
        <div className="min-w-0 rounded-lg border border-slate-300 bg-white p-12 shadow-sm text-center overflow-hidden">
          <p className="text-slate-500">Training schedule management coming soon.</p>
        </div>
      </div>
    </TrainingProviderShell>
  );
}