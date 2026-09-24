"use client";

import { useEffect, useMemo, useState } from "react";
import {
  api,
  type District,
  type IndustryDemand,
  type Course,
  type Skill,
  type IndustrySector,
} from "@/lib/api";
import {
  Map,
  Filter,
  MapPin,
  Building2,
  Briefcase,
  AlertTriangle,
  Users2,
  BarChart3,
  Lightbulb,
  LineChart,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";

const DEMO_DISTRICTS: District[] = [
  { id: "pune", name: "Pune", code: "MH12", state_code: "MH" },
  { id: "mumbai", name: "Mumbai", code: "MH01", state_code: "MH" },
  { id: "nashik", name: "Nashik", code: "MH17", state_code: "MH" },
  { id: "nagpur", name: "Nagpur", code: "MH31", state_code: "MH" },
  { id: "kolhapur", name: "Kolhapur", code: "MH10", state_code: "MH" },
];

const DEMO_DISTRICT_DATA: Record<
  string,
  {
    industries: string[];
    roles: string[];
    skills: string[];
    capacity: string;
    gap: string;
    action: string;
  }
> = {
  pune: {
    industries: ["IT & Digital Services", "Advanced Manufacturing"],
    roles: ["Software Developer", "Data Analyst", "EV Technician"],
    skills: ["AI/ML", "Cloud Computing", "Advanced SQL"],
    capacity: "Illustrative demo value only",
    gap: "Illustrative demo value only",
    action: "Increase capacity for high-demand digital skills",
  },
  mumbai: {
    industries: ["Financial Services", "IT Services", "Logistics"],
    roles: ["Data Analyst", "Cloud Support Associate", "Cyber Security Analyst"],
    skills: ["Financial Analysis", "Cloud Security", "Risk Management"],
    capacity: "Illustrative demo value only",
    gap: "Illustrative demo value only",
    action: "Expand financial technology training programs",
  },
  nashik: {
    industries: ["Manufacturing", "Automotive", "EV"],
    roles: ["EV Technician", "CNC Operator", "Industrial Automation Technician"],
    skills: ["EV Systems", "CNC Programming", "Industrial Automation"],
    capacity: "Illustrative demo value only",
    gap: "Illustrative demo value only",
    action: "Develop EV manufacturing training capacity",
  },
  nagpur: {
    industries: ["Logistics", "Manufacturing", "IT Services"],
    roles: ["Data Analyst", "Cloud Support", "Automation Technician"],
    skills: ["Supply Chain Analytics", "Cloud Computing", "Automation"],
    capacity: "Illustrative demo value only",
    gap: "Illustrative demo value only",
    action: "Build logistics and automation training capacity",
  },
  kolhapur: {
    industries: ["Manufacturing", "Automotive", "Engineering"],
    roles: ["CNC Operator", "Electrical Technician", "Production Technician"],
    skills: ["Precision Manufacturing", "Electrical Systems", "Production Technology"],
    capacity: "Illustrative demo value only",
    gap: "Illustrative demo value only",
    action: "Strengthen precision manufacturing training",
  },
};

function CategoryButton({
  label,
  icon,
  isActive,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all ${
        isActive
          ? "border-[#123b68] bg-[#123b68]/10 text-[#123b68]"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {isActive && (
        <div className="absolute -right-1 -top-1 rounded-full bg-[#123b68] p-0.5 text-white">
          <ChevronRightIcon className="h-3 w-3" />
        </div>
      )}

      <div className={isActive ? "text-[#123b68]" : "text-slate-500"}>
        {icon}
      </div>

      <span className="text-center text-xs font-medium leading-tight">
        {label}
      </span>
    </button>
  );
}

function DemandList({
  title,
  items,
  empty,
}: {
  title: string;
  items: string[];
  empty?: string;
}) {
  return (
    <div className="border border-slate-200 bg-white p-5">
      <h3 className="font-semibold text-[#123b68]">{title}</h3>

      {items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="border-b border-slate-100 pb-2 text-sm text-slate-700 last:border-0"
            >
              • {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-600">
          {empty || "No records available."}
        </p>
      )}
    </div>
  );
}

export default function DistrictPlanningPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [sectors, setSectors] = useState<IndustrySector[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    null
  );

  const [districtDemand, setDistrictDemand] = useState<IndustryDemand[]>([]);
  const [districtCourses, setDistrictCourses] = useState<
    { course_title: string }[]
  >([]);

  const [districtLoading, setDistrictLoading] = useState(false);
  const [districtError, setDistrictError] = useState("");

  const [dataStatus, setDataStatus] = useState<
    "loading" | "ready" | "unavailable"
  >("loading");

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [districtRes, sectorRes, skillRes, courseRes] =
          await Promise.all([
            api.districts().catch(() => []),
            api.sectors().catch(() => []),
            api.skills().catch(() => ({ items: [], total: 0 })),
            api.courses().catch(() => ({ items: [], total: 0 })),
          ]);

        if (cancelled) return;

        setDistricts(
          districtRes.length > 0 ? districtRes : DEMO_DISTRICTS
        );
        setSectors(sectorRes);
        setSkills(skillRes.items ?? []);
        setCourses(courseRes.items ?? []);
        setDataStatus("ready");
      } catch (error) {
        if (cancelled) return;

        console.error("District planning API error:", error);

        if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
          setDistricts(DEMO_DISTRICTS);
          setDataStatus("ready");
        } else {
          setDistricts([]);
          setDataStatus("unavailable");
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedDistrict) {
      setDistrictDemand([]);
      setDistrictCourses([]);
      setDistrictError("");
      setDistrictLoading(false);
      return;
    }

    let cancelled = false;

    const loadDistrictData = async () => {
      setDistrictLoading(true);
      setDistrictError("");

      try {
        const [demand, covered] = await Promise.all([
          api.demandByDistrict(selectedDistrict),
          api.demandCourses(selectedDistrict).catch(() => []),
        ]);

        if (cancelled) return;

        setDistrictDemand(demand);
        setDistrictCourses(covered);
      } catch (error) {
        if (cancelled) return;

        console.error("District API error:", error);

        if (
          process.env.NEXT_PUBLIC_DEMO_MODE === "true" &&
          DEMO_DISTRICT_DATA[selectedDistrict]
        ) {
          setDistrictDemand([]);
          setDistrictCourses([]);
          setDistrictError("DEMO_MODE");
        } else {
          setDistrictDemand([]);
          setDistrictCourses([]);
          setDistrictError(
            error instanceof Error
              ? error.message
              : "District intelligence could not be loaded."
          );
        }
      } finally {
        if (!cancelled) {
          setDistrictLoading(false);
        }
      }
    };

    loadDistrictData();

    return () => {
      cancelled = true;
    };
  }, [selectedDistrict]);

  useEffect(() => {
    setSelectedCategory(null);
  }, [selectedDistrict]);

  const sectorById = useMemo(
    () => Object.fromEntries(sectors.map((sector) => [sector.id, sector.name])),
    [sectors]
  );

  const skillById = useMemo(
    () => Object.fromEntries(skills.map((skill) => [skill.id, skill.name])),
    [skills]
  );

  const districtById = useMemo(
    () =>
      Object.fromEntries(
        districts.map((district) => [district.id, district.name])
      ),
    [districts]
  );

  const selectedDistrictName = districtById[selectedDistrict];

  const activeDemand = selectedDistrict ? districtDemand : [];
  const activeDistrictCourses = selectedDistrict ? districtCourses : [];

  const priorityIndustries = Array.from(
    new Set(
      activeDemand
        .map((row) => sectorById[row.industry_sector_id])
        .filter(Boolean)
    )
  );

  const highDemandSkills = Array.from(
    new Set(
      activeDemand
        .map((row) => (row.skill_id ? skillById[row.skill_id] : ""))
        .filter(Boolean)
    )
  );

  const localCourses = selectedDistrict
    ? courses.filter((course) => course.district_id === selectedDistrict)
    : [];

  const roleRecordCount = new Set(
    activeDemand.map((row) => row.job_role_id).filter(Boolean)
  ).size;

  const publishedCoverage =
    localCourses.length || activeDistrictCourses.length;

  const capacityGapItems = selectedDistrict
    ? activeDemand.length && !publishedCoverage
      ? ["Demand is recorded without published course coverage for this district."]
      : activeDemand.length
        ? [
            "Use authorised district views to compare seats, trainers and equipment against recorded demand.",
          ]
        : ["Capacity-gap figures are shown in authorised district intelligence views."]
    : [];

  return (
    <main className="min-h-screen bg-[#f4f7fa] text-[#1b2838]">
      <div className="h-1 bg-[#c2410c]" />

     
<section
  id="planning"
  className="border-b border-slate-200 bg-white"
  aria-labelledby="district-heading"
>
  <div className="mx-auto max-w-7xl px-5 py-5 lg:py-6">
    <div className="pt-1">
      <p className="text-sm font-bold tracking-wide text-[#c2410c]">
        DISTRICT PLANNING
      </p>

      <h1
        id="district-heading"
        className="mt-2 font-serif text-3xl font-semibold text-[#123b68]"
      >
        Turn Statewide Intelligence into District Action
      </h1>
    </div>

    <p className="mt-3 max-w-3xl leading-7 text-slate-600">
      District-level demand guides course availability, training
      capacity and equipment planning.
    </p>

    <label
      htmlFor="district-select"
      className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-700"
    >
      <Map className="h-4 w-4 text-[#c2410c]" />
      Select a Maharashtra district
    </label>

    <select
      id="district-select"
      value={selectedDistrict}
      onChange={(event) => {
        const value = event.target.value;
        setSelectedDistrict(value);
        setDistrictLoading(Boolean(value));

        if (!value) {
          setDistrictDemand([]);
          setDistrictCourses([]);
          setDistrictError("");
        }
      }}
      className="mt-2 w-full max-w-md border border-slate-300 bg-white px-3 py-3"
    >
      <option value="">Choose district</option>

      {districts.map((district) => (
        <option key={district.id} value={district.id}>
          {district.name}
        </option>
      ))}
    </select>



          {districts.length === 0 && dataStatus !== "loading" ? (
            <p className="mt-3 text-sm text-slate-600">
              Live district intelligence is temporarily unavailable.
            </p>
          ) : null}

          {selectedDistrict && (
            <div className="mt-8 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#123b68]" />
                <span className="text-sm font-semibold text-slate-700">
                  Planning Dimensions
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
                <CategoryButton
                  label="District"
                  icon={<MapPin className="h-4 w-4" />}
                  isActive={selectedCategory === "district"}
                  onClick={() => setSelectedCategory("district")}
                />

                <CategoryButton
                  label="Priority Industries"
                  icon={<Building2 className="h-4 w-4" />}
                  isActive={selectedCategory === "priority_industries"}
                  onClick={() =>
                    setSelectedCategory("priority_industries")
                  }
                />

                <CategoryButton
                  label="High-Demand Roles"
                  icon={<Briefcase className="h-4 w-4" />}
                  isActive={selectedCategory === "high_demand_roles"}
                  onClick={() =>
                    setSelectedCategory("high_demand_roles")
                  }
                />

                <CategoryButton
                  label="Skill Gaps"
                  icon={<AlertTriangle className="h-4 w-4" />}
                  isActive={selectedCategory === "skill_gaps"}
                  onClick={() => setSelectedCategory("skill_gaps")}
                />

                <CategoryButton
                  label="Training Capacity"
                  icon={<Users2 className="h-4 w-4" />}
                  isActive={selectedCategory === "training_capacity"}
                  onClick={() =>
                    setSelectedCategory("training_capacity")
                  }
                />

                <CategoryButton
                  label="Capacity Gap"
                  icon={<BarChart3 className="h-4 w-4" />}
                  isActive={selectedCategory === "capacity_gap"}
                  onClick={() => setSelectedCategory("capacity_gap")}
                />

                <CategoryButton
                  label="Recommended Action"
                  icon={<Lightbulb className="h-4 w-4" />}
                  isActive={selectedCategory === "recommended_action"}
                  onClick={() =>
                    setSelectedCategory("recommended_action")
                  }
                />
              </div>
            </div>
          )}

          {selectedDistrict && !selectedCategory && (
            <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
              <Filter className="mx-auto mb-3 h-8 w-8 text-slate-400" />

              <p className="text-sm text-slate-600">
                Select a planning dimension above to view{" "}
                {selectedDistrictName}-specific insights.
              </p>
            </div>
          )}

          {selectedDistrict && selectedCategory && (
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {districtError === "DEMO_MODE" &&
              DEMO_DISTRICT_DATA[selectedDistrict] ? (
                <>
                  <div className="col-span-full mb-4 border border-slate-300 bg-[#fff7ed] p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#c2410c]">
                      Illustrative district intelligence (demo mode - API
                      unavailable)
                    </p>
                  </div>

                  {selectedCategory === "district" && (
                    <DemandList
                      title="District"
                      items={[selectedDistrictName || selectedDistrict]}
                    />
                  )}

                  {selectedCategory === "priority_industries" && (
                    <DemandList
                      title="Priority Industries"
                      items={DEMO_DISTRICT_DATA[selectedDistrict].industries}
                    />
                  )}

                  {selectedCategory === "high_demand_roles" && (
                    <DemandList
                      title="High-Demand Roles"
                      items={DEMO_DISTRICT_DATA[selectedDistrict].roles}
                    />
                  )}

                  {selectedCategory === "skill_gaps" && (
                    <DemandList
                      title="Skill Gaps"
                      items={DEMO_DISTRICT_DATA[selectedDistrict].skills}
                    />
                  )}

                  {selectedCategory === "training_capacity" && (
                    <DemandList
                      title="Existing Training Capacity"
                      items={[
                        DEMO_DISTRICT_DATA[selectedDistrict].capacity,
                      ]}
                    />
                  )}

                  {selectedCategory === "capacity_gap" && (
                    <DemandList
                      title="Capacity Gap"
                      items={[DEMO_DISTRICT_DATA[selectedDistrict].gap]}
                    />
                  )}

                  {selectedCategory === "recommended_action" && (
                    <DemandList
                      title="Recommended Training Action"
                      items={[DEMO_DISTRICT_DATA[selectedDistrict].action]}
                    />
                  )}
                </>
              ) : (
                <>
                  {selectedCategory === "district" && (
                    <DemandList
                      title="District"
                      items={[selectedDistrictName || selectedDistrict]}
                    />
                  )}

                  {selectedCategory === "priority_industries" && (
                    <DemandList
                      title="Priority Industries"
                      items={priorityIndustries}
                      empty="No industry demand records are currently published for this district."
                    />
                  )}

                  {selectedCategory === "high_demand_roles" && (
                    <DemandList
                      title="High-Demand Roles"
                      items={
                        roleRecordCount
                          ? [
                              `${roleRecordCount} job-role demand record${
                                roleRecordCount === 1 ? "" : "s"
                              } in current data`,
                            ]
                          : []
                      }
                      empty="No public role demand records are currently available for this district."
                    />
                  )}

                  {selectedCategory === "skill_gaps" && (
                    <DemandList
                      title="Skill Gaps"
                      items={highDemandSkills}
                      empty="No skill demand records with catalogue names are currently available for this district."
                    />
                  )}

                  {selectedCategory === "training_capacity" && (
                    <DemandList
                      title="Existing Training Capacity"
                      items={
                        localCourses.length
                          ? localCourses.map((course) => course.title)
                          : activeDistrictCourses.map(
                              (course) => course.course_title
                            )
                      }
                      empty="No course coverage records are currently published for this district."
                    />
                  )}

                  {selectedCategory === "capacity_gap" && (
                    <DemandList
                      title="Capacity Gap"
                      items={capacityGapItems}
                      empty="Select a district to view the qualitative capacity-gap note from published records."
                    />
                  )}

                  {selectedCategory === "recommended_action" && (
                    <DemandList
                      title="Recommended Training Action"
                      items={[
                        activeDemand.length && !publishedCoverage
                          ? "Review capacity: demand is recorded without published course coverage."
                          : activeDemand.length
                            ? "Review course alignment, trainer capability and equipment against recorded demand."
                            : "No public demand record is available yet; use authorised district plans after login.",
                      ]}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {districtLoading ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <LineChart
                className="h-4 w-4 animate-pulse"
                aria-hidden="true"
              />
              Loading district intelligence…
            </p>
          ) : null}

          {districtError && districtError !== "DEMO_MODE" ? (
            <p className="mt-4 text-sm text-red-800">{districtError}</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}