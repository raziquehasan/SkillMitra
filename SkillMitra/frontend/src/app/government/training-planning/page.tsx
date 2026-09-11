
"use client";

import Link from "next/link";

type TrainingPlan = {
  program: string;
  sector: string;
  district: string;
  seats: number;
  duration: string;
  provider: string;
  priority: "High" | "Medium" | "Low";
};

const plans: TrainingPlan[] = [
  {
    program: "EV Technician",
    sector: "Automotive",
    district: "Pune",
    seats: 350,
    duration: "6 Months",
    provider: "Certified Training Partner",
    priority: "High",
  },
  {
    program: "CNC Operator",
    sector: "Manufacturing",
    district: "Pune",
    seats: 180,
    duration: "4 Months",
    provider: "Industrial Training Centre",
    priority: "Medium",
  },
  {
    program: "Solar Technician",
    sector: "Renewable Energy",
    district: "Pune",
    seats: 120,
    duration: "3 Months",
    provider: "Skill Training Centre",
    priority: "Medium",
  },
  {
    program: "Data Analyst",
    sector: "IT/ITES",
    district: "Pune",
    seats: 100,
    duration: "4 Months",
    provider: "IT Skill Centre",
    priority: "Low",
  },
];

export default function TrainingPlanningPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fa] text-slate-800">

      {/* ================= TOP BAR ================= */}
      <header className="fixed left-0 right-0 top-0 z-50 h-[78px] border-b border-[#0d2f54] bg-[#123b68] text-white">
        <div className="flex h-full items-center justify-between px-5 lg:px-8">

          {/* Government Branding */}
          <div className="flex items-center gap-4">
            <img
              src="/government-logo.png"
              alt="Government of Maharashtra"
              className="h-10 w-auto object-contain"
            />

            <div className="hidden h-9 w-px bg-white/25 sm:block" />

            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-white">
                Government Portal
              </h1>

              <p className="text-xs text-white/75">
                Skill Development & Planning
              </p>
            </div>
          </div>

          {/* Government Official */}
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-white">
                Government Official
              </p>

              <p className="text-xs text-white/70">
                Govt. Officer
              </p>
            </div>

            <button
              type="button"
              className="rounded-md border border-white/25 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
            >
              Logout
            </button>
          </div>

        </div>
      </header>

      {/* ================= ORANGE STRIP ================= */}
      <div className="fixed left-0 right-0 top-[78px] z-50 h-1 bg-[#c2410c]" />

      <div className="flex min-h-screen">

        {/* ================= SIDEBAR ================= */}
        <aside className="fixed bottom-0 left-0 top-[82px] z-40 hidden w-[264px] overflow-y-auto border-r border-slate-200 bg-white lg:block">

          <div className="flex min-h-full flex-col">

            {/* Sidebar Branding */}
            <div className="border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2">

                <img
                  src="/skillmitra-logo.png"
                  alt="SkillMitra"
                  className="h-7 w-auto object-contain"
                />

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Government Portal
                  </p>

                  <p className="mt-0.5 text-xs font-semibold text-[#123b68]">
                    Skill Development & Planning
                  </p>
                </div>

              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">

              <SidebarItem
                icon="⌂"
                label="Dashboard"
                href="/government"
              />

              <SidebarItem
                icon="▣"
                label="Industry Requirements"
                href="/government/industry-requirements"
              />

              <SidebarItem
                icon="✓"
                label="Training Planning"
                href="/government/training-planning"
                active
              />

              <SidebarItem
                icon="▥"
                label="District Analysis"
                href="/government/district-analysis"
              />

              <SidebarItem
                icon="▤"
                label="Reports & Insights"
                href="/government/reports-insights"
              />

              <SidebarItem
                icon="⚙"
                label="Settings"
                href="/government/settings"
              />

            </nav>

            {/* Sidebar Footer */}
            <div className="border-t border-slate-100 p-4">
              <div className="rounded-xl bg-[#f0f7ff] p-4">
                <p className="text-xs font-bold text-[#123b68]">
                  SkillMitra
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Skill Development for a Stronger Maharashtra
                </p>
              </div>
            </div>

          </div>
        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <section className="min-h-screen min-w-0 bg-[#f4f7fa] pt-[82px] lg:ml-[264px]">

          <div className="mx-auto max-w-[1500px] p-4 lg:p-6">

            {/* Page Title */}
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-[#123b68]">
                Training Planning
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Plan training programs based on industry skill requirements
              </p>
            </div>

            {/* ================= SUMMARY CARDS ================= */}
            <div className="mb-5 grid gap-4 md:grid-cols-3">

              <SummaryCard
                title="Training Programs"
                value="4"
                subtitle="Recommended programs"
              />

              <SummaryCard
                title="Total Training Seats"
                value="750"
                subtitle="Seats planned"
              />

              <SummaryCard
                title="High Priority"
                value="1"
                subtitle="Program requiring action"
                danger
              />

            </div>

            {/* ================= TRAINING PLAN TABLE ================= */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-5 py-4">
                <h3 className="text-sm font-bold text-[#123b68]">
                  Recommended Training Plans
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Training capacity required to reduce identified skill gaps
                </p>
              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[950px] border-collapse text-left">

                  <thead>
                    <tr className="border-b border-slate-200 bg-[#f8fafc]">

                      <TableHead text="Training Program" />
                      <TableHead text="Sector" />
                      <TableHead text="District" />
                      <TableHead text="Seats Required" />
                      <TableHead text="Duration" />
                      <TableHead text="Training Provider" />
                      <TableHead text="Priority" />
                      <TableHead text="Action" />

                    </tr>
                  </thead>

                  <tbody>

                    {plans.map((plan) => (
                      <tr
                        key={plan.program}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >

                        <td className="px-4 py-4 text-xs font-bold text-slate-700">
                          {plan.program}
                        </td>

                        <td className="px-4 py-4 text-xs text-slate-600">
                          {plan.sector}
                        </td>

                        <td className="px-4 py-4 text-xs text-slate-600">
                          {plan.district}
                        </td>

                        <td className="px-4 py-4 text-xs font-semibold text-[#0755ad]">
                          {plan.seats}
                        </td>

                        <td className="px-4 py-4 text-xs text-slate-600">
                          {plan.duration}
                        </td>

                        <td className="px-4 py-4 text-xs text-slate-600">
                          {plan.provider}
                        </td>

                        <td className="px-4 py-4">
                          <PriorityBadge priority={plan.priority} />
                        </td>

                        <td className="px-4 py-4">
                          <button
                            type="button"
                            className="rounded-md bg-[#0755ad] px-3 py-2 text-[10px] font-bold text-white hover:bg-[#064994]"
                          >
                            Plan Training
                          </button>
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>

            </div>

            {/* ================= TRAINING ACTIONS ================= */}
            <div className="mt-5 rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-5 py-4">
                <h3 className="text-sm font-bold text-[#123b68]">
                  Training Planning Actions
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Manage training capacity and providers based on identified
                  skill requirements.
                </p>
              </div>

              <div className="grid gap-3 p-4 md:grid-cols-3">

                <ActionCard
                  icon="＋"
                  title="Create Training Program"
                  description="Create a new program for identified skill gaps."
                />

                <ActionCard
                  icon="▣"
                  title="Allocate Seats"
                  description="Increase training capacity where demand is high."
                />

                <ActionCard
                  icon="✓"
                  title="Assign Provider"
                  description="Assign a certified training provider."
                />

              </div>

            </div>

            {/* ================= PLANNING INSIGHT ================= */}
            <div className="mt-5 rounded-xl border border-[#d7e7f7] bg-[#f8fbff] p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e7f1fc] text-[#0755ad]">
                  AI
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#123b68]">
                    Training Planning Insight
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    Pune currently shows the highest training requirement,
                    particularly for EV Technician and CNC Operator roles.
                    Priority should be given to increasing seats for high-gap
                    programs and assigning suitable certified training
                    providers.
                  </p>
                </div>

              </div>

            </div>

            {/* ================= BACK ================= */}
            <div className="mt-5">
              <Link
                href="/government"
                className="text-xs font-semibold text-[#0755ad] hover:underline"
              >
                ← Back to Government Dashboard
              </Link>
            </div>

            {/* Footer */}
            <div className="mt-8 border-t border-slate-200 pt-4 text-center">
              <p className="text-[10px] text-slate-400">
                SkillMitra • Government Skill Development & Planning Portal
              </p>
            </div>

          </div>

        </section>

      </div>

    </main>
  );
}


/* ================= SIDEBAR ITEM ================= */

function SidebarItem({
  icon,
  label,
  href,
  active = false,
}: {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
        active
          ? "bg-[#e7f1fc] text-[#0755ad] shadow-[inset_4px_0_0_#0755ad]"
          : "text-slate-600 hover:bg-slate-50 hover:text-[#123b68]"
      }`}
    >
      <span className="w-6 text-center text-lg">
        {icon}
      </span>

      <span>{label}</span>
    </Link>
  );
}


/* ================= SUMMARY CARD ================= */

function SummaryCard({
  title,
  value,
  subtitle,
  danger = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <p className="text-xs font-semibold text-slate-500">
        {title}
      </p>

      <p
        className={`mt-2 text-3xl font-bold ${
          danger ? "text-rose-600" : "text-[#123b68]"
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-[10px] text-slate-400">
        {subtitle}
      </p>

    </div>
  );
}


/* ================= TABLE HEAD ================= */

function TableHead({ text }: { text: string }) {
  return (
    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-500">
      {text}
    </th>
  );
}


/* ================= PRIORITY BADGE ================= */

function PriorityBadge({
  priority,
}: {
  priority: "High" | "Medium" | "Low";
}) {
  const classes = {
    High: "bg-[#fff0f2] text-rose-600",
    Medium: "bg-[#fff6e7] text-amber-600",
    Low: "bg-[#eaf9ed] text-green-600",
  };

  return (
    <span
      className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${classes[priority]}`}
    >
      {priority}
    </span>
  );
}


/* ================= ACTION CARD ================= */

function ActionCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      className="rounded-xl border border-slate-200 bg-[#fafcff] p-4 text-left hover:bg-slate-50"
    >

      <div className="flex items-center gap-3">

        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf6ff] text-lg text-[#0755ad]">
          {icon}
        </span>

        <h4 className="text-xs font-bold text-slate-700">
          {title}
        </h4>

      </div>

      <p className="mt-3 text-[10px] leading-4 text-slate-500">
        {description}
      </p>

    </button>
  );
}
