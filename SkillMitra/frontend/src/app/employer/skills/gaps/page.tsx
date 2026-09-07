"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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

export default function SkillGapPage() {
  return <SkillGapPageContent />;
}

function SkillGapPageContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);

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
        const [districtRes, sectorRes, jobRes] =
          await Promise.all([
            api.districts().catch(() => []),
            api.sectors().catch(() => []),
            api.jobs().catch(() => ({
              items: [],
              total: 0,
            })),
          ]);

        setDistricts(districtRes);
        setSectors(sectorRes);
        setJobs(jobRes.items ?? []);

        setDashboard({
          activeJobs: jobRes.items?.length ?? 0,
          applications: 0,
          highDemandSkills: 0,
          criticalSkillGaps: 0,
          matchRate: 0,
        });
      } catch (error) {
        console.error(
          "Failed to load skill gap dashboard:",
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
      {/* =========================================================
          GOVERNMENT TOP BAR
      ========================================================== */}

      <header className="fixed left-0 right-0 top-0 z-50 h-[72px] bg-[#123b68] text-white">
        <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-6 text-sm">
          {/* LEFT */}
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
                Skills, Employment, Entrepreneurship & Innovation
                Department
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            <div className="hidden font-semibold md:block">
              SkillMitra | Employer Intelligence Portal
            </div>

            <button
              onClick={handleLogout}
              className="text-sm hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ORANGE LINE */}
      <div className="fixed left-0 right-0 top-[72px] z-50 h-1 bg-[#c2410c]" />

      {/* =========================================================
          MAIN APPLICATION
      ========================================================== */}

      <div className="min-h-screen pt-[76px]">
        <EmployerSidebar />

        <section className="min-w-0 lg:ml-72">
          {/* =====================================================
              SKILLMITRA PAGE HEADER
          ====================================================== */}

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
                  Skill Gap Intelligence Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* =====================================================
              PAGE CONTENT
          ====================================================== */}

          <div className="mx-auto max-w-[1250px] px-5 py-7 lg:px-8">
            {/* PAGE TITLE */}

            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  SkillMitra / Skill Intelligence
                </p>

                <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
                  Skill Gap Intelligence
                </h1>

                <p className="mt-2 max-w-3xl text-sm text-slate-500 md:text-base">
                  Identify the difference between industry skill
                  requirements and available candidate skills.
                </p>
              </div>

              <div className="rounded-lg bg-white px-4 py-3 shadow-sm">
                <p className="text-xs text-slate-400">
                  Based in
                </p>

                <p className="font-semibold text-[#123b68]">
                  📍 {selectedDistrict} District
                </p>
              </div>
            </div>

            {/* =====================================================
                KPI CARDS
            ====================================================== */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <KpiCard
                icon="▣"
                title="Active Job Openings"
                value={loading ? "..." : dashboard.activeJobs}
                description="Current employer demand"
              />

              <KpiCard
                icon="♙"
                title="Applications / Candidates"
                value={loading ? "..." : dashboard.applications}
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
                description="Skills in demand"
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
                description="Skill compatibility"
              />
            </div>

            {/* =====================================================
                FILTERS
            ====================================================== */}

            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Skill Gap Analysis
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select a district, sector and job role to
                  analyse the current skill gap.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
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
            </div>

            {/* =====================================================
                SKILL GAP OVERVIEW
            ====================================================== */}

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              {/* GAP OVERVIEW */}

              <DashboardCard>
                <CardHeader
                  title="Skill Gap Overview"
                  subtitle={`${selectedRole} · ${selectedDistrict}`}
                />

                <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                        Current Analysis
                      </p>

                      <h3 className="mt-1 text-xl font-bold text-orange-800">
                        {selectedRole}
                      </h3>

                      <p className="mt-1 text-sm text-orange-700">
                        {selectedSector} ·{" "}
                        {selectedDistrict}
                      </p>
                    </div>

                    <div className="rounded-lg bg-white px-4 py-3 shadow-sm">
                      <p className="text-xs text-slate-400">
                        Active Jobs
                      </p>

                      <p className="mt-1 text-xl font-bold text-[#123b68]">
                        {jobs.length > 0
                          ? jobs.length
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <GapStat
                      title="Required Skills"
                      value="—"
                    />

                    <GapStat
                      title="Available Skills"
                      value="—"
                    />

                    <GapStat
                      title="Overall Gap"
                      value="—"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <h3 className="font-semibold text-slate-900">
                    Gap Interpretation
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Skill gaps are identified by comparing the
                    skills required by employers with the skills
                    available across candidate profiles.
                  </p>
                </div>
              </DashboardCard>

              {/* CRITICAL GAP */}

              <DashboardCard>
                <CardHeader
                  title="Critical Skill Gaps"
                  subtitle="Skills where employer demand exceeds candidate supply"
                />

                {skillGaps.length === 0 ? (
                  <EmptyState
                    text="Critical skill gaps will appear here once employer requirements and candidate skill supply are available through the intelligence API."
                  />
                ) : (
                  <div className="space-y-3">
                    {skillGaps.map((gap) => (
                      <SkillGapRow
                        key={gap.skill}
                        gap={gap}
                      />
                    ))}
                  </div>
                )}

                <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <p className="font-semibold text-orange-800">
                    ⚠ Critical gap detection
                  </p>

                  <p className="mt-1 text-sm leading-6 text-orange-700">
                    The system identifies skills where employer
                    demand is significantly higher than
                    available candidate supply.
                  </p>

                  <p className="mt-3 text-sm font-semibold text-orange-800">
                    Recommended action
                  </p>

                  <p className="mt-1 text-sm leading-6 text-orange-700">
                    Partner with training providers to address
                    identified skill shortages.
                  </p>
                </div>
              </DashboardCard>
            </div>

            {/* =====================================================
                REQUIRED VS SUPPLY
            ====================================================== */}

            <div className="mt-6">
              <DashboardCard>
                <CardHeader
                  title="Required Skills vs Candidate Supply"
                  subtitle="Compare industry requirements with available talent"
                />

                {skillGaps.length === 0 ? (
                  <EmptyState
                    text="Skill requirement and candidate supply comparison will appear here from the skill intelligence API."
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
                            <td className="py-3 font-medium text-slate-800">
                              {gap.skill}
                            </td>

                            <td>
                              {gap.required}
                            </td>

                            <td>
                              {gap.supply}
                            </td>

                            <td>
                              <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                                {gap.gap}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </DashboardCard>
            </div>

            {/* =====================================================
                TOP REQUIRED SKILLS
            ====================================================== */}

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <DashboardCard>
                <CardHeader
                  title="Top Required Skills"
                  subtitle="Skills currently required by industry"
                />

                {demandSkills.length === 0 ? (
                  <EmptyState
                    text="Required skill demand will appear here from the labour-market intelligence API."
                  />
                ) : (
                  <div className="space-y-4">
                    {demandSkills.map((skill) => (
                      <div
                        key={skill.skill}
                        className="flex items-center gap-3"
                      >
                        <div className="w-32 text-sm font-medium">
                          {skill.skill}
                        </div>

                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-[#123b68]"
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

                <button className="mt-5 w-full rounded-lg border border-blue-200 py-2.5 text-sm font-semibold text-[#123b68] transition hover:bg-blue-50">
                  View Demand Analysis →
                </button>
              </DashboardCard>

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
                  <h3 className="font-semibold text-slate-900">
                    Available Skills
                  </h3>

                  <EmptyState
                    text="Candidate skill distribution will come from the candidate intelligence API."
                  />
                </div>
              </DashboardCard>
            </div>

            {/* =====================================================
                TRAINING RECOMMENDATIONS
            ====================================================== */}

            <div className="mt-6">
              <DashboardCard>
                <CardHeader
                  title="Training Recommendations"
                  subtitle="Convert identified skill gaps into training requirements"
                />

                <div className="grid gap-4 md:grid-cols-3">
                  <TrainingCard
                    title="Recommended Courses"
                    description="Courses aligned with identified hiring skill gaps."
                  />

                  <TrainingCard
                    title="Training Providers"
                    description="Find training providers who can address required skills."
                  />

                  <TrainingCard
                    title="Training Requirements"
                    description="Signal emerging industry skill requirements."
                  />
                </div>
              </DashboardCard>
            </div>

            {/* =====================================================
                SKILL GAP ACTION
            ====================================================== */}

            <div className="mt-6">
              <DashboardCard>
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                      Skill Intelligence Action
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                      Address identified skill shortages
                    </h2>

                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                      Use skill-gap insights to improve hiring,
                      identify training requirements and
                      communicate emerging workforce needs.
                    </p>
                  </div>

                  <button className="rounded-lg bg-[#123b68] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0e3155]">
                    View Detailed Gap Report →
                  </button>
                </div>
              </DashboardCard>
            </div>

            {/* =====================================================
                INDUSTRY FEEDBACK
            ====================================================== */}

            <div className="mt-6">
              <DashboardCard>
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Industry Feedback
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Help improve Maharashtra&apos;s
                      skill-development planning with your
                      industry requirements.
                    </p>
                  </div>

                  <button className="rounded-lg bg-[#123b68] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0e3155]">
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
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#123b68] focus:ring-1 focus:ring-[#123b68]"
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
      <p className="text-sm leading-6 text-slate-500">
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

function GapStat({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-orange-200 bg-white p-4">
      <p className="text-xs text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-[#123b68]">
        {value}
      </p>
    </div>
  );
}

function SkillGapRow({
  gap,
}: {
  gap: SkillGap;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-slate-900">
            {gap.skill}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Required: {gap.required} · Supply: {gap.supply}
          </p>
        </div>

        <span className="w-fit rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
          Gap: {gap.gap}
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-orange-500"
          style={{
            width: `${
              gap.required > 0
                ? Math.min(
                    100,
                    (gap.gap / gap.required) * 100
                  )
                : 0
            }%`,
          }}
        />
      </div>
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