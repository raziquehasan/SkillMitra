"use client";

import { TrainingProviderShell } from "@/app/training-provider/TrainingProviderShell";
import { useState } from "react";
import {
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  Loader2,
} from "lucide-react";

export default function AssessmentsPage() {
  return (
    <TrainingProviderShell>
      <AssessmentsContent />
    </TrainingProviderShell>
  );
}

function AssessmentsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1e293b]">Assessments & Outcomes</h1>
        <p className="mt-2 text-slate-600">
          Track assessments, certifications, and learner outcomes.
        </p>
      </div>

      <div className="rounded-lg border border-slate-300 bg-white p-12 shadow-sm text-center">
        <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[#1e293b] mb-2">Assessment Management</h2>
        <p className="text-slate-600">
          This section will display assessment schedules, results, certification outcomes, and placement data.
          Monitor learner performance and training effectiveness.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading assessment data...
        </div>
      </div>
    </div>
  );
}