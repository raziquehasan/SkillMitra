"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type District, type Course } from "@/lib/api";

export default function TrainingProviderDashboard() {
  return (
    <ProtectedRoute allowedRoles={["training_provider"]}>
      <TrainingProviderDashboardContent />
    </ProtectedRoute>
  );
}

function TrainingProviderDashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [districts, setDistricts] = useState<District[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [districtRes, courseRes] = await Promise.all([
          api.districts().catch(() => []),
          api.courses().catch(() => ({ items: [], total: 0 })),
        ]);
        setDistricts(districtRes);
        setCourses(courseRes.items ?? []);
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
            <p>SkillMitra Training Provider Portal</p>
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
          <h1 className="text-3xl font-bold text-[#123b68]">Training Provider Dashboard</h1>
          <p className="mt-2 text-slate-600">
            Welcome, {user?.full_name}. Manage courses, curriculum, and training capacity.
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
            {/* Course Management */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">Course Management</h2>
              <p className="mt-2 text-sm text-slate-600">
                Manage your training courses and curriculum.
              </p>
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  {courses.length} courses in the system
                </p>
              </div>
            </div>

            {/* Curriculum Alignment */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">Curriculum Alignment</h2>
              <p className="mt-2 text-sm text-slate-600">
                Align curriculum with industry skill requirements.
              </p>
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  Curriculum alignment tools coming soon
                </p>
              </div>
            </div>

            {/* Training Capacity */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">Training Capacity</h2>
              <p className="mt-2 text-sm text-slate-600">
                Manage trainer capacity, equipment, and seat availability.
              </p>
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  Capacity management coming soon
                </p>
              </div>
            </div>

            {/* Demand Analysis */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">Demand Analysis</h2>
              <p className="mt-2 text-sm text-slate-600">
                View industry demand and skill gap data for planning.
              </p>
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  Demand-linked planning coming soon
                </p>
              </div>
            </div>

            {/* District Planning */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">District Planning</h2>
              <p className="mt-2 text-sm text-slate-600">
                Access district-specific training demand and capacity data.
              </p>
              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  {districts.length} Maharashtra districts covered
                </p>
              </div>
            </div>

            {/* Institute Profile */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#123b68]">Institute Profile</h2>
              <p className="mt-2 text-sm text-slate-600">
                Manage your training institute profile and certifications.
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