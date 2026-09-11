"use client";

import Image from "next/image";
import EmployerSidebar from "@/components/employer/EmployerSidebar";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

type RequirementData = {
  skill: string;
  job_role: string;
  importance: string | null;
  proficiency: string | null;
  demand: number;
};

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState<RequirementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    async function loadRequirements() {
      try {
        setLoading(true);
        setError(null);
        
        const params: any = {};
        if (selectedDistrict) params.district_id = selectedDistrict;
        if (selectedSector) params.sector_id = selectedSector;
        if (selectedRole) params.job_role_id = selectedRole;
        
        const data = await api.employerIntelligenceRequirements(params);
        setRequirements(data);
      } catch (err) {
        console.error("Failed to load requirements:", err);
        setError("Unable to load requirements data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadRequirements();
  }, [selectedDistrict, selectedSector, selectedRole]);

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

        {/* EXISTING EMPLOYER SIDEBAR */}
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
                  Skill Requirements Dashboard
                </p>
              </div>

            </div>
          </div>

          {/* PAGE CONTENT */}
          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">

            {/* PAGE HEADER */}
            <div className="mb-7">

              <p className="text-xs font-semibold text-slate-400">
                SkillMitra / Labour Market Intelligence
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
                Skill Requirements
              </h1>

              <p className="mt-2 text-sm text-slate-500 md:text-base">
                Understand skill requirements across job roles
                and their demand in the labour market.
              </p>

            </div>

            {/* FILTERS */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <h2 className="text-lg font-bold text-slate-900">
                Explore Requirements
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-3">

                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                    District
                  </span>

                  <select 
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#123b68]"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                  >
                    <option value="">All Districts</option>
                    <option value="pune-district-id">Pune</option>
                    <option value="mumbai-district-id">Mumbai</option>
                    <option value="nashik-district-id">Nashik</option>
                    <option value="nagpur-district-id">Nagpur</option>
                  </select>
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                    Industry Sector
                  </span>

                  <select 
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#123b68]"
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                  >
                    <option value="">All Sectors</option>
                    <option value="ev-sector-id">EV / Automotive</option>
                    <option value="it-sector-id">IT & Software</option>
                    <option value="manufacturing-sector-id">Manufacturing</option>
                    <option value="healthcare-sector-id">Healthcare</option>
                  </select>
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-500">
                    Job Role
                  </span>

                  <select 
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#123b68]"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="">All Roles</option>
                    <option value="ev-technician-id">EV Technician</option>
                    <option value="software-developer-id">Software Developer</option>
                    <option value="data-analyst-id">Data Analyst</option>
                    <option value="ui-ux-designer-id">UI/UX Designer</option>
                  </select>
                </label>

              </div>
            </div>

            {/* ERROR STATE */}
            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
                <p className="font-semibold text-red-800">
                  Error
                </p>
                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* REQUIREMENTS TABLE */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Skill Requirements by Job Role
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Required skills, importance levels, and demand across job roles.
                </p>
              </div>

              {loading ? (
                <div className="mt-5 text-center text-slate-500">
                  Loading requirements...
                </div>
              ) : requirements.length === 0 ? (
                <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-sm text-slate-500">
                    No requirements data available for the selected filters.
                  </p>
                </div>
              ) : (
                <div className="mt-5 overflow-x-auto">

                  <table className="w-full text-left text-sm">

                    <thead>

                      <tr className="border-b border-slate-200 text-xs text-slate-500">

                        <th className="pb-3">
                          Skill
                        </th>

                        <th className="pb-3">
                          Job Role
                        </th>

                        <th className="pb-3">
                          Importance
                        </th>

                        <th className="pb-3">
                          Proficiency
                        </th>

                        <th className="pb-3">
                          Demand
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {requirements.map((req, index) => (

                        <tr
                          key={index}
                          className="border-b border-slate-100"
                        >

                          <td className="py-3 font-medium">
                            {req.skill}
                          </td>

                          <td>
                            {req.job_role}
                          </td>

                          <td>
                            {req.importance ? (
                              <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                                {req.importance}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          <td>
                            {req.proficiency ? (
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                                {req.proficiency}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          <td>

                            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              req.demand >= 100 ? "bg-green-50 text-green-700" :
                              req.demand >= 50 ? "bg-blue-50 text-blue-700" :
                              req.demand > 0 ? "bg-yellow-50 text-yellow-700" :
                              "bg-slate-100 text-slate-600"
                            }`}>
                              {req.demand}
                            </span>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>
              )}

            </div>

            {/* INTELLIGENCE NOTICE */}
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">

              <h2 className="font-semibold text-[#123b68]">
                Requirements Intelligence
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Skill requirements are derived from actual job role definitions and demand data in the labour market.
              </p>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}