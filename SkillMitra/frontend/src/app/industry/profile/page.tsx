"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function IndustryProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employerProfile, setEmployerProfile] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        // Try to get employer profile from API
        // const profile = await api.employerProfile().catch(() => null);
        // setEmployerProfile(profile);
        setEmployerProfile(null); // Placeholder until API is implemented
      } catch (err) {
        console.error("Failed to load employer profile:", err);
        setError("Failed to load employer profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7fa] text-slate-800">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#123b68] border-r-transparent"></div>
            <p className="mt-4 text-sm text-slate-600">Loading employer profile...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !employerProfile) {
    return (
      <main className="min-h-screen bg-[#f4f7fa] text-slate-800">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-sm text-red-600">{error || "No employer profile found"}</p>
            <p className="mt-2 text-xs text-slate-500">Please contact support to set up your employer profile.</p>
          </div>
        </div>
      </main>
    );
  }
    
  return (
    <main className="min-h-screen bg-[#f4f7fa] text-slate-800">
      {/* Government Header */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-[#123b68] text-white">
        <div className="flex h-[60px] items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              <Image
                src="/government-logo.png"
                alt="Government Logo"
                fill
                className="object-contain"
              />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Government of Maharashtra
              </p>

              <p className="text-[11px] text-blue-100">
                Skill Development & Workforce Intelligence
              </p>
            </div>
          </div>

          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium">Industry Portal</p>

            <p className="text-[11px] text-blue-100">
              Workforce Planning System
            </p>
          </div>
        </div>
      </header>

      {/* Orange Line */}
      <div className="fixed left-0 right-0 top-[60px] z-50 h-1 bg-[#c2410c]" />

      <div className="flex min-h-screen pt-[65px]">
        {/* Sidebar */}
        <aside className="fixed bottom-0 left-0 top-[65px] z-20 hidden w-72 overflow-y-auto border-r border-slate-200 bg-white lg:block">
          <div className="flex h-28 items-center gap-3 border-b border-slate-200 px-7">
            <div className="relative h-14 w-14 shrink-0">
              <Image
                src="/skillmitra-logo.png"
                alt="SkillMitra"
                fill
                className="object-contain"
              />
            </div>

            <div>
              <h1 className="text-xl font-bold text-[#123b68]">
                SkillMitra
              </h1>

              <p className="text-xs text-slate-500">
                Industry Portal
              </p>
            </div>
          </div>

          <nav className="p-4">
            {/* Industry Intelligence */}
            <div className="mb-6">
              <p className="mb-3 px-3 text-[11px] font-bold tracking-wider text-slate-400">
                INDUSTRY INTELLIGENCE
              </p>

              <div className="space-y-1">
                <a
                  href="/industry"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Dashboard
                </a>

                <a
                  href="/industry/demand"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Industry Demand
                </a>

                <a
                  href="/industry/skills"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Required Skills
                </a>

                <a
                  href="/industry/workforce"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Workforce Gap
                </a>

                <a
                  href="/industry/roles"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Emerging Job Roles
                </a>

                <a
                  href="/industry/trends"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Skill Trends
                </a>
              </div>
            </div>

            {/* Industry Requirements */}
            <div>
              <p className="mb-3 px-3 text-[11px] font-bold tracking-wider text-slate-400">
                INDUSTRY REQUIREMENTS
              </p>

              <div className="space-y-1">
                <a
                  href="/industry/requirements"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Workforce Requirements
                </a>

                <a
                  href="/industry/profile"
                  className="block rounded-lg bg-[#123b68] px-3 py-2.5 text-sm font-medium text-white"
                >
                  Industry Profile
                </a>

                <a
                  href="/industry/settings"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Settings
                </a>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <section className="min-w-0 flex-1 lg:ml-72">
          <div className="space-y-7 p-6 lg:p-10">
            {/* Page Intro */}
            <div>
              <p className="text-sm font-semibold text-[#c2410c]">
                INDUSTRY PROFILE
              </p>

              <h2 className="mt-1 text-3xl font-bold text-[#123b68]">
                Industry Profile
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                View and manage the basic profile, business information,
                workforce details and hiring requirements of the industry.
              </p>
            </div>

            {/* Company Profile Card */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#123b68] text-2xl font-bold text-white">
                      {employerProfile.company_name?.substring(0, 2).toUpperCase() || "CO"}
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-[#123b68]">
                        {employerProfile.company_name || "Company Name"}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {employerProfile.industry_sector || "Industry"} • {employerProfile.location || "Location"}
                      </p>
                    </div>
                  </div>

                  <span className={`w-fit rounded-full px-4 py-2 text-xs font-bold ${
                    employerProfile.verification_status === "verified" 
                      ? "bg-emerald-100 text-emerald-700" 
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {employerProfile.verification_status === "verified" ? "Profile Verified" : "Pending Verification"}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <p className="max-w-4xl text-sm leading-6 text-slate-600">
                  {employerProfile.description || "No company description provided."}
                </p>
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <h3 className="mb-4 text-lg font-bold text-[#123b68]">
                Basic Information
              </h3>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Industry Sector
                  </p>

                  <p className="mt-2 font-semibold text-slate-700">
                    {employerProfile.industry_sector || "Not specified"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Location
                  </p>

                  <p className="mt-2 font-semibold text-slate-700">
                    {employerProfile.location || "Not specified"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Established
                  </p>

                  <p className="mt-2 font-semibold text-slate-700">
                    {employerProfile.established_year || "Not specified"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Workforce Size
                  </p>

                  <p className="mt-2 font-semibold text-slate-700">
                    {employerProfile.employee_count || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Business Areas + Contact */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Business Areas */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[#123b68]">
                  Business Areas
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Major areas of operation and business focus.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {employerProfile.business_areas && employerProfile.business_areas.length > 0 ? (
                    employerProfile.business_areas.map((area: string, index: number) => (
                      <div
                        key={index}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <p className="text-sm font-medium text-slate-700">
                          {area}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-4 text-sm text-slate-400">
                      No business areas specified
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[#123b68]">
                  Industry Contact
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Primary contact information for industry coordination.
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Contact Person
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {employerProfile.contact_person || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Email
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {employerProfile.contact_email || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Phone
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {employerProfile.contact_phone || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hiring Requirements */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h3 className="text-lg font-bold text-[#123b68]">
                  Current Hiring Requirements
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Key roles currently required by the industry.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Job Role
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Open Positions
                      </th>

                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Priority
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {employerProfile.hiring_requirements && employerProfile.hiring_requirements.length > 0 ? (
                      employerProfile.hiring_requirements.map((item: any, index: number) => (
                        <tr
                          key={index}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-6 py-4 text-sm font-semibold text-[#123b68]">
                            {item.role || "Unknown Role"}
                          </td>

                          <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                            {item.openings || 0}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                item.priority === "Very High"
                                  ? "bg-red-100 text-red-700"
                                  : item.priority === "High"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {item.priority || "Medium"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-400">
                          No hiring requirements specified
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Required Skills */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#123b68]">
                Key Skills Required
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Core skills expected from the industry's workforce.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {employerProfile.required_skills && employerProfile.required_skills.length > 0 ? (
                  employerProfile.required_skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-[#123b68]"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">No skills specified</span>
                )}
              </div>
            </div>

            {/* Profile Status */}
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#123b68]">
                Profile Status
              </p>

              <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h3 className="text-lg font-bold text-[#123b68]">
                    Industry profile is up to date
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    Business information and workforce requirements were last
                    updated recently.
                  </p>
                </div>

                <span className="w-fit rounded-lg bg-white px-4 py-2 text-xs font-bold text-emerald-600 shadow-sm">
                  Verified & Active
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}