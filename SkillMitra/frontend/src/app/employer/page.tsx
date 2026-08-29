"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type District, type IndustrySector, type JobPosting } from "@/lib/api";

export default function EmployerDashboard() {
  return (
    <ProtectedRoute allowedRoles={["employer"]}>
      <EmployerDashboardContent />
    </ProtectedRoute>
  );
}

function EmployerDashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [districtRes, sectorRes, jobRes] = await Promise.all([
          api.districts().catch(() => []),
          api.sectors().catch(() => []),
          api.jobs().catch(() => ({ items: [], total: 0 })),
        ]);
        setDistricts(districtRes);
        setSectors(sectorRes);
        setJobs(jobRes.items ?? []);
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
            <p>SkillMitra Employer Portal</p>
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
          <h1 className="text-3xl font-bold text-[#123b68]">Employer Dashboard</h1>
          <p className="mt-2 text-slate-600">
            Welcome, {user?.full_name}. Post jobs, define skill requirements, and access labour-market insights.
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
            {/* Job Postings */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">Job Postings</h2>
              <p className="mt-2 text-sm text-slate-600">
                Manage job postings and track applications.
              </p>
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  Job posting management coming soon
                </p>
              </div>
            </div>

            {/* Skill Requirements */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">Skill Requirements</h2>
              <p className="mt-2 text-sm text-slate-600">
                Define skill requirements for your job roles.
              </p>
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  Skill requirement definition coming soon
                </p>
              </div>
            </div>

            {/* Labour Market Insights */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">Labour Market Insights</h2>
              <p className="mt-2 text-sm text-slate-600">
                Access industry demand and skill gap data.
              </p>
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  {sectors.length} industry sectors available
                </p>
              </div>
            </div>

            {/* Employer Validation */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">Employer Validation</h2>
              <p className="mt-2 text-sm text-slate-600">
                Participate in course and candidate validation.
              </p>
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  Validation features coming soon
                </p>
              </div>
            </div>

            {/* District Analysis */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">District Analysis</h2>
              <p className="mt-2 text-sm text-slate-600">
                View demand and capacity by district.
              </p>
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  {districts.length} Maharashtra districts covered
                </p>
              </div>
            </div>

            {/* Company Profile */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">Company Profile</h2>
              <p className="mt-2 text-sm text-slate-600">
                Manage your company information and verification status.
              </p>
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  Profile management coming soon
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}