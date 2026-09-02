"use client";

import { TrainingProviderShell } from "@/app/training-provider/TrainingProviderShell";
import { useState } from "react";
import {
  TrendingUp,
  Factory,
  BarChart3,
  Loader2,
} from "lucide-react";

export default function IndustryDemandPage() {
  return (
    <TrainingProviderShell>
      <IndustryDemandContent />
    </TrainingProviderShell>
  );
}

function IndustryDemandContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1e293b]">Industry Demand</h1>
        <p className="mt-2 text-slate-600">
          Understand industry skill demand signals and plan your training programs accordingly.
        </p>
      </div>

      <div className="rounded-lg border border-slate-300 bg-white p-12 shadow-sm text-center">
        <Factory className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[#1e293b] mb-2">Industry Demand Analysis</h2>
        <p className="text-slate-600">
          This section will display real-time industry demand data, skill gaps, and employer signals.
          The dashboard will help you align your training programs with market needs.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading demand data...
        </div>
      </div>
    </div>
  );
}