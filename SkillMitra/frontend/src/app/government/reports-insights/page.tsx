
"use client";

import { useState } from "react";

type ReportData = {
  district: string;
  sector: string;
  demand: number;
  available: number;
  gap: number;
  priority: "High" | "Medium" | "Low";
};

const reportData: ReportData[] = [
  {
    district: "Pune",
    sector: "Automotive",
    demand: 500,
    available: 150,
    gap: 350,
    priority: "High",
  },
  {
    district: "Mumbai",
    sector: "IT/ITES",
    demand: 180,
    available: 120,
    gap: 60,
    priority: "Medium",
  },
  {
    district: "Nashik",
    sector: "Manufacturing",
    demand: 300,
    available: 190,
    gap: 110,
    priority: "High",
  },
  {
    district: "Nagpur",
    sector: "Renewable Energy",
    demand: 220,
    available: 160,
    gap: 60,
    priority: "Medium",
  },
];

export default function ReportsInsightsPage() {
  const [district, setDistrict] = useState("All Districts");
  const [sector, setSector] = useState("All Sectors");

  const filteredData = reportData.filter((item) => {
    const districtMatch =
      district === "All Districts" || item.district === district;

    const sectorMatch =
      sector === "All Sectors" || item.sector === sector;

    return districtMatch && sectorMatch;
  });

  const totalDemand = filteredData.reduce(
    (sum, item) => sum + item.demand,
    0
  );

  const totalAvailable = filteredData.reduce(
    (sum, item) => sum + item.available,
    0
  );

  const totalGap = filteredData.reduce(
    (sum, item) => sum + item.gap,
    0
  );

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


          {/* Right Side */}
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
              className="rounded-lg border border-white/30 px-3 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              Logout
            </button>

          </div>

        </div>

      </header>


      {/* ================= ORANGE STRIP ================= */}
      <div className="fixed left-0 right-0 top-[78px] z-50 h-1 bg-[#c2410c]" />


      {/* ================= SIDEBAR ================= */}
      <aside className="fixed bottom-0 left-0 top-[82px] z-40 hidden w-[264px] overflow-y-auto border-r border-slate-200 bg-white lg:block">

        <div className="flex min-h-full flex-col">

          {/* SIDEBAR BRAND */}
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


          {/* NAVIGATION */}
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
              active
            />

            <SidebarItem
              icon="⚙"
              label="Settings"
              href="/government/settings"
            />

          </nav>


          {/* SIDEBAR BOTTOM */}
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
      <section className="min-h-screen bg-[#f4f7fa] pt-[82px] lg:ml-[264px]">

        <div className="mx-auto max-w-[1500px] p-4 lg:p-6">

          {/* PAGE HEADER */}
          <div className="mb-6">

            <p className="text-xs font-semibold uppercase tracking-wider text-[#0755ad]">
              Government • Reports & Intelligence
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[#123b68]">
              Reports & Insights
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Monitor workforce trends, skill gaps and district-wise
              employment intelligence for government planning.
            </p>

          </div>


          {/* FILTERS */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-4">

              <h3 className="text-sm font-bold text-[#123b68]">
                Report Filters
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Select district and sector to generate relevant insights.
              </p>

            </div>


            <div className="grid gap-4 md:grid-cols-2">

              <Filter
                label="District"
                value={district}
                setValue={setDistrict}
                options={[
                  "All Districts",
                  "Pune",
                  "Mumbai",
                  "Nashik",
                  "Nagpur",
                ]}
              />

              <Filter
                label="Sector"
                value={sector}
                setValue={setSector}
                options={[
                  "All Sectors",
                  "Automotive",
                  "IT/ITES",
                  "Manufacturing",
                  "Renewable Energy",
                ]}
              />

            </div>

          </div>


          {/* SUMMARY CARDS */}
          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

            <SummaryCard
              title="Total Workforce Demand"
              value={totalDemand.toLocaleString()}
              subtitle="Current requirement"
              icon="▤"
            />

            <SummaryCard
              title="Available Candidates"
              value={totalAvailable.toLocaleString()}
              subtitle="Existing workforce"
              icon="◉"
            />

            <SummaryCard
              title="Critical Skill Gap"
              value={totalGap.toLocaleString()}
              subtitle="Candidates required"
              icon="△"
              danger
            />

            <SummaryCard
              title="High Priority Districts"
              value="2"
              subtitle="Need immediate action"
              icon="!"
              warning
            />

          </div>


          {/* INSIGHT CARDS */}
          <div className="mb-6 grid gap-5 lg:grid-cols-2">

            {/* AI INSIGHT */}
            <div className="rounded-xl border border-[#d7eaf7] bg-white shadow-sm">

              <div className="border-b border-slate-100 bg-[#f8fbff] px-5 py-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef7ff] text-lg text-[#0755ad]">
                    ✦
                  </div>

                  <div>

                    <h3 className="text-sm font-bold text-[#123b68]">
                      AI Generated Insight
                    </h3>

                    <p className="text-[10px] text-slate-400">
                      SkillMitra Intelligence Engine
                    </p>

                  </div>

                </div>

              </div>

              <div className="p-5">

                <p className="text-sm font-semibold text-slate-700">
                  Automotive skills show the highest workforce shortage.
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Pune currently has the largest identified skill gap,
                  particularly for EV Technician roles. Government training
                  capacity should be increased in high-demand automotive
                  skills.
                </p>

                <div className="mt-4 rounded-lg bg-[#eef7ff] p-3">

                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#0755ad]">
                    Recommended Priority
                  </p>

                  <p className="mt-1 text-xs font-semibold text-[#123b68]">
                    Increase EV Technician training capacity in Pune.
                  </p>

                </div>

              </div>

            </div>


            {/* POLICY INSIGHT */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 bg-[#f8fbff] px-5 py-4">

                <h3 className="text-sm font-bold text-[#123b68]">
                  Government Planning Insight
                </h3>

                <p className="mt-1 text-[10px] text-slate-400">
                  Policy and training recommendations
                </p>

              </div>

              <div className="space-y-4 p-5">

                <InsightRow
                  number="01"
                  title="Prioritize High-Gap Districts"
                  text="Allocate additional training capacity to districts with critical skill shortages."
                />

                <InsightRow
                  number="02"
                  title="Align Training with Industry"
                  text="Increase programs that directly match current industry workforce demand."
                />

                <InsightRow
                  number="03"
                  title="Monitor Emerging Skills"
                  text="Track new job roles and changing workforce requirements regularly."
                />

              </div>

            </div>

          </div>


          {/* DISTRICT REPORT TABLE */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center">

              <div>

                <h3 className="text-sm font-bold text-[#123b68]">
                  District Workforce Report
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  District-wise demand, availability and skill gaps
                </p>

              </div>

              <button
                type="button"
                className="rounded-lg border border-[#0755ad] px-4 py-2 text-xs font-bold text-[#0755ad] hover:bg-[#e7f1fc]"
              >
                Generate Report
              </button>

            </div>


            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px] border-collapse text-left">

                <thead>

                  <tr className="border-b border-slate-200 bg-[#f8fafc]">

                    <TableHead text="District" />
                    <TableHead text="Sector" />
                    <TableHead text="Demand" />
                    <TableHead text="Available" />
                    <TableHead text="Skill Gap" />
                    <TableHead text="Priority" />

                  </tr>

                </thead>


                <tbody>

                  {filteredData.map((item) => (

                    <tr
                      key={item.district}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >

                      <td className="px-5 py-4 text-xs font-bold text-slate-700">
                        {item.district}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-600">
                        {item.sector}
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                        {item.demand}
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-green-600">
                        {item.available}
                      </td>

                      <td className="px-5 py-4 text-xs font-bold text-rose-600">
                        {item.gap}
                      </td>

                      <td className="px-5 py-4">

                        <PriorityBadge priority={item.priority} />

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            {filteredData.length === 0 && (

              <div className="p-10 text-center text-sm text-slate-500">
                No report data found for the selected filters.
              </div>

            )}

          </div>


          {/* KEY FINDINGS */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-5 py-4">

              <h3 className="text-sm font-bold text-[#123b68]">
                Key Findings
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Important observations from the current workforce data
              </p>

            </div>


            <div className="grid gap-4 p-5 md:grid-cols-3">

              <FindingCard
                title="Highest Demand"
                value="Automotive"
                text="Strong workforce demand identified in the automotive sector."
              />

              <FindingCard
                title="Largest Skill Gap"
                value="Pune"
                text="Pune has the highest identified workforce shortage."
                danger
              />

              <FindingCard
                title="Training Opportunity"
                value="EV Technician"
                text="Additional training capacity can address the current gap."
              />

            </div>

          </div>


          {/* GOVERNMENT ACTION */}
          <div className="rounded-xl border border-[#d7eaf7] bg-[#eef8ff] p-5">

            <div className="flex gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lg text-[#0755ad]">
                🏛
              </div>

              <div>

                <h3 className="text-sm font-bold text-[#123b68]">
                  Government Action Recommendation
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Use district-level skill gap reports to prioritize training
                  programs, allocate seats and coordinate government-approved
                  training providers with emerging industry requirements.
                </p>

              </div>

            </div>

          </div>


          {/* FOOTER STATUS */}
          <div className="mt-6 flex flex-col justify-between gap-2 border-t border-slate-200 pt-4 text-[10px] text-slate-400 sm:flex-row">

            <p>
              SkillMitra • Government Skill Intelligence Platform
            </p>

            <p>
              Data shown for planning and analysis purposes
            </p>

          </div>

        </div>

      </section>

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
    <a
      href={href}
      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
        active
          ? "bg-[#e7f1fc] text-[#0755ad] shadow-[inset_4px_0_0_#0755ad]"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      <span className="w-6 text-center text-lg">
        {icon}
      </span>

      {label}
    </a>
  );
}


/* ================= FILTER ================= */

function Filter({
  label,
  value,
  setValue,
  options,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  options: string[];
}) {
  return (
    <div>

      <label className="mb-2 block text-[11px] font-bold text-slate-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      >

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}

      </select>

    </div>
  );
}


/* ================= SUMMARY CARD ================= */

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  danger = false,
  warning = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  danger?: boolean;
  warning?: boolean;
}) {
  const bg = danger
    ? "bg-[#fff1f3]"
    : warning
    ? "bg-[#fff8e8]"
    : "bg-[#eef7ff]";

  const text = danger
    ? "text-rose-600"
    : warning
    ? "text-amber-600"
    : "text-[#0755ad]";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs font-medium text-slate-500">
            {title}
          </p>

          <p className={`mt-2 text-2xl font-bold ${text}`}>
            {value}
          </p>

          <p className="mt-1 text-[10px] text-slate-400">
            {subtitle}
          </p>

        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full ${bg} ${text}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}


/* ================= TABLE HEAD ================= */

function TableHead({ text }: { text: string }) {
  return (
    <th className="whitespace-nowrap px-5 py-3 text-[10px] font-bold text-slate-500">
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


/* ================= INSIGHT ROW ================= */

function InsightRow({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eef7ff] text-[10px] font-bold text-[#0755ad]">
        {number}
      </div>

      <div>

        <p className="text-xs font-bold text-[#123b68]">
          {title}
        </p>

        <p className="mt-1 text-[11px] leading-5 text-slate-500">
          {text}
        </p>

      </div>

    </div>
  );
}


/* ================= FINDING CARD ================= */

function FindingCard({
  title,
  value,
  text,
  danger = false,
}: {
  title: string;
  value: string;
  text: string;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        danger
          ? "border-rose-100 bg-[#fff8f9]"
          : "border-slate-200 bg-[#fafcff]"
      }`}
    >

      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p
        className={`mt-2 text-lg font-bold ${
          danger ? "text-rose-600" : "text-[#123b68]"
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-[11px] leading-5 text-slate-500">
        {text}
      </p>

    </div>
  );
}

