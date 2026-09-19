'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

type ExtractedSkill = {
  skill_id: string;
  skill_name: string;
  confidence: number;
  category?: string;
  source_context?: string | null;
};

type ResumeReviewData = {
  resume_id: string;
  processing_status: string;
  extracted_skills: ExtractedSkill[];
  extracted_education: any[];
  extracted_experience: any[];
  candidate_id: string;
};

export default function ResumeReviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [reviewData, setReviewData] = useState<ResumeReviewData | null>(null);
  const [processingState, setProcessingState] = useState<'completed' | 'failed' | 'pending' | 'processing'>('pending');
  
  // Skill selection state
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [manualSkill, setManualSkill] = useState('');
  const [manualSkills, setManualSkills] = useState<string[]>([]);

  useEffect(() => {
    const pendingResumeId = localStorage.getItem('pending_resume_id');
    if (!pendingResumeId) {
      router.push('/candidate/skills');
      return;
    }

    loadResumeReview(pendingResumeId);
  }, [router]);

  const loadResumeReview = async (resumeId: string) => {
    try {
      setLoading(true);
      
      const data = await api.resumeReview(resumeId);
      setReviewData(data);
      setProcessingState(data.processing_status || 'pending');
      
      // Select all skills by default
      const allSkillIds = new Set(data.extracted_skills.map((s: ExtractedSkill) => s.skill_id));
      setSelectedSkills(allSkillIds as Set<string>);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resume data');
    } finally {
      setLoading(false);
    }
  };

  const toggleSkillSelection = (skillId: string) => {
    const newSelection = new Set(selectedSkills);
    if (newSelection.has(skillId)) {
      newSelection.delete(skillId);
    } else {
      newSelection.add(skillId);
    }
    setSelectedSkills(newSelection);
  };

  const addManualSkill = () => {
    if (manualSkill.trim()) {
      setManualSkills([...manualSkills, manualSkill.trim()]);
      setManualSkill('');
    }
  };

  const removeManualSkill = (skill: string) => {
    setManualSkills(manualSkills.filter(s => s !== skill));
  };

  const handleConfirmSkills = async () => {
    if (!reviewData) return;

    try {
      setProcessing(true);
      
      const confirmedSkillIds = Array.from(selectedSkills);
      const rejectedSkillIds = reviewData.extracted_skills
        .filter(s => !selectedSkills.has(s.skill_id))
        .map(s => s.skill_id);
      
      const additionalSkills = manualSkills.map(skillName => ({
        skill_name: skillName,
        confidence: 0.5,
        category: 'technical'
      }));

      await api.resumeConfirmSkills(reviewData.resume_id, {
        resume_id: reviewData.resume_id,
        confirmed_skills: confirmedSkillIds,
        rejected_skills: rejectedSkillIds,
        additional_skills: additionalSkills
      });
      
      // Clear pending resume data
      localStorage.removeItem('pending_resume_id');
      localStorage.removeItem('pending_resume_data');
      localStorage.removeItem('pending_resume_name');
      
      // Redirect to skills page
      router.push('/candidate/skills?success=true');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm skills');
    } finally {
      setProcessing(false);
    }
  };

  const handleSkip = () => {
    // Clear pending resume data and redirect to manual skill entry
    localStorage.removeItem('pending_resume_id');
    localStorage.removeItem('pending_resume_data');
    localStorage.removeItem('pending_resume_name');
    router.push('/candidate/skills');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-[#123b63]"></div>
          <p className="text-gray-600">Loading resume data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 text-red-600">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Error Loading Resume</h2>
          <p className="mb-4 text-gray-600">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/candidate/skills')}
              className="flex-1 rounded bg-[#123b63] px-4 py-2 text-white hover:bg-[#0d2d4d]"
            >
              Go to Skills Page
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show processing state message
  if (processingState === 'processing') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-[#123b63]"></div>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Processing Resume</h2>
          <p className="mb-4 text-gray-600">Your resume is being analyzed. This may take a moment...</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Refresh Status
          </button>
        </div>
      </div>
    );
  }

  // Show failed state message
  if (processingState === 'failed') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 text-yellow-600">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Processing Failed</h2>
          <p className="mb-4 text-gray-600">We couldn't automatically extract skills from your resume. You can add them manually.</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/candidate/skills')}
              className="flex-1 rounded bg-[#123b63] px-4 py-2 text-white hover:bg-[#0d2d4d]"
            >
              Add Skills Manually
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!reviewData) {
    return null;
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'soft': return 'bg-green-100 text-green-800';
      case 'certification': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#123b63]">Review Your Skills</h1>
              <p className="text-sm text-gray-600">
                We found {reviewData.extracted_skills.length} skills in your resume
              </p>
            </div>
            <Link
              href="/candidate/skills"
              className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Skip for Now
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Skills Review Section */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Skills Found in Your Resume
          </h2>
          
          {reviewData.extracted_skills.length === 0 ? (
            <div className="rounded-md bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                No skills were automatically detected. You can add skills manually below.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviewData.extracted_skills.map((skill) => (
                <div
                  key={skill.skill_id}
                  className={`flex items-start gap-4 rounded-lg border p-4 transition ${
                    selectedSkills.has(skill.skill_id)
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    id={`skill-${skill.skill_id}`}
                    checked={selectedSkills.has(skill.skill_id)}
                    onChange={() => toggleSkillSelection(skill.skill_id)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#123b63] focus:ring-[#123b63]"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`skill-${skill.skill_id}`}
                        className="font-medium text-gray-900"
                      >
                        {skill.skill_name}
                      </label>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryColor(skill.category)}`}>
                        {skill.category}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getConfidenceBadge(skill.confidence)}`}>
                        {getConfidenceLabel(skill.confidence)} confidence
                      </span>
                    </div>
                    {skill.source_context && (
                      <p className="mt-1 text-xs text-gray-500 italic">
                        "{skill.source_context}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manual Skill Addition */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Add Skills Manually
          </h2>
          
          <div className="mb-4 flex gap-3">
            <input
              type="text"
              value={manualSkill}
              onChange={(e) => setManualSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addManualSkill()}
              placeholder="Enter a skill name (e.g., Python, Communication)"
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-[#123b63] focus:outline-none focus:ring-1 focus:ring-[#123b63]"
            />
            <button
              onClick={addManualSkill}
              className="rounded-md bg-[#123b63] px-4 py-2 text-white hover:bg-[#0d2d4d]"
            >
              Add Skill
            </button>
          </div>

          {manualSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {manualSkills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                >
                  {skill}
                  <button
                    onClick={() => removeManualSkill(skill)}
                    className="ml-1 text-blue-600 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Education & Experience Preview */}
        {(reviewData.extracted_education.length > 0 || reviewData.extracted_experience.length > 0) && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Additional Information Found
            </h2>
            
            {reviewData.extracted_education.length > 0 && (
              <div className="mb-4">
                <h3 className="mb-2 text-sm font-medium text-gray-700">Education</h3>
                <div className="space-y-2">
                  {reviewData.extracted_education.map((edu, index) => (
                    <div key={index} className="rounded-md bg-gray-50 p-3">
                      <p className="text-sm font-medium text-gray-900">{edu.degree}</p>
                      {edu.context && (
                        <p className="mt-1 text-xs text-gray-600">{edu.context}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {reviewData.extracted_experience.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-gray-700">Work Experience</h3>
                <div className="space-y-2">
                  {reviewData.extracted_experience.map((exp, index) => (
                    <div key={index} className="rounded-md bg-gray-50 p-3">
                      <p className="text-sm font-medium text-gray-900">{exp.type}</p>
                      {exp.context && (
                        <p className="mt-1 text-xs text-gray-600">{exp.context}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleSkip}
            disabled={processing}
            className="rounded-md border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Skip & Add Manually
          </button>
          
          <button
            onClick={handleConfirmSkills}
            disabled={processing || selectedSkills.size === 0 && manualSkills.length === 0}
            className="rounded-md bg-[#123b63] px-6 py-3 text-white hover:bg-[#0d2d4d] disabled:opacity-50"
          >
            {processing ? 'Saving Skills...' : `Confirm & Save (${selectedSkills.size + manualSkills.length} skills)`}
          </button>
        </div>
      </main>
    </div>
  );
}