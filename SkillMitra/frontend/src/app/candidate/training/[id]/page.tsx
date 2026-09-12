"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function CandidateCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [trainingCentres, setTrainingCentres] = useState<any[]>([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState<'enrolled' | 'completed' | 'none'>('none');
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadCourseData(params.id as string);
    }
  }, [params.id]);

  const loadCourseData = async (courseId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch course details using the courses API
      const courseResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}`);
      if (!courseResponse.ok) {
        throw new Error('Course not found');
      }
      const courseData = await courseResponse.json();
      setCourse(courseData);

      // Fetch course skills
      const skillsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/skills`);
      if (skillsResponse.ok) {
        const skillsData = await skillsResponse.json();
        setSkills(skillsData);
      }

      // Fetch training centres
      const centresResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/training-centres`);
      if (centresResponse.ok) {
        const centresData = await centresResponse.json();
        setTrainingCentres(centresData);
      }

      // Check enrollment status if authenticated
      if (isAuthenticated) {
        const enrollments = await api.candidateEnrollments();
        const existingEnrollment = enrollments.find((e: any) => e.course_id === courseId);
        if (existingEnrollment) {
          setEnrollmentStatus(existingEnrollment.status === 'completed' ? 'completed' : 'enrolled');
        }
      }
    } catch (err) {
      console.error('Failed to load course data:', err);
      setError('Unable to load course details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyForCourse = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!course?.id) return;

    try {
      setIsApplying(true);
      setError(null);
      setSuccessMessage(null);

      await api.enrollInCourse(course.id);
      setEnrollmentStatus('enrolled');
      setSuccessMessage('Successfully enrolled in the course!');
    } catch (err) {
      console.error('Failed to enroll in course:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unable to enroll in course. Please try again.';
      
      if (errorMessage.includes('Already enrolled') || errorMessage.includes('Already completed')) {
        setEnrollmentStatus('enrolled');
        setSuccessMessage('You are already enrolled in this course.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7fa] text-slate-800">
        <div className="fixed left-0 right-0 top-0 z-50 h-[72px] bg-[#123b68] text-white">
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
                <div className="font-semibold">Government of Maharashtra</div>
                <div className="text-[11px] text-blue-100">
                  Skills, Employment, Entrepreneurship & Innovation Department
                </div>
              </div>
            </div>
            <div className="hidden font-semibold md:block">SkillMitra | Candidate Portal</div>
          </div>
        </div>
        <div className="fixed left-0 right-0 top-[72px] z-50 h-1 bg-[#c2410c]" />
        <div className="min-h-screen pt-[76px]">
          <CandidateSidebar />
          <section className="min-w-0 lg:ml-72">
            <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#123b68]"></div>
                <p className="ml-4 text-slate-600">Loading course details...</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (error && !course) {
    return (
      <main className="min-h-screen bg-[#f4f7fa] text-slate-800">
        <div className="fixed left-0 right-0 top-0 z-50 h-[72px] bg-[#123b68] text-white">
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
                <div className="font-semibold">Government of Maharashtra</div>
                <div className="text-[11px] text-blue-100">
                  Skills, Employment, Entrepreneurship & Innovation Department
                </div>
              </div>
            </div>
            <div className="hidden font-semibold md:block">SkillMitra | Candidate Portal</div>
          </div>
        </div>
        <div className="fixed left-0 right-0 top-[72px] z-50 h-1 bg-[#c2410c]" />
        <div className="min-h-screen pt-[76px]">
          <CandidateSidebar />
          <section className="min-w-0 lg:ml-72">
            <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">
              <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm">
                <p className="text-red-700">{error}</p>
                <Link
                  href="/candidate/training"
                  className="mt-4 inline-block rounded-lg bg-[#123b68] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f3155]"
                >
                  Back to Training
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

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
              <div className="font-semibold">Government of Maharashtra</div>
              <div className="text-[11px] text-blue-100">
                Skills, Employment, Entrepreneurship & Innovation Department
              </div>
            </div>
          </div>
          <div className="hidden font-semibold md:block">SkillMitra | Candidate Portal</div>
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
                <p className="text-xs text-slate-400">SkillMitra</p>
                <p className="font-semibold text-[#123b68]">Course Details</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">
            {/* Success/Error Messages */}
            {successMessage && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-6 py-4 shadow-sm">
                <p className="text-sm font-semibold text-green-800">{successMessage}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-6 py-4 shadow-sm">
                <p className="text-sm font-semibold text-red-800">{error}</p>
              </div>
            )}

            {/* Back Button */}
            <div className="mb-6">
              <Link
                href="/candidate/training"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#123b68] hover:underline"
              >
                ← Back to Training & Courses
              </Link>
            </div>

            {course && (
              <>
                {/* Course Header */}
                <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          course.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {course.status === 'active' ? 'Active' : course.status || 'Unknown'}
                        </span>
                        {course.delivery_mode && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                            {course.delivery_mode.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <h1 className="text-2xl font-bold text-[#123b68]">{course.title}</h1>
                      {course.description && (
                        <p className="mt-2 text-sm text-slate-600">{course.description}</p>
                      )}
                    </div>

                    {/* Apply Button */}
                    <div className="flex flex-col gap-2">
                      {enrollmentStatus === 'enrolled' ? (
                        <Link
                          href="/candidate/learning"
                          className="rounded-lg bg-green-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-green-700"
                        >
                          Continue Learning
                        </Link>
                      ) : enrollmentStatus === 'completed' ? (
                        <button
                          disabled
                          className="rounded-lg bg-slate-300 px-6 py-3 text-center text-sm font-semibold text-slate-600 cursor-not-allowed"
                        >
                          Completed
                        </button>
                      ) : (
                        <button
                          onClick={handleApplyForCourse}
                          disabled={isApplying}
                          className="rounded-lg bg-[#123b68] px-6 py-3 text-center text-sm font-semibold text-white hover:bg-[#0f3155] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isApplying ? 'Applying...' : 'Apply for Course'}
                        </button>
                      )}
                      
                      {!isAuthenticated && (
                        <p className="text-xs text-slate-500 text-center">
                          <Link href="/login" className="text-[#123b68] hover:underline">Log in</Link> to apply
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Course Details Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Course Information */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h2 className="text-lg font-bold text-[#123b68] mb-4">Course Information</h2>
                      <div className="grid gap-4 md:grid-cols-2">
                        {course.duration_hours && (
                          <div className="rounded-lg bg-slate-50 p-4">
                            <p className="text-xs text-slate-400">Duration</p>
                            <p className="mt-1 text-sm font-semibold text-slate-700">{course.duration_hours} hours</p>
                          </div>
                        )}
                        {course.training_level && (
                          <div className="rounded-lg bg-slate-50 p-4">
                            <p className="text-xs text-slate-400">Training Level</p>
                            <p className="mt-1 text-sm font-semibold text-slate-700">{course.training_level}</p>
                          </div>
                        )}
                        {course.qualification && (
                          <div className="rounded-lg bg-slate-50 p-4">
                            <p className="text-xs text-slate-400">Qualification</p>
                            <p className="mt-1 text-sm font-semibold text-slate-700">{course.qualification}</p>
                          </div>
                        )}
                        {course.nsqf_level && (
                          <div className="rounded-lg bg-slate-50 p-4">
                            <p className="text-xs text-slate-400">NSQF Level</p>
                            <p className="mt-1 text-sm font-semibold text-slate-700">Level {course.nsqf_level}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Skills Covered */}
                    {skills.length > 0 && (
                      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-[#123b68] mb-4">Skills Covered</h2>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill) => (
                            <span
                              key={skill.skill_id}
                              className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-[#123b68]"
                            >
                              {skill.skill_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Training Centres */}
                    {trainingCentres.length > 0 && (
                      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-[#123b68] mb-4">Available Training Centres</h2>
                        <div className="space-y-3">
                          {trainingCentres.map((centre) => (
                            <div key={centre.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-semibold text-slate-800">{centre.provider_name}</p>
                                  {centre.district_name && (
                                    <p className="text-xs text-slate-500 mt-1">{centre.district_name}</p>
                                  )}
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  centre.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {centre.status}
                                </span>
                              </div>
                              <div className="mt-3 grid gap-2 md:grid-cols-3 text-xs">
                                <div>
                                  <p className="text-slate-400">Sanctioned Seats</p>
                                  <p className="font-semibold text-[#123b68]">{centre.sanctioned_seats}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400">Active Seats</p>
                                  <p className="font-semibold text-green-700">{centre.active_seats}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400">Utilized Seats</p>
                                  <p className="font-semibold text-blue-700">{centre.utilized_seats}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Course Links */}
                    {(course.course_url || course.provider_url) && (
                      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-[#123b68] mb-4">Course Links</h2>
                        <div className="space-y-3">
                          {course.course_url && (
                            <a
                              href={course.course_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block rounded-lg border border-[#123b68] px-4 py-3 text-center text-sm font-semibold text-[#123b68] hover:bg-blue-50"
                            >
                              View Course Website
                            </a>
                          )}
                          {course.provider_url && (
                            <a
                              href={course.provider_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block rounded-lg border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50"
                            >
                              View Provider Website
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h2 className="text-lg font-bold text-[#123b68] mb-4">Quick Actions</h2>
                      <div className="space-y-3">
                        <Link
                          href="/candidate/learning"
                          className="block rounded-lg border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          View My Learning
                        </Link>
                        <Link
                          href="/candidate/skill-gap"
                          className="block rounded-lg border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          View Skill Gap
                        </Link>
                      </div>
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