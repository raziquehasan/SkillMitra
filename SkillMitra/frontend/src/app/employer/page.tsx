"use client";

import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EmployerSidebar from "@/components/employer/EmployerSidebar";

import {
  api,
  type District,
  type IndustrySector,
  type JobPosting,
} from "@/lib/api";

type DashboardData = {
  activeJobs: number;
  applications: number;
  highDemandSkills: number;
  criticalSkillGaps: number;
  matchRate: number;
};

type DemandSkill = {
  skill: string;
  proficiency: string;
  score: number;
};

type SkillGap = {
  skill: string;
  required: number;
  supply: number;
  gap: number;
};

const emptyDashboard: DashboardData = {
  activeJobs: 0,
  applications: 0,
  highDemandSkills: 0,
  criticalSkillGaps: 0,
  matchRate: 0,
};

export default function EmployerDashboard() {
  return <EmployerDashboardContent />;
}

function EmployerDashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [selectedDistrict, setSelectedDistrict] = useState("Pune");
  const [selectedSector, setSelectedSector] =
    useState("EV / Automotive");
  const [selectedRole, setSelectedRole] =
    useState("EV Technician");

  const [dashboard, setDashboard] =
    useState<DashboardData>(emptyDashboard);

  const [demandSkills] = useState<DemandSkill[]>([]);
  const [skillGaps] = useState<SkillGap[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [districtRes, sectorRes, jobRes, appRes] =
          await Promise.all([
            api.districts().catch(() => []),
            api.sectors().catch(() => []),
            api.jobs().catch(() => ({
              items: [],
              total: 0,
            })),
            api.employerApplications().catch(() => []),
          ]);

        setDistricts(districtRes);
        setSectors(sectorRes);
        setJobs(jobRes.items ?? []);
        setApplications(appRes);

        setDashboard({
          activeJobs: jobRes.items?.length ?? 0,
          applications: appRes.length ?? 0,
          highDemandSkills: 0,
          criticalSkillGaps: 0,
          matchRate: 0,
        });
      } catch (error) {
        console.error(
          "Failed to load employer dashboard:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-slate-800">

      {/* =====================================================
          GOVERNMENT TOP BAR
      ====================================================== */}

      <header className="fixed left-0 right-0 top-0 z-50 bg-[#123b68] text-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3">

          {/* Government Branding */}
          <div className="flex items-center gap-3">

          <Image
  src="/maharashtra-gov-logo.png"
  alt="Government of Maharashtra"
  width={48}
  height={48}
  className="h-12 w-12 object-contain"
  priority
/>

            <div>
              <p className="text-sm font-bold">
                Government of Maharashtra
              </p>

              <p className="hidden text-xs text-white/80 md:block">
                Skills, Employment, Entrepreneurship & Innovation Department
              </p>
            </div>

          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">

            <span className="hidden text-sm lg:block">
              SkillMitra Employer Portal
            </span>

            <button
              onClick={handleLogout}
              className="text-sm hover:underline"
            >
              Logout
            </button>

          </div>

        </div>
      </header>

      <div className="fixed left-0 right-0 top-[72px] z-50 h-1 bg-[#c2410c]" />

      {/* =====================================================
          MAIN APPLICATION
      ====================================================== */}

      <div className="min-h-screen pt-[76px]">

        <EmployerSidebar />

        <section className="min-w-0 flex-1 lg:ml-72">

          {/* =================================================
              SKILLMITRA DASHBOARD HEADER
          ================================================== */}

          <div className="border-b border-slate-200 bg-white px-5 py-4 lg:px-8">

            <div className="mx-auto flex max-w-[1250px] items-center justify-between">

              {/* LEFT SIDE */}
              <div className="flex items-center gap-3">

                <button className="text-2xl text-slate-600 lg:hidden">
                  ☰
                </button>

                {/* SkillMitra Logo */}
                <div className="relative h-14 w-14 shrink-0">
  <Image
    src="/skillmitra-logo.png"
    alt="SkillMitra"
    width={56}
    height={56}
    className="h-14 w-14 object-contain"
    priority
  />
</div>

                {/* SkillMitra Text */}
                <div>
                  <p className="text-xs text-slate-400">
                    SkillMitra
                  </p>

                  <p className="font-semibold text-[#123b68]">
                    Employer Intelligence Dashboard
                  </p>
                </div>

              </div>

              {/* RIGHT SIDE */}
              <div className="flex items-center gap-4">

                {/* Notification */}
                <div className="relative text-xl">
                  🔔

                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    5
                  </span>
                </div>

                {/* User */}
                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                    {user?.full_name?.charAt(0)?.toUpperCase() ||
                      "E"}
                  </div>

                  <div className="hidden sm:block">

                    <p className="text-sm font-semibold">
                      {user?.full_name || "Employer"}
                    </p>

                    <p className="text-xs text-slate-500">
                      Verified Employer
                    </p>

                  </div>

                  <span className="text-slate-400">
                    ▾
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              DASHBOARD BODY
          ================================================== */}

          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">

            {/* WELCOME */}

            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">

              <div>

                <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                  👋 Welcome back,{" "}
                  {user?.full_name || "Employer"}!
                </h1>

                <p className="mt-2 text-sm text-slate-500 md:text-base">
                  Understand labour-market demand, identify
                  skill gaps and connect with job-ready talent.
                </p>

              </div>

              <div className="rounded-lg bg-white px-4 py-3 shadow-sm">

                <p className="text-xs text-slate-400">
                  Based in
                </p>

                <p className="font-semibold text-[#123b68]">
                  📍 Pune District
                </p>

              </div>

            </div>

            {/* =================================================
                KPI CARDS
            ================================================== */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

              <KpiCard
                icon="▣"
                title="Active Job Openings"
                value={
                  loading
                    ? "..."
                    : dashboard.activeJobs
                }
                description="From your active jobs"
              />

              <KpiCard
                icon="♙"
                title="Applications / Candidates"
                value={
                  loading
                    ? "..."
                    : dashboard.applications
                }
                description="Candidate pipeline"
              />

              <KpiCard
                icon="↗"
                title="High-Demand Skills"
                value={
                  loading
                    ? "..."
                    : dashboard.highDemandSkills
                }
                description="Industry demand"
              />

              <KpiCard
                icon="△"
                title="Critical Skill Gaps"
                value={
                  loading
                    ? "..."
                    : dashboard.criticalSkillGaps
                }
                description="Skills needing attention"
              />

              <KpiCard
                icon="◎"
                title="Candidate Match Rate"
                value={
                  loading
                    ? "..."
                    : `${dashboard.matchRate}%`
                }
                description="Based on skill matching"
              />

            </div>

            {/* =================================================
                LABOUR MARKET + SKILL GAP
            ================================================== */}

            <div className="mt-6 grid gap-6 xl:grid-cols-2">

              {/* LABOUR MARKET DEMAND */}

              <DashboardCard>

                <CardHeader
                  title="Labour Market Demand"
                  subtitle="What skills does industry need?"
                />

                <div className="grid gap-3 md:grid-cols-3">

                  <SelectBox
                    label="District"
                    value={selectedDistrict}
                    onChange={setSelectedDistrict}
                    options={[
                      "Pune",
                      ...districts
                        .slice(0, 10)
                        .map(
                          (d: any) =>
                            d.name ||
                            d.district_name ||
                            ""
                        )
                        .filter(Boolean),
                    ]}
                  />

                  <SelectBox
                    label="Sector"
                    value={selectedSector}
                    onChange={setSelectedSector}
                    options={[
                      "EV / Automotive",
                      ...sectors
                        .slice(0, 10)
                        .map(
                          (s: any) =>
                            s.name ||
                            s.sector_name ||
                            ""
                        )
                        .filter(Boolean),
                    ]}
                  />

                  <SelectBox
                    label="Job Role"
                    value={selectedRole}
                    onChange={setSelectedRole}
                    options={[
                      "EV Technician",
                      "Software Developer",
                      "Data Analyst",
                      "UI/UX Designer",
                    ]}
                  />

                </div>

                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">

                  <div className="flex flex-wrap items-center justify-between gap-3">

                    <div>

                      <h3 className="font-bold text-slate-900">
                        Demand Overview
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {selectedRole} · {selectedDistrict}
                      </p>

                    </div>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Demand Intelligence
                    </span>

                  </div>

                  <div className="mt-5 grid gap-5 md:grid-cols-2">

                    <div>

                      <p className="text-xs text-slate-500">
                        Current Demand
                      </p>

                      <p className="mt-1 text-2xl font-bold text-[#123b68]">
                        {jobs.length > 0
                          ? jobs.length
                          : "—"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        openings currently available
                      </p>

                    </div>

                    <div>

                      <p className="text-xs text-slate-500">
                        Demand Trend
                      </p>

                      <div className="mt-3 flex h-12 items-end gap-2">

                        {[30, 42, 36, 55, 62, 78].map(
                          (height, index) => (
                            <div
                              key={index}
                              className="flex-1 rounded-t bg-[#2563eb]"
                              style={{
                                height: `${height}%`,
                              }}
                            />
                          )
                        )}

                      </div>

                      <div className="mt-1 flex justify-between text-[9px] text-slate-400">
                        <span>Mar</span>
                        <span>Apr</span>
                        <span>May</span>
                        <span>Jun</span>
                        <span>Jul</span>
                        <span>Aug</span>
                      </div>

                    </div>

                  </div>

                </div>

                <div className="mt-5">

                  <div className="mb-3 flex items-center justify-between">

                    <h3 className="font-semibold text-slate-900">
                      Top Required Skills
                    </h3>

                    <span className="text-xs text-slate-400">
                      Proficiency
                    </span>

                  </div>

                  {demandSkills.length === 0 ? (

                    <EmptyState
                      text="Required skill demand will appear here from the labour-market intelligence API."
                    />

                  ) : (

                    <div className="space-y-3">

                      {demandSkills.map((skill) => (

                        <div
                          key={skill.skill}
                          className="flex items-center gap-3"
                        >

                          <div className="w-32 text-sm">
                            {skill.skill}
                          </div>

                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">

                            <div
                              className="h-full rounded-full bg-blue-600"
                              style={{
                                width: `${skill.score}%`,
                              }}
                            />

                          </div>

                          <span className="w-20 text-right text-xs text-slate-500">
                            {skill.proficiency}
                          </span>

                        </div>

                      ))}

                    </div>

                  )}

                </div>

                <button className="mt-5 w-full rounded-lg border border-blue-200 py-2.5 text-sm font-semibold text-[#123b68] hover:bg-blue-50">
                  View Full Demand Analysis →
                </button>

              </DashboardCard>

              {/* SKILL GAP */}

              <DashboardCard>

                <CardHeader
                  title="Skill Gap Intelligence"
                  subtitle="Skill Gap in Your Hiring Pipeline"
                />

                {skillGaps.length === 0 ? (

                  <EmptyState
                    text="Skill gap data will be calculated from required job skills versus available candidate skills."
                  />

                ) : (

                  <div className="overflow-x-auto">

                    <table className="w-full text-left text-sm">

                      <thead>

                        <tr className="border-b border-slate-200 text-xs text-slate-500">

                          <th className="pb-3">
                            Skill
                          </th>

                          <th className="pb-3">
                            Required
                          </th>

                          <th className="pb-3">
                            Candidate Supply
                          </th>

                          <th className="pb-3">
                            Gap
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {skillGaps.map((gap) => (

                          <tr
                            key={gap.skill}
                            className="border-b border-slate-100"
                          >

                            <td className="py-3 font-medium">
                              {gap.skill}
                            </td>

                            <td>
                              {gap.required}
                            </td>

                            <td>
                              {gap.supply}
                            </td>

                            <td>

                              <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">
                                {gap.gap}
                              </span>

                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                )}

                <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4">

                  <p className="font-semibold text-orange-800">
                    ⚠ Critical gap detection
                  </p>

                  <p className="mt-1 text-sm text-orange-700">
                    The system will identify skills where
                    employer demand is significantly higher
                    than candidate supply.
                  </p>

                  <p className="mt-3 text-sm font-semibold text-orange-800">
                    Recommended action:
                  </p>

                  <p className="mt-1 text-sm text-orange-700">
                    Partner with training providers for
                    identified skill-gap training.
                  </p>

                </div>

                <button className="mt-5 w-full rounded-lg border border-orange-200 py-2.5 text-sm font-semibold text-orange-700 hover:bg-orange-50">
                  View Detailed Gap Report →
                </button>

              </DashboardCard>

            </div>

            {/* =================================================
                CANDIDATE SUPPLY + SMART MATCHING
            ================================================== */}

            <div className="mt-6 grid gap-6 xl:grid-cols-2">

              {/* CANDIDATE SUPPLY */}

              <DashboardCard>

                <CardHeader
                  title="Candidate Skill Supply"
                  subtitle={`Available talent in ${selectedDistrict}`}
                />

                <div className="grid grid-cols-3 gap-3">

                  <MiniStat
                    title="Candidates"
                    value="—"
                  />

                  <MiniStat
                    title="Job Ready"
                    value="—"
                  />

                  <MiniStat
                    title="Need Improvement"
                    value="—"
                  />

                </div>

                <div className="mt-6">

                  <h3 className="font-semibold">
                    Top Available Skills
                  </h3>

                  <EmptyState
                    text="Candidate supply and skill distribution will come from the candidate intelligence API."
                  />

                </div>

              </DashboardCard>

              {/* SMART MATCHING */}

              <DashboardCard>

                <div className="flex items-start justify-between gap-3">

                  <CardHeader
                    title="Smart Candidate Matching"
                    subtitle="Best-matching candidates"
                  />

                  <button className="text-sm font-semibold text-blue-600">
                    View All →
                  </button>

                </div>

                <div className="rounded-lg bg-blue-50 p-4">

                  <p className="text-xs text-slate-500">
                    Job Role
                  </p>

                  <p className="font-semibold text-[#123b68]">
                    {selectedRole}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Location
                  </p>

                  <p className="font-semibold text-[#123b68]">
                    {selectedDistrict}
                  </p>

                </div>

                <div className="mt-4">

                  <EmptyState
                    text="Candidate match percentage will be calculated from job-required skills versus candidate skills."
                  />

                </div>

              </DashboardCard>

            </div>

            {/* =================================================
                TRAINING RECOMMENDATIONS
            ================================================== */}

            <div className="mt-6">

              <DashboardCard>

                <CardHeader
                  title="Training Recommendations"
                  subtitle="Convert identified skill gaps into training requirements"
                />

                <div className="grid gap-4 md:grid-cols-3">

                  <TrainingCard
                    title="Recommended Courses"
                    description="Courses aligned with your hiring skill gaps."
                  />

                  <TrainingCard
                    title="Training Providers"
                    description="Find providers who can address required skills."
                  />

                  <TrainingCard
                    title="Training Requirements"
                    description="Signal emerging industry skill requirements."
                  />

                </div>

              </DashboardCard>

            </div>

            {/* =================================================
                INDUSTRY FEEDBACK
            ================================================== */}

            <div className="mt-6">

              <DashboardCard>

                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                  <div>

                    <h2 className="text-lg font-bold text-slate-900">
                      Industry Feedback
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Help improve Maharashtra's skill-development
                      planning with your industry requirements.
                    </p>

                  </div>

                  <button className="rounded-lg bg-[#123b68] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0e3155]">
                    Submit Industry Feedback
                  </button>

                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">

                  <FeedbackQuestion text="Which skills are difficult to hire?" />

                  <FeedbackQuestion text="Which technologies are emerging?" />

                  <FeedbackQuestion text="What skills will be needed in 1–2 years?" />

                  <FeedbackQuestion text="What should training curriculum improve?" />

                </div>

              </DashboardCard>

            </div>

            {/* =================================================
                JOBS
            ================================================== */}

            <div className="mt-6">

              <DashboardCard>

                <div className="flex items-center justify-between">

                  <CardHeader
                    title="My Jobs"
                    subtitle="Employer hiring activity"
                  />

                  <button className="rounded-lg bg-[#123b68] px-4 py-2 text-sm font-semibold text-white">
                    + Post a Job
                  </button>

                </div>

                {jobs.length === 0 ? (

                  <EmptyState
                    text="Your job postings will appear here."
                  />

                ) : (

                  <div className="mt-4 space-y-3">

                    {jobs.slice(0, 5).map(
                      (job: any, index) => (

                        <div
                          key={job.id ?? index}
                          className="flex flex-col justify-between gap-3 rounded-lg border border-slate-200 p-4 md:flex-row md:items-center"
                        >

                          <div>

                            <p className="font-semibold text-slate-900">
                              {job.title ||
                                job.job_title ||
                                "Job Posting"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {job.location ||
                                selectedDistrict}
                            </p>

                          </div>

                          <div className="flex items-center gap-3">

                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                              Active
                            </span>

                            <button className="text-sm font-semibold text-blue-600">
                              View →
                            </button>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </DashboardCard>

            </div>

<<<<<<< HEAD
            {/* =================================================
                APPLICATIONS
            ================================================== */}

            <div className="mt-6">

              <DashboardCard>

                <div className="flex items-center justify-between">

                  <CardHeader
                    title="Received Applications"
                    subtitle="Candidates who applied to your jobs"
                  />

                  <button className="rounded-lg bg-[#123b68] px-4 py-2 text-sm font-semibold text-white">
                    View All
                  </button>

                </div>

                {applications.length === 0 ? (

                  <EmptyState
                    text="Applications will appear here when candidates apply to your job postings."
                  />

                ) : (

                  <div className="mt-4 space-y-3">

                    {applications.slice(0, 5).map(
                      (app: any, index) => (

                        <div
                          key={app.id ?? index}
                          className="flex flex-col justify-between gap-3 rounded-lg border border-slate-200 p-4 md:flex-row md:items-center"
                        >

                          <div>

                            <p className="font-semibold text-slate-900">
                              {app.candidate_name || "Candidate"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Applied for: {app.job_title || "Job"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {app.candidate_email || "Email not specified"}
                            </p>

                          </div>

                          <div className="flex items-center gap-3">

                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              app.status === 'applied' ? 'bg-blue-50 text-blue-700' :
                              app.status === 'under_review' ? 'bg-amber-50 text-amber-700' :
                              app.status === 'shortlisted' ? 'bg-green-50 text-green-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {app.status}
                            </span>

                            <button className="text-sm font-semibold text-blue-600">
                              View →
                            </button>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </DashboardCard>

            </div>

=======
>>>>>>> origin/government-industry-dashboards
          </div>

        </section>

      </div>

    </main>
  );
}

/* ============================================================
   REUSABLE COMPONENTS
============================================================ */

function KpiCard({
  icon,
  title,
  value,
  description,
}: {
  icon: string;
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-lg text-blue-600">
          {icon}
        </div>

        <p className="text-xs font-semibold text-slate-600">
          {title}
        </p>

      </div>

      <p className="mt-4 text-3xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}

function DashboardCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      {children}
    </div>
  );
}

function CardHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-5">

      <h2 className="text-lg font-bold text-slate-900">
        {title}
      </h2>

      <p className="mt-1 text-xs text-slate-500">
        {subtitle}
      </p>

    </div>
  );
}

function SelectBox({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">

      <span className="mb-1.5 block text-xs font-semibold text-slate-500">
        {label}
      </span>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]"
      >
        {options.map((option, index) => (
          <option
            key={`${option}-${index}`}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>

    </label>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-center">

      <p className="text-sm text-slate-500">
        {text}
      </p>

    </div>
  );
}

function MiniStat({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">

      <p className="text-xs text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-[#123b68]">
        {value}
      </p>

    </div>
  );
}

function TrainingCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">

      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        ★
      </div>

      <h3 className="mt-3 font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>

      <button className="mt-4 text-xs font-semibold text-blue-600">
        Explore →
      </button>

    </div>
  );
}

function FeedbackQuestion({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">

      <p className="text-sm font-medium text-slate-700">
        {text}
      </p>

      <button className="mt-3 text-xs font-semibold text-blue-600">
        Provide feedback →
      </button>

    </div>
  );
}