"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';
import CandidateSidebar from "@/components/candidate/CandidateSidebar";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

function ProfileInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}



export default function CandidateProfilePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        setError(null);
        const [profileData, skillsData] = await Promise.all([
          api.candidateProfile(),
          api.candidateSkills()
        ]);
        setProfile(profileData);
        setSkills(skillsData);
        setEditForm({
          full_name: profileData.full_name || '',
          phone: profileData.phone || '',
          gender: profileData.gender || '',
          education_level: profileData.education_level || '',
          current_status: profileData.current_status || '',
        });
      } catch (err) {
        console.error("Failed to load profile data:", err);
        setError("Unable to load profile data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, router]);

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-slate-800">
      {/* Government Header */}
      <header className="fixed left-0 right-0 top-0 z-50 h-[72px] bg-[#123b68] text-white">
        <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-6 text-sm">
          <div className="flex items-center gap-3">
            <Image
              src="/maharashtra-gov-logo.png"
              alt="Government of Maharashtra"
              width={48}
              height={48}
              priority
              className="h-12 w-12 object-contain"
            />

            <div>
              <div className="font-semibold">
                Government of Maharashtra
              </div>

              <div className="text-[11px] text-blue-100">
                Skills, Employment, Entrepreneurship & Innovation Department
              </div>
            </div>
          </div>

          <div className="hidden font-semibold md:block">
            SkillMitra | Candidate Portal
          </div>
        </div>
      </header>

      {/* Orange Line */}
      <div className="fixed left-0 right-0 top-[72px] z-50 h-1 bg-[#c2410c]" />

      <div className="min-h-screen pt-[76px]">
        {/* Candidate Sidebar */}
        <CandidateSidebar />

        {/* Main Content */}
        <section className="min-w-0 lg:ml-72">
          {/* Page Header */}
          <div className="border-b border-slate-200 bg-white px-5 py-4 lg:px-8">
            <div className="mx-auto flex max-w-[1250px] items-center gap-4">
              <div className="relative h-14 w-14 shrink-0">
                <Image
                  src="/skillmitra-logo.png"
                  alt="SkillMitra"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  SkillMitra
                </p>

                <p className="font-semibold text-[#123b68]">
                  Candidate Profile
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">
            {/* Loading and Error States */}
            {authLoading || loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-slate-500">Loading profile...</p>
              </div>
            ) : error ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm text-amber-950">{error}</p>
              </div>
            ) : !isAuthenticated ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm text-slate-600">Please log in to view your profile.</p>
                <Link 
                  href="/login" 
                  className="mt-2 inline-block text-sm font-semibold text-[#123b68] hover:underline"
                >
                  Go to Login
                </Link>
              </div>
            ) : (
              <>
            {/* Intro */}
            <div className="mb-6">
              <p className="text-sm font-medium text-[#c2410c]">
                Candidate Information
              </p>

              <h1 className="mt-1 text-2xl font-bold text-[#123b68]">
                My Profile
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Manage your personal information, career profile and
                skills used by SkillMitra for job and training
                recommendations.
              </p>
            </div>

            {/* Profile Overview */}
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              {/* Main Profile Card */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500">Loading profile...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">{error}</p>
                  </div>
                ) : profile ? (
                  <>
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-2xl font-bold text-[#123b68]">
                          {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'C'}
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Candidate
                          </p>

                          <h2 className="mt-1 text-xl font-bold text-[#123b68]">
                            {profile.full_name || 'Candidate Name'}
                          </h2>

                          <p className="mt-1 text-sm text-slate-500">
                            {profile.education_level || 'Education Level'}
                          </p>

                          <span className="mt-2 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                            Profile Active
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="rounded-lg border border-[#123b68] px-4 py-2.5 text-sm font-semibold text-[#123b68] hover:bg-blue-50"
                      >
                        Edit Profile
                      </button>
                    </div>

                    {/* Edit Form Modal */}
                    {isEditing && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="rounded-lg bg-white p-6 shadow-xl max-w-md w-full mx-4">
                          <h3 className="text-lg font-bold text-[#123b68] mb-4">Edit Profile</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                              <input
                                type="text"
                                value={editForm.full_name || ''}
                                onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                                className="w-full border border-slate-300 rounded px-3 py-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                              <input
                                type="text"
                                value={editForm.phone || ''}
                                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                className="w-full border border-slate-300 rounded px-3 py-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                              <select
                                value={editForm.gender || ''}
                                onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                                className="w-full border border-slate-300 rounded px-3 py-2"
                              >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Education Level</label>
                              <input
                                type="text"
                                value={editForm.education_level || ''}
                                onChange={(e) => setEditForm({...editForm, education_level: e.target.value})}
                                className="w-full border border-slate-300 rounded px-3 py-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Current Status</label>
                              <input
                                type="text"
                                value={editForm.current_status || ''}
                                onChange={(e) => setEditForm({...editForm, current_status: e.target.value})}
                                className="w-full border border-slate-300 rounded px-3 py-2"
                              />
                            </div>
                          </div>
                          <div className="mt-6 flex gap-3 justify-end">
                            <button
                              type="button"
                              onClick={() => setIsEditing(false)}
                              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  setLoading(true);
                                  await api.updateCandidateProfile(editForm);
                                  const updatedProfile = await api.candidateProfile();
                                  setProfile(updatedProfile);
                                  setIsEditing(false);
                                } catch (err) {
                                  console.error("Failed to update profile:", err);
                                  setError("Failed to update profile. Please try again.");
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              className="px-4 py-2 text-sm font-semibold text-white bg-[#123b68] hover:bg-[#0c2d51] rounded"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-7 border-t border-slate-100 pt-6">
                      <h3 className="text-base font-bold text-[#123b68]">
                        Personal Information
                      </h3>

                      <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <ProfileInfo
                          label="Full Name"
                          value={profile.full_name || 'Not provided'}
                        />

                        <ProfileInfo
                          label="Email"
                          value={profile.email || 'Not provided'}
                        />

                        <ProfileInfo
                          label="Phone"
                          value={profile.phone || 'Not provided'}
                        />

                        <ProfileInfo
                          label="Gender"
                          value={profile.gender || 'Not provided'}
                        />

                        <ProfileInfo
                          label="Education Level"
                          value={profile.education_level || 'Not provided'}
                        />

                        <ProfileInfo
                          label="Current Status"
                          value={profile.current_status || 'Not provided'}
                        />

                        <ProfileInfo
                          label="Date of Birth"
                          value={profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not provided'}
                        />

                        <ProfileInfo
                          label="Gender"
                          value={profile.gender || 'Not provided'}
                        />
                      </div>
                    </div>

                    <div className="mt-7 border-t border-slate-100 pt-6">
                      <h3 className="text-base font-bold text-[#123b68]">
                        Career Information
                      </h3>

                      <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <ProfileInfo
                          label="Career Interests"
                          value={profile.career_interests?.length > 0 ? `${profile.career_interests.length} interests` : 'Not provided'}
                        />

                        <ProfileInfo
                          label="Education History"
                          value={profile.education_history?.length > 0 ? `${profile.education_history.length} records` : 'Not provided'}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No profile data available</p>
                  </div>
                )}
              </div>

              {/* Profile Completion */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Profile Intelligence
                </p>

                <h3 className="mt-2 text-lg font-bold text-[#123b68]">
                  Profile Completion
                </h3>

                <div className="mt-6 flex items-center justify-center">
                  <div className="flex h-36 w-36 items-center justify-center rounded-full border-[12px] border-blue-100">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-[#123b68]">
                        82%
                      </p>
                      <p className="text-xs text-slate-500">
                        Complete
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      Personal Information
                    </span>
                    <span className="font-semibold text-green-700">
                      Complete
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      Career Preferences
                    </span>
                    <span className="font-semibold text-green-700">
                      Complete
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      Skills
                    </span>
                    <span className="font-semibold text-green-700">
                      Complete
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      Resume
                    </span>
                    <span className="font-semibold text-amber-700">
                      Pending
                    </span>
                  </div>
                </div>

                <div className="mt-6 rounded-lg bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-[#123b68]">
                    Improve your profile
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Add your resume and keep your skills updated to
                    improve job recommendations.
                  </p>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-8">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#123b68]">
                    Current Skills
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Skills currently available in your candidate profile.
                  </p>
                </div>

                <Link
                  href="/candidate/skills"
                  className="text-sm font-semibold text-[#123b68] hover:underline"
                >
                  Manage Skills →
                </Link>
              </div>

              {loading ? (
                <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                  <p className="text-slate-500">Loading skills...</p>
                </div>
              ) : skills.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  {skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {skill.skill_id || 'Skill'}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {skill.verification_status || 'Unverified'}
                          </p>
                        </div>

                        <span className="text-sm font-bold text-[#123b68]">
                          {skill.source || 'Claimed'}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
                          {skill.proficiency_level_id || 'Proficiency Level'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500">
                    +
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-700">
                    No skills added yet
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Add skills to your profile to improve job recommendations.
                  </p>
                  <Link
                    href="/candidate/skills"
                    className="mt-4 inline-block rounded-lg bg-[#123b68] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#0e3155]"
                  >
                    Add Skills
                  </Link>
                </div>
              )}
            </div>

            {/* Career Intelligence */}
            <div className="mt-8">
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#123b68]">
                      Candidate Career Intelligence
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-[#123b68]">
                      Your profile is currently aligned with technology
                      roles.
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                      Based on your current skills, roles such as Software
                      Developer and Data Analyst can be explored. Improving
                      TypeScript, Cloud Computing and Advanced Excel can
                      strengthen your profile further.
                    </p>
                  </div>

                  <Link
                    href="/candidate/skill-gap"
                    className="shrink-0 rounded-lg bg-[#123b68] px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#0f3155]"
                  >
                    View Skill Gap
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Link
                href="/candidate/skills"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md"
              >
                <p className="font-semibold text-[#123b68]">
                  Update Skills
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Review and manage your current skill profile.
                </p>

                <span className="mt-4 inline-block text-sm font-semibold text-[#123b68]">
                  Manage Skills →
                </span>
              </Link>

              <Link
                href="/candidate/recommended-jobs"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md"
              >
                <p className="font-semibold text-[#123b68]">
                  Recommended Jobs
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Explore jobs matched with your profile and skills.
                </p>

                <span className="mt-4 inline-block text-sm font-semibold text-[#123b68]">
                  View Jobs →
                </span>
              </Link>

              <Link
                href="/candidate/training"
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md"
              >
                <p className="font-semibold text-[#123b68]">
                  Training & Courses
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Find courses aligned with your career skill gaps.
                </p>

                <span className="mt-4 inline-block text-sm font-semibold text-[#123b68]">
                  Explore Training →
                </span>
              </Link>
            </div>

            {/* Footer Note */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#123b68]">
                  ✦
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#123b68]">
                    SkillMitra Profile Intelligence
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Keep your personal information, career preferences and
                    skills updated so SkillMitra can provide more relevant
                    job and training recommendations.
                  </p>
                </div>
              </div>
            </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}