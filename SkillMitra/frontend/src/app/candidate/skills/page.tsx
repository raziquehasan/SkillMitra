"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";
import { api, type Skill } from "@/lib/api";

type CandidateSkill = {
  id: string;
  candidate_id: string;
  skill_id: string;
  skill_name: string | null;
  proficiency_level_id: string;
  proficiency_level_name: string | null;
  source: string;
  verification_status: string;
  last_assessed_date: string | null;
  evidence_reference: string | null;
};

type ProficiencyLevel = {
  id: string;
  name: string;
  description: string | null;
  rank_score: number;
};

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-[#123b68]">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function SkillCard({
  skill,
  onDelete,
  onRequestVerification,
}: {
  skill: CandidateSkill;
  onDelete: (skillId: string) => void;
  onRequestVerification: (skillId: string) => void;
}) {
  const verified = skill.verification_status === "verified";
  const pending = skill.verification_status === "pending";
  const skillName = skill.skill_name || "Unknown Skill";
  const proficiencyName = skill.proficiency_level_name || "Unknown";
  const sourceLabel = skill.source === "candidate_claim" ? "Self-claimed" : skill.source;
  const statusLabel = skill.verification_status === "verified" ? "Verified" : 
                     skill.verification_status === "pending" ? "Pending" : "Unverified";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-800">{skillName}</h3>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              verified
                ? "bg-green-50 text-green-700"
                : pending
                ? "bg-amber-50 text-amber-700"
                : "bg-slate-50 text-slate-600"
            }`}
          >
            {statusLabel}
          </span>
          <button
            onClick={() => onDelete(skill.id)}
            className="rounded p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
            title="Remove skill"
          >
            ×
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[11px] text-slate-400">Proficiency</p>
          <p className="mt-1 text-sm font-semibold text-slate-700">
            {proficiencyName}
          </p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-[11px] text-slate-400">Source</p>
          <p className="mt-1 text-sm font-semibold text-slate-700 capitalize">
            {sourceLabel}
          </p>
        </div>
      </div>

      {skill.last_assessed_date && (
        <div className="mt-3 text-xs text-slate-400">
          Last assessed: {new Date(skill.last_assessed_date).toLocaleDateString()}
        </div>
      )}

      {!verified && !pending && (
        <div className="mt-4">
          <button
            onClick={() => onRequestVerification(skill.id)}
            className="w-full rounded-lg border border-[#123b68] bg-white px-3 py-2 text-sm font-semibold text-[#123b68] hover:bg-slate-50 transition"
          >
            Request Verification
          </button>
        </div>
      )}
    </div>
  );
}

function AddSkillModal({
  isOpen,
  onClose,
  onAdd,
  availableSkills,
  proficiencyLevels,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (skillId: string, proficiencyLevelId: string) => Promise<void>;
  availableSkills: Skill[];
  proficiencyLevels: ProficiencyLevel[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedProficiency, setSelectedProficiency] = useState<ProficiencyLevel | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  const filteredSkills = availableSkills.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (skill.description && skill.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAdd = async () => {
    if (!selectedSkill || !selectedProficiency) {
      setError("Please select both a skill and proficiency level");
      return;
    }

    setIsAdding(true);
    setError("");
    try {
      await onAdd(selectedSkill.id, selectedProficiency.id);
      onClose();
      setSearchTerm("");
      setSelectedSkill(null);
      setSelectedProficiency(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add skill");
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-[#123b68]">Add Skill</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Skill Search */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search Skill
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search skills..."
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-[#123b68] focus:outline-none focus:ring-1 focus:ring-[#123b68]"
            />
          </div>

          {/* Skill Selection */}
          {searchTerm && (
            <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200">
              {filteredSkills.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-500">No skills found</div>
              ) : (
                filteredSkills.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => {
                      setSelectedSkill(skill);
                      setSearchTerm(skill.name);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm transition hover:bg-slate-50 ${
                      selectedSkill?.id === skill.id ? "bg-blue-50 text-[#123b68]" : "text-slate-700"
                    }`}
                  >
                    <div className="font-medium">{skill.name}</div>
                    {skill.description && (
                      <div className="text-xs text-slate-500 mt-1">{skill.description}</div>
                    )}
                  </button>
                ))
              )}
            </div>
          )}

          {/* Proficiency Selection */}
          {selectedSkill && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Proficiency Level
              </label>
              <div className="grid grid-cols-2 gap-2">
                {proficiencyLevels
                  .sort((a, b) => a.rank_score - b.rank_score)
                  .map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setSelectedProficiency(level)}
                      className={`rounded-lg border px-3 py-2 text-sm transition ${
                        selectedProficiency?.id === level.id
                          ? "border-[#123b68] bg-blue-50 text-[#123b68]"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <div className="font-medium">{level.name}</div>
                      {level.description && (
                        <div className="text-xs text-slate-500 mt-1">{level.description}</div>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedSkill || !selectedProficiency || isAdding}
            className="rounded-lg bg-[#123b68] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f3155] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? "Adding..." : "Add Skill"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MySkillsPage() {
  const [candidateSkills, setCandidateSkills] = useState<CandidateSkill[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [proficiencyLevels, setProficiencyLevels] = useState<ProficiencyLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Resume upload state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumes, setResumes] = useState<any[]>([]);
  const [resumeError, setResumeError] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [skillsRes, proficiencyRes, candidateSkillsRes] = await Promise.all([
          api.skills().catch(() => ({ items: [], total: 0 })),
          api.proficiencyLevels().catch(() => []),
          api.candidateSkills().catch(() => []),
        ]);

        setAvailableSkills(skillsRes.items || []);
        setProficiencyLevels(proficiencyRes);
        setCandidateSkills(candidateSkillsRes);
        setError(null);
        
        // Load resume history
        await loadResumes();
      } catch (err) {
        console.error("Failed to load skills data:", err);
        setError("Failed to load skills. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Skills now come with human-readable names from API
  const enrichedSkills = candidateSkills;

  const handleAddSkill = async (skillId: string, proficiencyLevelId: string) => {
    try {
      const newSkill = await api.addCandidateSkill({
        skill_id: skillId,
        proficiency_level_id: proficiencyLevelId,
        source: "candidate_claim",
        verification_status: "unverified",
      });
      setCandidateSkills([...candidateSkills, newSkill]);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (!confirm("Are you sure you want to remove this skill?")) return;

    try {
      await api.deleteCandidateSkill(skillId);
      setCandidateSkills(candidateSkills.filter(s => s.id !== skillId));
    } catch (err) {
      console.error("Failed to delete skill:", err);
      alert("Failed to remove skill. Please try again.");
    }
  };

  const handleRequestVerification = async (skillId: string) => {
    try {
      const updatedSkill = await api.requestSkillVerification(skillId, {});
      setCandidateSkills(candidateSkills.map(s => s.id === skillId ? updatedSkill : s));
    } catch (err) {
      console.error("Failed to request verification:", err);
      alert("Failed to request verification. Please try again.");
    }
  };

  // Resume upload handlers
  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (!allowedTypes.includes(file.type)) {
        setResumeError('Only PDF and DOCX files are allowed');
        setResumeFile(null);
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setResumeError('File size must be less than 5MB');
        setResumeFile(null);
        return;
      }
      
      setResumeFile(file);
      setResumeError('');
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;

    try {
      setResumeUploading(true);
      setResumeError('');
      
      // Upload resume using API client
      const data = await api.resumeUpload(resumeFile);
      
      // Process the resume using API client
      await api.resumeProcess(data.id);
      
      // Redirect to review page
      localStorage.setItem('pending_resume_id', data.id);
      window.location.href = '/candidate/resume-review';
      
    } catch (err) {
      setResumeError(err instanceof Error ? err.message : 'Failed to upload resume');
    } finally {
      setResumeUploading(false);
    }
  };

  const loadResumes = async () => {
    try {
      const data = await api.resumeList();
      setResumes(data);
    } catch (err) {
      console.error("Failed to load resumes:", err);
    }
  };

  // Calculate summary stats
  const totalSkills = enrichedSkills.length;
  const verifiedSkills = enrichedSkills.filter(s => s.verification_status === "verified").length;
  const jobReadySkills = enrichedSkills.filter(s => 
    s.proficiency_level_name === "Advanced" || s.proficiency_level_name === "Intermediate"
  ).length;
  const overallReadiness = totalSkills > 0 
    ? Math.round((jobReadySkills / totalSkills) * 100) 
    : 0;

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
                <p className="text-xs text-slate-400">SkillMitra</p>
                <p className="font-semibold text-[#123b68]">
                  My Skills
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">
            {/* Intro */}
            <div className="mb-6">
              <p className="text-sm font-medium text-[#c2410c]">
                Candidate Skill Profile
              </p>

              <h1 className="mt-1 text-2xl font-bold text-[#123b68]">
                My Skills
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                View your current skills, proficiency levels and identify
                skills that can improve your career opportunities.
              </p>
            </div>

            {/* Resume Upload Section */}
            <div className="mb-6 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#123b68] text-white">
                      📄
                    </div>
                    <h3 className="text-base font-bold text-[#123b68]">
                      Build Your Skills Profile
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Upload your latest resume and we'll extract relevant skills for you automatically.
                  </p>
                  
                  {resumeError && (
                    <div className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                      {resumeError}
                    </div>
                  )}
                  
                  {resumes.length > 0 && (
                    <div className="mt-3 rounded-md bg-white border border-slate-200 px-3 py-2">
                      <p className="text-xs font-medium text-slate-700">
                        Current Resume: {resumes[0].filename || resumes[0].file_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Status: {resumes[0].status || resumes[0].processing_status} • Uploaded: {new Date(resumes[0].upload_date || resumes[0].uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 md:w-auto">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc"
                      onChange={handleResumeChange}
                      disabled={resumeUploading}
                      className="flex-1 rounded border border-slate-300 bg-white px-3 py-2 text-sm file:mr-4 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                    
                    {resumeFile && (
                      <button
                        onClick={handleResumeUpload}
                        disabled={resumeUploading}
                        className="shrink-0 rounded bg-[#123b68] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f3155] disabled:bg-slate-300 disabled:cursor-not-allowed"
                      >
                        {resumeUploading ? 'Uploading...' : 'Upload'}
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="text-xs text-[#123b63] hover:underline"
                  >
                    Or manage skills manually →
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                <p className="text-slate-500">Loading your skills...</p>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center shadow-sm">
                <p className="text-red-700">{error}</p>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <SummaryCard
                    label="Total Skills"
                    value={String(totalSkills)}
                    description="Skills in your profile"
                  />

                  <SummaryCard
                    label="Verified Skills"
                    value={String(verifiedSkills)}
                    description="Verified credentials"
                  />

                  <SummaryCard
                    label="Job Ready"
                    value={String(jobReadySkills)}
                    description="Skills ready for jobs"
                  />

                  <SummaryCard
                    label="Overall Readiness"
                    value={`${overallReadiness}%`}
                    description="Current skill readiness"
                  />
                </div>

                {/* Profile Intelligence */}
                {totalSkills === 0 ? (
                  <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-amber-900">
                          No Skills Added Yet
                        </p>

                        <p className="mt-1 max-w-3xl text-sm leading-6 text-amber-800">
                          Add your current skills to get personalized job recommendations and skill gap analysis.
                        </p>
                      </div>

                      <button
                        onClick={() => setShowAddModal(true)}
                        className="shrink-0 rounded-lg bg-[#123b68] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#0f3155]"
                      >
                        Add Your First Skill
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#123b68]">
                          Skill Profile Intelligence
                        </p>

                        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                          You have {totalSkills} skill{totalSkills !== 1 ? 's' : ''} in your profile. 
                          Keep your skills updated to improve job matching and recommendations.
                        </p>
                      </div>

                      <Link
                        href="/candidate/recommended-skills"
                        className="shrink-0 rounded-lg bg-[#123b68] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#0f3155]"
                      >
                        View Recommended Skills
                      </Link>
                    </div>
                  </div>
                )}

                {/* Current Skills */}
                <div className="mt-8">
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-[#123b68]">
                        Current Skills
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Skills currently available in your candidate profile.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddModal(true)}
                      className="rounded-lg border border-[#123b68] bg-white px-4 py-2 text-sm font-semibold text-[#123b68] hover:bg-slate-50"
                    >
                      + Add Skill
                    </button>
                  </div>

                  {enrichedSkills.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500">
                        ✦
                      </div>
                      <h3 className="mt-4 font-semibold text-slate-700">
                        No Skills Yet
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Add your first skill to get started with personalized recommendations.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {enrichedSkills.map((skill) => (
                        <SkillCard
                          key={skill.id}
                          skill={skill}
                          onDelete={handleDeleteSkill}
                          onRequestVerification={handleRequestVerification}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Career Actions */}
                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  <Link
                    href="/candidate/recommended-skills"
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md"
                  >
                    <p className="font-semibold text-[#123b68]">
                      Recommended Skills
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Explore skills that can improve your career
                      opportunities.
                    </p>
                    <span className="mt-4 inline-block text-sm font-semibold text-[#123b68]">
                      Explore →
                    </span>
                  </Link>

                  <Link
                    href="/candidate/skill-gap"
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-200 hover:shadow-md"
                  >
                    <p className="font-semibold text-[#123b68]">
                      Skill Gap Analysis
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Understand which skills you need for target roles.
                    </p>
                    <span className="mt-4 inline-block text-sm font-semibold text-[#123b68]">
                      View Skill Gap →
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
                      Find training opportunities aligned with your
                      skill gaps.
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
                        Candidate Intelligence
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Keep your skills updated to improve job matching,
                        recommendations and training opportunities.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Add Skill Modal */}
      <AddSkillModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSkill}
        availableSkills={availableSkills}
        proficiencyLevels={proficiencyLevels}
      />
    </main>
  );
}