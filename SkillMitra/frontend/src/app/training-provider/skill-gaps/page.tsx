"use client";

import { TrainingProviderShell } from "@/app/training-provider/TrainingProviderShell";
import { useState } from "react";
import {
  Target,
  AlertTriangle,
  TrendingUp,
  Loader2,
} from "lucide-react";

export default function SkillGapsPage() {
  return (
    <TrainingProviderShell>
      <SkillGapsContent />
    </TrainingProviderShell>
  );
}

function SkillGapsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1e293b]">Skill Gaps</h1>
        <p className="mt-2 text-slate-600">
          Identify skill gaps between industry demand and your training coverage.
        </p>
      </div>

      <div className="min-w-0 rounded-lg border border-slate-300 bg-white p-12 shadow-sm text-center overflow-hidden">
        <Target className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[#1e293b] mb-2">Skill Gap Analysis</h2>
        <p className="text-slate-600">
          This section will display critical skill gaps, affected courses, and recommended interventions.
          Use this analysis to prioritize curriculum updates and new course development.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading skill gap data...
        </div>
      </div>
    </div>
  );
}