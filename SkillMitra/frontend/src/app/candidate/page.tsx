"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type District, type IndustrySector, type Course, type Skill, type JobPosting } from "@/lib/api";

export default function CandidateDashboard() {
  return (
    <ProtectedRoute allowedRoles={["candidate"]}>
      <CandidateDashboardContent />
    </ProtectedRoute>
  );
}

function CandidateDashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [districtRes, sectorRes, skillRes, courseRes, jobRes] = await Promise.all([
          api.districts().catch(() => []),
          api.sectors().catch(() => []),
          api.skills().catch(() => ({ items: [], total: 0 })),
          api.courses().catch(() => ({ items: [], total: 0 })),
          api.jobs().catch(() => ({ items: [], total: 0 })),
        ]);
        setDistricts(districtRes);
        setSectors(sectorRes);
        setSkills(skillRes.items ?? []);
        setCourses(courseRes.items ?? []);
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
            <p>SkillMitra Candidate Portal</p>
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
          <h1 className="text-3xl font-bold text-[#123b68]">Candidate Dashboard</h1>
          <p className="mt-2 text-slate-600">
            Welcome, {user?.full_name}. Explore career pathways, skill gaps, and training opportunities.
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
            {/* Career Pathways */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">Career Pathways</h2>
              <p className="mt-2 text-sm text-slate-600">
                Explore career paths based on industry demand and skill requirements.
              </p>
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  {sectors.length} industry sectors available for exploration
                </p>
              </div>
            </div>

            {/* Skill Gaps */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">Skill Gaps</h2>
              <p className="mt-2 text-sm text-slate-600">
                Identify skill gaps in your profile compared to industry requirements.
              </p>
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  {skills.length} skills tracked in the system
                </p>
              </div>
            </div>

            {/* Course Discovery */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">Available Courses</h2>
              <p className="mt-2 text-sm text-slate-600">
                Discover training courses aligned with industry demand.
              </p>
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  {courses.length} courses currently available
                </p>
              </div>
            </div>

            {/* Job Opportunities */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">Job Opportunities</h2>
              <p className="mt-2 text-sm text-slate-600">
                View labour-market openings and employer requirements.
              </p>
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  {jobs.length} active job postings
                </p>
              </div>
            </div>

            {/* District Planning */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">District Planning</h2>
              <p className="mt-2 text-sm text-slate-600">
                Access district-specific training and employment information.
              </p>
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  {districts.length} Maharashtra districts covered
                </p>
              </div>
            </div>

            {/* Profile */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">Your Profile</h2>
              <p className="mt-2 text-sm text-slate-600">
                Manage your candidate profile and preferences.
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