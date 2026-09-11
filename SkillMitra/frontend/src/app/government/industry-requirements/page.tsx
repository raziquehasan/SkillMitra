"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

type Requirement = {
  industry: string | null;
  sector: string | null;
  district: string | null;
  skill: string | null;
  required: number;
  available: number;
  gap: number;
  timeline: string | null;
  priority: "High" | "Medium" | "Low";
};

export default function IndustryRequirementsPage() {
  const [district, setDistrict] = useState("All Districts");
  const [sector, setSector] = useState("All Sectors");
  const [priority, setPriority] = useState("All Priorities");
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch industry demand data from backend
        const data = await api.demandIndustries();
        
        // Transform to requirements format
        const transformed: Requirement[] = data.map((item: any) => ({
          industry: null, // No company-specific data available
          sector: item.industry_sector_id || null,
          district: item.district_id || null,
          skill: item.skill_id || null,
          required: Math.round(item.aggregate_demand_score || 0),
          available: 0, // Not available in current schema
          gap: Math.round(item.aggregate_demand_score || 0),
          timeline: null,
          priority: "Medium" as const,
        }));
        
        setRequirements(transformed);
      } catch (err) {
        console.error("Failed to load industry requirements:", err);
        setError("Unable to load industry requirements data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredRequirements = requirements.filter((item) => {
    const districtMatch =
      district === "All Districts" || item.district === district;

    const sectorMatch =
      sector === "All Sectors" || item.sector === sector;

    const priorityMatch =
      priority === "All Priorities" || item.priority === priority;

    return districtMatch && sectorMatch && priorityMatch;
  });

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-slate-800">
      {/* TOP BAR */}
     
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



      {/* ORANGE STRIP */}
      <div className="fixed left-0 right-0 top-[78px] z-50 h-1 bg-[#c2410c]" />

      {/* SIDEBAR */}
      <aside className="fixed bottom-0 left-0 top-[82px] z-40 hidden w-[264px] overflow-y-auto border-r border-slate-200 bg-white lg:block">
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

        <nav className="space-y-1 px-3 py-4">
          <a
            href="/government"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <span className="w-6 text-center text-lg">⌂</span>
            Dashboard
          </a>

          <a
            href="/government/industry-requirements"
            className="flex w-full items-center gap-3 rounded-lg bg-[#e7f1fc] px-4 py-3 text-left text-sm font-medium text-[#0755ad] shadow-[inset_4px_0_0_#0755ad]"
          >
            <span className="w-6 text-center text-lg">▣</span>
            Industry Requirements
          </a>

          <a
            href="/government/training-planning"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <span className="w-6 text-center text-lg">✓</span>
            Training Planning
          </a>

          <a
            href="/government/district-analysis"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <span className="w-6 text-center text-lg">▥</span>
            District Analysis
          </a>

          <a
            href="/government/reports-insights"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <span className="w-6 text-center text-lg">▤</span>
            Reports & Insights
          </a>

          <a
            href="/government/settings"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <span className="w-6 text-center text-lg">⚙</span>
            Settings
          </a>
        </nav>

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
      </aside>

      {/* MAIN CONTENT */}
      <section className="min-h-screen pt-[82px] lg:ml-[264px]">
        <div className="mx-auto max-w-[1500px] p-4 lg:p-6">
          {/* PAGE HEADER */}
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0755ad]">
              Government • Industry Intelligence
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[#123b68]">
              Industry Requirements
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Monitor industry workforce demand, identify skill gaps and plan
              government skill development initiatives.
            </p>
          </div>

          {/* SUMMARY CARDS */}
          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Industries Tracked"
              value="24"
              subtitle="Across Maharashtra"
              icon="▣"
            />

            <SummaryCard
              title="Total Workforce Demand"
              value="8,450"
              subtitle="Current requirement"
              icon="♟"
            />

            <SummaryCard
              title="Critical Skill Gap"
              value="2,180"
              subtitle="Candidates required"
              icon="△"
              danger
            />

            <SummaryCard
              title="High Priority Requirements"
              value="12"
              subtitle="Immediate attention"
              icon="!"
              warning
            />
          </div>

          {/* FILTERS */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-[#123b68]">
                Filter Industry Requirements
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Select district, sector and priority to view relevant
                workforce requirements.
              </p>
            </div>

            {loading ? (
              <div className="p-4 text-center text-sm text-slate-500">
                Loading data...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-sm text-rose-600">
                {error}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                <Filter
                  label="District"
                  value={district}
                  setValue={setDistrict}
                  options={[
                    "All Districts",
                    "Pune",
                    "Mumbai",
                    "Nagpur",
                    "Nashik",
                  ]}
                />

                <Filter
                  label="Sector"
                  value={sector}
                  setValue={setSector}
                  options={[
                    "All Sectors",
                    "Automotive",
                    "Manufacturing",
                    "Renewable Energy",
                    "IT/ITES",
                  ]}
                />

                <Filter
                  label="Priority"
                  value={priority}
                  setValue={setPriority}
                  options={[
                    "All Priorities",
                    "High",
                    "Medium",
                    "Low",
                  ]}
                />
              </div>
            )}
          </div>

          {/* TABLE */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center">
              <div>
                <h3 className="text-sm font-bold text-[#123b68]">
                  Industry Workforce Requirements
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Industry-reported requirements for government planning
                </p>
              </div>

              <button
                type="button"
                className="rounded-lg bg-[#0755ad] px-4 py-2 text-xs font-bold text-white hover:bg-[#064994]"
              >
                + Add Requirement
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#f8fafc]">
                    <TableHead text="Industry" />
                    <TableHead text="Sector" />
                    <TableHead text="District" />
                    <TableHead text="Skill / Job Role" />
                    <TableHead text="Required" />
                    <TableHead text="Available" />
                    <TableHead text="Skill Gap" />
                    <TableHead text="Timeline" />
                    <TableHead text="Priority" />
                    <TableHead text="Action" />
                  </tr>
                </thead>

                <tbody>
                  {filteredRequirements.map((item) => (
                    <tr
                      key={`${item.industry}-${item.skill}`}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 text-xs font-bold text-slate-700">
                        {item.industry}
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-600">
                        {item.sector}
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-600">
                        {item.district}
                      </td>

                      <td className="px-4 py-4 text-xs font-semibold text-[#123b68]">
                        {item.skill}
                      </td>

                      <td className="px-4 py-4 text-xs font-semibold text-slate-700">
                        {item.required}
                      </td>

                      <td className="px-4 py-4 text-xs text-green-600">
                        {item.available}
                      </td>

                      <td className="px-4 py-4 text-xs font-bold text-rose-600">
                        {item.gap}
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-600">
                        {item.timeline}
                      </td>

                      <td className="px-4 py-4">
                        <PriorityBadge priority={item.priority} />
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          className="rounded-md border border-[#0755ad] px-3 py-2 text-[10px] font-bold text-[#0755ad] hover:bg-[#e7f1fc]"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRequirements.length === 0 && (
              <div className="p-10 text-center text-sm text-slate-500">
                No industry requirements found for the selected filters.
              </div>
            )}
          </div>

          {/* GOVERNMENT PLANNING NOTE */}
          <div className="mt-6 rounded-xl border border-[#d7eaf7] bg-[#eef8ff] p-5">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lg text-[#0755ad]">
                🏛
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#123b68]">
                  Government Planning Insight
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Industry requirements help the Government identify emerging
                  workforce needs, prioritize skill development programs,
                  allocate training seats and coordinate certified training
                  providers across districts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* SUMMARY CARD */
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

/* FILTER */
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

/* TABLE HEAD */
function TableHead({ text }: { text: string }) {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-[10px] font-bold text-slate-500">
      {text}
    </th>
  );
}

/* PRIORITY BADGE */
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