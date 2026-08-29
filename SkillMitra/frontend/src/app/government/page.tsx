"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type District, type IndustrySector, type IndustryDemand } from "@/lib/api";

export default function GovernmentDashboard() {
  return (
    <ProtectedRoute allowedRoles={["government_official", "government_admin"]}>
      <GovernmentDashboardContent />
    </ProtectedRoute>
  );
}

function GovernmentDashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [industryDemand, setIndustryDemand] = useState<IndustryDemand[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.roles.includes("government_admin");

  useEffect(() => {
    (async () => {
      try {
        const [districtRes, sectorRes, demandRes] = await Promise.all([
          api.districts().catch(() => []),
          api.sectors().catch(() => []),
          api.demandIndustries().catch(() => []),
        ]);
        setDistricts(districtRes);
        setSectors(sectorRes);
        setIndustryDemand(demandRes);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="min-h-screen bg-[#f4f7fa]">
      {/* Government Header */}
      <div className="bg-[#123b68] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2 text-sm">
          <div className="flex items-center gap-3">
            <p>Government of Maharashtra</p>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">Skills, Employment, Entrepreneurship & Innovation Department</span>
          </div>
          <div className="flex items-center gap-4">
            <p>
              SkillMitra {isAdmin ? "Admin" : "Official"} Portal
            </p>
            <button
              onClick={async () => {
                await logout();
                router.push('/');
              }}
              className="text-sm hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="h-1 bg-[#c2410c]" />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#123b68]">
            {isAdmin ? "Government Admin Dashboard" : "Government Official Dashboard"}
          </h1>
          <p className="mt-2 text-slate-600">
            Welcome, {user?.full_name}. Access labour-market intelligence and planning tools.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#123b68] border-r-transparent"></div>
              <p className="mt-4 text-sm text-slate-600">Loading your dashboard...</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Labour Market Intelligence */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">Labour Market Intelligence</h2>
              <p className="mt-2 text-sm text-slate-600">
                Comprehensive labour-market data and demand analysis.
              </p>
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  {industryDemand.length} demand signals recorded
                </p>
              </div>
            </div>

            {/* District Planning */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">District Planning</h2>
              <p className="mt-2 text-sm text-slate-600">
                District-level training planning and resource allocation.
              </p>
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  {districts.length} Maharashtra districts covered
                </p>
              </div>
            </div>

            {/* Industry Demand */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">Industry Demand</h2>
              <p className="mt-2 text-sm text-slate-600">
                Industry-sector demand and emerging job roles.
              </p>
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  {sectors.length} industry sectors tracked
                </p>
              </div>
            </div>

            {/* Skill Gaps */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">Skill Gaps</h2>
              <p className="mt-2 text-sm text-slate-600">
                Identify skill gaps and training priorities.
              </p>
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  Skill gap analysis tools
                </p>
              </div>
            </div>

            {/* Course Alignment */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">Course Alignment</h2>
              <p className="mt-2 text-sm text-slate-600">
                Curriculum alignment with industry requirements.
              </p>
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  Course alignment analysis
                </p>
              </div>
            </div>

            {/* Training Capacity */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">Training Capacity</h2>
              <p className="mt-2 text-sm text-slate-600">
                Training provider capacity and infrastructure analysis.
              </p>
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  Capacity planning tools
                </p>
              </div>
            </div>

            {/* Employer Validation */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">Employer Validation</h2>
              <p className="mt-2 text-sm text-slate-600">
                Employer participation in course and candidate validation.
              </p>
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  Validation data and insights
                </p>
              </div>
            </div>

            {/* Planning Insights */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">Planning Insights</h2>
              <p className="mt-2 text-sm text-slate-600">
                Data-driven insights for policy and programme decisions.
              </p>
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  Planning analytics coming soon
                </p>
              </div>
            </div>

            {/* Admin Functions */}
            {isAdmin && (
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-[#123b68]">Admin Functions</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Government official approval and system administration.
                </p>
                <div className="mt-4">
                  <p className="text-sm text-slate-500">
                    Official approval workflow
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}