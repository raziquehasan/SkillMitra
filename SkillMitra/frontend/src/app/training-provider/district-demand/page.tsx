"use client";

import { TrainingProviderShell } from "@/app/training-provider/TrainingProviderShell";
import { useState } from "react";
import {
  MapPin,
  Building2,
  TrendingUp,
  Loader2,
} from "lucide-react";

export default function DistrictDemandPage() {
  return (
    <TrainingProviderShell>
      <DistrictDemandContent />
    </TrainingProviderShell>
  );
}

function DistrictDemandContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1e293b]">District Demand</h1>
        <p className="mt-2 text-slate-600">
          View district-level demand signals and plan training capacity accordingly.
        </p>
      </div>

      <div className="min-w-0 rounded-lg border border-slate-300 bg-white p-12 shadow-sm text-center overflow-hidden">
        <MapPin className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[#1e293b] mb-2">District Demand Analysis</h2>
        <p className="text-slate-600">
          This section will display district-wise demand data, training capacity gaps, and regional insights.
          Use this information to optimize your training center locations and capacity planning.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading district demand data...
        </div>
      </div>
    </div>
  );
}