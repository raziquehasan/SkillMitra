
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import EmployerSidebar from "@/components/employer/EmployerSidebar";

export default function NewJobPage() {
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sector, setSector] = useState("");
  const [jobType, setJobType] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [salary, setSalary] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) return;
    if (skills.includes(skill)) return;

    setSkills([...skills, skill]);
    setSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log({
      jobTitle,
      description,
      sector,
      jobType,
      location,
      experience,
      salary,
      skills,
    });

    alert("Job form submitted successfully!");
  };

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-slate-800">
      {/* GOVERNMENT TOP BAR */}
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
            SkillMitra | Employer Intelligence Portal
          </div>
        </div>
      </header>

      {/* ORANGE LINE */}
      <div className="fixed left-0 right-0 top-[72px] z-50 h-1 bg-[#c2410c]" />

      {/* PAGE LAYOUT */}
      <div className="min-h-screen pt-[76px]">
        {/* EMPLOYER SIDEBAR */}
        <EmployerSidebar />

        {/* MAIN CONTENT */}
        <section className="min-w-0 lg:ml-72">
          {/* SKILLMITRA PAGE HEADER */}
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
                  Post a Job Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* PAGE CONTENT */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">
            {/* BREADCRUMB */}
            <div className="mb-5 flex flex-wrap items-center gap-2 text-sm">
              <Link
                href="/employer"
                className="text-slate-500 hover:text-[#123b68]"
              >
                Employer Dashboard
              </Link>

              <span className="text-slate-400">/</span>

              <Link
                href="/employer/jobs"
                className="text-slate-500 hover:text-[#123b68]"
              >
                My Jobs
              </Link>

              <span className="text-slate-400">/</span>

              <span className="font-medium text-[#123b68]">
                Post a Job
              </span>
            </div>

            {/* PAGE HEADING */}
            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  SkillMitra / Hiring
                </p>

                <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
                  Post a New Job
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Create a job opportunity with required skills and
                  requirements to find suitable skilled candidates.
                </p>
              </div>

              <Link
                href="/employer/jobs"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                ← Back to My Jobs
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* JOB INFORMATION */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4 lg:px-6">
                  <h2 className="text-lg font-bold text-slate-900">
                    Job Information
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Provide the basic details of the job opportunity.
                  </p>
                </div>

                <div className="grid gap-5 p-5 lg:grid-cols-2 lg:p-6">
                  {/* JOB TITLE */}
                  <div className="lg:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Job Title
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Electric Vehicle Technician"
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]"
                    />
                  </div>

                  {/* DESCRIPTION */}
                  <div className="lg:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Job Description
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the role, responsibilities and key expectations..."
                      required
                      rows={6}
                      className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]"
                    />

                    <p className="mt-1.5 text-xs text-slate-400">
                      Provide clear information about the position and its
                      responsibilities.
                    </p>
                  </div>

                  {/* SECTOR */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Sector
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <select
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]"
                    >
                      <option value="">Select sector</option>
                      <option value="Automotive">Automotive</option>
                      <option value="Electric Vehicle">
                        Electric Vehicle
                      </option>
                      <option value="IT & Software">IT & Software</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Retail">Retail</option>
                      <option value="Banking & Finance">
                        Banking & Finance
                      </option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* JOB TYPE */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Job Type
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]"
                    >
                      <option value="">Select job type</option>
                      <option value="Full Time">Full Time</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  {/* LOCATION */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Job Location
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Pune, Maharashtra"
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]"
                    />
                  </div>

                  {/* EXPERIENCE */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Experience Required
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]"
                    >
                      <option value="">Select experience</option>
                      <option value="Fresher">Fresher</option>
                      <option value="0-1 Years">0–1 Years</option>
                      <option value="1-3 Years">1–3 Years</option>
                      <option value="3-5 Years">3–5 Years</option>
                      <option value="5+ Years">5+ Years</option>
                    </select>
                  </div>

                  {/* SALARY */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Salary Range
                    </label>

                    <input
                      type="text"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="e.g. ₹3–5 LPA"
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]"
                    />
                  </div>
                </div>
              </div>

              {/* REQUIRED SKILLS */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4 lg:px-6">
                  <h2 className="text-lg font-bold text-slate-900">
                    Required Skills
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Add the skills required for this job. These skills can
                    later be used for candidate matching.
                  </p>
                </div>

                <div className="p-5 lg:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      placeholder="Enter a skill e.g. JavaScript"
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]"
                    />

                    <button
                      type="button"
                      onClick={addSkill}
                      className="rounded-lg bg-[#123b68] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0e3155]"
                    >
                      + Add Skill
                    </button>
                  </div>

                  {/* SKILLS */}
                  {skills.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <div
                          key={skill}
                          className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-[#123b68]"
                        >
                          <span>{skill}</span>

                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="font-bold text-blue-500 hover:text-red-500"
                            aria-label={`Remove ${skill}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                      <p className="text-sm text-slate-500">
                        No skills added yet.
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Add the skills required for this position.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* HIRING INFORMATION */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4 lg:px-6">
                  <h2 className="text-lg font-bold text-slate-900">
                    Hiring Information
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Review the information before publishing the job.
                  </p>
                </div>

                <div className="grid gap-4 p-5 sm:grid-cols-3 lg:p-6">
                  {/* LOCATION SUMMARY */}
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Job Location
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {location || "Not specified"}
                    </p>
                  </div>

                  {/* EXPERIENCE SUMMARY */}
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Experience
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {experience || "Not specified"}
                    </p>
                  </div>

                  {/* SKILLS SUMMARY */}
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Required Skills
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {skills.length} skill
                      {skills.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                <Link
                  href="/employer/jobs"
                  className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="rounded-lg bg-[#123b68] px-7 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#0e3155]"
                >
                  Publish Job
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

