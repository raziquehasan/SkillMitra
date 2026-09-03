"use client";

import { TrainingProviderShell } from "@/app/training-provider/TrainingProviderShell";
import { useState } from "react";
import {
  Users,
  UserPlus,
  Filter,
  Search,
  Loader2,
} from "lucide-react";

export default function EnrollmentsPage() {
  return (
    <TrainingProviderShell>
      <EnrollmentsContent />
    </TrainingProviderShell>
  );
}

function EnrollmentsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1e293b]">Enrollments</h1>
        <p className="mt-2 text-slate-600">
          Manage candidate enrollments and track learner progress.
        </p>
      </div>

      <div className="min-w-0 rounded-lg border border-slate-300 bg-white p-12 shadow-sm text-center overflow-hidden">
        <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[#1e293b] mb-2">Enrollment Management</h2>
        <p className="text-slate-600">
          This section will display enrollment data, learner progress, and completion tracking.
          Manage your enrolled candidates and monitor their training journey.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading enrollment data...
        </div>
      </div>
    </div>
  );
}