"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import {
  BookOpen,
  Clock,
  MapPin,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ExternalLink,
  GraduationCap,
  Target,
  Briefcase,
  Building2,
} from "lucide-react";

interface CourseDetail {
  id: string;
  title: string;
  description: string | null;
  district_id: string | null;
  district_name: string | null;
  status: string | null;
  delivery_mode: string | null;
  duration_hours: number | null;
  training_level: string | null;
  qualification: string | null;
  nsqf_level: number | null;
  cost_category: string | null;
  course_url: string | null;
  provider_url: string | null;
  industry_sector_id: string | null;
  industry_sector_name: string | null;
}

interface CourseSkill {
  skill_id: string;
  skill_name: string;
  skill_description: string | null;
  proficiency_level: string | null;
  is_primary: boolean;
}

interface JobRole {
  id: string;
  title: string;
  open_postings_count: number;
}

interface CourseDemand {
  demand_level: string;
  demand_signals_count: number;
  relevant_job_postings_count: number;
  required_skills_count: number;
  explanation: string;
}

interface TrainingCentre {
  id: string;
  provider_name: string;
  district_name: string | null;
  sanctioned_seats: number;
  active_seats: number;
  utilized_seats: number;
  status: string;
}

interface CandidateSkillAlignment {
  matched_skills: CourseSkill[];
  missing_skills: CourseSkill[];
  proficiency_gaps: CourseSkill[];
  skill_match_percentage: number;
  total_course_skills: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [skills, setSkills] = useState<CourseSkill[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [candidateAlignment, setCandidateAlignment] = useState<CandidateSkillAlignment | null>(null);
  const [courseDemand, setCourseDemand] = useState<CourseDemand | null>(null);
  const [trainingCentres, setTrainingCentres] = useState<TrainingCentre[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchCourseDetail(params.id as string);
    }
  }, [params.id]);

  const fetchCourseDetail = async (courseId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch course details
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
        setSkills(skillsData.items || skillsData || []);
      }

      // Fetch related job roles
      const rolesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/job-roles`);
      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        setJobRoles(rolesData.items || rolesData || []);
      }

      // Fetch industry demand information
      try {
        const demandResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/demand`);
        if (demandResponse.ok) {
          const demandData = await demandResponse.json();
          setCourseDemand(demandData);
        }
      } catch (e) {
        console.log('Demand data not available:', e);
        setCourseDemand(null);
      }

      // Fetch training centres
      try {
        const centresResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/training-centres`);
        if (centresResponse.ok) {
          const centresData = await centresResponse.json();
          setTrainingCentres(centresData.items || centresData || []);
        }
      } catch (e) {
        console.log('Training centres data not available:', e);
        setTrainingCentres([]);
      }

      // Fetch candidate skill alignment if logged in
      if (user) {
        const alignmentResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${courseId}/candidate-alignment`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('skillmitra_access_token')}`,
            },
          }
        );
        if (alignmentResponse.ok) {
          const alignmentData = await alignmentResponse.json();
          setCandidateAlignment(alignmentData);
        }
      }
    } catch (err) {
      console.error('Failed to fetch course detail:', err);
      setError(err instanceof Error ? err.message : 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7fa] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#123b68] mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#f4f7fa] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#123b68] mb-2">Course Not Found</h1>
          <p className="text-slate-600 mb-6">{error || 'The requested course could not be found.'}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 bg-[#123b68] text-white px-6 py-3 rounded-lg hover:bg-[#0d2d52] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fa]">
      {/* Header */}
      <div className="bg-[#123b68] text-white">
        <div className="mx-auto max-w-7xl px-5 py-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                course.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-slate-500/20 text-slate-300'
              }`}>
                {course.status === 'active' ? 'Active' : course.status || 'Unknown Status'}
              </span>
              <h1 className="text-3xl font-bold">{course.title}</h1>
              {course.industry_sector_name && (
                <p className="mt-2 text-white/80">{course.industry_sector_name}</p>
              )}
            </div>
            {(course.course_url || course.provider_url) && (
              <a
                href={course.course_url || course.provider_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-[#123b68] px-6 py-3 rounded-lg hover:bg-white/90 transition-colors font-semibold"
              >
                <ExternalLink className="h-4 w-4" />
                View Original
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {course.description && (
              <section className="bg-white rounded-xl border p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[#123b68] mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Description
                </h2>
                <p className="text-slate-700 leading-relaxed">{course.description}</p>
              </section>
            )}

            {/* Course Details */}
            <section className="bg-white rounded-xl border p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#123b68] mb-4 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Course Details
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {course.duration_hours && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Duration</p>
                      <p className="font-semibold text-[#123b68]">{course.duration_hours} hours</p>
                    </div>
                  </div>
                )}
                {course.delivery_mode && (
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Delivery Mode</p>
                      <p className="font-semibold text-[#123b68] capitalize">{course.delivery_mode.replace('_', ' ')}</p>
                    </div>
                  </div>
                )}
                {course.training_level && (
                  <div className="flex items-start gap-3">
                    <GraduationCap className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Training Level</p>
                      <p className="font-semibold text-[#123b68]">{course.training_level}</p>
                    </div>
                  </div>
                )}
                {course.qualification && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Qualification</p>
                      <p className="font-semibold text-[#123b68]">{course.qualification}</p>
                    </div>
                  </div>
                )}
                {course.nsqf_level && (
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">NSQF Level</p>
                      <p className="font-semibold text-[#123b68]">Level {course.nsqf_level}</p>
                    </div>
                  </div>
                )}
                {course.cost_category && (
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Cost Category</p>
                      <p className="font-semibold text-[#123b68]">{course.cost_category}</p>
                    </div>
                  </div>
                )}
                {course.district_name && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Location</p>
                      <p className="font-semibold text-[#123b68]">{course.district_name}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Skills Taught */}
            <section className="bg-white rounded-xl border p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#123b68] mb-4 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Skills Taught
              </h2>
              {skills.length > 0 ? (
                <div className="space-y-3">
                  {skills.map((skill) => (
                    <div key={skill.skill_id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[#123b68]">{skill.skill_name}</p>
                          {skill.is_primary && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Primary</span>
                          )}
                        </div>
                        {skill.skill_description && (
                          <p className="text-sm text-slate-600 mt-1">{skill.skill_description}</p>
                        )}
                        {skill.proficiency_level && (
                          <p className="text-xs text-slate-500 mt-1">Proficiency: {skill.proficiency_level}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No mapped skills available for this course.</p>
              )}
            </section>

            {/* Related Job Roles */}
            {jobRoles.length > 0 && (
              <section className="bg-white rounded-xl border p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[#123b68] mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Related Job Roles
                </h2>
                <div className="space-y-3">
                  {jobRoles.map((role) => (
                    <div key={role.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-[#123b68]">{role.title}</p>
                        {role.open_postings_count > 0 && (
                          <p className="text-sm text-green-600">{role.open_postings_count} open job posting(s)</p>
                        )}
                      </div>
                      {role.open_postings_count > 0 && (
                        <button
                          onClick={() => router.push(`/candidate/jobs`)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                        >
                          View Jobs →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Industry Demand */}
            {courseDemand && (
              <section className="bg-white rounded-xl border p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[#123b68] mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Why This Course Matters
                </h2>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-slate-600">Industry Demand</p>
                      <p className="text-2xl font-bold text-[#123b68]">{courseDemand.demand_level}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-slate-600">Demand Signals</p>
                      <p className="text-2xl font-bold text-green-700">{courseDemand.demand_signals_count}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-slate-600">Open Job Postings</p>
                      <p className="text-2xl font-bold text-purple-700">{courseDemand.relevant_job_postings_count}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">{courseDemand.explanation}</p>
                </div>
              </section>
            )}

            {/* Training Centres */}
            <section className="bg-white rounded-xl border p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#123b68] mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Available Training Centres
              </h2>
              {trainingCentres.length > 0 ? (
                <div className="space-y-3">
                  {trainingCentres.map((centre) => (
                    <div key={centre.id} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-[#123b68]">{centre.provider_name}</p>
                          {centre.district_name && (
                            <p className="text-sm text-slate-600 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {centre.district_name}
                            </p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          centre.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {centre.status}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 md:grid-cols-3 text-sm">
                        <div>
                          <p className="text-slate-500">Sanctioned Seats</p>
                          <p className="font-semibold text-[#123b68]">{centre.sanctioned_seats}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Active Seats</p>
                          <p className="font-semibold text-green-700">{centre.active_seats}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Utilized Seats</p>
                          <p className="font-semibold text-blue-700">{centre.utilized_seats}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">Training centre information is not currently available for this course.</p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Candidate Skill Alignment */}
            {user ? (
              <section className="bg-white rounded-xl border p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#123b68] mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Your Skill Alignment
                </h2>
                {candidateAlignment ? (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-3xl font-bold text-[#123b68]">{candidateAlignment.skill_match_percentage}%</p>
                      <p className="text-sm text-slate-600">Skill Match</p>
                    </div>

                    {candidateAlignment.matched_skills.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-green-700 mb-2">Matched Skills</p>
                        <div className="space-y-2">
                          {candidateAlignment.matched_skills.map((skill) => (
                            <div key={skill.skill_id} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>{skill.skill_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {candidateAlignment.missing_skills.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-red-700 mb-2">Missing Skills</p>
                        <div className="space-y-2">
                          {candidateAlignment.missing_skills.map((skill) => (
                            <div key={skill.skill_id} className="flex items-center gap-2 text-sm">
                              <AlertCircle className="h-4 w-4 text-red-600" />
                              <span>{skill.skill_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {candidateAlignment.proficiency_gaps.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-amber-700 mb-2">Proficiency Gaps</p>
                        <div className="space-y-2">
                          {candidateAlignment.proficiency_gaps.map((skill) => (
                            <div key={skill.skill_id} className="flex items-center gap-2 text-sm">
                              <AlertCircle className="h-4 w-4 text-amber-600" />
                              <span>{skill.skill_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <p className="text-sm text-slate-600">
                        This course can help address <strong>{candidateAlignment.missing_skills.length + candidateAlignment.proficiency_gaps.length}</strong> skill(s) in your profile.
                      </p>
                    </div>

                    <button
                      onClick={() => router.push('/candidate/training')}
                      className="w-full bg-[#123b68] text-white py-3 rounded-lg hover:bg-[#0d2d52] transition-colors font-semibold"
                    >
                      Explore Training
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-slate-600 mb-4">Add your skills to see personalized course alignment.</p>
                    <button
                      onClick={() => router.push('/candidate/skills')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                    >
                      Add My Skills →
                    </button>
                  </div>
                )}
              </section>
            ) : (
              <section className="bg-white rounded-xl border p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#123b68] mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Your Skill Alignment
                </h2>
                <div className="text-center py-4">
                  <p className="text-sm text-slate-600 mb-4">Log in to see how this course matches your skills and career goals.</p>
                  <button
                    onClick={() => router.push('/login')}
                    className="w-full bg-[#123b68] text-white py-3 rounded-lg hover:bg-[#0d2d52] transition-colors font-semibold"
                  >
                    Login as Candidate
                  </button>
                </div>
              </section>
            )}

            {/* Course Actions */}
            <section className="bg-white rounded-xl border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#123b68] mb-4">Get Started</h2>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/candidate/training')}
                  className="w-full bg-[#123b68] text-white py-3 rounded-lg hover:bg-[#0d2d52] transition-colors font-semibold"
                >
                  Explore Training Options
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="w-full border border-[#123b68] text-[#123b68] py-3 rounded-lg hover:bg-[#123b68]/10 transition-colors font-semibold"
                >
                  Register as Candidate
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}