"use client";

import { GovernmentShell } from "@/app/government/GovernmentShell";

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function CandidatesPage() {
  return (
    <GovernmentShell>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#123b68]">Candidates Page</h1>
        <p className="mt-4 text-slate-600">This page is temporarily under maintenance while we fix build issues.</p>
        <p className="mt-2 text-slate-500">Please check back later.</p>
      </div>
    </GovernmentShell>
  );
}