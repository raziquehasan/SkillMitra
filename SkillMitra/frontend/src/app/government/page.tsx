
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type TrainingRow = {
  program: string;
  sector: string;
  district: string;
  required: number;
  existing: number;
  additional: number;
  status: "Required" | "Available" | "Partially Filled";
};

const trainingRows: TrainingRow[] = [
  {
    program: "EV Technician",
    sector: "Automotive",
    district: "Pune",
    required: 350,
    existing: 100,
    additional: 250,
    status: "Required",
  },
  {
    program: "CNC Operator",
    sector: "Manufacturing",
    district: "Pune",
    required: 180,
    existing: 180,
    additional: 0,
    status: "Available",
  },
  {
    program: "Solar Technician",
    sector: "Renewable Energy",
    district: "Pune",
    required: 120,
    existing: 80,
    additional: 40,
    status: "Partially Filled",
  },
  {
    program: "Data Analyst",
    sector: "IT/ITES",
    district: "Pune",
    required: 100,
    existing: 50,
    additional: 50,
    status: "Required",
  },
];

export default function GovernmentDashboard() {
  const pathname = usePathname();
   const router = useRouter();

  const [district, setDistrict] = useState("Pune");
  const [sector, setSector] = useState("Automotive");
  const [skill, setSkill] = useState("EV Technician");
  const [timeline, setTimeline] = useState("Next 6 Months");
  const [trainingStatus, setTrainingStatus] =
    useState("Training Required");

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-slate-800">

      {/* ================= TOP BAR ================= */}

     
      
<header className="fixed left-0 right-0 top-0 z-50 h-[78px] border-b border-[#0d2f54] bg-[#123b68] text-white">
  <div className="flex h-[78px] items-center justify-between px-5 lg:px-8">

    {/* Government Branding */}
    <div className="flex items-center gap-3">

      <div className="relative h-12 w-12 shrink-0">
        <img
          src="/government-logo.png"
          alt="Government of Maharashtra"
          className="h-full w-full object-contain"
        />
      </div>

      <div>
        <p className="text-sm font-semibold text-white">
          Government of Maharashtra
        </p>

        <p className="text-[11px] text-white/80">
          Skills, Employment, Entrepreneurship & Innovation Department
        </p>
      </div>

    </div>

    

    {/* Right Side */}
    <div className="flex items-center gap-4">

      <div className="hidden text-right sm:block">
        <p className="text-sm font-semibold text-white">
          Government Official
        </p>

        <p className="text-[11px] text-white/70">
          Govt. Officer
        </p>
      </div>

      <button
        onClick={() => router.push("/login")}
        className="rounded-md border border-white/30 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
      >
        Logout
      </button>

    </div>

  </div>
</header>

{/* Orange Government Line */}
<div className="fixed left-0 right-0 top-[78px] z-50 h-1 bg-[#c2410c]" />



      

      <div className="flex min-h-screen">

        {/* ================= SIDEBAR ================= */}

        <aside className="fixed bottom-0 left-0 top-[82px] z-40 hidden w-[264px] overflow-y-auto border-r border-slate-200 bg-white lg:block">

          <div className="flex min-h-full flex-col">

            {/* SIDEBAR BRAND */}

            <div className="border-b border-slate-100 px-4 py-4">

              <div className="flex items-center gap-3">

                <img
                  src="/skillmitra-logo.png"
                  alt="SkillMitra"
                  className="h-9 w-auto object-contain"
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

            {/* NAVIGATION */}

            <nav className="flex-1 space-y-1 px-3 py-4">

              <SidebarItem
                icon="⌂"
                label="Dashboard"
                href="/government"
                active={pathname === "/government"}
              />

              <SidebarItem
                icon="▣"
                label="Industry Requirements"
                href="/government/industry-requirements"
                active={pathname === "/government/industry-requirements"}
              />

              <SidebarItem
                icon="✓"
                label="Training Planning"
                href="/government/training-planning"
                active={pathname === "/government/training-planning"}
              />

              <SidebarItem
                icon="▥"
                label="District Analysis"
                href="/government/district-analysis"
                active={pathname === "/government/district-analysis"}
              />

              <SidebarItem
                icon="▤"
                label="Reports & Insights"
                href="/government/reports"
                active={pathname === "/government/reports"}
              />

              <SidebarItem
                icon="⚙"
                label="Settings"
                href="/government/settings"
                active={pathname === "/government/settings"}
              />

            </nav>

            {/* SIDEBAR BOTTOM */}

            <div className="border-t border-slate-100 p-5">

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

        {/* ================= MAIN ================= */}

        <section className="min-w-0 flex-1 pt-[82px] lg:ml-[264px]">

          <div className="mx-auto max-w-[1500px] p-4 lg:p-6">

            {/* PAGE TITLE */}

            <div className="mb-5">

              <h2 className="text-2xl font-bold text-[#123b68]">
                Government Dashboard
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Labour market intelligence, skill gap analysis and training
                planning
              </p>

            </div>

            {/* ================= FILTER BAR ================= */}

            <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">

                <FilterBox
                  label="District"
                  value={district}
                  onChange={setDistrict}
                  options={[
                    "Pune",
                    "Mumbai",
                    "Nashik",
                    "Nagpur",
                    "Aurangabad",
                  ]}
                  icon="⌖"
                />

                <FilterBox
                  label="Sector"
                  value={sector}
                  onChange={setSector}
                  options={[
                    "Automotive",
                    "Manufacturing",
                    "Renewable Energy",
                    "IT/ITES",
                    "Healthcare",
                  ]}
                  icon="▣"
                />

                <FilterBox
                  label="Skill / Job Role"
                  value={skill}
                  onChange={setSkill}
                  options={[
                    "EV Technician",
                    "CNC Operator",
                    "Solar Technician",
                    "Data Analyst",
                  ]}
                  icon="⚙"
                />

                <FilterBox
                  label="Timeline"
                  value={timeline}
                  onChange={setTimeline}
                  options={[
                    "Next 3 Months",
                    "Next 6 Months",
                    "Next 12 Months",
                  ]}
                  icon="▣"
                />

                <FilterBox
                  label="Training Status"
                  value={trainingStatus}
                  onChange={setTrainingStatus}
                  options={[
                    "Training Required",
                    "Available",
                    "Partially Filled",
                  ]}
                  icon="◇"
                />

              </div>

            </div>

            {/* ================= TOP CARDS ================= */}

            <div className="grid gap-5 xl:grid-cols-12">

              {/* INDUSTRY REQUIREMENT */}

              <div className="rounded-xl border border-[#d7eaf7] bg-white shadow-sm xl:col-span-5">

                <CardHeader
                  number="1."
                  title="Industry Requirement Received"
                  icon="▣"
                />

                <div className="p-4">

                  <div className="grid grid-cols-2 gap-3">

                    <InfoBox
                      icon="▦"
                      title="Industry"
                      value="Tata Motors (Pune)"
                      subtitle="Automotive Sector"
                    />

                    <InfoBox
                      icon="▣"
                      title="Required By"
                      value="Next 6 Months"
                      subtitle="Planning timeline"
                    />

                    <InfoBox
                      icon="●"
                      title="Required Role / Skill"
                      value="EV Technician"
                      subtitle="Electric Vehicle"
                    />

                    <InfoBox
                      icon="✓"
                      title="Required Skills"
                      value="Battery Diagnostics"
                      subtitle="EV Maintenance"
                    />

                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">

                    <MetricBox
                      title="Demand"
                      value="500"
                      type="blue"
                    />

                    <MetricBox
                      title="Future Demand"
                      value="750"
                      type="purple"
                    />

                    <MetricBox
                      title="Required Manpower"
                      value="500"
                      type="green"
                    />

                  </div>

                </div>
              </div>

              {/* AI SKILL GAP */}

              <div className="rounded-xl border border-[#e4ddf7] bg-white shadow-sm xl:col-span-4">

                <CardHeader
                  number="2."
                  title="AI Skill Gap Analysis"
                  icon="✦"
                  purple
                />

                <div className="p-4">

                  <div className="flex items-center gap-5">

                    <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-[12px] border-[#f7dce5]">

                      <div className="text-center">

                        <p className="text-xs text-slate-500">
                          Skill Gap
                        </p>

                        <p className="text-3xl font-bold text-[#c92f55]">
                          350
                        </p>

                      </div>

                    </div>

                    <div className="min-w-0 flex-1">

                      <MiniStat
                        icon="▥"
                        label="Industry Demand"
                        value="500"
                        iconClass="text-blue-600"
                      />

                      <MiniStat
                        icon="●"
                        label="Available Skilled Candidates"
                        value="150"
                        iconClass="text-green-600"
                      />

                      <MiniStat
                        icon="●"
                        label="Skill Gap"
                        value="350"
                        iconClass="text-rose-600"
                      />

                    </div>

                  </div>

                  <div className="mt-4 rounded-lg bg-[#fff2f4] p-3">

                    <div className="flex gap-2">

                      <span className="text-lg text-rose-600">
                        ↗
                      </span>

                      <div>

                        <p className="text-sm font-bold text-rose-700">
                          Demand Trend
                          <span className="ml-2 font-medium">
                            Increasing
                          </span>
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-600">
                          AI analysis shows high demand for EV Technician
                          in Pune with a significant skill gap.
                        </p>

                      </div>

                    </div>

                  </div>

                </div>
              </div>

              {/* AI RECOMMENDATION */}

              <div className="rounded-xl border border-[#e3ddfa] bg-white shadow-sm xl:col-span-3">

                <div className="flex items-center justify-between border-b border-slate-100 bg-[#f5f2ff] px-4 py-3">

                  <div className="flex items-center gap-2">

                    <span className="text-xl text-purple-700">
                      ✦
                    </span>

                    <h3 className="text-sm font-bold text-[#43308c]">
                      AI Recommendation
                    </h3>

                  </div>

                  <span className="rounded-full bg-purple-100 px-2 py-1 text-[9px] font-semibold text-purple-700">
                    ✦ Powered by AI
                  </span>

                </div>

                <div className="p-4">

                  <p className="text-xs leading-5 text-slate-600">
                    Based on industry demand and current availability,
                    AI recommends the following training program:
                  </p>

                  <div className="mt-3 rounded-lg border border-purple-100 bg-[#faf9ff] p-3">

                    <div className="flex gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                        👥
                      </div>

                      <div>

                        <p className="text-sm font-bold text-[#43308c]">
                          EV Technician Training Program
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Target District: Pune
                        </p>

                      </div>

                    </div>

                    <RecommendationRow
                      label="Additional Candidates to Train"
                      value="350"
                    />

                    <RecommendationRow
                      label="Skills to Cover"
                      value="Battery Diagnostics, EV Maintenance"
                    />

                    <RecommendationRow
                      label="Recommended Capacity"
                      value="350 Seats"
                    />

                  </div>

                  <button className="mt-3 w-full rounded-lg bg-[#5145d8] px-4 py-3 text-xs font-bold text-white hover:bg-[#4338ca]">
                    View Detailed Recommendation →
                  </button>

                </div>

              </div>

            </div>

            {/* ================= TRAINING ACTIONS ================= */}

            <div className="mt-5 grid gap-5 xl:grid-cols-12">

              {/* TRAINING TABLE */}

              <div className="rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-8">

                <CardHeader
                  number="3."
                  title="Recommended Training Actions"
                  icon="▣"
                />

                <div className="overflow-x-auto p-3">

                  <table className="w-full min-w-[850px] border-collapse text-left">

                    <thead>

                      <tr className="border-b border-slate-200 bg-[#f8fafc]">

                        <TableHead text="Training Program" />
                        <TableHead text="Sector" />
                        <TableHead text="District" />
                        <TableHead text="Total Seats (Required)" />
                        <TableHead text="Existing Seats" />
                        <TableHead text="Additional Seats Required" />
                        <TableHead text="Status" />
                        <TableHead text="Action" />

                      </tr>

                    </thead>

                    <tbody>

                      {trainingRows.map((row) => (

                        <tr
                          key={row.program}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                        >

                          <td className="px-3 py-4 text-xs font-semibold text-slate-700">
                            {row.program}
                          </td>

                          <td className="px-3 py-4 text-xs text-slate-600">
                            {row.sector}
                          </td>

                          <td className="px-3 py-4 text-xs text-slate-600">
                            {row.district}
                          </td>

                          <td className="px-3 py-4 text-xs text-slate-600">
                            {row.required}
                          </td>

                          <td className="px-3 py-4 text-xs text-slate-600">
                            {row.existing}
                          </td>

                          <td className="px-3 py-4 text-xs font-semibold text-rose-600">
                            {row.additional}
                          </td>

                          <td className="px-3 py-4">
                            <StatusBadge status={row.status} />
                          </td>

                          <td className="px-3 py-4">

                            <button
                              className={`rounded-md px-3 py-2 text-[11px] font-bold ${
                                row.additional > 0
                                  ? "bg-[#0755ad] text-white hover:bg-[#064994]"
                                  : "border border-[#0755ad] bg-white text-[#0755ad]"
                              }`}
                            >
                              {row.additional > 0
                                ? "Allocate Seats"
                                : "View Details"}
                            </button>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                  <button className="mt-3 px-2 text-xs font-semibold text-[#0755ad] hover:underline">
                    View All Training Programs →
                  </button>

                </div>

              </div>

              {/* GOVERNMENT ACTION */}

              <div className="rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-4">

                <CardHeader
                  number="4."
                  title="Government Action Panel"
                  icon="🏛"
                />

                <div className="p-2">

                  <ActionItem
                    icon="♧"
                    title="Create New Training Program"
                    description="Launch a new program based on AI recommendation"
                  />

                  <ActionItem
                    icon="▣"
                    title="Increase Training Seats"
                    description="Allocate additional seats for existing programs"
                  />

                  <ActionItem
                    icon="♟"
                    title="Assign Training Provider"
                    description="Select and assign certified training partners"
                  />

                  <ActionItem
                    icon="◷"
                    title="Track Progress"
                    description="Monitor enrollment, completion and placement"
                  />

                </div>

              </div>

            </div>

            {/* ================= BOTTOM ================= */}

            <div className="mt-5 grid gap-5 xl:grid-cols-12">

              {/* TRAINING IMPACT */}

              <div className="rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-8">

                <CardHeader
                  number="5."
                  title="Training Impact"
                  icon="◎"
                />

                <div className="p-5">

                  <div className="grid items-center gap-3 md:grid-cols-7">

                    <ImpactBox
                      icon="▣"
                      title="Industry Demand"
                      value="500 candidates"
                      subtitle="EV Technician"
                    />

                    <Arrow />

                    <ImpactBox
                      icon="🎓"
                      title="Training Provided"
                      value="350 seats"
                      subtitle="EV Technician"
                      green
                    />

                    <Arrow />

                    <ImpactBox
                      icon="♟"
                      title="Candidates Trained"
                      value="210 enrolled"
                      subtitle="In Progress"
                      purple
                    />

                    <Arrow />

                    <ImpactBox
                      icon="▣"
                      title="Employment"
                      value="Expected 80+"
                      subtitle="placements"
                      blue
                    />

                  </div>

                </div>

              </div>

              {/* QUICK SUMMARY */}

              <div className="rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-4">

                <div className="border-b border-slate-100 bg-[#eef8ff] px-4 py-3">

                  <h3 className="text-sm font-bold text-[#123b68]">
                    ▥ Quick Summary
                    <span className="ml-1 text-xs font-medium text-slate-500">
                      ({district} - {skill})
                    </span>
                  </h3>

                </div>

                <div className="grid grid-cols-4 divide-x divide-slate-100 p-4">

                  <SummaryMetric
                    title="Total Demand"
                    value="500"
                  />

                  <SummaryMetric
                    title="Skill Gap"
                    value="350"
                    danger
                  />

                  <SummaryMetric
                    title="Training Seats"
                    value="350"
                  />

                  <SummaryMetric
                    title="Expected Employment"
                    value="80+"
                  />

                </div>

                <div className="mx-4 mb-4 flex items-center gap-2 rounded-lg bg-[#effaf1] p-3">

                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                    ✓
                  </span>

                  <p className="text-xs font-semibold text-green-700">
                    AI + Government Action = Reduced Skill Mismatch
                  </p>

                </div>

              </div>

            </div>

            {/* FOOTER STATUS */}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">

              <p className="text-xs text-slate-500">
                SkillMitra Government Dashboard • Data updated for current planning cycle
              </p>

              <p className="text-xs text-slate-400">
                Government of Maharashtra
              </p>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}


/* =========================================================
   SIDEBAR ITEM
========================================================= */

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
      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
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


/* =========================================================
   FILTER BOX
========================================================= */

function FilterBox({
  label,
  value,
  onChange,
  options,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  icon: string;
}) {
  return (
    <div>

      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </label>

      <div className="relative">

        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
          {icon}
        </span>

        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-8 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-[#0755ad] focus:ring-2 focus:ring-blue-100"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
          ▼
        </span>

      </div>

    </div>
  );
}


/* =========================================================
   CARD HEADER
========================================================= */

function CardHeader({
  number,
  title,
  icon,
  purple = false,
}: {
  number: string;
  title: string;
  icon: string;
  purple?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 border-b px-4 py-3 ${
        purple
          ? "border-purple-100 bg-[#f8f6ff]"
          : "border-slate-100 bg-white"
      }`}
    >

      <span
        className={`text-lg ${
          purple ? "text-purple-700" : "text-[#0755ad]"
        }`}
      >
        {icon}
      </span>

      <span
        className={`text-[10px] font-bold ${
          purple ? "text-purple-700" : "text-slate-400"
        }`}
      >
        {number}
      </span>

      <h3 className="text-sm font-bold text-slate-700">
        {title}
      </h3>

    </div>
  );
}


/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-[#fafcff] p-3">

      <div className="flex items-center gap-2">

        <span className="text-base text-[#0755ad]">
          {icon}
        </span>

        <p className="text-[10px] font-semibold text-slate-500">
          {title}
        </p>

      </div>

      <p className="mt-2 text-xs font-bold text-slate-700">
        {value}
      </p>

      <p className="mt-1 text-[9px] text-slate-400">
        {subtitle}
      </p>

    </div>
  );
}


/* =========================================================
   METRIC BOX
========================================================= */

function MetricBox({
  title,
  value,
  type,
}: {
  title: string;
  value: string;
  type: "blue" | "purple" | "green";
}) {
  const classes = {
    blue: "bg-[#edf7ff] text-[#0755ad]",
    purple: "bg-[#f5f0ff] text-purple-800",
    green: "bg-[#eefaf1] text-green-700",
  };

  return (
    <div className={`rounded-lg p-3 ${classes[type]}`}>

      <p className="text-[10px] font-medium">
        {title}
      </p>

      <p className="mt-1 text-xl font-bold">
        {value}
      </p>

    </div>
  );
}


/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  icon,
  label,
  value,
  iconClass,
}: {
  icon: string;
  label: string;
  value: string;
  iconClass: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">

      <div className="flex min-w-0 items-center gap-2">

        <span className={`text-lg ${iconClass}`}>
          {icon}
        </span>

        <p className="text-[11px] leading-4 text-slate-600">
          {label}
        </p>

      </div>

      <p className={`ml-2 text-lg font-bold ${iconClass}`}>
        {value}
      </p>

    </div>
  );
}


/* =========================================================
   RECOMMENDATION ROW
========================================================= */

function RecommendationRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-t border-purple-100 py-3">

      <p className="text-[10px] font-medium text-slate-600">
        {label}
      </p>

      <p className="max-w-[150px] text-right text-[10px] font-bold text-slate-700">
        {value}
      </p>

    </div>
  );
}


/* =========================================================
   TABLE HEAD
========================================================= */

function TableHead({
  text,
}: {
  text: string;
}) {
  return (
    <th className="px-3 py-3 text-[10px] font-bold text-slate-500">
      {text}
    </th>
  );
}


/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: "Required" | "Available" | "Partially Filled";
}) {
  const classes = {
    Required: "bg-[#fff0f2] text-rose-600",
    Available: "bg-[#eaf9ed] text-green-600",
    "Partially Filled": "bg-[#fff6e7] text-amber-600",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-bold ${classes[status]}`}
    >
      {status}
    </span>
  );
}


/* =========================================================
   ACTION ITEM
========================================================= */

function ActionItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <button className="flex w-full items-center gap-3 border-b border-slate-100 p-4 text-left transition last:border-0 hover:bg-slate-50">

      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf6ff] text-lg text-[#0755ad]">
        {icon}
      </span>

      <span className="min-w-0 flex-1">

        <span className="block text-xs font-bold text-slate-700">
          {title}
        </span>

        <span className="mt-1 block text-[10px] leading-4 text-slate-500">
          {description}
        </span>

      </span>

      <span className="text-lg text-slate-400">
        ›
      </span>

    </button>
  );
}


/* =========================================================
   IMPACT BOX
========================================================= */

function ImpactBox({
  icon,
  title,
  value,
  subtitle,
  green = false,
  purple = false,
  blue = false,
}: {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
  green?: boolean;
  purple?: boolean;
  blue?: boolean;
}) {
  const bg = green
    ? "bg-[#effaf1]"
    : purple
      ? "bg-[#f5f1ff]"
      : blue
        ? "bg-[#edf7ff]"
        : "bg-[#f1f8ff]";

  return (
    <div className={`rounded-xl p-4 ${bg}`}>

      <div className="flex items-center gap-2">

        <span className="text-xl">
          {icon}
        </span>

        <p className="text-[10px] font-bold text-slate-600">
          {title}
        </p>

      </div>

      <p className="mt-3 text-sm font-bold text-slate-700">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-slate-500">
        {subtitle}
      </p>

    </div>
  );
}


/* =========================================================
   ARROW
========================================================= */

function Arrow() {
  return (
    <div className="hidden items-center justify-center text-2xl text-slate-400 md:flex">
      →
    </div>
  );
}


/* =========================================================
   SUMMARY METRIC
========================================================= */

function SummaryMetric({
  title,
  value,
  danger = false,
}: {
  title: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="px-2 text-center">

      <p className="text-[9px] leading-3 text-slate-500">
        {title}
      </p>

      <p
        className={`mt-2 text-lg font-bold ${
          danger
            ? "text-rose-500"
            : "text-[#123b68]"
        }`}
      >
        {value}
      </p>

    </div>
  );
}

