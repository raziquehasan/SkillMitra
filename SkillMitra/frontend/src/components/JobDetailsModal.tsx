"use client";

import { useState, useEffect } from "react";
import { api, type JobPosting } from "@/lib/api";

interface JobDetailsModalProps {
  job: JobPosting;
  onClose: () => void;
  onApplySuccess: () => void;
}

export function JobDetailsModal({ job, onClose, onApplySuccess }: JobDetailsModalProps) {
  const [relatedCourses, setRelatedCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    const loadRelatedCourses = async () => {
      try {
        setLoadingCourses(true);
        const courses = await api.jobRelatedCourses(job.id);
        setRelatedCourses(courses);
      } catch (error) {
        console.error("Failed to load related courses:", error);
      } finally {
        setLoadingCourses(false);
      }
    };

    loadRelatedCourses();
  }, [job.id]);

  const handleApply = async () => {
    try {
      setApplying(true);
      setApplyError(null);
      await api.applyToJob({ job_posting_id: job.id });
      setApplySuccess(true);
      setTimeout(() => {
        onApplySuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Failed to apply:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply. Please try again.';
      if (errorMessage.includes('Already applied')) {
        setApplyError('You have already applied to this job.');
      } else {
        setApplyError(errorMessage);
      }
    } finally {
      setApplying(false);
    }
  };

  // Format posted date
  const postedDate = job.posted_date
    ? new Date(job.posted_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Not specified';

  // Extract skill names with importance
  const skillDetails = job.job_posting_skills.map(jps => ({
    name: jps.skill?.name || 'Unknown skill',
    importance: jps.importance || 'mandatory',
    category: jps.skill?.category?.name || null
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-xl">
        
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#123b68]">{job.title}</h2>
              <p className="text-sm text-slate-600">{job.company_name || job.employer_name || 'Company'}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Job Information */}
          <div className="mb-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-slate-500">Company</p>
                <p className="text-sm font-medium text-slate-800">{job.company_name || job.employer_name || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Location</p>
                <p className="text-sm font-medium text-slate-800">{job.district_name || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Job Role</p>
                <p className="text-sm font-medium text-slate-800">{job.job_role_title || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Posted Date</p>
                <p className="text-sm font-medium text-slate-800">{postedDate}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Status</p>
                <p className="text-sm font-medium text-slate-800">{job.status}</p>
              </div>
            </div>

            {job.employer_website && (
              <div>
                <p className="text-xs font-semibold text-slate-500">Company Website</p>
                <a
                  href={job.employer_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  {job.employer_website}
                </a>
              </div>
            )}

            {job.job_url && (
              <div>
                <p className="text-xs font-semibold text-slate-500">Job URL</p>
                <a
                  href={job.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  View original posting
                </a>
              </div>
            )}
          </div>

          {/* Required Skills */}
          <div className="mb-6">
            <h3 className="mb-3 text-lg font-bold text-[#123b68]">Required Skills</h3>
            {skillDetails.length > 0 ? (
              <div className="space-y-2">
                {skillDetails.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">{skill.name}</p>
                      {skill.category && (
                        <p className="text-xs text-slate-500">{skill.category}</p>
                      )}
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        skill.importance === 'mandatory'
                          ? 'bg-red-50 text-red-700'
                          : skill.importance === 'preferred'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {skill.importance}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No skills specified for this job.</p>
            )}
          </div>

          {/* Related Training & Courses */}
          <div className="mb-6">
            <h3 className="mb-3 text-lg font-bold text-[#123b68]">Related Training & Courses</h3>
            {loadingCourses ? (
              <p className="text-sm text-slate-500">Loading related courses...</p>
            ) : relatedCourses.length > 0 ? (
              <div className="space-y-3">
                {relatedCourses.map((course, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#123b68]">{course.title}</p>
                        {course.description && (
                          <p className="mt-1 text-xs text-slate-600">{course.description}</p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                          {course.district_name && (
                            <span>📍 {course.district_name}</span>
                          )}
                          {course.duration_hours && (
                            <span>⏱ {course.duration_hours} hours</span>
                          )}
                          {course.delivery_mode && (
                            <span>📚 {course.delivery_mode}</span>
                          )}
                        </div>
                        <div className="mt-2">
                          <p className="text-[11px] font-medium text-slate-600">
                            Skills covered: {course.skills_covered?.join(', ') || 'None'}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Matches {course.covered_mandatory_skills}/{course.total_mandatory_skills} mandatory skills
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {Math.round(course.relevance_score * 100)}%
                        </p>
                        <p className="text-[10px] text-slate-500">Match</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No related courses found for this job.</p>
            )}
          </div>

          {/* Apply Section */}
          <div className="border-t border-slate-200 pt-6">
            {applySuccess ? (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-center">
                <p className="text-sm font-semibold text-green-700">✓ Application submitted successfully!</p>
              </div>
            ) : (
              <>
                {applyError && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm text-red-700">{applyError}</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="flex-1 rounded-lg bg-[#123b68] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0e3155] disabled:bg-slate-400 disabled:cursor-not-allowed"
                  >
                    {applying ? 'Submitting...' : 'Apply Now'}
                  </button>
                  <button
                    onClick={onClose}
                    className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}